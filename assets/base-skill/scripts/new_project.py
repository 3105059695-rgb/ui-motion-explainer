#!/usr/bin/env python3
"""Copy a runnable, editable scene with all fonts and original example artwork."""
import argparse
import json
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
MODES = ('hero', 'desktop', 'timeline', 'body')

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out', required=True, type=Path)
    p.add_argument('--mode', choices=MODES+('auto',), default='auto')
    p.add_argument('--topic', default='把素材变成自己的作品')
    p.add_argument('--script', type=Path)
    p.add_argument('--presenter', type=Path)
    p.add_argument('--audio', type=Path)
    p.add_argument('--media', action='append', type=Path, default=[])
    p.add_argument('--duration', type=float, default=10.0)
    p.add_argument('--history', type=Path, help='Read-only JSON list of previous mode names or objects containing mode')
    a = p.parse_args()
    if a.out.exists(): p.error('Use a new output directory; existing projects are never overwritten')
    if a.duration <= 0: p.error('Duration must be positive')
    for file in [a.script, a.presenter, a.audio, *a.media]:
        if file and not file.is_file(): p.error('Missing input: '+str(file))
    previous = []
    if a.history:
        previous = json.loads(a.history.read_text(encoding='utf-8-sig'))
        previous = [(v.get('mode') if isinstance(v, dict) else v) for v in previous[-3:]]
    mode = a.mode
    if mode == 'auto':
        candidates = ['desktop','timeline','hero'] if any(w in a.topic for w in ('对比','参考','视频')) else ['hero','timeline','desktop']
        mode = next((m for m in candidates if m not in previous), candidates[0])
    shutil.copytree(ROOT/'assets/portable-studio', a.out, ignore=shutil.ignore_patterns('previews','verification.json','contact-sheet.jpg'))
    config = json.loads((a.out/'project.json').read_text(encoding='utf-8'))
    config.update({'mode':mode,'duration':a.duration,'title':a.topic,'historyCompared':previous,
                   'designNote':'Mechanism selected; adapt the states and narration timing before final delivery.'})
    media_dir = a.out/'media'
    media_dir.mkdir()
    def copy_media(src, name):
        dst = media_dir/(name+src.suffix.lower())
        shutil.copy2(src,dst)
        return dst.relative_to(a.out).as_posix()
    if a.presenter: config['presenter'] = copy_media(a.presenter,'presenter')
    if a.audio: config['audio'] = copy_media(a.audio,'narration')
    if a.media: config['media'] = [copy_media(src,f'material-{i+1}') for i,src in enumerate(a.media)]
    if a.script:
        shutil.copy2(a.script,a.out/'spoken-text.txt')
        config['scriptFile'] = 'spoken-text.txt'
        config['designNote'] += ' Script saved; the AI must align it to real audio, not divide it evenly.'
    (a.out/'project.json').write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
    (a.out/'PROJECT-NOTES.md').write_text('# 制作起点\n\n这是可编辑底座，不是新文案的成片。根据实际口播修改状态、素材和字幕时间；把示例文字全部换掉。\n\n'+
        '运行技能包 scripts/render_portable.py --project "'+str(a.out.resolve())+'" --stills-only 先检查。\n',encoding='utf-8')
    print(json.dumps({'project':str(a.out.resolve()),'mode':mode,'priorModes':previous},ensure_ascii=False))

if __name__ == '__main__':
    main()
