import { FileTextOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import React, { memo } from 'react';
import { ChatMessage } from '../../stores';

interface MessageListProps {
  messages: ChatMessage[];
  selectedContent?: string;
  bubbleItems: any[];
  isGenerating: boolean;
  emptyStateText: string;
  emptyStateSubtext: string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  onScroll?: () => void;
}

export const MessageList: React.FC<MessageListProps> = memo(
  ({
    messages,
    selectedContent,
    bubbleItems,
    isGenerating,
    emptyStateText,
    emptyStateSubtext,
    messagesEndRef,
    scrollContainerRef,
    onScroll,
  }) => {
    return (
      <div
        className="scroll-thin flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950"
        ref={scrollContainerRef}
        onScroll={onScroll}
      >
        {/* 选中的内容展示 */}
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

        {/* 消息气泡列表 */}
        {bubbleItems.length > 0 && (
          <div className="p-4">
            <Bubble.List
              items={bubbleItems}
              style={{ maxHeight: 'calc(100vh - 300px)' }}
            />
          </div>
        )}

        {/* 滚动锚点 - 用于自动滚动到底部 */}
        <div ref={messagesEndRef} />

        {/* 空状态 */}
        {messages.length === 0 && !isGenerating && !selectedContent && (
          <div className="flex h-64 flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
              <ThunderboltOutlined className="text-3xl text-indigo-500" />
            </div>
            <p className="text-sm font-medium">{emptyStateText}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-600">
              {emptyStateSubtext}
            </p>
          </div>
        )}
      </div>
    );
  },
);
