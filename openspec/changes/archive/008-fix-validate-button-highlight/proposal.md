# Proposal: 008-fix-validate-button-highlight

## Why

In `docs/examples/leaf-and-content-locked.tsx`, the 「校验」 button only updates the text panel and does NOT trigger the red-border visual cue on unlocked leaves-with-content nodes. The user clicking 校验 expects to see which nodes are still unlocked, but currently the page is silent visually.

A latent bug in `src/components/PromptEditor/index.tsx` (from request 004) was uncovered: the `[tree]` useEffect only re-populated `unlockedHighlightIds` when `highlightUnlocked === true`, but never reset the set when the prop went false. This means once the highlight set was populated, it lingered in React state and continued to drive `isHighlighted=true` on every Node, even after the consumer toggled `highlightUnlocked` back to false.

## What Changes

- `docs/examples/leaf-and-content-locked.tsx` — add local React state `highlightUnlocked: boolean` (default false). Wire `校验` and `全部解锁` to set it `true`; wire `全部锁定` and `Reset` to set it `false`. Pass to `<PromptEditor highlightUnlocked={highlightUnlocked}>`.
- `src/components/PromptEditor/index.tsx` — add early-clear branch to the `[tree]` useEffect: when `highlightUnlocked || hasAnyLockedCallback` is false, actively clear `unlockedHighlightIdsRef.current` and `unlockedHighlightIds` state. This ensures the red border disappears immediately when the consumer disables highlight.
- `e2e/008-leaf-and-content-validate-highlight.spec.ts` (new) — 5 playwright cases A1–A5 covering initial state, 校验 click, 全部锁定, 全部解锁, Reset round trip.

## Impact

- Public API: no change. `highlightUnlocked` prop signature unchanged.
- Bundle size: +~0.1KB (4 setter calls + 1 useState in demo).
- Runtime: 1 extra React render per Reset / Lock-all on the demo; 0 impact on the production PromptEditor (the early-clear branch is O(1) on the existing useEffect cycle).
- Tests: 28/28 vitest + 22/22 playwright pass.
- File size: index.tsx adds 6 lines; demo adds 9 lines; spec adds ~160 lines.

## Acceptance Criteria

- A1. Initially no red border (highlightUnlocked=false by default)
- A2. Click 校验 → 4 leaves (1.1, 1.2, 2, 3) show red border, internal node 1 stays clean
- A3. Click 全部锁定 → all red borders disappear
- A4. Click 全部解锁 → 4 red borders reappear
- A5. Click Reset → red borders disappear, validation panel hidden, state returns to initialValue
- A6. 5 prior vitest cases + 22 prior playwright + 5 new cases = 32/32 PASS

## Risks

- The new useEffect branch is O(1) and only fires when `highlightUnlocked` becomes false. No new state, no new dependencies.
- The 全部锁定 path: previously red borders stayed until next tree change; now they clear immediately. Backward compatible (always better, never worse).

## Rollback

Revert the 6 lines in `src/components/PromptEditor/index.tsx` + the 9 lines in `docs/examples/leaf-and-content-locked.tsx` + delete `e2e/008-leaf-and-content-validate-highlight.spec.ts`.

## Status

- state: shipped
- author: peaks-solo (full-auto)
- date: 2026-06-03
- session: 2026-06-02-session-45259d
- request-id: 008-fix-validate-button-highlight
- prd: .peaks/2026-06-02-session-45259d/prd/requests/008-008-fix-validate-button-highlight.md
- bug-analysis: .peaks/2026-06-02-session-45259d/rd/bug-analysis.md (covered by PRD)
- code-review: .peaks/2026-06-02-session-45259d/rd/code-review.md
- security-review: .peaks/2026-06-02-session-45259d/rd/security-review.md
- qa-report: .peaks/2026-06-02-session-45259d/qa/test-reports/008-fix-validate-button-highlight.md
- qa-security: .peaks/2026-06-02-session-45259d/qa/security-findings.md
- commit-boundary: single commit `fix: leaf-and-content demo 校验 now toggles red border highlight`
