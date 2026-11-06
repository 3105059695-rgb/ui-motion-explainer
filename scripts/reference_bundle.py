"""Move private visual references between computers without publishing author paths."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import uuid
import zipfile

from release_manifest import MANIFEST, checked_path, is_link, read_manifest, verify_release

ROOT = Path(__file__).resolve().parents[1]
PACK_MANIFEST = 'references/resources.pack.json'
PRIVATE_PREFIX = 'references/private-media/'
RESOURCE_PREFIXES = ('reference-atlas:', 'source-video:', 'source-design-media:',
                     'aigc-video:', 'aigc-source:', 'reference-case:')
SCOPE = ('Private reference media for the owner\'s computers. Do not publish this bundle. '
         'Relative paths preserve visual references, not narration identity or aesthetic approval.')


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as source:
        for block in iter(lambda: source.read(4 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def _root(value):
    root = Path(os.path.abspath(Path(value).expanduser()))
    for item in [root, *root.parents]:
        if (item.exists() or item.is_symlink()) and is_link(item):
            raise ValueError('Reference package root contains a link/reparse point.')
    return root.resolve()


def _report(files, present, verified=False):
    unique = {v['path']: v['size'] for v in files.values()}
    return {'present': present, 'schema_version': 1, 'files': files,
            'resource_count': len(files), 'unique_files': len(unique),
            'bytes': sum(unique.values()), 'hash_verified': verified, 'scope': SCOPE}


def load_pack(root=ROOT, verify_hash=False):
    """Read relative mappings. Missing, tampered or escaping declared files are errors."""
    root = _root(root)
    path = checked_path(root, PACK_MANIFEST)
    if not path.exists():
        return _report({}, False)
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    if (not isinstance(data, dict) or type(data.get('schema_version')) is not int
            or data['schema_version'] != 1 or not isinstance(data.get('files'), dict)
            or set(data) - {'schema_version', 'files', 'private', 'release_version', 'scope'}):
        raise ValueError('Invalid portable reference manifest.')
    files, checked = {}, {}
    for ident, row in data['files'].items():
        if (not isinstance(ident, str) or not ident.startswith(RESOURCE_PREFIXES)
                or not isinstance(row, dict) or set(row) != {'path', 'sha256', 'size'}):
            raise ValueError('Invalid portable reference record.')
        name, sha, size = row['path'], row['sha256'], row['size']
        if (not isinstance(name, str) or not name.startswith(PRIVATE_PREFIX)
                or not isinstance(sha, str) or not re.fullmatch('[0-9a-f]{64}', sha)
                or type(size) is not int or size < 0):
            raise ValueError('Invalid portable reference path/hash/size: ' + ident)
        candidate = checked_path(root, name)
        if Path(name).name.split('.', 1)[0] != sha:
            raise ValueError('Portable media filename must use its content hash: ' + ident)
        metadata = (sha, size)
        if name in checked:
            if checked[name] != metadata:
                raise ValueError('Conflicting portable reference metadata: ' + ident)
        else:
            if not candidate.is_file() or candidate.stat().st_size != size:
                raise ValueError('Missing or size-mismatched portable reference: ' + ident)
            if verify_hash and digest(candidate) != sha:
                raise ValueError('Portable reference hash mismatch: ' + ident)
            checked[name] = metadata
        files[ident] = {'path': name, 'sha256': sha, 'size': size}
    return _report(files, True, verify_hash)


def _manifest(files, release_version=None):
    value = {'schema_version': 1, 'private': True, 'scope': SCOPE, 'files': files}
    if release_version:
        value['release_version'] = release_version
    return value


def _write_manifest(root, files):
    destination = checked_path(root, PACK_MANIFEST)
    destination.parent.mkdir(parents=True, exist_ok=True)
    temporary = destination.with_name(destination.name + '.incoming-' + uuid.uuid4().hex)
    try:
        with temporary.open('x', encoding='utf-8') as handle:
            json.dump(_manifest(files), handle, ensure_ascii=False, indent=2)
            handle.write('\n')
        # Only the package manifest is replaced; original media and local overlays are retained.
        os.replace(temporary, destination)
    finally:
        if temporary.is_file():
            temporary.unlink()


def install_pack(source, target):
    """Validate the complete source before merging references into an installed skill."""
    source, target = _root(source), _root(target)
    incoming = load_pack(source, verify_hash=True)
    if not incoming['present']:
        return {**incoming, 'action': 'no-reference-pack', 'copied_files': 0}
    previous = load_pack(target)
    merged = {**previous['files'], **incoming['files']}
    unique = {row['path']: row for row in incoming['files'].values()}
    copies = []
    # Check all collisions before any content is copied or a manifest is changed.
    for name, row in unique.items():
        destination = checked_path(target, name)
        if destination.exists():
            if (not destination.is_file() or destination.stat().st_size != row['size']
                    or digest(destination) != row['sha256']):
                raise ValueError('Existing portable media differs; no files changed: ' + name)
        else:
            copies.append((name, row))
    for name, row in copies:
        destination = checked_path(target, name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        created = False
        try:
            with destination.open('xb') as output:
                created = True
                h = hashlib.sha256()
                with checked_path(source, name).open('rb') as original:
                    for block in iter(lambda: original.read(4 * 1024 * 1024), b''):
                        output.write(block)
                        h.update(block)
            if destination.stat().st_size != row['size'] or h.hexdigest() != row['sha256']:
                raise ValueError('Source changed while copying portable media: ' + name)
        except BaseException:
            if created and destination.is_file():
                destination.unlink()  # Only this invocation's failed, newly created copy.
            raise
    _write_manifest(target, merged)
    return {**_report(merged, True, False), 'action': 'imported',
            'incoming_hash_verified': True, 'copied_files': len(copies),
            'preserved_existing_resource_ids': sorted(set(previous['files']) - set(incoming['files']))}


def _collect(root):
    # Lazy import lets resource_inventory.load_overlay also consume load_pack safely.
    from resource_inventory import load_overlay, resource_fact
    overlay = load_overlay(root)
    catalog = json.loads((root / 'references/reference-atlas.json').read_text(encoding='utf-8-sig'))
    candidates = {}
    for row in catalog['videos']:
        entries = [{'resource_id': row.get('source_resource_id'), 'path': row.get('source_path')},
                   row.get('overview', {}), *row.get('pages', [])]
        for entry in entries:
            ident = entry.get('resource_id')
            if not ident:
                continue
            fact = resource_fact(ident, entry.get('path'), root=root, overlay=overlay)
            if fact['usable_file'] and fact['selection_source'] != 'packaged':
                candidates[ident] = Path(fact['path'])
    for ident, record in overlay['files'].items():
        if ident.startswith('source-design-media:'):
            path = (root / record['path']).resolve()
            if path.is_file():
                candidates[ident] = path
    files, unique, hash_cache = {}, {}, {}
    for ident, path in sorted(candidates.items()):
        if not ident.startswith(RESOURCE_PREFIXES):
            raise ValueError('Unapproved reference resource type: ' + ident)
        # Do not follow any source links into unexpected private directories.
        _root(path)
        stat = path.stat()
        key = (str(path), stat.st_size, stat.st_mtime_ns)
        sha = hash_cache.setdefault(key, None)
        if sha is None:
            sha = digest(path)
            hash_cache[key] = sha
        if sha not in unique:
            extension = path.suffix.lower()
            if not re.fullmatch(r'\.[a-z0-9]{1,10}', extension):
                extension = '.bin'
            unique[sha] = {'source': path, 'path': PRIVATE_PREFIX + sha + extension,
                           'sha256': sha, 'size': stat.st_size}
        item = unique[sha]
        files[ident] = {k: item[k] for k in ('path', 'sha256', 'size')}
    return files, list(unique.values())


def export_bundle(root, output, *, verify=True):
    """Stream a complete private installer ZIP; never writes media copies into the repository."""
    root, output = _root(root), Path(output).expanduser().resolve()
    if output.exists():
        raise ValueError('Output already exists; choose a new archive name.')
    if output.is_relative_to(root):
        raise ValueError('Private bundle must be outside the public skill directory.')
    if verify:
        verify_release(root, exact=False)
    release = read_manifest(root)
    files, unique = _collect(root)
    if not files:
        raise ValueError('No available private visual references to bundle.')
    payload = _manifest(files, release['version'])
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_name(output.name + '.partial')
    if temporary.exists():
        raise ValueError('An unfinished bundle already exists: ' + str(temporary))
    created = False
    try:
        with temporary.open('xb') as stream:
            created = True
            with zipfile.ZipFile(stream, 'w', compression=zipfile.ZIP_STORED, allowZip64=True) as archive:
                archive.comment = b'PRIVATE visual reference bundle. Do not upload to public GitHub.'
                for row in release['files']:
                    name = row['path']
                    if name == PACK_MANIFEST or name.startswith(PRIVATE_PREFIX) or name.endswith('.local.json'):
                        raise ValueError('Private data unexpectedly declared as public release payload.')
                    archive.write(checked_path(root, name), 'ui-motion-fusion/' + name)
                archive.write(checked_path(root, MANIFEST), 'ui-motion-fusion/' + MANIFEST)
                archive.writestr('ui-motion-fusion/' + PACK_MANIFEST,
                    json.dumps(payload, ensure_ascii=False, indent=2) + '\n', compress_type=zipfile.ZIP_DEFLATED)
                archive.writestr('ui-motion-fusion/' + PRIVATE_PREFIX + 'PRIVATE-REFERENCE-BUNDLE.txt',
                    '私用完整参考安装包：包含主人授权在自己的电脑间使用的参考图、原片和演示素材。\n'
                    '请勿上传公开 GitHub。解压后运行根目录 install.py；已有安装使用 --update。\n'
                    '私人资源以相对路径安装，不需要原电脑的盘符、账号文件或音色。\n',
                    compress_type=zipfile.ZIP_DEFLATED)
                for row in unique:
                    h, written = hashlib.sha256(), 0
                    with row['source'].open('rb') as original:
                        with archive.open('ui-motion-fusion/' + row['path'], 'w', force_zip64=True) as member:
                            for block in iter(lambda: original.read(4 * 1024 * 1024), b''):
                                member.write(block)
                                h.update(block)
                                written += len(block)
                    if written != row['size'] or h.hexdigest() != row['sha256']:
                        raise ValueError('Reference changed while writing archive.')
        if output.exists():
            raise ValueError('Output appeared during export; refusing to replace it.')
        temporary.rename(output)
    except BaseException:
        if created and temporary.is_file():
            temporary.unlink()
        raise
    return {'archive': str(output), 'archive_bytes': output.stat().st_size,
            'release_version': release['version'], 'public_files': len(release['files']),
            **{k: v for k, v in _report(files, True, True).items() if k != 'files'},
            'private': True}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    export = sub.add_parser('export')
    export.add_argument('--root', type=Path, default=ROOT)
    export.add_argument('--out', type=Path, required=True)
    install = sub.add_parser('import')
    install.add_argument('--source', type=Path, required=True, help='Extracted skill root containing resources.pack.json.')
    install.add_argument('--target', type=Path, default=ROOT)
    inspect = sub.add_parser('inspect')
    inspect.add_argument('--root', type=Path, default=ROOT)
    inspect.add_argument('--verify-hashes', action='store_true')
    args = parser.parse_args(argv)
    try:
        if args.command == 'export':
            report = export_bundle(args.root, args.out)
        elif args.command == 'import':
            report = install_pack(args.source, args.target)
        else:
            report = load_pack(args.root, verify_hash=args.verify_hashes)
        print(json.dumps(report, ensure_ascii=False, indent=2))
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')


if __name__ == '__main__':
    main()
