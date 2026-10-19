// Test run take: three scenes on a public cisco.com page, about 55 seconds of recording.
// rec.js already hides the OneTrust cookie banner; this also hides the chat bubble. No page.goto here, so the
// injected styles stay in place. Each scene starts with mark('sceneN'); build/edit.py plays each scene from its mark.
module.exports = async ({ page, mv, mark, sleep }) => {
  await page.addStyleTag({ content: '[id^="fw-c-modal-chat"],[class*="fw-c-modal-chat"]{display:none!important}' }).catch(() => {});
  const to = y => page.evaluate(y => window.scrollTo({ top: y, behavior: 'smooth' }), y);
  await to(0); await sleep(3000);
  mark('scene1');                                    // the top of the page
  await mv(620, 450, 1200); await sleep(1800); await mv(1300, 500, 1400);
  await sleep(14000);
  mark('scene2');                                    // scroll to the next section
  await to(880); await sleep(1600); await mv(960, 460, 1200);
  await sleep(14000);
  mark('scene3');                                    // scroll further; the camera pushes in here (build/story.js)
  await to(1960); await sleep(1600); await mv(1150, 605, 1200);
  await sleep(14000);
};
