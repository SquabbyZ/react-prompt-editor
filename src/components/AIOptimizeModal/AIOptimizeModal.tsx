import {
  CloseOutlined,
  CopyOutlined,
  DislikeOutlined,
  FileTextOutlined,
  LikeOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Bubble, Sender, XProvider } from '@ant-design/x';
import { Button, message } from 'antd';
import React, { memo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../hooks/useI18n';
import { createOptimizeStore, OptimizeStoreType } from '../../stores';
import { OptimizeConfig, OptimizeRequest, OptimizeResponse } from '../../types';

interface AIOptimizeModalProps {
  /** 是否显示弹窗 */
  open: boolean;
  /** 关闭弹窗回调 */
  onClose: () => void;
  /** 原始内容 */
  originalContent: string;
  /** 选中的内容（如果有） */
  selectedContent?: string;
  /** 自动开始优化过程（首次打开时自动发送第一条指令） */
  autoStart?: boolean;
  /** AI 优化配置（简化模式） */
  optimizeConfig?: OptimizeConfig;
  /** AI 优化请求回调（高级模式） */
  onOptimizeRequest?: (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => void;
  /** 应用优化结果回调 */
  onApply: (optimizedContent: string) => void;
  /** 点赞回调 */
  onLike?: (messageId: string) => void;
  /** 点踩回调 */
  onDislike?: (messageId: string) => void;
}

export const AIOptimizeModal: React.FC<AIOptimizeModalProps> = ({
  open,
  onClose,
  originalContent,
  selectedContent,
  autoStart = true,
  optimizeConfig,
  onOptimizeRequest,
  onApply,
  onLike,
  onDislike,
}) => {
  // 国际化 Hook
  const { t } = useI18n();
  // 为每个弹窗实例创建独立的 store
  const storeRef = useRef<OptimizeStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createOptimizeStore();
  }
  const store = storeRef.current;

  // 订阅 Zustand store
  const messages = store((state) => state.messages);
  const inputValue = store((state) => state.inputValue);
  const isStreaming = store((state) => state.isStreaming);
  const isGenerating = store((state) => state.isGenerating);
  const currentResponse = store((state) => state.currentResponse);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // 流式输出状态追踪
  const streamingStateRef = useRef({
    isStarted: false,
    mode: 'auto' as 'auto' | 'direct' | 'simulate', // auto=自动判断, direct=直接更新, simulate=模拟流式
    timer: null as NodeJS.Timeout | null,
  });

  // 取消模拟流式
  const cancelSimulation = () => {
    if (streamingStateRef.current.timer) {
      clearTimeout(streamingStateRef.current.timer);
      streamingStateRef.current.timer = null;
    }
  };

  // 模拟流式输出（仅用于单次完整响应）
  const simulateStreaming = (fullText: string) => {
    let index = 0;
    const chunkSize = 5;
    const interval = 30;

    const tick = () => {
      if (
        !streamingStateRef.current.isStarted ||
        streamingStateRef.current.mode !== 'simulate'
      ) {
        streamingStateRef.current.timer = null;
        return;
      }

      if (index >= fullText.length) {
        streamingStateRef.current.timer = null;
        streamingStateRef.current.isStarted = false;
        store.getState().finishStreaming(fullText);
        return;
      }

      const chunk = fullText.slice(index, index + chunkSize);
      const currentResponse = store.getState().currentResponse;
      store.getState().updateCurrentResponse(currentResponse + chunk);
      index += chunkSize;

      streamingStateRef.current.timer = setTimeout(tick, interval);
    };

    tick();
  };

  // 处理流式响应
  const handleStreamingResponse = (response: OptimizeResponse) => {
    const newText = response.optimizedContent || '';

    // 处理完成信号
    if (response.done) {
      if (streamingStateRef.current.mode === 'simulate') {
        cancelSimulation();
      }
      streamingStateRef.current.isStarted = false;
      store
        .getState()
        .finishStreaming(newText || store.getState().currentResponse);
      return;
    }

    if (!newText) return;

    // 首次响应
    if (!streamingStateRef.current.isStarted) {
      streamingStateRef.current.isStarted = true;
      store.getState().startStreaming();

      // 自动判断模式：如果内容较长（> 200 字符），认为是单次完整响应，启用模拟流式
      if (newText.length > 200) {
        streamingStateRef.current.mode = 'simulate';
        simulateStreaming(newText);
      } else {
        // 短内容或流式 API 的首个分片，使用直接更新模式
        streamingStateRef.current.mode = 'direct';
        store.getState().updateCurrentResponse(newText);
      }
      return;
    }

    // 非首次响应
    if (streamingStateRef.current.mode === 'simulate') {
      // 如果当前是模拟模式，但收到了新响应，说明是流式 API，切换到直接模式
      cancelSimulation();
      streamingStateRef.current.mode = 'direct';
    }

    // 直接更新为最新内容
    store.getState().updateCurrentResponse(newText);
  };

  const handleStopResponse = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (streamingStateRef.current.timer) {
      clearInterval(streamingStateRef.current.timer);
      streamingStateRef.current.timer = null;
    }

    streamingStateRef.current.isStarted = false;
    store.getState().stopStreaming();
  };

  const handleSendMessageFromContent = (content: string) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const conversationHistory = messages
      .map(
        (msg) =>
          `${msg.role === 'user' ? t('optimize.userRole') : t('optimize.aiRole')}: ${msg.content}`,
      )
      .join('\n\n');

    // 构造结构化消息数组
    const structuredMessages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [
      {
        role: 'system',
        content: `你是一个专业的提示词优化助手。请根据用户的指令优化以下内容：\n\n${originalContent}`,
      },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: content,
      },
    ];

    // 优先使用 onOptimizeRequest（高级模式）
    if (onOptimizeRequest) {
      onOptimizeRequest(
        {
          content: originalContent,
          selectedText: selectedContent,
          instruction: `${conversationHistory}\n\n用户: ${content}`,
          messages: structuredMessages,
          signal: signal,
        },
        {
          onResponse: (response) => {
            if (signal.aborted) return;
            handleStreamingResponse(response);
          },
          onError: (error) => {
            if (signal.aborted) return;
            console.error('Optimize failed:', error);
            message.error(t('optimize.optimizeFailed'));
            store.getState().stopStreaming();
            streamingStateRef.current.isStarted = false;
          },
        },
      );
      return;
    }

    // 使用 optimizeConfig（简化模式）
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

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo',
        messages: structuredMessages,
        temperature: temperature ?? 0.7,
        stream: true,
        ...extraParams,
      }),
      signal: signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported');
        }

        const decoder = new TextDecoder();
        let accumulatedContent = '';

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
              const lines = chunk.split('\n');

              lines.forEach((line) => {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('data: ')) {
                  const data = trimmedLine.slice(6);
                  if (data === '[DONE]') {
                    handleStreamingResponse({
                      optimizedContent: accumulatedContent,
                      done: true,
                    });
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const delta = parsed.choices?.[0]?.delta?.content;
                    if (delta) {
                      accumulatedContent += delta;
                      handleStreamingResponse({
                        optimizedContent: accumulatedContent,
                      });
                    }
                  } catch (e) {
                    console.warn('Failed to parse SSE data:', e);
                  }
                }
              });

              readStream();
            })
            .catch((error) => {
              if (error.name !== 'AbortError') {
                console.error('Stream reading failed:', error);
                message.error(t('optimize.optimizeFailed'));
                store.getState().stopStreaming();
                streamingStateRef.current.isStarted = false;
              }
            });
        };

        readStream();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Optimize request failed:', error);
          message.error(t('optimize.optimizeFailed'));
          store.getState().stopStreaming();
          streamingStateRef.current.isStarted = false;
        }
      });
  };

  const handleSendMessage = async (forcedContent?: string) => {
    const userMessageContent =
      typeof forcedContent === 'string' ? forcedContent : inputValue.trim();
    if (!userMessageContent || isGenerating) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: userMessageContent,
      timestamp: Date.now(),
    };
    store.getState().addMessage(userMessage);
    store.getState().clearInput();

    store.getState().startStreaming();

    // 构建发送给 AI 的完整内容（包含上下文）
    const fullContent = selectedContent
      ? `${userMessageContent}\n\n选中的内容：\n\n${selectedContent}`
      : userMessageContent;

    await handleSendMessageFromContent(fullContent);
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
        // 移除最后一条 AI 回复
        store.getState().removeLastAssistantMessage();

        store.getState().startStreaming();

        // 重新发送最后一条用户消息
        setTimeout(() => {
          handleSendMessageFromContent(lastUserMessage.content);
        }, 100);
      }
    }
  };

  const handleClose = () => {
    handleStopResponse();
    store.getState().clearMessages();
    store.getState().clearInput();
    onClose();
  };

  // 初始化 store
  useEffect(() => {
    if (open) {
      store.getState().initialize(originalContent, selectedContent);

      // 自动开始优化
      if (autoStart && store.getState().messages.length === 0) {
        // 使用默认指令
        const defaultInstruction = selectedContent
          ? t('optimize.autoOptimizeWithSelection', {
              length: selectedContent.length,
            })
          : t('optimize.autoOptimize');

        // 延迟一小会儿发送，等待弹窗动画完成，体验更好
        const timer = setTimeout(() => {
          handleSendMessage(defaultInstruction);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [open, originalContent, selectedContent, store, autoStart, t]);

  const handleApply = () => {
    // 获取最新的 AI 回复内容
    const lastAssistantMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'assistant');

    if (lastAssistantMessage?.content) {
      onApply(lastAssistantMessage.content);
      message.success(t('optimize.contentApplied'));
      handleClose();
    } else {
      message.warning(t('optimize.noOptimizeContent'));
    }
  };

  // 消息内容渲染
  const renderMessageContent = (content: string) => {
    return (
      <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 dark:text-gray-200">
        {content.split('\n').map((line, index) => {
          // 处理标题
          if (line.startsWith('### ')) {
            return (
              <h3
                key={index}
                className="mb-2 mt-4 text-base font-semibold text-teal-600 dark:text-teal-400"
              >
                {line.slice(4)}
              </h3>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h2
                key={index}
                className="mb-2 mt-4 text-lg font-semibold text-teal-600 dark:text-teal-400"
              >
                {line.slice(3)}
              </h2>
            );
          }
          if (line.startsWith('# ')) {
            return (
              <h1
                key={index}
                className="mb-2 mt-4 text-xl font-bold text-teal-600 dark:text-teal-400"
              >
                {line.slice(2)}
              </h1>
            );
          }

          // 处理列表
          if (line.match(/^\d+\.\s/)) {
            return (
              <div key={index} className="mb-1 ml-4">
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {line}
                </span>
              </div>
            );
          }

          // 处理加粗文本
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={index} className="mb-1">
              {parts.map((part, partIndex) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return (
                    <strong
                      key={partIndex}
                      className="font-semibold text-gray-900 dark:text-gray-100"
                    >
                      {part.slice(2, -2)}
                    </strong>
                  );
                }
                return <span key={partIndex}>{part}</span>;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  // 角色配置 - 使用对象定义样式，通过 item.role 映射
  const roleConfig: Record<string, any> = {
    user: {
      placement: 'end',
      variant: 'filled',
    },
    assistant: {
      placement: 'start',
      variant: 'outlined',
      typing: isStreaming ? { step: 5, interval: 20 } : false,
      footer: (content: React.ReactNode, key: React.Key) => (
        <div className="mt-2 flex items-center gap-1 border-t border-gray-100 pt-2 dark:border-gray-700">
          <Button
            type="text"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(content as string)}
            className="h-6 text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400"
          />
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={handleRegenerate}
            className="h-6 text-gray-500 hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-400"
          />
          <div className="flex-1" />
          <Button
            type="text"
            size="small"
            icon={<LikeOutlined />}
            onClick={() => onLike?.(key as string)}
            className="h-6 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400"
          />
          <Button
            type="text"
            size="small"
            icon={<DislikeOutlined />}
            onClick={() => onDislike?.(key as string)}
            className="h-6 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
          />
        </div>
      ),
    },
  };

  // 将消息转换为 Bubble.List 的 items 格式，并应用角色配置
  const bubbleItems = messages.map((msg) => {
    const config = roleConfig[msg.role] || {};
    return {
      key: msg.id,
      content:
        msg.role === 'assistant'
          ? renderMessageContent(msg.content)
          : msg.content,
      role: msg.role,
      ...config,
    };
  });

  // 当前流式响应也添加到 items 中
  if (currentResponse && isStreaming) {
    const assistantConfig = roleConfig['assistant'] || {};
    bubbleItems.push({
      key: 'streaming-response',
      content: renderMessageContent(currentResponse),
      role: 'assistant',
      ...assistantConfig,
    });
  }

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (streamingStateRef.current.timer) {
        clearInterval(streamingStateRef.current.timer);
      }
    };
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentResponse]);

  return createPortal(
    <XProvider>
      <div
        className={`fixed inset-0 z-[9999] transition-opacity ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        {/* 背景遮罩 */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* 弹窗内容 - 垂直居中 */}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="relative flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            {/* 顶部操作栏 */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-3">
                <ThunderboltOutlined className="text-xl text-indigo-500" />
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  AI 提示词优化
                </span>
                {selectedContent && (
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    已选中 {selectedContent.length} 字
                  </span>
                )}
              </div>
              <Button
                type="text"
                size="large"
                icon={<CloseOutlined className="text-lg" />}
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              />
            </div>

            {/* 消息列表 - 使用 Bubble.List */}
            <div
              className="scroll-thin flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950"
              ref={messagesEndRef}
            >
              {/* 如果有选中的内容，显示在顶部作为参考 */}
              {selectedContent && (
                <div className="border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
                  <div className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                    <FileTextOutlined />
                    选中的内容（{selectedContent.length} 字）
                  </div>
                  <div className="scroll-thin mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {selectedContent}
                  </div>
                </div>
              )}

              {bubbleItems.length > 0 && (
                <div className="p-4">
                  <Bubble.List
                    items={bubbleItems}
                    style={{ maxHeight: 'calc(100vh - 300px)' }}
                  />
                </div>
              )}

              {messages.length === 0 && !isGenerating && !selectedContent && (
                <div className="flex h-64 flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                  <ThunderboltOutlined className="mb-3 text-5xl opacity-30" />
                  <p className="text-sm">{t('optimize.emptyState')}</p>
                </div>
              )}
            </div>

            {/* 底部操作区 - 使用 Sender */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
              {/* 操作按钮 */}
              {!isGenerating && messages.length > 0 && (
                <div className="mb-3 flex items-center justify-start gap-3">
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleApply}
                    className="border-none bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                  >
                    {t('optimize.apply')}
                  </Button>
                  <Button size="large" onClick={handleClose}>
                    {t('optimize.exit')}
                  </Button>
                </div>
              )}

              {/* 输入框 - 使用 Sender 组件 */}
              <Sender
                value={inputValue}
                onChange={(value) => store.getState().setInputValue(value)}
                onSubmit={handleSendMessage}
                onCancel={isStreaming ? handleStopResponse : undefined}
                loading={isStreaming}
                placeholder={
                  selectedContent
                    ? t('optimize.inputPlaceholderWithSelection', {
                        length: selectedContent.length,
                      })
                    : t('optimize.inputPlaceholder')
                }
                allowSpeech={false}
                disabled={isGenerating}
              />

              {/* 免责声明 */}
              <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                {t('optimize.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </XProvider>,
    document.body,
  );
};

export default memo(AIOptimizeModal);
