#!/usr/bin/env python3
"""Assemble 12 narrated UI effects and embed a local open-font subset."""
import argparse
import json
from pathlib import Path
import sys

p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--font', required=True, type=Path, help='Noto Sans SC variable font source')
p.add_argument('--deps-path', type=Path, help='Optional directory containing fonttools and brotli')
a = p.parse_args()
if a.deps_path:
    sys.path.insert(0, str(a.deps_path.resolve()))
from fontTools.ttLib import TTFont
from fontTools import subset

root = Path(__file__).resolve().parent
plan = json.loads((root/'narration-plan.json').read_text(encoding='utf-8'))
timing = json.loads((root/'assets/narration-timing.json').read_text(encoding='utf-8'))
parts = [json.loads((root/'parts'/name).read_text(encoding='utf-8')) for name in ['part-a.json','part-b.json']]
css = '''
@font-face{font-family:ProjectSans;src:url('assets/NotoSansSC-subset.woff2') format('woff2');font-weight:100 900;font-display:block}
*{box-sizing:border-box}html,body{width:1920px;height:1080px;margin:0;overflow:hidden;background:#fff}
body{font-family:ProjectSans,sans-serif;color:#101112;-webkit-font-smoothing:antialiased}h1,h2,h3,p{margin:0}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#fff}
.scene{position:absolute;inset:0;background:#fff;overflow:hidden;visibility:hidden;opacity:0}
.top{position:absolute;left:100px;right:100px;top:65px;display:flex;justify-content:space-between;align-items:center}
.kicker{font-size:24px;font-weight:700;letter-spacing:1px}.tag{font-size:22px;color:#67666d;border:1px solid #dedde4;border-radius:28px;padding:8px 17px}
.title{position:absolute;left:100px;right:100px;top:145px;font-size:64px;font-weight:700;line-height:1.3;letter-spacing:-1.5px}
.purple{color:#7451b8}.light-purple{color:#cdb7f5}.muted{color:#777981}
.subtitle{position:absolute;bottom:50px;left:100px;right:100px;display:flex;justify-content:center;align-items:center;z-index:90;pointer-events:none;visibility:hidden}
.subtitle span{display:inline-block;max-width:1720px;font-size:42px;font-weight:700;line-height:1.45;text-align:center;border-radius:15px;padding:12px 26px 15px;background:#101112;color:#fff}
.series-progress{position:absolute;bottom:0;left:0;right:0;display:flex;height:5px;gap:4px;z-index:100}.series-progress i{flex:1;background:#e9e7ed}.series-progress i.active{background:#b596e4}
'''
for part in parts:
    css += '\n' + part['css']
html = '<!doctype html><html lang="zh-CN" data-resolution="landscape"><head><meta charset="utf-8"><meta name="viewport" content="width=1920,height=1080"><title>12种口播讲解新动效</title><script src="assets/gsap.min.js"></script><style>' + css + '</style></head><body>'
html += '<main id="root" data-composition-id="main" data-start="0" data-duration="72" data-width="1920" data-height="1080" data-fps="30">'
html += '\n'.join(part['html'] for part in parts)
import html as escape_html
all_chunks=[]
for entry in plan:
    for chunk in timing[entry['id']]['chunks']:
        index=len(all_chunks)
        all_chunks.append(chunk)
        html += f'<div class="subtitle" id="caption-{index}"><span>{escape_html.escape(chunk["text"])}</span></div>'
html += '<div class="series-progress">' + ''.join(f'<i id="step-{i}"></i>' for i in range(12)) + '</div>'
html += '<audio src="assets/narration.wav" id="voice" preload="auto" data-start="0" data-duration="72" data-track-index="3" data-volume="1"></audio></main>'
js = 'window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});window.__timelines.main=tl;\n'
js += 'const planTimings=' + json.dumps(timing,ensure_ascii=False) + ';\n'
js += "const at=(id,j)=>planTimings[id].chunks[j].start;\n"
js += "gsap.set('.scene',{autoAlpha:0});gsap.set('#s09',{autoAlpha:1});gsap.set('.subtitle',{autoAlpha:0});\n"
for i in range(12):
    start=i*6
    selector=f'#s{i+9:02d}'
    js += f"tl.set('{selector}',{{autoAlpha:1}},{start});\n"
    if i<11:
        js += f"tl.set('{selector}',{{autoAlpha:0}},{start+6});\n"
    js += f"tl.from('{selector} .top, {selector} .title',{{opacity:0,y:16,duration:.35,stagger:.04,ease:'power3.out'}},{start+.04});\n"
    js += f"tl.to('#step-{i}',{{backgroundColor:'#b596e4',duration:.22}},{start+.1});\n"
for i,chunk in enumerate(all_chunks):
    end=all_chunks[i+1]['start'] if i+1<len(all_chunks) else 72
    if (i+1)%3==0:
        end=((i//3)+1)*6-.06
    js += f"tl.set('#caption-{i}',{{autoAlpha:1}},{chunk['start']});tl.set('#caption-{i}',{{autoAlpha:0}},{end});\n"
js += '\n'.join(part['js'] for part in parts)
js += '\ntl.to({}, {duration:0.001}, 71.999);'
html += '<script>' + js + '</script></body></html>'
(root/'index.html').write_text(html,encoding='utf-8')

font = TTFont(str(a.font))
visible = {ord(c) for c in html if ord(c)>31}
missing=visible-set(font.getBestCmap())
if missing:
    raise SystemExit('Font lacks characters: ' + ', '.join(f'U+{x:04X}' for x in sorted(missing)))
sub = subset.Subsetter(options=subset.Options())
sub.populate(text=html)
sub.subset(font)
font.flavor='woff2'
font.save(str(root/'assets/NotoSansSC-subset.woff2'))
font.close()
print('Built index.html and font subset for 12 scenes / 72 seconds.')
