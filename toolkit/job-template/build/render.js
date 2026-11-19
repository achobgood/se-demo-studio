// Render the deterministic timeline in headless Chrome (installed Google Chrome, channel 'chrome').
// usage: node build/render.js stills review/stills 3 42.5 118   (check frames at chosen seconds)
//        node build/render.js video out/part.mp4 30 FROM_FRAME TO_FRAME   (build/render_par.sh calls this)
//        node build/render.js motionsheet review/motion   (one tile per motion element state, review/motion/<segment index>.jpg)
//        node build/render.js strip review/strip 84.3 [n=12] [fps=30]   (n consecutive frames around a fast move, tiled)
//        node build/render.js same review/same 12.5 80.2   (renders each time twice with others between and compares pixels
//            and page state: SAME; RASTER NOISE, state identical and only edge pixels differ, exit 0 with a crop to look at;
//            DIFFERENT, exit 1, naming the element and property that changed)
//        node build/render.js state review/state 12.5 80.2   (the page state at each time, t_<time>_state.json, to compare by hand)
//        node build/render.js events review/events [--stage name] [--every 0.5] [--burst -0.2,0,0.2]   (frames just before,
//            at and just after every stage event plus one every 0.5 s, as contact sheets per shot of at most 20 cells)
//        node build/render.js motioncues   (writes build/motion_cues.json from STORY.motion sfx fields)
// Flags, anywhere on the line: --sketch renders build/sketch.html (stages without footage: the signature moment for the
// storyboard; literal times before the voice take, and W(), S0(), S1() once build/cues.json exists); --words-off hides
// every word in #stage (the words-off check) and prints WORDS LEFT for any text that still shows; --blind (on with
// --words-off) labels contact sheets with times only (no segment, shot or event names, events sheets named sheet_NN.jpg),
// so a sheet can go to a blind reader. Every contact sheet keeps its long edge at or under 2,576 px.
//        node build/render.js stills review/sig_s3 1 2.5 4 --sketch      node build/render.js stills review/blind/s3_sig 1 2.5 4 --sketch --words-off
const path = require('path'); const fs = require('fs');
function studio() { let d = path.resolve(__dirname, '..'); while (d !== path.dirname(d)) { if (fs.existsSync(path.join(d, '.demo-studio'))) return d; d = path.dirname(d); } throw new Error('studio root not found'); }
const NM = path.join(studio(), 'toolkit', 'node_modules');
const { chromium } = require(path.join(NM, 'playwright-core'));
const FF = require(path.join(NM, 'ffmpeg-static'));
const { spawn } = require('child_process');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const flag = f => { const i = process.argv.indexOf(f); if (i < 0) return false; process.argv.splice(i, 1); return true; };
const opt = (f, d) => { const i = process.argv.indexOf(f); if (i < 0) return d; const v = process.argv[i + 1]; process.argv.splice(i, 2); return v; };
const SKETCH = flag('--sketch'), WORDS_OFF = flag('--words-off'), BLIND = flag('--blind') || WORDS_OFF;
const ONLY = opt('--stage', null), EVERY = +opt('--every', .5), BURST = opt('--burst', '-0.2,0,0.2').split(',').map(Number);
// ---------- run inside the page (passed to page.evaluate, so each is self-contained) ----------
// --words-off self-check: text in #stage that still paints (shown, on screen, glyph colour or stroke not transparent)
const wordsLeft = () => {
  const root = document.getElementById('stage'), R = root.getBoundingClientRect(), out = new Set();
  const seen = { checkOpacity: true, checkVisibilityCSS: true };
  const alpha = c => { if (!c || c === 'none' || c === 'transparent') return 0; const m = /rgba?\(([^)]*)\)/.exec(c); if (!m) return 1;
    const v = m[1].split(/[\s,\/]+/).filter(Boolean); return v.length > 3 ? parseFloat(v[3]) * (v[3].endsWith('%') ? .01 : 1) : 1; };
  const paints = (e, cs) => e instanceof SVGElement
    ? alpha(cs.fill) * parseFloat(cs.fillOpacity) > 0 || (alpha(cs.stroke) * parseFloat(cs.strokeOpacity) > 0 && parseFloat(cs.strokeWidth) > 0)
    : alpha(cs.webkitTextFillColor) > 0 || (alpha(cs.webkitTextStrokeColor) > 0 && parseFloat(cs.webkitTextStrokeWidth) > 0) || (cs.textShadow && cs.textShadow !== 'none');
  const faint = e => { let o = 1; for (let x = e; x && x !== root.parentElement; x = x.parentElement) o *= parseFloat(getComputedStyle(x).opacity); return o < .01; };
  const onScreen = rs => [...rs].some(r => r.width > 0 && r.height > 0 && r.right > R.left && r.left < R.right && r.bottom > R.top && r.top < R.bottom);
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    const s = n.nodeValue.replace(/\s+/g, ' ').trim(), e = n.parentElement;
    if (!s || !e || /^(STYLE|SCRIPT)$/i.test(e.tagName) || !e.checkVisibility(seen) || faint(e)) continue;
    const cs = getComputedStyle(e), rg = document.createRange(); rg.selectNodeContents(n);
    if (parseFloat(cs.fontSize) >= 1 && onScreen(rg.getClientRects()) && paints(e, cs)) out.add(s.slice(0, 80));
  }
  for (const e of root.querySelectorAll('*')) for (const pe of ['::before', '::after']) {
    const cs = getComputedStyle(e, pe), c = cs.content;
    if (!/^["'].+["']$/.test(c || '') || cs.display === 'none' || !e.checkVisibility(seen) || faint(e)) continue;
    if (onScreen([e.getBoundingClientRect()]) && paints(e, cs)) out.add(c.slice(1, -1).slice(0, 80) + ' (' + pe + ')');
  }
  return [...out];
};
// page state for `same` and `state`: every element of #stage that can show (display, visibility, opacity 0 skipped, so a
// hidden layer's stale styles do not count), keyed by its position in the tree, with its attributes, the computed
// properties that move or hide it, its box on screen, and its own text
const stateDump = () => {
  const root = document.getElementById('stage'), out = {}, seen = { checkOpacity: true, checkVisibilityCSS: true };
  const r2 = v => Math.round(v * 100) / 100, DEFS = 'defs,clipPath,mask,linearGradient,radialGradient,pattern,filter,marker,symbol';
  const key = e => { const p = []; for (let x = e; x && x !== root; x = x.parentElement) p.unshift(x.tagName.toLowerCase() + ':' + [...x.parentElement.children].indexOf(x)); return p.join('/'); };
  const name = e => { const d = x => x.tagName.toLowerCase() + (x.id ? '#' + x.id : '') + (x.classList.length ? '.' + [...x.classList].join('.') : '');
    const p = [d(e)]; for (let x = e.parentElement; x && x !== root && p.length < 4; x = x.parentElement) if (x.id || x.classList.length) p.unshift(d(x));
    const tx = (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30); return p.join(' > ') + (tx ? ` ("${tx}")` : ''); };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0).toString(16); };
  for (const e of root.querySelectorAll('*')) {
    const def = e instanceof SVGElement && e.closest(DEFS);
    if (def ? !(def.ownerSVGElement || def).checkVisibility(seen) : !e.checkVisibility(seen)) continue;
    const cs = getComputedStyle(e), b = e.getBoundingClientRect(), s = { name: name(e) };
    for (const a of e.attributes) s['@' + a.name] = a.value;
    for (const p of ['transform', 'opacity', 'filter', 'visibility', 'clip-path', 'color', 'background-color', 'fill', 'stroke']) s[p] = cs.getPropertyValue(p);
    s.box = [b.x, b.y, b.width, b.height].map(r2).join(' ');
    const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.nodeValue).join('').trim(); if (own) s.text = own;
    if (e.tagName === 'CANVAS') try { s.pixels = hash(e.toDataURL()); } catch (x) { s.pixels = 'unreadable'; }
    if (e.tagName === 'VIDEO') s.time = e.currentTime;
    out[key(e)] = s;
  }
  return out;
};
(async () => {
  const mode = process.argv[2];
  const missing = SKETCH ? [] : ['cues.js', 'footage.js'].filter(f => !fs.existsSync(path.join(__dirname, f)));
  if (missing.length) {
    console.error(`render.js needs build/${missing.join(' and build/')}, which lib/cursor_tracks.py writes once there is a voice take
(lib/build_voice.py) and footage (lib/build_clips.py). Nothing was rendered. Before the first take, render a motion
segment's signature moment with --sketch (build/sketch.js; see references/MOTION.md, Think 2).`);
    process.exit(1);
  }
  const b = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  // a sketch made after the voice take gets the take's word timings, so W(), S0() and S1() work in sketch.js
  const take = SKETCH && fs.existsSync(path.join(__dirname, 'cues.json')) ? JSON.parse(fs.readFileSync(path.join(__dirname, 'cues.json'), 'utf8')) : null;
  if (take) await p.addInitScript(c => { window.CUES_TAKE = c; }, take);
  await p.goto('file://' + path.resolve(__dirname, SKETCH ? 'sketch.html' : 'comp.html') + (WORDS_OFF ? '?words=0' : ''));
  await p.evaluate(() => window.ready());
  if (SKETCH) console.log(take ? `sketch: word timings from the voice take (build/cues.json, ${(take.words || []).length} words); timeline ${await p.evaluate(() => TOTAL)} s`
    : `sketch: no voice take yet (no build/cues.json), literal times only; timeline ${await p.evaluate(() => TOTAL)} s`);
  const stage = await p.$('#stage');
  const render = async t => {
    await p.evaluate(t => window.renderAt(t), t);
    if (WORDS_OFF) for (const w of await p.evaluate(wordsLeft)) console.log(`WORDS LEFT: ${w} at ${t.toFixed(2)}`);
  };
  const shot = async (t, type = 'jpeg') => { await render(t); return stage.screenshot(type === 'png' ? { type } : { type, quality: 85 }); };
  // tile frames [[jpeg buffer, label], ...] into one labelled contact sheet; every label starts with its time ("12.40s ...").
  // The cells shrink until the long edge is at most 2,576 px (larger images are scaled down before a model sees them).
  // With BLIND, the title and labels keep only the times, so the sheet names nothing the reader should work out.
  const sheet = async (cells, cols, cellW, out, title) => {
    const tm = l => (/^-?[\d.]+s/.exec(l) || [''])[0];
    if (BLIND) { const ts = cells.map(c => tm(c[1])); cells = cells.map(([buf, l]) => [buf, tm(l)]); title = `${ts[0]} to ${ts[ts.length - 1]} · ${cells.length} frames`; }
    const MAX = 2576, sp = await b.newPage({ viewport: { width: 800, height: 300 }, deviceScaleFactor: 1 });
    let size;
    for (let w = Math.min(cellW, Math.floor((MAX - (cols + 1) * 8) / cols)); ; w = Math.floor(w * MAX / Math.max(...size)) - 2) {
      await sp.setViewportSize({ width: cols * w + (cols + 1) * 8, height: 300 });
      await sp.setContent(`<body style="margin:0;padding:8px;background:#15181f;font:500 15px ui-monospace,Menlo,monospace;color:#d8dee9">
        <div style="padding:2px 0 8px;font-size:17px;color:#fff">${esc(title)}</div>
        <div style="display:grid;grid-template-columns:repeat(${cols},${w}px);gap:8px">${cells.map(([buf, l]) =>
          `<div><img style="display:block;width:${w}px" src="data:image/jpeg;base64,${buf.toString('base64')}">
          <div style="padding:4px 2px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(l)}</div></div>`).join('')}</div></body>`);
      await sp.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
      size = await sp.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
      if (Math.max(...size) <= MAX || w < 80) break;
    }
    await sp.screenshot({ path: out, type: 'jpeg', quality: 88, fullPage: true }); await sp.close();
    return size;
  };
  if (mode === 'stills') {
    const dir = process.argv[3]; fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv.slice(4)) {
      await render(+t);
      await stage.screenshot({ path: path.join(dir, 't_' + (+t).toFixed(2).padStart(6, '0') + '.jpg'), type: 'jpeg', quality: 85 });
    }
  } else if (mode === 'motionsheet') {
    const dir = process.argv[3] || 'review/motion'; fs.mkdirSync(dir, { recursive: true });
    const segs = await p.evaluate(() => window.motionStates ? window.motionStates() : []);
    if (!segs.length) console.log('no motion segments in STORY.motion');
    for (const s of segs) {
      const cells = [], title = s.title.replace(/<[^>]+>/g, '');
      for (const [t, l] of s.states) cells.push([await shot(t), t.toFixed(2) + 's  ' + l]);
      const out = path.join(dir, s.i + '.jpg');
      await sheet(cells, 3, 640, out, `Segment ${s.i} · ${title} · ${s.from.toFixed(2)}s to ${s.to.toFixed(2)}s · ${cells.length} states`);
      console.log(out, '·', title, '·', cells.length, 'states');
    }
  } else if (mode === 'strip') {
    const dir = process.argv[3], t = +process.argv[4], n = +(process.argv[5] || 12), fps = +(process.argv[6] || 30);
    fs.mkdirSync(dir, { recursive: true });
    const f0 = Math.round(t * fps) - Math.floor(n / 2), cells = [];
    for (let i = 0; i < n; i++) { const f = f0 + i; cells.push([await shot(f / fps), `${(f / fps).toFixed(3)}s  frame ${f}`]); }
    const out = path.join(dir, 'strip_' + t.toFixed(2) + '.jpg');
    await sheet(cells, Math.min(n, 6), 480, out, `Strip around ${t.toFixed(2)}s · ${n} frames at ${fps} fps`); console.log(out);
  } else if (mode === 'same') {
    // pass one in order (another time rendered after each), three unrelated times, then pass two in reverse; each pass
    // keeps the pixels and the page state (stateDump). Verdicts:
    // SAME: identical bytes, or no pixel off by more than NOISE in any channel (Chrome resamples screen-share frames
    //   with tiny edge differences between runs).
    // RASTER NOISE: the page state is identical and every differing pixel sits on an edge of the first image (a rotated
    //   or scaled SVG edge antialiased differently): not a bug; exit 0, with a crop to look at.
    // DIFFERENT: the state differs (names the element and the property), or pixels differ away from any edge with the
    //   same state (an image still decoding, a canvas): a bug to fix; exit 1.
    const NOISE = 8, EDGE = 32, cmp = await b.newPage();
    const pxdiff = (a, c) => cmp.evaluate(async ([a, c, NOISE, EDGE]) => {
      const px = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode();
        const x = new OffscreenCanvas(i.width, i.height).getContext('2d'); x.drawImage(i, 0, 0); return [x.getImageData(0, 0, i.width, i.height).data, i.width, i.height]; };
      const [[A, w, h], [C]] = [await px(a), await px(c)]; let max = 0, n = 0, off = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      const edge = (x, y) => { const j = (y * w + x) * 4; let m = 0;   // largest channel step to a neighbour in the first image
        for (let v = Math.max(0, y - 1); v <= Math.min(h - 1, y + 1); v++) for (let u = Math.max(0, x - 1); u <= Math.min(w - 1, x + 1); u++) {
          const k = (v * w + u) * 4; m = Math.max(m, Math.abs(A[k] - A[j]), Math.abs(A[k + 1] - A[j + 1]), Math.abs(A[k + 2] - A[j + 2])); }
        return m >= EDGE; };
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.max(Math.abs(A[i] - C[i]), Math.abs(A[i + 1] - C[i + 1]), Math.abs(A[i + 2] - C[i + 2])); if (d > max) max = d;
        if (d > NOISE) { n++; const x = (i / 4) % w, y = Math.floor(i / 4 / w); if (!edge(x, y)) off++;
          x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      }
      return { max, n, off, box: n ? [x0, y0, x1, y1] : null };
    }, [a.toString('base64'), c.toString('base64'), NOISE, EDGE]);
    // the changed area, enlarged without smoothing: first render | second render | changed pixels in red
    const crop = (a, c, box) => cmp.evaluate(async ([a, c, box, NOISE]) => {
      const img = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); return i; };
      const [A, C] = [await img(a), await img(c)], pad = 16;
      const x0 = Math.max(0, box[0] - pad), y0 = Math.max(0, box[1] - pad), x1 = Math.min(A.width, box[2] + pad + 1), y1 = Math.min(A.height, box[3] + pad + 1);
      const w = x1 - x0, h = y1 - y0, k = Math.max(1, Math.min(8, Math.floor(600 / Math.max(w, h)))), W = w * k, g = 12;
      const cv = new OffscreenCanvas(3 * W + 2 * g, h * k), x = cv.getContext('2d'); x.imageSmoothingEnabled = false;
      x.fillStyle = '#15181f'; x.fillRect(0, 0, cv.width, cv.height);
      x.drawImage(A, x0, y0, w, h, 0, 0, W, h * k); x.drawImage(C, x0, y0, w, h, W + g, 0, W, h * k);
      const q = new OffscreenCanvas(w, h).getContext('2d'); q.drawImage(A, x0, y0, w, h, 0, 0, w, h); const P = q.getImageData(0, 0, w, h);
      q.drawImage(C, x0, y0, w, h, 0, 0, w, h); const Q = q.getImageData(0, 0, w, h).data, D = P.data;
      for (let i = 0; i < D.length; i += 4) { const d = Math.max(Math.abs(D[i] - Q[i]), Math.abs(D[i + 1] - Q[i + 1]), Math.abs(D[i + 2] - Q[i + 2])) > NOISE;
        const l = (D[i] + D[i + 1] + D[i + 2]) / 6; D[i] = d ? 255 : l; D[i + 1] = d ? 40 : l; D[i + 2] = d ? 40 : l; }
      q.putImageData(P, 0, 0); x.drawImage(q.canvas, 0, 0, w, h, 2 * (W + g), 0, W, h * k);
      const r = new FileReader(), bl = await cv.convertToBlob({ type: 'image/png' });
      return await new Promise(res => { r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(bl); });
    }, [a.toString('base64'), c.toString('base64'), box, NOISE]);
    // differences between two state dumps: [element name, property, first value, second value]
    const statediff = (A, C) => {
      const out = [];
      for (const k of new Set([...Object.keys(A), ...Object.keys(C)])) {
        if (!A[k] || !C[k]) { out.push([(A[k] || C[k]).name, A[k] ? 'shown only in the first render' : 'shown only in the second render', '', '']); continue; }
        for (const f of new Set([...Object.keys(A[k]), ...Object.keys(C[k])])) if (f !== 'name' && A[k][f] !== C[k][f]) out.push([A[k].name, f.replace(/^@/, 'attribute '), A[k][f] ?? '(none)', C[k][f] ?? '(none)']);
      }
      return out;
    };
    const dir = process.argv[3], ts = process.argv.slice(4).map(Number); fs.mkdirSync(dir, { recursive: true });
    const total = await p.evaluate(() => CUES.total), name = t => 't_' + t.toFixed(2).padStart(6, '0');
    const first = {}, firstState = {}; let bad = 0;
    for (const t of ts) { first[t] = await shot(t, 'png'); firstState[t] = await p.evaluate(stateDump); await p.evaluate(t => window.renderAt(t), (t * 1.7 + 13) % total); }
    for (const t of [total * .37, .5, total - .5]) await p.evaluate(t => window.renderAt(t), t);
    for (const t of [...ts].reverse()) {
      const again = await shot(t, 'png'), againState = await p.evaluate(stateDump), d = again.equals(first[t]) ? { max: 0, n: 0 } : await pxdiff(first[t], again);
      const sd = statediff(firstState[t], againState), f = path.join(dir, name(t));
      const where = d.n ? `${d.n} pixel${d.n === 1 ? '' : 's'} in x ${d.box[0]} to ${d.box[2]}, y ${d.box[1]} to ${d.box[3]}` : 'no pixel';
      const named = sd.slice(0, 6).map(([e, pr, a, c]) => `\n    ${e}: ${pr} "${String(a).slice(0, 90)}" then "${String(c).slice(0, 90)}"`).join('') + (sd.length > 6 ? `\n    (${sd.length - 6} more)` : '');
      fs.writeFileSync(f + '.png', first[t]);
      if (d.n) fs.writeFileSync(f + '_again.png', again);
      if (!d.n) console.log(t.toFixed(2), 'SAME' + (d.max ? ' (edge noise only, max channel difference ' + d.max + ')' : '') +
        (sd.length ? `; the page state differs where no pixel shows it (${sd.length} propert${sd.length === 1 ? 'y' : 'ies'}), which may show at another time:` + named : ''));
      else if (!sd.length && !d.off) {
        fs.writeFileSync(f + '_noise.png', Buffer.from(await crop(first[t], again, d.box), 'base64'));
        console.log(t.toFixed(2), `RASTER NOISE: page state identical; ${where} differ, each on an edge (max channel difference ${d.max}); look at ${f}_noise.png (first | again | changed in red)`);
      } else {
        bad++;
        if (sd.length) { fs.writeFileSync(f + '_state.json', JSON.stringify(firstState[t], null, 1)); fs.writeFileSync(f + '_again_state.json', JSON.stringify(againState, null, 1)); }
        console.log(t.toFixed(2), sd.length ? `DIFFERENT: the page state differs (${where} differ):` + named
          : `DIFFERENT: page state identical, but ${d.off} of the ${where} differ away from any edge: something the page state does not hold (an image still decoding, a canvas, a video frame, an iframe)`,
          `\n    compare ${name(t)}.png and ${name(t)}_again.png in ${dir}`);
      }
    }
    process.exitCode = bad ? 1 : 0;
  } else if (mode === 'state') {
    const dir = process.argv[3]; fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv.slice(4).map(Number)) {
      await render(t); const s = await p.evaluate(stateDump), f = path.join(dir, 't_' + t.toFixed(2).padStart(6, '0') + '_state.json');
      fs.writeFileSync(f, JSON.stringify(s, null, 1)); console.log(t.toFixed(2), f, Object.keys(s).length, 'elements shown');
    }
  } else if (mode === 'events') {
    // frames where something happens: window.stageEvents() ([{ stage, t, what }], from stage.js) gives every scheduled
    // change; each gets a burst (default 0.2 s before, at, 0.2 s after), plus one frame every EVERY seconds between,
    // grouped per shot into sheets of at most 20 cells that stay under 2,576 px on the long edge (one reader can take them)
    const dir = process.argv[3] || 'review/events'; fs.mkdirSync(path.join(dir, 'frames'), { recursive: true });
    const info = await p.evaluate(() => {
      if (typeof STAGES === 'undefined' || !STAGES.length) return null;
      const stages = STAGES.map(s => ({ name: s.o.name, from: s.o.from, to: s.end(), shots: (s.o.shots || []).map(([t, n]) => [t, n]) }));
      if (typeof window.stageEvents === 'function') return { real: true, stages, ev: window.stageEvents() };
      const ev = [];   // fallback until stage.js lists its events: stage edges and camera keys only
      for (const s of STAGES) {
        const n = s.o.name, cam = s.o.cam || []; ev.push({ stage: n, t: s.o.from, what: 'stage starts' }, { stage: n, t: s.end(), what: 'stage ends' });
        for (let i = 1; i < cam.length; i++) {
          if (typeof camDur === 'function') ev.push({ stage: n, t: Math.max(cam[i - 1][0], cam[i][0] - camDur(cam[i - 1], cam[i])), what: `camera move ${i} starts` });
          ev.push({ stage: n, t: cam[i][0], what: `camera key ${i} arrives` });
        }
      }
      return { real: false, stages, ev };
    });
    if (!info) { console.error('events: no stages on this page (STAGES is empty), nothing to sample'); process.exitCode = 1; await b.close(); return; }
    if (!info.real) console.log('events: window.stageEvents() not found in stage.js, so only stage edges and camera keys are sampled; part turns, shifts, moves, morphs and reactions between them are not');
    const bad = info.ev.filter(e => !e || typeof e.t !== 'number' || !isFinite(e.t) || typeof e.stage !== 'string');
    if (bad.length) console.error(`events: ${bad.length} entr${bad.length === 1 ? 'y' : 'ies'} from stageEvents() lack { stage, t, what }; skipped, first: ${JSON.stringify(bad[0])}`);
    const stages = info.stages.filter(s => !ONLY || s.name.toLowerCase() === ONLY.toLowerCase());
    if (!stages.length) { console.error(`events: no stage named "${ONLY}"; stages: ${info.stages.map(s => s.name).join(', ')}`); process.exitCode = 1; await b.close(); return; }
    const total = await p.evaluate(() => CUES.total), F = t => Math.round(t * 30) / 30, cutoff = Math.min(...BURST.map(Math.abs).filter(x => x > 0), EVERY) / 2;
    const list = [], json = { source: info.real ? 'window.stageEvents()' : 'fallback: stage edges and camera keys', burst: BURST, every: EVERY, stages: [] };
    let nFrames = 0, nSheets = 0;
    for (const s of stages) {
      const ev = info.ev.filter(e => !bad.includes(e) && e.stage === s.name).sort((a, c) => a.t - c.t), lo = Math.max(0, s.from - .3), hi = Math.min(total, s.to + .3);
      const fr = new Map();   // frame time -> labels
      const add = (t, l) => { t = F(Math.min(hi, Math.max(lo, t))); if (!fr.has(t)) fr.set(t, []); if (l) fr.get(t).push(l); };
      for (const e of ev) for (const o of BURST) add(e.t + o, (o < 0 ? 'before: ' : o > 0 ? 'after: ' : 'at: ') + (e.what || 'event'));
      for (let t = s.from; t < s.to; t += EVERY) if (![...fr.keys()].some(k => Math.abs(k - t) < cutoff)) add(t, '');
      const times = [...fr.keys()].sort((a, c) => a - c), shots = s.shots.length ? [...s.shots].sort((a, c) => a[0] - c[0]) : [[s.from, 'whole stage']];
      const slug = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'stage', sj = { name: s.name, events: ev, sheets: [] };
      for (let k = 0; k < shots.length; k++) {
        const a = k ? shots[k][0] : -Infinity, z = k + 1 < shots.length ? shots[k + 1][0] : Infinity, ts = times.filter(t => t >= a && t < z);
        if (!ts.length) continue;
        const parts = Math.ceil(ts.length / 20), per = Math.ceil(ts.length / parts);
        for (let q = 0; q < parts; q++) {
          const cells = [], part = ts.slice(q * per, (q + 1) * per);
          for (const t of part) {
            const buf = await shot(t), l = [...new Set(fr.get(t))].join(' · ');
            fs.writeFileSync(path.join(dir, 'frames', 't_' + t.toFixed(2).padStart(6, '0') + '.jpg'), buf); cells.push([buf, t.toFixed(2) + 's  ' + l]);
          }
          const out = path.join(dir, BLIND ? `sheet_${String(nSheets + 1).padStart(2, '0')}.jpg` : `${slug}_${String(k + 1).padStart(2, '0')}${parts > 1 ? '_' + 'abcdefghij'[q] : ''}.jpg`);
          const [w, h] = await sheet(cells, 4, 600, out, `${s.name} · shot ${k + 1}: ${shots[k][1]} · ${part[0].toFixed(2)}s to ${part[part.length - 1].toFixed(2)}s · ${cells.length} frames${parts > 1 ? ` (sheet ${q + 1} of ${parts})` : ''}`);
          console.log(out, `${w} x ${h} px`, cells.length, 'frames', BLIND ? `(${s.name}, shot ${k + 1}; the sheet shows times only)` : '', Math.max(w, h) > 2576 ? '· LONGER THAN 2,576 px: split it' : '');
          sj.sheets.push({ file: out, shot: shots[k][1], frames: part }); nFrames += cells.length; nSheets++;
        }
      }
      json.stages.push(sj); list.push(`${s.name}: ${ev.length} events, ${times.length} frames`);
    }
    fs.writeFileSync(path.join(dir, 'events.json'), JSON.stringify(json, null, 1));
    console.log(`events: ${list.join('; ')}; ${nFrames} frames on ${nSheets} sheets (full-size frames in ${path.join(dir, 'frames')}, list in ${path.join(dir, 'events.json')})`);
  } else if (mode === 'motioncues') {
    const cues = await p.evaluate(() => window.motionCues ? window.motionCues() : []);
    fs.writeFileSync(path.resolve(__dirname, 'motion_cues.json'), JSON.stringify(cues));
    console.log(cues.length, 'motion sound cues -> build/motion_cues.json');
  } else {
    const out = process.argv[3], fps = +(process.argv[4] || 30), f0 = +(process.argv[5] || 0), f1 = +(process.argv[6] || 2700);
    const cdp = await p.context().newCDPSession(p);
    const ff = spawn(FF, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = f1 - f0; const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const t = (f0 + i) / fps;
      await p.evaluate(t => window.renderAt(t), t);
      const r = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: 1920, height: 1080, scale: 1 }, optimizeForSpeed: true });
      const buf = Buffer.from(r.data, 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 300 === 0) console.log('frame', i, '/', n, ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
  }
  await b.close();
})();
