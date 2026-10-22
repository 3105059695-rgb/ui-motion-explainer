"""Offline, explainable narration-to-reference retrieval; never an authored edit plan.

Uses relation cues and weighted Chinese bigrams/words over positive descriptions.
Candidates are prompts for the production Agent to inspect, accept or reject.
It neither understands arbitrary narration nor executes text in source files.
"""
import argparse
import ast
from collections import Counter
import hashlib
import json
import math
from pathlib import Path
import re
import sys
import unicodedata

import source_study

ROOT = Path(__file__).resolve().parents[1]
OWNER = 'ui-motion-fusion/selection.py'
RECIPE_FILE = 'references/semantic-editing-recipes.json'
CAPABILITY_FILE = 'references/capability-catalog.json'
LIBRARY_INDEXES = {'sample': 'sample_records', 'family': 'families',
                   'software-preset': 'software_presets', 'reference': 'reference_cases'}
LIBRARY_GENERIC_TERMS = {'ai', 'aigc', 'ui'}
SEARCH_TAG_FILE = 'references/library-search-tags.json'
SCENE_COMMANDS = {
    'list': 'ui.py scene list',
    'inspect': 'ui.py scene inspect --pack anim3 --scene s01',
    'scaffold': 'ui.py scene scaffold --pack anim3 --scenes s01,s04 --out spec.json',
    'compile': 'ui.py scene compile --plan project/director-plan.json --out derived-spec.json',
    'build': 'ui.py scene build --plan project/director-plan.json --presenter input.mp4 --out project --subs-js file',
    'render': 'ui.py scene render --project project --out final.mp4',
}

# These cues describe relationships, not visual styling or automatic effects.
# A cue provides recall; Agent reading of the whole narration decides suitability.
CUES = {
    'result': ('结果与来源', ('成果', '成品', '产物', '做出来', '最终效果', '成片'), ('看看', '先看', '来自', '如何', '怎么', '来源')),
    'evidence': ('问题与证据', ('证据', '为什么', '问题', '靠谱吗', '是真的吗', '判断'), ('证明', '数据显示', '记录', '因为', '原因', '实际')),
    'focus': ('密集材料中的目标', ('按钮', '字段', '控件', '这行', '那一行', '细节', '时间线', '代码', '这一栏'), ('看', '找到', '定位', '点击', '选中', '查看', '放大', '聚焦', '修改')),
    'causal': ('触发后的状态变化', ('导致', '所以', '因为', '触发', '机制', '因果', '一旦', '就会'), ('变成', '发生', '结果', '改变', '变为', '影响', '反馈')),
    'handoff': ('同一对象跨媒介交接', ('资料', '文件', '任务', '材料', '数据', '输入', '同一', '报告'), ('传给', '交给', '移到', '转成', '变成', '汇入', '进入', '同步', '导入', '更新', '输出')),
    'compare': ('相同条件下的比较', ('对比', '比较', '同一个输入', '同样', '两种', '差别', '差异', '以前', '原来'), ('现在', '另一', '不同', '更快', '慢', '减少', '分钟', '结果', '终稿')),
    'recovery': ('失败后恢复已存状态', ('失败', '改坏', '出错', '报错', '崩溃', '误删'), ('恢复', '回退', '撤回', '存档', '快照', '旧版本', '回到', '重试')),
    'overload': ('负担累积后减负', ('太多', '堆积', '记不住', '塞满', '负担', '超负荷', '压力', '上下文'), ('压缩', '整理', '精简', '保留', '关键信息', '提取', '减少')),
    'loss': ('表达或传递的信息损失', ('脑海', '脑中', '想法', '意图', '信息', '画面', '表达'), ('丢失', '漏掉', '只剩', '变少', '说不出', '说出来', '表达不出来', '传递中损失')),
    'emotion': ('可见刺激与人物反应', ('烦恼', '烦得', '烦躁', '焦虑', '崩溃', '挫败', '失望', '犹豫', '累', '开心', '释然', '惊讶', '松了一口气'), ('终于', '却', '反复', '发现', '看到', '遇到', '决定', '又要')),
    'friction': ('重复劳动与任务委托', ('来回', '反复', '搬运', '复制粘贴', '换工具', '工位', '返工', '人工'), ('交给', '接管', '自动', '委托', '帮我', '执行', '麻烦', '步骤', '重新', '又得', '再解释')),
    'combine': ('选择后交接和组合', ('能力', '工具', '零件', '资源', '成员', '分工'), ('组合', '组装', '挑选', '协作', '取用', '拼起来', '接力', '交接')),
    'loss_migration': ('迁移和恢复既有积累', ('账号', '记忆', '历史', '插件', '搬家', '迁移', '换工具', '聊过'), ('丢失', '封禁', '搬', '导出', '导入', '恢复', '重新', '又得')),
    'scope': ('层级与作用范围', ('全局', '子目录', '项目级', '层级', '嵌套', '作用范围'), ('覆盖', '优先', '里面', '包含', '局部', '逐层')),
    'operation': ('真实操作和结果证明', ('点击', '打开', '选择', '提交', '拖动', '输入', '运行', '保存'), ('完成', '反馈', '结果', '生成', '显示', '出现', '入口', '确认')),
    'reveal': ('由已有对象揭开下一层', ('遮挡', '翻页', '掀开', '衣服', '换装', '推门', '揭开'), ('然后', '进入', '下一', '变成', '露出', '展开', '穿上')),
    'navigation': ('总览进入步骤并保留位置', ('步骤', '第一步', '第二步', '第三步', '章节', '接下来', '总结', '回顾'), ('先', '再', '然后', '最后', '分别', '三步', '几步')),
    'scale': ('统一基准中的数量与成本', ('容量', '大小', '数量', '成本', '预算', '占用', '余量', '字数', '价格', '费用'), ('超出', '不足', '剩下', '多少', '增加', '减少', '对比', '更低', '限制')),
    'translation': ('同场对话中的语言转换', ('翻译', '译文', '语言', '英文', '中文', '对话'), ('对方', '双向', '实时', '交流', '理解', '说话', '回答')),
    'branch': ('条件或受众决定路径', ('如果', '适合', '新手', '专业', '受众', '条件', '选择'), ('否则', '另一', '就用', '可以用', '分别', '路径', '方案')),
    'story': ('事件前后因果与应对', ('主角', '对方', '故事', '现场', '敌人', '船', '人物'), ('命令', '攻击', '躲避', '受损', '应对', '行动', '随后')),
    'representation': ('同一项目的多种表现', ('同一项目', '同一个', '同一份', '这份', '这个方案', '输入'), ('多个', '不同形式', '多份', '图表', '报告', '渠道', '表现', '输出')),
    'construction': ('同一对象连续改造', ('模型', '建筑', '结构', '方案', '空间'), ('改造', '重组', '修改', '优化', '建成', '变形')),
    'memory': ('交流提取并沉淀经验', ('对话', '交流', '经验', '记忆', '讨论'), ('提取', '分类', '存到', '保存', '整理', '复用')),
    'sync': ('共享来源中的联动更新', ('两边', '两处', '两份', '同一份', '共享', '状态', '字段'), ('改动', '修改', '一起更新', '同时更新', '同步', '联动')),
}

