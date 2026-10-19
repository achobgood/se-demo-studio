# Final mix: voice (EQ, light compression), music only inside the windows set in job.json, ducked under the voice,
# and the quiet recorded click/key effects. Mastered to -16 LUFS integrated.
# job.json "music": {"file": "audio/music/bed1.wav", "level_db": -9, "windows": [["intro","plan"], ["close", null]]}
#   each window runs from the start of the first segment (or 0 for the first) to the end of the second segment
#   (null = to the end of the video). The bed restarts at its beginning in each window.
# usage: python3 lib/mix.py out/mix.wav
import array, json, os, sys, wave
from common import run_ff, job_config, JOB
out = sys.argv[1]; C = json.load(open('build/cues.json')); TOT = C['total']; SEG = {s['name']: s for s in C['segments']}
SR = 48000; n = int(TOT * SR); fx = array.array('f', [0.0]) * n
if os.path.exists('build/sfx_events.json'):
    for name, t, g in json.load(open('build/sfx_events.json')):
        w = wave.open('audio/sfx/%s.wav' % name); a = array.array('h', w.readframes(w.getnframes())); w.close(); o = int(t * SR)
        for i, v in enumerate(a):
            if 0 <= o + i < n: fx[o + i] += v / 32768 * g
fxw = os.path.join(JOB, 'build', '_fx.wav')
w = wave.open(fxw, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
w.writeframes(array.array('h', [int(max(-1, min(1, v)) * 32767) for v in fx]).tobytes()); w.close()
M = job_config().get('music') or {}
inputs = ['-i', 'audio/voice.wav', '-i', fxw]
fc = [f'[0:a]aresample={SR},highpass=f=70,equalizer=f=220:t=q:w=1:g=-1.5,equalizer=f=3200:t=q:w=1.2:g=1.5,'
      f'acompressor=threshold=-21dB:ratio=2.5:attack=5:release=120:makeup=2.5dB,apad=whole_dur={TOT},atrim=0:{TOT},asplit=2[vo][sc]',
      f'[1:a]aresample={SR},volume=-6dB,apad=whole_dur={TOT},atrim=0:{TOT}[fx]']
mix_in = ['[vo]', '[fx]']
if M.get('file') and M.get('windows'):
    inputs += ['-i', M['file']]; lvl = M.get('level_db', -9); parts = []
    for k, (a, b) in enumerate(M['windows']):
        t0 = 0.0 if k == 0 and a == C['segments'][0]['name'] else max(0, SEG[a]['t0'] - 1.0)
        t1 = TOT if b is None else min(TOT, SEG[b]['t1'] + 1.5)
        d = t1 - t0; fi = 0 if t0 == 0 else 1.2
        fc.append(f"[2:a]aresample={SR},atrim=0:{d},asetpts=PTS-STARTPTS,afade=t=in:d={fi},afade=t=out:st={max(0, d - 2.2)}:d=2.2,"
                  f"volume={lvl}dB,adelay={int(t0 * 1000)}|{int(t0 * 1000)},apad=whole_dur={TOT},atrim=0:{TOT}[m{k}]")
        parts.append(f'[m{k}]')
    fc.append(''.join(parts) + f'amix=inputs={len(parts)}:normalize=0,aformat=channel_layouts=mono[mus]')
    fc.append('[mus][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=400[duck]')
    mix_in.append('[duck]')
else:
    fc.append('[sc]anullsink')
fc.append(''.join(mix_in) + f'amix=inputs={len(mix_in)}:normalize=0:duration=first,alimiter=limit=0.9:level=false,loudnorm=I=-16:TP=-1.5:LRA=9[o]')
run_ff(inputs + ['-filter_complex', ';'.join(fc), '-map', '[o]', '-ar', str(SR), '-ac', '2', out])
print('wrote', out)
