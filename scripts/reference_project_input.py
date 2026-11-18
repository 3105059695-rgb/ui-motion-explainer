"""Render a chosen existing capability directly into a material slot of an all-reference edit."""
from pathlib import Path
import hashlib
import json

import library_html_runner
import library_runner
import capability_catalog


def load(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def credit(info):
    return info.get('credit') or (info['source_id'] + ' / ' + info['capability']
                                  if info.get('source_id') else info['capability'])


def render_input(catalog, request, base, output, library=None):
    cap=request['capability']
    source_id = request.get('source_id')
    if source_id is not None:
        source = catalog.lookup(source_id)
        if source['status'] not in ('available','archived') or cap not in {u['capability'] for u in source['uses']}:
            raise ValueError('This implementation is not a registered positive use of '+source['id'])
        source_id = source['id']
    else:
        if library is None:
            library = {r['id']: r for r in capability_catalog.records(catalog.root)}
        row = library.get(cap)
        if not row or row['execution_state'] not in ('direct', 'source-adaptation') or row.get('is_aggregate') or row.get('source_use') == 'diagnostic-only':
            raise ValueError('Choose an executable catalog ID with a production implementation: ' + str(cap))
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
        if kind == 'component':
            artifact = project / 'component-binding.json'
            if not artifact.is_file() or load(artifact).get('id') != cap:
                raise ValueError('Build this component with its current objects using capabilities bind.')
    elif (project/'motion-binding.json').is_file():
        artifact=project/'motion-binding.json'
        metadata=load(artifact)
        if kind!='capability' or metadata.get('effect')!=ident or metadata.get('demo_content'):
            raise ValueError('The materialized action does not match this source.')
        size = metadata
        if 'width' not in size and metadata.get('runtime') == 'original-gsap-timeline':
            manifest = load(catalog.root / 'assets/semantic-motion/manifest.json')
            size = next(effect for effect in manifest['effects'] if effect['id'] == ident)
        config={'id':cap,'entry':metadata['entry'],'duration':metadata['duration'],'fps':30,
                'width':size.get('width',1280),'height':size.get('height',720),'fixed_canvas':True,'hide_render_controls':True}
    elif kind == 'scene' and (project / 'scene-build-receipt.json').is_file():
        import scene_builder
        artifact = project / 'scene-build-receipt.json'
        metadata = load(artifact)
        scenes = {metadata['pack'] + ':' + s['scene_id'] for s in metadata['selected_scenes']}
        if scenes != {ident} or metadata.get('mode') != 'director-plan':
            raise ValueError('Use a bound production project for the selected authored scene.')
        rendered = scene_builder.render(project, output, root=catalog.root, plan_path=metadata['director_plan']['path'])
        if not rendered.get('technical_passed') or not output.is_file():
            raise ValueError('The selected scene failed output verification.')
        return {'source_id': source_id, 'capability': cap, 'artifact': artifact.name,
                'artifact_sha256': hashlib.sha256(artifact.read_bytes()).hexdigest(),
                'engine': 'complete-scenes', 'executed': True}
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
    return {'source_id':source_id,'capability':cap,'artifact':artifact.name,
            'artifact_sha256':hashlib.sha256(artifact.read_bytes()).hexdigest(),
            'engine':report.get('engine',metadata.get('engine')), 'executed':True}