METHOD_TAGS = {
    'Q-W01': ('branch', 'result'), 'Q-W02': ('handoff', 'combine'),
    'Q-W03': ('friction', 'emotion'), 'Q-W04': ('reveal', 'scope'),
    'Q-W05': ('focus', 'operation'), 'Q-W06': ('story', 'causal'),
    'Q-W07': ('handoff', 'result'), 'Q-W08': (),
    'Q-C01': ('recovery',), 'Q-C02': ('overload', 'emotion'),
    'Q-C03': ('scope',), 'Q-C04': ('recovery', 'operation'),
    'Q-C05': ('memory', 'handoff'), 'Q-C06': ('combine', 'evidence'),
    'Q-N01': ('handoff', 'causal'), 'Q-N02': ('friction', 'emotion'),
    'Q-N03': ('loss_migration', 'emotion'), 'Q-N04': ('story', 'evidence'),
    'Q-N05': ('operation', 'result'), 'Q-N06': ('compare',),
    'Q-N07': ('focus', 'scope'), 'Q-N08': ('combine', 'handoff'),
    'Q-N09': ('handoff', 'result'), 'Q-N10': ('combine', 'operation'),
    'Q-N11': ('friction', 'combine'), 'Q-N12': ('combine',),
    'Q-N13': ('evidence', 'compare'), 'Q-N14': ('result', 'evidence'),
    'Q-A01': ('result', 'navigation'), 'Q-A02': ('friction', 'handoff'),
    'Q-A03': ('operation',), 'Q-A04': ('representation', 'compare'),
    'Q-A05': ('operation', 'result'), 'Q-A06': ('reveal',),
    'Q-A07': ('construction',), 'Q-A08': ('translation',),
    'F-M01': ('representation', 'handoff', 'sync'), 'F-M02': ('compare', 'handoff'),
    'F-M03': ('focus',), 'F-M04': ('causal', 'focus'),
    'F-M05': ('friction', 'compare'), 'F-M06': ('recovery', 'operation', 'sync'),
    'F-M07': ('causal', 'evidence'), 'F-M08': ('compare', 'representation'),
    'F-M09': ('scale',), 'F-M10': ('handoff', 'operation'),
    'F-M11': ('navigation',), 'F-M12': ('scale', 'evidence'),
    'F-M13': ('navigation', 'reveal'), 'F-M14': ('evidence', 'causal'),
}
RECIPE_TAGS = {
    'S01': ('result',), 'S02': ('evidence',), 'S03': ('focus',),
    'S04': ('causal', 'handoff', 'recovery', 'memory', 'sync'), 'S05': ('compare', 'scale', 'branch'),
    'S06': ('handoff', 'representation', 'sync'), 'S07': ('reveal',),
    'S08': ('combine',), 'S09': ('loss',), 'S10': ('emotion', 'overload', 'friction'),
}
ROUTE_TAGS = (
    ('result', 'evidence', 'navigation'), ('focus',), ('handoff', 'representation', 'sync'),
    ('causal', 'operation', 'recovery', 'combine', 'sync'), ('compare', 'scale', 'scope', 'branch'),
    ('emotion', 'loss', 'overload', 'friction', 'story'), ('evidence', 'memory'), (),
)


def load_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def normalized(text):
    return unicodedata.normalize('NFKC', text).lower()


def terms(text):
    tokens = []
    for part in re.findall(r'[\u3400-\u9fff]+|[a-z0-9_-]+', normalized(text)):
        if re.search(r'[\u3400-\u9fff]', part):
            tokens.extend(part[i:i + 2] for i in range(len(part) - 1))
        elif len(part) > 1:
            tokens.append(part)
    return Counter(tokens)


def positive_hits(text, words):
    result = []
    for word in words:
        for match in re.finditer(re.escape(word), text):
            # A local negation is not evidence that this relation occurs.
            before = text[max(0, match.start() - 5):match.start()]
            if not re.search(r'(?:不是|并非|没有|无需|不要|不必|并不|不会)[^，。；！？]{0,3}$', before):
                result.append(word)
                break
    return result


def relation_cues(text):
    text = normalized(text)
    found = {}
    for tag, (label, subjects, actions) in CUES.items():
        left, right = positive_hits(text, subjects), positive_hits(text, actions)
        # Multi-group co-occurrence is stronger than an isolated trigger word.
        if left or right:
            strength = 1.8 if left and right else (1.1 if len(left) > 1 else 0.6 if left else 0.25)
            found[tag] = {'label': label, 'strength': strength, 'evidence': left + right,
                          'relation_complete': bool(left and right)}
    # Information loss requires the expression/transfer relation, not "查询没找到".
    if 'loss' in found and not found['loss']['relation_complete']:
        del found['loss']
    return found


def source_segments(text):
    """Preserve exact character spans. Units are reading anchors, not shot cuts."""
    result = []
    for match in re.finditer(r'[^。！？!?\r\n]+[。！？!?]*', text):
        raw = match.group()
        left = len(raw) - len(raw.lstrip())
        quote = raw.strip()
        if not quote or re.fullmatch(r'\d+|\d\d:\d\d:.*-->.*', quote):
            continue
        start = match.start() + left
        result.append({'id': f'U{len(result) + 1:03d}', 'quote': quote,
                       'span': {'start': start, 'end': start + len(quote)}})
    return result


def _catalogs(root):
    methods = source_study.method_records(root)
    recipes = load_json(Path(root) / RECIPE_FILE)['recipes']
    capabilities = load_json(Path(root) / CAPABILITY_FILE)
    return methods, recipes, capabilities


def _positive_description(record):
    keys = ('title', 'semantic_use', 'viewer_gap', 'understanding_gap', 'intents',
            'use_when', 'state_chain', 'search_title_zh', 'search_tags')
    return ' '.join(str(record[k]) for k in keys if k in record)


class Ranker:
    def __init__(self, records):
        self.terms = {r['id']: terms(_positive_description(r)) for r in records}
        counts = Counter(t for bag in self.terms.values() for t in bag)
        n = len(records)
        self.idf = {t: math.log(1 + (n + 1) / (count + 1)) for t, count in counts.items()}

    def similarity(self, text, ident):
        query = terms(text)
        doc = self.terms[ident]
        shared = query.keys() & doc.keys()
        if not shared:
            return 0.0, []
        def weight(bag, term):
            return (1 + math.log(bag[term])) * self.idf.get(term, 1.0)
        dot = sum(weight(query, t) * weight(doc, t) for t in shared)
        norms = math.sqrt(sum(weight(query, t) ** 2 for t in query) *
                          sum(weight(doc, t) ** 2 for t in doc))
        return dot / norms if norms else 0.0, sorted(shared, key=lambda t: (-self.idf[t], t))[:6]


def _file_fact(path, root, resource_id):
    from resource_inventory import resource_fact
    return resource_fact(resource_id, path, root=root)


