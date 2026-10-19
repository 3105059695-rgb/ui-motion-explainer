"""Present all 56 inherited GIFs and existing production examples without altering the base."""
import html
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]

def main():
    base=ROOT/'assets/base-skill'
    source=(base/'docs/gallery.md').read_text(encoding='utf-8')
    names=dict(re.findall(r'<strong>([OX]\d{2})\s*[·.]\s*(.*?)</strong>',source))
    clips=[('已确认风格短样','approved-demo/preview.mp4'),('资料工作台 UI','ui-showcase/preview.mp4'),
           ('Mac 桌面与相册开场','portable-studio/previews/desktop.mp4'),
           ('人物侧边开场','portable-studio/previews/hero.mp4'),
           ('时间线开场','portable-studio/previews/timeline.mp4'),
           ('小圆窗正文工作台','portable-studio/previews/body.mp4'),
           ('口播驱动扩展','narration-demos/preview.mp4'),('连续对象 X21–X23','motion-lab/preview.mp4')]
    cards=[]
    for name,path in clips:
        cards.append(f'<article><h3>{html.escape(name)}</h3><video src="base-skill/assets/{path}" controls preload="none" playsinline></video></article>')
    gifcards=[]
    ids=[f'O{i:02}' for i in range(1,34)]+[f'X{i:02}' for i in range(1,24)]
    for id in ids:
        if not (base/'docs/previews'/f'{id}.gif').is_file():raise FileNotFoundError(id)
        name=html.unescape(re.sub('<[^>]*>','',names.get(id,id)))
        kind='原片观察节选' if id.startswith('O') else '原创扩展示意'
        gifcards.append(f'<article id="{id}"><h3>{id} · {html.escape(name)}</h3><img loading="lazy" src="base-skill/docs/previews/{id}.gif" alt="{html.escape(name)}"><p>{kind} · <a href="base-skill/docs/gallery.md#{id.lower()}">原说明与来源</a></p></article>')
    page='''<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>原技能完整视觉资源</title><style>
@font-face{font-family:Noto;font-weight:100 900;src:url('base-skill/assets/portable-studio/fonts/NotoSansSC.ttf')}*{box-sizing:border-box}body{margin:0;background:#F7F8FA;color:#17191F;font-family:Noto,sans-serif}main{max-width:1360px;margin:auto;padding:40px 28px}h1{font-size:34px}h2{font-size:24px;margin-top:38px}p{color:#717684;font-size:14px;line-height:1.7}a{color:#4F2B78}section{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}article{border:1px solid #E5E7EC;background:white;border-radius:14px;padding:16px;overflow:hidden}h3{font-size:16px;margin:0 0 12px}video,img{width:100%;aspect-ratio:16/9;object-fit:contain;background:#f3f2f6;border-radius:8px}nav{display:flex;gap:12px;flex-wrap:wrap}@media(max-width:1000px){section{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){section{grid-template-columns:1fr}}
</style></head><body><main><a href="../index.html">← 融合入口</a><h1>原技能的视觉体系，完整保留。</h1><p>以下使用原技能已有媒体：33 个观察节选与 23 个原创扩展。原视频、示意和已确认短样的性质各自保留；新融合示例另有独立入口。</p><nav><a href="base-skill/SKILL.md">原技能入口</a><a href="../references/coverage.md">完整能力覆盖表</a><a href="fusion-studio/index.html">八类融合效果</a></nav><h2>开场、正文与界面示例</h2><section>'''+''.join(cards)+'''</section><h2>56 项原动效图鉴</h2><section>'''+''.join(gifcards)+'''</section></main></body></html>'''
    (ROOT/'assets/base-gallery.html').write_text(page,encoding='utf-8')
    print(f'{len(ids)} GIFs, {len(clips)} existing example videos')

if __name__=='__main__':main()
