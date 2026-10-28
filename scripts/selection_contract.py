"""Verify narration selections against sources and the project's actual timeline.

This is file/hash/range/static-dependency verification, not JavaScript execution,
semantic judgement, media review, or aesthetic approval. No network or generation.
"""
import hashlib
import json
import math
from pathlib import Path
import re
from urllib.parse import unquote

import aigc_assets
import source_study
from selection import library_contribution_allowed, component_records
import style_registry

ROOT = Path(__file__).resolve().parents[1]
TEXT_EXTENSIONS = {'.html', '.htm', '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.css'}


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def canonical_digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                    separators=(',', ':')).encode('utf-8')).hexdigest()


def text(value):
    return isinstance(value, str) and bool(value.strip())


def number(value):
    return type(value) in (int, float) and math.isfinite(value)


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def library_source_options(record, catalog, root=None):
    """Resolve this catalog entry's recorded sources, not arbitrary nearby files."""
    source = record.get('source', [])
    options = [dict(item) for item in source if isinstance(item, dict) and item.get('path')] \
        if isinstance(source, list) else []
    if isinstance(source, dict) and source.get('path'):
        options.append(dict(source))
    if isinstance(source, dict) and source.get('catalog'):
        match = re.fullmatch(r'families\[([^\]]+)\]\.source', source['catalog'])
        family = next((row for row in catalog.get('families', [])
                       if isinstance(row, dict) and match and row.get('id') == match.group(1)), None)
        if family:
            options.extend({**item, 'selector': source.get('selector')}
                           for item in family.get('source', [])
                           if isinstance(item, dict) and item.get('path'))
    implementation = record.get('implementation') or {}
    if implementation.get('kind') == 'editing-kit' and text(implementation.get('path')):
        options.append({'path': implementation['path'], 'selector': implementation.get('effect')})
    options.extend(dict(item) for item in implementation.get('sources', [])
                   if isinstance(item, dict) and item.get('path'))
    options.extend(dict(item) for item in (record.get('current_media_presence') or {}).values()
                   if isinstance(item, dict) and item.get('path'))
    if root is not None and any(row.get('id') == record.get('id') for row in catalog.get('reference_cases', [])):
        # Use the same explicit module overlay as inspect. Historical relative
        # paths are not a license to bind arbitrary neighboring files.
        from resource_inventory import inspect_reference
        try:
            current = inspect_reference(record['id'], root=root)
        except (OSError, ValueError, KeyError, TypeError):
            return options  # Missing optional local history adds no source authority.
        project = Path(current['project']).resolve() if current.get('project') else None
        for value in current.get('entrypoints', []):
            entry = Path(value).resolve()
            if project is None or not entry.is_relative_to(project) or not entry.is_file():
                continue
            if entry.suffix.lower() in TEXT_EXTENSIONS:
                try:
                    graph, _ = dependency_graph(entry)
                except (OSError, ValueError, UnicodeError):
                    continue
                options.extend({'path': str(path), 'require_selector': True}
                               for path in graph if path.is_relative_to(project))
            elif entry.suffix.lower() == '.py':
                options.append({'path': str(entry), 'require_selector': True})
        options.extend({'path': value['path']} for value in current.get('media', {}).values()
                       if value.get('exists') and value.get('path'))
    return options


def library_source_matches(record, catalog, root, bound_path, binding):
    """Check registered bytes and item selector; this cannot judge visual similarity."""
    selector = binding.get('selector')
    if record.get('id') == 'adu-mechanisms':
        # The family spans hundreds of scenes; bind the existing item ID and its
        # recorded source/preview/poster rather than any file under the pack.
        base = root / 'assets/adu-reference'
        try:
            item = next((item for item in read_json(base / 'catalog.json').get('items', [])
                         if isinstance(item, dict) and item.get('id') == selector), None)
            return bool(item and any(
                text(item.get(key)) and (base / item[key]).is_file()
                and digest(base / item[key]) == binding.get('sha256')
                for key in ('source', 'preview', 'poster')))
        except (OSError, ValueError, TypeError):
            return False
    options = library_source_options(record, catalog, root)
    all_records = [row for key in ('capabilities', 'families', 'software_presets', 'reference_cases', 'sample_records', 'recipes')
                   for row in catalog.get(key, []) if isinstance(row, dict)]
    other_paths = {(root / option['path']).resolve() for row in all_records
                   if row is not record and row.get('id') != record.get('id')
                   for option in library_source_options(row, catalog)}
    for option in options:
        original = (root / option['path']).resolve()
        from_directory = original.is_dir()
        if from_directory:
            # A registered source directory permits its actual local child, not
            # a hash search over unrelated projects or a synthetic screenshot.
            if not bound_path.is_relative_to(original):
                continue
            original = bound_path
        if not original.is_file() or digest(original) != binding.get('sha256'):
            continue
        expected = option.get('selector')
        if text(expected):
            if selector != expected:
                continue
        elif from_directory or original in other_paths or option.get('require_selector'):
            if not text(selector):
                continue
            if not from_directory and not option.get('require_selector'):
                ident = str(record.get('id', ''))
                if selector not in (ident, '#' + ident.lower(), 'render' + ident):
                    continue
        elif selector is not None and not text(selector):
            continue
        if text(selector):
            try:
                value = original.read_text(encoding='utf-8-sig')
            except (UnicodeError, OSError):
                continue
            # Catalog JSON locators and documented Markdown/HTML anchors retain
            # their original selector syntax. Verify the selected ID is present.
            match = re.fullmatch(r'(?:\w+)?\[(?:id|slug)=([^\]]+)\]|(?:id|slug)=(.+)', selector)
            token = next((group for group in match.groups() if group), '') if match else selector.lstrip('#')
            if token.lower() not in value.lower():
                continue
        return True
    return False


