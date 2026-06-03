import { test } from '@playwright/test';
import * as path from 'path';

/**
 * request 007 — quick visual screenshot of the demo for user review.
 * Captures the locked-state-visual-cue demo in three states:
 *  - initial: 7 unlocked leaves with content → 5 red borders; 2 internal
 *    nodes + 1 empty-content leaf + 1 locked leaf do not.
 *  - all-locked: red borders all gone, banner visible.
 *  - all-unlocked: all leaves-with-content get the red border back.
 */
const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';

test('007 visual capture: initial', async ({ page }) => {
  // Tall viewport so the demo's virtualized list can render all 8 rows
  // without needing to scroll.
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
  await demo.waitFor({ timeout: 30_000 });
  // Expand nodes 1 and 7 so the children ("1.1" and "7.1") are visible.
  for (const id of ['1', '7']) {
    const caret = demo
      .locator(`[data-node-id="${id}"] button[aria-label*="展"]`)
      .first();
    if ((await caret.count()) > 0) {
      await caret.click();
    }
  }
  await page.waitForTimeout(300);
  // Element-level screenshot of just the demo block (so the chat renders
  // it without all the page chrome getting in the way).
  await demo.screenshot({ path: path.join(SHOTS_DIR, '007-visual-initial.png') });
});

test('007 visual capture: all-locked', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
  await demo.waitFor({ timeout: 30_000 });
  await demo.locator('[data-test-button="lock-all"]').click();
  await page.waitForTimeout(300);
  await demo.screenshot({ path: path.join(SHOTS_DIR, '007-visual-all-locked.png') });
});

test('007 visual capture: all-unlocked', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1400 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
  await demo.waitFor({ timeout: 30_000 });
  await demo.locator('[data-test-button="lock-all"]').click();
  await demo.locator('[data-test-button="unlock-all"]').click();
  await page.waitForTimeout(500);
  await demo.screenshot({ path: path.join(SHOTS_DIR, '007-visual-all-unlocked.png') });
});
