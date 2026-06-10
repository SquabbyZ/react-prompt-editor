import { Button, message } from 'antd';
import { Plus } from 'lucide-react';
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
import { EditorStoreType, createEditorStore } from '../../stores';
import type { TaskNode } from '../../types';
import {
  estimateNodeHeight,
  flattenVisibleNodes,
  getNodeActualHeight,
} from '../../utils/virtual-tree';
import { Node } from './Node';
import { PromptEditorProps } from './PromptEditor.types';
import { fireAllLockedCallbacks, sameSet, FireAllLockedResult } from './lockCallbacks';

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
  onAllNodesLocked,
  onAllLeafNodesLocked,
  onAllNonEmptyContentNodesLocked,
  className,
  style,
  renderToolbar,
  onLike,
  onDislike,
  previewMode = false,
  previewRenderMode = 'readonly-editor',
  locale,
  theme = 'system',
  draggable = false,
  dataSelector,
  renderNodeActions,
  renderNodeTopSlot,
  maxChildLevel,
  highlightUnlocked = false,
}) => {
  const lockedCallbacks = useMemo(() => ({ onAllNodesLocked, onAllLeafNodesLocked, onAllNonEmptyContentNodesLocked }), [onAllNodesLocked, onAllLeafNodesLocked, onAllNonEmptyContentNodesLocked]);
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

  useEffect(() => {
    if (isControlled && value) {
      store.getState().initialize(value);
    }
  }, [isControlled, value, store]);

  // 互斥展开：同时只能展开一个编辑器
  const [expandedEditorId, setExpandedEditorId] = useState<string | null>(null);
  // 子节点展开状态：可以多节点同时展开
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  // 高亮未锁定节点 + 自动展开（004）
  const [unlockedHighlightIds, setUnlockedHighlightIds] = useState<Set<string>>(new Set());
  const unlockedHighlightIdsRef = useRef<Set<string>>(new Set());
  const hasAnyLockedCallback =
    !!onAllNodesLocked || !!onAllLeafNodesLocked || !!onAllNonEmptyContentNodesLocked;
  // union 未变则 no-op，保证幂等 + 无反馈循环
  const applyHighlightAndExpand = useCallback((result: FireAllLockedResult) => {
    const next = new Set<string>([
      ...result.unlockedAllIds,
      ...result.unlockedLeafIds,
      ...result.unlockedNonEmptyIds,
    ]);
    if (sameSet(next, unlockedHighlightIdsRef.current)) return;
    unlockedHighlightIdsRef.current = next;
    setUnlockedHighlightIds(next);
    setExpandedNodes((prev) => {
      let changed = false;
      const nextExp = new Set(prev);
      next.forEach((id) => {
        if (!nextExp.has(id)) { nextExp.add(id); changed = true; }
      });
      return changed ? nextExp : prev;
    });
  }, []);

  // 004：树变化时重新计算高亮 union
  useEffect(() => {
    // 008：当 highlightUnlocked 关闭时，主动清空高亮集合，让红框立即消失
    // (之前因为 unlockedHighlightIds 不被清空，节点会残留红框直到下一次计算)
    if (!highlightUnlocked || !hasAnyLockedCallback) {
      if (unlockedHighlightIdsRef.current.size > 0) {
        unlockedHighlightIdsRef.current = new Set();
        setUnlockedHighlightIds(new Set());
      }
      return;
    }
    const all = store.getState().getAllNodes();
    const next = new Set<string>([
      ...all.filter((n) => !n.isLocked).map((n) => n.id),
      ...all.filter((n) => n.children.length === 0 && !n.isLocked).map((n) => n.id),
      ...all.filter((n) => n.content.trim() !== '' && !n.isLocked).map((n) => n.id),
    ]);
    if (sameSet(next, unlockedHighlightIdsRef.current)) return;
    unlockedHighlightIdsRef.current = next;
    setUnlockedHighlightIds(next);
  }, [tree, highlightUnlocked, hasAnyLockedCallback, store]);

  // 虚拟滚动相关状态
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<any>(null);
  const nodeHeightsRef = useRef<Map<string, number>>(new Map());
  const [heightVersion, setHeightVersion] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setContainerHeight(e.contentRect.height);
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  const handleContentChange = useCallback(
    (nodeId: string, content: string) => {
      updateNode(nodeId, { content });
      onChange?.(store.getState().getTree());
    },
    [updateNode, onChange, store],
  );

  const handleNodeHeightChange = useCallback(
    (nodeId: string, height: number) => {
      const nextHeight = Math.ceil(height);
      const prevHeight = nodeHeightsRef.current.get(nodeId);
      if (prevHeight === nextHeight) return;
      nodeHeightsRef.current.set(nodeId, nextHeight);
      setHeightVersion((version) => version + 1);
    },
    [],
  );

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

      const nodeNumber = store.getState().getNodeNumber(nodeId);

      const dependenciesContent = node.dependencies.map((depId) => {
        const depNode = store.getState().getNode(depId);
        const depNodeNumber = store.getState().getNodeNumber(depId);
        return {
          nodeId: depId,
          nodeNumber: depNodeNumber,
          title: depNode?.title || '',
          content: depNode?.content || '',
          hasRun: depNode?.hasRun || false,
        };
      });

      onRunRequest({
        nodeId,
        nodeNumber,
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

      // 解锁时自动清除其他节点对该节点的依赖引用
      if (!newLocked) {
        const allNodes = store.getState().getAllNodes();
        const updates: { nodeId: string; dependencies: string[] }[] = [];

        allNodes.forEach((n) => {
          if (n.id !== nodeId && n.dependencies.includes(nodeId)) {
            updates.push({
              nodeId: n.id,
              dependencies: n.dependencies.filter((id) => id !== nodeId),
            });
          }
        });

        updates.forEach(({ nodeId: depNodeId, dependencies: depValue }) => {
          updateNode(depNodeId, { dependencies: depValue });
        });
        if (updates.length > 0) {
          message.info(
            `${t('editor.nodeUnlocked')}，已自动清除 ${updates.length} 个节点的依赖引用`,
          );
        } else {
          message.success(newLocked ? t('editor.nodeLocked') : t('editor.nodeUnlocked'));
        }
      } else {
        message.success(newLocked ? t('editor.nodeLocked') : t('editor.nodeUnlocked'));
      }

      onNodeLock?.(nodeId, newLocked);
      if (newLocked) {
        const result = fireAllLockedCallbacks(
          store.getState().getAllNodes(),
          lockedCallbacks,
        );
        if (highlightUnlocked && hasAnyLockedCallback) {
          applyHighlightAndExpand(result);
        }
      }
      onChange?.(store.getState().getTree());
    },
    [
      updateNode,
      onNodeLock,
      lockedCallbacks,
      onChange,
      store,
      t,
      hasAnyLockedCallback,
      highlightUnlocked,
      applyHighlightAndExpand,
    ],
  );
  const handleDelete = useCallback(
    (nodeId: string) => {
      // 004-parent-deletion-blocked-by-child-lock:
      // 防御性检查 — 节点自身或任意后代被锁定时拒绝删除。
      // UI 层应在调用前已禁用按钮，但这里作为最后一道防线，捕获编程式调用与 Ctrl+Z 路径。
      const ok = removeNode(nodeId);
      if (!ok) return;
      message.success(t('editor.nodeDeleted'));
      onChange?.(store.getState().getTree());
    },
    [removeNode, onChange, store, t],
  );

  const handleAddChild = useCallback(
    (parentId: string) => {
      const newNodeId = addChild(parentId);
      setExpandedEditorId(newNodeId);
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
    return store.getState().getAllNodes().map((node) => ({
      id: node.id, title: node.title, number: getNodeNumber(node.id),
      hasRun: node.hasRun, isLocked: node.isLocked,
      parentId: node.parentId, children: node.children,
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

  const handleDragStart = useCallback((nodeId: string, e: React.DragEvent) => {
    setDraggingNodeId(nodeId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingNodeId(null);
    setDragOverNodeId(null);
    setDragPosition(null);
  }, []);

  // 处理拖拽经过
  const handleDragOver = useCallback((nodeId: string, e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggingNodeId === nodeId) return;

    setDragOverNodeId(nodeId);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

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
      setDragPosition('before');
    } else if (y > height * 0.65) {
      setDragPosition('after');
    } else if (canDropInside) {
      setDragPosition('inside');
    } else {
      setDragPosition(y < height / 2 ? 'before' : 'after');
    }
  }, [draggingNodeId, store]);

  // 处理拖拽离开
  const handleDragLeave = useCallback(
    (nodeId: string, e: React.DragEvent) => {
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

      if (dragPosition === 'inside') {
        moveNode(sourceNodeId, targetNodeId, targetNode.children.length);
      } else if (dragPosition === 'before') {
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

  const getItemSize = useCallback(
    (index: number) => {
      const node = visibleNodes[index];
      if (!node) return 48;
      const opts = { previewMode, previewRenderMode };
      const cachedHeight = getNodeActualHeight(node.id, expandedEditorId, nodeHeightsRef, opts);
      const estimatedHeight = estimateNodeHeight(
        node,
        expandedEditorId === node.id,
        { ...opts, hasTopSlot: !!renderNodeTopSlot },
      );
      if (nodeHeightsRef.current.has(node.id)) return cachedHeight;
      return estimatedHeight;
    },
    [visibleNodes, expandedEditorId, heightVersion],
  );

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
      previewRenderMode: previewRenderKind,
      locale: loc,
      theme: thm,
      draggable: drag,
      dataSelector,
      renderNodeActions,
      renderNodeTopSlot,
      maxChildLevel: maxLevel,
      unlockedHighlightIds: highlightSet,
    }: any) => {
      const node = nodes[index];
      if (!node) return null;
      const isHighlightedFlag = highlightSet
        ? highlightSet.has(node.id)
        : false;

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
          // 根节点 (level===1) 不缩进,子节点每级 +16px
          paddingLeft: `${Math.max(0, node.level - 1) * 16}px`,
          boxSizing: 'border-box' as const,
        },
        dragHandle: null,
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
            previewRenderMode={previewRenderKind}
            locale={loc}
            theme={thm}
            dataSelector={dataSelector}
            renderNodeActions={renderNodeActions}
            renderNodeTopSlot={renderNodeTopSlot}
            maxChildLevel={maxLevel}
            isHighlighted={isHighlightedFlag}
          />
        </div>
      );
    },
    [],
  );

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
      previewRenderMode,
      locale,
      theme,
      draggable,
      dataSelector,
      renderNodeActions,
      renderNodeTopSlot,
      maxChildLevel,
      unlockedHighlightIds,
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
      previewRenderMode,
      locale,
      theme,
      draggable,
      dataSelector,
      renderNodeActions,
      renderNodeTopSlot,
      maxChildLevel,
      unlockedHighlightIds,
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
      {!previewMode && (
        <div className={toolbarClassName}>
          {renderToolbar ? (
            renderToolbar({ addRootNode: handleAddRootNode })
          ) : (
            <Button
              type="dashed"
              icon={<Plus size={14} />}
              onClick={handleAddRootNode}
              block
              aria-label={t('editor.addRootNode')}
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
          defaultHeight={containerHeight - 32}
          rowCount={visibleNodes.length}
          rowHeight={(index) => getItemSize(index)}
          overscanCount={5}
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
