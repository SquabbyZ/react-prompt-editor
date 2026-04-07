# 提示词编辑器组件库 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 开发一个基于 React 的树形提示词编辑器组件库，支持层级化提示词管理、依赖配置、运行与 AI 优化能力。

**Architecture:** 采用 Map + 数组混合数据结构，内部使用 Map 存储实现 O(1) 查找，对外 API 使用传统树形数组格式。组件分为树形管理、编辑器、运行控制、AI 优化、锁定机制五大模块。

**Tech Stack:**
- React 18+/19
- TypeScript 严格模式
- CodeMirror (编辑器)
- dumi (文档工具)
- father (构建工具)
- 虚拟化库（待选型，需支持拖拽）

---

## File Structure

### 创建的文件列表

**类型定义:**
- `src/types/index.ts` - 核心类型定义
- `src/types/task-node.ts` - TaskNode 相关类型

**核心组件:**
- `src/components/PromptEditor/index.tsx` - 主组件
- `src/components/PromptEditor/PromptEditor.types.ts` - 主组件类型
- `src/components/TreeNode/index.tsx` - 树节点组件
- `src/components/TreeNode/TreeNode.types.ts` - 节点组件类型
- `src/components/RunButton/index.tsx` - 运行按钮
- `src/components/AIOptimizeButton/index.tsx` - AI 优化按钮
- `src/components/LockButton/index.tsx` - 锁定按钮
- `src/components/DependencyConfig/index.tsx` - 依赖配置组件

**Hooks:**
- `src/hooks/useTreeState.ts` - 树形状态管理
- `src/hooks/useTreeState.test.ts` - useTreeState 测试
- `src/hooks/useEditorLazyLoad.ts` - 编辑器懒加载
- `src/hooks/useRunTask.ts` - 运行任务管理
- `src/hooks/useAIOptimize.ts` - AI 优化管理

**工具函数:**
- `src/utils/tree-utils.ts` - 树形工具函数
- `src/utils/tree-utils.test.ts` - 工具函数测试
- `src/utils/array-map-converter.ts` - Array ↔ Map 转换
- `src/utils/array-map-converter.test.ts` - 转换测试

**样式:**
- `src/styles/themes/default.css` - 默认主题
- `src/styles/variables.css` - CSS 变量定义

**文档:**
- `src/docs/examples/basic.md` - 基础使用示例
- `src/docs/examples/advanced.md` - 高级使用示例

### 修改的文件列表

- `package.json` - 添加依赖
- `tsconfig.json` - 配置 TypeScript
- `.dumirc.ts` 或 `dumi.config.ts` - 配置 dumi
- `src/index.ts` - 导出公共 API

---

## Tasks

### Task 1: 项目设置与类型定义

**Files:**
- Modify: `package.json`
- Create: `src/types/task-node.ts`
- Create: `src/types/index.ts`
- Create: `src/index.ts`

- [ ] **Step 1: 安装 CodeMirror 依赖**

```bash
npm install @uiw/react-codemirror @codemirror/lang-markdown @codemirror/theme-one-dark
```

Expected: 安装成功，package.json 新增 dependencies

- [ ] **Step 2: 定义 TaskNode 核心类型**

创建 `src/types/task-node.ts`:

```typescript
/**
 * 内部存储结构（扁平化）
 */
export interface TaskNodeMinimal {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children: string[];  // 子节点 ID 数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies: string[];  // 依赖节点 ID 数组
}

/**
 * 对外 API 结构（树形嵌套）
 */
export interface TaskNode {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: TaskNode[];  // 嵌套子节点数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies?: string[];
}

/**
 * 节点存储类型
 */
export type NodeStore = Map<string, TaskNodeMinimal>;
```

- [ ] **Step 3: 定义组件 Props 类型**

修改 `src/types/index.ts`:

