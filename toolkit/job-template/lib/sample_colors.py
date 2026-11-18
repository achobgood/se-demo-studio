# Sample colours from a footage frame or still, for the stage palette (references/STAGE_ENGINE.md, Palette).
# usage: python3 lib/sample_colors.py <image> x,y[,r] [x,y,r,max] [x,y,r,min] ... [--against '#rrggbb' ...]
#   x,y,r      the average colour of the (2r+1) by (2r+1) box centred on x,y (pixels of the image itself; r defaults to 3)
#   x,y,r,max  the brightest pixel in the box and the most saturated one (ink on a dark UI, links, brand colour)
#   x,y,r,min  the darkest pixel in the box and the most saturated one (ink on a light UI)
#   --against  add each colour's contrast ratio against this colour (the ground or the panel), by the WCAG formula, and
#              flag one under 3:1 (too faint for drawings, WCAG 1.4.11) or under 4.5:1 (too faint for text, WCAG 1.4.3).
#              Quote the colour ('#24282d'); the # is optional. Give it more than once for one column per colour.
# The first line prints the image's size: clips are 2560x1440, other captures may differ, so read points off this size.
# Every box must lie inside the image; the script stops on one that does not.
import re, subprocess, sys
from common import FF

USAGE = "usage: python3 lib/sample_colors.py <image> x,y[,r][,max|min] ... [--against '#rrggbb']"
args, against = [], []
i = 1
while i < len(sys.argv):
    a = sys.argv[i]
    if a == '--against' or a.startswith('--against='):
        val = a.split('=', 1)[1] if '=' in a else (sys.argv[i + 1] if i + 1 < len(sys.argv) else '')
        i += 1 if '=' in a else 2
        if not re.fullmatch(r'#?[0-9a-fA-F]{6}', val): sys.exit(f"--against needs a colour like '#24282d' (quoted), not '{val}'")
        against.append('#' + val.lstrip('#').lower())
    else: args.append(a); i += 1
if len(args) < 2: sys.exit(USAGE)
img = args[0]
probe = subprocess.run([FF, '-i', img], capture_output=True, text=True).stderr
m = re.search(r', (\d{2,5})x(\d{2,5})', probe)
if not m: sys.exit(f'could not read the size of {img}')
w, h = map(int, m.groups())
print(f'image {w}x{h}')
raw = subprocess.run([FF, '-loglevel', 'error', '-i', img, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
hexc = lambda c: '#%02x%02x%02x' % tuple(c)

def lum(c):  # WCAG relative luminance of an sRGB colour
    l = [v / 255 / 12.92 if v / 255 <= 0.04045 else ((v / 255 + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2]

def ratio(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)

def contrast(c):  # the contrast column, rounded to 2 places; one just under a floor that would round up to it gets 3 places, cut
    out = []
    for g in against:
        r = ratio(c, tuple(int(g[k:k + 2], 16) for k in (1, 3, 5)))
        n = f'{int(r * 1000) / 1000:.3f}' if any(r < f <= round(r, 2) for f in (3, 4.5)) else f'{r:.2f}'
        s = f'{n}:1 on {g}'
        if r < 3: s += ' (under 3:1: faint for drawings and text)'
        elif r < 4.5: s += ' (under 4.5:1: drawings only, not text)'
        out.append(s)
    return ('  ' + '  '.join(out)) if out else ''

if against: print(f"contrast against {', '.join(against)}: drawings need 3:1 (WCAG 1.4.11), text 4.5:1 (WCAG 1.4.3)")
for p in args[1:]:
    parts = p.split(','); mode = parts[-1] if parts[-1] in ('max', 'min') else None
    try: v = [int(x) for x in (parts[:-1] if mode else parts)]
    except ValueError: sys.exit(f'{p}: points are whole pixels of the {w}x{h} image, written x,y[,r][,max|min]')
    if not 2 <= len(v) <= 3: sys.exit(f'{p}: write a point as x,y[,r][,max|min]')
    x, y = v[0], v[1]; r = v[2] if len(v) > 2 else 3
    if r < 0: sys.exit(f'{p}: the box radius r must be 0 or more')
    if x - r < 0 or y - r < 0 or x + r >= w or y + r >= h:
        hint = f' A point read off a 1920 px wide preview of this image is x {w / 1920:.3f} here.' if w != 1920 else ''
        sys.exit(f'{p}: the box ({x - r},{y - r} to {x + r},{y + r}) falls outside the {w}x{h} image '
                 f'(x 0 to {w - 1}, y 0 to {h - 1}).{hint}')
    px = [tuple(raw[(yy * w + xx) * 3:(yy * w + xx) * 3 + 3]) for yy in range(y - r, y + r + 1) for xx in range(x - r, x + r + 1)]
    sat = max(px, key=lambda c: max(c) - min(c))
    if mode == 'max': hi = max(px, key=sum); print(f'{p}  brightest {hexc(hi)}{contrast(hi)}  most saturated {hexc(sat)}{contrast(sat)}')
    elif mode == 'min': lo = min(px, key=sum); print(f'{p}  darkest {hexc(lo)}{contrast(lo)}  most saturated {hexc(sat)}{contrast(sat)}')
    else: avg = [round(sum(c[k] for c in px) / len(px)) for k in range(3)]; print(f'{p}  {hexc(avg)}{contrast(avg)}')
