"""Verify the current release, not obsolete hashes from private historical snapshots."""
import argparse
import json
from pathlib import Path
import sys

from release_manifest import verify_release
from reference_readiness import report as reference_status

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--root', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--installed', action='store_true', help='Permit additional local user files')
    parser.add_argument('--references', action='store_true', help='Require the approved visual references and complete design demo media.')
    args = parser.parse_args()
    try:
        report = verify_release(args.root, exact=not args.installed)
        if (args.root / 'references/capability-catalog.json').is_file():
            from capability_catalog import readiness
            report['production_readiness'] = readiness(args.root)
        report['reference_readiness'] = reference_status(args.root)
    except (ValueError, KeyError, OSError) as error:
        print(json.dumps({'ok': False, 'error': str(error)}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if report.get('production_readiness', {}).get('ready') is False:
        return 2
    if args.references and report['reference_readiness']['required'] and not report['reference_readiness']['ready']:
        return 2
    return 0

if __name__ == '__main__':
    sys.exit(main())
