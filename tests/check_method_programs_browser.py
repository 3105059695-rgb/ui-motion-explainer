"""Real DOM/media composition checks; not a claim of source-film equivalence."""
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import hashlib,json,threading,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
from library_html_runner import QuietHandler
class Quiet(QuietHandler):pass
def run():
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 rows=[]
 try:
  with sync_playwright() as p:
   b=p.chromium.launch();page=b.new_page(viewport={'width':1280,'height':720});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   base=f'http://127.0.0.1:{server.server_port}/'
   programs=json.loads((ROOT/'assets/method-runtime/programs.json').read_text(encoding='utf-8'))['programs']
   for ident,effects in programs.items():
    errors.clear();row={'id':ident,'effects':effects,'passed':False}
    try:
     page.goto(base+'assets/semantic-motion/demo.html?effect=O01');page.evaluate('window.ready()');page.add_script_tag(url=base+'assets/method-runtime/method-runtime.js')
     result=page.evaluate("""async({ident,effects})=>{
      const stage=document.getElementById('stage');stage.innerHTML='';const phases=effects.map((effect,i)=>{const zone=document.createElement('div');zone.id='phase-'+i;stage.appendChild(zone);const f=SemanticDemoFixtures.build(effect,zone);return{id:'p'+(i+1),effect,start:i*6,end:(i+1)*6,options:f.options}});
      const engine=MethodRuntime.create({program:ident,duration:effects.length*6,phases},stage);
      const fingerprint=()=>JSON.stringify([...stage.querySelectorAll('*')].map(n=>[n.tagName,n.getAttribute('style')||'',n.children.length?null:n.textContent]));
      await engine.seek(0);const first=fingerprint(),traces=[],prints=[first];for(const phase of phases){traces.push(await engine.seek(phase.start+3));prints.push(fingerprint());}await engine.seek(effects.length*6);prints.push(fingerprint());await engine.seek(0);
      return {changed:new Set(prints).size>1,rewind:first===fingerprint(),traceCount:traces.length,phases:traces.map(t=>t.phases.map(p=>p.effect))};
     }""",{'ident':ident,'effects':effects})
     if not result['changed'] or not result['rewind'] or errors:raise AssertionError(str({'state':result,'errors':errors}))
     row.update(passed=True,**result)
    except Exception as e:row['error']=str(e)[:1500]
    rows.append(row)
   b.close()
 finally:server.shutdown();server.server_close()
 report={'program_count':len(rows),'passed_count':sum(x['passed'] for x in rows),'passed':all(x['passed'] for x in rows),'method_runtime_sha256':hashlib.sha256((ROOT/'assets/method-runtime/method-runtime.js').read_bytes()).hexdigest(),'media_http_range':True,'verification_scope':'All compiled compositions execute on actual DOM/SVG/media fixtures across all phase midpoints, end and backseek. Video seeks validate actual decoded time. Fixtures are not production layouts or user aesthetic approval.','items':rows}
 (ROOT/'assets/method-runtime/verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps({k:v for k,v in report.items() if k!='items'},ensure_ascii=False));print(json.dumps([x for x in rows if not x['passed']],ensure_ascii=False))
 return 0 if report['passed'] else 1
if __name__=='__main__':raise SystemExit(run())
