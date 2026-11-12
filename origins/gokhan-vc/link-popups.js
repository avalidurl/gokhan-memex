/* Link-tree hover popups (Gwern-style, bureau palette). Reads data-tip on .leaf-link
   anchors inside .kanban-board. Desktop hover/focus only; no-op on touch. CSP-clean. */
(function () {
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

  var CSS =
    '.lp{position:absolute;z-index:9999;max-width:300px;width:max-content;border:2px solid var(--ink,#141414);' +
    'background:var(--paper,#fff);color:var(--ink,#141414);box-shadow:4px 4px 0 var(--ink,#141414);' +
    'padding:.65rem .8rem;font-family:var(--font-sans,system-ui,sans-serif);opacity:0;transform:translateY(4px);' +
    'transition:opacity .12s,transform .12s;pointer-events:none}' +
    '.lp.show{opacity:1;transform:translateY(0);pointer-events:auto}' +
    '.lp .lp-t{font-weight:700;font-size:13px;line-height:1.3;margin:0 0 .25rem}' +
    '.lp .lp-d{font-family:var(--font-mono,ui-monospace,monospace);font-size:11px;line-height:1.45;color:var(--muted,#7c7c7c)}' +
    '@media (prefers-reduced-motion:reduce){.lp{transition:none}}';
  var st = document.createElement('style');
  st.textContent = CSS;
  document.head.appendChild(st);

  var pop = null;
  var showT = null;
  var hideT = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function ensure() {
    if (pop) return pop;
    pop = document.createElement('div');
    pop.className = 'lp';
    pop.setAttribute('role', 'tooltip');
    pop.addEventListener('mouseenter', function () {
      clearTimeout(hideT);
    });
    pop.addEventListener('mouseleave', hideSoon);
    document.body.appendChild(pop);
    return pop;
  }

  function fill(a) {
    var tip = a.getAttribute('data-tip');
    if (!tip) return false;
    var platform = '';
    var platEl = a.querySelector('.leaf-platform');
    if (platEl) platform = platEl.textContent || '';
    var p = ensure();
    var title = platform ? '<div class="lp-t">' + esc(platform.trim()) + '</div>' : '';
    p.innerHTML = title + '<div class="lp-d">' + esc(tip) + '</div>';
    return true;
  }

  function place(a) {
    var r = a.getBoundingClientRect();
    var pw = pop.offsetWidth;
    var ph = pop.offsetHeight;
    var m = 10;
    var x = window.scrollX + r.left;
    var maxx = window.scrollX + document.documentElement.clientWidth - pw - m;
    if (x > maxx) x = maxx;
    if (x < window.scrollX + m) x = window.scrollX + m;
    var below = r.bottom + 8 + ph <= window.innerHeight;
    var y = below ? window.scrollY + r.bottom + 8 : window.scrollY + r.top - ph - 8;
    pop.style.left = x + 'px';
    pop.style.top = y + 'px';
  }

  function show(a) {
    if (!fill(a)) return;
    place(a);
    pop.classList.add('show');
  }

  function showSoon(a) {
    clearTimeout(hideT);
    clearTimeout(showT);
    showT = setTimeout(function () {
      show(a);
    }, 140);
  }

  function hideSoon() {
    clearTimeout(showT);
    hideT = setTimeout(function () {
      if (pop) pop.classList.remove('show');
    }, 200);
  }

  function bind() {
    document.querySelectorAll('.kanban-board .leaf-link[data-tip]').forEach(function (a) {
      if (a.getAttribute('data-lp') === '1') return;
      a.setAttribute('data-lp', '1');
      a.addEventListener('mouseenter', function () {
        showSoon(a);
      });
      a.addEventListener('mouseleave', hideSoon);
      a.addEventListener('focus', function () {
        showSoon(a);
      });
      a.addEventListener('blur', hideSoon);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
