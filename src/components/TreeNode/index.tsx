import React, { useCallback, useState } from 'react';
import { CodeMirrorEditor } from '../CodeMirrorEditor';
import { TreeNodeProps } from './TreeNode.types';

export const TreeNode: React.FC<TreeNodeProps> = ({
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
    <div
      className="border border-gray-300 dark:border-gray-600 my-2 p-3 bg-white dark:bg-gray-900 rounded-lg"
    >
      {/* 节点头部 */}
      <div
        className="flex items-center gap-2 mb-2"
      >
        <button
          type="button"
          onClick={onToggle}
          className="cursor-pointer border-none bg-transparent text-xs"
        >
          {isExpanded ? '▼' : '▶'}
        </button>
        <span className="font-bold text-gray-600 dark:text-gray-400">
          [{number}] {node.title}
        </span>
        {isLocked && <span>🔒</span>}
        {!hasRun && (
          <span className="text-xs text-gray-400 dark:text-gray-500">(未运行)</span>
        )}

        <div className="ml-auto flex gap-2">
          <button 
            type="button"
            onClick={onRun} 
            disabled={false}
            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            运行
          </button>
          <button 
            type="button"
            onClick={onOptimize}
            className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
          >
            AI 优化
          </button>
          <button 
            type="button"
            onClick={onLock} 
            disabled={!hasRun}
            className="px-2 py-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
          >
            {isLocked ? '🔓 解锁' : '🔒 锁定'}
          </button>
          <button 
            type="button"
            onClick={onDelete} 
            disabled={isLocked}
            className="px-2 py-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
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
            />
          ) : (
            <div
              className="p-10 text-center text-gray-400 dark:text-gray-500 cursor-pointer bg-gray-50 dark:bg-gray-800 rounded"
              onClick={handleFocus}
            >
              Click to load editor...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
