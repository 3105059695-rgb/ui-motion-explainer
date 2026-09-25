#!/usr/bin/env python3
"""Verify an extracted Release using its file hash manifest."""
import argparse
import hashlib
import json
from pathlib import Path

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('directory',type=Path)
    a=p.parse_args()
    root=a.directory.resolve()
    manifest=json.loads((root/'package-manifest.json').read_text(encoding='utf-8'))
    failures=[]
    for name,expected in manifest['files'].items():
        path=(root/name).resolve()
        if root not in path.parents or not path.is_file():failures.append(name);continue
        if hashlib.sha256(path.read_bytes()).hexdigest()!=expected:failures.append(name)
    print(json.dumps({'version':manifest['version'],'checked':len(manifest['files']),'failures':failures}))
    if failures:raise SystemExit(1)

if __name__=='__main__':main()
