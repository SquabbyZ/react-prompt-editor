import React, { useState } from 'react';
import { Modal, List, Input } from 'antd';
import type { DataSelectorComponentProps, TagData } from '../src/types';

/**
 * 示例数据选择器组件
 * 这是一个简单的演示，展示如何创建自定义的数据选择器
 */
export const SimpleDataSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
  cursorPosition,
}) => {
  const [searchText, setSearchText] = useState('');

  // 模拟数据源
  const mockData: TagData[] = [
    {
      id: 'user_name',
      label: '用户名',
      value: '{{user.name}}',
      metadata: { type: 'user' },
    },
    {
      id: 'user_email',
      label: '用户邮箱',
      value: '{{user.email}}',
      metadata: { type: 'user' },
    },
    {
      id: 'current_date',
      label: '当前日期',
      value: '{{date.now}}',
      metadata: { type: 'system' },
    },
    {
      id: 'ai_model',
      label: 'AI 模型',
      value: '{{model.name}}',
      metadata: { type: 'system' },
    },
  ];

  // 过滤数据
  const filteredData = mockData.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Modal
      title="选择变量"
      open={true}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Input
        placeholder="搜索变量..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      
      <List
        dataSource={filteredData}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: 'pointer',
              padding: '12px 16px',
            }}
            onClick={() => {
              console.log('选中变量:', item, '光标位置:', cursorPosition);
              onSelect(item);
            }}
          >
            <List.Item.Meta
              title={item.label}
              description={item.value}
            />
          </List.Item>
        )}
      />
      
      {filteredData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
          没有找到匹配的变量
        </div>
      )}
    </Modal>
  );
};
