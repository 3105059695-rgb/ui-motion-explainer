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
assert.throws(()=>K.apply('unknown',{},0));assert.throws(()=>K.apply('compare',{},NaN));assert.throws(()=>K.apply('causal-chain',{items:[{element:el(),from,via,to,start:.8,end:1}]},.5));
const themed=el();K.setTheme(themed,{background:'#fff',surface:'#eee',ink:'#111',muted:'#666',accent:'#065',border:'#ddd',fontFamily:'system-ui',radius:12});assert.equal(themed.style.getPropertyValue('--uek-accent'),'#065');K.reset(themed);assert.equal(themed.style.getPropertyValue('--uek-accent'),'');
const original=el();original.style.setProperty('left','17px');K.apply('match-handoff',{object:original,from,to},.8);K.reset(original);assert.equal(original.style.getPropertyValue('left'),'17px');assert.equal(original.style.getPropertyValue('position'),'');
console.log(JSON.stringify({passed:true,effectCount:count,checks:['six-effect-reverse-seek','endpoint-geometries','no-media-clock-write','gate-order','invalid-inputs','theme-injection','owned-style-reset']}));
