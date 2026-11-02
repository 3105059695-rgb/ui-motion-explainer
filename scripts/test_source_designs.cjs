// No dependencies. --update-manifest samples the unmodified original drawing functions.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'../assets/agent-editorial');
const timing=JSON.parse(fs.readFileSync(path.join(base,'source/timing.json'),'utf8'));
const source={};
for(const [engine,file] of [['BodyA','body-a.js'],['BodyB','body-b.js']]){
  const code=fs.readFileSync(path.join(base,'source',file),'utf8');
  vm.runInNewContext(code,{window:source});
}
const definitions=[
  ['parallel-workflow','任务分解与并行交付','codex','BodyA'],
  ['premise-to-report','前提改变与报告结果','doubao','BodyA'],
  ['connected-delivery','连接资料到交付修改','workbuddy','BodyA'],
  ['module-assembly','模块拆装与组合','harness','BodyA'],
  ['clarify-and-gate','杂乱输入到清晰产出与门槛','claude','BodyA'],
  ['cross-device-continuity','同一任务跨设备继续','trae','BodyB'],
  ['remote-execution-chain','远程指令到执行维护','openclaw','BodyB'],
  ['capacity-and-bottleneck','数量能力与实际瓶颈','kimi','BodyB'],
  ['editable-change-undo','定位修改到差异与撤销','cursor','BodyB'],
  ['tool-convergence','多项工具汇入一个工作台','qwen','BodyB']
];
function mockContext(){
 const calls=[],stack=[];
 const ctx={globalAlpha:1,canvas:{width:1920,height:1080},calls,
  save(){stack.push({globalAlpha:this.globalAlpha});},restore(){Object.assign(this,stack.pop()||{});},
  measureText(s){return {width:String(s).length*20};},
  createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}};
 return new Proxy(ctx,{get(t,k){if(k in t)return t[k];return (...a)=>calls.push([k,...a]);}});
}
const structural=s=>/^[\s\d.,%+\-–—→←↔✓×Ⅱ⚠/:·()]+$/.test(s);
function generateManifest(){
 const designs=[];
 for(const [id,label,chapterId,engine] of definitions){
  const original=timing.chapters.find(c=>c.id===chapterId);
  const chapter={id:original.id,start:original.start,end:original.end,cues:original.cues.map(c=>({id:c.id,start:c.start,end:c.end}))};
  const range=[chapter.start,Number((original.ratingAt-.28).toFixed(3))];
  const file=engine==='BodyA'?'source/body-a.js':'source/body-b.js';
  let now=range[0];const copy=new Map(),media=new Map(),logos=new Map(),regions=new Map();
  const mark=(map,key)=>{key=String(key);if(!map.has(key))map.set(key,[]);const times=map.get(key);if(times[times.length-1]!==now)times.push(now);};
  const images=new Proxy({}, {get:(_,key)=>{mark(media,key);return {key,width:5000,height:5000,naturalWidth:5000,naturalHeight:5000};}});
  const ctx=mockContext();ctx.drawImage=(im,...a)=>{mark(media,im.key);if(a.length===8){const [x,y,w,h]=a;const r=regions.get(im.key)||[Infinity,Infinity,-Infinity,-Infinity];r[0]=Math.min(r[0],x);r[1]=Math.min(r[1],y);r[2]=Math.max(r[2],x+w);r[3]=Math.max(r[3],y+h);regions.set(im.key,r);}};
  const text=s=>{s=String(s);if(s&&!structural(s))mark(copy,s);};
  const H={C:{black:'#0B0B0F',white:'#FFF',purple:'#D6C2FF',muted:'#777780',line:'#DBDBE0',paper:'#F3F3F5'},
    rr(){},txt:text,line(){},arrow(){},img(key){mark(media,key);},logo(key){mark(logos,key==='harness'?'deepseek':key);},pill:text,
    mix:(a,b,p)=>a+(b-a)*p,clamp:(v,a=0,b=1)=>Math.min(b,Math.max(a,v)),progress:(t,s,d=.55)=>Math.min(1,Math.max(0,(t-s)/d)),spring:()=>1,
    assets:new Proxy({}, {get:(_,slug)=>({hero:'@hero/'+slug,logo:'@logo/'+slug})}),images};
  const dt=1/30,steps=Math.ceil((range[1]-range[0])/dt);
  const samples=new Set(Array.from({length:steps+1},(_,i)=>Math.min(range[1]-1e-6,range[0]+i*dt)));
  // Exact cue boundaries prevent an intro screenshot from leaking into the required slots
  // of a following image-free sequence merely because the 30fps grid straddled the cut.
  for(const time of [...chapter.cues.map(c=>c.start),{trae:153.2,kimi:211.1,qwen:272.9}[chapterId]]){
   if(Number.isFinite(time)&&time>range[0]&&time<range[1]){samples.add(time-1e-6);samples.add(time);}
  }
  const ordered=[...samples].sort((a,b)=>a-b),indices=new Map(ordered.map((t,i)=>[t,i]));
  for(const sample of ordered){now=sample;source[engine].draw(ctx,now,chapter,H);ctx.calls.length=0;}
  function list(map,keyName){return [...map].map(([key,times])=>{const intervals=[];for(const t of times){const i=indices.get(t),last=intervals[intervals.length-1];if(last&&i===last[1]+1)last[1]=i;else intervals.push([i,i]);}return {[keyName]:key,intervals:intervals.map(([a,b])=>[Number(ordered[a].toFixed(6)),Number((ordered[b+1]??range[1]).toFixed(6))])};});}
  const media_slots=list(media,'key').map(s=>{const r=regions.get(s.key);return r?{...s,source_region:[r[0],r[1],r[2]-r[0],r[3]-r[1]].map(n=>Number(n.toFixed(4))),mapping:'cover new image crop into the original pixel-crop domain; preserve animated source crop'}:s;});
  const cues=original.cues.filter(c=>c.start>range[0]&&c.start<range[1]).map(c=>({id:c.id,source_time:c.start,description:c.text}));
  const materialEnd={trae:153.2,kimi:211.1,qwen:272.9}[chapterId];
  if(materialEnd)cues.push({id:'material-end',source_time:materialEnd,description:'原素材从完整展示连续收至次要证据位置；仅图形时钟锚点'});
  cues.sort((a,b)=>a.source_time-b.source_time);
  designs.push({id,label,engine,source_file:file,source_sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(base,file))).digest('hex'),
    approved_scope:'original body design and continuous motion; original topic, product, ranking, opening and narration are not defaults',
    source_range:range,source_viewport:{x:426,y:178,w:1400,h:724},chapter,cues,copy_slots:list(copy,'source'),media_slots,logo_slots:list(logos,'key'),
    constraints:chapterId==='kimi'?['The original geometry contains 300 small units (20 x 15). Copy replacement alone cannot change this quantity. Select this design only when this quantity is meaningful, or explicitly label the illustration as schematic.']:[],
    selection:'optional complete design or explicitly bounded continuous subrange; not a required chapter sequence'});
 }
 return {schema:'ui-motion-fusion/source-designs@1',provenance:{source:'approved ten-agents body-a/body-b executable source',helper_source:'source/film.js drawing helpers adapted only for copy/media binding and current AgentEditorial palette',source_untouched:true,slot_sampling_fps:30,scope:'design references and code reuse; no original media or narration embedded',clock:'local graphical time maps piecewise to original chapter time; source media and narration clocks are never changed'},designs};
}
if(process.argv.includes('--update-manifest')){
 const result=generateManifest();fs.writeFileSync(path.join(base,'source-designs.json'),JSON.stringify(result,null,2)+'\n');
 console.log('Wrote '+result.designs.length+' executable source designs');process.exit(0);
}
const api=require(path.join(base,'source-designs.js'));
const manifest=JSON.parse(fs.readFileSync(path.join(base,'source-designs.json'),'utf8'));
api.configure(manifest);
assert.equal(api.catalog().length,10);
assert.throws(()=>api.inspect('made-up'),/Unknown design/);
assert.throws(()=>api.createScene({design:'parallel-workflow',duration:5}).validate(),/Cue/);
const d=api.inspect('parallel-workflow');
const range=[26.66,44.52],duration=17.86;
const relevant=d.copy_slots.filter(s=>s.intervals.some(([a,b])=>b>=range[0]&&a<=range[1]));
const binding={design:d.id,duration,sourceRange:range,cues:{},copy:{},media:{},logos:{}};
for(const c of d.cues)if(c.source_time>range[0]&&c.source_time<range[1])binding.cues[c.id]=c.source_time-range[0];
for(const slot of relevant)binding.copy[slot.source]='本期中文_'+slot.source;
assert.throws(()=>api.createScene({...binding,copy:{}}).validate(),/Missing copy slot/);
const scene=api.createScene(binding);scene.validate();assert.equal(scene.sourceTime(0),range[0]);assert.equal(scene.sourceTime(duration),range[1]);
assert.equal(scene.sourceTime(binding.cues.parallel),31.32);
let invoked=0;globalThis.BodyA={draw(...args){invoked++;return source.BodyA.draw(...args);}};
const ctx=mockContext();scene({ctx,localTime:6,mediaTime:700,layout:{contentRect:{x:0,y:0,w:1400,h:724}}});
assert.equal(invoked,1);assert.equal(scene.sourceDesign.mediaTime,700);
assert(ctx.calls.some(c=>c[0]==='roundRect'),'Original rounded-geometry draw must execute');
const written=ctx.calls.filter(c=>c[0]==='fillText').map(c=>c[1]);
assert(written.some(s=>s.startsWith('本期中文_')),'Chinese production copy must reach canvas');
assert(!written.includes('你的项目'),'Original label must not leak');
assert.throws(()=>api.createScene({...binding,cues:{...binding.cues,parallel:-1}}).validate(),/Cue/);
const bd=api.inspect('cross-device-continuity');
const bb={design:bd.id,duration:bd.source_range[1]-bd.source_range[0],demo:true,media:{'@hero/trae':{asset:'new-page',crop:[10,20,1900,860]}}};
const bscene=api.createScene(bb);bscene.validate();assert.equal(bscene.sourceTime(153.2-bd.source_range[0]),153.2);
let binvoked=0;globalThis.BodyB={draw(...args){binvoked++;return source.BodyB.draw(...args);}};
const bctx=mockContext();const actual={width:2000,height:1000};
bscene({ctx:bctx,localTime:1,mediaTime:801,asset:id=>id==='new-page'?actual:null});
assert.equal(binvoked,1);const cropCall=bctx.calls.find(c=>c[0]==='drawImage');assert(cropCall&&cropCall[1]===actual,'New material must reach original direct drawImage');
assert(Math.abs(cropCall[2]-10)<.01 && Math.abs(cropCall[3]-20)<.01,'Source crop must map into supplied new crop');
assert.equal(bscene.sourceDesign.mediaTime,801);
assert.throws(()=>api.createScene({...bb,media:{}})({ctx:mockContext(),localTime:1}),/Missing media/);
for(const des of manifest.designs){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(base,des.source_file))).digest('hex'),des.source_sha256);}
let allCalls=0;
globalThis.BodyA={draw(...a){allCalls++;return source.BodyA.draw(...a);}};
globalThis.BodyB={draw(...a){allCalls++;return source.BodyB.draw(...a);}};
for(const des of manifest.designs){
 const length=des.source_range[1]-des.source_range[0];
 const bound={design:des.id,duration:length,cues:{},copy:{},media:{},logos:{}};
 for(const cue of des.cues)bound.cues[cue.id]=cue.source_time-des.source_range[0];
 for(const slot of des.copy_slots)bound.copy[slot.source]='新稿_'+slot.source;
 for(const slot of des.media_slots)bound.media[slot.key]='current-material';
 for(const slot of des.logo_slots)bound.logos[slot.key]='current-logo';
 const complete=api.createScene(bound);complete.validate();
 const checkpoints=new Set([0,length-.001,...des.cues.flatMap(c=>[c.source_time-des.source_range[0]+.01,c.source_time-des.source_range[0]+.6])]);
 for(let second=.11;second<length;second+=.37)checkpoints.add(second);
 for(const t of [...checkpoints].filter(t=>t>=0&&t<length)){
  const full=mockContext();complete({ctx:full,localTime:t,mediaTime:900+t,asset:()=>({width:3840,height:2160})});
  const labels=full.calls.filter(c=>c[0]==='fillText').map(c=>c[1]);
  assert(labels.every(s=>s.startsWith('新稿_')||structural(s)),des.id+' leaked source copy');
  for(const c of full.calls.filter(c=>c[0]==='drawImage'))for(const n of c.slice(2))assert(Number.isFinite(n),des.id+' invalid crop coordinate');
 }
}
assert(allCalls>500,'All ten original designs must execute across their state changes');
console.log('PASS: '+allCalls+' original-source frames across 10 designs; Chinese copy, cue/source clock, untouched media clock, direct pixel-crop mapping, unknown/missing slot failures, original source hashes');
