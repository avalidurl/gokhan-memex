#!/usr/bin/env python3
"""Build origins/ — original, usable designs for live product pages.

Run from the repo (or any cwd); writes into <repo>/origins/.
Sources: Nov 9 2026 full-page captures in /workspace/archive-plan,
original product repos next to them, and still-live static assets on
the retired hosts (HTML 301s; CSS/JS/images still 200).
"""
from __future__ import annotations

import json
import re
import shutil
import sys
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
ARCHIVE = Path("/workspace/archive-plan")
REPOS = ARCHIVE / "repos"
RAW = ARCHIVE / "raw"
OUT = REPO / "origins"
SITE = "https://gokhanturhan.com"

MAILBOX = re.compile(
    r"\b[A-Za-z0-9._%+-]+@(?:[a-z0-9-]+\.)*(?:numetal\.xyz|gokhan\.vc|gokhanturhan\.com)\b"
)

# Paths that already live on this site and must not be prefixed.
# Only skip paths that already belong to the host site (memex chrome),
# not names the original products used on their own hosts (/blog, /favicon, …).
SKIP_PREFIX = (
    "curb", "ishtar", "ubu", "reclaim", "plaintext", "numetal", "launch",
    "accumulator", "rebase", "apex", "booster", "clank-tape", "heartprefs",
    "products", "product-drafts", "journal", "media", "publishing", "about",
    "cv", "archive", "_astro", "register", "home.js", "register-boot",
    "register.css", "register.js", "table-desk", "sw.js", "manifest.json",
)

BAR_CSS = """.gt-bar{all:initial;display:block;box-sizing:border-box;width:100%;border-bottom:1px solid #141414;background:#f6f5f1;color:#141414;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;padding:6px 14px;letter-spacing:.02em;z-index:9999;position:relative}
.gt-bar a{color:#002fa7;text-decoration:none}.gt-bar a:hover{text-decoration:underline}.gt-bar b{font-weight:600}
@media (prefers-color-scheme:dark){.gt-bar{background:#141414;color:#f3f2ec;border-color:#f3f2ec}.gt-bar a{color:#8eb0ff}}"""

CURB_STATS = """
<script>
(function(){
  function set(label, value){
    document.querySelectorAll('.spec-cell').forEach(function(c){
      var k = c.querySelector('.k, span');
      if(!k || k.textContent.toLowerCase().indexOf(label) === -1) return;
      var b = c.querySelector('b');
      if(b && value != null) b.textContent = value;
    });
  }
  fetch('/curb/v1/offers').then(function(r){return r.json()}).then(function(d){
    var n = (d.offers || []).filter(function(o){return o.status === 'open'}).length;
    set('open offers', String(n));
  }).catch(function(){});
  fetch('/curb/health').then(function(r){return r.json()}).then(function(d){
    if(d && d.matches != null) set('matches', String(d.matches));
    if(d && (d.feePct != null || d.feeBps != null)) {
      var pct = d.feePct != null ? d.feePct : (d.feeBps / 100).toFixed(1);
      set('protocol fee', pct + (String(pct).indexOf('%') >= 0 ? '' : '%'));
    }
  }).catch(function(){});
})();
</script>
"""


def skip_re():
    inner = "|".join(re.escape(s) for s in SKIP_PREFIX)
    return re.compile(
        rf"""(\s(?:href|src|action|poster|content)=\\?["'])/(?!/|{inner})""",
        re.I,
    )


ATTR_RE = skip_re()
FETCH_RE = re.compile(r"""(fetch\(\s*["'`])/(?!/)""")
URL_RE = re.compile(r"""(url\(\s*["']?)/(?!/)""")
LOC_RE = re.compile(r"""(location\.href\s*=\s*\(?\s*["'`])/(?!/)""")


def rewrite_root(text: str, prefix: str) -> str:
    def attr(m: re.Match) -> str:
        return m.group(1) + prefix + "/"

    text = ATTR_RE.sub(attr, text)
    text = FETCH_RE.sub(rf"\1{prefix}/", text)
    text = URL_RE.sub(rf"\1{prefix}/", text)
    text = LOC_RE.sub(rf"\1{prefix}/", text)
    # APEX race board: wss://location.host/api/live
    text = text.replace(
        'location.host + "/api/',
        f'location.host + "{prefix}/api/',
    )
    text = text.replace(
        "location.host + '/api/",
        f"location.host + '{prefix}/api/",
    )
    return text


