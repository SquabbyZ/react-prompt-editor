# Tasks: add-interactive-unlock-buttons

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Add 4 buttons (全部锁定 / 全部解锁 / 重置 / 校验) to `all-nodes-locked.tsx` | done | file modified |
| 2 | Add 4 buttons + `setLockedDeep` helper to `leaf-and-content-locked.tsx` | done | file modified |
| 3 | Add 4 buttons + `setLockedDeep` helper to `locked-state-visual-cue.tsx` | done | file modified |
| 4 | Implement `validateLockState` helper in all 3 demos (mirrors `fireAllLockedCallbacks` predicates) | done | TC-6 verifies |
| 5 | Add `validation` state + result div in all 3 demos | done | TC-6 verifies |
| 6 | Make 全部锁定 button manually invoke the all-locked callback with `[]` (workaround for programmatic value updates) | done | TC-5 verifies |
| 7 | Add 3 new E2E tests (TC-4, TC-5, TC-6) | done | 6/6 pass in 27.4s |
| 8 | Capture 3 screenshots | done | `qa/screenshots/006-*.png` |
| 9 | Code review | done | `rd/code-review.md` APPROVE |
| 10 | Security review | done | `rd/security-findings.md` CLEAN |
| 11 | QA validation | done | `qa/test-reports/006-*.md` verdict: pass |
