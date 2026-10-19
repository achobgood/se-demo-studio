# Add the recorded pointer track, click times and key times (in timeline seconds) to build/footage.json, then
# write build/footage.js and build/cues.js for the stage page. Run after lib/build_clips.py.
import bisect, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
from timeline import interp
import edit
meta = json.load(open('build/footage.json'))
for name, c in edit.CLIPS.items():
    if name not in meta: continue
    L = json.load(open('capture/rec/%s/log.json' % c['rec'])); T = L['frames'][0]['t']
    cur = L['cursor']; ct = [p['t'] for p in cur]; keys = meta[name]['keys']; T0 = keys[0][0]; n = meta[name]['n']
    track = []
    for i in range(n):
        s = interp(keys, T0 + i / 30); j = bisect.bisect_right(ct, T + s) - 1
        track.append([round(cur[j]['x'], 1), round(cur[j]['y'], 1)] if j >= 0 else None)
    def to_tl(kind):
        out = []
        for m in L['marks']:
            if m['k'] != kind: continue
            s = m['t'] - T
            for i in range(1, n):
                if interp(keys, T0 + (i - 1) / 30) < s <= interp(keys, T0 + i / 30): out.append(round(T0 + i / 30, 3)); break
        return out
    meta[name]['cursor'] = track; meta[name]['clicks'] = to_tl('click'); meta[name]['keysdown'] = to_tl('key')
json.dump(meta, open('build/footage.json', 'w'))
open('build/footage.js', 'w').write('const FOOT=' + json.dumps(meta) + ';')
open('build/cues.js', 'w').write('const CUES=' + open('build/cues.json').read() + ';')
print({k: ('clicks', v['clicks'], 'keys', len(v['keysdown'])) for k, v in meta.items()})
