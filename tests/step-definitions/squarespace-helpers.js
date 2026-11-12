'use strict';

// Shared helpers for the Squarespace steps. The selectors are in
// squarespace-selectors.js.

const { friendly, smartSettle } = require('webship-js/tests/step-definitions/webship');

const { SELECTORS } = require('./squarespace-selectors');

/** The per-assertion wait budget: `minWaitTime.page` from cucumber.js, else 10 s. */
function budget(world) {
  return Math.max((world.minWaitTime && world.minWaitTime.page) || 0, 10000);
}

/** Settle the page after an action this pack performs itself. */
async function settle(world) {
  await smartSettle(world.page, 1500);
}

/**
 * Run an action and rethrow as a friendly error (action, target, cause and a
 * hint) instead of Playwright's raw timeout stack.
 */
async function actOrExplain(label, target, fn, hint) {
  try {
    return await fn();
  } catch (err) {
    throw friendly({ action: label, target, cause: err, hint });
  }
}

/**
 * Scan the page for elements. Self-contained: the function is serialised into
 * the page, so it must not use anything from this module.
 *
 * Collects every element matching `selector` (all of them, also the hidden
 * duplicates Squarespace renders for the desktop and the mobile header), takes
 * its label (the text with whitespace collapsed, else the aria-label) and
 * counts the elements that are visible and whose label equals `text`.
 */
function scanInPage(args) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const labelOf = (el) => {
    const inner = el.querySelector('.header-nav-folder-title-text, .header-nav-folder-item-content');
    return norm((inner || el).textContent) || norm(el.getAttribute('aria-label'));
  };
  const shown = (el) => {
    const rects = el.getClientRects();
    if (!rects.length) return false;
    const style = getComputedStyle(el);
    return style.visibility !== 'hidden' && style.display !== 'none' && rects[0].width > 0 && rects[0].height > 0;
  };
  const els = [...document.querySelectorAll(args.selector)];
  const rows = els.map((el) => ({ label: labelOf(el), shown: shown(el) }));
  const hasText = typeof args.text === 'string';
  const matched = rows.filter((r) => (!hasText || r.label === args.text) && (!args.visible || r.shown) && (!args.nonEmpty || r.label)).length;
  return {
    total: rows.length,
    visible: rows.filter((r) => r.shown).length,
    matched,
    labels: rows.filter((r) => r.label && (!args.visible || r.shown)).map((r) => r.label).slice(0, 12),
  };
}

const scanExpression = (args) => `(${scanInPage.toString()})(${JSON.stringify(args)})`;

/** Run one scan now. */
function scan(world, args) {
  return world.page.evaluate(scanExpression(args));
}

/** The labels as a short list for an error message. */
function listLabels(labels) {
  const unique = [...new Set(labels)];
  return unique.length ? ` Found: ${unique.map((l) => `"${l}"`).join(', ')}.` : '';
}

/**
 * Wait until the number of scan matches satisfies the condition, then throw a
 * friendly error with what was found otherwise: the wait and the assertion
 * are one call.
 *
 * @param {Object} world
 * @param {Object} args       `selector`, optional `text` (exact label), `visible`.
 * @param {Object} options    `not` (expect no match), `count` (expect exactly
 *                            this many), `what` (words for the message), `hint`.
 */
async function assertScan(world, args, { not = false, count, what, hint }) {
  const timeout = budget(world);
  const compare = count !== undefined ? `=== ${count}` : not ? '=== 0' : '> 0';
  try {
    await world.page.waitForFunction(`${scanExpression(args)}.matched ${compare}`, undefined, { timeout });
  } catch {
    const found = await scan(world, args).catch(() => ({ matched: 0, total: 0, visible: 0, labels: [] }));
    let message;
    if (count !== undefined) message = `Expected ${count} ${what} but found ${found.matched}.`;
    else if (not) message = `Expected no ${what}, but it is on the page.`;
    else message = `Expected ${what}, but it was not found within ${timeout} ms.`;
    if (!not && count === undefined) message += listLabels(found.labels);
    throw friendly({ message, hint });
  }
}

/**
 * Click the first visible element matching `selector` (and, with `text`,
 * whose label equals it). Squarespace renders the header twice, so the first
 * match in the page is often the hidden one.
 */