def _implementation(record, kind, root, resolve_resources=True):
    data = dict(record.get('implementation') or {})
    paths = []
    if data.get('path'):
        paths.append(data['path'])
    paths += data.get('entrypoints') or []
    paths += [s.get('path') for s in data.get('sources') or [] if isinstance(s, dict) and s.get('path')]
    data['resources'] = ([_file_fact(p, root, f"{kind}:{record['id']}:{p}") for p in dict.fromkeys(paths)]
                         if resolve_resources else [])
    if not resolve_resources:
        data['resource_resolution'] = 'deferred-to-reference-inspect'
    data['runtime_tested_this_run'] = False
    data['scope'] = data.get('scope', data.get('note', '源码存在不等于本段已实现、运行或获认可。'))
    return data


def _local_study_evidence(video, root):
    """Use the existing explicit research mapping; never search guessed folders."""
    from resource_inventory import resource_fact
    fact = resource_fact(f'aigc-research:{video}-sentence-alignment', root=root)
    if not fact['file_exists']:
        return {'path': None, 'shots': {}}
    try:
        payload = load_json(fact['path'])
    except (OSError, ValueError):
        return {'path': None, 'shots': {}}
    if not isinstance(payload, dict) or payload.get('video') != video:
        return {'path': None, 'shots': {}}
    return {'path': fact['path'], 'shots': {row['id']: row for row in payload.get('shots', [])
                                          if isinstance(row, dict) and row.get('id')}}


def _visual_evidence(shot, facts, local_study, root):
    """Resolve recorded image paths while retaining provenance and video fallback."""
    resolved = []
    local_shot = local_study['shots'].get(shot.get('id'), {})
    same_span = all(local_shot.get(key) == shot.get(key) for key in ('start', 'end'))
    original_media = facts.get('original_media') or {}
    for evidence in shot.get('evidence', []):
        if not isinstance(evidence, dict):
            continue
        historical = evidence.get('path')
        actual, via = None, 'unavailable'
        if isinstance(historical, str) and historical and '://' not in historical:
            recorded = Path(historical.replace('\\', '/'))
            bases = [Path(root)]
            if facts.get('alignment'):
                bases.append(Path(facts['alignment']).parent)
            for base in bases:
                candidate = (base / recorded).resolve()
                if candidate.is_file():
                    actual, via = str(candidate), 'registered-evidence-path'
                    break
            if actual is None and local_study['path'] and same_span:
                for mapped in local_shot.get('evidence', []):
                    value = mapped.get('path') if isinstance(mapped, dict) else None
                    if not isinstance(value, str) or '://' in value:
                        continue
                    mapped_path = Path(value.replace('\\', '/'))
                    if mapped_path.name != recorded.name or mapped.get('times') != evidence.get('times'):
                        continue
                    candidate = (Path(local_study['path']).parent / mapped_path).resolve()
                    if candidate.is_file():
                        actual, via = str(candidate), 'explicit-local-alignment'
                        break
        resolved.append({**evidence, 'historical_path': historical, 'path': actual,
                         'status': 'available' if actual else 'missing',
                         'resolution_source': via,
                         'alignment_source': local_study['path'] if via == 'explicit-local-alignment' else facts.get('alignment'),
                         'video_fallback': {'path': original_media.get('path'),
                                            'status': 'available' if original_media.get('file_exists') else 'missing',
                                            'times': evidence.get('times', []),
                                            'start': shot.get('start'), 'end': shot.get('end')},
                         'media_reviewed_this_run': False})
    return {**shot, 'evidence': resolved}


def _examples(record, source_facts, alignments, root):
    """Return the recorded speech/visual relationship, not just a lookup link."""
    result = []
    row_keys = ('id', 'start', 'end', 'text', 'status', 'shot_ids', 'mapping',
                'purpose_inference', 'semantic_group', 'speech_role')
    for ex in record.get('source_examples', []):
        video = ex.get('video')
        facts = source_facts.get(video, {})
        if video not in alignments:
            try:
                payload = source_study.alignment(video, root)
                rows = sorted(source_study.alignment_rows(payload), key=lambda row: row.get('start', 0))
                alignments[video] = {'rows': rows, 'shots': payload.get('shots', []),
                                     'review': payload.get('review', {}),
                                     'local_evidence': _local_study_evidence(video, root)}
            except (ValueError, OSError):
                alignments[video] = {'rows': [], 'shots': [], 'review': {},
                                     'local_evidence': {'path': None, 'shots': {}}}
        study = alignments[video]
        rows = study['rows']
        ids = ex.get('row_ids', [])
        selected = [row for row in rows if row['id'] in ids]
        positions = [i for i, row in enumerate(rows) if row['id'] in ids]
        shot_ids = set(ex.get('shot_ids', []))
        shot_ids.update(ident for row in selected for ident in row.get('shot_ids', []))
        compact = lambda row: {key: row[key] for key in row_keys if key in row}
        item = {k: ex[k] for k in ('video', 'start', 'end', 'row_ids', 'polarity', 'learning_scope') if k in ex}
        item.update({'alignment': facts.get('alignment'),
                     'alignment_exists': facts.get('alignment_exists', False),
                     'original_media': facts.get('original_media'),
                     'row_preview': [compact(row) for row in selected[:1]],
                     'source_rows': [compact(row) for row in selected],
                     'context_before': compact(rows[min(positions)-1]) if positions and min(positions) else None,
                     'context_after': compact(rows[max(positions)+1]) if positions and max(positions)+1 < len(rows) else None,
                     'visual_evidence': [_visual_evidence(shot, facts, study['local_evidence'], root)
                                         for shot in study['shots'] if isinstance(shot, dict) and shot.get('id') in shot_ids],
                     'historical_review': study['review'],
                     'media_reviewed_this_run': False,
                     'read_command': f'ui.py study -- example --video {video} --row {ids[0]}' if ids else None})
        result.append(item)
    return result


def _candidate(record, kind, root, source_facts, alignments, resolve_resources=True):
    common = {'id': record['id'], 'kind': kind, 'title': record['title'],
              'fit': record.get('semantic_use', record.get('use_when', '')),
              'avoid': record.get('avoid', record.get('avoid_when', [])),
              'implementation': _implementation(record, kind, root, resolve_resources),
              'inspect_command': f"ui.py inspect --kind {kind} --id {record['id']}",
              'decision_status': 'pending-agent',
              'style_scope': ('效果库可提供整体构图、材料层次、窗口组织、主体尺度与连续动作；按本段表达选择并实际查看实现。人物身份与原媒体不自动复用，目录收录不等于认可。'
                              if kind in ('capability', 'family', 'software-preset', 'reference') else
                              '研究原句、上下文与对应画面，再按本段表达采用方法；历史整片与账号视觉不成为本期默认模板。')}
    for key in ('validation', 'component_validation', 'status', 'user_approval'):
        if key in record:
            common[key] = record[key]
    if kind == 'method':
        common['examples'] = _examples(record, source_facts, alignments, root)
        common['state_chain'] = record.get('state_chain', [])
        common['usage'] = 'avoid' if source_study.explicitly_negative(record) else 'candidate-adapt'
    elif kind == 'recipe':
        common['evidence'] = record.get('source_evidence', [])
        common['required_inputs'] = record.get('required_inputs', [])
        common['action_chain'] = record.get('event_chain', [])
    else:
        common['source_records'] = [dict(row, resource=_file_fact(row['path'], root, f"{kind}:{record['id']}:source:{row['path']}"))
                                    for row in record.get('source', []) if isinstance(row, dict) and row.get('path')]
        common['user_approval'] = record.get('user_approval', {})
        if not common['avoid']:
            common['avoid'] = ['原稿不需要此关系时不要套用；历史示例中的对象、布局、配色和时长不是本期指令。']
    return common


