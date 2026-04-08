---
demo:
  cols: 2
---

# PromptEditor 提示词编辑器

树形提示词编辑器组件，提供层级化提示词管理、可视化编辑、任务依赖、运行与 AI 优化能力。

## ⚠️ 重要：样式引入

**使用组件前必须先引入样式文件！**

```typescript
import { PromptEditor } from 'react-prompt-editor';
import 'react-prompt-editor/dist/styles/tailwind.css'; // 必须引入
```

如果不引入样式文件，组件将失去所有样式，显示为未格式化的原始内容。

## 快速上手

最简单的使用方式，只需提供数据和 onChange 回调：

<code src="../examples/quickstart.tsx" title="快速上手"></code>

## 基础使用

完整示例，包含运行和 AI 优化功能：

<code src="../examples/basic.tsx" title="基础示例"></code>

## 预览模式

使用 `previewMode` 属性实现只读展示，隐藏所有操作按钮：

<code src="../examples/preview.tsx" title="预览模式"></code>

## 流式输出示例

展示如何实现真正的流式 AI 优化（模拟 OpenAI、通义千问等 API 的 SSE 响应）：

<code src="./examples/streaming.tsx" title="流式输出示例"></code>

## 🌍 国际化

组件支持中英文切换，CodeMirror 编辑器的搜索框等 UI 元素也会自动切换语言：

<code src="./examples/i18n-demo.tsx" title="国际化演示"></code>

### 使用方式

```tsx
import { PromptEditor, zhCN, enUS } from 'react-prompt-editor';

// 使用中文
const App = () => <PromptEditor locale={zhCN} />;

// 使用英文
const AppEn = () => <PromptEditor locale={enUS} />;
```

更多国际化详情请参考：[国际化文档](../i18n)

## API

### PromptEditor Props

| 参数              | 说明                                                           | 类型                                                                     | 默认值  |
| ----------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ | ------- |
| initialValue      | 初始树形数据（非受控模式）                                     | `TaskNode[]`                                                             | `[]`    |
| value             | 树形数据（受控模式）                                           | `TaskNode[]`                                                             | -       |
| onChange          | 数据变化回调                                                   | `(data: TaskNode[]) => void`                                             | -       |
| onRunRequest      | 运行请求回调（触发运行时调用，用户自行处理异步请求）           | `(request: RunTaskRequest) => void`                                      | -       |
| onOptimizeRequest | 优化请求回调（触发优化时调用，用户通过 onResponse 返回结果）   | `(request: OptimizeRequest, callbacks: { onResponse, onError }) => void` | -       |
| onNodeRun         | 节点运行完成回调（用户执行完运行请求后调用，通知组件更新状态） | `(nodeId: string, result: RunTaskResponse) => void`                      | -       |
| onNodeOptimize    | 节点优化完成回调（用户执行完优化请求后调用，通知组件）         | `(nodeId: string, result: OptimizeResponse) => void`                     | -       |
| onNodeLock        | 节点锁定回调                                                   | `(nodeId: string, isLocked: boolean) => void`                            | -       |
| onTreeChange      | 树变化回调                                                     | `(tree: TaskNode[]) => void`                                             | -       |
| className         | 自定义类名                                                     | `string`                                                                 | -       |
| style             | 自定义样式                                                     | `React.CSSProperties`                                                    | -       |
| renderToolbar     | 自定义顶部工具栏                                               | `(actions) => ReactNode`                                                 | -       |
| onLike            | AI 优化消息点赞回调                                            | `(messageId: string) => void`                                            | -       |
| onDislike         | AI 优化消息点踩回调                                            | `(messageId: string) => void`                                            | -       |
| previewMode       | 预览模式（只读，隐藏编辑功能）                                 | `boolean`                                                                | `false` |
| locale            | 国际化配置（类似 Ant Design 的语言包）                         | `Locale`                                                                 | `zhCN`  |

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

```typescript
interface OptimizeRequest {
  content: string; // 原始内容
  selectedText?: string; // 选中的文本（如果有）
  instruction?: string; // 优化指令
  meta?: Record<string, unknown>;
}
```

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
