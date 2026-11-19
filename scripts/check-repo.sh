#!/bin/bash
# Checks for a broken or leaky push. Runs before every push (.githooks/pre-push) and on GitHub
# after every push (.github/workflows/checks.yml). Only tracked files are checked.
# usage: scripts/check-repo.sh    Prints "ok" or "FAIL" per check, plus one "info" line; exits 1 if anything failed.
set -uo pipefail
cd "$(git rev-parse --show-toplevel)" || exit 1
TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
FAILED=0

# report <check name> <file with one problem per line>
report() {
  if [ -s "$2" ]; then sed "s/^/FAIL  $1: /" "$2"; FAILED=1; else echo "ok    $1"; fi
}

# Leaks: secrets, personal data, and files that must never be in a public repo.
# The patterns match real key shapes, so a regex that only mentions a prefix does not trip them.
python3 - > "$TMP/leaks" <<'PY'
import os, re, subprocess
PATTERNS = [
    ("OpenRouter or OpenAI style key", r"(?<![A-Za-z0-9])sk-[A-Za-z0-9_-]{20,}"),
    ("GitHub token", r"\b(?:gh[po]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,})"),
    ("AWS access key", r"\b(?:AKIA|ASIA)[0-9A-Z]{16}\b"),
    ("AWS secret key", r"(?i)aws_secret_access_key\s*[=:]\s*['\"]?[A-Za-z0-9/+]{40}"),
    ("private key block", r"-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----"),
    ("phone number", r"(?<![\w.])(?:\+?1[ .-]?)?\(?[2-9][0-9]{2}\)?[ .-][0-9]{3}[ .-][0-9]{4}(?![0-9])"),
    ("home folder path", r"/Users/[A-Za-z0-9._-]+/"),
]
EMAIL = r"[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}"
EMAIL_OK = {"sec_ops_user_NN@dcloud.cisco.com", "noreply@anthropic.com"}
files = [f for f in subprocess.check_output(["git", "ls-files", "-z"], text=True).split("\0") if f]
for f in files:
    parts = f.split("/")
    if parts[0] == "jobs":
        print(f"{f}: tracked file under jobs/ (job folders stay local)")
    if re.fullmatch(r"\.env(\..+)?", parts[-1]) and parts[-1] != ".env.example":
        print(f"{f}: tracked .env file")
    if ".chrome-profile/" in f + "/":
        print(f"{f}: tracked Chrome profile file")
    if not os.path.isfile(f):
        continue
    if os.path.getsize(f) > 5 * 1024 * 1024:
        print(f"{f}: larger than 5 MB ({os.path.getsize(f) // 1024} KB)")
    data = open(f, "rb").read()
    if b"\0" in data:
        continue  # binary file, such as a font
    for n, line in enumerate(data.decode("utf-8", "replace").splitlines(), 1):
        for name, pat in PATTERNS:
            for m in re.finditer(pat, line):
                print(f"{f}:{n}: {name}: {m.group(0)[:12]}...")
        for m in re.finditer(EMAIL, line):
            if m.group(0) not in EMAIL_OK:
                print(f"{f}:{n}: email address not on the allowlist: {m.group(0)}")
PY
report leaks "$TMP/leaks"

# Syntax: Python and JSON here, JavaScript and shell below.
PYTHONPYCACHEPREFIX="$TMP/pycache" python3 - > "$TMP/syntax" <<'PY'
import json, py_compile, subprocess
for f in subprocess.check_output(["git", "ls-files", "-z", "*.py", "*.json"], text=True).split("\0"):
    if f.endswith(".py"):
        try:
            py_compile.compile(f, doraise=True)
        except py_compile.PyCompileError as e:
            line = getattr(e.exc_value, "lineno", "?")
            print(f"{f}:{line}: Python syntax error: {getattr(e.exc_value, 'msg', e.msg)}")
    elif f.endswith(".json"):
        try:
            json.load(open(f, encoding="utf-8"))
        except ValueError as e:
            print(f"{f}:{getattr(e, 'lineno', '?')}: invalid JSON: {getattr(e, 'msg', e)}")
PY
command -v node > /dev/null || echo "node is not installed, so JavaScript was not checked" >> "$TMP/syntax"
while IFS= read -r -d '' f; do
  case "$f" in
    *.js) command -v node > /dev/null || continue
          node --check "$f" 2> "$TMP/err" ||
            echo "$f:$(head -1 "$TMP/err" | sed 's/.*://'): JavaScript $(grep -m1 'Error' "$TMP/err")" >> "$TMP/syntax" ;;
    *.sh|.githooks/pre-push)
          bash -n "$f" 2> "$TMP/err" || echo "$(head -1 "$TMP/err")" >> "$TMP/syntax" ;;
  esac
