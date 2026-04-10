import { Sender } from '@ant-design/x';
import { Button } from 'antd';
import React, { memo } from 'react';

interface MessageInputProps {
  inputValue: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  onApply: () => void;
  onClose: () => void;
  isStreaming: boolean;
  isGenerating: boolean;
  hasMessages: boolean;
  placeholder: string;
  disclaimerText: string;
  applyButtonText: string;
  exitButtonText: string;
}

export const MessageInput: React.FC<MessageInputProps> = memo(
  ({
    inputValue,
    onChange,
    onSubmit,
    onCancel,
    onApply,
    onClose,
    isStreaming,
    isGenerating,
    hasMessages,
    placeholder,
    disclaimerText,
    applyButtonText,
    exitButtonText,
  }) => {
    return (
      <div className="flex-shrink-0 border-t border-gray-200/70 bg-gradient-to-b from-white to-gray-50 px-6 py-4 dark:border-gray-700/70 dark:from-gray-900 dark:to-gray-800">
        {/* 操作按钮 */}
        {!isGenerating && hasMessages && (
          <div className="mb-3 flex items-center justify-start gap-3">
            <Button
              type="primary"
              onClick={onApply}
              className="rounded-xl border-none bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl hover:shadow-indigo-500/30"
            >
              {applyButtonText}
            </Button>
            <Button
              onClick={onClose}
              className="rounded-xl border-gray-200 transition-all hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
            >
              {exitButtonText}
            </Button>
          </div>
        )}

        {/* 输入框 */}
        <Sender
          value={inputValue}
          onChange={onChange}
          onSubmit={onSubmit}
          onCancel={isStreaming ? onCancel : undefined}
          loading={isStreaming}
          placeholder={placeholder}
          allowSpeech={false}
          disabled={isGenerating}
        />

        {/* 免责声明 */}
        <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
          {disclaimerText}
        </p>
      </div>
    );
  },
);
