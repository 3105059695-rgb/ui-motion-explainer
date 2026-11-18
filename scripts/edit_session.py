"""A bounded view of the full project index. The editable timeline is the checkpoint."""
from contextlib import contextmanager
import hashlib
import json
import os
from pathlib import Path
import tempfile

import reference_edits as edits
import shot_direction

ROOT = Path(__file__).resolve().parents[1]
PLAN = 'reference-cut-plan.json'
CONTEXT = 'director-context.json'
OUTPUT = 'reference-output.json'
OWNER = 'ui-motion-fusion/edit-session'
MASTER = ('fps', 'width', 'height', 'duration_frames', 'narration', 'base_video', 'narration_stream_index')
QUOTE_SIZE = 220


def revision(value):
    data = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return hashlib.sha256(data).hexdigest()[:24]


def read_project(folder):
    folder = Path(folder).resolve()
    context = edits.read(folder / CONTEXT)
    plan = edits.read(folder / PLAN)
    if (context.get('generated_by') != 'ui-motion-fusion/director.py' or context.get('mode') != 'production'
            or plan.get('schema') != edits.SCHEMA or context['source']['sha256'] != plan['script_sha256']):
        raise ValueError('Use a prepared production project and its matching reference cut plan.')
    script = (folder / plan['script']).resolve()
    if not script.is_file() or edits.digest(script) != plan['script_sha256']:
        raise ValueError('The original narration is missing or changed. Restore the matching file or prepare the new script in a new project.')
    return folder, context, plan


def master_values(plan):
    return {k: plan[k] for k in MASTER if k in plan}


def relative(path, base):
    try:
        return os.path.relpath(path, base)
    except ValueError:
        return str(path)


def write_atomic(path, value):
    if path.is_symlink():
        raise ValueError('Refusing a linked project file: ' + str(path))
    temp = None
    try:
        with tempfile.NamedTemporaryFile('w', encoding='utf-8', newline='\n', dir=path.parent,
                                         delete=False, prefix='.edit-', suffix='.tmp') as stream:
            temp = Path(stream.name)
            json.dump(value, stream, ensure_ascii=False, indent=2)
            stream.write('\n')
        os.replace(temp, path)
    finally:
        if temp:
            temp.unlink(missing_ok=True)


@contextmanager
def plan_lock(folder):
    path = folder / '.reference-plan.lock'
    if path.is_symlink():
        raise ValueError('Refusing a linked plan lock.')
    with path.open('a+b') as handle:
        if os.name == 'nt':
            import msvcrt
            handle.seek(0)
            msvcrt.locking(handle.fileno(), msvcrt.LK_LOCK, 1)
            try:
                yield
            finally:
                handle.seek(0)
                msvcrt.locking(handle.fileno(), msvcrt.LK_UNLCK, 1)
        else:
            import fcntl
            fcntl.flock(handle, fcntl.LOCK_EX)
            try:
                yield
            finally:
                fcntl.flock(handle, fcntl.LOCK_UN)


def note_build(plan_path, project, plan_digest):
    folder = plan_path.parent
    if plan_path.name != PLAN or not (folder / CONTEXT).is_file():
        return
    dest = folder / OUTPUT
    with plan_lock(folder):
        if dest.is_symlink():
            return
        if dest.exists():
            try:
                pointer = edits.read(dest)
            except (OSError, ValueError):
                return
            if not isinstance(pointer, dict) or pointer.get('owner') != OWNER:
                return
        if edits.digest(plan_path) == plan_digest:
            write_atomic(dest, {'owner': OWNER, 'plan_sha256': plan_digest, 'project': relative(project, folder)})


def output_state(folder, override=None):
    link = folder / OUTPUT
    if override is None and (not link.is_file() or link.is_symlink()):
        return None
    if override is None:
        try:
            pointer = edits.read(link)
        except (OSError, ValueError):
            return None
        if not isinstance(pointer, dict) or pointer.get('owner') != OWNER or pointer.get('plan_sha256') != edits.digest(folder / PLAN):
            return None
        override = pointer['project']
    project = (folder / override).resolve()
    timeline = project / 'reference-timeline.json'
    if not timeline.is_file() or edits.read(timeline).get('source_plan_sha256') != edits.digest(folder / PLAN):
        return None
    result = {'stage': 'render', 'cut': str(project)}
    report = project / 'reference-render.json'
    if report.is_file():
        receipt = edits.read(report)
        media = Path(receipt['file'])
        if not media.is_file():
            media = project.parent / media.name
        if media.is_file():
            try:
                checked = edits.verify(project, media, folder / PLAN)
            except (ValueError, KeyError, OSError):
                result['reason'] = '已有导出与当前用片表或文件不匹配，须重新核对。'
            else:
                review_path = project / 'reference-review.html'
                return {'stage': 'review', 'cut': str(project), 'video': str(media),
                        'review': str(review_path) if review_path.is_file() else None,
                        'visible_sources': checked['visible_sources'], 'frames': checked['frames'],
                        'next': '用对照页按原速看当前镜、前后剪点，再开原声看整片。旧工程用 videos review 生成对照页。'}
    return result


