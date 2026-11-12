(function () {
  'use strict';

  var PAGES = [
    { title: 'Home', url: '/', text: 'Handmade goods, honestly sourced. A small studio making things that last.' },
    { title: 'Our story', url: '/about.html', text: 'Demo Studio started in a garage with one sewing machine.' },
    { title: 'Shop', url: '/shop.html', text: 'Ceramic Mug, Linen Tote Bag and Oak Cutting Board.' },
    { title: 'Linen Tote Bag', url: '/shop/p/linen-tote-bag.html', text: 'A tote bag made of linen.' },
    { title: 'Why we use linen instead of canvas', url: '/blog/why-we-use-linen.html', text: 'It is heavier to sew, but it ages better.' },
    { title: 'Seasoning a cutting board the right way', url: '/blog/seasoning-a-cutting-board.html', text: 'Oil, patience, and a soft cloth.' },
    { title: 'Contact', url: '/contact.html', text: 'Send us a message.' }
  ];

  var form = document.querySelector('.sqs-search-page-input form');
  var input = form.querySelector('input');
  var list = document.querySelector('.search-results');
  var notice = document.querySelector('.sqs-search-page-notice');

  function search(words) {
    var terms = words.toLowerCase().split(/\s+/).filter(Boolean);
    list.innerHTML = '';
    notice.className = 'sqs-search-page-notice hide';
    notice.textContent = '';
    if (!terms.length) return;
    var found = PAGES.filter(function (page) {
      var haystack = (page.title + ' ' + page.text).toLowerCase();
      return terms.every(function (term) { return haystack.indexOf(term) !== -1; });
    });
    if (!found.length) {
      notice.className = 'sqs-search-page-notice';
      notice.textContent = 'Your search did not match any results. Try a different search.';
      return;
    }
    found.forEach(function (page) {
      var result = document.createElement('div');
      result.className = 'search-result';
      result.setAttribute('role', 'link');
      result.setAttribute('tabindex', '0');
      result.innerHTML = '<div class="sqs-search-container-item sqs-search-page-item"><div class="sqs-content"><div class="sqs-title"></div><div class="sqs-content"></div></div></div>';
      result.querySelector('.sqs-title').textContent = page.title;
      result.querySelector('.sqs-content .sqs-content').textContent = page.text;
      result.addEventListener('click', function () { window.location.href = page.url; });
      list.appendChild(result);
    });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    window.history.replaceState({}, '', '?q=' + encodeURIComponent(input.value));
    search(input.value);
  });

  var query = new URLSearchParams(window.location.search).get('q');
  if (query) {
    input.value = query;
    search(query);
  }
})();
