"""Register generated full-film sheets without publishing private paths or media."""
import argparse
import json
from pathlib import Path
import shutil

from resource_inventory import load_overlay

ROOT = Path(__file__).resolve().parents[1]


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def register(inventory_path, atlas, root=ROOT):
    root, atlas = Path(root).resolve(), Path(atlas).resolve()
    inventory = read(inventory_path)
    generated = {r['id']: r for r in read(atlas / 'manifest.json')['references']}
    overlay = load_overlay(root)
    catalog_path = root / 'references/reference-atlas.json'
    catalog = read(catalog_path) if catalog_path.is_file() else {'schema_version': 1, 'videos': []}
    rows = {r['id']: r for r in catalog['videos']}
    for source in inventory:
        ident = source['id']
        result = generated.get(ident, {})
        row = {k: source[k] for k in ('id', 'title', 'categories', 'scope', 'approval_scope',
               'duration_seconds', 'approved_ranges', 'excluded_ranges') if k in source}
        row['source_resource_id'] = source['resource_id']
        if source.get('source_url') or source.get('remote_url'):
            row['source_url'] = source.get('source_url') or source['remote_url']
        # Only media already present inside the public package can produce public sheets.
        packaged = source.get('packaged_path')
        public = False
        if source.get('privacy') == 'packaged-public-demo' and packaged:
            candidate = (root / packaged).resolve()
            if candidate.is_relative_to(root) and candidate.is_file():
                public = True
                row['source_path'] = candidate.relative_to(root).as_posix()
        original = Path(source['path']).resolve() if source.get('path') else None
        if not public and original and original.is_file():
            overlay['files'][source['resource_id']] = {'path': str(original)}
        row['overview'], row['pages'] = {}, []
        row['availability_note'] = '只有来源链接，本机原片缺失，尚不能生成总览。'
        if result.get('status') == 'ready':
            directory = (atlas / result['directory']).resolve()
            if not directory.is_relative_to(atlas):
                raise ValueError('Atlas directory must stay inside its output root.')
            row['duration_seconds'] = result['duration_seconds']
            row['sampling'] = {**result['sampling'],
                'detail_interval_seconds': result['sampling']['effective_interval_seconds']}
            row['coverage'] = {k: v for k, v in result['coverage'].items() if k != 'gap_seconds'}
            for index, sheet in enumerate([result['overview'], *result['detail_pages']]):
                image = (directory / sheet['file']).resolve()
                if not image.is_relative_to(directory) or not image.is_file():
                    raise ValueError('Missing generated sheet: ' + str(image))
                role = 'overview' if index == 0 else f'detail-{index:03d}'
                item = {k: v for k, v in sheet.items() if k != 'file'}
                item['resource_id'] = f'reference-atlas:{ident}:{role}'
                item['count'] = len(item.get('cells', []))
                item['start'] = sheet.get('start_seconds', item['cells'][0]['seconds'])
                item['end'] = sheet.get('end_seconds', item['cells'][-1]['seconds'])
                if public:
                    destination = root / 'assets/reference-atlas/public' / ident / image.name
                    destination.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(image, destination)
                    item['path'] = destination.relative_to(root).as_posix()
                else:
                    overlay['files'][item['resource_id']] = {'path': str(image)}
                if index == 0:
                    row['overview'] = item
                else:
                    row['pages'].append(item)
            row['availability_note'] = ('公开示例图集已随包携带。' if public else
                                        '私人原片及派生图集通过本机映射读取，不上传公开仓库。')
        elif original and original.is_file():
            row['availability_note'] = '本机原片存在，总览尚未生成成功；没有用局部四图替代。'
        rows[ident] = row
    catalog.update(schema_version=1, videos=list(rows.values()),
        policy='Full-duration sampled contact sheets; not every frame and not proof of viewing. '
               'Private derivatives remain local. New entries merge without removing retained references.')
    write(catalog_path, catalog)
    write(root / 'references/resources.local.json', overlay)
    return {'videos': len(rows), 'overviews': sum(bool(r['overview']) for r in rows.values()),
            'detail_pages': sum(len(r['pages']) for r in rows.values()),
            'catalog': str(catalog_path)}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--atlas', type=Path, required=True)
    parser.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args(argv)
    print(json.dumps(register(args.input, args.atlas, args.root), ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
