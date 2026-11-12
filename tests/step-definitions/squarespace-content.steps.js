'use strict';

// Steps for galleries and the site search. A 7.1 gallery section is a
// `.gallery-grid` of `.gallery-grid-item` figures or a `.gallery-reel` of
// `.gallery-reel-item` figures. The search page (`/search`) is the same on 7.1
// and 7.0: an input, the results as `.search-result`, and a notice when
// nothing matches. The lightbox of a gallery is not covered: it was not
// observed open on any public demo.

const { When, Then } = require('@cucumber/cucumber');
const { SELECTORS, settle, actOrExplain, assertScan, scan } = require('./squarespace-helpers');

const SEARCH_HINT = 'The search page is `/search`: an input in `.sqs-search-page-input`, results as `.search-result` with a `.sqs-title`, and a `.sqs-search-page-notice` when nothing matches.';

/**
 * Assert the page shows a given number of gallery images (items of a gallery
 * grid or reel).
 *
 * Example #1: Then the gallery should show 3 images
 * Example #2: And the gallery should show 1 image
 * Example #3: Then the gallery should show 6 images
 * Example #4: Then gallery should show 0 images
 * Example #5: And the gallery should show 12 images
 *
 */
Then(/^(?:the )?gallery should show (\d+) images?$/, async function (count) {
  await assertScan(this, { selector: SELECTORS.galleryItem, visible: true }, {
    count: Number(count),
    what: 'gallery image(s)',
    hint: 'Gallery items are `.gallery-grid-item` (grid) or `.gallery-reel-item` (reel) figures; a gallery that is not a grid or a reel is not covered.',
  });
});

/**
 * Search the site: open the search page when it is not the current page, type
 * the words and press Enter.
 *
 * Example #1: When I search the site for "news"
 * Example #2: When we search the site for "kimchi"
 * Example #3: And I search the site for "croissant"
 * Example #4: When search the site for "shipping"
 * Example #5: And we search the site for "zzzqqq"
 *
 */
When(/^(I |we )*search the site for "([^"]*)"$/, async function (pronounCase, words) {
  if ((await scan(this, { selector: SELECTORS.searchInput, visible: true })).matched === 0) {
    await actOrExplain('open', 'the search page', () => this.page.goto(new URL('/search', this.page.url()).href), 'The site needs the Squarespace search page at /search.');
  }
  await assertScan(this, { selector: SELECTORS.searchInput, visible: true }, { what: 'the search field', hint: SEARCH_HINT });
  const input = this.page.locator(SELECTORS.searchInput).filter({ visible: true }).first();
  await actOrExplain('search for', words, async () => {
    await input.fill(words);
    await input.press('Enter');
  }, SEARCH_HINT);
  await settle(this);
});

/**
 * Assert the search results do (or do not) list a result with the given
 * title, compared exactly.
 *
 * Example #1: Then the search results should contain "News"
 * Example #2: And the search results should contain "Kimchi"
 * Example #3: And the search results should contain "Our story"
 * Example #4: But the search results should not contain "Checkout"
 * Example #5: Then the search results should not contain "Gift card"
 *
 */
Then(/^(?:the )?search results should( not)* contain "([^"]*)"$/, async function (notCase, title) {
  await assertScan(this, { selector: SELECTORS.searchResultTitle, text: title, visible: true }, {
    not: Boolean(notCase),
    what: `a search result titled "${title}"`,
    hint: SEARCH_HINT,
  });
});

/**
 * Assert the search found a given number of results (the first page of
 * results; Squarespace loads more with a "See more" button).
 *
 * Example #1: Then the search should find 2 results
 * Example #2: And the search should find 1 result
 * Example #3: Then the search should find 5 results
 * Example #4: Then search should find 0 results
 * Example #5: And the search should find 10 results
 *
 */
Then(/^(?:the )?search should find (\d+) results?$/, async function (count) {
  await assertScan(this, { selector: SELECTORS.searchResult, visible: true }, { count: Number(count), what: 'search result(s)', hint: SEARCH_HINT });
});

/**
 * Assert the search page tells that nothing matched ("Your search did not
 * match any results.").
 *
 * Example #1: Then the search should find no results
 * Example #2: And the search should find no results
 * Example #3: But the search should find no results
 * Example #4: Then search should find no results
 * Example #5: And I should find no results
 *
 */
Then(/^(?:(?:the )?search should find|(?:I |we )*should find) no results$/, async function () {
  await assertScan(this, { selector: SELECTORS.searchNotice, visible: true, nonEmpty: true }, {
    what: 'the "no results" notice of the search page',
    hint: `${SEARCH_HINT} The notice shows after a search that matched nothing.`,
  });
  await assertScan(this, { selector: SELECTORS.searchResult, visible: true }, { count: 0, what: 'search result(s)', hint: SEARCH_HINT });
});
