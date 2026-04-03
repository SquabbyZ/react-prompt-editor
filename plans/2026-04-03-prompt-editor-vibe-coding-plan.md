# 提示词编辑器组件库 - Vibe Coding 开发计划

**版本**: v1.0  
**创建日期**: 2026-04-03  
**开发模式**: Vibe Coding (Trae IDE + Qwen3.5-Plus)  
**预计周期**: 10 周 (Phase 1: React + 默认主题)

---

## 🎯 Vibe Coding 开发理念

### 什么是 Vibe Coding?

Vibe Coding 是一种基于 AI 辅助的开发方式，核心理念:
- **Flow State**: 保持心流状态，持续编码
- **AI Pair Programming**: 与 AI 结对编程
- **Rapid Iteration**: 快速迭代，小步快跑
- **Context Management**: 有效管理上下文
- **Progressive Disclosure**: 渐进式展开复杂度

### Trae IDE + Qwen3.5-Plus 最佳实践

**优势**:
- ✅ 深度 IDE 集成
- ✅ 代码理解能力强
- ✅ 支持复杂任务分解
- ✅ 实时错误检测
- ✅ 上下文感知

**开发节奏**:
```
1. 明确任务 (5 分钟)
   ↓
2. AI 生成代码 (2-10 分钟)
   ↓
3. 审查 + 微调 (5 分钟)
   ↓
4. 测试验证 (5 分钟)
   ↓
5. 提交 + 下一步 (2 分钟)
━━━━━━━━━━━━━━━━━━━
单个循环：~20 分钟
每天：6-8 个循环
```

### 💡 推荐技能 (Skills)

基于开发计划，推荐安装以下技能提升开发效率:

**React 组件开发**:
```bash
# React 组件架构最佳实践
npx skills add google-labs-code/stitch-skills@react:components

# React 组件性能优化
npx skills add dimillian/skills@react-component-performance

# React 组件架构提示词
npx skills add aj-geddes/useful-ai-prompts@react-component-architecture
```

**Storybook 开发**:
```bash
# Storybook 故事编写
npx skills add thebushidocollective/han@storybook-story-writing

# Storybook Play Functions
npx skills add thebushidocollective/han@storybook-play-functions

# Storybook 设置
npx skills add patricio0312rev/skills@storybook-setup
```

**TypeScript 开发**:
```bash
# 已内置在 Trae IDE 中
```

**安装建议**:
- Week 1 开始前安装所有推荐技能
- 使用 `-g` 标志全局安装
- 安装后重启 Trae IDE 使技能生效

---

## 📋 开发计划总览

### Phase 1: React 核心功能 + 默认主题 (10 周)

```
Week 1-2:   基础架构搭建          ████████░░░░░░░░░░░░  40%
Week 3-4:   树形结构 + 虚拟滚动    ████████░░░░░░░░░░░░  40%
Week 5-6:   编辑器集成 + 优化      ████████░░░░░░░░░░░░  40%
Week 7-8:   核心功能实现          ████████░░░░░░░░░░░░  40%
Week 9:     运行结果展示          ████████░░░░░░░░░░░░  20%
Week 10:    主题 + 性能测试        ████████░░░░░░░░░░░░  20%
```

---

## 🗓️ 详细开发计划

### Week 1-2: 基础架构搭建

#### 目标
- ✅ 项目初始化 (Vite + TypeScript)
- ✅ Storybook 配置
- ✅ 目录结构搭建
- ✅ 基础类型定义
- ✅ 依赖配置

#### 💬 主体提示词模板

**Task 1.1-1.3: 项目初始化 + Vite 配置 + Storybook**

```prompt
# Role
你是一位资深的前端架构师，专注于 React 组件库开发。

# Task
帮我创建一个基于 Vite + TypeScript 的 React 组件库项目，并配置 Storybook。

# Requirements
1. 使用 Vite 库模式构建，支持 ESM 和 CJS 输出
2. 配置 vite-plugin-dts 生成 TypeScript 类型声明
3. 初始化 Storybook，配置 Vite 构建支持
4. 配置 ESLint + Prettier 代码规范
5. 外部化 react 和 react-dom 作为 peerDependencies

# Output
1. 完整的 vite.config.ts 配置文件
2. package.json 依赖配置
3. Storybook 配置文件 (main.ts, preview.ts)
4. .eslintrc.cjs 和 .prettierrc 配置
5. 项目启动和构建命令说明

# Tech Stack
- Vite 5.x
- TypeScript 5.x
- React 18.x
- Storybook 8.x
- ESLint 9.x

# Notes
- 确保配置支持库模式构建
- Storybook 需要支持 TS 和 Vite
- 构建输出到 dist 目录
```

