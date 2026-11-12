(function () {
  'use strict';

  var KEY = 'demo-cart-quantity';

  function read() {
    try { return Number(window.localStorage.getItem(KEY)) || 0; } catch (error) { return 0; }
  }

  function write(value) {
    try { window.localStorage.setItem(KEY, String(value)); } catch (error) { /* a page without storage keeps no cart */ }
  }

  function render() {
    var count = read();
    document.querySelectorAll('.sqs-cart-quantity').forEach(function (node) { node.textContent = String(count); });
    document.querySelectorAll('.cart-style-icon').forEach(function (node) {
      node.classList.toggle('cart-quantity-zero', count === 0);
      node.setAttribute('aria-label', count + ' items in cart');
    });
  }

  document.querySelectorAll('.sqs-add-to-cart-button').forEach(function (button) {
    button.addEventListener('click', function () {
      var field = document.querySelector('.product-quantity-input input');
      var quantity = field ? Math.max(1, parseInt(field.value, 10) || 1) : 1;
      write(read() + quantity);
      button.classList.add('added');
      render();
    });
  });

  document.querySelectorAll('.product-quantity-input button').forEach(function (button) {
    button.addEventListener('click', function () {
      var field = button.parentNode.querySelector('input');
      var step = button.classList.contains('increase-button') ? 1 : -1;
      field.value = String(Math.max(1, (parseInt(field.value, 10) || 1) + step));
    });
  });

  render();
})();
