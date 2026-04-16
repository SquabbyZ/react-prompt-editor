import {
  Trash2,
  Lock,
  PlayCircle,
  Plus,
  Zap,
  Unlock,
} from 'lucide-react';
import { Button, message, Modal, Tooltip } from 'antd';
import React, { memo, useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useNodeEditor } from '../../hooks/useNodeEditor';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
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
  onHeightChange?: (id: string, height: number) => void;
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
  onOptimizeRequest?: (request: OptimizeRequest) => void;
  // AI 优化完成回调
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  // 用户点击"应用"按钮回调
  onOptimizeApply?: (nodeId: string, optimizedContent: string) => void;
  // 自定义 AI 优化内容区
  optimizeCustomContent?: React.ReactNode | null;
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
  // 是否支持拖拽排序
  draggable?: boolean;
  // 拖拽相关 props
  isDragging?: boolean;
  isDragOver?: boolean;
  dragPosition?: 'before' | 'after' | 'inside' | null;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export const Node: React.FC<CustomNodeProps> = memo(
  ({
    node,
    style,
    onContentChange,
    onNodeRun,
    onNodeLock,
    onDelete,
    onAddChild,
    onUpdateTitle,
    onUpdateDependencies,
    getNodeNumber,
    onHeightChange,
    expandedEditorId,
    onToggleEditor,
    expandedNodes,
    onToggleChildren,
    availableNodes,
    optimizeConfig,
    onOptimizeRequest,
    onNodeOptimize,
    onOptimizeApply,
    optimizeCustomContent = null,
    onLike,
    onDislike,
    previewMode = false,
    locale,
    theme = 'system',
    draggable = false,
    isDragging = false,
    isDragOver = false,
    dragPosition = null,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onDragEnd,
  }) => {
    // 国际化 Hook
    const { t } = useI18n(locale);
    const { isDarkMode } = useResolvedTheme(theme);
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
    const headerRef = React.useRef<HTMLDivElement | null>(null);
    const nodeRef = React.useRef<HTMLDivElement | null>(null);

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

    React.useEffect(() => {
      const nodeElement = nodeRef.current;
      if (!nodeElement || !onHeightChange) return;

      const reportHeight = () => {
        onHeightChange(nodeData.id, nodeElement.getBoundingClientRect().height);
      };

      reportHeight();

      const resizeObserver = new ResizeObserver(() => {
        reportHeight();
      });

      resizeObserver.observe(nodeElement);
      return () => resizeObserver.disconnect();
    }, [nodeData.id, onHeightChange, isEditorExpanded, isChildrenExpanded]);

    // 根据可用宽度决定显示哪些按钮
    const showAllButtons = availableWidth > 650; // 宽度大于 650px 时显示所有按钮
    const dragInsideClassName = isDarkMode
      ? 'border-indigo-500 bg-indigo-900/20'
      : 'border-indigo-500 bg-indigo-50';
    const headerClassName = isDarkMode
      ? 'prompt-editor-node-header relative z-3 flex items-center justify-between gap-2 rounded-md bg-[rgba(29,44,72,0.92)] px-3 py-2 text-[#e5edf9] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] transition-colors hover:bg-[rgba(35,52,84,0.96)]'
      : 'prompt-editor-node-header relative z-3 flex items-center justify-between gap-2 rounded-md bg-gray-100 px-3 py-2 text-gray-900 transition-colors hover:bg-gray-200';
    const caretButtonClassName = isDarkMode
      ? 'flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-slate-400 transition-all hover:bg-slate-800/80'
      : 'flex h-5 w-5 flex-shrink-0 cursor-pointer items-center justify-center rounded border-none bg-transparent text-gray-500 transition-all hover:bg-gray-100';
    const editorShellClassName = isDarkMode
      ? 'prompt-editor-editor-shell relative z-0 overflow-hidden border-0 border-b-4 border-double border-blue-500/10 bg-[rgba(8,20,40,0.96)] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]'
      : 'prompt-editor-editor-shell relative z-0 overflow-hidden border-0 border-b-4 border-double border-black bg-gray-100';
    const editorSurfaceClassName = isDarkMode
      ? 'prompt-editor-editor-surface m-2 rounded-md border border-blue-500/10 bg-[rgba(7,16,31,1)] p-3'
      : 'prompt-editor-editor-surface m-2 rounded-md border border-gray-200 bg-white p-3';
    const footerClassName = isDarkMode
      ? 'prompt-editor-editor-footer flex items-center justify-between gap-3 border-t border-indigo-900/40 bg-[rgba(7,16,31,1)] px-3 py-2'
      : 'prompt-editor-editor-footer flex items-center justify-between gap-3 border-t border-gray-200 bg-white px-3 py-2';
    const secondaryActionButtonClassName = isDarkMode
      ? 'border-slate-600 bg-slate-900 text-slate-200 hover:border-indigo-400 hover:text-slate-50'
      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:text-gray-900';

    // AI 优化相关状态
    const [optimizeModalOpen, setOptimizeModalOpen] = React.useState(false);
    const [selectedContent, setSelectedContent] = React.useState<string>();
    const [selectedRange, setSelectedRange] = React.useState<{
      from: number;
      to: number;
    } | null>(null);
    const optimizeAbortControllerRef =
      React.useRef<AbortController | null>(null);
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

    const applyOptimizedResult = useCallback(
      (optimizedContent: string) => {
        if (selectedRange) {
          try {
            const currentContent = nodeData.content;
            const before = currentContent.substring(0, selectedRange.from);
            const after = currentContent.substring(selectedRange.to);
            const newContent = before + optimizedContent + after;

            onContentChange(nodeData.id, newContent);
          } catch (error) {
            console.error('替换失败:', error);
            message.error(t('aiOptimize.replaceFailed'));
            return;
          }
        } else {
          onContentChange(nodeData.id, optimizedContent);
          message.success(t('aiOptimize.replacedAllContent'));
        }

        onNodeOptimize?.(nodeData.id, {
          optimizedContent,
          thinkingProcess: '优化完成',
        });

        onOptimizeApply?.(nodeData.id, optimizedContent);

        setOptimizeModalOpen(false);
        setSelectedContent(undefined);
        setSelectedRange(null);
      },
      [
        nodeData.content,
        nodeData.id,
        onContentChange,
        onNodeOptimize,
        onOptimizeApply,
        selectedRange,
        t,
      ],
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

        const resolvedSelectedContent =
          view && !view.state.selection.main.empty
            ? view.state.doc.sliceString(
                view.state.selection.main.from,
                view.state.selection.main.to,
              )
            : nodeData.content;

        if (optimizeCustomContent !== null) {
          if (!onOptimizeRequest) {
            message.warning('请先提供 onOptimizeRequest，再启用自定义优化流程');
            return;
          }

          optimizeAbortControllerRef.current?.abort();
          const abortController = new AbortController();
          optimizeAbortControllerRef.current = abortController;

          Promise.resolve(
            onOptimizeRequest({
            content: nodeData.content,
            selectedText: resolvedSelectedContent,
            instruction: undefined,
            messages: [
              {
                role: 'system',
                content: '你是一个提示词优化助手。',
              },
              {
                role: 'user',
                content: resolvedSelectedContent,
              },
            ],
            signal: abortController.signal,
            config: optimizeConfig,
            applyOptimizedContent: (optimizedContent: string) => {
              applyOptimizedResult(optimizedContent);
              optimizeAbortControllerRef.current = null;
            },
            setOptimizeError: (error: string | Error) => {
              const errorMessage =
                typeof error === 'string' ? error : error.message;
              message.error(errorMessage);
            },
            closeOptimizeDialog: () => {
              optimizeAbortControllerRef.current?.abort();
              optimizeAbortControllerRef.current = null;
              setSelectedContent(undefined);
              setSelectedRange(null);
              setOptimizeModalOpen(false);
            },
            }),
          ).catch((error) => {
            const errorMessage =
              error instanceof Error ? error.message : '自定义优化流程执行失败';
            message.error(errorMessage);
          });
          return;
        }

        setOptimizeModalOpen(true);
      },
      [
        applyOptimizedResult,
        editorRef,
        nodeData.content,
        onOptimizeRequest,
        optimizeConfig,
        optimizeCustomContent,
      ],
    );

    // 下拉菜单项
    const menuItems = [
      {
        key: 'addChild',
        label: t('editor.childTitle'),
        icon: <Plus size={14} />,
        disabled: nodeData.isLocked,
        onClick: (info: any) => {
          info.domEvent.stopPropagation();
          handleAddChild(info.domEvent);
        },
      },
      {
        key: 'lock',
        label: nodeData.isLocked ? t('editor.unlock') : t('editor.lock'),
        icon: nodeData.isLocked ? <Unlock size={14} /> : <Lock size={14} />,
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
        icon: <Trash2 size={14} />,
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
        ref={nodeRef}
        className={`arborist-node group mb-2 pb-1 ${
          isDragging ? 'opacity-50' : ''
        }`}
        data-node-id={nodeData.id}
        style={style}
        draggable={draggable && !previewMode && !nodeData.isLocked}
        onDragStart={draggable ? onDragStart : undefined}
        onDragEnd={draggable ? onDragEnd : undefined}
      >
        {/* 拖拽位置指示器 - before */}
        {isDragOver && dragPosition === 'before' && (
          <div className="absolute -top-[1px] left-3 right-3 z-10 h-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]">
            <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
          </div>
        )}

        {/* 拖拽位置指示器 - after */}
        {isDragOver && dragPosition === 'after' && (
          <div className="absolute -bottom-[1px] left-3 right-3 z-10 h-[2px] bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]">
            <div className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
            <div className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full border-2 border-white bg-indigo-500 shadow-sm" />
          </div>
        )}

        <div className="relative mt-[6px] flex h-full w-full flex-col transition-all">
          {/* 节点头部和编辑器容器 */}
          <div
            className={`flex h-full flex-col gap-2 rounded-lg border-2 border-transparent transition-all ${
              isDragOver && dragPosition === 'inside'
                ? dragInsideClassName
                : ''
            }`}
            onDragOver={draggable ? onDragOver : undefined}
            onDragLeave={draggable ? onDragLeave : undefined}
            onDrop={draggable ? onDrop : undefined}
          >
            {/* 节点头部 */}
            <div
              ref={headerRef}
              className={`${headerClassName} ${
                !previewMode && !nodeData.isLocked
                  ? 'cursor-grab active:cursor-grabbing'
                  : 'cursor-default'
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {/* 三角按钮 - 只控制子节点展开/折叠 */}
                {isInternal ? (
                  <button
                    className={caretButtonClassName}
                    onClick={(e) => {
                      e.stopPropagation();
                      // 点击三角：只切换子节点，不影响编辑器
                      onToggleChildren(nodeData.id);
                    }}
                    type="button"
                    aria-label={
                      isChildrenExpanded
                        ? t('editor.collapseChildren')
                        : t('editor.expandChildren')
                    }
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
                      theme={theme}
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
                  theme={theme}
                />
              )}
            </div>

            {/* 编辑器区域 - 根据展开状态或预览模式决定显示 */}
            {isEditorExpanded && (
              <div
                className={`${editorShellClassName} ${isEditorAnimating ? 'animate-expand-in' : ''}`}
                style={{
                  transformOrigin: 'top center',
                }}
              >
                <div className={editorSurfaceClassName}>
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
                    theme={theme}
                  />
                )}

                {/* 编辑器底部操作按钮 - 预览模式下隐藏 */}
                {!previewMode && (
                  <div className={footerClassName}>
                    <EditorToolbar
                      canUndo={canUndo}
                      canRedo={canRedo}
                      onUndo={handleUndo}
                      onRedo={handleRedo}
                      locale={locale}
                      theme={theme}
                      inline
                    />

                    <div className="flex items-center gap-2">
                      <Tooltip title={t('editor.run')}>
                        <Button
                          type="primary"
                          icon={<PlayCircle size={14} />}
                          onClick={handleRun}
                          size="small"
                          aria-label={t('editor.run')}
                        />
                      </Tooltip>

                      <Tooltip title={t('editor.aiOptimize')}>
                        <Button
                          icon={<Zap size={14} />}
                          onClick={handleOptimize}
                          size="small"
                          aria-label={t('editor.aiOptimize')}
                          className={secondaryActionButtonClassName}
                        />
                      </Tooltip>
                    </div>
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
                    }}
                    originalContent={nodeData.content}
                    selectedContent={selectedContent}
                    optimizeConfig={optimizeConfig}
                    onOptimizeRequest={onOptimizeRequest}
                    onApply={applyOptimizedResult}
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
