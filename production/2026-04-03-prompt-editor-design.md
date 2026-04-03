# 提示词编辑器组件库 - 产品设计文档

**版本**: v1.0  
**创建日期**: 2026-04-03  
**最后更新**: 2026-04-03  
**状态**: 待评审

---

## 📖 产品概述

### 1.1 产品定位

一个**基于 React 的树形提示词编辑器组件库**，专为 AI 工作流设计，支持层级化的提示词管理、可视化编辑、AI 辅助优化和任务依赖管理。

### 1.2 核心价值

- 🌲 **树形结构管理**: 直观的层级化提示词组织方式
- 🎨 **可视化拖拽**: 支持拖拽调整层级关系
- 🤖 **AI 集成**: 内置 AI 优化和运行能力
- 🔒 **状态管理**: 运行锁定机制确保工作流可靠性
- 📦 **框架无关**: 核心逻辑与 UI 分离，支持多框架适配

### 1.3 技术栈

- **核心框架**: React 18+
- **树形结构**: react-arborist + react-virtuoso (虚拟滚动)
- **代码编辑器**: Monaco Editor (CDN/本地双模式)
- **开发工具**: Storybook (组件开发和文档)
- **构建工具**: Vite / Rollup
- **样式方案**: CSS Variables + 主题系统 (支持多套 UI 风格)
- **性能优化**: 虚拟滚动、懒加载、memo 优化

### 1.4 多框架/多主题战略

**第一阶段 (v1.0)**: React 版本 + 默认主题  
**第二阶段 (v1.1)**: Vue 2 / Vue 3 适配  
**第三阶段 (v2.0)**: 主题系统 (Ant Design / ShadcnUI / MartainUI)

---

## 🎯 功能需求

### 2.1 核心功能清单

#### F1: 树形结构管理
- [x] F1.1: 使用 react-arborist 实现树形数据结构
- [x] F1.2: 支持拖拽调整节点层级关系
- [x] F1.3: 自动生成标题序号 (1, 1.1, 1.1.1...)
- [x] F1.4: 互斥展开模式 (每次只能展开一层)
- [x] F1.5: 支持新增子节点
- [x] F1.6: 支持删除节点

#### F2: 提示词编辑
- [x] F2.1: Monaco Editor 集成 (Markdown 模式)
- [x] F2.2: 支持 CDN/本地双模式加载
- [x] F2.3: 实时内容更新
- [x] F2.4: 编辑器高度自适应
- [x] F2.5: 虚拟滚动优化 (支持 2000+ 节点)
- [x] F2.6: 编辑器懒加载 (展开/聚焦时才加载)

#### F3: 运行功能
- [x] F3.1: 每个节点独立"运行"按钮
- [x] F3.2: 传递当前节点 + 依赖任务的提示词到 API
- [x] F3.3: 流式结果展示 (默认使用 Ant Design X Bubble.List)
- [x] F3.4: 运行状态追踪 (hasRun 标记)
- [x] F3.5: 支持自定义结果展示组件
- [x] F3.6: 支持配置 Bubble 组件属性

#### F4: AI 优化功能
- [x] F4.1: 每个节点独立"AI 优化"按钮
- [x] F4.2: 优化当前编辑器内容 (全部或选中)
- [x] F4.3: 显示 AI 思考过程
- [x] F4.4: 优化结果替换原文
- [x] F4.5: 交互式对话框 (参考截图)

#### F5: 锁定机制
- [x] F5.1: 锁定按钮 (运行后才可锁定)
- [x] F5.2: 锁定后禁止编辑
- [x] F5.3: 锁定状态可视化

#### F6: 依赖管理
- [x] F6.1: 依赖任务配置
- [x] F6.2: 依赖关系可视化
- [x] F6.3: 运行时自动包含依赖内容

#### F7: 主题系统
- [x] F7.1: 默认主题
- [ ] F7.2: Ant Design 主题 (v2.0)
- [ ] F7.3: ShadcnUI 主题 (v2.0)
- [ ] F7.4: MartainUI 主题 (v2.0)

#### F8: 多框架支持
- [x] F8.1: React 18+ (v1.0)
- [ ] F8.2: Vue 3 (v1.1)
- [ ] F8.3: Vue 2 (v1.1)

---

## 🏗️ 技术架构

