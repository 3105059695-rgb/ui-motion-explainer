#!/usr/bin/env python3
"""Build a portable release from public Git files, with per-file hashes."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import zipfile

ROOT=Path(__file__).resolve().parents[1]

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',required=True,type=Path)
    a=p.parse_args()
    version=(ROOT/'VERSION').read_text().strip()
    a.out.mkdir(parents=True,exist_ok=True)
    target=a.out/f'ui-motion-explainer-{version}.zip'
    if target.exists():p.error('Release already exists; choose a new output directory')
    paths=subprocess.check_output(['git','-C',str(ROOT),'ls-files','--cached','--others','--exclude-standard','-z']).decode('utf-8').split('\0')
    files=[]
    for name in sorted(set(paths)):
        if not name:continue
        rel=Path(name)
        if any(part in {'.git','.venv','node_modules','__pycache__','dist'} for part in rel.parts):continue
        if rel.name.startswith('.env') and rel.name!='.env.example':continue
        src=ROOT/rel
        if not src.is_file():raise RuntimeError('Missing public file: '+name)
        if src.is_symlink():raise RuntimeError('Symlinks are not portable release assets: '+name)
        files.append((rel.as_posix(),src))
    manifest={'version':version,'files':{name:hashlib.sha256(src.read_bytes()).hexdigest() for name,src in files}}
    with zipfile.ZipFile(target,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for name,src in files:z.write(src,'ui-motion-explainer/'+name)
        z.writestr('ui-motion-explainer/package-manifest.json',json.dumps(manifest,ensure_ascii=False,indent=2))
    checksum=hashlib.sha256(target.read_bytes()).hexdigest()
    (a.out/'SHA256SUMS.txt').write_text(checksum+'  '+target.name+'\n',encoding='utf-8')
    print(json.dumps({'zip':str(target),'files':len(files),'bytes':target.stat().st_size,'sha256':checksum},ensure_ascii=False))

if __name__=='__main__':main()
