# Cisco Cloud Control: virtual SE demo (Mexico City incident)

Open `player.html` in a browser to watch with captions, clickable chapters, and a per-line narration
list. The final file is `out/cloud_control_se_demo_v4.mp4` (1920x1080, 30 fps, H.264 plus AAC 256 kbps,
5:20.27, about -15.9 LUFS integrated). Captions: `out/cloud_control_se_demo_v4.srt` / `.vtt` (not burned in).

**This is not official Cisco marketing.** It uses no Cisco logo, bridge mark, or Cisco brand typeface as
a graphic element (the Cisco logo appears only inside the recorded product UI, in its own header). Type
is Inter and IBM Plex Mono (Google Fonts, open licenses). Branding, footage rights, and any external use
are the owner's decision. The video discloses in its opening card and lower third that this is
a virtual SE demo with an AI-generated voice; the SE is unnamed and has no face, avatar, or photo.

## What is here

This table describes the original job folder. Only the files listed in this example's README are
included here.

| Path | Contents |
|---|---|
| `player.html` | Player page with captions and chapters; opens from disk. |
| `out/cloud_control_se_demo_v4.mp4` | **Final cut.** (v1 to v3 were superseded drafts, deleted after v4 passed review.) |
| `script/SCRIPT.md` | Runnable-by-a-human script: per chapter, timing, exact clicks/typed text, talk track, on-screen text, sources. |
| `script/speech.txt` | Exact text sent to the voice model (final, locked). |
| `research/DEMO_MAP.md` | Every surface explored, with exact names, demo data, and state-change notes. |
| `research/STORYBOARD.md` | Shot-by-shot table tied to the finished cut. |
| `research/CLAIMS.md` | Claim table, "Shown, not claimed", "Deliberately not said", and any flagged/unsupported lines. |
| `research/SOURCES_ADDENDUM.md` | Additional verbatim source quotes fetched for this job, beyond the shared `cloud-control-ad` research. |
| `research/explore_A..D_*.md` | Raw exploration reports from the four parallel exploration agents (pre-recording). |
| `assets/tenant/clips/` | Redacted-not-needed edit frame sequences (`t6`, `t7`) used by the renderer. |
| `assets/audio/mix_v3.wav` | Final mix. `audio/takes/` holds every voice take auditioned; `audio/music/` the beds judged. |
| `build/` | The animation: `comp.html`, `engine.js`, `scenes.js`, `cues.json`/`cues.js`, and the renderer. |
| `capture/` | Playwright/CDP capture scripts (`t6_full.js`, `t7_tail.js`) and the tab/recording helpers. |
| `lib/` | Voice assembly (`build_voice.py`), clip builder (`build_clips.py`), cursor tracks, sound synth, mixer, caption/player generator (`deliver.py`), OpenRouter helpers. |
| `review/` | Contact sheets, full-size key frames, review prompts, and both review rounds' raw outputs. |
| `logs/costs.jsonl` | Every paid model call: model, purpose, cost, generation id. |
| `logs/state_changes.md` | Every state change made in the shared dCloud tenant, with what/where/why. |

## How it was made

