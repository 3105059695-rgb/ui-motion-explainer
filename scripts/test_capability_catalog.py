"""Coverage and dispatch checks for the portable production capability index."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import capability_catalog as catalog


class CapabilityCatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.fred = patch('fredtalk_library.records', return_value=[])
        self.fred.start()
        self.addCleanup(self.fred.stop)

    def write(self, name, value):
        path = self.root / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False) if not isinstance(value, str) else value,
                        encoding='utf-8')

    def basic(self):
        self.write('motion.js', 'real retained implementation fixture')
        self.write(catalog.selection.CAPABILITY_FILE, {
            'capabilities': [
                {'id': 'compare-proof', 'title': '对比两次修改的差异', 'semantic_use': '比较同一份材料修改以前和现在的结果',
                 'implementation': {'status': 'source-present', 'sources': [{'path': 'motion.js'}]}},
                {'id': 'missing-source', 'title': '字段放大聚焦', 'semantic_use': '定位并放大代码中的关键字段',
                 'implementation': {'status': 'source-present', 'sources': [{'path': 'missing.js'}]}},
                {'id': 'idea-only', 'title': '对比差异', 'semantic_use': '同一份材料修改前后比较',
                 'implementation': {'status': 'analysis-only', 'sources': []}},
            ], 'reference_cases': [{'id': 'historic', 'title': '历史保留参考', 'archived': True}]
        })
        self.write(catalog.RUNTIME_MANIFEST, {'schema': 'ui-motion-fusion/capability-runtime@1',
            'capabilities': [{'id': 'compare-change', 'type': 'compare-change', 'label': '比较前后改变',
                              'semantic_use': '同一份材料修改以前和现在的差异，比较结果',
                              'relations': ['compare', 'sync'], 'source_files': ['motion.js'],
                              'parameters': {'before': '本期前态', 'after': '本期后态'},
                              'example': {'type': 'compare-change'}}]})

    def test_all_source_kinds_and_missing_implementation_remain_distinct(self):
        self.basic()
        indexed = catalog.listing(self.root)
        states = {r['id']: r['execution_state'] for r in indexed['entries']}
        self.assertEqual(states['capability:compare-proof'], 'source-adaptation')
        self.assertEqual(states['capability:missing-source'], 'missing')
        self.assertEqual(states['capability:idea-only'], 'reference-only')
        self.assertEqual(states['native:compare-change'], 'direct')
        self.assertIn('reference:historic', states)
        self.assertFalse(indexed['truncated'])
        inspected = catalog.inspect('native:compare-change', self.root)
        self.assertEqual(inspected['parameters']['before'], '本期前态')
        self.assertIn('CapabilityRuntime.createScene', inspected['call']['api'])

    def test_dispatch_fails_closed_after_portable_source_is_removed(self):
        self.basic()
        (self.root / 'motion.js').unlink()
        rows = catalog.listing(self.root)['entries']
        self.assertEqual(next(r for r in rows if r['id'] == 'native:compare-change')['execution_state'], 'missing')
        self.assertEqual(catalog.search('对比以前和现在的结果', self.root, state='direct')['match_count'], 0)

    def test_retained_source_directories_are_not_reported_as_missing_files(self):
        self.write('presets/real-scene.js', 'retained implementation')
        row = catalog._base('family', {'id': 'presets', 'implementation': {
            'status': 'source-present', 'sources': ['presets']}}, self.root)
        self.assertEqual(row['execution_state'], 'source-adaptation')
        self.assertEqual(row['source_files'][0]['type'], 'directory')

    def test_registered_director_preset_exposes_existing_engine_and_real_parameters(self):
        self.basic()
        data = catalog._read(self.root, catalog.selection.CAPABILITY_FILE)
        data['software_presets'] = [{'id': 'real-preset', 'title': '任务分支展开',
                                    'implementation': {'sources': ['presets/real.js']}}]
        self.write(catalog.selection.CAPABILITY_FILE, data)
        self.write('presets/real.js', 'real retained preset implementation')
        for name in catalog.DIRECTOR_FILES:
            self.write('assets/modules/director/' + name, 'engine fixture')
        self.write('assets/modules/director/references/presets.json', [
            {'id': 'real-preset', 'duration': 16, 'params': {'title': '本期任务', 'agentName': 'Agent'},
             'paramLimits': {'title': 20}}])
        row = catalog.inspect('software-preset:real-preset', self.root)
        self.assertEqual(row['execution_state'], 'direct')
        self.assertEqual(row['style_scope'], 'source-native-review-current-style')
        self.assertEqual(row['parameters']['params']['agentName'], 'Agent')
        self.assertIn('--preset real-preset --duration 16', row['call']['materialize'])
        self.assertIn('--plan', row['call']['build'])
        self.assertIn('render --engine director', row['call']['render'])
        self.assertFalse(row['runtime_verified_this_run'])
        (self.root / 'assets/modules/director/scripts/render.py').unlink()
        self.assertEqual(catalog.inspect('software-preset:real-preset', self.root)['execution_state'], 'missing')

    def test_documentation_is_not_misrepresented_as_an_implementation(self):
        self.write('guide.md', 'observed method, no executable implementation')
        row = catalog._base('method', {'id': 'observed', 'implementation': {
            'status': 'source_observed_recipe', 'entrypoints': ['guide.md'], 'recipe_ids': ['S01']}}, self.root)
        self.assertEqual(row['execution_state'], 'reference-only')
        self.assertEqual(row['related_capabilities'], ['recipe:S01'])

    def test_semantically_exact_library_route_is_not_hidden_by_generic_native_events(self):
        self.basic()
        current = {'id': 'native:generic', 'title': '通用', 'execution_state': 'direct',
                   'style_scope': 'approved-body-current-palette', 'match': {'score': 1},
                   'call': {}, 'inspect_command': 'inspect native'}
        retained = {**current, 'id': 'software-preset:relevant', 'title': '内容对应的原预设',
                    'style_scope': 'source-native-review-current-style', 'match': {'score': 4}}
        with patch.object(catalog, 'search', return_value={'candidates': [current, retained],
                'match_count': 2, 'full_search_command': 'search all'}):
            result = catalog.routing_context('把会议任务分配给负责人。', self.root, limit=1)
        self.assertEqual(result['units'][0]['candidates'][0]['id'], retained['id'])

    def test_production_keeps_original_text_and_returns_actionable_source_without_study(self):
        self.basic()
        text = '先对比以前和现在的结果。\n再查看代码中的字段。'
        with patch('source_study.alignment', side_effect=AssertionError('must not load raw study')):
            context = catalog.routing_context(text, self.root, limit=1)
        first = context['units'][0]
        self.assertIn(first['candidates'][0]['execution_state'], ('direct', 'source-adaptation'))
        for unit in context['units']:
            self.assertEqual(text[unit['span']['start']:unit['span']['end']], unit['quote'])
            self.assertTrue(all(r['execution_state'] not in ('missing', 'reference-only') for r in unit['candidates']))
        self.assertFalse(context['raw_reference_media_required'])
        self.assertEqual(context['decision'], 'candidate-retrieval-only')

    def test_limit_does_not_hide_full_catalog_or_create_fallback_match(self):
        self.basic()
        full = catalog.search('对比以前和现在的结果', self.root)
        bounded = catalog.search('对比以前和现在的结果', self.root, limit=1)
        self.assertEqual(full['match_count'], len(full['candidates']))
        self.assertTrue(bounded['truncated'])
        self.assertEqual(full['match_count'], bounded['match_count'])
        self.assertEqual(catalog.search('qzxqzxunmatched', self.root)['candidates'], [])

    def test_readiness_needs_production_assets_but_not_original_videos(self):
        self.basic()
        for name in catalog.PRODUCTION_FILES:
            if not (self.root / name).exists():
                self.write(name, 'installed required asset')
        self.write('assets/fredtalk-library/catalog.json', {'schema_version': 1, 'items': []})
        self.write('assets/agent-editorial/source-designs.json', {'schema': 'ui-motion-fusion/source-designs@1', 'designs': []})
        ready = catalog.readiness(self.root)
        self.assertTrue(ready['ready'], ready)
        self.assertFalse(ready['historical_reference_media_required'])
        (self.root / 'assets/base-skill/assets/portable-studio/fonts/NotoSansSC.ttf').unlink()
        self.assertFalse(catalog.readiness(self.root)['ready'])

    def test_duplicate_canonical_identity_is_an_error_not_silent_loss(self):
        self.basic()
        data = catalog._read(self.root, catalog.selection.CAPABILITY_FILE)
        data['capabilities'].append(data['capabilities'][0])
        self.write(catalog.selection.CAPABILITY_FILE, data)
        with self.assertRaisesRegex(ValueError, 'Duplicate'):
            catalog.records(self.root)


if __name__ == '__main__':
    unittest.main()
