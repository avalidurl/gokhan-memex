/* Boot the register theme before paint. Same keys as the homepage. */
(function () {
  var root = document.documentElement;
  var theme = localStorage.getItem("gt-theme");
  if (!theme) {
    var old = localStorage.getItem("theme");
    if (old === "dark") theme = "ink";
    if (old === "light") theme = "paper";
  }
  var face = localStorage.getItem("gt-face");
  var ink = theme === "ink" || (!theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.classList.toggle("ink", ink);
  root.classList.toggle("dark", ink);
  root.classList.toggle("light", !ink);
  if (face === "sans") root.classList.add("sans");
})();
