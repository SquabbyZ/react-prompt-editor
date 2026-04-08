import { Input, message, Tag } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface EditableTitleProps {
  nodeId: string;
  title: string;
  number: string;
  isLocked: boolean;
  content: string;
  onTitleChange: (id: string, title: string) => void;
  onContentChange: (id: string, content: string) => void;
  onClick?: () => void;
}

/**
 * 可编辑标题组件
 * - 单击展开/折叠子节点
 * - 双击编辑标题
 * - 自动同步更新 Markdown 内容中的标题
 */
export const EditableTitle: React.FC<EditableTitleProps> = React.memo(
  ({
    nodeId,
    title,
    number,
    isLocked,
    content,
    onTitleChange,
    onContentChange,
    onClick,
  }) => {
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
      if (isLocked) {
        message.warning('节点已锁定，无法编辑');
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

        // 同步更新编辑器内容中的标题
        const lines = content.split('\n');

        // 检查第一行是否是 Markdown 标题
        if (lines.length > 0 && lines[0].startsWith('#')) {
          // 提取标题级别（# 的数量）
          const match = lines[0].match(/^(#+)\s*/);
          if (match) {
            const level = match[1]; // 例如: "#", "##", "###"
            // 替换为新标题
            lines[0] = `${level} ${trimmed}`;
            const newContent = lines.join('\n');
            onContentChange(nodeId, newContent);
          }
        } else {
          // 如果第一行不是标题，在第一行插入标题
          const newContent = `# ${trimmed}\n${content}`;
          onContentChange(nodeId, newContent);
        }
        message.success('标题修改成功');
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
        className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100"
        title={!isEditing ? title : undefined}
      >
        <Tag color="default" className="px-1 text-xs">
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
            className="-mx-1 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={handleClick}
            onDoubleClick={handleStartEdit}
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
