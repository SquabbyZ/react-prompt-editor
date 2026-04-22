import React from 'react';
import { List, Modal, Tag, Typography, message } from 'antd';
import {
  DataSelectorComponentProps,
  PromptEditor,
  RunTaskRequest,
  RunTaskResponse,
  TagData,
  TaskNode,
} from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';

const { Text } = Typography;

// 可插入变量列表（数据源可以来自后端接口、上下文等）
const VARIABLE_LIST: TagData[] = [
  {
    id: 'username',
    label: '@用户名',
    value: '{{username}}',
    metadata: { desc: '当前登录用户的昵称' },
  },
  {
    id: 'email',
    label: '@邮箱',
    value: '{{email}}',
    metadata: { desc: '当前登录用户的邮箱' },
  },
  {
    id: 'date',
    label: '@当前日期',
    value: '{{current_date}}',
    metadata: { desc: '今日日期（YYYY-MM-DD）' },
  },
  {
    id: 'product',
    label: '@产品名称',
    value: '{{product_name}}',
    metadata: { desc: '当前产品的名称' },
  },
];

// 自定义数据选择器组件（使用 Modal + List 实现）
const DataSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
}) => {
  return (
    <Modal
      open
      title="选择要插入的变量"
      onCancel={onCancel}
      footer={null}
      width={420}
    >
      <List
        dataSource={VARIABLE_LIST}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(item)}
          >
            <List.Item.Meta
              title={<Tag color="blue">{item.label}</Tag>}
              description={item.metadata?.desc}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '欢迎语',
      content:
        '你好，请在这里按 `@` 或点击底部的 "插入变量" 按钮来插入动态变量。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 处理运行请求
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('🚀 运行请求:', request);
    console.log('📝 节点内容（已替换变量）:', request.content);
    
    // 打印详细信息
    message.info({
      content: '运行请求已触发，请查看控制台查看详细内容',
      duration: 3,
    });
    
    // 模拟运行完成
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 运行成功！\n\n节点：${request.nodeId}\n\n处理后的内容：\n${request.content}`,
      };
      
      // 通知编辑器运行完成
      if (request.meta?.onNodeRun) {
        request.meta.onNodeRun(request.nodeId, result);
      }
    }, 1000);
  };

  return (
    <DemoWrapper height="600px">
      <PromptEditor
        value={value}
        onChange={setValue}
        dataSelector={DataSelector}
        onRunRequest={handleRunRequest}
      />
    </DemoWrapper>
  );
};
