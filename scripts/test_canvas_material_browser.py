"""Optional real-browser checks: decoded sources, concurrent cuts, crop and presenter protection."""
import functools
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest

import new_project


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class CanvasMaterialBrowserTests(unittest.TestCase):
    def test_source_cuts_crops_and_opening_protection(self):
        ffmpeg = shutil.which('ffmpeg')
        if not ffmpeg:
            self.skipTest('Existing FFmpeg required; no runtime is installed by this test.')
        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            self.skipTest('Existing Playwright required; no dependency installation.')
        with sync_playwright() as pw:
            if not Path(pw.chromium.executable_path).is_file():
                self.skipTest('Existing Chromium not found; no download.')
            with tempfile.TemporaryDirectory(prefix='canvas-material-check-') as directory:
                project = Path(directory) / 'story'
                new_project.create(project, custom_layout=True, canvas_story=True)
                subprocess.run([ffmpeg, '-v', 'error', '-f', 'lavfi', '-i',
                    "color=c=red:s=160x90:r=10:d=3,drawbox=x=0:y=0:w=iw:h=ih:color=blue:t=fill:enable='gte(t,1)',drawbox=x=0:y=0:w=iw:h=ih:color=lime:t=fill:enable='gte(t,2)'",
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', str(project / 'source.mp4')], check=True)
                (project / 'source.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100"><path fill="red" d="M0 0h100v100H0z"/><path fill="blue" d="M100 0h100v100H100z"/></svg>', encoding='utf-8')
                whole = {'x': 0, 'y': 0, 'w': 320, 'h': 180}

                def shot(ident, start, target=whole):
                    return {'id': ident, 'asset': 'movie', 'start': 0, 'end': 1,
                            'source_in': start, 'source_out': start + 1, 'target': target}

                def segment(ident, start, shots, layout=None, **extra):
                    return {'id': ident, 'output': {'start_seconds': start, 'end_seconds': start + 1},
                            'layout': layout or {'mode': 'focus'}, 'material_shots': shots, **extra}

                binding = {'schema_version': 1, 'duration_seconds': 4, 'duration': 4, 'width': 320, 'height': 180,
                    'media': {'audio': '', 'captions': [], 'assets': [
                        {'id': 'movie', 'type': 'video', 'src': 'source.mp4'},
                        {'id': 'still', 'type': 'image', 'src': 'source.svg'}]},
                    'segments': [
                        segment('opening', 0, [shot('insert', 1)], {'mode': 'presenter-opening', 'presenter': 'movie',
                            'regions': [whole], 'protectedRects': [{'x': 0, 'y': 0, 'w': 160, 'h': 180}]}),
                        segment('compare', 1, [shot('before', 0, {'x': 0, 'y': 0, 'w': 160, 'h': 180}),
                                               shot('after', 1, {'x': 160, 'y': 0, 'w': 160, 'h': 180})]),
                        segment('result', 2, [shot('result', 2)], background='#FFFFFF'),
                        segment('image', 3, [{'id': 'detail', 'asset': 'still', 'start': 0, 'end': 1, 'crop_keyframes': [
                            {'at': 0, 'x': 0, 'y': 0, 'w': .5, 'h': 1},
                            {'at': 1, 'x': .5, 'y': 0, 'w': .5, 'h': 1}]}]) ]}
                config = json.loads((project / 'project.json').read_text(encoding='utf-8'))
                config.update(width=320, height=180, duration=4)
                (project / 'project.json').write_text(json.dumps(config), encoding='utf-8')
                (project / 'timeline.json').write_text(json.dumps(binding), encoding='utf-8')
                server = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(QuietHandler, directory=str(project)))
                thread = threading.Thread(target=server.serve_forever, daemon=True)
                thread.start()
                try:
                    with pw.chromium.launch(headless=True) as browser:
                        page = browser.new_page(viewport={'width': 320, 'height': 180})
                        errors = []
                        page.on('pageerror', lambda error: errors.append(str(error)))
                        page.goto(f'http://127.0.0.1:{server.server_port}/?render=1')
                        page.evaluate('window.ready()')

                        def draw(at, media=None):
                            page.evaluate('([a,m])=>window.render(a,m)', [at, at if media is None else media])

                        def pixel(x, y=90):
                            return page.evaluate('([x,y])=>Array.from(document.getElementById("stage").getContext("2d").getImageData(x,y,1,1).data)', [x, y])

                        def red(value):
                            self.assertGreater(value[0], 220)
                            self.assertLess(value[2], 30)

                        def blue(value):
                            self.assertGreater(value[2], 220)
                            self.assertLess(value[0], 30)

                        draw(.3)
                        red(pixel(80))  # Original presenter region remains unchanged.
                        blue(pixel(240))
                        draw(1.4)
                        red(pixel(80))
                        blue(pixel(240))  # Same source file, independent source times.
                        draw(1.999, 2.05)  # Temporal sample crosses cut; source must stay green.
                        self.assertGreater(pixel(160)[1], 220)
                        trace = page.evaluate('window.UIFusionRuntime.getTrace().calls.at(-1)')
                        self.assertEqual(trace['segment'], 'result')
                        self.assertAlmostEqual(trace['material_shots'][0]['source_time'], 2.05)
                        draw(3)
                        red(pixel(160))
                        draw(3.99)
                        blue(pixel(160))
                        draw(1.2)  # Backward seek must actually decode both old source positions.
                        red(pixel(80))
                        blue(pixel(240))
                        self.assertEqual(errors, [])
                finally:
                    server.shutdown()
                    server.server_close()
                    thread.join(timeout=2)


if __name__ == '__main__':
    unittest.main()
