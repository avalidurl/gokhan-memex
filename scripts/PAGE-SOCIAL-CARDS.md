# Per-page social cards

`BaseLayout` preserves explicit `image` props. The home page retains its approved
identity/tagline card. Art pages are deliberately excluded from this workstream.
Other pages receive `/og/pages/<content hash>.png`, keyed by path, title,
description and the `page-card-v1` renderer version. Bump that version when
changing the renderer's appearance so cached image URLs change as well.

`npm run build` renders these PNGs after Astro, before the service-worker hash.
It also fills missing journal `/og/<slug>.png` assets, so new posts do not depend
on a local Chrome or macOS `sips`. Existing journal/custom imagery is not replaced.
Generated assets live in `dist`, not `public`, and are published by the existing
Pages build. No runtime endpoint or external image service is required.

Only real OG titles/descriptions are used. Headlines are measured with the bundled
Unicode font and wrap without clipping; descriptions may use an ellipsis after
two lines. The bundled font is covered by `fonts/LICENSE-DejaVu.txt`.

Run `npm run test:social` for typography, determinism, dimensions and preservation
checks. Visible article hero photography is not modified.
