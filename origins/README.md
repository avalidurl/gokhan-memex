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

`scripts/prepare-origins.py` deletes this tree and reads an archive path
that is not on the build machine. Do not run it to refresh a live page.

The CURB pages other than the home page and the docs, and the plaintext
pages other than the join app, refresh with
`scripts/refresh-product-snapshots.py`. It reads the product checkouts
you pass in. It does not crawl, and it does not copy the join app.
Jesus already matches its public files aside from the
Bureau bar, so the script leaves it alone. A product patch does not
move the apex until that output is committed and pushed.

Do not run either prepare script on the Cloudflare Pages build; the
prepared files are committed here so the build is self-contained.

`origins/` is excluded from `astro check` / TypeScript (see `tsconfig.json`)
so the bundled Vocs and Vite assets are not typechecked.
