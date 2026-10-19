"""Install or explicitly update the single ui-motion-fusion entry using the release manifest."""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import shutil
import sys
import tempfile
import uuid

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'scripts'))
from release_manifest import (MANIFEST, STATE, checked_path, is_link, read_manifest,
                              sha256, verify_release)


def write_json(path: Path, value: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def check_target(target: Path, source: Path) -> Path:
    absolute = Path(os.path.abspath(target.expanduser()))
    if absolute.name != 'ui-motion-fusion':
        raise ValueError('--target must name the ui-motion-fusion directory itself, not its skills parent')
    for parent in [absolute, *absolute.parents]:
        if parent.exists() or parent.is_symlink():
            if is_link(parent):
                raise ValueError(f'Target or ancestor is a link/reparse point: {parent}')
    absolute = absolute.resolve()
    if absolute == source or absolute.is_relative_to(source) or source.is_relative_to(absolute):
        raise ValueError('Run the downloaded release installer from outside the destination')
    if absolute.exists() and not absolute.is_dir():
        raise ValueError('Target is not a directory')
    return absolute


def copy_payload(source: Path, staging: Path):
    for name in [*[row['path'] for row in read_manifest(source)['files']], MANIFEST]:
        destination = checked_path(staging, name)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(checked_path(source, name), destination)
    verify_release(staging)


def install(source: Path, target: Path, *, update: bool = False,
            replace_modified: bool = False, backup_root: Path | None = None) -> dict:
    source = source.resolve()
    release = verify_release(source)
    incoming = read_manifest(source)
    target = check_target(target, source)
    exists = target.exists()
    if exists and not update:
        raise ValueError('Target exists. Use --update; no existing files have been changed.')
    if replace_modified and not update:
        raise ValueError('--replace-modified is only valid with --update')
    target.parent.mkdir(parents=True, exist_ok=True)
    staging = Path(tempfile.mkdtemp(prefix='.ui-motion-fusion-incoming-', dir=target.parent))
    try:
        copy_payload(source, staging)
        if not exists:
            write_json(staging / STATE, {'version': incoming['version'], 'action': 'install',
                                        'manifest_sha256': sha256(staging / MANIFEST)})
            if target.exists():
                raise ValueError('Target appeared during installation; refusing to replace it')
            staging.rename(target)
            return {**release, 'action': 'installed', 'target': str(target), 'backup': None}

        # Plan the entire update before creating a backup or changing destination files.
        old_manifest_path = checked_path(target, MANIFEST)
        previous = read_manifest(target) if old_manifest_path.is_file() else None
        old = {row['path']: row for row in previous['files']} if previous else {}
        new = {row['path']: row for row in incoming['files']}
        conflicts, writes, deletes, preserved_orphans = [], [], [], []
        for name, row in new.items():
            path = checked_path(target, name)
            if path.exists() and not path.is_file():
                raise ValueError(f'Incoming file collides with a local directory: {name}')
            if path.is_file():
                current_hash = sha256(path)
                if current_hash == row['sha256']:
                    continue
                if name not in old or current_hash != old[name]['sha256']:
                    conflicts.append(name)
            writes.append(name)
        for name, row in old.items():
            if name in new:
                continue
            path = checked_path(target, name)
            if not path.exists():
                continue
            if path.is_file() and sha256(path) == row['sha256']:
                deletes.append(name)
            else:
                preserved_orphans.append(name)
        if conflicts and not replace_modified:
            raise ValueError('Update stopped before changes. Modified managed files or local-name collisions: '
                             + json.dumps(conflicts, ensure_ascii=False)
                             + '. Keep local overrides in separate files, or explicitly use '
                               '--update --replace-modified to back up and replace these exact conflicts.')
        for name in (MANIFEST, STATE):
            path = checked_path(target, name)
            if path.exists() and not path.is_file():
                raise ValueError(f'Installer metadata collides with a directory: {name}')
        backup_root = (backup_root or target.parent.parent / 'skill-update-backups').resolve()
        if backup_root.is_relative_to(target) or backup_root.is_relative_to(source):
            raise ValueError('Backup location must be outside the source and installed skill')
        # Backups stay outside the skills directory, so they cannot become extra menu entries.
        if backup_root == target.parent or backup_root.is_relative_to(target.parent):
            raise ValueError('Backup location must be outside the skills menu directory')
        for parent in [backup_root, *backup_root.parents]:
            if parent.exists() and is_link(parent):
                raise ValueError(f'Backup directory is a link/reparse point: {parent}')
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
        backup = backup_root / ('ui-motion-fusion-' + stamp + '-' + uuid.uuid4().hex[:8])
        backup.mkdir(parents=True, exist_ok=False)
        changed = [*writes, *deletes, MANIFEST, STATE]
        originals, created = [], []
        for name in changed:
            path = checked_path(target, name)
            if path.is_file():
                saved = backup / 'files' / name
                saved.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(path, saved)
                originals.append({'path': name, 'sha256': sha256(saved)})
            else:
                created.append(name)
        plan = {'schema_version': 1, 'target': str(target), 'status': 'backup_ready',
                'from_version': previous['version'] if previous else 'unmanaged-legacy',
                'to_version': incoming['version'], 'originals': originals,
                'created_paths': created, 'replaced_local_modifications': conflicts,
                'preserved_modified_obsolete_files': preserved_orphans}
        write_json(backup / 'backup-plan.json', plan)
        # Failures restore only paths in this transaction; unrelated user files are untouched.
        attempted = []
        try:
            for name in writes:
                destination = checked_path(target, name)
                destination.parent.mkdir(parents=True, exist_ok=True)
                attempted.append(name)
                shutil.copy2(staging / name, destination)
            for name in deletes:
                attempted.append(name)
                checked_path(target, name).unlink()
            attempted.append(MANIFEST)
            shutil.copy2(staging / MANIFEST, target / MANIFEST)
            attempted.append(STATE)
            write_json(target / STATE, {'version': incoming['version'], 'action': 'update',
                                       'backup': str(backup),
                                       'manifest_sha256': sha256(target / MANIFEST)})
            verify_release(target, exact=False)
            plan['status'] = 'updated'
            write_json(backup / 'backup-plan.json', plan)
        except BaseException as error:
            rollback_errors = []
            originals_by_path = {row['path']: row for row in originals}
            for name in reversed(attempted):
                try:
                    destination = checked_path(target, name)
                    if name in originals_by_path:
                        shutil.copy2(backup / 'files' / name, destination)
                    elif destination.is_file():
                        destination.unlink()
                except Exception as rollback_error:
                    rollback_errors.append(f'{name}: {rollback_error}')
            plan.update(status='rollback_incomplete' if rollback_errors else 'rolled_back',
                        error=str(error), rollback_errors=rollback_errors)
            try:
                write_json(backup / 'backup-plan.json', plan)
            except OSError as plan_error:
                rollback_errors.append(f'Could not save rollback status: {plan_error}')
            raise RuntimeError(f'Update failed; {plan["status"]}. Recovery backup: {backup}. {error}') from error
        return {**release, 'action': 'updated', 'target': str(target), 'backup': str(backup),
                'written_files': len(writes), 'removed_unmodified_obsolete_files': deletes,
                'replaced_local_modifications': conflicts,
                'preserved_modified_obsolete_files': preserved_orphans,
                'local_user_files': 'Unmanaged files are preserved; colliding files require explicit replacement.'}
    finally:
        if staging.exists():
            # Only this invocation's newly created staging directory can be removed here.
            if staging.parent != target.parent or not staging.name.startswith('.ui-motion-fusion-incoming-'):
                raise RuntimeError('Unexpected staging path; refusing cleanup')
            shutil.rmtree(staging)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    codex = os.environ.get('CODEX_HOME')
    default = (Path(codex) if codex else Path.home() / '.codex') / 'skills/ui-motion-fusion'
    parser.add_argument('--target', type=Path, default=default)
    parser.add_argument('--update', action='store_true', help='Explicitly update an existing installation')
    parser.add_argument('--replace-modified', action='store_true',
                        help='Explicitly back up and replace listed local changes/collisions')
    parser.add_argument('--backup-root', type=Path, help='Backup folder outside the skills menu; optional')
    args = parser.parse_args()
    try:
        result = install(ROOT, args.target, update=args.update,
                         replace_modified=args.replace_modified, backup_root=args.backup_root)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except (OSError, ValueError, RuntimeError) as error:
        parser.exit(1, str(error) + '\n')

if __name__ == '__main__':
    main()
