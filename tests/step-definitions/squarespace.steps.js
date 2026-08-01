'use strict';

// squarespace-steps — custom webship-js Cucumber step definitions for
// testing Squarespace sites (navigation, hero, footer, forms, shop, blog,
// cart). Consuming projects load this file via cucumber.js `require`,
// alongside webship-js's own built-in step definitions:
//
//   require: [
//     'node_modules/webship-js/tests/step-definitions/**/*.js',
//     'node_modules/@webship/squarespace-steps/squarespace.steps.js',
//     'tests/step-definitions/**/*.js',
//   ],
//
// See README.md, docs/, and examples/ for full usage.

const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

// ---------------------------------------------------------------------------
// Navigation (Squarespace `.Header` / `.Header-nav`)
// ---------------------------------------------------------------------------

/**
 * Assert the main site navigation contains a link with the given text.
 *
 * Example #1: Then the site navigation should contain "Shop"
 * Example #2: Then the site navigation should contain "About"
 * Example #3: And the site navigation should contain "Blog"
 * Example #4: Then the site navigation should contain "Contact"
 * Example #5: Then the site navigation should contain "Home"
 *
 */
Then('the site navigation should contain {string}', async function (label) {
  const count = await this.page.locator('.Header-nav .Header-nav-item a', { hasText: label }).count();
  assert.ok(count > 0, `Site navigation does not contain a link labeled "${label}".`);
});

/**
 * Assert a given navigation item is marked as the current page
 * (Squarespace marks the active link with aria-current="page").
 *
 * Example #1: Then "Home" should be the current navigation item
 * Example #2: Then "Shop" should be the current navigation item
 * Example #3: And "About" should be the current navigation item
 * Example #4: Then "Blog" should be the current navigation item
 * Example #5: Then "Contact" should be the current navigation item
 *
 */
Then('{string} should be the current navigation item', async function (label) {
  const current = this.page.locator('.Header-nav .Header-nav-item a[aria-current="page"]');
  const text = await current.first().textContent();
  assert.strictEqual(text.trim(), label, `Expected current navigation item to be "${label}" but found "${text.trim()}".`);
});

/**
 * Open the mobile navigation menu via the header toggle button.
 *
 * Example #1: When I open the mobile navigation menu
 * Example #2: When we open the mobile navigation menu
 * Example #3: When I open the mobile menu
 * Example #4: When we open the mobile menu
 * Example #5: And I open the mobile navigation menu
 *
 */
When(/^(?:I |we )?open the mobile (?:navigation menu|menu)$/, async function () {
  await this.page.locator('.Header-toggle').click();
});

/**
 * Assert the mobile navigation toggle button is visible (i.e. the
 * viewport is currently at a mobile breakpoint).
 *
 * Example #1: Then the mobile navigation toggle should be visible
 * Example #2: And the mobile navigation toggle should be visible
 * Example #3: Then the mobile menu toggle should be visible
 * Example #4: Then the mobile navigation toggle button should be visible
 * Example #5: And the mobile menu toggle button should be visible
 *
 */
Then(/^the mobile (?:navigation toggle|menu toggle)(?: button)? should be visible$/, async function () {
  await assert.ok(await this.page.locator('.Header-toggle').isVisible(), 'Mobile navigation toggle is not visible.');
});

/**
 * Assert the full desktop navigation is visible (i.e. not collapsed
 * behind the mobile toggle).
 *
 * Example #1: Then the desktop navigation should be visible
 * Example #2: And the desktop navigation should be visible
 * Example #3: Then the main navigation should be visible
 * Example #4: And the site navigation should be visible
 * Example #5: Then the desktop site navigation should be visible
 *
 */
Then(/^the (?:desktop navigation|main navigation|desktop site navigation|site navigation) should be visible$/, async function () {
  await assert.ok(await this.page.locator('.Header-nav').isVisible(), 'Desktop navigation is not visible.');
});

// ---------------------------------------------------------------------------
// Hero section
// ---------------------------------------------------------------------------

