import { useCallback, useRef } from 'react';
import { useUndoRedo } from './useUndoRedo';

interface UseNodeEditorOptions {
  nodeId: string;
  initialContent: string;
  onContentChange: (id: string, content: string) => void;
}

/**
 * 管理节点编辑器的 Undo/Redo 状态
 */
export const useNodeEditor = ({
  nodeId,
  initialContent,
  onContentChange,
}: UseNodeEditorOptions) => {
  const editorRef = useRef<any>(null);

  // 使用专门的撤销/还原 Hook
  const { canUndo, canRedo, handleUndo, handleRedo } = useUndoRedo({
    viewRef: editorRef,
    initialContent,
  });

  // 标记用户正在输入（用于区分用户操作和外部更新）
  const isUpdatingFromUser = useRef(false);

  /**
   * 处理内容变化
   */
  const handleContentChange = useCallback(
    (content: string) => {
      isUpdatingFromUser.current = true;

      onContentChange(nodeId, content);
    },
    [nodeId, onContentChange],
  );

  return {
    editorRef,
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    handleContentChange,
  };
};