### 3.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    应用层 (Application)                  │
├─────────────────────────────────────────────────────────┤
│  Storybook (开发环境) | 演示应用 (Demo App)              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 组件层 (Component Layer)                 │
├─────────────────────────────────────────────────────────┤
│  PromptEditor (主组件)                                   │
│  ├── TreeNode (树节点组件)                               │
│  ├── MonacoEditorWrapper (编辑器包装器)                  │
│  ├── RunButton (运行按钮)                                │
│  ├── AIOptimizeButton (AI 优化按钮)                      │
│  ├── LockButton (锁定按钮)                               │
│  └── DependencyPanel (依赖面板)                          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  状态层 (State Layer)                    │
├─────────────────────────────────────────────────────────┤
│  useTreeState (树形状态管理)                             │
│  ├── 节点增删改查                                        │
│  ├── 拖拽逻辑                                            │
│  ├── 展开/折叠状态                                       │
│  └── 序号自动生成                                        │
│                                                          │
│  useNodeState (节点状态管理)                             │
│  ├── 编辑状态                                            │
│  ├── 锁定状态                                            │
│  ├── 运行状态                                            │
│  └── AI 优化状态                                         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  服务层 (Service Layer)                  │
├─────────────────────────────────────────────────────────┤
│  apiClient (API 客户端)                                  │
│  ├── runTask (运行任务)                                  │
│  └── optimizePrompt (AI 优化)                            │
│                                                          │
│  eventEmitter (事件总线)                                 │
│  └── 跨组件通信                                          │
└─────────────────────────────────────────────────────────┘
```

### 3.2 目录结构

```
prompt-editor/
├── .storybook/              # Storybook 配置
├── src/
│   ├── components/          # 组件
│   │   ├── PromptEditor/
│   │   │   ├── index.tsx
│   │   │   ├── PromptEditor.tsx
│   │   │   ├── PromptEditor.types.ts
│   │   │   └── PromptEditor.stories.tsx
│   │   ├── TreeNode/
│   │   │   ├── index.tsx
│   │   │   ├── TreeNode.tsx
│   │   │   └── TreeNode.types.ts
│   │   ├── MonacoEditorWrapper/
│   │   │   ├── index.tsx
│   │   │   └── MonacoEditorWrapper.tsx
│   │   └── ...
│   │
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useTreeState.ts
│   │   ├── useNodeState.ts
│   │   └── useAPI.ts
│   │
│   ├── services/            # API 服务
│   │   ├── apiClient.ts
│   │   └── types.ts
│   │
│   ├── styles/              # 样式系统
│   │   ├── themes/
│   │   │   ├── default.ts
│   │   │   ├── ant-design.ts
│   │   │   ├── shadcnui.ts
│   │   │   └── martainui.ts
│   │   └── variables.css
│   │
│   ├── utils/               # 工具函数
│   │   ├── treeUtils.ts    # 树形工具
│   │   ├──序号 generator.ts  # 序号生成
│   │   └── index.ts
│   │
│   └── index.ts            # 导出入口
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📊 数据模型

### 4.1 核心数据类型

```typescript
// 任务节点数据结构
interface TaskNode {
  id: string;              // 唯一标识 (UUID)
  title: string;           // 节点标题
  content: string;         // Markdown 内容 (提示词)
  level: number;           // 层级深度 (1/2/3...)
  parentId?: string;       // 父节点 ID
  isLocked: boolean;       // 是否锁定
  hasRun: boolean;         // 是否运行过 (锁定的前提)
  dependencies?: string[]; // 依赖的节点 ID 列表
  children?: TaskNode[];   // 子节点列表 (树形结构)
}

// 树形数据结构 (react-arborist)
interface TreeData {
  root: TaskNode[];
  // 或使用扁平化存储
  // nodes: Record<string, TaskNode>;
}

// 节点操作事件
interface NodeEvent {
  type: 'create' | 'delete' | 'update' | 'move' | 'run' | 'optimize' | 'lock';
  nodeId: string;
  payload?: any;
}

// API 请求/响应类型
interface RunTaskRequest {
  nodeId: string;
  content: string;              // 当前节点提示词
  dependenciesContent: string[]; // 依赖节点的提示词列表
}

interface RunTaskResponse {
  result: string;               // 运行结果
  stream?: boolean;             // 是否流式
}

interface OptimizeRequest {
  content: string;              // 待优化的内容
  selectedText?: string;        // 选中的内容 (可选)
  instruction?: string;         // 优化指令
}

interface OptimizeResponse {
  optimizedContent: string;     // 优化后的内容
  thinkingProcess?: string;     // AI 思考过程
}
```

### 4.2 序号生成算法

