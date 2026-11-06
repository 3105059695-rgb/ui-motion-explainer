"""Join actual per-scene browser proofs, refusing stale or missing code hashes."""
from pathlib import Path
import hashlib,json
ROOT=Path(__file__).resolve().parents[1]
BASE='assets/rebuilt-library/'
REPORTS=['root-scene-report.json','batch-001-063-report.json','verification/member-batch2.json','verification/member-batch3.json','extra-reference-report.json']
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def build(root=ROOT):
 rows=[];seen=set()
 current_report=root/BASE/'verification/ui-adaptation-all.json'
 reports=['verification/ui-adaptation-all.json'] if current_report.is_file() else REPORTS
 for name in reports:
  d=json.loads((root/BASE/name).read_text(encoding='utf-8'))
  for r in d.get('items',d.get('rows',[])):
   ident=r['id'];slug=ident.removeprefix('fredtalk:').removeprefix('reference:');rel=BASE+'scenes/'+slug+'.json';p=root/rel
   assert ident not in seen,ident;seen.add(ident)
   assert r.get('ok',r.get('passed',False)),ident+' failed'
   assert r['scene_sha256']==sha(p),ident+' scene changed after proof'
   scene=json.loads(p.read_text(encoding='utf-8'));runtime=r.get('runtime_sha256',r.get('executed_runtime_sha256'))
   assert runtime==sha(root/BASE/'scene-runtime.js'),ident+' runtime changed after proof'
   hashes={rel:r['scene_sha256'],BASE+'scene-runtime.js':runtime}
   if name=='verification/ui-adaptation-all.json':
    ui_hash=r.get('ui_adapter_sha256')
    assert ui_hash==sha(root/BASE/'current-ui.js'),ident+' current UI adapter changed after proof'
    hashes[BASE+'current-ui.js']=ui_hash
    for path,value in r.get('shared_code_sha256',{}).items():
     assert value==sha(root/path),ident+' shared drawing code changed after proof: '+path
     hashes[path]=value
   ext=r.get('extension_hashes',r.get('executed_extension_sha256',{}))
   if r.get('extension_file'):ext={r['extension_file'].removeprefix(BASE):r['extension_sha256']}
   for item in scene.get('extensions',[]):
    assert item in ext and ext[item]==sha(root/BASE/item),ident+' extension changed after proof: '+item
    hashes[BASE+item]=ext[item]
   frames=r.get('pixel_hashes',r.get('rendered_frame_sha256',[]))
   rows.append({'id':ident,'engine':'independent-html-scene','entry':rel,'runtime_status':'ready','execution':{'compile':'passed','smoke':'passed','distinct_frames':len(set(frames)),'backward_seek_deterministic':r.get('backward_seek_deterministic',r.get('deterministic_backseek',False))},'required_media':list(scene.get('assets',{})),'proof':{'record':BASE+name,'times':r.get('times',r.get('call_times',r.get('checked_times_seconds',[]))),'mode':r.get('mode','demo'),'full_realtime_av_review':False},'verified_code_sha256':hashes,'aesthetic_approval':False,'implementation_origin':'independent implementation from complete accessible preview, not membership source'})
 actual={json.loads(p.read_text(encoding='utf-8'))['id'] for p in (root/BASE/'scenes').glob('*.json')}
 assert seen==actual,{'unverified':sorted(actual-seen),'unknown':sorted(seen-actual)}
 report={'schema_version':1,'count':len(rows),'scope':'Complete independent scene programs. All actual tested code hashes must match; this does not claim exact original source or user aesthetic approval.','items':rows}
 (root/BASE/'execution.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 return report
if __name__=='__main__':print(json.dumps({'count':build()['count'],'verified':True}))
