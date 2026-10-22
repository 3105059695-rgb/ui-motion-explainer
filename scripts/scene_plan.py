"""Compile complete-scene parameters from the shared director plan.

This is a deterministic adapter, not a semantic author or an aesthetic judge.
The original pack compiler still checks its slot types, media and motion windows.
"""
from copy import deepcopy
import json
import math
from pathlib import Path

import scene_builder as builder

BACKEND = 'complete-scenes'
SETTINGS = {'brand', 'presenterLabel', 'subtitlePreset', 'faceTracking', 'presenterCrop',
            'textFontFile', 'monoFontFile', 'music', 'fadeEndSeconds'}
MEDIA_TYPES = {'image', 'video', 'audio', 'sequence', 'wall', 'wall-sprites'}


def is_scene_plan(plan):
    return isinstance(plan, dict) and isinstance(plan.get('production'), dict) and plan['production'].get('backend') == BACKEND


def local(value, base):
    if not isinstance(value, str) or not value.strip():
        raise ValueError('Expected an explicit local path.')
    path = Path(value).expanduser()
    return (path if path.is_absolute() else base / path).resolve()


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def fact(path):
    return {'path': str(path), 'sha256': builder.sha256(path)}


def checked_fact(value, base):
    if not isinstance(value, dict):
        raise ValueError('Expected a file path and sha256 binding.')
    path = local(value.get('path'), base)
    if not path.is_file() or builder.sha256(path) != value.get('sha256'):
        raise ValueError('Bound file is missing or changed: ' + str(path))
    return path


def inputs(spec, root):
    """Fingerprint the retained compiler/runtime and selected pack, not previews."""
    key, folder, _, _ = builder._resolve_spec(spec, root)
    source_root = Path(root) / builder.ADU
    files = set(path for path in folder.rglob('*') if path.is_file())
    files.update(path for area in ('scripts', 'template')
                 for path in (source_root / area).rglob('*')
                 if path.is_file() and '__pycache__' not in path.parts)
    return [fact(path.resolve()) for path in sorted(files)]


def _media_path(value, base):
    if isinstance(value, dict):
        value = deepcopy(value)
        value['path'] = str(local(value.get('path'), base))
        return value
    return str(local(value, base))


