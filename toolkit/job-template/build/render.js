// Render the deterministic timeline in headless Chrome (installed Google Chrome, channel 'chrome').
// usage: node build/render.js stills review/stills 3 42.5 118   (check frames at chosen seconds)
//        node build/render.js video out/part.mp4 30 FROM_FRAME TO_FRAME   (build/render_par.sh calls this)
const path = require('path'); const fs = require('fs');
function studio() { let d = path.resolve(__dirname, '..'); while (d !== path.dirname(d)) { if (fs.existsSync(path.join(d, '.demo-studio'))) return d; d = path.dirname(d); } throw new Error('studio root not found'); }
const NM = path.join(studio(), 'toolkit', 'node_modules');
const { chromium } = require(path.join(NM, 'playwright-core'));
const FF = require(path.join(NM, 'ffmpeg-static'));
const { spawn } = require('child_process');
(async () => {
  const mode = process.argv[2];
  const b = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('file://' + path.resolve(__dirname, 'comp.html'));
  await p.evaluate(() => window.ready());
  const stage = await p.$('#stage');
  if (mode === 'stills') {
    const dir = process.argv[3]; fs.mkdirSync(dir, { recursive: true });
    for (const t of process.argv.slice(4)) {
      await p.evaluate(t => window.renderAt(t), +t);
      await stage.screenshot({ path: path.join(dir, 't_' + (+t).toFixed(2).padStart(6, '0') + '.jpg'), type: 'jpeg', quality: 85 });
    }
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