**Task 1.4-1.5: 目录结构 + 类型定义**

```prompt
# Role
你是一位 TypeScript 类型系统专家。

# Task
为提示词编辑器组件库设计完整的目录结构和 TypeScript 类型定义。

# Requirements
1. 创建标准组件库目录结构 (components, hooks, utils, styles)
2. 定义 TaskNode 接口 (树形节点数据结构)
3. 定义 PromptEditorProps 接口 (主组件 Props)
4. 定义所有子组件的 Props 类型
5. 配置统一的类型导出 (index.ts)

# TaskNode Interface
- id: string (唯一标识)
- title: string (标题)
- content: string (Markdown 内容)
- level: number (层级深度)
- parentId?: string (父节点 ID)
- isLocked: boolean (是否锁定)
- hasRun: boolean (是否运行过)
- dependencies?: string[] (依赖节点 ID 列表)
- children?: TaskNode[] (子节点列表)

# Output
1. 完整的目录结构树
2. 所有 TypeScript 类型定义文件
3. 类型导出配置文件
4. 类型使用示例代码

# Notes
- 使用 TypeScript 严格模式
- 所有类型都要有 JSDoc 注释
- 遵循 React 18 类型规范
```

**Task 1.6-1.8: 依赖安装 + 组件骨架 + Storybook 故事**

```prompt
# Role
你是一位 React 组件开发专家。

# Task
创建 PromptEditor 组件的基础骨架和第一个 Storybook 故事。

# Requirements
1. 安装核心依赖 (react-arborist, react-virtuoso, @monaco-editor/react)
2. 创建 PromptEditor 组件骨架
3. 实现基础 Props 接收和渲染
4. 创建第一个 Storybook 故事 (Default)
5. 配置主题切换基础结构

# Output
1. npm install 命令列表
2. PromptEditor.tsx 完整实现
3. PromptEditor.types.ts 类型定义
4. PromptEditor.stories.tsx 故事文件
5. index.ts 导出配置

# Story Requirements
- Default 故事：展示空编辑器
- 支持 args 控制
- 配置 centered layout
- 添加 autodocs 标签

# Notes
- 组件要支持受控和非受控模式
- 使用 React.FC 类型
- Storybook 8.x 的新语法
```

---

### Week 3-4: 树形结构 + 虚拟滚动

#### 目标
- ✅ react-arborist 集成
- ✅ react-virtuoso 虚拟滚动
- ✅ 拖拽功能
- ✅ 序号生成算法
- ✅ 互斥展开逻辑
- ✅ 性能测试 (1000 节点)

#### 💬 主体提示词模板

**Task 2.1-2.2: useTreeState Hook + react-arborist 集成**

```prompt
# Role
你是一位 React Hooks 和状态管理专家。

# Task
为提示词编辑器创建树形状态管理 Hook 和 react-arboris 集成。

# Requirements
1. 创建 useTreeState Hook，管理树形数据
2. 实现互斥展开逻辑 (每次只展开一个节点)
3. 实现序号自动生成算法 (1, 1.1, 1.1.1...)
4. 集成 react-arborist Tree 组件
5. 实现拖拽移动功能 (handleMove)

# Key Features
- 扁平化树形结构 (供 react-arborist 使用)
- 展开/折叠状态管理 (Set 结构)
- 序号生成：根据节点在树中的位置动态计算
- 互斥展开：展开一个节点时关闭同层级的其他节点
- 拖拽支持：更新 parentId、level，重新计算序号

# Output
1. useTreeState.ts 完整实现 (包含所有逻辑)
2. treeUtils.ts 工具函数 (flattenTree, findNode, generateNodeNumber 等)
3. PromptEditor.tsx 中 Tree 组件的使用示例
4. TreeNode 组件的基础结构

# Notes
- 使用 useMemo 优化性能
- 序号不存储在数据中，显示时动态计算
- 拖拽后要触发 onChange 回调
```

**Task 2.3-2.5: 虚拟滚动 + 性能测试**

