"""Production binding safeguards and an actual complete-source project build."""
import base64
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import tempfile
import threading
import unittest
from unittest.mock import patch
from urllib.request import urlopen
import wave

import source_designs as designs


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


class SourceDesignCommandTests(unittest.TestCase):
    def make_spec(self, folder, demo=False):
        path = folder / 'episode.json'
        designs.scaffold('parallel-workflow', path, source_range=[26.66, 44.52], demo=demo)
        data = designs.read_json(path)
        row = data['segments'][0]
        row['duration'] = 17.86
        row['layout'] = {'mode': 'focus', 'contentRect': {'x': 100, 'y': 80, 'w': 1700, 'h': 880}}
        item = designs.inspect(row['design'])
        row['cues'] = {cue['id']: round(cue['source_time'] - row['sourceRange'][0], 6)
                       for cue in item['cues'] if row['sourceRange'][0] < cue['source_time'] < row['sourceRange'][1]}
        row['copy'] = {key: '本期内容' + str(index) for index, key in enumerate(row['copy'])}
        self.assertFalse(row['media'], 'This fixture deliberately selects a material-independent source interval.')
        self.assertFalse(row['logos'])
        designs.write_json(path, data)
        return path, data

    def test_scaffold_exposes_current_content_and_does_not_reuse_source_defaults(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'spec.json'
            designs.scaffold('parallel-workflow,module-assembly', path)
            data = designs.read_json(path)
            self.assertEqual(len(data['segments']), 2)
            for row in data['segments']:
                self.assertIsNone(row['duration'])
                self.assertIsNone(row['layout'])
                self.assertTrue(row['copy'])
                self.assertTrue(all(value is None for value in row['copy'].values()))
            original = path.read_bytes()
            with self.assertRaisesRegex(ValueError, 'Refusing to replace'):
                designs.scaffold('parallel-workflow', path)
            self.assertEqual(path.read_bytes(), original)
            with self.assertRaisesRegex(ValueError, 'duration'):
                designs.build(path, Path(directory) / 'new-project')
            self.assertFalse((Path(directory) / 'new-project').exists())

    def test_real_build_calls_source_designs_and_keeps_media_clock(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            path, data = self.make_spec(folder)
            audio = folder / 'original-narration.wav'
            with wave.open(str(audio), 'wb') as wav:
                wav.setnchannels(1)
                wav.setsampwidth(2)
                wav.setframerate(8000)
                wav.writeframes(b'\x00\x00' * 142880)
            picture = folder / 'current-image.png'
            picture.write_bytes(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg=='))
            data['audio'] = audio.name
            data['source_sha256'] = 'a' * 64
            data['implementation_manifest'] = {'project_entry': 'index.html'}
            plan_fields = {'span': {'start': 0, 'end': 12}, 'text': '本期原稿',
                           'library_refs': ['capability:agent-editorial'], 'source_study_refs': ['method:example'],
                           'recipe_ids': [], 'selection': {'reason': '本期因果过程', 'evidence': []},
                           'assets': ['current-image'], 'implementation': {'file': 'scenes.js'}}
            data['segments'][0].update(plan_fields)
            data['assets'] = [{'id': 'current-image', 'type': 'image', 'src': picture.name}]
            data['captions'] = [{'start': 0, 'end': 1.25, 'text': '原稿不改'}]
            designs.write_json(path, data)
            output = folder / 'project'
            result = designs.build(path, output)
            timeline = designs.read_json(output / 'timeline.json')
            self.assertEqual(timeline['source_sha256'], data['source_sha256'])
            self.assertEqual(timeline['implementation_manifest'], data['implementation_manifest'])
            for key, value in plan_fields.items():
                self.assertEqual(timeline['segments'][0][key], value)
            audio_url = timeline['media']['audio']
            image_url = timeline['media']['assets'][0]['src']
            self.assertTrue(audio_url.startswith('media/'))
            self.assertTrue(image_url.startswith('media/'))
            self.assertNotIn(':', audio_url)
            provenance = designs.read_json(output / 'source-media.local.json')
            by_source = {row['source']: row for row in provenance['files']}
            self.assertEqual(by_source[audio.resolve().as_posix()]['method'], 'hardlink')
            self.assertTrue((output / audio_url).samefile(audio))
            self.assertEqual(result['media_copied_bytes'], 0)
            server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(output)))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            try:
                base = 'http://127.0.0.1:' + str(server.server_port) + '/'
                with urlopen(base + audio_url, timeout=5) as response:
                    self.assertEqual(response.read(), audio.read_bytes())
                with urlopen(base + image_url, timeout=5) as response:
                    self.assertEqual(response.read(), picture.read_bytes())
            finally:
                server.shutdown()
                server.server_close()
                thread.join(timeout=2)
            self.assertEqual(timeline['media']['captions'], data['captions'])
            self.assertEqual(timeline['duration_seconds'], 17.86)
            self.assertTrue(result['audio_present'])
            self.assertIn('SourceDesigns.createScene(', (output / 'scenes.js').read_text(encoding='utf-8'))
            self.assertFalse(designs.read_json(output / 'project.json')['aestheticApproval'])
            original = (output / 'scenes.js').read_bytes()
            with self.assertRaises(ValueError):
                designs.build(path, output)
            self.assertEqual((output / 'scenes.js').read_bytes(), original)

    def test_remote_media_is_rejected_and_copy_requires_explicit_option(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            path, data = self.make_spec(folder)
            for url in ('https://example.invalid/image.png', 'data:image/png;base64,AA==', 'file:///C:/private.png'):
                data['assets'] = [{'id': 'unsupported', 'type': 'image', 'src': url}]
                with self.assertRaisesRegex(ValueError, 'acquired local media'):
                    designs.prepare_spec(data, folder)
            source = folder / 'image.png'
            source.write_bytes(b'test bytes')
            timeline = {'media': {'assets': [{'src': source.resolve().as_posix()}], 'audio': ''}}
            denied = folder / 'denied'
            denied.mkdir()
            rows = designs.media_plan(timeline, denied)
            with patch('source_designs.os.link', side_effect=OSError('hardlink unavailable')):
                with self.assertRaisesRegex(ValueError, '--copy-media'):
                    designs.materialize_media(rows, denied)
            allowed = folder / 'allowed'
            allowed.mkdir()
            rows = designs.media_plan(timeline, allowed, copy_media=True)
            with patch('source_designs.os.link', side_effect=OSError('hardlink unavailable')):
                urls = designs.materialize_media(rows, allowed, copy_media=True)
            self.assertEqual(rows[0]['method'], 'copy')
            self.assertEqual((allowed / urls[source.resolve().as_posix()]).read_bytes(), source.read_bytes())

    def test_missing_copy_and_materials_fail_before_project_creation(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            path, data = self.make_spec(folder)
            data['segments'][0]['copy'].pop(next(iter(data['segments'][0]['copy'])))
            designs.write_json(path, data)
            with self.assertRaisesRegex(ValueError, 'Missing copy slot'):
                designs.build(path, folder / 'missing-copy')
            self.assertFalse((folder / 'missing-copy').exists())
            data['segments'][0]['media']['new-slot'] = 'missing-id'
            designs.write_json(path, data)
            with self.assertRaisesRegex(ValueError, 'current asset ID'):
                designs.build(path, folder / 'missing-media', demo=True)
            self.assertFalse((folder / 'missing-media').exists())

    def test_demo_requires_explicit_flag_and_reports_silent_scope(self):
        with tempfile.TemporaryDirectory() as directory:
            folder = Path(directory)
            path, data = self.make_spec(folder, demo=True)
            with self.assertRaisesRegex(ValueError, 'Missing copy slot'):
                designs.build(path, folder / 'not-demo')
            result = designs.build(path, folder / 'demo', demo=True)
            self.assertFalse(result['audio_present'])
            self.assertIn('not linked to a narration director plan', result['narration_binding'])
            self.assertIn('Silent dynamic design only', result['delivery_scope'])
            self.assertTrue(designs.read_json(folder / 'demo/project.json')['demo'])


if __name__ == '__main__':
    unittest.main()
