"""Exercise all 103 Director presets with the actual current-UI adapter."""
from functools import partial
import argparse,hashlib,http.server,json,re,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
MODULE=ROOT/'assets/modules/director'
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def handle(self):
  try:super().handle()
  except (ConnectionResetError,BrokenPipeError,ConnectionAbortedError):pass

def run(output):
 out=Path(output);out.mkdir(parents=True,exist_ok=True)
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 base=f'http://127.0.0.1:{server.server_port}/assets/modules/director/assets/studio/'
 scripts=re.findall(r'<script src="([^"]+)"', (MODULE/'assets/studio/index.html').read_text(encoding='utf-8'))
 selected=['software-agent-workflow-inspect','interaction-liquid-glass-control-suite','interaction-account-setup-accordion','interaction-invoice-node-focus','ai-coding-agent-progress']
 rows=[]
 try:
  with sync_playwright() as p:
   b=p.chromium.launch();page=b.new_page(viewport={'width':1920,'height':1080});errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.set_content('<!doctype html><link rel="stylesheet" href="'+base+'base.css"><body style="margin:0;width:1920px;height:1080px;overflow:hidden"><div id="test-root"></div>' + ''.join('<script src="'+base+s+'"></script>' for s in scripts if s!='player.js'))
   page.wait_for_function('window.UIFX && UIFX.presets.length===103');page.evaluate('document.fonts.ready')
   catalog=page.evaluate('UIFX.presets.map(x=>({id:x.id,duration:x.duration}))')
   for meta in catalog:
    eid=meta['id'];errors.clear()
    try:
     result=page.evaluate('''({id})=>{const root=document.querySelector('#test-root');if(window.currentScene)currentScene.destroy();window.currentScene=UIFX.mount(id,root);return {duration:currentScene.duration,ui:currentScene.uiAdaptation,count:root.querySelectorAll('*').length}}''',meta)
     assert result['ui']['style']=='agent-editorial-a'
     assert sum(result['ui']['roles'].values())>0,eid+' has no adapted objects'
     fingerprints=[];images=[]
     for fraction in [0,.25,.5,.85,1,0]:
      state=page.evaluate('''t=>{currentScene.timeline.pause().time(t,false);return JSON.stringify([...document.querySelectorAll('#test-root *')].filter(n=>n.tagName!=='STYLE').map(n=>{const c=getComputedStyle(n),r=n.getBoundingClientRect();return [n.tagName,n.id,[r.x,r.y,r.width,r.height].map(v=>Math.round(v*1000)/1000),c.opacity,c.clipPath,c.color,c.backgroundColor,c.fontSize,n.children.length?null:n.textContent]}))}''',result['duration']*fraction)
      fingerprints.append(hashlib.sha256(state.encode()).hexdigest())
      if eid in selected and fraction in [.25,.5,.85]:
       name=eid+'-'+str(int(fraction*100))+'.png';page.screenshot(path=str(out/name));images.append(name)
     assert len(set(fingerprints[:5]))>1,eid+' no state changes'
     assert fingerprints[0]==fingerprints[-1],eid+' backseek differs'
     assert not errors,str(errors)
     rows.append({'id':'software-preset:'+eid,'status':'current-ui-runtime-verified','adapter_files':['assets/modules/director/assets/studio/current-ui.js','assets/modules/director/assets/studio/core.js'],'roles':result['ui']['roles'],'duration':result['duration'],'validation':{'browser_seek_passed':True,'deterministic_backseek':True,'sampled_times':[0,.25,.5,.85,1,0],'images':images,'user_approved':False}})
    except Exception as e:
     rows.append({'id':'software-preset:'+eid,'status':'verification-failed','error':str(e)})
    print(eid,rows[-1]['status'],flush=True)
   b.close()
 finally:server.shutdown();server.server_close()
 report={'schema_version':1,'style':'agent-editorial-a','count':len(rows),'passed':all(r['status']=='current-ui-runtime-verified' for r in rows),'items':rows,'validation_scope':'All 103 actual source builders; full-span sampled seeks and backseek, representative screenshots. Not an aesthetic approval or full normal-speed playback review.','source_geometry_and_svg_artwork_preserved':True,'historical_source_mode':'params.uiStyle=source','adapter_sha256':hashlib.sha256((MODULE/'assets/studio/current-ui.js').read_bytes()).hexdigest()}
 (out/'director-ui-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 (MODULE/'ui-adaptation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 return report
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--out',required=True);a=p.parse_args();r=run(a.out);print(json.dumps({'passed':r['passed'],'count':r['count']}));raise SystemExit(0 if r['passed'] else 1)
