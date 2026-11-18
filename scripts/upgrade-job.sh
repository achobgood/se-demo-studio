#!/bin/bash
# Bring the template's newer files into an existing job without losing the job's own edits.
# usage: scripts/upgrade-job.sh <job-slug | job folder> [file ...] [--apply] [--base <tag or commit>]
#        scripts/upgrade-job.sh <job-slug | job folder> --check
# Files are paths inside the job, such as build/scenes.js; with none, every file in toolkit/job-template/TEMPLATE_FILES.json.
# Each file is merged three ways with git merge-file: the template copy the job started from (the base), the job's
# copy, and the template's copy now. Files of kind 'job' are never changed, only added when the job has none.
# A file listed under another's 'needs' comes along when the job lacks it or a name it must define.
# The default is a dry run that writes nothing. --apply writes the results, keeps the job's originals in
# review/upgrade/<date_time>/before/, the template's copies of conflicted files in .../template/, and the base for
# next time in review/upgrade/base/. Conflicts are left in the file between <<<<<<< job and >>>>>>> template.
# The base is, per file: review/upgrade/base/<file> if the job has one, else --base, else job.json's template_commit
# (scripts/new-job.sh records it), else the tag of template_version, else a guess: the template state in git closest
# to the job's files. A guessed base is printed, and --apply then needs it confirmed with --base.
# --check only checks that every file the job has finds what its 'needs' name (no merge).
set -euo pipefail
CALLER=$PWD
cd "$(dirname "$0")/.."
CALLER="$CALLER" exec python3 - "$@" <<'PY'
import difflib, json, os, re, shutil, subprocess, sys, tempfile, time

TPL = 'toolkit/job-template'
USAGE = 'usage: scripts/upgrade-job.sh <job-slug | job folder> [file ...] [--apply] [--base <tag or commit>] | --check'
OUT = []
def say(s=''):
    OUT.append(s); print(s)
def die(s):
    print(s); sys.exit(2)

args = sys.argv[1:]
if not args or args[0] in ('-h', '--help'):
    die(USAGE)
APPLY = CHECK = False; BASE_ARG = None; JOB_ARG = None; NAMED = []
i = 0
while i < len(args):
    a = args[i]
    if a == '--apply': APPLY = True
    elif a == '--check': CHECK = True
    elif a == '--base':
        i += 1
        if i == len(args): die('--base needs a tag or commit, for example --base v0.3.5')
        BASE_ARG = args[i]
    elif a.startswith('-'): die(f'unknown flag {a}\n{USAGE}')
    elif JOB_ARG is None: JOB_ARG = a
    else: NAMED.append(a[2:] if a.startswith('./') else a)
    i += 1
if JOB_ARG is None: die(USAGE)
if CHECK and (APPLY or BASE_ARG or NAMED): die('--check takes only the job')

MAN = json.load(open(os.path.join(TPL, 'TEMPLATE_FILES.json')))['files']
for p in NAMED:
    if p not in MAN:
        near = [q for q in MAN if os.path.basename(q) == os.path.basename(p)]
        die(f'{p} is not in {TPL}/TEMPLATE_FILES.json' + (f'; did you mean {near[0]}?' if near else ''))

# the job folder: a slug under jobs/, or a path from where the command was run
cands = [JOB_ARG if os.path.isabs(JOB_ARG) else os.path.join(os.environ['CALLER'], JOB_ARG), os.path.join('jobs', JOB_ARG)]
JOB = next((c for c in cands if os.path.isfile(os.path.join(c, 'job.json'))), None)
if not JOB: die(f'No job folder with a job.json at {JOB_ARG} (or jobs/{JOB_ARG})')
JOB = os.path.realpath(JOB)
IS_TEMPLATE = JOB == os.path.realpath(TPL)
if IS_TEMPLATE and not CHECK: die('That is the template itself; only --check runs on it')
CFG = json.load(open(os.path.join(JOB, 'job.json')))

