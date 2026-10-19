#!/usr/bin/env python3
"""Rebuild the GitHub GIF gallery from the effect catalog and source manifests."""

from pathlib import Path
import html
import json
import re


def timestamp(value):
    return f'{int(value // 60):02d}:{value % 60:05.2f}'


def main():
    root = Path(__file__).resolve().parents[1]
    entries = {}
    catalog = (root / 'references/effects.md').read_text(encoding='utf-8')
    for line in catalog.splitlines():
        match = re.match(r'^\| (O\d{2}|X\d{2}) (.*?) \| (.*?) \| (.*?) \|$', line)
        if match:
            code, title, meaning, method = match.groups()
            entries[code] = {'title': title, 'meaning': meaning, 'method': method}
    sources = {}
    for file in (root / 'docs/sources').glob('*-previews.json'):
        for entry in json.loads(file.read_text(encoding='utf-8')):
            sources[entry['id']] = entry
    pages = {'D': 'doubao', 'C': 'codex', 'G': 'token'}
    groups = [
        ('cards', '01 · 卡片、对象与连续布局', [f'O{i:02d}' for i in range(1, 9)]),
        ('relations', '02 · 关系、分支与交接', [f'O{i:02d}' for i in range(9, 15)]),
        ('focus', '03 · 界面状态与注意力', [f'O{i:02d}' for i in range(15, 29)]),
        ('editing', '04 · 镜头与段落节奏', [f'O{i:02d}' for i in range(29, 34)]),
        ('extensions', '05 · 兼容扩展：新设计演示', [f'X{i:02d}' for i in range(1, 9)]),
        ('narration', '06 · 口播讲解：带配音的新设计', [f'X{i:02d}' for i in range(9, 21)]),
    ]
    codes_in_gallery = [code for _, _, codes in groups for code in codes]
    assert set(entries) == set(codes_in_gallery), 'Catalog and gallery groups must match'
    total = len(codes_in_gallery)
    out = [f'# {total} 项动效图鉴', '',
           '[返回首页](../README.md) · [完整动效规范](../references/effects.md) · [素材署名](../CREDITS.md)', '',
           '**O01–O33：原片节选。X01–X20：新制作的扩展演示。** 每一项都有动态预览，实际截取时间与观察说明分开记录。GIF 保留必要的前后状态；实现建议见动效规范。', '',
           '[卡片布局](#cards) · [关系交接](#relations) · [界面聚焦](#focus) · [镜头节奏](#editing) · [基础扩展](#extensions) · [口播扩展](#narration) · [产品 UI](ui-design.md)', '']

    def card(code):
        entry = entries[code]
        assert (root / f'docs/previews/{code}.gif').is_file(), f'Missing GIF: {code}'
        title = html.escape(entry['title'])
        meaning = html.escape(entry['meaning'])
        if code.startswith('O'):
            src = sources[code]
            page = pages[src['source']]
            caption = f"<a href='sources/{page}.md'>{src['source']} · {timestamp(src['start'])}–{timestamp(src['end'])}</a> · 原片节选"
        elif int(code[1:]) <= 8:
            start = (int(code[1:]) - 1) * 4
            caption = f"<a href='../assets/extension-demos/preview.mp4'>{timestamp(start)}–{timestamp(start + 4)}</a> · 扩展演示 · <a href='../assets/extension-demos/index.html'>源码</a>"
        else:
            start = (int(code[1:]) - 9) * 6
            caption = f"<a href='../assets/narration-demos/preview.mp4'>{timestamp(start)}–{timestamp(start + 6)}</a> · 中文配音示范 · <a href='../assets/narration-demos/index.html'>源码</a>"
        return f'<a id="{code.lower()}"></a><strong>{code} · {title}</strong><br /><img src="previews/{code}.gif" width="420" alt="{code} {title}" /><br />{caption}<br /><br />{meaning}'

    for anchor, title, codes in groups:
        out.extend([f'<a id="{anchor}"></a>', '', f'## {title}', ''])
        if anchor == 'extensions':
            out.extend(['以下是同一风格语言下的新设计，不作为原参考片的观察证据。X04 展示图解到实录的对位方法，画面明确标记为示意。', '',
                        '[播放 32 秒扩展合集](../assets/extension-demos/preview.mp4) · [编辑工程](../assets/extension-demos/index.html)', ''])
        if anchor == 'narration':
            out.extend(['根据口播语义设计的 12 种新动作，每段 6 秒。完整 MP4 带中文合成演示配音，下方 GIF 为静音预览。', '',
                        '[播放 72 秒口播合集](../assets/narration-demos/preview.mp4) · [口播配方](../references/narration-effects.md) · [文案与工程](../assets/narration-demos/README.md)', ''])
        out.extend(['| 动作预览 | 动作预览 |', '|:---|:---|'])
        for i in range(0, len(codes), 2):
            left = card(codes[i])
            right = card(codes[i + 1]) if i + 1 < len(codes) else '按语义组合动作，给结果留出阅读时间。'
            out.append(f'| {left} | {right} |')
        out.extend(['', f'[回到目录](#{total}-项动效图鉴)', ''])
    (root / 'docs/gallery.md').write_text('\n'.join(out) + '\n', encoding='utf-8')
    print(f'Wrote docs/gallery.md: {len(entries)} effects with previews')


if __name__ == '__main__':
    main()
