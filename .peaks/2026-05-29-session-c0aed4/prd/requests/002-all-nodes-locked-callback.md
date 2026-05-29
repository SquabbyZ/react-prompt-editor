# PRD Request 002-all-nodes-locked-callback

- session: 2026-05-29-session-c0aed4
- type: feature
- source: verbal
- raw input (sanitized): 用户需要在所有节点标题都进入锁定状态时获得一个回调通知，用于触发后续操作（如发布版本）

## Goals

- 新增 `onAllNodesLocked` 回调 prop，当编辑器中所有节点（至少存在一个节点）的 `isLocked` 状态全部为 `true` 时触发
- 回调在每次 lock/unlock 操作后自动检测并触发

## Non-goals

- 不改变现有锁机制的交互行为
- 不添加 `onAllNodesUnlocked` 回调（当前只需全锁定通知）
- 不改变节点的 `isLocked` 默认值

## Preserved behavior

- `onNodeLock` 单节点回调行为不变
- 锁定/解锁 UI 交互不变
- 解锁时自动清除依赖引用的逻辑不变

## Acceptance criteria

- A1: 当所有节点都锁定后，`onAllNodesLocked` 被调用一次
- A2: 当不满足全锁定条件时（有任意节点未锁定），`onAllNodesLocked` 不被触发
- A3: 编辑器中无节点时，`onAllNodesLocked` 不被触发
- A4: 新增节点后（默认未锁定），再次全部锁定时，`onAllNodesLocked` 再次触发
- A5: `onAllNodesLocked` 为可选 prop，不传时不影响现有功能

## Frontend delta

- 组件: `src/components/PromptEditor/index.tsx` — `handleNodeLock` 中增加全锁定检测逻辑
- 类型: `src/types/index.ts` — `PromptEditorProps` 新增 `onAllNodesLocked?: () => void`
- 不涉及 UI 变更

## Risks and open questions

- 无

## Handoff

- to peaks-rd: .peaks/2026-05-29-session-c0aed4/rd/requests/002-all-nodes-locked-callback.md
- to peaks-qa: .peaks/2026-05-29-session-c0aed4/qa/requests/002-all-nodes-locked-callback.md
- to peaks-ui: none (no UI change)

## Status

- created: 2026-05-29T03:52:37.164Z
- last update: 2026-05-29T03:53:10.110Z
- state: confirmed-by-user