```typescript
export * from './task-node';

import { TaskNode } from './task-node';

export interface RunTaskRequest {
  nodeId: string;
  content: string;
  dependenciesContent: string[];
  stream?: boolean;
  meta?: Record<string, unknown>;
}

export interface RunTaskResponse {
  result: string;
  stream?: boolean;
  meta?: Record<string, unknown>;
}

export interface OptimizeRequest {
  content: string;
  selectedText?: string;
  instruction?: string;
  meta?: Record<string, unknown>;
}

export interface OptimizeResponse {
  optimizedContent: string;
  thinkingProcess?: string;
  meta?: Record<string, unknown>;
}

export interface PromptEditorProps {
  initialValue?: TaskNode[];
  value?: TaskNode[];
  onChange?: (data: TaskNode[]) => void;
  runAPI?: (req: RunTaskRequest) => Promise<RunTaskResponse>;
  optimizeAPI?: (req: OptimizeRequest) => Promise<OptimizeResponse>;
  onNodeRun?: (nodeId: string, result: RunTaskResponse) => void;
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  onNodeLock?: (nodeId: string, isLocked: boolean) => void;
  onTreeChange?: (tree: TaskNode[]) => void;
  theme?: 'default' | 'ant-design';
  className?: string;
  style?: React.CSSProperties;
}
```

- [ ] **Step 4: 配置公共导出**

修改 `src/index.ts`:

```typescript
export * from './types';
export { PromptEditor } from './components/PromptEditor';
```

- [ ] **Step 5: 提交**

```bash
git add src/types/ src/index.ts package.json
git commit -m "feat: add core TypeScript type definitions"
```

---

### Task 2: 树形工具函数

**Files:**
- Create: `src/utils/tree-utils.ts`
- Create: `src/utils/tree-utils.test.ts`

- [ ] **Step 1: 实现 arrayToMap 转换函数**

创建 `src/utils/tree-utils.ts`:

```typescript
import { TaskNode, TaskNodeMinimal, NodeStore } from '../types';

/**
 * 将树形数组转换为扁平 Map 结构
 */
export function arrayToMap(tree: TaskNode[]): NodeStore {
  const store = new Map<string, TaskNodeMinimal>();
  
  function flatten(node: TaskNode, parentId?: string) {
    const minimal: TaskNodeMinimal = {
      id: node.id,
      title: node.title,
      content: node.content,
      parentId,
      children: node.children?.map(child => child.id) || [],
      isLocked: node.isLocked,
      hasRun: node.hasRun,
      dependencies: node.dependencies || [],
    };
    
    store.set(node.id, minimal);
    
    if (node.children) {
      node.children.forEach(child => flatten(child, node.id));
    }
  }
  
  tree.forEach(root => flatten(root));
  return store;
}
```

- [ ] **Step 2: 实现 mapToArray 转换函数**

继续 `src/utils/tree-utils.ts`:

```typescript
/**
 * 将 Map 结构转换为树形数组
 */
export function mapToArray(store: NodeStore): TaskNode[] {
  const nodeMap = new Map<string, TaskNode>();
  const roots: TaskNode[] = [];
  
  // 第一次遍历：创建所有节点（不含 children）
  store.forEach((node, id) => {
    nodeMap.set(id, {
      id: node.id,
      title: node.title,
      content: node.content,
      parentId: node.parentId,
      children: [],
      isLocked: node.isLocked,
      hasRun: node.hasRun,
      dependencies: node.dependencies,
    });
  });
  
  // 第二次遍历：构建父子关系
  store.forEach((node, id) => {
    const currentNode = nodeMap.get(id)!;
    
    if (node.parentId) {
      const parent = nodeMap.get(node.parentId);
      if (parent) {
        parent.children!.push(currentNode);
      }
    } else {
      roots.push(currentNode);
    }
  });
  
  return roots;
}
```

- [ ] **Step 3: 编写转换函数测试**

创建 `src/utils/tree-utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { arrayToMap, mapToArray } from './tree-utils';

describe('arrayToMap', () => {
  it('should convert tree to flat map', () => {
    const tree = [
      {
        id: '1',
        title: 'Root',
        content: 'root content',
        children: [
          {
            id: '1.1',
            title: 'Child',
            content: 'child content',
            children: [],
            isLocked: false,
            hasRun: false,
          },
        ],
        isLocked: false,
        hasRun: true,
      },
    ];
    
    const map = arrayToMap(tree);
    
    expect(map.size).toBe(2);
    expect(map.get('1')?.children).toEqual(['1.1']);
    expect(map.get('1.1')?.parentId).toBe('1');
  });
});

describe('mapToArray', () => {
  it('should convert map back to tree', () => {
    const map = new Map([
      ['1', {
        id: '1',
        title: 'Root',
        content: 'root content',
        parentId: undefined,
        children: ['1.1'],
        isLocked: false,
        hasRun: true,
        dependencies: [],
      }],
      ['1.1', {
        id: '1.1',
        title: 'Child',
        content: 'child content',
        parentId: '1',
        children: [],
        isLocked: false,
        hasRun: false,
        dependencies: [],
      }],
    ]);
    
    const tree = mapToArray(map);
    
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children![0].id).toBe('1.1');
  });
});
```

