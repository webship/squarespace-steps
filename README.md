# squarespace-steps

[![Test](https://github.com/webship/squarespace-steps/actions/workflows/test.yml/badge.svg)](https://github.com/webship/squarespace-steps/actions/workflows/test.yml)

A [webship-js](https://github.com/webship/webship-js) Cucumber/Playwright test project for [Squarespace](https://www.squarespace.com/) sites — navigation, hero sections, footers, contact forms, shop/product grids, and blog listings.

This repository contains:

- **Squarespace step definitions** — `tests/step-definitions/squarespace.steps.js`, required alongside webship-js's own built-in steps.
- **A self-test harness** — a self-contained demo Squarespace-style site (`demo-site/`) and a full set of `.feature` files (`tests/features/`) that exercise those steps in CI.

## Why a demo site instead of a live Squarespace site?

Pointing tests at a real, live Squarespace site would make the suite flaky (content changes, deploys, network) and would require sharing site credentials. Instead, `demo-site/` is a small static site built with representative Squarespace 7.1 markup patterns (`.Header`, `.Footer`, `.ProductList`, `.BlogList`, `.form-wrapper`, `.sqs-add-to-cart-button`, …), so the step definitions and `.feature` files have a stable, versioned target.

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

Squarespace-specific steps live in `tests/step-definitions/squarespace.steps.js` (navigation, hero, footer, forms, shop/cart, blog). They're loaded via the `require` list in `cucumber.js` alongside webship-js's built-in steps.

## Contributing

All changes land via pull request against `2.0.x` — see the [issue tracker](https://github.com/webship/squarespace-steps/issues) for open work.

## License

MIT — see [LICENSE](LICENSE).
