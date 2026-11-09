'use strict';

// squarespace-steps: custom webship-js Cucumber step definitions for
// testing Squarespace sites (navigation, hero, footer, forms, shop, blog,
// cart). Consuming projects load this file via cucumber.js `require`,
// alongside webship-js's own built-in step definitions:
//
//   require: [
//     'node_modules/webship-js/tests/step-definitions/**/*.js',
//     'node_modules/@webship-js/squarespace-steps/tests/step-definitions/squarespace.steps.js',
//     'tests/step-definitions/**/*.js',
//   ],
//
// Selectors cover the markup Squarespace renders on both template
// generations: 7.0 (Brine family: `.Header-nav-item`, `.Footer`,
// `.Mobile-bar-menu`, `.ProductList-item`, `.BlogList-item`) and 7.1
// (`.header-nav-item`, `#footer-sections`, `.header-burger-btn`,
// `.grid-item`, `.blog-item`), plus the classes both share
// (`.form-wrapper`, `.sqs-add-to-cart-button`, `.sqs-cart-quantity`,
// `.sqs-block-button-element`). README.md documents every step.
//
// The product word is optional in every sentence ("the Squarespace form"
// and "the form" both match). Every assertion waits for its condition (the
// assertion is the wait) for the `minWaitTime.page` budget, every action
// settles the page afterwards, and every failure is a friendly error with a
// hint instead of a raw assertion or Playwright stack.

const { When, Then } = require('@cucumber/cucumber');
const { smartSettle, friendly } = require('webship-js/tests/step-definitions/webship');

const NAV = '.Header-nav, .header-nav';
const NAV_LINK = '.Header-nav .Header-nav-item a, .Header-nav a.Header-nav-item, .header-nav .header-nav-item a';
const NAV_CURRENT = [
  '.Header-nav .Header-nav-item a[aria-current="page"]',
  '.Header-nav a.Header-nav-item--active',
  '.header-nav .header-nav-item--active a',
  '.header-nav .header-nav-item a[aria-current="page"]',
].join(', ');
const MOBILE_TOGGLE = '.Header-toggle, .Mobile-bar-menu, .header-burger-btn';
// The hero title is the first level-one heading of the page content. The
// list ends in a bare `h1`, so a page with no hero block still answers with
// its first heading (see README.md).
const HERO_TITLE = '.hero-title, main h1, #page h1, #siteWrapper h1, h1';
const HERO_CTA = '.hero .sqs-block-button-element, .sqs-block-button-element';
const FOOTER = '.Footer, footer.sections, #footer-sections';
const FOOTER_COPYRIGHT = '.Footer-copyright, .Footer, footer.sections, #footer-sections';
const FOOTER_NAV_LINK = '.Footer-nav .Footer-nav-item a, .Footer-nav a.Footer-nav-item, footer.sections a, #footer-sections a';
const FORM = '.form-wrapper';
const FORM_SUBMIT = '.form-wrapper .form-submit-button, .form-wrapper input[type="submit"], .form-wrapper button[type="submit"]';
const FORM_SUBMITTED = '.form-submitted-message, .form-submission-text';
const PRODUCT_ITEM = '.ProductList-item, .products .grid-item, .grid-item[data-item-id]';
const PRODUCT_TITLE = '.ProductItem-title, .ProductList-title, .grid-title';
const ADD_TO_CART = '.sqs-add-to-cart-button';
const CART_COUNT = '.Cart-count, .sqs-cart-quantity';
const BLOG_ITEM = '.BlogList-item, .blog-item, article.blog-basic-grid--container';
const BLOG_TITLE_LINK = '.BlogItem-title a, .BlogList-item-title a, .blog-title a';

const NAV_HINT = 'Navigation links are the header items of a 7.0 (`.Header-nav-item`) or 7.1 (`.header-nav-item`) template, matched by their visible text; check the label and that the header is not collapsed on this viewport.';
const FORM_HINT = 'Squarespace form blocks render inside `.form-wrapper`; the field is found by its label text and the submit button by `.form-submit-button` or `[type="submit"]`.';

