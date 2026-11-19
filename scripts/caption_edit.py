"""Edit timed dialogue independently of the picture. Milliseconds, half-open intervals."""
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile

from edit_session import plan_lock, write_atomic


STATE = 'dialogue-captions.json'
CLOCK = re.compile(r'(\d+):(\d{2}):(\d{2})[,.](\d{3})')


def milliseconds(text):
    parts = str(text).replace(',', '.').split(':')
    if not 1 <= len(parts) <= 3 or any(not p.isdigit() for p in parts[:-1]):
        raise ValueError('Use seconds or a time such as 00:39.40.')
    tail = re.fullmatch(r'(\d+)(?:\.(\d{1,3}))?', parts[-1])
    if not tail or (len(parts) > 1 and int(tail[1]) >= 60) or (len(parts) == 3 and int(parts[1]) >= 60):
        raise ValueError('Invalid subtitle clock.')
    seconds = sum(int(p) * 60 ** (len(parts)-i-1) for i, p in enumerate(parts[:-1])) + int(tail[1])
    return seconds * 1000 + int((tail[2] or '').ljust(3, '0'))


def stamp(ms):
    seconds, fraction = divmod(ms, 1000)
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    return f'{hours:02}:{minutes:02}:{seconds:02},{fraction:03}'


def parse_srt(file):
    raw = Path(file).read_bytes()
    codec = 'utf-16' if raw.startswith((b'\xff\xfe',b'\xfe\xff')) else 'utf-8-sig'
    body = raw.decode(codec).replace('\r\n','\n').replace('\r','\n').strip()
    cues = []
    for index, block in enumerate(re.split(r'\n[ \t]*\n', body), 1):
        lines = block.splitlines()
        clock_line = 1 if lines and lines[0].strip().isdigit() else 0
        if len(lines) < clock_line + 2:
            raise ValueError(f'Missing timing or dialogue in subtitle {index}.')
        clocks = [p.strip() for p in lines[clock_line].split('-->')]
        if len(clocks) != 2 or not all(CLOCK.fullmatch(p) for p in clocks):
            raise ValueError(f'Invalid timing in subtitle {index}.')
        start, end = map(milliseconds, clocks)
        if end <= start:
            raise ValueError(f'Invalid interval in subtitle {index}.')
        cues.append({'id':index, 'start_ms':start, 'end_ms':end, 'text':'\n'.join(lines[clock_line+1:])})
    return cues


def active_shots(project, ms):
    for name in ('reference-timeline.json', 'reference-cut-plan.json', 'caption-shot-map.json'):
        path = project / name
        if path.is_file():
            data = json.loads(path.read_text(encoding='utf-8-sig'))
            for i, shot in enumerate(data.get('cutaways',[]),1):
                a,b=shot.get('start',shot.get('start_frame')),shot.get('end',shot.get('end_frame'))
                if a*1000 <= ms*data['fps'] < b*1000:
                    return [{'number':i,'id':shot['footage']['subject'],'type':'cutaway','frames':[a,b]}]
            active = []
            for i, shot in enumerate(data['shots'], 1):
                a, b = shot.get('start', shot.get('start_frame')), shot.get('end', shot.get('end_frame'))
                if type(a) is int and type(b) is int and a*1000 <= ms*data['fps'] < b*1000:
                    active.append({'number': i, 'id': shot.get('id', shot.get('source_id')), 'frames':[a,b]})
            if not active and data.get('base_video'):
                ends = [0,data.get('frames', data.get('duration_frames'))]
                for item in [*data['shots'], *data.get('cutaways',[])]:
                    ends.extend([item.get('start',item.get('start_frame')),item.get('end',item.get('end_frame'))])
                frame=ms*data['fps']/1000
                bounds=sorted({v for v in ends if type(v) is int})
                for a,b in zip(bounds,bounds[1:]):
                    if a<=frame<b:
                        return [{'id':'口播底片','type':'presenter','frames':[a,b]}]
            return active
    return []


def focused(project):
    path = project / STATE
    if not path.is_file():
        return None
    state = json.loads(path.read_text(encoding='utf-8'))
    if 'last_ms' in state:
        ms = state['last_ms']
        row = next(r for r in state['cues'] if r['id'] == state['last_cue'])
        return {'at':stamp(ms), 'cue':row, 'shots':active_shots(project, ms)}
    return None