def aigc_style_binding(context):
    """Bind the selected art direction, without fixing an IP or all scene images."""
    if context.get('status') != 'resolved' or not context.get('selected_style_set'):
        return None
    rules = {'style_rules': context.get('style_rules', {}),
             'routing_policy': context.get('routing_policy', {}),
             'reference_only': True, 'default_character_required': False}
    override = context.get('direction_override')
    if isinstance(override, dict):
        # Bind request and current images by content, not machine-specific paths.
        rules['direction_override'] = {'scope': override['scope'],
            'source': {key: override['source'][key] for key in ('kind', 'sha256', 'quote')},
            'reference_sha256': sorted(row['sha256'] for row in override['style_references'])}
    return {'schema_version': 1, 'style_set_id': context['selected_style_set'],
            'rules_sha256': canonical_digest(rules)}


def _without_comments(value):
    # Preserve quoted strings while removing comments. This is not a JS parser.
    pattern = r'''("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|/\*[\s\S]*?\*/|//[^\n\r]*|<!--[\s\S]*?-->'''
    return re.sub(pattern, lambda match: match.group(1) or '', value)


def _code_only(value):
    return re.sub(r'''"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`''', '""', value)


def _dependency_path(raw, base, entry):
    """Resolve a literal URL inside the renderer's local HTTP document root."""
    raw = raw.split('?', 1)[0].split('#', 1)[0]
    if not raw or raw.startswith('//') or re.match(r'^[A-Za-z][\w+.-]*:', raw):
        return None
    raw = unquote(raw)
    return ((entry.parent / raw.lstrip('/')) if raw.startswith('/') else (base / raw)).resolve()


def _document_base(entry):
    """Window fetch uses document.baseURI, not the importing module's directory."""
    if entry.suffix.lower() not in ('.html', '.htm'):
        return entry.parent
    content = _without_comments(entry.read_text(encoding='utf-8-sig'))
    match = re.search(r'''<base\b[^>]*\bhref\s*=\s*["']([^"']+)["']''', content, re.I)
    if not match:
        return entry.parent
    raw = match.group(1)
    resolved = _dependency_path(raw, entry.parent, entry)
    if resolved is None:
        raise ValueError('External/dynamic document baseURI is unsupported by local timeline verification; use an explicit local document base for this verifier.')
    return resolved if raw.split('?', 1)[0].split('#', 1)[0].endswith('/') else resolved.parent


def dependency_graph(entry):
    """Follow literal local script/import/fetch links, never arbitrary JSON claims."""
    entry = Path(entry).resolve()
    document_base = _document_base(entry)
    pending, content, edges = [entry], {}, []
    patterns = (
        ('html', r'''(?:src|href)\s*=\s*["']([^"']+)["']'''),
        ('import', r'''\b(?:import|export)\s+(?:[^;\n]*?\s+from\s*)?["']([^"']+)["']'''),
        ('fetch', r'''\bfetch\s*\(\s*["']([^"']+)["']'''),
        ('read', r'''\b(?:require|import)\s*\(\s*["']([^"']+)["']'''),
        ('module-url', r'''\bfetch\s*\(\s*new\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\s*\.\s*meta\s*\.\s*url\s*\)'''),
    )
    while pending:
        path = pending.pop()
        if path in content or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        value = _without_comments(path.read_text(encoding='utf-8-sig'))
        content[path] = value
        for kind, pattern in patterns:
            for match in re.finditer(pattern, value):
                base = document_base if kind in ('fetch', 'html') else path.parent
                target = _dependency_path(match.group(1), base, entry)
                if target is not None and target.is_file():
                    edges.append({'from': path, 'to': target, 'kind': kind})
                    pending.append(target)
    return content, edges


def _timeline_assignment(content, consumer, target, binding, entry):
    """Recognize a direct JSON import/read assigned to the declared variable."""
    ident = re.escape(binding)
    for match in re.finditer(r'\bimport\s+' + ident + r'''\s+from\s*["']([^"']+)["']''', content):
        if _dependency_path(match.group(1), consumer.parent, entry) == target:
            return True
    assignment = re.search(r'\b(?:const|let|var)\s+' + ident + r'\s*=\s*([^;]+)', content)
    if not assignment:
        return False
    value = assignment.group(1)
    for match in re.finditer(r'''\b(fetch|require|import)\s*\(\s*["']([^"']+)["']''', value):
        base = _document_base(entry) if match.group(1) == 'fetch' else consumer.parent
        if _dependency_path(match.group(2), base, entry) == target and (
                match.group(1) != 'fetch' or re.search(r'\.\s*json\s*\(', value)):
            return True
    for match in re.finditer(r'''\bfetch\s*\(\s*new\s+URL\s*\(\s*["']([^"']+)["']\s*,\s*import\s*\.\s*meta\s*\.\s*url\s*\)''', value):
        if _dependency_path(match.group(1), consumer.parent, entry) == target and re.search(r'\.\s*json\s*\(', value):
            return True
    return False


