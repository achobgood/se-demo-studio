# Print a status marker and append it with a timestamp to STATUS.md, which the supervisor watches (L75).
# usage: python3 lib/status.py "STORYBOARD READY: STORYBOARD_READY.md"   (run from the job folder)
import os, sys, time
line = ' '.join(sys.argv[1:]).strip()
if not line:
    sys.exit('usage: python3 lib/status.py "MARKER: text"')
print(line)
with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'STATUS.md'), 'a') as f:
    f.write(time.strftime('%Y-%m-%d %H:%M:%S ') + line + '\n')
