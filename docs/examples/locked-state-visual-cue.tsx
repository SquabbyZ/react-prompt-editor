import React from 'react';
import { Button, Space } from 'antd';
import { PromptEditor, TaskNode } from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';
import { message } from 'antd';

/**
 * 锁定状态视觉提示示例 (request 004 + 007)
 *
 * 当 `highlightUnlocked={true}` 且至少提供了一个锁定回调
 * (本例: `onAllNodesLocked`) 时,组件会为那些"未锁定叶子节点 +
 * CodeMirror 内容非空"的节点的整行添加 `border-2 border-red-500`
 * 的红色边框。锁定后、或进入标题编辑态时红框自动消失。
 *
 * 红框的判定条件 (同时满足):
 *   1. `isHighlighted` 父级已经把节点标为高亮
 *   2. `!nodeData.isLocked`  节点当前未锁定
 *   3. `!titleEditing`       标题不在编辑态
 *   4. `!isInternal`         叶子节点 (没有子节点)
 *   5. `nodeData.content.trim() !== ''`  CodeMirror 内容非空
 *
 * 故: 内部节点 (容器) 即使有内容也**不会**显示红框;空内容叶子
 * 即使未锁定也**不会**显示红框。
 *
 * 初始状态 (8 个根节点 + 2 个子节点) 的对照:
 *   id="1"  内部节点, content 非空       → 无红框 (内部节点规则)
 *     "1.1" 叶子, content 非空, 未锁定    → 红色边框 (典型场景)
 *   id="2"  叶子, content 非空, 已锁定    → 无红框 (已锁定)
 *   id="3"  叶子, content 非空, 未锁定    → 红色边框
 *   id="4"  叶子, content 非空, 未锁定    → 红色边框
 *   id="5"  叶子, content 非空, 未锁定    → 红色边框
 *   id="6"  叶子, content 非空, 未锁定    → 红色边框
 *   id="7"  叶子, content 为空, 未锁定    → 无红框 (空内容规则)
 *     "7.1" 叶子, content 非空, 未锁定    → 红色边框 (子节点仍生效)
 *   id="8"  内部节点, content 非空, 未锁定 → 无红框 (内部节点规则)
 *
 * 全部锁定后 → 所有红框消失,`onAllNodesLocked` 触发
 * request 007 起: 不再展示「校验」按钮与底部校验结果面板
 */

export default () => {
  const initialValue: TaskNode[] = [
    // 1: 内部节点 (有子节点) —— 即使有内容、未锁定也不加红框
    {
      id: '1',
      title: '1. 项目总览 (内部节点,不加红框)',
      content: '# 项目总览\n\n这是一个容器节点,内部节点不显示红框,即使有内容。',
      children: [
        {
          id: '1.1',
          title: '1.1 子任务 A (叶子+有内容 → 红框)',
          content: '子任务 A 的具体内容',
          children: [],
          isLocked: false,
          hasRun: true,
        },
      ],
      isLocked: false,
      hasRun: true,
    },
    // 2: 叶子 + 有内容 + 已锁定 —— 不加红框
    {
      id: '2',
      title: '2. 需求分析 (已锁定,不加红框)',
      content: '# 需求分析\n\n初始状态已锁定。',
      children: [],
      isLocked: true,
      hasRun: true,
    },
    // 3-6: 叶子 + 有内容 + 未锁定 —— 加红框
    {
      id: '3',
      title: '3. 方案设计 (叶子+有内容 → 红框)',
      content: '# 方案设计\n\n这里是方案设计的内容。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
    {
      id: '4',
      title: '4. 开发实施 (叶子+有内容 → 红框)',
      content: '# 开发实施\n\n这里是开发实施的内容。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
    {
      id: '5',
      title: '5. 测试验收 (叶子+有内容 → 红框)',
      content: '测试验收的具体描述。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
    {
      id: '6',
      title: '6. 发布上线 (叶子+有内容 → 红框)',
      content: '发布上线的具体描述。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
    // 7: 叶子 + 内容为空 + 未锁定 —— 不加红框 (空内容规则)
    {
      id: '7',
      title: '7. 占位节点 (空内容叶子,不加红框)',
      content: '',
      children: [
        {
          id: '7.1',
          title: '7.1 占位节点的子任务 (叶子+有内容 → 红框)',
          content: '虽然父节点是空内容,但子节点自己有内容,仍然会显示红框。',
          children: [],
          isLocked: false,
          hasRun: true,
        },
      ],
      isLocked: false,
      hasRun: true,
    },
    // 8: 内部节点 + 有内容 + 未锁定 —— 不加红框 (内部节点规则)
    {
      id: '8',
      title: '8. 复盘归档 (内部节点,不加红框)',
      content: '# 复盘归档\n\n容器节点,即使未锁定且有内容也不显示红框。',
      children: [],
      isLocked: false,
      hasRun: true,
    },
  ];

  const [value, setValue] = React.useState<TaskNode[]>(initialValue);
  const [allLocked, setAllLocked] = React.useState(false);

  const handleAllNodesLocked = (unlockedIds: string[]) => {
    setAllLocked(true);
    message.success(
      `全部节点已锁定 (未锁定: ${unlockedIds.length}, 共 ${value.length} 个)`,
    );
  };

  const handleNodeLock = (_nodeId: string, isLocked: boolean) => {
    if (!isLocked) {
      setAllLocked(false);
    }
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
    // 全部锁定 button bypasses the per-node lock button, so manually invoke
    // the all-locked callback with `[]` to mirror what fireAllLockedCallbacks
    // would have computed.
    handleAllNodesLocked([]);
    message.info('已锁定全部节点');
  };

  const handleUnlockAll = () => {
    setValue((prev) => setLockedDeep(prev, false));
    setAllLocked(false);
    message.info('已解锁全部节点');
  };

  const reset = () => {
    setValue(initialValue);
    setAllLocked(false);
  };

  return (
    <DemoWrapper height="1100px">
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
          Reset (回到初始状态)
        </Button>
      </Space>
      <PromptEditor
        value={value}
        onChange={setValue}
        onNodeLock={handleNodeLock}
        onAllNodesLocked={handleAllNodesLocked}
        highlightUnlocked={true}
      />
      <div
        data-test-message="all-locked"
        style={{
          marginTop: 12,
          padding: '8px 12px',
          borderRadius: 4,
          background: allLocked ? '#f6ffed' : '#fafafa',
          border: allLocked ? '1px solid #b7eb8f' : '1px solid #d9d9d9',
          color: allLocked ? '#389e0d' : '#999',
          display: allLocked ? 'block' : 'none',
        }}
      >
        全部节点已锁定,红色边框消失
      </div>
    </DemoWrapper>
  );
};
