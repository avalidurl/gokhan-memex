const pages = [...document.querySelectorAll(".page")];
const docid = document.getElementById("docid");
const navLinks = [...document.querySelectorAll("nav a")];

function show() {
  const raw = (location.hash || "#index").slice(1);
  const known = pages.some(p => p.id === raw);
  const id = known ? raw : "index";
  pages.forEach(p => p.classList.toggle("on", p.id === id));
  const navId = id === "essay" ? "journal" : id;
  navLinks.forEach(a => {
    a.setAttribute("aria-current", a.getAttribute("href") === "#" + navId ? "page" : "false");
  });
  const page = document.getElementById(id);
  docid.textContent = page ? page.dataset.doc : "MX-001";
  document.title = id === "index" ? "Gökhan Turhan" : document.querySelector("#" + id + " h2, #" + id + " .title")?.textContent?.trim() || "Gökhan Turhan";
  if (id === "essay") document.title = "Complementary Substitutions";
}

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

document.querySelectorAll("[data-find]").forEach(input => {
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    const scope = document.getElementById(input.dataset.find);
    const rows = [...scope.querySelectorAll("[data-row]")];
    rows.forEach(row => {
      row.hidden = q.length > 0 && !row.dataset.row.includes(q);
    });
    const n = rows.filter(r => !r.hidden).length;
    const count = scope.querySelector("[data-count]");
    if (count) count.textContent = String(n);
    const empty = scope.querySelector("[data-empty]");
    if (empty) empty.hidden = n !== 0;
  });
});

addEventListener("hashchange", show);
show();
