"""Resolve a shot's art direction and moving comparison from this installation."""
import json
import os
from pathlib import Path
import shutil
import tempfile
from urllib.parse import quote, urlencode

from resource_inventory import load_overlay, resource_fact
from video_sources import ROOT, read


DIRECTION = 'assets/reference-edits/direction.json'
PALETTE = 'assets/agent-editorial/palette.json'
BODY = 'assets/style-calibration/approved-body/motion.mp4'
DESIGN = 'references/aesthetic-preferences.md'
GIRL = 'assets/approved-girl-sample/'
FANGMU = 'assets/retained-expressions/fangmu-token/'
RECON = 'assets/modules/reference/assets/reconstructions/'

# Each link names what it demonstrates. Only source clips use the original film's clock.
STUDIES = {
    'body': (BODY, '本来源正文源码连续节选 · 包装与动作'),
    'girl': (GIRL + 'output/preview.mp4', '本来源公开样片 · 角色动作与交接'),
    'lift': (GIRL + 'assets/manual-v2.mp4', '本来源公开动作素材 · 搬运'),
    'takeover': (GIRL + 'assets/takeover.mp4', '本来源公开动作素材 · 接管'),
    'handoff': (GIRL + 'assets/handoff.mp4', '公开动作素材 · 递出、接住与使用'),
    'mask': ('assets/semantic-motion/study.html?source=local-video-5c2f8b41&steps=R05', '本来源手法重演 · 物件展开成遮罩'),
    'a01': ('assets/base-skill/assets/approved-demo/preview.mp4', '本来源公开样片 · 材料汇合与交付'),
    'car': (FANGMU + 'car.html?demo=1', '本来源保留工程 · 整物到零件'),
    'opening': (FANGMU + 'opening.html?demo=1', '本来源保留工程 · 示意人物与开场构图'),
    'material': (FANGMU + 'material.html?demo=1', '本来源保留工程 · 物件旁注'),
    'full': (FANGMU + 'full.html?demo=1', '本来源保留工程 · 人物到正文'),
    'adiao': ('assets/retained-expressions/adiao-unemployment-opening/index.html?demo=1', '本来源保留工程 · 示意人物与手势留白'),
    'product': (RECON + 'notdwd-7de38a/index.html', '本来源公开重演 · 图标过渡到实际功能'),
    'cover': (RECON + 'brainextends-e19ac3/index.html', '本来源公开重演 · 封面进入播放器'),
    'depth': (RECON + 'aschapmann-131210/index.html', '本来源公开重演 · 多层信息面')
}


def surfaces(direction, slots):
    result = {key: 'native' for key in slots}
    for role in ('paper', 'window', 'headline', 'caption', 'focus', 'query'):
        for key in direction.get(role, []):
            if key not in slots or result[key] != 'native':
                raise ValueError('Unknown or duplicate visual role: ' + key)
            result[key] = role
    return result


def portable_reference(root, direction):
    study = direction['study']
    if study in STUDIES:
        path, label = STUDIES[study]
        return {'path': path, 'label': label}
    film = read(root, 'assets/style-film/manifest.json')
    chapter = next(c for c in film['chapters'] if c['id'] == study)
    return {'path': 'assets/style-film/' + film['movie'], 'range': [chapter['start'], chapter['end']],
            'label': '同类手法对照 · 正文源码重绘《' + chapter['label'] + '》'}


