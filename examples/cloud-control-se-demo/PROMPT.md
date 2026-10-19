Create a pure JavaScript animation: a 5-minute virtual SE product demo of Cisco Cloud Control,
with appropriate audio, rendered to MP4. It plays the part of a Cisco systems engineer walking a
customer through a live demo on a screen share. The entire video should be as high of a
production value as possible, and it has to feel like a real, skilled SE running a real demo.
Please spend your time on this, it's very important.

You can use any tools you can find access to and resources on the internet. You create the
script, the assets, the animation, the concept, everything.

## The ask, in the owner's words

"Can you take this base prompt and help me write a script for what basically functions as an SE
demo of Cloud Control. We want something to be about 5 minutes long and it to server as basically
a virtual SE giving a demo to a customer instead of a real one. It needs to feel real and tell a
story and walk a customer through a demo. I'll have Cloud Control on Chrome to use."

On how far the demo may go, the owner said: "Full control, you should investigate via browser
control." On who is speaking: an unnamed SE talking to a generic customer.

Audience: customers who would otherwise sit through a live demo with their Cisco SE. Network and
IT operations leaders and the engineers who get paged when something breaks. After watching, they
should understand how Cloud Control works through one real troubleshooting story, where its value
comes from, and what stays with the product consoles they already run. They should want to
connect the Cisco products they already own and try it. Tone: a calm, confident SE on a screen
share. Warm and conversational, specific, never an announcer, never hype.

## What makes this a demo, not an ad

A prior job in `.scratch/cloud-control-ad/` made a 90-second ad from the same demo. This is a
different piece. Hold these differences throughout:
- **Voice.** First person, speaking to "you". The SE sets up what they will show, narrates what
  they click and why, points at what matters on screen ("you'll see the related alerts here"),
  and bridges a load with a natural line instead of dead air. Contractions, varied sentence
  length, the occasional short aside. No slogans, no stacked taglines.
- **Picture.** Real product UI fills most of the frame for most of the runtime, in one continuous
  flow the way a screen share looks. Motion graphics are limited to a short title, a one-card
  agenda, a short value recap, and the close. No abstract "hook" montage.
- **Pace.** A real demo breathes: the cursor moves with purpose, questions are typed on screen,
  answers arrive, and the SE lets a key screen sit long enough to read. Speed-ramp long waits,
  but never fake a result or reorder cause and effect.
- **Customer questions.** Two or three natural moments where the SE answers the question a
  customer would ask at that point, for example "Does this replace my controllers?", "Can the AI
  change my network on its own?", and "What does this cost?". Answer only from the sources.
  Phrase them as "A fair question here is...", never as a recounted conversation with a real
  customer.
- **Disclosure.** The opening card or a lower third says plainly that this is a virtual SE demo
  with an AI-generated voice, recorded in a Cisco dCloud demo environment with fictional data.
  The SE is unnamed. No face, avatar, photo, or name for the SE.
- **Sound.** Music only under the title and the close, and at most a very quiet bed under the
  agenda. None under the walkthrough. Sound effects only for the recorded clicks and keystrokes,
  kept subtle. No whooshes or impacts over product footage.

## Read first

1. `.scratch/cloud-control-ad/research/SOURCES.md`: verified official-source research with
   verbatim quotes and URLs, fetched 2026-09-24. This is your claim authority. Every claim must
   come from here or from a source you fetch and add to your own `research/SOURCES_ADDENDUM.md`
   with a verbatim quote.
2. `.scratch/cloud-control-ad/research/PRODUCT_UNDERSTANDING.md`, in full. It explains the
   problem, how the product works, the troubleshooting path with exact surface names, where the
   value comes from, what must not be claimed (section 5), and the demo moments worth filming
   (section 6).
3. `.scratch/cloud-control-ad/ORCHESTRATOR_NOTES.md`: the research synthesis and redaction
   findings from the ad job. They still apply, except where this prompt widens the demo actions.
4. `.scratch/cloud-control-ad/`: its `lib/`, `capture/`, `build/`, `research/STORYBOARD.md`,
   `script/`, and `README.md` show working patterns for every step below, and the README lists
   what went wrong and how it was fixed. Read them; do not modify that folder. Do not reuse its
   narration: this demo needs its own words.

## Understand before you film

