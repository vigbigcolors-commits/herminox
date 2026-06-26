/* Herminox — shared "Back to top" button (injected on every page) */
(function () {
  if (window.__herminoxBackToTop) return;
  window.__herminoxBackToTop = true;

  var css = [
    '.back-to-top{',
    '  position:fixed;bottom:24px;right:24px;z-index:46;',
    '  width:48px;height:48px;border-radius:50%;cursor:pointer;',
    '  display:flex;align-items:center;justify-content:center;',
    '  border:1px solid var(--line2,#B5A98E);',
    '  background:rgba(245,240,232,.92);backdrop-filter:blur(6px);',
    '  color:var(--ink,#1B2138);',
    '  box-shadow:0 6px 18px -8px rgba(27,33,56,.5);',
    '  opacity:0;visibility:hidden;transform:translateY(12px);',
    '  transition:opacity .2s ease,transform .2s ease,background .15s,color .15s,border-color .15s;',
    '}',
    '.back-to-top.is-visible{opacity:1;visibility:visible;transform:translateY(0)}',
    '.back-to-top:hover{background:var(--accent,#C97B1A);color:#fff;border-color:var(--accent,#C97B1A)}',
    '.back-to-top:active{transform:scale(.94)}',
    '.back-to-top:focus-visible{outline:2px solid var(--accent,#C97B1A);outline-offset:3px}',
    '.back-to-top svg{display:block}',
    '@media(max-width:900px){.back-to-top{bottom:16px;right:16px;width:42px;height:42px}}',
    '@media(prefers-reduced-motion:reduce){.back-to-top{transition:opacity .2s ease}.back-to-top.is-visible{transform:none}}'
  ].join('');

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
    '<path d="M12 19V6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
    '<path d="M6 11l6-6 6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function ready(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.body.appendChild(btn);

    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    var ticking = false;

    function update() {
      ticking = false;
      if (window.pageYOffset > 400) btn.classList.add('is-visible');
      else btn.classList.remove('is-visible');
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    });

    update();
  });
})();
