# Tasks: add-leaf-and-content-locked-callbacks

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Add 2 new optional callback fields on `PromptEditorProps` (`src/types/index.ts`) with JSDoc | done | `git diff src/types/index.ts` (+12 lines) |
| 2 | Create `src/components/PromptEditor/lockCallbacks.ts` with `fireAllLockedCallbacks` helper | done | `wc -l src/components/PromptEditor/lockCallbacks.ts` = 32 |
| 3 | Wire helper into `handleNodeLock` in `src/components/PromptEditor/index.tsx` | done | `git diff src/components/PromptEditor/index.tsx` (+1 / -1 net) |
| 4 | Update `useCallback` deps for `handleNodeLock` | done | same diff |
| 5 | Add 7 new vitest cases covering A1-A8 acceptance criteria | done | `git diff src/components/__tests__/PromptEditor.test.tsx` (+298 lines, 7 new `it(...)` blocks) |
| 6 | Verify all 20 tests pass; file size ≤ 800 lines (got 797) | done | `npx vitest run` → 20/20 pass; `wc -l src/components/PromptEditor/index.tsx` = 797 |
| 7 | Code review and security review (both pass) | done | `.peaks/2026-06-02-session-45259d/rd/code-review.md` (APPROVE), `security-review.md` (CLEAN) |
| 8 | QA validation (verdict: pass, 10/10 TCs) | done | `.peaks/2026-06-02-session-45259d/qa/test-reports/003-leaf-and-content-locked-callbacks.md` |
