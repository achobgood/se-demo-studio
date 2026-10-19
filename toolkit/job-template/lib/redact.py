# Bake redaction blur into the 30 fps edit copies (assets/clips/<clip>/), never into raw captures.
# Regions come from build/edit.py REDACT: (clip, rec_from, rec_to, x, y, w, h, why) in recording seconds and
# 1920x1080 CSS pixels. Run after lib/build_clips.py (which rebuilds clips from the untouched raw frames).
# Uses ffmpeg: crop each region, pixelate and blur it, overlay it back only on the frames whose recording time
# falls inside the region's window.  usage: python3 lib/redact.py [clip ...]
import os, shutil, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
from common import run_ff
from timeline import interp
import edit
FPS = 30; SC = 2560 / 1920
def run(name):
    c = edit.CLIPS[name]; regs = [r for r in getattr(edit, 'REDACT', []) if r[0] == name]
    if not regs: return
    d = os.path.join('assets', 'clips', name); n = len([f for f in os.listdir(d) if f.endswith('.jpg')])
    T0 = c['keys'][0][0]; recs = [interp(c['keys'], T0 + i / FPS) for i in range(n)]
    chains, last = [], '0:v'
    for k, r in enumerate(regs):
        idx = [i for i, s in enumerate(recs) if r[1] <= s <= r[2]]
        if not idx: continue
        a, b = idx[0], idx[-1]
        x, y, w, h = (int(round(v * SC)) for v in r[3:7]); w -= w % 2; h -= h % 2
        chains.append('[0:v]crop=%d:%d:%d:%d,scale=iw/16:ih/16,scale=%d:%d:flags=neighbor,boxblur=6[r%d]' % (w, h, x, y, w, h, k))
        chains.append("[%s][r%d]overlay=%d:%d:enable='between(n,%d,%d)'[o%d]" % (last, k, x, y, a, b, k)); last = 'o%d' % k
    if not chains: return
    tmp = d + '_red'; shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
    run_ff(['-framerate', '30', '-i', d + '/f_%05d.jpg', '-filter_complex', ';'.join(chains), '-map', '[%s]' % last, '-q:v', '2', '-start_number', '1', tmp + '/f_%05d.jpg'])
    got = len(os.listdir(tmp))
    if got != n: sys.exit('%s: redaction produced %d of %d frames; clip left unredacted' % (name, got, n))
    shutil.rmtree(d); os.rename(tmp, d); print(name, 'redacted', len(regs), 'regions over', n, 'frames')
if __name__ == '__main__':
    for nm in (sys.argv[1:] or list(edit.CLIPS)): run(nm)
