import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * request 008 — leaf-and-content-locked 校验 button now toggles
 * `highlightUnlocked={true}` so the user can see red borders on the unlocked
 * leaves with non-empty content.
 */
const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

test.describe('008 leaf-and-content-locked 校验 button highlight', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/', { timeout: 30_000 });
  });

  test('TC-008-A1: initially no red border (highlightUnlocked default false)', async ({ page }) => {
    const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    const rows = demo.locator('[data-testid="node-row"]');
    await expect(rows.first()).toBeVisible({ timeout: 10_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      expect(cls, `row ${i} should NOT have red-500 initially`).not.toMatch(/red-500/);
    }

    await demo.screenshot({ path: path.join(SHOTS_DIR, '008-initial-no-borders.png') });
  });

  test('TC-008-A2: clicking 校验 shows red border on leaves with non-empty content', async ({
    page,
  }) => {
    const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    // Expand node 1 so its children (1.1, 1.2) are visible.
    const caret = demo
      .locator('[data-node-id="1"] button[aria-label*="展"]')
      .first();
    if ((await caret.count()) > 0) {
      await caret.click();
      await page.waitForTimeout(300);
    }

    // Click 校验 — should turn on highlight and show the panel
    await demo.locator('[data-test-button="validate"]').click();
    await page.waitForTimeout(300);

    // The four leaves (1.1, 1.2, 2, 3) should now have red borders
    for (const id of ['1.1', '1.2', '2', '3']) {
      const row = demo
        .locator(`[data-node-id="${id}"] [data-testid="node-row"]`)
        .first();
      await expect(row, `row id=${id}`).toBeVisible({ timeout: 5_000 });
      const cls = (await row.getAttribute('class')) || '';
      expect(cls, `id=${id} should have border-red-500 after 校验`).toMatch(
        /border-red-500/,
      );
    }
    // Node 1 is internal → no red border
    const internalRow = demo
      .locator('[data-node-id="1"] [data-testid="node-row"]')
      .first();
    const internalCls = (await internalRow.getAttribute('class')) || '';
    expect(internalCls).not.toMatch(/red-500/);

    // The validation panel should also appear
    const panel = demo.locator('[data-test-message="validation-result"]');
    await expect(panel).toBeVisible({ timeout: 5_000 });

    await demo.screenshot({ path: path.join(SHOTS_DIR, '008-after-validate.png') });
  });

  test('TC-008-A3: 全部锁定 clears all red borders', async ({ page }) => {
    const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    // Enable highlight via 校验 first
    await demo.locator('[data-test-button="validate"]').click();
    await page.waitForTimeout(200);

    // Then click 全部锁定
    await demo.locator('[data-test-button="lock-all"]').click();
    await page.waitForTimeout(300);

    const rows = demo.locator('[data-testid="node-row"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      expect(cls, `row ${i} should not have red-500 after lock-all`).not.toMatch(
        /red-500/,
      );
    }
  });

  test('TC-008-A4: 全部解锁 restores red borders', async ({ page }) => {
    const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    await demo.locator('[data-test-button="lock-all"]').click();
    await demo.locator('[data-test-button="unlock-all"]').click();
    await page.waitForTimeout(500);

    // Expand node 1 so its children are visible
    const caret = demo
      .locator('[data-node-id="1"] button[aria-label*="展"]')
      .first();
    if ((await caret.count()) > 0) {
      await caret.click();
      await page.waitForTimeout(300);
    }

    for (const id of ['1.1', '1.2', '2', '3']) {
      const row = demo
        .locator(`[data-node-id="${id}"] [data-testid="node-row"]`)
        .first();
      const cls = (await row.getAttribute('class')) || '';
      expect(cls, `id=${id} should have border-red-500 after unlock-all`).toMatch(
        /border-red-500/,
      );
    }
  });

  test('TC-008-A5: Reset clears red borders and validation panel', async ({ page }) => {
    const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    // Enable via 校验
    await demo.locator('[data-test-button="validate"]').click();
    await page.waitForTimeout(200);
    await expect(
      demo.locator('[data-test-message="validation-result"]'),
    ).toBeVisible();

    // Click Reset
    await demo.locator('[data-test-button="reset"]').click();
    await page.waitForTimeout(200);

    // Validation panel should be hidden
    await expect(
      demo.locator('[data-test-message="validation-result"]'),
    ).toBeHidden();

    // No red borders
    const rows = demo.locator('[data-testid="node-row"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      expect(cls, `row ${i} should not have red-500 after reset`).not.toMatch(/red-500/);
    }
  });
});
