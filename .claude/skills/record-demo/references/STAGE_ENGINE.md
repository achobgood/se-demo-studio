# Stage engine

The build reference for motion segments: the engines, their helpers and kinds, camera keys, sizes, flags, palette
mechanics, and render commands. Read `MOTION.md` (same folder) first: it decides what the viewer should see happen,
and its firm rules (honesty, legibility, determinism, read and relate) and Critique apply to everything built here. Paths are relative
to the job folder unless they start with the studio root. This text moved here from MOTION.md.

## Building them

There are two engines. Use **stages** for any segment with a concept card: a camera on a world, a traveller that
changes shape, drawn objects. The **simple engine** (`STORY.motion`) predates MOTION.md; see its note below.

### Stages

Files in `build/`: `stage.js` (the engine; do not edit per job), `stages.js` (this job's segments, with narration
times), `sketch.js` and `sketch.html` (sketches rendered with `--sketch`), and `stage_demo.js` (a story-free demo of
every helper: `node build/render.js stills review/demo 2 5 7 10 --sketch`). `stage.js` needs `springAt` and `track`
from the template's `engine.js`. A job that copies `stage.js` alone gets one console line naming both and
`engine.js`, and no stage is drawn until the template's `engine.js` is copied too.

Sketches: before the voice take, use literal seconds. Once `build/cues.json` exists, `render.js --sketch` hands it to
the page and prints `sketch: word timings from the voice take`, so `W()`, `S0()` and `S1()` work in `sketch.js`;
without it, it prints `sketch: no voice take yet` and `W()` stops with `no voice take yet: use literal times in the
sketch`. `sketch.js` loads before `engine.js`: define `STORY` and functions at the top, and call engine helpers only
inside `sketch()`. `CUES.total` in `sketch.js` sets the sketch's length when there is no take.