/** The per-assertion wait budget: `minWaitTime.page` from cucumber.js, else 10 s. */
function budget(world) {
  return Math.max((world.minWaitTime && world.minWaitTime.page) || 0, 10000);
}

/** Settle the page after an action this pack performs itself. */
async function settle(world) {
  await smartSettle(world.page, 1500);
}

/**
 * Run a locator action and rethrow as a friendly error (action, target,
 * cause and a hint) instead of Playwright's raw timeout stack.
 */
async function actOrExplain(label, target, fn, hint) {
  try {
    return await fn();
  } catch (err) {
    throw friendly({ action: label, target, cause: err, hint });
  }
}

/**
 * Wait until `locator` has (or, with `notCase`, has no) match in `state`,
 * then throw a friendly error otherwise: the wait and the assertion are one
 * call.
 */
async function assertPresence(locator, notCase, { label, hint, timeout, state = 'visible' }) {
  const negative = state === 'attached' ? 'detached' : 'hidden';
  try {
    await locator.first().waitFor({ state: notCase ? negative : state, timeout });
  } catch {
    throw friendly({
      message: notCase ? `Expected not to find ${label}, but it is on the page.` : `Expected ${label}, but it did not appear within ${timeout} ms.`,
      hint,
    });
  }
}

/**
 * Poll until the trimmed text of the first `selector` match equals (or,
 * with `notCase`, differs from) `expected`; throw a friendly error with the
 * text that was found otherwise. `source` is `innerText` (rendered text) or
 * `textContent` (source text, unaffected by CSS text-transform).
 */
async function assertFirstText(world, selector, notCase, expected, { label, hint, source = 'innerText' }) {
  const timeout = budget(world);
  try {
    await world.page.waitForFunction(
      ({ sel, want, text, prop }) => {
        const el = document.querySelector(sel);
        return Boolean(el) && ((el[prop] || '').trim() === text) === want;
      },
      { sel: selector, want: !notCase, text: expected, prop: source },
      { timeout }
    );
  } catch {
    const found = (await world.page.locator(selector).first()[source]().catch(() => null));
    throw friendly({
      message: notCase
        ? `Expected ${label} not to be "${expected}", but it is.`
        : `Expected ${label} "${expected}" but found ${found === null ? 'no element' : `"${found.trim()}"`}.`,
      hint,
    });
  }
}

/**
 * Poll until the number of `selector` matches equals `expected`; throw a
 * friendly error with the count that was found otherwise.
 */
async function assertCount(world, selector, expected, { label, hint }) {
  const timeout = budget(world);
  try {
    await world.page.waitForFunction(({ sel, n }) => document.querySelectorAll(sel).length === n, { sel: selector, n: expected }, { timeout });
  } catch {
    const count = await world.page.locator(selector).count();
    throw friendly({ message: `Expected ${expected} ${label} but found ${count}.`, hint });
  }
}

// ---------------------------------------------------------------------------
// Navigation (Squarespace `.Header` / `.Header-nav`)
// ---------------------------------------------------------------------------

/**
 * Assert the main site navigation does (or does not) contain a link with
 * the given text.
 *
 * Example #1: Then the site navigation should contain "Shop"
 * Example #2: Then the site navigation should contain "About"
 * Example #3: And the site navigation should contain "Blog"
 * Example #4: But the site navigation should not contain "Checkout"
 * Example #5: Then the main navigation should contain "Home"
 *
 */
Then(/^(?:the )?(?:site |main )?navigation should( not)* contain "([^"]*)?"$/, async function (notCase, label) {
  await assertPresence(this.page.locator(NAV_LINK, { hasText: label }), notCase, {
    label: `a site navigation link labeled "${label}"`,
    hint: NAV_HINT,
    timeout: budget(this),
    state: 'attached',
  });
});

/**
 * Assert a given navigation item is (or is not) marked as the current page
 * (Squarespace marks the active link with aria-current="page" and an
 * `--active` modifier class).
 *
 * Example #1: Then "Home" should be the current navigation item
 * Example #2: Then "Shop" should be the current navigation item
 * Example #3: And "About" should be the current navigation item
 * Example #4: But "Blog" should not be the current navigation item
 * Example #5: Then "Contact" should be the current navigation item
 *
 */
