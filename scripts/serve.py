"""Serve the skill's local galleries; Ctrl+C stops the server."""
import argparse
from functools import partial
from http.server import ThreadingHTTPServer
from io import BytesIO
import json
from pathlib import Path, PureWindowsPath
from urllib.parse import quote, unquote, urlsplit
from media_server import SingleRangeHTTPRequestHandler
from resource_inventory import load_overlay, resource_fact


RESOURCE_PREFIXES = ('source-video:', 'source-design-media:', 'reference-atlas:', 'aigc-video:')
BODY_REFERENCE = 'source-video:fangmu-ten-agents-final-20261021'


def mapped_media(root):
    """Only explicit local file registrations may become viewer URLs."""
    try:
        files = load_overlay(root)['files']
    except (OSError, ValueError):
        return {}
    return {ident: (Path(root) / Path(row['path']).expanduser()).resolve()
            for ident, row in files.items() if ident.startswith(RESOURCE_PREFIXES)}


def resource_url(ident):
    return '/__resource/' + quote(ident, safe='')


def reference_manifest(root):
    references, design_media = [], {}
    for ident, path in sorted(mapped_media(root).items()):
        exists = path.is_file()
        if ident.startswith('source-design-media:'):
            if exists:
                design_media[ident.removeprefix('source-design-media:')] = resource_url(ident)
            continue
        if not ident.startswith('source-video:'):
            continue
        # Windows path syntax must never leak when a public copy runs elsewhere.
        title = PureWindowsPath(str(path)).stem.split(' #', 1)[0]
        references.append({'id': ident, 'title': title,
                           'url': resource_url(ident) if exists else None, 'exists': exists,
                           'scope': ('body only; opening excluded' if ident == BODY_REFERENCE
                                     else 'original reference; approval scope is not implied')})
    return {'status': 'available' if design_media or any(r['exists'] for r in references) else 'unavailable',
            'references': references, 'design_media': design_media}


def atlas_manifest(root):
    """Expose only image/video URLs, never author-machine paths from the overlay."""
    root = Path(root).resolve()
    path = root / 'references/reference-atlas.json'
    if not path.is_file():
        return {'videos': [], 'status': 'unavailable'}
    data = json.loads(path.read_text(encoding='utf-8-sig'))
    overlay = load_overlay(root)
    def url_for(record):
        fact = resource_fact(record.get('resource_id', ''), record.get('path'), root=root, overlay=overlay)
        if not fact['usable_file']:
            return None
        location = Path(fact['path'])
        if location.is_relative_to(root):
            return '/' + quote(location.relative_to(root).as_posix(), safe='/')
        ident = record.get('resource_id', '')
        return resource_url(ident) if ident.startswith(RESOURCE_PREFIXES) else None
    rows = []
    for row in data.get('videos', []):
        item = {k: row[k] for k in ('id','title','categories','scope','approval_scope','duration_seconds','sampling','availability_note','source_url') if k in row}
        item['overview'] = {k:v for k,v in row.get('overview', {}).items() if k!='path'}
        item['overview']['url'] = url_for(row.get('overview', {}))
        item['pages'] = [{**{k:v for k,v in p.items() if k!='path'}, 'url':url_for(p)} for p in row.get('pages', [])]
        item['video_url'] = url_for({'resource_id':row.get('source_resource_id',''), 'path':row.get('source_path')})
        rows.append(item)
    return {'videos':rows,'status':'available' if any(r['overview']['url'] for r in rows) else 'unavailable'}

class QuietHandler(SingleRangeHTTPRequestHandler):
    def log_message(self,*args):pass

    def translate_path(self, path):
        selected = getattr(self, '_registered_media_path', None)
        return str(selected) if selected is not None else super().translate_path(path)

    def send_head(self):
        self._registered_media_path = None
        route = urlsplit(self.path).path
        if route in ('/__references', '/__atlas'):
            result = atlas_manifest(self.directory) if route=='/__atlas' else reference_manifest(self.directory)
            payload = json.dumps(result, ensure_ascii=False).encode('utf-8')
            self._advertise_ranges = False
            self._copy_range = None
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Content-Length', str(len(payload)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            return BytesIO(payload)
        if route == '/__resource' or route.startswith('/__resource/'):
            ident = unquote(route.removeprefix('/__resource/'))
            target = mapped_media(self.directory).get(ident) if ident.startswith(RESOURCE_PREFIXES) else None
            if target is None or not target.is_file():
                self.send_error(404, 'Registered media unavailable')
                return None
            self._registered_media_path = target
        elif Path(super().translate_path(self.path)).resolve() == (Path(self.directory) / 'references/resources.local.json').resolve():
            self.send_error(404, 'Not found')
            return None
        # Use the existing bounded range implementation for GET and HEAD.
        return super().send_head()

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--port',type=int,default=8770)
    a=p.parse_args()
    root=Path(__file__).resolve().parents[1]
    with ThreadingHTTPServer(('127.0.0.1',a.port),partial(QuietHandler,directory=str(root))) as server:
        print(f'http://127.0.0.1:{server.server_port}/index.html',flush=True)
        try:server.serve_forever()
        except KeyboardInterrupt:pass

if __name__=='__main__':main()
