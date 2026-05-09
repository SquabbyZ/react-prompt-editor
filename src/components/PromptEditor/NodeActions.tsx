import {
  Trash2,
  Pencil,
  Lock,
  MoreHorizontal,
  Plus,
  Unlock,
} from 'lucide-react';
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
  /** 当前节点层级 */
  currentLevel?: number;
  /** 最大子标题层级限制 */
  maxChildLevel?: number;
  /** 子节点树形结构（用于删除确认提示） */
  childNodesTree?: Array<{
    id: string;
    title: string;
    level: number;
    children: Array<{
      id: string;
      title: string;
      level: number;
      children: any[];
    }>;
  }> | null;
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
    currentLevel,
    maxChildLevel,
    childNodesTree = null,
  }) => {
    const { t } = useI18n(locale);
    const { isDarkMode } = useResolvedTheme(theme);
    const ghostButtonClassName = isDarkMode
      ? 'text-slate-300 hover:bg-slate-700/80 hover:!text-slate-100'
      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900';
    const dangerButtonClassName = isDarkMode
      ? 'hover:bg-red-900/20'
      : 'hover:bg-red-50';

    // 计算是否应该显示添加子节点按钮
    const shouldShowAddChildButton = React.useMemo(() => {
      if (maxChildLevel === undefined || maxChildLevel === null) {
        return true; // 未设置限制，始终显示
      }
      if (currentLevel === undefined) {
        return true; // 无法获取层级，默认显示
      }
      // currentLevel 是当前节点的层级（根节点为第 1 层），如果当前层级 >= 最大层级，则不显示
      return currentLevel < maxChildLevel;
    }, [currentLevel, maxChildLevel]);

    // 渲染树形节点（递归）
    const renderTreeNodes = (
      nodes: Array<{
        id: string;
        title: string;
        level: number;
        children: any[];
      }>,
      prefix = '',
    ) => {
      return nodes.map((node, index) => {
        const currentPrefix = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
        const hasChildren = node.children.length > 0;
        return (
          <div key={node.id || index} className="py-0.5">
            <div className="flex items-center gap-1">
              {node.level > 1 && (
                <span className="text-gray-400">
                  {'  '.repeat(node.level - 1)}
                </span>
              )}
              <span className={hasChildren ? 'font-medium text-orange-600 dark:text-orange-400' : ''}>
                {node.level > 1 && '└ '}
                <span className="text-orange-500 mr-1">{currentPrefix}.</span>
                {node.title}
              </span>
              {hasChildren && (
                <span className="text-xs text-gray-400 ml-1">
                  ({node.children.length})
                </span>
              )}
            </div>
            {hasChildren && renderTreeNodes(node.children, currentPrefix)}
          </div>
        );
      });
    };

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
            icon={<Pencil size={14} />}
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
            {shouldShowAddChildButton && (
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
                  icon={<Plus size={14} />}
                  onClick={handleAddChild}
                  disabled={nodeData.isLocked}
                  aria-label={t('editor.addChildNode')}
                  className={ghostButtonClassName}
                />
              </Tooltip>
            )}

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
                icon={nodeData.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
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
              description={
                <div className="py-1">
                  <div className="mb-2">{t('editor.confirmDeleteNode')}</div>
                  {childNodesTree && childNodesTree.length > 0 && (
                    <div className="text-xs text-orange-500">
                      <div className="mb-1 font-medium">
                        {t('editor.willDeleteChildren') || '将同时删除以下子标题：'}
                      </div>
                      <div className="max-h-24 overflow-y-auto rounded bg-orange-50 p-2 dark:bg-orange-900/20">
                        {renderTreeNodes(childNodesTree)}
                      </div>
                    </div>
                  )}
                </div>
              }
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
                  icon={<Trash2 size={14} />}
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
              icon={<MoreHorizontal size={14} />}
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
