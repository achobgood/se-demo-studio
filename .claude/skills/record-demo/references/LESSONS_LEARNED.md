# Lessons learned

Collected from four real jobs in September 2026: a 90-second Cisco Cloud Control ad, a 5-minute Cloud Control
virtual SE demo (Mexico City incident), a paused Cloud Control plus Webex Control Hub demo, and a Packet Path
explainer, plus sections added in October 2026. Numbers in brackets (L7) are cited from the builder prompt.
Every lesson applies to any product; products are named only as the example a lesson came from. Product-specific
notes live with their worked example (for Cisco Cloud Control, `examples/cloud-control-se-demo/PRODUCT_NOTES.md`).
Two sections are headed "read only if": skip them when the job does not have that condition.

## Story and truth

L1. **One story the data supports end to end beats a feature tour.** Pick one incident (one site, one user, one
    call) and prove it exists before storyboarding. Check it again right before recording: instant demos reset,
    and scheduled demo workflows can re-trigger or change the data between takes.
L2. **Demo tenants inject faults on a schedule.** The Cloud Control demo ran an "AP-Reboot" workflow every two
    hours "to trigger device unrechability events", plus a switch power-cycle workflow. The incident you film may
    be synthetic. Never narrate a root cause the data does not show, and prefer historical, fixed records over
    "right now" views when you need the same picture on every take.
L3. **Keep causal claims honest when the data does not line up** (different sites, different days, different start
    times). Say what each product shows and let the audience connect it. A viewer later asked why the demo "didn't
    pick up the UTD fault as the root cause"; the honest answer was that the story deliberately scoped to one site
    and never asked. Decide up front what the demo will and will not investigate, and say it on screen or in the
    talk track ("The San Jose piece goes to the SD-WAN team") so the omission is a choice, not a gap.
L4. **Write the final talk track after recording**, from what the take actually shows. Live AI answers change
    run to run; a script written before recording will describe answers that never appeared.
L5. **Every sentence about the screen must match what is visible at that moment**, and a result screen must hold
    long enough to read. A claim-check agent caught a line whose supporting text was only on screen during a
    sped-up wait, and a result that was visible for 0.07 seconds while described.
L6. **Paraphrase is not a quote.** Claim tables must carry verbatim source text. A paraphrased Cisco sentence
    presented as Cisco's words was caught and removed.
L7. **Do not infer facts from names** ("data center router" from a hostname). Say only what the UI states.
L8. **Counts in demo data are not claims.** Do not narrate them.
L9. **An AI product's agents can be unavailable on the day.** In one session only one of eight product agents
    answered in Default mode; others returned "tools are not available". The Webex job's call-quality agent
    errored on four different prompts. Probe every agent you plan to show, build only on what answers, and
    re-check just before recording. If the feature the story depends on does not work, stop and tell the owner
    rather than building a thinner story around it.
L10. **Check what an integration actually shares before designing the story.** Webex Control Hub gives Cloud
    Control inventory only (no alerts, no topology), so no Webex alert could ever start a Cloud Control story.
    Read the product's integration table first.

## Browser and capture

L11. **One Chrome per job, on its own port and profile.** Two jobs in one Chrome break both. `scripts/new-job.sh`
    assigns a free port; `scripts/chrome.sh` starts it.
L12. **Keep DevTools clients few.** With four exploring agents attached at once the endpoint hung twice (a
    renderer spun at 100% CPU for 30 minutes; later `connectOverCDP` hung while attaching). At most two
    browser-driving agents at once, each in its own tagged tab (`capture/tab.js`), and no exploring while
    recording. Recovery: kill hung node processes, close runaway tabs with
    `curl http://127.0.0.1:<port>/json/close/<id>`, and if needed restart that Chrome with the same profile
    (`scripts/chrome.sh <job> --stop`, then start). The signed-in session survived every restart.
L13. **Chrome can auto-update while running** and the DevTools endpoint then stops answering. A restart fixes it.
L14. **Theme flips mid-take.** Apps follow the OS appearance (dark at night) and some have an account-level Theme
    preference that overrides the browser emulation. Pin `"theme"` in job.json, start every take from a known
    state (a page load, or `capture/park.js` in single sign-on apps, L49), and check the app's own profile theme
    setting. One take flipped to dark halfway through and had
    to be re-recorded.
