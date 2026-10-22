"""Read approved AIGC references into directing context, without generation.

AIGC art direction is independent of the account's UI profile. Recorded static
approval is never promoted to generated-video approval by this helper.
"""
import hashlib
import json
from pathlib import Path
from resource_inventory import resource_fact

ROOT = Path(__file__).resolve().parents[1]
CATALOG = 'references/aigc-assets.json'
GUIDE = 'references/aigc-directing.md'
PROJECT_FILES = ('project.json', 'current-project.json', 'director-plan.json')
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.bmp', '.tif', '.tiff'}
IDENTITY_KEYS = {'identity', 'wardrobe', 'identity_scope'}


def _read(path):
    return json.loads(Path(path).read_bytes().decode('utf-8-sig'))


def _path_fact(value, root):
    if isinstance(value, dict):
        value = value.get('path')
    if not isinstance(value, str) or not value.strip() or '://' in value:
        return {'path': value, 'exists': False}
    path = (Path(root) / Path(value).expanduser()).resolve()
    return {'path': str(path), 'exists': path.is_file()}


def _under(project, folder, root):
    try:
        Path(project).resolve().relative_to((Path(root) / folder).resolve())
        return True
    except (TypeError, ValueError):
        return False


def _project_choice(project, warnings):
    """Only user-authored metadata can override the catalog's defaults."""
    directory = Path(project).resolve()
    for folder in [directory, *list(directory.parents)[:5]]:
        choices = set()
        for name in PROJECT_FILES:
            path = folder / name
            if not path.is_file():
                continue
            try:
                doc = _read(path)
            except (OSError, ValueError) as exc:
                warnings.append('Unreadable AIGC project metadata: ' + str(path) + ': ' + str(exc))
                continue
            if not isinstance(doc, dict):
                continue
            aigc = doc.get('aigc')
            value = doc.get('aigc_style_id')
            if isinstance(aigc, dict):
                value = aigc.get('style_set_id', value)
            if isinstance(value, str) and value.strip():
                choices.add(value.strip())
        if choices:
            if len(choices) != 1:
                warnings.append('Conflicting AIGC style choices in project metadata; no default applied.')
                return None, 'conflicting-project-metadata:' + str(folder)
            return next(iter(choices)), 'project-metadata:' + str(folder)
    return None, None


def _project_override(project):
    """Read a sourced AIGC-only request from this project, never its parents.

    File hashes and an exact quotation make the declaration inspectable; they
    cannot authenticate a human speaker or establish aesthetic approval.
    """
    folder = Path(project).resolve()
    found = []
    for name in PROJECT_FILES:
        metadata = folder / name
        if not metadata.is_file():
            continue
        doc = _read(metadata)
        aigc = doc.get('aigc') if isinstance(doc, dict) else None
        if not isinstance(aigc, dict) or 'direction_override' not in aigc:
            continue
        override = aigc['direction_override']
        allowed = {'scope', 'direction', 'source', 'style_references'}
        if not isinstance(override, dict) or set(override) - allowed or override.get('scope') != 'aigc-only':
            raise ValueError('AIGC direction_override must have scope=aigc-only and only direction/source/style_references fields; UI overrides belong to the UI contract.')
        direction, source = override.get('direction'), override.get('source')
        if not isinstance(direction, str) or not direction.strip():
            raise ValueError('AIGC direction_override.direction must describe the current art direction.')
        if not isinstance(source, dict) or source.get('kind') not in ('current-user-request', 'current-project-confirmation'):
            raise ValueError('AIGC direction_override.source requires kind=current-user-request or current-project-confirmation and an actual source file/hash/quote.')
        source_fact = _path_fact(source.get('path'), folder)
        if not source_fact['exists']:
            raise ValueError('AIGC override source file is missing; a claimed approval flag is insufficient.')
        source_path = Path(source_fact['path'])
        actual_hash = hashlib.sha256(source_path.read_bytes()).hexdigest()
        quote = source.get('quote')
        if source.get('sha256') != actual_hash or not isinstance(quote, str) or not quote.strip() or quote not in source_path.read_text(encoding='utf-8-sig'):
            raise ValueError('AIGC override source SHA-256 and exact quote must match its actual UTF-8 source file.')
        refs = override.get('style_references')
        if not isinstance(refs, list) or not refs:
            raise ValueError('AIGC override needs current style_references; use relevant supplied references or a current direction frame, not unrelated default examples.')
        references = []
        for value in refs:
            fact = _path_fact(value, folder)
            if not fact['exists'] or Path(fact['path']).suffix.lower() not in IMAGE_EXTENSIONS:
                raise ValueError('AIGC override style_references must point to existing local image files.')
            references.append({**fact, 'sha256': hashlib.sha256(Path(fact['path']).read_bytes()).hexdigest(),
                               'role': 'reference', 'usage_role': 'style-reference-only',
                               'auto_use_as_first_frame': False, 'auto_use_as_output': False})
        found.append({'scope': 'aigc-only', 'direction': direction.strip(),
                      'source': {**source_fact, 'kind': source['kind'], 'sha256': actual_hash, 'quote': quote},
                      'style_references': references})
    if not found:
        return None
    if any(value != found[0] for value in found[1:]):
        raise ValueError('Conflicting AIGC direction_override declarations in this project; no default applied.')
    return found[0]


