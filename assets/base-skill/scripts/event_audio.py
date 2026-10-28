"""Mix explicitly authored local sound events without retiming the narration.

This module does not find/generate sound, infer event timing, or certify listening.
Canvas projects keep sound_events in timeline.json; other projects use project.json.
"""
import json
import math
from pathlib import Path, PureWindowsPath
import shutil
import subprocess


def number(value, label, minimum=0):
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value < minimum:
        raise ValueError(f'{label} must be a finite number >= {minimum}')
    return float(value)


def local_file(root, value):
    root = Path(root).resolve()
    if not isinstance(value, str) or not value.strip() or ':' in value or Path(value).is_absolute() or PureWindowsPath(value).is_absolute():
        raise ValueError('sound path must be a project-relative local file')
    path = (root / value).resolve()
    if not path.is_relative_to(root):
        raise ValueError('sound path escapes project')
    if not path.is_file():
        raise FileNotFoundError(path)
    return path


def audio_duration(path, ffmpeg):
    sibling = Path(ffmpeg).with_name('ffprobe.exe' if Path(ffmpeg).suffix.lower() == '.exe' else 'ffprobe')
    executable = shutil.which('ffprobe') or (str(sibling) if sibling.is_file() else None)
    if not executable:
        raise RuntimeError('Explicit sound events need existing ffprobe to verify their source ranges')
    result = subprocess.run([executable, '-v', 'error',
                             '-show_entries', 'stream=codec_type,duration:stream_tags=DURATION:format=duration', '-of', 'json', str(path)],
                            check=True, capture_output=True, text=True, encoding='utf-8')
    data = json.loads(result.stdout)
    streams = data.get('streams', [])
    sounds = [stream for stream in streams if stream.get('codec_type') == 'audio']
    if not sounds:
        raise ValueError(f'Sound source has no audio stream: {path.name}')
    candidates = [sounds[0].get('duration')]
    tag = sounds[0].get('tags', {}).get('DURATION')
    if isinstance(tag, str):
        try:
            hours, minutes, seconds = map(float, tag.split(':'))
            candidates.append(hours * 3600 + minutes * 60 + seconds)
        except ValueError:
            pass
    # A container may hold a long video and a short audio track. Its duration
    # cannot stand in for that selected audio track's actual range.
    if len(streams) == 1:
        candidates.append(data.get('format', {}).get('duration'))
    for value in candidates:
        try:
            duration = float(value)
            if math.isfinite(duration) and duration > 0:
                return duration
        except (ValueError, TypeError):
            pass
    raise ValueError(f'Cannot establish sound source duration: {path.name}')


def load_events(root, config, start, end, ffmpeg, probe=audio_duration):
    """Validate ALL authored events, returning only slices audible in this export."""
    start = number(start, 'export start')
    end = number(end, 'export end')
    if end <= start:
        raise ValueError('export end must follow start')
    if config.get('sceneRuntime') == 'canvas-story-v1':
        timeline = json.loads((Path(root) / 'timeline.json').read_text(encoding='utf-8-sig'))
        if config.get('sound_events'):
            raise ValueError('Canvas sound_events belong only in timeline.json; remove competing project sound_events')
        rows = timeline.get('sound_events', [])
        owner = 'timeline.json'
    else:
        rows = config.get('sound_events', [])
        owner = 'project.json'
    if not isinstance(rows, list):
        raise ValueError('sound_events must be an array')
    seen, durations, active = set(), {}, []
    for row in rows:
        if not isinstance(row, dict) or not isinstance(row.get('id'), str) or not row['id'].strip() or row['id'] in seen:
            raise ValueError('Each sound event needs a unique nonempty id')
        seen.add(row['id'])
        for key in ('event_id', 'segment_id'):
            if key in row and (not isinstance(row[key], str) or not row[key].strip()):
                raise ValueError(f'{row["id"]}.{key} must be a nonempty string when supplied')
        at = number(row.get('at'), row['id'] + '.at')
        source_in = number(row.get('source_in'), row['id'] + '.source_in')
        source_out = number(row.get('source_out'), row['id'] + '.source_out')
        gain = number(row.get('gain', 0.3), row['id'] + '.gain')
        if source_out <= source_in or gain > 1:
            raise ValueError('Sound range must be positive and gain must be in 0..1')
        path = local_file(root, row.get('path'))
        if path not in durations:
            durations[path] = probe(path, ffmpeg)
        if source_out > durations[path] + 1e-6:
            raise ValueError(f'{row["id"]}: sound source_out exceeds actual audio duration')
        left, right = max(start, at), min(end, at + source_out - source_in)
        if right <= left:
            continue
        active.append({**{key: row[key] for key in ('id', 'path', 'event_id', 'segment_id') if key in row},
                       'resolved_path': str(path), 'at': left, 'output_offset': left - start,
                       'source_in': source_in + left - at, 'source_out': source_in + right - at,
                       'duration': right - left, 'gain': gain})
    return {'source': owner, 'authored_count': len(rows), 'active': active}


def mix_command(ffmpeg, silent, output, start, end, events, master=None, master_offset=0):
    """Create a deterministic mux; event sources are trim/delay only, never sped up."""
    duration = end - start
    if not events:
        raise ValueError('mix_command needs active sound events; use the legacy mux otherwise')
    command = [str(ffmpeg), '-y', '-v', 'error', '-i', str(silent)]
    filters, labels = [], []
    index = 1
    if master is not None:
        command += ['-ss', str(start + master_offset), '-i', str(master)]
        filters.append(f'[{index}:a:0]asetpts=PTS-STARTPTS,apad,atrim=duration={duration:.9f}[master]')
        labels.append('[master]')
        index += 1
    for i, event in enumerate(events):
        command += ['-i', event['resolved_path']]
        delay = round(event['output_offset'] * 48000)
        filters.append(f'[{index}:a:0]atrim=start={event["source_in"]:.9f}:end={event["source_out"]:.9f},'
                       f'asetpts=PTS-STARTPTS,volume={event["gain"]:.9f},aresample=48000,'
                       f'adelay={delay}S:all=1,apad,atrim=duration={duration:.9f}[sound{i}]')
        labels.append(f'[sound{i}]')
        index += 1
    filters.append(''.join(labels) + f'amix=inputs={len(labels)}:duration=longest:normalize=0:dropout_transition=0[mix]')
    command += ['-filter_complex', ';'.join(filters), '-map', '0:v:0', '-map', '[mix]',
                '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', str(duration),
                '-movflags', '+faststart', str(output)]
    return command


def event_report(plan, rendered):
    return {'source': plan['source'], 'authoredCount': plan['authored_count'],
            'activeCount': len(plan['active']), 'mixed': bool(rendered and plan['active']),
            'events': [{key: value for key, value in row.items() if key != 'resolved_path'} for row in plan['active']],
            'previewSupport': 'export-only; browser preview plays original narration',
            'masterGain': 1, 'normalization': False, 'listeningReview': False}
