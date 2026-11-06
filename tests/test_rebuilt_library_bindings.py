"""Production retiming keeps media source clocks independent from scene timing."""
import json,sys,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts'))
import rebuilt_library as library
class RebuiltBindingsTest(unittest.TestCase):
 def test_retime_video_offsets_without_stretching_source_clock(self):
  with tempfile.TemporaryDirectory(prefix='ui-bound-clock-') as temp:
   base=Path(temp);ident='fredtalk:fred-wave2-42-t05f';scene=library.read(library.scene_path(ident))
   spec={'id':ident,'mode':'production','duration':12,'assets':{k:str(ROOT/'assets/style-film/current-style-full.mp4') for k in scene['assets']},'media_tracks':{'phone2':{'start':4.2,'source_in':1.5}}}
   path=base/'bindings.json';path.write_text(json.dumps(spec),encoding='utf-8');library.materialize(path,base/'project')
   data=(base/'project/scene.js').read_text(encoding='utf-8').splitlines()[0];actual=json.loads(data[len('window.REBUILT_SPEC='):-1])
   self.assertEqual(actual['media_tracks']['phone1']['start'],3.6)
   self.assertEqual(actual['media_tracks']['phone2']['start'],4.2)
   self.assertEqual(actual['media_tracks']['phone2']['source_in'],1.5)
   self.assertEqual(actual['media_tracks']['phone1']['rate'],1)
 def test_production_missing_media_does_not_create_project(self):
  with tempfile.TemporaryDirectory(prefix='ui-no-media-') as temp:
   base=Path(temp);path=base/'bindings.json';path.write_text(json.dumps({'id':'fredtalk:fred-wave2-42-t05f'}),encoding='utf-8')
   with self.assertRaisesRegex(ValueError,'Bind current production media'):library.materialize(path,base/'project')
   self.assertFalse((base/'project').exists())
if __name__=='__main__':unittest.main()
