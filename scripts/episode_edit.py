"""Persistent script-led edit decisions, shared by the built-in and external renderers."""
import hashlib
import json
import math
import os
from pathlib import Path

import editing_library as lib
from edit_session import plan_lock, write_atomic
from reference_edits import digest, read
from selection import source_segments

STATE = 'episode-edit.json'
JOBS = ('keep', *lib.FUNCTIONS)


def words(value, label):
    if not isinstance(value, str) or not value.strip():
        raise ValueError('请填写'+label)
    return value.strip()


def signature(value):
    return hashlib.sha256(json.dumps(value,sort_keys=True,ensure_ascii=False).encode('utf8')).hexdigest()


def local(folder, path):
    p = Path(path).expanduser()
    return (folder/p).resolve(strict=True)


def relative(folder, path):
    path = Path(path).resolve()
    try:
        return os.path.relpath(path, folder).replace(os.sep,'/')
    except ValueError:  # Windows resources on another drive
        return str(path)


def interval(value):
    if (not isinstance(value,(list,tuple)) or len(value)!=2 or not all(type(x) in (int,float) and math.isfinite(x) for x in value)
            or not 0 <= value[0] < value[1]):
        raise ValueError('需要真实、递增的入出点秒数。')
    return list(value)


def initialise(folder, script, presenter=None):
    folder, script = Path(folder).resolve(), Path(script).resolve(strict=True)
    folder.mkdir(exist_ok=True,parents=True)
    with plan_lock(folder):
        ensure_project_entry(folder)
        if (folder/STATE).exists():
            existing = read(folder/STATE)
            if existing['script_sha256'] != digest(script):
                raise ValueError('工程已有另一版口播。保留原工程并为新稿指定目录。')
            return
        units = source_segments(script.read_text(encoding='utf-8-sig'))
        if not units:
            raise ValueError('口播稿为空。')
        board = {'schema':'ui-motion-fusion/episode@1','script_sha256':digest(script),'script':relative(folder,script),
                 'synopsis':None,'units':[{**u,'revision':0} for u in units], 'outputs':[], 'references':{},
                 'source_media':relative(folder,presenter) if presenter else None}
        write_atomic(folder/STATE,board)


def ensure_project_entry(folder):
    """Leave the continuation command where an editor opening only the project will look."""
    folder=Path(folder).resolve()
    guide=folder/'AGENTS.md'
    body=('# 续剪本期口播\n\n本目录的 episode-edit.json 是本期剪辑记录。修改现有镜头先在本目录运行 '
          '`python -B -X utf8 continue_edit.py resume --at 00:09.00`（换成本期时码），或使用 --shot 2。'
          '保留旧母版，将本次源码、变更的镜头和新母版写回此工程。\n\n'
          '内置剪法只改该镜 inputs，按返回的 revision 运行 trial，再 deliver 到新文件。'
          '外部工具只渲染目标镜头；取得修订母版后，将改过的源码存回这里，运行 '
          '`python -B -X utf8 continue_edit.py revise --unit U002 --media 修订母版.mp4 --implementation 实际改过的源码`。'
          '该命令核对其余画面与原声，更新这一镜及其观看缺口。最后重新 resume 核对新版本。'
          '需要给用户一份单独的 MP4 时，可另复制已登记的母版。\n')
    if guide.exists() and guide.read_text(encoding='utf-8-sig',errors='replace')!=body:
        guide=folder/'继续剪辑.md'
    if not guide.exists():
        with guide.open('x',encoding='utf8') as f:f.write(body)
    runner=folder/'continue_edit.py'
    if not runner.exists():
        with runner.open('xb') as f:f.write((lib.ROOT/'assets/reference-edits/continue_edit.py').read_bytes())
    hint=folder/'editorial'/'skill-location.json'
    if not hint.exists():
        hint.parent.mkdir(exist_ok=True,parents=True)
        write_atomic(hint,{'skill':relative(folder,lib.ROOT)})


def unit_for(board, key):
    found = next((u for u in board['units'] if u['id']==key),None)
    if not found:
        raise ValueError('未知原句编号 '+str(key))
    return found


def whole_read(board):
    return bool(board['synopsis']) and all(u.get('decision') for u in board['units'])


def guarded(board, key, rev=None):
    u = unit_for(board,key)
    if rev is not None and rev != u['revision']:
        raise ValueError('这镜已更新。请 resume 后按新 revision 修改。')
    return u


