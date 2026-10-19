"""Inventory, validate and hash a portable ui-motion-fusion release (stdlib only)."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat

MANIFEST = 'release-manifest.json'
STATE = '.install-state.json'
VERSION = '2026.10.19.1'
EXCLUDED_DIRS = {'.git', 'node_modules', '__pycache__', '.cache', 'cache', 'caches',
                 '.venv', 'venv', '.pytest_cache', '.mypy_cache', '.ruff_cache',
                 'runtime', 'runtimes', 'browser-cache'}
PRIVATE_NAMES = {'.env', 'keys', 'credentials', 'credentials.json', 'secrets.json',
                 'id_rsa', 'id_ed25519', '.npmrc', '.pypirc'}
PRIVATE_SUFFIXES = {'.pem', '.key', '.pfx', '.p12'}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def is_link(path: Path) -> bool:
    info = path.lstat()
    return stat.S_ISLNK(info.st_mode) or bool(getattr(info, 'st_file_attributes', 0) & 0x400)


def relative_path(value: str) -> str:
    if not isinstance(value, str) or not value or '\\' in value or ':' in value:
        raise ValueError(f'Not a portable relative path: {value!r}')
    p = PurePosixPath(value)
    if p.is_absolute() or '..' in p.parts or str(p) != value or value in {'.', ''}:
        raise ValueError(f'Not a portable relative path: {value!r}')
    if any(part.endswith((' ', '.')) for part in p.parts):
        raise ValueError(f'Ambiguous Windows path: {value!r}')
    return value


def checked_path(root: Path, value: str) -> Path:
    value = relative_path(value)
    path = root / value
    cursor = root
    for component in PurePosixPath(value).parts:
        cursor = cursor / component
        if cursor.exists() or cursor.is_symlink():
            if is_link(cursor):
                raise ValueError(f'Links/reparse points are not portable: {value}')
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError(f'Path escapes release root: {value}')
    return path


def classify(value: str) -> str:
    parts = PurePosixPath(relative_path(value)).parts
    lower = [part.lower() for part in parts]
    # Author-machine account routes/documents are never release payload. Exclude
    # before traversing their contents; parent links still get checked_path checks.
    if (lower == ['references', 'profiles', 'registry.local.json']
            or lower[:3] == ['references', 'profiles', 'local']):
        return 'excluded'
    for name in lower:
        if (name in PRIVATE_NAMES or name.startswith('.env.')
                or Path(name).suffix in PRIVATE_SUFFIXES):
            raise ValueError(f'Private credential/key path must be removed before release: {value}')
    if any(name in EXCLUDED_DIRS for name in lower):
        return 'excluded'
    if lower[-1] in {MANIFEST, STATE} or lower[-1].endswith(('.pyc', '.pyo')):
        return 'excluded'
    return 'included'


def inventory(root: Path) -> list[Path]:
    root = root.resolve()
    files = []
    for current, directories, names in os.walk(root, followlinks=False):
        base = Path(current)
        kept = []
        for name in sorted(directories):
            path = base / name
            relative = path.relative_to(root).as_posix()
            if classify(relative) == 'excluded':
                continue
            checked_path(root, relative)
            kept.append(name)
        directories[:] = kept
        for name in sorted(names):
            path = base / name
            relative = path.relative_to(root).as_posix()
            if classify(relative) == 'excluded':
                continue
            checked_path(root, relative)
            if not path.is_file():
                raise ValueError(f'Unsupported release entry: {relative}')
            files.append(path)
    return sorted(files, key=lambda p: p.relative_to(root).as_posix())


def read_json(path: Path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def validate_resources(root: Path) -> dict:
    """Validate mandatory module resources and portable approved visual inputs."""
    required = ['SKILL.md', 'install.py', 'agents/openai.yaml',
                'scripts/ui.py', 'scripts/package.py', 'scripts/verify_package.py',
                'scripts/release_manifest.py', 'references/resource-registry.json',
                'references/aigc-assets.json',
                'references/evidence/fred-reference-approved-20261015.json']
    for name in required:
        if not checked_path(root, name).is_file():
            raise ValueError(f'Missing required release file: {name}')
    registry = read_json(root / 'references/resource-registry.json')
    modules = []
    for module in registry['modules']:
        # Optional external/private modules are declarations for explicit local use;
        # they are not installation dependencies or package members.
        if not module.get('required_for_install', True):
            continue
        module_path = module['path']
        if module_path != '.':
            checked_path(root, module_path)
        for item in set(module.get('required', []) + list(module.get('commands', {}).values())):
            name = item if module_path == '.' else f'{module_path}/{item}'
            path = checked_path(root, name)
            if not path.exists():
                raise ValueError(f'Missing module resource ({module["id"]}): {name}')
            if path.is_dir() and not any(p.is_file() for p in path.rglob('*')):
                raise ValueError(f'Empty required module resource: {name}')
        modules.append(module['id'])
    evidence = read_json(root / 'references/evidence/fred-reference-approved-20261015.json')
    anchors = evidence['direction_contract']['visual_calibration']['anchors']
    if len(anchors) < 3:
        raise ValueError('Fred calibration needs at least 3 bundled visual anchors')
    for anchor in anchors:
        path = checked_path(root, anchor['frame'])
        if not path.is_file() or not path.stat().st_size:
            raise ValueError(f'Missing Fred calibration image: {anchor["frame"]}')
    catalog = read_json(root / 'references/aigc-assets.json')
    styles = [s for s in catalog['style_sets'] if s['id'] == 'qiuzhi-girl-painterly']
    if len(styles) != 1:
        raise ValueError('Exactly one approved girl style must be available')
    style = styles[0]
    characters = style['character_references']
    approved_ids = set(style['approval']['approved_asset_ids'])
    scenes = [a for a in style['assets'] if a.get('gallery_asset_id') in approved_ids]
    if len(characters) != 2 or len(scenes) != 8 or len(approved_ids) != 8:
        raise ValueError('The approved girl pack requires 2 identity references and 8 scenes')
    images = [*characters, *[scene['image_path'] for scene in scenes]]
    if len(set(images)) != 10:
        raise ValueError('Girl identity and scene references must be 10 distinct images')
    for name in images:
        path = checked_path(root, name)
        if not path.is_file() or not path.stat().st_size:
            raise ValueError(f'Missing approved girl image: {name}')
    return {'required_modules': modules, 'fred_visual_anchors': len(anchors),
            'girl_identity_images': len(characters), 'girl_scene_images': len(scenes)}


def read_manifest(root: Path) -> dict:
    data = read_json(checked_path(root, MANIFEST))
    if data.get('schema_version') != 1 or data.get('name') != 'ui-motion-fusion':
        raise ValueError('Unsupported release manifest')
    if not data.get('version') or not isinstance(data.get('files'), list) or not data['files']:
        raise ValueError('Incomplete release manifest')
    names = set()
    for row in data['files']:
        name = relative_path(row['path'])
        if classify(name) != 'included' or name.casefold() in names:
            raise ValueError(f'Forbidden or duplicate manifest path: {name}')
        names.add(name.casefold())
        if not isinstance(row.get('size'), int) or row['size'] < 0 or not re.fullmatch('[0-9a-f]{64}', row.get('sha256', '')):
            raise ValueError(f'Invalid manifest metadata: {name}')
    return data


def verify_release(root: Path, *, exact: bool = True) -> dict:
    root = root.resolve()
    data = read_manifest(root)
    for row in data['files']:
        path = checked_path(root, row['path'])
        if not path.is_file() or path.stat().st_size != row['size'] or sha256(path) != row['sha256']:
            raise ValueError(f'Release file hash mismatch: {row["path"]}')
    if exact:
        expected = {row['path'] for row in data['files']}
        actual = {path.relative_to(root).as_posix() for path in inventory(root)}
        if actual != expected:
            raise ValueError('Release inventory differs: ' + json.dumps({
                'unmanaged': sorted(actual - expected), 'missing': sorted(expected - actual)}, ensure_ascii=False))
    resources = validate_resources(root)
    return {'ok': True, 'version': data['version'], 'managed_files': len(data['files']),
            'bytes': sum(row['size'] for row in data['files']), **resources,
            'scope': 'Managed file integrity and portable required resources; not aesthetic or full A/V approval.'}


def build_manifest(root: Path, version: str = VERSION) -> dict:
    root = root.resolve()
    resources = validate_resources(root)
    files = inventory(root)
    result = {'schema_version': 1, 'name': 'ui-motion-fusion', 'version': version,
              'resources': resources,
              'files': [{'path': path.relative_to(root).as_posix(), 'size': path.stat().st_size,
                         'sha256': sha256(path)} for path in files]}
    (root / MANIFEST).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--version', default=VERSION)
    parser.add_argument('--write', action='store_true', help='Create/refresh after the release payload is finalized')
    args = parser.parse_args()
    if args.write:
        build_manifest(args.root, args.version)
    print(json.dumps(verify_release(args.root), ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
