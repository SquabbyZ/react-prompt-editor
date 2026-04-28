# 多选数据选择器使用指南

## 快速开始

### 1. 基本用法（单选 - 向后兼容）

如果你已经有现有的数据选择器组件，它们无需任何修改即可继续工作：

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { SimpleDataSelector } from './SimpleDataSelector';

const App = () => (
  <PromptEditor
    initialValue={initialValue}
    dataSelector={SimpleDataSelector}
  />
);
```

### 2. 启用多选功能

要使用多选功能，你需要创建一个支持多选的数据选择器组件：

#### 步骤 1: 创建多选选择器组件

```tsx
import React, { useState } from 'react';
import { Modal, List, Checkbox, Button } from 'antd';
import type { DataSelectorComponentProps, TagData } from 'react-prompt-editor';

export const MultiSelectDataSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
  multiple = false, // 接收 multiple prop
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const mockData: TagData[] = [
    { id: 'user_name', label: '@用户名', value: '{{user.name}}' },
    { id: 'user_email', label: '@邮箱', value: '{{user.email}}' },
    { id: 'current_date', label: '@日期', value: '{{date.now}}' },
  ];

  const handleItemClick = (itemId: string) => {
    if (multiple) {
      // 多选模式：切换选中状态
      setSelectedItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    } else {
      // 单选模式：直接选中
      const item = mockData.find(d => d.id === itemId);
      if (item) onSelect(item);
    }
  };

  const handleConfirm = () => {
    if (multiple && selectedItems.length > 0) {
      // 返回数组
      const selectedData = mockData.filter(item => selectedItems.includes(item.id));
      onSelect(selectedData);
    }
  };

  return (
    <Modal
      title={multiple ? "选择变量（可多选）" : "选择变量"}
      open
      onCancel={onCancel}
      footer={multiple ? [
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleConfirm}
          disabled={selectedItems.length === 0}
        >
          确定 ({selectedItems.length})
        </Button>
      ] : null}
    >
      <List
        dataSource={mockData}
        renderItem={(item) => (
          <List.Item
            style={{ 
              cursor: 'pointer',
              backgroundColor: selectedItems.includes(item.id) ? '#f0f9ff' : 'transparent'
            }}
            onClick={() => handleItemClick(item.id)}
          >
            {multiple && (
              <Checkbox
                checked={selectedItems.includes(item.id)}
                onChange={() => handleItemClick(item.id)}
              />
            )}
            <span>{item.label}</span>
          </List.Item>
        )}
      />
    </Modal>
  );
};
```

#### 步骤 2: 在编辑器中使用

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { MultiSelectDataSelector } from './MultiSelectDataSelector';

const App = () => {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '我的节点',
      content: '在这里插入变量',
      children: [],
      isLocked: false,
      hasRun: false,
    }
  ]);

  return (
    <div style={{ height: '600px' }}>
      <PromptEditor
        value={value}
        onChange={setValue}
        dataSelector={MultiSelectDataSelector}
        onVariableChange={(nodeId, variables) => {
          console.log(`节点 ${nodeId} 的变量:`, variables);
        }}
      />
    </div>
  );
};
```

## 工作原理

### 1. 打开数据选择器

当用户点击节点的"插入变量"按钮时，会打开数据选择器弹窗。

### 2. 选择变量

- **单选模式** (`multiple=false`): 点击一个变量立即插入
- **多选模式** (`multiple=true`): 可以勾选多个变量，然后点击"确定"批量插入

### 3. 变量插入

选中的变量会被插入到光标位置，多个变量之间用空格分隔：

```
@用户名 @邮箱 @日期
```

### 4. 变量追踪

通过 `onVariableChange` 回调，你可以追踪每个节点中插入的所有变量：

```typescript
onVariableChange={(nodeId, variables) => {
  // variables 是一个数组，包含该节点中的所有变量
  console.log('变量列表:', variables.map(v => ({
    id: v.data.id,
    label: v.data.label,
    position: v.position,
  })));
}}
```

## 高级用法

### 自定义分隔符

默认情况下，多个变量之间用空格分隔。如果你想自定义分隔符，可以在你的选择器组件中处理：

```tsx
const handleConfirm = () => {
  if (multiple && selectedItems.length > 0) {
    const selectedData = mockData.filter(item => selectedItems.includes(item.id));
    
    // 自定义：在每个变量之间添加逗号
    const modifiedData = selectedData.map((item, index) => ({
      ...item,
      label: index > 0 ? `, ${item.label}` : item.label
    }));
    
    onSelect(modifiedData);
  }
};
```

### 条件启用多选

你可以根据业务逻辑动态决定是否启用多选：

```tsx
const MyDataSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
  multiple,
}) => {
  // 根据 multiple prop 决定 UI 行为
  const enableMultiSelect = multiple && someCondition;
  
  return (
    <Modal title={enableMultiSelect ? "多选" : "单选"} open onCancel={onCancel}>
      {/* 你的 UI */}
    </Modal>
  );
};
```

### 与 renderNodeActions 结合使用

你可以在自定义的节点操作按钮中控制数据选择器的行为：

```tsx
<PromptEditor
  value={value}
  onChange={setValue}
  dataSelector={MyDataSelector}
  renderNodeActions={({ node, defaultActions, isDarkMode }) => (
    <Space>
      <Button 
        icon={<Variable size={14} />}
        onClick={defaultActions.handleOpenDataSelector}
      >
        插入变量
      </Button>
      <Button 
        icon={<PlayCircle size={14} />}
        onClick={defaultActions.handleRun}
      >
        运行
      </Button>
    </Space>
  )}
/>
```

## 常见问题

### Q: 如何区分单选和多选模式？

A: 在你的选择器组件中检查 `multiple` prop：

```tsx
if (multiple) {
  // 多选逻辑
} else {
  // 单选逻辑
}
```

### Q: 多选时变量的顺序是怎样的？

A: 变量按照用户选择的顺序插入。如果你在确认时重新排序数组，变量也会按新顺序插入。

### Q: 能否限制最多选择多少个变量？

A: 可以，在你的选择器组件中添加限制逻辑：

```tsx
const MAX_SELECTIONS = 5;

const handleItemClick = (itemId: string) => {
  if (multiple) {
    if (!selectedItems.includes(itemId) && selectedItems.length >= MAX_SELECTIONS) {
      message.warning(`最多只能选择 ${MAX_SELECTIONS} 个变量`);
      return;
    }
    // ... 其他逻辑
  }
};
```

### Q: 变量插入后如何获取它们的值？

A: 使用 `onVariableChange` 回调：

```tsx
onVariableChange={(nodeId, variables) => {
  variables.forEach(variable => {
    console.log('变量ID:', variable.data.id);
    console.log('变量标签:', variable.data.label);
    console.log('变量值:', variable.data.value);
    console.log('在文本中的位置:', variable.position);
  });
}}
```

## 示例代码

完整的示例代码请参考：
- `examples/MultiSelectDataSelector.tsx` - 多选选择器实现
- `docs/examples/multi-select-data-selector.tsx` - 使用示例
- `examples/SimpleDataSelector.tsx` - 支持多选的简单选择器

## 总结

多选数据选择器功能为需要批量插入变量的场景提供了更好的用户体验。通过简单的 API 设计，你可以轻松地在单选和多选模式之间切换，同时保持完全的向后兼容性。