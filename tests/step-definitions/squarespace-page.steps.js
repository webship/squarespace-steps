'use strict';

// Page steps: the hero title and its button, the footer, and the facts the
// page reports about itself in `Static.SQUARESPACE_CONTEXT` (template
// version, site title and language).

const { Then } = require('@cucumber/cucumber');
const { friendly } = require('webship-js/tests/step-definitions/webship');
const { SELECTORS, budget, heroTitle, heroInPage, assertScan, assertContext } = require('./squarespace-helpers');

/**
 * Assert the page's hero title is (or is not) the given text. The hero title
 * is the first level-one heading of the page content; headings in the header,
 * the footer and in list items (blog posts, products) are left out. The text
 * is compared after collapsing whitespace and is case sensitive.
 *
 * Example #1: Then the hero title should be "Starts With You"
 * Example #2: And the hero title should be "Contact"
 * Example #3: Then the hero title should be "Scents in every shape"
 * Example #4: But the hero title should not be "Journal"
 * Example #5: Then hero title should be "Welcome"
 *
 */
Then(/^(?:the )?hero title should( not)* be "([^"]*)"$/, async function (notCase, title) {
  try {
    await this.page.waitForFunction(
      `(${heroInPage.toString()})(${JSON.stringify({ excluded: SELECTORS.heroExcluded })}) ${notCase ? '!==' : '==='} ${JSON.stringify(title)}`,
      undefined,
      { timeout: budget(this) }
    );
  } catch {
    const found = await heroTitle(this).catch(() => null);
    throw friendly({
      message: notCase
        ? `Expected the hero title not to be "${title}", but it is.`
        : `Expected the hero title "${title}" but found ${found === null ? 'no level-one heading' : `"${found}"`}.`,
      hint: 'The hero title is the first `h1` of the page content, outside the header, the footer and list items; the comparison ignores extra whitespace but not case.',
    });
  }
});

/**
 * Assert the page's first button (a Squarespace button block) does, or does
 * not, link to the given address. The address is compared as written in the
 * markup, so a relative link is "/shop" and not the full URL.
 *
 * Example #1: Then the hero call-to-action button should link to "/take-action"
 * Example #2: And the hero call-to-action button should link to "/contact"
 * Example #3: Then the hero call-to-action button should not link to "/about"
 * Example #4: Then the hero CTA should link to "/news"
 * Example #5: Then hero call-to-action button should link to "/"
 *
 */
Then(/^(?:the )?hero (?:call-to-action button|CTA) should( not)* link to "([^"]*)"$/, async function (notCase, href) {
  const read = `(() => { const b = [...document.querySelectorAll(${JSON.stringify(SELECTORS.button)})].find((e) => !e.closest('header, footer')); return b ? b.getAttribute('href') : null; })()`;
  try {
    await this.page.waitForFunction(`${read} ${notCase ? '!==' : '==='} ${JSON.stringify(href)}`, undefined, { timeout: budget(this) });
  } catch {
    const actual = await this.page.evaluate(read).catch(() => null);
    throw friendly({
      message: notCase
        ? `Expected the hero call-to-action button not to link to "${href}", but it does.`
        : actual === null
          ? 'Expected a hero call-to-action button, but the page has no button block outside the header and the footer.'
          : `Expected the hero call-to-action button to link to "${href}" but found "${actual}".`,
      hint: 'The hero button is the first button block (`.sqs-block-button-element`) of the page; its address is compared exactly as written in the markup.',
    });
  }
});

/**
 * Assert the site footer is (or is not) visible on the page.
 *
 * Example #1: Then the site footer should be visible
 * Example #2: And the site footer should be visible
 * Example #3: Then I should see the site footer
 * Example #4: Then the footer should not be visible
 * Example #5: And we should see the footer
 *
 */
Then(/^(?:(?:the )?(?:site )?footer should( not)* be visible|(?:I |we )*should( not)* see the (?:site )?footer)$/, async function (notVisible, notSee) {
  await assertScan(this, { selector: SELECTORS.footer, visible: true }, {
    not: Boolean(notVisible || notSee),
    what: 'the site footer to be visible',
    hint: 'The footer is `footer#footer-sections` on 7.1 and `footer.Footer` on 7.0; check the page is fully loaded.',
  });
});

/**
 * Assert the footer does (or does not) contain a copyright notice: the
 * "©" sign, "(c)" or the word "copyright". Squarespace adds no copyright
 * line of its own; the site owner writes it in a footer text block.
 *
 * Example #1: Then the footer should show a copyright notice
 * Example #2: And the footer should show a copyright notice
 * Example #3: Then the site footer should show a copyright notice
 * Example #4: And the footer should not display a copyright notice
 * Example #5: Then the footer should show a copyright
 *
 */