async function clickVisible(world, { selector, text, what, hint }) {
  await assertScan(world, { selector, text, visible: true }, { what, hint });
  const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let locator = world.page.locator(selector).filter({ visible: true });
  if (text !== undefined) locator = locator.filter({ hasText: new RegExp(`^\\s*(?:Folder:\\s*)?${escape(text)}\\s*$`) });
  await actOrExplain('click', what, () => locator.first().click({ timeout: budget(world) }), hint);
}

/** Whether the mobile menu is open: the template puts a class on the body. */
function menuIsOpen(world) {
  const classes = JSON.stringify(SELECTORS.menuOpenClasses);
  return world.page.evaluate(`${classes}.some((c) => document.body.classList.contains(c))`);
}

/**
 * Wait for the mobile menu to be open (or, with `not`, closed). The state is
 * the body class the template sets, so a menu that is merely off screen does
 * not count as open.
 */
async function waitForMenu(world, open, hint) {
  const classes = JSON.stringify(SELECTORS.menuOpenClasses);
  const timeout = budget(world);
  try {
    await world.page.waitForFunction(`${classes}.some((c) => document.body.classList.contains(c)) === ${open}`, undefined, { timeout });
  } catch {
    throw friendly({ message: `Expected the mobile menu to be ${open ? 'open' : 'closed'}, but it is ${open ? 'closed' : 'open'}.`, hint });
  }
}

/** The Squarespace context object (`Static.SQUARESPACE_CONTEXT`), or null. */
function squarespaceContext(world) {
  return world.page.evaluate('(window.Static && window.Static.SQUARESPACE_CONTEXT) ? { templateVersion: window.Static.SQUARESPACE_CONTEXT.templateVersion, siteTitle: window.Static.SQUARESPACE_CONTEXT.website && window.Static.SQUARESPACE_CONTEXT.website.siteTitle, language: window.Static.SQUARESPACE_CONTEXT.website && window.Static.SQUARESPACE_CONTEXT.website.language } : null');
}

/**
 * Poll the page context until `read(context)` equals `expected` (or, with
 * `not`, differs); throw a friendly error with the value that was found.
 */
async function assertContext(world, key, expected, not, { what, hint }) {
  const timeout = budget(world);
  const expression = `(function () { var c = window.Static && window.Static.SQUARESPACE_CONTEXT; var v = c && ${key === 'templateVersion' ? 'c.templateVersion' : `c.website && c.website.${key}`}; return (v === ${JSON.stringify(expected)}) === ${!not}; })()`;
  try {
    await world.page.waitForFunction(expression, undefined, { timeout });
  } catch {
    const context = await squarespaceContext(world).catch(() => null);
    const found = context ? context[key] : undefined;
    throw friendly({
      message: not
        ? `Expected ${what} not to be "${expected}", but it is.`
        : `Expected ${what} "${expected}" but found ${context ? `"${found}"` : 'no Squarespace context on this page'}.`,
      hint,
    });
  }
}

/**
 * Read the first level-one heading of the page content, leaving out the
 * header, the footer and list items (on a blog list the headings are the post
 * titles). Self-contained, serialised into the page.
 */
function heroInPage(args) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const heading = [...document.querySelectorAll('h1')].find((h) => !h.closest(args.excluded));
  return heading ? norm(heading.textContent) : null;
}

/** The text of the hero title, or null when the page has none. */
function heroTitle(world) {
  return world.page.evaluate(`(${heroInPage.toString()})(${JSON.stringify({ excluded: SELECTORS.heroExcluded })})`);
}

/**
 * Collect the labels of the pages inside a navigation folder: the dropdown of
 * the header (`.header-nav-folder-item`) or, in the burger menu, the folder
 * panel the folder link points to. Self-contained, serialised into the page.
 */
function folderPagesInPage(args) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const labelOf = (el) => {
    const inner = el.querySelector('.header-nav-folder-title-text, .header-nav-folder-item-content, .header-menu-nav-item-content');
    return norm((inner || el).textContent);
  };
  const pages = [];
  document.querySelectorAll(args.folder).forEach((folder) => {
    const title = folder.querySelector('.header-nav-folder-title');
    if (title && labelOf(title) === args.name) folder.querySelectorAll(args.pages).forEach((a) => pages.push(labelOf(a)));
  });
  document.querySelectorAll(args.menuFolderLink).forEach((link) => {
    if (labelOf(link) !== args.name) return;
    const id = link.getAttribute('data-folder-id');
    document.querySelectorAll('.header-menu-nav-folder').forEach((panel) => {
      if (panel.getAttribute('data-folder') === id) panel.querySelectorAll('.header-menu-nav-item:not(.header-menu-controls) a').forEach((a) => pages.push(labelOf(a)));
    });
  });
  return pages;
}

