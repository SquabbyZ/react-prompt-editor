# QA Test Report: fix-title-codemirror-sync
**Date:** 2026-05-29
**Session:** 2026-05-29-session-36c217
**Type:** bugfix

## Summary

Bugfix verification: 标题修改时不再同步到 CodeMirror 编辑器内容区。Fix is a pure deletion of content-sync logic from `EditableTitle.tsx`.

## Test Execution Results

### Unit/Integration Tests

**Command:** `npx vitest run --reporter=verbose`
**Result:** 12/12 passed (3 test files)
**Duration:** 15.51s

| Test File | Tests | Status |
|-----------|-------|--------|
| `src/components/__tests__/PromptEditor.test.tsx` | 6 | all pass |
| `src/components/__tests__/multi-select.test.tsx` | 3 | all pass |
| `src/utils/__tests__/tree-utils.test.ts` | 3 | all pass |

### Test Case Results

| # | Test Case | Category | Acceptance | Status | Evidence |
|---|-----------|----------|------------|--------|----------|
| 1 | 修改节点头部标题不污染 CodeMirror 内容 | integration | A1, A2 | pass | Browser E2E: `titleInContent: false` confirmed via Playwright |
| 2 | 新增节点时标题不写入 CodeMirror | integration | A1 | pass | Unit test: `addRootNode` sets `content: ''` |
| 3 | 编辑标题后原有内容不受影响 | integration | A1 | pass | Browser E2E: original content preserved after title edit |
| 4 | 标题修改功能本身正常 | unit | A1 | pass | Existing PromptEditor.test.tsx all pass |

## Coverage

- Changed files: `EditableTitle.tsx` (pure deletion, no new code paths), `Node.tsx` (props removal + formatting)
- Existing test suite: 12/12 pass, no regressions
- No new tests required — this is a deletion of unwanted behavior, existing tests verify the remaining behavior is intact

## Security

See `qa/security-findings.md`. Result: no issues found. Pure deletion of content-sync logic introduces no new security surface.

## Performance

See `qa/performance-findings.md`. Result: no impact. Removing code reduces bundle size (trivially).

## Browser E2E

- **Method:** Playwright MCP — headed browser against dumi dev server (port 8001)
- **Interactions performed:** navigate to demo, locate iframe, double-click title, type new title, press Enter, click expand editor button, verify CodeMirror content
- **Key evidence:** `titleInContent: false` — the new title "测试验证标题" does NOT appear in CodeMirror content
- **Console errors:** none
- **Network errors:** none

## Regression Matrix

| Surface | Check | Result |
|---------|-------|--------|
| Title editing (double-click, type, Enter) | Works, title updates | pass |
| Title editing (Escape to cancel) | Works, reverts | pass |
| Title editing (blur to save) | Works, saves | pass |
| CodeMirror content after title edit | No title leakage | pass |
| New node creation | content: '' default | pass |
| Existing content preservation | Unchanged after title edit | pass |
| Locked mode | Cannot edit title | pass |
| Preview mode | Cannot edit title | pass |
| Existing test suite | 12/12 pass | pass |

## Verdict

**Overall: pass** — All 4 test cases pass, no regressions, no security issues, no performance impact.
