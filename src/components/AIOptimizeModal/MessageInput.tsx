import { Sender } from '@ant-design/x';
import React, { memo } from 'react';

interface MessageInputProps {
  inputValue: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  isStreaming: boolean;
  isGenerating: boolean;
  hasMessages: boolean;
  placeholder: string;
  disclaimerText: string;
}

export const MessageInput: React.FC<MessageInputProps> = memo(
  ({
    inputValue,
    onChange,
    onSubmit,
    onCancel,
    isStreaming,
    isGenerating,
    placeholder,
    disclaimerText,
  }) => {
    return (
      <div className="flex-shrink-0 border-t border-gray-200/70 bg-gradient-to-b from-white to-gray-50 px-6 py-4 dark:border-gray-700/70 dark:from-gray-900 dark:to-gray-800">
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
