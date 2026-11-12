(function () {
  'use strict';

  var body = document.body;
  var burgers = document.querySelectorAll('.header-burger-btn');
  var folderPanels = document.querySelectorAll('.header-menu-nav-folder[data-folder]:not([data-folder="root"])');

  function setMenu(open) {
    body.classList.toggle('header--menu-open', open);
    burgers.forEach(function (button) { button.classList.toggle('burger--active', open); });
    if (!open) folderPanels.forEach(function (panel) { panel.classList.remove('is-active'); });
  }

  burgers.forEach(function (button) {
    button.addEventListener('click', function () { setMenu(!body.classList.contains('header--menu-open')); });
  });

  document.querySelectorAll('.header-nav-folder-title').forEach(function (button) {
    button.addEventListener('click', function () {
      button.closest('.header-nav-item--folder').classList.toggle('is-open');
    });
  });

  document.querySelectorAll('.header-menu-nav-item a[data-folder-id]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      folderPanels.forEach(function (panel) {
        panel.classList.toggle('is-active', panel.getAttribute('data-folder') === link.getAttribute('data-folder-id'));
      });
    });
  });

  document.querySelectorAll('.header-menu-controls-control').forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();
      folderPanels.forEach(function (panel) { panel.classList.remove('is-active'); });
    });
  });
})();
