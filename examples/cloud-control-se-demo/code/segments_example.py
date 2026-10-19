# Assemble narration from the winning take, cut only at paragraph gaps, with authored pauses for the picture.
# Writes audio/voice.wav and build/cues.json (segments + word cues on the final timeline).
import json,subprocess,wave,array,re,sys
FF='ffmpeg'  # reference copy: the studio toolkit finds its bundled ffmpeg itself
TAKE=sys.argv[1] if len(sys.argv)>1 else 'T3_iapetus'
WAV='audio/takes/%s.wav'%TAKE; WJ='audio/takes/%s_words.json'%TAKE
# (name, anchor words, gap after in seconds)
SEGS=[('intro',['hi','and','thanks'],.7),('plan',['heres','the','plan'],.9),('home',['so','this','is'],.4),('home2',['in','the','middle'],.6),
 ('actions',['lets','go','to'],1.2),('found',['and','theres','the'],1.4),('related',['youll','see','the'],.4),('analysis',['below','that'],.9),
 ('ask',['i','want','a'],4.2),('wait',['it','hands','that'],1.6),('answer',['okay','overall'],1.2),('canvas',['when','a','problem'],1.1),
 ('mode',['now','ill','switch'],3.4),('q1',['while','that','runs'],1.0),('result',['heres','the','answer'],.6),('verify',['thats','a','solid'],.8),
 ('te',['ill','click','thousand'],.7),('path',['let','me','open'],.8),('q2',['which','brings','up'],1.0),('handoff',['back','in','the'],.7),
 ('share',['and','share','gives'],1.3),('value',['so','where','does'],.8),('cost',['and','the','last'],1.4),('close',['thats','the','demo'],0)]
INTRO=float(sys.argv[2]) if len(sys.argv)>2 else 5.0
norm=lambda w:re.sub(r'[^a-z]','',w.lower())
subprocess.run([FF,'-loglevel','error','-y','-i',WAV,'-ac','1','-ar','48000','/tmp/_ccse_take.wav'],check=True)
w=wave.open('/tmp/_ccse_take.wav'); pcm=array.array('h',w.readframes(w.getnframes())); w.close()
words=json.load(open(WJ))['words']; sr=48000; dur=len(pcm)/sr
idx=[];p=0
for name,anc,_ in SEGS:
  while not all(norm(words[p+j]['word'])==anc[j] for j in range(len(anc))):
    p+=1
    if p+len(anc)>len(words): raise SystemExit('anchor not found: %s %s'%(name,anc))
  idx.append(p); p+=1
out=array.array('h',[0]*int(INTRO*sr)); t=INTRO; cues={'take':TAKE,'segments':[],'words':[]}
for k,(name,anc,gap) in enumerate(SEGS):
  i0=idx[k]; i1=idx[k+1] if k+1<len(SEGS) else len(words)
  cut0=max(0,words[i0]['start']-0.10) if k>0 else max(0,words[0]['start']-0.05)
  if k+1<len(SEGS): cut1=min(words[i1-1]['end']+0.25,(words[i1-1]['end']+words[i1]['start'])/2+0.05)
  else: cut1=min(dur,words[-1]['end']+0.8)
  seg=pcm[int(cut0*sr):int(cut1*sr)]; n=int(0.015*sr)
  for j in range(min(n,len(seg)//2)): seg[j]=int(seg[j]*j/n); seg[-1-j]=int(seg[-1-j]*j/n)
  cues['segments'].append({'name':name,'t0':round(t,3),'t1':round(t+cut1-cut0,3),'src0':round(cut0,3),'src1':round(cut1,3)})
  for wd in words[i0:i1]:
    cues['words'].append({'w':wd['word'].strip(),'t':round(t+wd['start']-cut0,3),'e':round(t+wd['end']-cut0,3),'seg':name})
  out.extend(seg); t+=cut1-cut0; out.extend(array.array('h',[0]*int(gap*sr))); t+=gap
cues['voice_end']=round(t,3); cues['total']=round(round((t+6.5)*30)/30,3)
o=wave.open('audio/voice.wav','wb'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(out.tobytes()); o.close()
json.dump(cues,open('build/cues.json','w'),indent=1)
for s in cues['segments']: print('%-9s %7.2f %7.2f  (%.1fs)'%(s['name'],s['t0'],s['t1'],s['t1']-s['t0']))
print('voice end',round(t,2))
