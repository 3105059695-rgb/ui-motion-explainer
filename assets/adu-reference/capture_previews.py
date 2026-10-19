from pathlib import Path
import json, time, urllib.parse, hashlib,sys
from collections import defaultdict
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent
data=json.loads((ROOT/'catalog.json').read_text(encoding='utf-8'))
posters=ROOT/'posters';posters.mkdir(exist_ok=True)
groups=defaultdict(list)
for item in data['items']:
    if item.get('preview') and item['group']!='audio':groups[item['preview']].append(item)
report={'checked':[],'errors':[],'sourceFiles':len(data['files']),'sourceCommit':data['commit']}
if '--retry-errors' in sys.argv and (ROOT/'verification.json').exists():
    report=json.loads((ROOT/'verification.json').read_text(encoding='utf-8'))
    retry={e['preview'] for e in report['errors']}
    groups={k:v for k,v in groups.items() if k in retry}
    report['checked']=[c for c in report['checked'] if c['preview'] not in retry]
    report['errors']=[]
started=time.time()
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,args=['--allow-file-access-from-files'])
    for url,items in groups.items():
        width,height=items[0].get('width',1920),items[0].get('height',1080)
        page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1)
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('requestfailed',lambda r:errors.append('Resource: '+r.url))
        try:
            page.goto('http://127.0.0.1:8766/'+url,wait_until='load',timeout=30000)
            page.wait_for_function('typeof window.renderAt === "function"',timeout=10000)
            page.evaluate('async()=>{await window.READY;if(window.imgWait)await window.imgWait();await document.fonts.ready}')
            for item in items:
                times=[item['start']+.16*(item['end']-item['start']),item['start']+.68*(item['end']-item['start'])]
                checks=[]
                for t in times:
                    page.evaluate('async t=>{window.renderAt(t);if(window.imgWait)await window.imgWait();await new Promise(requestAnimationFrame)}',t)
                    checks.append(page.evaluate('()=>({images:document.images.length,badImages:[...document.images].filter(i=>i.complete&&i.naturalWidth===0&&i.src).map(i=>i.src)})'))
                shot=page.screenshot(type='jpeg',quality=87)
                p=posters/(item['id']+'.jpg');p.write_bytes(shot)
                with Image.open(p) as im:
                    canvas=Image.new('RGB',(640,360),'#17283e');im.thumbnail((640,360));canvas.paste(im,((640-im.width)//2,(360-im.height)//2));canvas.save(p,quality=88)
                report['checked'].append(dict(id=item['id'],preview=url,times=times,checks=checks,poster=p.relative_to(ROOT).as_posix()))
                print('OK',item['id'],flush=True)
            if errors:report['errors'].append(dict(preview=url,errors=list(dict.fromkeys(errors))))
        except Exception as e:
            report['errors'].append(dict(preview=url,error=str(e)));print('ERROR',url,str(e),flush=True)
        finally:page.close()
    browser.close()
report['elapsedSeconds']=round(time.time()-started,2)
(ROOT/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'checked':len(report['checked']),'errorGroups':len(report['errors']),'elapsed':report['elapsedSeconds']},ensure_ascii=False),flush=True)
tiles=[]
for item in data['items']:
    if item['group'] in ['anim3','anim4','template','ui','effect']:
        p=ROOT/item['poster']
        if p.exists():tiles.append((item,p))
try:font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',17)
except:font=ImageFont.load_default()
cols=5;rows=(len(tiles)+cols-1)//cols
sheet=Image.new('RGB',(cols*384,rows*246),'#edf1f6');draw=ImageDraw.Draw(sheet)
for i,(item,p) in enumerate(tiles):
    with Image.open(p) as im:sheet.paste(im.resize((368,207)),(i%cols*384+8,i//cols*246+8))
    draw.text((i%cols*384+10,i//cols*246+220),item['title'][:21],font=font,fill='#17283e')
sheet.save(ROOT/'all-visual-contact-sheet.jpg',quality=92)
