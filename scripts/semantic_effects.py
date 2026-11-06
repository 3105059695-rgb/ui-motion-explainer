"""Executable O/R bindings and original X timelines; no media generation/downloads."""
from __future__ import annotations

import argparse
import colorsys
import hashlib
import html
import importlib.util
import json
from pathlib import Path
import re
import shutil
import sys

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/semantic-motion'
MANIFEST = ASSETS / 'manifest.json'


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def entries():
    return read_json(MANIFEST)['effects']


def inspect(effect):
    entry = next((e for e in entries() if e['id'] == effect), None)
    if not entry:
        raise ValueError('Unknown effect: ' + effect)
    result = {**entry, 'runtime_path': str(ASSETS / 'semantic-motion.js'),
              'gallery_path': str(ASSETS / 'index.html'),
              'production_binding_required': True,
              'is_user_approved_new_implementation': False}
    if entry['kind'] == 'source-timeline':
        result['source_path'] = str(ROOT / entry['source_path'])
        slots = ASSETS / 'source-slots.json'
        if slots.exists():
            result['slots'] = read_json(slots).get(effect, [])
    return result


def theme_source(source):
    """Palette-only adaptation. All original DOM/GSAP transforms/timing stay intact."""
    def purple(value):
        r, g, b = (int(value[i:i+2], 16) / 255 for i in (1, 3, 5))
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        return .65 < h < .91 and s > .12
    # Purple foreground on white becomes legible near-black; accent surfaces use A.
    source = re.sub(r"(?<![\w-])(color\s*:\s*['\"]?)(#[0-9a-fA-F]{6})",
                    lambda m: m[1] + ('#0B0B0F' if purple(m[2]) else m[2]), source)
    def repl(m):
        value = m[0]
        if not purple(value):
            return value
        r, g, b = (int(value[i:i+2], 16) / 255 for i in (1, 3, 5))
        _, light, sat = colorsys.rgb_to_hls(r, g, b)
        if light > .88:
            return '#F3F3F5'
        if light < .3:
            return '#0B0B0F'
        if sat < .23:
            return '#777780'
        return '#D6C2FF'
    return re.sub(r'#[0-9a-fA-F]{6}\b', repl, source)


def source_spec(entry, bindings=None):
    return {k: entry[k] for k in ('id', 'kind', 'source_range', 'source_group', 'scene_selector', 'width', 'height')} | {'bindings': bindings or {}}


def build_source_html(entry, bindings=None, asset_prefix=None, bridge='source-bridge.js', manifest=None):
    source = (ROOT / entry['source_path']).read_text(encoding='utf-8')
    source = theme_source(source)
    # Narration is source-specific, never silently reuse it in a new episode.
    source = re.sub(r'<audio\b.*?</audio>', '', source, flags=re.S | re.I)
    if asset_prefix:
        source = source.replace('assets/', asset_prefix.rstrip('/') + '/')
    inject = ''
    if manifest:
        inject += '<script src="' + manifest + '"></script>'
    else:
        encoded = json.dumps(source_spec(entry, bindings), ensure_ascii=False).replace('</', '<\\/')
        inject += '<script>window.SemanticSourceSpec=' + encoded + ';</script>'
    inject += '<script src="' + bridge + '"></script>'
    return source.replace('</body>', inject + '</body>')


def build_gallery_sources():
    folder = ASSETS / 'source-timelines'
    folder.mkdir(exist_ok=True)
    groups = {}
    for e in entries():
        if e['kind'] == 'source-timeline':
            groups.setdefault(e['source_group'], e)
    for group, entry in groups.items():
        # Paths retain original local bundles rather than multiplying dependencies.
        prefix = '../../../' + str(Path(entry['source_path']).parent / 'assets').replace('\\', '/')
        (folder / (group + '.html')).write_text(build_source_html(entry, asset_prefix=prefix,
            bridge='../source-bridge.js', manifest='../manifest.js'), encoding='utf-8')
    return {'groups': list(groups), 'directory': str(folder)}


