'use strict';

// Shop and cart steps. The product list shows each product's title and price
// and links to its page; the "Add to cart" button and the quantity field are
// on the product page. The cart count in the header is `.sqs-cart-quantity`,
// and the cart link goes to /cart. Squarespace 7.1 first, the 7.0 Brine family
// as a fallback.
//
// Adding to a cart creates a cart on the site. The cart is the visitor's own
// (a cookie), but do not run the add steps against a site you do not own.

const { When, Then } = require('@cucumber/cucumber');
const {
  SELECTORS,
  budget,
  settle,
  actOrExplain,
  scan,
  assertScan,
  clickVisible,
} = require('./squarespace-helpers');
const { friendly } = require('webship-js/tests/step-definitions/webship');

const LIST_HINT = 'Products are `.product-list-item` (7.1) or `.ProductList-item` (7.0) elements, titled by `.product-list-item-title` or `.ProductList-title`; check the shop page URL and the filters on the page.';
const PRODUCT_HINT = 'A product page has an `h1.product-title` (7.1) or `.ProductItem-details-title` (7.0), a `.product-price`, a quantity field and the `.sqs-add-to-cart-button`; open a product first.';

/**
 * Follow the link of the list item that shows the given title. The link is
 * clicked, not the title: on 7.0 the title sits in an overlay that shows on
 * hover.
 */
async function openListedProduct(world, title) {
  await assertScan(world, { selector: SELECTORS.productListTitle, text: title, visible: true }, { what: `the product "${title}"`, hint: LIST_HINT });
  const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const item = world.page.locator(SELECTORS.productItem).filter({ visible: true })
    .filter({ has: world.page.locator(SELECTORS.productListTitle, { hasText: new RegExp(`^\\s*${escape(title)}\\s*$`) }) });
  await actOrExplain('open', `the product "${title}"`, () => item.locator('a').first().click({ timeout: budget(world) }), LIST_HINT);
  await settle(world);
}

/**
 * Assert the shop lists a given number of products. The count is polled for
 * the wait budget, so a grid that is still rendering is waited for.
 *
 * Example #1: Then the shop should list 6 products
 * Example #2: And the shop should list 1 product
 * Example #3: Then the shop should list 3 products
 * Example #4: Then shop should list 0 products
 * Example #5: And the shop should list 10 products
 *
 */
Then(/^(?:the )?shop should list (\d+) products?$/, async function (count) {
  await assertScan(this, { selector: SELECTORS.productItem, visible: true }, { count: Number(count), what: 'product(s)', hint: LIST_HINT });
});

/**
 * Assert the shop list shows (or does not show) a product with the given
 * title. The title is compared exactly, after collapsing whitespace.
 *
 * Example #1: Then the shop should list the product "Genuine Gemini"
 * Example #2: And the shop should list the product "Ceramic Mug"
 * Example #3: And the shop should list the product "Kimchi"
 * Example #4: But the shop should not list the product "Gift card"
 * Example #5: Then the shop should not list the product "Sold out candle"
 *
 */
Then(/^(?:the )?shop should( not)* list the product "([^"]*)"$/, async function (notCase, title) {
  await assertScan(this, { selector: SELECTORS.productListTitle, text: title, visible: true }, {
    not: Boolean(notCase),
    what: `a product titled "${title}"`,
    hint: LIST_HINT,
  });
});

/**
 * Open a product from the shop list by its title.
 *
 * Example #1: When I open the product "Genuine Gemini"
 * Example #2: When we open the product "Ceramic Mug"
 * Example #3: And I open the product "Kimchi"
 * Example #4: When open the product "Linen Tote Bag"
 * Example #5: And we open the product "Oak Cutting Board"
 *
 */
When(/^(I |we )*open the product "([^"]*)"$/, async function (pronounCase, title) {
  await openListedProduct(this, title);
});

/**
 * Assert the product page shows (or does not show) the given title.
 *
 * Example #1: Then the product title should be "Genuine Gemini"
 * Example #2: And the product title should be "Ceramic Mug"
 * Example #3: And the product title should be "Kimchi"
 * Example #4: But the product title should not be "Linen Tote Bag"
 * Example #5: Then product title should be "Oak Cutting Board"
 *
 */
Then(/^(?:the )?product title should( not)* be "([^"]*)"$/, async function (notCase, title) {
  await assertScan(this, { selector: SELECTORS.productTitle, text: title, visible: true }, {
    not: Boolean(notCase),
    what: `the product title "${title}"`,
    hint: PRODUCT_HINT,
  });
});

/**
 * Assert the product page shows (or does not show) the given price, as the
 * page writes it, with the currency sign.
 *
 * Example #1: Then the product price should be "$25.00"
 * Example #2: And the product price should be "$24.00"
 * Example #3: And the product price should be "£18.00"
 * Example #4: But the product price should not be "$0.00"
 * Example #5: Then product price should be "€12.50"
 *
 */