def derive(plan_path, root=builder.ROOT):
    """Return the sole derived spec and coverage ledger without writing files."""
    path = Path(plan_path).resolve()
    base, plan = path.parent, builder.read_json(path)
    if not is_scene_plan(plan):
        raise ValueError("production.backend must be 'complete-scenes'.")
    production = plan['production']
    key = production.get('pack')
    _, manifest, manifest_fact = builder.load_pack(key, root)
    settings = production.get('settings')
    if not isinstance(settings, dict) or set(settings) - SETTINGS:
        raise ValueError('production.settings contains unsupported fields; scene text/timing belongs to segments.')
    if not isinstance(settings.get('brand'), str) or not settings['brand'].strip():
        raise ValueError('production.settings.brand must name the current project/account.')
    source = checked_fact(plan.get('source'), base)
    source_text = source.read_text(encoding='utf-8-sig')
    timing = plan.get('timing', {})
    if timing.get('basis') != 'audio-aligned':
        raise ValueError('Complete-scene binding requires audio-aligned original narration.')
    audio = checked_fact(timing.get('audio_source'), base)
    alignment = checked_fact({'path': timing.get('alignment_evidence'),
                              'sha256': timing.get('alignment_sha256')}, base)
    aligned = builder.read_json(alignment)
    if (aligned.get('schema_version') != 1 or aligned.get('source_sha256') != plan['source']['sha256']
            or aligned.get('audio_sha256') != timing['audio_source']['sha256']):
        raise ValueError('Alignment must bind the current original text and audio hashes.')
    alignment_rows = aligned.get('segments')
    if not isinstance(alignment_rows, list) or any(not isinstance(row, dict) for row in alignment_rows):
        raise ValueError('Alignment segments must be actual source-span/audio-range rows.')
    alignment_by_id = {row.get('id'): row for row in alignment_rows}
    if len(alignment_by_id) != len(alignment_rows):
        raise ValueError('Duplicate alignment segment IDs.')
    delivery = plan.get('delivery', {})
    duration = delivery.get('duration_seconds')
    if delivery.get('scope') not in ('full', 'excerpt') or not number(duration) or duration <= 0:
        raise ValueError('delivery requires explicit full/excerpt scope and positive duration_seconds.')
    ranges = ([{'start': 0, 'end': len(source_text)}] if delivery['scope'] == 'full'
              else delivery.get('source_ranges'))
    if delivery['scope'] == 'full' and delivery.get('source_ranges') not in (None, ranges):
        raise ValueError('Full delivery must cover the entire original source.')
    if delivery['scope'] == 'excerpt' and not str(delivery.get('reason', '')).strip():
        raise ValueError('Excerpt delivery needs its explicit reason.')
    requested = set()
    if not isinstance(ranges, list) or not ranges:
        raise ValueError('Delivery requires nonempty source ranges.')
    prior_end = 0
    for span in ranges:
        if (not isinstance(span, dict) or type(span.get('start')) is not int or type(span.get('end')) is not int
                or not prior_end <= span['start'] < span['end'] <= len(source_text)):
            raise ValueError('Delivery source ranges must be ordered valid character spans.')
        requested.update(i for i in range(span['start'], span['end']) if not source_text[i].isspace())
        prior_end = span['end']
    if not requested:
        raise ValueError('Delivery scope contains no narration.')
    spec = deepcopy(settings)
    for field in ('textFontFile', 'monoFontFile'):
        if field in spec:
            spec[field] = str(local(spec[field], base))
    if isinstance(spec.get('music'), dict) and spec['music'].get('path'):
        spec['music'] = _media_path(spec['music'], base)
    spec.update(pack=manifest['id'], fps=manifest['fps'], scenes=[])
    spec.setdefault('music', {'mode': 'none'})
    spec['_scene_builder'] = {'owner': builder.OWNER, 'pack_key': key,
                              'manifest_sha256': manifest_fact['sha256']}
    scenes = {row['id']: row for row in manifest['scenes']}
    segments = plan.get('segments')
    if not isinstance(segments, list) or not segments:
        raise ValueError('The shared director plan needs its authored segments.')
    ledger, covered, cursor, seen = [], set(), 0, set()
    for segment in segments:
        ident, quote, span = segment.get('id'), segment.get('quote'), segment.get('span')
        if not isinstance(ident, str) or not ident.strip() or ident in seen:
            raise ValueError('Segment IDs must be nonempty and unique.')
        seen.add(ident)
        if span is None and isinstance(quote, str) and quote and source_text.count(quote) == 1:
            start = source_text.index(quote)
            span = {'start': start, 'end': start + len(quote)}
        if (not isinstance(span, dict) or type(span.get('start')) is not int or type(span.get('end')) is not int
                or not 0 <= span['start'] < span['end'] <= len(source_text)
                or source_text[span['start']:span['end']] != quote):
            raise ValueError(ident + ': quote/span must identify the original narration verbatim.')
        covered.update(i for i in range(span['start'], span['end']) if not source_text[i].isspace())
        output = segment.get('output', {})
        start, end = output.get('start_seconds'), output.get('end_seconds')
        if not number(start) or not number(end) or abs(start - cursor) > 1e-8 or end <= start:
            raise ValueError(ident + ': complete-scene output ranges must be positive and contiguous from zero.')
        frame_start, frame_end = start * spec['fps'], end * spec['fps']
        if abs(frame_start - round(frame_start)) > 1e-6 or abs(frame_end - round(frame_end)) > 1e-6:
            raise ValueError(ident + ': output times must fall on the selected pack frame clock.')
        row = alignment_by_id.get(ident, {})
        if row.get('span') != span or row.get('source_audio') != segment.get('source_audio'):
            raise ValueError(ident + ': alignment span/source_audio must match the shared plan.')
        audio_range = segment.get('source_audio')
        if not isinstance(audio_range, dict) or audio_range != output:
            raise ValueError(ident + ': complete-scene build preserves the edited presenter clock; alignment audio must equal output.')
        scene = segment.get('scene')
        if not isinstance(scene, dict) or scene.get('id') not in scenes or set(scene) - {'id', 'slots', 'cues'}:
            raise ValueError(ident + ': scene requires a known id, slots and cues; author duration only in output.')
        slots, cues = deepcopy(scene.get('slots', {})), deepcopy(scene.get('cues', {}))
        if not isinstance(slots, dict) or not isinstance(cues, dict):
            raise ValueError(ident + ': scene slots and cues must be objects.')
        for slot in scenes[scene['id']].get('slots', []):
            if slot['id'] in slots and slot.get('type') in MEDIA_TYPES:
                slots[slot['id']] = _media_path(slots[slot['id']], base)
        for cue in cues.values():
            if (not isinstance(cue, dict) or set(cue) != {'at'} or not number(cue.get('at'))
                    or not start <= cue['at'] <= end):
                raise ValueError(ident + ': cues must use absolute original-audio seconds as {at:number} inside this segment.')
        spec['scenes'].append({'id': ident, 'sceneId': scene['id'],
                               'durationFrames': round(frame_end) - round(frame_start),
                               'slots': slots, 'cues': cues})
        ledger.append({'segment_id': ident, 'span': span, 'output': output,
                       'scene_id': scene['id'], 'pack': key,
                       'source_block_sha256': scenes[scene['id']].get('sourceBlockSha256')})
        cursor = end
    if covered != requested:
        raise ValueError('Delivery coverage does not match its requested original narration scope.')
    if abs(cursor - duration) > 1e-8:
        raise ValueError('Mapped scenes must cover delivery.duration_seconds exactly.')
    builder._resolve_spec(spec, root)
    media_paths = set()
    for segment, row in zip(segments, spec['scenes']):
        for asset in segment.get('assets', []):
            if isinstance(asset, dict) and asset.get('status') == 'ready':
                media_paths.add(checked_fact(asset, base))
        for slot in scenes[row['sceneId']].get('slots', []):
            if slot.get('type') not in MEDIA_TYPES or slot['id'] not in row['slots']:
                continue
            value = row['slots'][slot['id']]
            target = local(value.get('path') if isinstance(value, dict) else value, base)
            if target.is_dir():
                media_paths.update(item.resolve() for item in target.rglob('*') if item.is_file())
            elif target.is_file():
                media_paths.add(target)
            else:
                raise ValueError('Scene material does not exist: ' + str(target))
    for field in ('textFontFile', 'monoFontFile'):
        if field in spec:
            media_paths.add(Path(spec[field]))
    if isinstance(spec.get('music'), dict) and spec['music'].get('path'):
        media_paths.add(Path(spec['music']['path']))
    spec['_director_plan'] = {'path': str(path), 'sha256': builder.sha256(path),
                              'source': fact(source), 'audio': fact(audio), 'alignment': fact(alignment),
                              'materials': [fact(item) for item in sorted(media_paths)]}
    return spec, ledger


