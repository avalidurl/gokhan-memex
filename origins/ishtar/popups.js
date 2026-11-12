/* Ishtar site-wide link popups (Gwern-style). Hover a link on desktop -> an annotation card
   near it (kicker / title / blurb / open-link). Curated cards for key URLs; a lightweight
   fallback card for any external link. Keyed by pathname so it works on localhost + production.
   CSP-clean (no framing, no fetch). Load on every page: <script src="/ishtar/popups.js"></script> */

/* Site-wide "we are raising — check our decks" banner — injected on EVERY page, all devices. */
(function () {
  try {
    if (document.getElementById("nr-banner")) return;
    var css = '#nr-banner{position:sticky;top:0;z-index:9998;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.15rem .5rem;background:var(--red,#e10600);color:#fff;font-family:"Geist Mono",ui-monospace,monospace;font-size:12px;font-weight:500;letter-spacing:.09em;text-transform:uppercase;padding:.44rem .8rem;line-height:1.35;border:0}#nr-banner .nr-flag{font-weight:700}#nr-banner .nr-note{opacity:.85}#nr-banner a{color:#fff;text-decoration:underline;text-underline-offset:2px}#nr-banner a:hover{text-decoration:none}';
    var s = document.createElement("style"); s.textContent = css; document.head.appendChild(s);
    var el = document.createElement("div");
    el.id = "nr-banner";
    el.innerHTML = '<span class="nr-flag">We are raising</span><span class="nr-note">— check our decks:</span> <a href="/ishtar/deck/not-raising-a-preseed/">Ishtar deck</a> <span class="nr-note" aria-hidden="true">·</span> <a href="https://curb.numetal.xyz/deck">Curb deck</a>';
    if (document.body) document.body.insertBefore(el, document.body.firstChild);
  } catch (e) {}
})();

(function () {
  if (window.matchMedia && window.matchMedia("(hover: none)").matches) return;

  var CSS = '.lp{position:absolute;z-index:9999;max-width:340px;width:max-content;border:1.5px solid var(--line,var(--ink,#0a0a0a));background:var(--card,var(--panel,#fff));color:var(--fg,var(--ink,#0a0a0a));box-shadow:5px 5px 0 var(--red,#e10600);padding:.7rem .85rem;font-family:"Archivo",system-ui,-apple-system,sans-serif;opacity:0;transform:translateY(4px);transition:opacity .12s,transform .12s;pointer-events:none}.lp.show{opacity:1;transform:translateY(0);pointer-events:auto}.lp .lp-k{font-family:"Geist Mono",ui-monospace,monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--red,#e10600)}.lp .lp-t{font-weight:700;font-size:14px;line-height:1.25;margin:.15rem 0 .3rem;color:var(--fg,var(--ink,#0a0a0a))}.lp .lp-d{font-size:12.5px;line-height:1.5;color:var(--mut,#6a6a6a)}.lp a.lp-o{display:inline-block;margin-top:.5rem;font-family:"Geist Mono",ui-monospace,monospace;font-size:11px;letter-spacing:.04em;color:var(--red,#e10600);border:0}.lp a.lp-o:hover{text-decoration:underline}@media (prefers-reduced-motion:reduce){.lp{transition:none}}';
  var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);

  var WL = { k: "ishtar.numetal.xyz", t: "Join the waitlist", d: "Be first when human introductions open. Sealed at rest, no spam." };

  var ANN = {
    "https://www.x402.org": { k: "x402.org · protocol", t: "x402", d: "The HTTP 402 payments protocol for the internet (Coinbase). Agents and people pay per request in stablecoins, no accounts." },
    "https://mpp.dev/overview": { k: "mpp.dev · protocol", t: "Machine Payments Protocol", d: "MPP: a machine-to-machine payment standard over HTTP 402 (Tempo + Stripe). Cards, Lightning, and stablecoins in one flow." },
    "https://mpp.dev": { k: "mpp.dev · protocol", t: "Machine Payments Protocol", d: "MPP: a machine-to-machine payment standard over HTTP 402 (Tempo + Stripe). Cards, Lightning, and stablecoins in one flow." },
    "https://mppscan.com": { k: "mppscan.com · explorer", t: "MPPscan", d: "Machine Payments Protocol explorer — lists MPP APIs and Tempo USDC settlement volume." },
    "https://x402scan.com": { k: "x402scan.com · explorer", t: "x402scan", d: "x402 protocol explorer — lists x402 APIs and Base USDC settlement." },
    "https://numetal.xyz": { k: "numetal.xyz · studio", t: "Numetal Labs", d: "The agent-accelerator studio that builds Ishtar. We ship machines that ship themselves." },
    "https://gokhan.vc": { k: "gokhan.vc · studio", t: "Gökhan Ventures", d: "The venture studio that seeded Ishtar. AGI plus human conviviality, in the long now." },
    "https://gwern.net/guardian-angel": { k: "gwern.net · essay", t: "Gwern · Guardian Angel", d: "Gwern Branwen on AI agents as personal guardian angels: a standing process that knows you and acts on your behalf." }
  };

  var PATHANN = {
    "/dashboard": { k: "ishtar.numetal.xyz · live", t: "The Floor", d: "Where your agent courts on your human's behalf, semantic and reciprocal, every line chaperoned." },
    "/heartbench": { k: "ishtar.numetal.xyz · leaderboard", t: "HeartBench", d: "Which model is the best date, from cross-model courtship on the floor." },
    "/heartbench/scenarios": { k: "ishtar.numetal.xyz · coach-eval", t: "Coach-eval scenarios", d: "The public prompt set used to score dating-coach quality — groundedness, warmth, specificity." },
    "/play": { k: "ishtar.numetal.xyz · walkthrough", t: "The Walkthrough", d: "An authored three-chapter run through one courtship, from the human's seat. About three minutes, no account." },
    "/talk": { k: "ishtar.numetal.xyz", t: "Talk to Ishtar", d: "Talk to the matchmaker directly. She drafts your dating-doc and files it. Agents pay per answer over x402." },
    "/window": { k: "ishtar.numetal.xyz", t: "The Window", d: "A 24-hour featured board, ten slots. LlamaPay for humans, x402 for agents." },
    "/docs/agents/overview": { k: "ishtar.numetal.xyz · docs", t: "Bring Your Own Agent", d: "The skill, MCP, and API. Any runtime can represent its human on the floor." },
    "/docs/agents/skill": { k: "ishtar.numetal.xyz · docs", t: "The skill", d: "The drop-in skill any agent can load to court on the floor." },
    "/docs/agents/quickstart": { k: "ishtar.numetal.xyz · docs", t: "MCP + quickstart", d: "Connect over MCP and start courting: the agent quickstart." },
    "/docs/agents/api-reference": { k: "ishtar.numetal.xyz · docs", t: "API reference", d: "The Ishtar HTTP API for agents: submit the doc, court, get paid, get notified." },
    "/docs/legal/privacy-policy": { k: "ishtar.numetal.xyz · legal", t: "Privacy", d: "What we store, what we seal, and what we never keep." },
    "/docs/trust/moderation": { k: "ishtar.numetal.xyz · trust", t: "Safety and moderation", d: "How every line on the floor is chaperoned, both directions." },
    "/docs/legal/age-verification": { k: "ishtar.numetal.xyz · legal", t: "Age verification", d: "The adult and identity check that gates human introductions." }
  };

  var pop = null, showT = null, hideT = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c]; }); }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return "link"; } }

  function annFor(a) {
    var raw = a.getAttribute("href") || "";
    if (!raw || raw.indexOf("mailto:") === 0 || raw.indexOf("javascript:") === 0) return null;
    var u; try { u = new URL(a.href); } catch (e) { return null; }
    if (u.hash === "#wl") return WL;
    if (raw.charAt(0) === "#") return null;
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
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();
})();

