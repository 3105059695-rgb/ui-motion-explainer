#!/usr/bin/env python3
"""Import one already edited talk video without speech recognition or raw-clip matching.

Writes talk/clip_000/f_*.jpg, talkmap.js, voice.wav and import.json. Replaces
only the empty talkmap.js stub created by pipeline new. Other media are protected.
Does not rewrite the creative timeline in config.js/scenes.js.
"""
import argparse
import json
import math
from pathlib import Path
import shutil
import subprocess
import tempfile


def run(args):
    result = subprocess.run([str(a) for a in args], capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.returncode:
        raise RuntimeError(f'{args[0]} failed: {result.stderr[-4000:]}')
    return result.stdout


def validate_crop(crop, stream):
    """A crop is an explicit source-pixel decision; never infer a face location."""
    if crop is None:
        return None
    if len(crop) != 4 or any(type(value) is not int for value in crop):
        raise ValueError('--crop requires integer x y width height')
    x, y, width, height = crop
    source_width, source_height = stream.get('width'), stream.get('height')
    if not isinstance(source_width, int) or not isinstance(source_height, int):
        raise ValueError('Cannot validate crop without source video width and height')
    if min(x, y) < 0 or min(width, height) < 2 or x + width > source_width or y + height > source_height:
        raise ValueError(f'Crop {crop} is outside source {source_width}x{source_height}')
    rotations = [row.get('rotation', 0) for row in stream.get('side_data_list', [])]
    rotations.append((stream.get('tags') or {}).get('rotate', 0))
    if any(float(value or 0) % 360 for value in rotations):
        raise ValueError('Explicit source-pixel crop requires an upright video without rotation metadata; prepare and inspect its orientation first')
    return {'x': x, 'y': y, 'width': width, 'height': height}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('project', type=Path)
    ap.add_argument('video', type=Path)
    ap.add_argument('--fps', type=int, default=60, help='project frame clock; default 60')
    ap.add_argument('--size', default='720x1280', help='frame box; preserves aspect ratio with padding')
    ap.add_argument('--crop', type=int, nargs=4, metavar=('X', 'Y', 'WIDTH', 'HEIGHT'),
                    help='explicit source-video pixel crop before scale/pad; default keeps the complete frame')
    a = ap.parse_args()
    project, video = a.project.expanduser().resolve(), a.video.expanduser().resolve()
    if not project.is_dir() or not video.is_file(): ap.error('project folder and input video must exist')
    try:
        width, height = map(int, a.size.split('x'))
        if not 1 <= a.fps <= 120 or min(width, height) < 2: raise ValueError()
    except ValueError:
        ap.error('--fps must be 1..120; --size must be positive WIDTHxHEIGHT')
    for tool in ('ffmpeg', 'ffprobe'):
        if not shutil.which(tool): ap.error(f'{tool} is required')
    talk, mapping = project / 'talk', project / 'talkmap.js'
    stub = '// Optional data absent. Generated data may replace this stub.'
    if talk.exists() and (not talk.is_dir() or any(talk.iterdir())): ap.error('talk/ already contains media; import into a fresh project')
    if talk.is_symlink() or mapping.is_symlink(): ap.error('refusing a linked media directory or map')
    if mapping.exists() and mapping.read_text(encoding='utf-8').strip() != stub: ap.error('talkmap.js already contains project data; use a fresh project')
    for name in ('voice.wav', 'import.json'):
        target = project / name
        if target.exists() or target.is_symlink(): ap.error(f'{name} already exists; use a fresh project')
    probe = json.loads(run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', video]))
    stream = next((s for s in probe.get('streams', []) if s.get('codec_type') == 'video'), {})
    try:
        crop = validate_crop(a.crop, stream)
    except ValueError as exc:
        ap.error(str(exc))
    if not any(s.get('codec_type') == 'audio' for s in probe.get('streams', [])): ap.error('input has no audio; provide a talking-head clip with narration')
    duration = float(stream.get('duration') or probe.get('format', {}).get('duration') or 0)
    if not math.isfinite(duration) or duration <= 0: ap.error('input video has no finite positive duration')
    count = math.floor(duration * a.fps + .5)
    if count < 1: ap.error('input video is too short')
    duration = count / a.fps
    report = dict(source=str(video), frames=count, fps=a.fps, duration=duration,
                  frame_width=width, frame_height=height, subtitles='not generated',
                  source_width=stream.get('width'), source_height=stream.get('height'),
                  presenterCrop=crop, voice_crop='none',
                  next_step='Set CONFIG.demo=false, CONFIG.fps=fps, CONFIG.end=duration; author scenes/race/captions for this clip. No creative timeline was rewritten.')
    with tempfile.TemporaryDirectory(prefix='adu-talk-import-') as temporary:
        work = Path(temporary)
        sequence = work / 'talk' / 'clip_000'
        sequence.mkdir(parents=True)
        vf = (f'fps={a.fps},scale={width}:{height}:force_original_aspect_ratio=decrease:flags=lanczos,'
              f'pad={width}:{height}:(ow-iw)/2:(oh-ih)/2,tpad=stop_mode=clone:stop_duration={1/a.fps}')
        if crop:
            vf = f'crop={crop["width"]}:{crop["height"]}:{crop["x"]}:{crop["y"]}:exact=1,' + vf
        run(['ffmpeg', '-v', 'error', '-n', '-i', video, '-map', '0:v:0', '-vf', vf,
             '-frames:v', count, '-q:v', '3', sequence / 'f_%05d.jpg'])
        if len(list(sequence.glob('f_*.jpg'))) != count: raise RuntimeError('Extracted frame count mismatch')
        run(['ffmpeg', '-v', 'error', '-n', '-i', video, '-map', '0:a:0', '-vn',
             '-af', f'apad,atrim=duration={duration}', '-ar', '48000', '-ac', '2', '-c:a', 'pcm_s16le', work / 'voice.wav'])
        data = 'const TALKF=["clip_000"];const TALKMAP=' + json.dumps([[0, i+1] for i in range(count)], separators=(',', ':')) + ';\n'
        (work / 'talkmap.js').write_text(data, encoding='utf-8')
        (work / 'import.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        # Preflight again before publishing; old media are never replaced.
        if talk.exists() and any(talk.iterdir()): raise RuntimeError('talk/ changed while importing')
        if mapping.exists() and mapping.read_text(encoding='utf-8').strip() != stub: raise RuntimeError('talkmap.js changed while importing')
        created = []
        talk_was_absent = not talk.exists()
        try:
            talk.mkdir(exist_ok=True)
            created.append(talk / 'clip_000')
            shutil.copytree(sequence, talk / 'clip_000')
            for name in ('voice.wav', 'import.json'):
                with (project / name).open('xb') as dst, (work / name).open('rb') as src:
                    created.append(project / name)
                    shutil.copyfileobj(src, dst)
            mapping.write_text(data, encoding='utf-8')
        except Exception:
            for item in reversed(created):
                if item.is_dir(): shutil.rmtree(item)
                else: item.unlink(missing_ok=True)
            if talk_was_absent and talk.is_dir() and not any(talk.iterdir()): talk.rmdir()
            raise
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    try:
        main()
    except (OSError, RuntimeError, ValueError) as exc:
        raise SystemExit(f'Import failed: {exc}') from exc
