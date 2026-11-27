(function () {
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme");
  if (!themeBtn) return;

  function paint() {
    var ink = root.classList.contains("ink");
    themeBtn.setAttribute("aria-pressed", String(ink));
    themeBtn.setAttribute("aria-label", ink ? "Switch to light mode" : "Switch to dark mode");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", ink ? "#111214" : "#ffffff");
  }

  function setInk(ink) {
    root.classList.toggle("ink", ink);
    root.classList.toggle("dark", ink);
    root.classList.toggle("light", !ink);
    try { localStorage.setItem("gt-theme", ink ? "ink" : "paper"); } catch (e) {}
    paint();
  }

  themeBtn.addEventListener("click", function () {
    setInk(!root.classList.contains("ink"));
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
    if (window.matchMedia("(min-width: 1024px)").matches) setOpen(false);
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

// Every bordered section becomes a disclosure, open until the header is used.
function foldBox(box, summaryClass) {
  if (!box.parentNode || box.tagName === "DETAILS") return;
  var details = document.createElement("details");
  details.className = box.className + (box.classList.contains("fold") ? "" : " fold");
  details.open = true;
  for (var i = 0; i < box.attributes.length; i++) {
    var attr = box.attributes[i];
    if (attr.name === "class") continue;
    details.setAttribute(attr.name, attr.value);
  }
  var head = box.querySelector(":scope > .cx-h, :scope > .tldr-k");
  var summary = document.createElement("summary");
  if (head) {
    summary.className = head.className || summaryClass;
    while (head.firstChild) summary.appendChild(head.firstChild);
    head.remove();
  } else {
    summary.className = summaryClass;
    summary.textContent = box.getAttribute("aria-label") || "Section";
  }
  details.appendChild(summary);
  while (box.firstChild) details.appendChild(box.firstChild);
  box.replaceWith(details);
}
var foldBoxes = Array.prototype.slice.call(document.querySelectorAll(".cx:not(details), .tldr:not(details)"));
foldBoxes.sort(function (a, b) {
  return b.querySelectorAll(".cx, .tldr").length - a.querySelectorAll(".cx, .tldr").length;
});
foldBoxes.forEach(function (box) { foldBox(box, "cx-h"); });

// A link or button inside a disclosure header keeps its own action.
// The summary would toggle after the click; put the open state back.
document.querySelectorAll("details > summary").forEach(function (summary) {
  summary.addEventListener("click", function (event) {
    var t = event.target;
    if (t && t.nodeType !== 1) t = t.parentElement;
    if (!t || !t.closest || !t.closest("a, button")) return;
    var details = summary.parentElement;
    if (!details || details.tagName !== "DETAILS") return;
    var open = details.open;
    setTimeout(function () { details.open = open; }, 0);
  });
});

// A tag row that wraps past one line collapses to that line.
// A single line is left alone. The triangle is a sibling of the links.
function tagWrap(row) {
  var wrap = row.parentElement;
  if (wrap && wrap.classList.contains("tag-clamp")) return wrap;
  wrap = document.createElement(row.tagName === "SPAN" ? "span" : "div");
  wrap.className = "tag-clamp";
  row.parentNode.insertBefore(wrap, row);
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "tag-more";
  btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("aria-label", "Show all tags");
  btn.addEventListener("click", function () {
    var open = wrap.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Show fewer tags" : "Show all tags");
  });
  wrap.appendChild(btn);
  wrap.appendChild(row);
  return wrap;
}

function tagMeasure(row) {
  var links = row.querySelectorAll(":scope > a");
  if (links.length < 2) return null;
  var box = row.getBoundingClientRect();
  if (box.width < 8 || box.height < 1) return null;
  var firstTop = links[0].getBoundingClientRect().top;
  var bottom = links[0].getBoundingClientRect().bottom;
  var wrapped = false;
  for (var i = 1; i < links.length; i++) {
    var rect = links[i].getBoundingClientRect();
    if (rect.top - firstTop > 6) {
      wrapped = true;
      break;
    }
    if (rect.bottom > bottom) bottom = rect.bottom;
  }
  if (!wrapped) return null;
  return Math.max(1, Math.ceil(bottom - box.top));
}

function tagFit() {
  var rows = document.querySelectorAll(".dispatch-tags, .tags");
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var wrap = row.parentElement && row.parentElement.classList.contains("tag-clamp") ? row.parentElement : null;
    var wasClamped = wrap && wrap.classList.contains("is-clamped");
    if (wasClamped) wrap.classList.remove("is-clamped");
    var line = tagMeasure(row);
    if (!line) {
      if (wrap) {
        wrap.classList.remove("is-clamped");
        wrap.classList.remove("is-open");
        var idle = wrap.querySelector(".tag-more");
        if (idle) {
          idle.setAttribute("aria-expanded", "false");
          idle.setAttribute("aria-label", "Show all tags");
        }
      }
      continue;
    }
    wrap = wrap || tagWrap(row);
    row.style.setProperty("--tag-line", line + "px");
    wrap.classList.add("is-clamped");
  }
}

var tagFitTimer = 0;
function tagFitSoon() {
  clearTimeout(tagFitTimer);
  tagFitTimer = setTimeout(tagFit, 40);
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", tagFit);
} else {
  tagFit();
}
window.addEventListener("resize", tagFitSoon);
window.addEventListener("load", tagFit);
document.querySelectorAll("details").forEach(function (details) {
  details.addEventListener("toggle", tagFitSoon);
});
