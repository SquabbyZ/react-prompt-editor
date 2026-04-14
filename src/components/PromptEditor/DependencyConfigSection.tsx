import { ConfigProvider, Tag, TreeSelect } from 'antd';
import React, { memo } from 'react';
import { useResolvedTheme, type ThemeMode } from '../../hooks/useResolvedTheme';
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
  theme?: ThemeMode;
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
      theme = 'system',
    }) => {
      // 国际化 Hook
      const { t } = useI18n(locale);
      const { isDarkMode } = useResolvedTheme(theme);

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
        <div
          className={`prompt-editor-dependency-section border-t px-3 py-2 ${
            isDarkMode
              ? 'prompt-editor-dependency-section-dark border-indigo-900/40 bg-[#081428]'
              : 'border-indigo-200 bg-indigo-50/50'
          }`}
        >
          {isDarkMode && (
            <style>{`
              .prompt-editor-dependency-section-dark .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector {
                background: rgba(15, 23, 42, 0.92) !important;
                border-color: rgba(59, 130, 246, 0.18) !important;
                color: rgb(226, 232, 240) !important;
              }
              .prompt-editor-dependency-section-dark .ant-select-outlined:not(.ant-select-customize-input) .ant-select-selector:hover {
                border-color: rgba(99, 102, 241, 0.45) !important;
              }
              .prompt-editor-dependency-section-dark .ant-select-outlined:not(.ant-select-customize-input).ant-select-focused .ant-select-selector {
                border-color: rgb(99, 102, 241) !important;
                box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.16) !important;
              }
              .prompt-editor-dependency-section-dark .ant-select-selection-placeholder {
                color: rgb(100, 116, 139) !important;
              }
              .prompt-editor-dependency-section-dark .ant-select-selection-item {
                color: rgb(226, 232, 240) !important;
              }
              .prompt-editor-dependency-section-dark .ant-select-arrow,
              .prompt-editor-dependency-section-dark .ant-select-clear {
                color: rgb(148, 163, 184) !important;
              }
              .prompt-editor-treeselect-dropdown-dark.ant-select-dropdown {
                background: rgb(10, 18, 34) !important;
                border: 1px solid rgba(59, 130, 246, 0.18) !important;
                box-shadow: 0 20px 60px rgba(2, 6, 23, 0.45) !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree {
                color: rgb(226, 232, 240) !important;
                background: transparent !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-node-content-wrapper {
                color: rgb(226, 232, 240) !important;
                background: transparent !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-node-content-wrapper:hover {
                background: rgba(30, 41, 59, 0.72) !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-switcher,
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-indent-unit:before {
                color: rgb(148, 163, 184) !important;
                border-color: rgba(71, 85, 105, 0.45) !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-treenode,
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-list-holder-inner {
                background: transparent !important;
                color: rgb(226, 232, 240) !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-treenode-selected,
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-treenode-selected > .ant-select-tree-node-content-wrapper,
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-node-content-wrapper.ant-select-tree-node-selected {
                background: rgba(37, 99, 235, 0.18) !important;
                color: rgb(241, 245, 249) !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-treenode-selected:hover,
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-treenode-selected:hover > .ant-select-tree-node-content-wrapper {
                background: rgba(37, 99, 235, 0.24) !important;
              }
              .prompt-editor-treeselect-dropdown-dark .ant-select-tree-treenode-disabled > .ant-select-tree-node-content-wrapper {
                color: rgb(100, 116, 139) !important;
                opacity: 0.55 !important;
              }
            `}</style>
          )}
          <div className="mb-2 flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                isDarkMode ? 'text-slate-200' : 'text-gray-700'
              }`}
            >
              {t('dependency.dependencies')}
            </span>
            <span
              className={`text-[10px] ${
                isDarkMode ? 'text-slate-400' : 'text-gray-500'
              }`}
            >
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
            <div
              className={`mb-2 rounded border border-dashed px-2 py-1.5 text-xs ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-900/70 text-slate-400'
                  : 'border-gray-300 bg-gray-50 text-gray-500'
              }`}
            >
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
                    token: {
                      colorText: 'rgb(226, 232, 240)',
                    },
                  }
                : undefined
            }
          >
            <TreeSelect
              className="w-full"
              popupClassName={
                isDarkMode
                  ? 'prompt-editor-treeselect-dropdown-dark'
                  : 'prompt-editor-treeselect-dropdown'
              }
              treeData={treeData}
              placeholder={t('dependency.selectDependencyPlaceholder')}
              allowClear
              treeDefaultExpandAll
              getPopupContainer={(triggerNode) =>
                triggerNode.parentElement ?? document.body
              }
              styles={{
                popup: {
                  root: {
                    maxHeight: 400,
                    overflow: 'auto',
                  },
                },
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