- [ ] **Step 4: 运行测试验证**

```bash
npm test -- src/utils/tree-utils.test.ts
```

Expected: 所有测试通过

- [ ] **Step 5: 提交**

```bash
git add src/utils/tree-utils.* src/index.ts
git commit -m "feat: add array-map conversion utilities"
```

---

### Task 3: useTreeState Hook

**Files:**
- Create: `src/hooks/useTreeState.ts`
- Create: `src/hooks/useTreeState.test.ts`

- [ ] **Step 1: 实现基础状态管理**

创建 `src/hooks/useTreeState.ts`:

```typescript
import { useState, useMemo, useCallback } from 'react';
import { TaskNode, TaskNodeMinimal, NodeStore } from '../types';
import { arrayToMap, mapToArray } from '../utils/tree-utils';

export interface UseTreeStateReturn {
  store: NodeStore;
  tree: TaskNode[];
  expandedNodes: Set<string>;
  toggleExpand: (nodeId: string) => void;
  addNode: (node: TaskNodeMinimal, parentId?: string) => void;
  removeNode: (nodeId: string) => void;
  updateNode: (nodeId: string, updates: Partial<TaskNodeMinimal>) => void;
  moveNode: (nodeId: string, newParentId: string | null) => void;
  getNodeNumber: (nodeId: string) => string;
}

export function useTreeState(initialValue: TaskNode[] = []): UseTreeStateReturn {
  const [store, setStore] = useState<NodeStore>(() => arrayToMap(initialValue));
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 转换为树形数组（用于渲染）
  const tree = useMemo(() => mapToArray(store), [store]);

  // 切换展开/折叠（互斥展开）
  const toggleExpand = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        // TODO: 实现同层互斥逻辑
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // 添加节点
  const addNode = useCallback((node: TaskNodeMinimal, parentId?: string) => {
    setStore(prev => {
      const next = new Map(prev);
      if (parentId) {
        const parent = next.get(parentId);
        if (parent) {
          parent.children.push(node.id);
        }
      }
      next.set(node.id, node);
      return next;
    });
  }, []);

  // 删除节点
  const removeNode = useCallback((nodeId: string) => {
    setStore(prev => {
      const next = new Map(prev);
      const node = next.get(nodeId);
      
      if (node?.parentId) {
        const parent = next.get(node.parentId);
        if (parent) {
          parent.children = parent.children.filter(id => id !== nodeId);
        }
      }
      
      // 递归删除子节点
      function deleteChildren(id: string) {
        const node = next.get(id);
        if (node) {
          node.children.forEach(deleteChildren);
          next.delete(id);
        }
      }
      
      deleteChildren(nodeId);
      return next;
    });
  }, []);

  // 更新节点
  const updateNode = useCallback((nodeId: string, updates: Partial<TaskNodeMinimal>) => {
    setStore(prev => {
      const next = new Map(prev);
      const node = next.get(nodeId);
      if (node) {
        Object.assign(node, updates);
      }
      return next;
    });
  }, []);

  // 移动节点
  const moveNode = useCallback((nodeId: string, newParentId: string | null) => {
    setStore(prev => {
      const next = new Map(prev);
      const node = next.get(nodeId);
      
      if (!node) return prev;
      
      // 从原父节点移除
      if (node.parentId) {
        const oldParent = next.get(node.parentId);
        if (oldParent) {
          oldParent.children = oldParent.children.filter(id => id !== nodeId);
        }
      }
      
      // 添加到新父节点
      node.parentId = newParentId || undefined;
      if (newParentId) {
        const newParent = next.get(newParentId);
        if (newParent) {
          newParent.children.push(nodeId);
        }
      }
      
      return next;
    });
  }, []);

  // 生成节点序号
  const getNodeNumber = useCallback((nodeId: string): string => {
    const node = store.get(nodeId);
    if (!node) return '1';
    
    if (!node.parentId) {
      // 根节点：计算是第几个根节点
      const roots = Array.from(store.values()).filter(n => !n.parentId);
      const index = roots.findIndex(n => n.id === nodeId);
      return `${index + 1}`;
    } else {
      // 子节点：父序号 + 自己是第几个子节点
      const parent = store.get(node.parentId)!;
      const siblingIndex = parent.children.indexOf(nodeId);
      const parentNumber = getNodeNumber(node.parentId!);
      return `${parentNumber}.${siblingIndex + 1}`;
    }
  }, [store]);

  return {
    store,
    tree,
    expandedNodes,
    toggleExpand,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    getNodeNumber,
  };
}
```