```typescript
// 序号自动生成 (不存储在数据中，显示时动态计算)
function generateNodeNumber(node: TaskNode, tree: TaskNode[]): string {
  // 获取父节点
  const parent = getParentNode(node.id, tree);
  
  if (!parent) {
    // 根节点：1, 2, 3...
    const index = getRootNodeIndex(node.id, tree) + 1;
    return `${index}`;
  } else {
    // 子节点：1.1, 1.2, 2.1...
    const parentNumber = generateNodeNumber(parent, tree);
    const index = getChildIndexInParent(node.id, parent) + 1;
    return `${parentNumber}.${index}`;
  }
}

// 使用示例:
// 树结构：
// 1
// ├── 1.1
// │   └── 1.1.1
// ├── 1.2
// 2
// ├── 2.1
// └── 2.2
```

---

## 🎨 组件设计

### 5.1 PromptEditor (主组件)

**职责**: 整体容器，集成树形结构和状态管理

**Props**:
```typescript
interface PromptEditorProps {
  // 数据
  initialValue?: TaskNode[];        // 初始树形数据
  value?: TaskNode[];               // 受控模式数据
  onChange?: (data: TaskNode[]) => void;  // 数据变化回调
  
  // API 配置
  runAPI?: (req: RunTaskRequest) => Promise<RunTaskResponse>;
  optimizeAPI?: (req: OptimizeRequest) => Promise<OptimizeResponse>;
  
  // 事件回调
  onNodeRun?: (nodeId: string, result: RunTaskResponse) => void;
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  onNodeLock?: (nodeId: string, isLocked: boolean) => void;
  onTreeChange?: (tree: TaskNode[]) => void;  // 树结构变化回调
  
  // 主题配置
  theme?: 'default' | 'ant-design' | 'shadcnui' | 'martainui';
  
  // 运行结果配置
  runResultConfig?: RunResultConfig;
  
  // 样式自定义
  className?: string;
  style?: React.CSSProperties;
}
```

**状态**:
- tree: 树形数据
- expandedNodes: 展开的节点 ID 列表
- selectedNode: 选中的节点 ID
- loadingNodes: 加载中的节点 ID 集合

### 5.2 TreeNode (树节点组件)

**职责**: 单个节点的渲染和交互

**Props**:
```typescript
interface TreeNodeProps {
  node: TaskNode;
  number: string;              // 自动生成的序号
  isExpanded: boolean;         // 是否展开
  hasChildren: boolean;        // 是否有子节点
  
  // 回调
  onToggleExpand: () => void;  // 展开/折叠
  onAddChild: () => void;      // 新增子节点
  onDelete: () => void;        // 删除节点
  onRun: () => void;           // 运行
  onOptimize: () => void;      // AI 优化
  onLock: () => void;          // 锁定
  onContentChange: (content: string) => void;  // 内容变化
}
```

**UI 结构**:
```
┌────────────────────────────────────────────┐
│ [>] 1.1  季度累计西药收入同比波动情况分析    │
│     ┌────────────────────────────────┐     │
│     │ #分析需求：描述你的分析需求...   │     │
│     │ #展示方式：描述展示方式...       │     │
│     │ #图形展示方式：描述图形...       │     │
│     │ #输出约束：描述约束...           │     │
│     └────────────────────────────────┘     │
│     [依赖任务：1.1.1]  [AI 优化] [运行] [🔒]  │
└────────────────────────────────────────────┘
```

### 5.3 MonacoEditorWrapper (编辑器包装器)

**职责**: Monaco Editor 集成和按需加载

**加载模式**:

**模式 A: CDN 加载 (默认)**
```typescript
import { loader } from '@monaco-editor/react';

// CDN 模式配置
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
  },
});

// 支持自定义 CDN
loader.config({
  paths: {
    vs: 'https://your-cdn.com/monaco-editor@0.44.0/min/vs',
  },
});
```

**模式 B: 本地构建**
```typescript
// Vite 配置本地 worker
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import markdownWorker from 'monaco-editor/esm/vs/language/markdown/markdown.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker();
    if (label === 'markdown') return new markdownWorker();
    return new editorWorker();
  },
};
```

**配置接口**:
```typescript
interface MonacoConfig {
  mode: 'cdn' | 'local';           // 加载模式
  cdnUrl?: string;                  // 自定义 CDN 地址
  languages?: string[];             // 按需加载的语言 (默认 ['markdown'])
  theme?: 'vs' | 'vs-dark' | 'hc-black';  // 编辑器主题
  minimap?: boolean;                // 是否显示小地图
  fontSize?: number;                // 字体大小
}
```

**Props**:
```typescript
interface MonacoEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  isReadOnly: boolean;
  height?: string | number;
  language?: 'markdown' | 'text';
  config?: MonacoConfig;  // 编辑器配置
}
```

