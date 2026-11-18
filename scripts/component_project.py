"""Build one retained editing-kit component with current episode objects."""
import json
import math
import shutil
import tempfile
from pathlib import Path

from semantic_effects import bind_assets


def build(entry, stage, spec_file, output, root):
    if entry['kind'] != 'component' or entry['execution_state'] != 'direct':
        raise ValueError('Choose a component ID. Other capabilities expose their own build command in inspect.')
    stage, spec_file, output = Path(stage), Path(spec_file), Path(output)
    fragment = stage.read_text(encoding='utf-8-sig')
    spec = json.loads(spec_file.read_text(encoding='utf-8-sig'))
    if not fragment.strip() or not isinstance(spec.get('options'), dict) or not spec['options']:
        raise ValueError('Supply a stage HTML fragment and component options bound to its objects.')
    duration = spec.get('duration')
    if type(duration) not in (int, float) or not math.isfinite(duration) or duration <= 0:
        raise ValueError('Supply a positive duration in seconds.')
    size = {key: spec.get(key, default) for key, default in (('width', 1280), ('height', 720), ('fps', 30))}
    if any(type(value) is not int or value < 1 for value in size.values()):
        raise ValueError('Frame dimensions and fps must be positive integers.')
    if output.exists() or output.is_symlink() or not output.parent.is_dir():
        raise ValueError('Choose a new component project in an existing directory.')
    kit = Path(root) / 'assets/editing-kit'
    palette = json.loads((Path(root) / 'assets/agent-editorial/palette.json').read_text(encoding='utf-8'))
    theme = {'background': palette['paper'], 'surface': palette['white'], 'ink': palette['black'],
             'muted': palette['muted'], 'accent': palette['purple'], 'border': palette['line'],
             'fontFamily': 'Noto, sans-serif', 'radius': 16}
    config = {'id': entry['id'], 'engine': 'html-seek', 'entry': 'index.html', 'fixed_canvas': True,
              'duration': duration, **size}
    with tempfile.TemporaryDirectory(prefix='.component-', dir=output.parent) as temp:
        dest = Path(temp) / 'project'
        dest.mkdir()
        bound = bind_assets(spec, dest, spec_file.resolve().parent)
        bound.update(id=entry['id'], component=entry['original_id'], theme=theme, **size)
        for asset in ('editing-kit.js', 'editing-kit.css', 'project.js'):
            shutil.copy2(kit / asset, dest / asset)
        shutil.copy2(Path(root) / 'assets/qiaomu-fonts/fonts/notosans.woff2', dest / 'Noto.woff2')
        encoded = json.dumps(bound, ensure_ascii=False).replace('<', r'\u003c')
        page = ('<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="stylesheet" href="editing-kit.css">'
                '<style>@font-face{font-family:Noto;src:url(Noto.woff2);font-weight:100 900}body{margin:0}</style>'
                '<main id="stage" class="uek-stage">' + fragment + '</main><script id="binding" type="application/json">'
                + encoded + '</script><script src="editing-kit.js"></script><script src="project.js"></script></html>')
        (dest / 'index.html').write_text(page, encoding='utf-8')
        for name, data in [('component-binding.json', bound), ('library-project.json', config)]:
            (dest / name).write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')
        dest.rename(output)
    return {'project': str(output.resolve()), 'capability': entry['id'], 'duration': duration}
