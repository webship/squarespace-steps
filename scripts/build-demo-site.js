'use strict';

// Builds demo-site/ : static pages that carry the markup Squarespace 7.1 really
// renders (header with a desktop and a mobile copy, burger menu, sections,
// blocks, footer), so the suite can run in CI without a Squarespace account.
// Every class name used here was read from a public template demo; README.md
// lists the sites. Run `npm run demo:build` after editing this file.

const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'demo-site');
const SITE = 'Demo Studio';

// The header navigation. A folder holds pages, as a 7.1 header folder does.
const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop.html' },
  { label: 'Blog', href: '/blog.html' },
  { label: 'About', folder: '/about-1', pages: [
    { label: 'Our story', href: '/about.html' },
    { label: 'Contact', href: '/contact.html' },
  ] },
];

const activeHref = (page, href) => (page.activeAs || page.path) === href;
const folderActive = (page, item) => item.pages.some((p) => activeHref(page, p.href));

function navList(page) {
  const items = NAV.map((item) => {
    if (!item.folder) {
      const on = activeHref(page, item.href);
      return `<div class="header-nav-item header-nav-item--collection${on ? ' header-nav-item--active' : ''}">
              <a href="${item.href}"${on ? ' aria-current="page"' : ''}>${item.label}</a>
            </div>`;
    }
    const on = folderActive(page, item);
    const pages = item.pages.map((p) => {
      const cur = activeHref(page, p.href);
      return `<div class="header-nav-folder-item${cur ? ' header-nav-folder-item--active' : ''}">
                <a href="${p.href}"${cur ? ' aria-current="page"' : ''}><span class="header-nav-folder-item-content">${p.label}</span></a>
              </div>`;
    }).join('\n              ');
    return `<div class="header-nav-item header-nav-item--folder${on ? ' header-nav-item--active' : ''}">
              <button class="header-nav-folder-title" aria-expanded="false" aria-controls="folder-${item.label.toLowerCase()}"${on ? ' aria-current="true"' : ''}>
                <span class="header-nav-folder-title-text">${item.label}</span>
              </button>
              <div class="header-nav-folder-content" id="folder-${item.label.toLowerCase()}">
              ${pages}
              </div>
            </div>`;
  }).join('\n            ');
  return `<nav class="header-nav-list">
            ${items}
          </nav>`;
}

const cartLink = `<div class="header-actions-action header-actions-action--cart">
              <a href="/cart" class="cart-style-icon icon--cart sqs-custom-cart header-icon show-empty-cart-state cart-quantity-zero" aria-label="Cart">
                <span class="Cart-inner"><div class="icon-cart-quantity"><span class="cart-quantity-container"><span class="sqs-cart-quantity">0</span></span></div></span>
              </a>
            </div>`;
const actions = `<div class="header-actions header-actions--right">
          <div class="showOnMobile">${cartLink}</div>
          <div class="showOnDesktop">${cartLink}</div>
        </div>`;

const burger = `<div class="header-burger">
          <button class="header-burger-btn burger">
            <span hidden class="js-header-burger-open-title visually-hidden">Open Menu</span>
            <span hidden class="js-header-burger-close-title visually-hidden">Close Menu</span>
            <span class="burger-box"><span class="burger-inner"><span class="top-bun"></span><span class="patty"></span><span class="bottom-bun"></span></span></span>
          </button>
        </div>`;

function headerCopy(page, kind) {
  return `<div class="header-display-${kind}">
        <div class="header-title-nav-wrapper">
          <div class="header-title"><div class="header-title-text"><a id="site-title" href="/">${SITE}</a></div></div>
          <div class="header-nav"><div class="header-nav-wrapper">
          ${navList(page)}
          </div></div>
        </div>
        ${actions}
        ${burger}
      </div>`;
}

