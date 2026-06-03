import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Verify the 3 docs/example files render and behave correctly in a real
 * browser. We bypass dumi (which is broken in this env) and serve the
 * examples directly via a Vite dev server on :5173.
 *
 * Each demo is wrapped in a div with a unique `data-test-demo` attribute
 * for unambiguous scoping, so selectors like `[data-test-demo="..."] [data-node-id="1"]`
 * only match the intended demo.
 */
const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

const consoleErrors: string[] = [];
const pageErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  pageErrors.length = 0;
  page.on('pageerror', (e) => pageErrors.push(e.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
});

test.describe('docs/examples render and lock behavior', () => {
  test('TC-1: all-nodes-locked — click lock on each root, indicator appears', async ({
    page,
  }) => {
    await page.goto(BASE + '/', { timeout: 30_000 });

    const demo = page.locator('[data-test-demo="all-nodes-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    // The demo has 3 root nodes: 1, 2, 3.
    for (const id of ['1', '2', '3']) {
      const node = demo.locator(`[data-node-id="${id}"]`).first();
      await expect(node).toBeVisible({ timeout: 10_000 });
      const lockButton = node.getByRole('button', { name: '锁定节点', exact: true });
      await expect(lockButton).toBeEnabled({ timeout: 5_000 });
      await lockButton.click();
    }

    // Persistent indicator (visible block) — not the antd message portal.
    const indicator = demo.locator('[data-test-message="all-locked"]');
    await expect(indicator).toBeVisible({ timeout: 5_000 });
    const txt = (await indicator.textContent()) || '';
    expect(txt).toContain('全部节点已锁定');

    const shotPath = path.join(SHOTS_DIR, '005-all-nodes-locked.png');
    await demo.screenshot({ path: shotPath });
    test.info().annotations.push({ type: 'screenshot', description: shotPath });
  });

  test('TC-2: leaf-and-content-locked — click lock on all leaves + all non-empty content nodes', async ({
    page,
  }) => {
    await page.goto(BASE + '/', { timeout: 30_000 });

    const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    // The demo tree:
    //   - "1" (root, has 1.1 and 1.2 children; non-empty content; NOT a leaf)
    //   - "1.1" (leaf, non-empty content)
    //   - "1.2" (leaf, non-empty content)
    //   - "2" (leaf, non-empty content)
    //   - "3" (leaf, non-empty content)
    // Node "1" is collapsed by default — expand it first so children render.
    const caret = demo
      .locator('[data-node-id="1"] button[aria-label*="展"]')
      .first();
    await expect(caret).toBeVisible({ timeout: 10_000 });
    await caret.click();
    await page.waitForTimeout(300);

    const ids = ['1', '1.1', '1.2', '2', '3'];

    for (const id of ids) {
      const node = demo.locator(`[data-node-id="${id}"]`).first();
      await expect(node).toBeVisible({ timeout: 10_000 });
      const lockButton = node.getByRole('button', { name: '锁定节点', exact: true });
      await expect(lockButton).toBeEnabled({ timeout: 5_000 });
      await lockButton.click();
    }

    const leafIndicator = demo.locator('[data-test-message="leaf-locked"]');
    const contentIndicator = demo.locator('[data-test-message="content-locked"]');
    await expect(leafIndicator).toBeVisible({ timeout: 5_000 });
    await expect(contentIndicator).toBeVisible({ timeout: 5_000 });
    expect((await leafIndicator.textContent()) || '').toContain('全部叶子节点已锁定');
    expect((await contentIndicator.textContent()) || '').toContain('全部非空内容节点已锁定');

    const shotPath = path.join(SHOTS_DIR, '005-leaf-and-content-locked.png');
    await demo.screenshot({ path: shotPath });
    test.info().annotations.push({ type: 'screenshot', description: shotPath });
  });

  test('TC-3: locked-state-visual-cue — unlocked leaves with content get red border, then disappear', async ({
    page,
  }) => {
    await page.goto(BASE + '/', { timeout: 30_000 });

    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    // Expand nodes 1 and 7 so their children (1.1, 7.1) are in the DOM and
    // we can lock them.
    for (const id of ['1', '7']) {
      const caret = demo
        .locator(`[data-node-id="${id}"] button[aria-label*="展"]`)
        .first();
      if ((await caret.count()) > 0) {
        await caret.click();
        await page.waitForTimeout(300);
      }
    }

    // Expect: the unlocked leaf nodes 3, 4, 5, 6, 8, 1.1, 7.1 have the
    // red border. Nodes 1 and 7 (internal/empty-content) do NOT.
    for (const id of ['3', '4', '5', '6', '8', '1.1', '7.1']) {
      const row = demo
        .locator(`[data-node-id="${id}"] [data-testid="node-row"]`)
        .first();
      await expect(row).toBeVisible({ timeout: 10_000 });
      const cls = (await row.getAttribute('class')) || '';
      expect(cls).toContain('border-red-500');
    }
    for (const id of ['1', '7']) {
      const row = demo
        .locator(`[data-node-id="${id}"] [data-testid="node-row"]`)
        .first();
      const cls = (await row.getAttribute('class')) || '';
      expect(cls).not.toContain('border-red-500');
    }

    // Lock every unlocked leaf (3, 4, 5, 6, 8, 1.1, 7.1) to satisfy the
    // "all nodes locked" predicate.
    for (const id of ['3', '4', '5', '6', '8', '1.1', '7.1']) {
      const node = demo.locator(`[data-node-id="${id}"]`).first();
      const lockButton = node.getByRole('button', { name: '锁定节点', exact: true });
      await expect(lockButton).toBeEnabled({ timeout: 5_000 });
      await lockButton.click();
    }
    // Also lock node 2 (initially locked) and node 1, 7 (internal/empty)
    // so the all-locked banner fires. Node 2 is already locked; lock 1, 7.
    for (const id of ['1', '7']) {
      const node = demo.locator(`[data-node-id="${id}"]`).first();
      const lockButton = node.getByRole('button', { name: '锁定节点', exact: true });
      await expect(lockButton).toBeEnabled({ timeout: 5_000 });
      await lockButton.click();
    }

    // After all locked, indicator shows.
    const indicator = demo.locator('[data-test-message="all-locked"]');
    await expect(indicator).toBeVisible({ timeout: 5_000 });
    expect((await indicator.textContent()) || '').toContain('全部节点已锁定');

    // Red border should now be GONE from every row.
    const rows = demo.locator('[data-testid="node-row"]');
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      expect(cls, `row ${i}`).not.toContain('border-red-500');
    }

    const shotPath = path.join(SHOTS_DIR, '005-locked-state-visual-cue.png');
    await demo.screenshot({ path: shotPath });
    test.info().annotations.push({ type: 'screenshot', description: shotPath });
  });
});

test.afterEach(async ({}, testInfo) => {
  if (pageErrors.length || consoleErrors.length) {
    console.log(`[${testInfo.title}] pageErrors:`, pageErrors);
    console.log(`[${testInfo.title}] consoleErrors:`, consoleErrors);
  }
});
