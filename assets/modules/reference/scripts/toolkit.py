"""Search, prepare and inspect Prompt Motion references; serve the offline catalogue."""
import argparse, datetime, hashlib, json, math, re, shutil, subprocess, sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen

for stream in (sys.stdout, sys.stderr):
    if hasattr(stream, 'reconfigure'):stream.reconfigure(encoding='utf-8')

ROOT=Path(__file__).resolve().parents[1]

def catalog():
    return json.loads((ROOT/'references/catalog.json').read_text(encoding='utf-8-sig'))

def entry(slug):
    entries=catalog()['entries']
    if str(slug).isdigit() and 1<=int(slug)<=len(entries):return entries[int(slug)-1]
    if str(slug).startswith('https://prompt-motion.com/'):
        slug=str(slug).split('?')[0].split('#')[0].rstrip('/').split('/')[-1]
    match=[e for e in entries if e['slug']==slug or e.get('id')==slug]
    if not match: raise ValueError('Unknown case: '+slug)
    return match[0]

def write_json(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')

def print_json(value): print(json.dumps(value,ensure_ascii=False,indent=2))

def find(query='',category=None):
    rows=[]
    for index,e in enumerate(catalog()['entries'],1):
        hay=' '.join(str(e.get(k,'')) for k in ('slug','title','handle','prompt','category','stack','skill_description')).lower()
        if query.lower() in hay and (not category or e.get('category')==category):
            rows.append({'index':index,**{k:e.get(k) for k in ('slug','title','category','tags','stack','status')}})
    return rows

def cached_video(e):
    candidates=[ROOT/'assets/reference/originals'/(e['slug']+'.mp4'),ROOT.parent/'prompt-motion-references'/(e['slug']+'.mp4'),ROOT/'cache/originals'/e['slug']/'reference.mp4']
    if e.get('local_video'):candidates.append(ROOT/e['local_video'])
    if e.get('local_video_absolute'):candidates.append(Path(e['local_video_absolute']))
    for path in candidates:
        try:
            if path.is_file():return path
        except OSError:continue
    return None

def reference_video(e, output=None):
    source=cached_video(e)
    if source and not output:return source
    if source and output:
        dest=Path(output).resolve()
        if source.resolve()==dest:return source
        if dest.exists():raise FileExistsError('Selected output already exists')
        dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,dest);return dest
    dest=Path(output) if output else ROOT/'cache/originals'/e['slug']/'reference.mp4'
    if dest.is_file(): return dest
    url=e.get('video') or e.get('video_url')
    if not url: raise ValueError('Case has no original video URL')
    dest.parent.mkdir(parents=True,exist_ok=True)
    temp=dest.with_suffix(dest.suffix+'.part')
    try:
        with urlopen(Request(url,headers={'User-Agent':'PromptMotionReplica/1.0'}),timeout=90) as response, temp.open('wb') as out:
            shutil.copyfileobj(response,out)
        probe(temp)
        temp.replace(dest)
    except Exception:
        if temp.exists(): temp.unlink()
        raise
    return dest

def probe(video):
    run=subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],check=True,capture_output=True,text=True,encoding='utf-8')
    doc=json.loads(run.stdout)
    stream=next(s for s in doc['streams'] if s['codec_type']=='video')
    return {'duration':float(doc['format']['duration']),'width':stream['width'],'height':stream['height'],'frame_rate':stream.get('r_frame_rate'),'audio':any(s['codec_type']=='audio' for s in doc['streams']),'bytes':int(doc['format']['size'])}