def _library_records(catalog, root=ROOT):
    """Search retained indexes together; no source quotas or approval score bonus."""
    import fredtalk_library
    records = ([dict(row, library_kind=kind) for kind, key in LIBRARY_INDEXES.items()
                for row in catalog.get(key, [])] + fredtalk_library.records(root=root)
               + component_records(root, catalog))
    tag_path = Path(root) / SEARCH_TAG_FILE
    tags = load_json(tag_path).get('entries', {}) if tag_path.is_file() else {}
    for row in records:
        extra = tags.get(row['id'], {}) if row['library_kind'] == 'reference' else {}
        if extra:
            row.update(search_title_zh=extra.get('title_zh', ''), search_tags=extra.get('tags', []))
    return records


def component_records(root=ROOT, catalog=None):
    """Expose actual exported EditingKit names, not a second component registry."""
    if catalog is None:
        path = Path(root) / CAPABILITY_FILE
        catalog = load_json(path) if path.is_file() else {}
    api = (catalog.get('semantic_directing') or {}).get('implementation') or {}
    relative = api.get('path')
    path = Path(root) / relative if isinstance(relative, str) else None
    if path is None or not path.is_file():
        return []
    source = path.read_text(encoding='utf-8-sig')
    found = re.search(r'\bconst\s+names\s*=\s*Object\.freeze\(\s*(\[[^\]]*\])\s*\)', source)
    if not found:
        return []
    names = ast.literal_eval(found.group(1))
    if not isinstance(names, list) or any(not isinstance(name, str) or not re.fullmatch(r'[a-z][a-z0-9-]*', name) for name in names):
        raise ValueError('EditingKit exported names must be an array of component IDs.')
    if len(names) != len(set(names)):
        raise ValueError('EditingKit exported names contain duplicate component IDs.')
    documentation = Path(root) / api['documentation'] if api.get('documentation') else None
    guide = documentation.read_text(encoding='utf-8-sig') if documentation and documentation.is_file() else ''
    rows = []
    for name in names:
        heading = re.search(r'^###\s+`' + re.escape(name) + r'`[：:\s]*(.+)$', guide, re.M)
        title = heading.group(1).strip() if heading else name
        rows.append({'id': name, 'title': title, 'semantic_use': title, 'library_kind': 'component',
                     'reuse_contribution': 'motion-only',
                     'source': [{'path': relative, 'selector': name}],
                     'implementation': {'status': 'source-present', 'kind': 'editing-kit',
                                        'path': relative, 'effect': name,
                                        'sources': [{'path': relative, 'selector': name}]},
                     'user_approval': {}, 'runtime_status': 'not-verified',
                     'scope': '仅为实际 API 的底层动作组件；调用不等于采用某个完整配方、整体设计或用户认可。'})
    return rows


def library_contribution_allowed(record, contribution):
    """Separate motion reuse from appearance rejection, without inventing approval."""
    if source_study.explicitly_negative(record):
        return False
    if contribution != 'motion' and record.get('reuse_contribution') == 'motion-only':
        return False
    approval = record.get('user_approval') or {}
    approval = approval if isinstance(approval, dict) else {}
    status = str(approval.get('status', '')).lower()
    motion = record.get('motion_approval', approval.get('motion', {}))
    motion_status = str(motion.get('status', '') if isinstance(motion, dict) else motion).lower()
    motion_rejected = (motion is False or motion_status in ('rejected', 'negative', 'avoid')
                       or status in ('rejected-motion', 'motion-rejected', 'rejected-action', 'action-rejected'))
    if contribution == 'motion':
        return not motion_rejected
    return not motion_rejected and 'rejected' not in status


def _library_negative(record):
    return not library_contribution_allowed(record, 'motion')


def library_directory(root=ROOT, catalog=None, records=None):
    """Expose every retained entry independently of per-sentence lexical ranking."""
    catalog = load_json(Path(root) / CAPABILITY_FILE) if catalog is None else catalog
    records = _library_records(catalog, root) if records is None else records
    rows = [dict(row, library_kind='capability') for row in catalog.get('capabilities', [])] + records
    entries = []
    for row in rows:
        kind, ident = row['library_kind'], row['id']
        impl = row.get('implementation') or {}
        sources = row.get('source', [])
        sources = sources if isinstance(sources, list) else [sources]
        sources = [dict(value) for value in sources + impl.get('sources', [])
                   if isinstance(value, dict) and value.get('path')]
        item = {'id': ident, 'kind': kind, 'title': row.get('title', ident),
                'title_zh': row.get('search_title_zh', ''), 'search_tags': row.get('search_tags', []),
                'use_when': row.get('semantic_use', row.get('use_when', '')),
                'inspect_command': f'ui.py inspect --kind {kind} --id {ident}',
                'source_entries': sources,
                'implementation_status': impl.get('status', 'read-entry-before-use'),
                'motion_available_for_selection': library_contribution_allowed(row, 'motion'),
                'design_available_for_selection': library_contribution_allowed(row, 'design'),
                'user_approval': row.get('user_approval', {}), 'baseline_selected': False,
                'scope': '按本期句意选择动作与设计；历史身份、故事、配色和时长不自动继承。可发现不等于本句适用或已实现。'}
        if kind == 'reference':
            item['source_resolution'] = 'inspect resolves current original media and source paths on demand'
        if kind == 'software-preset' and str(ident).startswith('fredtalk:'):
            item['materialize_command'] = f'python -B -X utf8 scripts/fredtalk_library.py materialize --id {ident} --project <本工程>'
        entries.append(item)
    return {'entry_count': len(entries), 'counts_by_kind': dict(Counter(row['kind'] for row in entries)),
            'source_root': str(Path(root).resolve()),
            'entries': entries, 'truncated': False, 'ranking_applied': False,
            'list_command': 'ui.py select --list-library',
            'search_tag_file': str((Path(root) / SEARCH_TAG_FILE).resolve()),
            'scope': '完整效果库发现入口；逐句 top-N 只提供建议，不限制动作、设计或来源的可选范围。'}


def render_library_directory(directory):
    if not directory:
        return ''
    counts = '；'.join(f'{kind} {count}' for kind, count in directory.get('counts_by_kind', {}).items())
    return '\n'.join(['## 完整效果库入口', '',
        f"完整保留 {directory.get('entry_count', 0)} 项（{counts}），不按逐句排名截断。",
        '全部条目、用途、中文检索标签、实际 inspect 命令与源码入口在 director-context.json 的 selection.library_directory.entries。',
        f"独立查看：`{directory.get('list_command', 'ui.py select --list-library')}`。",
        '先根据整段口播决定要看懂的变化，再从全库查找；完整场景、动作组合与源码改编均可，不预设优先作者或包。',
        '动作可用性与历史外观认可分开；本句是否适用、源码是否运行、画面是否好看仍需实际判断。', ''])


