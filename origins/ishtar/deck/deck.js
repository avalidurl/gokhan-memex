/* Ishtar pitch deck — keyboard nav + anime.js enter animations */
(function () {
  const track = document.getElementById("deck-track");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.getElementById("deck-progress");
  const counter = document.getElementById("deck-counter");
  const hint = document.getElementById("deck-hint");
  const btnPrev = document.getElementById("deck-prev");
  const btnNext = document.getElementById("deck-next");
  const root = document.body;
  const total = slides.length;
  let index = 0;
  let animating = false;

  slides.forEach((slide, i) => {
    const page = document.createElement("div");
    page.className = "slide-page";
    page.setAttribute("aria-hidden", "true");
    page.textContent = "Page " + (i + 1) + " of " + total;
    slide.appendChild(page);
  });

  function parseHash() {
    const m = location.hash.match(/^#(\d+)$/);
    if (!m) return location.hash.includes("print") ? 0 : 0;
    const i = parseInt(m[1], 10) - 1;
    return i >= 0 && i < total ? i : 0;
  }

  function updateChrome() {
    const pct = ((index + 1) / total) * 100;
    progress.style.width = pct + "%";
    counter.textContent = "Page " + (index + 1) + " of " + total;
    slides.forEach((s, i) => s.classList.toggle("is-active", i === index));
    root.classList.toggle("deck-on-title", index === 0);
    if (btnPrev) btnPrev.disabled = index === 0;
    if (btnNext) btnNext.disabled = index === total - 1;
  }

  function animateSlide(slide) {
    if (typeof anime === "undefined") {
      slide.querySelectorAll("[data-animate]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }
    const items = slide.querySelectorAll("[data-animate]");
    anime.remove(items);
    items.forEach((el) => {
      el.style.opacity = "0";
      const kind = el.dataset.animate || "up";
      if (kind === "up") el.style.transform = "translateY(28px)";
      else if (kind === "left") el.style.transform = "translateX(-24px)";
      else if (kind === "scale") el.style.transform = "scale(0.96)";
    });
    anime({
      targets: items,
      opacity: [0, 1],
      translateY: (el) => (el.dataset.animate === "up" ? [28, 0] : 0),
      translateX: (el) => (el.dataset.animate === "left" ? [-24, 0] : 0),
      scale: (el) => (el.dataset.animate === "scale" ? [0.96, 1] : 1),
      delay: anime.stagger(90, { start: 120 }),
      duration: 680,
      easing: "cubicBezier(0.22, 1, 0.36, 1)",
    });
  }

  function goTo(i, { replaceHash = true } = {}) {
    if (animating || i < 0 || i >= total || i === index) return;
    animating = true;
    index = i;
    track.style.transform = "translateX(-" + index * 100 + "%)";
    updateChrome();
    if (replaceHash) {
      const h = "#" + (index + 1);
      if (location.hash !== h) history.replaceState(null, "", h);
    }
    animateSlide(slides[index]);
    window.setTimeout(() => {
      animating = false;
    }, 540);
  }

  function next() {
    goTo(index + 1);
  }
  function prev() {
    goTo(index - 1);
  }

  btnPrev?.addEventListener("click", () => prev());
  btnNext?.addEventListener("click", () => next());

  document.addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, a[href^='mailto']")) return;
    if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      prev();
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    } else if (e.key === "f" || e.key === "F") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
  });

  let touchX = null;
  track.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  track.addEventListener(
    "touchend",
    (e) => {
      if (touchX == null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) < 48) return;
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  window.addEventListener("hashchange", () => {
    const i = parseHash();
    if (i !== index) goTo(i, { replaceHash: false });
  });

  /* Print mode: reveal all slides for PDF generation */
  if (location.hash.includes("print=1") || new URLSearchParams(location.search).has("print")) {
    root.classList.add("deck-print-mode");
    slides.forEach((s) => s.classList.add("is-active"));
    track.style.transform = "none";
    slides.forEach((s) => {
      s.querySelectorAll("[data-animate]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    });
  }

  index = parseHash();
  track.style.transform = "translateX(-" + index * 100 + "%)";
  updateChrome();
  window.requestAnimationFrame(() => animateSlide(slides[index]));
})();
