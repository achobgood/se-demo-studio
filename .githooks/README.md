# Push checks

`scripts/check-repo.sh` looks for leaked keys, personal data, and files that must stay local, checks Python, JavaScript, shell, and JSON syntax, checks that the studio files agree with each other, and confirms `scripts/new-job.sh` works on a fresh copy.

- **Before every push (owner only):** run `git config core.hooksPath .githooks` once in your clone. The `pre-push` hook then runs the checks and blocks a push that fails them.
- **After every push:** GitHub runs the same checks plus a gitleaks secret scan (`.github/workflows/checks.yml`) and emails you if the commit fails.
- **By hand:** run `scripts/check-repo.sh` from the repo root to see one line per check.
