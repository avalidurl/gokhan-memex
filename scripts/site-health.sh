#!/usr/bin/env bash
# Weekly (and on-demand) health check for gokhanturhan.com and the retired
# domain roots. Exits non-zero if anything important is broken so GitHub
# can notify on failure only.
set -u
FAIL=0
REPORT=""

check() {
  local name="$1" url="$2" expect_code="$3" expect_re="${4:-}"
  local hdr body code loc ctype
  body=$(mktemp)
  hdr=$(mktemp)
  if ! curl -sS -o "$body" -D "$hdr" -m 25 --max-redirs 0 -A 'gokhan-memex-health/1.0' \
      -w '%{http_code} %{redirect_url}' "$url" > "${body}.meta" 2>"${body}.err"; then
    REPORT+="FAIL  $name  curl error: $(tr '\n' ' ' < "${body}.err")\n"
    FAIL=1
    rm -f "$body" "$hdr" "${body}.meta" "${body}.err"
    return
  fi
  code=$(awk '{print $1}' "${body}.meta")
  loc=$(awk '{print $2}' "${body}.meta")
  ctype=$(grep -i '^content-type:' "$hdr" | tr -d '\r' | sed 's/^[Cc]ontent-[Tt]ype:[[:space:]]*//')
  local ok=1
  if [[ "$code" != "$expect_code" ]]; then
    ok=0
    REPORT+="FAIL  $name  $url  got HTTP $code (want $expect_code)"
    [[ -n "$loc" ]] && REPORT+=" location=$loc"
    REPORT+="\n"
  fi
  if [[ -n "$expect_re" ]] && ! grep -E -q -- "$expect_re" "$body" "$hdr" "${body}.meta"; then
    ok=0
    REPORT+="FAIL  $name  $url  response did not match /$expect_re/\n"
  fi
  if [[ $ok -eq 1 ]]; then
    REPORT+="OK    $name  HTTP $code ${loc:+-> $loc} ${ctype}\n"
  else
    FAIL=1
  fi
  rm -f "$body" "$hdr" "${body}.meta" "${body}.err"
}


check_absent() {
  local name="$1" url="$2" expect_code="$3" absent_re="$4"
  local hdr body code
  body=$(mktemp)
  hdr=$(mktemp)
  if ! curl -sS -o "$body" -D "$hdr" -m 25 --max-redirs 0 -A 'gokhan-memex-health/1.0' \
      -w '%{http_code}' "$url" > "${body}.meta" 2>"${body}.err"; then
    REPORT+="FAIL  $name  curl error: $(tr '\n' ' ' < "${body}.err")\n"
    FAIL=1
    rm -f "$body" "$hdr" "${body}.meta" "${body}.err"
    return
  fi
  code=$(cat "${body}.meta")
  local ok=1
  if [[ "$code" != "$expect_code" ]]; then
    ok=0
    REPORT+="FAIL  $name  $url  got HTTP $code (want $expect_code)\n"
  fi
  if grep -E -q -- "$absent_re" "$body" "$hdr"; then
    ok=0
    REPORT+="FAIL  $name  $url  response unexpectedly matched /$absent_re/\n"
  fi
  if [[ $ok -eq 1 ]]; then
    REPORT+="OK    $name  HTTP $code (no /$absent_re/)\n"
  else
    FAIL=1
  fi
  rm -f "$body" "$hdr" "${body}.meta" "${body}.err"
}

