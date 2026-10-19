# TEST RUN EDIT: one take, three scenes. Each scene plays at normal speed from its mark in the take
# (capture/takes/test_run.js) and the edit cuts to the next scene's mark over a still stretch of the page.
import json, os
from common import JOB
from timeline import S, E, mono

L = json.load(open(os.path.join(JOB, 'capture', 'rec', 'take1', 'log.json')))
M = {m['k']: m['t'] - L['frames'][0]['t'] for m in L['marks']}
SCENES = [('page', 'scene1'), ('scroll', 'scene2'), ('zoom', 'scene3')]
IN, OUT = S('page') - 0.9, E('zoom') + 1.0
starts = [IN] + [S(seg) - 0.4 for seg, _ in SCENES[1:]]
ends = starts[1:] + [OUT]
keys = []
for i, ((seg, mk), a, b) in enumerate(zip(SCENES, starts, ends)):
    if i < len(SCENES) - 1: b -= 0.04            # one frame before the cut to the next scene
    keys += [(a, M[mk]), (b, M[mk] + (b - a))]

CLIPS = {'take1': dict(rec='take1', keys=keys)}
RAMPS = []
SHOTS = [(IN, OUT, 'take1')]
REDACT = []

for n, c in CLIPS.items(): c['keys'] = mono(c['keys'], n)
