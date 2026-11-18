# Pipeline: the toolkit, step by step

Every job folder (`jobs/<slug>/`) is a copy of `toolkit/job-template/`. Run commands from the job folder unless
a path starts with `scripts/` (studio root). Every paid call checks the job's cap first and logs its billed cost
to `logs/costs.jsonl`. This order was tested end to end on 2026-09-28.

## 0. Configure the job

`job.json`: `title`, `disclosure` (player page), `budget_usd`, `hours`, `chrome_port` (assigned by new-job.sh),
`app_url` (landing page for new tabs), `app_match` (URL fragment of the product tab), `sso` (`true` for a single
sign-on app: no new tabs, adopt the signed-in one), `theme` (`light`, `dark`, or `null`), `respell` (spoken form to
written form, e.g. `{"S D WAN": "SD-WAN"}`), and `music` (see step 5).

## 1. Browser, exploration, capture

| Step | Command |
|---|---|
| Start this job's Chrome (owner signs in) | `scripts/chrome.sh <slug>` (root); stop with `--stop` |
| Explore in your own tab | `node capture/tab.js <tag> '<async JS using page, C, shot, text, dtext, sleep>'` |
| Adopt the signed-in tab (no page load) | `ADOPT=<part of its address> node capture/tab.js <tag> '...'` (also for `rec.js`, `park.js`); with `sso: true` and no `ADOPT`, no new tab is opened |
| Close stray tabs a click opened | `node capture/closeuntagged.js [--list] [--all]` (untagged tabs only; keeps the untagged product tab unless `--all`) |
| Rehearse a take (nothing recorded) | `TAG=rec node capture/dry.js <take> capture/takes/<script>.js` -> `MARK` lines and `capture/dry/<take>.json` |
| Park a tab in a take's starting state (not recorded) | `node capture/park.js <name>` (states listed in its `PARK`) |
| Record a take | `TAG=rec node capture/rec.js <take> capture/takes/<script>.js` |
| Contact sheet of a take | `python3 lib/recsheet.py <take> 5 20 35 ... [--small]` (recording seconds) -> `review/sheet_<take>.jpg`; `--small` (`sheet_<take>_small.jpg`, 4 columns of 480x270) for routine checks, full size where text must be read |
| Frame at a recording time | `python3 lib/frameat.py <take> <seconds>` |

If the DevTools endpoint hangs (L12, L13): kill hung `node capture/...` processes, close runaway tabs with
`curl -s http://127.0.0.1:<port>/json/close/<id>`, and if it still does not answer (Chrome may have updated itself
while running), restart this job's Chrome with `scripts/chrome.sh <slug> --stop`, then `scripts/chrome.sh <slug>`.
The signed-in session survives a restart.

A take script (`capture/takes/example_take.js`) receives `page, C, mv, click, clickLoc, type, typed, wheel, mark,
sleep, dtext`. `mark('name')` drops a labeled timestamp into `log.json` that you can find later, and `click(x, y, ms,
{ mark: 'name' })` (or `clickLoc(loc, ms, { mark })`) drops one at the moment of the press. Every take ends by
printing its marks in recording seconds, the clock `build/edit.py` and `lib/frameat.py` use. Output:
`capture/rec/<take>/NNNNN.jpg` plus `log.json` (frame times, pointer track, clicks, keys).

Size each take to the draft narration before recording it: the actions and waits between two cue words must fit
the time those words take to say, about 0.4 s a word as a starting point (a 20-word paragraph is about 8 s of
clicks). A take that runs much longer than its words gets squeezed by the edit (keys dropped, or a speed-up the
narration never mentions) and usually has to be recorded again. Plan any long wait as a labelled speed-up. Rehearse
with `capture/dry.js` and compare its MARK times with the words, then check the edit with `lib/fit_report.py`.

A link inside an embedded product page can open a new tab and break the single screen share: set `target=_self`
on the anchor before clicking (see `examples/cloud-control-se-demo/code/take_example.js`) (L17).

