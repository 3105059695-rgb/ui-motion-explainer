"""Build a checked portable ZIP from an explicitly finalized release manifest."""
import argparse
import json
from pathlib import Path
import zipfile

from release_manifest import MANIFEST, checked_path, read_manifest, verify_release


def package(root: Path, output: Path) -> dict:
    root, output = root.resolve(), output.resolve()
    if output.exists():
        raise ValueError('Output already exists; select a new archive name')
    if output.is_relative_to(root):
        raise ValueError('Archive must be outside the skill directory')
    report = verify_release(root)
    rows = read_manifest(root)['files']
    with output.open('xb') as stream:
        with zipfile.ZipFile(stream, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
            for name in [*[row['path'] for row in rows], MANIFEST]:
                archive.write(checked_path(root, name), 'ui-motion-fusion/' + name)
    with zipfile.ZipFile(output) as archive:
        bad = archive.testzip()
        if bad:
            raise ValueError('ZIP CRC error: ' + bad)
    return {**report, 'archive': str(output), 'archive_bytes': output.stat().st_size}

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--out', required=True, type=Path)
    args = parser.parse_args()
    try:
        print(json.dumps(package(args.root, args.out), ensure_ascii=False, indent=2))
    except (ValueError, OSError) as error:
        parser.exit(1, str(error) + '\n')

if __name__ == '__main__':
    main()
