"""Check local fusion playback and reversible seeking, and capture review frames."""
import argparse
from functools import partial
import io
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
import json
from pathlib import Path
import threading
from PIL import Image,ImageChops,ImageDraw
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args):pass

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--out',type=Path,default=ROOT/'assets/fusion-studio/previews')
    a=p.parse_args()
    a.out.mkdir(parents=True,exist_ok=True)
    errors=[];bad=[];checks=[]
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(ROOT)))
    threading.Thread(target=server.serve_forever,daemon=True).start()
    base=f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            page=browser.new_page(viewport={'width':1920,'height':1080},device_scale_factor=1)
            page.on('pageerror',lambda e:errors.append(str(e)))
            page.on('response',lambda response:bad.append({'url':response.url,'status':response.status}) if response.status>=400 else None)
            for i in range(1,9):
                scene=f'F{i:02}'
                page.goto(base+'/assets/fusion-studio/index.html?scene='+scene+'&render=1',wait_until='load')
                page.evaluate('window.ready()')
                marks=[0,.8,1.6,3,4.5,6.4,8.8]
                for t in marks+list(reversed(marks)):
                    page.evaluate('async t=>{await window.render(t,t)}',t)
                page.evaluate('async()=>{await window.render(8.1,8.1)}')
                domScript="Array.from(document.querySelectorAll('#stage *')).map(e=>[e.id,e.getAttribute('style'),e.getAttribute('class'),e.children.length?'':e.textContent])"
                firstDom=page.evaluate(domScript)
                first=page.screenshot()
                (a.out/(scene+'-result.png')).write_bytes(first)
                page.evaluate('async()=>{await window.render(.8,.8);await window.render(8.1,8.1)}')
                second=page.screenshot()
                secondDom=page.evaluate(domScript)
                diff=ImageChops.difference(Image.open(io.BytesIO(first)).convert('RGB'),Image.open(io.BytesIO(second)).convert('RGB'))
                maxDelta=max(v[1] for v in diff.getextrema())
                changedPixels=sum(1 for pixel in diff.get_flattened_data() if pixel!=(0,0,0))
                consistent=firstDom==secondDom and maxDelta<=8 and changedPixels<=500
                if not consistent:
                    errors.append(scene+': inconsistent reversible seek frame')
                    (a.out/(scene+'-repeat.png')).write_bytes(second)
                page.evaluate('async()=>{await window.render(3,3)}')
                page.screenshot(path=str(a.out/(scene+'-motion.png')))
                check={'scene':scene,'seekSamples':len(marks)*2,'reversibleFrame':consistent,
                       'exactPngMatch':first==second,'domStateIdentical':firstDom==secondDom,
                       'maxRasterDelta':maxDelta,'changedEdgePixels':changedPixels,
                       'brokenImages':page.evaluate('Array.from(document.images).filter(x=>!x.complete||!x.naturalWidth).length'),
                       'fontStatus':page.evaluate('document.fonts.status')}
                if check['brokenImages']:errors.append(scene+': broken image')
                checks.append(check)
                if scene=='F04':
                    values=[]
                    for t in [3.1,4.0]:
                        page.evaluate('async t=>{await window.render(t,t)}',t)
                        values.append(page.evaluate("[document.getElementById('workflow-packet').style.left,document.getElementById('workflow-fill').style.width,document.getElementById('workflow-percent').textContent]"))
                    if values[0]!=values[1]:errors.append('F04: paused transfer/progress changed')
                if scene=='F08':
                    for t in [2.2,4.4]:
                        page.evaluate('async t=>{await window.render(t,5.8)}',t)
                        if page.evaluate('window.FUSION_STATE.mediaTime')!=5.8:errors.append('F08: source clock changed during animation sampling')
            page.goto(base+'/assets/fusion-studio/index.html',wait_until='load')
            page.evaluate('window.ready()')
            page.locator('#play-pause').click()
            page.locator('button[data-scene="F07"]').click()
            page.evaluate("document.getElementById('time-slider').value='5';document.getElementById('time-slider').dispatchEvent(new Event('input',{bubbles:true}))")
            page.wait_for_function('window.FUSION_STATE.scene==="F07"&&Math.abs(window.FUSION_STATE.time-5)<.001')
            page.locator('#replay').click()
            page.wait_for_function('window.FUSION_STATE.time<.01')
            page.locator('#play-pause').focus()
            page.keyboard.press('ArrowRight')
            page.wait_for_function('Math.abs(window.FUSION_STATE.time-.02)<.001')
            page.locator('#all-scenes').click()
            page.wait_for_function('window.getProject().scene==="all"')
            for i in range(8):page.evaluate('async t=>{await window.render(t,t)}',i*9+4.5)
            page.goto(base+'/index.html',wait_until='load')
            page.evaluate('document.fonts.ready')
            page.screenshot(path=str(a.out/'gallery.png'))
            page.set_viewport_size({'width':390,'height':844})
            page.goto(base+'/index.html',wait_until='load')
            page.evaluate('document.fonts.ready')
            mobileOverflow=page.evaluate('document.documentElement.scrollWidth>window.innerWidth')
            page.screenshot(path=str(a.out/'gallery-mobile.png'))
            browser.close()
    finally:server.shutdown();server.server_close()
    sheet=Image.new('RGB',(1280,860),'#F7F8FA')
    draw=ImageDraw.Draw(sheet)
    for i in range(8):
        for j,label in enumerate(['motion','result']):
            with Image.open(a.out/f'F{i+1:02}-{label}.png') as im:
                x=i%4*320;y=(i//4*2+j)*215
                sheet.paste(im.resize((320,180)),(x,y+24))
                draw.text((x+8,y+6),f'F{i+1:02} / '+label,fill='#4F2B78')
    sheet.save(a.out/'contact-sheet.jpg',quality=94)
    report={'scenes':checks,'pageErrors':errors,'resourceErrors':bad,'mobileOverflow':mobileOverflow,
            'seekComparison':'Identical DOM; allow <=8/255 RGB difference at <=500/2073600 pixels for Chromium text edge rasterization',
            'humanVisualReview':False,'userApproved':False}
    (a.out/'browser-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    if errors or bad or mobileOverflow:raise SystemExit(1)

if __name__=='__main__':main()
