#!/usr/bin/env node
/**
 * After mount-origins, write one urlset for each former domain and list
 * those files from dist/sitemap-index.xml.
 *
 * numetal.xyz, gokhan.vc, and agentbounty.dev send /sitemap.xml here.
 * ishtar.numetal.xyz, curb.numetal.xyz, and accumulator.numetal.xyz still
 * publish their own files. The copies on this host use only
 * https://gokhanturhan.com URLs. Sitemap XML has no email element.
 * The public contact for these pages is contact@gokhan.vc.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(REPO, 'dist');
const ORIGINS = join(REPO, 'origins');
const SITE = 'https://gokhanturhan.com';
const CONTACT = 'contact@gokhan.vc';

const SLUGS = ['accumulator', 'agentbounty', 'curb', 'gokhan-vc', 'ishtar', 'numetal'];

const HOSTS = [
  [/^https:\/\/(?:www\.)?ishtar\.numetal\.xyz(?=\/|$)/i, `${SITE}/ishtar`],
  [/^https:\/\/(?:www\.)?curb\.numetal\.xyz(?=\/|$)/i, `${SITE}/curb`],
  [/^https:\/\/(?:www\.)?accumulator\.numetal\.xyz(?=\/|$)/i, `${SITE}/accumulator`],
  [/^https:\/\/(?:www\.)?numetal\.xyz(?=\/|$)/i, `${SITE}/numetal`],
  [/^https:\/\/(?:www\.)?gokhan\.vc(?=\/|$)/i, `${SITE}/gokhan-vc`],
  [/^https:\/\/(?:www\.)?agentbounty\.dev(?=\/|$)/i, `${SITE}/agentbounty`],
];

// Former paths that now live somewhere else. A product sitemap only keeps
// URLs that stay under that product.
const REDIRECTS = [
  [/^\/curb\/dispatch\/curb-is-live\/?$/, '/journal/curb-is-live/'],
  [/^\/curb\/dispatch\/tickerline\/?$/, '/journal/tickerline-your-conversation-quoted/'],
  [/^\/curb\/dispatch\/x402-economy-july-2026\/?$/, '/journal/x402-economy-july-2026/'],
  [/^\/curb\/dispatch\/complementary-substitutions\/?$/, '/journal/complementary-substitutions/'],
  [/^\/curb\/dispatch\/?$/, '/journal/'],
  [/^\/curb\/privacy\/?$/, '/curb/legal/privacy/'],
  [/^\/curb\/terms\/?$/, '/curb/legal/terms/'],
];

const SKIP_DIR = new Set(['404.d', '_root.d', 'og-src', 'assets', '_astro', '_next', 'RSC', 'fonts']);
const EXTRA_FILES = new Set(['llms.txt', 'llms-full.txt', 'rss.xml', 'feed.xml', 'skill.md']);

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.DS_Store') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function rewriteHost(url) {
  let out = url.trim();
  for (const [re, base] of HOSTS) {
    if (re.test(out)) {
      out = out.replace(re, base);
      break;
    }
  }
  return out;
}

function normalize(raw, slug) {
  if (!raw) return null;
  let url = rewriteHost(raw);
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.origin !== SITE) return null;
  let path = decodeURI(parsed.pathname);
  for (const [re, to] of REDIRECTS) {
    if (re.test(path)) path = to;
  }
  if (path !== `/${slug}` && !path.startsWith(`/${slug}/`)) return null;
  if (path === `/${slug}/sitemap.xml` || path.endsWith('/404') || path.endsWith('/404/')) return null;
  let last = path.split('/').pop();
  if (last === 'index.html') {
    path = path.slice(0, -'index.html'.length);
    last = '';
  } else if (last && last.endsWith('.html')) {
    path = path.slice(0, -'.html'.length);
    if (!path.endsWith('/')) path += '/';
    last = '';
  }
  if (last && last.includes('.') && !EXTRA_FILES.has(last)) return null;
  if (!path.endsWith('/') && !(last && last.includes('.'))) path += '/';
  return `${SITE}${path}`;
}

function locsFromXml(text, slug) {
  const out = [];
  for (const raw of text.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const loc = normalize(raw[1], slug);
    if (loc) out.push(loc);
  }
  return out;
}

function locsFromOrigin(slug) {
  const root = join(ORIGINS, slug);
  if (!existsSync(root)) return [];
  const out = [];
  const sitemap = join(root, 'sitemap.xml');
  if (existsSync(sitemap)) out.push(...locsFromXml(readFileSync(sitemap, 'utf8'), slug));
  for (const path of walk(root)) {
    const rel = relative(root, path).split(sep).join('/');
    const parts = rel.split('/');
    if (parts.some((p) => SKIP_DIR.has(p))) continue;
    if (rel === '404.html' || rel.endsWith('/404.html')) continue;
    const base = parts[parts.length - 1];
    let urlPath = null;
    if (rel === 'index.html') urlPath = `/${slug}/`;
    else if (rel.endsWith('/index.html')) urlPath = `/${slug}/${rel.slice(0, -'index.html'.length)}`;
    else if (EXTRA_FILES.has(base)) urlPath = `/${slug}/${rel}`;
    const loc = urlPath ? normalize(`${SITE}${urlPath}`, slug) : null;
    if (loc) out.push(loc);
  }
  return out;
}

function locsFromDistSitemaps(slug) {
  const out = [];
  for (const name of readdirSync(DIST)) {
    if (!/^sitemap-\d+\.xml$/.test(name)) continue;
    out.push(...locsFromXml(readFileSync(join(DIST, name), 'utf8'), slug));
  }
  return out;
}

function urlset(locs) {
  const body = locs.map((loc) => `  <url><loc>${esc(loc)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function assertContact(xml, label) {
  const emails = xml.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) || [];
  const foreign = emails.filter((e) => e.toLowerCase() !== CONTACT);
  if (foreign.length) {
    console.error(`${label} names ${foreign.join(', ')}. The only contact is ${CONTACT}.`);
    process.exit(1);
  }
}

if (!existsSync(join(DIST, 'sitemap-index.xml'))) {
  console.error('dist/sitemap-index.xml missing — run astro build first');
  process.exit(1);
}

const written = [];
for (const slug of SLUGS) {
  const locs = [...new Set([...locsFromDistSitemaps(slug), ...locsFromOrigin(slug)])].sort();
  if (!locs.length) {
    console.error(`no URLs for /${slug}/`);
    process.exit(1);
  }
  const xml = urlset(locs);
  assertContact(xml, `${slug}/sitemap.xml`);
  const dest = join(DIST, slug, 'sitemap.xml');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, xml);
  written.push({ slug, count: locs.length });
  console.log(`/${slug}/sitemap.xml  ${locs.length} urls`);
}

const indexPath = join(DIST, 'sitemap-index.xml');
let index = readFileSync(indexPath, 'utf8');
if (!index.includes('</sitemapindex>')) {
  console.error('dist/sitemap-index.xml has no sitemapindex');
  process.exit(1);
}
const have = new Set([...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const additions = [];
for (const { slug } of written) {
  const loc = `${SITE}/${slug}/sitemap.xml`;
  if (!have.has(loc)) additions.push(`<sitemap><loc>${loc}</loc></sitemap>`);
}
if (additions.length) {
  index = index.replace('</sitemapindex>', `${additions.join('')}</sitemapindex>`);
  writeFileSync(indexPath, index);
}
assertContact(index, 'sitemap-index.xml');
console.log(`sitemap-index.xml lists ${have.size + additions.length} sitemap files`);
