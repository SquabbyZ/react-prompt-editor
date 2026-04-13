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

  // 基础操作
  initialize: (nodes: TaskNode[]) => void;
  updateNode: (nodeId: string, updates: Partial<TaskNodeMinimal>) => void;
  removeNode: (nodeId: string) => void;
  addChild: (parentId: string) => string;
  addRootNode: () => string;

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

    // 初始化数据
    initialize: (nodes: TaskNode[]) => {
      set({ store: arrayToMap(nodes) });
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
        return { store };
      });
      return newNodeId;
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
      return mapToArray(get().store);
    },

    // 生成节点序号
    getNodeNumber: (nodeId) => {
      const store = get().store;
      const node = store.get(nodeId);
      if (!node) return '1';

      if (!node.parentId) {
        const roots = Array.from(store.values()).filter((n) => !n.parentId);
        const index = roots.findIndex((n) => n.id === nodeId);
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
