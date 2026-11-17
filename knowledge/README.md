# Product knowledge

What earlier jobs learned about a product, kept so the next job on the same product starts from a map instead of
from zero (L101, L103). The person asking for a demo often sells the product rather than operates it, so the
studio learns the product itself and writes it down here.

Find what exists for a product with `scripts/find-notes.sh <product words>` (for example `scripts/find-notes.sh
cloud control`). It lists the product's folder here first, then matching job research, interviews, and examples.

## Layout

One folder per product, named with a short slug (`knowledge/cloud-control/`). Each folder holds two files:

- `PLATFORM_MAP.md`: how to drive the product's demo environment. The header gives the last verified date, the
  environment, the identity and role used, and the source jobs. Then: Navigation; What lives where; Real, staged,
  or empty; Actions that change state; Agent probe results (dated); Slow steps; Traps; Evidence that is easy to
  overstate; Not yet explored.
- `ASK_ROUTING.md`: customer asks mapped to candidate demo paths, in a table with the columns Customer ask,
  Candidate path, Evidence we have, and Recheck and stopping point. Read it at interview Step 1.

## Rules for every fact

- Date it (last verified) and label it: **verified** (seen in the UI or an API response on that date), **docs**
  (official documentation only), **absent** (looked for in the tenant and not found on that date), or
  **hypothesis** (inferred, not checked).
- Re-check it live before a storyboard depends on it (L90). These files are maps, not sources: a claim in a video
  still needs the live screen or an official source in the job's `research/SOURCES.md`.
- This folder is committed to a public repo. Write no real people's names or email addresses (fictional demo
  data and shared demo login names are fine), no session, thread, board, or action IDs, no keys or tokens, and no
  one person's working preferences. Write where an ID appears on screen, not the ID itself.
- Keep it to what helps the next build: click paths, what the data supports, what is staged or empty, what
  changes state, what failed and how it failed.

## Upkeep

- The builder never edits `knowledge/`. A local change to a tracked file in the jobs copy makes the next
  `git pull` that touches that file abort.
- At the end of a job, the builder merges the job's `research/DEMO_MAP.md` and `research/AGENT_PROBE.md` (and the
  explorers' reports) into the product's platform map and writes the result to the job's own
  `research/PLATFORM_MAP.md`, starting from the newer of `knowledge/<product>/PLATFORM_MAP.md` and the latest
  job's copy: new facts with their dates, changed facts with the new date and the old value noted ("15 targets on
  2026-09-24, 17 on 2026-11-16"), and anything that no longer appears marked absent with its date. It writes
  `research/ASK_ROUTING.md` the same way, with this job's ask added. Job folders are not committed;
  `scripts/find-notes.sh` lists these copies newest first.
- When a job's copy is newer than `knowledge/<product>/`, start from the newer one.
- At release, the owner copies the newest job's `research/PLATFORM_MAP.md` and `research/ASK_ROUTING.md` into the
  publishing copy's `knowledge/<product>/` and commits them (RELEASING.md). Copy only these two files per
  product, never job folders, and check them against the rules above first.
- A new product gets a new folder with both files, started from the job's copies.