def scene_directory(root=ROOT):
    """Discover complete source scenes without a lexical filter or style choice."""
    try:
        from scene_builder import scene_catalog
        catalog = scene_catalog(root=root)
        keys = ('id', 'pack', 'scene_id', 'title', 'role', 'source', 'manifest', 'preview',
                'native_duration_seconds', 'required_slots', 'inspect_command', 'scaffold_command',
                'build_status', 'runtime_verified_this_run')
        return {
            'schema_version': 1, 'status': catalog.get('status', 'source-adaptation-candidates'),
            'packs': catalog.get('packs', []),
            'scenes': [{key: row[key] for key in keys if key in row} for row in catalog.get('scenes', [])],
            'scene_count': len(catalog.get('scenes', [])), 'commands': dict(SCENE_COMMANDS),
            'selection': 'Agent reads the full narration and selects only useful scenes; this directory is not a match result or a whole-film template.',
            'implementation_scope': 'Complete Adu scene adapters expose content slots and build commands; F/X methods and Fred source retain their own customization requirements.',
            'runtime_verified_this_run': False,
        }
    except (ImportError, OSError, ValueError, KeyError, TypeError) as error:
        return {'schema_version': 1, 'status': 'unavailable', 'packs': [], 'scenes': [],
                'scene_count': 0, 'commands': dict(SCENE_COMMANDS), 'errors': [str(error)],
                'runtime_verified_this_run': False}


def render_scene_directory(directory):
    """Compact full-scene discovery, before per-sentence ranking or low-level APIs."""
    lines = ['## 完整场景构建入口', '',
             '下面是效果库中已有参数接口的场景子集，与其他源码及动作组合平等选用。这个目录不按关键词截断；跨库组合仍须符合当前方向。',
             f"完整目录：`{directory['commands']['list']}`；以下命令中的包、场景、文件均按本期选择替换。", '']
    if directory.get('errors'):
        return '\n'.join(lines + ['目录暂不可用：' + '; '.join(directory['errors']), ''])
    scenes = directory.get('scenes', [])
    for pack in directory.get('packs', []):
        selected = [row for row in scenes if row['pack'] == pack['id']]
        lines += [f"### {pack['id']} · {pack.get('title', pack['id'])}（{len(selected)} 个场景）", '',
                  f"来源清单：`{pack.get('manifest', {}).get('path', '目录未提供路径')}`。"]
        for source in dict.fromkeys(row.get('source', {}).get('path') for row in selected):
            if source:
                lines.append(f'完整场景源码：`{source}`。')
        lines.append('')
        for row in selected:
            preview = row.get('preview') or {}
            source = row.get('source') or {}
            command = row.get('inspect_command') or f"ui.py scene inspect --pack {row['pack']} --scene {row['scene_id']}"
            lines.append(f"- {row['scene_id']} · {row.get('title', row['id'])}；{row.get('role', '')}；原段 {row.get('native_duration_seconds', '?')} 秒；源码选择器 `{source.get('selector', row['scene_id'])}`；构建状态 `{row.get('build_status', '未记录')}`。")
            lines.append(f"  预览：`{preview.get('entry', '未记录')}` {preview.get('start', '?')}–{preview.get('end', '?')} 秒；查看 `{command}`。")
        lines.append('')
    if not scenes:
        lines += ['当前安装目录没有可列出的完整场景；按完整目录命令检查来源，不把空目录当成可构建结果。', '']
    lines += [
        '在同一份 director-plan.json 的 segment.scene 中绑定本期场景、内容和原声时间；既有字幕沿用原声对齐：',
        f"- 参数派生：`{directory['commands']['compile']}`。输出仅为计划派生物，不另手写第二份语义计划。",
        f"- 旧配置探槽：`{directory['commands']['scaffold']}`。仅为兼容接口；手写 spec 制作须显式 --legacy-spec。",
        f"- 构建工程：`{directory['commands']['build']}`。",
        f"- 渲染工程：`{directory['commands']['render']}`。",
        'Adu 完整场景已有内容槽与构建入口；F/X 方法、配方和 Fred 源码各自仍需所记录的手工适配。目录读取没有构建或渲染，也不代表参数已经填好、审美已认可。', '',
    ]
    return '\n'.join(lines)


def _library_candidate(record, root, facts, alignments):
    kind = record['library_kind']
    # Reference cases have an explicit machine-local resolver. Do not report
    # packaged historical paths as the currently selected implementation.
    row = _candidate(record, kind, root, facts, alignments,
                     resolve_resources=kind != 'reference')
    row['usage'] = 'avoid' if _library_negative(record) else 'candidate-adapt'
    row['reuse_scope'] = ('实际 API 底层动作；不声明完整配方或整体场景设计复用。' if kind == 'component' else
                          '历史样片的动作与局部表达可按句意查询采用；保留原认可范围，身份、故事和配色不成为本期默认。' if kind == 'sample' else
                          '可按本段表达采用整体 UI 构图、材料、窗口组织和动作设计；读取实际案例与源码后定制，未自动认可全库。')
    row['allowed_contributions'] = [kind for kind in ('motion', 'design') if library_contribution_allowed(record, kind)]
    row['baseline_selected'] = False
    row['source_metadata'] = record.get('source', [])
    if kind == 'family' and record['id'] == 'adu-mechanisms':
        row['scene_builder'] = {
            'entrypoint': str((Path(root) / 'scripts/scene_builder.py').resolve()),
            'exists': (Path(root) / 'scripts/scene_builder.py').is_file(),
            'commands': dict(SCENE_COMMANDS),
            'scope': '完整 Adu 场景提供内容槽与构建入口；仅选本期适用场景，填写文案、素材和时序。其他展项不自动成为可参数化完整场景。',
            'runtime_verified_this_run': False,
        }
    if kind == 'software-preset' and str(record['id']).startswith('fredtalk:'):
        row['materialize_command'] = ('python -B -X utf8 scripts/fredtalk_library.py materialize '
                                      f"--id {record['id']} --project <本工程>")
        row['reuse_requirements'] = {key: record.get(key, []) for key in
                                    ('external_packages', 'required_media', 'unresolved_imports')}
        row['catalog_path'] = 'assets/fredtalk-library/catalog.json'
        row['guidance_path'] = str((Path(root) / 'assets/fredtalk-library/README.md').resolve())
        for key in ('matching', 'preview', 'upstream_reusability'):
            if key in record:
                row[key] = record[key]
    if kind == 'reference':
        row['resource_resolution'] = 'deferred-to-reference-inspect'
        row['implementation']['scope'] = ('目录中的历史状态与路径尚未解析；使用 inspect --kind reference '
                                         '读取当前本机案例，路径存在不等于可运行或已认可。')
    elif kind == 'sample':
        row['approval_resources'] = [
            _file_fact(item['path'], root, f"sample:{record['id']}:approval:{item['path']}")
            for item in (record.get('user_approval') or {}).get('evidence', [])
            if isinstance(item, dict) and item.get('path')]
        resources = row['implementation']['resources']
        row['implementation_paths_present'] = bool(resources) and all(r['exists'] for r in resources)
        row['approval_scope'] = '保留目录原认可及限制；缺失路径与占位不是可用成片或本期认可。'
    return row


