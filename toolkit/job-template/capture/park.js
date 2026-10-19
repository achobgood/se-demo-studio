// Put a tab in a take's starting state off camera, and prove it is there (L49).
// usage: node capture/park.js <name>        (names come from PARK below; no name lists them)
// Page loads are fine here because nothing records. Each take then starts with a check instead of a navigation:
//   const { atStart } = require('../park');
//   if (!(await atStart(page, '<name>'))) { mark('wrong_view'); return; }
// Prefer on-screen labels (page.getByText, page.getByRole) to click positions: positions break when the layout
// shifts. Prints "PARKED <name>" (exit 0), "WRONG_VIEW <name>: ..." (exit 1), or "LOGIN NEEDED: ..." (exit 2), and
// a warning when a dialog is still open over the page.
const C = require('./cdp');

// Starting states, one per take: tab (the tag the take records in, default 'rec'), go (optional page load), settle
// (ms after go, default 6000), steps (optional in-app clicks), expect ({ url, text } regexes the start must match).
// e.g. 'flow-debug': { tab: 'rec', go: 'https://app.example.com/flows/123/debug',
//   steps: async ({ page, sleep }) => { await page.getByText('Interactions', { exact: true }).first().click(); await sleep(3000); },
//   expect: { url: /\/debug/, text: /\d+ Interactions/ } },
const PARK = {};

// '' when the page is in the named starting state, otherwise what is wrong.
async function startProblem(page, name) {
  const s = PARK[name]; if (!s) return `no starting state named "${name}" in capture/park.js`;
  const why = await C.signInReason(page); if (why) return 'sign-in page (' + why + ')';
  const e = s.expect || {};
  if (e.url && !e.url.test(page.url())) return `address ${page.url().split('?')[0]} does not match ${e.url}`;
  if (e.text && !e.text.test(await page.evaluate(C.DTEXT, 200000))) return `${e.text} is not on screen`;
  return '';
}
const atStart = async (page, name) => !(await startProblem(page, name));

module.exports = { PARK, startProblem, atStart };

if (require.main === module) (async () => {
  const name = process.argv[2]; const s = PARK[name];
  if (!s) { console.log(`usage: node capture/park.js <name>. Names: ${Object.keys(PARK).join(', ') || 'none yet, fill PARK in capture/park.js'}`); process.exit(1); }
  const tag = s.tab || 'rec'; const { ctx } = await C.connect(); const page = await C.tagged(ctx, tag); await C.setup(page);
  const dtext = async (n = 20000) => page.evaluate(C.DTEXT, n);
  const done = async (code, line) => { try { await page.evaluate(t => { window.name = t; }, tag); } catch (e) {} console.log(line); process.exit(code); };
  try {
    if (s.go) { await page.goto(s.go, { waitUntil: 'domcontentloaded' }); await C.sleep(s.settle ?? 6000); }
    const why = await C.signInReason(page);
    if (why) await done(2, `LOGIN NEEDED: ${name} not parked, the page looks like a sign-in page (${why}). Sign in off camera, then rerun.`);
    if (s.steps) await s.steps({ page, C, sleep: C.sleep, dtext });
  } catch (e) { await done(1, `WRONG_VIEW ${name}: a step failed (${e.message.split('\n')[0]})`); }
  const dialog = await page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog], [role=alertdialog], dialog[open], [aria-modal=true]')]
    .find(e => e.getClientRects().length > 0); return d ? (d.innerText || '').trim().split('\n')[0].slice(0, 80) || '(no text)' : ''; }).catch(() => '');
  if (dialog) console.log(`WARNING ${name}: a dialog is still open: ${dialog}`);
  const problem = await startProblem(page, name);
  if (problem.startsWith('sign-in page')) await done(2, `LOGIN NEEDED: ${name} not parked, ${problem}. Sign in off camera, then rerun.`);
  await done(problem ? 1 : 0, problem ? `WRONG_VIEW ${name}: ${problem}` : `PARKED ${name}`);
})();