Use browser control to learn the demo yourself before writing a word of the talk track.
1. Explore the signed-in demo end to end through the dedicated Chrome (see below): Home, the
   top-bar products, Assistant, Canvas, Actions, Topology and Inventory if present, notifications,
   and the workflow surfaces inside Canvas. Try things. Ask the Assistant questions, run a
   Reasoning investigation, open workflows, and follow an incident from alert to resolution.
   Also read through the existing Assistant threads and canvases in the demo. Other demo users
   and Cisco's demo authors have already run investigations there, and they show which questions
   the demo data answers well, which flows are scripted into the environment, and how long
   answers take. Mine them for the story and for good questions to ask on camera. Their titles
   and owners are still redacted in any footage.
   You may split exploration across subagents or separate sessions (Opus for anything that
   judges the story), each reporting a candidate demo flow with exact clicks, surface names, what
   happened, and timings. They share one signed-in Chrome, so give each its own tab, never let two
   drive the same tab, and run anything that changes state one agent at a time. You own the final
   flow.
2. Write `research/DEMO_MAP.md`: every surface you found with its exact name, what demo data
   lives there, what each available action does and whether it changes state, how long slow
   steps take, and which incidents the data supports end to end.
3. Pick ONE incident and build the whole demo around it. The Mexico City incident is proven from
   the ad job (a correlated action with SD-WAN tunnel failures and a Meraki access point outage, a
   ThousandEyes packet-loss alert on the Mexico City uplink, and Meraki wireless degradation).
   Use it unless exploration finds a stronger story, and confirm its data is still there, since
   instant demos can reset.
4. Write `research/STORYBOARD.md` before recording: shot by shot, each shot with the click or
   typing that happens, the value point it proves, the talk-track line over it, and the source for
   that line. Looking good never outranks being true.
5. Rehearse the full click path once without recording, then record it.

## Suggested structure (adapt it if a better one emerges)

Target 4:45 to 5:15 total. At a conversational pace that is roughly 650 to 750 spoken words, with
room for typing, loading, and quiet reading beats.
1. Open (about 20 s): title card with the disclosure, then the SE introduces themselves as the
   customer's Cisco SE (unnamed), says what they will show, and names the demo company.
2. The situation (about 30 s): something breaks at a site, described through Cisco's own framing
   of console-hopping during an incident (sources S2, S11, S14). One agenda card at most.
3. Home and the top bar (about 25 s): one starting point, with the connected products still there
   as tabs.
4. Actions (about 40 s): open the incident's action; summary, related alerts from more than one
   product, timeline, recommended next steps. Assign it.
5. Ask the Assistant (about 40 s): a plain question typed on screen; the answer pulls findings
   from several connected products.
6. AI Canvas and Reasoning (about 60 s): move the investigation into Canvas with context
   preserved, run a Reasoning investigation, review and approve its plan, then walk the evidence
   and read out the Investigation limitations section as a strength (people verify).
7. The owning product (about 25 s): open the relevant product from the same top bar for detail.
   The product stays the authority for its domain.
8. Acting on it and handing off (about 40 s): a workflow's configuration form, review screen, and
   Run, if exploration finds a demo-safe one that fits the incident; Share or Generate summary
   for the next shift; resolve the action.
9. Value and close (about 30 s): where the value comes from, included at no additional cost with
   eligible Cisco subscriptions, a short recap, and one clear next step. Fine print on the end
   card.
The customer-question moments go wherever they arise naturally, most likely around steps 6, 7,
and 9.

## Claim rules (customer-facing)

- Every spoken or on-screen claim traces to a verbatim quote in the claim authority. Keep a claim
  table (claim, quote, URL) in the README. For any new cisco.com or cloud.cisco.com source, use
  `scripts/fetch-cisco-source.sh <url>` (it supports `--grep TERM` and `--links`). Never use
  WebFetch on cisco.com: it gets HTTP 403 and has led to correct claims being deleted.
- What the demo visibly does on screen is shown, not claimed. The SE may describe what is
  happening in the footage ("it pulled findings from three products here"), but any general
  statement about what Cloud Control does for every customer needs a source.
