"""Real-browser UI-role/geometry checks; this is not aesthetic approval."""
from functools import partial
import argparse, hashlib, http.server, json, sys, threading
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import semantic_effects, method_programs

ROLE_SELECTORS={
 'X01':'.reveal-type','X02':'.sort-row','X03':'.source-doc,.magnifier',
 'X04':'.match-shell,.match-button','X05':'.step-box,.step-number','X06':'.diff-card,.diff-field',
 'X07':'.viewport,.moving-card','X08':'.flip-card,.flip-kicker',
 'X09':'.subtitle span','X10':'.qtext','X11':'.large','X12':'.new-rule,.not-always',
 'X13':'.step-slot,.fragment','X14':'.task-shell,.task-layer','X15':'svg.diagram',
 'X16':'svg.diagram,.process-badge','X17':'.work-card,.folder','X18':'.claim,.source',
 'X19':'.bookmark,.example-item','X20':'.concept-bg','X21':'.d-shell,.d-document-shell,.d-chrome',
 'X22':'.z-window,.z-doc,.z-context','X23':'#h-source,#h-paper,#h-source-chrome'}

class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def handle(self):
  try:super().handle()
  except (ConnectionResetError,BrokenPipeError):pass

def run(output):
 out=Path(output);out.mkdir(parents=True,exist_ok=True)
 server=http.server.ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 rows=[]
 try:
  with sync_playwright() as pw:
   browser=pw.chromium.launch(headless=True)
   page=browser.new_page(viewport={'width':1920,'height':1080})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   for entry in semantic_effects.entries():
    eid=entry['id'];source=entry['kind']=='source-timeline';errors.clear()
    base=f'http://127.0.0.1:{server.server_port}/assets/semantic-motion/'
    page.goto(base+('source-timelines/'+entry['source_group']+'.html?effect='+eid if source else 'demo.html?effect='+eid))
    page.evaluate('window.ready()')
    moments=[.15,.5,.85] if eid in ['X03','X14','X21','X22','X23'] else [.7]
    sampled=[]
    for fraction in moments:
     page.evaluate('(p)=>window.render(window.semanticDuration*p)',fraction)
     selector=ROLE_SELECTORS[eid] if source else '#stage .sm-card,#stage .sm-sheet,#stage .sm-tag,#stage .sm-row,#stage .sm-title,#stage svg'
     styles=page.evaluate('''s=>[...document.querySelectorAll(s)].map(n=>{const c=getComputedStyle(n);return {selector:n.id||n.className.baseVal||n.className,shadow:c.boxShadow,border:c.borderTopWidth,color:c.color,background:c.backgroundColor,font:c.fontFamily,weight:c.fontWeight,transform:c.transform,opacity:c.opacity,clipPath:c.clipPath}})''',selector)
     if source:
      # The role layer must never replace the source motion properties.
      page.evaluate('document.querySelector("style[data-semantic-ui-adapter]").sheet.disabled=true')
      preserved=page.evaluate('''([s,before])=>[...document.querySelectorAll(s)].every((n,i)=>{const c=getComputedStyle(n),b=before[i];return c.transform===b.transform&&c.opacity===b.opacity&&c.clipPath===b.clipPath})''',[selector,styles])
      page.evaluate('document.querySelector("style[data-semantic-ui-adapter]").sheet.disabled=false')
      assert preserved,eid+' adapter changed motion geometry'
     image_path=None
     if eid in ['O03','O09','O15','O18','R09','X03','X05','X08','X11','X14','X15','X16','X17','X18','X19','X20','X21','X22','X23']:
      image_path=eid+'-'+str(round(fraction*100))+'.png'
      page.screenshot(path=str(out/image_path),clip={'x':0,'y':0,'width':entry.get('width',1280),'height':entry.get('height',720)})
     sampled.append({'normalized_time':fraction,'styles':styles,'image':image_path})
    assert not errors,(eid,errors)
    if source:assert all(r['styles'] for r in sampled),eid+' missing role targets'
    rows.append({'id':eid,**semantic_effects.ui_contract(entry),'source_range':entry.get('source_range'),'role_selectors':ROLE_SELECTORS.get(eid),'samples':sampled,'browser_passed':True})
   browser.close()
 finally:
  server.shutdown();server.server_close()
 report={'schema_version':1,'style':'agent-editorial-a','passed':True,'effect_count':len(rows),'effects':rows,'methods':[{'id':r['id'],**method_programs.inspect(r['id'])['ui_adaptation']} for r in method_programs.records()],
  'sources':{p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in ['assets/agent-editorial/agent-editorial.js','assets/agent-editorial/source/body-a.js','assets/agent-editorial/source/body-b.js','assets/semantic-motion/theme.css','assets/semantic-motion/source-ui.css']},
  'boundaries':['O/R and methods operate on supplied episode objects. sm-* roles provide the approved visual host; arbitrary caller DOM is not forcibly recolored.','X retains source geometry, full duration, GSAP motion, masks and media slots; source UI roles are adapted.','Screenshots and sampled seeks are not full real-time playback review or user aesthetic approval.']}
 (out/'ui-adaptation-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 # Portable coverage contains relative evidence, never this machine output paths.
 public={**report,'effects':[{k:v for k,v in row.items() if k!='samples'} for row in rows], 'verification':'tests/check_semantic_ui_adaptation.py', 'proof_output':'--out (caller chooses local directory)'}
 (ROOT/'assets/semantic-motion/ui-adaptation.json').write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')
 return {'passed':True,'effects':len(rows),'methods':len(report['methods']),'output':str(out)}

if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('--out',required=True);a=p.parse_args();print(json.dumps(run(a.out),ensure_ascii=False))
