#!/bin/bash
# Verify the OpenRouter key in .env without ever printing it. Shows usage and the key's credit limit.
cd "$(dirname "$0")/.."
( set -a; . ./.env; set +a
  [ -z "${OPENROUTER_API_KEY:-}" ] && { echo "OpenRouter key          NOT SET in .env"; exit 1; }
  R=$(curl -s -m 20 -w '\n%{http_code}' https://openrouter.ai/api/v1/key -H "Authorization: Bearer $OPENROUTER_API_KEY")
  CODE=$(echo "$R" | tail -1); BODY=$(echo "$R" | sed '$d')
  if [ "$CODE" != "200" ]; then echo "OpenRouter key          REJECTED (HTTP $CODE): check the key in .env"; exit 1; fi
  echo "$BODY" | python3 -c "
import json,sys; d=json.load(sys.stdin)['data']
lim=d.get('limit'); rem=d.get('limit_remaining')
print('%-24s ok (used \$%.2f, limit %s, remaining %s)' % ('OpenRouter key', d.get('usage') or 0, 'none' if lim is None else '\$%.2f'%lim, 'n/a' if rem is None else '\$%.2f'%rem))
if lim is None: print('%-24s NO CREDIT LIMIT: set one on this key at https://openrouter.ai/settings/keys so a runaway job cannot overspend' % 'OpenRouter limit'); sys.exit(1)
" )
