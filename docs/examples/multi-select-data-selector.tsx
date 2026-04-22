import React, { useState } from 'react';
import { MultiSelectDataSelector } from '../../examples/MultiSelectDataSelector';
import { PromptEditor } from '../../src';
import type { TaskNode } from '../../src/types';

/**
 * 多选数据选择器示例
 *
 * 这个示例展示如何使用支持多选的数据选择器组件
 */
const MultiSelectDemo: React.FC = () => {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '用户信息模板',
      content:
        '你好，{{user.name}}！\n\n你的邮箱是：{{user.email}}\n当前日期：{{date.now}}',
      children: [],
      isLocked: false,
      hasRun: false,
      dependencies: [],
    },
    {
      id: '2',
      title: 'AI 配置模板',
      content:
        '使用模型：{{model.name}}\n温度参数：{{model.temperature}}\n\n请根据以上配置生成内容。',
      children: [],
      isLocked: false,
      hasRun: false,
      dependencies: [],
    },
  ]);

  return (
    <div style={{ height: '600px' }}>
      <PromptEditor
        value={value}
        onChange={setValue}
        dataSelector={MultiSelectDataSelector}
      />

    </div>
  );
};

export default MultiSelectDemo;
