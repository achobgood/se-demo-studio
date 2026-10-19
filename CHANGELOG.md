# Changelog

What changed in each studio version, newest first. Your version is in the `VERSION` file and on the first line
that `scripts/setup.sh` prints.

## 0.2.0 (unreleased)

- Entries added at release.

## 0.1.0 (2026-10-19)

- First release: say "help me record a demo" and Claude interviews you, researches the product from official
  sources, explores your signed-in demo in Chrome, and asks you to approve a storyboard and talk track before it
  records.
- The finished job is a narrated video with an AI voice, captions, a player page, and a report of each claim with
  its source and what it cost.
- `scripts/setup.sh` checks your Mac, installs the capture and render tools, and checks your OpenRouter key and
  its spending limit.
- AI caller: for demos that need a live phone call into the product, ChatGPT voice plays the caller, with a guided
  one-time setup the first time you use it.
- Includes a finished 5-minute Cisco Cloud Control demo in `examples/` to show what a job produces.
