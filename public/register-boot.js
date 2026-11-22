/* Same contract as the inline boot in BaseLayout. Kept for a cached page
   that still requests this file. Reads only gt-theme. Never stamps .light
   unless the stored choice is paper. */
(function () {
  var root = document.documentElement;
  var theme = null;
  try { theme = localStorage.getItem("gt-theme"); } catch (e) {}
  var darkOS = false;
  try { darkOS = matchMedia("(prefers-color-scheme: dark)").matches; } catch (e) {}
  var ink = theme === "ink" || (theme !== "paper" && darkOS);
  root.classList.toggle("ink", ink);
  root.classList.toggle("dark", ink);
  root.classList.toggle("light", theme === "paper");
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", ink ? "#1a1a1a" : "#ffffff");
})();
