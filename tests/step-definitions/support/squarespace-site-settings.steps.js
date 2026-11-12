'use strict';

// Test support, not shipped in the npm package: switch the announcement bar or
// the cookie banner on in the browser, so the steps for them can run on a site
// that has neither (the public template demos have both switched off).
//
// The step rewrites the HTML document of the site in the test browser: the
// `Static.SQUARESPACE_CONTEXT` settings are changed before the page runs, and
// Squarespace's own scripts then draw the bar or the banner. Nothing on the
// site is changed. Use the step before the "I am on ..." step.

const { Given } = require('@cucumber/cucumber');

function applySettings(html, settings) {
  let out = html;
  if (settings.announcement) {
    const bar = { style: 1, text: `<p>${settings.announcement.text}</p>`, clickthroughUrl: { url: settings.announcement.url, newWindow: false } };
    out = out
      .replace('"showAnnouncementBar":false', '"showAnnouncementBar":true')
      .replace('"websiteSettings":{', `"websiteSettings":{"announcementBarSettings":${JSON.stringify(bar)},`);
  }
  if (settings.cookie) {
    const fields = {
      isCookieBannerEnabled: true,
      cookieBannerText: settings.cookie.text,
      cookieBannerTheme: 'LIGHT',
      cookieBannerVariant: 'BAR',
      cookieBannerPosition: 'BOTTOM',
      cookieBannerCtaVariant: 'PRIMARY',
      cookieBannerCtaText: 'Accept',
      cookieBannerHasOptOut: true,
      cookieBannerOptOutCtaText: 'Decline',
    };
    for (const [key, value] of Object.entries(fields)) {
      out = out.replace(new RegExp(`"${key}":(?:true|false|"[^"]*")`), `"${key}":${JSON.stringify(value)}`);
    }
  }
  return out;
}

async function route(world) {
  world.sqsSettings = world.sqsSettings || {};
  if (world.sqsRouted) return world.sqsSettings;
  world.sqsRouted = true;
  const origin = new URL(world.launchUrl).origin;
  await world.page.route((url) => url.origin === origin, async (handler) => {
    if (handler.request().resourceType() !== 'document') return handler.continue();
    const response = await handler.fetch();
    const type = response.headers()['content-type'] || '';
    if (!type.includes('html')) return handler.fulfill({ response });
    return handler.fulfill({ response, body: applySettings(await response.text(), world.sqsSettings) });
  });
  return world.sqsSettings;
}

/**
 * Switch the announcement bar on in the browser, with a text and a link.
 *
 * Example #1: Given the Squarespace announcement bar is switched on with the text "Free shipping on orders over 50" linking to "/news"
 * Example #2: Given the Squarespace announcement bar is switched on with the text "Closed on Monday" linking to "/contact"
 * Example #3: And the Squarespace announcement bar is switched on with the text "New collection" linking to "/shop"
 * Example #4: Given the Squarespace announcement bar is switched on with the text "Welcome" linking to "/"
 * Example #5: And the Squarespace announcement bar is switched on with the text "Sale" linking to "/sale"
 *
 */
Given(/^the Squarespace announcement bar is switched on with the text "([^"]*)" linking to "([^"]*)"$/, async function (text, url) {
  (await route(this)).announcement = { text, url };
});

/**
 * Switch the cookie banner on in the browser, with a text, an accept and a
 * decline button.
 *
 * Example #1: Given the Squarespace cookie banner is switched on with the text "We use cookies to improve your experience."
 * Example #2: Given the Squarespace cookie banner is switched on with the text "This site uses cookies."
 * Example #3: And the Squarespace cookie banner is switched on with the text "Cookies help us run the site."
 * Example #4: Given the Squarespace cookie banner is switched on with the text "Accept our cookies?"
 * Example #5: And the Squarespace cookie banner is switched on with the text "We value your privacy."
 *
 */
Given(/^the Squarespace cookie banner is switched on with the text "([^"]*)"$/, async function (text) {
  (await route(this)).cookie = { text };
});
