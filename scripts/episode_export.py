"""Assemble cached episode shots or conform an external master's picture and audio."""
import array
import math
import os
from pathlib import Path
import shutil
import tempfile

import episode_edit as ed
import episode_media as media
import reference_edits as edits


def timeline(folder, board):
    shots=[u.get('trial') for u in board['units']]
    if not shots or not all(shots):
        raise ValueError('有镜头尚无带原声试剪。')
    first=shots[0]; end=0
    for t in shots:
        a,b=t['seconds']
        if abs(a-end)>1/first['fps'] or t['fps']!=first['fps'] or t['size']!=first['size'] or t['audio']!=first['audio']:
            raise ValueError('镜头需要在同一条原声上按序接续，画幅与帧率一致。')
        if not media.trial_intact(folder,t):raise ValueError('本期试剪或它绑定的输入已变化。')
        end=b
    return shots


def conform(folder, board, path):
    shots=timeline(folder,board)
    duration, streams=media.movie(path)
    fps=shots[0]['fps']
    if not {'video','audio'}<=streams or abs(duration-shots[-1]['seconds'][1])>max(.12,2/fps):
        raise ValueError('成片流或总时长与真实镜头时间不符。')
    report=[]
    for t in shots:
        a,b=t['seconds']
        def pixels(p,start):
            return media.ff('-ss',start,'-i',p,'-t',b-a,'-an','-vf','fps=5,scale=48:27:flags=area,format=gray','-f','rawvideo','pipe:1')
        x=pixels(ed.local(folder,t['clip']),0);y=pixels(path,a)
        n=min(len(x),len(y))
        if not n or abs(len(x)-len(y))>48*27 or sum(abs(v-w) for v,w in zip(x,y))/n>7:
            raise ValueError(f'{a:.2f}–{b:.2f} 秒的成片像素与已登记试剪不符。')
        report.append({'seconds':[a,b],'samples':n//(48*27),'trial':t['sha256']})
    def pcm(p):
        samples=array.array('h')
        samples.frombytes(media.ff('-i',p,'-t',shots[-1]['seconds'][1],'-vn','-ac',1,'-ar',4000,'-f','s16le','pipe:1'))
        return samples
    x=pcm(ed.local(folder,shots[0]['audio']['path']));y=pcm(path)
    n=min(len(x),len(y))
    if not n or abs(len(x)-len(y))>800:raise ValueError('成片声音时长与原声不符。')
    # Check each spoken interval independently so a replaced sentence cannot hide in a long file.
    for t in shots:
        a,b=(round(s*4000) for s in t['seconds'])
        left,right=x[a:b],y[a:b]
        energy=sum(v*v for v in left);target=sum(v*v for v in right)
        if energy:
            corr=sum(v*w for v,w in zip(left,right))/math.sqrt(max(1,energy*target))
            if corr<.85:raise ValueError('成片原声与登记的这句不符。')
        elif target>len(right)*64:raise ValueError('原声静音区出现了额外声音。')
    return {'picture':'5 fps luma comparison','audio':'per-shot mono PCM correlation','shots':report}


def register(folder,board,path,route):
    path=ed.local(folder,path)
    duration,streams=media.movie(path)
    if 'video' not in streams:raise ValueError('导出物没有视频轨。')
    fact=media.file_fact(folder,path)
    analysis=None;missing=[]
    try:analysis=conform(folder,board,path)
    except (OSError,ValueError,KeyError) as exc:missing.append(str(exc))
    last=board['outputs'][-1] if board['outputs'] else {}
    key=ed.cut_signature(board)
    out={'media':fact,'route':ed.words(route,'实际导出工具'),'cut':key,'seconds':duration,
         'conform':analysis,'conform_gaps':missing,'whole_film_sound_review':'unverified','nle_editability':'untested'}
    if last.get('media')==fact and last.get('cut')==key and last.get('full_review'):
        out['full_review']=last['full_review']
    if last.get('media')!=fact or last.get('cut')!=key:
        board['outputs'].append(out)
    else:
        board['outputs'][-1]=out
    links={}
    for u in board['units']:
        if u.get('trial') and u['trial']['seconds'][1]<=duration+.08:
            links[u['id']]=media.compare(folder,board,u,fact)['page']
    out['comparisons']={k:ed.relative(folder,v) for k,v in links.items()}
    full=media.segment_item(path,key=fact['sha256'],label='成片 · 原声',clock=[0,duration],span=[0,duration],audio=True)
    out['viewer']=media.page(folder/'editorial','whole','整片带声回看',{'quote':board.get('synopsis') or ''},[full])
    return {'export':out,'status':ed.status(folder,board)}


def assemble(folder,board,target,draft=False):
    shots=timeline(folder,board)
    pending={u['id']:ed.gaps(folder,board,u) for u in board['units']}
    if any(pending.values()) and not draft:
        raise ValueError('内部选材或试剪检查尚有缺口。修正后导出；需要可播放的内部稿时显式加 --draft。')
    if not draft:
        from episode_proofs import current
        if not current(board) or (board['proofs'].get('inspection') or {}).get('scope')!='normal-sound':
            raise ValueError('先用 direct -- proofs 看本期片头与最难段的前后剪点，登记实际带声检查。')
    output=(folder/target).resolve()
    if output.exists():raise ValueError('请指定新成片文件名，工程保留之前导出。')
    output.parent.mkdir(parents=True,exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as temp:
        temp=Path(temp)
        manifest=[]
        for i,t in enumerate(shots):
            clip=ed.local(folder,t['clip']);label=f'{i:05}.mp4'
            try:os.link(clip,temp/label)
            except OSError:shutil.copyfile(clip,temp/label)
            manifest.append('file '+label)
            manifest.append('duration '+str(t['seconds'][1]-t['seconds'][0]))
        text=temp/'cuts.txt';text.write_text('\n'.join(manifest)+'\n',encoding='ascii')
        new=temp/'master.mp4'
        media.ff('-f','concat','-safe','1','-i',text,'-i',ed.local(folder,shots[0]['audio']['path']),
                 '-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-ar','48000','-ac','2',
                 '-t',shots[-1]['seconds'][1],'-movflags','+faststart',new)
        if output.exists():raise ValueError('成片文件已存在。')
        os.replace(new,output)
    return register(folder,board,output,'native-assembly-draft' if draft else 'native-assembly')


def final_review(folder,board,notes):
    if not board['outputs']:raise ValueError('还没有已登记的导出。')
    out=board['outputs'][-1]
    if out['cut']!=ed.cut_signature(board) or not media.matches(folder,[out['media']]):
        raise ValueError('导出与当前镜头不符。')
    if notes.get('mode') not in ('normal-sound','frames','limited'):
        raise ValueError('请记录实际整片检查方式。')
    result={'mode':notes['mode'],'note':ed.words(notes.get('note'),'实际整片观看结果')}
    if result['mode']=='normal-sound':
        result['playback']=media.presented(folder,out['viewer'],notes['receipt'])
    out['full_review']=result
    return ed.status(folder,board)
