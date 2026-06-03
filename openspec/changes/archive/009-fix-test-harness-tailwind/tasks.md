# Tasks: 009-fix-test-harness-tailwind

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Document the Vite 4 dev-mode limitation in `e2e/_test-harness/vite.config.ts` | done | `git diff e2e/_test-harness/vite.config.ts` |
| 2 | Switch `e2e/_test-harness/main.tsx` CSS import to `dist/styles/index.css` | done | `git diff e2e/_test-harness/main.tsx` (+1 line net) |
| 3 | Add `build:css:watch`, `dev:css`, `dev:test-harness` scripts to `package.json` | done | `git diff package.json` (+3 lines) |
| 4 | Verify vitest 28/28 + playwright 22/22 | done | `pnpm test` + `npx playwright test` (both PASS) |
| 5 | Headed-zoom readback: 4 leaves with content get 2px rgb(239,68,68) computed border | done | `e2e/headed-zoom.spec.ts` console output + `qa/screenshots/` |
| 6 | Code review + security review (both pass) | done | `rd/code-review.md`, `rd/security-review.md` |
| 7 | QA validation (verdict=pass) | done | `qa/test-reports/009-fix-test-harness-tailwind.md` |
| 8 | OpenSpec archive (this file) | done | `peaks openspec archive 009-fix-test-harness-tailwind --apply` |
