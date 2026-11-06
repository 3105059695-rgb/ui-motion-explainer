"""Full-film atlas routes preserve all categories and disclose missing private media."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import director
import reference_overviews


class ReferenceOverviewTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'references').mkdir()

    def write(self, relative, value):
        path = self.root / relative
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, ensure_ascii=False), encoding='utf-8')

    def test_all_overviews_and_private_detail_pages_resolve_without_viewing_claim(self):
        image = self.root / 'private' / 'whole.jpg'
        image.parent.mkdir()
        image.write_bytes(b'existing-image-fixture')
        detail = self.root / 'private' / 'detail.jpg'
        detail.write_bytes(b'existing-detail-fixture')
        self.write('references/resources.local.json', {'schema_version': 1, 'modules': {},
                    'files': {'atlas:private-overview': {'path': str(image)},
                              'atlas:private-page': {'path': str(detail)}}})
        videos = [{'id': 'reference-' + str(i), 'title': '参考 ' + str(i),
                   'categories': ['ui' if i < 4 else 'editing' if i < 8 else 'aigc'],
                   'scope': '明确参考范围', 'overview': {'resource_id': 'atlas:private-overview'},
                   'pages': [{'resource_id': 'atlas:private-page', 'start': 0, 'end': 120, 'count': 60,
                              'cells': [{'x': n, 'time': n * 2} for n in range(60)],
                              'geometry': {'tile_width': 320}}]} for i in range(12)]
        self.write(reference_overviews.CATALOG, {'schema_version': 1, 'videos': videos})
        report = reference_overviews.load(self.root)
        self.assertEqual(report['video_count'], 12)
        self.assertEqual(report['available_overview_count'], 12)
        self.assertEqual(report['videos'][11]['pages'][0]['path'], str(detail.resolve()))
        self.assertEqual(report['videos'][11]['pages'][0]['start'], 0)
        self.assertEqual(report['videos'][11]['pages'][0]['count'], 60)
        self.assertNotIn('cells', report['videos'][11]['pages'][0])
        self.assertNotIn('geometry', report['videos'][11]['pages'][0])
        self.assertEqual(report['viewing_status'], 'not-observed-by-this-command')
        brief = reference_overviews.render_brief(report)
        self.assertIn('参考 11', brief)
        self.assertIn('aigc', brief)
        self.assertIn('不是每一帧', brief.replace('不等于每一帧', '不是每一帧'))
        with patch.object(director.selection, 'scene_directory', return_value={}):
            context = director.research_production_context({'unified_production': {'enabled': True}}, self.root)
        self.assertEqual(len(context['reference_overviews']['overview_images']), 12)

    def test_missing_catalog_and_missing_private_images_are_not_four_image_fallback(self):
        missing = reference_overviews.load(self.root)
        self.assertEqual(missing['status'], 'catalog-unavailable')
        self.assertEqual(missing['overview_images'], [])
        self.write(reference_overviews.CATALOG, {'videos': [{'id': 'arun', 'title': '阿闰',
                   'categories': ['editing'], 'overview': {'resource_id': 'atlas:missing'}}]})
        report = reference_overviews.load(self.root)
        self.assertEqual(report['status'], 'unavailable')
        self.assertFalse(report['videos'][0]['overview']['available'])
        self.assertIn('全片总览缺失', reference_overviews.render_brief(report))
        self.assertNotIn('parallel-process.png', reference_overviews.render_brief(report))

    def test_packaged_image_and_duplicate_id_boundary(self):
        (self.root / 'public.jpg').write_bytes(b'public-example-fixture')
        row = {'id': 'public', 'overview': {'path': 'public.jpg'}}
        self.write(reference_overviews.CATALOG, {'videos': [row]})
        self.assertEqual(reference_overviews.load(self.root)['status'], 'available')
        self.write(reference_overviews.CATALOG, {'videos': [row, row]})
        with self.assertRaisesRegex(ValueError, 'unique'):
            reference_overviews.load(self.root)


if __name__ == '__main__':
    unittest.main()
