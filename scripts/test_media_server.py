"""Real local HTTP regressions for video range serving; no browser install."""
from contextlib import contextmanager
from email.utils import formatdate
from functools import partial
from http.client import HTTPConnection
from http.server import ThreadingHTTPServer
import importlib.util
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.parse import quote

from media_server import SingleRangeHTTPRequestHandler


ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(SingleRangeHTTPRequestHandler):
    def log_message(self, *_):
        pass


@contextmanager
def serving(root, handler=QuietHandler):
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(handler, directory=str(root)))
    thread = threading.Thread(target=lambda: server.serve_forever(poll_interval=0.01), daemon=True)
    thread.start()
    try:
        yield server.server_port
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


def request(port, method='GET', path='/media.mp4', headers=None):
    connection = HTTPConnection('127.0.0.1', port, timeout=5)
    try:
        connection.request(method, path, headers=headers or {})
        response = connection.getresponse()
        return response.status, dict(response.getheaders()), response.read()
    finally:
        connection.close()


class MediaServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix='fusion-range-test-')
        cls.root = Path(cls.temp.name)
        cls.data = bytes(range(256)) * 2048 + b'last-five'
        (cls.root / 'media.mp4').write_bytes(cls.data)
        (cls.root / 'empty.mp4').touch()
        (cls.root / '中文 素材.mp4').write_bytes(cls.data)
        cls.context = serving(cls.root)
        cls.port = cls.context.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.context.__exit__(None, None, None)
        cls.temp.cleanup()

    def assert_range(self, value, start, end, method='GET', path='/media.mp4'):
        status, headers, body = request(self.port, method, path, {'Range': value})
        self.assertEqual(status, 206)
        self.assertEqual(headers['Accept-Ranges'], 'bytes')
        self.assertEqual(headers['Content-Range'], f'bytes {start}-{end}/{len(self.data)}')
        self.assertEqual(int(headers['Content-Length']), end - start + 1)
        self.assertEqual(headers['Content-Type'], 'video/mp4')
        self.assertIn('Last-Modified', headers)
        self.assertEqual(body, self.data[start:end + 1] if method == 'GET' else b'')

    def test_normal_get_serves_whole_file(self):
        status, headers, body = request(self.port)
        self.assertEqual(status, 200)
        self.assertEqual(headers['Accept-Ranges'], 'bytes')
        self.assertEqual(int(headers['Content-Length']), len(self.data))
        self.assertNotIn('Content-Range', headers)
        self.assertEqual(body, self.data)

    def test_normal_head_has_length_without_body(self):
        status, headers, body = request(self.port, 'HEAD')
        self.assertEqual(status, 200)
        self.assertEqual(headers['Accept-Ranges'], 'bytes')
        self.assertEqual(int(headers['Content-Length']), len(self.data))
        self.assertEqual(body, b'')

    def test_explicit_range_is_exact(self):
        self.assert_range('bytes=123-821', 123, 821)

    def test_range_across_copy_chunks_is_bounded(self):
        self.assert_range('bytes=333-260111', 333, 260111)

    def test_open_ended_range(self):
        self.assert_range('bytes=100000-', 100000, len(self.data) - 1)

    def test_suffix_range(self):
        self.assert_range('bytes=-19', len(self.data) - 19, len(self.data) - 1)

    def test_oversized_suffix_clamps_to_whole_file(self):
        self.assert_range('bytes=-9999999', 0, len(self.data) - 1)

    def test_oversized_end_clamps_to_last_byte(self):
        self.assert_range('bytes=120-9999999', 120, len(self.data) - 1)

    def test_single_first_and_last_byte(self):
        for position in (0, len(self.data) - 1):
            with self.subTest(position=position):
                self.assert_range(f'bytes={position}-{position}', position, position)

    def test_range_head_has_exact_headers_without_body(self):
        self.assert_range('bytes=2-17', 2, 17, method='HEAD')

    def test_unicode_media_path(self):
        self.assert_range('bytes=5-24', 5, 24, path='/' + quote('中文 素材.mp4'))

    def test_invalid_and_unsatisfiable_ranges(self):
        values = ['bytes=', 'bytes=-', 'bytes=-0', 'bytes=4-2',
                  f'bytes={len(self.data)}-', f'bytes={len(self.data) + 1}-9999999',
                  'items=1-4', 'bytes=one-two', 'bytes=1--2', 'bytes=1-2extra',
                  'bytes=1 - 2', 'bytes=0-1,4-5', 'bytes=0-1,']
        for value in values:
            with self.subTest(value=value):
                status, headers, body = request(self.port, headers={'Range': value})
                self.assertEqual(status, 416)
                self.assertEqual(headers['Accept-Ranges'], 'bytes')
                self.assertEqual(headers['Content-Range'], f'bytes */{len(self.data)}')
                self.assertEqual(headers['Content-Length'], '0')
                self.assertEqual(body, b'')

    def test_duplicate_range_headers_are_explicitly_rejected(self):
        connection = HTTPConnection('127.0.0.1', self.port, timeout=5)
        try:
            connection.putrequest('GET', '/media.mp4')
            connection.putheader('Range', 'bytes=1-4')
            connection.putheader('Range', 'bytes=8-11')
            connection.endheaders()
            response = connection.getresponse()
            self.assertEqual(response.status, 416)
            self.assertEqual(response.getheader('Content-Range'), f'bytes */{len(self.data)}')
            self.assertEqual(response.read(), b'')
        finally:
            connection.close()

    def test_empty_file_get_and_range(self):
        status, headers, body = request(self.port, path='/empty.mp4')
        self.assertEqual((status, headers['Content-Length'], body), (200, '0', b''))
        status, headers, body = request(self.port, path='/empty.mp4', headers={'Range': 'bytes=0-'})
        self.assertEqual((status, headers['Content-Range'], headers['Content-Length'], body),
                         (416, 'bytes */0', '0', b''))

    def test_unmatched_if_range_returns_complete_current_file(self):
        for validator in (formatdate(0, usegmt=True), '"unknown-etag"', 'invalid-date'):
            with self.subTest(validator=validator):
                status, headers, body = request(self.port, headers={'Range': 'bytes=2-7', 'If-Range': validator})
                self.assertEqual(status, 200)
                self.assertNotIn('Content-Range', headers)
                self.assertEqual(body, self.data)

    def test_matching_if_range_date_returns_partial_content(self):
        modified = formatdate((self.root / 'media.mp4').stat().st_mtime, usegmt=True)
        status, headers, body = request(self.port, headers={'Range': 'bytes=2-7', 'If-Range': modified})
        self.assertEqual((status, headers['Content-Length'], body), (206, '6', self.data[2:8]))

    def test_conditional_not_modified_is_preserved(self):
        modified = formatdate((self.root / 'media.mp4').stat().st_mtime, usegmt=True)
        for extra in ({}, {'Range': 'bytes=2-7'}):
            with self.subTest(extra=extra):
                status, headers, body = request(self.port, headers={'If-Modified-Since': modified, **extra})
                self.assertEqual(status, 304)
                self.assertEqual(body, b'')

    def test_missing_file_remains_404(self):
        status, headers, body = request(self.port, path='/missing.mp4', headers={'Range': 'bytes=2-7'})
        self.assertEqual(status, 404)

    def test_both_renderers_and_gallery_use_shared_handler_for_real_requests(self):
        modules = [ROOT / 'assets/base-skill/scripts/render_portable.py',
                   ROOT / 'assets/modules/director/scripts/render.py', ROOT / 'scripts/serve.py']
        for index, path in enumerate(modules):
            with self.subTest(module=str(path.relative_to(ROOT))):
                spec = importlib.util.spec_from_file_location(f'range_renderer_{index}', path)
                module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(module)
                self.assertTrue(issubclass(module.QuietHandler, SingleRangeHTTPRequestHandler))
                with serving(self.root, module.QuietHandler) as port:
                    status, headers, body = request(port, headers={'Range': 'bytes=104-207'})
                    self.assertEqual(status, 206)
                    self.assertEqual(headers['Accept-Ranges'], 'bytes')
                    self.assertEqual(headers['Content-Range'], f'bytes 104-207/{len(self.data)}')
                    self.assertEqual(headers['Content-Length'], '104')
                    self.assertEqual(body, self.data[104:208])


if __name__ == '__main__':
    unittest.main()
