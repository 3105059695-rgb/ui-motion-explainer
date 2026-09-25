"""Behavior checks for installs and portable project/media handling; no paid services."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('collector',ROOT/'scripts/collect_assets.py')
collector=importlib.util.module_from_spec(spec);spec.loader.exec_module(collector)

class PortableTests(unittest.TestCase):
    def run_script(self,name,*args):
        return subprocess.run([sys.executable,str(ROOT/name),*map(str,args)],capture_output=True,text=True,encoding='utf-8',errors='replace')
    def test_media_discovery_handles_relative_and_deduplicates(self):
        html='<img src="/a.png"><source srcset="/a.png 1x, /b.webp 2x"><meta property="og:image" content="https://cdn.example/og.png"><video src="/clip.mp4"></video>'
        urls=collector.discover(html,'https://example.test/docs/')
        self.assertEqual(urls,['https://example.test/a.png','https://example.test/b.webp','https://cdn.example/og.png','https://example.test/clip.mp4'])
        for invalid in ('file:///secret','javascript:alert(1)','https://user:password@example.test'):
            with self.assertRaises(ValueError):collector.public_url(invalid)
    def test_project_copies_real_media_and_preserves_previous_directory(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);src=root/'素材 image.svg';src.write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
            history=root/'history.json';history.write_text(json.dumps(['desktop','hero']))
            out=root/'新项目 with spaces'
            result=self.run_script('scripts/new_project.py','--out',out,'--topic','参考视频','--history',history,'--media',src)
            self.assertEqual(result.returncode,0,result.stderr)
            data=json.loads((out/'project.json').read_text(encoding='utf-8'))
            self.assertEqual(data['mode'],'timeline')
            self.assertEqual((out/data['media'][0]).read_bytes(),src.read_bytes())
            self.assertTrue((out/'fonts/NotoSansSC.ttf').is_file())
            self.assertNotEqual(self.run_script('scripts/new_project.py','--out',out).returncode,0)
    def test_install_refuses_overwrite_and_upgrade_preserves_local_changes(self):
        with tempfile.TemporaryDirectory() as t:
            target=Path(t)/'skills/ui-motion-explainer'
            target.mkdir(parents=True);(target/'SKILL.md').write_text('private skill');(target/'personal.txt').write_text('keep me')
            self.assertNotEqual(self.run_script('install.py','--target',target).returncode,0)
            self.assertEqual((target/'personal.txt').read_text(),'keep me')
            result=self.run_script('install.py','--target',target,'--upgrade')
            self.assertEqual(result.returncode,0,result.stderr)
            backups=list(target.parent.glob('ui-motion-explainer.backup-*'))
            self.assertEqual(len(backups),1)
            self.assertEqual((backups[0]/'personal.txt').read_text(),'keep me')
            self.assertFalse((target/'.venv').exists())
            self.assertTrue((target/'references/series-style.md').exists())

if __name__=='__main__':unittest.main()
