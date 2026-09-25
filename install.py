#!/usr/bin/env python3
"""Install this skill without overwriting a user's existing skill directory."""
import argparse
import datetime
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parent
EXCLUDED = {'.git', '.venv', 'node_modules', '__pycache__', '.cache', 'dist', '.hyperframes', 'renders', 'snapshots'}

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--target', type=Path, help='Exact skill directory; use this for WorkBuddy or other clients')
    p.add_argument('--upgrade', action='store_true', help='Back up existing directory, then install the new version')
    p.add_argument('--runtime', action='store_true', help='Also install the isolated rendering environment')
    a = p.parse_args()
    requested = (a.target or Path.home()/'.codex/skills/ui-motion-explainer').expanduser()
    if requested.is_symlink():
        p.error('Refusing a symlink target; choose an actual skill directory.')
    target = requested.resolve()
    if target == ROOT or target in ROOT.parents or ROOT in target.parents:
        p.error('Choose a target outside the downloaded package directory.')
    if target.is_symlink():
        p.error('Refusing a symlink target; choose an actual skill directory.')
    backup = None
    if target.exists():
        if not a.upgrade:
            p.error('Target exists. Review local customizations, then use --upgrade (keeps a complete backup).')
        if not (target/'SKILL.md').is_file():
            p.error('Existing target is not a skill directory; refusing to move it.')
        backup = target.with_name(target.name+'.backup-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'))
        target.rename(backup)
    try:
        shutil.copytree(ROOT, target, ignore=lambda d, names: [n for n in names if n in EXCLUDED or n.startswith('.env')])
    except Exception:
        # Do not erase a partial copy. Restore the old skill in place when possible.
        if target.exists():
            target.rename(target.with_name(target.name+'.incomplete-'+datetime.datetime.now().strftime('%H%M%S-%f')))
        if backup:
            backup.rename(target)
        raise
    print(json.dumps({'installed': str(target), 'backup': str(backup) if backup else None}, ensure_ascii=False))
    if a.runtime:
        subprocess.run([sys.executable, str(target/'scripts/bootstrap.py')], check=True)
    print('Reload your AI client, then invoke ui-motion-explainer. See START-HERE.md.')

if __name__ == '__main__':
    main()
