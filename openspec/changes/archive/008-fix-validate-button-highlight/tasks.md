# Tasks: 008-fix-validate-button-highlight

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Add `highlightUnlocked` state in leaf-and-content-locked demo; wire 校验/全部解锁 to enable, 全部锁定/Reset to disable | done | `git diff docs/examples/leaf-and-content-locked.tsx` (+9 lines) |
| 2 | Add early-clear branch to `[tree]` useEffect in `src/components/PromptEditor/index.tsx` so `unlockedHighlightIds` resets when `highlightUnlocked` becomes false | done | `git diff src/components/PromptEditor/index.tsx` (+6 lines) |
| 3 | Add `e2e/008-leaf-and-content-validate-highlight.spec.ts` with 5 playwright cases TC-008-A1..A5 | done | new file, 5/5 PASS |
| 4 | Verify vitest 28/28 + playwright 22/22 (007+008+006+lcb+verify) + grep guard 0 | done | `qa/test-reports/008-fix-validate-button-highlight.md` |
| 5 | Code review + security review (both pass) | done | `rd/code-review.md`, `rd/security-review.md` |
| 6 | QA validation (verdict=pass) | done | `qa/test-reports/008-fix-validate-button-highlight.md` |
| 7 | OpenSpec archive (this file) | done | `peaks openspec archive 008-fix-validate-button-highlight --apply` |

## Notes
- Node.tsx at 1023 lines (still over 800-line cap). Out of scope.
- The 校验 text panel logic is preserved unchanged.
