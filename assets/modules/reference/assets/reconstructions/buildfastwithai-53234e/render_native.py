"""Export the MIT author SUTRA Python film; no reference movie is used.

Install requirements.txt in your Python environment. FFmpeg/ffprobe must be on
PATH. Editing film.py changes the artwork; editing audio.py changes music and
its measured visual envelope. Use --regenerate-audio after changing audio.py.
"""
import argparse, hashlib, importlib.util, io, json, math, os, shutil, subprocess, sys, time
from pathlib import Path

PROJECT=Path(__file__).resolve().parent
if hasattr(sys.stdout,'reconfigure'):sys.stdout.reconfigure(encoding='utf-8')

def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def write(path,data):path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out',type=Path,required=True)
    parser.add_argument('--width',type=int,default=1280)
    parser.add_argument('--fps',type=int,default=30)
    parser.add_argument('--audio',type=Path)
    parser.add_argument('--stills-only',action='store_true')
    parser.add_argument('--regenerate-audio',action='store_true')
    a=parser.parse_args();dest=a.out.resolve();width=a.width;height=2*round(width*1080/1920/2)
    if width<128 or width%2 or not 1<=a.fps<=120:parser.error('Even width >=128; fps 1..120')
    if dest==PROJECT or dest==PROJECT.parent:parser.error('Use a dedicated output directory')
    if dest.exists() and any(dest.iterdir()):parser.error('Use a new or empty output directory')
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):parser.error('FFmpeg and ffprobe must be on PATH')
    os.chdir(PROJECT);config=json.loads((PROJECT/'project.json').read_text(encoding='utf-8'))
    import numpy as np
    import cairo
    from PIL import Image,ImageDraw,features
    if not features.check('raqm'):raise RuntimeError('Pillow must include RAQM for the original Indic text shaping')
    if a.regenerate_audio or not all((PROJECT/name).is_file() for name in ('music.wav','env.npy','wave.npy')):
        subprocess.run([sys.executable,str(PROJECT/'audio.py')],cwd=PROJECT,check=True)
    audio=a.audio.resolve() if a.audio else PROJECT/'music.wav'
    if not audio.is_file():raise FileNotFoundError(audio)
    spec=importlib.util.spec_from_file_location('sutra_film',PROJECT/'film.py');film=importlib.util.module_from_spec(spec);spec.loader.exec_module(film)
    duration=float(config['duration']);dest.mkdir(parents=True,exist_ok=True);started=time.monotonic()
    runtime=[PROJECT/name for name in ('film.py','audio.py','render_native.py','index.html','project.json','requirements.txt','env.npy','wave.npy','music.wav')]+sorted((PROJECT/'fonts').glob('*'))
    snapshot=[{'path':p.relative_to(PROJECT).as_posix(),'bytes':p.stat().st_size,'sha256':sha(p)} for p in runtime if p.is_file()]
    def frame(t):
        f=min(film.NF-1,max(0,round(t*film.FPS)+int(config.get('source_frame_offset',0))))
        surf=cairo.ImageSurface(cairo.FORMAT_ARGB32,film.W,film.H);film.render(f,surf);surf.flush()
        im=Image.frombuffer('RGBA',(film.W,film.H),bytes(surf.get_data()),'raw','BGRA',surf.get_stride(),1).convert('RGB')
        if (width,height)!=(film.W,film.H):im=im.resize((width,height),Image.Resampling.LANCZOS)
        chapter=max(i for i,(beat,fn) in enumerate(film.SCENES) if f/film.FPS/film.BEAT>=beat)
        return im,{'frame':f,'time':round(f/film.FPS,6),'beat':round(f/film.FPS/film.BEAT,6),'chapter':chapter,'renderer':'author Cairo/Pillow/RAQM'}
    def png(im):
        buf=io.BytesIO();im.save(buf,format='PNG');return buf.getvalue()
    t=duration*.37;first,state1=frame(t);first_png=png(first);frame(duration*.83);frame(0);second,state2=frame(t);second_png=png(second)
    repeat={'png_sha256_equal':hashlib.sha256(first_png).digest()==hashlib.sha256(second_png).digest(),'rgb_pixels_equal':first.tobytes()==second.tobytes(),'state_equal':state1==state2,'tolerance_requested':False}
    checks={'seek_repeat_pixels_equal':repeat['png_sha256_equal'] and repeat['rgb_pixels_equal'],'seek_repeat_state_equal':repeat['state_equal']}
    if not all(checks.values()):raise RuntimeError('Stateless original render failed repeat check')
    marks=config.get('marks',[1,10,20,30,40,50,60,70,80,86]);states=[];tiles=[]
    for i,t in enumerate(marks):
        im,state=frame(float(t));im.save(dest/('frame-%02d-%06.2fs.png'%(i+1,t)));states.append({'time':t,'state':state})
        thumb=im.copy();thumb.thumbnail((310,210));tile=Image.new('RGB',(320,240),'#eeeee9');tile.paste(thumb,((320-thumb.width)//2,25+(210-thumb.height)//2));ImageDraw.Draw(tile).text((8,7),'%.3fs'%t,fill='#111');tiles.append(tile)
    sheet=Image.new('RGB',(960,240*math.ceil(len(tiles)/3)),'#eeeee9')
    for i,tile in enumerate(tiles):sheet.paste(tile,((i%3)*320,(i//3)*240))
    sheet.save(dest/'contact-sheet.jpg',quality=92);write(dest/'sampled-states.json',states)
    proof={'project':str(PROJECT),'template':'MIT-author-source-SUTRA','provenance':'Full MIT author film.py/audio.py; independent exporter only','reference_slug':config['reference_slug'],'renderer':'python-native','rendered':False,'dimensions':[width,height],'fps':a.fps,'interval':[0,duration],'checks':checks,'repeat_comparison':repeat,'runtime_source_files':snapshot,'browser_errors':[],'request_errors':[],'browser_checks':'not run: artwork is generated offline using Cairo, not a browser renderer','audio':True,'own_audio':{'file':'music.wav','source':'MIT author audio.py re-synthesized locally','reference_movie_used':False},'sampled_frames':len(marks),'fidelity_status':'compare against reference; exact source does not guarantee identical fonts/raster/codec','human_full_playback':False,'user_approved':False}
    encoder=None
    try:
        if not a.stills_only:
            movie=dest/'preview.mp4';n=math.ceil(duration*a.fps)
            cmd=['ffmpeg','-hide_banner','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{width}x{height}','-r',str(a.fps),'-i','-','-i',str(audio),'-map','0:v:0','-map','1:a:0','-t',str(duration),'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-threads','2','-c:a','aac','-b:a','192k','-ar','48000','-movflags','+faststart',str(movie)]
            encoder=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
            for i in range(n):
                im,_=frame(i/a.fps);encoder.stdin.write(im.tobytes())
                if i%90==0:print(f'{i}/{n} frames | {time.monotonic()-started:.1f}s',flush=True)
            encoder.stdin.close();err=encoder.stderr.read().decode('utf-8','replace');code=encoder.wait()
            if code:raise RuntimeError('FFmpeg failed: '+err)
            encoder=None
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(movie),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
            probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)],encoding='utf-8'))
            proof.update(rendered=True,full_decode='passed',encoded_frames=n,output={'file':str(movie),'bytes':movie.stat().st_size,'sha256':sha(movie),'probe':probe})
        checks['source_files_unchanged_during_render']=all((PROJECT/e['path']).is_file() and sha(PROJECT/e['path'])==e['sha256'] for e in snapshot)
        if not checks['source_files_unchanged_during_render']:raise RuntimeError('Runtime sources changed while exporting')
        proof['elapsed_seconds']=round(time.monotonic()-started,3);write(dest/'verification.json',proof)
        print(json.dumps({k:proof.get(k) for k in ('rendered','full_decode','encoded_frames','elapsed_seconds','checks')},ensure_ascii=False,indent=2))
    finally:
        if encoder and encoder.poll() is None:encoder.terminate();encoder.wait()

if __name__=='__main__':main()