```prompt
# Role
你是一位前端性能优化专家。

# Task
为树形组件集成 react-virtuoso 虚拟滚动，并进行性能优化。

# Requirements
1. 使用 react-virtuoso 替换默认渲染
2. 只渲染可见区域的节点
3. 支持 1000+ 节点 @ 60fps
4. 实现性能测试用例
5. 优化滚动性能

# Performance Goals
- 初始渲染 1000 节点 < 100ms
- 滚动 FPS > 60
- 内存占用 < 200MB
- 展开/折叠 < 16ms

# Output
1. Virtuoso 集成代码
2. visibleNodes 计算逻辑 (过滤可见节点)
3. 性能测试文件 (performance.test.ts)
4. 性能优化建议文档

# Notes
- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 缓存计算结果
- 虚拟滚动需要固定行高或动态计算
```

---

### Week 5-6: 编辑器集成 + 优化

#### 目标
- ✅ Monaco Editor CDN/本地双模式
- ✅ 编辑器懒加载
- ✅ Markdown 语法支持
- ✅ 性能优化

#### 💬 主体提示词模板

**Task 3.1-3.2: MonacoEditorWrapper + 双模式支持**

```prompt
# Role
你是一位 Monaco Editor 集成专家。

# Task
创建 Monaco Editor 包装器组件，支持 CDN/本地双模式加载。

# Requirements
1. 创建 MonacoEditorWrapper 组件
2. 支持 CDN 和本地两种加载模式
3. 按需加载 Markdown 语言支持
4. 配置编辑器选项 (主题、字体、最小化等)
5. 支持 Markdown 语法高亮

# MonacoConfig Interface
- mode: 'cdn' | 'local' (默认 'cdn')
- cdnUrl?: string (自定义 CDN 地址)
- languages?: string[] (默认 ['markdown'])
- theme?: 'vs' | 'vs-dark' | 'hc-black'
- minimap?: boolean
- fontSize?: number

# Output
1. MonacoEditorWrapper.tsx 完整实现
2. MonacoEditorWrapper.types.ts 类型定义
3. CDN 模式配置示例
4. 本地模式 Vite 配置 (worker 加载)
5. 使用示例代码

# Notes
- CDN 模式使用 @monaco-editor/react 的 loader
- 本地模式需要配置 worker 加载
- 只加载 markdown 语言减小包体积
```

**Task 3.3-3.4: 懒加载 + 性能优化**

```prompt
# Role
你是一位 React 性能优化专家。

# Task
实现 Monaco Editor 懒加载和组件性能优化。

# Requirements
1. 编辑器仅在展开/聚焦时加载
2. 使用 React.memo 优化重渲染
3. 使用 useMemo 缓存编辑器配置
4. 使用 useCallback 缓存回调函数
5. 实现编辑器占位符组件

# Lazy Loading Strategy
- 初始状态：显示占位符
- 节点展开时：加载编辑器
- 节点聚焦时：加载编辑器 (如果未加载)
- 使用 useState 跟踪加载状态

# Performance Optimizations
- React.memo 包裹 TreeNode 组件
- useMemo 缓存 editorOptions
- useCallback 缓存 handleChange
- 避免父组件重渲染时子组件跟随重渲染

# Output
1. TreeNode.tsx 懒加载实现
2. EditorPlaceholder 组件
3. 性能优化前后的对比数据
4. 性能测试方法

# Notes
- 占位符要友好 (显示"Click to load editor")
- 加载过程要有 loading 状态
- 性能优化要可量化
```
```typescript
// src/hooks/useTreeState.ts
import { useState, useMemo } from 'react';
import { TaskNode } from '../components/PromptEditor/PromptEditor.types';

export function useTreeState(initialData: TaskNode[] = []) {
  const [tree, setTree] = useState<TaskNode[]>(initialData);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // 扁平化树形结构 (react-arborist 需要)
  const flatTree = useMemo(() => {
    return flattenTree(tree);
  }, [tree]);

  // 生成序号
  const getNodeNumber = (nodeId: string): string => {
    return generateNodeNumber(nodeId, tree);
  };

  // 切换展开/折叠
  const toggleExpand = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        // 互斥展开：关闭同层级的其他节点
        const node = findNode(nodeId, tree);
        if (node) {
          const sameLevelNodes = getSameLevelNodes(nodeId, tree);
          sameLevelNodes.forEach(id => next.delete(id));
        }
        next.add(nodeId);
      }
      return next;
    });
  };

  return {
    tree,
    flatTree,
    expandedNodes,
    getNodeNumber,
    toggleExpand,
    setTree,
  };
}
```

