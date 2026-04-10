import { redo, undo } from '@codemirror/commands';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseUndoRedoOptions {
  /** CodeMirror 视图引用 */
  viewRef: React.RefObject<any>;
  /** 初始内容（用于检测外部内容变化） */
  initialContent: string;
}

/**
 * 管理撤销/还原状态的 Hook
 * - 自动检测 CodeMirror 历史栈状态
 * - 处理外部内容更新（如 AI 替换）后的状态同步
 * - 提供撤销/还原操作方法
 */
export const useUndoRedo = ({
  viewRef,
  initialContent,
}: UseUndoRedoOptions) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // 标记是否正在执行撤销/还原操作（防止状态循环更新）
  const isUndoRedoOperation = useRef(false);
  // 记录上次外部内容，用于检测变化
  const lastExternalContent = useRef(initialContent);

  /**
   * 检测并更新撤销/还原状态
   */
  const checkHistory = useCallback(() => {
    const view = viewRef.current?.view;
    if (!view) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    try {
      // 检测撤销历史
      const hasUndo = undo(view);
      if (hasUndo) {
        // 如果有撤销历史，立即还原回去（不影响用户看到的内容）
        redo(view);
      }
      setCanUndo(hasUndo);

      // 检测还原历史
      const hasRedo = redo(view);
      if (hasRedo) {
        // 如果有还原历史，立即撤销回去
        undo(view);
      }
      setCanRedo(hasRedo);
    } catch (error) {
      console.warn('检测撤销/还原历史失败:', error);
      setCanUndo(false);
      setCanRedo(false);
    }
  }, [viewRef]);

  /**
   * 同步外部内容变化（如 AI 优化后的内容）
   */
  useEffect(() => {
    if (isUndoRedoOperation.current) {
      isUndoRedoOperation.current = false;
      return;
    }

    if (initialContent !== lastExternalContent.current) {
      lastExternalContent.current = initialContent;
      // 外部内容更新后，重新检测历史状态
      checkHistory();
    }
  }, [initialContent, checkHistory]);

  /**
   * 执行撤销操作
   */
  const handleUndo = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const view = viewRef.current?.view;
      if (!view || !canUndo) return;

      isUndoRedoOperation.current = true;
      undo(view);

      // 更新状态
      checkHistory();
    },
    [viewRef, canUndo, checkHistory],
  );

  /**
   * 执行还原操作
   */
  const handleRedo = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      const view = viewRef.current?.view;
      if (!view || !canRedo) return;

      isUndoRedoOperation.current = true;
      redo(view);

      // 更新状态
      checkHistory();
    },
    [viewRef, canRedo, checkHistory],
  );

  return {
    canUndo,
    canRedo,
    handleUndo,
    handleRedo,
    checkHistory,
  };
};
