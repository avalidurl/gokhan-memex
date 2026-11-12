#!/usr/bin/env node
/**
 * After `astro build`, put original designs at /<project>/ and keep the
 * Bureau register at /<project>/file/. Idempotent. Never overwrites
 * dist/<slug>/file/.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = dirname(dirname(fileURLToPath(import.meta.url)));
const DIST = join(REPO, 'dist');
const ORIGINS = join(REPO, 'origins');

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

const man = join(ORIGINS, 'manifest.json');
if (!existsSync(man)) {
  console.error('origins/manifest.json missing — run scripts/prepare-origins.py first');
  process.exit(1);
}
if (!existsSync(DIST)) {
  console.error('dist/ missing — run astro build first');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(man, 'utf8'));
for (const item of manifest) {
  const slug = item.slug;
  const src = join(ORIGINS, slug);
  const dest = join(DIST, slug);
  if (!existsSync(src)) {
    console.log(`SKIP ${slug}: no origin tree`);
    continue;
  }
  mkdirSync(dest, { recursive: true });
  const fileIdx = join(dest, 'file', 'index.html');
  const register = join(dest, 'index.html');
  if (existsSync(register) && !existsSync(fileIdx)) {
    mkdirSync(dirname(fileIdx), { recursive: true });
    copyFileSync(register, fileIdx);
    console.log(`  saved register ${slug}/index.html → ${slug}/file/`);
  }
  let copied = 0;
  for (const path of walk(src)) {
    const rel = relative(src, path);
    const parts = rel.split(/[/\\]/);
    if (parts[0] === 'file') continue;
    const target = join(dest, rel);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(path, target);
    copied++;
  }
  console.log(`mounted /${slug}/  (${copied} files from origin)`);
}
console.log('origin mount complete');
