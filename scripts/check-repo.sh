#!/bin/bash
# Checks for a broken or leaky push. Runs before every push (.githooks/pre-push) and on GitHub
# after every push (.github/workflows/checks.yml). Only tracked files are checked.
# usage: scripts/check-repo.sh    Prints "ok" or "FAIL" per check; exits 1 if anything failed.
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

# Studio consistency: lesson citations, the builder prompt template, the studio marker, executable bits.
python3 - > "$TMP/studio" <<'PY'
import os, re, subprocess
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
    body = "\n".join(lines[marks[0] + 1:marks[1]])
    opened, closed = body.count("{{"), body.count("}}")
    if opened != closed:
        print(template + ": %d '{{' but %d '}}' between the ===== lines" % (opened, closed))
if not os.path.exists(".demo-studio"):
    print(".demo-studio: marker file is missing")
for row in subprocess.check_output(["git", "ls-files", "-s"], text=True).splitlines():
    mode, path = row.split()[0], row.split("\t", 1)[1]
    must_run = re.fullmatch(r"scripts/[^/]+\.sh", path) or path in (
        "toolkit/job-template/build/render_par.sh", ".githooks/pre-push")
    if must_run and mode != "100755":
        print(f"{path}: not executable in git (fix: git update-index --chmod=+x {path})")
PY
report studio "$TMP/studio"

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
fi
report smoke "$TMP/smoke"

[ "$FAILED" = 0 ] || echo "Some checks failed. Fix the lines marked FAIL, commit, and run scripts/check-repo.sh again."
exit "$FAILED"