def missing_fields(shot, recipe, units, folder, duration):
    missing = []
    if shot.get('unit') not in units:
        missing.append('unit')
    a, b = shot.get('start_frame'), shot.get('end_frame')
    if type(a) is not int or a < 0:
        missing.append('start_frame')
    if type(b) is not int or b <= (a if type(a) is int else 0) or (duration and b > duration):
        missing.append('end_frame')
    safe = {l['slot'] for l in recipe['layers'] if any(k['frame'] == 'safe' for k in l['keys'])}
    for key, slot in recipe['slots'].items():
        value = shot.get('inputs', {}).get(key) or {}
        if slot['kind'] == 'text':
            filled = isinstance(value.get('text'), str) and bool(value['text'].strip())
        elif value.get('from_project'):
            binding = value['from_project']
            filled = (not value.get('path') and isinstance(binding, dict) and bool(binding.get('capability'))
                      and bool(binding.get('project')) and (folder / binding['project']).is_dir())
        else:
            filled = isinstance(value.get('path'), str) and bool(value['path']) and (folder / value['path']).is_file()
        if not filled:
            missing.append('inputs.' + key)
        if key in safe:
            try:
                edits.box(value.get('placement'), key)
            except ValueError:
                missing.append('inputs.' + key + '.placement')
    return missing


def evidence(source, recipe, root):
    # Keep the exact authored sequence local. Expose one source and a real evidence locator.
    locator = source.get('locator', {})
    result = {'record': locator.get('path') or source['evidence']}
    for name in ('row_ids', 'shot_ids'):
        if locator.get(name):
            result[name] = locator[name][:4]
    if 'start' in locator and 'end' in locator:
        result['source_seconds'] = [locator['start'], locator['end']]
    elif source.get('motion_evidence', {}).get('approved_ranges'):
        result['approved_seconds'] = source['motion_evidence']['approved_ranges']
    for name in ('clip', 'preview'):
        path = source.get(name) or locator.get(name)
        if path and (root / path).is_file():
            result[name] = path
    timing = source.get('timing')
    if timing is None:  # Earlier project plans remain editable without an index rebuild.
        record = edits.read(root / edits.MOTION)['sources'].get(source['source_id'])
        row = {'id': source['source_id'], 'atlas': {'approved_ranges': source.get('motion_evidence', {}).get('approved_ranges', [])}}
        timing = edits.source_timing(row, record)
    result['motion'] = timing
    result['keyframes'] = {slot: [[k['at'], k['frame']] for layer in recipe['layers'] if layer['slot'] == slot for k in layer['keys']]
                           for slot in recipe['slots']}
    changes = []
    for layer in recipe['layers']:
        for key in layer['keys']:
            detail = ','.join(f'{name}={key[name]}' for name in ('cut','zoom','wipe','iris','opacity') if name in key)
            if detail:
                changes.append(f"{layer['slot']}@{key['at']} {detail}")
    if changes:
        result['changes'] = ' | '.join(changes)
    return result


def overview(project):
    folder, context, plan = read_project(project)
    coverage = context['video_sources']['all_submitted']
    by_source = {}
    for number, shot in enumerate(plan['shots'], 1):
        by_source.setdefault(shot['source_id'], []).append((number, shot.get('unit')))
    rows = []
    for source in coverage['required']:
        bindings = by_source.get(source['source_id'], [])
        first = bindings[0] if bindings else (None, None)
        rows.append([source['source_id'], first[0], first[1], len(bindings), source['contribution']])
    return {'project': str(folder), 'columns': ['source','first_shot','unit','shots','use'],
            'references': rows, 'corrections': [[r['source_id'], r['use']] for r in coverage['diagnostic']]}


