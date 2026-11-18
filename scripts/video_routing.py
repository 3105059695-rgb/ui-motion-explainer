"""Find source-specific editing choices for actual narration. Offline, standard library only."""
from __future__ import annotations

import argparse
from collections import defaultdict
import json
import math
from pathlib import Path
import re

import selection
import video_sources as vs

ROOT = vs.ROOT
# Shared catalog labels identify a collection, not a meaningful editing trigger.
GENERIC = {'ui', 'ai', 'aigc', '上游', '本期', '本期场景', '动态图形', '创意开场', '动态设计', '短片节奏',
           '动态', '作品', '展示', '画面', '视频', '产品', '动画', '素材', '软件', '模型', '按钮', '卡片',
           '窗口', '文字', '工具', '用户', '操作', '结果', '发送', '请求', 'collect ui', 'motion', 'interaction'}


def _words(text):
    return set(selection.terms(text)) - GENERIC


def _trigger(cue):
    word = selection.normalized(cue).strip()
    return len(word) >= 2 and word not in GENERIC and not re.fullmatch(r'(第?\d+期|[a-z]\d+[a-z]?)', word)


def _inspect_command(cap):
    return 'ui.py capabilities inspect --id ' + cap


def _summary(row):
    return {key: row[key] for key in ('id', 'title', 'status', 'collections', 'scope')}


def _evidence(row, use):
    examples = use.get('examples', [])
    evidence = {'path': row['evidence'], 'source_id': row['id']}
    if examples:
        example = examples[0]
        evidence.update(example)
        if example.get('row_ids'):
            evidence['read'] = 'ui.py study -- example --video ' + row['id'] + ' --row ' + example['row_ids'][0]
    elif use.get('source_cue'):
        evidence['source_cue'] = use['source_cue']
    elif use.get('reconstruction_cue'):
        evidence.update(reconstruction_cue=use['reconstruction_cue'], path=row['reconstruction']['path'])
    elif row.get('atlas', {}).get('approved_ranges'):
        evidence['approved_ranges'] = row['atlas']['approved_ranges']
    return evidence


