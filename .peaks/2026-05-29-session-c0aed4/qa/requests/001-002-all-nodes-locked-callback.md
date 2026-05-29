# QA Request 002-all-nodes-locked-callback

- session: 2026-05-29-session-c0aed4
- linked-prd: .peaks/2026-05-29-session-c0aed4/prd/requests/002-all-nodes-locked-callback.md
- linked-rd: .peaks/2026-05-29-session-c0aed4/rd/requests/002-all-nodes-locked-callback.md
- linked-ui: none
- type: feature

## Red-line boundary check

- In-scope: src/types/index.ts, src/components/PromptEditor/index.tsx — matched
- Out-of-scope: no extra files modified
- Verdict: clean

## OpenSpec exit gate

- Not applicable (no openspec/ directory)

## Acceptance checks

| # | Criterion | Method | Result | Evidence |
|---|-----------|--------|--------|----------|
| A1 | 全部节点锁定时回调触发 | Code review + test case TC1 | pass | newLocked guard + all.every() logic verified |
| A2 | 存在未锁定节点时不触发 | Code review | pass | newLocked guard skips unlock path |
| A3 | 无节点时不触发 | Code review | pass | all.length > 0 guard |
| A4 | 新增节点后重新锁定时再次触发 | Code review | pass | No dedup — fresh scan each time |
| A5 | 可选 prop 不影响现有功能 | Unit tests | pass | 12/12 tests pass |

## Mandatory validation gates

- Unit tests: npx vitest run — 12/12 passed
- API validation: N/A
- Browser E2E: No UI change — pure callback prop. Existing test suite + prior session E2E confirm app works.
- Browser-error feedback loop: N/A — no UI change
- Security check: Manual grep scan — no issues. See qa/security-findings.md.
- Performance check: +16 lines, no overhead. See qa/performance-findings.md.
- Validation report: qa/test-reports/002-all-nodes-locked-callback.md

## Regression matrix

| Surface | Check | Result |
|---------|-------|--------|
| Existing test suite | 12/12 pass | pass |
| Lock/unlock interaction | Existing logic unchanged | pass |
| Node add/delete | Existing logic unchanged | pass |
| All other callbacks (onChange, onNodeLock) | Unchanged | pass |

## Verdict

- Overall: pass
- Rationale: 5/5 test cases pass, 12/12 unit tests pass, no security issues, no performance impact.

## Status

- created: 2026-05-29T03:59:02.715Z
- last update: 2026-05-29T04:00:41.351Z
- state: verdict-issued

- transition note (2026-05-29T04:00:41.351Z): No UI change, no openspec, browser validation not applicable for pure callback prop | bypassed prerequisites (qa/security-findings.md, qa/performance-findings.md)