def decide(board, data):
    synopsis = words(data.get('synopsis') or board['synopsis'],'整段的核心问题和回答')
    for key, parts in data.get('split',{}).items():
        u=unit_for(board,key)
        if (u.get('decision') or not isinstance(parts,list) or len(parts)<2 or
                any(not isinstance(p,str) or not p.strip() for p in parts) or ''.join(parts)!=u['quote']):
            raise ValueError('仅可在选材前按原文连续拆句；拼合后须逐字相同。')
        start=u['span']['start'];new=[]
        for i,quote in enumerate(parts,1):
            new.append({'id':f'{key}.{i}','quote':quote,'span':{'start':start,'end':start+len(quote)},'revision':0})
            start+=len(quote)
        index=board['units'].index(u)
        board['units'][index:index+1]=new
    rows = data.get('units')
    if not isinstance(rows,list) or not rows or len({r['id'] for r in rows})!=len(rows):
        raise ValueError('每条原句标一次用途。')
    for row in rows:
        u = guarded(board,row['id'],row.get('revision'))
        why = words(row.get('why'),'这句话要让观众看懂什么')
        if row.get('job') not in JOBS:
            raise ValueError('job 应为 '+', '.join(JOBS))
        d = {'job':row['job'],'why':why}
        if 'seconds' in row:d['seconds']=interval(row['seconds'])
        if row.get('proof'):d['proof']=True
        if d!=u.get('decision'):
            if u.get('decision') and row.get('revision')!=u['revision']:
                raise ValueError('修改已有判断需要该镜当前 revision。')
            for key in ('candidates','choice','trial','review'):
                u.pop(key,None)
            u.update(decision=d, revision=u['revision']+1)
    board['synopsis'] = synopsis


def choices(board, u, ident=None, offset=0):
    if not whole_read(board):
        raise ValueError('先读完全稿，给每条原句登记观众问题或留真人的理由。')
    ids = lib.options(u)
    if offset<0:
        raise ValueError('offset 不能为负数。')
    keys = [ident] if ident else ids[offset:offset+3]+['original']
    if any(k!='original' and k not in ids for k in keys):
        raise ValueError('该条目没有可调用的投稿剪法。')
    result = [lib.card(k) for k in keys]
    u['candidates'] = sorted(set(u.get('candidates',[]))|set(keys))
    return {'unit':u['id'],'quote':u['quote'][:720],'quote_length':len(u['quote']),'decision':u['decision'],'cards':result,
            'next_offset':offset+3 if not ident and offset+3<len(ids) else None,
            'choose':'比较具体剪法后 direct -- choose；原画面足够就选 original。'}


def choose(board, u, ident, alternative, why, rev, aspect='motion'):
    if not whole_read(board):
        raise ValueError('整稿仍有未判断的原句。')
    if u.get('choice') and rev!=u['revision']:
        raise ValueError('修改已选手法需要当前 revision。')
    why = words(why,'取舍理由和本期材料能证明什么')
    if ident!='original' or alternative:
        if ident not in u.get('candidates',[]) or alternative not in u.get('candidates',[]):
            raise ValueError('先用 options 看所比较的两个候选，再记录取舍。')
        if lib.card(ident)['mechanism']==lib.card(alternative)['mechanism']:
            raise ValueError('两种候选用了同一剪法。比较不同动作或原画面。')
    if ident=='original' and u['decision']['job']!='keep' and not alternative:
        raise ValueError('这句需要解释。记录比较过的素材和决定保留原画面的原因。')
    c = {'id':ident,'alternative':alternative,'why':why,'implementation':lib.card(ident)['implementation'],
         'aspect':'original' if ident=='original' else aspect}
    if u.get('choice')!=c:
        u.update(choice=c,revision=u['revision']+1)
        u.pop('trial',None)
        u.pop('review',None)
    return c


def reference_for(board, source, u=None):
    latest=board['references'].get(source,{})
    if latest.get('kind')=='stills':
        return latest
    return (u or {}).get('auditions',{}).get(source) or latest


def current_reference(folder, board, source, u=None):
    import episode_media as media
    ref = reference_for(board,source,u)
    if not ref:
        return 'unseen'
    if ref.get('kind')=='stills':
        return 'layout-color-only' if media.matches(folder,ref['files']) else 'reference-changed'
    if not media.reference_intact(folder,ref):
        return 'reference-changed'
    scope = ref.get('observation',{}).get('mode','unseen')
    return scope


def gaps(folder, board, u):
    import episode_media as media
    if not u.get('decision'):
        return ['read-script']
    choice = u.get('choice')
    if not choice:
        return ['select']
    missing=[]
    if choice['id']!='original':
        observed=current_reference(folder,board,choice['id'],u)
        if choice.get('aspect','motion')=='motion' and observed!='continuous-observed':
            missing.append('motion-unverified')
        elif choice.get('aspect') in ('layout','color') and observed not in ('continuous-observed','frames','layout-color-only'):
            missing.append('appearance-unverified')
    trial=u.get('trial')
    if not trial or not media.trial_intact(folder,trial):
        return missing+['current-material-trial']
    if trial.get('route')=='custom' and choice['id']!='original' and not (trial.get('adaptation') or '').strip():
        missing.append('custom-borrow-untraced')
    review=u.get('review',{})
    if (review.get('trial')!=trial['sha256'] or review.get('result')!='pass' or
        review.get('reference_key')!=reference_for(board,choice['id'],u).get('key')):
        missing.append('trial-review' if review.get('result')!='revise' else 'revise-trial')
    return missing


