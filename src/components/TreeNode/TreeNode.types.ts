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
}
