'use strict';

// The selectors of the pack, in one table with no dependency, so the probe
// script (scripts/probe-selectors.js) can count them on real pages.
//
// Every selector here was read from the markup of public Squarespace template
// demos (docs/selector-evidence.md lists the pages and the counts). Squarespace
// 7.1 comes first; the 7.0 selectors are the Brine family (`Header-`, `Footer-`,
// `Mobile-` class names) and are listed second in each group. Other 7.0
// template families use different class names and are not covered.

const SELECTORS = {
  // Header navigation. 7.1: `.header-nav-item` is a div with a link inside; a
  // folder is a `button.header-nav-folder-title` with its pages in
  // `.header-nav-folder-item`. 7.0: the item is the link itself.
  navLinks: [
    '.header-nav-item > a',
    '.header-nav-item > .header-nav-folder-title',
    '.header-nav-folder-item a',
    '.header-menu-nav-item:not(.header-menu-controls) a',
    'a.Header-nav-item',
    'a.Mobile-overlay-nav-item',
  ].join(', '),
  navItems: '.header-nav-item, a.Header-nav-item',
  navCurrent: [
    '.header-nav-item--active > a',
    '.header-nav-item--active > .header-nav-folder-title',
    '.header-nav-folder-item--active > a',
    '.header-menu-nav-item--active > a',
    'a.Header-nav-item--active',
  ].join(', '),
  navFolder: '.header-nav-item--folder',
  navFolderTitle: '.header-nav-item--folder > .header-nav-folder-title',
  navFolderPages: '.header-nav-folder-item a',
  // Mobile menu. 7.1: the burger button opens `.header-menu` and puts
  // `header--menu-open` on the body. 7.0: `.Mobile-bar-menu` opens
  // `.Mobile-overlay` and puts `is-mobile-overlay-active` on the body.
  burger: '.header-burger-btn, .Mobile-bar-menu',
  burger71: '.header-burger-btn',
  menuClose70: '.Mobile-overlay-close',
  menuOpenClasses: ['header--menu-open', 'is-mobile-overlay-active'],
  menuItems: '.header-menu-nav-item:not(.header-menu-controls) a, a.Mobile-overlay-nav-item',
  menuFolderLink: '.header-menu-nav-item a[data-folder-id]',
  // Forms. The form block (`.form-wrapper`) validates on the server; the
  // newsletter block (`.newsletter-form`) validates in the browser.
  form: '.form-wrapper',
  formSubmit: '.form-wrapper .form-submit-button, .form-wrapper button[type="submit"]',
  formErrors: '.form-wrapper .form-field-error, .form-wrapper .field-error',
  formConfirmation: '.form-wrapper .form-submission-text, .form-wrapper .form-submission-html, .sqs-form-block-submission-html',
  newsletter: '.newsletter-form',
  newsletterSubmit: '.newsletter-form .newsletter-form-button, .newsletter-form button[type="submit"]',
  newsletterErrors: '.newsletter-form .field-error',
  newsletterConfirmation: '.newsletter-form .form-submission-text, .newsletter-form .form-submission-html',
  // Commerce. 7.1: the list is `.product-list-item`, a product page has
  // `h1.product-title` and the add button; 7.0 (Brine): `.ProductList-item`,
  // `.ProductItem-details-title`. The add button and the quantity field are the
  // same on both. The cart link goes to /cart.
  productItem: '.product-list-item, .ProductList-item',
  productListTitle: '.product-list-item-title, .ProductList-title',
  productTitle: 'h1.product-title, .ProductItem-details-title',
  productPrice: '.product-price',
  productQuantity: '.product-quantity-input input',
  addToCart: '.sqs-add-to-cart-button',
  cartLink: 'a.cart-style-icon, a.Cart',
  cartCount: '.sqs-cart-quantity',
  // Blog. 7.1: `article.blog-item` with the title in `.blog-title a`, a post
  // page has `h1.entry-title`. 7.0 (Brine): `.BlogList-item`, `a.BlogList-item-title`,
  // `h1.BlogItem-title`.
  blogItem: '.blog-item, .BlogList-item',
  blogTitleLink: '.blog-title a, a.BlogList-item-title',
  postTitle: 'h1.entry-title, h1.BlogItem-title',
  postAuthor: '.blog-author-name, .blog-author, a.Blog-meta-item--author',
  postDate: 'time.blog-meta-item--date, .blog-date, time.Blog-meta-item--date',
  // Gallery sections and the site search (the same on 7.1 and 7.0).
  galleryItem: '.gallery-grid-item, .gallery-reel-item',
  searchInput: '.sqs-search-page-input input',
  searchResult: '.search-result',
  searchResultTitle: '.search-result .sqs-title',
  searchNotice: '.sqs-search-page-notice',
  // Announcement bar and cookie banner. Neither is on by default; Squarespace's
  // own scripts draw them from the site settings (`showAnnouncementBar`,
  // `cookieSettings`).
  announcementBar: '.sqs-announcement-bar',
  announcementText: '.sqs-announcement-bar-text-inner',
  announcementLink: '.sqs-announcement-bar-url',
  announcementClose: '.sqs-announcement-bar-close',
  cookieBanner: '.gdpr-cookie-banner',
  cookieText: '.sqs-cookie-banner-v2-text',
  cookieAccept: '.sqs-cookie-banner-v2-accept',
  cookieDecline: '.sqs-cookie-banner-v2-deny',
  // Page content.
  content: 'main, #page, #siteWrapper, .Main-content',
  heroExcluded: 'header, footer, .blog-item, .BlogList-item, .product-list-item, .ProductList-item',
  button: '.sqs-block-button-element',
  // Footer. 7.1: `footer#footer-sections`. 7.0: `footer.Footer`.
  footer: 'footer#footer-sections, footer.sections, footer.Footer, .Footer, footer',
  footerLinks: 'footer a, .Footer a',
};

module.exports = { SELECTORS };
