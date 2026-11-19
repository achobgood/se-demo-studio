# Changelog

What changed in each studio version, newest first. Your version is in the `VERSION` file and on the first line
that `scripts/setup.sh` prints.

## 0.5.0 (2026-11-19)

- Lessons from the Contact Center AI agent redo (guidance only):
  - MOTION.md: a fourth firm rule, read and relate: every drawn object can be named by a stranger with no label at
    its smallest size on screen, and stands for something real in that demo. The concept card's question 3 gains a
    prop line per object (what it stands for, the public-sign convention it follows, its smallest size); each object
    gets an Object reading from a crop at that size; a misread is a failed drawing, at least P1, never polish.
    `blind-reader` answers "What is this object?" for single-object stills. STAGE_ENGINE.md names the fourth rule.
    Lesson L108.
  - Redoing a finished job (SKILL.md Step 0, INTERVIEW.md "Redo of a finished job"): check what raw takes, clips,
    call audio, and records the old video points to still exist before offering reuse, and write
    `research/WHAT_CHANGED.md` for the new job.
  - Single sign-on: only the original signed-in tab may work, so explorers and takes adopt it instead of opening a
    new tab (builder prompt Signed-in capture, `demo-explorer`).
  - Takes sized to the narration, about 0.4 s a word between two cue words (PIPELINE.md, `capture/takes/example_take.js`).
  - `knowledge/README.md`: pages that show licensing or tenant-admin state get a Navigation line as well as a Trap.
  - SUPERVISING.md: when the owner sets a hold, ask which work it covers before acting on it.
  - After a blind test on another job: one new reader takes all of a segment's object crops in one reading; objects
    with no public sign pass when a stranger names their kind; a misread object blocks the final; the redo interview
    gives its order (new job early, survival check, then reuse questions), a fallback when the old job's notes are
    missing, and re-checks kept narration.
  - MOTION.md: the event-pass strip for a blind reader uses `--words-off` (`--blind` alone left the words on).
- Recorded calls in the job template, off unless a job sets them (PIPELINE.md, "Recorded call"): new
  `lib/call_prep.py` (two tracks to turns, silence-only cuts, a mix, optional word times) and `lib/call_lines.py`
  (places the call after a segment and writes caption lines with speaker labels), and a `build/call.js` stub. This
  release changes two `mixed` files, three-way merged on upgrade: `build/scenes.js` (call card with speaker labels,
  rings on matched lines with labels in a fixed `gutter` column) and `build/comp.html` (`.callcard` styles, loads
  `build/call.js`). Template files: `lib/mix.py` adds the call track when `build/call_place.json` exists and no
  longer assumes the music is input 2; `lib/deliver.py` merges the call's labelled lines into the captions;
  `build/engine.js` `Callout` takes a `gutter` for labels on the right.
