# gokhan-memex

The source for [gokhanturhan.com](https://gokhanturhan.com), the personal site of [Gökhan Turhan](https://gokhanturhan.com). It is a journal, a product register, and an archive: essays and notes, original product apps served on this domain, a filing page for each one, publishing, and a CV.

This README is written so you can fork the repo and stand up your own site. Everything below is how the repo actually works — not a wish list.

**Live site:** [https://gokhanturhan.com](https://gokhanturhan.com)

- Journal posts as an Astro content collection, with RSS and generated Open Graph cards.
- Product pattern: `/<slug>/` is the original standalone app (Bureau bar on top); `/<slug>/file/` is the register filing. Exception: `/coins/` is the Astro register and `/coins/file/` is a short guide, not a second copy of the list.
- Live product data is fetched same-origin through Cloudflare Pages Functions, so the apps do not send visitors off to `*.pages.dev` or retired hosts.
- Retired domains (`numetal.xyz`, `gokhan.vc`, `agentbounty.dev`) show a 10-second archive landing or a mapped 301 onto this site.
- Discoverability: sitemap, RSS, `llms.txt` / `llms-full.txt`, `search.json`, and CV as HTML, JSON, Markdown, and PDF.
- White paper register UI, Ink / Paper and Sans / Serif toggles, a mobile Menu dropdown, and a collapsible [links](https://gokhanturhan.com/links/) page with copy-link anchors on every section.

A visual sitemap of every live page is at [avalidurl.github.io](https://avalidurl.github.io/).

## Stack and techniques

| Layer | What is used |
| --- | --- |
| Framework | [Astro 5](https://astro.build), static output (`output: 'static'`), TypeScript, MDX |
| Styling | [Tailwind CSS 3](https://tailwindcss.com) plus a house register stylesheet (`public/register.css`, tokens in `src/styles/critical.css`) |
| Fonts | Self-hosted [Source Sans 3](https://github.com/adobe-fonts/source-sans) (sans) and [EB Garamond](https://github.com/octaviopardo/EBGaramond12) (serif); [JetBrains Mono](https://www.jetbrains.com/lp/mono/) for data and code |
| Content | Astro content collections (`astro:content`) with Zod schemas in `src/content/config.ts` |
| Highlighting | [Shiki](https://shiki.style) `css-variables` theme, pinned to the four house tokens so code blocks follow Ink / Paper |
| Images in posts | A rehype plugin in `astro.config.mjs` rewrites local `/images/…` and `/blog/images/…` to [Cloudflare Images](https://developers.cloudflare.com/images/) (SVGs and remote URLs are left alone) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com), project name `gokhan-memex` |

**Journal (`blog` collection),** files in `src/content/blog/`. Frontmatter:

- required: `title`, `description`, `publishDate`, `category`
- optional: `updatedDate`, `author` (defaults to `Gökhan Turhan`), `tags`, `featured`, `draft`, `heroImage`, `heroImageAlt`, `readingTime`, `excerpt`, `originalUrl`, `seoKeywords`, `schema`

`dateModified` is not a frontmatter field. For Article JSON-LD and sitemap `lastmod` it is computed in `src/lib/post-dates.ts` as **`updatedDate` if set, otherwise the last git commit date of the file, otherwise `publishDate`.** Unpublished drafts live outside the collection in `draft-posts/` at the repo root; publishing means moving a file into `src/content/blog/` and setting `draft: false`.

**Projects collection,** files in `src/content/projects/`. These are the long-form filing bodies. Frontmatter: `title`, `description`, `publishDate`, `featured`, `draft`, `heroImage`, `heroImageAlt`, `projectUrl`, `githubUrl`, `tags`. There is no `updatedDate` / `dateModified` on projects. The product register itself — names, one-line descriptions, former addresses, facts, children — lives in `src/data/estate.ts`, not in the collection.

**Person JSON-LD.** One Person entity, `@id` `https://gokhanturhan.com/#person`, with a **single `sameAs` list** defined in `src/lib/person.ts`. `BaseLayout.astro` puts that object in a schema.org `@graph` (WebSite + Person) on every Astro page so profiles are not duplicated per route. The static homepage in `public/index.html` carries the same graph.

**Open Graph cards** are generated after `astro build` by `scripts/gen-og.mjs` (renderer: `scripts/og-render.mjs`), using `@resvg/resvg-js` and the house fonts — no Chrome. Journal posts get `/og/<slug>.png`; the homepage gets `/og/home.png` (aliased as `/og-default.png`); other Astro pages whose `og:image` points at `/og/pages/<key>.png` get a card from their title and description. Origin-mounted product sites keep their own cards. The plate is a white ground, black frame, EB Garamond headline, Source Sans 3 labels, signal red (`#e10600`) and International Klein Blue (`#002FA7`).

**Quote cards** for shared highlights. Selecting text in a journal article shows a “Share quote” chip (`public/quote-share.js`). The share URL has `?q=` and a `#:~:text=` fragment. A Pages Function at `/og/quote.png` (`functions/og/quote.png.js`) renders a 1200×630 PNG; `functions/_middleware.js` rewrites the page’s Open Graph and Twitter meta so social crawlers, which do not run JavaScript, preview that card.

**Other machine-readable surfaces:**

- Sitemap: `/sitemap-index.xml` (`@astrojs/sitemap`). Journal `lastmod` uses the `dateModified` rule above. 404 is filtered out.
- RSS: `/rss.xml`
- `llms.txt` and `llms-full.txt` (llmstxt.org format), built from the same product and journal data as the site (`src/lib/llms.ts`)
- `search.json` — journal posts, publishing pages, and the CV, for clients that want a search index
- CV: `/cv/` (HTML), `/cv.json`, `/cv.md`, `/cv/plain.txt`, and `/cv/Gokhan_Turhan_CV.pdf` (reprinted from the HTML at build time)

**Register UI.** Default theme is a white paper sheet (`#ffffff`) with ink (`#141414`). Accents are signal red (`#e10600`) and International Klein Blue (`#002FA7`) — on Bureau-bar links, OG cards, and a few labels, not on running prose. The **Ink** button toggles an `ink` class (paper and ink swap); the **Sans** button toggles a `sans` class, flipping the register face between EB Garamond (default) and Source Sans 3. Choices are stored in `localStorage` (`gt-theme`, `gt-face`). On small screens the section nav collapses and a **Menu** button expands it as a dropdown (`#reg-menu` in `BaseLayout.astro`, wired in `public/register.js` and `public/home.js`).

**Links page** (`/links/`, `src/pages/links.astro`). Sections (Code, Social, chats, writing, professional, academic, multimedia, aggregators, wallets) are `<details>` elements, open by default, each with a heading id, a +/− fold control, and a copy-link anchor that copies `https://gokhanturhan.com/links/#<id>`. The data is inline in that page, not in `src/data/links.json`.

## Product pages

For every product whose slug is in `src/data/origins.ts`:

1. Astro builds a uniform Bureau register page at `/<slug>/` from `src/pages/[...product].astro`, using `src/data/estate.ts` and, when `file` is set, the matching entry in the `projects` collection.
2. The same page is also emitted at `/<slug>/file/`.
3. After the Astro build, `scripts/mount-origins.mjs` copies the original standalone app from `origins/<slug>/` over `dist/<slug>/`, and **never overwrites** `dist/<slug>/file/`. The live app is therefore `/<slug>/`; the filing is `/<slug>/file/`.

The mounted HTML carries a Bureau bar (`.gt-bar`): a one-line strip with links to Gökhan Turhan, Products, the product name, and “Bureau file” at `/<slug>/file/`. `origins/` is committed; `scripts/prepare-origins.py` is a rebuild tool used when an original design is recaptured, not part of the everyday `npm run build`.

**Exception — The Token Estate (`/coins/`).** The live page is the Astro register (`src/components/coins/CoinsRegister.astro`, `WalletCheck.astro`, data in `src/data/coins.json` and `src/data/coins-wallets.ts`), served with the site’s Bureau chrome. `/coins/leaderboard/` is the volume ranking (`CoinsLeaderboard.astro`). `/coins/file/` is a short guide to those pages — what the register is, how to read it, and where the figures come from — not a second copy of the coin list. `mount-origins.mjs` never copies an origin tree over `dist/coins/`.

Two apps are static trees under `public/` rather than origin mounts: [Turkish Art Blob](https://gokhanturhan.com/turkish-art-blob/) and [Ethereum Doomsday Tracker](https://gokhanturhan.com/ethereum-doomsday/). Short aliases in `public/_redirects` include `/sp100` → `/sp100-capex-dashboard/` and `/nvidia-vs-crypto` → `/market-cap-tracker/`. Former `/projects/…` URLs 301 to the top-level product paths.

## Same-origin live data

The original UIs talk to APIs on same-origin paths. Cloudflare Pages Functions under `functions/` proxy those calls (shared helper: `pages-lib/estate-proxy.js`) so the browser never has to follow a retired hostname, and so CORS is not an issue. HTML is always served from the mounted origin copy — fetching HTML from a retired host would 301 back here and loop. When a Pages **service binding** is configured (`NUMETAL` → the `numetal-site` Worker, `JESUS` → `personal-jesus`), the Function calls that Worker directly and never touches the retired hostname.

Dashboard-specific proxies:

- **S&P 100** (`functions/sp100-capex-dashboard/[[path]].js`). `/sp100-capex-dashboard/data/*` is proxied to `https://sp100-financial-tracker.pages.dev` (that project’s GitHub Actions refresh the JSON on weekdays). If the upstream fetch fails or returns non-JSON, the bundled snapshot in the origin tree is served. `/sp100-capex-dashboard/api/stock-price` is answered here from Yahoo Finance, no key required.
- **Market-cap tracker** (`functions/market-cap-tracker/api/nvidia.js`). NVIDIA’s quote comes from Alpha Vantage when `ALPHA_VANTAGE_API_KEY` is set on the Pages project, otherwise from Yahoo Finance. Results are cached for one hour. Crypto prices are fetched by the app itself from CoinGecko.
- **AI IPO** (`origins/ai-ipo/`). The page loads live `data.json` from [avalidurl.github.io/ai-ipo/data.json](https://avalidurl.github.io/ai-ipo/data.json) (that repo refreshes once a day from Polymarket, Kalshi, and Manifold) and falls back to a bundled snapshot if the request fails. There is no Pages Function or `_redirects` proxy for this feed; the request is made by the page.

Other product Functions (`functions/curb/`, `functions/ishtar/`, `functions/launch/`, `functions/numetal/`, and so on) follow the same `originOnRequest` pattern: only API, health, MCP, feed, and similar paths are proxied; everything else is the static mount.

## Domain retirement

Three apex zones — `numetal.xyz`, `gokhan.vc`, `agentbounty.dev` — and their `www` hosts are retired. Traffic is handled in two layers, in this order:

1. **Cloudflare Bulk Redirect list `old_estate_moved`.** Mapped paths 301 to the matching page on `gokhanturhan.com`, query string preserved. Product subdomains (`curb.numetal.xyz`, `ishtar.numetal.xyz`, …) are on this list, including their important subpaths (docs, legal, decks, specific journal posts). The list itself lives in the Cloudflare account, not in this repo. Examples that are also checked by `scripts/site-health.sh`:

   | Old URL | Goes to |
   | --- | --- |
   | `curb.numetal.xyz/` | `https://gokhanturhan.com/curb/` |
   | `curb.numetal.xyz/docs` | `https://gokhanturhan.com/curb/docs` |
   | `ishtar.numetal.xyz/` | `https://gokhanturhan.com/ishtar/` |
   | `numetal.xyz/terms` | `https://gokhanturhan.com/numetal/legal/terms` |
   | `gokhan.vc/blog` | `https://gokhanturhan.com/journal` |
   | `agentbounty.dev/blog` | `https://gokhanturhan.com/agentbounty/blog` |

2. **`estate-archive` Worker** (`workers/estate-archive/`). Bound to `numetal.xyz/*`, `www.numetal.xyz/*`, `gokhan.vc/*`, `www.gokhan.vc/*`, `agentbounty.dev/*`, and `www.agentbounty.dev/*`. Mapped paths never reach it. On an **exact root** (`https://numetal.xyz/` and the other five roots) it serves a `noindex` landing: a short monospace notice, a canonical to `https://gokhanturhan.com/`, and a **10-second countdown** (script plus `<meta http-equiv="refresh">` fallback). Any other unmapped path **301s to `https://gokhanturhan.com/{project}/{path}/`**, preserving the subpath and query: `/numetal/…` for `numetal.xyz`, `/gokhan-vc/…` for `gokhan.vc`, `/agentbounty/…` for `agentbounty.dev`. A trailing slash is added when the path looks like a page, not a file.

API paths on `numetal.xyz` (`/api`, `/fees/data`, `/health`, and the other prefixes listed in the Worker) are passed through to the `numetal-site` Worker via a `NUMETAL_SITE` service binding, so the Pages Functions on this site can still reach the original backends. `goekhan.vc` is not a zone and does not resolve; the live domain is `gokhan.vc`.

Former addresses are stored as plain text on each product page (`estate.ts` `former` field) and are never linked. `/moved/` is a short index of the retirement.

## Deploy

Production is the Cloudflare Pages project **`gokhan-memex`**, Git-connected to this repository. A push to `main` starts a new production build: `npm run build`, output directory `dist/`. The build is:

```text
astro check && astro build && node scripts/gen-og.mjs && node scripts/generate-cv-pdf.mjs && node scripts/stamp-sw.mjs && node scripts/mount-origins.mjs
```

Pages automatically serves `functions/` as Pages Functions. The deployed header and redirect files are **`public/_headers`** and **`public/_redirects`** (copied into `dist/`). The repo-root `_headers` and `_redirects` are not published — do not edit those as if they were live.

`public/_headers` sets, among other things: Content-Security-Policy, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `X-XSS-Protection`, HSTS with `preload`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (camera, microphone, geolocation off), and `Cross-Origin-Opener-Policy: same-origin-allow-popups`. HTML is `Cache-Control: public, max-age=0, must-revalidate`; hashed `/_astro/*` assets are immutable.

**`www` → apex.** `https://www.gokhanturhan.com/` 301s to `https://gokhanturhan.com/`. That rule is on the Cloudflare zone, not in this repo. Canonical URLs in the HTML always use the apex.

**Cache purge.** A Pages deploy does not purge the zone edge cache. The apex can still serve a cached HTML document (`cf-cache-status: HIT`; a TTL around two hours is common). Wrangler does not purge it either. After a deploy you care about seeing immediately, use **Dashboard → Caching → Purge Everything**, or the Zone Cache Purge API. The latest `*.pages.dev` deployment URL always shows what just built.

The only GitHub Actions workflow in this repo is CodeQL (`.github/workflows/codeql.yml`), on push and pull request to `main`, plus a weekly schedule. It does not deploy the site.

The `estate-archive` Worker is a separate Cloudflare Worker deploy from `workers/estate-archive/`; it is not part of the Pages build.

## Repository map

```text
gokhan-memex/
├── src/
│   ├── content/blog/           Journal posts (MDX / MD)
│   ├── content/projects/       Filing bodies shown at /<slug>/file/
│   ├── content/config.ts       Collection schemas (blog + projects)
│   ├── data/estate.ts          Product register: slugs, lines, former hosts, facts
│   ├── data/origins.ts         Slugs that have a /<slug>/file/ filing (most also mount origins/<slug>/ at /<slug>/; coins does not)
│   ├── data/cv.ts              CV source (HTML, JSON, Markdown, and the PDF all read this)
│   ├── lib/person.ts           Person JSON-LD and the single sameAs list
│   ├── lib/post-dates.ts       dateModified = updatedDate ?? git commit ?? publishDate
│   ├── lib/llms.ts             llms.txt and llms-full.txt
│   ├── layouts/BaseLayout.astro  Register chrome: nav, Ink, Sans, Menu, footer, JSON-LD
│   ├── pages/                  Routes: journal, products, links, CV, RSS, search, llms, …
│   ├── pages/[...product].astro  Product pages and /<slug>/file/ filings
│   ├── pages/links.astro       Links page (section data is inline here)
│   ├── components/             Register and journal components
│   ├── styles/                 House tokens (critical.css) and globals
│   ├── archive/                Ported snapshots used as fallbacks for some subpages
│   └── legal/                  Legal copies (CURB, Ishtar, Numetal, Gökhan Ventures)
├── origins/                    Original standalone apps, mounted onto dist/<slug>/
├── functions/                  Pages Functions: API proxies, quote-card PNG, OG middleware
├── pages-lib/estate-proxy.js   Shared same-origin proxy (API / WebSocket, service bindings)
├── workers/estate-archive/     10-second countdown Worker for retired apex/www hosts
├── public/                     Static assets; this is what Pages publishes for headers
│   ├── _headers                Security and cache headers (the live file)
│   ├── _redirects              Legacy and short-alias redirects (the live file)
│   ├── index.html              Homepage (static; there is no src/pages/index.astro)
│   ├── register.css / .js      Register stylesheet and Ink / Sans / Menu behaviour
│   ├── quote-share.js          Journal highlight sharing
│   ├── sw.js                   Service worker (CACHE_VERSION stamped at build)
│   ├── turkish-art-blob/       Static mount
│   └── ethereum-doomsday/      Static mount (synced from avalidurl/ethereum-doomsday-tracker)
├── scripts/
│   ├── gen-og.mjs              Build-time OG cards
│   ├── og-render.mjs           Shared card renderer
│   ├── generate-cv-pdf.mjs     Reprint the CV PDF from the built /cv/ page
│   ├── stamp-sw.mjs            Content-hash the service worker cache name
│   ├── mount-origins.mjs       Copy origins/ onto dist/ after the Astro build
│   ├── prepare-origins.py      Rebuild origins/ from captured original designs
│   └── site-health.sh          Live health checks (apps, filings, retired-domain landings)
├── draft-posts/                Journal drafts not in the Astro collection
├── .github/workflows/          CodeQL only
├── astro.config.mjs            Site URL, sitemap, rehype plugins, Cloudflare Images hash
└── package.json                Scripts and dependencies
```

## Local development

Needs **Node.js >= 18.20.8**. The CV PDF step in a full production build also needs Chrome or Chromium (or `CHROME_PATH`).

```bash
git clone https://github.com/avalidurl/gokhan-memex.git
cd gokhan-memex
npm install

# Dev server — http://localhost:4321
npm run dev

# Production build (typecheck, Astro, OG cards, CV PDF, service worker, origin mount)
npm run build

# Preview the production build
npm run preview

# OG cards only
npm run og
```

`npm run dev` serves the Astro app. Origin mounts, OG generation, the CV PDF, and the service-worker stamp run only in `npm run build`. Pages Functions (stock prices, quote cards, product API proxies) do not run under `astro dev`; they need a Pages or Wrangler environment.

## Environment variables

None of these are required to render the static site. Names only; values stay in the Cloudflare project or your own shell.

| Name | Where | What it is for |
| --- | --- | --- |
| `ALPHA_VANTAGE_API_KEY` | Pages project (Functions) | Optional NVIDIA quote source for the market-cap tracker. If unset, the Function uses Yahoo Finance. |
| `CHROME_PATH` | Build machine | Optional path to Chrome/Chromium for `scripts/generate-cv-pdf.mjs`. If unset, the script looks for a normal install. The build fails if no Chrome is found. |
| `NUMETAL` | Pages **service binding** | Optional. Direct Function calls to the `numetal-site` Worker, avoiding Bulk Redirects on `numetal.xyz`. |
| `JESUS` | Pages **service binding** | Optional. Direct Function calls to the `personal-jesus` Worker. |
| `NUMETAL_SITE` | `estate-archive` Worker **service binding** | Pass-through of API paths on `numetal.xyz` to `numetal-site`. |
| `EXA_API_KEY` | Local shell only | Used by `scripts/create-exa-art-market-webset.mjs`, a one-off research script. Not used to build or deploy the site. |

`ASSETS` is the automatic Pages binding the quote-card Function uses to load fonts; you do not set it.

## Fork it

1. **Clone and install.** Fork this repository, then:

   ```bash
   git clone https://github.com/<you>/gokhan-memex.git
   cd gokhan-memex
   npm install
   npm run dev
   ```

2. **Replace identity and site config.** Keep the structure; change the name, domain, and profiles. The exact files to edit:

   | What | File |
   | --- | --- |
   | Site URL, sitemap extras, Cloudflare Images account hash | `astro.config.mjs` (`site`, `CDN_HASH`, `customPages`). Point `site` at your domain. Remove or replace the Images plugin if you do not have a Cloudflare Images account. |
   | Product register, former hosts, facts, filing pointers | `src/data/estate.ts` |
   | Which slugs mount an original app | `src/data/origins.ts` |
   | Links page sections and handles | `src/pages/links.astro` (the live data; `src/data/links.json` is unused) |
   | Person JSON-LD and the `sameAs` list | `src/lib/person.ts` |
   | CV | `src/data/cv.ts` and `src/lib/cv-md.ts` |
   | Homepage (static HTML, including its own JSON-LD) | `public/index.html` |
   | Register chrome: name, role, footer, analytics | `src/layouts/BaseLayout.astro` (includes a Google Analytics id; replace or remove it) |
   | Favicon and face | `public/favicon.svg`, `public/favicon-avatar.jpg`, `public/favicon-32.png`, `public/avatar-icon-192.png`, `public/avatar-icon-512.png`, `public/apple-touch-icon.png`, `public/apple-touch-icon-152x152.png`, `public/manifest.json` |
   | OG copy (name, kicker, description baked into the home card) | `scripts/gen-og.mjs`; fonts and colours in `scripts/og-render.mjs` and `functions/lib/quote-card.js` |
   | Journal posts | `src/content/blog/` (and `draft-posts/` if you keep the draft workflow) |
   | Filing bodies | `src/content/projects/` |
   | robots, humans, security contact | `public/robots.txt`, `public/humans.txt`, `public/.well-known/security.txt` |
   | Agent-facing summary text | `src/lib/llms.ts` |
   | In-repo redirects and headers | `public/_redirects`, `public/_headers` |

3. **Remove or replace products.** For each product you do not want: drop it from `src/data/estate.ts` and `src/data/origins.ts`, delete `origins/<slug>/`, delete `functions/<slug>/` if it exists, and remove the matching filing in `src/content/projects/` and any tree under `src/archive/`. To add your own app, put a static build in `origins/<your-slug>/`, add the slug to `origins.ts` and `estate.ts`, and add a Function only if the app needs a same-origin API proxy.

4. **Deploy to your own Cloudflare Pages project.** In the Cloudflare dashboard, create a Pages project, connect your fork, set the build command to `npm run build` and the output directory to `dist`. Production should build from `main`. Node 18.20.8 or newer is required; the CV PDF step needs Chrome on the build image (or skip that script if you will ship a pre-made PDF).

5. **Set your domain.** Attach your domain to the Pages project. Add a **www → apex** 301 on the zone (this repo does not contain that rule). Put the apex URL in `astro.config.mjs` `site` and in the Person / homepage canonicals. After the first deploy, if the apex still shows old HTML, purge the zone cache as described above.

6. **Optional Workers and bindings.** Only if you are retiring your own domains the same way: deploy `workers/estate-archive/` (edit the hostnames and fallback prefixes first), create a Bulk Redirect list for mapped paths, and set service bindings (`NUMETAL`, `JESUS`, `NUMETAL_SITE`) plus `ALPHA_VANTAGE_API_KEY` if you need them. A fork of a personal journal does not need any of this.

## Related repositories

- [avalidurl.github.io](https://avalidurl.github.io/) — visual sitemap of gokhanturhan.com ([repo](https://github.com/avalidurl/avalidurl.github.io))
- [github.com/avalidurl](https://github.com/avalidurl) — profile ([avalidurl/avalidurl](https://github.com/avalidurl/avalidurl))
- [github.com/gokhan-vc](https://github.com/gokhan-vc) — studio org
- [huggingface.co/gokhanturhan](https://huggingface.co/gokhanturhan) — models, Spaces, and datasets

Public product repos this site mounts, files, or points to:

| Repo | What it is |
| --- | --- |
| [gokhan-vc/heartprefs](https://github.com/gokhan-vc/heartprefs) | HeartPrefs signed matching-intent standard |
| [gokhan-vc/numetal-website](https://github.com/gokhan-vc/numetal-website) | Numetal studio site and fee engine |
| [gokhan-vc/launch-router](https://github.com/gokhan-vc/launch-router) | Launch pad aggregator |
| [avalidurl/tickerline](https://github.com/avalidurl/tickerline) | Claude Code ticker-tape status line |
| [avalidurl/turkish-art-blob](https://github.com/avalidurl/turkish-art-blob) | Source for `/turkish-art-blob/` |
| [avalidurl/ethereum-doomsday-tracker](https://github.com/avalidurl/ethereum-doomsday-tracker) | Source for `/ethereum-doomsday/` |
| [avalidurl/sp100-financial-tracker](https://github.com/avalidurl/sp100-financial-tracker) | S&P 100 dashboard (data upstream for `/sp100-capex-dashboard/`) |
| [avalidurl/market-cap-tracker](https://github.com/avalidurl/market-cap-tracker) | NVIDIA vs crypto tracker (source for `/market-cap-tracker/`) |
| [avalidurl/ai-ipo](https://github.com/avalidurl/ai-ipo) | AI IPO prediction-market dashboard and daily `data.json` |

Also public and linked from the register: [gokhan-vc/ccru-mirror](https://github.com/gokhan-vc/ccru-mirror), [gokhan-vc/rebase](https://github.com/gokhan-vc/rebase), [avalidurl/feedhub](https://github.com/avalidurl/feedhub), [avalidurl/greek-alphabet-anki](https://github.com/avalidurl/greek-alphabet-anki).

## License

There is no `LICENSE` file in this repository, and GitHub does not record a license.

**Site content is all rights reserved** © Gökhan Turhan. **The code license is not specified yet.** Do not assume you may reuse the source beyond GitHub’s terms for viewing a public repo. If you want to use the code or the writing, contact [contact@gokhan.vc](mailto:contact@gokhan.vc).
