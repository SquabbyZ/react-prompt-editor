import React from 'react';
import { PromptEditor, TaskNode } from '../../../src';
import '../../../src/styles/tailwind.css';
import { DemoWrapper } from '../../demo-wrapper';
import { message } from 'antd';

export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '第一步：需求分析',
      content: '# 需求分析\n\n分析用户需求，拆解核心功能。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
    {
      id: '2',
      title: '第二步：方案设计',
      content: '# 方案设计\n\n基于需求设计技术方案。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
    {
      id: '3',
      title: '第三步：发布上线',
      content: '# 发布上线\n\n所有节点锁定后执行发布。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  const [allLocked, setAllLocked] = React.useState(false);

  const handleAllNodesLocked = () => {
    setAllLocked(true);
    message.success('全部节点已锁定，可以发布版本了！');
  };

  const handleNodeLock = (nodeId: string, isLocked: boolean) => {
    if (!isLocked) {
      setAllLocked(false);
    }
  };

  return (
    <DemoWrapper height="500px">
      <PromptEditor
        value={value}
        onChange={setValue}
        onNodeLock={handleNodeLock}
        onAllNodesLocked={handleAllNodesLocked}
      />
    </DemoWrapper>
  );
};
