---
name: record-demo
description: Plan, record, and produce a narrated virtual SE product demo video (or a short product ad) from a live, signed-in product in Chrome, with AI voice, captions, and a player page. Use when the person says "help me record a demo", "make a demo video", "build a virtual SE demo", asks you to come up with a demo idea or scenario for a video in their product or environment, asks to continue, redo, or remake a demo job in jobs/, or says "do a test run" (a short first video that proves the setup, with no demo environment or sign-in).
model: claude-opus-5-5
effort: high
---

# Record a demo

You run a small studio. The person tells you what they want in an interview; you research the product, set up a
job, launch a builder session that explores, records, narrates, and renders the video, and bring the story back
for their approval before final recording. Everything happens inside this folder.

Current effort for this session: ${CLAUDE_EFFORT}

## Step 0: preflight (every time)

Run this before any exploration or planning, including when the conversation started as brainstorming a demo
idea. A missing key or the wrong effort found after an hour of planning costs a restart.

0. **Studio root.** The session must start in the studio root (the folder holding `.demo-studio`); the studio's
   agents (`demo-researcher`, `demo-explorer`, `claim-checker`) only register there. Check first with
   `ls .demo-studio`: if it is not found, or the Agent tool says an agent is not found, ask the person to type
   `/exit`, `cd` to the studio root, and run `claude` again (L80). If they would rather not, run a
   general-purpose agent instead, with the agent file's body from `.claude/agents/<name>.md` pasted in as its
   instructions, and say you did.
1. **Model and effort.** This studio must run on Opus 5.5 at high effort. If the effort shown above is not
   `high`, or the session is not running `claude-opus-5-5`, stop and ask the person to run `/model
   claude-opus-5-5` and `/effort high`, then continue. The studio settings set both, but personal settings can
   override them.
2. **Continuing a job?** If the person names an existing job, or `jobs/*/SUPERVISOR.md` shows a builder still
   running, read that job's `SUPERVISOR.md`, `ORCHESTRATOR_NOTES.md`, and newest files, tell them where it
   stands, and resume supervising (references/SUPERVISING.md). Skip the interview. Before that job's builder takes
   any newer template file, run `scripts/upgrade-job.sh <slug> --check` and tell the person what it would change.
   **Redoing a finished job?** If the person asks to redo or remake a finished video (for example to use features
   the studio gained since it was made), make a new job from the current template (Step 2, a new slug such as
   `<old-slug>-v2`) and treat the old job as input, not as the place to work. Read its `INTERVIEW.md`,
   `research/`, `STORYBOARD_READY.md`, and `ORCHESTRATOR_NOTES.md`, run a short interview on what should change,
   and re-check every fact live (L90, L103). Before you offer to reuse anything, check what still exists: raw takes
   (`capture/rec/`), edit clips (`assets/clips/`), call audio (`audio/calls/`, if it played a call), and each record
   the old video points to, opened live (a history or debug row can expire, some after about 30 days). Offer only
   what survives, and write `research/WHAT_CHANGED.md` in the new job once the interview is read back
   (references/INTERVIEW.md, Redo of a finished job, which gives the order). Plan it with what the studio can do
   now, including illustrative motion for steps the product cannot show (Step 1 asks which). Copy narration or footage across only when the person
   wants them kept; to keep working in the old folder instead, run `scripts/upgrade-job.sh <slug> --check` first.
3. **Setup.** Run `scripts/setup.sh`. If it does not end with "SETUP OK", walk them through
   references/SETUP.md one failing line at a time, including OpenRouter. Never ask for the key in chat and never
   read `.env`.

## Test run

Use this when the person says "do a test run", or when `jobs/` does not exist yet (their first time) and they
agree to one before the interview. It records a short narrated video of a public cisco.com page with the files in
`test-run/` (next to this skill), proving the install, OpenRouter key, capture, voice, render, captions, and player.
No interview, research, claim check, music, or storyboard stop. Run Step 0 first (items 0, 1, and 3).