function menu(page) {
  const rootItems = NAV.map((item) => {
    if (!item.folder) {
      const on = activeHref(page, item.href);
      return `<div class="container header-menu-nav-item header-menu-nav-item--collection${on ? ' header-menu-nav-item--active' : ''}">
              <a href="${item.href}"${on ? ' aria-current="page"' : ''}><div class="header-menu-nav-item-content">${item.label}</div></a>
            </div>`;
    }
    const panel = item.pages.map((p) => {
      const cur = activeHref(page, p.href);
      return `<div class="container header-menu-nav-item${cur ? ' header-menu-nav-item--active' : ''}">
                <a href="${p.href}"${cur ? ' aria-current="page"' : ''}><div class="header-menu-nav-item-content">${p.label}</div></a>
              </div>`;
    }).join('\n              ');
    return `<div class="container header-menu-nav-item">
              <a data-folder-id="${item.folder}" href="${item.folder}"><div class="header-menu-nav-item-content header-menu-nav-item-content-folder"><span class="visually-hidden">Folder:</span><span class="header-nav-folder-title-text">${item.label}</span></div></a>
            </div>
            <div data-folder="${item.folder}" class="header-menu-nav-folder">
              <div class="header-menu-nav-folder-content">
              <div class="header-menu-controls container header-menu-nav-item"><a class="header-menu-controls-control header-menu-controls-control--active" href="/"><span>Back</span></a></div>
              ${panel}
              </div>
            </div>`;
  }).join('\n            ');
  return `<div class="header-menu header-menu--folder-list">
      <div class="header-menu-bg theme-bg--primary"></div>
      <div class="header-menu-nav">
        <nav class="header-menu-nav-list">
          <div data-folder="root" class="header-menu-nav-folder">
            <div class="header-menu-nav-folder-content">
            <div class="header-menu-nav-wrapper">
            ${rootItems}
            </div>
            </div>
          </div>
        </nav>
      </div>
    </div>`;
}

function header(page) {
  return `<header id="header" class="header theme-col--primary" tabindex="-1">
    <a href="#page" class="header-skip-link sqs-button-element--primary">Skip to Content</a>
    <div class="header-inner container--fluid">
      ${headerCopy(page, 'desktop')}
      ${headerCopy(page, 'mobile')}
    </div>
    ${menu(page)}
  </header>`;
}

const footer = `<footer class="sections" id="footer-sections">
    <section class="page-section layout-engine-section background-width--full-bleed content-width--wide dark">
      <div class="section-border"><div class="section-background"></div></div>
      <div class="content-wrapper"><div class="content">
        <div class="sqs-layout sqs-grid-12 columns-12"><div class="row sqs-row"><div class="col sqs-col-12 span-12">
          <div class="sqs-block sqs-block-html html-block"><div class="sqs-block-content"><div class="sqs-text-block-container"><div class="sqs-html-content">
            <p>&copy; 2026 ${SITE}. All rights reserved.</p>
            <p><a href="/shop.html">Shop</a> | <a href="/contact.html">Contact</a> | <a href="https://instagram.com" rel="noopener">Instagram</a> | <a href="https://facebook.com" rel="noopener">Facebook</a></p>
          </div></div></div></div>
        </div></div></div>
      </div></div>
    </section>
  </footer>`;

function block(kind, inner) {
  return `<div class="sqs-block sqs-block-${kind} ${kind}-block"><div class="sqs-block-content">${inner}</div></div>`;
}
const html = (inner) => block('html', `<div class="sqs-text-block-container"><div class="sqs-html-content">${inner}</div></div>`);
const button = (href, label) => block('button', `<div class="sqs-block-button-container"><a href="${href}" class="sqs-block-button-element">${label}</a></div>`);
function section(inner, cls = '') {
  return `<section class="page-section layout-engine-section ${cls}" data-section-id="s${Math.abs(inner.length)}">
        <div class="section-border"><div class="section-background"></div></div>
        <div class="content-wrapper"><div class="content"><div class="sqs-layout sqs-grid-12 columns-12"><div class="row sqs-row"><div class="col sqs-col-12 span-12">
        ${inner}
        </div></div></div></div></div>
      </section>`;
}

