import { FileTextOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { Bubble } from '@ant-design/x';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { ChatMessage } from '../../stores';
import { SelectionToolbar } from './SelectionToolbar';

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
  // 选区相关
  selectedTexts: string[];
  toolbarVisible: boolean;
  toolbarPosition: { top: number; left: number } | null;
  handleTextSelection: (
    texts: string[],
    position: { top: number; left: number },
  ) => void;
  clearSelection: () => void;
  handleSelectionReplace: () => void;
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
    selectedTexts,
    toolbarVisible,
    toolbarPosition,
    handleTextSelection,
    clearSelection,
    handleSelectionReplace,
  }) => {
    const listRef = useRef<HTMLDivElement>(null);
    const isCtrlPressed = useRef(false);

    // 监听 Ctrl/Cmd 键状态
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          isCtrlPressed.current = true;
        }
      };
      const handleKeyUp = (e: KeyboardEvent) => {
        if (!e.ctrlKey && !e.metaKey) {
          isCtrlPressed.current = false;
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }, []);

    // 处理鼠标松开事件（文本选中）
    const handleMouseUp = useCallback(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        clearSelection();
        return;
      }

      const selectedText = selection.toString();
      if (!selectedText.trim()) {
        clearSelection();
        return;
      }

      // 判断是否在消息列表内部
      if (listRef.current && !listRef.current.contains(selection.anchorNode)) {
        clearSelection();
        return;
      }

      // 计算选区位置
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (isCtrlPressed.current) {
        // 多段选中：添加到数组
        handleTextSelection([...selectedTexts, selectedText], {
          top: rect.top,
          left: rect.left + rect.width / 2,
        });
      } else {
        // 单段选中：替换之前的选区
        handleTextSelection([selectedText], {
          top: rect.top,
          left: rect.left + rect.width / 2,
        });
      }
    }, [selectedTexts, handleTextSelection, clearSelection]);

    // 点击外部清除选区
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (listRef.current && !listRef.current.contains(e.target as Node)) {
          clearSelection();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [clearSelection]);

    return (
      <>
        {/* 顶部固定区域：选中的内容展示 */}
        {selectedContent && (
          <div className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-1 text-xs font-medium text-primary">
              <FileTextOutlined />
              选中的内容（{selectedContent.length} 字）
            </div>
            <div className="scroll-thin mt-1 max-h-32 overflow-y-auto whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
              {selectedContent}
            </div>
          </div>
        )}

        {/* 滚动区域：消息气泡列表 */}
        <div
          className="scroll-thin flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950"
          ref={(node) => {
            // 同时设置 scrollContainerRef 和 listRef
            if (scrollContainerRef) {
              (
                scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = node;
            }
            (listRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }}
          onScroll={onScroll}
          onMouseUp={handleMouseUp}
        >
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

        {/* 选区浮窗 */}
        {toolbarVisible && toolbarPosition && (
          <SelectionToolbar
            visible={toolbarVisible}
            position={toolbarPosition}
            onReplace={handleSelectionReplace}
            onClose={clearSelection}
          />
        )}
      </>
    );
  },
);
