"""Resolve every full-film contact sheet for production; never claim images were viewed."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from resource_inventory import load_overlay, resource_fact

ROOT = Path(__file__).resolve().parents[1]
CATALOG = 'references/reference-atlas.json'


def _image(record, root, overlay):
    record = record if isinstance(record, dict) else {}
    fact = resource_fact(record.get('resource_id', ''), record.get('path'), root=root, overlay=overlay)
    # Tile coordinates belong to the image viewer, not every production context.
    summary = {key: record[key] for key in ('resource_id', 'path', 'start', 'end', 'count',
                                           'frame_count', 'sample_count', 'index') if key in record}
    return {**summary, **fact, 'available': fact['usable_file']}


def load(root=ROOT):
    root = Path(root).resolve()
    path = root / CATALOG
    report = {'schema_version': 1, 'catalog_path': str(path), 'catalog_exists': path.is_file(),
              'videos': [], 'overview_images': [], 'warnings': [],
              'viewing_status': 'not-observed-by-this-command',
              'scope': 'File availability and full-film sampling indices only. This command does not open, '
                       'watch or understand images/videos and does not approve new work.',
              'instruction': '先逐条查看所有参考视频的全片总览图，包括 UI、剪辑手法和 AIGC；'
                             '总览太密时打开对应细读页，再看选中事件的连续动作及前后语境。'
                             '按本期口播选择与落实参考，不要求所有参考都进入每一段。四张旧校准图仅作局部细节对照。'}
    if not path.is_file():
        report.update(status='catalog-unavailable', video_count=0, available_overview_count=0)
        report['warnings'].append('全片总览目录缺失；不能将旧四张图当作已查看全部参考。')
        return report
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    records = data if isinstance(data, list) else data.get('videos', data.get('references', data.get('entries')))
    if not isinstance(records, list):
        raise ValueError('Reference atlas needs a videos array: ' + str(path))
    ids = set()
    overlay = load_overlay(root)
    for row in records:
        if not isinstance(row, dict) or not row.get('id') or row['id'] in ids:
            raise ValueError('Reference atlas requires unique video IDs.')
        ids.add(row['id'])
        overview = _image(row.get('overview'), root, overlay)
        pages = [_image(page, root, overlay) for page in row.get('pages', [])]
        source = resource_fact(row.get('source_resource_id', ''), row.get('source_path'), root=root, overlay=overlay)
        item = {'id': row['id'], 'title': row.get('title', row['id']),
                'categories': row.get('categories', []), 'scope': row.get('scope', ''),
                'approval_scope': row.get('approval_scope', ''),
                'duration_seconds': row.get('duration_seconds', row.get('duration')),
                'sampling': row.get('sampling', row.get('policy')),
                'overview': overview, 'pages': pages, 'source_video': source,
                'available_detail_pages': sum(p['available'] for p in pages),
                'source_resource_id': row.get('source_resource_id')}
        report['videos'].append(item)
        if overview['available']:
            report['overview_images'].append({'id': item['id'], 'title': item['title'],
                                             'path': overview['path'], 'categories': item['categories'],
                                             'scope': item['scope'], 'approval_scope': item['approval_scope']})
        else:
            report['warnings'].append(f"{item['title']}：全片总览图未找到，不能视为已查看。")
    count = len(report['videos'])
    available = len(report['overview_images'])
    report.update(video_count=count, available_overview_count=available,
                  status='available' if count and count == available else 'partially-available' if available else 'unavailable')
    return report


def render_brief(report):
    lines = ['## 先看全部视频的全片总览', '', report['instruction'],
             f"共 {report['video_count']} 条参考；当前可打开 {report['available_overview_count']} 张全片总览。"
             '这是一份待查看清单，命令运行成功不代表已查看。', '']
    for row in report['videos']:
        categories = ' / '.join(str(v) for v in row.get('categories', [])) or '范围见下方'
        lines.append(f"- {row['title']} [{row['id']}] · {categories}")
        image = row['overview']
        lines.append(f"  全片总览：{image['path']}" if image['available'] else
                     f"  全片总览缺失：{image.get('resource_id') or row['id']}；不得用四张旧图替代。")
        lines.append(f"  参考范围：{row['scope'] or row['approval_scope'] or '按该条来源证据判断，不自动整片认可。'}")
        if row['scope'] and row['approval_scope'] and row['scope'] != row['approval_scope']:
            lines.append('  认可边界：' + str(row['approval_scope']))
        lines.append(f"  细读页：{row['available_detail_pages']}/{len(row['pages'])} 可用；"
                     f"在 context.production.reference_overviews.videos[id={row['id']}].pages 按起止时间打开。")
    lines += ['', '联系表覆盖全片时间范围，但采样帧不等于每一帧，不能据此判断完整运动与声音。'
                  '选中的参考要继续核对对应动态区间；全库继续参与本期选用。']
    return '\n'.join(lines)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('operation', nargs='?', choices=['list'], default='list')
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--brief', action='store_true')
    args = parser.parse_args(argv)
    report = load(args.root)
    print(render_brief(report) if args.brief else json.dumps(report, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
