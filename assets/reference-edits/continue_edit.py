"""Open this episode's saved edit in an installed or downloaded ui-motion-fusion Skill."""
import json
import os
from pathlib import Path
import subprocess
import sys

here=Path(__file__).resolve().parent
hint=here/'editorial'/'skill-location.json'
locations=[]
if os.environ.get('UI_MOTION_SKILL'):locations.append(Path(os.environ['UI_MOTION_SKILL']))
locations.extend([Path.home()/'.codex/skills/ui-motion-fusion',Path.home()/'.agents/skills/ui-motion-fusion'])
if hint.is_file():locations.append(here/json.loads(hint.read_text(encoding='utf8'))['skill'])
locations.extend([here/'ui-motion-fusion',here.parent/'ui-motion-fusion',Path.cwd()])
root=next((p.resolve() for p in locations if (p/'scripts/episode_revision.py').is_file() and (p/'SKILL.md').is_file()),None)
if root is None:
    raise SystemExit('请安装新版 ui-motion-fusion，或将 UI_MOTION_SKILL 指向从 GitHub 下载的 Skill 根目录。')
args=sys.argv[1:] or ['resume']
if '--project' in args:raise SystemExit('此入口自动使用自身所在的工程。')
raise SystemExit(subprocess.call([sys.executable,'-B','-X','utf8',str(root/'scripts/ui.py'),'direct','--',*args,'--project',str(here)]))
