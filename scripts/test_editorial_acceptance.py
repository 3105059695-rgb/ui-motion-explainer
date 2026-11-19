"""Regression checks for reference clocks, field composition, review state and subtitle-only edits."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import caption_edit
import editorial_proofs
import hyperframes_shot
import reference_edits as edits
import shot_direction as art


class EditorialAcceptance(unittest.TestCase):
    def test_subtitle_change_survives_fresh_process_without_media(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            raw='1\n00:00:37,000 --> 00:00:39,400\n前一句\n\n2\n00:00:39,400 --> 00:00:40,240\n进入应甪层\n'
            srt=folder/'原稿.srt'
            srt.write_text(raw,encoding='utf-16')
            edits.write(folder/'caption-shot-map.json',{'fps':25,'shots':[{'id':'上游','start':0,'end':985},{'id':'应用','start':985,'end':1010}]})
            def invoke(action,*args,ok=True):
                runner=Path(__file__).with_name('ui.py')
                env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1')
                res=subprocess.run([sys.executable,'-B','-X','utf8',str(runner),'direct','--',action,'--project',str(folder),*args],
                                   capture_output=True,env=env)
                self.assertEqual(res.returncode==0,ok,res.stderr+res.stdout)
                return json.loads(res.stdout) if ok else None
            invoke('captions','--import-srt',str(srt))
            current=invoke('resume','--at','00:39.40')
            self.assertEqual(current['shots'][0]['id'],'应用')
            self.assertEqual(current['cue']['id'],2)
            invoke('captions','--at','39.400','--expect','进入应甪层','--text','进入应用层')
            invoke('captions','--at','39.400','--expect','进入应甪层','--text','错字',ok=False)
            self.assertEqual(invoke('captions')['last']['cue']['text'],'进入应用层')
            out=folder/'修订.srt'
            invoke('captions','--out',str(out))
            self.assertEqual(out.read_text(encoding='utf-8-sig'),raw.replace('甪','用'))
            self.assertEqual(srt.read_text(encoding='utf-16'),raw)

    def test_ambiguous_cues_require_their_real_id(self):
        with tempfile.TemporaryDirectory() as temp:
            folder=Path(temp)
            source=folder/'a.srt'
            source.write_text('1\n00:00:00,000 --> 00:00:02,000\n甲\n\n2\n00:00:00,800 --> 00:00:03,000\n乙',encoding='utf-8')
            caption_edit.edit(folder,source=source)
            with self.assertRaisesRegex(ValueError,'unique'):
                caption_edit.edit(folder,'1')
            self.assertEqual(caption_edit.edit(folder,'1',cue=2)['cue']['text'],'乙')

    def test_review_only_accepts_the_matching_subtitle_revision(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(art,'comparison_rows',return_value=[]):
            folder=Path(tmp); path=folder/'revision.bin'
            path.write_bytes(b'receipt fixture')
            timeline=folder/'reference-timeline.json';edits.write(timeline,{})
            edits.write(folder/'reference-render.json',{'sha256':'clean-hash','timeline_sha256':edits.digest(timeline)})
            sidecar=path.with_suffix('.bin.captions.json')
            cues=[{'start_ms':39400,'end_ms':40000,'text':'应用'}]
            record={'kind':'ui-motion-fusion/dialogue-remux','picture_sha256':'clean-hash','file_sha256':edits.digest(path),'cues':cues}
            edits.write(sidecar,record)
            html=art.review_page(folder,path,art.ROOT,lambda f:f.as_uri())
            self.assertIn('39400',html)
            edits.write(sidecar,{**record,'picture_sha256':'another-cut'})
            with self.assertRaisesRegex(ValueError,'matching subtitle'):
                art.review_page(folder,path,art.ROOT,lambda f:f.as_uri())

    def test_field_evidence_obstructions_and_duplicate_origins(self):
        evidence={'origin':'workshop-camera','subject':'工位 A','claim_subject':'工位 A','use':'direct','gain':'夹具先闭合，物料随后定位。'}
        field={'start_frame':12,'end_frame':36,'in':1,'path':'机位.mp4','main_has_face':False,'protect':[[.3,.2,.5,.5]],
               'footage':evidence,'subtitle':[.1,.86,.8,.1],'inset':[.01,.66,.2,.12]}
        cuts=edits.field_cuts([field],None,24,48,True)
        self.assertEqual(cuts[0]['source_in'],1)
        for invalid in ({'main_has_face':True},{'inset':[.4,.2,.2,.2]},{'inset':[.1,.86,.2,.1]},
                        {'footage':{**evidence,'claim_subject':'另一个项目'}}):
            with self.assertRaises(ValueError):
                edits.field_cuts([{**field,**invalid}],None,24,48,True)
        crop={**cuts[0],'src':'crop'}
        rename={**crop,'footage':{**evidence,'origin':'mistaken-new-origin'}}
        self.assertEqual(edits.footage_count([],cuts+[crop,rename]),1)

    def test_comparison_retains_clock_and_distinguishes_studies(self):
        source={'source_id':'test'}
        original={'basis':'original','path':'private.mp4','label':'原片'}
        replay={'basis':'replay','path':'study.html','label':'重演'}
        borrow={'basis':'original','seconds':[3,5],'seen':'normal-silent','use':'停在同一个物体上'}
        self.assertTrue(art.motion_viewed(borrow))
        self.assertFalse(art.motion_viewed({**borrow,'seen':'frames'}))
        self.assertFalse(art.motion_viewed({**borrow,'basis':'still'}))
        with patch.object(art,'source_reference',return_value=original):
            self.assertEqual(art.annotated_reference(Path('.'),source,{},borrow)['range'],[3,5])
        with patch.object(art,'source_reference',return_value=replay):
            missing=art.annotated_reference(Path('.'),source,{},borrow)
            self.assertTrue(missing['substitution'])
            self.assertNotIn('range',missing)
            with self.assertRaises(ValueError):
                art.annotated_reference(Path('.'),source,{},borrow,checking=True)
            with self.assertRaises(ValueError):
                art.annotated_reference(Path('.'),source,{},dict(borrow,basis='still'))

    def test_proof_frames_do_not_unlock_an_original_sound_master(self):
        with tempfile.TemporaryDirectory() as tmp, patch.object(editorial_proofs,'edit_signature',return_value='cut'), patch.object(edits,'digest',return_value='fixture'):
            folder=Path(tmp)
            ranges=[[0,250],[350,550]]
            clips=[{'file':'editorial-proofs/test/'+name+'.mp4','master_frames':span,'sha256':'fixture'} for name,span in zip(('opening','transition'),ranges)]
            metadata={'signature':'cut','clips':clips,'ranges':ranges,'inspection':{'scope':'phone-frames'}}
            edits.write(folder/editorial_proofs.RECEIPT,metadata)
            with self.assertRaisesRegex(ValueError,'normal speed'):
                editorial_proofs.check(folder,{'narration':'original'})
            metadata['inspection']['scope']='normal-sound'
            edits.write(folder/editorial_proofs.RECEIPT,metadata)
            self.assertEqual(editorial_proofs.check(folder,{'narration':'original'})['signature'],'cut')

    def test_hierarchy_encodes_spoken_order_and_late_focus(self):
        with tempfile.TemporaryDirectory() as tmp:
            folder=Path(tmp);file=folder/'cues.json'
            cue={'duration':5,'levels':[{'text':'芯片','at':.1},{'text':'云','at':1},{'text':'模型','at':2},{'text':'应用','at':3}],
                 'focus':3,'focus_at':3.8}
            edits.write(file,cue)
            result=hyperframes_shot.hierarchy(art.ROOT,file,folder/'hf')
            self.assertIn('window.__timelines',Path(result['entry']).read_text(encoding='utf-8'))
            content=Path(result['editable']).read_text(encoding='utf-8').split('=',1)[1].rstrip(';\n')
            score=json.loads(content)
            self.assertEqual(score['levels'],cue['levels'])
            self.assertEqual(score['palette']['purple'],'#D6C2FF')
            edits.write(file,{**cue,'focus_at':2.5})
            with self.assertRaises(ValueError):
                hyperframes_shot.hierarchy(art.ROOT,file,folder/'invalid')