def bar(prefix: str, name: str) -> str:
    return (
        f'<div class="gt-bar" role="navigation" aria-label="Bureau">'
        f'<a href="/">Gökhan Turhan</a> · <a href="/products/">Products</a> · '
        f'<b>{name}</b> · <a href="{prefix}/file/">Bureau file</a></div>'
    )


def process_html(html: str, *, prefix: str, name: str, canonical: str, extra: str = "") -> str:
    html = MAILBOX.sub("contact@gokhan.vc", html)
    html = rewrite_root(html, prefix)
    # canonical / og:url → this site
    if re.search(r'rel=["\']canonical["\']', html, re.I):
        html = re.sub(
            r'(<link\s+rel=["\']canonical["\']\s+href=["\'])[^"\']+(["\'])',
            rf"\g<1>{canonical}\2",
            html,
            count=1,
            flags=re.I,
        )
    else:
        html = re.sub(
            r"(</head>)",
            f'<link rel="canonical" href="{canonical}">\n\\1',
            html,
            count=1,
            flags=re.I,
        )
    html = re.sub(
        r'(property=["\']og:url["\']\s+content=["\'])[^"\']+(["\'])',
        rf"\g<1>{canonical}\2",
        html,
        flags=re.I,
    )
    # Bureau bar
    if "gt-bar" not in html:
        if re.search(r"</head>", html, re.I):
            html = re.sub(r"</head>", f"<style>{BAR_CSS}</style>\n</head>", html, count=1, flags=re.I)
        if re.search(r"<body[^>]*>", html, re.I):
            html = re.sub(r"(<body[^>]*>)", rf"\1\n{bar(prefix, name)}", html, count=1, flags=re.I)
        else:
            html = bar(prefix, name) + html
    if extra:
        if re.search(r"</body>", html, re.I):
            html = re.sub(r"</body>", extra + "\n</body>", html, count=1, flags=re.I)
        else:
            html += extra
    return html


def process_text(text: str, prefix: str) -> str:
    text = MAILBOX.sub("contact@gokhan.vc", text)
    return rewrite_root(text, prefix)


def write(path: Path, data, *, binary: bool = False):
    path.parent.mkdir(parents=True, exist_ok=True)
    if binary:
        path.write_bytes(data)
    elif isinstance(data, bytes):
        path.write_bytes(data)
    else:
        path.write_text(data, encoding="utf-8")
    print(f"  wrote {path.relative_to(OUT.parent.parent)} ({path.stat().st_size} bytes)")


def copy_file(src: Path, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)
    print(f"  copied {src.name} → {dest.relative_to(OUT.parent.parent)} ({dest.stat().st_size} bytes)")


def download(url: str, dest: Path, timeout: int = 30) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "gokhan-memex-origins/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            status = getattr(r, "status", 200)
            ctype = r.headers.get("content-type", "")
            data = r.read()
            if status >= 300 or "text/html" in ctype and dest.suffix in {".css", ".js", ".woff2", ".png", ".svg", ".gif", ".jpg"}:
                print(f"  SKIP download {url} → {status} {ctype}")
                return False
            dest.write_bytes(data)
            print(f"  downloaded {url} → {dest.relative_to(OUT.parent.parent)} ({len(data)} bytes)")
            return True
    except Exception as e:
        print(f"  FAIL download {url}: {e}")
        return False


def relink_media(html: str, mapping: dict[str, str]) -> str:
    for a, b in mapping.items():
        html = html.replace(a, b)
    return html


def prepare_curb():
    prefix, name = "/curb", "CURB"
    html = (RAW / "sub_curb.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/curb/", extra=CURB_STATS)
    write(OUT / "curb/index.html", html)
    pub = REPOS / "inference-swap/public"
    for src, dest in [
        (pub / "assets/curb-favicon-32.png", OUT / "curb/assets/curb-favicon-32.png"),
        (pub / "assets/curb-sun.svg", OUT / "curb/assets/curb-sun.svg"),
        (pub / "assets/curb-sun.png", OUT / "curb/assets/curb-sun.png"),
        (pub / "assets/og-curb-launch.png", OUT / "curb/assets/og-curb-launch.png"),
        (pub / "curb-sun.svg", OUT / "curb/curb-sun.svg"),
        (pub / "skill.md", OUT / "curb/skill.md"),
    ]:
        if src.exists():
            copy_file(src, dest)
        else:
            download(f"https://curb.numetal.xyz/{dest.relative_to(OUT / 'curb')}", dest)