Then(/^"([^"]*)?" should( not)* be the current navigation item$/, async function (label, notCase) {
  await assertFirstText(this, NAV_CURRENT, notCase, label, {
    label: 'the current navigation item to be',
    hint: 'Squarespace marks the current page\'s header link with `aria-current="page"` (7.1) or an `--active` class (7.0); the comparison is exact against the link\'s source text after trimming.',
    source: 'textContent',
  });
});

/**
 * Open the mobile navigation menu via the header toggle button.
 *
 * Example #1: When I open the mobile navigation menu
 * Example #2: When we open the mobile navigation menu
 * Example #3: When I open the mobile menu
 * Example #4: When open the mobile menu
 * Example #5: And I open the mobile navigation menu
 *
 */
When(/^(I |we )*open the mobile (?:navigation menu|menu)$/, async function (pronounCase) {
  const toggle = this.page.locator(MOBILE_TOGGLE).first();
  await actOrExplain('open', 'the mobile navigation menu', async () => {
    await toggle.waitFor({ state: 'visible', timeout: budget(this) });
    await toggle.click();
  }, 'The toggle (`.Header-toggle`, `.Mobile-bar-menu` or `.header-burger-btn`) only shows at a mobile breakpoint; set the viewport first.');
  await settle(this);
});

/**
 * Assert the mobile navigation toggle button is (or is not) visible (i.e.
 * whether the viewport is currently at a mobile breakpoint).
 *
 * Example #1: Then the mobile navigation toggle should be visible
 * Example #2: And the mobile navigation toggle should be visible
 * Example #3: Then the mobile menu toggle should not be visible
 * Example #4: Then the mobile navigation toggle button should be visible
 * Example #5: And the mobile menu toggle button should be visible
 *
 */
Then(/^(?:the )?mobile (?:navigation toggle|menu toggle)(?: button)? should( not)* be visible$/, async function (notCase) {
  await assertPresence(this.page.locator(MOBILE_TOGGLE), notCase, {
    label: 'the mobile navigation toggle',
    hint: 'The toggle (`.Header-toggle`, `.Mobile-bar-menu` or `.header-burger-btn`) shows at a mobile breakpoint and is hidden on desktop; set the viewport with the built-in breakpoint step first.',
    timeout: budget(this),
  });
});

/**
 * Assert the full desktop navigation is (or is not) visible (i.e. not
 * collapsed behind the mobile toggle).
 *
 * Example #1: Then the desktop navigation should be visible
 * Example #2: And the desktop navigation should be visible
 * Example #3: Then the main navigation should not be visible
 * Example #4: And the site navigation should be visible
 * Example #5: Then the desktop site navigation should be visible
 *
 */
Then(/^(?:the )?(?:desktop navigation|main navigation|desktop site navigation|site navigation) should( not)* be visible$/, async function (notCase) {
  await assertPresence(this.page.locator(NAV), notCase, {
    label: 'the desktop navigation (`.Header-nav` / `.header-nav`)',
    hint: 'The header navigation is hidden behind the toggle at a mobile breakpoint; set the viewport to a desktop breakpoint first.',
    timeout: budget(this),
  });
});

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------

/**
 * Assert the page's hero section does (or does not) show the given title:
 * the first level-one heading of the page content.
 *
 * Example #1: Then the hero title should be "Handmade goods, honestly sourced."
 * Example #2: Then the hero title should be "About Demo Studio"
 * Example #3: And the hero title should be "Shop"
 * Example #4: But the hero title should not be "Journal"
 * Example #5: Then hero title should be "Contact us"
 *
 */
Then(/^(?:the )?hero title should( not)* be "([^"]*)?"$/, async function (notCase, title) {
  await assertFirstText(this, HERO_TITLE, notCase, title, {
    label: 'the hero title',
    hint: 'The hero title is the first `h1` of the page content (`.hero-title`, `main h1`, or the first `h1`); the comparison is exact after trimming.',
  });
});

