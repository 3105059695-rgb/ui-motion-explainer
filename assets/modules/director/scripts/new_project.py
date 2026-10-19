#!/usr/bin/env python3
"""Copy a self-contained, editable AI UI Director project to a new folder."""
import argparse
import json
import math
from pathlib import Path
import re
import shutil


def validate(config):
    if (config.get('width'), config.get('height')) != (1920, 1080):
        raise ValueError('Canvas must be 1920 x 1080; export may downscale it.')
    if not isinstance(config.get('duration'), (int, float)) or not math.isfinite(config['duration']) or config['duration'] <= 0:
        raise ValueError('Project duration must be finite and positive.')
    end = 0
    clips = config.get('clips', [])
    if not clips:
        raise ValueError('At least one clip is required.')
    ids = set()
    for clip in clips:
        if not isinstance(clip.get('id'), str) or not clip['id'].strip():
            raise ValueError('Every clip requires a non-empty id.')
        if not all(isinstance(clip.get(k), (int, float)) and math.isfinite(clip[k]) for k in ('start', 'duration')):
            raise ValueError('Clip times must be finite numbers.')
        if clip.get('id') in ids:
            raise ValueError('Duplicate clip id.')
        ids.add(clip.get('id'))
        if abs(float(clip['start']) - end) > .001 or float(clip['duration']) <= 0:
            raise ValueError('Clips must be ordered, contiguous and positive in duration.')
        end = float(clip['start']) + float(clip['duration'])
    if abs(end - float(config['duration'])) > .001:
        raise ValueError('Project duration must match the final clip end.')
    for caption in config.get('captions', []):
        if not 0 <= caption['start'] < caption['end'] <= end or not isinstance(caption['text'], str):
            raise ValueError('Invalid caption range or text.')
    return config


def copy_project_docs(skill, dest):
    """Keep the portable project's documentation links within its flattened layout."""
    reference_names = (
        'project-format.md', 'preset-catalog.md', 'narration.md', 'rendering.md',
        'work-inventory.md', 'design.md', 'sidebar-inventory.md',
    )
    docs = [skill / 'verification.md', skill / 'THIRD-PARTY-NOTICES.md']
    docs += [skill / 'references' / name for name in reference_names]
    docs += sorted((skill / 'references').glob('collectui*.md'))
    for source in docs:
        content = source.read_text(encoding='utf-8-sig')
        content = content.replace('../assets/studio/', '../').replace('assets/studio/', '')
        # Historical preview media stays in the skill, outside the standalone project.
        content = re.sub(r'!?\[([^\]]+)\]\(((?:\.\./)*assets/previews/[^)]+)\)',
                         lambda match: f'{match[1]}（原技能包：`{match[2]}`）', content)
        if source.name == 'rendering.md':
            content = content.replace('python scripts/serve.py', 'python -m http.server 8876 --bind 127.0.0.1')
        if source.name == 'verification.md':
            heading, rest = content.split('\n', 1)
            content = heading + '\n\n> 本文件是创建工程时随附的技能包历史验证记录，不代表当前工程修改后已重新验证。'
            content += '历史 MP4、联系表、编码中间帧与旁置验证 JSON 仍位于原技能包的 `assets/previews/`，未随独立工程复制；下文的历史样片路径均指原技能包。'
            content += '本工程用法见 [README](README.md)。\n' + rest
        (dest / source.relative_to(skill)).write_text(content, encoding='utf-8')
    for name in ('upstream-MIT.txt', 'work-inventory.json', 'presets.json'):
        shutil.copy2(skill / 'references' / name, dest / 'references' / name)

    # These URLs were relative to assets/studio/ in the original gallery.
    for filename in ('coverage.json', 'ai-flow-audit.json', 'command-bar-audit.json', 'inventory-catalog.json', 'inventory-summary.json'):
        source_record = skill / 'assets/studio' / filename
        if not source_record.exists():
            continue
        record = dest / filename
        content = source_record.read_text(encoding='utf-8-sig')
        content = content.replace('"../../references/', '"references/')
        content = content.replace('"../../verification.md"', '"verification.md"')
        record.write_text(content, encoding='utf-8')
    page = dest / 'coverage.html'
    content = page.read_text(encoding='utf-8-sig')
    content = content.replace("['../../references/work-inventory.json','./references/work-inventory.json']",
                              "['./references/work-inventory.json']")
    page.write_text(content, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--plan', type=Path, help='An authored project JSON with actual narration timing.')
    parser.add_argument('--preset', help='Create one scene with the named preset.')
    parser.add_argument('--duration', type=float, default=10)
    parser.add_argument('--title', help='Override the selected preset title; omit to retain its default.')
    parser.add_argument('--prompt', default='')
    parser.add_argument('--result', default='')
    args = parser.parse_args()
    dest = args.out.resolve()
    if dest.exists():
        parser.error('Output already exists. Use a new project directory.')
    skill = Path(__file__).resolve().parents[1]
    source = skill / 'assets' / 'studio'
    config = json.loads((args.plan or source / 'project.json').read_text(encoding='utf-8-sig'))
    if args.preset:
        params = {k: v for k, v in {'title': args.title, 'prompt': args.prompt, 'result': args.result}.items() if v}
        config = {'title':args.title or args.preset,'mode':'sequence','width':1920,'height':1080,'fps':30,
                  'duration':args.duration,'clips':[{'id':'scene-1','preset':args.preset,'start':0,'duration':args.duration,'params':params}],
                  'captions':[], 'audio':'', 'demo':True}
    try:
        validate(config)
        catalog_path = skill / 'references' / 'presets.json'
        if catalog_path.exists():
            catalog = json.loads(catalog_path.read_text(encoding='utf-8'))
            known = {entry['id'] for entry in catalog}
            for clip in config['clips']:
                if clip['preset'] not in known:
                    raise ValueError('Unknown preset: ' + clip['preset'])
    except (ValueError, KeyError, TypeError) as exc:
        parser.error(str(exc))
    shutil.copytree(source, dest)
    (dest / 'project.json').write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding='utf-8')
    (dest / 'scripts').mkdir()
    (dest / 'references').mkdir()
    shutil.copy2(skill / 'scripts' / 'render.py', dest / 'scripts' / 'render.py')
    copy_project_docs(skill, dest)
    shutil.copy2(skill / 'requirements.txt', dest / 'requirements.txt')
    (dest / 'README.md').write_text('# 可编辑横屏 UI 工程\n\n在本目录运行 `python -m http.server 8876 --bind 127.0.0.1`，打开 http://127.0.0.1:8876/index.html?sequence=1 。\n\n导出：`python scripts/render.py --project . --out renders --width 1920 --fps 30 --no-motion-blur`。需要 Playwright、Pillow、Chromium 和 FFmpeg。配音文件放进工程目录，并在 project.json 的 audio 字段填写相对路径。网页预览无声，音轨在导出时合成。\n\n编辑参考：[工程格式](references/project-format.md)、[预设目录](references/preset-catalog.md)、[口播编排](references/narration.md)、[渲染与验证](references/rendering.md)。\n\n来源与范围：[作品进度](coverage.html)、[来源记录](references/collectui-map.md)、[逐作品清单](references/work-inventory.md)、[随包历史验证](verification.md)、[第三方资源](THIRD-PARTY-NOTICES.md)。这些说明和 JSON 均随工程携带；原技能包的历史样片和截图不复制，新工程的修改与导出需另行验证。\n', encoding='utf-8')
    print(json.dumps({'project':str(dest),'entry':'index.html?sequence=1','duration':config['duration']},ensure_ascii=False))


if __name__ == '__main__':
    main()
