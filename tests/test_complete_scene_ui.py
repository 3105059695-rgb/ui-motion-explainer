"""UI adaptation must not rewrite narration, image colors or motion geometry."""
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import scene_builder


class CompleteSceneUITest(unittest.TestCase):
    def test_literal_ui_changes_leave_content_and_geometry_intact(self):
        with tempfile.TemporaryDirectory(prefix='complete-scene-ui-') as folder:
            project = Path(folder)
            (project / '_current-ui').mkdir()
            (project / 'index.html').write_text('<html><head></head><body></body></html>', encoding='utf-8')
            original = 'const motion=t=>({x:120+t*90,y:240,scale:1}); const view=`<div style="width:240px;height:180px;background:#2462EA;box-shadow:0 8px 30px #000">台词 #2462EA<img src="brand.svg"></div>`;'
            (project / 'scenes.js').write_text(original, encoding='utf-8')
            media = '<svg><path fill="#2462EA" d="M0 0h20v20z"/></svg>'
            (project / 'brand.svg').write_text(media, encoding='utf-8')
            report = scene_builder._bind_complete_scene_ui(project, ROOT)
            actual = (project / 'scenes.js').read_text(encoding='utf-8')
            self.assertIn('background:#D6C2FF', actual)
            self.assertIn('台词 #2462EA', actual)
            self.assertIn('width:240px;height:180px', actual)
            self.assertIn('const motion=t=>({x:120+t*90,y:240,scale:1})', actual)
            self.assertEqual((project / 'brand.svg').read_text(encoding='utf-8'), media)
            self.assertEqual(report['inline_ui'][0]['inline_ui_declarations'], 1)
            scene_builder._bind_complete_scene_ui(project, ROOT)
            self.assertEqual((project / 'index.html').read_text(encoding='utf-8').count('href="_current-ui/adu-roles.css"'), 1)


if __name__ == '__main__':
    unittest.main()