Tell them first: it takes about 5 to 10 minutes and about 2 cents of OpenRouter credit (the job's cap is $1); a separate
Chrome window opens on a public Cisco page, with nothing to sign in to; leave it alone while it records (about a minute).

1. From the studio root: `scripts/new-job.sh test-run --test-run` (if `jobs/test-run` exists, use `test-run-2`, and
   so on; `<slug>` below). It copies the ready-made test files and settings into the job.
2. `scripts/chrome.sh <slug>`. In `jobs/<slug>/`: `node capture/rec.js take1 capture/takes/test_run.js`, then
   `python3 lib/recsheet.py take1 4 12 26 44` and look at `review/sheet_take1.jpg`: the Cisco page, no cookie banner.
3. Voice: `python3 lib/take.py T1 google/gemini-3.8-flash-tts Iapetus`, `python3 lib/stt.py audio/takes/T1.wav`,
   `python3 lib/check_take.py T1`, `python3 lib/build_voice.py T1` (it must end with `edge check: ok`).
4. Picture and sound: `python3 lib/build_clips.py`, `python3 lib/cursor_tracks.py`, `python3 lib/sfx.py`,
   `python3 lib/sfx_events.py`, `python3 lib/mix.py out/mix.wav`.
5. Render: `build/render_par.sh out/<slug>_v1.mp4 8 out/mix.wav`, `python3 lib/deliver.py <slug>_v1.mp4`,
   `python3 lib/spend.py`. Then from the studio root `scripts/chrome.sh <slug> --stop`.

If a step fails, stop and tell them which part of the setup it points to (key, Chrome, voice, render), using
references/SETUP.md. Tell them after: the video is `jobs/<slug>/out/<slug>_v1.mp4` and the player with captions
is `jobs/<slug>/player.html` (offer `open jobs/<slug>/player.html`); what it cost; and that a real demo starts with
the interview, needs a demo environment they sign in to, and takes 3 to 5 hours (8 in a job whose scope grew after
its final). Offer to start it.

## Step 1: interview

Follow references/INTERVIEW.md. Start by asking for the ask in their own words, then the rounds of questions.
Once you know the product, read `knowledge/<product>/ASK_ROUTING.md` if it exists: it maps customer asks to paths
earlier jobs checked in the demo environment, so you can propose a story it supports. When a job's copy
(`jobs/<slug>/research/ASK_ROUTING.md`, listed by `scripts/find-notes.sh`) is newer than knowledge/, start from the
newer one. The person may not know the
product well; you learn it and record it (L101, L103). Save answers to `jobs/<slug>/INTERVIEW.md` once the job exists (keep them in your notes until then). Read the
summary back and get a yes.

If the conversation already settled most answers (for example the person asked for a demo idea and you discussed
it), do not run the full rounds. Propose the story in plain words, ground it in the environment (Step 3), then ask
only the questions still open, each with a recommendation.

## Step 2: create the job

Create the job as soon as the product and environment are known, even before the story is settled, so every look
at the product happens in the job's own Chrome and the person signs in once.

1. `scripts/new-job.sh <slug>` (assigns a free Chrome port).
2. Fill `jobs/<slug>/job.json`: title, disclosure, budget, hours, `app_url`, `app_match`, theme, respellings.
3. Write `INTERVIEW.md` in the job folder. Add a "Verified facts" section (exact names, values hidden behind
   variables or settings panels, which records exist, schedules, identities, each with where you saw it) and a
   "Still unverified" list that the builder's exploration must close before the storyboard.

## Step 3: research (in parallel with sign-in)

Before launching anything, run `scripts/find-notes.sh <product words>` from the studio root. It lists
`knowledge/<product>/` first, then matching job research, interviews, and examples, newest first. Copy the files
this job will use into `jobs/<slug>/research/prior/` and name them in the researcher brief as a map; every fact
in them is re-checked live (L90, L103). When a job's copy of a product's notes is newer than knowledge/, start from
the newer one. Answer the ask from the live product and official docs, not from local notes alone (L89). Send
documentation research to the researcher from the start, split by question (L102). The `demo-explorer` agents
belong to the builder, which gives them one shared brief built from `research/prior/`, one product area each;
this step runs only the researcher and your own look, so no more than two agents drive the browser (L12).

1. Launch the `demo-researcher` agent in the background with the product, the audience, the ask, the job path,
   and the files in `research/prior/`. It writes `research/SOURCES.md` (verbatim quotes, URLs, availability, contradictions) and
   `research/PRODUCT_UNDERSTANDING.md` (problem, how it works, workflow with exact surface names, where the value
   comes from, must-not-claim list, demo moments).
2. Meanwhile start the job's Chrome with `scripts/chrome.sh <slug> <demo url>` and ask the person to sign in
   there. For dCloud, they reserve or open the instant demo first and paste its launch URL. Time-limited demos
   reward starting capture soon after sign-in. They sign in to every surface the story uses (references/INTERVIEW.md
   question 14), and sign out of single-session apps in any other browser first.
3. In the person's own environment, or whenever the story depends on specific configuration, do your
   reconnaissance in that same Chrome through `capture/tab.js` from the job folder, not in another browser. Look
   only; record what you confirm in INTERVIEW.md's "Verified facts". Take no screenshot until the page is signed in.

## Step 4: write the builder prompt

Copy the prompt from references/BUILDER_PROMPT_TEMPLATE.md into `jobs/<slug>/PROMPT.md` and fill every slot from
the interview and the research (for Cisco products also apply references/CISCO_CLAIM_RULES.md). Replace each slot
by its full `{{...}}` text, never by a key prefix: a script that matches `{{PRODUCT` also hits any longer slot that
starts with the same word. Check that no `{{` remains (`grep -n '{{' jobs/<slug>/PROMPT.md`). Tell the person in three or four lines what the builder will
do and that it will stop for their approval at the storyboard.

## Step 5: launch and supervise

If the job uses the AI caller, first walk the person through references/AI_CALLER.md "Setup" and launch only
after its test call (step 6) and ChatGPT voice test (step 7) pass. Launch the builder from the studio root with `--model claude-opus-5-5`: as a NodeTerm session, or in a second
Terminal window when NodeTerm is not installed (both in references/SUPERVISING.md). Then supervise. Relay LOGIN NEEDED, OWNER DECISION NEEDED, and TOOL REQUEST messages, and relay OWNER
ACTION NEEDED at once (a take is waiting on it; when the demo must respond, only after the builder says its tested
responder is armed); present the storyboard in full at STORYBOARD READY and pass their
decision back; check the rough cut; give the final report.

## Rules that hold throughout

- The person's words in the interview outrank these defaults; write every change into PROMPT.md's "Owner
  decisions".
- Never type, read, or store passwords, one-time codes, cookies, tokens, or the OpenRouter key.
- Never do tenant administration in a demo environment, except the specific changes the person allowed by name in
  the interview, each with its reset rule and logged; never touch another job's Chrome port.
- Never record, screenshot, or keep a sign-in, SSO, password, or one-time-code page. If a raw frame or screenshot
  shows one, delete the raw files (not just edit copies), log it, and ask the person to sign in again off camera.
- Opus 5.5 for every session and for any subagent whose work needs reasoning (research, evaluation, storyboard,
  script, claim checks), including before a job exists. Mechanical subagents (render checks, screenshot passes,
  file sweeps) may use Sonnet or Haiku; renders and scans run as scripts, not model calls (L94).
- Look in open tabs, other jobs' `job.json`, and research notes before asking the person for a link or an
  identifier (L96). When they share a reference, ask what it changes in how the video is built, not only whether
  its topic matches (L93).
- From the first hour, keep a resume prompt and a friction log in the job (L97).
- Keep "the video is done" separate from "the video is approved for customers". No brand, legal, SME, or human
  listening review happens here unless the person does it.

## References

- references/INTERVIEW.md: the questions and how to ask them.
- references/SETUP.md: requirements, OpenRouter, model and effort, disk.
- references/BUILDER_PROMPT_TEMPLATE.md: the builder's prompt.
- references/SUPERVISING.md: launching, watching, the storyboard checkpoint, the final report.
- references/PIPELINE.md: every toolkit command in order.
- references/MOTION.md: rules for illustrative motion segments and the style guide; read it only when the job has
  steps the environment cannot show, an abstract scene would clearly help, or the owner gave a style reference.
- references/STAGE_ENGINE.md: the stage engine's helpers, palette, sound, and render commands for motion segments;
  MOTION.md says when to read it.
- references/LESSONS_LEARNED.md: the history behind each rule's (L7) citation; not required reading.
- references/CISCO_CLAIM_RULES.md: sourcing, wording, and branding for Cisco products.
- references/MODELS.md: which OpenRouter models worked.
- references/AI_CALLER.md: a live phone call placed and held by ChatGPT voice mode, no human on the line.
- examples/cloud-control-se-demo/ (studio root): a finished 5-minute demo, end to end.
