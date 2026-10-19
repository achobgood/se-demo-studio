# Sound cue sheet: only the recorded clicks and keystrokes of the footage on screen (no whooshes or impacts over
# product footage). usage: python3 lib/sfx_events.py  -> build/sfx_events.json
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
ev.sort(key=lambda e: e[1]); json.dump(ev, open('build/sfx_events.json', 'w')); print(len(ev), 'events')
