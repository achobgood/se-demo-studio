# Contact sheet of a recorded take at chosen recording times; check every take right after recording it.
# usage: python3 lib/recsheet.py TAKE 5 20 35 50 ... [--small]   -> review/sheet_<TAKE>.jpg (2 columns, 960x540 each)
#   --small: review/sheet_<TAKE>_small.jpg, 4 columns of 480x270, a quarter of the pixels, for routine checks (is
#   it signed in, the right view, no dialog); use the full size where text must be read.
import sys
from common import run_ff
from frameat import frame_at
small = '--small' in sys.argv; av = [x for x in sys.argv[1:] if x != '--small']
W, H, COLS = (480, 270, 4) if small else (960, 540, 2)
rec = av[0]; ts = [float(x) for x in av[1:]]; fs = [frame_at(rec, t) for t in ts]
args, fc = [], ''
for i, f in enumerate(fs): args += ['-i', f]; fc += '[%d:v]scale=%d:%d[v%d];' % (i, W, H, i)
lay = '|'.join('%d_%d' % ((i % COLS) * W, (i // COLS) * H) for i in range(len(fs)))
fc += ''.join('[v%d]' % i for i in range(len(fs))) + ('xstack=inputs=%d:layout=%s:fill=black[o]' % (len(fs), lay) if len(fs) > 1 else 'null[o]')
out = 'review/sheet_%s%s.jpg' % (rec, '_small' if small else '')
run_ff(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '4', out]); print(out, ts)
