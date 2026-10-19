# Helpers for build/edit.py: read narration cues so every footage key is expressed in narration time.
#   S('name') / E('name')  start / end of a segment on the final timeline
#   W('word', 'segment', n=1, end=False)  time of the n-th word starting with 'word' inside a segment
import json, os, re
from common import JOB
C = json.load(open(os.path.join(JOB, 'build', 'cues.json')))
SEG = {s['name']: s for s in C['segments']}
_norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def S(n): return SEG[n]['t0']
def E(n): return SEG[n]['t1']
def W(word, seg=None, n=1, end=False):
    c = 0
    for x in C['words']:
        if (seg is None or x['seg'] == seg) and _norm(x['w']).startswith(_norm(word)):
            c += 1
            if c == n: return x['e'] if end else x['t']
    raise KeyError('cue word not found: %r in segment %r (#%d)' % (word, seg, n))
def mono(keys, clip=''):
    # drop keys that would run backwards in timeline time (an out-of-order pair snaps the picture for a frame),
    # and say so: a dropped key usually means W() matched an earlier, more generic word and the footage will drift
    out = []
    for k in keys:
        if not out or k[0] > out[-1][0] + 1e-3: out.append(k)
        else: print('WARNING %s: key (t=%.2f, rec=%.1f) dropped, earlier than the previous key; check the cue word' % (clip, k[0], k[1]))
    return out
def interp(keys, t):
    if t <= keys[0][0]: return keys[0][1]
    for (a, x), (b, y) in zip(keys, keys[1:]):
        if t <= b: return x + (y - x) * (t - a) / (b - a) if b > a else y
    return keys[-1][1]
