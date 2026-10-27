# Changelog

What changed in each studio version, newest first. Your version is in the `VERSION` file and on the first line
that `scripts/setup.sh` prints.

## 0.3.3 (2026-10-27)

- New users: the README starts with "Before you start" (Terminal, installing and signing in to Claude Code,
  Node.js, Chrome, git), explains the two Claude windows and which one to talk in, lists which approval questions
  to answer yes to, and gives real build times (3 to 5 hours).
- Fewer approval questions in the builder window: the studio settings pre-approve the toolkit commands with
  `TAG=`, `JPGQ=`, `PURPOSE=`, and `JSONMODE=` in front, and NodeTerm `write`; turning off the sign-in guard always
  asks. Auto-compact is on for studio sessions. A Chrome check rule that never matched is fixed.
- New `lib/status.py` writes status lines for the supervisor, and `lib/clean.py` deletes takes, clips, and render
  chunks only inside the job. Sign-in warnings from `rec.js`, `park.js`, and screenshots now reach `STATUS.md` on
  their own, so the person is told.
- `scripts/setup.sh` fails when Claude was started outside the studio folder, where the studio's agents do not
  load.
- Fewer re-cuts: the interview asks for the whole must-show list and a length ceiling; the storyboard comes with
  the claim check's summary and a contact sheet of the key screens; text-heavy frames are scanned before the rough
  cut; full renders happen only at checkpoints; the job's sign-in is kept until the person says the job is done.
- Conversational products: the builder reads the agent's own question rules before writing requests, and runs
  independent sessions side by side.
- AI caller: the Mac's sound output now goes on BlackHole 16ch too (and back after the job); ChatGPT opens in the
  builder's own Chrome tab group; loopback runs right before each dial. First jobs are steered away from live
  calls.
- Status messages and relays are written in plain words.

## 0.3.2 (2026-10-21)

- AI caller setup is harder to get stuck on. The interview now asks four readiness questions before offering it
  (Webex Calling that can dial out, a ChatGPT voice button, permission to install a driver, the number to dial).
- Setup gains two tests before the builder launches: a ChatGPT voice test (step 7) and a once-per-number test
  call to the real entry point (step 8). Before, the ChatGPT side was first tested after launch.
- BlackHole can be installed without Homebrew, and the docs say to stop and ask IT when the install is blocked.
- New "If something is stuck" list (a leftover recording after a crash, ChatGPT heard on the Mac's speakers,
  missing page labels, microphone blocked) and an "After the job" list (put Webex audio back, or calls stay silent
  on the Mac). The final report now reminds the person of it.
- `scripts/setup.sh` reports whether the BlackHole cables and the Webex app are present. It never fails on it.
- The AI caller doc now says it was verified on one Mac only, and what to do when a ChatGPT or Webex label changes.

## 0.3.1 (2026-10-19)

- The builder no longer reads the lessons file on every job; each lesson is stated once, at its step.
  `LESSONS_LEARNED.md` stays as the history behind each rule.
- The starter take script says not to load a page in apps with single sign-on, where the sign-in guard would end
  the take.
- The voice edge check notes its one false alarm: a number word transcribed as digits.

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
