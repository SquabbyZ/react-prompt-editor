# Proposal: add-leaf-and-content-locked-callbacks

## Why

PromptEditor currently exposes a single "all-locked" callback (`onAllNodesLocked`) that fires when every node in the editor is locked. Users have requested two additional, more granular "all-locked" semantics:

1. `onAllLeafNodesLocked` — fires only when every **leaf** node (a node with no children) is locked. Useful when the host application only cares about the lock state of terminal nodes (e.g., all "task" steps finalized but parent "section" headers may still be unlocked).
2. `onAllNonEmptyContentNodesLocked` — fires only when every node whose CodeMirror body is non-empty (`content.trim() !== ''`) is locked. Useful for "draft vs. finalized content" workflows where empty placeholder nodes don't count.

Both new callbacks are optional `() => void` props, parallel to the existing `onAllNodesLocked`. They fire inside the same `handleNodeLock` event handler, after the existing `onAllNodesLocked` block, and follow the same guard style (`if (newLocked && onX)` + `length > 0 && every(...)`).

## What Changes

- `src/types/index.ts` — add 2 new optional callback fields on `PromptEditorProps` with JSDoc
- `src/components/PromptEditor/lockCallbacks.ts` — **new file**, 32 lines, exports `fireAllLockedCallbacks` helper that owns the 3 detection blocks
- `src/components/PromptEditor/index.tsx` — destructure the 2 new props; replace 3 inline detection blocks with 1 helper call inside `handleNodeLock`; update `useCallback` deps
- `src/components/__tests__/PromptEditor.test.tsx` — add 7 new vitest cases covering A1, A2, A4, A5, A6, A7, A8

## Impact

- `PromptEditor` public API: **+2 optional props** (backward-compatible; defaults to `undefined` → no behavior change)
- Bundle size: +0.5KB (lockCallbacks.ts gzipped)
- Runtime: 3× O(n) per lock click in `handleNodeLock` worst case (was 1×); sub-millisecond at n=100
- 7 new vitest cases, 20/20 pass in full suite

## Acceptance Criteria

- A1: when all leaf nodes are locked, `onAllLeafNodesLocked` fires once
- A2: when at least one leaf node is unlocked, `onAllLeafNodesLocked` does NOT fire
- A3: when no leaf nodes exist (defensive), `onAllLeafNodesLocked` does NOT fire
- A4: when all non-empty-content nodes are locked, `onAllNonEmptyContentNodesLocked` fires once
- A5: when at least one non-empty-content node is unlocked, `onAllNonEmptyContentNodesLocked` does NOT fire
- A6: when no node has non-empty content, `onAllNonEmptyContentNodesLocked` does NOT fire
- A7: adding a new (unlocked) node breaks the "all locked" condition; re-locking re-fires the callback
- A8: the 3 all-locked callbacks fire independently when their respective predicates all hold
- A9: all 3 callbacks are optional; existing 13 vitest cases still pass
- A10: type signature of new callbacks is `() => void`, parallel to existing `onAllNodesLocked`

## Tests added

- A1: `calls onAllLeafNodesLocked once when all leaf nodes are locked`
- A2: `does not call onAllLeafNodesLocked when at least one leaf is unlocked`
- A4: `calls onAllNonEmptyContentNodesLocked once when all non-empty content nodes are locked`
- A5: `does not call onAllNonEmptyContentNodesLocked when at least one non-empty content node is unlocked`
- A6: `does not call onAllNonEmptyContentNodesLocked when no node has non-empty content`
- A7: `re-fires leaf and non-empty-content callbacks after a new node is locked`
- A8: `fires all three all-locked callbacks independently in the same lock cycle`

## Rollback

Revert the 4 files via `git checkout HEAD -- src/types/index.ts src/components/PromptEditor/index.tsx src/components/__tests__/PromptEditor.test.tsx src/components/PromptEditor/lockCallbacks.ts`. No data migration, no DB change, no public API removal needed (new props are optional, callers unaffected).

## Status

- state: shipped
- author: peaks-solo
- date: 2026-06-03
- session: 2026-06-02-session-45259d
- request-id: 003-leaf-and-content-locked-callbacks
- prd: .peaks/2026-06-02-session-45259d/prd/requests/003-leaf-and-content-locked-callbacks.md
- tech-doc: .peaks/2026-06-02-session-45259d/rd/tech-doc.md
- qa-report: .peaks/2026-06-02-session-45259d/qa/test-reports/003-leaf-and-content-locked-callbacks.md
- commit-boundary: single commit "feat: add leaf and non-empty-content all-locked callbacks"
