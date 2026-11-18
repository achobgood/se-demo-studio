// Rehearse a take with no screencast: runs rec.js with DRY=1 and the same arguments. Nothing in capture/rec/ changes.
// usage: TAG=rec node capture/dry.js <take> capture/takes/<script>.js
// Output: MARK lines (seconds from the run start) and capture/dry/<take>.json (marks and clicks).
const { spawnSync } = require('child_process'); const path = require('path');
const r = spawnSync(process.execPath, [path.join(__dirname, 'rec.js'), ...process.argv.slice(2)], { stdio: 'inherit', env: { ...process.env, DRY: '1' } });
process.exit(r.status === null ? 1 : r.status);
