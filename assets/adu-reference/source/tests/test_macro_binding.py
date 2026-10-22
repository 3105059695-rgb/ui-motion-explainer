import hashlib
import sys
from pathlib import Path
import unittest
import tempfile
from unittest.mock import patch
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from build_macro_project import bind_authored_block
from adapt_project import AdaptError

class MacroBindingTests(unittest.TestCase):
    def test_copied_media_bindings_are_relative_to_exported_project(self):
        from build_macro_project import copy_media
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp); stage=root/'project'; (stage/'assets').mkdir(parents=True)
            source=root/'private-photo.png'; source.write_bytes(b'test image payload')
            item={'id':'one', 'slots':{'photo':str(source)},
                  'bindings':[{'id':'photo','type':'image','value':str(source)}]}
            scene={'slots':[{'id':'photo','type':'image','sourceAsset':'assets/original.png'}]}
            block,_=copy_media(stage,{},item,scene,"img('original.png')",set())
            value=item['slots']['photo']
            self.assertFalse(Path(value).is_absolute())
            self.assertEqual((stage/value).read_bytes(),source.read_bytes())
            self.assertEqual(item['bindings'][0]['value'],value)
            self.assertNotIn(str(root),block)

    def test_selected_square_scene_requires_explicit_or_automatic_tracking(self):
        import json
        from build_macro_project import needs_face_tracking, prepare_face
        root=Path(__file__).resolve().parents[1]
        pack=json.loads((root/'packs/anim3/manifest.json').read_text())
        prelude=(root/'packs/anim3/scenes.js').read_text().split('/* ---------- S1')[0]
        self.assertFalse(needs_face_tracking(pack,{'scenes':[{'source_scene_index':0}]},prelude))
        self.assertTrue(needs_face_tracking(pack,{'scenes':[{'source_scene_index':5}]},prelude))
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(AdaptError):
                prepare_face(Path(tmp),{'faceTracking':{'mode':'none'}},True,60,120)
            result=prepare_face(Path(tmp),{'faceTracking':{'mode':'fixed','cx':.5,'cy':.7,'h':.2}},True,60,120)
            self.assertEqual(result['mode'],'explicit-fixed')

    def test_audio_recipe_is_saved_with_project(self):
        from build_macro_project import write_project_audio
        with tempfile.TemporaryDirectory() as tmp:
            stage=Path(tmp)
            write_project_audio(stage,{'mode':'synth'})
            self.assertTrue((stage/'audio_runtime/macro_audio.py').is_file())
            self.assertTrue((stage/'audio_runtime/audiolib.py').is_file())
            self.assertNotIn('ADU_MOTION_VIDEO_ROOT',(stage/'audio.py').read_text())

    def test_none_music_is_recorded_and_does_not_synthesize_a_score(self):
        import json
        import wave
        import numpy as np
        from build_macro_project import write_project_audio
        from macro_audio import render
        with tempfile.TemporaryDirectory(prefix='adu-audio-') as tmp:
            stage=Path(tmp)
            write_project_audio(stage,{'mode':'none'})
            self.assertIn('mode=music["mode"]',(stage/'audio.py').read_text(encoding='utf-8'))
            plan={'fps':60,'end_frame':12,'audio':{'sfxMixSource':'runtime-scene-S-only',
                  'sections':[{'mode':'synth','start':0,'end':.2}],
                  'specialEvents':[{'type':'piano-note','at':0,'note':60}]}}
            (stage/'macro_plan.json').write_text(json.dumps(plan),encoding='utf-8')
            (stage/'sfx.json').write_text(json.dumps({'end':.2,'sfx':[{'type':'click','t':.1}]}),encoding='utf-8')
            (stage/'voice.wav').write_bytes(b'preserved-narration-test-fixture')
            with patch('macro_audio.render_bed',side_effect=AssertionError('music must stay silent')), \
                 patch('macro_audio.render_special',side_effect=AssertionError('musical events must stay silent')):
                render(stage,mode='none')
            with wave.open(str(stage/'bgm.wav'),'rb') as audio:
                self.assertFalse(np.any(np.frombuffer(audio.readframes(audio.getnframes()),dtype='<i2')))
            self.assertEqual((stage/'voice.wav').read_bytes(),b'preserved-narration-test-fixture')
            report=json.loads((stage/'macro_audio_report.json').read_text(encoding='utf-8'))
            self.assertEqual(report['mode'],'none')
            self.assertEqual(report['sfx'],1)
            self.assertEqual(report['specialEvents'],0)

    def test_supplied_text_font_keeps_geometry_and_adds_windows_fallback(self):
        from build_macro_project import configure_text_font
        with tempfile.TemporaryDirectory(prefix='adu-font-') as tmp:
            base=Path(tmp);stage=base/'project';(stage/'assets').mkdir(parents=True)
            (base/'中文字体.woff2').write_bytes(b'font-copy-fixture')
            original="body{font-family:-apple-system,'PingFang SC',sans-serif}.h1{font-size:108px;font-weight:600;letter-spacing:-1.5px}"
            css,report=configure_text_font(original,stage,{'textFontFile':'中文字体.woff2'},base)
            self.assertIn('.h1{font-size:108px;font-weight:600;letter-spacing:-1.5px}',css)
            self.assertIn('Microsoft YaHei',css)
            self.assertIn("font-family:'AduText'",css)
            self.assertEqual(report['mode'],'supplied')
            self.assertEqual((stage/'assets/text.woff2').read_bytes(),b'font-copy-fixture')
            with self.assertRaises(AdaptError):
                configure_text_font(original,stage,{'textFontFile':'missing.woff2'},base)

    def test_presenter_crop_is_explicit_and_checked_against_source(self):
        from build_macro_project import presenter_crop_args
        from import_talk import validate_crop
        self.assertEqual(presenter_crop_args({}),[])
        self.assertIsNone(validate_crop(None,{'width':1920,'height':1080}))
        crop=[773,0,606,1080]
        self.assertEqual(presenter_crop_args({'presenterCrop':crop}),['--crop','773','0','606','1080'])
        self.assertEqual(presenter_crop_args({'presenterCrop':dict(zip(('x','y','width','height'),crop))}),
                         ['--crop','773','0','606','1080'])
        self.assertEqual(validate_crop(crop,{'width':1920,'height':1080})['x'],773)
        for invalid in ([0,0,1921,1080],[-1,0,600,1080],[0,0,600,1081],[0,0,True,1080]):
            with self.assertRaises(ValueError):
                validate_crop(invalid,{'width':1920,'height':1080})
        with self.assertRaises(ValueError):
            validate_crop(crop,{'width':1920,'height':1080,'tags':{'rotate':90}})
        with self.assertRaises(AdaptError):
            presenter_crop_args({'presenterCrop':{'x':0,'y':0,'width':600}})

    def test_import_crop_keeps_the_same_complete_voice(self):
        import json
        import shutil
        import subprocess
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('requires existing ffmpeg and ffprobe')
        script=Path(__file__).resolve().parents[1]/'scripts/import_talk.py'
        with tempfile.TemporaryDirectory(prefix='adu-crop-') as tmp:
            root=Path(tmp);source=root/'中文口播.mp4'
            subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','testsrc2=size=64x96:rate=60',
                            '-f','lavfi','-i','sine=frequency=440:sample_rate=48000','-t','0.2',
                            '-c:v','libx264','-c:a','aac',str(source)],check=True,capture_output=True)
            reports=[]
            for name,extra in [('完整',[]),('裁切',['--crop','11','4','32','64'])]:
                project=root/name;project.mkdir()
                result=subprocess.run([sys.executable,'-X','utf8',str(script),str(project),str(source),
                                       '--fps','60','--size','32x64',*extra],
                                      check=True,capture_output=True,text=True,encoding='utf-8')
                reports.append(json.loads(result.stdout))
                self.assertEqual(len(list((project/'talk/clip_000').glob('f_*.jpg'))),12)
            self.assertEqual((root/'完整/voice.wav').read_bytes(),(root/'裁切/voice.wav').read_bytes())
            self.assertIsNone(reports[0]['presenterCrop'])
            self.assertEqual(reports[1]['presenterCrop'],{'x':11,'y':4,'width':32,'height':64})
            self.assertEqual(reports[1]['frames'],reports[0]['frames'])

    def test_media_names_do_not_collide_after_unicode_normalization(self):
        from build_macro_project import safe_name
        self.assertNotEqual(safe_name('开场\0photo'), safe_name('结尾\0photo'))
        self.assertNotEqual(safe_name('a_b\0c'), safe_name('a\0b_c'))

    def test_short_text_changes_only_reviewed_span(self):
        block = "const css='overflow:hidden;width:60px'; const label='low';"
        start = block.rindex("low")
        scene = {"sourceBlockSha256": hashlib.sha256(block.encode()).hexdigest(), "slots": [{"id":"status","type":"text","sourceText":"low","sourceSpans":[{"start":start,"end":start+3}]}]}
        result, _ = bind_authored_block(block, scene, {"status":"ready"}, "test")
        self.assertIn("overflow:hidden;width:60px", result)
        self.assertIn("label='ready'", result)
        with self.assertRaises(AdaptError): bind_authored_block(block + " ", scene, {"status":"ready"}, "test")

    def test_overlapping_spans_fail_instead_of_guessing(self):
        block = "const label='example';"
        start=block.index("example")
        slot={"id":"a","type":"text","sourceText":"example","sourceSpans":[{"start":start,"end":start+7}]}
        scene={"sourceBlockSha256":hashlib.sha256(block.encode()).hexdigest(),"slots":[slot,{**slot,"id":"b"}]}
        with self.assertRaises(AdaptError):bind_authored_block(block,scene,{"a":"one","b":"two"},"test")

    def test_all_public_text_ranges_match_and_are_disjoint(self):
        import json
        from build_macro_project import scene_parts
        root=Path(__file__).resolve().parents[1]
        for pack in ("anim3","anim4"):
            folder=root/"packs"/pack
            manifest=json.loads((folder/"manifest.json").read_text())
            _,blocks=scene_parts((folder/"scenes.js").read_text())
            self.assertEqual(len(blocks),len(manifest["scenes"]))
            for scene,block in zip(manifest["scenes"],blocks):
                values={}
                for slot in scene["slots"]:
                    if slot["type"] in ("text","dynamicText"):values[slot["id"]]="Test"
                    elif slot["type"]=="number":values[slot["id"]]=7
                bound,_=bind_authored_block(block,scene,values,pack+"."+scene["id"])
                self.assertTrue(bound)

if __name__ == "__main__":unittest.main()
