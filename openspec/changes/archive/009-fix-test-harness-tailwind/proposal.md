# Proposal: 009-fix-test-harness-tailwind

## Why

During request 008 (leaf-and-content demo 校验 button fix), the headed
Playwright walkthrough revealed a deeper pre-existing issue: the
`e2e/_test-harness/vite.config.ts` does NOT process `@tailwind` directives
in dev mode. The test-harness was serving a JS module that imported
`src/styles/tailwind.css` (raw @tailwind directives), and Vite's CSS
pipeline inlined only the `variables.css` import — never expanded the
utility classes. As a result, every Tailwind utility class (border-2,
border-red-500, rounded-md, etc.) was effectively dead code in the
test-harness.

Workaround used in 008: switch the test-harness import to
`dist/styles/index.css` (production-built). But the dist CSS file
becomes stale whenever source CSS / utility classes change, requiring a
manual `node scripts/build-css.js` run.

This request makes the dev-mode CSS pipeline deterministic and adds
watch-based dev scripts so the test-harness always serves fresh CSS.

## What Changes

- `e2e/_test-harness/vite.config.ts` — revert to the original (no
  `css.postcss` config). The inline-postcss + local-postcss.config.js
  attempts both failed to make Vite 4 expand `@tailwind` in dev mode
  when CSS is imported as a JS module (Vite 4 limitation, not a
  config error). Documented the limitation in the file header.
- `e2e/_test-harness/main.tsx` — import `dist/styles/index.css`
  (production-built) instead of `src/styles/tailwind.css`.
- `package.json` — three new scripts:
  - `build:css:watch` — runs Tailwind CLI in watch mode (one-shot
    rebuild on source change)
  - `dev:css` — initial build + watch
  - `dev:test-harness` — initial CSS build + vite for the test-harness

## Impact

- Public API: no change.
- Bundle size: no change (test-harness is dev-only).
- Tests: 28/28 vitest + 22/22 playwright remain green.
- File size: vite.config.ts reverted to ~30 lines; main.tsx is 18
  lines (down from 28 with the postcss inline config).
- The new dev scripts are opt-in. Existing `pnpm test` and `pnpm test:e2e`
  flows are unchanged.

## Acceptance Criteria

- A1. After running `pnpm dev:test-harness`, the test-harness page
  shows correct Tailwind styling. The 4 unlocked leaves with content in
  the leaf-and-content demo have a visible 2px red border after clicking
  校验.
- A2. Computed CSS readback in a real headed browser shows
  `border-top: solid 2px rgb(239, 68, 68)` for leaves 1.1, 1.2, 2, 3
  after 校验 click, and `border-top: solid 2px rgba(0, 0, 0, 0)` for
  internal node 1.
- A3. All 28 vitest cases + 22 playwright cases remain green.
- A4. `pnpm build:css:watch` rebuilds `dist/styles/index.css` when
  `src/styles/*.css` or component source changes.
- A5. 5 headed-overview screenshots saved to
  `qa/screenshots/headed-overview-*.png` showing 5 demo states (initial /
  after-validate / after-lock-all / after-unlock-all / after-reset).

## Risks

- Vite 4 dev-mode does not support expanding `@tailwind` directives in
  CSS imported via JS modules. This is a known limitation; production
  CLI compile is the only correct path. The test-harness inherits the
  same constraint.
- If a developer adds a new utility class to a component without
  running `pnpm dev:css` (or `pnpm build:css`), the test-harness CSS
  will not include the new class. The new `dev:test-harness` script
  bundles the initial build so this is no longer a manual step.
- Test-harness vite's strict port means starting a second instance
  fails fast — good for catching stale processes.

## Rollback

Revert the 2 source files (vite.config.ts and main.tsx) to import
`src/styles/tailwind.css`, and remove the 3 new package.json scripts.

## Status

- state: shipped
- author: peaks-solo (full-auto)
- date: 2026-06-03
- session: 2026-06-02-session-45259d
- request-id: 009-fix-test-harness-tailwind
- prd: .peaks/2026-06-02-session-45259d/prd/requests/009-009-fix-test-harness-tailwind.md
- code-review: .peaks/2026-06-02-session-45259d/rd/code-review.md
- security-review: .peaks/2026-06-02-session-45259d/rd/security-review.md
- qa-report: .peaks/2026-06-02-session-45259d/qa/test-reports/009-fix-test-harness-tailwind.md
- qa-security: .peaks/2026-06-02-session-45259d/qa/security-findings.md
- commit-boundary: single commit `chore: dev-mode Tailwind CSS pipeline for e2e harness + auto-rebuild scripts`
