"""Adapt retained production copies to approved material roles; originals stay hashed.

This module reports what was actually transformed, not what was merely routed.
Canvas drawings with no recognized UI primitives are explicitly content-preserved.
"""
from __future__ import annotations
import hashlib,json,os,re,shutil,subprocess
from pathlib import Path

VERSION='agent-editorial-material-v1'
UI_COLORS={'paper':'#FFFFFF','page':'#FFFFFF','background':'#FFFFFF','bg':'#FFFFFF','canvas':'#FFFFFF','white':'#FFFFFF','cream':'#FFFFFF','ivory':'#FFFFFF','panel':'#F3F3F5','surface':'#F3F3F5','card':'#FFFFFF','ink':'#0B0B0F','black':'#0B0B0F','dark':'#0B0B0F','text':'#0B0B0F','foreground':'#0B0B0F','edge':'#DBDBE0','line':'#DBDBE0','border':'#DBDBE0','muted':'#777780','gray':'#777780','accent':'#D6C2FF','purple':'#D6C2FF','violet':'#D6C2FF','lavender':'#D6C2FF'}
STYLE_SCOPE={'baseline':'assets/agent-editorial/source/body-a.js + body-b.js; agent-editorial.js primitives',
 'material_adapter':VERSION,'layout_motion':'original positions, timing, transforms, masks and content pixels retained',
 'not_claimed':'Role adaptation is not aesthetic approval; exact per-file and unsupported scopes are in ui-style-report.json.'}

