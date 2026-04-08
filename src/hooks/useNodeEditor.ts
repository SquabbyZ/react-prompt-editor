import { redo, undo } from '@codemirror/commands';
import { useCallback, useEffect, useRef, useState } from 'react';

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

  // Undo/Redo 状态
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // 标记状态
  const isUpdatingFromUser = useRef(false);
  const isUndoRedoOperation = useRef(false);
  const lastExternalContent = useRef(initialContent);

  // 同步外部内容变化（如 AI 优化后的内容）
  useEffect(() => {
    if (isUpdatingFromUser.current || isUndoRedoOperation.current) {
      isUpdatingFromUser.current = false;
      isUndoRedoOperation.current = false;
      return;
    }

    if (initialContent !== lastExternalContent.current) {
      lastExternalContent.current = initialContent;
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [initialContent]);

  /**
   * 撤回操作
   */
  const handleUndo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const view = editorRef.current?.view;
    if (!view) return;

    isUndoRedoOperation.current = true;
    undo(view);

    setTimeout(() => {
      const canUndoMore = undo(view);
      if (canUndoMore) {
        redo(view);
        setCanUndo(true);
        setCanRedo(true);
      } else {
        setCanUndo(false);
        setCanRedo(true);
      }
      isUndoRedoOperation.current = false;
    }, 0);
  }, []);

  /**
   * 还原操作
   */
  const handleRedo = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const view = editorRef.current?.view;
    if (!view) return;

    isUndoRedoOperation.current = true;
    redo(view);

    setTimeout(() => {
      const canRedoMore = redo(view);
      if (canRedoMore) {
        undo(view);
        setCanRedo(true);
        setCanUndo(true);
      } else {
        setCanRedo(false);
        setCanUndo(true);
      }
      isUndoRedoOperation.current = false;
    }, 0);
  }, []);

  /**
   * 处理内容变化
   */
  const handleContentChange = useCallback(
    (content: string) => {
      if (isUndoRedoOperation.current) {
        onContentChange(nodeId, content);
        return;
      }

      isUpdatingFromUser.current = true;
      setCanUndo(true);
      setCanRedo(false);

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
