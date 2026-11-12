# Selector evidence

Every selector of the pack (`tests/step-definitions/squarespace-selectors.js`) was read from the markup of real Squarespace sites, checked on 2026-11-12. This page lists where, what could not be observed, what the first version got wrong, and the raw counts (`npm run probe -- <url>` produces them).

## Sites

All are public template demos; the pages were only loaded, nothing was submitted or added to a cart.

| Demo | Version | Used for |
| --- | --- | --- |
| `bailard-demo.squarespace.com` | 7.1 | header, folders, burger menu, blog list and post, newsletter block, search, footer |
| `loam-demo.squarespace.com` | 7.1 | blog list, navigation labels in capitals |
| `soony-demo.squarespace.com` | 7.1 | product list, product page, cart link, form block, newsletter block (a header without page links) |
| `hester-demo.squarespace.com` | 7.1 | gallery grid, product blocks |
| `arcade-demo.squarespace.com` | 7.1 | gallery reel |
| `brine-demo.squarespace.com` | 7.0 (Brine family) | header, mobile menu, product list and page, cart, blog, search, footer |

`Static.SQUARESPACE_CONTEXT.templateVersion` is "7.1" on the first five and "7" on Brine. Squarespace's own scripts (`assets.squarespace.com/universal/scripts-compressed/`) were read for the announcement bar, the form handler and the search page.

## What a step reads

| Steps | Selectors | Where seen |
| --- | --- | --- |
| Navigation contains, current item | 7.1 `.header-nav-item > a`, `.header-nav-item > .header-nav-folder-title`, `.header-nav-folder-item a`, `.header-menu-nav-item a`, `.header-nav-item--active`, `.header-nav-folder-item--active`, `aria-current`; 7.0 `a.Header-nav-item`, `a.Header-nav-item--active` | Bailard `/news` (collection item current, `aria-current="page"`), Bailard `/contact` (folder `--active` with `aria-current="true"` on its button, child `--active`), Loam, Brine |
| Desktop navigation visible, burger visible | `.header-nav-item`, `.header-burger-btn` (7.1), `.Mobile-bar-menu` (7.0) | Bailard, Brine; the 7.1 header exists twice (`.header-display-desktop`, `.header-display-mobile`), so `.header-burger-btn` matches 2 and only one is visible |
| Mobile menu open, close, contains | body class `header--menu-open` (7.1) or `is-mobile-overlay-active` (7.0); `.header-menu-nav-item`; `a.Mobile-overlay-nav-item`; `.Mobile-overlay-close`; folder links `a[data-folder-id]` with panels `.header-menu-nav-folder[data-folder]` | Bailard and Brine at 375 px: the class is set when the burger is clicked and removed when it is clicked again (7.1) or `.Mobile-overlay-close` is clicked (7.0) |
| Folders | `.header-nav-item--folder`, `button.header-nav-folder-title`, `.header-nav-folder-item a` | Bailard |
| Hero title, hero button | first `h1` outside header, footer and list items; first `.sqs-block-button-element` outside header and footer | Bailard, Soony, Loam (a blog list has `h1.blog-title` per post) |
| Footer, footer links, copyright | `footer#footer-sections` (7.1), `footer.Footer` with `.Footer-nav-item` (7.0); the text of the footer | all; none of the demos has a copyright sign, it is content |
| Site facts | `Static.SQUARESPACE_CONTEXT.templateVersion`, `.website.siteTitle`, `.website.language` | all |
| Form fields, choose, errors | label `for` and `aria-label`; native `select`; `p.form-field-error` and `aria-invalid="true"` (form block); `div.field-error` in `.form-item.error` (newsletter) | Soony `/contact`: fields "First Name", "Last Name", "Email", "Inquiry" (select), "Message"; errors seen after an empty submission (the form block is validated by the server, so a submission is posted) and, for the newsletter block, in the browser |
| Form confirmation | `.form-submission-text` (newsletter and classic forms, class `hidden` removed by the form handler), `.sqs-form-block-submission-html` | the handler code in `forms-*.js`; the hidden `.form-submission-text` ("Thank you!") in the Soony newsletter block; see "Not observed" |
| Shop list, product page | 7.1 `.product-list-item` (`.product-list-item-title`, `.product-list-item-price`, `a.product-list-item-link`), `h1.product-title`, `.product-price`, `.product-quantity-input input`, `.sqs-add-to-cart-button`; 7.0 `.ProductList-item`, `.ProductList-title`, `.ProductItem-details-title` | Soony `/shop` (6 items) and a product page, Brine `/shop-brine` (9 items) and `/shop-brine/kimchi` |
| Cart count, cart link | `.sqs-cart-quantity` (4 matches on 7.1, one visible; 2 on 7.0), `a.cart-style-icon` (7.1), `a.Cart` (7.0), both to `/cart` | Soony, Brine; the link opens `/cart` |
| Blog list, post | 7.1 `.blog-item`, `.blog-title a`, `h1.entry-title`, `.blog-author-name`, `.blog-author`, `time.blog-meta-item--date`, `.blog-date`; 7.0 `.BlogList-item`, `a.BlogList-item-title`, `h1.BlogItem-title`, `a.Blog-meta-item--author`, `time.Blog-meta-item--date` | Bailard `/news` (3 posts) and a post, Loam `/blog` (4), Brine `/blog-brine` (8) and a post |
| Gallery | `.gallery-grid-item`, `.gallery-reel-item` | Hester (3 grid items), Arcade (3 reel items) |
| Search | `.sqs-search-page-input input`, `.search-result`, `.sqs-title`, `.sqs-search-page-notice` | Bailard, Brine: `/search?q=...` lists results; a query without a match shows "Your search did not match any results. Try a different search." |
| Announcement bar | `.sqs-announcement-bar`, `.sqs-announcement-bar-text-inner`, `.sqs-announcement-bar-url`, `.sqs-announcement-bar-close`, class `sqs-announcement-bar-hidden` when closed | `announcement-bar-*.js` and Bailard rendered with the setting switched on in the browser |
| Cookie banner | `section.gdpr-cookie-banner`, `.sqs-cookie-banner-v2-text`, `.sqs-cookie-banner-v2-accept`, `.sqs-cookie-banner-v2-deny` | Bailard rendered with the setting switched on in the browser |

