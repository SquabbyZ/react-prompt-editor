import React from 'react';
import { Button, Space } from 'antd';
import { PromptEditor, TaskNode } from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';
import { message } from 'antd';

/**
 * 叶子节点 / 非空内容节点 锁定回调示例 (request 005 + 008)
 *
 * 演示两个新增的回调:
 * - `onAllLeafNodesLocked`: 当所有 children.length === 0 的节点 (至少 1 个) 全部锁定时触发
 * - `onAllNonEmptyContentNodesLocked`: 当所有 content.trim() !== '' 的节点 (至少 1 个) 全部锁定时触发
 *
 * 同样采用新的 `(unlockedIds: string[]) => void` 签名,触发时参数为 []。
 *
 * "校验" 按钮 (request 006 + 008): 手动触发"当前未锁定集合"的检查, 与
 * `src/components/PromptEditor/lockCallbacks.ts` 内部 `fireAllLockedCallbacks`
 * 完全相同的三个谓词, 同时把 `highlightUnlocked={true}` 切到 PromptEditor
 * 上, 让未锁定的叶子 + 非空内容节点显示红框。点击 Reset / 全部锁定时
 * 关闭红框, 点击 全部解锁 时重新打开。
 */

interface ValidationNodeRef {
  id: string;
  title: string;
}

interface ValidationResult {
  allLocked: boolean;
  leavesLocked: boolean;
  contentLocked: boolean;
  unlockedAll: ValidationNodeRef[];
  unlockedLeaves: ValidationNodeRef[];
  unlockedContent: ValidationNodeRef[];
}

/**
 * 镜像 `src/components/PromptEditor/lockCallbacks.ts` 中的三个判定条件,
 * 递归遍历当前 value 树, 返回各谓词当前是否满足、以及各自未锁定的节点列表。
 */
function validateLockState(nodes: TaskNode[]): ValidationResult {
  const all: TaskNode[] = [];
  const leaves: TaskNode[] = [];
  const nonEmpty: TaskNode[] = [];

  const walk = (ns: TaskNode[]): void => {
    for (const n of ns) {
      all.push(n);
      const children = n.children ?? [];
      if (children.length === 0) leaves.push(n);
      if (n.content.trim() !== '') nonEmpty.push(n);
      walk(children);
    }
  };
  walk(nodes);

  const toRef = (n: TaskNode): ValidationNodeRef => ({ id: n.id, title: n.title });

  return {
    allLocked: all.length > 0 && all.every((n) => n.isLocked),
    leavesLocked: leaves.length > 0 && leaves.every((n) => n.isLocked),
    contentLocked: nonEmpty.length > 0 && nonEmpty.every((n) => n.isLocked),
    unlockedAll: all.filter((n) => !n.isLocked).map(toRef),
    unlockedLeaves: leaves.filter((n) => !n.isLocked).map(toRef),
    unlockedContent: nonEmpty.filter((n) => !n.isLocked).map(toRef),
  };
}

