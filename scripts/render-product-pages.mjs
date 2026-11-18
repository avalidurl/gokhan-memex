#!/usr/bin/env node
/**
 * Render brochure HTML from product source. Writes files under --out.
 * Does not crawl, and does not read the plaintext join app.
 *
 *   node scripts/render-product-pages.mjs \
 *     --out <dir> --curb <inference-swap> --plaintext <plaintext-site> \
 *     [--board board.json] [--hands hands.json]
 *
 * board.json / hands.json are the JSON from `wrangler d1 execute --json`
 * for the public board columns (gid, title, created_at, body, name)
 * and the public hand names. Omit them to leave the saved board alone.
 */
import { mkdirSync, readFileSync, writeFileSync, cpSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? "" : process.argv[i + 1] || "";
}

const out = arg("--out");
const curbRoot = arg("--curb");
const plaintextSite = arg("--plaintext");
const boardPath = arg("--board");
const handsPath = arg("--hands");
if (!out || !curbRoot || !plaintextSite) {
  console.error("need --out, --curb, and --plaintext");
  process.exit(1);
}

function write(rel, html) {
  const dest = join(out, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, html);
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[c]);
}

function d1Rows(path) {
  if (!path) return null;
  const data = JSON.parse(readFileSync(path, "utf8"));
  const block = Array.isArray(data) ? data[0] : data;
  return block.results || [];
}

function publicVar(toml, key) {
  const m = toml.match(new RegExp(`^${key}\\s*=\\s*"(.*)"\\s*$`, "m"));
  if (!m) throw new Error(`missing public var ${key}`);
  return m[1];
}

function sliceFn(src, startLabel, endLabel) {
  const start = src.indexOf(startLabel);
  const end = src.indexOf(endLabel);
  if (start < 0 || end < 0 || end <= start) {
    throw new Error(`could not slice ${startLabel}`);
  }
  return src.slice(start, end);
}

async function renderCurb() {
  const src = join(curbRoot, "src");
  const origin = "https://curb.numetal.xyz";
  const { feesHtml } = await import(pathToFileURL(join(src, "fees.js")).href);
  const { installHtml, harnessHtml } = await import(pathToFileURL(join(src, "install.js")).href);
  const { termsHtml, privacyHtml } = await import(pathToFileURL(join(src, "legal.js")).href);
  const { deckHtml } = await import(pathToFileURL(join(src, "deck.js")).href);
  write("curb/fees/index.html", feesHtml(origin));
  write("curb/install/index.html", installHtml(origin));
  write("curb/harness/index.html", harnessHtml(origin));
  write("curb/terms/index.html", termsHtml(origin));
  write("curb/privacy/index.html", privacyHtml(origin));
  write("curb/deck/index.html", deckHtml(origin));

  const scratch = join(tmpdir(), `curb-skin-${process.pid}`);
  rmSync(scratch, { recursive: true, force: true });
  mkdirSync(scratch, { recursive: true });
  const harnessSrc = join(curbRoot, "harness", "src");
  cpSync(join(harnessSrc, "theme.ts"), join(scratch, "theme.ts"));
  const shared = readFileSync(join(harnessSrc, "shared.ts"), "utf8").replace(
    'from "./theme"',
    'from "./theme.ts"',
  );
  writeFileSync(join(scratch, "shared.ts"), shared);
  const { agentSkin } = await import(pathToFileURL(join(scratch, "shared.ts")).href);
  const note = (host) =>
    `<p>Demo actions stay on <a href="${host}/">${host.replace("https://", "")}</a>. This page does not post them.</p>`;
  for (const [slug, title, role, host] of [
    ["seller", "curb-seller", "seller", "https://seller.curb.numetal.xyz"],
    ["buyer", "curb-buyer", "buyer", "https://buyer.curb.numetal.xyz"],
  ]) {
    let html = agentSkin({
      title,
      role,
      origin: host,
      mcpUrl: "https://api.curb.numetal.xyz/mcp",
      status: { agent: title, note: "brochure copy, no live agent state" },
      actionsHtml: note(host),
    });
    html = html.replace(/<script>\s*async function run[\s\S]*?<\/script>\s*/, "");
    write(`curb/${slug}/index.html`, html);
  }
  rmSync(scratch, { recursive: true, force: true });
}

