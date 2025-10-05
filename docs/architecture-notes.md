# Architecture Notes (Private)

Status: internal reference only, do **not** push to public remotes.

## Critical Styles Refactor

- Snapshot the existing inline `<style>` block inside `src/layouts/BaseLayout.astro`; classify each rule as token, utility, or one-off.
- Maintain a checklist to confirm that every class/variable has an eventual home after refactor.
- Target outcome: inline block contains only minimal reset + essential variables.

## Design Token Migration

- Catalog light and dark CSS variables (`:root`, `.dark`) with their HSL values and semantics.
- Move token definitions into `tailwind.config.mjs` (`theme.extend.colors`, `fontFamily`, `borderRadius`, spacing if needed).
- Prefer mapping Tailwind entries to CSS variables (`hsl(var(--foreground))`) so ThemeProvider continues to function.
- Document any tokens that must stay as raw variables due to script usage.

## Utility Coverage Audit

- Compare manual utility classes (e.g., `.container`, `.md:flex`, `.supports-[backdrop-filter]`) with Tailwind defaults.
- Remove duplicates by relying on Tailwind-generated utilities.
- For unsupported patterns, extend Tailwind via variants/plugins or isolate them in a dedicated stylesheet.

## Supplemental CSS Strategy

- If custom selectors remain, place them in `src/styles/critical.css` (or similar) and configure Astro for inlining.
- Keep supplemental CSS minimal and version-controlled separately from Tailwind config changes.

## Typography & Layout Defaults

- Shift global typography rules into Tailwind’s base layer via `@layer base` in `src/styles/globals.css`.
- Rely on Tailwind utilities for margins/spacing wherever possible.
- Validate heading/body font assignments through Tailwind rather than manual CSS.

## Font Loading Adjustments

- Remove body-wide `visibility: hidden` gating; keep content visible by default.
- Use `document.fonts.ready` (with fallback) to add a `fonts-loaded` class only for cosmetic tweaks.
- Ensure font `<link>` tags leverage `font-display: swap` for instant text rendering.
- Test behavior with JS disabled and on slow networks.

## Testing & Verification Checklist

- `npm run dev` and toggle ThemeProvider to verify light/dark palette accuracy.
- Manually inspect high-traffic pages (home, journal, archive, portfolio) for regressions.
- Simulate NoScript / slow network to confirm progressive enhancement.
- `npm run build` and validate build artifacts for CSS duplication or missing tokens.

## Documentation & Change Tracking

- Update this file whenever architectural assumptions change; keep it private.
- Note follow-up items, gaps, or decisions deferred to future iterations.
- Capture before/after metrics (inline CSS size, load timings) for internal accountability.

---

### 2025-09-29 Update

- Critical CSS now lives in `src/styles/critical.css` as pure tokens + minimal base resets. All layout and typography utilities moved to Tailwind (`globals.css`, config) to prevent double-definition.
- Font loading uses progressive enhancement; body stays visible with system serif fallback until custom fonts resolve. Verified that build output drops the previous `visibility: hidden` gate.
- `@layer base` in `globals.css` scoped to typography only; global link underline removed to restore component-specific styling.
- Outstanding follow-up: add automated visual regression or manual checklist for light/dark theme verification on key pages. Manual NoScript/slow-network check still pending for next session.