L15. **Shadow DOM hides chat text.** Assistant and canvas conversations often live in shadow roots, so
    `document.body.innerText` misses them. Use `dtext()`.
L16. **Rich text boxes drop fast keystrokes.** A 30 ms typing run produced "hat is going on?I am seeing ... W".
    Type at 80 to 150 ms per key with jitter (`type()` in rec.js), read the box back with `typed()`, and press
    Enter only on an exact match.
L17. **Links inside embedded product pages open new tabs.** Set `target=_self` on the anchor before clicking to
    keep one continuous screen share.
L18. **Record long continuous takes per segment**, not many short clips, so the edit reads as one screen share.
    Cut only where a real SE would switch views.
L19. **Opening things has side effects.** Opening an action auto-ran an AI analysis and posted notifications;
    searching auto-opened the first result; conversations started in one view appeared in another. Record the
    beats in story order, and log every state change in `logs/state_changes.md`.
L20. **Screenshots can hang** on "waiting for fonts"; `shot()` falls back to a raw DevTools capture.
L21. **A take's first seconds may still be loading.** At one cut the next take started while a "Loading canvas"
    spinner was still up. Check the raw frames and start each clip after the screencast stops sending frames
    (the page has settled).

## Voice and audio

L22. **Voice that worked:** `google/gemini-3.8-flash-tts`, voice Iapetus, scored 9/10 for a "calm, assured,
    technical demo voice, not a marketing voice", ahead of Charon, which suited the ad better. One call held a
    whole 820-word script (about 4.5 minutes, about $0.08). Gemini TTS has no working style field. Fish Audio
    needs a voice id; Sesame returned 400; MAI Harper said "won" for WAN. Check the catalog
    (`python3 lib/models.py speech`) because newer voices appear often.
L23. **Pronunciation lives in the speech text**, never in style instructions: "S D WAN", "Thousand Eyes",
    "inter-sight", ISE as the word "ice". When a voice keeps saying the wrong word, reword the line.
L24. **Whisper mishears** ("loss chart" became "last chart"; "Generate summary" became one token). Confirm with a
    short listen by an audio model (`lib/chat.py openai/gpt-audio ...`) before rewording.
L25. **Splice only at paragraph gaps**, loudness-matched to the base take (`lib/build_voice.py` does both). A
    listen check rated two borrowed paragraphs indistinguishable from one continuous read.
L26. **Music beds:** one of three Lyria beds had garbled spoken vocals at 0:12. Always have a model judge them.
L27. **Sound effects:** only the recorded clicks and keystrokes, quiet. No whooshes over product footage.

## Edit and render

L28. **Key the camera to recorded click times** (`FOOT.<take>.clicks`), not to word offsets, whenever a take is
    re-recorded. Word-keyed moves drifted onto the wrong click after a re-record.
L29. **The camera clamps to the frame.** A push-in target nearer the edge than `540/zoom` vertically (or
    `960/zoom` horizontally) is silently moved inward and can land on blank space. Check every push-in in a
    rendered still.
L30. **Camera keys must be in time order**; an out-of-order pair snaps the picture for a frame. scenes.js logs it
    as a console error during render; fix any it reports.
L31. **Render speed:** 8,730 frames in about 5 minutes with 8 chunks. Render stills at chosen seconds
    (`node build/render.js stills ...`) for every check instead of full renders.
L32. **Disk:** a 5-minute job reached 9.7 GB (raw screencast 5.4 GB, 30 fps clips 2.6 GB). Delete superseded raw
    takes as you go and report what can be reclaimed at the end. Waits fill the disk fastest: a 10-minute wait
    that clicked refresh every 5 seconds made 4 GB of raw screencast. During long waits poll less often, record at
    a lower JPEG quality (`JPGQ=75 node capture/rec.js ...`), and delete failed wait takes at once.

## Process

L33. **Real schedule:** exploration about 40 minutes, capture about 40, voice and first render about 30. A full
    job took about 4 hours including two review rounds.
