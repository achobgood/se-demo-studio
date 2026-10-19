// AI caller, Mac side: dial, hang up, and record a Webex Calling call that ChatGPT voice mode holds on its own.
// The ChatGPT side runs in the person's regular Chrome (microphone already allowed there) through Claude in
// Chrome, with capture/caller_patch.js pasted into the tab. Setup, run order, and evidence: the record-demo
// reference AI_CALLER.md.
// Audio, two BlackHole cables, no speakers or room in the path:
//   call -> Webex speaker = "BlackHole 2ch"  -> ChatGPT microphone   (recorded as the "agent" track)
//   ChatGPT voice -> "BlackHole 16ch" -> Webex microphone              (recorded as the "caller" track)
// usage: node capture/caller.js <command> [args]
//   check               both cables present and the Webex desktop app running
//   loopback            speak a test line into BlackHole 2ch (macOS say) and report BlackHole 16ch per second:
//                       proves ChatGPT hears and answers into the cable, with no phone call
//   dial <number>       place the call from the Webex desktop app (webextel: link, dials with no prompt)
//   record <name>       start recording both cables to audio/calls/<name>_{agent,caller}.wav, in the background
//   stoprec             stop the recording and print per-second peaks for both tracks
//   watch [max] [idle] [answer]   wait on the recording: end when nothing is heard on the call side within
//                       <answer> seconds (default 60, covers ringing), after <idle> seconds of silence on both
//                       tracks once talking (default 25), or at <max> seconds (default 240); then hang up and stop
//   hangup              end the Webex call (End call button in the Webex app, through macOS app control)
//   levels [seconds]    peak per second on each cable, measured one after the other
const path = require('path');
const fs = require('fs');
const { execFileSync, spawn } = require('child_process');
const JOB = path.resolve(__dirname, '..'), sleep = ms => new Promise(r => setTimeout(r, ms));
function studio() { let d = JOB; while (d !== path.dirname(d)) { if (fs.existsSync(path.join(d, '.demo-studio'))) return d; d = path.dirname(d); } throw new Error('studio root (.demo-studio) not found'); }
const FFMPEG = require(path.join(studio(), 'toolkit', 'node_modules', 'ffmpeg-static'));
const IN = 'BlackHole 2ch', OUT = 'BlackHole 16ch';
const CALLS = path.join(JOB, 'audio', 'calls'), PIDF = path.join(CALLS, '.recording.json');
const osa = js => execFileSync('osascript', ['-l', 'JavaScript', '-e', js], { encoding: 'utf8' }).trim();