Then(/^(?:the )?(?:site )?footer should( not)* (?:show|display) a copyright(?: notice)?$/, async function (notCase) {
  const read = `(() => { const f = document.querySelector(${JSON.stringify(SELECTORS.footer)}); return Boolean(f) && /©|\\(c\\)|copyright/i.test(f.textContent); })()`;
  try {
    await this.page.waitForFunction(`${read} === ${!notCase}`, undefined, { timeout: budget(this) });
  } catch {
    const text = (await this.page.evaluate(`(document.querySelector(${JSON.stringify(SELECTORS.footer)}) || {}).textContent || ''`).catch(() => '')).replace(/\s+/g, ' ').trim();
    throw friendly({
      message: notCase
        ? 'Expected the footer not to show a copyright mark, but it does.'
        : `Expected a copyright mark (©, (c) or "copyright") in the footer, but its text is "${text.slice(0, 120)}".`,
      hint: 'Squarespace adds no copyright line of its own; it is a text block the site owner writes in the footer.',
    });
  }
});

/**
 * Assert the footer holds (or does not hold) a link with the given label.
 * Links in text blocks, button blocks and social icons (matched by their
 * aria-label) count.
 *
 * Example #1: Then the footer navigation should contain "Contact"
 * Example #2: And the footer navigation should contain "Shipping & Returns"
 * Example #3: Then the footer navigation should contain "Instagram"
 * Example #4: But the footer navigation should not contain "Checkout"
 * Example #5: And footer navigation should contain "Privacy"
 *
 */
Then(/^(?:the )?footer navigation should( not)* contain "([^"]*)"$/, async function (notCase, label) {
  await assertScan(this, { selector: SELECTORS.footerLinks, text: label, visible: false }, {
    not: Boolean(notCase),
    what: `a footer link labeled "${label}"`,
    hint: 'Footer links are all the links inside `footer#footer-sections` (7.1) or `footer.Footer` (7.0), matched by their text or aria-label, exactly.',
  });
});

/**
 * Assert which Squarespace generation the site runs on, read from
 * `Static.SQUARESPACE_CONTEXT.templateVersion`: "7.1" or "7.0".
 *
 * Example #1: Then the site should use Squarespace 7.1
 * Example #2: And the site should use Squarespace 7.1
 * Example #3: Then the site should not use Squarespace 7.0
 * Example #4: Then the site should use Squarespace 7.0
 * Example #5: But the site should not use Squarespace 7.1
 *
 */
Then(/^(?:the )?site should( not)* use Squarespace (7\.0|7\.1)$/, async function (notCase, version) {
  await assertContext(this, 'templateVersion', version === '7.0' ? '7' : '7.1', Boolean(notCase), {
    what: 'the Squarespace version',
    hint: 'The version is `Static.SQUARESPACE_CONTEXT.templateVersion` ("7.1", or "7" for 7.0); a page that is not a Squarespace site has no such object.',
  });
});

/**
 * Assert the site title, as set in the Squarespace site settings and read
 * from `Static.SQUARESPACE_CONTEXT.website.siteTitle`. It can differ from the
 * title of the page.
 *
 * Example #1: Then the site title should be "Bailard Foundation"
 * Example #2: And the site title should be "SOONY CANDLE"
 * Example #3: Then the site title should be "Brine"
 * Example #4: But the site title should not be "Untitled"
 * Example #5: And site title should be "Hester"
 *
 */
Then(/^(?:the )?site title should( not)* be "([^"]*)"$/, async function (notCase, title) {
  await assertContext(this, 'siteTitle', title, Boolean(notCase), {
    what: 'the site title',
    hint: 'The site title is `Static.SQUARESPACE_CONTEXT.website.siteTitle`; it is set in the site settings and is not the page title.',
  });
});

/**
 * Assert the site language, as set in the Squarespace site settings and read
 * from `Static.SQUARESPACE_CONTEXT.website.language` (for example "en-US").
 *
 * Example #1: Then the site language should be "en-US"
 * Example #2: And the site language should be "en-US"
 * Example #3: Then the site language should be "fr-FR"
 * Example #4: But the site language should not be "de-DE"
 * Example #5: And site language should be "en-GB"
 *
 */
Then(/^(?:the )?site language should( not)* be "([^"]*)"$/, async function (notCase, language) {
  await assertContext(this, 'language', language, Boolean(notCase), {
    what: 'the site language',
    hint: 'The language is `Static.SQUARESPACE_CONTEXT.website.language`; it is set in the site settings.',
  });
});
