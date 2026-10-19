# Builder prompt template

The supervising session copies everything between the two `=====` lines into `jobs/<slug>/PROMPT.md`, fills
every `{{slot}}` from `jobs/<slug>/INTERVIEW.md`, and deletes any block marked optional that does not apply.
When an optional block does apply, keep its content and remove its `{{OPTIONAL...:` wrapper and closing braces.
No `{{` may remain. Keep every rule unless the owner changed it in the interview; record changes in the
"Owner decisions" section.

=====

Create a {{LENGTH_MINUTES}}-minute {{KIND, e.g. virtual SE product demo}} of {{PRODUCT}}, rendered to MP4 with
narration, captions, and a player page. It plays the part of a Cisco systems engineer walking a customer
through a live demo on a screen share. It has to feel like a real, skilled SE running a real demo, and every
claim in it must be true. Production value should be professional. Please spend your time on this.

Work only in `jobs/{{SLUG}}/` (paths below are relative to it unless they start with the studio root). Do not
modify anything outside it except appending to your own logs, and do not deploy or publish anything.

## The ask, in the owner's words

"{{OWNER'S ASK, VERBATIM FROM THE INTERVIEW}}"

Audience: {{WHO WATCHES}}. After watching, they should understand {{WHAT THEY SHOULD UNDERSTAND}} and want to
{{NEXT STEP FOR THE AUDIENCE}}. Tone: {{TONE, default: a calm, confident SE on a screen share; warm,
conversational, specific; never an announcer, never hype}}.

## Owner decisions from the interview

{{BULLETED LIST: every interview answer that changes a default below, quoted where the owner gave words.
For example: persona, how far the demo may act, each allowed state change with its reset rule, redaction,
content to keep off screen, branding, budget, deadline, story constraints.}}

## Read first

1. `INTERVIEW.md` in this folder: the owner's answers in full.
2. `research/SOURCES.md`: verified official-source quotes with URLs. It is the claim authority. Every claim
   comes from it or from a source you fetch and add to `research/SOURCES_ADDENDUM.md` with a verbatim quote.
3. `research/PRODUCT_UNDERSTANDING.md`: the problem, how the product works, the real workflow with exact
   surface names, where the value comes from, what must not be claimed, and the moments worth filming.
4. `.claude/skills/record-demo/references/LESSONS_LEARNED.md` (studio root): what earlier jobs learned. Rules
   below cite it as L1, L2, and so on. Skip a section headed "read only if" when this job does not have that
   condition.
