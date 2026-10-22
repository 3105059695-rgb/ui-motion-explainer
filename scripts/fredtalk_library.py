"""Offline FredTalk catalog adapter and verified source materialization.

Catalog inclusion and upstream keep labels are not user approval. This module
never downloads media, executes source, installs packages, or renders a video.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath, PureWindowsPath
import re
import stat


ROOT = Path(__file__).resolve().parents[1]
LIBRARY = 'assets/fredtalk-library'
CATALOG = LIBRARY + '/catalog.json'
NAMESPACE = 'fredtalk:'
NOTICES = ('LICENSE', 'THIRD_PARTY_NOTICES.md', 'upstream-license-scope.md')


def _identifier(value):
    value = str(value)
    bare = value[len(NAMESPACE):] if value.startswith(NAMESPACE) else value
    if not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_.-]*', bare) or bare in ('.', '..'):
        raise ValueError('Invalid FredTalk reference ID: ' + value)
    return NAMESPACE + bare


def _item_identifier(item):
    # upstream_id is an upstream component key, not the library reference ID.
    return _identifier(item.get('reference_id') or item['id'])


def _relative(value):
    if not isinstance(value, str) or not value or '\\' in value or ':' in value:
        raise ValueError('Expected a safe relative POSIX path: ' + str(value))
    path = PurePosixPath(value)
    if path.is_absolute() or any(p in ('', '.', '..') for p in value.split('/')):
        raise ValueError('Unsafe relative path: ' + value)
    if any(p.endswith((' ', '.')) or PureWindowsPath(p).is_reserved() for p in path.parts):
        raise ValueError('Unsafe Windows path: ' + value)
    return path


def _no_reparse(path):
    """Check existing ancestors without resolving away symlinks or junctions."""
    path = Path(path).absolute()
    for candidate in reversed((path, *path.parents)):
        try:
            info = candidate.lstat()
        except FileNotFoundError:
            continue
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            raise ValueError('Refusing symlink or reparse path: ' + str(candidate))
        if candidate != path and not stat.S_ISDIR(info.st_mode):
            raise ValueError('Path ancestor is not a directory: ' + str(candidate))


def _under(root, relative):
    root = Path(root).absolute()
    path = root.joinpath(*_relative(relative).parts)
    _no_reparse(path)
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError('Path escapes its root: ' + relative)
    return path


def _catalog(root):
    path = _under(root, CATALOG)
    if not path.is_file():
        return {'schema_version': 1, 'upstream': {}, 'items': []}
    payload = json.loads(path.read_text(encoding='utf-8-sig'))
    if payload.get('schema_version') != 1 or not isinstance(payload.get('items'), list):
        raise ValueError('FredTalk catalog requires schema_version:1 and items:[...].')
    ids = [_item_identifier(item) for item in payload['items']]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate FredTalk reference IDs.')
    return payload


def _lookup(root, ident):
    ident = _identifier(ident)
    catalog = _catalog(root)
    for item in catalog['items']:
        if _item_identifier(item) == ident:
            return catalog, item
    raise ValueError('Unknown FredTalk reference ID: ' + ident)


def _blob_path(root, row):
    relative = str(_relative(row.get('blob_path')))
    if not relative.startswith(LIBRARY + '/blobs/'):
        raise ValueError('Source blob must stay inside ' + LIBRARY + '/blobs/')
    _relative(row.get('upstream_path'))
    return _under(root, relative)


def _present(root, row, cache=None):
    try:
        if row.get('available', True) is False:
            return False
        _relative(row.get('upstream_path'))
        blob = str(_relative(row.get('blob_path')))
        if cache is not None and blob in cache:
            return cache[blob]
        found = _blob_path(root, row).is_file()
        if cache is not None:
            cache[blob] = found
        return found
    except (OSError, ValueError):
        return False


def _record(root, item, present_cache=None):
    public = item.get('source_access') == 'public'
    sources = [dict(row, path=row['blob_path']) for row in item.get('sources', [])
               if public and row.get('blob_path') and _present(root, row, present_cache)]
    available = (public and bool(sources) and len(sources) == len(item.get('sources', []))
                 and bool(item.get('closure')) and all(_present(root, r, present_cache) for r in item['closure']))
    implementation = dict(item.get('implementation') or {})
    implementation.update({
        'entrypoints': [row['path'] for row in sources], 'sources': sources,
        'source_available': available, 'integrity_status': 'verify-with-inspect',
        'runtime_tested_this_run': False,
        'scope': 'Vendored source is an adaptation candidate; dependencies, media, runtime and user approval remain unverified.',
    })
    return {
        **item, 'id': _item_identifier(item),
        'title': item.get('title') or item.get('label') or item['id'],
        'library_kind': 'software-preset', 'source': sources,
        'implementation': implementation, 'source_available': available,
        'status': 'source-candidate' if available else 'preview-only',
        'upstream_reusability': item.get('reusability'),
        'user_approval': {'status': 'unreviewed', 'scope': 'No user approval is inferred from upstream labels.'},
    }


def records(root=ROOT, include_archived=False, include_unavailable=False):
    """Selection-compatible candidates, with no source quota or ranking bonus."""
    result = []
    # Many entries share the same blobs. Cache only within this read, never across
    # calls: removals/replacements must be visible on the next selection request.
    present_cache = {}
    for item in _catalog(root)['items']:
        if item.get('archived') and not include_archived:
            continue
        row = _record(root, item, present_cache)
        if row['source_available'] or include_unavailable:
            result.append(row)
    return result


def _verify(root, row):
    result = dict(row, path=None, file_exists=False, hash_verified=False)
    try:
        if row.get('available', True) is False:
            raise ValueError('Source is marked unavailable')
        if not row.get('blob_path'):
            raise ValueError('Source blob is not bundled')
        path = _blob_path(root, row)
        result['path'] = str(path)
        result['file_exists'] = path.is_file()
        if not result['file_exists']:
            raise ValueError('Source blob is missing')
        data = path.read_bytes()
        expected = row.get('sha256', '')
        if not re.fullmatch(r'[a-fA-F0-9]{64}', expected):
            raise ValueError('Missing or invalid SHA-256')
        if hashlib.sha256(data).hexdigest() != expected.lower():
            raise ValueError('SHA-256 mismatch')
        blob = row.get('git_blob', '')
        if not re.fullmatch(r'[a-fA-F0-9]{40}', blob):
            raise ValueError('Missing or invalid Git blob ID')
        if hashlib.sha1(b'blob ' + str(len(data)).encode('ascii') + b'\0' + data).hexdigest() != blob.lower():
            raise ValueError('Git blob hash mismatch')
        if 'bytes' in row and row['bytes'] != len(data):
            raise ValueError('Source byte count mismatch')
        result.update(status='verified', hash_verified=True, bytes=len(data))
    except (OSError, ValueError) as error:
        result.update(status='unavailable', issue=str(error))
    return result


def resolve_sources(root, ident):
    """Verify the selected source closure; explicit archived IDs are permitted."""
    _, item = _lookup(root, ident)
    public = item.get('source_access') == 'public'
    sources = [_verify(root, row) for row in item.get('sources', [])] if public else []
    closure = [_verify(root, row) for row in item.get('closure', [])] if public else []
    issues = [f"{row.get('upstream_path', '?')}: {row['issue']}"
              for row in sources + closure if row.get('issue')]
    if not public:
        issues.append('Members-only source is preview-only; no source access is attempted.')
    elif not sources or not closure:
        issues.append('Source entrypoints or dependency closure are missing.')
    by_path = {}
    for row in closure:
        key = str(row.get('upstream_path', '')).casefold()
        if key in by_path:
            issues.append('Duplicate closure path: ' + key)
        by_path[key] = row
    for source in sources:
        entry = by_path.get(str(source.get('upstream_path', '')).casefold())
        if not entry or any(source.get(key) != entry.get(key) for key in ('upstream_path', 'git_blob', 'sha256', 'blob_path')):
            issues.append('Entrypoint does not match its closure: ' + str(source.get('upstream_path')))
    return {
        'id': _item_identifier(item),
        'source_access': item.get('source_access'), 'available': public and not issues,
        'sources': sources, 'closure': closure, 'issues': issues,
        'unresolved_imports': item.get('unresolved_imports', []),
        'external_packages': item.get('external_packages', []),
        'required_media': item.get('required_media', []),
        'runtime_tested_this_run': False,
    }


def inspect(root, ident):
    catalog, item = _lookup(root, ident)
    current = resolve_sources(root, ident)
    record = _record(root, item)
    record['source_available'] = current['available']
    record['implementation']['source_available'] = current['available']
    record['implementation']['integrity_status'] = 'verified' if current['available'] else 'unavailable'
    record['status'] = 'source-candidate' if current['available'] else 'preview-only'
    return {'record': record, 'current_sources': current, 'upstream': catalog.get('upstream', {}),
            'approval_state': 'unreviewed', 'runtime_tested_this_run': False}


def materialize(root, ident, project):
    """Copy exact verified bytes after full preflight; never overwrite differences."""
    catalog, item = _lookup(root, ident)
    resolved = resolve_sources(root, ident)
    if not resolved['available']:
        raise ValueError('Cannot materialize FredTalk source: ' + '; '.join(resolved['issues']))
    bare_id = resolved['id'][len(NAMESPACE):]
    _relative(bare_id)
    project = Path(project).absolute()
    _no_reparse(project)
    if project.exists() and not project.is_dir():
        raise ValueError('Project must be a directory: ' + str(project))
    relative_base = 'vendor/fredtalk/' + bare_id
    destination = _under(project, relative_base)
    plan = {}
    for row in resolved['closure']:
        relative = 'upstream/' + row['upstream_path']
        data = Path(row['path']).read_bytes()
        if hashlib.sha256(data).hexdigest() != row['sha256'].lower():
            raise ValueError('Source changed during preflight: ' + row['upstream_path'])
        plan[relative] = data
    for name in NOTICES:
        source = _under(root, LIBRARY + '/' + name)
        if not source.is_file():
            raise ValueError('Required attribution file is missing: ' + str(source))
        plan[name] = source.read_bytes()
    receipt = {
        'schema_version': 1, 'id': resolved['id'], 'upstream': catalog.get('upstream', {}),
        'archived': bool(item.get('archived')), 'source_access': 'public',
        'approval_state': 'unreviewed', 'upstream_reusability': item.get('reusability'),
        'entrypoints': [{'path': 'upstream/' + row['upstream_path'],
                         'symbol': row.get('symbol'), 'sha256': row['sha256']}
                        for row in resolved['sources']],
        'files': [{'path': 'upstream/' + row['upstream_path'], 'sha256': row['sha256'],
                   'git_blob': row['git_blob'], 'bytes': row['bytes']} for row in resolved['closure']],
        'attribution_files': list(NOTICES),
        'implementation': item.get('implementation', {}),
        'unresolved_imports': resolved['unresolved_imports'],
        'external_packages': resolved['external_packages'], 'required_media': resolved['required_media'],
        'runtime_status': 'not-tested', 'runtime_tested_this_run': False,
        'dependencies_status': 'not-installed-or-verified', 'media_status': 'not-copied-or-verified',
        'rendered': False,
    }
    plan['reuse-receipt.json'] = (json.dumps(receipt, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    # Check every target (including the receipt and attribution) before creating a directory.
    targets = []
    for relative, data in plan.items():
        target = _under(destination, relative)
        if target.exists() and (not target.is_file() or target.read_bytes() != data):
            raise ValueError('Refusing to overwrite differing existing file: ' + str(target))
        targets.append((target, data))
    copied = []
    for target, data in targets:
        if target.exists():
            continue
        _no_reparse(target)
        target.parent.mkdir(parents=True, exist_ok=True)
        with target.open('xb') as stream:
            stream.write(data)
        copied.append(str(target.relative_to(project)))
    return {'id': resolved['id'], 'destination': str(destination),
            'receipt_path': str(destination / 'reuse-receipt.json'), 'receipt': receipt,
            'copied_files': copied, 'runtime_tested_this_run': False}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest='command', required=True)
    search = subparsers.add_parser('search')
    search.add_argument('query', nargs='?', default='')
    search.add_argument('--include-archived', action='store_true')
    search.add_argument('--include-unavailable', action='store_true')
    show = subparsers.add_parser('inspect')
    show.add_argument('--id', required=True)
    copy = subparsers.add_parser('materialize')
    copy.add_argument('--id', required=True)
    copy.add_argument('--project', required=True)
    for command in (search, show, copy):
        command.add_argument('--root', type=Path, default=ROOT)
    args = parser.parse_args(argv)
    try:
        if args.command == 'search':
            rows = records(args.root, args.include_archived, args.include_unavailable)
            query = args.query.casefold().strip()
            keys = ('id', 'title', 'label', 'category', 'semantic_use', 'use_when', 'state_chain')
            result = [row for row in rows if not query or query in
                      ' '.join(str(row.get(key, '')) for key in keys).casefold()]
        elif args.command == 'inspect':
            result = inspect(args.root, args.id)
        else:
            result = materialize(args.root, args.id, args.project)
    except (OSError, ValueError) as error:
        parser.exit(2, str(error) + '\n')
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
