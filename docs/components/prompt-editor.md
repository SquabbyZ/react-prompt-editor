---
title: PromptEditor - 提示词编辑器
description: 树形提示词编辑器组件，支持层级化管理、依赖配置、运行与 AI 优化
demo:
  - cols: 1
    iframe: 600
---

# PromptEditor 提示词编辑器

树形提示词编辑器组件，提供层级化提示词管理、可视化编辑、任务依赖、运行与 AI 优化能力。

## 基础使用

<code src="./examples/basic.tsx" title="基础示例"></code>

## 流式输出示例

展示如何实现真正的流式 AI 优化（模拟 OpenAI、通义千问等 API 的 SSE 响应）：

<code src="./examples/streaming.tsx" title="流式输出示例"></code>

## API

### PromptEditor Props

| 参数              | 说明                                                           | 类型                                                                     | 默认值      | 版本 |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------- | ---- |
| initialValue      | 初始树形数据（非受控模式）                                     | `TaskNode[]`                                                             | `[]`        | -    |
| value             | 树形数据（受控模式）                                           | `TaskNode[]`                                                             | -           | -    |
| onChange          | 数据变化回调                                                   | `(data: TaskNode[]) => void`                                             | -           | -    |
| onRunRequest      | 运行请求回调（触发运行时调用，用户自行处理异步请求）           | `(request: RunTaskRequest) => void`                                      | -           | -    |
| onOptimizeRequest | 优化请求回调（触发优化时调用，用户通过 onResponse 返回结果）   | `(request: OptimizeRequest, callbacks: { onResponse, onError }) => void` | -           | -    |
| onNodeRun         | 节点运行完成回调（用户执行完运行请求后调用，通知组件更新状态） | `(nodeId: string, result: RunTaskResponse) => void`                      | -           | -    |
| onNodeOptimize    | 节点优化完成回调（用户执行完优化请求后调用，通知组件）         | `(nodeId: string, result: OptimizeResponse) => void`                     | -           | -    |
| onNodeLock        | 节点锁定回调                                                   | `(nodeId: string, isLocked: boolean) => void`                            | -           | -    |
| onTreeChange      | 树变化回调                                                     | `(tree: TaskNode[]) => void`                                             | -           | -    |
| theme             | 主题                                                           | `'default' \| 'ant-design'`                                              | `'default'` | -    |
| className         | 自定义类名                                                     | `string`                                                                 | -           | -    |
| style             | 自定义样式                                                     | `React.CSSProperties`                                                    | -           | -    |
| renderToolbar     | 自定义顶部工具栏                                               | `(actions) => ReactNode`                                                 | -           | -    |
| onLike            | AI 优化消息点赞回调                                            | `(messageId: string) => void`                                            | -           | -    |
| onDislike         | AI 优化消息点踩回调                                            | `(messageId: string) => void`                                            | -           | -    |

## 数据类型

### TaskNode

```typescript
interface TaskNode {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: TaskNode[];
  isLocked: boolean;
  hasRun: boolean;
  dependencies?: string[];
}
```

### RunTaskRequest

```typescript
interface RunTaskRequest {
  nodeId: string;
  content: string;
  dependenciesContent: string[];
  stream?: boolean;
  meta?: Record<string, unknown>;
}
```

### OptimizeRequest

```typescript
interface OptimizeRequest {
  content: string;
  selectedText?: string;
  instruction?: string;
  meta?: Record<string, unknown>;
}
```

## 使用指南

### 纯回调模式

组件采用**纯回调模式**设计，将异步请求的控制权交给用户：

- **onRunRequest**: 当用户点击运行按钮时触发，你需要自行执行异步请求，然后通过 `onNodeRun` 通知组件结果
- **onOptimizeRequest**: 当用户点击 AI 优化时触发，通过 `callbacks.onResponse()` 返回结果（支持多次调用实现流式输出）

这种设计的优势：

- ✅ 完全控制异步请求（自定义错误处理、loading 状态等）
- ✅ 灵活集成任意后端 API
- ✅ 支持流式输出（多次调用 `onResponse`）

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

### Zustand 状态管理

组件内部使用 **Zustand** 进行状态管理，具有以下特点：

#### 多实例支持

每个 `<PromptEditor />` 实例都有独立的 store，互不干扰：

```typescript
// 多个编辑器实例可以安全共存
const Editor1 = () => <PromptEditor initialValue={tree1} />;
const Editor2 = () => <PromptEditor initialValue={tree2} />;
```

#### 性能优化

使用 Selector 模式订阅特定状态，避免不必要的重渲染：

```typescript
// ✅ 只订阅需要的状态
const tree = store((state) => state.getTree());
const updateNode = store((state) => state.updateNode);
```

#### 避免闭包问题

在回调函数中直接使用 `store.getState()` 获取最新数据：

```typescript
const handleNodeRun = useCallback(
  (nodeId: string) => {
    // ✅ 直接获取最新节点数据，避免闭包陷阱
    const node = store.getState().getNode(nodeId);
    if (!node) return;

    onRunRequest({ nodeId, content: node.content });
  },
  [onRunRequest, store],
);
```

### 受控/非受控模式

**非受控模式**（推荐简单场景）：

```typescript
const NonControlled = () => <PromptEditor initialValue={initialData} />;
```

**受控模式**（需要外部控制状态）：

```typescript
const Controlled = () => {
  const [value, setValue] = useState<TaskNode[]>([]);
  return <PromptEditor value={value} onChange={setValue} />;
};
```

详细的代码示例请查看上方的基础示例。
