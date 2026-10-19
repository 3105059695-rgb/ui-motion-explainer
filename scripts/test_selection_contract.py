"""Portable selection/runtime-link regressions; fixtures are not rendered media."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

import aigc_assets
import director
import production_entry
import selection_contract as contract
import style_registry


class SelectionContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name) / 'skill'
        self.project = Path(self.temp.name) / 'project'
        (self.root / 'references/profiles').mkdir(parents=True)
        self.project.mkdir()
        self.write(self.root / 'references/semantic-editing-recipes.json', {'recipes': []})
        (self.root / 'profile.md').write_text('current UI', encoding='utf-8')
        (self.root / 'anchor.png').write_bytes(b'anchor fixture')
        self.write(self.root / 'direction.json', {'id': 'current', 'status': 'user_selected_reference_direction',
            'direction_contract': {'revision': '1', 'visual_calibration': {'view_before_design': True,
                'anchors': [{'frame': 'anchor.png'}]}}})
        self.write(self.root / style_registry.REGISTRY, {'default_profile': 'user-ui', 'profiles': [{
            'id': 'user-ui', 'label': 'User', 'profile_path': 'profile.md', 'sources': [],
            'reference_directions': [{'id': 'current', 'guidance_path': 'direction.json'}]}]})
        self.write(self.root / 'references/aigc-assets.json', {'routing_policy': {'reference_usage_default': 'style-reference-only'},
            'style_sets': [{'id': 'soft-illustration', 'default_for_profiles': ['user-ui'],
                'style_rules': {'texture': 'soft hand-drawn'}, 'character_references': ['anchor.png'], 'assets': []}]})
        self.write(self.root / 'references/source-study-methods.json', {'methods': [
            {'id': 'Q1', 'title': '关系显现', 'source_examples': [{'video': 'probe', 'row_ids': ['P1']}]}]})
        self.write(self.root / 'references/source-study-sources.json', {'schema_version': 1, 'sources': [
            {'id': 'probe', 'alignment': 'references/probe-alignment.json', 'manifest': 'references/probe-index.json'}]})
        self.write(self.root / 'references/probe-alignment.json', {'rows': [{'id': 'P1', 'text': '关系显现'}]})
        self.write(self.root / 'references/probe-index.json', {})
        (self.project / 'script.txt').write_text('甲。乙。', encoding='utf-8')
        (self.project / 'audio.wav').write_bytes(b'audio path fixture, not decoded media')
        (self.project / 'index.html').write_text('<main id="scene"></main><script type="module" src="main.js"></script>', encoding='utf-8')
        (self.project / 'main.js').write_text('''const timeline = await fetch("./timeline.json").then(r => r.json());
window.renderFrame = (t) => {
 const active = timeline.segments.find(row => row.output.start_seconds <= t && t < row.output.end_seconds);
 if (active && active.id === "shot-1") document.querySelector("#scene").textContent = active.id;
};''', encoding='utf-8')
        source = director.source_data(self.project / 'script.txt')
        self.plan = {'schema_version': 1, 'style_contract_version': 1, 'selection_contract_version': 1,
            'source': {'path': 'script.txt', 'sha256': source['sha256']},
            'style': {'tokens': {'background': '#100b1b'}, 'binding': style_registry.current_binding(
                style_registry.resolve(self.project, 'user-ui', root=self.root))},
            'delivery': {'scope': 'full', 'duration_seconds': 2},
            'timing': {'basis': 'audio-aligned', 'audio_source': self.file('audio.wav'), 'alignment_evidence': 'alignment.json'},
            'segments': [{'id': 'shot-1', 'quote': '甲。乙。', 'span': {'start': 0, 'end': 4},
                'context': '完整前后文', 'meaning': '关系由前句进入后句', 'viewer_gap': '尚不清楚关系',
                'carrier': 'diagram', 'why': '保留两句连续对象', 'recipe_ids': [], 'objects': ['object-a'],
                'events': [{'initial': '未关联', 'trigger': '说到关系', 'change': '连线', 'result': '关系清楚'}],
                'focus': '关系', 'reading_exit': '结果看清', 'continuity': {'entry': '保留对象', 'exit': '关系保留'},
                'selection': {'mode': 'original', 'reason': '本期关系用原创对象连续解释，现有例图对象不适用',
                              'aigc': {'use': False, 'reason': '图形关系已足够，无需生成素材'}, 'evidence': []},
                'output': {'start_seconds': 0, 'end_seconds': 2}, 'source_audio': {'start_seconds': 0, 'end_seconds': 2},
                'implementation': {**self.file('main.js'), 'marker': '"shot-1"'}, 'assets': []}]}
        self.refresh_runtime()

    def write(self, path, data):
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

    def file(self, name, origin='project', role=None):
        path = (self.root if origin == 'skill' else self.project) / name
        row = {'path': name, 'sha256': contract.digest(path)}
        if origin == 'skill':
            row['origin'] = origin
        if role:
            row['role'] = role
        return row

    def refresh_runtime(self):
        rows = []
        for segment in self.plan['segments']:
            segment['implementation']['sha256'] = contract.digest(self.project / segment['implementation']['path'])
            rows.append({key: copy.deepcopy(segment[key]) for key in ('id', 'span', 'output', 'implementation')})
            rows[-1]['assets'] = [{key: asset[key] for key in ('path', 'sha256')}
                for asset in segment['assets'] if asset.get('role', 'output') == 'output']
        self.write(self.project / 'timeline.json', {'schema_version': 1,
            'source_sha256': self.plan['source']['sha256'],
            'duration_seconds': self.plan['delivery']['duration_seconds'], 'segments': rows})
        self.write(self.project / 'manifest.json', {'schema_version': 1, 'entrypoint': self.file('index.html'),
            'timeline': {**self.file('timeline.json'), 'consumer': self.plan['segments'][0]['implementation']['path'], 'binding': 'timeline'},
            'files': [self.file(filename) for filename in sorted({s['implementation']['path'] for s in self.plan['segments']})]})
        self.plan['implementation_manifest'] = self.file('manifest.json')
        self.write(self.project / 'alignment.json', {'schema_version': 1,
            'source_sha256': self.plan['source']['sha256'], 'audio_sha256': self.plan['timing']['audio_source']['sha256'],
            'segments': [{key: segment[key] for key in ('id', 'span', 'source_audio')} for segment in self.plan['segments']]})
        self.plan['timing']['alignment_sha256'] = contract.digest(self.project / 'alignment.json')
        self.write(self.project / 'project.json', {'duration': self.plan['delivery']['duration_seconds']})

    def check(self):
        self.write(self.project / 'director-plan.json', self.plan)
        return director.check(self.project / 'director-plan.json', root=self.root)

    def assert_blocked(self, phrase):
        report = self.check()
        self.assertFalse(report['production_ready'], report)
        self.assertTrue(any(phrase in item for item in report['errors']), report)

    def test_original_full_scope_without_effect_recipe_is_production_ready(self):
        report = self.check()
        self.assertTrue(report['production_ready'], report)
        self.assertTrue(report['selection_ready'])
        self.assertEqual('original', report['selection_evidence']['ledger'][0]['selection_mode'])
        self.assertTrue(production_entry.export_check(self.project, root=self.root)['production_ready'])

    def test_old_current_style_plan_is_readable_but_not_production_ready(self):
        del self.plan['selection_contract_version']
        report = self.check()
        self.assertTrue(report['plan_valid'], report)
        self.assertTrue(report['render_ready'])
        self.assertTrue(report['current_style_ready'])
        self.assertFalse(report['production_ready'])
        with self.assertRaisesRegex(ValueError, 'selection'):
            production_entry.export_check(self.project, root=self.root)

    def test_full_scope_cannot_drop_second_sentence(self):
        segment = self.plan['segments'][0]
        segment.update(quote='甲。', span={'start': 0, 'end': 2})
        self.refresh_runtime()
        self.assert_blocked('coverage')

    def test_explicit_excerpt_is_legal_and_does_not_require_full_film(self):
        self.plan['delivery'].update(scope='excerpt', reason='本次只制作开头样段', source_ranges=[{'start': 0, 'end': 2}])
        self.plan['segments'][0].update(quote='甲。', span={'start': 0, 'end': 2})
        self.refresh_runtime()
        self.assertTrue(self.check()['production_ready'])

    def test_missing_scope_or_choice_rationale_is_not_ready(self):
        self.plan['delivery'].pop('scope')
        self.assert_blocked('delivery.scope')
        self.plan['delivery']['scope'] = 'full'
        self.plan['segments'][0]['selection'].pop('reason')
        self.assert_blocked('selection.reason')

    def test_retaining_presenter_is_legal_without_aigc_or_historical_effect(self):
        self.plan['segments'][0]['carrier'] = 'presenter'
        self.plan['segments'][0]['selection'].update(mode='presenter', reason='这两句由人物直接说明更清楚，保持原口播')
        self.assertTrue(self.check()['production_ready'])

    def test_reference_requires_specific_rows_reason_and_hashed_source_files(self):
        segment = self.plan['segments'][0]
        segment['selection']['mode'] = 'reference'
        self.assert_blocked('source_study_refs')
        segment['source_study_refs'] = [{'method_id': 'Q1', 'examples': [{'video': 'probe', 'row_ids': ['P1']}]}]
        self.assert_blocked('adaptation_reason')
        segment['source_study_refs'][0]['adaptation_reason'] = '借用关系逐步显现，但对象重画成这期内容'
        self.assert_blocked('bind SHA-256')
        segment['selection']['evidence'] = [self.file('references/source-study-methods.json', 'skill', 'source-method'),
            self.file('references/probe-alignment.json', 'skill', 'source-alignment')]
        self.assertTrue(self.check()['production_ready'])
        (self.root / 'references/probe-alignment.json').write_text('{}', encoding='utf-8')
        self.assert_blocked('SHA-256')

    def test_extra_sidecar_without_entry_link_does_not_prove_implementation(self):
        (self.project / 'index.html').write_text('<main>unrelated screen</main>', encoding='utf-8')
        self.refresh_runtime()
        self.assert_blocked('reachable')

    def test_unused_timeline_fetch_is_not_sufficient(self):
        (self.project / 'main.js').write_text('const timeline = await fetch("timeline.json"); const id = "shot-1";', encoding='utf-8')
        self.refresh_runtime()
        self.assert_blocked('unused sidecar')

    def test_timeline_variable_must_come_from_the_bound_file(self):
        (self.project / 'main.js').write_text('''fetch("timeline.json");
const timeline = {segments: []};
const active = timeline.segments[0]; const id = "shot-1";''', encoding='utf-8')
        self.refresh_runtime()
        self.assert_blocked('assigned from this exact JSON timeline')

    def use_nested_consumer(self, loading=None):
        (self.project / 'src').mkdir(exist_ok=True)
        code = (self.project / 'main.js').read_text(encoding='utf-8')
        if loading is not None:
            code = code.replace('const timeline = await fetch("./timeline.json").then(r => r.json());', loading)
        (self.project / 'src/main.js').write_text(code, encoding='utf-8')
        (self.project / 'index.html').write_text('<main id="scene"></main><script type="module" src="src/main.js"></script>', encoding='utf-8')
        self.plan['segments'][0]['implementation']['path'] = 'src/main.js'
        self.refresh_runtime()

    def test_nested_module_literal_fetch_reads_document_root_timeline(self):
        self.use_nested_consumer()
        self.assertTrue(self.check()['production_ready'])
        self.assertTrue(production_entry.export_check(self.project, root=self.root)['production_ready'])

    def test_nested_module_fetch_does_not_authorize_a_module_relative_timeline(self):
        self.use_nested_consumer()
        (self.project / 'src/timeline.json').write_bytes((self.project / 'timeline.json').read_bytes())
        manifest = director.load_json(self.project / 'manifest.json')
        manifest['timeline'].update(self.file('src/timeline.json'))
        self.write(self.project / 'manifest.json', manifest)
        self.plan['implementation_manifest'] = self.file('manifest.json')
        self.assert_blocked('timeline must be imported/fetched')

    def test_nested_module_static_import_is_module_relative(self):
        self.use_nested_consumer('import timeline from "../timeline.json" with {type: "json"};')
        self.assertTrue(self.check()['production_ready'])

    def test_require_resolution_remains_module_relative_without_claiming_browser_execution(self):
        self.use_nested_consumer('const timeline = require("../timeline.json");')
        content, edges = contract.dependency_graph(self.project / 'index.html')
        consumer = (self.project / 'src/main.js').resolve()
        self.assertTrue(any(edge['from'] == consumer and edge['to'] == (self.project / 'timeline.json').resolve() for edge in edges))
        self.assertTrue(contract._timeline_assignment(content[consumer], consumer,
            (self.project / 'timeline.json').resolve(), 'timeline', (self.project / 'index.html').resolve()))

    def test_literal_html_base_changes_fetch_and_script_resolution(self):
        self.use_nested_consumer()
        (self.project / 'assets').mkdir()
        (self.project / 'assets/timeline.json').write_bytes((self.project / 'timeline.json').read_bytes())
        (self.project / 'index.html').write_text('<base href="assets/"><script type="module" src="../src/main.js"></script>', encoding='utf-8')
        content, edges = contract.dependency_graph(self.project / 'index.html')
        consumer = (self.project / 'src/main.js').resolve()
        target = (self.project / 'assets/timeline.json').resolve()
        self.assertIn(consumer, content)
        self.assertTrue(any(edge['from'] == consumer and edge['to'] == target for edge in edges))
        self.assertTrue(contract._timeline_assignment(content[consumer], consumer, target,
            'timeline', (self.project / 'index.html').resolve()))

    def test_nested_module_explicit_import_meta_url_fetch_is_module_relative(self):
        self.use_nested_consumer('const timeline = await fetch(new URL("../timeline.json", import.meta.url)).then(r => r.json());')
        self.assertTrue(self.check()['production_ready'])

    def test_dynamic_url_base_is_rejected_instead_of_guessed(self):
        self.use_nested_consumer('const timeline = await fetch(new URL("timeline.json", someRuntimeBase)).then(r => r.json());')
        self.assert_blocked('dynamic URL forms are unsupported')

    def test_implementation_mutation_invalidates_prior_evidence(self):
        with (self.project / 'main.js').open('a', encoding='utf-8') as stream:
            stream.write('\nwindow.changed = true;')
        self.assert_blocked('SHA-256')

    def test_comment_marker_or_wrong_timeline_mapping_cannot_certify_use(self):
        self.plan['segments'][0]['implementation']['marker'] = 'only in comment'
        with (self.project / 'main.js').open('a', encoding='utf-8') as stream:
            stream.write('\n// only in comment')
        self.refresh_runtime()
        self.assert_blocked('marker')
        self.plan['segments'][0]['implementation']['marker'] = '"shot-1"'
        self.refresh_runtime()
        timeline = director.load_json(self.project / 'timeline.json')
        timeline['segments'][0]['output']['end_seconds'] = 1
        self.write(self.project / 'timeline.json', timeline)
        manifest = director.load_json(self.project / 'manifest.json')
        manifest['timeline']['sha256'] = contract.digest(self.project / 'timeline.json')
        self.write(self.project / 'manifest.json', manifest)
        self.plan['implementation_manifest'] = self.file('manifest.json')
        self.assert_blocked('actual runtime timeline row')

    def test_empty_alignment_placeholder_is_not_evidence(self):
        self.write(self.project / 'alignment.json', {})
        self.plan['timing']['alignment_sha256'] = contract.digest(self.project / 'alignment.json')
        self.assert_blocked('structured')

    def test_malformed_manifest_or_alignment_fails_without_traceback(self):
        self.write(self.project / 'manifest.json', [])
        self.plan['implementation_manifest'] = self.file('manifest.json')
        self.assert_blocked('schema_version 1 object')
        self.refresh_runtime()
        alignment = director.load_json(self.project / 'alignment.json')
        alignment['segments'][0]['id'] = []
        self.write(self.project / 'alignment.json', alignment)
        self.plan['timing']['alignment_sha256'] = contract.digest(self.project / 'alignment.json')
        self.assert_blocked('actual source-span/audio-range rows')

    def make_aigc(self):
        (self.project / 'new-scene.png').write_bytes(b'new per-narration reference fixture')
        (self.project / 'clip.mp4').write_bytes(b'generated media path fixture')
        resolution = style_registry.resolve(self.project, 'user-ui', root=self.root)
        context = aigc_assets.directing_context(self.project, resolution, self.root)
        segment = self.plan['segments'][0]
        segment['carrier'] = 'aigc'
        segment['assets'] = [{**self.file('clip.mp4'), 'kind': 'generated', 'status': 'ready',
                              'purpose': '本句对象动作', 'source': 'fixture only, no visual review'}]
        segment['selection']['aigc'] = {'use': True, 'reason': '用对象接力解释这两句的连续关系'}
        segment['selection']['evidence'] = [self.file('anchor.png', 'skill', 'art-style-reference'),
                                            self.file('new-scene.png', role='new-scene-reference')]
        segment['aigc'] = {'style_binding': contract.aigc_style_binding(context),
            'character_mode': 'none', 'character_reason': '本句只展示物体',
            'scene_ref': 'new-scene.png', 'style_ref': str(self.root / 'anchor.png'),
            'edit_duration_seconds': 2, 'result_hold_seconds': 0.2,
            'action_beats': [{'start_seconds': 0, 'end_seconds': 1.8, 'action': '物体完成接力'}]}
        self.refresh_runtime()

    def test_aigc_binds_art_direction_without_forcing_girl_or_all_examples(self):
        self.make_aigc()
        self.assertTrue(self.check()['production_ready'])
        self.plan['segments'][0]['aigc']['style_binding']['rules_sha256'] = '0' * 64
        self.assert_blocked('current selected AIGC art direction')

    def set_photographic_override(self):
        self.make_aigc()
        (self.project / 'user-request.txt').write_text('本期素材要摄影写实，UI不变。', encoding='utf-8')
        override = {'scope': 'aigc-only', 'direction': '真实摄影材质与自然光',
            'source': {**self.file('user-request.txt'), 'kind': 'current-user-request', 'quote': '本期素材要摄影写实'},
            'style_references': ['new-scene.png']}
        self.plan['aigc'] = {'direction_override': override}
        self.write(self.project / 'director-plan.json', self.plan)
        context = aigc_assets.directing_context(self.project, {'resolved_profile': 'user-ui'}, self.root)
        return context

    def test_project_photography_override_cannot_keep_hand_drawn_binding(self):
        original_ui = copy.deepcopy(self.plan['style']['binding'])
        context = self.set_photographic_override()
        self.assert_blocked('current selected AIGC art direction')
        segment = self.plan['segments'][0]
        segment['aigc'].update(style_binding=contract.aigc_style_binding(context), style_ref='new-scene.png')
        segment['selection']['evidence'] = [self.file('new-scene.png', role='art-style-reference'),
            self.file('user-request.txt', role='art-direction-source')]
        report = self.check()
        self.assertTrue(report['production_ready'], report)
        self.assertEqual(original_ui, self.plan['style']['binding'])
        self.assertEqual([], context['character_references'])
        self.assertEqual('project-local-aigc', report['selection_evidence']['ledger'][0]['aigc']['style_binding']['style_set_id'])

    def test_project_override_requires_source_evidence_and_actual_applicable_style_ref(self):
        context = self.set_photographic_override()
        segment = self.plan['segments'][0]
        segment['aigc'].update(style_binding=contract.aigc_style_binding(context), style_ref='new-scene.png')
        segment['selection']['evidence'] = [self.file('new-scene.png', role='art-style-reference')]
        self.assert_blocked('sourced AIGC-only request')
        segment['selection']['evidence'].extend([self.file('user-request.txt', role='art-direction-source'),
                                               self.file('anchor.png', 'skill', 'old-reference')])
        segment['aigc']['style_ref'] = str(self.root / 'anchor.png')
        self.assert_blocked('actual style_ref must belong')

    def test_ledger_retains_event_and_handoff_for_actual_media_review(self):
        report = self.check()
        intent = report['selection_evidence']['ledger'][0]['review_intent']
        self.assertEqual(intent['events'], self.plan['segments'][0]['events'])
        self.assertEqual(intent['continuity'], self.plan['segments'][0]['continuity'])
        self.assertIn('Does not certify', report['selection_evidence']['scope'])

    def test_aigc_reference_content_survives_skill_install_location_change(self):
        self.make_aigc()
        checkout = Path(self.temp.name) / 'original-checkout'
        checkout.mkdir()
        anchor = checkout / 'anchor.png'
        scene = checkout / 'new-scene.png'
        anchor.write_bytes((self.root / 'anchor.png').read_bytes())
        scene.write_bytes((self.project / 'new-scene.png').read_bytes())
        self.plan['segments'][0]['aigc'].update({
            'character_mode': 'reference', 'character_refs': [str(anchor)],
            'style_ref': str(anchor), 'scene_ref': str(scene)})
        # Evidence resolves to the current installation/project; actual references
        # still name the original checkout. All three reference types are identical.
        report = self.check()
        self.assertTrue(report['production_ready'], report)
        self.assertTrue(production_entry.export_check(self.project, root=self.root)['production_ready'])

    def test_aigc_reference_migration_rejects_changed_missing_or_falsely_hashed_files(self):
        for failure in ('changed-content', 'missing-file', 'false-evidence-hash'):
            with self.subTest(failure=failure):
                self.make_aigc()
                anchor = Path(self.temp.name) / ('old-checkout-' + failure + '.png')
                if failure != 'missing-file':
                    anchor.write_bytes(b'different art' if failure == 'changed-content'
                                       else (self.root / 'anchor.png').read_bytes())
                self.plan['segments'][0]['aigc']['style_ref'] = str(anchor)
                if failure == 'false-evidence-hash':
                    self.plan['segments'][0]['selection']['evidence'][0]['sha256'] = '0' * 64
                self.assert_blocked('bind the actual character/scene/style reference file')

    def test_arbitrary_reference_image_cannot_replace_current_aigc_art_direction(self):
        self.make_aigc()
        self.plan['segments'][0]['selection']['evidence'] = [self.file('new-scene.png', role='art-style-reference')]
        self.assert_blocked('applicable current art-style reference')

    def test_asset_content_change_invalidates_runtime_mapping(self):
        self.make_aigc()
        (self.project / 'clip.mp4').write_bytes(b'changed generated material')
        self.assert_blocked('SHA-256')

    def test_export_checks_actual_renderer_entry_and_project_duration(self):
        self.check()
        self.write(self.project / 'project.json', {'duration': 5})
        with self.assertRaisesRegex(ValueError, 'duration'):
            production_entry.export_check(self.project, root=self.root)
        self.write(self.project / 'project.json', {'duration': 2})
        (self.project / 'alternate.html').write_text((self.project / 'index.html').read_text(encoding='utf-8'), encoding='utf-8')
        manifest = director.load_json(self.project / 'manifest.json')
        manifest['entrypoint'] = self.file('alternate.html')
        self.write(self.project / 'manifest.json', manifest)
        self.plan['implementation_manifest'] = self.file('manifest.json')
        self.assertTrue(self.check()['selection_ready'])
        with self.assertRaisesRegex(ValueError, 'actual project/index.html'):
            production_entry.export_check(self.project, root=self.root)

    def test_post_output_metadata_check_is_technical_not_aesthetic(self):
        self.check()
        media = self.project / 'render.mp4'
        media.write_bytes(b'output path fixture, ffprobe mocked in this unit test')
        def facts(duration=2, audio=True):
            return SimpleNamespace(returncode=0, stderr='', stdout=json.dumps({'format': {'duration': str(duration)},
                'streams': [{'codec_type': 'video', 'codec_name': 'h264', 'width': 1920, 'height': 1080}]
                           + ([{'codec_type': 'audio', 'codec_name': 'aac'}] if audio else [])}))
        with patch.object(production_entry.subprocess, 'run', return_value=facts()):
            report = production_entry.verify_output(self.project, media, root=self.root, ffprobe='existing-ffprobe')
        self.assertTrue(report['technical_passed'], report)
        self.assertFalse(report['aesthetic_approval'])
        self.assertFalse(report['full_realtime_av_review'])
        self.assertEqual(contract.digest(media), report['media']['sha256'])
        for bad in (facts(1), facts(audio=False)):
            with patch.object(production_entry.subprocess, 'run', return_value=bad):
                self.assertFalse(production_entry.verify_output(self.project, media, root=self.root, ffprobe='existing-ffprobe')['technical_passed'])

    def test_post_output_rejects_a_plan_changed_since_preflight(self):
        self.check()
        before = production_entry.export_check(self.project, root=self.root)['plan_sha256']
        self.plan['segments'][0]['selection']['reason'] = '合法但发生于导出之后的新取舍'
        self.check()
        with patch.object(production_entry.subprocess, 'run') as probe:
            result = production_entry.verify_output(self.project, self.project / 'not-needed.mp4', root=self.root,
                expected_plan_sha256=before)
        self.assertFalse(result['technical_passed'])
        self.assertIn('changed after render preflight', result['errors'][0])
        probe.assert_not_called()


if __name__ == '__main__':
    unittest.main()
