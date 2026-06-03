import { test } from '@playwright/test';
import * as path from 'path';

const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';

test('008 visual: leaf-and-content-locked before 校验', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
  await demo.waitFor({ timeout: 30_000 });
  await demo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  await demo.screenshot({ path: path.join(SHOTS_DIR, '008-initial-no-borders.png') });
});

test('008 visual: leaf-and-content-locked after 校验', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
  await demo.waitFor({ timeout: 30_000 });
  // expand node 1 so children are visible
  const caret = demo.locator('[data-node-id="1"] button[aria-label*="展"]').first();
  if ((await caret.count()) > 0) {
    await caret.click();
  }
  await demo.locator('[data-test-button="validate"]').click();
  await page.waitForTimeout(300);
  await demo.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(200);
  await demo.screenshot({ path: path.join(SHOTS_DIR, '008-after-validate.png') });
});