When a job has stages, the template's background (gradient, grid, glows, vignette) gives way to the stage ground for
the whole film, so the screen share and the stages sit on one ground. The template's title, agenda, and close cards
keep their own look (kicker, numbered rows), with their text (and the screen share's chapter chips) recoloured from
the palette (ink, ink2, accent) so they stay readable on a light ground; to bring them into the stage look, build them as stages with `card: true`.
The template card still draws underneath such a stage, which covers it only while the stage runs: make the stage
span the card's whole time.

**Adopting stages in an older job.** A job made before stages has older copies of the template files, and its
`comp.html` and `scenes.js` usually carry the job's own card edits. Do not copy template files over them. From the
studio root run `scripts/upgrade-job.sh <slug> build/stage.js build/comp.html build/scenes.js`. It is a dry run: it
shows the base it used, what each file would become, and any conflict. It also brings what those files need
(`build/engine.js` for `stage.js`'s `springAt` and `track`, `build/stages.js` for `comp.html`), as listed in
`toolkit/job-template/TEMPLATE_FILES.json`. A job made before the base was recorded gets a guessed base: check it
against the four candidates printed, then confirm it with `--apply --base <tag>`. `--apply` keeps the job's
originals in `review/upgrade/<date_time>/before/`. A conflict is left in the file between `<<<<<<< job` and
`>>>>>>> template`, with the base between `||||||| base` and `=======`. Keep the job's edits, add the template's
change, delete the markers, and run `scripts/upgrade-job.sh <slug> --check` until it says ok. If a page error says a
function is not defined after copying a file by hand, `--check` names the file that is missing it.
`scripts/new-job.sh` records the template a job started from (`template_version` and `template_commit` in
`job.json`, and copies of any uncommitted template files in `review/upgrade/base/`); leave them, they are what
`scripts/upgrade-job.sh` merges from.

Times come from the narration: `W('word', 'segment', n)` is the start of the n-th word in that segment that starts
with `word` (`n` picks between repeats; `W(..., ..., n, true)` is its end), `S0('segment')` and `S1('segment')` are a
segment's start and end, and `TOTAL` is the film's length. How keys behave, by helper:
- camera keys, and art parts' `turn` and `shift`: **arrival** times; the move starts earlier and lands on the key.
- a part's or element's fade keys (`dim`, art `parts` levels): a 0.3 s ramp that starts at the key.
- the traveller's `seq`: its morph starts at the key; its `moves` are `[t0, t1, x, y]`, start and end both given.
- With `pushIn`, the first 0.9 s of the stage is the push; with `pushOut`, the last 0.6 s. Content timed there is
  half off screen.

`new Stage({...})`, one segment:
- `name` (shown on the shot sheet; defaults to "Stage n"), `from`, `to`.
- `pushIn`, `pushOut`: the screen share leaves left as the stage arrives from the right, and the reverse on the way out.
  A stage without `pushOut` ends at `to` and the screen share is back at once.
- `cam: [[t, x, y, zoom], ...]` in world pixels (zoom 1 is one world pixel per screen pixel); defaults to the centre
  at zoom 1. Each move starts 0.9 to 1.6 s before its key (longer for longer moves), eases both ways, and zooms in log
  space. Put a key just before the line the viewer must read. Keys must be in time order (checked at load).
- `titles: [[from, to, text]]`: 64 px, fixed on screen (the camera never scales it), per-word reveal, word-by-word
  blur-out after `to` (0.2 s plus 0.04 s a word: start the next title after that). A `|` with a space on each side is
  a line break. World content passing under the title during a camera move is hard to read: keep the top 170 px clear
  while a title is up.
- `label: [[t, text], ...]`: the Illustrative line, bottom left (firm). It defaults to `[[from, STORY.motionLabel or
  'Illustrative']]`, and the engine reports a label that starts after `from`. `evid: [[t, text], ...]`: the evidence
  line, bottom right. `card: true` (a title or agenda built on a stage) skips the label. Once the fonts load, stage.js
  measures both lines and prints the stage, the time window and both widths when they are on screen together less
  than 56 px apart or overlap; it also prints when a title runs under a `STORY.tags` chip. It changes nothing (fixes:
  MOTION.md, Look).
- `shots: [[t, name], ...]`: one tile each, just after it starts and at its middle, on the shot sheet
  (`node build/render.js motionsheet review/motion`).
- `sections: [[t, name], ...]`: one stage that holds several segments on purpose. The shot sheet gives each section
  its own sheet, named `stage · section`, and `render.js events` lists where each starts. Sections go in time order
  inside the stage; stage.js says so when they do not, or when the first starts after `from` (the time before it then
  has no section name).
- `join: { stage, how, dur, ease }`: this stage takes over from an earlier one (One stage to the next, below).

Things on the world (positions in world pixels):
- `art(st, {x, y, w, h, svg, at, dur, stagger, react, dim, out, parts, name, z, front, frontZ, leave, follow})`: a
  line drawing, SVG markup in a `w` by `h`
  viewBox, whose strokes draw themselves on (`dur` 0.8 s each, `stagger` 0.06 s apart), fills fading in after. This is
  where the concept's objects come from: devices, doors, clocks, maps, figures. Palette names such as `var(--st-ok)`
  in the markup become the job's colours. A shape with its own `stroke-dasharray` keeps its dashes and fades in
  instead of drawing on; a stroke or width set on the shape or a parent group is kept. `parts` animates children by
  `id`: `{id: [[t, level], ...]}` fades one (from full; give `{o: [...], start: 0}` for a part that appears later);
  `{id: {o, start, turn: [[t, deg]], shift: [[t, dx, dy]], pivot: [x, y], dur}}` also turns it about a pivot (in the
  drawing's coordinates) or slides it, keeping any transform it already had. `react: [t]` makes it grow 3% and settle.
  `name` names it in the event list. `leave: [[t, where, { level, out, z }], ...]` leaves a copy of the drawing as it
  is at `t` (parts posed at `t`, every stroke drawn), in the line colour, behind it, at `'here'` (default, its own x,
  y) or `[x, y]`; it fades in over 0.5 s to `level` (0.5), and stays after the drawing's `out` until its own `out`
  (a 0.3 s fade). `front`, `frontZ`, `z` and `follow`: Depth and Moving with something else, below.
- `request(st, {born, enter, pos, path, states, seq, moves, type, hi, ghost, ghosts, out, z, follow})`: the
  traveller, the one accent object.
  `enter` is `'settle'` (from 104%), `'left'` (slides in from the left), or anything else for none. `pos` is its
  top-left at birth. `states` maps names to `{kind, w, h, ...}`: `card` (`html`, accent border, light accent fill),
  `code` (`head` html plus `lines`, plain strings that can type on), `token` (`html`, a solid accent pill), `dot`, or
  `art` (`svg`, a drawing with no border or fill: a drawn traveller; the drawing takes the accent as its stroke by
  default, 4 px, no fill, as in `art()`). `seq: [[t, name], ...]` starts in the first state at `born`; at each later
  time its width, height, radius, fill, and border change to the new state and its content swaps behind a short blur
  (a change to or from an `art` state crossfades over 0.2 s instead). `type: {state: [t0, chars a second]}` types a code state's lines on;
  `hi: {state: [[t, line index, list of indexes, or null], ...]}` brightens those lines and dims the rest over 0.3 s;
  `ghosts: [[t, state, where, { level, out, z }], ...]` leaves a faint copy of a state from `t`: `where` is `'here'`
  (default, where the traveller is at `t`), `'born'`, or `[x, y]` (top-left in world px). Each copy fades in over
  0.5 s to `level` (0.5) and stays after the traveller leaves, until `out` (a 0.3 s fade); by default it sits behind
  the traveller. An art state's copy is its own drawing in the line colour; any other kind is its rounded box.
  `ghost: [t, state]` still works: one copy where it was born, shown only while the traveller is on screen.
  `out: t` fades the traveller out. Give it the same look where one segment ends and the next begins.
- `box(st, {x, y, w, h, name, nameCls: 'small', sub, subAt, lines: [[t, text, cls]], at, enter: 'settle', react, dim,
  nameOut, css, z, follow})`: a named place with a border that draws on, its name revealed per word, the sub-line and
  outcome lines rising from a mask. It is a box: use it for a place whose name is the point, not as the picture.
- `wire(st, [[x, y], ...], {at, dur, pulses: [[t0, t1]], head, dim, z})`: a connector drawn on, a chevron at its end
  (`head: false` for none), an accent pulse along it while the traveller moves. Any point may be `t => [x, y]`.
- `wtext(st, {kind, html, x, y, w, at, cls, dim, out, z, follow})`: a label on the world, sitting on the part it
  names. `kind` is `'mask'` (rises from a mask; html allowed), `'words'` (per-word reveal; plain text only), or
  `'fade'`. `cls` is `'big'`, `'mono'`, `'ok'`, or `'fail'`.
- Anything else: `st.on(t => { ... })` with your own per-frame code, still a function of t alone. `st.ev(t, 'what')`
  adds an entry to the event list (`render.js events`) for something your own code does.

**Depth.** Creation order is depth, so whatever is created later draws in front, and wires without `z` are all in one
layer under everything on the stage. Every helper takes `z`: a number, or steps `[[t, z], ...]` that switch at `t`
(0 before the first step). Higher is in front; equal z keeps creation order; a negative z goes under the wires.
Switch a step at a moment the two objects do not overlap, or the change pops. A wire with `z` (0 included) gets its
own layer where it is created, so it can sit over a box. For a drawing that is both behind and in front of something
(a fence, a pocket, a door frame), `art()` takes `front: ['id', ...]`: written once, those parts draw in a second
copy one z above the drawing (or at `frontZ`). That copy is above everything at z 0, including things created later;
give anything that must stay in front `z: 2`.

**Moving with something else.** Any position can be a function of t instead of a number: `x` and `y` of `box`, `wtext`
and `art`; a part's `shift` (`t => [dx, dy]`), `turn` (`t => degrees`) and `o` (`t => level`); a point of a `wire`
(`t => [x, y]`); and the traveller's `path: t => [x, y]`, which replaces `pos` and `moves`. The function must depend
on t alone; `render.js same` catches one that does not.
- Every helper returns an object with `at(t)`, its place on the world at t: the traveller gives `{ x, y, w, h, state }`
  (top-left, size, the state it shows); a drawing gives `{ x, y, w, h }`, and `at(t, 'id', [x, y])` gives
  `{ x, y, deg }` for a point on one of its parts (in that part's own coordinates, default 0, 0) after its shift and
  turn; a box gives `{ x, y, w, h }`; a text gives `{ x, y }` (and `w` when set); a wire gives `{ x, y, pts }`, where
  its pulse is. Scale effects (the settle and react scales) are left out, and the traveller's x, y is its top-left,
  so a follower keeps that offset when the traveller morphs to a wider state.
- So one thing can take its position from another: a label riding on a moving object, a shadow, a wire whose end
  tracks the traveller (`t => { const p = req.at(t); return [p.x, p.y + p.h / 2]; }`), the traveller hanging from a
  drawn part (`path: t => { const p = crane.at(t, 'hook'); return [p.x - 60, p.y]; }`).
- `follow: { target, from, to }` (or a list, for several windows) carries a box, a text, a drawing, the traveller, or
  one part of a drawing with something else: from `from` to `to` it moves as much as the target has moved since
  `from`, so it keeps the offset it had then; after `to` it stays where it was carried, and its own keys add to that.
  `part` and `point` in a follow pick a point on a part of a drawing as the target. A part's follow is its offset
  inside its own drawing. To carry the traveller with a drawn part: key the part down to it, follow while it carries
  (each move can be any length), then key it up again from where it stopped. `render.js events` lists when a follow
  starts and stops.
- The engine ships no stock hook, claw or crane. The demo's hook shows `follow`; draw what your concept card names.

Text sizes in the world, and the smallest zoom at which each still reads at 28 px: box names 52 px (0.54), sub-lines,
outcome lines, world labels, card lines, and tokens 40 px (0.7), the card's main line 44 px (0.64), code 34 px (0.83).
Titles (64 px) and the bottom lines (28 px) are fixed on screen and never scale.

Colours come from `STORY.stagePalette` in `story.js` (ground, panel, deep, line, ink, ink2, acc, ok, fail, tokink,
and optionally draw, each a six-digit hex); without it, stages use the Cloud Control sample colours and the engine
says so. Classes are
prefixed `st-`: inside your own HTML strings write `class="st-ok"`, `st-fail`, or `st-mono`. Stages make no sound.

### The simple engine (`STORY.motion`)

`STORY.motion` (with `STORY.motionLabel`, `STORY.tags`) in `build/story.js`, drawn by `build/motion.js`, is the
older engine: lanes, cards, tokens, and chips. Its look predates MOTION.md: every element without `moves` fades in
with a 14 px lift, its kicker is monospace caps above a headline, its label is a pill, and it crossfades the screen
share out under each segment. Prefer stages. If you use it, restyle its `mg-` classes in `comp.html` to the Look
defaults (MOTION.md) and say so in the style guide. Each element takes `spring` (`'ui'`, `'base'`, or `'heavy'`) for its entry
and `moves`, `swap` (`[[t, html], ...]`, text changes inside one element behind a short blur), and `sfx`
(`'whoosh'`, `'tick'`, or `'pop'`). A `moves` key is an arrival time: the element holds, then travels for one spring
settle time (about 0.45 s with `base`, 0.23 s with `ui`, 0.54 s with `heavy`) and lands on the key.

## Palette

Sample the palette from the recorded product so stages and footage read as one piece:
`python3 lib/sample_colors.py assets/clips/<clip>/f_00200.jpg 1200,800,8 530,400,30,max 530,400,30,min --against '#<ground>'`
prints the average colour of a box (x, y, half-size, in the frame's own whole pixels), and with `max` or `min` the
brightest or darkest pixel and the most saturated one in it. Clips are 2560 x 1440; exploration captures may be
another size. The script prints the image's size on its first line (`image 2560x1440`): read your points off that
size, not off a scaled preview. A point read off a 1920 px wide preview is x 1.333 in a 2560 clip; if a box falls
outside the image, the script stops and says the size, the valid range and that scale. Record the frame and point
next to each hex. Take the ground from the product's content area, the ink from its headings (`max` on a dark
product, `min` on a light one), and the accent from its own brand blue or link colour. If panel and ground read as
grey on grey on a 640 px wide still, move the panel's lightness about 4% further from the ground's and say so.

`--against '#rrggbb'` (quote it: an unquoted `#` can start a shell comment) adds each colour's contrast against that
colour by the WCAG formula, and flags one under 3:1 (`faint for drawings and text`, WCAG 1.4.11) or under 4.5:1
(`drawings only, not text`, WCAG 1.4.3). Give it once for `ground` and once for `panel` to get a column for each. The
script never changes a colour and always exits 0. For scale: the Splunk and Cloud Control job's sampled divider
`#555a60` is 2.13:1 on its ground `#24282d`; the template default line `#737981` is 3.38:1.

`line` is sampled from the product's dividers, which are designed to recede, and it stays the colour of wires, box
borders and left-behind copies. `draw` (optional) is the stroke of drawings made with `art()`; without it drawings
take `line`. When `STORY.stagePalette` is set, stage.js checks `draw` (or `line`) against `ground`, and under 3:1
prints, for example, `line #555a60 is 2.13:1 on ground #24282d; drawings need 3:1 (WCAG 1.4.11); nearest at 3:1:
#6b7178`, the nearest colour of the same hue that reaches 3:1. It is a warning: it changes nothing and never stops a
render. Which object carries each shot, and which may stay quiet? Ways to answer it, alone or together: set `draw`
to that colour or lighter; thicken strokes on the objects that carry the shot only; give objects mass with a `panel`
fill; keep context objects quieter on purpose (the check is on the base colour, not on dims); draw the one object
that carries the shot in `ink2`.
When there is no captured product UI yet (a voice-only demo, or footage not recorded), use the brand colours the owner
gives or a neutral ground that matches the planned footage, mark the palette provisional, and resample once footage
exists.

## Motion by role

The same ease and duration on everything is what makes a film look generated. Choose the curve by what the thing is
doing (stage.js uses these; the values are defaults):
- **Arrival** (an element, word, or line landing): exponential ease-out `1 - 2^(-10k)`, 0.6 to 0.8 s; words 0.13 s.
- **Move inside a shot** (the traveller crossing, the camera): ease both ways, 0.9 to 1.6 s.
- **Exit**: accelerating (`k^3`), about half the entry's time, one motion, not slide, stop, then leave.
- **Overlap**: the next element starts when the previous is a third to half done. Staggers: words 0.067 s, list items
  0.04 to 0.08 s.
- **One main move per shot** reads best; secondary moves travel less far (about half to two thirds) and start a beat
  later (0.1 to 0.2 s); everything else holds still.
- **Entrances vary within a film**: per-word reveal for titles (blur 6 px to 0 and opacity in 0.13 s, 0.067 s apart,
  no translate); a line rising from a mask; a card settling from 104%; draw-on for connectors and drawings; type-on
  for code; the traveller's morph. Not a fade plus a 14 px lift on everything; nothing scales up from zero.
- A landed title holds still; the motion moves to the next element or the camera.

## Springs

Springs are closed-form functions of time (`spring`, `track` in engine.js), so any frame renders on its own. Opacity
and colour never spring. The presets: `ui` (a tiny overshoot) for chips, tokens, and small cards; `base` (the
default, k 170 d 26, no visible overshoot) for cards, containers, and the traveller's size; `heavy` (none) for large
type and big cards. Type never bounces.

## Swaps

To change what an element says, swap its content in place instead of stacking a second element on top (the
traveller's `seq` does this; in the simple engine, `swap`). Old text leaves before new text enters; check each in a
strip (`node build/render.js strip review/strip <t>`).

## Transitions

Use a few kinds in a film, each caused by something on screen, and give each one meaning in your shot table. Stages
never crossfade with the screen share.
- **Push** (`pushIn`, `pushOut`): the screen share leaves on an accelerating curve while the stage arrives on a long
  ease-out, on one ground, so it reads as one world sliding.
- **Camera move** between shots on one stage.
- **Morph**: the traveller changing state where it stands.
- **Blur swap**: text blurs out and new text blurs in; the ground never cuts.
- **Pull-back**: the camera widens to show more of the world.
- **One stage to the next**, below.

### One stage to the next

Two stages back to back join with `join: { stage: earlier, how, dur, ease }` on the later one (`stage` is the earlier
Stage or its name). During the join both stages draw at their own times; the earlier one stops when the join ends
(its `to` is set to that), and the footage stays hidden. Set the earlier stage's `to` between the later one's `from`
and `from + dur`, and leave out `pushOut` on the earlier one and `pushIn` on the later one; stage.js says so
otherwise. A stage hands over to one stage, and is made after the one it joins.
- Two are built in: `'cut'` (no overlap) and `'push'` (the earlier stage leaves left as the next one arrives from the
  right on one ground, with the footage push's curves, 0.87 s by default).
- Anything else is written for the concept as a function, `how: (k, a, b, j) => ({ a: look, b: look })`, called on
  every frame of the join. `k` runs from 0 to 1 on `ease` (`'io'` by default, or `'in'`, `'out'`, `'lin'`, or a
  function of k). `a` and `b` are the two stages (`stage`, `t`, `cam` their own camera, `toFrame([x, y], cam)` a world
  point on screen); `j` is `{ t, u, dur }`. A look can set `x`, `y`, `scale` and `origin`, `opacity`, `clip` (a CSS
  clip-path), `filter`, `cam` (a camera for that frame) and `top`. The default `dur` of a written join is 0.8 s. A
  look moves the whole stage, its title and corner lines with it.
- `stage.toFrame([x, y], t)` and `stage.toWorld([x, y], t)` convert between a stage's world and the frame. With
  `at(t)` they hand one object across a join: start the next stage's traveller at
  `next.toWorld(prev.toFrame([p.x, p.y], t), t)` where `p = prevTraveller.at(t)`, so the eye follows one thing across.
- To see both kinds, call `demoJoins({ from: 0, to: 12 })` in `sketch()` in place of `demoStage`. Its circle join is an
  example of the mechanism, not a look to reuse.
- When segments share places, one stage with `sections` may be simpler than a join (Stages, above).

## Review renders

Besides `stills`, `strip`, `motionsheet` and `same` (MOTION.md, Determinism):
- `node build/render.js events review/events [--stage name] [--every 0.5] [--burst -0.2,0,0.2]`: a frame at each
  `--burst` offset around every entry of `window.stageEvents()` (every scheduled change on every stage, as
  `{ stage, t, what }` sorted by time; a move, turn or slide gives its start and its landing), plus one every `--every`
  seconds between. Contact sheets per shot of at most 20 cells, 2,440 px wide and under 2,576 px on the long edge,
  labelled with the stage, the shot and each event; with `--blind` (on by itself with `--words-off`) they show times
  only and are named `sheet_NN.jpg`, and `motionsheet` and `strip` sheets show times only too. Full-size frames in
  `<dir>/frames/t_<time>.jpg`; the list in `<dir>/events.json` (it names everything; it is for you). `--burst -0.3,0,0.15,0.4` gives other offsets, `--every 1` a sparser pass. An older job
  whose `stage.js` lacks `stageEvents()` gets stage edges and camera keys only, and render.js says so.
- `node build/render.js state review/state 5.5 --sketch`: the page state dump (`t_<time>_state.json`) at given times,
  to compare two builds or two times by hand.

## Camera scaling

Never set `will-change` on anything the camera scales: its text renders blurry. Leave the `.layer` rule in comp.html
alone: it keeps its `will-change` on purpose, and `render.js same` fails without it.

## Sound

Stages make no sound. In the simple engine, set `sfx` only on the elements whose arrival matters: `whoosh` for
something that travels (it also plays on each `moves` key), `tick` for a small state change, `pop` for a card
arriving. Run `node build/render.js motioncues` before `lib/sfx_events.py`, which mixes them well under the voice; run
it again after every new voice take. Music stays under the title and the close only. These sound levels have not been
checked by ear yet: they count as verified only after the owner listens to one real mix, so say so in the README's
evidence boundary until then.
