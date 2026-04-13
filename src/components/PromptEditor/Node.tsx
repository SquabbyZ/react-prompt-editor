import {
  DeleteOutlined,
  LockOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, message, Modal, Tooltip } from 'antd';
import React, { memo, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNodeEditor } from '../../hooks/useNodeEditor';
import type { Locale } from '../../i18n/locales/zh-CN';
import {
  OptimizeConfig,
  OptimizeRequest,
  OptimizeResponse,
  TaskNodeMinimal,
} from '../../types';
import { AIOptimizeModal } from '../AIOptimizeModal/AIOptimizeModal';
import { CodeMirrorEditor } from '../CodeMirrorEditor';
import { DependencyConfigSection } from './DependencyConfigSection';
import { EditableTitle } from './EditableTitle';
import { EditorToolbar } from './EditorToolbar';
import { NodeActions } from './NodeActions';
import { NodeStatusIndicator } from './NodeStatusIndicator';

interface CustomNodeProps {
  node: {
    data: TaskNodeMinimal;
    isInternal: boolean;
    level: number;
  };
  style: React.CSSProperties;
  dragHandle: React.RefObject<any> | null;
  onContentChange: (id: string, content: string) => void;
  onNodeRun: (id: string) => void;
  onNodeLock: (id: string) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onUpdateDependencies: (id: string, dependencies: string[]) => void;
  getNodeNumber: (id: string) => string;
  // 互斥展开：同时只能展开一个编辑器
  expandedEditorId: string | null;
  onToggleEditor: (nodeId: string) => void;
  // 子节点展开状态：可以多节点同时展开
  expandedNodes: Set<string>;
  onToggleChildren: (nodeId: string) => void;
  // 所有可用节点列表（用于依赖选择）
  availableNodes: Array<{
    id: string;
    title: string;
    number: string;
    hasRun: boolean;
    parentId?: string;
    children: string[];
  }>;
  // AI 优化配置（简化模式）
  optimizeConfig?: OptimizeConfig;
  // 是否在打开优化弹窗时自动开始优化
  autoOptimize?: boolean;
  // AI 优化请求回调（高级模式）
  onOptimizeRequest?: (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => void;
  // AI 优化完成回调
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  // 用户点击"应用"按钮回调
  onOptimizeApply?: (nodeId: string, optimizedContent: string) => void;
  // AI 优化点赞回调
  onLike?: (messageId: string) => void;
  // AI 优化点踩回调
  onDislike?: (messageId: string) => void;
  // 预览模式
  previewMode?: boolean;
  // 国际化配置
  locale?: Locale;
  // 主题模式
  theme?: 'system' | 'light' | 'dark';
}

export const Node: React.FC<CustomNodeProps> = memo(
  ({
    node,
    style,
    dragHandle,
    onContentChange,
    onNodeRun,
    onNodeLock,
    onDelete,
    onAddChild,
    onUpdateTitle,
    onUpdateDependencies,
    getNodeNumber,
    expandedEditorId,
    onToggleEditor,
    expandedNodes,
    onToggleChildren,
    availableNodes,
    optimizeConfig,
    onOptimizeRequest,
    onNodeOptimize,
    onOptimizeApply,
    onLike,
    onDislike,
    previewMode = false,
    locale,
    theme = 'system',
  }) => {
    // 国际化 Hook
    const { t } = useI18n(locale);
    const nodeData = node.data;
    // 判断是否是内部节点（有子节点）
    const isInternal = nodeData.children.length > 0;
    // 判断编辑器是否展开（互斥）
    const isEditorExpanded = expandedEditorId === nodeData.id;
    // 判断子节点是否展开
    const isChildrenExpanded = expandedNodes.has(nodeData.id);

    // 屏幕尺寸检测：小屏显示下拉菜单，大屏显示独立按钮
    // 使用 useEffect 在客户端检测，避免 SSR 问题
    const [isMobile, setIsMobile] = React.useState(false);
    const [availableWidth, setAvailableWidth] = React.useState(0);
    const headerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 640); // sm breakpoint = 640px
      };
      checkMobile(); // 初始检测
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 监听头部容器的可用宽度
    React.useEffect(() => {
      const headerElement = headerRef.current;
      if (!headerElement) return;

      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setAvailableWidth(entry.contentRect.width);
        }
      });

      resizeObserver.observe(headerElement);
      return () => resizeObserver.disconnect();
    }, []);

    // 根据可用宽度决定显示哪些按钮
    const showAllButtons = availableWidth > 650; // 宽度大于 650px 时显示所有按钮

    // AI 优化相关状态
    const [optimizeModalOpen, setOptimizeModalOpen] = React.useState(false);
    const [selectedContent, setSelectedContent] = React.useState<string>();
    const [selectedRange, setSelectedRange] = React.useState<{
      from: number;
      to: number;
    } | null>(null);
    // 存储优化请求，用于完成时调用 onNodeOptimize
    const optimizeRequestRef = React.useRef<OptimizeRequest | null>(null);

    // 编辑器展开动画状态
    const [isEditorAnimating, setIsEditorAnimating] = React.useState(false);
    const prevExpandedRef = React.useRef(isEditorExpanded);

    React.useEffect(() => {
      if (prevExpandedRef.current !== isEditorExpanded) {
        // 展开或收起时触发动画
        setIsEditorAnimating(true);
        const timer = setTimeout(() => setIsEditorAnimating(false), 300);
        prevExpandedRef.current = isEditorExpanded;
        return () => clearTimeout(timer);
      }
    }, [isEditorExpanded]);

    // 编辑器状态管理（Undo/Redo）
    const {
      editorRef,
      canUndo,
      canRedo,
      handleUndo,
      handleRedo,
      handleContentChange,
    } = useNodeEditor({
      nodeId: nodeData.id,
      initialContent: nodeData.content,
      onContentChange,
    });

    // 处理展开/折叠编辑器（互斥）
    const handleToggleEditor = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleEditor(nodeData.id);
      },
      [nodeData.id, onToggleEditor],
    );

    const handleDelete = useCallback(
      (e?: React.MouseEvent) => {
        e?.stopPropagation();
        onDelete(nodeData.id);
      },
      [nodeData.id, onDelete],
    );

    const handleLock = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onNodeLock(nodeData.id);
      },
      [nodeData.id, onNodeLock],
    );

    const handleAddChild = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        if (nodeData.isLocked) {
          message.warning(t('editor.lockedCannotAddChild'));
          return;
        }
        onAddChild(nodeData.id);
      },
      [nodeData.id, nodeData.isLocked, onAddChild, t],
    );

    const handleRun = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onNodeRun(nodeData.id);
      },
      [nodeData.id, onNodeRun],
    );

    const handleOptimize = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();

        // 获取选中的内容和范围
        const view = editorRef.current?.view;
        if (view) {
          const selection = view.state.selection.main;
          if (!selection.empty) {
            // 有选中内容，使用选中的部分
            setSelectedContent(
              view.state.doc.sliceString(selection.from, selection.to),
            );
            setSelectedRange({ from: selection.from, to: selection.to });
          } else {
            // 没有选中内容，默认选中全部
            const doc = view.state.doc;
            setSelectedContent(doc.toString());
            setSelectedRange({ from: 0, to: doc.length });
          }
        } else {
          // 如果无法获取 view，使用全部内容作为兜底
          setSelectedContent(nodeData.content);
          setSelectedRange({ from: 0, to: nodeData.content.length });
        }

        // 保存优化请求信息
        optimizeRequestRef.current = {
          content: nodeData.content,
          selectedText: selectedContent,
        };

        setOptimizeModalOpen(true);
      },
      [nodeData.content, selectedContent],
    );

    // 下拉菜单项
    const menuItems = [
      {
        key: 'addChild',
        label: t('editor.childTitle'),
        icon: <PlusOutlined />,
        disabled: nodeData.isLocked,
        onClick: (info: any) => {
          info.domEvent.stopPropagation();
          handleAddChild(info.domEvent);
        },
      },
      {
        key: 'lock',
        label: nodeData.isLocked ? t('editor.unlock') : t('editor.lock'),
        icon: nodeData.isLocked ? <UnlockOutlined /> : <LockOutlined />,
        disabled: !nodeData.hasRun,
        onClick: (info: any) => {
          info.domEvent.stopPropagation();
          handleLock(info.domEvent);
        },
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        label: t('editor.deleteNode'),
        icon: <DeleteOutlined />,
        danger: true,
        disabled: nodeData.isLocked,
        onClick: (info: any) => {
          info.domEvent.stopPropagation();
          Modal.confirm({
            title: t('editor.deleteNode'),
            content: t('editor.confirmDeleteNode'),
            okText: t('common.ok'),
            cancelText: t('common.cancel'),
            okButtonProps: { danger: true },
            onOk: () => handleDelete(),
          });
        },
      },
    ];

    return (
      <div
        className="prompt-editor-node arborist-node group mb-1"
        style={style}
        ref={dragHandle}
      >
        <div className="relative flex w-full flex-col transition-all">
          {/* 节点头部和编辑器容器 */}
          <div className="flex flex-col gap-2">
            {/* 节点头部 */}
            <div
              ref={headerRef}
              className="z-3 dark:!hover:border-indigo-500 relative flex items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-2 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {/* 三角按钮 - 只控制子节点展开/折叠 */}
                {isInternal ? (
                  <button
                    className="flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-gray-500 transition-all hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      // 点击三角：只切换子节点，不影响编辑器
                      onToggleChildren(nodeData.id);
                    }}
                    type="button"
                    title={
                      isChildrenExpanded
                        ? t('editor.collapseChildren')
                        : t('editor.expandChildren')
                    }
                  >
                    <span
                      className={`text-[10px] leading-none transition-transform ${isChildrenExpanded ? 'rotate-0' : '-rotate-90'}`}
                    >
                      {isChildrenExpanded ? '▼' : '▶'}
                    </span>
                  </button>
                ) : (
                  /* 没有子节点的占位符，保持对齐 */
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center" />
                )}

                {/* 节点序号和标题 */}
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <div className="min-w-0 flex-1">
                    <EditableTitle
                      nodeId={nodeData.id}
                      title={nodeData.title}
                      number={getNodeNumber(nodeData.id)}
                      isLocked={nodeData.isLocked}
                      content={nodeData.content}
                      onTitleChange={onUpdateTitle}
                      onContentChange={onContentChange}
                      previewMode={previewMode}
                      locale={locale}
                      onClick={() => {
                        // 预览模式下：点击标题展开/折叠编辑器
                        // 编辑模式下：只展开/折叠子节点
                        if (previewMode) {
                          onToggleEditor(nodeData.id);
                        } else if (isInternal) {
                          onToggleChildren(nodeData.id);
                        }
                      }}
                    />
                  </div>

                  {/* 状态指示器 - 统一处理不同状态 */}
                  {!previewMode && (
                    <NodeStatusIndicator
                      hasRun={nodeData.hasRun}
                      isLocked={nodeData.isLocked}
                      locale={locale}
                    />
                  )}
                </div>
              </div>

              {/* 操作按钮 - 预览模式下隐藏 */}
              {!previewMode && (
                <NodeActions
                  isEditorExpanded={isEditorExpanded}
                  nodeData={nodeData}
                  showAllButtons={showAllButtons}
                  isMobile={isMobile}
                  menuItems={menuItems}
                  handleToggleEditor={handleToggleEditor}
                  handleAddChild={handleAddChild}
                  handleLock={handleLock}
                  handleDelete={handleDelete}
                  locale={locale}
                />
              )}
            </div>

            {/* 编辑器区域 - 根据展开状态或预览模式决定显示 */}
            {isEditorExpanded && (
              <div
                className={`relative z-0 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:!border-gray-600 dark:!bg-gray-800 ${isEditorAnimating ? 'animate-expand-in' : ''}`}
                style={{
                  transformOrigin: 'top center',
                }}
              >
                {/* 编辑器工具栏 - 撤回/还原 - 预览模式下隐藏 */}
                {!previewMode && (
                  <EditorToolbar
                    canUndo={canUndo}
                    canRedo={canRedo}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    locale={locale}
                  />
                )}

                <div className="m-2 rounded-md bg-white p-3 dark:!bg-gray-900">
                  <CodeMirrorEditor
                    ref={editorRef}
                    value={nodeData.content}
                    onChange={handleContentChange}
                    isReadOnly={nodeData.isLocked || previewMode}
                    locale={locale}
                    theme={theme}
                  />
                </div>

                {/* 依赖任务配置区域 - 预览模式下隐藏 */}
                {!previewMode && (
                  <DependencyConfigSection
                    nodeId={nodeData.id}
                    dependencies={nodeData.dependencies}
                    onUpdateDependencies={onUpdateDependencies}
                    getNodeNumber={getNodeNumber}
                    availableNodes={availableNodes}
                    locale={locale}
                  />
                )}

                {/* 编辑器底部操作按钮 - 预览模式下隐藏 */}
                {!previewMode && (
                  <div className="flex items-center justify-end gap-2 border-t border-indigo-200 bg-white px-3 py-2 dark:border-indigo-800 dark:bg-gray-900">
                    <Tooltip title={t('editor.run')}>
                      <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleRun}
                        size="small"
                      />
                    </Tooltip>

                    <Tooltip title={t('editor.aiOptimize')}>
                      <Button
                        icon={<ThunderboltOutlined />}
                        onClick={handleOptimize}
                        size="small"
                      />
                    </Tooltip>
                  </div>
                )}

                {/* AI 优化弹窗 - 预览模式下不渲染 */}
                {!previewMode && optimizeModalOpen && (
                  <AIOptimizeModal
                    open={optimizeModalOpen}
                    onClose={() => {
                      setOptimizeModalOpen(false);
                      setSelectedContent(undefined);
                      setSelectedRange(null);
                      optimizeRequestRef.current = null;
                    }}
                    originalContent={nodeData.content}
                    selectedContent={selectedContent}
                    optimizeConfig={optimizeConfig}
                    onOptimizeRequest={onOptimizeRequest}
                    onApply={(optimizedContent: string) => {
                      // 如果有选中范围，替换选中部分
                      if (selectedRange) {
                        try {
                          // 使用字符串操作来确保正确替换
                          const currentContent = nodeData.content;
                          const before = currentContent.substring(
                            0,
                            selectedRange.from,
                          );
                          const after = currentContent.substring(
                            selectedRange.to,
                          );
                          const newContent = before + optimizedContent + after;

                          onContentChange(nodeData.id, newContent);
                        } catch (error) {
                          console.error('替换失败:', error);
                          message.error(t('aiOptimize.replaceFailed'));
                        }
                      } else {
                        // 没有选中内容，替换全部内容
                        onContentChange(nodeData.id, optimizedContent);
                        message.success(t('aiOptimize.replacedAllContent'));
                      }

                      // 调用优化完成回调
                      if (optimizeRequestRef.current) {
                        onNodeOptimize?.(nodeData.id, {
                          optimizedContent,
                          thinkingProcess: '优化完成',
                        });
                      }

                      // 调用应用回调
                      onOptimizeApply?.(nodeData.id, optimizedContent);

                      setOptimizeModalOpen(false);
                      setSelectedContent(undefined);
                      setSelectedRange(null);
                      optimizeRequestRef.current = null;
                    }}
                    onLike={onLike}
                    onDislike={onDislike}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Node.displayName = 'Node';
