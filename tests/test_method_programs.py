"""Production CLI bindings, copied offline playback and actual MP4 export.

Uses the installed Python/Playwright/FFmpeg. No runtime or browser install.
The shipped sample video is an explicit test input, never a production fallback.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / 'scripts/ui.py'


def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


class MethodProgramsProductionTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='method-cli-')
        self.work = Path(self.temporary.name)
        self.addCleanup(self.temporary.cleanup)

    def cli(self, *args, success=True):
        result = subprocess.run(
            [sys.executable, '-B', '-X', 'utf8', str(CLI), *map(str, args)],
            cwd=self.work, text=True, encoding='utf-8', capture_output=True,
            timeout=180,
        )
        if success:
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            return json.loads(result.stdout)
        self.assertNotEqual(result.returncode, 0)
        return result

    def scaffold(self, ident):
        path = self.work / 'binding.json'
        self.cli('programs', 'scaffold', '--id', ident, '--out', path)
        return path, json.loads(path.read_text(encoding='utf-8'))

    def build_copy(self, spec_path, spec, stage):
        spec_path.write_text(json.dumps(spec, ensure_ascii=False), encoding='utf-8')
        fragment = self.work / 'current-scene.html'
        fragment.write_text(stage, encoding='utf-8')
        generated = self.work / 'built'
        self.cli('programs', 'build', '--spec', spec_path,
                 '--stage', fragment, '--out', generated)
        portable = self.work / 'other-computer' / 'current-edit'
        shutil.copytree(generated, portable)
        # Only the independent copy will be opened; all required relative assets
        # must be present here and remote requests are blocked below.
        self.assertTrue((portable / 'Noto.woff2').is_file())
        self.assertNotIn(str(ROOT), (portable / 'index.html').read_text(encoding='utf-8'))
        return portable

    def render(self, portable, name):
        output = self.work / (name + '.mp4')
        report = self.cli('library', 'render', '--project', portable,
                          '--out', output, '--scale', '.5')
        self.assertEqual(report['status'], 'passed')
        self.assertEqual(report['full_decode'], 'passed')
        self.assertFalse(report['generic_fallback'])
        probe = subprocess.run(
            ['ffprobe', '-v', 'error', '-show_entries',
             'format=duration:stream=width,height,nb_frames', '-of', 'json', str(output)],
            text=True, encoding='utf-8', capture_output=True, check=True,
        )
        metadata = json.loads(probe.stdout)
        self.assertAlmostEqual(float(metadata['format']['duration']), 4, delta=.05)
        self.assertEqual(metadata['streams'][0]['width'], 640)
        self.assertEqual(metadata['streams'][0]['height'], 360)
        self.assertEqual(int(metadata['streams'][0]['nb_frames']), 120)
        report['video_sha256'] = digest(output)
        report['metadata'] = metadata
        archive = os.environ.get('UI_MOTION_TEST_ARTIFACTS')
        if archive:
            target = Path(archive)
            target.mkdir(parents=True, exist_ok=True)
            shutil.copy2(output, target / output.name)
            (target / (name + '.json')).write_text(
                json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
        return report

    def offline_page(self, browser, portable):
        context = browser.new_context(viewport={'width': 1280, 'height': 720}, offline=True)
        page = context.new_page()
        failures = []
        page.on('pageerror', lambda e: failures.append(str(e)))
        page.route('**/*', lambda route: route.continue_()
                   if route.request.url.startswith((portable.as_uri() + '/', 'data:', 'blob:'))
                   else route.abort())
        page.goto((portable / 'index.html').as_uri())
        page.evaluate('window.ready()')
        return context, page, failures

    def test_cli_new_dom_text_all_phases_backseek_and_render(self):
        binding, spec = self.scaffold('Q-C04')
        self.assertEqual([p['effect'] for p in spec['phases']], ['O13', 'O27', 'O16'])
        spec['duration'] = 4
        rectangles = {
            'single': {'x': 110, 'y': 170, 'w': 1060, 'h': 330},
            'leftRect': {'x': 60, 'y': 170, 'w': 550, 'h': 330},
            'rightRect': {'x': 660, 'y': 170, 'w': 550, 'h': 330},
        }
        spec['phases'] = [
            {'id': 'compare', 'effect': 'O13', 'start': 0, 'end': 1.2,
             'options': {'left': {'selector': '#source'}, 'right': {'selector': '#run'},
                         'divider': {'selector': '#divider'}, **rectangles}},
            {'id': 'correct', 'effect': 'O27', 'start': 1.2, 'end': 2.8,
             'options': {'node': {'selector': '#quantity'},
                         'before': '可售数量 = 库存数量',
                         'after': '可售数量 = 库存数量 − 已预留数量'}},
            {'id': 'confirm', 'effect': 'O16', 'start': 2.8, 'end': 4,
             'options': {'path': {'selector': '#tick'}, 'length': 102,
                         'label': {'selector': '#passed'}}},
        ]
        spec['text'] = {'#title': '本期库存核对：修正可售数量',
                        '#case': '库存 120；已预留 18；可售 102',
                        '#passed': '当前核对结果：102 件'}
        stage = '''<style>
        #stage{position:relative;width:1280px;height:720px;font-family:Noto;background:#fff;color:#0B0B0F}
        h1{position:absolute;left:60px;top:35px;font-size:42px}
        .surface{position:absolute;box-sizing:border-box;padding:35px;border:2px solid #DBDBE0;border-radius:18px;background:#F3F3F5}
        #source{left:110px;top:170px;width:1060px;height:330px}
        #run{left:110px;top:170px;width:1060px;height:330px;opacity:0;background:#0B0B0F;color:white}
        .label{font-size:25px;margin-bottom:40px}#quantity,#case{font-size:26px;line-height:1.8}
        #divider{position:absolute;left:633px;top:190px;width:3px;height:280px;background:#D6C2FF;opacity:0}
        #completion{position:absolute;left:660px;top:545px}#tick,#passed{opacity:0}
        #passed{display:inline-block;font-size:30px;vertical-align:top;margin-top:24px}
        </style><h1 id="title">old heading</h1>
        <section id="source" class="surface"><div class="label">当前规则</div><div id="quantity">可售数量 = 库存数量</div></section>
        <section id="run" class="surface"><div class="label">实际核对输入</div><div id="case">old case</div></section>
        <div id="divider"></div><div id="completion"><svg width="110" height="100"><path id="tick" d="M15 50 L40 75 L90 20" fill="none" stroke="#D6C2FF" stroke-width="9"/></svg><span id="passed">old result</span></div>'''
        portable = self.build_copy(binding, spec, stage)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            context, page, errors = self.offline_page(browser, portable)
            initial = digest_bytes(page.screenshot())
            trace = page.evaluate('window.seek(1.2)')
            self.assertEqual([p['phase'] for p in trace['phases']], ['compare', 'correct'])
            self.assertEqual(page.locator('#source').evaluate('(n)=>n.style.left'), '60px')
            self.assertEqual(page.locator('#run').evaluate('(n)=>n.style.left'), '660px')
            page.evaluate('window.seek(2.4)')
            self.assertEqual(page.locator('#quantity').text_content(), spec['phases'][1]['options']['after'])
            final = page.evaluate('window.seek(4)')
            self.assertEqual([p['phase'] for p in final['phases']], ['compare', 'correct', 'confirm'])
            self.assertTrue(final['phases'][2]['state']['completed'])
            self.assertEqual(page.locator('#passed').evaluate('(n)=>n.style.opacity'), '1')
            self.assertEqual(page.locator('#tick').evaluate('(n)=>n.style.strokeDashoffset'), '0')
            self.assertNotEqual(initial, digest_bytes(page.screenshot()))
            page.evaluate('window.seek(0)')
            self.assertEqual(page.locator('#quantity').text_content(), '可售数量 = 库存数量')
            self.assertEqual(initial, digest_bytes(page.screenshot()))
            self.assertFalse(errors)
            context.close()
            browser.close()
        self.render(portable, 'method-current-stock-check')

    def test_cli_real_video_sequence_continuation_and_backseek(self):
        binding, spec = self.scaffold('Q-W03')
        spec['duration'] = 4
        spec['phases'] = [
            {'id': 'event', 'effect': 'R06', 'start': 0, 'end': 2,
             'options': {'identity': 'current-task-17', 'clips': [
                 {'id': 'observe', 'node': {'selector': '#observe'}, 'identity': 'current-task-17',
                  'start': 0, 'end': .5, 'sourceIn': .4},
                 {'id': 'act', 'node': {'selector': '#act'}, 'identity': 'current-task-17',
                  'start': .5, 'end': 1, 'sourceIn': 2.2}]}},
            {'id': 'inspect', 'effect': 'O30', 'start': 2, 'end': 4,
             'options': {'viewport': {'selector': '#viewport'}, 'media': {'selector': '#act'},
                         'scale': 1.35, 'x': -85, 'y': -45,
                         'focusAt': .1, 'focusEnd': .3, 'returnAt': .7, 'returnEnd': 1,
                         'sourcePlaybackRate': 1}},
        ]
        # Continue second real clip from the exact point where its event phase ends.
        spec['mediaTracks'] = [{'selector': '#act', 'sourceIn': 3.2, 'offset': 2, 'end': 4}]
        media = ROOT / 'assets/approved-girl-sample/assets/manual-v2.mp4'
        spec['media'] = {'#observe': {'src': str(media)}, '#act': {'src': str(media)}}
        spec['text'] = {'#title': '新内容绑定：发现任务问题，再聚焦实际操作'}
        stage = '''<style>#stage{position:relative;width:1280px;height:720px;background:white;font-family:Noto}
        h1{position:absolute;left:70px;top:20px;font-size:35px;color:#0B0B0F}
        #viewport{position:absolute;left:140px;top:130px;width:1000px;height:550px;overflow:hidden;border-radius:20px;background:#0B0B0F}
        video{position:absolute;width:1000px;height:550px;object-fit:contain;opacity:0}
        </style><h1 id="title">unbound</h1><div id="viewport"><video id="observe" muted preload="auto"></video><video id="act" muted preload="auto"></video></div>'''
        portable = self.build_copy(binding, spec, stage)
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            context, page, errors = self.offline_page(browser, portable)
            initial = digest_bytes(page.screenshot())
            for t, selector, expected in [(0.5, '#observe', .9), (1.5, '#act', 2.7),
                                           (3.0, '#act', 4.2), (4.0, '#act', 5.2)]:
                trace = page.evaluate('(t)=>window.seek(t)', t)
                actual = page.locator(selector).evaluate('(v)=>({time:v.currentTime,rate:v.playbackRate,ready:v.readyState})')
                self.assertAlmostEqual(actual['time'], expected, delta=.05)
                self.assertEqual(actual['rate'], 1)
                self.assertGreaterEqual(actual['ready'], 2)
                if t >= 2:
                    self.assertEqual([p['phase'] for p in trace['phases']], ['event', 'inspect'])
            self.assertIn('scale(1)', page.locator('#act').evaluate('(v)=>v.style.transform'))
            page.evaluate('window.seek(0)')
            self.assertEqual(initial, digest_bytes(page.screenshot()))
            self.assertFalse(errors)
            context.close()
            browser.close()
        self.render(portable, 'method-current-video-sequence')

    def test_bound_short_video_is_rejected_instead_of_frozen(self):
        binding, spec = self.scaffold('Q-W06')
        spec['duration'] = 2
        spec['phases'] = [{'id': 'event', 'effect': 'R06', 'start': 0, 'end': 2,
                           'options': {'identity': 'current-short-source', 'clips': [
                               {'id': 'current', 'node': {'selector': '#clip'},
                                'identity': 'current-short-source', 'start': 0,
                                'end': 1, 'sourceIn': 5}]}}]
        spec['media'] = {'#clip': {'src': str(ROOT / 'assets/approved-girl-sample/assets/manual-v2.mp4')}}
        portable = self.build_copy(binding, spec,
                                   '<video id="clip" muted preload="auto" style="width:800px;height:450px"></video>')
        with sync_playwright() as pw:
            browser = pw.chromium.launch(headless=True)
            context, page, _ = self.offline_page(browser, portable)
            with self.assertRaisesRegex(Exception, 'shorter than the required source clock'):
                page.evaluate('window.seek(2)')
            context.close()
            browser.close()


def digest_bytes(value):
    return hashlib.sha256(value).hexdigest()


if __name__ == '__main__':
    unittest.main()
