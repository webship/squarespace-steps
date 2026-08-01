# CLAUDE.md — squarespace-steps project rules for AI agents

This file is the durable contract for any AI coding assistant working in this repository. Read it before making changes.

## 1. Identity

`@webship/squarespace-steps` is a [webship-js](https://github.com/webship/webship-js) Cucumber/Playwright test project for testing Squarespace sites, following webship-js's standard consumer-project layout (steps in `tests/step-definitions/`, features in `tests/features/`). It is published to npm as `@webship/squarespace-steps` — one of a family of similar per-site test projects (`@webship/wordpress-steps`, `@webship/odoo-steps`, ...) maintained under the `webship` GitHub organisation.

## 2. Git & commit rules

- Commit identity: `Webship.co` (set locally via `git config user.name` / `user.email`, not global).
- Every commit gets a `Co-authored-by: <AI name> <noreply@anthropic.com>` trailer for the AI and model that made it.
- **Never commit directly to `2.0.x` (the default branch).** Work on a topic branch and open a pull request, even though this is a private, single-maintainer repo. The one accepted exception is a minimal one-time bootstrap commit needed to give a brand-new GitHub repo a base branch to open PRs against — flag it explicitly if it happens; everything else goes through PRs.
- One GitHub issue + one PR per logical unit of work (scaffold, steps, features, CI, docs, ...), not one large PR. List every issue/PR link for the user to review. In practice PRs get squash-merged immediately after creation since there is no separate reviewer — but still create them as PRs, not direct pushes.

## 3. Publishing

This is a `"private": true` test project, not an npm package. It is never published to npm.

## 4. Step definitions

- `tests/step-definitions/squarespace.steps.js`, following webship-js's standard scaffold location (`init-webship-js` creates `tests/step-definitions/`).
- Follow webship-js's own authoring conventions: pronoun-flexible phrasing (`(I |we )*` prefix via regex where natural), plain English step text (no camelCase), and a JSDoc block with at least 5 `Example #N:` Gherkin lines above each step.
- **Regex step patterns: every capturing group must be consumed by a handler argument.** cucumber-js passes each capture group as a positional argument — an unused group causes a runtime arity error ("function has N arguments, should have M"). Use non-capturing groups `(?:...)` for alternation you don't need the matched text of.
- **Prefer `.textContent()` over `.innerText()`** when asserting literal DOM text (e.g. nav labels). `innerText` reflects CSS-rendered text (e.g. `text-transform: uppercase` turns "Home" into "HOME"), which silently breaks string-equality assertions against the source text.
- Selectors target Squarespace's well-known 7.1 template class names (`.Header`, `.Footer`, `.ProductList`, `.BlogList`, `.form-wrapper`, `.sqs-add-to-cart-button`, ...) so the step vocabulary works across most Squarespace sites without per-project configuration.

## 5. Demo site

No live Squarespace site was provided when this repo was built, so `demo-site/` is a self-built static fixture (Home/About/Shop/Blog/Contact) with representative Squarespace markup. Prefer testing against this fixture in CI (via `npm run demo:serve`); to test a real Squarespace site, set `LAUNCH_URL` to that site's URL instead. Squarespace is closed-source SaaS with no self-hostable distribution, so CI cannot spin up a "real" Squarespace instance (e.g. via DDEV, which only works for self-hostable PHP CMSs like WordPress/TYPO3/Drupal) — the demo-site fixture is the only practical CI target.

## 6. Before declaring work done

1. `npx cucumber-js --dry-run` — no ambiguous or undefined steps.
2. `npm run demo:serve` (or point `LAUNCH_URL` at a real site) then `npm test` — all scenarios must pass.
3. Check the GitHub Actions run for the pushed branch/PR is green.

## 7. Avoid

- Comments that describe WHAT the code does — names already do that.
- Backwards-compatibility shims, `_unused` renames, `// removed` comments — delete unused code, git history is the record.
- Adding a live external site dependency for CI when a self-built fixture would be more stable (see §5).
