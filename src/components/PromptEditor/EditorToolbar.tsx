import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
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
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg bg-white/90 p-1.5 shadow-md backdrop-blur-sm dark:bg-gray-900/90">
        <Tooltip title="撤回 (Ctrl+Z)">
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
            className="h-7 w-7"
          />
        </Tooltip>
        <Tooltip title="还原 (Ctrl+Y)">
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
            className="h-7 w-7"
          />
        </Tooltip>
      </div>
    );
  },
);

EditorToolbar.displayName = 'EditorToolbar';
