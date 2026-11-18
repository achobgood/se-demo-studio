#!/bin/bash
# Create a new job folder from the toolkit template.  usage: scripts/new-job.sh <job-slug> [chrome_port | --test-run]
# --test-run also copies the ready-made test run files from .claude/skills/record-demo/test-run/ into the job.
set -euo pipefail
cd "$(dirname "$0")/.."
# The publishing copy is for editing the studio, never for jobs (RELEASING.md). Only this clone's own setting is read.
if [ "$(git config --local --get studio.copy 2>/dev/null || true)" = "publishing" ]; then
  echo "Studio copy: this is the publishing copy; run demo jobs in the jobs copy (RELEASING.md)"; exit 1
fi
SLUG=${1:?usage: scripts/new-job.sh <job-slug> [chrome_port | --test-run]}
TEST=0; if [ "${2:-}" = "--test-run" ]; then TEST=1; set -- "$1"; fi
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
(cd "$DIR" && mkdir -p assets/captures assets/clips assets/generated assets/public audio/audition audio/music audio/sfx audio/takes logs out research/prior review)
python3 - "$DIR/job.json" "$SLUG" "$PORT" <<'PY'
import json,sys; f,slug,port=sys.argv[1:4]; d=json.load(open(f)); d['slug']=slug; d['chrome_port']=int(port); json.dump(d,open(f,'w'),indent=2)
PY
# Record the template this job starts from, so scripts/upgrade-job.sh can later merge newer template files into it
# without losing the job's edits: VERSION and the git commit go in job.json, and a copy of every file listed in
# toolkit/job-template/TEMPLATE_FILES.json that git cannot give back from that commit, because it was edited or not
# yet committed, goes in review/upgrade/base/.
rm -f "$DIR/TEMPLATE_FILES.json"
python3 - "$DIR" <<'PY'
import json, os, shutil, subprocess, sys
job, T = sys.argv[1], 'toolkit/job-template'
def git(*a, inp=None):
    r = subprocess.run(['git', *a], input=inp, capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else ''
top = git('rev-parse', '--show-toplevel')
commit = git('rev-parse', 'HEAD') if top and os.path.realpath(top) == os.path.realpath('.') else ''
files = [p for p in json.load(open(T + '/TEMPLATE_FILES.json'))['files'] if os.path.isfile(os.path.join(T, p))]
keep = files
if commit:
    at = {}
    for row in git('ls-tree', '-r', 'HEAD', '--', T + '/').splitlines():
        meta, path = row.split('\t', 1); at[path[len(T) + 1:]] = meta.split()[2]
    now = git('hash-object', '--stdin-paths', inp='\n'.join(os.path.join(T, p) for p in files)).split()
    keep = [p for p, h in zip(files, now) if at.get(p) != h]
for p in keep:
    os.makedirs(os.path.dirname(os.path.join(job, 'review/upgrade/base', p)), exist_ok=True)
    shutil.copy2(os.path.join(T, p), os.path.join(job, 'review/upgrade/base', p))
f = os.path.join(job, 'job.json'); d = json.load(open(f))
d['template_version'] = open('VERSION').read().strip(); d['template_commit'] = commit or None
json.dump(d, open(f, 'w'), indent=2)
print(f"Template base: VERSION {d['template_version']}, " + (f'commit {commit[:7]}' if commit else 'no git commit') +
      (f'; {len(keep)} files git cannot give back are copied in review/upgrade/base/' if keep else ''))
PY
: > "$DIR/logs/costs.jsonl"; : > "$DIR/ORCHESTRATOR_NOTES.md"
printf '# State changes made in the demo environment\n\n| When | What | Where | Why |\n|---|---|---|---|\n' > "$DIR/logs/state_changes.md"
if [ $TEST = 1 ]; then
  T=.claude/skills/record-demo/test-run; cp -R "$T/job/." "$DIR/"
  python3 - "$DIR/job.json" "$T/job-settings.json" <<'PY'
import json,sys; f,s=sys.argv[1:3]; d=json.load(open(f)); d.update(json.load(open(s))); json.dump(d,open(f,'w'),indent=2)
PY
  echo "Created test run $DIR (Chrome port $PORT). Next: scripts/chrome.sh $SLUG"; exit 0
fi
echo "Created $DIR (Chrome port $PORT). Next: edit $DIR/job.json, then scripts/chrome.sh $SLUG"
