import copy
import hashlib
import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import ui_adaptation as ui


class UIAdaptationEvidenceTests(unittest.TestCase):
    def row(self, ident='component:focus', kind='component', style='host-style'):
        return {'id': ident, 'original_id': ident.split(':', 1)[1], 'kind': kind,
                'style_scope': style, 'source_files': []}

    def test_host_actions_remain_classified_after_repeated_queries(self):
        with tempfile.TemporaryDirectory() as folder:
            rows = [self.row()]
            ui.apply(rows, folder)
            first = copy.deepcopy(rows)
            ui.apply(rows, folder)
            self.assertEqual(rows, first)
            self.assertEqual(rows[0]['ui_adaptation']['status'], 'current-host-action')

    def test_unreported_material_is_pending_not_assumed_adapted(self):
        with tempfile.TemporaryDirectory() as folder:
            result = ui.report([self.row('reference:untested', 'reference', 'old-style')], folder)
            self.assertFalse(result['all_entries_classified'])
            self.assertEqual(result['pending'][0]['status'], 'not-covered')

    def test_changed_adapter_invalidates_connection_record(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            file = root / 'role.js'
            file.write_bytes(b'current material')
            report = root / ui.REPORTS[0]
            report.parent.mkdir(parents=True)
            report.write_text(json.dumps({'items': [{'id': 'reference:one', 'status': 'current-ui-connected',
                'adapter_files': ['role.js'], 'adapter_sha256': {'role.js': hashlib.sha256(file.read_bytes()).hexdigest()}}]}), encoding='utf-8')
            row = self.row('reference:one', 'reference', 'legacy')
            first = ui.apply([copy.deepcopy(row)], root)[0]
            self.assertEqual(first['ui_adaptation']['status'], 'current-ui-connected')
            self.assertIn('role.js', [f['path'] for f in first['source_files']])
            file.write_bytes(b'changed material')
            second = ui.apply([copy.deepcopy(row)], root)[0]
            self.assertEqual(second['ui_adaptation']['status'], 'adapter-missing-or-changed')
            self.assertEqual(second['ui_adaptation']['aesthetic_approval'], 'not-inferred')

    def test_shared_adapter_hashes_do_not_turn_connection_into_visual_approval(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            source = root / 'shared.js'
            source.write_bytes(b'shared runtime')
            report = root / ui.REPORTS[-1]
            report.parent.mkdir(parents=True)
            report.write_text(json.dumps({'adapter_files': ['shared.js'],
                'adapter_sha256': {'shared.js': hashlib.sha256(source.read_bytes()).hexdigest()},
                'items': [{'id': 'reference:one', 'status': 'role-adapted-needs-visual-review'}]}), encoding='utf-8')
            row = self.row('reference:one', 'reference', 'legacy')
            first = ui.report([copy.deepcopy(row)], root)
            self.assertTrue(first['all_entries_classified'])
            self.assertFalse(first['all_entries_aesthetically_approved'])
            self.assertEqual(first['built_entries_requiring_visual_review'], 1)
            source.write_bytes(b'changed runtime')
            second = ui.report([copy.deepcopy(row)], root)
            self.assertFalse(second['all_entries_classified'])


if __name__ == '__main__':
    unittest.main()
