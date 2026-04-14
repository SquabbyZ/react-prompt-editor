import { message } from 'antd';
import { useCallback } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { OptimizeStoreType } from '../../stores';

export interface UseMessageActionsProps {
  store: OptimizeStoreType;
  handleSendMessageFromContent: (content: string) => void;
  selectedContent?: string;
}

export interface UseMessageActionsReturn {
  handleSendMessage: (forcedContent?: string) => Promise<void>;
  handleCopy: (content: string) => void;
  handleRegenerate: () => void;
  handleApply: (
    onApply: (content: string) => void,
    onClose: () => void,
  ) => void;
  handleFullReplace: (
    content: string,
    onApply: (content: string) => void,
    onClose: () => void,
  ) => void;
}

/**
 * 管理消息相关操作（发送、复制、重新生成、应用）
 */
export const useMessageActions = ({
  store,
  handleSendMessageFromContent,
  selectedContent,
}: UseMessageActionsProps): UseMessageActionsReturn => {
  const { t } = useI18n();

  const handleSendMessage = useCallback(
    async (forcedContent?: string) => {
      const userMessageContent =
        typeof forcedContent === 'string'
          ? forcedContent
          : store.getState().inputValue.trim();
      if (!userMessageContent || store.getState().isGenerating) return;

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
    },
    [store, handleSendMessageFromContent, selectedContent],
  );

  const handleCopy = useCallback(
    (content: string) => {
      navigator.clipboard.writeText(content);
      message.success(t('optimize.copied'));
    },
    [t],
  );

  const handleRegenerate = useCallback(() => {
    const messages = store.getState().messages;
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
  }, [store, handleSendMessageFromContent]);

  const handleApply = useCallback(
    (onApply: (content: string) => void, onClose: () => void) => {
      const messages = store.getState().messages;
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
    },
    [store, t],
  );

  const handleFullReplace = useCallback(
    (
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
    },
    [t],
  );

  return {
    handleSendMessage,
    handleCopy,
    handleRegenerate,
    handleApply,
    handleFullReplace,
  };
};
