# Delete one superseded raw take, one built clip, or the render chunks, and nothing outside this job (L60).
# usage: python3 lib/clean.py rec <take> | clips <clip> | chunks      (run from the job folder)
import os, shutil, sys
JOB = os.path.realpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
WHERE = {'rec': 'capture/rec', 'clips': 'assets/clips', 'chunks': 'out'}
kind = sys.argv[1] if len(sys.argv) > 1 else ''
name = 'chunks' if kind == 'chunks' else (sys.argv[2] if len(sys.argv) > 2 else '')
if kind not in WHERE or not name or name in ('.', '..') or '/' in name or '\\' in name:
    sys.exit('usage: python3 lib/clean.py rec <take> | clips <clip> | chunks')
base = os.path.join(JOB, WHERE[kind])
target = os.path.realpath(os.path.join(base, name))
if os.path.dirname(target) != os.path.realpath(base):
    sys.exit('refused: %s is not inside %s' % (target, base))
if not os.path.isdir(target):
    sys.exit('nothing to delete: %s does not exist' % os.path.relpath(target, JOB))
shutil.rmtree(target)
print('deleted', os.path.relpath(target, JOB))
