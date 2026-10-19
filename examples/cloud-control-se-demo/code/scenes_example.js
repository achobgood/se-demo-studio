// Scenes for the virtual SE demo. Every time comes from the narration cues (build/cues.json) so picture follows the voice.
const SG = n => CUES.segments.find(s => s.name === n);
const S0 = n => SG(n).t0, S1 = n => SG(n).t1;
const W = (w, n = 1, seg = null, end = false) => {           // word cue, optionally within one segment
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let c = 0;
  for (const x of CUES.words) if ((!seg || x.seg === seg) && norm(x.w).startsWith(norm(w)) && ++c === n) return end ? x.e : x.t;
  throw new Error('cue not found: ' + w + ' ' + seg);
};
const TOTAL = CUES.total;
const T = {
  frameIn: S0('home') - 0.9, frameOut: S1('share') + 1.3, planIn: S0('plan') - 0.4,
  closeIn: S0('close') - 0.6,
};

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
  const inFrame = ramp(t, T.frameIn - .3, T.frameIn + .6) * (1 - ramp(t, T.frameOut - .4, T.frameOut + .6));
  glowA.style.opacity = .22 - .12 * inFrame; glowB.style.opacity = .16 - .08 * inFrame;
});

// ---------- 1. Title card with disclosure ----------
const TI = layer();
const tiKick = el('div', 'abs t-kick', TI, 'Virtual SE demo'); tiKick.style.cssText += 'left:200px;top:300px;';
const tiH = el('div', 'abs t-h', TI, 'Cisco Cloud Control'); tiH.style.cssText += 'left:196px;top:350px;font-size:118px;';
const tiRule = el('div', 'abs rule', TI); tiRule.style.cssText += 'left:200px;top:505px;width:560px;';
const tiSub = el('div', 'abs t-sub', TI, 'Following one incident at the Mexico City campus through to the handoff');
tiSub.style.cssText += 'left:200px;top:536px;width:1300px;';
const tiDisc = el('div', 'abs disc', TI, '<b>About this video.</b> A virtual systems engineer demo with an AI-generated voice. The SE is not a real person.<br>Recorded in a Cisco dCloud demo environment with fictional data (PseudoCo). Not official Cisco marketing.');
tiDisc.style.cssText += 'left:200px;top:800px;width:1500px;padding:22px 0 0;border-top:1px solid rgba(160,190,255,.16);';
scene(t => {
  const o = env(t, 0, T.planIn + .2, .6, .6); TI.style.opacity = o; if (o <= 0) return;
  const a = ramp(t, .2, 1.4, E.outx); set(tiKick, ramp(t, .1, .9), `translateY(${lerp(10, 0, a)}px)`);
  set(tiH, a, `translateY(${lerp(24, 0, a)}px)`); tiH.style.letterSpacing = lerp(-.01, -.035, a) + 'em';
  set(tiRule, ramp(t, .8, 1.6), `scaleX(${ramp(t, .8, 1.9, E.out)})`); tiRule.style.transformOrigin = '0 0';
  set(tiSub, ramp(t, 1.2, 2.0), `translateY(${lerp(12, 0, ramp(t, 1.2, 2.0, E.out))}px)`);
  set(tiDisc, ramp(t, 1.8, 2.6));
});

// ---------- 2. Agenda card (one card, items light up as the SE names them) ----------
const AG = layer();
const agKick = el('div', 'abs t-kick', AG, 'Today'); agKick.style.cssText += 'left:200px;top:210px;';
const agH = el('div', 'abs t-h', AG, 'The plan for today'); agH.style.cssText += 'left:198px;top:258px;font-size:72px;';
const AGI = [['Start in one place', W('start', 1, 'plan')], ['Triage the action', W('triage', 1, 'plan')],
  ['Investigate with AI', W('investigate', 1, 'plan')], ['Verify at the source', W('check', 1, 'plan')], ['Hand off', W('hand', 1, 'plan')]];
