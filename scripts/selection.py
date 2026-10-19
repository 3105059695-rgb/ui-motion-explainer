"""Offline, explainable narration-to-reference retrieval; never an authored edit plan.

Uses relation cues and weighted Chinese bigrams/words over positive descriptions.
Candidates are prompts for the production Agent to inspect, accept or reject.
It neither understands arbitrary narration nor executes text in source files.
"""
import argparse
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
            'use_when', 'state_chain')
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


def _implementation(record, kind, root):
    data = dict(record.get('implementation', {}))
    paths = []
    if data.get('path'):
        paths.append(data['path'])
    paths += data.get('entrypoints', [])
    paths += [s.get('path') for s in data.get('sources', []) if isinstance(s, dict) and s.get('path')]
    data['resources'] = [_file_fact(p, root, f"{kind}:{record['id']}:{p}") for p in dict.fromkeys(paths)]
    data['runtime_tested_this_run'] = False
    data['scope'] = data.get('scope', data.get('note', '源码存在不等于本段已实现、运行或获认可。'))
    return data


def _examples(record, source_facts, alignments, root):
    result = []
    for ex in record.get('source_examples', []):
        video = ex.get('video')
        facts = source_facts.get(video, {})
        if video not in alignments:
            try:
                alignments[video] = {row['id']: row for row in source_study.alignment_rows(source_study.alignment(video, root))}
            except (ValueError, OSError):
                alignments[video] = {}
        ids = ex.get('row_ids', [])
        result.append({k: ex[k] for k in ('video', 'start', 'end', 'row_ids', 'polarity', 'learning_scope') if k in ex})
        result[-1].update({'alignment': facts.get('alignment'),
                          'alignment_exists': facts.get('alignment_exists', False),
                          'original_media': facts.get('original_media'),
                          'row_preview': [{k: value for k, value in alignments[video][i].items()
                                           if k in ('id', 'start', 'end', 'text', 'status', 'shot_ids')}
                                          for i in ids[:1] if i in alignments[video]],
                          'read_command': f'ui.py study -- example --video {video} --row {ids[0]}' if ids else None})
    return result


def _candidate(record, kind, root, source_facts, alignments):
    common = {'id': record['id'], 'kind': kind, 'title': record['title'],
              'fit': record.get('semantic_use', record.get('use_when', '')),
              'avoid': record.get('avoid', record.get('avoid_when', [])),
              'implementation': _implementation(record, kind, root),
              'inspect_command': f"ui.py inspect --kind {kind} --id {record['id']}",
              'decision_status': 'pending-agent',
              'style_scope': '仅复用解释与动作机制；当前工程的UI/AIGC风格及角色归属优先，旧示例皮肤不继承。'}
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


def build_selection_context(root, source, limit=4):
    """Build per-span candidates. source={path,sha256,text}; does not mutate it."""
    root = Path(root).resolve()
    text = source.get('text')
    if not isinstance(text, str) or not text.strip():
        raise ValueError('Narration must contain nonempty text.')
    if not isinstance(limit, int) or not 1 <= limit <= 10:
        raise ValueError('Candidate limit must be between 1 and 10.')
    methods, recipes, catalog = _catalogs(root)
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
        unit['decision'] = {'status': 'pending-agent', 'allowed_outcomes': ['adapt', 'original', 'none'],
                            'instruction': '结合完整原稿判断理解缺口并读取候选出处；记录采用/不采用理由及实际素材、动作、实现和成片时间。可合并连续原句。无适合参考时原创，人物已讲清时保留口播；不得照抄候选作为已完成计划。'}
    return {'schema_version': 1, 'generated_by': OWNER,
            'source': {k: source[k] for k in ('path', 'sha256') if k in source},
            'catalog_counts': {'methods': len(methods), 'positive_methods': sum(not source_study.explicitly_negative(r) for r in methods),
                               'recipes': len(recipes), 'capabilities': len(capabilities), 'semantic_routes': len(catalog['semantic_routes'])},
            'segments': units,
            'counterexamples': [{'id': r['id'], 'title': r['title'], 'usage': 'avoid',
                                 'inspect_command': f"ui.py inspect --kind method --id {r['id']}"}
                                for r in methods if source_study.explicitly_negative(r)],
            'retrieval_limits': ['离线关系线索和中文文本相似检索，不是完整语义理解或自动分镜。',
                                 '原句分段只用于检索定位，不要求一句一镜或每句特效。',
                                 '候选排序不是质量评分；Agent必须读适用/不适用条件和逐句出处后决策。',
                                 '路径存在只证明当前可定位，未运行源码、生成、上传或播放媒体。',
                                 '参考原片和旧演示的外观不覆盖当前工程UI/AIGC风格；人物例图不是固定IP。'],
            'plan_authored': False, 'generation_submitted': False}