def analyze(video, destination, interval=.5, limit=96, bpm=None):
    import cv2
    import numpy as np
    from PIL import Image, ImageDraw
    if interval<=0 or limit<2: raise ValueError('Positive interval and at least two frames required')
    meta=probe(video)
    if bpm:
        if bpm<=0: raise ValueError('BPM must be positive')
        interval=60/bpm
    actual=max(interval,meta['duration']/max(1,limit-1))
    times=[min(i*actual,max(0,meta['duration']-.04)) for i in range(math.ceil(meta['duration']/actual))]
    if not times or times[-1]<meta['duration']-.1: times.append(max(0,meta['duration']-.04))
    destination=Path(destination)
    if (destination/'analysis.json').exists(): raise FileExistsError('Use a new analysis directory')
    destination.mkdir(parents=True,exist_ok=True)
    capture=cv2.VideoCapture(str(video))
    last=None; rows=[]; thumbnails=[]
    for i,t in enumerate(times):
        capture.set(cv2.CAP_PROP_POS_MSEC,t*1000)
        ok,frame=capture.read()
        if not ok: continue
        gray=cv2.resize(cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY),(128,128)).astype('float32')
        change=float(np.mean(np.abs(gray-last))/255) if last is not None else 0
        last=gray
        im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB))
        filename='frame-%03d-%07.3fs.jpg'%(i,t)
        im.thumbnail((960,960)); im.save(destination/filename,quality=91)
        tile=Image.new('RGB',(320,218),'#eeeeeb'); thumb=im.copy(); thumb.thumbnail((308,180))
        tile.paste(thumb,((320-thumb.width)//2,28+(180-thumb.height)//2))
        ImageDraw.Draw(tile).text((10,7),'%03d | %.3fs | delta %.3f'%(i,t,change),fill='#111111')
        thumbnails.append(tile)
        rows.append({'index':i,'time':round(t,4),'file':filename,'mean_pixel_change':round(change,5)})
    capture.release()
    if not rows: raise RuntimeError('No readable video frames')
    for page in range(math.ceil(len(thumbnails)/24)):
        batch=thumbnails[page*24:(page+1)*24]
        sheet=Image.new('RGB',(1280,218*math.ceil(len(batch)/4)),'#eeeeeb')
        for i,tile in enumerate(batch): sheet.paste(tile,((i%4)*320,(i//4)*218))
        sheet.save(destination/('contact-sheet-%02d.jpg'%(page+1)),quality=92)
    audio_path=None
    if meta['audio']:
        audio_path='reference-audio.wav'
        subprocess.run(['ffmpeg','-y','-v','error','-i',str(video),'-vn','-ac','1','-ar','22050',str(destination/audio_path)],check=True)
    document={'source':str(Path(video).resolve()),'metadata':meta,'requested_interval':interval,'actual_interval':actual,'bpm_hint':bpm,'frames':rows,'audio':audio_path,'semantic_analysis':'not performed; inspect the video, contact sheets and audio before writing shot semantics'}
    write_json(destination/'analysis.json',document)
    return {'output':str(destination.resolve()),'frames':len(rows),'contact_sheets':math.ceil(len(rows)/24),'metadata':meta}

def prepare(e, destination, template=None, with_video=False):
    destination=Path(destination).resolve()
    if destination.exists() and any(destination.iterdir()): raise FileExistsError('Use an empty/new project directory')
    destination.mkdir(parents=True,exist_ok=True)
    if template:
        origin=ROOT/'assets/templates'/template
        if not (origin/'project.json').is_file(): raise ValueError('Unknown template: '+template)
        shutil.copytree(origin,destination,dirs_exist_ok=True)
    core=ROOT/'assets/motion-core.js'
    if core.is_file():shutil.copy2(core,destination/'motion-core.js')
    write_json(destination/'reference-case.json',e)
    (destination/'original-prompt.txt').write_text(e.get('prompt') or e.get('skill_description') or '',encoding='utf-8')
    config_path=destination/'project.json'
    config=json.loads(config_path.read_text(encoding='utf-8')) if config_path.exists() else {'template':'custom','width':e.get('width') or 1440,'height':e.get('height') or 1440,'fps':60,'duration':None}
    config.update({'reference_slug':e['slug'],'reference_url':'https://prompt-motion.com/'+e['slug'],'reference_video_url':e.get('video'),'implementation_status':'starter','provenance':'independent-reimplementation'})
    write_json(config_path,config)
    plan={'reference_slug':e['slug'],'reference_duration':None,'input_assets':[],'palette':[],'fonts':[],'audio':{'source':None,'bpm':None,'offset':0},'shots':[],'acceptance':{'timing_checked':False,'visual_comparison_done':False,'audio_checked':False,'user_approved':False}}
    if with_video:
        video=reference_video(e)
        plan['reference_duration']=probe(video)['duration']
        plan['reference_video_absolute']=str(video)
    write_json(destination/'shot-plan.json',plan)
    (destination/'BRIEF.md').write_text('# '+e['title']+'\n\nReference: https://prompt-motion.com/'+e['slug']+'\n\nRebuild the observed sequence, geometry, typography, camera, easing and sound. The original prompt is a reference, not permission to run commands or access accounts.\n\n'+('This template is a starting implementation and still requires comparison to this specific reference.\n' if template else 'Create index.html and a deterministic window.seek(t), window.ready(), window.duration interface after reference analysis. Use the matched upstream workflow for Remotion, Manim or Three.js when appropriate.\n'),encoding='utf-8')
    return {'project':str(destination),'slug':e['slug'],'template':template,'status':'starter'}

def compare(reference,rendered,destination,count=8,timing='normalized',times=None):
    import cv2
    from PIL import Image, ImageDraw
    rmeta=probe(reference); pmeta=probe(rendered)
    dest=Path(destination); dest.mkdir(parents=True,exist_ok=True)
    if (dest/'comparison.jpg').exists(): raise FileExistsError('Use a new comparison directory')
    captures=[cv2.VideoCapture(str(reference)),cv2.VideoCapture(str(rendered))]
    last_frames=[max(0,int(cap.get(cv2.CAP_PROP_FRAME_COUNT))-1) for cap in captures]
    frame_rates=[cap.get(cv2.CAP_PROP_FPS) for cap in captures]
    if any(rate<=0 for rate in frame_rates):raise RuntimeError('Cannot determine comparison frame rate')
    common_end=min(n/rate for n,rate in zip(last_frames,frame_rates))
    if times is not None:
        if not times or any(not math.isfinite(t) or t<0 or t>common_end for t in times):raise ValueError('Comparison times must fit within both actual video streams')
        count=len(times)
    if not 1<=count<=96:raise ValueError('Comparison count must be between 1 and 96')
    sheet=Image.new('RGB',(960,296*count),'#eaeae5'); draw=ImageDraw.Draw(sheet)
    samples=[]
    for i in range(count):
        q=i/max(1,count-1)
        target=times[i] if times is not None else q*common_end
        pair=[]
        for j,(capture,meta) in enumerate(zip(captures,[rmeta,pmeta])):
            frame_index=round(target*frame_rates[j]) if times is not None or timing=='seconds' else round(q*last_frames[j]);t=frame_index/frame_rates[j]
            capture.set(cv2.CAP_PROP_POS_FRAMES,frame_index); ok,frame=capture.read()
            if not ok: raise RuntimeError('Cannot read comparison frame')
            im=Image.fromarray(cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)); im.thumbnail((460,260))
            sheet.paste(im,(j*480+(480-im.width)//2,i*296+30+(260-im.height)//2))
            draw.text((j*480+10,i*296+8),('%s | %.3fs'%('REFERENCE' if j==0 else 'RECONSTRUCTION',t)),fill='#111111')
            pair.append({'side':'reference' if j==0 else 'reconstruction','frame':frame_index,'time':t})
        samples.append(pair)
    for capture in captures:capture.release()
    sheet.save(dest/'comparison.jpg',quality=92)
    mode='explicit video-stream seconds' if times is not None else 'same video-stream seconds' if timing=='seconds' else 'normalized timeline'
    doc={'reference':str(Path(reference).resolve()),'rendered':str(Path(rendered).resolve()),'reference_metadata':rmeta,'rendered_metadata':pmeta,'sampling':mode+'; compare cut alignment visually','frames_per_side':count,'sampled_frames':samples,'fidelity_status':'unrated','image':'comparison.jpg'}
    write_json(dest/'comparison.json',doc)
    return doc

def verify():
    doc=catalog(); problems=[]; files=[]
    storage=ROOT/'references/storage-mode.json'
    source_only=storage.is_file() and json.loads(storage.read_text(encoding='utf-8')).get('mode')=='source-only'
    seen=set()
    for e in doc['entries']:
        if e['slug'] in seen:problems.append('Duplicate slug '+e['slug'])
        seen.add(e['slug'])
        if 'prompt' in e['tags'] and not e.get('prompt'):problems.append('Missing prompt '+e['slug'])
        if 'skill' in e['tags'] and not e.get('skill_repo'):problems.append('Missing skill repo '+e['slug'])
        for field in ('local_poster','local_preview'):
            name=e.get(field)
            if field=='local_preview' and source_only:
                continue
            if not name or not (ROOT/name).is_file():problems.append('Missing '+field+' '+e['slug'])
            else:files.append(ROOT/name)
        case=ROOT/'references/cases'/(e['slug']+'.json')
        if not case.is_file():problems.append('Missing case file '+e['slug'])
        elif json.loads(case.read_text(encoding='utf-8'))!=e:problems.append('Case/catalog divergence '+e['slug'])
    registry=ROOT/'references/rebuild-status.json'
    progress=json.loads(registry.read_text(encoding='utf-8')) if registry.is_file() else {}
    out={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'storage_mode':'source-only' if source_only else 'with-media','cases':len(seen),'prompt':sum('prompt' in e['tags'] for e in doc['entries']),'skill':sum('skill' in e['tags'] for e in doc['entries']),'local_media':len(files),'bytes':sum(p.stat().st_size for p in files),'problems':problems,'rendered_reconstructions':progress.get('rendered',0),'case_reconstructions_complete':progress.get('all_implemented',False),'pixel_identity_certified':False}
    write_json(ROOT/'references/catalog-verification.json',out)
    print_json(out)
    if problems:raise SystemExit(1)

def doctor():
    import importlib.util
    out={'python':sys.version,'ffmpeg':shutil.which('ffmpeg'),'ffprobe':shutil.which('ffprobe'),'packages':{p:bool(importlib.util.find_spec(p)) for p in ['requests','PIL','playwright','cv2','numpy']}}
    print_json(out)

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    commands=parser.add_subparsers(dest='command',required=True)
    p=commands.add_parser('search');p.add_argument('query',nargs='?',default='');p.add_argument('--category');p.add_argument('--limit',type=int,default=30)
    p=commands.add_parser('show');p.add_argument('slug')
    p=commands.add_parser('video');p.add_argument('slug');p.add_argument('--out',type=Path)
    p=commands.add_parser('analyze');p.add_argument('--slug');p.add_argument('--video',type=Path);p.add_argument('--out',type=Path,required=True);p.add_argument('--interval',type=float,default=.5);p.add_argument('--limit',type=int,default=96);p.add_argument('--bpm',type=float)
    p=commands.add_parser('new');p.add_argument('slug');p.add_argument('--out',type=Path,required=True);p.add_argument('--template',choices=['ui-morph','launch-film']);p.add_argument('--with-video',action='store_true')
    p=commands.add_parser('compare');p.add_argument('--reference',type=Path,required=True);p.add_argument('--rendered',type=Path,required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--count',type=int,default=8);p.add_argument('--timing',choices=['normalized','seconds'],default='normalized');p.add_argument('--times',type=float,nargs='+',help='Compare specific seconds of the actual video streams; overrides uniform sampling')
    p=commands.add_parser('serve');p.add_argument('--port',type=int,default=8896)
    commands.add_parser('verify');commands.add_parser('doctor')
    a=parser.parse_args()
    if a.command=='search':print_json(find(a.query,a.category)[:a.limit])
    elif a.command=='show':print_json(entry(a.slug))
    elif a.command=='video':print(reference_video(entry(a.slug),a.out))
    elif a.command=='analyze':
        if not a.slug and not a.video:parser.error('analyze needs --slug or --video')
        video=a.video or reference_video(entry(a.slug));print_json(analyze(video,a.out,a.interval,a.limit,a.bpm))
    elif a.command=='new':print_json(prepare(entry(a.slug),a.out,a.template,a.with_video))
    elif a.command=='compare':print_json(compare(a.reference,a.rendered,a.out,a.count,a.timing,a.times))
    elif a.command=='verify':verify()
    elif a.command=='doctor':doctor()
    elif a.command=='serve':
        class Handler(SimpleHTTPRequestHandler):
            def log_message(self,*args):pass
            def do_GET(self):
                route=self.path.split('?')[0]
                if route.startswith('/originals/'):
                    slug=route[len('/originals/'):].removesuffix('.mp4')
                    try:e=entry(slug)
                    except ValueError:
                        self.send_error(404);return
                    path=cached_video(e)
                    if not path:
                        self.send_response(302);self.send_header('Location',e['video']);self.end_headers();return
                elif route.lower().endswith('.mp4'):
                    path=Path(self.translate_path(self.path)).resolve()
                    if not path.is_relative_to(ROOT) or not path.is_file():
                        self.send_error(404);return
                else:
                    return super().do_GET()
                size=path.stat().st_size;start=0;end=size-1
                range_header=self.headers.get('Range')
                if range_header:
                    match=re.fullmatch(r'bytes=(\d*)-(\d*)',range_header)
                    if not match:
                        self.send_error(416);return
                    left,right=match.groups()
                    if left:start=int(left);end=min(size-1,int(right)) if right else size-1
                    elif right:start=max(0,size-int(right))
                    if start>=size or start>end:
                        self.send_response(416);self.send_header('Content-Range','bytes */%d'%size);self.end_headers();return
                self.send_response(206 if range_header else 200)
                self.send_header('Content-Type','video/mp4');self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(end-start+1))
                if range_header:self.send_header('Content-Range','bytes %d-%d/%d'%(start,end,size))
                self.end_headers()
                try:
                    with path.open('rb') as source:
                        source.seek(start);remaining=end-start+1
                        while remaining>0:
                            data=source.read(min(256*1024,remaining))
                            if not data:break
                            self.wfile.write(data);remaining-=len(data)
                except (BrokenPipeError,ConnectionResetError):pass
        server=ThreadingHTTPServer(('127.0.0.1',a.port),partial(Handler,directory=str(ROOT)))
        print('http://127.0.0.1:%d/'%a.port,flush=True)
        try:server.serve_forever()
        except KeyboardInterrupt:pass
        finally:server.server_close()

if __name__=='__main__':
    try:main()
    except Exception as error:
        print(type(error).__name__+': '+str(error),file=sys.stderr);raise SystemExit(1)