**预期结果**:
- [ ] useTreeState hook 完成
- [ ] 互斥展开逻辑正确
- [ ] 序号生成算法正确

**Task 2.2**: react-arborist Tree 集成
```typescript
// src/components/PromptEditor/PromptEditor.tsx
import { Tree } from 'react-arborist';
import { useTreeState } from '../../hooks/useTreeState';

export const PromptEditor: React.FC<PromptEditorProps> = (props) => {
  const { tree, flatTree, expandedNodes, toggleExpand, getNodeNumber } = useTreeState(props.initialValue);

  return (
    <div className="prompt-editor">
      <Tree
        data={flatTree}
        openByDefault={false}
        rowHeight={40}
        indent={20}
      >
        {({ node, style }) => (
          <TreeNode
            key={node.id}
            node={node.data}
            number={getNodeNumber(node.id)}
            isExpanded={expandedNodes.has(node.id)}
            onToggle={() => toggleExpand(node.id)}
          />
        )}
      </Tree>
    </div>
  );
};
```

**预期结果**:
- [ ] Tree 能正常渲染
- [ ] 数据正确传递
- [ ] 基础样式正常

**Day 4-5: 虚拟滚动集成**

**Task 2.3**: react-virtuoso 集成
```typescript
// src/components/PromptEditor/PromptEditor.tsx
import { Virtuoso } from 'react-virtuoso';

export const PromptEditor: React.FC<PromptEditorProps> = (props) => {
  const { visibleNodes } = useTreeState(props.initialValue);

  return (
    <Virtuoso
      data={visibleNodes}
      style={{ height: 600 }}
      itemContent={(index, node) => (
        <TreeNode
          key={node.id}
          node={node}
          number={getNodeNumber(node.id)}
        />
      )}
    />
  );
};
```

**预期结果**:
- [ ] 虚拟滚动正常工作
- [ ] 滚动流畅
- [ ] 只渲染可见节点

**Day 6-7: 拖拽功能**

**Task 2.4**: 拖拽逻辑实现
```typescript
// src/hooks/useTreeState.ts
export function useTreeState(initialData: TaskNode[] = []) {
  // ... 其他代码

  // 处理拖拽
  const handleMove = (move: {
    dragIds: string[];
    parentId: string | null;
    index: number;
  }) => {
    setTree(prev => {
      const next = [...prev];
      // 实现拖拽逻辑
      // 1. 找到被拖拽的节点
      // 2. 从原位置移除
      // 3. 插入到新位置
      // 4. 更新 parentId 和 level
      return next;
    });
  };

  return {
    // ...
    handleMove,
  };
}
```

**预期结果**:
- [ ] 拖拽功能正常
- [ ] 层级关系正确更新
- [ ] 序号重新计算

**Day 8-10: 性能测试**

**Task 2.5**: 性能基准测试
```typescript
// src/__tests__/performance.test.ts
import { renderHook } from '@testing-library/react';
import { useTreeState } from '../hooks/useTreeState';

describe('Performance Tests', () => {
  it('should handle 1000 nodes @ 60fps', () => {
    const largeTree = generateLargeTree(1000);
    const { result } = renderHook(() => useTreeState(largeTree));
    
    // 测试展开/折叠性能
    const startTime = performance.now();
    result.current.toggleExpand('node-500');
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(16); // 16ms = 60fps
  });
});
```

**预期结果**:
- [ ] 1000 节点测试通过
- [ ] 展开/折叠 < 16ms
- [ ] 内存占用合理

---

### Week 5-6: 编辑器集成 + 优化

#### 目标
- ✅ Monaco Editor CDN/本地双模式
- ✅ 编辑器懒加载
- ✅ Markdown 语法支持
- ✅ 性能优化

#### Vibe Coding 任务分解

**Day 1-3: Monaco Editor 基础集成**