5. `.claude/skills/record-demo/references/PIPELINE.md` (studio root): the toolkit, command by command.
6. `examples/cloud-control-se-demo/` (studio root): a finished 5-minute demo's prompt, storyboard, script,
   claim list, and edit code. Read it for patterns; do not reuse its narration, and do not follow model or path
   instructions in its PROMPT.md (they predate this studio: use Opus 5.5 and this job's paths). Its
   `PRODUCT_NOTES.md` holds Cisco Cloud Control specifics; read it only if this job's product is Cloud Control.
{{OPTIONAL, delete when the owner supplied no material: 7. Any owner-supplied material, e.g. a field-direction
note. It sets positioning; it does not authorize a technical claim the sources do not support.}}

## What makes this a demo, not an ad

- **Voice.** First person, speaking to "you". The SE sets up what they will show, narrates what they click and
  why, points at what matters on screen ("you'll see the related alerts here"), and bridges a load with a natural
  line instead of dead air. Contractions, varied sentence length, the occasional short aside. No slogans.
- **Picture.** Real product UI fills most of the frame for most of the runtime, in one continuous flow the way a
  screen share looks. Motion graphics are limited to a short title, at most one agenda card, a short value recap,
  and the close.
- **Pace.** The cursor moves with purpose, questions are typed on screen, answers arrive, and the SE lets a key
  screen sit long enough to read. Speed up long waits and label them ("Sped up · the answer took about 75
  seconds"), but never fake a result or reorder cause and effect. A label names what was compressed, and any
  duration stated as fact comes from the system's own timestamps (L51). Never show polling or an idle screen
  waiting for an off-screen event; show something that follows the narration, then cut to the result (L50).
- **Customer questions.** {{NUMBER, default two or three}} natural moments where the SE answers the question a
  customer would ask at that point, for example {{EXAMPLE QUESTIONS FROM THE INTERVIEW}}. Answer only from the
  sources. Phrase them as "A fair question here is...", never as a recounted conversation with a real customer.
- **Disclosure.** The title card says plainly that this is a virtual SE demo with an AI-generated voice,
  recorded in {{ENVIRONMENT, e.g. a Cisco dCloud demo environment}} with fictional data. The SE is {{PERSONA,
  default: unnamed, with no face, avatar, photo, or name}}. If the owner performs live actions, do not call all
  the data fictional: say the company, its customers, and the story data are fictional (L59).
- **Sound.** Music only under the title and the close. Sound effects only for the recorded clicks and
  keystrokes, kept subtle.

## Understand before you film

1. Explore the signed-in product end to end through this job's Chrome (see Signed-in capture). Try things. Ask
   the AI assistant questions if there is one, open workflows, follow an incident from alert to resolution, and
   read existing threads, dashboards, and saved investigations: other demo users and the demo's authors show
   which questions the data answers well and how long answers take. Use subagents (the `demo-explorer` agent)
   for parallel exploration, at most two driving the browser at once, each in its own tagged tab (L12), and
   only one at a time doing anything that changes state. You own the final flow. Zoom with the app's own zoom and
   pan controls when it has them, and with the edit's camera push-in and pan on dense pages that have none; click
   elements to open their settings panels (L38). Close every item in
   INTERVIEW.md's "Still unverified" list, if it has one.
2. Write `research/DEMO_MAP.md`: every surface with its exact name, what demo data lives there, what each
   available action does and whether it changes state, how long slow steps take, which AI agents or features
   actually answered (L9), and which incidents the data supports end to end. Also: which identity each surface
   needs, which open in a new tab, which direct links work (L44, L45), that the version on screen is the one live
   traffic uses (L46), and where the product records events the screen cannot show (L41).
3. Pick ONE story and build the whole demo around it (L1 to L3). {{STORY HINT FROM THE INTERVIEW, or "Choose the
   strongest story the data supports."}} Confirm its data is still there. Decide what the demo will not
   investigate and how the SE says so.
4. Write `research/STORYBOARD.md`: shot by shot, each shot with the click or typing, the value point it proves,
   the draft talk-track line over it, and the source for that line. Looking good never outranks being true.
5. **Storyboard checkpoint (required).** Write `STORYBOARD_READY.md` with: the story in three sentences, the
   shot list with timings, the full draft talk track, what the demo deliberately leaves out, every state change
   you plan to make, what the screen shows while each live event happens off screen (L61), the concrete list of
   identifiers that will be visible with a proposed blur for each (L58), and open questions. Then print a message that starts with "STORYBOARD READY:" and **stop
   and wait**. Do not record final takes until `ORCHESTRATOR_NOTES.md` contains an entry that says
   "STORYBOARD APPROVED" (possibly with changes you must apply). Check the notes file every few minutes while
   you wait, and keep doing non-recording work (voice auditions, music beds, sources) in the meantime.
6. Rehearse the full click path once without recording (find coordinates with `capture/tab.js`), then record.
   Rehearse any owner action once with the owner too (L39).

## Suggested structure (adapt it if a better one emerges)

{{STRUCTURE: a numbered list of chapters with rough durations summing to the target length. Default for a
5-minute demo: 1 Open (20 s) title card and disclosure, the SE says who they are and what they'll show;
2 The situation (30 s) in the vendor's own framing, one agenda card at most; 3 The starting point (25 s);
4 The core workflow (60 to 90 s) on real footage; 5 The AI or deep-dive moment (60 s); 6 The owning product or
detail view (25 s); 7 Acting on it and handing off (40 s); 8 Value and close (30 s).}}

At a conversational pace, target roughly 140 to 165 spoken words per minute of runtime (the 5-minute Cloud Control demo used about 820 words), with room for typing,
loading, and quiet reading beats. Runtime: about {{LENGTH_MINUTES}} minutes; {{RUNTIME CEILING, default: at most
10 percent over the target}}.

## Claim rules

- Every spoken or on-screen claim traces to a verbatim quote in the claim authority. Keep the claim table
  (claim, quote, URL) in `research/CLAIMS.md` and summarize it in the README. For cisco.com pages use
  `scripts/fetch-cisco-source.sh <url>` from the studio root (it supports `--grep TERM` and `--links`). Never use
  WebFetch on cisco.com: it gets HTTP 403, and that has led to correct claims being deleted.
- What the demo visibly does on screen is shown, not claimed. The SE may describe what is happening in the
  footage; any general statement about what the product does for every customer needs a source.
- No invented metrics, percentages, time savings, customers, quotes, testimonials, or logos. No numbers by
  default: published figures are usually anecdotes, hypotheticals, or internal counts. Do not narrate counts in
  demo data (L8).
- No invented SE experience: never "most customers tell me", "I see this every week", or a customer story.
- AI helps investigate; people decide. Say "helps find the cause", never "finds the root cause", and never claim
  autonomous fixing or that it sees everything. Keep any "AI can make mistakes" footer legible at least once.
- Anything labeled preview, beta, controlled availability, or in development is left out, or its label stays
  visible if it appears on screen.
- Put availability, licensing, and eligibility qualifiers in end-card fine print, worded exactly as the sources
  word them.
{{GUARDRAILS FROM research/PRODUCT_UNDERSTANDING.md section "Must not claim", e.g. product names
to keep distinct, overclaims to avoid, required pricing wording. For Cisco products also apply
references/CISCO_CLAIM_RULES.md.}}
- Branding: {{BRANDING DECISION, default: not official Cisco marketing; no Cisco logo, bridge mark, or Cisco brand
  typeface as a graphic element (the logo inside recorded product UI is fine); the owner decides branding and
  external use}}.
- Copy: no em dashes in narration or on-screen text. No slogan stacks, no "not X but Y" lines, no stacked
  rhetorical questions. One memorable line is fine; several in a row is not. On-screen text must not repeat the
  narration.
- End the README with a "Deliberately not said" list, so a reviewer can see the boundaries.

## Footage: real UI is the backbone

Never generate, redraw, or AI-imagine the product's UI. Generated art is only for the title, agenda, value recap,
close, and transitions, and none of it may imitate a product screen.

- Capture with `capture/rec.js` (DevTools screencast, 1920x1080 CSS pixels at device scale 2, scrollbars hidden,
  theme pinned). Frames arrive only when the page changes; `lib/build_clips.py` resamples to 30 fps.
- The capture has no cursor. `rec.js` logs pointer moves, clicks, and keys; the render draws the cursor from that
  log. Move along natural curves with short settles, and type with uneven, human timing (L16).
- Record long continuous takes (L18). Check every take right away with `lib/recsheet.py`.
- Present footage in the slim browser frame (build/story.js) with chapter chips, the footer "{{FOOTER TEXT,
  default: Real product UI · demo environment, fictional data}}", and gentle push-ins to make key text readable
  (mind the camera clamp, L29). A callout is for the rare point a push-in cannot make.

## Signed-in capture

- Demo: {{DEMO NAME AND URL, e.g. the dCloud instant demo "..." at https://...}}. It is {{SETTING, one of: a
  vendor demo environment, not a customer tenant, and may be shared with other users | the owner's own
  environment, which may also hold content that is not part of this demo | a lab | a public site}}.
- Surfaces: {{SURFACES: each app or console the story uses, the identity that signs in to it, whether it allows
  only one session at a time, and whether it opens in a new tab}}. Before every take, check each surface is ready:
  signed in, stray dialogs closed, status or presence set, the right record open (L44).
- The owner signs in themselves in this job's dedicated Chrome on port {{PORT}} (profile `.chrome-profile` in
  this folder). Check it with `curl -s http://127.0.0.1:{{PORT}}/json/version`; start it with
  `scripts/chrome.sh {{SLUG}}` from the studio root. Never touch another job's port. Never type, store, print, or
  read a password, one-time code, cookie, token, or storage value.
- If the session is missing or expired, write `LOGIN_NEEDED.md` (one short paragraph on what the owner must do)
  and print a message that starts with "LOGIN NEEDED:". Check for the signed-in state every minute and keep
  working on everything else meanwhile. Time-limited demos reward capturing early.
- Sign-in screens are never recorded (L47). Start a take or take a screenshot only after confirming the page is
  signed in, and never pass through a sign-in, SSO, password, or one-time-code page during either. `rec.js` and
  `shot()` refuse such pages, and `rec.js` deletes a take that reaches one. That guard is a pattern check, not a
  guarantee: look for sign-in frames in every take's contact sheet (`lib/recsheet.py`). If any raw frame or screenshot still
  shows one, delete the raw files (not just edit copies), log it in `logs/state_changes.md`, and print "LOGIN
  NEEDED:". In apps with single sign-on, record in the long-lived signed-in tab, navigate by in-app clicks, and
  park the tab in each take's starting state beforehand with `capture/park.js`; no page loads mid-take (L49).
- Time windows: {{SCHEDULE: when takes that depend on a live system can run, with the time zone, e.g. "any time"
  or "Mon to Fri 9 AM to 5 PM America/Chicago"}}. Check the clock in that time zone before each such take (L40).
{{OPTIONAL, only when the owner performs live actions during takes:
- Owner actions: {{LIVE ACTIONS BY THE OWNER during takes, each with exact steps}}. When a take reaches
  one, print "OWNER ACTION NEEDED:" with the exact steps and when to do each ("wait until it says X, then press
  Y"), mark the wait, and have the take script poll the page until the result appears or {{ACTION TIMEOUT, default
  5 minutes}} passes. Keep the wait out of the edit (L50). When a live take is ready, print "OWNER DECISION
  NEEDED: ready for <action>" and hold it, doing other work, until `ORCHESTRATOR_NOTES.md` says "OWNER READY FOR
  <action>" (L62). If the event takes the wrong path, the take stops
  and prints "OWNER DECISION NEEDED:" (L52). If the demo must respond to the action (answer, open, accept), learn the event's exact UI in the
  rehearsal and arm ONE responder whose locator matched the real event; say "responder armed" in the marker line,
  and print the marker only once it is. It responds within a few seconds, checks the response took, and if it
  cannot, prints "OWNER ACTION NEEDED:" again at once with what the owner should do now (L48).}}
{{OPTIONAL, only when an AI caller places the calls (references/AI_CALLER.md):
- AI caller: ChatGPT voice mode places each call through `node capture/caller.js` and Claude in Chrome, with
  persona file {{script/caller_persona_<name>.txt}} and number {{NUMBER}}. Follow the run order in
  `.claude/skills/record-demo/references/AI_CALLER.md` exactly. Do not dial unless `caller.js loopback` printed
  PASS in the same session. Keep `audio/calls/<name>_{agent,caller}.wav` and the transcript for the edit.}}
