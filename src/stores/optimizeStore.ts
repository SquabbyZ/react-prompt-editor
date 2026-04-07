import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';

/**
 * 聊天消息类型
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * 优化 Store 接口
 */
export interface OptimizeStore {
  // 状态
  messages: ChatMessage[];
  inputValue: string;
  isStreaming: boolean;
  isGenerating: boolean;
  currentResponse: string;
  originalContent: string;
  selectedContent?: string;

  // 消息操作
  addMessage: (message: ChatMessage) => void;
  removeLastAssistantMessage: () => void;
  clearMessages: () => void;

  // 流式输出
  startStreaming: () => void;
  updateCurrentResponse: (text: string) => void;
  finishStreaming: (fullText: string) => void;
  stopStreaming: () => void;

  // 输入操作
  setInputValue: (value: string) => void;
  clearInput: () => void;

  // 初始化
  initialize: (originalContent: string, selectedContent?: string) => void;
}

/**
 * 创建优化 Store（支持多实例）
 * 每个 AIOptimizeModal 实例创建独立的 store
 */
export function createOptimizeStore() {
  return create<OptimizeStore>((set) => ({
    // 初始状态
    messages: [],
    inputValue: '',
    isStreaming: false,
    isGenerating: false,
    currentResponse: '',
    originalContent: '',
    selectedContent: undefined,

    // 初始化
    initialize: (originalContent, selectedContent) => {
      set({
        messages: [],
        inputValue: '',
        isStreaming: false,
        isGenerating: false,
        currentResponse: '',
        originalContent,
        selectedContent,
      });
    },

    // 添加消息
    addMessage: (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    // 移除最后一条 AI 消息
    removeLastAssistantMessage: () => {
      set((state) => {
        const newMessages = [...state.messages];
        const lastIndex = newMessages
          .map((msg, idx) => ({ msg, idx }))
          .reverse()
          .find((item) => item.msg.role === 'assistant')?.idx;

        if (lastIndex !== undefined) {
          newMessages.splice(lastIndex, 1);
        }
        return { messages: newMessages };
      });
    },

    // 清空消息
    clearMessages: () => {
      set({ messages: [] });
    },

    // 开始流式输出
    startStreaming: () => {
      set({
        isStreaming: true,
        isGenerating: true,
        currentResponse: '',
      });
    },

    // 更新当前响应（流式）
    updateCurrentResponse: (text) => {
      set({ currentResponse: text });
    },

    // 完成流式输出
    finishStreaming: (fullText) => {
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: fullText,
        timestamp: Date.now(),
      };
      set((state) => ({
        messages: [...state.messages, assistantMessage],
        currentResponse: '',
        isStreaming: false,
        isGenerating: false,
      }));
    },

    // 停止流式输出
    stopStreaming: () => {
      set((state) => {
        const newState: Partial<OptimizeStore> = {
          isStreaming: false,
          isGenerating: false,
        };

        // 如果有未完成的响应，保存为消息
        if (state.currentResponse) {
          const assistantMessage: ChatMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: state.currentResponse,
            timestamp: Date.now(),
          };
          newState.messages = [...state.messages, assistantMessage];
          newState.currentResponse = '';
        }

        return newState;
      });
    },

    // 设置输入值
    setInputValue: (value) => {
      set({ inputValue: value });
    },

    // 清空输入
    clearInput: () => {
      set({ inputValue: '' });
    },
  }));
}

/**
 * Store 类型（用于 TypeScript 推断）
 */
export type OptimizeStoreType = ReturnType<typeof createOptimizeStore>;
