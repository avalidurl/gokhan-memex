(function () {
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme");
  var faceBtn = document.getElementById("face");
  if (!themeBtn || !faceBtn) return;

  function paint() {
    var ink = root.classList.contains("ink");
    var sans = root.classList.contains("sans");
    themeBtn.textContent = ink ? "Paper" : "Ink";
    themeBtn.setAttribute("aria-pressed", String(ink));
    themeBtn.title = ink ? "Switch to paper" : "Switch to ink";
    faceBtn.textContent = sans ? "Serif" : "Sans";
    faceBtn.setAttribute("aria-pressed", String(sans));
    faceBtn.title = sans ? "Switch body to serif" : "Switch body to sans";
  }

  themeBtn.addEventListener("click", function () {
    var ink = !root.classList.contains("ink");
    root.classList.toggle("ink", ink);
    root.classList.toggle("dark", ink);
    root.classList.toggle("light", !ink);
    localStorage.setItem("gt-theme", ink ? "ink" : "paper");
    paint();
  });
  faceBtn.addEventListener("click", function () {
    root.classList.toggle("sans");
    localStorage.setItem("gt-face", root.classList.contains("sans") ? "sans" : "serif");
    paint();
  });
  paint();
})();

(function () {
  var bar = document.getElementById("reg-bar");
  var btn = document.getElementById("reg-menu");
  var nav = document.getElementById("reg-nav");
  if (!bar || !btn || !nav) return;
  function setOpen(open) {
    bar.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    btn.textContent = open ? "Close" : "Menu";
  }
  setOpen(false);
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(btn.getAttribute("aria-expanded") !== "true");
  });
  nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setOpen(false); });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
  document.addEventListener("click", function (e) {
    if (!bar.contains(e.target)) setOpen(false);
  });
  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 721px)").matches) setOpen(false);
  });
})();

(function () {
  function fallbackCopy(value) {
    var ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } finally { ta.remove(); }
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value).catch(function () { fallbackCopy(value); });
    }
    fallbackCopy(value);
    return Promise.resolve();
  }

  function absoluteUrl(href) {
    return new URL(href, window.location.origin + window.location.pathname).href;
  }

  function markCopied(el) {
    el.classList.add("is-copied");
    window.setTimeout(function () { el.classList.remove("is-copied"); }, 1400);
  }

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button) return;
    var t = event.target;
    if (t && t.nodeType !== 1) t = t.parentElement;
    var el = t && t.closest && t.closest("a.lk-copy, a.anchor-link");
    if (!el) return;
    var href = el.getAttribute("href") || "";
    if (!href) return;
    event.preventDefault();
    event.stopPropagation();
    var url = absoluteUrl(href);
    var hash = "";
    try { hash = new URL(url).hash; } catch (e) {}
    if (hash && window.history && history.replaceState) {
      history.replaceState(null, "", hash);
    }
    copyText(url).then(function () { markCopied(el); });
  });
})();
