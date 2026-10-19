"""Public-entry regressions: historical demos cannot silently become production exports."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import production_entry
import ui


class ProductionEntryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.project = Path(self.temp.name) / '中文 project'
        self.project.mkdir()
        self.plan = self.project / 'director-plan.json'

    def run_entry(self, args):
        with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
            return ui.main(args)

    def render_args(self, engine='fusion'):
        return ['render', '--engine', engine, '--', '--project', str(self.project)]

    def test_missing_plan_blocks_every_public_renderer_without_launching(self):
        for engine in ('base', 'fusion', 'director'):
            with self.subTest(engine=engine), patch.object(ui.subprocess, 'run') as run:
                with self.assertRaises(SystemExit):
                    self.run_entry(self.render_args(engine))
                run.assert_not_called()

    def test_legacy_stale_or_not_ready_plan_never_launches_renderer(self):
        self.plan.write_text('{}', encoding='utf-8')
        cases = [(True, False), (False, True), (False, False)]
        for ready, current in cases:
            report = {'render_ready': ready, 'current_style_ready': current, 'errors': [], 'readiness_blockers': []}
            with self.subTest(report=report), patch.object(production_entry.director, 'check', return_value=report), \
                    patch.object(ui.subprocess, 'run') as run:
                with self.assertRaises(SystemExit):
                    self.run_entry(self.render_args())
                run.assert_not_called()

    def test_production_check_is_for_this_project_and_consumes_plan_flag(self):
        self.plan.write_text('{}', encoding='utf-8')
        report = {'render_ready': True, 'current_style_ready': True}
        with patch.object(production_entry.director, 'check', return_value=report) as check, \
                patch.object(ui.subprocess, 'run', return_value=SimpleNamespace(returncode=0)) as run:
            args = self.render_args() + ['--plan', 'director-plan.json', '--width', '960']
            self.assertEqual(0, self.run_entry(args))
            check.assert_called_once_with(self.plan.resolve(), root=ui.ROOT)
            forwarded = run.call_args.args[0]
            self.assertNotIn('--plan', forwarded)
            self.assertNotIn('--demo', forwarded)
            self.assertEqual(['--width', '960'], forwarded[-2:])

    def test_another_projects_plan_cannot_authorize_render(self):
        elsewhere = Path(self.temp.name) / 'other-plan.json'
        elsewhere.write_text('{}', encoding='utf-8')
        with patch.object(production_entry.director, 'check') as check:
            with self.assertRaisesRegex(ValueError, 'project root'):
                production_entry.export_check(self.project, elsewhere)
            check.assert_not_called()

    def test_new_demo_cannot_pass_production_with_only_a_valid_plan(self):
        self.plan.write_text('{}', encoding='utf-8')
        (self.project / 'project-style-context.json').write_text(
            json.dumps({'generated_by': production_entry.OWNER}), encoding='utf-8')
        config = self.project / 'project.json'
        config.write_text('{"current_style_applied":false}', encoding='utf-8')
        with patch.object(production_entry.director, 'check', return_value={
                'render_ready': True, 'current_style_ready': True}) as check, \
                patch.object(ui.subprocess, 'run', return_value=SimpleNamespace(returncode=0)) as run:
            with self.assertRaises(SystemExit):
                self.run_entry(self.render_args())
            check.assert_not_called()
            run.assert_not_called()
            config.write_text('{"current_style_applied":true}', encoding='utf-8')
            self.assertEqual(0, self.run_entry(self.render_args()))
            check.assert_called_once()
            run.assert_called_once()

    def test_demo_is_explicit_and_stripped_on_either_side_of_separator(self):
        for args in (
                ['render', '--engine', 'base', '--demo', '--', '--project', str(self.project)],
                self.render_args('base') + ['--demo']):
            with patch.object(production_entry.director, 'check') as check, \
                    patch.object(ui.subprocess, 'run', return_value=SimpleNamespace(returncode=0)) as run:
                self.assertEqual(0, self.run_entry(args))
                check.assert_not_called()
                self.assertNotIn('--demo', run.call_args.args[0])
        with self.assertRaisesRegex(ValueError, 'mutually exclusive'):
            production_entry.export_check(self.project, self.plan, demo=True)
        self.assertFalse(production_entry.export_check(self.project, demo=True)['production_export'])

    def test_dry_run_checks_production_but_never_launches(self):
        self.plan.write_text('{}', encoding='utf-8')
        with patch.object(production_entry.director, 'check', return_value={
                'render_ready': True, 'current_style_ready': True}) as check, \
                patch.object(ui.subprocess, 'run') as run:
            args = ['render', '--engine', 'fusion', '--dry-run', '--', '--project', str(self.project)]
            self.assertEqual(0, self.run_entry(args))
            check.assert_called_once()
            run.assert_not_called()

    def test_all_creators_attach_current_context_without_restyling_or_claiming_approval(self):
        for engine in ('base', 'fusion', 'director', 'editorial'):
            destination = Path(self.temp.name) / engine
            def fake_backend(argv, check=False):
                destination.mkdir()
                if engine != 'editorial':
                    (destination / 'project.json').write_text(json.dumps({'originalField': 'keep', 'demo': True}), encoding='utf-8')
                (destination / 'studio.css').write_text('historical CSS', encoding='utf-8')
                return SimpleNamespace(returncode=0)
            with self.subTest(engine=engine), patch.object(ui.subprocess, 'run', side_effect=fake_backend):
                self.assertEqual(0, self.run_entry(['new', '--engine', engine, '--profile', 'adiao', '--', '--out', str(destination)]))
                config = json.loads((destination / 'project.json').read_text(encoding='utf-8'))
                context = json.loads((destination / 'project-style-context.json').read_text(encoding='utf-8'))
                self.assertEqual('adiao', config['styleProfile'])
                self.assertFalse(config['current_style_applied'])
                self.assertFalse(config['aestheticApproval'])
                self.assertEqual('adiao', context['style']['binding']['profile_id'])
                self.assertEqual('adiao', production_entry.style_registry.resolve(destination)['resolved_profile'])
                self.assertEqual('historical CSS', (destination / 'studio.css').read_text(encoding='utf-8'))
                if engine != 'editorial':
                    self.assertEqual('keep', config['originalField'])

    def test_existing_project_is_not_created_over_or_relabelled(self):
        target = self.project / 'project.json'
        target.write_text('{"keep":"original"}', encoding='utf-8')
        with patch.object(ui.subprocess, 'run') as run:
            with self.assertRaises(SystemExit):
                self.run_entry(['new', '--engine', 'editorial', '--', '--out', str(self.project)])
            run.assert_not_called()
        self.assertEqual('{"keep":"original"}', target.read_text(encoding='utf-8'))

    def test_narration_prepares_context_without_forwarding_unknown_flags(self):
        script = Path(self.temp.name) / 'narration.txt'
        script.write_text('保留原稿。', encoding='utf-8')
        def fake_backend(argv, check=False):
            self.assertNotIn('--script', argv)
            self.assertNotIn('--profile', argv)
            return SimpleNamespace(returncode=0)
        with patch.object(ui.subprocess, 'run', side_effect=fake_backend), \
                patch.object(production_entry.director, 'prepare') as prepare:
            self.assertEqual(0, self.run_entry(['new', '--engine', 'editorial', '--', '--out', str(self.project),
                                               '--script', str(script), '--profile', 'user-ui']))
            prepare.assert_called_once_with(script.resolve(), self.project.resolve(), 'user-ui', root=ui.ROOT)

    def test_new_director_authored_plan_is_not_consumed_as_export_option(self):
        args, options = production_entry.forwarded_options('new', ['--plan', 'authored.json', '--profile', 'user-ui'])
        self.assertEqual(['--plan', 'authored.json'], args)
        self.assertEqual('user-ui', options['profile'])

    def test_authored_director_project_profile_survives_default_creation(self):
        def fake_backend(argv, check=False):
            (self.project / 'project.json').write_text('{"styleProfile":"adiao","keep":1}', encoding='utf-8')
            return SimpleNamespace(returncode=0)
        with patch.object(ui.subprocess, 'run', side_effect=fake_backend):
            self.assertEqual(0, self.run_entry(['new', '--engine', 'director', '--', '--out', str(self.project), '--plan', 'authored.json']))
        config = json.loads((self.project / 'project.json').read_text(encoding='utf-8'))
        self.assertEqual('adiao', config['styleProfile'])
        self.assertEqual(1, config['keep'])


if __name__ == '__main__':
    unittest.main()
