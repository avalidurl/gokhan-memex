# Gökhan Memex

An evolving "memex" — a networked knowledge garden, portfolio, and research archive for [Gökhan Turhan](https://gokhanturhan.com). The site captures essays, interviews, dashboards, and exploratory projects that orbit stablecoins, tokenization, AGI timelines, conceptual art, and adjacent frontier technologies. It is designed as a fast, privacy-aware, offline-ready reference that can scale from personal notebook to public publication hub.

## Highlights

- **Modern Astro Stack** – Astro 5 with the latest content collections, Markdown/MDX support, TypeScript, and Tailwind CSS. shadcn/ui components are ported to Astro for consistent primitives across pages.
- **Digital Garden Information Architecture** – Journal, archive, lists, links, and portfolio sections share a common taxonomy, rich metadata, and SEO-friendly permalinks.
- **Performance Monitoring Suite** – First-party Core Web Vitals instrumentation, RUM sampling, debug dashboards, and alerting live under `src/lib`. Toggle the overlay via `?debug=performance` while developing.
- **Offline-First Experience** – A custom service worker, offline status banner, and `/offline` control panel manage cached posts, update checks, and manual cache clearing.
- **Search & Discovery** – Client-side command palette powered by the generated RSS feed supports Cmd/Ctrl‑K search, highlight sharing, and deep linking.
- **SEO & PWA Tooling** – Structured data, canonical URLs, Open Graph/Twitter cards, RSS, sitemap, and manifest are emitted by default; the layout preloads fonts with progressive enhancement.

## Tech Stack

| Layer | Tooling |
| --- | --- |
| Framework | [Astro 5](https://astro.build) (static output) |
| Styling | Tailwind CSS 3, shadcn/ui primitives, custom design tokens (`critical.css`) |
| Content | MDX collections via `astro:content`, JSON data feeds |
| Build Utilities | TypeScript, Astro integrations (`@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, `@astrojs/tailwind`) |
| Observability | Custom performance monitor, analytics wrapper, RUM, service worker manager |
| Deployment | Any static host (Netlify, Vercel, Cloudflare, etc.) serving the `dist` directory |

## System Overview

### Layout & Meta Layer

- `src/layouts/BaseLayout.astro` centralizes HTML shell, meta tags, structured data, font loading, theme toggling, and Google Analytics consent logic.
- `critical.css` inlines theme tokens (light/dark palette, typography defaults) for the first paint; `globals.css` defers the full Tailwind build.

### Navigation & Interface

- `Navigation.astro` renders the sticky header, command palette triggers, RSS link, and responsive menu.
- shadcn-derived components live under `src/components/ui`, enabling consistent cards, badges, accordions, inputs, and alerts throughout the site.
- Rich embeds (`src/components/embeds`) wrap platforms like YouTube, Vimeo, Bandcamp, Substack, Mirror, and NFT viewers; they lazy-load to preserve vitals.
- `TextHighlighter.astro` enables quote selection and share-to-social interactions across long-form writing.

### Content Model

- `src/content/blog` holds MDX entries with frontmatter fields (`title`, `description`, `publishDate`, `category`, `tags`, etc.). Astro collections enforce schemas in `src/content/config.ts`.
- `src/content/projects` documents live dashboards and experiments, including the NVIDIA vs Crypto Market Cap tracker and SP100 Financial Tracker.
- `src/data` provides curated lists and link hubs surfaced on their respective pages.

### Performance & Observability

- `src/lib/performance.ts`, `analytics.ts`, `rum.ts`, `performance-dashboard.ts`, and `performance-alerts.ts` combine to gather Core Web Vitals, custom timings, user interaction data, and issue alerts.
- `window.performanceDashboard`, `window.performanceMonitor`, and related globals become available when debug mode is enabled (localhost or `?debug=performance`).

### Offline & Service Worker Layer

- `src/lib/service-worker.ts` orchestrates registration, update cycles, cache inspection, manual cache operations, and network status telemetry.
- `/offline` exposes a management UI that lists cached posts, static pages, and provides controls to refresh or clear caches.

## Local Development

Prerequisites:

- Node.js 20.x (Astro 5 requires active LTS or later)
- npm 10.x (ships with Node 20)

Install dependencies:

```bash
npm install
```

Start the development server (hot reload on port 4321 by default):

```bash
npm run dev
```

Create a production build and analyze output under `dist/`:

```bash
npm run build
```

Preview the built site locally:

```bash
npm run preview
```

## Content Authoring

### Journal Posts

- Add MDX files under `src/content/blog/`.
- Frontmatter example:

```md
---
title: "Building a Memex #1"
description: "Kick-off notes on designing a personal knowledge engine."
publishDate: 2025-07-29
category: "Technology & Data"
tags: ["memex", "knowledge-management"]
featured: true
draft: false
heroImage: "/images/building-a-memex.jpg"
heroImageAlt: "Conceptual memex illustration"
---
```

- Use MDX components (`<TwitterEmbed />`, `<VimeoEmbed />`, `<TextHighlighter />`) as needed. All components map to the design system tokens automatically.

### Projects & Dashboards

- Place MDX dossiers inside `src/content/projects/` with fields for `projectUrl`, `githubUrl`, feature lists, and context.
- Featured projects populate the homepage grid via collection queries.

### Assets & Static Files

- Store images and static assets in `public/`; Astro copies them verbatim to the output.
- Open Graph and RSS thumbnails live under `public/og/` and are referenced by content frontmatter.

## Search & Discovery

- The command palette listens for `Cmd/Ctrl + K` and fetches `/rss.xml` to populate results.
- Highlighted excerpts from posts populate the search suggestions list. Search components live in `src/components/Search.astro`.
- Breadcrumbs, archive pages, and taxonomy indexes are powered by Astro collections for zero-runtime link networks.

## Offline & Privacy Tips

- Visit `/offline` while online to pre-cache high-value posts for travel or low-connectivity scenarios.
- Toggle analytics consent through the privacy notice banner; GA requests remain anonymized and respect opt-outs.
- Service worker debug logs are exposed when `serviceWorkerManager` runs in debug mode (set via constructor options or URL flags during development).

## Deployment Notes

- The app builds to static HTML/CSS/JS under `dist/`; host it on any static-capable platform.
- Ensure the host serves `_headers` and `_redirects` if you need Astro’s recommended caching and redirect behavior (useful on Netlify).
- Update `astro.config.mjs` if deploying to a non-root path or custom domain.

## Project Structure

```
src/
├── components/          # Navigation, embeds, UI primitives, modals, highlight tools
├── content/             # MDX collections for blog posts and projects
├── data/                # Curated link/list JSON data
├── layouts/             # BaseLayout and shared document chrome
├── lib/                 # Performance suite, analytics, service worker helpers, utilities
├── pages/               # Astro pages (home, journal, archive, portfolio, offline, etc.)
├── styles/              # Critical tokens + Tailwind globals
└── types/               # Shared TypeScript types
```

## Maintenance Checklist

- Run `npm run build` before deploying to catch type errors and Astro diagnostics.
- Validate light/dark mode after editing `critical.css` or `globals.css`.
- Regenerate or audit the RSS feed after major content migrations.
- Review performance alerts when shipping heavy embeds or rich media posts.

## License & Attribution

All site content © 2025 Gökhan Turhan. Source code is shared for reference; please contact the author for reuse permissions or collaboration inquiries.



