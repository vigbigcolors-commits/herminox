/* ============================================================
   Herminox.com — Shared site navigation (inject via data-site-nav)
   Keeps one source of truth for the main header across pages.
   Optional company strip: data-company-nav="about|our-goal|terms|privacy"
   ============================================================ */
(function () {
  'use strict';

  var MAIN_NAV = ''
    + '<header class="nav">'
    + '  <a href="/" class="logo" aria-label="Herminox home">'
    + '    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="6" stroke="currentColor" stroke-width="1.6"/><line x1="10" y1="23" x2="10" y2="11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="22" y1="23" x2="22" y2="8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><line x1="10" y1="16.5" x2="22" y2="13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="22" cy="8" r="2" fill="#E8991F"/></svg>'
    + '    <span class="logo-text">Hermi<span class="logo-accent">nox</span></span>'
    + '  </a>'
    + '  <nav class="nav-links" aria-label="Main">'
    + '    <div class="nav-group">'
    + '      <a href="/sellers/" class="nav-group-trigger">Sellers<svg class="nav-caret" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
    + '      <div class="nav-dropdown">'
    + '        <a href="/sellers/fba-calculator/" class="nav-drop-item"><span class="ndi-icon ndi-green" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="2.5" stroke="white" stroke-width="1.8"/><path d="M3 12h18" stroke="white" stroke-width="1.5"/><line x1="9" y1="3" x2="9" y2="21" stroke="white" stroke-width="1" stroke-opacity="0.4"/><line x1="16" y1="3" x2="16" y2="21" stroke="white" stroke-width="1" stroke-opacity="0.4"/><circle cx="6" cy="7.5" r="2" fill="rgba(255,255,255,0.35)"/><circle cx="12.5" cy="7.5" r="2" fill="white"/><circle cx="19.5" cy="7.5" r="2" fill="white"/><circle cx="6" cy="16.5" r="2" fill="white"/><circle cx="12.5" cy="16.5" r="2" fill="white"/><circle cx="19.5" cy="16.5" r="2" fill="rgba(255,255,255,0.35)"/></svg></span><span class="ndi-text"><strong>FBA Profit Calculator</strong><span>Fees, margin &amp; ROI per unit</span></span></a>'
    + '        <a href="/sellers/inventory-breakeven/" class="nav-drop-item"><span class="ndi-icon ndi-amber" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="1.5" y="14" width="8" height="7.5" rx="1.5" stroke="white" stroke-width="1.6"/><rect x="9.5" y="9" width="8" height="12.5" rx="1.5" stroke="white" stroke-width="1.6"/><path d="M1.5 17.5h8M5.5 14v7.5M9.5 14h8M13.5 9v12.5" stroke="white" stroke-width="1" stroke-opacity="0.45"/><path d="M1 12h22" stroke="white" stroke-width="1.5" stroke-dasharray="3 2" stroke-linecap="round"/><circle cx="9.5" cy="12" r="2" fill="white"/></svg></span><span class="ndi-text"><strong>Inventory Breakeven</strong><span>Units to recover your order</span></span></a>'
    + '        <a href="/sellers/acos-breakeven/" class="nav-drop-item"><span class="ndi-icon ndi-royal" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" stroke-width="1.8"/><circle cx="12" cy="12" r="5.5" stroke="white" stroke-width="1" stroke-opacity="0.4"/><path d="M12 3v2.5M12 18.5v2.5M3 12h2.5M18.5 12h2.5" stroke="white" stroke-width="1.5" stroke-linecap="round"/><path d="M12 12l-2-5.5 2-.6 2 .6z" fill="white"/><path d="M12 12l2 5.5-2 .6-2-.6z" fill="rgba(255,255,255,0.4)"/><circle cx="12" cy="12" r="1.8" fill="white"/></svg></span><span class="ndi-text"><strong>ACoS Breakeven</strong><span>Max ad-spend ceiling</span></span></a>'
    + '        <div class="nav-drop-footer"><a href="/sellers/">All seller tools →</a></div>'
    + '      </div>'
    + '    </div>'
    + '    <div class="nav-group">'
    + '      <a href="/buyers/" class="nav-group-trigger">Buyers<svg class="nav-caret" width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>'
    + '      <div class="nav-dropdown">'
    + '        <a href="/buyers/cost-per-use/" class="nav-drop-item"><span class="ndi-icon ndi-crimson" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 2h10M7 22h10" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M8 2.5L12 10l4-7.5" stroke="white" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 21.5L12 14l4 7.5" stroke="white" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 10v4" stroke="white" stroke-width="1.5" stroke-linecap="round"/><ellipse cx="12" cy="18.5" rx="2.8" ry="1.4" fill="rgba(255,255,255,0.5)"/></svg></span><span class="ndi-text"><strong>Cost Per Use Calculator</strong><span>True lifetime cost of any item</span></span></a>'
    + '        <a href="/buyers/unit-price/" class="nav-drop-item"><span class="ndi-icon ndi-teal" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v18M4 21h16" stroke="white" stroke-width="1.8" stroke-linecap="round"/><path d="M12 5.5L5 11M12 5.5l7 4" stroke="white" stroke-width="1.6" stroke-linecap="round"/><path d="M2 17.5a3 3 0 006 0H2z" stroke="white" stroke-width="1.5"/><line x1="5" y1="11" x2="5" y2="17.5" stroke="white" stroke-width="1.4"/><path d="M16 15.5a3 3 0 006 0H16z" stroke="white" stroke-width="1.5"/><line x1="19" y1="9.5" x2="19" y2="15.5" stroke="white" stroke-width="1.4"/></svg></span><span class="ndi-text"><strong>Unit Price Comparator</strong><span>Price per oz, unit or count</span></span></a>'
    + '        <a href="/buyers/return-tracker/" class="nav-drop-item"><span class="ndi-icon ndi-violet" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="14" r="8" stroke="white" stroke-width="1.8"/><rect x="10.5" y="4" width="3" height="2" rx=".5" stroke="white" stroke-width="1.5"/><path d="M12 6v2.5" stroke="white" stroke-width="1.4" stroke-linecap="round"/><path d="M12 14V10M12 14l3.5 2" stroke="white" stroke-width="1.7" stroke-linecap="round"/><path d="M12 7.5v1.5M12 19.5v1M5 14h1M18 14h1" stroke="white" stroke-width="1.4" stroke-linecap="round"/><circle cx="12" cy="14" r="1.5" fill="white"/></svg></span><span class="ndi-text"><strong>Return &amp; Capital Dashboard</strong><span>Track deadlines &amp; locked capital</span></span></a>'
    + '        <div class="nav-drop-footer"><a href="/buyers/">All buyer tools →</a></div>'
    + '      </div>'
    + '    </div>'
    + '    <a href="/guides/">Guides</a>'
    + '    <a href="/embed/">Embed</a>'
    + '    <a href="/about/">About</a>'
    + '    <span class="nav-badge">6 free tools</span>'
    + '  </nav>'
    + '</header>';

  var COMPANY_LINKS = [
    { href: '/guides/', label: 'Guides', key: 'guides' },
    { href: '/about/', label: 'About Us', key: 'about' },
    { href: '/our-goal/', label: 'Our Goal', key: 'our-goal' },
    { href: '/terms/', label: 'Terms', key: 'terms' },
    { href: '/privacy/', label: 'Privacy', key: 'privacy' }
  ];

  function companyNav(active) {
    var html = '<nav class="company-nav" aria-label="Company">';
    COMPANY_LINKS.forEach(function (link, i) {
      if (i > 0) html += '<span class="cn-sep" aria-hidden="true"></span>';
      var cls = link.key === active ? ' class="is-active" aria-current="page"' : '';
      html += '<a href="' + link.href + '"' + cls + '>' + link.label + '</a>';
    });
    html += '</nav>';
    return html;
  }

  document.querySelectorAll('[data-site-nav]').forEach(function (el) {
    var active = el.getAttribute('data-company-nav') || '';
    el.innerHTML = MAIN_NAV + (active ? companyNav(active) : '');
  });
})();