def _character_choice(project):
    """Identity is an explicit choice in this project, independent of art style."""
    choices = set()
    for name in PROJECT_FILES:
        path = Path(project).resolve() / name
        if not path.is_file():
            continue
        doc = _read(path)
        aigc = doc.get('aigc') if isinstance(doc, dict) else None
        value = aigc.get('character_style_set_id') if isinstance(aigc, dict) else None
        if value is not None:
            if not isinstance(value, str) or not value.strip():
                raise ValueError('aigc.character_style_set_id must name an explicitly selected character reference set.')
            choices.add(value.strip())
    if len(choices) > 1:
        raise ValueError('Conflicting character_style_set_id declarations in this project; identity was not assumed.')
    return next(iter(choices), None)


def _style_references(style, root):
    return [{**(row if isinstance(row, dict) else {}), **_reference_fact(row, root),
             'role': 'reference', 'usage_role': 'style-reference-only', 'identity_binding_default': False,
             'auto_use_as_first_frame': False, 'auto_use_as_output': False}
            for row in [*style.get('style_references', []), *style.get('character_references', [])]]


def _reference_fact(value, root):
    if isinstance(value, dict) and value.get('resource_id'):
        return resource_fact(value['resource_id'], value.get('path'), root)
    return _path_fact(value, root)


def _approval_context(style, root):
    """Expose bounded current use and provenance, never historical instructions."""
    approval = style.get('approval', {})
    events = [approval, *approval.get('subsequent_video_approvals', [])]
    return {
        'historical_only': True,
        'catalog_record': str((Path(root) / CATALOG).resolve()) + '#style_sets/' + style['id'] + '/approval',
        'event_ids': list(dict.fromkeys(row['event_id'] for row in events if row.get('event_id'))),
        'evidence_paths': [_path_fact(path, root) for path in dict.fromkeys(
            row['evidence_path'] for row in events if row.get('evidence_path'))],
        'approval_kind': style.get('approval_kind', 'scoped-historical-reference'),
        'current_scope': style.get('current_scope', {}),
        'current_scope_evidence': [_path_fact(value, root) for key, value in style.get('current_scope', {}).items()
                                   if key.endswith('_evidence')],
        'current_output_approved': False,
    }


