"""Portable source-to-use catalogue. Existing evidence and implementations stay with their owners."""
from __future__ import annotations

import json
from collections import Counter
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
FOCUS = 'references/video-uses.json'
ATLAS = 'references/reference-atlas.json'
METHODS = 'references/source-study-methods.json'
CASES = 'assets/modules/reference/references/catalog.json'
FRED = 'assets/fredtalk-library/catalog.json'
STUDIO = 'assets/modules/director/assets/studio/'
COVERAGE = STUDIO + 'coverage.json'
INVENTORY = STUDIO + 'inventory-summary.json'
PRESETS = 'assets/modules/director/references/presets.json'
BASE = 'assets/base-skill/docs/sources/'

# These are suggested uses of the indexed works. Original footage is a separate resource.
CASE_USE = {
    'product-film': ('产品呈现', '把本期产品的可辨认对象接到实际功能，再停在可查的结果。'),
    'motion-showreel': ('作品展示', '挑本句提到的一件作品，让它的构成、运动和最终形态先后可见。'),
    'general-motion': ('动作衔接', '挑一个能延续到下一镜的对象，跟随它的位置或形状完成交接。'),
    'animated-story': ('叙事', '让同一角色的行动产生下一镜的结果，保留能辨认它的线索。'),
    'scientific-explainer': ('解释原理', '保留同一个可观察对象，改变一个条件，显示它对结果的影响。'),
    'kinetic-typography': ('文字节奏', '用原声分出关键词的落点，把阅读时间留给最后的意思。'),
    '3d-motion': ('空间关系', '固定物件的身份，随镜头改变观察角度，让结构关系可见。'),
    'ui-morphing': ('状态连续', '用同一个控件接住形状变化，在终态展示实际功能。'),
    'pixel-art': ('像素叙事', '用同一个可辨角色的连续动作交代处境和反馈。'),
    'history-timeline': ('时间顺序', '固定时间坐标，逐次加入本期的事件、人物或成果。'),
    'music-visual': ('节拍同步', '用当前音轨的触发点驱动对象动作，结果稳定后再接下一拍。'),
    'recipe-animation': ('操作步骤', '每一步加入一种具体材料，动作完成后交给下一步。'),
}


def read(root, path):
    return json.loads((Path(root) / path).read_text(encoding='utf-8-sig'))


def usage(role, cues, action, bind, capability, **detail):
    return dict(role=role, cues=list(dict.fromkeys(s for s in cues if s)), action=action,
                bind=bind, capability=capability, **detail)


def record(ident, title, collection, scope, evidence, uses, status='available', **detail):
    return dict(id=ident, title=title, collections=[collection], scope=scope, evidence=evidence,
                uses=uses, status=status, aliases=[], **detail)