def source_reference(root, source, direction, overlay=None):
    resource = source.get('source_resource_id')
    if 'source_resource_id' not in source and not source.get('clip'):
        # Also resolve projects prepared by earlier releases.
        atlas = read(root, 'references/reference-atlas.json')['videos']
        resource = next((row.get('source_resource_id') for row in atlas if row['id'] == source['source_id']), None)
    if resource or source.get('clip'):
        fact = resource_fact(resource, source.get('clip'), root, overlay=overlay)
        path = Path(fact['path']) if fact['usable_file'] else None
        if path and path.suffix.lower() in ('.mp4', '.webm', '.mov', '.m4v'):
            item = {'path': str(path.relative_to(root)) if path.is_relative_to(root) else str(path),
                    'label': '本来源原视频'}
            loc = source.get('locator', {})
            if 'start' in loc and 'end' in loc:
                item['range'] = [loc['start'], loc['end']]
            elif source.get('motion_evidence', {}).get('approved_ranges'):
                item['range'] = source['motion_evidence']['approved_ranges'][0]
            return item
    fallback = portable_reference(root, direction)
    if direction['study'] not in STUDIES or source['source_id'] in ('photographic-transfer', 'interview-k'):
        capability = source.get('capability', '')
        family, _, ident = capability.partition(':')
        steps = direction.get('steps')
        if not steps and family in ('method', 'recipe'):
            steps = read(root, 'assets/method-runtime/programs.json')['programs'].get(ident)
        if steps:
            url = 'assets/semantic-motion/study.html?' + urlencode({'source':source['source_id'], 'steps':','.join(steps)})
            return {'path':url, 'label':'本来源手法连续重演 · 示意素材与时长'}
    return fallback


def program_examples(root, capability):
    """Use the registered method's own programs, including all sequential phases."""
    family, _, ident = capability.partition(':')
    if family not in ('method', 'recipe'):
        return []
    programs = read(root, 'assets/method-runtime/programs.json')['programs']
    effects = {e['id']: e for e in read(root, 'assets/semantic-motion/manifest.json')['effects']}
    examples = []
    for phase, key in enumerate(programs.get(ident, []), 1):
        effect = effects[key]
        path = ('assets/semantic-motion/source-timelines/' + effect['source_group'] + '.html?effect=' + key + '&controls=1'
                if effect['kind'] == 'source-timeline' else 'assets/semantic-motion/study.html?steps=' + key)
        examples.append({'path':path, 'label': f'{ident} 手法第 {phase} 步 · {effect["title"]}'})
    return examples


def file_url(path, base):
    try:
        setting = Path(os.path.relpath(path, base)).as_posix()
    except ValueError:  # Separate Windows volumes
        return Path(path).as_uri()
    return quote(setting, safe='/')


def player_item(root, item, url_for):
    name, _, query = item['path'].partition('?')
    path = (root / name).resolve(strict=True)
    return {k: v for k, v in item.items() if k != 'path'} | {
        'url': url_for(path) + ('?' + query if query else ''),
        'kind': 'html' if path.suffix.lower() == '.html' else 'video'}


def review_page(project, media, root, url_for):
    from reference_edits import RECIPES, digest, read as local_read
    from video_sources import Catalog
    from video_routing import _evidence
    root, project, media = Path(root).resolve(), Path(project).resolve(), Path(media).resolve()
    timeline = local_read(project / 'reference-timeline.json')
    receipt = local_read(project / 'reference-render.json')
    if receipt['sha256'] != digest(media) or receipt['timeline_sha256'] != digest(project / 'reference-timeline.json'):
        raise ValueError('Choose the encoded film matching this project’s render receipt.')
    catalog = Catalog(root)
    recipes = read(root, RECIPES)['recipes']
    directions, overlay = read(root, DIRECTION), load_overlay(root)
    anchor = player_item(root, portable_reference(root, {'study':'body'}), url_for)
    shots = []
    for shot in timeline['shots']:
        key = shot['id']
        row = catalog.lookup(key)
        use = next(u for u in row['uses'] if u['capability'] == recipes[key]['capability'])
        source = {'source_id': key, 'capability': recipes[key]['capability'], 'clip': row.get('media'), 'locator': _evidence(row, use),
                  'source_resource_id': row.get('atlas', {}).get('source_resource_id'),
                  'motion_evidence': {'approved_ranges': row.get('atlas', {}).get('approved_ranges', [])}}
        ref = source_reference(root, source, directions[key], overlay)
        examples = program_examples(root, recipes[key]['capability'])
        shots.append({'title': row['title'], 'start': shot['start']/timeline['fps'], 'end': shot['end']/timeline['fps'],
                      'quote': shot['quote'], 'watch': directions[key]['watch'],
                      'action': recipes[key]['action'], 'reference': player_item(root, ref, url_for),
                      'steps': [player_item(root, example, url_for) for example in examples]})
    model = {'media': url_for(media), 'shots': shots, 'body': anchor}
    template = (root / 'assets/reference-edits/review.html').read_text(encoding='utf-8')
    payload = json.dumps(model, ensure_ascii=False).replace('<', r'\u003c')
    return template.replace('/* EPISODE_REVIEW */', 'const review = ' + payload + ';')


