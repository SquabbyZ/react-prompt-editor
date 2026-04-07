/**
 * 内部存储结构（扁平化）
 */
export interface TaskNodeMinimal {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children: string[]; // 子节点 ID 数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies: string[]; // 依赖节点 ID 数组
}

/**
 * 对外 API 结构（树形嵌套）
 */
export interface TaskNode {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: TaskNode[]; // 嵌套子节点数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies?: string[];
}

/**
 * 节点存储类型
 */
export type NodeStore = Map<string, TaskNodeMinimal>;

export interface DependencyInfo {
  nodeId: string;
  title: string;
  content: string;
  hasRun: boolean;
}

export interface RunTaskRequest {
  nodeId: string;
  content: string;
  dependenciesContent: DependencyInfo[];
  stream?: boolean;
  meta?: Record<string, unknown>;
}

export interface RunTaskResponse {
  result: string;
  stream?: boolean;
  meta?: Record<string, unknown>;
}

export interface OptimizeRequest {
  content: string;
  selectedText?: string;
  instruction?: string;
  meta?: Record<string, unknown>;
}

export interface OptimizeResponse {
  optimizedContent: string;
  thinkingProcess?: string;
  meta?: Record<string, unknown>;
}

export interface PromptEditorProps {
  initialValue?: TaskNode[];
  value?: TaskNode[];
  onChange?: (data: TaskNode[]) => void;
  runAPI?: (req: RunTaskRequest) => Promise<RunTaskResponse>;
  optimizeAPI?: (req: OptimizeRequest) => Promise<OptimizeResponse>;
  onNodeRun?: (nodeId: string, result: RunTaskResponse) => void;
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  onNodeLock?: (nodeId: string, isLocked: boolean) => void;
  onTreeChange?: (tree: TaskNode[]) => void;
  theme?: 'default' | 'ant-design';
  className?: string;
  style?: React.CSSProperties;
  /**
   * 自定义顶部工具栏内容
   * @param actions 内置操作函数
   */
  renderToolbar?: (actions: { addRootNode: () => void }) => React.ReactNode;
}