Canvas apps (L38, L54): start a drag pan on empty canvas (check `document.elementFromPoint(x, y)` is the
background before pressing); after a click, confirm the element you meant is the one selected; measure label
height at each app zoom step before choosing app zoom plus a push-in; the app's own search (type a name, press
Enter) is the most reliable way to bring an element on screen.

In apps with single sign-on, record in the long-lived signed-in tab (`TAG` = that tab's tag) and navigate by
in-app clicks: a `page.goto` or a brand-new tab can pass through the sign-in page and the guard ends the take
(L49). Park the tab first, and start each take script with a check instead of a navigation. Write each take's
starting state once in `PARK` in `capture/park.js`: the tab, an optional page load, in-app clicks by on-screen label,
and the address and text the start must show. `node capture/park.js <name>` gets there off camera and prints
`PARKED`, `WRONG_VIEW` (exit 1), or `LOGIN NEEDED:` (exit 2), and warns when a dialog is still open; a script that
runs several takes starts a take only after `PARKED`. The take checks the same entry:
`const { atStart } = require('../park'); if (!(await atStart(page, '<name>'))) { mark('wrong_view'); return; }`.
Parking helps in any app whose takes need a prepared view, not only with single sign-on.

Sign-in guard (L47; in jobs whose `capture/cdp.js` has `signInReason`): `rec.js` exits with code 2 and records
nothing if the page looks like a sign-in, SSO, password, or one-time-code page. It checks the address (common
sign-in and identity-provider patterns), a visible password or code field, a page whose only input asks for a
username or email, and a sign-in or verification page title. It can still miss an unusual sign-in page, so check
every take's contact sheet. If one appears mid-take it stops,
deletes that take's raw frames, adds a row to `logs/state_changes.md`, prints "LOGIN NEEDED:", and exits with code
3. `shot()` returns null instead of saving such a page. `SIGNIN_GUARD=off` is only for an owner-approved page with a
masked secret field that is not a sign-in.

Waiting for an owner action inside a take (L39). Print the marker before the take reaches this point, then:

```js
mark('owner_wait');
for (let t = 0; t < 300; t += 2) { if (/TEXT THAT PROVES IT HAPPENED/.test(await dtext(6000))) break; await sleep(2000); }
mark('owner_done');
```

Cut the span between the two marks out of the edit; the result shot starts at the first frame where the result
is listed, and the time in between shows something that follows the narration (L50). If the page needs a refresh
to show the result, refresh every 15 seconds or more and record at `JPGQ=75` (L32).

When the demo must respond to the action (L48), use the locator that matched the real event in the rehearsal
(role and name, a `page.frameLocator(...)` chain, or whatever the rehearsal proved; Playwright locators reach open
shadow DOM, plain `innerText` searches do not):

```js
const target = page.getByRole('button', { name: 'LABEL SEEN IN THE REHEARSAL' }).first();
mark('owner_wait');
for (let t = 0; t < 300; t++) {
  if (await target.isVisible().catch(() => false)) {
    await clickLoc(target); await sleep(3000);
    if (!(await target.isVisible().catch(() => false))) break;   // responded; also check the result you expect
    console.log('OWNER ACTION NEEDED: responder could not respond; tell the owner what to do now');
    throw new Error('responder failed');
  }
  await sleep(1000);
}
mark('owner_done');
```

## 2. Talk track

- `script/speech.txt`: the exact text for the voice model, one paragraph per segment, blank line between.
  Respellings go here ("S D WAN"), never in style instructions.
- `script/segments.json`: one entry per paragraph, same order: `name` (used in the edit), `gap` (seconds of
  silence after it, room for typing, loading, reading), `chapter` (player chapter label). Also `intro_seconds`
  (silence before the first word, under the title) and `tail_seconds` (after the last word).

## 3. Voice

| Step | Command |
|---|---|
| Current voices | `python3 lib/models.py speech` |
| Audition on a short paragraph | `python3 lib/take.py A1_iapetus google/gemini-3.8-flash-tts Iapetus --dir audio/audition --text audio/audition/sample.txt` |
| Full take | `python3 lib/take.py T1_iapetus google/gemini-3.8-flash-tts Iapetus` |
| Word timestamps | `python3 lib/stt.py audio/takes/T1_iapetus.wav` |
| Wording check vs script | `python3 lib/check_take.py T1_iapetus [T2_...]` |
| Judge takes by ear | `PURPOSE="judge takes" python3 lib/chat.py openai/gpt-audio prompt.txt review/judge.json audio/takes/T1.wav audio/takes/T2.wav` |
| Assemble narration | `python3 lib/build_voice.py T1_iapetus [segment=T2_iapetus ...]` -> `audio/voice.wav`, `build/cues.json`; it ends with an edge check, and any `EDGE MISMATCH` means a paragraph lost its first or last word (L55), except when a number word was transcribed as digits ("three" as "3"): check those by ear. Decide a join by its `JOIN` numbers, not by asking the listening model; use the listening model for missing or misread words and artifacts (L56) |

Use `--extra '{"instructions": "..."}'` only for a model whose style field you have tested. Gemini TTS returns
raw PCM; take.py converts it.

## 4. Picture

| Step | Command |
|---|---|
| Map takes to narration time | edit `build/edit.py` (CLIPS, RAMPS, SHOTS) using `S()`, `E()`, `W()` (`W('No', 'seg', exact=True)` in Python, `W('No', 'seg', { exact: true })` in story.js, for a whole-word match) |
| Does the footage fit the words? | `python3 lib/fit_report.py [clip ...]` before `build_clips.py`: per key pair, timeline and recording spans, slope, words spoken; FAST (over 1.5x, no RAMPS label), RAMP, HOLD, CUT |
| Build 30 fps clips | `python3 lib/build_clips.py` -> `assets/clips/<clip>/`, `build/footage.json` |
| Blur redaction regions | `python3 lib/redact.py [clip ...]` (regions in `build/edit.py` REDACT; rerun after every `build_clips.py`, which rebuilds clips from the raw frames) |
| Add cursor, clicks, keys | `python3 lib/cursor_tracks.py` -> `build/footage.js`, `build/cues.js` |
| Words and camera | edit `build/story.js` (title, agenda, frame shots/urls/chapters/camera, value, close) |
| Signature moment before any take | build it in `build/sketch.js` with literal times, then `node build/render.js stills review/sig 2 4.5 7 --sketch` and the same with `--words-off` (no voice take or footage needed; references/MOTION.md, Think 2) |
| Illustrative motion segments (stages) | define each segment as a `new Stage({...})` in `build/stages.js` with narration times: a camera on a world, a traveller that changes shape, line drawings, connectors, the push to and from the screen share; `build/stage.js` draws them; `node build/render.js stills review/demo 2 5 7 10 --sketch` shows every helper in a story-free demo; how to think is in references/MOTION.md, the helpers in references/STAGE_ENGINE.md |
| Palette from the product | `python3 lib/sample_colors.py <frame.jpg> x,y,r [x,y,r,max ...] [--against '#<ground>']` (prints the image size first, `image 2560x1440` for clips: read points off that size, whole pixels; box average; `max` or `min` adds the brightest or darkest and the most saturated pixel; a point outside the image stops with the size and the 1.333 scale from a 1920 px preview; `--against`, repeatable, adds each colour's WCAG contrast and flags under 3:1 or 4.5:1, a warning only) -> set `STORY.stagePalette` in `build/story.js` |
| How static the picture is | `python3 lib/frozen_time.py out/<video>.mp4 --range 56.5-86.0 ...` (still stretches of 3 s or more inside the ranges, and still seconds per 30 s in each: a list to look at, never a score; references/MOTION.md, Critique) |
| Frames from a rendered video | `python3 lib/grab.py out/<video>.mp4 review/grab 12.5 80.2` -> `review/grab/v_<t>.jpg` (checks the file, not the page) |
| Simple diagram segments | add `STORY.motion` (and `STORY.motionLabel`, `STORY.tags`) in `build/story.js`; `build/motion.js` draws them and fades the screen share out under each one (example at the end of `story.js`); when to use them, element fields, and rules are in references/MOTION.md |
| Check frames | `node build/render.js stills review/stills 3 42.5 118` then look at them (`python3 lib/grid.py`) |
| One still per motion state | `node build/render.js motionsheet review/motion` -> `review/motion/<segment index>.jpg` (`STORY.motion`: each element's entry plus 0.6 s, each swap, each `moves` key; stages: each shot in `shots` just after it starts and at its middle) |
| Frames around a fast moment | `node build/render.js strip review/strip 84.3 [n=12] [fps=30]` -> `review/strip/strip_<t>.jpg` (n consecutive frames centered on t; catches overlaps during swaps) |
| Determinism checks (before the rough cut) | `python3 lib/lint_timeline.py` (flags `Math.random`, `Date.now`, `performance.now`, timers, `requestAnimationFrame`, CSS transitions or animations, `will-change` in `build/`; exit 1 on any) and `node build/render.js same review/same 12.5 80.2` (renders each time twice, prints SAME or DIFFERENT; exit 1 on any DIFFERENT) |

At every cut, look at the incoming clip's first frames (`python3 lib/frameat.py <take> <seconds>`); if a spinner or
"Loading" is still up, move that clip's first key later, to where the screencast stops sending frames (L21).

Motion segments (L92) are used only where the environment cannot show a step or an abstract scene clearly helps.
How to find the concept first and the rules are in references/MOTION.md; the stage engine's helpers, the
`STORY.motion` element fields (`spring`, `swap`, `sfx`), and `moves` timing are in references/STAGE_ENGINE.md.

Rerun `lib/cursor_tracks.py` after any change to cues or clips; the page reads `footage.js` and `cues.js`.

`W()` matches by prefix, so it prints `WARNING cue 'No' in <seg> matched 'Now' ...` (in story.js: a `CONSOLE` line) when
the word it found is longer than the cue: pass `exact` or write the whole word. A camera key too near the edge for
its zoom prints `camera key <i> ... is clamped ... Paste [t, x, y, zoom]` on any still: paste that key.

Treat these printed warnings as errors (L57): `WARNING <clip>: key ... dropped` (a cue word matched too early),
`WARNING shots: ... gap` and `WARNING shots: ... holds still` (from `build_clips.py`). A RAMPS label names what was
compressed ("about 80 seconds of waiting"); a duration stated as fact comes from the system's timestamps (L51).

Key camera moves near a click to that take's recorded click times (`FOOT.<take>.clicks`, readable in `build/story.js`,
in timeline seconds), not to word times: word-keyed moves drift onto the wrong click when a take is re-recorded (L28).

## 5. Sound and mix

| Step | Command |
|---|---|
| Click and key sounds | `python3 lib/sfx.py` (once) |
| Motion sound cues | `node build/render.js motioncues` -> `build/motion_cues.json` (from the `sfx` fields; run before `sfx_events.py`) |
| Sound cue sheet | `python3 lib/sfx_events.py` (merges `build/motion_cues.json` when present, well under the voice; drops clicks and keys within 60 ms of the previous one, which a jump cut stacks) |
| Music bed | `python3 lib/music.py google/lyria-3-pro-preview prompt.txt audio/music/bed1` (make 2 or 3, judge them) |
| Mix and master | `python3 lib/mix.py out/mix.wav` (-16 LUFS; music windows from job.json, ducked under voice) |

job.json `music`: `{"file": "audio/music/bed1.wav", "level_db": -9, "windows": [["intro", "plan"], ["close", null]]}`.
Each window runs from the first segment's start to the second segment's end (`null` = to the end).

### Recorded call (only when the video plays a call)

A call recorded as two clean tracks (`audio/calls/<name>_agent.wav` and `<name>_caller.wav`, as `capture/caller.js`
records them) plays on the timeline with a call card, speaker-labelled captions, and rings on the lines it matches.
Each of the three parts stays off until its file exists, so a job without a call is unchanged.

| Step | Command |
|---|---|
| Turns, silence-only cuts, mix | `python3 lib/call_prep.py <name> [--maxgap 99] [--stt]` -> `audio/calls/<name>_mix.wav`, `build/call_<name>.json` (`--maxgap 99` keeps every pause; `--stt` is the paid word-timing step) |
| Fix misheard words | add `"text_fixed"` to a turn in `build/call_<name>.json` |
| Place it and make caption lines | `python3 lib/call_lines.py <name> <after_segment> [lead] [gain_db] --agent '<label>' --caller '<label>'` -> `build/call_place.json`, `build/call_lines.json`, `build/call.js` |

The call starts `lead` seconds (default 0.6) after `<after_segment>` ends; give that segment a `gap` in
`script/segments.json` that covers the call, then rebuild the voice. Label the caller "simulated" when a model plays
it. `lib/mix.py` adds the call when `build/call_place.json` exists, and `lib/deliver.py` adds its lines, with their
speaker labels, to the captions when `build/call_lines.json` exists. On screen, set `STORY.call` in `build/story.js`
(the card and rings are in `build/scenes.js`, styled by `.callcard` in `build/comp.html`):

```js
call: { from: CALL.t0 - 0.2, to: CALL.t1 + 3.2, ended: CALL.t1 + 0.6, names: CALL.names, lines: CALL.lines,
        title: 'Live call', endTitle: 'Call ended', gutter: 1500,
        src: [[CALL.t0 + 4.4, CALL.t0 + 9.0, { x: 620, y: 344, w: 520, h: 21 }, 'Greeting rule']] },
```

`src` rings use the take's CSS pixels; measure each box on the recorded frame. `gutter` is the x where every ring
label starts, so the labels form one column beside the text and never sit on a neighbouring line; without it a
label sits just right of its ring. After `ended` the card shrinks to its header.

## 6. Render and deliver

| Step | Command |
|---|---|
| Full render with audio | `build/render_par.sh out/<slug>_v1.mp4 8 out/mix.wav` (prints any page errors) |
| Captions and player | `python3 lib/deliver.py <slug>_v1.mp4` -> `out/*.srt`, `out/*.vtt`, `player.html` |
| Spend so far | `python3 lib/spend.py` |
| Status marker for the supervisor | `python3 lib/status.py "MARKER: text"` (prints it and appends it to `STATUS.md`, L75) |
| Delete a take, a clip, or render chunks | `python3 lib/clean.py rec <take>`, `clips <clip>`, or `chunks` (only inside this job, L60) |

## Review helpers

- `lib/chat.py MODEL prompt.txt out.json frames...`: send frames or audio to a reviewer model.
- `lib/grid.py out.jpg 3 files...`: contact sheet of any images.
- `lib/blur_copy.py IN OUT x y w h [...] [--css]`: a copy of an image with boxes pixelated and blurred (for the
  storyboard sheet; `--css` for 1920-wide coordinates on a device-scale-2 screenshot; PNG output leaves the rest
  of the image exactly as it was).
- The `claim-checker` agent: checks the talk track and on-screen text against `research/SOURCES.md`; the storyboard
  pass writes `review/claim_table.md`, and the final pass re-checks only what changed.
- Style reference frames and downloads for `research/STYLE_GUIDE.md`: references/MOTION.md, Style guide.

## Tested

A smoke job on 2026-09-28 ran every step above against a public page with a free voice model: capture, take,
alignment, voice assembly, clips, cursor, sound effects, mix, stills, an 8-chunk render (39.7 s, 1920x1080, 30
fps, AAC audio), captions, and the player. Whisper transcription was not exercised in that run because the test
account had no credits; it is the same code the Cloud Control demo used.