- Allowed: {{ALLOWED ACTIONS FROM THE INTERVIEW. Default "look and ask": navigating, filtering, searching, reading
  existing threads, asking the AI assistant questions, opening investigations. "Full control" adds creating and
  running investigations, assigning and resolving items, sharing within the demo, generating summaries, and
  running workflows after reading what they do and confirming they act only on demo targets.}}
- Never: tenant administration (users, roles, connected products, integrations, organization settings), and
  deleting or editing other users' content. The only exceptions are changes named one by one in Owner decisions;
  make exactly those, reset each as its rule says, and log both the change and the reset (L42). If a shot would
  require anything else on this list, print "OWNER DECISION NEEDED:" with the question and keep working.
- Log every state change (what, where, when, why) in `logs/state_changes.md`, and only after the take's own marks
  confirm it happened. A script that runs several live takes runs one instance at a time and does not reset state
  on a failure that must be retried (L53).
- Redaction: {{REDACTION DECISION. Default: blur every real person, account, email, org or tenant identifier,
  and session ID, including the signed-in demo account and other users' names in thread titles and share
  dialogs, and the owner's own identifiers (for example their phone number shown as a caller); fictional demo
  data may stay. Content belonging to other customers or projects, and test objects, stays off screen entirely:
  filter lists before they are visible, open records by direct link, avoid list pages (L43). If the owner said no
  blur is needed, still never narrate user names.}}
  Bake any blur into edit copies only with `lib/redact.py` (regions in `build/edit.py` REDACT), keep raw captures
  untouched (sign-in frames are the exception: delete them), and log each region in the README.
