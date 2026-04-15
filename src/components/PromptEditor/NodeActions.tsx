import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  MoreOutlined,
  PlusOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, Dropdown, Popconfirm, Tooltip, message } from 'antd';
import React, { memo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import { useResolvedTheme, type ThemeMode } from '../../hooks/useResolvedTheme';
import type { Locale } from '../../i18n/locales/zh-CN';
import type { TaskNodeMinimal } from '../../types';

/**
 * 节点操作按钮属性
 */
export interface NodeActionsProps {
  /** 编辑器是否展开 */
  isEditorExpanded: boolean;
  /** 节点数据 */
  nodeData: TaskNodeMinimal;
  /** 是否显示所有按钮（宽度大于 650px 时为 true） */
  showAllButtons: boolean;
  /** 是否为移动端 */
  isMobile: boolean;
  /** 下拉菜单项 */
  menuItems: any[];
  /** 切换编辑器展开/折叠 */
  handleToggleEditor: (e: React.MouseEvent) => void;
  /** 添加子节点 */
  handleAddChild: (e: React.MouseEvent) => void;
  /** 锁定/解锁节点 */
  handleLock: (e: React.MouseEvent) => void;
  /** 删除节点 */
  handleDelete: (e?: React.MouseEvent) => void;
  /** 国际化配置 */
  locale?: Locale;
  /** 主题模式 */
  theme?: ThemeMode;
}

/**
 * 节点操作按钮组件 - 根据可用宽度动态显示
 *
 * 显示逻辑：
 * - 宽度 > 650px：显示编辑按钮 + 添加子节点 + 锁定/解锁 + 删除
 * - 宽度 ≤ 650px：显示编辑按钮 + 下拉菜单（三个点）
 */
export const NodeActions: React.FC<NodeActionsProps> = memo(
  ({
    isEditorExpanded,
    nodeData,
    showAllButtons,
    isMobile,
    menuItems,
    handleToggleEditor,
    handleAddChild,
    handleLock,
    handleDelete,
    locale,
    theme = 'system',
  }) => {
    const { t } = useI18n(locale);
    const { isDarkMode } = useResolvedTheme(theme);
    const ghostButtonClassName = isDarkMode
      ? 'text-slate-300 hover:bg-slate-700/80 hover:!text-slate-100'
      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900';
    const dangerButtonClassName = isDarkMode
      ? 'hover:bg-red-900/20'
      : 'hover:bg-red-50';

    return (
      <div className="relative z-20 flex flex-shrink-0 items-center gap-1">
        {/* 编辑按钮 - 始终显示 */}
        <Tooltip
          title={
            isEditorExpanded
              ? t('editor.collapseEditor')
              : t('editor.expandEditor')
          }
        >
          <Button
            type={isEditorExpanded ? 'primary' : 'text'}
            size="small"
            icon={<EditOutlined />}
            onClick={handleToggleEditor}
            aria-label={
              isEditorExpanded
                ? t('editor.collapseEditor')
                : t('editor.expandEditor')
            }
            className={
              isEditorExpanded
                ? ''
                : ghostButtonClassName
            }
          />
        </Tooltip>

        {/* 大屏显示独立按钮 - 宽度大于 650px 且非移动端 */}
        {showAllButtons && !isMobile && (
          <div className="flex items-center gap-1">
            <Tooltip
              title={
                nodeData.isLocked
                  ? t('editor.lockedCannotAddChild')
                  : t('editor.addChildNode')
              }
            >
              <Button
                type="text"
                size="small"
                icon={<PlusOutlined />}
                onClick={handleAddChild}
                disabled={nodeData.isLocked}
                aria-label={t('editor.addChildNode')}
                className={ghostButtonClassName}
              />
            </Tooltip>

            <Tooltip
              title={
                nodeData.hasRun
                  ? nodeData.isLocked
                    ? t('editor.unlockNode')
                    : t('editor.lockNode')
                  : t('editor.runFirst')
              }
            >
              <Button
                type="text"
                size="small"
                icon={nodeData.isLocked ? <UnlockOutlined /> : <LockOutlined />}
                onClick={handleLock}
                disabled={!nodeData.hasRun}
                aria-label={
                  nodeData.hasRun
                    ? nodeData.isLocked
                      ? t('editor.unlockNode')
                      : t('editor.lockNode')
                    : t('editor.runFirst')
                }
                className={`!text-inherit ${ghostButtonClassName}`}
              />
            </Tooltip>

            <Popconfirm
              title={t('editor.deleteNode')}
              description={t('editor.confirmDeleteNode')}
              onConfirm={handleDelete}
              onCancel={() => message.info(t('editor.cancelledDelete'))}
              okText={t('common.ok')}
              cancelText={t('common.cancel')}
              disabled={nodeData.isLocked}
            >
              <Tooltip
                title={
                  nodeData.isLocked
                    ? t('editor.lockedCannotDelete')
                    : t('editor.deleteNode')
                }
              >
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={nodeData.isLocked}
                  aria-label={t('editor.deleteNode')}
                  className={dangerButtonClassName}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        )}

        {/* 移动端/小屏幕显示下拉菜单 - 宽度小于等于 650px 时显示 */}
        {(isMobile || !showAllButtons) && (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined />}
              aria-label={t('common.edit')}
              className={ghostButtonClassName}
            />
          </Dropdown>
        )}
      </div>
    );
  },
);

NodeActions.displayName = 'NodeActions';
