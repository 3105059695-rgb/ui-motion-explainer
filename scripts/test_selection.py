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

import selection
import source_study

ROOT = Path(__file__).resolve().parents[1]


def retrieve(text):
    return selection.build_selection_context(ROOT, {
        'path': '<test-narration>', 'sha256': hashlib.sha256(text.encode()).hexdigest(), 'text': text})


def candidates(context, kind):
    return {row['id'] for unit in context['segments'] for row in unit[kind]}


class NarrationSelectionTests(unittest.TestCase):
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