def git(*a, raw=False):
    r = subprocess.run(['git', *a], capture_output=True, text=not raw)
    return r.stdout if r.returncode == 0 else None
top = git('rev-parse', '--show-toplevel')
HAVE_GIT = bool(top) and os.path.realpath(top.strip()) == os.path.realpath('.')

def read(path):
    return open(path, 'rb').read() if os.path.isfile(path) else None
def blob(ref, p):
    return git('cat-file', 'blob', f'{ref}:{TPL}/{p}', raw=True) if HAVE_GIT else None
def binary(b):
    return b is not None and b'\0' in b
def lines(b):
    return b.decode('utf-8', 'replace').splitlines(keepends=True) if b else []
def ndiff(a, b):   # lines that differ between two versions of a file; a missing side counts all lines of the other
    if a == b: return 0
    if binary(a) or binary(b): return 1
    return sum(1 for l in difflib.unified_diff(lines(a), lines(b), n=0) if l[:1] in '+-' and l[:3] not in ('+++', '---'))

# a name counts as defined if the file declares or assigns it at the start of a statement
def defines(path, data, name):
    s = data.decode('utf-8', 'replace'); n = re.escape(name)
    if path.endswith('.py'):
        pat = rf'^(?:def\s+{n}\b|class\s+{n}\b|(?:\w+\s*,\s*)*{n}\s*(?:,\s*\w+\s*)*=(?!=)|from\s+\S+\s+import\s+.*\b{n}\b)'
    else:
        pat = rf'(?:\bfunction\s*\*?\s+{n}\b|\bclass\s+{n}\b|\b(?:const|let|var)\s+{n}\b|\bwindow\.{n}\s*=(?!=)|^\s*{n}\s*=(?!=)|,\s*{n}\s*=(?!=))'
    return re.search(pat, s, re.M) is not None

# a need counts only where this copy of the file uses it: it mentions the name, or loads, imports or names the file,
# so an older copy that never used the newer file is not held to it
def mentions(text, q=None, name=None):
    s = text.decode('utf-8', 'replace')
    if name is not None: return re.search(rf'(?<![\w$.]){re.escape(name)}(?![\w$])', s) is not None
    base = os.path.basename(q); stem = re.escape(os.path.splitext(base)[0])
    return bool(re.search(rf'(?<![\w.-]){re.escape(base)}(?![\w-])', s) or
                re.search(rf'''['"]\.{{1,2}}/(?:[\w.-]+/)*{stem}(?:\.\w+)?['"]''', s) or
                re.search(rf'^\s*(?:from|import)\s+{stem}\b', s, re.M))

# what a file's needs lack, in a state given by get(path) -> bytes or None; own is the copy of the file to read
def missing_needs(p, get, own=None):
    own = get(p) if own is None else own
    out = []
    for q, names in (MAN.get(p, {}).get('needs') or {}).items():
        names = [n for n in names if mentions(own, name=n)]
        if not names and not mentions(own, q): continue
        d = get(q)
        if d is None: out.append((q, None))
        else:
            lack = [n for n in names if not defines(q, d, n)]
            if lack: out.append((q, lack))
    return out
def need_text(p, q, lack):
    return f'{p} needs {q}, which ' + ('is missing' if lack is None else 'does not define ' + ', '.join(lack))
def needs_report(paths, get):   # MISSING lines for every listed file that is present; returns the files to bring
    fix = set()
    for p in paths:
        if get(p) is None: continue
        for q, lack in missing_needs(p, get):
            say('MISSING  ' + need_text(p, q, lack)); fix.add(q)
    return fix
REL = os.path.relpath(JOB)
def unsettled(b):   # conflict markers this script wrote and a person has not settled yet
    return b is not None and re.search(rb'^<<<<<<< job\r?$', b, re.M) is not None and re.search(rb'^>>>>>>> template\r?$', b, re.M) is not None

