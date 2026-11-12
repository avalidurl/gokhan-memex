#!/usr/bin/env python3
"""After `astro build`, put original designs at /<project>/ and keep the
Bureau register at /<project>/file/.

Idempotent. Never overwrites dist/<slug>/file/. Never touches legal pages
unless the origin itself has a legal/ tree (none currently do).
"""
from __future__ import annotations

import json
import shutil
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DIST = REPO / "dist"
ORIGINS = REPO / "origins"


def main() -> int:
    man_path = ORIGINS / "manifest.json"
    if not man_path.exists():
        print("origins/manifest.json missing — run scripts/prepare-origins.py first", file=sys.stderr)
        return 1
    if not DIST.exists():
        print("dist/ missing — run astro build first", file=sys.stderr)
        return 1
    manifest = json.loads(man_path.read_text())
    for item in manifest:
        slug = item["slug"]
        src = ORIGINS / slug
        dest = DIST / slug
        if not src.exists():
            print(f"SKIP {slug}: no origin tree")
            continue
        dest.mkdir(parents=True, exist_ok=True)
        # If Astro did not emit /file/ (should have), save the current register page.
        file_idx = dest / "file" / "index.html"
        register = dest / "index.html"
        if register.exists() and not file_idx.exists():
            file_idx.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(register, file_idx)
            print(f"  saved register {slug}/index.html → {slug}/file/")
        copied = 0
        for path in src.rglob("*"):
            if not path.is_file():
                continue
            rel = path.relative_to(src)
            parts = rel.parts
            if parts and parts[0] == "file":
                continue
            target = dest / rel
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(path, target)
            copied += 1
        print(f"mounted /{slug}/  ({copied} files from origin)")
    print("origin mount complete")
    return 0


if __name__ == "__main__":
    sys.exit(main())
