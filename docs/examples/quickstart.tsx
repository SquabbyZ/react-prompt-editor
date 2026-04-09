import React from 'react';
import { PromptEditor } from '../../src';
import '../../src/styles/tailwind.css';
import { TaskNode } from '../../src/types';
import { DemoWrapper } from '../demo-wrapper';

/**
 * 快速上手示例 - 最少代码即可运行
 *
 * 这是最简单的使用方式，只需提供数据和 onChange 回调
 */
export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '我的提示词',
      content: '# 提示词内容\n\n在这里编写你的提示词...',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  return (
    <DemoWrapper height="450px">
      <PromptEditor value={value} onChange={setValue} />
    </DemoWrapper>
  );
};
