// Illustrative motion segments: abstract scenes that stand in for steps the demo environment cannot show (L92).
// Driven by STORY.motion in story.js: [{ from, to, kicker, title, label, els: [...] }]. Each element:
//   { html, cls, x, y, w, h, at, out, moves: [[t, x, y], ...], hi: [[t0, t1], ...], done, grow, growSecs, origin,
//     spring, swap: [[t, html], ...], sfx }
// spring: 'ui' (chips, toggles; tiny overshoot), 'base' (default: cards, containers, moves) or 'heavy' (big type,
//   large cards; no overshoot). Entry and moves run on it. A moves key time is when the element arrives; the move
//   starts one spring settle time earlier (never before the previous key).
// swap: content changes inside the same element. The old text is gone before t, the new text fades in just after t
//   behind a short blur (swapAlpha, so they never overlap), and a box without a fixed w or h springs to the new size.
// sfx: 'whoosh', 'tick' or 'pop' at the element's entry (whoosh also on each move). render.js motioncues writes
//   build/motion_cues.json and lib/sfx_events.py merges it, well under the voice.
// No will-change and no CSS transitions on anything here: every frame is set from t alone.
// Classes in comp.html: mg-lane, mg-lane-h, mg-card (with <small> kicker), mg-req (request or code block),
// mg-chip (ok, fail, noop, ev), mg-arrow, mg-group, mg-group-h, mg-token, mg-note, mg-list.
// Abstract shapes only: lanes, cards, tokens and chips with plain-text product names. Never a product window, a
// logo, or a mock screen. Every segment shows a label (STORY.motionLabel, or the segment's own label) saying it is
// illustrative. While a segment is up, the screen-share frame fades out (scenes.js reads motionCover(t)).
// STORY.tags: [[from, to, text], ...] small chips at top right, for example "Customer question 1 of 3".
const MOT = (STORY.motion || []);
const MG_LABEL = STORY.motionLabel || 'Illustrative';
const MG_SFX = { whoosh: .25, tick: .3, pop: .3 };  // cue gains for motion sounds, well under the voice
const MG = layer('mg'); MG.style.zIndex = 5;
const mgKick = el('div', 'abs mg-kick', MG); const mgTitle = el('div', 'abs mg-title', MG);
const mgLabel = el('div', 'abs mg-label', MG, MG_LABEL);
const mgSegs = MOT.map(m => {
  const root = el('div', 'abs', MG); root.style.cssText += 'left:0;top:0;width:1920px;height:1080px;';
  const els = m.els.map(d => {
    const e = el('div', 'abs ' + (d.cls || 'mg-card'), root, d.swap ? '' : d.html || '');
    e.style.left = d.x + 'px'; e.style.top = d.y + 'px'; if (d.w) e.style.width = d.w + 'px'; if (d.h) e.style.height = d.h + 'px';
    if (d.grow) e.style.transformOrigin = d.origin || '0 50%';
    if (d.swap) { e._c = el('div', '', e, d.html || ''); if (!d.w || !d.h) e.style.overflow = 'hidden'; }
    if (d.sfx && !MG_SFX[d.sfx]) console.error('motion element sfx must be whoosh, tick or pop: ' + d.sfx);
    const a = d.at ?? m.from + .3, sp = d.spring || 'base';
    // moves keys hold arrival times; each spring starts one settle time before, never before the previous arrival
    const mk = [[a, [d.x, d.y]]]; let prev = a;
    for (const [mt, mx, my] of d.moves || []) { mk.push([Math.max(prev, mt - springSecs(sp)), [mx, my]]); prev = mt; }
    return [e, d, { a, sp, mk }];
  });
  return { m, root, els };
});
// natural content size of each swap state (initial html, then each swap), measured once fonts are in and the segment shows
function swapSizes(e, d) {
  const cs = getComputedStyle(e), px = k => parseFloat(cs[k]) || 0;
  const padW = px('paddingLeft') + px('paddingRight') + px('borderLeftWidth') + px('borderRightWidth');
  const padH = px('paddingTop') + px('paddingBottom') + px('borderTopWidth') + px('borderBottomWidth');
  if (!d.w) e.style.width = ''; if (!d.h) e.style.height = ''; e._c.style.width = '';
  const out = [d.html || '', ...d.swap.map(s => s[1])].map(h => { e._c.innerHTML = h; return [e.offsetWidth - padW, e.offsetHeight - padH]; });
  e._i = -1; return out;
}
function motionCover(t) { let o = 0; for (const m of MOT) o = Math.max(o, env(t, m.from, m.to, .55, .55)); return o; }
window.motionCover = motionCover;
scene(t => {
  const cov = motionCover(t); MG.style.opacity = cov; MG.style.visibility = cov <= .001 ? 'hidden' : 'visible'; if (cov <= 0) return;
  const cur = MOT.find(m => t >= m.from - .6 && t < m.to + .6) || MOT[0];
  if (mgTitle._m !== cur) { mgKick.innerHTML = cur.kicker || ''; mgTitle.innerHTML = cur.title || ''; mgLabel.innerHTML = cur.label || MG_LABEL; mgTitle._m = cur; }
  set(mgKick, ramp(t, cur.from, cur.from + .6)); set(mgTitle, ramp(t, cur.from + .1, cur.from + .8), `translateY(${lerp(12, 0, ramp(t, cur.from + .1, cur.from + .9, E.out))}px)`);
  set(mgLabel, ramp(t, cur.from + .2, cur.from + .9));
  for (const s of mgSegs) {
    const on = s.m === cur; s.root.style.display = on ? 'block' : 'none'; if (!on) continue;
    for (const [e, d, { a, sp, mk }] of s.els) {
      const en = springAt(t - a, sp);
      let o = clamp(en); if (d.out != null) o *= 1 - ramp(t, d.out, d.out + .4);
      if (o <= .001) { e.style.opacity = 0; e.style.visibility = 'hidden'; continue; }
      let x = d.x, y = d.y;
      if (d.moves) [x, y] = track(t, mk, sp);
      const lift = d.moves ? 0 : 14 * (1 - en);
      let tf = `translate(${x - d.x}px, ${y - d.y + lift}px)`;
      if (d.grow) tf += ` scaleX(${d.growSecs ? ramp(t, a, a + d.growSecs, E.out) : clamp(en)})`;
      if (d.swap) {
        if (!e._sz) e._sz = swapSizes(e, d);
        const ks = d.swap.map(w => w[0]), i = ks.filter(k => t >= k).length;
        if (e._i !== i) { e._c.innerHTML = i ? d.swap[i - 1][1] : d.html || ''; e._i = i; }
        const sa = swapAlpha(t, i ? ks[i - 1] : -Infinity, i < ks.length ? ks[i] : Infinity);
        e._c.style.opacity = sa; e._c.style.filter = sa < 1 ? `blur(${((1 - sa) * 6).toFixed(2)}px)` : 'none';
        e._c.style.width = e._sz[i][0] + 'px';  // text keeps its final wrap while the box springs around it
        const [w, h] = track(t, [[a, e._sz[0]], ...ks.map((k, j) => [k, e._sz[j + 1]])], sp);
        if (!d.w) e.style.width = w + 'px'; if (!d.h) e.style.height = h + 'px';
      }
      e.style.opacity = o; e.style.visibility = 'visible'; e.style.transform = tf;
      const hi = (d.hi || []).some(([h0, h1]) => t >= h0 && t < h1); e.classList.toggle('hi', hi);
      if (d.done != null) e.classList.toggle('done', t >= d.done);
    }
  }
});
// Sound cues for render.js motioncues: [[type, t, gain], ...] from each element's sfx field
window.motionCues = () => {
  const out = [];
  for (const s of mgSegs) for (const [, d, { a, mk }] of s.els) {
    if (!MG_SFX[d.sfx]) continue;
    out.push([d.sfx, a, MG_SFX[d.sfx]]);
    if (d.sfx === 'whoosh') mk.forEach(([k, p], i) => { if (i && (p[0] !== mk[i - 1][1][0] || p[1] !== mk[i - 1][1][1])) out.push(['whoosh', k, MG_SFX.whoosh]); });
  }
  return out.sort((p, q) => p[1] - q[1]).map(([n, t, g]) => [n, +t.toFixed(3), g]);
};
// States for render.js motionsheet: per segment, each element settled after entry (at + 0.6), after each swap
// (t + 0.6) and at each moves key; times closer than 0.05 s are merged
window.motionStates = () => mgSegs.map((s, i) => {
  const name = (cls, html) => ((cls || 'mg-card').split(' ')[0].replace('mg-', '') + ' ' +
    (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 26)).trim();
  const st = [];
  for (const [, d, { a }] of s.els) {
    const ks = (d.swap || []).map(w => w[0]), before = (t, i) => i < ks.length ? Math.min(t, ks[i] - .25) : t;  // never inside a swap gap
    st.push([before(a + .6, 0), name(d.cls, d.html) + ' in']);
    (d.swap || []).forEach(([k, h], i) => st.push([before(k + .6, i + 1), name(d.cls, h) + ' swap']));
    for (const [k] of d.moves || []) st.push([k, name(d.cls, d.html) + ' move']);
  }
  const lo = s.m.from + .05, hi = s.m.to - .05, states = [];
  for (const [t, l] of st.map(([t, l]) => [clamp(t, lo, hi), l]).sort((p, q) => p[0] - q[0])) {
    const last = states[states.length - 1];
    if (last && t - last[0] < .05) last[1] += ' · ' + l; else states.push([t, l]);
  }
  for (const x of states) if (x[0] > s.m.to - .55) x[1] = '(segment fading out) ' + x[1];
  return { i, title: s.m.title || '', from: s.m.from, to: s.m.to, states };
});

const TG = layer('tags'); TG.style.zIndex = 6; TG.style.opacity = 1;
const tagEls = (STORY.tags || []).map(([a, b, txt]) => { const e = el('div', 'abs mg-chip', TG, txt); e.style.cssText += 'right:130px;top:118px;border-color:rgba(127,180,255,.55);color:#cfe0ff;'; return [e, a, b]; });
scene(t => { for (const [e, a, b] of tagEls) set(e, env(t, a, b, .4, .4)); });
