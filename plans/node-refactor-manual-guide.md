# Node.tsx 手动重构完整指南

## 📊 当前状态

- **原始文件**: 897行
- **目标文件**: ~400行
- **需要减少**: ~497行 (55%)

## ✅ 已准备好的组件和 Hooks

以下文件已经创建完成，可以直接在 Node.tsx 中使用：

### 1. DependencyConfigSection.tsx (206行)

**位置**: `/src/components/PromptEditor/DependencyConfigSection.tsx`  
**功能**: 依赖任务配置区域  
**Props**:

```typescript
interface DependencyConfigSectionProps {
  nodeId: string;
  dependencies: string[];
  onUpdateDependencies: (id: string, deps: string[]) => void;
  getNodeNumber: (id: string) => string;
  availableNodes: Array<{...}>;
}
```

### 2. EditableTitle.tsx (188行)

**位置**: `/src/components/PromptEditor/EditableTitle.tsx`  
**功能**: 可编辑的标题组件（包含三角按钮、序号、状态标签）  
**Props**:

```typescript
interface EditableTitleProps {
  title: string;
  isLocked: boolean;
  nodeNumber: string;
  isInternal: boolean;
  isChildrenExpanded: boolean;
  hasRun: boolean;
  onToggleChildren: () => void;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}
```

### 3. EditorToolbar.tsx (80行)

**位置**: `/src/components/PromptEditor/EditorToolbar.tsx`  
**功能**: 编辑器右上角工具栏（撤回/还原/历史按钮）  
**Props**:

```typescript
interface EditorToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: (e: React.MouseEvent) => void;
  onRedo: (e: React.MouseEvent) => void;
  onShowHistory: () => void;
}
```

### 4. useNodeEditor.ts (124行)

**位置**: `/src/hooks/useNodeEditor.ts`  
**功能**: 管理 Undo/Redo 状态和内容同步  
**返回值**:

```typescript
{
  editorRef,
  canUndo,
  canRedo,
  handleUndo,
  handleRedo,
  handleContentChange,
}
```

---

## 🔧 重构步骤（按顺序执行）

### 步骤 1: 更新导入语句

**找到** (第1-24行):

```typescript
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { redo, undo } from '@codemirror/commands';
import {
  Button,
  Input,
  message,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  TreeSelect,
} from 'antd';
import { Clock, Redo2, Undo2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from '../../hooks/useHistory';
import {
  OptimizeRequest,
  OptimizeResponse,
  TaskNodeMinimal,
} from '../../types';
import { AIOptimizeModal } from '../AIOptimizeModal/AIOptimizeModal';
import { CodeMirrorEditor } from '../CodeMirrorEditor';
import { HistoryPanel } from '../HistoryPanel/HistoryPanel';
import { HistoryItem } from '../HistoryPanel/HistoryPanel.types';
```

**替换为**:

```typescript
import {
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UnlockOutlined,
} from '@ant-design/icons';
import { Button, message, Popconfirm, Tooltip } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import {
  OptimizeRequest,
  OptimizeResponse,
  TaskNodeMinimal,
} from '../../types';
import { AIOptimizeModal } from '../AIOptimizeModal/AIOptimizeModal';
import { CodeMirrorEditor } from '../CodeMirrorEditor';
import { DependencyConfigSection } from './DependencyConfigSection';
import { EditableTitle } from './EditableTitle';
import { EditorToolbar } from './EditorToolbar';
import { useNodeEditor } from '../../hooks/useNodeEditor';
```

**删除的行数**: ~30行

---

### 步骤 2: 删除 DependencyConfigSection 内联定义

**找到** (第27-221行，约195行):

```typescript
// 依赖配置组件
interface DependencyConfigSectionProps {
  nodeId: string;
  dependencies: string[];
  // ... 整个组件定义
}

const DependencyConfigSection: React.FC<DependencyConfigSectionProps> = (
  {
    // ... 组件实现
  },
) => {
  // ...
};
```

**删除**: 整个 DependencyConfigSection 的定义（从注释到组件结束）

**删除的行数**: ~195行

---

### 步骤 3: 使用 useNodeEditor Hook

**找到** (约第300-400行，包括):

