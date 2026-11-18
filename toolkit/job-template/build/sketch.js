// SKETCH (optional): build a motion segment's signature moment here with literal times in seconds, before any voice
// take or footage exists, so it can go to the owner at the storyboard (references/MOTION.md, Think 2). When a take
// exists (build/cues.json), render.js --sketch loads its word timings, so W('word', 'segment'), S0() and S1() work here.
// This file loads before engine.js: define STORY and functions here; call engine helpers only inside sketch().
//   node build/render.js stills review/sig 2 4.5 7 --sketch               the stills
//   node build/render.js stills review/sig_nowords 4.5 --sketch --words-off   the same moment with every word hidden
//   node build/render.js strip review/sig 4.5 --sketch                    frames across the change
// Once the take exists, move the stage into build/stages.js and swap the literal times for W(), S0(), S1().
if (!CUES.words.length) CUES.total = 12;   // length of the sketch timeline in seconds when there is no take (with one, the film's)
const STORY = {
  stagePalette: null,         // { ground: '#......', panel, deep, line, draw, ink, ink2, acc, ok, fail, tokink }: sample the product
                              // from an exploration capture (capture/explore/) with lib/sample_colors.py, mark it
                              // provisional, and resample from the clips into story.js after the takes; draw is
                              // optional (the stroke for drawings; line when left out)
  motionLabel: 'Illustrative',
};
function sketch() {
  demoStage({ from: 0, to: 12 });   // the engine demo; replace with your own new Stage({...}) and its parts
}
