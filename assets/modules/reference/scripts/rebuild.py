"""Track, copy and render real per-case reconstructions. Original catalog remains reference data."""
import argparse, datetime, hashlib, json, shutil, subprocess, sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.stdout.reconfigure(encoding='utf-8')
CATALOG=ROOT/'references/catalog.json'
REGISTRY=ROOT/'references/rebuild-status.json'
LABELS={'queued':'待实现','building':'正在实现','implemented':'已有代码，待导出','verified-approximation':'已导出近似重建','user-approved':'用户认可'}

def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    temp=path.with_suffix(path.suffix+'.tmp')
    temp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    temp.replace(path)

def cases():return json.loads(CATALOG.read_text(encoding='utf-8'))['entries']

def item(key):
    rows=cases()
    if str(key).isdigit() and 1<=int(key)<=len(rows):return rows[int(key)-1]
    return next(e for e in rows if e['slug']==key)

def read():
    old=json.loads(REGISTRY.read_text(encoding='utf-8')) if REGISTRY.is_file() else {'entries':[]}
    known={e['slug']:e for e in old['entries']}
    old.setdefault('scope','230 case-specific editable source projects; references are not completions')
    old['entries']=[known.get(e['slug'],{'slug':e['slug'],'index':i,'title':e['title'],'status':'queued','label':LABELS['queued'],'project':None,'video':None,'comparison':None,'limitations':[]}) for i,e in enumerate(cases(),1)]
    return old

def save(doc):
    for row in doc['entries']:
        row['source_available']=bool(row.get('project') and (ROOT/row['project']/'index.html').is_file())
        for field in ('video','comparison','audio'):
            row[field+'_available']=bool(row.get(field) and (ROOT/row[field]).is_file())
    doc['updated_at']=datetime.datetime.now(datetime.timezone.utc).isoformat()
    doc['counts']={s:sum(e['status']==s for e in doc['entries']) for s in LABELS}
    doc['runnable']=sum(bool(e.get('project') and (ROOT/e['project']/'index.html').is_file()) for e in doc['entries'])
    doc['rendered']=sum(bool(e.get('video') and (ROOT/e['video']).is_file()) for e in doc['entries'])
    doc['all_implemented']=all(e['status'] in ('verified-approximation','user-approved') and e.get('project') and (ROOT/e['project']/'index.html').is_file() and all(e.get(k) and (ROOT/e[k]).is_file() for k in ('video','proof','comparison')) for e in doc['entries'])
    write(REGISTRY,doc)
    return doc

def relative(path):
    p=Path(path)
    p=p.resolve() if p.is_absolute() else (ROOT/p).resolve()
    if not p.is_relative_to(ROOT):raise ValueError('Registry assets must be inside the skill root')
    return p.relative_to(ROOT).as_posix()

def register(a):
    e=item(a.case);doc=read();row=next(r for r in doc['entries'] if r['slug']==e['slug'])
    if a.project:
        project=relative(a.project)
        for name in ['index.html','project.json']:
            if not (ROOT/project/name).is_file():raise ValueError('Missing implementation '+name)
        row['project']=project
    if a.video:
        video=relative(a.video)
        if not (ROOT/video).is_file():raise ValueError('Missing rendered video')
        row['video']=video
    if a.comparison:
        comparison=relative(a.comparison)
        if not (ROOT/comparison).is_file():raise ValueError('Missing source comparison')
        row['comparison']=comparison
    if a.proof:
        proof=relative(a.proof);evidence=json.loads((ROOT/proof).read_text(encoding='utf-8'))
        if evidence.get('full_decode')!='passed' or evidence.get('browser_errors') or evidence.get('request_errors'):
            raise ValueError('Failed technical proof')
        if evidence.get('checks') and not all(evidence['checks'].values()):raise ValueError('Failed seek proof')
        if not row.get('project') or not row.get('video'):raise ValueError('Need a source project and rendered video')
        row['proof']=proof
        audio_path=(evidence.get('audio_source') or {}).get('path')
        if audio_path and Path(audio_path).is_file():
            source=Path(audio_path);target=ROOT/row['project']/'assets/audio'/('reference-audio'+source.suffix)
            target.parent.mkdir(parents=True,exist_ok=True)
            if target.exists() and hashlib.sha256(target.read_bytes()).digest()!=hashlib.sha256(source.read_bytes()).digest():raise ValueError('Different preserved project audio exists')
            if source.resolve()!=target.resolve():shutil.copy2(source,target)
            row['audio']=target.relative_to(ROOT).as_posix()
            write(ROOT/row['project']/'project-audio.json',{'file':target.relative_to(ROOT/row['project']).as_posix(),'source':str(source),'reference_slug':e['slug'],'author':e['handle'],'ownership':'original creator; reference comparison audio, not newly authored sound'})
    status=a.status or ('verified-approximation' if a.proof else 'implemented' if a.project else row['status'])
    if status=='verified-approximation' and not (row.get('proof') and row.get('comparison')):
        raise ValueError('Rendered status needs technical proof and source comparison')
    row.update({'status':status,'label':LABELS[status]})
    if a.note:row['limitations']=a.note
    save(doc);return row

