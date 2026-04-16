import {
  Copy,
  ThumbsDown,
  ThumbsUp,
  RotateCw,
  ArrowRightLeft,
} from 'lucide-react';
import { Button, Tooltip } from 'antd';
import React from 'react';
import { useI18n } from '../../hooks/useI18n';
import { MarkdownRenderer } from './MarkdownRenderer';

export interface MessageContentRendererProps {
  content: string;
  messageKey?: React.Key;
  onFullReplace?: (content: string) => void;
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

/**
 * 消息内容渲染器（包含 Markdown 和操作按钮）
 */
export const MessageContentRenderer: React.FC<MessageContentRendererProps> = ({
  content,
  messageKey,
  onFullReplace,
  onCopy,
  onRegenerate,
  onLike,
  onDislike,
}) => {
  const { t } = useI18n();
  const showActions = messageKey !== undefined && messageKey !== null;

  return (
    <div>
      <MarkdownRenderer content={content} />
      {showActions && (
        <div className="mt-2 flex items-center justify-end gap-1 border-t border-gray-100 pt-2 dark:border-gray-700">
          <Tooltip title={t('optimizeActions.copy')}>
            <Button
              type="text"
              size="small"
              icon={<Copy size={14} />}
              onClick={() => onCopy?.(content)}
              className="h-6 text-gray-500 hover:text-indigo-500"
            />
          </Tooltip>
          <Tooltip title={t('optimizeActions.regenerate')}>
            <Button
              type="text"
              size="small"
              icon={<RotateCw size={14} />}
              onClick={onRegenerate}
              className="h-6 text-gray-500 hover:text-indigo-500"
            />
          </Tooltip>
          <Tooltip title={t('optimizeActions.like')}>
            <Button
              type="text"
              size="small"
              icon={<ThumbsUp size={14} />}
              onClick={() => onLike?.(messageKey as string)}
              className="h-6 text-gray-500 hover:text-green-500"
            />
          </Tooltip>
          <Tooltip title={t('optimizeActions.dislike')}>
            <Button
              type="text"
              size="small"
              icon={<ThumbsDown size={14} />}
              onClick={() => onDislike?.(messageKey as string)}
              className="h-6 text-gray-500 hover:text-red-500"
            />
          </Tooltip>
          <Tooltip title={t('optimizeActions.replace')}>
            <Button
              type="text"
              size="small"
              icon={<ArrowRightLeft size={14} />}
              onClick={() => onFullReplace?.(content)}
              className="h-6 text-gray-500 hover:text-indigo-500"
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
};

/**
 * 工厂函数：创建带默认回调的渲染器
 */
export const renderMessageContentFactory = (
  onFullReplace?: (content: string) => void,
  onLike?: (messageId: string) => void,
  onDislike?: (messageId: string) => void,
) => {
  return (content: string, key?: React.Key) => (
    <MessageContentRenderer
      content={content}
      messageKey={key}
      onFullReplace={onFullReplace}
      onLike={onLike}
      onDislike={onDislike}
    />
  );
};
