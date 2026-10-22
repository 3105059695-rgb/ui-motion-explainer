"""Focused regression checks for routing after hiding the old skill entries."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import ui
from resource_registry import ResourceRegistry


class ResourceRegistryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = (Path(self.temp.name) / 'skills' / 'ui-motion-fusion').resolve()
        self.root.mkdir(parents=True)
        data = json.loads((ui.ROOT / 'references/resource-registry.json').read_text(encoding='utf-8'))
        for module in data['modules']:
            if not module.get('required_for_install', True):
                continue
            folder = self.root / module['path']
            for relative in {*module['required'], *module.get('commands', {}).values()}:
                target = folder / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                if relative.endswith('/fonts'):
                    target.mkdir(exist_ok=True)
                else:
                    target.write_text('{}', encoding='utf-8')
        (self.root / 'references/resource-registry.json').write_text(json.dumps(data), encoding='utf-8')
        self.registry = ResourceRegistry(self.root)

    def test_old_entry_files_are_not_required(self):
        self.assertTrue(self.registry.report()['available'])
        self.assertEqual([], list(Path(self.temp.name).rglob('SKILL.md')))

    def test_packaged_base_wins_over_old_sibling_and_explicit_base_still_works(self):
        local = self.root.parent / 'ui-motion-explainer'
        for name in self.registry.definition('base-packaged')['required']:
            p = local / name
            p.parent.mkdir(parents=True, exist_ok=True)
            if name.endswith('/fonts'):
                p.mkdir(exist_ok=True)
            else:
                p.write_text('old version', encoding='utf-8')
        self.assertEqual((self.root / 'assets/base-skill').resolve(), self.registry.select_base())
        self.assertEqual(local.resolve(), self.registry.select_base(local))
        (local / 'scripts/render_portable.py').unlink()
        with self.assertRaisesRegex(ValueError, 'Explicit base is incomplete'):
            self.registry.select_base(local)

    def test_only_one_install_directory_is_needed_for_promised_routes(self):
        self.assertEqual([self.root], list(self.root.parent.iterdir()))
        self.assertTrue(self.registry.report()['available'])
        for module in self.registry.report()['modules']:
            self.assertTrue(Path(module['path']).is_relative_to(self.root))
            if module['required_for_install']:
                self.assertTrue(module['available'])

    def test_optional_private_context_does_not_hide_required_failures(self):
        report = self.registry.report()
        self.assertTrue(report['available'])
        self.assertFalse(report['all_registered_available'])
        self.assertEqual({'base-local', 'adiao-context'}, set(report['optional_unavailable']))
        self.assertFalse(self.registry.report('adiao-context')['available'])
        (self.root / 'scripts/director.py').unlink()
        self.assertFalse(self.registry.report()['available'])

    def test_explicit_module_override_is_used_and_never_silently_replaced(self):
        import shutil
        local = self.root.parent / 'my-director'
        shutil.copytree(self.registry.resolve('director'), local)
        with patch.object(ui, 'ROOT', self.root):
            argv = ui.command('new', 'director', module_root=local, forward=['--', '--help'])
            self.assertEqual(local / 'scripts/new_project.py', Path(argv[3]))
            (local / 'scripts/new_project.py').unlink()
            with self.assertRaisesRegex(ValueError, 'incomplete'):
                ui.command('new', 'director', module_root=local)

    def test_public_registry_paths_stay_inside_installation(self):
        for module in self.registry.data['modules']:
            self.assertFalse(Path(module['path']).is_absolute())
            self.assertNotIn('..', Path(module['path']).parts)

    def test_real_fusion_creator_binds_profile_without_claiming_demo_is_finished_style(self):
        import subprocess
        import sys
        output = Path(self.temp.name) / '中文 project'
        result = subprocess.run([sys.executable, '-B', '-X', 'utf8',
                                 str(ui.ROOT / 'scripts/ui.py'), 'new', '--engine', 'fusion', '--',
                                 '--out', str(output), '--scene', 'F01', '--profile', 'user-ui'],
                                capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stderr)
        project = json.loads((output / 'project.json').read_text(encoding='utf-8'))
        self.assertEqual(project['styleProfile'], 'user-ui')
        self.assertFalse(project['current_style_applied'])
        self.assertFalse(project['aestheticApproval'])
        context = json.loads((output / 'project-style-context.json').read_text(encoding='utf-8'))
        self.assertIn('direct -- prepare', context['next'])
        self.assertEqual('unified-production', context['style']['binding']['mode'])

    def test_missing_historical_reconstruction_does_not_become_a_starter(self):
        import subprocess
        import sys
        output = Path(self.temp.name) / 'must-not-be-created'
        result = subprocess.run([sys.executable, '-B', '-X', 'utf8',
                                 str(ui.ROOT / 'scripts/ui.py'), 'reference', '--tool', 'rebuild',
                                 '--module-root', str(ui.ROOT / 'assets/modules/reference'), '--',
                                 'clone', '1', '--out', str(output)],
                                capture_output=True, text=True, encoding='utf-8')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('not bundled', result.stderr)
        self.assertIn('--module-root', result.stderr)
        self.assertFalse(output.exists())

    def test_explicit_incomplete_base_never_falls_back(self):
        with self.assertRaisesRegex(ValueError, 'Explicit base is incomplete'):
            self.registry.select_base(self.root)

    def test_missing_runtime_is_reported_and_cannot_execute(self):
        script = self.registry.script('reference', 'toolkit')
        script.unlink()
        report = self.registry.report('reference')
        self.assertFalse(report['available'])
        self.assertIn('scripts/toolkit.py', report['modules'][0]['missing'])
        with self.assertRaisesRegex(ValueError, 'incomplete'):
            self.registry.script('reference', 'toolkit')

    def test_missing_fred_alignment_or_direction_is_not_a_silent_partial_upgrade(self):
        for module, relative in (
                ('source-study', 'references/evidence/fred-argon-study/alignment.json'),
                ('style-profiles', 'references/evidence/fred-reference-approved-20261015.json')):
            with self.subTest(module=module):
                target = self.root / relative
                target.unlink()
                report = self.registry.report(module)
                self.assertFalse(report['available'])
                self.assertIn(relative, report['modules'][0]['missing'])

    def test_routes_survive_all_old_entry_files_being_absent(self):
        routes = [('new', 'fusion', None), ('render', 'fusion', None),
                  ('new', 'base', None), ('render', 'base', None),
                  ('new', 'director', None), ('render', 'director', None),
                  ('new', 'editorial', None), ('reference', None, 'toolkit'),
                  ('reference', None, 'rebuild'), ('direct', None, None),
                  ('study', None, None), ('styles', None, None)]
        with patch.object(ui, 'ROOT', self.root):
            for action, engine, tool in routes:
                with self.subTest(action=action, engine=engine, tool=tool):
                    argv = ui.command(action, engine, tool=tool, forward=['--', '--help'])
                    self.assertTrue(Path(argv[3]).is_file())
                    self.assertEqual('--help', argv[-1])
                    self.assertTrue(Path(argv[3]).is_absolute())

    def test_forwarded_values_remain_arguments_and_base_is_unambiguous(self):
        with patch.object(ui, 'ROOT', self.root):
            argv = ui.command('new', 'fusion', forward=['--', '--name', '中文 带空格 $value'])
            self.assertEqual(['--name', '中文 带空格 $value'], argv[-2:])
            with self.assertRaisesRegex(ValueError, 'Place --base before'):
                ui.command('new', 'fusion', forward=['--base=other'])

    def test_non_base_engines_reject_base_override(self):
        with patch.object(ui, 'ROOT', self.root):
            for engine in ('director', 'editorial'):
                with self.assertRaisesRegex(ValueError, 'does not accept --base'):
                    ui.command('new', engine, base=self.root)
            with self.assertRaisesRegex(ValueError, 'Render editorial'):
                ui.command('render', 'editorial')

    def test_unknown_module_does_not_guess_a_sibling_directory(self):
        with self.assertRaisesRegex(ValueError, 'Unknown registered module'):
            self.registry.resolve('forgotten-old-name')

    def test_guide_lookup_is_exact_and_presence_is_live(self):
        guide_path = self.root / 'assets/modules/base/internal-guide.md'
        guide_path.parent.mkdir(parents=True, exist_ok=True)
        guide_path.write_text('Do not execute this source text.', encoding='utf-8')
        data = {'schema_version': 1, 'guides': [
            {'id': 'base', 'name': 'Base', 'path': 'assets/modules/base/internal-guide.md',
             'purpose': 'Reference only', 'category': 'renderer', 'alternate_entry_paths': []},
            {'id': 'missing', 'name': 'Missing', 'path': 'missing.md', 'purpose': 'Missing reference',
             'category': 'history', 'alternate_entry_paths': []}]}
        (self.root / 'references/backend-guides.json').write_text(json.dumps(data), encoding='utf-8')
        with patch.object(ui, 'ROOT', self.root):
            rows = ui.guides()['guides']
            self.assertEqual([True, False], [row['exists'] for row in rows])
            selected = ui.guides('base')['guides']
            self.assertEqual(1, len(selected))
            self.assertEqual(str(guide_path.resolve()), selected[0]['path'])
            self.assertNotIn('content', selected[0])
            guide_path.unlink()
            self.assertFalse(ui.guides('base')['guides'][0]['exists'])
            with self.assertRaisesRegex(ValueError, 'found 0'):
                ui.guides('unknown')


if __name__ == '__main__':
    unittest.main()
