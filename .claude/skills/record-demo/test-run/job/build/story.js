// TEST RUN STORY: title, the screen share in three scenes with one push-in, and a close. No agenda, no value recap.
const STORY = {
  title: {
    kicker: 'Demo studio',
    heading: 'Test run',
    sub: 'Recording, voice, captions, and the player, checked end to end',
    disclosure: '<b>About this video.</b> A test of the demo studio with an AI-generated voice, recorded from a public cisco.com page.<br>Not a product demo and not official marketing.',
  },
  agenda: null,
  frame: {
    in: S0('page') - 0.9, out: S1('zoom') + 1.3,
    width: 1720,
    shots: [[S0('page') - 0.9, S1('zoom') + 1.0, 'take1']],
    urls: [[S0('page') - 0.9, 'cisco.com/site/us/en/products/security/hypershield']],
    chapters: [['The page', S0('page') - 0.9], ['Recording', S0('scroll') - 0.4], ['The edit', S0('zoom') - 0.4]],
    footer: 'Public cisco.com page · test run',
    lower: 'Test run · AI-generated voice',
    camera: [[S0('page') - 0.9, 960, 540, 1], [S0('zoom') + 0.6, 960, 540, 1],
             [S0('zoom') + 2.4, 1300, 480, 1.55], [S1('zoom') + 1.3, 1300, 480, 1.55]],
  },
  value: null,
  close: {
    from: S0('close') - 0.6,
    heading: 'Test run complete',
    sub: 'Next: a real demo, starting with a short interview',
    cta: '',
    cta_at: S0('close') + 1.0,
    fine: 'Test run with an AI-generated voice over a public cisco.com page. Not a product demo and not official marketing.',
  },
};
