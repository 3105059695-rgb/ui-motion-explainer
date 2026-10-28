"""Shared creation context and production export checks for the public UI entry."""
import argparse
import json
import hashlib
import math
from pathlib import Path
import shutil
import subprocess

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
    prepared = prepared_creation_context(folder)
    if prepared:
        selected = prepared.get('style', {}).get('resolution', {}).get('resolved_profile')
        profile = profile or selected
    result = style_registry.resolve(folder, profile, root=root)
    if (prepared and selected and profile != selected and
            not result.get('unified_production', {}).get('enabled')):
        raise ValueError('Prepared account differs from --profile; refresh context explicitly before creation.')
    if result.get('status') != 'resolved' or not result.get('resolved_profile'):
        raise ValueError('Current style profile could not be resolved: ' + '; '.join(result.get('warnings', [])))
    return result


def prepared_creation_context(project, additional_files=()):
    """Allow only an empty folder or this director's untouched prepare outputs.

    No file is deleted or overwritten. An in-project original is allowed only
    when the context names it and its bytes still match the recorded hash.
    """
    folder = Path(project).resolve()
    if not folder.exists():
        return None
    if not folder.is_dir():
        raise ValueError('Use a new or empty project directory; existing project files are never rewritten.')
    if not any(folder.iterdir()):
        return None
    context_path, brief_path = folder / 'director-context.json', folder / 'director-brief.md'
    error = 'Use a new, empty, or prepare-only project directory; existing project files are never rewritten.'
    try:
        if context_path.is_symlink() or brief_path.is_symlink():
            raise ValueError(error)
        context = json.loads(context_path.read_text(encoding='utf-8-sig'))
        brief = brief_path.read_text(encoding='utf-8-sig').splitlines()
        if context.get('generated_by') != director.OWNER or not brief or brief[0] != director.MARKER \
                or Path(context.get('project', '')).resolve() != folder:
            raise ValueError(error)
        source = context['source']
        source_path = Path(source['path']).resolve()
        if hashlib.sha256(source_path.read_bytes()).hexdigest() != source['sha256']:
            raise ValueError('Prepared narration changed; refresh its context before creating this project.')
        allowed = {context_path, brief_path}
        allowed.update(Path(item).resolve() for item in additional_files
                       if Path(item).resolve().is_relative_to(folder))
        if source_path.is_relative_to(folder):
            allowed.add(source_path)
        allowed_dirs = {parent for path in allowed for parent in path.parents if parent.is_relative_to(folder)}
        for path in folder.rglob('*'):
            if path.is_symlink() or (hasattr(path, 'is_junction') and path.is_junction()):
                raise ValueError(error)
            if path.is_dir():
                if path not in allowed_dirs:
                    raise ValueError(error)
            elif path not in allowed:
                raise ValueError(error)
        return context
    except (OSError, KeyError, TypeError, json.JSONDecodeError) as exc:
        raise ValueError(error) from exc


