import json
import io
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import material_sourcing as material


class MaterialSourcingTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.base = Path(self.tmp.name)
        self.plan = self.base / 'materials-plan.json'
        material.write_new(self.plan, material.build_plan('先打开真实项目。\n看看结果。', self.base))

    def tearDown(self):
        self.tmp.cleanup()

    def row(self, **updates):
        return {'id': 'M1', 'unit_id': 'U001', 'quote': '先打开真实项目。', 'kind': 'video',
                'purpose': '实际打开后的变化', 'source': {'page_url': 'https://example.test/watch/1'},
                'selection': 'selected', 'source_in': 1, 'source_out': 4,
                'review': {'semantic_match': True, 'viewed_range': [0, 5], 'notes': '打开前后实际对象不同'}, **updates}

    def test_plan_preserves_original_and_never_claims_search(self):
        source = '  飞书怎么导出？\n查看结果！'
        plan = material.build_plan(source, brief={'units': [{'unit_id': 'U001', 'query': '飞书 会议纪要 导出', 'wanted': ['真实操作']}]})
        self.assertFalse(plan['searched'])
        for unit in plan['units']:
            self.assertEqual(source[unit['span']['start']:unit['span']['end']], unit['quote'])
            self.assertEqual(set(unit['search']), {'x', 'bilibili', 'douyin'})
        self.assertIn('%20', plan['units'][0]['search']['bilibili'])
        self.assertEqual(plan['units'][0]['query_status'], 'agent-authored')

    def test_candidate_link_alone_cannot_export(self):
        material.record(self.plan, self.row(selection='candidate'))
        with self.assertRaisesRegex(ValueError, 'No selected'):
            material.export(self.plan, self.base / 'bindings.json')

    def test_real_media_record_export_and_changed_file_rejection(self):
        clip = self.base / 'clip.mp4'
        clip.write_bytes(b'fixture-media')
        checked = {'status': 'probed', 'width': 1920, 'height': 1080, 'duration': 5, 'full_decode': False}
        with patch.object(material, 'probe', return_value=checked):
            material.record(self.plan, self.row(local_path='clip.mp4'))
            result = material.export(self.plan, self.base / 'bindings.json')
            self.assertEqual(result['count'], 1)
            output = material.read(self.base / 'bindings.json')
            self.assertEqual(output['media_by_id']['M1']['sourceIn'], 1)
            clip.write_bytes(b'changed')
            self.assertEqual(material.inspect(self.plan)['selected_errors'], 1)

    def test_outside_duration_or_reviewed_range_cannot_export(self):
        clip = self.base / 'clip.mp4'; clip.write_bytes(b'fixture')
        with patch.object(material, 'probe', return_value={'status': 'probed', 'duration': 5}):
            material.record(self.plan, self.row(local_path='clip.mp4', source_out=8))
            report = material.inspect(self.plan)
            self.assertIn('source_out exceeds actual media duration', report['materials'][0]['errors'])
            self.assertIn('selected clip exceeds reviewed range', report['materials'][0]['errors'])
            with self.assertRaisesRegex(ValueError, 'not ready'):
                material.export(self.plan, self.base / 'bindings.json')

    def test_wrong_quote_and_duplicate_registration_rejected(self):
        with self.assertRaisesRegex(ValueError, 'exact original quote'):
            material.record(self.plan, self.row(quote='改写原文。'))
        material.record(self.plan, self.row(selection='candidate'))
        with self.assertRaisesRegex(ValueError, 'already exists'):
            material.record(self.plan, self.row())

    def test_ego_script_uses_existing_space_and_preserves_unicode(self):
        output = self.base / '采集.json'
        target = self.base / 'round.mjs'
        material.ego_script({'space_id': 6, 'page': 'p2', 'action': 'collect', 'output': str(output)}, target)
        code = target.read_text(encoding='utf-8')
        self.assertIn('"space_id": 6', code)
        self.assertIn('采集.json', code)
        self.assertNotIn('taskSpace(', code)
        with self.assertRaises(FileExistsError):
            material.ego_script({'space_id': 6, 'page': 'p2', 'output': str(output)}, target)

    def test_blob_or_platform_page_is_not_direct_media(self):
        with self.assertRaisesRegex(ValueError, 'blob'):
            material.download('blob:https://example.test/1', self.base / 'video.mp4', 'https://example.test/')

    def test_disguised_playlist_rejected_before_ffprobe(self):
        for number, content in enumerate((b'#EXTM3U\nhttps://example.test/segment.ts',
                                         b'<?xml version="1.0"?><MPD xmlns="urn:mpeg:dash:schema:mpd:2011">')):
            video = self.base / f'fake-{number}.mp4'; video.write_bytes(content)
            with patch.object(material.subprocess, 'run') as runner:
                self.assertEqual(material.probe(video)['status'], 'invalid')
                runner.assert_not_called()

    def test_download_playlist_mime_and_sniff_rejected_without_retained_media(self):
        for mime in ('application/vnd.apple.mpegurl', 'application/octet-stream'):
            response = io.BytesIO(b'#EXTM3U\nhttps://example.test/part.ts')
            response.headers = {'Content-Type': mime}
            target = self.base / 'bad.mp4'
            with patch.object(material, 'urlopen', return_value=response):
                with self.assertRaisesRegex(ValueError, 'playlist|not verified'):
                    material.download('https://example.test/media', target, 'https://example.test/watch')
            self.assertFalse(target.exists())
            self.assertFalse(target.with_name('bad.mp4.part').exists())

    def test_probe_cannot_fetch_remote_protocols(self):
        video = self.base / 'test.mp4'; video.write_bytes(b'not-a-playlist-header')
        with patch.object(material.shutil, 'which', return_value='ffprobe'), patch.object(material.subprocess, 'run') as runner:
            runner.return_value.returncode = 1
            runner.return_value.stderr = 'fixture invalid'
            material.probe(video)
            command = runner.call_args.args[0]
            self.assertEqual(command[command.index('-protocol_whitelist') + 1], 'file,pipe')


if __name__ == '__main__':
    unittest.main()
