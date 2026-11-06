"""Portable continuous style demonstration using all original BodyA/BodyB designs."""
from __future__ import annotations
import argparse
import base64
import hashlib
import html
import json
import math
from pathlib import Path
import shutil
import subprocess
import threading
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT=Path(__file__).resolve().parents[1]
FOLDER=Path('assets/style-film')

def read(path):return json.loads(Path(path).read_text(encoding='utf-8-sig'))
def write(path,value):Path(path).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def text(x,y,words,size=27,color='#0B0B0F',weight=650):return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}">{html.escape(words)}</text>'
def rect(x,y,w,h,color,r=16):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{color}"/>'

def prepare(root=ROOT):
 root=Path(root);folder=root/FOLDER;media=folder/'media';media.mkdir(parents=True,exist_ok=True)
 if (folder/'current-style-full.mp4').exists():raise ValueError('Complete film already exists; inspect it instead of resetting or silently rebuilding the release movie.')
 source=read(root/'assets/agent-editorial/source-designs.json')
 assets=[];chapters=[];cursor=0
 descriptions=[('任务工作区','把需求交给工具，结果留在项目中。',['整理项目资料','拆分独立任务','输出可以接着用的结果']),('研究工作区','先明确前提，再把证据整理成报告。',['核对原始问题','整理材料与出处','形成结论与报告']),('团队交付','消息、素材和最终交付保持关联。',['归集文档与表格','持续同步任务状态','送达协作者']),('模块工作台','相互独立的模块，组合成可运行流程。',['输入资料','处理规则','输出格式']),('需求澄清','先问清楚，再继续执行。',['确定输出对象','补充关键条件','校准执行范围']),('跨设备接续','同一任务，换到另一台设备继续。',['电脑上的文件','手机上的修改','同步后的结果']),('远程执行','指令进入，结果回到眼前。',['接收工作请求','执行指定任务','返回可查看结果']),('资源与队列','看见容量，才知道哪里发生等待。',['当前运行任务','剩余可用资源','排队中的请求']),('可编辑变更','每次改动都能看清，也能撤回。',['选择一个区块','修改内容与布局','比较并撤销改动']),('工具汇合','按任务选择工具，结果回到同一处。',['信息检索','内容处理','成果交付'])]
 for i,d in enumerate(source['designs']):
  title,desc,items=descriptions[i]
  b=rect(0,0,1600,900,'#F3F3F5',0)+rect(28,28,1544,844,'#FFFFFF',24)+rect(28,28,1544,76,'#0B0B0F',24)+rect(28,65,1544,39,'#0B0B0F',0)
  b+=text(66,78,'工作室  /  '+title,28,'#FFFFFF',800)+text(1330,78,'内容示意',24,'#D6C2FF',600)
  b+=rect(50,128,255,716,'#F3F3F5',15)
  for k,name in enumerate(['项目概览','素材与文件','执行中的任务','成果与版本']):
   if k==i%4:b+=rect(70,171+k*76,215,57,'#0B0B0F',12)
   b+=text(93,208+k*76,name,25,'#D6C2FF' if k==i%4 else '#777780',700)
  b+=text(345,195,title,56,'#0B0B0F',850)+text(347,247,desc,27,'#777780',500)
  if i in (2,5,6):
   for k,item in enumerate(items):
    x=350+k*393;b+=rect(x,302,365,370,'#0B0B0F',19)+rect(x+25,333,48,8,'#D6C2FF',3)+text(x+25,403,item,30,'#FFFFFF',800)
    b+=text(x+25,458,['资料已就绪','处理可跟踪','结果可查看'][k],24,'#BBB7C7',500)+rect(x+25,597,315,10,'#494653',4)+rect(x+25,597,230-k*37,10,'#D6C2FF',4)
  else:
   for k,item in enumerate(items):
    y=304+k*124;b+=rect(347,y,1164,99,'#0B0B0F' if k==1 else '#F3F3F5',15)+rect(369,y+28,40,40,'#D6C2FF' if k==1 else '#DBDBE0',10)+text(437,y+63,item,32,'#FFFFFF' if k==1 else '#0B0B0F',800)+text(1306,y+62,['已整理','处理中','可查看'][k],25,'#D6C2FF' if k==1 else '#777780',650)
  b+=rect(348,747,1163,69,'#F3F3F5',12)+text(375,791,'原创界面示意 · 用于观察材质、构图和动作，不是产品截图',23,'#777780',500)
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900"><g font-family="Noto Sans SC,Microsoft YaHei,sans-serif">{b}</g></svg>'
  name=d['id']+'.svg';(media/name).write_text(svg,encoding='utf-8');aid='material-'+d['id'];assets.append({'id':aid,'src':'media/'+name})
  icon=rect(0,0,300,300,'#0B0B0F',65)+rect(65,65,65,65,'#D6C2FF',15)+rect(170,65,65,65,'#FFFFFF',15)+rect(65,170,65,65,'#FFFFFF',15)+rect(170,170,65,65,'#D6C2FF',15)
  logo=d['id']+'-mark.svg';(media/logo).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">{icon}</svg>',encoding='utf-8');lid='mark-'+d['id'];assets.append({'id':lid,'src':'media/'+logo})
  duration=round(d['source_range'][1]-d['source_range'][0],6)
  binding={'design':d['id'],'sourceRange':d['source_range'],'duration':duration,'demo':True,'copy':{},'media':{s['key']:aid for s in d['media_slots']},'logos':{s['key']:lid for s in d['logo_slots']}}
  chapters.append({'id':d['id'],'index':i+1,'label':d['label'],'start':cursor,'end':round(cursor+duration,6),'duration':duration,'source_file':d['source_file'],'source_sha256':d['source_sha256'],'source_range':d['source_range'],'binding':binding});cursor=round(cursor+duration,6)
 data={'schema_version':1,'duration':cursor,'sourceManifest':source,'assets':assets,'chapters':chapters}
 (folder/'film-data.js').write_text('window.StyleFilmData = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
 manifest={'schema_version':1,'id':'approved-source-continuous-style-film','duration_seconds':cursor,'movie':'current-style-full.mp4','live_player':'index.html','continuous':True,'chapters':[{k:v for k,v in ch.items() if k!='binding'} for ch in chapters],'source_manifest':'assets/agent-editorial/source-designs.json','source_manifest_sha256':digest(root/'assets/agent-editorial/source-designs.json'),'palette':'assets/agent-editorial/palette.json','palette_sha256':digest(root/'assets/agent-editorial/palette.json'),'media_policy':'Original public demonstration SVG interfaces replace private original media. Original BodyA/BodyB execute unchanged.','approval_scope':'Source body UI and motion are the approved baseline; this new complete source demonstration is not the approved original movie and has no new user approval.','aigc':{'movie':'assets/approved-girl-sample/output/preview.mp4','scope':'Approved complete painterly AIGC action sample. Historical UI is not the current body UI; no permanent character identity requirement.'},'original_references':[{'id':'source-video:fangmu-ten-agents-final-20261021','scope':'Current approved body 15–300.04s; opening excluded.'},{'id':'source-video:fred-argon','scope':'Color/material and editing reference; no source palette replaces the latest A accent.'},{'id':'source-video:fred-jev','scope':'Color/material and continuous explanatory motion.'},{'id':'source-video:fred-weekly','scope':'Color/material across the full original video.'}],'viewing_status':'not-watched-by-building-or-inspecting','rendered':False}
 write(folder/'manifest.json',manifest)
 return manifest

def inspect(root=ROOT):
 root=Path(root);m=read(root/FOLDER/'manifest.json');movie=root/FOLDER/m['movie']
 from resource_inventory import load_overlay,resource_fact
 overlay=load_overlay(root)
 current_source=digest(root/m['source_manifest'])==m['source_manifest_sha256']
 current_palette=digest(root/m['palette'])==m['palette_sha256']
 movie_valid=bool(m.get('rendered') and movie.is_file() and digest(movie)==m.get('movie_sha256'))
 return {**m,'movie_path':str(movie.resolve()),'movie_exists':movie.is_file(),'movie_hash_matches':movie_valid,'source_manifest_current':current_source,'palette_current':current_palette,'portable_movie_ready':movie_valid and current_source and current_palette,'player_path':str((root/FOLDER/m['live_player']).resolve()),'aigc_movie_path':str((root/m['aigc']['movie']).resolve()),'original_references':[dict(r,resource=resource_fact(r['id'],None,root=root,overlay=overlay)) for r in m['original_references']],'reading_instruction':'First open the complete movie with a video-capable tool or continuous player. Read full chapters as events, not screenshots. Loading metadata, decoding or frame sampling is not continuous viewing. If the current model/tool cannot consume video, say so explicitly; use the executable approved code and request human playback review instead of claiming it watched.','viewing_status':'not-observed-by-this-command'}

def render(root=ROOT,width=1280,fps=24):
 from playwright.sync_api import sync_playwright
 root=Path(root);folder=root/FOLDER;m=read(folder/'manifest.json');out=folder/m['movie']
 if out.exists():raise ValueError('Video already exists; refuse duplicate rendering/overwrite')
 class Quiet(SimpleHTTPRequestHandler):
  def log_message(self,*args):pass
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)))
 thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
 ffmpeg=shutil.which('ffmpeg');assert ffmpeg,'Reuse an installed ffmpeg'
 count=math.ceil(m['duration_seconds']*fps);height=width*9//16
 errors=[];encoder=None;log=(folder/'render-encoder.log').open('wb')
 try:
  with sync_playwright() as p:
   browser=p.chromium.launch(headless=True,args=['--disable-gpu','--no-sandbox'])
   page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
   page.on('pageerror',lambda error:errors.append(str(error)))
   page.goto(f'http://127.0.0.1:{server.server_port}/assets/style-film/index.html?render',wait_until='load')
   page.evaluate('() => StyleFilm.ready')
   encoder=subprocess.Popen([ffmpeg,'-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate',str(fps),'-i','pipe:0','-an','-vf',f'scale={width}:{height}','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(out)],stdin=subprocess.PIPE,stderr=log)
   for i in range(count):
    encoded=page.evaluate('t => {StyleFilm.render(t);return StyleFilm.canvas.toDataURL("image/jpeg",.93).split(",")[1];}',min(i/fps,m['duration_seconds']-1e-6))
    encoder.stdin.write(base64.b64decode(encoded))
    if i%480==0:print(json.dumps({'rendered_frames':i,'total_frames':count}),flush=True)
   execution=page.evaluate('() => StyleFilm.execution()');encoder.stdin.close();code=encoder.wait();assert code==0,'FFmpeg encode failed'
   browser.close()
  if errors:raise ValueError('Browser errors: '+str(errors))
  subprocess.run([ffmpeg,'-v','error','-i',str(out),'-f','null','-'],check=True)
  actual=json.loads(subprocess.check_output([shutil.which('ffprobe'),'-v','error','-show_format','-show_streams','-of','json',str(out)],text=True,encoding='utf-8'))
  m.update(rendered=True,movie_sha256=digest(out),movie_bytes=out.stat().st_size,render={'width':width,'height':height,'fps':fps,'frames':count,'browser_errors':errors,'full_decode':'passed','actual_duration':float(actual['format']['duration']),'source_executions':execution,'continuous_human_review':False,'model_continuous_video_review':False})
  write(folder/'manifest.json',m);print(json.dumps({'movie':str(out),'duration':m['duration_seconds'],'bytes':out.stat().st_size,'source_designs_executed':len(execution),'full_decode':'passed'},ensure_ascii=False))
  return m
 finally:
  if encoder is not None and encoder.poll() is None:
   if encoder.stdin and not encoder.stdin.closed:encoder.stdin.close()
   encoder.terminate();encoder.wait()
  log.close();server.shutdown();server.server_close()
  if (folder/'render-encoder.log').is_file() and (folder/'render-encoder.log').stat().st_size==0:(folder/'render-encoder.log').unlink()

def main(argv=None):
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('command',choices=('prepare','inspect','render'));parser.add_argument('--root',type=Path,default=ROOT);parser.add_argument('--width',type=int,default=1280);parser.add_argument('--fps',type=int,default=24);args=parser.parse_args(argv)
 if args.command=='prepare':result=prepare(args.root);print(json.dumps({'duration_seconds':result['duration_seconds'],'chapters':len(result['chapters'])}))
 elif args.command=='inspect':print(json.dumps(inspect(args.root),ensure_ascii=False,indent=2))
 else:render(args.root,args.width,args.fps)
if __name__=='__main__':main()