/**
 * Assert the page's hero section shows the given title.
 *
 * Example #1: Then the hero title should be "Handmade goods, honestly sourced."
 * Example #2: Then the hero title should be "About Demo Studio"
 * Example #3: And the hero title should be "Shop"
 * Example #4: Then the hero title should be "Journal"
 * Example #5: Then the hero title should be "Contact us"
 *
 */
Then('the hero title should be {string}', async function (title) {
  const text = await this.page.locator('.hero-title').innerText();
  assert.strictEqual(text.trim(), title, `Expected hero title "${title}" but found "${text.trim()}".`);
});

/**
 * Assert the hero section's call-to-action button links to a given URL.
 *
 * Example #1: Then the hero call-to-action button should link to "/shop.html"
 * Example #2: And the hero call-to-action button should link to "/contact.html"
 * Example #3: Then the hero call-to-action button should link to "/about.html"
 * Example #4: Then the hero call-to-action button should link to "/blog.html"
 * Example #5: Then the hero call-to-action button should link to "/"
 *
 */
Then('the hero call-to-action button should link to {string}', async function (href) {
  const actual = await this.page.locator('.hero .sqs-block-button-element').first().getAttribute('href');
  assert.strictEqual(actual, href, `Expected hero CTA to link to "${href}" but found "${actual}".`);
});

// ---------------------------------------------------------------------------
// Footer (Squarespace `.Footer`)
// ---------------------------------------------------------------------------

/**
 * Assert the site footer is visible on the page.
 *
 * Example #1: Then the site footer should be visible
 * Example #2: And the site footer should be visible
 * Example #3: Then I should see the site footer
 * Example #4: Then the footer should be visible
 * Example #5: And the footer should be visible
 *
 */
Then(/^(?:the site footer should be visible|I should see the site footer|the footer should be visible)$/, async function () {
  await assert.ok(await this.page.locator('.Footer').isVisible(), 'Site footer is not visible.');
});

/**
 * Assert the footer contains a copyright notice.
 *
 * Example #1: Then the footer should show a copyright notice
 * Example #2: And the footer should show a copyright notice
 * Example #3: Then the site footer should show a copyright notice
 * Example #4: And the footer should display a copyright notice
 * Example #5: Then the footer should show a copyright
 *
 */
Then(/^the (?:site )?footer should (?:show|display) a copyright(?: notice)?$/, async function () {
  const text = await this.page.locator('.Footer-copyright').innerText();
  assert.ok(/©|\(c\)/i.test(text), `Footer copyright text "${text}" does not contain a copyright mark.`);
});

/**
 * Assert the footer navigation contains a link with the given text.
 *
 * Example #1: Then the footer navigation should contain "Shop"
 * Example #2: And the footer navigation should contain "About"
 * Example #3: Then the footer navigation should contain "Instagram"
 * Example #4: Then the footer navigation should contain "Facebook"
 * Example #5: And the footer navigation should contain "Contact"
 *
 */
Then('the footer navigation should contain {string}', async function (label) {
  const count = await this.page.locator('.Footer-nav .Footer-nav-item a', { hasText: label }).count();
  assert.ok(count > 0, `Footer navigation does not contain a link labeled "${label}".`);
});

// ---------------------------------------------------------------------------
// Forms (Squarespace `.form-wrapper` / `.sqs-block-form`)
// ---------------------------------------------------------------------------

/**
 * Fill a labeled field inside the Squarespace form with a value.
 *
 * Example #1: When I fill in the Squarespace form field "Name" with "Jane Doe"
 * Example #2: When I fill in the Squarespace form field "Email" with "jane@example.com"
 * Example #3: And I fill in the Squarespace form field "Message" with "Hello there"
 * Example #4: When we fill in the Squarespace form field "Name" with "John Smith"
 * Example #5: When I fill in the Squarespace form field "Email" with "test@demo.com"
 *
 */
