#!/usr/bin/env python3
"""Create WOFF2 subsets for all text supplied by a local video project."""

import argparse
import sys
import unicodedata
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--text', action='append', required=True, type=Path,
                        help='UTF-8 source containing visible text; repeat for captions/data')
    parser.add_argument('--regular-font', required=True, type=Path)
    parser.add_argument('--bold-font', required=True, type=Path)
    parser.add_argument('--fallback-font', type=Path,
                        help='Optional font covering symbols missing from the two main fonts')
    parser.add_argument('--font-index', type=int, default=0)
    parser.add_argument('--out', required=True, type=Path)
    parser.add_argument('--deps-path', type=Path)
    parser.add_argument('--overwrite', action='store_true')
    args = parser.parse_args()
    if args.font_index < 0:
        parser.error('--font-index must be nonnegative')
    if args.deps_path:
        sys.path.insert(0, str(args.deps_path.resolve()))
    try:
        from fontTools import subset
        from fontTools.ttLib import TTFont
        import brotli  # noqa: F401 - required by the WOFF2 writer
    except ImportError:
        parser.exit(2, 'Missing fonttools/brotli. Install them in the task environment or pass --deps-path.\n')

    content = '\n'.join(p.read_text(encoding='utf-8-sig') for p in args.text)
    # Include a plain space and skip controls, separators, variation selectors.
    points = {ord(c) for c in content if not unicodedata.category(c).startswith(('C', 'Z'))
              and not (0xFE00 <= ord(c) <= 0xFE0F or 0xE0100 <= ord(c) <= 0xE01EF)} | {32}
    targets = [(args.regular_font, args.out / 'Chinese-regular.woff2'),
               (args.bold_font, args.out / 'Chinese-bold.woff2')]
    if args.fallback_font:
        targets.append((args.fallback_font, args.out / 'Chinese-fallback.woff2'))
    for source, target in targets:
        if not source.is_file():
            parser.error(f'Font does not exist: {source}')
        if source.resolve() == target.resolve():
            parser.error('Source font and output must differ')
        if target.exists() and not args.overwrite:
            parser.error(f'Output exists: {target}. Use a new directory or explicit --overwrite.')

    fonts = []
    try:
        coverage = []
        for index, (source, target) in enumerate(targets):
            font = TTFont(str(source), fontNumber=args.font_index if index < 2 else 0)
            available = set(font.getBestCmap() or {})
            fonts.append((font, target, points & available))
            coverage.append(available)
        missing = (points - coverage[0]) | (points - coverage[1])
        if args.fallback_font:
            missing -= coverage[2]
        if missing:
            missing = sorted(missing)
            labels = ', '.join(f'U+{cp:04X} {chr(cp)!r}' for cp in missing[:24])
            parser.error(f'Main fonts and optional fallback lack {len(missing)} characters: {labels}. '
                         'Choose a covering font, pass --fallback-font, or supply clean visible-text input.')
        args.out.mkdir(parents=True, exist_ok=True)
        for font, target, selected in fonts:
            opts = subset.Options()
            opts.flavor = 'woff2'
            sub = subset.Subsetter(options=opts)
            sub.populate(unicodes=selected)
            sub.subset(font)
            font.flavor = 'woff2'
            temp = target.with_name(target.name + '.tmp')
            try:
                font.save(str(temp))
                temp.replace(target)
            finally:
                temp.unlink(missing_ok=True)
            print(f'{target}: {target.stat().st_size:,} bytes; {len(selected)} code points')
    finally:
        for font, _, _ in fonts:
            font.close()


if __name__ == '__main__':
    main()