```typescript
// 撤回和还原状态
const [canUndo, setCanUndo] = useState(false);
const [canRedo, setCanRedo] = useState(false);
const hasUserEdited = useRef(false);
const lastExternalContent = useRef(nodeData.content);
const isUpdatingFromUser = useRef(false);
const isUndoRedoOperation = useRef(false);

// 历史记录管理
const historyManager = useHistory({ maxHistory: 50, debounceTime: 1000 });
const [historyPanelVisible, setHistoryPanelVisible] = useState(false);
const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

// 同步外部内容变化
useEffect(() => {
  // ... 约20行
}, [nodeData.content]);

// 撤回操作
const handleUndo = (e: React.MouseEvent) => {
  // ... 约30行
};

// 还原操作
const handleRedo = (e: React.MouseEvent) => {
  // ... 约30行
};

const handleContentChange = (content: string) => {
  // ... 约20行
};
```

**替换为**:

```typescript
// 编辑器状态管理（Undo/Redo）
const {
  editorRef,
  canUndo,
  canRedo,
  handleUndo,
  handleRedo,
  handleContentChange,
} = useNodeEditor({
  nodeId: nodeData.id,
  initialContent: nodeData.content,
  onContentChange,
});
```

**删除的行数**: ~120行

---

### 步骤 4: 提取标题编辑逻辑到 EditableTitle 组件

**找到** (约第450-560行，节点头部中的标题部分):

```typescript
<div className="flex min-w-0 flex-1 items-center gap-2">
  {/* 三角按钮 */}
  {isInternal ? (
    <button ...>
      <span>▼</span>
    </button>
  ) : (
    <span className="..." />
  )}

  {/* 节点序号和标题 */}
  <span className="...">
    <Tag color="default" className="px-1 text-xs">
      {getNodeNumber(nodeData.id)}
    </Tag>
    {isEditingTitle ? (
      <Input
        ref={titleInputRef}
        value={titleValue}
        onChange={(e) => setTitleValue(e.target.value)}
        onBlur={handleSaveTitle}
        onKeyDown={handleTitleKeyDown}
        onClick={(e) => e.stopPropagation()}
        size="small"
        autoFocus
      />
    ) : (
      <span
        className="..."
        onClick={handleTitleClick}
        onDoubleClick={handleStartEditTitle}
        title={nodeData.title}
      >
        {nodeData.title}
      </span>
    )}
  </span>

  {/* 状态图标 */}
  {nodeData.isLocked && (
    <Tooltip title="已锁定">
      <LockOutlined style={{ fontSize: 12, color: '#faad14' }} />
    </Tooltip>
  )}
  {!nodeData.hasRun && (
    <Tag color="default" title="未运行" style={{ fontSize: 10 }}>
      未运行
    </Tag>
  )}
</div>
```

**替换为**:

```typescript
<EditableTitle
  title={nodeData.title}
  isLocked={nodeData.isLocked}
  nodeNumber={getNodeNumber(nodeData.id)}
  isInternal={isInternal}
  isChildrenExpanded={isChildrenExpanded}
  hasRun={nodeData.hasRun}
  onToggleChildren={() => onToggleChildren(nodeData.id)}
  onSave={(newTitle) => {
    onUpdateTitle(nodeData.id, newTitle);

    // 同步更新编辑器内容中的标题
    const currentContent = nodeData.content;
    const lines = currentContent.split('\n');

    if (lines.length > 0 && lines[0].startsWith('#')) {
      const match = lines[0].match(/^(#+)\s*/);
      if (match) {
        const level = match[1];
        lines[0] = `${level} ${newTitle}`;
        const newContent = lines.join('\n');
        handleContentChange(newContent);
      }
    } else {
      const newContent = `# ${newTitle}\n${currentContent}`;
      handleContentChange(newContent);
    }
    message.success('标题修改成功');
  }}
  onCancel={() => message.info('已取消编辑')}
/>
```

**同时删除**相关的状态和处理函数:

```typescript
// 删除这些（约60行）
const [isEditingTitle, setIsEditingTitle] = React.useState(false);
const [titleValue, setTitleValue] = React.useState(nodeData.title);
const titleInputRef = React.useRef<any>(null);
const clickTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

useEffect(() => {
  if (isEditingTitle && titleInputRef.current) {
    titleInputRef.current.focus();
    titleInputRef.current.select();
  }
  return () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
  };
}, [isEditingTitle]);