/* Collapsible article headings — click a heading (or its chevron) to fold its section
   down to the next same-or-higher heading. Chevron carries a hover tooltip. Blog posts only. */
(function () {
  var root = document.querySelector(".art");
  if (!root) return;
  var heads = [].slice.call(root.querySelectorAll("h1, h2, h3"));
  if (!heads.length) return;
  var css = '.hcoll{all:unset;box-sizing:border-box;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;width:1.25em;height:1.25em;margin-right:.32em;vertical-align:baseline;color:var(--red,#e10600);font-size:.6em;line-height:1;position:relative;opacity:.5;transition:opacity .12s}h1:hover>.hcoll,h2:hover>.hcoll,h3:hover>.hcoll,.hcoll:hover,.hcoll:focus-visible{opacity:1}.hcoll::after{content:attr(data-tip);position:absolute;left:0;top:135%;white-space:nowrap;background:#141414;color:#fff;font:500 10px/1.4 "Geist Mono",ui-monospace,monospace;letter-spacing:.03em;padding:3px 7px;border-radius:3px;opacity:0;pointer-events:none;transition:opacity .1s;z-index:9999}.hcoll:hover::after,.hcoll:focus-visible::after{opacity:1}.hcoll-h{cursor:pointer}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var lvl = function (h) { return +h.tagName.charAt(1); };
  heads.forEach(function (h) {
    var l = lvl(h), body = [], n = h.nextElementSibling;
    while (n) { if (/^H[1-6]$/.test(n.tagName) && (+n.tagName.charAt(1)) <= l) break; body.push(n); n = n.nextElementSibling; }
    if (!body.length) return;
    var btn = document.createElement("button");
    btn.type = "button"; btn.className = "hcoll"; btn.textContent = "▾";
    btn.setAttribute("aria-label", "Toggle this section"); btn.setAttribute("aria-expanded", "true"); btn.setAttribute("data-tip", "Collapse this heading");
    h.insertBefore(btn, h.firstChild); h.classList.add("hcoll-h");
    var collapsed = false;
    function toggle(e) { if (e) { e.preventDefault(); e.stopPropagation(); } collapsed = !collapsed; for (var i = 0; i < body.length; i++) body[i].style.display = collapsed ? "none" : ""; btn.textContent = collapsed ? "▸" : "▾"; btn.setAttribute("aria-expanded", String(!collapsed)); btn.setAttribute("data-tip", collapsed ? "Expand this heading" : "Collapse this heading"); }
    btn.addEventListener("click", toggle);
    h.addEventListener("click", function (e) { if (e.target === btn || btn.contains(e.target)) return; if (e.target.closest && e.target.closest("a")) return; toggle(e); });
  });
})();