const agRows = AGI.map(([txt], i) => { const r = el('div', 'ag-row', AG, `<span class="n">0${i + 1}</span><span>${txt}</span>`); r.style.left = '200px'; r.style.top = (430 + i * 92) + 'px'; return r; });
const agNote = el('div', 'abs disc', AG, 'Demo company: PseudoCo, fictional. Site: Mexico City campus.'); agNote.style.cssText += 'left:200px;top:930px;';
scene(t => {
  const o = env(t, T.planIn, T.frameIn + .3, .6, .7); AG.style.opacity = o; if (o <= 0) return;
  set(agKick, ramp(t, T.planIn, T.planIn + .6)); set(agH, ramp(t, T.planIn + .1, T.planIn + .8), `translateY(${lerp(16, 0, ramp(t, T.planIn + .1, T.planIn + .9, E.out))}px)`);
  agRows.forEach((r, i) => {
    const a = ramp(t, T.planIn + .4 + i * .12, T.planIn + 1.0 + i * .12, E.out);
    const on = ramp(t, AGI[i][1] - .15, AGI[i][1] + .25);
    r.style.opacity = a * lerp(.38, 1, on); r.style.visibility = a > 0 ? 'visible' : 'hidden';
    r.style.transform = `translateX(${lerp(-14, 0, a) + 10 * on * (1 - ramp(t, AGI[i][1] + .25, AGI[i][1] + 1.2))}px)`;
  });
  set(agNote, ramp(t, T.planIn + 1.2, T.planIn + 1.9));
});

