# List the stretches of a rendered video where the picture barely changes, for a person to look at (never a score).
# Samples the video at 10 fps in grey at 320x180 and counts a frame as frozen when fewer than 12 of its pixels differ
# from the previous frame by more than 10 (of 255). Checked on synthetic clips: a 20 px dot moving 140 px/s, or a
# 100 by 28 px word appearing, counts as change; a still frame counts as frozen. Prints every frozen stretch at
# least --min seconds long (default 3.0, a starting point), only inside the --range windows when any are given, and
# the frozen seconds per 30 s in each range.
# A frozen stretch is a question, not a failure: a line being read holds still on purpose. Look at each one and ask
# whether anything should be changing there for this concept (references/MOTION.md, Critique).
# usage: python3 lib/frozen_time.py out/<video>.mp4 [--min 3.0] [--range 56.5-86.0 --range 154.5-162.1 ...]
import subprocess, sys
from common import FF

USAGE = 'usage: python3 lib/frozen_time.py VIDEO [--min SECONDS] [--range FROM-TO ...]'
args = sys.argv[1:]
if not args: sys.exit(USAGE)
video, MIN, ranges = args[0], 3.0, []
i = 1
while i < len(args):
    if args[i] == '--min': MIN = float(args[i + 1]); i += 2
    elif args[i] == '--range': a, b = args[i + 1].split('-'); ranges.append((float(a), float(b))); i += 2
    else: sys.exit('unknown argument: ' + args[i] + '\n' + USAGE)
FPS, W, H, DIFF, PIXELS = 10, 320, 180, 10, 12
raw = subprocess.run([FF, '-loglevel', 'error', '-i', video, '-vf', f'fps={FPS},scale={W}:{H},format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True).stdout
n = len(raw) // (W * H)
if n < 2: sys.exit(f'could not read frames from {video}')
length = n / FPS
for a, b in ranges:
    if b <= a or b > length + .5: sys.exit(f'range {a}-{b} is outside the video ({length:.1f} s long) or empty')
frozen = [False] * n
for k in range(1, n):
    a, b = raw[(k - 1) * W * H:k * W * H], raw[k * W * H:(k + 1) * W * H]
    frozen[k] = sum(1 for x, y in zip(a, b) if abs(x - y) > DIFF) < PIXELS
runs, start = [], None
for k in range(n + 1):
    f = k < n and frozen[k]
    if f and start is None: start = k
    if not f and start is not None: runs.append((start / FPS, k / FPS)); start = None
inside = lambda a, b: not ranges or any(a < rb and b > ra for ra, rb in ranges)
long_runs = [(a, b) for a, b in runs if b - a >= MIN and inside(a, b)]
where = 'inside the ranges' if ranges else 'in the video'
print(f'{video}: {length:.1f} s at {FPS} fps; {len(long_runs)} frozen stretch(es) of {MIN:.1f} s or more {where}')
for a, b in long_runs: print(f'  frozen {a:7.1f} to {b:7.1f} s  ({b - a:.1f} s)')
for a, b in ranges:
    fr = sum(1 for k in range(int(a * FPS), min(n, int(b * FPS))) if frozen[k]) / FPS
    print(f'  range {a:.1f} to {b:.1f} s: {fr:.1f} s frozen ({fr / (b - a) * 30:.1f} s per 30 s)')
