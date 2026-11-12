/* ACCUMULATOR — front-end.
   1) builds the ILLUSTRATIVE "inference arbitrage engine" figure in the hero
      (a drawn model of the target loop — not a feed; see MODEL below),
   2) the yield-wishlist voting,
   3) the waitlist form.
   Talks only to the site's own Worker API (/api/*). Degrades gracefully when
   the API is absent (static preview): counts show "—", form reports launch. */
(function () {
  "use strict";

  /* =========================================================
     1) Inference arbitrage engine (hero visual)
     ========================================================= */
  function buildEngine() {
    var host = document.getElementById("engine");
    if (!host) return;

    var W = 600, H = 190, pad = 12;
    // Normalized inference-price series (higher = more expensive).
    var p = [0.50,0.46,0.58,0.71,0.55,0.37,0.28,0.42,0.60,0.79,0.66,0.49,0.39,0.27,
             0.21,0.34,0.52,0.66,0.81,0.69,0.53,0.41,0.50,0.67,0.83,0.71,0.57,0.45,
             0.34,0.47,0.63,0.55,0.43,0.31,0.45,0.61,0.76,0.63,0.49,0.40];
    var n = p.length, innerW = W - 2 * pad, innerH = H - 2 * pad;
    var xs = function (i) { return pad + (i * innerW) / (n - 1); };
    var ys = function (v) { return pad + (1 - v) * innerH; };

    var line = "", i;
    for (i = 0; i < n; i++) line += (i ? "L" : "M") + xs(i).toFixed(1) + " " + ys(p[i]).toFixed(1) + " ";
    var area = "M" + xs(0).toFixed(1) + " " + (H - pad) + " ";
    for (i = 0; i < n; i++) area += "L" + xs(i).toFixed(1) + " " + ys(p[i]).toFixed(1) + " ";
    area += "L" + xs(n - 1).toFixed(1) + " " + (H - pad) + " Z";

    // local minima below 0.42 -> charge; local maxima above 0.66 -> discharge
    var markers = "";
    for (i = 2; i < n - 2; i++) {
      if (p[i] < p[i - 1] && p[i] <= p[i + 1] && p[i] < 0.42)
        markers += '<circle class="m-charge" cx="' + xs(i).toFixed(1) + '" cy="' + ys(p[i]).toFixed(1) + '" r="3.6"/>';
      if (p[i] > p[i - 1] && p[i] >= p[i + 1] && p[i] > 0.66)
        markers += '<circle class="m-discharge" cx="' + xs(i).toFixed(1) + '" cy="' + ys(p[i]).toFixed(1) + '" r="3.6"/>';
    }

    var grid = "";
    [0.28, 0.5, 0.72].forEach(function (g) {
      var y = (pad + g * innerH).toFixed(1);
      grid += '<line class="grid-l" x1="' + pad + '" y1="' + y + '" x2="' + (W - pad) + '" y2="' + y + '"/>';
    });

    host.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
      grid +
      '<path class="area" d="' + area + '"/>' +
      '<path class="price" d="' + line.trim() + '"/>' +
      markers +
      '<line class="playhead" x1="0" y1="' + pad + '" x2="0" y2="' + (H - pad) + '"/>' +
      '<circle class="ph-dot" cx="0" cy="' + pad + '" r="3"/>' +
      "</svg>";
  }

  /* ---------------------------------------------------------------------
     The readout model — an ILLUSTRATION, and a deterministic one.

     There is no reservoir charging yet, so there is no feed to bind these
     three readouts to. What an illustration still owes a reader is that it
     be auditable: the series below is FIXED. mulberry32 seeded with
     20260725 yields the same 96 steps on every load, on every device, in
     every browser, forever. Nothing here re-rolls, and Math.random() is
     deliberately absent — a number a reader cannot reproduce is a number a
     reader cannot check.

     Every input is stated on the page itself, immediately ABOVE the readout
     row (index.html, .engine-foot). If a constant changes here, change the
     stated assumption there in the same edit.
     --------------------------------------------------------------------- */
  var MODEL = {
    seed: 20260725,   // fixed seed — the whole point
    steps: 96,        // series length; the series then repeats from step 0
    cycle: 8,         // 8-step cycle = 4 charge steps, then 4 discharge steps
    capacity: 2.10,   // MTok — reservoir size (a ceiling, not a target)
    reserve: 1.20,    // MTok — floor held back against realtime demand
    start: 1.50,      // MTok — state of charge before step 0
    spread: 0.18,     // assumed batch -> realtime price spread
    price: 12.00,     // USD per MTok — notional charge-side cost
    tickMs: 1400      // unchanged animation slot
  };

  /* mulberry32 — 32-bit PRNG, exact same output for a given seed anywhere. */
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* Walks the cycle once and returns all `steps` states up front, so the
     whole series exists before a single frame is painted. */
  function modelSeries(m) {
    var rnd = mulberry32(m.seed), out = [], stored = m.start, usd = 0;
    for (var i = 0; i < m.steps; i++) {
      var delta = 0.09 + rnd() * 0.12;                      // MTok moved this step
      var charging = Math.floor(i / (m.cycle / 2)) % 2 === 0;
      if (charging) {
        stored = Math.min(m.capacity, stored + delta);      // never past capacity
      } else {
        var moved = Math.min(delta, stored - m.reserve);    // never below reserve
        stored -= moved;
        usd += moved * m.price * m.spread;                  // realized spread
      }
      out.push({ act: charging ? "CHARGE" : "DISCHARGE", stored: stored, usd: usd });
    }
    return out;
  }

  function animateReadouts() {
    var spreadEl = document.getElementById("r-spread");
    var storedEl = document.getElementById("r-stored");
    var lastEl = document.getElementById("r-last");
    if (!spreadEl || !storedEl || !lastEl) return;

    var series = modelSeries(MODEL), i = 0;
    function paint(s) {
      spreadEl.textContent = "+$" + s.usd.toLocaleString("en-US", {
        minimumFractionDigits: 2, maximumFractionDigits: 2
      });
      storedEl.textContent = s.stored.toFixed(2) + " MTok";
      lastEl.textContent = s.act;
      lastEl.style.color = s.act === "CHARGE" ? "var(--charge)" : "var(--discharge)";
    }
    paint(series[0]);

    // Reduced motion gets the same document, held at step 0 — the frozen
    // state is a legitimate state of this model, not a degraded one.
    var quiet = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    if (quiet && quiet.matches) return;

    setInterval(function () { i = (i + 1) % series.length; paint(series[i]); }, MODEL.tickMs);
  }

  try { buildEngine(); animateReadouts(); } catch (_) {}

  /* =========================================================
     2) Yield wishlist
     ========================================================= */
  var LS_VOTES = "acc_votes_v1";
  function getVoted() { try { return JSON.parse(localStorage.getItem(LS_VOTES) || "[]"); } catch (_) { return []; } }
  function setVoted(list) { try { localStorage.setItem(LS_VOTES, JSON.stringify(list)); } catch (_) {} }
  function fmt(x) { return typeof x === "number" && isFinite(x) ? x.toLocaleString("en-US") : "—"; }

  function paintCounts(counts) {
    var voted = getVoted();
    document.querySelectorAll(".vote-count").forEach(function (el) {
      var id = el.getAttribute("data-count");
      var n = counts && Object.prototype.hasOwnProperty.call(counts, id) ? counts[id] : null;
      el.childNodes[0].nodeValue = n === null ? "—" : fmt(n);
      if (!el.querySelector("small")) {
        var s = document.createElement("small"); s.textContent = "votes"; el.appendChild(s);
      }
    });
    document.querySelectorAll(".vote").forEach(function (btn) {
      if (voted.indexOf(btn.getAttribute("data-id")) !== -1) {
        btn.setAttribute("aria-pressed", "true"); btn.disabled = true; btn.textContent = "▲ Voted";
      }
    });
  }
  function loadCounts() {
    fetch("/accumulator/api/wishlist", { headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) { paintCounts(d && d.counts ? d.counts : {}); })
      .catch(function () { paintCounts(null); });
  }
  function vote(id, btn) {
    var voted = getVoted();
    if (voted.indexOf(id) !== -1) return;
    btn.disabled = true;
    fetch("/accumulator/api/wishlist/vote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: id }) })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        voted.push(id); setVoted(voted);
        btn.setAttribute("aria-pressed", "true"); btn.textContent = "▲ Voted";
        if (d && d.counts) paintCounts(d.counts);
      })
      .catch(function () {
        voted.push(id); setVoted(voted);
        btn.setAttribute("aria-pressed", "true"); btn.textContent = "▲ Voted";
      });
  }
  document.querySelectorAll(".vote").forEach(function (btn) {
    btn.addEventListener("click", function () { vote(btn.getAttribute("data-id"), btn); });
  });
  loadCounts();

  /* =========================================================
     3) Waitlist
     ========================================================= */
  var form = document.getElementById("waitlist-form");
  if (form) {
    var msg = document.getElementById("wl-msg");
    var submit = document.getElementById("wl-submit");
    function say(text, cls) { msg.textContent = text; msg.className = "form-msg " + (cls || ""); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (form.email.value || "").trim();
      var wallet = (form.wallet.value || "").trim();
      var role = form.role.value || "";
      var company = (form.company.value || "").trim(); // honeypot
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        say("Enter a valid email address.", "err"); form.email.focus(); return;
      }
      submit.disabled = true; say("Filing…", "");
      fetch("/accumulator/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email, wallet: wallet, role: role, company: company })
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { ok: r.ok, status: r.status, body: b }; }); })
        .then(function (res) {
          if (res.ok) { say("Filed. You're on the waitlist — watch for the genesis notice.", "ok"); form.reset(); }
          else if (res.status === 409) { say("You're already on the list. Nothing more to do.", "ok"); form.reset(); }
          else { say((res.body && res.body.error) || "Could not file right now — try again shortly.", "err"); submit.disabled = false; }
        })
        .catch(function () {
          say("Waitlist capture goes live at deploy. Reach us at contact@gokhan.vc in the meantime.", "err");
          submit.disabled = false;
        });
    });
  }
})();
