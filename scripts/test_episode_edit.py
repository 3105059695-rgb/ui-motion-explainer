import copy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import editing_library as library
import episode_edit as edit
import episode_media as media
import reference_edits as edits


class ScriptLedEdits(unittest.TestCase):
    def setUp(self):
        self.scratch=tempfile.TemporaryDirectory()
        self.folder=Path(self.scratch.name)
        script=self.folder/'talk.txt';script.write_text('先问方向。再比较两个位置。',encoding='utf8')
        edit.initialise(self.folder,script)
        self.board=edits.read(self.folder/edit.STATE)
        self.first,self.second=self.board['units']

    def tearDown(self):
        self.scratch.cleanup()

    def decide(self):
        edit.decide(self.board,{'synopsis':'同一个方向需要同一坐标。','units':[
            {'id':'U001','job':'keep','why':'人能说清方向。'},{'id':'U002','job':'compare','why':'两个位置要叠在同一坐标。'}]})

    def test_script_precedes_choices_and_all_submissions_have_jobs(self):
        status=edit.status(self.folder,self.board)
        self.assertEqual(status['stage'],'read-script')
        self.assertEqual(len(status['units']),2)
        with self.assertRaises(ValueError):edit.choices(self.board,self.second)
        self.decide()
        recipes=library.library()[2]
        self.assertEqual(set(recipes),set().union(*map(set,library.FUNCTIONS.values())))
        self.assertEqual(set(library.options(self.second)),set(recipes))
        self.assertEqual(edit.choose(self.board,self.first,'original',None,'现场足以解释。',None)['aspect'],'original')

    def test_selection_requires_distinct_candidates_and_a_real_choice(self):
        self.decide();self.second['candidates']=['girl-manual','girl-takeover','original']
        with self.assertRaises(ValueError):edit.choose(self.board,self.second,'girl-manual','girl-takeover','同一种换名。',None)
        with self.assertRaises(ValueError):edit.choose(self.board,self.second,'original',None,'没选材。',None)
        edit.choose(self.board,self.second,'original','girl-manual','材料只有结果，原话更清楚。',None)
        with self.assertRaises(ValueError):edit.choose(self.board,self.second,'original','girl-manual','旧窗口覆盖。',None)

    def test_stills_downgrade_motion_and_reject_cached_playback(self):
        self.decide();self.second['candidates']=['fred-argon','original']
        edit.choose(self.board,self.second,'fred-argon','original','看清证据落点。',None)
        moving=self.folder/'reference.mp4';moving.write_bytes(b'test reference fingerprint')
        fact=media.file_fact(self.folder,moving)
        ref={'kind':'video','key':'v1','source_file':str(moving),'source_sha256':fact['sha256'],'clip':fact,
             'observation':{'mode':'continuous-observed'}}
        self.board['references']['fred-argon']=ref
        self.second['auditions']={'fred-argon':copy.deepcopy(ref)}
        self.assertEqual(edit.current_reference(self.folder,self.board,'fred-argon',self.second),'continuous-observed')
        frames=[]
        for i in (1,2):
            f=self.folder/f'{i}.png';f.write_bytes(bytes([i]));frames.append(str(f))
        media.watch(self.folder,self.board,self.second,'fred-argon',stills=frames)
        self.assertEqual(edit.current_reference(self.folder,self.board,'fred-argon',self.second),'layout-color-only')
        with self.assertRaises(ValueError):
            media.observe(self.folder,self.board,self.second,'fred-argon',{'mode':'continuous-observed','note':'播放过旧片。'})
        self.assertIn('motion-unverified',edit.gaps(self.folder,self.board,self.second))

    def test_file_replacement_and_skipped_playback_are_detected(self):
        f=self.folder/'ref.mp4';f.write_bytes(b'v1');fact=media.file_fact(self.folder,f)
        ref={'kind':'video','source_file':str(f),'source_sha256':fact['sha256'],'clip':fact}
        f.write_bytes(b'v2')
        self.assertFalse(media.reference_intact(self.folder,ref))
        rec={'kind':'presented-intervals@1','binding':'x','samples':[{'key':'k','start':0,'end':2,'frames':2,'max_gap':2,'wall':.05}]}
        p=self.folder/'play.json';p.write_text(json.dumps(rec),encoding='utf8')
        with self.assertRaises(ValueError):media.presented(self.folder,{'binding':'x','tracks':[{'key':'k','range':[0,2]}]},p)

    def test_two_inputs_keep_fixed_comparison_and_follow_original_voice(self):
        r=library.library()[2]['arun-membership']
        t=media.timed_recipe(r,'arun-membership',{'variant':'pair','beats':[[.5,1.5]]},5)
        self.assertEqual(set(t['slots']),{'a','b','condition'})
        self.assertEqual(next(l for l in t['layers'] if l['slot']=='b')['keys'][0]['at'],.3)
        self.assertIn('c',r['slots'])
        with self.assertRaises(ValueError):media.timed_recipe(r,'arun-membership',{'beats':[[.4,3],[.8,1]]},4)

    def test_export_before_any_judgment_remains_incomplete(self):
        f=self.folder/'encoded.mp4';f.write_bytes(b'stand-in')
        self.board['outputs']=[{'media':media.file_fact(self.folder,f)}]
        status=edit.status(self.folder,self.board)
        self.assertTrue(status['exported']);self.assertFalse(status['completed'])
        self.assertIn('read-script',status['pending'])

    def test_long_sentence_is_read_exactly_once_across_pages(self):
        units=[{'id':'U001','quote':'甲'*4200},{'id':'U002','quote':'乙'*800}]
        i=at=0;seen=''
        while i is not None:
            rows,i,at=edit.reading_page(units,i,at)
            text=''.join(r['quote'] for r in rows)
            self.assertLessEqual(len(text),2300);seen+=text
        self.assertEqual(seen,''.join(u['quote'] for u in units))

    def test_portable_continuation_preserves_existing_project_instructions(self):
        p=self.folder/'older';p.mkdir()
        original='Use the existing project conventions.'
        (p/'AGENTS.md').write_text(original,encoding='utf8')
        edit.ensure_project_entry(p);edit.ensure_project_entry(p)
        self.assertEqual((p/'AGENTS.md').read_text(encoding='utf8'),original)
        self.assertIn('revise --unit',(p/'继续剪辑.md').read_text(encoding='utf8'))
        self.assertTrue((p/'continue_edit.py').is_file())

    def test_external_revision_checks_unchanged_shots_before_writing(self):
        import episode_revision
        self.second['trial']={'sha256':'unchanged'}
        p=self.folder/'external.mp4';p.write_bytes(b'test')
        with patch('episode_export.conform',side_effect=ValueError('another shot changed')) as check:
            with self.assertRaisesRegex(ValueError,'another shot'):
                episode_revision.adopt(self.folder,self.board,self.second,p)
        check.assert_called_once_with(self.folder,self.board,p.resolve(),replacing='U002')
        self.assertEqual(self.second['trial'],{'sha256':'unchanged'})
        self.assertEqual(self.board['outputs'],[])