done < <(git ls-files -z)
report syntax "$TMP/syntax"

# Studio consistency: lesson citations, the builder prompt template, the studio marker, executable bits, and section
# pointers in the guidance. Like the rest of this check, it reads the working tree of tracked files.
python3 - "$TMP" > "$TMP/studio" <<'PY'
import os, re, subprocess, sys
REFS = ".claude/skills/record-demo/references/"
lessons = set(re.findall(r"^\s*(L\d+)\.", open(REFS + "LESSONS_LEARNED.md").read(), re.M))
for f in subprocess.check_output(["git", "ls-files", "-z", "*.md"], text=True).split("\0"):
    if f and os.path.isfile(f):
        for n, line in enumerate(open(f, encoding="utf-8"), 1):
            for cite in sorted(set(re.findall(r"\bL\d+\b", line)) - lessons):
                print(f"{f}:{n}: cites {cite}, which is not a lesson in {REFS}LESSONS_LEARNED.md")
template = REFS + "BUILDER_PROMPT_TEMPLATE.md"
lines = open(template, encoding="utf-8").read().split("\n")
marks = [i for i, l in enumerate(lines) if l.strip() == "====="]
if len(marks) != 2:
    print(f"{template}: needs exactly one pair of ===== lines, found {len(marks)} such lines")
else:  # the text between the ===== lines is what gets copied into a job's PROMPT.md
    body = lines[marks[0] + 1:marks[1]]
    opened, closed = "\n".join(body).count("{{"), "\n".join(body).count("}}")
    if opened != closed:
        print(template + ": %d '{{' but %d '}}' between the ===== lines" % (opened, closed))
    # scripts/split-prompt.sh cuts a filled prompt at this line, so a slot must not span it
    AFTER = "===== AFTER STORYBOARD ====="
    cut = [i for i, l in enumerate(body) if l.rstrip("\r\n") == AFTER]   # exact, as split-prompt.sh matches it
    if len(cut) != 1:
        print(f"{template}: needs exactly one '{AFTER}' line between the ===== lines, found {len(cut)}")
    else:
        for side, part in (("before", body[:cut[0]]), ("after", body[cut[0] + 1:])):
            opened, closed = "\n".join(part).count("{{"), "\n".join(part).count("}}")
            if opened != closed:
                print(template + ": %d '{{' but %d '}}' %s the '%s' line" % (opened, closed, side, AFTER))
if not os.path.exists(".demo-studio"):
    print(".demo-studio: marker file is missing")
for row in subprocess.check_output(["git", "ls-files", "-s"], text=True).splitlines():
    mode, path = row.split()[0], row.split("\t", 1)[1]
    must_run = re.fullmatch(r"scripts/[^/]+\.sh", path) or path in (
        "toolkit/job-template/build/render_par.sh", ".githooks/pre-push")
    if must_run and mode != "100755":
        print(f"{path}: not executable in git (fix: git update-index --chmod=+x {path})")
# Pointers such as "MOTION.md § Think 1" must name a guidance file and the start of a heading in it, so a renamed
# heading cannot silently break a map. A heading is "#" to "######" and a space, outside ``` fences.
guide = [f for f in subprocess.check_output(["git", "ls-files", "-z", "CLAUDE.md", "RELEASING.md",
         ".claude/skills/record-demo/SKILL.md", REFS + "*.md", ".claude/agents/*.md"], text=True).split("\0")
         if f and os.path.isfile(f)]
tracked = set(subprocess.check_output(["git", "ls-files", "-z"], text=True).split("\0"))
open(os.path.join(sys.argv[1], "guidance"), "w").write("".join(f + "\0" for f in guide))
def headings(f):
    fenced, out = False, []
    for line in open(f, encoding="utf-8"):
        if line.lstrip().startswith("```"):
            fenced = not fenced
        elif not fenced and re.match(r"#{1,6} ", line):
            out.append(line.split(" ", 1)[1].strip())
    return out
by_name, heads = {}, {}
for f in guide:
    by_name.setdefault(os.path.basename(f), []).append(f)
    heads[f] = headings(f)
# A pointer with a folder (knowledge/README.md § Upkeep) names a tracked file from the studio root.
POINTER = re.compile(r"(?<![\w.-])((?:[\w.-]+/)*[A-Z0-9_]+\.md) § ([^;,()|\n]*)")
for f in guide:
    for n, line in enumerate(open(f, encoding="utf-8"), 1):
        found = POINTER.findall(line)
        for name, want in found:
            want = want.strip()
            want = want[:-1].rstrip() if want.endswith(".") else want
            if "/" in name:
                where = [name] if name in tracked else []
                if where and name not in heads:
                    heads[name] = headings(name)
            else:
                where = by_name.get(name, [])
            if len(where) != 1:
                why = "more than one guidance file has that name" if where else "no guidance file has that name"
            elif not want or not any(h.startswith(want) for h in heads[where[0]]):
                why = "no heading in " + where[0] + " starts with that text"
            else:
                continue
            print(f"{f}:{n}: {name} § {want}: {why}")
        if line.count("§") > len(found):
            print(f"{f}:{n}: a § that is not part of a pointer (the form is MOTION.md § Think 1)")
