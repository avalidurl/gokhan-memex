/* Collapsible headings for blog/newsletter articles —
   click a heading (or its chevron mark) to fold everything under it down to
   the next same-or-higher heading. */
(function () {
  var SEL = ['.dispatch-prose', '.post-body', '.article', '.art', '.prose'];
  var root = null;
  for (var i = 0; i < SEL.length; i++) { root = document.querySelector(SEL[i]); if (root) break; }
  if (!root) return;
  var heads = [].slice.call(root.querySelectorAll('h2, h3'));
  if (!heads.length) return;

  var css =
    '.hcoll{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;' +
    'width:1.25em;height:1.25em;margin-right:.32em;vertical-align:baseline;color:var(--acc,#c94f62);font-size:.66em;' +
    'line-height:1;position:relative;opacity:.65;transition:opacity .12s}' +
    'h1:hover>.hcoll,h2:hover>.hcoll,h3:hover>.hcoll,.hcoll:hover,.hcoll:focus-visible{opacity:1}' +
    '.hcoll::after{content:attr(data-tip);position:absolute;left:0;top:135%;white-space:nowrap;' +
    'background:var(--ink,#2a1a1e);color:var(--bg,#fbf6f3);font:600 10.5px/1.4 var(--font-sans,-apple-system,BlinkMacSystemFont,Arial,sans-serif);letter-spacing:.02em;' +
    'padding:3px 9px;border-radius:999px;opacity:0;pointer-events:none;transition:opacity .1s;z-index:9999}' +
    '.hcoll:hover::after,.hcoll:focus-visible::after{opacity:1}' +
    '.hcoll-h{cursor:pointer}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var lvl = function (h) { return +h.tagName.charAt(1); };

  heads.forEach(function (h) {
    var l = lvl(h);
    var body = [];
    var n = h.nextElementSibling;
    while (n) {
      if (/^H[1-6]$/.test(n.tagName) && (+n.tagName.charAt(1)) <= l) break;
      body.push(n);
      n = n.nextElementSibling;
    }
    if (!body.length) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hcoll';
    btn.textContent = '▾';
    btn.setAttribute('aria-label', 'Toggle this section');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('data-tip', 'Collapse this heading');
    h.insertBefore(btn, h.firstChild);
    h.classList.add('hcoll-h');

    var collapsed = false;
    function toggle(e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      collapsed = !collapsed;
      for (var i = 0; i < body.length; i++) { body[i].style.display = collapsed ? 'none' : ''; }
      btn.textContent = collapsed ? '▸' : '▾';
      btn.setAttribute('aria-expanded', String(!collapsed));
      btn.setAttribute('data-tip', collapsed ? 'Expand this heading' : 'Collapse this heading');
    }
    btn.addEventListener('click', toggle);
    h.addEventListener('click', function (e) {
      if (e.target === btn || btn.contains(e.target)) return;
      if (e.target.closest && e.target.closest('a')) return;
      toggle(e);
    });
  });
})();