def _candidate(style, root, profile, project):
    profiles = style.get('applicable_profiles', style.get('default_for_profiles', []))
    applicable = not profile or not profiles or profile in profiles
    return {
        'id': style['id'], 'title': style.get('title', style['id']),
        'applicable': applicable, 'applicable_profiles': profiles,
        'project_match': any(_under(project, p, root) for p in style.get('project_roots', [])),
        'automatic_selection': False,
        'current_scope': style.get('current_scope', {}),
        'style_references': _style_references(style, root),
        'semantic_examples': [
            {**{key: row[key] for key in ('id', 'title', 'narration', 'meaning', 'semantic_use') if key in row},
             'reference_image': _reference_fact(row.get('image_path'), root)}
            for row in style.get('assets', []) if isinstance(row, dict)],
        'reference_videos': [
            {**_reference_fact({'path': row.get('video_path'), 'resource_id': row.get('resource_id')}, root), 'event_id': row.get('event_id'),
             'usage_scope': style.get('current_scope', {}).get('video_methods', []),
             'historical_approval_only': True}
            for row in style.get('approval', {}).get('subsequent_video_approvals', [])
            if row.get('video_path')],
        'approval': _approval_context(style, root),
    }


def reference_only_paths(root=ROOT):
    """Catalog images teach style; a path match does not authorize production use."""
    root = Path(root)
    catalog = root / CATALOG
    if not catalog.is_file():
        return set()
    data = _read(catalog)
    sets = data.get('style_sets') if isinstance(data, dict) else None
    if not isinstance(sets, list):
        raise ValueError('AIGC catalog must contain style_sets:[...]')
    paths = set()
    for style in sets:
        if not isinstance(style, dict):
            raise ValueError('AIGC style_sets entries must be objects')
        values = [*style.get('style_references', []), *style.get('character_references', [])]
        values += [row.get('image_path') for row in style.get('assets', []) if isinstance(row, dict)]
        for value in values:
            fact = _reference_fact(value, root)
            if isinstance(fact['path'], str) and fact['path'] and '://' not in fact['path']:
                paths.add(Path(fact['path']))
    return paths


