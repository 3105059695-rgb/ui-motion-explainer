"""Build and execute retained source, with explicit current-content bindings.

No original animation is replaced by a generic scene. A successful source copy
is not runtime success; inspect reports each distinct readiness stage.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
from library_ui_style import adapt_project, content_scope, STYLE_SCOPE

ROOT=Path(__file__).resolve().parents[1]
MANIFEST='assets/library-runtime/implementations.json'
CODE_SUFFIXES={'.tsx','.ts','.jsx','.js','.mjs','.cjs','.json','.css','.txt','.py'}

def read(path):return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def write(path,value):
 path=Path(path);path.parent.mkdir(parents=True,exist_ok=True)
 path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def safe(root,name):
 if not isinstance(name,str) or not name or '\\' in name or ':' in name:raise ValueError('Expected portable relative path: '+str(name))
 p=(Path(root)/name).resolve()
 if not p.is_relative_to(Path(root).resolve()):raise ValueError('Path escapes root: '+name)
 return p

def media_source(value,root=ROOT):
 """Portable packaged assets plus existing absolute/current-directory bindings."""
 if isinstance(value,str) and value.startswith('skill://'):
  return safe(root,value.removeprefix('skill://'))
 return Path(value).expanduser().resolve()
def _rebuilt(ident,root):
 slug=ident.removeprefix('software-preset:').removeprefix('fredtalk:').removeprefix('reference:')
 if re.fullmatch(r'[a-zA-Z0-9_.-]+',slug) and (Path(root)/'assets/rebuilt-library/scenes'/(slug+'.json')).is_file():
  import rebuilt_library
  return rebuilt_library
 return None
def _fred(root,ident):
 ident=ident.removeprefix('software-preset:')
 rows=read(Path(root)/'assets/fredtalk-library/catalog.json')['items']
 row=next((r for r in rows if r['id']==ident),None)
 if not row:raise ValueError('Unknown source ID: '+ident)
 if row['source_access']!='public':raise ValueError('This is not a public source implementation; no member access attempted')
 return row
def _record(root,ident):
 p=Path(root)/MANIFEST
 if p.is_file():
  records=read(p).get('items',[])
  row=next((r for r in records if r['id']==ident or r.get('catalog_id')==ident),None)
  if row:return row
 if ident.removeprefix('capability:') in ['F%02d'%i for i in range(1,9)]:
  scene=ident.removeprefix('capability:')
  return {'id':'capability:'+scene,'engine':'fusion-original','scene':scene,'duration':9,'width':1920,'height':1080,'fps':50}
 if ident.startswith('sample:'):
  if ident in ('sample:A01','sample:user-ui/girl-agent-sample-20261015'):
   girl=ident!='sample:A01';relative='assets/approved-girl-sample' if girl else 'assets/base-skill/assets/approved-demo';source=Path(root)/relative
   files=[p.relative_to(source).as_posix() for p in source.rglob('*') if p.is_file() and not {'output','validation','qa'}&set(p.relative_to(source).parts) and p.name not in ('preview.mp4','contact-sheet.jpg')]
   required=[]
   if girl:
    project=read(source/'project.json');required=[s['source'] for s in project['edit']['shots']]+[project['audio']]
   return {'id':ident,'engine':'html-seek','source_dir':relative,'entry':'index.html','duration':11.3 if girl else 18.066666667,'width':1920,'height':1080,'fps':30,'required_media':required,'files':files,'shared_fonts':girl,'fixed_canvas':girl,'clock_api':'render' if girl else 'seek','gsap_bridge':not girl,'runtime_status':'retained-source-needs-runtime-check'}
  for manifest in (Path(root)/'assets/retained-expressions').glob('*/manifest.json'):
   data=read(manifest);entry=next((x for x in data.get('entries',[]) if x['id']==ident),None)
   if entry:return {'id':ident,'engine':'html-seek','source_dir':manifest.parent.relative_to(root).as_posix(),'entry':entry['file'],'duration':entry['duration'],'width':1920,'height':1080,'fps':30,'required_media':entry.get('required_media',[]),'start_offset':entry.get('start_offset',0),'shared_fonts':True,'runtime_status':'retained-source-needs-runtime-check'}
 bare=ident.removeprefix('reference:')
 templates={'twoclipping-5cba86':'ui-morph','twoclipping-221cab':'launch-film'}
 if bare in templates:
  relative='assets/modules/reference/assets/templates/'+templates[bare];folder=Path(root)/relative;p=read(folder/'project.json')
  files=[f.relative_to(folder).as_posix() for f in folder.rglob('*') if f.is_file() and not f.name.startswith('reference-')]
  return {'id':'reference:'+bare,'engine':'html-seek','source_dir':relative,'entry':'index.html','duration':p['duration'],'width':p['width'],'height':p['height'],'fps':p['fps'],'files':files,'project_config':True,'required_media':p.get('photos',[]),'runtime_status':'retained-executable-starter','style_scope':STYLE_SCOPE,'parameters':{'texts':p.get('texts',p.get('copy',{})),'brand':p.get('brand'),'theme':{k:p[k] for k in ['accent','background','paper','canvas'] if k in p}}}
 if re.fullmatch(r'[a-zA-Z0-9_.-]+',bare):
  folder=Path(root)/'assets/modules/reference/assets/reconstructions'/bare
  meta=folder/'portable-source.json'
  if meta.is_file():
   m=read(meta);p=read(folder/'project.json') if (folder/'project.json').is_file() else {}
   return {'id':'reference:'+bare,'engine':'html-seek' if m.get('render_engine')=='browser' else m.get('render_engine'),
    'source_dir':folder.relative_to(root).as_posix(),'entry':m.get('entry','index.html'),'duration':p.get('duration',m.get('duration',10)),
    'width':p.get('width',1920),'height':p.get('height',1080),'fps':p.get('fps',30),'portable_source':m,
    'runtime_status':'retained-source-needs-runtime-check'}
 return None
def _code(root,row):
 p=safe(root,row['blob_path'])
 if not p.is_file() or digest(p)!=row['sha256']:raise ValueError('Source unavailable or changed: '+row['upstream_path'])
 return p.read_text(encoding='utf-8-sig')
def fred_inspect(ident,root=ROOT):
 item=_fred(root,ident); files=item.get('runtime_closure',item.get('closure',[]))
 sources=item.get('runtime_sources',item.get('sources',[]));candidates=item.get('runtime_entry_candidates',[])
 entries=[];texts=[];seen=set()
 for row in [*sources,*candidates]:
  if not row.get('blob_path'):continue
  code=_code(root,row)
  if re.search(r'\bregisterRoot\s*\(',code):entries.append(row['upstream_path'])
 for row in files:
  code=_code(root,row)
  for m in re.finditer(r'''(?:["'])([^"'\n]{1,180}[\u3400-\u9fff][^"'\n]{0,180})(?:["'])|>([^<>\n{}]*[\u3400-\u9fff][^<>\n{}]*)<''',code):
   value=next(x for x in m.groups() if x is not None).strip()
   if value and value not in seen:
    seen.add(value);texts.append({'text':value,'source':row['upstream_path']})
 entries=list(dict.fromkeys(entries))
 # Explicit published registration outranks a broad unrelated full-project index.
 entries.sort(key=lambda p:(not any(p==s.get('upstream_path') for s in sources),'library' not in Path(p).name,p))
 adapters=Path(root)/'assets/library-runtime/public-adapters.json'
 adapter=read(adapters).get(item['id']) if adapters.is_file() else None
 if adapter:entries.insert(0,'adapter:'+item['id'])
 result={'id':item['id'],'title':item['title'],'engine':'remotion-original-source','entry_candidates':entries,
  'composition':item.get('implementation',{}).get('compositionId'),'source_files':len(files),'text_slots':texts,
  'media_slots':item.get('runtime_required_media',item.get('required_media',[])),
  'props':item.get('reusability',{}).get('parameters',[]),'unresolved_imports':item.get('runtime_unresolved_imports',[]),
  'required_packages':item.get('runtime_external_packages',[]),
  'registration_adapter':adapter,
  'source_closure':[{'path':r['blob_path'],'upstream_path':r['upstream_path'],'sha256':r['sha256']} for r in files],
  'production_adapter_files':['scripts/library_ui_style.py','assets/library-runtime/current-ui/roles.js','assets/library-runtime/current-ui/transform.cjs','assets/agent-editorial/agent-editorial.js','assets/agent-editorial/palette.json'],
  'style_scope':STYLE_SCOPE,
  'available_palette_tokens':sorted({v.upper() for row in files for v in re.findall(r'#[0-9a-fA-F]{6}\b',_code(root,row))}),
  'source_available':bool(files),'runtime_status':'not-compiled','scope':'Use actual registration and source; bind current content. No source-video study required.'}
 record=_record(root,item['id'])
 if record:
  result['saved_execution']=record
  if record.get('media_contract_status') in ('observed-three-state-requests','observed-full-render-requests'):
   result['media_slots']=record['required_media']
   result['media_contract_scope']=record.get('media_contract_scope','Assets requested by the real selected scene at three sampled states; new content may add new assets.')
  result['selected_entry_status']=record.get('runtime_status')
 return result
def inspect(ident,root=ROOT):
 rebuilt=_rebuilt(ident,root)
 if rebuilt:return rebuilt.inspect(ident,root)
 if 'fredtalk:' in ident:return fred_inspect(ident,root)
 rec=_record(root,ident)
 if not rec:raise ValueError('No retained executable adapter registered for '+ident)
 return {**rec,'production_adapter_files':['scripts/library_ui_style.py','assets/library-runtime/current-ui/roles.js','assets/library-runtime/current-ui/transform.cjs','assets/agent-editorial/agent-editorial.js','assets/agent-editorial/palette.json'],
  'source_closure':[p.relative_to(root).as_posix() for p in (Path(root)/rec['source_dir']).rglob('*') if p.is_file() and p.suffix in CODE_SUFFIXES|{'.html'}] if rec.get('source_dir') else ['assets/fusion-studio/scenes.js','assets/fusion-studio/studio.js','assets/fusion-studio/scenes.json']}
def scaffold(ident,out,root=ROOT):
 rebuilt=_rebuilt(ident,root)
 if rebuilt:return rebuilt.scaffold(ident,out,root)
 info=inspect(ident,root)
 value={'schema':'ui-motion-fusion/library-binding@1','id':info['id'],'composition':info.get('composition'),
  'entry':info.get('entry_candidates',[None])[0] if info.get('entry_candidates') else None,
  'props':(info.get('registration_adapter') or {}).get('default_props',{}),'text':{},'media':{},'palette':{'accent':'#D6C2FF','token_map':{}},'ui_style':{'mode':'approved'},
  'style_scope':info.get('style_scope',STYLE_SCOPE),
  'required_media_slots':info.get('media_slots',info.get('required_media',[])),
  'binding_notes':'Fill current text/media/props. Original animation/timing remains. No silent media fallback.'}
 if Path(out).exists():raise ValueError('Binding output exists')
 write(out,value);return {'path':str(Path(out).resolve()),'id':value['id'],'source_inspection':info}
def _replace(code,text,palette):
 counts={}
 for a,b in text.items():
  if not isinstance(a,str) or not isinstance(b,str) or not a:raise ValueError('Text bindings must be non-empty string keys and string values')
  # Match full string values or JSX text. Never modify import paths or identifiers.
  count=0
  for quote in ('"',"'"):
   needle=quote+a+quote
   replacement=json.dumps(b,ensure_ascii=False)
   n=code.count(needle);count+=n;code=code.replace(needle,replacement)
  needle='>'+a+'<';n=code.count(needle);count+=n;code=code.replace(needle,'>{'+json.dumps(b,ensure_ascii=False)+'}<')
  counts[a]=count
 if palette.get('accent'):
  accent=palette['accent']
  if not re.fullmatch(r'#[0-9a-fA-F]{6}',accent):raise ValueError('Accent must be #RRGGBB')
  code=re.sub(r'#(?:8750ff|8554e8|d6beff|d2b8f2)\b',accent,code,flags=re.I)
 for original,replacement in palette.get('token_map',{}).items():
  if not all(isinstance(v,str) and re.fullmatch(r'#[0-9a-fA-F]{6}',v) for v in (original,replacement)):raise ValueError('Palette token_map uses explicit #RRGGBB pairs')
  code=re.sub(re.escape(original)+r'\b',replacement,code,flags=re.I)
 return code,counts

def _imports(code,owner,item):
 for mapping in item.get('runtime_import_overrides',[]):
  if mapping['owner']!=owner:continue
  rel=os.path.relpath(mapping['target'],str(Path(owner).parent)).replace('\\','/')
  if not rel.startswith('.'):rel='./'+rel
  for quote in ('"',"'"):code=code.replace(quote+mapping['import']+quote,quote+rel+quote)
 return code

def _bound_values(value,spec):
 """Apply the same current-content binding to original defaultProps data."""
 if isinstance(value,dict):return {k:_bound_values(v,spec) for k,v in value.items()}
 if isinstance(value,list):return [_bound_values(v,spec) for v in value]
 if isinstance(value,str):
  value=spec.get('text',{}).get(value,value)
  palette=spec.get('palette',{})
  if value.lower() in ('#8750ff','#8554e8','#d6beff','#d2b8f2'):value=palette.get('accent',value)
  for source,target in palette.get('token_map',{}).items():
   if value.lower()==source.lower():value=target
 return value

def _merge_values(base,updates):
 result=dict(base)
 for key,value in updates.items():
  result[key]=_merge_values(result[key],value) if isinstance(result.get(key),dict) and isinstance(value,dict) else value
 return result
def build(binding,out,root=ROOT):
 spec=read(binding) if isinstance(binding,(str,Path)) else binding
 rebuilt=_rebuilt(spec.get('id',''),root)
 if rebuilt:
  if not isinstance(binding,(str,Path)):raise ValueError('Independent bindings must be saved to a JSON file so media paths have an explicit base')
  return rebuilt.materialize(binding,out,root)
 if spec.get('schema')!='ui-motion-fusion/library-binding@1':raise ValueError('Invalid library binding schema')
 if 'fredtalk:' not in spec.get('id',''):return build_retained(spec,out,root)
 item=_fred(root,spec['id']);info=fred_inspect(item['id'],root)
 output=Path(out).resolve()
 if output.exists():raise ValueError('Output exists; keep the existing project intact')
 entry=spec.get('entry') or (info['entry_candidates'][0] if info['entry_candidates'] else None)
 if entry not in info['entry_candidates']:raise ValueError('Select an actual registered source entry from inspect')
 files=item.get('runtime_closure',item.get('closure',[]))
 output.mkdir(parents=True)
 counts={k:0 for k in spec.get('text',{})};copied=[]
 for row in files:
  name=row['upstream_path'];dest=safe(output,'source/'+name);dest.parent.mkdir(parents=True,exist_ok=True)
  code=_imports(_code(root,row),name,item)
  changed,n=_replace(code,spec.get('text',{}),spec.get('palette',{}))
  for key,value in n.items():counts[key]+=value
  dest.write_text(changed,encoding='utf-8')
  copied.append({'path':dest.relative_to(output).as_posix(),'upstream_sha256':row['sha256'],'bound_sha256':digest(dest)})
 if entry.startswith('adapter:'):
  a=info['registration_adapter'];o=a['output'];entry='library-adapter.tsx'
  target='source/'+a['component_source']
  selections=[]
  if a.get('selection_mode')=='composition':
   chosen=str(Path(target).with_name('_selected_'+Path(target).stem+'.tsx')).replace('\\','/')
   selections=[{'source':target,'target':chosen,'composition':a['composition']}];target=chosen
  elif a.get('select_export'):
   chosen=str(Path(target).with_name('_selected_'+Path(target).stem+'.tsx')).replace('\\','/')
   selections=[{'source':target,'target':chosen,'symbol':a['component']}];target=chosen
  code="import React from 'react';import {Composition,registerRoot,useCurrentFrame} from 'remotion';\nimport {"+a['component']+" as OriginalComponent} from "+json.dumps('./'+target)+";\nconst Scene=(p)=>{const frame=useCurrentFrame();return React.createElement(OriginalComponent,{frame,sourceTime:(frame+"+str(a.get('start_frame',0))+")/"+str(o['fps'])+",t:(frame+"+str(a.get('start_frame',0))+")/"+str(o['fps'])+",id:"+json.dumps(a.get('input_id',a['composition']))+",number:"+str(a.get('input_number',0))+",...p});};registerRoot(()=>React.createElement(Composition,{id:"+json.dumps(a['composition'])+",component:Scene,durationInFrames:"+str(o['durationInFrames'])+",fps:"+str(o['fps'])+",width:"+str(o['width'])+",height:"+str(o['height'])+"}));\n"
  if a.get('selection_mode')=='composition':code='import '+json.dumps('./'+target)+';\n'
  (output/entry).write_text(code,encoding='utf-8')
 unused=[key for key,n in counts.items() if n==0]
 if unused:raise ValueError('Text bindings not found in original source: '+', '.join(unused))
 (output/'public').mkdir(exist_ok=True)
 for name,value in spec.get('media',{}).items():
  src=media_source(value,root)
  if not src.is_file():raise ValueError('Bound media does not exist: '+str(src))
  dest=safe(output/'public',name);dest.parent.mkdir(parents=True,exist_ok=True)
  try:os.link(src,dest)
  except OSError:shutil.copy2(src,dest)
 for name in ('LICENSE','THIRD_PARTY_NOTICES.md','upstream-license-scope.md'):
  shutil.copy2(Path(root)/'assets/fredtalk-library'/name,output/name)
 config={'schema':'ui-motion-fusion/library-project@1','id':item['id'],'engine':'remotion-original-source',
  'entry':entry if entry=='library-adapter.tsx' else 'source/'+entry,'composition':spec.get('composition') or (info.get('registration_adapter') or {}).get('composition') or info['composition'],'props':_bound_values({**(info.get('registration_adapter') or {}).get('default_props',{}),**spec.get('props',{})},spec),
  'source_files':copied,'bound_text_counts':counts,'media':[{'path':name,'sha256':digest(output/'public'/name)} for name in spec.get('media',{})],
  'runtime_status':'not-compiled','user_approved':False,'source_video_required':False,'style_scope':STYLE_SCOPE,'palette_bindings':spec.get('palette',{})}
 if entry=='library-adapter.tsx':config['source_selections']=selections
 config['ui_adaptation']=adapt_project(output,config,root,spec)
 for row in config['source_files']:row['adapted_sha256']=digest(output/row['path'])
 write(output/'library-project.json',config);write(output/'library-binding.json',spec)
 return {'project':str(output),'id':item['id'],'entry':config['entry'],'composition':config['composition'],'copied_sources':len(copied),'runtime_status':'not-compiled','missing_media_not_silently_replaced':True}
def build_retained(spec,out,root=ROOT):
 if content_scope(spec['id'],root):spec={**spec,'palette':{'token_map':spec.get('palette',{}).get('token_map',{})}}
 record=_record(root,spec['id'])
 if not record:raise ValueError('No retained executable source for '+spec['id'])
 if record.get('engine')=='fusion-original':return build_fusion(spec,out,record,root)
 if record.get('engine') not in ('html-seek','python-native'):raise ValueError('Adapter engine not yet supported: '+str(record.get('engine')))
 output=Path(out).resolve()
 if output.exists():raise ValueError('Output exists')
 source=safe(root,record['source_dir'])
 if not source.is_dir():raise ValueError('Retained source unavailable')
 output.mkdir(parents=True)
 if record.get('required_media') and spec.get('props',{}).get('mode')!='demo':
  absent=[x for x in record['required_media'] if x not in spec.get('media',{})]
  if absent:raise ValueError('Current production media required: '+', '.join(absent))
 files=record.get('files') or [p.relative_to(source).as_posix() for p in source.rglob('*') if p.is_file()]
 shared=[]
 for value in record.get('portable_source',{}).get('shared_assets',[]):
  rel=value if isinstance(value,str) else value.get('path') or value.get('source')
  if not rel:raise ValueError('Shared asset needs a path')
  src=(source/rel).resolve()
  if not src.is_relative_to(Path(root).resolve()) or not src.is_file():raise ValueError('Shared source outside package or missing: '+rel)
  shared.append((rel,src,'_shared/'+src.name))
 if record.get('shared_fonts'):
  for font in ['NotoSansSC.ttf','Outfit-Bold.ttf']:
   src=Path(root)/'assets/modules/director/assets/studio/fonts'/font
   for file in source.rglob('*'):
    if file.is_file() and file.suffix in CODE_SUFFIXES|{'.html'}:
     content=file.read_text(encoding='utf-8-sig')
     for match in re.finditer(r"[\"']([^\"']*(?:modules/director/assets/studio|base-skill/assets/portable-studio)/fonts/"+re.escape(font)+r")[\"']",content):
      shared.append((match[1],src,'_shared/'+font))
  shared=list({(a,str(b),c):(a,b,c) for a,b,c in shared}.values())
 counts={k:0 for k in spec.get('text',{})}
 for name in files:
  src=safe(source,name);dest=safe(output,name);dest.parent.mkdir(parents=True,exist_ok=True)
  if src.suffix in CODE_SUFFIXES|{'.html'}:
   content=src.read_text(encoding='utf-8-sig')
   if src.suffix=='.html':
    for a,b in spec.get('text',{}).items():content=content.replace('>'+a+'<','>'+html.escape(b)+'<')
   content,n=_replace(content,spec.get('text',{}),spec.get('palette',{}))
   for original,_,bound in shared:content=content.replace(original,'/'+bound)
   for k,v in n.items():counts[k]+=v
   dest.write_text(content,encoding='utf-8')
  else:shutil.copy2(src,dest)
 for _,src,bound in shared:
  dest=safe(output,bound);dest.parent.mkdir(parents=True,exist_ok=True)
  if dest.exists():continue
  try:os.link(src,dest)
  except OSError:shutil.copy2(src,dest)
  for name in ('NotoSansSC-OFL.txt','Outfit-OFL.txt'):
   license=src.parent/name
   if license.is_file() and not (dest.parent/name).exists():shutil.copy2(license,dest.parent/name)
 for asset in record.get('shared_assets',[]):
  src=safe(root,asset['source']);dest=safe(output,asset['target']);dest.parent.mkdir(parents=True,exist_ok=True)
  try:os.link(src,dest)
  except OSError:shutil.copy2(src,dest)
 if record.get('project_config'):
  config_file=output/'project.json';project_config=_merge_values(read(config_file),{k:v for k,v in spec.get('props',{}).items() if k!='mode'})
  if spec.get('props',{}).get('mode')=='demo' and project_config.get('sample_photos'):
   project_config['photos']=project_config['sample_photos'];project_config['asset_mode']='sample-svg'
  elif project_config.get('photos'):project_config['asset_mode']='current-bound-media'
  write(config_file,_bound_values(project_config,spec))
 bound_media=[]
 for original,value in spec.get('media',{}).items():
  src=media_source(value,root)
  if not src.is_file():raise ValueError('Bound media does not exist: '+str(src))
  key=digest(src);target='_bound_media/'+key[:20]+src.suffix.lower();dest=safe(output,target);dest.parent.mkdir(exist_ok=True)
  if not dest.exists():
   try:os.link(src,dest)
   except OSError:shutil.copy2(src,dest)
  replacements=0
  for name in files:
   dest_file=safe(output,name)
   if dest_file.suffix in CODE_SUFFIXES|{'.html'}:
    value=dest_file.read_text(encoding='utf-8');count=value.count(original)
    if count:value=value.replace(original,'/'+target);dest_file.write_text(value,encoding='utf-8');replacements+=count
  if not replacements:raise ValueError('Media slot not referenced by retained source: '+original)
  bound_media.append({'slot':original,'bound':target,'sha256':key})
 write(output/'library-binding.json',spec)
 browser_spec={**spec,'media':{}}
 for media in bound_media:
  browser_spec['media'][media['slot']]='/'+media['bound'];browser_spec['media']['/'+media['bound']]='/'+media['bound']
 write(output/'browser-binding.json',browser_spec)
 if record.get('gsap_bridge'):
  file=output/record['entry'];content=file.read_text(encoding='utf-8')
  bridge="<script>window.ready=()=>document.fonts.ready;window.seek=async t=>{await window.ready();window.__timelines.main.pause().seek(t,false);};window.getState=()=>({time:window.__timelines.main.time(),source:'original-gsap-timeline'});function fit(){document.body.style.transformOrigin='0 0';document.body.style.transform='scale('+Math.min(innerWidth/1920,innerHeight/1080)+')';}fit();addEventListener('resize',fit);</script>"
  file.write_text(content.replace('</body>',bridge+'</body>'),encoding='utf-8')
 ui_adaptation=adapt_project(output,record,root,spec)
 write(output/'library-project.json',{'schema':'ui-motion-fusion/library-project@1','id':spec['id'],'engine':record['engine'],'entry':record.get('entry','index.html'),'clock_api':record.get('clock_api'),'duration':record['duration'],'width':record.get('width',1920),'height':record.get('height',1080),'fps':spec.get('fps',record.get('fps',30)),'bound_media':bound_media,'runtime_status':'not-rendered','source_video_required':False,'user_approved':False,'style_scope':STYLE_SCOPE,'ui_adaptation':ui_adaptation})
 if record.get('fixed_canvas'):
  config=read(output/'library-project.json');config['fixed_canvas']=True;write(output/'library-project.json',config)
 return {'project':str(output),'id':spec['id'],'engine':record['engine']}

def build_fusion(spec,out,record,root):
 import new_project
 output=Path(out).resolve()
 if output.exists():raise ValueError('Output exists')
 new_project.create(output,scene=record['scene'],root=root)
 for file in output.rglob('*'):
  if file.is_file() and file.suffix in CODE_SUFFIXES|{'.html'}:
   content=file.read_text(encoding='utf-8-sig')
   if file.suffix=='.html':
    for a,b in spec.get('text',{}).items():content=content.replace('>'+a+'<','>'+html.escape(b)+'<')
   content,_=_replace(content,spec.get('text',{}),spec.get('palette',{}));file.write_text(content,encoding='utf-8')
 config=read(output/'project.json')
 for key in ('title','product','captions','sourceOffset','presenterCrop','circle'):
  if key in spec.get('props',{}):config[key]=spec['props'][key]
 for slot,value in spec.get('media',{}).items():
  src=media_source(value,root)
  if not src.is_file():raise ValueError('Media missing: '+str(src))
  dest=safe(output,'media/'+src.name);dest.parent.mkdir(exist_ok=True)
  if not dest.exists():
   try:os.link(src,dest)
   except OSError:shutil.copy2(src,dest)
  if slot in ('presenter','audio','soundtrack'):config[slot]=dest.relative_to(output).as_posix()
  else:raise ValueError('Fusion media slots are presenter/audio/soundtrack; bind content text separately')
 write(output/'project.json',config);write(output/'library-binding.json',spec)
 ui_adaptation=adapt_project(output,{**record,'engine':'html-seek','entry':'index.html'},root,spec)
 write(output/'library-project.json',{'schema':'ui-motion-fusion/library-project@1',**record,'engine':'html-seek','entry':'index.html','runtime_status':'not-rendered','user_approved':False,'source_video_required':False,'style_scope':STYLE_SCOPE,'ui_adaptation':ui_adaptation})
 return {'project':str(output),'id':record['id'],'engine':'fusion-original','source_video_required':False}
def browser_path(preferred=None,playwright_executable=None):
 from playwright.sync_api import sync_playwright
 candidates=[preferred,os.environ.get('UI_MOTION_BROWSER')]
 if playwright_executable:candidates.append(playwright_executable)
 else:
  with sync_playwright() as p:candidates.append(p.chromium.executable_path)
 for base in [os.environ.get('PROGRAMFILES'),os.environ.get('PROGRAMFILES(X86)'),os.environ.get('LOCALAPPDATA')]:
  if base:
   candidates.extend([str(Path(base)/'Google/Chrome/Application/chrome.exe'),str(Path(base)/'Microsoft/Edge/Application/msedge.exe')])
 candidates.extend(shutil.which(name) for name in ['chromium','chromium-browser','google-chrome','microsoft-edge'])
 for candidate in candidates:
  if candidate and Path(candidate).is_file():return str(Path(candidate).resolve())
 raise ValueError('No existing Chromium/Chrome/Edge found. Set UI_MOTION_BROWSER to its executable; no browser was downloaded.')

def runtime_registration():
 base=Path(os.environ.get('LOCALAPPDATA',str(Path.home()/'.local/share')))
 return base/'ui-motion-fusion'/'library-runtime.json'

def _runtime_settings():
 location=runtime_registration()
 return read(location) if location.is_file() else {}

def _runtime_matches(primary,additional,dependencies):
 paths=[Path(primary),*(Path(x) for x in additional)]
 for package,version in dependencies.items():
  found=next((p/package/'package.json' for p in paths if (p/package/'package.json').is_file()),None)
  if not found or read(found).get('version')!=version:return False
 return True
def run(project,action,node_modules=None,browser=None,output=None,scale=1,root=ROOT,backend='native',extra_node_modules=None):
 project=Path(project).resolve();config=read(project/'library-project.json')
 if config['engine']=='html-seek':
  from library_html_runner import run as html_run
  return html_run(project,action,output,scale)
 if config['engine']=='python-native':
  directory=project/('native-'+action)
  if directory.exists():raise ValueError('Native output exists; preserve it and choose a fresh project/output run')
  command=[sys.executable,str(project/'render_native.py'),'--out',str(directory),'--width',str(max(128,round(config.get('width',1920)*scale/2)*2)),'--fps',str(config.get('fps',30))]
  if action!='render':command.append('--stills-only')
  result=subprocess.run(command,text=True,capture_output=True,encoding='utf-8')
  if result.returncode:raise ValueError(result.stderr[-7000:])
  proof=read(directory/'verification.json');report={'id':config['id'],'engine':'python-native','action':action,'status':'passed','actual_source_execution':True,'generic_fallback':False,'proof':proof}
  if action=='render':
   source=directory/'preview.mp4'
   if output:
    target=Path(output).resolve()
    if target.exists():raise ValueError('Output exists')
    target.parent.mkdir(parents=True,exist_ok=True);shutil.move(str(source),target);report['output']=str(target)
   else:report['output']=str(source)
  write(project/('runtime-'+action+'.json'),report);return report
 registered=_runtime_settings()
 modules=Path(node_modules or os.environ.get('UI_MOTION_NODE_MODULES') or registered.get('node_modules','node_modules')).expanduser().resolve()
 for name in ('remotion','@remotion/bundler','@remotion/renderer','react','react-dom'):
  if not (modules/name/'package.json').is_file():raise ValueError('Reuse a compatible existing node_modules with '+name+'; pass --node-modules. No runtime was installed.')
 cfg={**config,'project':str(project),'node_modules':str(modules),'browser':browser or (browser_path() if backend=='native' else None),'scale':scale}
 cfg['additional_node_modules']=[str(Path(x).resolve()) for x in (extra_node_modules or [x for x in os.environ.get('UI_MOTION_EXTRA_NODE_MODULES','').split(os.pathsep) if x] or registered.get('additional_node_modules',[])) if x]
 if output:cfg['output']=str(Path(output).resolve())
 write(project/'runtime-config.local.json',cfg)
 if cfg.get('source_selections'):
  selected=subprocess.run(['node',str(Path(root)/'assets/library-runtime/select-component.cjs'),str(project/'runtime-config.local.json')],capture_output=True,text=True,encoding='utf-8')
  if selected.returncode:raise ValueError(selected.stderr[-7000:])
 if backend=='player':
  # A source/props edit must not accidentally reuse a bundle from the previous shot.
  result=subprocess.run(['node',str(Path(root)/'assets/library-runtime/player-runner.cjs'),str(project/'runtime-config.local.json')],capture_output=True,text=True,encoding='utf-8')
  if result.returncode:raise ValueError(result.stderr[-10000:])
  from library_html_runner import run as html_run
  return html_run(project,action,output,scale,{**config,'entry':'player.html','width':1920,'height':1080,'fps':30,'duration':10})
 command=['node',str(Path(root)/'assets/library-runtime/remotion-runner.cjs'),action,str(project/'runtime-config.local.json')]
 r=subprocess.run(command,text=True,capture_output=True,encoding='utf-8')
 if r.returncode:
  write(project/'runtime-failure.json',{'id':config['id'],'action':action,'error':r.stderr,'status':'failed','generic_fallback':False})
  raise ValueError(r.stderr[-7000:])
 report=read(project/('runtime-'+action+'.json'));return report

def setup_dependencies(out=None,root=ROOT,core=False,node_modules=None,extra_node_modules=None):
 target=Path(out).resolve() if out else runtime_registration().parent/'shared-library-host'
 source=Path(root)/'assets/library-runtime'/('core-dependencies' if core else 'dependencies')
 if core:
  expected=read(source/'package.json')['dependencies'];registered=_runtime_settings()
  additional=[str(Path(x).resolve()) for x in (extra_node_modules or registered.get('additional_node_modules',[]))]
  candidates=[node_modules,os.environ.get('UI_MOTION_NODE_MODULES'),registered.get('node_modules'),Path.cwd()/'node_modules',target/'node_modules']
  for candidate in candidates:
   if candidate and _runtime_matches(candidate,additional,expected):
    value={'schema':'ui-motion-fusion/shared-library-runtime@1','node_modules':str(Path(candidate).resolve()),'additional_node_modules':additional,'package_lock_sha256':digest(source/'package-lock.json')}
    write(runtime_registration(),value)
    return {**value,'reused':True,'installed_bytes':0,'registration':str(runtime_registration()),'browser_downloaded':False}
 for name in ('package.json','package-lock.json'):
  expected=source/name;existing=target/name
  if not expected.is_file():raise ValueError('Missing published dependency lock: '+name)
  if existing.exists() and digest(existing)!=digest(expected):raise ValueError('Target has a different dependency manifest; choose a dedicated additive dependency directory')
 if (target/'node_modules').exists() and not (target/'package.json').is_file():raise ValueError('Unmanaged node_modules exists at target; choose the shared runtime directory instead of replacing it')
 target.mkdir(parents=True,exist_ok=True)
 for name in ('package.json','package-lock.json'):shutil.copy2(source/name,target/name)
 npm=shutil.which('npm.cmd') or shutil.which('npm')
 if not npm:raise ValueError('Existing Node/npm is required; no runtime was downloaded')
 subprocess.run([npm,'ci','--legacy-peer-deps','--ignore-scripts','--no-audit','--no-fund'],cwd=target,check=True)
 size=sum(p.stat().st_size for p in (target/'node_modules').rglob('*') if p.is_file())
 result={'node_modules':str(target/'node_modules'),'bytes':size,'reused':False,'browser_downloaded':False}
 if core:
  if not _runtime_matches(target/'node_modules',[],expected):raise ValueError('Installed core packages do not match the published exact versions')
  write(runtime_registration(),{'schema':'ui-motion-fusion/shared-library-runtime@1','node_modules':str(target/'node_modules'),'additional_node_modules':[],'package_lock_sha256':digest(source/'package-lock.json')})
  result.update(registration=str(runtime_registration()),next='Subsequent library compile/smoke/render automatically reuse this single registered host.')
 else:result.update(renderer_resolves_react_remotion_from_primary_host=True,supplement_may_include_locked_transitive_remotion=True,next='Pass this path as --extra-node-modules; --node-modules remains the existing compatible React/Remotion host.')
 return result
def main(argv=None):
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--root',type=Path,default=ROOT)
 sub=p.add_subparsers(dest='command',required=True)
 q=sub.add_parser('inspect');q.add_argument('--id',required=True)
 q=sub.add_parser('scaffold');q.add_argument('--id',required=True);q.add_argument('--out',required=True,type=Path)
 q=sub.add_parser('build');q.add_argument('--bindings','--spec',dest='bindings',required=True,type=Path);q.add_argument('--out',required=True,type=Path)
 q=sub.add_parser('setup');q.add_argument('--out',type=Path);q.add_argument('--core',action='store_true');q.add_argument('--node-modules',type=Path);q.add_argument('--extra-node-modules',type=Path,action='append')
 for name in ('compile','smoke','render'):
  q=sub.add_parser(name);q.add_argument('--project',required=True,type=Path);q.add_argument('--node-modules',type=Path);q.add_argument('--extra-node-modules',type=Path,action='append');q.add_argument('--browser');q.add_argument('--out',type=Path);q.add_argument('--scale',type=float,default=1);q.add_argument('--backend',choices=['native','player'],default='native')
 a=p.parse_args(argv)
 try:
  if a.command=='inspect':r=inspect(a.id,a.root)
  elif a.command=='scaffold':r=scaffold(a.id,a.out,a.root)
  elif a.command=='build':r=build(a.bindings,a.out,a.root)
  elif a.command=='setup':r=setup_dependencies(a.out,a.root,a.core,a.node_modules,a.extra_node_modules)
  else:r=run(a.project,a.command,a.node_modules,a.browser,a.out,a.scale,a.root,a.backend,a.extra_node_modules)
  print(json.dumps(r,ensure_ascii=False,indent=2));return 0
 except (ValueError,OSError,KeyError) as e:p.error(str(e))
if __name__=='__main__':sys.exit(main())
