#!/usr/bin/env python3
"""Import a fresh UBU build (the ubu-site `public/` tree) into this repo.

    python3 scripts/import-ubu.py --src <ubu-site>/public [--repo .]

Writes origins/ubu/{index.html,reader/index.html,favicon.svg,logo.svg} and
public/media/archive/ubu/ (books, covers, logos, og card, licence text).
Idempotent: files are only touched when their bytes change, so a re-run on an
unchanged build leaves a clean worktree. Never deletes anything.

Not prepare-origins.py: that recaptures every product from /workspace/archive-plan
and wipes origins/. This only refreshes UBU from the build tool's output.
"""
from __future__ import annotations

import argparse
import sys as _s
_s.dont_write_bytecode = True
import importlib.util
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("prepare_origins", HERE / "prepare-origins.py")
po = importlib.util.module_from_spec(spec)
spec.loader.exec_module(po)  # defines helpers only; main() is guarded

SITE = "https://gokhanturhan.com"
MEDIA = "/media/archive/ubu/ubu"
OLD = "https://ubu.numetal.xyz"


def media_path(url_path: str) -> str | None:
    """Old-host root path (already prefixed /ubu/…) -> its file under /media, or None."""
    m = re.fullmatch(r"/ubu/reader/(the-bureau-reader)\.(pdf|epub)", url_path)
    if m:
        return f"{MEDIA}/the-bureau-reader-complete.{m.group(2)}"
    m = re.fullmatch(r"/ubu/reader/([a-z0-9-]+\.(?:pdf|epub|png))", url_path)
    if m:
        return f"{MEDIA}/{m.group(1)}"
    m = re.fullmatch(r"/ubu/((?:logo[a-z0-9-]*\.(?:png|svg))|og\.png)", url_path)
    if m and m.group(1) != "logo.svg":
        return f"{MEDIA}/{m.group(1)}"
    if url_path == "/ubu/hrl-1.1.txt":
        return "/media/archive/ubu/hrl-1.1.txt"
    return None


def fix_html(html: str, canonical: str, *, reader: bool) -> str:
    html = po.strip_ubu_annex(html)
    html = po.process_html(html, prefix="/ubu", name="UBU · CLINAMEN", canonical=canonical)
    # book / logo / licence links -> files hosted under /media
    html = re.sub(
        r'(["\'(])(/ubu/(?:reader/[a-z0-9.-]+\.(?:pdf|epub|png)|logo[a-z0-9-]*\.(?:png|svg)|og\.png|hrl-1\.1\.txt))(?=["\')])',
        lambda m: m.group(1) + (media_path(m.group(2)) or m.group(2)),
        html,
    )
    # absolute old-host URLs that are real resources or links (not quoted corpus text)
    html = html.replace(f"{OLD}/og.png", f"{SITE}{MEDIA}/og.png")
    html = html.replace(f"{OLD}/logo-badge-512.png", f"{SITE}{MEDIA}/logo-badge-512.png")
    html = re.sub(r'href="https://ubu\.numetal\.xyz/?"', 'href="/ubu/"', html)
    # the Bureau does not host third-party archives
    html = re.sub(
        r"we host the archive \(<a [^>]*>ccru\.numetal\.xyz</a>, vault mirror at <code>[^<]*</code>\); ",
        "",
        html,
    )
    html = html.replace("itself. See CCRU glossary.</li>", "itself.</li>")
    return html


def put(path: Path, data: bytes, changed: list[str]) -> None:
    if path.exists() and path.read_bytes() == data:
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    changed.append(str(path))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True, help="ubu-site public/ directory")
    ap.add_argument("--repo", default=str(HERE.parent))
    a = ap.parse_args()
    src, repo = Path(a.src), Path(a.repo)
    media = repo / "public/media/archive/ubu/ubu"
    changed: list[str] = []

    for rel, canon, reader in (("index.html", f"{SITE}/ubu/", False),
                               ("reader/index.html", f"{SITE}/ubu/reader/", True)):
        html = fix_html((src / rel).read_text(encoding="utf-8"), canon, reader=reader)
        put(repo / "origins/ubu" / rel, html.encode("utf-8"), changed)

    for f in sorted((src / "reader").iterdir()):
        if f.suffix in {".pdf", ".epub", ".png"} and not f.name.startswith("_"):
            dest = media_path(f"/ubu/reader/{f.name}")
            put(repo / "public" / dest.lstrip("/"), f.read_bytes(), changed)
    for name in ("og.png", "logo-1024.png", "logo-badge-1024.png", "logo-badge-512.png",
                 "logo-badge.svg", "logo-paper-1024.png", "logo.svg"):
        if (src / name).exists():
            put(media / name, (src / name).read_bytes(), changed)
    for name in ("favicon.svg", "logo.svg"):
        if (src / name).exists():
            put(repo / "origins/ubu" / name, (src / name).read_bytes(), changed)
    if (src / "hrl-1.1.txt").exists():
        t = (src / "hrl-1.1.txt").read_text(encoding="utf-8")
        t = t.replace(f"{OLD}/hrl-1.1.txt", f"{SITE}/media/archive/ubu/hrl-1.1.txt").replace(f"{OLD}/", f"{SITE}/ubu/")
        put(repo / "public/media/archive/ubu/hrl-1.1.txt", t.encode("utf-8"), changed)

    for c in changed:
        print("  updated", Path(c).relative_to(repo))
    print(f"UBU import: {len(changed)} file(s) changed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
