'use strict';

// Navigation steps: the header navigation, the current page marker, the
// mobile (burger) menu and navigation folders. Squarespace 7.1 renders the
// header twice (a desktop and a mobile copy) and hides one of them, so the
// steps look at the copy a person can see. 7.0 (Brine family) is the fallback.

const { When, Then } = require('@cucumber/cucumber');
const {
  SELECTORS,
  settle,
  assertScan,
  clickVisible,
  menuIsOpen,
  waitForMenu,
  assertFolderPage,
} = require('./squarespace-helpers');
const { friendly } = require('webship-js/tests/step-definitions/webship');

const MENU_HINT = 'The mobile menu is opened by the burger button (`.header-burger-btn` on 7.1, `.Mobile-bar-menu` on 7.0), which is only visible at a mobile breakpoint; set the viewport with "I set the viewport to the \\"mobile\\" breakpoint" first.';

/**
 * Assert the header navigation contains (or does not contain) a page link
 * with the given label. The label is compared after collapsing whitespace and
 * is case sensitive, as written in the page. The links of the header, the
 * folder dropdowns and the burger menu all count, so a template that keeps its
 * navigation only in the burger menu works too.
 *
 * Example #1: Then the site navigation should contain "Shop"
 * Example #2: And the site navigation should contain "About"
 * Example #3: And the main navigation should contain "Blog"
 * Example #4: But the site navigation should not contain "Checkout"
 * Example #5: Then the navigation should contain "Contact"
 *
 */
Then(/^(?:the )?(?:site |main )?navigation should( not)* contain "([^"]*)"$/, async function (notCase, label) {
  await assertScan(this, { selector: SELECTORS.navLinks, text: label, visible: false }, {
    not: Boolean(notCase),
    what: `a navigation link labeled "${label}"`,
    hint: 'Navigation links are the header items of a 7.1 (`.header-nav-item`) or 7.0 (`a.Header-nav-item`) template, and the burger menu items; the label must match the link text exactly, including its case.',
  });
});

/**
 * Assert a navigation item is (or is not) marked as the current page. 7.1
 * puts `header-nav-item--active` on the item and `aria-current="page"` on its
 * link; a folder is also marked when one of its pages is current. 7.0 puts
 * `Header-nav-item--active` on the link. A page that is not in the navigation
 * (often the home page) marks no item.
 *
 * Example #1: Then "News" should be the current navigation item
 * Example #2: And "About" should be the current navigation item
 * Example #3: And "Contact" should be the current navigation item
 * Example #4: But "Blog" should not be the current navigation item
 * Example #5: Then "Shop" should be the current navigation item
 *
 */
Then(/^"([^"]*)" should( not)* be the current navigation item$/, async function (label, notCase) {
  await assertScan(this, { selector: SELECTORS.navCurrent, text: label, visible: false }, {
    not: Boolean(notCase),
    what: `"${label}" to be the current navigation item`,
    hint: 'Squarespace marks the current page with `header-nav-item--active` (7.1) or `Header-nav-item--active` (7.0); a page that is not in the header navigation marks no item.',
  });
});

/**
 * Assert the header navigation is (or is not) shown: at least one navigation
 * item is visible. At a mobile breakpoint the items are hidden behind the
 * burger button, and some templates keep all items in the burger menu on every
 * viewport.
 *
 * Example #1: Then the desktop navigation should be visible
 * Example #2: And the site navigation should be visible
 * Example #3: Then the main navigation should not be visible
 * Example #4: And the desktop site navigation should be visible
 * Example #5: But the desktop navigation should not be visible
 *
 */
Then(/^(?:the )?(?:desktop navigation|main navigation|desktop site navigation|site navigation) should( not)* be visible$/, async function (notCase) {
  await assertScan(this, { selector: SELECTORS.navItems, visible: true }, {
    not: Boolean(notCase),
    what: 'the header navigation to be visible',
    hint: 'The header items (`.header-nav-item` on 7.1, `a.Header-nav-item` on 7.0) are hidden behind the burger button at a mobile breakpoint; some templates keep the whole navigation in the burger menu.',
  });
});

/**
 * Assert the mobile menu button (the "burger") is, or is not, visible. It is
 * shown at a mobile breakpoint and hidden on desktop, on templates that use
 * the header navigation there.
 *
 * Example #1: Then the mobile navigation toggle should be visible
 * Example #2: And the mobile navigation toggle should be visible
 * Example #3: Then the mobile menu toggle should not be visible
 * Example #4: Then the mobile navigation toggle button should be visible
 * Example #5: And the mobile menu toggle button should be visible
 *
 */
Then(/^(?:the )?mobile (?:navigation toggle|menu toggle)(?: button)? should( not)* be visible$/, async function (notCase) {
  await assertScan(this, { selector: SELECTORS.burger, visible: true }, {
    not: Boolean(notCase),
    what: 'the mobile menu button to be visible',
    hint: MENU_HINT,
  });
});

