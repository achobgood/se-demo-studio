# One chat call with optional audio or image attachments (judging takes, reviewing frames, claim checks).
# usage: python3 lib/chat.py MODEL PROMPT_FILE OUT.json [files...]   env: PURPOSE="what this call is for", JSONMODE=1
import base64, json, os, sys, time
from common import post, log_cost, check_budget
model, pf, out = sys.argv[1:4]; files = sys.argv[4:]
check_budget()
content = [{'type': 'text', 'text': open(pf).read()}]
for f in files:
    ext = f.rsplit('.', 1)[1].lower(); b = base64.b64encode(open(f, 'rb').read()).decode()
    content.append({'type': 'text', 'text': '[file: %s]' % os.path.basename(f)})
    if ext in ('wav', 'mp3', 'm4a', 'flac'):
        content.append({'type': 'input_audio', 'input_audio': {'data': b, 'format': ext}})
    else:
        mt = 'image/png' if ext == 'png' else 'image/jpeg'
        content.append({'type': 'image_url', 'image_url': {'url': 'data:%s;base64,%s' % (mt, b)}})
body = {'model': model, 'messages': [{'role': 'user', 'content': content}], 'usage': {'include': True}}
if os.environ.get('JSONMODE'): body['response_format'] = {'type': 'json_object'}
t = time.time(); r = post('/chat/completions', body)
json.dump(r, open(out, 'w'), indent=1)
print(r['choices'][0]['message'].get('content'))
u = r.get('usage', {}); log_cost(model, os.environ.get('PURPOSE', 'chat'), u.get('cost'), r.get('id'))
print('COST', u.get('cost'), round(time.time() - t, 1), 's')
