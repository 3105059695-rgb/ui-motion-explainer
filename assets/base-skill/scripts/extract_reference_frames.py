#!/usr/bin/env python3
"""Extract exact requested video positions and create labelled contact sheets."""

import argparse
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('out', type=Path)
    parser.add_argument('--times', required=True, help='Comma-separated seconds')
    parser.add_argument('--prefix', default='reference')
    parser.add_argument('--cols', type=int, default=4)
    parser.add_argument('--width', type=int, default=400)
    parser.add_argument('--ffmpeg', default='ffmpeg')
    parser.add_argument('--font', type=Path)
    parser.add_argument('--deps-path', type=Path)
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    if not args.source.is_file():
        parser.error(f'Video does not exist: {args.source}')
    if not re.fullmatch(r'[A-Za-z0-9_-]+', args.prefix):
        parser.error('--prefix must contain only letters, digits, _ or -')
    if not 1 <= args.cols <= 8 or not 160 <= args.width <= 1920:
        parser.error('--cols must be 1..8 and --width 160..1920')
    try:
        times = sorted(set(float(value.strip()) for value in args.times.split(',')))
        if not times or any(not math.isfinite(t) or t < 0 for t in times):
            raise ValueError()
    except ValueError:
        parser.error('--times requires finite, nonnegative seconds')
    ffmpeg = shutil.which(args.ffmpeg)
    if not ffmpeg:
        parser.error('FFmpeg not found; add it to PATH or pass --ffmpeg')
    if args.deps_path:
        sys.path.insert(0, str(args.deps_path.resolve()))
    try:
        from PIL import Image, ImageDraw, ImageFont, ImageOps
    except ImportError:
        parser.exit(2, 'Missing Pillow. Install it in the task environment or pass --deps-path.\n')

    frames = [args.out / f'{args.prefix}_{i:03d}_{t:010.4f}.jpg' for i, t in enumerate(times)]
    sheets = [args.out / f'{args.prefix}_sheet_{i + 1}.jpg'
              for i in range(math.ceil(len(times) / 24))]
    for target in frames + sheets:
        if target.resolve() == args.source.resolve():
            parser.error('Source and output must differ')
        if target.exists() and not args.overwrite:
            parser.error(f'Output exists: {target}. Use a new prefix/directory or --overwrite.')
    args.out.mkdir(parents=True, exist_ok=True)
    font = ImageFont.truetype(str(args.font), 19) if args.font else ImageFont.load_default()
    for t, target in zip(times, frames):
        # -ss after -i decodes to the requested position instead of relying on keyframe timestamps.
        temp = target.with_name(target.stem + '.tmp.jpg')
        try:
            subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
                            '-i', str(args.source), '-ss', str(t), '-frames:v', '1',
                            '-q:v', '2', str(temp)], check=True)
            if not temp.is_file() or not temp.stat().st_size:
                parser.error(f'No frame at {t:g}s; check source duration')
            temp.replace(target)
        finally:
            temp.unlink(missing_ok=True)
    with Image.open(frames[0]) as first:
        height = round(args.width * first.height / first.width)
    for page, dest in enumerate(sheets):
        first = page * 24
        page_frames = list(zip(times, frames))[first:first + 24]
        canvas = Image.new('RGB', (args.cols * args.width,
                                  math.ceil(len(page_frames) / args.cols) * (height + 30)), '#15191e')
        draw = ImageDraw.Draw(canvas)
        for n, (t, target) in enumerate(page_frames):
            x, y = (n % args.cols) * args.width, (n // args.cols) * (height + 30)
            with Image.open(target) as frame:
                thumb = ImageOps.contain(frame.convert('RGB'), (args.width, height))
                canvas.paste(thumb, (x + (args.width - thumb.width) // 2, y + 30))
            draw.text((x + 8, y + 6), f'{int(t // 60):02d}:{t % 60:06.3f}',
                      font=font, fill='white')
        canvas.save(dest, quality=90)
        print(dest)


if __name__ == '__main__':
    main()