// Webex desktop app: press the button that ends the call. Verified label 2026-10-16: "End call".
function hangup() {
  return osa(`const p = Application('System Events').processes.byName('Webex'); let hit = '';
    for (const w of p.windows()) { for (const b of w.entireContents()) { try {
      if (b.role() !== 'AXButton') continue; const n = [b.name(), b.description(), b.title()].join(' ');
      if (/\\b(end call|hang ?up)\\b/i.test(n)) { b.actions.byName('AXPress').perform(); hit = n.trim(); break; }
    } catch (e) {} } if (hit) break; } hit || 'NO END BUTTON FOUND (no call window: the call may already have ended)'`);
}
function recStart(name) {
  if (fs.existsSync(PIDF)) return 'already recording: ' + fs.readFileSync(PIDF, 'utf8');
  fs.mkdirSync(CALLS, { recursive: true });
  const a = path.join(CALLS, name + '_agent.wav'), c = path.join(CALLS, name + '_caller.wav');
  // One ffmpeg per cable: a single process with two avfoundation inputs dropped audio (2026-10-16 test
  // call: 126.6 s and 162.7 s of a ~182 s run), which breaks sync with the screen recording.
  // The device input also leaves timestamp gaps (8.06 s written for 10.0 s): aresample=async fills them with
  // silence so each file matches wall-clock time (20.000 s for a 20 s capture, verified 2026-10-16).
  const rec = (dev, file) => { const p = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-thread_queue_size', '4096', '-f', 'avfoundation',
    '-i', ':' + dev, '-af', 'aresample=async=1:first_pts=0,pan=mono|c0=c0', '-ar', '48000', file], { detached: true, stdio: 'ignore' }); p.unref(); return p.pid; };
  const pids = [rec(IN, a), rec(OUT, c)];
  fs.writeFileSync(PIDF, JSON.stringify({ pids, name, started: new Date().toISOString(), agent: a, caller: c }));
  return `recording ${name} (pids ${pids.join(', ')}) started ${new Date().toISOString()}`;
}
const pk = raw => { const out = []; for (let s = 0; s + 32000 <= raw.length; s += 32000) { let m = 0; for (let i = s; i < s + 32000; i += 2) m = Math.max(m, Math.abs(raw.readInt16LE(i))); out.push((m / 32768).toFixed(2)); } return out.join(' '); };
// Per-second peaks (0 to 1) of a finished WAV, or of <sec> seconds live from a cable.
const peaks = file => pk(execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-i', file, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 }));
const levels = (dev, sec) => `${dev}: ` + pk(execFileSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-f', 'avfoundation', '-i', ':' + dev, '-t', String(sec),
  '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], { maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] }));
async function recStop() {
  if (!fs.existsSync(PIDF)) return 'not recording';
  const r = JSON.parse(fs.readFileSync(PIDF, 'utf8'));
  for (const pid of r.pids || [r.pid]) { try { process.kill(pid, 'SIGINT'); } catch (e) {} }
  await sleep(1500); fs.unlinkSync(PIDF);
  return `stopped ${r.name}\nagent  (${r.agent}): ${peaks(r.agent)}\ncaller (${r.caller}): ${peaks(r.caller)}`;
}
// Peak of the last <sec> seconds of a WAV the recorder is still writing (16-bit mono 48 kHz).
function tailPeak(file, sec = 2) {
  try { const st = fs.statSync(file), len = Math.min(st.size - 44, 96000 * sec) & ~1; if (len <= 0) return 0;
    const b = Buffer.alloc(len), fd = fs.openSync(file, 'r'); fs.readSync(fd, b, 0, len, st.size - len); fs.closeSync(fd);
    let m = 0; for (let i = 0; i + 1 < len; i += 2) m = Math.max(m, Math.abs(b.readInt16LE(i))); return m / 32768; } catch (e) { return 0; }
}

(async () => {
  const [cmd, a1, a2, a3] = process.argv.slice(2);
  try {
    if (cmd === 'dial') { if (!/^\+?[0-9]{7,15}$/.test(a1 || '')) throw new Error('dial needs a number, digits only'); execFileSync('open', ['webextel:' + a1]); console.log('dialing ' + a1 + ' ' + new Date().toISOString()); }
    else if (cmd === 'hangup') console.log('hangup: ' + hangup());
    else if (cmd === 'record') console.log(recStart(a1 || 'call_' + Date.now()));
    else if (cmd === 'stoprec') console.log(await recStop());
    else if (cmd === 'levels') { const s = +(a1 || 5); console.log(levels(IN, s)); console.log(levels(OUT, s)); }
    else if (cmd === 'check') {
      const devs = execFileSync('system_profiler', ['SPAudioDataType'], { encoding: 'utf8' });
      for (const d of [IN, OUT]) console.log(`${d}: ${devs.includes(d + ':') ? 'present' : 'MISSING (references/AI_CALLER.md, Setup)'}`);
      console.log('Webex app: ' + (osa(`Application('System Events').processes.byName('Webex').exists()`) === 'true' ? 'running' : 'NOT RUNNING'));
    }
    else if (cmd === 'loopback') {
      const f = path.join(CALLS, '_loopback.wav'); fs.mkdirSync(CALLS, { recursive: true });
      const ff = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', '-f', 'avfoundation', '-i', ':' + OUT, '-t', '18', '-ac', '1', f]);
      await sleep(2000); execFileSync('say', ['-a', IN, 'Hello? This is a loopback test. What color is the sky?']);
      await new Promise(r => ff.on('exit', r));
      const p = peaks(f); console.log(`${OUT} per second: ${p}\n${p.split(' ').some(x => +x > 0.02) ? 'PASS: ChatGPT answered into ' + OUT : 'FAIL: nothing on ' + OUT}`);
    }
    else if (cmd === 'watch') {
      const max = +(a1 || 240), idle = +(a2 || 25), answer = +(a3 || 60);
      if (!fs.existsSync(PIDF)) throw new Error('not recording: run record <name> first');
      const R = JSON.parse(fs.readFileSync(PIDF, 'utf8'));
      const t0 = Date.now(), el = () => Math.round((Date.now() - t0) / 1000); let last = Date.now(), talking = false, why = 'max';
      while (el() < max) {
        await sleep(2000);
        const pa = tailPeak(R.agent), pc = tailPeak(R.caller);
        if (pa > 0.02 && !talking) { talking = true; console.log(`call side has audio at ${el()}s`); }
        if (pa > 0.02 || pc > 0.02) last = Date.now();
        if (!talking && el() > answer) { why = 'nothing heard on the call side'; break; }
        if (talking && (Date.now() - last) / 1000 > idle) { why = 'silence'; break; }
      }
      console.log(`ending (${why}) at ${el()}s; hangup: ${hangup()}`);
      console.log(await recStop());
    }
    else console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n'));
  } catch (e) { console.log('ERR ' + e.message); process.exitCode = 1; }
  process.exit();
})();
