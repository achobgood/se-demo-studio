#!/bin/bash
#
# Fetch a cisco.com documentation page and print readable text.
#
#   scripts/fetch-cisco-source.sh <url>              extracted text
#   scripts/fetch-cisco-source.sh <url> --links      linked chapter URLs, then text
#   scripts/fetch-cisco-source.sh <url> --grep BFD   only lines mentioning a term
#
# WHY THIS EXISTS. cisco.com returns HTTP 403 to the WebFetch tool and HTTP 200 to
# curl. An agent told to verify claims against pages it cannot open may invent a
# fluent quote and attribute it to a real Cisco URL. Use this script, not WebFetch.
# If several agents all report "the sources are unreadable", check with a different
# tool before believing it: they may share the same broken tool.
#
# TWO THINGS THAT SURPRISE PEOPLE:
#   1. Some configuration guides are BOOK INDEXES that list chapter titles only.
#      Use --links to find the chapter and fetch that.
#   2. Some sources (data sheets) are PDFs. Stripping HTML tags from a PDF yields
#      binary that looks like text. PDFs need pdftotext (brew install poppler).

set -uo pipefail
URL="${1:?usage: fetch-cisco-source.sh <url> [--links|--grep TERM]}"
MODE="${2:-}"
TERM_ARG="${3:-}"

TMP=$(mktemp)
CODE=$(curl -s -m 45 -L -o "$TMP" -w "%{http_code}" "$URL")
if [ "$CODE" != "200" ]; then
  echo "FETCH_FAILED http=$CODE url=$URL"
  rm -f "$TMP"
  exit 1
fi

if file "$TMP" | grep -qi "pdf"; then
  echo "=== TEXT (pdf) ==="
  if command -v pdftotext >/dev/null 2>&1; then
    pdftotext -layout "$TMP" - 2>/dev/null | { [ "$MODE" = "--grep" ] && grep -i -- "$TERM_ARG" || cat; }
  else
    echo "FETCH_FAILED pdf needs pdftotext (brew install poppler); use another source page meanwhile. url=$URL"
    rm -f "$TMP"
    exit 1
  fi
  rm -f "$TMP"
  exit 0
fi

if [ "$MODE" = "--links" ]; then
  echo "=== LINKED PAGES ==="
  python3 - "$TMP" "$URL" <<'PY'
import re, sys
from urllib.parse import urljoin
html = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
base = sys.argv[2]
seen = set()
for href, text in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, re.S | re.I):
    label = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", text)).strip()
    if not label or len(label) < 4:
        continue
    full = urljoin(base, href)
    if "cisco.com" not in full or full in seen:
        continue
    seen.add(full)
    # Label first, URL last, separated by a fixed delimiter. Chapter titles contain
    # spaces, so anything splitting this on whitespace produces garbage URLs.
    print(f"{label}  ->  {full}")
PY
fi

echo "=== TEXT ==="
python3 - "$TMP" "$MODE" "$TERM_ARG" <<'PY'
import re, sys, html as H
raw = open(sys.argv[1], encoding="utf-8", errors="ignore").read()
mode, term = sys.argv[2], sys.argv[3]
raw = re.sub(r"<script.*?</script>|<style.*?</style>", " ", raw, flags=re.S | re.I)
text = H.unescape(re.sub(r"<[^>]+>", " ", raw))
text = re.sub(r"[ \t]+", " ", text)
text = re.sub(r"\n\s*\n+", "\n", text)
if mode == "--grep" and term:
    hits = [ln.strip() for ln in re.split(r"(?<=[.!?])\s+|\n", text) if term.lower() in ln.lower()]
    print("\n".join(hits) if hits else f"NO_MATCH for {term}")
else:
    print(text.strip())
PY
rm -f "$TMP"
