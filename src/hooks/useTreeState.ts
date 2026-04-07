import { useCallback, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NodeStore, TaskNode, TaskNodeMinimal } from '../types';
import { arrayToMap, mapToArray } from '../utils/tree-utils';

export interface UseTreeStateReturn {
  store: NodeStore;
  tree: TaskNode[];
  expandedNodes: Set<string>;
  toggleExpand: (nodeId: string) => void;
  removeNode: (nodeId: string) => void;
  addChild: (parentId: string) => string; // 返回新节点的 ID
  addRootNode: () => string; // 添加根节点，返回新节点的 ID
  updateNode: (nodeId: string, updates: Partial<TaskNodeMinimal>) => void;
  getNodeNumber: (nodeId: string) => string;
}

export function useTreeState(
  initialValue: TaskNode[] = [],
): UseTreeStateReturn {
  const [store, setStore] = useState<NodeStore>(() => arrayToMap(initialValue));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 转换为树形数组（用于渲染）
  const tree = useMemo(() => mapToArray(store), [store]);

  // 切换展开/折叠（互斥展开）
  const toggleExpand = useCallback((nodeId: string) => {
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

  // 添加子节点
  const addChild = useCallback((parentId: string): string => {
    let newNodeId = '';
    setStore((prev) => {
      const next = new Map(prev);
      const parentNode = next.get(parentId);
      if (!parentNode) return prev;

      // 使用 UUID 确保唯一性
      newNodeId = uuidv4();
      const newNode: TaskNodeMinimal = {
        id: newNodeId,
        title: '新子标题',
        content: '',
        parentId,
        children: [],
        isLocked: false,
        hasRun: false,
        dependencies: [],
      };

      next.set(newNodeId, newNode);
      parentNode.children = [...parentNode.children, newNodeId];
      return next;
    });
    return newNodeId;
  }, []);

  // 添加根节点（一级标题）
  const addRootNode = useCallback((): string => {
    let newNodeId = '';
    setStore((prev) => {
      const next = new Map(prev);
      // 使用 root-uuid 格式，便于区分根节点且保证唯一性
      newNodeId = `root-${uuidv4()}`;
      const newNode: TaskNodeMinimal = {
        id: newNodeId,
        title: '新标题',
        content: '',
        parentId: undefined,
        children: [],
        isLocked: false,
        hasRun: false,
        dependencies: [],
      };

      next.set(newNodeId, newNode);
      return next;
    });
    return newNodeId;
  }, []);

  // 删除节点
  const removeNode = useCallback((nodeId: string) => {
    setStore((prev) => {
      const next = new Map(prev);
      const node = next.get(nodeId);

      if (node?.parentId) {
        const parent = next.get(node.parentId);
        if (parent) {
          parent.children = parent.children.filter((id) => id !== nodeId);
        }
      }

      // 递归删除子节点
      function deleteChildren(id: string) {
        const node = next.get(id);
        if (node) {
          node.children.forEach(deleteChildren);
          next.delete(id);
        }
      }

      deleteChildren(nodeId);
      return next;
    });
  }, []);

  // 更新节点
  const updateNode = useCallback(
    (nodeId: string, updates: Partial<TaskNodeMinimal>) => {
      setStore((prev) => {
        const next = new Map(prev);
        const node = next.get(nodeId);
        if (node) {
          Object.assign(node, updates);
        }
        return next;
      });
    },
    [],
  );

  // 生成节点序号（直接读取 store，不使用 useCallback 缓存，因为 store 是 Map 引用）
  const getNodeNumber = (nodeId: string): string => {
    const node = store.get(nodeId);
    if (!node) return '1';

    if (!node.parentId) {
      // 根节点：计算是第几个根节点
      const roots = Array.from(store.values()).filter((n) => !n.parentId);
      const index = roots.findIndex((n) => n.id === nodeId);
      return `${index + 1}`;
    } else {
      // 子节点：父序号 + 自己是第几个子节点
      const parent = store.get(node.parentId);
      if (!parent) return '1';
      const siblingIndex = parent.children.findIndex((id) => id === nodeId);
      const parentNumber = getNodeNumber(node.parentId!);
      return `${parentNumber}.${siblingIndex + 1}`;
    }
  };

  return {
    store,
    tree,
    expandedNodes,
    toggleExpand,
    removeNode,
    addChild,
    addRootNode,
    updateNode,
    getNodeNumber,
  };
}