def _rank(records, tags, ranker, quote, context, cues, limit):
    scores = []
    for record in records:
        if source_study.explicitly_negative(record):
            continue
        ident = record['id']
        # Do not suggest highly domain-specific scenes merely because their
        # positive descriptions contain general words like "确认" or "改变".
        domain_requirements = {'Q-A05': r'AIGC|生成|角色|资产|镜头|视频|产品',
                               'Q-A08': r'翻译|译文|语言|中文|英文',
                               'Q-A07': r'建筑|改造|建成|结构|空间|重组',
                               'Q-W06': r'故事|船|历史|命令|攻击|躲避|受损'}
        if ident in domain_requirements and not re.search(domain_requirements[ident], quote + context, re.I):
            continue
        similarity, overlaps = ranker.similarity(quote, ident)
        context_similarity, _ = ranker.similarity(context, ident)
        matched = [tag for tag in tags.get(ident, ()) if tag in cues]
        relation_score = sum(cues[tag]['strength'] if cues[tag]['strength'] >= .75 else .1 for tag in matched)
        # Weak lexical accidents or isolated generic verbs are not a match.
        if not any(cues[tag]['strength'] >= .75 for tag in matched) and similarity < .16:
            continue
        score = relation_score + similarity * 5 + context_similarity * .35
        scores.append((score, ident, record, {'relation_cues': matched,
                                             'text_overlap': overlaps,
                                             'lexical_similarity': round(similarity, 4),
                                             'score': round(score, 4),
                                             'score_is_probability': False}))
    return [(record, why) for _, _, record, why in sorted(scores, key=lambda row: (-row[0], row[1]))[:limit]]


def _approved_example(row):
    metadata = row.get('retrieval') or {}
    return {'id': row['id'], 'title': row['title'], 'kind': 'approved-example',
            'profile_id': row.get('profile_id'), 'usage': row.get('usage'),
            'preview': {'path': row['path'], 'exists': row.get('exists', False)},
            'approval_scope': row.get('scope'), 'approval_kind': row.get('approval_kind', 'scoped-sample'),
            'method_scope': metadata.get('method_scope'), 'mode': metadata.get('mode'),
            'source_range': row.get('source_range'), 'media_range': row.get('media_range'),
            'quote': row.get('quote'), 'evidence': row.get('evidence', []),
            'available_materials': row.get('related_visuals', []),
            'boundaries': row.get('boundaries', []),
            'whole_film_approved': row.get('whole_film_approved'),
            'implementation': {'entrypoints': [p['path'] for p in row.get('implementations', [])],
                               'scope': metadata.get('method_scope') or row.get('scope'),
                               'runtime_tested_this_run': False},
            'identity_reuse_allowed': False, 'media_reuse_automatic': False, 'style_reuse_automatic': False,
            'decision_status': 'pending-agent'}


def build_selection_context(root, source, limit=4, style_resolution=None):
    """Build per-span candidates. source={path,sha256,text}; does not mutate it."""
    root = Path(root).resolve()
    text = source.get('text')
    if not isinstance(text, str) or not text.strip():
        raise ValueError('Narration must contain nonempty text.')
    if not isinstance(limit, int) or not 1 <= limit <= 10:
        raise ValueError('Candidate limit must be between 1 and 10.')
    methods, recipes, catalog = _catalogs(root)
    if style_resolution is None:
        import style_registry
        style_resolution = (style_registry.resolve(root, root=root)
                            if (root / style_registry.REGISTRY).is_file() else {})
    capabilities = catalog['capabilities']
    capability_tags = {}
    for route, tags in zip(catalog['semantic_routes'], ROUTE_TAGS):
        for ident in route.get('ids', []):
            capability_tags.setdefault(ident, set()).update(tags)
    facts = {r['id']: r for r in source_study.source_facts(root)}
    alignments = {}
    groups = [('methods', 'method', methods, METHOD_TAGS), ('recipes', 'recipe', recipes, RECIPE_TAGS),
              ('capabilities', 'capability', capabilities, capability_tags)]
    rankers = {name: Ranker(rows) for name, _, rows, _ in groups}
    library = _library_records(catalog, root)
    library_positive = [row for row in library if not _library_negative(row)]
    directory = library_directory(root, catalog, library)
    library_ranker = Ranker(library_positive)
    guidance = Path(root) / 'assets/fredtalk-library/README.md'
    library_guidance = ([{'id': 'fredtalk-library', 'path': str(guidance.resolve()),
                          'exists': guidance.is_file(),
                          'scope': '按需阅读源码采用方法：查看预览与实际导出、materialize、适配并真实调用；不强制选择此库。'}]
                        if any(str(row['id']).startswith('fredtalk:') for row in library) else [])
    units = source_segments(text)
    for i, unit in enumerate(units):
        before = units[i - 1]['quote'] if i else ''
        after = units[i + 1]['quote'] if i + 1 < len(units) else ''
        unit.update(context_before=before, context_after=after)
        cues = relation_cues(unit['quote'])
        # Follow anaphora and continuing operations without treating every
        # adjacent sentence as the same event. Inheritance stays explicit.
        continuing = re.search(r'^(?:它|这时|这个|这些|这样|随后|然后|接着|因此|所以|于是|只|再|继续|同时)|两边|两处|它们', unit['quote'])
        if continuing:
            for tag, cue in relation_cues(before).items():
                inherited = cue['strength'] * .5
                if inherited > cues.get(tag, {}).get('strength', 0):
                    cues[tag] = dict(cue, strength=inherited, inherited_from_previous=True,
                                     inherited_quote=before, needs_context_confirmation=True)
        unit['cues'] = cues
        for name, kind, rows, tags in groups:
            selected = _rank(rows, tags, rankers[name], unit['quote'], before + '\n' + after,
                             cues, limit if kind == 'method' else min(limit, 3))
            unit[name] = [dict(_candidate(row, kind, root, facts, alignments), retrieval=why) for row, why in selected]
        # These indexes use their own positive descriptions, not author identity,
        # historical approval or generic family tags as ranking advantages.
        # A short reference title must not win on "AI"/"UI" alone. Apply this
        # gate before truncating library results; the existing method rankings
        # and genuinely descriptive matches remain unchanged.
        specific_terms = terms(unit['quote']).keys() - LIBRARY_GENERIC_TERMS
        library_eligible = [row for row in library_positive
                            if specific_terms & library_ranker.terms[row['id']].keys()]
        library_matches = _rank(library_eligible, {}, library_ranker, unit['quote'],
                                before + '\n' + after, cues, limit)
        unit['library_candidates'] = [dict(_library_candidate(row, root, facts, alignments), retrieval=why)
                                      for row, why in library_matches]
        # Historical whole-film records stay inspectable but cannot select this production.
        unit['approved_examples'] = []
        unit['decision'] = {'status': 'pending-agent', 'allowed_outcomes': ['adapt', 'original', 'none'],
                            'instruction': '结合完整原稿判断理解缺口并读取候选出处；记录采用/不采用理由及实际素材、动作、实现和成片时间。可合并连续原句。无适合参考时原创，人物已讲清时保留口播；不得照抄候选作为已完成计划。'}
    return {'schema_version': 1, 'generated_by': OWNER,
            'source': {k: source[k] for k in ('path', 'sha256', 'text') if k in source},
            'whole_film_recommendations': False,
            'library_directory': directory,
            'library_guidance': library_guidance,
            'narration_study': {
                'scope': '整篇稿的句意与上下文构思；候选不是分镜，不要求逐句引用。',
                'source_text': text,
                'methods': [dict(_candidate(row, 'method', root, facts, alignments), retrieval=why)
                            for row, why in _rank([row for row in methods if row['id'].startswith('Q-')],
                                METHOD_TAGS, rankers['methods'], text, '', relation_cues(text), limit)],
                'decision_status': 'pending-agent',
                'instruction': '先通读整篇稿，用下方秋芝四片研究中的原句、上下文、材料与动作对应关系构思本期事件；适用才采用，不以链接或引用数代替设计。'},
            'catalog_counts': {'methods': len(methods), 'positive_methods': sum(not source_study.explicitly_negative(r) for r in methods),
                               'recipes': len(recipes), 'capabilities': len(capabilities), 'semantic_routes': len(catalog['semantic_routes']),
                               'applicable_approved_examples': 0,
                               'fredtalk_active_source_records': sum(str(row['id']).startswith('fredtalk:') for row in library),
                               'library_indexes': {key: len(catalog.get(key, [])) for key in LIBRARY_INDEXES.values()}},
            'catalog_count_boundary': '方法、配方和能力记录是检索规模，不是已认可作品数量；样片动作可检索，旧故事、身份和整片外观不自动继承。',
            'segments': units,
            'counterexamples': [{'id': r['id'], 'title': r['title'], 'usage': 'avoid',
                                 'inspect_command': f"ui.py inspect --kind method --id {r['id']}"}
                                for r in methods if source_study.explicitly_negative(r)],
            'retrieval_limits': ['离线关系线索和中文文本相似检索，不是完整语义理解或自动分镜。',
                                 '原句分段只用于检索定位，不要求一句一镜或每句特效。',
                                 '候选排序不是质量评分；Agent必须读适用/不适用条件和逐句出处后决策。',
                                 '路径存在只证明当前可定位，未运行源码、生成、上传或播放媒体。',
                                 'Fred Talk 为默认整体风格，效果库提供实现，研究方法参与句意构思；旧整片故事和账号标签不覆盖默认，人物例图不是固定IP。'],
            'plan_authored': False, 'generation_submitted': False}