class Router:
    def __init__(self, catalog):
        self.catalog = catalog
        self.docs = []
        self.postings = defaultdict(list)
        for row in catalog.by_id.values():
            if row['status'] not in ('available', 'archived'):
                continue
            for use in row['uses']:
                cues = list(dict.fromkeys(selection.normalized(c).strip() for c in use['cues'] if _trigger(c)))
                terms = _words(' '.join([row['title'], use['action'], *cues]))
                index = len(self.docs)
                for term in terms:
                    self.postings[term].append(index)
                self.docs.append((row, use, cues, terms))
        total = len(self.docs)
        self.idf = {w: math.log1p(total / len(indices)) for w, indices in self.postings.items()}

    def match(self, quote, *, source=None, preferred=None, previous=None, limit=3, allowed=None):
        query = selection.normalized(quote)
        query = re.sub(r'(?:不需要|不想|并非|不用|不要|无需|不必|不做)[^，,。；;！？!?]*?(?=而是|改为|但|，|,|。|；|;|！|!|？|\?|$)', ' ', query)
        words = _words(query)
        selected = self.catalog.lookup(source)['id'] if source else None
        candidates = {}
        indices = {i for word in words for i in self.postings.get(word, ())}
        for index in sorted(indices):
            row, use, cues, terms = self.docs[index]
            ident = row['id']
            if allowed is not None and ident not in allowed:
                continue
            if (selected and ident != selected) or (row['status'] == 'archived' and not row.get('restored') and not selected):
                continue
            hits = selection.positive_hits(query, cues)
            overlap = sorted(words & terms, key=lambda s: (-self.idf[s], s))
            rare = [w for w in overlap if self.idf[w] >= 3.4 and selection.positive_hits(query, [w])]
            # A single common word must not turn a sentence into a shot decision.
            authored = 'focus' in row['collections'] and hits and use['role'] != '来源方法'
            if not hits and (len(rare) < 4 or sum(self.idf[w] for w in rare[:4]) < 16):
                continue
            # IDF overlap is capped so long catalogue descriptions cannot beat a precise trigger.
            score = sum(self.idf[w] for w in rare[:5]) * .19 + sum(min(len(h), 7) * .8 for h in hits[:3])
            if authored:
                score += 5
            if preferred == ident:
                score += 4
            if ident == previous:
                score -= .4
            if ident not in candidates or score > candidates[ident][0]:
                candidates[ident] = (score, row, use, hits or rare[:3], bool(hits))
        ranked = sorted(candidates.values(), key=lambda x: (-x[0], x[1]['id']))
        picks = []
        for score, row, use, hits, exact in ranked[:limit]:
            picks.append({'source_id': row['id'], 'source_title': row['title'], 'role': use['role'],
                          'matched': hits, 'match_basis': 'phrase' if exact else 'text-overlap',
                          'action': use['action'], 'bind': use['bind'], 'scope': row['scope'],
                          'capability': use['capability'], 'inspect': _inspect_command(use['capability']),
                          'apply': f"ui.py videos use --id {row['id']} --capability {use['capability']}",
                          'evidence': _evidence(row, use)})
        return picks

    def combination(self, unit, preferred):
        # Require independent, positively identified actions on distinct clauses.
        # Never fabricate an edit clock from character counts.
        steps = []
        for clause in re.finditer(r'[^，,；;。！？!?]+', unit['quote']):
            phrase = clause.group().strip()
            if len(phrase) < 5:
                continue
            picks = self.match(phrase, preferred=preferred, limit=1)
            if not picks:
                continue
            pick = picks[0]
            if (pick['match_basis'] != 'phrase' or
                    not any(len(hit) >= 4 or (len(hit) >= 2 and 'focus' in self.catalog.lookup(pick['source_id'])['collections'])
                            for hit in pick['matched'])):
                continue
            start = unit['span']['start'] + clause.start() + len(clause.group()) - len(clause.group().lstrip())
            steps.append({'quote': phrase, 'span': {'start': start, 'end': start + len(phrase)}, **pick})
        if len({s['source_id'] for s in steps}) < 2:
            return []
        return steps

    def plan(self, text, preferred=None):
        units = selection.source_segments(text)
        output, previous = [], None
        best = {}
        for unit in units:
            matches = self.match(unit['quote'], preferred=preferred, previous=previous, limit=None)
            for match in matches:
                key = match['source_id']
                weight = (match['match_basis'] == 'phrase', len(match['matched']), sum(map(len, match['matched'])))
                if key not in best or weight > best[key][0]:
                    best[key] = (weight, {'unit': unit['id'], 'capability': match['capability']})
            picks = matches[:3]
            primary = picks[0] if picks else None
            if primary:
                previous = primary['source_id']
            output.append({**unit, 'primary': primary, 'alternatives': picks[1:],
                           'combination': self.combination(unit, preferred) if re.search(r'[，,；;]', unit['quote']) else [],
                           'decision': 'review-fit' if primary else 'use-current-material-or-presenter'})
        import reference_edits
        full = reference_edits.assignments(self, units)
        inventory = {row['id']: {'status': row['status'], 'collections': row['collections'],
                                 'capabilities': [use['capability'] for use in row['uses']],
                                 'evidence': row['evidence'], 'match': best.get(row['id'], (None, None))[1]}
                     for row in self.catalog.by_id.values()}
        return {'catalog': self.catalog.summary(), 'inventory': inventory, 'units': output, 'preferred_reference': preferred,
                'all_submitted': full,
                'sources_used_in_output': [], 'decision_status': 'proposed',
                'inspect_source': 'ui.py videos inspect --id <来源ID>',
                'instruction': '用全部投稿表分配剪法，按目录里的分工从整库为每段选择界面、镜头和动作。'
                               '本句建议供定位；可以按目录 ID 直接调用独立实现。以导出的实际时段核对采用情况。'}


def brief(plan):
    if 'error' in plan:
        return '视频用法目录读取失败：' + plan['error']
    lines = ['## 本稿各段可以借哪条视频', '']
    for row in plan['units']:
        pick = row['primary']
        lines.append(f"**{row['id']}**　{row['quote']}")
        if pick:
            lines.extend([f"- {pick['source_title']}（{pick['role']}）　{pick['action']}",
                          '- 本期绑定　' + pick['bind'], '- 调用　' + pick['apply']])
            for alternative in row['alternatives']:
                lines.append('- 备选　' + alternative['source_title'] + ' · ' + alternative['action'])
            if row['combination']:
                lines.append('- 分句可顺接　' + ' → '.join('「' + step['quote'] + '」借' + step['source_title']
                             for step in row['combination']))
        else:
            lines.append('- 未找到足够具体的线索。保留人物或查找能直接说明这句的实拍材料。')
        lines.append('')
    coverage = plan.get('all_submitted', {})
    if coverage:
        lines.extend(['## 全部提交参考在本期的分工', '',
                      '把每项职责落实到本期时间线。逐句匹配仅用于找适合的位置。', ''])
        for source in coverage['required']:
            placement = source.get('suggested_unit') or '由导演按剪法选择原声位置'
            lines.append(f"- {source['title']} · {placement} · {source['contribution']}")
        lines.extend(['', '历史纠错参考', ''])
        lines.extend(f"- {row['title']} · {row['use']}" for row in coverage['diagnostic'])
        lines.extend(['', '用 videos plan 建完整用片表，填入本期素材和原声位置后用 videos compose 与 videos render 生成时间线并核对实际入片帧。'])
    return '\n'.join(lines)


