'use strict';

// squarespace-steps: custom webship-js Cucumber step definitions for
// testing Squarespace sites. Consuming projects load this file via
// cucumber.js `require`, alongside webship-js's own built-in step definitions:
//
//   require: [
//     'node_modules/webship-js/tests/step-definitions/**/*.js',
//     'node_modules/@webship-js/squarespace-steps/tests/step-definitions/squarespace.steps.js',
//     'tests/step-definitions/**/*.js',
//   ],
//
// This file loads the step files of the pack (navigation, page and form steps are in
// their own files) and holds the shop, cart and blog steps. README.md
// documents every step.
//
// The product word is optional in every sentence ("the Squarespace form"
// and "the form" both match). Every assertion waits for its condition (the
// assertion is the wait) for the `minWaitTime.page` budget, every action
// settles the page afterwards, and every failure is a friendly error with a
// hint instead of a raw assertion or Playwright stack.

const { When, Then } = require('@cucumber/cucumber');
const { friendly } = require('webship-js/tests/step-definitions/webship');
const { budget, settle, actOrExplain } = require('./squarespace-helpers');

require('./squarespace-navigation.steps');
require('./squarespace-page.steps');
require('./squarespace-forms.steps');

const PRODUCT_ITEM = '.ProductList-item, .products .grid-item, .grid-item[data-item-id]';
const PRODUCT_TITLE = '.ProductItem-title, .ProductList-title, .grid-title';
const ADD_TO_CART = '.sqs-add-to-cart-button';
const CART_COUNT = '.Cart-count, .sqs-cart-quantity';
const BLOG_ITEM = '.BlogList-item, .blog-item, article.blog-basic-grid--container';
const BLOG_TITLE_LINK = '.BlogItem-title a, .BlogList-item-title a, .blog-title a';


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
