"""Shared-plan bridge tests. Builders/probes are mocked; no media is generated."""
import copy
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

import director
import production_entry
import scene_builder as builder
import scene_plan
import style_registry
import test_scene_builder as scene_fixtures


class ScenePlanTests(unittest.TestCase):
    setUp = scene_fixtures.CompleteSceneEntryTests.setUp
    write = scene_fixtures.CompleteSceneEntryTests.write
    prepare = scene_fixtures.CompleteSceneEntryTests.prepare

    def author(self):
        self.prepare()
        refs = self.root / 'references'
        (refs / 'profiles').mkdir(parents=True)
        self.write(refs / 'semantic-editing-recipes.json', {'recipes': []})
        (self.root / 'profile.md').write_text('fixture direction', encoding='utf-8')
        (self.root / 'anchor.png').write_bytes(b'fixture, not viewed pixels')
        self.write(self.root / 'direction.json', {
            'id': 'fixture-direction', 'status': 'user_selected_reference_direction',
            'direction_contract': {'revision': '1', 'visual_calibration': {
                'view_before_design': True, 'anchors': [{'frame': 'anchor.png'}]}}})
        self.write(self.root / style_registry.REGISTRY, {
            'default_profile': 'user-ui', 'profiles': [{
                'id': 'user-ui', 'label': 'User', 'profile_path': 'profile.md', 'sources': [],
                'reference_directions': [{'id': 'fixture-direction', 'guidance_path': 'direction.json'}]}]})
        source = self.project / '原稿.txt'
        quote = source.read_text(encoding='utf-8')
        output = {'start_seconds': 0, 'end_seconds': 2}
        span = {'start': 0, 'end': len(quote)}
        alignment = self.project / 'alignment.json'
        self.write(alignment, {'schema_version': 1, 'source_sha256': builder.sha256(source),
            'audio_sha256': builder.sha256(self.presenter),
            'segments': [{'id': 'first-event', 'span': span, 'source_audio': output}]})
        self.plan = {
            'schema_version': 1, 'style_contract_version': 1,
            'source': {'path': '原稿.txt', 'sha256': builder.sha256(source)},
            'style': {'tokens': {'background': '#100b1b'}, 'binding': style_registry.current_binding(
                style_registry.resolve(self.project, 'user-ui', root=self.root))},
            'delivery': {'scope': 'full', 'duration_seconds': 2},
            'timing': {'basis': 'audio-aligned', 'audio_source': scene_plan.fact(self.presenter),
                'alignment_evidence': 'alignment.json', 'alignment_sha256': builder.sha256(alignment)},
            'production': {'backend': 'complete-scenes', 'pack': 'anim3', 'settings': {'brand': 'Current episode'}},
            'segments': [{'id': 'first-event', 'quote': quote, 'span': span, 'output': output,
                'source_audio': output, 'scene': {'id': 's02', 'slots': {}, 'cues': {}},
                'context': '完整前后文', 'meaning': '保留原稿', 'viewer_gap': '需要看清关系',
                'carrier': 'diagram', 'why': '保留对象和上下文', 'recipe_ids': [], 'objects': ['one'],
                'events': [{'initial': '未关联', 'trigger': '原声', 'change': '显现', 'result': '关系清楚'}],
                'focus': '关系', 'reading_exit': '看清再走', 'continuity': {'entry': '保留对象', 'exit': '留住关系'},
                'implementation': {'path': '.'}, 'assets': []}]}
        self.plan_path = self.project / 'director-plan.json'
        self.write(self.plan_path, self.plan)
        return {path: path.read_bytes() for path in self.project.iterdir() if path.is_file()}

    def fake_build(self, script, args):
        self.assertEqual(script.name, 'build_macro_project.py')
        spec, destination = builder.read_json(args[2]), args[4]
        self.assertEqual(args[3], self.presenter)
        destination.mkdir()
        for name in ('index.html', 'scenes.js', 'macro_plan.js', 'macro_main.js', 'voice.wav'):
            (destination / name).write_text('fixture only; not rendered media', encoding='utf-8')
        self.write(destination / 'macro_plan.json', {
            'fps': 60, 'width': 1920, 'height': 1080, 'durationFrames': 120, 'durationSeconds': 2,
            'scenes': [{'id': spec['scenes'][0]['id'], 'sceneId': 's02', 'startFrame': 0, 'endFrame': 120}]})
        return {'command': ['fixture'], 'stdout': ''}

    def build(self):
        with patch.object(builder, '_run_python', side_effect=self.fake_build) as invoke:
            result = builder.build(None, self.presenter, self.project, root=self.root, plan_path=self.plan_path)
        self.assertEqual(invoke.call_count, 1)
        return result

    def test_shared_plan_compiles_without_media_and_preserves_prepare_context(self):
        before = self.author()
        spec_path = self.base / 'derived.json'
        with patch.object(builder, '_run_python') as invoke:
            compiled = scene_plan.compile_plan(self.plan_path, spec_path, self.root)
            invoke.assert_not_called()
        self.assertFalse(compiled['media_generated'])
        self.assertFalse(compiled['production_ready'])
        spec = builder.read_json(spec_path)
        self.assertEqual(spec['scenes'][0]['id'], 'first-event')
        self.assertEqual(spec['scenes'][0]['durationFrames'], 120)
        self.assertFalse(director.check(self.plan_path, root=self.root)['production_ready'])
        self.build()
        for path, data in before.items():
            self.assertEqual(path.read_bytes(), data)
        self.assertEqual(builder.read_json(self.project / 'scene-spec.json'), spec)
        preflight = production_entry.export_check(self.project, root=self.root)
        self.assertTrue(preflight['production_export'])
        self.assertEqual(preflight['backend'], scene_plan.BACKEND)
        self.assertEqual(preflight['selection_evidence']['ledger'][0]['segment_id'], 'first-event')
        self.assertFalse(list(self.base.glob('.ui-scene-*')))

    def test_common_semantic_rules_and_actual_alignment_still_block_binding(self):
        self.author()
        cases = [
            ('events', lambda plan: plan['segments'][0].update(events=[])),
            ('alignment', lambda plan: plan['timing'].update(alignment_sha256='0' * 64)),
            ('coverage', lambda plan: plan['delivery'].update(duration_seconds=3)),
            ('frame clock', lambda plan: plan['segments'][0]['output'].update(end_seconds=2.001)),
            ('source_audio', lambda plan: plan['segments'][0].update(source_audio={'start_seconds': 1, 'end_seconds': 3})),
        ]
        for label, mutate in cases:
            modified = copy.deepcopy(self.plan)
            mutate(modified)
            self.write(self.plan_path, modified)
            with self.subTest(label=label), patch.object(builder, '_run_python') as invoke:
                with self.assertRaises(ValueError):
                    scene_plan.compile_plan(self.plan_path, self.base / 'never.json', self.root)
                invoke.assert_not_called()
                self.assertFalse((self.base / 'never.json').exists())

    def test_plan_original_spec_runtime_and_pack_drift_each_block_export(self):
        self.author()
        self.build()
        targets = [
            self.plan_path, self.project / '原稿.txt', self.presenter,
            self.project / 'alignment.json', self.project / 'scene-spec.json',
            self.project / 'macro_plan.json', self.project / 'scenes.js',
            self.root / builder.ADU / 'packs/anim3/scenes.js',
        ]
        for target in targets:
            original = target.read_bytes()
            # Whitespace preserves JSON but changes raw source identity. Scene spec
            # also needs a semantic change, since it is canonically compared.
            if target.name == 'scene-spec.json':
                value = builder.read_json(target)
                value['brand'] = 'Wrong episode'
                self.write(target, value)
            else:
                target.write_bytes(original + b' ')
            with self.subTest(target=target.name):
                with self.assertRaises(ValueError):
                    production_entry.export_check(self.project, root=self.root)
            target.write_bytes(original)
        self.assertTrue(production_entry.export_check(self.project, root=self.root)['production_export'])

    def test_real_project_and_legacy_bypass_are_blocked_before_builder_or_renderer(self):
        self.author()
        (self.project / 'existing-edit.txt').write_text('keep', encoding='utf-8')
        with patch.object(builder, '_run_python') as invoke:
            with self.assertRaisesRegex(ValueError, 'existing project'):
                builder.build(None, self.presenter, self.project, root=self.root, plan_path=self.plan_path)
            invoke.assert_not_called()
        self.assertEqual((self.project / 'existing-edit.txt').read_text(), 'keep')

    def test_output_verification_reuses_stream_duration_and_hash_checks(self):
        self.author()
        self.build()
        output = self.base / 'fixture-output.mp4'
        output.write_bytes(b'fixture only; ffprobe mocked')
        for duration, streams, expected in (
                ('2', [{'codec_type': 'video'}, {'codec_type': 'audio'}], True),
                ('4', [{'codec_type': 'video'}, {'codec_type': 'audio'}], False),
                ('2', [{'codec_type': 'video'}], False),
                ('2', [{'codec_type': 'video'}, {'codec_type': 'audio', 'duration': '0.5'}], False)):
            probe = subprocess.CompletedProcess([], 0, json.dumps({
                'format': {'duration': duration}, 'streams': streams}), '')
            with patch.object(production_entry.subprocess, 'run', return_value=probe):
                report = production_entry.verify_output(self.project, output, root=self.root, ffprobe='existing')
            self.assertEqual(report['technical_passed'], expected)
            self.assertFalse(report['full_realtime_av_review'])
            self.assertFalse(report['aesthetic_approval'])

    def test_scene_render_cannot_skip_common_preflight_or_post_output_checks(self):
        self.author()
        self.build()
        output = self.base / 'fixture-output.mp4'
        with patch.object(builder, '_run_python') as invoke:
            with self.assertRaisesRegex(ValueError, 'cannot bypass'):
                builder.render(self.project, output, root=self.root, legacy_spec=True)
            invoke.assert_not_called()
        self.plan['segments'][0]['events'] = []
        self.write(self.plan_path, self.plan)
        with patch.object(builder, '_run_python') as invoke:
            with self.assertRaisesRegex(ValueError, 'Production export blocked'):
                builder.render(self.project, output, root=self.root)
            invoke.assert_not_called()

    def test_handwritten_spec_requires_explicit_compatibility_mode(self):
        with patch.object(builder, '_run_python') as invoke:
            with self.assertRaisesRegex(ValueError, '--legacy-spec'):
                builder.build(self.spec, self.presenter, self.project, root=self.root)
            invoke.assert_not_called()

    def test_formal_scene_export_calls_shared_verifier_and_records_audio_identity(self):
        self.author()
        self.build()
        output = self.base / 'fixture-output.mp4'

        def fake_render(script, args):
            self.assertEqual(script.name, 'export_project.py')
            self.assertEqual(args[args.index('--audio') + 1], self.project / 'voice.wav')
            output.write_bytes(b'fixture only; not a video render')
            self.write(Path(str(output) + '.manifest.json'), {'fixture': True})
            return {'command': ['fixture'], 'stdout': ''}

        probe = subprocess.CompletedProcess([], 0, json.dumps({
            'format': {'duration': '2'}, 'streams': [{'codec_type': 'video'}, {'codec_type': 'audio'}]}), '')
        with patch.object(builder, '_run_python', side_effect=fake_render), \
                patch.object(production_entry.shutil, 'which', return_value='existing-ffprobe'), \
                patch.object(production_entry.subprocess, 'run', return_value=probe):
            report = builder.render(self.project, output, root=self.root)
        self.assertEqual(report['export_mode'], 'production')
        self.assertTrue(report['technical_passed'])
        self.assertEqual(report['audio']['sha256'], builder.sha256(self.project / 'voice.wav'))
        self.assertEqual(report['verification']['source_bindings']['audio'], self.plan['timing']['audio_source'])
        self.assertFalse(report['full_realtime_av_review'])
        self.assertFalse(report['user_approved'])


if __name__ == '__main__':
    unittest.main()
