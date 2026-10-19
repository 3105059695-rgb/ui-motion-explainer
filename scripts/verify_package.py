"""Verify the current release, not obsolete hashes from private historical snapshots."""
import argparse
import json
from pathlib import Path
import sys

from release_manifest import verify_release

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--installed', action='store_true', help='Permit additional local user files')
    args = parser.parse_args()
    try:
        report = verify_release(args.root, exact=not args.installed)
    except (ValueError, KeyError, OSError) as error:
        print(json.dumps({'ok': False, 'error': str(error)}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0

if __name__ == '__main__':
    sys.exit(main())
