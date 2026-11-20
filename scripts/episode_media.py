"""Bind moving evidence and real, replaceable shot media to one episode timeline."""
import hashlib
import json
import math
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile
from urllib.parse import urlsplit

import editing_library as lib
import episode_edit as ed
import reference_edits as edits
from edit_session import write_atomic
from video_sources import Catalog, ROOT


def file_fact(folder, path):
    return {'path':ed.relative(folder,path),'sha256':edits.digest(Path(path))}


def matches(folder, facts):
    try:
        return all(edits.digest(ed.local(folder,f['path']))==f['sha256'] for f in facts)
    except (ValueError, OSError, KeyError):
        return False


def trial_intact(folder, trial):
    return matches(folder,[{'path':trial['clip'],'sha256':trial['sha256']},*trial['sources']])


def reference_intact(folder, ref):
    try:
        src=Path(ROOT)/ref['source_file']
        return (edits.digest(src)==ref['source_sha256'] and edits.digest(reference_clip(folder,ref))==ref['clip']['sha256']
                and all(edits.digest(Path(ROOT)/f['path'])==f['sha256'] for f in ref.get('dependencies',[])))
    except (OSError,KeyError):
        return False


def movie(path):
    info=edits.probe(path)
    return float(info['format']['duration']), {s['codec_type'] for s in info['streams']}


def ff(*args):
    result=subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True)
    if result.returncode:
        raise ValueError('FFmpeg: '+result.stderr.decode('utf-8','replace')[-1200:])
    return result.stdout


def page(folder, name, title, unit, items, why=''):
    folder.mkdir(exist_ok=True,parents=True)
    payload={'title':title,'quote':unit['quote'],'why':why,'items':items,'receipt':name+'-playback'}
    payload['binding']=ed.signature([{k:v for k,v in item.items() if k not in ('url','urls','label')} for item in items])
    text=(ROOT/'assets/reference-edits/compare-episode.html').read_text(encoding='utf8')
    target=folder/(name+'.html')
    target.write_text(text.replace('__EPISODE_PAYLOAD__',json.dumps(payload,ensure_ascii=False).replace('<','\\u003c')),encoding='utf8')
    return {'page':str(target),'binding':payload['binding'],'tracks':[{k:i[k] for k in ('key','range')} for i in items if i['kind']=='video']}


def segment_item(path, *, key, label, clock, span, audio=False):
    return {'kind':'video','key':key,'url':Path(path).resolve().as_uri(),'label':label,
            'range':span,'clock':clock,'audio':audio}


def reference_clip(folder,ref):
    return Path(ROOT)/ref['package_clip'] if ref.get('package_clip') else ed.local(folder,ref['clip']['path'])


def dependencies(entry):
    if entry.suffix.lower()!='.html':return []
    text=entry.read_text(encoding='utf-8-sig')
    urls=re.findall(r'''(?:src=["']|href=["']|fetch\(["']|url\(["']?)([^"')?#\s]+)''',text)
    files={(entry.parent/u).resolve() for u in urls if ':' not in u}
    return [{'path':p.relative_to(ROOT).as_posix(),'sha256':edits.digest(p)} for p in sorted(files)
            if p!=entry and p.is_relative_to(ROOT) and p.is_file()]


def ref_item(folder,ref):
    if ref['kind']=='stills':
        return {'kind':'stills','label':'静帧 · 构图与配色','urls':[ed.local(folder,f['path']).as_uri() for f in ref['files']],
                'key':ed.signature(ref['files'])}
    return segment_item(reference_clip(folder,ref),key=ref['key'],label=ref['label'],
                        clock=ref['seconds'],span=ref['player_range'])