/**
 * Assert the hero section's call-to-action button (the page's first
 * Squarespace button block) does (or does not) link to a given URL.
 *
 * Example #1: Then the hero call-to-action button should link to "/shop.html"
 * Example #2: And the hero call-to-action button should link to "/contact.html"
 * Example #3: Then the hero call-to-action button should not link to "/about.html"
 * Example #4: Then the hero CTA should link to "/blog.html"
 * Example #5: Then hero call-to-action button should link to "/"
 *
 */
Then(/^(?:the )?hero (?:call-to-action button|CTA) should( not)* link to "([^"]*)?"$/, async function (notCase, href) {
  const cta = this.page.locator(HERO_CTA).first();
  const timeout = budget(this);
  await actOrExplain('find', 'the hero call-to-action button', () => cta.waitFor({ state: 'attached', timeout }),
    'The hero CTA is the page\'s first button block (`.sqs-block-button-element`); the page needs one.');
  try {
    await this.page.waitForFunction(
      ({ sel, want, expected }) => {
        const el = document.querySelector(sel);
        return Boolean(el) && (el.getAttribute('href') === expected) === want;
      },
      { sel: HERO_CTA, want: !notCase, expected: href },
      { timeout }
    );
  } catch {
    const actual = await cta.getAttribute('href').catch(() => null);
    throw friendly({
      message: notCase
        ? `Expected the hero call-to-action button not to link to "${href}", but it does.`
        : `Expected the hero call-to-action button to link to "${href}" but found "${actual}".`,
      hint: 'The href is compared exactly as written in the markup; check the button block\'s link in the page editor.',
    });
  }
});

// ---------------------------------------------------------------------------
// Footer (Squarespace `.Footer`)
// ---------------------------------------------------------------------------

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
  await assertPresence(this.page.locator(FOOTER), notVisible || notSee, {
    label: 'the site footer (`.Footer`, `footer.sections` or `#footer-sections`)',
    hint: 'Every Squarespace template renders a footer section; check the page is fully loaded and that the footer is not hidden for this viewport.',
    timeout: budget(this),
  });
});

/**
 * Assert the footer does (or does not) contain a copyright notice.
 *
 * Example #1: Then the footer should show a copyright notice
 * Example #2: And the footer should show a copyright notice
 * Example #3: Then the site footer should show a copyright notice
 * Example #4: And the footer should not display a copyright notice
 * Example #5: Then the footer should show a copyright
 *
 */
Then(/^(?:the )?(?:site )?footer should( not)* (?:show|display) a copyright(?: notice)?$/, async function (notCase) {
  const footer = this.page.locator(FOOTER_COPYRIGHT).first();
  const timeout = budget(this);
  await actOrExplain('find', 'the site footer', () => footer.waitFor({ state: 'attached', timeout }),
    'Every Squarespace template renders a footer section (`.Footer`, `footer.sections` or `#footer-sections`).');
  try {
    await footer.filter({ hasText: /©|\(c\)/i }).waitFor({ state: notCase ? 'hidden' : 'visible', timeout });
  } catch {
    const text = (await footer.innerText().catch(() => '')).trim();
    throw friendly({
      message: notCase
        ? 'Expected the footer not to show a copyright mark, but it does.'
        : `Expected a copyright mark (© or (c)) in the footer, but its text is "${text.slice(0, 120)}".`,
      hint: 'The copyright line is usually a text block in the footer; check it is published and contains the © symbol or "(c)".',
    });
  }
});

/**
 * Assert the footer navigation does (or does not) contain a link with the
 * given text.
 *
 * Example #1: Then the footer navigation should contain "Shop"
 * Example #2: And the footer navigation should contain "About"
 * Example #3: Then the footer navigation should contain "Instagram"
 * Example #4: But the footer navigation should not contain "Checkout"
 * Example #5: And footer navigation should contain "Contact"
 *
 */