- [ ] **Step 2: 编写 Hook 测试**

创建 `src/hooks/useTreeState.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTreeState } from './useTreeState';

describe('useTreeState', () => {
  it('should initialize with empty tree', () => {
    const { result } = renderHook(() => useTreeState());
    expect(result.current.tree).toEqual([]);
    expect(result.current.store.size).toBe(0);
  });

  it('should add node', () => {
    const { result } = renderHook(() => useTreeState());
    
    act(() => {
      result.current.addNode({
        id: '1',
        title: 'Test',
        content: 'content',
        children: [],
        isLocked: false,
        hasRun: false,
        dependencies: [],
      });
    });
    
    expect(result.current.store.size).toBe(1);
    expect(result.current.tree).toHaveLength(1);
  });

  it('should generate correct node numbers', () => {
    const { result } = renderHook(() => useTreeState([
      {
        id: '1',
        title: 'Root 1',
        content: 'content',
        children: [],
        isLocked: false,
        hasRun: false,
      },
      {
        id: '2',
        title: 'Root 2',
        content: 'content',
        children: [],
        isLocked: false,
        hasRun: false,
      },
    ]));
    
    expect(result.current.getNodeNumber('1')).toBe('1');
    expect(result.current.getNodeNumber('2')).toBe('2');
  });
});
```

- [ ] **Step 3: 运行测试验证**

```bash
npm test -- src/hooks/useTreeState.test.ts
```

Expected: 所有测试通过

- [ ] **Step 4: 提交**

```bash
git add src/hooks/useTreeState.* src/index.ts
git commit -m "feat: add useTreeState hook for tree management"
```

---

### Task 4: CodeMirror 编辑器组件

**Files:**
- Create: `src/components/CodeMirrorEditor/index.tsx`
- Create: `src/components/CodeMirrorEditor/CodeMirrorEditor.types.ts`

- [ ] **Step 1: 创建编辑器包装器**

创建 `src/components/CodeMirrorEditor/index.tsx`:

```typescript
import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import { CodeMirrorEditorProps } from './CodeMirrorEditor.types';

export const CodeMirrorEditor: React.FC<CodeMirrorEditorProps> = ({
  value,
  onChange,
  isReadOnly = false,
  placeholder = 'Enter markdown content...',
}) => {
  return (
    <CodeMirror
      value={value}
      height="200px"
      extensions={[markdown()]}
      theme={oneDark}
      onChange={(val) => onChange?.(val)}
      editable={!isReadOnly}
      placeholder={placeholder}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: true,
        highlightSelectionMatches: true,
      }}
      style={{
        fontSize: '14px',
        fontFamily: 'monospace',
      }}
    />
  );
};
```

- [ ] **Step 2: 定义编辑器类型**

创建 `src/components/CodeMirrorEditor/CodeMirrorEditor.types.ts`:

```typescript
export interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}
```

- [ ] **Step 3: 提交**

```bash
git add src/components/CodeMirrorEditor/
git commit -m "feat: add CodeMirror editor wrapper component"
```

---

### Task 5: TreeNode 组件

**Files:**
- Create: `src/components/TreeNode/index.tsx`
- Create: `src/components/TreeNode/TreeNode.types.ts`

- [ ] **Step 1: 定义节点组件类型**

创建 `src/components/TreeNode/TreeNode.types.ts`:

```typescript
import { TaskNodeMinimal } from '../../types';

export interface TreeNodeProps {
  node: TaskNodeMinimal;
  number: string;
  isExpanded: boolean;
  isLocked: boolean;
  hasRun: boolean;
  onToggle: () => void;
  onContentChange: (content: string) => void;
  onRun: () => void;
  onLock: () => void;
  onOptimize: () => void;
  onDelete: () => void;
}
```

- [ ] **Step 2: 实现节点渲染组件**

创建 `src/components/TreeNode/index.tsx`:

