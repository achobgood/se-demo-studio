# Align each take's Whisper words to the talk track, paragraph by paragraph. Prints every wording difference
# (a wrong word, a skipped phrase, a direction read aloud) and writes audio/takes/<take>_paras.json for build_voice.py.
# usage: python3 lib/check_take.py TAKE [TAKE ...]      (needs audio/takes/<take>_words.json from lib/stt.py)
import difflib, json, re, sys
from speech import paragraphs, tokens, ntok
paras = paragraphs()
stoks, pidx = [], []
for i, p in enumerate(paras):
    for t in tokens(p): stoks.append(t); pidx.append(i)
HALL = {'thank', 'you', 'thanks'}   # Whisper invents these in silence
for take in sys.argv[1:]:
    words = json.load(open('audio/takes/%s_words.json' % take))['words']
    wt, wi = [], []
    for j, x in enumerate(words):
        for t in tokens(x['word']): wt.append(t); wi.append(j)
    sm = difflib.SequenceMatcher(a=stoks, b=wt, autojunk=False)
    amap = {}; issues = {}
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op == 'equal':
            for k in range(a2 - a1): amap[a1 + k] = wi[b1 + k]
            continue
        ref = ' '.join(stoks[a1:a2]); hyp = ' '.join(wt[b1:b2])
        if ref.replace(' ', '') == hyp.replace(' ', ''):
            for k in range(a2 - a1): amap[a1 + k] = wi[min(b1 + k, b2 - 1)] if b2 > b1 else None
            continue
        if not ref and set(hyp.split()) <= HALL: continue
        p = pidx[min(a1, len(pidx) - 1)]
        issues.setdefault(p, []).append({'script': ref, 'heard': hyp})
    spans = []
    for i in range(len(paras)):
        ks = [k for k in range(len(stoks)) if pidx[k] == i and amap.get(k) is not None]
        if not ks: spans.append(None); continue
        j0, j1 = amap[ks[0]], amap[ks[-1]]
        spans.append([words[j0]['start'], words[j1]['end'], j0, j1])
    json.dump({'spans': spans, 'issues': {str(k): v for k, v in issues.items()}}, open('audio/takes/%s_paras.json' % take, 'w'), indent=1)
    missing = [i for i, s in enumerate(spans) if s is None]
    print('==', take, '| paragraphs', len(paras), '| unaligned', missing or 'none', '| paragraphs with differences', len(issues))
    for p, v in sorted(issues.items()):
        for d in v: print('  para %d: script "%s" | heard "%s"' % (p, d['script'], d['heard']))
