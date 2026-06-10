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

/**
 * 判断一个节点的"任意后代"是否被锁定（自身 isLocked 不会被这个函数判断——那是父规则）。
 *
 * 重要语义：
 * - 只检查 node.children 这个子图。
 * - 不包含 node 自身（即使 node.isLocked === true），因为父规则的"自身被锁定"
 *   已有独立的 UI 路径处理；本函数专用于"被锁定后代的祖先链禁用删除"这一行为约束。
 * - 使用 visited 集合防止循环引用导致栈溢出。
 *
 * 支持两种调用形式：
 * 1. 直接传一个树形 TaskNode：hasLockedDescendant(node)
 * 2. 在 store 索引里按 id 查询：hasLockedDescendant(null, store, id)
 *    这种形式适用于每节点 O(1) 检查某个 id 的子树。
 */
export function hasLockedDescendant(
  node: TaskNode | null | undefined,
  lookup?: NodeStore,
  rootId?: string,
): boolean {
  if (lookup && rootId !== undefined) {
    const root = lookup.get(rootId);
    if (!root) return false;
    return walkWithStore(root, lookup, new Set<string>());
  }
  if (!node) return false;
  return walkNode(node, new Set<string>());
}

function walkNode(node: TaskNode, visited: Set<string>): boolean {
  if (visited.has(node.id)) return false;
  visited.add(node.id);

  if (!node.children || node.children.length === 0) return false;

  for (const child of node.children) {
    if (!child) continue;
    if (child.isLocked) return true;
    if (walkNode(child, visited)) return true;
  }
  return false;
}

function walkWithStore(
  node: TaskNodeMinimal,
  store: NodeStore,
  visited: Set<string>,
): boolean {
  if (visited.has(node.id)) return false;
  visited.add(node.id);

  for (const childId of node.children) {
    const child = store.get(childId);
    if (!child) continue;
    if (child.isLocked) return true;
    if (walkWithStore(child, store, visited)) return true;
  }
  return false;
}
