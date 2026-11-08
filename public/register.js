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
