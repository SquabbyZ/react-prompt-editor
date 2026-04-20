# 编辑器变量选择器设计文档

## 功能概述

在 PromptEditor 的工具栏中支持添加自定义按钮，点击按钮后触发用户自定义的弹窗/抽屉组件，用户选择数据后以 Tag 形式插入编辑器光标位置。

## 核心设计

### 1. 触发机制

- 在工具栏添加自定义按钮
- 编辑器聚焦时按钮可点击
- 点击按钮触发用户自定义的弹窗/抽屉组件

### 2. 自定义弹窗

用户通过组件方式提供完整弹窗实现：

```typescript
interface DataSelectorComponentProps {
  onSelect: (data: TagData) => void;
  onCancel: () => void;
}
```

组件接收 `onSelect` 回调函数，用户选择数据后调用 `onSelect({ id, label, value, metadata })`

### 3. Tag 数据结构

```typescript
interface TagData {
  id: string; // 唯一标识
  label: string; // 显示文本
  value: string; // 实际值
  metadata?: Record<string, any>; // 自定义元数据
}
```

### 4. Tag 展示

- 使用 CodeMirror Widget 技术（`Decoration.widget()` API）
- 展示样式类似 `@magenta` 的圆角标签
- 与纯文本区分开，可自定义样式

### 5. 交互行为

- **删除**：按纯文本逻辑处理，删除整个 Tag
- **复制/剪切**：复制纯文本内容（不带 @）
- **序列化**：导出时转换为纯文本，不带 `@` 符号

## 技术实现

### CodeMirror Widget 方案

使用 CodeMirror 的 `Decoration.widget()` API 插入自定义 DOM 节点：

1. 在光标位置插入 Widget
2. Widget 内部渲染自定义样式
3. 拦截删除操作，保证 Tag 完整性
4. 序列化时提取 `label` 值

### 编辑器状态管理

编辑器内部维护 Tag 列表，每个 Tag 包含：

- 在文本中的位置
- Tag 数据（id, label, value, metadata）

### 序列化处理

导出内容时，将 Widget 替换为纯文本：

- 使用 `label` 字段作为显示文本
- 不包含 `@` 符号

## 用户自定义扩展

工具栏支持自定义扩展，用户可以：

1. 添加自定义按钮
2. 点击按钮时触发自定义弹窗
3. 弹窗组件完全由用户控制

## 优势

1. **灵活性高**：用户完全自定义弹窗内容和样式
2. **交互体验好**：Widget 方式提供清晰的视觉区分
3. **数据完整**：保留完整的结构化数据
4. **纯文本兼容**：序列化后兼容纯文本场景
