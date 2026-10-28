"""Current requirements are complete content, never proof of Agent reading."""
import contextlib
import hashlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import requirements
import ui


class RequirementTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        (self.root / 'references').mkdir()
        self.rows = [
            {'id': 'entry', 'title': '正式入口', 'path': 'SKILL.md'},
            {'id': 'style', 'title': '现行风格', 'path': 'references/style.md'},
            {'id': 'delivery', 'title': '交付要求', 'path': 'references/delivery.md'},
        ]
        self.contents = ['\ufeff入口\r\n' + '全文不截断😀\r\n' * 440,
                         '# 风格\n' + '一二三四五\n' * 1100,
                         '最后的要求\r\n\nEND-OF-BODY\n']
        for row, text in zip(self.rows, self.contents):
            (self.root / row['path']).write_bytes(text.encode('utf-8'))
        self.write_manifest()

    def write_manifest(self, rows=None):
        data = {'schema_version': 1, 'documents': self.rows if rows is None else rows}
        (self.root / requirements.MANIFEST).write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding='utf-8')

    def run_cli(self, argv):
        stdout = io.StringIO()
        with patch.object(ui, 'ROOT', self.root), contextlib.redirect_stdout(stdout):
            result = ui.main(['requirements', *argv])
        return result, stdout.getvalue()

    def test_all_text_and_page_segments_reassemble_in_original_order(self):
        bundle = requirements.load(self.root)
        self.assertEqual(requirements.STATUS, bundle['status'])
        self.assertEqual(3, bundle['document_count'])
        self.assertEqual(self.contents, [row['text'] for row in bundle['documents']])
        rebuilt = {row['id']: '' for row in self.rows}
        ordered = []
        for number, part in enumerate(bundle['parts'], 1):
            self.assertEqual(number, part['number'])
            self.assertIn(f'{number}/{bundle["part_count"]}', part['text'])
            size = 0
            for segment in part['segments']:
                document_id = segment['document_id']
                self.assertEqual(len(rebuilt[document_id]), segment['start'])
                self.assertEqual(segment['end'] - segment['start'], len(segment['text']))
                rebuilt[document_id] += segment['text']
                ordered.append(segment['text'])
                size += len(segment['text'])
                marker = f"字符 [{segment['start']}, {segment['end']}) ---\n"
                self.assertIn(marker + segment['text'] + '\n--- 原文结束 ---', part['text'])
            self.assertLessEqual(size, requirements.PAGE_CHARACTERS)
            if number < bundle['part_count']:
                self.assertEqual(requirements.PAGE_CHARACTERS, size)
                self.assertIn(f'requirements --part {number + 1}', part['text'])
        self.assertEqual(self.contents, list(rebuilt.values()))
        self.assertEqual(''.join(self.contents), ''.join(ordered))
        self.assertEqual(bundle, requirements.load(self.root))

    def test_hashes_describe_bytes_and_change_with_content(self):
        before = requirements.load(self.root)
        expected = hashlib.sha256(self.contents[0].encode('utf-8')).hexdigest()
        self.assertEqual(expected, before['documents'][0]['sha256'])
        with (self.root / self.rows[1]['path']).open('ab') as stream:
            stream.write('新增要求\r\n'.encode('utf-8'))
        after = requirements.load(self.root)
        self.assertNotEqual(before['bundle_sha256'], after['bundle_sha256'])
        self.assertNotEqual(before['documents'][1]['sha256'], after['documents'][1]['sha256'])
        self.assertEqual(before['manifest_sha256'], after['manifest_sha256'])
        self.rows.reverse()
        self.write_manifest()
        reordered = requirements.load(self.root)
        self.assertNotEqual(after['bundle_sha256'], reordered['bundle_sha256'])
        self.assertNotEqual(after['manifest_sha256'], reordered['manifest_sha256'])

    def test_same_bundle_at_another_root_has_same_hash(self):
        before = requirements.load(self.root)
        with tempfile.TemporaryDirectory() as other:
            other = Path(other)
            (other / 'references').mkdir()
            for relative in [requirements.MANIFEST, *[row['path'] for row in self.rows]]:
                (other / relative).write_bytes((self.root / relative).read_bytes())
            after = requirements.load(other)
        self.assertEqual(before['bundle_sha256'], after['bundle_sha256'])
        self.assertNotEqual(before['manifest_path'], after['manifest_path'])

    def test_missing_manifest_and_registered_document_fail_explicitly(self):
        manifest = self.root / requirements.MANIFEST
        manifest.unlink()
        with self.assertRaisesRegex(ValueError, 'manifest.*missing'):
            requirements.load(self.root)
        self.write_manifest()
        (self.root / self.rows[1]['path']).unlink()
        with self.assertRaisesRegex(ValueError, 'document 2.*missing'):
            requirements.load(self.root)

    def test_empty_or_invalid_utf8_documents_fail(self):
        path = self.root / self.rows[0]['path']
        for content in (b'', b' \r\n\t', '\ufeff\r\n '.encode('utf-8')):
            with self.subTest(content=content):
                path.write_bytes(content)
                with self.assertRaisesRegex(ValueError, 'empty'):
                    requirements.load(self.root)
        path.write_bytes(b'\xff\xfe\x00')
        with self.assertRaisesRegex(ValueError, 'not UTF-8'):
            requirements.load(self.root)

    def test_duplicate_ids_and_paths_fail(self):
        for duplicate, message in (({**self.rows[1], 'id': 'entry'}, 'Duplicate.*ID'),
                                   ({**self.rows[1], 'path': 'SKILL.md'}, 'Duplicate.*path'),
                                   ({**self.rows[1], 'path': 'skill.MD'}, 'Duplicate.*path')):
            with self.subTest(duplicate=duplicate):
                self.write_manifest([self.rows[0], duplicate])
                with self.assertRaisesRegex(ValueError, message):
                    requirements.load(self.root)

    def test_absolute_traversal_and_drive_paths_fail(self):
        for path in ('../outside.md', 'references/../../outside.md', '/outside.md',
                     'C:/outside.md', 'C:outside.md', '\\\\server\\share\\outside.md',
                     'references\\..\\outside.md', 'SKILL.md:stream', ''):
            with self.subTest(path=path):
                self.write_manifest([{**self.rows[0], 'path': path}])
                with self.assertRaises(ValueError):
                    requirements.load(self.root)

    def test_symlink_outside_root_fails(self):
        with tempfile.TemporaryDirectory() as outside:
            target = Path(outside) / 'outside.md'
            target.write_text('outside', encoding='utf-8')
            link = self.root / 'escape.md'
            try:
                link.symlink_to(target)
            except (OSError, NotImplementedError):
                self.skipTest('Creating symlinks is unavailable on this host.')
            self.write_manifest([{**self.rows[0], 'path': 'escape.md'}])
            with self.assertRaisesRegex(ValueError, 'outside the Skill'):
                requirements.load(self.root)

    def test_unregistered_historical_documents_are_not_scanned(self):
        before = requirements.load(self.root)
        history = self.root / 'history'
        history.mkdir()
        (history / 'stale.md').write_bytes(b'\xff\x00historical')
        self.assertEqual(before, requirements.load(self.root))

    def test_invalid_manifest_schemas_fail(self):
        for data in ({'schema_version': True, 'documents': self.rows},
                     {'schema_version': 2, 'documents': self.rows},
                     {'schema_version': 1, 'documents': []},
                     {'schema_version': 1, 'documents': [None]},
                     {'schema_version': 1, 'documents': [{**self.rows[0], 'title': ''}]}, []):
            with self.subTest(data=data):
                (self.root / requirements.MANIFEST).write_text(json.dumps(data), encoding='utf-8')
                with self.assertRaises(ValueError):
                    requirements.load(self.root)

    def test_cli_default_lists_every_document_without_body(self):
        result, output = self.run_cli([])
        self.assertEqual(0, result)
        for row in self.rows:
            self.assertIn(row['title'], output)
            self.assertIn(row['path'], output)
        self.assertIn('requirements --part 1', output)
        self.assertIn('页正文', output)
        self.assertNotIn('END-OF-BODY', output)
        self.assertIn(requirements.STATUS, output)

    def test_cli_prints_complete_readable_pages_and_honest_last_page(self):
        bundle = requirements.load(self.root)
        for number in range(1, bundle['part_count'] + 1):
            result, output = self.run_cli(['--part', str(number)])
            self.assertEqual(0, result)
            self.assertEqual(requirements.render_part(bundle, number), output)
            self.assertNotIn('\\u5168', output)
        self.assertIn('END-OF-BODY\n', output)
        self.assertIn('全部正文已输出', output)
        self.assertIn('单独输出本页不代表前页已经输出', output)
        self.assertIn('不证明 Agent 已读懂要求', output)
        self.assertNotIn('aesthetic_approval', output)
        self.assertNotIn('reading_complete', output)
        self.assertNotIn('下一页', output)

    def test_cli_json_contains_metadata_and_no_text(self):
        result, output = self.run_cli(['--json'])
        self.assertEqual(0, result)
        data = json.loads(output)
        self.assertEqual(requirements.STATUS, data['status'])
        self.assertEqual(3, data['document_count'])
        self.assertNotIn('END-OF-BODY', output)
        self.assertNotIn('"text"', output)
        self.assertTrue(data['documents'][0]['sha256'])
        self.assertTrue(data['parts'][0]['segments'])

    def test_real_cli_stream_preserves_original_newlines_without_escaping(self):
        launcher = ('import sys; from pathlib import Path; sys.path.insert(0, sys.argv[1]); '
                    'import ui; ui.ROOT = Path(sys.argv[2]); '
                    'raise SystemExit(ui.main(["requirements", "--part", "1"]))')
        result = subprocess.run([sys.executable, '-B', '-X', 'utf8', '-c', launcher,
                                 str(Path(ui.__file__).parent), str(self.root)],
                                check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        expected = requirements.render_part(requirements.load(self.root), 1).encode('utf-8')
        self.assertEqual(expected, result.stdout)
        self.assertNotIn(b'\r\r\n', result.stdout)

    def test_invalid_part_number_and_conflicting_cli_flags_fail(self):
        bundle = requirements.load(self.root)
        for number in (0, -1, bundle['part_count'] + 1, True, '1'):
            with self.subTest(number=number), self.assertRaises(ValueError):
                requirements.render_part(bundle, number)
        for argv in (['--part', '0'], ['--part', '9999'], ['--part', '1', '--json']):
            with self.subTest(argv=argv), contextlib.redirect_stderr(io.StringIO()):
                with self.assertRaises(SystemExit) as error:
                    self.run_cli(argv)
                self.assertEqual(2, error.exception.code)


if __name__ == '__main__':
    unittest.main()
