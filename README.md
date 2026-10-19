# Demo studio for Claude Code

Records a narrated "virtual SE" demo video of a Cisco product from a live, signed-in session in Chrome: real
product footage, an AI voice walking through one story, captions, and a player page. You describe what you want;
Claude interviews you, researches the product from official sources, explores the demo, shows you the storyboard
and talk track for approval, then records, narrates, edits, and renders on its own.

Built from four real jobs, including a 5-minute Cisco Cloud Control demo (see `examples/`).

## Start

1. In NodeTerm or Terminal, get the studio and open its folder:
   `git clone https://github.com/achobgood/se-demo-studio.git && cd se-demo-studio`. Always start Claude from
   this folder; the studio's agents only load here. To get studio updates later, run `git pull` in this folder.
2. Run `claude`. The first time, accept the prompt to trust this folder (the studio's pre-approved commands only
   load in a trusted folder; they are listed under "allow" in `.claude/settings.json`). Then say **"help me
   record a demo"**.
3. Claude checks your setup first and walks you through anything missing, including OpenRouter.

## Updates

- To get the newest version, run `git pull` in the studio folder.
- Claude runs setup each time you start a new demo, and setup installs anything the new version needs.
- To see your version, run `cat VERSION`, or read the first line setup prints. What changed is in `CHANGELOG.md`.

## What you need

- A Mac with Google Chrome, Node.js 20 or newer, and Python 3. `scripts/setup.sh` checks all of it and installs
  the capture and render tools into `toolkit/` (about 400 MB).
- Claude Code (tested on version 2.1.300; `claude update` to upgrade) with access to Opus 5.5. The studio runs
  every session at `claude-opus-5-5`, high effort. A build runs for 1 to 2 hours and uses your Claude plan.
- NodeTerm (recommended): a terminal app that shows each Claude session as a window on a canvas, so you can watch
  the builder next to the session you talk to. Download it from https://nodeterm.dev.
  Without it, the builder runs in a second Terminal window.
- Your own OpenRouter account with credits and a key (voices, transcription, music, reviewer models). You pay for
  it yourself; a 5-minute demo cost about $2.66. The key goes in `.env`, never in the chat.
- Spending limits: the credit limit on your OpenRouter key is your real ceiling, and setup will not pass without
  one, so set it to what you are willing to spend (for example $20). Each job also has its own cap (default $15),
  but it is a softer guard: it is checked before each paid call, so the last call can go a little over, and a
  call that reports no cost counts as $0. Claude usage is separate and comes from your Claude plan.
- A demo environment: a Cisco dCloud instant demo, a partner or Cisco lab, or your own sandbox with fictional
  data. Never a customer's tenant or production system. You sign in yourself, once, in a separate Chrome window
  Claude opens for the job; Claude looks around your environment in that same window. Claude never records
  sign-in screens on purpose. The recorder tries to spot sign-in pages and deletes a take that reaches one, but
  that check can miss an unusual sign-in page, so look at the contact sheets for any sign-in frame.
- Disk: a 5-minute job can use about 10 GB before cleanup.

## What leaves your Mac

- **Anthropic (Claude):** everything Claude reads while it works, including the product screens it explores, page
  text, screenshots, and the files in the job folder.
- **OpenRouter and the model companies behind it** (for example Google and OpenAI): the script text (for the
  voice), the narration audio (for word timing), and review frames and stills of the recorded product (for the
  model review rounds).
- **OpenAI (ChatGPT), only when an AI caller places calls** (`.claude/skills/record-demo/references/AI_CALLER.md`):
  the caller persona and everything said on the call, both sides.
- This is why the studio is for demo environments with fictional data only.

## How a job runs

1. **Interview** (5 minutes): product, audience, story, how far the demo may act, redaction, budget.
2. **Research and sign-in**: an agent quotes official sources; you sign in to the demo in the job's Chrome.
3. **Exploration and storyboard**: the builder explores the product, picks one story the data supports, and
   stops with a storyboard and full talk track for your approval.
4. **Build** (about 1 to 2 hours, longer when you take part live, for example placing calls; mostly unattended; glance at the builder window in case it asks to approve an
   unusual command): recording, voice auditions and takes, edit, render, two model
   review rounds, captions, and the player page. Approve commands that work inside the job's folder. Say no to
   anything that installs software, deletes files outside the job, or sends files somewhere new, and ask about it
   in the window where you started.
5. **Report**: where the video is, each claim with its source, spend, and what still needs a human decision.

Nothing here is brand, legal, or SME reviewed. Treat the output as an internal draft until you have that review.

## Folder map

| Path | What it is |
|---|---|
| `CLAUDE.md`, `.claude/` | Studio instructions, the `record-demo` skill and its references, agents, settings |
| `scripts/` | Setup, OpenRouter check, new job, job Chrome, Cisco source fetcher |
| `toolkit/job-template/` | The capture, voice, edit, redaction, mix, and render code every job copies |
| `examples/cloud-control-se-demo/` | A finished 5-minute demo: prompt, storyboard, script, claims, edit code |
| `jobs/` | Your jobs, one folder each. Never zip or share it: while a job runs it holds your signed-in browser profile, and it keeps raw, unblurred footage. To share the studio, share the GitHub link. |
| `.env` | Your OpenRouter key (created by setup; only you can read it) |
