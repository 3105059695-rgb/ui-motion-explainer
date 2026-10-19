"""Resolve retained resources and report evidence, source and runtime status separately."""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
LOCAL_FILE = 'references/resources.local.json'


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def load_overlay(root=ROOT):
    path = Path(root) / LOCAL_FILE
    if not path.is_file():
        return {'schema_version': 1, 'modules': {}, 'files': {}}
    data = read_json(path)
    if not isinstance(data, dict) or type(data.get('schema_version')) is not int or data.get('schema_version') != 1 or set(data) - {'schema_version', 'modules', 'files'}:
        raise ValueError('Invalid local resource overlay schema: ' + str(path))
    modules, files = data.get('modules', {}), data.get('files', {})
    if not isinstance(modules, dict) or set(modules) - {'reference'}:
        raise ValueError('Local resource modules may override only reference; style and production engines remain unchanged.')
    if not isinstance(files, dict):
        raise ValueError('Local resource files must map stable resource IDs to {path,sha256?}.')
    for name, value in modules.items():
        _local_path(value, root)
    for ident, record in files.items():
        if not isinstance(ident, str) or not ident.strip() or not isinstance(record, dict) or set(record) - {'path', 'sha256'}:
            raise ValueError('Invalid local resource file mapping.')
        file_path = _local_path(record.get('path'), root)
        if file_path.is_dir():
            raise ValueError('files mappings require files; directory modules belong under modules: ' + ident)
        if 'sha256' in record and not re.fullmatch('[0-9a-fA-F]{64}', str(record['sha256'])):
            raise ValueError('Invalid SHA-256 in local resource mapping: ' + ident)
    return {'schema_version': 1, 'modules': modules, 'files': files}


def _local_path(value, root):
    if not isinstance(value, str) or not value.strip() or '://' in value or '\x00' in value:
        raise ValueError('Resource mapping requires a nonempty local path, not a URL.')
    return (Path(root) / Path(value).expanduser()).resolve()


