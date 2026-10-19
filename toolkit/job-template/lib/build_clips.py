# Build steady 30 fps frame sequences from the raw screencast takes, following build/edit.py.
# Screencast frames arrive only when the page changes, so each output frame shows the latest recorded frame.
# usage: python3 lib/build_clips.py [clip ...]   -> assets/clips/<clip>/f_00001.jpg ..., build/footage.json
import bisect, json, os, shutil, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
from common import run_ff, JOB
from timeline import interp
import edit
FPS = 30; OW, OH = 2560, 1440
def build_clip(name):
    c = edit.CLIPS[name]; L = json.load(open('capture/rec/%s/log.json' % c['rec']))
    t0 = L['frames'][0]['t']; ts = [f['t'] - t0 for f in L['frames']]
    T0, T1 = c['keys'][0][0], c['keys'][-1][0]; n = int(round((T1 - T0) * FPS)); lst = []
    for i in range(n):
        s = interp(c['keys'], T0 + i / FPS); j = max(0, bisect.bisect_right(ts, s) - 1)
        lst.append(os.path.abspath('capture/rec/%s/%s' % (c['rec'], L['frames'][j]['f'])))
    cf = os.path.join(JOB, 'build', '_concat_%s.txt' % name)
    with open(cf, 'w') as f:
        for p in lst: f.write("file '%s'\nduration %.6f\n" % (p, 1 / FPS))
        f.write("file '%s'\n" % lst[-1])
    d = os.path.join('assets', 'clips', name); shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    run_ff(['-f', 'concat', '-safe', '0', '-i', cf, '-vf', 'scale=%d:%d:flags=lanczos,fps=30' % (OW, OH), '-frames:v', str(n), '-q:v', '2', d + '/f_%05d.jpg'])
    got = len(os.listdir(d)); print(name, 'T0 %.2f T1 %.2f frames %d/%d' % (T0, T1, got, n))
    return {'t0': T0, 't1': T1, 'n': got, 'keys': c['keys'], 'ramps': edit.RAMPS}
def check_shots():
    # scenes.js shows the LAST shot in the list wherever no shot covers t, and holds a clip's first or last frame
    # outside its keys; both flash or freeze the wrong picture while the screen-share frame is up
    sh = sorted(getattr(edit, 'SHOTS', []))
    for (a0, a1, ca), (b0, b1, cb) in zip(sh, sh[1:]):
        if b0 - a1 > 1e-3: print('WARNING shots: %.2f s gap between %s (ends %.2f) and %s (starts %.2f); close it unless the frame is off screen then' % (b0 - a1, ca, a1, cb, b0))
    for a0, a1, c in sh:
        k = edit.CLIPS.get(c, {}).get('keys')
        if k and (a0 < k[0][0] - 1e-3 or a1 > k[-1][0] + 1e-3): print('WARNING shots: %s is on screen %.2f to %.2f but its keys cover %.2f to %.2f; the picture holds still outside them' % (c, a0, a1, k[0][0], k[-1][0]))
if __name__ == '__main__':
    check_shots()
    which = sys.argv[1:] or list(edit.CLIPS)
    meta = json.load(open('build/footage.json')) if os.path.exists('build/footage.json') else {}
    for w in which: meta[w] = build_clip(w)
    meta = {k: v for k, v in meta.items() if k in edit.CLIPS}
    json.dump(meta, open('build/footage.json', 'w'), indent=1)
    print('next: python3 lib/redact.py (if build/edit.py has REDACT regions), then python3 lib/cursor_tracks.py')
