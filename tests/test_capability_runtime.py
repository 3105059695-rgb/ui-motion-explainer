"""Composition binding checks; no browser install, rendering or copied runtime."""
import copy
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import capability_runtime as capabilities


@unittest.skipUnless(shutil.which('node'), 'Existing Node runtime required')
class CapabilityRuntimeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.event = copy.deepcopy(capabilities.inspect('parallel-groups')['example'])
        self.spec = {'schema_version': 1, 'width': 1920, 'height': 1080, 'fps': 50,
                     'audio': '', 'assets': [], 'captions': [],
                     'segments': [{'id': 'assign', 'duration': 8, 'events': [self.event]}]}

    def test_manifest_marks_native_adapters_and_reference_boundary(self):
        rows = capabilities.catalog()['capabilities']
        self.assertEqual(5, sum(row['adapter_kind'] == 'native-event' for row in rows))
        self.assertEqual(1, sum(row['adapter_kind'] == 'source-design' for row in rows))
        self.assertTrue(all(capabilities.inspect(row['id'])['source_files_exist'] for row in rows))

    def test_bindings_keep_audio_captions_and_media_clock_fields(self):
        audio = self.directory / 'narration.wav'
        video = self.directory / 'presenter.mp4'
        # This validator promises existence and binding checks, not media decoding.
        audio.write_bytes(b'existence-only fixture')
        video.write_bytes(b'existence-only fixture')
        self.spec.update(audio=str(audio), source_sha256='original-source-hash',
                         captions=[{'text': '本期原文', 'start': .4, 'end': 2.5}],
                         assets=[{'id': 'original', 'type': 'video', 'src': str(video), 'start': 0, 'end': 8, 'mediaStart': 2}])
        scenes, timeline, reports = capabilities.prepare_spec(self.spec, self.directory)
        self.assertEqual(self.spec['captions'], timeline['media']['captions'])
        self.assertEqual(2, timeline['media']['assets'][0]['mediaStart'])
        self.assertEqual('original-source-hash', timeline['source_sha256'])
        self.assertEqual(self.event, scenes[0]['events'][0])
        self.assertEqual(1, reports[0]['events'])
        self.assertEqual(8, timeline['duration_seconds'])

    def test_missing_asset_and_invalid_cue_fail_before_project_creation(self):
        self.event['objects'][0]['asset'] = 'unknown'
        with self.assertRaisesRegex(ValueError, 'Unknown event asset'):
            capabilities.prepare_spec(self.spec, self.directory)
        del self.event['objects'][0]['asset']
        self.event['cues']['complete'] = 99
        with self.assertRaisesRegex(ValueError, 'must lie inside event'):
            capabilities.prepare_spec(self.spec, self.directory)
        self.assertEqual([], list(self.directory.iterdir()))

    def test_scaffold_is_explicit_example_and_never_overwrites(self):
        target = self.directory / 'spec.json'
        capabilities.scaffold('input-result,parallel-groups', target)
        data = json.loads(target.read_text(encoding='utf-8'))
        self.assertEqual('examples-awaiting-current-narration', data['_instructions']['status'])
        self.assertEqual(2, len(data['segments']))
        original = target.read_bytes()
        with self.assertRaisesRegex(ValueError, 'new specification path'):
            capabilities.scaffold('input-result', target)
        self.assertEqual(original, target.read_bytes())

    def test_source_adapter_requires_explicit_original_bindings(self):
        with self.assertRaisesRegex(ValueError, 'designs scaffold'):
            capabilities.scaffold('source-design', self.directory / 'source.json')
        self.assertFalse((self.directory / 'source.json').exists())

    def test_canvas_math_and_variable_counts(self):
        result = subprocess.run([shutil.which('node'), str(ROOT / 'tests/capability_runtime.test.js')],
                                capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(0, result.returncode, result.stdout + result.stderr)


if __name__ == '__main__':
    unittest.main()
