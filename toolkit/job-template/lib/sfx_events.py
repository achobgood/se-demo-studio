# Sound cue sheet: the recorded clicks and keystrokes of the footage on screen (no whooshes or impacts over product
# footage), plus build/motion_cues.json when present (node build/render.js motioncues: the sfx fields of the
# illustrative motion segments), capped well under the voice (whoosh 0.25, tick and pop 0.35).
# usage: python3 lib/sfx_events.py  -> build/sfx_events.json
import json, os, random, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
import edit
random.seed(5); F = json.load(open('build/footage.json'))
def onscreen(name, t): return any(a <= t < b and n == name for a, b, n in edit.SHOTS)
ev = []
for name, m in F.items():
    for c in m.get('clicks', []):
        if onscreen(name, c): ev.append(['click', round(c - .02, 3), .55])
    last = -1
    for k in m.get('keysdown', []):
        if onscreen(name, k) and k - last > .03: ev.append(['key%d' % random.randrange(6), round(k, 3), .22 + random.random() * .08]); last = k
MOTION_CAP = {'whoosh': .25, 'tick': .35, 'pop': .35}; nm = 0
if os.path.exists('build/motion_cues.json'):
    newer = [f for f in ('build/story.js', 'build/cues.js')
             if os.path.exists(f) and os.path.getmtime(f) > os.path.getmtime('build/motion_cues.json')]
    if newer: print('WARNING: build/motion_cues.json is older than %s, so motion sounds may play at the wrong times; '
                    'run node build/render.js motioncues, then this script again' % ' and '.join(newer))
    for kind, t, g in json.load(open('build/motion_cues.json')):
        if kind in MOTION_CAP: ev.append([kind, round(t, 3), min(g, MOTION_CAP[kind])]); nm += 1
        else: print('skipped motion cue with unknown sound:', kind)
ev.sort(key=lambda e: e[1]); json.dump(ev, open('build/sfx_events.json', 'w')); print(len(ev), 'events (%d from motion cues)' % nm)
