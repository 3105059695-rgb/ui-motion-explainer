"""One local entry point for existing UI video libraries; no installation or updates."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import sys
from resource_registry import ResourceRegistry
import production_entry

ROOT = Path(__file__).resolve().parents[1]


def select_base(explicit=None):
    return ResourceRegistry(ROOT).select_base(explicit)


def command(action, engine=None, base=None, tool=None, forward=(), module_root=None):
    module = 'reference' if action == 'reference' else engine
    if module_root and module not in ('director', 'editorial', 'reference'):
        raise ValueError('--module-root is only supported for director, editorial, and reference; use --base for base/fusion.')
    registry = ResourceRegistry(ROOT, overrides={module: module_root} if module_root else None)
    args = list(forward)
    if args[:1] == ['--']:
        args = args[1:]
    if action == 'direct':
        script = registry.script('semantic-directing', 'direct')
    elif action == 'study':
        script = registry.script('source-study', 'study')
    elif action == 'styles':
        script = registry.script('style-profiles', 'styles')
    elif action == 'reference':
        if tool not in ('toolkit', 'rebuild'):
            raise ValueError('Reference tool must be toolkit or rebuild.')
        script = registry.script('reference', tool)
    elif action in ('new', 'render'):
        if engine == 'fusion':
            if any(a == '--base' or a.startswith('--base=') for a in args):
                raise ValueError('Place --base before -- so the selected base is unambiguous.')
            script = registry.script('fusion', action)
            args = ['--base', str(registry.select_base(base)), *args]
        elif engine == 'base':
            script = registry.select_base(base) / ('scripts/new_project.py' if action == 'new' else 'scripts/render_portable.py')
        elif engine == 'director':
            if base:
                raise ValueError('Director has its own resources and does not accept --base.')
            script = registry.script('director', action)
        elif engine == 'editorial':
            if base:
                raise ValueError('Editorial has its own Remotion template and does not accept --base.')
            if action != 'new':
                raise ValueError('Render editorial projects with their local Remotion scripts; see references/editorial-motion.md.')
            script = registry.script('editorial', 'new')
        else:
            raise ValueError('Choose engine base, fusion, director, or editorial (new only).')
    else:
        raise ValueError('Unknown action.')
    if not script.is_file():
        raise ValueError(f'Local backend is unavailable: {script}. No download or fallback was attempted.')
    return [sys.executable, '-X', 'utf8', str(script), *args]


def status():
    registry = ResourceRegistry(ROOT)
    report = registry.report()
    try:
        base = str(registry.select_base())
    except ValueError:
        base = None
    return {'entry': report['entry'], 'single_entry': True,
            'actual_root': str(ROOT), 'registry': str(registry.path),
            'defaultBase': base, 'available': report['available'],
            'optional_unavailable': report['optional_unavailable'],
            'all_registered_available': report['all_registered_available'],
            'libraries': report['modules'], 'scope': report['scope'],
            'menu_scope': 'single_entry describes this router; menu discovery is checked separately.'}


def guides(guide_id=None):
    """List guide locations without loading or executing their instructions."""
    registry_path = ROOT / 'references/backend-guides.json'
    try:
        data = json.loads(registry_path.read_text(encoding='utf-8-sig'))
    except (OSError, ValueError) as exc:
        raise ValueError(f'Cannot read backend guide registry {registry_path}: {exc}') from exc
    if data.get('schema_version') != 1 or not isinstance(data.get('guides'), list):
        raise ValueError(f'Unsupported backend guide registry schema: {registry_path}')
    selected = data['guides']
    if guide_id is not None:
        selected = [row for row in selected if row.get('id') == guide_id]
        if len(selected) != 1:
            raise ValueError(f'Expected one registered guide for ID {guide_id}; found {len(selected)}.')
    rows = []
    for row in selected:
        if not isinstance(row.get('path'), str):
            raise ValueError(f"Guide {row.get('id')} has no valid path in {registry_path}")
        candidates = [(ROOT / row['path']).expanduser().resolve()]
        # Discovery is relative to the current installation or configured home;
        # an author's absolute workstation paths never enter the public registry.
        homes = [ROOT.parent, Path(os.environ.get('CODEX_HOME', Path.home() / '.codex')) / 'skills',
                 Path.home() / '.agents' / 'skills']
        for name in row.get('discover_skill_names', []):
            if not isinstance(name, str) or Path(name).name != name or name in ('.', '..'):
                raise ValueError('Invalid guide discovery name: ' + str(name))
            candidates.extend(home / name / 'SKILL.md' for home in homes)
        path = next((p for p in candidates if p.is_file()), candidates[0])
        rows.append({**row, 'path': str(path), 'exists': path.is_file(),
                     'candidates': list(dict.fromkeys(str(p) for p in candidates)),
                     'selection_source': 'packaged' if path == candidates[0] else 'installed-optional-guide'})
    return {'entry': 'ui-motion-fusion', 'actual_root': str(ROOT),
            'registry': str(registry_path), 'guides': rows,
            'scope': 'Guide locations and current file presence only; guide text was not loaded or executed. '
                     'Current project and approved style priorities remain unchanged.'}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    sub.add_parser('status', help='Check local resources without installing or rendering.')
    child = sub.add_parser('guides', help='Locate internal technical guides; no instructions are loaded or executed.')
    child.add_argument('--id', dest='guide_id', help='Optional exact backend guide ID.')
    child = sub.add_parser('modules', help='List or check the implementations retained behind this entry.')
    child.add_argument('operation', choices=('list', 'check'), nargs='?', default='list')
    child.add_argument('module', nargs='?', help='Optional exact registry module ID.')
    child = sub.add_parser('direct', help='Prepare narration context, retrieve recipes, or check a semantic plan.')
    child.add_argument('--dry-run', action='store_true')
    child.add_argument('backend_args', nargs=argparse.REMAINDER, help='Director arguments after --')
    child = sub.add_parser('study', help='Read local source-study methods and sentence evidence; text search only.')
    child.add_argument('--dry-run', action='store_true')
    child.add_argument('backend_args', nargs=argparse.REMAINDER, help='Study arguments after --')
    child = sub.add_parser('styles', help='Resolve retained style profiles and their approval evidence.')
    child.add_argument('--dry-run', action='store_true')
    child.add_argument('backend_args', nargs=argparse.REMAINDER, help='Style list/resolve arguments after --')
    for action in ('new', 'render'):
        child = sub.add_parser(action, help=f'Delegate {action} to a selected existing backend.')
        engines = ('base', 'fusion', 'director', 'editorial') if action == 'new' else ('base', 'fusion', 'director')
        child.add_argument('--engine', choices=engines, required=True)
        child.add_argument('--base', type=Path, help='Fix the base version for base/fusion operations.')
        child.add_argument('--module-root', type=Path, help='Explicit local director/editorial module override; packaged modules are the default.')
        if action == 'new':
            child.add_argument('--profile', help='Current registered account profile; historical templates are not automatically restyled.')
            child.add_argument('--script', type=Path, help='Preserved narration used to prepare the new directing context.')
        else:
            child.add_argument('--plan', type=Path, help='Current director plan in the project root; default director-plan.json.')
            child.add_argument('--demo', action='store_true', help='Export a historical demonstration, explicitly not a production deliverable.')
        child.add_argument('--dry-run', action='store_true')
        child.add_argument('backend_args', nargs=argparse.REMAINDER, help='Original backend arguments after --')
    child = sub.add_parser('reference', help='Use the existing per-case reference tools.')
    child.add_argument('--tool', choices=('toolkit', 'rebuild'), required=True)
    child.add_argument('--module-root', type=Path, help='Explicit local reference module override.')
    child.add_argument('--dry-run', action='store_true')
    child.add_argument('backend_args', nargs=argparse.REMAINDER)
    args = parser.parse_args(argv)
    project = resolution = export_report = None
    options = {}
    try:
        if args.action == 'status':
            print(json.dumps(status(), ensure_ascii=False, indent=2))
            return 0
        if args.action == 'guides':
            print(json.dumps(guides(args.guide_id), ensure_ascii=False, indent=2))
            return 0
        if args.action == 'modules':
            report = ResourceRegistry(ROOT).report(args.module)
            print(json.dumps(report, ensure_ascii=False, indent=2))
            return 1 if args.operation == 'check' and not report['available'] else 0
        forwarded = args.backend_args
        if args.action in ('new', 'render') and not any(x in ('--help', '-h') for x in forwarded):
            forwarded, options = production_entry.forwarded_options(
                args.action, forwarded, profile=getattr(args, 'profile', None),
                script=getattr(args, 'script', None), plan=getattr(args, 'plan', None),
                demo=getattr(args, 'demo', False))
            project = production_entry.project_argument(forwarded, args.action)
            if args.action == 'new':
                resolution = production_entry.creation_resolution(project, options['profile'], root=ROOT)
                if options['script'] is not None:
                    options['script'] = options['script'].expanduser().resolve()
                    if not options['script'].is_file() or not options['script'].read_text(encoding='utf-8-sig').strip():
                        raise ValueError('Narration must be an existing nonempty text file.')
                    if args.engine == 'base':
                        forwarded += ['--script', str(options['script'])]
                if args.engine == 'fusion':
                    forwarded += ['--profile', resolution['resolved_profile']]
            else:
                export_report = production_entry.export_check(project, options['plan'], options['demo'], root=ROOT)
        backend_argv = command(args.action, getattr(args, 'engine', None), getattr(args, 'base', None),
                       getattr(args, 'tool', None), forwarded,
                       module_root=getattr(args, 'module_root', None))
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    if args.dry_run:
        print(json.dumps({'argv': backend_argv, 'executed': False, 'export_check': export_report}, ensure_ascii=False, indent=2))
        return 0
    if export_report is not None:
        print(json.dumps(export_report, ensure_ascii=False), flush=True)
    result = subprocess.run(backend_argv, check=False).returncode
    if result == 0 and resolution is not None:
        try:
            # An authored director --plan may declare its account in project.json.
            # Preserve that choice unless this invocation explicitly selected another.
            if options['profile'] is None:
                created_resolution = production_entry.style_registry.resolve(project, root=ROOT)
                if created_resolution.get('status') != 'resolved':
                    raise ValueError('Created project declares an unresolved or conflicting style profile.')
                resolution = created_resolution
            context = production_entry.attach_creation_context(project, resolution, options['script'], root=ROOT)
        except (OSError, ValueError) as exc:
            parser.error('Project was created but current context could not be attached: ' + str(exc))
        print(json.dumps(context, ensure_ascii=False))
    return result


if __name__ == '__main__':
    raise SystemExit(main())