def file_sha256(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as handle:
        for chunk in iter(lambda: handle.read(4 * 1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def resource_fact(resource_id, packaged_path=None, root=ROOT, verify_hash=False, expected_sha256=None):
    """Existing packaged files win. Explicit local mappings fill gaps, never invent media."""
    overlay = load_overlay(root)
    candidate = _local_path(packaged_path, root) if isinstance(packaged_path, str) and packaged_path.strip() and '://' not in packaged_path else None
    mapping = overlay['files'].get(resource_id)
    source = 'packaged' if candidate is not None and (candidate.is_file() or candidate.is_dir()) else 'unavailable'
    expected = expected_sha256
    if source != 'packaged' and mapping:
        candidate = _local_path(mapping['path'], root)
        source = 'local-overlay'
        expected = expected_sha256 or mapping.get('sha256')
    file_exists = candidate is not None and candidate.is_file()
    directory_exists = candidate is not None and candidate.is_dir()
    exists = file_exists or directory_exists
    actual = file_sha256(candidate) if file_exists and verify_hash and expected else None
    matches = (actual.lower() == expected.lower()) if actual and expected else None
    return {'resource_id': resource_id, 'path': str(candidate) if candidate is not None else packaged_path,
            'packaged_path': packaged_path, 'exists': exists, 'selection_source': source,
            'path_kind': 'file' if file_exists else 'directory' if directory_exists else 'missing',
            'file_exists': file_exists, 'directory_exists': directory_exists,
            'bytes': candidate.stat().st_size if file_exists else None,
            'expected_sha256': expected, 'actual_sha256': actual, 'hash_matches': matches,
            'hash_status': ('matched' if matches else 'mismatch') if actual else ('not-verified' if expected else 'not-declared'),
            'usable_file': file_exists and matches is not False,
            'scope': 'File presence and optional content hash only; media was not decoded, viewed or approved.'}


def reference_inventory(root=ROOT):
    # Import lazily: ResourceRegistry itself uses load_overlay.
    from resource_registry import ResourceRegistry
    row = ResourceRegistry(root).inspect('reference')
    folder = Path(row['path'])
    catalog_path = folder / 'references/catalog.json'
    if not catalog_path.is_file():
        return {'module': row, 'catalog_entries': 0, 'cases': [], 'warnings': ['Reference catalog is missing.']}
    catalog = read_json(catalog_path)['entries']
    status_path = folder / 'references/rebuild-status.json'
    status = read_json(status_path) if status_path.is_file() else {}
    records = {e['slug']: e for e in status.get('entries', [])}
    cases = []
    for item in catalog:
        history = records.get(item['slug'], {})
        project = (folder / history['project']).resolve() if history.get('project') else None
        if project is not None and not project.is_relative_to(folder.resolve()):
            raise ValueError('Reference project escapes the explicitly selected module: ' + item['slug'])
        entries = []
        if project and project.is_dir():
            entries = [str(project / name) for name in ('index.html', 'project.json', 'package.json', 'render.py') if (project / name).is_file()]
            config = read_json(project / 'project.json') if (project / 'project.json').is_file() else {}
            if config.get('render_engine') == 'python-native' and isinstance(config.get('exporter'), str):
                exporter = (project / config['exporter']).resolve()
                if exporter.is_relative_to(project) and exporter.is_file():
                    entries.append(str(exporter))
        media = {}
        for key in ('local_poster', 'local_preview', 'local_video_absolute'):
            value = item.get(key)
            path = (folder / value).resolve() if value else None
            media[key] = {'path': str(path) if path else None, 'exists': path.is_file() if path else False}
        cases.append({'id': item['slug'], 'title': item.get('title'),
            'resource_id': 'reference-case:' + item['slug'], 'source_url': item.get('source_page'),
            'video_url': item.get('video'), 'project': str(project) if project else None,
            'source_directory_exists': bool(project and project.is_dir()), 'entrypoints': entries,
            'entrypoint_present': any(Path(p).name != 'project.json' for p in entries),
            'runtime_status': 'not-verified', 'historical_status': history.get('status'), 'media': media})
    return {'module': row, 'catalog_path': str(catalog_path), 'catalog_entries': len(cases),
            'source_directories_present': sum(c['source_directory_exists'] for c in cases),
            'entrypoints_present': sum(c['entrypoint_present'] for c in cases),
            'runtime_verified': 0, 'historical_claims': {k: status.get(k) for k in ('runnable', 'rendered', 'scope')},
            'starter_projects': [str(p.parent) for p in (folder / 'assets/templates').glob('*/project.json')],
            'scope': 'Historical claims are retained separately; file/entrypoint presence is not current runtime validation.',
            'cases': cases}


def inspect_reference(slug, root=ROOT):
    report = reference_inventory(root)
    found = next((c for c in report['cases'] if c['id'] == slug), None)
    if found is None:
        raise ValueError('Unknown registered reference case: ' + str(slug))
    return {**found, 'module': report['module']}


def inventory(root=ROOT, verify_hash=False):
    import source_study
    from resource_registry import ResourceRegistry
    root = Path(root)
    study = source_study.source_facts(root, verify_hash=verify_hash)
    aigc_path = root / 'references/aigc-assets.json'
    aigc = read_json(aigc_path) if aigc_path.is_file() else {}
    research = [{**r, 'resource': resource_fact('aigc-research:' + r['id'], r.get('path'), root, verify_hash)}
                for r in aigc.get('research_sources', [])]
    return {'schema_version': 1, 'root': str(root.resolve()), 'local_overlay': str(root / LOCAL_FILE),
            'local_overlay_exists': (root / LOCAL_FILE).is_file(), 'modules': ResourceRegistry(root).report(),
            'study_sources': study, 'aigc_research_sources': research, 'reference': reference_inventory(root),
            'scope': 'Current local file/entrypoint inventory and optional hashes; no generation, rendering, online URL check or aesthetic approval.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('report', 'inspect-reference', 'overlay-check'))
    parser.add_argument('--root', type=Path, default=ROOT)
    parser.add_argument('--slug')
    parser.add_argument('--verify-hashes', action='store_true')
    args = parser.parse_args()
    try:
        if args.command == 'inspect-reference':
            if not args.slug:
                parser.error('inspect-reference requires --slug')
            result = inspect_reference(args.slug, args.root)
        elif args.command == 'overlay-check':
            overlay = load_overlay(args.root)
            result = {'files': [resource_fact(k, root=args.root, verify_hash=True) for k in overlay['files']],
                      'reference_module': reference_inventory(args.root)['module']}
            result['valid'] = all(f['usable_file'] and f['hash_matches'] is not False for f in result['files']) and result['reference_module']['available']
        else:
            result = inventory(args.root, args.verify_hashes)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if result.get('valid') is False else 0


if __name__ == '__main__':
    raise SystemExit(main())