def watch(folder, board, unit, ident, span=None, stills=None, reset=False):
    if ident not in unit.get('candidates',[]) or ident=='original':
        raise ValueError('先用 options 检索此镜头的真实候选。')
    import copy
    ref=copy.deepcopy(ed.reference_for(board,ident,unit))
    if stills:
        paths=[ed.local(folder,p) for p in stills]
        if any(p.suffix.lower() not in edits.VISUAL for p in paths):
            raise ValueError('只接受本地图片作为静帧。')
        ref={'kind':'stills','files':[file_fact(folder,p) for p in paths]}
    elif reset or not ref or span:
        item=lib.card(ident)['continuous_example']
        name,_,query=item['path'].partition('?')
        source=Path(ROOT)/name
        source=source.resolve(strict=True)
        is_html=source.suffix.lower() in ('.html','.htm')
        if not is_html:
            duration,streams=movie(source)
            if 'video' not in streams:
                raise ValueError('该文件没有连续画面。')
        else:
            duration=None
        allowed=item.get('range') or (item.get('suggested_seconds') if is_html else None)
        if span is None:
            span=allowed or item.get('suggested_seconds') or [0,duration or 5]
        lo,hi=ed.interval(list(span))
        if (allowed and (lo<allowed[0]-.001 or hi>allowed[1]+.001)) or (duration and hi>duration+.001):
            raise ValueError('观看时段超出了该来源实际可用范围。')
        source_sha=edits.digest(source)
        deps=dependencies(source)
        key=ed.signature([ident,item['basis'],source_sha,query,lo,hi,deps])
        if not ref or ref.get('key')!=key or not reference_intact(folder,ref):
            clip=source
            player_range=[lo,hi]
            if is_html:
                import library_html_runner
                cache=folder/'editorial'/'references'
                cache.mkdir(exist_ok=True,parents=True)
                clip=cache/(key[:20]+'.mp4')
                if not clip.exists():
                    with tempfile.TemporaryDirectory(dir=cache) as scratch:
                        tmp=Path(scratch)/'excerpt.mp4'
                        fps=15
                        cfg={'id':ident,'entry':item['path'],'fps':fps,'duration':hi,'width':768,'height':432,
                             'hide_render_controls':True}
                        library_html_runner.run(ROOT,'render',tmp,config_override=cfg,
                            frame_range=(math.floor(lo*fps),math.ceil(hi*fps)))
                        os.replace(tmp,clip)
                player_range=[0,hi-lo]
            ref={'key':key,'kind':'video','basis':item['basis'],'label':item['label'],'seconds':[lo,hi],
                 'source_file':str(source.relative_to(ROOT)) if source.is_relative_to(ROOT) else str(source),
                 'source_sha256':source_sha,'entry':item['path'],'clip':file_fact(folder,clip),'player_range':player_range}
            ref['dependencies']=deps
            if clip.is_relative_to(ROOT):ref['package_clip']=clip.relative_to(ROOT).as_posix()
    result=page(folder/'editorial'/unit['id'],'reference','参考区间',unit,[ref_item(folder,ref)],lib.card(ident)['change'])
    ref['viewer']=result
    board['references'][ident]=ref
    unit.setdefault('auditions',{})[ident]=ref
    return {**result,'source':ident,'source_kind':ref.get('basis',ref['kind']),'seconds':ref.get('seconds'),
            'actual_viewing':ed.current_reference(folder,board,ident),
            'record':'direct -- observe --unit '+unit['id']+' --id '+ident+' --file 观察.json。无法观察连续画面时填 limited 或 frames。'}


def presented(folder, viewer, path):
    rec=edits.read(ed.local(folder,path))
    if (rec.get('kind')!='presented-intervals@1' or rec.get('binding')!=viewer['binding']
        or not viewer['tracks'] or len(rec.get('samples',[]))!=len(viewer['tracks'])):
        raise ValueError('播放记录不属于当前文件和时段。')
    for track,seen in zip(viewer['tracks'],rec['samples']):
        a,b=track['range']
        if (track['key']!=seen.get('key') or not all(edits.number(seen.get(k)) for k in ('start','end','frames','max_gap','wall'))
            or abs(seen['start']-a)>.20 or not b-.20<=seen['end']<=b+.20 or seen['max_gap']>.34
            or seen['frames']<max(2,(b-a)*3) or seen['wall']<.79*(b-a)):
            raise ValueError('区间没有从入点到出点连续呈现。可重新播放或如实登记 limited。')
    return rec


def observe(folder, board, unit, ident, notes):
    ref=ed.reference_for(board,ident,unit)
    if not ref or ident not in unit.get('candidates',[]):
        raise ValueError('先取得本镜候选的连续对照。')
    mode=notes.get('mode')
    if mode not in ('limited','frames','continuous-observed'):
        raise ValueError('观看方式为 limited、frames 或 continuous-observed。')
    record={'mode':mode,'note':ed.words(notes.get('note'),'实际看到什么或环境限制')}
    if mode=='continuous-observed':
        if ref['kind']!='video' or not reference_intact(folder,ref):
            raise ValueError('静帧或已更换的文件无法登记动态观看。')
        record['playback']=presented(folder,ref['viewer'],notes['receipt'])
        record['phases']={k:ed.words(notes.get(k),k) for k in ('before','change','settle','handoff')}
        if len(set(record['phases'].values()))<4:
            raise ValueError('分别记录动作前、变化、停稳和交接。')
    ref['observation']=record
    unit.setdefault('auditions',{})[ident]=ref
    if ref.get('key')==board['references'].get(ident,{}).get('key'):
        board['references'][ident]=ref
    return {'source':ident,'viewing':ed.current_reference(folder,board,ident,unit),'observation':record}