def copy_file(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def bind_assets(bindings, out, base):
    result = json.loads(json.dumps(bindings))
    for asset in result.get('media', {}).values():
        src = asset.get('src')
        if not src:
            raise ValueError('Each media binding needs src')
        if re.match(r'https?://', src):
            raise ValueError('Use a downloaded local asset so the materialized project is portable: ' + src)
        path = Path(src)
        if not path.is_absolute():
            path = base / path
        if not path.is_file():
            raise ValueError('Missing bound media: ' + str(path))
        name = digest(path)[:12] + path.suffix.lower()
        copy_file(path, out / 'media' / name)
        asset['src'] = 'media/' + name
    return result


def materialize(effect, output, bindings_path=None, stage=None, duration=None, demo=False):
    entry = inspect(effect)
    out = Path(output).resolve()
    if out.exists() and any(out.iterdir()):
        raise ValueError('Output must be new or empty; no existing project is overwritten: ' + str(out))
    raw = read_json(bindings_path) if bindings_path else {}
    if not demo and not bindings_path:
        raise ValueError('Production requires --bindings; use --demo only for explicit demonstration content')
    if entry['kind'] != 'source-timeline' and not demo and not stage:
        raise ValueError('O/R actions bind existing objects: provide --stage HTML and --bindings JSON')
    out.mkdir(parents=True, exist_ok=True)
    bindings = bind_assets(raw, out, Path(bindings_path).resolve().parent if bindings_path else ROOT)
    if entry['kind'] == 'source-timeline':
        # Duplicate only referenced small code/font assets; no previews or runtimes.
        origin = Path(entry['source_path']).parent
        source_text = (origin / 'index.html').read_text(encoding='utf-8')
        refs = set(re.findall(r'(?:src=["\']|url\(["\']?)(assets/[^"\')\s>]+)', source_text))
        for ref in refs:
            if Path(ref).suffix.lower() in {'.wav', '.mp3', '.mp4', '.gif'}:
                continue
            source = origin / ref
            if source.is_file():
                copy_file(source, out / ref)
        for license_file in origin.rglob('*'):
            if license_file.is_file() and ('license' in license_file.name.lower() or license_file.name.lower() == 'provenance.json'):
                copy_file(license_file, out / 'source-provenance' / license_file.relative_to(origin))
        copy_file(ASSETS / 'source-bridge.js', out / 'source-bridge.js')
        (out / 'index.html').write_text(build_source_html(entry, bindings), encoding='utf-8')
        length = entry['source_range'][1] - entry['source_range'][0]
        if duration is not None and abs(duration-length) > .00001:
            raise ValueError('X preserves the complete original timeline. Bind at source duration; retiming is not implicit.')
        source_hash = digest(origin / 'index.html')
        runtime = 'original-gsap-timeline'
    else:
        length = duration if duration is not None else float(bindings.get('duration', 6))
        if not length > 0:
            raise ValueError('duration must be positive')
        for name in ('semantic-motion.js', 'theme.css', 'host.js'):
            copy_file(ASSETS / name, out / name)
        spec = {'effect': effect, 'duration': length, 'demo': demo, **bindings}
        spec.update(effect=effect, duration=length, demo=demo)
        if demo:
            copy_file(ASSETS / 'demo-fixtures.js', out / 'demo-fixtures.js')
            for file in ({'O30': ['style-film/current-style-full.mp4'],
                          'R06': ['approved-girl-sample/assets/manual-v2.mp4', 'approved-girl-sample/assets/takeover.mp4',
                                  'approved-girl-sample/assets/handoff.mp4']}.get(effect, [])):
                copy_file(ROOT / 'assets' / file, out / 'sources' / file)
            body = ''
        else:
            body = Path(stage).read_text(encoding='utf-8')
            if re.search(r'<(?:html|body)\b', body, flags=re.I):
                raise ValueError('--stage is an HTML fragment with existing bound objects, not another whole document')
        encoded = json.dumps(spec, ensure_ascii=False).replace('</', '<\\/')
        page = '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>' + html.escape(effect) + ' bound motion</title><link rel="stylesheet" href="theme.css"><style>body{margin:0}nav{position:fixed;bottom:0;padding:8px;background:#eee;z-index:100000}#stage{transform-origin:0 0}</style><div id="stage" class="sm-stage">' + body + '</div><nav><button id="play">播放</button><input id="time" type="range" min="0" step=".01" value="0"><span id="time-label"></span></nav><script>window.SemanticHostSpec=' + encoded + ';window.SemanticMediaBase="sources";</script><script src="semantic-motion.js"></script>'
        if demo:
            page += '<script src="demo-fixtures.js"></script>'
        page += '<script src="host.js"></script></html>'
        (out / 'index.html').write_text(page, encoding='utf-8')
        source_hash = digest(ASSETS / 'semantic-motion.js')
        runtime = 'parameterized-existing-dom-svg'
    record = {'effect': effect, 'runtime': runtime, 'duration': length,
              'source_sha256': source_hash, 'demo_content': demo,
              'entry': 'index.html', 'seek_api': 'await window.ready(); await window.render(localSeconds)',
              'current_palette': 'A', 'user_approval': 'not-inferred',
              'source_range': entry.get('source_range'), 'no_private_asset_dependency': True}
    write_json(out / 'motion-binding.json', record)
    return {**record, 'project': str(out), 'html': str(out / 'index.html')}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('list')
    p = sub.add_parser('inspect'); p.add_argument('id')
    p = sub.add_parser('materialize'); p.add_argument('--id', required=True); p.add_argument('--out', required=True)
    p.add_argument('--bindings'); p.add_argument('--stage'); p.add_argument('--duration', type=float); p.add_argument('--demo', action='store_true')
    sub.add_parser('build-gallery-sources')
    p = sub.add_parser('check'); p.add_argument('--out')
    args = parser.parse_args(argv)
    try:
        if args.command == 'list':
            result = {'count': len(entries()), 'effects': entries()}
        elif args.command == 'inspect':
            result = inspect(args.id)
        elif args.command == 'build-gallery-sources':
            result = build_gallery_sources()
        elif args.command == 'check':
            test_spec = importlib.util.spec_from_file_location('semantic_browser_check', ROOT / 'tests/check_semantic_motion_browser.py')
            module = importlib.util.module_from_spec(test_spec); test_spec.loader.exec_module(module)
            result = module.run(args.out)
            print(json.dumps({'passed': result['passed'], 'passed_count': result['passed_count'], 'effects_checked': result['effects_checked']}, ensure_ascii=False))
            return 0 if result['passed'] else 1
        else:
            result = materialize(args.id, args.out, args.bindings, args.stage, args.duration, args.demo)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 0
    except (ValueError, OSError, KeyError) as exc:
        print(json.dumps({'ok': False, 'error': str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
