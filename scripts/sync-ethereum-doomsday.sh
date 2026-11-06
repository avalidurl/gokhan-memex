#!/usr/bin/env bash
# Sync built static assets from avalidurl/ethereum-doomsday-tracker into public/.
# Usage:
#   TRACKER_DIR=/path/to/ethereum-doomsday-tracker ./scripts/sync-ethereum-doomsday.sh
# Or from sibling checkout:
#   ./scripts/sync-ethereum-doomsday.sh ../ethereum-doomsday-tracker
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${1:-${TRACKER_DIR:-}}"
if [[ -z "${SRC}" ]]; then
  echo "Pass tracker checkout path or set TRACKER_DIR" >&2
  exit 1
fi
SRC="$(cd "$SRC" && pwd)"
test -f "$SRC/package.json"
(cd "$SRC" && npm ci && npm test && npm run build)
rm -rf "$ROOT/public/ethereum-doomsday"
mkdir -p "$ROOT/public/ethereum-doomsday"
cp -a "$SRC/dist/." "$ROOT/public/ethereum-doomsday/"
rm -f "$ROOT/public/ethereum-doomsday/_headers"
find "$ROOT/public/ethereum-doomsday" -name '*.map' -delete
SHA="$(cd "$SRC" && git rev-parse HEAD)"
cat > "$ROOT/public/ethereum-doomsday/SOURCE.txt" << EOT
Source: https://github.com/avalidurl/ethereum-doomsday-tracker
Commit: ${SHA}
Built: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Mount: static copy under Cloudflare Pages project gokhan-memex (GitHub → Pages).
Do not edit files here by hand; rebuild from the tracker repo and re-sync.
EOT
echo "Synced ethereum-doomsday @ ${SHA}"
