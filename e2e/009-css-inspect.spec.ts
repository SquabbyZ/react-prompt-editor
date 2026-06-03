import { test } from '@playwright/test';

const BASE = 'http://127.0.0.1:5173';

test('009 inspect: which stylesheets are loaded and which Tailwind rules are present', async ({ page }) => {
  await page.goto(BASE + '/', { timeout: 30_000 });
  await page.waitForTimeout(2000);

  const info = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map((s, idx) => {
      let allSelectors = [];
      try {
        allSelectors = Array.from(s.cssRules || [])
          .filter((r) => r instanceof CSSStyleRule)
          .map((r) => r.selectorText);
      } catch {}
      const borderSelectors = allSelectors.filter((sel) => sel && /border|outline|rounded/.test(sel));
      return { idx, href: s.href, ruleCount: allSelectors.length, borderSelectors: borderSelectors.slice(0, 20) };
    });
  });

  console.log('\n=== Stylesheets loaded by the test-harness ===\n');
  for (const s of info) {
    console.log(`sheet[${s.idx}]: rules=${s.ruleCount}  href=${s.href ?? '(inline)'}`);
    if (s.borderSelectors.length > 0) {
      console.log('  border/outline/rounded selectors:');
      for (const sel of s.borderSelectors) console.log(`    ${sel}`);
    }
  }
});
