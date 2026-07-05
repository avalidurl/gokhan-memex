## Learned User Preferences

- Prefer non-destructive handling for library/note cleanup unless deletion is explicitly requested.
- For UI/design previews and local artifacts, prefer Cursor-native or real local HTML previews with clickable local links over static image mockups, download-style handoffs, or workaround-heavy preview hacks unless explicitly requested.
- For research-heavy web tasks, prefer the user's configured MCP/web tools, especially `Exa`, `Firecrawl`, and `Websets`, when available.
- Do not add or preserve a blogroll on the site; the user wants it removed entirely rather than left empty.
- For personal bio, site definition copy, elevator pitches, and CV-adjacent text, prefer plain, direct sentences; avoid stacked abstractions and generic brochure or overly symmetric “model voice” phrasing unless they ask otherwise.
- When calibrating that kind of copy, assume primary readers skew Silicon Valley operators, Wall Street–literate audiences, and American dynamists (systems- and progress-friendly tone, light on anti-commerce moralizing).
- In Cursor, prefer custom subagents use `model: inherit` in their definition so delegated work matches the parent session model when they want the same tier (e.g. Opus) end to end.
- On memex publishing pages, keep section-type labels in consistent title case (e.g. “Experiment”) when they act as headings, not lowercase.

## Learned Workspace Facts

- Calibre library path is `/Users/gokhanturhan/Calibre Library`.
- Primary Obsidian vault path is `/Users/gokhanturhan/Library/Mobile Documents/iCloud~md~obsidian/Documents/zettelkasten`.
- Use `Gökhan Turhan` with `ö` in user-facing site copy, not `Gokhan`.
- CV and cover letter materials for this user are typically worked on under `/Users/gokhanturhan/CVs`.
- Codex Desktop rollout logs for this machine live under `~/.codex/sessions/` (not Cursor `agent-transcripts`); use that path when the user references a Codex session UUID.
- This site’s production deploys use Cloudflare Pages project name `gokhan-memex` (e.g. `wrangler pages deploy` with `--project-name=gokhan-memex`).
- The `gokhan-memex` repo keeps draft or unpublished blog MDX outside the Astro collection in `draft-posts/` at the repo root; publishing means moving files back into `src/content/blog/` and adjusting frontmatter.
- The apex domain can still serve **cached HTML** after a Pages deploy (edge `cf-cache-status: HIT`, ~2h TTL is common). **Wrangler does not purge zone/edge cache**; use Cloudflare **Dashboard → Caching → Purge Everything**, the **Zone: Cache Purge** API, or check the latest `*.pages.dev` deployment URL to verify what just shipped.
- Public site contact, RSS channel fields, and repo `mailto` lines should use **`gokhan@gokhanturhan.com`**, not the legacy **`info@gokhanturhan.com`**.
- Public Telegram links on the site should use `https://t.me/goekhanturhan`.
- When mirroring a published memex journal post into the zettelkasten vault, long-form mirrors have lived under **`writing/essays/`** with a **`canonical`** URL to the live journal post.
- The OpenSea Studio “Numbers” generative pipeline (metadata, media, logo exports) lives in `/Users/gokhanturhan/Projects/numbers`; `gokhan-memex` hosts the public publishing page and copies assets (e.g. logo) from that project’s output when needed.
