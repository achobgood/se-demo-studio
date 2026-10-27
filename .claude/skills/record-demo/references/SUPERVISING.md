# Supervising the builder

The session that ran the interview is the supervisor. It launches the builder, relays checkpoints to the
person, and makes the cheap checks. It does not build the video itself.

## Launch (NodeTerm)

1. Write `jobs/<slug>/LAUNCH.txt`, one line:
   `Read jobs/<slug>/PROMPT.md in full and execute it. You are the builder for this job; the supervisor is the session that launched you.`
2. Dry-run, then launch from the studio root so the studio settings (Opus 5.5, high effort) apply:
   ```sh
   NT="$HOME/Library/Application Support/node-terminal/canvas-control/nodeterm.sh"
   STUDIO="<absolute path of the studio root, the folder holding .demo-studio>"
   sh "$NT" open-claude --cwd "$STUDIO" --model claude-opus-5-5 --prompt-file "$STUDIO/jobs/<slug>/LAUNCH.txt" --dry-run
   sh "$NT" open-claude --cwd "$STUDIO" --model claude-opus-5-5 --prompt-file "$STUDIO/jobs/<slug>/LAUNCH.txt"
   ```
   Always the exact id `claude-opus-5-5`, never the `opus` alias. Rename the new node to `Demo builder: <slug>`.
   Load the `manage-nodeterm-canvas` skill for the verbs (`open-claude`, `rename`, `write`, `send`, `link`).
3. Record the builder's node id in `jobs/<slug>/SUPERVISOR.md` with the launch time. Link the node to yours so you
   can read its recent output with the `get-linked-context` skill when something looks stuck.

Before launch, the person signs in to every surface the story uses in the job's Chrome, and signs out of
single-session apps in any other browser. Other long-running work the person may want to watch (for example a
studio improvement pass) also runs as its own NodeTerm session, not as a background subagent.

**Approvals.** The studio settings accept file edits and pre-approve the toolkit commands, so most of the build
runs unattended. The builder's window can still ask to approve an unusual command; tell the person to glance at
it now and then, or to answer from the NodeTerm canvas. Nothing is installed without their yes (TOOL REQUEST).
When the builder will answer questions in other NodeTerm nodes (a product driven through a terminal agent), have
it send one test `write` to an idle node before its first take. The studio settings pre-approve the write only in
this exact form: `sh "$HOME/Library/Application Support/node-terminal/canvas-control/nodeterm.sh" write ...`. If
the test write still asks, ask the person to approve it now, not mid-take (L66).

**Auto-compact.** The studio settings turn auto-compact on, and they override a person's own setting, though not
their organization's. A builder that hits its context limit with auto-compact off stops; after it compacts it
waits at an empty prompt. After any
quiet stretch, read its terminal (`get-linked-context`), and if it is idle with work pending, append a resume note
to `ORCHESTRATOR_NOTES.md` and nudge it to continue from its pending tasks (L71).

**Without NodeTerm:** ask the person to open a second Terminal window, `cd` to the studio root, run
`claude --model claude-opus-5-5`, and paste the line from LAUNCH.txt (write it as in step 1). If the job uses the AI caller and
Claude in Chrome is not enabled by default, run `claude --chrome --model claude-opus-5-5` instead. Record "Terminal
window" and the launch time in `jobs/<slug>/SUPERVISOR.md`. Watch `STATUS.md` the same way. To reach
the builder, append to `ORCHESTRATOR_NOTES.md` and ask the person to type "New entry in ORCHESTRATOR_NOTES.md,
read it now." into that window. Do not run the builder as a subagent: it could not launch its own explorers or
wait at the storyboard.

## Markers to watch for

The builder appends every marker line to `jobs/<slug>/STATUS.md` with a timestamp. Watch that file.

| Marker | What to do |
|---|---|
| `LOGIN NEEDED:` | Tell the person to sign in in the job's Chrome window (`scripts/chrome.sh <slug>` if it is closed). Sign-in is off camera; no take or screenshot runs while a sign-in page is up. |
| `STORYBOARD READY:` | Read `STORYBOARD_READY.md`, then present it to the person (below). |
| `OWNER DECISION NEEDED:` | Put the question to the person in plain words with a recommendation. For "ready for <action>": ask the person when they can do it, then append "OWNER READY FOR <action>" to `ORCHESTRATOR_NOTES.md` and nudge the builder; never let a cue reach someone who is away (L62). |
| `OWNER ACTION NEEDED:` | Relay it at once with the exact steps, word for word: a take is waiting and will time out. If the demo must respond to the action, relay only a line that says the responder is armed; otherwise ask the builder to arm one first (L48). Do not run a second responder of your own in that tab. If the builder reports it could not respond, tell the person what to do now (for example hang up and wait for a new cue) instead of trying fixes while they wait. A job's PROMPT.md may name its own marker for this; treat it the same. |
| `TOOL REQUEST:` | Relay it; nothing gets installed without their yes. |
| `ROUGH CUT READY:` | Look at it (below) and tell the person where it is. |
| `FINAL READY:` | Final checks (below), then report. |