## Not observed on a live site

- The confirmation of the form block (`.sqs-form-block-submission-html`): it appears after a real submission, which stores data on the site.
- "Add to cart" and the cart count after an add: they create a cart on the site. The steps are proven on `demo-site/`; the button (`.sqs-add-to-cart-button`, text "Add To Cart", with "Added!" shown after a click) and the count element were read.
- The gallery lightbox (`.gallery-lightbox`): present in the markup of some pages but switched off (`data-lightbox="false"`) on the demos; no step covers it.
- The announcement bar and the cookie banner on a site that has them on: no demo does. They were rendered by Squarespace's own scripts with `showAnnouncementBar` and `cookieSettings` switched on in the test browser.
- Squarespace 7.0 template families other than Brine (for example Wells, whose pages use different class names).

## What the first version got wrong

These selectors existed only in the hand-made demo and not on any real site: `.Header-toggle`, `.hero-title`, `.hero`, `.Footer-copyright`, `.Header-nav .Header-nav-item a` and `.Footer-nav .Footer-nav-item a` (7.0 items are the links themselves), `.Cart-count`, `.ProductItem-title`, `.BlogItem-title a`, `.BlogList-item-title a`, `.form-submitted-message`, `.products .grid-item`, `.grid-title`. The add button was looked for in the product list, where Squarespace has none. The step that opened the mobile menu and the one that checked the menu button took the first match of `.header-burger-btn`, which is the hidden desktop copy.

## Raw counts

Each row is `found/visible`, at a 1280 px and a 375 px viewport. Rows with no match anywhere on the page are left out.

