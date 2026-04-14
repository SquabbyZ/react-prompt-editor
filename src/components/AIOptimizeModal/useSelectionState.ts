import { message } from 'antd';
import { useCallback, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';

export interface SelectionState {
  selectedTexts: string[];
  toolbarVisible: boolean;
  toolbarPosition: { top: number; left: number } | null;
}

export interface UseSelectionStateReturn extends SelectionState {
  handleTextSelection: (
    texts: string[],
    position: { top: number; left: number },
  ) => void;
  clearSelection: () => void;
  handleSelectionReplace: (
    onApply: (content: string) => void,
    onClose: () => void,
  ) => void;
}

/**
 * 管理文本选区状态和操作
 */
export const useSelectionState = (): UseSelectionStateReturn => {
  const { t } = useI18n();
  const [selectedTexts, setSelectedTexts] = useState<string[]>([]);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleTextSelection = useCallback(
    (texts: string[], position: { top: number; left: number }) => {
      setSelectedTexts(texts);
      setToolbarPosition(position);
      setToolbarVisible(true);
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedTexts([]);
    setToolbarVisible(false);
    setToolbarPosition(null);
  }, []);

  const handleSelectionReplace = useCallback(
    (onApply: (content: string) => void, onClose: () => void) => {
      if (selectedTexts.length === 0) {
        message.warning('请先选择要替换的内容');
        return;
      }

      try {
        // 拼接多段文本，用换行符分隔
        const combinedText = selectedTexts.join('\n');
        onApply(combinedText);
        message.success(t('optimize.contentApplied'));
      } catch (error) {
        console.error('🔴 替换操作失败:', error);
        message.error('替换失败，请重试');
      } finally {
        // 确保无论成功还是失败，都关闭弹窗
        onClose();
      }
    },
    [selectedTexts, t],
  );

  return {
    selectedTexts,
    toolbarVisible,
    toolbarPosition,
    handleTextSelection,
    clearSelection,
    handleSelectionReplace,
  };
};
