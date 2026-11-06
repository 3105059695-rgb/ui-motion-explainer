"""Discover and dispatch retained capabilities without re-reading reference films.

The index is assembled from authoritative manifests, never a second hand-edited
effects list. Retrieval offers candidates, not semantic certainty or a shot list.
"""
from __future__ import annotations

import argparse
from collections import Counter
import json
from pathlib import Path
import re

import selection

ROOT = Path(__file__).resolve().parents[1]
RUNTIME_MANIFEST = 'assets/agent-editorial/capability-runtime.json'
STATE_LABELS = {'direct': '有可调用参数接口', 'source-adaptation': '有源码，需按本期适配',
                'reference-only': '表达或画面参考，未提供执行实现', 'missing': '声明的实现当前缺失',
                'aggregate': '能力分类，调用其实际子条目'}
COMMANDS = {'list': 'ui.py capabilities list',
            'search': 'ui.py capabilities search --query <本段要表达的关系>',
            'inspect': 'ui.py capabilities inspect --id <能力ID>',
            'plan': 'ui.py capabilities plan --script <口播文件>',
            'check': 'ui.py capabilities check --require'}
PRODUCTION_FILES = (
    'scripts/capability_catalog.py', 'scripts/capability_runtime.py',
    'scripts/repository_reading.py', 'scripts/requirements.py', 'references/requirements.json',
    'scripts/ui_adaptation.py', 'scripts/library_ui_style.py',
    'assets/library-runtime/current-ui/roles.js', 'assets/library-runtime/current-ui/transform.cjs',
    'assets/library-runtime/current-ui/scene-overrides.json', 'assets/library-runtime/current-ui/coverage.json',
    'assets/library-runtime/current-ui/content-scopes.json',
    'assets/rebuilt-library/current-ui.js', 'assets/rebuilt-library/adu-current-ui.css',
    'assets/rebuilt-library/ui-adaptation.json', 'assets/adu-reference/ui-adaptation.json',
    'assets/semantic-motion/source-ui.css', 'assets/semantic-motion/theme.css',
    'assets/semantic-motion/ui-adaptation.json', 'assets/modules/director/ui-adaptation.json',
    'assets/modules/director/assets/studio/current-ui.js',
    'assets/agent-editorial/capability-runtime.json',
    'assets/agent-editorial/capability-runtime.js',
    'assets/agent-editorial/agent-editorial.js', 'assets/agent-editorial/motion-core.js',
    'assets/agent-editorial/source-designs.json', 'assets/agent-editorial/source-designs.js',
    'assets/agent-editorial/source/body-a.js', 'assets/agent-editorial/source/body-b.js',
    'assets/base-skill/assets/portable-studio/fonts/NotoSansSC.ttf',
    'references/capability-catalog.json', 'references/aesthetic-preferences.md',
    'assets/fredtalk-library/catalog.json',
    'scripts/capability_execution.py', 'scripts/library_runner.py',
    'scripts/library_html_runner.py', 'scripts/rebuilt_library.py',
    'scripts/semantic_effects.py', 'scripts/method_programs.py', 'scripts/style_film.py',
    'assets/library-runtime/implementations.json',
    'assets/rebuilt-library/scene-runtime.js', 'assets/rebuilt-library/execution.json',
    'assets/semantic-motion/manifest.json', 'assets/semantic-motion/semantic-motion.js',
    'assets/method-runtime/programs.json', 'assets/method-runtime/method-runtime.js',
    'assets/style-film/current-style-full.mp4', 'assets/style-film/manifest.json',
)
DIRECTOR_FILES = (
    'scripts/new_project.py', 'scripts/render.py', 'references/presets.json',
    'assets/studio/index.html', 'assets/studio/project.json',
    'assets/studio/player.js', 'assets/studio/core.js', 'assets/studio/fonts',
    'assets/studio/current-ui.js',
)


def _read(root, relative, default=None):
    path = Path(root) / relative
    return json.loads(path.read_text(encoding='utf-8-sig')) if path.is_file() else default


