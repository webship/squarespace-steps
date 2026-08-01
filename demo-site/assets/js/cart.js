(function () {
  'use strict';

  var cart = [];
  var countEl = document.querySelector('.Cart-count');
  var itemsEl = document.querySelector('.Cart-items');
  var emptyEl = document.querySelector('.Cart-empty');

  function render() {
    if (countEl) countEl.textContent = String(cart.length);
    if (!itemsEl || !emptyEl) return;
    itemsEl.innerHTML = '';
    if (cart.length === 0) {
      emptyEl.style.display = '';
      return;
    }
    emptyEl.style.display = 'none';
    cart.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'Cart-item';
      li.textContent = item.title + ' — $' + item.price;
      itemsEl.appendChild(li);
    });
  }

  document.querySelectorAll('.sqs-add-to-cart-button').forEach(function (button) {
    button.addEventListener('click', function () {
      cart.push({
        id: button.getAttribute('data-product-id'),
        title: button.getAttribute('data-product-title'),
        price: button.getAttribute('data-product-price'),
      });
      render();
    });
  });

  render();
})();
