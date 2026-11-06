"""Join real execution manifests to the retained catalog without rewriting history."""
from __future__ import annotations
import json,hashlib
from pathlib import Path

def read(root,name,default=None):
 p=Path(root)/name
 return json.loads(p.read_text(encoding='utf-8-sig')) if p.is_file() else default

def library_call(ident):
 return {'inspect':'ui.py library inspect --id '+ident,
         'scaffold':'ui.py library scaffold --id '+ident+' --out <bindings.json>',
         'build':'ui.py library build --spec <bindings.json> --out <project>',
         'render':'ui.py library render --project <project> --out <output.mp4>',
         'scope':'Execute the registered original or explicitly independent implementation with current content bindings. No repeated source-video research; no silent generic fallback.'}

def apply(rows,root):
 root=Path(root)
 execution={}
 hash_cache={}
 for path in ('assets/library-runtime/implementations.json','assets/library-runtime/fusion-execution.json','assets/rebuilt-library/execution.json'):
  for item in read(root,path,{}).get('items',[]):
   for key in (item.get('id'),item.get('catalog_id')):
    if key:execution[key]=item
 semantic={x['id']:x for x in read(root,'assets/semantic-motion/manifest.json',{}).get('effects',[])}
 programs=read(root,'assets/method-runtime/programs.json',{}).get('programs',{})
 program_proof={x['id']:x for x in read(root,'assets/method-runtime/verification.json',{}).get('items',[])}
 retained={}
 for base in ('assets/retained-expressions/fangmu-token','assets/retained-expressions/adiao-unemployment-opening'):
  m=read(root,base+'/manifest.json',{})
  for x in m.get('entries',[]):retained[x['id']]={**x,'manifest':base+'/manifest.json','base':base,'tested':m.get('runtime_tested_this_run',False)}
 for row in rows:
  ident=row['original_id']; canonical=row['id']; routes=None; proof=execution.get(canonical,execution.get(ident))
  if ident in semantic:
   s=semantic[ident];status=s.get('technical_status','not-checked')
   row.update(adapter_kind=s['kind'],parameters=s.get('parameters',s.get('binding_schema',{})),
     execution_state='direct' if status=='browser-seek-verified' else 'source-adaptation',
     call={'inspect':'ui.py semantic inspect '+ident,
       'materialize':'ui.py semantic materialize --id '+ident+' --bindings <bindings.json> '+('' if s['kind']=='source-timeline' else '--stage <current-objects.html> --duration <seconds> ')+'--out <project>',
       'scope':'Bind current DOM/SVG/text/media; original X timelines preserve complete source intervals. Demonstration content is not production input.'},
     runtime_verification={'status':status,'record':s.get('validation'),'scope':'Multiple actual seeks, deterministic backseek and separate current-content binding tests; not aesthetic approval.'},
     preview={'path':'assets/semantic-motion/index.html','effect':ident})
   row['source_files']=[{'path':s['implementation'],'exists':(root/s['implementation']).is_file(),'packaged':True,'type':'file'}]
  elif canonical in retained:
   m=retained[canonical];row.update(execution_state='direct' if m['tested'] else 'source-adaptation',
    adapter_kind='retained-source-binding',parameters={'required_media':m.get('required_media',[])},
    call=library_call(canonical),runtime_verification={'status':'passed' if m['tested'] else 'not-checked','record':m['manifest'],'scope':'Original authored source. Private face/voice absent; production requires current inputs.'})
   row['source_files']=[{'path':m['base']+'/'+m['file'],'exists':(root/m['base']/m['file']).is_file(),'packaged':True,'type':'file'}]
  elif row['kind']=='reference':
   base='assets/modules/reference/assets/reconstructions/'+ident
   meta=read(root,base+'/portable-source.json',{})
   if meta:
    row.update(execution_state='direct' if meta.get('runtime_tested_this_run') else 'source-adaptation',
      adapter_kind='restored-original-source',call=library_call(canonical),
      runtime_verification={'status':'passed' if meta.get('runtime_tested_this_run') else 'not-checked','record':base+'/portable-source.json','scope':meta.get('verification_scope')})
    row['source_files']=[{'path':base+'/'+meta.get('entry','index.html'),'exists':(root/base/meta.get('entry','index.html')).is_file(),'packaged':True,'type':'file'}]
   elif ident in ('twoclipping-5cba86','twoclipping-221cab'):
    template={'twoclipping-5cba86':'ui-morph','twoclipping-221cab':'launch-film'}[ident]
    row.update(execution_state='direct',adapter_kind='retained-executable-starter',call=library_call(canonical),runtime_verification={'status':'passed','record':'assets/modules/reference/assets/reference-shared/recovery-verification.json','scope':'Retained public starter, actual three seeks. Not a claim of exact original creator source or new user approval.'})
    row['source_files']=[{'path':'assets/modules/reference/assets/templates/'+template+'/index.html','exists':True,'packaged':True,'type':'file'}]
  if ident.startswith('fredtalk:') or row['kind']=='reference':
   if ident.startswith('fredtalk:'):row['eligible_when_upstream_archived']=True
   scene='assets/rebuilt-library/scenes/'+ident.removeprefix('fredtalk:').removeprefix('reference:')+'.json'
   independent=read(root,scene)
   if independent:
    row.update(adapter_kind='independent-reference-scene',execution_state='source-adaptation',
      parameters={'inputs':independent.get('inputs',{}),'media':list(independent.get('assets',{})),'duration':independent['duration']},
      call=library_call(ident),implementation_origin='independently-authored-from-accessible-complete-preview',
      original_membership_source_included=False,user_approval={'new_implementation':False})
    row['source_files']=[{'path':scene,'exists':True,'packaged':True,'type':'file'}]
    row['title']=independent['title']
    if independent.get('semantic_use'):row['semantic_use']=independent['semantic_use']
   elif ident.startswith('fredtalk:') and row['source_access']=='public':
    row.update(call=library_call(ident),adapter_kind='original-source-binding')
  if proof:
   status=proof.get('runtime_status','not-checked')
   for relative,expected in proof.get('verified_code_sha256',{}).items():
    if relative not in hash_cache:
     source=root/relative
     hash_cache[relative]=hashlib.sha256(source.read_bytes()).hexdigest() if source.is_file() else None
    if hash_cache[relative]!=expected:status='changed-since-verification'
   passed=status=='ready' and proof.get('execution',{}).get('smoke')=='passed'
   row.update(execution_state='direct' if passed else 'source-adaptation',call=library_call(ident if ident.startswith('fredtalk:') else canonical),
     runtime_verification={'status':status,'execution':proof.get('execution',{}),'proof':proof.get('proof',{}),'blocking':proof.get('blocking',proof.get('error'))})
  if row['kind'] in ('method','recipe') and ident in programs:
   ok=program_proof.get(ident,{}).get('passed',False)
   row.update(adapter_kind='compiled-motion-composition',execution_state='direct' if ok else 'source-adaptation',
     parameters={'effects':programs[ident],'current_inputs':'Host objects, explicit options, narration time windows and current clips; no fixed layout or automatic AIGC.'},
     call={'inspect':'ui.py programs inspect --id '+ident,
       'scaffold':'ui.py programs scaffold --id '+ident+' --out <phases.json>',
       'build':'ui.py programs build --spec <phases.json> --stage <current-objects.html> --out <project>',
       'render':'ui.py library render --project <project> --out <output.mp4>',
       'scope':'Execute the retained method as bound motion phases. This is an explicit composition of real effects, not the original creator full scene or generated AIGC.'},
     runtime_verification={'status':'passed' if ok else 'not-checked','record':'assets/method-runtime/verification.json'},
     source_files=[{'path':p,'exists':(root/p).is_file(),'packaged':True,'type':'file'} for p in ('assets/method-runtime/programs.json','assets/method-runtime/method-runtime.js','scripts/method_programs.py')])
  if row['kind']=='family':
   # Families aggregate callable items and are not additional independent effects.
   row['is_aggregate']=True
   row['execution_state']='aggregate'
   row['call']={'list':'ui.py capabilities list','scope':'This family groups actual implementations; inspect selected child entries and their runtime state.'}
   if ident=='anime-semantic-performance':
    row.update(execution_state='direct',adapter_kind='generation-workflow',
      call={'plan':'python scripts/metaso_video.py plan --prompt-file <prompt.txt> --out <request.json>',
        'create':'python scripts/metaso_video.py create --help',
        'query':'python scripts/metaso_video.py query --help',
        'download':'python scripts/metaso_video.py download --help',
        'scope':'Current prompt, image, motion and configured provider required. Generation is external and can incur fees; an example movie is not a prerequisite or generated output.'},
      source_files=[{'path':'scripts/metaso_video.py','exists':(root/'scripts/metaso_video.py').is_file(),'packaged':True,'type':'file'}])
  labels={'direct':'有可调用参数接口','source-adaptation':'有源码与绑定入口，检查具体执行状态','reference-only':'参考记录，尚无完整执行实现','missing':'声明的实现当前缺失','aggregate':'能力分类，调用其实际子条目'}
  row['runtime_verified_this_run']=row.get('runtime_verification',{}).get('status') in ('ready','passed','browser-seek-verified')
  row['execution_label']=labels[row['execution_state']]
 return rows
