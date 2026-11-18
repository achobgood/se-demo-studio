# Turn a recorded call (two clean tracks, as capture/caller.js records them) into speaker turns, silence-only cuts,
# a mix, and word times for the captions. Then run lib/call_lines.py to place it (PIPELINE.md, "Recorded call").
# Cuts happen only in silence between turns (never inside a turn, never reorder).
# usage: python3 lib/call_prep.py NAME [--maxgap 1.1] [--stt] [--thresh -48]
#   reads audio/calls/NAME_agent.wav (the product's side of the call) and NAME_caller.wav (the caller)
#   writes audio/calls/NAME_mix.wav (trimmed, both sides), build/call_NAME.json (turns in trimmed time, cut map),
#   and with --stt also runs Whisper on each trimmed track (a paid call, logged) and assigns words to turns.
#   --maxgap 99 keeps every pause as it was (no cuts). Correct a misheard turn by adding "text_fixed" to it in
#   build/call_NAME.json; call_lines.py uses that text.
import argparse, array, json, math, os, subprocess, sys, wave
from common import FF, run_ff, JOB
ap = argparse.ArgumentParser(); ap.add_argument('name'); ap.add_argument('--maxgap', type=float, default=1.1)
ap.add_argument('--stt', action='store_true'); ap.add_argument('--thresh', type=float, default=None)
ap.add_argument('--lead', type=float, default=0.4); ap.add_argument('--tail', type=float, default=0.8)
a = ap.parse_args()
D = os.path.join(JOB, 'audio', 'calls'); SR = 16000; FR = int(.02 * SR)
def load(f, sr=SR):
    raw = subprocess.run([FF, '-nostdin', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    x = array.array('h'); x.frombytes(raw); return x
tr = {k: load(os.path.join(D, '%s_%s.wav' % (a.name, k))) for k in ('agent', 'caller')}
dur = {k: len(v) / SR for k, v in tr.items()}
print('durations agent %.2f s, caller %.2f s, difference %.2f s %s' % (dur['agent'], dur['caller'], abs(dur['agent'] - dur['caller']),
      'OK' if abs(dur['agent'] - dur['caller']) <= .5 else 'MISMATCH (> 0.5 s): tracks may not be time-aligned'))
def db(v): return 20 * math.log10(max(v, 1e-9))
def frames(x):
    out = []
    for i in range(0, len(x) - FR, FR):
        s = 0
        for v in x[i:i + FR]: s += v * v
        out.append(db(math.sqrt(s / FR) / 32768))
    return out
E = {k: frames(v) for k, v in tr.items()}
def regions(e):
    fl = sorted(e)[int(len(e) * .2)] if e else -90
    th = a.thresh if a.thresh is not None else max(-50.0, fl + 18)
    on = [v > th for v in e]; rs = []; i = 0
    while i < len(on):
        if on[i]:
            j = i
            while j < len(on) and on[j]: j += 1
            rs.append([i * .02, j * .02]); i = j
        else: i += 1
    m = []
    for r in rs:
        if m and r[0] - m[-1][1] < .45: m[-1][1] = r[1]
        else: m.append(r)
    return [r for r in m if r[1] - r[0] >= .25], th, fl
R = {}
for k in E:
    R[k], th, fl = regions(E[k]); print('%s: noise floor %.1f dBFS, threshold %.1f dBFS, %d speech regions' % (k, fl, th, len(R[k])))
# turns: merge a speaker's regions while the other speaker does not talk in between
ev = sorted([(r[0], r[1], k) for k in R for r in R[k]])
turns = []
for t0, t1, k in ev:
    if turns and turns[-1]['spk'] == k and t0 - turns[-1]['t1'] < 2.5: turns[-1]['t1'] = max(turns[-1]['t1'], t1)
    else: turns.append({'spk': k, 't0': t0, 't1': t1})
over = []
for i in range(1, len(turns)):
    if turns[i]['t0'] < turns[i - 1]['t1'] - .05: over.append((turns[i - 1]['spk'], turns[i]['spk'], round(turns[i]['t0'], 2), round(turns[i - 1]['t1'], 2)))
print('turns %d; overlaps %d %s' % (len(turns), len(over), over[:6]))
# cut plan: keep every turn whole; shorten silences longer than maxgap between turns, the lead-in and the tail
T = max(dur.values()); keep = []; prev = max(0.0, turns[0]['t0'] - a.lead) if turns else 0.0
for i, tu in enumerate(turns):
    if i == 0: keep.append([prev, tu['t1']]); continue
    gap = tu['t0'] - keep[-1][1]
    if gap > a.maxgap:
        keep[-1][1] += a.maxgap / 2; keep.append([tu['t0'] - a.maxgap / 2, tu['t1']])
    else: keep[-1][1] = max(keep[-1][1], tu['t1'])
if keep: keep[-1][1] = min(T, keep[-1][1] + a.tail)
cmap, nt = [], 0.0
for s, e in keep: cmap.append([round(s, 3), round(nt, 3)]); nt += e - s; cmap.append([round(e, 3), round(nt, 3)])
def o2n(t):
    for (s, n0), (e, n1) in zip(cmap[::2], cmap[1::2]):
        if s - 1e-6 <= t <= e + 1e-6: return n0 + (t - s)
    return None
for tu in turns: tu['n0'] = round(o2n(tu['t0']), 3); tu['n1'] = round(o2n(tu['t1']), 3)
print('kept %d spans, %.2f s of %.2f s (removed %.2f s of silence)' % (len(keep), nt, T, T - nt))
# trimmed tracks at 48 kHz and the mix
sel = '+'.join('between(t,%.3f,%.3f)' % (s, e) for s, e in keep)
for k in ('agent', 'caller'):
    run_ff(['-i', os.path.join(D, '%s_%s.wav' % (a.name, k)), '-af', "aselect='%s',asetpts=N/SR/TB,aresample=48000" % sel, '-ac', '1',
            os.path.join(D, '%s_%s_trim.wav' % (a.name, k))])
run_ff(['-i', os.path.join(D, '%s_agent_trim.wav' % a.name), '-i', os.path.join(D, '%s_caller_trim.wav' % a.name), '-filter_complex',
        '[0:a][1:a]amix=inputs=2:normalize=0:duration=longest[o]', '-map', '[o]', '-ac', '1', '-ar', '48000', os.path.join(D, '%s_mix.wav' % a.name)])
out = {'name': a.name, 'orig_seconds': round(T, 3), 'seconds': round(nt, 3), 'maxgap': a.maxgap, 'keep': keep, 'cmap': cmap,
       'overlaps': over, 'turns': turns}
if a.stt:
    for k in ('agent', 'caller'):
        f = os.path.join(D, '%s_%s_trim.wav' % (a.name, k)); m = f.rsplit('.', 1)[0] + '.m4a'
        run_ff(['-i', f, '-ac', '1', '-ar', '16000', '-c:a', 'aac', '-b:a', '48k', m])
        subprocess.run([sys.executable, os.path.join(JOB, 'lib', 'stt.py'), m], check=True)
        ws = json.load(open(m.rsplit('.', 1)[0] + '_words.json')).get('words', [])
        for tu in turns:
            if tu['spk'] != k: continue
            tw = [w for w in ws if tu['n0'] - .3 <= (w['start'] + w['end']) / 2 <= tu['n1'] + .3]
            tu['words'] = [{'w': w['word'].strip(), 't': round(w['start'], 3), 'e': round(w['end'], 3)} for w in tw]
            tu['text'] = ' '.join(w['w'] for w in tu['words'])
json.dump(out, open(os.path.join(JOB, 'build', 'call_%s.json' % a.name), 'w'), indent=1)
for tu in turns: print('%-6s %6.2f-%6.2f  (orig %6.2f-%6.2f) %s' % (tu['spk'], tu['n0'], tu['n1'], tu['t0'], tu['t1'], tu.get('text', '')[:90]))