1. **Exploration.** Four parallel agents explored the signed-in dCloud "AgenticOps with Cisco Cloud Control"
   demo through a shared Chrome (tagged tabs, one state-changing action at a time): Actions/Topology/Inventory/
   product tabs, existing Assistant threads and Canvases (mining prior demo authors' questions), Workflows, and
   which connected-product AI agents actually returned data that day (only Meraki's did reliably in Default
   mode; ThousandEyes and SD-WAN often errored, though a Canvas Reasoning run reached ThousandEyes once).
   Findings: `research/explore_A_actions_products.md` through `explore_D_agent_probe.md`.
2. **Story.** One real incident the demo data supports end to end: **"SD-WAN and Meraki device connectivity
   and UTD connection disruptions in San Jose and Mexico City"** (Actions tab, search "Mexico"), chosen over
   the Mexico City-only action from earlier takes because that action kept re-triggering from the demo's own
   scheduled `AP-Reboot` workflow and produced inconsistent data across attempts; this action's related-alerts
   table and live analysis proved stable and reproducible on camera.
3. **Capture.** Recorded from the owner's signed-in dCloud session through a dedicated Chrome (port 9333,
   own profile), at 1920x1080 CSS pixels with deviceScaleFactor 2, using the DevTools screencast (frames
   resampled to 30 fps). Two continuous takes cover the whole demo: `t6` (Home through Verify) and `t7`
   (ThousandEyes through Share, re-recorded once to fix a mid-take dark-theme flip; see Review). Cursor,
   clicks, and keystrokes are logged during capture and drawn/synthesized from that log, never faked.
   No UI was redrawn or AI-generated; the browser-frame chrome, chapter chips, and cards around the footage
   are the only generated elements.
4. **Voice.** Nine full-script takes across four models (Gemini 3.8 Flash TTS, MiniMax Speech 2.8 HD,
   Microsoft MAI-Voice-2, Fish Audio/Sesame attempted and rejected) and multiple voices, judged by Gemini
   3.1 Pro against "calm, assured, technical demo voice, not a marketing voice" (the owner's explicit
   direction). **Winner: Gemini 3.8 Flash TTS, voice Iapetus** (scored 9/10 on naturalness, conversational
   register, and calm assurance across two judged rounds). Three words were rewritten after Whisper/gpt-audio
   listen-checks caught mishears ("cause"->"cost", "handles"->"heaps", "loss"->"lost/last") and re-recorded.
   The final narration is assembled paragraph-by-paragraph from the winning take (with two paragraphs pulled
   from an alternate take of the same voice for a stronger read), each paragraph loudness-matched to the base
   take's active-speech level, cut only at paragraph gaps, with authored pauses for the picture. A join-
   continuity listen check rated the splices 10/10, indistinguishable from one continuous session.
5. **Music and sound.** Lyria 3 Pro generated three beds; one was rejected for garbled AI vocals. Music
   plays only under the title/agenda and the close, ducked under voice, per the brief. Clicks and keystrokes
   are synthesized in Python and timed from the recorded click/key log, not from narration guesses.
6. **Animation.** Deterministic HTML/JS timeline (every visual keyed off `build/cues.json` word/segment
   timing) rendered frame by frame in headless Chrome, 8 parallel chunks, about 5 minutes for a full render.
   Camera push-ins, the browser frame, and chapter chips are timed to real recorded click moments, not
   estimated offsets, after an early version mis-keyed several ThousandEyes/handoff camera cuts to the wrong
   click (see Review, round found and fixed before v3).
7. **Review.** See below.

## Models used and cost

Spend is measured from this job's own log (`logs/costs.jsonl`); the OpenRouter key is shared with other
jobs. Key-level usage was checked before batches and stayed well under the $25 backstop (about $5.85 at
last check, all jobs combined).

Full row-by-row detail (65+ calls: every voice audition, full-script take, Whisper transcript, judge
call, listen check, and review call) is in `logs/costs.jsonl`. Summary by phase:

| Phase | Calls | Cost (USD) |
|---|---|---|
| Voice auditions (12 short clips, 4 models) + judge | 13 | 0.3568 |
| Music (3 Lyria beds) + judge | 4 | 0.1274 |
| Full-script takes T1-T4 (4 voices) + Whisper + judge + listen check | 10 | 0.3120 |
| Full-script takes V2a/V2b (Iapetus) + Whisper + judge | 5 | 0.1716 |
| Full-script takes V3a-i (Iapetus, 9 takes across 3 rewrite rounds) + Whisper + judges + listen checks | 22 | 0.5936 |
| Join-continuity listen check | 1 | 0.0184 |
| Review round 1 (frames + audio mix) | 2 | 0.1665 |
| Review round 2 (frames + claim-table fact check, GPT-6-Sol) | 1 | 0.1150 |
| **Job total** | **58** | **2.6623** |