def _focus(root):
    rows = read(root, FOCUS)['films']
    films = {r['id']: r for r in rows}
    for row in rows:
        row.update(collections=['focus'], status=row.get('status', 'available'))
        row.setdefault('aliases', [])
    for atlas in read(root, ATLAS)['videos']:
        row = films[atlas['id']]
        row['atlas'] = {k: atlas[k] for k in ('id', 'source_resource_id', 'approved_ranges',
                       'excluded_ranges', 'approval_scope', 'duration_seconds', 'source_path') if k in atlas}
        overview = atlas.get('overview') or {}
        if overview.get('path'):
            row['atlas']['overview_path'] = overview['path']
    body = films['fangmu-ten-agents-final-20261021']
    body_start, body_end = body['atlas']['approved_ranges'][0]
    for design in read(root, 'assets/agent-editorial/source-designs.json')['designs']:
        cap = 'design:' + design['id']
        item = next((u for u in body['uses'] if u['capability'] == cap), None)
        if item is None:
            item = usage('正文设计', [design['label']], design['label'],
                         '填入该设计对应的本期对象、文案、材料和原声落点。', cap)
            body['uses'].append(item)
        start, end = design['source_range']
        item['examples'] = [{'start': max(body_start, start), 'end': min(end, body_end)}]
    for method in read(root, METHODS)['methods']:
        by_source = {}
        for example in method['source_examples']:
            if method.get('polarity') == 'negative' or example.get('polarity') == 'negative':
                continue
            by_source.setdefault(example['video'], []).append({k: example[k] for k in
                ('start', 'end', 'row_ids', 'shot_ids') if k in example})
        for source, examples in by_source.items():
            row = films[source]
            cap = 'method:' + method['id']
            item = next((u for u in row['uses'] if u['capability'] == cap), None)
            if item is None:
                item = usage('来源方法', [method['title']], method['semantic_use'],
                             '；'.join(method['editing_steps']), cap)
                row['uses'].append(item)
            item['examples'] = examples
            item['source_method'] = method['id']
    for stem in ('codex', 'doubao', 'token'):
        row = films['base-' + stem]
        for cue in read(root, BASE + stem + '-previews.json'):
            cap = 'capability:' + cue['id']
            item = next((u for u in row['uses'] if u['capability'] == cap), None)
            if item is None:
                item = usage('实拍动作拆解', [cue['title']], cue['title'],
                             '用本期对应的对象、前后状态和触发时刻绑定这个动作。', cap)
                row['uses'].append(item)
            item['examples'] = [{'start': cue['start'], 'end': cue['end'],
                                 'preview': 'assets/base-skill/' + cue['file']}]
    # R01–R16 already have individually authored triggers, moments, and state chains.
    doc = (Path(root) / 'references/local-video-design-distillation.md').read_text('utf-8-sig')
    row = films['local-video-5c2f8b41']
    for segment in re.split(r'(?m)^## (?=R\d{2}：)', doc)[1:]:
        head, _, body = segment.partition('\n')
        ident, title = head.split('：', 1)
        fields = dict(re.findall(r'(?m)^- (证据|适用|状态链|实现)：([^\r\n]+)', body))
        cap = 'capability:' + ident
        item = next((u for u in row['uses'] if u['capability'] == cap), None)
        if item is None:
            item = usage('剪辑动作', [title], fields.get('状态链', title), fields.get('适用', title), cap)
            row['uses'].append(item)
        item['source_cue'] = fields['证据']
    return rows


def _scene_cues(root, paths):
    """Use the particular reconstruction's labeled phases, without claiming original-film timestamps."""
    for path in paths:
        data = read(root, path)
        if not isinstance(data, dict):
            continue
        for field in ('phases', 'shots', 'scenes', 'scene_labels', 'sections'):
            sequence = data.get(field)
            if not isinstance(sequence, list):
                continue
            cues = []
            for s in sequence:
                if isinstance(s, dict):
                    value = next((s[k] for k in ('objects_and_action', 'observed_action', 'action',
                        'mechanism', 'content', 'name', 'scene', 'phase', 'motion') if isinstance(s.get(k), str)), '')
                elif isinstance(s, list):
                    value = next((v for v in reversed(s) if isinstance(v, str)), '')
                else:
                    value = s if isinstance(s, str) else ''
                if value.strip() and value not in cues:
                    cues.append(value.strip())
            if cues:
                return {'path': path, 'phase_labels': cues}
    return None


