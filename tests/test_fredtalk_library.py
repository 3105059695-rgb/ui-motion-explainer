"""FredTalk catalog provenance, preview boundaries and safe byte-for-byte reuse."""
import copy
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import fredtalk_library as library


class FredTalkLibraryTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name)
        self.root = self.base / 'skill'
        self.project = self.base / 'project'
        self.code = b"import {color} from './palette';\nexport const Card = () => color;\n"
        entry = self.blob('projects/demo/src/Card.tsx', self.code)
        dependency = self.blob('projects/demo/src/palette.ts', b"export const color = '#00ccff';\n")
        self.item = {
            'id': 'fredtalk:demo-card', 'reference_id': 'demo-card', 'upstream_id': 'component:demo-card',
            'label': 'Card', 'title': 'Card reveal',
            'category': 'ui', 'archived': False, 'source_access': 'public',
            'semantic_use': 'Reveal a result', 'use_when': ['Show a result'],
            'state_chain': ['input', 'result'], 'reusability': {'status': 'keep'},
            'implementation': {'compositionId': 'Demo', 'fps': 30},
            'sources': [dict(entry, symbol='Card', available=True)], 'closure': [entry, dependency],
            'unresolved_imports': [], 'external_packages': ['react', 'remotion'],
            'required_media': ['portrait.png'],
        }
        self.catalog = {'schema_version': 1, 'upstream': {'repo': 'owner/repo', 'commit': 'abc'},
                        'items': [self.item]}
        self.save()
        for name in library.NOTICES:
            (self.root / library.LIBRARY / name).write_text('Fixture attribution\n', encoding='utf-8')

    def blob(self, upstream_path, data):
        blob = hashlib.sha1(b'blob ' + str(len(data)).encode('ascii') + b'\0' + data).hexdigest()
        path = library.LIBRARY + '/blobs/' + blob + Path(upstream_path).suffix
        local = self.root / path
        local.parent.mkdir(parents=True, exist_ok=True)
        local.write_bytes(data)
        return {'upstream_path': upstream_path, 'blob_path': path, 'git_blob': blob,
                'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

    def save(self):
        (self.root / library.CATALOG).write_text(json.dumps(self.catalog), encoding='utf-8')

    def test_records_are_selection_compatible_without_upstream_autoapproval(self):
        row, = library.records(self.root)
        self.assertEqual('fredtalk:demo-card', row['id'])
        self.assertEqual('software-preset', row['library_kind'])
        self.assertEqual('unreviewed', row['user_approval']['status'])
        self.assertEqual({'status': 'keep'}, row['upstream_reusability'])
        self.assertEqual(row['source'][0]['path'], row['implementation']['entrypoints'][0])
        self.assertFalse(row['implementation']['runtime_tested_this_run'])

    def test_archive_is_not_suggested_but_explicit_inspect_and_copy_work(self):
        self.item['archived'] = True
        self.save()
        self.assertEqual([], library.records(self.root))
        self.assertEqual(1, len(library.records(self.root, include_archived=True)))
        self.assertTrue(library.inspect(self.root, 'demo-card')['record']['archived'])
        self.assertTrue(library.materialize(self.root, 'demo-card', self.project)['receipt']['archived'])

    def test_members_are_preview_only_and_never_materialized(self):
        self.item['source_access'] = 'members'
        self.save()
        self.assertEqual([], library.records(self.root))
        row, = library.records(self.root, include_unavailable=True)
        self.assertEqual([], row['implementation']['entrypoints'])
        self.assertEqual('preview-only', row['status'])
        self.assertFalse(library.resolve_sources(self.root, 'demo-card')['available'])
        with self.assertRaisesRegex(ValueError, 'Members-only'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_missing_catalog_and_missing_source(self):
        self.assertEqual([], library.records(self.base / 'missing'))
        (self.root / self.item['closure'][1]['blob_path']).unlink()
        self.assertEqual([], library.records(self.root))
        self.assertEqual(1, len(library.records(self.root, include_unavailable=True)))
        with self.assertRaisesRegex(ValueError, 'missing'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_unbundled_archive_reports_unavailable_without_fetching(self):
        self.item['archived'] = True
        self.item['sources'][0]['blob_path'] = None
        self.item['closure'] = []
        self.save()
        result = library.inspect(self.root, 'demo-card')
        self.assertFalse(result['record']['source_available'])
        self.assertTrue(any('not bundled' in issue for issue in result['current_sources']['issues']))

    def test_unresolved_imports_are_editable_candidates_not_runtime_ready(self):
        self.item['unresolved_imports'] = [{'source': 'Card.tsx', 'import': './missing-piece'}]
        self.save()
        self.assertEqual(1, len(library.records(self.root)))
        receipt = library.materialize(self.root, 'demo-card', self.project)['receipt']
        self.assertEqual(self.item['unresolved_imports'], receipt['unresolved_imports'])
        self.assertEqual('not-tested', receipt['runtime_status'])
        self.assertFalse(receipt['rendered'])

    def test_hash_mismatch_refuses_all_writes(self):
        (self.root / self.item['closure'][1]['blob_path']).write_bytes(b'changed')
        current = library.inspect(self.root, 'demo-card')
        self.assertFalse(current['record']['source_available'])
        with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_git_blob_mismatch_refuses_copy(self):
        self.item['closure'][1]['git_blob'] = '0' * 40
        self.save()
        with self.assertRaisesRegex(ValueError, 'Git blob hash mismatch'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_traversal_and_absolute_paths_refused_before_writes(self):
        original = copy.deepcopy(self.item['closure'][1])
        for path in ('../outside.ts', '/outside.ts', 'C:/outside.ts', 'src/../../outside.ts',
                     'src\\outside.ts', 'src/CON', 'src/file:stream'):
            with self.subTest(path=path):
                self.item['closure'][1] = dict(original, upstream_path=path)
                self.save()
                with self.assertRaises(ValueError):
                    library.materialize(self.root, 'demo-card', self.project)
                self.assertFalse(self.project.exists())

    def test_blob_path_cannot_point_outside_blob_store(self):
        self.item['closure'][1]['blob_path'] = 'scripts/elsewhere.ts'
        self.save()
        with self.assertRaisesRegex(ValueError, 'inside'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_entrypoint_must_match_closure(self):
        self.item['sources'][0]['upstream_path'] = 'projects/demo/src/other.tsx'
        self.save()
        with self.assertRaisesRegex(ValueError, 'does not match its closure'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_copy_preserves_source_import_layout_and_receipt_is_honest(self):
        result = library.materialize(self.root, 'fredtalk:demo-card', self.project)
        destination = Path(result['destination'])
        self.assertEqual(self.code, (destination / 'upstream/projects/demo/src/Card.tsx').read_bytes())
        self.assertTrue((destination / 'upstream/projects/demo/src/palette.ts').is_file())
        self.assertTrue((destination / 'LICENSE').is_file())
        receipt = json.loads(Path(result['receipt_path']).read_text(encoding='utf-8'))
        self.assertEqual('unreviewed', receipt['approval_state'])
        self.assertEqual(['react', 'remotion'], receipt['external_packages'])
        self.assertEqual(['portrait.png'], receipt['required_media'])
        self.assertFalse(receipt['rendered'])
        self.assertEqual([], library.materialize(self.root, 'demo-card', self.project)['copied_files'])

    def test_existing_difference_is_not_overwritten_or_partially_copied(self):
        target = self.project / 'vendor/fredtalk/demo-card/upstream/projects/demo/src/palette.ts'
        target.parent.mkdir(parents=True)
        target.write_bytes(b'user code')
        with self.assertRaisesRegex(ValueError, 'Refusing to overwrite'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertEqual(b'user code', target.read_bytes())
        self.assertEqual([target], [p for p in self.project.rglob('*') if p.is_file()])

    def test_missing_notice_fails_before_any_copy(self):
        (self.root / library.LIBRARY / 'LICENSE').unlink()
        with self.assertRaisesRegex(ValueError, 'attribution'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertFalse(self.project.exists())

    def test_destination_reparse_directory_is_refused(self):
        outside = self.base / 'outside'
        outside.mkdir()
        self.project.mkdir()
        try:
            (self.project / 'vendor').symlink_to(outside, target_is_directory=True)
        except OSError as error:
            if os.name != 'nt':
                self.skipTest('OS does not permit directory symlinks: ' + str(error))
            # Windows junctions exercise the same reparse guard without symlink privileges.
            quote = lambda value: "'" + str(value).replace("'", "''") + "'"
            script = ('New-Item -ItemType Junction -Path ' + quote(self.project / 'vendor') +
                      ' -Target ' + quote(outside) + ' -ErrorAction Stop | Out-Null')
            made = subprocess.run(['powershell', '-NoProfile', '-NonInteractive', '-Command', script],
                                  capture_output=True)
            if made.returncode:
                self.skipTest('OS cannot create a test reparse directory.')
            self.addCleanup((self.project / 'vendor').rmdir)
        with self.assertRaisesRegex(ValueError, 'reparse'):
            library.materialize(self.root, 'demo-card', self.project)
        self.assertEqual([], list(outside.iterdir()))

    def test_cli_search_and_inspect(self):
        command = [sys.executable, '-B', '-X', 'utf8', str(ROOT / 'scripts/fredtalk_library.py')]
        search = subprocess.run(command + ['search', 'Reveal', '--root', str(self.root)],
                                capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(0, search.returncode, search.stderr)
        self.assertEqual('fredtalk:demo-card', json.loads(search.stdout)[0]['id'])
        inspected = subprocess.run(command + ['inspect', '--id', 'demo-card', '--root', str(self.root)],
                                   capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(0, inspected.returncode, inspected.stderr)
        self.assertTrue(json.loads(inspected.stdout)['current_sources']['available'])


if __name__ == '__main__':
    unittest.main()
