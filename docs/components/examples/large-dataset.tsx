import { useIntl } from 'dumi';
import React from 'react';
import { enUS, PromptEditor, zhCN } from '../../../src';
import '../../../src/styles/tailwind.css';
import type { TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

type DatasetKey = '200' | '1000' | '2000';
type DemoLocale = 'zh-CN' | 'en-US';

interface GeneratorParams {
  totalNodes: number;
  rootCount: number;
  maxDepth: number;
}

interface DatasetPreset extends GeneratorParams {
  key: DatasetKey;
  label: string;
  data: TaskNode[];
}

interface TreeAnalysis {
  totalNodes: number;
  rootCount: number;
  maxDepth: number;
  levelCounts: number[];
}

interface DemoCopy {
  demoTitle: string;
  introTitle: string;
  introDescription: string;
  customTitle: string;
  customDescription: string;
  currentModeLabel: string;
  customModeLabel: string;
  totalNodesLabel: string;
  rootNodesLabel: string;
  maxDepthLabel: string;
  treeSummaryLabel: string;
  levelDistributionLabel: string;
  levelsUnit: string;
  totalNodesInput: string;
  rootNodesInput: string;
  maxDepthInput: string;
  generateButton: string;
  generatingButton: string;
  helperText: string;
  rootOnlySummary: (rootCount: string, maxDepth: string) => string;
  multiLevelSummary: (rootCount: string, maxDepth: string) => string;
  levelDistributionItem: (level: number, count: string) => string;
  nodeTitleLevel1: string;
  nodeTitleChild: string;
  nodeContent: (title: string, serial: string, level: number) => string;
  errors: {
    requiredInteger: string;
    totalMin: string;
    totalMax: string;
    rootMin: string;
    rootGreaterThanTotal: string;
    depthMin: string;
    depthMax: string;
    flatTreeTotalMismatch: string;
  };
  datasetConfigs: Array<{
    key: DatasetKey;
    label: string;
    rootCount: number;
    totalNodes: number;
    maxDepth: number;
  }>;
}

const COPY_BY_LOCALE: Record<DemoLocale, DemoCopy> = {
  'zh-CN': {
    demoTitle: '大数据示例',
    introTitle: '对比不同数据量档位',
    introDescription:
      '切换预置数据规模，直观看同一编辑器配置下的加载、展开和滚动体验。',
    customTitle: '手动生成测试数据',
    customDescription:
      '输入总节点数、根节点数和最大层级，生成一棵用于手动测试的层级树。',
    currentModeLabel: '当前模式',
    customModeLabel: '自定义',
    totalNodesLabel: '总节点数',
    rootNodesLabel: '根节点数',
    maxDepthLabel: '最大层级',
    treeSummaryLabel: '层级树摘要',
    levelDistributionLabel: '层级分布',
    levelsUnit: '层',
    totalNodesInput: '总节点数',
    rootNodesInput: '根节点数',
    maxDepthInput: '最大层级',
    generateButton: '生成数据',
    generatingButton: '生成中...',
    helperText: '支持最多 10000 个节点、10 层结构；系统会按总量优先自动分配各层节点。',
    rootOnlySummary: (rootCount, maxDepth) =>
      `${rootCount} 个根节点 -> 仅根节点结构 -> 最大 ${maxDepth} 层`,
    multiLevelSummary: (rootCount, maxDepth) =>
      `${rootCount} 个根节点 -> 多层分支结构 -> 最大 ${maxDepth} 层`,
    levelDistributionItem: (level, count) => `第 ${level} 层: ${count}`,
    nodeTitleLevel1: '提示词分组',
    nodeTitleChild: '层级节点',
    nodeContent: (title, serial, level) => `# ${title} ${serial}

这个节点来自大数据演示，用来模拟真实编辑时会出现的标题和正文长度。

- 路径：${serial}
- 层级：第 ${level} 层
- 目的：验证展开、收起、滚动和内容编辑时的表现

## 编辑说明

你可以直接修改文本、展开分支并上下滚动，观察编辑器在大规模树结构下的交互是否稳定。`,
    errors: {
      requiredInteger: '请输入有效的正整数。',
      totalMin: '总节点数必须大于 0。',
      totalMax: '总节点数不能超过 10000。',
      rootMin: '根节点数必须大于 0。',
      rootGreaterThanTotal: '根节点数不能大于总节点数。',
      depthMin: '最大层级必须大于或等于 1。',
      depthMax: '最大层级不能超过 10。',
      flatTreeTotalMismatch: '当最大层级为 1 时，总节点数必须等于根节点数。',
    },
    datasetConfigs: [
      { key: '200', label: '200 节点', rootCount: 20, totalNodes: 200, maxDepth: 4 },
      {
        key: '1000',
        label: '1000 节点',
        rootCount: 100,
        totalNodes: 1000,
        maxDepth: 4,
      },
      {
        key: '2000',
        label: '2000 节点',
        rootCount: 200,
        totalNodes: 2000,
        maxDepth: 4,
      },
    ],
  },
  'en-US': {
    demoTitle: 'Large Dataset Demo',
    introTitle: 'Compare Dataset Sizes',
    introDescription:
      'Switch presets to compare loading, expanding, and scrolling with the same editor configuration.',
    customTitle: 'Generate Custom Dataset',
    customDescription:
      'Enter total nodes, root nodes, and max depth to create a tree for manual testing.',
    currentModeLabel: 'Current Mode',
    customModeLabel: 'Custom',
    totalNodesLabel: 'Total Nodes',
    rootNodesLabel: 'Root Nodes',
    maxDepthLabel: 'Max Depth',
    treeSummaryLabel: 'Tree Summary',
    levelDistributionLabel: 'Level Distribution',
    levelsUnit: 'levels',
    totalNodesInput: 'Total Nodes',
    rootNodesInput: 'Root Nodes',
    maxDepthInput: 'Max Depth',
    generateButton: 'Generate Dataset',
    generatingButton: 'Generating...',
    helperText:
      'Supports up to 10000 nodes and 10 levels; the generator distributes nodes by exact total first.',
    rootOnlySummary: (rootCount, maxDepth) =>
      `${rootCount} roots -> root-only structure -> max depth ${maxDepth}`,
    multiLevelSummary: (rootCount, maxDepth) =>
      `${rootCount} roots -> multi-level branching -> max depth ${maxDepth}`,
    levelDistributionItem: (level, count) => `L${level}: ${count}`,
    nodeTitleLevel1: 'Prompt Section',
    nodeTitleChild: 'Layer Node',
    nodeContent: (title, serial, level) => `# ${title} ${serial}

This node belongs to the large dataset demo and keeps enough readable content for real editing scenarios.

- Path: ${serial}
- Depth: level ${level}
- Purpose: validate expand, collapse, scroll, and content editing behavior

## Editing Notes

Adjust the text, fold branches, and scroll through the tree to inspect how the editor handles larger prompt structures.`,
    errors: {
      requiredInteger: 'Please enter a valid positive integer.',
      totalMin: 'Total nodes must be greater than 0.',
      totalMax: 'Total nodes must not exceed 10000.',
      rootMin: 'Root nodes must be greater than 0.',
      rootGreaterThanTotal: 'Root nodes must not exceed total nodes.',
      depthMin: 'Max depth must be at least 1.',
      depthMax: 'Max depth must not exceed 10.',
      flatTreeTotalMismatch:
        'When max depth is 1, total nodes must equal root nodes.',
    },
    datasetConfigs: [
      { key: '200', label: '200 Nodes', rootCount: 20, totalNodes: 200, maxDepth: 4 },
      {
        key: '1000',
        label: '1000 Nodes',
        rootCount: 100,
        totalNodes: 1000,
        maxDepth: 4,
      },
      {
        key: '2000',
        label: '2000 Nodes',
        rootCount: 200,
        totalNodes: 2000,
        maxDepth: 4,
      },
    ],
  },
};

const DEFAULT_DATASET_KEY: DatasetKey = '200';
const MAX_TOTAL_NODES = 10000;
const MAX_TREE_DEPTH = 10;

function createNode(path: number[], level: number, copy: DemoCopy): TaskNode {
  const serial = path.map((part) => String(part).padStart(2, '0')).join('.');
  const titlePrefix =
    level === 1 ? copy.nodeTitleLevel1 : `${copy.nodeTitleChild} ${level}`;

  return {
    id: `node-${serial}`,
    title: `${titlePrefix} ${serial}`,
    content: copy.nodeContent(titlePrefix, serial, level),
    children: [],
    isLocked: false,
    hasRun: false,
  };
}

function createRoots(rootCount: number, copy: DemoCopy) {
  return Array.from({ length: rootCount }, (_, index) =>
    createNode([index + 1], 1, copy),
  );
}

function sumGeometricSeries(ratio: number, depth: number) {
  if (depth <= 0) {
    return 0;
  }

  if (Math.abs(ratio - 1) < 1e-6) {
    return depth;
  }

  return (1 - ratio ** depth) / (1 - ratio);
}

function estimateBranchRatio(params: GeneratorParams, actualDepth: number) {
  const target = params.totalNodes / params.rootCount;

  if (actualDepth <= 1 || target <= 1) {
    return 0;
  }

  let low = 0;
  let high = 1;

  while (sumGeometricSeries(high, actualDepth) < target) {
    high *= 2;
  }

  for (let index = 0; index < 40; index += 1) {
    const middle = (low + high) / 2;
    const seriesTotal = sumGeometricSeries(middle, actualDepth);

    if (seriesTotal < target) {
      low = middle;
    } else {
      high = middle;
    }
  }

  return high;
}

function buildLevelCounts(params: GeneratorParams) {
  const roots = params.rootCount;
  const remainingNodes = params.totalNodes - roots;
  const actualDepth = Math.min(
    params.maxDepth,
    Math.max(1, remainingNodes + 1),
  );

  if (actualDepth === 1 || remainingNodes <= 0) {
    return [roots];
  }

  const additionalLevels = actualDepth - 1;
  const minimumPerLevel = Array.from({ length: additionalLevels }, () => 1);
  const distributable = remainingNodes - additionalLevels;

  if (distributable <= 0) {
    return [roots, ...minimumPerLevel];
  }

  const ratio = estimateBranchRatio(params, actualDepth);
  const weights = Array.from({ length: additionalLevels }, (_, index) =>
    Math.max(0.25, ratio) ** (index + 1),
  );
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  const rawCounts = weights.map((weight) => (distributable * weight) / weightTotal);
  const flooredCounts = rawCounts.map((count) => Math.floor(count));
  let remainder =
    distributable - flooredCounts.reduce((sum, count) => sum + count, 0);
  const fractionalOrder = rawCounts
    .map((count, index) => ({
      index,
      fraction: count - flooredCounts[index],
    }))
    .sort((left, right) => right.fraction - left.fraction);

  for (let index = 0; index < fractionalOrder.length && remainder > 0; index += 1) {
    flooredCounts[fractionalOrder[index].index] += 1;
    remainder -= 1;
  }

  return [
    roots,
    ...minimumPerLevel.map(
      (minimum, index) => minimum + flooredCounts[index],
    ),
  ];
}

function buildLargeTree(params: GeneratorParams, copy: DemoCopy): TaskNode[] {
  const roots = createRoots(params.rootCount, copy);

  if (params.maxDepth === 1 || params.totalNodes <= params.rootCount) {
    return roots;
  }

  const levelCounts = buildLevelCounts(params);
  let parents = roots;

  for (let level = 2; level <= levelCounts.length; level += 1) {
    const nextParents: TaskNode[] = [];
    const childCountByParent = new Map<string, number>();
    const nodesForThisLevel = levelCounts[level - 1];
    const baseChildCount = Math.floor(nodesForThisLevel / parents.length);
    const extraChildCount = nodesForThisLevel % parents.length;

    for (let parentIndex = 0; parentIndex < parents.length; parentIndex += 1) {
      const parent = parents[parentIndex];
      const parentPath = parent.id.replace('node-', '').split('.').map(Number);
      const childTotalForParent =
        baseChildCount + (parentIndex < extraChildCount ? 1 : 0);

      for (let index = 0; index < childTotalForParent; index += 1) {
        const childCount = (childCountByParent.get(parent.id) ?? 0) + 1;

        childCountByParent.set(parent.id, childCount);

        const child = createNode([...parentPath, childCount], level, copy);
        parent.children = [...(parent.children ?? []), child];
        nextParents.push(child);
      }
    }

    parents = nextParents;
  }

  return roots;
}

function cloneTaskNodes(nodes: TaskNode[]): TaskNode[] {
  return nodes.map((node) => ({
    ...node,
    dependencies: node.dependencies ? [...node.dependencies] : undefined,
    children: node.children ? cloneTaskNodes(node.children) : [],
  }));
}

function analyzeTree(nodes: TaskNode[]): TreeAnalysis {
  const levelCounts: number[] = [];
  let totalNodes = 0;
  let maxDepth = 0;
  const stack = nodes.map((node) => ({ node, depth: 1 }));

  while (stack.length > 0) {
    const current = stack.pop();

    if (!current) {
      continue;
    }

    totalNodes += 1;
    maxDepth = Math.max(maxDepth, current.depth);
    levelCounts[current.depth - 1] = (levelCounts[current.depth - 1] ?? 0) + 1;

    const children = current.node.children ?? [];

    for (let index = children.length - 1; index >= 0; index -= 1) {
      stack.push({ node: children[index], depth: current.depth + 1 });
    }
  }

  return {
    totalNodes,
    rootCount: nodes.length,
    maxDepth,
    levelCounts,
  };
}

function createDatasetPresets(
  copy: DemoCopy,
): Record<DatasetKey, DatasetPreset> {
  return copy.datasetConfigs.reduce(
    (presets, config) => {
      presets[config.key] = {
        ...config,
        data: buildLargeTree(config, copy),
      };
      return presets;
    },
    {} as Record<DatasetKey, DatasetPreset>,
  );
}

const DATASET_PRESETS_BY_LOCALE: Record<
  DemoLocale,
  Record<DatasetKey, DatasetPreset>
> = {
  'zh-CN': createDatasetPresets(COPY_BY_LOCALE['zh-CN']),
  'en-US': createDatasetPresets(COPY_BY_LOCALE['en-US']),
};

function formatNumber(locale: DemoLocale, value: number) {
  return new Intl.NumberFormat(locale).format(value);
}

function getTreeSummary(copy: DemoCopy, locale: DemoLocale, stats: TreeAnalysis) {
  const rootCount = formatNumber(locale, stats.rootCount);
  const maxDepth = formatNumber(locale, stats.maxDepth);

  return stats.maxDepth <= 1
    ? copy.rootOnlySummary(rootCount, maxDepth)
    : copy.multiLevelSummary(rootCount, maxDepth);
}

function getLevelDistributionSummary(
  copy: DemoCopy,
  locale: DemoLocale,
  levelCounts: number[],
) {
  return levelCounts
    .map((count, index) =>
      copy.levelDistributionItem(index + 1, formatNumber(locale, count)),
    )
    .join(', ');
}

function parsePositiveInteger(value: string) {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  return Number(value);
}

function validateParams(
  values: { totalNodes: string; rootCount: string; maxDepth: string },
  copy: DemoCopy,
): { error: string | null; params: GeneratorParams | null } {
  const totalNodes = parsePositiveInteger(values.totalNodes);
  const rootCount = parsePositiveInteger(values.rootCount);
  const maxDepth = parsePositiveInteger(values.maxDepth);

  if (totalNodes === null || rootCount === null || maxDepth === null) {
    return { error: copy.errors.requiredInteger, params: null };
  }

  if (totalNodes <= 0) {
    return { error: copy.errors.totalMin, params: null };
  }

  if (totalNodes > MAX_TOTAL_NODES) {
    return { error: copy.errors.totalMax, params: null };
  }

  if (rootCount <= 0) {
    return { error: copy.errors.rootMin, params: null };
  }

  if (rootCount > totalNodes) {
    return { error: copy.errors.rootGreaterThanTotal, params: null };
  }

  if (maxDepth < 1) {
    return { error: copy.errors.depthMin, params: null };
  }

  if (maxDepth > MAX_TREE_DEPTH) {
    return { error: copy.errors.depthMax, params: null };
  }

  if (maxDepth === 1 && totalNodes !== rootCount) {
    return { error: copy.errors.flatTreeTotalMismatch, params: null };
  }

  return {
    error: null,
    params: {
      totalNodes,
      rootCount,
      maxDepth,
    },
  };
}

export default function LargeDatasetDemo() {
  const intl = useIntl();
  const locale: DemoLocale = intl.locale === 'en-US' ? 'en-US' : 'zh-CN';
  const copy = COPY_BY_LOCALE[locale];
  const datasetPresets = DATASET_PRESETS_BY_LOCALE[locale];
  const [currentMode, setCurrentMode] = React.useState<
    { type: 'preset'; presetKey: DatasetKey } | { type: 'custom' }
  >({
    type: 'preset',
    presetKey: DEFAULT_DATASET_KEY,
  });
  const [customValues, setCustomValues] = React.useState({
    totalNodes: '2000',
    rootCount: '200',
    maxDepth: '4',
  });
  const [customError, setCustomError] = React.useState<string | null>(null);
  const [value, setValue] = React.useState<TaskNode[]>(() =>
    cloneTaskNodes(datasetPresets[DEFAULT_DATASET_KEY].data),
  );
  const [isPending, startTransition] = React.useTransition();

  const stats = React.useMemo(() => analyzeTree(value), [value]);
  const currentModeLabel =
    currentMode.type === 'preset'
      ? datasetPresets[currentMode.presetKey].label
      : copy.customModeLabel;
  const treeSummary = React.useMemo(
    () => getTreeSummary(copy, locale, stats),
    [copy, locale, stats],
  );
  const levelDistribution = React.useMemo(
    () => getLevelDistributionSummary(copy, locale, stats.levelCounts),
    [copy, locale, stats.levelCounts],
  );

  React.useEffect(() => {
    setCurrentMode({ type: 'preset', presetKey: DEFAULT_DATASET_KEY });
    setCustomError(null);
    setValue(cloneTaskNodes(datasetPresets[DEFAULT_DATASET_KEY].data));
  }, [datasetPresets]);

  const handlePresetChange = (presetKey: DatasetKey) => {
    if (currentMode.type === 'preset' && currentMode.presetKey === presetKey) {
      return;
    }

    setCustomError(null);

    startTransition(() => {
      setCurrentMode({ type: 'preset', presetKey: presetKey });
      setValue(cloneTaskNodes(datasetPresets[presetKey].data));
    });
  };

  const handleCustomValueChange =
    (field: 'totalNodes' | 'rootCount' | 'maxDepth') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;

      setCustomValues((previous) => ({
        ...previous,
        [field]: nextValue,
      }));

      if (customError) {
        setCustomError(null);
      }
    };

  const handleGenerateCustomDataset = () => {
    const validation = validateParams(customValues, copy);

    if (validation.error || !validation.params) {
      setCustomError(validation.error);
      return;
    }

    setCustomError(null);

    startTransition(() => {
      setCurrentMode({ type: 'custom' });
      setValue(cloneTaskNodes(buildLargeTree(validation.params, copy)));
    });
  };

  return (
    <DemoWrapper height="760px" title={copy.demoTitle}>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div
          style={{
            borderBottom: '1px solid #e4e4e7',
            background: '#fafafa',
            padding: '16px',
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
              此示例设置了 <code>maxChildLevel={'{4}'}</code>，表示最多只能有 4 层子标题（根节点为第 1 层）。
              当达到最大层级时，&quot;添加子标题&quot; 按钮会自动隐藏。
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#18181b',
                  marginBottom: '4px',
                }}
              >
                {copy.introTitle}
              </div>
              <div style={{ fontSize: '13px', color: '#52525b' }}>
                {copy.introDescription}
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {copy.datasetConfigs.map((preset) => {
                const isActive =
                  currentMode.type === 'preset' &&
                  currentMode.presetKey === preset.key;

                return (
                  <button
                    key={preset.key}
                    type="button"
                    onClick={() => handlePresetChange(preset.key)}
                    disabled={isPending}
                    style={{
                      borderRadius: '999px',
                      border: isActive
                        ? '1px solid #2563eb'
                        : '1px solid #d4d4d8',
                      background: isActive ? '#2563eb' : '#ffffff',
                      color: isActive ? '#ffffff' : '#18181b',
                      padding: '8px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isPending ? 'progress' : 'pointer',
                      opacity: isPending && !isActive ? 0.7 : 1,
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              borderRadius: '12px',
              border: '1px solid #e4e4e7',
              background: '#ffffff',
              padding: '14px',
              marginBottom: '12px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#18181b',
                marginBottom: '4px',
              }}
            >
              {copy.customTitle}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: '#71717a',
                marginBottom: '12px',
              }}
            >
              {copy.customDescription}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                alignItems: 'end',
              }}
            >
              <label style={{ display: 'block' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#52525b',
                    marginBottom: '6px',
                  }}
                >
                  {copy.totalNodesInput}
                </div>
                <input
                  type="number"
                  min={1}
                  max={MAX_TOTAL_NODES}
                  value={customValues.totalNodes}
                  onChange={handleCustomValueChange('totalNodes')}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px solid #d4d4d8',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#18181b',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label style={{ display: 'block' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#52525b',
                    marginBottom: '6px',
                  }}
                >
                  {copy.rootNodesInput}
                </div>
                <input
                  type="number"
                  min={1}
                  max={MAX_TOTAL_NODES}
                  value={customValues.rootCount}
                  onChange={handleCustomValueChange('rootCount')}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px solid #d4d4d8',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#18181b',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <label style={{ display: 'block' }}>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#52525b',
                    marginBottom: '6px',
                  }}
                >
                  {copy.maxDepthInput}
                </div>
                <input
                  type="number"
                  min={1}
                  max={MAX_TREE_DEPTH}
                  value={customValues.maxDepth}
                  onChange={handleCustomValueChange('maxDepth')}
                  style={{
                    width: '100%',
                    borderRadius: '10px',
                    border: '1px solid #d4d4d8',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#18181b',
                    background: '#ffffff',
                    boxSizing: 'border-box',
                  }}
                />
              </label>

              <button
                type="button"
                onClick={handleGenerateCustomDataset}
                disabled={isPending}
                style={{
                  borderRadius: '10px',
                  border: '1px solid #2563eb',
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '10px 14px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isPending ? 'progress' : 'pointer',
                  height: '42px',
                }}
              >
                {isPending ? copy.generatingButton : copy.generateButton}
              </button>
            </div>

            <div
              style={{
                marginTop: '10px',
                fontSize: '12px',
                color: customError ? '#dc2626' : '#71717a',
              }}
            >
              {customError ?? copy.helperText}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '12px',
            }}
          >
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                background: '#ffffff',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#71717a' }}>
                {copy.currentModeLabel}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {currentModeLabel}
              </div>
            </div>
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                background: '#ffffff',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#71717a' }}>
                {copy.totalNodesLabel}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {formatNumber(locale, stats.totalNodes)}
              </div>
            </div>
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                background: '#ffffff',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#71717a' }}>
                {copy.rootNodesLabel}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {formatNumber(locale, stats.rootCount)}
              </div>
            </div>
            <div
              style={{
                borderRadius: '12px',
                border: '1px solid #e4e4e7',
                background: '#ffffff',
                padding: '12px',
              }}
            >
              <div style={{ fontSize: '12px', color: '#71717a' }}>
                {copy.maxDepthLabel}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                {formatNumber(locale, stats.maxDepth)} {copy.levelsUnit}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#52525b',
            }}
          >
            {copy.treeSummaryLabel}: {treeSummary}
          </div>
          <div
            style={{
              marginTop: '6px',
              fontSize: '13px',
              color: '#52525b',
            }}
          >
            {copy.levelDistributionLabel}: {levelDistribution}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 0 }}>
          <PromptEditor
            value={value}
            onChange={setValue}
            locale={locale === 'en-US' ? enUS : zhCN}
            maxChildLevel={4}
          />
        </div>
      </div>
    </DemoWrapper>
  );
}
