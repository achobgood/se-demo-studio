# List current OpenRouter models by output type, so you pick from today's catalog rather than a stale list.
# usage: python3 lib/models.py speech|transcription|audio|image|video|text [filter]
import json, sys, urllib.request
from common import API
kind = sys.argv[1] if len(sys.argv) > 1 else 'speech'; flt = (sys.argv[2] if len(sys.argv) > 2 else '').lower()
# output_modalities=all is required; without it the listing hides non-text models.
d = json.load(urllib.request.urlopen(API + '/models?output_modalities=all', timeout=60))['data']
for m in d:
    arch = m.get('architecture', {}); outs = arch.get('output_modalities', []); ins = arch.get('input_modalities', [])
    # speech (TTS) and transcription (STT) models carry their own output labels; 'audio' is chat models that
    # return audio (music, audio judges)
    hit = {'speech': 'speech' in outs, 'transcription': 'transcription' in outs, 'audio': 'audio' in outs,
           'image': 'image' in outs, 'video': 'video' in outs, 'text': outs == ['text']}.get(kind, False)
    if hit and flt in (m['id'] + m.get('name', '')).lower():
        print('%-45s in=%s out=%s' % (m['id'], ','.join(ins), ','.join(outs)))
