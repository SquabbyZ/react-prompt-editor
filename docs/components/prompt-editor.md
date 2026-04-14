---
demo:
  cols: 2
---

# RPEditor 提示词编辑器

RPEditor 是一个面向 Prompt 工程化的树形编辑器组件，提供层级化提示词管理、节点级运行、依赖组织、流式 AI 优化与展示能力。

## 适用场景

- 维护复杂的 system prompt、规则块、few-shot 示例和多步骤任务说明
- 将节点依赖交给业务侧执行流，构建 Agent 或多阶段生成流程
- 在编辑流程中嵌入 AI 优化，而不是把提示词复制到外部工具里反复改写
- 通过预览模式向团队演示 Prompt 结构、节点状态和运行结果

## 接入前准备

**使用组件前必须先引入样式文件！**

- 组件导入：`import { PromptEditor } from 'react-prompt-editor';`
- 样式导入：`import 'react-prompt-editor/styles/index.css';`

如果不引入样式文件，组件将失去所有样式，显示为未格式化的原始内容。

> 推荐先看“快速上手”，再根据业务需要启用运行、AI 优化、拖拽和国际化能力。

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

## 流式输出示例

展示如何实现真正的流式 AI 优化（模拟 OpenAI、通义千问等 API 的 SSE 响应）：

<code src="./examples/streaming.tsx"></code>

## 多平台回调模式示例

如果您需要适配 Dify、OpenAI、阿里百炼或自定义后端，建议先用下面的示例熟悉 `onOptimizeRequest` 的回调协议，再切到真实接口测试，最后直接复制实战代码到自己的项目中：

<code src="./examples/callback-platforms.tsx"></code>

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

| 参数           | 说明                                                       | 类型                            | 默认值     |
| -------------- | ---------------------------------------------------------- | ------------------------------- | ---------- |
| initialValue   | 初始树形数据（非受控模式）                                 | `TaskNode[]`                    | `[]`       |
| value          | 树形数据（受控模式）                                       | `TaskNode[]`                    | -          |
| optimizeConfig | AI 优化配置（提供此项后组件自动处理请求与流式/非流式渲染） | `OptimizeConfig`                | -          |
| autoOptimize   | 是否在打开优化弹窗时自动开始优化                           | `boolean`                       | `true`     |
| className      | 自定义类名                                                 | `string`                        | -          |
| style          | 自定义样式                                                 | `React.CSSProperties`           | -          |
| renderToolbar  | 自定义顶部工具栏                                           | `(actions) => ReactNode`        | -          |
| previewMode    | 预览模式（只读，隐藏编辑功能）                             | `boolean`                       | `false`    |
| locale         | 国际化配置（类似 Ant Design 的语言包）                     | `Locale`                        | `zhCN`     |
| theme          | 主题模式（控制明亮/暗色主题）                              | `'system' \| 'light' \| 'dark'` | `'system'` |
| draggable      | 是否支持拖拽排序（启用后可通过拖拽调整节点位置和层级）     | `boolean`                       | `false`    |

#### 事件 (Events)

| 参数              | 说明                                                             | 类型                                                                     | 默认值 |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| onChange          | 数据变化回调                                                     | `(data: TaskNode[]) => void`                                             | -      |
| onRunRequest      | 运行请求回调（触发运行时调用，用户自行处理异步请求）             | `(request: RunTaskRequest) => void`                                      | -      |
| onOptimizeRequest | 优化请求回调（高级模式，用户自行处理请求并通过 onResponse 返回） | `(request: OptimizeRequest, callbacks: { onResponse, onError }) => void` | -      |
| onNodeRun         | 节点运行完成回调（用户执行完运行请求后调用，通知组件更新状态）   | `(nodeId: string, result: RunTaskResponse) => void`                      | -      |
| onNodeOptimize    | 节点优化完成回调（用户执行完优化请求后调用，通知组件）           | `(nodeId: string, result: OptimizeResponse) => void`                     | -      |
| onNodeLock        | 节点锁定回调                                                     | `(nodeId: string, isLocked: boolean) => void`                            | -      |
| onTreeChange      | 树变化回调                                                       | `(tree: TaskNode[]) => void`                                             | -      |
| onLike            | AI 优化消息点赞回调                                              | `(messageId: string) => void`                                            | -      |
| onDislike         | AI 优化消息点踩回调                                              | `(messageId: string) => void`                                            | -      |

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

