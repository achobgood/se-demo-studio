# Motion segments

Read this file only when a job needs it: when INTERVIEW.md lists steps the environment cannot show, when you judge
that an abstract scene would clearly make the demo clearer, or when the owner gave a style reference (then read
"Style guide"). Everything in the builder prompt still applies; this file adds the rules that matter only for motion
segments. Paths are relative to the job folder unless they start with the studio root.

**Status: a method under test.** The Think half and the numbers in this file come from outside reading on motion
design (articles and a skill repository, read in November 2026, L106) and were applied in one job only, whose first
result still read as grey boxes (L104). A blind test on another job reached a good concept, but only after two
box-and-arrow drafts (L107). Treat everything here except the firm rules as a hypothesis until a film built this way
is approved, and write down where it helped or failed you in the job's notes.

**Firm, and everything else a default.** Four things are firm and are marked (firm) where they appear: honesty
(the Illustrative line, example values marked, nothing a viewer could take for a product screen), legibility (every
line a viewer must read can be read, at its size and for its time on screen), determinism (every frame from its
time alone), and read and relate (every drawn object can be named by a stranger with no label at its smallest size
on screen, and stands for something real in that demo; L108). Everything else (counts, sizes, durations, kinds of shot or transition) is a starting point. Each
video's plan can be its own: a segment may have no pull-back or several, one transition kind or many, one long shot
or a quick run of them. When you depart from a default, write what you chose and why in `research/STYLE_GUIDE.md`.

The work has two halves. **Think** decides what the viewer should see happen (this file); **Build** makes it (the
engine reference, `STAGE_ENGINE.md` in this folder). The rules about easing and type are quality control, not where
an idea comes from.

## Order of work

1. Find the candidate moments (When to use motion at all, below).
2. For each segment, answer the concept card (Think 1) and run the picture check.
3. Sample the palette from an exploration capture (`capture/explore/`) into `build/sketch.js`, or mark it provisional
   (Style guide).
4. Sketch each segment's signature moment, render it with words on and words off, and have the `blind-reader` agent
   say what happened (Think 2). This needs no footage, and no voice take (`--sketch`).
5. Storyboard: for each segment send the concept card, the signature stills, and a one-line outline per remaining shot
   (Storyboard, below). Wait for approval.
6. After approval and the takes: resample the palette from the clips into `story.js` (Style guide), write the shot
   table, build in `build/stages.js`.
7. Critique: the firm checks, a blind fresh reviewer, the frozen-time list (Critique), then fix.

## When to use motion at all

- Use a motion segment only where the environment cannot show a step (L92), or where an abstract scene clearly makes
  the demo clearer than a real screen can. A demo that can show everything on real screens uses none.
- Never use one as decoration, to fill time, or to make the video look busier. Real product UI stays the backbone.
- The title, agenda card, value recap, and close are cards, not motion segments; the builder prompt covers them.
  They may reuse a segment's concept. A card built on a stage takes `card: true` and no Illustrative line unless it
  shows an illustration.
- A segment the interview did not ask for is named in STORYBOARD_READY.md with the reason it helps, so the owner
  approves it at the storyboard.
- The job's own PROMPT.md and INTERVIEW.md win over this file, except on the four firm rules. If they limit motion
  (for example to the cards only), you may still propose a segment at the storyboard with its reason; it is built only
  if the owner approves it (owner decision, 2026-11-17).

Where a segment can earn its place (read the script for these; each is a candidate, never a requirement):
- a step the environment cannot show at all (L92): the other side of a call, a system outside the lab, something that
  happens later;
- a long hold on a static real screen while the voice explains an idea the screen does not show; the stage carries the
  idea, then the film cuts back to the screen as proof;
- the demo's central idea, which no single screen shows, often cause and effect between two products or two moments.
The test for each: the concept card's story sentence (Think 1) names something the real screen cannot show. If it
does not, keep the real screen and push in on it instead. Not a candidate: a step a real screen shows well, a
transition between chapters, a gap you want to fill.

