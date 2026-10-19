// Explore in your own tagged tab over the shared signed-in Chrome.
// usage: node capture/tab.js <tag> '<async JS body using page, C, shot(name), text(n), dtext(n), sleep(ms)>'
// Example: node capture/tab.js explore1 'await page.goto(C.CFG.app_url); await sleep(4000); await shot("home"); return await dtext(3000)'
// Rules: at most two browser-driving agents at once, each with its own tag; no exploring while a take records.
const C = require('./cdp');
(async () => {
  const tag = process.argv[2]; const { ctx } = await C.connect();
  const page = await C.tagged(ctx, tag); await C.setup(page);
  const shot = async (n, dir) => C.shot(page, tag + '_' + n, dir);
  const text = async (n = 4000) => page.evaluate(n => document.body.innerText.slice(0, n), n);
  const dtext = async (n = 20000) => page.evaluate(C.DTEXT, n);
  const fn = new Function('page', 'C', 'shot', 'text', 'sleep', 'dtext', `return (async()=>{ ${process.argv[3]} })()`);
  try { const r = await fn(page, C, shot, text, C.sleep, dtext); if (r !== undefined) console.log(typeof r === 'string' ? r : JSON.stringify(r, null, 1)); }
  catch (e) { console.log('ERR', e.message); }
  try { await page.evaluate(t => { window.name = t; }, tag); } catch (e) {}
  console.log('URL', page.url()); process.exit(0);
})();
