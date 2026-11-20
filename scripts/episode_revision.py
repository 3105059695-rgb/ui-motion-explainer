"""Bring a one-shot external revision back to the original episode and preserve the older master."""
from copy import deepcopy
import os
from pathlib import Path
import shutil
import tempfile

import episode_edit as ed
import episode_export as export
import episode_media as media
import reference_edits as edits


def adopt(folder,board,u,path,implementation=None,expected=None):
    if expected is not None:ed.guarded(board,u['id'],expected)
    prior=u.get('trial')
    if not prior:raise ValueError('单镜修订需要已登记的原镜头。')
    source=ed.local(folder,path)
    # Reject changes to other pictures or the original narration before touching the edit.
    proof=export.conform(folder,board,source,replacing=u['id'])
    before={row['path']:row['sha256'] for row in prior['sources']}
    previous=prior['inputs'].get('custom',{})
    entry=ed.local(folder,implementation or previous.get('implementation') or '')
    if not entry.is_file():raise ValueError('请提供这次实际使用的可编辑实现文件。')
    if not entry.is_relative_to(folder):
        raise ValueError('把实际修订的源码保存在原工程，再提供 --implementation。')
    actual=ed.relative(folder,entry)
    assets=previous.get('assets') or [row['path'] for row in prior['sources'] if row!=prior['audio']]
    if (actual in before and before[actual]==edits.digest(entry) and
        all(before.get(p)==edits.digest(ed.local(folder,p)) for p in assets)):
        raise ValueError('本镜的可编辑源码和素材仍是旧版。请把修改保存到原工程后再登记。')
    if source.suffix.lower() not in edits.VIDEO:raise ValueError('修订母版需要视频文件。')
    target=source
    if not source.is_relative_to(folder):
        target=folder/('revision-'+edits.digest(source)[:16]+source.suffix.lower())
        if target.exists() and edits.digest(target)!=edits.digest(source):raise ValueError('修订版文件名冲突。')
        if not target.exists():
            with tempfile.TemporaryDirectory(dir=folder) as tmp:
                staging=Path(tmp)/target.name;shutil.copy2(source,staging);os.replace(staging,target)
    spec=deepcopy(prior['inputs'])
    spec['revision']=u['revision']
    spec['custom']={'clip':ed.relative(folder,target),'in':prior['seconds'][0],'implementation':actual,
                    'assets':assets,'adaptation':previous.get('adaptation','')}
    trial=media.make_trial(folder,board,u,spec)
    result=export.register(folder,board,target,'single-shot external revision')
    result['revised_unit']=u['id'];result['unchanged_picture_ranges']=proof['shots']
    result['new_trial']=trial['clip']
    return result
