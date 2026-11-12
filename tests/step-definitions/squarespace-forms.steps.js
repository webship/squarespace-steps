'use strict';

// Form steps for the two form types a Squarespace 7.1 page can hold:
//
// - the form block (`.form-wrapper`), whose submission is validated by the
//   server: an empty field shows `p.form-field-error` and `aria-invalid="true"`
//   after the form was posted;
// - the newsletter block (`.newsletter-form`), validated in the browser: an
//   empty field shows `div.field-error` inside a `.form-item.error`, and a
//   sent form reveals `.form-submission-text`.
//
// A field is found by its label as a person reads it ("Email"), without the
// "(required)" mark. Steps that send a form change data on the site: do not
// run them against a site you do not own.

const { When, Then } = require('@cucumber/cucumber');
const {
  SELECTORS,
  settle,
  actOrExplain,
  assertScan,
  clickVisible,
  findField,
  assertFieldError,
} = require('./squarespace-helpers');

const FORM_HINT = 'Squarespace form blocks render inside `.form-wrapper`; a field is found by its label text without the "(required)" mark, and the submit button is `.form-submit-button`.';
const NEWSLETTER_HINT = 'Newsletter blocks render a `.newsletter-form`; a field is found by its label text and the submit button is `.newsletter-form-button`.';

async function fill(world, scope, label, value, hint) {
  const field = await findField(world, scope, label, hint);
  await actOrExplain('fill in the form field', label, () => field.fill(value), `${hint} A dropdown is chosen with "I choose ... for the form field".`);
}

/**
 * Fill a text, email or message field of the Squarespace form block, found by
 * its label. A "Name" field is two fields: "First Name" and "Last Name".
 *
 * Example #1: When I fill in the form field "Email" with "info@webship.co"
 * Example #2: When I fill in the form field "First Name" with "Jane"
 * Example #3: And I fill in the form field "Message" with "Hello there"
 * Example #4: When we fill in the form field "Last Name" with "Doe"
 * Example #5: When fill in the form field "Subject" with "Question about an order"
 *
 */
When(/^(I |we )*fill in the form field "([^"]*)" with "([^"]*)"$/, async function (pronounCase, label, value) {
  await fill(this, SELECTORS.form, label, value, FORM_HINT);
});

/**
 * Choose an option of a dropdown field of the Squarespace form block, by the
 * option text.
 *
 * Example #1: When I choose "Press inquiry" for the form field "Inquiry"
 * Example #2: When we choose "Customer service" for the form field "Inquiry"
 * Example #3: And I choose "Stockist inquiry" for the form field "Inquiry"
 * Example #4: When choose "Other" for the form field "Topic"
 * Example #5: And we choose "France" for the form field "Country"
 *
 */
When(/^(I |we )*choose "([^"]*)" for the form field "([^"]*)"$/, async function (pronounCase, option, label) {
  const field = await findField(this, SELECTORS.form, label, FORM_HINT);
  await actOrExplain('choose the option', option, () => field.selectOption({ label: option }),
    `${FORM_HINT} The field must be a dropdown that offers the option "${option}".`);
});

/**
 * Submit the Squarespace form block and settle, so the errors or the
 * confirmation have a chance to appear. The form is posted to Squarespace,
 * which stores the submission: do not use this on a site you do not own.
 *
 * Example #1: When I submit the form
 * Example #2: When we submit the form
 * Example #3: And I submit the form
 * Example #4: When I submit the form
 * Example #5: And we submit the form
 *
 */
When(/^(I |we )*submit the form$/, async function (pronounCase) {
  await clickVisible(this, { selector: SELECTORS.formSubmit, what: 'the form submit button', hint: FORM_HINT });
  await settle(this);
});

/**
 * Assert a field of the Squarespace form block does (or does not) show an
 * error. After a failed submission the field has `aria-invalid="true"` and an
 * error message.
 *
 * Example #1: Then the form should show an error for the field "Email"
 * Example #2: And the form should show an error for the field "Message"
 * Example #3: And the form should show an error for the field "First Name"
 * Example #4: But the form should not show an error for the field "Email"
 * Example #5: And the form should not show an error for the field "Inquiry"
 *
 */
Then(/^(?:the )?form should( not)* show an error for the field "([^"]*)"$/, async function (notCase, label) {
  await assertFieldError(this, SELECTORS.form, label, Boolean(notCase),
    `${FORM_HINT} Errors appear after the form was submitted with a field missing.`);
});

/**
 * Assert the Squarespace form block shows (or does not show) an error
 * message with exactly this text, such as "Email is required.".
 *
 * Example #1: Then the form should show the error "Email is required."
 * Example #2: And the form should show the error "Message is required."
 * Example #3: And the form should show the error "First Name is required."
 * Example #4: But the form should not show the error "Email is required."
 * Example #5: And the form should not show the error "Inquiry is required."
 *
 */
