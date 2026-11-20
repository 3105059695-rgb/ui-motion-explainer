"""Render the opening and a difficult edit across its actual neighbouring cut points."""
import os
from pathlib import Path
import tempfile

import episode_edit as ed
import episode_media as media


def current(board):
    proof=board.get('proofs',{})
    sig=proof.get('shots',{})
    return bool(sig) and all((ed.unit_for(board,key).get('trial') or {}).get('sha256')==val for key,val in sig.items())


def run(folder,board,opening=None,bridge=None,notes=None):
    if notes is not None:
        proof=board.get('proofs',{})
        if not current(board):raise ValueError('样段所用镜头已变化。')
        if notes.get('scope') not in ('normal-sound','limited','frames','revise'):
            raise ValueError('记录实际的带声检查或限制。')
        if notes.get('scope')=='normal-sound':
            for clip in proof['clips']:
                media.presented(folder,clip['viewer'],notes['receipts'][clip['name']])
        proof['inspection']={'scope':notes['scope'],'note':ed.words(notes.get('note'),'片头是否立题、主体与字幕能否读清、交接是否成立')}
        return proof
    units=board['units'];timed=[u for u in units if u.get('trial')]
    if not timed:raise ValueError('先生成本期片头和难点镜头的试剪。')
    end=max(u['trial']['seconds'][1] for u in timed)
    target=min(opening if opening is not None else 10,end) if len(timed)==len(units) else (opening or 10)
    if not min(8,end)<=target<=min(12,end):
        raise ValueError('片头取实际 8–12 秒；更短的整片取全长。先补齐其中的试剪。')
    if bridge is None:
        hardest=next((u for u in units if u.get('decision',{}).get('proof')),None)
        if not hardest:
            hardest=next((u for job in ('handoff','cause','compare','operate','hierarchy','focus') for u in units if u.get('decision',{}).get('job')==job),timed[0])
        if not hardest.get('trial'):raise ValueError('先做最难镜头的试剪。')
        a,b=hardest['trial']['seconds'];bridge=[max(0,a-.65), min(end,b+.65)]
    ed.interval(list(bridge))
    ranges=[('opening',0,target)]
    if list(bridge)!=[0,target]:ranges.append(('transition',*bridge))
    out=folder/'editorial'/'proofs';out.mkdir(exist_ok=True,parents=True)
    shots={};clips=[]
    for name,lo,hi in ranges:
        pieces=[];last=lo
        for u in timed:
            t=u['trial'];a,b=t['seconds'];start=max(a,lo);stop=min(b,hi)
            if stop<=start:continue
            if abs(last-start)>.065 or not media.trial_intact(folder,t):
                raise ValueError('样段有未剪或已改变的镜头。')
            last=stop;pieces.append((u,t,start-a,stop-a));shots[u['id']]=t['sha256']
        if not pieces or abs(last-hi)>.065:raise ValueError('本次样段还缺原声时段内的试剪。')
        tag=ed.signature([name,lo,hi,[(t['sha256'],a,b) for _,t,a,b in pieces]])[:16]
        dest=out/(name+'-'+tag+'.mp4')
        if not dest.exists():
            with tempfile.TemporaryDirectory(dir=out) as work:
                temp=Path(work)/'clip.mp4';args=[];filters=[];labels=[]
                for i,(_,t,start,stop) in enumerate(pieces):
                    args+=['-i',ed.local(folder,t['clip'])]
                    filters.append(f'[{i}:v]trim=start={start}:end={stop},setpts=PTS-STARTPTS[v{i}]')
                    labels.append(f'[v{i}]')
                filters.append(''.join(labels)+f'concat=n={len(pieces)}:v=1:a=0[out]')
                media.ff(*args,'-ss',lo,'-i',ed.local(folder,pieces[0][1]['audio']['path']),'-filter_complex',';'.join(filters),
                         '-map','[out]','-map',f'{len(pieces)}:a:0','-t',hi-lo,'-c:v','libx264','-preset','veryfast',
                         '-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',temp)
                os.replace(temp,dest)
        fact=media.file_fact(folder,dest)
        clip=media.segment_item(dest,key=fact['sha256'],label='本期原声样段',clock=[lo,hi],span=[0,min(hi-lo,media.movie(dest)[0])],audio=True)
        unit=next((u for u,t,a,b in pieces if u.get('choice',{}).get('id')!='original'),pieces[0][0])
        ref=ed.reference_for(board,unit['choice']['id'],unit)
        viewer=media.page(out,name,'片头检查' if name=='opening' else '难点与前后剪点',unit,([media.ref_item(folder,ref)] if ref else [])+[clip],unit['choice']['why'])
        clips.append({'name':name,'seconds':[lo,hi],'file':fact,'viewer':viewer})
    old=board.get('proofs',{})
    record={'shots':shots,'clips':clips}
    if old.get('shots')==shots and [c['file'] for c in old.get('clips',[])]==[c['file'] for c in clips]:
        record['inspection']=old.get('inspection')
    board['proofs']=record
    return record