if CHECK:
    fix = needs_report(sorted(MAN), lambda q: read(os.path.join(JOB, q)))
    left = [p for p in sorted(MAN) if unsettled(read(os.path.join(JOB, p)))]
    for p in left: say(f'UNSETTLED  {p} still has conflict markers (<<<<<<< job ... >>>>>>> template)')
    if fix: say(f'Fix: scripts/upgrade-job.sh {REL} ' + ' '.join(sorted(fix)))
    if not fix and not left: say(f'ok    every file in {REL} finds what its needs name ({TPL}/TEMPLATE_FILES.json)')
    sys.exit(1 if fix or left else 0)

MERGED_KINDS = ('template', 'mixed')
SAVED = os.path.join(JOB, 'review', 'upgrade', 'base')
def job_copy(p): return read(os.path.join(JOB, p))
def tpl_copy(p): return read(os.path.join(TPL, p))
def commit_of(ref):
    c = git('rev-parse', '--verify', '--quiet', f'{ref}^{{commit}}') if HAVE_GIT else None
    return c.strip() if c else None

# the template states git knows: one per distinct toolkit/job-template tree, named by a release tag when one has it
def template_states():
    tags = {}
    for t in (git('tag', '-l', 'v*', '--sort=-v:refname') or '').split():
        tags.setdefault(commit_of(t), []).append(t)
    states, by_tree = [], {}
    for row in (git('log', '--format=%H %cs %ct', '--', TPL) or '').splitlines() + [f'{c} tag 0' for c in tags if c]:
        c, date, ct = row.split()
        tree = (git('rev-parse', f'{c}:{TPL}') or '').strip()
        if not tree: continue
        if date == 'tag': date, ct = (git('log', '-1', '--format=%cs %ct', c) or ' 0').split()
        names = tags.get(c, []) + [c[:7]]
        if tree in by_tree:
            s = by_tree[tree]; s['names'] += [n for n in names if n not in s['names']]
            if tags.get(c) and not s['tagged']: s.update(ref=c, date=date, tagged=True)
            s['ct'] = min(s['ct'], int(ct))   # the first time git had this template
        else:
            s = by_tree[tree] = dict(ref=c, date=date, ct=int(ct), names=names, tagged=bool(tags.get(c)), tree=tree)
            states.append(s)
    for s in states:   # a tag name first, the commit after
        s['names'].sort(key=lambda n: (not n.startswith('v'), n)); s['label'] = s['names'][0]
    return states

def guess_base():   # every state scored by the lines its template and mixed files differ from the job's; closest first
    paths = [p for p in MAN if MAN[p]['kind'] in MERGED_KINDS]
    have = [p for p in paths if job_copy(p) is not None]
    r = subprocess.run(['git', 'hash-object', '--stdin-paths'], input='\n'.join(os.path.join(JOB, p) for p in have),
                       capture_output=True, text=True, check=True)
    jhash = dict(zip(have, r.stdout.split()))
    cache, rows = {}, []
    for s in template_states():
        tree = {}
        for row in (git('ls-tree', '-r', s['ref'], '--', TPL + '/') or '').splitlines():
            meta, path = row.split('\t', 1); tree[path[len(TPL) + 1:]] = meta.split()[2]
        per = {}
        for p in paths:
            h = tree.get(p)
            if h == jhash.get(p): per[p] = 0; continue   # the same copy, or neither has it
            if h is not None and h not in cache: cache[h] = git('cat-file', 'blob', h, raw=True)
            # a file on one side only counts all its lines: new-job.sh copies the whole template, so a job without a
            # file the state has was most likely made before that file existed
            per[p] = ndiff(job_copy(p), cache.get(h) if h else None)
        rows.append((sum(per.values()), s, per))
    rows.sort(key=lambda r: r[1]['date'], reverse=True)   # on equal scores the newer state first
    rows.sort(key=lambda r: r[0])
    return rows

