"""Render the original restored HTML/Canvas scene through its real seek API."""
import contextlib
import hashlib
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import json
import math
import os
import re
from pathlib import Path
import subprocess
import threading
from urllib.parse import unquote,urlsplit

class QuietHandler(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def send_head(self):
  self._byte_range=None
  requested=self.headers.get('Range')
  path=Path(self.translate_path(self.path))
  if not requested or not path.is_file():return super().send_head()
  match=re.fullmatch(r'bytes=(\d*)-(\d*)',requested.strip())
  size=path.stat().st_size
  if not match or not any(match.groups()):
   self.send_error(416,'Unsupported byte range');return None
  left,right=match.groups()
  start=int(left) if left else max(0,size-int(right))
  end=min(size-1,int(right)) if left and right else size-1
  if start>=size or start>end:
   self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.send_header('Content-Length','0');self.end_headers();return None
  stream=path.open('rb');stream.seek(start);self._byte_range=(start,end)
  self.send_response(206);self.send_header('Content-type',self.guess_type(str(path)))
  self.send_header('Content-Length',str(end-start+1));self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  self.send_header('Last-Modified',self.date_time_string(path.stat().st_mtime));self.end_headers()
  return stream
 def end_headers(self):
  self.send_header('Accept-Ranges','bytes');super().end_headers()
 def copyfile(self,source,outputfile):
  if self._byte_range is None:return super().copyfile(source,outputfile)
  remaining=self._byte_range[1]-self._byte_range[0]+1
  while remaining:
   chunk=source.read(min(1024*1024,remaining))
   if not chunk:break
   try:outputfile.write(chunk)
   except (BrokenPipeError,ConnectionResetError,ConnectionAbortedError):return
   remaining-=len(chunk)

def run(project,action,output=None,scale=1,config_override=None):
 from playwright.sync_api import sync_playwright
 project=Path(project).resolve();config=config_override or json.loads((project/'library-project.json').read_text(encoding='utf-8'))
 if not 0<scale<=2:raise ValueError('Render scale must be between 0 and 2')
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(project)))
 thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
 width=max(2,2*round(config.get('width',1920)*scale/2));height=max(2,2*round(config.get('height',1080)*scale/2))
 fps=config.get('fps',30);duration=config['duration'];errors=[];failed=[];calls=[];requested=set()
 report={'id':config['id'],'engine':'html-seek','action':action,'source_entry':config['entry'],'width':width,'height':height,'fps':fps,'duration':duration,'calls':calls,'browser_errors':errors,'failed_resources':failed,'actual_source_execution':True,'generic_fallback':False,'aesthetic_approval':False}
 try:
  from library_runner import browser_path
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,executable_path=browser_path(config.get('browser'),p.chromium.executable_path))
   try:
    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
    binding=project/'browser-binding.json'
    if not binding.is_file():binding=project/'library-binding.json'
    if binding.is_file():page.add_init_script('window.__UI_MOTION_BINDINGS__='+binding.read_text(encoding='utf-8')+';')
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('response',lambda r:failed.append({'url':r.url,'status':r.status}) if r.status>=400 else None)
    def record_asset(response):
     resource=unquote(urlsplit(response.url).path)
     if resource.startswith('/public/'):requested.add(resource[len('/public/'):])
    page.on('response',record_asset)
    page.route('**/*',lambda route:route.continue_() if route.request.url.startswith(('http://127.0.0.1:','data:','blob:')) else route.abort())
    page.goto(f'http://127.0.0.1:{server.server_port}/{config["entry"]}?render=1',wait_until='load')
    if config.get('fixed_canvas'):page.evaluate('(scale)=>{document.body.style.transformOrigin="0 0";document.body.style.transform="scale("+scale+")"}',scale)
    page.evaluate('''async()=>{await Promise.race([(async()=>{if(typeof window.ready==='function')await window.ready();else if(window.ready&&typeof window.ready.then==='function')await window.ready;await document.fonts.ready;})(),new Promise((_,reject)=>setTimeout(()=>reject(Error('Scene readiness timed out')),15000))]);}''')
    actual=page.evaluate('window.__composition||null')
    if actual:
     fps=actual['fps'];duration=actual['durationInFrames']/fps
     width=max(2,2*round(actual['width']*scale/2));height=max(2,2*round(actual['height']*scale/2))
     page.set_viewport_size({'width':width,'height':height})
     report.update(fps=fps,duration=duration,width=width,height=height,composition=actual,engine='remotion-original-player')
    api=config.get('clock_api') or page.evaluate("typeof window.seek==='function'?'seek':typeof window.render==='function'?'render':null")
    if not api:raise ValueError('Restored project exposes no seek/render; no generic fallback used')
    report['clock_api']='window.'+api
    if action in ('compile','smoke'):
     report['frames']=[]
     ratios=[.1,.5,.9] if action=='smoke' else [.1]
     for ratio in ratios:
      t=min(duration-1/fps,duration*ratio)
      state=page.evaluate('''async ({api,t})=>{const result=await window[api](t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return window.getState?window.getState():result??null}''',{'api':api,'t':t})
      calls.append({'time':t,'state':state});dest=project/'checks'/f'frame-{round(t*fps)}.png';dest.parent.mkdir(exist_ok=True)
      page.screenshot(path=str(dest));report['frames'].append(str(dest))
     report['frame_sha256']=[hashlib.sha256(Path(p).read_bytes()).hexdigest() for p in report['frames']]
     report['distinct_frames']=len(set(report['frame_sha256']))
     if action=='smoke' and report['distinct_frames']<2:raise ValueError('Three seeks produced identical pixels; verify the actual public clock API before marking executable')
    elif action=='render':
     dest=Path(output).resolve() if output else project/'render.mp4';dest.parent.mkdir(parents=True,exist_ok=True)
     if dest.exists():raise ValueError('Render output exists; choose an explicit new output')
     command=['ffmpeg','-v','error','-f','image2pipe','-vcodec','png','-r',str(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(dest)]
     encoder=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
     try:
      for frame in range(math.ceil(duration*fps)):
       t=frame/fps
       state=page.evaluate('''async({api,t})=>{const result=await window[api](t);return window.getState?window.getState():result??null}''',{'api':api,'t':t})
       if frame%max(1,round(fps))==0:calls.append({'time':t,'state':state})
       encoder.stdin.write(page.screenshot(type='png'))
      encoder.stdin.close();err=encoder.stderr.read().decode('utf-8',errors='replace');code=encoder.wait()
      if code:raise ValueError('FFmpeg failed: '+err)
     except BaseException:
      encoder.kill();encoder.wait();raise
     subprocess.run(['ffmpeg','-v','error','-i',str(dest),'-f','null','-'],check=True,capture_output=True)
     report.update(output=str(dest),full_decode='passed',audio='none; original silent motion scene')
    else:raise ValueError('Unknown action')
    if errors or failed:raise ValueError('Original scene failed: '+json.dumps({'errors':errors,'resources':failed},ensure_ascii=False)[:6000])
    report['status']='passed'
   finally:browser.close()
 finally:
  server.shutdown();server.server_close()
  report['requested_media']=sorted(requested)
  (project/('runtime-'+action+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 return report
