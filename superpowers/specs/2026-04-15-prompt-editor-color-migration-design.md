# PromptEditor Color Migration Design

## 背景

当前 `PromptEditor` 的主体颜色大量依赖 `src/styles/prompt-editor-protect.css`。

这个文件通过高优先级选择器和 `!important` 覆盖：

- 节点头部
- 编辑器外壳
- 编辑器内容区
- 编辑器底部栏
- 标题颜色
- 添加按钮等基础区域

这种做法虽然能兜底，但带来了两个问题：

1. 组件 DOM 上的 Tailwind `className` 颜色失去真实控制权
2. 调整单个区域时，容易被全局保护样式反向覆盖，排查成本高

## 目标

采用渐进收口方案：

- 删除 `prompt-editor-protect.css`
- 把 `PromptEditor` 主体区域的颜色迁回组件自己的 `className`
- 保留第三方复杂弹层/控件的局部覆盖逻辑，不追求一次性把所有样式都变成纯 className

## 非目标

- 不在这一轮重构所有 Ant Design 组件样式
- 不强行把所有下拉弹层、Sender、Markdown 暗色覆盖全部迁成 Tailwind class
- 不改动首页或 dumi 主题层样式

## 方案选择

采用 `A. 渐进收口`

### 原因

1. 用户当前主要诉求是：主体颜色不要再被 `prompt-editor-protect.css` 偷偷覆盖
2. `PromptEditor` 主体区域具备稳定 className，适合直接迁回 Tailwind
3. 第三方控件的下拉层、Portal、动态生成 DOM 仍然更适合局部覆盖，强行迁移风险高

## 迁移范围

### 迁回组件 className 的区域

- `PromptEditor` 根容器
- 工具栏
- 根节点添加按钮
- 节点头部
- 节点标题文本
- 编辑器外壳
- 编辑器内容面板
- 编辑器底部操作栏
- 撤销/还原按钮
- 依赖区容器

### 继续保留局部样式逻辑的区域

- `TreeSelect` 下拉弹层
- 依赖区内 Ant 选择器状态
- Ant `Sender`
- Markdown 内容暗色适配
- 细滚动条

这些逻辑不再放在 `prompt-editor-protect.css`，而是保留在对应组件或更合适的局部样式文件中。

## 实现设计

### 1. `PromptEditor`

将根容器、工具栏、根节点添加按钮的亮暗色明确写回 `className`，不再依赖属性选择器全局覆盖。

### 2. `Node`

把以下颜色全部写回节点 JSX：

- 节点头部背景/文字
- 编辑器外壳边框/背景
- 编辑器内容区背景
- 编辑器底部栏背景/边框

### 3. `EditableTitle`

保留标题的稳定 class，但颜色不再依赖全局保护样式。标题颜色直接继承节点头部或在 JSX 中显式声明。

### 4. `EditorToolbar`

亮暗色按钮、图标颜色继续保留在组件内部，通过 `theme` 和 `useResolvedTheme` 控制。

### 5. `DependencyConfigSection`

依赖区容器颜色和亮暗态继续放在组件内部，避免依赖全局样式文件。

### 6. 样式入口

从样式入口移除：

- `src/styles/prompt-editor-protect.css`

并删除该文件。

## 风险控制

### 风险 1：亮暗色回归

应对：

- 使用现有稳定 className 和组件级 `theme` 逻辑
- 先迁主体，再检查亮暗态

### 风险 2：第三方控件样式丢失

应对：

- 不在这一轮删除组件内部的局部 `<style>` 覆盖
- TreeSelect、Sender、Markdown 的特殊逻辑继续保留

### 风险 3：示例页与文档页表现不一致

应对：

- 用文档构建作为最终校验
- 检查 `theme-demo` 和当前自定义优化示例两个高风险页面

## 验证方式

至少验证：

1. 亮色模式下节点头、编辑器壳、底部栏颜色正常
2. 暗色模式下节点头、编辑器壳、底部栏颜色正常
3. 主题示例页不再被全局 `!important` 覆盖
4. 自定义优化示例页显示正常
5. 删除 `prompt-editor-protect.css` 后无类型/构建错误

## 验收标准

- `prompt-editor-protect.css` 被删除
- 主体颜色控制回到组件 DOM 的 `className`
- 不再出现“Tailwind 写了但被保护样式覆盖”的情况
- 文档构建通过
