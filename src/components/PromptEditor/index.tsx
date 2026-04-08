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
import { useI18n } from '../../hooks/useI18n';
import { createEditorStore, EditorStoreType } from '../../stores';
import { Node } from './Node';
import { PromptEditorProps } from './PromptEditor.types';

export const PromptEditor: React.FC<PromptEditorProps> = ({
  initialValue = [],
  value,
  onChange,
  onRunRequest,
  onOptimizeRequest,
  onNodeRun,
  onNodeOptimize,
  onNodeLock,
  className,
  style,
  renderToolbar,
  onLike,
  onDislike,
  previewMode = false,
  locale,
}) => {
  // 国际化 Hook
  const { t } = useI18n(locale);
  const isControlled = value !== undefined;

  // 为每个 PromptEditor 实例创建独立的 store
  const storeRef = useRef<EditorStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createEditorStore(isControlled ? value : initialValue);
  }
  const store = storeRef.current;

  // 订阅 Zustand store（只订阅 store 引用，避免无限循环）
  const storeMapRef = store((state) => state.store);
  const updateNode = store((state) => state.updateNode);
  const removeNode = store((state) => state.removeNode);
  const addChild = store((state) => state.addChild);
  const addRootNode = store((state) => state.addRootNode);
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

  const treeRef = useRef<any>(null);
  // 互斥展开：同时只能展开一个编辑器
  const [expandedEditorId, setExpandedEditorId] = useState<string | null>(null);
  // 子节点展开状态：可以多节点同时展开
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const handleContentChange = useCallback(
    (nodeId: string, content: string) => {
      updateNode(nodeId, { content });
      onChange?.(store.getState().getTree());
    },
    [updateNode, onChange, store],
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

  // 子节点展开动画跟踪
  const [animatingChildren, setAnimatingChildren] = React.useState<Set<string>>(
    new Set(),
  );

  const handleToggleChildrenAnimated = useCallback(
    (nodeId: string) => {
      setAnimatingChildren((prev) => new Set(prev).add(nodeId));
      handleToggleChildren(nodeId);
      // 动画时长后移除跟踪
      setTimeout(() => {
        setAnimatingChildren((prev) => {
          const next = new Set(prev);
          next.delete(nodeId);
          return next;
        });
      }, 350);
    },
    [handleToggleChildren],
  );

  // 递归渲染树节点
  const renderTreeNodes = (nodes: any[], level: number = 0) => {
    return nodes.map((node) => {
      const nodeProps = {
        node: {
          data: node,
          isInternal: node.children && node.children.length > 0,
          level,
        },
        style: { paddingLeft: `${level * 16}px` }, // 减少缩进间距：从 24px 改为 16px
        dragHandle: null,
      };

      return (
        <div key={node.id}>
          <Node
            {...nodeProps}
            onContentChange={handleContentChange}
            onNodeRun={handleNodeRun}
            onNodeLock={handleNodeLock}
            onDelete={handleDelete}
            onAddChild={handleAddChild}
            onUpdateTitle={handleUpdateTitle}
            onUpdateDependencies={handleUpdateDependencies}
            getNodeNumber={getNodeNumber}
            expandedEditorId={expandedEditorId}
            onToggleEditor={handleToggleEditor}
            expandedNodes={expandedNodes}
            onToggleChildren={handleToggleChildrenAnimated}
            availableNodes={getAvailableNodes()}
            onOptimizeRequest={onOptimizeRequest}
            onNodeOptimize={onNodeOptimize}
            onLike={onLike}
            onDislike={onDislike}
            previewMode={previewMode}
            locale={locale}
          />
          {/* 递归渲染子节点 - 根据 expandedNodes 判断是否显示 */}
          {node.children &&
            node.children.length > 0 &&
            expandedNodes.has(node.id) && (
              <div
                className={`overflow-hidden ${animatingChildren.has(node.id) ? 'animate-slide-down-children' : ''}`}
                style={{ transformOrigin: 'top' }}
              >
                {renderTreeNodes(node.children, level + 1)}
              </div>
            )}
        </div>
      );
    });
  };

  return (
    <div
      className={`prompt-editor-container h-full w-full overflow-auto bg-white dark:bg-gray-900 ${className || ''}`}
      data-prompt-editor="true"
      style={style}
    >
      {/* 顶部工具栏 - 预览模式下隐藏 */}
      {!previewMode && (
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
          {renderToolbar ? (
            renderToolbar({ addRootNode: handleAddRootNode })
          ) : (
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddRootNode}
              block
            >
              {t('editor.addRootNode')}
            </Button>
          )}
        </div>
      )}
      <div className="arborist-tree p-4" ref={treeRef}>
        {renderTreeNodes(tree)}
      </div>
    </div>
  );
};

export default memo(PromptEditor);