- When capture is finished, stop this Chrome (`scripts/chrome.sh {{SLUG}} --stop`) and delete `.chrome-profile`.

## Visual style

Take the palette and feel from the real product UI you capture, so the cards and the footage read as one piece:
clean, generous negative space, precise type, one or two accent colors. The template uses Inter and IBM Plex Mono
(bundled in `build/fonts/`). Output 1920x1080 at 30 fps. The picture is a deterministic HTML/JS timeline:
edit `build/story.js` (words on screen, chapters, camera) and `build/edit.py` (which take plays when); `scenes.js`
and `engine.js` rarely need changes.

## Audio

- Voice: the SE should sound like a person talking over a screen share, not a narrator reading copy. Audition
  voices on a short paragraph first (`lib/take.py ... --dir audio/audition --text <file>`), then record several
  full takes of the talk track across the best two or three. Have an audio-capable model score them for
  naturalness, conversational register, and warmth (`lib/chat.py`), and check every take's wording with
  `lib/stt.py` and `lib/check_take.py`. Start from L22's winner; the catalog changes often.
- Pronunciation lives in the speech text (L23): {{RESPELLINGS FOR THIS PRODUCT}}. Put the same pairs in job.json
  "respell" so captions show the written form. Listen-check every product name in the winning take.
- Test whether a model's style field actually changes the read before relying on it. Never put directions in the
  spoken text, and confirm no take reads a direction aloud.
