// Record one long take with the DevTools screencast while a take script drives the page like a person.
// usage: TAG=rec node capture/rec.js <take_name> capture/takes/<script>.js
// The take script exports: async ({ page, C, mv, click, clickLoc, type, typed, wheel, mark, sleep, cdp, dtext }) => {}
// Output: capture/rec/<take_name>/00000.jpg ... and log.json (frame times, pointer track, clicks, keys).
// Screencast frames arrive only when the page changes; lib/build_clips.py resamples to a steady 30 fps.
// There is no real cursor in the capture: the pointer path is logged here and drawn in the render.
// Sign-in pages are never recorded: it refuses to start on one (exit 2) and deletes a take that reaches one (exit 3).
const C = require('./cdp'); const fs = require('fs'); const path = require('path');
(async () => {
  const name = process.argv[2]; const body = require(path.resolve(process.argv[3]));
  const dir = path.join(C.JOB, 'capture', 'rec', name);
  const { ctx } = await C.connect(); const page = await C.tagged(ctx, process.env.TAG || 'rec');
  await page.bringToFront().catch(() => {});
  const cdp = await C.setup(page);
  // never start a take on a sign-in page (checked before an earlier take of the same name is replaced)
  const notSignedIn = await C.signInReason(page);
  if (notSignedIn) { console.log(`LOGIN NEEDED: take ${name} not started, the page looks like a sign-in page (${notSignedIn}). Sign in off camera, then rerun.`); process.exit(2); }
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  // if a sign-in page appears mid-take: stop, delete this take's raw frames, log the deletion, and exit
  let aborted = false;
  const guard = async () => { if (aborted) return; const why = await C.signInReason(page); if (!why || aborted) return; aborted = true;
    await cdp.send('Page.stopScreencast').catch(() => {}); fs.rmSync(dir, { recursive: true, force: true });
    try { fs.appendFileSync(path.join(C.JOB, 'logs', 'state_changes.md'), `| ${new Date().toISOString()} | Deleted raw take ${name} | capture/rec/${name} | A sign-in page appeared (${why}); sign-in screens are never kept |\n`); } catch (e) {}
    console.log(`LOGIN NEEDED: take ${name} stopped and its raw frames deleted, a sign-in page appeared (${why}). Sign in off camera, then rerun.`); process.exit(3); };
  const dtext = async (n = 20000) => page.evaluate(C.DTEXT, n);
  let cur = { x: 1700, y: 900 }; const log = { frames: [], cursor: [], marks: [] }; let t0 = null; let n = 0;
  cdp.on('Page.screencastFrame', async f => {
    if (aborted) return;
    const fn = String(n++).padStart(5, '0') + '.jpg';
    fs.writeFileSync(path.join(dir, fn), Buffer.from(f.data, 'base64'));
    log.frames.push({ f: fn, t: f.metadata.timestamp });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
  });
  const sleep = C.sleep;
  const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  // natural pointer move: eased quadratic curve with a small bow, then a short settle
  const mv = async (x, y, ms = 700) => { const a = { ...cur }; const dx = x - a.x, dy = y - a.y, d = Math.hypot(dx, dy);
    if (d < 2) return; const bow = (Math.random() < .5 ? -1 : 1) * Math.min(90, d * .12);
    const mx = a.x + dx / 2 - dy / d * bow, my = a.y + dy / 2 + dx / d * bow; const steps = Math.max(10, Math.round(ms / 16));
    for (let i = 1; i <= steps; i++) { const k = ease(i / steps), u = 1 - k;
      cur = { x: u * u * a.x + 2 * u * k * mx + k * k * x, y: u * u * a.y + 2 * u * k * my + k * k * y };
      await page.mouse.move(cur.x, cur.y); log.cursor.push({ t: Date.now() / 1000, x: cur.x, y: cur.y }); await sleep(ms / steps); }
    await sleep(60 + Math.random() * 90); };
  const click = async (x, y, ms) => { await mv(x, y, ms); await sleep(120); log.marks.push({ t: Date.now() / 1000, k: 'click', x, y }); await page.mouse.down(); await sleep(70); await page.mouse.up(); };
  const clickLoc = async (loc, ms) => { const b = await loc.boundingBox(); if (!b) throw new Error('element not visible'); await click(b.x + b.width / 2, b.y + b.height / 2, ms); };
  // human typing: 80 to 150 ms per key with jitter (fast typing drops characters in rich text boxes); every key is logged
  const type = async (str, d = 95) => { for (const ch of str) { await page.keyboard.type(ch); log.marks.push({ t: Date.now() / 1000, k: 'key' });
      let w = d * (.55 + Math.random() * .9); if (ch === ' ') w += Math.random() < .25 ? 140 : 30; if (/[.,?]/.test(ch)) w += 180; await sleep(w); } };
  // read back the focused text box; press Enter only when it matches exactly what you typed
  const typed = async (sel = '[contenteditable=true], textarea, input[type=text]') => (await page.locator(sel).first().evaluate(e => e.value ?? e.innerText)).trim();
  const wheel = async (dy, steps = 30, ms = 1500) => { for (let i = 0; i < steps; i++) { await page.mouse.wheel(0, dy / steps); await sleep(ms / steps); } };
  const mark = k => log.marks.push({ t: Date.now() / 1000, k });
  await page.addStyleTag({ content: C.HIDE_CSS + ' #onetrust-banner-sdk,.cookie-banner{display:none!important}' }).catch(() => {});
  await page.mouse.move(cur.x, cur.y);
  page.on('framenavigated', f => { if (f === page.mainFrame()) guard(); });
  const guardTimer = setInterval(guard, 1500);
  t0 = Date.now();
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: Number(process.env.JPGQ || 90), maxWidth: 3840, maxHeight: 2160, everyNthFrame: 1 });
  mark('start');
  try { await body({ page, C, mv, click, clickLoc, type, typed, wheel, mark, sleep, cdp, dtext, cur: () => cur }); } catch (e) { console.log('TAKE SCRIPT ERROR', e.message); }
  mark('end'); await sleep(500); await guard(); clearInterval(guardTimer);
  await cdp.send('Page.stopScreencast');
  fs.writeFileSync(path.join(dir, 'log.json'), JSON.stringify(log));
  console.log(name, 'frames', n, 'secs', ((Date.now() - t0) / 1000).toFixed(1));
  console.log('check it: python3 lib/recsheet.py', name, '5 15 30 45 60');
  process.exit(0);
})();
