# Changelog

What changed in each studio version, newest first. Your version is in the `VERSION` file and on the first line
that `scripts/setup.sh` prints.

## 0.3.0 (2026-10-19)

- The builder's instructions now state what earlier jobs learned at the step where it applies, instead of
  leaving 27 of those lessons in a file the builder had to read and remember.
- Typing on camera now waits 80 to 150 ms per key, as intended; it could go as fast as 52 ms, which rich text
  boxes can drop.
- Stills and renders now warn when a camera push-in aims too close to the frame edge to center there.
- Voice assembly prints the loudness step at each join between takes, next to the same spot in the main take, so
  splices are judged by a number.

## 0.2.0 (2026-10-19)

- First time? Say "do a test run": a 50-second narrated video of a public Cisco page in about 5 to 10 minutes,
  for a few cents. It proves your setup before you book a demo environment.
- Fixed: on a fresh clone, creating a job failed because the template's empty folders were missing.
- Your jobs folder is never part of the repo now; it is created the first time you make a job.
- Updates: run `git pull`. Setup shows your version on its first line and reinstalls the tools when they change
  (once after this update, about 400 MB).
- The studio is licensed under Apache 2.0; the bundled fonts keep their own open font licenses.
- The model list no longer suggests a free test voice that OpenRouter removed.

## 0.1.0 (2026-10-19)

- First release: say "help me record a demo" and Claude interviews you, researches the product from official
  sources, explores your signed-in demo in Chrome, and asks you to approve a storyboard and talk track before it
  records.
- The finished job is a narrated video with an AI voice, captions, a player page, and a report of each claim with
  its source and what it cost.
- `scripts/setup.sh` checks your Mac, installs the capture and render tools, and checks your OpenRouter key and
  its spending limit.
- AI caller: for demos that need a live phone call into the product, ChatGPT voice plays the caller, with a guided
  one-time setup the first time you use it.
- Includes a finished 5-minute Cisco Cloud Control demo in `examples/` to show what a job produces.
