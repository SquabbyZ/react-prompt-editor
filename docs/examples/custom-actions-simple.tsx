import React from 'react';
import { Button, Space } from 'antd';
import { PlayCircle, Settings, Variable } from 'lucide-react';
import { PromptEditor, TaskNode } from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';

export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '第一步：需求分析',
      content: '请分析用户的需求，包括核心功能、用户场景和技术要求。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  const renderCustomActions = ({
    node,
    defaultActions,
  }: {
    node: TaskNode;
    defaultActions: {
      handleOpenDataSelector: (e: React.MouseEvent) => void;
      handleRun: (e: React.MouseEvent) => void;
      handleOptimize: (e: React.MouseEvent) => void;
    };
    isDarkMode: boolean;
  }) => {
    return (
      <Space size="small">
        <Button
          icon={<Variable size={14} />}
          onClick={defaultActions.handleOpenDataSelector}
          size="small"
          type="text"
        >
          插入变量
        </Button>
        <Button
          icon={<PlayCircle size={14} />}
          onClick={defaultActions.handleRun}
          size="small"
          type="primary"
        >
          执行
        </Button>
        <Button
          icon={<Settings size={14} />}
          onClick={() => console.log('设置', node.id)}
          size="small"
        >
          设置
        </Button>
      </Space>
    );
  };

  return (
    <DemoWrapper height="450px">
      <PromptEditor
        value={value}
        onChange={setValue}
        renderNodeActions={renderCustomActions}
      />
    </DemoWrapper>
  );
};
