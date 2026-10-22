'use strict';
const assert=require('node:assert/strict');
const {createRuntime,validate,sourceTime}=require('../assets/fusion-studio/story-starter/runtime.js');
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
console.log('Canvas story: actual segment dispatch, backward seek, master media/caption clock, event phase and opening clipping passed.');
