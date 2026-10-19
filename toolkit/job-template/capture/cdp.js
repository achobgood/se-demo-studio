// Attach to this job's dedicated, signed-in Chrome over the DevTools protocol (never launch a second browser
// on the same profile). Settings come from job.json: chrome_port, app_url (landing page), app_match (a URL
// fragment that identifies the product tab), theme ("light" | "dark" | null).
const path = require('path');
const fs = require('fs');
const JOB = path.resolve(__dirname, '..');
function studio() { let d = JOB; while (d !== path.dirname(d)) { if (fs.existsSync(path.join(d, '.demo-studio'))) return d; d = path.dirname(d); } throw new Error('studio root (.demo-studio) not found'); }
const NM = path.join(studio(), 'toolkit', 'node_modules');
const { chromium } = require(path.join(NM, 'playwright-core'));
const ffmpeg = require(path.join(NM, 'ffmpeg-static'));
const CFG = JSON.parse(fs.readFileSync(path.join(JOB, 'job.json'), 'utf8'));
const PORT = CFG.chrome_port || 9333;
const HIDE_CSS = `*::-webkit-scrollbar{display:none!important;width:0!important;height:0!important} html,body,*{scrollbar-width:none!important}`;
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function connect() {
  let browser, err;
  for (let i = 0; i < 6; i++) { try { browser = await chromium.connectOverCDP('http://127.0.0.1:' + PORT); break; } catch (e) { err = e; await sleep(2500); } }
  if (!browser) throw new Error(`No Chrome on port ${PORT}. Start it with scripts/chrome.sh <job> and sign in. (${err && err.message})`);
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => CFG.app_match && p.url().includes(CFG.app_match)) || ctx.pages().find(p => /^https:/.test(p.url()));
  return { browser, ctx, page };
}
// Capture at 1920x1080 CSS pixels and device scale 2, so push-ins stay sharp; hide scrollbars; pin the theme.
async function setup(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 2, mobile: false });
  if (CFG.theme) await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: CFG.theme }] }).catch(() => {});
  try { await page.addStyleTag({ content: HIDE_CSS }); } catch (e) {}
  return cdp;
}
// Sign-in screens are never captured. Returns why the page looks like a sign-in, SSO, password, or one-time-code
// page, or '' if it does not. SIGNIN_GUARD=off only for an owner-approved page with a masked secret field that is
// not a sign-in.
// It errs toward stopping: a false alarm costs a rerun, a miss records someone's sign-in.
const SIGNIN_URL = /^https?:\/\/((login|signin|sso|auth|accounts|idp|id|cloudsso)[.-]|[^/?#]*\.(okta|oktapreview|duosecurity|auth0)\.com(?=[/:?#]|$))|\/(login|log-in|signin|sign-in|logon|authorize|saml2?|sso|adfs|as\/authorization)(?=[/?#.]|$)/i;
async function signInReason(page) {
  if (process.env.SIGNIN_GUARD === 'off') return '';
  let u = ''; try { u = page.url(); } catch (e) {}
  if (SIGNIN_URL.test(u)) return 'sign-in URL ' + u.split('?')[0];
  // A password or code field, an email-first step (the page's only input asks for a username or email), or a
  // sign-in or verification page title (push and multi-factor pages often have no input at all).
  const why = await page.evaluate(() => {
    const vis = e => e.getClientRects().length > 0;
    if ([...document.querySelectorAll('input[type=password], input[autocomplete="one-time-code"]')].some(vis)) return 'password or one-time-code field';
    const ins = [...document.querySelectorAll('input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]), textarea')].filter(vis);
    const e = ins[0];
    if (ins.length === 1 && (e.type === 'email' || /username|email/i.test(e.autocomplete || '') || /^(user(name)?|e?mail|login|identifier|loginfmt|j_username)$/i.test(e.name || e.id || ''))) return 'username or email sign-in field';
    if (/\b(sign[ -]?in|log[ -]?in|single sign-on|verify (it's|its|your identity)|two-factor|multi-factor)\b/i.test(document.title)) return 'sign-in page title';
    return '';
  }).catch(() => '');
  return why ? why + ' on ' + u.split('?')[0] : '';
}
// Screenshot with a raw-CDP fallback (Playwright screenshots can hang on "waiting for fonts").
async function shot(page, name, dir) {
  const why = await signInReason(page);
  if (why) { console.log(`LOGIN NEEDED: screenshot "${name}" not taken, the page looks like a sign-in page (${why})`); return null; }
  const f = path.join(dir || path.join(JOB, 'capture', 'explore'), name + '.png');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  try { await page.screenshot({ path: f, timeout: 15000 }); }
  catch (e) { const s = await page.context().newCDPSession(page); const r = await s.send('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); }
  return f;
}
// Visible text including open shadow roots (chat and assistant panels often live in shadow DOM, which
// document.body.innerText misses).
const DTEXT = n => { const out = []; const walk = r => { for (const c of r.childNodes) { if (c.nodeType === 3) out.push(c.textContent); else if (c.nodeType === 1) { const st = getComputedStyle(c); if (st.display === 'none') continue; if (c.shadowRoot) walk(c.shadowRoot); walk(c); if (/^(DIV|P|LI|TR|H\d|BR|SECTION)$/.test(c.tagName)) out.push('\n'); } } }; walk(document.body); return out.join('').replace(/\n\s*\n+/g, '\n').slice(-n); };
// Find (or create) the tab tagged with window.name === tag, so parallel agents never share a tab.
async function tagged(ctx, tag) {
  for (const p of ctx.pages()) { try { if (await p.evaluate(() => window.name) === tag) return p; } catch (e) {} }
  const page = await ctx.newPage();
  await page.goto(CFG.app_url, { waitUntil: 'domcontentloaded' });
  await page.evaluate(t => { window.name = t; }, tag); await sleep(6000);
  return page;
}
module.exports = { connect, setup, shot, tagged, signInReason, DTEXT, ffmpeg, HIDE_CSS, CFG, JOB, PORT, sleep };
