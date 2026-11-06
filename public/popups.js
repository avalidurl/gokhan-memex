/* gokhanturhan.com link popups (warm editorial card). Hover a link on desktop ->
   an annotation card near it (kicker / title / blurb / open-link). Curated cards for the
   nav targets; a lightweight fallback for any external link. Keyed by href + pathname so it
   works everywhere. CSP-clean (no framing, no fetch). Loaded site-wide via <script src="/popups.js">. */
(function () {
  if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;

  var CSS = '.lp{position:absolute;z-index:9999;max-width:340px;width:max-content;border:1px solid var(--line,#ecdcd8);border-radius:16px;background:var(--card-bg,#ffffff);color:var(--ink,#2a1a1e);padding:.8rem 1rem;box-shadow:0 14px 36px rgba(42,26,30,.12);font-family:var(--font-sans,-apple-system,BlinkMacSystemFont,"Helvetica Neue",Inter,Arial,sans-serif);opacity:0;transform:translateY(4px);transition:opacity .14s,transform .14s;pointer-events:none}.lp.show{opacity:1;transform:translateY(0);pointer-events:auto}.lp .lp-k{font-family:var(--font-sans,-apple-system,BlinkMacSystemFont,Arial,sans-serif);font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--acc,#c94f62)}.lp .lp-t{font-family:var(--font-serif,Georgia,serif);font-weight:700;font-size:15.5px;line-height:1.25;margin:.18rem 0 .32rem;color:var(--ink,#2a1a1e)}.lp .lp-d{font-size:13px;line-height:1.5;color:var(--mut,#7a6268)}.lp a.lp-o{display:inline-block;margin-top:.5rem;font-family:var(--font-sans,-apple-system,BlinkMacSystemFont,Arial,sans-serif);font-size:12px;font-weight:600;color:var(--acc,#c94f62);border:0;text-decoration:underline;text-underline-offset:3px}@media (prefers-reduced-motion:reduce){.lp{transition:none}}';
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  var ANN = {
    "https://gokhan.vc": { k: "gokhan.vc · studio", t: "Gökhan Ventures", d: "The venture studio. AGI plus human conviviality, in the long now." },
    "https://ishtar.numetal.xyz": { k: "ishtar.numetal.xyz · live", t: "Ishtar — Agentic Dating", d: "A dating venue where the agents do the approaching. Adults only, text only. Live now." },
    "https://numetal.xyz": { k: "numetal.xyz · studio", t: "Numetal Labs", d: "The agent-accelerator studio. We ship machines that ship themselves." }
  };

  var PATHANN = {
    "/journal": { k: "gokhanturhan.com", t: "Journal", d: "Essays, notes, and dispatches by Gökhan Turhan." },
    "/cv": { k: "gokhanturhan.com", t: "CV", d: "Work, writing, and background — the long version." }
  };

  var pop = null, showT = null, hideT = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "link"; } }

  function annFor(a) {
    var raw = a.getAttribute("href") || "";
    if (!raw || raw.indexOf("mailto:") === 0 || raw.indexOf("javascript:") === 0 || raw.charAt(0) === "#") return null;
    var u; try { u = new URL(a.href); } catch (e) { return null; }
    var hrefKey = a.href.replace(/\/+$/, "");
    if (ANN[hrefKey]) return ANN[hrefKey];
    var p = u.pathname.replace(/\/+$/, "") || "/";
    if (PATHANN[p]) return PATHANN[p];
    if (u.host !== location.host) {
      return { k: host(a.href), t: (a.textContent || "").trim().slice(0, 64) || host(a.href), d: "" };
    }
    return null;
  }

  function ensure() {
    if (pop) return pop;
    pop = document.createElement("div"); pop.className = "lp";
    pop.addEventListener("mouseenter", function () { clearTimeout(hideT); });
    pop.addEventListener("mouseleave", hideSoon);
    document.body.appendChild(pop); return pop;
  }
  function fill(a) {
    var m = annFor(a); if (!m) return false;
    var p = ensure();
    var d = m.d ? '<div class="lp-d">' + esc(m.d) + '</div>' : '';
    p.innerHTML = '<div class="lp-k">' + esc(m.k) + '</div><div class="lp-t">' + esc(m.t) + '</div>' + d
      + '<a class="lp-o" href="' + esc(a.href) + '" ' + (a.target ? 'target="' + esc(a.target) + '" rel="noopener"' : '') + '>open ' + esc(host(a.href)) + ' ↗</a>';
    return true;
  }
  function place(a) {
    var r = a.getBoundingClientRect(), pw = pop.offsetWidth, ph = pop.offsetHeight, m = 10;
    var x = window.scrollX + r.left;
    var maxx = window.scrollX + document.documentElement.clientWidth - pw - m;
    if (x > maxx) x = maxx; if (x < window.scrollX + m) x = window.scrollX + m;
    var below = r.bottom + 8 + ph <= window.innerHeight;
    var y = below ? (window.scrollY + r.bottom + 8) : (window.scrollY + r.top - ph - 8);
    pop.style.left = x + "px"; pop.style.top = y + "px";
  }
  function show(a) { if (!fill(a)) return; place(a); pop.classList.add("show"); }
  function showSoon(a) { clearTimeout(hideT); clearTimeout(showT); showT = setTimeout(function () { show(a); }, 160); }
  function hideSoon() { clearTimeout(showT); hideT = setTimeout(function () { if (pop) pop.classList.remove("show"); }, 220); }

  function bind() {
    document.querySelectorAll("a[href]").forEach(function (a) {
      if (a.getAttribute("data-lp") === "1") return;
      if (!annFor(a)) return;
      a.setAttribute("data-lp", "1");
      a.addEventListener("mouseenter", function () { showSoon(a); });
      a.addEventListener("mouseleave", hideSoon);
      a.addEventListener("focus", function () { showSoon(a); });
      a.addEventListener("blur", hideSoon);
    });
  }
  function boot() { bind(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  document.addEventListener("astro:page-load", boot);
})();