- Small capture and edit tools (PIPELINE.md lists each):
  - `capture/dry.js` rehearses a take with no screencast (`DRY=1` in `capture/rec.js`), printing marks and writing
    `capture/dry/<take>.json`; `click()` and `clickLoc()` take `{ mark: 'name' }` for a mark at the press; every
    take ends by printing its marks in recording seconds.
  - Single sign-on tabs: `ADOPT=<part of the address>` makes `C.tagged()` (so `tab.js`, `rec.js`, `park.js`) tag the
    open signed-in tab with no page load; new job.json key `sso: true` refuses to open a new tab. New
    `capture/closeuntagged.js` closes stray untagged tabs and keeps the untagged product tab unless `--all`.
  - `W()` in `build/engine.js` and `lib/timeline.py` takes `exact`, and warns when a prefix match lands on a longer
    word ("No" matched "Now").
  - New `lib/fit_report.py` compares each key pair's recording span with its narration before `build_clips.py`,
    flagging footage over 1.5x that no RAMPS label covers.
  - `build/scenes.js` (**mixed**, merged three ways on upgrade): a clamped camera key prints the key to paste.
  - `lib/sfx_events.py` drops click and key sounds within 60 ms of the previous one (stacked by jump cuts).
  - New `lib/blur_copy.py` writes a blurred copy of a screenshot for the storyboard sheet (no PIL; stays inside
    ffmpeg's blur limits for any box size).
- Fewer tokens per job:
  - `claim-checker`: the storyboard pass writes `review/claim_table.md` (one row per sentence and on-screen text,
    with ids and source ids); the final pass starts from it and re-checks only new or changed text, screen
    descriptions against the recorded frames, and rows whose source changed. The builder prompt names the pass.
  - `lib/recsheet.py --small`: `review/sheet_<take>_small.jpg`, 4 columns of 480x270, for routine checks; the builder
    prompt keeps full size for frames whose text must be read.
  - A redo's builder reads `research/WHAT_CHANGED.md` first (builder prompt, Read first) and opens the old job's
    README and script only for what it points to.

- Redoing a finished job: the record-demo skill makes a new job from the current template and treats the old job as
  input; continuing a job runs `scripts/upgrade-job.sh <slug> --check` before any newer template file goes in. The
  storyboard now carries a "Motion decisions" list (each step the screens cannot show, yes or no on a motion
  segment, and why), and the supervisor checks it. SKILL.md lists STAGE_ENGINE.md.
- Fifteen motion guidance gaps from the Splunk and Cloud Control motion remake, closed in code and guidance:
  - Template upgrades: `scripts/new-job.sh` records `template_version` and `template_commit` in `job.json` (and
    copies uncommitted template files to `review/upgrade/base/`); new `scripts/upgrade-job.sh <slug> [files] [--apply]
    [--base <tag>]` merges newer template files into a job three ways, keeping the job's own edits, guesses the base
    for older jobs and makes you confirm it, and `--check` names a file missing a function another needs;
    `toolkit/job-template/TEMPLATE_FILES.json` lists every template file as `template`, `mixed` or `job`, with its
    `needs`; `scripts/check-repo.sh` checks the manifest. This release changes all three `mixed` files (template
    files jobs edit, always merged three ways): `build/comp.html`, `build/scenes.js`, `build/motion.js`.
  - `stage.js`: one console line, and no stage drawn, when `engine.js` lacks `springAt` or `track`; `ghosts` (copies
    left `'here'`, `'born'` or at a point, any number) and `art()` `leave`, with an art state copied as its own drawing
    (`ghost` still works); `z` on every helper (a number or timed steps), wires with `z` in their own layer, and
    `art()` `front` for a drawing both behind and in front; a corner-line and title-under-chip check after fonts load;
    optional palette key `draw` for drawings and a 3:1 contrast warning with the nearest colour (never a correction);
    positions as functions of t, `follow`, and `at(t)` on every helper; `join` between stages (`'cut'`, `'push'`, or a
    function written for the concept), `stage.toFrame` and `stage.toWorld`, and `sections`; `window.stageEvents()`
    and `st.ev()`. `stage_demo.js` shows them, and `demoJoins` shows joins and sections.
  - `render.js`: `--sketch` loads `build/cues.json` when it exists, so `W()` works in sketches (and `sketch.js` now
    loads before `engine.js`); `--words-off` hides every word in `#stage` and prints `WORDS LEFT` for any that still
    shows; new `events` mode (frames before, at and after every stage event, sheets under 2,576 px); `same` compares
    page state too, with verdicts SAME, RASTER NOISE (exit 0, with a crop) and DIFFERENT (naming the element and
    property); new `state` mode.
  - `render.js --blind` (on by itself with `--words-off`): `motionsheet`, `strip` and `events` sheets show times only,
    and `events` sheets are named `sheet_NN.jpg`, so a blind reader's sheets name no segment, shot or event; every
    contact sheet stays at or under 2,576 px on its long edge.
  - `lib/sample_colors.py` prints the image size first, explains an out-of-bounds point with the 1920 to 2560 scale,
    and takes `--against '#hex'` for WCAG contrast.
  - New agent `blind-reader` (`.claude/agents/blind-reader.md`): opens images only, at most 20 per reading, answers
    the one words-off question into an answer file; the builder runs it, and the supervisor reads its answer.
  - MOTION.md: the sketch uses take cues when a take exists, one stage and folder per segment; words-off and WORDS
    LEFT; the blind reader at Think 2 and Critique; a story pass and an event pass with a 20-image budget in place of
    "every 0.1 to 0.25 s"; status names as questions, and a third named legibility miss; corner-line fixes as
    options; transitions between stages as a choice; the three `same` verdicts. STAGE_ENGINE.md documents every new
    option, adopting stages in an older job, depth, moving with something else, one stage to the next, the palette
    at 2560 px with `draw` and `--against`, and the `events` and `state` modes. SUPERVISING.md and the builder prompt
    name the blind reader, the review package and the upgrade script.
- The drawn traveller (`kind: 'art'`) draws whole and in place, takes the accent as its stroke by default, and
  crossfades at each change to or from a drawing instead of vanishing for 6 frames.
- With stages on a light palette, the template's title, agenda, close, call-to-action, and chapter chips take their
  text colours from the palette, so they stay readable.
- `--words-off` also hides SVG text on stages and any element with class `st-words`; MOTION.md says words drawn on
  an object count as words.
- MOTION.md: the palette is sampled (or marked provisional) before the sketch, and `sketch.js` holds it; the honesty
  bans are marked firm; three lines that restated one job's plan are gone. SUPERVISING.md asks for the concept card,
  picture check, signature stills, and reader's sentence instead of a state list.
- MOTION.md is split: the method, firm checks, and critique stay; the engine reference (helpers, kinds, camera keys,
  sizes, flags, palette, curves, transitions, sound, render commands) moves to `STAGE_ENGINE.md`.
- After an adversarial review (60 notes, 7 P0): MOTION.md is restructured around an order of work, marks its three
  firm rules (honesty, legibility, determinism) and calls everything else a default, says plainly that the method is
  under test (its numbers come from outside reading applied in one job), and gives firm checks: a crop test for
  product look-alikes, a read-aloud legibility test, and a P0 when a reader with the words off cannot say what
  happened. The signature moment can now be rendered before any voice take (`render.js ... --sketch`, with
  `build/sketch.js`, `build/sketch.html`) and with every word hidden (`--words-off`). The stage engine: a stage
  without `pushOut` no longer hides the footage after it ends; boxes, travellers, and drawings hide with `display`, so
  a frame no longer depends on the frame rendered before; the Illustrative line defaults on; `name` and `cam` default;
  a drawn traveller (`kind: 'art'`); dashed shapes keep their dashes; palette and key checks; the template background
  gives way to the stage ground when a job has stages. `stage_demo.js` is a story-free demo of every helper.
  `frozen_time.py` counts changed pixels (a moving dot now counts), lists stretches inside the ranges only, and
  rejects a range past the end; `sample_colors.py` checks bounds and has `min`; `grab.py` reports a time past the end.
  To use stages in a job made before this release, run `scripts/upgrade-job.sh <slug> build/stage.js
  build/comp.html build/scenes.js` (STAGE_ENGINE.md, Adopting stages in an older job) instead of copying files.
- After a blind test on another job: MOTION.md says where a segment can earn its place, that the job's prompt wins
  (a segment it does not allow can be proposed at the storyboard), how to show that something did not happen, that
  faceless figures and hands may appear as props, and what palette to use with no product footage. Its examples are
  now patterns on topics no job uses, and the template's worked example is a door and a badge instead of boxes and a
  pill. `art()` parts can turn about a pivot and slide, and SVG may use the palette names. Lesson L107.
- MOTION.md numbers are starting points, not quotas: each video's plan can be its own (pull-backs, transition
  kinds, shot counts, sizes, durations), with departures noted in the style guide. Only honesty, legibility, and
  determinism are firm.
