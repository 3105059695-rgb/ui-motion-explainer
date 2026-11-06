"""Bind composable UI capabilities to current narration using installed runtimes."""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

import source_designs

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = Path('assets/agent-editorial/capability-runtime.json')
RUNTIME = Path('assets/agent-editorial/capability-runtime.js')
SCHEMA = Path('assets/agent-editorial/capability-runtime.schema.json')


def catalog(root=ROOT):
    value = source_designs.read_json(Path(root) / MANIFEST)
    if value.get('schema') != 'ui-motion-fusion/capability-runtime@1':
        raise ValueError('Invalid capability manifest')
    return value


def listing(root=ROOT):
    data = catalog(root)
    return {'schema': data['schema'], 'scope': data['scope'],
            'capabilities': [{k: row[k] for k in ('id', 'label', 'status', 'semantic_use', 'call')}
                             for row in data['capabilities']]}


def inspect(capability_id, root=ROOT):
    data = catalog(root)
    row = next((row for row in data['capabilities'] if row['id'] == capability_id), None)
    if row is None:
        raise ValueError('Unknown executable capability: ' + capability_id)
    return {**row, 'coordinate_system': data['coordinate_system'],
            'source_files_exist': all((Path(root) / path).is_file() for path in row['source_files']),
            'scope': data['scope']}


def scaffold(capabilities, output, root=ROOT):
    names = [name.strip() for name in capabilities.split(',') if name.strip()]
    if not names:
        raise ValueError('Select at least one capability')
    output = Path(output).expanduser().resolve()
    if output.exists() or output.is_symlink() or not output.parent.is_dir():
        raise ValueError('Use a new specification path in an existing directory')
    rows, asset_ids = [], set()
    for index, name in enumerate(names):
        item = inspect(name, root)
        if name == 'source-design':
            raise ValueError('First complete ui.py designs scaffold bindings, then place the binding in a source-design event.')
        event = copy.deepcopy(item['example'])
        rows.append({'id': 's' + str(index + 1).zfill(2), 'duration': event['end'],
                     'layout': {'mode': 'focus', 'contentRect': {'x': 0, 'y': 0, 'w': 1920, 'h': 1080}},
                     'background': '#FFFFFF', 'events': [event]})
        asset_ids.update(event_assets(event))
    spec = {'schema': 'ui-motion-fusion/capability-composition@1', 'schema_version': 1,
            'title': '', 'width': 1920, 'height': 1080, 'fps': 50, 'audio': '', 'captions': [],
            'assets': [{'id': name, 'type': 'video' if name == 'presenter' else 'image', 'src': ''}
                       for name in sorted(asset_ids)], 'segments': rows,
            '_instructions': {'status': 'examples-awaiting-current-narration',
                'content': 'Replace example words, dates, materials, positions and cue seconds with this narration.',
                'composition': 'Events can overlap and share object IDs. Segment duration is current narration time.',
                'coordinates': catalog(root)['coordinate_system'],
                'source_adapter': 'Only source-design retains original state order and fixed geometry limitations.',
                'media': 'Use existing local files. Same-volume media use hardlinks; copies require --copy-media.'}}
    source_designs.write_json(output, spec, exclusive=True)
    return {'specification': str(output), 'capabilities': names,
            'status': 'Example parameters scaffolded; current narration bindings still required.',
            'next': 'ui.py events build --spec <specification> --out <new-project>'}


def event_assets(event):
    """Only explicit material references; never turn arbitrary text into a path."""
    refs = []
    for key in ('asset', 'presenter'):
        if event.get(key):
            refs.append(event[key])
    for key in ('inputs', 'objects', 'before', 'after'):
        for obj in event.get(key, []):
            if obj.get('asset'):
                refs.append(obj['asset'])
    if event.get('output', {}).get('asset'):
        refs.append(event['output']['asset'])
    for child in event.get('overlays', []):
        refs.extend(event_assets(child))
    if event.get('type') == 'source-design':
        for key in ('media', 'logos'):
            for value in event.get('binding', {}).get(key, {}).values():
                refs.append(value if isinstance(value, str) else value.get('asset') if isinstance(value, dict) else None)
    return refs


