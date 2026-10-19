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
    def test_unnamed_ui_uses_recorded_a01_without_broadening_approval(self):
        result = styles.resolve('E:/ui')
        self.assertEqual(result['status'], 'resolved')
        self.assertEqual(result['resolved_profile'], 'user-ui')
        self.assertEqual([b['id'] for b in result['confirmed_baselines']],
                         ['A01', 'user-ui/girl-agent-sample-20261015'])
        baseline = result['confirmed_baselines'][0]
        self.assertTrue(baseline['exists'])
        self.assertEqual(baseline['quote'], '对对对，我就想要这种风格的')
        self.assertEqual(baseline['audio_review'], 'not_reliably_auditioned')
        self.assertFalse(baseline['new_projects_approved'])
        self.assertTrue(any(Path(x['path']).name == 'index.html' and x['exists']
                            for x in baseline['implementations']))

    def test_unregistered_directory_stays_unresolved(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            result = styles.resolve(folder)
        self.assertEqual(result['status'], 'unresolved')
        self.assertIsNone(result['resolved_profile'])
        self.assertEqual({p['id'] for p in result['available_profiles']}, {'user-ui', 'adiao', 'fangmu'})

    def test_real_account_roots_and_current_indices(self):
        for account, path in [('adiao', 'E:/阿刁'), ('fangmu', 'E:/方木')]:
            with self.subTest(account=account):
                result = styles.resolve(path)
                self.assertEqual(result['resolved_profile'], account)
                self.assertTrue(Path(result['profile_path']).is_file())
                self.assertTrue(result['confirmed_baselines'])
                self.assertTrue(result['requires_visual_comparison'])
                for baseline in result['confirmed_baselines']:
                    self.assertEqual(baseline['exists'], Path(baseline['path']).is_file())
                    self.assertTrue(baseline['source']['exists'])
                    self.assertTrue(baseline['implementations'])

    def test_fangmu_pending_outputs_not_confirmed(self):
        result = styles.resolve('E:/方木')
        confirmed = {s['id']: s for s in result['confirmed_baselines']}
        ids = set(confirmed)
        self.assertIn('opening-v5', ids)
        self.assertIn('body-car-v2', ids)
        self.assertNotIn('full-v3', ids)
        self.assertNotIn('material-captions-v3', ids)

        # V7's corrected opening was later accepted; its older trials were not.
        registry = styles.read_json(styles.ROOT / styles.REGISTRY)
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
        self.assertEqual([b['id'] for b in result['confirmed_baselines']],
                         ['A01', 'user-ui/girl-agent-sample-20261015'])
        self.assertTrue(any('full-transfer-sample' in x['path'] for x in result['excluded_baselines']))
        explicit = styles.resolve('E:/ui/skill-evolution/full-transfer-sample', 'fangmu')
        self.assertEqual(explicit['resolved_profile'], 'fangmu')
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
            self.assertEqual(before['selection_source'], 'registered-project-root')
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
            self.assertEqual(styles.resolve(project)['resolved_profile'], 'adiao')

    def test_explicit_user_ui_selects_existing_evidence_outside_ui_folder(self):
        result = styles.resolve('E:/方木', 'user-ui')
        self.assertEqual(result['resolved_profile'], 'user-ui')
        self.assertEqual(result['selection_source'], 'explicit-profile')
        self.assertEqual([b['id'] for b in result['confirmed_baselines']],
                         ['A01', 'user-ui/girl-agent-sample-20261015'])

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

    def test_cross_directory_prepare_carries_fred_rules_and_reading_without_new_approval(self):
        with tempfile.TemporaryDirectory(prefix='fred-cross-directory-') as folder:
            project = Path(folder)
            source = project / '口播.txt'
            source.write_text('先看结果，再把两个版本放在一起。', encoding='utf-8')
            self.assertEqual(styles.resolve(project)['status'], 'unresolved')
            report = director.prepare(source, project, profile='user-ui')
            context = director.load_json(project / 'director-context.json')
            self.assertFalse(report['plan_authored'])
            self.assertFalse(report['generation_submitted'])
            self.assertEqual(context['style']['resolution']['resolved_profile'], 'user-ui')
            self.assertEqual([b['id'] for b in context['style']['resolution']['confirmed_baselines']],
                             ['A01', 'user-ui/girl-agent-sample-20261015'])
            direction = next(d for d in context['style']['reference_directions']
                             if d['id'] == 'fred-explainer-20261015')
            self.assertTrue(direction['guidance_loaded'])
            evidence = styles.read_json(direction['guidance_source']['path'])
            self.assertEqual(direction['direction_contract'], evidence['direction_contract'])
            reading = {Path(p['path']).name for p in context['required_reading']}
            self.assertTrue({'user-ui.md', 'fred-ui-direction.md'}.issubset(reading))
            self.assertTrue(any(s['id'] == 'fred-argon' for s in context['source_study']['sources']))
            self.assertIn(direction['direction_contract']['summary'],
                          (project / 'director-brief.md').read_text(encoding='utf-8'))

    def test_fred_default_is_selected_only_for_user_ui(self):
        user = styles.resolve('E:/ui')
        self.assertEqual([d['id'] for d in user['reference_directions']], ['fred-explainer-20261015'])
        for account in ('adiao', 'fangmu'):
            selected = styles.resolve('E:/ui', account)
            self.assertEqual(selected['resolved_profile'], account)
            self.assertEqual(selected['reference_directions'], [])
            self.assertFalse(any(Path(p['path']).name == 'fred-ui-direction.md'
                                 for p in selected['required_reading']))
        with tempfile.TemporaryDirectory(prefix='no-reference-default-') as folder:
            unresolved = styles.resolve(folder)
            self.assertEqual(unresolved['status'], 'unresolved')
            self.assertEqual(unresolved['reference_directions'], [])
            self.assertEqual(unresolved['required_reading'], [])

    def test_project_profile_overrides_folder_and_baseline_claim_is_not_approval(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            project = Path(folder)
            draft = project / 'new-draft.mp4'
            draft.write_bytes(b'not a real video; existence must not imply approval')
            (project / 'project.json').write_text(json.dumps({
                'style': {'profile': 'fangmu', 'baseline': str(draft), 'tokens': {'background': '#fff'}}
            }), encoding='utf-8')
            (project / 'src').mkdir()
            result = styles.resolve(project / 'src')
            self.assertEqual(result['resolved_profile'], 'fangmu')
            self.assertTrue(result['selection_source'].startswith('project-metadata:'))
            self.assertNotIn(str(draft.resolve()), [x['path'] for x in result['confirmed_baselines']])
            self.assertIn(str(draft.resolve()), [x['path'] for x in result['excluded_baselines']])
            self.assertEqual(styles.resolve(project, 'adiao')['resolved_profile'], 'adiao')

    def test_conflicting_or_unknown_project_profiles_do_not_fall_through(self):
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            project = Path(folder)
            config = project / 'project.json'
            config.write_text(json.dumps({'account': 'adiao', 'style': {'profile': 'fangmu'}}), encoding='utf-8')
            self.assertEqual(styles.resolve(project)['status'], 'unresolved')
            config.write_text(json.dumps({'profile': 'unregistered-account'}), encoding='utf-8')
            self.assertEqual(styles.resolve(project)['status'], 'unresolved')

    def test_more_specific_root_then_project_account_then_explicit_selection(self):
        registry = styles.read_json(styles.ROOT / styles.REGISTRY)
        with tempfile.TemporaryDirectory(prefix='style-registry-') as folder:
            project = Path(folder)
            named = project / 'named-account'
            named.mkdir()
            for config in registry['profiles']:
                config['project_roots'] = ([str(project)] if config['id'] == 'user-ui' else
                                           [str(named)] if config['id'] == 'fangmu' else [])
            self.assertEqual(styles.resolve(project, registry=registry)['resolved_profile'], 'user-ui')
            self.assertEqual(styles.resolve(named / 'src', registry=registry)['resolved_profile'], 'fangmu')
            (named / 'project.json').write_text(json.dumps({'account': 'adiao'}), encoding='utf-8')
            self.assertEqual(styles.resolve(named / 'src', registry=registry)['resolved_profile'], 'adiao')
            self.assertEqual(styles.resolve(named / 'src', 'user-ui', registry=registry)['resolved_profile'], 'user-ui')

    def test_current_asset_map_is_reread_and_false_approval_is_respected(self):
        registry = styles.read_json(styles.ROOT / styles.REGISTRY)
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
        self.registry = {'profiles': [
            {'id': profile, 'label': profile, 'profile_path': f'references/profiles/{profile}.md',
             'sources': [], 'reference_directions': ([{'id': 'current', 'guidance_path': 'references/direction.json'}]
                                                    if profile == 'user-ui' else [])}
            for profile in ('user-ui', 'fangmu', 'adiao')]}
        (self.root / styles.REGISTRY).write_text(json.dumps(self.registry), encoding='utf-8')
        self.project = self.base / 'project'
        self.project.mkdir()

    def save_direction(self):
        (self.root / 'references/direction.json').write_text(json.dumps(self.record), encoding='utf-8')

    def resolve(self, profile='user-ui', root=None):
        return styles.resolve(self.project, profile, root=root or self.root)

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
            self.assertEqual(self.resolve(profile)['reference_directions'], [])
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


if __name__ == '__main__':
    unittest.main()
