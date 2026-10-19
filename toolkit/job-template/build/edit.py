# JOB-SPECIFIC EDIT: which recorded take is on screen when, and how recording time maps to narration time.
# Each clip: rec = folder under capture/rec/, keys = [(timeline_seconds, recording_seconds), ...].
# Between keys playback is linear; a steeper slope is a speed ramp (declare it in RAMPS so the viewer is told).
# Recording seconds come from capture/rec/<take>/log.json (use lib/recsheet.py to find moments).
# Replace the example below with your own. See examples/cloud-control-se-demo/code/edit_example.py for a
# complete five-minute edit with two takes and four speed ramps.
from timeline import S, E, W, mono

CLIPS = {
    'take1': dict(rec='take1', keys=[
        (S('walkthrough') - 0.9, 2.0),          # frame flies in just before the SE starts talking about the screen
        (E('walkthrough') + 1.0, 2.0 + (E('walkthrough') + 1.9 - S('walkthrough'))),
    ]),
}
# (timeline_from, timeline_to, label shown as a small chip while the footage is sped up)
RAMPS = []
# Which clip is on screen when (used for sound effects; keep in step with SHOTS in build/story.js)
SHOTS = [(S('walkthrough') - 0.9, E('walkthrough') + 1.0, 'take1')]
# Redaction regions for lib/redact.py: (clip, rec_from, rec_to, x, y, w, h, why) in recording seconds and
# 1920x1080 CSS pixels, e.g. ('take1', 12.0, 30.5, 1420, 712, 160, 40, 'caller number').
REDACT = []

for n, c in CLIPS.items(): c['keys'] = mono(c['keys'], n)
