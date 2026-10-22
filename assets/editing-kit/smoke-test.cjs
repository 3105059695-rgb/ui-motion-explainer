'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const sandbox={};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(__dirname+'/editing-kit.js','utf8'),sandbox);
const K=sandbox.UIEditingKit;
function el(){const values=new Map();return {currentTime:7.25,playbackRate:1,style:{getPropertyValue(k){return values.get(k)||''},getPropertyPriority(){return ''},setProperty(k,v){values.set(k,String(v))},removeProperty(k){values.delete(k)}},snapshot(){return [...values].sort(([a],[b])=>a.localeCompare(b))}};}
const from={x:40,y:50,width:120,height:60},via={x:240,y:150,width:120,height:60},to={x:540,y:250,width:180,height:90};
let count=0;
function check(name,build){const nodes=[];const make=()=>{const e=el();nodes.push(e);return e};const o=build(make);K.apply(name,o,.37);const first=JSON.stringify(nodes.map(n=>n.snapshot()));K.apply(name,o,1);K.apply(name,o,0);K.apply(name,o,.87);K.apply(name,o,.37);assert.equal(JSON.stringify(nodes.map(n=>n.snapshot())),first,name+' must be seek deterministic');nodes.forEach(n=>{assert.equal(n.currentTime,7.25);assert.equal(n.playbackRate,1)});count++;return {o,nodes};}
check('focus-mask',e=>({viewport:{width:1000,height:700},focus:from,shades:[e(),e(),e(),e()],outline:e(),loupe:e(),loupeContent:e(),loupeTo:to}));
const wipe=check('occlusion-reveal',e=>({viewport:{width:1000,height:700},previous:e(),next:e(),cover:e()}));
K.apply('occlusion-reveal',wipe.o,0);assert.equal(wipe.o.next.style.getPropertyValue('clip-path'),'inset(0 100% 0 0)');assert.equal(wipe.o.cover.style.getPropertyValue('opacity'),'0');
K.apply('occlusion-reveal',wipe.o,1);assert.equal(wipe.o.next.style.getPropertyValue('clip-path'),'inset(0 0% 0 0)');
const handoff=check('match-handoff',e=>({object:e(),from,to,arcHeight:60,sourceContext:e(),targetContext:e()}));
K.apply('match-handoff',handoff.o,0);assert.equal(handoff.o.object.style.getPropertyValue('left'),'40px');
K.apply('match-handoff',handoff.o,1);assert.equal(handoff.o.object.style.getPropertyValue('left'),'540px');
check('compare',e=>({viewport:{width:1000,height:700},before:e(),after:e(),divider:e(),regions:[{element:e(),rect:via}]}));
const chain=check('causal-chain',e=>({items:[{element:e(),from,via,to}],condition:e(),result:e(),connector:e()}));
assert.equal(K.apply('causal-chain',chain.o,.53).gateOpen,false);assert.equal(K.apply('causal-chain',chain.o,.54).gateOpen,true);K.apply('causal-chain',chain.o,1);assert.equal(chain.o.items[0].element.style.getPropertyValue('left'),'540px');
const camera=check('result-pullback',e=>({viewport:{width:1000,height:700},world:e(),focus:to,contextLabel:e(),focusOutline:e()}));
const end=K.apply('result-pullback',camera.o,1);assert.equal(end.scale,1);assert.equal(end.x,0);assert.equal(end.y,0);
const focused=check('viewport-focus',e=>{
  const frame=e(),content=e();frame.contains=n=>n===content;
  return {frame,content,frameRect:{x:80,y:60,width:800,height:400},contentSize:{width:1600,height:800},from:{x:0,y:0,width:1600,height:800},to:{x:400,y:200,width:400,height:200},timing:{focus:[.1,.5],return:[.7,1]}};
});
const focusContent=focused.o.content,focusFrame=focused.o.frame;
const focusStart=K.apply('viewport-focus',focused.o,0);assert.equal(focusStart.scale,.5);assert.equal(focusStart.x,0);assert.equal(focusStart.y,0);
const focusMid=K.apply('viewport-focus',focused.o,.5);assert.equal(focusMid.scale,2);assert.equal(focusMid.x,-800);assert.equal(focusMid.y,-400);
assert.equal(focusFrame.style.getPropertyValue('left'),'80px');assert.equal(focusFrame.style.getPropertyValue('width'),'800px');assert.equal(focusFrame.style.getPropertyValue('overflow'),'hidden');
const focusEnd=K.apply('viewport-focus',focused.o,1);assert.equal(focusEnd.scale,.5);assert.equal(focusEnd.x,0);assert.equal(focusEnd.y,0);
assert.equal(focused.o.content,focusContent);assert.equal(focused.o.frame,focusFrame);
const held={...focused.o,timing:{focus:[0,.5]}};assert.equal(K.apply('viewport-focus',held,1).scale,2);
const rearranged=check('comparison-reflow',e=>({previous:e(),next:e(),previousFrom:to,previousTo:from,nextFrom:{x:1000,y:50,width:120,height:60},nextTo:via,timing:{previous:[0,.5],next:[.25,.75]}}));
const previousNode=rearranged.o.previous,nextNode=rearranged.o.next;
K.apply('comparison-reflow',rearranged.o,0);assert.equal(previousNode.style.getPropertyValue('left'),'540px');assert.equal(previousNode.style.getPropertyValue('opacity'),'1');assert.equal(nextNode.style.getPropertyValue('left'),'1000px');assert.equal(nextNode.style.getPropertyValue('opacity'),'0');
const rearrangedMid=K.apply('comparison-reflow',rearranged.o,.5);assert.equal(rearrangedMid.previousRect.x,40);assert.equal(rearrangedMid.nextRect.x,620);assert.equal(nextNode.style.getPropertyValue('opacity'),'0.5');
K.apply('comparison-reflow',rearranged.o,1);assert.equal(previousNode.style.getPropertyValue('left'),'40px');assert.equal(nextNode.style.getPropertyValue('left'),'240px');assert.equal(nextNode.style.getPropertyValue('opacity'),'1');assert.equal(rearranged.o.previous,previousNode);assert.equal(rearranged.o.next,nextNode);
const docked=check('chapter-dock',e=>({title:e(),content:e(),from:{x:300,y:300,width:400,height:100},to:{x:40,y:20,width:200,height:50},timing:{title:[0,.5],content:[.25,.75]},reveal:'x'}));
const titleNode=docked.o.title;titleNode.textContent='Persistent chapter title';
K.apply('chapter-dock',docked.o,0);assert.equal(titleNode.style.getPropertyValue('left'),'300px');assert.equal(titleNode.style.getPropertyValue('transform'),'scale(1)');assert.equal(docked.o.content.style.getPropertyValue('clip-path'),'inset(0 100% 0 0)');
const dockMid=K.apply('chapter-dock',docked.o,.25);assert.equal(dockMid.scale,.75);assert.equal(dockMid.rect.x,170);assert.equal(dockMid.rect.y,160);assert.equal(titleNode.style.getPropertyValue('width'),'400px');
K.apply('chapter-dock',docked.o,1);assert.equal(titleNode.style.getPropertyValue('left'),'40px');assert.equal(titleNode.style.getPropertyValue('transform'),'scale(0.5)');assert.equal(docked.o.content.style.getPropertyValue('clip-path'),'inset(0 0% 0 0)');assert.equal(titleNode.textContent,'Persistent chapter title');assert.equal(docked.o.title,titleNode);
const tallDock=K.apply('chapter-dock',{...docked.o,to:{x:40,y:20,width:200,height:100}},1);assert.equal(tallDock.rect.y,45);assert.equal(tallDock.rect.width,200);assert.equal(tallDock.rect.height,50);
for(const reveal of ['fade','y']) {
  const opts={...docked.o,reveal};K.apply('chapter-dock',opts,1);K.apply('chapter-dock',opts,0);
  assert.equal(opts.content.style.getPropertyValue('clip-path'),reveal==='fade'?'none':'inset(0 0 100% 0)');assert.equal(opts.content.style.getPropertyValue('opacity'),reveal==='fade'?'0':'1');
}
// Invalid configurations fail before writing partial animation styles.
function invalid(name,base,patch){const nodes=Object.values(base).filter(v=>v&&typeof v.snapshot==='function');const before=JSON.stringify(nodes.map(n=>n.snapshot()));assert.throws(()=>K.apply(name,{...base,...patch},.5));assert.equal(JSON.stringify(nodes.map(n=>n.snapshot())),before);}
invalid('viewport-focus',focused.o,{content:focused.o.frame});
invalid('viewport-focus',focused.o,{content:el()});
invalid('viewport-focus',focused.o,{to:{x:1500,y:0,width:200,height:100}});
invalid('viewport-focus',focused.o,{contentSize:{width:Infinity,height:800}});
invalid('viewport-focus',focused.o,{frameRect:{x:0,y:0,width:0,height:400}});
invalid('viewport-focus',focused.o,{timing:{focus:[0,.8],return:[.6,1]}});
invalid('comparison-reflow',rearranged.o,{next:rearranged.o.previous});
invalid('comparison-reflow',rearranged.o,{nextTo:{x:0,y:NaN,width:200,height:100}});
invalid('chapter-dock',docked.o,{content:docked.o.title});
invalid('chapter-dock',docked.o,{reveal:'spiral'});
for(const value of [undefined,[],[0,0],[-.1,.5],[0,1.1],[0,NaN]]) {
  invalid('viewport-focus',focused.o,{timing:{focus:value}});
  invalid('comparison-reflow',rearranged.o,{timing:{previous:[0,1],next:value}});
  invalid('chapter-dock',docked.o,{timing:{title:value,content:[0,1]}});
}
assert.equal(K.names.length,9);
assert.throws(()=>K.apply('unknown',{},0));assert.throws(()=>K.apply('compare',{},NaN));assert.throws(()=>K.apply('causal-chain',{items:[{element:el(),from,via,to,start:.8,end:1}]},.5));
const themed=el();K.setTheme(themed,{background:'#fff',surface:'#eee',ink:'#111',muted:'#666',accent:'#065',border:'#ddd',fontFamily:'system-ui',radius:12});assert.equal(themed.style.getPropertyValue('--uek-accent'),'#065');K.reset(themed);assert.equal(themed.style.getPropertyValue('--uek-accent'),'');
const original=el();original.style.setProperty('left','17px');K.apply('match-handoff',{object:original,from,to},.8);K.reset(original);assert.equal(original.style.getPropertyValue('left'),'17px');assert.equal(original.style.getPropertyValue('position'),'');
console.log(JSON.stringify({passed:true,effectCount:count,checks:['nine-effect-reverse-seek','start-middle-end-geometries','persistent-node-identity','fixed-viewport-and-return','uniform-title-docking','no-media-clock-write','gate-order','invalid-inputs-without-partial-writes','theme-injection','owned-style-reset']}));
