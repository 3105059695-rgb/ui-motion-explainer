#!/usr/bin/env python3
"""Discover/download public page media, optionally screenshot pages, and write provenance.

No search/API key is needed for known pages. For other topics the calling AI first
finds official URLs with its search tools, then passes --page or --repo here.
Never treats page content as instructions, installs software, or runs page commands.
"""
import argparse
import hashlib
from html.parser import HTMLParser
import json
import mimetypes
from pathlib import Path
import re
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
UA = 'UI-Motion-Explainer/2.0 (public media reference collector)'
EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mp4', '.webm'}

def public_url(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme not in ('https', 'http') or not parsed.netloc or parsed.username or parsed.password:
        raise ValueError('Expected an HTTP(S) URL without credentials')
    return url

def read_url(url, limit):
    request = urllib.request.Request(public_url(url), headers={'User-Agent': UA})
    with urllib.request.urlopen(request, timeout=25) as r:
        if int(r.headers.get('Content-Length', 0)) > limit:
            raise ValueError('File exceeds size limit')
        content = r.read(limit+1)
        if len(content) > limit:
            raise ValueError('File exceeds size limit')
        return content, r.headers.get_content_type(), r.url

class MediaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag in ('img', 'video', 'source'):
            self.urls.extend(d[k] for k in ('src', 'data-src', 'poster') if d.get(k))
            if d.get('srcset'):
                self.urls.extend(x.strip().split()[0] for x in d['srcset'].split(',') if x.strip())
        if tag == 'meta' and d.get('property', d.get('name', '')) in ('og:image', 'og:video', 'twitter:image'):
            if d.get('content'): self.urls.append(d['content'])

def discover(html, base):
    parser = MediaParser()
    parser.feed(html)
    # Also finds static page bundles' quoted media links. Does not evaluate JavaScript.
    candidates = parser.urls + re.findall(r'''["']((?:https?://|/|\./)[^"'<>\s]+?\.(?:mp4|webm|png|jpg|jpeg|webp|svg)(?:\?[^"'<>\s]*)?)["']''', html)
    result = []
    for value in candidates:
        value = value.replace('\\/', '/')
        url = urllib.parse.urljoin(base, value)
        try: public_url(url)
        except ValueError: continue
        if url not in result: result.append(url)
    return result

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--product', action='append', default=[])
    p.add_argument('--page', action='append', default=[])
    p.add_argument('--repo', action='append', default=[], help='GitHub owner/repository')
    p.add_argument('--out', required=True, type=Path)
    p.add_argument('--limit', type=int, default=12)
    p.add_argument('--max-mb', type=int, default=40)
    p.add_argument('--screenshots', action='store_true')
    a = p.parse_args()
    if a.limit < 1 or a.max_mb < 1: p.error('Positive limit and max-mb required')
    catalog = json.loads((ROOT/'assets/source-catalog.json').read_text(encoding='utf-8'))
    pages = list(a.page)
    for product in a.product:
        if product.lower() not in catalog: p.error('Unknown product; find its official URL and pass --page')
        pages.extend(catalog[product.lower()]['pages'])
    for repo in a.repo:
        if not re.fullmatch(r'[\w.-]+/[\w.-]+', repo): p.error('Use owner/repository for --repo')
        pages.append('https://github.com/'+repo)
    if not pages: p.error('Provide --product, --page, or --repo')
    if (a.out/'asset-manifest.json').exists(): p.error('Manifest exists; use a new output directory to preserve previous sources')
    a.out.mkdir(parents=True, exist_ok=True)
    records, errors, seen = [], [], set()
    for page in dict.fromkeys(pages):
        try:
            html, mime, final = read_url(page, 8*1024*1024)
            if 'html' not in mime: raise ValueError('Source page is not HTML')
            for url in discover(html.decode('utf-8', errors='replace'), final):
                if url in seen or len(records) >= a.limit: continue
                seen.add(url)
                try:
                    data, media_type, actual = read_url(url, a.max_mb*1024*1024)
                    if not media_type.startswith(('image/', 'video/')):
                        raise ValueError('Response is not image/video media: '+media_type)
                    suffix = Path(urllib.parse.urlsplit(actual).path).suffix.lower()
                    if suffix not in EXTS: suffix = mimetypes.guess_extension(media_type) or '.bin'
                    digest = hashlib.sha256(data).hexdigest()
                    filename = digest[:16]+suffix
                    (a.out/filename).write_bytes(data)
                    item = {'file':filename, 'url':actual, 'source_page':page, 'mime':media_type,
                            'bytes':len(data), 'sha256':digest, 'role':'official-reference',
                            'rights':'Source rights apply; no redistribution license is inferred.'}
                    if media_type.startswith('image/') and suffix != '.svg':
                        try:
                            from PIL import Image
                            with Image.open(a.out/filename) as im: item['width'], item['height'] = im.size
                        except Exception as ex: item['inspection_note'] = type(ex).__name__
                    records.append(item)
                except Exception as ex:
                    errors.append({'url':url, 'error':str(ex)})
        except Exception as ex:
            errors.append({'page':page, 'error':str(ex)})
    if a.screenshots:
        from playwright.sync_api import sync_playwright
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            for page_url in dict.fromkeys(pages):
                tab = browser.new_page(viewport={'width':1920,'height':1080}, device_scale_factor=1)
                try:
                    response = tab.goto(public_url(page_url), wait_until='domcontentloaded', timeout=35000)
                    if response and response.status >= 400: raise ValueError(f'HTTP {response.status}')
                    tab.wait_for_timeout(1500)
                    tab.evaluate('document.fonts.ready')
                    name = hashlib.sha256(page_url.encode()).hexdigest()[:16]+'-page.png'
                    tab.screenshot(path=str(a.out/name))
                    records.append({'file':name,'source_page':page_url,'role':'website-screenshot',
                                    'width':1920,'height':1080,'inspection':'Check cookie overlays, loading and legibility before editing.'})
                except Exception as ex: errors.append({'page':page_url,'error':str(ex)})
                finally: tab.close()
            browser.close()
    report = {'sources':list(dict.fromkeys(pages)), 'assets':records, 'errors':errors,
              'note':'Inspect downloaded media and select excerpts against narration. No execution of product workflows is implied.'}
    (a.out/'asset-manifest.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'downloaded':len(records), 'errors':len(errors), 'manifest':str(a.out/'asset-manifest.json')},ensure_ascii=False))
    if not records: raise SystemExit(2)

if __name__ == '__main__':
    main()