echo "== gokhanturhan.com =="
check homepage          "https://gokhanturhan.com/"                    200 "Gökhan Turhan"
check rss               "https://gokhanturhan.com/rss.xml"             200 "Gökhan Turhan"
check sitemap_index     "https://gokhanturhan.com/sitemap-index.xml"   200 "sitemap-0.xml"
check sitemap_redirect  "https://gokhanturhan.com/sitemap.xml"         301 "gokhanturhan.com/sitemap-index.xml"
check www_root          "https://www.gokhanturhan.com/"                301 "https://gokhanturhan.com/"
check www_path          "https://www.gokhanturhan.com/curb/?x=1"        301 "https://gokhanturhan.com/curb/"
check curb              "https://gokhanturhan.com/curb/"               200 "CURB"
check curb_og           "https://gokhanturhan.com/curb/"               200 "og-curb-launch.png"
check curb_file         "https://gokhanturhan.com/curb/file/"          200
check curb_privacy      "https://gokhanturhan.com/curb/privacy"        301 "/curb/legal/privacy"
check curb_terms        "https://gokhanturhan.com/curb/terms"          301 "/curb/legal/terms"
check curb_dispatch     "https://gokhanturhan.com/curb/dispatch"       301 "/journal"
check curb_legal        "https://gokhanturhan.com/curb/legal/privacy/"  200
check ishtar            "https://gokhanturhan.com/ishtar/"             200 "Ishtar"
check ishtar_og         "https://gokhanturhan.com/ishtar/"             200 "gokhanturhan.com/ishtar/og.png"
check ishtar_robots     "https://gokhanturhan.com/ishtar/robots.txt"   200 "Sitemap:"
check ishtar_sitemap    "https://gokhanturhan.com/ishtar/sitemap.xml"  200 "gokhanturhan.com/ishtar/"
check ishtar_privacy    "https://gokhanturhan.com/ishtar/docs/legal/privacy-policy/" 200
check file_numetal      "https://gokhanturhan.com/numetal/file/"       200
check file_ubu          "https://gokhanturhan.com/ubu/file/"           200
check file_gokhan_vc    "https://gokhanturhan.com/gokhan-vc/file/"     200
check drafts_index      "https://gokhanturhan.com/product-drafts/"     200 'name="robots" content="index, follow'
check_absent drafts_noindex_gone "https://gokhanturhan.com/product-drafts/" 200 "noindex"
check sitemap_drafts    "https://gokhanturhan.com/sitemap-0.xml"       200 "gokhanturhan.com/product-drafts/"
check robots_txt        "https://gokhanturhan.com/robots.txt"          200 "Sitemap: https://gokhanturhan.com/sitemap-index.xml"
check_absent robots_no_drafts_disallow "https://gokhanturhan.com/robots.txt" 200 "Disallow:"

echo "== product APIs =="
check numetal_fees        "https://gokhanturhan.com/numetal/fees/data"    200 '"price"'
check numetal_events      "https://gokhanturhan.com/numetal/fees/events"  200
check jesus_join_get      "https://gokhanturhan.com/jesus/join"           405 "method not allowed"
check reclaim_health      "https://gokhanturhan.com/reclaim/health"       200 '"ok":true'
check curb_health         "https://gokhanturhan.com/curb/health"          200 '"ok":true'
check ishtar_api          "https://gokhanturhan.com/ishtar/api/"          403 "locked"

echo "== retired roots (archive page) =="
check numetal_root      "https://numetal.xyz/"                         200 "archived"
check numetal_www       "https://www.numetal.xyz/"                     200 "archived"
check gokhanvc_root     "https://gokhan.vc/"                           200 "archived"
check gokhanvc_www      "https://www.gokhan.vc/"                       200 "archived"
check numetal_countdown "https://numetal.xyz/"                         200 "10"
check numetal_terms     "https://numetal.xyz/terms"                    301 "gokhanturhan.com/numetal/legal/terms"
check numetal_random    "https://numetal.xyz/this-path-is-not-mapped"  301 "gokhanturhan.com/numetal/"
check curb_old          "https://curb.numetal.xyz/"                    301 "gokhanturhan.com/curb/"
check curb_docs_old     "https://curb.numetal.xyz/docs"                301 "gokhanturhan.com/curb/docs"
check ishtar_old        "https://ishtar.numetal.xyz/"                  301 "gokhanturhan.com/ishtar/"
check gokhanvc_blog     "https://gokhan.vc/blog"                       301 "gokhanturhan.com/journal"
check agentbounty_root      "https://agentbounty.dev/"                         200 "archived"
check agentbounty_www       "https://www.agentbounty.dev/"                     200 "archived"
check agentbounty_countdown "https://agentbounty.dev/"                         200 "10"
check agentbounty_blog      "https://agentbounty.dev/blog"                     301 "gokhanturhan.com/agentbounty/blog"
check agentbounty_random    "https://agentbounty.dev/this-path-is-not-mapped"  301 "gokhanturhan.com/agentbounty/"
check agentbounty_live      "https://gokhanturhan.com/agentbounty/"            200
check agentbounty_file      "https://gokhanturhan.com/agentbounty/file/"       200

echo
printf "%b" "$REPORT"
if [[ $FAIL -ne 0 ]]; then
  echo
  echo "site-health: $FAIL check group(s) failed"
  exit 1
fi
echo "site-health: all checks passed"
