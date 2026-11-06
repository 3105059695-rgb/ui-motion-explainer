import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import repository_reading as reading
import director


class CompleteReadingTests(unittest.TestCase):
    def test_source_paging_preserves_chinese_crlf_bom_and_tail(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            original = '\ufeff' + '真实源码\r\n' * 2000 + '\n尾部内容不可漏掉'
            (root / 'example.js').write_bytes(original.encode('utf-8'))
            result = reading.source('example.js', root)
            self.assertGreater(len(result['parts']), 1)
            self.assertEqual(''.join(result['parts']), original)
            self.assertEqual(result['reading_status'], 'not-assessed')
            for invalid in ('../secret.txt', 'C:/secret.txt', '/secret.txt'):
                with self.assertRaises(ValueError):
                    reading.source(invalid, root)

    def test_all_catalog_entries_survive_pagination_including_archived(self):
        rows = [{'id': f'fixture:{i}', 'title': f'完整效果{i}', 'kind': 'fixture',
                 'execution_state': 'direct', 'archived': i % 2 == 0,
                 'semantic_use': '首状态 → 中间变化 → 可读的最终状态' * 20,
                 'relations': ['focus'], 'style_scope': 'host-style'} for i in range(81)]
        with patch.object(reading.capability_catalog, 'records', return_value=rows):
            result = reading.catalog()
        whole = ''.join(result['parts'])
        self.assertEqual(result['entry_count'], len(rows))
        self.assertEqual(result['ids'], [r['id'] for r in rows])
        for row in rows:
            self.assertIn('[' + row['id'] + ']', whole)
            self.assertIn(row['semantic_use'], whole)
        self.assertIn('完整效果80', whole)

    def test_production_includes_every_current_requirement_not_two_core_files(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            (root / 'references').mkdir()
            docs = [{'id': 'entry', 'title': '入口', 'path': 'SKILL.md'},
                    {'id': 'aigc', 'title': 'AIGC全文', 'path': 'references/aigc.md'},
                    {'id': 'motion', 'title': '全库选择', 'path': 'references/motion.md'}]
            for doc in docs:
                (root / doc['path']).write_text(doc['title'] + '\n完整末段', encoding='utf-8')
            (root / 'references/requirements.json').write_text(json.dumps({'schema_version': 1, 'documents': docs}), encoding='utf-8')
            context = director.production_requirements_context(root)
            self.assertEqual([d['id'] for d in context['documents']], [d['id'] for d in docs])
            self.assertTrue(all('完整末段' in d['text'] for d in context['documents']))
            self.assertEqual(context['on_demand'], [])
            self.assertEqual(context['assessment']['reading'], 'not-assessed')


if __name__ == '__main__':
    unittest.main()