def make_trial(folder, board, u, spec):
    c=u.get('choice')
    if not c:
        raise ValueError('先选择实际剪法或 original。')
    proofs=ed.proof_units(board)
    if u['id'] not in proofs and not u.get('trial'):
        for key in proofs:
            proof=ed.unit_for(board,key)
            verdict=(proof.get('review') or {}).get('result')
            if verdict!='pass' and not (verdict=='limited' and spec.get('draft') is True):
                raise ValueError('先对片头和最难段 '+', '.join(proofs)+' 做本期原声试剪并登记检查。环境受限时记录 limited，只能显式用 draft:true 制作内部稿。')
    if c.get('aspect') in ('layout','color') and not spec.get('custom'):
        raise ValueError('仅借外观时用 custom 接入实际原画面或自行实现的编排。')
    if u.get('trial') and spec.get('revision')!=u['revision']:
        raise ValueError('修改试剪需提供该镜当前 revision。')
    a,b=ed.interval(spec['seconds'])
    fps=spec.get('fps',24)
    size=spec.get('size',[960,540])
    if type(fps)!=int or not 1<=fps<=60 or len(size)!=2 or any(type(v)!=int or v<32 or v>4096 or v%2 for v in size):
        raise ValueError('请选择有效的整数帧率和偶数画幅。')
    audio=ed.local(folder,spec.get('audio') or board.get('source_media') or '')
    length,streams=movie(audio)
    if 'audio' not in streams or b>length+.06:
        raise ValueError('试剪原声时段超出了本期音轨。')
    n=round((b-a)*fps)
    if n<2:
        raise ValueError('试剪区间过短。')
    dest=folder/'editorial'/u['id']
    dest.mkdir(exist_ok=True,parents=True)
    sources=[file_fact(folder,audio)]
    impl=c['implementation']
    fields={'quote':u['quote'],'choice':c,'spec':spec}
    with tempfile.TemporaryDirectory(dir=dest) as temp:
        temp=Path(temp)
        w,h=size
        custom=spec.get('custom')
        if custom or c['id']=='original':
            if custom:
                entry=ed.local(folder,custom['implementation'])
                materials=[ed.local(folder,p) for p in custom['assets']]
                if not materials:raise ValueError('自定义合成需登记本期输入素材。')
                sources.extend(file_fact(folder,p) for p in [entry,*materials])
                impl=ed.relative(folder,entry)
                p=ed.local(folder,custom['clip'])
                offset=custom.get('in',0)
            else:
                p=ed.local(folder,spec.get('picture') or board.get('source_media') or '')
                offset=spec.get('in',a if p.suffix.lower() in edits.VIDEO else 0)
                impl=ed.relative(folder,p)
            if not edits.number(offset) or offset<0:raise ValueError('素材入点无效。')
            sources.append(file_fact(folder,p))
            if p.suffix.lower() in edits.VISUAL:
                args=['-loop','1','-framerate',str(fps)]
            else:
                d,streams=movie(p)
                if 'video' not in streams or offset+(b-a)>d+.10:
                    raise ValueError('素材时长无法覆盖本镜。')
                args=['-ss',str(offset)]
            silent=temp/'picture.mp4'
            ff(*args,'-i',p,'-an','-vf',f'fps={fps},scale={w}:{h}:force_original_aspect_ratio=decrease,pad={w}:{h}:(ow-iw)/2:(oh-ih)/2,setsar=1',
               '-frames:v',n,'-c:v','libx264','-preset','veryfast','-pix_fmt','yuv420p',silent)
        else:
            import library_html_runner
            inputs=spec['inputs']
            normalized={}
            for key,value in inputs.items():
                v=dict(value)
                if 'path' in v:
                    p=ed.local(folder,v['path']);sources.append(file_fact(folder,p));v['path']=str(p)
                if 'from_project' in v:
                    raise ValueError('已有实现工程请用 custom 登记真实片段、实现和本期素材。')
                normalized[key]=v
            script=temp/'line.txt';script.write_text(u['quote'],encoding='utf8')
            plan={'schema':edits.SCHEMA,'script':'line.txt','script_sha256':edits.digest(script),'fps':fps,
                  'width':w,'height':h,'duration_frames':n,'shots':[{'source_id':c['id'],'unit':'U001',
                  'inputs':normalized,'start_frame':0,'end_frame':n}]}
            if spec.get('beats') or spec.get('variant'):
                plan['shot_timing']={k:spec[k] for k in ('beats','variant') if k in spec}
            path=temp/'plan.json';write_atomic(path,plan)
            native=temp/'native'
            edits.compose(Catalog(ROOT),path,native,preview=True)
            silent=temp/'picture.mp4'
            report=library_html_runner.run(native,'render',silent)
            visible=report['reference_frames'].get(c['id'],{})
            if set(visible.get('slots',{}))!=set(normalized):
                raise ValueError('有输入在实际试剪中从未出现。')
            fields['visible_frames']=visible
            fields['recipe_sha256']=edits.digest(ROOT/edits.RECIPES)
        clip=temp/'trial.mp4'
        ff('-i',silent,'-ss',str(a),'-i',audio,'-map','0:v:0','-map','1:a:0','-t',str(n/fps),
           '-c:v','copy','-c:a','aac','-ar','48000','-ac','2','-movflags','+faststart',clip)
        sha=edits.digest(clip); target=dest/('trial-'+sha[:16]+'.mp4')
        if not target.exists():os.replace(clip,target)
    trial={'clip':ed.relative(folder,target),'sha256':sha,'seconds':[a,b],'fps':fps,'size':size,
           'implementation':impl,'sources':sources,'inputs':spec,'visible':fields.get('visible_frames'),
           'recipe_sha256':fields.get('recipe_sha256'),'audio':file_fact(folder,audio),'route':'custom' if custom else c['id']}
    if custom:
        trial['adaptation']=custom.get('adaptation','')
        trial['implementation_evidence']='给定源码与实际片段已绑定，动作等价性由连续对照核验'
    if u.get('trial'):
        u.setdefault('prior_trials',[]).append({k:u['trial'][k] for k in ('clip','sha256','seconds','inputs')})
    u['trial']=trial;u.pop('review',None);u['revision']+=1
    return compare(folder,board,u)