// ---------- 3. The screen share: real product footage in a slim browser frame ----------
const FT = layer();
const Wt = (w, seg, n = 1) => W(w, n, seg);
const F = new Frame(FT, 'cloud.cisco.com/home/assistant', 1720);
F.clip('t6'); F.clip('t7');
const chipbar = el('div', 'chipbar', FT);
const CHAP = ['Start in one place', 'Triage the action', 'Investigate with AI', 'Verify at the source', 'Hand off'];
const chips = CHAP.map((c, i) => el('div', 'cchip', chipbar, `${i + 1} · ${c}`));
const CH_AT = [T.frameIn, S0('actions'), S0('ask'), S0('te'), S0('handoff')];
const foot = el('div', 'foot', FT, 'Real product UI · Cisco dCloud demo, fictional data');
const lower = el('div', 'lower', FT, 'Virtual SE demo · AI-generated voice');
const rampChip = el('div', 'ramp', FT, '');
const RAMPS = FOOT.t6.ramps.map(r => [r[0], r[1], r[2]]);
const T7_CUT = FOOT.t7.t0; // t6 (main walkthrough) hands off to t7 (light-theme re-record of the tail) here
const SHOTS = [[T.frameIn, T7_CUT, 't6'], [T7_CUT, T.frameOut + 1, 't7']];
const CK = [...FOOT.t6.clicks, ...FOOT.t7.clicks].sort((a, b) => a - b); // timeline times of recorded clicks, both takes
const nextClick = (t) => CK.find(c => c >= t - .05);
// t7's recorded clicks in order: ThousandEyes tab, alert row, Canvas tab (back), canvas row, Generate summary, report Close, Share
const [T7_te, T7_alert, T7_canvasTab, T7_canvasRow, T7_gensum, T7_reportClose, T7_shareClick] = FOOT.t7.clicks;
const URLS = [ // [from, url]
  [T.frameIn, 'cloud.cisco.com/home/assistant'], [nextClick(S0('actions')), 'cloud.cisco.com/home/actions'],
  [nextClick(Wt('collaborate', 'canvas') - .6) + .8, 'cloud.cisco.com/home/canvas/boards'],
  [nextClick(Wt('click', 'te') - .6) + 1.2, 'app.thousandeyes.com/dashboard'], [nextClick(S0('path')) + 1.0, 'app.thousandeyes.com/network-app-synthetics/views'],
  [nextClick(S0('handoff')) + 1.0, 'cloud.cisco.com/home/canvas/boards'],
];
const CAM = [
  [T.frameIn, 960, 540, 1], [Wt('across', 'home') - .3, 960, 540, 1], [Wt('across', 'home') + .9, 820, 110, 1.55],
  [Wt('tabs', 'home') + .4, 1000, 110, 1.55], [S0('home2') - .2, 960, 540, 1], [Wt('top', 'home2') - .2, 1150, 520, 1.25],
  [Wt('box', 'home2') - .1, 1150, 700, 1.4], [S1('home2') + .2, 1150, 700, 1.4], [S0('actions') + .3, 960, 540, 1],
  [Wt('search', 'actions') - .6, 960, 540, 1], [Wt('search', 'actions') + .4, 330, 300, 1.7], [Wt('open', 'found') - .2, 330, 380, 1.7],
  [Wt('open', 'found') + .9, 1250, 520, 1.15], [S1('wait1') + .5, 1250, 520, 1.15], [S0('related') + .3, 960, 540, 1],
  [S0('related') + 1.3, 1200, 420, 1.4], [S1('related') + 1.5, 1200, 440, 1.4], [S0('analysis') + .6, 1250, 560, 1.15], [S1('analysis') + .5, 1250, 560, 1.15],
  [S0('ask') + .6, 1250, 600, 1.2], [S0('ask') + 1.8, 1250, 800, 1.7], [S0('ask') + 8.4, 1250, 800, 1.7], [S0('ask') + 9.4, 1250, 560, 1.12],
  [S0('answer') - .4, 1250, 560, 1.12], [S0('answer') + .6, 1250, 520, 1.3], [S1('answer') + .5, 1250, 560, 1.3],
  [S0('canvas') + .2, 960, 540, 1], [Wt('collaborate', 'canvas') - .8, 1450, 150, 1.5], [Wt('collaborate', 'canvas') + .8, 1450, 150, 1.5],
  [Wt('collaborate', 'canvas') + 2.0, 960, 540, 1], [S0('mode') + .3, 960, 540, 1], [S0('mode') + 1.4, 360, 820, 1.65],
  [S1('mode') + 3.0, 360, 800, 1.65], [S0('q1') + 1.2, 960, 540, 1], [S1('q1') - 2.5, 960, 540, 1], [S1('q1'), 400, 520, 1.3],
  [Wt('card', 'result') - .4, 400, 520, 1.3], [Wt('card', 'result') + .8, 900, 560, 1.12], [S1('result') - .6, 900, 560, 1.12],
  [S0('verify') + .4, 320, 960, 2.1], [S1('verify') + .4, 320, 960, 2.1], [S0('te') - .2, 960, 540, 1], [nextClick(Wt('click', 'te') - .6) + .6, 960, 540, 1],
  [nextClick(Wt('click', 'te') - .6) + 1.8, 960, 540, 1], [Wt('active', 'te') - .3, 960, 540, 1], [Wt('active', 'te') + .6, 760, 470, 1.45],
  [S0('path') + .9, 760, 470, 1.45], [S0('path') + 2.0, 960, 540, 1], [Math.max(S0('path') + 3.0, Wt('chart', 'path') - .2), 1150, 300, 1.35],
  [Math.max(S0('path') + 5.0, Wt('path', 'path', 1) - .2), 1150, 320, 1.35], [Math.max(S0('path') + 6.0, Wt('path', 'path', 1) + .8), 1100, 760, 1.4], [S1('path') + .2, 1100, 760, 1.4],
  [S0('q2') + 1.5, 960, 540, 1], [S1('q2') + .6, 960, 540, 1], [S0('handoff') + .2, 1450, 90, 1.5], [nextClick(S0('handoff')) + .5, 1450, 90, 1.5],
  [nextClick(S0('handoff')) + 1.4, 960, 540, 1], [T7_gensum - 1.4, 1640, 600, 1.55], [T7_gensum + .3, 1640, 600, 1.55],
  [T7_gensum + 1.8, 960, 565, 1.18], [S1('handoff') + .3, 960, 565, 1.18],
  [S0('share') - .2, 960, 565, 1.18], [T7_reportClose + .3, 960, 565, 1.05], [T7_shareClick - .8, 1560, 170, 1.6],
  [T7_shareClick + .6, 1560, 170, 1.6], [S1('share') + .5, 1560, 170, 1.45], [T.frameOut, 960, 565, 1.05],
];
for (let i = 1; i < CAM.length; i++) if (CAM[i][0] < CAM[i - 1][0]) console.error('CAM out of order at ' + i + ': ' + CAM[i - 1][0].toFixed(2) + ' > ' + CAM[i][0].toFixed(2));
function camAt(t) {
  let i = CAM.findIndex(k => k[0] > t); if (i < 0) return CAM[CAM.length - 1].slice(1); if (i === 0) return CAM[0].slice(1);
  const a = CAM[i - 1], b = CAM[i]; const k = E.sio(clamp((t - a[0]) / (b[0] - a[0])));
  return [lerp(a[1], b[1], k), lerp(a[2], b[2], k), lerp(a[3], b[3], k)];
}
scene(t => {
  const o = env(t, T.frameIn, T.frameOut, .7, .7); FT.style.opacity = o; if (o <= 0) return;
  const shot = SHOTS.find(s => t >= s[0] && t < s[1]) || SHOTS[SHOTS.length - 1];
  const url = URLS.filter(u => t >= u[0]).pop()[1]; if (F._url !== url) { F.setUrl(url); F._url = url; }
  F.only(shot[2]); F.play(shot[2], t, true);
  const [cx, cy, cz] = camAt(t); F.camera(cx, cy, cz);
  const e = ramp(t, T.frameIn, T.frameIn + .9, E.out), x = ramp(t, T.frameOut - .8, T.frameOut, E.in);
  placeFrame(F, 1, 960, 541 + lerp(40, 0, e) + 30 * x, lerp(.94, 1, e) * lerp(1, .95, x));
  const ci = CH_AT.filter(c => t >= c).length - 1;
  chips.forEach((c, i) => c.classList.toggle('on', i === ci));
  set(chipbar, ramp(t, T.frameIn + .5, T.frameIn + 1.2)); set(foot, ramp(t, T.frameIn + .7, T.frameIn + 1.4));
  set(lower, env(t, T.frameIn + 1.2, T.frameIn + 7.5, .4, .5));
  const r = RAMPS.find(r => t >= r[0] - .2 && t < r[1] + .3);
  if (r) { rampChip.textContent = r[2]; set(rampChip, env(t, r[0] - .2, r[1] + .3, .25, .3)); } else set(rampChip, 0);
});

