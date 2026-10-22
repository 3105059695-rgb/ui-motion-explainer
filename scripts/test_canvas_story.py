"""The new explicit Canvas route copies real code, preserves old starter and remains unmade."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import new_project
import selection_contract


class CanvasStoryTests(unittest.TestCase):
    def test_public_creation_copies_and_reaches_real_sdk(self):
        with tempfile.TemporaryDirectory() as directory:
            project = (Path(directory) / 'story').resolve()
            result = subprocess.run([sys.executable, '-B', '-X', 'utf8', str(new_project.ROOT / 'scripts/ui.py'),
                                     'new', '--engine', 'fusion', '--canvas-story', '--', '--custom-layout', '--out', str(project)],
                                    capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 0, result.stderr)
            config = json.loads((project / 'project.json').read_text(encoding='utf-8'))
            self.assertEqual(config['sceneRuntime'], 'canvas-story-v1')
            self.assertEqual(config['production_status'], 'unmade-awaiting-authored-timeline')
            self.assertFalse(config['current_style_applied'])
            for name in ('agent-editorial.js', 'motion-core.js', 'palette.json'):
                self.assertEqual((project / 'lib/agent-editorial' / name).read_bytes(),
                                 (new_project.ROOT / 'assets/agent-editorial' / name).read_bytes())
            graph, edges = selection_contract.dependency_graph(project / 'index.html')
            self.assertIn((project / 'lib/agent-editorial/agent-editorial.js').resolve(), graph)
            self.assertTrue(selection_contract._timeline_assignment(
                (project / 'runtime.js').read_text(encoding='utf-8'), project / 'runtime.js',
                project / 'timeline.json', 'binding', project / 'index.html'))
            self.assertLess(sum(p.stat().st_size for p in project.rglob('*') if p.is_file()), 400000)

    def test_requires_explicit_custom_mode_and_cannot_mix_historical_demo(self):
        with tempfile.TemporaryDirectory() as directory:
            project = Path(directory) / 'story'
            with self.assertRaisesRegex(ValueError, 'requires --custom-layout'):
                new_project.create(project, canvas_story=True)
            with self.assertRaisesRegex(ValueError, 'cannot be combined'):
                new_project.create(project, canvas_story=True, custom_layout=True, scene='F01')
            self.assertFalse(project.exists())


if __name__ == '__main__':
    unittest.main()
