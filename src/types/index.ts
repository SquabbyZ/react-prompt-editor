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

export interface RunTaskResponse {
  result: string;
  stream?: boolean;
  meta?: Record<string, unknown>;
}

export interface RunTaskRequest {
  nodeId: string;
  content: string;
  dependenciesContent: DependencyInfo[];
  stream?: boolean;
  meta?: {
    /** 节点运行完成回调，用于通知组件更新状态 */
    onNodeRun?: (nodeId: string, result?: RunTaskResponse) => void;
    [key: string]: unknown;
  };
}

export interface OptimizeRequest {
  /** 原始内容 */
  content: string;
  /** 选中的内容（如果有） */
  selectedText?: string;
  /** 当前输入的指令（包含上下文拼接） */
  instruction?: string;
  /** 结构化的对话历史（包含当前指令作为最后一条消息） */
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  /** 取消请求的信号，当用户停止生成或关闭弹窗时触发 */
  signal?: AbortSignal;
  /**
   * optimizeConfig 配置（如果提供了 optimizeConfig 参数）
   * 包含 url、headers、model、temperature、extraParams 等配置信息
   * 用户可以在 onOptimizeRequest 中使用这些配置来自定义请求
   */
  config?: OptimizeConfig;
  /** 其他自定义参数 */
  meta?: Record<string, unknown>;
}

/**
 * AI 优化请求配置（简化模式）
 * 提供此配置后，组件内部自动处理请求和流式显示
 */
export interface OptimizeConfig {
  /** API 请求地址（支持 OpenAI 兼容格式） */
  url: string;
  /**
   * 请求头（通常用于鉴权）
   * 建议通过后端代理转发以保护 API Key，避免在前端直接暴露敏感信息
   */
  headers?: Record<string, string>;
  /** 模型名称 */
  model?: string;
  /** 温度参数 */
  temperature?: number;
  /** 其他自定义参数 */
  extraParams?: Record<string, unknown>;
  /**
   * 是否开启流式输出 (默认 true)
   * 如果后端不支持 SSE，设为 false，前端会自动使用 Bubble 的打字机效果模拟
   */
  stream?: boolean;
  /**
   * 平台类型适配 (默认 'auto')
   * 'openai': 优先解析 choices[0].delta.content
   * 'dify': 优先解析 event: message 和 answer 字段
   * 'bailian': 优先解析阿里百炼的 text 字段和 usage 判断
   * 'auto': 自动探测
   */
  platform?: 'auto' | 'openai' | 'dify' | 'bailian';
  /**
   * 系统提示词模板 (支持 {selectedContent} 和 {userInstruction} 占位符)
   * 默认格式:
   * "选中的内容:\n\n# 原始内容\n\n请尝试使用您的后端接口来优化这段文本。\n\n需求的内容：{userInstruction}"
   */
  systemPrompt?: string;
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
   * AI 优化配置（简化模式）
   * 提供此配置后，组件内部自动处理 SSE 流式请求和显示
   * 如果同时提供了 optimizeConfig 和 onOptimizeRequest，优先使用 onOptimizeRequest
   */
  optimizeConfig?: OptimizeConfig;
  /**
   * 是否在打开优化弹窗时自动开始优化
   * @default true
   */
  autoOptimize?: boolean;
  /**
   * 优化请求回调（高级模式）
   * 组件触发优化时调用，参数包含请求信息和响应回调
   * 用户需自行执行异步请求，多次调用 onResponse 可实现流式输出
   * 优先级高于 optimizeConfig
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
  /**
   * 用户点击"应用"按钮时的回调
   * 当用户确认使用 AI 优化的内容时触发
   */
  onOptimizeApply?: (nodeId: string, optimizedContent: string) => void;
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
