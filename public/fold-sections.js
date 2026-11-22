(function () {
  function foldBox(box) {
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
      summary.className = head.className || "cx-h";
      while (head.firstChild) summary.appendChild(head.firstChild);
      head.remove();
    } else {
      summary.className = "cx-h";
      var label = document.createElement("b");
      label.textContent = box.getAttribute("aria-label") || "Section";
      summary.appendChild(label);
    }
    details.appendChild(summary);
    while (box.firstChild) details.appendChild(box.firstChild);
    box.replaceWith(details);
  }
  var boxes = Array.prototype.slice.call(document.querySelectorAll(".cx:not(details), .tldr:not(details)"));
  boxes.sort(function (a, b) {
    return b.querySelectorAll(".cx, .tldr").length - a.querySelectorAll(".cx, .tldr").length;
  });
  boxes.forEach(foldBox);
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
})();
