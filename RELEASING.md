# Releasing a new version (owner only)

Teammates only run `git pull` on `main`, so `main` must only ever hold tested, released versions.

## Two copies of the studio

- **Publishing copy** at `~/Documents/se-demo-studio`: you edit here on the `dev` branch. Never run demo jobs here.
- **Jobs copy**: a second clone that stays on `main` and only pulls. Run your real demo jobs here, like a teammate.

## Release steps

1. On `dev`, put the new number in `VERSION` and add a few lines for it to `CHANGELOG.md` with today's date.
2. Run the repo checks: `scripts/check-repo.sh`. Fix anything it reports.
3. Push `dev` (`git push origin dev`), then test it in the jobs copy, which has your key and the installed tools:
   `git fetch && git checkout dev`, start `claude` there and say "do a test run", confirm it finishes and the
   video plays, then `git checkout main`. Do this between jobs, not while a builder is running.
4. Merge into main: `git checkout main && git merge dev`.
5. Tag it: `git tag vX.Y.Z` (the same number as `VERSION`).
6. Publish: `git push origin main dev --tags`, then `git checkout dev`.
7. Tell the team the new version is out and to run `git pull` in their studio folder.
