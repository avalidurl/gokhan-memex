# Gökhan Memex

A personal **memex** — a networked knowledge garden, portfolio, and research archive for [Gökhan Turhan](https://gokhanturhan.com). The site captures essays, interviews, dashboards, and exploratory projects orbiting stablecoins, tokenization, AGI timelines, conceptual art, prediction markets, and adjacent frontier technologies. Designed as a fast, privacy-aware, offline-ready reference that scales from personal notebook to public publication hub.

## Features

- **Modern Astro Stack** — Astro 5 with content collections, MDX support, TypeScript, and Tailwind CSS. shadcn/ui-inspired components ported to Astro for consistent primitives.
- **Digital Garden Architecture** — Journal, archive, lists, links, and portfolio sections with shared taxonomy, rich metadata, and SEO-friendly permalinks.
- **Offline-First PWA** — Custom service worker, offline status banner, and `/offline` management UI for cached content.
- **Search & Discovery** — Client-side command palette (Cmd/Ctrl‑K) powered by RSS feed for instant search.
- **SEO & GEO Ready** — Structured data (JSON-LD), canonical URLs, Open Graph/Twitter cards, RSS, sitemap, `llms.txt` for AI crawlers, and `robots.txt` directives.
- **Security Headers** — Configured via `_headers` for X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, HSTS, Referrer-Policy, and Permissions-Policy.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Astro 5](https://astro.build) (static output) |
| Language | [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com), [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) |
| Content | [MDX](https://mdxjs.com) via `astro:content`, JSON data feeds |
| Icons | [Lucide](https://lucide.dev) via `lucide-astro` |
| Syntax Highlighting | [Shiki](https://shiki.style) (github-dark-dimmed theme) |
| Deployment | [Cloudflare Pages](https://pages.cloudflare.com) |

## Dependencies & Credits

### Core Framework

| Package | Version | Description |
|---------|---------|-------------|
| [astro](https://astro.build) | ^5.13.2 | The web framework for content-driven websites |
| [@astrojs/mdx](https://docs.astro.build/en/guides/integrations-guide/mdx/) | ^4.3.4 | MDX integration for Astro |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) | ^4.0.7 | RSS feed generation |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | ^3.2.0 | Sitemap generation |
| [@astrojs/tailwind](https://docs.astro.build/en/guides/integrations-guide/tailwind/) | ^5.1.1 | Tailwind CSS integration |
| [@astrojs/check](https://docs.astro.build/en/guides/typescript/) | ^0.9.4 | Type checking for Astro |

### Styling & UI

| Package | Version | Description |
|---------|---------|-------------|
| [tailwindcss](https://tailwindcss.com) | ^3.4.13 | Utility-first CSS framework |
| [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) | ^0.5.15 | Beautiful typographic defaults for prose |
| [class-variance-authority](https://cva.style) | ^0.7.0 | Component variant management |
| [clsx](https://github.com/lukeed/clsx) | ^2.1.1 | Utility for constructing className strings |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | ^2.5.4 | Merge Tailwind classes without conflicts |
| [lucide-astro](https://lucide.dev) | ^0.456.0 | Beautiful & consistent icons |

### Content Processing

| Package | Version | Description |
|---------|---------|-------------|
| [rehype-slug](https://github.com/rehypejs/rehype-slug) | ^6.0.0 | Add `id` attributes to headings |
| [rehype-autolink-headings](https://github.com/rehypejs/rehype-autolink-headings) | ^7.1.0 | Automatically add links to headings |

### Development

| Package | Version | Description |
|---------|---------|-------------|
| [typescript](https://www.typescriptlang.org) | ^5.9.2 | TypeScript language |
| [@types/node](https://www.npmjs.com/package/@types/node) | ^22.8.6 | Node.js type definitions |

### Design System Inspiration

- [shadcn/ui](https://ui.shadcn.com) — Component patterns and design tokens ported to Astro

### Typography

- [Source Sans Pro](https://fonts.google.com/specimen/Source+Sans+Pro) — Headings and UI
- [Crimson Text](https://fonts.google.com/specimen/Crimson+Text) — Body text and prose
- [JetBrains Mono](https://www.jetbrains.com/lp/mono/) — Code blocks

## Project Structure

```
gokhan-memex/
├── public/                  # Static assets (images, favicon, manifest, robots.txt, llms.txt)
│   ├── .well-known/        # security.txt
│   └── blog/images/        # Blog post images
├── src/
│   ├── components/         # Astro components (Navigation, UI primitives, embeds)
│   │   ├── embeds/         # YouTube, Vimeo, Bandcamp, Spotify, etc.
│   │   └── ui/             # shadcn-style UI components
│   ├── content/            # MDX collections
│   │   ├── blog/           # Journal posts
│   │   └── projects/       # Project documentation
│   ├── data/               # JSON data (links, lists)
│   ├── layouts/            # BaseLayout with meta, structured data, theme
│   ├── lib/                # Utilities (analytics, service-worker, utils)
│   ├── pages/              # Astro pages (routes)
│   └── styles/             # critical.css, globals.css
├── dist/                   # Build output (generated)
├── _headers                # Cloudflare/Netlify security headers
├── _redirects              # Redirect rules
├── astro.config.mjs        # Astro configuration
├── tailwind.config.mjs     # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Local Development

**Prerequisites:**
- Node.js >= 18.20.8
- npm 10.x+

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Content Authoring

### Journal Posts

Create MDX files in `src/content/blog/` with frontmatter:

```mdx
---
title: "Post Title"
description: "Brief description for SEO and previews"
publishDate: 2026-01-05
author: "Gökhan Turhan"
category: "Finance & Markets"
tags: ["crypto", "stablecoins", "defi"]
featured: false
draft: false
heroImage: "/blog/images/my-image.webp"
heroImageAlt: "Image description"
readingTime: 5
---

Content goes here...
```

### Available Categories

- Finance & Markets
- Knowledge Patterns
- Builder Log
- Conceptual Art
- Interviews
- Productivity

### Embed Components

Use rich media embeds in MDX:

```mdx
<YouTubeEmbed id="video-id" />
<VimeoEmbed id="video-id" />
<SpotifyEmbed uri="spotify:track:xxx" />
<BandcampEmbed albumId="123" />
<TwitterEmbed id="tweet-id" />
```

## SEO & Discoverability

The site includes:

- **Sitemap** — Auto-generated at `/sitemap-index.xml`
- **RSS Feed** — Available at `/rss.xml`
- **robots.txt** — Crawler directives with sitemap reference
- **llms.txt** — AI crawler manifest for GEO (Generative Engine Optimization)
- **humans.txt** — Site credits and team info
- **security.txt** — Vulnerability disclosure contact
- **JSON-LD** — Structured data for Person, Article, and WebSite schemas
- **Open Graph & Twitter Cards** — Social sharing metadata

## Deployment

The site builds to static HTML/CSS/JS in `dist/`. Currently deployed on **Cloudflare Pages**.

```bash
npm run build
```

Ensure your host serves:
- `_headers` for security headers and caching rules
- `_redirects` for any redirect rules

## Security

Configured headers via `_headers`:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS with preload)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation disabled)

## Offline Support

- Service worker caches key pages for offline access
- Visit `/offline` to manage cached content
- PWA manifest enables "Add to Home Screen"

## License

All site content © 2026 Gökhan Turhan. Source code shared for reference; contact the author for reuse permissions or collaboration inquiries.

---

Built with [Astro](https://astro.build) • Styled with [Tailwind CSS](https://tailwindcss.com) • Deployed on [Cloudflare Pages](https://pages.cloudflare.com)
