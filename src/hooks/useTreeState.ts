import { useCallback, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { NodeStore, TaskNode, TaskNodeMinimal } from '../types';
import {
  arrayToMap,
  hasLockedDescendant,
  mapToArray,
} from '../utils/tree-utils';

export interface UseTreeStateReturn {
  store: NodeStore;
  tree: TaskNode[];
  expandedNodes: Set<string>;
  toggleExpand: (nodeId: string) => void;
  /**
   * 删除节点。返回 boolean：
   * - true: 实际执行了删除
   * - false: 节点不存在，或被删节点存在锁定后代（防御性拒绝）
   */
  removeNode: (nodeId: string) => boolean;
  addChild: (parentId: string) => string; // 返回新节点的 ID
  addRootNode: () => string; // 添加根节点，返回新节点的 ID
  updateNode: (nodeId: string, updates: Partial<TaskNodeMinimal>) => void;
  getNodeNumber: (nodeId: string) => string;
  /**
   * 004-parent-deletion-blocked-by-child-lock:
   * 给定 id，查询该节点的任意后代是否被锁定。
   * 用于 UI 层（TreeNode / NodeActions）判断"祖先链是否要禁用删除"。
   * 复杂度 O(subtree)，不要在每节点重扫整棵树——上层应在 useMemo 中调用。
   */
  hasLockedDescendant: (nodeId: string) => boolean;
}

export function useTreeState(
  initialValue: TaskNode[] = [],
): UseTreeStateReturn {
  const [store, setStore] = useState<NodeStore>(() => arrayToMap(initialValue));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 始终指向最新 store，避免 useCallback 闭包过期
  const storeRef = useRef<NodeStore>(store);
  storeRef.current = store;

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

  // 添加子标题
  const addChild = useCallback((parentId: string): string => {
    let newNodeId = '';
    setStore((prev) => {
      const next = new Map(prev);
      const parentNode = next.get(parentId);
      if (!parentNode) return prev;

      // 使用 UUID v4 生成唯一 ID，确保全局唯一性和分布式场景稳定性
      // 示例："6ba7b810-9dad-11d1-80b4-00c04fd430c8"
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
      // 示例："root-550e8400-e29b-41d4-a716-446655440000"
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
  const removeNode = useCallback((nodeId: string): boolean => {
    // 防御性拒绝：节点不存在 / 自身或后代被锁定时直接返回 false
    const current = storeRef.current;
    if (!current.has(nodeId)) return false;
    if (hasLockedDescendant(null, current, nodeId)) return false;

    setStore((prev) => {
      const next = new Map(prev);
      const node = next.get(nodeId);
      if (!node) return prev;

      if (node.parentId) {
        const parent = next.get(node.parentId);
        if (parent) {
          parent.children = parent.children.filter((id) => id !== nodeId);
        }
      }

      // 递归删除子节点
      function deleteChildren(id: string) {
        const n = next.get(id);
        if (n) {
          n.children.forEach(deleteChildren);
          next.delete(id);
        }
      }

      deleteChildren(nodeId);
      return next;
    });
    return true;
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

  /**
   * 004-parent-deletion-blocked-by-child-lock:
   * 给定 id，查询该节点的任意后代是否被锁定。
   * 复杂度 O(subtree)；调用方应自行 memo，避免每节点扫整棵树。
   * 未使用 useCallback 包装：函数依赖当前 store，引用频繁变化无意义，
   * 由 React 渲染时直接调用即可。
   */
  const hasLockedDescendantFn = (nodeId: string): boolean => {
    return hasLockedDescendant(null, store, nodeId);
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
    hasLockedDescendant: hasLockedDescendantFn,
  };
}
