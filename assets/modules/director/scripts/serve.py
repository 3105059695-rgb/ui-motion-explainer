#!/usr/bin/env python3
"""Serve the local gallery or a generated project, bound only to loopback."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, gallery_mode=False, **kwargs):
        self.gallery_mode = gallery_mode
        super().__init__(*args, **kwargs)

    def redirect_gallery_entry(self):
        if not self.gallery_mode:
            return False
        request = urlsplit(self.path)
        pages = {
            '/': 'index.html',
            '/index.html': 'index.html',
            '/coverage.html': 'coverage.html',
            '/diagnostics.html': 'diagnostics.html',
        }
        page = pages.get(request.path)
        if page is None:
            return False
        location = f'/assets/studio/{page}'
        if request.query:
            location += '?' + request.query
        self.send_response(307)
        self.send_header('Location', location)
        self.send_header('Content-Length', '0')
        self.end_headers()
        return True

    def do_GET(self):
        if not self.redirect_gallery_entry():
            super().do_GET()

    def do_HEAD(self):
        if not self.redirect_gallery_entry():
            super().do_HEAD()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project', type=Path, help='Serve a standalone project with its own index.html.')
    parser.add_argument('--port', type=int, default=8876)
    args = parser.parse_args()
    package_root = Path(__file__).resolve().parents[1]
    studio_root = package_root / 'assets' / 'studio'
    requested_root = args.project.expanduser().resolve() if args.project else None
    gallery_mode = requested_root is None or requested_root in (package_root, studio_root)
    root = package_root if gallery_mode else requested_root
    preview_path = '/assets/studio/index.html' if gallery_mode else '/index.html'
    if not (root / preview_path.lstrip('/')).is_file():
        parser.error(f'Project entry is missing: {root / preview_path.lstrip("/")}')
    handler = partial(DevHandler, directory=str(root), gallery_mode=gallery_mode)
    server = ThreadingHTTPServer(('127.0.0.1', args.port), handler)
    print(f'Preview: http://127.0.0.1:{server.server_port}{preview_path}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