### https://bailard-demo.squarespace.com/news

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 4/2 | 4/0 |
| `.header-nav-item > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-nav-folder-item a` | 8/0 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 7/0 | 7/0 |
| `.header-nav-item` | 6/3 | 6/0 |
| `.header-nav-item--active > a` | 2/1 | 2/0 |
| `.header-menu-nav-item--active > a` | 1/0 | 1/0 |
| `.header-nav-item--folder` | 2/1 | 2/0 |
| `.header-nav-item--folder > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.header-menu-nav-item a[data-folder-id]` | 1/0 | 1/0 |
| `.sqs-cart-quantity` | 1/0 | 1/0 |
| `.blog-item` | 3/3 | 3/3 |
| `.blog-title a` | 3/3 | 3/3 |
| `.blog-author` | 6/0 | 6/0 |
| `.blog-date` | 6/3 | 6/3 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 1/1 | 1/1 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 1/1 | 1/1 |

### https://bailard-demo.squarespace.com/

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 4/2 | 4/0 |
| `.header-nav-item > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-nav-folder-item a` | 8/0 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 7/0 | 7/0 |
| `.header-nav-item` | 6/3 | 6/0 |
| `.header-nav-item--folder` | 2/1 | 2/0 |
| `.header-nav-item--folder > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.header-menu-nav-item a[data-folder-id]` | 1/0 | 1/0 |
| `.newsletter-form` | 1/1 | 1/1 |
| `.newsletter-form .newsletter-form-button` | 1/1 | 1/1 |
| `.newsletter-form button[type="submit"]` | 1/1 | 1/1 |
| `.newsletter-form .form-submission-text` | 1/0 | 1/0 |
| `.newsletter-form .form-submission-html` | 1/0 | 1/0 |
| `.sqs-cart-quantity` | 1/0 | 1/0 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 2/2 | 2/2 |
| `footer` | 1/1 | 1/1 |
| `.sqs-block-button-element` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 1/1 | 1/1 |

### https://soony-demo.squarespace.com/shop

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.newsletter-form` | 1/1 | 1/1 |
| `.newsletter-form .newsletter-form-button` | 1/1 | 1/1 |
| `.newsletter-form button[type="submit"]` | 1/1 | 1/1 |
| `.newsletter-form .form-submission-text` | 1/0 | 1/0 |
| `.newsletter-form .form-submission-html` | 1/0 | 1/0 |
| `.product-list-item` | 6/6 | 6/6 |
| `.product-list-item-title` | 6/6 | 6/6 |
| `a.cart-style-icon` | 4/1 | 4/1 |
| `.sqs-cart-quantity` | 4/1 | 4/1 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 2/2 | 2/2 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 4/4 | 4/4 |

### https://soony-demo.squarespace.com/shop/p/harvest-moon-cup-yp93y

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.newsletter-form` | 1/1 | 1/1 |
| `.newsletter-form .newsletter-form-button` | 1/1 | 1/1 |
| `.newsletter-form button[type="submit"]` | 1/1 | 1/1 |
| `.newsletter-form .form-submission-text` | 1/0 | 1/0 |
| `.newsletter-form .form-submission-html` | 1/0 | 1/0 |
| `.product-list-item` | 5/5 | 5/5 |
| `.product-list-item-title` | 5/5 | 5/5 |
| `h1.product-title` | 1/1 | 1/1 |
| `.product-price` | 1/1 | 1/1 |
| `.product-quantity-input input` | 1/1 | 1/1 |
| `.sqs-add-to-cart-button` | 1/1 | 1/1 |
| `a.cart-style-icon` | 4/1 | 4/1 |
| `.sqs-cart-quantity` | 4/1 | 4/1 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 2/2 | 2/2 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 4/4 | 4/4 |