- Motion: MOTION.md now teaches how to think before how to build. A concept card per segment (story, verb, picture
  of the verb, traveller, honesty line), the signature moment built and approved first, and shots instead of a
  wallboard; then motion by role with numbers, transitions with a cause, look rules in numbers, three extra critique
  questions, and what did not work (subframe motion blur, a light ground for a dark product). Lessons L104 to L106.
- New optional stage engine in the job template: `build/stage.js` (camera on a world with arrival-time keys, a
  traveller that morphs between card, code, token, and dot states, line art that draws on, drawn connectors with a
  pulse, receivers that react, a push between screen share and stage, per-word title reveals) and `build/stages.js`
  with a worked example. Jobs without stages are unchanged. `lib/sample_colors.py` samples the palette from footage;
  `lib/grab.py` pulls frames from a rendered video; `lib/frozen_time.py` measures how much of each motion segment
  is frozen. MOTION.md also gains a fresh-reviewer rule, "every action visibly produces a result", and a shot table
  column for what survives each cut.
- Findability (guidance maps, no new rules): the builder reads the part of a reference it needs at each step.
  - Builder prompt "Read first": a "What to read, and when" table by job step, and section pointers in place of
    whole-file reads of MOTION.md, STAGE_ENGINE.md, and PIPELINE.md. MOTION.md "Order of work" names what to read
    at each step. STAGE_ENGINE.md and PIPELINE.md open with "Which part you need" and gain subheadings inside their
    long sections.
  - Pointers have one form, `MOTION.md § Think 1` (a file, then the start of one of its headings), and
    `scripts/check-repo.sh` fails on one that leads nowhere. It also prints the guidance word count; RELEASING.md
    step 1 asks a pass to report it before and after and to merge or replace old rules where it can.
  - New `lib/lint_copy.py` (template file): em and en dashes, back-to-back questions, banned phrases, and stage
    directions in the spoken script. Run before each claim check; a clean run lets the claim checker skip those rules.
  - Files that disagreed now agree: the blind reader's Legibility asks for MOTION.md's three misses and gains an
    Honesty reading (MOTION.md gives the crop); the claim checker skips the template's placeholder script at the
    storyboard, reads `research/CLAIMS.md` only if it exists, and has a `flags` column. MOTION.md says how segments
    are numbered; STAGE_ENGINE.md says where a stage's camera sits without keys.
