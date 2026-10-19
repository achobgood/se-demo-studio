# Word timestamps for a take (Whisper through OpenRouter). Whisper mishears some words; confirm with a listen
# (lib/chat.py with an audio model) before rewording a line.
# usage: python3 lib/stt.py audio/takes/NAME.wav [--model openai/whisper-large-v3]  -> audio/takes/NAME_words.json
import argparse, base64, json, os
from common import post, log_cost, check_budget
ap = argparse.ArgumentParser(); ap.add_argument('audio'); ap.add_argument('--model', default='openai/whisper-large-v3')
a = ap.parse_args(); check_budget()
ext = a.audio.rsplit('.', 1)[1]
body = {'model': a.model, 'input_audio': {'data': base64.b64encode(open(a.audio, 'rb').read()).decode(), 'format': ext},
        'response_format': 'verbose_json', 'timestamp_granularities': ['word', 'segment'], 'language': 'en'}
r = post('/audio/transcriptions', body, raw=True); d = json.loads(r.read())
out = a.audio.rsplit('.', 1)[0] + '_words.json'
json.dump(d, open(out, 'w'), indent=1)
log_cost(a.model, 'word timestamps ' + os.path.basename(a.audio), (d.get('usage') or {}).get('cost'), r.headers.get('X-Generation-Id'))
print(d.get('text')); print('words', len(d.get('words', [])), '->', out)