**懒加载策略**:
```typescript
// 仅在节点展开或聚焦时加载编辑器
function TreeNode({ node, isExpanded }) {
  const [editorLoaded, setEditorLoaded] = useState(false);
  
  // 展开或聚焦时才加载编辑器
  useEffect(() => {
    if (isExpanded || isFocused) {
      setEditorLoaded(true);
    }
  }, [isExpanded, isFocused]);
  
  return (
    <div>
      {editorLoaded ? (
        <MonacoEditorWrapper value={node.content} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
```

**性能优化**:
```typescript
// 使用 useMemo 避免重复创建 editor options
const editorOptions = useMemo(() => ({
  minimap: { enabled: false },
  fontSize: 14,
  lineNumbers: 'off',
  folding: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
}), []);

// 使用 React.memo 避免不必要的重渲染
const MemoizedEditor = React.memo(MonacoEditorWrapper);
```

### 5.4 AIOptimizeButton (AI 优化按钮)

**职责**: AI 优化交互

**UI 流程**:
1. 点击"AI 优化"按钮
2. 弹出对话框/气泡卡片
3. 显示输入框 (优化指令)
4. 调用 AI API
5. 显示 AI 思考过程 (流式)
6. 显示优化结果
7. 用户选择"插入"或"退出"

**对话框组件**:
```typescript
interface AIOptimizeDialogProps {
  anchorEl: HTMLElement;        // 锚点元素
  originalContent: string;      // 原始内容
  selectedText?: string;        // 选中的文本
  onOptimize: (instruction: string) => void;
  onInsert: (optimizedContent: string) => void;
  onClose: () => void;
}
```

### 5.5 RunButton (运行按钮)

**职责**: 运行任务并展示结果

**交互流程**:
1. 点击"运行"按钮
2. 收集当前节点 + 依赖节点的提示词
3. 调用运行 API
4. 使用 Bubble.List 显示流式结果 (默认)
5. 更新节点状态 (hasRun = true)
6. 启用锁定按钮

**结果展示配置**:
```typescript
interface RunResultConfig {
  // 结果展示组件
  resultComponent?: 'bubble' | 'custom' | React.ComponentType<ResultCardProps>;
  
  // Bubble 组件配置 (仅当 resultComponent='bubble' 或未指定时生效)
  bubbleProps?: {
    typing?: boolean | BubbleAnimationOption;  // 打字动画
    streaming?: boolean;                        // 流式传输
    variant?: 'filled' | 'outlined' | 'shadow' | 'borderless';
    shape?: 'default' | 'round' | 'corner';
    placement?: 'start' | 'end';
    loading?: boolean;
    loadingRender?: () => React.ReactNode;
    contentRender?: (content: string) => React.ReactNode;
    onTypingComplete?: (content: string) => void;
    // ... 其他 Ant Design X Bubble props
  };
  
  // 自定义渲染函数 (优先级高于 bubbleProps)
  contentRender?: (content: string, info: { nodeId: string; isStreaming: boolean }) => React.ReactNode;
  
  // 样式自定义
  className?: string;
  style?: React.CSSProperties;
}
```

**Bubble.List 集成要点**:
```typescript
// 默认使用 Bubble.List
<Bubble.List
  items={[
    {
      key: nodeId,
      role: 'ai',
      content: result,
      loading: isStreaming,
      typing: { effect: 'typing', step: 1, interval: 50 },
      streaming: isStreaming,
    }
  ]}
  style={{ height: 400, marginTop: 16 }}
  autoScroll
  {...bubbleProps}
/>

// 支持自定义组件
{resultComponent && typeof resultComponent !== 'string' ? (
  <CustomResultComponent nodeId={nodeId} result={result} isStreaming={isStreaming} />
) : (
  <Bubble.List {...bubbleProps} />
)}
```

---

## 🔄 交互流程

### 6.1 树形结构交互

#### F1: 展开/折叠 (互斥模式)

```typescript
// 互斥展开逻辑
function handleToggleExpand(nodeId: string) {
  const node = getNodeById(nodeId);
  
  if (isExpanded(nodeId)) {
    // 折叠：关闭当前节点
    setExpandedNodes(prev => prev.filter(id => id !== nodeId));
  } else {
    // 展开：关闭同层级的其他节点，打开当前节点
    const sameLevelNodes = getSameLevelNodes(nodeId);
    setExpandedNodes([nodeId]);  // 只保留当前节点
  }
}

// 示例:
// 初始：[1, 2] 都折叠
// 展开 1.1 → 折叠 1.2，展开 1.1
// 展开 2 → 折叠 1.1，展开 2
```

#### F2: 拖拽调整层级

