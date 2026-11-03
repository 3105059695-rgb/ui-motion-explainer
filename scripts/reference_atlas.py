"""Build full-span video contact sheets with exact sampled-frame timecodes.

Original video frames are decoded through FFmpeg pipes. No individual frames,
models, runtimes or source videos are copied into the atlas. This is a visual
index, not a claim that a person or model watched every frame of the source.
"""
from __future__ import annotations

import argparse
from collections import deque
import hashlib
import json
import math
from pathlib import Path
import queue
import re
import shutil
import subprocess
import sys
import threading

from PIL import Image, ImageDraw, ImageFont

SCHEMA = 1
ALGORITHM = 'full-span-select-v1'
PAGE_FRAMES = 60
PUBLIC_FIELDS = ('id', 'title', 'categories', 'scope', 'resource_id', 'approval', 'approval_scope', 'usage',
                 'privacy', 'approved_ranges', 'excluded_ranges', 'source_url', 'source_page', 'remote_url', 'evidence')
HEADER = 76
LABEL = 28
GAP = 6


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8-sig'))


def write_json(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + '.writing')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    temporary.replace(path)


def slug(ident):
    name = re.sub('[^a-zA-Z0-9_-]+', '-', ident).strip('-')[:64] or 'reference'
    return name + '-' + hashlib.sha256(ident.encode('utf-8')).hexdigest()[:10]


def stamp(seconds):
    millis = round(max(0, seconds) * 1000)
    h, millis = divmod(millis, 3600000)
    m, millis = divmod(millis, 60000)
    s, millis = divmod(millis, 1000)
    return f'{h:02}:{m:02}:{s:02}.{millis:03}'


def find_font(size):
    for candidate in ('C:/Windows/Fonts/msyh.ttc', 'C:/Windows/Fonts/arial.ttf',
                      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default(size=size)


def probe(source):
    run = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                          '-show_entries', 'stream=width,height,duration,avg_frame_rate:format=duration',
                          '-of', 'json', str(source)], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if run.returncode:
        raise ValueError('ffprobe failed: ' + run.stderr.strip()[-1200:])
    data = json.loads(run.stdout)
    if not data.get('streams'):
        raise ValueError('No video stream')
    stream = data['streams'][0]
    try:
        duration = float(stream.get('duration', data.get('format', {}).get('duration')))
    except (ValueError, TypeError):
        duration = float(data.get('format', {}).get('duration', 0))
    if not math.isfinite(duration) or duration <= 0:
        raise ValueError('Video duration must be positive and finite')
    try:
        a, b = stream.get('avg_frame_rate', '25/1').split('/')
        fps = float(a) / float(b)
    except (ValueError, ZeroDivisionError):
        fps = 25
    if not math.isfinite(fps) or fps <= 0:
        fps = 25
    return {'duration_seconds': duration, 'width': int(stream['width']),
            'height': int(stream['height']), 'fps': fps}


def geometry_filter(width, height):
    return f'scale={width}:{height}:force_original_aspect_ratio=decrease:flags=bilinear,pad={width}:{height}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1'


def _read_frame(stream, length):
    pieces, remaining = [], length
    while remaining:
        value = stream.read(remaining)
        if not value:
            break
        pieces.append(value)
        remaining -= len(value)
    if remaining and pieces:
        raise ValueError('FFmpeg ended inside a raw frame')
    return b''.join(pieces)


def decoded_samples(source, interval, width, height):
    """Yield actual selected source PTS alongside RGB thumbnails, one decoder."""
    timestamps = queue.Queue()
    messages = deque(maxlen=25)
    selection = f"select='isnan(prev_selected_t)+gte(t-prev_selected_t,{interval:.9f})'"
    command = ['ffmpeg', '-hide_banner', '-nostdin', '-nostats', '-loglevel', 'info',
               '-i', str(source), '-map', '0:v:0', '-an', '-sn',
               '-vf', 'setpts=PTS-STARTPTS,' + selection + ',' + geometry_filter(width, height) + ',showinfo',
               '-fps_mode', 'passthrough', '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1']
    process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    def collect():
        for raw in iter(process.stderr.readline, b''):
            line = raw.decode('utf-8', 'replace')
            match = re.search(r'\bn:\s*\d+\s+pts:.*?pts_time:\s*([-+\d.eE]+)', line)
            if match:
                timestamps.put(float(match.group(1)))
            else:
                messages.append(line.strip())
    reader = threading.Thread(target=collect, daemon=True)
    reader.start()
    try:
        while True:
            raw = _read_frame(process.stdout, width * height * 3)
            if not raw:
                break
            try:
                seconds = timestamps.get(timeout=30)
            except queue.Empty as exc:
                raise ValueError('Missing timestamp for decoded source frame') from exc
            yield seconds, Image.frombytes('RGB', (width, height), raw), 'decoded-source-pts'
        if process.wait() != 0:
            raise ValueError('FFmpeg sample decoding failed: ' + '\n'.join(messages)[-1800:])
    finally:
        if process.poll() is None:
            process.kill()
            process.wait()
        reader.join(timeout=5)
        process.stdout.close()
        process.stderr.close()


