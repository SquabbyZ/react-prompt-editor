import { expect, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * request 007 — locked-state visual cue bugfix
 *
 * Runs against the dedicated test-harness page (Vite dev at :5173) which
 * mounts the `locked-state-visual-cue` demo. The demo now lives without the
 * 「校验」 button and the bottom validation-result panel.
 *
 * Visual rule: the red border is rendered on the **whole row** of a node
 * (`data-testid="node-row"`, the outer rounded container) — not on the
 * title text wrapper. The cue only fires for **leaf nodes** (no children)
 * whose **content is non-empty** and which are not currently locked or
 * being edited. Internal/parent nodes and leaves with empty content do
 * NOT get the red border even if they are unlocked.
 *
 * Demo fixture (8 root nodes + 2 children):
 *   id="1"     internal (has 1.1 child)        isLocked=false  content non-empty
 *   id="1.1"   leaf                            isLocked=false  content non-empty
 *   id="2"     leaf                            isLocked=true   content non-empty
 *   id="3"     leaf                            isLocked=false  content non-empty
 *   id="4"     leaf                            isLocked=false  content non-empty
 *   id="5"     leaf                            isLocked=false  content non-empty
 *   id="6"     leaf                            isLocked=false  content non-empty
 *   id="7"     internal (has 7.1 child)        isLocked=false  content EMPTY
 *   id="7.1"   leaf                            isLocked=false  content non-empty
 *   id="8"     leaf (no children)              isLocked=false  content non-empty
 *
 *   Expected red-border set on initial render:
 *     { 1.1, 3, 4, 5, 6, 7.1, 8 }   (leaves with non-empty content that are unlocked)
 *
 *   Rows visible in flat order: 1, 1.1, 2, 3, 4, 5, 6, 7, 7.1, 8 — 10 rows.
 */
const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';
fs.mkdirSync(SHOTS_DIR, { recursive: true });

// Flat row order: 1, 1.1, 2, 3, 4, 5, 6, 7, 7.1, 8 — 10 rows.
// 1.1 and 7.1 are only visible after their parent (1, 7) is expanded.
const EXPECTED_INITIAL = [
  { id: '1',   highlighted: false }, // internal node
  { id: '1.1', highlighted: true  }, // leaf, unlocked, content non-empty
  { id: '2',   highlighted: false }, // locked at initial state
  { id: '3',   highlighted: true  },
  { id: '4',   highlighted: true  },
  { id: '5',   highlighted: true  },
  { id: '6',   highlighted: true  },
  { id: '7',   highlighted: false }, // empty content
  { id: '7.1', highlighted: true  }, // child leaf with content
  { id: '8',   highlighted: true  },
];

// After 全部解锁, every leaf with non-empty content is highlighted.
// Node 2 (a leaf with content) is now also highlighted.
const EXPECTED_AFTER_UNLOCK = EXPECTED_INITIAL.map((row) =>
  row.id === '2' ? { id: '2', highlighted: true } : row,
);

const ROWS_EXPANDED = EXPECTED_INITIAL.length; // 10 (after expanding parents)

async function expandParents(page: import('@playwright/test').Page) {
  for (const id of ['1', '7']) {
    const caret = page
      .locator(`[data-test-demo="locked-state-visual-cue"] [data-node-id="${id}"] button[aria-label*="展"]`)
      .first();
    if ((await caret.count()) > 0) {
      await caret.click();
    }
  }
  await page.waitForTimeout(300);
}

test.describe('007 locked-state visual cue bugfix', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE + '/', { timeout: 30_000 });
  });

  test('TC-A1: leaves with content get the red border, internal/empty/locked nodes do not', async ({
    page,
  }) => {
    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    await expandParents(page);

    const rows = demo.locator('[data-testid="node-row"]');
    await expect(rows).toHaveCount(ROWS_EXPANDED, { timeout: 10_000 });

    for (let i = 0; i < EXPECTED_INITIAL.length; i++) {
      const exp = EXPECTED_INITIAL[i];
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      const attr = await rows.nth(i).getAttribute('data-is-highlighted');
      if (exp.highlighted) {
        expect(cls, `row ${i} (id=${exp.id}) should have red-500`).toMatch(/red-500/);
        expect(attr, `row ${i} (id=${exp.id}) data-is-highlighted`).toBe('true');
      } else {
        expect(cls, `row ${i} (id=${exp.id}) should NOT have red-500`).not.toMatch(/red-500/);
        expect(attr, `row ${i} (id=${exp.id}) data-is-highlighted`).toBe('false');
      }
    }

    await demo.screenshot({
      path: path.join(SHOTS_DIR, '007-initial-red-outlines.png'),
    });
  });

  test('TC-A2: locking node 3 removes only its red border', async ({ page }) => {
    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    await expandParents(page);

    const rows = demo.locator('[data-testid="node-row"]');
    await expect(rows).toHaveCount(ROWS_EXPANDED, { timeout: 10_000 });

    // Lock node 3 via its per-node lock button.
    const node3 = demo.locator('[data-node-id="3"]').first();
    const lock3 = node3.getByRole('button', { name: '锁定节点', exact: true });
    await expect(lock3).toBeEnabled({ timeout: 5_000 });
    await lock3.click();

    // After locking node 3:
    //   - node 3 (row idx 3) is no longer highlighted
    //   - all other rows that were highlighted stay highlighted
    for (let i = 0; i < EXPECTED_INITIAL.length; i++) {
      const exp = EXPECTED_INITIAL[i];
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      if (exp.id === '3') {
        expect(cls, `row ${i} (id=3) should NOT have red-500 after lock`).not.toMatch(
          /red-500/,
        );
      } else if (exp.highlighted) {
        expect(cls, `row ${i} (id=${exp.id}) should still have red-500`).toMatch(/red-500/);
      } else {
        expect(cls, `row ${i} (id=${exp.id}) should never have red-500`).not.toMatch(
          /red-500/,
        );
      }
    }
  });

  test('TC-A3: double-click on a title suppresses the red border while editing', async ({
    page,
  }) => {
    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    const rows = demo.locator('[data-testid="node-row"]');
    // Node 3 is a top-level leaf, no parent expansion needed.
    await expect(rows.nth(2)).toBeVisible({ timeout: 5_000 });

    // baseline: node 3 (row idx 2) has the red border
    const before = (await rows.nth(2).getAttribute('class')) || '';
    expect(before).toMatch(/red-500/);

    // dblClick the title text of node 3 to enter edit mode
    const titleText = demo
      .locator('[data-node-id="3"] [data-testid="node-title"]')
      .getByText('3. 方案设计');
    await expect(titleText).toBeVisible({ timeout: 5_000 });
    await titleText.dblclick();

    // wait for the data-is-highlighted attribute to flip to "false"
    await expect(rows.nth(2)).toHaveAttribute(
      'data-is-highlighted',
      'false',
      { timeout: 5_000 },
    );
    const during = (await rows.nth(2).getAttribute('class')) || '';
    expect(during).not.toMatch(/red-500/);

    // press Escape to cancel editing → red border returns
    await page.keyboard.press('Escape');
    await expect(rows.nth(2)).toHaveAttribute(
      'data-is-highlighted',
      'true',
      { timeout: 5_000 },
    );
    const after = (await rows.nth(2).getAttribute('class')) || '';
    expect(after).toMatch(/red-500/);

    await demo.screenshot({
      path: path.join(SHOTS_DIR, '007-edit-suppresses-outline.png'),
    });
  });

  test('TC-A4: 全部锁定 hides every red border and shows the all-locked banner', async ({
    page,
  }) => {
    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    await expandParents(page);

    const lockAll = demo.locator('[data-test-button="lock-all"]');
    await expect(lockAll).toBeVisible({ timeout: 5_000 });
    await lockAll.click();

    const rows = demo.locator('[data-testid="node-row"]');
    await expect(rows).toHaveCount(ROWS_EXPANDED, { timeout: 10_000 });
    for (let i = 0; i < ROWS_EXPANDED; i++) {
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      expect(cls, `row ${i} should not have red-500 after lock-all`).not.toMatch(/red-500/);
    }

    const banner = demo.locator('[data-test-message="all-locked"]');
    await expect(banner).toBeVisible({ timeout: 5_000 });
    expect((await banner.textContent()) || '').toContain('全部节点已锁定');
  });

  test('TC-A5: 全部解锁 restores red borders on leaves with content; internal/empty stay clean', async ({
    page,
  }) => {
    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    await demo.locator('[data-test-button="lock-all"]').click();
    await demo.locator('[data-test-button="unlock-all"]').click();
    await page.waitForTimeout(300);
    await expandParents(page);

    const rows = demo.locator('[data-testid="node-row"]');
    await expect(rows).toHaveCount(ROWS_EXPANDED, { timeout: 10_000 });

    // After unlock-all: every leaf with non-empty content is highlighted.
    // Node 2 (a leaf with content) was locked initially, now unlocked → red.
    for (let i = 0; i < EXPECTED_AFTER_UNLOCK.length; i++) {
      const exp = EXPECTED_AFTER_UNLOCK[i];
      const cls = (await rows.nth(i).getAttribute('class')) || '';
      if (exp.highlighted) {
        expect(cls, `row ${i} (id=${exp.id}) should have red-500`).toMatch(/red-500/);
      } else {
        expect(cls, `row ${i} (id=${exp.id}) should NOT have red-500`).not.toMatch(
          /red-500/,
        );
      }
    }

    const banner = demo.locator('[data-test-message="all-locked"]');
    await expect(banner).toBeHidden();
  });

  test('TC-A6: 校验 button and validation-result panel are GONE from the demo', async ({
    page,
  }) => {
    const demo = page.locator('[data-test-demo="locked-state-visual-cue"]');
    await expect(demo).toBeVisible({ timeout: 30_000 });

    await expect(demo.locator('[data-test-button="validate"]')).toHaveCount(0);
    await expect(
      demo.locator('[data-test-message="validation-result"]'),
    ).toHaveCount(0);
  });
});