def inspect(kind, ident, root=ROOT):
    root = Path(root).resolve()
    if kind == 'component':
        row = next((row for row in component_records(root) if row['id'] == ident), None)
        if row is None:
            raise ValueError('Unknown exported component ID: ' + ident)
        return {'record': row, 'current_resources': _library_candidate(row, root, {}, {}),
                'scope': '实际 API 导出名及源码，不运行组件或认可本期设计。'}
    if kind == 'software-preset' and str(ident).startswith('fredtalk:'):
        import fredtalk_library
        inspected = fredtalk_library.inspect(root, ident)
        return {**inspected, 'current_resources': _library_candidate(inspected['record'], root, {}, {}),
                'scope': '公开源码及闭包按哈希核查；未安装依赖、运行、渲染或认定用户认可。'}
    if kind == 'reference':
        from resource_inventory import inspect_reference
        return inspect_reference(ident, root=root)
    methods, recipes, catalog = _catalogs(root)
    if kind in LIBRARY_INDEXES:
        row = next((r for r in catalog.get(LIBRARY_INDEXES[kind], []) if r['id'] == ident), None)
        if row is None:
            raise ValueError(f'Unknown {kind} ID: {ident}')
        result = {'record': row, 'current_resources': _library_candidate(dict(row, library_kind=kind), root, {}, {}),
                  'scope': '注册记录与当前路径核查；未运行、生成、播放或批准。'}
        if kind == 'family' and ident == 'adu-mechanisms':
            result['scene_library'] = scene_directory(root)
        return result
    rows = {'method': methods, 'recipe': recipes, 'capability': catalog['capabilities'], 'family': catalog['families']}[kind]
    row = next((r for r in rows if r['id'] == ident), None)
    if row is None:
        raise ValueError(f'Unknown {kind} ID: {ident}')
    facts = {r['id']: r for r in source_study.source_facts(root)}
    return {'record': row, 'current_resources': _candidate(row, kind, root, facts, {}),
            'scope': '注册记录与当前路径核查；未运行、生成、播放或批准。'}


def _brief_value(value):
    if isinstance(value, str):
        return ' '.join(value.split())
    return json.dumps(value, ensure_ascii=False, separators=(',', ':'))


def _candidate_status(row):
    """Label only the recorded implementation status; never infer readiness."""
    status = (row.get('implementation') or {}).get('status')
    labels = {
        'source_observed_recipe': '来源研究',
        'observed_method_with_reusable_primitives_and_project_customization': '原语可复用，整段需定制',
        'shared-component-implemented': '共享组件已有实现，本期仍需接入',
        'prompt-template-ready-not-generated': '提示模板已有，尚未生成',
        'analysis-only': '仅研究分析',
        'source-present': '源码已有，未证明本期效果',
    }
    return labels.get(status, '状态未标注' if not status else '目录状态：' + _brief_value(status) + '，成熟度未判定')


