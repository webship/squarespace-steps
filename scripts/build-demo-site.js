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

const activeHref = (page, href) => page.path === href;
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

function page({ file, title, path: p, body, scripts = [] }) {
  const pg = { path: p };
  const doc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} &mdash; ${SITE}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="/assets/css/style.css">
  <script>window.Static = { SQUARESPACE_CONTEXT: { templateVersion: '7.1', website: { siteTitle: '${SITE}', language: 'en-US' } } };</script>
  <script defer src="/assets/js/squarespace-demo.js"></script>
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
  fs.writeFileSync(path.join(OUT, file), doc);
}

const pages = [
  { file: 'index.html', title: 'Home', path: '/', body: [
    section(`${html('<h1>Handmade goods, honestly sourced.</h1><p>A small studio making things that last.</p>')}
        ${button('/shop.html', 'Shop the collection')}`),
    section(html('<h2>Welcome to Demo Studio</h2><p>This is a self-contained demo site that carries the markup Squarespace 7.1 renders, so the <code>squarespace-steps</code> suite can run in CI without a Squarespace account.</p>')),
  ].join('\n      ') },
  { file: 'about.html', title: 'About', path: '/about.html', body: section(html('<h1>About Demo Studio</h1><p>Small batch. Big care.</p><h2>Our story</h2><p>Demo Studio started in a garage with one sewing machine and a stubborn belief that things should be made to last.</p>')) },
  { file: 'shop.html', title: 'Shop', path: '/shop.html', scripts: ['cart.js'], body: `
    <section class="hero">
      <h1 class="hero-title">Shop</h1>
      <p class="hero-subtitle">Everything handmade, nothing mass-produced.</p>
      <p class="Cart-summary" aria-live="polite"><span class="Cart-count">0</span> item(s) in cart</p>
    </section>

    <ul class="ProductList" data-total-products="3">
      <li class="ProductList-item" data-product-id="ceramic-mug">
        <a href="/shop.html#ceramic-mug">
          <img src="/assets/img/product-placeholder.svg" alt="Ceramic Mug">
          <p class="ProductItem-title">Ceramic Mug</p>
          <p class="ProductItem-price">$24.00</p>
        </a>
        <button class="sqs-add-to-cart-button" data-product-id="ceramic-mug" data-product-title="Ceramic Mug" data-product-price="24.00">Add to Cart</button>
      </li>
      <li class="ProductList-item" data-product-id="linen-tote">
        <a href="/shop.html#linen-tote">
          <img src="/assets/img/product-placeholder.svg" alt="Linen Tote Bag">
          <p class="ProductItem-title">Linen Tote Bag</p>
          <p class="ProductItem-price">$38.00</p>
        </a>
        <button class="sqs-add-to-cart-button" data-product-id="linen-tote" data-product-title="Linen Tote Bag" data-product-price="38.00">Add to Cart</button>
      </li>
      <li class="ProductList-item" data-product-id="oak-cutting-board">
        <a href="/shop.html#oak-cutting-board">
          <img src="/assets/img/product-placeholder.svg" alt="Oak Cutting Board">
          <p class="ProductItem-title">Oak Cutting Board</p>
          <p class="ProductItem-price">$56.00</p>
        </a>
        <button class="sqs-add-to-cart-button" data-product-id="oak-cutting-board" data-product-title="Oak Cutting Board" data-product-price="56.00">Add to Cart</button>
      </li>
    </ul>

    <aside class="Cart-inner" hidden>
      <h2>Your cart</h2>
      <ul class="Cart-items"></ul>
      <p class="Cart-empty">Your cart is empty.</p>
    </aside>` },
  { file: 'blog.html', title: 'Blog', path: '/blog.html', body: `
    <section class="hero">
      <h1 class="hero-title">Journal</h1>
      <p class="hero-subtitle">Notes from the workshop.</p>
    </section>

    <ul class="BlogList" data-total-posts="2">
      <li class="BlogList-item">
        <h2 class="BlogItem-title"><a href="/blog.html#seasoning-a-cutting-board">Seasoning a cutting board the right way</a></h2>
        <p class="BlogItem-meta">Posted on <time datetime="2026-06-02">June 2, 2026</time></p>
        <p class="BlogItem-excerpt">Oil, patience, and a soft cloth &mdash; the whole ritual explained.</p>
      </li>
      <li class="BlogList-item">
        <h2 class="BlogItem-title"><a href="/blog.html#why-we-use-linen">Why we use linen instead of canvas</a></h2>
        <p class="BlogItem-meta">Posted on <time datetime="2026-05-14">May 14, 2026</time></p>
        <p class="BlogItem-excerpt">It's heavier to sew, but it ages better than almost anything else.</p>
      </li>
    </ul>` },
  { file: 'contact.html', title: 'Contact', path: '/contact.html', scripts: ['contact-form.js'], body: [
    section(html('<h1>Contact us</h1><p>We usually reply within a day or two.</p>')),
    section(formBlock()),
    section(newsletterBlock()),
  ].join('\n      ') },
];

fs.mkdirSync(OUT, { recursive: true });
pages.forEach(page);
console.log(`Wrote ${pages.length} pages to ${path.relative(process.cwd(), OUT)}`);
