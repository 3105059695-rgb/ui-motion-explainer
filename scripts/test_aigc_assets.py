"""Local routing and approval-boundary tests; no generation or network."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import aigc_assets
import director
import selection_contract


class AigcAssetTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'references').mkdir()
        self.project = self.root / 'samples'
        self.project.mkdir()
        for name in ('character.png', 'scene.png', 'frame.jpg', 'source.mp4'):
            (self.root / name).write_bytes(b'path-fixture-not-media-review')
        self.data = {
            'schema_version': 1,
            'research_sources': [{'id': 'full-study', 'path': 'references/full-study.md'}],
            'style_sets': [{
                'id': 'qiuzhi-girl-painterly', 'default_for_profiles': ['user-ui'],
                'project_roots': [str(self.project)],
                'character_references': ['character.png'],
                'style_rules': {'rendering': 'painted'},
                'approval': {'scope': 'static scenes only'},
                'assets': [
                    {'id': 'approved', 'image_path': 'scene.png', 'source_frame': 'frame.jpg',
                     'source_video': 'source.mp4', 'approval_state': 'approved_static_scene',
                     'video_verified': False},
                    {'id': 'unapproved', 'image_path': 'scene.png', 'approval_state': 'candidate'}],
            }],
        }
        self.save()

    def save(self):
        (self.root / aigc_assets.CATALOG).write_text(json.dumps(self.data), encoding='utf-8')

    def resolve(self, profile=None, project=None):
        return aigc_assets.directing_context(project or self.project,
                                            {'resolved_profile': profile}, self.root)

    def local_override(self):
        source = self.project / 'user-request.txt'
        source.write_text('本期素材用摄影写实，UI保持已经确认的黑紫。', encoding='utf-8')
        (self.project / 'coffee.png').write_bytes(b'photographic direction fixture, not approved media')
        value = {'scope': 'aigc-only', 'direction': '摄影写实、自然光、真实杯子材质',
            'source': {'kind': 'current-user-request', 'path': 'user-request.txt',
                       'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'quote': '本期素材用摄影写实'},
            'style_references': ['coffee.png']}
        self.save_override(value)
        return value

    def save_override(self, value, file='project.json'):
        (self.project / file).write_text(json.dumps({'aigc': {'direction_override': value}}, ensure_ascii=False), encoding='utf-8')

    def test_unified_reference_is_independent_of_account_and_does_not_bind_identity(self):
        self.data['routing_policy'] = {'default_style_id': 'qiuzhi-girl-painterly', 'account_routing': False}
        self.data['style_sets'][0]['default_for_profiles'] = []
        self.save()
        for profile in ('user-ui', 'adiao', 'fangmu', None):
            result = self.resolve(profile, self.root / 'ordinary-new-project')
            self.assertEqual(result['selection_source'], 'unified-aigc-reference')
            self.assertEqual(result['selected_style_set'], 'qiuzhi-girl-painterly')
            self.assertTrue(result['style_references'])
            self.assertIsNone(result['selected_character_set'])
            self.assertEqual(result['identity_references'], [])
            self.assertFalse(result['video_approval_inherited'])

    def test_explicit_project_override_precedes_unified_art_reference(self):
        self.data['routing_policy'] = {'default_style_id': 'qiuzhi-girl-painterly', 'account_routing': False}
        self.save()
        self.local_override()
        result = self.resolve('adiao')
        self.assertEqual(result['selected_style_set'], 'project-local-aigc')
        self.assertEqual(result['identity_references'], [])

    def test_sourced_project_override_does_not_load_default_girl_or_imply_approval(self):
        self.local_override()
        resolution = {'resolved_profile': 'user-ui', 'binding': {'example': 'unchanged UI'}}
        before = copy.deepcopy(resolution)
        result = aigc_assets.directing_context(self.project, resolution, self.root)
        self.assertEqual(resolution, before)
        self.assertEqual(result['selected_style_set'], 'project-local-aigc')
        self.assertEqual(result['character_references'], [])
        self.assertEqual(result['approved_static_assets'], [])
        self.assertEqual(result['approval'], {})
        self.assertFalse(result['default_character_required'])
        self.assertFalse(result['video_approval_inherited'])
        self.assertTrue(result['production_references_ready'])
        self.assertEqual(result['style_references'][0]['path'], str((self.project / 'coffee.png').resolve()))

    def test_aigc_only_override_rejects_wrong_scope_missing_source_and_false_quote(self):
        original = self.local_override()
        mutations = [
            {'scope': 'all'}, {'ui': 'white'}, {'style_references': []},
            {'source': {**original['source'], 'sha256': '0' * 64}},
            {'source': {**original['source'], 'quote': '用户已同意白底'}},
            {'source': {'kind': 'current-user-request', 'approved': True}},
        ]
        for changes in mutations:
            with self.subTest(changes=changes):
                self.save_override({**original, **changes})
                result = self.resolve('user-ui')
                self.assertEqual(result['status'], 'invalid-project-override', result)
                self.assertIsNone(result['selected_style_set'])
                self.assertEqual(result['character_references'], [])

    def test_project_override_is_not_inherited_by_a_new_nested_project(self):
        self.local_override()
        result = self.resolve('user-ui', self.project / 'other-project')
        self.assertEqual(result['selected_style_set'], 'qiuzhi-girl-painterly')
        self.assertNotIn('direction_override', result)

    def test_project_override_binding_changes_with_source_or_reference_content(self):
        original = self.local_override()
        first = selection_contract.aigc_style_binding(self.resolve('user-ui'))
        (self.project / 'coffee.png').write_bytes(b'changed direction image')
        second = selection_contract.aigc_style_binding(self.resolve('user-ui'))
        self.assertNotEqual(first, second)
        source = self.project / 'user-request.txt'
        source.write_text('本期素材用摄影写实，换成暖光。', encoding='utf-8')
        original['source']['sha256'] = hashlib.sha256(source.read_bytes()).hexdigest()
        self.save_override(original)
        self.assertNotEqual(second, selection_contract.aigc_style_binding(self.resolve('user-ui')))

    def test_conflicting_project_overrides_do_not_fall_back(self):
        value = self.local_override()
        self.save_override({**value, 'direction': 'another direction'}, 'director-plan.json')
        self.assertEqual(self.resolve('user-ui')['status'], 'invalid-project-override')

    def test_user_ui_carries_actual_files_and_research_without_video_approval(self):
        result = self.resolve('user-ui', self.root / 'new-project')
        self.assertEqual(result['selected_style_set'], 'qiuzhi-girl-painterly')
        self.assertEqual(result['selection_source'], 'profile-default:user-ui')
        self.assertTrue(result['character_references'][0]['exists'])
        self.assertEqual([row['id'] for row in result['approved_static_assets']], ['approved'])
        self.assertTrue(result['approved_static_assets'][0]['resource_checks']['image_path']['exists'])
        self.assertFalse(result['approved_static_assets'][0]['video_verified'])
        self.assertFalse(result['video_approval_inherited'])
        self.assertEqual([{k: v for k, v in row.items() if k != 'resource'}
                          for row in result['research_sources']], self.data['research_sources'])
        self.assertEqual(result['research_sources_present'], 0)
        self.assertFalse(result['research_sources'][0]['resource']['file_exists'])
        self.assertTrue(result['reference_only'])
        self.assertFalse(result['default_character_required'])
        for row in [*result['character_references'], *result['approved_static_assets']]:
            self.assertEqual(row['usage_role'], 'style-reference-only')
            self.assertEqual(row['role'], 'reference')
            self.assertFalse(row['auto_use_as_first_frame'])
            self.assertFalse(row['auto_use_as_output'])
        self.assertIn('每期先理解口播句意', result['instruction'])
        self.assertIn('当前工程明确指定的固定 IP', result['character_policy'])

    def test_unselected_style_exposes_scoped_candidates_without_default_or_historical_instructions(self):
        style = self.data['style_sets'][0]
        style.update(default_for_profiles=[], applicable_profiles=['user-ui'],
                     current_scope={'style': 'candidate only', 'video_methods': ['handoff']})
        style['approval'].update(event_id='static-event', reuse_policy='obsolete default instruction',
            subsequent_video_approvals=[{'event_id': 'sample-event', 'video_path': 'source.mp4',
                'evidence_path': 'references/approval.json', 'reuse_rules': ['obsolete global rule'],
                'scope': ['old UI appearance']}])
        style['assets'][0].update(meaning='manual work to handoff', semantic_use=['handoff'])
        self.save()
        result = self.resolve('user-ui', self.root / 'fresh-project')
        self.assertEqual(result['status'], 'candidates-available')
        self.assertIsNone(result['selected_style_set'])
        self.assertEqual(result['style_rules'], {})
        self.assertEqual(result['identity_rules'], {})
        self.assertEqual(result['approval'], {})
        self.assertEqual(result['warnings'], [])
        candidate = result['available_style_sets'][0]
        self.assertTrue(candidate['applicable'])
        self.assertFalse(candidate['automatic_selection'])
        self.assertTrue(candidate['reference_videos'][0]['exists'])
        self.assertEqual(candidate['reference_videos'][0]['usage_scope'], ['handoff'])
        self.assertEqual(candidate['semantic_examples'][0]['meaning'], 'manual work to handoff')
        self.assertNotIn('obsolete', json.dumps(result))
        self.assertNotIn('old UI appearance', json.dumps(result))
        self.assertEqual(candidate['approval']['event_ids'], ['static-event', 'sample-event'])
        self.assertFalse(self.resolve('adiao')['available_style_sets'][0]['applicable'])

    def test_style_choice_filters_legacy_identity_and_history_while_explicit_identity_is_independent(self):
        style = self.data['style_sets'][0]
        style['style_rules'].update(identity=['brown hair'], wardrobe=['white sweater'], identity_scope='legacy')
        style['approval']['reuse_rules'] = ['all projects must use this girl']
        style['assets'][0].update(scene_invariants=['same old costume'], action_chain=['girl hands over book'])
        self.save()
        result = self.resolve('user-ui')
        self.assertEqual(result['style_rules'], {'rendering': 'painted'})
        self.assertEqual(result['identity_rules'], {})
        self.assertEqual(result['identity_references'], [])
        self.assertEqual(result['style_references'][0]['path'], str((self.root / 'character.png').resolve()))
        self.assertTrue(result['approval']['historical_only'])
        self.assertNotIn('reuse_rules', result['approval'])
        self.assertNotIn('scene_invariants', result['approved_static_assets'][0])
        self.assertEqual(result['approved_static_assets'][0]['reference_action_chain'], ['girl hands over book'])
        (self.project / 'project.json').write_text(json.dumps({'aigc': {
            'character_style_set_id': style['id']}}), encoding='utf-8')
        bound = self.resolve('user-ui')
        self.assertEqual(bound['identity_rules'], {'identity': ['brown hair'], 'wardrobe': ['white sweater']})
        self.assertEqual(bound['style_rules'], result['style_rules'])
        self.assertEqual(bound['selected_character_set'], style['id'])
        self.assertEqual(bound['identity_references'][0]['usage_role'], 'project-explicit-identity-reference')
        self.assertEqual(bound['style_references'], result['style_references'])
        for row in [*bound['style_references'], *bound['character_references']]:
            self.assertEqual(row['usage_role'], 'style-reference-only')
            self.assertFalse(row['identity_binding_default'])
        self.assertEqual(selection_contract.aigc_style_binding(bound), selection_contract.aigc_style_binding(result))
        self.assertEqual(self.resolve('user-ui', self.project / 'src')['identity_rules'], {})

    def test_explicit_character_can_continue_with_an_independent_current_style_override(self):
        self.data['style_sets'][0]['identity_rules'] = {'identity': ['brown hair']}
        self.save()
        override = self.local_override()
        (self.project / 'project.json').write_text(json.dumps({'aigc': {
            'direction_override': override, 'character_style_set_id': 'qiuzhi-girl-painterly'}}), encoding='utf-8')
        result = self.resolve('user-ui')
        self.assertEqual(result['selected_style_set'], 'project-local-aigc')
        self.assertEqual(result['style_rules'], {'rendering': override['direction']})
        self.assertEqual(result['identity_rules'], {'identity': ['brown hair']})
        self.assertEqual(result['approval'], {})

    def test_unknown_and_conflicting_character_selections_are_not_assumed(self):
        (self.project / 'project.json').write_text('{"aigc":{"character_style_set_id":"missing"}}', encoding='utf-8')
        self.assertEqual(self.resolve('user-ui')['status'], 'invalid-project-character')
        (self.project / 'current-project.json').write_text('{"aigc":{"character_style_set_id":"another"}}', encoding='utf-8')
        result = self.resolve('user-ui')
        self.assertEqual(result['identity_rules'], {})
        self.assertTrue(any('Conflicting character' in warning for warning in result['warnings']))

    def test_shipped_catalog_has_current_art_reference_and_preserves_historical_approval(self):
        result = aigc_assets.directing_context(self.project, {'resolved_profile': 'user-ui'})
        self.assertEqual(result['status'], 'resolved')
        self.assertEqual(result['selected_style_set'], 'qiuzhi-girl-painterly')
        self.assertEqual(result['selection_source'], 'unified-aigc-reference')
        self.assertIsNone(result['selected_character_set'])
        self.assertFalse(result['approval']['current_output_approved'])
        candidate = next(row for row in result['available_style_sets'] if row['id'] == 'qiuzhi-girl-painterly')
        self.assertTrue(candidate['applicable'])
        self.assertIn('20261015-girl-agent-sample-approved', candidate['approval']['event_ids'])
        self.assertNotIn('user_quote', candidate['approval'])
        self.assertTrue(candidate['semantic_examples'])
        self.assertTrue(candidate['reference_videos'])

    def test_scoped_local_reference_and_video_use_existing_overlay_and_bind_when_selected(self):
        style = self.data['style_sets'][0]
        style.update(default_for_profiles=[], applicable_profiles=['user-ui'], character_references=[],
            style_references=[{'path': 'local-only/frame.png', 'resource_id': 'aigc-style:local:frame'}],
            approval_kind='method-only', current_scope={'limits': ['UI rejected; no global style approval']})
        style['approval']['subsequent_video_approvals'] = [{'event_id': 'local-method',
            'video_path': 'local-only/video.mp4', 'resource_id': 'aigc-video:local'}]
        self.save()
        (self.root / 'references/resources.local.json').write_text(json.dumps({'schema_version': 1,
            'files': {'aigc-style:local:frame': {'path': 'frame.jpg'},
                      'aigc-video:local': {'path': 'source.mp4'}}}), encoding='utf-8')
        (self.project / 'project.json').write_text(json.dumps({'aigc': {'style_set_id': style['id']}}), encoding='utf-8')
        result = self.resolve('user-ui')
        self.assertTrue(result['production_references_ready'])
        self.assertEqual(result['style_references'][0]['path'], str((self.root / 'frame.jpg').resolve()))
        self.assertEqual(result['style_references'], result['available_style_sets'][0]['style_references'])
        self.assertEqual(result['style_references'], result['character_references'])
        self.assertEqual(result['identity_references'], [])
        self.assertEqual(result['identity_rules'], {})
        self.assertFalse(result['style_references'][0]['identity_binding_default'])
        self.assertEqual(result['style_references'][0]['usage_role'], 'style-reference-only')
        self.assertEqual(result['character_references'][0]['path'], str((self.root / 'frame.jpg').resolve()))
        self.assertEqual(result['approval']['approval_kind'], 'method-only')
        self.assertFalse(result['approval']['current_output_approved'])
        self.assertTrue(result['available_style_sets'][0]['reference_videos'][0]['exists'])
        self.assertIn((self.root / 'frame.jpg').resolve(), aigc_assets.reference_only_paths(self.root))
        self.assertEqual(selection_contract.aigc_style_binding(result)['style_set_id'], style['id'])
        (self.root / 'frame.jpg').unlink()
        missing = self.resolve('user-ui')
        self.assertFalse(missing['style_references'][0]['exists'])
        self.assertFalse(missing['production_references_ready'])
        self.assertIn(str((self.root / 'frame.jpg').resolve()), missing['missing_resources'])

    def test_registered_project_selection_remains_applicable_after_profile_default_is_removed(self):
        self.data['style_sets'][0].update(default_for_profiles=[], applicable_profiles=['user-ui'])
        self.save()
        result = self.resolve('user-ui')
        self.assertEqual(result['status'], 'resolved')
        self.assertEqual(result['selection_source'], 'registered-project-root')
        self.assertIsNone(self.resolve('adiao')['selected_style_set'])

    def test_other_accounts_do_not_inherit_girl_even_inside_sample_project(self):
        for profile in ('adiao', 'fangmu'):
            with self.subTest(profile=profile):
                result = self.resolve(profile)
                self.assertIsNone(result['selected_style_set'])
                self.assertEqual(result['approved_static_assets'], [])
        self.assertEqual(self.resolve()['selection_source'], 'registered-project-root')

    def test_explicit_unknown_style_is_not_replaced_by_profile_default(self):
        (self.project / 'project.json').write_text('{"aigc_style_id":"new-direction"}', encoding='utf-8')
        result = self.resolve('user-ui')
        self.assertIsNone(result['selected_style_set'])
        self.assertTrue(any('Unknown explicit' in warning for warning in result['warnings']))

    def test_explicit_style_and_nested_project_take_precedence(self):
        self.data['style_sets'].append({'id': 'second', 'assets': []})
        self.save()
        (self.project / 'project.json').write_text('{"aigc":{"style_set_id":"second"}}', encoding='utf-8')
        result = self.resolve('user-ui', self.project / 'src')
        self.assertEqual(result['selected_style_set'], 'second')

    def test_conflicting_metadata_does_not_choose_a_default(self):
        (self.project / 'project.json').write_text('{"aigc_style_id":"one"}', encoding='utf-8')
        (self.project / 'director-plan.json').write_text('{"aigc_style_id":"two"}', encoding='utf-8')
        result = self.resolve('user-ui')
        self.assertIsNone(result['selected_style_set'])
        self.assertTrue(any('Conflicting' in warning for warning in result['warnings']))

    def test_missing_files_are_visible_without_claiming_they_exist(self):
        (self.root / 'scene.png').unlink()
        result = self.resolve('user-ui')
        self.assertFalse(result['approved_static_assets'][0]['resource_checks']['image_path']['exists'])
        self.assertIn(str((self.root / 'scene.png').resolve()), result['missing_resources'])
        self.assertFalse(result['production_references_ready'])
        self.assertTrue(result['character_references_ready'])

    def test_optional_source_video_missing_does_not_remove_usable_references(self):
        (self.root / 'source.mp4').unlink()
        (self.root / 'frame.jpg').unlink()
        result = self.resolve('user-ui')
        self.assertTrue(result['production_references_ready'])
        self.assertTrue(result['approved_static_assets'][0]['reference_ready'])
        self.assertEqual(set(result['optional_provenance_missing']), {
            str((self.root / 'source.mp4').resolve()), str((self.root / 'frame.jpg').resolve()),
            str((self.root / 'references/full-study.md').resolve())})
        self.assertNotIn('missing_resources', result)

    def test_missing_character_is_not_treated_as_a_resolved_production_reference(self):
        (self.root / 'character.png').unlink()
        result = self.resolve('user-ui')
        self.assertEqual(result['status'], 'resolved')  # The choice is known, image availability is separate.
        self.assertFalse(result['character_references_ready'])
        self.assertFalse(result['production_references_ready'])
        self.assertTrue(result['approved_static_assets'][0]['reference_ready'])

    def test_prepare_carries_independent_aigc_context_without_changing_ui_selection(self):
        for name in director.REQUIRED_REFS:
            (self.root / name).write_text('fixture', encoding='utf-8')
        (self.root / director.RECIPE_FILE).write_text('{"recipes":[]}', encoding='utf-8')
        script = self.project / 'script.txt'
        script.write_text('把资料交给助手。', encoding='utf-8')
        director.prepare(script, self.project, root=self.root)
        context = director.load_json(self.project / 'director-context.json')
        self.assertIsNone(context['style']['profile'])
        self.assertEqual(context['aigc']['selected_style_set'], 'qiuzhi-girl-painterly')
        self.assertEqual(len(context['aigc']['approved_static_assets']), 1)
        self.assertTrue(context['production']['on_demand']['aigc']['path'].endswith('aigc-directing.md'))
        self.assertTrue(context['aigc']['reference_only'])
        self.assertFalse(context['aigc']['default_character_required'])
        self.assertIn('参考图不自动成为首帧或固定主角', (self.project / 'director-brief.md').read_text(encoding='utf-8'))

    def test_reference_only_path_index_includes_style_examples_not_source_video(self):
        paths = aigc_assets.reference_only_paths(self.root)
        self.assertIn((self.root / 'character.png').resolve(), paths)
        self.assertIn((self.root / 'scene.png').resolve(), paths)
        self.assertNotIn((self.root / 'source.mp4').resolve(), paths)

    def test_missing_catalog_keeps_legacy_prepare_usable_but_reports_gap(self):
        (self.root / aigc_assets.CATALOG).unlink()
        result = self.resolve('user-ui')
        self.assertEqual(result['status'], 'missing-catalog')
        self.assertFalse(result['catalog_exists'])
        self.assertTrue(result['warnings'])


if __name__ == '__main__':
    unittest.main()
