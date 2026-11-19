#!/bin/bash
# Split a job's filled PROMPT.md at the line "===== AFTER STORYBOARD =====" into PROMPT.md (launch to storyboard)
# and PROMPT_AFTER_STORYBOARD.md (read when STORYBOARD APPROVED arrives). Run it once, after filling the template.
# usage: scripts/split-prompt.sh <job-slug>
# Everything before the marker stays in PROMPT.md (the marker line and the blank lines just above it are dropped);
# everything after it goes to PROMPT_AFTER_STORYBOARD.md. Nothing is written if either part still holds "{{".
# A job that is already split (no marker, PROMPT_AFTER_STORYBOARD.md present) is left as it is.
set -euo pipefail
cd "$(dirname "$0")/.."
SLUG=${1:?usage: scripts/split-prompt.sh <job-slug>}
DIR=jobs/$SLUG
[ -d "$DIR" ] || { echo "No job $SLUG"; exit 1; }
[ -f "$DIR/PROMPT.md" ] || { echo "$DIR/PROMPT.md is missing: fill the builder prompt template first"; exit 1; }
python3 - "$DIR" <<'PY'
import os, sys
job = sys.argv[1]
MARK = "===== AFTER STORYBOARD ====="
src, dst = os.path.join(job, "PROMPT.md"), os.path.join(job, "PROMPT_AFTER_STORYBOARD.md")
lines = open(src, encoding="utf-8").read().splitlines(keepends=True)
at = [i for i, l in enumerate(lines) if l.rstrip("\r\n") == MARK]
if len(at) > 1:
    sys.exit(f"{src} has {len(at)} '{MARK}' lines (lines {', '.join(str(i + 1) for i in at)}); it needs exactly one")
if not at:
    if os.path.exists(dst):
        print(f"{job} is already split: {src} has no marker and {dst} exists. Nothing to do."); sys.exit(0)
    sys.exit(f"{src} has no '{MARK}' line and there is no {dst}: fill the current builder prompt template again")
if os.path.exists(dst):
    sys.exit(f"{dst} already exists while {src} still has the marker: move PROMPT_AFTER_STORYBOARD.md aside, then run this again")
cut = at[0]
before, after = lines[:cut], lines[cut + 1:]
while before and not before[-1].strip():
    before.pop()
if before and not before[-1].endswith("\n"):
    before[-1] += "\n"
problems = [f"{src} line {n}: still holds '{{{{': {l.strip()[:80]}"
            for part, first in ((before, 1), (after, cut + 2)) for n, l in enumerate(part, first) if "{{" in l]
if problems:
    print("\n".join(problems))
    sys.exit("Unfilled slots, so nothing was written. Fill them in PROMPT.md, then run this again.")
for path, part in ((dst, after), (src, before)):
    open(path + ".tmp", "w", encoding="utf-8").write("".join(part))
    os.replace(path + ".tmp", path)
words = lambda part: len("".join(part).split())
print(f"Split {src}: PROMPT.md {words(before)} words, PROMPT_AFTER_STORYBOARD.md {words(after)} words")
PY
