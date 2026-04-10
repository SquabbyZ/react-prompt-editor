# AI 优化替换功能改进设计

## 背景

当前 AI 优化弹窗的替换功能存在以下问题：
1. 替换按钮在底部，只处理最后一条 AI 消息
2. 无法区分多轮对话中的不同 AI 回复
3. 无法精准替换 AI 回复中的部分内容

## 目标

1. 将替换按钮移到每个 AI 气泡内部
2. 支持整段替换（一键替换完整 AI 回复）
3. 支持选中替换（手动选择部分内容进行精准替换）
4. 支持 Ctrl/Cmd 多段选中拼接替换

## 功能设计

### 1. 整段替换

**交互流程**：
1. 每个 AI 气泡的点赞/点踩图标后，显示"替换"图标按钮
2. 点击替换按钮
3. 直接用该 AI 回复的完整内容替换原始选中的文本
4. 替换成功后，弹窗自动关闭
5. Message 提示"已替换成功"

**图标设计**：
- 使用 Ant Design 的 `SwapOutlined` 或 `CheckOutlined` 图标
- 与其他操作图标（复制、重新生成、点赞、点踩）保持样式一致

### 2. 选中替换

**交互流程**：
1. 用户在 AI 气泡内用鼠标拖选文本
2. 松开鼠标后，选区上方弹出浮窗，显示"替换"按钮
3. 点击浮窗的"替换"按钮
4. 用选中的文本替换原始选中的文本
5. 替换成功后，弹窗自动关闭
6. Message 提示"已替换成功"

**多段选中**：
1. 用户按住 Ctrl/Cmd 键
2. 多次拖选不同的文本片段
3. 每次选中结束后，浮窗更新显示"替换"按钮
4. 不显示选中了几段
5. 多段文本拼接时用换行符分隔
6. 点击替换后，拼接后的内容替换原文

**浮窗样式**：
- 类似微信的引用浮窗
- 出现在选区上方
- 简洁设计，只有一个"替换"按钮
- 选区消失后，浮窗也消失

### 3. 底部替换按钮处理

- 移除 MessageInput 底部的"替换"按钮
- 或者保留但标记为"替换最新回复"（与气泡内替换功能区分）

## 技术方案

### 组件结构

```
AIOptimizeModal
├── MessageList
│   ├── Bubble.List
│   │   └── MessageItem (每个气泡)
│   │       ├── MarkdownRenderer
│   │       ├── SelectionToolbar (选区浮窗)
│   │       └── ActionsBar (操作按钮栏)
│   │           ├── CopyButton
│   │           ├── RegenerateButton
│   │           ├── LikeButton
│   │           ├── DislikeButton
│   │           └── ReplaceButton (新增：整段替换)
│   └── SelectedContentDisplay
└── MessageInput
    ├── InputArea
    └── ActionButtons (移除 ReplaceButton)
```

### 状态管理

在 `useOptimizeLogic` 中新增选区状态：

```typescript
interface SelectionState {
  selectedTexts: string[];        // 选中的文本片段（支持多段）
  selectionRanges: Range[];       // 选区位置信息
  toolbarPosition: {              // 浮窗位置
    top: number;
    left: number;
  } | null;
  isMultiSelect: boolean;         // 是否多段选中
}
```

### 核心逻辑

#### 1. 整段替换

```typescript
const handleFullReplace = (messageId: string, content: string) => {
  // 调用 onApply 回调，传入完整的 AI 回复内容
  onApply(content);
  message.success(t('optimize.contentApplied'));
  onClose(); // 自动关闭弹窗
};
```

#### 2. 选区监听

```typescript
const handleMouseUp = (e: MouseEvent) => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    hideToolbar();
    return;
  }

  const selectedText = selection.toString();
  
  if (e.ctrlKey || e.metaKey) {
    // 多段选中：添加到数组
    setSelectedTexts(prev => [...prev, selectedText]);
  } else {
    // 单段选中：替换之前的选区
    setSelectedTexts([selectedText]);
  }
  
  // 计算浮窗位置
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  setToolbarPosition({
    top: rect.top,
    left: rect.left + rect.width / 2
  });
};
```

#### 3. 多段拼接替换

```typescript
const handleSelectionReplace = () => {
  // 拼接多段文本，用换行符分隔
  const combinedText = selectedTexts.join('\n');
  onApply(combinedText);
  message.success(t('optimize.contentApplied'));
  onClose();
};
```

### 关键实现细节

#### SelectionToolbar 组件

```typescript
interface SelectionToolbarProps {
  visible: boolean;
  position: { top: number; left: number };
  onReplace: () => void;
}

const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
  visible,
  position,
  onReplace
}) => {
  if (!visible) return null;
  
  return (
    <div
      className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-lg px-3 py-2"
      style={{
        top: position.top - 40,
        left: position.left,
        transform: 'translateX(-50%)'
      }}
    >
      <Button
        type="text"
        size="small"
        icon={<SwapOutlined />}
        onClick={onReplace}
        className="text-white hover:text-indigo-300"
      >
        替换
      </Button>
    </div>
  );
};
```

#### 选区事件处理

需要在每个 AI 气泡的根容器上监听鼠标事件：

```typescript
const MessageBubble: React.FC = () => {
  const bubbleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = bubbleRef.current;
    if (!element) return;
    
    const handleMouseUp = (e: MouseEvent) => {
      // 处理选区逻辑
    };
    
    const handleClickOutside = (e: MouseEvent) => {
      // 点击气泡外部，清除选区
    };
    
    element.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      element.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <div ref={bubbleRef} className="relative">
      <MarkdownRenderer content={content} />
      <SelectionToolbar ... />
    </div>
  );
};
```

### 数据流

```
用户操作
  ↓
[整段替换] 点击气泡内的替换按钮
  ↓
handleFullReplace(messageId, fullContent)
  ↓
onApply(fullContent) → 通知父组件
  ↓
弹窗关闭 + Message 提示

[选中替换] 选中文本 → 点击浮窗替换按钮
  ↓
handleSelectionReplace()
  ↓
拼接多段文本（如果有）
  ↓
onApply(combinedText) → 通知父组件
  ↓
弹窗关闭 + Message 提示
```

## 错误处理

1. **无选区时点击替换**：提示"请先选择要替换的内容"
2. **替换失败**：Message 提示"替换失败，请重试"
3. **选区被清除**：浮窗自动消失
4. **多段选中冲突**：如果用户在气泡外选中文本，清除选区

## 测试场景

1. ✅ 单段整段替换
2. ✅ 多轮对话中替换任意一条 AI 回复
3. ✅ 单段选中替换
4. ✅ 多段选中替换（Ctrl/Cmd）
5. ✅ 替换后弹窗自动关闭
6. ✅ 浮窗定位准确性
7. ✅ 选区消失后浮窗消失
8. ✅ 跨气泡选区处理（只允许在单个气泡内选中）

## 依赖

- Ant Design Icons: `SwapOutlined` 或 `CheckOutlined`
- 无新增第三方依赖

## 实施步骤

1. 在 `useOptimizeLogic` 中添加选区状态管理
2. 创建 `SelectionToolbar` 组件
3. 修改 `renderMessageContent` 添加整段替换按钮
4. 移除 `MessageInput` 底部的替换按钮
5. 集成选区事件处理逻辑
6. 测试所有替换模式