def directing_context(project, style_resolution=None, root=ROOT):
    root = Path(root)
    catalog = root / CATALOG
    warnings = []
    context = {
        'catalog': str(catalog.resolve()), 'catalog_exists': catalog.is_file(),
        'guide': _path_fact(GUIDE, root), 'status': 'unresolved',
        'selection_source': None, 'selected_style_set': None,
        'character_references': [], 'style_references': [], 'style_rules': {}, 'approval': {},
        'selected_character_set': None, 'identity_source': None, 'identity_rules': {}, 'identity_references': [],
        'identity_references_ready': False,
        'approved_static_assets': [], 'research_sources': [],
        'available_style_sets': [], 'warnings': warnings,
        'available_method_references': [row for row in (style_resolution or {}).get('method_examples', [])
                                        if row.get('approval_kind') == 'method-only' or
                                        'aigc' in str(row.get('retrieval', {})).lower() or
                                        'anime' in str(row.get('id', '')).lower()],
        'reference_only': True, 'default_character_required': False,
        'auto_use_as_first_frame': False, 'auto_use_as_output': False,
        'character_policy': '参考图中的人物不是所有稿件的默认主角；人物按本期句意设计。当前工程明确指定的固定 IP 继续保持身份、服装和画风连续，不因换场景重置。',
        'character_references_ready': False, 'production_references_ready': False,
        'optional_provenance_missing': [],
        'requires_visual_comparison': True, 'video_approval_inherited': False,
        'instruction': 'AIGC 与 UI 外观分开。注册图片只用于理解画风、材质、构图和叙事方法；每期先理解口播句意，再设计本期人物、场景、道具和动作，制作匹配的新素材。不得自动把这些例图当成视频首帧、成片素材或固定场景菜单，也不强制所有稿件使用图中同一人物。当前工程明确指定的固定 IP 保持连续；直接沿用某张旧图须有本期明确依据，历史风格认可本身不是复用许可。',
    }
    try:
        override = _project_override(project)
        character_choice = _character_choice(project)
    except (OSError, ValueError, TypeError, UnicodeError) as exc:
        context['status'] = 'invalid-project-override'
        warnings.append(str(exc))
        return context
    if override is not None:
        context.update(status='resolved', selected_style_set='project-local-aigc',
                       selection_source='project-direction-override:' + str(Path(project).resolve()),
                       direction_override=override,
                       style_rules={'rendering': override['direction']},
                       style_references=override['style_references'],
                       production_references_ready=True,
                       reference_readiness_scope='Sourced AIGC-only direction and current reference files. No reference or generated-output aesthetic approval is inferred.')
        if character_choice is None:
            return context
    if not catalog.is_file():
        context['status'] = 'missing-catalog'
        warnings.append('AIGC asset catalog is missing; references were not silently invented.')
        return context
    try:
        data = _read(catalog)
        sets = data.get('style_sets') if isinstance(data, dict) else None
        if not isinstance(sets, list) or any(not isinstance(row, dict) or
                not isinstance(row.get('id'), str) or not row['id'].strip() for row in sets):
            raise ValueError('style_sets must be a list with nonempty string IDs')
        if len({row['id'] for row in sets}) != len(sets):
            raise ValueError('style_set IDs must be unique')
    except (OSError, ValueError) as exc:
        context['status'] = 'invalid-catalog'
        warnings.append('Cannot read AIGC catalog: ' + str(exc))
        return context
    context['routing_policy'] = data.get('routing_policy', {})
    context['research_sources'] = [
        {**row, 'resource': resource_fact('aigc-research:' + row['id'], row.get('path'), root)}
        for row in data.get('research_sources', [])]
    context['research_sources_present'] = sum(row['resource']['file_exists'] for row in context['research_sources'])
    context['research_readiness_scope'] = 'Optional provenance/research paths, separate from packaged style images; absent originals are not claimed as available.'
    profile = (style_resolution or {}).get('resolved_profile')
    context['available_style_sets'] = [_candidate(row, root, profile, project) for row in sets]
    context['selection_instruction'] = ('AIGC 画风参考用于本期新图和视频，不指定 UI 或人物身份。'
        '本期明确方向和工程选择优先；否则使用用户指定的统一画风参考。'
        '先查看实际参考材质，再按完整口播设计新情境与动作。')
    if character_choice is not None:
        character = next((row for row in sets if row['id'] == character_choice), None)
        rules = (character.get('identity_rules') or {key: value for key, value in character.get('style_rules', {}).items()
                 if key in ('identity', 'wardrobe')}) if character else {}
        if character is None or not rules:
            context['status'] = 'invalid-project-character'
            warnings.append('Unknown or unavailable explicit character reference set: ' + character_choice)
            return context
        context.update(selected_character_set=character_choice,
                       identity_source='project-metadata:' + str(Path(project).resolve()), identity_rules=rules,
                       identity_references=[{**row, 'usage_role': 'project-explicit-identity-reference'}
                                            for row in _style_references(character, root)])
        context['identity_references_ready'] = bool(context['identity_references']) and all(
            row['exists'] for row in context['identity_references'])
        if not context['identity_references_ready']:
            warnings.append('The explicitly selected identity references are missing; character continuity is not ready.')
    if override is not None:
        return context
    choice, origin = _project_choice(project, warnings)
    policy = data.get('routing_policy', {})
    if origin is None and policy.get('default_style_id'):
        choice = policy['default_style_id']
        origin = 'unified-aigc-reference'
    if origin is None and policy.get('account_routing', True):
        candidates = [row for row in sets if
            (not profile or not row.get('applicable_profiles', row.get('default_for_profiles', [])) or
             profile in row.get('applicable_profiles', row.get('default_for_profiles', []))) and
            any(_under(project, p, root) for p in row.get('project_roots', []))]
        origin = 'registered-project-root' if candidates else None
        if not candidates and profile:
            candidates = [row for row in sets if profile in row.get('default_for_profiles', [])]
            origin = 'profile-default:' + profile if candidates else None
        if len(candidates) == 1:
            choice = candidates[0]['id']
        elif len(candidates) > 1:
            warnings.append('Multiple AIGC style defaults apply; no style was assumed.')
    selected = next((row for row in sets if row['id'] == choice), None)
    context['selection_source'] = origin
    if selected is None:
        if choice:
            warnings.append('Unknown explicit AIGC style set: ' + choice + '; no default substituted.')
        elif origin is None and any(row['applicable'] for row in context['available_style_sets']):
            context['status'] = 'candidates-available'
        return context
    context.update(status='resolved', selected_style_set=selected['id'],
                   style_rules={key: value for key, value in selected.get('style_rules', {}).items() if key not in IDENTITY_KEYS},
                   approval=_approval_context(selected, root))
    context['style_references'] = _style_references(selected, root)
    # Compatibility name only: these remain style references, never identity bindings.
    context['character_references'] = [dict(row) for row in context['style_references']]
    for asset in selected.get('assets', []):
        if not isinstance(asset, dict) or asset.get('approval_state') != 'approved_static_scene':
            continue
        checks = {key: _path_fact(asset[key], root) for key in
                  ('image_path', 'source_frame', 'source_video') if asset.get(key)}
        if asset.get('source_key') and asset.get('source_video'):
            checks['source_video'] = resource_fact('source-video:' + asset['source_key'], asset['source_video'], root)
        if asset.get('source_frame'):
            checks['source_frame'] = resource_fact('aigc-source-frame:' + asset['id'], asset['source_frame'], root)
        example = {key: asset[key] for key in ('id', 'title', 'gallery_asset_id', 'narration', 'meaning',
                   'semantic_use', 'approval_state', 'video_verified', 'source_time', 'source_range') if key in asset}
        context['approved_static_assets'].append({**example, 'resource_checks': checks,
                                                 'historical_scene_record': str(catalog.resolve()) + '#style_sets/' + selected['id'] + '/assets/' + asset['id'],
                                                 'reference_action_chain': asset.get('action_chain', []),
                                                 'reference_action_scope': '历史例片的动作解释方法；本期重新设计人物、场景和具体动作，不继承原场景的身份、服装与布局。',
                                                 'role': 'reference', 'usage_role': 'style-reference-only',
                                                 'auto_use_as_first_frame': False, 'auto_use_as_output': False,
                                                 'reference_ready': bool(checks.get('image_path', {}).get('exists')),
                                                'video_approval_inherited': False})
    missing = [row['path'] for row in context['style_references'] if not row['exists']]
    missing += [row['resource_checks']['image_path']['path'] for row in context['approved_static_assets']
                if 'image_path' in row['resource_checks'] and not row['reference_ready']]
    context['character_references_ready'] = bool(context['character_references']) and all(
        row['exists'] for row in context['character_references'])
    context['production_references_ready'] = bool(context['style_references']) and all(
        row['exists'] for row in context['style_references']) and all(
        row['reference_ready'] for row in context['approved_static_assets'])
    context['reference_readiness_scope'] = ('Style-reference inventory availability only, not ready production assets or automatic first frames. '
        'Design each narration anew and preserve only a project-explicit fixed IP. A plan checks references it actually uses; '
        'a missing unused example does not block a UI-only edit. No visual review performed.')
    context['optional_provenance_missing'] = [fact['path'] for row in context['approved_static_assets']
        for key, fact in row['resource_checks'].items() if key != 'image_path' and not fact['exists']]
    context['optional_provenance_missing'] += [row['resource']['path'] for row in context['research_sources']
                                              if not row['resource']['exists']]
    if missing:
        warnings.append('Some AIGC style-reference images are missing; inspect the selected art direction rather than silently replacing it.')
        context['missing_resources'] = missing
    return context
