from pathlib import Path
import json, re
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1440,'height':1040},device_scale_factor=1)
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8766/index.html',wait_until='load')
    page.wait_for_function('window.GALLERY && window.GALLERY.getState().ready')
    page.evaluate('GALLERY.seek(2.45)')
    page.wait_for_timeout(350)
    page.screenshot(path=str(ROOT/'gallery-preview.png'),full_page=False)
    checks=[]
    for group in ['anim4','detail','ui','template','effect','example','audio','asset']:
        page.locator('[data-group="'+group+'"]').click()
        page.wait_for_function('window.GALLERY.getState().ready')
        checks.append(dict(group=group,state=page.evaluate('GALLERY.getState()')))
    page.locator('[data-group="anim4"]').click();page.wait_for_function('GALLERY.getState().ready')
    page.locator('#showcode').click()
    assert page.locator('.coderow').count()>0
    page.locator('#fullcode').click();assert page.locator('.coderow').count()>200
    page.locator('[data-group="files"]').click()
    assert page.locator('.filerow').count()==111
    page.locator('.filerow').filter(has_text='template/templates.js').click()
    assert page.locator('#modal .coderow').count()>100
    page.locator('#modalclose').click()
    page.locator('[data-group="effect"]').click()
    page.locator('#search').fill('circle')
    assert page.locator('.card').count()>0
    page.locator('#search').fill('')
    page.locator('[data-group="ui"]').click();page.wait_for_function('GALLERY.getState().ready')
    page.screenshot(path=str(ROOT/'gallery-ui-preview.png'),full_page=False)
    page.set_viewport_size({'width':390,'height':844})
    page.wait_for_timeout(150);page.screenshot(path=str(ROOT/'gallery-mobile.png'),full_page=False)
    assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
    browser.close()
    (ROOT/'gallery-check.json').write_text(json.dumps(dict(checks=checks,errors=errors,codePanel=True,fileBrowser=111,search=True,mobileOverflow=False),ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(dict(errors=errors,groups=len(checks),files=111),ensure_ascii=False))