- No invented metrics, percentages, time savings, customers, quotes, testimonials, or logos. No
  numbers at all by default. Every Cisco figure found so far is an anecdote, a hypothetical, or an
  internal count. Counts in the demo data (for example the Home page's new-actions count) are not
  claims: do not narrate them, and blur or cut past them.
- No invented SE experience. The SE never says "most customers tell me", "I see this every week",
  or recounts a customer story. Frame the problem with Cisco's own description of it.
- Keep Cisco Cloud Control and Cisco Security Cloud Control distinct. The "Security" top-bar tab
  may appear as one tab among many; never narrate it or build the story on it.
- Controllers stay. The accurate story is one place to start and fewer jumps between consoles,
  while each product's controller remains the authority for its domain (S2, S4). Never say or
  imply it replaces a controller.
- AI helps investigate; people decide. Say "helps find the cause", never "finds the root cause".
  Do not add emphasis to a "root cause" heading in the UI. Change goes through reviewed workflows
  a person runs, gated by permissions (S5, S6, S8). Never claim autonomous fixing, that it sees
  everything, or that it sits in the traffic path. Keep the UI footer "Assistant can make
  mistakes. Verify responses." legible at least once.
- Licensing wording: "included at no additional cost with eligible Cisco subscriptions" (S1, S9,
  S12). Never "free" and never "for every customer". End-card fine print carries the US
  availability scope, Essential and Advantage tiers, and that Cisco may change this.
- Contested, so keep out of narration: whether one connected product is enough to start. Say
  "start with the Cisco products you already run" and "every product you connect adds context".
- Leave out, or keep the label visible if it appears on screen: the Workflows agent (beta), Agent
  Studio, Cloud Control Studio third-party connections, Marketplace, autonomous agents, non-US
  regions, anything tagged Controlled Availability, and the Main menu "Apps" list whose release
  status is unknown. Workflows cannot run inside a Reasoning investigation (S5); do not suggest
  they can.
- Next step: GA wording only, for example "Learn more at cisco.com" or "talk with your Cisco
  account team about connecting the products you already run". Not "request access".
- Not official Cisco marketing: no Cisco logo, bridge mark, or Cisco brand typeface as a graphic
  element (the logo inside recorded product UI is fine). The owner decides branding and external
  use; say so in the README.
- Copy: no em dashes in narration or on-screen text. No slogan stacks, no "not X but Y" lines, no
  stacked rhetorical questions. One memorable line is fine; several in a row is not. On-screen
  captions must not repeat the narration.
- End the README with a "Deliberately not said" list, so the reviewer can see the boundaries.

## Footage: real UI is the backbone

Never generate, redraw, or AI-imagine the product's UI. Generated art is only for the title,
agenda, value recap, close, and transitions, and none of it may imitate a product screen.

- Capture with playwright-core and the installed Google Chrome at 1920x1080 CSS pixels and
  deviceScaleFactor 2, so push-ins stay sharp. Hide scrollbars.
- Record interactions with the DevTools screencast (`Page.startScreencast`). It only sends a
  frame when the page changes, so resample each clip to a steady 30 fps and use speed ramps.
- Headless or CDP capture shows no cursor: record pointer positions and keystrokes during capture
  and draw the cursor over the footage from that track. Type questions with realistic, slightly
  uneven keystroke timing, and move the pointer along natural curves with short settles before
  clicks. It should look like a person driving.
- Record long continuous takes per segment rather than many short clips, so the edit reads as one
  screen share. Cut only where a real SE would switch views.
- Present footage in a slim, calm browser frame that fills most of the 1920x1080 canvas, with a
  small chapter chip that tracks the agenda and a small footer "Real product UI · Cisco dCloud
  demo, fictional data". Use gentle push-ins to make key text readable instead of heavy callouts;
  a callout is for the rare point that a push-in cannot make.
- Capture everything you need early, then edit from the captures.

### Signed-in product capture

- The demo is the Cisco dCloud instant demo "AgenticOps with Cisco Cloud Control"
  (https://dcloud2-rtp.cisco.com/content/instantdemo/agenticops-with-cisco-cloud-control), which
  opens Cloud Control at https://cloud.cisco.com/home. It is a Cisco demo environment, not a
  customer tenant, and it may be shared with other demo users.
- The owner signs in themselves in a dedicated Chrome started with its own profile and remote
  debugging. First check `curl -s http://127.0.0.1:9333/json/version`. If nothing answers, start
  it: `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  --user-data-dir=<abs path>/.scratch/cloud-control-se-demo/.chrome-profile
  --remote-debugging-port=9333 --no-first-run --no-default-browser-check --window-size=1920,1200
  <demo URL>`. Attach from each script with `chromium.connectOverCDP('http://127.0.0.1:9333')`
  and use `browser.contexts()[0]`. List the pages and pick the Cloud Control one. Never close this
  Chrome while you still need footage. Never type, store, print, or read a password, one-time
  code, cookie, token, or storage value.
- If the session is missing or expired, write `LOGIN_NEEDED.md` (one short paragraph on what the
  owner must do) and start a message with "LOGIN NEEDED:". Watch for the signed-in state with a
  60-second CDP check, and keep working on everything else meanwhile. Instant demos are
  time-limited, so explore and capture as soon as the UI is available.
- Allowed, per the owner's "full control": everything an SE would do in a demo. Navigating,
  filtering, searching, reading existing threads and canvases, asking the Assistant, creating
  canvases, running Reasoning investigations and approving their plans, assigning and resolving
  actions, sharing a canvas within the demo, generating summaries, opening, configuring, and
  running workflows, and approving or rejecting workflow approval tasks. Run a workflow only after
  reading what it does and confirming it acts on demo targets.
- Not part of the demo, so leave alone: tenant administration (users, roles, connected products
  and integrations, organization settings), and deleting or editing other users' threads or
  canvases. The demo may be shared, and none of it serves the story. If a shot you need would
  require one of these, say so with "OWNER DECISION NEEDED:" and keep working.
- Log every state change you make (what, where, when, why) in the README.
- Redaction: blur every real person, account, email, org or tenant identifier, and session ID,
  including the signed-in demo account (the ad job found "Sec Ops User NN" and
  "sec_ops_user_NN@dcloud.cisco.com" in headers and canvas lists) and other users' names and
  IDs in thread titles and share dialogs. Fictional demo data such as "PseudoCo" and demo device
  names may stay. Crop website cookie banners or capture after dismissing them. Bake the blur into
  edit copies only, keep raw captures untouched, and log each region (file, coordinates, what was
  hidden) in the README.
- When capture is finished, close that Chrome and delete `.chrome-profile`.

## Visual style

Take the palette and feel from the real Cloud Control UI you capture, so the cards and the
footage read as one piece: clean enterprise operations software, generous negative space, precise
type, one or two accent colors. Use licensed open fonts from Google Fonts (the ad job used Inter
and IBM Plex Mono), not a Cisco brand typeface. Output 1920x1080 at 30 fps.

Build the video as a deterministic HTML/JS timeline (a stage page, a small engine for tweens,
browser frames, push-ins, and cursor, a scenes file, and a cue file) and render it frame by frame
in headless Chrome, encoding with ffmpeg in about 8 parallel chunks. Start from the ad job's
`build/` and `lib/`, copied into this folder with log paths changed.

## Audio

- Voice: the SE should sound like a person talking over a screen share, not a narrator reading
  copy. Record several full takes of the talk track across a few TTS models and voices. If a model
  cannot hold five minutes in one call, record by section with identical settings and check that
  tone and loudness match across every join. Have an audio-capable model listen to all takes and
  score them for naturalness, conversational register, and warmth, and transcribe each with
  Whisper word timestamps to catch wrong words. Cut only at section or paragraph gaps, and add
  silence where the picture needs room (typing, loading, reading a result).
- Pronunciation lives in the speech text, never in style instructions: "S D WAN", "Thousand
  Eyes", "Meraki" as "meh-ROCK-ee" if a voice misses it, "Intersight" as "inter-sight",
  "Hyperfabric" as "hyper-fabric", "AgenticOps" as "uh-JEN-tick ops", and ISE, if it appears at
  all, as the word "ice", never the letters. When a voice keeps saying the wrong word, reword the
  line rather than splice. Listen-check every product name in the winning take.
- Test whether a model's style field actually changes the read before relying on it. Put
  directions only in a working style field, never in the spoken text, and confirm no take reads a
  direction aloud.
- Drive every cut, push-in, cursor move, and chapter change from the winning take's word
  timestamps, and make sure what the SE says matches what is on screen at that moment.
- Music: generate two or three beds, have a model judge them (reject any with garbled vocals),
  and use one only under the title and close (see "What makes this a demo"). Duck it under voice.
- Master to about -16 LUFS integrated.
- Also export English captions as `out/*.srt` from the final word timestamps. Do not burn them in.

## Pacing

Explore and capture as soon as the owner is signed in. Produce a rough end-to-end render with
first-pass audio within the first 60 minutes and say "ROUGH CUT READY:" with its path. Then
improve it in numbered versions. Do not spend more than 4 hours total.

## Review

Build a review package: contact sheets of sampled frames (one sheet per chapter), key frames at
full size, the timed transcript, the claim list, the state-change log, and the mix. Send it to a
model different from the one that wrote the script, and use a different model again for round 2
(for example Gemini 3.1 Pro, then GPT-5.6 Sol for frames and facts, plus an audio-capable model
for the mix). Ask each reviewer two things: does this feel like a real SE running a real demo
(pace, naturalness, whether the words match the screen, whether a customer could follow it), and
is every claim supported. Also check timing drift, legibility, visual consistency, and redaction
misses. Verify each finding before acting: reproduce it, measure it, or re-listen with another
model. Log every finding with its disposition (fixed, or not reproduced and why) in the README.
At most two rounds.

## Output

Build everything in `.scratch/cloud-control-se-demo/`. Do not modify any other file in the
repository, and do not deploy anything. Deliver:
- the final MP4, the `.srt` captions, and a player page that opens from disk, with a clickable
  chapter and narration list;
- `script/SCRIPT.md`, written so a human SE could also run this demo live from it: per chapter,
  the time, the exact clicks and typed questions, the talk track, every on-screen text, and the
  source for each claim. Plus `script/speech.txt` (the exact text sent to the voice model);
- `research/DEMO_MAP.md` and `research/STORYBOARD.md`;
- assets with real captures, public imagery, and generated art in separate folders;
- a README with: how it was made; every model call with cost and a running total; the claim
  table; the source URL of any public image used; the redaction log; the state-change log; review
  dispositions; the evidence boundary (what was and was not checked, and that no human listen or
  SME, brand, or legal review has happened); open owner decisions; what you would fix with more
  time; the "Deliberately not said" list; and disk usage of raw captures and intermediates.

## Budget

Hard cap of $15 of OpenRouter spend. Log the cost OpenRouter returns for every call (model,
purpose, cost, generation id) to `logs/costs.jsonl`, sum it before each batch of paid calls, and
stop before the sum would pass the cap. The key is shared with other jobs, so measure this job
from its own log. As a backstop, stop all paid calls if GET https://openrouter.ai/api/v1/key
shows `data.usage` above 20.00.
The key is OPENROUTER_API_KEY in the repository .env. Load it with
`(set -a; . ./.env; set +a; ...)` from the repository root and never print, echo, or log it.

## Tools

If you need to download or install a tool that is not available through OpenRouter and is not
already in `.scratch/packet-path-explainer/tools/`, stop and tell me first: name the tool, why
you need it, where it comes from, and roughly how large it is, then wait for my go-ahead. Start
that message with "TOOL REQUEST:". For everything else, proceed without asking.

Head start, used by path (do not copy node_modules):
- `.scratch/packet-path-explainer/tools/`: playwright-core, ffmpeg-static, ffprobe-static.
- `.scratch/packet-path-explainer/reference/`: OpenRouter docs for TTS, STT, audio, images.
- `.scratch/cloud-control-ad/lib/`, `build/`, and `capture/`: voice assembly, clip builder with
  redaction, cursor tracks, sound-effect synth and cue sheet, mixer, parallel renderer, and the
  CDP capture scripts for this exact demo. Copy into your own folder and change log paths before
  running.
- Models that worked on 2026-09-24: speech google/gemini-3.8-flash-tts (voice Charon, the ad's
  winner), minimax/speech-2.8-hd (English_magnetic_voiced_man), microsoft/mai-voice-2 (has a
  working style field); word timestamps openai/whisper-large-v3; music google/lyria-3-pro-preview;
  judging and review google/gemini-3.1-pro-preview, openai/gpt-5.6-sol, openai/gpt-audio; images
  google/gemini-3-pro-image, openai/gpt-image-2. Check the catalog; newer may be better, and a
  warmer conversational voice may beat the ad's announcer-style winner.
- Subagents: use them however helps (exploration, storyboard critique, claim checks, review
  packaging). Opus for judgment and writing; Sonnet only for mechanical work.

## Orchestrator notes channel

A supervising session may write to `ORCHESTRATOR_NOTES.md` in this job folder. Read it now, at
the start of every phase, and before each render. Treat its entries as the owner's instructions.

Please work autonomously until done. Quality is
paramount. Production value should be on a professional level.
