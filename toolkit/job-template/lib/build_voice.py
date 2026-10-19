# Assemble the narration from a base take, cutting only at paragraph gaps, with authored pauses for the picture.
# Optionally take single paragraphs from other takes of the SAME voice and settings (loudness matched to the base).
# usage: python3 lib/build_voice.py BASE_TAKE [segment_name=OTHER_TAKE ...]  -> audio/voice.wav, build/cues.json
# Pauses come from script/segments.json ("gap" after each segment); intro_seconds of silence precede the voice.
import array, json, math, os, sys, wave
from common import run_ff, JOB
from speech import segments, paragraphs, ntok
SR = 48000
cfg, SEGS = segments()
INTRO = float(cfg.get('intro_seconds', 5.0)); TAIL = float(cfg.get('tail_seconds', 6.5))
base = sys.argv[1]; over = dict(a.split('=', 1) for a in sys.argv[2:])
takes = {}
def load(t):
    if t not in takes:
        tmp = os.path.join(JOB, 'audio', 'takes', '_%s_48k.wav' % t)
        run_ff(['-i', 'audio/takes/%s.wav' % t, '-ac', '1', '-ar', str(SR), tmp])
        w = wave.open(tmp); pcm = array.array('h', w.readframes(w.getnframes())); w.close()
        pj = 'audio/takes/%s_paras.json' % t
        if not os.path.exists(pj): sys.exit('Run lib/check_take.py %s first.' % t)
        takes[t] = (pcm, json.load(open('audio/takes/%s_words.json' % t))['words'], json.load(open(pj))['spans'])
    return takes[t]
def rms(seg):   # active-speech level: mean power of the loudest 60% of 20 ms frames
    n = int(.02 * SR); fr = [sum(v * v for v in seg[k:k + n]) / n for k in range(0, max(1, len(seg) - n), n)]
    fr = sorted(fr)[int(len(fr) * .4):] or [1]; return math.sqrt(sum(fr) / len(fr)) or 1
parts = []
for i, s in enumerate(SEGS):
    t = over.get(s['name'], base); pcm, words, spans = load(t); sp = spans[i]
    if sp is None: sys.exit('Paragraph %d (%s) is not aligned in take %s; fix the take or the text.' % (i, s['name'], t))
    j0, j1 = sp[2], sp[3]; st, en = words[j0]['start'], words[j1]['end']
    prev_end = words[j0 - 1]['end'] if j0 > 0 else 0
    next_start = words[j1 + 1]['start'] if j1 + 1 < len(words) else len(pcm) / SR
    cut0 = max(prev_end + .02, st - .12) if j0 > 0 else max(0, st - .05)
    cut1 = min(en + .28, (en + next_start) / 2 + .08, next_start - .02) if j1 + 1 < len(words) else min(len(pcm) / SR, en + .8)
    seg = pcm[int(cut0 * SR):int(cut1 * SR)]
    parts.append(dict(s=s, take=t, cut0=cut0, cut1=cut1, seg=seg, words=words[j0:j1 + 1], rms=rms(seg)))
baseR = [p['rms'] for p in parts if p['take'] == base]; baseR = sum(baseR) / max(1, len(baseR))
out = array.array('h', [0] * int(INTRO * SR)); t = INTRO
cues = {'base_take': base, 'overrides': over, 'segments': [], 'words': []}
for p in parts:
    g = baseR / p['rms'] if p['take'] != base else 1.0
    seg = array.array('h', [int(max(-32767, min(32767, v * g))) for v in p['seg']]); n = int(.015 * SR)
    for j in range(min(n, len(seg) // 2)): seg[j] = int(seg[j] * j / n); seg[-1 - j] = int(seg[-1 - j] * j / n)
    dur = len(seg) / SR; s = p['s']
    cues['segments'].append({'name': s['name'], 'chapter': s.get('chapter', ''), 'take': p['take'], 'gain': round(g, 3),
                             't0': round(t, 3), 't1': round(t + dur, 3)})
    for wd in p['words']:
        cues['words'].append({'w': wd['word'].strip(), 't': round(t + wd['start'] - p['cut0'], 3), 'e': round(t + wd['end'] - p['cut0'], 3), 'seg': s['name']})
    out.extend(seg); t += dur; gap = float(s.get('gap', .8)); out.extend(array.array('h', [0] * int(gap * SR))); t += gap
cues['voice_end'] = round(t, 3); cues['total'] = round(round((t + TAIL) * 30) / 30, 3)
o = wave.open('audio/voice.wav', 'wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(SR); o.writeframes(out.tobytes()); o.close()
json.dump(cues, open('build/cues.json', 'w'), indent=1)
for s in cues['segments']: print('%-12s %-14s g=%.2f %7.2f %7.2f' % (s['name'], s['take'], s['gain'], s['t0'], s['t1']))
print('voice end %.2f  total %.2f s (%d frames)' % (t, cues['total'], round(cues['total'] * 30)))
# edge check: each segment's first and last aligned words must match its script paragraph; a mismatch usually
# means speech-to-text put a word into the gap and the cut dropped it (take that paragraph from another take)
bad = 0
for s, para in zip(cues['segments'], paragraphs()):
    ws = [w['w'] for w in cues['words'] if w['seg'] == s['name']]; tw = para.split()
    if not ws or ntok(tw[0]) != ntok(ws[0]) or ntok(tw[-1]) != ntok(ws[-1]):
        bad += 1; print('EDGE MISMATCH %s: script %r..%r, voice %r..%r' % (s['name'], tw[0], tw[-1], ws[0] if ws else '', ws[-1] if ws else ''))
print('edge check:', 'FAIL, %d segment(s)' % bad if bad else 'ok')
