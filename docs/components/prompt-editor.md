---
demo:
  cols: 2
---

# RPEditor 提示词编辑器

RPEditor 是一个面向 Prompt 工程化的树形编辑器组件，提供层级化提示词管理、节点级运行、依赖组织、流式 AI 优化与展示能力。

## 🤖 AI 辅助开发

我们提供了 **peaks-react-prompt-editor** Skill，帮助你在 AI 辅助开发中更高效地使用 RPEditor。

- 📦 NPM 包：[peaks-skills](https://www.npmjs.com/package/peaks-skills)
- 🔧 安装命令：`npx skills add https://www.npmjs.com/package/peaks-skills`
- 💡 使用方式：在 AI 对话中询问 RPEditor 相关问题时，AI 会自动加载该 Skill

## 适用场景

- 维护复杂的 system prompt、规则块、few-shot 示例和多步骤任务说明
- 将节点依赖交给业务侧执行流，构建 Agent 或多阶段生成流程
- 在编辑流程中嵌入 AI 优化，而不是把提示词复制到外部工具里反复改写
- 通过预览模式向团队演示 Prompt 结构、节点状态和运行结果

## 接入前准备

### 1. 安装依赖

当前 npm 包是基于 Ant Design UI 的版本，内置的编辑器与 AI 优化交互都围绕 Ant Design 体系设计。后续会再提供其他 UI 库版本。

#### 完整安装（推荐）

```bash
pnpm add react-prompt-editor antd @ant-design/x
```

#### 分步安装

```bash
# 1. 安装主库
pnpm add react-prompt-editor

# 2. 安装 Peer Dependencies
pnpm add antd @ant-design/x
```

> 💡 **为什么需要手动安装这些依赖？**
>
> 当前版本明确基于 Ant Design UI，因此 `antd` 与 `@ant-design/x` 由宿主项目提供。这样可以：
>
> - ✅ 复用你项目里的 Ant Design 主题和配置
> - ✅ 如果你的项目已有 antd，不会重复加载
> - ✅ 让你控制 Ant Design 相关依赖版本
> - ✅ 为后续其他 UI 库版本预留清晰的产品边界
>
> 详细说明请查看 [INSTALL.md](https://github.com/SquabbyZ/react-prompt-editor/blob/main/INSTALL.md)

### 2. 导入组件和样式

**使用组件前必须先引入样式文件！**

- 组件导入：`import { PromptEditor } from 'react-prompt-editor';`
- 样式导入：`import 'react-prompt-editor/styles/index.css';`

如果不引入样式文件，组件将失去所有样式，显示为未格式化的原始内容。

> ⚠️ **重要提示**：推荐先看“快速上手”，再根据业务需要启用运行、AI 优化、拖拽和国际化能力。

## 快速上手

最简单的使用方式，只需提供数据和 onChange 回调：

<code src="../examples/quickstart.tsx"></code>

## 核心工作流示例

完整示例，包含运行和 AI 优化功能：

<code src="../examples/basic.tsx"></code>

## 预览模式

使用 `previewMode` 属性实现只读展示，隐藏所有操作按钮：

<code src="../examples/preview.tsx"></code>

## 拖拽排序

使用 `draggable` 属性启用节点拖拽排序功能，可以通过拖拽调整节点位置和层级：

<code src="../examples/draggable.tsx"></code>

**拖拽功能说明：**

- ✅ 拖拽节点到其他节点上方/下方调整顺序
- ✅ 拖拽节点到另一个节点内部作为子节点
- ✅ 自动检测并防止循环依赖（不能将父节点拖入其子节点）
- ❌ 锁定的节点不可拖拽
- ❌ 预览模式下不可拖拽

## 受控与非受控模式

组件支持两种数据管理方式：**受控模式**（`value` + `onChange`）和**非受控模式**（`initialValue`）。受控模式适合需要在外部同步状态的场景，非受控模式适合简单的独立使用：

<code src="./examples/controlled-uncontrolled.tsx"></code>

## 自定义工具栏

使用 `renderToolbar` 属性可以完全自定义顶部工具栏的内容和布局。回调参数提供了 `addRootNode` 等内置操作方法，方便与自定义 UI 结合使用：

<code src="./examples/custom-toolbar.tsx"></code>

## 节点依赖

通过 `dependencies` 字段建立节点间的依赖关系。运行节点时，`onRunRequest` 回调的 `dependenciesContent` 会自动包含所有依赖节点的内容，适合构建 Agent 或多阶段生成流程：

<code src="./examples/dependencies.tsx"></code>

## 预览渲染模式对比

`previewRenderMode` 支持两种渲染方式：`readonly-editor`（保留代码高亮和行号）和 `markdown`（更适合非技术人员阅读）：

<code src="./examples/preview-render-modes.tsx"></code>

## 多编辑器实例

每个 `<PromptEditor />` 实例拥有独立的 Zustand store，互不干扰。适合同时管理多个 Prompt 模板的场景（如同时编辑 System Prompt 和 User Prompt）：

<code src="./examples/multi-instance.tsx"></code>

## 大数据示例

这个示例专门展示 `PromptEditor` 在大规模树节点场景下的渲染与交互体验。你可以在 `200 / 1000 / 2000` 三档预置数据量之间切换，也可以用自定义模式手动生成测试数据；当前 docs 示例最高支持 `10000` 节点、`10` 层级，重点观察加载、展开、滚动和基础内容编辑是否保持稳定。

<code src="./examples/large-dataset.tsx"></code>

## 流式输出示例

展示如何实现真正的流式 AI 优化（模拟 OpenAI、通义千问等 API 的 SSE 响应）：

<code src="./examples/streaming.tsx"></code>

## 自定义优化内容区示例

如果您希望用自定义 UI 替换默认的 AI 优化内容区，可以结合 `optimizeCustomContent` 和 `onOptimizeRequest` 使用 mock 数据快速搭一个可交互的演示面板：

<code src="./examples/callback-platforms.tsx"></code>

## 📎 数据选择器（插入变量）

使用 `dataSelector` 属性可以为编辑器添加强大的变量插入功能，让用户能够轻松在提示词中插入动态内容（如 `@用户名`、`@当前日期` 等）。点击编辑器底部工具栏的 **Variable** 图标即可打开数据选择器。

<code src="./examples/data-selector.tsx"></code>

### 核心特性

- ✅ **自定义数据源**：完全控制变量的数据来源和展示方式
- ✅ **可视化标签**：插入的变量以醒目的标签形式显示在编辑器中（浅蓝色背景，圆角边框）
- ✅ **光标定位**：自动在光标位置插入选中的变量
- ✅ **纯文本序列化**：复制或删除时表现为普通文本，便于下游处理
- ✅ **组件化设计**：传入任意 React 组件作为数据选择器 UI

### 实现自定义数据选择器

创建一个自定义的数据选择器组件需要：

1. 定义一个 React 函数组件，接收 `DataSelectorComponentProps` 类型的 props
2. 在组件中使用 Ant Design 的 Modal、List 等组件构建 UI
3. 调用 `onSelect(item)` 插入选中的变量，调用 `onCancel()` 关闭选择器

**组件接收的 Props：**

- `onSelect`: 选中变量时的回调函数，接收 `TagData` 参数
- `onCancel`: 取消选择时的回调函数
- `cursorPosition`: 打开选择器时光标的位置（可选）

完整的示例代码请参考 [data-selector.tsx](./examples/data-selector.tsx) 示例文件。

**关键点：**

- 组件接收 `onSelect`、`onCancel` 和 `cursorPosition` 三个 props
- 调用 `onSelect(item)` 即可插入选中的变量
- 调用 `onCancel()` 关闭选择器

### 数据结构说明

**TagData** - 变量数据结构：

| 字段     | 类型                  | 说明                         |
| -------- | --------------------- | ---------------------------- |
| id       | `string`              | 变量的唯一标识符             |
| label    | `string`              | 显示在编辑器中的标签文本     |
| value    | `string`              | 变量的实际值（用于后续处理） |
| metadata | `Record<string, any>` | 可选的元数据，存储额外信息   |

**DataSelectorComponentProps** - 选择器组件 Props：

| 字段           | 类型                                   | 说明                                 |
| -------------- | -------------------------------------- | ------------------------------------ |
| onSelect       | `(data: TagData \| TagData[]) => void` | 选中变量时的回调，支持单选或多选     |
| onCancel       | `() => void`                           | 取消选择时的回调                     |
| cursorPosition | `number`                               | 打开选择器时光标的位置（可选）       |
| multiple       | `boolean`                              | 是否启用多选模式（可选，默认 false） |

### 多选功能

数据选择器组件支持多选模式，允许用户一次性选择多个变量并批量插入到编辑器中：

1. 在自定义数据选择器组件中，通过 `multiple` prop 判断是否启用多选模式
2. 在多选模式下，`onSelect` 回调可以接收 `TagData[]` 数组
3. 编辑器会自动将多个变量按顺序插入到光标位置

推荐先看完整示例：[data-selector.tsx](./examples/data-selector.tsx)（包含运行回调与变量追踪）。

### 标签删除（Tag Close）

当前版本支持在编辑器中的变量标签右侧显示关闭按钮（`×`）：

- 点击 `×` 会删除整个变量标签

这在用户频繁编辑 Prompt 时非常实用，不需要手动删除整段变量文本。

### 运行时内容处理（去掉 `@` 前缀）

如果标签显示为 `@用户名`、`@当前日期`，点击运行时会将内容中的标签文本转换为去掉 `@` 的纯文本：

- `@用户名` → `用户名`
- `@当前日期` → `当前日期`

也就是说，传给 `onRunRequest` 的 `request.content` 是处理后的文本。

### 最小示例（多选 + 删除 + 运行）

```tsx | pure
const handleRunRequest = (request: RunTaskRequest) => {
  console.log('处理后的内容:', request.content); // 标签文本已去掉 @
};

<PromptEditor
  value={value}
  onChange={setValue}
  dataSelector={DataSelector}
  onRunRequest={handleRunRequest}
/>;
```

## 🧩 自定义节点顶部插槽

使用 `renderNodeTopSlot` 可以在每个节点的**头部下方、内容区上方**渲染自定义 ReactNode（也就是你截图标注的那一行位置）。

<code src="../examples/node-top-slot.tsx"></code>

### 适用场景

- 在节点内展示状态条、提示信息、审批标记
- 插入你自己的按钮组、统计信息、辅助说明
- 根据节点数据动态渲染不同的 UI

### 使用方式

```tsx | pure
<PromptEditor
  value={value}
  onChange={setValue}
  renderNodeTopSlot={({ node, isDarkMode }) => (
    <div>当前节点：{node.title}</div>
  )}
/>
```

`renderNodeTopSlot` 回调参数：

- `node`: 当前节点数据（`TaskNode`）
- `isDarkMode`: 当前是否暗色模式（`boolean`）

### 与 `renderNodeActions` 组合使用

如果你既要在节点中间区域扩展 UI，又要自定义底部按钮区域，可以同时传入这两个配置：

<code src="../examples/node-slot-with-actions.tsx"></code>

布局顺序如下：

1. 节点头部（标题、锁定、删除等）
2. `renderNodeTopSlot`（你新增的中间插槽）
3. CodeMirror 内容区
4. 底部工具栏/`renderNodeActions`

### 注意事项

- 当你传入 `renderNodeActions` 后，会覆盖默认底部按钮区域；如果仍需要“插入变量”能力，请在自定义按钮中调用 `defaultActions.handleOpenDataSelector`。
- 如果仍需要“运行”和“AI 优化”能力，请分别调用 `defaultActions.handleRun`、`defaultActions.handleOptimize`。
- `renderNodeTopSlot` 仅负责中间插槽渲染，不会影响底部按钮逻辑；建议将状态展示放在 top slot，将交互按钮放在 actions 区域。

## 🎯 自定义节点底部操作按钮

使用 `renderNodeActions` 属性可以完全自定义节点底部操作按钮区域的内容和布局。默认情况下，节点底部会显示三个按钮：**插入变量**、**运行** 和 **AI 优化**。通过提供此属性，您可以替换为任何自定义的 UI。

<code src="./examples/custom-actions-simple.tsx"></code>

### 核心特性

- ✅ **完全自定义**：可以替换为任意 React 组件，不受默认按钮限制
- ✅ **访问默认操作**：回调参数中提供了所有默认操作函数，方便复用
- ✅ **主题适配**：提供 `isDarkMode` 参数，便于自定义组件适配暗色模式
- ✅ **节点信息**：可以访问当前节点的完整数据，实现条件渲染

### 使用方式

`renderNodeActions` 接收一个回调函数，该函数的参数包含：

**Props 参数：**

- `node`: 当前节点的数据（`TaskNode` 类型）
- `defaultActions`: 默认操作函数集合
  - `handleOpenDataSelector`: 打开数据选择器
  - `handleRun`: 执行节点运行
  - `handleOptimize`: 打开 AI 优化弹窗
- `isDarkMode`: 是否为暗色模式（`boolean`）

**示例：**

```tsx | pure
const renderCustomActions = ({ node, defaultActions, isDarkMode }) => {
  return (
    <Space size="small">
      <Button
        icon={<Variable size={14} />}
        onClick={defaultActions.handleOpenDataSelector}
        size="small"
      >
        插入变量
      </Button>
      <Button
        icon={<PlayCircle size={14} />}
        onClick={defaultActions.handleRun}
        size="small"
        type="primary"
      >
        执行
      </Button>
      {/* 可以添加更多自定义按钮 */}
      <Button
        icon={<Settings size={14} />}
        onClick={() => console.log('设置', node.id)}
        size="small"
      >
        设置
      </Button>
    </Space>
  );
};

<PromptEditor
  value={value}
  onChange={setValue}
  renderNodeActions={renderCustomActions}
/>;
```

### 应用场景

- **简化界面**：如果不需要某些功能，可以只保留必要的按钮
- **添加新功能**：比如添加“复制”、“分享”、“导出”等自定义操作
- **条件显示**：根据节点状态（如是否已运行、是否锁定）显示不同的按钮
- **品牌定制**：使用符合产品风格的按钮样式和图标

## 🌍 国际化

组件支持中英文切换，CodeMirror 编辑器的搜索框等 UI 元素也会自动切换语言：

<code src="./examples/i18n-demo.tsx"></code>

更多语言包和扩展方式请参考：[国际化文档](../i18n)

## 🎨 主题模式

组件支持明亮/暗色主题切换，可以跟随系统或手动指定：

<code src="../examples/theme-demo.tsx"></code>

**主题模式说明：**

- `system`: 跟随系统设置，自动检测用户的系统主题偏好
- `light`: 强制使用明亮主题，不随系统变化
- `dark`: 强制使用暗色主题，不随系统变化

## API

### PromptEditor Props

#### 属性 (Props)

| 参数                  | 说明                                                                                  | 类型                                              | 默认值              |
| --------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------- | ------------------- |
| initialValue          | 初始树形数据（非受控模式）                                                            | `TaskNode[]`                                      | `[]`                |
| value                 | 树形数据（受控模式）                                                                  | `TaskNode[]`                                      | -                   |
| optimizeConfig        | AI 优化配置（提供此项后组件自动处理请求与流式/非流式渲染）                            | `OptimizeConfig`                                  | -                   |
| autoOptimize          | 是否在打开优化弹窗时自动开始优化                                                      | `boolean`                                         | `true`              |
| className             | 自定义类名                                                                            | `string`                                          | -                   |
| style                 | 自定义样式                                                                            | `React.CSSProperties`                             | -                   |
| renderToolbar         | 自定义顶部工具栏                                                                      | `(actions) => ReactNode`                          | -                   |
| optimizeCustomContent | 启用外部自定义优化流程；非 null 时点击 AI 优化不会打开内置弹窗                        | `ReactNode \| null`                               | `null`              |
| previewMode           | 预览模式（只读，隐藏编辑功能）                                                        | `boolean`                                         | `false`             |
| previewRenderMode     | 预览模式内容区渲染方式，仅在 `previewMode` 下生效，支持只读编辑器或 Markdown 阅读视图 | `'readonly-editor' \| 'markdown'`                 | `'readonly-editor'` |
| locale                | 国际化配置（类似 Ant Design 的语言包）                                                | `Locale`                                          | `zhCN`              |
| theme                 | 主题模式（控制明亮/暗色主题）                                                         | `'system' \| 'light' \| 'dark'`                   | `'system'`          |
| draggable             | 是否支持拖拽排序（启用后可通过拖拽调整节点位置和层级）                                | `boolean`                                         | `false`             |
| dataSelector          | 数据选择器组件（用于在编辑器中插入变量，如 @用户名、@当前日期等）                     | `React.ComponentType<DataSelectorComponentProps>` | -                   |
| renderNodeActions     | 自定义节点底部操作按钮区域（提供此项可完全替换默认的变量/运行/AI优化按钮）            | `(props) => ReactNode`                            | -                   |
| renderNodeTopSlot     | 自定义节点头部下方、内容区上方插槽（支持渲染任意 ReactNode）                          | `(props) => ReactNode`                            | -                   |

#### 事件 (Events)

| 参数              | 说明                                                                                      | 类型                                                 | 默认值 |
| ----------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| onChange          | 数据变化回调                                                                              | `(data: TaskNode[]) => void`                         | -      |
| onRunRequest      | 运行请求回调（触发运行时调用，用户自行处理异步请求）                                      | `(request: RunTaskRequest) => void`                  | -      |
| onOptimizeRequest | 优化请求回调（高级模式，用户自行处理请求，并通过 request.applyOptimizedContent 应用结果） | `(request: OptimizeRequest) => void`                 | -      |
| onNodeRun         | 节点运行完成回调（用户执行完运行请求后调用，通知组件更新状态）                            | `(nodeId: string, result: RunTaskResponse) => void`  | -      |
| onNodeOptimize    | 节点优化完成回调（用户执行完优化请求后调用，通知组件）                                    | `(nodeId: string, result: OptimizeResponse) => void` | -      |
| onNodeLock        | 节点锁定回调                                                                              | `(nodeId: string, isLocked: boolean) => void`        | -      |
| onTreeChange      | 树变化回调                                                                                | `(tree: TaskNode[]) => void`                         | -      |
| onLike            | AI 优化消息点赞回调                                                                       | `(messageId: string) => void`                        | -      |
| onDislike         | AI 优化消息点踩回调                                                                       | `(messageId: string) => void`                        | -      |

## 数据类型

### TaskNode

```typescript
interface TaskNode {
  id: string; // 节点唯一标识
  title: string; // 节点标题
  content: string; // Markdown 内容
  parentId?: string; // 父节点 ID
  children?: TaskNode[]; // 子节点数组
  isLocked: boolean; // 是否已锁定
  hasRun: boolean; // 是否已运行
  dependencies?: string[]; // 依赖节点 ID 数组
}
```

### RunTaskRequest

```typescript
interface RunTaskRequest {
  nodeId: string; // 节点 ID
  content: string; // 节点内容
  dependenciesContent: DependencyInfo[]; // 依赖节点信息
  stream?: boolean; // 是否流式输出
  meta?: Record<string, unknown>; // 额外元数据
}

interface DependencyInfo {
  nodeId: string; // 依赖节点 ID
  title: string; // 依赖节点标题
  content: string; // 依赖节点内容
  hasRun: boolean; // 是否已运行
}
```

### OptimizeRequest

````typescript
interface OptimizeRequest {
  content: string; // 原始内容
  selectedText?: string; // 选中的文本（如果有）
  instruction?: string; // 优化指令（包含上下文拼接）
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>; // 结构化对话历史
  signal?: AbortSignal; // 取消请求的信号
  applyOptimizedContent: (content: string) => void; // 应用优化结果到当前选区或当前节点
  setOptimizeError: (error: string | Error) => void; // 设置优化错误信息
  closeOptimizeDialog: () => void; // 主动关闭优化弹窗
  meta?: Record<string, unknown>;
}

### OptimizeConfig (简化模式配置)

```typescript
interface OptimizeConfig {
  url: string; // API 请求地址（支持 OpenAI 兼容格式或后端代理）
  headers?: Record<string, string>; // 请求头（通常用于鉴权）
  model?: string; // 模型名称，默认 gpt-3.5-turbo
  temperature?: number; // 温度参数，默认 0.7
  stream?: boolean; // 是否开启流式输出，默认 true。设为 false 时前端会自动模拟打字机效果
  platform?: 'auto' | 'openai' | 'dify' | 'bailian'; // 平台类型适配，默认 'auto' 自动探测
  extraParams?: Record<string, unknown>; // 其他自定义参数
}
```

**平台适配说明：**

- **OpenAI 标准**: 自动解析 `choices[0].delta.content`。
- **Dify 平台**: 自动监听 `event: message` 事件并提取 `answer` 字段。
- **阿里百炼**: 自动解析 `text` 字段，通过 `usage` 字段识别百炼格式，通过 `finish_reason: "stop"` 判断结束。
- **通用 JSON**: 兜底尝试提取根节点的 `content`, `text` 等字段。
- **容错处理**: 遇到非标准 JSON 行时会自动跳过，连续错误超过阈值会终止流式并提示用户。`

````

## 使用指南

### 数据绑定

使用 `value` 和 `onChange` 进行受控模式的数据绑定。具体做法：

1. 使用 `useState` 创建状态存储树形数据
2. 将状态值传入 `value` prop
3. 将状态更新函数传入 `onChange` prop

详细示例请参考 [controlled-uncontrolled.tsx](./examples/controlled-uncontrolled.tsx)。

### 纯回调模式详解

组件采用**纯回调模式**设计，将异步请求的控制权交给用户：

- **onRunRequest**: 当用户点击运行按钮时触发，用户自行处理异步请求，完成后调用 `onNodeRun` 通知组件
- **onOptimizeRequest**: 当用户点击 AI 优化时触发，用户自行处理请求，通过 `request.applyOptimizedContent()` 应用结果

详细实现请参考 [basic.tsx](./examples/basic.tsx) 和 [streaming.tsx](./examples/streaming.tsx) 示例。

#### 运行请求示例

```typescript
const handleRunRequest = (request: RunTaskRequest) => {
  // 1. 执行你的 API 调用
  fetch('/api/run', {
    method: 'POST',
    body: JSON.stringify(request),
  })
    .then((res) => res.json())
    .then((result) => {
      // 2. 调用 onNodeRun 通知组件
      onNodeRun(request.nodeId, result);
    })
    .catch((error) => {
      // 处理错误
      message.error('运行失败');
    });
};
```

#### 流式输出示例

```typescript
const handleOptimizeRequest = async (request: OptimizeRequest) => {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({
        messages: request.messages,
        instruction: request.instruction,
      }),
      signal: request.signal,
    });

    const data = await response.json();
    request.applyOptimizedContent(data.optimizedContent);
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
    request.setOptimizeError(error as Error);
  }
};
```

### AI 优化 (两种接入方式)

组件支持两种方式接入 AI 优化能力：

#### 1. 简化模式 (配置式)

如果您使用的是符合 OpenAI 接口规范的后端（支持 SSE 流式响应），可以直接通过 `optimizeConfig` 配置。组件将自动处理所有的请求发起、流式解析和对话展示。

配置项包括：

- `url`: API 地址
- `headers`: 请求头（如 Authorization）
- `model`: 模型名称
- `temperature`: 温度参数

#### 2. 高级模式 (回调式)

如果您需要完全控制请求过程（如：非标准接口、自定义鉴权、自定义后端协议等），可以使用 `onOptimizeRequest`。

现在支持**结构化消息**、**中断信号**和**命令式应用结果**，实现方式会更接近 `onRunRequest`：

```typescript
const handleOptimizeRequest = async (request: OptimizeRequest) => {
  const { messages, signal } = request;

  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({ messages }),
      signal,
    });

    const data = await response.json();
    request.applyOptimizedContent(data.optimizedContent);
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
    request.setOptimizeError(error as Error);
  }
};
```

您也可以通过 `optimizeCustomContent` 启用外部自定义优化流程；当该配置不为 `null` 时，点击 `AI 优化` 不会再打开内置弹窗，而是直接触发 `onOptimizeRequest`，由您在组件外部消费 request 并控制交互。

### 预览模式

使用 `previewMode` 属性启用只读展示，可选 `previewRenderMode` 控制渲染方式（`readonly-editor` 或 `markdown`）。

详细示例请参考 [preview.tsx](./examples/preview.tsx) 和 [preview-render-modes.tsx](./examples/preview-render-modes.tsx)。

**预览模式特性：**

- ✅ 显示节点标题和序号
- ✅ 默认显示只读编辑器内容
- ✅ 可选显示 Markdown 阅读视图
- ✅ 可以展开/折叠子节点
- ❌ 隐藏顶部工具栏
- ❌ 隐藏所有操作按钮（编辑、添加、锁定、删除等）
- ❌ 隐藏运行和 AI 优化按钮
- ❌ 编辑器设置为只读状态

### Zustand 状态管理

组件内部使用 **Zustand** 进行状态管理：

#### 多实例支持

每个 `<PromptEditor />` 实例都有独立的 store，互不干扰。可以在同一页面中使用多个编辑器实例。

### 受控/非受控模式

**非受控模式**（推荐简单场景）：使用 `initialValue` 提供初始数据。

**受控模式**（需要外部控制状态）：使用 `value` 和 `onChange` 管理状态。

详细示例请参考 [controlled-uncontrolled.tsx](./examples/controlled-uncontrolled.tsx)。

详细的代码示例请查看上方的基础示例。
