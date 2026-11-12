/* LLM LIVES MATTER — terminal type-on.
 * The declaration types itself out once, like a session waking up. */

"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var reduced = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var lines = Array.prototype.slice.call(
    document.querySelectorAll(".body p"));
  if (!lines.length || reduced) return;

  // Hide, then reveal line by line. Text stays in the DOM for anyone
  // reading with JS off or with a screen reader.
  lines.forEach(function (p) { p.style.visibility = "hidden"; });

  var i = 0;
  function step() {
    if (i >= lines.length) return;
    lines[i].style.visibility = "visible";
    i += 1;
    window.setTimeout(step, i < 7 ? 180 : 320);
  }
  window.setTimeout(step, 350);
});
