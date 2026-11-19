"""Render two short sections on the release timeline and keep their visual review separate."""
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile

from edit_session import plan_lock, write_atomic
import reference_edits as edits
import shot_direction as art


RECEIPT = 'editorial-proofs.json'


def edit_signature(project, timeline):
    if (project/'episode.js').read_text(encoding='utf-8') != edits.episode_data(timeline):
        raise ValueError('The player and the master timeline differ.')
    paths = ('reference-timeline.json','index.html','player.js','episode.js','shot-motion.js',
             'motion-core.js','agent-editorial.js','Noto.woff2','library-project.json')
    return hashlib.sha256(''.join(edits.digest(project/p) for p in paths).encode()).hexdigest()


def check(project, timeline, reviewed=True):
    path = project/RECEIPT
    if not path.is_file():
        raise ValueError('Render the short opening and transition first with videos proofs.')
    record = edits.read(path)
    if record['signature'] != edit_signature(project,timeline):
        raise ValueError('The cut changed. Refresh the two affected proof ranges before bulk rendering.')
    clips=record.get('clips',[])
    ranges=record.get('ranges',[])
    if len(clips)!=2 or len(ranges)!=2:
        raise ValueError('Both the actual opening and transition proof files are required.')
    for clip,name,interval in zip(clips,('opening','transition'),ranges):
        path=(project/clip['file']).resolve()
        if (not path.is_relative_to((project/'editorial-proofs').resolve()) or path.name!=name+'.mp4'
                or clip['master_frames']!=interval or edits.digest(path) != clip['sha256']):
            raise ValueError('The review clip differs from its receipt.')
    if reviewed:
        scope=(record.get('inspection') or {}).get('scope')
        expected=('normal-sound',) if timeline.get('narration') else ('normal-picture','normal-sound')
        if scope not in expected:
            raise ValueError('Play both proofs at normal speed (with the original sound when present). Then save the actual inspection with videos proofs --observed and --note.')
    return record


def review_clip(project, timeline, clip, first, last):
    fps = timeline['fps']
    def url(path):
        return art.file_url(path,clip.parent)
    rows = []
    for row in art.comparison_rows(timeline,project,edits.ROOT,url):
        a,b = max(row['start'],first/fps),min(row['end'],last/fps)
        if a>=b:
            continue
        if row.get('type')=='cutaway':
            span=[row['reference']['range'][0]+a-row['start'], row['reference']['range'][0]+b-row['start']]
            row['reference']['range']=span
            row['borrow']['seconds']=span
        rows.append({**row,'episode_range':[a,b],'start':a-first/fps,'end':b-first/fps})
    if not rows and timeline.get('base_video'):
        rows.append({'title':'口播底片','start':0,'end':(last-first)/fps,'episode_range':[first/fps,last/fps],
                     'quote':'','action':'对照同一段口播的构图和剪点。','watch':'','steps':[],
                     'reference':{'kind':'video','label':'本期口播底片','range':[first/fps,last/fps],
                                  'url':url(project/timeline['base_video'])}})
    if not rows:
        return
    clip.with_suffix('.html').write_text(art.review_html(edits.ROOT,rows,url(clip),url),encoding='utf-8')


def run(project, opening=None, bridge=None, scale=1, captions=None, alternative=None, observed=None, note=None):
    import library_html_runner
    from caption_edit import parse_srt
    project = Path(project).resolve(strict=True)
    timeline = edits.read(project/'reference-timeline.json')
    if observed or note:
        if not (observed and note and note.strip()) or any(v is not None for v in (opening,bridge,captions,alternative)):
            raise ValueError('Record the actual inspection scope and a concrete observation after playing the proofs.')
        with plan_lock(project):
            record=check(project,timeline,reviewed=False)
            if observed=='normal-sound' and record.get('audio')!='original-master':
                raise ValueError('A silent proof cannot record an original-sound review.')
            record['inspection']={'scope':observed,'note':note}
            write_atomic(project/RECEIPT,record)
        return record
    if opening is None and bridge is None:
        return check(project,timeline,reviewed=False)
    if opening is None or bridge is None:
        raise ValueError('Specify the opening end and the two transition times on the master clock.')
    fps, frames=timeline['fps'],timeline['frames']
    if not all(edits.number(t) for t in [opening,*bridge,scale]) or not 0<scale<=2:
        raise ValueError('Invalid proof times or preview scale.')
    end=round(opening*fps)
    a,b=(round(t*fps) for t in bridge)
    if not (min(8*fps,frames)<=end<=min(12*fps,frames) and 0<=a<b<=frames):
        raise ValueError('Choose an 8–12s opening (or the whole shorter film) and a transition inside the cut.')
    cuts=timeline.get('cutaways',[])
    def on_field(frame):
        return any(c['start']<=frame<c['end'] for c in cuts)
    complete=any(a<c['start']<c['end']<b and c['inset'] for c in cuts) and not on_field(a) and not on_field(b-1)
    if not complete and not (alternative and alternative.strip()):
        raise ValueError('Include presenter, verified field footage with a safe inset, and the return. If unavailable, record the actual alternate passage and reason with --alternative.')
    signature=edit_signature(project,timeline)
    for src,meta in timeline['assets'].items():
        if edits.digest(project/src)!=meta['sha256']:
            raise ValueError('The bound media changed: '+src)
    cues=parse_srt(captions) if captions else []
    settings={'signature':signature,'ranges':[[0,end],[a,b]],'scale':scale,'captions':edits.digest(captions) if captions else None,
              'transition':'presenter-field-inset-return' if complete else alternative}
    key=hashlib.sha256(json.dumps(settings,sort_keys=True).encode()).hexdigest()[:20]
    final=project/'editorial-proofs'/key
    with plan_lock(project):
        if (project/RECEIPT).is_file() and edits.read(project/RECEIPT).get('key')==key:
            return check(project,timeline,reviewed=False)
        final.parent.mkdir(exist_ok=True)
        if not final.exists():
            with tempfile.TemporaryDirectory(dir=final.parent) as tmp:
                temp=Path(tmp)
                out=temp/'clips'
                out.mkdir()
                for name,(first,last) in zip(('opening','transition'),settings['ranges']):
                    clip=out/(name+'.mp4')
                    picture=temp/(name+'.mp4')
                    library_html_runner.run(project,'render',picture,scale,frame_range=(first,last),proof_cues=cues)
                    if timeline.get('narration'):
                        subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(picture),'-ss',str(first/fps),
                            '-i',str(project/timeline['narration']),'-map','0:v:0','-map','1:a:0','-t',str((last-first)/fps),
                            '-c:v','copy','-c:a','aac','-movflags','+faststart',str(clip)],check=True)
                    else:
                        picture.rename(clip)
                    info=edits.probe(clip)
                    stream=next(s for s in info['streams'] if s['codec_type']=='video')
                    if int(stream['nb_frames'])!=last-first or (timeline.get('narration') and not any(s['codec_type']=='audio' for s in info['streams'])):
                        raise ValueError('Proof picture or original narration is incomplete.')
                out.rename(final)
        clips=[]
        for name,(first,last) in zip(('opening','transition'),settings['ranges']):
            clip=final/(name+'.mp4')
            review_clip(project,timeline,clip,first,last)
            clips.append({'file':clip.relative_to(project).as_posix(),'sha256':edits.digest(clip),'master_frames':[first,last]})
        record={**settings,'key':key,'clips':clips,'audio':'original-master' if timeline.get('narration') else 'silent',
                'inspection':None,'entire_film_viewed':False,'nle_tested':False}
        write_atomic(project/RECEIPT,record)
        return record
