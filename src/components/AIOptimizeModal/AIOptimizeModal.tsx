import { X, Zap } from 'lucide-react';
import { XProvider } from '@ant-design/x';
import { Button, theme } from 'antd';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../hooks/useI18n';
import { OptimizeConfig, OptimizeRequest } from '../../types';
import { MessageInput } from './MessageInput';
import { MessageList } from './MessageList';
import { useOptimizeLogic } from './useOptimizeLogic';

interface AIOptimizeModalProps {
  open: boolean;
  onClose: () => void;
  originalContent: string;
  selectedContent?: string;
  optimizeConfig?: OptimizeConfig;
  onOptimizeRequest?: (request: OptimizeRequest) => void;
  onApply: (optimizedContent: string) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export const AIOptimizeModal: React.FC<AIOptimizeModalProps> = ({
  open,
  onClose,
  originalContent,
  selectedContent,
  optimizeConfig,
  onOptimizeRequest,
  onApply,
  onLike,
  onDislike,
}) => {
  const { t } = useI18n();
  const { darkAlgorithm, useToken } = theme;
  const { token } = useToken();

  // 使用 Ant Design 主题色生成渐变色
  const primaryGradient = useMemo(
    () =>
      `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryHover} 100%)`,
    [token.colorPrimary, token.colorPrimaryHover],
  );

  // 检测暗色模式
  const [isDark, setIsDark] = useState(() => {
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
  });

  // 监听暗色模式变化
  useEffect(() => {
    const checkDarkMode = () => {
      if (typeof window !== 'undefined') {
        const html = document.documentElement;
        setIsDark(
          html.classList.contains('dark') ||
            html.getAttribute('data-theme') === 'dark' ||
            html.getAttribute('data-prefers-color') === 'dark' ||
            window.matchMedia('(prefers-color-scheme: dark)').matches,
        );
      }
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-prefers-color'],
    });

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

  const {
    store,
    messages,
    inputValue,
    isStreaming,
    isGenerating,
    bubbleItems,
    messagesEndRef,
    scrollContainerRef,
    handleScroll,
    handleSendMessage,
    handleStopResponse,
    // 选区相关
    selectedTexts,
    toolbarVisible,
    toolbarPosition,
    handleTextSelection,
    clearSelection,
    handleSelectionReplace,
  } = useOptimizeLogic({
    originalContent,
    selectedContent,
    optimizeConfig,
    onOptimizeRequest,
    onLike,
    onDislike,
    onApply,
    onClose,
  });

  // 重新定义 handleClose，包含完整的清理逻辑
  const handleFullClose = () => {
    handleStopResponse();
    store.getState().clearMessages();
    store.getState().clearInput();
    onClose();
  };

  useEffect(() => {
    if (open) {
      store.getState().initialize(originalContent, selectedContent);
    }
  }, [open, originalContent, selectedContent, store]);

  return createPortal(
    <XProvider
      theme={{
        algorithm: isDark ? [darkAlgorithm] : undefined,
      }}
    >
      <div
        className={`fixed inset-0 z-[1020] transition-all duration-300 ${open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={handleFullClose}
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className={`relative flex h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-xl transition-all duration-300 dark:border-gray-700/50 dark:bg-gray-900 ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
          >
            {/* 顶部操作栏 */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200/70 bg-gradient-to-r from-white to-gray-50 px-6 py-4 dark:border-gray-700/70 dark:from-gray-900 dark:to-gray-800">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
                  style={{
                    background: primaryGradient,
                    boxShadow: `0 4px 12px ${token.colorPrimary}40`,
                  }}
                >
                  <Zap className="text-lg text-white" />
                </div>
                <div>
                  <span className="block text-base font-semibold text-gray-900 dark:text-gray-100">
                    AI 提示词优化
                  </span>
                  {selectedContent && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      已选中 {selectedContent.length} 字
                    </span>
                  )}
                </div>
              </div>
              <Button
                type="text"
                size="large"
                icon={<X className="text-lg" />}
                onClick={handleFullClose}
                className="rounded-lg text-gray-400 transition-all hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              />
            </div>

            <MessageList
              messages={messages}
              selectedContent={selectedContent}
              bubbleItems={bubbleItems}
              isGenerating={isGenerating}
              emptyStateText={t('optimize.emptyState')}
              emptyStateSubtext="输入优化指令，AI 将为您优化提示词"
              messagesEndRef={messagesEndRef}
              scrollContainerRef={scrollContainerRef}
              onScroll={handleScroll}
              // 选区相关
              selectedTexts={selectedTexts}
              toolbarVisible={toolbarVisible}
              toolbarPosition={toolbarPosition}
              handleTextSelection={handleTextSelection}
              clearSelection={clearSelection}
              handleSelectionReplace={() =>
                handleSelectionReplace(onApply, handleFullClose)
              }
            />

            {/* 底部输入区 */}
            <MessageInput
              inputValue={inputValue}
              onChange={(value) => store.getState().setInputValue(value)}
              onSubmit={handleSendMessage}
              onCancel={handleStopResponse}
              isStreaming={isStreaming}
              isGenerating={isGenerating}
              hasMessages={messages.length > 0}
              placeholder={
                selectedContent
                  ? t('optimize.inputPlaceholderWithSelection', {
                      length: selectedContent.length,
                    })
                  : t('optimize.inputPlaceholder')
              }
              disclaimerText={t('optimize.disclaimer')}
            />
          </div>
        </div>
      </div>
    </XProvider>,
    document.body,
  );
};

export default memo(AIOptimizeModal);