/** Wait until the folder holds (or, with `not`, lacks) a page with the label. */
async function assertFolderPage(world, name, label, not, hint) {
  const args = JSON.stringify({ folder: SELECTORS.navFolder, pages: SELECTORS.navFolderPages, menuFolderLink: SELECTORS.menuFolderLink, name });
  const read = `(${folderPagesInPage.toString()})(${args})`;
  try {
    await world.page.waitForFunction(`${read}.includes(${JSON.stringify(label)}) === ${!not}`, undefined, { timeout: budget(world) });
  } catch {
    const pages = await world.page.evaluate(read).catch(() => []);
    throw friendly({
      message: not
        ? `Expected the "${name}" navigation folder not to contain "${label}", but it does.`
        : `Expected the "${name}" navigation folder to contain "${label}".${pages.length ? ` It contains: ${[...new Set(pages)].map((l) => `"${l}"`).join(', ')}.` : ' No folder with that name was found.'}`,
      hint,
    });
  }
}

/**
 * Find a form control by the caption of its label inside a visible form.
 * Self-contained, serialised into the page. The caption is the label text
 * without the "(required)" mark and without an error message, so "Email"
 * finds "Email (required)" but "Name" does not find "First Name". A control
 * without a label (a dropdown) is found by its aria-label.
 */
function fieldInPage(args) {
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
  const shown = (el) => el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  for (const scope of document.querySelectorAll(args.scope)) {
    if (!shown(scope)) continue;
    for (const label of scope.querySelectorAll('label')) {
      const copy = label.cloneNode(true);
      copy.querySelectorAll('.description, .form-field-error, .field-error').forEach((n) => n.remove());
      if (norm(copy.textContent) === args.label && label.control) return label.control;
    }
    for (const control of scope.querySelectorAll('input, select, textarea')) {
      if (control.getAttribute('aria-label') === args.label) return control;
    }
  }
  return null;
}

/** Wait for the form control and return it as an element handle. */
async function findField(world, scope, label, hint) {
  const expression = `(${fieldInPage.toString()})(${JSON.stringify({ scope, label })})`;
  try {
    await world.page.waitForFunction(`${expression} !== null`, undefined, { timeout: budget(world) });
  } catch {
    const labels = await world.page.evaluate(`[...document.querySelectorAll(${JSON.stringify(scope + ' label')})].map((l) => l.textContent.replace(/\\s+/g, ' ').trim()).slice(0, 12)`).catch(() => []);
    throw friendly({ message: `Expected a form field labeled "${label}", but none was found within ${budget(world)} ms.${listLabels(labels)}`, hint });
  }
  return (await world.page.evaluateHandle(expression)).asElement();
}

/**
 * Wait until the form control labeled `label` shows (or, with `not`, does not
 * show) an error: `aria-invalid="true"` or an error message in its form item.
 */
async function assertFieldError(world, scope, label, not, hint) {
  const expression = `(() => { const c = (${fieldInPage.toString()})(${JSON.stringify({ scope, label })}); if (!c) return null; const item = c.closest('.form-item, .field'); return c.getAttribute('aria-invalid') === 'true' || Boolean(item && item.querySelector('.form-field-error, .field-error')); })()`;
  try {
    await world.page.waitForFunction(`${expression} === ${!not}`, undefined, { timeout: budget(world) });
  } catch {
    const state = await world.page.evaluate(expression).catch(() => null);
    throw friendly({
      message: state === null
        ? `Expected a form field labeled "${label}", but none was found.`
        : not ? `Expected no error on the "${label}" field, but it shows one.` : `Expected an error on the "${label}" field, but it shows none.`,
      hint,
    });
  }
}

module.exports = {
  fieldInPage,
  findField,
  assertFieldError,
  SELECTORS,
  heroTitle,
  heroInPage,
  assertFolderPage,
  budget,
  settle,
  actOrExplain,
  scan,
  assertScan,
  clickVisible,
  menuIsOpen,
  waitForMenu,
  assertContext,
};