使用 `value` 和 `onChange` 进行受控模式的数据绑定：

```typescript
const [value, setValue] = useState<TaskNode[]>(initialData);

<PromptEditor
  value={value}
  onChange={setValue}
/>
```

### 纯回调模式详解

组件采用**纯回调模式**设计，将异步请求的控制权交给用户：

- **onRunRequest**: 当用户点击运行按钮时触发
- **onOptimizeRequest**: 当用户点击 AI 优化时触发

```typescript
<PromptEditor
  value={value}
  onChange={setValue}
  onRunRequest={(request) => {
    // 1. 执行你的异步请求
    fetch('/api/run', { method: 'POST', body: JSON.stringify(request) })
      .then(res => res.json())
      .then(result => {
        // 2. 通知组件运行完成
        onNodeRun(request.nodeId, result);
      });
  }}
/>
```

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
const handleOptimizeRequest = (
  request: OptimizeRequest,
  callbacks: { onResponse; onError },
) => {
  // 调用你的 AI API（如 OpenAI、通义千问等）
  fetch('/api/optimize', {
    method: 'POST',
    body: JSON.stringify(request),
  })
    .then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      // 读取 SSE 流
      function readStream() {
        return reader.read().then(({ done, value }) => {
          if (done) return;

          const chunk = decoder.decode(value);
          fullText += chunk;

          // 每次收到新数据就调用 onResponse
          callbacks.onResponse({
            optimizedContent: fullText,
            thinkingProcess: '正在生成...',
          });

          return readStream();
        });
      }

      return readStream();
    })
    .catch((error) => callbacks.onError(error));
};
```

### AI 优化 (两种接入方式)

组件支持两种方式接入 AI 优化能力：

#### 1. 简化模式 (配置式)

如果您使用的是符合 OpenAI 接口规范的后端（支持 SSE 流式响应），可以直接通过 `optimizeConfig` 配置。组件将自动处理所有的请求发起、流式解析和对话展示。

```tsx | pure
<PromptEditor
  optimizeConfig={{
    url: '/api/ai/optimize',
    headers: { Authorization: 'Bearer your_token' },
    model: 'gpt-4',
    temperature: 0.8,
  }}
/>
```

#### 2. 高级模式 (回调式)

如果您需要完全控制请求过程（如：非标准接口、复杂的流式处理、自定义加密等），可以使用 `onOptimizeRequest`。

现在支持**结构化消息**和**中断信号**，让实现更加简单：

```typescript
const handleOptimizeRequest = (
  request: OptimizeRequest,
  callbacks: { onResponse; onError },
) => {
  // 1. 直接获取结构化的 messages，无需手动解析字符串
  const { messages, signal } = request;

  // 2. 发起请求并透传 signal，实现关闭弹窗时自动取消请求
  fetch('/api/optimize', {
    method: 'POST',
    body: JSON.stringify({ messages }),
    signal, // 自动取消支持
  })
    .then((response) => {
      // ... 流式处理逻辑 (详见下方示例)
    })
    .catch((error) => {
      if (error.name === 'AbortError') return; // 忽略用户手动取消
      callbacks.onError(error);
    });
};
```

### 预览模式

使用 `previewMode` 属性启用只读展示：

```typescript
<PromptEditor
  value={data}
  previewMode={true}  // 隐藏所有操作按钮
/>
```

**预览模式特性：**

- ✅ 显示节点标题和序号
- ✅ 显示编辑器内容（只读）
- ✅ 可以展开/折叠子节点
- ❌ 隐藏顶部工具栏
- ❌ 隐藏所有操作按钮（编辑、添加、锁定、删除等）
- ❌ 隐藏运行和 AI 优化按钮
- ❌ 编辑器设置为只读状态

### Zustand 状态管理

组件内部使用 **Zustand** 进行状态管理：

#### 多实例支持

每个 `<PromptEditor />` 实例都有独立的 store，互不干扰：

```typescript
const Editor1 = () => <PromptEditor initialValue={tree1} />;
const Editor2 = () => <PromptEditor initialValue={tree2} />;
```

### 受控/非受控模式

**非受控模式**（推荐简单场景）：

```typescript
<PromptEditor initialValue={initialData} />
```

**受控模式**（需要外部控制状态）：

```typescript
const [value, setValue] = useState<TaskNode[]>([]);
<PromptEditor value={value} onChange={setValue} />
```

详细的代码示例请查看上方的基础示例。
