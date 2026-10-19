# Build 30 fps footage clips from the raw screencast takes, timed to the narration cues.
# Keys map timeline seconds -> recording seconds (piecewise linear: >1x = speed ramp). Output 2560x1440 JPG sequences.
# No redaction blur: the owner said this is internal fictional demo data (2026-09-24).
import json,subprocess,sys,os,bisect,shutil,re
FF='ffmpeg'  # reference copy: the studio toolkit finds its bundled ffmpeg itself
FPS=30; OW,OH=2560,1440
C=json.load(open('build/cues.json')); SEG={s['name']:s for s in C['segments']}
S=lambda n:SEG[n]['t0']; E=lambda n:SEG[n]['t1']
norm=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
def at(w,n=1,seg=None,end=False):
  c=0
  for x in C['words']:
    if (seg is None or x['seg']==seg) and norm(x['w']).startswith(norm(w)):
      c+=1
      if c==n: return x['e'] if end else x['t']
  raise KeyError((w,n,seg))
def mono(keys):  # drop keys that would go backwards in timeline time
  out=[]
  for k in keys:
    if not out or k[0]>out[-1][0]+1e-3: out.append(k)
  return out
W1=lambda w,seg,n=1: at(w,n,seg)
Ws=W1('search','actions'); Wo=W1('open','found'); Wc=W1('Collaborate','canvas'); Wr=W1('Reasoning','mode'); Wt=W1('click','te')
Wg=W1('Generate','handoff'); Wsh=W1('Share','share')
Wcw=W1('canvas.','handoff'); Wnx=W1('next','handoff')
T_frameOut=E('share')+1.3
# v3: two continuous takes. t6 covers Home through Verify (dark-theme-free run); t7 re-records the tail
# (ThousandEyes through Share) in light theme, since t6's tail flipped to dark mid-take (see LESSONS_LEARNED).
CLIPS={'t6':dict(rec='t6',keys=[
 (S('home')-0.9,11.8),(S('home')+2.2,15.9),(S('home2'),31.0),(E('home2')+0.6,41.2),
 (S('actions')+1.4,43.1),(S('actions')+2.6,51.5),(Ws-0.4,59.6),(Ws+0.2,60.3),(Ws+1.2,61.3),
 (S('found')+0.3,63.5),(Wo-0.2,73.8),(Wo+0.3,74.3),(S('related')-0.3,235.0),
 (S('related'),258.0),(E('related')+0.5,283.0),(S('analysis'),285.0),(E('analysis')+1.0,322.0),
 (S('ask'),329.5),(S('ask')+1.6,332.7),(S('ask')+2.3,333.4),(S('ask')+8.5,341.4),(S('answer')-0.3,414.0),
 (E('answer')+1.0,426.1),
 (S('canvas'),426.2),(Wc+0.2,426.7),(Wc+1.6,434.0),(E('canvas')+1.1,445.0),
 (S('mode'),450.0),(Wr-0.3,455.4),(Wr+1.0,458.6),(Wr+1.6,459.3),(S('q1')-0.1,466.1),
 (S('q1')+1.2,468.0),(E('q1')+0.5,556.0),(S('result'),559.5),(S('result')+3.0,566.0),(E('result')-4.0,594.0),(E('result'),600.0),
 (S('verify'),601.0),(E('verify')+0.6,609.5)]),
 't7':dict(rec='t7',keys=[
 (E('verify')+0.6,20.0),(S('te'),20.5),(Wt,24.0),(Wt+0.6,31.3),(S('te')+3.3,40.0),(S('te')+5.3,53.3),
 (E('te'),58.0),(S('path'),60.0),(S('path')+0.5,62.5),(S('path')+1.9,70.0),(S('path')+4.05,78.8),
 (S('path')+6.9,82.0),(S('path')+8.9,85.3),(E('path'),95.0),
 (S('q2'),96.0),(E('q2'),103.0),
 (S('handoff'),104.0),(Wcw,107.9),(Wcw+0.9,122.6),(Wcw+1.3,124.9),(Wnx+1.1,140.0),
 (Wg-1.4,144.3),(Wg-1.1,148.4),(E('handoff'),155.0),
 (S('share'),161.4),(S('share')+1.75,168.0),(S('share')+3.2,177.8),(S('share')+3.6,180.1),
 (S('share')+4.5,181.8),(S('share')+5.5,184.4),(S('share')+6.9,188.5),(E('share'),191.0),
 (T_frameOut,193.0)])}
RAMPS=[(Wo+0.3,S('related')-0.3,'Sped up · the analysis took about 2 minutes 40 seconds'),
       (S('ask')+8.5,S('answer')-0.3,'Sped up · the answer took about 75 seconds'),
       (S('q1')+1.2,E('q1')+0.5,'Sped up · the Reasoning run took about 1 minute 30 seconds'),
       (S('te')+3.3,E('te'),'Sped up · loading ThousandEyes')]
for c in CLIPS.values(): c['keys']=mono(c['keys'])
def interp(keys,t):
  if t<=keys[0][0]: return keys[0][1]
  for (a,x),(b,y) in zip(keys,keys[1:]):
    if t<=b: return x+(y-x)*(t-a)/(b-a) if b>a else y
  return keys[-1][1]
def build_clip(name):
  c=CLIPS[name]; L=json.load(open('capture/rec/%s/log.json'%c['rec'])); t0=L['frames'][0]['t']; ts=[f['t']-t0 for f in L['frames']]
  T0,T1=c['keys'][0][0],c['keys'][-1][0]; n=int(round((T1-T0)*FPS)); lst=[]
  for i in range(n):
    s=interp(c['keys'],T0+i/FPS); j=max(0,bisect.bisect_right(ts,s)-1); lst.append(os.path.abspath('capture/rec/%s/%s'%(c['rec'],L['frames'][j]['f'])))
  cf='/tmp/_ccse_clip_%s.txt'%name
  with open(cf,'w') as f:
    for p in lst: f.write("file '%s'\nduration %.6f\n"%(p,1/FPS))
    f.write("file '%s'\n"%lst[-1])
  d='assets/tenant/clips/'+name; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
  subprocess.run([FF,'-loglevel','error','-y','-f','concat','-safe','0','-i',cf,'-vf','scale=%d:%d:flags=lanczos,fps=30'%(OW,OH),'-frames:v',str(n),'-q:v','2',d+'/f_%05d.jpg'],check=True)
  got=len(os.listdir(d)); print(name,'T0 %.2f T1 %.2f frames %d/%d'%(T0,T1,got,n))
  return {'t0':T0,'t1':T1,'n':got,'keys':c['keys'],'ramps':RAMPS}
if __name__=='__main__':
  which=sys.argv[1:] or list(CLIPS)
  meta=json.load(open('build/footage.json')) if os.path.exists('build/footage.json') else {}
  for w in which: meta[w]=build_clip(w)
  json.dump(meta,open('build/footage.json','w'),indent=1)
