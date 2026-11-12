'use strict';

// squarespace-steps: custom webship-js Cucumber step definitions for testing
// Squarespace sites. Consuming projects load this file via cucumber.js
// `require`, alongside webship-js's own built-in step definitions:
//
//   require: [
//     'node_modules/webship-js/tests/step-definitions/**/*.js',
//     'node_modules/@webship-js/squarespace-steps/tests/step-definitions/squarespace.steps.js',
//     'tests/step-definitions/**/*.js',
//   ],
//
// This file only loads the step files of the pack, so one line in `require`
// is enough. README.md documents every step.
//
// The product word is optional in every sentence ("the Squarespace form" and
// "the form" both match). Every assertion waits for its condition (the
// assertion is the wait) for the `minWaitTime.page` budget, every action
// settles the page afterwards, and every failure is a friendly error with a
// hint instead of a raw assertion or Playwright stack.

require('./squarespace-navigation.steps');
require('./squarespace-page.steps');
require('./squarespace-forms.steps');
require('./squarespace-shop.steps');
require('./squarespace-blog.steps');
require('./squarespace-content.steps');
