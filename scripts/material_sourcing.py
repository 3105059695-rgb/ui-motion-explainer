"""Narration-to-material intake, using the user's existing logged-in Ego browser.

Search suggestions are lexical aids, never proof of matching or downloaded media.
This module reuses narration segmentation and existing ffprobe; no browser/runtime
installation, credential extraction, hidden platform API, or paid service is used.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import math
from pathlib import Path
import re
import shutil
import subprocess
import sys
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen

import selection

ROOT = Path(__file__).resolve().parents[1]
OWNER = 'ui-motion-fusion/material_sourcing.py'


def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def digest(path):
    value = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()


def write_new(path, value):
    path = Path(path).resolve()
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x', encoding='utf-8', newline='\n') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return str(path)


def http_url(value):
    parsed = urlparse(str(value))
    return parsed.scheme in ('https', 'http') and bool(parsed.netloc) and not parsed.username and not parsed.password


def search_links(query):
    term = quote(query, safe='')
    return {'x': f'https://x.com/search?q={term}&src=typed_query&f=live',
            'bilibili': f'https://search.bilibili.com/all?keyword={term}',
            'douyin': f'https://www.douyin.com/search/{term}?type=video'}


def build_plan(source, project=None, brief=None):
    """Return an editable plan. source accepts director.source_data or plain text.

    Optional brief is {units:[{unit_id, query, purpose, wanted}]} authored after
    understanding the whole narration. It never changes the preserved quote.
    """
    if isinstance(source, str):
        source = {'text': source, 'sha256': hashlib.sha256(source.encode('utf-8')).hexdigest()}
    text = source['text']
    overrides = {row['unit_id']: row for row in (brief or {}).get('units', [])}
    units = []
    for original in selection.source_segments(text):
        override = overrides.pop(original['id'], {})
        query = override.get('query') or original['quote'].strip('。！？!?')
        units.append({**original, 'query': query,
                      'query_status': 'agent-authored' if override.get('query') else 'lexical-draft-needs-context',
                      'purpose': override.get('purpose', ''),
                      'wanted': override.get('wanted', []), 'search': search_links(query),
                      'material_ids': [], 'status': 'unsearched'})
    if overrides:
        raise ValueError('Unknown unit IDs in brief: ' + ', '.join(overrides))
    return {'schema_version': 1, 'generated_by': OWNER, 'source': source,
            'project': str(Path(project).resolve()) if project else None,
            'units': units, 'materials': [],
            'selection_complete': False, 'searched': False,
            'instructions': [
                '通读原稿，将 query 改为准确产品/对象 + 动作/结果/版本；必要时补英文别名。句子分段不是镜头切分。',
                '通过当前登录的 ego 浏览 X、B站、抖音，优先原作者或官方演示；结果列表不等于已看原片。',
                '打开来源页，核对具体过程/结果、日期和画质；保存截图或可访问视频，记录对应原句与有效入出点。',
                '先比较候选的句意匹配、过程完整度、可读性与清晰度，再选择；缺合适素材时重新检索或改用清楚的表达。',
                '截图用于静态事实/界面，动作或过程使用真实连续片段；搜不到不能用无关泛素材凑数。',
                '素材和图集是内容参考；按所选效果接口绑定真实媒体，不把候选 URL、占位图或旧场景当成片素材。']}


def context(source, project, root=ROOT):
    return {'plan': build_plan(source, project),
            'plan_path': str((Path(project) / 'materials-plan.json').resolve()),
            'guide': str((Path(root) / 'assets/material-sourcing/README.md').resolve()),
            'commands': ['ui.py materials plan --script <原稿> --project <工程>',
                         'ui.py materials ego-script --request <本轮采集.json> --out <本轮.mjs>',
                         'ui.py materials record --plan <计划.json> --record <素材记录.json>',
                         'ui.py materials check --plan <计划.json>',
                         'ui.py materials export --plan <计划.json> --out <素材绑定.json>'],
            'browser': 'ego-browser; read its installed skill before use; reuse one TaskSpace',
            'automatic_search_performed': False}


def validate_plan(plan):
    if plan.get('generated_by') != OWNER:
        raise ValueError('Not a material-sourcing plan.')
    text = plan['source']['text']
    ids = []
    for unit in plan['units']:
        start, end = unit['span']['start'], unit['span']['end']
        if not isinstance(start, int) or not isinstance(end, int) or start < 0 or end <= start or text[start:end] != unit['quote']:
            raise ValueError('Original quote/span changed: ' + str(unit.get('id')))
        ids.append(unit['id'])
    if len(set(ids)) != len(ids):
        raise ValueError('Duplicate unit IDs.')


def playlist_reason(path):
    """A manifest is not local visual media, even if FFprobe can follow it."""
    path = Path(path)
    if path.suffix.lower() in ('.m3u', '.m3u8', '.mpd', '.pls', '.ffconcat', '.url'):
        return 'playlist/manifest extension'
    with path.open('rb') as stream:
        header = stream.read(8192).lstrip(b'\xef\xbb\xbf \t\r\n').lower()
    if header.startswith((b'#extm3u', b'[playlist]', b'ffconcat version')) or re.search(rb'<(?:\w+:)?mpd(?:\s|>)', header):
        return 'playlist/manifest content'
    return None


def probe(path):
    reason = playlist_reason(path)
    if reason:
        return {'status': 'invalid', 'error': reason + '; download a real local media file instead'}
    ffprobe = shutil.which('ffprobe')
    if not ffprobe:
        return {'status': 'unprobed', 'reason': 'ffprobe is not on PATH'}
    # Explicitly block HTTP/TCP/etc even when an extension or content header
    # hides a network playlist. Probing must not fetch remote segments.
    run = subprocess.run([ffprobe, '-v', 'error', '-protocol_whitelist', 'file,pipe', '-show_entries',
                          'format=format_name,duration:stream=codec_type,codec_name,width,height,duration',
                          '-of', 'json', str(path)], capture_output=True, text=True, encoding='utf-8', timeout=45)
    if run.returncode:
        return {'status': 'invalid', 'error': run.stderr[:1000]}
    data = json.loads(run.stdout)
    if set(data.get('format', {}).get('format_name', '').split(',')) & {'hls', 'dash', 'concat', 'concatf'}:
        return {'status': 'invalid', 'error': 'playlist/container references are not a downloaded local media file'}
    video = next((s for s in data.get('streams', []) if s.get('codec_type') == 'video'), None)
    if not video:
        return {'status': 'invalid', 'error': 'No visual stream'}
    duration = data.get('format', {}).get('duration') or video.get('duration')
    return {'status': 'probed', 'width': video.get('width'), 'height': video.get('height'),
            'duration': float(duration) if duration not in (None, 'N/A') else None,
            'codec': video.get('codec_name'), 'full_decode': False}


def download(url, out, source_page, max_mb=200):
    """Download one observed direct media URL, with no credentials or install.

    Platform watch URLs and blob URLs are not extractors. The Agent reads the
    logged-in Ego page to locate a legitimate download or actual media URL.
    """
    if not http_url(url) or not http_url(source_page):
        raise ValueError('Use observed HTTP media URL and its source page; blob URLs cannot be downloaded with HTTP.')
    if not math.isfinite(max_mb) or max_mb <= 0:
        raise ValueError('max-mb must be positive.')
    target = Path(out).resolve()
    part = target.with_name(target.name + '.part')
    if target.exists() or part.exists():
        raise ValueError('Output or partial download already exists; resume/inspect it rather than overwriting.')
    target.parent.mkdir(parents=True, exist_ok=True)
    limit, total = int(max_mb * 1024 * 1024), 0
    req = Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Referer': source_page})
    created = False
    try:
        with urlopen(req, timeout=30) as response:
            content_type = response.headers.get('Content-Type', '').lower()
            if any(kind in content_type for kind in ('mpegurl', 'dash+xml', 'vnd.apple.mpegurl', 'x-scpls')):
                raise ValueError('URL returned a playlist/manifest, not a complete local media file.')
            if 'text/html' in content_type or 'application/json' in content_type:
                raise ValueError('URL returned a webpage/JSON, not downloadable media; inspect the source in Ego.')
            length = response.headers.get('Content-Length')
            if length and int(length) > limit:
                raise ValueError('Media exceeds the configured download limit.')
            with part.open('xb') as stream:
                created = True
                while chunk := response.read(1024 * 1024):
                    total += len(chunk)
                    if total > limit:
                        raise ValueError('Media exceeds the configured download limit.')
                    stream.write(chunk)
        if not total:
            raise ValueError('Empty download.')
        checked = probe(part)
        if checked['status'] != 'probed':
            raise ValueError('Downloaded file is not verified visual media: ' + json.dumps(checked))
        part.replace(target)
        return {'local_path': str(target), 'bytes': total, 'source_page': source_page,
                'sha256': digest(target), 'file_check': checked,
                'selection': 'candidate', 'semantic_match': False,
                'note': 'Review the actual content and selected range, then record it against an exact narration unit.'}
    except Exception:
        # Only the precisely named partial file exclusively created by this call.
        if created and part.is_file():
            part.unlink()
        raise


def record(plan_path, incoming):
    path = Path(plan_path).resolve()
    plan = read(path)
    validate_plan(plan)
    row = dict(incoming)
    if not row.get('id') or not isinstance(row.get('id'), str):
        raise ValueError('Material id is required.')
    if any(m['id'] == row['id'] for m in plan['materials']):
        raise ValueError('Material ID already exists; edit the project plan explicitly to replace it.')
    unit = next((u for u in plan['units'] if u['id'] == row.get('unit_id')), None)
    if not unit or row.get('quote') != unit['quote']:
        raise ValueError('unit_id and exact original quote must match the plan.')
    source = row.get('source', {})
    if not http_url(source.get('page_url', '')):
        raise ValueError('A real source page_url is required (http/https, no credentials).')
    if row.get('kind') not in ('image', 'video'):
        raise ValueError('kind must be image or video.')
    if not row.get('purpose'):
        raise ValueError('Describe what this material shows for the narration.')
    if row.get('selection', 'candidate') not in ('candidate', 'selected', 'rejected'):
        raise ValueError('selection must be candidate, selected, or rejected.')
    row.setdefault('selection', 'candidate')
    row.setdefault('review', {'semantic_match': False, 'viewed_range': None, 'notes': ''})
    row.setdefault('source_in', 0)
    row.setdefault('source_out', None)
    row['registered_at'] = datetime.now(timezone.utc).isoformat()
    row.pop('file_check', None)
    if row.get('local_path'):
        local = (path.parent / row['local_path']).resolve()
        if not local.is_file() or not local.stat().st_size:
            raise ValueError('Local material is missing or empty: ' + str(local))
        row['local_path'] = str(local)
        row['file_check'] = {'bytes': local.stat().st_size,
                             'sha256': digest(local), **probe(local)}
    plan['materials'].append(row)
    unit['material_ids'].append(row['id'])
    # Atomic replacement of this owned plan only; source and media are untouched.
    temp = path.with_suffix(path.suffix + '.tmp')
    with temp.open('x', encoding='utf-8') as stream:
        json.dump(plan, stream, ensure_ascii=False, indent=2)
        stream.write('\n')
    temp.replace(path)
    return {'id': row['id'], 'selection': row['selection'],
            'file_check': row.get('file_check'), 'ready_for_export': False,
            'note': 'Run check/export; registration does not assert semantic or aesthetic approval.'}


def inspect(plan_path):
    path = Path(plan_path).resolve()
    plan = read(path)
    validate_plan(plan)
    materials, ready, issues = [], [], []
    for item in plan['materials']:
        errors, warnings = [], []
        unit = next((u for u in plan['units'] if u['id'] == item.get('unit_id')), None)
        if not unit or item.get('quote') != unit['quote']:
            errors.append('original quote/unit mismatch')
        if not http_url(item.get('source', {}).get('page_url', '')):
            errors.append('invalid source page')
        if item.get('kind') not in ('image', 'video'):
            errors.append('invalid media kind')
        local = (path.parent / item['local_path']).resolve() if item.get('local_path') else None
        checked = None
        if not local or not local.is_file():
            errors.append('no local file')
        else:
            if not local.stat().st_size:
                errors.append('empty local file')
            elif item.get('file_check', {}).get('sha256') != digest(local):
                errors.append('local file changed after registration; register the updated material explicitly')
            checked = probe(local)
            if checked['status'] != 'probed':
                errors.append('media not successfully probed')
        if item.get('selection') != 'selected':
            errors.append('not selected')
        review = item.get('review', {})
        if review.get('semantic_match') is not True or not review.get('notes'):
            errors.append('semantic match and visible evidence notes not recorded')
        if item['kind'] == 'video':
            start, end = item.get('source_in'), item.get('source_out')
            if (not isinstance(start, (int, float)) or isinstance(start, bool) or not math.isfinite(start) or start < 0
                    or not isinstance(end, (int, float)) or isinstance(end, bool) or not math.isfinite(end) or end <= start):
                errors.append('invalid video in/out')
            elif checked and checked.get('duration') is not None and end > checked['duration'] + .05:
                errors.append('source_out exceeds actual media duration')
            viewed = review.get('viewed_range')
            if (not isinstance(viewed, list) or len(viewed) != 2 or
                    any(not isinstance(n, (int, float)) or isinstance(n, bool) or not math.isfinite(n) for n in viewed)):
                errors.append('reviewed video range not recorded')
            elif isinstance(start, (int, float)) and isinstance(end, (int, float)) and (viewed[0] > start or viewed[1] < end):
                errors.append('selected clip exceeds reviewed range')
        if not item.get('source', {}).get('author'):
            warnings.append('source author not recorded')
        if not item.get('source', {}).get('published_at'):
            warnings.append('source publication time not recorded; do not infer freshness')
        if not item.get('source', {}).get('reuse_note'):
            warnings.append('reuse context not recorded; download does not establish reuse permission')
        row = {'id': item['id'], 'unit_id': item['unit_id'], 'ready': not errors,
               'errors': errors, 'warnings': warnings, 'media': checked}
        materials.append(row)
        if not errors:
            ready.append(item)
        elif item.get('selection') == 'selected':
            issues.append(row)
    bound_units = {r['unit_id'] for r in ready}
    return {'plan': str(path), 'ready_count': len(ready), 'selected_errors': len(issues),
            'materials': materials, 'unfilled_units': [u['id'] for u in plan['units'] if u['id'] not in bound_units],
            'unfilled_is_not_failure': 'A narration unit may use presenter, authored UI, or AIGC instead; Agent records the decision.',
            'semantic_review_is_agent_reported': True, 'aesthetic_approval': False}


def export(plan_path, out):
    plan = read(plan_path)
    report = inspect(plan_path)
    if report['selected_errors']:
        raise ValueError('Selected materials are not ready: ' + json.dumps([r for r in report['materials'] if not r['ready']], ensure_ascii=False))
    allowed = {r['id'] for r in report['materials'] if r['ready']}
    rows = []
    for row in plan['materials']:
        if row['id'] in allowed:
            rows.append({key: row.get(key) for key in ('id', 'unit_id', 'quote', 'purpose', 'kind', 'local_path',
                         'source_in', 'source_out', 'source', 'review', 'focus_region', 'file_check')})
    if not rows:
        raise ValueError('No selected, reviewed local materials. Search results alone cannot be exported as production media.')
    result = {'schema_version': 1, 'generated_by': OWNER, 'source_sha256': plan['source'].get('sha256'),
              'materials': rows, 'media_by_id': {r['id']: {'path': r['local_path'], 'kind': r['kind'],
                    'sourceIn': r['source_in'], 'sourceOut': r['source_out']} for r in rows},
              'binding_instruction': 'Map material IDs to the chosen effect interface asset slots; crop/focus and timeline durations are authored for this narration.',
              'aesthetic_approval': False}
    write_new(out, result)
    return {'output': str(Path(out).resolve()), 'count': len(rows), 'ready_material_ids': list(allowed)}


def ego_script(request, out, root=ROOT):
    """Generate a single-round script; the Agent resumes its existing TaskSpace."""
    if not isinstance(request.get('space_id'), int) or request['space_id'] < 1:
        raise ValueError('Use the actual existing Ego space_id.')
    if not request.get('page') or request.get('action', 'collect') not in ('collect', 'screenshot', 'download'):
        raise ValueError('Supply existing page label and action collect/screenshot/download.')
    if not Path(request.get('output', '')).is_absolute():
        raise ValueError('Ego output must be an absolute local path.')
    if Path(request['output']).exists():
        raise ValueError('Refusing to overwrite an existing browser artifact.')
    if request.get('action') == 'download' and (not http_url(request.get('url')) or not http_url(request.get('source_page'))):
        raise ValueError('Download requires a directly observed HTTP media URL and its source_page.')
    target = Path(out).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    helper = (Path(root) / 'assets/material-sourcing/ego-collect.mjs').resolve().as_uri()
    code = 'const {run} = await import(' + json.dumps(helper) + ');\nawait run(' + json.dumps(request, ensure_ascii=False) + ');\n'
    with target.open('x', encoding='utf-8', newline='\n') as stream:
        stream.write(code)
    return {'script': str(target), 'run': 'ego-browser nodejs -e "await import(\'' + target.as_uri() + '\')"',
            'before_running': 'Read ego-browser skill; the script does not create, claim, or finish your TaskSpace.'}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    p = sub.add_parser('plan'); p.add_argument('--script', type=Path, required=True); p.add_argument('--project', type=Path, required=True); p.add_argument('--brief', type=Path)
    p = sub.add_parser('record'); p.add_argument('--plan', type=Path, required=True); p.add_argument('--record', type=Path, required=True)
    p = sub.add_parser('check'); p.add_argument('--plan', type=Path, required=True)
    p = sub.add_parser('export'); p.add_argument('--plan', type=Path, required=True); p.add_argument('--out', type=Path, required=True)
    p = sub.add_parser('ego-script'); p.add_argument('--request', type=Path, required=True); p.add_argument('--out', type=Path, required=True)
    p = sub.add_parser('download'); p.add_argument('--url', required=True); p.add_argument('--source-page', required=True); p.add_argument('--out', type=Path, required=True); p.add_argument('--max-mb', type=float, default=200)
    args = parser.parse_args(argv)
    try:
        if args.command == 'plan':
            raw = args.script.read_bytes()
            source = {'path': str(args.script.resolve()), 'sha256': hashlib.sha256(raw).hexdigest(), 'text': raw.decode('utf-8-sig')}
            plan = build_plan(source, args.project, read(args.brief) if args.brief else None)
            result = {'output': write_new(args.project / 'materials-plan.json', plan), 'units': len(plan['units']), 'searched': False}
        elif args.command == 'record': result = record(args.plan, read(args.record))
        elif args.command == 'check': result = inspect(args.plan)
        elif args.command == 'export': result = export(args.plan, args.out)
        elif args.command == 'download': result = download(args.url, args.out, args.source_page, args.max_mb)
        else: result = ego_script(read(args.request), args.out)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 1 if args.command == 'check' and result['selected_errors'] else 0
    except (ValueError, OSError, KeyError, subprocess.TimeoutExpired) as exc:
        print(json.dumps({'error': str(exc)}, ensure_ascii=False), file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
