import React, { useState } from 'react';
import { Modal, List, Input, Button } from 'antd';
import type { DataSelectorComponentProps, TagData } from '../src/types';

/**
 * 示例数据选择器组件
 * 这是一个简单的演示，展示如何创建自定义的数据选择器
 */
export const SimpleDataSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
  multiple = false,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // 模拟数据源
  const mockData: TagData[] = [
    {
      id: 'user_name',
      label: '@用户名',
      value: '{{user.name}}',
      metadata: { type: 'user' },
    },
    {
      id: 'user_email',
      label: '@用户邮箱',
      value: '{{user.email}}',
      metadata: { type: 'user' },
    },
    {
      id: 'current_date',
      label: '@当前日期',
      value: '{{date.now}}',
      metadata: { type: 'system' },
    },
    {
      id: 'ai_model',
      label: '@AI 模型',
      value: '{{model.name}}',
      metadata: { type: 'system' },
    },
  ];

  // 过滤数据
  const filteredData = mockData.filter((item) =>
    item.label.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleItemClick = (item: TagData) => {
    if (multiple) {
      // 多选模式：切换选中状态
      setSelectedItems(prev => 
        prev.includes(item.id) 
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    } else {
      // 单选模式：直接选中
      onSelect(item);
    }
  };

  const handleConfirm = () => {
    if (multiple && selectedItems.length > 0) {
      const selectedData = mockData.filter(item => selectedItems.includes(item.id));
      onSelect(selectedData);
    }
  };

  return (
    <Modal
      title={multiple ? "选择变量（可多选）" : "选择变量"}
      open={true}
      onCancel={onCancel}
      footer={multiple ? [
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleConfirm}
          disabled={selectedItems.length === 0}
        >
          确定 {selectedItems.length > 0 && `(${selectedItems.length})`}
        </Button>
      ] : null}
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
              cursor: multiple ? 'pointer' : 'pointer',
              padding: '12px 16px',
              backgroundColor: selectedItems.includes(item.id) ? '#f0f9ff' : 'transparent'
            }}
            onClick={() => handleItemClick(item)}
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