**Task 3.1**: MonacoEditorWrapper 组件
```typescript
// src/components/MonacoEditorWrapper/MonacoEditorWrapper.tsx
import Editor, { loader } from '@monaco-editor/react';
import { MonacoConfig } from './MonacoEditorWrapper.types';

loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs' },
});

export const MonacoEditorWrapper: React.FC<MonacoEditorWrapperProps> = ({
  value,
  onChange,
  isReadOnly,
  config = {},
}) => {
  const {
    mode = 'cdn',
    theme = 'vs',
    minimap = false,
    fontSize = 14,
  } = config;

  return (
    <Editor
      height="200px"
      language="markdown"
      theme={theme}
      value={value}
      onChange={(val) => onChange(val || '')}
      options={{
        readOnly: isReadOnly,
        minimap: { enabled: minimap },
        fontSize,
        lineNumbers: 'off',
        folding: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
};
```

**预期结果**:
- [ ] 编辑器正常渲染
- [ ] Markdown 语法高亮
- [ ] 基础配置生效

**Task 3.2**: CDN/本地双模式
```typescript
// src/components/MonacoEditorWrapper/MonacoEditorWrapper.tsx
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import markdownWorker from 'monaco-editor/esm/vs/language/markdown/markdown.worker?worker';

if (config.mode === 'local') {
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'markdown') return new markdownWorker();
      return new editorWorker();
    },
  };
}
```

**预期结果**:
- [ ] CDN 模式正常
- [ ] 本地模式正常
- [ ] 模式切换正确

**Day 4-5: 编辑器懒加载**

**Task 3.3**: 懒加载逻辑
```typescript
// src/components/TreeNode/TreeNode.tsx
export const TreeNode: React.FC<TreeNodeProps> = ({ node, isExpanded }) => {
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (isExpanded || isFocused) {
      setEditorLoaded(true);
    }
  }, [isExpanded, isFocused]);

  return (
    <div>
      {editorLoaded ? (
        <MonacoEditorWrapper
          value={node.content}
          onFocus={() => setIsFocused(true)}
        />
      ) : (
        <div className="editor-placeholder">
          Click to load editor...
        </div>
      )}
    </div>
  );
};
```

**预期结果**:
- [ ] 懒加载逻辑正确
- [ ] 聚焦时加载
- [ ] 占位符显示

**Day 6-7: 性能优化**

**Task 3.4**: React 性能优化
```typescript
// src/components/TreeNode/TreeNode.tsx
import React, { memo, useMemo, useCallback } from 'react';

export const TreeNode = memo<TreeNodeProps>(({ node, onToggle, onContentChange }) => {
  // 缓存编辑器配置
  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'off',
  }), []);

  // 缓存回调函数
  const handleChange = useCallback((content: string) => {
    onContentChange(node.id, content);
  }, [node.id, onContentChange]);

  return (
    <div>
      <MonacoEditorWrapper
        value={node.content}
        onChange={handleChange}
        options={editorOptions}
      />
    </div>
  );
});
```

**预期结果**:
- [ ] React.memo 生效
- [ ] useMemo 减少重复计算
- [ ] useCallback 减少重渲染

---

### Week 7-8: 核心功能实现

#### 目标
- ✅ 运行按钮 + API 集成
- ✅ AI 优化对话框
- ✅ 锁定机制
- ✅ 依赖管理

#### 💬 主体提示词模板

**Task 4.1-4.3: 运行 + AI 优化 + 锁定功能**

```prompt
# Role
你是一位全栈功能开发专家。

# Task
实现提示词编辑器的核心功能：运行、AI 优化、锁定。

# Requirements

## 1. 运行功能 (RunButton)
- 点击运行按钮调用 runAPI
- 传递当前节点 content + 依赖节点的 content
- 显示运行状态 (isRunning)
- 运行完成后显示结果
- 更新 hasRun 状态

## 2. AI 优化功能 (AIOptimizeButton + Dialog)
- 点击按钮弹出优化对话框
- 输入优化指令 (instruction)
- 调用 optimizeAPI
- 显示 AI 思考过程 (thinkingProcess)
- 显示优化结果 (optimizedContent)
- 支持插入或退出

## 3. 锁定功能 (LockButton)
- 运行后才能锁定 (检查 hasRun)
- 锁定后禁止编辑
- 显示锁定/解锁图标 (🔒/🔓)
- 调用 onLock 回调

# Output
1. RunButton.tsx 完整实现
2. AIOptimizeButton.tsx + AIOptimizeDialog.tsx
3. LockButton.tsx 完整实现
4. 使用示例代码
5. API 调用示例

# Notes
- 运行按钮要有 loading 状态
- AI 优化对话框要支持流式显示思考过程
- 锁定按钮未运行时禁用并提示
```
```typescript
// src/components/RunButton/RunButton.tsx
export const RunButton: React.FC<RunButtonProps> = ({
  nodeId,
  content,
  dependencies,
  runAPI,
  onRun,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const response = await runAPI({
        nodeId,
        content,
        dependenciesContent: dependencies.map(dep => dep.content),
      });
      setResult(response.result);
      onRun?.(nodeId, response);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <button onClick={handleRun} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Run'}
      </button>
      {result && <RunResultCard result={result} />}
    </div>
  );
};
```