L34. **Real cost:** the 5-minute demo spent $2.66 of OpenRouter for 58 calls; the 90-second ad $1.21. Claude usage
    is separate.
L35. **Review with models other than the writer**, at most two rounds, and verify each finding (reproduce,
    measure, or re-listen) before acting. Log every finding with its disposition. Fresh reviewers always find
    something new; stop at two rounds unless a finding is a real accuracy or legibility defect.
L36. **Reaching a running builder:** a NodeTerm `send` waits until the builder is idle, which in an autonomous run
    can mean the end of the job. What worked: append to the job's `ORCHESTRATOR_NOTES.md`, then `write` a
    one-line nudge into the builder's terminal; it queues and arrives at the builder's next step.

## Own environments

L37 to L62 come from a Webex Contact Center demo (2026-10-14) that the studio's author recorded in their own
sandbox, with live calls placed during takes. "The person running that job" below means that author. They are
grouped by when they apply, so their numbers are not in order across the next four sections.

L37. **In the owner's own environment, do reconnaissance in the job's Chrome.** Exploring first in another browser
    meant a second sign-in. Create the job early, look around through `capture/tab.js`, and write what you confirm
    (exact names, values hidden behind variables or settings panels, which records exist) into INTERVIEW.md's
    "Verified facts", with a "Still unverified" list for exploration to close.
L40. **Time windows limit live takes.** Business hours or a reservation can change what the system does (an
    after-hours path instead of the main one). Record the window and its time zone, check the clock before each
    live take, and do everything that does not depend on it (voice, music, edit) outside the window.
L41. **Show the system's own record of what the screen cannot capture.** Phone audio and other devices are not in
    the screencast. A trace, log, or history view showed the exact text the caller heard, which was stronger than
    narrating it. When the product masks an input in that record, point at the result it produced, not the input.
L42. **Allowed state changes are named one by one.** "No administration" blocked the strongest moment; the owner
    allowed one exact change. Make only that change, reset it after every take, and log both in
    `logs/state_changes.md`.
L43. **Other people's content shares the environment.** Other customers' and projects' records and test objects sat
    beside the demo data. Filter or search every list before it is visible, open records by direct link, and avoid
    list pages that cannot be filtered. Blur the owner's own identifiers too, such as their phone number shown as a
    caller.
L44. **Map surfaces and identities before recording.** An admin console and an operator app needed one identity
    that covered both; the operator app allowed one session at a time, so it had to be signed out elsewhere; one
    surface opened in a new tab. Before each take, check every surface is ready: signed in, stray dialogs closed
    (one opened with a preferences dialog still up), status or presence set.
L45. **Test direct links before relying on them.** A direct URL to a list landed on an account page while the same
    page opened fine from the menu. Prefer navigating through the UI when a link is refused. A refused link can
    land on a sign-in page, which must never be recorded (L47).
L46. **Show the version that is live.** An editor header said "Draft" while the list said "Published". Confirm the
    configuration on screen is the version live traffic uses before narrating it.
L47. **Sign-in screens are never recorded.** The person running that job asked that no password entry at sign-in
    be recorded, and that any recording that caught one be erased. Start takes and screenshots only on a signed-in page and never pass
    through sign-in, SSO, password, or one-time-code pages. If the job's `capture/cdp.js` has `signInReason`,
    `rec.js` refuses to start on such a page and deletes a take that reaches one, and `shot()` will not save one;
    jobs copied before that guard existed lack it, so check by hand there. If a raw frame or screenshot still shows
    one, delete the raw files (not just edit copies), log it, and print "LOGIN NEEDED:".
L49. **In apps with single sign-on, a full page load can pass through the sign-in page** even when the session is
    valid. `page.goto` to an in-app URL, and any brand-new tab, redirected through a sign-in URL for a moment, and the
    guard (L47) rightly killed the take. Record in the long-lived signed-in tab, navigate by in-app clicks, and do no
    page loads mid-take. Put the tab in the take's starting state with a separate park step (`capture/park.js`, not
    recorded), and have the take check where it starts instead of navigating there (`atStart`, PIPELINE section 1).

## Any job: waits, voice, edit, and shell