Then(/^(?:the )?footer navigation should( not)* contain "([^"]*)?"$/, async function (notCase, label) {
  await assertPresence(this.page.locator(FOOTER_NAV_LINK, { hasText: label }), notCase, {
    label: `a footer navigation link labeled "${label}"`,
    hint: 'Footer links are the `.Footer-nav` items (7.0) or any link inside the footer sections (7.1), matched by their visible text.',
    timeout: budget(this),
    state: 'attached',
  });
});

// ---------------------------------------------------------------------------
// Forms (Squarespace `.form-wrapper` / `.sqs-block-form`)
// ---------------------------------------------------------------------------

/**
 * Fill a labeled field inside the Squarespace form with a value.
 *
 * Example #1: When I fill in the Squarespace form field "Name" with "Jane Doe"
 * Example #2: When I fill in the Squarespace form field "Email" with "jane@example.com"
 * Example #3: And I fill in the form field "Message" with "Hello there"
 * Example #4: When we fill in the Squarespace form field "Name" with "John Smith"
 * Example #5: When fill in the form field "Email" with "test@demo.com"
 *
 */
When(/^(I |we )*fill in the (?:Squarespace )?form field "([^"]*)?" with "([^"]*)?"$/, async function (pronounCase, label, value) {
  const field = this.page.locator(FORM).first().getByLabel(label).first();
  await actOrExplain('fill in the form field', label, async () => {
    await field.waitFor({ state: 'visible', timeout: budget(this) });
    await field.fill(value);
  }, FORM_HINT);
});

/**
 * Submit the Squarespace form on the current page and settle, so the
 * confirmation has a chance to replace the form.
 *
 * Example #1: When I submit the Squarespace form
 * Example #2: When we submit the Squarespace form
 * Example #3: And I submit the Squarespace form
 * Example #4: When I submit the form
 * Example #5: And we submit the form
 *
 */
When(/^(I |we )*submit the (?:Squarespace )?form$/, async function (pronounCase) {
  const submit = this.page.locator(FORM_SUBMIT).first();
  await actOrExplain('submit', 'the form', async () => {
    await submit.waitFor({ state: 'visible', timeout: budget(this) });
    await submit.click();
  }, FORM_HINT);
  await settle(this);
});

/**
 * Assert the Squarespace form does (or does not) show its post-submission
 * confirmation message.
 *
 * Example #1: Then the Squarespace form should show the submitted confirmation
 * Example #2: And the form should show the submitted confirmation
 * Example #3: Then the form should not show the submitted confirmation message
 * Example #4: Then I should see the form submitted confirmation
 * Example #5: And we should not see the form submitted confirmation
 *
 */
Then(/^(?:(?:the )?(?:Squarespace )?form should( not)* show the submitted confirmation(?: message)?|(?:I |we )*should( not)* see the form submitted confirmation)$/, async function (notShow, notSee) {
  await assertPresence(this.page.locator(FORM_SUBMITTED), notShow || notSee, {
    label: 'the form submitted confirmation (`.form-submitted-message` / `.form-submission-text`)',
    hint: 'Squarespace replaces the form with its confirmation text after a successful submit; submit the form first and check every required field was filled.',
    timeout: budget(this),
  });
});

// ---------------------------------------------------------------------------
// Shop / products (Squarespace `.ProductList`)
// ---------------------------------------------------------------------------

/**
 * Assert the shop lists a given number of products. The count is polled
 * for the wait budget, so a grid that is still rendering is waited for.
 *
 * Example #1: Then the shop should list 3 products
 * Example #2: And the shop should list 1 product
 * Example #3: Then the shop should list 5 products
 * Example #4: Then shop should list 0 products
 * Example #5: And the shop should list 10 products
 *
 */
Then(/^(?:the )?shop should list (\d+) products?$/, async function (countStr) {
  await assertCount(this, PRODUCT_ITEM, Number(countStr), {
    label: 'product(s)',
    hint: 'Products are `.ProductList-item` (7.0) or `.grid-item` (7.1) elements; check the shop page URL and how many products are visible in the store.',
  });
});

/**
 * Add a named product to the cart from the shop page.
 *
 * Example #1: When I add the product "Ceramic Mug" to the cart
 * Example #2: When I add the product "Linen Tote Bag" to the cart
 * Example #3: And I add the product "Oak Cutting Board" to the cart
 * Example #4: When we add the product "Ceramic Mug" to the cart
 * Example #5: When add the product "Linen Tote Bag" to the cart
 *
 */
When(/^(I |we )*add the product "([^"]*)?" to the cart$/, async function (pronounCase, title) {
  const item = this.page.locator(PRODUCT_ITEM, { has: this.page.locator(PRODUCT_TITLE, { hasText: title }) });
  const button = item.locator(ADD_TO_CART).first();
  await actOrExplain('add the product to the cart', title, async () => {
    await button.waitFor({ state: 'visible', timeout: budget(this) });
    await button.click();
  }, 'The product is matched by its title (`.ProductItem-title` / `.grid-title`) and needs a visible "Add to cart" button (`.sqs-add-to-cart-button`) in its listing item.');
  await settle(this);
});

