(function () {
  'use strict';

  var toggle = document.querySelector('.Header-toggle');
  var nav = document.querySelector('.Header-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    var isOpen = nav.classList.toggle('Header-nav--open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    nav.style.display = isOpen ? 'flex' : '';
  });
})();
