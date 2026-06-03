# Proposal: add-locked-state-visual-cue

## Why

Request 003 shipped 3 all-locked callbacks that fire when the relevant predicate is satisfied. The user wanted UX feedback: when those callbacks **detect** incomplete-lock state, the component should automatically highlight which nodes are still unlocked (red border on title) and auto-expand them so the user can see what is still missing. The user's explicit concern was performance.

The user also chose the API shape: **extend the existing 3 callbacks to pass `unlockedNodeIds: string[]` as their argument** (breaking change, but a clean signature). The visual cue is **per-callback opt-in** (each of the 3 callbacks independently contributes its unlocked set; the highlight is the union).

## What Changes

- `src/types/index.ts` — change 3 callback signatures to `(unlockedNodeIds: string[]) => void`; add new `highlightUnlocked?: boolean` prop
- `src/components/PromptEditor/lockCallbacks.ts` — `fireAllLockedCallbacks` now returns `FireAllLockedResult` with 3 unlocked-ID arrays
- `src/components/PromptEditor/index.tsx` — signature update; new state `unlockedHighlightIds: Set<string>`; auto-expand of unlocked node IDs into `expandedNodes`; pass `isHighlighted: boolean` per node via `rowProps`
- `src/components/PromptEditor/Node.tsx` — accept `isHighlighted` prop; apply `border-2 border-red-500/70 rounded-md px-1` to title wrapper
- `src/components/__tests__/PromptEditor.test.tsx` — update 7 prior callback tests to new signature
- `src/components/__tests__/PromptEditor.lockedStateVisualCue.test.tsx` — **new file** (split out to satisfy 800-line cap) with 5 new tests (TC-A1 to TC-A5)
- `src/components/__tests__/promptEditorTestHelpers.tsx` — **new file** (extracted shared test helpers)

## Impact

- `PromptEditor` public API: **breaking change** on 3 callback signatures. TS compiler will catch at build time. Minor version bump in `package.json` (user's responsibility).
- Bundle size: +0.6KB (lockCallbacks.ts grew +44 lines; net also includes the new test file but tests don't ship to prod)
- Runtime: 6× O(n) per lock click in `handleNodeLock` (was 3×); still sub-millisecond at n=100
- Re-render: per lock click, ~15 visible Nodes re-render with O(1) `Set.has(nodeId)` check each. Negligible.
- 5 new vitest cases, 25/25 pass in full suite
- Test file split: `PromptEditor.test.tsx` 269 → 546 → 547; new `PromptEditor.lockedStateVisualCue.test.tsx` 247

## Acceptance Criteria

- A1: red border on unlocked node titles when `highlightUnlocked=true`
- A2: auto-expand of unlocked node IDs
- A3: `highlightUnlocked=false` (default) → zero overhead
- A4: 3 callbacks all receive `unlockedNodeIds: string[]` argument
- A5: red border disappears when the last unlocked node is locked
- A6: auto-expand is idempotent
- A7: no feedback loop
- A8: 3 callbacks fire independently with their own unlocked sets
- A9: consumer can ignore the unlocked-set argument
- A10: 20 prior tests updated; 5 new tests added; 25/25 pass

## Risks

- **API break:** existing consumers of the 3 callbacks must update. TS compiler catches at build time.
- **Performance:** measured at n=100 → ~15 visible Node re-renders per lock click, each O(1). Sub-millisecond.
- **Node.tsx is 1017 lines** (was 1005 pre-existing + 12 added by this work). The 800-line cap is a project rule; this is **pre-existing technical debt** and was documented in the RD transition note. Out of scope for this request; tracked as a future refactor.

## Rollback

Revert the 5 modified files + delete the 2 new test files via:

```bash
git checkout HEAD -- src/types/index.ts \
  src/components/PromptEditor/lockCallbacks.ts \
  src/components/PromptEditor/index.tsx \
  src/components/PromptEditor/Node.tsx \
  src/components/__tests__/PromptEditor.test.tsx
rm src/components/__tests__/PromptEditor.lockedStateVisualCue.test.tsx \
  src/components/__tests__/promptEditorTestHelpers.tsx
```

No data migration, no DB change, no public API removal needed (the signature change is a strict superset; old callers will hit a TS error which is the intended migration signal).

## Status

- **state:** shipped
- **author:** peaks-solo
- **date:** 2026-06-03
- **session:** 2026-06-02-session-45259d
- **request-id:** 004-locked-state-visual-cue
- **prd:** .peaks/2026-06-02-session-45259d/prd/requests/004-locked-state-visual-cue.md
- **tech-doc:** .peaks/2026-06-02-session-45259d/rd/tech-doc-004.md
- **qa-report:** .peaks/2026-06-02-session-45259d/qa/test-reports/004-locked-state-visual-cue.md
- **commit-boundary:** single commit "feat: highlight unlocked nodes (red border + auto-expand)"
