# Tasks: add-locked-state-visual-cue

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Change 3 callback signatures on `PromptEditorProps` (`src/types/index.ts`) | done | `git diff src/types/index.ts` |
| 2 | Add `highlightUnlocked?: boolean` prop | done | same diff |
| 3 | Update `fireAllLockedCallbacks` in `lockCallbacks.ts` to return `FireAllLockedResult` | done | `git diff src/components/PromptEditor/lockCallbacks.ts` |
| 4 | In `handleNodeLock`: read unlocked sets; maintain `unlockedHighlightIds` state; auto-expand; pass `isHighlighted` via rowProps | done | `git diff src/components/PromptEditor/index.tsx` |
| 5 | In `Node.tsx`: accept `isHighlighted` prop; apply red border class to title wrapper | done | `git diff src/components/PromptEditor/Node.tsx` (+13 lines) |
| 6 | Update 7 prior callback tests in `PromptEditor.test.tsx` to new signature | done | same diff |
| 7 | Split test file: extract 5 new tests to `PromptEditor.lockedStateVisualCue.test.tsx` and shared helpers | done | new files exist |
| 8 | Verify 25/25 tests pass; `index.tsx` ≤ 800 lines | done | `npx vitest run` → 25/25, `index.tsx` 799 lines |
| 9 | Code review + security review (both pass) | done | `rd/code-review.md`, `rd/security-review.md` |
| 10 | QA validation (verdict: pass, 25/25 TCs) | done | `qa/test-reports/004-locked-state-visual-cue.md` |
| 11 | Performance: measured at n=100, sub-millisecond | done | `qa/performance-findings.md` |
