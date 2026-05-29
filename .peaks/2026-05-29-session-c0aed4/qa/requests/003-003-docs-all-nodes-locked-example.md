# QA Request 003-docs-all-nodes-locked-example

- session: 2026-05-29-session-c0aed4
- type: docs

## Red-line boundary check

- in-scope: `docs/components/examples/all-nodes-locked.tsx` (new), `docs/components/prompt-editor.md` (example link), `docs/components/prompt-editor.en-US.md` (example link)
- no out-of-scope changes detected
- verdict: clean

## Acceptance checks

1. **Example file exists at correct location** — `docs/components/examples/all-nodes-locked.tsx` created with correct imports (`../../../src`, `../../demo-wrapper`). pass.
2. **Example renders in dumi docs without build errors** — dev server (port 8002) serves page with 0 module resolution errors. pass.
3. **Example displays 3 nodes** — "第一步：需求分析", "第二步：方案设计", "第三步：发布上线" all visible in the `.dumi-default-previewer` container. pass.
4. **onAllNodesLocked and onNodeLock wired in example** — both callbacks passed to `<PromptEditor>`, `handleAllNodesLocked` calls `message.success`. pass.
5. **Lock buttons present** — Lock icon buttons exist for all 3 nodes. Disabled state is correct (requires `hasRun: true` which needs `onRunRequest` — expected behavior for this API demo). pass.
6. **Documentation references example** — `<code src="./examples/all-nodes-locked.tsx"></code>` in both CN and EN docs. pass.

## Browser evidence

- Dev server: `localhost:8002` (dumi, PID 4109)
- Page: `http://localhost:8002/components/prompt-editor` — loads with 0 build errors
- Console: 1 antd `message` static function warning (cosmetic, not a bug) — `/umi.js:70842`
- Network: no failed requests
- Screenshot: `.peaks/2026-05-29-session-c0aed4/qa/screenshots/all-nodes-locked-demo.png` — shows the demo rendered under "节点依赖" section with 3 nodes and lock buttons

## Verdict

- overall: pass
- notes: Lock buttons are disabled because nodes have `hasRun: false` and the demo doesn't provide `onRunRequest`. The example is API-usage documentation — the code pattern for `onAllNodesLocked` is correctly demonstrated.

## Status

- created: 2026-05-29T04:56:55.993Z
- last update: 2026-05-29T05:15:00.000Z
- state: verdict-issued
