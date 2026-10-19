"""Meaningful local tests; no media generation, network or dependencies."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import director
import style_registry


class DirectorTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'references').mkdir()
        for name in director.REQUIRED_REFS:
            (self.root / name).write_text('Reference', encoding='utf-8')
        (self.root / director.RECIPE_FILE).write_text(json.dumps({'recipes': [
            {'id': 'S01', 'title': '关系逐步建立', 'semantic_use': '解释因果'}]}), encoding='utf-8')
        self.script = self.root / '稿件.txt'
        self.script.write_bytes(b'\xef\xbb\xbf' + '先看关系。\r\n再看结果。'.encode('utf-8'))
        self.impl = self.root / 'scene.js'
        self.impl.write_text('// local implementation fixture', encoding='utf-8')
        self.audio = self.root / 'voice.wav'
        self.audio.write_bytes(b'local-path-fixture-not-a-decoded-audio-test')
        (self.root / 'alignment.json').write_text('{"fixture":true}', encoding='utf-8')
        self.plan_path = self.root / 'plan.json'
        self.plan = {
            'schema_version': 1,
            'source': {'path': '稿件.txt', 'sha256': hashlib.sha256(self.script.read_bytes()).hexdigest()},
            'style': {'tokens': {'background': 'white', 'text': 'black'}},
            'timing': {'basis': 'audio-aligned',
                       'audio_source': {'path': 'voice.wav', 'sha256': hashlib.sha256(self.audio.read_bytes()).hexdigest()},
                       'alignment_evidence': 'alignment.json'},
            'segments': [self.segment('one', '先看关系。'), self.segment('two', '再看结果。')],
        }

    def segment(self, ident, quote):
        return {'id': ident, 'quote': quote, 'context': '前后文说明', 'meaning': '当前对象的关系',
                'viewer_gap': '尚不清楚关系', 'carrier': 'diagram', 'why': '关系图能保持上下文',
                'recipe_ids': ['S01'], 'objects': ['object-a'],
                'events': [{'initial': '未建立', 'trigger': '原声落点', 'change': '连线建立', 'result': '关系可见'}],
                'focus': '当前连线', 'reading_exit': '关系看清后离开',
                'continuity': {'entry': '保留对象', 'exit': '结果进入下一段'},
                'implementation': {'path': 'scene.js'}, 'assets': []}

    def run_check(self, plan=None):
        self.plan_path.write_text(json.dumps(plan or self.plan, ensure_ascii=False), encoding='utf-8')
        return director.check(self.plan_path, self.root)

    def test_legal_plan_is_structurally_ready_but_not_media_certified(self):
        report = self.run_check()
        self.assertTrue(report['plan_valid'], report)
        self.assertTrue(report['render_ready'], report)
        self.assertIn('media decode', report['scope'])
        self.assertFalse(report['generation_submitted'])
        self.assertFalse(report['current_style_ready'])

    def bind_current_style(self):
        (self.root / 'references/profiles').mkdir(exist_ok=True)
        (self.root / 'user.md').write_text('current profile', encoding='utf-8')
        (self.root / 'fangmu.md').write_text('independent account', encoding='utf-8')
        (self.root / 'anchor.png').write_bytes(b'visual-reference-path-fixture')
        self.direction = {'id': 'current', 'status': 'user_selected_reference_direction',
            'direction_contract': {'revision': '2', 'summary': 'current black-purple direction',
                'visual_calibration': {'view_before_design': True, 'anchors': [{'frame': 'anchor.png'}]}}}
        (self.root / 'direction.json').write_text(json.dumps(self.direction), encoding='utf-8')
        registry = {'excluded_ui_projects': [{'path': 'rejected', 'path_component': 'rejected',
                     'reason': 'rejected UI', 'evidence': 'direction.json'}],
            'profiles': [{'id': 'user-ui', 'label': 'user', 'profile_path': 'user.md', 'sources': [],
                          'reference_directions': [{'id': 'current', 'guidance_path': 'direction.json'}]},
                         {'id': 'fangmu', 'label': 'fangmu', 'profile_path': 'fangmu.md', 'sources': []}]}
        (self.root / style_registry.REGISTRY).write_text(json.dumps(registry), encoding='utf-8')
        self.plan['style_contract_version'] = 1
        self.plan['style']['binding'] = style_registry.current_binding(
            style_registry.resolve(self.root, 'user-ui', root=self.root))

    def test_current_contract_is_bound_without_claiming_aesthetic_approval(self):
        self.bind_current_style()
        report = self.run_check()
        self.assertTrue(report['render_ready'], report)
        self.assertTrue(report['current_style_ready'], report)
        self.assertIn('not rendered-style or aesthetic approval', report['style_readiness_scope'])

    def test_new_contract_requires_current_binding_not_just_tokens(self):
        self.plan['style_contract_version'] = 1
        report = self.run_check()
        self.assertFalse(report['render_ready'])
        self.assertFalse(report['current_style_ready'])
        self.assertTrue(any('style.binding' in error for error in report['errors']))

    def test_changed_direction_revision_or_content_invalidates_bound_plan(self):
        self.bind_current_style()
        self.direction['direction_contract']['revision'] = '3'
        (self.root / 'direction.json').write_text(json.dumps(self.direction), encoding='utf-8')
        report = self.run_check()
        self.assertFalse(report['render_ready'])
        self.assertFalse(report['current_style_ready'])
        self.assertTrue(any('stale' in error for error in report['errors']))

    def test_missing_visual_anchor_blocks_current_binding(self):
        self.bind_current_style()
        (self.root / 'anchor.png').unlink()
        report = self.run_check()
        self.assertFalse(report['render_ready'])
        self.assertFalse(report['current_style_ready'])

    def test_rejected_direction_and_rejected_baseline_are_not_ready(self):
        self.bind_current_style()
        self.direction['status'] = 'rejected'
        (self.root / 'direction.json').write_text(json.dumps(self.direction), encoding='utf-8')
        self.assertFalse(self.run_check()['render_ready'])
        self.direction['status'] = 'user_selected_reference_direction'
        (self.root / 'direction.json').write_text(json.dumps(self.direction), encoding='utf-8')
        (self.root / 'rejected').mkdir()
        (self.root / 'rejected/video.mp4').write_bytes(b'not-approved')
        self.plan['style']['baseline'] = 'rejected/video.mp4'
        self.assertFalse(self.run_check()['current_style_ready'])

    def test_binding_cannot_silently_replace_explicit_project_account(self):
        self.bind_current_style()
        (self.root / 'project.json').write_text('{"profile":"fangmu"}', encoding='utf-8')
        report = self.run_check()
        self.assertFalse(report['render_ready'])
        self.assertFalse(report['current_style_ready'])
        self.assertTrue(any('project profile' in error for error in report['errors']))

    def test_ui_only_plan_does_not_require_unrelated_aigc_assets(self):
        self.bind_current_style()
        (self.root / 'references/aigc-assets.json').write_text(json.dumps({'style_sets': [
            {'id': 'girl', 'default_for_profiles': ['user-ui'], 'character_references': ['missing.png'],
             'assets': [{'id': 'unused', 'image_path': 'missing-scene.png', 'approval_state': 'approved_static_scene'}]}]}), encoding='utf-8')
        self.assertTrue(self.run_check()['render_ready'])

    def test_current_style_plan_does_not_skip_generated_action_references(self):
        self.bind_current_style()
        segment = self.generated_segment()
        del self.plan['aigc_contract_version']
        del segment['aigc']
        report = self.run_check()
        self.assertFalse(report['render_ready'])
        self.assertTrue(any('.aigc' in error for error in report['errors']))

    def test_check_uses_same_local_overlay_profile_as_prepare(self):
        self.bind_current_style()
        (self.root / 'local-user.md').write_text('current local profile extension', encoding='utf-8')
        (self.root / style_registry.LOCAL_REGISTRY).write_text(json.dumps({
            'schema_version': 1, 'profiles': [{'id': 'user-ui', 'profile_path': 'local-user.md'}]}), encoding='utf-8')
        director.prepare(self.script, self.root / 'context', 'user-ui', root=self.root)
        context = director.load_json(self.root / 'context/director-context.json')
        self.plan['style']['binding'] = context['style']['binding']
        report = self.run_check()
        self.assertTrue(report['current_style_ready'], report)
        self.assertTrue(report['render_ready'], report)

    def test_changed_source_invalidates_hash(self):
        self.script.write_bytes(self.script.read_bytes() + '新增内容'.encode('utf-8'))
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertTrue(any('sha256' in e for e in report['errors']))

    def test_reordered_segments_fail(self):
        self.plan['segments'].reverse()
        self.assertTrue(any('out of source order' in e for e in self.run_check()['errors']))

    def test_repeated_quote_needs_span_and_shared_sentence_needs_two_explicit_spans(self):
        self.script.write_text('重复。重复。', encoding='utf-8')
        self.plan['source']['sha256'] = hashlib.sha256(self.script.read_bytes()).hexdigest()
        self.plan['segments'] = [self.segment('one', '重复。'), self.segment('two', '重复。')]
        self.assertFalse(self.run_check()['plan_valid'])
        for s in self.plan['segments']:
            s['span'] = {'start': 0, 'end': 3}
        self.assertTrue(self.run_check()['plan_valid'])
        self.plan['segments'][1]['span'] = {'start': 3, 'end': 6}
        self.assertTrue(self.run_check()['plan_valid'])

    def test_span_must_match_exact_unicode_and_preserved_newlines(self):
        self.plan['segments'][1]['span'] = {'start': 7, 'end': 12}
        self.assertTrue(self.run_check()['plan_valid'])
        self.plan['segments'][1]['span']['start'] = 8
        self.assertFalse(self.run_check()['plan_valid'])

    def test_unknown_recipe_and_missing_implementation_fail(self):
        self.plan['segments'][0]['recipe_ids'] = ['UNKNOWN']
        self.plan['segments'][1]['implementation']['path'] = 'missing.js'
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertTrue(any('unknown recipe' in e for e in report['errors']))
        self.assertTrue(any('implementation.path' in e for e in report['errors']))

    def test_ready_asset_requires_file(self):
        self.plan['segments'][0]['assets'] = [{'kind': 'real', 'status': 'ready', 'path': 'missing.mp4', 'purpose': '操作证据'}]
        self.assertFalse(self.run_check()['plan_valid'])

    def test_pending_asset_blocks_render_even_when_plan_is_valid(self):
        self.plan['segments'][0]['assets'] = [{'kind': 'concept', 'status': 'planned', 'purpose': '补图'}]
        report = self.run_check()
        self.assertTrue(report['plan_valid'])
        self.assertFalse(report['render_ready'])

    def test_existing_presenter_track_needs_no_forced_recipe_or_extra_asset(self):
        self.plan['segments'][0]['carrier'] = 'presenter'
        self.plan['segments'][0]['recipe_ids'] = []
        self.plan['segments'][0]['assets'] = []
        report = self.run_check()
        self.assertTrue(report['plan_valid'], report)
        self.assertTrue(report['render_ready'], report)

    def test_missing_style_or_assets_does_not_pass(self):
        self.plan['style'] = {'tokens': {}}
        del self.plan['segments'][0]['assets']
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertFalse(report['render_ready'])

    def test_script_estimate_cannot_claim_media_source_clock(self):
        self.plan['timing'] = {'basis': 'script-estimate'}
        self.plan['segments'][0]['media_source'] = {'start': 10, 'end': 12}
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        del self.plan['segments'][0]['media_source']
        report = self.run_check()
        self.assertTrue(report['plan_valid'])
        self.assertFalse(report['render_ready'])

    def test_audio_alignment_requires_real_local_evidence_and_hash(self):
        self.plan['timing']['audio_source']['sha256'] = 'stale'
        del self.plan['timing']['alignment_evidence']
        self.assertFalse(self.run_check()['plan_valid'])

    def test_aigc_plan_is_only_a_prepared_job(self):
        s = self.plan['segments'][0]
        s['carrier'] = 'aigc'
        s['generation'] = {'positive_prompt': '同一人物拿起物件并交给另一人',
                           'negative_constraints': ['不要多格画面'], 'entry_state': '人物握住物件',
                           'exit_state': '另一人接住', 'subject_reference': '本期角色参考待选择', 'output_kind': 'video'}
        report = self.run_check()
        self.assertTrue(report['plan_valid'], report)
        self.assertFalse(report['render_ready'])
        self.assertEqual(len(report['generation_jobs']), 1)
        self.assertFalse(report['generation_jobs'][0]['eligible_for_submission'])
        s['generation']['motion'] = 'static-pan-zoom'
        self.assertFalse(self.run_check()['plan_valid'])

    def test_aigc_image_cannot_be_mislabeled_as_finished_video(self):
        (self.root / 'still.png').write_bytes(b'image-path-fixture')
        s = self.plan['segments'][0]
        s['carrier'] = 'aigc'
        s['assets'] = [{'kind': 'generated', 'path': 'still.png', 'status': 'ready', 'purpose': '最终动作视频', 'source': '本机生成'}]
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertTrue(any('static image' in e for e in report['errors']))

    def generated_segment(self):
        (self.root / 'existing.mp4').write_bytes(b'path-fixture-only')
        (self.root / 'reference.png').write_bytes(b'path-fixture-only')
        self.plan['aigc_contract_version'] = 1
        segment = self.plan['segments'][0]
        segment['carrier'] = 'aigc'
        segment['assets'] = [{'kind': 'generated', 'status': 'ready', 'path': 'existing.mp4',
                              'purpose': '已有动作片段', 'source': 'fixture provenance'}]
        segment['aigc'] = {
            'character_refs': ['reference.png'], 'scene_ref': 'reference.png',
            'style_ref': 'scene.js', 'edit_duration_seconds': 2.5,
            'action_beats': [{'start_seconds': 0, 'end_seconds': 1, 'action': '递出资料'},
                             {'start_seconds': 1, 'end_seconds': 2, 'action': '对方接稳'}],
            'result_hold_seconds': 0.5,
        }
        return segment

    def test_new_aigc_contract_checks_real_local_references(self):
        segment = self.generated_segment()
        self.assertTrue(self.run_check()['plan_valid'])
        segment['aigc']['character_refs'] = ['missing-character.png']
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertTrue(any('character_refs[0]' in item for item in report['errors']))

    def test_new_aigc_contract_catches_overlong_and_overlapping_action(self):
        segment = self.generated_segment()
        segment['aigc']['action_beats'][1]['start_seconds'] = 0.5
        self.assertTrue(any('not overlap' in item for item in self.run_check()['errors']))
        segment['aigc']['action_beats'][1].update(start_seconds=1, end_seconds=3)
        report = self.run_check()
        self.assertTrue(any('action ends after' in item for item in report['errors']))
        segment['aigc']['action_beats'][1]['end_seconds'] = 2.2
        self.assertTrue(any('final action plus result hold' in item for item in self.run_check()['errors']))

    def test_no_character_scene_requires_reason_instead_of_forced_girl(self):
        segment = self.generated_segment()
        segment['aigc'].update(character_mode='none', character_refs=[], character_reason='此段只解释设备内部流动，无人物。')
        self.assertTrue(self.run_check()['plan_valid'])
        del segment['aigc']['character_reason']
        self.assertTrue(any('character_reason' in item for item in self.run_check()['errors']))

    def test_versioned_contract_applies_to_generated_mixed_but_not_diagrams(self):
        segment = self.generated_segment()
        segment['carrier'] = 'mixed'
        del segment['aigc']
        self.assertFalse(self.run_check()['plan_valid'])
        segment['assets'] = []
        segment['carrier'] = 'diagram'
        self.assertTrue(self.run_check()['plan_valid'])

    def test_legacy_aigc_without_new_contract_remains_compatible(self):
        segment = self.generated_segment()
        del self.plan['aigc_contract_version']
        del segment['aigc']
        report = self.run_check()
        self.assertTrue(report['plan_valid'])
        self.assertTrue(report['render_ready'])
        self.assertTrue(any('legacy plan' in item for item in report['warnings']))

    def test_invalid_aigc_numbers_and_version_report_errors_without_crash(self):
        segment = self.generated_segment()
        segment['aigc'].update(edit_duration_seconds=float('nan'), result_hold_seconds=True)
        segment['aigc']['action_beats'][0]['end_seconds'] = 'soon'
        self.plan['aigc_contract_version'] = True
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertTrue(any('aigc_contract_version' in item for item in report['errors']))
        self.assertGreaterEqual(len(report['errors']), 4)

    def test_existing_generated_video_requires_provenance_to_skip_prompt(self):
        (self.root / 'existing.mp4').write_bytes(b'container-path-fixture-not-media-verified')
        s = self.plan['segments'][0]
        s['carrier'] = 'aigc'
        s['assets'] = [{'kind': 'generated', 'path': 'existing.mp4', 'status': 'ready', 'purpose': '既有片段'}]
        self.assertFalse(self.run_check()['plan_valid'])
        s['assets'][0]['source'] = '用户已提供的本机生成片段；复用现有素材'
        report = self.run_check()
        self.assertTrue(report['plan_valid'], report)
        self.assertTrue(report['render_ready'])
        self.assertEqual(report['generation_jobs'], [])

    def test_prepare_preserves_bom_source_and_is_idempotent(self):
        original = self.script.read_bytes()
        folder = self.root / 'project'
        first = director.prepare(self.script, folder, root=self.root)
        self.assertEqual(len(first['created_or_updated']), 2)
        context = director.load_json(folder / 'director-context.json')
        self.assertEqual(context['source']['text'], '先看关系。\r\n再看结果。')
        self.assertIsNone(context['style']['profile'])
        self.assertEqual(self.script.read_bytes(), original)
        second = director.prepare(self.script, folder, root=self.root)
        self.assertEqual(len(second['unchanged']), 2)

    def test_prepare_requires_force_and_never_overwrites_unowned_file(self):
        folder = self.root / 'project'
        director.prepare(self.script, folder, root=self.root)
        before = (folder / 'director-context.json').read_bytes()
        self.script.write_bytes(self.script.read_bytes() + b' new')
        with self.assertRaises(ValueError):
            director.prepare(self.script, folder, root=self.root)
        self.assertEqual((folder / 'director-context.json').read_bytes(), before)
        director.prepare(self.script, folder, force=True, root=self.root)
        (folder / 'director-brief.md').write_text('user-owned notes', encoding='utf-8')
        self.script.write_bytes(self.script.read_bytes() + b' another')
        before = (folder / 'director-context.json').read_bytes()
        with self.assertRaises(ValueError):
            director.prepare(self.script, folder, force=True, root=self.root)
        self.assertEqual((folder / 'director-context.json').read_bytes(), before)
        self.assertEqual((folder / 'director-brief.md').read_text(encoding='utf-8'), 'user-owned notes')

    def test_prepare_never_overwrites_narration_at_reserved_output_name(self):
        target = self.root / 'director-brief.md'
        target.write_text('original narration', encoding='utf-8')
        with self.assertRaises(ValueError):
            director.prepare(target, self.root, force=True, root=self.root)
        self.assertEqual(target.read_text(encoding='utf-8'), 'original narration')

    def test_recipe_lookup_uses_catalog_without_semantic_guessing(self):
        self.assertEqual(director.recipes(root=self.root)['count'], 1)
        self.assertEqual(director.recipes('S01', self.root)['semantic_use'], '解释因果')
        with self.assertRaises(ValueError):
            director.recipes('unknown', self.root)

    def test_malformed_enum_types_report_errors_without_crashing(self):
        self.plan['timing']['basis'] = []
        self.plan['segments'][0]['carrier'] = {}
        self.plan['segments'][0]['assets'] = [{'kind': [], 'status': {}, 'purpose': 'bad fixture'}]
        report = self.run_check()
        self.assertFalse(report['plan_valid'])
        self.assertGreaterEqual(len(report['errors']), 4)


if __name__ == '__main__':
    unittest.main()
