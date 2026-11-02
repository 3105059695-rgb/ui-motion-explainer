"""Bind retained complete body designs to current narration; never invent a UI template."""
from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = Path('assets/agent-editorial/source-designs.json')
BINDING_KEYS = ('design', 'duration', 'sourceRange', 'cues', 'copy', 'media', 'logos', 'viewport', 'fontFamily')
PLAN_FIELDS = ('span', 'text', 'library_refs', 'source_study_refs', 'recipe_ids', 'selection', 'assets', 'implementation')


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_json(path, value, exclusive=False):
    with Path(path).open('x' if exclusive else 'w', encoding='utf-8', newline='\n') as stream:
        json.dump(value, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def catalog(root=ROOT):
    root = Path(root).resolve()
    data = read_json(root / MANIFEST)
    if data.get('schema') != 'ui-motion-fusion/source-designs@1' or not data.get('designs'):
        raise ValueError('Invalid complete source-design manifest.')
    return {'schema_version': 1, 'manifest': str(root / MANIFEST),
            'designs': data['designs'],
            'scope': 'Complete approved body designs; select and adapt to this narration. '
                     'This is one retained source family, not a restriction on the entire effects library.',
            'aesthetic_approval': False}


def inspect(design_id, root=ROOT):
    item = next((d for d in catalog(root)['designs'] if d['id'] == design_id), None)
    if item is None:
        raise ValueError('Unknown design: ' + design_id)
    source = Path(root) / 'assets/agent-editorial' / item['source_file']
    return {**item, 'source_path': str(source),
            'source_exists': source.is_file(),
            'source_hash_matches': source.is_file() and hashlib.sha256(source.read_bytes()).hexdigest() == item['source_sha256'],
            'usage': 'Use the complete dynamic source, then fill current copy, media, cue times and composition. '
                     'Source source_range is original graphic time; duration/cues are new narration time.'}


def listing(root=ROOT):
    data = catalog(root)
    data['designs'] = [{key: item[key] for key in ('id', 'label', 'engine', 'source_file', 'source_range')} |
                       {'cue_count': len(item['cues']), 'copy_slots': len(item['copy_slots']),
                        'media_slots': len(item['media_slots']), 'logo_slots': len(item['logo_slots']),
                        'inspect_command': 'ui.py designs inspect --id ' + item['id']}
                       for item in data['designs']]
    return data


def active_slots(item, span, kind):
    return [s for s in item[kind + '_slots'] if not s.get('intervals') or
            any(end > span[0] and start < span[1] for start, end in s['intervals'])]


def scaffold(designs, output, root=ROOT, source_range=None, demo=False):
    names = [value.strip() for value in designs.split(',') if value.strip()]
    if not names or (source_range is not None and len(names) != 1):
        raise ValueError('Select design IDs; --source-range applies to one design only.')
    output = Path(output).expanduser().resolve()
    if output.exists() or output.is_symlink():
        raise ValueError('Refusing to replace an existing specification: ' + str(output))
    if not output.parent.is_dir():
        raise ValueError('Specification parent directory must exist.')
    spec = {'schema_version': 1, 'title': '', 'width': 1920, 'height': 1080, 'fps': 50,
            'audio': '', 'captions': [], 'assets': [], 'segments': [],
            '_instructions': {
                'status': 'demo-source-design' if demo else 'awaiting-current-narration-bindings',
                'copy': 'Replace nulls with current words, or explicit {"omit":true}; original literals are slot keys only.',
                'timing': 'Fill duration and every internal cue with segment-local narration seconds. Source range stays in original graphic seconds.',
                'layout': 'Choose composition for this narration. For presenter-opening supply original presenter, measured regions and protectedRects.',
                'media': 'Map slot keys to current asset IDs. Assets contain id/type/src; local paths resolve relative to this specification. Build uses project-relative hardlinks; cross-volume copies require --copy-media.',
                'scope': 'Source body design only; no fixed leaderboard, episode sequence, or inherited opening.',
            }}
    for index, name in enumerate(names):
        item = inspect(name, root)
        span = source_range or item['source_range']
        if not (len(span) == 2 and item['source_range'][0] <= span[0] < span[1] <= item['source_range'][1]):
            raise ValueError('source-range must lie inside the selected design.')
        row = {'id': 's' + str(index + 1).zfill(2), 'design': name, 'sourceRange': span,
               'duration': round(span[1] - span[0], 6) if demo else None,
               'cues': {c['id']: round(c['source_time'] - span[0], 6) if demo else None
                        for c in item['cues'] if span[0] < c['source_time'] < span[1]},
               'copy': {} if demo else {s['source']: None for s in active_slots(item, span, 'copy')},
               'media': {s['key']: None for s in active_slots(item, span, 'media')},
               'logos': {s['key']: None for s in active_slots(item, span, 'logo')},
               'layout': {'mode': 'focus', 'contentRect': {'x': 60, 'y': 60, 'w': 1800, 'h': 930}} if demo else None,
               'background': '#FFFFFF', 'events': []}
        spec['segments'].append(row)
    write_json(output, spec, exclusive=True)
    return {'specification': str(output), 'designs': names, 'status': spec['_instructions']['status'],
            'next': 'Fill this narration bindings, then ui.py designs build --spec <specification> --out <new-project>' + (' --demo' if demo else '')}


def _finite(value):
    return isinstance(value, (float, int)) and not isinstance(value, bool) and math.isfinite(value)


def _asset_path(value, spec_dir):
    if not isinstance(value, str) or not value.strip():
        raise ValueError('Media src must be a local file path.')
    if value.lower().startswith(('https:', 'http:', 'data:', 'file:', 'blob:', '//')):
        raise ValueError('Use an acquired local media file; remote/data URLs cannot be served by this project.')
    path = Path(value).expanduser()
    path = path.resolve() if path.is_absolute() else (spec_dir / path).resolve()
    if not path.is_file():
        raise ValueError('Current media does not exist: ' + str(path))
    return path.as_posix()


def prepare_spec(spec, spec_dir, demo=False):
    """Validate episode structure without writing, copying or changing source clocks."""
    if spec.get('schema_version') != 1 or not isinstance(spec.get('segments'), list) or not spec['segments']:
        raise ValueError('Specification needs schema_version 1 and selected segments.')
    for key in ('width', 'height', 'fps'):
        if not _finite(spec.get(key)) or spec[key] <= 0:
            raise ValueError('Positive ' + key + ' is required.')
    assets, asset_ids = [], set()
    for row in spec.get('assets', []):
        if not row.get('id') or row['id'] in asset_ids or row.get('type') not in ('image', 'video'):
            raise ValueError('Asset needs unique id and image/video type.')
        asset_ids.add(row['id'])
        assets.append({**row, 'src': _asset_path(row.get('src'), spec_dir)})
    bindings, segments, ids, cursor = [], [], set(), 0.0
    for row in spec['segments']:
        if not row.get('id') or row['id'] in ids:
            raise ValueError('Segment IDs must be unique and nonempty.')
        ids.add(row['id'])
        if not _finite(row.get('duration')) or row['duration'] <= 0:
            raise ValueError('Fill positive narration duration for ' + row['id'])
        layout = row.get('layout')
        if not isinstance(layout, dict) or layout.get('mode') not in ('focus', 'body', 'presenter-opening'):
            raise ValueError('Choose explicit current composition for ' + row['id'])
        if layout['mode'] == 'presenter-opening':
            if layout.get('presenter') not in asset_ids or not layout.get('regions') or not layout.get('protectedRects'):
                raise ValueError('Presenter opening needs its asset and measured clear/protected regions.')
        binding = {key: row[key] for key in BINDING_KEYS if key in row}
        if row.get('demo') and not demo:
            raise ValueError('Source demo content requires explicit build --demo.')
        binding['demo'] = demo
        for field in ('media', 'logos'):
            for key, value in binding.get(field, {}).items():
                asset_id = value if isinstance(value, str) else value.get('asset') if isinstance(value, dict) else None
                if asset_id not in asset_ids:
                    raise ValueError('Bind ' + field + '[' + key + '] to a current asset ID.')
        end = round(cursor + row['duration'], 6)
        scene_id = 'source_' + str(len(bindings) + 1)
        segments.append({'id': row['id'], 'scene': scene_id,
                         'output': {'start_seconds': cursor, 'end_seconds': end},
                         'layout': layout, 'background': row.get('background', '#FFFFFF'),
                         'events': row.get('events', []),
                         'source_design': {'id': row['design'], 'source_range': row.get('sourceRange')},
                         **{key: row[key] for key in PLAN_FIELDS if key in row},
                         **({'material_shots': row['material_shots']} if 'material_shots' in row else {})})
        bindings.append(binding)
        cursor = end
    captions = spec.get('captions', [])
    for caption in captions:
        if not isinstance(caption.get('text'), str) or not all(_finite(caption.get(k)) for k in ('start', 'end')) or not 0 <= caption['start'] < caption['end'] <= cursor:
            raise ValueError('Captions need original master-clock start/end inside the composition.')
    audio = _asset_path(spec['audio'], spec_dir) if spec.get('audio') else ''
    source_hash = spec.get('source_sha256', '')
    if not isinstance(source_hash, str):
        raise ValueError('source_sha256 must be the preserved source hash string, or empty when unlinked.')
    timeline = {'schema_version': 1, 'source_sha256': source_hash, 'duration_seconds': cursor, 'duration': cursor,
                'width': spec['width'], 'height': spec['height'],
                'media': {'audio': audio, 'captions': captions, 'assets': assets}, 'segments': segments}
    if 'implementation_manifest' in spec:
        timeline['implementation_manifest'] = spec['implementation_manifest']
    return bindings, timeline


def media_plan(timeline, output, copy_media=False):
    """Plan only files explicitly named by the episode; expose no filesystem route."""
    paths = [row['src'] for row in timeline['media']['assets']]
    if timeline['media']['audio']:
        paths.append(timeline['media']['audio'])
    ancestor = Path(output)
    while not ancestor.exists():
        ancestor = ancestor.parent
    volume = ancestor.stat().st_dev
    rows = []
    for value in dict.fromkeys(paths):
        source = Path(value)
        stat = source.stat()
        if stat.st_dev != volume and not copy_media:
            raise ValueError('Cross-volume media needs explicit --copy-media (' + str(stat.st_size) +
                             ' bytes), or choose a project on the source volume: ' + str(source))
        # Hash the resolved path for a stable URL-safe name; provenance retains the original.
        key = hashlib.sha256(str(source).encode('utf-8')).hexdigest()[:20]
        suffix = source.suffix.lower()
        if not suffix or not suffix[1:].isalnum():
            raise ValueError('Media needs a normal filename extension: ' + str(source))
        rows.append({'source': source.as_posix(), 'project_url': 'media/' + key + suffix,
                     'size_bytes': stat.st_size, 'source_mtime_ns': stat.st_mtime_ns})
    return rows


def materialize_media(rows, output, copy_media=False):
    """Reuse same-volume bytes; copying is an explicit opt-in fallback."""
    output = Path(output)
    if rows:
        (output / 'media').mkdir(exist_ok=False)
    for row in rows:
        target = output / row['project_url']
        try:
            os.link(row['source'], target)
            row['method'] = 'hardlink'
        except OSError as exc:
            if target.exists() or not copy_media:
                raise ValueError('Cannot hardlink this exact media file; no source was changed. '
                                 'Use --copy-media to permit a copy: ' + row['source']) from exc
            # Exclusive creation ensures an existing project file is never overwritten.
            with Path(row['source']).open('rb') as src, target.open('xb') as dst:
                shutil.copyfileobj(src, dst, 1024 * 1024)
            shutil.copystat(row['source'], target)
            row['method'] = 'copy'
    return {row['source']: row['project_url'] for row in rows}


def validate_bindings(bindings, root=ROOT):
    node = shutil.which('node')
    if not node:
        raise ValueError('Existing Node runtime is required; none was installed.')
    runner = ('const fs=require("fs");const api=require(process.argv[1]);'
              'api.configure(JSON.parse(fs.readFileSync(process.argv[2],"utf8").replace(/^\\uFEFF/,"")));'
              'const bindings=JSON.parse(fs.readFileSync(0,"utf8"));'
              'console.log(JSON.stringify(bindings.map(b=>api.createScene(b).validate())));')
    result = subprocess.run([node, '-e', runner,
                             str(Path(root) / 'assets/agent-editorial/source-designs.js'), str(Path(root) / MANIFEST)],
                            input=json.dumps(bindings, ensure_ascii=False), capture_output=True, text=True, encoding='utf-8')
    if result.returncode:
        raise ValueError('Source design binding is incomplete: ' + result.stderr.strip())
    return json.loads(result.stdout)


def build(specification, output, root=ROOT, demo=False, copy_media=False):
    import new_project
    specification = Path(specification).expanduser().resolve()
    output = Path(output).expanduser().resolve()
    spec = read_json(specification)
    bindings, timeline = prepare_spec(spec, specification.parent, demo)
    checked = validate_bindings(bindings, root)
    media = media_plan(timeline, output, copy_media)
    # Validate every binding before creating the new project. new_project preserves
    # prepared director context and rejects existing project/original files.
    result = new_project.create(output, title=spec.get('title') or '本期源码设计', root=root,
                                custom_layout=True, canvas_story=True)
    urls = materialize_media(media, output, copy_media)
    for row in timeline['media']['assets']:
        row['src'] = urls[row['src']]
    if timeline['media']['audio']:
        timeline['media']['audio'] = urls[timeline['media']['audio']]
    script = ['// Complete retained BodyA/BodyB implementations; current narration bindings only.',
              'window.StoryScenes = Object.create(null);']
    for row, binding in zip(timeline['segments'], bindings):
        script.append('StoryScenes[' + json.dumps(row['scene']) + '] = SourceDesigns.createScene(' +
                      json.dumps(binding, ensure_ascii=False) + ');')
    (output / 'scenes.js').write_text('\n'.join(script) + '\n', encoding='utf-8')
    write_json(output / 'timeline.json', timeline)
    config = read_json(output / 'project.json')
    config.update(duration=timeline['duration_seconds'], width=spec['width'], height=spec['height'], fps=spec['fps'],
                  audio=timeline['media']['audio'], captions=timeline['media']['captions'], demo=demo,
                  captionStyle='approved-source', production_status='source-design-bound-awaiting-viewing',
                  aestheticApproval=False, current_style_applied=False)
    write_json(output / 'project.json', config)
    write_json(output / 'source-design-binding.json', spec, exclusive=True)
    write_json(output / 'source-media.local.json', {'schema_version': 1, 'files': media,
               'note': 'Local provenance only. Media URLs are project-relative; no private filesystem route is exposed. '
                       'Hardlinks share original bytes: treat imported media as immutable; replace the project file rather than rewriting it in place.'}, exclusive=True)
    return {**result, 'kind': 'source-design-demo' if demo else 'source-design-composition',
            'duration': timeline['duration_seconds'], 'bindings': checked,
            'audio_present': bool(timeline['media']['audio']),
            'narration_binding': 'Existing source hash preserved; not reverified here.' if timeline['source_sha256'] else
                                 'No source_sha256 supplied: not linked to a narration director plan.',
            'media_files': len(media), 'media_copied_bytes': sum(row['size_bytes'] for row in media if row['method'] == 'copy'),
            'status': 'Built source designs; not rendered or visually approved.',
            'delivery_scope': 'Narration-backed editable composition.' if timeline['media']['audio'] else
                              'Silent dynamic design only; no narration audio was supplied, so this is not a complete narrated film.',
            'next': 'Preview index.html through the existing media server, inspect the complete motion, then render with the existing fusion backend.'}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('list')
    child = sub.add_parser('inspect')
    child.add_argument('--id', required=True)
    child = sub.add_parser('scaffold')
    child.add_argument('--design', required=True, help='One or more selected semantic design IDs, comma separated.')
    child.add_argument('--source-range', type=float, nargs=2)
    child.add_argument('--out', type=Path, required=True)
    child.add_argument('--demo', action='store_true', help='Explicit original-text design study, never production approval.')
    child = sub.add_parser('build')
    child.add_argument('--spec', type=Path, required=True)
    child.add_argument('--out', type=Path, required=True)
    child.add_argument('--demo', action='store_true')
    child.add_argument('--copy-media', action='store_true', help='Permit explicit media copies when same-volume hardlinks are unavailable; may use additional disk space.')
    args = parser.parse_args(argv)
    try:
        if args.action == 'list':
            result = listing()
        elif args.action == 'inspect':
            result = inspect(args.id)
        elif args.action == 'scaffold':
            result = scaffold(args.design, args.out, source_range=args.source_range, demo=args.demo)
        else:
            result = build(args.spec, args.out, demo=args.demo, copy_media=args.copy_media)
    except (OSError, ValueError, KeyError, TypeError) as exc:
        parser.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