def prepare_ishtar():
    prefix, name = "/ishtar", "Ishtar"
    marketing = REPOS / "ishtar-website/marketing"
    skip_dir = {"og"}  # OG image generator HTML, not public pages
    skip_file = {"_redirects", "robots.txt", "sitemap.xml"}
    for src in marketing.rglob("*"):
        if src.is_dir():
            continue
        rel = src.relative_to(marketing)
        if rel.parts and rel.parts[0] in skip_dir:
            continue
        if src.name in skip_file:
            continue
        dest = OUT / "ishtar" / rel
        if src.suffix.lower() in {".html", ".htm"}:
            html = src.read_text(encoding="utf-8", errors="replace")
            # subpage canonical
            sub = "" if src.name == "index.html" and len(rel.parts) == 1 else "/" + str(rel.with_suffix("") if src.name != "index.html" else rel.parent).replace("\\", "/")
            if sub.endswith("/index"):
                sub = sub[: -len("index")]
            if not sub.endswith("/"):
                sub += "/"
            if sub == "/./" or sub == "//":
                sub = "/"
            canonical = f"{SITE}/ishtar{sub if sub != '/' else '/'}"
            html = process_html(html, prefix=prefix, name=name, canonical=canonical)
            write(dest, html)
        elif src.suffix.lower() in {".css", ".js", ".xml", ".txt", ".md"}:
            write(dest, process_text(src.read_text(encoding="utf-8", errors="replace"), prefix))
        else:
            copy_file(src, dest)


def prepare_ubu():
    prefix, name = "/ubu", "UBU · CLINAMEN"
    html = (RAW / "sub_ubu.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    books = {
        "/ubu/reader/the-bureau-reader.epub": "/media/archive/ubu/ubu/the-bureau-reader-complete.epub",
        "/ubu/reader/the-bureau-reader.pdf": "/media/archive/ubu/ubu/the-bureau-reader-complete.pdf",
        "/ubu/reader/book-one-instruments.epub": "/media/archive/ubu/ubu/book-one-instruments.epub",
        "/ubu/reader/book-one-instruments.pdf": "/media/archive/ubu/ubu/book-one-instruments.pdf",
        "/ubu/reader/book-two-the-docket.epub": "/media/archive/ubu/ubu/book-two-the-docket.epub",
        "/ubu/reader/book-two-the-docket.pdf": "/media/archive/ubu/ubu/book-two-the-docket.pdf",
        "/ubu/reader/book-three-the-company-docket.epub": "/media/archive/ubu/ubu/book-three-the-company-docket.epub",
        "/ubu/reader/book-three-the-company-docket.pdf": "/media/archive/ubu/ubu/book-three-the-company-docket.pdf",
        "/ubu/hrl-1.1.txt": "/media/archive/ubu/hrl-1.1.txt",
    }
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/ubu/")
    html = relink_media(html, books)
    write(OUT / "ubu/index.html", html)
    reader = (RAW / "api/ubu_numetal_xyz_reader_").read_text(encoding="utf-8", errors="replace")
    reader = process_html(reader, prefix=prefix, name=name, canonical=f"{SITE}/ubu/reader/")
    reader = relink_media(reader, books)
    write(OUT / "ubu/reader/index.html", reader)
    download("https://ubu.numetal.xyz/favicon.svg", OUT / "ubu/favicon.svg")
    logo = REPO / "public/media/archive/ubu/ubu/logo.svg"
    if logo.exists():
        copy_file(logo, OUT / "ubu/logo.svg")


def prepare_reclaim():
    prefix, name = "/reclaim", "Reclaim"
    html = (RAW / "sub_reclaim.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/reclaim/")
    write(OUT / "reclaim/index.html", html)


def prepare_plaintext():
    prefix, name = "/plaintext", "plaintext"
    html = (RAW / "sub_plaintext.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/plaintext/")
    write(OUT / "plaintext/index.html", html)
    # stylesheet: prefer the source (authoritative), fall back to the live host
    style_src = REPOS / "plaintext/site/src/style.js"
    if style_src.exists():
        text = style_src.read_text(encoding="utf-8")
        m = re.search(r"export const STYLE = `([^`]*)`", text, re.S)
        css = m.group(1).strip() if m else None
        if css:
            write(OUT / "plaintext/style.css", process_text(css, prefix))
    if not (OUT / "plaintext/style.css").exists():
        download("https://plaintext.numetal.xyz/style.css", OUT / "plaintext/style.css")
    assets = REPOS / "plaintext/site/public-assets"
    for name_ in ("favicon.png", "apple-touch-icon.png", "og.png", "favicon.ico"):
        src = assets / name_
        if src.exists():
            copy_file(src, OUT / "plaintext" / name_)
        else:
            download(f"https://plaintext.numetal.xyz/{name_}", OUT / "plaintext" / name_)


