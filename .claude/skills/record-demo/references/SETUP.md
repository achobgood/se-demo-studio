# Setup

Run `scripts/setup.sh` from the studio root. It checks everything and installs the capture and render tools
into `toolkit/node_modules` on first run (about 400 MB; that install needs no admin rights). Rerun it any time;
it ends with "SETUP OK" or lists what to fix. Walk the person through each failing line below, one at a time, and
rerun. If they have no Homebrew, use the download links below instead of `brew`; on a company-managed Mac, the
Node.js, Python, or Chrome installers may need IT.

## Requirements

| Line in setup.sh output | What to do |
|---|---|
| macOS | This studio is built and tested on macOS only. |
| Node.js | `brew install node`, or the installer from https://nodejs.org (version 20 or newer). |
| Python 3 | `xcode-select --install` (includes Python 3), or `brew install python`. No extra Python packages are needed for the toolkit. |
| Claude Code | Update with `claude update`. The studio was tested on Claude Code 2.1.300. |
| Google Chrome | Install from https://www.google.com/chrome into Applications (the system one or the one in their home folder). Capture drives a separate Chrome window with its own profile, so their normal browsing is untouched. |
| toolkit install | `(cd toolkit && npm install)` and read any error. Behind a corporate proxy, ask IT for the proxy address and run `npm config set proxy <that address>`. |
| pdftotext (optional) | `brew install poppler`. Needed only when an official source is a PDF (a data sheet, for example); without it that source fails to fetch and the researcher uses another page. |
| AI caller (optional) | Only for demos where ChatGPT places a live call. Needs a Claude Pro, Max, Team, or Enterprise account (for Claude in Chrome), a ChatGPT account, and Webex Calling in the Webex desktop app. setup.sh only reports whether the BlackHole cables and the Webex app are present and never fails on it; when the interview chooses the AI caller, walk the person through references/AI_CALLER.md, "Setup" (about 10 minutes, once per Mac). Installing the cables needs the Mac password, which a company-managed Mac may not allow. |
| NodeTerm | Recommended; download from https://nodeterm.dev. Without it the builder runs in a second Terminal window (references/SUPERVISING.md). |

## OpenRouter

OpenRouter is one account that gives access to many AI models (voices, transcription, music, images, and
reviewer models) with one key and one bill. The demos use it for everything except Claude itself. Each person
uses their own account and pays for it personally. Claude usage is separate and comes from their Claude plan.

What it receives: the script text (voice), the narration audio (transcription), and review frames and stills of
the recorded product (reviewer models). This is one reason the studio is for demo environments with fictional
data only.

Walk them through this in order:

1. **Create an account** at https://openrouter.ai (Google or email sign-in).
2. **Add credits** at https://openrouter.ai/settings/credits. $10 to $20 covers several demos: the 5-minute Cloud
   Control demo spent $2.66, the 90-second ad $1.21.
3. **Create a key** at https://openrouter.ai/settings/keys. Name it `demo-builder` and **set a credit limit**
   on the key (for example $20) so a runaway job cannot overspend. Setup does not pass until the key has a limit.
4. **Save the key in the studio `.env` file, never in the chat.** Tell them to run `open -e .env` (it opens in
   TextEdit), paste the key after `OPENROUTER_API_KEY=` with no spaces or quotes, and save. The file is created by
   setup.sh with permissions only they can read. If they paste the key into the chat anyway, tell them to delete
   that key at https://openrouter.ai/settings/keys and create a new one.
5. **Verify** with `scripts/check-openrouter.sh`. It prints usage and limit, never the key. HTTP 401 means the key
   is wrong; "OUT OF CREDITS (402)" from a later job means the account balance is empty even when the key limit
   still has room.
6. **Model access.** If a call fails with a message about data policy or "no endpoints found", first pick another
   model from `python3 lib/models.py <kind>` (run inside a job folder; kinds are `speech`, `transcription`,
   `audio`, `image`, `text`). Only if no other model will do, they can open https://openrouter.ai/settings/privacy
   and allow the providers the error names. Tell them what that means first: those providers may then receive
   the job's script, audio, and frames, and depending on the provider, may keep or train on them.

Never read `.env` yourself (the studio settings deny it). The toolkit loads the key on its own.

## Claude Code

The studio's `.claude/settings.json` sets model `claude-opus-5-5` and effort `high` for every session opened in
this folder, including the builder session and subagents. If the session header shows another model, or
`/effort` shows another level, ask them to run `/model claude-opus-5-5` and `/effort high`. Personal settings can
override project settings, so check at the start of every job.

## Disk

A 5-minute job can reach 10 GB of raw capture and frames before cleanup. Check free space with `df -h .` and warn
them if less than 20 GB is free.