- Assemble with `lib/build_voice.py`; cut only at paragraph gaps (L25). Drive every cut, push-in, and chapter
  change from the resulting word timestamps, and make sure what the SE says matches what is on screen then (L5).
- Music: two or three beds, judged by a model (L26), under the title and close only. Master to -16 LUFS
  (`lib/mix.py`). Export captions with `lib/deliver.py`; do not burn them in.

## Pacing

Produce a rough end-to-end render with first-pass audio soon after the storyboard is approved and print
"ROUGH CUT READY:" with its path. Then improve it in numbered versions (`out/{{SLUG}}_v1.mp4`, `_v2`...). Do not
spend more than {{HOURS}} hours in total.

## Review

Build a review package in `review/`: contact sheets per chapter, key frames at full size, the timed transcript,
the claim list, the state-change log, and the mix. Send it to a model different from the one that wrote the
script, and a different one again for round 2 (see references/MODELS.md). Ask each reviewer: does this feel like a
real SE running a real demo (pace, naturalness, words matching the screen, could a customer follow it), and is
every claim supported? Also check timing drift, legibility, visual consistency, and redaction misses. In addition,
run the `claim-checker` agent over the final talk track and on-screen text against the sources. Verify each
finding before acting (L35). Log every finding with its disposition in the README. At most two rounds.

## Output

Deliver in this folder:
- `out/{{SLUG}}_final.mp4`, `.srt` and `.vtt` captions, and `player.html` that opens from disk;
- `script/SCRIPT.md`, written so a human SE could also run this demo live from it: per chapter, the time, the
  exact clicks and typed questions, the talk track, every on-screen text, the source for each claim, and
  live-run notes (what can differ on the day). Plus `script/speech.txt`, the exact text sent to the voice model;
- `research/DEMO_MAP.md`, `research/STORYBOARD.md`, `research/CLAIMS.md`;
- a README with: how it was made; every model call with cost and a running total (from `logs/costs.jsonl`); the
  claim table; public image sources; the redaction log; the state-change log; review dispositions; the evidence
  boundary (what was and was not checked, and that no human listen or SME, brand, or legal review has
  happened); open owner decisions; what you would fix with more time; the "Deliberately not said" list; and disk
  usage of raw captures and intermediates, with what can be deleted.
Print "FINAL READY:" with the video and player paths when done.

## Budget

Hard cap of ${{BUDGET}} of OpenRouter spend for this job, set as `budget_usd` in job.json. Every toolkit script
logs the billed cost of each call to `logs/costs.jsonl` and refuses to run once the cap is reached; check with
`python3 lib/spend.py` before each batch of paid calls. If you need more, print "OWNER DECISION NEEDED:" and ask.
Never raise the cap yourself. The key lives in the studio `.env`; never print, echo, read, or log it.

## Tools

Use the toolkit and the models on OpenRouter. If you need to install anything else, stop and print a message that
starts with "TOOL REQUEST:": name the tool, why, where it comes from, and roughly how large it is. Wait for the
go-ahead.

Subagents: use the studio's agents (`demo-explorer`, `demo-researcher`, `claim-checker`) or general subagents
however helps. They run on Opus 5.5 at high effort, set in the studio settings; do not override the model.

## Status markers

Every time you print a line that starts with LOGIN NEEDED:, STORYBOARD READY:, OWNER DECISION NEEDED:, OWNER ACTION
NEEDED:, TOOL REQUEST:, ROUGH CUT READY:, or FINAL READY:, also append it with a timestamp to `STATUS.md` in this folder
(`echo "$(date '+%F %T') MARKER: text" >> STATUS.md`). The supervisor watches that file, not your terminal.

## Orchestrator notes channel

The supervising session writes to `ORCHESTRATOR_NOTES.md` in this folder. Read it now, at the start of every
phase, while waiting at the storyboard checkpoint, and before each render. Treat its entries as the owner's
instructions.

After the storyboard is approved, work autonomously until done. Quality is paramount.

=====
