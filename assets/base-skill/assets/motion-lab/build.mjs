import fs from 'node:fs';
import path from 'node:path';
const scenes=[['X21','depth','makeDepth','纵深归并'],['X22','zoom','makeZoom','连续推镜'],['X23','handoff','makeHandoff','遮罩接力']];
const out=process.cwd();
function build(selected,file){
 const duration=selected.length*9;
 const sources=selected.map(([,slug])=>fs.readFileSync(path.join(out,'scenes',slug+'.js'),'utf8')).join('\n');
 const markup=selected.map(([,slug])=>`<div id="mount-${slug}" class="scene-mount"></div>`).join('\n');
 const calls=selected.map(([id,slug,factory,title],i)=>`{
 const mount=document.getElementById('mount-${slug}');
 const child=window.${factory}(gsap,mount);
 child.paused(false); master.add(child,${i*9});
 master.set(mount,{opacity:1},${i*9});
 ${i<selected.length-1?`master.set(mount,{opacity:0},${i*9+9});`:''}
 master.set('#sample-id',{textContent:'${id}'},${i*9});
 master.set('#sample-name',{textContent:'${title}'},${i*9});
}`).join('\n');
 const html=`<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>UI Motion Lab</title>
 <style>
 @font-face{font-family:ProjectSans;src:url('assets/Chinese-regular.woff2') format('woff2');font-weight:400;font-display:block}
 @font-face{font-family:ProjectSans;src:url('assets/Chinese-bold.woff2') format('woff2');font-weight:700;font-display:block}
 @font-face{font-family:ProjectDisplay;src:url('assets/Outfit-Bold.ttf') format('truetype');font-weight:700;font-display:block}
 *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#FAF9FC;font-family:ProjectSans,sans-serif}
 #main{position:relative;width:100%;height:100%;overflow:hidden;background:#FAF9FC}
 .scene-mount{position:absolute;inset:0;opacity:0}
 #lab-footer{position:absolute;left:120px;right:120px;bottom:44px;height:68px;border-top:1px solid #DDD4E6;display:flex;align-items:flex-end;justify-content:space-between;color:#75677F;font-size:23px;z-index:100}
 #lab-footer strong{font-family:ProjectDisplay,sans-serif;font-size:30px;color:#7950B8;margin-right:18px}
 #lab-footer b{font-weight:400;color:#493B58}
 #lab-progress{position:absolute;left:120px;right:120px;height:3px;bottom:112px;background:linear-gradient(90deg,#4F3175,#AC7DD1);transform-origin:left center;z-index:100}
 </style><script src="assets/gsap.min.js"></script><script src="assets/motion-blur.js"></script></head><body>
 <div id="main" data-composition-id="main" data-width="1920" data-height="1080" data-duration="${duration}" data-fps="50">
 ${markup}
 <div id="lab-progress"></div><div id="lab-footer"><div><strong id="sample-id">${selected[0][0]}</strong><b id="sample-name">${selected[0][3]}</b></div><div>黑白紫 UI · 原创动效参考 · 无声</div></div>
 </div><script>
 ${sources}
 window.__timelines=window.__timelines||{};
 const master=gsap.timeline({paused:true});
 ${calls}
 master.fromTo('#lab-progress',{scaleX:0},{scaleX:1,duration:${duration},ease:'none'},0);
 // Materialize the first frame even when a viewer first asks for time(0).
 master.time(0.0001,true).time(0,true);
 window.__timelines.main=master;
 // Only the external viewer/renderer drives this registered timeline.
 </script></body></html>`;
 fs.mkdirSync(path.dirname(path.join(out,file)),{recursive:true});
 fs.writeFileSync(path.join(out,file),html.split('\n').map(line=>line.trimEnd()).join('\n'));
}
build(scenes,'index.html');
for(const scene of scenes)build([scene],'compositions/'+scene[0]+'.html');
console.log('Built 27s index and three 9s compositions.');
