import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, message, Popconfirm, Tag, Tooltip } from 'antd';
import React, { memo, useCallback } from 'react';
import { useNodeEditor } from '../../hooks/useNodeEditor';
import type { Locale } from '../../i18n/locales/zh-CN';
import {
  OptimizeRequest,
  OptimizeResponse,
  TaskNodeMinimal,
} from '../../types';
import { AIOptimizeModal } from '../AIOptimizeModal/AIOptimizeModal';
import { CodeMirrorEditor } from '../CodeMirrorEditor';
import { DependencyConfigSection } from './DependencyConfigSection';
import { EditableTitle } from './EditableTitle';
import { EditorToolbar } from './EditorToolbar';

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
  // AI 优化请求回调
  onOptimizeRequest?: (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => void;
  // AI 优化完成回调
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  // AI 优化点赞回调
  onLike?: (messageId: string) => void;
  // AI 优化点踩回调
  onDislike?: (messageId: string) => void;
  // 预览模式
  previewMode?: boolean;
  // 国际化配置
  locale?: Locale;
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
    onOptimizeRequest,
    onNodeOptimize,
    onLike,
    onDislike,
    previewMode = false,
    locale,
  }) => {
    const nodeData = node.data;
    // 判断是否是内部节点（有子节点）
    const isInternal = nodeData.children.length > 0;
    // 判断编辑器是否展开（互斥）
    const isEditorExpanded = expandedEditorId === nodeData.id;
    // 判断子节点是否展开
    const isChildrenExpanded = expandedNodes.has(nodeData.id);

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
          message.warning('节点已锁定，无法添加子节点');
          return;
        }
        onAddChild(nodeData.id);
      },
      [nodeData.id, nodeData.isLocked, onAddChild],
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
            <div className="relative z-10 flex flex-shrink-0 items-center justify-between gap-2 rounded-md bg-gray-50 px-3 py-2 transition-colors hover:bg-gray-100 dark:bg-gray-800/80 dark:hover:bg-gray-700/50">
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
                    title={isChildrenExpanded ? '折叠子节点' : '展开子节点'}
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
                <EditableTitle
                  nodeId={nodeData.id}
                  title={nodeData.title}
                  number={getNodeNumber(nodeData.id)}
                  isLocked={nodeData.isLocked}
                  content={nodeData.content}
                  onTitleChange={onUpdateTitle}
                  onContentChange={onContentChange}
                  previewMode={previewMode}
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

                {/* 状态图标 */}
                {nodeData.isLocked && (
                  <Tooltip title="已锁定">
                    <LockOutlined style={{ fontSize: 12, color: '#faad14' }} />
                  </Tooltip>
                )}
                {!nodeData.hasRun && !previewMode && (
                  <Tag color="default" title="未运行" style={{ fontSize: 10 }}>
                    未运行
                  </Tag>
                )}
              </div>

              {/* 操作按钮 - 预览模式下隐藏 */}
              {!previewMode && (
                <div className="relative z-20 flex flex-shrink-0 items-center gap-1.5">
                  {/* 编辑按钮 - 只控制编辑器展开/折叠 */}
                  <Tooltip
                    title={isEditorExpanded ? '折叠编辑器' : '展开编辑器'}
                  >
                    <Button
                      type={isEditorExpanded ? 'primary' : 'default'}
                      size="small"
                      icon={<EditOutlined />}
                      onClick={handleToggleEditor}
                      style={{
                        background: isEditorExpanded ? undefined : '#fff',
                      }}
                    >
                      <span className="hidden sm:inline">编辑提示词</span>
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      nodeData.isLocked
                        ? '节点已锁定，无法添加子节点'
                        : '添加子节点'
                    }
                  >
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleAddChild}
                      disabled={nodeData.isLocked}
                    >
                      <span className="hidden sm:inline">子标题</span>
                    </Button>
                  </Tooltip>
                  <Tooltip
                    title={
                      nodeData.hasRun
                        ? nodeData.isLocked
                          ? '解锁节点'
                          : '锁定节点'
                        : '请先运行'
                    }
                  >
                    <Button
                      size="small"
                      icon={
                        nodeData.isLocked ? (
                          <UnlockOutlined />
                        ) : (
                          <LockOutlined />
                        )
                      }
                      onClick={handleLock}
                      disabled={!nodeData.hasRun}
                    >
                      <span className="hidden sm:inline">
                        {nodeData.isLocked ? '解锁' : '锁定'}
                      </span>
                    </Button>
                  </Tooltip>

                  <Popconfirm
                    title="删除节点"
                    description="确定要删除这个节点吗？"
                    onConfirm={handleDelete}
                    onCancel={() => message.info('已取消删除')}
                    okText="确定"
                    cancelText="取消"
                    disabled={nodeData.isLocked}
                  >
                    <Tooltip
                      title={
                        nodeData.isLocked ? '节点已锁定，无法删除' : '删除节点'
                      }
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        disabled={nodeData.isLocked}
                      />
                    </Tooltip>
                  </Popconfirm>
                </div>
              )}
            </div>

            {/* 编辑器区域 - 根据展开状态或预览模式决定显示 */}
            {isEditorExpanded && (
              <div
                className={`relative z-0 overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-800 ${isEditorAnimating ? 'animate-expand-in' : ''}`}
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
                  />
                )}

                <div className="m-2 rounded-md bg-white p-3 dark:border-gray-700 dark:bg-gray-900">
                  <CodeMirrorEditor
                    ref={editorRef}
                    value={nodeData.content}
                    onChange={handleContentChange}
                    isReadOnly={nodeData.isLocked || previewMode}
                    locale={locale}
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
                  />
                )}

                {/* 编辑器底部操作按钮 - 预览模式下隐藏 */}
                {!previewMode && (
                  <div className="flex items-center justify-end gap-2 border-t border-indigo-200 bg-white px-3 py-2 dark:border-indigo-800 dark:bg-gray-900">
                    <Button
                      type="primary"
                      icon={<PlayCircleOutlined />}
                      onClick={handleRun}
                    >
                      运行
                    </Button>

                    <Button
                      icon={<ThunderboltOutlined />}
                      onClick={handleOptimize}
                    >
                      AI 优化
                    </Button>
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
                          message.success('已替换选中内容');
                        } catch (error) {
                          console.error('替换失败:', error);
                          message.error('替换失败，请重试');
                        }
                      } else {
                        // 没有选中内容，替换全部内容
                        onContentChange(nodeData.id, optimizedContent);
                        message.success('已替换全部内容');
                      }

                      // 调用优化完成回调
                      if (optimizeRequestRef.current) {
                        onNodeOptimize?.(nodeData.id, {
                          optimizedContent,
                          thinkingProcess: '优化完成',
                        });
                      }

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
