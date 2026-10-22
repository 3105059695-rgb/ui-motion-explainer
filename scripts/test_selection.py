"""Narration retrieval regressions against the retained real reference catalogs."""
import contextlib
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import selection
import source_study

ROOT = Path(__file__).resolve().parents[1]


def retrieve(text):
    return selection.build_selection_context(ROOT, {
        'path': '<test-narration>', 'sha256': hashlib.sha256(text.encode()).hexdigest(), 'text': text})


def candidates(context, kind):
    return {row['id'] for unit in context['segments'] for row in unit[kind]}


class NarrationSelectionTests(unittest.TestCase):
    def test_complete_scene_directory_is_unfiltered_and_preserves_build_boundaries(self):
        rows = [{'id': f'adu:anim3:s{i:02d}', 'pack': 'anim3', 'scene_id': f's{i:02d}',
                 'title': f'scene {i}', 'source': {'path': 'source.html', 'selector': f's{i:02d}'},
                 'manifest': {'path': 'manifest.json', 'sha256': 'manifest-digest'},
                 'preview': {'entry': 'preview.html', 'start': i, 'end': i + 1},
                 'build_status': 'requires-current-narration-bindings', 'runtime_verified_this_run': False,
                 'required_slots': [{'id': 'title', 'type': 'text'}], 'cues': ['inspect-only detail']}
                for i in range(1, 22)]
        catalog = {'status': 'source-adaptation-candidates', 'packs': [{'id': 'anim3'}], 'scenes': rows}
        with patch.dict(sys.modules, {'scene_builder': SimpleNamespace(scene_catalog=lambda root: catalog)}):
            directory = selection.scene_directory(ROOT)
        self.assertEqual(21, directory['scene_count'])
        self.assertEqual([row['id'] for row in rows], [row['id'] for row in directory['scenes']])
        self.assertEqual(rows[0]['source'], directory['scenes'][0]['source'])
        self.assertEqual(rows[0]['preview'], directory['scenes'][0]['preview'])
        self.assertEqual(rows[0]['manifest'], directory['scenes'][0]['manifest'])
        self.assertNotIn('cues', directory['scenes'][0])
        self.assertFalse(directory['runtime_verified_this_run'])
        self.assertIn('--scenes s01,s04', directory['commands']['scaffold'])

    def test_adu_family_inspect_exposes_scene_builder_without_parameterizing_other_families(self):
        directory = {'scene_count': 21, 'scenes': [], 'commands': dict(selection.SCENE_COMMANDS)}
        with patch.object(selection, 'scene_directory', return_value=directory):
            result = selection.inspect('family', 'adu-mechanisms')
        self.assertEqual(21, result['scene_library']['scene_count'])
        builder = result['current_resources']['scene_builder']
        self.assertIn('ui.py scene build --plan', builder['commands']['build'])
        self.assertIn('ui.py scene compile --plan', builder['commands']['compile'])
        self.assertFalse(builder['runtime_verified_this_run'])
        self.assertIn('其他展项不自动成为', builder['scope'])
        other = selection.inspect('family', 'device-motion')
        self.assertNotIn('scene_library', other)
        self.assertNotIn('scene_builder', other['current_resources'])

    def test_sample_actions_are_discoverable_without_inheriting_whole_films(self):
        resolution = {'method_examples': [{'id': 'loss', 'profile_id': 'adiao',
            'path': '/reference.mp4', 'scope': 'historical approval',
            'retrieval': {'title': '旧片', 'semantic_use': '脑中画面输入后只剩零散词',
                          'relation_tags': ['loss']}}], 'editing_mode': 'whiteboard'}
        source = {'path': '<fixture>', 'text': '脑中完整画面输入后只剩零散词。多卡归并、成果展开与协作的组合方向。'}
        result = selection.build_selection_context(ROOT, source, style_resolution=resolution)
        self.assertEqual([], [row for unit in result['segments'] for row in unit['approved_examples']])
        samples = [row for unit in result['segments'] for row in unit['library_candidates'] if row['kind'] == 'sample']
        self.assertTrue(samples)
        self.assertTrue(all(not row['baseline_selected'] for row in samples))
        self.assertFalse(result['whole_film_recommendations'])
        self.assertEqual(0, result['catalog_counts']['applicable_approved_examples'])
        brief = selection.render_selection_brief(result)
        self.assertNotIn('本人认可作品', brief)
        self.assertIn('inspect --kind sample --id A01', brief)
        self.assertEqual('A01', selection.inspect('sample', 'A01')['record']['id'])

    def test_whole_narration_study_returns_speech_context_and_actual_visual_records(self):
        text = '我原来每天要在三个工具之间反复复制粘贴，任务一直做不完，烦得想摔电脑。现在把任务交给Agent，它在几个工位之间接力，我终于松了一口气。'
        context = retrieve(text)
        study = context['narration_study']
        self.assertEqual(text, context['source']['text'])
        self.assertEqual(text, study['source_text'])
        self.assertTrue(study['methods'])
        self.assertTrue(all(row['id'].startswith('Q-') for row in study['methods']))
        examples = [example for row in study['methods'] for example in row['examples'] if example['video'] in source_study.VIDEOS]
        self.assertTrue(any(len(example['source_rows']) > 1 for example in examples))
        self.assertTrue(any(example['context_before'] or example['context_after'] for example in examples))
        self.assertTrue(any(shot.get('material') and shot.get('visible_action') for example in examples for shot in example['visual_evidence']))
        self.assertTrue(all(not example['media_reviewed_this_run'] for example in examples))
        evidence = [item for example in examples for shot in example['visual_evidence'] for item in shot.get('evidence', [])]
        self.assertTrue(evidence)
        self.assertTrue(all(item['status'] in ('available', 'missing') for item in evidence))
        self.assertTrue(all(item['path'] is None or Path(item['path']).is_file() for item in evidence))
        self.assertTrue(all('historical_path' in item and 'video_fallback' in item for item in evidence))
        self.assertIn('来源原句', selection.render_selection_brief(context))
        self.assertIn('画面 ', selection.render_selection_brief(context))

    def test_visual_evidence_resolves_explicit_local_alignment_and_preserves_history(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder) / 'skill'
            (root / 'references').mkdir(parents=True)
            local = Path(folder) / 'original-study'
            (local / 'analysis').mkdir(parents=True)
            image = local / 'analysis/sequence-002.jpg'
            image.write_bytes(b'presence fixture, not a decoded image')
            alignment = local / 'alignment.json'
            mapped_shot = {'id': 'W012', 'start': 10, 'end': 13,
                           'evidence': [{'path': 'analysis/sequence-002.jpg', 'times': [10.5, 11.5]}]}
            alignment.write_text(json.dumps({'video': 'workflow', 'shots': [mapped_shot]}), encoding='utf-8')
            (root / 'references/resources.local.json').write_text(json.dumps({'schema_version': 1,
                'files': {'aigc-research:workflow-sentence-alignment': {'path': str(alignment)}}}), encoding='utf-8')
            shot = {'id': 'W012', 'start': 10, 'end': 13, 'material': 'existing observation',
                    'evidence': [{'path': 'local-only/sequence-002.jpg', 'times': [10.5, 11.5]}]}
            facts = {'alignment': str(root / 'references/workflow.json'),
                     'original_media': {'path': str(local / 'source.mp4'), 'file_exists': True}}
            context = selection._local_study_evidence('workflow', root)
            result = selection._visual_evidence(shot, facts, context, root)
            evidence = result['evidence'][0]
            self.assertEqual(str(image.resolve()), evidence['path'])
            self.assertEqual('available', evidence['status'])
            self.assertEqual('explicit-local-alignment', evidence['resolution_source'])
            self.assertEqual('local-only/sequence-002.jpg', evidence['historical_path'])
            self.assertEqual('existing observation', result['material'])
            self.assertEqual([10.5, 11.5], evidence['video_fallback']['times'])
            self.assertFalse(evidence['media_reviewed_this_run'])
            self.assertEqual('local-only/sequence-002.jpg', shot['evidence'][0]['path'])
            # A same-named image belonging to a different observed interval cannot bind.
            context['shots']['W012']['start'] = 100
            unmatched = selection._visual_evidence(shot, facts, context, root)['evidence'][0]
            self.assertIsNone(unmatched['path'])
            self.assertEqual('missing', unmatched['status'])
            self.assertEqual(facts['original_media']['path'], unmatched['video_fallback']['path'])

    def test_missing_study_image_has_video_times_and_no_invented_path(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            shot = {'id': 'X1', 'start': 3, 'end': 6,
                    'evidence': [{'path': 'local-only/not-here.jpg', 'times': [3.5, 4.5]}]}
            facts = {'original_media': {'path': str(root / 'known-source.mp4'), 'file_exists': True}}
            context = selection._local_study_evidence('unmapped', root)
            evidence = selection._visual_evidence(shot, facts, context, root)['evidence'][0]
            self.assertIsNone(evidence['path'])
            self.assertEqual('missing', evidence['status'])
            self.assertEqual('local-only/not-here.jpg', evidence['historical_path'])
            self.assertEqual('available', evidence['video_fallback']['status'])
            self.assertEqual([3.5, 4.5], evidence['video_fallback']['times'])
            self.assertEqual((3, 6), (evidence['video_fallback']['start'], evidence['video_fallback']['end']))
            self.assertFalse(evidence['media_reviewed_this_run'])
            # A recorded image beside the registered study is usable without overlay.
            (root / 'local-only').mkdir()
            image = root / 'local-only/not-here.jpg'
            image.write_bytes(b'presence fixture')
            direct = selection._visual_evidence(shot, facts, context, root)['evidence'][0]
            self.assertEqual(str(image.resolve()), direct['path'])
            self.assertEqual('registered-evidence-path', direct['resolution_source'])

    def test_fredtalk_records_share_existing_ranking_and_namespaced_inspect(self):
        import fredtalk_library
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            base = root / 'assets/fredtalk-library'
            (base / 'blobs').mkdir(parents=True)
            content = b'export const Demo = () => "fixture";'
            blob = base / 'blobs/fixture.tsx'
            blob.write_bytes(content)
            source = {'blob_path': 'assets/fredtalk-library/blobs/fixture.tsx',
                      'upstream_path': 'src/Demo.tsx', 'sha256': hashlib.sha256(content).hexdigest(),
                      'git_blob': hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\0' + content).hexdigest(),
                      'bytes': len(content)}
            description = '同一份资料展开成报告与图表，窗口共享来源联动更新'
            active = {'id': 'fixture-active', 'title': description, 'semantic_use': description,
                      'source_access': 'public', 'sources': [source], 'closure': [source]}
            (base / 'catalog.json').write_text(json.dumps({'schema_version': 1, 'items': [active,
                dict(active, id='fixture-archive', archived=True),
                dict(active, id='fixture-members', source_access='members')]}), encoding='utf-8')
            catalog = {'capabilities': [], 'semantic_routes': [], 'sample_records': [],
                       'software_presets': [], 'reference_cases': [],
                       'families': [{'id': 'control', 'title': description, 'semantic_use': description}]}
            rows = selection._library_records(catalog, root)
            self.assertEqual({'control', 'fredtalk:fixture-active'}, {row['id'] for row in rows})
            with patch.object(selection, '_catalogs', return_value=([], [], catalog)):
                result = selection.build_selection_context(root, {'text': description}, style_resolution={})
            chosen = result['segments'][0]['library_candidates']
            self.assertEqual({'control', 'fredtalk:fixture-active'}, {row['id'] for row in chosen})
            self.assertEqual(chosen[0]['retrieval']['score'], chosen[1]['retrieval']['score'])
            row = next(row for row in chosen if row['id'].startswith('fredtalk:'))
            self.assertEqual('software-preset', row['kind'])
            self.assertIn('materialize --id fredtalk:fixture-active', row['materialize_command'])
            self.assertFalse(row['baseline_selected'])
            self.assertEqual('unreviewed', row['user_approval']['status'])
            self.assertEqual(1, result['catalog_counts']['fredtalk_active_source_records'])
            self.assertEqual(str((base / 'README.md').resolve()), result['library_guidance'][0]['path'])
            self.assertFalse(result['library_guidance'][0]['exists'])
            self.assertIn('不强制选择此库', selection.render_selection_brief(result))
            inspected = selection.inspect('software-preset', 'fredtalk:fixture-active', root)
            self.assertTrue(inspected['current_sources']['available'])
            self.assertTrue(inspected['current_sources']['sources'][0]['hash_verified'])
            self.assertEqual('verified', inspected['current_resources']['implementation']['integrity_status'])
            self.assertFalse(inspected['runtime_tested_this_run'])
            self.assertEqual('unreviewed', inspected['approval_state'])
            archived = selection.inspect('software-preset', 'fredtalk:fixture-archive', root)
            self.assertTrue(archived['record']['archived'])
            members = selection.inspect('software-preset', 'fredtalk:fixture-members', root)
            self.assertFalse(members['current_sources']['available'])

    def test_comparison_and_information_loss_retrieve_different_mechanisms(self):
        comparison = retrieve('我用同样的问题让两个模型回答，一个只要八分钟，另一个用了二十四分钟。把两份结果放在同样尺度下比较。')
        expression = retrieve('脑中明明是一整片完整画面，可是说出来只剩几个零散的词，真正的想法在表达时丢失了。')
        self.assertIn('S05', candidates(comparison, 'recipes'))
        self.assertNotIn('S09', candidates(comparison, 'recipes'))
        self.assertIn('S09', candidates(expression, 'recipes'))
        self.assertNotIn('S05', candidates(expression, 'recipes'))
        self.assertNotEqual(candidates(comparison, 'methods'), candidates(expression, 'methods'))

    def test_synonym_relation_and_emotion_are_not_literal_and_queries(self):
        context = retrieve('我原来每天要在三个工具之间反复复制粘贴，任务一直做不完，烦得想摔电脑。现在把任务交给Agent，它在几个工位之间接力，我终于松了一口气。')
        self.assertTrue({'Q-W03', 'Q-A02'} & candidates(context, 'methods'))
        self.assertIn('S10', candidates(context, 'recipes'))
        self.assertTrue(context['segments'][0]['methods'])

    def test_negation_and_unknown_do_not_force_aigc_or_effects(self):
        negated = retrieve('这不是信息丢失，而是查询没有找到匹配结果。')
        self.assertNotIn('S09', candidates(negated, 'recipes'))
        plain = retrieve('谢谢大家观看，下次见。')
        self.assertFalse(candidates(plain, 'methods'))
        self.assertFalse(candidates(plain, 'recipes'))
        self.assertIn('none', plain['segments'][0]['decision']['allowed_outcomes'])

    def test_failure_recovery_matches_preserved_state_not_generic_cards(self):
        context = retrieve('代码改坏了不要重新开始，先恢复到保存的旧版本，再从存档点继续。')
        self.assertIn('Q-C01', candidates(context, 'methods'))
        self.assertIn('S04', candidates(context, 'recipes'))

    def test_shared_source_then_elliptical_update_keeps_event_context(self):
        context = retrieve('这份报告和图表其实来自同一份资料。只改动项目甲的状态，两边应该一起更新。')
        second = context['segments'][1]
        self.assertIn('F-M01', {r['id'] for r in second['methods']})
        self.assertIn('S04', {r['id'] for r in second['recipes']})
        self.assertTrue(any(cue.get('inherited_from_previous') for cue in second['cues'].values()))
        self.assertTrue(all(cue['needs_context_confirmation'] for cue in second['cues'].values()
                            if cue.get('inherited_from_previous')))

    def test_context_reset_and_metaphorical_labor_both_have_candidates(self):
        context = retrieve('一换工具，前面聊过的东西又得重新解释。我背着一大箱资料，来回搬运，越搬越累。')
        for unit in context['segments']:
            self.assertTrue({'Q-A02', 'Q-W03', 'Q-N03'} & {r['id'] for r in unit['methods']})
            self.assertIn('S10', {r['id'] for r in unit['recipes']})
        unrelated = retrieve('把同一份资料生成报告，再更新图表。谢谢大家观看，下次见。')
        self.assertFalse(unrelated['segments'][1]['methods'])

    def test_original_spans_and_context_preserved(self):
        text = '  同一份资料生成报告。\r\n\r\n 它随后进入图表，两个结果一起更新！\n最后谢谢大家。'
        context = retrieve(text)
        for unit in context['segments']:
            self.assertEqual(text[unit['span']['start']:unit['span']['end']], unit['quote'])
        self.assertEqual(context['segments'][1]['context_before'], '同一份资料生成报告。')
        self.assertEqual(context['source']['sha256'], hashlib.sha256(text.encode()).hexdigest())
        self.assertFalse(context['plan_authored'])
        self.assertFalse(context['generation_submitted'])
        self.assertTrue(all(u['decision']['status'] == 'pending-agent' for u in context['segments']))

    def test_negative_method_is_only_available_as_counterexample(self):
        context = retrieve('装饰文字和炫光挡住人物动作，观众看不懂变化。')
        self.assertNotIn('Q-W08', candidates(context, 'methods'))
        self.assertIn('Q-W08', {r['id'] for r in context['counterexamples']})
        inspected = selection.inspect('method', 'Q-W08')
        self.assertEqual(inspected['current_resources']['usage'], 'avoid')

    def test_real_evidence_timecodes_and_implementation_are_readable(self):
        context = retrieve('我把同一份资料放进去，报告和图表就会一起更新。')
        self.assertEqual(context['segments'][0]['methods'][0]['id'], 'F-M01')
        method = context['segments'][0]['methods'][0]
        ex = method['examples'][0]
        self.assertTrue(Path(ex['alignment']).is_file())
        self.assertLess(ex['start'], ex['end'])
        self.assertTrue(ex['row_ids'])
        self.assertEqual(source_study.example(ex['video'], ex['row_ids'][0])['row']['id'], ex['row_preview'][0]['id'])
        recipe = selection.inspect('recipe', 'S06')['current_resources']
        self.assertTrue(recipe['implementation']['resources'][0]['exists'])
        self.assertFalse(recipe['implementation']['runtime_tested_this_run'])

    def test_real_fred_brief_exposes_missing_work_once_and_retains_validation(self):
        context = retrieve('这份报告和图表其实来自同一份资料。只改动项目甲的状态，两边应该一起更新。')
        selected = [row for unit in context['segments'] for row in unit['methods'] if row['id'] == 'F-M01']
        self.assertGreater(len(selected), 1)
        original = source_study.read_method('F-M01')
        self.assertEqual(selected[0]['validation'], original['validation'])
        self.assertFalse(selected[0]['validation']['new_render_verified'])
        self.assertTrue(selected[0]['validation']['reference_direction_user_approved'])
        brief = selection.render_selection_brief(context)
        self.assertEqual(brief.count('### method F-M01 ·'), 1)
        first_mention = next(line for line in brief.splitlines() if 'F-M01' in line)
        self.assertTrue(first_mention.startswith('- 来源方法候选：'))
        self.assertIn('F-M01 ' + original['title'] + '（原语可复用，整段需定制）', first_mention)
        self.assertIn('Fred整段未重建', brief)
        self.assertIn('assets/editing-kit/editing-kit.js', brief)
        self.assertIn('match-handoff只搬运同一节点，不生成分支与选中逻辑', brief)
        self.assertIn('"new_render_verified":false', brief)
        self.assertIn('"user_approved":false', brief)
        self.assertIn('入口存在不证明已经使用', brief)
        recipe = selection.inspect('recipe', 'S06')['current_resources']
        self.assertIn('full recipe requires project assets and timing', recipe['status']['implementation'])
        self.assertIn('not full recipe', recipe['component_validation']['scope'])

    def test_brief_no_match_and_empty_optional_boundaries_stay_explicit(self):
        context = retrieve('谢谢大家观看，下次见。')
        brief = selection.render_selection_brief(context)
        self.assertIn('未命中，不硬套', brief)
        self.assertNotIn('## 候选实现与验证边界', brief)
        row = selection._candidate({'id': 'empty', 'title': '空记录', 'implementation': None,
                                    'validation': None}, 'recipe', ROOT, {}, {})
        self.assertIsNone(row['validation'])
        self.assertFalse(row['implementation']['runtime_tested_this_run'])
        context['segments'][0]['recipes'] = [row]
        brief = selection.render_selection_brief(context)
        self.assertIn('目录未记录验证结论', brief)
        self.assertIn('源码存在不等于本段已实现', brief)
        self.assertIn('空记录（状态未标注）', brief)
        row['implementation']['status'] = 'future-status'
        self.assertIn('目录状态：future-status，成熟度未判定', selection.render_selection_brief(context))

    def test_all_current_methods_recipes_and_routes_have_retrieval_coverage(self):
        methods, recipes, capabilities = selection._catalogs(ROOT)
        self.assertFalse({r['id'] for r in methods} - selection.METHOD_TAGS.keys())
        self.assertFalse({r['id'] for r in recipes} - selection.RECIPE_TAGS.keys())
        self.assertEqual(len(capabilities['semantic_routes']), len(selection.ROUTE_TAGS))
        context = retrieve('打开设置，找到按钮，点击之后查看结果。')
        self.assertEqual(context['catalog_counts']['methods'], 50)
        self.assertEqual(context['catalog_counts']['positive_methods'], 49)
        self.assertEqual(context['catalog_counts']['recipes'], 10)
        self.assertEqual(context['catalog_counts']['capabilities'], 80)

    def test_retained_sample_family_preset_and_reference_are_retrievable(self):
        cases = [
            ('同一任务在桌面、手机之间转移，镜头跟随操作点和结果。', 'family', 'device-motion'),
            ('账号设置弹窗内，必填、个人资料、可选资料依次展开并折叠，然后确认已有地址。',
             'software-preset', 'interaction-account-setup-accordion'),
            ('Shape morphing through UI states', 'reference', 'twoclipping-5cba86'),
        ]
        for text, kind, ident in cases:
            with self.subTest(kind=kind):
                context = retrieve(text)
                rows = context['segments'][0]['library_candidates']
                row = next(r for r in rows if r['id'] == ident)
                self.assertEqual(row['kind'], kind)
                self.assertEqual(row['decision_status'], 'pending-agent')
                self.assertFalse(row['baseline_selected'])
                self.assertIn('整体构图', row['style_scope'])
                self.assertIn('窗口组织', row['reuse_scope'])
                brief = selection.render_selection_brief(context)
                self.assertIn('构图、材料与窗口设计库候选', brief)
                self.assertIn(f'inspect --kind {kind} --id {ident}', brief)
        counts = context['catalog_counts']['library_indexes']
        self.assertEqual(counts, {'sample_records': 7, 'families': 11,
                                  'software_presets': 103, 'reference_cases': 230})
        self.assertEqual(selection.inspect('sample', 'A01')['record']['id'], 'A01')
        preset = selection.inspect('software-preset', 'interaction-account-setup-accordion')
        self.assertTrue(preset['current_resources']['implementation']['resources'][0]['exists'])
        self.assertFalse(preset['current_resources']['implementation']['runtime_tested_this_run'])

    def test_library_retrieval_does_not_fill_unrelated_slots_or_choose_a_style(self):
        plain = retrieve('谢谢大家观看，下次见。')
        self.assertEqual(plain['segments'][0]['library_candidates'], [])
        one = retrieve('多卡归并、成果展开与协作的组合方向。')
        self.assertIn('A01', [r['id'] for r in one['segments'][0]['library_candidates']])
        self.assertFalse(one['plan_authored'])
        self.assertNotIn('style', one)

    def test_library_generic_ai_ui_overlap_does_not_recommend_unrelated_promos(self):
        for text in ('再也不用跟 AI 来回拉扯半天了。', 'AI', 'AIGC', 'UI'):
            with self.subTest(text=text):
                self.assertEqual(retrieve(text)['segments'][0]['library_candidates'], [])
        descriptive = retrieve('AI 账号设置弹窗内，必填、个人资料、可选资料依次展开并折叠，然后确认已有地址。')
        self.assertIn('interaction-account-setup-accordion', candidates(descriptive, 'library_candidates'))
        morphing = retrieve('Shape morphing through UI states')
        self.assertIn('twoclipping-5cba86', candidates(morphing, 'library_candidates'))

    def test_appearance_rejection_keeps_motion_but_explicit_negative_does_not(self):
        methods, recipes, catalog = selection._catalogs(ROOT)
        rejected = {'id': 'rejected-sample', 'title': '同一任务跨窗口交接',
                    'semantic_use': '同一任务跨窗口交接',
                    'user_approval': {'status': 'rejected-ui-baseline', 'scope': 'rejected UI'},
                    'implementation': {'status': 'source-present', 'sources': []}}
        negative = dict(rejected, id='counterexample-sample', polarity='negative', user_approval={})
        altered = dict(catalog, sample_records=[rejected, negative])
        with patch.object(selection, '_catalogs', return_value=(methods, recipes, altered)):
            context = retrieve('同一任务跨窗口交接。')
            ids = candidates(context, 'library_candidates')
            self.assertIn('rejected-sample', ids)
            self.assertNotIn('counterexample-sample', ids)
            item = selection.inspect('sample', 'rejected-sample')['current_resources']
            self.assertEqual(item['usage'], 'candidate-adapt')
            self.assertEqual(item['allowed_contributions'], ['motion'])
            self.assertEqual(item['user_approval'], rejected['user_approval'])
            self.assertFalse(item['baseline_selected'])

    def test_placeholder_sample_discovery_keeps_missing_paths_and_original_approval(self):
        context = retrieve('先保留原亮背景，小白色浮层避让脸、手和前臂。')
        self.assertIn('adiao/unemployment-v3-opening', {row['id'] for row in context['library_directory']['entries']})
        row = selection.inspect('sample', 'adiao/unemployment-v3-opening')['current_resources']
        catalog = selection._catalogs(ROOT)[2]
        original = next(r for r in catalog['sample_records'] if r['id'] == row['id'])
        self.assertEqual(row['user_approval'], original['user_approval'])
        self.assertFalse(row['implementation_paths_present'])
        self.assertFalse(row['baseline_selected'])
        self.assertIn('不成为本期默认', row['reuse_scope'])

    def test_full_library_directory_is_independent_of_top_n_and_empty_matches(self):
        context = selection.build_selection_context(ROOT, {'text': '谢谢大家观看，下次见。'}, limit=1)
        directory = context['library_directory']
        methods, recipes, catalog = selection._catalogs(ROOT)
        expected = {(row['library_kind'], row['id']) for row in selection._library_records(catalog, ROOT)}
        expected.update(('capability', row['id']) for row in catalog['capabilities'])
        self.assertEqual(expected, {(row['kind'], row['id']) for row in directory['entries']})
        self.assertEqual(len(expected), directory['entry_count'])
        self.assertFalse(directory['truncated'])
        self.assertFalse(directory['ranking_applied'])
        self.assertTrue(all(row['inspect_command'] for row in directory['entries']))
        self.assertEqual([], context['segments'][0]['library_candidates'])

    def test_chinese_tags_retrieve_english_reference_without_approval_bonus(self):
        tags = {'schema_version': 1, 'entries': {'twoclipping-5cba86': {
            'title_zh': '按钮加载器播放器的连续形态变化', 'tags': ['形状', '按钮', '加载器', '播放器', '连续变化']}}}
        with tempfile.TemporaryDirectory() as folder:
            tag_path = Path(folder) / selection.SEARCH_TAG_FILE
            tag_path.parent.mkdir()
            tag_path.write_text(json.dumps(tags, ensure_ascii=False), encoding='utf-8')
            rows = selection._library_records(selection._catalogs(ROOT)[2], Path(folder))
        reference = next(row for row in rows if row['id'] == 'twoclipping-5cba86')
        self.assertEqual(tags['entries'][reference['id']]['tags'], reference['search_tags'])
        with patch.object(selection, '_library_records', return_value=rows):
            context = retrieve('形状在按钮、加载器、播放器之间连续变化。')
        self.assertIn(reference['id'], candidates(context, 'library_candidates'))

    def test_explicit_motion_rejection_is_not_a_motion_candidate(self):
        record = {'id': 'x', 'user_approval': {'status': 'rejected-motion'}}
        self.assertFalse(selection.library_contribution_allowed(record, 'motion'))
        record['user_approval'] = {'status': 'rejected-palette'}
        self.assertTrue(selection.library_contribution_allowed(record, 'motion'))

    def test_components_are_discovered_from_actual_api_and_inspected_as_motion_only(self):
        rows = selection.component_records(ROOT)
        self.assertEqual(9, len(rows))
        self.assertIn('occlusion-reveal', {row['id'] for row in rows})
        item = selection.inspect('component', 'occlusion-reveal', ROOT)
        self.assertEqual(['motion'], item['current_resources']['allowed_contributions'])
        self.assertEqual('occlusion-reveal', item['record']['source'][0]['selector'])
        with self.assertRaisesRegex(ValueError, 'Unknown exported component'):
            selection.inspect('component', 'fake-component', ROOT)

    def test_library_listing_cli_exposes_unmatched_entries_without_script(self):
        result = subprocess.run([sys.executable, '-B', '-X', 'utf8', str(ROOT / 'scripts/ui.py'),
                                 'select', '--list-library'], capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode, 0, result.stderr)
        directory = json.loads(result.stdout)
        self.assertEqual(directory['entry_count'], len(directory['entries']))
        self.assertFalse(directory['ranking_applied'])
        self.assertIn('twoclipping-5cba86', {row['id'] for row in directory['entries']})
        self.assertIn('A01', {row['id'] for row in directory['entries']})

    def test_reference_resource_resolution_is_lazy_and_uses_real_inspector(self):
        import resource_inventory
        with patch.object(resource_inventory, 'inspect_reference', wraps=resource_inventory.inspect_reference) as inspect:
            context = retrieve('Shape morphing through UI states')
            row = next(r for r in context['segments'][0]['library_candidates']
                       if r['id'] == 'twoclipping-5cba86')
            inspect.assert_not_called()
            self.assertEqual(row['implementation']['resources'], [])
            self.assertEqual(row['resource_resolution'], 'deferred-to-reference-inspect')
            result = selection.inspect('reference', row['id'])
            inspect.assert_called_once_with(row['id'], root=ROOT)
            self.assertEqual(result['id'], row['id'])
            self.assertEqual(result['runtime_status'], 'not-verified')

    def test_file_input_cli_readonly_and_router(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / '原稿.txt'
            raw = '同一份资料生成报告，再更新图表。'.encode('utf-8-sig')
            path.write_bytes(raw)
            result = subprocess.run([sys.executable, '-B', '-X', 'utf8', str(ROOT / 'scripts/ui.py'),
                                     'select', '--script', str(path)], capture_output=True, text=True, encoding='utf-8')
            self.assertEqual(result.returncode, 0, result.stderr)
            data = json.loads(result.stdout)
            self.assertEqual(data['source']['sha256'], hashlib.sha256(raw).hexdigest())
            self.assertEqual(path.read_bytes(), raw)
            self.assertEqual(list(Path(folder).iterdir()), [path])

    def test_invalid_source_limit_and_id_are_explicit_errors(self):
        with self.assertRaises(ValueError):
            selection.build_selection_context(ROOT, {'text': ''})
        with self.assertRaises(ValueError):
            selection.build_selection_context(ROOT, {'text': '看看'}, limit=0)
        with self.assertRaises(ValueError):
            selection.inspect('method', 'NOT-REGISTERED')

    def test_markdown_explains_pending_decision(self):
        with contextlib.redirect_stdout(io.StringIO()) as output:
            self.assertEqual(selection.main(['select', '--text', '先找到这一栏，再点击确认。', '--format', 'markdown']), 0)
        self.assertIn('待 Agent 决策', output.getvalue())
        self.assertIn('成片时间段', output.getvalue())


if __name__ == '__main__':
    unittest.main()
