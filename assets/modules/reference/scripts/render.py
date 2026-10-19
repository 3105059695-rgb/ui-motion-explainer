"""Render deterministic HTML compositions to H.264, with optional audio and temporal blur."""
import argparse, hashlib, io, json, math, shutil, subprocess, sys, threading, time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, 'reconfigure'):stream.reconfigure(encoding='utf-8')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project',type=Path,required=True)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--width',type=int)
    parser.add_argument('--height',type=int)
    parser.add_argument('--fps',type=int)
    parser.add_argument('--start',type=float,default=0)
    parser.add_argument('--end',type=float)
    parser.add_argument('--samples',type=int,default=1)
    parser.add_argument('--audio',type=Path)
    parser.add_argument('--audio-offset',type=float,default=0)
    parser.add_argument('--stills-only',action='store_true')
    parser.add_argument('--check-seek',action='store_true')
    parser.add_argument('--check-repeat',action='store_true',help='Check repeat seek pixels/state without requiring a loop')
    parser.add_argument('--repeat-max-different-fraction',type=float,default=0,help='Explicit fraction tolerance for minor raster variance; exact comparison remains the default')
    parser.add_argument('--repeat-max-channel-delta',type=int,default=0,help='Maximum permitted RGB channel difference when an explicit repeat tolerance is used')
    a=parser.parse_args()
    from PIL import Image, ImageDraw, ImageChops
    from playwright.sync_api import sync_playwright
    project=a.project.resolve();dest=a.out.resolve()
    config=json.loads((project/'project.json').read_text(encoding='utf-8-sig'))
    width=a.width or int(config.get('width',1440));height=a.height or 2*round(width*int(config.get('height',1440))/int(config.get('width',1440))/2)
    fps=a.fps or int(config.get('fps',60));duration=float(config['duration']);end=a.end if a.end is not None else duration
    if min(width,height)<128 or width%2 or height%2:parser.error('Use even dimensions >=128')
    if not 1<=fps<=120 or not 1<=a.samples<=8:parser.error('FPS 1..120; samples 1..8')
    if not 0<=a.repeat_max_different_fraction<=1 or not 0<=a.repeat_max_channel_delta<=255:parser.error('Repeat tolerance fraction 0..1; channel delta 0..255')
    if bool(a.repeat_max_different_fraction)!=bool(a.repeat_max_channel_delta):parser.error('Set both repeat tolerance limits explicitly, or omit both for exact comparison')
    if not 0<=a.start<end<=duration:parser.error('Invalid time range')
    if a.audio and not a.audio.is_file():parser.error('Audio file missing')
    if dest==project or dest==project.parent:parser.error('Use a dedicated output directory')
    if dest.exists() and any(dest.iterdir()):parser.error('Output directory is not empty; choose a new destination')
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):parser.error('ffmpeg and ffprobe must be on PATH')
    dest.mkdir(parents=True,exist_ok=True)
    class Handler(SimpleHTTPRequestHandler):
        def log_message(self,*args):pass
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(Handler,directory=str(project)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    encoder=None; errors=[];request_errors=[];checks={};repeat_comparison=None;started=time.time();requested_files=set();source_snapshot=[]
    marks=config.get('marks') or [a.start+(end-a.start)*q for q in [0,.15,.3,.5,.7,.9]]
    normalized=[]
    for mark in marks:
        t=float(mark.get('time',mark.get('t',0))) if isinstance(mark,dict) else float(mark)
        if a.start<=t<end:normalized.append(t)
    if not normalized:normalized=[a.start]
    marks=normalized if len(normalized)<=24 else [normalized[round(i*(len(normalized)-1)/23)] for i in range(24)]
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,args=['--autoplay-policy=no-user-gesture-required'])
            page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('requestfailed',lambda r:request_errors.append({'url':r.url,'failure':r.failure}))
            def capture_asset(response):
                parsed=urlsplit(response.url)
                if parsed.hostname!='127.0.0.1':return
                file=(project/unquote(parsed.path).lstrip('/')).resolve()
                if file.is_relative_to(project) and file.is_file() and file not in requested_files:
                    requested_files.add(file)
                    source_snapshot.append({'path':file.relative_to(project).as_posix(),'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
            page.on('response',capture_asset)
            page.goto('http://127.0.0.1:%d/index.html?render=1'%server.server_port,wait_until='load')
            page.evaluate('async()=>{await Promise.race([(async()=>{if(window.ready)await window.ready();await document.fonts.ready;})(),new Promise((_,reject)=>setTimeout(()=>reject(Error("Composition readiness timed out after 45 seconds; inspect ready() and local assets")),45000))]);if(typeof window.seek!=="function")throw Error("Missing window.seek(t)")}')
            def seek(t):page.evaluate('async t=>{await window.seek(t)}',t)
            if a.check_seek or a.check_repeat:
                t=min(duration-.001,duration*.37)
                seek(t);first=page.screenshot(type='png')
                state1=page.evaluate('()=>window.getState?window.getState():null')
                seek(duration*.83);seek(0);seek(t);second=page.screenshot(type='png')
                state2=page.evaluate('()=>window.getState?window.getState():null')
                png_equal=hashlib.sha256(first).hexdigest()==hashlib.sha256(second).hexdigest()
                diff=ImageChops.difference(Image.open(io.BytesIO(first)).convert('RGB'),Image.open(io.BytesIO(second)).convert('RGB'))
                channels=diff.split();peak=ImageChops.lighter(ImageChops.lighter(channels[0],channels[1]),channels[2]);hist=peak.histogram()
                total=peak.width*peak.height;different=total-hist[0];maximum=max(v[1] for v in diff.getextrema())
                mean=sum(i*n for channel in channels for i,n in enumerate(channel.histogram()))/(total*3)
                tolerant=bool(a.repeat_max_different_fraction)
                repeat_comparison={'png_sha256_equal':png_equal,'rgb_pixels_equal':different==0,'different_pixels':different,'total_pixels':total,'different_fraction':different/total,'maximum_channel_delta':maximum,'mean_absolute_channel_delta':mean,'tolerance_requested':tolerant,'tolerance_limits':{'different_fraction':a.repeat_max_different_fraction,'maximum_channel_delta':a.repeat_max_channel_delta}}
                if tolerant:
                    checks['seek_repeat_pixels_within_explicit_tolerance']=different/total<=a.repeat_max_different_fraction and maximum<=a.repeat_max_channel_delta
                else:checks['seek_repeat_pixels_equal']=png_equal
                checks['seek_repeat_state_equal']=state1==state2
                if not png_equal:
                    (dest/'seek-first.png').write_bytes(first)
                    (dest/'seek-repeat.png').write_bytes(second)
                if a.check_seek:
                    seek(0);loop0=page.screenshot(type='png');seek(duration);loop1=page.screenshot(type='png')
                    checks['loop_end_pixels_equal']=hashlib.sha256(loop0).hexdigest()==hashlib.sha256(loop1).hexdigest()
            tiles=[];states=[]
            for i,t in enumerate(marks):
                seek(t)
                path=dest/('frame-%02d-%06.2fs.png'%(i+1,t));page.screenshot(path=str(path))
                with Image.open(path) as im:
                    thumb=im.convert('RGB');thumb.thumbnail((310,210))
                    tile=Image.new('RGB',(320,240),'#eeeee9');tile.paste(thumb,((320-thumb.width)//2,25+(210-thumb.height)//2))
                    ImageDraw.Draw(tile).text((8,7),'%.3fs'%t,fill='#111111');tiles.append(tile)
                states.append({'time':t,'state':page.evaluate('()=>window.getState?window.getState():null')})
            sheet=Image.new('RGB',(960,240*math.ceil(len(tiles)/3)),'#eeeee9')
            for i,tile in enumerate(tiles):sheet.paste(tile,((i%3)*320,(i//3)*240))
            sheet.save(dest/'contact-sheet.jpg',quality=92)
            write=lambda name,value:(dest/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
            write('sampled-states.json',states)
            count=math.ceil((end-a.start)*fps-1e-8)
            if not a.stills_only:
                target=dest/('silent.mp4' if a.audio else 'preview.mp4')
                encoder=subprocess.Popen(['ffmpeg','-y','-v','error','-f','image2pipe','-vcodec','png','-framerate',str(fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],stdin=subprocess.PIPE)
                for frame in range(count):
                    t=a.start+frame/fps
                    if a.samples==1:
                        seek(t);data=page.screenshot(type='png')
                    else:
                        combined=None
                        for sample in range(a.samples):
                            sub=max(a.start,min(end-1e-6,t+(sample/(a.samples-1)-.5)*.7/fps))
                            seek(sub);image=Image.open(io.BytesIO(page.screenshot(type='png'))).convert('RGB')
                            combined=image if combined is None else Image.blend(combined,image,1/(sample+1))
                        buffer=io.BytesIO();combined.save(buffer,format='PNG');data=buffer.getvalue()
                    encoder.stdin.write(data)
                    if frame%(fps*2)==0:print('%d/%d frames | %.1fs'%(frame,count,time.time()-started),flush=True)
                encoder.stdin.close()
                if encoder.wait()!=0:raise RuntimeError('FFmpeg encoding failed')
                encoder=None
            browser.close()
        checks['source_files_unchanged_during_render']=all((project/e['path']).is_file() and hashlib.sha256((project/e['path']).read_bytes()).hexdigest()==e['sha256'] for e in source_snapshot)
        if not checks['source_files_unchanged_during_render']:raise RuntimeError('Runtime source assets changed during render; freeze the source and export again')
        if errors or request_errors:raise RuntimeError('Browser/media failures: '+json.dumps({'errors':errors,'requests':request_errors}))
        if a.audio and not a.stills_only:
            subprocess.run(['ffmpeg','-y','-v','error','-i',str(dest/'silent.mp4'),'-ss',str(a.audio_offset),'-i',str(a.audio),'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-ar','48000','-af','loudnorm=I=-16:TP=-1.5:LRA=11,apad','-t',str(count/fps),'-movflags','+faststart',str(dest/'preview.mp4')],check=True)
        report={'project':str(project),'template':config.get('template'),'provenance':config.get('provenance'),'reference_slug':config.get('reference_slug') or str(config.get('reference_url','')).rstrip('/').split('/')[-1],'rendered':not a.stills_only,'dimensions':[width,height],'fps':fps,'interval':[a.start,end],'temporal_samples':a.samples,'checks':checks,'browser_errors':errors,'request_errors':request_errors,'sampled_frames':len(marks),'audio':bool(a.audio),'fidelity_status':'not certified; compare against original reference','human_full_playback':False,'user_approved':False}
        report['audio_source']={'path':str(a.audio.resolve()),'offset_seconds':a.audio_offset,'ownership':'not inferred; preserve source attribution separately'} if a.audio else None
        report['elapsed_seconds']=round(time.time()-started,3)
        report['runtime_source_files']=sorted(source_snapshot,key=lambda e:e['path'])
        if repeat_comparison is not None:report['repeat_comparison']=repeat_comparison
        if not a.stills_only:
            subprocess.run(['ffmpeg','-v','error','-i',str(dest/'preview.mp4'),'-f','null','-'],check=True)
            metadata=json.loads(subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(dest/'preview.mp4')],check=True,capture_output=True,text=True).stdout)
            report.update({'frames':count,'full_decode':'passed','encoded_metadata':metadata})
        write('verification.json',report);print(json.dumps(report,ensure_ascii=False))
        if (a.check_seek or a.check_repeat) and not all(checks.values()):raise SystemExit('Seek verification failed; inspect verification.json')
    finally:
        if encoder is not None:
            if encoder.stdin and not encoder.stdin.closed:encoder.stdin.close()
            encoder.wait()
        server.shutdown();server.server_close()

if __name__=='__main__':main()
