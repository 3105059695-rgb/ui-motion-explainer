"""Create a self-contained editable fusion demonstration without overwriting projects."""
import argparse
import json
from pathlib import Path
import shutil
import production_entry

ROOT=Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',required=True,type=Path)
    p.add_argument('--scene',choices=['all']+[f'F{i:02}' for i in range(1,9)],default='all')
    p.add_argument('--title',default='黑白紫 UI 进阶动效')
    p.add_argument('--profile',help='Applicable profile ID for directing; default from the current registry, not a restyling operation.')
    p.add_argument('--base',type=Path,default=ROOT/'assets/base-skill',help='Selected original skill version; default packaged snapshot')
    a=p.parse_args()
    if a.out.exists():p.error('Use a new project directory')
    try:
        resolution=production_entry.creation_resolution(a.out,a.profile,root=ROOT)
    except (OSError,ValueError) as exc:
        p.error(str(exc))
    a.profile=resolution['resolved_profile']
    source=ROOT/'assets/fusion-studio'
    if not (source/'project.json').is_file():p.error('Fusion studio missing')
    fonts=a.base/'assets/portable-studio/fonts'
    if not fonts.is_dir():p.error('Selected base has no portable fonts')
    shutil.copytree(source,a.out,ignore=shutil.ignore_patterns('previews','renders','__pycache__'))
    shutil.copytree(fonts,a.out/'fonts')
    for path in a.out.glob('*.css'):
        text=path.read_text(encoding='utf-8')
        path.write_text(text.replace('../base-skill/assets/portable-studio/fonts/','fonts/'),encoding='utf-8')
    config=json.loads((a.out/'project.json').read_text(encoding='utf-8-sig'))
    config.update({'scene':a.scene,'duration':72 if a.scene=='all' else 9,'title':a.title,
                   'mode':'fusion','demo':True,'styleProfile':a.profile,
                   'production_status':'mechanism-demo-awaiting-narration-directed-design',
                   'current_style_applied':False,'aestheticApproval':False})
    (a.out/'project.json').write_text(json.dumps(config,ensure_ascii=False,indent=2),encoding='utf-8')
    (a.out/'PROJECT-NOTES.md').write_text(
        '# 可编辑融合示意\n\n这是一套动作机制底座。根据实际文案重新设计状态、素材和时间轴，'
        '不要只换标题就当成新片。真实产品操作需真实依据；几何人物占位需用户授权原片替换。'
        '完整字体与许可已复制，工程不依赖本技能目录。\n\n'
        f'已登记风格档案 `{a.profile}`，但示意模板尚未按当前风格重新设计，不是最新风格成片。'
        '下一步从主 Skill 调用 `ui.py direct -- prepare --script <口播稿> --project <本工程>`，'
        '读取当前风格合同与原始口播后设计真实画面。\n',encoding='utf-8')
    production_entry.attach_creation_context(a.out,resolution,root=ROOT)
    print(json.dumps({'project':str(a.out.resolve()),'scene':a.scene,'duration':config['duration'],
                     'style_profile':a.profile,'current_style_applied':False,
                     'next':'ui.py direct -- prepare --script <narration> --project <project>'},ensure_ascii=False))

if __name__=='__main__':main()
