// Deterministic timeline engine: every visual is a pure function of time t (seconds).
const FPS = 30, DUR = CUES.total || 90;
const S = document.getElementById('stage');
const CLIPS = "../assets/clips/", STILLS = "../assets/captures/";
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const E = {
  lin: k => k,
  io: k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2,
  sio: k => -(Math.cos(Math.PI * k) - 1) / 2,
  out: k => 1 - Math.pow(1 - k, 3),
  outx: k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k),
  in: k => k * k * k,
  back: k => { const c = 1.70158, c3 = c + 1; return 1 + c3 * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
};
const ramp = (t, a, b, e = E.io) => e(clamp((t - a) / (b - a)));
function kf(t, keys, e = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
      const k = e(clamp((t - t0) / (t1 - t0)));
      return Array.isArray(v0) ? v0.map((x, j) => lerp(x, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}
const env = (t, a, b, fi = .35, fo = .35) => Math.min(ramp(t, a, a + fi), 1 - ramp(t, b - fo, b));
const WORDS = CUES.words;
function at(w, n = 1, end = false) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let c = 0;
  for (const x of WORDS) if (norm(x.w) === norm(w) && ++c === n) return end ? x.e : x.t;
  throw new Error('cue not found: ' + w + ' #' + n);
}
const seg = name => CUES.segments.find(s => s.name === name);
function el(tag, cls, parent = S, html = '') {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  parent.appendChild(e);
  return e;
}
function layer(cls = '') { return el('div', 'layer ' + cls); }
function set(e, o = 1, tf = '') { e.style.opacity = o; e.style.transform = tf; e.style.visibility = o <= 0.001 ? 'hidden' : 'visible'; }
const PENDING = [];

// ---------- Browser frame showing real captured product pixels ----------
class Frame {
  constructor(parent, url, w = 1600) {
    this.w = w; this.k = w / 1920;
    this.root = el('div', 'frame', parent); this.root.style.width = w + 'px';
    this.bar = el('div', 'bar', this.root, '<i></i><i></i><i></i><div class="url"></div>');
    this.urlEl = this.bar.querySelector('.url'); this.setUrl(url);
    this.vp = el('div', 'vp', this.root); this.vp.style.width = w + 'px'; this.vp.style.height = (w * 9 / 16) + 'px';
    this.cam = el('div', 'cam', this.vp);
    this.imgs = {};
    this.ov = el('div', '', this.vp); this.ov.style.cssText = 'position:absolute;inset:0;';
    this.cursor = el('div', 'cursor', this.vp,
      '<svg viewBox="0 0 28 28" width="28" height="28"><path d="M4 2 L4 22 L9.5 17 L13 25 L16.6 23.4 L13.2 16 L21 16 Z" fill="#0b1222" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>');
    this.cx = 960; this.cy = 540; this.s = 1;
  }
  setUrl(u) { const i = u.indexOf('/'); this.urlEl.innerHTML = i < 0 ? '<b>' + u + '</b>' : '<b>' + u.slice(0, i) + '</b>' + u.slice(i); }
  still(name, file) { const i = el('img', '', this.cam); i.src = STILLS + file; i.decoding = 'sync'; this.imgs[name] = i; return i; }
  clip(name) { const i = el('img', '', this.cam); i.dataset.clip = name; this.imgs[name] = i; i._cur = ''; return i; }
  camera(x, y, s) {
    s = Math.max(1, s);
    const hw = 960 / s, hh = 540 / s;
    x = clamp(x, hw, 1920 - hw); y = clamp(y, hh, 1080 - hh);
    this.cx = x; this.cy = y; this.s = s;
    this.cam.style.transform = `scale(${this.k}) translate(${960 - x * s}px, ${540 - y * s}px) scale(${s})`;
  }
  map(x, y) { return [this.k * (960 + (x - this.cx) * this.s), this.k * (540 + (y - this.cy) * this.s)]; }
  only(name) { for (const [k, i] of Object.entries(this.imgs)) i.style.opacity = k === name ? 1 : 0; }
  mix(a, b, k) { for (const [n, i] of Object.entries(this.imgs)) i.style.opacity = n === a ? 1 : n === b ? k : 0; }
  // show footage clip frame for absolute time t; draws the recorded cursor
  play(name, t, cursor = true) {
    const i = this.imgs[name], m = FOOT[name];
    const f = clamp(Math.floor((t - m.t0) * FPS), 0, m.n - 1);
    const src = `${CLIPS}${name}/f_${String(f + 1).padStart(5, '0')}.jpg`;
    if (i._cur !== src) { i.src = src; i._cur = src; PENDING.push(i); }
    const p = m.cursor[f];
    if (cursor && p) {
      const down = m.clicks.some(c => t >= c - .05 && t < c + .12);
      this.cursorAt(p[0], p[1], 1, down);
    } else this.cursor.style.opacity = 0;
  }
  cursorAt(x, y, o, down = false) {
    const [px, py] = this.map(x, y);
    this.cursor.style.opacity = o;
    this.cursor.style.transform = `translate(${px - 4}px, ${py - 2}px) scale(${down ? .84 : 1})`;
  }
}

// ---------- Callout: ring around a viewport box plus a label ----------
class Callout {
  constructor(frame, label, box, opts = {}) {
    this.f = frame; this.box = box; this.o = opts;
    this.ring = el('div', 'ring' + (opts.amber ? ' amber' : ''), frame.ov);
    this.tag = label ? el('div', 'tag', frame.ov, label) : null;
  }
  draw(t, a, b) {
    const o = env(t, a, b, .3, .3);
    const pop = E.back(ramp(t, a, a + .45, E.lin));
    const pad = (this.o.pad ?? 10);
    const [x0, y0] = this.f.map(this.box.x - pad, this.box.y - pad);
    const [x1, y1] = this.f.map(this.box.x + this.box.w + pad, this.box.y + this.box.h + pad);
    const r = this.ring;
    r.style.left = x0 + 'px'; r.style.top = y0 + 'px'; r.style.width = (x1 - x0) + 'px'; r.style.height = (y1 - y0) + 'px';
    r.style.opacity = this.o.noring ? 0 : o; r.style.transform = `scale(${lerp(1.08, 1, pop)})`;
    if (this.tag) {
      const side = this.o.side || 'below', g = 16;
      let tx, ty, tr = '';
      if (side === 'below') { tx = x0; ty = y1 + g; }
      else if (side === 'below-right') { tx = x1; ty = y1 + g; tr = 'translateX(-100%)'; }
      else if (side === 'above') { tx = x0; ty = y0 - g; tr = 'translateY(-100%)'; }
      else if (side === 'above-right') { tx = x1; ty = y0 - g; tr = 'translate(-100%, -100%)'; }
      else if (side === 'right') { tx = x1 + g; ty = (y0 + y1) / 2; tr = 'translateY(-50%)'; }
      else if (side === 'left') { tx = x0 - g; ty = (y0 + y1) / 2; tr = 'translate(-100%, -50%)'; }
      this.tag.style.left = tx + 'px'; this.tag.style.top = ty + 'px';
      this.tag.style.opacity = o;
      this.tag.style.transform = `${tr} translateY(${lerp(12, 0, E.out(ramp(t, a, a + .4, E.lin)))}px)`;
    }
  }
}

function placeFrame(f, o, x, y, sc = 1, ry = 0, rx = 0) {
  const h = f.w * 9 / 16 + 36;
  f.root.style.opacity = o;
  f.root.style.visibility = o <= .001 ? 'hidden' : 'visible';
  f.root.style.transform = `translate(${x - f.w / 2}px, ${y - h / 2}px) perspective(2600px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${sc})`;
}

const SCENES = [];
function scene(fn) { SCENES.push(fn); }
async function renderAt(t) {
  PENDING.length = 0;
  for (const fn of SCENES) fn(t);
  await Promise.all(PENDING.map(i => (i.complete && i.naturalWidth) ? i.decode().catch(() => {}) : new Promise(r => { i.onload = () => i.decode().then(r, r); i.onerror = r; })));
  return true;
}
window.renderAt = renderAt;
window.ready = async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].filter(i => i.src).map(i => i.decode().catch(() => {})));
  return true;
};
const q = new URLSearchParams(location.search).get('t'); if (q) window.ready().then(() => renderAt(+q));

// ---------- Cue helpers for story.js and scenes.js ----------
const SG = n => { const s = CUES.segments.find(s => s.name === n); if (!s) throw new Error('segment not found: ' + n); return s; };
const S0 = n => SG(n).t0, S1 = n => SG(n).t1;
// time of the n-th word starting with `w`, optionally inside one segment
const W = (w, seg = null, n = 1, end = false) => {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let c = 0;
  for (const x of CUES.words) if ((!seg || x.seg === seg) && norm(x.w).startsWith(norm(w)) && ++c === n) return end ? x.e : x.t;
  throw new Error('cue not found: ' + w + ' in ' + seg);
};
const TOTAL = CUES.total;
