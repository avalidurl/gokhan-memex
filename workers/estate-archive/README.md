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

The worker is bound to those four exact-root routes only. All other paths
on these hosts, and every project subdomain, stay on the existing
`old_estate_moved` Bulk Redirect list. A zone Redirect Rule catches
unmapped non-root paths on the apex/www hosts and sends them to
`/numetal/` or `/gokhan-vc/`.

`goekhan.vc` is not a zone on this account and does not resolve; the live
domain is `gokhan.vc`.

Do not bind this worker to `numetal.xyz/*` (or the other hosts' `/*`):
that would take API traffic away from `numetal-site` and the other
product Workers that still run on those hostnames for excluded API paths.