**Job total: $2.6623 of the $15 cap** (verified by summing `logs/costs.jsonl`:
`python3 -c "import json;print(sum((json.loads(l).get('cost') or 0) for l in open('logs/costs.jsonl')))"`).
The doc-rewrite and fact-check subagent work used Claude tokens, not this OpenRouter budget.
Key-level OpenRouter usage (shared with other jobs) read $5.85 of the $25 backstop at last check.

Non-model tools: playwright-core, ffmpeg-static, ffprobe-static (from `../packet-path-explainer/tools/`,
used in place, not copied), the installed Google Chrome, and Python 3 standard library. Fonts Inter and
IBM Plex Mono were downloaded from Google Fonts into `build/fonts/`. Nothing was installed.

## Claim table

See `research/CLAIMS.md` for the full claim table (every spoken/on-screen general claim, its verbatim
source quote, and source ID/URL), the "Shown, not claimed" list, and the "Deliberately not said" list.

## Redaction

**No blur applied.** The owner explicitly said this environment is internal fictional demo
data and not going in front of customers, so no redaction was needed for this job (unlike the sibling
`cloud-control-ad` job, which did blur the signed-in account and other users' data for a customer-facing
cut). The signed-in demo account "Sec Ops User NN / PseudoCo / sec_ops_user_NN@dcloud.cisco.com" is
visible in ThousandEyes and Cloud Control frames by design, per that direction. Around 4:26 to 4:27
(the Hand off chapter, mid-transition through the Canvas overview list on the way back to the board),
other demo users' account emails (e.g. `sec_ops_user_NN@dcloud.cisco.com`) are also briefly legible in
a "Created by" column, under the same owner direction. No user names are narrated.

## State-change log

Full log: `logs/state_changes.md` (30 rows). Summary: normal demo navigation and typed questions in the
Assistant/Canvas (creating one new Assistant thread and one new Canvas, per the owner's "full control"
authorization); three Chrome restarts to recover a hung DevTools connection; one account-level Theme
preference changed from Dark to Light (profile menu) after the dark OS theme flipped the embedded
ThousandEyes/Canvas pages mid-take; deletion of superseded raw takes and old renders to manage disk.
Nothing outside the demo's own tenant was touched; no tenant administration, no other users' content
edited or deleted, no workflow run.

## Review rounds

Round 1 (frames: Gemini 3.1 Pro; audio: GPT Audio) and round 2 (frames + facts: GPT-6-Sol, checking the
claim table independently) both found the cut in good shape: realistic pacing, legible UI, consistent
chapter chips/camera, no audible mispronunciation or mix issues, no music under the walkthrough, and no
product claim the claim table missed. Full raw outputs are in `review/` (`round1_visual.json`,
`round1_audio.json`, `round2_facts.json`) alongside the contact sheets and full-size key frames.