Then(/^(?:the )?form should( not)* show the error "([^"]*)"$/, async function (notCase, message) {
  await assertScan(this, { selector: SELECTORS.formErrors, text: message, visible: true }, {
    not: Boolean(notCase),
    what: `the form error "${message}"`,
    hint: `${FORM_HINT} The message is compared exactly; the form shows errors after it was submitted with a field missing.`,
  });
});

/**
 * Assert the Squarespace form block does (or does not) show its
 * confirmation after a submission. The text is the one set in the form's
 * storage settings.
 *
 * Example #1: Then the form should show the submitted confirmation
 * Example #2: And the form should show the submitted confirmation
 * Example #3: Then the form should not show the submitted confirmation message
 * Example #4: Then I should see the form submitted confirmation
 * Example #5: And we should not see the form submitted confirmation
 *
 */
Then(/^(?:(?:the )?form should( not)* show the submitted confirmation(?: message)?|(?:I |we )*should( not)* see the form submitted confirmation)$/, async function (notShow, notSee) {
  await assertScan(this, { selector: SELECTORS.formConfirmation, visible: true, nonEmpty: true }, {
    not: Boolean(notShow || notSee),
    what: 'the form confirmation',
    hint: 'After a successful submission the form is replaced by its confirmation text (`.form-submission-text` or `.sqs-form-block-submission-html`); submit the form first and check every required field was filled.',
  });
});

/**
 * Fill the field of the newsletter block, found by its label.
 *
 * Example #1: When I fill in the newsletter form field "Email Address" with "subscriber@example.com"
 * Example #2: When we fill in the newsletter form field "Email Address" with "info@webship.co"
 * Example #3: And I fill in the newsletter form field "Email" with "not-an-address"
 * Example #4: When fill in the newsletter form field "Email Address" with ""
 * Example #5: And we fill in the newsletter form field "Name" with "Jane"
 *
 */
When(/^(I |we )*fill in the newsletter form field "([^"]*)" with "([^"]*)"$/, async function (pronounCase, label, value) {
  await fill(this, SELECTORS.newsletter, label, value, NEWSLETTER_HINT);
});

/**
 * Submit the newsletter block. An empty or wrong email address is stopped in
 * the browser; a good one is sent to the site's mailing list storage.
 *
 * Example #1: When I submit the newsletter form
 * Example #2: When we submit the newsletter form
 * Example #3: And I submit the newsletter form
 * Example #4: When submit the newsletter form
 * Example #5: And we submit the newsletter form
 *
 */
When(/^(I |we )*submit the newsletter form$/, async function (pronounCase) {
  await clickVisible(this, { selector: SELECTORS.newsletterSubmit, what: 'the newsletter sign-up button', hint: NEWSLETTER_HINT });
  await settle(this);
});

/**
 * Assert a field of the newsletter block does (or does not) show an error.
 *
 * Example #1: Then the newsletter form should show an error for the field "Email Address"
 * Example #2: And the newsletter form should show an error for the field "Email Address"
 * Example #3: But the newsletter form should not show an error for the field "Email Address"
 * Example #4: Then the newsletter form should show an error for the field "Email"
 * Example #5: And the newsletter form should not show an error for the field "Name"
 *
 */
Then(/^(?:the )?newsletter form should( not)* show an error for the field "([^"]*)"$/, async function (notCase, label) {
  await assertFieldError(this, SELECTORS.newsletter, label, Boolean(notCase), NEWSLETTER_HINT);
});

/**
 * Assert the newsletter block shows (or does not show) an error message with
 * exactly this text, such as "Email Address is required.".
 *
 * Example #1: Then the newsletter form should show the error "Email Address is required."
 * Example #2: And the newsletter form should show the error "Email Address is required."
 * Example #3: But the newsletter form should not show the error "Email Address is required."
 * Example #4: Then the newsletter form should show the error "Email Address is not valid."
 * Example #5: And the newsletter form should not show the error "Name is required."
 *
 */
Then(/^(?:the )?newsletter form should( not)* show the error "([^"]*)"$/, async function (notCase, message) {
  await assertScan(this, { selector: SELECTORS.newsletterErrors, text: message, visible: true }, {
    not: Boolean(notCase),
    what: `the newsletter error "${message}"`,
    hint: `${NEWSLETTER_HINT} The message is compared exactly.`,
  });
});

/**
 * Assert the newsletter block does (or does not) show its thank-you text
 * after a sign-up.
 *
 * Example #1: Then the newsletter form should show the submitted confirmation
 * Example #2: And the newsletter form should show the submitted confirmation message
 * Example #3: But the newsletter form should not show the submitted confirmation
 * Example #4: Then the newsletter form should not show the submitted confirmation message
 * Example #5: And the newsletter form should show the submitted confirmation
 *
 */
Then(/^(?:the )?newsletter form should( not)* show the submitted confirmation(?: message)?$/, async function (notCase) {
  await assertScan(this, { selector: SELECTORS.newsletterConfirmation, visible: true, nonEmpty: true }, {
    not: Boolean(notCase),
    what: 'the newsletter confirmation',
    hint: 'After a sign-up the newsletter block reveals its `.form-submission-text`; submit a valid email address first.',
  });
});
