# Grab frames from a rendered video, to check the file itself rather than the page (references/MOTION.md, Critique).
# usage: python3 lib/grab.py VIDEO OUT_DIR SECONDS...  -> OUT_DIR/v_<seconds>.jpg (says so when a time is past the end)
import os, sys
from common import run_ff
if len(sys.argv) < 4: sys.exit('usage: python3 lib/grab.py VIDEO OUT_DIR SECONDS...')
v, d = sys.argv[1], sys.argv[2]; os.makedirs(d, exist_ok=True)
for s in sys.argv[3:]:
    out = os.path.join(d, 'v_%07.2f.jpg' % float(s))
    if os.path.exists(out): os.remove(out)
    run_ff(['-ss', s, '-i', v, '-frames:v', '1', '-q:v', '3', out])
    print(out if os.path.exists(out) else f'no frame at {s} s (past the end of {v}?)')
