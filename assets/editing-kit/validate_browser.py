"""Read-only demo verification using already installed Playwright/Chromium.
Writes only small PNG evidence and validation.json beside this file.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFont
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).parent
PROOFS=ROOT/'validation'
PROOFS.mkdir(exist_ok=True)
NAMES=['focus-mask','occlusion-reveal','match-handoff','compare','causal-chain','result-pullback']
installed=Path.home()/'AppData'/'Local'/'ms-playwright'
available=sorted(installed.glob('chromium-*/chrome-win64/chrome.exe'))
if not available:
    available=sorted(installed.glob('chromium-*/chrome-win/chrome.exe'))
if not available:
    raise SystemExit('No existing Chromium found; no browser will be installed.')
errors=[]
requests=[]
checks=[]
shots=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=str(available[-1]),headless=True)
    page=browser.new_page(viewport={'width':1328,'height':1100},device_scale_factor=1)
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.on('request',lambda r:requests.append(r.url) if r.url.startswith(('http://','https://')) else None)
    page.goto((ROOT/'demo.html').as_uri()+'?render=1')
    page.evaluate('window.ready()')
    for name in NAMES:
        page.evaluate('(name)=>window.selectEffect(name)',name)
        a=page.evaluate('()=>{renderAt(2.96);return [...document.querySelectorAll("#stage *")].map(e=>e.getAttribute("style"))}')
        b=page.evaluate('()=>{renderAt(8);renderAt(0);renderAt(6.2);renderAt(2.96);return [...document.querySelectorAll("#stage *")].map(e=>e.getAttribute("style"))}')
        assert a==b,name+' browser seek mismatch'
        for t in [0,4,8]:
            page.evaluate('(t)=>renderAt(t)',t)
            dest=PROOFS/f'{name}-{t:02}.png'
            page.locator('#stage').screenshot(path=str(dest))
            shots.append((dest,name+f' / {t}s'))
        checks.append({'effect':name,'reverse_seek':True,'snapshots_seconds':[0,4,8]})
    page.evaluate('selectEffect("focus-mask")')
    page.locator('#theme').click()
    page.evaluate('renderAt(8)')
    page.locator('#stage').screenshot(path=str(PROOFS/'focus-mask-dark.png'))
    dark=page.evaluate('getComputedStyle(document.getElementById("stage")).getPropertyValue("--uek-background").trim()')
    assert dark=='#18202d'
    page.close()
    # Test actual transport separately; export mode intentionally has no RAF loop.
    live=browser.new_page(viewport={'width':1328,'height':1100})
    live.on('pageerror',lambda e:errors.append(str(e)))
    live.goto((ROOT/'demo.html').as_uri())
    live.locator('#play').click()
    live.wait_for_function('Number(document.getElementById("timeline").value) > .12')
    live.locator('#play').click()
    stopped=live.locator('#timeline').input_value()
    live.wait_for_timeout(100)
    assert live.locator('#timeline').input_value()==stopped
    live.locator('#timeline').fill('3.25')
    live.locator('#timeline').dispatch_event('input')
    assert '3.25' in live.locator('#clock').inner_text()
    live.locator('#restart').click()
    assert live.locator('#timeline').input_value()=='0'
    browser.close()
assert not errors,errors
assert not requests,requests
font=ImageFont.truetype('C:/Windows/Fonts/msyh.ttc',16)
for start in range(0,len(shots),9):
    group=shots[start:start+9]
    sheet=Image.new('RGB',(1200,3*255),'#edf2f1')
    draw=ImageDraw.Draw(sheet)
    for i,(path,title) in enumerate(group):
        im=Image.open(path).convert('RGB');im.thumbnail((400,225))
        x=(i%3)*400;y=(i//3)*255
        sheet.paste(im,(x,y));draw.text((x+8,y+231),title,font=font,fill='#182b32')
    sheet.save(PROOFS/f'contact-{start//9+1}.jpg',quality=89)
report={
    'date':'2026-10-14','scope':'local component/demo technical checks',
    'browser':str(available[-1]),'syntax_checks':['editing-kit.js','demo.js'],
    'node_smoke_test':True,'browser_checks':checks,'browser_console_errors':errors,
    'external_requests':requests,'play_pause_scrub_restart':True,'alternate_theme':True,
    'media_transport_in_effects':False,'video_audio_material_tested':False,
    'model_visual_review':{'completed':False,'note':'pending image inspection'},'user_style_approval':False,
    'full_video_rendered':False
}
(ROOT/'validation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'passed':True,'effects':len(checks),'screenshots':len(shots)+1,'report':str(ROOT/'validation.json')},ensure_ascii=False))
