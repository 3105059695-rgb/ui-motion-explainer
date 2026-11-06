"""Join per-implementation UI adaptation evidence to the complete catalog.

Connection, technical rendering, visual review and user approval are separate.
Missing reports never become a successful default. Pure actions keep the
current host; content renderers retain their physical/media appearance.
"""
from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORTS = (
    'assets/rebuilt-library/ui-adaptation.json',
    'assets/semantic-motion/ui-adaptation.json',
    'assets/modules/director/ui-adaptation.json',
    'assets/adu-reference/ui-adaptation.json',
    'assets/library-runtime/current-ui/coverage.json',
)
CONNECTED_STATES = {
    'host-object-opt-in', 'original-scene-role-adapter', 'current-object-composition',
    'current-ui-runtime-verified', 'current-ui-connected', 'source-material-adapter-available',
    'fusion-generated-output-adapter', 'native-content-retained', 'content-renderer-preserved',
    'current-host-action', 'approved-original-runtime', 'aggregate', 'aigc-style-reference',
    'intentional-negative-reference', 'role-adapted-needs-visual-review',
}


def _load(path):
    return json.loads(path.read_text(encoding='utf-8-sig')) if path.is_file() else {}


def _index(root):
    result = {}
    for relative in REPORTS:
        data = _load(root / relative)
        shared_hashes = data.get('adapter_sha256', {})
        if not isinstance(shared_hashes, dict):
            # Older reports contain one descriptive digest without a path map.
            shared_hashes = {}
        rows = data.get('items', []) + data.get('effects', []) + data.get('methods', [])
        for row in rows:
            # Shared runtime dependencies are recorded once by large catalogs.
            # Keep per-entry overrides while detecting later adapter changes.
            row = dict(row)
            row['adapter_files'] = list(dict.fromkeys(data.get('adapter_files', []) + row.get('adapter_files', [])))
            row['adapter_sha256'] = {**shared_hashes, **row.get('adapter_sha256', {})}
            for ident in (row.get('id'), row.get('catalog_id'), row.get('canonical_id')):
                if ident:
                    result[ident] = {**row, 'evidence_file': relative}
    return result


def apply(rows, root=ROOT):
    root = Path(root).resolve()
    indexed = _index(root)
    hashes = {}
    for row in rows:
        ident, original = row['id'], row['original_id']
        keys = [ident, original]
        if row['kind'] == 'scene':
            keys.append('adu:' + original.removeprefix('adu:'))
        fact = next((indexed[k] for k in keys if k in indexed), None)
        if fact:
            fact = dict(fact)
            changed = []
            for file, expected in fact.get('adapter_sha256', {}).items():
                if file not in hashes:
                    p = (root / file).resolve()
                    hashes[file] = hashlib.sha256(p.read_bytes()).hexdigest() if p.is_relative_to(root) and p.is_file() else None
                if hashes[file] != expected:
                    changed.append(file)
            for file in fact.get('adapter_files', []):
                p = (root / file).resolve()
                if not p.is_relative_to(root) or not p.is_file():
                    changed.append(file)
            fact['status'] = fact.get('status') or fact.get('mode') or 'unclassified-report'
            if changed:
                fact.update(status='adapter-missing-or-changed', changed_files=sorted(set(changed)))
        elif row['kind'] in ('design', 'native'):
            fact = {'status': 'approved-original-runtime',
                    'scope': '认可正文的实际源码/事件运行库，按本期内容与参数使用。',
                    'adapter_files': [f['path'] for f in row['source_files'] if f.get('type') == 'file']}
        elif row.get('original_style_scope', row.get('style_scope')) == 'host-style':
            fact = {'status': 'current-host-action', 'scope': '纯动作作用于本期已有对象，不另造一套外观。'}
        elif row.get('is_aggregate') and row.get('adapter_kind') != 'generation-workflow':
            fact = {'status': 'aggregate', 'scope': '分类入口，检查各实际子条目。'}
        elif row.get('adapter_kind') == 'generation-workflow':
            fact = {'status': 'aigc-style-reference', 'scope': '生成按认可画风与本期内容设计；不固定旧图片或把内容紫化。'}
        elif original == 'Q-W08':
            fact = {'status': 'intentional-negative-reference', 'scope': '保留的反例，不作为正向可调用效果。'}
        else:
            fact = {'status': 'not-covered', 'scope': '尚无本轮实际 UI 接线记录；不能把有代码等同 UI 已适配。'}
        fact.setdefault('aesthetic_approval', 'not-inferred')
        fact.setdefault('full_realtime_av_review', False)
        row['ui_adaptation'] = fact
        source_files = fact.get('source_files', [])
        if not isinstance(source_files, list):
            source_files = []  # Some audit records store a source-file count.
        for source in source_files + fact.get('adapter_files', []) + ([fact['stylesheet']] if fact.get('stylesheet') else []):
            file = source.get('path') if isinstance(source, dict) else source
            if not isinstance(file, str):
                continue
            if file not in {f['path'] for f in row.get('source_files', [])}:
                p = (root / file).resolve()
                row.setdefault('source_files', []).append({'path': file, 'type': 'file',
                    'exists': p.is_relative_to(root) and p.is_file(), 'packaged': p.is_relative_to(root)})
        # Preserve the upstream description; current routing names the actual
        # adapter, not a promise that the next Agent will manually repaint it.
        if fact['status'] in CONNECTED_STATES:
            row.setdefault('original_style_scope', row.get('style_scope'))
            if fact['status'] not in ('aggregate', 'intentional-negative-reference', 'aigc-style-reference'):
                row['style_scope'] = ('native-content-preserved-inside-current-host'
                    if fact['status'] in ('native-content-retained', 'content-renderer-preserved')
                    else 'approved-body-roles-preserve-original-motion')
    return rows


def report(rows, root=ROOT):
    rows = apply(rows, root)
    pending = [{'id': row['id'], 'status': row['ui_adaptation']['status']} for row in rows
               if row['ui_adaptation']['status'] not in CONNECTED_STATES]
    return {'schema_version': 1, 'entry_count': len(rows),
            'counts_by_status': dict(Counter(r['ui_adaptation']['status'] for r in rows)),
            'pending': pending, 'all_entries_classified': not pending,
            'built_entries_requiring_visual_review': sum(r['ui_adaptation']['status'] == 'role-adapted-needs-visual-review' for r in rows),
            'all_entries_aesthetically_approved': False,
            'scope': '目录含分类和交叠别名，不能当作独立效果数。接线覆盖不等于每项已完整观看或审美认可。',
            'items': [{'id': r['id'], 'kind': r['kind'], **r['ui_adaptation']} for r in rows]}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--all', action='store_true')
    parser.add_argument('--require', action='store_true')
    args = parser.parse_args(argv)
    import capability_catalog
    result = report(capability_catalog.records(args.root), args.root)
    visible = result if args.all else {k: v for k, v in result.items() if k not in ('items', 'pending')}
    if not args.all:
        visible.update(pending_count=len(result['pending']), pending=result['pending'][:20],
                       pending_truncated=len(result['pending']) > 20, full_command='ui.py ui-status --all')
    print(json.dumps(visible, ensure_ascii=False, indent=2))
    return 1 if args.require and not result['all_entries_classified'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
