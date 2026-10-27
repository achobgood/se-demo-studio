# Pipeline: the toolkit, step by step

Every job folder (`jobs/<slug>/`) is a copy of `toolkit/job-template/`. Run commands from the job folder unless
a path starts with `scripts/` (studio root). Every paid call checks the job's cap first and logs its billed cost
to `logs/costs.jsonl`. This order was tested end to end on 2026-09-28.

## 0. Configure the job

`job.json`: `title`, `disclosure` (player page), `budget_usd`, `hours`, `chrome_port` (assigned by new-job.sh),
`app_url` (landing page for new tabs), `app_match` (URL fragment of the product tab), `theme` (`light`, `dark`,
or `null`), `respell` (spoken form to written form, e.g. `{"S D WAN": "SD-WAN"}`), and `music` (see step 5).

## 1. Browser, exploration, capture

| Step | Command |
|---|---|
| Start this job's Chrome (owner signs in) | `scripts/chrome.sh <slug>` (root); stop with `--stop` |
| Explore in your own tab | `node capture/tab.js <tag> '<async JS using page, C, shot, text, dtext, sleep>'` |
| Park a tab in a take's starting state (not recorded) | `node capture/park.js <name>` (states listed in its `PARK`) |
| Record a take | `TAG=rec node capture/rec.js <take> capture/takes/<script>.js` |
| Contact sheet of a take | `python3 lib/recsheet.py <take> 5 20 35 ...` (recording seconds) -> `review/sheet_<take>.jpg` |
| Frame at a recording time | `python3 lib/frameat.py <take> <seconds>` |

If the DevTools endpoint hangs (L12, L13): kill hung `node capture/...` processes, close runaway tabs with
`curl -s http://127.0.0.1:<port>/json/close/<id>`, and if it still does not answer (Chrome may have updated itself
while running), restart this job's Chrome with `scripts/chrome.sh <slug> --stop`, then `scripts/chrome.sh <slug>`.
The signed-in session survives a restart.

A take script (`capture/takes/example_take.js`) receives `page, C, mv, click, clickLoc, type, typed, wheel, mark,
sleep, dtext`. `mark('name')` drops a labeled timestamp into `log.json` that you can find later. Output:
`capture/rec/<take>/NNNNN.jpg` plus `log.json` (frame times, pointer track, clicks, keys).

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
| Map takes to narration time | edit `build/edit.py` (CLIPS, RAMPS, SHOTS) using `S()`, `E()`, `W()` |
| Build 30 fps clips | `python3 lib/build_clips.py` -> `assets/clips/<clip>/`, `build/footage.json` |
| Blur redaction regions | `python3 lib/redact.py [clip ...]` (regions in `build/edit.py` REDACT; rerun after every `build_clips.py`, which rebuilds clips from the raw frames) |
| Add cursor, clicks, keys | `python3 lib/cursor_tracks.py` -> `build/footage.js`, `build/cues.js` |
| Words and camera | edit `build/story.js` (title, agenda, frame shots/urls/chapters/camera, value, close) |
| Check frames | `node build/render.js stills review/stills 3 42.5 118` then look at them (`python3 lib/grid.py`) |

At every cut, look at the incoming clip's first frames (`python3 lib/frameat.py <take> <seconds>`); if a spinner or
"Loading" is still up, move that clip's first key later, to where the screencast stops sending frames (L21).

Rerun `lib/cursor_tracks.py` after any change to cues or clips; the page reads `footage.js` and `cues.js`.

Treat these printed warnings as errors (L57): `WARNING <clip>: key ... dropped` (a cue word matched too early),
`WARNING shots: ... gap` and `WARNING shots: ... holds still` (from `build_clips.py`). A RAMPS label names what was
compressed ("about 80 seconds of waiting"); a duration stated as fact comes from the system's timestamps (L51).

Key camera moves near a click to that take's recorded click times (`FOOT.<take>.clicks`, readable in `build/story.js`,
in timeline seconds), not to word times: word-keyed moves drift onto the wrong click when a take is re-recorded (L28).

## 5. Sound and mix

| Step | Command |
|---|---|
| Click and key sounds | `python3 lib/sfx.py` (once) |
| Sound cue sheet | `python3 lib/sfx_events.py` |
| Music bed | `python3 lib/music.py google/lyria-3-pro-preview prompt.txt audio/music/bed1` (make 2 or 3, judge them) |
| Mix and master | `python3 lib/mix.py out/mix.wav` (-16 LUFS; music windows from job.json, ducked under voice) |

job.json `music`: `{"file": "audio/music/bed1.wav", "level_db": -9, "windows": [["intro", "plan"], ["close", null]]}`.
Each window runs from the first segment's start to the second segment's end (`null` = to the end).

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
- The `claim-checker` agent: checks the talk track and on-screen text against `research/SOURCES.md`.

## Tested

A smoke job on 2026-09-28 ran every step above against a public page with a free voice model: capture, take,
alignment, voice assembly, clips, cursor, sound effects, mix, stills, an 8-chunk render (39.7 s, 1920x1080, 30
fps, AAC audio), captions, and the player. Whisper transcription was not exercised in that run because the test
account had no credits; it is the same code the Cloud Control demo used.