def tail_sample(source, duration, fps, width, height):
    """Include the ending even when the regular grid stops just before it."""
    for offset in (max(1 / fps, .05), .25, 1.0):
        at = max(0.0, duration - offset)
        run = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-loglevel', 'error',
                              '-ss', f'{at:.9f}', '-i', str(source), '-map', '0:v:0', '-an', '-sn',
                              '-frames:v', '1', '-vf', geometry_filter(width, height),
                              '-pix_fmt', 'rgb24', '-f', 'rawvideo', 'pipe:1'], capture_output=True)
        if run.returncode == 0 and len(run.stdout) == width * height * 3:
            return at, Image.frombytes('RGB', (width, height), run.stdout), 'ending-seek-target'
    raise ValueError('Could not decode an ending frame')


def make_sheet(samples, output, title, subtitle, columns, width, height):
    rows = math.ceil(len(samples) / columns)
    page_width = columns * width + (columns + 1) * GAP
    page_height = HEADER + rows * (height + LABEL + GAP) + GAP
    sheet = Image.new('RGB', (page_width, page_height), '#151821')
    draw = ImageDraw.Draw(sheet)
    heading_font, label_font = find_font(23), find_font(18)
    # Avoid clipping very long original filenames into the image header.
    displayed = title
    while displayed and draw.textlength(displayed + '…', font=heading_font) > page_width - 24:
        displayed = displayed[:-1]
    if displayed != title:
        displayed += '…'
    draw.text((12, 7), displayed, fill='white', font=heading_font)
    draw.text((12, 41), subtitle, fill='#D6C2FF', font=label_font)
    cells = []
    for index, (seconds, frame, timestamp_kind) in enumerate(samples):
        x = GAP + (index % columns) * (width + GAP)
        y = HEADER + (index // columns) * (height + LABEL + GAP)
        sheet.paste(frame, (x, y))
        draw.text((x + 5, y + height + 2), stamp(seconds), fill='white', font=label_font)
        cells.append({'index': index, 'seconds': round(seconds, 6), 'timestamp_kind': timestamp_kind,
                      'x': x, 'y': y, 'w': width, 'h': height})
    temporary = Path(output).with_suffix('.writing')
    sheet.save(temporary, format='JPEG', quality=85, optimize=True, subsampling=0)
    temporary.replace(output)
    return {'file': Path(output).name, 'columns': columns, 'rows': rows, 'tile_width': width,
            'tile_height': height, 'header_height': HEADER, 'label_height': LABEL, 'gap': GAP,
            'width': page_width, 'height': page_height, 'cells': cells,
            'start_seconds': cells[0]['seconds'], 'end_seconds': cells[-1]['seconds']}


def source_fingerprint(source, options):
    info = source.stat()
    value = {'path': str(source.resolve()), 'size': info.st_size, 'mtime_ns': info.st_mtime_ns,
             'algorithm': ALGORITHM, **options}
    return hashlib.sha256(json.dumps(value, sort_keys=True).encode('utf-8')).hexdigest()


def build_video(row, output, interval=2.0, overview_frames=96, tile_width=320):
    public = {key: row[key] for key in PUBLIC_FIELDS if key in row}
    public.setdefault('title', row['id'])
    if not row.get('path'):
        return {**public, 'status': 'missing', 'error': 'No local source file is registered; remote references were not downloaded'}
    source = Path(row['path']).expanduser().resolve()
    if not source.is_file():
        return {**public, 'status': 'missing', 'error': 'Registered source file is unavailable'}
    directory = Path(output) / slug(row['id'])
    options = {'interval_seconds': interval, 'overview_frames': overview_frames, 'tile_width': tile_width}
    fingerprint = source_fingerprint(source, options)
    record_path = directory / 'index.json'
    if record_path.is_file():
        previous = read_json(record_path)
        files = [previous.get('overview', {}).get('file'), *[page['file'] for page in previous.get('detail_pages', [])]]
        if (previous.get('status') == 'ready' and previous.get('source_fingerprint') == fingerprint
                and previous.get('title') == public['title'] and files
                and all(name and (directory / name).is_file() for name in files)):
            cached = {**previous, **public, 'directory': directory.name, 'cached': True}
            write_json(record_path, cached)
            return cached
    directory.mkdir(parents=True, exist_ok=True)
    facts = probe(source)
    duration = facts['duration_seconds']
    effective_interval = interval
    height = max(2, round(tile_width * 9 / 16))
    tail = tail_sample(source, duration, facts['fps'], tile_width, height)
    targets = [tail[0] * i / (overview_frames - 1) for i in range(overview_frames)] if overview_frames > 1 else [0]
    overview, page, pages, selected_times = [], [], [], []
    previous = None
    overview_next = 0

    def append(sample):
        nonlocal previous, overview_next
        seconds = sample[0]
        while overview_next < len(targets) and targets[overview_next] <= seconds:
            chosen = previous if previous is not None and abs(previous[0] - targets[overview_next]) <= abs(seconds - targets[overview_next]) else sample
            overview.append((chosen[0], chosen[1].copy(), chosen[2]))
            overview_next += 1
        page.append(sample)
        selected_times.append(seconds)
        previous = sample
        if len(page) == PAGE_FRAMES:
            flush()

    def flush():
        if not page:
            return
        number = len(pages) + 1
        subtitle = f'{stamp(page[0][0])} — {stamp(page[-1][0])} / {stamp(duration)} · 细读 {number:03d}'
        pages.append(make_sheet(page, directory / f'detail-{number:03d}.jpg', public['title'], subtitle, 6, tile_width, height))
        page.clear()
        if number % 5 == 0:
            print(json.dumps({'progress': row['id'], 'through_seconds': round(selected_times[-1], 2), 'duration_seconds': duration, 'detail_pages': number}, ensure_ascii=False), flush=True)

    for sample in decoded_samples(source, effective_interval, tile_width, height):
        # Keep timeline order when container duration and final selected PTS differ slightly.
        if sample[0] <= tail[0] + .000001:
            append(sample)
    if not selected_times or tail[0] - selected_times[-1] > .000001:
        append(tail)
    while overview_next < len(targets):
        overview.append((tail[0], tail[1].copy(), tail[2])); overview_next += 1
    flush()
    # A low-frame-rate short clip may map multiple overview targets to one frame.
    distinct = []
    for sample in overview:
        if not distinct or abs(sample[0] - distinct[-1][0]) > .000001:
            distinct.append(sample)
    overview_meta = make_sheet(distinct, directory / 'overview.jpg', public['title'],
                               f'全片总览 · {stamp(0)} — {stamp(duration)} · {len(distinct)} 格 · 按时间浏览，不等于逐帧观看',
                               min(8, len(distinct)), tile_width, height)
    gaps = [round(b - a, 6) for a, b in zip(selected_times, selected_times[1:])]
    result = {**public, **facts, 'status': 'ready', 'directory': directory.name,
              'source_fingerprint': fingerprint, 'cached': False,
              'overview': overview_meta, 'detail_pages': pages,
              'sampling': {'requested_interval_seconds': interval, 'effective_interval_seconds': effective_interval,
                           'selected_frame_count': len(selected_times), 'overview_frame_count': len(distinct),
                           'policy': 'Full source decoded in time order; select first frame then first frame at least one interval later; ending seek added explicitly. Actual selected PTS label detail cells; ending label is seek target.',
                           'not_every_source_frame': True},
              'coverage': {'first_seconds': selected_times[0], 'last_seconds': selected_times[-1],
                           'duration_seconds': duration, 'maximum_sample_gap_seconds': max(gaps, default=0),
                           'ending_gap_seconds': duration - selected_times[-1], 'full_timeline_span': True,
                           'gap_seconds': gaps},
              'viewing_claim': 'Generated visual index only; not evidence of full-speed viewing, understanding or actual production reuse.'}
    write_json(record_path, result)
    return result


def build(catalog, output, interval=2.0, overview_frames=96, tile_width=320):
    if not math.isfinite(interval) or interval <= 0 or not 2 <= overview_frames <= 240 or not 120 <= tile_width <= 960:
        raise ValueError('interval must be positive; overview-frames 2..240; tile-width 120..960')
    for tool in ('ffmpeg', 'ffprobe'):
        if not shutil.which(tool):
            raise ValueError('Existing ' + tool + ' is required; no runtime is downloaded')
    catalog_path, output = Path(catalog).resolve(), Path(output).resolve()
    data = read_json(catalog_path)
    rows = data if isinstance(data, list) else data.get('references', data.get('videos', []))
    if not isinstance(rows, list) or not rows:
        raise ValueError('Catalog must contain a nonempty references/videos array')
    ids = set()
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get('id'), str) or not row['id'] or row['id'] in ids or (row.get('path') is not None and not isinstance(row.get('path'), str)):
            raise ValueError('Every catalog entry needs a unique id and local path')
        ids.add(row['id'])
    # Short approved examples become available first; very long tutorials follow.
    rows = sorted(rows, key=lambda row: float(row.get('duration_seconds') or 0) > 1800)
    output.mkdir(parents=True, exist_ok=True)
    result = {'schema_version': SCHEMA, 'algorithm': ALGORITHM, 'references': [],
              'catalog_count': len(rows), 'pending_ids': [row['id'] for row in rows], 'build_complete': False,
              'scope': 'Full-span sampled contact sheets; selected sequences still require detailed source viewing.'}
    private = {'schema_version': SCHEMA, 'sources': {}}
    for row in rows:
        if row.get('path'):
            source = Path(row['path']).expanduser()
            if not source.is_absolute():
                source = catalog_path.parent / source
            row = {**row, 'path': str(source.resolve())}
        else:
            row = {**row, 'path': None}
        private['sources'][row['id']] = {'path': row['path']}
        try:
            # Short demonstrations need enough poses to reveal the action chain.
            duration_hint = float(row.get('duration_seconds') or 0)
            if duration_hint <= 0 and row.get('path') and Path(row['path']).is_file():
                duration_hint = probe(Path(row['path']))['duration_seconds']
            default_interval = min(interval, .25) if 0 < duration_hint <= 60 else interval
            chosen_interval = float(row.get('suggested_interval_seconds', default_interval))
            if not math.isfinite(chosen_interval) or chosen_interval <= 0:
                raise ValueError('Per-video sampling interval must be positive and finite')
            record = build_video(row, output, chosen_interval, overview_frames, tile_width)
        except (OSError, ValueError, subprocess.SubprocessError) as exc:
            # Keep full diagnostics private; public atlas never leaks local paths.
            private['sources'][row['id']]['error'] = str(exc)
            record = {key: row[key] for key in PUBLIC_FIELDS if key in row}
            record.update(status='error', error='Source extraction failed; see private build diagnostics')
        result['references'].append(record)
        result['pending_ids'].remove(row['id'])
        result['build_complete'] = not result['pending_ids']
        result['summary'] = {state: sum(r['status'] == state for r in result['references']) for state in ('ready', 'missing', 'error')}
        write_json(output / 'manifest.json', result)
        write_json(output / 'sources.local.json', private)
        print(json.dumps({'id': row['id'], 'status': record['status'], 'cached': record.get('cached', False),
                          'frames': record.get('sampling', {}).get('selected_frame_count'),
                          'detail_pages': len(record.get('detail_pages', []))}, ensure_ascii=False), flush=True)
    return result


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='action', required=True)
    command = sub.add_parser('build')
    command.add_argument('--catalog', required=True, type=Path)
    command.add_argument('--out', required=True, type=Path)
    command.add_argument('--interval', type=float, default=2.0)
    command.add_argument('--overview-frames', type=int, default=96)
    command.add_argument('--tile-width', type=int, default=320)
    args = parser.parse_args(argv)
    try:
        result = build(args.catalog, args.out, args.interval, args.overview_frames, args.tile_width)
    except (OSError, ValueError) as exc:
        parser.error(str(exc))
    print(json.dumps(result['summary'], ensure_ascii=False))
    return 1 if result['summary']['error'] else 0


if __name__ == '__main__':
    raise SystemExit(main())