def validate_runtime(spec, macro):
    """Compare actual compiler output rows to plan-derived identities and clock."""
    rows = macro.get('scenes')
    if not isinstance(rows, list) or len(rows) != len(spec['scenes']):
        raise ValueError('Compiled runtime scene count differs from the shared plan.')
    cursor = 0
    for expected, actual in zip(spec['scenes'], rows):
        end = cursor + expected['durationFrames']
        if (actual.get('id') != expected['id'] or actual.get('sceneId') != expected['sceneId']
                or actual.get('startFrame') != cursor or actual.get('endFrame') != end):
            raise ValueError('Compiled runtime scene identity/clock differs from the shared plan.')
        cursor = end
    if (macro.get('fps') != spec['fps'] or macro.get('durationFrames') != cursor
            or abs(macro.get('durationSeconds', -1) - cursor / spec['fps']) > 1e-6):
        raise ValueError('Compiled runtime duration/fps differs from the shared plan.')


def check_binding(plan_path, root=builder.ROOT):
    """Run the existing common director checks, without claiming render readiness."""
    import director
    report = director.check(plan_path, root=root, scene_binding_only=True)
    if not report.get('render_ready') or not report.get('current_style_ready'):
        raise ValueError('Scene binding blocked: ' + '; '.join(
            [*report.get('errors', []), *report.get('readiness_blockers', [])] or
            ['Current visual resources are not ready.']))
    return derive(plan_path, root)


