# Shared helpers for every job script. Run scripts from the job folder: `python3 lib/<script>.py ...`.
# Finds the studio root (the folder holding .demo-studio), the bundled ffmpeg, the OpenRouter key,
# and enforces the job's spend cap from logs/costs.jsonl before any paid call.
import json, os, sys, time, urllib.request

JOB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def _studio():
    d = JOB
    while d != os.path.dirname(d):
        if os.path.exists(os.path.join(d, '.demo-studio')):
            return d
        d = os.path.dirname(d)
    sys.exit('Cannot find the studio root (.demo-studio). Run jobs from inside the studio folder.')

STUDIO = _studio()
NM = os.path.join(STUDIO, 'toolkit', 'node_modules')
FF = os.path.join(NM, 'ffmpeg-static', 'ffmpeg')
FFPROBE = os.path.join(NM, 'ffprobe-static', 'bin', 'darwin', os.uname().machine.replace('x86_64', 'x64'), 'ffprobe')
COSTS = os.path.join(JOB, 'logs', 'costs.jsonl')
API = 'https://openrouter.ai/api/v1'

def job_config():
    p = os.path.join(JOB, 'job.json')
    return json.load(open(p)) if os.path.exists(p) else {}

def api_key():
    k = os.environ.get('OPENROUTER_API_KEY')
    if k:
        return k
    env = os.path.join(STUDIO, '.env')
    if os.path.exists(env):
        for line in open(env):
            line = line.strip()
            if line.startswith('OPENROUTER_API_KEY='):
                k = line.split('=', 1)[1].strip().strip('"').strip("'")
                if k:
                    return k
    sys.exit('OPENROUTER_API_KEY is not set. Put it in the studio .env (see .env.example), never in chat.')

def spent():
    if not os.path.exists(COSTS):
        return 0.0
    total = 0.0
    for line in open(COSTS):
        try:
            total += float(json.loads(line).get('cost') or 0)
        except Exception:
            pass
    return total

def check_budget(estimate=0.0):
    cap = float(job_config().get('budget_usd', 15))
    s = spent()
    if s + estimate > cap:
        sys.exit('BUDGET STOP: this job has spent $%.2f of its $%.2f cap. Ask the owner before raising budget_usd in job.json.' % (s, cap))
    return s

def log_cost(model, purpose, cost, gen_id=None):
    os.makedirs(os.path.dirname(COSTS), exist_ok=True)
    with open(COSTS, 'a') as f:
        f.write(json.dumps({'t': time.strftime('%Y-%m-%d %H:%M:%S'), 'model': model, 'purpose': purpose,
                            'cost': cost, 'id': gen_id}) + '\n')

def post(path, body, timeout=600, raw=False):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + api_key(), 'Content-Type': 'application/json',
                                          'X-Title': 'demo-builder'})
    try:
        r = urllib.request.urlopen(req, timeout=timeout)
    except urllib.error.HTTPError as e:
        msg = e.read().decode()[:800]
        if e.code == 402:
            sys.exit('OPENROUTER OUT OF CREDITS (402): the account balance is empty even if the key limit has room. '
                     'Add credits at https://openrouter.ai/settings/credits, then rerun. ' + msg)
        if e.code == 401:
            sys.exit('OPENROUTER KEY REJECTED (401): check OPENROUTER_API_KEY in the studio .env. ' + msg)
        sys.exit('ERR %s %s' % (e.code, msg))
    return r if raw else json.load(r)

def generation_cost(gen_id, tries=8):
    # Some endpoints (speech) return no usage; the generation record has the billed cost a few seconds later.
    for _ in range(tries):
        try:
            req = urllib.request.Request(API + '/generation?id=' + gen_id, headers={'Authorization': 'Bearer ' + api_key()})
            return json.load(urllib.request.urlopen(req, timeout=30))['data'].get('total_cost')
        except Exception:
            time.sleep(3)
    return None

def run_ff(args, check=True):
    import subprocess
    return subprocess.run([FF, '-nostdin', '-hide_banner', '-loglevel', 'error', '-y'] + args, check=check)
