import { Bubble } from '@ant-design/x';
import React, { useMemo } from 'react';
import { ChatMessage } from '../../stores';
import { renderMessageContentFactory } from './MessageContentRenderer';

export interface UseBubbleItemsProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  currentResponse: string;
  onFullReplace?: (content: string) => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export interface UseBubbleItemsReturn {
  bubbleItems: any[];
}

/**
 * 生成气泡列表项（用于 Ant Design X Bubble 组件）
 */
export const useBubbleItems = ({
  messages,
  isStreaming,
  currentResponse,
  onFullReplace,
  onLike,
  onDislike,
}: UseBubbleItemsProps): UseBubbleItemsReturn => {
  const renderMessageContent = renderMessageContentFactory(
    onFullReplace,
    onLike,
    onDislike,
  );

  const roleConfig = useMemo(
    () => ({
      user: {
        placement: 'end',
        variant: 'filled',
        shape: 'corner',
        avatar: (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm dark:bg-gray-700">
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
        typing: false,
        styles: {
          content: {
            backgroundColor: 'var(--color-bg-container)',
            borderColor: 'var(--color-border)',
            color: 'var(--color-text)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-sm)',
          },
        },
        loadingRender: () => <Bubble loading={true} content="" />,
      },
    }),
    [],
  );

  const bubbleItems = useMemo(() => {
    const items = messages.map((msg) => {
      const config = roleConfig[msg.role as keyof typeof roleConfig] || {};
      return {
        key: msg.id,
        content:
          msg.role === 'assistant'
            ? renderMessageContent(msg.content, msg.id)
            : msg.content,
        role: msg.role,
        ...config,
      };
    });

    // 如果正在流式生成
    if (isStreaming) {
      if (currentResponse) {
        // 有内容时显示流式响应
        items.push({
          key: 'streaming-response',
          content: renderMessageContent(currentResponse),
          role: 'assistant',
          ...roleConfig.assistant,
        });
      } else {
        // 无内容时显示 loading 气泡
        items.push({
          key: 'streaming-loading',
          content: '',
          role: 'assistant',
          ...roleConfig.assistant,
        });
      }
    }

    return items;
  }, [
    messages,
    isStreaming,
    currentResponse,
    renderMessageContent,
    roleConfig,
  ]);

  return { bubbleItems };
};
