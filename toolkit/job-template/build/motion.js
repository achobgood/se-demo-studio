// Illustrative motion segments: abstract scenes that stand in for steps the demo environment cannot show (L92).
// Driven by STORY.motion in story.js: [{ from, to, kicker, title, label, els: [...] }]. Each element:
//   { html, cls, x, y, w, h, at, out, moves: [[t, x, y], ...], hi: [[t0, t1], ...], done, grow, growSecs, origin }
// Classes in comp.html: mg-lane, mg-lane-h, mg-card (with <small> kicker), mg-req (request or code block),
// mg-chip (ok, fail, noop, ev), mg-arrow, mg-group, mg-group-h, mg-token, mg-note, mg-list.
// Abstract shapes only: lanes, cards, tokens and chips with plain-text product names. Never a product window, a
// logo, or a mock screen. Every segment shows a label (STORY.motionLabel, or the segment's own label) saying it is
// illustrative. While a segment is up, the screen-share frame fades out (scenes.js reads motionCover(t)).
// STORY.tags: [[from, to, text], ...] small chips at top right, for example "Customer question 1 of 3".
const MOT = (STORY.motion || []);
const MG_LABEL = STORY.motionLabel || 'Illustrative';
const MG = layer('mg'); MG.style.zIndex = 5;
const mgKick = el('div', 'abs mg-kick', MG); const mgTitle = el('div', 'abs mg-title', MG);
const mgLabel = el('div', 'abs mg-label', MG, MG_LABEL);
const mgSegs = MOT.map(m => {
  const root = el('div', 'abs', MG); root.style.cssText += 'left:0;top:0;width:1920px;height:1080px;';
  const els = m.els.map(d => {
    const e = el('div', 'abs ' + (d.cls || 'mg-card'), root, d.html || '');
    e.style.left = d.x + 'px'; e.style.top = d.y + 'px'; if (d.w) e.style.width = d.w + 'px'; if (d.h) e.style.height = d.h + 'px';
    if (d.grow) e.style.transformOrigin = d.origin || '0 50%';
    return [e, d];
  });
  return { m, root, els };
});
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
    for (const [e, d] of s.els) {
      const a = d.at ?? s.m.from + .3;
      let o = ramp(t, a, a + .45, E.out); if (d.out != null) o *= 1 - ramp(t, d.out, d.out + .4);
      if (o <= .001) { e.style.opacity = 0; e.style.visibility = 'hidden'; continue; }
      let x = d.x, y = d.y;
      if (d.moves) { const k = [[a, [d.x, d.y]], ...d.moves.map(([mt, mx, my]) => [mt, [mx, my]])]; [x, y] = kf(t, k, E.io); }
      const lift = d.moves ? 0 : lerp(14, 0, ramp(t, a, a + .5, E.out));
      let tf = `translate(${x - d.x}px, ${y - d.y + lift}px)`;
      if (d.grow) tf += ` scaleX(${ramp(t, a, a + (d.growSecs || .9), E.out)})`;
      e.style.opacity = o; e.style.visibility = 'visible'; e.style.transform = tf;
      const hi = (d.hi || []).some(([h0, h1]) => t >= h0 && t < h1); e.classList.toggle('hi', hi);
      if (d.done != null) e.classList.toggle('done', t >= d.done);
    }
  }
});

const TG = layer('tags'); TG.style.zIndex = 6; TG.style.opacity = 1;
const tagEls = (STORY.tags || []).map(([a, b, txt]) => { const e = el('div', 'abs mg-chip', TG, txt); e.style.cssText += 'right:130px;top:118px;border-color:rgba(127,180,255,.55);color:#cfe0ff;'; return [e, a, b]; });
scene(t => { for (const [e, a, b] of tagEls) set(e, env(t, a, b, .4, .4)); });
