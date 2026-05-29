# QA Request fix-title-codemirror-sync

- session: 2026-05-29-session-36c217
- linked-prd: .peaks/2026-05-29-session-36c217/prd/requests/fix-title-codemirror-sync.md
- linked-rd:  .peaks/2026-05-29-session-36c217/rd/requests/fix-title-codemirror-sync.md
- linked-ui:  none
- type: bugfix

## Red-line boundary check

- **In-scope changes seen in the diff (match PRD + RD scope):**
  - `src/components/PromptEditor/EditableTitle.tsx`: Removed content-sync logic from `handleSave()`, removed `content` and `onContentChange` from Props interface
  - src/components/PromptEditor/Node.tsx: Removed content and onContentChange props from EditableTitle usage; linter formatting only
- **Out-of-scope changes flagged:** none
- **Verdict:** clean

## OpenSpec exit gate

- Not applicable (no openspec/ directory)

## Acceptance checks

| # | Criterion | Method | Result | Evidence |
|---|-----------|--------|--------|----------|
| A1 | 修改标题时标题文本不写入 CodeMirror 内容 | Browser E2E (Playwright) | pass | `titleInContent: false` — new title "测试验证标题" not in CodeMirror content |
| A2 | 新增节点时 title 和 content 独立 | Unit test + store inspection | pass | `addRootNode()` sets `content: ''`, `title: '新标题'` independently |

## Mandatory validation gates

- **Unit tests:** `npx vitest run` — 12/12 passed (3 files), 0 failures
- **API validation:** N/A (pure frontend bugfix)
- **Browser E2E:** Playwright MCP — headed browser, dumi dev server, iframe interaction, title edit + CodeMirror content verification. Confirmed fix works.
- **Browser error feedback loop:** Console clean, no network errors during E2E
- **Security check:** Manual grep review of changed files — no secrets, no XSS vectors, no eval, no unsafe DOM. See `qa/security-findings.md`.
- **Performance check:** Pure deletion of code — no runtime impact. See `qa/performance-findings.md`.
- **Validation report:** `qa/test-reports/001-fix-title-codemirror-sync.md`

## Regression matrix

| Surface | Check | Result |
|---------|-------|--------|
| Title editing (double-click, type, Enter) | Works | pass |
| Title editing (Escape to cancel) | Works | pass |
| Title editing (blur to save) | Works | pass |
| CodeMirror content after title edit | No title leakage | pass |
| New node creation | content: '' default | pass |
| Existing content preservation | Unchanged after title edit | pass |
| Locked mode | Cannot edit title | pass |
| Preview mode | Cannot edit title | pass |
| Existing test suite | 12/12 pass | pass |

## Browser evidence

- Playwright MCP E2E performed against dumi dev server
- Title edited from "第一步：需求分析" to "测试验证标题"
- CodeMirror content verified: shows original "# 需求分析\n\n请分析用户的需求..." without new title text
- No PII, no login URLs, no cookies/tokens in evidence

## Verdict

- **Overall:** pass
- **Rationale:** All 4 test cases pass, unit tests 12/12 pass, browser E2E confirms fix, no security issues, no performance impact. Bugfix is a clean deletion of unwanted behavior.

## Status

- created: 2026-05-29T03:38:54.990Z
- last update: 2026-05-29T03:45:00.000Z
- state: verdict-issued
