import { Button, Checkbox, List, Modal, Space, Tag } from 'antd';
import React, { useState } from 'react';
import type { DataSelectorComponentProps, TagData } from '../src/types';

/**
 * 支持多选的数据选择器组件示例
 * 这个示例展示了如何实现一个支持多选的数据选择器
 */
export const MultiSelectDataSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
  multiple = false,
}) => {
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
    {
      id: 'temperature',
      label: '@温度参数',
      value: '{{model.temperature}}',
      metadata: { type: 'system' },
    },
  ];

  const handleItemSelect = (itemId: string) => {
    if (multiple) {
      // 多选模式
      setSelectedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId],
      );
    } else {
      // 单选模式
      const selectedItem = mockData.find((item) => item.id === itemId);
      if (selectedItem) {
        onSelect(selectedItem);
      }
    }
  };

  const handleConfirm = () => {
    if (multiple && selectedItems.length > 0) {
      const selectedData = mockData.filter((item) =>
        selectedItems.includes(item.id),
      );
      onSelect(selectedData);
    } else if (!multiple && selectedItems.length > 0) {
      const selectedItem = mockData.find(
        (item) => item.id === selectedItems[0],
      );
      if (selectedItem) {
        onSelect(selectedItem);
      }
    }
  };

  return (
    <Modal
      open
      title={multiple ? '选择要插入的变量（可多选）' : '选择要插入的变量'}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={multiple && selectedItems.length === 0}
        >
          确定{' '}
          {multiple && selectedItems.length > 0 && `(${selectedItems.length})`}
        </Button>,
      ]}
      width={500}
    >
      <List
        dataSource={mockData}
        renderItem={(item) => (
          <List.Item
            style={{
              cursor: multiple ? 'pointer' : 'default',
              backgroundColor: selectedItems.includes(item.id)
                ? '#f0f9ff'
                : 'transparent',
            }}
            onClick={() => multiple && handleItemSelect(item.id)}
          >
            <div
              style={{ display: 'flex', alignItems: 'center', width: '100%' }}
            >
              {multiple && (
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleItemSelect(item.id)}
                  style={{ marginRight: 8 }}
                />
              )}
              <div style={{ flex: 1 }}>
                <Tag color="blue">{item.label}</Tag>
                <div
                  style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
                >
                  {item.metadata?.desc ||
                    `类型: ${item.metadata?.type || '未知'}`}
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />

      {multiple && selectedItems.length > 0 && (
        <div
          style={{
            marginTop: 16,
            padding: 8,
            background: '#f5f5f5',
            borderRadius: 4,
          }}
        >
          <strong>已选择:</strong>
          <Space wrap style={{ marginTop: 8 }}>
            {selectedItems.map((id) => {
              const item = mockData.find((d) => d.id === id);
              return item ? (
                <Tag key={id} color="green">
                  {item.label}
                </Tag>
              ) : null;
            })}
          </Space>
        </div>
      )}
    </Modal>
  );
};
