// Generic scenes driven by build/story.js. Every visual is a pure function of time t, keyed to the narration.
const FR = STORY.frame, AGD = STORY.agenda, VAL = STORY.value, CLS = STORY.close;
const firstAfterTitle = AGD ? AGD.from : FR.in;
const valueFrom = FR.out - .3, valueTo = CLS.from + .3;

// ---------- Background ----------
const BG = layer(); BG.style.opacity = 1;
el('div', 'stagebg', BG);
const bgGrid = el('div', 'grid', BG); bgGrid.style.opacity = .28;
const glowA = el('div', 'glow', BG); glowA.style.cssText += 'width:1000px;height:1000px;background:#1d4ed8;';
const glowB = el('div', 'glow', BG); glowB.style.cssText += 'width:800px;height:800px;background:#0e7490;';
el('div', 'vignette', BG);
scene(t => {
  bgGrid.style.transform = `translate(${-(t * 4) % 80}px, ${-(t * 2) % 80}px)`;
  glowA.style.transform = `translate(${-100 + Math.sin(t * .07) * 140}px, ${-300 + Math.cos(t * .05) * 90}px)`;
  glowB.style.transform = `translate(${1300 + Math.cos(t * .06) * 120}px, ${450 + Math.sin(t * .08) * 80}px)`;
  const inFrame = ramp(t, FR.in - .3, FR.in + .6) * (1 - ramp(t, FR.out - .4, FR.out + .6));
  glowA.style.opacity = .22 - .12 * inFrame; glowB.style.opacity = .16 - .08 * inFrame;
});

// ---------- 1. Title card with disclosure ----------
const TI = layer(), TS = STORY.title;
const tiKick = el('div', 'abs t-kick', TI, TS.kicker); tiKick.style.cssText += 'left:200px;top:300px;';
const tiH = el('div', 'abs t-h', TI, TS.heading); tiH.style.cssText += 'left:196px;top:350px;font-size:118px;';
const tiRule = el('div', 'abs rule', TI); tiRule.style.cssText += 'left:200px;top:505px;width:560px;';
const tiSub = el('div', 'abs t-sub', TI, TS.sub); tiSub.style.cssText += 'left:200px;top:536px;width:1300px;';
const tiDisc = el('div', 'abs disc', TI, TS.disclosure);
tiDisc.style.cssText += 'left:200px;top:800px;width:1500px;padding:22px 0 0;border-top:1px solid rgba(160,190,255,.16);';
scene(t => {
  const o = env(t, 0, firstAfterTitle + .2, .6, .6); TI.style.opacity = o; if (o <= 0) return;
  const a = ramp(t, .2, 1.4, E.outx); set(tiKick, ramp(t, .1, .9), `translateY(${lerp(10, 0, a)}px)`);
  set(tiH, a, `translateY(${lerp(24, 0, a)}px)`); tiH.style.letterSpacing = lerp(-.01, -.035, a) + 'em';
  set(tiRule, ramp(t, .8, 1.6), `scaleX(${ramp(t, .8, 1.9, E.out)})`); tiRule.style.transformOrigin = '0 0';
  set(tiSub, ramp(t, 1.2, 2.0), `translateY(${lerp(12, 0, ramp(t, 1.2, 2.0, E.out))}px)`);
  set(tiDisc, ramp(t, 1.8, 2.6));
});

