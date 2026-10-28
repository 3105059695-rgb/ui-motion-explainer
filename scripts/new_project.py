"""Create an explicitly custom workspace or historical demo; full scenes use ui.py scene."""
import argparse
import json
from pathlib import Path
import shutil
import production_entry
import reference_film

ROOT = Path(__file__).resolve().parents[1]


def copy_new_files(pairs, destination):
    """Check all destinations before copying; never overwrite prepared originals."""
    for source, relative in pairs:
        if not source.is_file():
            raise ValueError('Required packaged resource is missing: ' + str(source))
        target = destination / relative
        if target.exists():
            raise ValueError('Refusing to replace an existing file: ' + str(target))
    for source, relative in pairs:
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def create(out, scene=None, title=None, profile=None, base=None, root=ROOT, custom_layout=False, canvas_story=False, reference=None):
    if canvas_story and (scene is not None or not custom_layout):
        raise ValueError('--canvas-story requires --custom-layout and cannot be combined with a historical --scene.')
    if scene is None and not custom_layout:
        raise ValueError(
            'No complete library scene was selected. Use ui.py scene list / inspect / scaffold / build '
            'to inherit an authored design. For intentional custom/source-adaptation work only, '
            'pass --custom-layout; the empty runtime does not supply a visual design.')
    if reference is not None and not canvas_story:
        raise ValueError('--reference requires --custom-layout --canvas-story for actual scene-module loading.')
    reference_spec = reference_film.resolve_record(reference, root) if reference is not None else None
    reference_location = None
    out = Path(out).expanduser().resolve()
    base = Path(base) if base else Path(root) / 'assets/base-skill'
    resolution = production_entry.creation_resolution(out, profile, root=root)
    source = Path(root) / 'assets/fusion-studio'
    if scene is None:
        starter = source / ('story-starter' if canvas_story else 'production-starter')
        pairs = [(path, path.relative_to(starter)) for path in starter.rglob('*') if path.is_file()]
        if not pairs:
            raise ValueError('Production starter is missing.')
        pairs += [(Path(root) / 'assets/editing-kit' / name, Path('lib') / name)
                  for name in ('editing-kit.js', 'editing-kit.css')]
        if canvas_story:
            pairs += [(Path(root) / 'assets/agent-editorial' / name, Path('lib/agent-editorial') / name)
                      for name in ('agent-editorial.js', 'motion-core.js', 'palette.json')]
        if reference_spec:
            reference_location = Path('lib/reference-films') / reference_spec['id'] / Path(reference_spec['implementation']).name
            pairs.append((Path(root) / reference_spec['implementation'], reference_location))
        # Small redistributable Latin font; Chinese uses an installed system font.
        # Do not duplicate the 17 MB demo font or the full font/media libraries.
        pairs += [(base / 'assets/portable-studio/fonts' / name, Path('fonts') / name)
                  for name in ('Outfit-Bold.ttf', 'Outfit-OFL.txt')]
        copy_new_files(pairs, out)
        config = json.loads((out / 'project.json').read_text(encoding='utf-8-sig'))
        config.update(title=title or '待制作工程', styleProfile=resolution['resolved_profile'])
        if reference_spec:
            config['editing_reference'] = {'id': reference_spec['id']}
            entry = out / 'index.html'
            markup = entry.read_text(encoding='utf-8')
            markup = markup.replace('<script src="scenes.js"></script>',
                                    f'<script src="{reference_location.as_posix()}"></script><script src="scenes.js"></script>')
            entry.write_text(markup, encoding='utf-8')
            scenes = out / 'scenes.js'
            with scenes.open('a', encoding='utf-8') as stream:
                stream.write('\n// Registered reference module loaded: ' + reference_spec['id'] +
                             '\n// Author this narration: StoryScenes.myEvent = ArunReference.createScene({kind:..., objects:..., events:...});\n')

    else:
        if scene not in ['all'] + [f'F{i:02}' for i in range(1, 9)]:
            raise ValueError('Unknown historical scene: ' + str(scene))
        pairs = [(path, path.relative_to(source)) for path in source.rglob('*')
                 if path.is_file() and not {'production-starter', 'story-starter', 'previews', 'renders', '__pycache__'} & set(path.relative_to(source).parts)]
        fonts = base / 'assets/portable-studio/fonts'
        pairs += [(path, Path('fonts') / path.relative_to(fonts)) for path in fonts.rglob('*') if path.is_file()]
        copy_new_files(pairs, out)
        for path in out.glob('*.css'):
            text = path.read_text(encoding='utf-8')
            path.write_text(text.replace('../base-skill/assets/portable-studio/fonts/', 'fonts/'), encoding='utf-8')
        config = json.loads((out / 'project.json').read_text(encoding='utf-8-sig'))
        config.update(scene=scene, duration=72 if scene == 'all' else 9, title=title or '历史融合动作示意',
                      mode='fusion', demo=True, styleProfile=resolution['resolved_profile'])
    (out / 'project.json').write_text(json.dumps(config, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    context = production_entry.attach_creation_context(out, resolution, root=root)
    return {'project': str(out), 'kind': ('canvas-story-starter' if canvas_story else 'production-starter') if scene is None else 'historical-demo',
            'scene': scene, 'duration': config['duration'], 'editing_reference': config.get('editing_reference'), **context,
            'next': 'Read README.md; author timeline.json from the preserved narration and actual media.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--scene', choices=['all'] + [f'F{i:02}' for i in range(1, 9)],
                        help='Explicit historical demonstration only.')
    parser.add_argument('--custom-layout', action='store_true',
                        help='Explicit empty runtime for an intentional custom design or source adaptation. '
                             'Normal complete-scene production uses ui.py scene.')
    parser.add_argument('--canvas-story', action='store_true',
                        help='Use the real Agent Editorial Canvas SDK with episode-authored scenes and narration-timed events; requires --custom-layout.')
    parser.add_argument('--reference', help='Registered whole-film editing reference, e.g. arun-membership; requires Canvas Story.')
    parser.add_argument('--title')
    parser.add_argument('--profile')
    parser.add_argument('--base', type=Path, default=ROOT / 'assets/base-skill')
    args = parser.parse_args()
    try:
        result = create(args.out, args.scene, args.title, args.profile, args.base,
                        custom_layout=args.custom_layout, canvas_story=args.canvas_story, reference=args.reference)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main()
