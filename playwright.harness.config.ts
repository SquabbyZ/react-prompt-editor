import { defineConfig, devices } from '@playwright/test';

/**
 * Config for the docs examples verification harness.
 *
 * - Bypasses the repo's default config (which points baseURL to dumi on :8000).
 * - Vite dev server is started manually before running the spec.
 * - Tests are loaded from ./e2e/_test-harness only.
 */
export default defineConfig({
  testDir: './e2e/_test-harness',
  timeout: 90 * 1000,
  expect: { timeout: 10 * 1000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
