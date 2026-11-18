# Fit report: does each take's footage fit the narration over it? Run after editing build/edit.py, before
# build_clips.py. Lists every pair of keys with its slope (recording seconds per timeline second) and the words
# spoken over it, so a take that runs longer than its narration shows up here instead of after build_clips.
# usage: python3 lib/fit_report.py [clip ...]
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'build'))
from timeline import C
import edit
FAST, CUT = 1.5, 0.1       # slope over FAST is flagged unless a RAMPS entry covers it; spans under CUT s are cuts
def in_ramp(a, b): return next((r[2] for r in edit.RAMPS if r[0] - 1e-3 <= a and b <= r[1] + 1e-3), None)
def words(a, b): return [x['w'] for x in C['words'] if a <= x['t'] < b]
print('slope = recording seconds per timeline second: 1.0 plays as recorded, 2.0 plays twice as fast as it was '
      'recorded, 0 is a freeze. FAST = over %.1f with no RAMPS label; RAMP = labelled speed-up; HOLD = freeze; '
      'CUT = a jump between scenes (under %.1f s).' % (FAST, CUT))
pairs = fast = 0
for name in sys.argv[1:] or list(edit.CLIPS):
    k = edit.CLIPS[name]['keys']; print('\n%s (rec %s), %d keys' % (name, edit.CLIPS[name]['rec'], len(k)))
    print('  %-15s %-15s %6s  %-6s %s' % ('timeline s', 'recording s', 'slope', 'flag', 'narration (words: first few)'))
    for (a, x), (b, y) in zip(k, k[1:]):
        pairs += 1; d = b - a; s = (y - x) / d if d > 0 else float('inf'); r = in_ramp(a, b); w = words(a, b)
        if d < CUT: flag = 'CUT'
        elif abs(y - x) < 1e-3: flag = 'HOLD'
        elif s > FAST and r: flag = 'RAMP'
        elif s > FAST: flag = 'FAST'; fast += 1
        else: flag = ''
        note = ' [%s]' % r if r and flag == 'RAMP' else ''
        print('  %6.2f-%-8.2f %6.2f-%-8.2f %6.2f  %-6s %d: %s%s' % (a, b, x, y, s, flag, len(w), ' '.join(w[:5]), note))
print('\n%d key pairs checked, %d FAST%s' % (pairs, fast, ': slow the footage (more narration, a cut, a hold) or '
      'declare the stretch in RAMPS' if fast else ''))
