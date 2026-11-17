// JOB-SPECIFIC STORY: every word on screen and every camera move, keyed to the narration.
// Helpers (from engine.js): S0('segment') start, S1('segment') end, W('word', 'segment') word time, TOTAL.
// scenes.js turns this into the picture; you normally edit only this file and build/edit.py.
// Copy rules: no em dashes, no slogan stacks, on-screen text must not repeat the narration.
const STORY = {
  // 1. Title card with the disclosure (runs from 0 until the agenda or the screen share starts)
  title: {
    kicker: 'Virtual SE demo',
    heading: 'Product name',
    sub: 'One sentence on the story this demo follows',
    disclosure: '<b>About this video.</b> A virtual systems engineer demo with an AI-generated voice. The SE is not a real person.<br>Recorded in a demo environment with fictional data. Not official marketing.',
  },
  // 2. Optional agenda card: items light up as the SE names them. Set to null to skip.
  agenda: {
    from: S0('plan') - 0.4,
    kicker: 'Today', heading: 'The plan for today',
    items: [['Start in one place', W('start', 'plan')], ['Investigate', W('investigate', 'plan')], ['Hand off', W('hand', 'plan')]],
    note: 'Demo company: fictional.',
  },
  // 3. The screen share: recorded takes in a slim browser frame
  frame: {
    in: S0('walkthrough') - 0.9, out: S1('walkthrough') + 1.3,
    width: 1720,
    shots: [[S0('walkthrough') - 0.9, S1('walkthrough') + 1.0, 'take1']],          // [from, to, clip] (same as SHOTS in edit.py)
    urls: [[S0('walkthrough') - 0.9, 'app.example.com/home']],                        // [from, address-bar text]
    chapters: [['Start in one place', S0('walkthrough') - 0.9]],                      // [label, from]
    footer: 'Real product UI · demo environment, fictional data',
    lower: 'Virtual SE demo · AI-generated voice',
    // camera keys [time, x, y, zoom] in 1920x1080 capture pixels; zoom 1 = whole screen. Push in to make
    // text readable instead of adding callouts. Keys must be in time order (checked at load).
    camera: [[S0('walkthrough') - 0.9, 960, 540, 1], [S1('walkthrough'), 960, 540, 1]],
  },
  // 4. Optional value recap. Set to null to skip.
  value: {
    kicker: 'Where the value comes from',
    items: [['First value point, sourced', 'Qualifier in plain words', W('first', 'value')]],
    fine: '',
  },
  // 5. Close
  close: {
    from: S0('close') - 0.6,
    heading: 'Product name',
    sub: 'One plain line',
    cta: 'Learn more at <b style="color:#fff;font-weight:600">cisco.com</b>',
    cta_at: S0('close') + 1.0,
    fine: 'Virtual SE demo with an AI-generated voice, recorded in a demo environment with fictional data. Not official marketing.',
  },
};

// ---------- Illustrative motion segments (build/motion.js), optional ----------
// Use only for steps the owner agreed cannot be shown in the environment (L92). Abstract lanes, cards, tokens and
// chips with plain-text product names; never a mock product screen, a logo, or a timing claim. Cut back to the
// real screen that backs each segment. Example (times come from the narration, like everything else):
// const card = (x, y, w, small, text, at, o = {}) => Object.assign({ cls: 'mg-card', html: `<small>${small}</small>${text}`, x, y, w, at }, o);
// STORY.motionLabel = 'Illustrative · a pattern you configure';
// STORY.motion = [{ from: S0('handoff') - 0.2, to: S1('handoff') + 0.6, kicker: 'Illustrative · not in this lab',
//   title: 'The handoff', els: [
//     { cls: 'mg-lane', x: 120, y: 230, w: 800, h: 730 }, { cls: 'mg-lane-h', html: 'Product A', x: 150, y: 254 },
//     card(160, 300, 668, 'Request · example', 'Contain client', W('request', 'handoff'), { sfx: 'pop' }),
//     // a moves key is the arrival time: the token holds, then springs over in about 0.23 s (ui) and lands on 'arrives'
//     { cls: 'mg-token', html: 'request', x: 560, y: 470, at: W('sends', 'handoff'), spring: 'ui', sfx: 'whoosh',
//       moves: [[W('arrives', 'handoff'), 1040, 430]] },
//     // swap changes the text inside one element (no second element on top); the box springs to the new size
//     { cls: 'mg-chip', html: 'Approval required', x: 960, y: 560, at: W('approval', 'handoff'), spring: 'ui',
//       sfx: 'tick', swap: [[W('approved', 'handoff'), 'Approved · example']] },
//     { cls: 'mg-card', html: 'Contained', x: 960, y: 700, w: 520, at: W('contained', 'handoff'), spring: 'heavy' },
//   ] }];
// STORY.tags = [[W('fair', 'q1'), E('q1'), 'Customer question 1 of 3']];
STORY.motion = STORY.motion || [];
STORY.tags = STORY.tags || [];
