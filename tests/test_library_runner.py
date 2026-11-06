"""Focused tests for portable source binding and the media seek server."""
import importlib.util
import json
from pathlib import Path
import sys
import tempfile
import threading
import unittest
from functools import partial
from urllib.request import Request,urlopen
from urllib.error import HTTPError

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import library_runner as runner
from library_html_runner import QuietHandler,ThreadingHTTPServer

class LibraryBindingTests(unittest.TestCase):
 def test_current_theme_binding_is_explicit(self):
  code="const accent='#8554E8';const brand='#00A67E';const title='旧标题';"
  updated,counts=runner._replace(code,{'旧标题':'本期标题'},{'accent':'#D6C2FF'})
  self.assertIn('#D6C2FF',updated);self.assertIn('#00A67E',updated);self.assertEqual(counts,{'旧标题':1})
 def test_bound_defaults_do_not_reintroduce_old_copy(self):
  original={'spec':{'words':['旧词','品牌'],'accent':'#8554E8'}}
  bound=runner._bound_values(original,{'text':{'旧词':'新词'},'palette':{'accent':'#D6C2FF'}})
  self.assertEqual(bound,{'spec':{'words':['新词','品牌'],'accent':'#D6C2FF'}})
 def test_relative_asset_paths_cannot_escape_project(self):
  for name in ['../outside.mp4','C:/private.mp4','a\\b.mp4']:
   with self.assertRaises(ValueError):runner.safe(ROOT,name)
 def test_independent_reference_route_precedes_old_catalog(self):
  for ident in ['reference:samaote-5e2fc2','reference:anilraok-eff262']:
   if (ROOT/'assets/rebuilt-library/scenes'/(ident.split(':')[1]+'.json')).is_file():self.assertIsNotNone(runner._rebuilt(ident,ROOT))
 def test_production_retained_sample_rejects_missing_media(self):
  with tempfile.TemporaryDirectory() as temp:
   spec={'schema':'ui-motion-fusion/library-binding@1','id':'sample:fangmu/body-car-v2','props':{},'media':{},'text':{},'palette':{}}
   with self.assertRaisesRegex(ValueError,'media|Media|binding|Binding'):runner.build(spec,Path(temp)/'project',ROOT)

class ByteRangeTests(unittest.TestCase):
 def test_media_seek_requests_receive_exact_ranges(self):
  with tempfile.TemporaryDirectory() as temp:
   data=bytes(range(256))*40;Path(temp,'video.mp4').write_bytes(data)
   server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=temp));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
   try:
    url=f'http://127.0.0.1:{server.server_port}/video.mp4'
    for query,expected in [('bytes=100-199',data[100:200]),('bytes=9000-',data[9000:]),('bytes=-100',data[-100:])]:
     with urlopen(Request(url,headers={'Range':query})) as response:
      self.assertEqual(response.status,206);self.assertEqual(response.headers['Accept-Ranges'],'bytes');self.assertEqual(response.read(),expected)
    with self.assertRaises(HTTPError) as error:urlopen(Request(url,headers={'Range':'bytes=99999-'}))
    self.assertEqual(error.exception.code,416)
    with urlopen(url) as response:self.assertEqual(response.read(),data)
   finally:server.shutdown();server.server_close()

if __name__=='__main__':unittest.main()