export default () => {
  const initialValue: TaskNode[] = [
    {
      id: '1',
      title: '第一步：项目总览',
      content: '# 项目总览\n\n作为非叶子节点(有 1.1 / 1.2 子节点),它本身不会被算作"叶子节点",但属于"非空内容节点"。',
      children: [
        {
          id: '1.1',
          title: '1.1 需求分析',
          content: '叶子节点:非空内容',
          children: [],
          isLocked: false,
          hasRun: true,
        },
        {
          id: '1.2',
          title: '1.2 方案评审',
          content: '叶子节点:非空内容',
          children: [],
          isLocked: false,
          hasRun: true,
        },
      ],
      isLocked: false,
      hasRun: true,
    },
    {
      id: '2',
      title: '第二步：开发实施',
      content: '# 开发实施\n\n叶子节点,且 content 非空。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
    {
      id: '3',
      title: '第三步：发布上线',
      content: '# 发布上线\n\n叶子节点,且 content 非空。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
  ];

  const [value, setValue] = React.useState<TaskNode[]>(initialValue);
  const [allLeavesLocked, setAllLeavesLocked] = React.useState(false);
  const [allContentLocked, setAllContentLocked] = React.useState(false);
  const [validation, setValidation] = React.useState<ValidationResult | null>(null);
  // 校验 / 全部解锁 → 开启红框高亮；全部锁定 / Reset → 关闭
  const [highlightUnlocked, setHighlightUnlocked] = React.useState(false);

  const handleAllLeafNodesLocked = (unlockedLeafIds: string[]) => {
    setAllLeavesLocked(true);
    message.success(
      `全部叶子节点已锁定 (未锁定: ${unlockedLeafIds.length}, 共 3 个叶子)`,
    );
  };

  const handleAllNonEmptyContentNodesLocked = (
    unlockedNonEmptyIds: string[],
  ) => {
    setAllContentLocked(true);
    message.success(
      `全部非空内容节点已锁定 (未锁定: ${unlockedNonEmptyIds.length}, 共 4 个)`,
    );
  };

  const handleNodeLock = () => {
    // 任何节点解锁都重置两个 flag
    setAllLeavesLocked(false);
    setAllContentLocked(false);
  };

  const setLockedDeep = (
    nodes: TaskNode[],
    locked: boolean,
  ): TaskNode[] =>
    nodes.map((n) => ({
      ...n,
      isLocked: locked,
      hasRun: true,
      children: setLockedDeep(n.children ?? [], locked),
    }));

  const handleLockAll = () => {
    setValue((prev) => setLockedDeep(prev, true));
    setValidation(null);
    setHighlightUnlocked(false);
    // 全部锁定 button bypasses the per-node lock button, so manually invoke
    // the two all-locked callbacks with `[]` to mirror what
    // fireAllLockedCallbacks would have computed.
    handleAllLeafNodesLocked([]);
    handleAllNonEmptyContentNodesLocked([]);
    message.info('已锁定全部节点');
  };

  const handleUnlockAll = () => {
    setValue((prev) => setLockedDeep(prev, false));
    setAllLeavesLocked(false);
    setAllContentLocked(false);
    setValidation(null);
    setHighlightUnlocked(true);
    message.info('已解锁全部节点');
  };

  const reset = () => {
    setValue(initialValue);
    setAllLeavesLocked(false);
    setAllContentLocked(false);
    setValidation(null);
    setHighlightUnlocked(false);
  };

  const handleValidate = () => {
    setValidation(validateLockState(value));
    setHighlightUnlocked(true);
  };

  return (
    <DemoWrapper height="620px">
      <Space style={{ marginBottom: 12 }}>
        <Button
          size="small"
          type="primary"
          onClick={handleLockAll}
          data-test-button="lock-all"
        >
          全部锁定
        </Button>
        <Button
          size="small"
          onClick={handleUnlockAll}
          data-test-button="unlock-all"
        >
          全部解锁
        </Button>
        <Button size="small" onClick={reset} data-test-button="reset">
          Reset
        </Button>
        <Button
          size="small"
          onClick={handleValidate}
          data-test-button="validate"
        >
          校验 (检查未锁定)
        </Button>
      </Space>
      <PromptEditor
        value={value}
        onChange={setValue}
        onNodeLock={handleNodeLock}
        onAllLeafNodesLocked={handleAllLeafNodesLocked}
        onAllNonEmptyContentNodesLocked={handleAllNonEmptyContentNodesLocked}
        highlightUnlocked={highlightUnlocked}
      />
      {/* 持久化指示器 */}
      <div
        data-test-message="leaf-locked"
        style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 4,
          background: allLeavesLocked ? '#f6ffed' : '#fafafa',
          border: allLeavesLocked ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
          color: allLeavesLocked ? '#389e0d' : '#999',
          display: allLeavesLocked ? 'block' : 'none',
        }}
      >
        全部叶子节点已锁定 (3 个叶子)
      </div>
      <div
        data-test-message="content-locked"
        style={{
          marginTop: 8,
          padding: '8px 12px',
          borderRadius: 4,
          background: allContentLocked ? '#e6f4ff' : '#fafafa',
          border: allContentLocked ? '1px solid #91caff' : '1px solid #d9d9d9',
          color: allContentLocked ? '#1677ff' : '#999',
          display: allContentLocked ? 'block' : 'none',
        }}
      >
        全部非空内容节点已锁定 (4 个)
      </div>
      {/* 校验结果面板 (request 006) */}
      <div
        data-test-message="validation-result"
        style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 4,
          background: validation?.allLocked ? '#f6ffed' : '#fff7e6',
          border: validation?.allLocked
            ? '1px solid #b7eb8f'
            : '1px solid #ffd591',
          color: '#333',
          display: validation ? 'block' : 'none',
        }}
      >
        {validation && (
          <div>
            <div>
              <b>校验结果:</b>
            </div>
            <div>
              所有节点:{' '}
              {validation.allLocked
                ? '✅ 全部锁定'
                : `❌ 还有 ${validation.unlockedAll.length} 个未锁定: ${validation.unlockedAll.map((n) => n.title).join(', ')}`}
            </div>
            <div>
              叶子节点:{' '}
              {validation.leavesLocked
                ? '✅ 全部锁定'
                : `❌ 还有 ${validation.unlockedLeaves.length} 个未锁定: ${validation.unlockedLeaves.map((n) => n.title).join(', ')}`}
            </div>
            <div>
              非空内容节点:{' '}
              {validation.contentLocked
                ? '✅ 全部锁定'
                : `❌ 还有 ${validation.unlockedContent.length} 个未锁定: ${validation.unlockedContent.map((n) => n.title).join(', ')}`}
            </div>
          </div>
        )}
      </div>
    </DemoWrapper>
  );
};