def _text(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return ' '.join(_text(v) for v in value.values())
    if isinstance(value, (list, tuple)):
        return ' '.join(_text(v) for v in value)
    return '' if value is None else str(value)


def _paths(value):
    if isinstance(value, str):
        return [value]
    if isinstance(value, dict):
        return [value['path']] if isinstance(value.get('path'), str) else []
    if isinstance(value, list):
        return [path for item in value for path in _paths(item)]
    return []


def _file(root, relative):
    """A public executable route must resolve inside this installation."""
    path = (Path(root) / relative).resolve()
    inside = path.is_relative_to(Path(root).resolve())
    return {'path': relative, 'packaged': inside,
            'exists': inside and (path.is_file() or path.is_dir()),
            'type': 'directory' if inside and path.is_dir() else 'file'}


def _base(kind, row, root):
    ident = str(row['id'])
    impl = row.get('implementation') or {}
    declared = list(dict.fromkeys(_paths(impl.get('path')) + _paths(impl.get('sources'))
                                + _paths(impl.get('entrypoints'))))
    sources = [_file(root, p) for p in declared]
    status = str(impl.get('status', ''))
    available = bool(sources) and all(f['exists'] for f in sources)
    if status in ('analysis-only', 'method-and-case-routing'):
        state = 'reference-only'
    elif available and all(Path(p).suffix.lower() in ('.md', '.txt') for p in declared):
        state = 'reference-only'
    elif available:
        state = 'source-adaptation'
    elif declared:
        state = 'missing'
    else:
        state = 'reference-only'
    if ident.startswith('fredtalk:'):
        state = 'source-adaptation' if row.get('source_available') else 'reference-only'
    title = row.get('search_title_zh') or row.get('title') or row.get('label') or ident
    semantics = _text([row.get('semantic_use'), row.get('use_when'), row.get('intents'),
                       row.get('understanding_gap'), row.get('state_chain'), row.get('search_tags')])
    relations = set(selection.relation_cues(title + ' ' + semantics))
    relations.update(selection.METHOD_TAGS.get(ident, ()))
    relations.update(selection.RECIPE_TAGS.get(ident, ()))
    record = {'id': kind + ':' + ident, 'original_id': ident, 'kind': kind,
              'title': title, 'semantic_use': semantics,
              'relations': sorted(relations), 'execution_state': state,
              'execution_label': STATE_LABELS[state], 'source_files': sources,
              'archived': bool(row.get('archived')), 'source_access': row.get('source_access', 'packaged'),
              'call': {}, 'style_scope': 'retain-current-style-when-adapting',
              'motion_available': selection.library_contribution_allowed(row, 'motion'),
              'design_available': selection.library_contribution_allowed(row, 'design'),
              'user_approval': row.get('user_approval', {}),
              'preview': row.get('preview') or {},
              'runtime_verified_this_run': False, '_record': row}
    if kind == 'component' and available:
        record.update(execution_state='direct', execution_label=STATE_LABELS['direct'],
                      style_scope='host-style', call={
                          'api': "UIEditingKit.apply('" + ident + "', options, progress)",
                          'module': impl.get('path'), 'documentation': 'assets/editing-kit/README.md',
                          'scope': '现有DOM节点的动作接口；内容、节点、布局、当前UI由工程提供。'})
        record['preview'] = {'path': 'assets/editing-kit/demo.html?effect=' + ident}
    elif ident.startswith('fredtalk:') and available:
        record['call'] = {'materialize': 'python -B -X utf8 scripts/fredtalk_library.py materialize --id '
                          + ident + ' --project <工程>',
                          'scope': '提取已保留源码；仍需本期内容、素材、依赖和宿主适配。'}
    if kind in ('method', 'recipe'):
        effects = ([impl['effect']] if impl.get('effect') else [])
        effects += [p['name'] for p in impl.get('primitives', []) if p.get('name')]
        if effects and _file(root, 'assets/editing-kit/editing-kit.js')['exists']:
            record['call'] = {
                'components': [{'id': 'component:' + name,
                                'api': "UIEditingKit.apply('" + name + "', options, progress)",
                                'inspect': 'ui.py capabilities inspect --id component:' + name}
                               for name in dict.fromkeys(effects)],
                'scope': '可调用的是这些原语；整条配方仍需本期内容、DOM、时间和布局，不等于整段已实现。'}
        if impl.get('recipe_ids'):
            record['related_capabilities'] = ['recipe:' + x for x in impl['recipe_ids']]
        if impl.get('kind') == 'generation-recipe' and available:
            record['call'] = {
                'plan': 'python -B -X utf8 scripts/metaso_video.py plan --prompt-file <提示词.txt> --out <请求.json>',
                'documentation': 'python -B -X utf8 scripts/metaso_video.py --help',
                'scope': '生成请求准备入口；不是已生成视频，调用付费生成仍按当前授权与成本确认执行。'}
    if available and kind == 'capability' and re.fullmatch(r'F0[1-8]', ident):
        record['call'] = {
            'materialize': 'python -B -X utf8 scripts/ui.py new --engine fusion -- --scene ' + ident + ' --out <工程>',
            'render': 'python -B -X utf8 scripts/ui.py render --engine fusion -- --project <工程> --out <渲染目录>',
            'scope': '真实历史演示创建入口；保留动效源码，题材、对象、外观和内部动作绑定仍需适配。'}
        record['adapter_kind'] = 'historical-demo-source'
    if available and kind == 'family' and ident == 'typography':
        record['call'] = {
            'list': 'python -B -X utf8 scripts/export_qiaomu_fonts.py --list',
            'materialize': 'python -B -X utf8 scripts/export_qiaomu_fonts.py --pairing <ID> --out <字体目录>',
            'scope': '导出字体及配对文件；不自动改动已确认的当前字体。'}
    if available and kind == 'reference':
        templates = [Path(p).name for p in declared if '/assets/templates/' in p]
        if len(templates) == 1 and templates[0] in ('ui-morph', 'launch-film'):
            record['call'] = {
                'materialize': 'python -B -X utf8 scripts/ui.py reference --tool toolkit -- new '
                               + ident + ' --template ' + templates[0] + ' --out <工程>',
                'render': 'python -B -X utf8 scripts/ui.py reference --tool rebuild -- render --project <工程> --out <渲染目录>',
                'scope': '只创建明示的已保留 starter，非该参考视频完整重建；本期内容和当前UI仍需适配。'}
    if sources and not record['call']:
        record['call'] = {'source_paths': [f['path'] for f in sources if f['exists']],
                          'scope': '源码或参考入口，未登记整段参数化执行接口；不能将此项视作已可直接渲染。'}
    return record


def _director_routes(rows, root):
    """Expose the existing engine's registered presets, not a new adapter."""
    prefix = 'assets/modules/director/'
    presets = _read(root, prefix + 'references/presets.json', [])
    presets = presets.get('presets', []) if isinstance(presets, dict) else presets
    known = {p['id']: p for p in presets}
    required = [_file(root, prefix + p) for p in DIRECTOR_FILES]
    for row in rows:
        preset = known.get(row['original_id']) if row['kind'] == 'software-preset' else None
        if not preset:
            continue
        row['source_files'] += [f for f in required if f['path'] not in {s['path'] for s in row['source_files']}]
        if all(f['exists'] for f in row['source_files']):
            row.update(execution_state='direct', execution_label=STATE_LABELS['direct'])
        else:
            row.update(execution_state='missing', execution_label=STATE_LABELS['missing'])
        duration = preset.get('duration', 10)
        row.update(adapter_kind='director-preset', style_scope='source-native-review-current-style',
            parameters={'params': preset.get('params', {}), 'paramLimits': preset.get('paramLimits', {}),
                        'duration': duration, 'binding': 'clips[].params in authored project JSON',
                        'documentation': prefix + 'references/project-format.md',
                        'scope': 'params 是原预设登记的可替换字段及默认值；未登记的对象、布局和事件须读对应源码后适配。'},
            example={'title': '本期内容', 'mode': 'sequence', 'width': 1920, 'height': 1080, 'fps': 30,
                     'duration': duration, 'audio': '', 'captions': [],
                     'clips': [{'id': 'scene-1', 'preset': preset['id'], 'start': 0,
                                'duration': duration, 'params': preset.get('params', {})}]},
            call={
                'materialize': 'python -B -X utf8 scripts/ui.py new --engine director -- --preset '
                               + preset['id'] + ' --duration ' + str(duration) + ' --out <工程>',
                'build': 'python -B -X utf8 scripts/ui.py new --engine director -- --plan <本期工程.json> --out <工程>',
                'render': 'python -B -X utf8 scripts/ui.py render --engine director -- --project <工程> --out <渲染目录>',
                'output': '<渲染目录>/preview.mp4',
                'scope': '可创建和渲染现有预设；按真实 params 替换内容。原预设外观仍需当前UI适配，不能仅改标题声称适配整句口播。'})
        row['preview'] = {'path': prefix + 'assets/studio/index.html', 'preset_id': preset['id']}
    return rows


def _library(root):
    catalog = _read(root, selection.CAPABILITY_FILE, {})
    rows = [_base('capability', r, root) for r in catalog.get('capabilities', [])]
    tags = _read(root, selection.SEARCH_TAG_FILE, {}).get('entries', {})
    for kind, key in selection.LIBRARY_INDEXES.items():
        for original in catalog.get(key, []):
            row = dict(original)
            if kind == 'reference':
                extra = tags.get(row['id'], {})
                row.update(search_title_zh=extra.get('title_zh', ''), search_tags=extra.get('tags', []))
            rows.append(_base(kind, row, root))
    # Include archived and unavailable records too; they remain visibly distinct.
    import fredtalk_library
    rows += [_base('software-preset', r, root) for r in
             fredtalk_library.records(root, include_archived=True, include_unavailable=True)]
    rows += [_base('component', r, root) for r in selection.component_records(root, catalog)]
    for kind, path, key in [('method', 'references/source-study-methods.json', 'methods'),
                            ('recipe', selection.RECIPE_FILE, 'recipes')]:
        rows += [_base(kind, r, root) for r in _read(root, path, {}).get(key, [])]
    return _director_routes(rows, root)


def _designs(root):
    data = _read(root, 'assets/agent-editorial/source-designs.json', {})
    rows = []
    for item in data.get('designs', []):
        row = _base('design', {'id': item['id'], 'title': item['label'],
                   'semantic_use': [c.get('description', c['id']) for c in item.get('cues', [])],
                   'implementation': {'sources': ['assets/agent-editorial/' + item['source_file'],
                       'assets/agent-editorial/source-designs.js', 'scripts/source_designs.py']}}, root)
        if all(f['exists'] for f in row['source_files']):
            row.update(execution_state='direct', execution_label=STATE_LABELS['direct'])
        row.update(style_scope='approved-body-current-palette', adapter_kind='original-body-design',
                   user_approval={'scope': item.get('approved_scope'), 'new_output_approved': False},
                   preview={'path': 'assets/agent-editorial/designs.html', 'design': item['id']},
                   call={'scaffold': f"ui.py designs scaffold --design {item['id']} --out <绑定.json>",
                         'build': 'ui.py designs build --spec <绑定.json> --out <工程>',
                         'scope': '复用原状态与构图；当前文案、素材、时序须绑定，跨结构变化需适配。'},
                   _record=item)
        rows.append(row)
    return rows


def _scenes(root):
    rows = []
    # The manifest is sufficient for discovery; no rendering, video or study loading.
    for pack in ('anim3', 'anim4'):
        base = 'assets/adu-reference/source/packs/' + pack
        data = _read(root, base + '/manifest.json', {})
        for item in data.get('scenes', []):
            row = _base('scene', {'id': pack + ':' + item['id'],
                       'title': item.get('title', item['id']), 'semantic_use': item.get('role', ''),
                       'implementation': {'sources': [base + '/scenes.js', 'scripts/scene_builder.py']}}, root)
            if all(f['exists'] for f in row['source_files']):
                row.update(execution_state='direct', execution_label=STATE_LABELS['direct'])
            row.update(adapter_kind='complete-scene', style_scope='source-native-review-current-style',
                       call={'scaffold': f"ui.py scene scaffold --pack {pack} --scenes {item['id']} --out <spec.json>",
                             'build': 'ui.py scene build --plan <director-plan.json> --out <工程>',
                             'scope': '参数接口可用；源场景外观不自动替代当前UI。'},
                       _record=item, pack=pack)
            rows.append(row)
    return rows


def _native(root):
    data = _read(root, RUNTIME_MANIFEST, {})
    rows = []
    entries = data.get('capabilities', data.get('events', data.get('items', [])))
    for item in entries:
        typ = item.get('type', item.get('id'))
        row = _base('native', {'id': typ, 'title': item.get('label', typ),
                   'semantic_use': item.get('semantic_use', ''),
                   'implementation': {'sources': item.get('source_files', [])}}, root)
        if row['source_files'] and all(f['exists'] for f in row['source_files']):
            row.update(execution_state='direct', execution_label=STATE_LABELS['direct'])
        row.update(relations=sorted(set(item.get('relations', row['relations']))),
                   adapter_kind='source-design' if typ == 'source-design' else 'parameterized-event',
                   style_scope='approved-body-current-palette',
                   call={'api': f"CapabilityRuntime.createScene({{duration,events:[{{type:'{typ}',...}}]}})",
                         'build': 'python -B -X utf8 scripts/capability_runtime.py build --spec <本期事件.json> --out <工程>',
                         'scope': '按事件和内容绑定可组合能力；不预设整片顺序。'},
                   preview=item.get('preview', {}), _record=item)
        rows.append(row)
    return rows


def records(root=ROOT):
    root = Path(root).resolve()
    rows = _library(root) + _designs(root) + _scenes(root) + _native(root)
    import capability_execution
    rows = capability_execution.apply(rows, root)
    import ui_adaptation
    rows = ui_adaptation.apply(rows, root)
    ids = [r['id'] for r in rows]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate canonical capability IDs in source catalogs.')
    return rows


def compact(row):
    keys = ('id', 'kind', 'title', 'semantic_use', 'relations', 'execution_state', 'execution_label',
            'archived', 'source_access', 'style_scope', 'adapter_kind', 'motion_available', 'design_available',
            'call', 'preview', 'runtime_verification', 'is_aggregate')
    result = {k: row[k] for k in keys if k in row}
    result['inspect_command'] = 'ui.py capabilities inspect --id ' + row['id']
    if row.get('ui_adaptation'):
        result['ui_adaptation'] = {k: row['ui_adaptation'][k] for k in ('status', 'scope', 'evidence_file') if k in row['ui_adaptation']}
    return result


def summary(root=ROOT, *, rows=None):
    rows = records(root) if rows is None else rows
    return {'schema_version': 1, 'entry_count': len(rows),
            'counts_by_kind': dict(Counter(r['kind'] for r in rows)),
            'counts_by_execution_state': dict(Counter(r['execution_state'] for r in rows)),
            'archived_count': sum(r['archived'] for r in rows), 'state_definitions': STATE_LABELS,
            'commands': COMMANDS, 'source_catalogs_preserved': True,
            'scope': '目录条目有交叠，不是独立效果数量。direct仅表示已有参数化入口，非已填本期素材、已渲染或审美认可。'
                     '无需每次重读原片；先理解本稿，查适合能力，执行后检查画面；疑难或新增能力才查原参考。'}


def readiness(root=ROOT):
    """Check callable production resources, independent of private study media."""
    root = Path(root).resolve()
    configured = (root / selection.CAPABILITY_FILE).is_file()
    paths = set(PRODUCTION_FILES)
    native = _read(root, RUNTIME_MANIFEST, {})
    for item in native.get('capabilities', []):
        paths.update(_paths(item.get('source_files', [])))
    resources = [_file(root, path) for path in sorted(paths)]
    for fact in resources:
        if fact['exists']:
            fact['exists'] = (root / fact['path']).is_file() and (root / fact['path']).stat().st_size > 0
    missing = [fact['path'] for fact in resources if not fact['exists']]
    overview = summary(root) if configured else {'entry_count': 0, 'counts_by_execution_state': {}}
    ready = configured and not missing
    return {'schema_version': 1, 'required': configured, 'ready': ready,
            'status': 'ready' if ready else 'missing-production-resources' if configured else 'not-configured',
            'entry_count': overview['entry_count'],
            'counts_by_execution_state': overview['counts_by_execution_state'],
            'missing_files': missing, 'resources': resources,
            'historical_reference_media_required': False, 'runtime_verified_this_run': False,
            'message': ('生产调用资源齐全；原片用于按需研究，不是普通制作前置条件。' if ready else
                        '生产调用资源未齐，请补齐公开Skill安装载荷；缺少历史原片不影响此检查。'),
            'scope': '检查运行源码、样式、字体和目录文件；不等于渲染环境已安装、已看成片或审美认可。'}


def listing(root=ROOT, state=None, kind=None):
    rows = records(root)
    chosen = [r for r in rows if (state is None or r['execution_state'] == state) and
              (kind is None or r['kind'] == kind)]
    return {**summary(root, rows=rows), 'returned_count': len(chosen), 'truncated': False,
            'entries': [compact(r) for r in chosen]}


def _find(ident, rows):
    exact = [r for r in rows if r['id'] == ident]
    if exact:
        return exact[0]
    found = [r for r in rows if r['original_id'] == ident]
    if len(found) != 1:
        raise ValueError('Unknown or ambiguous capability ID: ' + str(ident) +
                         ('; use ' + ', '.join(r['id'] for r in found) if found else ''))
    return found[0]


def inspect(ident, root=ROOT):
    row = _find(ident, records(root))
    item, kind = row['_record'], row['kind']
    detail = {k: v for k, v in row.items() if not k.startswith('_')}
    detail['inspect_command'] = 'ui.py capabilities inspect --id ' + row['id']
    if kind == 'design':
        detail['parameters'] = {key: item.get(key, []) for key in
                                ('copy_slots', 'media_slots', 'logo_slots', 'cues', 'source_range', 'constraints')}
    elif kind == 'scene':
        detail['parameters'] = {key: item.get(key, []) for key in ('slots', 'cues', 'motionWindows')}
    elif kind == 'native':
        detail.update(parameters=item.get('parameters', {}), example=item.get('example', {}),
                      source_provenance=item.get('source_provenance', []))
    elif kind == 'component':
        guide = (Path(root) / 'assets/editing-kit/README.md').read_text(encoding='utf-8-sig')
        section = re.search(r'^###\s+`' + re.escape(row['original_id']) + r'`[^\n]*\n(.*?)(?=^###\s|\Z)', guide, re.M | re.S)
        detail['parameter_documentation'] = section.group(0) if section else ''
    else:
        detail['declaration'] = item
        detail['legacy_inspect_command'] = 'ui.py inspect --kind ' + kind + ' --id ' + row['original_id']
    return detail


def _rank(query, rows, context='', include_archived=False, state=None):
    selected = [r for r in rows if (include_archived or not r['archived'] or r.get('eligible_when_upstream_archived')) and
                r['motion_available'] and (state is None or r['execution_state'] == state)]
    ranker = selection.Ranker(selected)
    cues = selection.relation_cues(query)
    result = []
    for row in selected:
        similarity, overlap = ranker.similarity(query, row['id'])
        context_similarity, _ = ranker.similarity(context, row['id']) if context else (0, [])
        relations = [tag for tag in row['relations'] if tag in cues and cues[tag]['relation_complete']]
        ident_match = selection.normalized(query).strip() in (row['id'].lower(), row['original_id'].lower())
        if not ident_match and similarity < .15 and not relations:
            continue
        score = similarity * 5 + sum(cues[tag]['strength'] for tag in relations) + context_similarity * .25
        if ident_match:
            score += 20
        result.append((score, row, {'relation_cues': relations, 'text_overlap': overlap,
                                   'lexical_similarity': round(similarity, 4), 'score': round(score, 4),
                                   'score_is_probability': False}))
    return sorted(result, key=lambda x: (-x[0], x[1]['id']))


def search(query, root=ROOT, limit=None, *, context='', state=None, include_archived=False, rows=None):
    if not isinstance(query, str) or not query.strip():
        raise ValueError('Provide narration or an expression to search.')
    if limit is not None and (type(limit) is not int or limit < 1):
        raise ValueError('limit must be a positive integer, or omitted for all matches.')
    rows = records(root) if rows is None else rows
    matches = _rank(query, rows, context, include_archived, state)
    shown = matches if limit is None else matches[:limit]
    return {'query': query, 'match_mode': 'chinese-relation-and-text-candidates',
            'semantic_decision_made': False, 'catalog_entry_count': len(rows), 'match_count': len(matches),
            'truncated': len(shown) < len(matches), 'include_archived': include_archived,
            'candidates': [{**compact(row), 'match': why} for _, row, why in shown],
            'notice': '候选不等于选定镜头；按上下文、素材质量与当前UI选择。未命中时换关系描述或查完整目录，不强行套模板。',
            'full_search_command': 'ui.py capabilities search --query ' + json.dumps(query, ensure_ascii=False)}


def routing_context(source, root=ROOT, limit=5):
    """Compact production context; raw films, alignments and whole code stay out."""
    if not isinstance(source, str):
        source = source.get('text', '') if isinstance(source, dict) else ''
    if not source.strip():
        raise ValueError('Narration text is required.')
    rows = records(root)
    units = selection.source_segments(source)
    result = []
    for index, unit in enumerate(units):
        context = ' '.join(units[i]['quote'] for i in range(max(0, index - 1), min(len(units), index + 2)) if i != index)
        found = search(unit['quote'], root, None, context=context, rows=rows)
        matched = found['candidates']
        # Relevance remains primary: a generic current-style event must not hide
        # a much better matching retained preset. Readiness only breaks close ties.
        actionable = [r for r in matched if r['execution_state'] in ('direct', 'source-adaptation')]
        def production_score(row):
            bonus = .1 if row['execution_state'] == 'direct' else 0
            if row['execution_state'] == 'direct' and row['style_scope'] in ('approved-body-current-palette', 'host-style'):
                bonus += .25
            return row['match']['score'] + bonus
        actionable.sort(key=lambda r: (-production_score(r), r['id']))
        chosen = actionable[:limit]
        # Prepare uses a compact list, never all parameters or evidence files.
        candidates = [{k: row[k] for k in ('id', 'title', 'execution_state', 'style_scope',
                                         'call', 'inspect_command', 'match')} for row in chosen]
        result.append({**unit, 'match_count': found['match_count'], 'truncated': len(chosen) < len(matched),
                       'production_priority': 'semantic-relevance-with-small-callable-style-bonus',
                       'reference_or_missing_match_count': sum(r['execution_state'] in ('reference-only', 'missing') for r in matched),
                       'candidates': candidates, 'full_search_command': found['full_search_command']})
    return {'schema_version': 1, 'summary': summary(root, rows=rows), 'units': result,
            'decision': 'candidate-retrieval-only', 'raw_reference_media_required': False,
            'instructions': '通读本期原稿后选择能力；inspect所选参数与预览，复用实际入口。'
                            '这些句段是检索锚点，不是强制切镜；整段可合并、拆解、组合不同能力。'}


def select_script(text, root=ROOT, limit=5):
    return routing_context(text, root, limit)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    commands = parser.add_subparsers(dest='command', required=True)
    listing_parser = commands.add_parser('list')
    listing_parser.add_argument('--state', choices=STATE_LABELS)
    listing_parser.add_argument('--kind')
    listing_parser.add_argument('--summary', action='store_true')
    search_parser = commands.add_parser('search')
    search_parser.add_argument('--query', required=True)
    search_parser.add_argument('--limit', type=int)
    search_parser.add_argument('--state', choices=STATE_LABELS)
    search_parser.add_argument('--include-archived', action='store_true')
    inspect_parser = commands.add_parser('inspect')
    inspect_parser.add_argument('--id', required=True)
    check_parser = commands.add_parser('check')
    check_parser.add_argument('--require', action='store_true')
    plan_parser = commands.add_parser('plan')
    plan_parser.add_argument('--script', type=Path, required=True)
    plan_parser.add_argument('--limit', type=int, default=5)
    plan_parser.add_argument('--out', type=Path)
    args = parser.parse_args(argv)
    try:
        if args.command == 'list':
            result = summary(args.root) if args.summary else listing(args.root, args.state, args.kind)
        elif args.command == 'search':
            result = search(args.query, args.root, args.limit, state=args.state, include_archived=args.include_archived)
        elif args.command == 'inspect':
            result = inspect(args.id, args.root)
        elif args.command == 'check':
            result = readiness(args.root)
        else:
            result = routing_context(args.script.read_text(encoding='utf-8-sig'), args.root, args.limit)
        output = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
        if args.command == 'plan' and args.out:
            with args.out.open('x', encoding='utf-8', newline='\n') as stream:
                stream.write(output)
            print(json.dumps({'output': str(args.out.resolve()), 'unit_count': len(result['units'])}, ensure_ascii=False))
        else:
            print(output)
        return 2 if args.command == 'check' and args.require and not result['ready'] else 0
    except (ValueError, OSError, KeyError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    raise SystemExit(main())