def _implementation_brief(row):
    """Expose retained catalog boundaries once per candidate, not once per sentence."""
    data = row.get('implementation') or {}
    lines = [f"### {row['kind']} {row['id']} · {row['title']}", '']
    scope = data.get('scope') or data.get('note') or '目录未记录完整实现范围；读取源码后判断本期仍需实现的工作。'
    lines.append('- 实现边界：' + _brief_value(scope))
    if data.get('status'):
        lines.append('- 实现记录：' + _brief_value(data['status']))
    entries = ([data['path']] if data.get('path') else []) + (data.get('entrypoints') or [])
    entries += [source['path'] for source in data.get('sources') or []
                if isinstance(source, dict) and source.get('path')]
    primitives = [p for p in data.get('primitives') or [] if isinstance(p, dict)]
    entries += [p['path'] for p in primitives if p.get('path')]
    if entries:
        lines.append('- 源码/API入口：' + '；'.join('`' + path + '`' for path in dict.fromkeys(entries)))
    names = ([data['effect']] if data.get('effect') else []) + [p['name'] for p in primitives if p.get('name')]
    if names:
        lines.append('- 已有原语：' + '、'.join('`' + name + '`' for name in dict.fromkeys(names)))
    customization = data.get('customization_required') or []
    if customization:
        lines.append('- 本期仍需实现：' + (customization if isinstance(customization, str)
                     else '；'.join(_brief_value(item) for item in customization)))
    boundaries = []
    for key in ('validation', 'component_validation', 'status', 'user_approval'):
        value = row.get(key)
        if isinstance(value, dict):
            # File lists remain in JSON; retain the actual scope and false/unknown
            # flags rather than treating a linked historical record as a pass.
            value = {k: v for k, v in value.items() if k not in ('evidence', 'record')}
        if value:
            boundaries.append(key + '=' + _brief_value(value))
    lines.append('- 验证边界：' + ('；'.join(boundaries) if boundaries else '目录未记录验证结论。'))
    if row.get('reuse_scope'):
        lines.append('- 复用范围：' + row['reuse_scope'])
    if row.get('scene_builder'):
        builder = row['scene_builder']
        lines.append('- 完整场景入口：`' + builder['commands']['list'] + '`；' + builder['scope'])
        lines.append('- 构建调用：`' + builder['commands']['build'] + '`；调用前先 inspect，在同一导演计划绑定本期场景。')
    if row.get('materialize_command'):
        lines.append('- 采用源码：`' + row['materialize_command'] + '`；保留来源回执，再由本期入口真实调用。')
        lines.append('- 依赖与媒体：' + _brief_value(row.get('reuse_requirements', {})))
    if row.get('resource_resolution') == 'deferred-to-reference-inspect':
        lines.append('- 本机资源：尚未解析，历史目录路径不代表当前可用；按完整条目入口查询。')
    elif row.get('kind') == 'sample':
        lines.append('- 样片路径：' + ('实现路径当前存在，未运行或播放。' if row.get('implementation_paths_present')
                                     else '存在缺失或占位，不能当作可用成片。'))
        lines.append('- 认可范围：' + row.get('approval_scope', '仅保留目录所记范围。'))
    lines += ['- 完整条目：`' + row.get('inspect_command', f"ui.py inspect --kind {row['kind']} --id {row['id']}") + '`', '']
    return lines


def _study_brief(row):
    lines = [f"- {row['id']} {row['title']}：{row.get('fit', '')}"]
    for example in row.get('examples', []):
        speech = ' / '.join(item.get('text', '') for item in example.get('source_rows', []))
        if speech:
            lines.append(f"  来源原句（{example.get('video')} {example.get('start')}–{example.get('end')}）：{speech}")
        for key, label in (('context_before', '前文'), ('context_after', '后文')):
            if example.get(key):
                lines.append(f"  {label}：{example[key].get('text', '')}")
        for shot in example.get('visual_evidence', []):
            observed = '；'.join(str(shot[key]) for key in ('material', 'visible_action', 'editing') if shot.get(key))
            if observed:
                lines.append(f"  画面 {shot.get('id')}（{shot.get('start')}–{shot.get('end')}）：{observed}")
        lines.append('  原片与画面证据见 JSON；以上为既有研究记录，本轮未据此认定已看片或设计通过。')
    return lines + ['']


def render_selection_brief(context):
    lines = ['## 按口播检索的候选（待 Agent 决策）', '',
             '这不是分镜。先看完整上下文，再按适用条件取舍；可以连续复用同一场景、原创或保留人物口播。',
             '效果库参与整体构图、材料层次、窗口组织和动作设计；动作库保持开放，某条外观不喜欢不等于禁用动作。历史故事、身份和配色不自动继承。', '']
    for guidance in context.get('library_guidance', []):
        lines += [f"补充库采用方法：`{guidance['path']}`（{'当前存在' if guidance['exists'] else '文件缺失'}）。{guidance['scope']}", '']
    unique_candidates = {}
    study = context.get('narration_study') or {}
    if study.get('methods'):
        lines += ['### 整篇口播与秋芝逐句研究', '', study['instruction'], '']
        for row in study['methods']:
            lines += _study_brief(row)
            unique_candidates.setdefault((row['kind'], row['id']), row)
    for unit in context['segments']:
        lines += [f"### {unit['id']} · {unit['quote']}", '',
                  f"原文位置：{unit['span']['start']}–{unit['span']['end']}。"]
        for name, label in (('methods', '来源方法'), ('recipes', '配方'), ('capabilities', '效果实现'),
                            ('library_candidates', '构图、材料与窗口设计库')):
            rows = unit.get(name) or []
            ids = '；'.join(f"{row['id']} {row['title']}（{_candidate_status(row)}）" for row in rows)
            lines.append(f'- {label}候选：{ids or "未命中，不硬套；由Agent按句意创作。"}')
            for row in rows:
                unique_candidates.setdefault((row['kind'], row['id']), row)
                if row['kind'] == 'method':
                    lines += _study_brief(row)
        lines += ['- 决策待完成：为什么选/不选 → 素材及动作 → 实现文件 → 成片时间段。', '']
    if unique_candidates:
        lines += ['## 候选实现与验证边界（按候选去重）', '',
                  '下面只展开本稿命中的候选；入口存在不证明已经使用、完成渲染或获认可。先按句意取舍，再补齐选中方法的本期实现，不按成熟度代替内容判断。', '']
        for row in unique_candidates.values():
            lines.extend(_implementation_brief(row))
    lines += ['逐句出处、适用边界、负例与完整验证记录详见 JSON；使用各候选的 inspect 命令读取完整项（method / recipe / capability / sample / family / software-preset / reference）。', '']
    return '\n'.join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    select = sub.add_parser('select', help='Retrieve candidates for narration; leaves every creative decision pending.')
    inputs = select.add_mutually_exclusive_group(required=True)
    inputs.add_argument('--script', type=Path)
    inputs.add_argument('--text')
    inputs.add_argument('--list-library', action='store_true', help='List every retained effect entry without narration ranking.')
    select.add_argument('--limit', type=int, default=4)
    select.add_argument('--project', type=Path, default=Path.cwd())
    select.add_argument('--profile')
    select.add_argument('--format', choices=('json', 'markdown'), default='json')
    child = sub.add_parser('inspect', help='Read an exact registered item and its current resource locations.')
    child.add_argument('--kind', choices=('method', 'recipe', 'capability', 'family', 'reference', 'sample', 'software-preset', 'component'), required=True)
    child.add_argument('--id', required=True)
    args = parser.parse_args(argv)
    try:
        if args.action == 'inspect':
            result = inspect(args.kind, args.id)
        elif args.list_library:
            result = library_directory()
            if args.format == 'markdown':
                print(render_library_directory(result))
                for item in result['entries']:
                    print(f"- {item['kind']} · {item['id']} · {item['title_zh'] or item['title']} · `{item['inspect_command']}`")
                return 0
        else:
            raw = args.script.read_bytes() if args.script else args.text.encode('utf-8')
            source = {'path': str(args.script.resolve()) if args.script else '<inline-text>',
                      'sha256': hashlib.sha256(raw).hexdigest(), 'text': raw.decode('utf-8-sig')}
            import style_registry
            resolved = style_registry.resolve(args.project, args.profile, root=ROOT)
            result = build_selection_context(ROOT, source, args.limit, resolved)
            if args.format == 'markdown':
                print(render_selection_brief(result))
                return 0
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, KeyError) as exc:
        parser.error(str(exc))


if __name__ == '__main__':
    sys.exit(main())