When(/^(I |we )?fill in the Squarespace form field "([^"]*)" with "([^"]*)"$/, async function (pronoun, label, value) {
  await this.page.locator('.form-wrapper').getByLabel(label).fill(value);
});

/**
 * Submit the Squarespace form on the current page.
 *
 * Example #1: When I submit the Squarespace form
 * Example #2: When we submit the Squarespace form
 * Example #3: And I submit the Squarespace form
 * Example #4: When I submit the form
 * Example #5: And we submit the form
 *
 */
When(/^(?:I |we )?submit the (?:Squarespace )?form$/, async function () {
  await this.page.locator('.form-wrapper .form-submit-button').click();
});

/**
 * Assert the Squarespace form shows its post-submission confirmation
 * message.
 *
 * Example #1: Then the Squarespace form should show the submitted confirmation
 * Example #2: And the form should show the submitted confirmation
 * Example #3: Then the Squarespace form should show the confirmation message
 * Example #4: Then I should see the form submitted confirmation
 * Example #5: And the Squarespace form should show the submitted confirmation message
 *
 */
Then(/^(?:the (?:Squarespace )?form should show the submitted confirmation(?: message)?|I should see the form submitted confirmation)$/, async function () {
  await assert.ok(
    await this.page.locator('.form-submitted-message').isVisible(),
    'Form submitted confirmation message is not visible.'
  );
});

// ---------------------------------------------------------------------------
// Shop / products (Squarespace `.ProductList`)
// ---------------------------------------------------------------------------

/**
 * Assert the shop lists a given number of products.
 *
 * Example #1: Then the shop should list 3 products
 * Example #2: And the shop should list 1 product
 * Example #3: Then the shop should list 5 products
 * Example #4: Then the shop should list 0 products
 * Example #5: And the shop should list 10 products
 *
 */
Then('the shop should list {int} product(s)', async function (expected) {
  const count = await this.page.locator('.ProductList-item').count();
  assert.strictEqual(count, expected, `Expected ${expected} product(s) but found ${count}.`);
});

/**
 * Add a named product to the cart from the shop page.
 *
 * Example #1: When I add the product "Ceramic Mug" to the cart
 * Example #2: When I add the product "Linen Tote Bag" to the cart
 * Example #3: And I add the product "Oak Cutting Board" to the cart
 * Example #4: When we add the product "Ceramic Mug" to the cart
 * Example #5: When I add the product "Linen Tote Bag" to the cart
 *
 */
When(/^(I |we )?add the product "([^"]*)" to the cart$/, async function (pronoun, title) {
  const item = this.page.locator('.ProductList-item', { has: this.page.locator('.ProductItem-title', { hasText: title }) });
  await item.locator('.sqs-add-to-cart-button').click();
});

/**
 * Assert the cart contains a given number of items.
 *
 * Example #1: Then the cart should contain 1 item
 * Example #2: And the cart should contain 2 items
 * Example #3: Then the cart should contain 0 items
 * Example #4: Then the cart should contain 3 items
 * Example #5: And the cart should contain 1 item
 *
 */
Then('the cart should contain {int} item(s)', async function (expected) {
  const text = await this.page.locator('.Cart-count').innerText();
  assert.strictEqual(Number(text.trim()), expected, `Expected cart count ${expected} but found "${text.trim()}".`);
});

// ---------------------------------------------------------------------------
// Blog (Squarespace `.BlogList`)
// ---------------------------------------------------------------------------

/**
 * Assert the blog lists a given number of posts.
 *
 * Example #1: Then the blog should list 2 posts
 * Example #2: And the blog should list 1 post
 * Example #3: Then the blog should list 5 posts
 * Example #4: Then the blog should list 0 posts
 * Example #5: And the blog should list 10 posts
 *
 */
Then('the blog should list {int} post(s)', async function (expected) {
  const count = await this.page.locator('.BlogList-item').count();
  assert.strictEqual(count, expected, `Expected ${expected} post(s) but found ${count}.`);
});

/**
 * Assert a blog post with the given title is visible in the listing.
 *
 * Example #1: Then the blog post "Why we use linen instead of canvas" should be visible
 * Example #2: And the blog post "Seasoning a cutting board the right way" should be visible
 * Example #3: Then the blog post "Our summer restock" should be visible
 * Example #4: And the blog post "Behind the scenes" should be visible
 * Example #5: Then the blog post "New arrivals" should be visible
 *
 */
Then('the blog post {string} should be visible', async function (title) {
  const count = await this.page.locator('.BlogItem-title a', { hasText: title }).count();
  assert.ok(count > 0, `Blog post titled "${title}" was not found.`);
});
