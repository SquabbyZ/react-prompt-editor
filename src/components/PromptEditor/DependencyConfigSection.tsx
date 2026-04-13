import { ConfigProvider, Tag, TreeSelect } from 'antd';
import React, { memo, useEffect, useState } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { Locale } from '../../i18n/locales/zh-CN';

interface DependencyConfigSectionProps {
  nodeId: string;
  dependencies: string[];
  onUpdateDependencies: (id: string, deps: string[]) => void;
  getNodeNumber: (id: string) => string;
  availableNodes: Array<{
    id: string;
    title: string;
    number: string;
    hasRun: boolean;
    parentId?: string;
    children: string[];
  }>;
  locale?: Locale;
}

/**
 * 依赖任务配置组件
 * 提供树形选择器来配置节点依赖关系
 */
export const DependencyConfigSection: React.FC<DependencyConfigSectionProps> =
  memo(
    ({
      nodeId,
      dependencies,
      onUpdateDependencies,
      getNodeNumber,
      availableNodes,
      locale,
    }) => {
      // 国际化 Hook
      const { t } = useI18n(locale);
      // 检测暗色模式
      const [isDarkMode, setIsDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
          const html = document.documentElement;
          return (
            html.classList.contains('dark') ||
            html.getAttribute('data-theme') === 'dark' ||
            html.getAttribute('data-prefers-color') === 'dark'
          );
        }
        return false;
      });

      // 监听主题变化
      useEffect(() => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme' || mutation.attributeName === 'data-prefers-color') {
              const html = document.documentElement;
              const dark =
                html.classList.contains('dark') ||
                html.getAttribute('data-theme') === 'dark' ||
                html.getAttribute('data-prefers-color') === 'dark';
              setIsDarkMode(dark);
            }
          });
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class', 'data-theme', 'data-prefers-color'],
        });

        return () => observer.disconnect();
      }, []);

      // 获取已选择的依赖节点信息
      const selectedDeps = dependencies
        .map((depId) => {
          const depNode = availableNodes.find((n) => n.id === depId);
          return depNode ? { ...depNode, number: getNodeNumber(depId) } : null;
        })
        .filter(Boolean) as Array<{
        id: string;
        title: string;
        number: string;
      }>;

      const handleAddDependency = (depId: string) => {
        if (depId && !dependencies.includes(depId)) {
          onUpdateDependencies(nodeId, [...dependencies, depId]);
        }
      };

      const handleRemoveDependency = (depId: string) => {
        onUpdateDependencies(
          nodeId,
          dependencies.filter((id) => id !== depId),
        );
      };

      // 判断节点是否可选：
      // 1. 已锁定（hasRun=true）
      // 2. 不是自身
      // 3. 未在选择列表中
      const isNodeSelectable = (nodeIdToCheck: string): boolean => {
        if (nodeIdToCheck === nodeId) return false;
        if (dependencies.includes(nodeIdToCheck)) return false;
        const node = availableNodes.find((n) => n.id === nodeIdToCheck);
        if (!node) return false;
        return node.hasRun;
      };

      // 构建树形数据结构
      const buildChildrenTree = (
        childrenIds: string[],
        allNodes: typeof availableNodes,
        _level: number,
      ): Array<{
        title: React.ReactNode;
        value: string;
        key: string;
        disabled: boolean;
        children?: any[];
      }> => {
        return childrenIds
          .map((childId) => {
            const childNode = allNodes.find((n) => n.id === childId);
            if (!childNode) return null;
            return {
              title: (
                <div className="flex w-full items-center justify-between gap-1">
                  <span className="flex-1 truncate">
                    <span className="mr-1 font-bold">[{childNode.number}]</span>
                    {childNode.title}
                  </span>
                  {childNode.hasRun && (
                    <Tag
                      color="green"
                      className="flex-shrink-0 px-1 py-0 text-xs font-bold"
                      style={{ fontSize: '10px', lineHeight: '18px' }}
                    >
                      {t('editor.nodeLocked')}
                    </Tag>
                  )}
                </div>
              ),
              value: childNode.id,
              key: childNode.id,
              disabled: !isNodeSelectable(childNode.id),
              children:
                childNode.children.length > 0
                  ? buildChildrenTree(childNode.children, allNodes, _level + 1)
                  : undefined,
            };
          })
          .filter(Boolean) as any[];
      };

      const buildTreeData = (
        nodes: typeof availableNodes,
      ): Array<{
        title: React.ReactNode;
        value: string;
        key: string;
        disabled: boolean;
        children?: any[];
      }> => {
        return nodes
          .filter((node) => !node.parentId)
          .map((rootNode) => ({
            title: (
              <div className="flex w-full items-center justify-between gap-1">
                <span className="flex-1 truncate">
                  <span className="mr-1 font-bold">[{rootNode.number}]</span>
                  {rootNode.title}
                </span>
                {rootNode.hasRun && (
                  <Tag
                    color="green"
                    className="flex-shrink-0 px-1 py-0 text-xs font-bold"
                    style={{ fontSize: '10px', lineHeight: '18px' }}
                  >
                    {t('editor.nodeLocked')}
                  </Tag>
                )}
              </div>
            ),
            value: rootNode.id,
            key: rootNode.id,
            disabled: !isNodeSelectable(rootNode.id),
            children:
              rootNode.children.length > 0
                ? buildChildrenTree(rootNode.children, nodes, 1)
                : undefined,
          }));
      };

      const treeData = buildTreeData(availableNodes);

      return (
        <div className="border-t border-indigo-200 bg-indigo-50/50 px-3 py-2 dark:border-indigo-900/50 dark:bg-gray-900/80">
          {isDarkMode && (
            <style>{`
              .dark-mode-treeselect-popup {
                background-color: rgb(39, 39, 42) !important;
                border-color: rgb(55, 65, 81) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree {
                color: rgb(209, 213, 219) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree-node-content-wrapper {
                color: rgb(209, 213, 219) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree-node-content-wrapper:hover {
                background-color: rgba(75, 85, 99, 0.6) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree-node-selected {
                background-color: rgb(55, 65, 81) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree-treenode-disabled > .ant-select-tree-node-content-wrapper {
                color: rgb(107, 114, 128) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree-indent-unit:before {
                border-color: rgb(55, 65, 81) !important;
              }
              .dark-mode-treeselect-popup .ant-select-tree-switcher {
                color: rgb(209, 213, 219) !important;
              }
              .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector {
                background-color: rgb(39, 39, 42) !important;
                border-color: rgb(55, 65, 81) !important;
                color: rgb(209, 213, 219) !important;
              }
              .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector:hover {
                border-color: rgb(75, 85, 99) !important;
              }
              .ant-select-outlined:not(.ant-select-customize-input).ant-select-focused .ant-select-selector {
                border-color: rgb(99, 102, 241) !important;
              }
              .ant-select-selection-placeholder {
                color: rgb(107, 114, 128) !important;
              }
              .ant-select-selection-item {
                color: rgb(209, 213, 219) !important;
              }
              .ant-select-arrow {
                color: rgb(107, 114, 128) !important;
              }
              .ant-select-clear {
                color: rgb(107, 114, 128) !important;
              }
              .ant-select-clear:hover {
                color: rgb(156, 163, 175) !important;
              }
              /* 下拉面板容器 */
              .dark-mode-treeselect-popup.ant-select-dropdown {
                background-color: rgb(39, 39, 42) !important;
                border-color: rgb(55, 65, 81) !important;
              }
              /* 下拉选项容器 */
              .dark-mode-treeselect-popup .ant-select-tree-treenode {
                color: rgb(209, 213, 219) !important;
              }
              /* 下拉选项内容 */
              .dark-mode-treeselect-popup .ant-select-tree-node-content-wrapper {
                color: rgb(209, 213, 219) !important;
                background-color: transparent !important;
              }
              /* 下拉选项hover */
              .dark-mode-treeselect-popup .ant-select-tree-node-content-wrapper:hover {
                background-color: rgba(75, 85, 99, 0.6) !important;
                color: rgb(209, 213, 219) !important;
              }
              /* 下拉选项选中 - 确保暗色模式下背景为暗色 */
              .dark-mode-treeselect-popup .ant-select-tree-treenode-selected,
              .dark-mode-treeselect-popup .ant-select-tree-treenode-selected .ant-select-tree-node-content-wrapper,
              .dark-mode-treeselect-popup .ant-select-tree .ant-select-tree-treenode-selected,
              .dark-mode-treeselect-popup .ant-select-tree .ant-select-tree-treenode-selected .ant-select-tree-node-content-wrapper {
                background-color: rgb(55, 65, 81) !important;
                color: rgb(209, 213, 219) !important;
              }
              /* 强制覆盖所有选中相关元素的白色背景 - 使用更高优先级 */
              .dark-mode-treeselect-popup .ant-select-tree-treenode.ant-select-tree-treenode-selected,
              .dark-mode-treeselect-popup .ant-select-tree-treenode.ant-select-tree-treenode-selected > .ant-select-tree-node-content-wrapper,
              .dark-mode-treeselect-popup .ant-select-tree-treenode-selected .ant-select-tree-node-content-wrapper,
              .dark-mode-treeselect-popup .ant-select-tree .ant-select-tree-treenode-selected .ant-select-tree-node-content-wrapper,
              .dark-mode-treeselect-popup .ant-select-tree .ant-select-tree-node-selected,
              .dark-mode-treeselect-popup .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected,
              .dark-mode-treeselect-popup .ant-select-tree-node-selected .ant-select-tree-node-content-wrapper,
              .dark-mode-treeselect-popup span.ant-select-tree-node-content-wrapper.ant-select-tree-node-selected,
              .dark-mode-treeselect-popup div.ant-select-tree-treenode.ant-select-tree-treenode-selected {
                background-color: rgb(55, 65, 81) !important;
                color: rgb(209, 213, 219) !important;
              }
              /* 选中状态hover时保持暗色背景 */
              .dark-mode-treeselect-popup .ant-select-tree-treenode-selected:hover,
              .dark-mode-treeselect-popup .ant-select-tree-treenode-selected:hover .ant-select-tree-node-content-wrapper,
              .dark-mode-treeselect-popup .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected:hover {
                background-color: rgba(75, 85, 99, 0.8) !important;
                color: rgb(209, 213, 219) !important;
              }
              /* 强制覆盖所有选中相关元素的白色背景 */
              .dark-mode-treeselect-popup [class*="selected"],
              .dark-mode-treeselect-popup .ant-select-tree-treenode-selected *,
              .dark-mode-treeselect-popup div[class*="-selected"] {
                background-color: rgb(55, 65, 81) !important;
              }
              /* 下拉选项禁用 */
              .dark-mode-treeselect-popup .ant-select-tree-treenode-disabled > .ant-select-tree-node-content-wrapper {
                color: rgb(107, 114, 128) !important;
                opacity: 0.5 !important;
              }
            `}</style>
          )}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {t('dependency.dependencies')}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              {t('dependency.canOnlySelectLockedNodes')}
            </span>
          </div>

          {/* 已选择的依赖标签 */}
          {selectedDeps.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-1">
              {selectedDeps.map((dep) => (
                <Tag
                  key={dep.id}
                  closable
                  onClose={() => handleRemoveDependency(dep.id)}
                  color="blue"
                  className="max-w-[200px]"
                >
                  <span
                    className="font-bold"
                    style={{ fontFamily: 'monospace' }}
                  >
                    [{dep.number}]
                  </span>
                  <span title={dep.title}>
                    {dep.title.length > 15
                      ? `${dep.title.slice(0, 15)}...`
                      : dep.title}
                  </span>
                </Tag>
              ))}
            </div>
          ) : (
            <div className="mb-2 rounded border border-dashed border-gray-300 bg-gray-50 px-2 py-1.5 text-xs text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {t('dependency.noDependencies')}
            </div>
          )}

          {/* 添加依赖 */}
          <ConfigProvider
            theme={
              isDarkMode
                ? {
                    components: {
                      TreeSelect: {
                        colorBgElevated: 'rgb(39, 39, 42)',
                        colorText: 'rgb(209, 213, 219)',
                        colorBorder: 'rgb(55, 65, 81)',
                        colorBgContainer: 'rgb(39, 39, 42)',
                        colorBgSpotlight: 'rgb(55, 65, 81)',
                        colorFillSecondary: 'rgba(75, 85, 99, 0.6)',
                        colorFill: 'rgba(75, 85, 99, 0.8)',
                        colorPrimary: 'rgb(129, 140, 248)',
                        colorBgBase: 'rgb(39, 39, 42)',
                        colorTextPlaceholder: 'rgb(107, 114, 128)',
                      },
                      Tree: {
                        colorBgElevated: 'rgb(39, 39, 42)',
                        colorText: 'rgb(209, 213, 219)',
                        colorBorder: 'rgb(55, 65, 81)',
                        colorBgContainer: 'rgb(39, 39, 42)',
                        nodeSelectedBg: 'rgb(55, 65, 81)',
                        nodeHoverBg: 'rgba(75, 85, 99, 0.6)',
                      },
                    },
                  }
                : undefined
            }
          >
            <TreeSelect
              className="w-full"
              popupClassName="dark-mode-treeselect-popup"
              treeData={treeData}
              placeholder={t('dependency.selectDependencyPlaceholder')}
              allowClear
              treeDefaultExpandAll
              styles={{
                popup: {
                  root: { 
                    maxHeight: 400, 
                    overflow: 'auto',
                  }
                }
              }}
              onChange={(value) => {
                if (value) {
                  handleAddDependency(value as string);
                }
              }}
              treeNodeFilterProp="title"
              showSearch
            />
          </ConfigProvider>
        </div>
      );
    },
  );

DependencyConfigSection.displayName = 'DependencyConfigSection';