**预期结果**:
- [ ] 按钮点击正常
- [ ] API 调用正确
- [ ] 结果显示正常

**Day 4-6: AI 优化功能**

**Task 4.2**: AI 优化对话框
```typescript
// src/components/AIOptimizeButton/AIOptimizeDialog.tsx
export const AIOptimizeDialog: React.FC<AIOptimizeDialogProps> = ({
  anchorEl,
  originalContent,
  optimizeAPI,
  onInsert,
  onClose,
}) => {
  const [instruction, setInstruction] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [thinkingProcess, setThinkingProcess] = useState('');
  const [optimizedContent, setOptimizedContent] = useState('');

  const handleOptimize = async () => {
    setIsOptimizing(true);
    try {
      const response = await optimizeAPI({
        content: originalContent,
        instruction,
      });
      setThinkingProcess(response.thinkingProcess);
      setOptimizedContent(response.optimizedContent);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <Dialog anchorEl={anchorEl} open onClose={onClose}>
      <textarea
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        placeholder="优化指令..."
      />
      <button onClick={handleOptimize} disabled={isOptimizing}>
        {isOptimizing ? 'Optimizing...' : 'Optimize'}
      </button>
      {thinkingProcess && <div className="thinking">{thinkingProcess}</div>}
      {optimizedContent && (
        <div>
          <pre>{optimizedContent}</pre>
          <button onClick={() => onInsert(optimizedContent)}>Insert</button>
        </div>
      )}
    </Dialog>
  );
};
```

**预期结果**:
- [ ] 对话框正常弹出
- [ ] AI 优化流程正确
- [ ] 思考过程显示
- [ ] 结果插入功能

**Day 7-8: 锁定机制**

**Task 4.3**: 锁定逻辑
```typescript
// src/components/LockButton/LockButton.tsx
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
      className={isLocked ? 'locked' : 'unlocked'}
    >
      {isLocked ? '🔒' : '🔓'}
    </button>
  );
};
```

**预期结果**:
- [ ] 锁定按钮正常
- [ ] 运行检查正确
- [ ] 状态切换正确

---

### Week 9: 运行结果展示

#### 目标
- ✅ Ant Design X Bubble 集成
- ✅ 流式结果显示
- ✅ 打字动画
- ✅ 自定义组件支持

#### 💬 主体提示词模板

**Task 5.1-5.2: Bubble.List 集成 + 自定义组件**

```prompt
# Role
你是一位 UI 组件集成专家。

# Task
集成 Ant Design X Bubble.List 组件展示运行结果，支持自定义。

# Requirements

## 1. Bubble.List 集成 (默认)
- 使用 Ant Design X Bubble.List
- 配置打字动画 (typing effect)
- 支持流式更新 (streaming)
- 自动滚动 (autoScroll)
- 配置 loading 状态

## 2. 自定义组件支持
- 支持传入自定义结果组件
- 通过 runResultConfig 配置
- 支持 bubbleProps 透传
- 支持 contentRender 自定义渲染

# RunResultConfig Interface
- resultComponent?: 'bubble' | 'custom' | React.ComponentType
- bubbleProps?: BubbleProps (打字动画、流式、样式等)
- contentRender?: (content, info) => React.ReactNode
- className?: string
- style?: React.CSSProperties

# Output
1. RunResultCard.tsx 完整实现
2. Bubble.List 集成示例
3. 自定义组件示例 (CustomResultCard)
4. runResultConfig 使用示例
5. Ant Design X 安装说明

# Notes
- Ant Design X 作为 peerDependencies
- 未安装时降级为简单文本展示
- 支持用户完全自定义结果组件
```
```typescript
// src/components/RunResultCard/RunResultCard.tsx
import { Bubble } from 'antd-x';

export const RunResultCard: React.FC<RunResultCardProps> = ({
  nodeId,
  result,
  isStreaming,
  bubbleProps,
}) => {
  return (
    <Bubble.List
      items={[{
        key: nodeId,
        role: 'ai',
        content: result,
        loading: isStreaming,
        typing: { effect: 'typing', step: 1, interval: 50 },
        streaming: isStreaming,
      }]}
      style={{ height: 400, marginTop: 16 }}
      autoScroll
      {...bubbleProps}
    />
  );
};
```

