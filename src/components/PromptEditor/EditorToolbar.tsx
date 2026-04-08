import { Button, Tooltip } from 'antd';
import { Redo2, Undo2 } from 'lucide-react';
import React from 'react';

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: (e: React.MouseEvent) => void;
  onRedo: (e: React.MouseEvent) => void;
}

/**
 * 编辑器工具栏组件
 * 提供撤回/还原功能
 * 浮动在编辑器右上角
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = React.memo(
  ({ canUndo, canRedo, onUndo, onRedo }) => {
    return (
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl bg-white/80 px-2 py-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white/90 dark:bg-gray-900/80 dark:ring-white/10 dark:hover:bg-gray-900/90">
        <Tooltip title="撤回 (Ctrl+Z)">
          <Button
            size="small"
            type="text"
            icon={<Undo2 size={16} strokeWidth={2} />}
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-7 w-7 items-center justify-center p-0"
          />
        </Tooltip>
        <Tooltip title="还原 (Ctrl+Y)">
          <Button
            size="small"
            type="text"
            icon={<Redo2 size={16} strokeWidth={2} />}
            onClick={onRedo}
            disabled={!canRedo}
            className="flex h-7 w-7 items-center justify-center p-0"
          />
        </Tooltip>
      </div>
    );
  },
);

EditorToolbar.displayName = 'EditorToolbar';