## Engine choice (owner decision, 2026-11-17)

Motion segments use the studio's own deterministic engine (`build/engine.js`, `build/motion.js`, `build/render.js`).
Do not add Remotion: its license requires a paid Company License for any company of four or more people. Do not add
HyperFrames or GSAP without the owner's decision: GSAP's free license excludes tools that build visual animations
without code in competition with Webflow, which needs a legal reading for this studio. Revisit only if a scene truly
needs something the engine cannot draw (for example Lottie or 3D), and say so at the storyboard.

## What a segment may show

When the owner decides some steps cannot be shown in the environment, bridge each with an illustrative scene and
on-screen text labeled illustrative, then cut to the real screen that backs it up (L92).

Show the story with flat line drawings of real-world things (devices, doors, queues, clocks, maps, documents),
simple places named in plain text, real documented field names, and example values.

Honesty (firm):
- No mock product screens, no logos, no timing claims.
- Never animate over real UI as if the product acted: the traveller never appears to come out of the recorded screen.
- The Illustrative line is on screen for the whole segment (the stage engine adds it if you forget).
- Example values are marked: by the Illustrative line ("Illustrative · example values") while it is on screen and the
  value is not cropped away from it by the camera, otherwise on the value itself.
- Colour and type may match the product (they should, Style guide). Layout, window chrome, tables, buttons, menus,
  and navigation never do. Test: crop the Illustrative line off a middle frame and ask a fresh reader whether it is a
  screenshot of a product. If yes, it fails.
- Every picture of what the product does, or would have done, has a source, not just the text under it (Think 3).
- People may appear as props: faceless line figures and hands (a caller holding a phone, a hand placing a parcel),
  with no face or features and never a likeness of a real person (owner decision, 2026-11-17). Anything they hold
  that has a screen shows no product UI.

On-screen text in a segment follows the builder prompt's copy rules: no em dashes, no mirrored pairs (L98), and it
does not repeat the narration.

## Think 1: the concept card

A segment built only from rules comes out as grey boxes, lines, and a token sliding between them: correct, and
forgettable (L104). Before any shot list, answer these five questions in `research/STYLE_GUIDE.md` for each segment
(the questions are the point; the answers can take any shape):

1. **Story.** One cause-and-effect sentence with a concrete subject. Not "logistics updates", but "one parcel already
   on its way is sent to a new address without stopping."
2. **Verb.** The one change in the world the segment exists to show (reroute, merge, restore, notify, revoke, sync).
   If you find two, it is two segments, or one of them is a detail.
3. **Picture of the verb.** If this happened somewhere physical and you could watch it, what would you see? Name real
   objects whose behaviour is the explanation, and what each does at the moment of change. If a shape needs a label to
   say what it is, it is the wrong shape; labels name parts, they never explain them.
   Then a prop line for every object you will draw (read and relate, firm): the real thing in this demo it stands for
   (a setting on the real screen, an event in the real story or call, a line the product actually holds), the
   public-sign convention it follows (for example a bicycle as on a bike-lane sign: two wheels, frame, seat,
   handlebar), and its smallest size on screen (planned now; Critique re-checks it at the size the film shows). An
   object with nothing real to stand for is cut, not kept as filler. An object with no public sign (equipment most
   strangers never see) passes when a stranger names its kind ("a Wi-Fi box on the ceiling"), drawn with its most
   familiar feature; a part label may then name it, never stand in for a drawing that does not read.
4. **Traveller.** The one thing that moves through every step and visibly changes state (one real request, one call,
   one alert, one record). Say what it looks like at each step, and how its last state answers its first.
5. **Honesty line.** What the sources say actually happens, and where the picture must stop.

When question 3 does not come at once:
- List the nouns of the story that exist in the world (devices, people, places, messages), not the product's boxes.
- Ask what a person standing next to them would notice at the moment of change: something closes, opens, moves,
  splits, joins, fills, empties, lights, gets a mark, gets rewritten.