def validate(plan, project, root=ROOT, source_text=None):
    """Return current selection evidence; old plans stay readable, not production-ready."""
    errors, warnings, ledger = [], [], []
    project, root = Path(project).resolve(), Path(root).resolve()
    version = plan.get('selection_contract_version')
    result = {'ready': False, 'errors': errors, 'warnings': warnings, 'ledger': ledger,
        'scope': 'Source coverage, current art-direction binding, content hashes and static runtime dependency/timeline links only. '
                 'Does not certify JavaScript execution, source suitability, rendered appearance or audio alignment by listening.'}
    if version is None:
        warnings.append('Legacy plan has no selection/implementation evidence contract; selection_ready=false. '
                        'Add explicit full/excerpt scope and per-event choices before production export.')
        return result
    if type(version) is not int or version != 1:
        errors.append('selection_contract_version: must be integer 1')
        return result

    def error(where, message):
        errors.append(where + ': ' + message)

    def path(value, origin='project'):
        if not text(value) or '://' in value or origin not in ('project', 'skill'):
            raise ValueError('expected local path and origin project or skill')
        return ((root if origin == 'skill' else project) / value).resolve()

    def bound_file(record, where):
        if not isinstance(record, dict):
            error(where, 'requires {path,sha256}; origin may be project or skill')
            return None
        try:
            target = path(record.get('path'), record.get('origin', 'project'))
            if not target.is_file():
                raise ValueError('file is missing: ' + str(target))
            if record.get('sha256') != digest(target):
                raise ValueError('content SHA-256 differs; recheck the changed source/implementation before updating the binding')
            return target
        except (OSError, ValueError, TypeError) as exc:
            error(where, str(exc))
            return None

    def time_range(value, where):
        if not isinstance(value, dict) or not number(value.get('start_seconds')) or not number(value.get('end_seconds')) \
                or not 0 <= value['start_seconds'] < value['end_seconds']:
            error(where, 'requires finite 0 <= start_seconds < end_seconds')
            return None
        return (value['start_seconds'], value['end_seconds'])

    def source_range(value, where):
        if not isinstance(value, dict) or type(value.get('start')) is not int or type(value.get('end')) is not int \
                or not 0 <= value['start'] < value['end'] <= len(source_text or ''):
            error(where, 'requires valid source character offsets {start,end}')
            return None
        return (value['start'], value['end'])

    if not isinstance(source_text, str):
        error('selection.source', 'source narration must be readable before checking coverage')
        return result
    delivery = plan.get('delivery')
    if not isinstance(delivery, dict) or delivery.get('scope') not in ('full', 'excerpt'):
        error('delivery.scope', 'explicit full or excerpt is required; do not infer a whole film from a partial plan')
        return result
    duration = delivery.get('duration_seconds')
    if not number(duration) or duration <= 0:
        error('delivery.duration_seconds', 'must be finite and positive')
        duration = None
    if delivery['scope'] == 'full':
        ranges = [(0, len(source_text))]
        if delivery.get('source_ranges') not in (None, [{'start': 0, 'end': len(source_text)}]):
            error('delivery.source_ranges', 'full scope covers the entire original source')
    else:
        if not text(delivery.get('reason')):
            error('delivery.reason', 'explain the explicitly selected excerpt scope')
        values = delivery.get('source_ranges')
        if not isinstance(values, list) or not values:
            error('delivery.source_ranges', 'excerpt needs the selected original-source ranges')
            values = []
        ranges = [pair for i, value in enumerate(values)
                  if (pair := source_range(value, f'delivery.source_ranges[{i}]')) is not None]
        if any(b[0] < a[1] for a, b in zip(ranges, ranges[1:])):
            error('delivery.source_ranges', 'excerpt ranges must be ordered and nonoverlapping')
    requested = {i for start, end in ranges for i in range(start, end) if not source_text[i].isspace()}
    if not requested:
        error('delivery.source_ranges', 'scope contains no narration')

    manifest_path = bound_file(plan.get('implementation_manifest'), 'implementation_manifest')
    manifest, timeline, graph, edges = {}, {}, {}, []
    entry = None
    if manifest_path is not None:
        try:
            manifest = read_json(manifest_path)
            if not isinstance(manifest, dict) or manifest.get('schema_version') != 1:
                manifest = {}
                raise ValueError('requires schema_version 1 object')
            entry = bound_file(manifest.get('entrypoint'), 'implementation_manifest.entrypoint')
            timeline_path = bound_file(manifest.get('timeline'), 'implementation_manifest.timeline')
            if entry is not None:
                graph, edges = dependency_graph(entry)
                if not graph:
                    error('implementation_manifest.entrypoint', 'requires a supported actual HTML/JS/TS entry, not a metadata document')
            if timeline_path is not None:
                timeline = read_json(timeline_path)
                if not isinstance(timeline, dict) or timeline.get('schema_version') != 1:
                    raise ValueError('runtime timeline requires schema_version 1 object')
                spec = manifest['timeline']
                consumer = path(spec.get('consumer'))
                binding = spec.get('binding')
                if consumer not in graph or not any(edge['from'] == consumer and edge['to'] == timeline_path
                        and edge['kind'] in ('read', 'import', 'fetch', 'module-url') for edge in edges):
                    error('implementation_manifest.timeline', 'timeline must be imported/fetched by code reachable from the actual render entry; '
                          'use a literal document-relative fetch, module-relative import/require, or fetch(new URL(literal, import.meta.url)); dynamic URL forms are unsupported')
                if not text(binding) or re.fullmatch(r'[A-Za-z_$][\w$]*', binding) is None:
                    error('implementation_manifest.timeline.binding', 'requires the runtime variable that reads the timeline')
                elif not re.search(r'\b' + re.escape(binding) + r'\s*\.\s*segments\b', _code_only(graph.get(consumer, ''))):
                    error('implementation_manifest.timeline.binding', 'reachable consumer must use <binding>.segments; an unused sidecar fetch is insufficient')
                elif not _timeline_assignment(graph.get(consumer, ''), consumer, timeline_path, binding, entry):
                    error('implementation_manifest.timeline.binding', 'the consumed variable must be assigned from this exact JSON timeline import/fetch/require')
                if timeline.get('source_sha256') != plan.get('source', {}).get('sha256'):
                    error('implementation_manifest.timeline.source_sha256', 'runtime timeline belongs to different narration')
                if timeline.get('duration_seconds') != duration:
                    error('implementation_manifest.timeline.duration_seconds', 'must equal delivery duration')
            files = manifest.get('files')
            if not isinstance(files, list):
                error('implementation_manifest.files', 'bind every local text dependency reached from the entry')
                files = []
            bound = {p for i, record in enumerate(files)
                     if (p := bound_file(record, f'implementation_manifest.files[{i}]')) is not None}
            missing = set(graph) - bound - ({entry} if entry else set())
            if missing:
                error('implementation_manifest.files', 'unbound reachable implementation files: ' + ', '.join(map(str, sorted(missing))))
        except (OSError, ValueError, TypeError, KeyError) as exc:
            error('implementation_manifest', str(exc))
    timeline_rows = timeline.get('segments', []) if isinstance(timeline, dict) else []
    if not isinstance(timeline_rows, list) or any(not isinstance(row, dict) or not text(row.get('id')) for row in timeline_rows):
        error('implementation_manifest.timeline.segments', 'requires rows with stable segment IDs')
        timeline_rows = []
    if len({row['id'] for row in timeline_rows}) != len(timeline_rows):
        error('implementation_manifest.timeline.segments', 'duplicate segment IDs')
    mapped = {row['id']: row for row in timeline_rows}

    # These are the actual export inputs, not a second sound plan. Old projects
    # without event audio remain valid; declared audio must reach the timeline.
    sound_events = plan.get('sound_events', [])
    if sound_events != timeline.get('sound_events', []):
        error('sound_events', 'plan and consumed timeline must contain the same event audio, including source ranges and gain')
    if not isinstance(sound_events, list):
        error('sound_events', 'must be an array')
        sound_events = []
    sound_ids = set()
    for i, sound in enumerate(sound_events):
        where = f'sound_events[{i}]'
        if not isinstance(sound, dict):
            error(where, 'must be an actual sound file and timed event')
            continue
        if not text(sound.get('id')) or sound['id'] in sound_ids:
            error(where + '.id', 'must be nonempty and unique')
        sound_ids.add(sound.get('id') if isinstance(sound.get('id'), str) else None)
        bound_file(sound, where)
        if not number(sound.get('at')) or sound['at'] < 0 or (duration is not None and sound['at'] >= duration):
            error(where + '.at', 'must start on the absolute output clock within the delivery')
        if not number(sound.get('source_in')) or not number(sound.get('source_out')) or not 0 <= sound['source_in'] < sound['source_out']:
            error(where, 'requires finite 0 <= source_in < source_out; decoded duration is checked by the exporter')
        if not number(sound.get('gain', 0.3)) or not 0 <= sound.get('gain', 0.3) <= 1:
            error(where + '.gain', 'must be finite between 0 and 1')
        if sound.get('segment_id'):
            linked = mapped.get(sound['segment_id'])
            if linked is None:
                error(where + '.segment_id', 'must identify a timeline segment')
            elif sound.get('event_id') and not any(isinstance(event, dict) and event.get('id') == sound['event_id']
                                                   for event in linked.get('events', [])):
                error(where + '.event_id', 'must identify an event of the linked segment')
        elif sound.get('event_id'):
            error(where + '.event_id', 'also specify segment_id to locate the action')

    timing = plan.get('timing') if isinstance(plan.get('timing'), dict) else {}
    alignment = {}
    if timing.get('basis') == 'audio-aligned':
        alignment_path = bound_file({'path': timing.get('alignment_evidence'),
            'sha256': timing.get('alignment_sha256')}, 'timing.alignment_evidence')
        if alignment_path is not None:
            try:
                alignment = read_json(alignment_path)
                if not isinstance(alignment, dict) or alignment.get('schema_version') != 1:
                    raise ValueError('requires structured schema_version 1 alignment, not an empty placeholder')
                if alignment.get('source_sha256') != plan.get('source', {}).get('sha256') \
                        or alignment.get('audio_sha256') != timing.get('audio_source', {}).get('sha256'):
                    raise ValueError('alignment source/audio hashes do not match the preserved source')
            except (OSError, ValueError, TypeError) as exc:
                error('timing.alignment_evidence', str(exc))
    aligned_rows = alignment.get('segments', []) if isinstance(alignment, dict) else []
    if not isinstance(aligned_rows, list) or any(not isinstance(row, dict) or not text(row.get('id')) for row in aligned_rows):
        aligned_rows = []
        error('timing.alignment_evidence.segments', 'requires actual source-span/audio-range rows')
    aligned = {row.get('id'): row for row in aligned_rows}
    if len(aligned) != len(aligned_rows):
        error('timing.alignment_evidence.segments', 'duplicate segment IDs')

    segments = plan.get('segments', [])
    if not isinstance(segments, list):
        segments = []
    covered, output_ranges = set(), []
    aigc_context = None
    for index, segment in enumerate(segments):
        if not isinstance(segment, dict):
            continue
        where = f'segments[{index}]'
        assets = segment.get('assets') if isinstance(segment.get('assets'), list) else []
        ident, quote = segment.get('id'), segment.get('quote')
        span = segment.get('span')
        if span is None and text(quote) and source_text.count(quote) == 1:
            start = source_text.index(quote)
            span = {'start': start, 'end': start + len(quote)}
        pair = source_range(span, where + '.span')
        if pair is not None:
            covered.update(i for i in range(*pair) if not source_text[i].isspace())
        output = time_range(segment.get('output'), where + '.output')
        if output is not None:
            if duration is not None and output[1] > duration + 1e-6:
                error(where + '.output', 'ends beyond delivery duration')
            output_ranges.append((output, segment.get('output', {}).get('overlap_reason')))
        selection = segment.get('selection')
        if not isinstance(selection, dict):
            error(where + '.selection', 'record reference/original/presenter choice and AIGC use/non-use rationale')
            selection = {}
        mode = selection.get('mode')
        if mode not in ('reference', 'original', 'presenter'):
            error(where + '.selection.mode', 'must be reference, original or presenter; no effect is mandatory')
        if not text(selection.get('reason')):
            error(where + '.selection.reason', 'explain this narration-specific choice or why prior effects are not used')
        if mode == 'presenter' and segment.get('carrier') != 'presenter':
            error(where + '.selection.mode', 'presenter choice must retain the presenter carrier')
        evidence = selection.get('evidence', [])
        if not isinstance(evidence, list):
            error(where + '.selection.evidence', 'must be an array of file/hash/role bindings')
            evidence = []
        evidence_paths, evidence_hashes, art_paths, design_paths = set(), set(), set(), set()
        for n, record in enumerate(evidence):
            target = bound_file(record, where + f'.selection.evidence[{n}]')
            if not isinstance(record, dict) or not text(record.get('role')):
                error(where + f'.selection.evidence[{n}].role', 'state what this source contributes')
            if target is not None:
                evidence_paths.add(target)
                evidence_hashes.add(record['sha256'])
                if record.get('role') == 'art-style-reference':
                    art_paths.add(target)
                if record.get('role') == 'library-design-reference':
                    design_paths.add(target)
        refs = segment.get('source_study_refs', [])
        library_refs = selection.get('library_refs', [])
        if not isinstance(library_refs, list):
            error(where + '.selection.library_refs', 'must be an array of specific effect-library entries')
            library_refs = []
        if mode == 'reference':
            adapted_study = isinstance(refs, list) and any(isinstance(ref, dict) and ref.get('usage', 'adapt') == 'adapt' for ref in refs)
            if not adapted_study and not library_refs:
                error(where + '.source_study_refs', 'reference selection needs a concrete source-study example or an effect-library design reference')
        if library_refs:
            indexes = {'capability': 'capabilities', 'family': 'families',
                       'software-preset': 'software_presets', 'reference': 'reference_cases', 'sample': 'sample_records',
                       'recipe': 'recipes', 'component': 'components'}
            required_catalogs, loaded_catalogs = set(), {}
            for n, ref in enumerate(library_refs):
                target = where + f'.selection.library_refs[{n}]'
                if not isinstance(ref, dict) or ref.get('kind') not in indexes:
                    error(target, 'select capability, family, software-preset, reference, sample, recipe or component with its scoped contribution')
                    continue
                is_fredtalk = ref['kind'] == 'software-preset' and str(ref.get('id', '')).startswith('fredtalk:')
                record = None
                source_hashes = set()
                if is_fredtalk:
                    import fredtalk_library
                    catalog_path = (root / fredtalk_library.CATALOG).resolve()
                    required_catalogs.add(catalog_path)
                    try:
                        inspected = fredtalk_library.inspect(root, ref['id'])
                        record = inspected['record']
                        current = inspected['current_sources']
                        if not current['available']:
                            error(target, 'FredTalk source is unavailable or failed integrity verification: ' + '; '.join(current['issues']))
                        else:
                            source_hashes = {row['sha256'].lower() for row in current['sources'] if row.get('hash_verified')}
                            design_hashes = {digest(path) for path in design_paths}
                            if not source_hashes.intersection(design_hashes):
                                error(where + '.selection.evidence', 'bind a verified FredTalk entrypoint as library-design-reference, using its original blob or exact materialized source')
                    except (OSError, ValueError, TypeError, KeyError) as exc:
                        error(target, 'cannot resolve FredTalk source: ' + str(exc))
                else:
                    catalog_path = (root / ('references/semantic-editing-recipes.json' if ref['kind'] == 'recipe'
                                            else 'references/capability-catalog.json')).resolve()
                    required_catalogs.add(catalog_path)
                    if catalog_path not in loaded_catalogs:
                        try:
                            loaded_catalogs[catalog_path] = read_json(catalog_path)
                        except (OSError, ValueError, TypeError) as exc:
                            loaded_catalogs[catalog_path] = {}
                            error(target, 'cannot read effect-library catalog: ' + str(exc))
                    records = (component_records(root, loaded_catalogs[catalog_path]) if ref['kind'] == 'component'
                               else loaded_catalogs[catalog_path].get(indexes[ref['kind']], []))
                    record = next((row for row in records if row.get('id') == ref.get('id')), None)
                    if record is None:
                        error(target, 'unknown effect-library entry')
                if record is not None:
                    application = ref.get('application')
                    contribution = application.get('contribution') if isinstance(application, dict) else None
                    if contribution in ('motion', 'design') and not library_contribution_allowed(record, contribution):
                        error(target, f'the entry explicitly excludes the adopted {contribution} contribution; appearance rejection alone does not reject motion')
                if not text(ref.get('adaptation_reason')):
                    error(target + '.adaptation_reason', 'explain the actual composition, material, window organization or action adopted for this narration')
                source_binding = ref.get('source_binding')
                source_path = bound_file(source_binding, target + '.source_binding')
                if source_path is not None and record is not None:
                    if is_fredtalk:
                        matched = source_binding.get('sha256') in source_hashes
                    else:
                        matched = library_source_matches(record, loaded_catalogs.get(catalog_path, {}),
                                                         root, source_path, source_binding)
                    if not matched:
                        error(target + '.source_binding', 'must bind this entry\'s registered source/preview bytes and its item selector; an arbitrary screenshot, another entry or generic motion helper is insufficient')
                application = ref.get('application')
                application_path = bound_file(application, target + '.application')
                contribution = application.get('contribution') if isinstance(application, dict) else None
                if contribution not in ('design', 'motion'):
                    error(target + '.application.contribution', 'state design or motion; a low-level motion call does not establish whole-scene design reuse')
                application_marker = application.get('marker') if isinstance(application, dict) else None
                if application_path is not None:
                    if application_path not in graph:
                        error(target + '.application', 'adopted design/motion location must be reachable from the actual render entry')
                    elif not text(application_marker) or graph[application_path].count(application_marker) != 1:
                        error(target + '.application.marker', 'identify one unique non-comment code/DOM location applying this reference')
            if required_catalogs - evidence_paths:
                error(where + '.selection.evidence', 'bind SHA-256 of the effect-library catalog: ' + ', '.join(str(path) for path in sorted(required_catalogs - evidence_paths)))
            if not design_paths - required_catalogs:
                error(where + '.selection.evidence', 'bind the actual example frame, source or implementation as library-design-reference; a catalog link alone is insufficient')
        needed_sources = set()
        if isinstance(refs, list) and refs:
            needed_sources.add(root / source_study.CATALOG_FILE)
            for n, ref in enumerate(refs):
                if not isinstance(ref, dict):
                    continue
                if not text(ref.get('adaptation_reason')):
                    error(where + f'.source_study_refs[{n}].adaptation_reason', 'record how this specific source method applies or is avoided')
                examples = ref.get('examples')
                if not isinstance(examples, list) or not examples:
                    error(where + f'.source_study_refs[{n}].examples', 'select concrete registered source rows')
                    continue
                for example in examples:
                    if isinstance(example, dict):
                        try:
                            needed_sources.add((root / source_study.source_record(example.get('video'), root)['alignment']).resolve())
                        except (OSError, ValueError, TypeError, KeyError) as exc:
                            error(where + '.source_study_refs', str(exc))
            ref_errors, ref_warnings = source_study.validate_refs(refs, root)
            errors.extend(where + '.source_study_refs: ' + message for message in ref_errors)
            warnings.extend(where + '.source_study_refs: ' + message for message in ref_warnings)
        if needed_sources - evidence_paths:
            error(where + '.selection.evidence', 'bind SHA-256 of the method catalog and the selected source alignment files')

        uses_aigc = segment.get('carrier') == 'aigc' or segment.get('generation') is not None or any(
            isinstance(asset, dict) and asset.get('kind') == 'generated' and asset.get('role', 'output') == 'output'
            for asset in assets)
        decision = selection.get('aigc')
        if not isinstance(decision, dict) or type(decision.get('use')) is not bool or not text(decision.get('reason')):
            error(where + '.selection.aigc', 'record {use:boolean,reason} for AIGC use or non-use; no generation is mandatory')
        elif decision['use'] != uses_aigc:
            error(where + '.selection.aigc.use', 'does not match the actual generated assets/carrier')
        if uses_aigc:
            try:
                if aigc_context is None:
                    style = plan.get('style') if isinstance(plan.get('style'), dict) else {}
                    style_binding = style.get('binding') if isinstance(style.get('binding'), dict) else {}
                    resolution = style_registry.resolve(project, style_binding.get('profile_id'), root=root)
                    aigc_context = aigc_assets.directing_context(project, resolution, root)
                expected = aigc_style_binding(aigc_context)
                actual = segment.get('aigc', {})
                if not isinstance(actual, dict):
                    actual = {}
                if expected is None or actual.get('style_binding') != expected:
                    error(where + '.aigc.style_binding', 'bind the current selected AIGC art direction; a UI binding or arbitrary image is insufficient')
                approved_paths = {Path(row['path']).resolve() for row in aigc_context.get('character_references', []) if row.get('exists')}
                approved_paths.update(Path(row['resource_checks']['image_path']['path']).resolve()
                    for row in aigc_context.get('approved_static_assets', []) if row.get('reference_ready'))
                approved_paths.update(Path(row['path']).resolve()
                    for row in aigc_context.get('style_references', []) if row.get('exists'))
                if not art_paths.intersection(approved_paths):
                    error(where + '.selection.evidence', 'bind at least one applicable current art-style reference; all library scenes and a fixed IP are not required')
                direction_override = aigc_context.get('direction_override')
                if isinstance(direction_override, dict) and Path(direction_override['source']['path']).resolve() not in evidence_paths:
                    error(where + '.selection.evidence', 'bind the sourced AIGC-only request file as well as the current reference images')
                style_ref = actual.get('style_ref')
                style_path = path(style_ref) if style_ref else None
                if style_path is None or not style_path.is_file() or digest(style_path) not in {digest(item) for item in approved_paths}:
                    error(where + '.aigc.style_ref', 'the actual style_ref must belong to the selected current AIGC direction; including another reference only in the evidence list is insufficient')
                characters = actual.get('character_refs') if isinstance(actual.get('character_refs'), list) else []
                used = [actual.get('scene_ref'), actual.get('style_ref'), *characters]
                for value in used:
                    if value:
                        actual_path = path(value)
                        # Installing the same Skill in another directory changes paths,
                        # not reference identity. Only existing files with a verified
                        # evidence hash qualify; a stale path or claimed hash cannot.
                        if not actual_path.is_file() or digest(actual_path) not in evidence_hashes:
                            error(where + '.selection.evidence', 'bind the actual character/scene/style reference file: ' + str(value))
            except (OSError, ValueError, TypeError, KeyError) as exc:
                error(where + '.aigc.style_binding', str(exc))

        impl = segment.get('implementation')
        impl_path = bound_file(impl, where + '.implementation')
        marker = impl.get('marker') if isinstance(impl, dict) else None
        if impl_path not in graph:
            error(where + '.implementation', 'implementation is not reachable from the render entry by a local script/import/fetch dependency')
        elif not text(marker) or graph[impl_path].count(marker) != 1:
            error(where + '.implementation.marker', 'must identify one real code/DOM location in reachable implementation; comments/absent/duplicate markers do not count')
        runtime_assets = []
        for n, asset in enumerate(assets):
            if not isinstance(asset, dict) or asset.get('status') != 'ready':
                continue
            target = bound_file(asset, where + f'.assets[{n}]')
            if target is not None and asset.get('role', 'output') == 'output':
                runtime_assets.append({'path': str(target), 'sha256': asset.get('sha256')})
        expected_row = {'id': ident, 'span': span, 'output': segment.get('output'),
            'implementation': {'path': str(impl_path) if impl_path else None,
                               'sha256': impl.get('sha256') if isinstance(impl, dict) else None, 'marker': marker},
            'assets': runtime_assets}
        actual_row = mapped.get(ident)
        # Material cuts and scene surfaces are authored once in the plan, then
        # copied into this consumed timeline. Runtime checks geometry and seeks.
        for field in ('material_shots', 'background', 'palette'):
            if field in segment or (isinstance(actual_row, dict) and field in actual_row):
                if not isinstance(actual_row, dict) or segment.get(field) != actual_row.get(field):
                    error(where + '.' + field, 'plan and runtime timeline differ; update the actual edit, not only its description')
        shots = segment.get('material_shots', [])
        if not isinstance(shots, list):
            error(where + '.material_shots', 'must be an array')
            shots = []
        media = timeline.get('media', {})
        media_assets = media.get('assets', []) if isinstance(media, dict) else []
        media_by_id = {row.get('id'): row for row in media_assets if isinstance(row, dict) and text(row.get('id'))} \
            if isinstance(media_assets, list) else {}
        ready_paths = {Path(row['path']) for row in runtime_assets}
        for n, shot in enumerate(shots):
            target = where + f'.material_shots[{n}]'
            asset_id = shot.get('asset') if isinstance(shot, dict) else None
            material = media_by_id.get(asset_id) if isinstance(asset_id, str) else None
            if not material or not text(material.get('src')) or entry is None:
                error(target + '.asset', 'must reference an actual timeline.media.assets source')
                continue
            material_path = (entry.parent / unquote(material['src'])).resolve()
            if material_path not in ready_paths:
                error(target + '.asset', 'source must also be a ready output asset with matching file hash in this segment')
        try:
            normalized = {key: actual_row.get(key) for key in expected_row} if isinstance(actual_row, dict) else {}
            if isinstance(normalized.get('implementation'), dict):
                normalized['implementation'] = {key: normalized['implementation'].get(key) for key in ('path', 'sha256', 'marker')}
                normalized['implementation']['path'] = str(path(normalized['implementation']['path']))
            if isinstance(normalized.get('assets'), list):
                normalized['assets'] = [{'path': str(path(asset.get('path'))), 'sha256': asset.get('sha256')} for asset in normalized['assets']]
            if normalized != expected_row:
                error(where + '.output', 'actual runtime timeline row must match source span, output range, implementation marker/hash and material hashes')
        except (ValueError, TypeError, AttributeError) as exc:
            error(where + '.output', 'invalid runtime timeline row: ' + str(exc))
        if timing.get('basis') == 'audio-aligned':
            audio_range = time_range(segment.get('source_audio'), where + '.source_audio')
            row = aligned.get(ident)
            if not isinstance(row, dict) or row.get('span') != span or row.get('source_audio') != segment.get('source_audio'):
                error(where + '.source_audio', 'structured alignment must map this segment/source span to the same source-audio range')
            if audio_range is not None and output is not None and abs((audio_range[1] - audio_range[0]) - (output[1] - output[0])) > 0.1:
                error(where + '.source_audio', 'preserved narration and output durations differ by more than 0.1s; do not silently retime original audio')
        ledger.append({'segment_id': ident, 'source_span': span, 'output': segment.get('output'),
                       'selection_mode': mode, 'source_methods': [ref.get('method_id') for ref in refs if isinstance(ref, dict)] if isinstance(refs, list) else [],
                       'library_refs': [{'kind': ref.get('kind'), 'id': ref.get('id'),
                                         'adaptation_reason': ref.get('adaptation_reason'),
                                         'source_binding': ref.get('source_binding'),
                                         'application': ref.get('application')}
                                        for ref in library_refs if isinstance(ref, dict)],
                       'recipe_ids': segment.get('recipe_ids', []),
                       'implementation': expected_row['implementation'], 'assets': runtime_assets,
                       'review_intent': {key: segment.get(key) for key in ('meaning', 'viewer_gap', 'events', 'continuity')},
                       'material_shots': shots,
                       'aigc': {'use': uses_aigc, 'style_binding': segment.get('aigc', {}).get('style_binding')
                                if isinstance(segment.get('aigc'), dict) else None}})
    if covered != requested:
        error('delivery.coverage', 'selected scope has missing or out-of-scope non-whitespace source characters '
              f'(missing={len(requested - covered)}, outside={len(covered - requested)}); use explicit excerpt scope for a sample')
    if set(mapped) != {segment.get('id') for segment in segments if isinstance(segment, dict)}:
        error('implementation_manifest.timeline.segments', 'timeline and plan must contain the same segment IDs')
    previous_end = 0
    for (start, end), overlap_reason in output_ranges:
        if start > previous_end + 1e-6:
            error('delivery.timeline', 'unmapped output gap; represent intro/outro/presenter holds in the plan')
        if start < previous_end - 1e-6 and not text(overlap_reason):
            error('delivery.timeline', 'overlapping output ranges need an explicit transition/overlay reason')
        previous_end = max(previous_end, end)
    if duration is not None and abs(previous_end - duration) > 1e-6:
        error('delivery.timeline', 'mapped output must cover the declared duration')
    result.update(ready=not errors, delivery_scope=delivery['scope'], duration_seconds=duration,
                  entrypoint=manifest.get('entrypoint'), timeline=manifest.get('timeline'))
    result['reuse_declarations'] = {
        'segment_count': len(ledger),
        'segments_with_source_methods': sum(bool(row['source_methods']) for row in ledger),
        'segments_with_library_design': sum(any(
            isinstance(ref.get('application'), dict) and ref['application'].get('contribution') == 'design'
            for ref in row['library_refs']) for row in ledger),
        'segments_with_library_motion': sum(any(
            isinstance(ref.get('application'), dict) and ref['application'].get('contribution') == 'motion'
            for ref in row['library_refs']) for row in ledger),
        'segments_with_recipes': sum(bool(row['recipe_ids']) for row in ledger),
        'execution_verified': False,
        'scope': 'Per-entry source and reachable application declarations only, not executed API calls or visual comparison. '
                 'Design and motion are reported separately; low-level motion calls do not certify whole-scene design. '
                 'Original composition may reuse existing primitives; zero declarations neither proves absence of reuse nor satisfies a requested reuse demonstration.'}
    return result
