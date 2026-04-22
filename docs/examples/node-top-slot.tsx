import React from 'react';
import { Alert, Tag } from 'antd';
import { PromptEditor, TaskNode } from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';

export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '用户信息模板',
      content: '你好，@用户名！\n\n当前日期：@当前日期',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  return (
    <DemoWrapper height="520px">
      <PromptEditor
        value={value}
        onChange={setValue}
        renderNodeTopSlot={({ node, isDarkMode }) => (
          <div style={{ margin: '6px 8px 0' }}>
            <Alert
              type="info"
              showIcon
              message={
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>当前节点：</span>
                  <Tag color={isDarkMode ? 'geekblue' : 'blue'}>{node.title}</Tag>
                  <span>你可以在这里放任意 ReactNode（提示、按钮、状态条等）</span>
                </div>
              }
            />
          </div>
        )}
      />
    </DemoWrapper>
  );
};
