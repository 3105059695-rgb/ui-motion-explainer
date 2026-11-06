"""Execute compiled study/recipe compositions on current objects; no research replay."""
from __future__ import annotations
import argparse,hashlib,json,shutil,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def read(p):return json.loads(Path(p).read_text(encoding='utf-8-sig'))
def records(root=ROOT):
 maps=read(root/'assets/method-runtime/programs.json')['programs']
 originals={x['id']:x for f,k in [('references/source-study-methods.json','methods'),('references/semantic-editing-recipes.json','recipes')] for x in read(root/f)[k]}
 effects={x['id']:x for x in read(root/'assets/semantic-motion/manifest.json')['effects']}
 return [{'id':ident,'title':originals[ident]['title'],'effects':ids,'inputs':[{ 'phase':'p'+str(i+1),'effect':key,'parameters':effects[key].get('parameters',[])} for i,key in enumerate(ids)],'state_chain':originals[ident].get('state_chain',originals[ident].get('event_chain',[])),'aigc_assets_required':'R06' in ids,'scope':'A current-content motion composition; source observations are retained. Phase durations, object layouts and generated media are episode inputs.'} for ident,ids in maps.items()]
def inspect(ident,root=ROOT):
 row=next((r for r in records(root) if r['id']==ident),None)
 if not row:raise ValueError('No executable production program; negative examples are not effects: '+ident)
 return row
def scaffold(ident,out,root=ROOT):
 info=inspect(ident,root);p=Path(out)
 if p.exists():raise ValueError('Output exists')
 spec={'program':ident,'duration':6*len(info['effects']),'phases':[{'id':'p'+str(i+1),'effect':effect,'start':6*i,'end':6*(i+1),'options':{}} for i,effect in enumerate(info['effects'])],'text':{},'media':{},'note':'Bind this narration and existing DOM objects. Empty options cannot render. Default duration is only editable scaffolding.'}
 p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8');return {'output':str(p)}
def build(spec_path,stage,out,root=ROOT):
 p=Path(spec_path).resolve();spec=read(p);entry=inspect(spec['program'],root);out=Path(out)
 if out.exists():raise ValueError('Output exists')
 if [x['effect'] for x in spec['phases']]!=entry['effects']:raise ValueError('Phase effect IDs must match this program; use semantic API for a different composition')
 if not spec.get('duration',0)>0 or any(not x.get('options') for x in spec['phases']):raise ValueError('Current object bindings and positive duration required')
 body=Path(stage).read_text(encoding='utf-8')
 if '<html' in body.lower() or '<body' in body.lower():raise ValueError('Stage must be a current-object HTML fragment')
 out.mkdir(parents=True)
 for f in ['assets/method-runtime/method-runtime.js','assets/semantic-motion/semantic-motion.js','assets/semantic-motion/theme.css']:
  shutil.copy2(root/f,out/Path(f).name)
 shutil.copy2(root/'assets/qiaomu-fonts/fonts/notosans.woff2',out/'Noto.woff2')
 for sel,asset in spec.get('media',{}).items():
  src=Path(asset['src']);src=(p.parent/src).resolve() if not src.is_absolute() else src
  if not src.is_file():raise ValueError('Missing current media '+str(src))
  filename=hashlib.sha256(src.read_bytes()).hexdigest()[:24]+src.suffix.lower()
  dest=out/'media'/filename;dest.parent.mkdir(exist_ok=True)
  if not dest.exists():shutil.copy2(src,dest)
  asset['src']='media/'+filename
 encoded=json.dumps(spec,ensure_ascii=False).replace('<','\\u003c')
 page='<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="theme.css"><style>@font-face{font-family:Noto;src:url(Noto.woff2)}body{margin:0}</style><div id="stage" class="sm-stage">'+body+'</div><script src="semantic-motion.js"></script><script src="method-runtime.js"></script><script>const spec='+encoded+''';const stage=document.getElementById('stage');for(const [sel,text]of Object.entries(spec.text||{})){const n=stage.querySelector(sel);if(!n||n.children.length)throw Error('Missing leaf '+sel);n.textContent=text;}for(const [sel,asset]of Object.entries(spec.media||{})){const n=stage.querySelector(sel);if(!n||!['IMG','VIDEO'].includes(n.tagName))throw Error('Missing media '+sel);n.src=asset.src;n.muted=true;}const engine=MethodRuntime.create(spec,stage);const firstReady=(async()=>{await document.fonts.ready;await engine.seek(0)})();window.ready=()=>firstReady;window.seek=async t=>{await firstReady;window.__methodTrace=await engine.seek(t);return window.__methodTrace};window.render=window.seek;</script>'''
 (out/'index.html').write_text(page,encoding='utf-8')
 (out/'method-binding.json').write_text(json.dumps(spec,ensure_ascii=False,indent=2),encoding='utf-8')
 (out/'library-project.json').write_text(json.dumps({'id':'method:'+entry['id'],'engine':'html-seek','entry':'index.html','duration':spec['duration'],'width':1280,'height':720,'fps':30,'fixed_canvas':True,'runtime_status':'not-rendered','user_approved':False},ensure_ascii=False),encoding='utf-8')
 return {'project':str(out.resolve()),'program':entry['id'],'effects':entry['effects']}
def main(argv=None):
 p=argparse.ArgumentParser(description=__doc__);s=p.add_subparsers(dest='cmd',required=True);s.add_parser('list');q=s.add_parser('inspect');q.add_argument('--id',required=True);q=s.add_parser('scaffold');q.add_argument('--id',required=True);q.add_argument('--out',required=True);q=s.add_parser('build');q.add_argument('--spec',required=True);q.add_argument('--stage',required=True);q.add_argument('--out',required=True);a=p.parse_args(argv)
 try:r=records() if a.cmd=='list' else inspect(a.id) if a.cmd=='inspect' else scaffold(a.id,a.out) if a.cmd=='scaffold' else build(a.spec,a.stage,a.out)
 except (ValueError,OSError,KeyError)as e:p.error(str(e))
 print(json.dumps(r,ensure_ascii=False,indent=2));return 0
if __name__=='__main__':sys.exit(main())
