// Render the deterministic timeline in headless Chrome (installed Google Chrome, channel 'chrome').
// usage: node build/render.js stills review/stills 3 42.5 118   (check frames at chosen seconds)
//        node build/render.js video out/part.mp4 30 FROM_FRAME TO_FRAME   (build/render_par.sh calls this)
//        node build/render.js motionsheet review/motion   (one tile per motion element state, review/motion/<segment index>.jpg)
//        node build/render.js strip review/strip 84.3 [n=12] [fps=30]   (n consecutive frames around a fast move, tiled)
//        node build/render.js same review/same 12.5 80.2   (renders each time twice with others between; exit 1 if any differ)
//        node build/render.js motioncues   (writes build/motion_cues.json from STORY.motion sfx fields)
const path = require('path'); const fs = require('fs');
function studio() { let d = path.resolve(__dirname, '..'); while (d !== path.dirname(d)) { if (fs.existsSync(path.join(d, '.demo-studio'))) return d; d = path.dirname(d); } throw new Error('studio root not found'); }
const NM = path.join(studio(), 'toolkit', 'node_modules');
const { chromium } = require(path.join(NM, 'playwright-core'));
const FF = require(path.join(NM, 'ffmpeg-static'));
const { spawn } = require('child_process');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
(async () => {
  const mode = process.argv[2];
  const missing = ['cues.js', 'footage.js'].filter(f => !fs.existsSync(path.join(__dirname, f)));
  if (missing.length) {
    console.error(`render.js needs build/${missing.join(' and build/')}, which lib/cursor_tracks.py writes once there is a voice take
(lib/build_voice.py) and footage (lib/build_clips.py). Nothing was rendered. Before the first take, show motion segments
as state lists; the motionsheet comes with the rough cut.`);
    process.exit(1);
  }
  const b = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'comp.html'));
  await p.evaluate(() => window.ready());
  const stage = await p.$('#stage');
  const shot = async (t, type = 'jpeg') => { await p.evaluate(t => window.renderAt(t), t); return stage.screenshot(type === 'png' ? { type } : { type, quality: 85 }); };
  // tile frames [[jpeg buffer, label], ...] into one labelled contact sheet
  const sheet = async (cells, cols, cellW, out, title) => {
    const sp = await b.newPage({ viewport: { width: cols * cellW + (cols + 1) * 8, height: 300 }, deviceScaleFactor: 1 });
    await sp.setContent(`<body style="margin:0;padding:8px;background:#15181f;font:500 15px ui-monospace,Menlo,monospace;color:#d8dee9">
      <div style="padding:2px 0 8px;font-size:17px;color:#fff">${esc(title)}</div>
      <div style="display:grid;grid-template-columns:repeat(${cols},${cellW}px);gap:8px">${cells.map(([buf, l]) =>
        `<div><img style="display:block;width:${cellW}px" src="data:image/jpeg;base64,${buf.toString('base64')}">
        <div style="padding:4px 2px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(l)}</div></div>`).join('')}</div></body>`);
    await sp.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
    await sp.screenshot({ path: out, type: 'jpeg', quality: 88, fullPage: true }); await sp.close();
  };
  if (mode === 'stills') {
    const dir = process.argv[3]; fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv.slice(4)) {
      await p.evaluate(t => window.renderAt(t), +t);
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
    // pass one in order (another time rendered after each), three unrelated times, then pass two in reverse.
    // SAME: identical bytes, or no pixel off by more than NOISE in any channel (Chrome resamples screen-share frames
    // with tiny edge differences between runs); anything a viewer could see, such as a cursor or element out of
    // place, differs by far more and prints DIFFERENT with the area that changed.
    const NOISE = 8, cmp = await b.newPage();
    const pxdiff = (a, c) => cmp.evaluate(async ([a, c, NOISE]) => {
      const px = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode();
        const x = new OffscreenCanvas(i.width, i.height).getContext('2d'); x.drawImage(i, 0, 0); return [x.getImageData(0, 0, i.width, i.height).data, i.width]; };
      const [[A, w], [C]] = [await px(a), await px(c)]; let max = 0, n = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let i = 0; i < A.length; i += 4) {
        const d = Math.max(Math.abs(A[i] - C[i]), Math.abs(A[i + 1] - C[i + 1]), Math.abs(A[i + 2] - C[i + 2])); if (d > max) max = d;
        if (d > NOISE) { n++; const x = (i / 4) % w, y = Math.floor(i / 4 / w); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      }
      return { max, n, box: n ? [x0, y0, x1, y1] : null };
    }, [a.toString('base64'), c.toString('base64'), NOISE]);
    const dir = process.argv[3], ts = process.argv.slice(4).map(Number); fs.mkdirSync(dir, { recursive: true });
    const total = await p.evaluate(() => CUES.total), name = t => 't_' + t.toFixed(2).padStart(6, '0');
    const first = {}; let bad = 0;
    for (const t of ts) { first[t] = await shot(t, 'png'); await p.evaluate(t => window.renderAt(t), (t * 1.7 + 13) % total); }
    for (const t of [total * .37, .5, total - .5]) await p.evaluate(t => window.renderAt(t), t);
    for (const t of [...ts].reverse()) {
      const again = await shot(t, 'png'), d = again.equals(first[t]) ? { max: 0, n: 0 } : await pxdiff(first[t], again);
      fs.writeFileSync(path.join(dir, name(t) + '.png'), first[t]);
      if (d.n) { bad++; fs.writeFileSync(path.join(dir, name(t) + '_again.png'), again); }
      console.log(t.toFixed(2), !d.n ? 'SAME' + (d.max ? ' (edge noise only, max channel difference ' + d.max + ')' : '')
        : `DIFFERENT: ${d.n} pixels in x ${d.box[0]} to ${d.box[2]}, y ${d.box[1]} to ${d.box[3]} (compare ${name(t)}.png and ${name(t)}_again.png in ${dir})`);
    }
    process.exitCode = bad ? 1 : 0;
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