def inspect(kind, ident, root=ROOT):
    root = Path(root).resolve()
    if kind == 'reference':
        from resource_inventory import inspect_reference
        return inspect_reference(ident, root=root)
    methods, recipes, catalog = _catalogs(root)
    rows = {'method': methods, 'recipe': recipes, 'capability': catalog['capabilities'], 'family': catalog['families']}[kind]
    row = next((r for r in rows if r['id'] == ident), None)
    if row is None:
        raise ValueError(f'Unknown {kind} ID: {ident}')
    facts = {r['id']: r for r in source_study.source_facts(root)}
    return {'record': row, 'current_resources': _candidate(row, kind, root, facts, {}),
            'scope': '注册记录与当前路径核查；未运行、生成、播放或批准。'}


def render_selection_brief(context):
    lines = ['## 按口播检索的候选（待 Agent 决策）', '',
             '这不是分镜。先看完整上下文，再按适用条件取舍；可以连续复用同一场景、原创或保留人物口播。', '']
    for unit in context['segments']:
        lines += [f"### {unit['id']} · {unit['quote']}", '',
                  f"原文位置：{unit['span']['start']}–{unit['span']['end']}。"]
        for name, label in (('methods', '来源方法'), ('recipes', '配方'), ('capabilities', '效果实现')):
            ids = '；'.join(f"{row['id']} {row['title']}" for row in unit[name])
            lines.append(f'- {label}候选：{ids or "未命中，不硬套；由Agent按句意创作。"}')
        lines += ['- 决策待完成：为什么选/不选 → 素材及动作 → 实现文件 → 成片时间段。', '']
    lines += ['逐句出处、适用边界、负例与真实源码可用性详见 JSON；使用 `ui.py inspect --kind method|recipe|capability --id ID` 读取完整项。', '']
    return '\n'.join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    select = sub.add_parser('select', help='Retrieve candidates for narration; leaves every creative decision pending.')
    inputs = select.add_mutually_exclusive_group(required=True)
    inputs.add_argument('--script', type=Path)
    inputs.add_argument('--text')
    select.add_argument('--limit', type=int, default=4)
    select.add_argument('--format', choices=('json', 'markdown'), default='json')
    child = sub.add_parser('inspect', help='Read an exact registered item and its current resource locations.')
    child.add_argument('--kind', choices=('method', 'recipe', 'capability', 'family', 'reference'), required=True)
    child.add_argument('--id', required=True)
    args = parser.parse_args(argv)
    try:
        if args.action == 'inspect':
            result = inspect(args.kind, args.id)
        else:
            raw = args.script.read_bytes() if args.script else args.text.encode('utf-8')
            source = {'path': str(args.script.resolve()) if args.script else '<inline-text>',
                      'sha256': hashlib.sha256(raw).hexdigest(), 'text': raw.decode('utf-8-sig')}
            result = build_selection_context(ROOT, source, args.limit)
            if args.format == 'markdown':
                print(render_selection_brief(result))
                return 0
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (OSError, ValueError, KeyError) as exc:
        parser.error(str(exc))


if __name__ == '__main__':
    sys.exit(main())
