"""Read approved AIGC references into directing context, without generation.

AIGC art direction is independent of the account's UI profile. Recorded static
approval is never promoted to generated-video approval by this helper.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = 'references/aigc-assets.json'
GUIDE = 'references/aigc-directing.md'
PROJECT_FILES = ('project.json', 'current-project.json', 'director-plan.json')


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
        values = list(style.get('character_references', []))
        values += [row.get('image_path') for row in style.get('assets', []) if isinstance(row, dict)]
        for value in values:
            fact = _path_fact(value, root)
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
        'character_references': [], 'style_rules': {}, 'approval': {},
        'approved_static_assets': [], 'research_sources': [],
        'available_style_sets': [], 'warnings': warnings,
        'reference_only': True, 'default_character_required': False,
        'auto_use_as_first_frame': False, 'auto_use_as_output': False,
        'character_policy': '参考图中的人物不是所有稿件的默认主角；人物按本期句意设计。当前工程明确指定的固定 IP 继续保持身份、服装和画风连续，不因换场景重置。',
        'character_references_ready': False, 'production_references_ready': False,
        'optional_provenance_missing': [],
        'requires_visual_comparison': True, 'video_approval_inherited': False,
        'instruction': 'AIGC 与 UI 外观分开。注册图片只用于理解画风、材质、构图和叙事方法；每期先理解口播句意，再设计本期人物、场景、道具和动作，制作匹配的新素材。不得自动把这些例图当成视频首帧、成片素材或固定场景菜单，也不强制所有稿件使用图中同一人物。当前工程明确指定的固定 IP 保持连续；直接沿用某张旧图须有本期明确依据，历史风格认可本身不是复用许可。',
    }
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
    context['research_sources'] = data.get('research_sources', [])
    context['available_style_sets'] = [
        {key: row[key] for key in ('id', 'title', 'label', 'default_for_profiles', 'project_roots', 'approval') if key in row}
        for row in sets]
    choice, origin = _project_choice(project, warnings)
    profile = (style_resolution or {}).get('resolved_profile')
    if origin is None:
        if profile:
            candidates = [row for row in sets if profile in row.get('default_for_profiles', [])]
            origin = 'profile-default:' + profile if candidates else None
        else:
            candidates = [row for row in sets if any(_under(project, p, root) for p in row.get('project_roots', []))]
            origin = 'registered-project-root' if candidates else None
        if len(candidates) == 1:
            choice = candidates[0]['id']
        elif len(candidates) > 1:
            warnings.append('Multiple AIGC style defaults apply; no style was assumed.')
    selected = next((row for row in sets if row['id'] == choice), None)
    context['selection_source'] = origin
    if selected is None:
        if choice:
            warnings.append('Unknown explicit AIGC style set: ' + choice + '; no default substituted.')
        else:
            warnings.append('No applicable AIGC style is selected. Read the current request or account direction; do not impose another account\'s character.')
        return context
    context.update(status='resolved', selected_style_set=selected['id'],
                   style_rules=selected.get('style_rules', {}), approval=selected.get('approval', {}))
    context['character_references'] = [
        {**(row if isinstance(row, dict) else {}), **_path_fact(row, root),
         'role': 'reference', 'usage_role': 'style-reference-only', 'identity_binding_default': False,
         'auto_use_as_first_frame': False, 'auto_use_as_output': False}
        for row in selected.get('character_references', [])]
    for asset in selected.get('assets', []):
        if not isinstance(asset, dict) or asset.get('approval_state') != 'approved_static_scene':
            continue
        checks = {key: _path_fact(asset[key], root) for key in
                  ('image_path', 'source_frame', 'source_video') if asset.get(key)}
        context['approved_static_assets'].append({**asset, 'resource_checks': checks,
                                                 'role': 'reference', 'usage_role': 'style-reference-only',
                                                 'auto_use_as_first_frame': False, 'auto_use_as_output': False,
                                                 'reference_ready': bool(checks.get('image_path', {}).get('exists')),
                                                'video_approval_inherited': False})
    missing = [row['path'] for row in context['character_references'] if not row['exists']]
    missing += [row['resource_checks']['image_path']['path'] for row in context['approved_static_assets']
                if 'image_path' in row['resource_checks'] and not row['reference_ready']]
    context['character_references_ready'] = bool(context['character_references']) and all(
        row['exists'] for row in context['character_references'])
    context['production_references_ready'] = context['character_references_ready'] and all(
        row['reference_ready'] for row in context['approved_static_assets'])
    context['reference_readiness_scope'] = ('Style-reference inventory availability only, not ready production assets or automatic first frames. '
        'Design each narration anew and preserve only a project-explicit fixed IP. A plan checks references it actually uses; '
        'a missing unused example does not block a UI-only edit. No visual review performed.')
    context['optional_provenance_missing'] = [fact['path'] for row in context['approved_static_assets']
        for key, fact in row['resource_checks'].items() if key != 'image_path' and not fact['exists']]
    if missing:
        warnings.append('Some AIGC style-reference images are missing; inspect the selected art direction rather than silently replacing it.')
        context['missing_resources'] = missing
    return context
