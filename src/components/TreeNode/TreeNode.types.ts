import { TaskNodeMinimal } from '../../types';

export interface TreeNodeProps {
  node: TaskNodeMinimal;
  number: string;
  isExpanded: boolean;
  isLocked: boolean;
  hasRun: boolean;
  onToggle: () => void;
  onContentChange: (content: string) => void;
  onRun: () => void;
  onLock: () => void;
  onOptimize: () => void;
  onDelete: () => void;
  /**
   * 004-parent-deletion-blocked-by-child-lock:
   * 当前节点的任意后代是否被锁定。true 时删除按钮必须 disabled。
   * 可选 prop，向后兼容；未提供时视为 false。
   */
  hasLockedDescendant?: boolean;
  /**
   * 004-parent-deletion-blocked-by-child-lock:
   * 当删除被禁用时的 tooltip 文本（i18n 后的字符串）。
   * 未提供时回退到"删除"。
   */
  deleteTooltip?: string;
}