```typescript
// 拖拽规则
const dragRules = {
  // 允许的操作
  allowDrop: (target: TaskNode, source: TaskNode) => {
    // 不能拖拽到自己内部
    if (isDescendant(target, source)) return false;
    // 不能循环依赖
    if (wouldCreateCycle(target, source)) return false;
    return true;
  },
  
  // 拖拽后的处理
  onDrop: (target: TaskNode, source: TaskNode, position: 'before' | 'after' | 'inside') => {
    // 更新 parentId
    // 更新 level
    // 重新计算序号
    // 触发 onChange 回调
  }
};
```

### 6.2 运行流程

```typescript
// 运行按钮点击处理
async function handleRun(nodeId: string) {
  const node = getNodeById(nodeId);
  
  // 1. 收集依赖节点的提示词
  const dependenciesContent = node.dependencies?.map(depId => {
    const depNode = getNodeById(depId);
    return depNode.content;
  }) || [];
  
  // 2. 调用 API
  const response = await runAPI({
    nodeId,
    content: node.content,
    dependenciesContent,
  });
  
  // 3. 更新状态
  updateNode(nodeId, { hasRun: true });
  
  // 4. 触发回调
  onNodeRun?.(nodeId, response);
  
  // 5. 显示结果卡片
  showResultCard(nodeId, response.result);
}
```

### 6.3 AI 优化流程

```typescript
// AI 优化按钮点击处理
async function handleOptimize(nodeId: string, instruction: string) {
  const node = getNodeById(nodeId);
  
  // 1. 调用 AI API
  const response = await optimizeAPI({
    content: node.content,
    instruction,
  });
  
  // 2. 显示思考过程 (流式)
  showThinkingProcess(response.thinkingProcess);
  
  // 3. 用户确认后替换原文
  if (userConfirm) {
    updateNode(nodeId, { content: response.optimizedContent });
  }
  
  // 4. 触发回调
  onNodeOptimize?.(nodeId, response);
}
```

### 6.4 锁定机制

```typescript
// 锁定按钮点击处理
function handleLock(nodeId: string) {
  const node = getNodeById(nodeId);
  
  // 检查是否运行过
  if (!node.hasRun) {
    showError('请先运行任务后再锁定！');
    return;
  }
  
  // 切换锁定状态
  updateNode(nodeId, { isLocked: !node.isLocked });
  
  // 触发回调
  onNodeLock?.(nodeId, !node.isLocked);
}
```

---

## 🎨 主题系统设计

### 7.1 CSS Variables 架构

```css
/* 基础变量 */
:root {
  /* 颜色 */
  --pe-color-primary: #667eea;
  --pe-color-success: #11998e;
  --pe-color-warning: #f57c00;
  --pe-color-error: #c62828;
  
  /* 间距 */
  --pe-spacing-xs: 4px;
  --pe-spacing-sm: 8px;
  --pe-spacing-md: 16px;
  --pe-spacing-lg: 24px;
  
  /* 圆角 */
  --pe-radius-sm: 4px;
  --pe-radius-md: 8px;
  --pe-radius-lg: 12px;
  
  /* 阴影 */
  --pe-shadow-sm: 0 2px 8px rgba(0,0,0,0.1);
  --pe-shadow-md: 0 4px 16px rgba(0,0,0,0.15);
}

/* 主题变量 */
[data-theme='default'] {
  --pe-bg-primary: #ffffff;
  --pe-bg-secondary: #f5f5f5;
  --pe-text-primary: #333333;
  --pe-border-color: #e0e0e0;
}

[data-theme='ant-design'] {
  --pe-bg-primary: #ffffff;
  --pe-bg-secondary: #fafafa;
  --pe-text-primary: #000000;
  --pe-border-color: #d9d9d9;
  --pe-color-primary: #1677ff;
}

[data-theme='shadcnui'] {
  --pe-bg-primary: #ffffff;
  --pe-bg-secondary: #f9fafb;
  --pe-text-primary: #09090b;
  --pe-border-color: #e4e4e7;
  --pe-color-primary: #18181b;
}
```

### 7.2 主题切换

```typescript
// 主题 Provider
interface ThemeProviderProps {
  theme: 'default' | 'ant-design' | 'shadcnui' | 'martainui';
  children: React.ReactNode;
}

function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <div data-theme={theme}>
      {children}
    </div>
  );
}
```

---

## 📦 打包和发布

### 8.1 构建配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true }),  // 生成类型声明
  ],
  
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'PromptEditor',
      fileName: (format) => `prompt-editor.${format}.js`,
    },
    
    rollupOptions: {
      external: ['react', 'react-dom', 'monaco-editor'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
```

### 8.2 Monaco Editor 加载策略

**双模式支持**:

**模式 A: CDN 加载 (默认)**
```typescript
// 优点：包体积最小 (~0KB)，利用浏览器缓存
// 缺点：需要网络连接

loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
  },
});

