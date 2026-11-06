"""Portable references retain real media after moving and never export author overlays."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import reference_bundle as bundle


class ReferenceBundleTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.base = Path(self.temporary.name)

    def write(self, path, content):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return path

    def json(self, path, value):
        return self.write(path, json.dumps(value).encode('utf-8'))

    def pack(self, root, records):
        files = {}
        for ident, content in records.items():
            sha = hashlib.sha256(content).hexdigest()
            name = bundle.PRIVATE_PREFIX + sha + '.bin'
            self.write(root / name, content)
            files[ident] = {'path': name, 'sha256': sha, 'size': len(content)}
        self.json(root / bundle.PACK_MANIFEST, {'schema_version': 1, 'files': files})
        return files

    def test_install_works_after_move_and_preserves_existing_resources_and_overlay(self):
        source, target = self.base / 'download', self.base / 'installed'
        incoming = self.pack(source, {'reference-atlas:a:overview': b'frame', 'source-video:a': b'video'})
        old = self.pack(target, {'reference-atlas:older:overview': b'old'})
        overlay = self.write(target / 'references/resources.local.json', b'private-user-overlay')
        result = bundle.install_pack(source, target)
        self.assertEqual(result['resource_count'], 3)
        self.assertEqual(result['copied_files'], 2)
        self.assertEqual(overlay.read_bytes(), b'private-user-overlay')
        moved = self.base / 'other-computer'
        target.rename(moved)
        installed = bundle.load_pack(moved, verify_hash=True)
        self.assertEqual(installed['files'], {**old, **incoming})
        self.assertEqual(installed['bytes'], 13)
        self.assertNotIn(str(self.base), (moved / bundle.PACK_MANIFEST).read_text())
        self.assertEqual(bundle.install_pack(source, moved)['copied_files'], 0)

    def test_update_keeps_old_content_and_unrelated_ids(self):
        target, source = self.base / 'target', self.base / 'source'
        old = self.pack(target, {'source-video:a': b'previous', 'source-video:b': b'keep'})
        fresh = self.pack(source, {'source-video:a': b'changed'})
        result = bundle.install_pack(source, target)
        self.assertEqual(result['preserved_existing_resource_ids'], ['source-video:b'])
        self.assertTrue((target / old['source-video:a']['path']).is_file())
        self.assertEqual(bundle.load_pack(target)['files']['source-video:a'], fresh['source-video:a'])

    def test_tampering_fails_before_existing_manifest_changes(self):
        source, target = self.base / 'source', self.base / 'target'
        incoming = self.pack(source, {'source-video:a': b'correct'})
        self.pack(target, {'source-video:old': b'keep'})
        before = (target / bundle.PACK_MANIFEST).read_bytes()
        (source / incoming['source-video:a']['path']).write_bytes(b'corrupt')
        with self.assertRaisesRegex(ValueError, 'hash mismatch'):
            bundle.install_pack(source, target)
        self.assertEqual((target / bundle.PACK_MANIFEST).read_bytes(), before)
        self.assertFalse((target / incoming['source-video:a']['path']).exists())

    def test_atomic_manifest_failure_keeps_previous_mappings(self):
        source, target = self.base / 'source', self.base / 'target'
        self.pack(source, {'source-video:new': b'new'})
        self.pack(target, {'source-video:old': b'old'})
        before = (target / bundle.PACK_MANIFEST).read_bytes()
        with patch.object(bundle.os, 'replace', side_effect=OSError('simulated storage error')):
            with self.assertRaisesRegex(OSError, 'storage error'):
                bundle.install_pack(source, target)
        self.assertEqual((target / bundle.PACK_MANIFEST).read_bytes(), before)
        self.assertFalse(list((target / 'references').glob('*.incoming-*')))

    def test_escaping_manifest_paths_and_unrelated_resource_types_are_rejected(self):
        root = self.base / 'malformed'
        sha = 'a' * 64
        for name in ('/tmp/private', 'C:/private/file', bundle.PRIVATE_PREFIX + '../file',
                     bundle.PRIVATE_PREFIX + 'name-not-hash.jpg'):
            self.json(root / bundle.PACK_MANIFEST, {'schema_version': 1,
                'files': {'source-video:a': {'path': name, 'sha256': sha, 'size': 0}}})
            with self.assertRaises(ValueError):
                bundle.load_pack(root)
        self.pack(root, {'voice:private': b'voice'})
        with self.assertRaisesRegex(ValueError, 'Invalid portable reference record'):
            bundle.load_pack(root)

    def test_export_is_private_relative_deduplicated_and_excludes_unrelated_files(self):
        root = self.base / 'skill'
        private = self.base / 'author-machine'
        video = self.write(private / 'original.mp4', b'original-video')
        sheet = self.write(private / 'sheet.jpg', b'the-same-contact-sheet')
        hero = self.write(private / 'hero.png', b'hero')
        secret = self.write(private / 'voice.bin', b'secret-voice-do-not-export')
        self.write(root / 'assets/public.mp4', b'public-video')
        self.write(root / 'install.py', b'# public installer fixture')
        catalog = {'videos': [
            {'id': 'a', 'source_resource_id': 'source-video:a',
             'overview': {'resource_id': 'reference-atlas:a:overview'},
             'pages': [{'resource_id': 'reference-atlas:a:detail'}]},
            {'id': 'public', 'source_resource_id': 'aigc-video:public', 'source_path': 'assets/public.mp4',
             'overview': {}, 'pages': []}]}
        self.json(root / 'references/reference-atlas.json', catalog)
        self.json(root / 'references/resources.local.json', {'schema_version': 1, 'modules': {},
            'files': {'source-video:a': {'path': str(video)},
                      'reference-atlas:a:overview': {'path': str(sheet)},
                      'reference-atlas:a:detail': {'path': str(sheet)},
                      'source-design-media:hero': {'path': str(hero)},
                      'voice:private': {'path': str(secret)}}})
        names = ['assets/public.mp4', 'install.py', 'references/reference-atlas.json']
        self.json(root / 'release-manifest.json', {'schema_version': 1, 'name': 'ui-motion-fusion',
            'version': 'test-version', 'files': [{'path': n, 'size': (root / n).stat().st_size,
                                                'sha256': bundle.digest(root / n)} for n in names]})
        archive = self.base / 'private.zip'
        result = bundle.export_bundle(root, archive, verify=False)
        self.assertTrue(result['private'])
        self.assertEqual(result['resource_count'], 4)
        self.assertEqual(result['unique_files'], 3)
        with zipfile.ZipFile(archive) as zipped:
            self.assertIsNone(zipped.testzip())
            entries = zipped.namelist()
            self.assertIn('ui-motion-fusion/install.py', entries)
            self.assertFalse(any('.local.json' in name for name in entries))
            manifest = zipped.read('ui-motion-fusion/' + bundle.PACK_MANIFEST)
            self.assertNotIn(str(private).encode(), manifest)
            self.assertNotIn(b'voice:private', manifest)
            extracted = self.base / 'another-machine'
            zipped.extractall(extracted)
        available = bundle.load_pack(extracted / 'ui-motion-fusion', verify_hash=True)
        self.assertEqual(available['unique_files'], 3)
        self.assertEqual(set(available['files']), {'source-video:a', 'reference-atlas:a:overview',
                                                  'reference-atlas:a:detail', 'source-design-media:hero'})
        with self.assertRaisesRegex(ValueError, 'already exists'):
            bundle.export_bundle(root, archive, verify=False)


if __name__ == '__main__':
    unittest.main()