def attach_creation_context(project, resolution, script=None, root=ROOT):
    """Mark a newly created backend project, without changing its historical CSS."""
    folder = Path(project).resolve()
    if not folder.is_dir():
        raise ValueError('Backend did not create the requested project directory: ' + str(folder))
    config_path = folder / 'project.json'
    config = (json.loads(config_path.read_text(encoding='utf-8-sig')) if config_path.exists()
              else {'generated_by': OWNER})
    is_starter = config.get('runtime') == 'fusion-production-v1'
    status = {
        # Retain an authored legacy tag as metadata; resolution/binding governs design.
        'styleProfile': config.get('styleProfile', resolution['resolved_profile']),
        'production_status': 'unmade-awaiting-authored-timeline' if is_starter else 'mechanism-demo-awaiting-narration-directed-design',
        'current_style_applied': False,
        'aestheticApproval': False,
        'style_context': 'project-style-context.json',
    }
    context = {
        'schema_version': 1, 'generated_by': OWNER, **status,
        'style': {'resolution': resolution, 'binding': style_registry.current_binding(resolution)},
        'next': 'ui.py direct -- prepare --script <narration> --project <project>',
        'scope': ('Empty production workspace wired to the existing EditingKit. No narration, scene, media or approval is invented.'
                  if is_starter else 'Current style references only. The copied historical demo has not been restyled or approved.'),
    }
    target = folder / 'project-style-context.json'
    if target.exists():
        old = json.loads(target.read_text(encoding='utf-8-sig'))
        if old.get('generated_by') != OWNER:
            raise ValueError('Refusing to replace existing project style context: ' + str(target))
    config.update(status)
    config_path.write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    target.write_text(json.dumps(context, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    existing = folder / 'director-context.json'
    prepared = existing.is_file()
    if script is not None:
        if prepared:
            old = json.loads(existing.read_text(encoding='utf-8-sig'))
            if old.get('generated_by') != director.OWNER or old.get('source', {}).get('sha256') != hashlib.sha256(Path(script).read_bytes()).hexdigest():
                raise ValueError('Prepared context names another narration; no existing context or original was replaced.')
        else:
            director.prepare(script, folder, resolution['resolved_profile'], root=root)
        prepared = True
    return {'project': str(folder), **status, 'context': str(target),
            'director_context_prepared': prepared}


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
    import scene_plan
    scene_route = scene_plan.is_scene_plan(json.loads(selected.read_text(encoding='utf-8-sig')))
    marker = folder / 'project-style-context.json'
    if marker.is_file():
        context = json.loads(marker.read_text(encoding='utf-8-sig'))
        if context.get('generated_by') == OWNER:
            config_path = folder / 'project.json'
            config = json.loads(config_path.read_text(encoding='utf-8-sig')) if config_path.is_file() else {}
            if config.get('current_style_applied') is not True:
                raise ValueError('Production export blocked: the current visual direction is not yet marked as applied to this project. '
                                 'Apply the current direction to the actual project first, then explicitly set '
                                 'project.json current_style_applied=true. This declaration is not automatic visual approval.')
    report = director.check(selected, root=root)
    if report.get('production_ready') is not True:
        reasons = [*report.get('errors', []), *report.get('readiness_blockers', [])]
        if report.get('current_style_ready') is not True:
            reasons.append('Current style binding/reference readiness is not established.')
        if report.get('selection_ready') is not True:
            reasons.append('Current narration selection, coverage and runtime implementation evidence is not established.')
        raise ValueError('Production export blocked: ' + '; '.join(dict.fromkeys(reasons)))
    evidence = report.get('selection_evidence', {})
    entry = evidence.get('entrypoint', {})
    if not isinstance(entry, dict) or not isinstance(entry.get('path'), str) \
            or (folder / entry['path']).resolve() != folder / 'index.html':
        raise ValueError('Production export must bind this renderer\'s actual project/index.html entry, not a separate demonstration or evidence-only entry.')
    config_path = folder / 'project.json'
    config = json.loads(config_path.read_text(encoding='utf-8-sig')) if config_path.is_file() else {}
    plan_data = json.loads(selected.read_text(encoding='utf-8-sig'))
    planned_sounds = plan_data.get('sound_events', [])
    if not scene_route and config.get('sceneRuntime') != 'canvas-story-v1':
        if config.get('sound_events', []) != planned_sounds:
            raise ValueError('Export project.sound_events must match the sound events in the plan and bound timeline.')
    elif scene_route and planned_sounds:
        raise ValueError('Event audio is supported by the portable renderer; complete-scenes needs its native audio implementation, not ignored sound_events.')
    duration = (json.loads((folder / 'macro_plan.json').read_text(encoding='utf-8-sig')).get('durationSeconds')
                if scene_route else config.get('duration'))
    if type(duration) not in (int, float) or not math.isfinite(duration) \
            or duration != evidence.get('duration_seconds'):
        raise ValueError('Production project.json duration must match the bound runtime timeline and delivery duration.')
    return {'export_mode': 'production', 'production_export': True,
            'backend': scene_plan.BACKEND if scene_route else 'existing-renderer', 'plan': str(selected),
            'plan_sha256': hashlib.sha256(selected.read_bytes()).hexdigest(),
            'render_ready': True, 'current_style_ready': True, 'selection_ready': True,
            'preflight_ready': True, 'assessment': report.get('assessment'),
            'production_ready': True, 'selection_evidence': evidence,
            'scope': report.get('scope'), 'style_readiness_scope': report.get('style_readiness_scope'),
            'notice': 'Technical preflight passed only. No effect execution, semantic fit, rendered style, audio review or delivery approval is established.'}


def verify_output(project, media, plan=None, root=ROOT, ffprobe=None, expected_plan_sha256=None):
    """Recheck preflight and inspect real export metadata; never certify aesthetics.

    The caller supplies the actual renderer output path. No media is generated,
    installed, uploaded or modified; ffprobe must already be available locally.
    """
    preflight = export_check(project, plan=plan, root=root)
    errors = []
    output = Path(media).expanduser().resolve()
    report = {'technical_passed': False, 'errors': errors, 'media': {'path': str(output)},
              'plan_sha256': preflight['plan_sha256'],
              'traceability': preflight['selection_evidence']['ledger'],
              'backend': preflight.get('backend', 'existing-renderer'),
              'aesthetic_approval': False, 'full_realtime_av_review': False,
              'scope': 'Actual exported file hash, ffprobe streams/duration, and unchanged plan/source/implementation bindings. '
                       'No visual suitability, rendered-marker execution, listening or aesthetic approval is inferred.'}
    current_plan = json.loads(Path(preflight['plan']).read_text(encoding='utf-8-sig'))
    report['source_bindings'] = {
        'narration': current_plan.get('source'), 'audio': current_plan.get('timing', {}).get('audio_source'),
        'alignment_sha256': current_plan.get('timing', {}).get('alignment_sha256'),
        'build_receipt_sha256': preflight['selection_evidence'].get('build_receipt_sha256'),
    }
    if expected_plan_sha256 is not None and preflight['plan_sha256'] != expected_plan_sha256:
        errors.append('Plan changed after render preflight; this export cannot be attributed to the newly edited plan.')
        return report
    if not output.is_file() or not output.stat().st_size:
        errors.append('Actual rendered media file is missing or empty.')
        return report
    report['media'].update(sha256=hashlib.sha256(output.read_bytes()).hexdigest(), bytes=output.stat().st_size)
    executable = str(ffprobe) if ffprobe is not None else shutil.which('ffprobe')
    if not executable:
        errors.append('Existing ffprobe is unavailable; actual media verification remains incomplete. No tool was installed.')
        return report
    try:
        completed = subprocess.run([executable, '-v', 'error', '-show_format', '-show_streams',
                                    '-of', 'json', str(output)], capture_output=True, text=True,
                                   encoding='utf-8', check=False, timeout=60)
        if completed.returncode:
            raise ValueError('ffprobe could not inspect the exported media: ' + completed.stderr.strip()[:500])
        facts = json.loads(completed.stdout)
        duration = float(facts.get('format', {}).get('duration'))
        if not math.isfinite(duration) or duration <= 0:
            raise ValueError('Export duration must be finite and positive.')
        streams = facts.get('streams', [])
        if not isinstance(streams, list):
            raise ValueError('ffprobe streams must be an array.')
        report['media'].update(duration_seconds=duration,
            streams=[{key: stream.get(key) for key in ('codec_type', 'codec_name', 'width', 'height', 'duration', 'avg_frame_rate')}
                     for stream in streams if isinstance(stream, dict)])
        if not any(stream.get('codec_type') == 'video' for stream in streams if isinstance(stream, dict)):
            errors.append('Export has no video stream.')
        if not any(stream.get('codec_type') == 'audio' for stream in streams if isinstance(stream, dict)):
            errors.append('Narrated production export has no audio stream.')
        expected = preflight['selection_evidence']['duration_seconds']
        if abs(duration - expected) > 0.12:
            errors.append(f'Export duration {duration:g}s does not match mapped delivery {expected:g}s (tolerance 0.12s).')
        for stream in streams:
            if isinstance(stream, dict) and stream.get('codec_type') in ('video', 'audio') and stream.get('duration') not in (None, 'N/A'):
                stream_duration = float(stream['duration'])
                if not math.isfinite(stream_duration) or abs(stream_duration - expected) > 0.12:
                    errors.append(f"Export {stream['codec_type']} stream duration does not cover the mapped delivery (tolerance 0.12s).")
    except (OSError, ValueError, TypeError, subprocess.TimeoutExpired) as exc:
        errors.append(str(exc))
    report['technical_passed'] = not errors
    return report
