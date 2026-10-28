"""Small local routing checks; no generation, rendering or network access."""
import json
import os
import shutil
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import style_registry as styles
import director


@unittest.skipUnless(os.environ.get('UI_MOTION_LOCAL_ROUTES') == '1',
                     'Optional author-machine integration: set UI_MOTION_LOCAL_ROUTES=1')
class LocalRoutes(unittest.TestCase):
    def test_unnamed_ui_uses_library_while_a01_history_keeps_original_approval_scope(self):
        result = styles.resolve('E:/ui')
        self.assertEqual(result['status'], 'resolved')
        self.assertEqual(result['resolved_profile'], 'user-ui')
        self.assertEqual(result['confirmed_baselines'], [])
        self.assertEqual([d['id'] for d in result['reference_directions']], ['approved-body-default-20261028'])
        self.assertEqual(Path(result['guidance']['path']).name, 'aesthetic-preferences.md')
        history = next(p for p in styles.listing()['available_profiles'] if p['id'] == 'user-ui')
        baseline = next(p for p in history['confirmed_baselines'] if p['id'] == 'A01')
        self.assertTrue(baseline['exists'])
        self.assertEqual(baseline['quote'], '对对对，我就想要这种风格的')
        self.assertEqual(baseline['audio_review'], 'not_reliably_auditioned')
        self.assertFalse(baseline['new_projects_approved'])
        self.assertEqual(Path(baseline['source']['path']).name, 'reference-evidence.md')
        self.assertIn(baseline['quote'], Path(baseline['source']['path']).read_text(encoding='utf-8-sig'))
        self.assertTrue(any(Path(x['path']).name == 'index.html' and x['exists']
                            for x in baseline['implementations']))

    def test_unregistered_directory_uses_packaged_default_without_account_inheritance(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            result = styles.resolve(folder)
            self.assertEqual(result['status'], 'resolved')
            self.assertEqual(result['resolved_profile'], 'user-ui')
            self.assertEqual(result['selection_source'], 'unified-production')
            self.assertEqual(result['confirmed_baselines'], [])
            self.assertEqual(result['method_examples'], [])
            registry = styles.load_registry()
            registry.pop('default_profile', None)
            unresolved = styles.resolve(folder, registry=registry)
        self.assertEqual(unresolved['status'], 'resolved')
        self.assertEqual(unresolved['selection_source'], 'unified-production')
        self.assertEqual(unresolved['available_profiles'], [])

    def test_real_account_roots_use_library_and_history_is_explicit(self):
        historical = {p['id']: p for p in styles.listing()['available_profiles']}
        for account, path in [('adiao', 'E:/阿刁'), ('fangmu', 'E:/方木')]:
            with self.subTest(account=account):
                result = styles.resolve(path)
                self.assertEqual(result['resolved_profile'], 'user-ui')
                self.assertTrue(Path(result['profile_path']).is_file())
                self.assertEqual(result['confirmed_baselines'], [])
                self.assertEqual([d['id'] for d in result['reference_directions']], ['approved-body-default-20261028'])
                self.assertTrue(result['requires_visual_comparison'])
                self.assertTrue(historical[account]['confirmed_baselines'])
                for baseline in historical[account]['confirmed_baselines']:
                    self.assertEqual(baseline['exists'], Path(baseline['path']).is_file())
                    self.assertTrue(baseline['source']['exists'])
                    self.assertTrue(baseline['implementations'])

    def test_fangmu_pending_outputs_not_confirmed(self):
        result = next(p for p in styles.listing()['available_profiles'] if p['id'] == 'fangmu')
        confirmed = {s['id']: s for s in result['confirmed_baselines']}
        ids = set(confirmed)
        self.assertIn('opening-v5', ids)
        self.assertIn('body-car-v2', ids)
        self.assertNotIn('full-v3', ids)
        self.assertNotIn('material-captions-v3', ids)

        # Only explicit history lookup opens the machine-local account overlay.
        # V7's corrected opening was later accepted; its older trials were not.
        registry = styles.load_registry(include_historical=True)
        config = next(p for p in registry['profiles'] if p['id'] == 'fangmu')
        spec = next(s for s in config['sources'] if s['kind'] == 'asset-map')
        index_path = styles.local_path(spec['path'], styles.ROOT)
        index = styles.read_json(index_path)
        v7 = next(s for s in index['samples'] if s['id'] == 'skill-opening-v7')
        self.assertTrue(v7['aestheticApproval'])
        self.assertEqual(v7['status'], 'approved_opening_direction')
        self.assertTrue(v7['approval']['quote'])
        self.assertEqual(v7['approval']['scopeSeconds'], [0, 28.98])
        self.assertEqual(Path(v7['approval']['path']).resolve(), Path(v7['path']).resolve())
        self.assertIn(v7['id'], confirmed)
        approved = confirmed[v7['id']]
        self.assertEqual(Path(approved['path']), Path(v7['path']).resolve())
        self.assertEqual(approved['status'], v7['status'])
        self.assertEqual(approved['source_range'], v7['approval']['scopeSeconds'])
        self.assertEqual(approved['scope'], v7['approvalScope'])

        confirmed_paths = {Path(s['path']) for s in confirmed.values()}
        excluded_paths = {Path(s['path']) for s in result['excluded_baselines']}
        trials = index['openingTrialStatus']
        self.assertTrue({'v1', 'v2', 'v4', 'v6'}.issubset(trials))
        for version, trial in trials.items():
            if not isinstance(trial, dict) or not trial.get('path'):
                continue
            if trial.get('aestheticApproval') is True and trial.get('status') in spec['accepted_statuses']:
                continue
            with self.subTest(version=version, status=trial.get('status')):
                path = styles.local_path(trial['path'], index_path.parent)
                self.assertNotIn(path, confirmed_paths)
                self.assertIn(path, excluded_paths)

    def test_full_transfer_never_becomes_ui_baseline(self):
        result = styles.resolve('E:/ui/skill-evolution/full-transfer-sample')
        self.assertEqual(result['resolved_profile'], 'user-ui')
        self.assertEqual(result['confirmed_baselines'], [])
        self.assertTrue(any('full-transfer-sample' in x['path'] for x in result['excluded_baselines']))
        explicit = styles.resolve('E:/ui/skill-evolution/full-transfer-sample', 'fangmu')
        self.assertEqual(explicit['resolved_profile'], 'user-ui')
        self.assertFalse(any('full-transfer-sample' in x['path'] for x in explicit['confirmed_baselines']))

    def test_rejected_ui_is_reported_in_new_contexts_with_scope_preserved(self):
        fresh = styles.resolve('E:/ui')
        excluded = next(x for x in fresh['excluded_baselines'] if 'full-transfer-sample' in x['path'])
        self.assertFalse(excluded['matches_current_project'])
        self.assertTrue(excluded['source']['exists'])
        self.assertIn('AIGC', excluded['reason'])
        current = styles.resolve('E:/ui/skill-evolution/full-transfer-sample')
        excluded = next(x for x in current['excluded_baselines'] if 'full-transfer-sample' in x['path'])
        self.assertTrue(excluded['matches_current_project'])

    def test_generated_context_does_not_feed_back_and_prepare_is_idempotent(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-check-', dir='E:/ui/skill-evolution') as folder:
            project = Path(folder).resolve()
            source = project / 'narration.txt'
            source.write_text('同一份资料，继续更新。', encoding='utf-8')
            before = styles.resolve(project)
            self.assertEqual(before['selection_source'], 'unified-production')
            first = director.prepare(source, project)
            self.assertEqual(len(first['created_or_updated']), 2)
            self.assertEqual(styles.resolve(project), before)
            snapshots = {p.name: p.read_bytes() for p in project.glob('director-*')}
            second = director.prepare(source, project)
            self.assertEqual(second['created_or_updated'], [])
            self.assertEqual(len(second['unchanged']), 2)
            self.assertEqual({p.name: p.read_bytes() for p in project.glob('director-*')}, snapshots)
            # Even stale derived metadata cannot override current registry routing.
            context = project / 'director-context.json'
            context.write_text(json.dumps({'generated_by': director.OWNER,
                                          'style': {'profile': 'fangmu'}}), encoding='utf-8')
            self.assertEqual(styles.resolve(project)['resolved_profile'], 'user-ui')
            (project / 'director-plan.json').write_text(json.dumps({'style': {'profile': 'adiao'}}), encoding='utf-8')
            self.assertEqual(styles.resolve(project)['resolved_profile'], 'user-ui')

    def test_explicit_legacy_profile_hint_does_not_select_whole_films_outside_ui_folder(self):
        result = styles.resolve('E:/方木', 'user-ui')
        self.assertEqual(result['resolved_profile'], 'user-ui')
        self.assertEqual(result['selection_source'], 'unified-production')
        self.assertEqual(result['confirmed_baselines'], [])
        self.assertEqual(result['historical_profile_hints'][0]['value'], 'user-ui')

    def test_reference_contract_is_loaded_separately_from_approved_reproductions(self):
        with tempfile.TemporaryDirectory(prefix='reference-direction-fixture-') as folder:
            root = Path(folder)
            (root / 'profile.md').write_text('Profile fixture', encoding='utf-8')
            (root / 'direction.md').write_text('Reading fixture', encoding='utf-8')
            evidence = root / 'evidence.json'
            contract = {'summary': '同一材料连续变化',
                        'rules': [{'id': 'identity', 'instruction': '比较时保持对象身份'}],
                        'reading': ['direction.md'], 'boundaries': ['不是已复刻成片认可']}
            record = {'id': 'fixture-reference', 'status': 'user_selected_reference_direction',
                      'quote': '喜欢这种风格', 'scope': '正文讲解参考',
                      'direction_contract': contract, 'review': {'reproduction_created': False}}
            evidence.write_text(json.dumps(record, ensure_ascii=False), encoding='utf-8')
            config = {'id': 'user-ui', 'label': 'Fixture', 'profile_path': 'profile.md',
                      'sources': [], 'reference_directions': [
                          {'id': 'fixture-reference', 'guidance_path': 'evidence.json',
                           'reading': ['direction.md']}]}
            result = styles.load_profile(config, {}, root)
            self.assertEqual(result['confirmed_baselines'], [])
            self.assertEqual(result['missing'], [])
            direction = result['reference_directions'][0]
            self.assertTrue(direction['guidance_loaded'])
            self.assertEqual(direction['direction_contract'], contract)
            self.assertEqual(direction['quote'], record['quote'])
            self.assertFalse(direction['review']['reproduction_created'])
            self.assertEqual(len(result['required_reading']), 2)  # Profile + deduplicated guide.
            record['direction_contract']['summary'] = '已更新的方向'
            evidence.write_text(json.dumps(record, ensure_ascii=False), encoding='utf-8')
            fresh = styles.load_profile(config, {}, root)
            self.assertEqual(fresh['reference_directions'][0]['direction_contract']['summary'], '已更新的方向')
            record['id'] = 'wrong-evidence-id'
            evidence.write_text(json.dumps(record, ensure_ascii=False), encoding='utf-8')
            invalid = styles.load_profile(config, {}, root)
            self.assertFalse(invalid['reference_directions'][0]['guidance_loaded'])
            self.assertTrue(any('does not match' in w for w in invalid['warnings']))
            evidence.unlink()
            missing = styles.load_profile(config, {}, root)
            self.assertFalse(missing['reference_directions'][0]['guidance_loaded'])
            self.assertTrue(missing['missing'])

    def test_cross_directory_prepare_carries_library_and_keeps_original_source(self):
        with tempfile.TemporaryDirectory(prefix='unified-cross-directory-') as folder:
            project = Path(folder)
            source = project / '口播.txt'
            source.write_text('先看结果，再把两个版本放在一起。', encoding='utf-8')
            default = styles.resolve(project)
            self.assertEqual(default['resolved_profile'], 'user-ui')
            self.assertEqual(default['selection_source'], 'unified-production')
            report = director.prepare(source, project, profile='user-ui')
            context = director.load_json(project / 'director-context.json')
            self.assertFalse(report['plan_authored'])
            self.assertFalse(report['generation_submitted'])
            self.assertEqual(context['style']['resolution']['resolved_profile'], 'user-ui')
            self.assertEqual(context['style']['resolution']['selection_source'], 'unified-production')
            self.assertEqual(context['style']['resolution']['confirmed_baselines'], [])
            self.assertEqual([d['id'] for d in context['style']['reference_directions']], ['approved-body-default-20261028'])
            reading = {Path(p['path']).name for p in context['required_reading']}
            self.assertIn('library.md', reading)
            self.assertIn('fred-ui-direction.md', reading)
            self.assertEqual(context['source']['text'], source.read_text(encoding='utf-8'))
            self.assertEqual(context['production']['approved_examples'], [])
            self.assertIn('主要设计来源', (project / 'director-brief.md').read_text(encoding='utf-8'))

    def test_fred_default_is_kept_for_every_legacy_account_hint(self):
        user = styles.resolve('E:/ui')
        self.assertEqual([d['id'] for d in user['reference_directions']], ['approved-body-default-20261028'])
        for account in ('adiao', 'fangmu'):
            selected = styles.resolve('E:/ui', account)
            self.assertEqual(selected['resolved_profile'], 'user-ui')
            self.assertEqual(selected['confirmed_baselines'], [])
            self.assertEqual(selected['method_examples'], [])
            self.assertEqual([d['id'] for d in selected['reference_directions']], ['approved-body-default-20261028'])
            self.assertEqual(styles.current_binding(selected), styles.current_binding(user))
        with tempfile.TemporaryDirectory(prefix='no-reference-default-') as folder:
            default = styles.resolve(folder)
            self.assertEqual(default['resolved_profile'], 'user-ui')
            self.assertEqual(default['selection_source'], 'unified-production')
            self.assertEqual([d['id'] for d in default['reference_directions']], ['approved-body-default-20261028'])
            registry = styles.load_registry()
            registry.pop('default_profile', None)
            unresolved = styles.resolve(folder, registry=registry)
            self.assertEqual(unresolved['status'], 'resolved')
            self.assertEqual([d['id'] for d in unresolved['reference_directions']], ['approved-body-default-20261028'])
            self.assertEqual(Path(unresolved['required_reading'][0]['path']).name, 'aesthetic-preferences.md')

    def test_project_material_and_tokens_are_retained_without_promoting_a_baseline(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            project = Path(folder)
            draft = project / 'new-draft.mp4'
            draft.write_bytes(b'not a real video; existence must not imply approval')
            (project / 'project.json').write_text(json.dumps({
                'style': {'profile': 'fangmu', 'baseline': str(draft), 'tokens': {'background': '#fff'}}
            }), encoding='utf-8')
            (project / 'src').mkdir()
            result = styles.resolve(project)
            self.assertEqual(result['resolved_profile'], 'user-ui')
            self.assertEqual(result['selection_source'], 'unified-production')
            self.assertNotIn(str(draft.resolve()), [x['path'] for x in result['confirmed_baselines']])
            self.assertEqual(result['current_project_style']['baseline'], str(draft))
            self.assertEqual(result['current_project_style']['tokens'], {'background': '#fff'})
            self.assertEqual(styles.resolve(project, 'adiao')['resolved_profile'], 'user-ui')

    def test_conflicting_or_unknown_legacy_profiles_do_not_block_unified_production(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            project = Path(folder)
            config = project / 'project.json'
            config.write_text(json.dumps({'account': 'adiao', 'style': {'profile': 'fangmu'}}), encoding='utf-8')
            resolved = styles.resolve(project)
            self.assertEqual(resolved['status'], 'resolved')
            self.assertEqual({h['value'] for h in resolved['historical_profile_hints']}, {'adiao', 'fangmu'})
            config.write_text(json.dumps({'profile': 'unregistered-account'}), encoding='utf-8')
            self.assertEqual(styles.resolve(project)['status'], 'resolved')

    def test_nested_account_roots_and_profile_hints_cannot_switch_visual_direction(self):
        registry = styles.read_json(styles.ROOT / styles.REGISTRY)
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            project = Path(folder)
            named = project / 'named-account'
            named.mkdir()
            for config in registry['profiles']:
                config['project_roots'] = ([str(project)] if config['id'] == 'user-ui' else
                                           [str(named)] if config['id'] == 'fangmu' else [])
            self.assertEqual(styles.resolve(project, registry=registry)['resolved_profile'], 'user-ui')
            self.assertEqual(styles.resolve(named / 'src', registry=registry)['resolved_profile'], 'user-ui')
            (named / 'project.json').write_text(json.dumps({'account': 'adiao'}), encoding='utf-8')
            self.assertEqual(styles.resolve(named / 'src', registry=registry)['resolved_profile'], 'user-ui')
            self.assertEqual(styles.resolve(named / 'src', 'user-ui', registry=registry)['resolved_profile'], 'user-ui')

    def test_current_asset_map_is_reread_and_false_approval_is_respected(self):
        registry = styles.load_registry(include_historical=True)
        config = next(p for p in registry['profiles'] if p['id'] == 'fangmu')
        real_read = styles.read_json

        def revoked(path):
            doc = real_read(path)
            if Path(path).name == 'asset-map.json':
                for sample in doc['samples']:
                    sample['aestheticApproval'] = False
            return doc

        with patch.object(styles, 'read_json', side_effect=revoked):
            result = styles.load_profile(config, registry)
        self.assertEqual(result['confirmed_baselines'], [])
        self.assertTrue(styles.load_profile(config, registry)['confirmed_baselines'])


class PortableRoutes(unittest.TestCase):
    """Small relocated package fixtures; no author-machine drives or assets."""
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / 'package'
        (self.root / 'references/profiles').mkdir(parents=True)
        (self.root / 'assets').mkdir()
        for name in director.REQUIRED_REFS:
            (self.root / name).write_text('fixture guide', encoding='utf-8')
        (self.root / director.RECIPE_FILE).write_text('{"recipes":[]}', encoding='utf-8')
        for profile in ('user-ui', 'fangmu', 'adiao'):
            (self.root / f'references/profiles/{profile}.md').write_text(profile, encoding='utf-8')
        (self.root / 'assets/anchor.png').write_bytes(b'fixture-image-path-only')
        self.contract = {'id': 'current', 'revision': '2', 'summary': 'current black-purple direction',
                         'reading': ['references/profiles/user-ui.md'],
                         'visual_calibration': {'view_before_design': True,
                             'anchors': [{'frame': 'assets/anchor.png', 'learn': 'depth and focus'}]}}
        self.record = {'id': 'current', 'status': 'user_selected_reference_direction',
                       'direction_contract': self.contract}
        self.save_direction()
        self.registry = {'shared_ui_direction': {'id': 'current', 'guidance_path': 'references/direction.json'}, 'profiles': [
            {'id': profile, 'label': profile, 'profile_path': f'references/profiles/{profile}.md',
             'sources': [], 'ui_direction': 'shared'}
            for profile in ('user-ui', 'fangmu', 'adiao')]}
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        self.project = self.base / 'project'
        self.project.mkdir()

    def save_direction(self):
        (self.root / 'references/direction.json').write_text(json.dumps(self.record), encoding='utf-8')

    def resolve(self, profile='user-ui', root=None):
        return styles.resolve(self.project, profile, root=root or self.root)

    def enable_unified(self):
        (self.root / 'references/library.md').write_text('Effects: composition, materials, windows and actions.', encoding='utf-8')
        self.registry['unified_production'] = {'enabled': True, 'profile_id': 'user-ui',
            'guidance_path': 'references/library.md', 'label': 'Unified production',
            'account_visual_routing': False, 'whole_film_recommendations': False}
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')

    def test_unified_does_not_load_historical_profiles_or_fred_contract(self):
        self.enable_unified()
        (self.root / 'references/direction.json').unlink()
        (self.root / 'assets/anchor.png').unlink()
        self.registry['profiles'][1]['project_roots'] = [str(self.project)]
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        (self.project / 'project.json').write_text('{"profile":"fangmu","account":"unknown"}', encoding='utf-8')
        with patch.object(styles, 'load_profile', side_effect=AssertionError('Historical profile loaded')):
            for profile in (None, 'user-ui', 'fangmu', 'adiao', 'unknown'):
                with self.subTest(profile=profile):
                    result = self.resolve(profile)
                    self.assertEqual(result['resolved_profile'], 'user-ui')
                    self.assertEqual(result['selection_source'], 'unified-production')
                    self.assertEqual(result['ui_direction_source'], 'effect-library')
                    self.assertTrue(result['style_references_ready'])
                    for key in ('confirmed_baselines', 'method_examples', 'reference_directions', 'available_profiles'):
                        self.assertEqual(result[key], [])
                    self.assertEqual(styles.current_binding(result)['mode'], 'unified-production')

    def test_unified_preserves_current_inputs_without_inheriting_account_identity(self):
        self.enable_unified()
        metadata = {'profile': 'fangmu', 'presenter': {'path': 'current-presenter.mp4'},
                    'identity': {'ip': 'current character'}, 'audio_source': 'original.wav',
                    'style': {'tokens': {'background': 'white'}, 'baseline': 'old-export.mp4'}}
        path = self.project / 'project.json'
        path.write_text(json.dumps(metadata), encoding='utf-8')
        before = path.read_bytes()
        result = self.resolve()
        self.assertEqual(result['current_project_inputs'], {key: metadata[key] for key in ('presenter', 'identity', 'audio_source')})
        self.assertEqual(result['current_project_style'], metadata['style'])
        self.assertEqual(path.read_bytes(), before)
        self.assertEqual(result['confirmed_baselines'], [])

    def test_unified_existing_project_override_keeps_its_sources_without_account_baselines(self):
        self.enable_unified()
        self.write_project_ui_override()
        result = self.resolve()
        self.assertTrue(result['style_references_ready'])
        self.assertEqual(result['reference_directions'][0]['id'], 'whiteboard')
        self.assertEqual(result['confirmed_baselines'], [])
        self.assertIn('ui_override', styles.current_binding(result))
        (self.project / 'whiteboard.png').unlink()
        self.assertFalse(self.resolve()['style_references_ready'])

    def test_unified_binding_only_tracks_library_and_current_project_materials(self):
        self.enable_unified()
        before = styles.current_binding(self.resolve())
        self.contract['revision'] = 'retired revision changed'
        self.save_direction()
        (self.root / 'references/profiles/user-ui.md').write_text('Retired profile changed', encoding='utf-8')
        self.assertEqual(styles.current_binding(self.resolve()), before)
        (self.root / 'references/library.md').write_text('Current effect library changed', encoding='utf-8')
        self.assertNotEqual(styles.current_binding(self.resolve()), before)
        (self.root / 'references/library.md').unlink()
        self.assertFalse(self.resolve()['style_references_ready'])

    def test_unified_listing_preserves_explicit_historical_lookup(self):
        self.enable_unified()
        self.registry['historical_shared_ui_direction'] = self.registry.pop('shared_ui_direction')
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        listing = styles.listing(self.root)
        self.assertEqual({row['id'] for row in listing['available_profiles']}, {'user-ui', 'fangmu', 'adiao'})
        self.assertEqual(listing['available_profiles'][0]['reference_directions'][0]['id'], 'current')
        self.assertEqual(self.resolve()['reference_directions'], [])

    def test_unified_does_not_depend_on_malformed_unused_account_overlay(self):
        self.enable_unified()
        (self.root / styles.LOCAL_REGISTRY).write_text('{broken historical overlay', encoding='utf-8')
        self.assertTrue(self.resolve()['style_references_ready'])
        with self.assertRaisesRegex(ValueError, 'Invalid local style registry'):
            styles.listing(self.root)

    def test_unified_prepare_uses_library_and_never_claims_style_approval(self):
        self.enable_unified()
        script = self.project / 'script.txt'
        script.write_text('同一份资料，报告和图表一起更新。', encoding='utf-8')
        director.prepare(script, self.project, profile='fangmu', root=self.root)
        context = styles.read_json(self.project / 'director-context.json')
        self.assertEqual(context['production']['approved_examples'], [])
        self.assertEqual(context['production']['primary_design_source']['role'], 'primary-design-library')
        self.assertEqual(context['style']['reference_directions'], [])
        self.assertEqual(context['style']['binding']['mode'], 'unified-production')
        self.assertIn('style.applied', context['style']['instruction'])
        self.assertEqual(context['source']['text'], script.read_text(encoding='utf-8'))

    def enable_persistent_direction(self):
        self.enable_unified()
        self.registry['unified_production'].update(
            direction_source='fred-talk-default',
            default_direction={'id': 'current', 'guidance_path': 'references/direction.json'})
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')

    def test_persistent_direction_survives_legacy_profile_and_new_directory(self):
        self.enable_persistent_direction()
        expected = styles.current_binding(self.resolve())
        for profile in (None, 'fangmu', 'adiao', 'unknown'):
            other = self.base / ('new-' + str(profile))
            resolved = styles.resolve(other, profile, root=self.root)
            self.assertEqual(resolved['ui_direction_source'], 'fred-talk-default')
            self.assertEqual(resolved['reference_directions'][0]['id'], 'current')
            self.assertEqual(styles.current_binding(resolved), expected)
            self.assertEqual(resolved['confirmed_baselines'], [])

    def test_default_direction_missing_anchor_blocks_without_choosing_another_style(self):
        self.enable_persistent_direction()
        (self.root / 'assets/anchor.png').unlink()
        selected = self.resolve()
        self.assertFalse(selected['style_references_ready'])
        self.assertEqual(selected['ui_direction_source'], 'fred-talk-default')
        self.assertEqual(selected['reference_directions'][0]['id'], 'current')

    def test_default_direction_binding_changes_when_visual_anchor_or_contract_changes(self):
        self.enable_persistent_direction()
        before = styles.current_binding(self.resolve())
        (self.root / 'assets/anchor.png').write_bytes(b'changed reference pixels')
        after_anchor = styles.current_binding(self.resolve())
        self.assertNotEqual(before, after_anchor)
        self.contract['revision'] = 'new direction'
        self.save_direction()
        self.assertNotEqual(after_anchor, styles.current_binding(self.resolve()))

    def test_explicit_sourced_override_replaces_persistent_default(self):
        self.enable_persistent_direction()
        self.write_project_ui_override()
        selected = self.resolve()
        self.assertTrue(selected['style_references_ready'])
        self.assertEqual(selected['reference_directions'][0]['id'], 'whiteboard')
        self.assertEqual(selected['ui_direction_source'], 'project-body-ui')
        self.assertIn('ui_override', styles.current_binding(selected))

    def test_unified_child_does_not_inherit_parent_mode_inputs_or_valid_override(self):
        self.enable_persistent_direction()
        metadata, _ = self.write_project_ui_override()
        metadata.update(editing_mode='whiteboard', presenter='old-presenter.mp4',
                        identity={'ip': 'old character'}, audio_source='old-audio.wav')
        metadata['style']['tokens'] = {'background': 'old whiteboard'}
        (self.project / 'project.json').write_text(json.dumps(metadata), encoding='utf-8')
        child = self.project / 'new-episode'
        selected = styles.resolve(child, root=self.root)
        self.assertEqual(selected['editing_mode'], 'continuous-ui')
        self.assertEqual(selected['reference_directions'][0]['id'], 'current')
        self.assertNotIn('mode_source', selected)
        self.assertNotIn('current_project_inputs', selected)
        self.assertNotIn('current_project_style', selected)
        self.assertNotIn('ui_override', selected)
        self.assertNotIn('current_project_metadata_path', selected)
        continued = self.resolve()
        self.assertEqual(continued['editing_mode'], 'whiteboard')
        self.assertEqual(continued['current_project_inputs']['presenter'], 'old-presenter.mp4')
        self.assertEqual(continued['reference_directions'][0]['id'], 'whiteboard')
        self.assertTrue(continued['style_references_ready'])
        self.assertFalse(continued['ui_override']['user_identity_verified'])

    def test_body_override_keeps_default_reading_and_binding_for_opening_and_exclusions(self):
        self.enable_persistent_direction()
        preference = self.root / 'references/aesthetic-preferences.md'
        preference.write_text('# Preferences\n## UI\nSolid forms\n## AE\nContinuous action\n'
                              '## Opening\nMeaningful first event\n## Exclusions\nNo empty cards\n',
                              encoding='utf-8')
        self.registry['unified_production']['guidance_path'] = 'references/aesthetic-preferences.md'
        self.registry['unified_production']['required_reading'] = ['references/library.md']
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        self.write_project_ui_override()
        selected = self.resolve()
        reading = {Path(row['path']).name for row in selected['required_reading']}
        self.assertTrue({'aesthetic-preferences.md', 'library.md', 'user-ui.md', 'whiteboard.md'} <= reading)
        self.assertEqual(selected['default_reference_directions'][0]['id'], 'current')
        self.assertEqual(selected['reference_directions'][0]['id'], 'whiteboard')
        self.assertEqual(len(selected['reference_directions'][0]['visual_anchors']), 1)
        self.assertEqual(Path(selected['reference_directions'][0]['visual_anchors'][0]['path']).name,
                         'whiteboard.png')
        binding = styles.current_binding(selected)
        self.assertEqual(binding['guidance_sha256'], styles.content_sha256(preference))
        self.assertEqual(binding['default_directions'][0]['id'], 'current')
        preference.write_text(preference.read_text(encoding='utf-8') + 'Keep faces clear\n', encoding='utf-8')
        self.assertNotEqual(binding, styles.current_binding(self.resolve()))
        script = self.project / 'script.txt'
        script.write_text('One continuous event.', encoding='utf-8')
        director.prepare(script, self.project, root=self.root)
        context = styles.read_json(self.project / 'director-context.json')
        self.assertEqual(context['style']['preferences']['text'], preference.read_bytes().decode('utf-8-sig'))
        self.assertIn('Meaningful first event', context['style']['preferences']['text'])
        self.assertIn('No empty cards', context['style']['preferences']['text'])
        self.assertEqual(context['style']['default_reference_directions'][0]['id'], 'current')
        self.assertEqual(context['style']['reference_directions'][0]['id'], 'whiteboard')

    def test_body_override_keeps_default_missing_reading_and_independent_anchor_requirements(self):
        self.enable_persistent_direction()
        self.write_project_ui_override()
        original_anchor = (self.root / 'assets/anchor.png').read_bytes()
        (self.root / 'assets/anchor.png').unlink()
        selected = self.resolve()
        self.assertFalse(selected['style_references_ready'])
        self.assertIn(str((self.root / 'assets/anchor.png').resolve()),
                      {item['path'] for item in selected['missing']})
        self.assertTrue(selected['reference_directions'][0]['visual_references_ready'])
        (self.root / 'assets/anchor.png').write_bytes(original_anchor)
        (self.project / 'whiteboard.png').unlink()
        self.assertFalse(self.resolve()['style_references_ready'])
        (self.project / 'whiteboard.png').write_bytes(b'body-anchor')
        (self.root / 'references/profiles/user-ui.md').unlink()
        selected = self.resolve()
        self.assertFalse(selected['style_references_ready'])
        self.assertIn(str((self.root / 'references/profiles/user-ui.md').resolve()),
                      {item['path'] for item in selected['missing']})

    def test_relocated_package_resolves_relative_anchor_and_same_binding(self):
        before = self.resolve()
        moved = self.base / 'different-install-location'
        shutil.copytree(self.root, moved)
        after = self.resolve(root=moved)
        self.assertTrue(after['style_references_ready'])
        self.assertEqual(styles.current_binding(before), styles.current_binding(after))
        anchor = after['reference_directions'][0]['visual_anchors'][0]
        self.assertTrue(Path(anchor['path']).is_relative_to(moved.resolve()))
        self.assertEqual(len(anchor['sha256']), 64)
        self.assertTrue(anchor['exists'])

    def test_missing_anchor_does_not_hide_behind_loaded_contract(self):
        (self.root / 'assets/anchor.png').unlink()
        result = self.resolve()
        self.assertTrue(result['reference_directions'][0]['guidance_loaded'])
        self.assertFalse(result['style_references_ready'])
        self.assertTrue(any(row['role'] == 'visual-calibration-anchor' for row in result['missing']))

    def test_rejected_or_trial_direction_is_not_current(self):
        self.record['status'] = 'rejected'
        self.save_direction()
        result = self.resolve()
        self.assertFalse(result['reference_directions'][0]['guidance_loaded'])
        self.assertFalse(result['style_references_ready'])

    def test_reference_content_and_revision_are_reread(self):
        old = styles.current_binding(self.resolve())
        self.contract['revision'] = '3'
        self.contract['summary'] = 'new feedback'
        self.save_direction()
        new = styles.current_binding(self.resolve())
        self.assertNotEqual(old['directions'][0]['sha256'], new['directions'][0]['sha256'])
        self.assertEqual(new['directions'][0]['revision'], '3')

    def test_prepare_contains_binding_without_selecting_other_account(self):
        script = self.project / 'script.txt'
        script.write_text('把结果放大，再回到比较。', encoding='utf-8')
        director.prepare(script, self.project, profile='user-ui', root=self.root)
        context = director.load_json(self.project / 'director-context.json')
        self.assertEqual(context['style']['binding'], styles.current_binding(self.resolve()))
        self.assertTrue(context['style']['references_ready'])
        for profile in ('fangmu', 'adiao'):
            selected = self.resolve(profile)
            self.assertEqual(selected['resolved_profile'], profile)
            self.assertEqual([row['id'] for row in selected['reference_directions']], ['current'])
        (self.project / 'project.json').write_text('{"profile":"fangmu"}', encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['resolved_profile'], 'fangmu')
        (self.project / 'project.json').write_text('{"profile":"unknown"}', encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['status'], 'unresolved')

    def test_explicit_packaged_default_is_portable_but_does_not_override_accounts(self):
        self.registry['default_profile'] = 'user-ui'
        save = lambda: (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        save()
        selected = styles.resolve(self.project, root=self.root)
        self.assertEqual(selected['resolved_profile'], 'user-ui')
        self.assertEqual(selected['selection_source'], 'registry-default')
        (self.project / 'project.json').write_text('{"profile":"fangmu"}', encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['resolved_profile'], 'fangmu')
        (self.project / 'project.json').write_text('{"profile":"unknown"}', encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['status'], 'unresolved')
        (self.project / 'project.json').write_text('{"account":"adiao","profile":"fangmu"}', encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['status'], 'unresolved')

    def test_generated_context_does_not_freeze_selection_or_break_idempotence(self):
        self.registry['profiles'][0]['project_roots'] = [str(self.project)]
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        source = self.project / 'script.txt'
        source.write_text('同一份结果继续更新。', encoding='utf-8')
        before = styles.resolve(self.project, root=self.root)
        director.prepare(source, self.project, root=self.root)
        self.assertEqual(styles.resolve(self.project, root=self.root), before)
        result = director.prepare(source, self.project, root=self.root)
        self.assertEqual(result['created_or_updated'], [])
        self.assertEqual(len(result['unchanged']), 2)
        (self.project / 'project.json').write_text('{"profile":"adiao"}', encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['resolved_profile'], 'adiao')

    def test_empty_required_calibration_is_not_ready(self):
        self.contract['visual_calibration']['anchors'] = []
        self.save_direction()
        result = self.resolve()
        self.assertFalse(result['style_references_ready'])
        self.assertTrue(any('declares no anchors' in message for message in result['warnings']))

    def test_new_project_baseline_does_not_create_approval(self):
        draft = self.project / 'draft.mp4'
        draft.write_bytes(b'not-approved')
        (self.project / 'project.json').write_text(json.dumps({
            'profile': 'user-ui', 'style': {'baseline': 'draft.mp4'}}), encoding='utf-8')
        result = styles.resolve(self.project, root=self.root)
        self.assertEqual(result['confirmed_baselines'], [])
        self.assertTrue(any(row['path'] == str(draft.resolve()) for row in result['excluded_baselines']))

    def test_partial_method_survives_rejected_ui_without_becoming_visual_baseline(self):
        evidence = self.root / 'partial-approval.md'
        evidence.write_text('AIGC handoff accepted, UI rejected', encoding='utf-8')
        spec = {'kind': 'documented-baseline', 'path': str(evidence),
                'acceptance_marker': 'AIGC handoff accepted',
                'baseline': {'id': 'partial', 'path': 'full-transfer-sample/movie.mp4',
                    'status': 'approved_aigc_only', 'approval_kind': 'method-only',
                    'scope': 'AIGC handoff only; UI rejected', 'media_kind': 'video',
                    'whole_film_approved': False, 'implementations': [],
                    'retrieval': {'method_scope': 'same object handoff', 'cross_profile': True}}}
        self.registry['excluded_ui_projects'] = [{'path': 'full-transfer-sample',
            'path_component': 'full-transfer-sample', 'evidence': str(evidence), 'reason': 'UI rejected'}]
        self.registry['profiles'][0]['sources'] = [spec]
        result = styles.resolve(self.project, 'user-ui', root=self.root, registry=self.registry)
        self.assertFalse(result['confirmed_baselines'])
        self.assertEqual(result['confirmed_methods'][0]['id'], 'partial')
        cross = styles.resolve(self.project, 'adiao', root=self.root, registry=self.registry)
        example = cross['method_examples'][0]
        self.assertEqual(example['usage'], 'method-reference-only')
        self.assertFalse(example['identity_reuse_allowed'])
        self.assertFalse(example['media_reuse_automatic'])
        self.assertFalse(example['whole_film_approved'])
        self.assertFalse(cross['confirmed_baselines'])

    def test_local_sources_merge_without_hiding_packaged_method(self):
        spec = {'kind': 'documented-baseline', 'path': 'approval.md', 'acceptance_marker': 'accepted',
                'baseline': {'id': 'packaged-method', 'path': 'preview.mp4', 'status': 'approved',
                    'scope': 'method only', 'media_kind': 'video', 'implementations': []}}
        self.registry['profiles'][0]['sources'] = [spec]
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        overlay = {'schema_version': 1, 'profiles': [{'id': 'user-ui', 'sources': [
            {'kind': 'asset-map', 'path': 'private-index.json', 'accepted_statuses': ['approved']}]}]}
        (self.root / styles.LOCAL_REGISTRY).write_text(json.dumps(overlay), encoding='utf-8')
        sources = styles.load_registry(self.root)['profiles'][0]['sources']
        self.assertEqual(len(sources), 2)
        self.assertEqual(sources[0]['baseline']['id'], 'packaged-method')
        overlay['profiles'][0]['sources'].append(dict(spec, baseline=dict(spec['baseline'], path='private.mp4')))
        (self.root / styles.LOCAL_REGISTRY).write_text(json.dumps(overlay), encoding='utf-8')
        sources = styles.load_registry(self.root)['profiles'][0]['sources']
        self.assertEqual(len(sources), 2)
        self.assertEqual(sources[0]['baseline']['path'], 'private.mp4')

    def test_local_overlay_restores_account_sources_in_resolve_and_listing(self):
        local = self.root / 'local'
        local.mkdir()
        for name in ('fangmu.md', 'guide.md', 'scene.js', 'sample.mp4'):
            (local / name).write_text('machine-local fixture', encoding='utf-8')
        (local / 'asset-map.json').write_text(json.dumps({
            'implementations': [{'id': 'native', 'entry': 'scene.js'}],
            'samples': [{'id': 'local-approved', 'path': 'sample.mp4', 'status': 'approved',
                         'approvalScope': 'local sample only', 'implementationIds': ['native']}]}), encoding='utf-8')
        overlay = {'schema_version': 1, 'profiles': [{'id': 'fangmu',
            'profile_path': 'local/fangmu.md', 'project_roots': [str(self.project)],
            'required_reading': ['local/guide.md'],
            'sources': [{'kind': 'asset-map', 'path': 'local/asset-map.json', 'accepted_statuses': ['approved']}]}]}
        (self.root / styles.LOCAL_REGISTRY).write_text(json.dumps(overlay), encoding='utf-8')
        result = styles.resolve(self.project, root=self.root)
        self.assertEqual(result['resolved_profile'], 'fangmu')
        self.assertEqual(Path(result['profile_path']), (local / 'fangmu.md').resolve())
        self.assertEqual([row['id'] for row in result['confirmed_baselines']], ['local-approved'])
        self.assertTrue(result['style_references_ready'])
        self.assertTrue(any(Path(row['path']).name == 'guide.md' for row in result['required_reading']))
        listed = next(row for row in styles.listing(self.root)['available_profiles'] if row['id'] == 'fangmu')
        self.assertEqual(listed['confirmed_baselines'], result['confirmed_baselines'])
        unchanged = styles.load_registry(self.root)['profiles'][0]
        self.assertEqual(unchanged, self.registry['profiles'][0])

    def test_accepted_opening_trial_duplicates_only_its_registered_approval(self):
        sample = self.root / 'assets/sample.mp4'
        sample.write_bytes(b'path fixture, not a rendered video')
        config = dict(self.registry['profiles'][1], sources=[{
            'kind': 'asset-map', 'path': 'assets/asset-map.json',
            'accepted_statuses': ['approved_opening_direction']}])
        approved = {'id': 'opening-v7', 'path': 'sample.mp4',
                    'status': 'approved_opening_direction', 'aestheticApproval': True,
                    'approvalScope': 'opening only', 'implementationIds': []}
        trial = {'path': './sample.mp4', 'status': 'approved_opening_direction',
                 'aestheticApproval': True,
                 'approvalAtDelivery': {'status': 'pending_user_feedback', 'aestheticApproval': False}}
        cases = [
            ('same current approval', [approved], trial, True, False),
            ('new explicit rejection', [approved], dict(trial, status='rejected_motion_feel',
                                                       userQuote='This revision no longer works'), False, True),
            ('current approval flag denied', [approved], dict(trial, aestheticApproval=False), False, True),
            ('unregistered accepted trial', [], trial, False, True),
        ]
        for label, samples, current, confirmed, excluded in cases:
            with self.subTest(label=label):
                (self.root / 'assets/asset-map.json').write_text(json.dumps({
                    'samples': samples, 'openingTrialStatus': {'v7': current}}), encoding='utf-8')
                result = styles.load_profile(config, self.registry, self.root)
                target = str(sample.resolve())
                self.assertEqual(target in {row['path'] for row in result['confirmed_baselines']}, confirmed)
                self.assertEqual(target in {row['path'] for row in result['excluded_baselines']}, excluded)

    def test_invalid_local_overlay_fails_instead_of_falling_back(self):
        invalid = [
            '{broken',
            {'schema_version': True, 'profiles': []},
            {'schema_version': 1, 'profiles': [], 'default_profile': 'user-ui'},
            {'schema_version': 1, 'profiles': [{'id': 'unregistered'}]},
            {'schema_version': 1, 'profiles': [{'id': 'fangmu'}, {'id': 'fangmu'}]},
            {'schema_version': 1, 'profiles': [{'id': 'fangmu', 'aliases': ['user-ui']}]},
            {'schema_version': 1, 'profiles': [{'id': 'fangmu', 'sources': 'not-an-array'}]},
            {'schema_version': 1, 'profiles': [{'id': 'fangmu', 'project_roots': ['https://example.com']}]},
            {'schema_version': 1, 'profiles': [{'id': 'fangmu', 'sources': [{'kind': 'asset-map', 'path': 'local.json'}]}]},
        ]
        for value in invalid:
            with self.subTest(value=value):
                (self.root / styles.LOCAL_REGISTRY).write_text(value if isinstance(value, str) else json.dumps(value), encoding='utf-8')
                with self.assertRaisesRegex(ValueError, 'Invalid local style registry'):
                    styles.resolve(self.project, root=self.root)
                with self.assertRaises(ValueError):
                    styles.listing(self.root)

    def test_local_overlay_does_not_override_unknown_or_conflicting_project_selection(self):
        self.registry['default_profile'] = 'user-ui'
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['resolved_profile'], 'user-ui')
        overlay = {'schema_version': 1, 'profiles': [{'id': 'fangmu', 'project_roots': [str(self.project)]}]}
        (self.root / styles.LOCAL_REGISTRY).write_text(json.dumps(overlay), encoding='utf-8')
        self.assertEqual(styles.resolve(self.project, root=self.root)['resolved_profile'], 'fangmu')
        for metadata in ({'profile': 'unknown'}, {'profile': 'fangmu', 'account': 'adiao'}):
            (self.project / 'project.json').write_text(json.dumps(metadata), encoding='utf-8')
            self.assertEqual(styles.resolve(self.project, root=self.root)['status'], 'unresolved')

    def test_all_accounts_share_body_direction_but_keep_account_profile(self):
        bindings = []
        for profile in ('user-ui', 'adiao', 'fangmu'):
            selected = self.resolve(profile)
            self.assertTrue(selected['style_references_ready'])
            self.assertEqual(selected['resolved_profile'], profile)
            self.assertEqual(Path(selected['profile_path']).name, profile + '.md')
            self.assertEqual(selected['ui_direction_source'], 'shared-body-ui')
            bindings.append(styles.current_binding(selected)['directions'])
        self.assertEqual(bindings[0], bindings[1])
        self.assertEqual(bindings[1], bindings[2])

    def test_old_local_account_does_not_restore_historical_body_palette(self):
        local = self.root / 'local'
        local.mkdir()
        (local / 'adiao.md').write_text('Historical account: white cards and pale purple', encoding='utf-8')
        overlay = {'schema_version': 1, 'profiles': [{'id': 'adiao', 'profile_path': 'local/adiao.md',
            'project_roots': [str(self.project)], 'required_reading': []}]}
        (self.root / styles.LOCAL_REGISTRY).write_text(json.dumps(overlay), encoding='utf-8')
        result = styles.resolve(self.project, root=self.root)
        self.assertEqual(result['resolved_profile'], 'adiao')
        self.assertEqual(result['ui_direction_source'], 'shared-body-ui')
        self.assertEqual(result['reference_directions'][0]['direction_contract'], self.contract)
        reading = {Path(row['path']) for row in result['required_reading']}
        self.assertIn((self.root / 'references/profiles/adiao.md').resolve(), reading)
        self.assertIn((local / 'adiao.md').resolve(), reading)
        overlay['profiles'][0]['ui_direction'] = 'old'
        (self.root / styles.LOCAL_REGISTRY).write_text(json.dumps(overlay), encoding='utf-8')
        with self.assertRaisesRegex(ValueError, 'Invalid local style registry'):
            styles.resolve(self.project, root=self.root)

    def test_missing_shared_contract_or_profile_cannot_use_old_baseline_as_fallback(self):
        (self.root / 'references/direction.json').unlink()
        for profile in ('user-ui', 'adiao', 'fangmu'):
            self.assertFalse(self.resolve(profile)['style_references_ready'])
        self.save_direction()
        (self.root / 'references/profiles/adiao.md').unlink()
        self.assertFalse(self.resolve('adiao')['style_references_ready'])
        self.assertEqual(self.resolve('adiao')['status'], 'missing-profile')
        del self.registry['shared_ui_direction']
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        result = self.resolve()
        self.assertFalse(result['style_references_ready'])
        self.assertTrue(any('shared body UI direction' in value for value in result['warnings']))

    def write_project_ui_override(self, role='user'):
        quote = 'This project keeps its approved whiteboard body UI; preserve the presenter and audio.'
        source = self.base / 'actual-conversation.jsonl'
        source.write_text(json.dumps({'type': 'response_item', 'payload': {'role': role,
            'content': [{'type': 'input_text', 'text': quote}]}}) + '\n', encoding='utf-8')
        (self.project / 'whiteboard.png').write_bytes(b'whiteboard-calibration-fixture')
        (self.project / 'whiteboard.md').write_text('Explicit existing project direction', encoding='utf-8')
        contract = {'id': 'whiteboard', 'revision': '1', 'summary': 'project whiteboard',
            'reading': ['whiteboard.md'], 'visual_calibration': {'view_before_design': True,
                'anchors': [{'frame': 'whiteboard.png', 'learn': 'approved whiteboard reading hierarchy'}]}}
        (self.project / 'whiteboard.json').write_text(json.dumps({'id': 'whiteboard',
            'status': 'user_selected_reference_direction', 'direction_contract': contract}), encoding='utf-8')
        declaration = {'scope': 'body-ui', 'direction': {'id': 'whiteboard', 'guidance_path': 'whiteboard.json'},
            'source': {'path': str(source), 'sha256': styles.content_sha256(source), 'quote': quote}}
        metadata = {'profile': 'adiao', 'style': {'ui_override': declaration}}
        (self.project / 'project.json').write_text(json.dumps(metadata), encoding='utf-8')
        return metadata, source

    def test_evidenced_project_ui_exception_retains_account_and_is_project_scoped(self):
        self.write_project_ui_override()
        result = styles.resolve(self.project, root=self.root)
        self.assertTrue(result['style_references_ready'])
        self.assertEqual(result['resolved_profile'], 'adiao')
        self.assertEqual(result['reference_directions'][0]['id'], 'whiteboard')
        self.assertTrue(result['ui_override']['evidence_files_verified'])
        self.assertFalse(result['ui_override']['user_identity_verified'])
        self.assertEqual(styles.current_binding(result)['ui_override']['scope'], 'body-ui')
        other = styles.resolve(self.base / 'unrelated', 'adiao', root=self.root)
        self.assertEqual(other['reference_directions'][0]['id'], 'current')
        self.assertNotIn('ui_override', styles.current_binding(other))

    def test_project_exception_needs_actual_quote_hash_scope_and_materials(self):
        for mutation in ('missing-source', 'wrong-hash', 'wrong-quote', 'aigc-scope', 'missing-anchor', 'no-anchors'):
            with self.subTest(mutation=mutation):
                metadata, source = self.write_project_ui_override()
                override = metadata['style']['ui_override']
                if mutation == 'missing-source':
                    source.unlink()
                elif mutation == 'wrong-hash':
                    override['source']['sha256'] = '0' * 64
                elif mutation == 'wrong-quote':
                    override['source']['quote'] = 'Assistant claims user approved this.'
                elif mutation == 'aigc-scope':
                    override['scope'] = 'aigc-only'
                elif mutation == 'missing-anchor':
                    (self.project / 'whiteboard.png').unlink()
                else:
                    evidence = styles.read_json(self.project / 'whiteboard.json')
                    evidence['direction_contract']['visual_calibration'] = {}
                    (self.project / 'whiteboard.json').write_text(json.dumps(evidence), encoding='utf-8')
                (self.project / 'project.json').write_text(json.dumps(metadata), encoding='utf-8')
                self.assertFalse(styles.resolve(self.project, root=self.root)['style_references_ready'])

    def test_agent_record_and_old_profile_do_not_establish_ui_exception(self):
        self.write_project_ui_override(role='assistant')
        selected = styles.resolve(self.project, root=self.root)
        self.assertFalse(selected['style_references_ready'])
        self.assertTrue(any('actual user-message' in value for value in selected['warnings']))
        metadata = {'profile': 'adiao', 'style': {'approved': True, 'background': '#fff'}}
        (self.project / 'project.json').write_text(json.dumps(metadata), encoding='utf-8')
        selected = styles.resolve(self.project, root=self.root)
        self.assertTrue(selected['style_references_ready'])
        self.assertEqual(selected['reference_directions'][0]['id'], 'current')

    def test_plan_or_derived_metadata_cannot_self_approve_a_ui_exception(self):
        metadata, source = self.write_project_ui_override()
        (self.project / 'project.json').unlink()
        (self.project / 'director-plan.json').write_text(json.dumps(metadata), encoding='utf-8')
        result = styles.resolve(self.project, root=self.root)
        self.assertFalse(result['style_references_ready'])
        self.assertTrue(any('project.json' in value for value in result['warnings']))

    def test_aigc_choice_does_not_change_body_ui(self):
        metadata = {'profile': 'adiao', 'aigc': {'direction_override': {
            'scope': 'aigc-only', 'direction': 'photographic realism'}}}
        (self.project / 'project.json').write_text(json.dumps(metadata), encoding='utf-8')
        result = styles.resolve(self.project, root=self.root)
        self.assertEqual(result['resolved_profile'], 'adiao')
        self.assertEqual(result['reference_directions'][0]['id'], 'current')
        self.assertTrue(result['style_references_ready'])


class PackagedUnifiedProduction(unittest.TestCase):
    def assert_current_body_reference(self, selected):
        self.assertTrue(selected['style_references_ready'], selected.get('warnings'))
        self.assertEqual([row['id'] for row in selected['reference_directions']],
                         ['approved-body-default-20261028'])
        direction = selected['reference_directions'][0]
        anchors = direction['visual_anchors']
        self.assertEqual(len(anchors), 4)
        anchor_root = (styles.ROOT / 'assets/style-calibration/approved-body').resolve()
        self.assertEqual(len({row['path'] for row in anchors}), 4)
        for anchor in anchors:
            self.assertEqual(Path(anchor['path']).parent, anchor_root)
            self.assertTrue(anchor['exists'])
            self.assertEqual(anchor['sha256'], styles.content_sha256(anchor['path']))
        reading = {Path(row['path']).resolve(): row['exists']
                   for row in selected['required_reading']}
        for relative in ('assets/agent-editorial/palette.json',
                         'assets/agent-editorial/source/body-a.js',
                         'assets/agent-editorial/source/body-b.js',
                         'assets/agent-editorial/source/film.js',
                         'assets/style-calibration/approved-body/motion.mp4'):
            path = (styles.ROOT / relative).resolve()
            self.assertIn(path, reading)
            self.assertTrue(reading[path], relative)

    def test_shipped_registry_keeps_fred_talk_in_every_account_directory(self):
        registry = styles.read_json(styles.ROOT / styles.REGISTRY)
        with tempfile.TemporaryDirectory() as folder:
            default = styles.resolve(folder, root=styles.ROOT, registry=registry)
            self.assertEqual(default['resolved_profile'], 'user-ui')
            self.assert_current_body_reference(default)
            for profile in ('user-ui', 'adiao', 'fangmu'):
                selected = styles.resolve(folder, profile, registry=registry)
                self.assert_current_body_reference(selected)
                self.assertEqual(selected['resolved_profile'], 'user-ui')
                self.assertEqual(selected['selection_source'], 'unified-production')
                self.assertEqual([d['id'] for d in selected['reference_directions']],
                                 ['approved-body-default-20261028'])
                self.assertEqual(selected['ui_direction_source'], 'fred-talk-default')
                self.assertEqual(styles.current_binding(selected), styles.current_binding(default))
                self.assertEqual(selected['confirmed_baselines'], [])
                self.assertEqual(Path(selected['guidance']['path']).name, 'aesthetic-preferences.md')
            child = styles.resolve(Path(folder) / 'unregistered' / 'new-project', registry=registry)
            self.assert_current_body_reference(child)
            self.assertEqual(styles.current_binding(child), styles.current_binding(default))

    def test_fresh_prepare_carries_default_and_preserves_script_without_rendering(self):
        with tempfile.TemporaryDirectory() as folder:
            project = Path(folder)
            script = project / '原稿.txt'
            script.write_text('先看结果，再沿同一份材料找到原因。', encoding='utf-8')
            original = script.read_bytes()
            report = director.prepare(script, project, profile='fangmu')
            context = styles.read_json(project / 'director-context.json')
            self.assertEqual(context['style']['reference_directions'][0]['id'],
                             'approved-body-default-20261028')
            self.assertEqual(script.read_bytes(), original)
            self.assertFalse(report['plan_authored'])
            self.assertFalse(report['generation_submitted'])
            self.assertIn('fred-ui-direction.md', {Path(p['path']).name
                                                  for p in context['required_reading']})
            preference_path = styles.ROOT / 'references/aesthetic-preferences.md'
            preferences = context['style']['preferences']
            self.assertEqual(preferences['text'], preference_path.read_bytes().decode('utf-8-sig'))
            self.assertEqual(preferences['sha256'], styles.content_sha256(preference_path))
            self.assertEqual(preferences['sha256'], context['style']['binding']['guidance_sha256'])
            for section in ('统一视觉', '画面', '动作', '开头', 'AIGC', '反馈'):
                self.assertTrue(any(section in heading for heading in preferences['sections']), section)
            brief = (project / 'director-brief.md').read_text(encoding='utf-8')
            self.assertIn('context.style.preferences.text', brief)
            self.assertIn('UI、AE 感、开头与禁忌', brief)
            self.assertIn('完整开头事件', brief)


if __name__ == '__main__':
    unittest.main()
