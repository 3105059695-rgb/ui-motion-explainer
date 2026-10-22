"""Selection, provenance and renderer wiring for complete-scene production."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import scene_builder as builder


class CompleteSceneEntryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name).resolve()
        self.root = self.base / 'skill'
        for key in builder.PACKS:
            folder = self.root / builder.ADU / 'packs' / key
            folder.mkdir(parents=True)
            (folder / 'scenes.js').write_text('fixture source; not visual evidence', encoding='utf-8')
            manifest = {
                'id': key + '-complete', 'fps': 60, 'width': 1920, 'height': 1080,
                'scenes': [
                    {'id': 's01', 'title': 'Question', 'source': {'start': 0, 'end': 3},
                     'sourceBlockSha256': 'a' * 64,
                     'cues': [{'id': 'question', 'at': .5, 'required': True},
                              {'id': 'optional', 'at': 2, 'required': False}],
                     'slots': [{'id': 'headline', 'type': 'text', 'required': True, 'sourceText': 'OLD EPISODE'},
                               {'id': 'image', 'type': 'image', 'required': True}],
                     'motionWindows': [{'start': 0, 'end': 1, 'anchorCue': 'question'}]},
                    {'id': 's02', 'title': 'Result', 'source': {'start': 3, 'end': 5},
                     'sourceBlockSha256': 'b' * 64, 'slots': [], 'cues': [], 'motionWindows': []},
                ]}
            self.write(folder / 'manifest.json', manifest)
        self.spec = self.base / 'episode.json'
        self.presenter = self.base / '原声.mp4'
        self.presenter.write_bytes(b'fixture only; not decoded media')
        self.project = self.base / 'project'

    def write(self, path, value):
        path.write_text(json.dumps(value, ensure_ascii=False), encoding='utf-8')

    def filled_spec(self):
        builder.scaffold('anim3', ['s02'], self.spec, root=self.root)
        value = builder.read_json(self.spec)
        value['brand'] = 'Current episode'
        value['scenes'][0]['durationFrames'] = 120
        self.write(self.spec, value)
        return value

    def fake_build(self, script, args):
        self.assertEqual('build_macro_project.py', script.name)
        self.assertEqual(['build', self.root / builder.ADU / 'packs/anim3',
                          self.spec, self.presenter], args[:4])
        destination = args[4]
        self.assertTrue(destination.is_relative_to(self.base))
        destination.mkdir()
        for name in ('index.html', 'scenes.js', 'macro_plan.js', 'macro_main.js', 'voice.wav'):
            (destination / name).write_text('fixture only', encoding='utf-8')
        self.write(destination / 'macro_plan.json', {
            'fps': 60, 'width': 1920, 'height': 1080, 'durationFrames': 120, 'durationSeconds': 2,
        })
        return {'command': ['fixture'], 'stdout': ''}

    def prepare(self, source_name='原稿.txt'):
        import director
        self.project.mkdir()
        source = self.project / source_name
        source.write_text('原稿必须保留。', encoding='utf-8')
        self.write(self.project / 'director-context.json', {
            'generated_by': director.OWNER, 'project': str(self.project),
            'source': {'path': str(source), 'sha256': builder.sha256(source)},
        })
        (self.project / 'director-brief.md').write_text(director.MARKER + '\nPrepared fixture\n', encoding='utf-8')
        return {item.name: item.read_bytes() for item in self.project.iterdir()}

    def test_actual_catalog_exposes_21_scenes_and_exact_parameter_contracts(self):
        result = builder.scene_catalog()
        self.assertEqual(21, len(result['scenes']))
        self.assertEqual([12, 9], [pack['scene_count'] for pack in result['packs']])
        self.assertTrue(all(row['source']['exists'] for row in result['scenes']))
        self.assertTrue(all(not row['runtime_verified_this_run'] for row in result['scenes']))
        record = builder.inspect_scene('anim3', 's01')
        self.assertTrue(record['scene_parameters']['slots'])
        self.assertTrue(record['motion_windows'])
        self.assertIn('preview', record)
        self.assertEqual('s01', record['source']['selector'])

    def test_scaffold_is_an_ordered_subset_with_independent_repeated_instances(self):
        builder.scaffold('anim3', 's02,s01,s02', self.spec, root=self.root)
        data = builder.read_json(self.spec)
        self.assertEqual(['s02', 's01', 's02'], [row['sceneId'] for row in data['scenes']])
        self.assertEqual(['s02-01', 's01-01', 's02-02'], [row['id'] for row in data['scenes']])
        self.assertIsNone(data['scenes'][1]['durationFrames'])
        self.assertEqual({'question': {'at': None}}, data['scenes'][1]['cues'])
        self.assertEqual({'headline': None, 'image': None}, data['scenes'][1]['slots'])
        self.assertNotIn('OLD EPISODE', self.spec.read_text(encoding='utf-8'))
        self.assertEqual('none', data['music']['mode'])

    def test_scaffold_rejects_unknown_scene_and_preserves_existing_files(self):
        with self.assertRaisesRegex(ValueError, 'Unknown'):
            builder.scaffold('anim3', 's99', self.spec, root=self.root)
        self.assertFalse(self.spec.exists())
        self.spec.write_text('keep', encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'Refusing'):
            builder.scaffold('anim3', 's01', self.spec, root=self.root)
        self.assertEqual('keep', self.spec.read_text(encoding='utf-8'))

    def test_missing_bindings_and_changed_manifest_block_before_media_import(self):
        builder.scaffold('anim3', 's01', self.spec, root=self.root)
        with patch.object(builder, '_run_python') as call:
            with self.assertRaisesRegex(ValueError, 'fill current narration bindings'):
                builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)
            call.assert_not_called()
        manifest = self.root / builder.ADU / 'packs/anim3/manifest.json'
        data = builder.read_json(manifest)
        data['version'] = 'changed'
        self.write(manifest, data)
        with self.assertRaisesRegex(ValueError, 'manifest changed'):
            builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)

    def test_build_delegates_selected_pack_and_records_actual_source_identity(self):
        value = self.filled_spec()
        with patch.object(builder, '_run_python', side_effect=self.fake_build) as call:
            result = builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)
        self.assertEqual(1, call.call_count)
        self.assertEqual('built-not-visually-reviewed', result['status'])
        receipt = builder.read_json(self.project / 'scene-build-receipt.json')
        self.assertEqual([{'instance_id': 's02-01', 'scene_id': 's02', 'source_block_sha256': 'b' * 64}],
                         receipt['selected_scenes'])
        self.assertEqual(builder.sha256(self.presenter), receipt['presenter']['sha256'])
        self.assertFalse(receipt['full_realtime_av_review'])
        self.assertFalse(receipt['user_approved'])
        self.assertEqual(value, builder.read_json(self.project / 'scene-spec.json'))

    def test_build_merges_only_into_verified_prepare_context_and_preserves_original_bytes(self):
        self.filled_spec()
        before = self.prepare()
        with patch.object(builder, '_run_python', side_effect=self.fake_build):
            result = builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)
        self.assertEqual(str(self.project), result['project'])
        for name, data in before.items():
            self.assertEqual(data, (self.project / name).read_bytes())
        self.assertTrue((self.project / 'index.html').is_file())
        self.assertFalse(list(self.base.glob('.ui-scene-build-*')))

    def test_merge_conflict_is_checked_before_any_generated_file_is_installed(self):
        self.filled_spec()
        before = self.prepare('scenes.js')
        with patch.object(builder, '_run_python', side_effect=self.fake_build):
            with self.assertRaisesRegex(ValueError, 'conflicts with prepared original'):
                builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)
        self.assertEqual(before, {item.name: item.read_bytes() for item in self.project.iterdir()})
        self.assertFalse(list(self.base.glob('.ui-scene-build-*')))

    def test_existing_real_project_is_rejected_before_builder_runs(self):
        self.filled_spec()
        self.project.mkdir()
        (self.project / 'index.html').write_text('existing creative work', encoding='utf-8')
        with patch.object(builder, '_run_python') as call:
            with self.assertRaisesRegex(ValueError, 'existing project files'):
                builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)
            call.assert_not_called()

    def test_render_passes_actual_clock_and_existing_environment_with_preserved_audio(self):
        self.filled_spec()
        with patch.object(builder, '_run_python', side_effect=self.fake_build):
            builder.build(self.spec, self.presenter, self.project, root=self.root, legacy_spec=True)
        output = self.base / 'final.mp4'

        def fake_render(script, args):
            self.assertEqual('export_project.py', script.name)
            self.assertEqual(self.project, args[0])
            self.assertEqual(output, args[1])
            self.assertEqual(self.project / 'voice.wav', args[args.index('--audio') + 1])
            self.assertEqual(60, args[args.index('--fps') + 1])
            self.assertEqual(2, args[args.index('--end') + 1])
            self.assertEqual('existing-browser', args[args.index('--browser') + 1])
            self.assertEqual('existing-playwright', args[args.index('--playwright-module') + 1])
            output.write_bytes(b'fixture only; not rendered media')
            self.write(Path(str(output) + '.manifest.json'), {'fixture': True})
            return {'command': ['fixture'], 'stdout': ''}

        with patch.object(builder, '_run_python', side_effect=fake_render):
            result = builder.render(self.project, output, browser='existing-browser',
                                    playwright_module='existing-playwright', root=self.root, legacy_spec=True)
        self.assertEqual('preserved-voice-only', result['audio']['mode'])
        self.assertFalse(result['full_realtime_av_review'])
        self.assertFalse(result['user_approved'])
        with patch.object(builder, '_run_python') as call:
            with self.assertRaisesRegex(ValueError, 'Refusing'):
                builder.render(self.project, output, root=self.root, legacy_spec=True)
            call.assert_not_called()


if __name__ == '__main__':
    unittest.main()
