// Example take script: start from a fresh load (so the theme and layout are predictable), move and click like a
// person, type a question at human speed, verify it, submit, and wait for the answer while the screencast runs.
// Coordinates are CSS pixels in the 1920x1080 viewport. Find them during rehearsal with capture/tab.js.
// See examples/cloud-control-se-demo/code/take_example.js for a complete recorded take.
module.exports = async ({ page, C, mv, click, clickLoc, type, typed, wheel, mark, sleep, dtext }) => {
  await page.goto(C.CFG.app_url, { waitUntil: 'domcontentloaded' });
  await sleep(6000);                                   // let the page settle; this stretch is trimmed in the edit
  mark('home-ready');
  await mv(960, 400, 900); await sleep(1200);          // the SE's pointer drifts toward what they are describing
  // await clickLoc(page.getByRole('link', { name: 'Actions' }));
  // await click(640, 980); await type('What is going on at the Mexico City site right now?');
  // if ((await typed()) === 'What is going on at the Mexico City site right now?') await page.keyboard.press('Enter');
  // mark('asked'); await sleep(90000);                // long waits are sped up in the edit and labeled on screen
  await sleep(1500);
};
