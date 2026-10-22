"""Local evidence retrieval/integration checks; no media, network or rendering."""
import copy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import director
import source_study
import ui


class SourceStudyTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name)
        for rel in director.REQUIRED_REFS:
            p = self.root / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('Local fixture, not production evidence.', encoding='utf-8')
        self.catalog = {'schema_version': 1, 'collection_id': 'test-only', 'methods': [
            {'id': 'M1', 'title': '保留上下文的聚焦', 'category': 'editing',
             'semantic_use': '定位真实操作入口', 'viewer_gap': '不知道入口属于哪里',
             'state_chain': ['完整界面', '聚焦入口', '操作', '结果'],
             'editing_steps': ['保留软件窗口', '收窄聚焦范围'],
             'avoid': ['不要遮住关键状态'],
             'source_examples': [{'video': 'network', 'start': 1, 'end': 3,
                                  'row_ids': ['N-L001'], 'shot_ids': ['N001']}]},
            {'id': 'M2', 'title': '反例边界', 'semantic_use': '解释不成立的直连',
             'polarity': 'negative', 'avoid': ['仅作反例，不作正向适配'],
             'source_examples': [{'video': 'network', 'row_ids': ['N-L002'],
                                  'polarity': 'negative'}]},
        ]}
        self.write(source_study.CATALOG_FILE, self.catalog)
        self.write(source_study.MANIFEST_FILE, {'schema_version': 1, 'fixture': True})
        self.alignment = {'video': 'network', 'source': 'not-copied-reference.mp4',
                          'review': {'audio_listened': False},
                          'rows': [{'id': 'N-L001', 'start': 1, 'end': 3,
                                    'asr_text': '原始错别字', 'text': '屏幕校正文字',
                                    'shot_ids': ['N001'], 'status': 'visual_checked'},
                                   {'id': 'N-L002', 'start': 3, 'end': 4,
                                    'asr_text': '反例句', 'text': '反例句',
                                    'shot_ids': ['N002'], 'status': 'visual_checked'}],
                          'shots': [{'id': 'N001', 'visible_action': '原窗口变暗，入口保留'},
                                    {'id': 'N002', 'visible_action': '错误路径打叉'}]}
        self.write(source_study.EVIDENCE_DIR + '/network.json', self.alignment)
        self.write(director.RECIPE_FILE, {'recipes': [{'id': 'S01', 'title': '关系'}]})
        self.script = self.root / '稿件.txt'
        self.script.write_text('先看入口。', encoding='utf-8')
        (self.root / 'scene.js').write_text('// implementation fixture', encoding='utf-8')
        self.plan = {'schema_version': 1,
                     'source': {'path': '稿件.txt', 'sha256': hashlib.sha256(self.script.read_bytes()).hexdigest()},
                     'style': {'tokens': {'font': 'project-font', 'background': 'project-color'}},
                     'timing': {'basis': 'script-estimate'},
                     'segments': [{'id': 'one', 'quote': '先看入口。', 'context': '上文介绍模块',
                                   'meaning': '定位入口', 'viewer_gap': '不知道去哪里',
                                   'why': '保持软件上下文', 'carrier': 'diagram', 'recipe_ids': ['S01'],
                                   'objects': ['window'], 'focus': '入口', 'reading_exit': '位置看清',
                                   'events': [{'initial': '窗口完整', 'trigger': '说入口',
                                               'change': '聚焦', 'result': '位置可辨'}],
                                   'continuity': {'entry': '保留窗口', 'exit': '操作结果'},
                                   'implementation': {'path': 'scene.js'}, 'assets': []}]}

    def write(self, relative, payload):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(payload, ensure_ascii=False), encoding='utf-8')
        return path

    def ref(self, method='M1', row='N-L001', usage='adapt'):
        return {'method_id': method, 'usage': usage,
                'examples': [{'video': 'network', 'row_ids': [row]}]}

    def check(self):
        return director.check(self.write('plan.json', self.plan), self.root)

    def test_read_known_method_retains_avoid_and_unknown_id_fails(self):
        record = source_study.read_method('M1', self.root)
        self.assertEqual(record['avoid'], ['不要遮住关键状态'])
        self.assertEqual(source_study.list_methods(self.root)['count'], 2)
        with self.assertRaisesRegex(ValueError, 'Unknown source-study'):
            source_study.read_method('DOES-NOT-EXIST', self.root)

    def test_search_only_returns_literal_candidates_and_no_match_stays_empty(self):
        result = source_study.find_methods('聚焦 入口', self.root)
        self.assertEqual([m['id'] for m in result['candidates']], ['M1'])
        self.assertFalse(result['semantic_match'])
        missing = source_study.find_methods('unexpected-ZQ8937', self.root)
        self.assertEqual(missing['candidates'], [])
        self.assertEqual(missing['total_matches'], 0)
        with self.assertRaises(ValueError):
            source_study.find_methods('   ', self.root)

    def test_example_reads_original_and_corrected_text_and_linked_shot(self):
        before = (self.root / source_study.EVIDENCE_DIR / 'network.json').read_bytes()
        result = source_study.example('network', 'N-L001', self.root)
        self.assertEqual(result['row']['asr_text'], '原始错别字')
        self.assertEqual(result['row']['text'], '屏幕校正文字')
        self.assertEqual([s['id'] for s in result['shots']], ['N001'])
        self.assertFalse(result['media_accessed'])
        self.assertFalse(result['review']['audio_listened'])
        self.assertEqual(before, (self.root / source_study.EVIDENCE_DIR / 'network.json').read_bytes())
        with self.assertRaises(ValueError):
            source_study.example('network', 'N-MISSING', self.root)
        with self.assertRaises(ValueError):
            source_study.example('../network', 'N-L001', self.root)

    def test_recovered_creative_dialogue_is_a_valid_distinct_source_row(self):
        # Actual C-R005 text pair; the role marker also exercises verbatim pass-through.
        recovered = {'id': 'C-R005', 'source_segment_ids': [], 'source_recovered_ids': [6],
                     'source_file': 'recovered-gaps.json', 'start': 870.84, 'end': 871.84,
                     'asr_text': '座椅可以了', 'text': '天井这个方案可行',
                     'speech_role': 'embedded_sample_dialogue',
                     'shot_ids': ['C194'], 'status': 'visual_checked'}
        creative = {'rows': [], 'supplemental_rows': [recovered], 'shots': [{'id': 'C194'}]}
        self.write(source_study.EVIDENCE_DIR + '/creative.json', creative)
        self.catalog['methods'].append({'id': 'Q-A07', 'source_examples': [
            {'video': 'creative', 'row_ids': ['C-R005'], 'shot_ids': ['C194']}]})
        self.write(source_study.CATALOG_FILE, self.catalog)
        result = source_study.example('creative', 'C-R005', self.root)
        self.assertEqual(result['row'], recovered)
        self.assertEqual(result['shots'], [{'id': 'C194'}])
        refs = [{'method_id': 'Q-A07', 'examples': [{'video': 'creative', 'row_ids': ['C-R005']}]}]
        self.assertEqual(source_study.validate_refs(refs, self.root), ([], []))
        creative['rows'].append(copy.deepcopy(recovered))
        self.write(source_study.EVIDENCE_DIR + '/creative.json', creative)
        with self.assertRaisesRegex(ValueError, 'unique'):
            source_study.alignment('creative', self.root)

    def test_prepare_preserves_full_study_when_candidate_search_is_unavailable(self):
        project = self.root / 'project'
        report = director.prepare(self.script, project, root=self.root)
        self.assertFalse(report['plan_authored'])
        context = director.load_json(project / 'director-context.json')
        study = context['source_study']
        self.assertEqual(study['count'], 0)
        self.assertEqual(study['catalog_count'], 2)
        self.assertEqual(context['selection']['status'], 'unavailable')
        original = source_study.directing_context(self.root)
        self.assertEqual(original['methods'][0]['state_chain'], self.catalog['methods'][0]['state_chain'])
        self.assertEqual(original['methods'][0]['source_examples'][0]['row_ids'], ['N-L001'])
        self.assertEqual(original['methods'][0]['avoid'], ['不要遮住关键状态'])
        self.assertEqual(original['methods'][1]['polarity'], 'negative')
        self.assertEqual(original['methods'][1]['avoid'], ['仅作反例，不作正向适配'])
        self.assertEqual(study['manifest'], str((self.root / source_study.MANIFEST_FILE).resolve()))
        self.assertTrue(context['production']['on_demand']['source_study']['path'].endswith('source-study-guide.md'))
        self.assertNotIn('selected_method', study)

    def test_prepare_retains_real_fred_implementation_and_validation_boundaries(self):
        method = source_study.read_method('F-M01')
        self.catalog['methods'].append(method)
        self.write(source_study.CATALOG_FILE, self.catalog)
        project = self.root / 'project'
        candidates = {'segments': [{'methods': [{'id': 'F-M01'}]}]}
        with patch.object(director.selection, 'build_selection_context', return_value=candidates), \
             patch.object(director.selection, 'render_selection_brief', return_value='candidate brief'):
            director.prepare(self.script, project, root=self.root)
        context = director.load_json(project / 'director-context.json')
        compact = next(row for row in context['source_study']['methods'] if row['id'] == 'F-M01')
        self.assertEqual(compact['implementation'], method['implementation'])
        self.assertEqual(compact['validation'], method['validation'])
        self.assertIn('Fred整段未重建', compact['implementation']['scope'])
        self.assertFalse(compact['validation']['new_render_verified'])
        self.assertFalse(compact['validation']['user_approved'])
        self.assertNotIn('implementation', source_study.compact(self.catalog['methods'][0]))
        empty = source_study.compact({'id': 'empty', 'implementation': {}, 'validation': None})
        self.assertEqual(empty, {'id': 'empty', 'implementation': {}, 'validation': None})

    def test_real_fred_adaptation_warns_about_work_remaining_without_blocking(self):
        method = source_study.read_method('F-M01')
        source = method['source_examples'][0]
        ref = {'method_id': 'F-M01', 'usage': 'adapt',
               'examples': [{'video': source['video'], 'row_ids': source['row_ids']}]}
        errors, warnings = source_study.validate_refs([ref])
        self.assertEqual(errors, [])
        warning = next(w for w in warnings if 'Fred整段未重建' in w)
        self.assertIn('match-handoff只搬运同一节点', warning)
        self.assertIn('须核对本期实际实现', warning)
        ref['usage'] = 'avoid'
        errors, warnings = source_study.validate_refs([ref])
        self.assertEqual(errors, [])
        self.assertFalse(any('须核对本期实际实现' in w for w in warnings))
        self.catalog['methods'][0]['implementation'] = None
        self.write(source_study.CATALOG_FILE, self.catalog)
        self.assertEqual(source_study.validate_refs([self.ref()], self.root), ([], []))

    def test_missing_study_data_is_explicit_without_breaking_legacy_prepare(self):
        (self.root / source_study.CATALOG_FILE).unlink()
        report = director.prepare(self.script, self.root / 'project', root=self.root)
        self.assertTrue(any('Source-study' in w for w in report['warnings']))
        context = director.load_json(self.root / 'project/director-context.json')
        self.assertEqual(context['source_study']['methods'], [])
        self.assertFalse(context['source_study']['catalog_exists'])

    def test_old_plan_without_study_refs_remains_valid(self):
        (self.root / source_study.CATALOG_FILE).unlink()
        report = self.check()
        self.assertTrue(report['plan_valid'], report)
        self.assertFalse(report['render_ready'])  # source timing remains an estimate

    def test_valid_refs_at_top_level_and_segment_do_not_claim_semantics(self):
        self.plan['source_study_refs'] = [self.ref()]
        self.plan['segments'][0]['source_study_refs'] = [self.ref()]
        report = self.check()
        self.assertTrue(report['plan_valid'], report)
        self.assertIn('No semantic', report['scope'])
        self.assertFalse(report['generation_submitted'])

    def test_unknown_method_missing_row_and_wrong_method_membership_fail(self):
        for ref, expected in [(self.ref(method='UNKNOWN'), 'unknown method'),
                              (self.ref(row='N-MISSING'), 'unknown source row'),
                              (self.ref(row='N-L002'), 'not registered')]:
            self.plan['segments'][0]['source_study_refs'] = [ref]
            report = self.check()
            self.assertFalse(report['plan_valid'], report)
            self.assertTrue(any(expected in e for e in report['errors']), report)

    def test_explicit_negative_example_may_be_avoided_but_not_adapted(self):
        self.plan['source_study_refs'] = [self.ref('M2', 'N-L002')]
        report = self.check()
        self.assertFalse(report['plan_valid'], report)
        self.assertTrue(any('explicitly negative' in e for e in report['errors']))
        self.plan['source_study_refs'][0]['usage'] = 'avoid'
        self.assertTrue(self.check()['plan_valid'])

    def test_explicit_negative_method_may_only_be_avoided(self):
        self.catalog['methods'][0]['polarity'] = 'negative'
        self.write(source_study.CATALOG_FILE, self.catalog)
        errors, _ = source_study.validate_refs([self.ref()], self.root)
        self.assertTrue(any('negative method' in e for e in errors))
        self.assertEqual(source_study.validate_refs([self.ref(usage='avoid')], self.root), ([], []))

    def test_unverified_evidence_warns_without_pretending_to_review(self):
        self.alignment['rows'][0]['status'] = 'unverified'
        self.write(source_study.EVIDENCE_DIR + '/network.json', self.alignment)
        errors, warnings = source_study.validate_refs([self.ref()], self.root)
        self.assertEqual(errors, [])
        self.assertTrue(any('unverified' in w for w in warnings))

    def test_malformed_optional_refs_report_errors(self):
        for value in ({}, [None], [{'method_id': []}],
                      [dict(self.ref(), usage=[])], [dict(self.ref(), examples={})]):
            errors, _ = source_study.validate_refs(value, self.root)
            self.assertTrue(errors, value)

    def test_duplicate_catalog_ids_are_rejected(self):
        self.catalog['methods'].append(copy.deepcopy(self.catalog['methods'][0]))
        self.write(source_study.CATALOG_FILE, self.catalog)
        with self.assertRaisesRegex(ValueError, 'unique'):
            source_study.method_records(self.root)

    def register_fred_fixture(self):
        records = source_study.source_records(self.root)
        records.append({'id': 'fred-argon',
                        'alignment': 'references/evidence/fred-argon-study/alignment.json',
                        'manifest': 'references/evidence/fred-argon-study/index.json'})
        self.write(source_study.SOURCE_REGISTRY_FILE, {'schema_version': 1, 'sources': records})
        self.write(records[-1]['manifest'], {'fixture': True})
        self.write(records[-1]['alignment'], {
            'video': 'fred-argon', 'source': 'source-not-copied.mp4',
            'review': {'normal_speed_human_listening_review': False},
            'rows': [{'id': 'F-L001', 'asr_text': '原始转写', 'text': '校正文本',
                      'shot_ids': ['F1-01'], 'status': 'visual_checked'},
                     {'id': 'F-L002', 'shot_ids': [], 'status': 'visual_checked'}],
            'supplemental_rows': [{'id': 'F-R001', 'text': '第四块，长任务',
                                   'speech_basis': 'subtitle_only', 'shot_ids': ['P2-30']}],
            'shots': [{'id': 'F1-01', 'visible_action': '同一材料展开'},
                      {'id': 'P2-30', 'visible_action': '章节成为导航'}]})
        self.catalog['methods'].append({'id': 'F-M01', 'title': '同源展开',
                                       'source_examples': [{'video': 'fred-argon',
                                                            'row_ids': ['F-L001', 'F-R001']}]})
        self.write(source_study.CATALOG_FILE, self.catalog)
        return records

    def test_registry_routes_new_alignment_name_and_preserves_old_sources(self):
        self.register_fred_fixture()
        result = source_study.example('fred-argon', 'F-L001', self.root)
        self.assertTrue(result['alignment'].endswith('alignment.json'))
        self.assertTrue(result['manifest'].endswith('fred-argon-study\\index.json') or
                        result['manifest'].endswith('fred-argon-study/index.json'))
        self.assertEqual(result['row']['asr_text'], '原始转写')
        self.assertEqual([s['id'] for s in result['shots']], ['F1-01'])
        self.assertFalse(result['media_accessed'])
        self.assertEqual(source_study.example('network', 'N-L001', self.root)['row']['text'], '屏幕校正文字')
        recovered = source_study.example('fred-argon', 'F-R001', self.root)
        self.assertEqual(recovered['row']['speech_basis'], 'subtitle_only')
        self.assertFalse(recovered['review']['normal_speed_human_listening_review'])
        self.assertEqual([s['id'] for s in recovered['shots']], ['P2-30'])
        listed = source_study.list_methods(self.root)
        self.assertEqual([s['id'] for s in listed['sources']], [*source_study.VIDEOS, 'fred-argon'])
        with self.assertRaisesRegex(ValueError, 'Unknown source video'):
            source_study.example('../fred-argon', 'F-L001', self.root)

    def test_fred_refs_validate_membership_and_unknown_row_without_global_allowlist(self):
        self.register_fred_fixture()
        ref = {'method_id': 'F-M01', 'examples': [{'video': 'fred-argon', 'row_ids': ['F-L001', 'F-R001']}]}
        self.assertEqual(source_study.validate_refs([ref], self.root), ([], []))
        for row, message in [('F-L002', 'not registered'), ('F-MISSING', 'unknown source row')]:
            ref['examples'][0]['row_ids'] = [row]
            errors, _ = source_study.validate_refs([ref], self.root)
            self.assertTrue(any(message in e for e in errors), errors)
        self.plan['segments'][0]['source_study_refs'] = [
            {'method_id': 'F-M01', 'examples': [{'video': 'fred-argon', 'row_ids': ['F-L001']}]}]
        self.assertTrue(self.check()['plan_valid'])

    def test_prepare_exposes_registered_sources_and_missing_new_data(self):
        records = self.register_fred_fixture()
        project = self.root / 'project'
        director.prepare(self.script, project, root=self.root)
        context = director.load_json(project / 'director-context.json')
        source = next(s for s in context['source_study']['sources'] if s['id'] == 'fred-argon')
        self.assertTrue(source['alignment_exists'])
        self.assertTrue(source['manifest_exists'])
        self.assertTrue(any(m['id'] == 'F-M01' for m in source_study.method_records(self.root)))
        self.assertEqual(context['source_study']['catalog_count'], len(source_study.method_records(self.root)))
        (self.root / records[-1]['alignment']).unlink()
        report = director.prepare(self.script, project, force=True, root=self.root)
        self.assertTrue(any('fred-argon' in w for w in report['warnings']))
        context = director.load_json(project / 'director-context.json')
        self.assertFalse(context['source_study']['all_sources_exist'])

    def test_invalid_registry_does_not_silently_use_legacy_paths(self):
        for payload in ([], {'schema_version': 1, 'sources': [
                {'id': 'same', 'alignment': 'a.json', 'manifest': 'm.json'},
                {'id': 'same', 'alignment': 'b.json', 'manifest': 'm.json'}]},
                {'schema_version': 1, 'sources': [{'id': 'bad', 'alignment': 'https://example.com/a', 'manifest': 'm.json'}]}):
            self.write(source_study.SOURCE_REGISTRY_FILE, payload)
            with self.assertRaises(ValueError):
                source_study.source_records(self.root)

    def test_ui_study_route_keeps_arguments_and_direct_route(self):
        study = ui.command('study', forward=['--', 'example', '--video', 'network', '--row', 'N-L001'])
        self.assertTrue(study[3].endswith('source_study.py'))
        self.assertEqual(study[4:], ['example', '--video', 'network', '--row', 'N-L001'])
        direct = ui.command('direct', forward=['--', 'recipes'])
        self.assertTrue(direct[3].endswith('director.py'))
        self.assertEqual(direct[4:], ['recipes'])


if __name__ == '__main__':
    unittest.main()
