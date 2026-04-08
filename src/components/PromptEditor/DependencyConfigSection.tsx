import { Tag, TreeSelect } from 'antd';
import React from 'react';

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
}

/**
 * 依赖任务配置组件
 * 提供树形选择器来配置节点依赖关系
 */
export const DependencyConfigSection: React.FC<DependencyConfigSectionProps> =
  React.memo(
    ({
      nodeId,
      dependencies,
      onUpdateDependencies,
      getNodeNumber,
      availableNodes,
    }) => {
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
                <span>
                  <span className="mr-1 font-bold">[{childNode.number}]</span>
                  {childNode.title}
                  {childNode.hasRun && (
                    <Tag color="green" className="px-2 py-1 text-xs font-bold">
                      已锁定
                    </Tag>
                  )}
                </span>
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
              <span>
                <span className="mr-1 font-bold">[{rootNode.number}]</span>
                {rootNode.title}
                {rootNode.hasRun && (
                  <Tag color="green" className="px-2 py-1 text-xs font-bold">
                    已锁定
                  </Tag>
                )}
              </span>
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
        <div className="border-t border-indigo-200 bg-indigo-50/50 px-3 py-2 dark:border-indigo-800 dark:bg-indigo-950/20">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              依赖任务
            </span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">
              只能选择已锁定且序号靠前的节点
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
              暂无依赖，点击下方按钮添加（只能选择已锁定的前置节点）
            </div>
          )}

          {/* 添加依赖 */}
          <TreeSelect
            className="w-full"
            treeData={treeData}
            placeholder="选择依赖节点（只能选择已锁定的节点）"
            allowClear
            treeDefaultExpandAll
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            onChange={(value) => {
              if (value) {
                handleAddDependency(value as string);
              }
            }}
            treeNodeFilterProp="title"
            showSearch
          />
        </div>
      );
    },
  );

DependencyConfigSection.displayName = 'DependencyConfigSection';
