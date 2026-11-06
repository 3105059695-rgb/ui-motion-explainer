"""Completeness is independent from successful install and known unavailable history."""
import contextlib
import io
import json
from pathlib import Path
import tempfile
import unittest

import reference_readiness


class ReferenceReadinessTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)

    def write(self, path, value):
        out = self.root / path
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(json.dumps(value), encoding='utf-8')
        return out

    def fixture(self):
        self.write('public/image.jpg', 'image fixture; existence test only')
        self.write('public/video.mp4', 'video fixture; no decoding claimed')
        videos = []
        for ident, packaged in [('public', True), ('private', False)]:
            overview = {'resource_id': f'reference-atlas:{ident}:overview'}
            page = {'resource_id': f'reference-atlas:{ident}:detail-001'}
            row = {'id': ident, 'title': ident, 'overview': overview, 'pages': [page],
                   'source_resource_id': f'source-video:{ident}'}
            if packaged:
                overview['path'] = page['path'] = 'public/image.jpg'
                row['source_path'] = 'public/video.mp4'
            videos.append(row)
        for ident in ('m', 'n', 'o'):
            videos.append({'id': ident, 'overview': {}, 'pages': [], 'source_url': 'https://example.test/' + ident,
                           'scope': 'Historical reference unavailable at source'})
        self.write('references/reference-atlas.json', {'videos': videos})
        self.write('assets/agent-editorial/source/body.js', 'code fixture')
        self.write('assets/agent-editorial/source-designs.json', {'designs': [
            {'id': 'one', 'source_file': 'source/body.js', 'media_slots': [{'key': 'assets/hero.png'}],
             'logo_slots': [{'key': 'brand'}]},
            {'id': 'two', 'source_file': 'source/body.js', 'media_slots': [{'key': 'assets/hero.png'}],
             'logo_slots': []}]})

    def map_private(self):
        records = {}
        for ident, filename in [('reference-atlas:private:overview', 'overview.jpg'),
                ('reference-atlas:private:detail-001', 'detail.jpg'), ('source-video:private', 'source.mp4'),
                ('source-design-media:assets/hero.png', 'hero.png'), ('source-design-media:@logo/brand', 'logo.png')]:
            self.write('private/' + filename, 'private fixture')
            records[ident] = {'path': 'private/' + filename}
        self.write('references/resources.local.json', {'schema_version': 1, 'files': records})

    def test_clean_public_install_reports_specific_missing_assets(self):
        self.fixture()
        result = reference_readiness.report(self.root)
        self.assertTrue(result['required'])
        self.assertFalse(result['ready'])
        self.assertEqual(result['counts']['overviews'], {'expected': 2, 'available': 1})
        self.assertEqual(result['counts']['detail_pages'], {'expected': 2, 'available': 1})
        self.assertEqual(result['counts']['source_videos'], {'expected': 2, 'available': 1})
        self.assertEqual(result['counts']['design_media'], {'expected': 2, 'available': 0})
        self.assertEqual(result['counts']['complete_designs'], {'expected': 2, 'available': 0})
        self.assertIn('source-video:private', result['missing'])
        self.assertIn('source-design-media:assets/hero.png', result['missing'])
        self.assertIn('完整私用包', result['message'])
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(reference_readiness.main(['--root', str(self.root), '--require']), 2)

    def test_relative_private_mapping_completes_resources_without_history_block(self):
        self.fixture()
        self.map_private()
        result = reference_readiness.report(self.root)
        self.assertTrue(result['ready'])
        self.assertEqual(result['missing'], [])
        self.assertEqual({r['id'] for r in result['unavailable_history']}, {'m', 'n', 'o'})
        self.assertEqual(result['counts']['complete_designs'], {'expected': 2, 'available': 2})
        self.assertEqual(result['counts']['design_media'], {'expected': 2, 'available': 2})
        self.assertEqual(result['viewing_status'], 'not-observed-by-this-command')
        self.assertFalse(result['aesthetic_approval'])
        self.assertIn('不是视听或审美验收', result['message'])
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(reference_readiness.main(['--root', str(self.root), '--require']), 0)

    def test_missing_one_detail_or_code_is_not_ready(self):
        self.fixture()
        self.map_private()
        (self.root / 'private/detail.jpg').unlink()
        (self.root / 'assets/agent-editorial/source/body.js').unlink()
        result = reference_readiness.report(self.root)
        self.assertFalse(result['ready'])
        self.assertEqual(result['counts']['overviews']['available'], 2)
        self.assertEqual(result['counts']['detail_pages']['available'], 1)
        self.assertEqual(result['counts']['complete_designs']['available'], 0)
        self.assertIn('reference-atlas:private:detail-001', result['missing'])
        self.assertIn('source-design-code:one', result['missing'])

    def test_unconfigured_fixture_does_not_claim_validated_references(self):
        result = reference_readiness.report(self.root)
        self.assertFalse(result['required'])
        self.assertFalse(result['ready'])
        self.assertEqual(result['status'], 'not-configured')
        with contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(reference_readiness.main(['--root', str(self.root), '--require']), 0)


if __name__ == '__main__':
    unittest.main()
