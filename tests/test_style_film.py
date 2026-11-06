"""Verify complete source coverage and truthful continuous-viewing metadata."""
import json
from pathlib import Path
import sys
import unittest

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import style_film

class StyleFilmTests(unittest.TestCase):
 def test_all_original_designs_keep_full_order_and_source_ranges(self):
  source=style_film.read(ROOT/'assets/agent-editorial/source-designs.json')
  film=style_film.read(ROOT/'assets/style-film/manifest.json')
  self.assertEqual([d['id'] for d in source['designs']],[c['id'] for c in film['chapters']])
  cursor=0
  for original,chapter in zip(source['designs'],film['chapters']):
   self.assertEqual(original['source_range'],chapter['source_range'])
   self.assertEqual(cursor,chapter['start'])
   self.assertAlmostEqual(chapter['duration'],original['source_range'][1]-original['source_range'][0])
   self.assertEqual(original['source_sha256'],style_film.digest(ROOT/'assets/agent-editorial'/original['source_file']))
   cursor=chapter['end']
  self.assertEqual(cursor,film['duration_seconds'])
  self.assertEqual(len(film['chapters']),10)

 def test_complete_movie_and_aigc_are_independent_and_inspection_is_not_viewing(self):
  film=style_film.inspect(ROOT)
  self.assertEqual(film['viewing_status'],'not-observed-by-this-command')
  self.assertNotEqual(film['movie_path'],film['aigc_movie_path'])
  self.assertTrue(Path(film['aigc_movie_path']).is_file())
  self.assertIn('not the approved original movie',film['approval_scope'])
  self.assertTrue(film['continuous'])

 def test_public_manifest_contains_no_absolute_private_media_path(self):
  text=(ROOT/'assets/style-film/manifest.json').read_text(encoding='utf-8')
  for marker in ('E:/','D:/','C:/','E:\\\\','D:\\\\','C:\\\\','resources.local.json'):
   self.assertNotIn(marker,text)

if __name__=='__main__':unittest.main()
