# Write a copy of an image (png or jpg) with boxes pixelated and blurred so text in them cannot be read; IN is
# never changed. Use it on exploration screenshots before they go on a contact sheet the owner sees.
# Boxes are x y w h in the image's own pixels, or with --css in 1920-wide CSS pixels (scaled by width / 1920).
# Each box is clamped inside the image; an empty one is skipped. Works in RGB planes so odd sizes and offsets stay exact,
# and keeps the blur radius inside ffmpeg's limit for the box, so small or edge boxes never make ffmpeg fail.
# One filter thread: with the default threads, graphs of more than about 100 boxes failed (EAGAIN).
# usage: python3 lib/blur_copy.py IN OUT x y w h [x y w h ...] [--css]
import os, subprocess, sys
from common import run_ff, FFPROBE
a = [s for s in sys.argv[1:] if s != '--css']; css = '--css' in sys.argv
if len(a) < 6 or (len(a) - 2) % 4: sys.exit('usage: python3 lib/blur_copy.py IN OUT x y w h [x y w h ...] [--css]')
src, out, nums = a[0], a[1], [float(v) for v in a[2:]]
if os.path.abspath(src) == os.path.abspath(out): sys.exit('OUT must differ from IN; IN is never changed')
W, H = (int(v) for v in subprocess.run([FFPROBE, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
                                         '-of', 'csv=p=0', src], capture_output=True, text=True, check=True).stdout.split(',')[:2])
sc = W / 1920 if css else 1.0; blk = max(8, round(16 * W / 1920)); rad = max(2, round(6 * W / 1920))
chains, last, boxes = [], 'b', []
for k in range(0, len(nums), 4):
    x, y, w, h = (v * sc for v in nums[k:k + 4])
    x0, y0 = max(0, int(round(x))), max(0, int(round(y))); x1, y1 = min(W, int(round(x + w))), min(H, int(round(y + h)))
    if x1 <= x0 or y1 <= y0: print('skipped box %s: empty inside the %dx%d image' % (' '.join(a[2 + k:6 + k]), W, H)); continue
    bw, bh = x1 - x0, y1 - y0; r = min(rad, min(bw, bh) // 2); i = len(boxes); boxes.append((x0, y0, bw, bh))
    chains.append('[s%d]crop=%d:%d:%d:%d,scale=%d:%d:flags=area,scale=%d:%d:flags=neighbor,format=gbrp,boxblur=%d:1[r%d]'
                  % (i, bw, bh, x0, y0, max(1, bw // blk), max(1, bh // blk), bw, bh, r, i))
    chains.append('[%s][r%d]overlay=%d:%d:format=gbrp[o%d]' % (last, i, x0, y0, i)); last = 'o%d' % i
split = '[0:v]format=gbrp,split=%d[b]%s' % (len(boxes) + 1, ''.join('[s%d]' % i for i in range(len(boxes))))
fx = ['-filter_complex', ';'.join([split] + chains), '-map', '[%s]' % last] if chains else []
run_ff(['-filter_complex_threads', '1', '-i', src] + fx + ['-frames:v', '1', '-update', '1', '-q:v', '2', out])
print(out, '%dx%d' % (W, H), 'boxes (image px x y w h):', ' '.join('%d,%d,%d,%d' % b for b in boxes) or 'none, copied unchanged')
