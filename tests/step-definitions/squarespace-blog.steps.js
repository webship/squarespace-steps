'use strict';

// Blog steps: the post list and a post page. Squarespace 7.1 lists posts as
// `article.blog-item` with the title in `.blog-title a`, and a post page has an
// `h1.entry-title`; the 7.0 Brine family uses `.BlogList-item`,
// `a.BlogList-item-title` and `h1.BlogItem-title`. The author and the date are
// shown as the site's settings write them.

const { When, Then } = require('@cucumber/cucumber');
const { SELECTORS, settle, assertScan, clickVisible } = require('./squarespace-helpers');

const LIST_HINT = 'Posts are `.blog-item` (7.1) or `.BlogList-item` (7.0) elements, titled by `.blog-title a` or `a.BlogList-item-title`; check the blog page URL and how many posts the listing shows per page.';
const POST_HINT = 'A post page has an `h1.entry-title` (7.1) or `h1.BlogItem-title` (7.0); the author is `.blog-author-name` and the date `time.blog-meta-item--date`. Open a post first.';

/**
 * Assert the blog lists a given number of posts. The count is polled for the
 * wait budget, so a listing that is still rendering is waited for.
 *
 * Example #1: Then the blog should list 3 posts
 * Example #2: And the blog should list 1 post
 * Example #3: Then the blog should list 4 posts
 * Example #4: Then blog should list 0 posts
 * Example #5: And the blog should list 10 posts
 *
 */
Then(/^(?:the )?blog should list (\d+) posts?$/, async function (count) {
  await assertScan(this, { selector: SELECTORS.blogItem, visible: true }, { count: Number(count), what: 'blog post(s)', hint: LIST_HINT });
});

/**
 * Assert a blog post with the given title is (or is not) listed. The title is
 * compared exactly, after collapsing whitespace.
 *
 * Example #1: Then the blog post "Get Out There!" should be visible
 * Example #2: And the blog post "Our classic croissant recipe" should be visible
 * Example #3: Then the blog post "Our summer restock" should not be visible
 * Example #4: And the blog post "Preserved Lemons" should be visible
 * Example #5: Then blog post "New arrivals" should be visible
 *
 */
Then(/^(?:the )?blog post "([^"]*)" should( not)* be visible$/, async function (title, notCase) {
  await assertScan(this, { selector: SELECTORS.blogTitleLink, text: title, visible: true }, {
    not: Boolean(notCase),
    what: `a blog post titled "${title}"`,
    hint: LIST_HINT,
  });
});

/**
 * Open a blog post from the list by its title.
 *
 * Example #1: When I open the blog post "Get Out There!"
 * Example #2: When we open the blog post "Preserved Lemons"
 * Example #3: And I open the blog post "Our classic croissant recipe"
 * Example #4: When open the blog post "Why we use linen instead of canvas"
 * Example #5: And we open the blog post "Seasoning a cutting board the right way"
 *
 */
When(/^(I |we )*open the blog post "([^"]*)"$/, async function (pronounCase, title) {
  await clickVisible(this, { selector: SELECTORS.blogTitleLink, text: title, what: `the blog post "${title}"`, hint: LIST_HINT });
  await settle(this);
});

/**
 * Assert the post page shows (or does not show) the given title.
 *
 * Example #1: Then the blog post title should be "Get Out There!"
 * Example #2: And the blog post title should be "Preserved Lemons"
 * Example #3: And the blog post title should be "Why we use linen instead of canvas"
 * Example #4: But the blog post title should not be "Journal"
 * Example #5: Then blog post title should be "Seasoning a cutting board the right way"
 *
 */
Then(/^(?:the )?blog post title should( not)* be "([^"]*)"$/, async function (notCase, title) {
  await assertScan(this, { selector: SELECTORS.postTitle, text: title, visible: true }, {
    not: Boolean(notCase),
    what: `the blog post title "${title}"`,
    hint: POST_HINT,
  });
});

/**
 * Assert a blog post, on its page or in the list, shows (or does not show)
 * the given author name, as the site writes it.
 *
 * Example #1: Then the blog post should show the author "Author Name"
 * Example #2: And the blog post should show the author "Michelle Liv"
 * Example #3: And the blog post should show the author "Studio Team"
 * Example #4: But the blog post should not show the author "Jane Doe"
 * Example #5: Then the blog post should not show the author "Guest"
 *
 */
Then(/^(?:the )?blog post should( not)* show the author "([^"]*)"$/, async function (notCase, author) {
  await assertScan(this, { selector: SELECTORS.postAuthor, text: author, visible: true }, {
    not: Boolean(notCase),
    what: `the post author "${author}"`,
    hint: POST_HINT,
  });
});

/**
 * Assert a blog post, on its page or in the list, shows (or does not show)
 * the given date, in the format the site settings give it ("May 28" or
 * "November 1, 2015").
 *
 * Example #1: Then the blog post should show the date "May 28"
 * Example #2: And the blog post should show the date "November 1, 2015"
 * Example #3: And the blog post should show the date "June 2"
 * Example #4: But the blog post should not show the date "January 1"
 * Example #5: Then the blog post should not show the date "2020"
 *
 */
Then(/^(?:the )?blog post should( not)* show the date "([^"]*)"$/, async function (notCase, date) {
  await assertScan(this, { selector: SELECTORS.postDate, text: date, visible: true }, {
    not: Boolean(notCase),
    what: `the post date "${date}"`,
    hint: `${POST_HINT} The date is compared exactly as the page writes it.`,
  });
});
