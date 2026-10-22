/* Consentement cookies + chargement conditionnel de Google Analytics (RGPD / CNIL).
   Aucun cookie de mesure n'est déposé avant l'accord explicite du visiteur. */
(function () {
  var GA_ID = 'G-J4KS3E8BMY';
  var KEY = 'cookie-consent-v1';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  function loadAnalytics() {
    if (document.getElementById('ga-loader')) return;
    var s = document.createElement('script');
    s.id = 'ga-loader';
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true, cookie_flags: 'SameSite=Lax;Secure' });
  }

  function removeBanner() {
    var b = document.getElementById('cookie-banner');
    if (b) b.remove();
  }

  function showBanner() {
    if (document.getElementById('cookie-banner')) return;
    var css = document.createElement('style');
    css.textContent =
      '#cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;max-width:560px;margin:0 auto;z-index:99999;' +
      'background:#fff;color:#19313b;border:1px solid #e5edef;border-radius:16px;padding:18px 20px;' +
      'box-shadow:0 12px 40px rgba(8,69,97,.22);font:15px/1.5 "DM Sans",system-ui,sans-serif}' +
      '#cookie-banner p{margin:0 0 12px}#cookie-banner a{color:#0d5d7f;text-decoration:underline}' +
      '#cookie-banner .cb-actions{display:flex;gap:10px;flex-wrap:wrap}' +
      '#cookie-banner button{flex:1 1 140px;min-height:44px;border-radius:999px;border:2px solid #0d5d7f;' +
      'font:600 15px "DM Sans",system-ui,sans-serif;cursor:pointer;background:#fff;color:#0d5d7f}' +
      '#cookie-banner button.cb-accept{background:#0d5d7f;color:#fff}' +
      '#cookie-banner button:focus-visible{outline:3px solid #00a896;outline-offset:2px}';
    document.head.appendChild(css);

    var div = document.createElement('div');
    div.id = 'cookie-banner';
    div.setAttribute('role', 'dialog');
    div.setAttribute('aria-label', 'Gestion des cookies');
    div.innerHTML =
      '<p>Ce site utilise Google Analytics pour mesurer sa fréquentation, uniquement avec votre accord. ' +
      'Aucune donnée de santé n\'est collectée. <a href="/mentions-legales.html#cookies">En savoir plus</a></p>' +
      '<div class="cb-actions">' +
      '<button type="button" class="cb-refuse">Refuser</button>' +
      '<button type="button" class="cb-accept">Accepter</button></div>';
    document.body.appendChild(div);

    div.querySelector('.cb-accept').addEventListener('click', function () {
      write('granted'); removeBanner(); loadAnalytics();
    });
    div.querySelector('.cb-refuse').addEventListener('click', function () {
      write('denied'); removeBanner();
    });
  }

  function init() {
    var c = read();
    if (c === 'granted') loadAnalytics();
    else if (c !== 'denied') showBanner();

    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-cookie-settings]');
      if (!t) return;
      e.preventDefault();
      try { localStorage.removeItem(KEY); } catch (err) {}
      showBanner();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