- Write two or three pictures, not one. The first idea is usually the boxes; keep the one a stranger would
  understand with the sound off, and drop any idea that needs a legend.
- Check it against the narration: the change lands on the word that names it.

One derivation, to show the method (a topic no job here uses; the method transfers, the picture does not):
- Story: one parcel already on its way is sent to a new address without stopping. Verb: reroute.
- Rejected: three boxes, "Orders", "Carrier", "Depot", with an arrow redrawn between them. Labelled boxes; a stranger
  with the words off sees boxes.
- Rejected: a truck icon sliding along a line that bends. Something moves, but nothing on it changes, and the change
  itself (the address) is invisible.
- Kept: the parcel on a sorting belt; as it travels its address label is rewritten (the old line struck through,
  the new one written in), and the switch ahead turns so it drops into a different chute. The change is visible on
  the traveller and in the world at the same moment; with the words off, a stranger says "the box was sent somewhere
  else". Honesty line: the label and the chute, no delivery time.

Kinds of change worth a picture (situations, not pictures; find your own picture for each):
- one change reaching many places;
- many things becoming one;
- going back to an earlier state;
- one thing refused while everything around it stays the same;
- something held until someone decides;
- something that did not happen (Think 3).

Things that look like a concept but are not: a row of labelled boxes joined by arrows, a pipeline diagram, a
dashboard that fills up, icons in circles, three cards in a row, a title over a dimmed screenshot, a token sliding
along a line, and a sequence of unrelated reveals, however well each is animated (it reads as a slideshow; one object
must carry the segment).

**Picture check, before Think 2.** Name the item in that list your picture is closest to, and say in one sentence why
it is not that. If you cannot, answer question 3 again.

## Think 2: the signature moment first

Each segment has one signature moment: the picture of its verb. Build it before anything else, alone, usually before
any voice take exists:

1. Write it as numbered beats: what moves, from where to where, on which cue word of the script, what text appears.
2. Build it in `build/sketch.js` (the file explains how; the helpers are in `STAGE_ENGINE.md`), one stage per segment
   at its own times, and render each segment into its own folders: stills before, at, and after the change, once
   with words and once without, plus a strip across the change. For a segment numbered 3:
   `node build/render.js stills review/sig_s3 2 4.5 7 --sketch`,
   `node build/render.js stills review/blind/s3_sig 2 4.5 7 --sketch --words-off`, and
   `node build/render.js strip review/sig_s3 4.5 --sketch`.
   Before the voice take, times are literal seconds. When the take already exists (a remake, or a segment added
   late), write them as cues, `W('word', 'segment')`, `S0()` and `S1()`: `--sketch` then loads `build/cues.json` and
   prints `sketch: word timings from the voice take`, so nothing needs converting later. Without a take, `W()` stops
   with `no voice take yet: use literal times in the sketch`.
   `--words-off` hides every word in `#stage` (stages, cards, chips, words drawn on an object, anything added later),
   keeps every shape, and prints `WORDS LEFT: <text> at <t>` for any text that still shows. A WORDS LEFT line means
   the words-off stills are not blind yet: fix the leak before a reader sees them. Words inside images (footage,
   screenshots) and canvas drawings are pixels, not text, and are neither hidden nor reported.
