"""Creation regressions for the default production workspace and prepare handoff."""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import shutil
import sys
import tempfile
import unittest

import director
import new_project
import production_entry


class StarterTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name) / '工程'

    def test_implicit_blank_project_is_rejected_before_writing(self):
        with self.assertRaisesRegex(ValueError, 'No complete library scene'):
            new_project.create(self.project)
        self.assertFalse(self.project.exists())

    def prepared(self, internal=True):
        self.project.mkdir()
        source = self.project / 'input.txt' if internal else Path(self.temp.name) / 'input.txt'
        source.write_text('原稿不覆盖。', encoding='utf-8')
        context = {'generated_by': director.OWNER, 'project': str(self.project.resolve()),
                   'source': {'path': str(source.resolve()), 'sha256': hashlib.sha256(source.read_bytes()).hexdigest()},
                   'style': {'resolution': {'resolved_profile': 'adiao'}}}
        (self.project / 'director-context.json').write_text(json.dumps(context), encoding='utf-8')
        (self.project / 'director-brief.md').write_text(director.MARKER+'\nExisting brief', encoding='utf-8')
        return source

    def test_default_is_small_unmade_and_contains_real_library(self):
        result = new_project.create(self.project, custom_layout=True, profile='user-ui')
        config = json.loads((self.project / 'project.json').read_text(encoding='utf-8'))
        self.assertEqual(result['kind'], 'production-starter')
        self.assertFalse(config['demo'])
        self.assertEqual(config['duration'], 0)
        self.assertFalse(config['aestheticApproval'])
        self.assertEqual(config['production_status'], 'unmade-awaiting-authored-timeline')
        self.assertEqual((self.project / 'lib/editing-kit.js').read_bytes(),
                         (new_project.ROOT / 'assets/editing-kit/editing-kit.js').read_bytes())
        self.assertLess(sum(p.stat().st_size for p in self.project.rglob('*') if p.is_file()), 400000)
        self.assertFalse((self.project / 'fusion.js').exists())
        with self.assertRaisesRegex(ValueError, 'plan is missing'):
            production_entry.export_check(self.project)

    def test_prepare_then_new_preserves_inputs_and_uses_unified_design(self):
        source = self.prepared()
        originals = {p: p.read_bytes() for p in self.project.iterdir()}
        new_project.create(self.project, custom_layout=True)
        for path, data in originals.items():
            self.assertEqual(path.read_bytes(), data)
        config = json.loads((self.project / 'project.json').read_text(encoding='utf-8'))
        self.assertEqual(config['styleProfile'], 'user-ui')
        self.assertEqual(source.read_text(encoding='utf-8'), '原稿不覆盖。')

    def test_prepare_allows_external_source_and_rejects_edited_original(self):
        source = self.prepared(internal=False)
        production_entry.creation_resolution(self.project)
        source.write_text('修改', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'narration changed'):
            production_entry.creation_resolution(self.project)

    def test_unknown_files_and_wrong_marker_are_rejected_but_legacy_account_does_not_route(self):
        self.prepared()
        resolved = production_entry.creation_resolution(self.project, profile='fangmu')
        self.assertEqual(resolved['selection_source'], 'unified-production')
        self.assertEqual(resolved['confirmed_baselines'], [])
        extra = self.project / 'keep.txt'
        extra.write_text('重要数据', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'prepare-only'):
            new_project.create(self.project, custom_layout=True)
        self.assertFalse((self.project / 'project.json').exists())
        extra.unlink()
        (self.project / 'director-brief.md').write_text('not our brief', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'prepare-only'):
            new_project.create(self.project, custom_layout=True)

    def test_internal_original_cannot_collide_with_new_starter_file(self):
        source = self.prepared()
        target = self.project / 'README.md'
        source.rename(target)
        path = self.project / 'director-context.json'
        data = json.loads(path.read_text(encoding='utf-8'))
        data['source']['path'] = str(target.resolve())
        path.write_text(json.dumps(data), encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'Refusing to replace'):
            new_project.create(self.project, custom_layout=True)
        self.assertEqual(target.read_text(encoding='utf-8'), '原稿不覆盖。')
        self.assertFalse((self.project / 'project.json').exists())

    def test_historical_scene_is_explicit_and_keeps_legacy_duration(self):
        new_project.create(self.project, scene='F03', profile='user-ui')
        config = json.loads((self.project / 'project.json').read_text(encoding='utf-8'))
        self.assertTrue(config['demo'])
        self.assertEqual(config['duration'], 9)
        self.assertEqual(config['scene'], 'F03')
        self.assertFalse((self.project / 'production-starter').exists())

    def test_public_new_with_script_prepares_current_context(self):
        source = Path(self.temp.name) / '原稿.txt'
        original = '保留这句原文，不自动创建镜头。'.encode('utf-8')
        source.write_bytes(original)
        result = subprocess.run([sys.executable, '-X', 'utf8', str(new_project.ROOT / 'scripts/ui.py'),
                                 'new', '--engine', 'fusion', '--profile', 'user-ui', '--script', str(source),
                                 '--', '--custom-layout', '--out', str(self.project)], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stdout+'\n'+result.stderr)
        context = json.loads((self.project / 'director-context.json').read_text(encoding='utf-8'))
        self.assertEqual(context['source']['sha256'], hashlib.sha256(original).hexdigest())
        self.assertEqual(source.read_bytes(), original)
        timeline = json.loads((self.project / 'timeline.json').read_text(encoding='utf-8'))
        self.assertEqual(timeline['actions'], [])
        self.assertEqual(timeline['objects'], [])

    @unittest.skipUnless(shutil.which('node'), 'Existing Node is unavailable; no installation attempted')
    def test_actual_runtime_seek_and_calls(self):
        result = subprocess.run(['node', str(Path(__file__).with_name('test_production_starter.cjs'))],
                                capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stdout+'\n'+result.stderr)

    def renderer_module(self):
        path = new_project.ROOT / 'assets/base-skill/scripts/render_portable.py'
        spec = importlib.util.spec_from_file_location('fusion_renderer_trace_test', path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_renderer_saves_observed_trace_and_stated_scope(self):
        renderer = self.renderer_module()
        self.project.mkdir()
        class Tab:
            def evaluate(self, script):
                self.script = script
                return {'origin': 'successful-UIEditingKit.apply-calls', 'totalCalls': 12000,
                        'methodCounts': {'match-handoff': 12000}, 'calls': [{'action': 'move'}],
                        'omittedFromSnapshot': 11999}
        tab = Tab()
        result = renderer.write_runtime_trace(tab, self.project, 2, 4, 30, False)
        payload = json.loads((self.project / result['path']).read_text(encoding='utf-8'))
        self.assertTrue(result['available'])
        self.assertEqual(payload['runtime']['totalCalls'], 12000)
        self.assertEqual(payload['capture'], 'render-frame-sampling')
        self.assertIn('getTrace(2000)', tab.script)
        self.assertIn('does not establish semantic fit', payload['scope'])

    def test_legacy_renderer_without_runtime_replaces_stale_trace_with_unavailable(self):
        renderer = self.renderer_module()
        self.project.mkdir()
        path = self.project / 'editing-kit-runtime-trace.json'
        path.write_text('{"old":"evidence"}', encoding='utf-8')
        class Tab:
            def evaluate(self, script):
                return None
        renderer.reset_runtime_trace(Tab())
        result = renderer.write_runtime_trace(Tab(), self.project, 0, 4, 30, True)
        self.assertFalse(result['available'])
        payload = json.loads(path.read_text(encoding='utf-8'))
        self.assertEqual(payload['status'], 'unavailable')
        self.assertIsNone(payload['runtime'])
        self.assertEqual(payload['capture'], 'sampled-stills')


if __name__ == '__main__':
    unittest.main()
