// STAGES (optional): illustrative motion segments built as shots on a world larger than the frame, with a camera,
// motion by role, several kinds of entrance, one travelling object that changes shape (the "request"), drawn
// connectors whose receivers react, drawn line art, and a push between the screen share and the stage.
// Read references/MOTION.md (studio root) before using it: it says how to find the concept first; the helpers, kinds,
// sizes, flags, and palette are in references/STAGE_ENGINE.md.
// Define stages in build/stages.js. A job with no stages is unaffected: framePush(t) returns 0 and nothing is drawn.
// Every value is a function of t alone. After build, text spans only change opacity, transform and filter; the
// request box also changes width, height, radius and colour (its text sits in fixed-width children, so nothing reflows).
// Classes are prefixed st- so they never collide with comp.html; the CSS is injected below.
// Depth: whatever is created later draws in front. Every helper takes z (a number, or steps [[t, z], ...]) to change
// that; art() takes front: ['id', ...] for a drawing that sits both behind and in front of something (zAt, below).
// stage.js needs springAt and track from the template's engine.js; an older job's engine.js lacks them (checked here).
const NEED = { springAt: typeof springAt, track: typeof track }, MISSING = Object.keys(NEED).filter(k => NEED[k] !== 'function');
if (MISSING.length) console.error(`stage.js needs ${MISSING.join(' and ')} from the template's engine.js (toolkit/job-template/build/engine.js); this job's build/engine.js does not define ${MISSING.length > 1 ? 'them' : 'it'}. Copy the template's engine.js into build/ too. Until then no stage is drawn.`);
const PAL = Object.assign(
  // defaults sampled from Cisco Cloud Control's dark UI (job splunk-ccc-motion2); sample your own product's UI with
  // python3 lib/sample_colors.py <frame.jpg> x,y,r ... and set STORY.stagePalette in story.js
  { ground: '#24282d', panel: '#30353d', deep: '#131b22', line: '#737981', ink: '#f5f7fa', ink2: '#9fa3af', acc: '#3d9ef2', ok: '#4cc38a', fail: '#ef6b5f', tokink: '#0b0f14' },
  (typeof STORY !== 'undefined' && STORY.stagePalette) || {});