3. Give the words-off stills to the `blind-reader` agent (Agent tool, `subagent_type: blind-reader`). Its brief holds
   only the image paths (files or a folder), an answer path such as `review/blind/s3_sig.md`, and a neutral label
   ("segment 3", never the segment's name or verb; a folder name reaches the reader too, hence `review/blind/s3_sig`).
   It asks the one question, "In one sentence, what happened between the first and the last frame?", writes the
   sentence and a confidence line to the answer file, and opens nothing but images. It passes when the sentence has
   the story's subject and verb (synonyms count). A picture that only passes with its words on fails. If it fails,
   change the picture, not the labels. Then send the same reader (SendMessage) the words-on stills and ask the Words
   on question (does any word contradict the picture or do the picture's job); it adds that section to the same file.
   Read and relate (firm): for each drawn object, crop it out of a words-off still taken where it is smallest on
   screen, at that size and not enlarged
   (`../../toolkit/node_modules/ffmpeg-static/ffmpeg -v error -i <still> -vf crop=w:h:x:y review/blind/s3_obj/obj_1.jpg`,
   numbered files that name no object). Give all of a segment's crops to one new reader, one that has not seen the
   segment's frames, in one reading (up to 20 images; another new reader only for more, or after a redraw), and ask
   only the Object question ("What is this object?"), answered per image. A reader who names an object wrongly, or
   says it could be something else, has found a failed drawing: at least P1, never polish, and it blocks the final
   like every firm check. Redraw it from its prop line, or cut it, and send only the redrawn crops to a new reader.
   The builder always runs the reader. A brief that forbids research agents does not forbid it. If a brief forbids
   all subagents, say so in STORYBOARD_READY.md and ask the supervisor to run it.
4. Send the concept card, the picture check, both sets of stills, and the reader's answer file to the storyboard.

Then build the rest of the segment to lead into and out of it, held to its standard.

## Think 3: shots, not a wallboard

A wallboard is the whole diagram on screen at once, filling up while nothing else changes. Shots are the opposite:
one idea at a time, framed so the viewer sees it. Defaults, to be judged against the concept:
- A segment is usually a sequence of shots with one idea each; ask of each shot "what changes?". (The one film built
  this way ran about 5 to 8 a minute.)
- Let the main object of a shot dominate the frame (around 40% of its width or height is the starting point). A small
  object in an empty frame rarely works: push in, crop, or give it a world.
- Parts already explained dim (to about 35%) or leave the frame with the camera; they do not pile up.
- Pull back when seeing the whole helps, often at a segment's end so its last frame reads as a finished picture.
  Zooming in and straight back out reads as indecision.
- When segments show the same places, one world across the film can help the viewer build a map; decide it from the
  concepts, not by default. One stage may then hold several segments (`sections` names each on the shot sheet), and
  merging them loses nothing.
- Where one segment's stage gives way to the next, the transition is a choice the shot table explains: what does it
  mean that this place becomes that one? A cut, a push, or one written for the concept (a dive into an object of the
  first world that becomes the second; the traveller handed over where it stands, so the eye follows one thing
  across). The engine builds in only `cut` and `push` on purpose, so films do not all move the same way
  (STAGE_ENGINE.md, One stage to the next).
- Ask of every stretch: is anything dead for this concept? A small event between cue words (something acknowledges,
  something fills) can carry a hold; a single long shot can be right if something in it is changing.
- Legibility (firm): a line meant to be read stays long enough to read and does not move while it is read. Starting
  point: 0.5 s plus 0.3 s a word, longer for a segment's last line. Keep the words few (around 12 on screen is the
  starting point): cut words, never shrink type.
- Every action visibly produces a result: a check leaves a mark, a request produces a state, a decision opens or
  closes something. Two ways to show it: the result's outline appears first and then fills in; or the source stays
  recognisable while its parts lift out of it into the result.
- To show that something did not happen, show the thing that would have happened, held still or unlit, a path drawn
  faint and never travelled, or an outline of the state it would have reached. Add at most one short line naming it,
  backed by a source. Never stamp a red cross on anything. A faint copy left where something stood (`ghosts`,
  `leave`, STAGE_ENGINE.md) is one way to show what was here; nothing asks a segment to leave one.
- Write the shot table after the storyboard is approved: `time | cue word | camera | what moves | on-screen words |
  source (or "no claim: camera only") | what survives the cut`. The source column covers pictures, not only text: a
  station that reacts, a field that fills, an outline of what would have happened each show product behaviour. Then
  ask: which beats are filler, and does the order match how the real product works?

## Building them

The engines (stages and the simple engine), their helpers and kinds, camera keys, text sizes, flags, palette
mechanics, motion curves, springs, swaps, transitions, camera scaling, sound, and render commands are in
`STAGE_ENGINE.md` (same folder). Read it when you sketch the signature moment (Think 2) and again before you build
(Order of work, step 6). The firm rules and the Critique here apply to everything built with it.

## Style guide

When the job has motion segments or the owner gave a style reference, write `research/STYLE_GUIDE.md` before
building them: the concept cards, palette (hex), type (family, weight, size), shot lengths, transitions, camera moves,
and how text enters and exits. The reference is the product's own captured UI unless the owner supplied one. Write
every choice as a number, never an adjective: a hex, a size in px, a duration in seconds.

Sample the palette from the product so stages and footage read as one piece; the command, which points to take
each colour from, and what to do with no footage yet are in `STAGE_ENGINE.md`, Palette.

When the owner supplied a reference (named in PROMPT.md, Visual style), read it for what it changes in technique,
style, or process, not only whether its topic matches (L93). For a video, extract one frame every 0.5 seconds with
the bundled ffmpeg and study them before writing the guide:
`mkdir -p research/reference/frames && ../../toolkit/node_modules/ffmpeg-static/ffmpeg -i research/reference/<file> -vf "fps=2,scale=960:-2" -q:v 3 research/reference/frames/%04d.jpg`
For a web link, download it with:
`yt-dlp -f "bv*[height<=1080]/b" -o "research/reference/ref.%(ext)s" "<the owner's link>"`
This yt-dlp command has not been tested yet. yt-dlp is optional (`brew install yt-dlp`): if it is missing or the
command fails, ask the owner for a downloaded file or screenshots, which work without it.
Download only the link the owner gave, and use it as a reference only: none of it appears in the video.

Take the reference's grammar (pacing, type, color, how things move), never its content, logos, or characters. A font
the guide calls for can be used only after you add it to `build/fonts/` with a license that allows bundling it,
because renders run offline; otherwise use the closest bundled face and say so in the guide.

## Look

Defaults (change any in the style guide, with a reason), except where marked firm:
- A solid ground sampled from the product. No drifting grid, blurred colour glows, vignette, gradient, glass, or neon;
  never a dark navy void with small things floating in it.
- One accent colour per segment, and it belongs to the traveller (its border, fill, and the pulse on a connector).
  Green and red only for outcome states. Colour alone does not say "done", and a product's status name may not
  either. For each status name on a stage, ask: read cold by a stranger, does this word say the state the picture
  shows? Words like `needs_*`, `pending`, `*_required`, `queued` read as unfinished. If the picture shows a finished
  state, how will the viewer know: the plain meaning beside the name (`needs_bind · binding applied`), the narration
  saying it on the same beat, or something else the concept suggests?
- Drawings take the `draw` colour (or `line`), and stage.js warns when it is under 3:1 on the ground. Answering the
  warning is a choice about which object carries the shot and which may stay quiet (STAGE_ENGINE.md, Palette).
- Type: legibility (firm) means every line meant to be read can be read; 28 px on screen at the zoom it is read at is
  the starting floor. Titles 4 to 9% of the frame height (64 px for segment titles). Monospace only for literal code,
  field names, and status names, never for labels or kickers. No kicker above a headline; no numbered labels.
- Labels sit on the part they name, with a leader line if needed. No legends, no pills for labels.
- The only corner text on a stage is the Illustrative line (bottom left, firm) and the evidence line (bottom right).
  `STORY.tags` chips may also show at top right; keep them clear of the title. stage.js measures these once the fonts
  load and prints the stage, the time window and the sizes when the two corner lines are on screen together less than
  56 px apart (they then read as one line) or overlap, and when a title runs under a chip. The fix is a writing or
  timing choice: shorten either line; move the evidence onto the object it backs for that shot; start the evidence
  after a long Illustrative line changes; split the claim across two evidence lines in sequence; or, for a title,
  shorten or break it, or time the chip after it.
- Boxes: 2 px border, radius 18 px, no shadow. Margins 96 px left and right; keep world content out of the bottom
  110 px, where the two lines sit on a ground-coloured backing, and out of the top 170 px while a title is up.
- Not every element enters the same way; no centered title on a gradient, no frame borders, no particle bursts.

## Determinism (firm)

`build/motion.js`, `build/stage.js`, `build/stages.js`, and `build/sketch.js` set every frame from its time alone: no
randomness, clock reads, timers, `requestAnimationFrame`, or CSS transitions or animations. Split text into spans once
at build, then change only opacity, transform, and filter on them, and keep all translation inside one `transform`.
Hide an element with `display: none`, never `visibility: hidden`: a child set visible would still show, and the frame
would depend on which frame was rendered before (the stage helpers do this for you). Ramp anything that switches on or
off, so a seek never lands on a one-frame pop. A position that is a function of t (STAGE_ENGINE.md) must depend on t
alone. Run `python3 lib/lint_timeline.py` (no warnings) and `node build/render.js same review/same <times>` with two
or three times inside stages. `same` compares pixels and the page state, with three verdicts:
- SAME passes (exit 0). If it adds `the page state differs where no pixel shows it`, look: that element can show at
  another time.
- RASTER NOISE passes (exit 0): the page state was identical and the few changed pixels all sit on an edge, an
  antialiasing difference. Look at the `_noise.png` crop it names, then move on. It is intermittent: one run can say
  SAME and the next RASTER NOISE at the same time.
- DIFFERENT (exit 1) names the element and property that changed. A state difference inside a stage is a bug to fix
  before the rough cut (something reads a counter, the clock, or the previous frame). A DIFFERENT with identical
  state means something outside the page state changed (an image still decoding, a canvas, an iframe).
Check a few frames on either side of every push and every join for a single black or empty frame.

## Storyboard

Add `research/STYLE_GUIDE.md` to STORYBOARD_READY.md. For each motion segment, put first: the concept card and its
picture check (Think 1); the signature moment's stills, with and without words, and the blind reader's answer file
(Think 2); and one line per remaining shot. Write the full shot table (Think 3) after the owner approves; if the owner
rejects the concept, go back to Think 1, not to the shot list.

## Critique

In each round of the builder prompt's Review, between the rough cut and the final, also critique every motion
segment, as a harsh motion director rather than its author. Render `node build/render.js motionsheet review/motion`,
a strip at each swap and fast move (`node build/render.js strip review/strip <t>`), the `events` frames below, and
one full-size still per shot (`node build/render.js stills review/stills <t>`), with and without words
(`--words-off`), and add them to the review package.

The firm checks first; any failure blocks the final:
- **Honesty**: the Illustrative line is visible for the whole segment; example values are marked; with the Illustrative
  line cropped off, a fresh reader does not take a middle frame for a product screenshot; every picture of product
  behaviour has a source in the shot table, and no frame shows more than the concept card's honesty line allows.
- **Legibility**: a fresh reader reads every line aloud from a full-size still within the time it is on screen. Ask
  for three misses by name: text overlapping during a swap, a state label that contradicts the value beside it, and a
  status name a stranger reads as the opposite state.
- **Determinism**: `lib/lint_timeline.py` and `render.js same` are clean inside every stage.
- **Read and relate**: every drawn object has a prop line and passed its Object reading (Think 2, step 3) as drawn
  now, and no reader note in any pass says an object could be something else. A misread object is a failed drawing,
  ranked at least P1 and never polish; redraw or cut it before the final. Log every reader note with its disposition
  in the README.

Then the concept, judged blind by the `blind-reader` agent, with no concept card and none of your notes. One reading
takes at most 20 images (above 20 the model shrinks every image, so the reader refuses the 21st and lists the rest as
not opened); a new question set that needs more images is a new reader.
- Frames: `node build/render.js events review/blind/s3_story --stage '<stage name>' --words-off` renders a frame
  0.2 s before, at, and 0.2 s after every scheduled change on that stage (moves, turns, slides, morphs, reactions,
  camera keys, line changes) and one every 0.5 s between, so the count follows how much happens, not how long the
  segment is. Sheets for a blind reader need `--blind`, which `--words-off` turns on: titles and cell labels then
  show times only and the sheets are named `sheet_01.jpg`, `sheet_02.jpg`, ..., so nothing on a sheet names the
  segment, shot or event (the console line tells you which stage and shot each sheet is). Without it the sheets name
  them: those are for you. Every contact sheet render.js makes stays at or under 2,576 px on its long edge. Use a
  fresh, neutrally named folder per run.
- Story pass: one reading per segment, of those sheets in order. A sheet that catches the screen share at a push in
  or out carries the product's words as pixels, which words-off cannot hide: leave it out, or expect a Not blind line.
  Ask its question, then Shot by shot (what happens, how much of the frame is empty).
- Event pass: the before, at, and after frames of each fast event (a turn, a 0.3 s reaction, a swap), as stills or a
  blind strip (`node build/render.js strip review/blind/s3_ev <t> --blind`).
- Only after its answer is written, paste the concept card into a message to the same reader (it never opens a card
  file) and ask what is missing.
- For the Legibility check, a separate reading of full-size words-on stills, one per shot.

The answer file lists what the reader opened, what it refused, what told it the story ("Not blind": words in the
brief, folder names, sheet titles or cell labels), and any image shrunk. A Not blind line means the reading was led:
fix the brief or the folder and run a new reader. **A P0**: with the words off, the reader cannot say what happened
(the story's subject and verb). Put the reader's sentence beside the concept card's story sentence in the review
package; that comparison replaces any score.

Then ask yourself, on each shot's middle frame:
- Describe it in one sentence as a stranger would, naming every object. An object you would have to explain ("those
  boxes are the webhook") is a problem.
- Do the middle frames in order tell the story, each causing the next?
- Would anyone remember this frame? A segment that passes every check and is forgettable is not finished (L105):
  spend the time left on the signature moment, not on more rules.

Look at the still stretches instead of guessing: `python3 lib/frozen_time.py out/<video>.mp4 --range <from>-<to> ...`,
one range per motion segment, lists the stretches inside them where almost nothing changes (a moving 20 px dot or one
word appearing counts as change). It is a list to look at, never a score or a target. For scale, in the Splunk and
Cloud Control job the decision segment was still for 22 s of every 30 in the original and 18 s in the forgettable
first redo; both read as slides. For each listed stretch ask whether something should be changing there for this
concept; a line being read holds still on purpose.

Write each problem as `t=… · where · problem → exact change · what stays`, ranked P0 (unreadable, wrong, broken,
dishonest, or the words-off reader could not say what happened), P1 (weakens the film: a dead stretch, a soft payoff,
a seam that jumps; an object a reader misnamed, which also blocks the final), P2 (polish). After your fixes, a new reviewer marks each earlier note FIXED, PARTLY, or STILL
PRESENT.

## What did not work (do not repeat without a new idea)

- **Rules with no concept** (the first Splunk and Cloud Control redo): every rule here was met, and the result read as
  grey boxes, lines, and a sliding pill (L104).
- **Motion blur by averaging subframes** (4 or 8 renders per frame spread over half a frame's time): on a fast push
  the frame moves about 200 px a frame, so 4 subframes show four distinct copies and 8 show eight, which reads as
  strobing, not blur, at 5 to 12 times the render time. Slow the move instead.
- **A light ground for a dark product**: it renders cleanly, but every push becomes a brightness jump between the dark
  product and a light page, and the stage stops looking like the product's world. Match the product's own ground.
