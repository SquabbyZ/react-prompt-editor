import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Capture 3 fresh screenshots of the 校验 (validate) button result for each demo.
 * The validation result panel must be visible in the screenshot.
 */
const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const DEMOS = [
  'all-nodes-locked',
  'leaf-and-content-locked',
] as const;

for (const demoName of DEMOS) {
  test(`screenshot 006-validate: ${demoName}`, async ({ page }) => {
    await page.goto(BASE + '/', { timeout: 30_000 });

    const demo = page.locator(`[data-test-demo="${demoName}"]`);
    await expect(demo).toBeVisible({ timeout: 30_000 });

    const result = demo.locator('[data-test-message="validation-result"]');
    const validateBtn = demo.locator('[data-test-button="validate"]');
    await expect(validateBtn).toBeVisible({ timeout: 5_000 });
    await validateBtn.click();

    await expect(result).toBeVisible({ timeout: 5_000 });
    const text = (await result.textContent()) || '';
    expect(text).toContain('校验结果');

    const shotPath = path.join(SHOTS_DIR, `006-${demoName}.png`);
    await demo.screenshot({ path: shotPath });
    test.info().annotations.push({ type: 'screenshot', description: shotPath });
  });
}
