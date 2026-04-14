import { TaskNode } from '../types';

export interface FlatNode extends TaskNode {
  level: number;
}

/**
 * 将树形结构展平为可见节点列表
 * @param nodes 树形节点数组
 * @param expandedNodes 已展开的节点 ID 集合
 * @returns 展平后的可见节点列表（包含层级信息）
 */
export function flattenVisibleNodes(
  nodes: TaskNode[] | undefined | null,
  expandedNodes: Set<string>,
): FlatNode[] {
  // 处理空值情况
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const result: FlatNode[] = [];

  function traverse(nodeList: TaskNode[], level: number) {
    for (const node of nodeList) {
      // 添加当前节点
      result.push({
        ...node,
        level,
      });

      // 如果节点已展开且有子节点，递归处理子节点
      if (
        expandedNodes.has(node.id) &&
        node.children &&
        node.children.length > 0
      ) {
        traverse(node.children, level + 1);
      }
    }
  }

  traverse(nodes, 0);
  return result;
}

/**
 * 估算节点高度（用于虚拟滚动的初始高度）
 * @param node 节点数据
 * @param isEditorExpanded 编辑器是否展开
 * @returns 节点高度（像素）
 */
export function estimateNodeHeight(
  node: FlatNode,
  isEditorExpanded: boolean,
): number {
  // 基础高度：节点头部约 48px
  const baseHeight = 48;

  if (!isEditorExpanded) {
    return baseHeight;
  }

  // 编辑器展开后的高度：根据内容长度估算
  // CodeMirror 编辑器最小高度约 200px，最大约 600px
  const contentLines = node.content.split('\n').length;
  const editorHeight = Math.min(Math.max(contentLines * 20, 200), 600);

  return baseHeight + editorHeight + 16; // 16px 为间距
}

/**
 * 获取节点的实际高度（用于动态高度调整）
 * @param nodeId 节点 ID
 * @param expandedEditorId 当前展开的编辑器 ID
 * @param nodeHeightsRef 节点高度缓存 Ref
 * @returns 节点高度
 */
export function getNodeActualHeight(
  nodeId: string,
  expandedEditorId: string | null,
  nodeHeightsRef: React.MutableRefObject<Map<string, number>>,
): number {
  const isExpanded = expandedEditorId === nodeId;

  // 如果已有缓存，返回缓存值
  if (nodeHeightsRef.current.has(nodeId)) {
    const cachedHeight = nodeHeightsRef.current.get(nodeId)!;
    // 如果展开状态改变，需要重新计算
    if (isExpanded && cachedHeight < 300) {
      return 220; // 展开时返回编辑器实际高度（100px + 工具栏 + 依赖配置 + 按钮区）
    }
    if (!isExpanded && cachedHeight > 300) {
      return 48; // 折叠时返回基础高度
    }
    return cachedHeight;
  }

  // 默认高度
  return isExpanded ? 220 : 48;
}
