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
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = React.memo(
  ({ canUndo, canRedo, onUndo, onRedo }) => {
    return (
      <div className="flex items-center gap-1 border-b border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800">
        <Tooltip title="撤回 (Ctrl+Z)">
          <Button
            size="small"
            icon={<UndoOutlined />}
            onClick={onUndo}
            disabled={!canUndo}
            className="text-xs"
          />
        </Tooltip>
        <Tooltip title="还原 (Ctrl+Y)">
          <Button
            size="small"
            icon={<RedoOutlined />}
            onClick={onRedo}
            disabled={!canRedo}
            className="text-xs"
          />
        </Tooltip>
      </div>
    );
  },
);

EditorToolbar.displayName = 'EditorToolbar';
