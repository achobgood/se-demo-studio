#!/bin/bash
# Find what earlier jobs learned about a product (L90, L103). Read-only: it never writes or moves a file.
# usage: scripts/find-notes.sh <product words...>     for example: scripts/find-notes.sh cloud control
# A file is listed when it contains every word (case-insensitive). It searches, under the studio root:
#   knowledge/*/          (listed first: the product's platform map and ask routing; a folder named otherwise whose
#                         files hold every word is listed apart, as one that mentions these words)
#   jobs/*/research/*.md, jobs/*/INTERVIEW.md, jobs/*/job.json (title and app_url only), examples/*/*.md
# Everything else is listed newest first with its date, line count, and first matching line.
# The studio root is the nearest folder above the current one that holds .demo-studio, else this script's repo.
set -uo pipefail

[ $# -gt 0 ] || { echo "usage: scripts/find-notes.sh <product words...>   (for example: cloud control)"; exit 2; }
WORDS=$(printf '%s ' "$@" | tr -s ' \t' '\n' | sed '/^$/d')

ROOT=$PWD
while [ "$ROOT" != "/" ] && [ ! -e "$ROOT/.demo-studio" ]; do ROOT=$(dirname "$ROOT"); done
[ -e "$ROOT/.demo-studio" ] || ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT" || exit 1

# has_all <file>: true when the file holds every word
has_all() {
  local w
  while IFS= read -r w; do grep -qiF -- "$w" "$1" || return 1; done <<< "$WORDS"
}
# first_line <file> [nonum]: the first line holding every word, else the first holding the first word
first_line() {
  awk -v nonum="${2:-}" -v words="$(printf '%s' "$WORDS" | tr '\n' ' ')" '
    BEGIN { n = split(tolower(words), w, " ") }
    { l = tolower($0); all = 1
      for (i = 1; i <= n; i++) if (index(l, w[i]) == 0) { all = 0; break }
      p = (nonum ? "" : FNR ": ") $0
      if (all) { print p; found = 1; exit }
      if (!any && index(l, w[1]) > 0) any = p }
    END { if (!found && any) print any }' "$1" | cut -c1-120
}
mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1"; }
row() {  # row <file> [numbered extract to take the matching line from]
  printf '  %s  %5s lines  %s\n' "$(date -r "$1" +%Y-%m-%d)" "$(wc -l < "$1" | tr -d ' ')" "$1"
  if [ $# -gt 1 ]; then printf '      %s\n' "$(first_line "$2" nonum)"; else printf '      %s\n' "$(first_line "$1")"; fi
}

echo "Notes for: $(printf '%s ' "$@")(studio root: $ROOT)"
echo "These are maps, not facts: re-check every fact live before you build on it (L90)."
echo

# 1. knowledge/<product>/: the folder whose name holds every word is the product; a folder where only a file's
#    text holds every word is listed separately, as one that mentions these words
echo "Knowledge folder:"
KFOUND=0; MENTIONS=""
for d in knowledge/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d" | tr '_-' '  ')
  hit=1
  while IFS= read -r w; do printf '%s' "$name" | grep -qiF -- "$w" || { hit=0; break; }; done <<< "$WORDS"
  if [ $hit = 0 ]; then
    for f in "$d"*.md; do [ -f "$f" ] && has_all "$f" && MENTIONS="$MENTIONS $d"; done
    continue
  fi
  KFOUND=1
  for f in "$d"*.md; do [ -f "$f" ] && row "$f"; done
done
[ -d knowledge ] || echo "  no knowledge/ folder in this studio copy"
[ -d knowledge ] && [ $KFOUND = 0 ] && echo "  none named for these words (folders: $(ls knowledge | grep -v '\.md$' | tr '\n' ' '))"
if [ -n "$MENTIONS" ]; then
  echo
  echo "Knowledge folders that mention these words (another product's notes, not this product's folder):"
  printf '%s\n' $MENTIONS | sort -u | while read -r d; do
    for f in "$d"*.md; do [ -f "$f" ] && has_all "$f" && row "$f"; done
  done
fi
echo

# 2. job notes and examples, newest first
LIST=$(mktemp); trap 'rm -f "$LIST" "$LIST.j"' EXIT
for f in jobs/*/research/*.md jobs/*/INTERVIEW.md examples/*/*.md; do
  [ -f "$f" ] && has_all "$f" && echo "$(mtime "$f") $f" >> "$LIST"
done
for f in jobs/*/job.json; do  # only the title and app_url fields count
  [ -f "$f" ] || continue
  grep -nE '"(title|app_url)"' "$f" | sed 's/^\([0-9]*\):/\1: /' > "$LIST.j"
  has_all "$LIST.j" && echo "$(mtime "$f") $f" >> "$LIST"
done
echo "Job research, interviews, and examples, newest first:"
[ -d jobs ] || echo "  no jobs here (this copy has no jobs/ folder; the publishing copy never does)"
if [ -s "$LIST" ]; then
  sort -rn "$LIST" | while read -r _ f; do
    if [ "${f##*/}" = job.json ]; then
      grep -nE '"(title|app_url)"' "$f" | sed 's/^\([0-9]*\):/\1: /' > "$LIST.j"; row "$f" "$LIST.j"
    else row "$f"; fi
  done
else
  echo "  none for these words"
fi
echo
echo "A job's research/PLATFORM_MAP.md or ASK_ROUTING.md newer than knowledge/ is the one to start from."
echo "Next: copy what the new job will use into jobs/<slug>/research/prior/, name it in the researcher brief (the"
echo "builder gives the same files to its explorers), and re-check each fact live before it reaches the storyboard."