def timed_recipe(recipe, ident, timing, duration):
    from bisect import bisect_right
    import copy
    result=copy.deepcopy(recipe)
    if timing.get('variant'):
        if (ident,timing['variant'])!=('arun-membership','pair'):
            raise ValueError('未知的镜头变体。')
        del result['slots']['c']
        result['layers']=[l for l in result['layers'] if l['slot']!='c']
        for layer in result['layers']:
            if layer['slot']=='a':layer['keys'][-1]['at']=.5
            if layer['slot']=='b':
                layer['keys'][0]['at']=.5
                layer['keys'][-1]['at']=1.
    if timing.get('beats'):
        points=timing['beats']
        if (not isinstance(points,list) or any(not isinstance(p,list) or len(p)!=2 or not all(edits.number(x) for x in p) for p in points)
            or any(not 0<p[0]<1 or not 0<p[1]<duration for p in points)):
            raise ValueError('beats 填动作进度与本句内真实原声秒数。')
        chain=[[0,0],*points,[1,duration]]
        if any(a[0]>=b[0] or a[1]>=b[1] for a,b in zip(chain,chain[1:])):
            raise ValueError('动作与原声时钟都必须递增。')
        for layer in result['layers']:
            for key in layer['keys']:
                t=key['at'];i=min(len(chain)-2,bisect_right([p[0] for p in chain],t)-1)
                (x,a),(y,b)=chain[i:i+2]
                key['at']=(a+(t-x)*(b-a)/(y-x))/duration
    return result


def compare(folder, board, u, final=None):
    t=u['trial'];items=[]
    ref=ed.reference_for(board,u['choice']['id'],u)
    if ref:items.append(ref_item(folder,ref))
    a,b=t['seconds']
    if final:
        clip=ed.local(folder,final['path']);span=[a,b];key=final['sha256']
    else:
        clip=ed.local(folder,t['clip']);span=[0,min(b-a,movie(clip)[0])];key=t['sha256']
    items.append(segment_item(clip,key=key,label='本期成片' if final else '本期原声试剪',clock=[a,b],span=span,audio=True))
    result=page(folder/'editorial'/u['id'],'compare-final' if final else 'compare','参考与本期镜头',u,items,u['choice']['why'])
    if not final:t['viewer']=result
    return {**result,'unit':u['id'],'clip':str(clip),'episode_seconds':[a,b],'revision':u['revision'],'implementation':t['implementation']}


def review(folder, board, u, notes):
    trial=u.get('trial')
    if not trial or not trial_intact(folder,trial) or notes.get('trial_sha256')!=trial['sha256']:
        raise ValueError('请核对并填写正在检查的试剪 sha256。')
    result=notes.get('result')
    if result not in ('pass','revise','limited'):
        raise ValueError('试剪检查应填 pass、revise 或 limited。')
    record={'trial':trial['sha256'],'result':result}
    for k in ('readability','relation','cut'):
        record[k]=ed.words(notes.get(k),k)
    if result=='pass':
        current=compare(folder,board,u)
        record['playback']=presented(folder,current,notes['receipt'])
        if u['choice']['id']!='original' and u['choice'].get('aspect','motion')=='motion' and ed.current_reference(folder,board,u['choice']['id'],u)!='continuous-observed':
            raise ValueError('动作依据尚未得到连续观察。登记 limited 或 revise。')
    record['reference_key']=ed.reference_for(board,u['choice']['id'],u).get('key')
    if result=='revise':record['fix']=ed.words(notes.get('fix'),'具体返修动作')
    u.setdefault('review_history',[]).append(record);u['review']=record
    return record
