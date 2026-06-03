# Proposal: add-docs-sync-and-e2e-validation

## Why

Request 003 shipped 2 new callbacks and request 004 added a visual cue (`highlightUnlocked`) plus changed the callback signatures. The user requested that the docs be synced and that an E2E test be run against the new behavior in a real browser. The dumi dev server in this environment is currently broken (markdown routes do not render), so a minimal Vite harness was used to run the E2E tests against the same docs example files.

## What Changes

- `docs/examples/leaf-and-content-locked.tsx` — **new** (139 lines), demonstrates `onAllLeafNodesLocked` + `onAllNonEmptyContentNodesLocked` with a 3-root tree
- `docs/examples/locked-state-visual-cue.tsx` — **new** (115 lines), demonstrates `highlightUnlocked={true}` with a 4-root tree
- `docs/examples/all-nodes-locked.tsx` — **modified** (87 lines), updated to use `(unlockedIds: string[]) => void` signature + `highlightUnlocked={true}`
- `docs/components/prompt-editor.md` — **modified** (773 lines), added "锁定状态回调" section; updated the props table to reflect new signatures and new prop
- `e2e/locked-callbacks-harness.spec.ts` — **new** (3 Playwright tests)
- `e2e/_test-harness/` — **new** directory: Vite harness (index.html, main.tsx, vite.config.ts) that imports the 3 docs example files directly

## Impact

- No `src/` changes
- No new dependencies (Vite was already in the project; `vite.config.ts` is a minimal local config)
- No new bundle size
- 3 E2E tests in `locked-callbacks-harness.spec.ts` cover TC-1, TC-2, TC-3
- 3 screenshots captured as visual evidence (saved to `.peaks/2026-06-02-session-45259d/qa/screenshots/005-*.png`)

## Acceptance Criteria

- A1: `docs/examples/leaf-and-content-locked.tsx` exists with 3-root tree and the 2 new callbacks
- A2: `docs/examples/locked-state-visual-cue.tsx` exists with multi-node tree and `highlightUnlocked={true}`
- A3: `docs/examples/all-nodes-locked.tsx` updated to the new API
- A4: `docs/components/prompt-editor.md` documents all 3 callbacks + `highlightUnlocked` in a new section + props table
- A5: new E2E spec has ≥ 3 test cases (3 written)
- A6: Playwright run passes 3/3 (verified)
- A7: docs files have no syntax errors (Vite transformed all 3 without errors)
- A8: no regression in `e2e/basic-flow.spec.ts` (unchanged in this work)

## Risks

- **Dumi dev server is broken in this environment:** all routes return the SPA shell with 0 markdown content. The `e2e/locked-callbacks-harness.spec.ts` is run against a Vite harness instead. If dumi is fixed, the harness can be deprecated.
- **Port collision:** the dumi dev server in this session is on port 8001, but the actual app listens on port 8000. The E2E spec uses the Vite harness on port 5173 to avoid this.
- **Lock button requires `hasRun: true`:** the existing `NodeActions.tsx` requires the node to be "run" before the lock button is enabled. All 3 demo files were updated to set `hasRun: true` on initial state.

## Rollback

Delete the new files and revert the modified files:

```bash
git checkout HEAD -- docs/examples/all-nodes-locked.tsx docs/components/prompt-editor.md
rm docs/examples/leaf-and-content-locked.tsx docs/examples/locked-state-visual-cue.tsx
rm e2e/locked-callbacks-harness.spec.ts
rm -rf e2e/_test-harness
```

No data migration, no DB change, no public API removal needed.

## Status

- **state:** shipped
- **author:** peaks-solo
- **date:** 2026-06-03
- **session:** 2026-06-02-session-45259d
- **request-id:** 005-docs-sync-and-e2e-validation
- **prd:** .peaks/2026-06-02-session-45259d/prd/requests/005-docs-sync-and-e2e-validation.md
- **tech-doc:** .peaks/2026-06-02-session-45259d/rd/tech-doc-005.md
- **qa-report:** .peaks/2026-06-02-session-45259d/qa/test-reports/005-docs-sync-and-e2e-validation.md
- **commit-boundary:** single commit "docs+test: sync docs and add E2E for locked callbacks"
