"""Local routing and approval-boundary tests; no generation or network."""
import json
from pathlib import Path
import tempfile
import unittest

import aigc_assets
import director


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

    def test_user_ui_carries_actual_files_and_research_without_video_approval(self):
        result = self.resolve('user-ui', self.root / 'new-project')
        self.assertEqual(result['selected_style_set'], 'qiuzhi-girl-painterly')
        self.assertEqual(result['selection_source'], 'profile-default:user-ui')
        self.assertTrue(result['character_references'][0]['exists'])
        self.assertEqual([row['id'] for row in result['approved_static_assets']], ['approved'])
        self.assertTrue(result['approved_static_assets'][0]['resource_checks']['image_path']['exists'])
        self.assertFalse(result['approved_static_assets'][0]['video_verified'])
        self.assertFalse(result['video_approval_inherited'])
        self.assertEqual(result['research_sources'], self.data['research_sources'])

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
        self.assertEqual(len(result['optional_provenance_missing']), 2)
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
        self.assertTrue(any(item['path'].endswith('aigc-directing.md') for item in context['required_reading']))

    def test_missing_catalog_keeps_legacy_prepare_usable_but_reports_gap(self):
        (self.root / aigc_assets.CATALOG).unlink()
        result = self.resolve('user-ui')
        self.assertEqual(result['status'], 'missing-catalog')
        self.assertFalse(result['catalog_exists'])
        self.assertTrue(result['warnings'])


if __name__ == '__main__':
    unittest.main()
