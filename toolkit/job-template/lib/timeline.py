# Helpers for build/edit.py: read narration cues so every footage key is expressed in narration time.
#   S('name') / E('name')  start / end of a segment on the final timeline
#   W('word', 'segment', n=1, end=False, exact=False)  time of the n-th word starting with 'word' inside a segment;
#       exact=True matches the whole word, so 'No' never lands on 'Now'. A prefix match on a longer word prints a
#       WARNING once per distinct call.
import json, os, re
from common import JOB
C = json.load(open(os.path.join(JOB, 'build', 'cues.json')))
SEG = {s['name']: s for s in C['segments']}
_norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())
def S(n): return SEG[n]['t0']
def E(n): return SEG[n]['t1']
_warned = set()
def W(word, seg=None, n=1, end=False, exact=False):
    c, k = 0, _norm(word)
    for x in C['words']:
        v = _norm(x['w'])
        if (seg is None or x['seg'] == seg) and (v == k if exact else v.startswith(k)):
            c += 1
            if c == n:
                if len(v) > len(k) and (word, seg, n, end) not in _warned:
                    _warned.add((word, seg, n, end))
                    print("WARNING cue %r in %s matched %r at %.2f s; pass exact, or write the whole word" % (word, seg, x['w'], x['t']))
                return x['e'] if end else x['t']
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
