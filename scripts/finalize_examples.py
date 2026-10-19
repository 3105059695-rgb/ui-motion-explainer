"""Copy the successful 72-second render and export eight standalone demonstration clips."""
import argparse
import json
from pathlib import Path
import shutil
import subprocess

ROOT=Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--render-dir',required=True,type=Path)
    a=p.parse_args()
    report=json.loads((a.render_dir/'verification.json').read_text(encoding='utf-8'))
    if not report.get('rendered') or report.get('fullDecode')!='passed':p.error('Successful full render required')
    dest=ROOT/'assets/fusion-studio/previews'
    if (dest/'preview.mp4').exists():p.error('Preview already exists; use a fresh build')
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:p.error('FFmpeg is required to split examples')
    dest.mkdir(parents=True,exist_ok=True)
    shutil.copy2(a.render_dir/'preview.mp4',dest/'preview.mp4')
    shutil.copy2(a.render_dir/'verification.json',dest/'render-verification.json')
    clips=[]
    for i in range(8):
        clip=dest/f'F{i+1:02}.mp4'
        if clip.exists():p.error('Clip already exists: '+str(clip))
        subprocess.run([ffmpeg,'-v','error','-ss',str(i*9),'-i',str(dest/'preview.mp4'),'-t','9',
                        '-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p',
                        '-movflags','+faststart',str(clip)],check=True)
        subprocess.run([ffmpeg,'-v','error','-i',str(clip),'-f','null','-'],check=True)
        clips.append({'id':f'F{i+1:02}','duration':9,'fullDecode':'passed','bytes':clip.stat().st_size})
    (dest/'clip-verification.json').write_text(json.dumps({'clips':clips,'audio':False,'userApproved':False},ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'fullPreview':str(dest/'preview.mp4'),'clips':clips},ensure_ascii=False))

if __name__=='__main__':main()
