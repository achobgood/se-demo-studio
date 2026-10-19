// AI caller audio routing, pasted into the ChatGPT tab (the person's regular Chrome, through Claude in Chrome's
// javascript tool) BEFORE voice mode starts. Run it again after any page reload. Verified 2026-10-16 (call
// test4, references/AI_CALLER.md): ChatGPT's microphone becomes BlackHole 2ch (the call), and its voice plays to
// BlackHole 16ch (into the call). window.__aiCallerLog shows each routing decision; "mic BlackHole 2ch" is logged
// only after the microphone request succeeded, so "mic FAILED" means Chrome blocked the microphone for chatgpt.com.
// The srcObject/src hook is what actually routes ChatGPT's voice (verified 2026-10-16, Contact Center test call): its
// player gets the voice stream by assignment, without a play() call. Without the hook the voice went to the Mac's
// speakers and the 16ch loopback failed. The AudioContext and RTCPeerConnection routes were present in every
// passing run and stay, but neither one alone was enough.
(([IN, OUT]) => {
  if (window.__aiCaller) return 'already';
  const md = navigator.mediaDevices, gum = md.getUserMedia.bind(md), log = window.__aiCallerLog = [];
  const find = async (kind, re) => (await md.enumerateDevices()).find(d => d.kind === kind && re.test(d.label));
  const inRe = new RegExp('^' + IN), outRe = new RegExp('^' + OUT);
  md.getUserMedia = async c => {
    if (c && c.audio) {
      const d = await find('audioinput', inRe);
      if (d) c = { ...c, audio: { ...(typeof c.audio === 'object' ? c.audio : {}), deviceId: { exact: d.deviceId } } };
      else log.push('mic: ' + IN + ' not found (is the microphone allowed for chatgpt.com?)');
      try { const s = await gum(c); log.push('mic ' + s.getAudioTracks()[0].label); return s; } catch (e) { log.push('mic FAILED ' + e.name); throw e; }
    }
    return gum(c);
  };
  const sink = async el => { try { const d = await find('audiooutput', outRe); if (d && el.sinkId !== d.deviceId) { await el.setSinkId(d.deviceId); log.push('voice ' + el.constructor.name + ' ' + d.label); } } catch (e) { log.push('voice error ' + e.message); } };
  const play = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { return sink(this).then(() => play.call(this)); };
  const AC = window.AudioContext;
  window.AudioContext = function (o) { const ac = new AC(o); sink(ac); return ac; };
  window.AudioContext.prototype = AC.prototype;
  for (const el of document.querySelectorAll('audio,video')) sink(el);
  for (const prop of ['srcObject', 'src']) {
    const d = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, prop);
    Object.defineProperty(HTMLMediaElement.prototype, prop, { configurable: true, get: d.get, set(v) { d.set.call(this, v); if (v) sink(this); } });
  }
  const PC = window.RTCPeerConnection;
  window.RTCPeerConnection = function (...a) {
    const pc = new PC(...a);
    pc.addEventListener('track', async ev => {
      if (ev.track.kind !== 'audio') return;
      const d = await find('audiooutput', outRe), el = new Audio(); el.srcObject = new MediaStream([ev.track]);
      try { await el.setSinkId(d.deviceId); await el.play(); log.push('voice copy (WebRTC) ' + d.label); } catch (e) { log.push('voice copy error ' + e.message); }
    });
    log.push('peer connection created'); return pc;
  };
  window.RTCPeerConnection.prototype = PC.prototype;
  window.__aiCaller = true; return 'patched';
})(['BlackHole 2ch', 'BlackHole 16ch']);