// 支持自定义 CDN
loader.config({
  paths: {
    vs: config.cdnUrl || 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs',
  },
});
```

**模式 B: 本地构建**
```typescript
// 优点：离线可用，加载速度可控
// 缺点：包体积增加 (~500KB-2MB)

// Vite 配置
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import markdownWorker from 'monaco-editor/esm/vs/language/markdown/markdown.worker?worker';

// 只加载需要的语言和 worker
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'markdown') return new markdownWorker();
    if (label === 'json') return new jsonWorker();
    return new editorWorker();
  },
};
```

**按需加载优化**:
```typescript
// 1. 语言按需加载
const languages = ['markdown'];  // 只加载 markdown

// 2. 主题按需加载
const themes = ['vs', 'vs-dark'];  // 只加载需要的主题

// 3. Worker 按需注册
// 只注册使用到的 worker
```

**包体积对比**:
```
CDN 模式:
- 核心库：~50KB (gzip)
- Monaco Editor: 0KB (CDN 加载)
- 总计：~50KB

本地模式:
- 核心库：~50KB (gzip)
- Monaco Editor (markdown only): ~500KB (gzip)
- 总计：~550KB
```

### 8.3 包体积优化

**目标**: 
- CDN 模式：< 100KB (gzip)
- 本地模式：< 600KB (gzip)
- 支持 Tree Shaking
- 支持 2000+ 节点 @ 60fps

**策略**:
1. ES Modules 输出
2. 外部化 React/Monaco
3. 组件独立导出
4. 样式分离
5. Ant Design X 作为 peerDependencies (用户可选安装)
6. 虚拟滚动按需加载
7. Monaco Editor 懒加载

**依赖策略**:
```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "react-arborist": "^3.4.0",
    "react-virtuoso": "^4.6.0",
    "@monaco-editor/react": "^4.6.0"
  },
  "peerDependencies": {
    "antd-x": ">=1.0.0"
  },
  "peerDependenciesMeta": {
    "antd-x": {
      "optional": true
    }
  }
}
```

如果用户未安装 `antd-x`，则降级为简单的文本展示。

### 8.4 性能优化策略

**目标**: 支持 2000+ 节点 @ 60fps

**优化组合拳**:

**1. 虚拟滚动 (react-virtuoso)**
```typescript
import { Virtuoso } from 'react-virtuoso';

// 只渲染可见区域的节点
<Virtuoso
  data={visibleNodes}
  itemContent={(index, node) => (
    <TreeNode key={node.id} node={node} />
  )}
  style={{ height: 600 }}
/>
```

**2. Monaco Editor 懒加载**
```typescript
// 仅在节点展开或聚焦时加载编辑器
const [editorLoaded, setEditorLoaded] = useState(false);

useEffect(() => {
  if (isExpanded || isFocused) {
    setEditorLoaded(true);
  }
}, [isExpanded, isFocused]);

return editorLoaded ? <MonacoEditor /> : <Placeholder />;
```

**3. 编辑器内容虚拟化**
```typescript
// Monaco Editor 内置虚拟化
// 只渲染可见行的内容
editorOptions={{
  lineNumbers: 'off',
  folding: false,
  scrollBeyondLastLine: false,
}}
```

**4. React 性能优化**
```typescript
// 使用 React.memo 避免不必要的重渲染
const MemoizedTreeNode = React.memo(TreeNode);

// 使用 useMemo 缓存计算结果
const visibleNodes = useMemo(() => {
  return filterVisibleNodes(tree, expandedNodes);
}, [tree, expandedNodes]);

// 使用 useCallback 缓存回调函数
const handleToggle = useCallback((nodeId) => {
  // ...
}, []);
```

**5. 分层渲染策略**
```typescript
// 树形结构：轻量级 DOM
// 编辑器：按需加载的 Monaco
// 结果卡片：Bubble.List (流式更新)
```

**性能指标**:
```
场景                    目标 FPS    优化手段
--------------------------------------------------
初始加载 (2000 节点)     60fps      虚拟滚动
展开/折叠               60fps      memo + 懒加载
编辑内容                60fps      编辑器虚拟化
拖拽操作                60fps      硬件加速
运行结果 (流式)         60fps      requestAnimationFrame
```

---

## 🧪 测试策略

### 9.1 Storybook 故事

```typescript
// PromptEditor.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { PromptEditor } from './PromptEditor';