GUESSED = False; BASE_REF = None; BASE_LABEL = 'none'
if BASE_ARG:
    BASE_REF = commit_of(BASE_ARG)
    if not BASE_REF: die(f'--base {BASE_ARG}: no such tag or commit in this clone' + ('' if HAVE_GIT else ' (no git here)'))
    BASE_LABEL = f'{BASE_ARG} (given with --base)'
elif CFG.get('template_commit') and commit_of(CFG['template_commit']):
    BASE_REF = commit_of(CFG['template_commit'])
    BASE_LABEL = f"template_commit {BASE_REF[:7]} (template_version {CFG.get('template_version', '?')}, from job.json)"
elif CFG.get('template_version') and commit_of('v' + CFG['template_version']):
    BASE_REF = commit_of('v' + CFG['template_version'])
    BASE_LABEL = f"tag v{CFG['template_version']} (job.json's template_version; its template_commit is not in this clone)"
elif HAVE_GIT:
    rows = guess_base()
    if rows:
        GUESSED = True; BASE_REF = rows[0][1]['ref']; BASE_LABEL = f"{rows[0][1]['label']} (GUESSED, see below)"

def base_copy(p):   # (bytes or None, where it came from)
    s = read(os.path.join(SAVED, p))
    if s is not None: return s, 'saved copy'
    if BASE_REF: return blob(BASE_REF, p), BASE_LABEL.split(' (')[0]
    return None, 'none'

# which files: the ones named, plus what their needs bring when the job lacks it or a name in it (repeat until none)
SEL = list(NAMED) if NAMED else sorted(MAN)
WHY = {}
if NAMED:
    grew = True
    while grew:
        grew = False
        for p in list(SEL):
            own = tpl_copy(p) if MAN[p]['kind'] != 'job' or job_copy(p) is None else job_copy(p)
            if own is None: continue
            for q, lack in missing_needs(p, job_copy, own):
                if q not in SEL and tpl_copy(q) is not None:
                    SEL.append(q); grew = True
                    WHY[q] = f'{p} needs it' + ('' if lack is None else ' to define ' + ', '.join(lack))

def merge3(ours, base, theirs):   # (merged bytes, number of conflicts)
    with tempfile.TemporaryDirectory() as d:
        f = {}
        for k, v in (('job', ours), ('base', base), ('template', theirs)):
            f[k] = os.path.join(d, k); open(f[k], 'wb').write(v)
        r = subprocess.run(['git', 'merge-file', '-p', '--diff3', '-L', 'job', '-L', 'base', '-L', 'template',
                            f['job'], f['base'], f['template']], capture_output=True)
        if r.returncode < 0 or r.returncode > 127: die(f'git merge-file failed: {r.stderr.decode()}')
        return r.stdout, r.returncode

