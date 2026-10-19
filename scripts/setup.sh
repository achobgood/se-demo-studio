#!/bin/bash
# One-time studio setup and a health check you can rerun any time. Safe to run repeatedly.
# usage: scripts/setup.sh
cd "$(dirname "$0")/.."
ok=1
say() { printf '%-28s %s\n' "$1" "$2"; }
say "Studio version" "$(cat VERSION 2>/dev/null || echo unknown)"
[ "$(uname)" = "Darwin" ] && say "macOS" "ok" || { say "macOS" "MISSING: this studio is built and tested for macOS only"; ok=0; }
if command -v node >/dev/null; then v=$(node -p 'process.versions.node.split(".")[0]'); [ "$v" -ge 20 ] && say "Node.js" "ok ($(node --version))" || { say "Node.js" "TOO OLD: need 20 or newer (brew install node)"; ok=0; }; else say "Node.js" "MISSING: brew install node  (or https://nodejs.org)"; ok=0; fi
if command -v python3 >/dev/null; then say "Python 3" "ok ($(python3 --version 2>&1))"; else say "Python 3" "MISSING: xcode-select --install  (or brew install python)"; ok=0; fi
if command -v claude >/dev/null; then cv=$(claude --version 2>/dev/null | awk '{print $1}'); python3 -c "import sys; sys.exit(0 if tuple(map(int,'$cv'.split('.')[:3])) >= (2,1,300) else 1)" 2>/dev/null && say "Claude Code" "ok ($cv)" || say "Claude Code" "${cv:-unknown}: older than the tested 2.1.300; run claude update"; else say "Claude Code" "claude command not found; the studio is run from the claude command in Terminal"; fi
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; [ -x "$CH" ] || CH="$HOME$CH"
[ -x "$CH" ] && say "Google Chrome" "ok" || { say "Google Chrome" "MISSING: install from https://www.google.com/chrome"; ok=0; }
# Install when the tools are missing, and reinstall when toolkit/package-lock.json changed since the last install.
lockhash=$(shasum -a 256 toolkit/package-lock.json | awk '{print $1}')
if command -v node >/dev/null && { [ ! -d toolkit/node_modules/playwright-core ] || [ "$(cat toolkit/node_modules/.studio-lock-hash 2>/dev/null)" != "$lockhash" ]; }; then
  echo "Installing capture and render tools into toolkit/node_modules (about 400 MB)..."
  (cd toolkit && npm install --no-audit --no-fund --silent) && echo "$lockhash" > toolkit/node_modules/.studio-lock-hash || { say "toolkit install" "FAILED: run (cd toolkit && npm install) and read the error"; ok=0; }
fi
[ -x toolkit/node_modules/ffmpeg-static/ffmpeg ] && say "ffmpeg (bundled)" "ok" || { say "ffmpeg (bundled)" "MISSING: (cd toolkit && npm install)"; ok=0; }
[ -d toolkit/node_modules/playwright-core ] && say "playwright-core" "ok" || { say "playwright-core" "MISSING: (cd toolkit && npm install)"; ok=0; }
if [ ! -f .env ]; then cp .env.example .env; chmod 600 .env; fi
if grep -qE "^OPENROUTER_API_KEY=[\"']?sk-or-" .env 2>/dev/null; then
  scripts/check-openrouter.sh || ok=0
else
  say "OpenRouter key" "NOT SET: put your key in .env (open -e .env), see SETUP in the record-demo skill"; ok=0
fi
command -v pdftotext >/dev/null && say "pdftotext (optional)" "ok" || say "pdftotext (optional)" "not installed; PDF sources will not fetch (brew install poppler)"
[ -f "$HOME/Library/Application Support/node-terminal/canvas-control/nodeterm.sh" ] && say "NodeTerm" "ok" || say "NodeTerm" "not found (recommended: https://nodeterm.dev); without it the builder runs in a second Terminal window"
echo; if [ $ok = 1 ]; then echo "SETUP OK"; else echo "SETUP INCOMPLETE: fix the lines above, then rerun scripts/setup.sh"; exit 1; fi