const meta = {
  title: 'Components/PromptEditor',
  component: PromptEditor,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'select',
      options: ['default', 'ant-design', 'shadcnui'],
    },
  },
} satisfies Meta<typeof PromptEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// 基础用法
export const Default: Story = {
  args: {
    initialValue: [
      {
        id: '1',
        title: '收入波动分析',
        content: '# 分析需求\n...',
        level: 1,
        isLocked: false,
        hasRun: false,
      },
    ],
  },
};

// 多主题展示
export const WithThemes: Story = {
  render: () => (
    <div>
      <h2>Default Theme</h2>
      <PromptEditor theme="default" />
      <h2>Ant Design Theme</h2>
      <PromptEditor theme="ant-design" />
      <h2>ShadcnUI Theme</h2>
      <PromptEditor theme="shadcnui" />
    </div>
  ),
};

// 拖拽演示
export const DragAndDrop: Story = {
  args: {
    initialValue: complexTreeData,
  },
};

// AI 优化演示
export const AIOptimization: Story = {
  args: {
    optimizeAPI: mockOptimizeAPI,
  },
};
```

### 9.2 单元测试

```typescript
// useTreeState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTreeState } from './useTreeState';

describe('useTreeState', () => {
  it('should generate correct node numbers', () => {
    const { result } = renderHook(() => useTreeState(initialTree));
    
    expect(result.current.getNumber('1-1')).toBe('1.1');
    expect(result.current.getNumber('1-1-1')).toBe('1.1.1');
  });
  
  it('should handle mutual exclusive expand', () => {
    const { result } = renderHook(() => useTreeState(initialTree));
    
    act(() => {
      result.current.toggleExpand('1-1');
    });
    
    expect(result.current.expandedNodes).toEqual(['1-1']);
  });
});
```

---

## 📋 开发计划

### Phase 1: React 核心功能 + 默认主题 (v1.0) - 10 周

**Week 1-2**: 基础架构
- [ ] 项目初始化 (Vite + TypeScript)
- [ ] Storybook 配置
- [ ] 目录结构搭建
- [ ] 基础类型定义
- [ ] 依赖配置 (react-arborist, monaco-editor)

**Week 3-4**: 树形结构 + 虚拟滚动
- [ ] react-arborist 集成
- [ ] react-virtuoso 虚拟滚动集成
- [ ] 拖拽功能实现
- [ ] 序号生成算法
- [ ] 互斥展开逻辑
- [ ] 节点增删功能
- [ ] 性能测试 (1000 节点基准)

**Week 5-6**: 编辑器集成 + 性能优化
- [ ] Monaco Editor 按需引入
- [ ] CDN/本地双模式支持
- [ ] 编辑器包装器组件
- [ ] Markdown 语法支持
- [ ] 高度自适应
- [ ] 编辑器懒加载
- [ ] 编辑器性能优化
- [ ] 性能测试 (500 节点编辑)

**Week 7-8**: 核心功能
- [ ] 运行按钮和 API 集成
- [ ] AI 优化对话框
- [ ] 锁定机制 (运行后才能锁定)
- [ ] 依赖管理
- [ ] 状态管理 hooks

**Week 9**: 运行结果展示
- [ ] Ant Design X Bubble 集成
- [ ] 流式结果显示
- [ ] 打字动画效果
- [ ] 自定义结果组件支持
- [ ] Bubble 配置透传

**Week 10**: 默认主题完善 + 性能测试
- [ ] 默认主题样式优化
- [ ] Storybook 故事编写
- [ ] 单元测试
- [ ] API 文档
- [ ] 使用指南
- [ ] 性能基准测试 (2000 节点 @ 60fps)
- [ ] 性能优化调优

### Phase 2: Ant Design 主题适配 (v1.1) - 2 周

- [ ] Ant Design Token 集成
- [ ] Ant Design X Bubble 深度使用
- [ ] 主题变量对齐 Ant Design
- [ ] 组件样式 Ant Design 化
- [ ] Storybook 主题演示

### Phase 3: Vue 3 适配 (v1.2) - 3 周

- [ ] Composition API 重写
- [ ] Vue 3 响应式系统
- [ ] 跨框架工具函数提取
- [ ] Vue 3 Storybook 配置

### Phase 4: Vue 2 适配 (v1.3) - 3 周

- [ ] Options API 适配
- [ ] Vue 2 兼容性处理
- [ ] Polyfill 配置
- [ ] Vue 2 文档

### Phase 5: 主题扩展 (v2.0) - 4 周

- [ ] ShadcnUI 主题
- [ ] MartainUI 主题
- [ ] 主题切换优化
- [ ] 主题文档

---

## 🔧 API 参考

### 10.1 主组件 API

```typescript
<PromptEditor
  // 数据
  initialValue={initialData}
  onChange={handleChange}
  
  // API
  runAPI={handleRunAPI}
  optimizeAPI={handleOptimizeAPI}
  
  // 事件
  onNodeRun={handleNodeRun}
  onNodeOptimize={handleNodeOptimize}
  onNodeLock={handleNodeLock}
  
  // 主题
  theme="default"
  
  // 样式
  className="custom-class"
  style={{ height: '600px' }}
