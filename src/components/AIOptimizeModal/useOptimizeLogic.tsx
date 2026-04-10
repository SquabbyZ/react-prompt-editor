import {
  CopyOutlined,
  DislikeOutlined,
  LikeOutlined,
  ReloadOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import { Button, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useStreamParser } from '../../hooks/useStreamParser';
import {
  ChatMessage,
  createOptimizeStore,
  OptimizeStoreType,
} from '../../stores';
import { OptimizeConfig, OptimizeRequest, OptimizeResponse } from '../../types';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface UseOptimizeLogicProps {
  originalContent: string;
  selectedContent?: string;
  optimizeConfig?: OptimizeConfig;
  onOptimizeRequest?: (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => void;
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
  const { t } = useI18n();
  const { parseLine, reset: resetParser } = useStreamParser();

  const storeRef = useRef<OptimizeStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createOptimizeStore();
  }
  const store = storeRef.current;

  const messages = store((state) => state.messages);
  const inputValue = store((state) => state.inputValue);
  const isStreaming = store((state) => state.isStreaming);
  const isGenerating = store((state) => state.isGenerating);
  const currentResponse = store((state) => state.currentResponse);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true); // 是否应该自动滚动
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingStateRef = useRef({ isStarted: false });

  // 选区状态
  const [selectedTexts, setSelectedTexts] = useState<string[]>([]);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleStreamingResponse = (response: OptimizeResponse) => {
    const newText = response.optimizedContent || '';

    if (response.done) {
      streamingStateRef.current.isStarted = false;
      store
        .getState()
        .finishStreaming(newText || store.getState().currentResponse);
      return;
    }

    if (!newText) return;

    if (!streamingStateRef.current.isStarted) {
      streamingStateRef.current.isStarted = true;
      store.getState().startStreaming();
    }

    store.getState().updateCurrentResponse(newText);
  };

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    streamingStateRef.current.isStarted = false;
    store.getState().stopStreaming();
  };

  const handleSendMessageFromContent = (content: string) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    const platform = optimizeConfig?.platform || 'auto';
    const isStream = optimizeConfig?.stream !== false;

    const defaultSystemPrompt = selectedContent
      ? `选中的内容：\n\n# 原始内容\n\n${selectedContent}\n\n需求的内容：{userInstruction}`
      : `待优化内容：\n\n# 原始内容\n\n${originalContent}\n\n需求的内容：{userInstruction}`;

    const structuredMessages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [
      {
        role: 'user',
        content: (optimizeConfig?.systemPrompt ?? defaultSystemPrompt).replace(
          '{userInstruction}',
          content,
        ),
      },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];

    if (onOptimizeRequest) {
      onOptimizeRequest(
        {
          content: originalContent,
          selectedText: selectedContent,
          instruction: content,
          messages: structuredMessages,
          signal,
        },
        {
          onResponse: (response) => {
            if (signal.aborted) return;
            handleStreamingResponse(response);
          },
          onError: () => {
            if (signal.aborted) return;
            message.error(t('optimize.optimizeFailed'));
            store.getState().stopStreaming();
          },
        },
      );
      return;
    }

    if (!optimizeConfig?.url) {
      message.error(t('optimize.provideConfigOrCallback'));
      store.getState().stopStreaming();
      return;
    }

    const {
      url,
      headers = {},
      model,
      temperature,
      extraParams,
    } = optimizeConfig;
    const requestBody: Record<string, any> = {
      messages: structuredMessages,
      temperature: temperature ?? 0.7,
      stream: isStream,
      ...extraParams,
    };
    if (model) requestBody.model = model;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(requestBody),
      signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        if (!isStream) {
          const json = await response.json();
          handleStreamingResponse({
            optimizedContent:
              json.choices?.[0]?.message?.content || json.content || '',
            done: true,
          });
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('ReadableStream not supported');
        const decoder = new TextDecoder();
        let accumulatedContent = '';
        resetParser();

        const readStream = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                handleStreamingResponse({
                  optimizedContent: accumulatedContent,
                  done: true,
                });
                return;
              }
              const chunk = decoder.decode(value, { stream: true });
              for (const line of chunk.split('\n')) {
                const result = parseLine(line.trim(), platform);
                if (result.text) accumulatedContent += result.text;
                if (result.isDone) {
                  handleStreamingResponse({
                    optimizedContent: accumulatedContent,
                    done: true,
                  });
                  return;
                }
                if (result.error) {
                  message.error(result.error);
                  handleStopResponse();
                  store.getState().addMessage({
                    id: `error-${Date.now()}`,
                    role: 'assistant',
                    content: `[系统中断] ${result.error}`,
                    timestamp: Date.now(),
                  });
                  return;
                }
              }
              if (accumulatedContent)
                handleStreamingResponse({
                  optimizedContent: accumulatedContent,
                });
              readStream();
            })
            .catch((error) => {
              if (error.name !== 'AbortError') {
                message.error(t('optimize.optimizeFailed'));
                store.getState().stopStreaming();
              }
            });
        };
        readStream();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          message.error(t('optimize.optimizeFailed'));
          store.getState().stopStreaming();
        }
      });
  };

  const handleSendMessage = async (forcedContent?: string) => {
    const userMessageContent =
      typeof forcedContent === 'string' ? forcedContent : inputValue.trim();
    if (!userMessageContent || isGenerating) return;
    store.getState().addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now(),
    });
    store.getState().clearInput();
    store.getState().startStreaming();
    await handleSendMessageFromContent(
      selectedContent
        ? `${userMessageContent}\n\n选中的内容：\n\n${selectedContent}`
        : userMessageContent,
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success(t('optimize.copied'));
  };

  const handleRegenerate = () => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.role === 'user');
      if (lastUserMessage) {
        store.getState().removeLastAssistantMessage();
        store.getState().startStreaming();
        setTimeout(
          () => handleSendMessageFromContent(lastUserMessage.content),
          100,
        );
      }
    }
  };

  const handleApply = (
    onApply: (content: string) => void,
    onClose: () => void,
  ) => {
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant');
    if (lastAssistantMessage?.content) {
      onApply(lastAssistantMessage.content);
      message.success(t('optimize.contentApplied'));
      onClose();
    } else {
      message.warning(t('optimize.noOptimizeContent'));
    }
  };

  // 整段替换：替换完整的 AI 回复
  const handleFullReplace = (
    content: string,
    onApply: (content: string) => void,
    onClose: () => void,
  ) => {
    if (!content) {
      message.warning(t('optimize.noOptimizeContent'));
      return;
    }
    onApply(content);
    message.success(t('optimize.contentApplied'));
    onClose();
  };

  // 处理文本选中
  const handleTextSelection = (
    texts: string[],
    position: { top: number; left: number },
  ) => {
    setSelectedTexts(texts);
    setToolbarPosition(position);
    setToolbarVisible(true);
  };

  // 清除选区
  const clearSelection = () => {
    setSelectedTexts([]);
    setToolbarVisible(false);
    setToolbarPosition(null);
  };

  // 选中替换：替换选中的文本（支持多段拼接）
  const handleSelectionReplace = (
    onApply: (content: string) => void,
    onClose: () => void,
  ) => {
    if (selectedTexts.length === 0) {
      message.warning('请先选择要替换的内容');
      return;
    }

    try {
      // 拼接多段文本，用换行符分隔
      const combinedText = selectedTexts.join('\n');
      onApply(combinedText);
      message.success(t('optimize.contentApplied'));
    } catch (error) {
      console.error('🔴 替换操作失败:', error);
      message.error('替换失败，请重试');
    } finally {
      // 确保无论成功还是失败，都关闭弹窗
      onClose();
    }
  };

  const renderMessageContent = (
    content: string,
    key?: React.Key,
    onFullReplace?: (content: string) => void,
  ) => {
    const showActions = key !== undefined && key !== null;
    return (
      <div>
        <MarkdownRenderer content={content} />
        {showActions && (
          <div className="mt-2 flex items-center justify-end gap-1 border-t border-gray-100 pt-2 dark:border-gray-700">
            <Button
              type="text"
              size="small"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(content)}
              className="h-6 text-gray-500 hover:text-indigo-500"
            />
            <Button
              type="text"
              size="small"
              icon={<ReloadOutlined />}
              onClick={handleRegenerate}
              className="h-6 text-gray-500 hover:text-indigo-500"
            />
            <Button
              type="text"
              size="small"
              icon={<LikeOutlined />}
              onClick={() => onLike?.(key as string)}
              className="h-6 text-gray-500 hover:text-green-500"
            />
            <Button
              type="text"
              size="small"
              icon={<DislikeOutlined />}
              onClick={() => onDislike?.(key as string)}
              className="h-6 text-gray-500 hover:text-red-500"
            />
            <Button
              type="text"
              size="small"
              icon={<SwapOutlined />}
              onClick={() => onFullReplace?.(content)}
              className="h-6 text-gray-500 hover:text-indigo-500"
              title="替换整段内容"
            />
          </div>
        )}
      </div>
    );
  };

  const roleConfig: Record<string, any> = {
    user: {
      placement: 'end',
      variant: 'filled',
      shape: 'corner',
      avatar: (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm">
          👤
        </div>
      ),
      styles: {
        content: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
        },
      },
    },
    assistant: {
      placement: 'start',
      variant: 'outlined',
      shape: 'corner',
      avatar: (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-sm">
          ✨
        </div>
      ),
      typing:
        isStreaming || !optimizeConfig?.stream
          ? { step: 2, interval: 50 }
          : false,
      styles: {
        content: {
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        },
      },
      loadingRender: () => <Bubble loading={true} content="" />,
    },
  };

  const bubbleItems = messages.map((msg) => {
    const config = roleConfig[msg.role] || {};
    return {
      key: msg.id,
      content:
        msg.role === 'assistant'
          ? renderMessageContent(
              msg.content,
              msg.id,
              onApply && onClose
                ? (content) => handleFullReplace(content, onApply, onClose)
                : undefined,
            )
          : msg.content,
      role: msg.role,
      ...config,
    };
  });

  // 如果正在流式生成
  if (isStreaming) {
    if (currentResponse) {
      // 有内容时显示流式响应
      bubbleItems.push({
        key: 'streaming-response',
        content: renderMessageContent(currentResponse),
        role: 'assistant',
        ...roleConfig.assistant,
      });
    } else {
      // 无内容时显示 loading 气泡
      bubbleItems.push({
        key: 'streaming-loading',
        content: '',
        role: 'assistant',
        ...roleConfig.assistant,
        loading: true,
      });
    }
  }

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
