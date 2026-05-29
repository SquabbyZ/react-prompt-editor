# Tech Doc: 002-all-nodes-locked-callback
**Date:** 2026-05-29
**Session:** 2026-05-29-session-c0aed4
**Type:** feature

## Architecture Decisions

**Decision:** 在现有 `handleNodeLock` 回调中增加全锁定检测逻辑，新增可选 prop `onAllNodesLocked`。

**Why:** 用户需要在所有节点标题都锁定后获得通知（用于触发发布版本等操作）。最小改动方案：在每次 lock/unlock 操作后检查所有节点的 isLocked 状态，全部为 true 时触发回调。

**Alternatives considered:**
- 在 Zustand store 中增加 middleware/subscription 检测 → 过度工程，store 不应包含业务回调逻辑
- 在每个 Node 组件中检测 → 分散逻辑，难以维护

**Tradeoffs:** 每次 lock/unlock 都遍历全部节点（O(n)），对于节点数通常 < 100 的场景可忽略不计。

## Red-line scope

### In-scope
- `src/types/index.ts` — PromptEditorProps 接口
- `src/components/PromptEditor/index.tsx` — handleNodeLock 回调逻辑

### Out-of-scope
- Store 层不改动
- UI 层不改动
- 不新增文件

## Implementation evidence

- **Tests:** `npx vitest run` — 12/12 passed, 0 failures
- **Code review:** `.peaks/2026-05-29-session-c0aed4/rd/code-review.md` — APPROVE
- **Security review:** `.peaks/2026-05-29-session-c0aed4/rd/security-review.md` — CLEAN
- **Diff size:** +16 lines across 2 files

## Component Changes

| File | Change | Role |
|------|--------|------|
| `src/types/index.ts` | +7 lines: 新增 `onAllNodesLocked?: () => void` 到 `PromptEditorProps` | Interface addition |
| `src/components/PromptEditor/index.tsx` | +9 lines: props 解构 + `handleNodeLock` 中全锁定检测逻辑 | Feature logic |

## Data Flow

```
用户点击锁定按钮
  → NodeActions.onClick → handleNodeLock(nodeId)
    → updateNode(nodeId, { isLocked: newLocked })
    → onNodeLock?.(nodeId, newLocked)      // 现有单节点回调
    → store.getAllNodes().every(isLocked)   // NEW: 全锁定检测
    → onAllNodesLocked?.()                  // NEW: 触发回调（仅当全部锁定且至少有一个节点）
    → onChange?.(tree)
```

## CSS/Style Changes

无

## API Contract Changes

无（纯前端 props 新增）

## Dependencies

无新增依赖
