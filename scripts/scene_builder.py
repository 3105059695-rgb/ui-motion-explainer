"""Select and instantiate retained complete scenes with new narration bindings.

This entry reuses the Adu scene compiler and renderer. It does not select a story,
invent timings/media, install dependencies, or certify visual quality.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
ADU = Path('assets/adu-reference/source')
PACKS = ('anim3', 'anim4')
OWNER = 'ui-motion-fusion/complete-scenes-v1'


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def write_new(path, data):
    path = Path(path)
    if path.exists() or path.is_symlink():
        raise ValueError('Refusing to replace an existing file: ' + str(path))
    if not path.parent.is_dir():
        raise ValueError('Output parent directory must exist: ' + str(path.parent))
    with path.open('x', encoding='utf-8', newline='\n') as stream:
        json.dump(data, stream, ensure_ascii=False, indent=2)
        stream.write('\n')


def load_pack(pack, root=ROOT):
    if pack not in PACKS:
        raise ValueError('Choose an existing complete scene pack: anim3 or anim4.')
    folder = Path(root).resolve() / ADU / 'packs' / pack
    manifest = folder / 'manifest.json'
    data = read_json(manifest)
    if not isinstance(data.get('scenes'), list) or not data['scenes']:
        raise ValueError('Complete scene manifest is empty: ' + str(manifest))
    return folder, data, {'path': str(manifest), 'sha256': sha256(manifest)}


def _gallery(root):
    path = Path(root) / 'assets/adu-reference/catalog.json'
    if not path.is_file():
        return {}
    return {row['id']: row for row in read_json(path).get('items', [])
            if isinstance(row, dict) and isinstance(row.get('id'), str)}


def _scene_record(pack, folder, manifest, fact, scene, gallery, root):
    gallery_row = gallery.get(pack + '-' + scene['id'], {})
    preview_root = Path(root).resolve() / 'assets/adu-reference'
    preview = {}
    for source_key, target_key in (('preview', 'entry'), ('poster', 'poster')):
        value = gallery_row.get(source_key)
        if value:
            candidate = preview_root / value
            preview[target_key] = str(candidate)
            preview[target_key + '_exists'] = candidate.is_file()
    span = scene.get('source', {})
    preview.update(start=span.get('start'), end=span.get('end'),
                   media_reviewed_this_run=False)
    source = folder / 'scenes.js'
    return {
        'id': f"adu:{pack}:{scene['id']}", 'pack': pack, 'scene_id': scene['id'],
        'title': scene.get('title') or gallery_row.get('title') or scene.get('role', scene['id']),
        'role': scene.get('role') or gallery_row.get('description', ''),
        'source': {'path': str(source), 'exists': source.is_file(),
                   'selector': scene['id'], 'block_sha256': scene.get('sourceBlockSha256'),
                   'line': gallery_row.get('line'), 'end_line': gallery_row.get('endLine')},
        'manifest': fact, 'preview': preview,
        'native_duration_seconds': round(span.get('end', 0) - span.get('start', 0), 6),
        'required_slots': [{k: slot[k] for k in
                            ('id', 'type', 'required', 'maxChars', 'min', 'max', 'unit', 'description')
                            if k in slot}
                           for slot in scene.get('slots', []) if slot.get('required')],
        'cues': scene.get('cues', []), 'motion_windows': scene.get('motionWindows', []),
        'inspect_command': f"ui.py scene inspect --pack {pack} --scene {scene['id']}",
        'scaffold_command': f"ui.py scene scaffold --pack {pack} --scenes {scene['id']} --out <spec.json>",
        'build_status': 'requires-current-narration-bindings',
        'runtime_verified_this_run': False,
        'user_approval': 'not-inferred-from-source-or-gallery',
        'reuse_scope': ('Complete source composition and choreography, with new text, numbers, media '
                        'and narration cues. Select, reorder or repeat scenes; no fixed full-film template.'),
    }


def scene_catalog(root=ROOT, pack=None):
    """Return the actual retained full-scene entrypoints, without executing them."""
    root = Path(root).resolve()
    gallery = _gallery(root)
    packs, scenes = [], []
    for key in (PACKS if pack is None else (pack,)):
        folder, manifest, fact = load_pack(key, root)
        packs.append({'id': key, 'manifest_id': manifest['id'],
                      'title': manifest.get('title', key), 'manifest': fact,
                      'scene_count': len(manifest['scenes']),
                      **{k: manifest.get(k) for k in ('width', 'height', 'fps')}})
        scenes.extend(_scene_record(key, folder, manifest, fact, row, gallery, root)
                      for row in manifest['scenes'])
    return {'schema_version': 1, 'status': 'source-adaptation-candidates',
            'packs': packs, 'scenes': scenes,
            'compile_command': 'ui.py scene compile --plan <project/director-plan.json> --out <derived-spec.json>',
            'build_command': 'ui.py scene build --plan <project/director-plan.json> --presenter <edited-talk.mp4> --out <project>',
            'render_command': 'ui.py scene render --project <project> --out <final.mp4>',
            'constraints': [
                'One pack per build; selected scenes can be reordered or repeated with independent bindings.',
                'Required text, numbers, media and cue times belong to this narration; supplied speech is not rewritten.',
                'Protected action windows retain their native speed; only holds can stretch.',
                'Output duration must match the supplied edited presenter video within one frame.',
                'No dependencies are installed; source availability is not runtime or visual approval.',
            ]}


def inspect_scene(pack, scene, root=ROOT):
    folder, manifest, fact = load_pack(pack, root)
    source = next((row for row in manifest['scenes'] if row['id'] == scene), None)
    if source is None:
        raise ValueError(f'Unknown scene {pack}:{scene}. Use scene list --pack {pack}.')
    return {**_scene_record(pack, folder, manifest, fact, source, _gallery(root), root),
            'scene_parameters': source,
            'pack_parameters': {k: manifest[k] for k in
                                ('voice', 'assetDefinitions', 'requireMotionWindows') if k in manifest},
            'instructions': {
                'timing': 'Set durationFrames and cues against the new narration. Cue at values are absolute output seconds.',
                'text': 'Fill slots with this episode text within maxChars; sourceText is an example, not a default.',
                'media': 'Use supplied/local current media. Inspect each image, sequence or wall-sprites slot before building.',
                'face_tracking': 'Scenes that crop the face require auto tracking where available or an explicit checked fixed crop.',
                'audio': 'Render selects an existing mix.wav, otherwise the preserved voice.wav. Provide --audio for a prepared mix.',
            }}


def _chosen_scenes(value):
    names = value.split(',') if isinstance(value, str) else list(value)
    names = [name.strip() for name in names if isinstance(name, str) and name.strip()]
    if not names:
        raise ValueError('Select at least one complete scene with --scenes s01,s04.')
    return names


def scaffold(pack, scenes, output, root=ROOT):
    """Create only explicitly selected scene bindings, never a whole-pack default."""
    _, manifest, fact = load_pack(pack, root)
    names = _chosen_scenes(scenes)
    by_id = {row['id']: row for row in manifest['scenes']}
    unknown = [name for name in names if name not in by_id]
    if unknown:
        raise ValueError(f'Unknown {pack} scene(s): ' + ', '.join(unknown))
    counter = Counter()
    data = {
        'pack': manifest['id'], 'fps': manifest['fps'], 'brand': '',
        'presenterLabel': '// on air · 主讲人', 'transcript': None,
        'music': {'mode': 'none'}, 'scenes': [],
        '_scene_builder': {
            'owner': OWNER, 'pack_key': pack, 'manifest_sha256': fact['sha256'],
            'status': 'awaiting-current-narration-bindings',
            'timing': 'durationFrames and cue at/phrase/line must come from this narration; at is absolute output seconds.',
            'audio': 'none means no generated music; original narration is retained. An existing supplied mix may be rendered.',
            'source_requirements': [],
        },
    }
    for name in names:
        scene = by_id[name]
        counter[name] += 1
        instance = f'{name}-{counter[name]:02d}'
        data['scenes'].append({
            'id': instance, 'sceneId': name, 'durationFrames': None,
            'cues': {cue['id']: {'at': None} for cue in scene.get('cues', [])
                     if cue.get('required', True)},
            'slots': {slot['id']: None for slot in scene.get('slots', []) if slot.get('required')},
        })
        data['_scene_builder']['source_requirements'].append({
            'instance_id': instance, 'scene_id': name,
            'native_duration_frames': round((scene['source']['end'] - scene['source']['start']) * manifest['fps']),
            'native_motion_windows': scene.get('motionWindows', []),
            'required_slots': [{k: slot[k] for k in ('id', 'type', 'maxChars', 'required') if k in slot}
                               for slot in scene.get('slots', []) if slot.get('required')],
            'inspect_command': f'ui.py scene inspect --pack {pack} --scene {name}',
        })
    write_new(output, data)
    return {'spec': str(Path(output).resolve()), 'pack': pack, 'selected_scenes': names,
            'status': 'awaiting-current-narration-bindings',
            'next': 'Fill the required slots, narration durations and cues, then run scene build.'}


def _resolve_spec(spec, root):
    if not isinstance(spec, dict):
        raise ValueError('Scene spec must be a JSON object.')
    declared = spec.get('_scene_builder', {})
    if not isinstance(declared, dict):
        raise ValueError('_scene_builder must be an object.')
    key = declared.get('pack_key')
    matches = []
    for candidate in PACKS:
        folder, manifest, fact = load_pack(candidate, root)
        if manifest['id'] == spec.get('pack'):
            matches.append((candidate, folder, manifest, fact))
    if len(matches) != 1 or (key is not None and matches[0][0] != key):
        raise ValueError('spec.pack must identify one installed complete pack; use scene scaffold.')
    key, folder, manifest, fact = matches[0]
    expected = declared.get('manifest_sha256')
    if expected and expected != fact['sha256']:
        raise ValueError('Pack manifest changed after scaffolding; inspect the changed scene bindings before rebuilding.')
    rows = spec.get('scenes')
    if not isinstance(rows, list) or not rows:
        raise ValueError('The spec must select at least one complete scene.')
    by_id = {row['id']: row for row in manifest['scenes']}
    for row in rows:
        if not isinstance(row, dict) or row.get('sceneId') not in by_id:
            raise ValueError('Every selected sceneId must exist in the selected pack.')
        source = by_id[row['sceneId']]
        slots, cues = row.get('slots', {}), row.get('cues', {})
        if not isinstance(slots, dict) or not isinstance(cues, dict):
            raise ValueError('Scene slots and cues must be objects.')
        missing = [slot['id'] for slot in source.get('slots', [])
                   if slot.get('required') and slots.get(slot['id']) in (None, '')]
        missing += ['cue:' + cue['id'] for cue in source.get('cues', [])
                    if cue.get('required', True) and
                    (not isinstance(cues.get(cue['id']), dict) or
                     not any(cues[cue['id']].get(k) is not None for k in ('at', 'frame', 'phrase', 'line')))]
        if not any(row.get(k) is not None for k in ('durationFrames', 'duration', 'endFrame', 'end')):
            missing.append('durationFrames/end')
        if missing:
            raise ValueError(f"{row.get('id', row['sceneId'])}: fill current narration bindings: " + ', '.join(missing))
    return key, folder, manifest, fact


def _run_python(script, args):
    command = [sys.executable, '-B', '-X', 'utf8', str(script), *[str(value) for value in args]]
    result = subprocess.run(command, text=True, encoding='utf-8', errors='replace', capture_output=True)
    if result.returncode:
        detail = (result.stderr or result.stdout).strip()[-6000:]
        raise ValueError(f'Complete-scene tool failed ({result.returncode}): {detail}')
    return {'command': command, 'stdout': result.stdout.strip()[-4000:]}


def _prepared_target(output, plan_path=None):
    import production_entry
    if output.is_symlink() or (hasattr(output, 'is_junction') and output.is_junction()):
        raise ValueError('Refusing a linked project target: ' + str(output))
    try:
        if plan_path is not None:
            import scene_plan
            return production_entry.prepared_creation_context(output, scene_plan.prepared_files(plan_path))
        return production_entry.prepared_creation_context(output)
    except ValueError as exc:
        raise ValueError(str(exc) + ' Keep the scene spec beside the prepare-only project, not inside it.') from exc


def _merge_prepared(source, target, plan_path=None):
    """Merge newly generated files only after a whole-tree conflict check."""
    _prepared_target(target, plan_path)
    source, target = source.resolve(), target.resolve()
    files, directories = [], []
    for item in source.rglob('*'):
        if item.is_symlink() or (hasattr(item, 'is_junction') and item.is_junction()):
            raise ValueError('Builder emitted a linked path: ' + str(item))
        destination = target / item.relative_to(source)
        if not destination.resolve().is_relative_to(target):
            raise ValueError('Generated path escapes prepared project.')
        if item.is_dir():
            if destination.exists() and not destination.is_dir():
                raise ValueError('Generated directory conflicts with prepared file: ' + str(destination))
            directories.append(destination)
        else:
            if destination.exists() or destination.is_symlink():
                raise ValueError('Generated file conflicts with prepared original: ' + str(destination))
            files.append((item, destination))
    for directory in sorted(directories, key=lambda item: len(item.parts)):
        directory.mkdir(exist_ok=True)
    for item, destination in files:
        # Exclusive creation protects even a file created after the preflight.
        # Remove only this generated staging copy after the destination closes.
        with item.open('rb') as original, destination.open('xb') as created:
            shutil.copyfileobj(original, created)
        item.unlink()


def _build_new(spec_path, presenter, output, subs_js, spec, key, pack_dir, manifest, fact, root):
    """Invoke the original builder against a path that does not yet exist."""
    arguments = ['build', pack_dir, spec_path, presenter, output]
    if subs_js is not None:
        arguments += ['--subs-js', subs_js]
    import scene_plan
    source_files = scene_plan.inputs(spec, root)
    presenter_fact = {'path': str(presenter), 'sha256': sha256(presenter)}
    invocation = _run_python(Path(root) / ADU / 'scripts/build_macro_project.py', arguments)
    required = ('index.html', 'scenes.js', 'macro_plan.json', 'macro_plan.js', 'macro_main.js', 'voice.wav')
    missing = [name for name in required if not (output / name).is_file()]
    if missing:
        raise ValueError('Builder returned without required project outputs: ' + ', '.join(missing))
    plan = read_json(output / 'macro_plan.json')
    if '_director_plan' in spec:
        scene_plan.validate_runtime(spec, plan)
    receipt = {
        'schema_version': 1, 'owner': OWNER, 'status': 'built-not-visually-reviewed',
        'pack': key, 'manifest_id': manifest['id'], 'manifest': fact,
        'mode': 'director-plan' if '_director_plan' in spec else 'legacy-spec',
        'director_plan': spec.get('_director_plan'),
        'source_files': source_files,
        'spec': {'path': str(spec_path), 'sha256': sha256(spec_path)},
        'presenter': presenter_fact,
        'subtitles': {'path': str(subs_js), 'sha256': sha256(subs_js)} if subs_js else None,
        'selected_scenes': [{'instance_id': row.get('id'), 'scene_id': row['sceneId'],
                             'source_block_sha256': next(s for s in manifest['scenes']
                                                        if s['id'] == row['sceneId']).get('sourceBlockSha256')}
                            for row in spec['scenes']],
        'output': {'entry': 'index.html', 'plan': 'macro_plan.json',
                   **{k: plan.get(k) for k in ('fps', 'width', 'height', 'durationFrames', 'durationSeconds')}},
        'builder': invocation, 'full_realtime_av_review': False, 'user_approved': False,
        'source_reuse': 'Selected complete source scene blocks, original CSS and choreography with this spec bindings.',
    }
    if source_files != scene_plan.inputs(spec, root) or presenter_fact['sha256'] != sha256(presenter):
        raise ValueError('Source pack/compiler or presenter changed during build; this project is not bound for production.')
    if '_director_plan' in spec:
        current_spec, _ = scene_plan.derive(spec['_director_plan']['path'], root)
        if current_spec != spec:
            raise ValueError('Director plan or original sources changed during build; do not export this stale project.')
    write_new(output / 'scene-spec.json', spec)
    if '_director_plan' in spec:
        receipt['spec'] = {'path': 'scene-spec.json', 'sha256': sha256(output / 'scene-spec.json'),
                           'derived_from': 'director-plan'}
    receipt['generated_files'] = [
        {'path': str(path.relative_to(output)).replace('\\', '/'), 'sha256': sha256(path)}
        for path in sorted(output.rglob('*')) if path.is_file()
    ]
    write_new(output / 'scene-build-receipt.json', receipt)
    return receipt


def build(spec_path, presenter, output, subs_js=None, root=ROOT, plan_path=None, legacy_spec=False):
    if plan_path is not None:
        if spec_path is not None or legacy_spec:
            raise ValueError('--plan and legacy --spec/--legacy-spec modes are mutually exclusive.')
        import scene_plan
        raw_output = Path(output).expanduser()
        if raw_output.is_symlink() or (hasattr(raw_output, 'is_junction') and raw_output.is_junction()):
            raise ValueError('Refusing a linked project target: ' + str(raw_output))
        plan_path, output = Path(plan_path).expanduser().resolve(), raw_output.resolve()
        if plan_path.parent != output:
            raise ValueError('--plan must be in the target project root; use direct prepare there first.')
        spec, _ = scene_plan.check_binding(plan_path, root)
        if Path(presenter).expanduser().resolve() != Path(spec['_director_plan']['audio']['path']):
            raise ValueError('Complete-scene timing.audio_source must identify the edited presenter with its original embedded audio.')
        _prepared_target(output, plan_path)
        with tempfile.TemporaryDirectory(prefix='.ui-scene-plan-', dir=output.parent) as temporary:
            derived = Path(temporary) / 'derived-spec.json'
            write_new(derived, spec)
            return _build(derived, presenter, output, subs_js, root, plan_path)
    if not legacy_spec:
        raise ValueError('Handwritten --spec requires explicit --legacy-spec; ordinary production uses --plan.')
    if '_director_plan' in read_json(spec_path):
        raise ValueError('A plan-derived spec cannot bypass binding through --legacy-spec; use --plan.')
    return _build(spec_path, presenter, output, subs_js, root)


def _build(spec_path, presenter, output, subs_js=None, root=ROOT, plan_path=None):
    raw_output = Path(output).expanduser()
    if raw_output.exists() or raw_output.is_symlink():
        _prepared_target(raw_output, plan_path)
    spec_path, presenter, output = [Path(p).expanduser().resolve() for p in (spec_path, presenter, output)]
    if not output.parent.is_dir() or not presenter.is_file():
        raise ValueError('The presenter file and output parent directory must exist.')
    spec = read_json(spec_path)
    key, pack_dir, manifest, fact = _resolve_spec(spec, root)
    if not isinstance(spec.get('brand'), str) or not spec['brand'].strip():
        raise ValueError('Fill spec.brand with the current project/account label.')
    if subs_js is not None:
        subs_js = Path(subs_js).expanduser().resolve()
        if not subs_js.is_file():
            raise ValueError('Subtitles file does not exist: ' + str(subs_js))
    if output.exists():
        with tempfile.TemporaryDirectory(prefix='.ui-scene-build-', dir=output.parent) as staging:
            generated = Path(staging).resolve() / 'project'
            receipt = _build_new(spec_path, presenter, generated, subs_js, spec, key, pack_dir, manifest, fact, root)
            _merge_prepared(generated, output, plan_path)
    else:
        receipt = _build_new(spec_path, presenter, output, subs_js, spec, key, pack_dir, manifest, fact, root)
    return {'project': str(output), 'receipt': str(output / 'scene-build-receipt.json'),
            'status': receipt['status'], 'pack': key, 'selected_scenes': receipt['selected_scenes'],
            'output': receipt['output'],
            'next': 'Inspect continuous motion with current narration, then scene render; building is not visual approval.'}


def render(project, output, audio=None, browser=None, playwright_module=None, segments=1, root=ROOT,
           plan_path=None, legacy_spec=False):
    project, output = Path(project).expanduser().resolve(), Path(output).expanduser().resolve()
    receipt = read_json(project / 'scene-build-receipt.json')
    if receipt.get('owner') != OWNER:
        raise ValueError('This is not a scene-builder project; use its original renderer.')
    destinations = (output, Path(str(output) + '.manifest.json'), Path(str(output) + '.scene.json'))
    if any(path.exists() or path.is_symlink() for path in destinations):
        raise ValueError('Refusing to replace an existing output or renderer manifest.')
    if not isinstance(segments, int) or isinstance(segments, bool) or segments < 1:
        raise ValueError('Render segments must be a positive integer.')
    import production_entry
    if legacy_spec:
        if plan_path is not None or receipt.get('mode') == 'director-plan':
            raise ValueError('A director-plan project cannot bypass shared preflight through --legacy-spec.')
        preflight = {'export_mode': 'legacy-spec', 'production_export': False}
    else:
        preflight = production_entry.export_check(project, plan_path, root=root)
        if preflight.get('backend') != 'complete-scenes':
            raise ValueError('Scene render requires a complete-scenes director plan or explicit legacy mode.')
    plan = read_json(project / 'macro_plan.json')
    if audio is not None:
        audio = Path(audio).expanduser().resolve()
        audio_mode = 'explicit-mix'
    else:
        mixed = project / 'mix.wav'
        audio = mixed if mixed.is_file() else project / 'voice.wav'
        audio_mode = 'existing-mix' if mixed.is_file() else 'preserved-voice-only'
    if not audio.is_file():
        raise ValueError('No narration audio exists; provide --audio or rebuild from the presenter.')
    args = [project, output, '--audio', audio, '--segments', segments,
            '--fps', plan['fps'], '--width', plan['width'], '--height', plan['height'],
            '--end', plan['durationSeconds']]
    if browser:
        args += ['--browser', browser]
    if playwright_module:
        args += ['--playwright-module', playwright_module]
    audio_fact = {'path': str(audio), 'mode': audio_mode, 'sha256': sha256(audio)}
    invocation = _run_python(Path(root) / ADU / 'scripts/export_project.py', args)
    manifest = Path(str(output) + '.manifest.json')
    if not output.is_file() or not manifest.is_file():
        raise ValueError('Renderer returned without a video and verification manifest.')
    report = {
        'schema_version': 1, 'owner': OWNER, 'status': 'rendered-awaiting-continuous-av-review',
        'project': str(project), 'video': str(output), 'sha256': sha256(output),
        'audio': audio_fact, 'export_mode': preflight['export_mode'],
        'renderer_manifest': str(manifest), 'renderer': invocation,
        'full_realtime_av_review': False, 'user_approved': False,
        'scope': 'Export succeeded; inspect the renderer manifest for technical details. This does not establish aesthetic quality.',
    }
    if preflight.get('production_export'):
        try:
            report['verification'] = production_entry.verify_output(
                project, output, plan_path, root=root, expected_plan_sha256=preflight['plan_sha256'])
        except (OSError, ValueError) as exc:
            report['verification'] = {'technical_passed': False, 'errors': [str(exc)],
                                      'aesthetic_approval': False, 'full_realtime_av_review': False}
        if sha256(audio) != audio_fact['sha256']:
            report['verification']['technical_passed'] = False
            report['verification'].setdefault('errors', []).append('Selected render audio changed during export.')
        report['technical_passed'] = report['verification']['technical_passed']
    else:
        report['technical_passed'] = False
        report['scope'] = 'Explicit legacy-spec compatibility export; shared production provenance is not established.'
    receipt_path = Path(str(output) + '.scene.json')
    write_new(receipt_path, report)
    return {**report, 'receipt': str(receipt_path)}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    listing = sub.add_parser('list', help='List complete scenes and their actual parameter requirements.')
    listing.add_argument('--pack', choices=PACKS)
    inspector = sub.add_parser('inspect', help='Read one exact source scene, preview and parameter contract.')
    inspector.add_argument('--pack', choices=PACKS, required=True)
    inspector.add_argument('--scene', required=True)
    skeleton = sub.add_parser('scaffold', help='Prepare selected scene bindings; this does not make a video.')
    skeleton.add_argument('--pack', choices=PACKS, required=True)
    skeleton.add_argument('--scenes', required=True, help='Explicit ordered subset, e.g. s01,s04,s01; repeats are independent.')
    skeleton.add_argument('--out', required=True, type=Path)
    compiler = sub.add_parser('compile', help='Derive scene parameters from one shared director plan; no media generation.')
    compiler.add_argument('--plan', required=True, type=Path)
    compiler.add_argument('--out', required=True, type=Path)
    creator = sub.add_parser('build', help='Bind new narration/media to the selected complete source scenes.')
    source_mode = creator.add_mutually_exclusive_group(required=True)
    source_mode.add_argument('--spec', type=Path)
    source_mode.add_argument('--plan', type=Path)
    creator.add_argument('--legacy-spec', action='store_true', help='Explicit compatibility for a handwritten scene spec.')
    creator.add_argument('--presenter', required=True, type=Path)
    creator.add_argument('--out', required=True, type=Path)
    creator.add_argument('--subs-js', type=Path)
    exporter = sub.add_parser('render', help='Export an existing bound scene project with original narration or supplied mix.')
    exporter.add_argument('--project', required=True, type=Path)
    exporter.add_argument('--out', required=True, type=Path)
    exporter.add_argument('--audio', type=Path)
    exporter.add_argument('--browser', type=Path)
    exporter.add_argument('--playwright-module', type=Path)
    exporter.add_argument('--segments', type=int, default=1)
    exporter.add_argument('--plan', type=Path)
    exporter.add_argument('--legacy-spec', action='store_true', help='Export an old spec project without claiming production readiness.')
    args = parser.parse_args(argv)
    try:
        if args.command == 'list':
            result = scene_catalog(pack=args.pack)
        elif args.command == 'inspect':
            result = inspect_scene(args.pack, args.scene)
        elif args.command == 'scaffold':
            result = scaffold(args.pack, args.scenes, args.out)
        elif args.command == 'compile':
            import scene_plan
            result = scene_plan.compile_plan(args.plan, args.out)
        elif args.command == 'build':
            result = build(args.spec, args.presenter, args.out, args.subs_js,
                           plan_path=args.plan, legacy_spec=args.legacy_spec)
        else:
            if args.segments < 1:
                raise ValueError('--segments must be positive.')
            result = render(args.project, args.out, args.audio, args.browser,
                            args.playwright_module, args.segments,
                            plan_path=args.plan, legacy_spec=args.legacy_spec)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 1 if args.command == 'render' and not args.legacy_spec and not result.get('technical_passed') else 0
    except (OSError, ValueError, KeyError) as exc:
        parser.error(str(exc))


if __name__ == '__main__':
    raise SystemExit(main())
