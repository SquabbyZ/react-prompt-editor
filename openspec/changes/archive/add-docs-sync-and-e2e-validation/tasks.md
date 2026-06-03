# Tasks: add-docs-sync-and-e2e-validation

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Create `docs/examples/leaf-and-content-locked.tsx` (3-root tree + 2 new callbacks) | done | file exists, 139 lines |
| 2 | Create `docs/examples/locked-state-visual-cue.tsx` (4-root tree + `highlightUnlocked`) | done | file exists, 115 lines |
| 3 | Update `docs/examples/all-nodes-locked.tsx` to new API + `highlightUnlocked` | done | file exists, 87 lines |
| 4 | Update `docs/components/prompt-editor.md` (new "锁定状态回调" section + props table) | done | file exists, 773 lines |
| 5 | Create `e2e/locked-callbacks-harness.spec.ts` (3 tests) | done | 3 tests, 3/3 pass |
| 6 | Create `e2e/_test-harness/` Vite harness | done | 4 files |
| 7 | Run E2E: 3/3 pass in real Chromium | done | `qa/test-reports/005-*.md` |
| 8 | Capture screenshots | done | 3 PNGs in `qa/screenshots/005-*.png` |
| 9 | Code review | done | `rd/code-review.md` APPROVE |
| 10 | Security review | done | `rd/security-review.md` CLEAN |
| 11 | QA validation | done | `qa/test-reports/005-*.md` verdict: pass |
