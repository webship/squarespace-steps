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
// This file loads the step files of the pack (navigation, page, form and shop steps are
// in their own files) and holds the blog steps. README.md
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
require('./squarespace-shop.steps');

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
