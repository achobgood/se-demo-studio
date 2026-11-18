# Place a prepared call (lib/call_prep.py) on the timeline and split its turns into caption lines with speakers.
# usage: python3 lib/call_lines.py NAME AFTER_SEGMENT [lead_seconds] [gain_db] [--agent LABEL] [--caller LABEL]
#   the call starts lead_seconds (default 0.6) after AFTER_SEGMENT ends; that segment's "gap" in script/segments.json
#   must cover the call. --agent and --caller are the speaker labels on the card and in the captions
#   (default "AI Agent" and "Caller"; say "simulated" when a model plays the caller).
#   writes build/call_place.json (for lib/mix.py and lib/deliver.py), build/call_lines.json ([t0, t1, speaker, text]
#   on the timeline), and build/call.js (CALL for story.js: t0, t1, lines, turns, names).
#   Caption text is the corrected transcript in build/call_NAME.json ("text_fixed" if present, else Whisper words).
import argparse, json, re
ap = argparse.ArgumentParser(); ap.add_argument('name'); ap.add_argument('after')
ap.add_argument('lead', nargs='?', type=float, default=0.6); ap.add_argument('gain', nargs='?', type=float, default=0.0)
ap.add_argument('--agent', default='AI Agent'); ap.add_argument('--caller', default='Caller'); a = ap.parse_args()
names = {'agent': a.agent, 'caller': a.caller}
C = json.load(open('build/cues.json')); seg = {s['name']: s for s in C['segments']}
CALL = json.load(open('build/call_%s.json' % a.name)); t0 = round(seg[a.after]['t1'] + a.lead, 3)
json.dump({'file': 'audio/calls/%s_mix.wav' % a.name, 't0': t0, 'gain_db': a.gain, 'seconds': CALL['seconds'], 'labels': names},
          open('build/call_place.json', 'w'), indent=1)
lines = []
for tu in CALL['turns']:
    ws = tu.get('words') or []
    fixed = tu.get('text_fixed')
    if fixed:   # corrected text: spread its words over the turn's Whisper timing (or the turn span)
        toks = fixed.split(); b0, b1 = (ws[0]['t'], ws[-1]['e']) if ws else (tu['n0'], tu['n1'])
        ws = [{'w': w, 't': b0 + (b1 - b0) * i / len(toks), 'e': b0 + (b1 - b0) * (i + 1) / len(toks)} for i, w in enumerate(toks)]
    cur = []
    for w in ws:
        cur.append(w); txt = ' '.join(x['w'] for x in cur)
        if (re.search(r'[.?!]$', w['w']) and len(txt) > 30) or len(txt) > 80:
            lines.append([round(t0 + cur[0]['t'], 3), round(t0 + cur[-1]['e'], 3), tu['spk'], txt]); cur = []
    if cur: lines.append([round(t0 + cur[0]['t'], 3), round(t0 + cur[-1]['e'], 3), tu['spk'], ' '.join(x['w'] for x in cur)])
json.dump(lines, open('build/call_lines.json', 'w'), indent=1)
print('call at %.2f to %.2f, %d caption lines' % (t0, t0 + CALL['seconds'], len(lines)))
for l in lines: print('%7.2f %7.2f %-6s %s' % tuple(l))
if not lines: print('WARNING: no caption lines; run lib/call_prep.py with --stt, or add "text_fixed" to each turn')
open('build/call.js', 'w').write('const CALL = %s;\n' % json.dumps({'t0': t0, 't1': round(t0 + CALL['seconds'], 3), 'lines': lines,
    'turns': [[round(t0 + tu['n0'], 3), round(t0 + tu['n1'], 3), tu['spk']] for tu in CALL['turns']], 'names': names}))
