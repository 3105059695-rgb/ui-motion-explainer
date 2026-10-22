'use strict';
const assert=require('node:assert/strict');
require('../assets/editing-kit/editing-kit.js');
const {createRuntime,seekMedia,waitForDecodedMedia}=require('../assets/fusion-studio/production-starter/runtime.js');
class Style {
  constructor(){this.values=new Map();}
  setProperty(k,v){this.values.set(k,String(v));}
  getPropertyValue(k){return this.values.get(k)||'';}
  getPropertyPriority(){return '';}
  removeProperty(k){this.values.delete(k);}
}
class Node {
  constructor(id){this.id=id;this.style=new Style();this.children=[];}
  appendChild(node){this.children.push(node);}
  contains(node){return this.children.some(child=>child===node||child.contains(node));}
  getAttribute(){return this.style.values.size?JSON.stringify([...this.style.values]):null;}
  setAttribute(k,v){this.style.values=new Map(JSON.parse(v));}
  removeAttribute(){this.style.values.clear();}
}
const timeline={schema_version:1,width:1920,height:1080,duration:4,
  media:{audio:'',captions:[{start:0,end:2,text:'one'},{start:2,end:4,text:'two'}]},
  objects:[{id:'material',type:'text',text:'原始对象',style:{left:'0px'}}],
  actions:[{id:'move',name:'match-handoff',start:1,end:2,options:{object:{$ref:'material'},
    from:{x:0,y:0,width:200,height:200},to:{x:1000,y:400,width:600,height:500}}},
    {id:'next',name:'match-handoff',start:3,end:4,options:{object:{$ref:'material'},
      from:{x:1000,y:400,width:600,height:500},to:{x:1200,y:800,width:100,height:100}}}]};
let calls=0,caption='';
const kit={...global.UIEditingKit,apply(...args){calls++;return global.UIEditingKit.apply(...args);}};
const host={kit,container:new Node('objects'),create:row=>new Node(row.id),find:()=>null,caption:t=>caption=t};
const runtime=createRuntime(timeline,host),node=runtime.objects.get('material');
runtime.render(1.5,2.5);assert.equal(caption,'two');assert.equal(node.style.getPropertyValue('left'),'500px');
assert.equal(runtime.getTrace().calls.length,1);assert.equal(calls,1);
assert.equal(runtime.getTrace().calls[0].method,'match-handoff');
runtime.render(4,4);assert.equal(node.style.getPropertyValue('left'),'1200px');
runtime.render(0,0);assert.equal(node.style.getPropertyValue('left'),'0px');
runtime.render(1.5,2.5);assert.equal(node.style.getPropertyValue('left'),'500px');
assert.equal(runtime.objects.get('material'),node);assert.equal(host.container.children.length,1);
assert.equal(runtime.getTrace().totalCalls,calls);
assert.equal(runtime.getTrace().methodCounts['match-handoff'],calls);
assert.equal(runtime.getTrace(1).calls.length,1);
assert.equal(runtime.getTrace(1).omittedFromSnapshot,calls-1);
const altered=JSON.parse(JSON.stringify(timeline));altered.actions[0].options.to.x=600;
const second=createRuntime(altered,{...host,container:new Node('new')});second.render(1.5,1.5);
assert.equal(second.objects.get('material').style.getPropertyValue('left'),'300px');
assert.equal(runtime.motionActive(2.5),false);assert.equal(runtime.motionActive(1.2),true);
runtime.resetTrace();assert.equal(runtime.getTrace().totalCalls,0);
assert.deepEqual(runtime.getTrace().methodCounts,{});
class FakeMedia extends EventTarget {
  constructor(mode){super();this.mode=mode;this.actualTime=0;this.duration=3;this.readyState=2;this.seeking=false;this.src='local-clock.mp4';}
  get currentTime(){return this.actualTime;}
  set currentTime(value){
    if(this.mode!=='false-seek')this.actualTime=value;
    queueMicrotask(()=>this.dispatchEvent(new Event('seeked')));
  }
}
(async()=>{
  // This models a no-Range browser response: seeked fires while time stays 0.
  await assert.rejects(seekMedia(new FakeMedia('false-seek'),2.2,100),/seek mismatch.*requested=2.2 actual=0/);
  const media=new FakeMedia('valid');await seekMedia(media,2.2,100);assert.equal(media.currentTime,2.2);
  await seekMedia(media,.4,100);assert.equal(media.currentTime,.4);
  const metadataOnly=new FakeMedia('metadata-only');metadataOnly.readyState=1;
  await assert.rejects(waitForDecodedMedia(metadataOnly,20),/metadata\/decode timeout/);
  const broken=new FakeMedia('broken');broken.error={code:3};
  await assert.rejects(waitForDecodedMedia(broken,100),/decode failed/);
  const notDecoded=new FakeMedia('valid');notDecoded.readyState=1;
  await assert.rejects(seekMedia(notDecoded,2.2,20),/seek timeout/);
  console.log('Passed: actual EditingKit calls, timeline mutation, identity, backwards seek, media clock; false-seek event rejection, decode failures, accurate media seek.');
})().catch(error=>{console.error(error);process.exitCode=1;});
