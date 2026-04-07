import { PlusOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import React, { useCallback, useRef } from 'react';
import { useTreeState } from '../../hooks/useTreeState';
import '../../styles/tailwind.css';
import { mapToArray } from '../../utils/tree-utils';
import { Node } from './Node';
import { PromptEditorProps } from './PromptEditor.types';

export const PromptEditor: React.FC<PromptEditorProps> = ({
  initialValue = [],
  value,
  onChange,
  runAPI,
  optimizeAPI,
  onNodeRun,
  onNodeLock,
  onTreeChange,
  theme = 'default',
  className,
  style,
  renderToolbar,
}) => {
  const isControlled = value !== undefined;
  const {
    store,
    updateNode,
    removeNode,
    addChild,
    addRootNode,
    getNodeNumber,
    tree,
  } = useTreeState(isControlled ? value : initialValue);

  const treeRef = useRef<any>(null);
  // 互斥展开：同时只能展开一个编辑器
  const [expandedEditorId, setExpandedEditorId] = React.useState<string | null>(
    null,
  );
  // 子节点展开状态：可以多节点同时展开
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(
    new Set(),
  );

  const handleContentChange = useCallback(
    (nodeId: string, content: string) => {
      updateNode(nodeId, { content });
      if (!isControlled) {
        onTreeChange?.(mapToArray(store));
      }
    },
    [updateNode, isControlled, onTreeChange, store],
  );

  const handleNodeRun = useCallback(
    async (nodeId: string) => {
      if (!runAPI) {
        message.error('Please provide runAPI prop');
        return;
      }

      const node = store.get(nodeId);
      if (!node) return;

      // 构建依赖节点详细信息
      const dependenciesContent = node.dependencies.map((depId) => {
        const depNode = store.get(depId);
        return {
          nodeId: depId,
          title: depNode?.title || '',
          content: depNode?.content || '',
          hasRun: depNode?.hasRun || false,
        };
      });

      message.loading({ content: '正在运行...', key: 'run' });
      try {
        const response = await runAPI({
          nodeId,
          content: node.content,
          dependenciesContent,
        });

        updateNode(nodeId, { hasRun: true });
        onNodeRun?.(nodeId, response);
        message.success({ content: '运行成功', key: 'run' });

        if (!isControlled) {
          onTreeChange?.(mapToArray(store));
        }
      } catch (error) {
        console.error('Run failed:', error);
        message.error({ content: '运行失败，请重试', key: 'run' });
      }
    },
    [runAPI, store, updateNode, onNodeRun, isControlled, onTreeChange],
  );

  const handleNodeLock = useCallback(
    (nodeId: string) => {
      const node = store.get(nodeId);
      if (!node) return;

      const newLocked = !node.isLocked;
      updateNode(nodeId, { isLocked: newLocked });
      message.success(newLocked ? '节点已锁定' : '节点已解锁');
      onNodeLock?.(nodeId, newLocked);

      if (!isControlled) {
        onTreeChange?.(mapToArray(store));
      }
    },
    [store, updateNode, onNodeLock, isControlled, onTreeChange],
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      removeNode(nodeId);
      message.success('节点已删除');
      if (!isControlled) {
        onTreeChange?.(mapToArray(store));
      }
    },
    [removeNode, isControlled, onTreeChange, store],
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
      message.success('子节点添加成功');
      if (!isControlled) {
        onTreeChange?.(mapToArray(store));
      }
    },
    [addChild, isControlled, onTreeChange, store],
  );

  const handleAddRootNode = useCallback(() => {
    const newNodeId = addRootNode();
    // 自动展开新节点的编辑器
    setExpandedEditorId(newNodeId);
    message.success('一级标题添加成功');
    if (!isControlled) {
      onTreeChange?.(mapToArray(store));
    }
  }, [addRootNode, isControlled, onTreeChange, store]);

  const handleUpdateTitle = useCallback(
    (nodeId: string, title: string) => {
      updateNode(nodeId, { title });
      if (!isControlled) {
        onTreeChange?.(mapToArray(store));
      }
    },
    [updateNode, isControlled, onTreeChange, store],
  );

  const handleUpdateDependencies = useCallback(
    (nodeId: string, dependencies: string[]) => {
      const prevCount = store.get(nodeId)?.dependencies.length || 0;
      updateNode(nodeId, { dependencies });
      if (dependencies.length > prevCount) {
        message.success('依赖添加成功');
      } else if (dependencies.length < prevCount) {
        message.info('依赖已移除');
      }
      if (!isControlled) {
        onTreeChange?.(mapToArray(store));
      }
    },
    [updateNode, isControlled, onTreeChange, store],
  );

  // 获取所有可用节点列表（用于依赖选择）
  const getAvailableNodes = useCallback(() => {
    return Array.from(store.values()).map((node) => ({
      id: node.id,
      title: node.title,
      number: getNodeNumber(node.id),
      hasRun: node.hasRun,
      parentId: node.parentId,
      children: node.children,
    }));
  }, [store, getNodeNumber]);
  // const handleMove = useCallback(({ dragIds, parentId, index }: { dragIds: string[], parentId: string | null, index: number }) => {
  //   console.log('Move nodes:', dragIds, parentId, index);
  //   if (!isControlled) {
  //     onTreeChange?.(mapToArray(store));
  //   }
  // }, [isControlled, onTreeChange, store]);

  // 处理编辑器展开/折叠（互斥）
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
            onToggleChildren={handleToggleChildren}
            availableNodes={getAvailableNodes()}
            optimizeAPI={optimizeAPI}
          />
          {/* 递归渲染子节点 - 根据 expandedNodes 判断是否显示 */}
          {node.children &&
            node.children.length > 0 &&
            expandedNodes.has(node.id) && (
              <div>{renderTreeNodes(node.children, level + 1)}</div>
            )}
        </div>
      );
    });
  };

  return (
    <div
      className={`h-full w-full overflow-auto bg-white dark:bg-gray-900 ${className || ''}`}
      style={style}
      data-theme={theme}
    >
      {/* 顶部工具栏 */}
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
            添加一级标题
          </Button>
        )}
      </div>
      <div className="arborist-tree p-4" ref={treeRef}>
        {renderTreeNodes(tree)}
      </div>
    </div>
  );
};

export default PromptEditor;
