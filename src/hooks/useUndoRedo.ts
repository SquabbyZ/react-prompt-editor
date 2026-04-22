import { useCallback, useEffect, useRef, useState } from 'react';

interface UseUndoRedoOptions {
  /** CodeMirror 编辑器引用 */
  viewRef: React.RefObject<any>;
  /** 初始内容（用于检测外部内容变化） */
  initialContent: string;
}

export const useUndoRedo = ({
  viewRef,
  initialContent,
}: UseUndoRedoOptions) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const isUndoRedoOperation = useRef(false);
  const lastExternalContent = useRef(initialContent);

  const getEditor = useCallback(() => {
    const maybeView = viewRef.current?.view;
    if (maybeView?.undo && maybeView?.redo && maybeView?.historySize) {
      return maybeView;
    }
    if (viewRef.current?.undo && viewRef.current?.redo && viewRef.current?.historySize) {
      return viewRef.current;
    }
    return null;
  }, [viewRef]);

  const checkHistory = useCallback(() => {
    const editor = getEditor();
    if (!editor) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    try {
      const history = editor.historySize();
      setCanUndo((history?.undo || 0) > 0);
      setCanRedo((history?.redo || 0) > 0);
    } catch (error) {
      console.warn('检测撤销/还原历史失败:', error);
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [getEditor]);

  useEffect(() => {
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false;
      return;
    }

    if (initialContent !== lastExternalContent.current) {
      lastExternalContent.current = initialContent;
      checkHistory();
    }
  }, [initialContent, checkHistory]);

  const handleUndo = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const editor = getEditor();
      if (!editor || !canUndo) return;

      isUndoRedoOperation.current = true;
      editor.undo();
      checkHistory();
    },
    [getEditor, canUndo, checkHistory],
  );

  const handleRedo = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const editor = getEditor();
      if (!editor || !canRedo) return;

      isUndoRedoOperation.current = true;
      editor.redo();
      checkHistory();
    },
    [getEditor, canRedo, checkHistory],
  );

  return {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    checkHistory,
  };
};
