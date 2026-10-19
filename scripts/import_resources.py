"""Import complete, immutable local reference snapshots into a new skill."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--base', required=True, type=Path)
    p.add_argument('--gallery', required=True, type=Path)
    a = p.parse_args()
    base = a.base.resolve()
    if not (base/'SKILL.md').is_file(): p.error('Base SKILL.md missing')
    targets = [ROOT/'assets/base-skill', ROOT/'assets/adu-reference']
    if any(v.exists() for v in targets): p.error('Snapshots already exist; use a fresh build directory')
    records=[]
    for src in sorted(base.rglob('*')):
        if src.is_file():
            records.append({'path':src.relative_to(base).as_posix(),'bytes':src.stat().st_size,
                            'sha256':hashlib.sha256(src.read_bytes()).hexdigest()})
    with zipfile.ZipFile(a.gallery) as archive:
        for info in archive.infolist():
            dest=(targets[1]/info.filename).resolve()
            if not dest.is_relative_to(targets[1].resolve()): p.error('Unsafe archive member')
        shutil.copytree(base, targets[0])
        archive.extractall(targets[1])
    manifest={'snapshotDate':'2026-09-30','sourceSkill':'ui-motion-explainer',
              'totalFiles':len(records),'totalBytes':sum(v['bytes'] for v in records),
              'files':records}
    (ROOT/'references/base-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'baseFiles':len(records),'baseBytes':manifest['totalBytes'],
                      'galleryFiles':sum(v.is_file() for v in targets[1].rglob('*'))},ensure_ascii=False))

if __name__=='__main__': main()