def edit(project, at=None, *, source=None, expected=None, replacement=None, cue=None):
    folder = Path(project).resolve(strict=True)
    path = folder / STATE
    with plan_lock(folder):
        if source is not None:
            if path.exists():
                raise ValueError('This project already has a saved subtitle track. Resume it to preserve edits.')
            state = {'version':1,'cues':parse_srt(source)}
        else:
            state = json.loads(path.read_text(encoding='utf-8'))
        if (expected is None) != (replacement is None):
            raise ValueError('Supply both the previous and revised full subtitle.')
        if at is None and replacement is None and cue is None:
            if source is not None:
                write_atomic(path, state)
            return {'cues':len(state['cues']), 'last':focused(folder), 'file':str(path)}
        if at is None:
            raise ValueError('Select the dialogue by its episode time.')
        ms = milliseconds(at)
        rows = [r for r in state['cues'] if r['start_ms'] <= ms < r['end_ms'] and (cue is None or r['id']==cue)]
        if len(rows) != 1:
            raise ValueError('No unique subtitle at this time. Matching IDs: '+str([r['id'] for r in rows]))
        row = rows[0]
        if replacement is not None:
            if row['text'] != expected or not replacement.strip() or re.search(r'\n[ \t]*\n|\r',replacement):
                raise ValueError('Previous subtitle differs, or replacement contains an empty cue.')
            row['text'] = replacement
        state.update(last_ms=ms,last_cue=row['id'])
        write_atomic(path, state)
        return {'at':stamp(ms),'cue':row,'shots':active_shots(folder,ms),'changed':replacement is not None and replacement!=expected}


def export(project, out, picture=None):
    folder, out = Path(project).resolve(), Path(out).resolve()
    if not out.parent.is_dir() or out.exists():
        raise ValueError('Choose a new subtitle or movie output in an existing directory.')
    with plan_lock(folder):
        cues = json.loads((folder / STATE).read_text(encoding='utf-8'))['cues']
    srt = '\n\n'.join(f'{i}\n{stamp(r["start_ms"])} --> {stamp(r["end_ms"])}\n{r["text"]}' for i,r in enumerate(cues,1))+'\n'
    if picture is None:
        if out.suffix.lower() != '.srt':
            raise ValueError('Use an .srt output or supply a clean picture master for .mp4.')
        with out.open('x', encoding='utf-8-sig',newline='\n') as stream:
            stream.write(srt)
    else:
        from reference_edits import digest, probe
        receipt_path = out.with_suffix(out.suffix+'.captions.json')
        if receipt_path.exists():
            raise ValueError('Choose a new output name to keep the earlier caption receipt.')
        if out.suffix.lower() != '.mp4':
            raise ValueError('Use an .mp4 output for selectable dialogue.')
        info = probe(Path(picture).resolve(strict=True))
        kinds = [s['codec_type'] for s in info['streams']]
        if 'video' not in kinds or set(kinds)-{'video','audio'}:
            raise ValueError('Supply a clean picture master with its original audio and no other tracks.')
        if max(r['end_ms'] for r in cues) > 1000*float(info['format']['duration'])+1:
            raise ValueError('The dialogue extends beyond the picture master.')
        with tempfile.TemporaryDirectory(dir=out.parent) as tmp:
            track, movie = Path(tmp)/'dialogue.srt', Path(tmp)/'mux.mp4'
            track.write_text(srt,encoding='utf-8')
            subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(picture),'-i',str(track),'-map','0','-map','1:s:0',
                            '-c','copy','-c:s','mov_text','-metadata:s:s:0','language=zho','-disposition:s:0','default',
                            '-movflags','+faststart',str(movie)],check=True)
            receipt={'kind':'ui-motion-fusion/dialogue-remux','picture_sha256':digest(picture),
                     'file_sha256':digest(movie),'cues':cues}
            if os.name=='nt':
                movie.rename(out)
            else:
                os.link(movie,out)
            try:
                write_atomic(receipt_path,receipt)
            except BaseException:
                out.unlink()
                raise
    return {'file':str(out),'cues':len(cues),'picture':'packet-copy' if picture else 'untouched',
            'editable':'timed-dialogue-track','picture_frames_redrawn':0}


def arguments(parser):
    parser.add_argument('--project',required=True,type=Path)
    parser.add_argument('--import-srt',type=Path)
    parser.add_argument('--at')
    parser.add_argument('--cue',type=int)
    parser.add_argument('--expect')
    parser.add_argument('--text')
    parser.add_argument('--out',type=Path)
    parser.add_argument('--media',type=Path)


def command(args):
    if args.out:
        if any(v is not None for v in (args.import_srt,args.at,args.expect,args.text,args.cue)):
            raise ValueError('Save the edit before exporting.')
        return export(args.project, args.out, args.media)
    if args.media:
        raise ValueError('Supply --out for a captioned copy.')
    return edit(args.project,args.at,source=args.import_srt,expected=args.expect,replacement=args.text,cue=args.cue)