// The form block as 7.1 renders it: a fieldset for the name, a native select,
// labels that carry a "(required)" mark. The submission message is filled by
// the page script, as the real block does after a successful post.
function formBlock() {
  const required = '<span class="description required">(required)</span>';
  return `<div class="sqs-block sqs-block-form form-block"><div class="sqs-block-content"><div class="sqs-site-style-form">
          <div class="sqs-form-block-submission-html"></div>
          <div class="form-wrapper"><form autocomplete="on" class="react-form-contents" novalidate>
            <div class="field-list">
              <fieldset class="form-item fields name" id="name-field">
                <legend><div class="title"><span>Name</span></div></legend>
                <div class="field first-name"><label class="caption" for="name-fname-field"><div class="caption-text">First Name${required}</div></label><input aria-invalid="false" aria-required="true" autocomplete="given-name" id="name-fname-field" name="fname" type="text" value=""></div>
                <div class="field last-name"><label class="caption" for="name-lname-field"><div class="caption-text">Last Name${required}</div></label><input aria-invalid="false" aria-required="true" autocomplete="family-name" id="name-lname-field" name="lname" type="text" value=""></div>
              </fieldset>
              <div class="form-item field email required" id="email-item">
                <label for="email-field" class="title"><div><span>Email</span>${required}</div></label>
                <input aria-invalid="false" aria-required="true" id="email-field" type="email" value="">
              </div>
              <div class="form-item field select required" id="select-item">
                <label for="select-field" class="title"><div><span>Inquiry</span>${required}</div></label>
                <select id="select-field" aria-label="Inquiry" aria-invalid="false" required>
                  <option value="" disabled hidden selected>Select an option</option>
                  <option value="Customer service">Customer service</option>
                  <option value="Stockist inquiry">Stockist inquiry</option>
                  <option value="Press inquiry">Press inquiry</option>
                </select>
              </div>
              <div class="form-item field textarea required" id="textarea-item">
                <label for="textarea-field" class="title"><div><span>Message</span>${required}</div></label>
                <textarea id="textarea-field" aria-invalid="false" aria-required="true" rows="5"></textarea>
              </div>
            </div>
            <div class="form-button-wrapper form-button-wrapper--align-left"><button type="submit" class="button sqs-system-button form-submit-button"><span class="form-submit-button-label">Send</span></button></div>
          </form></div>
        </div></div></div>`;
}

// The newsletter block as 7.1 renders it: browser-side validation with a
// div.field-error in a .form-item.error, and a hidden .form-submission-text.
function newsletterBlock() {
  return `<div class="sqs-block sqs-block-newsletter newsletter-block"><div class="sqs-block-content">
          <div class="newsletter-form-wrapper"><form class="newsletter-form" novalidate>
            <header class="newsletter-form-header"><h2 class="newsletter-form-header-title">Stay in the loop</h2><div class="newsletter-form-header-description"><p>Get updates on new releases.</p></div></header>
            <div class="newsletter-form-body">
              <div class="newsletter-form-fields-wrapper form-fields">
                <div id="newsletter-email-item" class="newsletter-form-field-wrapper form-item field email required">
                  <label class="newsletter-form-field-label title" for="newsletter-email-field">Email Address</label>
                  <input id="newsletter-email-field" class="newsletter-form-field-element field-element" name="email" autocomplete="email" type="email" spellcheck="false" placeholder="Email Address">
                </div>
              </div>
              <div class="newsletter-form-button-wrapper submit-wrapper"><button class="newsletter-form-button" type="submit" value="Sign Up"><span class="newsletter-form-button-label">Sign Up</span></button></div>
            </div>
            <div class="newsletter-form-footnote"><p></p></div>
            <div class="hidden form-submission-text"><p>Thank you!</p></div>
            <div class="hidden form-submission-html"></div>
          </form></div>
        </div></div>`;
}

const PRODUCTS = [
  { slug: 'ceramic-mug', title: 'Ceramic Mug', price: '$24.00' },
  { slug: 'linen-tote-bag', title: 'Linen Tote Bag', price: '$38.00' },
  { slug: 'oak-cutting-board', title: 'Oak Cutting Board', price: '$56.00' },
];

// The product list as 7.1 renders it: each item is a link with the title and
// the price; there is no "Add to cart" button in the list.
function productList() {
  const items = PRODUCTS.map((p) => `<div class="product-list-item is-loaded">
            <a class="product-list-item-link" href="/shop/p/${p.slug}.html" aria-label="${p.title}">
              <div class="product-list-image-wrapper"><figure class="product-list-item-image"><div class="grid-image-wrapper"><img src="/assets/img/product-placeholder.svg" alt="${p.title}"></div></figure></div>
              <section class="product-list-item-meta"><div class="product-list-title-price"><div class="product-list-item-title">${p.title}</div><div class="product-list-item-price">${p.price}</div></div></section>
            </a>
          </div>`).join('\n          ');
  return `<div class="product-list">
          <div class="product-list-header"><h2 class="nested-category-title">Shop</h2></div>
          <div class="product-list-result-count-container"><span class="product-list-result-count">${PRODUCTS.length} Results</span></div>
          <div class="product-list-container"><div class="product-list-layout-container">
          ${items}
          </div></div>
        </div>`;
}

