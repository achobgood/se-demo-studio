# Labelled-free grid of any images (review frames, rendered stills). usage: python3 lib/grid.py OUT.jpg COLS files...
import sys
from common import run_ff
out = sys.argv[1]; cols = int(sys.argv[2]); files = sys.argv[3:]; w, h = 640, 360; args, fc = [], ''
for i, f in enumerate(files): args += ['-i', f]; fc += '[%d:v]scale=%d:%d:force_original_aspect_ratio=decrease,pad=%d:%d[v%d];' % (i, w, h, w, h, i)
lay = '|'.join('%d_%d' % ((i % cols) * w, (i // cols) * h) for i in range(len(files)))
fc += ''.join('[v%d]' % i for i in range(len(files))) + ('xstack=inputs=%d:layout=%s:fill=black[o]' % (len(files), lay) if len(files) > 1 else 'null[o]')
run_ff(args + ['-filter_complex', fc, '-map', '[o]', '-frames:v', '1', '-q:v', '3', out]); print(out)
