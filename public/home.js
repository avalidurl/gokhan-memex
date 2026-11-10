// The homepage is one page. Old hash "pages" (#cv, #journal, ...) moved to real
// paths; send old bookmarks there instead of rendering a second copy.
const moved = {
  index: "/",
  cv: "/cv/",
  contact: "/cv/#contact",
  journal: "/journal/",
  essay: "/journal/complementary-substitutions/",
  publishing: "/publishing/",
  raises: "/raises/",
  agents: "/agents/",
  projects: "/products/",
  products: "/products/",
};

function route() {
  const id = decodeURIComponent((location.hash || "").slice(1));
  const to = moved[id];
  if (!to) return;
  if (to === "/") { history.replaceState(null, "", "/"); return; }
  location.replace(to);
}
route();
addEventListener("hashchange", route);

const root = document.documentElement;
const themeBtn = document.getElementById("theme");
const faceBtn = document.getElementById("face");

function paint() {
  const ink = root.classList.contains("ink");
  const sans = root.classList.contains("sans");
  themeBtn.textContent = ink ? "Paper" : "Ink";
  themeBtn.setAttribute("aria-pressed", String(ink));
  themeBtn.title = ink ? "Switch to paper" : "Switch to ink";
  faceBtn.textContent = sans ? "Serif" : "Sans";
  faceBtn.setAttribute("aria-pressed", String(sans));
  faceBtn.title = sans ? "Switch body to serif" : "Switch body to sans";
}

const storedTheme = localStorage.getItem("gt-theme");
const storedFace = localStorage.getItem("gt-face");
if (storedTheme === "ink" || (!storedTheme && matchMedia("(prefers-color-scheme: dark)").matches)) {
  root.classList.add("ink");
}
if (storedFace === "sans") root.classList.add("sans");
paint();

themeBtn.addEventListener("click", () => {
  root.classList.toggle("ink");
  localStorage.setItem("gt-theme", root.classList.contains("ink") ? "ink" : "paper");
  paint();
});
faceBtn.addEventListener("click", () => {
  root.classList.toggle("sans");
  localStorage.setItem("gt-face", root.classList.contains("sans") ? "sans" : "serif");
  paint();
});