/**
 * Assert the cart contains a given number of items. The cart count is
 * polled for the wait budget, since it updates after the add-to-cart
 * request completes.
 *
 * Example #1: Then the cart should contain 1 item
 * Example #2: And the cart should contain 2 items
 * Example #3: Then the cart should contain 0 items
 * Example #4: Then cart should contain 3 items
 * Example #5: And the cart should contain 1 item
 *
 */
Then(/^(?:the )?cart should contain (\d+) items?$/, async function (countStr) {
  const expected = Number(countStr);
  const timeout = budget(this);
  try {
    await this.page.waitForFunction(
      ({ sel, n }) => {
        const el = document.querySelector(sel);
        return Boolean(el) && Number((el.innerText || el.textContent || '').trim()) === n;
      },
      { sel: CART_COUNT, n: expected },
      { timeout }
    );
  } catch {
    const text = (await this.page.locator(CART_COUNT).first().innerText().catch(() => null));
    throw friendly({
      message: `Expected the cart count to be ${expected} but found ${text === null ? 'no cart count element' : `"${text.trim()}"`}.`,
      hint: 'The cart count is `.Cart-count` (7.0) or `.sqs-cart-quantity` (7.1); it updates after the add-to-cart request, so add the product first.',
    });
  }
});

// ---------------------------------------------------------------------------
// Blog (Squarespace `.BlogList`)
// ---------------------------------------------------------------------------

/**
 * Assert the blog lists a given number of posts. The count is polled for
 * the wait budget, so a listing that is still rendering is waited for.
 *
 * Example #1: Then the blog should list 2 posts
 * Example #2: And the blog should list 1 post
 * Example #3: Then the blog should list 5 posts
 * Example #4: Then blog should list 0 posts
 * Example #5: And the blog should list 10 posts
 *
 */
Then(/^(?:the )?blog should list (\d+) posts?$/, async function (countStr) {
  await assertCount(this, BLOG_ITEM, Number(countStr), {
    label: 'blog post(s)',
    hint: 'Posts are `.BlogList-item` (7.0) or `.blog-item` (7.1) elements; check the blog page URL and how many posts the listing shows per page.',
  });
});

/**
 * Assert a blog post with the given title is (or is not) listed.
 *
 * Example #1: Then the blog post "Why we use linen instead of canvas" should be visible
 * Example #2: And the blog post "Seasoning a cutting board the right way" should be visible
 * Example #3: Then the blog post "Our summer restock" should not be visible
 * Example #4: And the blog post "Behind the scenes" should be visible
 * Example #5: Then blog post "New arrivals" should be visible
 *
 */
Then(/^(?:the )?blog post "([^"]*)?" should( not)* be visible$/, async function (title, notCase) {
  await assertPresence(this.page.locator(BLOG_TITLE_LINK, { hasText: title }), notCase, {
    label: `a blog post titled "${title}"`,
    hint: 'Post titles are the `.BlogItem-title a` / `.blog-title a` links in the listing, matched by their visible text; check the title and that the post is published.',
    timeout: budget(this),
  });
});
