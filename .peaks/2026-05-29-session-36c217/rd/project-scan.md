# Project Scan: react-prompt-editor
**Date:** 2026-05-29
**Session:** 2026-05-29-session-36c217

## Archetype
- Type: frontend-monorepo
- Confidence: high
- Signals matched:
  - backend-presence: false (no backend framework, no next API routes, no backend dirs)
  - swagger-or-proto: false (no swagger/openapi/proto)
  - monorepo-config: true (pnpm-workspace.yaml)
  - src-size: true (48 source files in src/)
  - lockfile-age: false (36 days)

## Project mode
- Frontend-only: true
- Reason: archetype=frontend-monorepo

## Build tool
- Framework: father 4.x (bundling) + dumi 2.4.x (dev/docs)
- Config file: .fatherrc.ts, .dumirc.ts
- Mixed builds: false
- Note: This is an NPM library package (not a deployable app). father produces ESM+CJS dual output (`dist/esm/` and `dist/lib/`).

## Component library
- Library: antd 5.x (peerDependency)
- Design-system packages: @ant-design/x 2.x (peerDependency)
- In-house design system: none

## CSS solution
- Primary: TailwindCSS 3.4.x + CSS variables (antd token mapping via --pe-* prefix)
- Conflicts detected: none (preflight: false configured to avoid antd style conflicts)
- Tailwind plugins: tailwindcss-animate, tailwind-scrollbar
- Additional: Less (linted via stylelint), PostCSS, autoprefixer

## State management, routing, data fetching
- State: zustand 5.x (stores: editorStore.ts, optimizeStore.ts)
- Routing: none (this is an NPM library, not an application)
- Data fetching: custom hooks (useOptimizeAPI.ts, useStreamParser.ts) — no react-query/swr/ahooks

## Legacy constraints
- CodeMirror 5.x via react-codemirror2 (legacy wrapper; CodeMirror 6 is current — migration cost is high due to API break)
- No class components detected in src/
- No moment.js dependency
