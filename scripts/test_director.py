"""Meaningful local tests; no media generation, network or dependencies."""
import hashlib
import io
import json
from contextlib import redirect_stdout
from pathlib import Path
import tempfile
import unittest
import subprocess
from unittest.mock import patch

import director
import style_registry


class DirectorTests(unittest.TestCase):
    def test_presenter_source_preserves_embedded_audio_without_claiming_alignment(self):
        media = self.root / 'presenter.mp4'
        media.write_bytes(b'fixture')
        probe = {'format': {'duration': '12.5'}, 'streams': [
            {'index': 0, 'codec_type': 'video', 'width': 1920, 'height': 1080},
            {'index': 1, 'codec_type': 'audio', 'sample_rate': '48000'}]}
        with patch.object(director.shutil, 'which', return_value='ffprobe'), patch.object(director.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0, json.dumps(probe), '')):
            result = director.presenter_context(media)
        self.assertEqual(result['audio_master']['path'], str(media.resolve()))
        self.assertEqual(result['audio_master']['stream_index'], 1)
        self.assertEqual(result['audio_master']['playback_rate'], 1)
        self.assertEqual(result['alignment_status'], 'not-yet-aligned')
        self.assertFalse(result['full_realtime_av_review'])
        self.assertEqual(result['sha256'], hashlib.sha256(media.read_bytes()).hexdigest())

    def test_presenter_source_rejects_missing_audio_or_video(self):
        media = self.root / 'source.mp4'
        media.write_bytes(b'fixture')
        for stream, message in (({'index': 0, 'codec_type': 'video'}, 'no embedded voice'),
                                ({'index': 0, 'codec_type': 'audio'}, 'real video stream')):
            with self.subTest(stream=stream), patch.object(director.shutil, 'which', return_value='ffprobe'), patch.object(director.subprocess, 'run', return_value=subprocess.CompletedProcess([], 0, json.dumps({'format': {'duration': '12'}, 'streams': [stream]}), '')):
                with self.assertRaisesRegex(ValueError, message):
                    director.presenter_context(media)

    def test_production_cli_distinguishes_structure_diagnostic_from_preflight(self):
        report = {'plan_valid': True, 'render_ready': True, 'current_style_ready': True, 'production_ready': False}
        for flag, expected in (([], 0), (['--production'], 1), (['--require-production'], 1)):
            with self.subTest(flag=flag), patch.object(director, 'check', return_value=dict(report)), redirect_stdout(io.StringIO()) as capture:
                result = director.main(['check', '--plan', 'legacy.json', *flag])
            self.assertEqual(result, expected)
            self.assertEqual(json.loads(capture.getvalue())['check_passed'], expected == 0)
        report['production_ready'] = True
        with patch.object(director, 'check', return_value=report), redirect_stdout(io.StringIO()):
            self.assertEqual(director.main(['check', '--plan', 'ready.json', '--production']), 0)

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
        self.assertFalse(report['production_ready'])

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
        self.assertFalse(report['production_ready'], report)
        self.assertFalse(report['selection_ready'], report)
        self.assertIn('not rendered-style or aesthetic approval', report['style_readiness_scope'])

    def enable_unified(self):
        self.bind_current_style()
        registry_path = self.root / style_registry.REGISTRY
        registry = director.load_json(registry_path)
        registry['unified_production'] = {'enabled': True, 'profile_id': 'user-ui',
            'guidance_path': 'references/library.md', 'account_visual_routing': False,
            'whole_film_recommendations': False}
        registry_path.write_text(json.dumps(registry), encoding='utf-8')
        (self.root / 'references/library.md').write_text('Current effect-library design source', encoding='utf-8')

    def test_unified_fixture_without_default_direction_warns_on_historical_binding(self):
        self.enable_unified()
        (self.root / 'direction.json').unlink()
        (self.root / 'anchor.png').unlink()
        self.plan['style'].update(profile='missing-old-account.md', baseline='missing-old-whole-film.mp4', applied=True)
        report = self.run_check()
        self.assertTrue(report['plan_valid'], report)
        self.assertTrue(report['current_style_ready'], report)
        self.assertTrue(any('historical binding is not current' in value for value in report['warnings']))
        self.assertEqual(report['assessment']['visual_style'], 'not-assessed')
        self.assertEqual(report['assessment']['user_approval'], 'not-assessed')
        self.assertFalse(report['production_ready'])  # Selection/runtime evidence is still absent.

    def test_unified_current_binding_detects_changed_library(self):
        self.enable_unified()
        self.plan['style']['binding'] = style_registry.current_binding(style_registry.resolve(self.root, root=self.root))
        self.assertTrue(self.run_check()['current_style_ready'])
        (self.root / 'references/library.md').write_text('Updated current library', encoding='utf-8')
        report = self.run_check()
        self.assertFalse(report['current_style_ready'])
        self.assertTrue(any('effect-library' in value and 'stale' in value for value in report['errors']))

    def test_shared_default_requires_current_binding_and_never_grants_visual_approval(self):
        self.enable_unified()
        registry_path = self.root / style_registry.REGISTRY
        registry = director.load_json(registry_path)
        registry['unified_production'].update(
            default_direction={'id': 'current', 'guidance_path': 'direction.json'},
            direction_source='fred-talk-default')
        registry_path.write_text(json.dumps(registry), encoding='utf-8')
        for binding in (self.plan['style']['binding'], None):
            self.plan['style']['binding'] = binding
            report = self.run_check()
            self.assertFalse(report['current_style_ready'])
            self.assertTrue(any('must be bound from direct prepare' in error for error in report['errors']))
        self.plan['style']['binding'] = style_registry.current_binding(style_registry.resolve(self.root, root=self.root))
        report = self.run_check()
        self.assertTrue(report['current_style_ready'], report)
        self.assertEqual(report['assessment']['visual_style'], 'not-assessed')

    def test_unified_current_resources_and_actual_media_still_fail_when_missing(self):
        self.enable_unified()
        (self.root / 'references/library.md').unlink()
        self.assertFalse(self.run_check()['current_style_ready'])
        (self.root / 'references/library.md').write_text('Current library', encoding='utf-8')
        self.plan['segments'][0]['assets'] = [{'kind': 'real', 'status': 'ready', 'path': 'missing-current-video.mp4',
            'purpose': 'Current narration footage'}]
        self.audio.unlink()
        report = self.run_check()
        self.assertTrue(any('missing-current-video.mp4' in value for value in report['errors']))
        self.assertTrue(any('timing.audio_source.path' in value for value in report['errors']))

    def test_unified_without_legacy_binding_can_use_current_library(self):
        self.enable_unified()
        del self.plan['style_contract_version']
        del self.plan['style']['binding']
        self.assertTrue(self.run_check()['current_style_ready'])

    def test_legacy_plan_cannot_select_a_globally_rejected_baseline(self):
        self.bind_current_style()
        del self.plan['style_contract_version']
        del self.plan['style']['binding']
        (self.root / 'rejected').mkdir()
        (self.root / 'rejected/video.mp4').write_bytes(b'rejected-fixture')
        self.plan['style']['baseline'] = 'rejected/video.mp4'
        report = self.run_check()
        self.assertFalse(report['plan_valid'], report)
        self.assertFalse(report['render_ready'])
        self.assertFalse(report['production_ready'])
        self.assertTrue(any('style.baseline: registered baseline is rejected or excluded' in item
                            for item in report['errors']))

    def test_legacy_plan_cannot_select_a_source_index_excluded_baseline(self):
        self.bind_current_style()
        del self.plan['style_contract_version']
        del self.plan['style']['binding']
        (self.root / 'trial.mp4').write_bytes(b'unapproved-fixture')
        (self.root / 'samples.json').write_text(json.dumps({'samples': [
            {'id': 'old-trial', 'path': 'trial.mp4', 'status': 'rejected'}]}), encoding='utf-8')
        registry = director.load_json(self.root / style_registry.REGISTRY)
        registry['profiles'][0]['sources'] = [{'kind': 'asset-map', 'path': 'samples.json',
                                              'accepted_statuses': ['approved']}]
        (self.root / style_registry.REGISTRY).write_text(json.dumps(registry), encoding='utf-8')
        self.plan['style']['baseline'] = 'trial.mp4'
        report = self.run_check()
        self.assertFalse(report['render_ready'], report)
        self.assertFalse(report['production_ready'])
        self.assertTrue(any('style.baseline: registered baseline is rejected or excluded' in item
                            for item in report['errors']))

    def test_legacy_unlisted_baseline_retains_only_structural_compatibility(self):
        self.bind_current_style()
        del self.plan['style_contract_version']
        del self.plan['style']['binding']
        (self.root / 'unlisted.mp4').write_bytes(b'unlisted-fixture')
        self.plan['style']['baseline'] = 'unlisted.mp4'
        report = self.run_check()
        self.assertTrue(report['render_ready'], report)
        self.assertFalse(report['current_style_ready'])
        self.assertFalse(report['production_ready'])

    def test_current_binding_without_audio_alignment_is_not_production_ready(self):
        self.bind_current_style()
        self.plan['timing'] = {'basis': 'script-estimate'}
        report = self.run_check()
        self.assertTrue(report['current_style_ready'], report)
        self.assertFalse(report['render_ready'])
        self.assertFalse(report['production_ready'])

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

    def reference_catalog(self):
        for name in ('reference.png', 'library-scene.png'):
            (self.root / name).write_bytes(b'registered-style-example')
        (self.root / 'references/aigc-assets.json').write_text(json.dumps({'style_sets': [{
            'id': 'style-example', 'character_references': ['reference.png'],
            'assets': [{'id': 'example', 'image_path': 'library-scene.png',
                        'approval_state': 'approved_static_scene'}]}]}), encoding='utf-8')

    def test_registered_picture_as_style_reference_does_not_force_same_character(self):
        self.reference_catalog()
        self.plan['segments'][0]['assets'] = [{'kind': 'concept', 'role': 'reference', 'status': 'ready',
            'path': 'library-scene.png', 'purpose': '仅学习画法，本期重新设计场景'}]
        report = self.run_check()
        self.assertTrue(report['render_ready'], report)
        self.assertTrue(report['plan_valid'])

    def test_registered_reference_as_output_requires_explicit_current_basis(self):
        self.reference_catalog()
        segment = self.plan['segments'][0]
        segment['carrier'] = 'mixed'
        asset = {'kind': 'generated', 'status': 'ready', 'path': 'library-scene.png',
                 'purpose': '显示场景图'}
        segment['assets'] = [asset]
        report = self.run_check()
        self.assertFalse(report['render_ready'])
        self.assertTrue(any('style-reference-only' in item for item in report['errors']))
        asset['reference_reuse'] = {'basis': 'historical-approval', 'reason': '以前喜欢过'}
        self.assertFalse(self.run_check()['plan_valid'])
        asset['reference_reuse'] = {'basis': 'current-request', 'reason': '本期明确要求展示这张原图作为对照证据'}
        self.assertTrue(self.run_check()['render_ready'])

    def test_reference_only_inputs_do_not_count_as_finished_mixed_media(self):
        self.reference_catalog()
        segment = self.plan['segments'][0]
        segment['carrier'] = 'mixed'
        segment['assets'] = [{'kind': 'generated', 'role': 'reference', 'status': 'ready',
                             'path': 'library-scene.png', 'purpose': '画风参考'}]
        report = self.run_check()
        self.assertTrue(report['plan_valid'])
        self.assertFalse(report['render_ready'])

    def test_registered_example_as_generation_first_frame_requires_current_basis(self):
        segment = self.generated_segment()
        self.reference_catalog()
        segment['generation'] = {'first_frame': 'library-scene.png'}
        self.assertFalse(self.run_check()['plan_valid'])
        segment['generation']['reference_reuse'] = {
            'basis': 'current-project', 'reason': '续剪当前已确认镜头，沿用同一初态接下一动作'}
        self.assertTrue(self.run_check()['render_ready'])

    def test_new_scene_first_frame_is_distinct_from_style_reference(self):
        segment = self.generated_segment()
        self.reference_catalog()
        (self.root / 'new-scene.png').write_bytes(b'new-narration-specific-design')
        segment['generation'] = {'first_frame_path': 'new-scene.png'}
        self.assertTrue(self.run_check()['render_ready'])
        segment['generation'] = None
        segment['aigc']['first_frame_path'] = 'library-scene.png'
        self.assertFalse(self.run_check()['plan_valid'])

    def test_asset_first_frame_role_does_not_masquerade_as_finished_video(self):
        self.reference_catalog()
        segment = self.plan['segments'][0]
        segment['carrier'] = 'mixed'
        asset = {'kind': 'generated', 'role': 'first-frame', 'status': 'ready',
                 'path': 'library-scene.png', 'purpose': '旧图首帧'}
        segment['assets'] = [asset]
        self.assertFalse(self.run_check()['plan_valid'])
        asset['reference_reuse'] = {'basis': 'current-project', 'reason': '续剪本期同一镜头'}
        report = self.run_check()
        self.assertTrue(report['plan_valid'])
        self.assertFalse(report['render_ready'])

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

    def test_prepare_exposes_all_complete_scenes_before_primitives_without_blank_starter_default(self):
        rows = [{'id': f'adu:anim3:s{i:02d}', 'pack': 'anim3', 'scene_id': f's{i:02d}',
                 'title': f'complete scene {i}', 'role': 'source scene', 'native_duration_seconds': 2,
                 'source': {'path': 'source.html', 'selector': f's{i:02d}'},
                 'manifest': {'path': 'manifest.json', 'sha256': 'recorded-hash'},
                 'preview': {'entry': 'preview.html', 'start': i, 'end': i + 2},
                 'build_status': 'requires-current-narration-bindings', 'runtime_verified_this_run': False}
                for i in range(1, 22)]
        directory = {'scene_count': 21, 'scenes': rows,
                     'packs': [{'id': 'anim3', 'title': 'source pack', 'manifest': {'path': 'manifest.json'}}],
                     'commands': dict(director.selection.SCENE_COMMANDS), 'runtime_verified_this_run': False}
        folder = self.root / 'complete-scene-project'
        with patch.object(director.selection, 'scene_directory', return_value=directory):
            director.prepare(self.script, folder, root=self.root)
        context = director.load_json(folder / 'director-context.json')
        self.assertEqual(directory, context['production']['complete_scenes'])
        self.assertIsNone(context['style']['profile'])
        self.assertEqual('先看关系。\r\n再看结果。', context['source']['text'])
        brief = (folder / 'director-brief.md').read_text(encoding='utf-8')
        self.assertIn('complete scene 21', brief)
        self.assertIn('ui.py scene scaffold --pack anim3 --scenes s01,s04', brief)
        self.assertIn('ui.py scene build --plan project/director-plan.json --presenter input.mp4', brief)
        self.assertNotIn('ui.py new --engine', brief)
        self.assertLess(brief.index('## 完整场景构建入口'), brief.index('## 按这条路径制作'))
        self.assertIn('F/X 方法、配方和 Fred 源码', brief)
        self.assertIn('跨库组合仍须符合当前方向', brief)
        self.assertEqual({'director-context.json', 'director-brief.md'}, {p.name for p in folder.iterdir()})

    def test_production_context_keeps_sample_source_and_reuse_scope_together(self):
        code = {'path': str(self.impl), 'exists': True, 'reuse': 'retain object identity'}
        resolution = {'confirmed_baselines': [
            {'id': 'chosen-account/approved-opening', 'path': str(self.root / 'opening.mp4'),
             'exists': False, 'scope': 'opening only', 'current_usage': 'motion only; current UI governs',
             'source_range': [0, 5], 'boundaries': ['no whole-film approval'], 'implementations': [code]}],
            'available_profiles': [{'confirmed_baselines': [{'id': 'unrelated-account'}]}]}
        context = director.production_context(resolution, self.root)
        self.assertEqual(len(context['approved_examples']), 1)
        sample = context['approved_examples'][0]
        self.assertEqual(sample['reuse_scope'], 'motion only; current UI governs')
        self.assertEqual(sample['implementations'], [code])
        self.assertEqual(sample['boundaries'], ['no whole-film approval'])
        self.assertFalse(sample['preview']['exists'])
        self.assertNotIn('unrelated-account', json.dumps(context))
        self.assertTrue(context['production_starter']['path'].endswith('README.md'))

    def test_prepare_limits_details_but_keeps_unmatched_and_negative_method_discovery(self):
        folder = self.root / 'project'
        study = director.source_study.directing_context(self.root)
        study.update(count=3, methods=[{'id': 'chosen', 'implementation': {'api': 'actual API'}},
                                       {'id': 'other', 'semantic_use': '完整事件而非局部词语'},
                                       {'id': 'negative', 'polarity': 'negative'}])
        full_library = {'entry_count': 2, 'counts_by_kind': {'reference': 1, 'sample': 1},
                        'entries': [{'id': 'unmatched-original', 'kind': 'reference'},
                                    {'id': 'historical-motion', 'kind': 'sample'}],
                        'truncated': False, 'list_command': 'ui.py select --list-library'}
        candidates = {'segments': [{'methods': [{'id': 'chosen'}]}], 'library_directory': full_library}
        with patch.object(director.source_study, 'directing_context', return_value=study), \
             patch.object(director.selection, 'build_selection_context', return_value=candidates), \
             patch.object(director.selection, 'render_selection_brief', return_value='candidate brief'):
            director.prepare(self.script, folder, root=self.root)
        context = director.load_json(folder / 'director-context.json')
        self.assertEqual(context['source_study']['catalog_count'], 3)
        self.assertEqual(context['source_study']['count'], 1)
        self.assertEqual(context['source_study']['methods'][0]['implementation']['api'], 'actual API')
        self.assertEqual(context['source_study']['catalog'], study['catalog'])
        directory = {row['id']: row for row in context['source_study']['method_directory']}
        self.assertEqual(set(directory), {'chosen', 'other', 'negative'})
        self.assertEqual(directory['other']['semantic_use'], '完整事件而非局部词语')
        self.assertEqual(directory['negative']['usage'], 'avoid')
        self.assertNotIn('implementation', directory['chosen'])
        self.assertIn('on_demand', context['production'])
        self.assertEqual(len(context['required_reading']), 2)
        self.assertEqual(full_library, context['selection']['library_directory'])
        brief = (folder / 'director-brief.md').read_text(encoding='utf-8')
        self.assertIn('API', brief)
        self.assertIn('完整保留 2 项', brief)
        self.assertIn('selection.library_directory.entries', brief)
        self.assertNotIn('先看 context.production.complete_scenes', brief)
        self.assertLess(brief.index('## 完整效果库入口'), brief.index('## 完整场景构建入口'))

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
