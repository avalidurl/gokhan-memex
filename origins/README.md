# Original product designs

These are the usable original sites for the live products, served at
`/<slug>/` on gokhanturhan.com. The uniform Bureau register for each
product is kept at `/<slug>/file/`.

After `astro build`, `scripts/mount-origins.mjs` copies this tree over
`dist/<slug>/` (it never overwrites `dist/<slug>/file/`).

To refresh from captures and source repos (needs `/workspace/archive-plan`
and, for a few assets, the still-live files on the retired hosts):

```
python3 scripts/prepare-origins.py
```

Do not run that on the Cloudflare Pages build; the prepared files are
committed here so the build is self-contained.