// draw: the stroke of drawings (art()); without it drawings take line, which stays the colour of wires, box borders and copies
const DRAW_SET = !!PAL.draw; if (!DRAW_SET) PAL.draw = PAL.line;
for (const [k, v] of Object.entries(PAL)) if (!/^#[0-9a-f]{6}$/i.test(v)) console.error(`STORY.stagePalette.${k} must be a 6-digit hex like #24282d, not ${v}`);
const P = c => String(c || '').split(' ').filter(Boolean).map(x => 'st-' + x).join(' ');
// ?words=0 is the words-off check (MOTION.md, Think 2); render.js passes it with --words-off. engine.js hides every word in
// #stage for it and render.js prints any word still visible as WORDS LEFT; the st- rule at the end of this file also
// hides words on stages, SVG <text> included. Text you add yourself with st.on: give it class="st-words" as well.
const WORDS_OFF = new URLSearchParams(location.search).get('words') === '0';
if (WORDS_OFF) document.body.classList.add('st-words-off');
// fonts used only inside hidden stages may not load before the first frame: ask for every weight up front; then measure
// the corner lines once with the real fonts (checkCorners, below), before any frame
{ const ready0 = window.ready; window.ready = async () => { await Promise.all(['400 40px "IBM Plex Mono"', '500 40px "IBM Plex Mono"',
    '400 40px "Inter"', '500 40px "Inter"', '600 40px "Inter"', '650 40px "Inter"'].map(f => document.fonts.load(f).catch(() => {}))); const r = await ready0(); checkCorners(); return r; }; }
// show or hide a whole element: display, not visibility, because a child set visible would still show (determinism)
const show = (e, on) => { const d = on ? '' : 'none'; if (e.style.display !== d) e.style.display = d; return on; };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
const rgba = (h, a) => `rgba(${hex(h).join(',')},${a})`;
// contrast of the drawing colour on the ground (WCAG 1.4.11 asks 3:1 for graphics needed to understand the content).
// A warning with the nearest colour of the same hue that reaches 3:1; it never changes a colour or stops a render.
const lum = h => hex(h).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4)).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + .05) / (y + .05); };
function toHsl(h) {
  const [r, g, b] = hex(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1)), hh = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [hh * 60, s, l];
}
function fromHsl([hh, s, l]) {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((hh / 60) % 2 - 1)), m = l - c / 2, i = Math.floor(hh / 60) % 6;
  const rgb = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][i];
  return '#' + rgb.map(v => Math.round((v + m) * 255).toString(16).padStart(2, '0')).join('');
}
// the colour of the same hue and saturation, nearest in lightness, that reaches 3:1 on bg (null if none does)
function nearest3(c, bg) {
  const [hh, s, l] = toHsl(c);
  for (let d = .001; d <= 1; d += .001) for (const L of [l + d, l - d]) { if (L < 0 || L > 1) continue; const h = fromHsl([hh, s, L]); if (contrast(h, bg) >= 3) return h; }
  return null;
}
if (typeof STORY !== 'undefined' && STORY.stagePalette && /^#[0-9a-f]{6}$/i.test(PAL.draw) && /^#[0-9a-f]{6}$/i.test(PAL.ground)) {
  const cr = contrast(PAL.draw, PAL.ground);
  if (cr < 3) { const n = nearest3(PAL.draw, PAL.ground);
    console.error(`${DRAW_SET ? 'draw' : 'line'} ${PAL.draw} is ${(Math.floor(cr * 100) / 100).toFixed(2)}:1 on ground ${PAL.ground}; drawings need 3:1 (WCAG 1.4.11); ` +
      (n ? `nearest at 3:1: ${n}` : 'no colour of this hue reaches 3:1 on this ground') + `. A warning only: set STORY.stagePalette.draw (drawings only; line stays for wires and borders) or lift the drawings another way (STAGE_ENGINE.md, Palette).`); }
}
// depth: z is a number or steps [[t, z], ...] (0 before the first step; switch at a moment the two objects do not overlap,
// or the change pops). Higher is in front; equal z keeps creation order; a negative z goes under the wires' shared layer.
const zAt = (z, t) => { if (z == null) return ''; if (!Array.isArray(z)) return String(z); let v = 0; for (const [k, n] of z) if (t >= k) v = n; return String(v); };
const setZ = (e, z, t) => { const v = zAt(z, t); if (e.style.zIndex !== v) e.style.zIndex = v; };
function checkZ(z, who) { if (Array.isArray(z)) for (let i = 0; i < z.length; i++) if (!Array.isArray(z[i]) || (i && !(z[i][0] > z[i - 1][0]))) console.error(`${who}: z steps must be [[t, z], ...] in time order (step ${i})`); }
// positions over time: x, y, a part's shift, turn or level, a wire's point, and the traveller's path may each be a
// function of t instead of a value (it must depend on t alone). Every helper returns an object with at(t), its place on
// the world at t ({ x, y, ... }, below), so one thing can take its position from another.
const val = (v, t) => typeof v === 'function' ? v(t) : v;
// follow: { target, from, to, part, point } or a list of them. From from to to (default: the stage's end), the follower
// moves by as much as the target has moved since from, so it keeps the offset it had at from; after to it holds where it
// was carried, and its own keys add to that. target is anything a helper returned (it has at(t)); part and point pick a
// point on a part of an art() drawing (at(t, part, point)).
const follows = f => f == null ? [] : Array.isArray(f) ? f : [f];
let FOLLOW_DEPTH = 0, FOLLOW_LOOP = false;
function followBy(f, t) {
  let dx = 0, dy = 0;
  if (FOLLOW_DEPTH > 40) { if (!FOLLOW_LOOP) console.error('follow: a loop of followers (A follows B, B follows A): positions stop adding after 40 levels'); FOLLOW_LOOP = true; return [0, 0]; }
  FOLLOW_DEPTH++;
  try { for (const w of follows(f)) { if (!w || !w.target || typeof w.target.at !== 'function' || !(t > w.from)) continue;  // a bad entry was reported once (checkFollow)
    const a = w.target.at(w.from, w.part, w.point), b = w.target.at(Math.min(t, w.to ?? Infinity), w.part, w.point); dx += b.x - a.x; dy += b.y - a.y; } }
  finally { FOLLOW_DEPTH--; }
  return [dx, dy];
}
function checkFollow(st, f, who) {
  for (const w of follows(f)) {
    if (!w || !w.target || typeof w.target.at !== 'function' || !Number.isFinite(w.from)) { console.error(`${who}: follow needs { target, from } where target is something a helper returned (it has at(t)) and from is a time`); continue; }
    if (w.to != null && !(w.to > w.from)) console.error(`${who}: follow from ${w.from} to ${w.to} never runs`);
    const tw = w.target._who || 'its target';
    st.ev(w.from, `${who} starts following ${tw}`); if (w.to != null) st.ev(w.to, `${who} stops following ${tw}`);
  }
}
// where x, y (values or functions of t) and follow put a box, a text or a drawing at t; isMoving: it needs placing on
// every frame (otherwise it is placed once, as before)
const placeAt = (o, t) => { const [fx, fy] = followBy(o.follow, t); return [val(o.x, t) + fx, val(o.y, t) + fy]; };
const isMoving = o => typeof o.x === 'function' || typeof o.y === 'function' || follows(o.follow).length > 0;
const place = (e, o, t) => { const [x, y] = placeAt(o, t); e.style.left = fx2(x) + 'px'; e.style.top = fx2(y) + 'px'; };
// scheduled changes for render.js events (window.stageEvents, at the end): a short text for each, and z steps
const short = h => String(h).replace(/<[^>]+>/g, '').replace(/\s*\|\s*/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 48);
function evKeys(st, keys, what) { for (const k of keys || []) st.ev(k[0], typeof what === 'function' ? what(k) : what); }
function evZ(st, z, who) { if (Array.isArray(z)) evKeys(st, z, k => `${who}: depth to z ${k[1]}`); }
// curves by role
const EX = k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k);                 // arrival: long exponential tail
const IO2 = k => k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;  // moves and camera: both ways
const IN3 = k => k * k * k;                                             // exits: accelerate
const arr = (t, a, d = .7) => EX(clamp((t - a) / d));
const lv = (t, b, d = .3) => IN3(clamp((t - b) / d));
const mv = (t, a, b) => IO2(clamp((t - a) / (b - a)));
// level over time from [[t, level], ...]: a 0.3 s in-out ramp at each key (dimming to 0.35 and back)
function levels(t, keys, start = 1) { let v = start; for (const [k, l] of keys) v = lerp(v, l, IO2(clamp((t - k) / .3))); return v; }
// receiver reaction: scale 1 to 1.03 in 0.12 s, back in 0.35 s; returns [scale, border tint 0..1]
function react(t, ts) {
  let s = 0, c = 0;
  for (const a of ts || []) {
    const u = t - a; if (u < 0 || u > .8) continue;
    s = Math.max(s, u < .12 ? EX(u / .12) : 1 - IO2(clamp((u - .12) / .35)));
    c = Math.max(c, u < .1 ? u / .1 : 1 - IO2(clamp((u - .2) / .5)));
  }
  return [1 + .03 * s, c];
}
// ---------- text: split once into fixed word spans ----------
function wordsEl(parent, text, cls, css = '') {
  const e = el('div', P(cls), parent); e.style.cssText += css;
  // a lone '|' in the text is a line break
  e._w = text.split(' ').map((w, i, a) => { if (w === '|') { el('br', '', e); return null; } const s = el('span', P('wd'), e); s.textContent = w; if (i < a.length - 1) e.appendChild(document.createTextNode(' ')); return s; }).filter(Boolean);
  return e;
}
// per-word reveal (blur 6 px to 0, opacity in 0.13 s, 0.067 s apart, no translate) and blur-out (8 px, 0.2 s, 0.04 s apart)
function wordsAt(e, t, a, b = Infinity) {
  let any = false;
  e._w.forEach((s, i) => {
    const k = clamp((t - a - i * .067) / .13), x = IN3(clamp((t - b - i * .04) / .2)), o = k * (1 - x);
    s.style.opacity = o; s.style.filter = (k < 1 || x > 0) && o > 0 ? `blur(${((1 - k) * 6 + x * 8).toFixed(2)}px)` : 'none';
    if (o > 0) any = true;
  });
  e.style.visibility = any ? 'visible' : 'hidden';
}
// mask rise: the inner line rises from below a clipping box (0.6 s, exponential ease-out)
function maskEl(parent, html, cls, css = '') { const e = el('div', P('mask ' + cls), parent); e.style.cssText += css; e._i = el('span', '', e, html); return e; }
function maskAt(e, t, a, o = 1) {
  const k = arr(t, a, .6); e.style.visibility = t >= a && o > .001 ? 'visible' : 'hidden';
  e.style.opacity = o; e._i.style.transform = `translateY(${((1 - k) * 110).toFixed(2)}%)`;
}
// ---------- camera: keys [[arrival time, x, y, zoom], ...]; the move into a key starts 0.9 to 1.6 s earlier ----------
function camDur(p, q) { return clamp(.9 + (Math.hypot(q[1] - p[1], q[2] - p[2]) + Math.abs(Math.log(q[3] / p[3])) * 1500) / 2500, .9, 1.6); }
function checkCam(keys, name) {
  for (let i = 1; i < keys.length; i++) if (!(keys[i][0] > keys[i - 1][0])) console.error(`stage "${name}": camera keys must be in time order with no two at one time (key ${i} at ${keys[i][0]})`);
}
function stageCam(keys, t) {
  let c = keys[0].slice(1);
  for (let i = 1; i < keys.length; i++) {
    const p = keys[i - 1], q = keys[i], t0 = Math.max(p[0], q[0] - camDur(p, q));
    if (t < t0) break;
    const k = mv(t, t0, q[0]);
    c = [lerp(p[1], q[1], k), lerp(p[2], q[2], k), Math.exp(lerp(Math.log(p[3]), Math.log(q[3]), k))];
  }
  return c;
}
// ---------- the push between footage and a stage ----------
const PUSH = { out: .36, inDelay: .12, inDur: .75 };
const STAGES = [];
// frame offset in px for the footage layer: leaves left when a stage pushes in, arrives from the right when it pushes out
function framePush(t) {
  if (MISSING.length) return 0;  // stages are not drawn (the engine.js message above), so the footage stays
  for (const s of STAGES) {
    const { from, to, pushIn, pushOut } = s.o;
    if (pushIn && t >= from && t < from + PUSH.out) return -1960 * IN3((t - from) / PUSH.out);
    if (t >= (pushIn ? from + PUSH.out : from) && t < (pushOut ? to - .48 : to)) return null;  // off screen while the stage is up
    if (pushOut && t >= to - .48 && t < to + .27) return 1960 * (1 - arr(t, to - .48, .75));
  }
  return 0;
}
window.framePush = framePush;
function stageShift(s, t) {
  const { from, to, pushIn, pushOut } = s.o;
  if (pushIn && t < from + PUSH.inDelay + PUSH.inDur) return 1960 * (1 - arr(t, from + PUSH.inDelay, PUSH.inDur));
  if (pushOut && t > to - .6) return -1960 * IN3(clamp((t - (to - .6)) / PUSH.out));
  return 0;
}
const camCss = ([cx, cy, z]) => `translate(${(960 - cx * z).toFixed(2)}px, ${(540 - cy * z).toFixed(2)}px) scale(${z.toFixed(5)})`;
// ---------- stage to stage: a stage joins the one before it, join: { stage, how, dur, ease } ----------
// stage is the earlier Stage (or its name). During the join, from the joining stage's from to from + dur, both stages
// draw at their own times; the earlier one ends when the join ends (its to is set to that) and the footage stays hidden.
// how: 'cut' (no overlap), 'push' (the earlier stage leaves left as this one arrives from the right on one ground, with
// the footage push's curves, 0.87 s), or a function written for the concept, called on every frame of the overlap:
//   how(k, a, b, j) => ({ a: look, b: look })   k 0 to 1 on ease ('io' default, 'in', 'out', 'lin' or a function of k);
//   a and b: { stage, t, cam: [x, y, zoom] (its own camera at t), toFrame([x, y], cam) (a world point on screen) } for
//   the earlier and the joining stage; j: { t, u (seconds into the join), dur }.
//   look: { x, y (px), scale, origin: [x, y] (px in the frame, for scale), opacity, clip (a CSS clip-path), filter,
//   cam: [x, y, zoom] (replaces that stage's camera for the frame), top (draw it in front; the joining stage is in front
//   otherwise) }. Everything is reset on each frame, so a look holds only while how returns it.
const EASES = { io: IO2, in: IN3, out: EX, lin: k => k };
const LOOK_KEYS = ['x', 'y', 'scale', 'origin', 'opacity', 'clip', 'filter', 'cam', 'top'];
const JOINS = {
  cut: { dur: 0, how: () => ({}) },
  push: { dur: PUSH.inDelay + PUSH.inDur, how: (k, a, b, j) => { const u = j.u * (PUSH.inDelay + PUSH.inDur) / j.dur;
    return { a: { x: -1960 * IN3(clamp(u / PUSH.out)) }, b: { x: 1960 * (1 - arr(u, PUSH.inDelay, PUSH.inDur)) } }; } },
};
const fx2 = v => (+v).toFixed(2);
// ---------- a stage: world (moved by the camera) + svg for connectors + fixed overlay ----------
const NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, parent, attrs = {}) { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; }
class Stage {
  // o: { name, from, to, pushIn, pushOut, cam: [[t, x, y, z], ...], titles: [[a, b, text]], label: [[t, text]], evid: [[t, text]], shots: [[t, name]],
  //      join: { stage, how, dur, ease } (above), sections: [[t, name], ...] }
  // sections: one stage that holds several segments on purpose (they share places); the shot sheet (render.js
  // motionsheet) gives each section its own sheet, named "stage · section", and render.js events lists each start.
  constructor(o) {
    o.name = o.name || 'Stage ' + (STAGES.length + 1);
    if (!o.cam || !o.cam.length) o.cam = [[o.from, 960, 540, 1]];
    checkCam(o.cam, o.name);
    // the Illustrative line is required on every segment (firm): default it; a card built on a stage sets card: true
    if (!o.card) {
      if (!o.label || !o.label.length) o.label = [[o.from, (typeof STORY !== 'undefined' && STORY.motionLabel) || 'Illustrative']];
      if (o.label[0][0] > o.from + .01) console.error(`stage "${o.name}": its Illustrative line starts at ${o.label[0][0]}, after the stage starts at ${o.from}`);
    }
    if (!STAGES.length && (typeof STORY === 'undefined' || !STORY.stagePalette)) console.error(`no STORY.stagePalette (${/sketch\.html$/.test(location.pathname) ? 'build/sketch.js' : 'story.js'}): stages use the Cloud Control sample colours; sample your product (lib/sample_colors.py)`);
    this.o = o; this.fns = [];
    this.root = el('div', P('stg')); for (const k in PAL) this.root.style.setProperty('--st-' + k, PAL[k]); this.root.style.zIndex = 4;
    this.world = el('div', P('world'), this.root);
    this.svg = svgEl('svg', this.world, { class: P('wsvg'), width: 8000, height: 6000 });
    this.ov = el('div', P('ov'), this.root);
    this.titles = (o.titles || []).map(([a, b, txt]) => [wordsEl(this.ov, txt, 't-title'), a, b]);
    const seqEls = (list, cls) => (list || []).map(([a, txt], i) => [el('div', P(cls), this.ov, txt), a, i + 1 < list.length ? list[i + 1][0] : Infinity]);
    this.labels = seqEls(o.label, 'ovl ovl-l'); this.evid = seqEls(o.evid, 'ovl ovl-r');
    // scheduled changes, for window.stageEvents(); each helper adds its own, and st.ev(t, what) adds one by hand
    this.events = [];
    if (o.join) this.joinTo(o.join);
    const J = this.J;
    this.ev(o.from, J ? `joins stage "${J.A.o.name}" (${J.label}${J.dur ? `, ${fx2(J.dur)} s` : ''})` : o.pushIn ? 'push in from the screen share' : 'stage starts (cut)');
    if (J && J.dur) this.ev(o.from + J.dur, `join from "${J.A.o.name}" ends`);
    this.endEv = this.events.length;  // a later stage that joins this one rewrites this event
    this.ev(o.pushOut ? o.to - .6 : o.to, o.pushOut ? 'push out to the screen share' : 'stage ends (cut)');
    o.cam.forEach((q, i) => { if (!i) return; const p = o.cam[i - 1]; this.ev(Math.max(p[0], q[0] - camDur(p, q)), `camera moves to key ${i}`); this.ev(q[0], `camera arrives at key ${i}`); });
    for (const [a, b, txt] of o.titles || []) { this.ev(a, `title in: ${short(txt)}`); this.ev(b, `title out: ${short(txt)}`); }
    evKeys(this, o.label, k => `Illustrative line: ${short(k[1])}`); evKeys(this, o.evid, k => k[1] ? `evidence line: ${short(k[1])}` : 'evidence line cleared');
    evKeys(this, o.shots, k => `shot: ${k[1]}`);
    (o.sections || []).forEach(([a, n], i, L) => {
      if (!(a >= o.from - .01 && a < o.to) || (i && !(a > L[i - 1][0]))) console.error(`stage "${o.name}": sections must be [[t, name], ...] in time order inside the stage (${fx2(o.from)} to ${fx2(o.to)} s); section ${i + 1} "${n}" is at ${a}`);
      this.ev(a, `section: ${n}`); });
    if (o.sections && o.sections.length && o.sections[0][0] > o.from + .01) console.error(`stage "${o.name}": its first section starts at ${o.sections[0][0]}, after the stage starts at ${o.from}; the time before it has no section name`);
    STAGES.push(this);
  }
  on(fn) { this.fns.push(fn); }
  ev(t, what) { this.events.push([t, what]); }
  end() { return this.o.pushOut ? this.o.to - .24 : this.o.to; }
  // a world point on screen at t (frame px), and back, with this stage's own camera
  toFrame(p, t) { const c = stageCam(this.o.cam, t); return [960 + (p[0] - c[0]) * c[2], 540 + (p[1] - c[1]) * c[2]]; }
  toWorld(p, t) { const c = stageCam(this.o.cam, t); return [c[0] + (p[0] - 960) / c[2], c[1] + (p[1] - 540) / c[2]]; }
  joinTo(j) {
    const o = this.o, A = typeof j.stage === 'string' ? STAGES.find(s => s.o.name === j.stage) : j.stage, own = typeof j.how === 'function';
    if (!(A instanceof Stage) || !STAGES.includes(A)) return console.error(`stage "${o.name}": join.stage must be an earlier stage (the Stage it made, or its name); ${A && A.o ? `"${A.o.name}"` : `"${j.stage}"`} is not one`);
    if (!own && !JOINS[j.how || 'cut']) return console.error(`stage "${o.name}": join.how must be 'cut', 'push' or a function (k, a, b, j) => ({ a: look, b: look }); any other way from one stage to the next is written for the concept (STAGE_ENGINE.md), not "${j.how}"`);
    if (A.joinedBy) return console.error(`stage "${o.name}": "${A.o.name}" is already joined by "${A.joinedBy.o.name}"; a stage hands over to one stage`);
    const built = own ? null : JOINS[j.how || 'cut'], ease = typeof j.ease === 'function' ? j.ease : EASES[j.ease || 'io'];
    if (built === JOINS.cut && j.dur) console.error(`stage "${o.name}": a cut has no duration (join.dur ${j.dur} is ignored); for an overlap use 'push' or a function`);
    const dur = built === JOINS.cut ? 0 : j.dur ?? (built ? built.dur : .8), end = o.from + dur;
    if (!ease) console.error(`stage "${o.name}": join.ease must be 'io', 'in', 'out', 'lin' or a function of k, not "${j.ease}"`);
    if (!(dur >= 0)) return console.error(`stage "${o.name}": join.dur must be 0 or more seconds, not ${j.dur}`);
    if (!(o.from >= A.o.from)) console.error(`stage "${o.name}" starts at ${fx2(o.from)}, before "${A.o.name}" starts at ${fx2(A.o.from)}`);
    if (A.J && A.o.from + A.J.dur > o.from) console.error(`stage "${o.name}" joins "${A.o.name}" at ${fx2(o.from)} while "${A.o.name}" is still joining the stage before it (until ${fx2(A.o.from + A.J.dur)}): start it later`);
    if (A.o.to < o.from - 1 / 30 || A.o.to > end + 1 / 30) console.error(`stage "${o.name}" joins "${A.o.name}" at ${fx2(o.from)} (${own ? 'own join' : j.how || 'cut'}${dur ? `, ${fx2(dur)} s` : ''}), but "${A.o.name}" has to ${fx2(A.o.to)}: it now draws until the join ends at ${fx2(end)}${A.o.to > end ? ', so what it shows after that is cut' : ''}. Set its to between ${fx2(o.from)} and ${fx2(end)}.`);
    if (A.o.pushOut) { console.error(`stage "${A.o.name}" pushes out to the screen share, but "${o.name}" joins it: its push out is dropped (remove pushOut)`); A.o.pushOut = false; }
    if (o.pushIn) { console.error(`stage "${o.name}" pushes in from the screen share and also joins "${A.o.name}": its push in is dropped (remove pushIn)`); o.pushIn = false; }
    A.o.to = end; A.joinedBy = this;
    const label = own ? 'own join' : j.how || 'cut';
    A.events[A.endEv] = [o.from, `hands over to stage "${o.name}" (${label}${dur ? `, ${fx2(dur)} s` : ''})`];
    this.J = { A, dur, ease: ease || IO2, how: own ? j.how : built.how, label, warned: false };
  }
  // the join's look for this frame, on both roots (draw() reset them first)
  joinLook(t) {
    const J = this.J, A = J.A, u = t - this.o.from, k = J.ease(clamp(J.dur ? u / J.dur : 1));
    const side = s => { const cam = stageCam(s.o.cam, t); return { stage: s, t, cam, toFrame: (p, c = cam) => [960 + (p[0] - c[0]) * c[2], 540 + (p[1] - c[1]) * c[2]] }; };
    const L = J.how(k, side(A), side(this), { t, u, dur: J.dur }) || {};
    for (const [s, l] of [[A, L.a], [this, L.b]]) {
      if (!l) continue;
      const bad = Object.keys(l).filter(x => !LOOK_KEYS.includes(x));
      if (bad.length && !J.warned) { J.warned = true; console.error(`stage "${this.o.name}": its join returned ${bad.join(', ')}, which a look does not take (${LOOK_KEYS.join(', ')})`); }
      const r = s.root.style;
      r.transform = `translate(${fx2(l.x || 0)}px, ${fx2(l.y || 0)}px)` + (l.scale != null ? ` scale(${(+l.scale).toFixed(5)})` : '');
      if (l.origin) r.transformOrigin = `${fx2(l.origin[0])}px ${fx2(l.origin[1])}px`;
      if (l.opacity != null) r.opacity = clamp(+l.opacity); if (l.clip) r.clipPath = l.clip; if (l.filter) r.filter = l.filter; if (l.top) r.zIndex = 5;
      if (l.cam) s.world.style.transform = camCss(l.cam);
    }
  }
  draw(t) {
    const vis = t >= this.o.from && t < this.end();
    this.root.style.display = vis ? 'block' : 'none'; if (!vis) return;  // display, not visibility: a child set visible would still show
    // a stage in a join: what a join's look may set is reset on every frame (a stage in no join never sets them)
    if (this.J || this.joinedBy) { const r = this.root.style; r.opacity = ''; r.clipPath = ''; r.filter = ''; r.transformOrigin = ''; r.zIndex = 4; }
    this.root.style.transform = `translateX(${stageShift(this, t).toFixed(2)}px)`;
    this.world.style.transform = camCss(stageCam(this.o.cam, t));
    for (const [e, a, b] of this.titles) wordsAt(e, t, a, b);
    // blur swap for the fixed lines: in 0.2 s from blur 6 px, out 0.15 s before the next one
    for (const [e, a, b] of [...this.labels, ...this.evid]) {
      const o = Math.min(clamp((t - a + .034) / .2), clamp((b - t) / .15));  // the new line starts one frame early, so no frame has none
      e.style.opacity = o; e.style.visibility = o > .001 ? 'visible' : 'hidden'; e.style.filter = o < 1 && o > 0 ? `blur(${((1 - o) * 6).toFixed(2)}px)` : 'none';
    }
    for (const f of this.fns) f(t);
    if (this.J && t < this.o.from + this.J.dur) this.joinLook(t);  // the earlier stage drew first (it was made first)
  }
}
scene(t => {
  // with stages, the template's background (gradient, grid, glows, vignette) gives way to the stage ground, so a push
  // slides one world; the title, agenda and close cards then sit on that ground too,
  // and their text takes the palette's colours, so a light ground stays readable
  if (MISSING.length) return;  // engine.js lacks springAt or track (the message at the top): nothing to draw with
  if (STAGES.length && typeof BG !== 'undefined' && BG.style.display !== 'none') { BG.style.display = 'none'; S.style.background = PAL.ground;
    el('style', '', document.head, `.t-h, .ag-row, .rc-item .tx, .disc b { color: ${PAL.ink} !important; } .t-sub, .disc, .foot, .rc-item .tx small { color: ${PAL.ink2} !important; } .t-kick, .ag-row .n { color: ${PAL.acc} !important; } .cta { color: ${PAL.ink} !important; border-color: ${PAL.acc} !important; background: ${rgba(PAL.acc, .1)} !important; }
      .cchip { color: ${PAL.ink2} !important; border-color: ${rgba(PAL.line, .5)} !important; background: ${rgba(PAL.ground, .88)} !important; } .cchip.on { color: ${PAL.ink} !important; border-color: ${PAL.acc} !important; background: ${mixc(PAL.ground, PAL.acc, .22)} !important; }`); }
  for (const s of STAGES) s.draw(t);
});
// the two corner lines (Illustrative bottom left, evidence bottom right) and the STORY.tags chips (top right, drawn over
// stages) are measured once after the fonts load; a pair on screen at the same time that collides prints one message
// with the stage, the time window and the size. It changes nothing: the fix is a writing or timing decision.
function checkCorners() {
  const GAP = 56, f2 = v => v.toFixed(2);  // 2 em of the 28 px corner type: closer, the two read as one line
  const both = (a1, b1, a2, b2, s) => [Math.max(a1, a2, s.o.from), Math.min(b1, b2, s.end())];
  for (const s of STAGES) {
    const d0 = s.root.style.display; s.root.style.display = 'block';  // layout only; the next frame sets it again
    const wd = e => e.textContent.trim() ? e.offsetWidth - 24 : 0;    // text width (the line has 12 px padding each side)
    for (const [l, la, lb] of s.labels) for (const [r, ra, rb] of s.evid) {
      const [a, b] = both(la, lb, ra, rb, s), wl = wd(l), wr = wd(r); if (!(b > a) || !wl || !wr) continue;
      const gap = 1920 - 2 * 96 - wl - wr;
      if (gap < GAP) console.error(`stage "${s.o.name}": the Illustrative line (${wl} px) and the evidence line (${wr} px) ${gap < 0 ? `overlap by ${-gap} px` : `are only ${gap} px apart (${GAP} px needed, or they read as one line)`} from ${f2(a)} to ${f2(b)} s: "${short(l.textContent)}" and "${short(r.textContent)}". Shorten one, move the evidence onto the object it backs for that shot, or time it to start after the Illustrative line changes.`);
    }
    if (typeof tagEls !== 'undefined') for (const [e, ta, tb] of s.titles) for (const [c, ca, cb] of tagEls) {
      const [a, b] = both(ta, tb, ca, cb, s); if (!(b > a) || !c.offsetWidth) continue;
      const right = 96 + Math.max(0, ...e._w.map(w => w.offsetLeft + w.offsetWidth)), bottom = 72 + e.offsetHeight;
      const cx = 1920 - 130 - c.offsetWidth, cb2 = 118 + c.offsetHeight;
      if (right > cx && bottom > 118 && 72 < cb2) console.error(`stage "${s.o.name}": its title "${short(e.textContent)}" runs under the STORY.tags chip "${short(c.textContent)}" by ${right - cx} px from ${f2(a)} to ${f2(b)} s. Shorten or break the title (a lone | is a line break), or time the chip after it.`);
    }
    s.root.style.display = d0;
  }
}
// ---------- a station: a flat box with a drawn border, its name, a sub-line and outcome lines ----------
// o: { x, y, w, h, name, sub, at, subAt, nameOut, react: [t...], dim: [[t, level]], lines: [[t, text, cls]], css, z, follow }
// x and y may be functions of t, and follow (above) carries it with something else; at(t) gives { x, y, w, h }
function box(st, o) {
  const b = el('div', P('box'), st.world), mov = isMoving(o), [x0, y0] = mov ? placeAt(o, o.at) : [o.x, o.y];
  b.style.cssText += `left:${x0}px;top:${y0}px;width:${o.w}px;height:${o.h}px;` + (o.css || '');
  const who = `box ${short(o.name || '')}`.trim(); checkZ(o.z, who); evZ(st, o.z, who); checkFollow(st, o.follow, who);
  st.ev(o.at, `${who} draws on`); if (o.sub) st.ev(o.subAt ?? o.at + .35, `${who} sub-line`); if (o.nameOut != null) st.ev(o.nameOut, `${who} name out`);
  evKeys(st, o.lines, k => `${who} line: ${short(k[1])}`); evKeys(st, (o.react || []).map(x => [x]), `${who} reacts`); evKeys(st, o.dim, k => `${who} level to ${k[1]}`);
  const fill = el('div', P('fill'), b);
  const sv = svgEl('svg', b, { width: o.w, height: o.h });
  const r = svgEl('rect', sv, { x: 1, y: 1, width: o.w - 2, height: o.h - 2, rx: 18, fill: 'none', 'stroke-width': 2, pathLength: 1, 'stroke-dasharray': '1 1' });
  const inner = el('div', P('boxin'), b);
  const nm = o.name ? wordsEl(inner, o.name, 'nm' + (o.nameCls ? ' ' + o.nameCls : '')) : null;
  const sub = o.sub ? maskEl(inner, o.sub, 'sub') : null;
  const lines = (o.lines || []).map(([a, txt, cls]) => [maskEl(inner, txt, 'oline ' + (cls || '')), a]);
  st.on(t => {
    setZ(b, o.z, t);
    if (!show(b, t >= o.at)) return;
    if (mov) place(b, o, t);
    // enter 'settle' (a hero card): drawn at once, settles from 104% on a no-overshoot spring; otherwise the border draws on
    const st8 = o.enter === 'settle', k = st8 ? 1 : mv(t, o.at, o.at + .5), [s0, c] = react(t, o.react);
    const s = s0 * (st8 ? 1.04 - .04 * springAt(t - o.at, 'heavy') : 1), d = levels(t, o.dim || []) * (st8 ? clamp((t - o.at) / .25) : 1);
    r.setAttribute('stroke-dashoffset', (1 - k).toFixed(4)); r.setAttribute('stroke', mixc(PAL.line, PAL.ink, c));
    fill.style.opacity = st8 ? 1 : arr(t, o.at + .1, .5);
    if (!show(b, d > .001)) return; b.style.opacity = d; b.style.transform = `scale(${s.toFixed(4)})`;
    if (nm) wordsAt(nm, t, o.at + .2, o.nameOut ?? Infinity);
    if (sub) maskAt(sub, t, o.subAt ?? o.at + .35);
    for (const [e, a] of lines) maskAt(e, t, a);
  });
  return Object.assign(b, { o, _who: who, at: t => { const [x, y] = placeAt(o, t); return { x, y, w: o.w, h: o.h }; } });
}
// free text on the world: kind 'words' (per-word reveal), 'mask' (mask rise) or 'fade'; dim keys like a box.
// x and y may be functions of t, and follow carries it (a label riding on a moving object); at(t) gives { x, y } (and w
// when o.w is set)
function wtext(st, o) {
  const e = o.kind === 'mask' ? maskEl(st.world, o.html, 'wt ' + (o.cls || '')) : o.kind === 'words' ? wordsEl(st.world, o.html, 'wt ' + (o.cls || '')) : el('div', P('wt ' + (o.cls || '')), st.world, o.html);
  const mov = isMoving(o), [x0, y0] = mov ? placeAt(o, o.at) : [o.x, o.y];
  e.style.left = x0 + 'px'; e.style.top = y0 + 'px'; if (o.w) e.style.width = o.w + 'px';
  const who = `text "${short(o.html)}"`; checkZ(o.z, who); evZ(st, o.z, who); checkFollow(st, o.follow, who);
  st.ev(o.at, `${who} in`); if (o.out != null) st.ev(o.out, `${who} out`); evKeys(st, o.dim, k => `${who} level to ${k[1]}`);
  st.on(t => {
    setZ(e, o.z, t); if (mov) place(e, o, t);
    const d = levels(t, o.dim || []) * (1 - lv(t, o.out ?? Infinity, .3));
    if (o.kind === 'mask') return maskAt(e, t, o.at, d);
    if (o.kind === 'words') { wordsAt(e, t, o.at, o.out ?? Infinity); e.style.opacity = levels(t, o.dim || []); return; }
    const k = arr(t, o.at, .5) * d; e.style.opacity = k; e.style.visibility = k > .001 ? 'visible' : 'hidden';
  });
  return Object.assign(e, { _who: who, at: t => { const [x, y] = placeAt(o, t); return o.w ? { x, y, w: o.w } : { x, y }; } });
}
// ---------- a connector: a polyline drawn on, a chevron at the receiving end, an accent pulse when the request moves ----------
function polyAt(pts, f) {
  const seg = []; let L = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(l); L += l; }
  let d = f * L;
  for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const k = seg[i] ? clamp(d / seg[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k)]; } d -= seg[i]; }
}
// o: { at, dur, pulses: [[t0, t1]], dim, head: true, z }
// Without z every wire is in one layer under everything on the stage (as before). With z (0 included) the wire gets its
// own layer where it is created, so it takes creation order and z like any other helper (a wire over a box).
// A point may be a function of t (an end that tracks a traveller: t => { const p = req.at(t); return [p.x, p.y + p.h / 2]; }).
// at(t) gives { x, y, pts }: where the pulse is (the first point when no pulse runs) and the points at t.
function wire(st, pts, o) {
  const g = svgEl('g', o.z == null ? st.svg : svgEl('svg', st.world, { class: P('wsvg'), width: 8000, height: 6000 }));
  checkZ(o.z, 'wire'); evZ(st, o.z, 'wire'); st.ev(o.at, 'wire draws on'); evKeys(st, o.dim, k => `wire level to ${k[1]}`);
  for (const [t0, t1] of o.pulses || []) { st.ev(t0, 'wire pulse leaves'); st.ev(t1, 'wire pulse arrives'); }
  const live = pts.some(q => typeof q === 'function'), ptsAt = t => live ? pts.map(q => val(q, t).map(v => +(+v).toFixed(2))) : pts;
  const headAt = P => { const [a, b] = [P[P.length - 2], P[P.length - 1]]; return `translate(${b[0]} ${b[1]}) rotate(${Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI})`; };
  const P0 = ptsAt(o.at), pathD = P => 'M' + P.map(q => q.join(' ')).join(' L');
  const p = svgEl('path', g, { d: pathD(P0), fill: 'none', stroke: PAL.line, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1' });
  const head = o.head === false ? null : svgEl('path', g, { d: 'M -14 -10 L 0 0 L -14 10', fill: 'none', stroke: PAL.line, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', transform: headAt(P0) });
  const dot = svgEl('circle', g, { r: 10, fill: PAL.acc });
  const dur = o.dur || .55;
  for (const [t0, t1] of o.pulses || []) if (!(t1 > t0)) console.error(`wire: a pulse from ${t0} to ${t1} never runs`);
  // the pulse at t: [opacity, [x, y]]
  const pulseAt = (t, P) => { let po = 0, pp = P[0]; for (const [t0, t1] of o.pulses || []) if (t >= t0 && t < t1 + .2) { pp = polyAt(P, mv(t, t0, t1)); po = 1 - clamp((t - t1) / .2); } return [po, pp]; };
  st.on(t => {
    if (o.z != null) setZ(g.parentNode, o.z, t);
    const k = mv(t, o.at, o.at + dur), d = levels(t, o.dim || []);
    g.style.visibility = t >= o.at && d > .001 ? 'visible' : 'hidden'; g.style.opacity = d;
    const P = ptsAt(t); if (live) { p.setAttribute('d', pathD(P)); if (head) head.setAttribute('transform', headAt(P)); }
    p.setAttribute('stroke-dashoffset', (1 - k).toFixed(4)); if (head) head.style.opacity = clamp((k - .85) / .15);
    const [po, pp] = pulseAt(t, P);
    dot.style.opacity = po; dot.setAttribute('cx', pp[0].toFixed(2)); dot.setAttribute('cy', pp[1].toFixed(2));
  });
  return Object.assign(g, { _who: 'wire', at: t => { const P = ptsAt(t), [, [x, y]] = pulseAt(t, P); return { x, y, pts: P }; } });
}
// ---------- the request (the traveller): one accent object that changes shape between states ----------
// Kinds of state (all sizes in world px):
//   card  { kind: 'card', w, h, html }               accent border, accent fill at 16%, ink text
//   code  { kind: 'code', w, h, head, lines: [...] } deep fill, accent border; head shows at once, lines type on
//   token { kind: 'token', w, h, html }              solid accent fill, dark text, pill radius
//   dot   { kind: 'dot', w, h }                      solid accent, a circle
//   art   { kind: 'art', w, h, svg }                 a line drawing (SVG markup in a w by h viewBox), no border or fill:
//                                                    a drawn traveller (a badge, a parcel, a letter) that can morph to
//                                                    and from the other kinds; shapes take art()'s defaults with the
//                                                    accent as stroke; it draws unclipped, and a change to or from it
//                                                    crossfades over 0.2 s (a drawing has no border to hide a gap)
// o: { born, enter: 'settle' | 'left' | 'cut', pos: [x, y] (top-left at birth), states: { name: state },
//      seq: [[t, name], ...] (first entry at born), moves: [[t0, t1, x, y], ...] (top-left targets, in-out),
//      type: { name: [t0, chars per s] }, hi: { name: [[t, line index or null], ...] }, ghost: [t, name], out, z,
//      ghosts: [[t, name, where, { level, out, z }], ...], path: t => [x, y], follow }
// path: the top-left as a function of t, in place of pos and moves (a curve, an orbit, hanging from a drawn part:
//   path: t => { const p = crane.at(t, 'hook'); return [p.x - 60, p.y]; }). follow (above) carries it with something
//   else from a time, on top of pos and moves or path. at(t) gives { x, y, w, h, state }: its top-left (with the 'left'
//   entrance slide, not the settle scale), its size and the state it shows at t.
// ghosts: faint copies of a state left behind from t (fading in over 0.5 s to level, default 0.5; out fades one away).
//   where is 'here' (default: where the traveller is at t), 'born' (its birth position) or [x, y] (a top-left). A copy
//   of an art state is that drawing in the line colour; any other kind is its rounded box in the line colour. A copy
//   stays after the traveller leaves, and sits behind it unless its z says otherwise. ghost: [t, name] is the older
//   form: one copy at 'born', shown only while the traveller is on screen.
const REQ_STYLE = k => ({
  card: { fill: [PAL.acc, .16], r: 16, b: 1 }, code: { fill: [PAL.deep, 1], r: 12, b: 1 }, token: { fill: [PAL.acc, 1], b: 1 },
  dot: { fill: [PAL.acc, 1], b: 1 }, art: { fill: [PAL.acc, 0], r: 0, b: 0 },
})[k];
const svgPal = svg => String(svg).replace(/var\(--st-(\w+)\)/g, (m, k) => PAL[k] || m);  // palette names in SVG, fixed at build
// a drawing copied in the line colour (a copy left behind): strokes and text take PAL.line; fills of ground, panel and
// deep are kept (they hide what is behind, as in the drawing) and any other fill takes the line colour too
function traceEl(parent, w, h, svg, before) {
  const d = document.createElement('div'); d.className = P('ghost-art'); parent.insertBefore(d, before || null);
  d.innerHTML = `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" overflow="visible">${svgPal(svg)}</svg>`;
  const keep = [PAL.ground, PAL.panel, PAL.deep].map(c => c.toLowerCase());
  d.querySelectorAll('svg *').forEach(q => {
    const s = q.getAttribute('stroke'); if (s && s !== 'none') q.setAttribute('stroke', PAL.line);
    const f = q.getAttribute('fill'); if (f && f !== 'none' && !keep.includes(f.toLowerCase())) q.setAttribute('fill', PAL.line); });
  d.querySelectorAll('path,line,polyline,polygon,rect,circle,ellipse').forEach(q => {
    if (!q.closest('[stroke]')) q.setAttribute('stroke', PAL.line); if (!q.closest('[stroke-width]')) q.setAttribute('stroke-width', 4);
    if (!q.closest('[fill]')) q.setAttribute('fill', 'none'); q.setAttribute('stroke-linecap', 'round'); q.setAttribute('stroke-linejoin', 'round'); });
  d.querySelectorAll('text').forEach(q => { if (!q.closest('[fill]')) q.setAttribute('fill', PAL.line); });
  return d;
}
// one left-behind copy's level at t: fades in over 0.5 s from t to level, out over 0.3 s from out
const ghostAt = (G, t) => G.level * arr(t, G.t, .5) * (1 - lv(t, G.out ?? Infinity, .3));
function request(st, o) {
  if (o.path != null && typeof o.path !== 'function') console.error('request: path must be a function of t that returns [x, y]');
  if (o.path == null && !Array.isArray(o.pos)) console.error('request: give pos: [x, y] (with moves), or path: t => [x, y]');
  if (typeof o.path === 'function' && o.moves && o.moves.length) console.error('request: it has both path and moves; path wins and moves are ignored');
  // top-left at t from pos and moves, or path, plus follow (the enter slide and the settle scale are not included)
  const posAt = t => { let x, y;
    if (typeof o.path === 'function') [x, y] = o.path(t);
    else { [x, y] = o.pos || [0, 0]; for (const [t0, t1, mx, my] of o.moves || []) { const k = mv(t, t0, t1); x = lerp(x, mx, k); y = lerp(y, my, k); } }
    if (o.follow) { const [fx, fy] = followBy(o.follow, t); x += fx; y += fy; } return [x, y]; };
  const enterDx = t => o.enter === 'left' ? -900 * (1 - arr(t, o.born, .8)) : 0;
  const size = n => { const s = o.states[n]; return [s.w, s.h, s.kind === 'token' || s.kind === 'dot' ? s.h / 2 : REQ_STYLE(s.kind).r]; };
  const gh = [...(o.ghost ? [[o.ghost[0], o.ghost[1], 'born', {}, true]] : []), ...(o.ghosts || [])].map(([gt, gn, where = 'here', go = {}, legacy = false]) => {
    const s = o.states[gn]; if (!s) { console.error(`request: ghost state "${gn}" is not in states`); return null; }
    const [gx, gy] = where === 'born' ? o.pos || posAt(o.born) : where === 'here' ? posAt(gt) : where, [gw, gHt, gr] = size(gn);
    const ge = s.kind === 'art' ? traceEl(st.world, s.w, s.h, s.svg) : el('div', P('ghost'), st.world);  // behind the request
    ge.style.cssText += `left:${gx}px;top:${gy}px;width:${gw}px;height:${gHt}px;` + (s.kind === 'art' ? '' : `border-radius:${gr}px;`);
    checkZ(go.z, 'traveller copy'); evZ(st, go.z, 'traveller copy');
    st.ev(gt, `traveller leaves a copy (${gn})`); if (go.out != null) st.ev(go.out, `traveller copy (${gn}) fades out`);
    return { e: ge, t: gt, level: go.level ?? .5, out: go.out, z: go.z, legacy };
  }).filter(Boolean);
  checkZ(o.z, 'traveller'); evZ(st, o.z, 'traveller'); checkFollow(st, o.follow, 'traveller');
  st.ev(o.born, `traveller enters (${o.seq[0][1]})`); if (o.out != null) st.ev(o.out, 'traveller leaves');
  o.seq.forEach(([k, n], j) => { if (j) st.ev(k, `traveller becomes ${n}`); });
  if (typeof o.path !== 'function') for (const [t0, t1] of o.moves || []) { st.ev(t0, 'traveller moves'); st.ev(t1, 'traveller arrives'); }
  for (const [n, ty] of Object.entries(o.type || {})) st.ev(ty[0], `traveller types on (${n})`);
  for (const [n, hk] of Object.entries(o.hi || {})) evKeys(st, hk, `traveller highlights lines (${n})`);
  const e = el('div', P('req'), st.world);
  const ea = el('div', P('req-art'), st.world);  // art states draw here, over the box: not clipped, not offset by its border
  const rc = {};
  for (const [n, s] of Object.entries(o.states)) {
    const c = el('div', P('rc rc-' + s.kind), s.kind === 'art' ? ea : e); c.style.width = s.w + 'px';
    if (s.kind === 'code') {
      if (s.head) el('div', P('code-h'), c, s.head);
      c._lines = s.lines.map(L => { const l = el('div', P('code-l'), c); l._ch = [...L].map(ch => { const sp = el('span', '', l); sp.textContent = ch; return sp; }); return l; });
    } else if (s.kind === 'art') {
      c.innerHTML = `<svg width="${s.w}" height="${s.h}" viewBox="0 0 ${s.w} ${s.h}" overflow="visible">${svgPal(s.svg)}</svg>`;
      // art()'s defaults, with the accent as the stroke: a stroke, width or fill set on the shape or a parent group is kept
      c.querySelectorAll('path,line,polyline,polygon,rect,circle,ellipse').forEach(q => {
        if (!q.closest('[stroke]')) q.setAttribute('stroke', PAL.acc); if (!q.closest('[stroke-width]')) q.setAttribute('stroke-width', 4);
        if (!q.closest('[fill]')) q.setAttribute('fill', 'none'); q.setAttribute('stroke-linecap', 'round'); q.setAttribute('stroke-linejoin', 'round'); });
    }
    else if (s.html) c.innerHTML = s.html;
    rc[n] = c;
  }
  const sizeKeys = o.seq.map(([k, n]) => [k, size(n)]);
  for (const [t0, t1] of o.moves || []) if (!(t1 > t0)) console.error(`request: a move from ${t0} to ${t1} never runs (two cue words too close?)`);
  for (let j = 1; j < o.seq.length; j++) if (!(o.seq[j][0] > o.seq[j - 1][0])) console.error(`request: seq times must increase (${o.seq[j][0]})`);
  // content alpha of seq entry j: a change to or from an art state crossfades over 0.2 s; other changes keep swapAlpha's timing
  const isArt = j => o.states[o.seq[j][1]].kind === 'art', xf = j => j > 0 && j < o.seq.length && (isArt(j - 1) || isArt(j));
  const alpha = (j, t) => {
    const a = o.seq[j][0] === o.born ? o.born - .08 : o.seq[j][0], b = j + 1 < o.seq.length ? o.seq[j + 1][0] : Infinity;
    return Math.min(xf(j) ? clamp((t - a) / .2) : clamp((t - a - .08) / .12), xf(j + 1) ? 1 - clamp((t - b) / .2) : clamp((b - .1 - t) / .1));
  };
  st.on(t => {
    const vis = !(t < o.born || (o.out != null && t > o.out + .3)); show(ea, vis);
    for (const G of gh) { setZ(G.e, G.z, t); const go = ghostAt(G, t); G.e.style.opacity = go; show(G.e, go > .001 && (vis || !G.legacy)); }
    setZ(e, o.z, t);
    if (!show(e, vis)) return;
    let i = 0; for (let j = 0; j < o.seq.length; j++) if (t >= o.seq[j][0]) i = j;
    const [w, h, r] = track(t, sizeKeys, 'base');
    // fill: each new state's fill blends in over 0.35 s (colour never springs)
    let f = REQ_STYLE(o.states[o.seq[0][1]].kind).fill.slice(), bo = REQ_STYLE(o.states[o.seq[0][1]].kind).b;
    for (let j = 1; j <= i; j++) { const g = REQ_STYLE(o.states[o.seq[j][1]].kind).fill, k = IO2(clamp((t - o.seq[j][0]) / .35)); f = [mixc(f[0], g[0], k), lerp(f[1], g[1], k)]; bo = lerp(bo, REQ_STYLE(o.states[o.seq[j][1]].kind).b, k); f[0] = f[0].startsWith('rgb') ? '#' + f[0].match(/\d+/g).map(v => (+v).toString(16).padStart(2, '0')).join('') : f[0]; }
    const [x, y] = posAt(t);
    let s = 1, op = 1, dx = 0;
    if (o.enter === 'settle') { s = 1.04 - .04 * springAt(t - o.born, 'heavy'); op = clamp((t - o.born) / .25); }
    else if (o.enter === 'left') dx = enterDx(t);
    if (o.out != null) op *= 1 - lv(t, o.out, .3);
    e.style.opacity = op; e.style.borderColor = rgba(PAL.acc, bo);
    e.style.width = w.toFixed(2) + 'px'; e.style.height = h.toFixed(2) + 'px'; e.style.borderRadius = r.toFixed(2) + 'px';
    e.style.background = rgba(f[0], f[1]);
    e.style.transform = `translate(${(x + dx).toFixed(2)}px, ${y.toFixed(2)}px) scale(${s.toFixed(4)})`;
    ea.style.cssText = `opacity:${op};width:${e.style.width};height:${e.style.height};transform:${e.style.transform};`; ea.style.zIndex = e.style.zIndex;
    for (const [n, c] of Object.entries(rc)) {
      const on = o.seq[i][1] === n, sa = Math.max(on ? alpha(i, t) : 0, i > 0 && o.seq[i - 1][1] === n ? alpha(i - 1, t) : 0);
      c.style.opacity = sa; c.style.visibility = sa > .001 ? 'visible' : 'hidden'; c.style.filter = sa > 0 && sa < 1 ? `blur(${((1 - sa) * 6).toFixed(2)}px)` : 'none';
      if (on && c._lines) {
        const ty = (o.type || {})[n], hk = (o.hi || {})[n] || [];
        let typed = ty ? Math.floor(Math.max(0, t - ty[0]) * ty[1]) : 1e9;
        const lit = (v, li) => v == null || v === li || (Array.isArray(v) && v.includes(li));
        c._lines.forEach((l, li) => {
          for (const sp of l._ch) { sp.style.opacity = typed > 0 ? 1 : 0; typed--; }
          l.style.opacity = levels(t, hk.map(([k, v]) => [k, lit(v, li) ? 1 : .35]));  // 0.3 s ramp, never a hard switch
        });
      }
    }
  });
  const stateAt = t => { let n = o.seq[0][1]; for (const [k, m] of o.seq) if (t >= k) n = m; return n; };
  return Object.assign(e, { _who: 'the traveller', at: t => { const [x, y] = posAt(t), [w, h] = track(t, sizeKeys, 'base'); return { x: x + enterDx(t), y, w, h, state: stateAt(t) }; } });
}
// shot sheet for render.js motionsheet: each shot just after it starts (+0.25 s) and at its middle; a stage with
// sections gives one sheet per section, titled "stage · section", with the shots inside it (the shot running when a
// section starts is repeated at the section's start when it runs on for 0.5 s or more)
const motionStatesBase = window.motionStates;
window.motionStates = () => { const base = motionStatesBase ? motionStatesBase() : []; let i = base.length; return [...base, ...STAGES.flatMap(s => {
  const sh = s.o.shots && s.o.shots.length ? s.o.shots : [[s.o.from, s.o.name]];  // no shots: one, the whole stage
  const states = (list, end) => { const out = []; list.forEach(([a, n], j) => { const b = j + 1 < list.length ? list[j + 1][0] : end; out.push([a + .25, n + ' · start'], [(a + b) / 2, n + ' · middle']); }); return out; };
  if (!s.o.sections || !s.o.sections.length) return [{ i: i++, title: s.o.name, from: s.o.from, to: s.o.to, states: states(sh, s.end()) }];
  return s.o.sections.map(([a, n], j, L) => {
    const last = j + 1 === L.length, b = last ? s.end() : L[j + 1][0], inside = sh.filter(([x]) => x >= a - .001 && x < b), before = sh.filter(([x]) => x < a - .001).pop();
    if (before && (inside.length ? inside[0][0] : b) - a >= .5) inside.unshift([a, before[1]]);
    if (!inside.length) inside.push([a, n]);
    return { i: i++, title: `${s.o.name} · ${n}`, from: a, to: last ? s.o.to : b, states: states(inside, b) };
  });
})]; };
// every scheduled change on every stage, for render.js events: [{ stage: name, t: seconds, what: short text }], sorted by
// t, only changes inside the stage's own time (a move, turn or slide gives its start and its landing)
window.stageEvents = () => STAGES.flatMap(s => s.events.filter(([t]) => Number.isFinite(t) && t >= s.o.from && t <= s.o.to)
  .map(([t, what]) => ({ stage: s.o.name, t, what }))).sort((a, b) => a.t - b.t);
// ---------- line art: an inline SVG drawing on the world whose strokes draw themselves on (a device, a door, a clock) ----------
// o: { x, y, w, h, svg: '<path d="..."/>...' in a viewBox of w x h, at, dur (default 0.8), stagger (0.06 per stroke),
//      dim: [[t, level]], react: [t...], out, parts: { id: ... } for children with id="id" }
// A part is either opacity keys [[t, level], ...] (a 0.3 s ramp at each key, starting from 1), or an object
//   { o: [[t, level]], start: 1, turn: [[t, degrees]], shift: [[t, dx, dy]], pivot: [x, y], dur: 0.6 }
// (start is the level before the first o key: 0 for a part that appears later)
// where turn and shift keys are ARRIVAL times like camera keys: the part starts moving dur seconds earlier and
// eases both ways (a clock hand swinging, a gate opening, a panel sliding shut). pivot is in the drawing's own
// coordinates (default 0, 0, so give it for a turn). Values hold before the first key.
// Strokes take PAL.draw (STORY.stagePalette.draw, or line when it is not set) unless they set their own stroke; give a
// part stroke="var(--st-acc)" only if it IS the travelling object. Fills fade in after the strokes. Draw objects a
// stranger recognises without a label.
// Depth and copies (optional): name (for render.js events), z (see zAt), front: ['id', ...] parts drawn again in a
// second copy in front (z one above the drawing's, or frontZ) while the drawing itself hides them, so a fence, a pocket
// or a door frame is written once and sits both behind and in front of a traveller; leave: [[t, where, { level, out,
// z }], ...] copies of the drawing as it is at t (parts posed at t, every stroke drawn) in the line colour, behind it,
// at where: 'here' (default, its own x, y) or [x, y]; they fade in over 0.5 s to level (0.5) and stay until out.
// Moving with something else (optional): the drawing's x and y may be functions of t, and follow (above) carries it. In
// a part, shift (t => [dx, dy]), turn (t => degrees) and o (t => level) may be functions of t instead of keys, and
// follow carries the part (its offset inside the drawing; a part of a drawing that moves too moves with both): a hook
// that takes a traveller across moves of any length is shift keys down to it, follow while it carries, keys up again
// (the keys after the follow add to where it was carried). at(t) gives { x, y, w, h } of the drawing; at(t, 'id',
// [x, y]) gives { x, y, deg }: where a point of that part (in its own coordinates, default 0, 0) is on the world at t
// (its shift, turn and follow; not the react scale).
function art(st, o) {
  const front = o.front || [], mov = isMoving(o), who = o.name || (mov ? 'a moving drawing' : `drawing at ${o.x},${o.y}`), [x0, y0] = mov ? placeAt(o, o.at) : [o.x, o.y];
  const parse = g => Object.entries(o.parts || {}).map(([id, keys]) => [g.querySelector('#' + id), Array.isArray(keys) ? { o: keys } : keys]).filter(p => p[0]);
  // one copy of the drawing; with front, the main copy hides those parts and a second one shows only them
  const make = isFront => {
    const g = svgEl('svg', st.world, { width: o.w, height: o.h, viewBox: `0 0 ${o.w} ${o.h}`, class: P('art') });
    g.style.left = x0 + 'px'; g.style.top = y0 + 'px';
    g.innerHTML = svgPal(o.svg);  // palette names become the job's hex values once, at build
    const strokes = [...g.querySelectorAll('path,line,polyline,polygon,rect,circle,ellipse')];
    // a shape with its own stroke-dasharray (a dashed outline) keeps it and fades in instead of drawing on; a stroke or
    // width set on the shape or a parent group is kept; everything else gets the drawing colour and draws on
    const inherits = (s, a) => { for (let n = s; n && n !== g; n = n.parentNode) if (n.getAttribute && n.getAttribute(a)) return true; return false; };
    strokes.forEach(s => { if (!inherits(s, 'stroke')) s.setAttribute('stroke', PAL.draw); if (!inherits(s, 'stroke-width')) s.setAttribute('stroke-width', 4);
      s._dash = !!s.getAttribute('stroke-dasharray');
      if (!s._dash) { s.setAttribute('pathLength', 1); s.setAttribute('stroke-dasharray', '1 1'); }
      s._fill = s.getAttribute('fill') || 'none'; if (s._fill === 'none' && !inherits(s, 'fill')) s.setAttribute('fill', 'none');
      s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); });
    const parts = parse(g);
    for (const [e] of parts) e._tf = e.getAttribute('transform') || '';  // a part's own transform is kept under turn and shift
    // visibility, not display: in the front copy the hidden root still lets its visible front parts show
    for (const id of front) { const f = g.querySelector('#' + id); if (f) f.style.visibility = isFront ? 'visible' : 'hidden'; }
    if (isFront) g.style.visibility = 'hidden';
    return { g, strokes, parts };
  };
  const main = make(false), copies = [main];
  if (Object.keys(o.parts || {}).length !== main.parts.length) console.error('art: a part id in parts was not found in the svg');
  const lost = front.filter(id => !main.g.querySelector('#' + id)); if (lost.length) console.error(`art: front id ${lost.join(', ')} was not found in the svg`);
  if (front.length) copies.push(make(true));
  // arrival-keyed value: holds the first key's value, then eases to each later key over dur, landing at its time
  const keyed = (t, keys, dur, n) => { let v = keys[0].slice(1, 1 + n);
    for (let i = 1; i < keys.length; i++) { const k = mv(t, keys[i][0] - dur, keys[i][0]); v = v.map((x, j) => lerp(x, keys[i][1 + j], k)); }
    return v; };
  // a part's [dx, dy, degrees] at t: its shift and turn (keys or functions of t) plus follow
  const partPose = (q, t) => { const d = q.dur ?? .6, [fx, fy] = followBy(q.follow, t);
    const [dx, dy] = typeof q.shift === 'function' ? q.shift(t) : q.shift ? keyed(t, q.shift, d, 2) : [0, 0], [deg] = typeof q.turn === 'function' ? [q.turn(t)] : q.turn ? keyed(t, q.turn, d, 1) : [0];
    return [dx + fx, dy + fy, deg]; };
  const pose = (e, q, t) => {
    if (q.o) e.style.opacity = typeof q.o === 'function' ? clamp(+q.o(t)) : levels(t, q.o, q.start ?? 1);
    if (q.turn || q.shift || q.follow) {
      const [dx, dy, deg] = partPose(q, t), [px, py] = q.pivot || [0, 0];
      e.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)}) rotate(${deg.toFixed(3)} ${px} ${py}) ${e._tf}`);
    }
  };
  const left = (o.leave || []).map(([lt, where = 'here', lo = {}]) => {
    const [lx, ly] = where === 'here' ? placeAt(o, lt) : where, d = traceEl(st.world, o.w, o.h, o.svg, main.g);  // behind the drawing
    d.style.cssText += `left:${lx}px;top:${ly}px;`;
    for (const [e, q] of parse(d)) { e._tf = e.getAttribute('transform') || ''; pose(e, q, lt); }  // posed as at lt, once
    checkZ(lo.z, `${who} copy`); evZ(st, lo.z, `${who} copy`); st.ev(lt, `${who} leaves a copy`); if (lo.out != null) st.ev(lo.out, `${who} copy fades out`);
    return { e: d, t: lt, level: lo.level ?? .5, out: lo.out, z: lo.z };
  });
  checkZ(o.z, who); evZ(st, o.z, who); checkZ(o.frontZ, who + ' front'); checkFollow(st, o.follow, who);
  st.ev(o.at, `${who} draws on`); if (o.out != null) st.ev(o.out, `${who} out`);
  evKeys(st, (o.react || []).map(x => [x]), `${who} reacts`); evKeys(st, o.dim, k => `${who} level to ${k[1]}`);
  for (const [id, q0] of Object.entries(o.parts || {})) { const q = Array.isArray(q0) ? { o: q0 } : q0, d = q.dur ?? .6;
    if (Array.isArray(q.o)) evKeys(st, q.o, k => `${who}: part ${id} to level ${k[1]}`);
    for (const [kk, verb] of [['turn', 'turns'], ['shift', 'slides']]) (Array.isArray(q[kk]) ? q[kk] : []).forEach((k, i) => { if (i) { st.ev(k[0] - d, `${who}: part ${id} ${verb}`); st.ev(k[0], `${who}: part ${id} lands`); } });
    checkFollow(st, q.follow, `${who}: part ${id}`); }
  const dur = o.dur ?? .8, stg = o.stagger ?? .06;
  st.on(t => {
    for (const L of left) { setZ(L.e, L.z, t); const lo = ghostAt(L, t); L.e.style.opacity = lo; show(L.e, lo > .001); }
    setZ(main.g, o.z, t); if (front.length) setZ(copies[1].g, o.frontZ != null ? o.frontZ : [[-Infinity, +(zAt(o.z, t) || 0) + 1]], t);
    const [s, c] = react(t, o.react), d = levels(t, o.dim || []) * (1 - lv(t, o.out ?? Infinity, .3));
    for (const { g, strokes, parts } of copies) {
      if (!show(g, t >= o.at && d > .001)) continue;
      if (mov) place(g, o, t);
      g.style.opacity = d; g.style.transform = `scale(${s.toFixed(4)})`;
      strokes.forEach((p, i) => { const k = mv(t, o.at + i * stg, o.at + i * stg + dur);
        if (p._dash) p.style.strokeOpacity = k; else p.setAttribute('stroke-dashoffset', (1 - k).toFixed(4));
        if (p._fill !== 'none') p.style.fillOpacity = arr(t, o.at + i * stg + dur * .6, .4); });
      for (const [e, q] of parts) pose(e, q, t);
    }
  });
  // at(t, part, point): a part's own transform is read once (from a scratch element, so the drawing is not touched)
  const own = {}, ownM = id => { if (own[id]) return own[id]; const e = main.g.querySelector('#' + id), g = document.createElementNS(NS, 'g'); g.setAttribute('transform', (e && e._tf) || '');
    let m = new DOMMatrix(); const L = g.transform.baseVal; for (let i = 0; i < L.numberOfItems; i++) m = m.multiply(DOMMatrix.fromMatrix(L.getItem(i).matrix)); return own[id] = m; };
  const told = new Set();
  return Object.assign(main.g, { _who: o.name || 'a drawing', at: (t, part, point) => {
    const [x, y] = placeAt(o, t); if (part == null) return { x, y, w: o.w, h: o.h };
    const q0 = (o.parts || {})[part];
    if (!q0 || !main.g.querySelector('#' + part)) { if (!told.has(part)) { told.add(part); console.error(`${who}: at(t, "${part}"): no part with that id in parts`); } return { x, y, deg: 0 }; }
    const q = Array.isArray(q0) ? { o: q0 } : q0, [dx, dy, deg] = partPose(q, t), [px, py] = q.pivot || [0, 0], [ux, uy] = point || [0, 0];
    const lp = ownM(part).transformPoint(new DOMPoint(ux, uy)), r = deg * Math.PI / 180, c = Math.cos(r), sn = Math.sin(r);
    return { x: x + dx + px + (lp.x - px) * c - (lp.y - py) * sn, y: y + dy + py + (lp.x - px) * sn + (lp.y - py) * c, deg }; } });
}
// ---------- styles (st- prefix; colours come from PAL through --st-* variables on each stage root) ----------
el('style', '', document.head, `
  .st-stg { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; overflow: hidden; display: none; background: var(--st-ground); color: var(--st-ink); font-family: var(--sans, "Inter", sans-serif); }
  .st-world { position: absolute; left: 0; top: 0; width: 1px; height: 1px; transform-origin: 0 0; }
  .st-wsvg, .st-box svg { position: absolute; left: 0; top: 0; overflow: visible; }
  .st-art { position: absolute; overflow: visible; transform-origin: 50% 50%; }
  .st-ov { position: absolute; inset: 0; }
  .st-wd { display: inline-block; }
  .st-mask { overflow: hidden; padding-bottom: .14em; margin-bottom: -.14em; }
  .st-mask > span { display: block; }
  .st-t-title { position: absolute; left: 96px; top: 72px; width: 1500px; font: 650 64px/1.1 var(--sans, "Inter", sans-serif); letter-spacing: -.03em; color: var(--st-ink); }
  .st-ovl { position: absolute; bottom: 46px; padding: 6px 12px; margin: 0 -12px; background: var(--st-ground); font: 500 28px/1.2 var(--sans, "Inter", sans-serif); color: var(--st-ink2); white-space: nowrap; }
  .st-ovl-l { left: 96px; } .st-ovl-r { right: 96px; text-align: right; }
  .st-box { position: absolute; transform-origin: 50% 50%; }
  .st-box .st-fill { position: absolute; inset: 0; border-radius: 18px; background: var(--st-panel); }
  .st-boxin { position: absolute; left: 0; top: 0; right: 0; padding: 40px 44px; }
  .st-nm { font: 650 52px/1.12 var(--sans, "Inter", sans-serif); letter-spacing: -.02em; color: var(--st-ink); }
  .st-nm.st-small { font-size: 44px; }
  .st-sub { margin-top: 14px; font: 500 40px/1.25 var(--sans, "Inter", sans-serif); color: var(--st-ink2); }
  .st-oline { margin-top: 18px; font: 600 40px/1.25 var(--sans, "Inter", sans-serif); color: var(--st-ink); }
  .st-ok { color: var(--st-ok) !important; } .st-fail { color: var(--st-fail) !important; }
  .st-mono { font-family: var(--mono, "IBM Plex Mono", monospace) !important; font-weight: 500 !important; letter-spacing: 0; }
  .st-wt { position: absolute; font: 500 40px/1.25 var(--sans, "Inter", sans-serif); color: var(--st-ink2); white-space: nowrap; }
  .st-wt.st-big { font: 650 52px/1.15 var(--sans, "Inter", sans-serif); color: var(--st-ink); letter-spacing: -.02em; }
  .st-req { position: absolute; left: 0; top: 0; border: 3px solid var(--st-acc); box-sizing: border-box; overflow: hidden; transform-origin: 50% 50%; }
  .st-ghost { position: absolute; border: 2px solid var(--st-line); box-sizing: border-box; }
  .st-ghost-art { position: absolute; }
  .st-rc { position: absolute; left: 0; top: 0; box-sizing: border-box; }
  .st-rc-card { padding: 36px 42px; font: 600 44px/1.2 var(--sans, "Inter", sans-serif); color: var(--st-ink); letter-spacing: -.015em; }
  .st-req-art { position: absolute; left: 0; top: 0; transform-origin: 50% 50%; }
  .st-rc-art { padding: 0; }
  body.st-words-off .st-wd, body.st-words-off .st-mask, body.st-words-off .st-wt, body.st-words-off .st-ovl,
  body.st-words-off .st-rc-card, body.st-words-off .st-rc-code, body.st-words-off .st-rc-token, body.st-words-off .st-t-title,
  body.st-words-off .st-stg text, body.st-words-off .st-words { visibility: hidden !important; }
  .st-rc-card small { display: block; margin-top: 14px; font: 500 40px/1.2 var(--sans, "Inter", sans-serif); color: var(--st-ink2); letter-spacing: 0; }
  .st-rc-token { padding: 0 40px; height: 100%; display: flex; align-items: center; gap: 22px; font: 500 40px var(--mono, "IBM Plex Mono", monospace); color: var(--st-tokink); white-space: nowrap; }
  .st-rc-token b { font: 650 40px var(--sans, "Inter", sans-serif); }
  .st-rc-code { padding: 30px 38px; font: 400 34px/1.5 var(--mono, "IBM Plex Mono", monospace); color: var(--st-ink); white-space: pre; }
  .st-code-h { color: var(--st-acc); font-weight: 500; margin-bottom: 8px; }
  .st-code-h i { font-style: normal; color: var(--st-ink2); font-family: var(--sans, "Inter", sans-serif); font-size: 34px; margin-left: 24px; }
  .st-code-l { min-height: 1.5em; }
`);