const handleStartEditTitle = (e: React.MouseEvent) => { ... };
const handleTitleClick = (e: React.MouseEvent) => { ... };
const handleSaveTitle = () => { ... };
const handleCancelEditTitle = () => { ... };
const handleTitleKeyDown = (e: React.KeyboardEvent) => { ... };
```

**删除的行数**: ~110行

---

### 步骤 5: 使用 EditorToolbar 组件

**找到** (编辑器区域内的工具栏，约50行):

```typescript
{/* 右上角撤回/还原按钮 */}
<div className="absolute right-2 top-2 z-10 flex items-center gap-1 ...">
  <Tooltip title="撤回">
    <button onClick={handleUndo} disabled={!canUndo} ...>
      <Undo2 size={16} strokeWidth={2} />
    </button>
  </Tooltip>
  <Tooltip title="还原">
    <button onClick={handleRedo} disabled={!canRedo} ...>
      <Redo2 size={16} strokeWidth={2} />
    </button>
  </Tooltip>
  <Tooltip title="历史记录">
    <button onClick={() => setHistoryPanelVisible(true)} ...>
      <Clock size={16} strokeWidth={2} />
    </button>
  </Tooltip>
</div>
```

**替换为**:

```typescript
<EditorToolbar
  canUndo={canUndo}
  canRedo={canRedo}
  onUndo={handleUndo}
  onRedo={handleRedo}
  onShowHistory={() => {
    // 如果后续需要历史记录功能，在这里添加
    console.log('显示历史记录');
  }}
/>
```

**删除的行数**: ~25行

---

### 步骤 6: 使用 DependencyConfigSection 组件

**找到** (编辑器区域内的依赖配置，约30行):

```typescript
{/* 依赖任务配置区域 */}
<div className="border-t border-indigo-200 bg-indigo-50/50 px-3 py-2 ...">
  {/* 复杂的依赖配置逻辑 */}
  ...
</div>
```

**替换为**:

```typescript
<DependencyConfigSection
  nodeId={nodeData.id}
  dependencies={nodeData.dependencies}
  onUpdateDependencies={onUpdateDependencies}
  getNodeNumber={getNodeNumber}
  availableNodes={availableNodes}
/>
```

**删除的行数**: ~30行（已经在步骤2中删除了组件定义，这里是删除使用处的旧代码）

---

### 步骤 7: 用 useCallback 包裹事件处理函数

**找到所有事件处理函数**，用 `useCallback` 包裹：

```typescript
// 修改前
const handleToggleEditor = (e: React.MouseEvent) => {
  e.stopPropagation();
  onToggleEditor(nodeData.id);
};

// 修改后
const handleToggleEditor = useCallback(
  (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleEditor(nodeData.id);
  },
  [nodeData.id, onToggleEditor],
);
```

需要包裹的函数：

- `handleToggleEditor`
- `handleDelete`
- `handleLock`
- `handleAddChild`
- `handleRun`
- `handleOptimize`

**预计减少**: 0行（只是优化，不减少行数）

---

### 步骤 8: 添加 React.memo

**找到** (组件导出):

```typescript
export const Node: React.FC<CustomNodeProps> = (
  {
    // ...
  },
) => {
  // ...
};
```

**替换为**:

```typescript
export const Node: React.FC<CustomNodeProps> = React.memo(
  (
    {
      // ...
    },
  ) => {
    // ...
  },
);

