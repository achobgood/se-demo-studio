# Shared reading of the talk track. script/speech.txt holds one paragraph per segment, separated by blank lines,
# in the same order as script/segments.json. Respellings (spoken form -> written form) live in job.json "respell",
# e.g. {"S D WAN": "SD-WAN", "Thousand Eyes": "ThousandEyes"}; captions and alignment use the written form.
import json, os, re
from common import JOB, job_config

def respell():
    return job_config().get('respell', {})

def paragraphs(written=True):
    txt = open(os.path.join(JOB, 'script', 'speech.txt')).read()
    if written:
        for spoken, w in respell().items():
            txt = txt.replace(spoken, w)
    return [p.strip() for p in re.split(r'\n\s*\n', txt) if p.strip()]

def segments():
    d = json.load(open(os.path.join(JOB, 'script', 'segments.json')))
    segs = d['segments']; paras = paragraphs()
    if len(segs) != len(paras):
        raise SystemExit('script/segments.json has %d segments but script/speech.txt has %d paragraphs; they must match 1:1.' % (len(segs), len(paras)))
    return d, segs

def ntok(s):
    return re.sub(r'[^a-z0-9]', '', s.lower())

def tokens(text):
    return [t for t in (ntok(p) for p in re.split(r'[\s\-]+', text)) if t]
