# Generate connective art (title backgrounds, transitions). Never use it to imitate a product screen.
# usage: python3 lib/img.py MODEL PROMPT_FILE OUT.png [reference_image]
import base64, os, sys, time
from common import post, log_cost, check_budget
model, pf, out = sys.argv[1:4]; ref = sys.argv[4] if len(sys.argv) > 4 else None
check_budget()
body = {'model': model, 'prompt': open(pf).read(), 'aspect_ratio': '16:9', 'resolution': '2K'}
if 'gpt-image' in model: body.update({'quality': 'high', 'output_format': 'png'})
if ref:
    body['input_references'] = [{'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + base64.b64encode(open(ref, 'rb').read()).decode()}}]
t = time.time(); r = post('/images', body)
im = r['data'][0]; open(out, 'wb').write(base64.b64decode(im['b64_json']))
c = (r.get('usage') or {}).get('cost'); log_cost(model, 'image ' + os.path.basename(out), c, r.get('id'))
print(out, 'cost', c, round(time.time() - t, 1), 's')
