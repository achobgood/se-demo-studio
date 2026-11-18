// ENGINE DEMO for build/stage.js, loaded only by sketch.html. It has no story on purpose: it shows what each helper
// does (a drawn object with a part that turns and one that slides, a dashed outline that fades in, a drawn traveller
// that morphs into a token and back, a connector with a pulse, a receiver that reacts, a hoop drawn once that the
// traveller passes through (front), a copy it leaves where it stopped (ghosts), a change of depth (z), a hook that
// follows the traveller across both its moves (follow, at(t))) so there is no picture to copy.
// demoJoins (below) shows three stages joined one to the next ('push', then a join written for it) and sections; to
// render it, call demoJoins({ from: 0, to: 12 }) in sketch() in place of demoStage.
// Your picture comes from your concept card (references/MOTION.md, Think 1).
function demoStage(c) {
  const t = k => c.from + k;   // times below are seconds from the stage's start
  const st = new Stage({ name: 'Engine demo (no story)', from: c.from, to: c.to,
    cam: [[c.from, 960, 520, 1], [t(6.4), 1180, 520, 1.25], [t(10), 960, 540, .95]],
    titles: [[t(.2), t(3.2), 'Engine demo | no story here']],
    label: [[c.from, 'Illustrative · engine demo']],
    shots: [[c.from, 'parts draw on'], [t(3.5), 'dial turns, panel slides'], [t(5.2), 'traveller crosses'], [t(8), 'morph back']] });
  // a drawn object: a dial whose needle turns about its centre, a panel that slides, a dashed outline that fades in
  art(st, { x: 260, y: 260, w: 560, h: 520, at: t(.4),
    svg: '<circle cx="180" cy="180" r="150"/><path d="M180 60 V40 M300 180 H320 M180 300 V320 M60 180 H40"/>' +
         '<path id="needle" d="M180 180 L180 70" stroke="var(--st-ink)" stroke-width="8"/>' +
         '<rect x="60" y="380" width="440" height="110" rx="12"/>' +
         '<rect id="outline" x="70" y="390" width="190" height="90" rx="8" stroke-dasharray="10 12"/>' +
         '<rect id="panel" x="70" y="390" width="190" height="90" rx="8" fill="var(--st-panel)"/>',
    parts: { needle: { turn: [[0, 0], [t(4.2), 120], [t(8.6), 30]], pivot: [180, 180], dur: .8 },
             panel: { shift: [[0, 0, 0], [t(4.6), 230, 0]], dur: .6 },
             outline: { o: [[t(4.8), .6]], start: 0 } } });
  const recv = box(st, { x: 1360, y: 300, w: 440, h: 360, name: 'Receiver', sub: 'reacts on arrival', at: t(1), react: [t(6.25)] });
  wire(st, [[820, 480], [1360, 480]], { at: t(3), pulses: [[t(5.2), t(6.2)]] });  // the traveller dips under the receiver's name as it lands
  // a hoop drawn once: its near half is listed in front, so the traveller passes behind it and in front of the far half
  art(st, { name: 'hoop', x: 1080, y: 330, w: 120, h: 300, at: t(3.2), front: ['near'],
    svg: '<path d="M60 20 A40 130 0 0 1 60 280"/><path id="near" d="M60 280 A40 130 0 0 1 60 20" stroke-width="8"/>' });
  // a drawn traveller (kind 'art') that crosses, becomes a token, and comes back as the same drawing
  const trav = request(st, { born: t(2.4), enter: 'settle', pos: [880, 420],
    states: { shape: { kind: 'art', w: 120, h: 120, svg: '<path d="M60 8 L112 38 V82 L60 112 L8 82 V38 Z" stroke="var(--st-acc)" stroke-width="6" fill="none"/>' },
              token: { kind: 'token', w: 300, h: 96, html: '<b>value</b><span>01</span>' } },
    seq: [[t(2.4), 'shape'], [t(6.3), 'token'], [t(8.6), 'shape']],
    moves: [[t(5.2), t(6.2), 1420, 520], [t(8.9), t(9.8), 880, 420]],
    ghosts: [[t(6.25), 'shape', 'here']],   // a faint copy stays where it stopped, after it leaves
    z: [[t(7.5), 3]] });                     // at 7.5 s, far from the hoop: in front of both halves on the way back
  // a hook that comes down to the traveller, is carried by it across both moves (each its own length), and goes up again:
  // its own keys bring it down and take it up; follow adds the traveller's movement inside each window
  art(st, { name: 'hook', x: 880, y: 240, w: 120, h: 180, at: t(4.4), z: [[t(7.5), 3]],
    svg: '<g id="hook"><path d="M60 -400 V150"/><path d="M60 150 C60 176 86 176 86 158"/></g>',
    parts: { hook: { shift: [[0, 0, -260], [t(5.1), 0, 0], [t(10.6), 0, -600]], dur: .5,
                     follow: [{ target: trav, from: t(5.1), to: t(6.3) }, { target: trav, from: t(8.8), to: t(9.9) }] } } });
  wtext(st, { kind: 'mask', html: 'What the demo shows', x: 960, y: 820, at: t(10.4) });
  return st;
}
// THREE STAGES JOINED ONE TO THE NEXT (also no story): A hands over to B with the built-in 'push'; B hands over to C with a
// join written for this demo, an example of the mechanism and not a look to reuse: C opens as a circle from where B's
// traveller stands, and C's traveller starts at the same place on screen, so one object carries the eye across. C holds
// two sections (one stage, two segments on purpose), so the shot sheet gives it two sheets.
function demoJoins(c) {
  const t = k => c.from + k, label = [[c.from, 'Illustrative · engine demo']], hex = '<path d="M60 8 L112 38 V82 L60 112 L8 82 V38 Z" stroke="var(--st-acc)" stroke-width="6" fill="none"/>';
  const A = new Stage({ name: 'Join demo A', from: t(0), to: t(4), label, titles: [[t(.2), t(2.6), 'Join demo | push, then a join of its own']] });
  box(A, { x: 200, y: 400, w: 520, h: 300, name: 'Stage A', sub: 'hands over with push', at: t(.5) });
  request(A, { born: t(1), enter: 'settle', pos: [900, 490], states: { shape: { kind: 'art', w: 120, h: 120, svg: hex } }, seq: [[t(1), 'shape']],
    moves: [[t(2), t(3), 1500, 490]] });
  // B: a wire whose far end tracks the traveller (a point that is a function of t), and a ring the traveller stops in
  const B = new Stage({ name: 'Join demo B', from: t(4), to: t(8.2), label: [[t(4), 'Illustrative · engine demo']], join: { stage: A, how: 'push' } });
  box(B, { x: 80, y: 380, w: 400, h: 300, name: 'Stage B', sub: 'hands over with its own join', at: t(4) });
  art(B, { name: 'ring', x: 1150, y: 230, w: 300, h: 300, at: t(4.3), svg: '<circle cx="150" cy="150" r="140"/>' });
  const trB = request(B, { born: t(4), enter: 'cut', pos: [560, 470], states: { shape: { kind: 'art', w: 120, h: 120, svg: hex } }, seq: [[t(4), 'shape']],
    moves: [[t(5.4), t(7.2), 1240, 320]] });
  wire(B, [[480, 530], k => { const p = trB.at(k); return [p.x - 8, p.y + p.h / 2]; }], { at: t(4.6) });
  // C opens as a circle centred on B's traveller wherever it is on screen (toFrame), growing to cover the frame
  const iris = (k, a) => { const p = trB.at(a.t), [x, y] = a.toFrame([p.x + p.w / 2, p.y + p.h / 2]);
    return { b: { clip: `circle(${(k * 2300).toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)` } }; };
  const C = new Stage({ name: 'Join demo C', from: t(8.2), to: c.to, label: [[t(8.2), 'Illustrative · engine demo']], join: { stage: B, how: iris, dur: .9 },
    cam: [[t(8.2), 960, 540, 1], [t(10.6), 1180, 560, 1.1]],
    sections: [[t(8.2), 'first section'], [t(10.3), 'second section']], shots: [[t(8.2), 'circle opens'], [t(9.4), 'crosses'], [t(10.3), 'token']] });
  // C's traveller starts where B's stands on screen at the join, in C's world (toWorld)
  const p0 = trB.at(t(8.2)), [wx, wy] = C.toWorld(B.toFrame([p0.x, p0.y], t(8.2)), t(8.2));
  const rc = box(C, { x: 1360, y: 520, w: 420, h: 300, name: 'Stage C', sub: 'two sections', at: t(8.2), react: [t(10.25)] });
  request(C, { born: t(8.2), enter: 'cut', pos: [wx, wy], states: { shape: { kind: 'art', w: 120, h: 120, svg: hex }, token: { kind: 'token', w: 300, h: 96, html: '<b>value</b><span>01</span>' } },
    seq: [[t(8.2), 'shape'], [t(10.3), 'token']], moves: [[t(9.4), t(10.2), rc.at(t(10)).x + 60, rc.at(t(10)).y + 180]] });
  return C;
}