### https://soony-demo.squarespace.com/contact

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.form-wrapper` | 1/1 | 1/1 |
| `.form-wrapper .form-submit-button` | 1/1 | 1/1 |
| `.form-wrapper button[type="submit"]` | 1/1 | 1/1 |
| `.sqs-form-block-submission-html` | 1/0 | 1/0 |
| `.newsletter-form` | 1/1 | 1/1 |
| `.newsletter-form .newsletter-form-button` | 1/1 | 1/1 |
| `.newsletter-form button[type="submit"]` | 1/1 | 1/1 |
| `.newsletter-form .form-submission-text` | 1/0 | 1/0 |
| `.newsletter-form .form-submission-html` | 1/0 | 1/0 |
| `a.cart-style-icon` | 4/1 | 4/1 |
| `.sqs-cart-quantity` | 4/1 | 4/1 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 2/2 | 2/2 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 4/4 | 4/4 |

### https://loam-demo.squarespace.com/blog

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 10/5 | 10/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 5/0 | 5/0 |
| `.header-nav-item` | 10/5 | 10/0 |
| `.header-nav-item--active > a` | 2/1 | 2/0 |
| `.header-menu-nav-item--active > a` | 1/0 | 1/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.newsletter-form` | 1/1 | 1/1 |
| `.newsletter-form .newsletter-form-button` | 1/1 | 1/1 |
| `.newsletter-form button[type="submit"]` | 1/1 | 1/1 |
| `.newsletter-form .form-submission-text` | 1/0 | 1/0 |
| `.newsletter-form .form-submission-html` | 1/0 | 1/0 |
| `a.cart-style-icon` | 4/1 | 4/1 |
| `.sqs-cart-quantity` | 4/1 | 4/1 |
| `.blog-item` | 4/4 | 4/4 |
| `.blog-title a` | 4/4 | 4/4 |
| `.blog-author` | 8/0 | 8/0 |
| `.blog-date` | 8/4 | 8/4 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 2/2 | 2/2 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 9/9 | 9/9 |