// A product page as 7.1 renders it: title, price, quantity field and the
// "Add to cart" button, whose label turns into "Added!" after a click.
function productPage(p) {
  return `<div class="product-detail">
          <h1 class="product-title">${p.title}</h1>
          <div id="main-product-price" class="product-price"><div class="product-price-value">${p.price}</div></div>
          <div class="product-add-to-cart"><div class="product-add-to-cart-layout-wrapper"><div class="product-purchase-controls-wrapper">
            <div class="sqs-site-style-form product-quantity-input-wrapper"><div class="form-item"><div class="product-quantity-input custom-form-element" role="group" aria-label="Quantity">
              <button class="decrease-button" type="button" aria-label="Decrease quantity by 1">-</button>
              <input name="quantity-input" type="number" value="1" min="1" max="9999" size="4" autocomplete="off">
              <button class="increase-button" type="button" aria-label="Increase quantity by 1">+</button>
            </div></div></div>
            <div class="sqs-add-to-cart-button-wrapper product-add-to-cart-button-wrapper">
              <button class="sqs-add-to-cart-button sqs-button-element--primary"><div class="sqs-add-to-cart-button-inner"><span class="add-to-cart-text">Add To Cart</span><span class="cart-added-text">Added!</span></div></button>
            </div>
          </div></div></div>
        </div>`;
}

const POSTS = [
  { slug: 'seasoning-a-cutting-board', title: 'Seasoning a cutting board the right way', date: '6/2/26', long: 'June 2', author: 'Studio Team', excerpt: 'Oil, patience, and a soft cloth: the whole ritual explained.' },
  { slug: 'why-we-use-linen', title: 'Why we use linen instead of canvas', date: '5/14/26', long: 'May 14', author: 'Studio Team', excerpt: 'It is heavier to sew, but it ages better than almost anything else.' },
];

// The blog list as 7.1 renders it (single column layout): each post is an
// `article.blog-item` with its title in `h1.blog-title a`.
function blogList() {
  const items = POSTS.map((p) => `<article class="hentry post-type-text blog-single-column--container entry blog-item is-loaded">
            <div><a href="/blog/${p.slug}.html" class="image-wrapper"><img src="/assets/img/product-placeholder.svg" alt=""></a></div>
            <div class="blog-article-spacer"></div>
            <div class="blog-single-column--text">
              <div class="blog-meta-section"><span class="blog-meta-primary"><span class="blog-author">${p.author}</span><time class="blog-date" pubdate>${p.date}</time></span><span class="blog-meta-delimiter"></span><span class="blog-meta-secondary"><span class="blog-author">${p.author}</span><time class="blog-date" pubdate>${p.date}</time></span></div>
              <h1 class="blog-title"><a href="/blog/${p.slug}.html" data-no-animation>${p.title}</a></h1>
              <div class="blog-excerpt"><div class="blog-excerpt-wrapper"><p>${p.excerpt}</p></div></div>
              <a class="blog-more-link" href="/blog/${p.slug}.html">Read More</a>
            </div>
          </article>`).join('\n          ');
  return `<div class="blog-list blog-single-column"><div class="blog-single-column--wrapper">
          ${items}
          </div></div>`;
}

// A post page as 7.1 renders it: `h1.entry-title`, the date in
// `time.blog-meta-item--date`, the author as `.blog-author-name`.
function blogPost(p) {
  return `<div class="blog-item-wrapper blog-alternating-side-by-side-item-wrapper">
          <article class="h-entry entry hentry post-type-text" itemscope itemtype="https://schema.org/BlogPosting"><div class="blog-item-inner-wrapper">
            <div class="blog-item-top-wrapper">
              <div class="blog-item-title"><h1 class="entry-title entry-title--large p-name" itemprop="headline">${p.title}</h1></div>
              <div class="blog-item-meta-wrapper"><div class="blog-item-author-date-wrapper">
                <time class="dt-published blog-meta-item blog-meta-item--date" datetime="2026-06-02" pubdate><span>${p.long}</span></time>
                <div class="blog-meta-item blog-meta-item--author p-author author">Written by <a href="/blog.html" class="blog-author-name">${p.author}</a></div>
              </div></div>
            </div>
            <div class="blog-item-content-wrapper"><div class="blog-item-content e-content" itemprop="articleBody"><div class="sqs-html-content"><p>${p.excerpt}</p></div></div></div>
          </div></article>
        </div>`;
}

