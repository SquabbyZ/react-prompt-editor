import { Input, message, Tag } from 'antd';
import React, { memo, useEffect, useRef, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useResolvedTheme, type ThemeMode } from '../../hooks/useResolvedTheme';
import type { Locale } from '../../i18n/locales/zh-CN';

interface EditableTitleProps {
  nodeId: string;
  title: string;
  number: string;
  isLocked: boolean;
  onTitleChange: (id: string, title: string) => void;
  onClick?: () => void;
  previewMode?: boolean;
  locale?: Locale;
  theme?: ThemeMode;
}

/**
 * 可编辑标题组件
 * - 单击展开/折叠子节点
 * - 双击编辑标题
 */
export const EditableTitle: React.FC<EditableTitleProps> = memo(
  ({
    nodeId,
    title,
    number,
    isLocked,
    onTitleChange,
    onClick,
    previewMode = false,
    locale,
    theme = 'system',
  }) => {
    // 国际化 Hook
    const { t } = useI18n(locale);
    const { isDarkMode } = useResolvedTheme(theme);
    const [isEditing, setIsEditing] = useState(false);
    const [titleValue, setTitleValue] = useState(title);
    const inputRef = useRef<any>(null);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 自动聚焦和选中
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
      // 组件卸载时清理定时器
      return () => {
        if (clickTimeoutRef.current) {
          clearTimeout(clickTimeoutRef.current);
        }
      };
    }, [isEditing]);

    // 开始编辑标题
    const handleStartEdit = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (previewMode) {
        message.warning(t('editor.previewModeNoEdit'));
        return;
      }
      if (isLocked) {
        message.warning(t('editor.lockedCannotEdit'));
        return;
      }
      // 清除单击定时器，执行双击逻辑
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }
      setTitleValue(title);
      setIsEditing(true);
    };

    // 保存标题
    const handleSave = () => {
      const trimmed = titleValue.trim();
      if (trimmed) {
        // 更新标题
        onTitleChange(nodeId, trimmed);
        message.success(t('editor.titleUpdated'));
      } else {
        message.warning('标题不能为空');
      }
      setIsEditing(false);
    };

    // 取消编辑
    const handleCancel = () => {
      setTitleValue(title);
      setIsEditing(false);
      message.info('已取消编辑');
    };

    // 键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSave();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    // 单击处理
    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick?.();
    };

    return (
      <span
        className="prompt-editor-node-title flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-inherit"
        title={!isEditing ? title : undefined}
      >
        <Tag
          color="default"
          className={`prompt-editor-node-title-number flex-shrink-0 px-1 text-xs ${
            isDarkMode
              ? '!border-slate-700 !bg-slate-950/80 !text-slate-100'
              : '!border-gray-300 !bg-white !text-gray-700'
          }`}
        >
          {number}
        </Tag>
        {isEditing ? (
          <Input
            ref={inputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            size="small"
            autoFocus
          />
        ) : (
          <span
            className={`prompt-editor-node-title-text -mx-1 overflow-hidden text-ellipsis whitespace-nowrap rounded px-1 py-0.5 text-inherit ${
              !previewMode
                ? isDarkMode
                  ? 'cursor-pointer hover:bg-white/5'
                  : 'cursor-pointer hover:bg-black/5'
                : ''
            }`}
            onClick={handleClick}
            onDoubleClick={!previewMode ? handleStartEdit : undefined}
            title={title}
          >
            {title}
          </span>
        )}
      </span>
    );
  },
);

EditableTitle.displayName = 'EditableTitle';
