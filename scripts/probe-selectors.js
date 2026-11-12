'use strict';

// Counts, on real pages, the elements every selector of the pack matches, at a
// desktop and a mobile viewport: how many exist and how many are visible. It is
// how the selectors in tests/step-definitions/squarespace-helpers.js are
// checked against what Squarespace renders (docs/selector-evidence.md). It only
// loads the pages; use it on public sites and keep the number of pages small.
//
// Usage: npm run probe -- <url> [<url> ...]   (prints a markdown table per page)

const { chromium } = require('playwright');
const { SELECTORS } = require('../tests/step-definitions/squarespace-selectors');

const VIEWPORTS = { desktop: { width: 1280, height: 900 }, mobile: { width: 375, height: 700 } };

const simple = [...new Set(Object.values(SELECTORS)
  .filter((value) => typeof value === 'string')
  .flatMap((value) => value.split(/,\s*/)))];

function count(selectors) {
  return selectors.map((selector) => {
    let found;
    try { found = [...document.querySelectorAll(selector)]; } catch (error) { return [selector, null, null]; }
    const visible = found.filter((el) => {
      const rects = el.getClientRects();
      const style = getComputedStyle(el);
      return rects.length > 0 && rects[0].width > 0 && rects[0].height > 0 && style.visibility !== 'hidden';
    }).length;
    return [selector, found.length, visible];
  });
}

(async () => {
  const urls = process.argv.slice(2);
  if (!urls.length) {
    console.error('Usage: npm run probe -- <url> [<url> ...]');
    process.exit(2);
  }
  const browser = await chromium.launch();
  for (const url of urls) {
    const rows = {};
    for (const [name, viewport] of Object.entries(VIEWPORTS)) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'load', timeout: 45000 });
      await page.waitForTimeout(3000);
      for (const [selector, total, visible] of await page.evaluate(`(${count.toString()})(${JSON.stringify(simple)})`)) {
        rows[selector] = rows[selector] || {};
        rows[selector][name] = total === null ? 'invalid' : `${total}/${visible}`;
      }
      await context.close();
    }
    console.log(`\n### ${url}\n\n| Selector | Desktop (found/visible) | Mobile (found/visible) |\n| --- | --- | --- |`);
    for (const selector of simple) {
      const row = rows[selector];
      if (row && (row.desktop !== '0/0' || row.mobile !== '0/0')) console.log(`| \`${selector}\` | ${row.desktop} | ${row.mobile} |`);
    }
  }
  await browser.close();
})();
