# Copy lint: the copy rules a pattern can check without judgment, so neither the builder nor the claim checker
# has to remember them. Slogans, tone, "not X but Y", mirrored pairs, metrics, and causal claims need a reader and
# are left to the claim checker. Rules, with where each comes from (paths from the studio root):
#   em-dash            an em dash (or the horizontal bar, two- and three-em dashes, &mdash;, —).
#                      .claude/skills/record-demo/references/CISCO_CLAIM_RULES.md § Learner-facing copy "No em dashes.";
#                      CLAUDE.md (copy bullet); .claude/skills/record-demo/references/BUILDER_PROMPT_TEMPLATE.md § Claim rules
#   en-dash            an en dash (or &ndash;, –): the same pause in another form; the em dash rule above
#   double-hyphen      "--" standing in for a dash (in build/story.js only " -- " with spaces, since class names
#                      like mg-card--big use "--"); the em dash rule above
#   stacked-questions  two or more sentences in a row ending in "?", within one paragraph.
#                      CISCO_CLAIM_RULES.md § Learner-facing copy "no stacked rhetorical questions"; BUILDER_PROMPT_TEMPLATE.md § Claim rules
#   banned-phrase      "finds the root cause", "fixes it automatically", "sees everything"
#                      (CISCO_CLAIM_RULES.md § Wording; BUILDER_PROMPT_TEMPLATE.md § Claim rules), "most customers tell me",
#                      "I see this every week" (BUILDER_PROMPT_TEMPLATE.md § Claim rules)
#   direction          [ ] { } < > or * in the talk track: lib/take.py sends script/speech.txt to the voice as is,
#                      so a stage direction, tag, or leftover {{placeholder}} is read aloud.
#                      BUILDER_PROMPT_TEMPLATE.md § Audio "Never put directions in the spoken text". Not checked in
#                      a .md file (a storyboard draft), where Markdown uses * [ ] < > itself.
# A .md file also skips code (fences and `spans`) and stacked-questions (table cells and notes are not speech).
# A spaced hyphen is not checked: exact product and item names can contain one (CISCO_CLAIM_RULES.md § Wording).
# script/speech.txt (and any file that is not .js) gets every rule. A .js file (build/story.js) gets the dash rules
# only, inside string literals: comments and object keys are skipped, HTML tags are blanked first, and an em or en
# dash anywhere in a string hits.
# usage: python3 lib/lint_copy.py [file ...]   (from the job folder; default script/speech.txt build/story.js)
#        -> file:line: rule: text per hit; exit 1 if any
import os, re, sys

EM = re.compile(r'[—―⸺⸻]|&mdash;|&#8212;|&#x2014;|\\u2014|\\u\{2014\}', re.I)
EN = re.compile(r'–|&ndash;|&#8211;|&#x2013;|\\u2013|\\u\{2013\}', re.I)
DOUBLE_SPEECH = re.compile(r'(?<!-)--(?!-)')
DOUBLE_STORY = re.compile(r'[ \t]--[ \t]')
PHRASES = ['finds the root cause', 'fixes it automatically', 'sees everything', 'most customers tell me',
           'I see this every week']
PHRASE = re.compile(r'\b(?:%s)\b' % '|'.join(r'\s+'.join(map(re.escape, p.split())) for p in PHRASES), re.I)
DIRECTION = re.compile(r'\[[^\]\n]*\]|\{+[^}\n]*\}+|<[^>\n]*>|\*[^*\n]*\*|[\[\]{}<>*]')
END = re.compile(r'[.!?…]+["\'”’)\]]*(?=\s|$)')   # a sentence end
TAG = re.compile(r'<[^>]*>')

def line_of(text, i): return text.count('\n', 0, i) + 1

def snip(s, a, b, pad=25):   # the hit with up to pad characters each side, within its line
    lo, hi = s.rfind('\n', 0, a) + 1, s.find('\n', b); hi = len(s) if hi < 0 else hi
    x, y = max(lo, a - pad), min(hi, b + pad)
    return ('...' if x > lo else '') + s[x:y].strip() + ('...' if y < hi else '')

