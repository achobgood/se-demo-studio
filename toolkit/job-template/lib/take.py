# Record one voice take or audition through OpenRouter speech, convert to WAV, log the billed cost.
# usage: python3 lib/take.py NAME MODEL VOICE [--text script/speech.txt] [--dir audio/takes] [--extra '{"instructions":"..."}']
# Gemini TTS returns raw 24 kHz PCM; everything else returns MP3. Output: <dir>/NAME.wav plus NAME.log.
import argparse, json, os, time
from common import post, log_cost, generation_cost, check_budget, run_ff
ap = argparse.ArgumentParser()
ap.add_argument('name'); ap.add_argument('model'); ap.add_argument('voice')
ap.add_argument('--text', default='script/speech.txt'); ap.add_argument('--dir', default='audio/takes')
ap.add_argument('--extra', default='{}')
a = ap.parse_args()
check_budget()
os.makedirs(a.dir, exist_ok=True)
text = open(a.text).read().strip()
pcm = 'gemini' in a.model
body = {'model': a.model, 'input': text, 'voice': a.voice, 'response_format': 'pcm' if pcm else 'mp3'}
body.update(json.loads(a.extra))
t = time.time()
r = post('/audio/speech', body, timeout=600, raw=True)
data = r.read(); gid = r.headers.get('X-Generation-Id')
raw = os.path.join(a.dir, a.name + ('.pcm' if pcm else '.mp3')); open(raw, 'wb').write(data)
wav = os.path.join(a.dir, a.name + '.wav')
if pcm:
    run_ff(['-f', 's16le', '-ar', '24000', '-ac', '1', '-i', raw, wav])
else:
    run_ff(['-i', raw, wav])
cost = generation_cost(gid) if gid else None
log_cost(a.model, 'voice %s (%s)' % (a.name, a.voice), cost, gid)
info = {'out': wav, 'bytes': len(data), 'gen': gid, 'cost': cost, 'secs': round(time.time() - t, 1), 'words': len(text.split())}
open(os.path.join(a.dir, a.name + '.log'), 'w').write(json.dumps(info))
print(json.dumps(info))