# each file: status, the job's copy after the upgrade, and whether a person has to look
RES = {}
for p in SEL:
    kind = MAN[p]['kind']; ours, theirs = job_copy(p), tpl_copy(p)
    base, src = base_copy(p)
    r = dict(kind=kind, ours=ours, theirs=theirs, base=base, src=src, out=ours, person=False, note='')
    if unsettled(ours):
        r['status'] = 'UNSETTLED'; r['person'] = True
        r['note'] = 'conflict markers from an earlier upgrade are still in it; settle them first, then run this again'
    elif theirs is None:
        r['status'] = 'kept: the template no longer has this file'
    elif ours is None:
        r['status'] = 'add'; r['out'] = theirs
        if kind == 'job': r['note'] = 'a job file: yours from now on'
    elif kind == 'job':
        r['status'] = 'kept: a job file'
        if base is not None and base != theirs and ours != theirs:
            r['note'] = f'the template changed its example since your base ({ndiff(base, theirs)} lines); not merged'
    elif ours == theirs:
        r['status'] = 'current'
    elif base is None:
        r['status'] = 'NO BASE'; r['person'] = True
        r['note'] = 'the job has its own copy and no base was found; left as it is, compare it with the template copy'
    elif ours == base:
        r['status'] = 'update'; r['out'] = theirs; r['note'] = 'the job had not changed it'
    elif theirs == base:
        r['status'] = 'kept: only the job changed it'
    elif binary(ours) or binary(theirs) or binary(base):
        r['status'] = 'CONFLICT (binary)'; r['person'] = True; r['note'] = 'both changed it; left as it is'
    else:
        out, n = merge3(ours, base, theirs); r['out'] = out
        if n:
            r['status'] = f'CONFLICT ({n})'; r['person'] = True
        else:
            r['status'] = 'merged'
        r['note'] = 'the job\'s edits are kept' + ('' if kind == 'mixed' else ' (the job had edited this template file)')
        if n: r['note'] = 'both changed the same lines; settle between <<<<<<< job and >>>>>>> template'
    if r['status'] in ('update', 'add') and not binary(ours) and not binary(theirs):
        d = [l for l in difflib.unified_diff(lines(ours), lines(theirs), n=0) if l[:3] not in ('+++', '---')]
        r['note'] += ('; ' if r['note'] else '') + '+%d -%d lines' % (sum(l[:1] == '+' for l in d), sum(l[:1] == '-' for l in d))
    if p in WHY: r['note'] = WHY[p] + ('; ' + r['note'] if r['note'] else '')
    RES[p] = r

# the report
VER = open('VERSION').read().strip()
HEAD = commit_of('HEAD')
dirty = len((git('status', '--porcelain', '--untracked-files=all', '--', TPL) or '').splitlines()) if HAVE_GIT else 0
say(f'Job: {REL}')
say(f'Template now: {TPL}, VERSION {VER}' + (f', commit {HEAD[:7]}' if HEAD else ', no git here') +
    (f', with uncommitted changes in {dirty} files' if dirty else ''))
say(f'Base: {BASE_LABEL}' + ('; a saved copy in review/upgrade/base/ comes first for its file' if os.path.isdir(SAVED) else ''))
if GUESSED:
    say("  job.json has no template_commit or template_version this clone knows, so the base is the template state")
    say("  closest to the job's template and mixed files (lines that differ, fewer is closer):")
    born = getattr(os.stat(os.path.join(JOB, 'job.json')), 'st_birthtime', None)   # a copied job.json is younger
    for total, s, per in rows[:4]:
        also = [n for n in s['names'] if n != s['label']]
        say(f"    {s['label']:<9} {s['date']}  {total:>5} lines" + (f"  (same template as {', '.join(also)})" if also else '') +
            ('  [first committed after this job\'s job.json was created]' if born and s['ct'] > born else ''))
    far = sorted(((n, p) for p, n in rows[0][2].items() if n), reverse=True)
    say('  The job differs from it in: ' + (', '.join(f'{p} {n}' for n, p in far) or 'nothing'))
    say('  A file the job edited or copied in by hand counts here too. Check the choice before --apply.')
for p, r in RES.items():
    if r['status'] == 'current' or (r['status'] == 'kept: a job file' and not r['note']): continue
    extra = ' [base: saved copy]' if r['src'] == 'saved copy' and r['status'] in ('update', 'merged') else ''
    say(f"  {r['status']:<31} {p}" + (f"  ({r['note']})" if r['note'] else '') + extra)
same = [p for p, r in RES.items() if r['status'] == 'current']
if same: say(f'  {len(same)} files already match the template')
quiet = [p for p, r in RES.items() if r['status'] == 'kept: a job file' and not r['note']]
if quiet: say(f'  {len(quiet)} job files left as they are')
for p, r in RES.items():
    if r['status'] == 'merged' or r['status'].startswith('CONFLICT (') and r['out'] != r['ours']:
        a, b, la, lb = r['ours'], r['out'], f'job/{p}', f'after/{p}'
    elif r['status'] == 'NO BASE':
        a, b, la, lb = r['ours'], r['theirs'], f'job/{p}', f'template/{p}'
    else: continue
    say(f'\n--- {p}: {r["status"]}, {"what the upgrade changes" if lb.startswith("after") else "job copy against template copy"}')
    for l in difflib.unified_diff(lines(a), lines(b), la, lb, n=2): say(l.rstrip('\n'))