def _read(path):return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def _write(path,data):Path(path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def guarded_ui_primitives(files,ident=''):
 # These source families were inspected as UI wrappers. Preserve their original
 # guarded returns/alpha/strokes; do not apply this to unclassified art primitives.
 families={'amol909s-27533e':['rr'],'demonugc-4c5753':['box'],'fractadev-149adc':['rr'],'robvjourney-ce3e1a':['rect'],'utopyaszx-1b2f94':['rr'],'fangmu-token':['round','box','rr']}
 if str(ident).startswith('sample:fangmu/'):ident+=' fangmu-token'
 return {str(f):helpers for f in files for family,helpers in families.items() if (family in str(f).replace('\\','/').split('/') or family in ident) and 'vendor' not in Path(f).parts}

def adapter_fingerprint(root):
 paths=['scripts/library_ui_style.py','scripts/library_runner.py','assets/library-runtime/player-runner.cjs','assets/library-runtime/current-ui/roles.js','assets/library-runtime/current-ui/transform.cjs','assets/library-runtime/current-ui/content-scopes.json','assets/library-runtime/current-ui/scene-overrides.json','assets/library-runtime/current-ui/build-observations.json','assets/agent-editorial/agent-editorial.js','assets/agent-editorial/palette.json','assets/agent-editorial/source/body-a.js','assets/agent-editorial/source/body-b.js','assets/modules/director/assets/studio/fonts/NotoSansSC.ttf']
 paths=[p for p in paths if (root/p).is_file()]
 return {'adapter_files':paths,'adapter_sha256':{p:hashlib.sha256((root/p).read_bytes()).hexdigest() for p in paths}}
def content_scope(ident,root):
 scopes=Path(root)/'assets/library-runtime/current-ui/content-scopes.json'
 return next((x for x in _read(scopes).get('items',[]) if x['id']==ident and x['classification']=='native-content-retained'),None) if scopes.is_file() else None
def _modules():
 p=Path(os.environ.get('LOCALAPPDATA',str(Path.home()/'.local/share')))/'ui-motion-fusion/library-runtime.json'
 registered=_read(p) if p.is_file() else {}
 for value in [os.environ.get('UI_MOTION_NODE_MODULES'),registered.get('node_modules'),str(Path.cwd()/'node_modules')]:
  if value and (Path(value)/'typescript/package.json').is_file():return str(Path(value).resolve())
 raise ValueError('UI source adaptation needs TypeScript from the existing shared Node host; run library setup --core first.')

def adapt_project(output,record,root,spec):
 output=Path(output);root=Path(root)
 mode=spec.get('ui_style',{}).get('mode','approved')
 if mode not in ('approved','original-reference'):raise ValueError('ui_style.mode must be approved or original-reference')
 report={'schema':'ui-motion-fusion/ui-adaptation@1','id':spec.get('id',record.get('id')),'version':VERSION,'mode':mode,
  'source_baseline':['assets/agent-editorial/agent-editorial.js','assets/agent-editorial/palette.json'],
  'original_sources_modified':False,'motion_parameters_modified':False,'media_pixels_modified':False,'visual_review':'not-reviewed','files':[]}
 if mode=='original-reference':
  report['status']='unadapted-comparison-only';_write(output/'ui-style-report.json',report);return report
 content=content_scope(report['id'],root)
 if content:
  report.update(status='native-content-retained',counts={},scope=content['content_kind'],source_sites=content['source_sites'],reason=content['reason'],composition_boundary='Use as native content in the current approved host; its colors do not establish the project UI standard.')
  _write(output/'ui-style-report.json',report);return report
 runtime=output/'_current-ui';runtime.mkdir(exist_ok=True)
 for name in ['roles.js']:shutil.copy2(root/'assets/library-runtime/current-ui'/name,runtime/name)
 # One approved font is hardlinked locally; package font remains portable without an OS dependency.
 font=root/'assets/modules/director/assets/studio/fonts/NotoSansSC.ttf'
 if font.is_file():
  dest=runtime/'NotoSansSC.ttf'
  if not dest.exists():
   try:os.link(font,dest)
   except OSError:shutil.copy2(font,dest)
  for license in font.parent.glob('*OFL*'):
   if license.is_file():shutil.copy2(license,runtime/license.name)
 css='@font-face{font-family:UIFusionApproved;src:url("NotoSansSC.ttf") format("truetype");font-weight:100 900;font-display:block;}\n'
 # Static HTML selectors are role-scoped, never * or every div.
 css_reports=[]
 selectors={}
 style_sources=[(f,f.read_text(encoding='utf-8-sig')) for f in output.rglob('*.css') if '_current-ui' not in f.parts]
 for f in output.rglob('*.html'):
  if '_current-ui' in f.parts:continue
  style_sources.extend((f,m[1]) for m in re.finditer(r'<style[^>]*>([\s\S]*?)</style>',f.read_text(encoding='utf-8-sig'),re.I))
 variables={name:value for _,text in style_sources for name,value in re.findall(r'(--[\w-]+)\s*:\s*([^;{}]+)',text)}
 mapped_vars={}
 for name,old in variables.items():
  key=name.removeprefix('--').lower()
  if key in UI_COLORS and re.fullmatch(r'#[\da-fA-F]{3,8}',old.strip()):
   target=UI_COLORS[key]
   if key in ('background','bg','canvas') and re.match(r'#[0-5][\da-f]',old,re.I):target='#0B0B0F'
   mapped_vars[name]=target
  elif key in ('font','font-family','body-font'):mapped_vars[name]='UIFusionApproved,"Microsoft YaHei",sans-serif'
 if mapped_vars:css+=':root{'+ ';'.join(k+':'+v+'!important' for k,v in mapped_vars.items())+'}\n'
 for f,text in style_sources:
  if '_current-ui' in f.parts:continue
  for sel,body in re.findall(r'([^{}]+)\{([^{}]*)\}',text):
   for selector in sel.split(','):
    selector=selector.strip()
    if not re.fullmatch(r'[.#][\w-]+',selector):continue
    name=selector[1:].lower()
    if re.search(r'logo|avatar|image|video|icon|sprite|texture',name):continue
    role=next((role for role,pat in [('window',r'(?:^|[-_])(?:window|screen|panel|dialog)(?:$|[-_])'),('sheet',r'(?:^|[-_])(?:doc|sheet|paper|document|report)(?:$|[-_])'),('chip',r'(?:^|[-_])(?:pill|chip|badge|tag)(?:$|[-_])'),('heading',r'title|headline|heading'),('panel',r'(?:^|[-_])(?:card|tile)(?:$|[-_])')] if re.search(pat,name)),None)
    if role:selectors[selector]=(role,body)
 for selector,(role,body) in selectors.items():
  parts=['font-family:UIFusionApproved,"Microsoft YaHei",sans-serif']
  if role=='heading':parts+=['font-weight:800']
  elif role in ('window','sheet','panel'):
   # Keep source geometry/radius. Change only existing neutral surfaces.
   resolved=re.sub(r'var\((--[\w-]+)\)',lambda m:mapped_vars.get(m[1],variables.get(m[1],m[0])),body)
   match=re.search(r'background(?:-color)?\s*:\s*(#[\da-fA-F]{3,8}|white|black)\s*[;}]?',resolved)
   if match:
    c=match[1];rgba=c.lstrip('#');neutral=c in ('black','white') or len(rgba) in (3,6) and max(int(rgba[i:i+len(rgba)//3],16) for i in range(0,len(rgba),len(rgba)//3))-min(int(rgba[i:i+len(rgba)//3],16) for i in range(0,len(rgba),len(rgba)//3))<38
    if neutral:parts+=['box-shadow:6px 8px 0 #DBDBE0,0 12px 25px #00000020','outline:2px solid #DBDBE0','outline-offset:-2px']
  css+=selector+'{'+ ';'.join(parts)+'}\n';css_reports.append({'selector':selector,'role':role,'material':any('box-shadow' in x for x in parts)})
 if report['id']=='reference:twoclipping-5cba86':
  css+='#shape{outline:2px solid #DBDBE0;outline-offset:-2px;box-shadow:6px 8px 0 #DBDBE0,0 12px 25px #00000020;font-family:UIFusionApproved,sans-serif} .chart-title strong{font-weight:800} .player-copy strong{font-weight:700}\n'
  css_reports.append({'selector':'#shape','role':'continuous-morphing-surface','material':True})
 if report['id']=='sample:user-ui/girl-agent-sample-20261015':
  css+='body{font-family:UIFusionApproved,sans-serif;color:#0B0B0F}.window{outline:2px solid #DBDBE0;outline-offset:-2px;box-shadow:6px 8px 0 #DBDBE0,0 12px 25px #00000020}.windowbar{background:#0B0B0F;color:#FFFFFF;box-shadow:none}#agent-window{background:#0B0B0F}h1,h2,h3{font-weight:800}h1 span,h2 span,.task-row em,.tick{color:#D6C2FF}.agent-icon,.task-progress i{background:#D6C2FF}#package{box-shadow:8px 10px 0 #DBDBE0,0 12px 25px #00000020}\n'
  css_reports.append({'selector':'.window / #package / .windowbar','role':'media-window+agent-window+result+file','material':True})
 (runtime/'roles.css').write_text(css,encoding='utf-8')
 files=[p for p in output.rglob('*') if p.is_file() and p.suffix in ('.js','.jsx','.tsx','.ts','.mjs') and '_current-ui' not in p.parts and 'node_modules' not in p.parts and not p.name.endswith('.min.js')]
 inline=[]
 for htmlfile in output.rglob('*.html'):
  if '_current-ui' in htmlfile.parts:continue
  code=htmlfile.read_text(encoding='utf-8-sig')
  for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)</script>',code,re.I):
   body=m[1]
   if not body.strip() or body.lstrip().startswith('{'):continue
   temp=runtime/('inline-'+str(len(inline))+'.js');temp.write_text(body,encoding='utf-8');files.append(temp);inline.append((htmlfile,body,temp))
 config={'project':str(output),'node_modules':_modules(),'files':[str(p) for p in files],'report':str(runtime/'transform-report.json'),'guarded_ui_primitives':guarded_ui_primitives(files,report['id'])}
 _write(runtime/'transform-config.local.json',config)
 result=subprocess.run(['node',str(root/'assets/library-runtime/current-ui/transform.cjs'),str(runtime/'transform-config.local.json')],capture_output=True,text=True,encoding='utf-8')
 if result.returncode:raise ValueError('UI source transformation failed: '+result.stderr[-3000:])
 report['files']=_read(runtime/'transform-report.json');report['css_selectors']=css_reports;report['css_variables']=mapped_vars
 report['specialized_rules']=[]
 source_patches={
  'reference:ik-builds-b8bdcf':{
   "g.fillStyle=id===2?(isDark?'#302710':'#e6dfbe'):(isDark?'#020704':'#f9faf2');g.fillRect(x,y,w,h);g.strokeStyle=isDark?'#5c66566f':'#cbd0c855';g.lineWidth=.7;g.strokeRect(x,y,w,h);":
   "globalThis.__uiFusionCurrent.rect(g,x,y,w,h,isDark?'#0B0B0F':'#FFFFFF','sheet',0);"
  },
  'reference:ror-fly-9950f1':{
   "Z',2.4,'#ded1d0','#efd3d6');g.translate(-5,-7);line(":"Z',2.4,'#DBDBE0','#DBDBE0');g.translate(-5,-7);line(",
   "Z',2.4,P.palette.ink,'#fffdfa');":"Z',2.4,'#0B0B0F','#FFFFFF');"
  }
 }
 if report['id'] in source_patches:
  for file in files:
   if file.suffix!='.js':continue
   code=file.read_text(encoding='utf-8');changed=[]
   for old,new in source_patches[report['id']].items():
    if old in code:code=code.replace(old,new);changed.append(old)
   if changed:
    file.write_text(code,encoding='utf-8');report['specialized_rules'].append({'file':file.relative_to(output).as_posix(),'kind':'authored-paper-material','changes':len(changed),'scope':'only paper front/depth/edge; illustration, handwriting, stamps, Path2D outline and authored transformations retained'})
 hud_patches={
  'reference:mdaman010-e7226a':('footer',{'#252e35':'#0B0B0F','#cbd3d9':'#FFFFFF','#d5dde2':'#FFFFFF','#dbe0e3':'#DBDBE0','#172329':'#D6C2FF','#6d7780':'#777780','#d4dce0':'#FFFFFF'}),
  'reference:sayan-shanky-f850d8':('overlays',{'#243038':'#0B0B0F','#f2f6f8':'#FFFFFF','#d8e2e7':'#FFFFFF','#141d24':'#777780','#d3d9dd':'#DBDBE0','#46545e':'#D6C2FF'})
 }
 if report['id'] in hud_patches:
  function_name,replacements=hud_patches[report['id']]
  for file in files:
   code=file.read_text(encoding='utf-8');match=re.search(r'function\s+'+function_name+r'\s*\(',code)
   if not match:continue
   next_fn=re.search(r'\n\s*function\s',code[match.end():]);end=match.end()+next_fn.start() if next_fn else len(code)
   part=code[match.start():end];count=0
   for old,new in replacements.items():count+=part.count(old);part=part.replace(old,new)
   if count:
    file.write_text(code[:match.start()]+part+code[end:],encoding='utf-8');report['specialized_rules'].append({'file':file.relative_to(output).as_posix(),'kind':'three-scene-player-overlay','changes':count,'scope':'playback bar only: near-black body, A-purple active handle, neutral track/text; Power/Data/Heat/Coolant legend, callout lines and 3D objects remain unchanged'})
 if str(report['id']).startswith('fredtalk:screen-camera-cam'):
  patches={
   'CameraExamples.tsx':{'#dde0e4':'#DBDBE0','#f9fafb':'#FFFFFF','depth:.025,bevelEnabled':'depth:.067,bevelEnabled','position={[0,0,-.024]}':'position={[0,0,-.066]}'},
   'GroupAccents.tsx':{'m.uniforms.multiplyColor.value.set(1, 1 - strength * (1 - 233 / 255), 1 - strength * (1 - 73 / 255));':'m.uniforms.multiplyColor.value.set(1 - strength * (1 - 214 / 255), 1 - strength * (1 - 194 / 255), 1);'},
   'RaisedInput.tsx':{'const blur = (8 + 24 * q) * PX':'const blur = (8 + 17 * q) * PX'}
  }
  for file in files:
   if file.name not in patches:continue
   code=file.read_text(encoding='utf-8');changed=[]
   for old,new in patches[file.name].items():
    if old in code:code=code.replace(old,new);changed.append(old)
   if changed:
    file.write_text(code,encoding='utf-8');report['specialized_rules'].append({'file':file.relative_to(output).as_posix(),'kind':'three-textured-ui-material','changes':len(changed),'scope':'frame back-face thickness 8px, neutral edge/white stage, A-purple brush, 25px settled shadow; camera/ROI/video shader sampling unchanged'})
 for htmlfile,before,temp in inline:
  htmlfile.write_text(htmlfile.read_text(encoding='utf-8').replace(before,temp.read_text(encoding='utf-8')),encoding='utf-8')
  for row in report['files']:
   if row['file']==temp.relative_to(output).as_posix():row['file']=htmlfile.relative_to(output).as_posix()+'#'+temp.stem
 engine=record.get('engine');entry=record.get('entry','index.html')
 if engine=='remotion-original-source':
  target=output/entry
  rel=os.path.relpath(runtime/'roles.js',target.parent).replace('\\','/')
  cssrel=os.path.relpath(runtime/'roles.css',target.parent).replace('\\','/')
  if not rel.startswith('.'):rel='./'+rel
  if not cssrel.startswith('.'):cssrel='./'+cssrel
  target.write_text('import '+json.dumps(rel)+';\nimport '+json.dumps(cssrel)+';\n'+target.read_text(encoding='utf-8'),encoding='utf-8')
 elif engine!='python-native':
  for f in output.rglob('*.html'):
   runtime_rel=os.path.relpath(runtime,f.parent).replace('\\','/')
   text=f.read_text(encoding='utf-8-sig');injection='<link rel="stylesheet" href="'+runtime_rel+'/roles.css"><script src="'+runtime_rel+'/roles.js"></script>'
   text=text.replace('</head>',injection+'</head>') if '</head>' in text else injection+text
   f.write_text(text,encoding='utf-8')
 totals={k:sum(x.get(k,0) for x in report['files']) for k in ('jsxStyles','canvasFonts','canvasSurfaces','canvasPathMaterials','paletteProperties')}
 report['palette_bindings']=[]
 if totals['canvasSurfaces']+totals['canvasPathMaterials']:
  project_json=output/'project.json'
  if project_json.is_file():
   data=_read(project_json)
   for name in ['colors','palette','theme']:
    palette=data.get(name,{})
    if isinstance(palette,dict):
     for key,old in list(palette.items()):
      if key.lower() in UI_COLORS and isinstance(old,str) and re.fullmatch(r'#[\da-fA-F]{3,8}',old):
       palette[key]=UI_COLORS[key.lower()]
       if key.lower() in ('background','bg','canvas','ink','text','foreground') and re.match(r'#[0-5][\da-f]',old,re.I):palette[key]='#0B0B0F'
       report['palette_bindings'].append({'path':name+'.'+key,'before':old,'after':palette[key]})
   _write(project_json,data)
   overrides_path=root/'assets/library-runtime/current-ui/scene-overrides.json'
   override=_read(overrides_path).get('items',{}).get(report['id'],{}) if overrides_path.is_file() else {}
   for palette_name,values in override.get('palette',{}).items():
    for key,value in values.items():
     old=data.setdefault(palette_name,{}).get(key);data[palette_name][key]=value
     report['palette_bindings'].append({'path':palette_name+'.'+key,'before':old,'after':value,'reason':override['reason']})
   if override:_write(project_json,data)
 report['counts']={**totals,'cssSelectors':len(css_reports),'cssMaterialSelectors':sum(x.get('material',False) for x in css_reports)}
 report['counts']['specializedMaterialRules']=sum(x['changes'] for x in report['specialized_rules'])
 material=totals['jsxStyles']+totals['canvasSurfaces']+totals['canvasPathMaterials']+report['counts']['cssMaterialSelectors']+report['counts']['specializedMaterialRules']
 report['status']='role-adapted-needs-visual-review' if material else 'content-preserved-no-supported-ui-primitive'
 report['limits']=['CSS gradients and product-specific DOM brand/status colors remain original. Canvas palette objects are presentation tokens; per-project token_map can preserve semantic data colors.','Unrecognized Canvas/3D internals retain their original content; do not claim material coverage from typography alone.']
 if not material and (totals['canvasFonts'] or css_reports):report['status']='typography-only-material-unadapted'
 if engine=='python-native':report['status']='native-content-preserved-ui-adapter-not-applicable'
 _write(output/'ui-style-report.json',report)
 return report

def audit_catalog(root,work):
 """Read every source closure; report transform sites, not visual approval."""
 root=Path(root).resolve();work=Path(work).resolve();work.mkdir(parents=True,exist_ok=True)
 import library_runner
 items=_read(root/'assets/library-runtime/implementations.json')['items']
 ids=list(dict.fromkeys([x['id'] for x in items]+['reference:'+p.parent.name for p in (root/'assets/modules/reference/assets/reconstructions').glob('*/portable-source.json')]+['reference:twoclipping-5cba86','reference:twoclipping-221cab']))
 for manifest in (root/'assets/retained-expressions').glob('*/manifest.json'):
  ids.extend(x['id'] for x in _read(manifest).get('entries',[]) if x['id'] not in ids)
 files={};records=[]
 for ident in ids:
  rec=library_runner._record(root,ident);record={'id':ident,'engine':rec.get('engine') if rec else None,'files':[]}
  if ident.startswith('fredtalk:'):
   item=library_runner._fred(root,ident)
   for row in item.get('runtime_closure',item.get('closure',[])):
    if Path(row['upstream_path']).suffix not in ('.js','.jsx','.ts','.tsx','.mjs'):continue
    file=root/row['blob_path'];files[str(file)]=row['upstream_path'];record['files'].append(str(file))
  elif rec and rec.get('source_dir'):
   folder=root/rec['source_dir']
   for file in folder.rglob('*'):
    if file.is_file() and file.suffix in ('.js','.jsx','.ts','.tsx','.mjs') and not file.name.endswith('.min.js'):
     files[str(file)]=str(file);record['files'].append(str(file))
  if rec and rec.get('source_dir'):
   record['source_directory']=rec['source_dir']
  records.append(record)
 cfg={'project':str(root),'node_modules':_modules(),'files':list(files),'kinds':files,'report':str(work/'source-sites.json'),'dry_run':True,'guarded_ui_primitives':guarded_ui_primitives(files)}
 _write(work/'source-sites.config.local.json',cfg)
 result=subprocess.run(['node',str(root/'assets/library-runtime/current-ui/transform.cjs'),str(work/'source-sites.config.local.json')],capture_output=True,text=True,encoding='utf-8')
 if result.returncode:raise ValueError(result.stderr[-3000:])
 indexed={str((root/r['file']).resolve()):r for r in _read(work/'source-sites.json')}
 for record in records:
  evidence=[indexed[p] for p in record.pop('files') if p in indexed]
  totals={k:sum(x.get(k,0) for x in evidence) for k in ('jsxStyles','canvasFonts','canvasSurfaces','canvasPathMaterials','paletteProperties')}
  record.update(counts=totals,source_files=len(evidence),scope='source-closure transform-site analysis; selected-frame visibility must be checked after build',runtime_review='not-rendered-this-update',status='source-material-adapter-available' if totals['jsxStyles']+totals['canvasSurfaces']+totals['canvasPathMaterials'] else 'typography-only' if totals['canvasFonts'] else 'no-supported-source-ui-sites',build_route='library_runner.build -> library_ui_style.adapt_project',source_preserved=True)
  record['syntax']={'introduced':sum(x.get('syntax',{}).get('introduced',0) for x in evidence),'existing':sum(x.get('syntax',{}).get('existing',0) for x in evidence)}
  if record['engine']=='fusion-original':record['status']='fusion-generated-output-adapter';record['scope']='generated scene.js is adapted at build; original scene parameters retained'
  if record['engine']=='python-native':record['status']='native-content-retained';record['scope']='Cairo native scene is not modified by browser UI adapter'
  content=content_scope(record['id'],root)
  if content:
   record.update(status='native-content-retained',scope=content['reason'],content_kind=content['content_kind'],source_sites=content['source_sites'],source_review=content['review_scope'],counts={k:0 for k in totals})
 observations=root/'assets/library-runtime/current-ui/build-observations.json'
 if observations.is_file():
  byid={x['id']:x for x in _read(observations)['items']}
  for record in records:
   if record['id'] in byid:
    row=byid[record['id']];record.update(build_observation=row,counts=row['counts'],status=row['status'],scope=row.get('scope',record['scope']))
 data_syntax=_read(work/'source-sites.json')
 data={'schema':'ui-motion-fusion/source-ui-coverage@1','version':VERSION,'items':records,'counts':{'ids':len(records),'unique_source_files':len(files)},'not_claimed':'These are exact source transform sites, not full per-scene aesthetic or runtime verification.',**adapter_fingerprint(root)}
 data['syntax']={'files_checked':len(data_syntax),'introduced_diagnostics':sum(x.get('syntax',{}).get('introduced',0) for x in data_syntax),'preexisting_diagnostics':sum(x.get('syntax',{}).get('existing',0) for x in data_syntax)}
 _write(work/'library-ui-coverage.json',data);return data

if __name__=='__main__':
 import argparse
 parser=argparse.ArgumentParser();parser.add_argument('--root',type=Path,default=Path(__file__).resolve().parents[1]);parser.add_argument('--audit',type=Path,required=True)
 args=parser.parse_args();report=audit_catalog(args.root,args.audit);print(json.dumps(report['counts'],ensure_ascii=False))
