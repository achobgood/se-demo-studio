// Close http and https tabs with no window.name tag (a tab a take's click opened). Never closes a tagged tab or the
// last remaining page. By default keeps an untagged tab whose address contains job.json app_match: it may be the
// original signed-in tab nobody adopted yet, and closing it would lose the session; --all closes those too.
// usage (from the job folder): node capture/closeuntagged.js [--list] [--all]   (--list only prints)
const C = require('./cdp');
(async () => {
  const list = process.argv.includes('--list'), all = process.argv.includes('--all');
  const { ctx } = await C.connect(); let left = ctx.pages().length;
  for (const p of ctx.pages()) {
    const u = p.url(), n = await p.evaluate(() => window.name).catch(() => '?');
    let why = '';
    if (n === '?') why = 'tag unreadable'; else if (n) why = 'tagged ' + JSON.stringify(n);
    else if (!/^https?:/.test(u)) why = 'not http';
    else if (!all && C.CFG.app_match && u.includes(C.CFG.app_match)) why = 'untagged app_match tab (may be the signed-in one; --all closes it)';
    else if (left <= 1) why = 'last remaining page';
    if (why) { console.log('keep ', u.slice(0, 80), ' ', why); continue; }
    console.log((list ? 'would close ' : 'close ') + u.slice(0, 80)); left--;
    if (!list) await p.close().catch(e => console.log('  close failed:', e.message));
  }
  process.exit(0);
})();
