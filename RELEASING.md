# Releasing a new version (owner only)

Teammates only run `git pull` on `main`, so `main` must only ever hold tested, released versions.

## Two copies of the studio

- **Publishing copy** at `~/Documents/se-demo-studio`: you edit here on the `dev` branch. Never run demo jobs here.
  It has `git config --local studio.copy publishing`, so `scripts/setup.sh` reports it as a failure and
  `scripts/new-job.sh` refuses to create a job in it.
- **Jobs copy**: a second clone that stays on `main` and only pulls. Run your real demo jobs here, like a teammate.

## Release steps

1. On `dev`, put the new number in `VERSION` and add a few lines for it to `CHANGELOG.md` with today's date.
   If the release changes guidance a session follows (a reference file, the builder prompt, the job template),
   blind-test it first (L107): give a fresh session only the studio files and the script of a job the guidance was
   not written from, and read where it struggled.
   If the release changes a file of kind `mixed` in `toolkit/job-template/TEMPLATE_FILES.json` (a template file jobs
   edit, such as `build/comp.html` or `build/scenes.js`), say so in CHANGELOG with the file name: a job that takes the
   change with `scripts/upgrade-job.sh` gets it three-way merged and may have conflicts to settle. A new file in the
   template needs its own line in `TEMPLATE_FILES.json` (`scripts/check-repo.sh` fails until it has one).
   If a job in the jobs copy has newer product notes, copy that newest job's `research/PLATFORM_MAP.md` and
   `research/ASK_ROUTING.md` into `knowledge/<product>/` here, check them against `knowledge/README.md`, and add
   them. Never edit `knowledge/` in the jobs copy: its next `git pull` would abort.
2. Run the repo checks: `scripts/check-repo.sh`. Fix anything it reports.
3. Push `dev` (`git push origin dev`), then test it in the jobs copy, which has your key and the installed tools:
   `git fetch && git checkout dev`, start `claude` there and say "do a test run", confirm it finishes and the
   video plays, then `git checkout main`. Do this between jobs, not while a builder is running.
4. Merge into main: `git checkout main && git merge dev`.
5. Tag it: `git tag vX.Y.Z` (the same number as `VERSION`).
6. Publish: `git push origin main dev --tags`, then `git checkout dev`.
7. Tell the team the new version is out and to run `git pull` in their studio folder. A job already under way
   keeps its own copies of the template files; `scripts/upgrade-job.sh <slug>` shows what the new template would
   change in it (a dry run), and `--apply` writes it.
