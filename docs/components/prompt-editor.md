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

## API

### PromptEditor Props

| 参数 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| initialValue | 初始树形数据（非受控模式） | `TaskNode[]` | `[]` | - |
| value | 树形数据（受控模式） | `TaskNode[]` | - | - |
| onChange | 数据变化回调 | `(data: TaskNode[]) => void` | - | - |
| runAPI | 运行 API 函数 | `(req: RunTaskRequest) => Promise<RunTaskResponse>` | - | - |
| optimizeAPI | AI 优化 API 函数 | `(req: OptimizeRequest) => Promise<OptimizeResponse>` | - | - |
| onNodeRun | 节点运行回调 | `(nodeId: string, result: RunTaskResponse) => void` | - | - |
| onNodeOptimize | 节点优化回调 | `(nodeId: string, result: OptimizeResponse) => void` | - | - |
| onNodeLock | 节点锁定回调 | `(nodeId: string, isLocked: boolean) => void` | - | - |
| onTreeChange | 树变化回调 | `(tree: TaskNode[]) => void` | - | - |
| theme | 主题 | `'default' \| 'ant-design'` | `'default'` | - |
| className | 自定义类名 | `string` | - | - |
| style | 自定义样式 | `React.CSSProperties` | - | - |

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

### 1. 安装依赖

```bash
pnpm add @uiw/react-codemirror @codemirror/lang-markdown @codemirror/theme-one-dark react-arborist
```

### 2. 特性

- ✅ **虚拟化渲染** - 基于 react-arborist，支持 2000+ 节点高性能渲染
- ✅ **拖拽排序** - 支持节点拖拽重新排序
- ✅ **层级管理** - 支持父子节点层级结构
- ✅ **懒加载编辑器** - CodeMirror 编辑器按需加载，提升性能
- ✅ **运行与锁定** - 节点运行后支持锁定，防止误编辑
- ✅ **AI 优化** - 集成 AI 优化功能，提升提示词质量

### 3. 基础使用

```tsx
import { PromptEditor } from '../../src';
import { TaskNode } from '../../src/types';

const App = () => {
  const initialValue: TaskNode[] = [
    {
      id: '1',
      title: '第一步',
      content: '# 提示词内容',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ];

  const runAPI = async (req: any) => {
    const response = await fetch('/api/run', {
      method: 'POST',
      body: JSON.stringify(req),
    });
    return response.json();
  };

  return (
    <PromptEditor
      initialValue={initialValue}
      runAPI={runAPI}
    />
  );
};
```

### 4. 受控模式

```tsx
import React, { useState } from 'react';
import { PromptEditor } from '../../src';
import { TaskNode } from '../../src/types';

const App = () => {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '第一步',
      content: '# 提示词内容',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  return (
    <PromptEditor
      value={value}
      onChange={setValue}
    />
  );
};
```
