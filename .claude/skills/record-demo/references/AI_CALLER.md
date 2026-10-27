# AI caller: a live call with no human on the line

Use this when a demo needs a real phone call into the product (for example a Webex Contact Center AI Agent) and
the owner should not place it. ChatGPT voice mode plays the caller. The Webex desktop app places the call over
Webex Calling. Two virtual audio cables carry the sound in each direction, so no speaker, microphone, or room is
in the path, and both sides are recorded as clean separate tracks.

Status: verified on 2026-10-16, first with a mobile phone and then end to end against a Webex Contact Center AI
Agent in a demo tenant (10 exchanges, no human on the line; evidence below). The caller
speaks only; it cannot press keypad keys, so the product side must work by conversation (no DTMF menu before the
AI Agent).

Verified on one Mac only, the owner's, which already had the cables, Chrome signed in to ChatGPT, and Webex set
up. No one has yet followed the Setup below from a clean Mac, and the Webex, ChatGPT, and macOS versions were not
recorded. The first time a person sets this up, note those versions and anything that went wrong in the job
README. The page labels used below (`Start Voice`, `End Voice`, `.ProseMirror`, the message-bubble attributes) and
the Webex button name `End call` were seen on 2026-10-16 and can change. If one is not found, list the page's
buttons (`[...document.querySelectorAll('button')].map(b => b.getAttribute('aria-label') || b.textContent.trim())`),
tell the person what you see, and do not guess a different control.

## How the audio is wired

| Direction | Path | Recorded as |
|---|---|---|
| Call to ChatGPT | Webex speaker = BlackHole 2ch, ChatGPT microphone = BlackHole 2ch | `audio/calls/<name>_agent.wav` |
| ChatGPT to call | ChatGPT voice = BlackHole 16ch, Webex microphone = BlackHole 16ch | `audio/calls/<name>_caller.wav` |

- One cable cannot carry both directions: each side would hear itself. Hence two cables.
- The Mac's sound output must be BlackHole 16ch while calls run (System Settings > Sound > Output). In two jobs
  the call side heard ChatGPT only once it was (L82). Everything the Mac plays then goes into the cable, so the Mac
  is silent until it is switched back after the job. The Mac's own microphone stays as it is.
- ChatGPT's microphone and voice are also routed to the cables by `capture/caller_patch.js` inside the ChatGPT
  tab, whatever Chrome's own microphone setting says.

## Setup (once per Mac, about 10 minutes)

The supervisor walks the person through these steps before the builder launches, one at a time, saying exactly
what to click. The builder cannot do them: they need the Mac password, the Webex app's settings, or the person's
phone. Run the commands from the job folder.

Ask these first. A no to any of them ends the AI caller plan, so offer the demo without it instead:

- Does their Webex account have Webex Calling, and can that line dial outside numbers?
- Can they open chatgpt.com in Chrome and see a voice button in a chat?
- Can they install a driver on this Mac (they know the Mac password, and no IT policy blocks it)?
- Which number will the caller dial: the demo tenant's entry point, or their own phone? It must be a number they
  are allowed to call (step 8 tests it).

1. **Audio cables.** Ask the person to paste `brew install blackhole-2ch blackhole-16ch` into a Terminal window
   and type their Mac password when asked. Without Homebrew, they download the 2ch and 16ch installers from
   https://existential.audio/blackhole/ and run both. Either way the install needs the Mac password; if it is
   refused or blocked, stop and tell them to ask IT. Then run `node capture/caller.js check`. If a cable shows
   MISSING, ask them to run `sudo killall coreaudiod` in that Terminal window, and check again.