def reading_page(units, offset, quote_offset):
    if quote_offset<0 or (offset<len(units) and quote_offset>=len(units[offset]['quote'])):
        raise ValueError('原句续读位置超出范围。')
    rows=[];budget=2300
    for i in range(offset,min(offset+12,len(units))):
        u=units[i];start=quote_offset if i==offset else 0
        snippet=u['quote'][start:start+budget]
        rows.append({'id':u['id'],'quote':snippet,**({'decision':u['decision']} if u.get('decision') else {})})
        if start+len(snippet)<len(u['quote']):return rows,i,start+len(snippet)
        budget-=len(snippet)
        if not budget:break
    next_unit=offset+len(rows)
    return rows,next_unit if next_unit<len(units) else None,0


def status(folder, board, shot=None, at=None, offset=0, quote_offset=0):
    import episode_media as media
    if offset<0:
        raise ValueError('offset 不能为负数。')
    out={'project':str(folder),'state':STATE,'synopsis':board['synopsis']}
    if shot is not None or at is not None:
        if at is not None:
            from caption_edit import milliseconds
            t=milliseconds(at)/1000
            matched=[u for u in board['units'] if u.get('trial') and u['trial']['seconds'][0]<=t<u['trial']['seconds'][1]]
            if not matched:
                raise ValueError('该时间没有已绑定的镜头。')
            u=matched[0]
        else:
            if str(shot).isdigit():
                n=int(shot)
                if not 1<=n<=len(board['units']):raise ValueError('该镜头序号不存在。')
                u=board['units'][n-1]
            else:u=unit_for(board,shot)
        src=(u.get('choice') or {}).get('id')
        shot={k:v for k,v in u.items() if k not in ('auditions','review_history','prior_trials')}
        parts,_,continuation=reading_page([u],0,quote_offset)
        shot['quote']=parts[0]['quote'];shot['next_quote_offset']=continuation or None
        return {**out,'shot':shot,'reference':reference_for(board,src,u),'remaining':gaps(folder,board,u)}
    if not whole_read(board):
        rows,following,continuation=reading_page(board['units'],offset,quote_offset)
        last=board['outputs'][-1] if board['outputs'] else None
        exported=bool(last and media.matches(folder,[last['media']]))
        return {**out,'stage':'exported' if exported else 'read-script','total_units':len(board['units']),
                'exported':exported,'completed':False,'pending':['read-script','select','current-material-trial'],
                'original_voice':'有可用的听审工具时实际听原声。只支持文字或图像的窗口使用原始音轨、已对齐字幕与播放器继续剪，交付登记听审受限。直接把音频送入不支持音频的模型会中断该窗口。',
                'units':rows,'next_offset':following,'next_quote_offset':continuation,
                'next':'读完本页原句及后续页。direct -- decide --project P --file 判断.json。格式见 references/edit-an-episode.md。'}
    issues={u['id']:gaps(folder,board,u) for u in board['units']}
    pending={k:v for k,v in issues.items() if v}
    last=board['outputs'][-1] if board['outputs'] else None
    exported=bool(last and media.matches(folder,[last['media']]))
    bound=bool(exported and last.get('cut')==cut_signature(board))
    from episode_proofs import current
    proof_ok=(current(board) and (board['proofs'].get('inspection') or {}).get('scope')=='normal-sound')
    completed=bool(bound and not pending and proof_ok and last.get('conform') and last.get('full_review',{}).get('mode')=='normal-sound')
    first=next(iter(pending),None)
    return {**out,'stage':'complete' if completed else ('exported' if exported else ('edit' if pending else 'assemble')),
            'exported':exported,'current_cut_exported':bound,'completed':completed,'full_review':(last or {}).get('full_review'),
            'current_shot':first, 'proof_first':proof_units(board), 'proofs_reviewed':proof_ok,
            'pending':dict(list(pending.items())[offset:offset+12]),'pending_count':len(pending),
            'next':'按 current_shot 用 resume --shot 定位；先 options 选材，watch 看动作，trial 绑定本期原声，review 记录返修。' if pending else
            '用 deliver 合成，或 register 登记外部成片。原速带声看过整片后用 finish-review。'}


def cut_signature(board):
    return signature([[u['id'],u.get('decision'),u.get('choice'),u.get('trial',{}).get('sha256'),
                       u.get('trial',{}).get('seconds')] for u in board['units']])


def proof_units(board):
    rows=board['units']
    opening=[u['id'] for u in rows if (u.get('decision') or {}).get('seconds',[99])[0]<10] or [rows[0]['id']]
    explicit=[u for u in rows if u.get('decision',{}).get('proof')]
    if explicit:
        hardest=explicit
    else:
        priority=('handoff','cause','compare','operate','hierarchy','focus')
        candidates=[u for job in priority for u in rows if u.get('decision',{}).get('job')==job]
        hardest=candidates[:1]
    for u in hardest:
        i=rows.index(u)
        opening.append(u['id'])
        if u['decision']['job']=='handoff':
            opening.extend(x['id'] for x in rows[max(0,i-1):i+2])
    return list(dict.fromkeys(opening))
