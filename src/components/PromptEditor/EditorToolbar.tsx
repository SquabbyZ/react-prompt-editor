import { Button, Tooltip } from 'antd';
import { Redo2, Undo2 } from 'lucide-react';
import React, { memo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { Locale } from '../../i18n/locales/zh-CN';

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: (e: React.MouseEvent) => void;
  onRedo: (e: React.MouseEvent) => void;
  locale?: Locale;
}

/**
 * 编辑器工具栏组件
 * 提供撤回/还原功能
 * 浮动在编辑器右上角
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = memo(
  ({ canUndo, canRedo, onUndo, onRedo, locale }) => {
    // 国际化 Hook
    const { t } = useI18n(locale);
    return (
      <div className="absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl bg-white/80 px-2 py-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white/90 dark:bg-gray-800/95 dark:ring-white/10 dark:hover:bg-gray-700/95">
        <Tooltip title={t('editor_toolbar.undo')}>
          <Button
            size="small"
            type="text"
            icon={
              <Undo2
                size={16}
                strokeWidth={2}
                className="text-gray-600 dark:text-gray-300"
              />
            }
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-7 w-7 items-center justify-center p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:text-gray-600"
          />
        </Tooltip>
        <Tooltip title={t('editor_toolbar.redo')}>
          <Button
            size="small"
            type="text"
            icon={
              <Redo2
                size={16}
                strokeWidth={2}
                className="text-gray-600 dark:text-gray-300"
              />
            }
            onClick={onRedo}
            disabled={!canRedo}
            className="flex h-7 w-7 items-center justify-center p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100 dark:disabled:text-gray-600"
          />
        </Tooltip>
      </div>
    );
  },
);

EditorToolbar.displayName = 'EditorToolbar';
