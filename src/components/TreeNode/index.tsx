import React, { memo, useCallback, useState } from 'react';
import { CodeMirrorEditor } from '../CodeMirrorEditor';
import { TreeNodeProps } from './TreeNode.types';

export const TreeNode: React.FC<TreeNodeProps> = memo(
  ({
    node,
    number,
    isExpanded,
    isLocked,
    hasRun,
    onToggle,
    onContentChange,
    onRun,
    onLock,
    onOptimize,
    onDelete,
  }) => {
    const [editorLoaded, setEditorLoaded] = useState(false);

    // 懒加载编辑器
    const handleFocus = useCallback(() => {
      if (!editorLoaded) {
        setEditorLoaded(true);
      }
    }, [editorLoaded]);

    return (
      <div className="my-2 rounded-lg border border-gray-300 bg-white p-3 dark:border-gray-600 dark:bg-gray-900">
        {/* 节点头部 */}
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="cursor-pointer border-none bg-transparent text-xs"
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <span className="font-bold text-gray-600 dark:text-gray-400">
            <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-none bg-gray-600 text-xs font-bold text-white dark:bg-gray-400">
              {number}
            </span>
            {node.title}
          </span>
          {isLocked && <span>🔒</span>}
          {!hasRun && (
            <span className="text-xs text-gray-400 dark:text-gray-500">
              (未运行)
            </span>
          )}

          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onRun}
              disabled={false}
              className="rounded bg-blue-500 px-2 py-1 text-sm text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              运行
            </button>
            <button
              type="button"
              onClick={onOptimize}
              className="rounded bg-green-500 px-2 py-1 text-sm text-white transition-colors hover:bg-green-600"
            >
              AI 优化
            </button>
            <button
              type="button"
              onClick={onLock}
              disabled={!hasRun}
              className="rounded bg-purple-500 px-2 py-1 text-sm text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              {isLocked ? '🔓 解锁' : '🔒 锁定'}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isLocked}
              className="rounded bg-red-500 px-2 py-1 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
            >
              删除
            </button>
          </div>
        </div>

        {/* 编辑器区域 */}
        {isExpanded && (
          <div onFocus={handleFocus}>
            {editorLoaded ? (
              <CodeMirrorEditor
                value={node.content}
                onChange={onContentChange}
                isReadOnly={isLocked}
                minHeight="64px"
                maxHeight="220px"
              />
            ) : (
              <div
                className="cursor-pointer rounded bg-gray-50 p-10 text-center text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                onClick={handleFocus}
              >
                Click to load editor...
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);