- Builder prompt in two parts: the supervisor fills the template as before, then `scripts/split-prompt.sh <slug>`
  cuts it at the template's `===== AFTER STORYBOARD =====` line into `PROMPT.md` (launch to storyboard) and
  `PROMPT_AFTER_STORYBOARD.md` (takes, audio, pacing, review, output), read when `STORYBOARD APPROVED` arrives. It
  writes nothing if a slot is left. SKILL.md Step 4, SUPERVISING.md (the approval note, a relaunch or compacted builder
  re-reads part 2), and check-repo (exactly one marker, slots balanced on each side). Jobs already under way keep one
  PROMPT.md.
- Decisions on open questions: for Cloud Control, `knowledge/cloud-control/` comes before the example's
  PRODUCT_NOTES.md; a step the owner lists for motion gets motion unless the builder recommends "no" at the
  storyboard with a reason; `research/CLAIMS.md` is the builder's claim list and `review/claim_table.md` the
  checker's verdicts citing it; the Legibility reading gets each line's on-screen seconds; the Object reading's
  answer file is required before the storyboard; CISCO_CLAIM_RULES.md allows filming a proposed product from a local
  prototype under four conditions (owner's yes, a "Proposed, not a shipping product" line on every prototype screen,
  the proposal as the source, no availability, pricing, or roadmap claim).
- Smaller: one home for the "no voice take yet" text (STAGE_ENGINE.md § Files and sketches); sketch folder names
  agree across MOTION.md, PIPELINE.md, sketch.js, and render.js; the claim checker is told exactly which rules
  `lib/lint_copy.py` tests, so it still judges mirrored pairs and slogans.
- Three contradictions settled (builder prompt, MOTION.md): facts take the fourth label, hypothesis, as
  `knowledge/README.md` already says; takes that depend on an earlier one are recorded in story order and
  independent ones in parallel; the shot table is written after approval and the takes.

## 0.4.1 (2026-11-17)

- Motion rules moved out of the builder prompt into `references/MOTION.md`, read only when a job needs motion: steps
  the environment cannot show, an abstract scene that clearly makes the demo clearer, or an owner style reference. A
  demo that can show everything on real screens uses no motion, and motion is never decoration. A motion segment the
  interview did not ask for is named at the storyboard for the owner to approve. The honesty rule (a segment that
  could pass for a product screen fails) stays in the builder prompt itself.

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