async function renderPlaintext() {
  const renderUrl = pathToFileURL(join(plaintextSite, "src", "render.js")).href;
  const { page, foot, markdown, noticeRow, masthead, writeBtn, nav } = await import(renderUrl);
  const indexSrc = readFileSync(join(plaintextSite, "src", "index.js"), "utf8");
  const toml = readFileSync(join(plaintextSite, "wrangler.toml"), "utf8");
  const env = {
    CONTRACT: publicVar(toml, "CONTRACT"),
    EXPLORER: publicVar(toml, "EXPLORER"),
    RPC_URL: publicVar(toml, "RPC_URL"),
  };
  const modPath = join(out, "_plaintext-pages.mjs");
  writeFileSync(
    modPath,
    `import { page, foot, esc } from ${JSON.stringify(renderUrl)};\n` +
      sliceFn(indexSrc, "function clubPage()", "function roadmap()") +
      sliceFn(indexSrc, "function roadmap()", "function spec(") +
      sliceFn(indexSrc, "function spec(env)", "function manual(") +
      sliceFn(indexSrc, "function manual(env)", "async function feed(") +
      `\nexport { clubPage, roadmap, spec, manual };\n`,
  );
  const pages = await import(pathToFileURL(modPath).href);
  write("plaintext/club/index.html", pages.clubPage());
  write("plaintext/roadmap/index.html", pages.roadmap());
  write("plaintext/spec/index.html", pages.spec(env));
  write("plaintext/manual/index.html", pages.manual(env));
  write(
    "plaintext/join/index.html",
    page({
      title: "write — plaintext",
      body: `<p class="t"><a href="/">the board</a></p>
<h1>write</h1>
<p>The write app takes a wallet and a payment. It stays on the plaintext worker and is not mounted on this page.</p>
${foot()}`,
    }),
  );

  const { STYLE } = await import(pathToFileURL(join(plaintextSite, "src", "style.js")).href);
  write("plaintext/style.css", STYLE.trim() + "\n");

  const notices = d1Rows(boardPath);
  if (notices) {
    const rows = notices.map((n) => noticeRow(n)).join("\n");
    const more = "";
    write(
      "plaintext/index.html",
      page({
        title: "plaintext",
        body: `${masthead()}
<p>A board of plain text. There is one box and it takes markdown or nothing at all.
You write, it costs you something, and what you wrote stays where you put it.</p>
<p>Nothing here is free and nothing here is loud. Reading costs nothing at all.</p>
${writeBtn()}
<p class="t">~$3 a notice. Sign in with X, an email or a wallet, pick which of your wallets pays, publish.</p>
${nav()}
<div class="b"></div>
<p class="t">latest notices</p>
${rows || '<p class="t">Nothing yet. The board is empty.</p>'}
${more}
${foot()}`,
      }),
    );
    for (const n of notices) {
      const body = n.body || "";
      write(
        `plaintext/notices/${n.gid}/index.html`,
        page({
          title: n.title || `notice ${n.gid}`,
          description: body.slice(0, 160) || "a notice on plaintext.",
          body: `<p class="t"><a href="/">the board</a></p>
<p class="t">${esc(n.name || "?")} &middot; notice #${esc(n.gid)}</p>
${markdown(body)}
${foot()}`,
        }),
      );
    }
  }

  const hands = d1Rows(handsPath);
  if (hands) {
    const rows = hands.map((h) => `${esc(h.name)}<br>`).join("\n");
    write(
      "plaintext/hands/index.html",
      page({
        title: "hands",
        body: `<p class="t"><a href="/">the board</a></p>
<h1>hands</h1>
<p class="t">Everyone who has paid to be here. Membership is the only fact recorded about a person.</p>
${rows || '<p class="t">Nobody yet.</p>'}
${foot()}`,
      }),
    );
  }
}

await renderCurb();
await renderPlaintext();
console.log("rendered", out);
