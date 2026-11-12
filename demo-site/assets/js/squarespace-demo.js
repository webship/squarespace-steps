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

// The announcement bar and the cookie banner, drawn from the site settings as
// Squarespace's scripts do. Both are off until a test switches them on.
(function () {
  'use strict';

  var context = window.Static.SQUARESPACE_CONTEXT;

  function element(html) {
    var holder = document.createElement('div');
    holder.innerHTML = html.trim();
    return holder.firstChild;
  }

  if (context.showAnnouncementBar) {
    var bar = (context.websiteSettings || {}).announcementBarSettings || {};
    var link = bar.clickthroughUrl && bar.clickthroughUrl.url
      ? '<a class="sqs-announcement-bar-url" href="' + bar.clickthroughUrl.url + '" aria-labelledby="announcement-bar-text-inner-id"></a>'
      : '';
    var announcement = element('<div class="sqs-announcement-bar-custom-location"><div class="sqs-widget sqs-announcement-bar"><div class="sqs-announcement-bar-content">' + link +
      '<div class="sqs-announcement-bar-text"><span class="sqs-announcement-bar-close" tabindex="0" role="button" aria-label="Close Announcement"></span>' +
      '<div id="announcement-bar-text-inner-id" class="sqs-announcement-bar-text-inner">' + (bar.text || '') + '</div></div></div></div></div>');
    document.querySelector('.sqs-announcement-bar-dropzone').appendChild(announcement);
    announcement.querySelector('.sqs-announcement-bar-close').addEventListener('click', function () {
      announcement.querySelector('.sqs-announcement-bar').classList.add('sqs-announcement-bar-hidden');
    });
  }

  var cookies = context.cookieSettings || {};
  var chosen = false;
  try { chosen = Boolean(window.localStorage.getItem('demo-cookie-choice')); } catch (error) { chosen = false; }
  if (cookies.isCookieBannerEnabled && !chosen) {
    var banner = element('<div class="cookie-banner-mount-point"><section aria-label="Cookie banner" class="gdpr-cookie-banner BOTTOM bar full-styling">' +
      '<p class="disclaimer-text sqs-cookie-banner-v2-text"></p>' +
      '<div class="button-group sqs-cookie-banner-v2-cta-container">' +
      (cookies.cookieBannerHasOptOut ? '<button class="decline sqs-button-element--secondary sqs-cookie-banner-v2-deny sqs-cookie-banner-v2-cta"><span></span></button>' : '') +
      '<button class="accept sqs-button-element--primary sqs-cookie-banner-v2-accept sqs-cookie-banner-v2-cta"><span></span></button>' +
      '</div></section></div>');
    banner.querySelector('.sqs-cookie-banner-v2-text').textContent = cookies.cookieBannerText;
    banner.querySelector('.accept span').textContent = cookies.cookieBannerCtaText;
    var decline = banner.querySelector('.decline span');
    if (decline) decline.textContent = cookies.cookieBannerOptOutCtaText;
    var choose = function (allowed) {
      try { window.localStorage.setItem('demo-cookie-choice', allowed ? 'accepted' : 'declined'); } catch (error) { /* no storage */ }
      document.cookie = 'ss_performanceCookiesAllowed=' + allowed + '; path=/';
      banner.remove();
    };
    banner.querySelector('.accept').addEventListener('click', function () { choose(true); });
    if (decline) banner.querySelector('.decline').addEventListener('click', function () { choose(false); });
    document.body.appendChild(banner);
  }
})();
