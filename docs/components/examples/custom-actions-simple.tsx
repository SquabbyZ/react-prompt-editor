import React from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import type { TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 自定义节点底部操作按钮示例 - 简化版
 */
export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '测试节点',
      content: '这是一个测试节点',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 自定义底部操作按钮
  const renderCustomActions = () => {
    return <div>自定义按钮</div>;
  };

  return (
    <DemoWrapper height="300px">
      <PromptEditor
        value={value}
        onChange={setValue}
        renderNodeActions={renderCustomActions}
      />
    </DemoWrapper>
  );
};
