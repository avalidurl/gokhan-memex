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
