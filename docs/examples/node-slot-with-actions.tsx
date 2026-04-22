import React from 'react';
import { Button, Space, Tag, Tooltip } from 'antd';
import { PlayCircle, Settings, Variable } from 'lucide-react';
import { PromptEditor, TaskNode } from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';

export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '营销文案节点',
      content: '请基于 @产品名称 生成一句广告语。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  return (
    <DemoWrapper height="560px">
      <PromptEditor
        value={value}
        onChange={setValue}
        renderNodeTopSlot={({ node }) => (
          <div
            style={{
              margin: '6px 8px 0',
              padding: '6px 10px',
              borderRadius: 6,
              background: '#f5f7ff',
              border: '1px solid #dbe4ff',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>节点扩展区：</span>
            <Tag color="blue">{node.title}</Tag>
            <Tag color={node.hasRun ? 'success' : 'default'}>
              {node.hasRun ? '已运行' : '未运行'}
            </Tag>
          </div>
        )}
        renderNodeActions={({ defaultActions }) => (
          <Space size="small">
            <Tooltip title="插入变量">
              <Button
                icon={<Variable size={14} />}
                onClick={defaultActions.handleOpenDataSelector}
                size="small"
              />
            </Tooltip>
            <Tooltip title="运行节点">
              <Button
                icon={<PlayCircle size={14} />}
                onClick={defaultActions.handleRun}
                size="small"
                type="primary"
              />
            </Tooltip>
            <Tooltip title="更多设置">
              <Button
                icon={<Settings size={14} />}
                onClick={() => console.log('custom settings')}
                size="small"
              />
            </Tooltip>
          </Space>
        )}
      />
    </DemoWrapper>
  );
};
