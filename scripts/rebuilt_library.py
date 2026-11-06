"""Materialize independently authored, reference-specific complete scene programs."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sys

ROOT=Path(__file__).resolve().parents[1]
BASE=Path('assets/rebuilt-library')
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def write(p,v):Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def digest(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def safe(root,value):
 p=(Path(root)/value).resolve()
 if not p.is_relative_to(Path(root).resolve()):raise ValueError('Path escapes root')
 return p
def scene_path(ident,root=ROOT):
 slug=ident.removeprefix('software-preset:').removeprefix('fredtalk:').removeprefix('reference:')
 if not re.fullmatch(r'[a-zA-Z0-9_.-]+',slug):raise ValueError('Invalid scene ID')
 p=Path(root)/BASE/'scenes'/(slug+'.json')
 if not p.is_file():raise ValueError('This reference has not yet been independently implemented: '+ident)
 return p
def listing(root=ROOT):
 return [inspect(p.stem,root) for p in sorted((Path(root)/BASE/'scenes').glob('*.json'))]
def inspect(ident,root=ROOT):
 p=scene_path(ident,root);s=read(p)
 return {'id':s['id'],'title':s['title'],'engine':'html-seek','duration':s['duration'],
  'independent_reconstruction':True,'source':p.relative_to(root).as_posix(),'source_sha256':digest(p),
  'inputs':s.get('inputs',{}),'assets':s.get('assets',{}),'provenance':s.get('provenance',{}),
  'event_sequence':s.get('events',[]),'verification':s.get('verification',{'status':'not-rendered'}),
  'scope':'A per-reference executable scene program, not the author’s membership source. User approval is separate.'}
def scaffold(ident,out,root=ROOT):
 p=Path(out)
 if p.exists():raise ValueError('Output already exists')
 s=read(scene_path(ident,root));data={'schema':'ui-motion-fusion/independent-binding@1','id':s['id'],'mode':'production','inputs':s.get('inputs',{}),'assets':{},'media_tracks':{key:{**v,'source_in':0,'rate':1} for key,v in s.get('media_tracks',{}).items()},'required_media_slots':list(s.get('assets',{})),'duration':s['duration'],'fps':30,'purpose':'Replace content and media for the current narration; durations are explicit. Demo assets require explicit mode=demo and are never current project materials.'}
 p.parent.mkdir(parents=True,exist_ok=True);write(p,data);return {'output':str(p.resolve()),'id':s['id']}
def materialize(spec,output,root=ROOT):
 root=Path(root).resolve();spec_path=Path(spec).resolve();binding=read(spec_path);s=read(scene_path(binding['id'],root));output=Path(output).resolve()
 if output.exists():raise ValueError('Project already exists; no overwrite performed')
 mode=binding.get('mode','production')
 if mode not in ('production','demo'):raise ValueError('mode must be production or demo')
 if mode=='production':
  unbound=[key for key in s.get('assets',{}) if not binding.get('assets',{}).get(key)]
  if unbound:raise ValueError('Bind current production media; demonstration assets are not a fallback: '+', '.join(unbound))
 for key,value in binding.get('media_tracks',{}).items():
  if key not in s.get('media_tracks',{}):raise ValueError('Unknown video clock slot '+key)
  if not isinstance(value,dict) or set(value)-{'source_in','start','end','rate'}:raise ValueError('Invalid video clock binding '+key)
  if any(not isinstance(v,(int,float)) or v<0 for v in value.values()) or value.get('rate',1)!=1:raise ValueError('Video clocks require nonnegative seconds and rate=1')
 for key,value in s.get('media_tracks',{}).items():
  if mode=='production':value['source_in']=0
  value.update(binding.get('media_tracks',{}).get(key,{}))
 inputs={**s.get('inputs',{}),**binding.get('inputs',{})}
 unknown=set(binding.get('inputs',{}))-set(s.get('inputs',{}))
 if unknown:raise ValueError('Unknown content slots: '+', '.join(sorted(unknown)))
 duration=binding.get('duration',s['duration'])
 if not isinstance(duration,(int,float)) or duration<=0:raise ValueError('Positive duration required')
 if duration!=s['duration']:
  ratio=duration/s['duration']
  def retime(node):
   for keys in node.get('tracks',{}).values():
    for k in keys:k[0]*=ratio
   if 'visible' in node:node['visible']=[x*ratio for x in node['visible']]
   for n in node.get('children',[]):retime(n)
  for node in s['nodes']:retime(node)
  if s.get('camera'):retime(s['camera'])
  for event in s.get('events',[]):
   for k in ['start','end']:
    if k in event:event[k]*=ratio
  for key,clock in s.get('media_tracks',{}).items():
   for field in ('start','end'):
    if field in clock and field not in binding.get('media_tracks',{}).get(key,{}):clock[field]*=ratio
  for clock in s.get('mediaClocks',[]):
   for keyframe in clock.get('time',[]):keyframe[0]*=ratio
  s['duration']=duration
 assets={};planned=[]
 for name,default in s.get('assets',{}).items():
  value=binding.get('assets',{}).get(name)
  if value:
   p=Path(value).expanduser();p=(spec_path.parent/p).resolve() if not p.is_absolute() else p.resolve()
  else:p=safe(root,default)
  if not p.is_file():raise ValueError('Missing current/demo media for '+name)
  relative='media/'+digest(p)[:20]+p.suffix.lower();planned.append((p,relative));assets[name]=relative
 if set(binding.get('assets',{}))-set(s.get('assets',{})):raise ValueError('Unknown media slot')
 output.mkdir(parents=True)
 for rel in ['assets/agent-editorial/agent-editorial.js','assets/agent-editorial/motion-core.js',str(BASE/'scene-runtime.js').replace('\\','/')]:
  dest=output/'lib'/Path(rel).name;dest.parent.mkdir(exist_ok=True);shutil.copy2(root/rel,dest)
 extension_tags=[]
 for rel in s.get('extensions',[]):
  src=safe(root/BASE,rel)
  if not src.is_file() or src.suffix!='.js':raise ValueError('Missing scene extension: '+str(rel))
  dest=output/'lib'/rel;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest)
  import html
  extension_tags.append('<script src="'+html.escape('lib/'+rel,quote=True)+'"></script>')
 font=root/'assets/base-skill/assets/portable-studio/fonts/NotoSansSC.ttf';target=output/'fonts/NotoSansSC.ttf';target.parent.mkdir()
 try:os.link(font,target)
 except OSError:shutil.copy2(font,target)
 for src,rel in planned:
  dest=output/rel;dest.parent.mkdir(exist_ok=True)
  if not dest.exists():
   try:os.link(src,dest)
   except OSError:shutil.copy2(src,dest)
 js='window.REBUILT_SPEC='+json.dumps(s,ensure_ascii=False).replace('<','\\u003c')+';\nwindow.REBUILT_INPUTS='+json.dumps(inputs,ensure_ascii=False).replace('<','\\u003c')+';\nwindow.REBUILT_ASSETS='+json.dumps(assets,ensure_ascii=False).replace('<','\\u003c')+';\n'
 (output/'scene.js').write_text(js,encoding='utf-8')
 (output/'index.html').write_text('''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><style>@font-face{font-family:Noto;src:url(fonts/NotoSansSC.ttf)}*{box-sizing:border-box}html,body{margin:0;background:white;overflow:hidden}canvas{display:block;width:100vw;height:100vh;object-fit:contain}</style><canvas id="scene" width="1920" height="1080"></canvas><script src="lib/motion-core.js"></script><script src="lib/agent-editorial.js"></script><script src="lib/scene-runtime.js"></script><script src="scene.js"></script><script>
const canvas=document.getElementById('scene'),ctx=canvas.getContext('2d'),images={};let engine,time=0,play=false,last=0,readyPromise;window.__sceneTrace=[];
const loaded=Promise.all(Object.entries(REBUILT_ASSETS).map(([id,url])=>new Promise((resolve,reject)=>{const isVideo=/\\.(mp4|webm|mov|m4v)(?:$|[?#])/i.test(url);const media=isVideo?document.createElement('video'):new Image();const ready=()=>{images[id]=media;resolve()};media.onerror=()=>reject(Error('Failed media '+id));if(isVideo){media.muted=true;media.playsInline=true;media.preload='auto';media.addEventListener('loadeddata',ready,{once:true});}else media.onload=ready;media.src=url;if(isVideo)media.load();})));
window.ready=()=>readyPromise??=(async()=>{await loaded;await document.fonts.load('32px Noto');await document.fonts.ready;engine=RebuiltScene.create(REBUILT_SPEC,{inputs:REBUILT_INPUTS,assets:images,assetUrls:REBUILT_ASSETS});if(engine.ready)await engine.ready();if(engine.prepare)await engine.prepare(0);engine.draw(ctx,0);return true;})();
window.seek=async(t)=>{if(!engine)throw Error('Call ready first');time=Math.max(0,Math.min(REBUILT_SPEC.duration,t));if(engine.prepare)await engine.prepare(time);const state=engine.draw(ctx,time);if(window.__sceneTrace.length<1000)window.__sceneTrace.push(state);return state};window.render=window.seek;
canvas.onclick=()=>{play=!play;last=performance.now()};async function tick(now){if(play&&engine){time+=(now-last)/1000;if(time>REBUILT_SPEC.duration){time=REBUILT_SPEC.duration;play=false;}await window.seek(time);}last=now;requestAnimationFrame(tick)}window.ready().then(()=>requestAnimationFrame(tick)).catch(e=>{window.__runtimeError=e.message;throw e});
</script></html>'''.replace('<script src="scene.js"></script>',''.join(extension_tags)+'<script src="scene.js"></script>'),encoding='utf-8')
 config={'schema':'ui-motion-fusion/library-project@1','id':s['id'],'engine':'html-seek','entry':'index.html','duration':s['duration'],'width':1920,'height':1080,'fps':binding.get('fps',30),'runtime_status':'not-rendered','source_video_required':False,'independent_reconstruction':True,'demo_content':mode=='demo','user_approved':False,'source_sha256':digest(scene_path(binding['id'],root))}
 write(output/'library-project.json',config);write(output/'library-binding.json',binding)
 return {'project':str(output),'id':s['id'],'duration':s['duration'],'independent_reconstruction':True}
def main(argv=None):
 p=argparse.ArgumentParser(description=__doc__);sub=p.add_subparsers(dest='command',required=True);sub.add_parser('list')
 q=sub.add_parser('inspect');q.add_argument('--id',required=True)
 q=sub.add_parser('scaffold');q.add_argument('--id',required=True);q.add_argument('--out',type=Path,required=True)
 q=sub.add_parser('build');q.add_argument('--spec',type=Path,required=True);q.add_argument('--out',type=Path,required=True)
 a=p.parse_args(argv)
 try:result=listing() if a.command=='list' else inspect(a.id) if a.command=='inspect' else scaffold(a.id,a.out) if a.command=='scaffold' else materialize(a.spec,a.out)
 except (ValueError,OSError,KeyError) as e:p.error(str(e))
 print(json.dumps(result,ensure_ascii=False,indent=2));return 0
if __name__=='__main__':sys.exit(main())
