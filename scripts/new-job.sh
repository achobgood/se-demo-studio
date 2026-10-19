#!/bin/bash
# Create a new job folder from the toolkit template.  usage: scripts/new-job.sh <job-slug> [chrome_port]
set -euo pipefail
cd "$(dirname "$0")/.."
SLUG=${1:?usage: scripts/new-job.sh <job-slug> [chrome_port]}
[[ "$SLUG" =~ ^[a-z0-9][a-z0-9-]*$ ]] || { echo "Use lowercase letters, digits and dashes, e.g. cloud-control-webex"; exit 1; }
DIR=jobs/$SLUG; [ -e "$DIR" ] && { echo "$DIR already exists"; exit 1; }
mkdir -p jobs   # jobs/ is never in the repo; it is created on first use
# each job gets its own Chrome port so two jobs never share a browser
PORT=${2:-$(python3 -c "
import json,glob
used={json.load(open(f)).get('chrome_port') for f in glob.glob('jobs/*/job.json')}
print(next(p for p in range(9333,9400) if p not in used))")}
cp -R toolkit/job-template "$DIR"
# git does not keep empty folders, so create the template's working folders here
(cd "$DIR" && mkdir -p assets/captures assets/clips assets/generated assets/public audio/audition audio/music audio/sfx audio/takes logs out research review)
python3 - "$DIR/job.json" "$SLUG" "$PORT" <<'PY'
import json,sys; f,slug,port=sys.argv[1:4]; d=json.load(open(f)); d['slug']=slug; d['chrome_port']=int(port); json.dump(d,open(f,'w'),indent=2)
PY
: > "$DIR/logs/costs.jsonl"; : > "$DIR/ORCHESTRATOR_NOTES.md"
printf '# State changes made in the demo environment\n\n| When | What | Where | Why |\n|---|---|---|---|\n' > "$DIR/logs/state_changes.md"
echo "Created $DIR (Chrome port $PORT). Next: edit $DIR/job.json, then scripts/chrome.sh $SLUG"
