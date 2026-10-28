'use strict';
const assert=require('node:assert/strict');
const {createRuntime,validate,sourceTime,shotSourceTime,cropAt}=require('../assets/fusion-studio/story-starter/runtime.js');
const sdk=require('../assets/agent-editorial/agent-editorial.js');
const binding={schema_version:1,duration_seconds:3,duration:3,width:1920,height:1080,media:{audio:'',captions:[{start:1,end:2,text:'master caption'}],assets:[{id:'presenter',type:'video',src:'presenter.mp4'}]},segments:[
  {id:'a',output:{start_seconds:0,end_seconds:1},scene:'opening',layout:{mode:'presenter-opening',presenter:'presenter'},events:[{id:'move',start:.1,end:.4}]},
  {id:'b',output:{start_seconds:1,end_seconds:3},scene:'process',layout:{mode:'focus'},events:[{id:'reveal',start:0,end:.6}]}]};
let observed=[],captions=[];
const host={ctx:{},D:{},asset:id=>id,begin:()=>{},frame:draw=>draw(),opening:()=>{},caption:v=>captions=v,
scenes:{opening:()=>{throw Error('Opening must not be drawn without measured safe regions');},process:arg=>observed.push([arg.localTime,arg.mediaTime,arg.phase('reveal'),arg.layout.mode])}};
const runtime=createRuntime(binding,host);
runtime.render(.2,.2);assert.equal(runtime.getTrace().totalCalls,0);
runtime.render(1.3,1.1);assert.equal(captions[0],'master caption');assert.deepEqual(observed[0],[.30000000000000004,1.1,.5000000000000001,'focus']);
runtime.render(1.1,1.1);assert.equal(runtime.getTrace().totalCalls,2);assert.ok(observed[1][0]<observed[0][0]);
assert.equal(runtime.motionActive(1.3),true);assert.equal(runtime.motionActive(2),false);
assert.throws(()=>validate({...binding,segments:[{...binding.segments[1],scene:'missing'}]},host.scenes),/scene is missing/);
assert.throws(()=>validate({...binding,segments:[{...binding.segments[1],events:[{id:'bad',start:0,end:10}]}]},host.scenes),/local to the segment/);
const stage={x:0,y:0,w:1920,h:1080},protectedRect={x:0,y:0,w:1150,h:1080};
const safe=sdk.safeRegions({stage,regions:[stage],protectedRects:[protectedRect]});
assert.ok(safe.length);assert.ok(safe.every(r=>sdk.intersection(r,protectedRect)===null));
assert.equal(sourceTime({id:'presenter',start:2,mediaStart:1},2.4,3),1.4);
assert.throws(()=>sourceTime({id:'presenter',start:2},1.5,3),/does not cover/);
assert.throws(()=>sourceTime({id:'presenter'},3,3),/do not freeze/);
assert.throws(()=>sourceTime({id:'presenter',end:2},2.5,10),/does not cover/);
const movie={videoWidth:640,videoHeight:360,duration:8},picture={naturalWidth:800,naturalHeight:600};
const shots=[{id:'whole',asset:'movie',start:0,end:1,source_in:3,source_out:4,crop_keyframes:[{at:0,x:0,y:0,w:1,h:1},{at:1,x:.25,y:.25,w:.5,h:.5}]},
  {id:'detail',asset:'movie',start:1,end:2,source_in:6,source_out:7,target:{x:0,y:0,w:960,h:540}},
  {id:'compare',asset:'image',start:1,end:2,target:{x:960,y:0,w:960,h:540}}];
const materialBinding={...binding,media:{audio:'',captions:[],assets:[{id:'movie',type:'video',src:'movie.mp4'},{id:'image',type:'image',src:'image.png'}]},
  segments:[{id:'content',output:{start_seconds:1,end_seconds:3},layout:{mode:'focus'},material_shots:shots,palette:{paper:'#fff'},background:'#f5f5f5'}]};
let materialDraws=[],order=[];
const materialHost={...host,scenes:{},asset:id=>id==='movie'?movie:picture,
  forSegment:segment=>({image:(node,target,options)=>{materialDraws.push({node,target,options});order.push('material');}}),
  background:color=>order.push(color)};
const materialRuntime=createRuntime(materialBinding,materialHost);
materialRuntime.render(1.5,1.4);
assert.equal(materialDraws.length,1);assert.deepEqual(materialDraws[0].options.crop,{x:80,y:45,w:480,h:270});
assert.equal(materialRuntime.getTrace().calls[0].material_shots[0].source_time,3.4);
assert.deepEqual(order,['#f5f5f5','material']);
materialDraws=[];materialRuntime.render(1.999,2.01); // blur sample before cut must use AFTER-cut source
assert.equal(materialDraws.length,2);assert.equal(materialRuntime.getTrace().calls.at(-1).material_shots[0].id,'detail');
assert.ok(Math.abs(materialRuntime.getTrace().calls.at(-1).material_shots[0].source_time-6.01)<1e-9);
materialRuntime.render(1.1,1.1);assert.ok(Math.abs(materialRuntime.getTrace().calls.at(-1).material_shots[0].source_time-3.1)<1e-9);
assert.equal(materialRuntime.motionActive(1.4),true);assert.equal(materialRuntime.motionActive(2.4),false);
assert.deepEqual(cropAt(shots[0],2),{x:.25,y:.25,w:.5,h:.5});
assert.throws(()=>shotSourceTime(materialBinding.segments[0],shots[0],2,8),/does not cover/);
assert.throws(()=>shotSourceTime(materialBinding.segments[0],shots[1],2.5,6.8),/does not cover/);
const malformed=change=>({...materialBinding,segments:[{...materialBinding.segments[0],material_shots:[{...shots[0],...change}]}]});
assert.throws(()=>validate(malformed({source_out:4.5}),{}),/equal source\/output duration/);
assert.throws(()=>validate(malformed({asset:'missing'}),{}),/Missing material shot asset/);
assert.throws(()=>validate(malformed({crop_keyframes:[{at:0,x:.8,y:0,w:.5,h:1}]}),{}),/normalized source bounds/);
assert.throws(()=>validate({...materialBinding,segments:[{...materialBinding.segments[0],scene:'missing'}]},{}),/scene is missing/);
order=[];createRuntime({...materialBinding,segments:[{...materialBinding.segments[0],scene:'overlay'}]},
  {...materialHost,scenes:{overlay:()=>order.push('UI')}}).render(1.5);
assert.deepEqual(order,['#f5f5f5','material','UI']);
console.log('Canvas story: legacy dispatch, source cuts, crops, material-only segments, UI order, backward seek, master clock and opening clipping passed.');