2. **Claude in Chrome.** Needs Claude Code signed in with a Claude Pro, Max, Team, or Enterprise account. Ask the
   person to type `/chrome` in this Claude session and choose **Enabled by default**, so every new session,
   including the builder, can use their Chrome. If Claude Code offers to install the extension, they choose
   **Install extension** and follow its steps (it is also at
   https://chromewebstore.google.com/detail/claude/fcoeoabgfenejglbffodgkkbkcdhcgfn). When Chrome asks whether
   Claude may act on chatgpt.com, they allow it. They can turn "Enabled by default" off after the job.
3. **ChatGPT.** In their regular Chrome (not the job's Chrome), they sign in to chatgpt.com, open any chat, press
   the voice button once, and allow the microphone when Chrome asks. Then they end voice mode.
4. **Webex.** Needs the Webex desktop app signed in with Webex Calling that can dial outside numbers. In the
   Webex app, Settings > Audio: **Speaker = BlackHole 2ch**, **Microphone = BlackHole 16ch**. While these are set,
   Webex calls are silent on the Mac; tell them to switch back after the job. Then in System Settings > Sound >
   Output, choose **BlackHole 16ch** (L82); the Mac plays no sound until they switch it back.
5. **Mac permissions for the terminal app running Claude (Terminal or NodeTerm).** In System Settings > Privacy &
   Security, turn it on under **Microphone** (so the cables can be recorded) and **Accessibility** (so Claude can
   press Webex's End call button). macOS may also ask on first use; they click Allow. `node capture/caller.js
   hangup` with no call up should answer "NO END BUTTON FOUND", not an error.
6. **Test call to their own phone.** `node capture/caller.js record setup_test`, then `node capture/caller.js
   dial <their mobile number>`. They answer, say one sentence, and hang up. Then `node capture/caller.js
   stoprec`. Pass: the `agent` line shows sound (numbers above 0.02). If the sound is on the `caller` line
   instead, Webex's speaker and microphone are swapped (step 4). If both lines are all 0.00, the terminal has no
   Microphone permission (step 5); quit and reopen the terminal after allowing it.
7. **ChatGPT voice test.** Step 6 only proves the call side. Run Run order steps 1, 2, 4, and 5 once (no persona
   yet): `check`, paste `caller_patch.js` into the chatgpt.com tab, start voice mode, then `loopback` must print
   `PASS`. End voice mode afterward (`button[aria-label="End Voice"]`). This proves the other half: ChatGPT's
   microphone, its voice reaching the 16ch cable, and the page labels. If the voice button, the `mic BlackHole 2ch`
   line, or PASS is missing, fix it now with "If something is stuck" below.
8. **The real number, once per target.** Before the first take against a number that is not their own phone:
   `record check_<name>`, `dial <that number>`, `watch 30 10 20`. Pass: `call side has audio`. If the call never
   rings or Webex shows it blocked, the Webex line cannot reach that number; stop and tell the person, because
   the calling plan is theirs to change.

Launch the builder only after steps 6 and 7 pass, and step 8 for a new number.

## Run order

Inside the job folder. The ChatGPT steps run through Claude in Chrome (tabs_context_mcp, javascript_tool).

Dial only the person's own phone or the demo tenant's entry point they named in the interview. `caller.js dial`
will call any number, and ChatGPT will talk to whoever answers.

1. `node capture/caller.js check`: both cables present, Webex running.
2. Open chatgpt.com in a new tab in the builder's own Claude in Chrome tab group (`tabs_create_mcp`). Claude in
   Chrome sees only its own tab group, not the person's other tabs, and the new tab may be signed out. If it shows
   a sign-in, print "LOGIN NEEDED:" and have the person sign in in that tab first; do not screenshot it (L74).
   Paste the whole of `capture/caller_patch.js` into javascript_tool. It returns `patched` (or `already`). Never
   reload a patched tab: a reload removes the patch and the call goes silent on the cable (L74). If it did reload,
   paste the patch again and rerun step 5 before dialing.
3. Send the caller persona as a typed message, ending with: Reply to this message with just "Ready" for now.
   Persona for a Contact Center AI Agent: who the caller is, the fictional facts they hold (name, account, ZIP),
   what they want, that they wait for the agent to speak first, one or two sentences per reply, no keypad, and
   to say goodbye when the matter is resolved. Store it in `script/caller_persona_<name>.txt`.
   Typing that worked: focus `.ProseMirror[contenteditable=true]`, `document.execCommand('insertText', false,
   text)`, then press Enter.
4. Start voice mode: click the last `button[aria-label="Start Voice"]`; wait for `button[aria-label="End Voice"]`
   and a `mic BlackHole 2ch` line in `window.__aiCallerLog`. `mic FAILED` means Chrome blocked the microphone.
5. `node capture/caller.js loopback`: speaks a test line into BlackHole 2ch and must print `PASS` (ChatGPT's reply
   reached BlackHole 16ch). Do not dial on a FAIL. Run it right before each dial, not once per session (L74). If
   it fails while the Mac's sound output is BlackHole 16ch and the patch is active, do not keep retrying: print
   "OWNER DECISION NEEDED:" and offer one short test call to the person's own phone (Setup step 6) to check the
   caller side (L82).
6. `node capture/caller.js record <name>`, then `node capture/caller.js dial <number>`, then
   `node capture/caller.js watch [max] [idle] [answer]`. Watch hangs up through Webex and stops the recording when
   the call side stays silent past `answer` seconds (ringing, no answer), after `idle` seconds of silence on both
   tracks, or at `max`. It prints per-second peaks for both tracks.
7. Read the transcript in the ChatGPT tab, then end voice mode (`button[aria-label="End Voice"]`):
   `[...document.querySelectorAll('[data-user-message-bubble], [data-markdown-text-style="assistant-message"]')]`
   in page order; a user bubble is what ChatGPT heard, an assistant message is what it said. Save it to
   `audio/calls/<name>_transcript.txt`. Voice turns can reach the page late, so the audio tracks, not the
   transcript, decide whether the call was live.

## After the job

Tell the person, and do not skip it: their Mac and Webex calls stay silent until they put both back.

1. In System Settings > Sound > Output, choose their usual speakers (it was BlackHole 16ch). In the Webex app,
   Settings > Audio: set Speaker and Microphone back to their usual devices (they were BlackHole 2ch and 16ch).
2. ChatGPT: voice mode ended, so the microphone is not open.
3. `node capture/caller.js stoprec` from the job folder answers "not recording" when nothing is left running.
4. Optional: `/chrome` in Claude, and turn "Enabled by default" off if they only enabled it for this job.
5. `audio/calls/` holds both sides of every call. Do not share or zip it.

## Evidence (2026-10-16, one test job)

- Loopback after the fix: `say` into BlackHole 2ch; ChatGPT's transcript shows it heard "Hello, this is a second
  test. What color is the sky" and its spoken reply reached BlackHole 16ch at seconds 6 to 11 (peak 0.14).
- Call `test4` to a mobile phone: call side (2ch) audio at seconds 1 to 18, ChatGPT's voice (16ch) at seconds
  8 to 11 and 15 to 16. Transcript: HEARD "Hello, can you hear me" / CALLER "Yep, loud and clear..." / HEARD
  "No, that's good" / CALLER "Great, thanks for confirming." The person on the phone confirmed it worked.
- `dial` placed every call through the Webex desktop app with no confirmation prompt.
- `hangup` pressed the Webex button named "End call" on call `test1`. Later runs reported no button because the
  call had already ended on the phone side.
- Earlier, 2026-10-15: the same approach worked with one cable (ChatGPT's voice reached the call through the Mac's
  speakers and room). Replaced by the two-cable wiring above so the call does not depend on a quiet room.

- Call `contactcenter1` to a demo tenant's Contact Center entry point that routes to an outage-reporting AI
  Agent, persona `script/caller_persona_<name>.txt` (a fictional customer with a fictional address). Loopback
  PASS first (16ch at seconds 6 to 13). Ten exchanges with both sides alternating on the two tracks:
  name, address, outage status with a 9:30 PM estimate, then cause, scale, firm time, food, generator, and bill
  credit. The agent's generator answer was "never run a generator indoors or in a garage, even with the door
  open". The caller declined a representative and both said goodbye; the call had ended by the time `watch` went
  to hang up.

## What did not work

- **Routing ChatGPT's voice only through play() and AudioContext.** ChatGPT's voice player receives its stream
  by assignment (`srcObject`) without a play() call, so the voice went to the Mac's speakers and loopback failed
  (it was audible on the Mac). The `srcObject`/`src` hook in `caller_patch.js` fixed it. This also explains the
  earlier loopback that was silent for no visible reason. The fix was proven as a second injection on top of the
  older patch; the combined file has the same code but has not run as one paste yet.
- **One ffmpeg recording both cables.** Call `contactcenter1` came out 126.6 s on one track and 162.7 s on the other
  for a run of about 182 s. The device input also leaves timestamp gaps (8.06 s written for a 10 s capture).
  `record` now runs one ffmpeg per cable with `aresample=async` gap filling: a 60 s run gave 59.68 s and
  59.72 s. Whether those gaps also cut real audio (small holes in speech) is not verified; listen to one take.

- **The job's own Chrome (DevTools-driven profile).** A fresh profile has no microphone permission. A DevTools
  `Browser.grantPermissions` grant showed "granted" only while the command was connected; once it exited the page
  was back to "prompt" and ChatGPT showed "Enable microphone access in Settings". Every call made that way had a
  deaf ChatGPT. The permission popup also did not appear on request. Use the regular Chrome.
- **Swapped Webex devices.** With the speaker on 16ch, ringback and the phone user's voice landed on the 16ch track
  and nothing reached ChatGPT. Check that the call side shows up on the `agent` (2ch) track.
- **Hanging up on transcript silence.** The transcript stays empty while the phone rings, so a transcript-based
  silence timer hung up before the call was answered. `watch` uses the audio tracks instead.

## If something is stuck

- **`record` says "already recording".** `audio/calls/.recording.json` exists, and only a clean `stoprec` deletes
  it, so a closed terminal or a crash leaves it behind. Run `node capture/caller.js stoprec`; it stops the
  recorders and removes the file. If a recorder is still running (`pgrep -fl avfoundation` lists them), ask the
  person, then stop only those naming BlackHole: `pkill -f 'avfoundation.*BlackHole'`.
- **ChatGPT's voice is heard on the Mac's speakers and `loopback` says FAIL.** The Mac's sound output is not
  BlackHole 16ch (Setup step 4), or the patch is not active in that tab. Check the output, then paste
  `caller_patch.js` again (a reload removes it).
- **A page label is not found** (voice button, message box, transcript bubbles, Webex End call): see the Status
  paragraph at the top. List the buttons, tell the person, and do not guess.
- **`mic FAILED`** in `window.__aiCallerLog`: Chrome blocked the microphone for chatgpt.com. They allow it in
  Chrome's site settings for that page, in their regular Chrome, then start voice mode again.

## Known gaps

- Untested: whether voice mode works in ChatGPT's Temporary Chat, which might stop it carrying earlier test roles
  into the call (see "ChatGPT carries context" below). Try it once in Setup step 7 before relying on it.
- Treat `loopback` PASS as the gate before every call. It makes ChatGPT answer a test line, so run it before
  sending the persona, or in the same chat with the persona sent afterwards (that order worked for contactcenter1).
- ChatGPT carries context between chats: it answered loopback lines in the earlier "AI test caller" role. The
  persona message, sent last, overrode it on contactcenter1.
- `contactcenter1` was recorded before the recorder fix, so its two tracks are not time-aligned.
- A builder session needs Claude in Chrome for the ChatGPT steps; a NodeTerm builder without it cannot run them.
- What leaves the Mac: ChatGPT (OpenAI) hears the whole call, including the product's side. Fictional data only.
