import { test } from '@playwright/test';

const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';

test('headed overview: full demo with red borders visible', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
  await demo.waitFor({ timeout: 30_000 });

  // Initial state
  await demo.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS_DIR}/headed-overview-1-initial.png`, fullPage: false });

  // Expand node 1
  const caret = demo.locator('[data-node-id="1"] button[aria-label*="展"]').first();
  if (await caret.count() > 0) await caret.click();
  await page.waitForTimeout(300);

  // Click 校验
  await demo.locator('[data-test-button="validate"]').click();
  await page.waitForTimeout(500);
  await demo.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS_DIR}/headed-overview-2-after-validate.png`, fullPage: false });

  // Click 全部锁定
  await demo.locator('[data-test-button="lock-all"]').click();
  await page.waitForTimeout(500);
  await demo.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS_DIR}/headed-overview-3-after-lock-all.png`, fullPage: false });

  // Click 全部解锁
  await demo.locator('[data-test-button="unlock-all"]').click();
  await page.waitForTimeout(500);
  await demo.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS_DIR}/headed-overview-4-after-unlock-all.png`, fullPage: false });

  // Reset
  await demo.locator('[data-test-button="reset"]').click();
  await page.waitForTimeout(500);
  await demo.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `${SHOTS_DIR}/headed-overview-5-after-reset.png`, fullPage: false });
});
