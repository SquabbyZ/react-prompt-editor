import { NodeStore, TaskNode, TaskNodeMinimal } from '../types';

/**
 * 将树形数组转换为扁平 Map 结构
 */
export function arrayToMap(tree: TaskNode[]): NodeStore {
  const store = new Map<string, TaskNodeMinimal>();

  // 第一次遍历：创建所有节点（不含 children）
  function createNodes(node: TaskNode, parentId?: string) {
    const minimal: TaskNodeMinimal = {
      id: node.id,
      title: node.title,
      content: node.content,
      parentId,
      children: [],
      isLocked: node.isLocked,
      hasRun: node.hasRun,
      dependencies: node.dependencies || [],
    };

    store.set(node.id, minimal);

    if (node.children) {
      node.children.forEach((child) => createNodes(child, node.id));
    }
  }

  tree.forEach((root) => createNodes(root));

  // 第二次遍历：构建父子关系
  store.forEach((node, id) => {
    if (node.parentId) {
      const parent = store.get(node.parentId);
      if (parent) {
        parent.children.push(id); // 只推入 ID，不推入整个节点对象
      }
    }
  });

  return store;
}

/**
 * 将 Map 结构转换为树形数组
 */
export function mapToArray(store: NodeStore, rootOrder?: string[]): TaskNode[] {
  // 递归构建子节点树
  function buildTree(nodeId: string): TaskNode {
    const node = store.get(nodeId);
    if (!node) throw new Error(`Node not found: ${nodeId}`);

    return {
      id: node.id,
      title: node.title,
      content: node.content,
      parentId: node.parentId,
      children: node.children.map(buildTree), // 递归构建子节点
      isLocked: node.isLocked,
      hasRun: node.hasRun,
      dependencies: node.dependencies,
    };
  }

  // 找出所有根节点并转换为树形结构
  // 如果有 rootOrder，按 rootOrder 的顺序返回根节点
  let roots: TaskNode[] = [];

  if (rootOrder && rootOrder.length > 0) {
    // 使用 rootOrder 中的顺序
    roots = rootOrder
      .filter((id) => store.has(id)) // 过滤掉不存在的节点
      .map((id) => buildTree(id));
  } else {
    // 兼容旧逻辑：遍历 store 找到所有根节点
    store.forEach((node) => {
      if (!node.parentId) {
        roots.push(buildTree(node.id));
      }
    });
  }

  return roots;
}
