# React Prompt Editor

[![NPM version](https://img.shields.io/npm/v/react-prompt-editor.svg?style=flat)](https://npmjs.org/package/react-prompt-editor)
[![NPM downloads](http://img.shields.io/npm/dm/react-prompt-editor.svg?style=flat)](https://npmjs.org/package/react-prompt-editor)
[![MIT License](https://img.shields.io/npm/l/react-prompt-editor.svg)](https://github.com/yourusername/react-prompt-editor/blob/main/LICENSE)

一个功能强大的树形提示词编辑器 React 组件库，支持 Markdown 编辑、AI 优化、依赖管理等特性。

## ✨ 特性

- 🌳 **树形结构管理**：支持多级嵌套节点，自由组织提示词结构
- 📝 **Markdown 编辑器**：基于 CodeMirror 6 的专业 Markdown 编辑体验
- 🤖 **AI 智能优化**：流式对话交互，支持多轮问答与内容精准替换
- 🔗 **依赖任务管理**：可视化配置节点间的依赖关系
- 🎯 **运行与锁定**：支持节点运行状态追踪与内容锁定保护
- 💫 **互斥展开**：编辑器同时只能展开一个，避免视觉混乱
- 🎨 **现代化 UI**：基于 Ant Design v5 和 TailwindCSS 的优雅设计
- 📱 **响应式设计**：完美适配桌面和移动端

## 📦 安装

```bash
npm install react-prompt-editor
# 或
yarn add react-prompt-editor
# 或
pnpm add react-prompt-editor
```

## 🚀 快速开始

```tsx
import { PromptEditor } from 'react-prompt-editor';
import 'react-prompt-editor/dist/styles/tailwind.css';

const App = () => {
  const handleTreeChange = (data) => {
    console.log('树数据变化:', data);
  };

  const handleNodeRun = async (nodeId, result) => {
    console.log('节点运行完成:', nodeId, result);
  };

  return (
    <PromptEditor
      initialValue={[
        {
          id: '1',
          title: '第一个提示词',
          content: '# 标题\n\n这是提示词内容...',
          children: [],
          isLocked: false,
          hasRun: false,
          dependencies: [],
        },
      ]}
      onChange={handleTreeChange}
      onNodeRun={handleNodeRun}
      // AI 优化 API（可选）
      optimizeAPI={async (req) => {
        // 对接真实的 AI 优化接口
        return { optimizedContent: '优化后的内容' };
      }}
      // 运行 API（可选）
      runAPI={async (req) => {
        // 对接真实的运行接口
        return { result: '运行结果' };
      }}
    />
  );
};
```

## 📖 API 文档

### PromptEditor Props

| 参数           | 说明                       | 类型                                                  | 默认值      |
| -------------- | -------------------------- | ----------------------------------------------------- | ----------- |
| initialValue   | 初始数据（非受控模式）     | `TaskNode[]`                                          | `[]`        |
| value          | 受控模式下的数据           | `TaskNode[]`                                          | -           |
| onChange       | 数据变化回调（非受控模式） | `(data: TaskNode[]) => void`                          | -           |
| runAPI         | 节点运行 API               | `(req: RunTaskRequest) => Promise<RunTaskResponse>`   | -           |
| optimizeAPI    | AI 优化 API                | `(req: OptimizeRequest) => Promise<OptimizeResponse>` | -           |
| onNodeRun      | 节点运行完成回调           | `(nodeId: string, result: RunTaskResponse) => void`   | -           |
| onNodeOptimize | 节点优化完成回调           | `(nodeId: string, result: OptimizeResponse) => void`  | -           |
| onNodeLock     | 节点锁定状态变化回调       | `(nodeId: string, isLocked: boolean) => void`         | -           |
| onTreeChange   | 树结构变化回调             | `(tree: TaskNode[]) => void`                          | -           |
| theme          | 主题                       | `'default' \| 'ant-design'`                           | `'default'` |
| className      | 自定义类名                 | `string`                                              | -           |
| style          | 自定义样式                 | `CSSProperties`                                       | -           |
| renderToolbar  | 自定义顶部工具栏           | `(actions) => ReactNode`                              | -           |

### TaskNode 数据结构

```typescript
interface TaskNode {
  id: string; // 节点唯一标识（根节点：root-uuid，子节点：uuid）
  title: string; // 节点标题
  content: string; // Markdown 内容
  parentId?: string; // 父节点 ID
  children?: TaskNode[]; // 子节点数组
  isLocked: boolean; // 是否已锁定
  hasRun: boolean; // 是否已运行
  dependencies?: string[]; // 依赖节点 ID 数组
}
```

**ID 生成策略：**
- **根节点**：`root-${uuidv4()}` - 例如 `"root-550e8400-e29b-41d4-a716-446655440000"`
- **子节点**：`${uuidv4()}` - 例如 `"6ba7b810-9dad-11d1-80b4-00c04fd430c8"`
- **优势**：使用 UUID v4 确保全局唯一性，避免时间戳冲突，支持分布式场景

### RunTaskRequest / Response

```typescript
interface RunTaskRequest {
  nodeId: string;
  content: string;
  dependenciesContent: Array<{
    nodeId: string;
    title: string;
    content: string;
    hasRun: boolean;
  }>;
  stream?: boolean;
  meta?: Record<string, unknown>;
}

interface RunTaskResponse {
  result: string;
  stream?: boolean;
  meta?: Record<string, unknown>;
}
```

### OptimizeRequest / Response

```typescript
interface OptimizeRequest {
  content: string; // 原始内容
  selectedText?: string; // 选中的文本（如果有）
  instruction?: string; // 优化指令
  meta?: Record<string, unknown>;
}

interface OptimizeResponse {
  optimizedContent: string; // 优化后的内容
  thinkingProcess?: string; // 思考过程
  meta?: Record<string, unknown>;
}
```

## 🎯 核心功能

### 1. 树形节点管理

- **添加根节点**：点击顶部工具栏的"+ 一级标题"按钮
- **添加子节点**：点击节点的"+ 子标题"按钮
- **删除节点**：点击删除按钮（已锁定节点不可删除）
- **展开/折叠**：点击三角图标控制子节点显示
- **标题编辑**：双击标题进入编辑模式，支持自动同步到 Markdown 内容

### 2. Markdown 编辑器

- 基于 CodeMirror 6 的专业编辑体验
- 支持 Markdown 语法高亮
- 编辑器互斥展开（同时只能编辑一个节点）
- 支持选中文本进行 AI 优化

### 3. AI 智能优化

点击"AI 优化"按钮打开优化弹窗：

- **选中优化**：选中部分文本，只优化选中内容
- **全部优化**：不选中文本，默认优化整个节点内容
- **流式对话**：支持打字机效果，实时查看优化过程
- **多轮问答**：可以针对优化结果继续对话调整
- **精准替换**：优化完成后精确替换原内容
- **操作按钮**：支持复制、重新生成、点赞/踩等交互

### 4. 依赖任务管理

在编辑器底部配置依赖关系：

- 只能选择**已运行且已锁定**的节点
- 只能选择**序号靠前**的节点（防止循环依赖）
- 支持树形选择器，清晰展示层级关系
- 已选依赖以标签形式展示，可快速删除

### 5. 运行与锁定

- **运行**：点击"运行"按钮执行节点任务
- **锁定**：运行后才能锁定，防止误修改
- **解锁**：解锁后可重新编辑
- **状态标识**：未运行节点显示"未运行"标签

## 💡 使用示例

### 基础用法

```tsx
import { PromptEditor } from 'react-prompt-editor';

const BasicExample = () => {
  return <PromptEditor initialValue={[]} />;
};
```

### 受控模式

```tsx
import { useState } from 'react';
import { PromptEditor } from 'react-prompt-editor';

const ControlledExample = () => {
  const [data, setData] = useState([]);

  return <PromptEditor value={data} onChange={setData} />;
};
```

### 集成 AI 优化

```tsx
import { PromptEditor } from 'react-prompt-editor';

const AIExample = () => {
  const optimizeAPI = async (req) => {
    // 调用真实的 AI 优化接口
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    return response.json();
  };

  return <PromptEditor optimizeAPI={optimizeAPI} />;
};
```

### 自定义工具栏

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { Button } from 'antd';

const CustomToolbar = () => {
  return (
    <PromptEditor
      renderToolbar={(actions) => (
        <div>
          <Button onClick={actions.addRootNode}>添加新标题</Button>
          {/* 添加自定义按钮 */}
          <Button onClick={() => console.log('自定义操作')}>自定义操作</Button>
        </div>
      )}
    />
  );
};
```

## 🛠️ 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm start

# 构建组件库
pnpm run build

# 监听模式构建
pnpm run build:watch

# 构建文档
pnpm run docs:build

# 预览文档
pnpm run docs:preview

# 代码检查
pnpm run lint
```

## 📝 更新日志

### v0.0.1 (2026-04-07)

- ✨ 初始版本发布
- 🌳 树形节点管理
- 📝 Markdown 编辑器集成
- 🤖 AI 智能优化功能
- 🔗 依赖任务管理
- 🎯 运行与锁定机制
- 💫 互斥展开交互

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT
