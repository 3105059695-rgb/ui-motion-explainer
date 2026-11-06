"""Check portable reference completeness separately from installation and aesthetic approval."""
from __future__ import annotations

import argparse
import json
from pathlib import Path

import reference_overviews
from resource_inventory import load_overlay, resource_fact

ROOT = Path(__file__).resolve().parents[1]
DESIGNS = 'assets/agent-editorial/source-designs.json'


def report(root=ROOT, *, atlas_report=None):
    root = Path(root).resolve()
    atlas_path = root / reference_overviews.CATALOG
    counts = {name: {'expected': 0, 'available': 0} for name in
              ('overviews', 'detail_pages', 'source_videos', 'design_media', 'complete_designs')}
    result = {'schema_version': 1, 'required': atlas_path.is_file(), 'ready': False,
              'status': 'not-configured', 'counts': counts, 'missing': [],
              'missing_items': [], 'unavailable_history': [],
              'viewing_status': 'not-observed-by-this-command', 'aesthetic_approval': False,
              'scope': 'File-level completeness only: no decoding, playback, full audiovisual review '
                       'or aesthetic approval is established. References remain candidates; '
                       'their presence does not require using every reference in a new film.'}
    if not result['required']:
        result['message'] = '此包没有配置全片参考目录；本检查未判定参考完整，也未判定作品观感。'
        return result
    data = json.loads(atlas_path.read_text(encoding='utf-8-sig'))
    rows = data if isinstance(data, list) else data.get('videos', data.get('references', data.get('entries')))
    if not isinstance(rows, list):
        raise ValueError('Reference atlas needs a videos array.')
    atlas = atlas_report if atlas_report is not None else reference_overviews.load(root)
    resolved = {r['id']: r for r in atlas['videos']}
    overlay = load_overlay(root)

    def missing(ident, kind, reference_id=None):
        result['missing_items'].append({'resource_id': ident, 'kind': kind,
                                        'reference_id': reference_id})

    def count(kind, fact, ident, reference_id):
        counts[kind]['expected'] += 1
        if fact.get('usable_file', fact.get('available', False)):
            counts[kind]['available'] += 1
        else:
            missing(ident, kind, reference_id)

    for row in rows:
        ident = row['id']
        if not row.get('overview'):
            result['unavailable_history'].append({k: row[k] for k in
                ('id', 'title', 'source_url', 'scope', 'approval_scope', 'availability_note') if k in row})
            continue
        entry = resolved[ident]
        count('overviews', entry['overview'],
              row['overview'].get('resource_id') or f'reference-atlas:{ident}:overview', ident)
        for index, page in enumerate(row.get('pages', [])):
            count('detail_pages', entry['pages'][index],
                  page.get('resource_id') or f'reference-atlas:{ident}:detail-{index + 1:03d}', ident)
        count('source_videos', entry['source_video'],
              row.get('source_resource_id') or f'source-video:{ident}', ident)

    design_path = root / DESIGNS
    if not design_path.is_file():
        missing('catalog:source-designs', 'design_catalog')
    else:
        designs = json.loads(design_path.read_text(encoding='utf-8-sig')).get('designs')
        if not isinstance(designs, list) or not designs:
            raise ValueError('Source-design catalog needs a nonempty designs array.')
        media_facts = {}
        for design in designs:
            counts['complete_designs']['expected'] += 1
            required = []
            for name in ('media_slots', 'logo_slots'):
                for slot in design.get(name, []):
                    # The viewer registers logo slots as @logo/<key>; image
                    # slots already carry their original assets/ or @hero/ key.
                    ident = 'source-design-media:' + ('@logo/' if name == 'logo_slots' else '') + slot['key']
                    required.append(ident)
                    if ident not in media_facts:
                        fact = resource_fact(ident, root=root, overlay=overlay)
                        media_facts[ident] = fact
                        count('design_media', fact, ident, design['id'])
            source = design.get('source_file')
            code_exists = isinstance(source, str) and (root / 'assets/agent-editorial' / source).is_file()
            if not code_exists:
                missing('source-design-code:' + design['id'], 'design_code', design['id'])
            if code_exists and all(media_facts[ident]['usable_file'] for ident in required):
                counts['complete_designs']['available'] += 1
    result['missing'] = sorted({row['resource_id'] for row in result['missing_items']})
    # An empty catalog must not look like a complete reference installation.
    if not counts['overviews']['expected']:
        missing('catalog:reference-atlas:available-overviews', 'reference_catalog')
        result['missing'].append('catalog:reference-atlas:available-overviews')
    result['ready'] = not result['missing']
    result['status'] = 'ready' if result['ready'] else 'missing-reference-assets'
    summary = '、'.join(label + str(counts[key]['available']) + '/' + str(counts[key]['expected'])
                       for key, label in (('overviews', '全片总览'), ('detail_pages', '细读图'),
                       ('source_videos', '原片'), ('design_media', '原设计素材'),
                       ('complete_designs', '完整原设计资源')))
    result['message'] = ('参考文件齐全：' + summary + '。接下来仍需实际查看和按口播选用；这不是视听或审美验收。'
                         if result['ready'] else
                         '参考未齐：' + summary + '。请用包含参考的完整私用包安装/更新，或导入对应补充包；'
                         '不要以四张旧图或空画面替代。程序安装成功不代表参考齐全。')
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--require', action='store_true')
    args = parser.parse_args(argv)
    try:
        result = report(args.root)
    except (OSError, ValueError, KeyError, TypeError) as error:
        print(json.dumps({'ready': False, 'status': 'invalid-reference-catalog', 'error': str(error)}, ensure_ascii=False))
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 2 if args.require and result['required'] and not result['ready'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
