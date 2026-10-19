# usage: python3 lib/spend.py            -> this job's spend vs cap, plus the key's total usage and limit
import json, os, urllib.request
from common import spent, job_config, api_key, API, COSTS
cap = float(job_config().get('budget_usd', 15))
print('job spend $%.3f of $%.2f cap' % (spent(), cap))
nocost = sum(1 for line in open(COSTS) if line.strip() and json.loads(line).get('cost') is None) if os.path.exists(COSTS) else 0
if nocost:
    print('%d paid call(s) logged no cost and count as $0 toward the cap; the key usage below is the true total' % nocost)
try:
    d = json.load(urllib.request.urlopen(urllib.request.Request(API + '/key', headers={'Authorization': 'Bearer ' + api_key()}), timeout=30))['data']
    print('key usage $%.3f, key limit %s, limit remaining %s' % (d.get('usage') or 0, d.get('limit'), d.get('limit_remaining')))
except Exception as e:
    print('key check failed:', e)
