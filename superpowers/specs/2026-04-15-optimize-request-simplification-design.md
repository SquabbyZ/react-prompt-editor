# Optimize Request Simplification Design

## 背景

当前 `onOptimizeRequest` 采用“请求对象 + callbacks”的高级模式：

- `onResponse(response)`
- `onError(error)`
- `done`

这套协议虽然支持流式输出，但对大多数接入方来说理解成本过高。尤其是在项目仍处于预演阶段时，用户更需要的是：

1. 像 `onRunRequest` 一样简单的调用方式
2. 不需要理解多次回调和状态拼接
3. 可以直接把 AI 返回的结果替换到当前选中内容
4. 可以完全接管 AI 优化交互，而不是仅替换弹窗内容区

## 目标

将 `onOptimizeRequest` 改为极简命令式接口，只保留一个 `request: OptimizeRequest` 参数。

同时新增一个可选配置项，用于启用“外部自定义优化流程”：

- 默认值为 `null`
- `null` 时使用内置 AI 对话 UI
- 非 `null` 时不再打开内置优化弹窗，交由用户在组件外部完成交互

## 非目标

- 不保留旧版 `callbacks` 协议
- 不兼容旧版流式多次回调语义
- 不在本轮实现中抽离全新的 AI SDK

## 最终 API 设计

### 1. `onOptimizeRequest`

从：

```ts
onOptimizeRequest?: (
  request: OptimizeRequest,
  callbacks: {
    onResponse: (response: OptimizeResponse) => void;
    onError: (error: Error) => void;
  },
) => void;
```

调整为：

```ts
onOptimizeRequest?: (request: OptimizeRequest) => void;
```

目标是让使用方式尽量接近 `onRunRequest`。

### 2. `OptimizeRequest`

保留只读信息：

- `content`
- `selectedText`
- `instruction`
- `messages`
- `signal`
- `config`
- `meta`

新增命令式方法：

- `applyOptimizedContent(content: string): void`
- `setOptimizeError(error: string | Error): void`
- `closeOptimizeDialog(): void`

#### 含义

`applyOptimizedContent`

- 由用户在获取 AI 优化结果后主动调用
- 如果当前存在选区，则替换选中的内容
- 如果没有选区，则替换整个节点内容
- 替换完成后，组件内部继续负责：
  - 关闭弹窗
  - 触发 `onNodeOptimize`
  - 触发 `onOptimizeApply`

`setOptimizeError`

- 用于展示用户自定义请求失败的错误信息
- 支持 `string` 或 `Error`

`closeOptimizeDialog`

- 允许用户主动关闭弹窗
- 不触发内容替换

### 3. 自定义优化流程配置项

新增配置项：

```ts
optimizeCustomContent?: React.ReactNode | null;
```

默认值：

```ts
null
```

行为规则：

- `null`：使用当前内置 AI 对话 UI
- 非 `null`：点击 `AI 优化` 时不再打开内置弹窗，而是直接触发 `onOptimizeRequest(request)`，由外部页面消费请求对象并渲染自定义 UI

## 设计取舍

本轮保留 `ReactNode | null` 这个配置项名称，但其语义不再是“渲染到内置弹窗里”。

原因：

1. 用户的真实目标是“整体不要内置弹窗”
2. 若仍保留弹窗壳子，只会制造错误心智
3. 当前项目处于预演阶段，优先建立正确的交互边界

代价：

- `optimizeCustomContent` 这个命名与新语义并不完全贴合
- 它更像“启用自定义优化流程”的标记，而不是单纯的渲染内容

在预演阶段先保留这个命名，后续若需要再迭代为更精确的 API 命名。

## 行为变化

### 内置模式

当 `optimizeCustomContent === null` 时：

- 弹窗继续显示现有的默认 AI 对话优化内容区
- `onOptimizeRequest` 采用新的极简请求对象
- 内置逻辑不再依赖 `callbacks.onResponse / onError`

### 自定义模式

当 `optimizeCustomContent !== null` 时：

- 点击 `AI 优化` 按钮，不再打开 `AIOptimizeModal`
- 组件直接构造 `OptimizeRequest`
- 组件直接调用 `onOptimizeRequest(request)`
- 用户在组件外部的页面、抽屉、侧栏或其他自定义区域消费这个 request
- 用户自行决定何时调用：
  - `request.applyOptimizedContent`
  - `request.setOptimizeError`
  - `request.closeOptimizeDialog`

这里的 `closeOptimizeDialog` 在自定义模式下语义调整为“结束当前优化会话”，而不再意味着关闭内置弹窗。

## 组件内部职责调整

### `Node`

负责：

- 创建带命令方法的 `OptimizeRequest`
- 保留选中区间信息
- 在 `applyOptimizedContent` 被调用时执行内容替换
- 根据 `optimizeCustomContent` 是否存在决定：
  - 打开内置优化弹窗
  - 或直接触发外部优化流程
- 继续触发：
  - `onNodeOptimize`
  - `onOptimizeApply`

### `AIOptimizeModal`

负责：

- 接收新的 `onOptimizeRequest(request)` 签名
- 接收 `optimizeCustomContent`
- 仅在默认模式下继续承载内置优化 UI
- 自定义模式下不再参与渲染

### `useOptimizeAPI` / `useOptimizeLogic`

负责：

- 移除旧的 callbacks 协议依赖
- 改为围绕命令式请求对象组织逻辑
- 错误展示统一接入 `setOptimizeError`
- 仅服务于内置弹窗模式；外部自定义流程不依赖这一套 UI 逻辑

## 类型影响

需要更新：

- `src/types/index.ts`
- `src/components/PromptEditor/index.tsx`
- `src/components/PromptEditor/Node.tsx`
- `src/components/AIOptimizeModal/AIOptimizeModal.tsx`
- `src/components/AIOptimizeModal/useOptimizeLogic.tsx`
- `src/components/AIOptimizeModal/useOptimizeAPI.ts`

同时要更新示例和文档：

- `src/App.tsx`
- `docs/components/prompt-editor.md`
- `docs/components/prompt-editor.en-US.md`
- 所有使用旧版 `onOptimizeRequest(request, callbacks)` 的 demo

## 向后兼容

本次选择直接切 `A`，不保留旧版签名兼容层。

原因：

- 项目仍处于预演阶段
- 当前是调整 API 心智的最佳时机
- 继续保留兼容层只会增加实现和文档复杂度

## 错误处理

新的错误处理方式：

- 用户请求失败时调用 `request.setOptimizeError(error)`
- 用户取消请求时依然通过 `request.signal` 自行处理中断
- 关闭弹窗时调用 `request.closeOptimizeDialog()`

## 验证方式

至少验证以下内容：

1. `onOptimizeRequest` 只接收一个参数时类型正确
2. `applyOptimizedContent` 能正确替换选中内容
3. 无选区时可正确替换整段内容
4. `setOptimizeError` 能在弹窗中展示错误
5. `optimizeCustomContent === null` 时内置 UI 正常
6. `optimizeCustomContent !== null` 时点击 `AI 优化` 不再弹出内置窗
7. 现有示例和文档已同步到新 API

## 验收标准

- `onOptimizeRequest` 的使用方式接近 `onRunRequest`
- 用户不需要理解 `callbacks`、`done`、流式拼接协议
- 用户只需在请求完成后调用 `request.applyOptimizedContent`
- 默认内置优化 UI 仍可用
- 自定义模式下不会出现任何内置优化弹窗
- 用户可在组件外部完全控制优化交互，只复用组件提供的数据和结果回填能力