/**
 * Open the mobile menu with the burger button and wait until the template
 * reports it open. Does nothing when the menu is already open.
 *
 * Example #1: When I open the mobile menu
 * Example #2: When we open the mobile menu
 * Example #3: When I open the mobile navigation menu
 * Example #4: When open the mobile menu
 * Example #5: And I open the mobile navigation menu
 *
 */
When(/^(I |we )*open the mobile (?:navigation )?menu$/, async function (pronounCase) {
  if (!(await menuIsOpen(this))) {
    await clickVisible(this, { selector: SELECTORS.burger, what: 'the mobile menu button', hint: MENU_HINT });
  }
  await waitForMenu(this, true, 'The burger button was clicked but the template did not open its menu.');
  await settle(this);
});

/**
 * Close the mobile menu: the burger button toggles it on 7.1, the close
 * button does on 7.0. Does nothing when the menu is already closed.
 *
 * Example #1: When I close the mobile menu
 * Example #2: When we close the mobile menu
 * Example #3: When I close the mobile navigation menu
 * Example #4: When close the mobile menu
 * Example #5: And I close the mobile navigation menu
 *
 */
When(/^(I |we )*close the mobile (?:navigation )?menu$/, async function (pronounCase) {
  if (await menuIsOpen(this)) {
    await clickVisible(this, {
      selector: `${SELECTORS.burger71}, ${SELECTORS.menuClose70}`,
      what: 'the button that closes the mobile menu',
      hint: 'The menu is closed by the burger button (7.1) or the close button (`.Mobile-overlay-close`, 7.0).',
    });
  }
  await waitForMenu(this, false, 'The button was clicked but the template did not close its menu.');
  await settle(this);
});

/**
 * Assert the mobile menu is (or is not) open. The state is the class the
 * template puts on the page body (`header--menu-open` on 7.1,
 * `is-mobile-overlay-active` on 7.0).
 *
 * Example #1: Then the mobile menu should be open
 * Example #2: And the mobile menu should be open
 * Example #3: Then the mobile navigation menu should be open
 * Example #4: But the mobile menu should not be open
 * Example #5: Then the mobile navigation menu should not be open
 *
 */
Then(/^(?:the )?mobile (?:navigation )?menu should( not)* be open$/, async function (notCase) {
  await waitForMenu(this, !notCase, MENU_HINT);
});

/**
 * Assert the open mobile menu contains (or does not contain) a page link with
 * the given label. Open the menu first.
 *
 * Example #1: Then the mobile menu should contain "News"
 * Example #2: And the mobile menu should contain "Read Me"
 * Example #3: And the mobile navigation menu should contain "About"
 * Example #4: But the mobile menu should not contain "Checkout"
 * Example #5: Then the mobile menu should contain "Contact"
 *
 */
Then(/^(?:the )?mobile (?:navigation )?menu should( not)* contain "([^"]*)"$/, async function (notCase, label) {
  if (!(await menuIsOpen(this))) {
    throw friendly({ message: 'The mobile menu is not open.', hint: 'Open it first with "I open the mobile menu".' });
  }
  await assertScan(this, { selector: SELECTORS.menuItems, text: label, visible: true }, {
    not: Boolean(notCase),
    what: `a mobile menu link labeled "${label}"`,
    hint: 'Menu links are `.header-menu-nav-item` links (7.1) or `a.Mobile-overlay-nav-item` (7.0); the label must match exactly. A page inside a folder shows after the folder is opened.',
  });
});

/**
 * Open a navigation folder, a header item that holds a list of pages. On
 * desktop this clicks the folder button in the header; in the open burger menu
 * it follows the folder link.
 *
 * Example #1: When I open the "About" navigation folder
 * Example #2: When we open the "About" navigation folder
 * Example #3: And I open the "Shop" navigation folder
 * Example #4: When open the "Services" navigation folder
 * Example #5: And we open the "Resources" navigation folder
 *
 */
When(/^(I |we )*open the "([^"]*)" navigation folder$/, async function (pronounCase, name) {
  await clickVisible(this, {
    selector: `${SELECTORS.navFolderTitle}, ${SELECTORS.menuFolderLink}`,
    text: name,
    what: `the "${name}" navigation folder`,
    hint: 'A folder is a `button.header-nav-folder-title` in the 7.1 header, or a link with `data-folder-id` in the open burger menu; on a mobile breakpoint open the menu first.',
  });
  await settle(this);
});

/**
 * Assert a navigation folder holds (or does not hold) a page link with the
 * given label. The dropdown does not need to be open.
 *
 * Example #1: Then the "About" navigation folder should contain "Contact"
 * Example #2: And the "About" navigation folder should contain "Projects"
 * Example #3: And the "About" navigation folder should contain "Partners"
 * Example #4: But the "About" navigation folder should not contain "News"
 * Example #5: Then the "Resources" navigation folder should contain "Guides"
 *
 */
Then(/^(?:the )?"([^"]*)" navigation folder should( not)* contain "([^"]*)"$/, async function (name, notCase, label) {
  await assertFolderPage(this, name, label, Boolean(notCase),
    'Folders are `.header-nav-item--folder` items (7.1) whose pages are `.header-nav-folder-item` links; 7.0 folders are not covered. The folder name is its button text.');
});
