import React, { useEffect, useRef } from 'react';
import { ChatMessage, OptimizeStoreType } from '../../stores';
import { OptimizeConfig, OptimizeRequest } from '../../types';
import { useBubbleItems } from './useBubbleItems';
import { useMessageActions } from './useMessageActions';
import { useOptimizeAPI, useOptimizeStore } from './useOptimizeAPI';
import { useSelectionState } from './useSelectionState';

export interface UseOptimizeLogicProps {
  originalContent: string;
  selectedContent?: string;
  optimizeConfig?: OptimizeConfig;
  onOptimizeRequest?: (request: OptimizeRequest) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
  onApply?: (content: string) => void;
  onClose?: () => void;
}

export interface UseOptimizeLogicReturn {
  store: OptimizeStoreType;
  messages: ChatMessage[];
  inputValue: string;
  isStreaming: boolean;
  isGenerating: boolean;
  currentResponse: string;
  bubbleItems: any[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
  handleSendMessage: (forcedContent?: string) => Promise<void>;
  handleStopResponse: () => void;
  handleCopy: (content: string) => void;
  handleRegenerate: () => void;
  handleApply: (
    onApply: (content: string) => void,
    onClose: () => void,
  ) => void;
  renderMessageContent: (
    content: string,
    key?: React.Key,
    onFullReplace?: (content: string) => void,
  ) => React.ReactNode;
  // 选区相关
  selectedTexts: string[];
  toolbarVisible: boolean;
  toolbarPosition: { top: number; left: number } | null;
  handleTextSelection: (
    texts: string[],
    position: { top: number; left: number },
  ) => void;
  clearSelection: () => void;
  handleSelectionReplace: (
    onApply: (content: string) => void,
    onClose: () => void,
  ) => void;
}

export const useOptimizeLogic = ({
  originalContent,
  selectedContent,
  optimizeConfig,
  onOptimizeRequest,
  onLike,
  onDislike,
  onApply,
  onClose,
}: UseOptimizeLogicProps): UseOptimizeLogicReturn => {
  // 1. 管理 Store 和暗色模式
  const { store } = useOptimizeStore();

  // 2. 从 store 中获取状态
  const messages = store((state) => state.messages);
  const inputValue = store((state) => state.inputValue);
  const isStreaming = store((state) => state.isStreaming);
  const isGenerating = store((state) => state.isGenerating);
  const currentResponse = store((state) => state.currentResponse);

  // 3. API 调用逻辑
  const { handleStopResponse, handleSendMessageFromContent } = useOptimizeAPI({
    store,
    originalContent,
    selectedContent,
    optimizeConfig,
    onOptimizeRequest,
    onApplyOptimizedContent: onApply,
    onCloseOptimizeDialog: onClose,
    messages: messages.map((msg) => ({ role: msg.role, content: msg.content })),
  });

  // 4. 消息操作（发送、复制、重新生成、应用）
  const {
    handleSendMessage,
    handleCopy,
    handleRegenerate,
    handleApply,
    handleFullReplace,
  } = useMessageActions({
    store,
    handleSendMessageFromContent,
    selectedContent,
  });

  // 5. 选区状态管理
  const {
    selectedTexts,
    toolbarVisible,
    toolbarPosition,
    handleTextSelection,
    clearSelection,
    handleSelectionReplace,
  } = useSelectionState();

  // 6. 气泡列表生成
  const { bubbleItems } = useBubbleItems({
    messages,
    isStreaming,
    currentResponse,
    onFullReplace:
      onApply && onClose
        ? (content) => handleFullReplace(content, onApply, onClose)
        : undefined,
    onLike,
    onDislike,
  });

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  // 处理滚动事件
  const handleScroll = () => {
    const element = scrollContainerRef.current;
    if (!element) return;

    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 50;

    // 如果滚动到底部，恢复自动滚动
    if (isAtBottom) {
      shouldAutoScrollRef.current = true;
    } else {
      // 如果向上滚动，停止自动滚动
      shouldAutoScrollRef.current = false;
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (shouldAutoScrollRef.current && scrollContainerRef.current) {
      const element = scrollContainerRef.current;
      element.scrollTop = element.scrollHeight;
    }
  }, [messages, currentResponse]);

  // 渲染消息内容（保持向后兼容）
  const renderMessageContent = () => {
    // 这个函数主要用于外部调用，实际渲染由 useBubbleItems 处理
    // 这里保留是为了向后兼容
    return null;
  };

  return {
    store,
    messages,
    inputValue,
    isStreaming,
    isGenerating,
    currentResponse,
    bubbleItems,
    messagesEndRef,
    scrollContainerRef,
    handleScroll,
    handleSendMessage,
    handleStopResponse,
    handleCopy,
    handleRegenerate,
    handleApply,
    renderMessageContent,
    selectedTexts,
    toolbarVisible,
    toolbarPosition,
    handleTextSelection,
    clearSelection,
    handleSelectionReplace,
  };
};