L50. **Never show polling or idle waiting.** A first cut showed a list's refresh button being clicked while the
    voice described the owner's live action. The person running that job: "That doesn't show well in a demo". While an event happens off
    screen, show something meaningful that follows the narration (for example walk the path the event takes in the
    configuration), then cut to the result already present, starting at the first frame where it is listed. The
    same goes for an empty screen waiting for something to arrive: cut it to a short beat. Keep labeled speed-ups
    for on-screen progress worth watching, such as an answer being generated.
L51. **A speed-up label describes the footage, not the event.** "Sped up · the call took about 80 seconds" was the
    length of the sped-up footage, waiting included; the system's own timestamps showed the call lasted about 45
    seconds. Name what was compressed ("about 80 seconds of waiting"), and take any duration stated as a fact from
    the system's own timestamps.
L55. **A paragraph's last word can be cut off.** Speech-to-text put a paragraph's last word into the gap after it,
    so the voice cut dropped "queue" while the caption kept it. `lib/build_voice.py` now ends with an edge check that
    prints `EDGE MISMATCH <segment>` when a segment's first or last aligned word differs from its script paragraph;
    take that paragraph from another take. A number word can show up as digits and trip it; check those by ear.
L56. **Measure joins; do not ask a listening model about them.** Asked "is there an audible jump?", the audio judge
    said "no" on both versions in one test and "yes, noticeable" on the same kind of join earlier. Asked in detail,
    it gave different answers for two byte-identical files. Use the listening model for gross faults (missing or
    misread words, artifacts heard on a re-listen of a short clip). Decide level questions with a number: the
    active-speech level in dB in about 3 seconds either side of the join, compared with the same spot in the
    original continuous take.
L57. **Edit keys fail quietly** (with L28). `W(word, seg)` takes the first match, so generic words ("Here", "open",
    "after") hit an earlier occurrence; `mono()` then dropped the out-of-order key and the footage drifted. It now
    prints `WARNING <clip>: key ... dropped`; treat that as an error. Prefer distinctive cue words, and use the
    transcribed form of numbers ("3", not "three"). Separately, a 0.2 second gap between two shots flashed a later
    take, because the renderer shows the last shot in the list wherever no shot covers the time. `lib/build_clips.py`
    now warns about gaps between shots and about shots that run past their clip's keys.
L58. **Keep redaction as data, and confirm its scope with a concrete list.** The owner narrowed the scope three times,
    ending at "Only blur caller numbers". Regions kept in `build/edit.py` REDACT and applied by `lib/redact.py` made
    each change a one-minute rerun. After exploration, show the owner the exact items that will be visible on screen
    and ask which to blur, rather than asking in the abstract.
L60. **Shell small print.** `ffmpeg` inside a `while read` loop eats the loop's input unless it has `-nostdin` (the
    toolkit's `run_ff` now passes it). The command safety check blocks `rm` after a `cd` or with a glob: use absolute
    paths without globs, and write re-runs to a fresh folder instead of clearing one. macOS has no `timeout` command;
    run long takes in the background and wait for the notification.

## Canvas apps: read only if the job films a zoomable canvas (a whiteboard, diagram, or flow editor)

L38. **Pick the zoom that fits the page.** When the app has its own zoom and pan controls (a whiteboard, a diagram
    or flow canvas; most have them), use them on camera: hold the whole canvas for about two seconds as an
    establishing shot, then zoom in until labels are readable and pan between areas, the way a person would. When a
    page has no zoom of its own (a regular web page, a dense console or report), push in and pan with the edit's camera in
    `build/story.js` instead, for readability or emphasis; captures are at device scale 2, so push-ins up to about
    2x stay sharp (mind the edge clamp, L29). Avoid browser zoom: it reflows the layout. Say which zoom you used.
    Click an element to open its settings panel so real configuration is on screen; if a click only selects it,
    look for a panel toggle.
L54. **Canvas mechanics** (with L38). Start a drag pan on empty canvas: drags that began on a node or link were
    swallowed, and checking `document.elementFromPoint(x, y)` for the canvas background before pressing made every
    pan exact. Check that a click selected the element you meant: automatic layout drew one box under another, and
    the click landed on the top one. Zoom steps can be coarse (labels 5, 10, 15 px per step), so measure label height
    per step before choosing app zoom plus an edit push-in. The app's own search (type a name, press Enter) was the
    most reliable way to bring an element on screen.

