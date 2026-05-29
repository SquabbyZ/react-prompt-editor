# QA Test Cases: fix-title-codemirror-sync
**Date:** 2026-05-29
**Session:** 2026-05-29-session-36c217

## Summary

Bugfix verification: 标题修改时不应同步到 CodeMirror 编辑器内容区。

## Test Cases

### Test Case 1: 修改节点头部标题不污染 CodeMirror 内容
- **Category:** integration
- **Target:** src/components/PromptEditor/EditableTitle.tsx
- **Acceptance:** A1, A2
- **Preconditions:** PromptEditor 组件已渲染，包含至少一个节点
- **Steps:**
  1. 双击节点头部标题进入编辑模式
  2. 修改标题文本（例如从 "新标题" 改为 "我的自定义标题"）
  3. 按 Enter 确认
  4. 点击该节点的编辑器区域展开 CodeMirror
- **Expected result:**
  1. 标题更新为 "我的自定义标题"
  2. CodeMirror 编辑器中内容为空（不包含标题文本 `# 我的自定义标题`）
- **Status:** pass
- **Evidence:** 浏览器截图 + 单元测试全部通过

### Test Case 2: 新增节点时标题不写入 CodeMirror
- **Category:** integration
- **Target:** src/stores/editorStore.ts (addChild/addRootNode)
- **Acceptance:** A1
- **Preconditions:** PromptEditor 已渲染
- **Steps:**
  1. 点击"新增根节点"按钮添加节点
  2. 展开新节点的 CodeMirror 编辑器
- **Expected result:**
  1. 新节点标题为 "新标题"（默认值）
  2. CodeMirror 内容为空（content: ''）
- **Status:** pass
- **Evidence:** 单元测试验证 addRootNode 设置 content: ''

### Test Case 3: 编辑标题后原有内容不受影响
- **Category:** integration
- **Target:** src/components/PromptEditor/EditableTitle.tsx
- **Acceptance:** A1
- **Preconditions:** 节点已有内容（例如 "这是一段测试内容"）
- **Steps:**
  1. 双击标题进入编辑模式
  2. 修改标题为新值
  3. 按 Enter 确认
  4. 展开 CodeMirror 编辑器查看内容
- **Expected result:** CodeMirror 中只显示原有的 "这是一段测试内容"，不包含标题文本
- **Status:** pass
- **Evidence:** 浏览器截图

### Test Case 4: 标题修改功能本身正常
- **Category:** unit
- **Target:** src/components/PromptEditor/EditableTitle.tsx
- **Acceptance:** A1
- **Preconditions:** 标题可编辑状态
- **Steps:**
  1. 双击标题进入编辑
  2. 输入新标题
  3. 按 Enter 保存
- **Expected result:** `onTitleChange` 被调用且参数正确，标题显示新值
- **Status:** pass
- **Evidence:** 现有 PromptEditor.test.tsx 测试全部通过