def clone(key,dest):
    row=next(e for e in read()['entries'] if e['slug']==item(key)['slug'])
    if not row['project']:
        raise ValueError('Historical per-case reconstruction source is not bundled in this public package. '
                         'Use ui.py reference --module-root <your-retained-reference-library> --tool rebuild -- clone ... '
                         'to use an existing local reconstruction, or explicitly choose toolkit new with a starter. '
                         'No starter was silently substituted.')
    dest=dest.resolve()
    if dest.exists() and any(dest.iterdir()):raise FileExistsError('Use a new/empty output project')
    blocked={'analysis','verification','render','__pycache__','node_modules','build-tools'}
    def ignored(directory,names):
        return [name for name in names if name in blocked or name.startswith(('verification-','render-','comparison-')) or name in ('preview.mp4','silent.mp4') or name.endswith(('.part','.tmp','.pyc'))]
    shutil.copytree(ROOT/row['project'],dest,dirs_exist_ok=True,ignore=ignored)
    write(dest/'source-reconstruction.json',row)
    return {'project':str(dest),'case':row['slug'],'status':row['status'],'limitations':row['limitations']}

def main():
    p=argparse.ArgumentParser(description=__doc__);subs=p.add_subparsers(dest='cmd',required=True)
    subs.add_parser('status')
    q=subs.add_parser('register');q.add_argument('case');q.add_argument('--project');q.add_argument('--video');q.add_argument('--comparison');q.add_argument('--proof');q.add_argument('--status',choices=list(LABELS));q.add_argument('--note',action='append')
    q=subs.add_parser('clone');q.add_argument('case');q.add_argument('--out',type=Path,required=True)
    q=subs.add_parser('render');q.add_argument('--project',type=Path,required=True);q.add_argument('--out',type=Path,required=True);q.add_argument('--width',type=int,default=1280);q.add_argument('--fps',type=int,default=30);q.add_argument('--audio',type=Path)
    a=p.parse_args()
    if a.cmd=='status':
        d=save(read());result={k:v for k,v in d.items() if k!='entries'}
    elif a.cmd=='register':result=register(a)
    elif a.cmd=='clone':result=clone(a.case,a.out)
    else:
        project_config=json.loads((a.project/'project.json').read_text(encoding='utf-8-sig'))
        if project_config.get('render_engine')=='python-native':
            exporter=(a.project/project_config['exporter']).resolve()
            if not exporter.is_relative_to(a.project.resolve()) or not exporter.is_file():raise ValueError('Invalid project-native exporter')
            cmd=[sys.executable,str(exporter),'--out',str(a.out),'--width',str(a.width),'--fps',str(a.fps)]
        else:
            cmd=[sys.executable,str(ROOT/'scripts/render.py'),'--project',str(a.project),'--out',str(a.out),'--width',str(a.width),'--fps',str(a.fps),'--check-repeat']
        audio=a.audio
        config=a.project/'project-audio.json'
        if not audio and config.is_file():audio=a.project/json.loads(config.read_text(encoding='utf-8'))['file']
        if audio and not audio.is_file():
            raise FileNotFoundError('Project audio was cleaned or is missing: '+str(audio)+'. Restore it from the single reference case or pass --audio with an available file before rendering.')
        if audio:cmd.extend(['--audio',str(audio)])
        subprocess.run(cmd,check=True);return
    print(json.dumps(result,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
