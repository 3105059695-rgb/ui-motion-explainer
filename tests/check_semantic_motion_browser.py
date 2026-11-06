"""Real Chromium seek checks for every O/R/X implementation; not aesthetic approval."""
import argparse
import contextlib
from functools import partial
import hashlib
import http.server
import json
from pathlib import Path
import threading
import time

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/semantic-motion'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def run(output=None):
    manifest = json.loads((ASSETS / 'manifest.json').read_text(encoding='utf-8'))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
    thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
    base = f'http://127.0.0.1:{server.server_port}/assets/semantic-motion/'
    rows, slots, behavior_checks = [], {}, []
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            page = browser.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
            errors = []
            page.on('pageerror', lambda e: errors.append(str(e)))
            for entry in manifest['effects']:
                eid = entry['id']; errors.clear(); started = time.monotonic()
                is_x = entry['kind'] == 'source-timeline'
                url = base + ('source-timelines/' + entry['source_group'] + '.html?effect=' + eid if is_x else 'demo.html?effect=' + eid)
                row = {'id': eid, 'passed': False, 'sampled_normalized_times': [0, .25, .5, .75, 1, 0]}
                try:
                    page.goto(url, wait_until='load')
                    page.wait_for_function('typeof window.render === "function"')
                    page.evaluate('window.ready()')
                    fingerprints, traces = [], []
                    for p in [0, .25, .5, .75, 1, 0]:
                        trace = page.evaluate('(p)=>window.render(p*window.semanticDuration)', p)
                        fingerprint = page.evaluate('''() => JSON.stringify([...document.querySelectorAll('#stage *,main *,[data-composition-id] *')].filter(n=>!['SCRIPT','STYLE','AUDIO'].includes(n.tagName)).map(n=>[n.tagName,n.id,n.getAttribute('style'),n.children.length?null:n.textContent]))''')
                        fingerprints.append(hashlib.sha256(fingerprint.encode()).hexdigest()); traces.append(trace)
                    if len(set(fingerprints[:5])) < 2:
                        raise AssertionError('No actual DOM/SVG state change across the complete interval')
                    if fingerprints[0] != fingerprints[-1]:
                        raise AssertionError('Backseek did not restore the deterministic initial state')
                    if errors:
                        raise AssertionError('; '.join(errors))
                    if is_x:
                        page.evaluate('window.render(window.semanticDuration/2)')
                        slots[eid] = page.evaluate('window.semanticSlots()')
                        row.update(source_range=entry['source_range'], source_seconds=[t['sourceSeconds'] for t in traces], text_slots=len(slots[eid]))
                        if slots[eid]:
                            slot = slots[eid][0]
                            text = '本期绑定验证'
                            page.evaluate('([s,t])=>{document.querySelector(s).textContent=t}', [slot['selector'], text])
                            page.evaluate('window.render(window.semanticDuration*.75)')
                            if page.locator(slot['selector']).text_content() != text:
                                # Dynamic state labels are timeline-owned, not editable fixed text slots.
                                slots[eid][0]['timeline_owned'] = True
                    else:
                        if eid == 'O11':
                            page.evaluate('window.render(window.semanticDuration)')
                            assert page.evaluate('semanticController.options.fields.every(x=>x.node.textContent===semanticController.options.value)')
                        if eid == 'O23':
                            page.evaluate('window.render(window.semanticDuration)')
                            assert page.evaluate('semanticController.options.items.filter(x=>x.match).every(x=>parseFloat(x.node.style.top)===x.to.y)')
                        if eid == 'O27':
                            page.evaluate('window.render(window.semanticDuration)')
                            assert page.evaluate('semanticController.options.node.textContent===semanticController.options.after')
                        if eid == 'O33':
                            assert page.evaluate('''()=>{const o=semanticController.options;const original=o.safeRects;o.safeRects=[{x:0,y:0,w:1,h:1}];let rejected=false;try{semanticController.seek(5)}catch(e){rejected=/safe region/.test(e.message)}o.safeRects=original;return rejected}''')
                        if eid == 'R15':
                            page.evaluate('window.render(window.semanticDuration)')
                            assert page.evaluate('semanticTrace.value===100 && semanticController.options.number.textContent==="100%"')
                        if eid == 'R06':
                            page.evaluate('window.render(3)')
                            assert page.evaluate('semanticTrace.media.filter(x=>x.active).length===1 && [...document.querySelectorAll("video")].every(v=>v.readyState>=2 && v.playbackRate===1)')
                    row.update(passed=True, deterministic_backseek=True, distinct_states=len(set(fingerprints[:5])), errors=[])
                    if output and eid in ['O09', 'O18', 'O30', 'R05', 'R06', 'R09', 'R16', 'X04', 'X21', 'X22', 'X23']:
                        page.evaluate('window.render(window.semanticDuration*.6)')
                        target = Path(output); target.mkdir(parents=True, exist_ok=True)
                        page.screenshot(path=str(target / (eid + '.png')))
                except Exception as exc:
                    row.update(error=str(exc), errors=list(errors))
                row['elapsed_seconds'] = round(time.monotonic()-started, 2)
                rows.append(row)
                print(eid, 'PASS' if row['passed'] else 'FAIL '+row.get('error', ''), flush=True)
            browser.close()
    finally:
        server.shutdown(); server.server_close()
    report = {'schema_version': 1, 'test': 'real Chromium complete-span seek and deterministic backseek',
              'passed': all(r['passed'] for r in rows), 'effects_checked': len(rows),
              'passed_count': sum(r['passed'] for r in rows), 'rows': rows,
              'scope': 'Actual DOM/SVG/GSAP state and real media decode. Sampled seek is not continuous human/model viewing or aesthetic approval.',
              'full_realtime_av_review': False, 'user_approval': 'not-inferred'}
    (ASSETS / 'verification.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (ASSETS / 'source-slots.json').write_text(json.dumps(slots, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--out'); args = parser.parse_args()
    result = run(args.out)
    print(json.dumps({'passed': result['passed'], 'count': result['passed_count'], 'total': result['effects_checked']}))
    raise SystemExit(0 if result['passed'] else 1)
