"""Complete current knowledge, then lossless selected-source reading.

No read receipt is treated as comprehension, viewing or aesthetic approval.
The catalog stream covers every canonical entry, including archived aliases.
It excludes old proof logs, not capabilities. Source text is never summarized.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import sys

import capability_catalog
import reference_overviews
import requirements

ROOT = Path(__file__).resolve().parents[1]
PAGE_CHARACTERS = 6000


def _pages(text, size=PAGE_CHARACTERS):
    return [text[i:i + size] for i in range(0, len(text), size)] or ['']


def _catalog_text(rows):
    # Every ID remains in the stream. Runtime proofs/old logs are not current
    # capability definitions; parameters and complete code follow selection.
    styles, approvals = {}, {}
    for row in rows:
        style = str(row.get('style_scope', '未登记'))
        approval = str(row.get('user_approval', {}).get('scope', '未登记；不自动视为认可'))
        styles.setdefault(style, f'S{len(styles) + 1}')
        approvals.setdefault(approval, f'A{len(approvals) + 1}')
    lines = ['全库能力目录：逐条读取，分类与别名不相加为独立效果。',
             '归档来源仍保留；是否可以执行、采用什么外观与是否获认可分别判断。',
             '下面的认可记录保留历史范围，不能覆盖现行要求；女孩样片用于 AIGC 画风与衔接，其旧 UI 不作为当前正文基准。',
             '每条详情：ui.py capabilities inspect --id <ID>；选中后读取其完整源码。',
             '重复外观/认可说明在下表完整列一次，各条用编号引用，能力条目和表达用途没有删减。', '',
             *[f'{code} 外观：{value}' for value, code in styles.items()], '',
             *[f'{code} 认可：{value}' for value, code in approvals.items()], '']
    for row in rows:
        lines += [f"[{row['id']}] {row['title']}",
                  f"类型={row['kind']}；执行={row['execution_state']}；来源归档={row['archived']}",
                  'UI 接线：' + row.get('ui_adaptation', {}).get('status', '未登记'),
                  '表达用途：' + str(row.get('semantic_use', '')).strip(),
                  '关系：' + ', '.join(row.get('relations', [])),
                  '外观/认可：' + styles[str(row.get('style_scope', '未登记'))] + ' / '
                  + approvals[str(row.get('user_approval', {}).get('scope', '未登记；不自动视为认可'))], '']
    return '\n'.join(lines)


def catalog(root=ROOT):
    rows = capability_catalog.records(root)
    text = _catalog_text(rows)
    return {'entry_count': len(rows), 'ids': [r['id'] for r in rows],
            'parts': _pages(text), 'sha256': hashlib.sha256(text.encode('utf-8')).hexdigest()}


def reference_text(root=ROOT):
    report = reference_overviews.load(root)
    lines = [reference_overviews.render_brief(report), '',
             '以下是完整查看队列；输出路径不是观看。打开所有可用总览；密集、看不清的总览继续打开细读页。',
             '这些是全片时间范围的采样图，不是逐帧或全速播放。选中动作另看完整连续预览。', '']
    for row in report['videos']:
        lines.append(f"[{row['id']}] {row['title']}")
        for page in row['pages']:
            lines.append(f"细读 {page.get('index', '')} [{page.get('start', '?')}, {page.get('end', '?')}] "
                         + (str(page['path']) if page['available'] else '缺失，不能声称已看'))
    return '\n'.join(lines)


def plan(root=ROOT, *, catalog_bundle=None, requirements_bundle=None):
    root = Path(root).resolve()
    req = requirements_bundle or requirements.load(root)
    cap = catalog_bundle or catalog(root)
    refs = reference_overviews.load(root)
    ref_parts = _pages(reference_text(root))
    prefix = f'python -B -X utf8 "{root / "scripts/ui.py"}" read'
    return {'schema_version': 1, 'scope': 'current-requirements-complete-catalog-all-approved-references-selected-full-source',
            'requirements': {'document_count': req['document_count'], 'part_count': req['part_count'],
                             'bundle_sha256': req['bundle_sha256'],
                             'first_command': f'{prefix} requirements --part 1'},
            'catalog': {'entry_count': cap['entry_count'], 'part_count': len(cap['parts']),
                        'sha256': cap['sha256'], 'first_command': f'{prefix} catalog --part 1',
                        'truncated': False, 'includes_archived_entries': True},
            'references': {'reference_count': refs['video_count'],
                           'available_overviews': refs['available_overview_count'],
                           'part_count': len(ref_parts), 'first_command': f'{prefix} references --part 1',
                           'warnings': refs['warnings'], 'viewing_status': 'not-observed'},
            'selected_source': {'inspect_command': f'{prefix} selected --id <能力ID>',
                                'read_command': f'{prefix} source --path <Skill内源码路径> --part 1'},
            'instruction': '每个新窗口完整读现行要求全部分页、全库目录全部分页，并实际打开全部认可参考总览与必要细图；'
                           '选中能力后检查参数及源码清单，逐文件完整读取实际实现与本地依赖，再按本稿调用。'
                           '不是每次研究全部历史源码，也不是只读几个检索候选。上下文不足时保存真实完成位置继续，不能略读后宣称完成。',
            'assessment': {'reading': 'not-assessed', 'understanding': 'not-assessed',
                           'viewing': 'not-observed', 'aesthetic_approval': 'not-assessed'}}


def source(path, root=ROOT):
    root = Path(root).resolve()
    file, relative = requirements._local_path(root, path, 'Selected source')
    raw = requirements._read_bytes(file, 'Selected source')
    try:
        text = raw.decode('utf-8')
    except UnicodeDecodeError as exc:
        raise ValueError('Binary resource: open it with an image/video/audio viewer, not the source reader.') from exc
    return {'path': relative, 'sha256': hashlib.sha256(raw).hexdigest(),
            'characters': len(text), 'parts': _pages(text), 'encoding': 'utf-8',
            'newline_policy': 'preserved', 'reading_status': 'not-assessed'}


def selected(ident, root=ROOT):
    detail = capability_catalog.inspect(ident, root)
    implementation = None
    if str(detail.get('call', {}).get('inspect', '')).startswith('ui.py library inspect'):
        import library_runner
        library_id = detail['call']['inspect'].split('--id ', 1)[1].strip()
        implementation = library_runner.inspect(library_id, root)
    return {'capability': detail, 'implementation': implementation,
            'source_files': detail.get('source_files', []),
            'instruction': '完整读取 source_files；目录逐个展开。按 capability.call.inspect 检查实际生产实现的完整文件闭包、'
                           '素材槽和共享适配器；source_files 中的桥接文件不代表原时间线已读。'
                           '逐文件使用 ui.py read source --path <相对路径> --part 1 读到末页，继续读取其本地导入依赖。'
                           '原始实现与生产适配代码都要读，生成后的 ui-style-report.json 说明实际应用了什么。',
            'reading_status': 'not-assessed'}


def render_page(parts, number, command, label, digest=None):
    if type(number) is not int or number < 1 or number > len(parts):
        raise ValueError(f'part must be between 1 and {len(parts)}')
    header = f'{label} {number}/{len(parts)}'
    if digest:
        header += '\nSHA-256: ' + digest
    end = (f'下一页：{command} --part {number + 1}' if number < len(parts) else
           '已到末页；只有按顺序读过全部前页才覆盖全文。命令输出不证明理解或审美认可。')
    return header + '\n--- 正文开始 ---\n' + parts[number - 1] + '\n--- 正文结束 ---\n' + end + '\n'


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('section', choices=('plan', 'requirements', 'catalog', 'references', 'selected', 'source'), nargs='?', default='plan')
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--part', type=int, default=1)
    parser.add_argument('--id')
    parser.add_argument('--path')
    args = parser.parse_args(argv)
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(newline='')
    try:
        prefix = f'python -B -X utf8 "{args.root.resolve() / "scripts/ui.py"}" read {args.section}'
        if args.section == 'plan':
            print(json.dumps(plan(args.root), ensure_ascii=False, indent=2))
        elif args.section == 'requirements':
            print(requirements.render_part(requirements.load(args.root), args.part), end='')
        elif args.section == 'catalog':
            data = catalog(args.root)
            print(render_page(data['parts'], args.part, prefix, f"全库目录（{data['entry_count']}条，含分类与别名）", data['sha256']), end='')
        elif args.section == 'references':
            print(render_page(_pages(reference_text(args.root)), args.part, prefix, '全部认可参考查看队列'), end='')
        elif args.section == 'selected':
            if not args.id:
                raise ValueError('selected requires --id')
            print(json.dumps(selected(args.id, args.root), ensure_ascii=False, indent=2))
        else:
            if not args.path:
                raise ValueError('source requires --path')
            data = source(args.path, args.root)
            print(render_page(data['parts'], args.part, prefix + ' --path ' + json.dumps(args.path, ensure_ascii=False),
                              '完整源码 ' + data['path'], data['sha256']), end='')
        return 0
    except (ValueError, OSError, KeyError) as exc:
        parser.exit(2, str(exc) + '\n')


if __name__ == '__main__':
    raise SystemExit(main())