| Round | Model | Finding | Disposition |
|---|---|---|---|
| 1 | Gemini 3.1 Pro (frames) | No blocking issues; ThousandEyes wide shot is dense but resolved by the following push-in | Advisory, no change needed |
| 1 | GPT Audio (mix) | No mispronunciations, no mix issues, no music under the walkthrough | No change needed |
| 2 | GPT-6-Sol (frames + claim table) | C16 ("ThousandEyes stays the authority") and C18 (Generate summary "turns the canvas into a report") lean slightly stronger than their quotes | Advisory (already logged as F-items in `research/CLAIMS.md`); no wording change to the locked narration |
| 2 | GPT-6-Sol (frames + claim table) | The ThousandEyes loss data is dated Sep 24; the action's incident is Sep 20 to 21. The video never claims the later reading proves the earlier incident's cause, but a live SE should say so explicitly | Advisory, noted in `script/SCRIPT.md` Live-run notes |
| *(self-review, before recording the review package)* | | `lib/deliver.py`'s chapter-name map was missing the `wait1` segment, leaking the raw segment name into the player's chapter chips | **Fixed**: added `wait1`->`Actions`, player rebuilt |
| *(self-review, during the v3 edit)* | | Camera/URL cues for the ThousandEyes/Canvas/Generate-summary/Share beats were keyed to word-time offsets that no longer matched the real click times once the tail was re-recorded (`t7`) | **Fixed**: rekeyed to the actual recorded click timestamps (`FOOT.t7.clicks`) |
| *(self-review, after round 2, v3->v4)* | | Confirmed by direct frame inspection: at the exact t6-to-t7 cut (3:43.45), the canvas showed a "Loading canvas..." spinner for a few frames, because the t7 clip's timeline mapping started at recording second 15 while the DevTools screencast had not sent its last frame until second 20 | **Fixed**: pushed the clip's start point to recording second 20 (confirmed by inspecting raw frames: the screencast sends no new frame after second 20, i.e. the page is fully settled by then) |
| *(self-review, after round 2, v3->v4)* | | Confirmed by direct frame inspection: the camera push toward the ThousandEyes tab (`1500, 90` at `1.6x` zoom) was impossible to reach: the engine's camera clamp forces any target `y` below `540/zoom` back up to that floor, so the intended `y=90` was silently redirected to `y≈338`, landing on blank canvas below the top bar instead of the tab | **Fixed**: that transitional beat now holds the wide (`960, 540, 1x`) framing instead of a push-in that could never land; also audited every other camera key for the same clamp pattern (12 more matched it) and confirmed by direct frame inspection that each of those already lands on legible content despite the clamp, so no further change was needed there |

## Evidence boundary

Checks done: word-level transcript diffs against the script for every take, model listening checks on
suspect words, a join-continuity listen check, frame-by-frame contact sheets and full-size key frames,
two independent review passes (frames and audio), player playback of chapters/captions, camera-key
monotonicity checks, and a headless-Chrome console-error check across the full timeline. **Not done:** a
human listen, SME or field review, accessibility review, or any Cisco brand/legal review. The video makes
no claim of Cisco approval.

## Open owner decisions

- Branding and external use (no logo used as a graphic element; the product UI shows the Cisco logo in
  its own header, unchanged).
- Whether to keep the visible demo account name/email (owner already said not to blur it for this job).
- End-card next step: "Learn more at cisco.com" (GA-safe wording); a direct product URL or a named next
  step (e.g. "talk with your account team") can replace it.

## What I would fix with more time

- **ThousandEyes tab switch and Canvas navigation are slow in this dCloud instance** (20 to 30 seconds
  each); the edit compresses them with "Sped up" labels, which is honest but a live customer demo would
  need to fill that dead air with more small talk than the script currently has.
- **Voice:** one or two words (documented in `research/CLAIMS.md`/take notes) still carry a very slight
  scripted cadence on repeat listens; a human voice actor would remove the last bit of that.
- **The `wait1` beat** (waiting for the action's own live analysis, about 8 seconds) is the shortest
  chapter segment and could use one more sentence of texture if the demo grows longer.
- **Disk:** `capture/rec/t6` (5.1 GB) and `capture/rec/t7` (311 MB) are the only raw captures kept (all
  earlier, superseded takes were deleted to manage a nearly-full disk); delete these too once the cut is
  fully accepted and no further re-edits from raw footage are expected. `assets/tenant/clips/` (2.6 GB,
  the derived 30 fps JPEG sequences the renderer reads) can also go once the mp4 is accepted; `out/` is
  485 MB (the final mp4 plus captions/player). This job folder totals 9.7 GB.

## Deliberately not said

See `research/CLAIMS.md` for the full list (no invented numbers or time savings, no "root cause" as a
certainty, no autonomous fixing, no "replaces controllers", no "free", no claim that one product is enough
to start, no mention of Security Cloud Control, the Workflows agent, Cloud Control Studio, or any other
beta/in-development item, no non-US availability claim).