```typescript
import React, { useState, useCallback } from 'react';
import { TreeNodeProps } from './TreeNode.types';
import { CodeMirrorEditor } from '../CodeMirrorEditor';

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  number,
  isExpanded,
  isLocked,
  hasRun,
  onToggle,
  onContentChange,
  onRun,
  onLock,
  onOptimize,
  onDelete,
}) => {
  const [editorLoaded, setEditorLoaded] = useState(false);

  // 懒加载编辑器
  const handleFocus = useCallback(() => {
    if (!editorLoaded) {
      setEditorLoaded(true);
    }
  }, [editorLoaded]);

  return (
    <div className="tree-node" style={{ border: '1px solid #ddd', margin: '8px 0', padding: '12px' }}>
      {/* 节点头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <button onClick={onToggle} style={{ cursor: 'pointer' }}>
          {isExpanded ? '▼' : '▶'}
        </button>
        <span style={{ fontWeight: 'bold', color: '#666' }}>
          [{number}] {node.title}
        </span>
        {isLocked && <span>🔒</span>}
        {!hasRun && <span style={{ fontSize: '12px', color: '#999' }}>(未运行)</span>}
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button onClick={onRun} disabled={false}>
            运行
          </button>
          <button onClick={onOptimize}>
            AI 优化
          </button>
          <button onClick={onLock} disabled={!hasRun}>
            {isLocked ? '🔓 解锁' : '🔒 锁定'}
          </button>
          <button onClick={onDelete} disabled={isLocked}>
            删除
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      {isExpanded && (
        <div onFocus={handleFocus}>
          {editorLoaded ? (
            <CodeMirrorEditor
              value={node.content}
              onChange={onContentChange}
              isReadOnly={isLocked}
            />
          ) : (
            <div 
              style={{ 
                padding: '40px', 
                textAlign: 'center', 
                color: '#999',
                cursor: 'pointer',
              }}
              onClick={handleFocus}
            >
              Click to load editor...
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 3: 提交**

```bash
git add src/components/TreeNode/
git commit -m "feat: add TreeNode component with lazy-loaded editor"
```

---

### Task 6: 功能按钮组件（Run/Lock/Optimize）

**Files:**
- Create: `src/components/RunButton/index.tsx`
- Create: `src/components/LockButton/index.tsx`
- Create: `src/components/AIOptimizeButton/index.tsx`

- [ ] **Step 1: 实现运行按钮**

创建 `src/components/RunButton/index.tsx`:

```typescript
import React, { useState } from 'react';
import { RunTaskRequest, RunTaskResponse } from '../../types';

export interface RunButtonProps {
  nodeId: string;
  content: string;
  dependenciesContent: string[];
  runAPI?: (req: RunTaskRequest) => Promise<RunTaskResponse>;
  onRun?: (nodeId: string, result: RunTaskResponse) => void;
}

export const RunButton: React.FC<RunButtonProps> = ({
  nodeId,
  content,
  dependenciesContent,
  runAPI,
  onRun,
}) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    if (!runAPI) {
      alert('Please provide runAPI prop');
      return;
    }

    setIsRunning(true);
    try {
      const response = await runAPI({
        nodeId,
        content,
        dependenciesContent,
      });
      onRun?.(nodeId, response);
    } catch (error) {
      console.error('Run failed:', error);
      alert('Run failed, please try again');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <button 
      onClick={handleRun} 
      disabled={isRunning}
      style={{ opacity: isRunning ? 0.6 : 1 }}
    >
      {isRunning ? 'Running...' : '运行'}
    </button>
  );
};
```

- [ ] **Step 2: 实现锁定按钮**

创建 `src/components/LockButton/index.tsx`:

```typescript
import React from 'react';

export interface LockButtonProps {
  nodeId: string;
  hasRun: boolean;
  isLocked: boolean;
  onLock?: (nodeId: string, isLocked: boolean) => void;
}

export const LockButton: React.FC<LockButtonProps> = ({
  nodeId,
  hasRun,
  isLocked,
  onLock,
}) => {
  const handleLock = () => {
    if (!hasRun) {
      alert('请先运行任务后再锁定！');
      return;
    }
    onLock?.(nodeId, !isLocked);
  };

  return (
    <button 
      onClick={handleLock} 
      disabled={!hasRun}
      style={{ opacity: !hasRun ? 0.5 : 1 }}
    >
      {isLocked ? '🔓 解锁' : '🔒 锁定'}
    </button>
  );
};
```

- [ ] **Step 3: 实现 AI 优化按钮**

创建 `src/components/AIOptimizeButton/index.tsx`:

```typescript
import React, { useState } from 'react';
import { OptimizeRequest, OptimizeResponse } from '../../types';