def compile_plan(plan_path, output, root=builder.ROOT):
    spec, ledger = check_binding(plan_path, root)
    builder.write_new(output, spec)
    return {'spec': str(Path(output).resolve()), 'plan': str(Path(plan_path).resolve()),
            'plan_sha256': spec['_director_plan']['sha256'], 'ledger': ledger,
            'production_ready': False, 'media_generated': False,
            'notice': 'Derived parameters only; the original compiler must still validate media and motion windows.'}


def validate(plan_path, root=builder.ROOT, require_built=True):
    result = {'ready': False, 'errors': [], 'warnings': [], 'ledger': [],
              'backend': BACKEND, 'scope': 'Plan/source coverage and complete-scene build provenance only; no visual or audio review.'}
    try:
        spec, ledger = derive(plan_path, root)
        path, base = Path(plan_path).resolve(), Path(plan_path).resolve().parent
        result.update(ledger=ledger, duration_seconds=ledger[-1]['output']['end_seconds'],
                      entrypoint={'path': 'index.html'}, delivery_scope=builder.read_json(path)['delivery']['scope'])
        if require_built:
            receipt = builder.read_json(base / 'scene-build-receipt.json')
            if receipt.get('owner') != builder.OWNER or receipt.get('mode') != 'director-plan':
                raise ValueError('Production scene project must be built from this director plan; old specs require explicit --legacy-spec.')
            if receipt.get('director_plan') != spec['_director_plan']:
                raise ValueError('Director plan or original sources changed after building; rebuild into a new project.')
            checked_fact(receipt.get('presenter'), base)
            if receipt.get('subtitles') is not None:
                checked_fact(receipt['subtitles'], base)
            if builder.read_json(base / 'scene-spec.json') != spec:
                raise ValueError('Derived scene spec differs from its director plan; do not hand-edit derived files.')
            expected_sources = inputs(spec, root)
            if receipt.get('source_files') != expected_sources:
                raise ValueError('Selected source pack/compiler changed after build; review and rebuild.')
            generated = receipt.get('generated_files')
            if not isinstance(generated, list) or not generated:
                raise ValueError('Build receipt is missing actual generated-file hashes.')
            for record in generated:
                target = checked_fact(record, base)
                if not target.is_relative_to(base):
                    raise ValueError('Generated file binding escapes the project.')
            required = {'index.html', 'scenes.js', 'macro_plan.json', 'macro_plan.js', 'macro_main.js', 'voice.wav'}
            if not required <= {record['path'] for record in generated}:
                raise ValueError('Build receipt omits required renderer inputs.')
            macro = builder.read_json(base / 'macro_plan.json')
            validate_runtime(spec, macro)
            if abs(macro['durationSeconds'] - result['duration_seconds']) > 1e-6:
                raise ValueError('Compiled runtime duration does not match the shared plan.')
            result['build_receipt_sha256'] = builder.sha256(base / 'scene-build-receipt.json')
        result['ready'] = True
    except (OSError, ValueError, KeyError, TypeError, AttributeError) as exc:
        result['errors'].append('complete-scenes: ' + str(exc))
    return result


def prepared_files(plan_path):
    """Existing authoring inputs may coexist with untouched direct-prepare output."""
    path = Path(plan_path).resolve()
    plan, base = builder.read_json(path), path.parent
    values = [path, local(plan['timing']['alignment_evidence'], base)]
    for record in (plan['source'], plan['timing']['audio_source']):
        values.append(local(record['path'], base))
    for segment in plan['segments']:
        for asset in segment.get('assets', []):
            if isinstance(asset, dict) and asset.get('path'):
                values.append(local(asset['path'], base))
    return [value for value in values if value.is_relative_to(base)]