Relay every marker in the person's own words: what happened, what they must do (or that nothing is needed), and
how long it takes. Leave out tool, file, model, and marker names (L79).

Watch with a background loop (Monitor, or `/loop`) that checks every 5 minutes for new lines in `STATUS.md`, a new MP4 in
`jobs/<slug>/out/`, spend near the cap (`python3 lib/spend.py` in the job folder), or the builder going idle, with a
20 to 25 minute heartbeat. Do not poll faster; it wastes effort and changes nothing. The exception is a take that
waits for an owner action: a 5-minute check can miss a 5-minute wait. While such takes can run, agree the window
with the person and watch STATUS.md continuously (a Monitor that tails it), so the line reaches them within
seconds.

## Reaching the builder

A NodeTerm `send` waits until the builder is idle, which in an autonomous run can mean the end of the job. What
works: append a dated entry to `jobs/<slug>/ORCHESTRATOR_NOTES.md`, then `write` a one-line nudge into the
builder's terminal ("New entry in ORCHESTRATOR_NOTES.md, read it now."). `write` asks the person to confirm.

To stop a live sequence mid-way, ask the builder to stop it without its reset step when the allowed change must
hold for a retry; killing the runner yourself can reset that change between cause and effect (L53).

## The storyboard checkpoint

This is the cheapest moment to fix a claim or a story. Check that `STORYBOARD_READY.md` holds the claim checker's
summary and a contact sheet (`review/storyboard_sheet.jpg`); if either is missing, ask the builder for it before
presenting (L77, L78). Tell the person plainly that they are the approver and that they answer here, not in the
builder window (L76). Present, in chat:
- the story in three sentences and what it deliberately leaves out;
- the chapter list with timings;
- the full draft talk track (quote it, do not summarize);
- every claim that is not simply describing the screen, with its source;
- the state changes the builder plans to make in the demo environment;
- what the screen shows while each live event happens off screen (never polling or an idle wait, L50 and L61);
- the concrete list of identifiers that will be visible, with the proposed blur for each, so the person sets the
  redaction scope against real items (L58);
- the contact sheet (open it for them, for example with `open review/storyboard_sheet.jpg` in the job folder) and
  the claim checker's summary;
- your own concerns: anything that reads as an unsupported cause (L3), a number, a beta feature, or marketing
  voice.
Ask for approval or changes. Then append `STORYBOARD APPROVED` (with any changes, quoted) to
`ORCHESTRATOR_NOTES.md` and nudge the builder.

## Checks worth doing yourself

- After the rough cut: render a contact sheet (`python3 lib/grid.py` over stills from
  `node build/render.js stills ...`) and read `script/speech.txt` against `research/CLAIMS.md`.
- Pull full-size frames of any shot with account names, emails, or third-party data if redaction applies.
- Sum the cost log (`python3 lib/spend.py`).

## Final report to the person

Where the video and player are; the story and what it leaves out; each claim with its source; total spend; how
long it took; the evidence boundary (no human listen, SME, brand, or legal review); open owner decisions
(branding and external use, contested claims, anything left changed in a shared demo environment); and disk to
reclaim (raw takes and clips). Distinguish "the video is done" from "the video is approved for customers".
Name exactly one final file.

If the person asks to add something after the final, say what it costs before you pass it on: a new storyboard
round, likely a new sign-in, and about one to two more hours, often more (L67).

Before the report, and also when a job stops early, make sure the job's Chrome is stopped
(`scripts/chrome.sh <slug> --stop`). Keep `jobs/<slug>/.chrome-profile`, which holds their signed-in session,
until the person says the job is finished: a change after the final needs it (L67). Then ask whether to delete it.
Remind them never to zip or share `jobs/`: it holds raw, unblurred footage.

If the job used the AI caller, also give them the "After the job" list in references/AI_CALLER.md: the Mac's
sound output and Webex audio back to their usual speaker and microphone (the Mac and its calls are silent until
then, L82), and "Enabled by default" off
in `/chrome` if they want it off.