def validate_scenes(scenes, root=ROOT):
    node = shutil.which('node')
    if not node:
        raise ValueError('Existing Node runtime required; no runtime was installed')
    runner = ('const fs=require("fs");const source=require(process.argv[1]);'
              'source.configure(JSON.parse(fs.readFileSync(process.argv[2],"utf8").replace(/^\\uFEFF/,"")));'
              'const api=require(process.argv[3]);const specs=JSON.parse(fs.readFileSync(0,"utf8"));'
              'console.log(JSON.stringify(specs.map(s=>api.createScene(s).validate())));')
    command = [node, '-e', runner, str(Path(root) / 'assets/agent-editorial/source-designs.js'),
               str(Path(root) / source_designs.MANIFEST), str(Path(root) / RUNTIME)]
    result = subprocess.run(command, input=json.dumps(scenes, ensure_ascii=False),
                            capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise ValueError('Invalid capability event: ' + result.stderr.strip())
    return json.loads(result.stdout)


def prepare_spec(spec, spec_dir, root=ROOT):
    if spec.get('schema') not in (None, 'ui-motion-fusion/capability-composition@1') or spec.get('schema_version') != 1:
        raise ValueError('Use capability-composition@1 and schema_version 1')
    if not isinstance(spec.get('segments'), list) or not spec['segments']:
        raise ValueError('Composition needs segments')
    for key in ('width', 'height', 'fps'):
        if not source_designs._finite(spec.get(key)) or spec[key] <= 0:
            raise ValueError('Positive ' + key + ' is required')
    if int(spec['width']) != spec['width'] or int(spec['height']) != spec['height']:
        raise ValueError('Canvas pixel dimensions must be integers')
    assets, asset_ids = [], set()
    for asset in spec.get('assets', []):
        if not isinstance(asset.get('id'), str) or not asset['id'] or asset['id'] in asset_ids or asset.get('type') not in ('image', 'video'):
            raise ValueError('Assets need unique IDs and image/video type')
        asset_ids.add(asset['id'])
        assets.append({**asset, 'src': source_designs._asset_path(asset.get('src'), spec_dir)})
    scenes, segments, ids, cursor = [], [], set(), 0.0
    for segment in spec['segments']:
        if not segment.get('id') or segment['id'] in ids:
            raise ValueError('Unique segment IDs required')
        ids.add(segment['id'])
        duration = segment.get('duration')
        if not source_designs._finite(duration) or duration <= 0:
            raise ValueError('Fill positive segment duration: ' + segment['id'])
        layout = segment.get('layout', {'mode': 'focus'})
        if not isinstance(layout, dict) or layout.get('mode') not in ('focus', 'body', 'presenter-opening'):
            raise ValueError('Choose explicit focus/body/presenter-opening layout')
        if layout['mode'] == 'presenter-opening' and (layout.get('presenter') not in asset_ids or not layout.get('regions') or not layout.get('protectedRects')):
            raise ValueError('Presenter-opening layout needs original asset and measured safety rectangles')
        events = segment.get('events')
        if not isinstance(events, list):
            raise ValueError('Segment needs capability events')
        for event in events:
            for asset_id in event_assets(event):
                if not isinstance(asset_id, str) or asset_id not in asset_ids:
                    raise ValueError('Unknown event asset ID: ' + str(asset_id))
        scenes.append({'duration': duration, 'events': events})
        end = round(cursor + duration, 6)
        segments.append({'id': segment['id'], 'scene': 'capability_' + str(len(scenes)),
                         'output': {'start_seconds': cursor, 'end_seconds': end},
                         'layout': layout, 'background': segment.get('background', '#FFFFFF'),
                         'events': [{'id': e['id'], 'start': e['at'], 'end': e['end'], 'motion': True,
                                     'capability': e['type']} for e in events],
                         'capability_events': events,
                         **{key: segment[key] for key in source_designs.PLAN_FIELDS if key in segment},
                         **({'material_shots': segment['material_shots']} if 'material_shots' in segment else {})})
        cursor = end
    reports = validate_scenes(scenes, root)
    captions = spec.get('captions', [])
    for caption in captions:
        if not isinstance(caption.get('text'), str) or not all(source_designs._finite(caption.get(k)) for k in ('start', 'end')) or not 0 <= caption['start'] < caption['end'] <= cursor:
            raise ValueError('Captions must use original narration master-clock seconds')
    source_hash = spec.get('source_sha256', '')
    if not isinstance(source_hash, str):
        raise ValueError('source_sha256 must be a string')
    timeline = {'schema_version': 1, 'source_sha256': source_hash,
                'duration_seconds': cursor, 'duration': cursor, 'width': spec['width'], 'height': spec['height'],
                'media': {'audio': source_designs._asset_path(spec['audio'], spec_dir) if spec.get('audio') else '',
                          'captions': captions, 'assets': assets}, 'segments': segments}
    if 'implementation_manifest' in spec:
        timeline['implementation_manifest'] = spec['implementation_manifest']
    return scenes, timeline, reports


def validate(specification, root=ROOT):
    path = Path(specification).expanduser().resolve()
    scenes, timeline, reports = prepare_spec(source_designs.read_json(path), path.parent, root)
    return {'valid': True, 'scenes': reports, 'duration': timeline['duration_seconds'],
            'audio_present': bool(timeline['media']['audio']),
            'scope': 'Parameters and local media existence checked; no render or aesthetic approval.'}


def build(specification, output, root=ROOT, copy_media=False):
    import new_project
    path, output = Path(specification).expanduser().resolve(), Path(output).expanduser().resolve()
    spec = source_designs.read_json(path)
    scenes, timeline, reports = prepare_spec(spec, path.parent, root)
    media = source_designs.media_plan(timeline, output, copy_media)
    result = new_project.create(output, title=spec.get('title') or '本期事件组合', root=root,
                                custom_layout=True, canvas_story=True)
    library = output / 'lib/agent-editorial'
    for source in (RUNTIME, MANIFEST, SCHEMA):
        with (Path(root) / source).open('rb') as src, (library / source.name).open('xb') as dst:
            shutil.copyfileobj(src, dst)
    urls = source_designs.materialize_media(media, output, copy_media)
    for row in timeline['media']['assets']:
        row['src'] = urls[row['src']]
    if timeline['media']['audio']:
        timeline['media']['audio'] = urls[timeline['media']['audio']]
    entry = output / 'index.html'
    markup = entry.read_text(encoding='utf-8')
    marker = '<script src="scenes.js"></script>'
    if marker not in markup:
        raise ValueError('Existing story starter lost its scenes.js entry')
    entry.write_text(markup.replace(marker, '<script src="lib/agent-editorial/capability-runtime.js"></script>' + marker), encoding='utf-8')
    lines = ['// Current narration events, using existing retained drawing and motion code.',
             'window.StoryScenes = Object.create(null);']
    def adapter_ids(events):
        for event in events:
            if event.get('type') == 'source-design':
                yield event['binding']['design']
            yield from adapter_ids(event.get('overlays', []))
    selected = {name for scene in scenes for name in adapter_ids(scene['events'])}
    if selected:
        original = source_designs.read_json(Path(root) / source_designs.MANIFEST)
        lines.append('SourceDesigns.configure(' + json.dumps({**original, 'designs': [row for row in original['designs']
                     if row['id'] in selected]}, ensure_ascii=False) + ');')
    for segment, scene in zip(timeline['segments'], scenes):
        lines.append('StoryScenes[' + json.dumps(segment['scene']) + '] = CapabilityRuntime.createScene(' +
                     json.dumps(scene, ensure_ascii=False) + ');')
    (output / 'scenes.js').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    source_designs.write_json(output / 'timeline.json', timeline)
    config = source_designs.read_json(output / 'project.json')
    config.update(duration=timeline['duration_seconds'], width=spec['width'], height=spec['height'], fps=spec['fps'],
                  audio=timeline['media']['audio'], captions=timeline['media']['captions'],
                  captionStyle='approved-source', production_status='capability-events-awaiting-viewing',
                  aestheticApproval=False, current_style_applied=False)
    source_designs.write_json(output / 'project.json', config)
    source_designs.write_json(output / 'capability-binding.json', spec, exclusive=True)
    source_designs.write_json(output / 'source-media.local.json', {'schema_version': 1, 'files': media,
        'note': 'Media are immutable hardlinks by default. Replace a project file instead of editing its bytes.'}, exclusive=True)
    source_designs.write_json(output / 'capability-implementation.json', {
        'schema_version': 1, 'implementation': str(RUNTIME).replace('\\', '/'),
        'sha256': hashlib.sha256((Path(root) / RUNTIME).read_bytes()).hexdigest(),
        'scenes': reports, 'scope': catalog(root)['scope'],
        'rendered': False, 'aestheticApproval': False}, exclusive=True)
    return {**result, 'kind': 'capability-event-composition', 'bindings': reports,
            'duration': timeline['duration_seconds'], 'media_files': len(media),
            'media_copied_bytes': sum(row['size_bytes'] for row in media if row['method'] == 'copy'),
            'audio_present': bool(timeline['media']['audio']),
            'status': 'Editable events built; rendering and visual review remain.',
            'delivery_scope': 'Narration-backed composition' if timeline['media']['audio'] else 'Silent composition; not a narrated final film',
            'next': 'Preview index.html and render with the existing fusion backend; no new runtime needed.'}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('list')
    child = sub.add_parser('inspect')
    child.add_argument('--id', required=True)
    child = sub.add_parser('scaffold')
    child.add_argument('--capability', required=True)
    child.add_argument('--out', required=True, type=Path)
    child = sub.add_parser('validate')
    child.add_argument('--spec', required=True, type=Path)
    child = sub.add_parser('build')
    child.add_argument('--spec', required=True, type=Path)
    child.add_argument('--out', required=True, type=Path)
    child.add_argument('--copy-media', action='store_true')
    args = parser.parse_args(argv)
    try:
        if args.action == 'list': result = listing()
        elif args.action == 'inspect': result = inspect(args.id)
        elif args.action == 'scaffold': result = scaffold(args.capability, args.out)
        elif args.action == 'validate': result = validate(args.spec)
        else: result = build(args.spec, args.out, copy_media=args.copy_media)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