// ---------- 2. Agenda (optional) ----------
if (AGD) {
  const AG = layer(), a0 = AGD.from;
  const agKick = el('div', 'abs t-kick', AG, AGD.kicker); agKick.style.cssText += 'left:200px;top:210px;';
  const agH = el('div', 'abs t-h', AG, AGD.heading); agH.style.cssText += 'left:198px;top:258px;font-size:72px;';
  const rows = AGD.items.map(([txt], i) => { const r = el('div', 'ag-row', AG, `<span class="n">0${i + 1}</span><span>${txt}</span>`); r.style.left = '200px'; r.style.top = (430 + i * 92) + 'px'; return r; });
  const note = el('div', 'abs disc', AG, AGD.note || ''); note.style.cssText += 'left:200px;top:930px;';
  scene(t => {
    const o = env(t, a0, FR.in + .3, .6, .7); AG.style.opacity = o; if (o <= 0) return;
    set(agKick, ramp(t, a0, a0 + .6)); set(agH, ramp(t, a0 + .1, a0 + .8), `translateY(${lerp(16, 0, ramp(t, a0 + .1, a0 + .9, E.out))}px)`);
    rows.forEach((r, i) => {
      const at = AGD.items[i][1]; const a = ramp(t, a0 + .4 + i * .12, a0 + 1.0 + i * .12, E.out); const on = ramp(t, at - .15, at + .25);
      r.style.opacity = a * lerp(.38, 1, on); r.style.visibility = a > 0 ? 'visible' : 'hidden';
      r.style.transform = `translateX(${lerp(-14, 0, a) + 10 * on * (1 - ramp(t, at + .25, at + 1.2))}px)`;
    });
    set(note, ramp(t, a0 + 1.2, a0 + 1.9));
  });
}

// ---------- 3. The screen share ----------
const FT = layer();
const F = new Frame(FT, FR.urls[0][1], FR.width || 1720);
[...new Set(FR.shots.map(s => s[2]))].forEach(c => { if (!FOOT[c]) throw new Error('clip not built: ' + c + ' (run lib/build_clips.py)'); F.clip(c); });
const chipbar = el('div', 'chipbar', FT);
const chips = FR.chapters.map(([c], i) => el('div', 'cchip', chipbar, `${i + 1} · ${c}`));
const foot = el('div', 'foot', FT, FR.footer || '');
const lower = el('div', 'lower', FT, FR.lower || ''); if (!FR.lower) lower.style.display = 'none';
const rampChip = el('div', 'ramp', FT, '');
const RAMPS = [].concat(...Object.values(FOOT).map(m => m.ramps || [])).filter((r, i, a) => a.findIndex(x => x[0] === r[0]) === i);
const CAM = FR.camera;
for (let i = 1; i < CAM.length; i++) if (CAM[i][0] < CAM[i - 1][0]) console.error('camera keys out of order at ' + i + ': ' + CAM[i - 1][0].toFixed(2) + ' > ' + CAM[i][0].toFixed(2));
// Frame.camera clamps the center so the zoomed view never leaves the capture; a target nearer the edge than
// 960/zoom (x) or 540/zoom (y) is moved inward without a word, so say which keys that happens to
CAM.forEach(([t, x, y, z], i) => { const s = Math.max(1, z), hw = 960 / s, hh = 540 / s;
  const cx = clamp(x, hw, 1920 - hw), cy = clamp(y, hh, 1080 - hh);
  if (s > 1 && (cx !== x || cy !== y)) console.error('camera key ' + i + ' at ' + t.toFixed(2) + ': (' + x + ', ' + y + ') at zoom ' + z + ' is clamped to (' + Math.round(cx) + ', ' + Math.round(cy) + '); it will not center there'); });
