(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var message = form.querySelector('.form-submitted-message');
    if (message) message.style.display = 'block';
    form.reset();
  });
})();
