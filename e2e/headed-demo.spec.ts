import { test, expect } from '@playwright/test';

const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';

/**
 * Headed real-browser walkthrough of the leaf-and-content-locked demo.
 * Run with: `npx playwright test e2e/_headed-demo.spec.ts --headed --workers=1`
 *
 * Each step pauses so the user can see the browser state in real time.
 */

test('headed walkthrough: leaf-and-content-locked 校验 button → red border', async ({ page }) => {
  // STEP 0: Open the test-harness page and locate the target demo
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
  await demo.waitFor({ timeout: 30_000 });
  await demo.scrollIntoViewIfNeeded();
  console.log('[1/5] Demo block visible. Initial state has no red borders.');

  // Snapshot BEFORE clicking 校验
  await page.screenshot({
    path: `${SHOTS_DIR}/headed-1-initial.png`,
    fullPage: false,
  });
  await page.waitForTimeout(800);

  // STEP 1: Click 校验 (检查未锁定) — should now show red borders
  console.log('[2/5] Clicking 校验...');
  const validateBtn = demo.locator('[data-test-button="validate"]');
  await expect(validateBtn).toBeVisible();
  await validateBtn.click();
  await page.waitForTimeout(500);

  // Expand node 1 so 1.1 and 1.2 are visible (they're hidden when parent is collapsed)
  console.log('[3/5] Expanding node 1 so 1.1 and 1.2 are visible...');
  const caret = demo.locator('[data-node-id="1"] button[aria-label*="展"]').first();
  if (await caret.count() > 0) {
    await caret.click();
    await page.waitForTimeout(500);
  }

  // Capture state AFTER 校验
  await page.screenshot({
    path: `${SHOTS_DIR}/headed-2-after-validate.png`,
    fullPage: false,
  });

  // Read out the actual className on each visible row for the user
  const rows = demo.locator('[data-testid="node-row"]');
  const count = await rows.count();
  console.log(`[4/5] Found ${count} rendered rows in the demo:`);
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const dataNodeId = await row.evaluate((el) => {
      const p = el.closest('[data-node-id]');
      return p?.getAttribute('data-node-id') ?? '?';
    });
    const cls = await row.getAttribute('class');
    const highlighted = await row.getAttribute('data-is-highlighted');
    const hasRed = cls?.includes('red-500') ?? false;
    const tagText = await row.locator('.prompt-editor-node-title-text').first().textContent().catch(() => '');
    console.log(`  - node ${dataNodeId} (row ${i})  highlighted=${highlighted}  red=${hasRed}  text=${tagText?.slice(0, 24)}`);
  }

  // STEP 2: Now click 全部锁定 to verify red borders disappear
  console.log('[5/5] Clicking 全部锁定...');
  await demo.locator('[data-test-button="lock-all"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({
    path: `${SHOTS_DIR}/headed-3-after-lock-all.png`,
    fullPage: false,
  });

  const rowsLocked = demo.locator('[data-testid="node-row"]');
  for (let i = 0; i < (await rowsLocked.count()); i++) {
    const cls = (await rowsLocked.nth(i).getAttribute('class')) || '';
    expect(cls, `row ${i}`).not.toContain('red-500');
  }
  console.log('  ✓ all rows are now border-transparent after 全部锁定');
});