## Live actions by the owner: read only if the owner acts live during takes

L39. **Owner actions during a take.** When the story needs the owner to do something live (place a call, send a
    message), print "OWNER ACTION NEEDED:" (or the marker the job's PROMPT.md names) with the exact steps, append
    it to STATUS.md, `mark()` the start of the wait, and poll the page until the result shows or the timeout
    passes (PIPELINE.md has the pattern). Keep the wait itself out of the edit (L50). Rehearse the action once with
    the owner before final takes; the rehearsal also checks schedules and data that only a live event reveals. If
    the demo must respond to the action, arm a tested responder first (L48).
L48. **Arm one tested responder before cueing the owner.** In a rehearsal the owner sat on hold through several
    re-offers: the first watcher crashed, the second looked for the wrong button label, and a third attempt missed
    because the button sat where ordinary text selectors could not reach it. When the demo must respond to an owner action (answer a call, open a
    message, accept a submission), learn the exact UI of the event during the rehearsal: the label, where it
    appears, whether it sits in a frame or shadow DOM, and how long it waits before re-offering or giving up. Build
    ONE responder from that, prove its locator matched the real event, and cue the owner only after confirming it
    is armed. Nothing else drives that tab while it is armed. It responds within a few seconds, checks the response
    took, and escalates at once if it cannot, rather than waiting silently.
L52. **Owner cues say when to act, not only what to press.** The owner pressed a key while a prompt was still
    playing; the system ignores input during such prompts, so the event took the wrong path. Write the moment into
    the cue ("wait until it says X, then press Y"). Make the take detect the wrong path itself and stop with "OWNER
    DECISION NEEDED:" rather than carrying a bad result into the next take.
L53. **Runners for a live sequence.** A script that ran several live takes in order reset the allowed change on any
    exit, so stopping it to re-arm a later take would have reset the change between cause and effect. Two copies of
    it overwrote each other's output. It also logged a state change before the take that made it, leaving three false
    rows. Run one instance at a time with its own output file; when a step fails and the state must hold for a retry,
    stop without the reset; write a state-change row only after the take's own marks confirm it (a `saved` or
    `connected` mark); and have a reset step log only when it actually changed something.
L59. **The disclosure must not overstate "fictional".** "All caller data are fictional" was untrue: a real person
    placed the calls from a real phone. When the owner performs live actions, say the company, its customers, and
    the story data are fictional, and blur the real identifiers.
L61. **Plan the live-event picture at the storyboard.** The storyboard planned "wait for the call (sped up,
    labeled)", and the owner rejected that footage. The storyboard says what the screen shows while each live event
    happens off screen (L50).
L62. **Owner availability gates live takes.** A cue sat unanswered for 10 minutes while the owner was away. What worked:
    the builder held live takes and did other work until the supervisor wrote "OWNER READY FOR <action>" in
    `ORCHESTRATOR_NOTES.md`; only then did it arm the responder and print the cue.

## AI caller: read only if ChatGPT places the calls (references/AI_CALLER.md)

L63. **Two cables, and check which track the call lands on.** One virtual cable cannot carry both directions; each
    side hears itself. With two, the Webex speaker and microphone are easy to swap: on 2026-10-16 the call's
    ringback and the phone user's voice landed on the 16ch track and ChatGPT heard nothing for three calls. The
    call side belongs on the `agent` (2ch) track; check it before blaming anything else.
L64. **ChatGPT runs in the regular Chrome, not the job's Chrome.** A DevTools microphone grant in the job's fresh
    profile lasted only while the command was connected; voice mode then lost the microphone and showed "Enable
    microphone access in Settings". The page log said "mic BlackHole 2ch" because it logged the request, not the
    result. Log results only, and use the Chrome where chatgpt.com already has the microphone.
L65. **Decide "is the call live" from audio, not the transcript.** Voice turns can reach the ChatGPT page late or
    not at all, and nothing appears while the phone rings. A transcript silence timer hung up before the call was
    answered. `caller.js watch` reads the live recordings instead.
