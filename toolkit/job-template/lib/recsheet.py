# Contact sheet of a recorded take at chosen recording times; check every take right after recording it.
# usage: python3 lib/recsheet.py TAKE 5 20 35 50 ...   -> review/sheet_<TAKE>.jpg (2 columns, 960x540 each)
import sys
from common import run_ff
from frameat import frame_at
rec = sys.argv[1]; ts = [float(x) for x in sys.argv[2:]]; fs = [frame_at(rec, t) for t in ts]
args, fc = [], ''
for i, f in enumerate(fs): args += ['-i', f]; fc += '[%d:v]scale=960:540[v%d];' % (i, i)
lay = '|'.join('%d_%d' % ((i % 2) * 960, (i // 2) * 540) for i in range(len(fs)))
fc += ''.join('[v%d]' % i for i in range(len(fs))) + ('xstack=inputs=%d:layout=%s:fill=black[o]' % (len(fs), lay) if len(fs) > 1 else 'null[o]')
out = 'review/sheet_%s.jpg' % rec
run_ff(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '4', out]); print(out, ts)
