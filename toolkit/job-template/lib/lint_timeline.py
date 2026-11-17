# Timeline lint: every frame must be a pure function of t, so the page code may not read the clock, run timers,
# use unseeded randomness, or let CSS animate between frames. Also flags will-change, which leaves text blurry on
# anything the camera scales. One exemption: the base .layer rule in comp.html. Layers are never scaled (the camera
# scales .cam inside the frame), and that rule keeps Chrome's compositing the same on every render, so
# render.js same gives byte-identical frames; without it, frames depend on which times were rendered before.
# Scans build/*.js (not render.js, which runs in Node and only drives the page) and build/comp.html; whole-line
# comments are skipped.
# usage: python3 lib/lint_timeline.py   (from the job folder)  -> file:line warnings; exit 1 if any
import glob, os, re, sys
RULES = [
    (r'\bMath\.random\b', 'Math.random: unseeded randomness differs per render; use a fixed table or a seeded generator'),
    (r'\bDate\.now\b|\bnew Date\(\s*\)', 'Date.now / new Date(): reads the clock; derive everything from t'),
    (r'\bperformance\.now\b', 'performance.now: reads the clock; derive everything from t'),
    (r'\bsetTimeout\b|\bsetInterval\b', 'timer: frames are rendered out of order; set the state from t instead'),
    (r'\brequestAnimationFrame\b', 'requestAnimationFrame: frames are rendered out of order; set the state from t instead'),
    (r'will-change|\bwillChange\b', 'will-change: text goes blurry on anything the camera scales; remove it'),
]
CSS_ANIM = re.compile(r'\b(transition|animation)(?:-[a-z-]+)?\s*:\s*([^;}"\'`]*)')
JS_ANIM = re.compile(r'\.style\.(transition|animation)\w*\s*=\s*[\'"`]([^\'"`]*)')
LAYER = re.compile(r'^\s*\.layer\s*\{')  # the base layer rule (see above)
COMMENT = re.compile(r'^\s*(//|/\*|\*|<!--)')
files = sorted(f for f in glob.glob('build/*.js') if os.path.basename(f) != 'render.js') + ['build/comp.html']
hits = []
for f in files:
    if not os.path.exists(f): continue
    for n, line in enumerate(open(f, encoding='utf-8', errors='replace'), 1):
        if COMMENT.match(line): continue
        line = re.sub(r'(?<![:\'"\\\w])//.*$', '', line)  # trailing comment (not the // in file:// or a string)
        for pat, why in RULES:
            if re.search(pat, line) and not (pat.startswith('will') and LAYER.match(line)): hits.append('%s:%d: %s' % (f, n, why))
        for m in list(CSS_ANIM.finditer(line)) + list(JS_ANIM.finditer(line)):
            if m.group(2).strip().lower() not in ('none', ''):
                hits.append('%s:%d: CSS %s "%s": the browser animates between frames; drive it from t instead' % (f, n, m.group(1), m.group(2).strip()[:40]))
for h in hits: print(h)
print('%d timeline warning%s in %d files' % (len(hits), '' if len(hits) == 1 else 's', len(files)))
sys.exit(1 if hits else 0)