say()
final = lambda q: RES[q]['out'] if q in RES else job_copy(q)
fix = needs_report(sorted(MAN), final)
CHANGED = [p for p, r in RES.items() if r['out'] != r['ours']]
PERSON = [p for p, r in RES.items() if r['person']]
NAMES = ' '.join(NAMED)
if not CHANGED and not PERSON and not fix:
    say('Nothing to change: the job already matches the template for these files.')
if not APPLY:
    if CHANGED:
        say(f'Dry run: nothing was written. To write it: scripts/upgrade-job.sh {REL} {NAMES + " " if NAMES else ""}--apply' +
            (f' --base {rows[0][1]["label"]}' if GUESSED else ''))
    sys.exit(0)

used_guess = GUESSED and any(r['src'] == BASE_LABEL.split(' (')[0] for r in RES.values())
if used_guess:
    die(f'Not written: the base was guessed. Check it above, then confirm it: scripts/upgrade-job.sh {REL} ' +
        f'{NAMES + " " if NAMES else ""}--apply --base {rows[0][1]["label"]}')
UP = os.path.join(JOB, 'review', 'upgrade', time.strftime('%Y-%m-%d_%H%M%S'))
n = 1
while os.path.exists(UP + (f'_{n}' if n > 1 else '')): n += 1
UP += f'_{n}' if n > 1 else ''
def put(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'wb').write(data)
for p, r in RES.items():
    if r['out'] != r['ours']:
        if r['ours'] is not None: put(os.path.join(UP, 'before', p), r['ours'])
        put(os.path.join(JOB, p), r['out'])
        src = os.path.join(TPL, p)
        if os.access(src, os.X_OK): os.chmod(os.path.join(JOB, p), os.stat(src).st_mode & 0o777)
    if r['person']: put(os.path.join(UP, 'template', p), r['theirs'])
    # the template copy this file now builds on is its base next time; not for a file left unsettled as it was
    if r['kind'] != 'job' and r['theirs'] is not None and (r['out'] != r['ours'] or r['status'] == 'current'):
        put(os.path.join(SAVED, p), r['theirs'])
if BASE_ARG and HAVE_GIT and not CFG.get('template_commit'):
    v = git('cat-file', 'blob', f'{BASE_REF}:VERSION')
    CFG['template_version'] = v.strip() if v else None; CFG['template_commit'] = BASE_REF
    json.dump(CFG, open(os.path.join(JOB, 'job.json'), 'w'), indent=2)
    say(f"Recorded the confirmed base in job.json: template_version {CFG['template_version']}, template_commit {BASE_REF[:7]}")
say(f'Written: {len(CHANGED)} file{"s" if len(CHANGED) != 1 else ""}.' +
    (f' The job\'s originals: {os.path.relpath(UP)}/before/' if any(RES[p]['ours'] is not None for p in CHANGED) else ''))
if PERSON:
    say('A person has to settle these (the template\'s copies are in ' + os.path.relpath(UP) + '/template/):')
    for p in PERSON: say(f"  {p}: {RES[p]['status']}" + ('; search for <<<<<<< job' if RES[p]['out'] != RES[p]['ours'] else ''))
if fix: say('Then bring what the MISSING lines name: scripts/upgrade-job.sh ' + REL + ' ' + ' '.join(sorted(fix)))
os.makedirs(UP, exist_ok=True)
open(os.path.join(UP, 'report.txt'), 'w').write('\n'.join(OUT) + '\n')
sys.exit(1 if PERSON or fix else 0)
PY
