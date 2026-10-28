"""Real FFmpeg timing/mix checks; generated tones are test fixtures, not production sounds."""
import array
import importlib.util
import json
import math
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import wave

MODULE = Path(__file__).resolve().parents[1] / 'assets/base-skill/scripts/event_audio.py'
spec = importlib.util.spec_from_file_location('event_audio', MODULE)
audio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audio)
FFMPEG = shutil.which('ffmpeg')
FFPROBE = shutil.which('ffprobe')
RATE = 48000


def tone(path, frequency, duration=2, amplitude=0.1):
    samples = array.array('h', (round(32767 * amplitude * math.sin(2 * math.pi * frequency(i / RATE) * i / RATE))
                               for i in range(round(duration * RATE))))
    with wave.open(str(path), 'wb') as f:
        f.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
        f.writeframes(samples.tobytes())


def level(samples, at, hz, length=0.08):
    portion = samples[round(at * RATE):round((at + length) * RATE)]
    real = sum(value * math.cos(2 * math.pi * hz * n / RATE) for n, value in enumerate(portion))
    imag = sum(value * math.sin(2 * math.pi * hz * n / RATE) for n, value in enumerate(portion))
    return 2 * math.hypot(real, imag) / len(portion)


class EventAudioTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'source.wav').write_bytes(b'fixture')
        self.event = {'id': 'transfer', 'path': 'source.wav', 'at': 1,
                      'source_in': 0.5, 'source_out': 1.5, 'event_id': 'handoff', 'segment_id': 's1'}

    def plan(self, rows, start=0, end=3, probe=lambda *_: 2):
        return audio.load_events(self.root, {'sound_events': rows}, start, end, FFMPEG or 'ffmpeg', probe=probe)

    def test_partial_overlap_keeps_source_clock_and_delay(self):
        plan = self.plan([self.event], start=1.25, end=1.7)
        row = plan['active'][0]
        self.assertAlmostEqual(row['source_in'], 0.75)
        self.assertAlmostEqual(row['source_out'], 1.2)
        self.assertEqual(row['output_offset'], 0)
        self.assertEqual(row['gain'], 0.3)
        later = self.plan([self.event], start=0.75, end=3)['active'][0]
        self.assertEqual(later['output_offset'], 0.25)

    def test_invalid_or_missing_material_fails_even_outside_export(self):
        for change in ({'path': '../escape.wav'}, {'path': 'C:/secret.wav'}, {'path': 'missing.wav'},
                       {'at': -1}, {'gain': 2}, {'gain': float('nan')}, {'at': True},
                       {'source_in': 1.5}, {'source_out': 2.1}, {'source_out': float('inf')}, {'event_id': ''}):
            with self.subTest(change=change), self.assertRaises((ValueError, FileNotFoundError)):
                self.plan([{**self.event, **change}], start=0, end=0.25)
        with self.assertRaisesRegex(ValueError, 'unique'):
            self.plan([self.event, self.event])

    def test_optional_events_and_canvas_single_owner(self):
        plan = self.plan([], probe=lambda *_: self.fail('empty plan must not require a probe'))
        self.assertEqual(plan['active'], [])
        (self.root / 'timeline.json').write_text(json.dumps({'sound_events': [self.event]}), encoding='utf-8')
        plan = audio.load_events(self.root, {'sceneRuntime': 'canvas-story-v1'}, 0, 3, 'ffmpeg', probe=lambda *_: 2)
        self.assertEqual(plan['source'], 'timeline.json')
        with self.assertRaisesRegex(ValueError, 'competing'):
            audio.load_events(self.root, {'sceneRuntime': 'canvas-story-v1', 'sound_events': [self.event]},
                              0, 3, 'ffmpeg', probe=lambda *_: 2)
        report = audio.event_report(plan, False)
        self.assertFalse(report['mixed'])
        self.assertNotIn('resolved_path', report['events'][0])

    def render(self, events, start, end, master=None):
        silent, output = self.root / 'silent.mp4', self.root / 'mixed.mp4'
        subprocess.run([FFMPEG, '-y', '-v', 'error', '-f', 'lavfi', '-i',
                        f'color=c=black:s=64x64:r=20:d={end-start}', '-an', '-c:v', 'libx264', str(silent)], check=True)
        plan = self.plan(events, start, end, probe=audio.audio_duration)
        command = audio.mix_command(FFMPEG, silent, output, start, end, plan['active'], master)
        subprocess.run(command, check=True, capture_output=True)
        subprocess.run([FFMPEG, '-v', 'error', '-i', str(output), '-f', 'null', '-'], check=True, capture_output=True)
        raw = subprocess.run([FFMPEG, '-v', 'error', '-i', str(output), '-vn', '-f', 'f32le',
                              '-ac', '1', '-ar', str(RATE), '-'], check=True, capture_output=True).stdout
        samples = array.array('f'); samples.frombytes(raw)
        return samples, plan

    @unittest.skipUnless(FFMPEG and FFPROBE, 'existing FFmpeg/ffprobe required for actual audio integration')
    def test_ffmpeg_clip_overlap_and_unchanged_narration_level_clock(self):
        tone(self.root / 'master.wav', lambda t: 500 if t < 1 else 700)
        tone(self.root / 'source.wav', lambda t: 400 if t < 0.5 else 1200)
        tone(self.root / 'second.wav', lambda _: 1600)
        events = [{**self.event, 'at': 0.5, 'source_in': 0.5, 'source_out': 1, 'gain': 0.5},
                  {'id': 'click', 'path': 'second.wav', 'at': 0.85, 'source_in': 0.1, 'source_out': 0.5, 'gain': 0.2}]
        samples, plan = self.render(events, 0.75, 1.5, self.root / 'master.wav')
        self.assertEqual(len(plan['active']), 2)
        self.assertAlmostEqual(level(samples, 0.12, 500), 0.1, delta=0.012)
        self.assertAlmostEqual(level(samples, 0.4, 700), 0.1, delta=0.012)
        self.assertLess(level(samples, 0.12, 700), 0.008)
        self.assertAlmostEqual(level(samples, 0.12, 1200), 0.05, delta=0.012)
        self.assertAlmostEqual(level(samples, 0.12, 1600), 0.02, delta=0.008)
        self.assertLess(level(samples, 0.12, 400), 0.005)
        self.assertLess(level(samples, 0.4, 1200), 0.005)

    @unittest.skipUnless(FFMPEG and FFPROBE, 'existing FFmpeg/ffprobe required for actual audio integration')
    def test_ffmpeg_events_without_master_keep_silence_before_event(self):
        tone(self.root / 'source.wav', lambda _: 1200)
        samples, _ = self.render([{**self.event, 'at': 0.25, 'source_in': 0, 'source_out': 1}], 0, 0.6)
        self.assertLess(level(samples, 0.02, 1200), 0.002)
        self.assertAlmostEqual(level(samples, 0.4, 1200), 0.03, delta=0.008)
        self.assertLess(abs(len(samples) / RATE - 0.6), 0.04)  # AAC trailing packet padding.


if __name__ == '__main__':
    unittest.main()
