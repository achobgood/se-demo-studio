// JOB-SPECIFIC STAGES (optional): illustrative motion segments built as shots on a camera-moved world (build/stage.js).
// Read references/MOTION.md (studio root) first: answer the concept card, sketch the signature moment in
// build/sketch.js with literal times, get it approved at the storyboard, then build each segment here with narration
// times. Leave this file without stages when the job has none.
// Times: W('word', 'segment', n) is the start of the n-th word in that segment that starts with 'word' (n picks between
// repeats; W(..., ..., n, true) is its end); S0('segment') and S1('segment') are a segment's start and end; TOTAL is the
// film's length. To see every helper working, render the engine demo: node build/render.js stills review/demo 2 5 7 10 --sketch
//
// Shape of one segment (names and numbers are placeholders, not a picture to reuse):
// {
//   const w = n => W(n, 'segment-name'), T0 = S0('segment-name') - .3, T1 = S1('segment-name') + .6;
//   const st = new Stage({ name: 'Segment name', from: T0, to: T1, pushIn: true, pushOut: true,
//     cam: [[T0, 960, 540, 1], [w('cue') + .4, 1400, 540, 1.2]],          // arrival times
//     titles: [[T0 + .15, w('cue') - .2, 'A short title']],
//     label: [[T0, 'Illustrative · example values']],                      // required; defaults to 'Illustrative'
//     evid: [[w('cue'), 'Source of the claim · Documented']],
//     shots: [[T0, 'shot 1'], [w('cue'), 'shot 2']] });
//   art(st, { ... });  request(st, { ... });  wire(st, [...], { ... });   // see STAGE_ENGINE.md
// }