// ---------- 4. Value recap (short, one card) ----------
const VR = layer();
const vrKick = el('div', 'abs t-kick', VR, 'Where the value comes from'); vrKick.style.cssText += 'left:250px;top:250px;';
const VITEMS = [
  ['Starts from the Cisco products you already run', 'Each product keeps its own console and specialized control', W('builds', 1, 'value')],
  ['Each connected product adds context', 'Data, tools, or actions from one more domain', W('every', 1, 'value')],
  ['Included at no additional cost*', 'with eligible Cisco subscriptions', W('included', 1, 'cost')],
];
const vrRows = VITEMS.map(([a, b], i) => { const r = el('div', 'rc-item', VR, `<div class="ic"></div><div class="tx">${a}<small>${b}</small></div>`); r.style.top = (340 + i * 150) + 'px'; return r; });
const vrFine = el('div', 'abs disc', VR, '*Generally available for customers managing US-based infrastructure. Included with eligible Cisco Essential and Advantage subscriptions; Cisco may change this.');
vrFine.style.cssText += 'left:250px;top:850px;width:1420px;font-size:20px;';
scene(t => {
  const a0 = T.frameOut - .3, a1 = T.closeIn + .3;
  const o = env(t, a0, a1, .6, .6); VR.style.opacity = o; if (o <= 0) return;
  set(vrKick, ramp(t, a0 + .2, a0 + .8));
  vrRows.forEach((r, i) => { const k = ramp(t, VITEMS[i][2] - .3, VITEMS[i][2] + .4, E.out); set(r, k, `translateY(${lerp(18, 0, k)}px)`); });
  set(vrFine, ramp(t, VITEMS[2][2] + .4, VITEMS[2][2] + 1.1));
});

// ---------- 5. Close ----------
const CL = layer();
const clH = el('div', 'abs t-h', CL, 'Cisco Cloud Control'); clH.style.cssText += 'left:0;width:1920px;text-align:center;top:330px;font-size:112px;';
const clSub = el('div', 'abs t-sub', CL, 'Built on the Cisco products you already run'); clSub.style.cssText += 'left:0;width:1920px;text-align:center;top:488px;';
const clCta = el('div', 'abs', CL, 'Learn more at <b style="color:#fff;font-weight:600">cisco.com</b>');
clCta.style.cssText += 'left:960px;top:590px;padding:16px 32px;border-radius:999px;border:1.5px solid rgba(96,165,250,.6);background:rgba(59,130,246,.10);font:500 30px var(--sans);color:#d6e6ff;white-space:nowrap;';
const clFine = el('div', 'abs disc', CL, 'Generally available for customers managing US-based infrastructure. Included at no additional cost with eligible Cisco Essential and Advantage subscriptions; Cisco may change this.<br>Capabilities depend on connected products, subscriptions, permissions, and region. AI responses can be wrong; verify them.<br>Virtual SE demo with an AI-generated voice, recorded in a Cisco dCloud demo environment with fictional data. Not official Cisco marketing.');
clFine.style.cssText += 'left:160px;width:1600px;text-align:center;top:850px;font-size:19px;line-height:1.6;';
scene(t => {
  const o = env(t, T.closeIn, TOTAL + 1, .8, .1); CL.style.opacity = o * (1 - ramp(t, TOTAL - 1.2, TOTAL)); if (o <= 0) return;
  const a = ramp(t, T.closeIn + .1, T.closeIn + 1.1, E.outx); set(clH, a, `translateY(${lerp(22, 0, a)}px)`);
  set(clSub, ramp(t, T.closeIn + .6, T.closeIn + 1.3));
  const c = ramp(t, W('account', 1, 'close') - .3, W('account', 1, 'close') + .4, E.out); set(clCta, c, `translateX(-50%) translateY(${lerp(14, 0, c)}px)`);
  set(clFine, ramp(t, T.closeIn + 1.5, T.closeIn + 2.3));
});
