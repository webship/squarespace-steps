'use strict';

// Steps for the announcement bar and the cookie banner of a Squarespace 7.1
// site. Both are off until the site owner switches them on, and Squarespace's
// own scripts draw them from the site settings:
//
// - announcement bar: `.sqs-announcement-bar` with `.sqs-announcement-bar-text-inner`,
//   `.sqs-announcement-bar-url` and `.sqs-announcement-bar-close`; a closed bar
//   keeps its markup with the class `sqs-announcement-bar-hidden` and no height;
// - cookie banner: `section.gdpr-cookie-banner` with `.sqs-cookie-banner-v2-text`
//   and the `.sqs-cookie-banner-v2-accept` and `.sqs-cookie-banner-v2-deny`
//   buttons; a visitor's choice removes the banner.
//
// The cookie banner shows to visitors the site settings select (often only
// in the EU), so a test from another place may not see it.

const { When, Then } = require('@cucumber/cucumber');
const { friendly } = require('webship-js/tests/step-definitions/webship');
const { SELECTORS, budget, settle, assertScan, clickVisible } = require('./squarespace-helpers');

const BAR_HINT = 'The announcement bar is `.sqs-announcement-bar` (text `.sqs-announcement-bar-text-inner`, link `.sqs-announcement-bar-url`, close button `.sqs-announcement-bar-close`); it only exists when the site owner switched it on, and a closed bar has no height.';
const COOKIE_HINT = 'The cookie banner is `section.gdpr-cookie-banner` (text `.sqs-cookie-banner-v2-text`, buttons `.sqs-cookie-banner-v2-accept` and `.sqs-cookie-banner-v2-deny`); it only exists when the site owner switched it on, it is shown to the visitors the cookie settings select, and it is gone once a choice was made.';

/**
 * Assert the announcement bar is (or is not) visible. A bar the visitor closed
 * is not visible.
 *
 * Example #1: Then the announcement bar should be visible
 * Example #2: And the announcement bar should be visible
 * Example #3: Then the announcement bar should not be visible
 * Example #4: But the announcement bar should not be visible
 * Example #5: Then announcement bar should be visible
 *
 */
Then(/^(?:the )?announcement bar should( not)* be visible$/, async function (notCase) {
  await assertScan(this, { selector: SELECTORS.announcementBar, visible: true }, {
    not: Boolean(notCase),
    what: 'the announcement bar to be visible',
    hint: BAR_HINT,
  });
});

/**
 * Assert the announcement bar shows (or does not show) exactly this text,
 * compared after collapsing whitespace.
 *
 * Example #1: Then the announcement bar should say "Free shipping on orders over 50"
 * Example #2: And the announcement bar should say "Closed on Monday"
 * Example #3: And the announcement bar should say "New collection online now"
 * Example #4: But the announcement bar should not say "Sale ends today"
 * Example #5: Then announcement bar should say "Welcome"
 *
 */
Then(/^(?:the )?announcement bar should( not)* say "([^"]*)"$/, async function (notCase, text) {
  await assertScan(this, { selector: SELECTORS.announcementText, text, visible: true }, {
    not: Boolean(notCase),
    what: `the announcement bar text "${text}"`,
    hint: BAR_HINT,
  });
});

/**
 * Assert the announcement bar does (or does not) link to the given address,
 * compared as written in the markup.
 *
 * Example #1: Then the announcement bar should link to "/news"
 * Example #2: And the announcement bar should link to "/shop"
 * Example #3: And the announcement bar should link to "https://example.com/sale"
 * Example #4: But the announcement bar should not link to "/contact"
 * Example #5: Then announcement bar should link to "/"
 *
 */
Then(/^(?:the )?announcement bar should( not)* link to "([^"]*)"$/, async function (notCase, href) {
  const read = `(() => { const a = document.querySelector(${JSON.stringify(SELECTORS.announcementLink)}); return a ? a.getAttribute('href') : null; })()`;
  try {
    await this.page.waitForFunction(`${read} ${notCase ? '!==' : '==='} ${JSON.stringify(href)}`, undefined, { timeout: budget(this) });
  } catch {
    const actual = await this.page.evaluate(read).catch(() => null);
    throw friendly({
      message: notCase
        ? `Expected the announcement bar not to link to "${href}", but it does.`
        : actual === null
          ? 'Expected the announcement bar to link to a page, but it has no link.'
          : `Expected the announcement bar to link to "${href}" but found "${actual}".`,
      hint: BAR_HINT,
    });
  }
});

/**
 * Close the announcement bar with its close button.
 *
 * Example #1: When I close the announcement bar
 * Example #2: When we close the announcement bar
 * Example #3: And I close the announcement bar
 * Example #4: When close the announcement bar
 * Example #5: And we close the announcement bar
 *
 */
When(/^(I |we )*close the announcement bar$/, async function (pronounCase) {
  await clickVisible(this, { selector: SELECTORS.announcementClose, what: 'the announcement bar close button', hint: BAR_HINT });
  await settle(this);
});

/**
 * Assert the cookie banner is (or is not) visible.
 *
 * Example #1: Then the cookie banner should be visible
 * Example #2: And the cookie banner should be visible
 * Example #3: Then the cookie banner should not be visible
 * Example #4: But the cookie banner should not be visible
 * Example #5: Then cookie banner should be visible
 *
 */
Then(/^(?:the )?cookie banner should( not)* be visible$/, async function (notCase) {
  await assertScan(this, { selector: SELECTORS.cookieBanner, visible: true }, {
    not: Boolean(notCase),
    what: 'the cookie banner to be visible',
    hint: COOKIE_HINT,
  });
});

/**
 * Assert the cookie banner shows (or does not show) exactly this text,
 * compared after collapsing whitespace.
 *
 * Example #1: Then the cookie banner should say "We use cookies to improve your experience."
 * Example #2: And the cookie banner should say "This site uses cookies."
 * Example #3: And the cookie banner should say "Cookies help us run the site."
 * Example #4: But the cookie banner should not say "We sell your data."
 * Example #5: Then cookie banner should say "Accept our cookies?"
 *
 */
Then(/^(?:the )?cookie banner should( not)* say "([^"]*)"$/, async function (notCase, text) {
  await assertScan(this, { selector: SELECTORS.cookieText, text, visible: true }, {
    not: Boolean(notCase),
    what: `the cookie banner text "${text}"`,
    hint: COOKIE_HINT,
  });
});

/**
 * Accept the cookies with the banner's accept button. The banner goes away
 * and the site sets its cookie choice.
 *
 * Example #1: When I accept the cookies
 * Example #2: When we accept the cookies
 * Example #3: And I accept the cookies
 * Example #4: When accept the cookies
 * Example #5: And we accept the cookies
 *
 */
When(/^(I |we )*accept the cookies$/, async function (pronounCase) {
  await clickVisible(this, { selector: SELECTORS.cookieAccept, what: 'the cookie banner accept button', hint: COOKIE_HINT });
  await settle(this);
});

/**
 * Decline the cookies with the banner's decline button. The banner goes away
 * and the site sets its cookie choice. A banner switched on without a decline
 * button has none.
 *
 * Example #1: When I decline the cookies
 * Example #2: When we decline the cookies
 * Example #3: And I decline the cookies
 * Example #4: When decline the cookies
 * Example #5: And we decline the cookies
 *
 */
When(/^(I |we )*decline the cookies$/, async function (pronounCase) {
  await clickVisible(this, { selector: SELECTORS.cookieDecline, what: 'the cookie banner decline button', hint: COOKIE_HINT });
  await settle(this);
});
