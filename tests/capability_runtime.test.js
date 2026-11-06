/* Behavior checks, independent of a browser or generated preview assets. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const C=require('../assets/agent-editorial/capability-runtime.js');
const S=require('../assets/agent-editorial/source-designs.js');
const E=require('../assets/agent-editorial/agent-editorial.js');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/agent-editorial/capability-runtime.json'),'utf8'));
const sourceManifest=JSON.parse(fs.readFileSync(path.join(root,'assets/agent-editorial/source-designs.json'),'utf8'));
S.configure(sourceManifest);
const copy=v=>JSON.parse(JSON.stringify(v));
function example(type){return copy(manifest.capabilities.find(v=>v.id===type).example);}
function canvas(){
  const calls=[],stack=[];
  const target={canvas:{width:1920,height:1080},globalAlpha:1,
    save(){stack.push(this.globalAlpha);},restore(){assert.ok(stack.length,'balanced canvas save/restore');this.globalAlpha=stack.pop();},
    fillText(value,...args){calls.push(['text',value,...args]);},drawImage(...args){calls.push(['image',...args]);},
    roundRect(...args){this.lastRoundRect=args;calls.push(['roundRect',...args]);},fill(){calls.push(['fill',this.fillStyle,this.lastRoundRect]);},
    scale(...args){calls.push(['scale',...args]);},translate(...args){calls.push(['translate',...args]);},
    measureText(value){return {width:String(value).length*15};}};
  return {ctx:new Proxy(target,{get(t,k){if(k in t)return t[k];return (...args)=>calls.push([k,...args]);}}),calls,stack};
}
const assets={minutes:{width:1600,height:1000},presenter:{videoWidth:1920,videoHeight:1080}};
function draw(scene,time){const c=canvas();const result=scene({ctx:c.ctx,localTime:time,mediaTime:123.456,asset:id=>assets[id],layout:{stage:{x:0,y:0,w:1920,h:1080},contentRect:{x:0,y:0,w:1920,h:1080}}});assert.equal(c.stack.length,0);assert.equal(result.mediaTime,123.456);return {...c,result};}

// Counts come from objects, including values on either side of the old 300 limit.
for(const count of [1,7,37,301]){
  const event=example('parallel-groups');event.groups=[{id:'a',label:'A'},{id:'b',label:'B'}];
  event.objects=Array.from({length:count},(_,i)=>({id:'o'+i,label:'事项 '+i,group:i%2?'a':'b'}));event.stagger=0;
  const scene=C.createScene({duration:8,events:[event]});
  assert.equal(scene.sample(7)[0].objects.length,count);
  scene.sample(7)[0].objects.forEach(o=>{assert.equal(o.completed,true);assert.ok(o.rect.w>0&&o.rect.h>0);assert.ok(Number.isFinite(o.rect.x));});
  draw(scene,7);
}
const grouped=example('parallel-groups');grouped.objects[0].group='missing';
assert.throws(()=>C.createScene({duration:8,events:[grouped]}),/Unknown group/);
assert.throws(()=>C.createScene({duration:8,events:[{...example('input-result'),end:9}]}),/span/);
assert.throws(()=>C.createScene({duration:8,events:[{...example('input-result'),cues:{result:1,gather:3}}]}),/cue order/);
const compact=example('parallel-groups');compact.groupArea={x:15,y:160,w:1170,h:280};compact.showProgress=false;
const compactScene=C.createScene({duration:8,events:[compact]});
assert.ok(compactScene.sample(7.5)[0].panels.every(panel=>panel.y===160&&panel.h===280));
assert.equal(draw(compactScene,7.5).calls.filter(call=>call[0]==='arc').length,0,'Assignment-only events do not draw completion ticks');

// Stable object IDs update at the same cue, including changes/additions/removals.
const comparison=example('compare-change');comparison.after.pop();comparison.after.push({id:'new',label:'新视图'});
const compare=C.createScene({duration:8,events:[comparison]});
const changes=compare.sample(3.3)[0].objects;
assert.equal(changes.length,4);assert.equal(changes.find(o=>o.id==='reminder').after,null);
assert.equal(changes.find(o=>o.id==='new').before,null);
assert.equal(new Set(changes.map(o=>o.progress)).size,1);
const cmp=draw(compare,7);assert.ok(cmp.calls.some(c=>c[0]==='text'&&c[1].includes('周四')));
assert.ok(cmp.calls.some(c=>c[0]==='fill'&&c[1]==='#FFFFFF'&&c[2]?.[2]>300&&c[2]?.[3]>100),'Updated objects retain white physical surfaces');
assert.ok(cmp.calls.some(c=>c[0]==='fill'&&c[1]==='#D6C2FF'&&c[2]?.[2]===6),'Purple identifies the change with a thin accent');
assert.equal(cmp.calls.filter(c=>c[0]==='fill'&&c[1]==='#D6C2FF'&&c[2]?.[2]>300&&c[2]?.[3]>100).length,0,'No giant default purple updated card');

// Material actual draw calls focus, then return to source crop without retiming media.
const material=example('material-focus');delete material.dockRect;material.cues={focus:1,return:4,dock:6};
const mat=C.createScene({duration:8,events:[material]});
draw(mat,2);assert.deepEqual(mat.capabilityTrace.events[0].material.crop,material.focusCrop);
draw(mat,5);assert.deepEqual(mat.capabilityTrace.events[0].material.crop,{x:0,y:0,w:1600,h:1000});
const invalid=example('material-focus');invalid.focusCrop={x:1500,y:800,w:500,h:500};
assert.throws(()=>draw(C.createScene({duration:8,events:[invalid]}),3),/crop exceeds/);

// Actual camera and occlusion math change Canvas transforms/clipping and return home.
const camera=example('input-result');camera.camera={to:{x:600,y:100,w:600,h:325},at:1,duration:.5,returnAt:4,returnDuration:.5};camera.reveal={axis:'x',at:0,duration:1};
const cam=C.createScene({duration:8,events:[camera]});
assert.equal(cam.sample(2)[0].camera.scale,2);assert.equal(cam.sample(5)[0].camera.scale,1);
assert.equal(cam.sample(.5)[0].reveal.amount,.5);
assert.ok(draw(cam,2).calls.some(c=>c[0]==='scale'&&c[1]===2&&c[2]===2));
assert.ok(draw(cam,.5).calls.some(c=>c[0]==='rect'&&c[3]===600&&c[4]===650));

// Presenter clipping uses existing rectangle subtraction; clear fragments never overlap protection.
const presenter=example('presenter-safe');presenter.regions=[{x:700,y:100,w:1140,h:900}];
const person=C.createScene({duration:8,events:[presenter]});draw(person,3);
const safe=person.capabilityTrace.events[0].safeRegions;assert.ok(safe.length);
safe.forEach(r=>presenter.protectedRects.forEach(p=>assert.equal(E.intersection(r,p),null)));
assert.throws(()=>C.createScene({duration:8,events:[{...presenter,protectedRects:[]}]}),/measured protectedRects/);

// Independent expressions really compose with overlapping time and separate rectangles.
const a=example('input-result'),b=example('compare-change');b.at=3;b.end=8;b.cues={change:1,compare:3};
const composition=C.createScene({duration:8,events:[a,b]});assert.equal(composition.sample(2).length,1);assert.equal(composition.sample(4).length,2);draw(composition,6);

// Retained adapter keeps strict original source binding rules; it is not reclassified as arbitrary-count.
const original=example('source-design');assert.throws(()=>C.createScene({duration:8,events:[original]}),/Cue|copy|Missing/);
console.log('Capability runtime: dynamic counts, composition, synchronization, crop return, camera/reveal and safe regions passed.');
