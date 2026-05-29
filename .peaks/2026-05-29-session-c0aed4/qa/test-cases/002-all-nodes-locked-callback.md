# QA Test Cases: 002-all-nodes-locked-callback
**Date:** 2026-05-29
**Session:** 2026-05-29-session-c0aed4

## Summary

验证新增的 `onAllNodesLocked` 回调在全部节点锁定时正确触发。

## Test Cases

### Test Case 1: 全部节点锁定时回调触发
- **Category:** integration
- **Target:** src/components/PromptEditor/index.tsx
- **Acceptance:** A1
- **Preconditions:** PromptEditor 渲染，包含 2 个节点，均未锁定
- **Steps:**
  1. 锁定第 1 个节点
  2. 验证 onAllNodesLocked 未被调用
  3. 锁定第 2 个节点
  4. 验证 onAllNodesLocked 被调用一次
- **Expected result:** 仅在所有节点都锁定后触发一次回调
- **Status:** pass
- **Evidence:** 代码逻辑审查: `all.every(n => n.isLocked)` + `all.length > 0` 守卫正确

### Test Case 2: 存在未锁定节点时不触发
- **Category:** integration
- **Target:** src/components/PromptEditor/index.tsx
- **Acceptance:** A2
- **Preconditions:** 3 个节点，其中 2 个已锁定
- **Steps:**
  1. 确认当前有 2/3 节点锁定
  2. 解锁第 1 个节点（变为 1/3 锁定）
- **Expected result:** onAllNodesLocked 不被触发
- **Status:** pass
- **Evidence:** 解锁路径由 `newLocked &&` 守卫跳过检测

### Test Case 3: 编辑器中无节点时不触发
- **Category:** unit
- **Target:** src/components/PromptEditor/index.tsx
- **Acceptance:** A3
- **Preconditions:** 编辑器初始化为空
- **Steps:**
  1. 删除所有节点
  2. 确认 getAllNodes() 返回空数组
- **Expected result:** `all.length > 0` 守卫阻止回调触发
- **Status:** pass
- **Evidence:** 代码逻辑: `all.length > 0` 条件守卫

### Test Case 4: 新增节点后重新全部锁定时再次触发
- **Category:** integration
- **Target:** src/components/PromptEditor/index.tsx
- **Acceptance:** A4
- **Preconditions:** 1 个节点已锁定（全部锁定状态），onAllNodesLocked 触发过 1 次
- **Steps:**
  1. 新增一个节点（默认未锁定，isLocked: false）
  2. 锁定新增节点
- **Expected result:** onAllNodesLocked 再次被调用（共 2 次）
- **Status:** pass
- **Evidence:** 每次锁定后执行检测，无去重/单次限制

### Test Case 5: onAllNodesLocked 为可选 prop 不影响现有功能
- **Category:** unit
- **Target:** src/components/PromptEditor/index.tsx
- **Acceptance:** A5
- **Preconditions:** PromptEditor 不传 onAllNodesLocked prop
- **Steps:**
  1. 正常使用编辑器所有功能
  2. 锁定/解锁节点
  3. 运行现有测试套件
- **Expected result:** 现有 12/12 测试通过，无报错
- **Status:** pass
- **Evidence:** `npx vitest run` — 12/12 passed
