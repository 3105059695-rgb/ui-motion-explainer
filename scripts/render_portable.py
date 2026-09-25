#!/usr/bin/env python3
"""Render a portable UI project to H.264 with Chromium and CPU FFmpeg.

Run with the private Python created by bootstrap.py. No system browser or GPU is
required. The frame time of source media is fixed across motion-blur samples.
"""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import io
import json
import math
from pathlib import Path
import shutil
import subprocess
import threading
import time

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_): pass

def ffmpeg_path():
    found = shutil.which('ffmpeg')
    if found: return found
    import imageio_ffmpeg
    return imageio_ffmpeg.get_ffmpeg_exe()

def write_subtitles(captions, start, end, path):
    def stamp(t):
        ms=round(t*1000)
        return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
    rows=[]
    for c in captions:
        left=max(start,float(c['start']));right=min(end,float(c['end']))
        if right>left:
            rows.append(f"{len(rows)+1}\n{stamp(left-start)} --> {stamp(right-start)}\n{c['text']}\n")
    path.write_text('\n'.join(rows),encoding='utf-8')

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--project', required=True, type=Path)
    p.add_argument('--out', type=Path)
    p.add_argument('--width', type=int, default=1920)
    p.add_argument('--fps', type=int)
    p.add_argument('--start', type=float, default=0)
    p.add_argument('--end', type=float)
    p.add_argument('--stills-only', action='store_true')
    p.add_argument('--no-motion-blur', action='store_true')
    p.add_argument('--overwrite', action='store_true')
    a = p.parse_args()
    from PIL import Image, ImageDraw
    from playwright.sync_api import sync_playwright
    root = a.project.resolve()
    config = json.loads((root/'project.json').read_text(encoding='utf-8-sig'))
    end = a.end if a.end is not None else float(config['duration'])
    if not 0 <= a.start < end <= float(config['duration']): p.error('Invalid render interval')
    if a.width < 320 or a.width % 32: p.error('Width must be a multiple of 32, at least 320')
    height = a.width*9//16
    fps = a.fps or int(config.get('fps',50))
    if not 1 <= fps <= 60: p.error('FPS must be in 1..60')
    dest = (a.out or root/'renders').resolve()
    if dest == root: p.error('Output must be a separate directory')
    if (dest/'preview.mp4').exists() and not a.overwrite: p.error('Output exists; use a new folder or --overwrite')
    dest.mkdir(parents=True,exist_ok=True)
    ffmpeg = ffmpeg_path()
    server = ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(root)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/index.html?render=1'
    errors=[]
    marks=[a.start+(end-a.start)*q for q in (.04,.2,.39,.54,.68,.86)]
    encoder=None
    duration=end-a.start
    count=math.ceil(duration*fps-1e-8)
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True,args=['--autoplay-policy=no-user-gesture-required'])
            tab=browser.new_page(viewport={'width':a.width,'height':height},device_scale_factor=1)
            tab.on('pageerror',lambda e:errors.append(str(e)))
            tab.goto(url,wait_until='load')
            tab.evaluate('window.ready()')
            for i,t in enumerate(marks):
                tab.evaluate('t=>window.render(t,t)',t)
                tab.screenshot(path=str(dest/f'frame-{i+1}.jpg'),type='jpeg',quality=94)
            sheet=Image.new('RGB',(960,588),'#f5f2f8')
            draw=ImageDraw.Draw(sheet)
            for i,t in enumerate(marks):
                with Image.open(dest/f'frame-{i+1}.jpg') as im:sheet.paste(im.resize((320,180)),(i%3*320,i//3*294+30))
                draw.text((i%3*320+10,i//3*294+8),f'{t:.2f}s',fill='#4f2b78')
            sheet.save(dest/'contact-sheet.jpg',quality=92)
            if not a.stills_only:
                encoder=subprocess.Popen([ffmpeg,'-y','-v','error','-f','image2pipe','-vcodec','mjpeg','-framerate',str(fps),'-i','pipe:0',
                    '-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',str(dest/'silent.mp4')],stdin=subprocess.PIPE)
                started=time.time()
                for f in range(count):
                    t=a.start+f/fps
                    active=not a.no_motion_blur and tab.evaluate('t=>window.motionActive(t)',t)
                    times=[max(a.start,t-.3/fps),t,min(end-1e-5,t+.3/fps)] if active else [t]
                    combined=None
                    for j,sub in enumerate(times):
                        tab.evaluate('([t,m])=>window.render(t,m)',[sub,t])
                        frame=Image.open(io.BytesIO(tab.screenshot(type='png'))).convert('RGB')
                        combined=frame if combined is None else Image.blend(combined,frame,1/(j+1))
                    stream=io.BytesIO();combined.save(stream,format='JPEG',quality=97,subsampling=0)
                    encoder.stdin.write(stream.getvalue())
                    if f%fps==0:print(f'{f}/{count} frames, {time.time()-started:.1f}s',flush=True)
                encoder.stdin.close()
                if encoder.wait()!=0:raise RuntimeError('FFmpeg frame encoding failed')
                encoder=None
            browser.close()
        if errors:raise RuntimeError('Browser errors: '+'; '.join(errors))
    finally:
        if encoder is not None:
            if encoder.stdin:encoder.stdin.close()
            encoder.wait()
        server.shutdown();server.server_close()
    write_subtitles(config.get('captions',[]),a.start,end,dest/'captions.srt')
    report={'mode':config['mode'],'resolution':[a.width,height],'fps':fps,'range':[a.start,end],
            'motionBlur':'three temporal samples during fast motion; source media/captions fixed' if not a.no_motion_blur else 'off',
            'browserErrors':errors,'rendered':not a.stills_only,'humanVisualReview':False}
    if not a.stills_only:
        audio=config.get('audio') or config.get('presenter')
        has_audio=False
        if audio:
            audio=root/audio
            if not audio.is_file():raise FileNotFoundError(audio)
            probe=subprocess.run([ffmpeg,'-hide_banner','-i',str(audio)],capture_output=True,text=True,encoding='utf-8',errors='replace')
            has_audio='Audio:' in probe.stderr
            if config.get('audio') and not has_audio:raise ValueError('Configured audio has no audio stream')
        if has_audio:
            audio_start=a.start+(float(config.get('sourceOffset',0)) if not config.get('audio') else 0)
            subprocess.run([ffmpeg,'-y','-v','error','-i',str(dest/'silent.mp4'),'-ss',str(audio_start),'-i',str(audio),
                '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-af','apad',
                '-t',str(duration),'-movflags','+faststart',str(dest/'preview.mp4')],check=True)
        else:shutil.copy2(dest/'silent.mp4',dest/'preview.mp4')
        subprocess.run([ffmpeg,'-v','error','-i',str(dest/'preview.mp4'),'-f','null','-'],check=True)
        subprocess.run([ffmpeg,'-y','-v','error','-ss',str(duration*.54),'-i',str(dest/'preview.mp4'),'-frames:v','1',str(dest/'encoded-frame.jpg')],check=True)
        report.update({'frames':count,'audio':bool(has_audio),'fullDecode':'passed','encodedFrame':'encoded-frame.jpg'})
    (dest/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))

if __name__ == '__main__':
    main()