// A gallery section as 7.1 renders it: a grid of figures. The lightbox is off,
// as on the public template demos.
function gallery() {
  const figure = (n) => `<figure class="gallery-grid-item" data-loaded="true"><div class="gallery-grid-item-wrapper"><img src="/assets/img/product-placeholder.svg" alt="Workshop photo ${n}"></div></figure>`;
  return `<div class="gallery-section"><div class="gallery-grid gallery-grid--layout-grid" data-lightbox="false" data-columns="3">
          <div class="gallery-grid-wrapper">${[1, 2, 3].map(figure).join('')}</div>
        </div></div>`;
}

// The search page as 7.1 and 7.0 render it: an input, the results as
// `.search-result` (role link) with a `.sqs-title`, and a notice for no match.
function searchPage() {
  return `<div class="sqs-search-page sqs-search-page-content">
          <div class="sqs-search-page-input sqs-search-input"><form><input placeholder="Type to search" type="text" spellcheck="false" value=""></form></div>
          <div class="sqs-search-page-output">
            <div class="sqs-search-page-notice hide"></div>
            <div class="sqs-search-page-result"><div class="sqs-search-container-list sqs-search-page-list"><div class="search-results"></div></div></div>
          </div>
        </div>`;
}

function page({ file, title, path: p, activeAs, body, scripts = [] }) {
  const pg = { path: p, activeAs };
  const doc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} &mdash; ${SITE}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script>window.Static = { SQUARESPACE_CONTEXT: { templateVersion: '7.1', website: { siteTitle: '${SITE}', language: 'en-US' } } };</script>
  <script defer src="/assets/js/squarespace-demo.js"></script>
  <script defer src="/assets/js/cart.js"></script>
${scripts.map((s) => `  <script defer src="/assets/js/${s}"></script>`).join('\n')}
</head>
<body>
  <div id="siteWrapper" class="clearfix site-wrapper">
  ${header(pg)}
  <main id="page" class="container" role="main">
    <article class="sections" id="sections">
      ${body}
    </article>
  </main>
  ${footer}
  </div>
</body>
</html>
`;
  fs.mkdirSync(path.dirname(path.join(OUT, file)), { recursive: true });
  fs.writeFileSync(path.join(OUT, file), doc);
}

const pages = [
  { file: 'index.html', title: 'Home', path: '/', body: [
    section(`${html('<h1>Handmade goods, honestly sourced.</h1><p>A small studio making things that last.</p>')}
        ${button('/shop.html', 'Shop the collection')}`),
    section(html('<h2>Welcome to Demo Studio</h2><p>This is a self-contained demo site that carries the markup Squarespace 7.1 renders, so the <code>squarespace-steps</code> suite can run in CI without a Squarespace account.</p>')),
  ].join('\n      ') },
  { file: 'about.html', title: 'About', path: '/about.html', body: [
    section(html('<h1>About Demo Studio</h1><p>Small batch. Big care.</p><h2>Our story</h2><p>Demo Studio started in a garage with one sewing machine and a stubborn belief that things should be made to last.</p>')),
    section(gallery()),
  ].join('\n      ') },
  { file: 'shop.html', title: 'Shop', path: '/shop.html', body: section(productList()) },
  ...PRODUCTS.map((p) => ({ file: `shop/p/${p.slug}.html`, title: p.title, path: `/shop/p/${p.slug}.html`, activeAs: '/shop.html', body: section(productPage(p)) })),
  { file: 'cart.html', title: 'Cart', path: '/cart', body: section(html('<h2>Your cart</h2><p>The cart opens here. The count in the header is the number of items you added.</p>')) },
  { file: 'blog.html', title: 'Blog', path: '/blog.html', body: section(blogList()) },
  ...POSTS.map((p) => ({ file: `blog/${p.slug}.html`, title: p.title, path: `/blog/${p.slug}.html`, activeAs: '/blog.html', body: section(blogPost(p)) })),
  { file: 'search.html', title: 'Search', path: '/search', scripts: ['search.js'], body: section(searchPage()) },
  { file: 'contact.html', title: 'Contact', path: '/contact.html', scripts: ['contact-form.js'], body: [
    section(html('<h1>Contact us</h1><p>We usually reply within a day or two.</p>')),
    section(formBlock()),
    section(newsletterBlock()),
  ].join('\n      ') },
];

fs.mkdirSync(OUT, { recursive: true });
pages.forEach(page);
console.log(`Wrote ${pages.length} pages to ${path.relative(process.cwd(), OUT)}`);
