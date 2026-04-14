import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { NodeStore, TaskNode, TaskNodeMinimal } from '../types';
import { arrayToMap, mapToArray } from '../utils/tree-utils';

/**
 * 编辑器 Store 接口
 */
export interface EditorStore {
  // 状态
  store: NodeStore;
  rootOrder: string[]; // 根节点顺序

  // 基础操作
  initialize: (nodes: TaskNode[]) => void;
  updateNode: (nodeId: string, updates: Partial<TaskNodeMinimal>) => void;
  removeNode: (nodeId: string) => void;
  addChild: (parentId: string) => string;
  addRootNode: () => string;
  moveNode: (nodeId: string, parentId: string | null, index: number) => void;

  // 查询方法
  getNode: (nodeId: string) => TaskNodeMinimal | undefined;
  getAllNodes: () => TaskNodeMinimal[];
  getTree: () => TaskNode[];
  getNodeNumber: (nodeId: string) => string;
}

/**
 * 创建编辑器 Store（支持多实例）
 * 每个 PromptEditor 组件实例创建独立的 store
 */
export function createEditorStore(initialValue: TaskNode[] = []) {
  return create<EditorStore>((set, get) => ({
    // 初始状态
    store: arrayToMap(initialValue),
    rootOrder: initialValue.filter((n) => !n.parentId).map((n) => n.id),

    // 初始化数据
    initialize: (nodes: TaskNode[]) => {
      set({
        store: arrayToMap(nodes),
        rootOrder: nodes.filter((n) => !n.parentId).map((n) => n.id),
      });
    },

    // 更新节点
    updateNode: (nodeId, updates) => {
      set((state) => {
        const store = new Map(state.store);
        const node = store.get(nodeId);
        if (node) {
          Object.assign(node, updates);
        }
        return { store };
      });
    },

    // 删除节点
    removeNode: (nodeId) => {
      set((state) => {
        const store = new Map(state.store);
        const node = store.get(nodeId);

        if (node?.parentId) {
          const parent = store.get(node.parentId);
          if (parent) {
            parent.children = parent.children.filter((id) => id !== nodeId);
          }
        }

        // 递归删除子节点
        function deleteChildren(id: string) {
          const node = store.get(id);
          if (node) {
            node.children.forEach(deleteChildren);
            store.delete(id);
          }
        }

        deleteChildren(nodeId);
        return { store };
      });
    },

    // 添加子标题
    addChild: (parentId) => {
      let newNodeId = '';
      set((state) => {
        const store = new Map(state.store);
        const parentNode = store.get(parentId);
        if (!parentNode) return state;

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

        store.set(newNodeId, newNode);
        parentNode.children = [...parentNode.children, newNodeId];
        return { store };
      });
      return newNodeId;
    },

    // 添加根节点
    addRootNode: () => {
      let newNodeId = '';
      set((state) => {
        const store = new Map(state.store);
        newNodeId = `${uuidv4()}`;
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

        store.set(newNodeId, newNode);
        return {
          store,
          rootOrder: [...state.rootOrder, newNodeId],
        };
      });
      return newNodeId;
    },

    // 移动节点
    moveNode: (nodeId, parentId, index) => {
      set((state) => {
        const store = new Map(state.store);
        const node = store.get(nodeId);
        if (!node) return state;

        // 防止循环依赖：不能将节点移动到自己的子节点下
        function isDescendant(parentId: string, targetId: string): boolean {
          const parent = store.get(parentId);
          if (!parent) return false;
          if (parent.children.includes(targetId)) return true;
          return parent.children.some((childId) =>
            isDescendant(childId, targetId),
          );
        }

        if (parentId && isDescendant(nodeId, parentId)) {
          return state; // 不允许循环依赖
        }

        let newRootOrder = [...state.rootOrder];
        let adjustedIndex = index;

        // 1. 从原位置移除
        if (node.parentId === (parentId || undefined)) {
          // 如果在同一个父节点下移动，且是从上往下移，需要调整索引
          // 因为移除操作会使后面的元素索引减 1
          let oldIndex = -1;
          if (node.parentId) {
            const p = store.get(node.parentId);
            oldIndex = p?.children.indexOf(nodeId) ?? -1;
          } else {
            oldIndex = state.rootOrder.indexOf(nodeId);
          }

          if (oldIndex !== -1 && oldIndex < index) {
            adjustedIndex = index - 1;
          }
        }

        if (node.parentId) {
          // 从原父节点的 children 中移除
          const oldParent = store.get(node.parentId);
          if (oldParent) {
            oldParent.children = oldParent.children.filter(
              (id) => id !== nodeId,
            );
          }
        } else {
          // 从根节点顺序中移除
          newRootOrder = newRootOrder.filter((id) => id !== nodeId);
        }

        // 2. 更新节点位置
        node.parentId = parentId || undefined;

        if (parentId) {
          // 移动到有父节点的位置
          const newParent = store.get(parentId);
          if (newParent) {
            const children = [...newParent.children];
            // 先过滤掉目标节点（如果存在）
            const filteredChildren = children.filter((id) => id !== nodeId);
            // 在指定位置插入
            filteredChildren.splice(adjustedIndex, 0, nodeId);
            newParent.children = filteredChildren;
          }
        } else {
          // 移动到根节点位置
          // 在指定位置插入
          newRootOrder.splice(adjustedIndex, 0, nodeId);
        }

        return { store, rootOrder: newRootOrder };
      });
    },

    // 获取节点
    getNode: (nodeId) => {
      return get().store.get(nodeId);
    },

    // 获取所有节点
    getAllNodes: () => {
      return Array.from(get().store.values());
    },

    // 获取树形结构
    getTree: () => {
      const { store, rootOrder } = get();
      return mapToArray(store, rootOrder);
    },

    // 生成节点序号
    getNodeNumber: (nodeId) => {
      const { store, rootOrder } = get();
      const node = store.get(nodeId);
      if (!node) return '1';

      if (!node.parentId) {
        // 根节点：根据 rootOrder 计算是第几个根节点
        const order =
          rootOrder ||
          Array.from(store.values())
            .filter((n) => !n.parentId)
            .map((n) => n.id);
        const index = order.findIndex((id) => id === nodeId);
        return `${index + 1}`;
      } else {
        const parent = store.get(node.parentId);
        if (!parent) return '1';
        const siblingIndex = parent.children.findIndex((id) => id === nodeId);
        const parentNumber = get().getNodeNumber(node.parentId!);
        return `${parentNumber}.${siblingIndex + 1}`;
      }
    },
  }));
}

/**
 * Store 类型（用于 TypeScript 推断）
 */
export type EditorStoreType = ReturnType<typeof createEditorStore>;
