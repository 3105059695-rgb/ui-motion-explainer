"""Shared creation context and production export checks for the public UI entry."""
import argparse
import json
from pathlib import Path

import director
import style_registry

ROOT = Path(__file__).resolve().parents[1]
OWNER = 'ui-motion-fusion/production-entry-v1'


def forwarded_options(action, args, profile=None, script=None, plan=None, demo=False):
    """Consume public-entry options; never pass them to historical renderers."""
    values = list(args)
    if values[:1] == ['--']:
        values.pop(0)
    parser = argparse.ArgumentParser(add_help=False, allow_abbrev=False)
    if action == 'new':
        parser.add_argument('--profile')
        parser.add_argument('--script', type=Path)
    else:
        parser.add_argument('--plan', type=Path)
        parser.add_argument('--demo', action='store_true')
    found, remaining = parser.parse_known_args(values)
    options = {'profile': profile, 'script': script, 'plan': plan, 'demo': demo}
    for key, value in vars(found).items():
        if value:
            if options[key] and options[key] != value:
                raise ValueError('Conflicting --' + key + ' options before and after --.')
            options[key] = value
    return remaining, options


def project_argument(args, action):
    parser = argparse.ArgumentParser(add_help=False, allow_abbrev=False)
    name = '--out' if action == 'new' else '--project'
    parser.add_argument(name, required=True, type=Path)
    selected, _ = parser.parse_known_args(args)
    return getattr(selected, name[2:]).expanduser().resolve()


def creation_resolution(project, profile=None, root=ROOT):
    folder = Path(project).resolve()
    if folder.exists() and (not folder.is_dir() or any(folder.iterdir())):
        raise ValueError('Use a new or empty project directory; existing project files are never rewritten.')
    result = style_registry.resolve(folder, profile, root=root)
    if result.get('status') != 'resolved' or not result.get('resolved_profile'):
        raise ValueError('Current style profile could not be resolved: ' + '; '.join(result.get('warnings', [])))
    return result


def attach_creation_context(project, resolution, script=None, root=ROOT):
    """Mark a newly created backend project, without changing its historical CSS."""
    folder = Path(project).resolve()
    if not folder.is_dir():
        raise ValueError('Backend did not create the requested project directory: ' + str(folder))
    status = {
        'styleProfile': resolution['resolved_profile'],
        'production_status': 'mechanism-demo-awaiting-narration-directed-design',
        'current_style_applied': False,
        'aestheticApproval': False,
        'style_context': 'project-style-context.json',
    }
    context = {
        'schema_version': 1, 'generated_by': OWNER, **status,
        'style': {'resolution': resolution, 'binding': style_registry.current_binding(resolution)},
        'next': 'ui.py direct -- prepare --script <narration> --project <project>',
        'scope': 'Current style references only. The copied historical demo has not been restyled or approved.',
    }
    target = folder / 'project-style-context.json'
    if target.exists():
        old = json.loads(target.read_text(encoding='utf-8-sig'))
        if old.get('generated_by') != OWNER:
            raise ValueError('Refusing to replace existing project style context: ' + str(target))
    config_path = folder / 'project.json'
    config = (json.loads(config_path.read_text(encoding='utf-8-sig')) if config_path.exists()
              else {'generated_by': OWNER})
    config.update(status)
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    target.write_text(json.dumps(context, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if script is not None:
        director.prepare(script, folder, resolution['resolved_profile'], root=root)
    return {'project': str(folder), **status, 'context': str(target),
            'director_context_prepared': script is not None}


def export_check(project, plan=None, demo=False, root=ROOT):
    folder = Path(project).expanduser().resolve()
    if demo:
        if plan is not None:
            raise ValueError('--demo and --plan are mutually exclusive; choose a demonstration or production export.')
        return {'export_mode': 'demo', 'production_export': False,
                'notice': 'Historical demonstration export only; not a current-style production deliverable.'}
    selected = Path(plan).expanduser() if plan is not None else folder / 'director-plan.json'
    if not selected.is_absolute():
        selected = folder / selected
    selected = selected.resolve()
    # director.check resolves media and project declarations from the plan folder.
    # A valid plan from another project must never authorize this project's render.
    if selected.parent != folder:
        raise ValueError('Production --plan must be stored in the rendered project root so its context and media resolve to this project.')
    if not selected.is_file():
        raise ValueError('Production director plan is missing: ' + str(selected) +
                         '. Prepare and author the current plan first; use --demo only for historical demonstrations.')
    marker = folder / 'project-style-context.json'
    if marker.is_file():
        context = json.loads(marker.read_text(encoding='utf-8-sig'))
        if context.get('generated_by') == OWNER:
            config_path = folder / 'project.json'
            config = json.loads(config_path.read_text(encoding='utf-8-sig')) if config_path.is_file() else {}
            if config.get('current_style_applied') is not True:
                raise ValueError('Production export blocked: this project is still marked as an unstyled historical demo. '
                                 'Apply the current direction to the actual project first, then explicitly set '
                                 'project.json current_style_applied=true. This declaration is not automatic visual approval.')
    report = director.check(selected, root=root)
    if not (report.get('render_ready') is True and report.get('current_style_ready') is True):
        reasons = [*report.get('errors', []), *report.get('readiness_blockers', [])]
        if report.get('current_style_ready') is not True:
            reasons.append('Current style binding/reference readiness is not established.')
        raise ValueError('Production export blocked: ' + '; '.join(dict.fromkeys(reasons)))
    return {'export_mode': 'production', 'production_export': True, 'plan': str(selected),
            'render_ready': True, 'current_style_ready': True,
            'scope': report.get('scope'), 'style_readiness_scope': report.get('style_readiness_scope'),
            'notice': 'Plan and current references passed; rendered appearance and audio still require review.'}