def resume(project, shot_number=None, offset=0, cut=None, root=ROOT):
    folder, context, plan = read_project(project)
    root = Path(root)
    data = context['video_sources']
    coverage = data['all_submitted']
    required = {row['source_id']: row for row in coverage['required']}
    recipes = edits.read(root / edits.RECIPES)['recipes']
    if set(required) != set(recipes):
        raise ValueError('This project uses a different submitted-source inventory. Refresh its preparation before exporting.')
    units = {u['id']: u for u in data['units']}
    shots = plan['shots']
    unresolved = [missing_fields(s, recipes[s['source_id']], units, folder, plan.get('duration_frames')) for s in shots]
    assigned = {s['source_id'] for s in shots}
    absent = sorted(set(required) - assigned)
    ready = {s['source_id'] for s, fields in zip(shots, unresolved) if not fields}
    counts = {'indexed_sources': data['catalog']['source_records'],
              'catalog_entries': context['capabilities']['summary']['entry_count'],
              'submitted': len(required), 'corrections': len(coverage['diagnostic']),
              'sources_with_bindings': len(ready), 'shots_with_bindings': sum(not f for f in unresolved)}
    result = {'project': str(folder), 'coverage': counts}
    selected = context.get('reference_film')
    if selected:
        result['whole_film_reference'] = {'id': selected['id'], 'guide': 'references/reference-replication.md'}
    if shot_number is None:
        built = output_state(folder, cut)
        if built:
            return {**result, **built}
    if shot_number is None and absent:
        return {**result, 'stage': 'repair', 'missing_sources': absent,
                'repair_revision': revision(absent),
                'next': '用 save 提交 restore_missing=true 和本次 repair_revision，补回这些参考的空镜头。'}
    if shot_number is None:
        shot_number = next((i for i, fields in enumerate(unresolved, 1) if fields), None)
    if shot_number is None:
        master = master_values(plan)
        return {**result, 'stage': 'compose' if plan.get('duration_frames') else 'set-master',
                'master': master, 'master_revision': revision(master),
                'check': [r['use'] for r in coverage['diagnostic']],
                'next': '按原声定总帧数后用 videos compose；已有正片工程时可用 resume --cut <工程> 核对现状。'}
    if not 1 <= shot_number <= len(shots) or offset < 0:
        raise ValueError('Choose an existing one-based shot number and a nonnegative quote offset.')
    shot = shots[shot_number - 1]
    key = shot['source_id']
    source, recipe = required[key], recipes[key]
    unit = units.get(shot.get('unit')) or units.get(source.get('suggested_unit'))
    quote = unit['quote'] if unit else ''
    if offset > len(quote):
        raise ValueError('Quote offset exceeds the original narration unit.')
    card = {'number': shot_number, 'source': key, 'title': source['title'], 'scope': source['scope'],
            'action': recipe['action'], 'capability': recipe['capability'],
            'unit': unit['id'] if unit else None, 'quote': quote[offset:offset + QUOTE_SIZE],
            'inputs': {k: v['purpose'] for k, v in recipe['slots'].items()},
            'missing': unresolved[shot_number - 1], 'evidence': evidence(source, recipe, root)}
    direction = edits.read(root / shot_direction.DIRECTION)[key]
    card['watch'] = direction['watch']
    card['moving_reference'] = shot_direction.source_reference(root, source, direction)
    if offset + QUOTE_SIZE < len(quote):
        card['next_quote_offset'] = offset + QUOTE_SIZE
    if not unit:
        card['narration_file'] = plan['script']
    if unit:
        candidates = next((u.get('candidates', []) for u in context['capabilities'].get('units', []) if u['id'] == unit['id']), [])
        card['related_ui'] = [c['id'] for c in candidates[:3]]
    card['bound'] = {k: v for k, v in shot.items() if k in ('unit', 'start_frame', 'end_frame', 'rect') and v is not None}
    for name, value in shot.get('inputs', {}).items():
        if isinstance(value, dict) and any(v is not None for v in value.values()):
            summary = {}
            for field in ('path','text','from_project','in','placement','focus','fit'):
                if field not in value:
                    continue
                item = value[field]
                if field == 'from_project' and isinstance(item, dict):
                    item = {k: str(item[k])[:160] for k in ('project','capability','source_id') if k in item}
                if isinstance(item, str) and len(item) > 160:
                    item = item[:160] + '…'
                summary[field] = item
            card['bound'].setdefault('inputs', {})[name] = summary
    result.update(stage='edit', shot=card, revision=revision(shot),
                  master=master_values(plan), master_revision=revision(master_values(plan)))
    return result