/>
```

### 10.2 工具函数 API

```typescript
import { 
  generateNodeNumber,      // 生成序号
  getParentNode,           // 获取父节点
  getChildren,             // 获取子节点
  flattenTree,             // 扁平化树
  buildTree,               // 构建树
} from 'prompt-editor/utils';
```

---

## 📝 使用示例

### 11.1 基础用法

```tsx
import { PromptEditor } from 'prompt-editor';
import 'prompt-editor/style.css';

function App() {
  const initialValue = [
    {
      id: '1',
      title: '收入分析',
      content: '# 分析需求\n请分析...',
      level: 1,
      isLocked: false,
      hasRun: false,
    },
  ];
  
  return (
    <PromptEditor
      initialValue={initialValue}
      runAPI={async (req) => {
        const res = await fetch('/api/run', {
          method: 'POST',
          body: JSON.stringify(req),
        });
        return res.json();
      }}
      optimizeAPI={async (req) => {
        const res = await fetch('/api/optimize', {
          method: 'POST',
          body: JSON.stringify(req),
        });
        return res.json();
      }}
      // 运行结果配置 (可选)
      runResultConfig={{
        bubbleProps: {
          typing: { effect: 'typing', step: 1, interval: 50 },
          streaming: true,
          variant: 'filled',
        }
      }}
    />
  );
}
```

### 11.2 受控模式

```tsx
function ControlledEditor() {
  const [value, setValue] = useState<TaskNode[]>(initialData);
  
  return (
    <PromptEditor
      value={value}
      onChange={setValue}
      onTreeChange={(tree) => {
        console.log('Tree changed:', tree);
      }}
    />
  );
}
```

### 11.3 自定义运行结果组件

```tsx
import { Bubble } from 'antd-x';

function CustomResultCard({ nodeId, result, isStreaming }: any) {
  return (
    <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5' }}>
      <h4>运行结果:</h4>
      <Bubble
        content={result}
        loading={isStreaming}
        typing={isStreaming}
      />
    </div>
  );
}

function CustomResultExample() {
  return (
    <PromptEditor
      initialValue={initialValue}
      runResultConfig={{
        resultComponent: CustomResultCard,
        className: 'custom-result',
      }}
    />
  );
}
```

### 11.4 主题切换

```tsx
function ThemedEditor() {
  const [theme, setTheme] = useState('default');
  
  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="default">Default</option>
        <option value="ant-design">Ant Design</option>
        <option value="shadcnui">ShadcnUI</option>
      </select>
      <PromptEditor theme={theme} />
    </div>
  );
}
```

---

## ⚠️ 注意事项

### 12.1 Monaco Editor 集成

- 使用 CDN 加载可减少包体积，但需要网络连接
- 本地打包需配置 worker 加载
- 建议按需加载语言支持

### 12.2 性能优化

**虚拟滚动**:
- 使用 react-virtuoso 实现虚拟滚动
- 只渲染可见区域的节点
- 支持 2000+ 节点 @ 60fps

**Monaco Editor 懒加载**:
- 仅在节点展开或聚焦时加载编辑器
- 减少初始加载时间
- 降低内存占用

**编辑器虚拟化**:
- Monaco Editor 内置行虚拟化
- 只渲染可见行的内容
- 优化大文件编辑性能

**React 优化**:
- 使用 React.memo 避免不必要的重渲染
- 使用 useMemo 缓存计算结果
- 使用 useCallback 缓存回调函数

### 12.3 浏览器兼容性

- React 18+: Chrome 90+, Firefox 90+, Safari 14+
- Vue 3: 同 React
- Vue 2: IE 11+ (需 polyfill)

---

## 📚 参考资料

- [react-arboris 文档](https://github.com/brimdata/react-arborist)
- [Monaco Editor 文档](https://microsoft.github.io/monaco-editor/)
- [Storybook 文档](https://storybook.js.org/docs)
- [Vite 库模式](https://vitejs.dev/guide/build.html#library-mode)

---

**评审状态**: 待评审  
**评审人**: @yuanyuan  
**评审日期**: TBD