function camAt(t) {
  let i = CAM.findIndex(k => k[0] > t); if (i < 0) return CAM[CAM.length - 1].slice(1); if (i === 0) return CAM[0].slice(1);
  const a = CAM[i - 1], b = CAM[i]; const k = E.sio(clamp((t - a[0]) / (b[0] - a[0])));
  return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
}
scene(t => {
  const o = env(t, FR.in, FR.out, .7, .7); FT.style.opacity = o; if (o <= 0) return;
  const shot = FR.shots.find(s => t >= s[0] && t < s[1]) || FR.shots[FR.shots.length - 1];
  const url = (FR.urls.filter(u => t >= u[0]).pop() || FR.urls[0])[1]; if (F._url !== url) { F.setUrl(url); F._url = url; }
  F.only(shot[2]); F.play(shot[2], t, true);
  const [cx, cy, cz] = camAt(t); F.camera(cx, cy, cz);
  const e = ramp(t, FR.in, FR.in + .9, E.out), x = ramp(t, FR.out - .8, FR.out, E.in);
  placeFrame(F, 1, 960, 541 + lerp(40, 0, e) + 30 * x, lerp(.94, 1, e) * lerp(1, .95, x));
  const ci = FR.chapters.filter(c => t >= c[1]).length - 1;
  chips.forEach((c, i) => c.classList.toggle('on', i === ci));
  set(chipbar, ramp(t, FR.in + .5, FR.in + 1.2)); set(foot, ramp(t, FR.in + .7, FR.in + 1.4));
  if (FR.lower) set(lower, env(t, FR.in + 1.2, FR.in + 7.5, .4, .5));
  const r = RAMPS.find(r => t >= r[0] - .2 && t < r[1] + .3);
  if (r) { rampChip.textContent = r[2]; set(rampChip, env(t, r[0] - .2, r[1] + .3, .25, .3)); } else set(rampChip, 0);
});

// ---------- 4. Value recap (optional) ----------
if (VAL) {
  const VR = layer();
  const kick = el('div', 'abs t-kick', VR, VAL.kicker); kick.style.cssText += 'left:250px;top:250px;';
  const rows = VAL.items.map(([a, b], i) => { const r = el('div', 'rc-item', VR, `<div class="ic"></div><div class="tx">${a}<small>${b || ''}</small></div>`); r.style.top = (340 + i * 150) + 'px'; return r; });
  const fine = el('div', 'abs disc', VR, VAL.fine || ''); fine.style.cssText += 'left:250px;top:850px;width:1420px;font-size:20px;';
  scene(t => {
    const o = env(t, valueFrom, valueTo, .6, .6); VR.style.opacity = o; if (o <= 0) return;
    set(kick, ramp(t, valueFrom + .2, valueFrom + .8));
    rows.forEach((r, i) => { const at = VAL.items[i][2]; const k = ramp(t, at - .3, at + .4, E.out); set(r, k, `translateY(${lerp(18, 0, k)}px)`); });
    const last = VAL.items[VAL.items.length - 1][2]; set(fine, ramp(t, last + .4, last + 1.1));
  });
}

// ---------- 5. Close ----------
const CL = layer();
const clH = el('div', 'abs t-h', CL, CLS.heading); clH.style.cssText += 'left:0;width:1920px;text-align:center;top:330px;font-size:112px;';
const clSub = el('div', 'abs t-sub', CL, CLS.sub); clSub.style.cssText += 'left:0;width:1920px;text-align:center;top:488px;';
const clCta = el('div', 'abs', CL, CLS.cta || '');
clCta.style.cssText += 'left:960px;top:590px;padding:16px 32px;border-radius:999px;border:1.5px solid rgba(96,165,250,.6);background:rgba(59,130,246,.10);font:500 30px var(--sans);color:#d6e6ff;white-space:nowrap;';
if (!CLS.cta) clCta.style.display = 'none';
const clFine = el('div', 'abs disc', CL, CLS.fine || '');
clFine.style.cssText += 'left:160px;width:1600px;text-align:center;top:850px;font-size:19px;line-height:1.6;';
scene(t => {
  const o = env(t, CLS.from, TOTAL + 1, .8, .1); CL.style.opacity = o * (1 - ramp(t, TOTAL - 1.2, TOTAL)); if (o <= 0) return;
  const a = ramp(t, CLS.from + .1, CLS.from + 1.1, E.outx); set(clH, a, `translateY(${lerp(22, 0, a)}px)`);
  set(clSub, ramp(t, CLS.from + .6, CLS.from + 1.3));
  const at = CLS.cta_at || CLS.from + 1.5; const c = ramp(t, at - .3, at + .4, E.out); set(clCta, c, `translateX(-50%) translateY(${lerp(14, 0, c)}px)`);
  set(clFine, ramp(t, CLS.from + 1.5, CLS.from + 2.3));
});
