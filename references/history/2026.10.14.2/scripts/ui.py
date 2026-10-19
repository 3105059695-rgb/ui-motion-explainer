"""One local entry point for existing UI video libraries; no installation or updates."""
import argparse
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT.parent


def select_base(explicit=None):
    candidates = [Path(explicit).expanduser().resolve()] if explicit else [
        SKILLS / 'ui-motion-explainer', ROOT / 'assets/base-skill']
    required = ['scripts/new_project.py', 'scripts/render_portable.py',
                'assets/portable-studio/fonts', 'references/style-system.md']
    for base in candidates:
        if all((base / name).exists() for name in required):
            return base
    raise ValueError('No complete base found. Supply --base with the original skill resources.')


def library(name):
    return SKILLS / name


def command(action, engine=None, base=None, tool=None, forward=()):
    args = list(forward)
    if args[:1] == ['--']:
        args = args[1:]
    if action == 'reference':
        if tool not in ('toolkit', 'rebuild'):
            raise ValueError('Reference tool must be toolkit or rebuild.')
        script = library('prompt-motion-replica') / f'scripts/{tool}.py'
    elif action in ('new', 'render'):
        if engine == 'fusion':
            if any(a == '--base' or a.startswith('--base=') for a in args):
                raise ValueError('Place --base before -- so the selected base is unambiguous.')
            script = ROOT / ('scripts/new_project.py' if action == 'new' else 'scripts/render.py')
            args = ['--base', str(select_base(base)), *args]
        elif engine == 'base':
            script = select_base(base) / ('scripts/new_project.py' if action == 'new' else 'scripts/render_portable.py')
        elif engine == 'director':
            if base:
                raise ValueError('Director has its own resources and does not accept --base.')
            script = library('ai-ui-director') / ('scripts/new_project.py' if action == 'new' else 'scripts/render.py')
        elif engine == 'editorial':
            if base:
                raise ValueError('Editorial has its own Remotion template and does not accept --base.')
            if action != 'new':
                raise ValueError('Render editorial projects with their local Remotion scripts; see references/editorial-motion.md.')
            script = library('editorial-ui-motion') / 'scripts/new_project.py'
        else:
            raise ValueError('Choose engine base, fusion, director, or editorial (new only).')
    else:
        raise ValueError('Unknown action.')
    if not script.is_file():
        raise ValueError(f'Local backend is unavailable: {script}. No download or fallback was attempted.')
    return [sys.executable, '-X', 'utf8', str(script), *args]


def status():
    rows = []
    definitions = [
        ('fusion', ROOT, ['scripts/new_project.py', 'scripts/render.py', 'assets/fusion-studio/project.json']),
        ('base-local', library('ui-motion-explainer'), ['scripts/new_project.py', 'scripts/render_portable.py', 'assets/portable-studio/fonts']),
        ('base-packaged', ROOT / 'assets/base-skill', ['scripts/new_project.py', 'scripts/render_portable.py', 'assets/portable-studio/fonts']),
        ('director', library('ai-ui-director'), ['scripts/new_project.py', 'scripts/render.py', 'references/presets.json']),
        ('reference', library('prompt-motion-replica'), ['scripts/toolkit.py', 'scripts/rebuild.py', 'references/catalog.json']),
        ('editorial', library('editorial-ui-motion'), ['scripts/new_project.py', 'assets/remotion-template/package.json', 'assets/remotion-template/package-lock.json', 'assets/remotion-template/src/index.ts', 'references/template-contract.md']),
        ('adiao-context', library('adiao-series-guide'), ['references/approved-style-20261004.md', 'references/latest-project.json']),
    ]
    for name, folder, required in definitions:
        missing = [item for item in required if not (folder / item).exists()]
        rows.append({'library': name, 'path': str(folder), 'available': not missing, 'missing': missing})
    try:
        base = str(select_base())
    except ValueError:
        base = None
    return {'entry': 'ui-motion-fusion', 'defaultBase': base, 'libraries': rows,
            'scope': 'Local resource presence only; no renderer, network, service, or aesthetic validation.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('status', help='Check local resources without installing or rendering.')
    for action in ('new', 'render'):
        child = sub.add_parser(action, help=f'Delegate {action} to a selected existing backend.')
        engines = ('base', 'fusion', 'director', 'editorial') if action == 'new' else ('base', 'fusion', 'director')
        child.add_argument('--engine', choices=engines, required=True)
        child.add_argument('--base', type=Path, help='Fix the base version for base/fusion operations.')
        child.add_argument('--dry-run', action='store_true')
        child.add_argument('backend_args', nargs=argparse.REMAINDER, help='Original backend arguments after --')
    child = sub.add_parser('reference', help='Use the existing per-case reference tools.')
    child.add_argument('--tool', choices=('toolkit', 'rebuild'), required=True)
    child.add_argument('--dry-run', action='store_true')
    child.add_argument('backend_args', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.action == 'status':
        print(json.dumps(status(), ensure_ascii=False, indent=2))
        return 0
    try:
        argv = command(args.action, getattr(args, 'engine', None), getattr(args, 'base', None),
                       getattr(args, 'tool', None), args.backend_args)
    except ValueError as exc:
        parser.error(str(exc))
    if args.dry_run:
        print(json.dumps({'argv': argv, 'executed': False}, ensure_ascii=False, indent=2))
        return 0
    return subprocess.run(argv, check=False).returncode


if __name__ == '__main__':
    raise SystemExit(main())
