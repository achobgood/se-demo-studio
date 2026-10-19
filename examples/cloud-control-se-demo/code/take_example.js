// Take 6: the whole demo as one continuous screen share on a fresh action (Sept 20 Mexico City SD-WAN + Meraki action).
// Home -> Actions -> search Mexico -> open fresh action (live auto-analysis) -> read -> Default question -> Collaborate in Canvas
// -> Reasoning question -> read result -> ThousandEyes tab -> Mexico uplink alert -> path view -> back to the canvas
// -> Generate summary -> close report -> Share.
module.exports = async ({ page, C, mv, click, clickLoc, type, typed, wheel, mark, sleep, dtext }) => {
  const css = async () => page.addStyleTag({ content: C.HIDE_CSS + ' #onetrust-banner-sdk{display:none!important}' }).catch(() => {});
  const stable = async (minMs, maxMs, probe = () => dtext(80000)) => { // wait until text stops changing
    const t = Date.now(); let last = -1, st = 0;
    while (Date.now() - t < maxMs) { await sleep(3000); const L = (await probe()).length; if (Date.now() - t > minMs && L === last) { if (++st >= 3) break; } else st = 0; last = L; }
    return (Date.now() - t) / 1000; };
  const setMode = async (want) => {
    const other = want === 'Default' ? 'Reasoning' : 'Default';
    const cur = page.getByText(other, { exact: true }).last();
    if (await cur.isVisible().catch(() => false)) { await clickLoc(cur, 900); await sleep(1200); await clickLoc(page.getByText(want, { exact: true }).last(), 700); await sleep(1000); mark('mode_' + want); }
  };
  const ask = async (q) => {
    const box = await page.locator('[contenteditable=true]').first().boundingBox();
    await click(box.x + 80, box.y + box.height / 2, 1000); await sleep(600);
    mark('type'); await type(q, 90); await sleep(700);
    const got = await typed(); console.log('TYPED:', JSON.stringify(got));
    if (got !== q) { mark('typo'); throw new Error('typo'); }
    mark('send'); await page.keyboard.press('Enter'); await sleep(1200);
  };
  // Home
  await page.goto('https://cloud.cisco.com/home/assistant'); await sleep(11000); await css();
  mark('home'); await mv(1150, 600, 900); await sleep(2500);
  mark('tabs'); await mv(470, 30, 1300); await sleep(300);
  for (const x of [600, 760, 930, 1090, 1260, 1380, 1520]) { await mv(x, 30, 650); await sleep(250); }
  await sleep(400); await mv(1150, 560, 1000); await sleep(1500);
  mark('topactions'); await mv(800, 560, 900); await sleep(1000); await mv(1600, 560, 1100); await sleep(1200);
  mark('prompt'); await mv(1000, 745, 900); await sleep(1800);
  // Actions
  mark('actions_tab'); await clickLoc(page.getByText('Actions', { exact: true }).first(), 1000); await sleep(9000); await css();
  mark('list'); await mv(300, 500, 900); await sleep(1500);
  await clickLoc(page.getByPlaceholder('Search actions'), 900); await sleep(400);
  mark('search'); await type('Mexico', 110); await sleep(300); await page.keyboard.press('Enter'); mark('searched'); await sleep(6000);
  const card = page.getByText('SD-WAN and Meraki device connectivity and UTD connection disruptions', { exact: false }).first();
  await card.scrollIntoViewIfNeeded().catch(() => {}); const b = await card.boundingBox();
  mark('card'); await mv(b.x + 120, b.y + 12, 1000); await sleep(1800);
  await click(b.x + 120, b.y + 12, 300); mark('open');
  const tA = await stable(25000, 180000); mark('analysis_done'); console.log('auto analysis secs', tA); await css();
  // read: top (summary + related), then down through the analysis
  await page.mouse.move(1250, 520); await wheel(-12000, 20, 1400); await sleep(1500);
  mark('top'); await mv(1150, 230, 900); await sleep(3500);
  mark('related'); for (const y of [330, 400, 470, 560]) { await mv(960, y, 800); await sleep(1500); }
  mark('toanalysis'); await mv(1250, 560, 700);
  for (let i = 0; i < 4; i++) { await wheel(430, 36, 2300); await sleep(2800); }
  mark('analysis_end'); await wheel(3000, 20, 1200); await sleep(1500);
  // Default question in the action
  await setMode('Default');
  await ask("What's going on at the Mexico City site right now?");
  await mv(1500, 600, 1000); const tQ = await stable(15000, 240000); mark('answered'); console.log('answer secs', tQ); await sleep(1500);
  await page.mouse.move(1250, 560); await wheel(-1500, 20, 1200); await sleep(1200);
  mark('answer_read'); for (let i = 0; i < 6; i++) { await wheel(380, 36, 2400); await sleep(2300); }
  // Canvas + Reasoning
  mark('collab'); await clickLoc(page.getByText('Collaborate in Canvas').first(), 1200);
  for (let i = 0; i < 30; i++) { await sleep(1000); if (/\/canvas\/boards\//.test(page.url())) break; }
  await sleep(14000); await css(); mark('canvas'); console.log('CANVAS URL', page.url());
  await mv(1100, 560, 900); await sleep(2500); await mv(300, 600, 900); await sleep(2000);
  await setMode('Reasoning');
  await ask('Why are devices unreachable at the Mexico City site?');
  await mv(560, 520, 1000);
  { const t = Date.now(); while (Date.now() - t < 600000) { await sleep(4000); const s = await dtext(60000); const k = s.lastIndexOf('Why are devices unreachable'); if (k > 0 && /steps? completed/i.test(s.slice(k))) break; }
    mark('reason_done'); console.log('reasoning secs', (Date.now() - t) / 1000); }
  await sleep(5000); await css();
  mark('result_read'); await mv(300, 560, 900); await wheel(-1600, 20, 1200); await sleep(1500);
  for (let i = 0; i < 4; i++) { await wheel(380, 36, 2400); await sleep(2600); }
  mark('card'); await mv(1250, 520, 1200); await sleep(5000);
  mark('footer'); await mv(300, 1000, 900); await sleep(3500);
  // ThousandEyes, from the same top bar
  mark('tetab'); await clickLoc(page.getByText('ThousandEyes', { exact: true }).first(), 1300);
  for (let i = 0; i < 25; i++) { await sleep(1000); if (/thousandeyes\.com/.test(page.url())) break; }
  await sleep(14000); mark('te_loaded');
  try { await page.locator('#onetrust-close-btn-container button').first().click({ timeout: 2500 }); } catch (e) {}
  await css(); await mv(700, 300, 1000); await sleep(1500);
  const l = page.getByText('MEXICO-UPLINK-PUBLIC-Inet', { exact: true }).first();
  await l.evaluate(a => { const x = a.closest('a') || a; x.setAttribute('target', '_self'); }).catch(() => {});
  const lb = await l.boundingBox(); await mv(lb.x + lb.width / 2, lb.y + lb.height / 2, 1100); await sleep(1800);
  mark('alert_click'); await click(lb.x + lb.width / 2, lb.y + lb.height / 2, 200);
  for (let i = 0; i < 25; i++) { await sleep(1000); if (/network-app-synthetics/.test(page.url())) break; }
  await sleep(15000); await css(); mark('pathvis');
  await mv(1100, 380, 1200); await sleep(3500);
  mark('nodes'); await mv(1470, 740, 1300); await sleep(3000); await mv(1470, 790, 700); await sleep(2500); await mv(470, 740, 1300); await sleep(2500);
  // back to the canvas through the top bar
  mark('back'); await clickLoc(page.getByText('Canvas', { exact: true }).first(), 1200); await sleep(12000); await css();
  mark('canvas_list'); console.log('URL after Canvas', page.url());
  if (!/\/canvas\/boards\//.test(page.url())) {
    const row = page.getByText('SD-WAN and Meraki device connectivity', { exact: false }).first();
    if (await row.isVisible().catch(() => false)) { await clickLoc(row, 1100); await sleep(15000); await css(); }
  }
  mark('canvas_back'); await mv(1250, 520, 1000); await sleep(2000);
  // Generate summary
  let g = await page.locator('[aria-label="Generate summary"]').first().boundingBox().catch(() => null);
  if (!g) g = { x: 1839, y: 592, width: 40, height: 40 };
  mark('gensum'); await mv(g.x + g.width / 2, g.y + g.height / 2, 1100); await sleep(1500); await click(g.x + g.width / 2, g.y + g.height / 2, 200);
  { const t = Date.now(); while (Date.now() - t < 180000) { await sleep(3000); const s = await dtext(20000); if (/Download as PDF/.test(s)) break; } mark('report'); console.log('report secs', (Date.now() - t) / 1000); }
  await mv(960, 560, 1000); await sleep(5000); await wheel(500, 30, 2500); await sleep(3000);
  const closeBtn = page.getByText('Close', { exact: true }).last(); if (await closeBtn.isVisible().catch(() => false)) { mark('report_close'); await clickLoc(closeBtn, 900); await sleep(1500); }
  // Share
  mark('share'); await clickLoc(page.getByText('Share', { exact: true }).first(), 1100); await sleep(4000);
  mark('shared'); await mv(1300, 500, 900); await sleep(3000); mark('end');
};
