#!/bin/bash
# Render the full video in parallel chunks, then join them and add the mixed audio.
# usage: build/render_par.sh out/<name>_v1.mp4 [chunks=8] [mix.wav=out/mix.wav]
# A five-minute render at 8 chunks takes about 5 minutes on an Apple silicon Mac.
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=$1; N=${2:-8}; MIX=${3:-out/mix.wav}
ROOT=$(pwd); while [ ! -f "$ROOT/.demo-studio" ] && [ "$ROOT" != "/" ]; do ROOT=$(dirname "$ROOT"); done
FF="$ROOT/toolkit/node_modules/ffmpeg-static/ffmpeg"
TOTALF=$(python3 -c "import json; print(round(json.load(open('build/cues.json'))['total']*30))")
rm -rf out/chunks; mkdir -p out/chunks
python3 - "$N" "$TOTALF" > out/chunks/plan.txt <<'PY'
import sys
n=int(sys.argv[1]); total=int(sys.argv[2]); per=-(-total//n)
for i in range(n):
  a=i*per; b=min(total,(i+1)*per)
  if a<b: print(i, a, b)
PY
: > out/chunks/list.txt
while read i a b; do
  node build/render.js video out/chunks/c_$i.mp4 30 $a $b > out/chunks/log_$i.txt 2>&1 &
  echo "file 'c_$i.mp4'" >> out/chunks/list.txt
done < out/chunks/plan.txt
wait
if grep -l "PAGEERR\|CONSOLE" out/chunks/log_*.txt >/dev/null 2>&1; then echo "Page errors during render:"; grep -h "PAGEERR\|CONSOLE" out/chunks/log_*.txt | sort -u | head -20; fi
"$FF" -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -c copy out/chunks/video.mp4
if [ -f "$MIX" ]; then
  "$FF" -y -loglevel error -i out/chunks/video.mp4 -i "$MIX" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest "$OUT"
else
  echo "No mix at $MIX; writing picture only."; cp out/chunks/video.mp4 "$OUT"
fi
echo "done: $OUT ($TOTALF frames)"
