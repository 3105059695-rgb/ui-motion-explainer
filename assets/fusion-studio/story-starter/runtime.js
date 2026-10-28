/* Narration-timed authored Canvas scenes, sharing the existing fusion renderer. */
(function (global) {
  'use strict';
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const finite = (n,label) => {if(!Number.isFinite(n))throw new Error(label+' must be finite');return n;};
  const range = row => [row.output.start_seconds,row.output.end_seconds];
  const shotKey = (segment,shot) => JSON.stringify([segment.id,shot.id]);
  const activeShots = (segment,mediaTime) => {
    const local=mediaTime-range(segment)[0];
    return (segment.material_shots||[]).filter(s=>local>=s.start&&local<s.end);
  };
  function rectangle(r,label,normalized=false){
    if(!r||!['x','y','w','h'].every(k=>Number.isFinite(r[k]))||r.w<=0||r.h<=0)
      throw new Error(label+' requires finite x/y and positive w/h');
    if(normalized&&(r.x<0||r.y<0||r.x+r.w>1.000001||r.y+r.h>1.000001))
      throw new Error(label+' must remain inside normalized source bounds');
  }
  function validateShots(row,assets){
    if(row.material_shots!==undefined&&!Array.isArray(row.material_shots))throw new Error('material_shots must be an array');
    const ids=new Set(),duration=range(row)[1]-range(row)[0];
    for(const shot of row.material_shots||[]){
      if(!shot.id||ids.has(shot.id))throw new Error('Duplicate or empty material shot id');ids.add(shot.id);
      const asset=assets.find(a=>a.id===shot.asset);
      if(!asset)throw new Error('Missing material shot asset: '+shot.asset);
      finite(shot.start,'shot start');finite(shot.end,'shot end');
      if(!(0<=shot.start&&shot.start<shot.end&&shot.end<=duration+.000001))throw new Error('Shot range must be local to its segment: '+shot.id);
      if(asset.type==='video'){
        finite(shot.source_in,'shot source_in');finite(shot.source_out,'shot source_out');
        if(shot.source_in<0||shot.source_out<=shot.source_in||Math.abs(shot.source_out-shot.source_in-(shot.end-shot.start))>.000001)
          throw new Error('Video shot requires equal source/output duration at original speed: '+shot.id);
      }else if(shot.source_in!==undefined||shot.source_out!==undefined)throw new Error('Still image shots do not have source times: '+shot.id);
      if(shot.target)rectangle(shot.target,'shot target');
      if(shot.fit!==undefined&&!['contain','cover'].includes(shot.fit))throw new Error('Shot fit must be contain or cover');
      if(shot.crop_keyframes!==undefined&&!Array.isArray(shot.crop_keyframes))throw new Error('crop_keyframes must be an array');
      let previous=-Infinity;
      for(const key of shot.crop_keyframes||[]){
        finite(key.at,'crop keyframe time');rectangle(key,'crop keyframe',true);
        if(key.at<shot.start||key.at>shot.end||key.at<=previous)throw new Error('Crop keyframes must have increasing segment-local times inside the shot');
        previous=key.at;
      }
    }
  }
  function shotSourceTime(segment,shot,mediaTime,duration){
    const local=mediaTime-range(segment)[0],time=shot.source_in+local-shot.start;
    if(local<shot.start||local>=shot.end||!(duration>0)||shot.source_out>duration+.000001||time<0||time>=duration)
      throw new Error('Material shot source does not cover this time; do not freeze: '+shot.id);
    return time;
  }
  function cropAt(shot,localTime){
    const keys=shot.crop_keyframes||[],whole={x:0,y:0,w:1,h:1};
    if(!keys.length)return whole;
    const copy=k=>Object.fromEntries(['x','y','w','h'].map(p=>[p,k[p]]));
    if(localTime<=keys[0].at)return copy(keys[0]);
    for(let i=1;i<keys.length;i++)if(localTime<keys[i].at){
      const a=keys[i-1],b=keys[i],u=clamp((localTime-a.at)/(b.at-a.at),0,1),p=u*u*(3-2*u);
      return Object.fromEntries(['x','y','w','h'].map(k=>[k,a[k]+(b[k]-a[k])*p]));
    }
    return copy(keys.at(-1));
  }
  function validate(binding,scenes) {
    if(!binding || binding.schema_version!==1 || !Array.isArray(binding.segments))throw new Error('Invalid story timeline');
    for(const k of ['width','height','duration_seconds'])finite(binding[k],k);
    if(binding.width<=0||binding.height<=0||binding.duration_seconds<0)throw new Error('Invalid stage/duration');
    if(binding.duration!==undefined&&binding.duration!==binding.duration_seconds)throw new Error('Timeline durations disagree');
    const ids=new Set();
    for(const row of binding.segments){
      if(!row.id||ids.has(row.id))throw new Error('Duplicate or empty segment id');ids.add(row.id);
      if(!row.output)throw new Error('Missing segment output time range: '+row.id);
      const [start,end]=range(row);finite(start,'segment start');finite(end,'segment end');
      if(!(0<=start&&start<end&&end<=binding.duration_seconds))throw new Error('Invalid segment range: '+row.id);
      if((row.scene!==undefined&&typeof scenes?.[row.scene]!=='function')||(!row.scene&&!row.material_shots?.length))throw new Error('Episode scene is missing: '+row.scene);
      if(row.palette!==undefined&&(!row.palette||typeof row.palette!=='object'||Array.isArray(row.palette)||Object.values(row.palette).some(v=>typeof v!=='string')))throw new Error('Segment palette must map names to CSS colors');
      if(row.background!==undefined&&typeof row.background!=='string')throw new Error('Segment background must be a CSS color');
      if(!['body','focus','presenter-opening'].includes(row.layout?.mode))throw new Error('Explicit layout mode required: '+row.id);
      if(row.layout.mode==='presenter-opening'&&!row.layout.presenter)throw new Error('Opening requires its actual presenter asset');
      const eventIds=new Set();
      for(const e of row.events||[]){
        if(!e.id||eventIds.has(e.id))throw new Error('Duplicate or empty event id: '+row.id);eventIds.add(e.id);
        finite(e.start,'event start');finite(e.end,'event end');
        if(!(0<=e.start&&e.start<e.end&&e.end<=end-start+.000001))throw new Error('Event times must be local to the segment: '+e.id);
      }
    }
    if(!binding.media||!Array.isArray(binding.media.captions)||!Array.isArray(binding.media.assets))throw new Error('media needs captions and assets arrays');
    const assetIds=new Set();
    for(const a of binding.media.assets){
      if(!a.id||assetIds.has(a.id)||!['image','video'].includes(a.type)||!a.src)throw new Error('Invalid/duplicate media asset');assetIds.add(a.id);
      for(const k of ['start','end','mediaStart'])if(a[k]!==undefined)finite(a[k],'media '+k);
    }
    for(const row of binding.segments){
      if(row.layout.mode==='presenter-opening'&&!assetIds.has(row.layout.presenter))throw new Error('Opening presenter asset is missing');
      validateShots(row,binding.media.assets);
    }
    for(const c of binding.media.captions){
      finite(c.start,'caption start');finite(c.end,'caption end');
      if(!(0<=c.start&&c.start<c.end&&c.end<=binding.duration_seconds)||typeof c.text!=='string')throw new Error('Invalid caption');
    }
    return binding;
  }
  function layoutFor(row,width,height) {
    const stage={x:0,y:0,w:width,h:height};
    const left=width*(row.presenterRatio??.22),gutter=width*.025;
    return {...row,stage,presenterRect:row.presenterRect||{x:0,y:0,w:left,h:height},
      contentRect:row.contentRect||(row.mode==='body'?{x:left+gutter,y:height*.06,w:width-left-2*gutter,h:height*.83}:stage)};
  }
  function sourceTime(row,mediaTime,duration){
    const time=mediaTime-(row.start||0)+(row.mediaStart||0);
    if(mediaTime<(row.start||0)-.000001||(row.end!==undefined&&mediaTime>=row.end)||time<-.000001||time>=duration)
      throw new Error('Active source video does not cover this master-clock time; do not freeze its last frame: '+row.id+' at '+mediaTime.toFixed(3)+'s');
    return Math.max(0,time);
  }
  function createRuntime(binding,host) {
    validate(binding,host.scenes);
    const trace=[];let totalCalls=0;
    function render(animationTime,mediaTime=animationTime){
      const t=clamp(finite(animationTime,'animationTime'),0,binding.duration_seconds);
      const mt=clamp(finite(mediaTime,'mediaTime'),0,binding.duration_seconds);
      const captions=binding.media.captions.filter(c=>mt>=c.start&&mt<c.end).map(c=>c.text);
      // Temporal blur may animate a crop around a cut, but must never mix source shots.
      const selected=binding.segments.filter(row=>mt>=range(row)[0]&&mt<range(row)[1]);
      host.begin();
      for(const segment of selected){
        const localTime=clamp(t-range(segment)[0],0,range(segment)[1]-range(segment)[0]),layout=layoutFor(segment.layout,binding.width,binding.height);
        const event=id=>{const e=(segment.events||[]).find(e=>e.id===id);if(!e)throw new Error('Unknown event '+id+' in '+segment.id);return e;};
        const phase=id=>{const e=event(id);return clamp((localTime-e.start)/(e.end-e.start),0,1);};
        const D=host.forSegment?host.forSegment(segment):host.D;
        const args={ctx:host.ctx,D,t,mediaTime:mt,localTime,segment,layout,asset:host.asset,event,phase};
        const draw=()=>{
          if(segment.background!==undefined)host.background?.(segment.background,layout.stage);
          const materials=[];
          for(const shot of activeShots(segment,mt)){
            const node=host.materialAsset?host.materialAsset(segment,shot):host.asset(shot.asset);
            const video=binding.media.assets.find(a=>a.id===shot.asset).type==='video';
            const source_time=video?shotSourceTime(segment,shot,mt,node.duration):null;
            const crop=cropAt(shot,localTime),iw=node.videoWidth||node.naturalWidth||node.width,ih=node.videoHeight||node.naturalHeight||node.height;
            if(!(iw>0&&ih>0))throw new Error('Material shot is not decoded: '+shot.id);
            D.image(node,shot.target||layout.contentRect,{crop:{x:crop.x*iw,y:crop.y*ih,w:crop.w*iw,h:crop.h*ih},fit:shot.fit||'contain',radius:0});
            materials.push({id:shot.id,asset:shot.asset,source_time,crop,target:shot.target||layout.contentRect});
          }
          const result=segment.scene?host.scenes[segment.scene](args):undefined;
          if(result&&typeof result.then==='function')throw new Error('Scene drawing must be synchronous after ready(): '+segment.scene);
          totalCalls++;
          if(trace.length<2000)trace.push({segment:segment.id,scene:segment.scene||null,animationTime:t,mediaTime:mt,layout:layout.mode,material_shots:materials});
        };
        if(layout.mode==='presenter-opening')host.opening({...layout,frame:host.asset(layout.presenter),captions},draw);
        else host.frame(draw);
      }
      host.caption(captions);
      return {animationTime:t,mediaTime:mt,segments:selected.map(s=>s.id)};
    }
    return {timeline:binding,render,state:{authored:binding.duration_seconds>0&&binding.segments.length>0,semanticFitVerified:false,aestheticApproval:false},
      motionActive:t=>binding.segments.some(row=>{const local=t-range(row)[0];return (row.events||[]).some(e=>e.motion!==false&&local>=e.start&&local<e.end)||
        (row.material_shots||[]).some(s=>local>=s.start&&local<s.end&&(s.crop_keyframes||[]).some((k,i,keys)=>i>0&&local>=keys[i-1].at&&local<k.at&&['x','y','w','h'].some(p=>k[p]!==keys[i-1][p])));}),
      getTrace:(limit=2000)=>({origin:'successful-CanvasStory-draws',totalCalls,calls:trace.slice(0,Math.min(2000,Math.max(0,limit))),scope:'Execution only, not semantic fit or aesthetic approval.'}),
      resetTrace:()=>{trace.length=0;totalCalls=0;}};
  }
  global.CanvasStoryCore={validate,layoutFor,sourceTime,shotSourceTime,cropAt,activeShots,createRuntime};
  if(typeof module!=='undefined'&&module.exports)module.exports=global.CanvasStoryCore;
  if(typeof document==='undefined')return;

  const renderMode=new URLSearchParams(location.search).get('render')==='1';
  document.documentElement.classList.toggle('render-mode',renderMode);
  const canvas=document.getElementById('stage'),ctx=canvas.getContext('2d'),audio=document.getElementById('narration');
  const seek=document.getElementById('seek'),clock=document.getElementById('time'),empty=document.getElementById('empty-state');
  const assets=new Map(),mediaRows=[],shotNodes=new Map(),shotVideos=[],objectURLs=[];
  let loaded,engine,playing=false,previewTime=0,frameRequest,totalBlobBytes=0,currentMediaTime=0,renderQueue=Promise.resolve();
  function localURL(src){const u=new URL(src,location.href);if(!['http:','https:'].includes(u.protocol)||u.origin!==location.origin)throw new Error('Use a same-origin project asset URL: '+src);return u.href;}
  function decoded(node){return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>done(new Error('Media decode timeout: '+node.dataset.source)),20000);
    const check=()=>{if(node.readyState>=2&&Number.isFinite(node.duration)&&node.duration>0)done();};
    const fail=()=>done(new Error('Media decode failed: '+node.dataset.source));
    function done(error){clearTimeout(timer);for(const e of ['loadeddata','canplay'])node.removeEventListener(e,check);node.removeEventListener('error',fail);error?reject(error):resolve();}
    for(const e of ['loadeddata','canplay'])node.addEventListener(e,check);node.addEventListener('error',fail);check();
  });}
  async function loadMedia(node,src){
    const url=localURL(src);node.dataset.source=src;
    const response=await fetch(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error('Cannot load media: '+src);
    const limit=128*1024*1024;
    if(Number(response.headers.get('content-length'))>limit){
      await response.body?.cancel();
      if(response.headers.get('accept-ranges')?.toLowerCase()!=='bytes')throw new Error('Large video needs the existing range-capable server: '+src);
      node.src=url;
    }else{
      const reader=response.body.getReader(),parts=[];let size=0;
      while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;totalBlobBytes+=value.byteLength;
        if(size>limit||totalBlobBytes>512*1024*1024){await reader.cancel();throw new Error('Media load exceeds bounded preview memory; use range-capable server');}parts.push(value);}
      const blob=new Blob(parts,{type:response.headers.get('content-type')||''});node.src=URL.createObjectURL(blob);objectURLs.push(node.src);
    }
    node.load();await decoded(node);
  }
  async function seekMedia(node,time){
    const target=clamp(time,0,Math.max(0,node.duration-.001));
    if(!node.seeking&&node.readyState>=2&&Math.abs(node.currentTime-target)<.0005)return;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(new Error('Media seek timeout: '+node.dataset.source)),15000);
      const done=()=>finish(Math.abs(node.currentTime-target)>.03?new Error('Media seek mismatch'):null);
      const fail=()=>finish(new Error('Media seek failed'));
      function finish(error){clearTimeout(timer);node.removeEventListener('seeked',done);node.removeEventListener('error',fail);error?reject(error):resolve();}
      node.addEventListener('seeked',done);node.addEventListener('error',fail);node.currentTime=target;
    });
  }
  function fit(){canvas.style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/canvas.width,innerHeight/canvas.height)})`;}
  async function load(){
    const binding = await (await fetch('./timeline.json')).json();
    const project=await (await fetch('./project.json',{cache:'no-store'})).json();
    const palette=await (await fetch('./lib/agent-editorial/palette.json',{cache:'no-store'})).json();
    validate(binding,global.StoryScenes);
    if(project.duration!==binding.duration_seconds||project.width!==binding.width||project.height!==binding.height)throw new Error('project.json and timeline.json size/duration disagree');
    if((project.audio||'')!==(binding.media.audio||'')||JSON.stringify(project.captions||[])!==JSON.stringify(binding.media.captions))throw new Error('Audio/captions must share the original master timeline in project.json and timeline.json');
    canvas.width=binding.width;canvas.height=binding.height;fit();seek.max=binding.duration_seconds;
    await Promise.all(binding.media.assets.map(async row=>{
      const node=document.createElement(row.type==='image'?'img':'video');assets.set(row.id,node);
      if(row.type==='image'){node.src=localURL(row.src);await node.decode();}
      else{node.muted=true;node.playsInline=true;node.preload='auto';await loadMedia(node,row.src);mediaRows.push({node,row});}
    }));
    // Each occurrence owns a decoder/time position, but shares its already fetched URL.
    // Two comparison shots can therefore show different moments from the same clip.
    await Promise.all(binding.segments.flatMap(segment=>(segment.material_shots||[]).map(async shot=>{
      const source=assets.get(shot.asset),definition=binding.media.assets.find(a=>a.id===shot.asset);
      if(definition.type==='image'){shotNodes.set(shotKey(segment,shot),source);return;}
      if(shot.source_out>source.duration+.000001)throw new Error('Material source_out exceeds decoded duration: '+shot.id);
      const node=document.createElement('video');node.muted=true;node.playsInline=true;node.preload='auto';node.dataset.source=definition.src;
      node.src=source.src;node.load();await decoded(node);
      shotNodes.set(shotKey(segment,shot),node);shotVideos.push({node,segment,shot});
    })));
    if(binding.media.audio)await loadMedia(audio,binding.media.audio);
    await document.fonts.ready;
    const basePalette=palette.colors||palette,options={width:binding.width,height:binding.height,logicalWidth:binding.width,logicalHeight:binding.height,fontFamily:project.fontFamily||'"Microsoft YaHei",sans-serif'};
    const D=global.AgentEditorial.create(ctx,{...options,palette:basePalette}),scenePainters=new Map();
    for(const segment of binding.segments)if(segment.palette)scenePainters.set(segment.id,global.AgentEditorial.create(ctx,{...options,palette:{...basePalette,...segment.palette}}));
    const asset=id=>{
      if(!assets.has(id))throw new Error('Missing asset: '+id);
      const node=assets.get(id),video=mediaRows.find(item=>item.row.id===id);
      if(video)sourceTime(video.row,currentMediaTime,node.duration);
      return node;
    };
    engine=createRuntime(binding,{ctx,D,scenes:global.StoryScenes,asset,
      materialAsset:(segment,shot)=>shotNodes.get(shotKey(segment,shot)),
      forSegment:segment=>scenePainters.get(segment.id)||D,
      background:(color,r)=>{ctx.save();ctx.fillStyle=color;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.restore();},
      begin:()=>{ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle=project.background||'#0B0B0F';ctx.fillRect(0,0,canvas.width,canvas.height);},
      frame:draw=>D.frame(draw),
      opening:(layout,draw)=>{
        const measured=Array.isArray(layout.regions)&&layout.regions.length>0&&Array.isArray(layout.protectedRects)&&layout.protectedRects.length>0;
        const protectedRects=measured?[...layout.protectedRects]:[];
        if(measured&&layout.captions.length)protectedRects.push({x:0,y:canvas.height*.88,w:canvas.width,h:canvas.height*.12});
        global.AgentEditorial.opening(ctx,{frame:layout.frame,stage:layout.stage,regions:layout.regions||[],protectedRects},draw);
      },
      caption:lines=>{
        if(!lines.length)return;ctx.save();ctx.font=`600 ${project.captionSize||36}px ${project.fontFamily||'"Microsoft YaHei",sans-serif'}`;
        ctx.textAlign='center';ctx.textBaseline='middle';const text=lines.join(' '),width=Math.min(canvas.width*.92,ctx.measureText(text).width+40);
        ctx.fillStyle='rgba(11,11,15,.9)';ctx.fillRect((canvas.width-width)/2,canvas.height-88,width,58);ctx.fillStyle='#fff';ctx.fillText(text,canvas.width/2,canvas.height-59,width-24);ctx.restore();
      }});
    global.UIFusionRuntime=engine;global.productionState=engine.state;empty.hidden=engine.state.authored;
    if(renderMode&&!engine.state.authored)throw new Error('Story workspace is unmade; author actual narration scenes before export');
    return engine;
  }
  global.ready=()=>loaded||(loaded=load());
  async function renderFrame(animationTime,mediaTime){
    const runtime=await global.ready(),mt=clamp(finite(mediaTime,'mediaTime'),0,runtime.timeline.duration_seconds);
    currentMediaTime=mt;
    await Promise.all(mediaRows.map(({node,row})=>seekMedia(node,mt-(row.start||0)+(row.mediaStart||0))));
    await Promise.all(shotVideos.filter(({segment,shot})=>mt>=range(segment)[0]&&mt<range(segment)[1]&&activeShots(segment,mt).includes(shot))
      .map(({node,segment,shot})=>seekMedia(node,shotSourceTime(segment,shot,mt,node.duration))));
    if(audio.src&&!playing&&!renderMode)await seekMedia(audio,mt);
    const result=runtime.render(animationTime,mt);previewTime=mt;seek.value=mt;clock.textContent=mt.toFixed(2)+' s';return result;
  }
  // Seeking mutates video decoders; overlapping scrub requests must not exchange frames.
  global.render=(animationTime,mediaTime=animationTime)=>{
    const task=renderQueue.then(()=>renderFrame(animationTime,mediaTime));
    renderQueue=task.catch(()=>{});return task;
  };
  global.motionActive=t=>!!engine&&engine.motionActive(t);
  addEventListener('resize',fit);addEventListener('pagehide',()=>objectURLs.forEach(URL.revokeObjectURL));
  document.getElementById('play').onclick=async()=>{
    await global.ready();if(!engine.state.authored)return;
    if(playing){playing=false;audio.pause();cancelAnimationFrame(frameRequest);return;}
    playing=true;let previous=performance.now();if(audio.src){await seekMedia(audio,previewTime);await audio.play();}
    async function tick(now){if(!playing)return;const current=audio.src?audio.currentTime:previewTime+(now-previous)/1000;previous=now;
      await global.render(current,current);if(current>=engine.timeline.duration_seconds||audio.ended){playing=false;audio.pause();return;}frameRequest=requestAnimationFrame(tick);}
    frameRequest=requestAnimationFrame(tick);
  };
  seek.oninput=async()=>{playing=false;audio.pause();cancelAnimationFrame(frameRequest);await global.render(Number(seek.value));};
  if(!renderMode)global.ready().then(()=>global.render(0)).catch(error=>{empty.hidden=false;empty.textContent=error.message;console.error(error);});
})(typeof window!=='undefined'?window:globalThis);