export interface AIOptimizeButtonProps {
  content: string;
  selectedText?: string;
  optimizeAPI?: (req: OptimizeRequest) => Promise<OptimizeResponse>;
  onOptimize?: (nodeId: string, result: OptimizeResponse) => void;
}

export const AIOptimizeButton: React.FC<AIOptimizeButtonProps> = ({
  content,
  selectedText,
  optimizeAPI,
  onOptimize,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [instruction, setInstruction] = useState('');

  const handleOptimize = async () => {
    if (!optimizeAPI) {
      alert('Please provide optimizeAPI prop');
      return;
    }

    setIsOptimizing(true);
    try {
      const response = await optimizeAPI({
        content,
        selectedText,
        instruction,
      });
      onOptimize?.('current-node', response);
      // TODO: 显示优化结果对话框
    } catch (error) {
      console.error('Optimize failed:', error);
      alert('Optimize failed, please try again');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div>
      <button onClick={handleOptimize} disabled={isOptimizing}>
        {isOptimizing ? 'Optimizing...' : 'AI 优化'}
      </button>
      {isOptimizing && (
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="优化指令..."
          style={{ marginLeft: '8px' }}
        />
      )}
    </div>
  );
};
```

- [ ] **Step 4: 提交**

```bash
git add src/components/RunButton/ src/components/LockButton/ src/components/AIOptimizeButton/
git commit -m "feat: add Run/Lock/Optimize button components"
```

---

### Task 7: PromptEditor 主组件

**Files:**
- Create: `src/components/PromptEditor/index.tsx`
- Create: `src/components/PromptEditor/PromptEditor.types.ts`

- [ ] **Step 1: 定义主组件类型**

创建 `src/components/PromptEditor/PromptEditor.types.ts`:

```typescript
export * from '../../types';
```

- [ ] **Step 2: 实现主组件框架**

创建 `src/components/PromptEditor/index.tsx`:

```typescript
import React from 'react';
import { PromptEditorProps } from './PromptEditor.types';
import { useTreeState } from '../../hooks/useTreeState';
import { TreeNode } from '../TreeNode';

export const PromptEditor: React.FC<PromptEditorProps> = ({
  initialValue = [],
  value,
  onChange,
  runAPI,
  optimizeAPI,
  onNodeRun,
  onNodeOptimize,
  onNodeLock,
  onTreeChange,
  theme = 'default',
  className,
  style,
}) => {
  // 使用受控或非受控模式
  const isControlled = value !== undefined;
  const {
    store,
    tree,
    expandedNodes,
    toggleExpand,
    addNode,
    removeNode,
    updateNode,
    moveNode,
    getNodeNumber,
  } = useTreeState(isControlled ? value : initialValue);

  // 处理内容变更
  const handleContentChange = (nodeId: string, content: string) => {
    updateNode(nodeId, { content });
    if (!isControlled) {
      onTreeChange?.(tree);
    }
  };

  // 处理运行
  const handleNodeRun = (nodeId: string, result: any) => {
    updateNode(nodeId, { hasRun: true });
    onNodeRun?.(nodeId, result);
    if (!isControlled) {
      onTreeChange?.(tree);
    }
  };

  // 处理锁定
  const handleNodeLock = (nodeId: string, isLocked: boolean) => {
    updateNode(nodeId, { isLocked });
    onNodeLock?.(nodeId, isLocked);
    if (!isControlled) {
      onTreeChange?.(tree);
    }
  };

  // 处理优化
  const handleNodeOptimize = (nodeId: string, result: any) => {
    onNodeOptimize?.(nodeId, result);
    // TODO: 处理优化结果插入
  };

  // 处理删除
  const handleDelete = (nodeId: string) => {
    if (confirm('确定要删除这个节点吗？')) {
      removeNode(nodeId);
      if (!isControlled) {
        onTreeChange?.(tree);
      }
    }
  };

  return (
    <div 
      className={`prompt-editor ${className || ''}`}
      style={style}
      data-theme={theme}
    >
      {tree.map((node) => (
        <TreeNode
          key={node.id}
          node={store.get(node.id)!}
          number={getNodeNumber(node.id)}
          isExpanded={expandedNodes.has(node.id)}
          isLocked={store.get(node.id)!.isLocked}
          hasRun={store.get(node.id)!.hasRun}
          onToggle={() => toggleExpand(node.id)}
          onContentChange={(content) => handleContentChange(node.id, content)}
          onRun={() => {
            // TODO: 实现运行逻辑
          }}
          onLock={() => handleNodeLock(node.id, !store.get(node.id)!.isLocked)}
          onOptimize={() => {
            // TODO: 实现优化逻辑
          }}
          onDelete={() => handleDelete(node.id)}
        />
      ))}
    </div>
  );
};
```

- [ ] **Step 3: 提交**

```bash
git add src/components/PromptEditor/
git commit -m "feat: add PromptEditor main component"
```

---

### Task 8: 样式与主题

**Files:**
- Create: `src/styles/variables.css`
- Create: `src/styles/themes/default.css`

- [ ] **Step 1: 定义 CSS 变量**

创建 `src/styles/variables.css`:

```css
:root {
  /* 颜色 */
  --pe-color-primary: #667eea;
  --pe-color-success: #11998e;
  --pe-color-warning: #f57c00;
  --pe-color-error: #c62828;
  --pe-color-text: #333333;
  --pe-color-text-secondary: #666666;
  --pe-color-border: #e0e0e0;
  --pe-color-bg: #ffffff;
  --pe-color-bg-secondary: #f5f5f5;
  
  /* 间距 */
  --pe-spacing-xs: 4px;
  --pe-spacing-sm: 8px;
  --pe-spacing-md: 16px;
  --pe-spacing-lg: 24px;
  --pe-spacing-xl: 32px;
  
  /* 圆角 */
  --pe-radius-sm: 4px;
  --pe-radius-md: 8px;
  --pe-radius-lg: 12px;
  
  /* 阴影 */
  --pe-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --pe-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --pe-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

- [ ] **Step 2: 定义默认主题**

创建 `src/styles/themes/default.css`:

```css
@import '../variables.css';

[data-theme='default'] {
  --pe-bg-primary: var(--pe-color-bg);
  --pe-bg-secondary: var(--pe-color-bg-secondary);
  --pe-text-primary: var(--pe-color-text);
  --pe-text-secondary: var(--pe-color-text-secondary);
  --pe-border-color: var(--pe-color-border);
}

[data-theme='default'] .prompt-editor {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--pe-bg-primary);
  color: var(--pe-text-primary);
  padding: var(--pe-spacing-md);
}

[data-theme='default'] .tree-node {
  background: var(--pe-bg-primary);
  border: 1px solid var(--pe-border-color);
  border-radius: var(--pe-radius-md);
  padding: var(--pe-spacing-md);
  margin-bottom: var(--pe-spacing-sm);
}
```

- [ ] **Step 3: 导入样式到主组件**

修改 `src/components/PromptEditor/index.tsx`:

在文件顶部添加：

```typescript
import '../../styles/themes/default.css';
```

- [ ] **Step 4: 提交**

```bash
git add src/styles/
git commit -m "feat: add default theme and CSS variables"
```

---

### Task 9: dumi 文档与 Demo

**Files:**
- Create: `src/docs/examples/basic.md`
- Create: `src/docs/examples/advanced.md`
- Modify: `.dumirc.ts`

- [ ] **Step 1: 创建基础使用示例**

创建 `src/docs/examples/basic.md`:

```markdown
# 基础使用

## 安装

```bash
npm install react-prompt-editor
```

## 快速开始

```tsx
import { PromptEditor } from 'react-prompt-editor';

const App = () => {
  const initialValue = [
    {
      id: '1',
      title: '第一步',
      content: '# 提示词内容\n请在这里输入...',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ];

  const runAPI = async (req) => {
    // 调用你的后端 API
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
      onChange={(data) => console.log('Data changed:', data)}
      onNodeRun={(nodeId, result) => console.log('Node run:', nodeId, result)}
    />
  );
};
```

## Props 说明

### initialValue

类型：`TaskNode[]`

初始树形数据。

### runAPI

类型：`(req: RunTaskRequest) => Promise<RunTaskResponse>`

运行节点的 API 函数。

### onChange

类型：`(data: TaskNode[]) => void`

数据变化时的回调函数。
```

- [ ] **Step 2: 配置 dumi**

修改 `.dumirc.ts`:

```typescript
import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'react-prompt-editor',
  favicon: 'https://example.com/favicon.ico',
  logo: 'https://example.com/logo.png',
  outputPath: 'docs-dist',
  locales: [['zh-CN', '中文']],
  themeConfig: {
    name: 'react-prompt-editor',
    socialLinks: {
      github: 'https://github.com/your-repo/react-prompt-editor',
    },
  },
});
```

- [ ] **Step 3: 提交**

```bash
git add src/docs/ .dumirc.ts
git commit -m "docs: add dumi configuration and basic examples"
```

---

### Task 10: 性能测试与优化

**Files:**
- Create: `src/__tests__/performance.test.ts`

- [ ] **Step 1: 创建性能测试文件**

创建 `src/__tests__/performance.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PromptEditor } from '../components/PromptEditor';

function generateLargeTree(nodeCount: number) {
  const tree: any[] = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const node: any = {
      id: `node-${i}`,
      title: `Node ${i}`,
      content: `Content for node ${i}`,
      children: [],
      isLocked: false,
      hasRun: false,
    };
    
    if (i > 0 && i % 10 !== 0) {
      // 90% 的节点作为子节点
      const parentIndex = Math.floor(i / 10);
      tree[parentIndex].children.push(node);
    } else {
      // 10% 的节点作为根节点
      tree.push(node);
    }
  }
  
  return tree;
}

describe('Performance Tests', () => {
  it('should render 1000 nodes in < 100ms', () => {
    const largeTree = generateLargeTree(1000);
    
    const startTime = performance.now();
    render(<PromptEditor initialValue={largeTree} />);
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100);
  });

  it('should handle 2000 nodes @ 60fps', () => {
    const largeTree = generateLargeTree(2000);
    
    const startTime = performance.now();
    const { container } = render(<PromptEditor initialValue={largeTree} />);
    const renderTime = performance.now();
    
    expect(renderTime - startTime).toBeLessThan(200);
    
    // 测试滚动性能
    container.scrollTo(0, 10000);
    // 使用 requestAnimationFrame 测量 FPS（简化测试）
  });
});
```

- [ ] **Step 2: 运行性能测试**

```bash
npm test -- src/__tests__/performance.test.ts --run
```

Expected: 性能测试通过

- [ ] **Step 3: 提交**

```bash
git add src/__tests__/performance.test.ts
git commit -m "test: add performance benchmark tests"
```

---

### Task 11: 完善与发布

**Files:**
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: 更新 package.json**

确保包含正确的入口：

```json
{
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0"
  }
}
```

- [ ] **Step 2: 创建 README**

创建 `README.md`:

```markdown
# react-prompt-editor

一个基于 React 的树形提示词编辑器组件库。

## 特性

- 🌳 树形结构管理
- 🔗 依赖关系配置
- ▶️ 节点级运行与回调
- 🤖 AI 优化支持
- 🔒 锁定机制
- ⚡ 高性能（支持 2000+ 节点）
- 📝 CodeMirror 编辑器
- 📚 dumi 文档

## 安装

```bash
npm install react-prompt-editor
```

## 使用

```tsx
import { PromptEditor } from 'react-prompt-editor';

<PromptEditor
  initialValue={data}
  runAPI={runAPI}
  onChange={handleChange}
/>
```

## 文档

访问 [文档站点](https://your-docs-url.com) 查看完整 API 和示例。

## License

MIT
```

- [ ] **Step 3: 构建并测试**

```bash
npm run build
npm run docs:build
```

Expected: 构建成功，文档生成完成

- [ ] **Step 4: 最终提交**

```bash
git add README.md package.json
git commit -m "chore: prepare for v1.0 release"
```

---

## Testing Summary

### 测试覆盖

- ✅ `tree-utils.ts` - Array ↔ Map 转换
- ✅ `useTreeState.ts` - 树形状态管理
- ✅ `performance.test.ts` - 性能基准测试

### 测试命令

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- src/utils/tree-utils.test.ts
npm test -- src/hooks/useTreeState.test.ts
npm test -- src/__tests__/performance.test.ts
```

---

## Success Criteria

- ✅ 所有单元测试通过
- ✅ 性能测试：1000 节点 < 100ms
- ✅ 性能测试：2000 节点 < 200ms
- ✅ 构建成功无错误
- ✅ dumi 文档正常生成
- ✅ 核心功能闭环（树 + 编辑器 + 运行 + 锁定 + 依赖）

---

**Plan complete!** 🎉

**Two execution options:**

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
