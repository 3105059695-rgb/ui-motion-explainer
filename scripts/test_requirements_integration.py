"""Current requirements reach preparation/creation without becoming approval."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

import director
import production_entry
import requirements
import style_registry


class RequirementsIntegrationTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.base = Path(temporary.name)
        self.root = self.base / 'skill'
        (self.root / 'references').mkdir(parents=True)
        self.source = self.base / '口播.txt'
        self.source.write_text('看清原材料，再看实际变化与结果。', encoding='utf-8')
        self.project = self.base / 'project'

    def write_bundle(self):
        first = self.root / 'references/workflow.md'
        first.write_bytes(b'\xef\xbb\xbf' + ('完整要求。\r\n' * 800 + '第一页之后也必须保留。').encode('utf-8'))
        last = self.root / 'references/semantic-directing.md'
        last.write_text('最后一项要求必须带入上下文，不得只带前几项。', encoding='utf-8')
        manifest = {'schema_version': 1, 'documents': [
            {'id': 'workflow', 'title': '完整工作流', 'path': 'references/workflow.md'},
            {'id': 'last', 'title': '最后一项', 'path': 'references/semantic-directing.md'}]}
        (self.root / requirements.MANIFEST).write_text(json.dumps(manifest, ensure_ascii=False), encoding='utf-8')
        (self.root / director.RECIPE_FILE).write_text('{"recipes":[]}', encoding='utf-8')
        return first, last

    def test_prepare_carries_every_full_document_and_all_reading_commands(self):
        self.write_bundle()
        expected = requirements.load(self.root)
        report = director.prepare(self.source, self.project, root=self.root)
        context = director.load_json(self.project / 'director-context.json')
        actual = context['requirements']
        self.assertEqual(actual['documents'], expected['documents'])
        self.assertEqual(context['required_reading'], [
            {'path': document['path'], 'exists': True} for document in expected['documents']])
        self.assertEqual(actual['bundle_sha256'], expected['bundle_sha256'])
        self.assertEqual(actual['part_count'], expected['part_count'])
        self.assertGreater(actual['part_count'], 1)
        self.assertNotIn('parts', actual)  # The document bodies already contain all text.
        self.assertEqual(actual['status'], 'content-available-not-proof-of-reading')
        self.assertEqual(actual['assessment'], {
            'reading': 'not-assessed', 'understanding': 'not-assessed',
            'implementation': 'not-assessed', 'visual_approval': 'not-assessed'})
        self.assertEqual(context['source']['text'], self.source.read_text(encoding='utf-8'))
        self.assertFalse(report['plan_authored'])
        self.assertFalse(report['generation_submitted'])
        self.assertEqual(report['requirements']['status'], actual['status'])
        self.assertNotIn('text', report['requirements']['documents'][0])
        brief = (self.project / 'director-brief.md').read_text(encoding='utf-8')
        self.assertTrue(brief.startswith(director.MARKER))
        for command in actual['reading']['part_commands']:
            self.assertIn(command, brief)
            self.assertLess(brief.index(command), brief.index('# 本期剪辑入口'))
        self.assertIn('不要截断输出或只看前几项', brief)
        self.assertIn('## 现行要求与实际参考位置（全文已列在开头）', brief)
        self.assertNotIn('## 本期基础必读', brief)

    def test_prepare_missing_manifest_fails_without_creating_a_partial_context(self):
        with self.assertRaisesRegex(ValueError, 'Requirement manifest.*missing'):
            director.prepare(self.source, self.project, root=self.root)
        self.assertFalse(self.project.exists())

    def test_prepare_missing_last_document_fails_before_any_output(self):
        _, last = self.write_bundle()
        last.unlink()
        with self.assertRaisesRegex(ValueError, 'Requirement document.*missing'):
            director.prepare(self.source, self.project, root=self.root)
        self.assertFalse(self.project.exists())

    def test_creation_records_latest_manifest_and_hash_without_claiming_reading(self):
        first, _ = self.write_bundle()
        old_bundle = requirements.load(self.root)
        first.write_bytes(first.read_bytes() + '\n当前新增要求。'.encode('utf-8'))
        current = requirements.load(self.root)
        self.project.mkdir()
        config = {'runtime': 'fusion-production-v1', 'preserved': 'existing backend field'}
        (self.project / 'project.json').write_text(json.dumps(config), encoding='utf-8')
        old_plan = '{"schema_version":1,"authored":"do not upgrade this plan"}'
        (self.project / 'director-plan.json').write_text(old_plan, encoding='utf-8')
        resolution = {'resolved_profile': 'user-ui'}
        report = production_entry.attach_creation_context(self.project, resolution, root=self.root)
        context = director.load_json(self.project / 'project-style-context.json')
        metadata = context['requirements']
        self.assertNotEqual(metadata['bundle_sha256'], old_bundle['bundle_sha256'])
        self.assertEqual(metadata['bundle_sha256'], current['bundle_sha256'])
        self.assertEqual(metadata['manifest_sha256'], current['manifest_sha256'])
        self.assertEqual(len(metadata['documents']), current['document_count'])
        for actual, expected in zip(metadata['documents'], current['documents']):
            self.assertEqual(actual, {key: value for key, value in expected.items() if key != 'text'})
        self.assertEqual(len(metadata['reading']['part_commands']), current['part_count'])
        self.assertEqual(metadata['status'], 'content-available-not-proof-of-reading')
        self.assertEqual(metadata['assessment']['reading'], 'not-assessed')
        self.assertEqual(report['requirements'], metadata)
        self.assertFalse(report['director_context_prepared'])
        saved = director.load_json(self.project / 'project.json')
        self.assertEqual(saved['preserved'], config['preserved'])
        self.assertEqual(saved['production_status'], 'unmade-awaiting-authored-timeline')
        self.assertFalse(saved['current_style_applied'])
        self.assertFalse(saved['aestheticApproval'])
        self.assertEqual((self.project / 'director-plan.json').read_text(encoding='utf-8'), old_plan)

    def test_creation_missing_document_does_not_write_context_or_relabel_project(self):
        _, last = self.write_bundle()
        last.unlink()
        self.project.mkdir()
        config = self.project / 'project.json'
        config.write_text('{"keep":"original"}', encoding='utf-8')
        before = config.read_bytes()
        with self.assertRaisesRegex(ValueError, 'Requirement document.*missing'):
            production_entry.attach_creation_context(self.project, {'resolved_profile': 'user-ui'}, root=self.root)
        self.assertEqual(config.read_bytes(), before)
        self.assertFalse((self.project / 'project-style-context.json').exists())


class PackagedRequirementsIntegrationTests(unittest.TestCase):
    def test_full_requirements_preserve_style_library_and_selected_whole_film(self):
        expected = requirements.load(director.ROOT)
        library = director.selection.library_directory(root=director.ROOT)
        with tempfile.TemporaryDirectory() as temporary:
            folder = Path(temporary)
            source = folder / 'source.txt'
            source.write_text('打开完整材料，观察具体变化，再把结果交给下一步。', encoding='utf-8')
            project = folder / 'project'
            director.prepare(source, project, profile='fangmu', reference='arun-membership')
            context = director.load_json(project / 'director-context.json')
            resolution = style_registry.resolve(project, 'fangmu', root=director.ROOT)
        self.assertEqual(context['requirements']['documents'], expected['documents'])
        reading = context['required_reading']
        self.assertEqual(reading[:len(expected['documents'])], [
            {'path': document['path'], 'exists': True} for document in expected['documents']])
        self.assertTrue({item['path'] for item in resolution['required_reading']} <=
                        {item['path'] for item in reading})
        self.assertEqual(len({item['path'] for item in reading}), len(reading))
        for document in context['requirements']['documents']:
            content = Path(document['path']).read_bytes()
            self.assertEqual(document['text'], content.decode('utf-8'))
            self.assertEqual(document['sha256'], hashlib.sha256(content).hexdigest())
        self.assertEqual(context['style']['preferences'], director.preference_context(resolution))
        self.assertEqual(context['style']['binding'], style_registry.current_binding(resolution))
        self.assertEqual(context['selection']['library_directory']['entries'], library['entries'])
        self.assertFalse(context['selection']['library_directory']['truncated'])
        self.assertEqual(context['reference_film']['id'], 'arun-membership')
        self.assertEqual(context['reference_film']['row_count'], 105)
        self.assertEqual(context['reference_film']['shot_count'], 31)


if __name__ == '__main__':
    unittest.main()
