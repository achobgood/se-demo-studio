# Generate a music bed (streamed audio chat model, e.g. google/lyria-3-pro-preview). Judge beds with lib/chat.py
# and reject any with garbled vocals.
# usage: python3 lib/music.py MODEL PROMPT_FILE audio/music/bed1   -> bed1.wav (and bed1.txt with any model text)
import base64, json, os, sys, time
from common import post, log_cost, check_budget, run_ff
model, pf, outb = sys.argv[1:4]; check_budget()
body = {'model': model, 'messages': [{'role': 'user', 'content': open(pf).read()}], 'modalities': ['text', 'audio'],
        'audio': {'format': 'wav'}, 'stream': True, 'usage': {'include': True}}
t = time.time(); r = post('/chat/completions', body, raw=True)
chunks, txt, cost, gid = [], [], None, None
for line in r:
    line = line.decode().strip()
    if not line.startswith('data: '): continue
    d = line[6:]
    if d == '[DONE]': break
    try: c = json.loads(d)
    except Exception: continue
    gid = c.get('id', gid)
    if c.get('usage'): cost = c['usage'].get('cost')
    for ch in c.get('choices', []):
        de = ch.get('delta', {}); au = de.get('audio') or {}
        if au.get('data'): chunks.append(au['data'])
        if au.get('transcript'): txt.append(au['transcript'])
        if de.get('content'): txt.append(de['content'])
b = base64.b64decode(''.join(chunks)) if chunks else b''
open(outb + '.bin', 'wb').write(b); open(outb + '.txt', 'w').write(''.join(txt))
if b: run_ff(['-i', outb + '.bin', outb + '.wav'], check=False)
log_cost(model, 'music ' + os.path.basename(outb), cost, gid)
print('bytes', len(b), 'cost', cost, 'secs', round(time.time() - t, 1), '->', outb + '.wav')
