"""The production default carries executable UI code while retaining scene events."""
import json
from pathlib import Path
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import rebuilt_library as library
from build_rebuilt_ui_coverage import KINDS, walk


class RebuiltUIBindingTest(unittest.TestCase):
    def test_production_default_contains_current_runtime_and_original_graph(self):
        with tempfile.TemporaryDirectory(prefix='rebuilt-ui-') as folder:
            base = Path(folder)
            binding = base / 'binding.json'
            library.write(binding, {'id': 'fredtalk:episode-scenes-1018-t03g'})
            library.materialize(binding, base / 'project')
            built = base / 'project'
            config = library.read(built / 'library-project.json')
            self.assertEqual(config['ui_binding']['mode'], 'current')
            self.assertTrue((built / 'lib/current-ui.js').is_file())
            html = (built / 'index.html').read_text(encoding='utf-8')
            self.assertLess(html.index('lib/current-ui.js'), html.index('lib/scene-runtime.js'))
            output_scene = json.loads((built / 'scene.js').read_text(encoding='utf-8').splitlines()[0][len('window.REBUILT_SPEC='):-1])
            self.assertEqual(output_scene.pop('ui_style'), 'current')
            self.assertEqual(output_scene, library.read(library.scene_path('episode-scenes-1018-t03g')))

    def test_historic_ui_requires_explicit_demo(self):
        with tempfile.TemporaryDirectory(prefix='rebuilt-ui-') as folder:
            base = Path(folder)
            binding = base / 'binding.json'
            library.write(binding, {'id': 'fredtalk:episode-scenes-1018-t03g', 'ui_style': 'historic'})
            with self.assertRaisesRegex(ValueError, 'demonstration option only'):
                library.materialize(binding, base / 'project')
            self.assertFalse((base / 'project').exists())
            library.write(binding, {'id': 'fredtalk:episode-scenes-1018-t03g', 'mode': 'demo', 'ui_style': 'historic'})
            library.materialize(binding, base / 'project')
            self.assertEqual(library.read(base / 'project/library-project.json')['ui_binding']['mode'], 'historic')

    def test_every_scene_kind_has_an_explicit_material_or_content_role(self):
        scenes = list((ROOT / 'assets/rebuilt-library/scenes').glob('*.json'))
        self.assertEqual(len(scenes), 192)
        for path in scenes:
            scene = library.read(path)
            self.assertFalse({node['kind'] for node in walk(scene['nodes'])} - KINDS.keys(), path.name)


if __name__ == '__main__':
    unittest.main()
