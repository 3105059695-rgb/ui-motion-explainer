"""Render a chosen existing capability directly into a material slot of an all-reference edit."""
from pathlib import Path
import hashlib
import json

import library_html_runner
import library_runner


def load(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def render_input(catalog, request, base, output):
    source=catalog.lookup(request['source_id'])
    cap=request['capability']
    if source['status'] not in ('available','archived') or cap not in {u['capability'] for u in source['uses']}:
        raise ValueError('This implementation is not a registered positive use of '+source['id'])
    path=request.get('project')
    if not isinstance(path,str) or not path or '://' in path:
        raise ValueError('Supply the local current-content implementation project.')
    project=(base/path).resolve(strict=True)
    kind,ident=cap.split(':',1)
    config=None
    if (project/'library-project.json').is_file():
        artifact=project/'library-project.json'
        metadata=load(artifact)
        ids={cap,cap.removeprefix('software-preset:'),ident}
        if ident.startswith('fredtalk:'):
            ids.add(ident.removeprefix('fredtalk:'))
        if kind=='recipe':
            ids.add('method:'+ident)
        if metadata.get('id') not in ids or metadata.get('demo_content'):
            raise ValueError('The bound library project is a different source or a demonstration.')
        bindings=project/'library-binding.json'
        if bindings.is_file() and load(bindings).get('mode')=='demo':
            raise ValueError('Bind current content in the source implementation.')
    elif (project/'motion-binding.json').is_file():
        artifact=project/'motion-binding.json'
        metadata=load(artifact)
        if kind!='capability' or metadata.get('effect')!=ident or metadata.get('demo_content'):
            raise ValueError('The materialized action does not match this source.')
        config={'id':cap,'entry':metadata['entry'],'duration':metadata['duration'],'fps':30,
                'width':1280,'height':720,'fixed_canvas':True,'hide_render_controls':True}
    else:
        artifact=project/'project.json'
        metadata=load(artifact)
        if kind=='design' and (project/'source-design-binding.json').is_file():
            spec=load(project/'source-design-binding.json')
            actual={r['design'] for r in spec['segments']}
        elif kind=='native' and (project/'capability-binding.json').is_file():
            spec=load(project/'capability-binding.json')
            actual={e['type'] for r in spec['segments'] for e in r['events']}
        elif kind=='software-preset':
            actual={s['preset'] for s in metadata.get('clips',[])}
        else:
            raise ValueError('Use the registered builder and a current-content project.')
        if actual!={ident} or metadata.get('demo'):
            raise ValueError('The project must execute the selected single capability on current material.')
        config={k:metadata[k] for k in ('duration','fps','width','height')}
        config.update(id=cap,entry='index.html')
    if config:
        config['engine']='html-seek'
        report=library_html_runner.run(project,'render',output,config_override=config)
    else:
        report=library_runner.run(project,'render',output=output,root=catalog.root)
    if not output.is_file() or report.get('status')!='passed':
        raise ValueError('The source implementation produced no verified video.')
    return {'source_id':source['id'],'capability':cap,'artifact':artifact.name,
            'artifact_sha256':hashlib.sha256(artifact.read_bytes()).hexdigest(),
            'engine':report.get('engine',metadata.get('engine')), 'executed':True}
