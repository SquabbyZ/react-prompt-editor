# 多选数据选择器功能实现总结

## 概述

本次更新为 `react-prompt-editor` 添加了数据选择器的多选支持，允许用户一次性选择多个变量并批量插入到编辑器中。

## 主要变更

### 1. 类型定义更新 (`src/types/index.ts`)

- 修改 `DataSelectorComponentProps` 接口：
  - `onSelect` 回调现在支持 `TagData | TagData[]`，既支持单选也支持多选
  - 新增 `multiple?: boolean` 属性，用于标识是否启用多选模式

```typescript
export interface DataSelectorComponentProps {
  onSelect: (data: TagData | TagData[]) => void;
  onCancel: () => void;
  cursorPosition?: number;
  multiple?: boolean; // 新增
}
```

### 2. 节点组件更新 (`src/components/PromptEditor/Node.tsx`)

- 更新 `handleInsertVariable` 函数以支持多选：
  - 接收 `TagData | TagData[]` 类型的参数
  - 自动将单个数据转换为数组统一处理
  - 计算每个变量的正确位置
  - 批量插入所有选中的变量到编辑器
  - 用空格分隔多个变量标签

- 在渲染数据选择器时传递 `multiple={true}` 属性

### 3. 示例组件

#### SimpleDataSelector 更新 (`examples/SimpleDataSelector.tsx`)

- 添加多选模式支持
- 在多选模式下显示复选框
- 添加确认按钮和取消按钮
- 显示已选择的变量数量

#### MultiSelectDataSelector 新增 (`examples/MultiSelectDataSelector.tsx`)

- 完整的多选数据选择器实现
- 支持复选框多选
- 实时显示已选择的变量
- 提供确定/取消操作

### 4. 文档更新

#### 组件文档 (`docs/components/prompt-editor.md`)

- 更新 `DataSelectorComponentProps` 表格，说明 `onSelect` 支持数组
- 添加 `multiple` 属性说明
- 新增"多选功能"章节，详细说明使用方法

#### README 更新 (`README.md`)

- 在数据选择器章节下新增"多选模式"子章节
- 提供多选使用的代码示例

### 5. 示例文件

新增多选示例 (`docs/examples/multi-select-data-selector.tsx`)：
- 展示如何使用多选数据选择器
- 演示变量追踪功能

### 6. 测试文件

新增测试文件 (`src/components/__tests__/multi-select.test.tsx`)：
- 验证单个 TagData 处理
- 验证 TagData 数组处理
- 验证单选和多选模式的区分

## 向后兼容性

✅ **完全向后兼容**

- 现有的单选数据选择器组件无需任何修改即可继续工作
- `onSelect` 回调仍然可以接收单个 `TagData`
- 只有当自定义选择器组件主动使用 `multiple` prop 时才启用多选功能

## 使用方式

### 基本用法（保持向后兼容）

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

### 多选用法

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { MultiSelectDataSelector } from './MultiSelectDataSelector';

const App = () => (
  <PromptEditor
    initialValue={initialValue}
    dataSelector={MultiSelectDataSelector}
    onVariableChange={(nodeId, variables) => {
      console.log('Variables:', variables);
    }}
  />
);
```

### 自定义多选选择器

```tsx
import { Modal, Checkbox, Button } from 'antd';
import type { DataSelectorComponentProps, TagData } from 'react-prompt-editor';

const MyMultiSelectSelector: React.FC<DataSelectorComponentProps> = ({
  onSelect,
  onCancel,
  multiple,
}) => {
  const [selected, setSelected] = useState<string[]>([]);
  
  const handleConfirm = () => {
    if (multiple && selected.length > 0) {
      // 返回数组
      const selectedData = mockData.filter(item => selected.includes(item.id));
      onSelect(selectedData);
    } else {
      // 返回单个对象
      const item = mockData.find(d => d.id === selected[0]);
      if (item) onSelect(item);
    }
  };
  
  return (
    <Modal
      title={multiple ? "多选变量" : "选择变量"}
      open
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="ok" type="primary" onClick={handleConfirm}>确定</Button>
      ]}
    >
      {/* 你的选择器 UI */}
    </Modal>
  );
};
```

## 技术细节

### 变量插入逻辑

1. 接收 `TagData | TagData[]` 参数
2. 统一转换为数组处理
3. 计算每个变量的插入位置（考虑前面变量的长度）
4. 用空格连接所有变量标签
5. 一次性插入到编辑器光标位置
6. 更新变量列表状态

### 位置计算

```typescript
// 每个变量的位置 = 光标位置 + 前面所有变量的总长度
position: cursorPosition + totalLength - insertText.length
```

这确保了每个变量都有正确的起始位置，便于后续的变量追踪和管理。

## 测试

运行测试验证功能：

```bash
npm test -- multi-select.test.tsx
```

所有测试通过 ✅

## 构建验证

```bash
npm run build
```

构建成功，无错误 ✅

## 相关文件清单

### 核心文件
- `src/types/index.ts` - 类型定义
- `src/components/PromptEditor/Node.tsx` - 节点组件逻辑

### 示例文件
- `examples/SimpleDataSelector.tsx` - 简单选择器（已更新支持多选）
- `examples/MultiSelectDataSelector.tsx` - 多选选择器示例（新增）
- `docs/examples/multi-select-data-selector.tsx` - 文档示例（新增）

### 文档文件
- `docs/components/prompt-editor.md` - 组件文档
- `README.md` - 项目说明

### 测试文件
- `src/components/__tests__/multi-select.test.tsx` - 单元测试（新增）

## 后续优化建议

1. **配置化多选行为**：可以通过 props 控制是否启用多选
2. **分隔符自定义**：允许用户自定义多个变量之间的分隔符（当前为空格）
3. **拖拽排序**：在多选弹窗中支持拖拽调整选中变量的顺序
4. **搜索过滤**：在多选模式下增强搜索和过滤功能
5. **批量操作**：支持全选、反选等批量操作

## 总结

本次更新成功实现了 dataSelector 和 renderNodeActions 组合的多选支持，同时保持了完全的向后兼容性。用户可以无缝升级到新版本，现有的单选选择器无需任何修改即可继续工作。新的多选功能为需要批量插入变量的场景提供了更好的用户体验。