### https://hester-demo.squarespace.com/

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 8/4 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 4/0 | 4/0 |
| `.header-nav-item` | 11/5 | 11/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.form-wrapper` | 1/0 | 1/0 |
| `.sqs-form-block-submission-html` | 1/0 | 1/0 |
| `.product-price` | 3/0 | 3/0 |
| `.product-quantity-input input` | 2/0 | 2/0 |
| `.sqs-add-to-cart-button` | 3/0 | 3/0 |
| `a.cart-style-icon` | 4/1 | 4/1 |
| `.sqs-cart-quantity` | 4/1 | 4/1 |
| `.gallery-grid-item` | 3/3 | 3/3 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 1/1 | 1/1 |
| `footer` | 1/1 | 1/1 |
| `.sqs-block-button-element` | 2/2 | 2/2 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 2/2 | 2/2 |

### https://brine-demo.squarespace.com/shop-brine

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `a.Header-nav-item` | 3/3 | 3/0 |
| `a.Mobile-overlay-nav-item` | 3/0 | 3/3 |
| `a.Header-nav-item--active` | 1/1 | 1/0 |
| `.Mobile-bar-menu` | 1/0 | 1/1 |
| `.Mobile-overlay-close` | 1/0 | 1/1 |
| `.ProductList-item` | 9/9 | 9/9 |
| `.ProductList-title` | 9/9 | 9/9 |
| `.product-price` | 9/9 | 9/9 |
| `a.Cart` | 2/1 | 2/1 |
| `.sqs-cart-quantity` | 2/1 | 2/1 |
| `main` | 1/1 | 1/1 |
| `.Main-content` | 1/1 | 1/1 |
| `header` | 2/1 | 2/0 |
| `footer` | 1/1 | 1/1 |
| `footer.Footer` | 1/1 | 1/1 |
| `.Footer` | 1/1 | 1/1 |
| `footer a` | 9/7 | 9/7 |
| `.Footer a` | 9/7 | 9/7 |

### https://brine-demo.squarespace.com/shop-brine/kimchi

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `a.Header-nav-item` | 3/3 | 3/0 |
| `a.Mobile-overlay-nav-item` | 3/0 | 3/3 |
| `a.Header-nav-item--active` | 1/1 | 1/0 |
| `.Mobile-bar-menu` | 1/0 | 1/1 |
| `.Mobile-overlay-close` | 1/0 | 1/1 |
| `.ProductItem-details-title` | 2/1 | 2/1 |
| `.product-price` | 1/1 | 1/1 |
| `.product-quantity-input input` | 1/1 | 1/1 |
| `.sqs-add-to-cart-button` | 1/1 | 1/1 |
| `a.Cart` | 2/1 | 2/1 |
| `.sqs-cart-quantity` | 2/1 | 2/1 |
| `main` | 1/1 | 1/1 |
| `.Main-content` | 1/1 | 1/1 |
| `header` | 2/1 | 2/0 |
| `footer` | 1/1 | 1/1 |
| `footer.Footer` | 1/1 | 1/1 |
| `.Footer` | 1/1 | 1/1 |
| `footer a` | 9/7 | 9/7 |
| `.Footer a` | 9/7 | 9/7 |

### https://brine-demo.squarespace.com/blog-brine

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `a.Header-nav-item` | 3/3 | 3/0 |
| `a.Mobile-overlay-nav-item` | 3/0 | 3/3 |
| `a.Header-nav-item--active` | 1/1 | 1/0 |
| `.Mobile-bar-menu` | 1/0 | 1/1 |
| `.Mobile-overlay-close` | 1/0 | 1/1 |
| `a.Cart` | 2/1 | 2/1 |
| `.sqs-cart-quantity` | 2/1 | 2/1 |
| `.BlogList-item` | 8/8 | 8/8 |
| `a.BlogList-item-title` | 8/8 | 8/8 |
| `a.Blog-meta-item--author` | 8/8 | 8/8 |
| `time.Blog-meta-item--date` | 8/8 | 8/8 |
| `main` | 1/1 | 1/1 |
| `.Main-content` | 1/1 | 1/1 |
| `header` | 2/1 | 2/0 |
| `footer` | 1/1 | 1/1 |
| `footer.Footer` | 1/1 | 1/1 |
| `.Footer` | 1/1 | 1/1 |
| `footer a` | 9/7 | 9/7 |
| `.Footer a` | 9/7 | 9/7 |

### https://bailard-demo.squarespace.com/contact

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 4/2 | 4/0 |
| `.header-nav-item > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-nav-folder-item a` | 8/0 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 7/0 | 7/0 |
| `.header-nav-item` | 6/3 | 6/0 |
| `.header-nav-item--active > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-nav-folder-item--active > a` | 2/0 | 2/0 |
| `.header-menu-nav-item--active > a` | 2/0 | 2/0 |
| `.header-nav-item--folder` | 2/1 | 2/0 |
| `.header-nav-item--folder > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.header-menu-nav-item a[data-folder-id]` | 1/0 | 1/0 |
| `.sqs-cart-quantity` | 1/0 | 1/0 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 1/1 | 1/1 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 1/1 | 1/1 |

### https://bailard-demo.squarespace.com/news/get-out-there

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 4/2 | 4/0 |
| `.header-nav-item > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-nav-folder-item a` | 8/0 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 7/0 | 7/0 |
| `.header-nav-item` | 6/3 | 6/0 |
| `.header-nav-item--active > a` | 2/1 | 2/0 |
| `.header-menu-nav-item--active > a` | 1/0 | 1/0 |
| `.header-nav-item--folder` | 2/1 | 2/0 |
| `.header-nav-item--folder > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.header-menu-nav-item a[data-folder-id]` | 1/0 | 1/0 |
| `.sqs-cart-quantity` | 1/0 | 1/0 |
| `h1.entry-title` | 1/1 | 1/1 |
| `.blog-author-name` | 1/1 | 1/1 |
| `time.blog-meta-item--date` | 1/1 | 1/1 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 1/1 | 1/1 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 1/1 | 1/1 |

### https://bailard-demo.squarespace.com/search?q=news

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 4/2 | 4/0 |
| `.header-nav-item > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-nav-folder-item a` | 8/0 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 7/0 | 7/0 |
| `.header-nav-item` | 6/3 | 6/0 |
| `.header-nav-item--folder` | 2/1 | 2/0 |
| `.header-nav-item--folder > .header-nav-folder-title` | 2/1 | 2/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.header-menu-nav-item a[data-folder-id]` | 1/0 | 1/0 |
| `.sqs-cart-quantity` | 1/0 | 1/0 |
| `.sqs-search-page-input input` | 1/1 | 1/1 |
| `.search-result` | 2/2 | 2/2 |
| `.search-result .sqs-title` | 2/2 | 2/2 |
| `.sqs-search-page-notice` | 1/0 | 1/0 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 1/1 | 1/1 |
| `footer` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 1/1 | 1/1 |

