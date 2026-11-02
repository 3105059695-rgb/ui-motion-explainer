"""Small local HTTP checks for allowlisted original-reference playback."""
import json
from pathlib import Path
import tempfile
import unittest
from urllib.parse import quote

from serve import BODY_REFERENCE, QuietHandler
from test_media_server import request, serving


class ReferenceViewerTests(unittest.TestCase):
    def test_registered_video_range_and_private_manifest(self):
        with tempfile.TemporaryDirectory(prefix='fusion-reference-test-') as folder:
            root = Path(folder) / 'skill'
            (root / 'references').mkdir(parents=True)
            video = Path(folder) / 'private-original.mp4'
            data = bytes(range(256)) * 8
            video.write_bytes(data)
            overlay = {'schema_version': 1, 'modules': {}, 'files': {
                BODY_REFERENCE: {'path': str(video)},
                'source-design-media:current-shot': {'path': str(video)},
                'source-video:missing': {'path': str(Path(folder) / 'missing.mp4')}}}
            (root / 'references/resources.local.json').write_text(json.dumps(overlay), encoding='utf-8')
            with serving(root, QuietHandler) as port:
                status, _, body = request(port, path='/__references')
                self.assertEqual(status, 200)
                manifest = json.loads(body)
                self.assertEqual(manifest['status'], 'available')
                self.assertNotIn(str(video), body.decode())
                record = next(r for r in manifest['references'] if r['id'] == BODY_REFERENCE)
                self.assertTrue(record['exists'])
                self.assertEqual(record['scope'], 'body only; opening excluded')
                self.assertIsNone(next(r for r in manifest['references'] if not r['exists'])['url'])
                for url in (record['url'], manifest['design_media']['current-shot']):
                    status, headers, body = request(port, path=url, headers={'Range': 'bytes=17-93'})
                    self.assertEqual(status, 206)
                    self.assertEqual(headers['Content-Range'], f'bytes 17-93/{len(data)}')
                    self.assertEqual(body, data[17:94])
                    status, headers, body = request(port, method='HEAD', path=url, headers={'Range': 'bytes=17-93'})
                    self.assertEqual((status, headers['Content-Length'], body), (206, '77', b''))

    def test_unknown_ids_paths_and_private_overlay_are_not_served(self):
        with tempfile.TemporaryDirectory(prefix='fusion-reference-test-') as folder:
            root = Path(folder) / 'skill'
            (root / 'references').mkdir(parents=True)
            private = Path(folder) / 'private.mp4'
            private.write_bytes(b'private')
            overlay_path = root / 'references/resources.local.json'
            overlay_path.write_text(json.dumps({'schema_version': 1, 'files': {
                'private-file:secret': {'path': str(private)}}}), encoding='utf-8')
            with serving(root, QuietHandler) as port:
                ids = ['source-video:unknown', 'source-design-media:unknown',
                       'private-file:secret', str(private), '../private.mp4',
                       'source-video:../../private.mp4']
                for ident in ids:
                    with self.subTest(ident=ident):
                        self.assertEqual(request(port, path='/__resource/' + quote(ident, safe=''),
                                                 headers={'Range': 'bytes=0-2'})[0], 404)
                self.assertEqual(request(port, path='/references/resources.local.json')[0], 404)
                self.assertEqual(json.loads(request(port, path='/__references')[2]),
                                 {'status': 'unavailable', 'references': [], 'design_media': {}})
                overlay_path.unlink()
                self.assertEqual(json.loads(request(port, path='/__references')[2])['status'], 'unavailable')


if __name__ == '__main__':
    unittest.main()