def _cases(root):
    tags = read(root, 'references/library-search-tags.json')['entries']
    rebuilt = {i['slug']: i for i in read(root, 'assets/modules/reference/references/rebuild-status.json')['entries']}
    for source in read(root, CASES)['entries']:
        slug = source['slug']
        ident = 'reference:' + slug
        searchable = tags[slug]
        title, cues = searchable['title_zh'], searchable['tags']
        role, action = CASE_USE[source['category']]
        project = rebuilt.get(slug, {}).get('project')
        project = 'assets/modules/reference/' + project if project else None
        guide = [s for s in ('scene-plan.json', 'shot-plan.json', 'project.json')
                 if project and (Path(root) / project / s).is_file()]
        paths = [project + '/' + s for s in guide]
        landmarks = _scene_cues(root, paths)
        evidence = 'assets/modules/reference/references/cases/' + slug + '.json'
        brief = usage(role, [*searchable.get('use_cues', []), title, *cues], searchable.get('application') or action,
                      '换成本期的' + '、'.join(cues[:2]) + '相关材料，按该案例的源码与分镜调整。', ident)
        if landmarks:
            labels = landmarks['phase_labels']
            brief['reconstruction_cue'] = labels[len(labels) // 2]
        yield record(ident, title, 'prompt-motion', '按本稿借用该作品的设计方法，原品牌与原色限于来源。',
                     evidence, [brief], source_title=source['title'], source_page=source.get('source_page'),
                     implementation_notes=paths, reconstruction=landmarks)


def _fred(root):
    restored = {x['id'] for x in read(root, 'assets/rebuilt-library/execution.json')['items']
                if x.get('runtime_status') == 'ready'}
    for source in read(root, FRED)['items']:
        ident = source['id']
        match = source.get('matching') or {}
        chain = source.get('state_chain') or []
        action = match.get('action') or ' → '.join(chain) or source['semantic_use']
        objects = match.get('inputObjects') or []
        bind = ('把' + '、'.join(objects) + '逐项换成本期对象。' if objects else
                '按本句准备对象、素材和触发时刻。')
        item = usage(source['category'], [source['title'], *objects, *(match.get('tags') or [])],
                     action, bind, 'software-preset:' + ident)
        yield record(ident, source['title'], 'fredtalk', '保留本条动作链与内容槽。是否有原源码、重建或预览见能力详情。',
                     FRED, [item], status='archived' if source['archived'] else 'available',
                     source_key=source['reference_id'], label=source['label'], restored=ident in restored,
                     has_source_preview=bool(source['preview'].get('video_url')),
                     source_access=source['source_access'])


def _collect(root):
    presets = {p['id']: p for p in read(root, PRESETS)}
    coverage = read(root, COVERAGE)
    works = {w['id']: w for w in coverage['observedWorks']}
    groups = read(root, INVENTORY)['mediaGroups']
    links = {}
    for group in groups:
        for work in group['knownObservedWorkIds']:
            links.setdefault(work, []).append(group)
    for key, work in works.items():
        groups_for_work = links.get(key, [])
        adapted = list(work.get('adaptedMechanisms') or [])
        if work.get('adaptedMechanism'):
            adapted.append(work['adaptedMechanism'])
        ids = dict.fromkeys([*work.get('presetIds', []), *(a['presetId'] for a in adapted),
                            *(p for g in groups_for_work for p in g['knownAdaptedPresetIds'])])
        media_types = {g['mediaType'] for g in groups_for_work}
        depth = work.get('observationDepth', '')
        medium = ('image' if 'static-image' in depth else
                  'video' if 'video' in depth or 'video' in media_types or 'interaction-observed' == depth else 'preview')
        uses = []
        for ident in ids:
            preset = presets[ident]
            uses.append(usage('软件操作' if medium == 'video' else '界面构图',
                              [work['title'], preset['title'].split('·')[-1].strip(), *preset.get('tags', [])],
                              preset['description'], preset.get('adaptationNotes') or
                              '按预设参数替换本期材料，演示后检查实际反馈。', 'software-preset:' + ident))
        row = record('collect:' + key, work['title'], 'collect-ui', '按记录的观察深度使用该作品。',
                     COVERAGE, uses, status='available' if uses else 'observation-only',
                     medium=medium, observations=work.get('observedDetails', []),
                     limits=work.get('pendingDetails', []), source_key=key, observation_depth=depth)
        row['aliases'] = [g['id'] for g in groups_for_work]
        yield row
    # Card sightings share one media identity even when cited under several categories.
    pending = {w['id']: w for w in coverage.get('pendingWorks', [])}
    for g in groups:
        if g['mediaType'] != 'video' or g['knownObservedWorkIds']:
            continue
        cats = list(dict.fromkeys(x['category'] for x in g['occurrences']))
        occurrences = [o['entryId'] for o in g['occurrences']]
        row = record(g['id'], ' / '.join(cats) + ' · ' + g['id'], 'discovery',
                     '只有目录线索。取得可观察画面后才能提炼具体剪法。', INVENTORY, [], status='metadata-only',
                     medium='video', occurrences=occurrences)
        for occurrence in occurrences:
            w = pending.pop(occurrence + '-decode-pending', None)
            if w:
                row['aliases'].append('pending:' + w['id'])
                row.update(title=w['title'], scope=w['reason'])
        yield row
    for w in pending.values():
        yield record('pending:' + w['id'], w['title'], 'discovery', w['reason'], COVERAGE, [],
                     status='metadata-only')


class Catalog:
    def __init__(self, root=ROOT):
        self.root = Path(root)
        self.by_id = {}
        self.aliases = {}
        sources = [*_focus(root), *_cases(root), *_fred(root), *_collect(root)]
        for row in sources:
            ident = row['id']
            if ident in self.aliases:
                owner = self.by_id[self.aliases[ident]]
                owner['collections'].extend(row['collections'])
                owner.setdefault('linked_records', []).append({k: v for k, v in row.items() if k != 'aliases'})
                # An interview about the same video owns the approval and use boundaries.
                continue
            if ident in self.by_id:
                raise ValueError('Duplicate video source: ' + ident)
            self.by_id[ident] = row
            for alias in row['aliases']:
                if alias in self.aliases or alias in self.by_id:
                    raise ValueError('Duplicate source alias: ' + alias)
                self.aliases[alias] = ident

    def lookup(self, ident):
        if ident.startswith('software-preset:fredtalk:'):
            ident = ident.removeprefix('software-preset:')
        key = self.aliases.get(ident, ident)
        if key not in self.by_id:
            raise ValueError('Unknown source ID: ' + ident)
        return self.by_id[key]

    def rows(self, collection=None):
        return [r for r in self.by_id.values() if not collection or collection in r['collections']]

    def summary(self):
        rows = self.by_id.values()
        collections = dict(Counter(c for r in rows for c in r['collections']))
        roles = {'focus': '逐片采用投稿中的剪法，按明确反馈纠错',
                 'prompt-motion': '为叙事、产品或说明镜头选连贯动作、镜头运动与场景设计',
                 'fredtalk': '选软件界面的实体、排版、状态变化与交接，沿用当前正文材质',
                 'collect-ui': '按实际观察借构图、交互反馈和已绑定的软件操作',
                 'discovery': '按目录定位待观察作品，取得画面后再提炼其设计'}
        return {'collections': collections,
                'browse': [{'collection': key, 'count': count, 'role': roles[key],
                            'command': 'ui.py videos list --collection ' + key + ' --page 1'}
                           for key, count in collections.items()],
                'status': dict(Counter(r['status'] for r in rows)), 'source_records': len(self.by_id),
                'note': '全片、片段、静态观察和目录线索分别计数。跨库别名与历史样片不代表额外原片。'}


def check(catalog, capabilities):
    """Catch a newly registered but unrouted film, broken evidence, or a dangling execution ID."""
    cap_ids = {r['id'] for r in capabilities}
    errors = []
    focus = {r['id'] for r in catalog.rows('focus')}
    atlas_ids = {r['id'] for r in read(catalog.root, ATLAS)['videos']}
    for missing in sorted(atlas_ids - focus):
        errors.append('Missing film card: ' + missing)
    for row in catalog.by_id.values():
        if not (catalog.root / row['evidence']).is_file():
            errors.append('Missing evidence: ' + row['id'])
        if row['status'] == 'available' and not row['uses']:
            errors.append('No source use: ' + row['id'])
        for use in row['uses']:
            if use['capability'] not in cap_ids:
                errors.append('Unknown capability for ' + row['id'] + ': ' + use['capability'])
            if not all(use[k] for k in ('role', 'cues', 'action', 'bind')):
                errors.append('Incomplete use: ' + row['id'])
    import reference_edits
    try:
        recipes, diagnostic = reference_edits.rules(catalog)
        for key, recipe in recipes.items():
            if not recipe['layers'] or set(recipe['slots']) != {l['slot'] for l in recipe['layers']}:
                errors.append('Incomplete portable edit: '+key)
        measured=read(catalog.root, reference_edits.MOTION)['sources']
        if not atlas_ids <= set(measured) or set(measured) - set(recipes):
            errors.append('Measured motion and registered source films differ.')
        submitted={'executable':len(recipes), 'corrections':len(diagnostic),'continuously_measured':len(measured)}
    except (KeyError, ValueError, OSError) as error:
        errors.append(str(error))
        submitted={}
    return {**catalog.summary(), 'submitted_edits':submitted, 'ok': not errors, 'errors': errors}
