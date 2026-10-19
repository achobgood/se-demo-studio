# Releasing a new version (owner only)

Teammates only run `git pull` on `main`, so `main` must only ever hold tested, released versions.

## Two copies of the studio

- **Publishing copy** at `~/Documents/se-demo-studio`: you edit here on the `dev` branch. Never run demo jobs here.
- **Jobs copy**: a second clone that stays on `main` and only pulls. Run your real demo jobs here, like a teammate.

## Release steps

1. On `dev`, put the new number in `VERSION` and add a few lines for it to `CHANGELOG.md` with today's date.
2. Run the repo checks: `scripts/check-repo.sh`. Fix anything it reports.
3. Do one test run (ask Claude to "do a test run") and confirm it finishes.
4. Merge into main: `git checkout main && git merge dev`.
5. Tag it: `git tag vX.Y.Z` (the same number as `VERSION`).
6. Publish: `git push origin main dev --tags`, then `git checkout dev`.
7. Tell the team the new version is out and to run `git pull` in their studio folder.
