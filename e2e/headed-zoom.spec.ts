import { test } from '@playwright/test';

const BASE = 'http://127.0.0.1:5173';
const SHOTS_DIR = '/Users/yuanyuan/Desktop/react-prompt-editor/.peaks/2026-06-02-session-45259d/qa/screenshots';

test('headed zoom + computed CSS readout (proof red-500 is on the leaf nodes)', async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto(BASE + '/', { timeout: 30_000 });
  const demo = page.locator('[data-test-demo="leaf-and-content-locked"]');
  await demo.waitFor({ timeout: 30_000 });

  // Expand node 1
  const caret = demo.locator('[data-node-id="1"] button[aria-label*="展"]').first();
  if (await caret.count() > 0) await caret.click();
  await page.waitForTimeout(300);

  // Click 校验
  await demo.locator('[data-test-button="validate"]').click();
  await page.waitForTimeout(500);

  // Read computed style + class on each node row
  const rows = demo.locator('[data-testid="node-row"]');
  const count = await rows.count();
  console.log('\n=== Computed CSS for each node row AFTER 校验 click ===\n');
  const records: Array<{id: string; red: boolean; outline: string; classList: string}> = [];
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    const dataNodeId = await row.evaluate((el) => {
      const p = el.closest('[data-node-id]');
      return p?.getAttribute('data-node-id') ?? '?';
    });
    const tagText = (await row.locator('.prompt-editor-node-title-text').first().textContent().catch(() => ''))?.trim() ?? '';
    const computed = await row.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        classList: el.className,
        borderWidth: cs.borderWidth,
        borderTopColor: cs.borderTopColor,
        borderTopWidth: cs.borderTopWidth,
        borderTopStyle: cs.borderTopStyle,
        borderLeftColor: cs.borderLeftColor,
        borderLeftWidth: cs.borderLeftWidth,
        // Inspect the matching CSS rules
        matchingRules: Array.from(document.styleSheets)
          .flatMap((s) => {
            try { return Array.from(s.cssRules || []) as CSSStyleRule[]; }
            catch { return []; }
          })
          .filter((r) => r instanceof CSSStyleRule && r.selectorText && /border-(red-500|transparent|2)/.test(r.selectorText))
          .slice(0, 5)
          .map((r) => `${r.selectorText} { ${(r as CSSStyleRule).style.cssText} }`),
      };
    });
    const hasRed = /red-500/.test(computed.classList) || /rgb\(239,\s*68,\s*68\)/.test(computed.borderTopColor);
    records.push({id: dataNodeId, red: hasRed, outline: `${computed.borderTopStyle} ${computed.borderTopWidth} ${computed.borderTopColor}`, classList: computed.classList});
    console.log(`node ${dataNodeId}  ${hasRed ? '🔴 RED' : '⚪  no '}  text=${tagText}`);
    console.log(`  border-top:    ${computed.borderTopStyle} ${computed.borderTopWidth} ${computed.borderTopColor}`);
    console.log(`  border-left:   ${computed.borderTopWidth} ${computed.borderLeftColor}`);
    console.log(`  classes:       ${computed.classList}`);
  }

  // Take a tightly-cropped, deviceScaleFactor 2 screenshot of node 1.1 (a red row)
  const target = demo.locator('[data-node-id="1.1"] [data-testid="node-row"]');
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (box) {
    await page.screenshot({
      path: `${SHOTS_DIR}/headed-hires-leaf-1-1.png`,
      clip: { x: box.x - 8, y: box.y - 8, width: box.width + 60, height: box.height + 16 },
    });
  }

  // And a parent (node 1) for the "internal node excluded" rule
  const parent1 = demo.locator('[data-node-id="1"] [data-testid="node-row"]');
  await parent1.scrollIntoViewIfNeeded();
  const boxP = await parent1.boundingBox();
  if (boxP) {
    await page.screenshot({
      path: `${SHOTS_DIR}/headed-hires-parent-1.png`,
      clip: { x: boxP.x - 8, y: boxP.y - 8, width: boxP.width + 60, height: boxP.height + 16 },
    });
  }
});
