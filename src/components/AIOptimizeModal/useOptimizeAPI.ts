import { useEffect, useRef, useState } from 'react';
import { useStreamParser } from '../../hooks/useStreamParser';
import { createOptimizeStore, OptimizeStoreType } from '../../stores';
import { OptimizeConfig, OptimizeRequest, OptimizeResponse } from '../../types';

/**
 * 检测暗色模式
 */
export const isDarkMode = () => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement;
    return (
      html.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' ||
      html.getAttribute('data-prefers-color') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
  return false;
};

export interface UseOptimizeStoreReturn {
  store: OptimizeStoreType;
  isDark: boolean;
}

/**
 * 管理优化 Store 和暗色模式
 */
export const useOptimizeStore = (): UseOptimizeStoreReturn => {
  const storeRef = useRef<OptimizeStoreType | null>(null);
  if (!storeRef.current) {
    storeRef.current = createOptimizeStore();
  }
  const store = storeRef.current;

  // 暗色模式状态
  const [isDark, setIsDark] = useState(() => isDarkMode());

  // 监听暗色模式变化
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(isDarkMode());
    };

    checkDarkMode();

    // 监听类名变化
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-prefers-color'],
    });

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  return { store, isDark };
};

export interface UseOptimizeAPIProps {
  store: OptimizeStoreType;
  originalContent: string;
  selectedContent?: string;
  optimizeConfig?: OptimizeConfig;
  onOptimizeRequest?: (request: OptimizeRequest) => void;
  onApplyOptimizedContent?: (content: string) => void;
  onCloseOptimizeDialog?: () => void;
  messages: Array<{ role: string; content: string }>;
}

export interface UseOptimizeAPIReturn {
  handleStreamingResponse: (response: OptimizeResponse) => void;
  handleStopResponse: () => void;
  handleSendMessageFromContent: (content: string) => void;
}

/**
 * 管理 AI 优化 API 调用
 */
export const useOptimizeAPI = ({
  store,
  originalContent,
  selectedContent,
  optimizeConfig,
  onOptimizeRequest,
  onApplyOptimizedContent,
  onCloseOptimizeDialog,
  messages,
}: UseOptimizeAPIProps): UseOptimizeAPIReturn => {
  const { parseLine, reset: resetParser } = useStreamParser();
  const abortControllerRef = useRef<AbortController | null>(null);
  const streamingStateRef = useRef({ isStarted: false });

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

  const reportOptimizeError = (error: string | Error) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    streamingStateRef.current.isStarted = false;
    store.getState().stopStreaming();
    store.getState().addMessage({
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: `[系统提示] ${errorMessage}`,
      timestamp: Date.now(),
    });
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
      let requestHandled = false;
      const optimizeRequest: OptimizeRequest = {
        content: originalContent,
        selectedText: selectedContent,
        instruction: content,
        messages: structuredMessages,
        signal,
        config: optimizeConfig,
        applyOptimizedContent: (optimizedContent: string) => {
          if (signal.aborted) return;
          requestHandled = true;
          streamingStateRef.current.isStarted = false;
          store.getState().stopStreaming();
          onApplyOptimizedContent?.(optimizedContent);
        },
        setOptimizeError: (error: string | Error) => {
          if (signal.aborted) return;
          requestHandled = true;
          reportOptimizeError(error);
        },
        closeOptimizeDialog: () => {
          requestHandled = true;
          handleStopResponse();
          store.getState().clearMessages();
          store.getState().clearInput();
          onCloseOptimizeDialog?.();
        },
      };

      Promise.resolve(onOptimizeRequest(optimizeRequest))
        .then(() => {
          if (signal.aborted || requestHandled) return;
          reportOptimizeError(
            'onOptimizeRequest 执行完成，但未调用 applyOptimizedContent、setOptimizeError 或 closeOptimizeDialog',
          );
        })
        .catch((error) => {
          if (signal.aborted) return;
          reportOptimizeError(
            error instanceof Error ? error : new Error('优化失败'),
          );
        });
      return;
    }

    if (!optimizeConfig?.url) {
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
                store.getState().stopStreaming();
              }
            });
        };
        readStream();
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          store.getState().stopStreaming();
        }
      });
  };

  return {
    handleStreamingResponse,
    handleStopResponse,
    handleSendMessageFromContent,
  };
};