def inspect_source(catalog, ident):
    row = catalog.lookup(ident)
    result = {**row, 'uses': [{**use, 'inspect': _inspect_command(use['capability']),
                               'evidence_locator': _evidence(row, use)} for use in row['uses']]}
    if row.get('media'):
        result['original'] = {'path': row['media'], 'available': (catalog.root / row['media']).is_file()}
    elif row.get('atlas'):
        from resource_inventory import resource_fact
        entry = row['atlas']
        result['original'] = resource_fact(entry['source_resource_id'], entry.get('source_path'), root=catalog.root)
    if 'focus' in row['collections'] and row['status']=='available':
        import reference_edits
        recipe = reference_edits.rules(catalog)[0][row['id']]
        result['portable_edit'] = {'slots':recipe['slots'], 'layers':recipe['layers'],
                                   'motion':'ui.py videos motion --id '+row['id']}
    return result


def main(argv=None):
    import sys
    argv = list(sys.argv[1:] if argv is None else argv)
    if argv[:1] and argv[0] in ('plan','compose','render','motion'):
        import reference_edits
        return reference_edits.main(argv)
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    commands.add_parser('summary')
    commands.add_parser('check')
    for cmd, desc in [('plan','为全部提交片子建立本期分工表'),('compose','用本期材料执行这些剪法'),
                      ('render','输出实际逐帧视频与来源时段'),('motion','查询原视频连续运动测量')]:
        commands.add_parser(cmd,help=desc)
    listing = commands.add_parser('list')
    listing.add_argument('--collection', choices=('focus', 'prompt-motion', 'fredtalk', 'collect-ui', 'discovery', 'all'),
                         default='all')
    listing.add_argument('--query', default='')
    listing.add_argument('--page', type=int, default=1)
    show = commands.add_parser('inspect')
    show.add_argument('--id', required=True)
    match = commands.add_parser('match')
    match.add_argument('--query', required=True)
    match.add_argument('--source', help='Restrict candidates to this exact source or alias.')
    use = commands.add_parser('use', help='Resolve the production adapter and optionally create its editable binding file.')
    use.add_argument('--id', required=True)
    use.add_argument('--capability', required=True)
    use.add_argument('--out', type=Path)
    args = parser.parse_args(argv)
    try:
        catalog = vs.Catalog()
        if args.command == 'summary':
            result = catalog.summary()
        elif args.command == 'list':
            rows = catalog.rows(None if args.collection == 'all' else args.collection)
            q = selection.normalized(args.query)
            if q:
                rows = [r for r in rows if q in selection.normalized(' '.join([r['id'], r['title'], *r['aliases'],
                    *(word for use in r['uses'] for word in use['cues'])]))]
            pages = max(1, math.ceil(len(rows) / 40))
            if not 1 <= args.page <= pages:
                raise ValueError(f'page must be between 1 and {pages}')
            start = 40 * (args.page - 1)
            result = {'total': len(rows), 'page': args.page, 'pages': pages,
                      'sources': [_summary(r) for r in rows[start:start + 40]]}
        elif args.command == 'inspect':
            result = inspect_source(catalog, args.id)
        elif args.command == 'use':
            import video_binding
            result = video_binding.select(catalog, args.id, args.capability, args.out)
        elif args.command == 'match':
            if not args.query.strip():
                raise ValueError('Provide narration to match.')
            result = {'quote': args.query, 'candidates': Router(catalog).match(args.query, source=args.source),
                      'decision_status': 'proposed'}
        else:
            import capability_catalog
            result = vs.check(catalog, capability_catalog.records(catalog.root))
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0 if result.get('ok', True) else 1
    except (OSError, KeyError, ValueError) as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    raise SystemExit(main())
