# Original product designs

These are the usable original sites for the live products, served at
`/<slug>/` on gokhanturhan.com. The uniform Bureau register for each
product is kept at `/<slug>/file/`.

After `astro build`, `scripts/mount-origins.mjs` copies this tree over
`dist/<slug>/` (it never overwrites `dist/<slug>/file/`).

**Coins is not in this tree.** `/coins/` is the Astro register
(`src/components/coins/`, data in `src/data/coins.json`), and
`/coins/file/` is a short guide. `mount-origins.mjs` will skip `coins`
even if a stale origin copy is put back here.

To refresh from captures and source repos (needs `/workspace/archive-plan`
and, for a few assets, the still-live files on the retired hosts):

```
python3 scripts/prepare-origins.py          # phase 1 slugs
python3 scripts/prepare-origins-more.py     # remaining slugs, Vocs docs, Launch bundle; does not wipe
```

Do not run those on the Cloudflare Pages build; the prepared files are
committed here so the build is self-contained.

`origins/` is excluded from `astro check` / TypeScript (see `tsconfig.json`)
so the bundled Vocs and Vite assets are not typechecked.
