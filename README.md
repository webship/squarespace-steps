# squarespace-steps

[![Test](https://github.com/webship/squarespace-steps/actions/workflows/test.yml/badge.svg)](https://github.com/webship/squarespace-steps/actions/workflows/test.yml)

A [webship-js](https://github.com/webship/webship-js) Cucumber/Playwright test project for [Squarespace](https://www.squarespace.com/) sites: navigation, hero sections, footers, contact forms, shop/product grids, and blog listings.

This repository contains:

- **Squarespace step definitions** in `tests/step-definitions/squarespace.steps.js`, required alongside webship-js's own built-in steps.
- **A self-test harness**: a self-contained demo Squarespace-style site (`demo-site/`) and a full set of `.feature` files (`tests/features/`) that exercise those steps in CI.

## Why a demo site instead of a live Squarespace site?

Pointing tests at a real, live Squarespace site would make the suite flaky (content changes, deploys, network) and would require sharing site credentials. Instead, `demo-site/` is a small static site built with representative Squarespace markup (`.Header`, `.Footer`, `.ProductList`, `.BlogList`, `.form-wrapper`, `.sqs-add-to-cart-button`, ...), so the step definitions and `.feature` files have a stable, versioned target.

The step selectors cover both Squarespace template generations: 7.0 (Brine family classes such as `.Header-nav-item`, `.Footer`, `.Mobile-bar-menu`, `.ProductList-item`, `.BlogList-item`) and 7.1 (`.header-nav-item`, `#footer-sections`, `.header-burger-btn`, `.grid-item`, `.blog-item`), plus the classes both share (`.form-wrapper`, `.sqs-add-to-cart-button`, `.sqs-cart-quantity`, `.sqs-block-button-element`). Squarespace is a hosted product with no login page a static fixture could provide, so the steps cover the public site only; nothing here needs an account.

To point this project at a real Squarespace site instead, set `LAUNCH_URL` to that site's URL when running `npm test`.

## Setup

```bash
npm install
npx playwright install chromium
```

## Running tests

```bash
npm run demo:serve &          # serves demo-site/ on http://localhost:8080
npm test                      # runs tests/features/**/*.feature against it
```

CI (`.github/workflows/test.yml`) runs the same flow on every push and pull request.

## Step definitions

Squarespace-specific steps live in `tests/step-definitions/squarespace.steps.js` (navigation, hero, footer, forms, shop/cart, blog). They're loaded via the `require` list in `cucumber.js` alongside webship-js's built-in steps. To reuse them in another webship-js project, install `@webship-js/squarespace-steps` and add `node_modules/@webship-js/squarespace-steps/tests/step-definitions/squarespace.steps.js` to that project's `require` list.

| Step | Type |
| --- | --- |
| `the (site\|main )navigation should( not) contain "<label>"` | Then |
| `"<label>" should( not) be the current navigation item` | Then |
| `I open the mobile (navigation )menu` | When |
| `the mobile (navigation\|menu) toggle( button) should( not) be visible` | Then |
| `the (desktop\|main\|site) navigation should( not) be visible` | Then |
| `the hero title should( not) be "<title>"` | Then |
| `the hero (call-to-action button\|CTA) should( not) link to "<href>"` | Then |
| `the (site )footer should( not) be visible` / `I should( not) see the footer` | Then |
| `the (site )footer should( not) show\|display a copyright( notice)` | Then |
| `the footer navigation should( not) contain "<label>"` | Then |
| `I fill in the (Squarespace )form field "<label>" with "<value>"` | When |
| `I submit the (Squarespace )form` | When |
| `the (Squarespace )form should( not) show the submitted confirmation( message)` / `I should( not) see the form submitted confirmation` | Then |
| `the shop should list <n> product(s)` | Then |
| `I add the product "<title>" to the cart` | When |
| `the cart should contain <n> item(s)` | Then |
| `the blog should list <n> post(s)` | Then |
| `the blog post "<title>" should( not) be visible` | Then |

The product word is optional ("the Squarespace form" and "the form" both match), so a feature written for another pack reads here too. Every Then step takes `should` or `should not`, every action takes `I`, `we` or no pronoun, and every failure is a friendly message with a hint (no assertion or Playwright stack). Each assertion polls its condition for the `minWaitTime.page` budget (at least 10 s) instead of reading the page once, and every click this pack performs settles the page before the next step.

Two things to know about the selectors: the hero title is the first level-one heading of the page content (`.hero-title`, `main h1`, `#page h1`, `#siteWrapper h1`), and the list ends in a bare `h1`, so on a page with no hero block the step compares against the page's first `h1`; and the reference features assert the demo site's own copy, counts and paths ("Ceramic Mug", `/shop.html`, ...), so swap those values for your site's content when you copy a feature.

Every step's regex and five Gherkin examples are in the JSDoc block above it; `npm run test:examples` checks that each example matches its own step (and no webship-js core step) and that every feature step is defined exactly once. CI runs it before the suite.

## Contributing

All changes land via pull request against `2.0.x`; see the [issue tracker](https://github.com/webship/squarespace-steps/issues) for open work.

## License

MIT, see [LICENSE](LICENSE).