**预期结果**:
- [ ] Bubble.List 正常渲染
- [ ] 打字动画生效
- [ ] 流式更新正常

**Day 4-5: 自定义组件支持**

**Task 5.2**: 自定义结果组件
```typescript
// src/components/PromptEditor/PromptEditor.tsx
export const PromptEditor: React.FC<PromptEditorProps> = ({
  runResultConfig,
}) => {
  const ResultComponent = runResultConfig?.resultComponent || BubbleList;

  return (
    <div>
      {/* 其他代码 */}
      <ResultComponent
        nodeId={nodeId}
        result={result}
        isStreaming={isStreaming}
        {...runResultConfig}
      />
    </div>
  );
};
```

**预期结果**:
- [ ] 自定义组件支持
- [ ] 默认 Bubble.List
- [ ] 配置透传正确

---

### Week 10: 主题 + 性能测试

#### 目标
- ✅ 默认主题完善
- ✅ 性能基准测试 (2000 节点 @ 60fps)
- ✅ Storybook 故事完善
- ✅ 文档编写

#### 💬 主体提示词模板

**Task 6.1-6.3: 主题系统 + 性能测试 + 文档**

```prompt
# Role
你是一位主题系统设计和性能测试专家。

# Task
完成提示词编辑器的主题系统、性能基准测试和文档。

# Requirements

## 1. 主题系统 (CSS Variables)
- 定义全局 CSS 变量 (颜色、间距、圆角、阴影)
- 实现主题切换 ([data-theme])
- 完成默认主题样式
- 支持主题扩展

## 2. 性能基准测试
- 测试 2000 节点渲染性能
- 测试滚动 FPS
- 测试内存占用
- 测试展开/折叠性能

## 3. Storybook 故事完善
- 编写所有组件的故事
- 添加大数量测试故事
- 添加主题切换故事
- 添加自定义结果故事

## 4. 文档编写
- README.md 使用指南
- API 文档
- 示例代码
- 性能优化建议

# Performance Goals
- 2000 节点渲染 < 100ms
- 滚动 FPS > 60
- 内存占用 < 200MB
- 展开/折叠 < 16ms

# Output
1. themes/default.css 完整实现
2. performance.benchmark.ts 测试文件
3. 所有组件的 Stories 文件
4. README.md 文档
5. 性能测试报告模板

# Notes
- 使用 CSS Variables 实现主题
- 性能测试要可重复执行
- Storybook 故事要覆盖所有场景
- 文档要包含安装、使用、API、示例
```
```css
/* src/styles/themes/default.css */
:root {
  --pe-color-primary: #667eea;
  --pe-color-success: #11998e;
  --pe-color-warning: #f57c00;
  --pe-color-error: #c62828;
  --pe-spacing-xs: 4px;
  --pe-spacing-sm: 8px;
  --pe-spacing-md: 16px;
  --pe-spacing-lg: 24px;
  --pe-radius-sm: 4px;
  --pe-radius-md: 8px;
  --pe-radius-lg: 12px;
}

[data-theme='default'] {
  --pe-bg-primary: #ffffff;
  --pe-bg-secondary: #f5f5f5;
  --pe-text-primary: #333333;
  --pe-border-color: #e0e0e0;
}
```

**预期结果**:
- [ ] 主题变量定义
- [ ] 主题切换正常
- [ ] 样式统一

**Day 4-5: 性能测试**

**Task 6.2**: 2000 节点性能测试
```typescript
// src/__tests__/performance.benchmark.ts
import { render } from '@testing-library/react';
import { PromptEditor } from '../components/PromptEditor';

describe('Performance Benchmark', () => {
  it('should handle 2000 nodes @ 60fps', () => {
    const largeTree = generateLargeTree(2000);
    
    const startTime = performance.now();
    const { container } = render(<PromptEditor initialValue={largeTree} />);
    const renderTime = performance.now();
    
    expect(renderTime - startTime).toBeLessThan(100); // < 100ms
    
    // 测试滚动性能
    container.scrollTo(0, 10000);
    // 使用 requestAnimationFrame 测量 FPS
  });
});
```