Then(/^(?:the )?product price should( not)* be "([^"]*)"$/, async function (notCase, price) {
  await assertScan(this, { selector: SELECTORS.productPrice, text: price, visible: true }, {
    not: Boolean(notCase),
    what: `the product price "${price}"`,
    hint: PRODUCT_HINT,
  });
});

/**
 * Set the quantity on the product page.
 *
 * Example #1: When I set the product quantity to 2
 * Example #2: When we set the product quantity to 3
 * Example #3: And I set the product quantity to 1
 * Example #4: When set the product quantity to 5
 * Example #5: And we set the product quantity to 10
 *
 */
When(/^(I |we )*set the product quantity to (\d+)$/, async function (pronounCase, quantity) {
  await assertScan(this, { selector: SELECTORS.productQuantity, visible: true }, { what: 'the product quantity field', hint: PRODUCT_HINT });
  const field = this.page.locator(SELECTORS.productQuantity).filter({ visible: true }).first();
  await actOrExplain('set the product quantity to', quantity, () => field.fill(String(quantity)), PRODUCT_HINT);
});

/**
 * Add the product to the cart, by its title. On the product page of that
 * product the button is clicked; on the shop list the product is opened
 * first. The cart count updates when the request is done, so follow with a
 * cart count step.
 *
 * Example #1: When I add the product "Genuine Gemini" to the cart
 * Example #2: When we add the product "Ceramic Mug" to the cart
 * Example #3: And I add the product "Kimchi" to the cart
 * Example #4: When add the product "Linen Tote Bag" to the cart
 * Example #5: And we add the product "Oak Cutting Board" to the cart
 *
 */
When(/^(I |we )*add the product "([^"]*)" to the cart$/, async function (pronounCase, title) {
  const page = { selector: SELECTORS.productTitle, text: title, visible: true };
  const list = { selector: SELECTORS.productListTitle, text: title, visible: true };
  await assertScan(this, { selector: `${SELECTORS.productTitle}, ${SELECTORS.productListTitle}`, text: title, visible: true }, {
    what: `the product "${title}" on the page or in the shop list`,
    hint: `${LIST_HINT} Open the shop page or the product page first.`,
  });
  if ((await scan(this, page)).matched === 0 && (await scan(this, list)).matched > 0) {
    await openListedProduct(this, title);
  }
  await clickVisible(this, {
    selector: SELECTORS.addToCart,
    what: `the "Add to cart" button of "${title}"`,
    hint: 'The product page needs a visible "Add to cart" button (`.sqs-add-to-cart-button`); a sold out product has none.',
  });
  await settle(this);
});

/**
 * Add the product of the current product page to the cart.
 *
 * Example #1: When I add the product to the cart
 * Example #2: When we add the product to the cart
 * Example #3: And I add the product to the cart
 * Example #4: When add the product to the cart
 * Example #5: And we add the product to the cart
 *
 */
When(/^(I |we )*add the product to the cart$/, async function (pronounCase) {
  await clickVisible(this, {
    selector: SELECTORS.addToCart,
    what: 'the "Add to cart" button',
    hint: PRODUCT_HINT,
  });
  await settle(this);
});

/**
 * Open the cart with the cart link of the header (the cart page, /cart).
 *
 * Example #1: When I open the cart
 * Example #2: When we open the cart
 * Example #3: And I open the cart
 * Example #4: When open the cart
 * Example #5: And we open the cart
 *
 */
When(/^(I |we )*open the cart$/, async function (pronounCase) {
  await clickVisible(this, {
    selector: SELECTORS.cartLink,
    what: 'the cart link',
    hint: 'The cart link is `a.cart-style-icon` (7.1) or `a.Cart` (7.0) in the header; a site without a store has none.',
  });
  await settle(this);
});

/**
 * Assert the cart count in the header equals the given number. The count is
 * polled for the wait budget, since it updates after the add-to-cart request
 * is done. A site that hides the count of an empty cart counts as 0.
 *
 * Example #1: Then the cart should contain 1 item
 * Example #2: And the cart should contain 2 items
 * Example #3: Then the cart should contain 0 items
 * Example #4: Then cart should contain 3 items
 * Example #5: And the cart should contain 1 item
 *
 */
Then(/^(?:the )?cart should contain (\d+) items?$/, async function (count) {
  const expected = Number(count);
  const read = `(() => { const el = [...document.querySelectorAll(${JSON.stringify(SELECTORS.cartCount)})].find((e) => e.getClientRects().length > 0); return el ? Number((el.textContent || '').trim()) || 0 : 0; })()`;
  try {
    await this.page.waitForFunction(`${read} === ${expected}`, undefined, { timeout: budget(this) });
  } catch {
    const found = await this.page.evaluate(read).catch(() => null);
    throw friendly({
      message: `Expected the cart count to be ${expected} but found ${found}.`,
      hint: 'The cart count is the visible `.sqs-cart-quantity` in the header; it updates after the add-to-cart request, so add the product first. A hidden or missing count counts as 0.',
    });
  }
});
