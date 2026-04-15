import { Button, Tooltip } from 'antd';
import { Redo2, Undo2 } from 'lucide-react';
import React, { memo } from 'react';
import { useResolvedTheme, type ThemeMode } from '../../hooks/useResolvedTheme';
import { useI18n } from '../../hooks/useI18n';
import type { Locale } from '../../i18n/locales/zh-CN';

interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: (e: React.MouseEvent) => void;
  onRedo: (e: React.MouseEvent) => void;
  locale?: Locale;
  theme?: ThemeMode;
  inline?: boolean;
}

/**
 * 编辑器工具栏组件
 * 提供撤回/还原功能
 * 浮动在编辑器右上角
 */
export const EditorToolbar: React.FC<EditorToolbarProps> = memo(
  ({
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    locale,
    theme = 'system',
    inline = false,
  }) => {
    // 国际化 Hook
    const { t } = useI18n(locale);
    const { isDarkMode } = useResolvedTheme(theme);

    const toolbarClassName = inline
      ? 'flex items-center gap-1.5'
      : isDarkMode
        ? 'absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl border border-blue-500/10 bg-[rgba(8,20,40,0.92)] px-2 py-1.5 shadow-[0_10px_30px_rgba(2,6,23,0.35)] ring-1 ring-white/5 backdrop-blur-md transition-all hover:bg-[rgba(10,26,48,0.96)]'
        : 'absolute right-3 top-3 z-10 flex items-center gap-1.5 rounded-xl bg-white/80 px-2 py-1.5 shadow-lg ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white/90';

    const iconClassName = isDarkMode ? 'text-slate-300' : 'text-gray-600';
    const buttonClassName = isDarkMode
      ? 'flex h-7 w-7 items-center justify-center p-0 text-slate-300 hover:bg-slate-800/80 hover:text-slate-100 disabled:text-slate-600'
      : 'flex h-7 w-7 items-center justify-center p-0 text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400';

    return (
      <div className={toolbarClassName}>
        <Tooltip title={t('editor_toolbar.undo')}>
          <Button
            size="small"
            type="text"
            icon={
              <Undo2
                size={16}
                strokeWidth={2}
                className={iconClassName}
              />
            }
            onClick={onUndo}
            disabled={!canUndo}
            className={buttonClassName}
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
                className={iconClassName}
              />
            }
            onClick={onRedo}
            disabled={!canRedo}
            className={buttonClassName}
          />
        </Tooltip>
      </div>
    );
  },
);

EditorToolbar.displayName = 'EditorToolbar';