def save(project, patch_path, root=ROOT):
    folder = Path(project).resolve(strict=True)
    patch = edits.read(Path(patch_path))
    with plan_lock(folder):
        _, context, plan = read_project(folder)
        units = {row['id'] for row in context['video_sources']['units']}
        recipes = edits.read(Path(root) / edits.RECIPES)['recipes']
        if not isinstance(patch, dict):
            raise ValueError('Supply a patch object.')
        changes = patch.get('changes', [])
        restore = patch.get('restore_missing', False)
        if type(restore) is not bool:
            raise ValueError('restore_missing must be a boolean.')
        if not isinstance(changes, list) or (not changes and not patch.get('master') and not restore):
            raise ValueError('Supply changed shots or master fields in the patch.')
        if restore:
            assigned = {shot['source_id'] for shot in plan['shots']}
            absent = [row for row in context['video_sources']['all_submitted']['required'] if row['source_id'] not in assigned]
            if patch.get('repair_revision') != revision(sorted(s['source_id'] for s in absent)):
                raise ValueError('Missing sources changed; resume to refresh the repair.')
            plan['shots'].extend(edits.unbound_shot(source) for source in absent)
        if 'master' in patch:
            master = patch['master']
            if patch.get('master_revision') != revision(master_values(plan)) or not isinstance(master, dict) or set(master) - set(MASTER):
                raise ValueError('Master fields changed or are unknown; resume before applying this patch.')
            for field in ('fps', 'width', 'height', 'duration_frames'):
                if field in master and (type(master[field]) is not int or master[field] < 1):
                    raise ValueError('Expected a positive integer: ' + field)
            for field in ('narration', 'base_video'):
                if field in master and master[field] is not None and not isinstance(master[field], str):
                    raise ValueError('Expected a media path: ' + field)
            if 'narration_stream_index' in master and (type(master['narration_stream_index']) is not int or master['narration_stream_index'] < 0):
                raise ValueError('Expected a nonnegative audio stream index.')
            plan.update(master)
        for change in changes:
            if not isinstance(change, dict) or 'set' not in change:
                raise ValueError('Supply numbered shot changes with a set object.')
            number = change.get('shot')
            if type(number) is not int or not 1 <= number <= len(plan['shots']):
                raise ValueError('Unknown shot in the saved patch.')
            shot = plan['shots'][number - 1]
            if change.get('revision') != revision(shot):
                raise ValueError('This shot changed since its card was read; resume that shot again.')
            fields = change['set']
            if not isinstance(fields, dict) or set(fields) - {'unit','start_frame','end_frame','rect','inputs'}:
                raise ValueError('Only episode timing, placement and material bindings are editable here.')
            for field, value in fields.items():
                if field == 'inputs':
                    if not isinstance(value, dict) or set(value) - set(shot['inputs']):
                        raise ValueError('Unknown input slot for this source.')
                    for name, binding in value.items():
                        if not isinstance(binding, dict):
                            raise ValueError('Each material binding must be an object.')
                        if set(binding) - {'path','from_project','in','text','placement','focus','fit'}:
                            raise ValueError('Unknown episode input field.')
                        kind = recipes[shot['source_id']]['slots'][name]['kind']
                        if (kind == 'text' and set(binding) & {'path','from_project','in'}
                                or kind != 'text' and 'text' in binding):
                            raise ValueError('The material must match the source slot kind.')
                        for key in ('text', 'path'):
                            if key in binding and binding[key] is not None and not isinstance(binding[key], str):
                                raise ValueError('Expected a string or null for ' + key)
                        if 'from_project' in binding:
                            request = binding['from_project']
                            if (not isinstance(request, dict) or set(request) - {'project','capability','source_id'}
                                    or not all(isinstance(request.get(k), str) and request[k] for k in ('project','capability'))
                                    or ('source_id' in request and not isinstance(request['source_id'], str)) or 'path' in binding):
                                raise ValueError('Supply one bound project and its capability ID.')
                        if 'placement' in binding:
                            edits.box(binding['placement'], name)
                        if 'in' in binding and (not edits.number(binding['in']) or binding['in'] < 0):
                            raise ValueError('Invalid media in-point.')
                        if 'focus' in binding:
                            focus = binding['focus']
                            if not isinstance(focus, list) or len(focus) != 2 or any(not edits.number(v) or not 0 <= v <= 1 for v in focus):
                                raise ValueError('Expected a normalized focus point.')
                        if 'fit' in binding and binding['fit'] not in ('cover','contain'):
                            raise ValueError('Expected a cover or contain fit.')
                        current = dict(shot['inputs'][name])
                        if 'path' in binding:
                            current.pop('from_project', None)
                        if 'from_project' in binding:
                            current.pop('path', None)
                        shot['inputs'][name] = {**current, **binding}
                else:
                    if field == 'unit' and value is not None and (not isinstance(value, str) or value not in units):
                        raise ValueError('Unknown narration unit.')
                    if field in ('start_frame','end_frame') and value is not None and (type(value) is not int or value < (field == 'end_frame')):
                        raise ValueError('Invalid frame number.')
                    if field == 'rect' and value is not None:
                        edits.box(value, 'rect')
                    shot[field] = value
            start, end = shot.get('start_frame'), shot.get('end_frame')
            if start is not None and end is not None and start >= end:
                raise ValueError('Shot end must follow its start.')
        write_atomic(folder / PLAN, plan)
    return resume(folder, root=root)