### https://arcade-demo.squarespace.com/

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `.header-nav-item > a` | 8/4 | 8/0 |
| `.header-menu-nav-item:not(.header-menu-controls) a` | 4/0 | 4/0 |
| `.header-nav-item` | 8/4 | 8/0 |
| `.header-nav-item--active > a` | 2/1 | 2/0 |
| `.header-menu-nav-item--active > a` | 1/0 | 1/0 |
| `.header-burger-btn` | 2/0 | 2/1 |
| `.newsletter-form` | 1/1 | 1/1 |
| `.newsletter-form .newsletter-form-button` | 1/1 | 1/1 |
| `.newsletter-form button[type="submit"]` | 1/1 | 1/1 |
| `.newsletter-form .form-submission-text` | 1/0 | 1/0 |
| `.newsletter-form .form-submission-html` | 1/0 | 1/0 |
| `a.cart-style-icon` | 4/1 | 4/1 |
| `.sqs-cart-quantity` | 4/1 | 4/1 |
| `.gallery-reel-item` | 3/3 | 3/3 |
| `main` | 1/1 | 1/1 |
| `#page` | 1/1 | 1/1 |
| `#siteWrapper` | 1/1 | 1/1 |
| `header` | 3/3 | 3/3 |
| `footer` | 1/1 | 1/1 |
| `.sqs-block-button-element` | 1/1 | 1/1 |
| `footer#footer-sections` | 1/1 | 1/1 |
| `footer.sections` | 1/1 | 1/1 |
| `footer a` | 5/5 | 5/5 |

### https://brine-demo.squarespace.com/blog-brine/2015/10/14/preserved-lemons

| Selector | Desktop (found/visible) | Mobile (found/visible) |
| --- | --- | --- |
| `a.Header-nav-item` | 3/3 | 3/0 |
| `a.Mobile-overlay-nav-item` | 3/0 | 3/3 |
| `a.Header-nav-item--active` | 1/1 | 1/0 |
| `.Mobile-bar-menu` | 1/0 | 1/1 |
| `.Mobile-overlay-close` | 1/0 | 1/1 |
| `.product-price` | 1/0 | 1/0 |
| `.product-quantity-input input` | 1/1 | 1/1 |
| `.sqs-add-to-cart-button` | 1/1 | 1/1 |
| `a.Cart` | 2/1 | 2/1 |
| `.sqs-cart-quantity` | 2/1 | 2/1 |
| `h1.BlogItem-title` | 1/1 | 1/1 |
| `a.Blog-meta-item--author` | 1/1 | 1/1 |
| `time.Blog-meta-item--date` | 1/1 | 1/1 |
| `main` | 1/1 | 1/1 |
| `.Main-content` | 1/1 | 1/1 |
| `header` | 2/1 | 2/0 |
| `footer` | 1/1 | 1/1 |
| `footer.Footer` | 1/1 | 1/1 |
| `.Footer` | 1/1 | 1/1 |
| `footer a` | 9/7 | 9/7 |
| `.Footer a` | 9/7 | 9/7 |
