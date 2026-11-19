"""Apply the submitted films' edit decisions to current episode media, on one real clock."""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import zlib

import video_sources
import shot_direction

ROOT = video_sources.ROOT
RECIPES = 'assets/reference-edits/recipes.json'
MOTION = 'references/video-motion.json'
SCHEMA = 'ui-motion-fusion/reference-cut@1'
CANVAS = 'assets/reference-edits'
VISUAL = {'.jpg', '.jpeg', '.png', '.webp', '.avif', '.bmp'}
VIDEO = {'.mp4', '.webm', '.mov', '.m4v', '.mkv'}
AUDIO = {'.mp3', '.m4a', '.aac', '.wav', '.flac', '.ogg', '.opus'}


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def episode_data(master):
    return 'window.REFERENCE_EPISODE='+json.dumps(master,ensure_ascii=False).replace('<','\\u003c')+';\n'


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(4 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def rules(catalog):
    recipes = read(catalog.root / RECIPES)['recipes']
    directions = read(catalog.root / shot_direction.DIRECTION)
    if directions.keys() != recipes.keys():
        raise ValueError('Each submitted edit recipe requires its own shot direction.')
    films = catalog.rows('focus')
    required = {r['id'] for r in films if r['status'] == 'available'}
    if set(recipes) != required:
        raise ValueError('Reference recipes and submitted positive sources differ: ' +
                         ', '.join(sorted(required ^ set(recipes))))
    for row in films:
        key = row['id']
        if key in recipes and recipes[key]['capability'] not in {u['capability'] for u in row['uses']}:
            raise ValueError('Unregistered source method: ' + key)
    return recipes, [r for r in films if r['status'] == 'diagnostic']


def assignments(router, units):
    """Match the entire script to each submitted source. A top-N list never defines coverage."""
    from video_routing import _evidence
    recipes, diagnostics = rules(router.catalog)
    ranking = {}
    for unit in units:
        for item in router.match(unit['quote'], limit=len(recipes), allowed=recipes):
            key = item['source_id']
            weight = (item['match_basis'] == 'phrase', len(item['matched']),
                      sum(map(len, item['matched'])))
            if key not in ranking or weight > ranking[key][0]:
                ranking[key] = (weight, unit, item)
    rows = []
    measured = read(router.catalog.root / MOTION)['sources']
    for key, recipe in recipes.items():
        row = router.catalog.lookup(key)
        choice = ranking.get(key)
        use = next(u for u in row['uses'] if u['capability'] == recipe['capability'])
        evidence = _evidence(row, use)
        temporal = source_timing(row, measured.get(key))
        rows.append({'source_id': key, 'title': row['title'], 'scope': row['scope'],
                     'source_resource_id': row.get('atlas', {}).get('source_resource_id'),
                     'contribution': recipe['action'], 'inputs': recipe['slots'],
                     'capability': recipe['capability'], 'locator': evidence, 'clip': row.get('media'),
                     'timing': temporal,
                     'suggested_unit': choice[1]['id'] if choice else None,
                     'matched_words': choice[2]['matched'] if choice else [],
                     'assignment': 'candidate' if choice else 'choose-by-editing-function',
                     'evidence': row['evidence'],
                     'motion_evidence': {'basis':measured.get(key,{}).get('kind','retained-source-and-approval'),
                                         'samples':measured.get(key,{}).get('frames',0),
                                         'approved_ranges':row.get('atlas',{}).get('approved_ranges',[]),
                                         'inspect':'ui.py videos motion --id '+key}})
    return {'scope': 'all-submitted-films', 'required': rows,
            'diagnostic': [{'source_id': r['id'], 'title': r['title'], 'use': r['scope']} for r in diagnostics],
            'applied': [], 'complete': False}


def source_timing(row, record):
    """Summarize change across every measured approved interval, keeping its origin."""
    if not record:
        return {'basis': 'retained-source-and-approval', 'samples': 0}
    fps, total = record['fps'], record['frames']
    values = zlib.decompress(base64.b64decode(record['motion']))
    if len(values) != 4 * total:
        raise ValueError('Invalid source motion length: ' + row['id'])
    atlas = row.get('atlas', {})
    permitted = atlas.get('approved_ranges') or [(0, total / fps)]
    excluded = atlas.get('excluded_ranges') or []
    mask = bytearray(total)
    for ranges, flag in ((permitted, 1), (excluded, 0)):
        for start, end in ranges:
            first = max(0, min(total, math.ceil(start * fps)))
            last = max(first, min(total, math.ceil(end * fps)))
            mask[first:last] = bytes([flag]) * (last - first)
    windows = []
    cursor = 0
    while cursor < total:
        start = mask.find(b'\x01', cursor)
        if start == -1:
            break
        stop = mask.find(b'\x00', start)
        stop = total if stop == -1 else stop
        for a in range(start, stop, fps):
            b = min(a + fps, stop)
            change = sum(values[a*4:b*4]) / (4*(b-a))
            windows.append((change, a/fps, b/fps))
        cursor = stop
    if not windows:
        raise ValueError('No approved motion samples: ' + row['id'])
    return {'basis': record['kind'], 'samples': sum(mask),
            'active': list(max(windows, key=lambda v: v[0])[1:]),
            'quiet': list(min(windows, key=lambda v: v[0])[1:])}


def motion(catalog, ident, start=None, end=None):
    row = catalog.lookup(ident)
    record = read(catalog.root / MOTION)['sources'].get(row['id'])
    if not record:
        return {'source_id': row['id'], 'basis': 'retained-source-and-approval',
                'evidence': row['evidence'], 'scope': row['scope'], 'sample_count': 0}
    fps = record['fps']
    whole = record['frames']/fps
    approved = row.get('atlas',{}).get('approved_ranges') or []
    default = approved[0] if len(approved)==1 and start is None and end is None else (0,whole)
    low = default[0] if start is None else start
    high = min(default[1],whole) if end is None else end
    if not number(low) or not number(high) or not 0 <= low < high <= record['frames']/fps+.001:
        raise ValueError('Choose a time range within the measured source film.')
    first, stop = math.ceil(low*fps), min(record['frames'], math.ceil(high*fps))
    values = zlib.decompress(base64.b64decode(record['motion']))
    if len(values) != 4*record['frames']:
        raise ValueError('Invalid source motion length: '+row['id'])
    # Aggregate consecutive measured frames into at most 32 windows. Never invent cuts or object labels.
    stride = max(1, math.ceil((stop-first)/32))
    windows = []
    for i in range(first, stop, stride):
        j = min(stop, i+stride)
        deltas = [sum(values[i*4+q:j*4:4])/(j-i) for q in range(4)]
        windows.append({'from': i/fps, 'to': j/fps, 'change': [round(v,1) for v in deltas]})
    return {'source_id': row['id'], 'basis':record['kind'], 'scope':row['scope'],
            'fps':fps, 'sample_count':stop-first, 'full_sample_count':record['frames'],
            'approved_ranges':approved,
            'channels':['左上','右上','左下','右下'], 'windows':windows, 'evidence':row['evidence'],
            'meaning':'各区域连续帧的平均亮度变化量。结合原有镜头记录理解停顿和变化，不从数值推断物体或原声。'}


def unbound_shot(source):
    inputs = {key: {'text': None} if slot['kind'] == 'text' else {'path': None}
              for key, slot in source['inputs'].items()}
    return {'source_id': source['source_id'], 'unit': source['suggested_unit'],
            'contribution': source['contribution'], 'start_frame': None, 'end_frame': None, 'inputs': inputs}


def scaffold(router, script, output, coverage=None, presenter=None):
    import selection
    script, output = Path(script).resolve(), Path(output).resolve()
    if output.exists() or not output.parent.is_dir():
        raise ValueError('Choose a new plan in an existing project directory.')
    source = script.read_bytes()
    units = selection.source_segments(source.decode('utf-8-sig'))
    if not units:
        raise ValueError('Empty narration.')
    if coverage is None:
        coverage = assignments(router, units)
    plan = {'schema':SCHEMA, 'generated_by':'ui-motion-fusion/reference-edits', 'script':os.path.relpath(script,output.parent) if script.drive==output.drive else str(script),
            'script_sha256':hashlib.sha256(source).hexdigest(), 'fps':30,'width':1280,'height':720,
            'duration_frames':None, 'narration':None,'base_video':None, 'shots':[],
            'diagnostic':coverage['diagnostic'], 'editorial_review':1}
    if presenter:
        path=Path(presenter['path'])
        local=os.path.relpath(path,output.parent) if output.drive==path.drive else str(path)
        plan.update(narration=local, base_video=local, duration_frames=round(presenter['duration_seconds']*plan['fps']),
                    narration_stream_index=presenter['audio_master']['stream_index'])
    plan['shots'] = [unbound_shot(source) for source in coverage['required']]
    with output.open('x',encoding='utf-8') as f:
        json.dump(plan,f,ensure_ascii=False,indent=2)
    return {'plan':str(output),'required_sources':len(plan['shots']),
            'next':'Agent 按真实原声落点、每条职责和本期素材填 slots 与帧窗，用 videos compose 做出可播放工程。'}


def box(v, name):
    if not isinstance(v,list) or len(v)!=4 or any(not number(x) for x in v):
        raise ValueError('Expected a normalized rectangle for '+name)
    x,y,w,h=v
    if x<0 or y<0 or min(w,h)<=0 or x+w>1.000001 or y+h>1.000001:
        raise ValueError('Rectangle outside stage: '+name)
    return v


def probe(path):
    tool=shutil.which('ffprobe')
    if not tool:
        raise ValueError('FFprobe is needed to check a moving input and its usable duration.')
    proc=subprocess.run([tool,'-v','error','-show_entries',
        'stream=index,codec_type,duration,nb_frames:format=duration','-of','json',str(path)],
        capture_output=True,text=True,encoding='utf-8')
    if proc.returncode:
        raise ValueError('Cannot decode media: '+path.name)
    return json.loads(proc.stdout)


class Media:
    def __init__(self, base, dest, catalog=None):
        self.base, self.dest = base,dest
        self.assets, self.info, self.digests = {},{},{}
        self.moving_ranges=set()
        self.catalog=catalog
        self.projects={}
        self.library=None

    def from_project(self, request):
        import reference_project_input
        if not isinstance(request, dict) or not all(isinstance(request.get(k), str) and request[k] for k in ('project', 'capability')):
            raise ValueError('A bound project requires its path and catalog capability ID.')
        if 'source_id' in request and not isinstance(request['source_id'], str):
            raise ValueError('Supply a source ID or omit it to use the catalog directly.')
        if 'source_id' not in request and self.library is None:
            import capability_catalog
            self.library = {r['id']: r for r in capability_catalog.records(self.catalog.root)}
        key=(request.get('source_id'),request['capability'],str((self.base/request['project']).resolve()))
        if key not in self.projects:
            out=self.dest.parent/('bound-input-'+str(len(self.projects))+'.mp4')
            proof=reference_project_input.render_input(self.catalog,request,self.base,out,self.library)
            self.projects[key]=(str(out),proof)
        return self.projects[key]

    def require_motion(self, value, offset, seconds):
        path=(self.base/value).resolve(strict=True)
        key=(path,offset,seconds)
        if key in self.moving_ranges:
            return
        command=['ffmpeg','-v','error','-nostdin','-ss',str(offset),'-i',str(path),'-t',str(seconds),
                 '-map','0:v:0','-an','-vf','scale=64:36:flags=area,format=gray',
                 '-vsync','0','-f','framemd5','pipe:1']
        proc=subprocess.run(command,capture_output=True,text=True,encoding='utf-8')
        if proc.returncode:
            raise ValueError('Cannot inspect moving interval: '+path.name)
        hashes={line.rsplit(',',1)[-1].strip() for line in proc.stdout.splitlines() if line and not line.startswith('#')}
        if len(hashes)<2:
            raise ValueError('The moving role has no decoded picture change in its used interval: '+path.name)
        self.moving_ranges.add(key)
    def add(self, value, expected, needed, name):
        if not isinstance(value,str) or not value.strip() or '://' in value:
            raise ValueError('Bind a local current asset for '+name)
        path=(self.base/value).resolve(strict=True)
        if not path.is_file():
            raise ValueError('Missing current media for '+name)
        ext=path.suffix.lower()
        if ext not in VISUAL|VIDEO|AUDIO:
            raise ValueError('Unsupported media file: '+path.name)
        kind='image' if ext in VISUAL else 'video' if ext in VIDEO else 'audio'
        if expected=='moving' and kind!='video' or expected=='visual' and kind=='audio' or expected=='audio' and kind=='image':
            raise ValueError('Wrong media type for '+name+': '+expected)
        if kind!='image':
            if path not in self.info:
                self.info[path]=probe(path)
            info=self.info[path]
            tracks=[s for s in info['streams'] if s['codec_type']==('audio' if expected=='audio' else 'video')]
            if not tracks:
                raise ValueError('Missing media stream for '+name)
            stream=tracks[0]
            duration=stream.get('duration')
            if duration in (None,'N/A'):
                duration=info['format'].get('duration')
            if duration in (None,'N/A') or float(duration)+.045<needed or (expected=='moving' and stream.get('nb_frames')=='1'):
                raise ValueError('Current media does not cover the timed action: '+name)
        if path not in self.digests:
            self.digests[path]=digest(path)
        fingerprint=self.digests[path]
        local='media/'+fingerprint+ext
        if local not in self.assets:
            target=self.dest/local
            target.parent.mkdir(exist_ok=True)
            # A finished project holds its own bytes even if the episode source is edited later.
            shutil.copyfile(path,target)
            if digest(target)!=fingerprint:
                raise ValueError('Media changed while copying: '+path.name)
            self.assets[local]={'sha256':fingerprint,'kind':kind}
        return {'src':local,'kind':kind}


def _current_slot(key, slot, value, recipe, media, length, fps):
    if not isinstance(value,dict):
        raise ValueError('Supply this episode’s '+slot['purpose'])
    intervals=[l['keys'] for l in recipe['layers'] if l['slot']==key]
    low=min(t[0]['at'] for t in intervals)
    high=max(t[-1]['at'] for t in intervals)
    if slot['kind']=='text':
        if not isinstance(value.get('text'),str) or not value['text'].strip():
            raise ValueError('Supply current text: '+slot['purpose'])
        result={'kind':'text','text':value['text']}
    else:
        offset=value.get('in',0)
        if not number(offset) or offset<0:
            raise ValueError('Invalid source in-point: '+key)
        path=value.get('path')
        project_info=None
        if 'from_project' in value:
            if path:
                raise ValueError('Choose a media path or a bound implementation project for '+key)
            path,project_info=media.from_project(value['from_project'])
        result=media.add(path,slot['kind'],offset+max(0,length*(high-low)-1/fps),key)
        if slot['kind']=='moving':
            media.require_motion(path,offset,length*(high-low))
        if project_info:
            result['from_project']=project_info
        if 'footage' in value:
            result['footage'] = footage_record(value['footage'])
        result.update(source_in=offset,first=low)
    if any(k['frame']=='safe' for t in intervals for k in t):
        result['placement']=box(value.get('placement'),key+' measured placement')
    if 'focus' in value:
        p=value['focus']
        if not isinstance(p,list) or len(p)!=2 or any(not number(v) or not 0<=v<=1 for v in p):
            raise ValueError('Supply normalized material focus coordinates: '+key)
        result['focus']=p
    if value.get('fit','contain') not in ('contain','cover'):
        raise ValueError('Unsupported image fit')
    result['fit']=value.get('fit','contain')
    return result


def footage_record(value):
    fields = ('origin','subject','claim_subject','gain','use')
    if not isinstance(value,dict) or set(value)!=set(fields) or not all(isinstance(value[k],str) and value[k].strip() for k in fields):
        raise ValueError('Identify the source before cropping, actual subject, claimed subject, evidence type and information gained.')
    if value['use'] not in ('direct','illustration') or (value['use']=='direct' and value['subject'].strip().casefold()!=value['claim_subject'].strip().casefold()):
        raise ValueError('A named project needs evidence of that same subject. Use general illustration only for a general claim.')
    return value


def footage_count(shots, cutaways=()):
    # Crops retain their original source identity. Renamed copies also share a content-addressed src.
    groups = []
    for shot in [*shots, {'inputs':dict(enumerate(cutaways))}]:
        for item in shot['inputs'].values():
            if 'footage' in item:
                keys = {('origin',item['footage']['origin'].strip()),('bytes',item['src'])}
                same = [g for g in groups if g & keys]
                groups = [g for g in groups if not g & keys] + [keys.union(*same)]
    return len(groups)


def field_cuts(rows, media, fps, frames, presenter):
    if not isinstance(rows,list):
        raise ValueError('Cutaways must be a list.')
    result = []
    for row in rows:
        if not isinstance(row,dict) or not {'path','start_frame','end_frame','footage','protect','subtitle'} <= row.keys():
            raise ValueError('Supply a field clip, its source record, timing and protected rectangles.')
        start,end = row['start_frame'],row['end_frame']
        if type(frames)!=int or type(start)!=int or type(end)!=int or not 0<=start<end<=frames or any(start<s['end'] and end>s['start'] for s in result):
            raise ValueError('A field shot needs one unambiguous interval on the master clock.')
        source_in = row.get('in',0)
        if not number(source_in) or source_in<0 or type(row.get('main_has_face'))!=bool:
            raise ValueError('Inspect the field video for faces and set its original in point.')
        footage = footage_record(row['footage'])
        if not isinstance(row['protect'],list):
            raise ValueError('Supply a list of rectangles covering the action.')
        protects = [box(rect,'action or existing text') for rect in row['protect']]
        if not protects:
            raise ValueError('Mark the full travel of the subject in the final phone composition.')
        subtitle = box(row['subtitle'],'subtitle area')
        inset = row.get('inset')
        if inset is not None:
            x,y,w,h = box(inset,'presenter inset')
            if not presenter or row['main_has_face'] or any(x<a+c and a<x+w and y<b+d and b<y+h for a,b,c,d in [*protects,subtitle]):
                raise ValueError('The inset covers the moving subject, subtitles, or duplicates a visible face.')
        if any(subtitle[0]<a+c and a<subtitle[0]+subtitle[2] and subtitle[1]<b+d and b<subtitle[1]+subtitle[3] for a,b,c,d in protects):
            raise ValueError('The dialogue area covers the field action. Reframe or move the subtitles.')
        asset = {'src':row['path']}
        if not isinstance(asset['src'],str) or not asset['src'].strip():
            raise ValueError('Supply a local footage path and a list of subject rectangles.')
        if media is not None:
            asset = media.add(row['path'],'moving',source_in+(end-start)/fps,'field footage')
            media.require_motion(row['path'],source_in,(end-start)/fps)
        seen=row.get('seen','notes')
        if seen not in ('notes','frames','normal-silent','normal-sound'):
            raise ValueError('Describe how the source field footage was actually inspected.')
        result.append({**asset,'start':start,'end':end,'source_in':source_in,'footage':footage,
                       'protect':protects,'subtitle':subtitle,'inset':inset,'main_has_face':row['main_has_face'],'seen':seen})
    return sorted(result,key=lambda item:item['start'])


def _label_project_inputs(shots):
    from reference_project_input import credit
    variants = {}
    for shot in shots:
        for item in shot['inputs'].values():
            if item.get('from_project'):
                variants.setdefault(credit(item['from_project']), {}).setdefault(item['src'], []).append(item)
    for label, assets in variants.items():
        if len(assets) > 1:
            for src, items in assets.items():
                for item in items:
                    item['from_project'] = {**item['from_project'], 'credit': label + ' @ ' + Path(src).stem}


def _visibility(shots, duration, base):
    """Each counted shot must be visible. Multiple source roles may share time in separate areas."""
    cuts=sorted({0,duration,*[x[k] for x in shots for k in ('start','end')]})
    seen=set()
    for left,right in zip(cuts,cuts[1:]):
        active=[(i,s) for i,s in enumerate(shots) if s['start']<=left and s['end']>=right]
        if not active and not base:
            raise ValueError(f'Empty master picture at frames {left}–{right}. Bind base_video or cover that interval.')
        for ix,(i,shot) in enumerate(active):
            x,y,w,h=shot['rect']
            above=[s['rect'] for _,s in active[ix+1:]]
            xs=sorted({x,x+w,*[max(x,min(x+w,p)) for a,_,b,_ in above for p in (a,a+b)]})
            ys=sorted({y,y+h,*[max(y,min(y+h,p)) for _,a,_,b in above for p in (a,a+b)]})
            if any(not any(a<=(u+v)/2<a+c and b<=(j+k)/2<b+d for a,b,c,d in above)
                   for u,v in zip(xs,xs[1:]) for j,k in zip(ys,ys[1:])):
                seen.add(i)
    if len(seen)!=len(shots):
        raise ValueError('A reference is completely hidden by other shots: '+', '.join(s['id'] for i,s in enumerate(shots) if i not in seen))


def compose(catalog, plan_path, output, *, preview=False):
    import selection
    plan_path,output=Path(plan_path).resolve(),Path(output).resolve()
    if output.exists() or not output.parent.is_dir():
        raise ValueError('Choose a new output project in an existing directory.')
    plan_bytes = plan_path.read_bytes()
    plan = json.loads(plan_bytes.decode('utf-8-sig'))
    if plan.get('schema')!=SCHEMA:
        raise ValueError('Expected '+SCHEMA)
    base=plan_path.parent
    script=(base/plan['script']).resolve(strict=True)
    if digest(script)!=plan['script_sha256']:
        raise ValueError('The narration changed. Reassign references against the current script.')
    units={u['id']:u for u in selection.source_segments(script.read_bytes().decode('utf-8-sig'))}
    recipes,diagnostic=rules(catalog)
    if preview and isinstance(plan.get('shots'),list):
        plan['shots'] = [s for s in plan['shots'] if s.get('start_frame') is not None or s.get('end_frame') is not None]
    if not isinstance(plan.get('shots'),list) or (not plan['shots'] and not (preview and plan.get('base_video'))):
        raise ValueError('At least one timed source contribution is required.')
    ids=[catalog.lookup(s['source_id'])['id'] for s in plan['shots']]
    unknown=set(ids)-recipes.keys()
    if unknown:
        raise ValueError('Source is not a positive submitted edit recipe: '+', '.join(sorted(unknown)))
    missing=sorted(recipes.keys()-set(ids))
    if missing and not preview:
        raise ValueError('The cut is missing submitted references: '+', '.join(missing))
    fps,w,h,dur=[plan.get(key) for key in ('fps','width','height','duration_frames')]
    if any(type(v)!=int or v<1 for v in (fps,w,h,dur)) or fps>120 or min(w,h)<32 or w%2 or h%2:
        raise ValueError('Bind a positive integer master frame count, frame rate and even output dimensions.')
    if any(not isinstance(s,dict) or type(s.get('start_frame'))!=int or type(s.get('end_frame'))!=int
           or not 0<=s['start_frame']<s['end_frame']<=dur or s.get('unit') not in units for s in plan['shots']):
        raise ValueError('Bind every source to an actual narration unit and a valid master-frame interval.')
    origin=catalog.root/CANVAS
    directions = read(catalog.root / shot_direction.DIRECTION)
    with tempfile.TemporaryDirectory(prefix='.reference-cut-',dir=output.parent) as temp:
        staging=Path(temp)/'project'
        staging.mkdir()
        media=Media(base,staging,catalog)
        master={'schema':SCHEMA,'fps':fps,'width':w,'height':h,'frames':dur,'shots':[],
                'palette': read(catalog.root / shot_direction.PALETTE),
                'script_sha256':plan['script_sha256'],'source_plan_sha256':hashlib.sha256(plan_bytes).hexdigest()}
        if plan.get('editorial_review'):
            master['editorial_review'] = 1
        for ident,shot in zip(ids,plan['shots']):
            recipe=recipes[ident]
            inputs=shot.get('inputs')
            if not isinstance(inputs,dict) or set(inputs)!=set(recipe['slots']):
                raise ValueError('Bind the exact source-specific material roles: '+ident)
            a,b=shot['start_frame'],shot['end_frame']
            # Each authored moving state needs at least one actual output frame.
            for layer in recipe['layers']:
                lo,hi=layer['keys'][0]['at'],layer['keys'][-1]['at']
                if math.ceil(lo*(b-a)-1e-9)>=min(b-a,math.ceil(hi*(b-a)-1e-9)):
                    raise ValueError('This time window loses an entire motion phase: '+ident+'/'+layer['slot'])
            bound={key:_current_slot(key,slot,inputs[key],recipe,media,(b-a)/fps,fps) for key,slot in recipe['slots'].items()}
            surfaces = shot_direction.surfaces(directions[ident], recipe['slots'])
            for key, value in bound.items():
                value['surface'] = 'native' if value.get('from_project') or value.get('footage') else surfaces[key]
            if not preview and master.get('editorial_review') and not shot.get('borrow'):
                raise ValueError('Record what was actually borrowed and viewed for '+ident+' (shot.borrow).')
            if shot.get('borrow'):
                if (not preview and master.get('editorial_review') and shot['borrow'].get('aspect','motion')=='motion'
                        and not shot_direction.motion_viewed(shot['borrow'])):
                    raise ValueError('Play the continuous action for '+ident+' or record the specific static aspect actually used.')
                row = catalog.lookup(ident)
                from video_routing import _evidence
                use = next(u for u in row['uses'] if u['capability']==recipe['capability'])
                src = {'source_id':ident,'clip':row.get('media'),'locator':_evidence(row,use),'capability':recipe['capability'],
                       'source_resource_id':row.get('atlas',{}).get('source_resource_id'),
                       'motion_evidence':{'approved_ranges':row.get('atlas',{}).get('approved_ranges',[])}}
                shot_direction.annotated_reference(catalog.root,src,directions[ident],shot['borrow'],checking=True)
            master['shots'].append({'id':ident,'unit':shot['unit'],'quote':units[shot['unit']]['quote'],
                'start':a,'end':b,'rect':box(shot.get('rect',[0,0,1,1]),ident),
                **({'borrow':shot['borrow']} if shot.get('borrow') else {}),
                'contribution':recipe['action'],'capability':recipe['capability'],'inputs':bound})
        for field,kind in [('narration','audio'),('base_video','moving')]:
            if plan.get(field):
                current=plan[field]
                if field=='narration' and 'narration_stream_index' in plan:
                    original=(base/current).resolve(strict=True)
                    tracks=[s['index'] for s in probe(original)['streams'] if s['codec_type']=='audio']
                    index=plan['narration_stream_index']
                    if type(index)!=int or index not in tracks:
                        raise ValueError('The selected original audio track is absent.')
                    if len(tracks)>1:
                        selected=Path(temp)/'original-audio.wav'
                        subprocess.run(['ffmpeg','-v','error','-nostdin','-i',str(original),'-map',f'0:{index}',
                                        '-c:a','pcm_s24le',str(selected)],check=True,capture_output=True)
                        current=str(selected)
                master[field]=media.add(current,kind,max(0,(dur-1)/fps),field)['src']
        if (not preview and master.get('editorial_review')
                and not any(s['borrow'].get('aspect','motion')=='motion' and shot_direction.motion_viewed(s['borrow']) for s in master['shots'])):
            raise ValueError('A motion edit requires a continuous comparison for the actual borrowed action.')
        master['cutaways'] = field_cuts(plan.get('cutaways',[]),media,fps,dur,master.get('base_video'))
        _label_project_inputs(master['shots'])
        _visibility(master['shots'],dur,master.get('base_video'))
        master['recipes']={k:recipes[k]['layers'] for k in dict.fromkeys(ids)}
        master['assets']=media.assets
        master['distinct_footage_origins']=footage_count(master['shots'],master['cutaways'])
        master['coverage']={'required':list(recipes),'included':list(dict.fromkeys(ids)),'missing':missing,
            'diagnostic':[{'id':r['id'],'rule':r['scope']} for r in diagnostic],
            'scope':'internal-preview' if preview else 'all-submitted-films','rendered':False}
        write(staging/'reference-timeline.json',master)
        (staging/'episode.js').write_text(episode_data(master),encoding='utf-8')
        for name in ('index.html','player.js','shot-motion.js'):
            shutil.copyfile(origin/name,staging/name)
        for name in ('agent-editorial.js','motion-core.js'):
            shutil.copyfile(catalog.root/'assets/agent-editorial'/name,staging/name)
        shutil.copyfile(catalog.root/'assets/qiaomu-fonts/fonts/notosans.woff2',staging/'Noto.woff2')
        write(staging/'library-project.json',{'id':'submitted-reference-cut','engine':'html-seek','entry':'index.html',
            'fps':fps,'width':w,'height':h,'duration':dur/fps,'frames':dur,'reference_sources':master['coverage']['included']})
        if output.exists():
            raise ValueError('Output appeared during build.')
        staging.rename(output)
    if not preview:
        from edit_session import note_build
        note_build(plan_path, output, master['source_plan_sha256'])
    return {'project':str(output),'entry':str(output/'index.html'),'included':len(set(ids)),
            'required':len(recipes),'missing':missing,'frames':dur,'rendered':False}


def render(project,output,scale=1):
    import library_html_runner
    from reference_project_input import credit
    project,output=Path(project).resolve(),Path(output).resolve()
    data=read(project/'reference-timeline.json')
    if data.get('editorial_review') and data['coverage']['scope']=='all-submitted-films':
        from editorial_proofs import check
        check(project,data)
    if output.exists() or not output.parent.is_dir() or output.suffix.lower()!='.mp4':
        raise ValueError('Choose a new .mp4 in an existing directory.')
    if data.get('schema')!=SCHEMA:
        raise ValueError('Unknown reference timeline.')
    if (project/'episode.js').read_text(encoding='utf-8')!=episode_data(data):
        raise ValueError('The player and editable timeline differ. Rebuild from the current plan.')
    config=read(project/'library-project.json')
    if any(config.get(k)!=data[k] for k in ('fps','frames','width','height')) or config.get('duration')!=data['frames']/data['fps']:
        raise ValueError('The renderer and timeline must share the same master clock and dimensions.')
    for name,meta in data['assets'].items():
        path=(project/name).resolve(strict=True)
        if not path.is_relative_to(project) or digest(path)!=meta['sha256']:
            raise ValueError('The bound episode media changed: '+name)
    with tempfile.TemporaryDirectory(prefix='.reference-export-',dir=output.parent) as temp:
        silent=Path(temp)/'picture.mp4'
        report=library_html_runner.run(project,'render',silent,scale)
        observed=report.get('reference_frames',{})
        if set(observed)!=set(data['coverage']['included']):
            raise ValueError('A source did not reach the rendered pixels.')
        for ident, layers in data['recipes'].items():
            hidden={layer['slot'] for layer in layers}-set(observed[ident]['slots'])
            if hidden:
                raise ValueError('Required material was hidden throughout: '+ident+' / '+', '.join(sorted(hidden)))
        nested={}
        for shot in data['shots']:
            for item in shot['inputs'].values():
                info=item.get('from_project')
                if info:
                    code=credit(info)
                    intervals=report.get('reference_project_frames',{}).get(code)
                    if not intervals:
                        raise ValueError('Bound implementation never entered a visible slot: '+code)
                    nested[code]={**info,'intervals':intervals}
        final=silent
        if data.get('narration'):
            final=Path(temp)/'voiced.mp4'
            proc=subprocess.run(['ffmpeg','-v','error','-nostdin','-i',str(silent),'-i',str(project/data['narration']),
                '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-t',str(data['frames']/data['fps']),
                '-movflags','+faststart',str(final)],capture_output=True)
            if proc.returncode or not any(s['codec_type']=='audio' for s in probe(final)['streams']):
                raise ValueError('Could not mux the original narration: '+proc.stderr.decode(errors='replace')[-500:])
        if output.exists():
            raise ValueError('Output appeared during render.')
        fingerprint=digest(final)
        final.rename(output)
    result={'file':str(output),'sha256':fingerprint,'timeline_sha256':digest(project/'reference-timeline.json'),
            'reference_frames':observed,'missing':data['coverage']['missing'],
            'source_implementations':nested,
            'complete_reference_coverage':not data['coverage']['missing'],'scope':data['coverage']['scope'],
            'audio':'original-master' if data.get('narration') else 'silent','frames':data['frames']}
    write(project/'reference-render.json',result)
    return result


def verify(project, media, plan=None):
    """Connect the final encoded file to its visible-source receipt and master timeline."""
    from reference_project_input import credit
    project, media = Path(project).resolve(), Path(media).resolve(strict=True)
    timeline = project/'reference-timeline.json'
    data, receipt = read(timeline), read(project/'reference-render.json')
    if data.get('schema')!=SCHEMA or receipt['timeline_sha256']!=digest(timeline) or receipt['sha256']!=digest(media):
        raise ValueError('The video, timeline and visible-frame evidence do not match.')
    if plan is not None and digest(Path(plan).resolve(strict=True))!=data['source_plan_sha256']:
        raise ValueError('The cut came from another edit plan.')
    if (project/'episode.js').read_text(encoding='utf-8')!=episode_data(data):
        raise ValueError('The editable player no longer represents the verified timeline.')
    required=set(rules(video_sources.Catalog())[0])
    observed=receipt['reference_frames']
    missing=sorted(required-set(observed))
    if missing or data['coverage']['scope']!='all-submitted-films':
        raise ValueError('Partial reference export: '+', '.join(missing))
    for key, layers in data['recipes'].items():
        actual=observed[key]
        if set(actual['slots'])!={layer['slot'] for layer in layers} or not actual['intervals']:
            raise ValueError('Incomplete visible material evidence: '+key)
        if not all(0<=a<b<=data['frames'] for a,b in actual['intervals']):
            raise ValueError('A source falls outside the encoded master: '+key)
    implementations = {credit(item['from_project']): item['from_project']
                       for shot in data['shots'] for item in shot['inputs'].values() if item.get('from_project')}
    trace = receipt.get('source_implementations', {})
    if set(trace) != set(implementations):
        raise ValueError('Library implementations differ between the timeline and visible-frame evidence.')
    for key, info in implementations.items():
        row = trace[key]
        if any(row.get(field) != value for field, value in info.items()) or not row.get('intervals') or not all(
                type(a) is int and type(b) is int and 0 <= a < b <= data['frames'] for a, b in row['intervals']):
            raise ValueError('Invalid visible implementation evidence: ' + key)
    streams=probe(media)['streams']
    video=next((s for s in streams if s['codec_type']=='video'),{})
    if int(video.get('nb_frames',0))!=data['frames'] or (data.get('narration') and not any(s['codec_type']=='audio' for s in streams)):
        raise ValueError('The encoded picture or original audio differs from the master clock.')
    from collections import Counter
    comparisons=Counter((s.get('borrow') or {}).get('basis','unrecorded')+'/'+(s.get('borrow') or {}).get('seen','unrecorded') for s in data['shots'])
    return {'technical_passed':True,'complete_reference_coverage':True,'visible_sources':len(observed),
            'recorded_comparisons':dict(comparisons),'whole_film_sound_review':'not-certified','nle_editability':'not-tested',
            'visible_material_roles':sum(len(r['slots']) for r in observed.values()), 'frames':data['frames'],
            'visible_library_capabilities': sorted({i['capability'] for i in implementations.values()}),
            'audio':receipt['audio'],'aesthetic_approval':False,'sha256':receipt['sha256']}


def main(argv):
    parser=argparse.ArgumentParser(description=__doc__)
    sub=parser.add_subparsers(dest='cmd',required=True)
    p=sub.add_parser('plan');p.add_argument('--script',required=True);p.add_argument('--out',required=True)
    p=sub.add_parser('compose');p.add_argument('--plan',required=True);p.add_argument('--out',required=True);p.add_argument('--preview',action='store_true')
    p=sub.add_parser('render');p.add_argument('--project',required=True);p.add_argument('--out',required=True);p.add_argument('--scale',type=float,default=1)
    p.add_argument('--brief', action='store_true', help='Keep per-frame evidence on disk and print output counts.')
    p=sub.add_parser('motion');p.add_argument('--id',required=True);p.add_argument('--from',dest='start',type=float);p.add_argument('--to',dest='end',type=float)
    p=sub.add_parser('review');p.add_argument('--project',required=True);p.add_argument('--media',required=True)
    p.add_argument('--serve',action='store_true',help='Play on one loopback origin, including nested reference projects.')
    p.add_argument('--port',type=int,default=0)
    p=sub.add_parser('hyperframes');p.add_argument('--project',required=True);p.add_argument('--shot',type=int,required=True);p.add_argument('--out',required=True)
    p=sub.add_parser('hierarchy');p.add_argument('--cues',required=True,type=Path);p.add_argument('--out',required=True,type=Path)
    p=sub.add_parser('proofs');p.add_argument('--project',required=True);p.add_argument('--opening-end',type=float)
    p.add_argument('--bridge',type=float,nargs=2);p.add_argument('--scale',type=float,default=1)
    p.add_argument('--captions',type=Path);p.add_argument('--alternative')
    p.add_argument('--observed',choices=['phone-frames','normal-picture','normal-sound']);p.add_argument('--note')
    args=parser.parse_args(argv)
    try:
        if args.cmd=='render':
            result=render(args.project,args.out,args.scale)
            try:
                result['review'] = shot_direction.review(args.project, args.out)
            except (OSError, ValueError) as error:
                result.update(review=None, review_error=str(error))
            if args.brief:
                result = {k: result[k] for k in ('file','sha256','complete_reference_coverage','frames','audio','review','review_error') if k in result} | {
                    'visible_sources': len(result['reference_frames']),
                    'evidence': str(Path(args.project) / 'reference-render.json')}
        elif args.cmd=='proofs':
            import editorial_proofs
            result=editorial_proofs.run(args.project,args.opening_end,args.bridge,args.scale,args.captions,
                                        args.alternative,args.observed,args.note)
        elif args.cmd=='review':
            if args.serve:
                with shot_direction.review_server(args.project, args.media, port=args.port) as server:
                    print(json.dumps({'url':f'http://127.0.0.1:{server.server_port}/'}),flush=True)
                    try:
                        server.serve_forever()
                    except KeyboardInterrupt:
                        pass
                return 0
            result = {'review': shot_direction.review(args.project, args.media)}
        elif args.cmd=='hierarchy':
            import hyperframes_shot
            result=hyperframes_shot.hierarchy(ROOT,args.cues,args.out)
        elif args.cmd=='hyperframes':
            result = shot_direction.hyperframes(args.project, args.shot, args.out)
        else:
            catalog=video_sources.Catalog()
            if args.cmd=='plan':
                from video_routing import Router
                result=scaffold(Router(catalog),args.script,args.out)
            elif args.cmd=='compose':
                result=compose(catalog,args.plan,args.out,preview=args.preview)
            else:
                result=motion(catalog,args.id,args.start,args.end)
        print(json.dumps(result,ensure_ascii=False,indent=2))
        return 0
    except (OSError,ValueError,KeyError,TypeError) as exc:
        parser.exit(2,str(exc)+'\n')
