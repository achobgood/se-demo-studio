# Motion segments

Read this file only when a job needs it: when INTERVIEW.md lists steps the environment cannot show, when you judge
that an abstract scene would clearly make the demo clearer, or when the owner gave a style reference (then read
"Style guide"). Everything in the builder prompt still applies; this file adds the rules that matter only for motion
segments. Paths are relative to the job folder unless they start with the studio root.

## When to use motion at all

- Use a motion segment only where the environment cannot show a step (L92), or where an abstract scene clearly makes
  the demo clearer than a real screen can. A demo that can show everything on real screens uses none.
- Never use one as decoration, to fill time, or to make the video look busier. Real product UI stays the backbone.
- The title, agenda card, value recap, and close are cards, not motion segments; the builder prompt covers them.
- A segment the interview did not ask for is named in STORYBOARD_READY.md with the reason it helps, so the owner
  approves it at the storyboard.

## What a segment may show

When the owner decides some steps cannot be shown in the environment, bridge each with an abstract motion-graphics
scene and on-screen text labeled illustrative (no mock product screens, no logos, no timing claims), then cut to the
real screen that backs it up (L92).

Use abstract lanes, cards, tokens, and chips with plain-text product names, real documented field names, and
example values marked as examples. Never draw a mock product screen or a logo, never add a timing claim, and never
animate over real UI as if the product acted. Keep the illustrative label on every segment, and cut to the real
screen that backs it up. A segment a viewer could mistake for a product screen fails honesty.

On-screen text in a segment follows the builder prompt's copy rules: no em dashes, no mirrored pairs (L98), and it
does not repeat the narration.

## Building them

Build them with `STORY.motion` (and `STORY.motionLabel`, `STORY.tags`) in `build/story.js`; `build/motion.js` draws
them and fades the screen share out under each one (example at the end of `story.js`; commands in PIPELINE.md,
Picture).

Each element in `STORY.motion` takes the existing fields plus three optional ones: `spring` (`'ui'`, `'base'`, or
`'heavy'`; default `'base'`) for its entry and `moves`; `swap` (`[[t, html], ...]`), content changes inside the same
element behind a short blur, so old and new text never overlap; and `sfx` (`'whoosh'`, `'tick'`, or `'pop'`), a
sound at its entry, and for `whoosh` on each `moves` key too. When to use each preset and sound is under Springs and
Sound below.

A `moves` key is the arrival time: the element holds still, then travels for one spring settle time (about 0.45 s
with `base`, 0.23 s with `ui`, 0.54 s with `heavy`) and arrives at the keyed time. It no longer glides across the
whole interval between keys, so put the key on the word where the element should land.

## Style guide

When the job has motion segments or the owner gave a style reference, write `research/STYLE_GUIDE.md` before
building them: palette (hex), type (family, weight, tracking), shot lengths, transitions, camera moves, and how
text enters and exits. The reference is the product's own captured UI unless the owner supplied one.

When the owner supplied one (named in PROMPT.md, Visual style), read it for what it changes in technique, style, or
process, not only whether its topic matches (L93). For a video, extract one frame every 0.5 seconds with the bundled
ffmpeg and study them before writing the guide:
`mkdir -p research/reference/frames && ../../toolkit/node_modules/ffmpeg-static/ffmpeg -i research/reference/<file> -vf "fps=2,scale=960:-2" -q:v 3 research/reference/frames/%04d.jpg`
For a web link, download it with:
`yt-dlp -f "bv*[height<=1080]/b" -o "research/reference/ref.%(ext)s" "<the owner's link>"`
This yt-dlp command has not been tested yet. yt-dlp is optional (`brew install yt-dlp`): if it is missing or the
command fails, ask the owner for a downloaded file or screenshots, which work without it.
Download only the link the owner gave, and use it as a reference only: none of it appears in the video.

Take the reference's grammar (pacing, type, color, how things move), never its content, logos, or characters. A
font the guide calls for can be used only after you add it to `build/fonts/` with a license that allows bundling
it, because renders run offline; otherwise use the closest bundled face and say so in the guide.

## Look

No centered title on a gradient, no frame borders, no glow, no particle bursts, no corner labels, and not every
element fading in the same way: let elements enter with a short move or a change of size. One accent color, from
the style guide. Within a segment, something new happens every 2 to 4 seconds (an element enters, moves, or changes
its text), each on a narration cue word. The illustrative label is required on every segment and is the one corner
label allowed.

## Springs

Set `spring` on each element; it drives the entry and every `moves` key. `ui` (a tiny overshoot) for chips, tokens,
and small cards; `base` (the default) for cards, lanes, and containers; `heavy` (no overshoot) for large type and
big cards. Type never bounces: anything whose main content is a heading or a large word is `heavy`.

## Swaps

To change what an element says, give it a `swap` list instead of stacking a second element on top. The old text
leaves before the new text enters, so text never overlaps during a swap; check each one in a strip
(`node build/render.js strip review/strip <t>`).

## Camera scaling

Never set `will-change` on anything the camera scales: its text renders blurry. Leave the `.layer` rule in
comp.html alone: it keeps its `will-change` on purpose, and `render.js same` fails without it.

## Determinism

The builder prompt's determinism rules (Visual style) cover motion segments too: `build/motion.js` sets every frame
from its time alone, so add no randomness, clock reads, timers, `requestAnimationFrame`, or CSS transitions and
animations to it. When you run `node build/render.js same review/same <times>` before the rough cut, include two or
three times inside motion segments.

## Storyboard: state list

Add the style guide (`research/STYLE_GUIDE.md`) to STORYBOARD_READY.md. For each motion segment, add a state list
timed to the narration: one row per state with the cue word that triggers it, what is on screen, the on-screen text,
and its evidence label (illustrative, example value, or the source or real screen that backs it), with something new
every 2 to 4 seconds. The motionsheet comes with the rough cut (see Critique).

## Sound

In motion segments, set `sfx` only on the elements whose arrival matters, not on every one: `whoosh` for something
that travels (it also plays on each `moves` key), `tick` for a small state change such as a chip, `pop` for a card
arriving. Run `node build/render.js motioncues` before `lib/sfx_events.py`, which mixes them well under the voice;
run it again after every new voice take. Music stays under the title and the close only. These sound levels have not
been checked by ear yet: they count as verified only after the owner listens to one real mix, so say so in the
README's evidence boundary until then.

## Critique

In each round of the builder prompt's Review, between the rough cut and the final, also critique every motion
segment yourself, as a harsh motion director rather than its author. Run `node build/render.js motionsheet
review/motion` and `node build/render.js strip review/strip <t>` at each swap and fast move, open them, and add them
to the review package. Sheet tiles are small, so also render one full-size still per segment (`node build/render.js
stills review/stills <t>`) and judge legibility on it. Score each segment 1 to 10 on legibility at 1920x1080, motion
quality (springs, no dead frames), variety (something new every 2 to 4 seconds), composition, honesty labels
(illustrative label visible, examples marked, no mock product screen or logo), sync with the narration, and accuracy
of names and values (product and field names exactly as captured or documented, example values marked). A segment a
viewer could mistake for a product screen fails honesty. List the three worst problems with timestamps and fix them
before the next version. An honesty or legibility failure blocks the final, whatever the scores.
