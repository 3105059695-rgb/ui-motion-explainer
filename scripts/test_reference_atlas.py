"""Real tiny-video checks for contact-sheet coverage, provenance and cache reuse."""
import contextlib
import io
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

from PIL import Image
import reference_atlas as atlas


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'), 'Existing FFmpeg required')
class ReferenceAtlasTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root / 'source.mp4'
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                        "color=red:s=160x90:r=10:d=3,drawbox=x=0:y=0:w=iw:h=ih:color=blue:t=fill:enable='gte(t,1.5)'",
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(self.source)], check=True)
        self.catalog = self.root / 'catalog.json'
        self.catalog.write_text(json.dumps({'references': [
            {'id': 'approved:one', 'title': 'Complete source', 'path': str(self.source), 'categories': ['UI'], 'scope': 'body only', 'duration_seconds': 3},
            {'id': 'missing', 'title': 'Missing source', 'path': str(self.root / 'absent.mp4')}
        ]}), encoding='utf-8')
        self.out = self.root / 'atlas'

    def build(self):
        with contextlib.redirect_stdout(io.StringIO()):
            return atlas.build(self.catalog, self.out, interval=.2, overview_frames=8, tile_width=120)

    def test_real_frames_first_end_and_no_page_boundary_gaps(self):
        with patch.object(atlas, 'PAGE_FRAMES', 4):
            result = self.build()
        ready, missing = result['references']
        self.assertEqual(ready['status'], 'ready')
        self.assertEqual(missing['status'], 'missing')
        self.assertGreater(len(ready['detail_pages']), 1)
        times = [cell['seconds'] for page in ready['detail_pages'] for cell in page['cells']]
        self.assertEqual(times[0], 0)
        self.assertLessEqual(3 - times[-1], .101)
        self.assertTrue(all(a < b for a, b in zip(times, times[1:])))
        self.assertLessEqual(max(b-a for a,b in zip(times,times[1:])), .301)
        first = ready['detail_pages'][0]
        last = ready['detail_pages'][-1]
        folder = self.out / ready['directory']
        def color(page, index):
            cell = page['cells'][index]
            with Image.open(folder / page['file']) as im:
                return im.getpixel((cell['x'] + cell['w']//2, cell['y'] + cell['h']//2))
        red, blue = color(first,0), color(last,-1)
        self.assertGreater(red[0], 220); self.assertLess(red[2], 40)
        self.assertGreater(blue[2], 220); self.assertLess(blue[0], 40)
        public = (self.out / 'manifest.json').read_text(encoding='utf-8')
        self.assertNotIn(str(self.source), public)
        self.assertNotIn(str(self.source).replace('\\', '\\\\'), public)
        self.assertEqual(json.loads((self.out/'sources.local.json').read_text())['sources']['approved:one']['path'], str(self.source.resolve()))

    def test_cache_reuses_images_and_changed_parameters_invalidate(self):
        first = self.build()['references'][0]
        image = self.out / first['directory'] / first['overview']['file']
        modified = image.stat().st_mtime_ns
        with patch.object(atlas, 'decoded_samples', side_effect=AssertionError('cache must not decode')):
            second = self.build()['references'][0]
        self.assertTrue(second['cached'])
        self.assertEqual(image.stat().st_mtime_ns, modified)
        self.assertNotEqual(atlas.source_fingerprint(self.source, {'interval': 1}), atlas.source_fingerprint(self.source, {'interval': 2}))

    def test_invalid_and_duplicate_catalogs_fail_before_build(self):
        self.catalog.write_text(json.dumps([{'id':'same','path':str(self.source)},{'id':'same','path':str(self.source)}]))
        with self.assertRaisesRegex(ValueError, 'unique id'):
            self.build()
        self.assertFalse(self.out.exists())

    def test_remote_only_null_and_empty_paths_are_explicit_missing(self):
        self.catalog.write_text(json.dumps([
            {'id':'remote-null','path':None,'source_url':'https://example.test/reference.mp4','scope':'motion only'},
            {'id':'remote-empty','path':''}, {'id':'remote-absent'}
        ]))
        result = self.build()
        self.assertEqual(result['summary'], {'ready':0,'missing':3,'error':0})
        self.assertEqual(result['references'][0]['source_url'], 'https://example.test/reference.mp4')
        self.assertEqual(result['references'][0]['scope'], 'motion only')

    def test_short_demonstration_default_preserves_more_action_states(self):
        with contextlib.redirect_stdout(io.StringIO()):
            result = atlas.build(self.catalog, self.out, interval=2, overview_frames=8, tile_width=120)
        row = result['references'][0]
        self.assertEqual(row['sampling']['requested_interval_seconds'], .25)
        self.assertGreaterEqual(row['sampling']['selected_frame_count'], 10)
        self.assertTrue(result['build_complete'])
        self.assertEqual(result['catalog_count'], 2)
        self.assertEqual(result['pending_ids'], [])


if __name__ == '__main__':
    unittest.main()
