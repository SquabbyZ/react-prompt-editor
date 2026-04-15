import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { List } from 'react-window';
import { useI18n } from '../../hooks/useI18n';
import { useResolvedTheme } from '../../hooks/useResolvedTheme';
import { createEditorStore, EditorStoreType } from '../../stores';
import { TaskNode } from '../../types';
import {
  estimateNodeHeight,
  flattenVisibleNodes,
  getNodeActualHeight,
} from '../../utils/virtual-tree';
import { Node } from './Node';
import { PromptEditorProps } from './PromptEditor.types';

export const PromptEditor: React.FC<PromptEditorProps> = ({
  initialValue = [],
  value,
  onChange,
  onRunRequest,
  optimizeConfig,
  autoOptimize = true,
  onOptimizeRequest,
  onNodeRun,
  onNodeOptimize,
  onOptimizeApply,
  optimizeCustomContent = null,
  onNodeLock,
  className,
  style,
  renderToolbar,
  onLike,
  onDislike,
  previewMode = false,
  locale,
  theme = 'system',
  draggable = false,
}) => {
  // 国际化 Hook
  const { t } = useI18n(locale);
  const { isDarkMode } = useResolvedTheme(theme);
  const isControlled = value !== undefined;

  // 为每个 PromptEditor 实例创建独立的 store
  const storeRef = useRef<EditorStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createEditorStore(
      isControlled ? value || [] : initialValue,
    );
  }
  const store = storeRef.current;

  // 订阅 Zustand store（只订阅 store 引用，避免无限循环）
  const storeMapRef = store((state) => state.store);
  const updateNode = store((state) => state.updateNode);
  const removeNode = store((state) => state.removeNode);
  const addChild = store((state) => state.addChild);
  const addRootNode = store((state) => state.addRootNode);
  const moveNode = store((state) => state.moveNode);
  const getNodeNumber = store((state) => state.getNodeNumber);

  // 在渲染时生成树（避免 Selector 每次都返回新引用）
  const tree = useMemo(() => {
    return store.getState().getTree();
  }, [storeMapRef]);

  // 当受控模式下 value 变化时，同步到 store
  useEffect(() => {
    if (isControlled && value) {
      store.getState().initialize(value);
    }
  }, [isControlled, value, store]);

  // 互斥展开：同时只能展开一个编辑器
  const [expandedEditorId, setExpandedEditorId] = useState<string | null>(null);
  // 子节点展开状态：可以多节点同时展开
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 虚拟滚动相关状态
  const [containerHeight, setContainerHeight] = useState(600); // 容器高度
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);
  const nodeHeightsRef = useRef<Map<string, number>>(new Map()); // 节点高度缓存
  const [heightVersion, setHeightVersion] = useState(0);

  // 监听容器高度变化
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const handleContentChange = useCallback(
    (nodeId: string, content: string) => {
      nodeHeightsRef.current.delete(nodeId);
      updateNode(nodeId, { content });
      onChange?.(store.getState().getTree());
    },
    [updateNode, onChange, store],
  );

  const handleNodeHeightChange = useCallback((nodeId: string, height: number) => {
    const nextHeight = Math.ceil(height);
    const prevHeight = nodeHeightsRef.current.get(nodeId);

    if (prevHeight === nextHeight) {
      return;
    }

    nodeHeightsRef.current.set(nodeId, nextHeight);
    setHeightVersion((version) => version + 1);
  }, []);

  // 处理节点运行结果
  const handleNodeRunCallback = useCallback(
    (nodeId: string, result: any) => {
      updateNode(nodeId, { hasRun: true });
      onNodeRun?.(nodeId, result);
      onChange?.(store.getState().getTree());
    },
    [updateNode, onNodeRun, onChange, store],
  );

  const handleNodeRun = useCallback(
    (nodeId: string) => {
      if (!onRunRequest) {
        message.warning(t('editor.missingOnRunRequest'));
        return;
      }

      // 直接从 store 获取最新数据，避免闭包问题
      const node = store.getState().getNode(nodeId);
      if (!node) return;

      // 构建依赖节点详细信息
      const dependenciesContent = node.dependencies.map((depId) => {
        const depNode = store.getState().getNode(depId);
        return {
          nodeId: depId,
          title: depNode?.title || '',
          content: depNode?.content || '',
          hasRun: depNode?.hasRun || false,
        };
      });

      // 触发运行请求回调，由用户自行处理异步请求
      onRunRequest({
        nodeId,
        content: node.content,
        dependenciesContent,
        meta: {
          onNodeRun: handleNodeRunCallback,
        },
      });
    },
    [onRunRequest, store, handleNodeRunCallback, t],
  );

  const handleNodeLock = useCallback(
    (nodeId: string) => {
      const node = store.getState().getNode(nodeId);
      if (!node) return;

      const newLocked = !node.isLocked;
      updateNode(nodeId, { isLocked: newLocked });
      message.success(
        newLocked ? t('editor.nodeLocked') : t('editor.nodeUnlocked'),
      );
      onNodeLock?.(nodeId, newLocked);
      onChange?.(store.getState().getTree());
    },
    [updateNode, onNodeLock, onChange, store, t],
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      removeNode(nodeId);
      message.success(t('editor.nodeDeleted'));
      onChange?.(store.getState().getTree());
    },
    [removeNode, onChange, store, t],
  );

  const handleAddChild = useCallback(
    (parentId: string) => {
      const newNodeId = addChild(parentId);
      // 自动展开新节点的编辑器
      setExpandedEditorId(newNodeId);
      // 同时展开父节点的子节点列表
      setExpandedNodes((prev) => {
        const next = new Set(prev);
        next.add(parentId);
        return next;
      });
      message.success(t('editor.childNodeAdded'));
      onChange?.(store.getState().getTree());
    },
    [addChild, onChange, store, t],
  );

  const handleAddRootNode = useCallback(() => {
    const newNodeId = addRootNode();
    // 自动展开新节点的编辑器
    setExpandedEditorId(newNodeId);
    message.success(t('editor.rootTitleAdded'));
    onChange?.(store.getState().getTree());
  }, [addRootNode, onChange, store, t]);

  const handleUpdateTitle = useCallback(
    (nodeId: string, title: string) => {
      updateNode(nodeId, { title });
      onChange?.(store.getState().getTree());
    },
    [updateNode, onChange, store],
  );

  const handleUpdateDependencies = useCallback(
    (nodeId: string, dependencies: string[]) => {
      const prevCount =
        store.getState().getNode(nodeId)?.dependencies.length || 0;
      updateNode(nodeId, { dependencies });
      if (dependencies.length > prevCount) {
        message.success(t('editor.dependencyAdded'));
      } else if (dependencies.length < prevCount) {
        message.info(t('editor.dependencyRemoved'));
      }
      onChange?.(store.getState().getTree());
    },
    [updateNode, onChange, store, t],
  );

  // 获取所有可用节点列表（用于依赖选择）
  const getAvailableNodes = useCallback(() => {
    const allNodes = store.getState().getAllNodes();
    return allNodes.map((node) => ({
      id: node.id,
      title: node.title,
      number: getNodeNumber(node.id),
      hasRun: node.hasRun,
      parentId: node.parentId,
      children: node.children,
    }));
  }, [store, getNodeNumber]);

  const handleToggleEditor = useCallback((nodeId: string) => {
    setExpandedEditorId((prev) => {
      if (prev) {
        nodeHeightsRef.current.delete(prev);
      }
      nodeHeightsRef.current.delete(nodeId);
      // 如果当前节点已展开，则折叠它
      if (prev === nodeId) {
        return null;
      }
      // 否则展开新节点（自动折叠其他节点）
      return nodeId;
    });
  }, []);

  // 处理子节点展开/折叠（非互斥）
  const handleToggleChildren = useCallback((nodeId: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // 拖拽相关状态
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOverNodeId, setDragOverNodeId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<
    'before' | 'after' | 'inside' | null
  >(null);

  // 处理拖拽开始
  const handleDragStart = useCallback((nodeId: string, e: React.DragEvent) => {
    setDraggingNodeId(nodeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
  }, []);

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    setDraggingNodeId(null);
    setDragOverNodeId(null);
    setDragPosition(null);
  }, []);

  // 处理拖拽经过
  const handleDragOver = useCallback(
    (nodeId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (draggingNodeId === nodeId) return;

      setDragOverNodeId(nodeId);

      // 判断拖拽位置：before, after, 或 inside
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;

      // 检查是否允许放入当前节点（不能放入自己或自己的子节点）
      const targetNode = store.getState().getNode(nodeId);
      const draggedNode = store.getState().getNode(draggingNodeId!);

      if (!targetNode || !draggedNode) return;

      // 检查是否会形成循环依赖
      function isDescendant(parentId: string, targetId: string): boolean {
        const parent = store.getState().getNode(parentId);
        if (!parent) return false;
        if (parent.children.includes(targetId)) return true;
        return parent.children.some((childId) =>
          isDescendant(childId, targetId),
        );
      }

      const canDropInside = !isDescendant(draggingNodeId!, nodeId);

      if (y < height * 0.35) {
        // 上方 35%
        setDragPosition('before');
      } else if (y > height * 0.65) {
        // 下方 35%
        setDragPosition('after');
      } else if (canDropInside) {
        // 中间 30%（只有当不会形成循环时才允许放入）
        setDragPosition('inside');
      } else {
        // 如果不能放入，则根据位置决定 before 或 after
        setDragPosition(y < height / 2 ? 'before' : 'after');
      }
    },
    [draggingNodeId, store],
  );

  // 处理拖拽离开
  const handleDragLeave = useCallback(
    (nodeId: string, e: React.DragEvent) => {
      // 只有当真正离开元素时才清除状态
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX;
      const y = e.clientY;

      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        if (dragOverNodeId === nodeId) {
          setDragOverNodeId(null);
          setDragPosition(null);
        }
      }
    },
    [dragOverNodeId],
  );

  // 处理放置
  const handleDrop = useCallback(
    (targetNodeId: string, e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const sourceNodeId = e.dataTransfer.getData('text/plain');
      if (!sourceNodeId || sourceNodeId === targetNodeId) {
        handleDragEnd();
        return;
      }

      if (!dragPosition) {
        handleDragEnd();
        return;
      }

      const targetNode = store.getState().getNode(targetNodeId);
      if (!targetNode) {
        handleDragEnd();
        return;
      }

      // 根据拖拽位置决定新的父节点和索引
      if (dragPosition === 'inside') {
        // 放入目标节点内部，作为最后一个子节点
        moveNode(sourceNodeId, targetNodeId, targetNode.children.length);
      } else if (dragPosition === 'before') {
        // 在目标节点之前
        if (targetNode.parentId) {
          const parent = store.getState().getNode(targetNode.parentId);
          if (parent) {
            const index = parent.children.indexOf(targetNodeId);
            moveNode(sourceNodeId, targetNode.parentId, index);
          }
        } else {
          // 目标节点是根节点
          const rootOrder = store.getState().rootOrder;
          const index = rootOrder.indexOf(targetNodeId);
          moveNode(sourceNodeId, null, index);
        }
      } else if (dragPosition === 'after') {
        // 在目标节点之后
        if (targetNode.parentId) {
          const parent = store.getState().getNode(targetNode.parentId);
          if (parent) {
            const index = parent.children.indexOf(targetNodeId) + 1;
            moveNode(sourceNodeId, targetNode.parentId, index);
          }
        } else {
          // 目标节点是根节点
          const rootOrder = store.getState().rootOrder;
          const index = rootOrder.indexOf(targetNodeId) + 1;
          moveNode(sourceNodeId, null, index);
        }
      }

      message.success(t('editor.nodeMoved'));
      onChange?.(store.getState().getTree());
      handleDragEnd();
    },
    [dragPosition, moveNode, store, onChange, handleDragEnd, t],
  );

  // 生成可见节点列表
  const visibleNodes = useMemo(() => {
    return flattenVisibleNodes(tree, expandedNodes);
  }, [tree, expandedNodes]);

  // 获取节点高度的回调函数
  const getItemSize = useCallback(
    (index: number) => {
      const node = visibleNodes[index];
      if (!node) return 48;

      const cachedHeight = getNodeActualHeight(
        node.id,
        expandedEditorId,
        nodeHeightsRef,
      );
      const estimatedHeight = estimateNodeHeight(
        node,
        expandedEditorId === node.id,
      );

      if (nodeHeightsRef.current.has(node.id)) {
        return cachedHeight;
      }

      return estimatedHeight;
    },
    [visibleNodes, expandedEditorId, heightVersion],
  );

  // 渲染单个节点项
  const RowComponent = useCallback(
    ({
      index,
      style,
      visibleNodes: nodes,
      draggingNodeId: dragNode,
      dragOverNodeId: dragOver,
      dragPosition: dragPos,
      onDragStart,
      onDragOver,
      onDragLeave,
      onDrop,
      onDragEnd,
      onContentChange,
      onNodeRun,
      onNodeLock,
      onDelete,
      onAddChild,
      onUpdateTitle,
      onUpdateDependencies,
      getNodeNumber,
      onNodeHeightChange,
      expandedEditorId,
      onToggleEditor,
      expandedNodes: expNodes,
      onToggleChildren,
      availableNodes,
      optimizeConfig,
      autoOptimize,
      onOptimizeRequest,
      onNodeOptimize,
      onOptimizeApply,
      onLike,
      onDislike,
      previewMode: prevMode,
      locale: loc,
      theme: thm,
      draggable: drag,
    }: any) => {
      const node = nodes[index];
      if (!node) return null;

      const nodeProps = {
        node: {
          data: {
            ...node,
            children: node.children?.map((child: TaskNode) => child.id) || [],
            dependencies: node.dependencies || [],
          },
          isInternal: !!(node.children && node.children.length > 0),
          level: node.level,
        },
        style: {
          paddingLeft: `${node.level * 16}px`,
          boxSizing: 'border-box' as const,
        },
        dragHandle: null,
        // 拖拽相关 props
        isDragging: dragNode === node.id,
        isDragOver: dragOver === node.id,
        dragPosition: dragPos,
        draggable: drag,
        onDragStart: (e: React.DragEvent) => onDragStart(node.id, e),
        onDragOver: (e: React.DragEvent) => onDragOver(node.id, e),
        onDragLeave: (e: React.DragEvent) => onDragLeave(node.id, e),
        onDrop: (e: React.DragEvent) => onDrop(node.id, e),
        onDragEnd: onDragEnd,
      };

      return (
        <div style={style}>
          <Node
            {...nodeProps}
            onContentChange={onContentChange}
            onNodeRun={onNodeRun}
            onNodeLock={onNodeLock}
            onDelete={onDelete}
            onAddChild={onAddChild}
            onUpdateTitle={onUpdateTitle}
            onUpdateDependencies={onUpdateDependencies}
            getNodeNumber={getNodeNumber}
            onHeightChange={onNodeHeightChange}
            expandedEditorId={expandedEditorId}
            onToggleEditor={onToggleEditor}
            expandedNodes={expNodes}
            onToggleChildren={onToggleChildren}
            availableNodes={availableNodes}
            optimizeConfig={optimizeConfig}
            autoOptimize={autoOptimize}
            onOptimizeRequest={onOptimizeRequest}
            onNodeOptimize={onNodeOptimize}
            onOptimizeApply={onOptimizeApply}
            optimizeCustomContent={optimizeCustomContent}
            onLike={onLike}
            onDislike={onDislike}
            previewMode={prevMode}
            locale={loc}
            theme={thm}
          />
        </div>
      );
    },
    [],
  );

  // 准备 rowProps
  const rowProps = useMemo(
    () => ({
      visibleNodes,
      draggingNodeId,
      dragOverNodeId,
      dragPosition,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      onDragEnd: handleDragEnd,
      onContentChange: handleContentChange,
      onNodeRun: handleNodeRun,
      onNodeLock: handleNodeLock,
      onDelete: handleDelete,
      onAddChild: handleAddChild,
      onUpdateTitle: handleUpdateTitle,
      onUpdateDependencies: handleUpdateDependencies,
      getNodeNumber,
      onNodeHeightChange: handleNodeHeightChange,
      expandedEditorId,
      onToggleEditor: handleToggleEditor,
      expandedNodes,
      onToggleChildren: handleToggleChildren,
      availableNodes: getAvailableNodes(),
      optimizeConfig,
      autoOptimize,
      onOptimizeRequest,
      onNodeOptimize,
      onOptimizeApply,
      onLike,
      onDislike,
      previewMode,
      locale,
      theme,
      draggable,
    }),
    [
      visibleNodes,
      draggingNodeId,
      dragOverNodeId,
      dragPosition,
      handleDragStart,
      handleDragOver,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
      handleContentChange,
      handleNodeRun,
      handleNodeLock,
      handleDelete,
      handleAddChild,
      handleUpdateTitle,
      handleUpdateDependencies,
      getNodeNumber,
      handleNodeHeightChange,
      expandedEditorId,
      handleToggleEditor,
      expandedNodes,
      handleToggleChildren,
      getAvailableNodes,
      optimizeConfig,
      autoOptimize,
      onOptimizeRequest,
      onNodeOptimize,
      onOptimizeApply,
      onLike,
      onDislike,
      previewMode,
      locale,
      theme,
      draggable,
    ],
  );

  const componentThemeClass = isDarkMode ? 'dark' : 'prompt-editor-theme-light';
  const containerClassName = isDarkMode
    ? 'prompt-editor-container scroll-thin flex h-full w-full flex-col overflow-hidden bg-[linear-gradient(180deg,rgba(7,16,31,0.98),rgba(4,10,22,1))] text-slate-50'
    : 'prompt-editor-container scroll-thin flex h-full w-full flex-col overflow-hidden bg-white text-gray-900';
  const toolbarClassName = isDarkMode
    ? 'prompt-editor-toolbar z-5 border-b border-blue-500/15 bg-[linear-gradient(180deg,rgba(7,16,31,0.98),rgba(4,10,22,1))] px-4 py-3'
    : 'prompt-editor-toolbar z-5 border-b border-gray-200 bg-white px-4 py-3';
  const addRootButtonClassName = isDarkMode
    ? 'prompt-editor-add-root border-slate-500/40 !bg-[rgba(10,14,22,0.88)] !text-gray-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-indigo-400/60 hover:!text-slate-50'
    : 'prompt-editor-add-root border-gray-300 bg-white text-gray-900 shadow-none hover:border-gray-400 hover:text-gray-900';
  const bodyClassName = isDarkMode
    ? 'prompt-editor-body flex-1 bg-[linear-gradient(180deg,rgba(7,16,31,0.98),rgba(4,10,22,1))]'
    : 'prompt-editor-body flex-1 bg-white';

  return (
    <div
      className={`${containerClassName} ${componentThemeClass} ${className || ''}`}
      data-prompt-editor="true"
      style={style}
      data-theme={theme === 'system' ? undefined : theme}
    >
      {/* 顶部工具栏 - 预览模式下隐藏 */}
      {!previewMode && (
        <div className={toolbarClassName}>
          {renderToolbar ? (
            renderToolbar({ addRootNode: handleAddRootNode })
          ) : (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddRootNode}
              block
              className={addRootButtonClassName}
            >
              {t('editor.addRootNode')}
            </Button>
          )}
        </div>
      )}
      <div
        className={bodyClassName}
        ref={containerRef}
        style={{ overflow: 'hidden' }}
      >
        {/* @ts-ignore - react-window v2 API requires rowProps */}
        <List
          listRef={listRef}
          defaultHeight={containerHeight - 32} // 减去 padding
          rowCount={visibleNodes.length}
          rowHeight={(index) => getItemSize(index)}
          overscanCount={5} // 预渲染 5 个额外节点
          className="prompt-editor-list scroll-thin"
          style={{
            width: 'calc(100% - 32px)',
            height: 'calc(100% - 32px)',
            margin: '16px auto',
          }}
          rowComponent={RowComponent}
          rowProps={rowProps}
        />
      </div>
    </div>
  );
};

export default memo(PromptEditor);
