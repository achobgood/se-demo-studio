# Subtle UI sound kit (48 kHz mono): a mouse click and six keyboard keys, plus three soft motion-segment sounds
# (whoosh, tick, pop; placed by the sfx field in STORY.motion), synthesized in pure Python.
# usage: python3 lib/sfx.py   -> audio/sfx/click.wav, key0..key5.wav, whoosh.wav, tick.wav, pop.wav
import math, random, wave, array
SR = 48000; random.seed(11)
def write(name, x, gain):
    peak = max(1e-9, max(abs(v) for v in x)); a = array.array('h', [int(max(-1, min(1, v / peak * gain)) * 32000) for v in x])
    w = wave.open('audio/sfx/' + name + '.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(a.tobytes()); w.close()
def lp(x, a):
    y = 0; out = []
    for v in x: y += a * (v - y); out.append(y)
    return out
def click():  # soft two-part mouse click (down + up)
    n = int(.09 * SR); x = [0.0] * n
    for off, amp in ((0, 1.0), (int(.055 * SR), .6)):
        for i in range(int(.012 * SR)):
            t = i / SR; x[off + i] += amp * (math.sin(2 * math.pi * 2100 * t) * .5 + random.uniform(-1, 1)) * math.exp(-t / .0018)
    return lp(x, .35)
def key(seed):
    random.seed(seed); n = int(.05 * SR); f = random.uniform(900, 1500)
    return lp([(random.uniform(-1, 1) * .8 + math.sin(2 * math.pi * f * i / SR) * .4) * math.exp(-i / SR / random.uniform(.004, .007)) for i in range(n)], .25)
def whoosh():  # soft air: noise under a half-sine envelope, low-passed with a cutoff that opens and closes
    random.seed(21); n = int(.35 * SR); y = 0; out = []
    for i in range(n):
        k = i / n; env = math.sin(math.pi * k) ** 2; y += (.05 + .25 * env) * (random.uniform(-1, 1) - y); out.append(y * env)
    return lp(out, .5)
def tick():  # short muted tick for a chip or status landing
    n = int(.03 * SR); return lp([math.sin(2 * math.pi * 1800 * i / SR) * math.exp(-i / SR / .006) for i in range(n)], .45)
def pop():  # rising sine for a card or token arriving
    n = int(.12 * SR); ph = 0; out = []
    for i in range(n):
        k = i / n; ph += 2 * math.pi * (600 + 900 * k) / SR; out.append(math.sin(ph) * math.sin(math.pi * min(1, k * 8)) * math.exp(-k * 5))
    return lp(out, .4)
write('click', click(), .8)
for k in range(6): write('key%d' % k, key(k), .7)
write('whoosh', whoosh(), .6); write('tick', tick(), .5); write('pop', pop(), .55)
print('ok')
