import { defineConfig } from 'vite';
import * as path from 'path';

// 009: the test-harness served CSS comes from the production-built
// dist/styles/index.css (compiled by `node scripts/build-css.js` running
// Tailwind CLI with the project-root `tailwind.config.js`). See the
// `dev:test-harness` and `build:css:watch` scripts in package.json for
// dev-mode rebuild hooks. Tailwind's JIT in Vite 4 dev-mode was tried
// (inline css.postcss + a local postcss.config.js) but the JS-imported
// CSS module path does not expand `@tailwind` directives — the served
// CSS was 14,950 chars with 0 utility rules. Production CLI compile is
// the deterministic correct path.
export default defineConfig({
  root: __dirname,
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
  },
  esbuild: {
    // We import from /src directly and the source uses TSX, JSX, etc.
    // esbuild handles .ts/.tsx out of the box.
    jsx: 'automatic',
  },
  resolve: {
    alias: {
      // Allow imports like `from 'react'` to resolve to project's node_modules.
    },
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
});
