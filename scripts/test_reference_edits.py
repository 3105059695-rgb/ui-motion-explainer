"""Full-source assignment, evidence, rendering inputs and coverage regressions."""
import json
from pathlib import Path
import tempfile
import unittest
import shutil
import subprocess

import reference_edits as edits
import reference_project_input
import video_routing
import video_sources


class SubmittedReferenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalog = video_sources.Catalog()
        cls.router = video_routing.Router(cls.catalog)
        cls.recipes, cls.negative = edits.rules(cls.catalog)

    def test_whole_inventory_is_independent_of_sentence_rank(self):
        result = self.router.plan('搜索原文。')
        coverage = result['all_submitted']
        self.assertEqual(set(self.recipes), {r['source_id'] for r in coverage['required']})
        self.assertEqual(6, len(coverage['diagnostic']))
        self.assertEqual([], coverage['applied'])
        self.assertFalse(coverage['complete'])
        self.assertLess(len(result['units'][0]['alternatives']),len(coverage['required']))
        self.assertEqual(len(self.recipes),len({json.dumps(r['layers'],sort_keys=True) for r in self.recipes.values()}))
        for source in coverage['required']:
            self.assertTrue(source['contribution'] and source['inputs'])

    def test_registered_real_motion_includes_each_atlas_source(self):
        atlas=video_sources.read(self.catalog.root,video_sources.ATLAS)['videos']
        index=edits.read(self.catalog.root/edits.MOTION)['sources']
        self.assertTrue({v['id'] for v in atlas} <= set(index))
        for ident in index:
            frame=edits.motion(self.catalog,ident,0,1)
            self.assertEqual(8,frame['sample_count'])
            self.assertEqual(4,len(frame['windows'][0]['change']))
        self.assertEqual(0,edits.motion(self.catalog,'sample:fangmu/opening-v5')['sample_count'])

    def test_incomplete_and_flat_still_do_not_qualify(self):
        with tempfile.TemporaryDirectory() as tmp:
            p=Path(tmp)
            (p/'script.txt').write_text('先展示完成的成果。',encoding='utf-8')
            edits.scaffold(self.router,p/'script.txt',p/'plan.json')
            spec=edits.read(p/'plan.json')
            key='girl-manual'
            shot=next(s for s in spec['shots'] if s['source_id']==key)
            shot.update(unit='U001',start_frame=0,end_frame=24)
            spec.update(shots=[shot],duration_frames=24,fps=12)
            for v in shot['inputs'].values():
                v['path']='still.png'
            (p/'still.png').write_bytes(b'not moving')
            edits.write(p/'one.json',spec)
            with self.assertRaisesRegex(ValueError,'missing submitted'):
                edits.compose(self.catalog,p/'one.json',p/'out')
            with self.assertRaisesRegex(ValueError,'Wrong media'):
                edits.compose(self.catalog,p/'one.json',p/'out',preview=True)
            self.assertFalse((p/'out').exists())
            self.assertFalse(list(p.glob('.reference-cut-*')))

    def test_hidden_source_and_empty_master_frames_are_detected(self):
        first={'id':'first','start':0,'end':8,'rect':[0,0,1,1]}
        left={'id':'left','start':0,'end':8,'rect':[0,0,.5,1]}
        right={**left,'id':'right','rect':[.5,0,.5,1]}
        with self.assertRaisesRegex(ValueError,'hidden'):
            edits._visibility([first,left,right],8,None)
        with self.assertRaisesRegex(ValueError,'Empty'):
            edits._visibility([left,right],9,None)
        edits._visibility([left,right],8,None)
        edits._visibility([left,right],9,'presenter.mp4')

    def test_nested_input_cannot_credit_an_unrelated_project_or_demo(self):
        with tempfile.TemporaryDirectory() as tmp:
            base=Path(tmp)
            proj=base/'actual'
            proj.mkdir()
            request={'source_id':'base-codex','capability':'capability:O21','project':'actual'}
            for actual,demo in [('O04',False),('O21',True)]:
                edits.write(proj/'motion-binding.json',{'effect':actual,'demo_content':demo})
                with self.assertRaisesRegex(ValueError,'does not match'):
                    reference_project_input.render_input(self.catalog,request,base,base/'output.mp4')
            with self.assertRaisesRegex(ValueError,'registered positive use'):
                reference_project_input.render_input(self.catalog,{**request,'source_id':'interview-g'},base,base/'output.mp4')

    def test_independent_component_requires_its_actual_bound_project(self):
        with tempfile.TemporaryDirectory() as tmp:
            base = Path(tmp)
            proj = base / 'current'
            proj.mkdir()
            req = {'project': 'current', 'capability': 'component:compare'}
            library = {'component:compare': {'execution_state': 'direct'}}
            edits.write(proj / 'library-project.json', {'id': 'component:compare'})
            with self.assertRaisesRegex(ValueError, 'current objects'):
                reference_project_input.render_input(self.catalog, req, base, base / 'out.mp4', library)
            with self.assertRaisesRegex(ValueError, 'executable catalog ID'):
                reference_project_input.render_input(self.catalog, {**req, 'capability': 'missing:example'},
                                                     base, base / 'out.mp4', library)

    def test_same_library_effect_with_two_episode_inputs_tracks_each_render(self):
        a = {'capability': 'component:compare', 'source_id': None}
        shots = [{'inputs': {'paper': {'src': 'media/abc.mp4', 'from_project': a},
                             'screen': {'src': 'media/xyz.mp4', 'from_project': a}}}]
        edits._label_project_inputs(shots)
        self.assertEqual({'component:compare @ abc', 'component:compare @ xyz'}, {
            reference_project_input.credit(item['from_project']) for item in shots[0]['inputs'].values()})

    @unittest.skipUnless(shutil.which('ffmpeg'),'Needs the existing FFmpeg installation')
    def test_still_encoded_as_a_video_is_not_acting(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            result=subprocess.run(['ffmpeg','-v','error','-f','lavfi','-i','color=blue:s=64x36:r=12:d=1',
                '-c:v','libx264','-pix_fmt','yuv420p',str(root/'frozen.mp4')],capture_output=True)
            self.assertEqual(result.returncode,0,result.stderr.decode(errors='replace'))
            with self.assertRaisesRegex(ValueError,'no decoded picture change'):
                edits.Media(root,root).require_motion('frozen.mp4',0,.75)

if __name__ == '__main__':
    unittest.main()
