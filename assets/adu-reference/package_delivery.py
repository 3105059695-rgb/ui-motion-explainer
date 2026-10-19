from pathlib import Path
import json,zipfile,hashlib
ROOT=Path(__file__).resolve().parent
target=ROOT.parent/'adu-motion-完整提取展示-20260930.zip'
if target.exists():raise SystemExit('Delivery archive already exists; use another filename.')
manifest=json.loads((ROOT/'source-manifest.json').read_text(encoding='utf-8'))
for row in manifest:
    p=ROOT/row['path']
    assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
    for p in ROOT.rglob('*'):
        if not p.is_file():continue
        rel=p.relative_to(ROOT)
        if '.git' in rel.parts or '__pycache__' in rel.parts or rel.name=='repository-main.zip':continue
        z.write(p,rel.as_posix())
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    for row in manifest:assert hashlib.sha256(z.read(row['path'])).hexdigest()==row['sha256']
    entries=len(z.namelist())
print(json.dumps({'archive':str(target),'bytes':target.stat().st_size,'entries':entries,'verifiedSourceFiles':len(manifest)},ensure_ascii=False))