def prepare_numetal():
    prefix, name = "/numetal", "Numetal"
    html = (RAW / "sub_numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/numetal/")
    write(OUT / "numetal/index.html", html)
    pub = REPOS / "numetal-website/public"
    for fname in [
        "favicon.svg", "favicon-32.png", "favicon-180.png", "favicon.ico",
        "newsletter-xmtp.js", "blog-collapse.js", "popups.js", "fees.js",
        "airdrop.js", "airdrop.json", "airdrop-status.json", "og.png",
        "llms.txt", "feed.xml",
    ]:
        src = pub / fname
        if src.exists():
            data = src.read_bytes()
            if fname.endswith((".js", ".xml", ".txt", ".json", ".css", ".svg")):
                try:
                    text = process_text(data.decode("utf-8"), prefix)
                    write(OUT / "numetal" / fname, text)
                    continue
                except UnicodeDecodeError:
                    pass
            write(OUT / "numetal" / fname, data, binary=True)


def prepare_launch():
    prefix, name = "/launch", "Launch"
    html = (RAW / "sub_launch.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/launch/")
    write(OUT / "launch/index.html", html)
    tg = REPOS / "launch-router/packages/telegram"
    for fname in ("favicon.svg", "nautilus.svg"):
        src = tg / "public" / fname
        if src.exists():
            copy_file(src, OUT / "launch" / fname)
    skill = REPO / "public/media/archive/launch/launch/skill.md"
    if skill.exists():
        copy_file(skill, OUT / "launch/skill.md")
    # Mini-app: landing is the main design. Copy app.html + its CSS so /app.html works.
    app = tg / "app.html"
    css = tg / "src/miniapp.css"
    if app.exists():
        ahtml = app.read_text(encoding="utf-8")
        ahtml = ahtml.replace("./src/miniapp.css", "miniapp.css")
        ahtml = process_html(ahtml, prefix=prefix, name=name, canonical=f"{SITE}/launch/app/")
        write(OUT / "launch/app/index.html", ahtml)
        write(OUT / "launch/app.html", ahtml)
    if css.exists():
        write(OUT / "launch/app/miniapp.css", process_text(css.read_text(encoding="utf-8"), prefix))
        write(OUT / "launch/miniapp.css", process_text(css.read_text(encoding="utf-8"), prefix))


def prepare_accumulator():
    prefix, name = "/accumulator", "Accumulator"
    pub = REPOS / "accumulator-site/public"
    for src in pub.rglob("*"):
        if not src.is_file():
            continue
        rel = src.relative_to(pub)
        dest = OUT / "accumulator" / rel
        # Serve docs/terms/privacy at clean paths as well as *.html
        if src.suffix.lower() == ".html":
            html = src.read_text(encoding="utf-8", errors="replace")
            sub = "/" if src.name == "index.html" else f"/{src.stem}/"
            html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/accumulator{sub}")
            write(dest, html)
            if src.name != "index.html" and src.name != "404.html":
                write(OUT / "accumulator" / src.stem / "index.html", html)
        elif src.suffix.lower() in {".css", ".js"}:
            write(dest, process_text(src.read_text(encoding="utf-8"), prefix))
        else:
            copy_file(src, dest)


