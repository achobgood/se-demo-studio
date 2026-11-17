# Changelog

What changed in each studio version, newest first. Your version is in the `VERSION` file and on the first line
that `scripts/setup.sh` prints.

## 0.4.0 (2026-11-16)

- Motion segments get a real motion engine: closed-form springs (`spring`, `track`, presets ui, base, heavy) and
  `swapAlpha` in `build/engine.js`; `motion.js` elements gain `spring`, `swap`, and `sfx`, and a `moves` key is the
  arrival time. New render checks: `render.js motionsheet` (one picture per motion state), `strip` (consecutive
  frames around a fast move or swap), `same` (renders a frame twice and compares), and `motioncues` (motion sound
  times). New synthesized sounds whoosh, tick, and pop, merged by `sfx_events.py`, which warns when the cues are
  stale. `lib/lint_timeline.py` flags randomness, clocks, timers, and transitions in the picture code.
- Fixed: the recorded cursor could be placed with the previous frame's camera, so the first frame of a render chunk
  in a zoomed shot showed the cursor in the wrong place.
- Builder rules for motion: banned generic looks, one accent, something new every 2 to 4 seconds, spring presets,
  no text overlap during swaps, a state list per motion segment at the storyboard, a style guide when the job has
  motion segments or the owner gives a reference (grammar, never content), motion sounds well under the voice, and
  a scored critique of motion sheets, strips, and full-size stills inside the existing review (at most two rounds;
  a segment that could pass for a product screen fails honesty).
- Product knowledge: `knowledge/<product>/PLATFORM_MAP.md` and `ASK_ROUTING.md`, starting with Cloud Control.
  `scripts/find-notes.sh <product words>` lists what earlier jobs learned. CLAUDE.md now points every new session
  at the knowledge folder, the helper, and the lessons. Builders write updated copies inside their own job; the
  owner copies them into `knowledge/` at release, so the jobs copy keeps pulling cleanly.
- Research: explorers and the researcher read prior notes first, report coverage and what they did not do, label
  evidence, and log agent probes; new jobs start with `research/DEMO_MAP.md` and `research/AGENT_PROBE.md`
  skeletons and a `research/prior/` folder.
- Lessons L101 to L103: learn the platform yourself and record it, send research to subagents from the start, and
  keep notes findable at launch.
- Optional tool: yt-dlp, for a style reference given as a video link (its command is not yet tested; a downloaded
  file or screenshots work without it).
- Released without the usual test run, at the owner's choice. The repo checks passed, and the motion code, render
  checks, and sound cues were tested on a copy of a finished 5-minute job. Motion sound levels have not been
  checked by ear yet.

## 0.3.5 (2026-11-16)

- Lessons L83 to L88 (feasibility first when a customer asks whether one product can act on another's decision):
  map the decide, send, receive, approve, act, verify, report chain before touring screens; open a workflow's
  steps before trusting its name; search the marketplace for verified items; treat the product's AI assistant as a
  lead; start documentation research in parallel; click the product's links instead of typing URLs. The builder
  template's exploration step now carries these rules.
- Lessons L89 to L98 from owner coaching: answer from the live product first, find earlier research and re-verify
  it, know the studio's voice and music tools before proposing a format, bridge undemoable steps with labeled
  motion graphics instead of shortening the video, read shared references for technique, Opus for reasoning
  subagents and cheaper models or scripts for mechanical work, desktop by default, look before asking for links,
  keep a resume prompt and friction log, and no mirrored-pair copy. Rules added to SKILL.md, INTERVIEW.md, the builder template, and the
  Cisco claim rules.
- Lessons L99 and L100: under a sign-in deadline, record look-only live screens as provisional takes before the
  storyboard is approved; do not rely on a saved assistant thread surviving to the take. Rules added at the
  builder template's storyboard checkpoint and rehearsal step.
- Illustrative motion segments are now part of every job: `build/motion.js` draws abstract lanes, cards, tokens,
  and chips from `STORY.motion` in `story.js`, with an illustrative label on each segment, and fades the screen
  share out underneath. The interview asks which steps the environment cannot show live, and PIPELINE.md says how
  to build the segments without mock screens, logos, or timing claims. Proven on a 5-minute job before release.
- 0.3.4 was never released on its own; its changes ship in this release. Released without the usual test run, at
  the owner's choice; the repo checks passed and the motion code was checked with rendered stills.

## 0.3.4 (2026-11-01)

- AI caller: `record` now uses a small CoreAudio recorder (`capture/cablerec`, built by `check` or `record` with
  swiftc from the Xcode command line tools). ffmpeg left 0.107 s of silence about once a second in calls; a test
  tone now has none. `watch` finds the start of the sound in the WAV, so it no longer hears the file header as
  the call side and hangs up early.
- `scripts/setup.sh` shows free disk space and says LOW under 20 GB. It never changes SETUP OK.
- The publishing copy refuses jobs: with `git config --local studio.copy publishing`, `scripts/setup.sh` reports
  it as a failure and `scripts/new-job.sh` stops before creating anything.

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