def review(project, media, *, root=ROOT):
    project = Path(project).resolve()
    page = project / 'reference-review.html'
    text = review_page(project, media, root, lambda path: file_url(path, project))
    with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=project, delete=False) as out:
        temporary = Path(out.name)
        out.write(text)
    try:
        os.replace(temporary, page)
    finally:
        temporary.unlink(missing_ok=True)
    return str(page)


def review_server(project, media, root=ROOT, port=0):
    """Serve the registered film and references on one origin for nested players and local JSON."""
    from http.server import ThreadingHTTPServer
    from io import BytesIO
    from urllib.parse import unquote, urlsplit
    from media_server import SingleRangeHTTPRequestHandler
    assets = (Path(root)/'assets').resolve()
    registered = {}

    def url_for(path):
        if path.is_relative_to(assets):
            return '/assets/' + quote(path.relative_to(assets).as_posix(), safe='/')
        if path not in registered:
            registered[path] = '/media/'+str(len(registered))+path.suffix
        return registered[path]

    page = review_page(project, media, root, url_for).encode('utf-8')
    media_by_url = {url:path for path,url in registered.items()}

    class Handler(SingleRangeHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def translate_path(self, path):
            return str(self.target)

        def copyfile(self, source, outputfile):
            try:
                super().copyfile(source, outputfile)
            except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                pass  # Switching shots cancels old media range requests.

        def send_head(self):
            route = urlsplit(self.path).path
            if route=='/':
                self._copy_range = None
                self._advertise_ranges = False
                self.send_response(200)
                self.send_header('Content-Type','text/html; charset=utf-8')
                self.send_header('Content-Length',str(len(page)))
                self.end_headers()
                return BytesIO(page)
            resource = media_by_url.get(route)
            if route.startswith('/assets/'):
                candidate = (assets/unquote(route[len('/assets/'):])).resolve()
                if candidate.is_relative_to(assets):
                    resource = candidate
            if resource is None or not resource.is_file():
                self.send_error(404)
                return None
            self.target = resource
            return super().send_head()

    return ThreadingHTTPServer(('127.0.0.1', port), Handler)


def hyperframes(project, number, output, root=ROOT):
    """Materialize one bound or pending shot as a portable HyperFrames design handoff."""
    from edit_session import read_project, missing_fields
    from reference_edits import RECIPES
    import hyperframes_shot
    root = Path(root).resolve()
    folder, context, plan = read_project(project)
    if not 1 <= number <= len(plan['shots']):
        raise ValueError('Choose an existing one-based shot number.')
    output = Path(output).resolve()
    if output.exists() or not output.parent.is_dir():
        raise ValueError('Use a new shot design directory inside the HyperFrames project; keep existing project files.')
    shot = plan['shots'][number-1]
    key = shot['source_id']
    recipe, direction = read(root, RECIPES)['recipes'][key], read(root, DIRECTION)[key]
    source = next(row for row in context['video_sources']['all_submitted']['required'] if row['source_id'] == key)
    unit = next((u for u in context['video_sources']['units'] if u['id'] == shot.get('unit')), {})
    palette = read(root, PALETTE)
    roles = surfaces(direction, recipe['slots'])
    ref = source_reference(root, source, direction)
    timing = {'fps': plan.get('fps'), 'start_frame': shot.get('start_frame'), 'end_frame': shot.get('end_frame')}
    slots = {}
    for slot, purpose in recipe['slots'].items():
        binding = dict(shot['inputs'].get(slot) or {})
        if binding.get('from_project'):
            binding['from_project'] = dict(binding['from_project'])
        for container, field in ((binding, 'path'), (binding.get('from_project') or {}, 'project')):
            if container.get(field):
                target = (folder / container[field]).resolve()
                try:
                    container[field] = Path(os.path.relpath(target, output)).as_posix()
                except ValueError:
                    container[field] = str(target)
        slots[slot] = {**purpose, 'surface': 'native' if binding.get('from_project') else roles[slot], 'binding': binding}
    score = {'source': key, 'number': number, 'action': recipe['action'], 'quote': unit.get('quote'), 'watch': direction['watch'],
             'clock': timing, 'rect': shot.get('rect'), 'slots': slots, 'layers': recipe['layers'],
             'source_evidence': source.get('locator'), 'method': recipe['capability']}
    with tempfile.TemporaryDirectory(prefix='.shot-design-', dir=output.parent) as name:
        directory = Path(name) / 'design'
        directory.mkdir()
        units = {u['id'] for u in context['video_sources']['units']}
        missing = missing_fields(shot, recipe, units, folder, plan.get('duration_frames'))
        missing.extend(name for name in ('width','height','fps') if type(plan.get(name)) is not int or plan[name] < 1)
        native = hyperframes_shot.build(root, folder, directory, recipe, shot, plan, score, missing)
        (directory / 'shot.json').write_text(json.dumps(score, ensure_ascii=False, indent=2), encoding='utf-8')
        shutil.copyfile(root / 'assets/qiaomu-fonts/fonts/notosans.woff2', directory / 'Noto.woff2')
        css = (root / 'assets/reference-edits/hyperframes.css').read_text(encoding='utf-8')
        tokens = '\n'.join(f'  --fusion-{k}: {v};' for k, v in palette.items())
        (directory / 'style.css').write_text(css.replace('/* PALETTE */', tokens), encoding='utf-8')
        doc = (root / DESIGN).read_text(encoding='utf-8').split('## 4.')[0].rstrip()
        ref_item = player_item(root, ref, lambda path: file_url(path, output))
        doc += f'\n\n## 本镜动作\n\n{recipe["action"]}\n\n{direction["watch"]}\n'
        doc += '\n先按原声确定触发词和可读停顿。shot.json 的 at 是镜头内 0–1 位置，cut 是硬切，连续相同姿态保留停顿。保留变化的参数、实际物件和落点。\n'
        doc += '\n素材与时码齐全时直接用本目录的 index.html 作为 HyperFrames 镜头工程。每层使用本期素材和独立媒体时钟。将无声渲染接回主时间线对应帧段，沿用主片原声。\n'
        doc += '\n在现有合成内复用时沿用本目录 style.css、shot-data.js 和动作脚本。为每层建立 data-fusion-layer 属性（从 0 开始），将真实媒体或文字标记为 data-fusion-content。将 FusionShot.attach(timeline, stage, FUSION_SHOT, {start, duration}) 同步注册到宿主 GSAP 时间线上。\n'
        doc += f'\n动态参照为[{ref_item["label"]}]({ref_item["url"]})'
        if ref_item.get('range'):
            doc += '，播放区间 ' + '–'.join(str(v) for v in ref_item['range']) + ' 秒'
        doc += '。\n'
        for example in program_examples(root, recipe['capability']):
            item = player_item(root, example, lambda path: file_url(path, output))
            doc += f'\n[{item["label"]}]({item["url"]})\n'
        (directory / 'DESIGN.md').write_text(doc, encoding='utf-8')
        directory.rename(output)
    if native.get('entry'):
        native['entry'] = str(output/native['entry'])
    return {**native, 'design': str(output / 'DESIGN.md'), 'css': str(output / 'style.css'), 'shot': str(output / 'shot.json'),
            'source': key, 'use': '制作本镜前读 DESIGN.md，引入 style.css 并按 shot.json 绑定当前内容与原声时机。'}
