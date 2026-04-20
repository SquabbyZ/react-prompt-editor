---
title: PromptEditor 预览模式错位修复与 Preview 渲染模式设计
date: 2026-04-17
status: draft
---

## 背景

用户反馈：`PromptEditor` 在 `previewMode` 下展开节点内容时出现布局错位/重叠，非预览模式正常。

当前实现中：

- 预览模式下点击标题展开内容区
- 非预览模式下通过编辑入口展开编辑器
- 列表使用虚拟滚动，节点高度由估算高度 + 实测高度缓存驱动

错位现象典型表现为：父节点展开内容未占用足够的列表高度，导致后续子节点渲染叠入父节点内容区域。

## 目标

- 修复 `previewMode` 下的错位/重叠问题（默认行为不变）。
- 支持两种预览内容渲染方式的组合：
  - 默认：只读编辑器预览（保持现状）
  - 可选：Markdown 预览渲染（阅读视图）
- 不改变非预览模式交互与渲染。

## 非目标

- 不重构树形数据结构与虚拟列表实现。
- 不改变 `previewMode` 现有语义与默认值。
- 不引入全新的 Markdown 渲染体系（复用现有 `MarkdownRenderer`）。

## 方案概述（选定）

### 新增配置项

在 `PromptEditorProps` 增加：

- `previewRenderMode?: 'readonly-editor' | 'markdown'`
- 默认值：`'readonly-editor'`
- 生效条件：仅当 `previewMode === true` 时生效

### 预览渲染策略

在节点内容展开区域（Node 的 editor shell 区域）基于 `previewMode + previewRenderMode` 切换渲染：

- `readonly-editor`：继续渲染只读 `CodeMirrorEditor`
- `markdown`：渲染现有 `MarkdownRenderer`（用于阅读预览）

### 高度同步策略（修复错位的关键）

无论 `readonly-editor` 还是 `markdown`，展开内容区都必须可靠上报真实高度给虚拟列表：

- 在 Node 的展开内容区外层增加测量容器 `ref`
- 使用 `ResizeObserver` 监听该容器高度变化
- 变化时调用 `onHeightChange(nodeId, height)`
- 复用 `PromptEditor` 现有的 `nodeHeightsRef` + `heightVersion` 机制触发列表重算

这样可以避免预览态内容高度变化（如 CodeMirror 只读渲染、Markdown 渲染）导致的“高度缓存未更新 -> 行重叠”。

## API 设计

### PromptEditorProps

新增字段：

```ts
previewRenderMode?: 'readonly-editor' | 'markdown';
```

语义：

- `previewMode`：是否进入预览态（隐藏操作按钮，只读展示）
- `previewRenderMode`：预览态展开后内容区域的渲染方式

默认行为：

- `previewMode=false`：完全不受影响
- `previewMode=true && previewRenderMode` 未传：等价于 `readonly-editor`

## 组件与数据流

### 变更点

- `PromptEditor`：读取 `previewRenderMode`（默认值），透传至 `Node`
- `Node`：
  - 预览态展开内容区根据 `previewRenderMode` 选择渲染分支
  - 统一在展开内容容器上做高度测量并回调给 `PromptEditor`

### 高度回写链路

- `Node` 实测展开内容高度 -> `onHeightChange(nodeId, height)`
- `PromptEditor` 缓存高度 -> 更新 `heightVersion`
- 虚拟列表 `rowHeight` 重算 -> 避免重叠/错位

## 兼容性

- 不破坏现有用法：默认 `previewRenderMode='readonly-editor'`
- 不改变交互：预览态仍点击标题展开；非预览态仍使用编辑入口展开
- 不影响样式主题：继续复用现有 theme 处理逻辑

## 测试策略

### 自动化测试（建议最小化但有效）

- 针对 `PromptEditor` 增加用例：
  - `previewMode=true` 默认分支仍渲染只读编辑器（`readonly-editor`）
  - `previewMode=true` + `previewRenderMode='markdown'` 渲染 Markdown 预览分支

尽量不做依赖具体像素的断言，避免脆弱测试；主要验证分支正确与内容存在。

### 手工回归（必须）

- 复现当前错位场景，确认默认 `readonly-editor` 下已无重叠
- `markdown` 模式下：
  - 标题/列表/段落渲染正常
  - 展开/折叠节点后布局不抖动、不重叠
- 非预览模式完全不受影响

## 文档与示例

- 更新预览示例：
  - 保留现有 `preview.tsx` 展示默认行为
  - 增加一个示例或在现有示例中展示 `previewRenderMode='markdown'`
- 更新组件文档中 `previewMode` 与 `previewRenderMode` 的说明

## 风险与对策

- 风险：`MarkdownRenderer` 内部动态插入 highlight.js 样式 link，可能影响 SSR 或引入额外网络请求
  - 对策：该分支仅在 `previewMode + markdown` 时启用，且项目当前主要面向 docs/demo 使用；后续可考虑把高亮样式改为本地打包或可配置关闭
- 风险：高度测量频繁触发导致性能问题
  - 对策：只对展开的节点做测量；回调时对高度做 `Math.ceil` 并避免重复值更新（现有逻辑已具备）

