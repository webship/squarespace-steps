(function () {
  'use strict';

  var CAPTION = '.description, .form-field-error, .field-error';

  function caption(label) {
    var copy = label.cloneNode(true);
    copy.querySelectorAll(CAPTION).forEach(function (node) { node.remove(); });
    return copy.textContent.replace(/\s+/g, ' ').trim();
  }

  // The form block: errors are paragraphs inside the label, as the real block
  // renders them after the server rejected the submission.
  function validateFormBlock(form) {
    var missing = [];
    form.querySelectorAll('.form-field-error').forEach(function (node) { node.remove(); });
    form.querySelectorAll('input, select, textarea').forEach(function (control) {
      control.setAttribute('aria-invalid', 'false');
      var empty = !control.value.trim();
      var required = control.required || control.getAttribute('aria-required') === 'true';
      if (!required || !empty) return;
      var label = control.labels && control.labels[0];
      var name = label ? caption(label) : control.getAttribute('aria-label');
      control.setAttribute('aria-invalid', 'true');
      var error = document.createElement('p');
      error.className = 'form-field-error';
      error.textContent = name + ' is required.';
      (label || control.parentNode).appendChild(error);
      missing.push(name);
    });
    return missing;
  }

  var block = document.querySelector('.form-wrapper form');
  if (block) {
    block.addEventListener('submit', function (event) {
      event.preventDefault();
      if (validateFormBlock(block).length) return;
      block.hidden = true;
      var out = document.querySelector('.sqs-form-block-submission-html');
      out.textContent = 'Thanks — your message has been sent.';
    });
  }

  // The newsletter block: a div.field-error before the title, the form item
  // gets the class "error"; a valid email reveals .form-submission-text.
  var newsletter = document.querySelector('.newsletter-form');
  if (newsletter) {
    newsletter.addEventListener('submit', function (event) {
      event.preventDefault();
      newsletter.querySelectorAll('.field-error').forEach(function (node) { node.remove(); });
      newsletter.querySelectorAll('.form-item.error').forEach(function (node) { node.classList.remove('error'); });
      var input = newsletter.querySelector('input[type="email"]');
      var item = input.closest('.form-item');
      var name = caption(item.querySelector('label'));
      var message = !input.value.trim() ? name + ' is required.' : !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value) ? name + ' is not valid.' : '';
      if (message) {
        var error = document.createElement('div');
        error.className = 'field-error';
        error.textContent = message;
        item.classList.add('error');
        item.insertBefore(error, item.querySelector('label'));
        return;
      }
      newsletter.querySelectorAll('*').forEach(function (node) { node.classList.add('hidden'); });
      var thanks = newsletter.querySelector('.form-submission-text');
      thanks.classList.remove('hidden');
      thanks.querySelectorAll('*').forEach(function (node) { node.classList.remove('hidden'); });
    });
  }
})();