Node.displayName = 'Node';
```

**预计减少**: 0行（只是优化）

---

## 📊 预期效果总结

| 步骤     | 操作                         | 减少行数 | 累计减少        |
| -------- | ---------------------------- | -------- | --------------- |
| 1        | 更新导入                     | 30       | 30              |
| 2        | 删除 DependencyConfigSection | 195      | 225             |
| 3        | 使用 useNodeEditor           | 120      | 345             |
| 4        | 使用 EditableTitle           | 110      | 455             |
| 5        | 使用 EditorToolbar           | 25       | 480             |
| 6        | 使用 DependencyConfigSection | 30       | 510             |
| 7-8      | useCallback + memo           | 0        | 510             |
| **最终** |                              | **~510** | **从897→387行** |

---

## ⚠️ 注意事项

### 1. 逐步测试

每完成一个步骤后，运行以下命令测试：

```bash
pnpm dev
```

确保：

- 没有 TypeScript 错误
- 页面正常渲染
- 所有功能正常工作

### 2. 备份原文件

开始前先备份：

```bash
cp src/components/PromptEditor/Node.tsx src/components/PromptEditor/Node.tsx.backup
```

### 3. Git 提交点

建议每个步骤完成后提交一次：

```bash
git add src/components/PromptEditor/Node.tsx
git commit -m "refactor: 步骤X - [描述]"
```

### 4. 如果出错

如果某一步出现错误，可以回滚：

```bash
git checkout HEAD -- src/components/PromptEditor/Node.tsx
```

然后重新执行该步骤。

---

## 🎯 验证清单

重构完成后，验证以下功能：

- [ ] 节点可以正常展开/折叠
- [ ] 标题可以双击编辑
- [ ] 标题编辑后同步更新 Markdown 内容
- [ ] 子节点可以添加/删除
- [ ] 编辑器可以展开/折叠（互斥）
- [ ] Undo/Redo 按钮正常工作
- [ ] 依赖配置可以添加/删除
- [ ] 运行按钮点击后状态正确更新
- [ ] AI 优化弹窗正常打开
- [ ] 锁定/解锁功能正常

---

## 📝 示例代码片段

### 完整的简化版 Node 组件结构

```typescript
export const Node: React.FC<CustomNodeProps> = React.memo(
  ({
    node,
    style,
    dragHandle,
    onContentChange,
    onNodeRun,
    onNodeLock,
    onDelete,
    onAddChild,
    onUpdateTitle,
    onUpdateDependencies,
    getNodeNumber,
    expandedEditorId,
    onToggleEditor,
    expandedNodes,
    onToggleChildren,
    availableNodes,
    onOptimizeRequest,
    onNodeOptimize,
    onLike,
    onDislike,
  }) => {
    const nodeData = node.data;
    const isInternal = nodeData.children.length > 0;
    const isEditorExpanded = expandedEditorId === nodeData.id;
    const isChildrenExpanded = expandedNodes.has(nodeData.id);

    // AI 优化相关状态
    const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);
    const [selectedContent, setSelectedContent] = useState<string>();
    const [selectedRange, setSelectedRange] = useState<{
      from: number;
      to: number;
    } | null>(null);
    const optimizeRequestRef = useRef<OptimizeRequest | null>(null);

    // 编辑器状态管理
    const {
      editorRef,
      canUndo,
      canRedo,
      handleUndo,
      handleRedo,
      handleContentChange,
    } = useNodeEditor({
      nodeId: nodeData.id,
      initialContent: nodeData.content,
      onContentChange,
    });

    // 事件处理函数（用 useCallback 包裹）
    const handleToggleEditor = useCallback(...);
    const handleDelete = useCallback(...);
    const handleLock = useCallback(...);
    const handleAddChild = useCallback(...);
    const handleRun = useCallback(...);
    const handleOptimize = useCallback(...);

    return (
      <div className="arborist-node group mb-1" style={style} ref={dragHandle}>
        <div className="relative flex w-full flex-col transition-all">
          <div className="flex flex-col gap-2">
            {/* 节点头部 */}
            <div className="relative flex ...">
              {/* 使用 EditableTitle 组件 */}
              <EditableTitle ... />

              {/* 操作按钮 */}
              <div className="...">
                <Button onClick={handleToggleEditor}>编辑</Button>
                <Button onClick={handleAddChild}>子标题</Button>
                <Button onClick={handleLock}>锁定</Button>
                <Popconfirm onConfirm={handleDelete}>
                  <Button danger>删除</Button>
                </Popconfirm>
              </div>
            </div>

            {/* 编辑器区域 */}
            {isEditorExpanded && (
              <div className="relative ...">
                {/* 使用 EditorToolbar 组件 */}
                <EditorToolbar ... />

                <CodeMirrorEditor
                  ref={editorRef}
                  value={nodeData.content}
                  onChange={handleContentChange}
                  isReadOnly={nodeData.isLocked}
                />

                {/* 使用 DependencyConfigSection 组件 */}
                <DependencyConfigSection ... />

                {/* 底部按钮 */}
                <div className="...">
                  <Button onClick={handleRun}>运行</Button>
                  <Button onClick={handleOptimize}>AI 优化</Button>
                </div>

                {/* AI 优化弹窗 */}
                {optimizeModalOpen && <AIOptimizeModal ... />}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);

Node.displayName = 'Node';
```

---

## 🚀 开始重构

现在你可以按照上述步骤逐步重构 Node.tsx 文件了。记住：

1. **一步一步来**，不要一次性完成所有步骤
2. **每步测试**，确保功能正常
3. **及时提交**，方便回滚
4. **遇到问题**，随时查阅本指南

祝你重构顺利！🎉
