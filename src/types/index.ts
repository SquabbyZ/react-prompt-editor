import type { Locale } from '../i18n/locales/zh-CN';

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
  /** 流式输出是否完成，用于标记最后一次响应 */
  done?: boolean;
  meta?: Record<string, unknown>;
}

export interface PromptEditorProps {
  initialValue?: TaskNode[];
  value?: TaskNode[];
  onChange?: (data: TaskNode[]) => void;
  /**
   * 运行请求回调
   * 组件触发运行时调用，参数包含请求信息
   * 用户需自行执行异步请求，然后通过 onNodeRun 通知组件结果
   */
  onRunRequest?: (request: RunTaskRequest) => void;
  /**
   * 优化请求回调
   * 组件触发优化时调用，参数包含请求信息和响应回调
   * 用户需自行执行异步请求，多次调用 onResponse 可实现流式输出
   */
  onOptimizeRequest?: (
    request: OptimizeRequest,
    callbacks: {
      /** 流式响应回调，可多次调用实现流式输出 */
      onResponse: (response: OptimizeResponse) => void;
      /** 错误回调 */
      onError: (error: Error) => void;
    },
  ) => void;
  /**
   * 节点运行完成回调
   * 用户执行完运行请求后调用，通知组件更新状态
   */
  onNodeRun?: (nodeId: string, result: RunTaskResponse) => void;
  /**
   * 节点优化完成回调
   * 用户执行完优化请求后调用，通知组件
   */
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  onNodeLock?: (nodeId: string, isLocked: boolean) => void;
  onTreeChange?: (tree: TaskNode[]) => void;
  className?: string;
  style?: React.CSSProperties;
  /**
   * 自定义顶部工具栏内容
   * @param actions 内置操作函数
   */
  renderToolbar?: (actions: { addRootNode: () => void }) => React.ReactNode;
  /**
   * AI 优化消息点赞回调
   * @param messageId 被点赞的消息 ID
   */
  onLike?: (messageId: string) => void;
  /**
   * AI 优化消息点踩回调
   * @param messageId 被点踩的消息 ID
   */
  onDislike?: (messageId: string) => void;
  /**
   * 预览模式 - 只读展示，隐藏所有操作按钮
   * @default false
   */
  previewMode?: boolean;
  /**
   * 国际化配置 - 类似 Ant Design 的语言包
   * @example import zhCN from 'react-prompt-editor/locale/zh-CN';
   * @default zhCN (中文)
   */
  locale?: Locale;
  /**
   * 主题模式 - 控制明亮/暗色主题
   * - 'system': 跟随系统设置（默认）
   * - 'light': 强制明亮模式
   * - 'dark': 强制暗色模式
   * @default 'system'
   */
  theme?: 'system' | 'light' | 'dark';
}