def dash_hits(s, story):
    for rule, pat in (('em-dash', EM), ('en-dash', EN), ('double-hyphen', DOUBLE_STORY if story else DOUBLE_SPEECH)):
        for m in pat.finditer(s): yield m.start(), rule, snip(s, m.start(), m.end())

def mask_code(text):   # blank Markdown code (fences and `spans`), keeping line breaks so line numbers hold
    blank = lambda m: re.sub(r'[^\n]', ' ', m.group(0))
    return re.sub(r'`[^`\n]*`', blank, re.sub(r'```.*?(?:```|\Z)', blank, text, flags=re.S))

def speech(text, md=False):
    if md: text = mask_code(text)
    hits = [(i, r, t) for i, r, t in dash_hits(text, False)]
    hits += [(m.start(), 'banned-phrase', ' '.join(m.group(0).split())) for m in PHRASE.finditer(text)]
    if not md:
        hits += [(m.start(), 'direction', m.group(0)[:40]) for m in DIRECTION.finditer(text)]
    for p in ([] if md else re.finditer(r'\S(?:.|\n(?!\s*\n))*', text)):   # paragraphs: blank lines separate them (lib/speech.py)
        start, run = p.start(), []
        for m in END.finditer(p.group(0)):
            if '?' in m.group(0):
                run.append((start, p.start() + m.end()))
                if len(run) == 2:
                    t = ' '.join(text[run[0][0]:run[1][1]].split())
                    hits.append((run[1][0], 'stacked-questions', t if len(t) <= 90 else t[:87] + '...'))
            else: run = []
            start = p.start() + m.end()
            while start < len(text) and text[start].isspace(): start += 1
    return [(line_of(text, i), r, t) for i, r, t in hits]

def strings(src):
    # (offset of contents, raw contents) of each string literal that is not an object key; skips // and /* */
    # comments and the ${...} code inside template literals. Regex literals are not parsed (story.js has none).
    out, n = [], len(src)
    def code(i, inner):   # scan code from i; inner: stop after the } that closes a ${
        depth = 0
        while i < n:
            c = src[i]
            if src.startswith('//', i): i = src.find('\n', i); i = n if i < 0 else i; continue
            if src.startswith('/*', i): i = src.find('*/', i + 2); i = n if i < 0 else i + 2; continue
            if c in '\'"`':
                j, parts = literal(i + 1, c)
                k = j + 1
                while k < n and src[k] in ' \t': k += 1
                if not (k < n and src[k] == ':' and len(parts) == 1): out.extend(parts)   # else an object key
                i = j + 1; continue
            if inner and c == '{': depth += 1
            if inner and c == '}':
                if not depth: return i + 1
                depth -= 1
            i += 1
        return i
    def literal(i, q):   # i just past the opening quote -> (index of the closing quote, [(offset, text) ...])
        parts, a = [], i
        while i < n and src[i] != q:
            if src[i] == '\\': i += 2; continue
            if q == '`' and src.startswith('${', i):
                parts.append((a, src[a:i])); i = a = code(i + 2, True); continue
            if q != '`' and src[i] == '\n': break
            i += 1
        parts.append((a, src[a:i]))
        return i, parts
    code(0, False)
    return out

def story(src):
    hits = []
    for at, s in strings(src):
        s = re.sub(r'<br\s*/?>', lambda m: '\n' + ' ' * (len(m.group(0)) - 1), s, flags=re.I)
        s = TAG.sub(lambda m: ' ' * len(m.group(0)), s)   # same length, so offsets still map to lines
        hits += [(line_of(src, at + i), r, t) for i, r, t in dash_hits(s, True)]
    return hits

files = sys.argv[1:] or ['script/speech.txt', 'build/story.js']
hits, checked = [], 0
for f in files:
    if not os.path.exists(f):
        print('note: %s not found, skipped' % f); continue
    text = open(f, encoding='utf-8', errors='replace').read(); checked += 1
    for ln, rule, t in sorted(story(text) if f.endswith('.js') else speech(text, f.endswith('.md'))):
        hits.append('%s:%d: %s: %s' % (f, ln, rule, t))
for h in hits: print(h)
print('%d copy hit%s in %d file%s' % (len(hits), '' if len(hits) == 1 else 's', checked, '' if checked == 1 else 's'))
sys.exit(1 if hits else 0)
