"""Regression checks for source motion/media preservation and material boundaries."""
import json,subprocess,tempfile,unittest
from pathlib import Path
import library_ui_style
ROOT=Path(__file__).resolve().parents[1]

class MaterialAdapterTests(unittest.TestCase):
 def test_style_preserves_motion_masks_and_brand_pixels(self):
  module=str(ROOT/'assets/library-runtime/current-ui/roles.js')
  code="""const assert=require('node:assert/strict'),ui=require(MODULE);
const s={background:'#f7f7f7',fontFamily:'Old',fontSize:44,borderRadius:18,width:600,height:300,transform:'perspective(800px) rotateY(23deg)',opacity:.37,clipPath:'inset(0 42% 0 0)',filter:'blur(1px)'};
const result=ui.style(s,'div card');
for(const k of ['width','height','transform','opacity','clipPath','filter'])assert.equal(result[k],s[k]);
assert.ok(result.boxShadow);assert.notEqual(result.fontFamily,s.fontFamily);
assert.deepEqual(ui.style(s,'img photograph'),s);
assert.equal(ui.style({background:'#07C160',borderRadius:12},'button').background,'#07C160');
assert.equal(ui.style({background:'#ddd',width:31,height:31,borderRadius:'50%'},'div').boxShadow,undefined);
assert.equal(ui.role('stage'),'layout');
assert.equal(ui.style({background:'#2462EA',color:'white'},'div window').background,'#0B0B0F');
assert.equal(ui.style({background:'#2462EA',color:'white'},'div brand window').background,'#2462EA');
assert.equal(ui.style({background:'#07C160'},'div status panel').background,'#07C160');
assert.equal(ui.style({background:'#07C160',borderRadius:14},'div').background,'#07C160');
assert.equal(ui.font('700 32px GeistMono'),'700 32px GeistMono');
let draws=0;const ctx={fillStyle:'#fff',canvas:{width:1920},globalAlpha:.4,globalCompositeOperation:'source-over',save(){},restore(){}};
ui.paintSurface(ctx,()=>draws++);assert.equal(draws,1);assert.equal(ctx.globalAlpha,.4);
""".replace('MODULE',json.dumps(module))
  subprocess.run(['node','-e',code],check=True,capture_output=True)

 def test_ast_does_not_replace_source_animation_or_media(self):
  with tempfile.TemporaryDirectory() as temp:
   folder=Path(temp);source=folder/'scene.tsx'
   original="""import React from 'react';
const t=12.34;
export const Scene=()=> <div style={{width:600,height:300,background:'#fff',borderRadius:18,transform:`translateX(${Math.sin(t)*40}px)`,clipPath:'inset(0 20% 0 0)'}}><img src='real-brand.png' style={{width:100,filter:'contrast(1.2)'}}/>真实内容</div>;
"""
   source.write_text(original,encoding='utf-8')
   cfg={'project':temp,'node_modules':library_ui_style._modules(),'files':[str(source)],'report':str(folder/'report.json')}
   (folder/'config.json').write_text(json.dumps(cfg),encoding='utf-8')
   subprocess.run(['node',str(ROOT/'assets/library-runtime/current-ui/transform.cjs'),str(folder/'config.json')],check=True,capture_output=True)
   result=source.read_text(encoding='utf-8')
   self.assertIn('Math.sin(t)*40',result);self.assertIn("clipPath:'inset(0 20% 0 0)'",result)
   self.assertIn("<img src='real-brand.png' style={{width:100,filter:'contrast(1.2)'}}/>",result)
   self.assertIn('真实内容',result);self.assertIn('__uiFusionCurrent.style',result)
   self.assertEqual(json.loads((folder/'report.json').read_text())[0]['jsxStyles'],1)

 def test_stateful_canvas_primitive_keeps_all_source_controls(self):
  with tempfile.TemporaryDirectory() as temp:
   folder=Path(temp);source=folder/'scene.js'
   original="""function card(x,y,w,h,c,alpha,t){ctx.save();ctx.globalAlpha=alpha;ctx.translate(Math.sin(t)*40,0);ctx.beginPath();ctx.rect(0,0,80,80);ctx.clip();ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x,y,w,h,18);ctx.fill();ctx.restore();}
function rr(x,y,w,h,r,col,alpha=1){if(w<=0||h<=0)return;const savedAlpha=ctx.globalAlpha;ctx.globalAlpha=savedAlpha*alpha;ctx.fillStyle=col;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill();ctx.globalAlpha=savedAlpha;}
const P={paper:'#fff',pink:'#fe66a1',green:'#00ff22',blue:'#1234ff'};
"""
   source.write_text(original,encoding='utf-8');cfg={'project':temp,'node_modules':library_ui_style._modules(),'files':[str(source)],'report':str(folder/'report.json'),'guarded_ui_primitives':{str(source):['rr']}}
   (folder/'config.json').write_text(json.dumps(cfg),encoding='utf-8')
   subprocess.run(['node',str(ROOT/'assets/library-runtime/current-ui/transform.cjs'),str(folder/'config.json')],check=True,capture_output=True)
   result=source.read_text(encoding='utf-8')
   for part in ['ctx.globalAlpha=alpha','ctx.translate(Math.sin(t)*40,0)','ctx.clip()','ctx.restore()',"pink:'#fe66a1'","green:'#00ff22'","blue:'#1234ff'"]:self.assertIn(part,result)
   self.assertEqual(json.loads((folder/'report.json').read_text())[0]['canvasSurfaces'],0)
   self.assertIn('if(w<=0||h<=0)return',result);self.assertIn('ctx.globalAlpha=savedAlpha',result)
   self.assertIn('paintSurface(ctx,()=>ctx.fill(),w,h)',result)

 def test_nested_html_loads_adapter_at_its_own_depth(self):
  with tempfile.TemporaryDirectory() as temp:
   folder=Path(temp);child=folder/'nested';child.mkdir()
   (folder/'index.html').write_text('<html><head></head><body><iframe src="nested/index.html"></iframe></body></html>',encoding='utf-8')
   (child/'index.html').write_text('<html><head></head><body><script>function card(x,y,w,h,c){ctx.beginPath();ctx.roundRect(x,y,w,h,12);ctx.fillStyle=c;ctx.fill()}</script></body></html>',encoding='utf-8')
   library_ui_style.adapt_project(folder,{'id':'test:nested','engine':'html-seek','entry':'index.html'},ROOT,{'id':'test:nested'})
   self.assertIn('../_current-ui/roles.js',(child/'index.html').read_text(encoding='utf-8'))

if __name__=='__main__':unittest.main()
