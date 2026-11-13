# estate-archive

Cloudflare Worker that serves the archive page on the exact roots of the
retired domains:

- `https://numetal.xyz/`
- `https://www.numetal.xyz/`
- `https://gokhan.vc/`
- `https://www.gokhan.vc/`

Each page is a short, monospace notice that the site has been archived,
links to https://gokhanturhan.com/, and redirects there after a 10-second
countdown (with a meta-refresh fallback). The page is `noindex` and has
a canonical to gokhanturhan.com.

The worker is bound to `numetal.xyz/*`, `www.numetal.xyz/*`,
`gokhan.vc/*` and `www.gokhan.vc/*`. Mapped page paths are still handled
first by the `old_estate_moved` Bulk Redirect list and never reach the
worker. Unmapped non-root paths 301 to `/numetal/` or `/gokhan-vc/`,
preserving the subpath and query string. Excluded API paths on
`numetal.xyz` are passed through to the `numetal-site` Worker via a
service binding (`NUMETAL_SITE`).

`goekhan.vc` is not a zone on this account and does not resolve; the live
domain is `gokhan.vc`.

Project subdomains (curb.numetal.xyz, ishtar.numetal.xyz, …) are not
routed to this worker; they stay on the Bulk Redirect list.