**预期结果**:
- [ ] 2000 节点渲染 < 100ms
- [ ] 滚动 FPS > 60
- [ ] 内存占用 < 200MB

**Day 6-7: 文档和 Storybook**

**Task 6.3**: Storybook 故事完善
```typescript
// src/components/PromptEditor/PromptEditor.stories.tsx
export const WithLargeData: Story = {
  args: {
    initialValue: generateLargeTree(2000),
  },
};

export const WithThemes: Story = {
  render: () => (
    <div>
      <h2>Default</h2>
      <PromptEditor theme="default" />
      <h2>Ant Design</h2>
      <PromptEditor theme="ant-design" />
    </div>
  ),
};

export const WithCustomResult: Story = {
  args: {
    runResultConfig: {
      resultComponent: CustomResultCard,
    },
  },
};
```

**预期结果**:
- [ ] 所有故事完成
- [ ] 文档完善
- [ ] 使用指南编写

---

## 🎯 Vibe Coding 工作流

### 每日开发流程

```
Morning (9:00 - 12:00)
├─ 9:00-9:15   明确今日任务
├─ 9:15-11:45  Vibe Coding 循环 (3-4 个循环)
│   ├─ 明确任务 (5 分钟)
│   ├─ AI 生成代码 (2-10 分钟)
│   ├─ 审查 + 微调 (5 分钟)
│   └─ 测试验证 (5 分钟)
└─ 11:45-12:00 代码审查 + 提交

Afternoon (14:00 - 18:00)
├─ 14:00-16:30  Vibe Coding 循环 (3-4 个循环)
├─ 16:30-17:00  性能测试
└─ 17:00-18:00  文档更新 + 明日计划
```

### Trae IDE 快捷键

```
⌘+K  触发 AI 代码生成
⌘+L  触发 AI 代码解释
⌘+M  触发 AI 代码优化
⌘+N  新建文件
⌘+P  快速打开文件
⌘+`  打开终端
```

### Qwen3.5-Plus 最佳提示词

**代码生成**:
```
请帮我创建一个 React 组件，实现以下功能：
1. 功能描述：[具体功能]
2. Props 接口：[接口定义]
3. 使用示例：[使用代码]
4. 注意事项：[特殊要求]

请使用 TypeScript，遵循 React 18 最佳实践。
```

**代码优化**:
```
请优化以下代码的性能：
[代码片段]

关注点：
1. 减少不必要的重渲染
2. 优化计算逻辑
3. 改进代码结构
```

**错误修复**:
```
遇到以下错误：
[错误信息]

相关代码：
[代码片段]

请分析原因并提供修复方案。
```

---

## 📊 进度追踪

### 里程碑

```
Week 2:  ✅ 基础架构完成
Week 4:  ✅ 树形结构完成
Week 6:  ✅ 编辑器集成完成
Week 8:  ✅ 核心功能完成
Week 10: ✅ 发布 v1.0
```

### 质量指标

```
- 测试覆盖率：> 80%
- TypeScript 类型：100%
- ESLint 错误：0
- 性能指标：2000 节点 @ 60fps
- 包体积：< 100KB (CDN 模式)
```

---

## 🚀 快速开始

### Day 1 启动清单

```bash
# 1. 创建项目
npm create vite@latest prompt-editor -- --template react-ts
cd prompt-editor

# 2. 安装依赖
npm install
npm install react-arborist react-virtuoso @monaco-editor/react
npm install -D vite-plugin-dts storybook

# 3. 初始化 Storybook
npx storybook@latest init

# 4. 创建目录结构
mkdir -p src/{components,hooks,utils,styles/themes}

# 5. 启动开发服务器
npm run dev
npm run storybook
```

---

**文档创建完成！** 🎉

现在可以开始第一天的开发工作了。建议从 **Week 1-2: 基础架构搭建** 开始，按照任务清单逐个完成。每个任务都设计了适合 Vibe Coding 的小步骤，保持心流状态！

有任何问题随时告诉我，我会协助你调整计划或提供具体的代码实现建议！💪
