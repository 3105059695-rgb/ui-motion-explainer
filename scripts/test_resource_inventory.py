"""Resource wiring checks: file facts are not runtime or aesthetic approval."""
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from urllib.parse import urlsplit

import aigc_assets
import resource_inventory as ri
from resource_registry import ResourceRegistry
import source_study


class ResourceInventoryTests(unittest.TestCase):
    def setUp(self):
        temp = tempfile.TemporaryDirectory()
        self.addCleanup(temp.cleanup)
        self.root = Path(temp.name).resolve()

    def write(self, relative, value):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value) if isinstance(value, (dict, list)) else value, encoding='utf-8')
        return path

    def overlay(self, files=None, modules=None):
        self.write(ri.LOCAL_FILE, {'schema_version': 1, 'files': files or {}, 'modules': modules or {}})

    def registry(self):
        self.write('references/resource-registry.json', {'schemaVersion': 1, 'pathBase': 'skillRoot', 'modules': [
            {'id': 'reference', 'path': 'bundled', 'required': ['references/catalog.json']},
            {'id': 'director', 'path': 'director', 'required': ['guide.md']}]})
        self.write('bundled/references/catalog.json', {'entries': []})
        self.write('director/guide.md', 'bundled director')

    def test_existing_package_wins_and_directories_are_not_missing_files(self):
        self.write('packaged.txt', 'current')
        self.write('local.txt', 'old')
        self.overlay({'item': {'path': 'local.txt'}})
        fact = ri.resource_fact('item', 'packaged.txt', self.root)
        self.assertEqual(fact['selection_source'], 'packaged')
        self.assertEqual(Path(fact['path']).read_text(), 'current')
        directory = ri.resource_fact('directory', 'references', self.root)
        self.assertTrue(directory['exists'])
        self.assertTrue(directory['directory_exists'])
        self.assertEqual(directory['path_kind'], 'directory')
        self.assertFalse(directory['file_exists'])
        self.assertFalse(directory['usable_file'])

    def test_missing_mapping_stays_missing_without_fallback(self):
        self.overlay({'item': {'path': 'absent.mp4'}})
        fact = ri.resource_fact('item', 'local-only/video.mp4', self.root)
        self.assertEqual(fact['selection_source'], 'local-overlay')
        self.assertFalse(fact['exists'])
        self.assertFalse(fact['usable_file'])
        self.assertEqual(fact['path_kind'], 'missing')

    def test_hash_is_checked_only_when_requested_and_mismatch_is_unusable(self):
        path = self.write('original.mp4', 'test bytes, not a real media file')
        sha = hashlib.sha256(path.read_bytes()).hexdigest()
        self.overlay({'item': {'path': 'original.mp4', 'sha256': sha}})
        unchecked = ri.resource_fact('item', root=self.root)
        self.assertEqual(unchecked['hash_status'], 'not-verified')
        self.assertIsNone(unchecked['actual_sha256'])
        self.assertTrue(ri.resource_fact('item', root=self.root, verify_hash=True)['hash_matches'])
        path.write_text('changed bytes')
        changed = ri.resource_fact('item', root=self.root, verify_hash=True)
        self.assertEqual(changed['hash_status'], 'mismatch')
        self.assertFalse(changed['usable_file'])

    def test_overlay_rejects_engine_override_urls_and_malformed_values(self):
        invalid = [
            {'schema_version': True},
            {'schema_version': 1, 'modules': {'director': 'somewhere'}},
            {'schema_version': 1, 'files': {'item': {'path': 'https://example.test/x'}}},
            {'schema_version': 1, 'files': {'item': {'path': '.', 'sha256': '0' * 64}}},
            {'schema_version': 1, 'files': {'item': {'path': 'file', 'sha256': 'not-a-hash'}}}]
        for data in invalid:
            with self.subTest(data=data):
                self.write(ri.LOCAL_FILE, data)
                with self.assertRaises(ValueError):
                    ri.load_overlay(self.root)

    def test_reference_overlay_is_automatic_but_explicit_override_wins(self):
        self.registry()
        self.write('retained/references/catalog.json', {'entries': []})
        self.write('explicit/references/catalog.json', {'entries': []})
        self.overlay(modules={'reference': 'retained'})
        registry = ResourceRegistry(self.root)
        self.assertEqual(registry.resolve('reference'), self.root / 'retained')
        self.assertEqual(registry.inspect('reference')['selection_source'], 'local-overlay')
        self.assertEqual(registry.resolve('director'), self.root / 'director')
        explicit = ResourceRegistry(self.root, overrides={'reference': self.root / 'explicit'})
        self.assertEqual(explicit.resolve('reference'), self.root / 'explicit')
        self.assertEqual(explicit.inspect('reference')['selection_source'], 'explicit-override')

    def test_study_example_and_facts_receive_original_media_without_claiming_viewing(self):
        video = self.write('original.mp4', 'not a decoded video')
        sha = hashlib.sha256(video.read_bytes()).hexdigest()
        self.overlay({'source-video:test': {'path': 'original.mp4', 'sha256': sha}})
        self.write(source_study.SOURCE_REGISTRY_FILE, {'schema_version': 1, 'sources': [
            {'id': 'test', 'alignment': 'alignment.json', 'manifest': 'manifest.json'}]})
        self.write('manifest.json', {'videos': [{'id': 'test', 'source': 'local-only/old.mp4', 'source_sha256': sha}]})
        self.write('alignment.json', {'rows': [{'id': 'T1', 'text': 'test', 'shot_ids': ['S1']}], 'shots': [{'id': 'S1'}]})
        fact = source_study.source_facts(self.root, verify_hash=True)[0]['original_media']
        self.assertTrue(fact['hash_matches'])
        example = source_study.example('test', 'T1', self.root)
        self.assertTrue(example['original_media']['file_exists'])
        self.assertFalse(example['media_accessed'])

    def test_aigc_research_mapping_is_in_default_context(self):
        self.write('study.json', '{}')
        self.overlay({'aigc-research:notes': {'path': 'study.json'}})
        self.write(aigc_assets.CATALOG, {'schema_version': 1, 'style_sets': [], 'research_sources': [
            {'id': 'notes', 'path': 'local-only/notes.json'}]})
        result = aigc_assets.directing_context(self.root / 'project', root=self.root)
        self.assertEqual(result['research_sources_present'], 1)
        self.assertEqual(result['research_sources'][0]['resource']['selection_source'], 'local-overlay')

    def test_reference_source_entry_and_missing_media_have_independent_status(self):
        self.registry()
        self.write('retained/references/catalog.json', {'entries': [{'slug': 'one', 'source_page': 'https://example.test/one'}]})
        self.write('retained/references/rebuild-status.json', {'rendered': 99, 'entries': [
            {'slug': 'one', 'project': 'reconstructions/one', 'status': 'rendered'}]})
        self.write('retained/reconstructions/one/index.html', '<!doctype html>')
        self.overlay(modules={'reference': 'retained'})
        result = ri.inspect_reference('one', self.root)
        self.assertTrue(result['source_directory_exists'])
        self.assertTrue(result['entrypoint_present'])
        self.assertEqual(result['runtime_status'], 'not-verified')
        self.assertFalse(result['media']['local_video_absolute']['exists'])
        self.assertEqual(ri.reference_inventory(self.root)['runtime_verified'], 0)
        with self.assertRaises(ValueError):
            ri.inspect_reference('unknown', self.root)


class PublicCatalogTests(unittest.TestCase):
    def test_all_230_cases_retain_legitimate_source_urls_without_bundling_media(self):
        catalog = ri.read_json(ri.ROOT / 'assets/modules/reference/references/catalog.json')
        self.assertEqual(len(catalog['entries']), 230)
        for case in catalog['entries']:
            with self.subTest(slug=case['slug']):
                url = urlsplit(case['source_page'])
                self.assertIn(url.scheme, ('http', 'https'))
                self.assertTrue(url.netloc)
                self.assertNotIn('LOCAL_ASSET', case['source_page'])
                self.assertFalse(case.get('local_video_absolute'))

    def test_current_source_status_does_not_reuse_228_historical_claim(self):
        from collections import Counter
        catalog = ri.read_json(ri.ROOT / 'references/capability-catalog.json')
        counts = Counter(case['implementation']['status'] for case in catalog['reference_cases'])
        self.assertEqual(counts, {'starter-source-present': 2, 'optional-local-history': 226, 'catalog-only': 2})


if __name__ == '__main__':
    unittest.main()
