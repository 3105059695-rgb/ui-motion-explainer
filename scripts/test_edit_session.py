import contextlib
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import director
import edit_session as session
import reference_edits as edits
import video_sources


class EditingWindowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.tmp = tempfile.TemporaryDirectory()
        cls.folder = Path(cls.tmp.name)
        cls.script = cls.folder / '口播.txt'
        cls.script.write_text('先将两个窗口并排，比较同一份资料。' + '随后回到原文取出关键数字' * 45, encoding='utf8')
        director.prepare(cls.script, cls.folder)
        cls.original = (cls.folder / session.PLAN).read_bytes()

    @classmethod
    def tearDownClass(cls):
        cls.tmp.cleanup()

    def setUp(self):
        (self.folder / session.PLAN).write_bytes(self.original)

    def write_patch(self, value):
        path = self.folder / 'patch.json'
        edits.write(path, value)
        return path

    def test_full_index_and_small_cards(self):
        _, context, plan = session.read_project(self.folder)
        catalog = video_sources.Catalog()
        data = context['video_sources']
        self.assertEqual(set(data['inventory']), set(catalog.by_id))
        required = data['all_submitted']['required']
        self.assertEqual(len(required), 32)
        self.assertEqual(len(data['all_submitted']['diagnostic']), 6)
        self.assertEqual(len(context['capabilities']['library']['entries']), context['capabilities']['summary']['entry_count'])
        self.assertEqual(sum(bool(r['timing']['samples']) for r in required), 28)
        duties = session.overview(self.folder)
        self.assertEqual({r[0] for r in duties['references']}, {r['source_id'] for r in required})
        self.assertEqual(len(duties['corrections']), 6)
        for i, source in enumerate(required, 1):
            card = session.resume(self.folder, i)
            self.assertEqual(card['shot']['source'], source['source_id'])
            self.assertTrue(card['shot']['evidence']['keyframes'])
            self.assertLess(len(json.dumps(card, ensure_ascii=False, indent=2)), 4500)

    def test_warm_prepare_and_resume_do_not_reindex(self):
        with patch.object(director, 'prepare', side_effect=AssertionError('Unneeded index rebuild')), \
                patch.object(video_sources, 'Catalog', side_effect=AssertionError('Unexpected catalog scan')):
            for command in (['resume'], ['prepare', '--script', str(self.script)]):
                with contextlib.redirect_stdout(io.StringIO()) as stream:
                    self.assertEqual(director.main([*command, '--project', str(self.folder)]), 0)
                self.assertEqual(json.loads(stream.getvalue())['stage'], 'edit')

    def test_partial_save_and_stale_or_invalid_patch(self):
        card = session.resume(self.folder)
        def change(rev, fields):
            return self.write_patch({'changes':[{'shot':1,'revision':rev,'set':fields}]})
        first = session.save(self.folder, change(card['revision'], {'start_frame':4}))
        self.assertEqual(first['shot']['bound']['start_frame'], 4)
        self.assertNotEqual(first['revision'], card['revision'])
        saved = (self.folder / session.PLAN).read_bytes()
        for rev, fields in ((card['revision'], {'end_frame':9}), (first['revision'], {'unit':[]}),
                            (first['revision'], {'end_frame':2}), (first['revision'], {'rect':[1]})):
            with self.assertRaises(ValueError):
                session.save(self.folder, change(rev, fields))
            self.assertEqual((self.folder / session.PLAN).read_bytes(), saved)
        second = session.save(self.folder, change(first['revision'], {'end_frame':9}))
        self.assertEqual(second['shot']['bound']['start_frame'], 4)
        self.assertEqual(second['shot']['bound']['end_frame'], 9)

    def test_restoring_one_missing_duty_preserves_bound_work(self):
        _, _, plan = session.read_project(self.folder)
        missing = plan['shots'].pop(1)
        plan['shots'][0]['start_frame'] = 7
        edits.write(self.folder / session.PLAN, plan)
        status = session.resume(self.folder)
        self.assertEqual(status['missing_sources'], [missing['source_id']])
        session.save(self.folder, self.write_patch({'restore_missing':True, 'repair_revision':status['repair_revision']}))
        restored = edits.read(self.folder / session.PLAN)['shots']
        self.assertEqual(restored[:-1], plan['shots'])
        self.assertEqual(restored[-1], missing)

    def test_long_original_quotes_remain_available(self):
        _, context, plan = session.read_project(self.folder)
        unit = max(context['video_sources']['units'], key=lambda u: len(u['quote']))
        self.assertGreater(len(unit['quote']), session.QUOTE_SIZE)
        shot = session.resume(self.folder)['shot']
        changed = {'changes':[{'shot':shot['number'], 'revision':session.resume(self.folder)['revision'], 'set':{'unit':unit['id']}}]}
        card = session.save(self.folder, self.write_patch(changed))['shot']
        text = card['quote']
        while 'next_quote_offset' in card:
            card = session.resume(self.folder, shot['number'], card['next_quote_offset'])['shot']
            text += card['quote']
        self.assertEqual(text, unit['quote'])


if __name__ == '__main__':
    unittest.main()
