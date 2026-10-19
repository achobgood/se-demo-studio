# Worked example: Cisco Cloud Control virtual SE demo (September 2026)

A finished 5-minute demo built with this method from the dCloud instant demo "AgenticOps with Cisco Cloud
Control". It follows one incident (SD-WAN and Meraki alerts across San Jose and Mexico City) from the Actions list,
through the Assistant and an AI Canvas Reasoning investigation, into ThousandEyes, and ends with a handoff. Spend:
$2.66 of OpenRouter over 58 calls. The video itself is not included (about 480 MB).

Read these for patterns. Do not reuse the narration.

| File | What to look at |
|---|---|
| `PROMPT.md` | The prompt this video was made with; the studio's builder template was built from it. One reference to an unrelated internal project was removed and the demo account number masked. It predates this studio: paths like `.scratch/...` and the "port 9333" and "packet-path-explainer/tools" references point to the original workspace. The current template is `.claude/skills/record-demo/references/BUILDER_PROMPT_TEMPLATE.md`. |
| `PRODUCT_NOTES.md` | Cloud Control claim rules and dCloud instant-demo facts from the September 2026 jobs. Read only for a Cloud Control job. |
| `DEMO_MAP.md` | What exploration found: every surface, the demo data, timings, which AI agents answered, and why the first incident was replaced. |
| `STORYBOARD.md` | Shot by shot: timing, what is clicked, the value point, the line spoken, and the source or flag. |
| `SCRIPT.md` | The script a human SE could run live from: clicks, typed questions, talk track, on-screen text, sources, live-run notes. |
| `CLAIMS.md` | The claim table and the flagged accuracy issues (F1 to F8) with fixes. |
| `BUILD_REPORT.md` | The builder's README: how it was made, cost by phase, review rounds and dispositions, evidence boundary, open decisions. |
| `speech.txt` | The exact text sent to the voice model, with respellings. |
| `code/take_example.js` | A full recorded take: navigation, typing, waiting on AI answers, speed-ramp marks. |
| `code/edit_example.py` | Mapping two takes onto the narration with four labeled speed ramps (the studio's `build/edit.py` has the same shape). |
| `code/scenes_example.js` | The full custom scene file, including 67 camera keys keyed to words and recorded clicks. The studio's `build/story.js` expresses the same things as data. |
| `code/segments_example.py` | How segments and pauses were defined before `script/segments.json` existed. |

The demo account's generic dCloud name is shown as "Sec Ops User NN".

## What a viewer asked afterwards, and why

A colleague asked why the demo "didn't pick up on the UTD fault causing the cascading issues". The recorded
material shows three things: Cloud Control's own analysis linked the UTD (the SD-WAN routers' built-in security
engine) alerts to the San Jose control-plane event, but as an effect rather than the cause; the Mexico City
devices were likely taken down by the demo tenant's scheduled fault-injection workflows, so they were probably not
downstream of UTD; and the builder prompt scoped the story to Mexico City, so the talk track handed San Jose to
"the SD-WAN team" and never asked. Lesson L3 in LESSONS_LEARNED.md comes from this: decide what the demo will not
investigate, and say so.

## How the 90-second ad differed

The same method made a 90-second customer ad from the same demo ($1.21). If someone asks for an ad instead of a
walkthrough, change these in the builder prompt: an abstract motion-graphics hook (never an imitation of product
UI), a reveal of the product name and one idea, one surface per beat on real footage, a value statement with its
qualifiers, and a close. The voice was announcer style (Gemini TTS voice Charon), synthesized whooshes and a riser
were allowed, and the review rounds were the same.