def prepare_rebase():
    prefix, name = "/rebase", "REBASE"
    html = (RAW / "sub_rebase.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/rebase/")
    write(OUT / "rebase/index.html", html)
    docs = (RAW / "sub_docs.rebase.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    docs = process_html(docs, prefix=prefix, name=name, canonical=f"{SITE}/rebase/docs/")
    write(OUT / "rebase/docs/index.html", docs)
    site = REPOS / "rebase/site"
    if (site / "logo.png").exists():
        copy_file(site / "logo.png", OUT / "rebase/logo.png")
    if (site / "addresses.json").exists():
        copy_file(site / "addresses.json", OUT / "rebase/addresses.json")


def prepare_apex():
    prefix, name = "/apex", "APEX PROTOCOL"
    html = (RAW / "sub_apex.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/apex/")
    # Use the gifs already in this repo instead of duplicating ~6 MB.
    html = relink_media(html, {
        "/apex/gifs/lights_out.gif": "/media/archive/apex/apex/lights_out.gif",
        "/apex/gifs/box_box_box.gif": "/media/archive/apex/apex/box_box_box.gif",
        "/apex/gifs/night_stint.gif": "/media/archive/apex/apex/night_stint.gif",
        "/apex/gifs/yellow_sector_2.gif": "/media/archive/apex/apex/yellow_sector_2.gif",
    })
    write(OUT / "apex/index.html", html)
    for path in (
        "style.css",
        "app.js",
        "favicon.svg",
        "fonts/PixelifySans-var.woff2",
        "fonts/IBMPlexSans-var.woff2",
        "fonts/IBMPlexSans-Italic-var.woff2",
    ):
        dest = OUT / "apex" / path
        ok = download(f"https://apex.numetal.xyz/{path}", dest)
        if ok and path.endswith((".css", ".js")):
            write(dest, process_text(dest.read_text(encoding="utf-8", errors="replace"), prefix))


def prepare_booster():
    prefix, name = "/booster", "BOOSTER"
    html = (RAW / "sub_booster.numetal.xyz.html").read_text(encoding="utf-8", errors="replace")
    html = process_html(html, prefix=prefix, name=name, canonical=f"{SITE}/booster/")
    write(OUT / "booster/index.html", html)
    for path in ("style.css", "favicon.svg", "logo-1024.png"):
        dest = OUT / "booster" / path
        media = REPO / "public/media/archive/booster/booster" / Path(path).name
        if media.exists():
            copy_file(media, dest)
        else:
            download(f"https://booster.numetal.xyz/{path}", dest)
        if dest.exists() and path.endswith(".css"):
            write(dest, process_text(dest.read_text(encoding="utf-8"), prefix))


def prepare_clank_tape():
    prefix, name = "/clank-tape", "Clank Tape"
    src_root = REPOS / "clank-tape"
    if not src_root.exists():
        src_root = Path("/workspace/clank-tape")
    for src in src_root.rglob("*"):
        if not src.is_file():
            continue
        if src.name in {".gitignore", ".nojekyll", "README.md"} or ".git" in src.parts:
            continue
        if src.suffix in {".py"}:
            continue
        rel = src.relative_to(src_root)
        dest = OUT / "clank-tape" / rel
        if src.suffix.lower() in {".html", ".css", ".js", ".json", ".md", ".txt"}:
            text = src.read_text(encoding="utf-8", errors="replace")
            if src.suffix.lower() == ".html":
                text = process_html(text, prefix=prefix, name=name, canonical=f"{SITE}/clank-tape/")
            else:
                text = process_text(text, prefix)
            write(dest, text)
        else:
            copy_file(src, dest)


PREPARE = [
    ("curb", prepare_curb),
    ("ishtar", prepare_ishtar),
    ("ubu", prepare_ubu),
    ("reclaim", prepare_reclaim),
    ("plaintext", prepare_plaintext),
    ("numetal", prepare_numetal),
    ("launch", prepare_launch),
    ("accumulator", prepare_accumulator),
    ("rebase", prepare_rebase),
    ("apex", prepare_apex),
    ("booster", prepare_booster),
    ("clank-tape", prepare_clank_tape),
]


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    manifest = []
    for slug, fn in PREPARE:
        print(f"\n=== {slug} ===")
        fn()
        manifest.append({"slug": slug, "name": slug})
    names = {
        "curb": "CURB",
        "ishtar": "Ishtar",
        "ubu": "UBU · CLINAMEN",
        "reclaim": "Reclaim",
        "plaintext": "plaintext",
        "numetal": "Numetal",
        "launch": "Launch",
        "accumulator": "Accumulator",
        "rebase": "REBASE",
        "apex": "APEX PROTOCOL",
        "booster": "BOOSTER",
        "clank-tape": "Clank Tape",
    }
    for m in manifest:
        m["name"] = names[m["slug"]]
    write(OUT / "manifest.json", json.dumps(manifest, indent=2) + "\n")
    print("\nDone.", "origins at", OUT)


if __name__ == "__main__":
    sys.exit(main())