PY
report studio "$TMP/studio"
# For information only, never a failure: the size of the guidance files the pointer check read.
[ -f "$TMP/guidance" ] && echo "info  guidance words: $(xargs -0 cat < "$TMP/guidance" | wc -w | tr -d ' ')" \
  "in $(tr -cd '\0' < "$TMP/guidance" | wc -c | tr -d ' ') files (CLAUDE.md, RELEASING.md, record-demo SKILL.md and references, agents)"

# Template manifest: every tracked file in toolkit/job-template is listed in TEMPLATE_FILES.json with a kind, every
# listed file exists, and each file a 'needs' entry names defines the names listed (scripts/upgrade-job.sh reads it).
python3 - > "$TMP/template" <<'PY'
import json, os, subprocess
T = "toolkit/job-template"; M = T + "/TEMPLATE_FILES.json"
try:
    files = json.load(open(M, encoding="utf-8"))["files"]
except (OSError, ValueError, KeyError) as e:
    print(f"{M}: cannot read its 'files': {e}"); raise SystemExit
for f in subprocess.check_output(["git", "ls-files", "-z", T], text=True).split("\0"):
    p = f[len(T) + 1:]
    if f and p != "TEMPLATE_FILES.json" and p not in files:
        print(f"{f}: not in {M} (add it with kind template, mixed or job)")
for p, e in files.items():
    if e.get("kind") not in ("template", "mixed", "job"):
        print(f"{M}: {p} has kind {e.get('kind')!r}, not template, mixed or job")
    if not os.path.isfile(os.path.join(T, p)):
        print(f"{M}: lists {p}, which is not in {T}")
    for q in (e.get("needs") or {}):
        if q not in files:
            print(f"{M}: {p} needs {q}, which is not listed")
PY
if [ ! -s "$TMP/template" ]; then
  scripts/upgrade-job.sh "toolkit/job-template" --check | grep '^MISSING' | sed "s|^MISSING  |toolkit/job-template: |" >> "$TMP/template"
fi
report template "$TMP/template"

# Smoke: a fresh copy of the committed HEAD can create a job.
: > "$TMP/smoke"
mkdir "$TMP/copy" && git archive HEAD | tar -x -C "$TMP/copy"
if ! (cd "$TMP/copy" && scripts/new-job.sh ci-smoke) > "$TMP/err" 2>&1; then
  echo "scripts/new-job.sh ci-smoke failed: $(tail -1 "$TMP/err")" > "$TMP/smoke"
else
  python3 - "$TMP/copy/jobs/ci-smoke/job.json" >> "$TMP/smoke" <<'PY'
import json, sys
try:
    job = json.load(open(sys.argv[1]))
    if job.get("slug") != "ci-smoke" or not isinstance(job.get("chrome_port"), int):
        print(f"new job's job.json has slug {job.get('slug')!r} and chrome_port {job.get('chrome_port')!r}")
except (OSError, ValueError) as e:
    print(f"new job has no readable job.json: {e}")
PY
  # once the committed copy has the upgrade path: the new job records its base, and an upgrade finds nothing to change
  if [ -f "$TMP/copy/toolkit/job-template/TEMPLATE_FILES.json" ]; then
    python3 - "$TMP/copy" >> "$TMP/smoke" <<'PY'
import json, os, sys
d = json.load(open(os.path.join(sys.argv[1], "jobs/ci-smoke/job.json")))
v = open(os.path.join(sys.argv[1], "VERSION")).read().strip()
if d.get("template_version") != v:
    print(f"new job's job.json has template_version {d.get('template_version')!r}, not VERSION {v!r}")
PY
    (cd "$TMP/copy" && scripts/upgrade-job.sh ci-smoke) > "$TMP/err" 2>&1 || true
    grep -q '^Nothing to change' "$TMP/err" ||
      echo "scripts/upgrade-job.sh ci-smoke on a new job found changes or failed: $(grep -v '^ ' "$TMP/err" | tail -1)" >> "$TMP/smoke"
  fi
fi
report smoke "$TMP/smoke"

[ "$FAILED" = 0 ] || echo "Some checks failed. Fix the lines marked FAIL, commit, and run scripts/check-repo.sh again."
exit "$FAILED"
