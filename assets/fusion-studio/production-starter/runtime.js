/* Persistent objects + actual EditingKit calls. No narration or layout is invented. */
(function (global) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function finite(value, label) {
    if (!Number.isFinite(value)) throw new TypeError(label + ' must be finite');
    return value;
  }
  function validate(timeline, names) {
    if (!timeline || timeline.schema_version !== 1) throw new Error('Unsupported timeline schema');
    for (const key of ['duration', 'width', 'height']) finite(timeline[key], key);
    if (timeline.duration < 0 || timeline.width <= 0 || timeline.height <= 0) throw new Error('Invalid stage size/duration');
    if (!Array.isArray(timeline.objects) || !Array.isArray(timeline.actions)) throw new Error('objects and actions must be arrays');
    const ids = new Set();
    for (const row of timeline.objects) {
      if (!row.id || ids.has(row.id)) throw new Error('Object ids must be nonempty and unique');
      ids.add(row.id);
      if (!['text','image','video','host','group'].includes(row.type)) throw new Error('Unsupported object type: ' + row.type);
      if (['image','video'].includes(row.type) && !row.src) throw new Error('Media object needs src: ' + row.id);
      if (row.start !== undefined) finite(row.start, row.id + '.start');
      if (row.end !== undefined) finite(row.end, row.id + '.end');
      if ((row.start || 0) < 0 || (row.end ?? timeline.duration) < (row.start || 0)) throw new Error('Invalid object interval: ' + row.id);
    }
    const actions = new Set();
    for (const row of timeline.actions) {
      if (!row.id || actions.has(row.id)) throw new Error('Action ids must be nonempty and unique');
      actions.add(row.id);
      if (!names.includes(row.name)) throw new Error('Unknown EditingKit method: ' + row.name);
      finite(row.start, row.id + '.start'); finite(row.end, row.id + '.end');
      if (!(0 <= row.start && row.start < row.end && row.end <= timeline.duration)) throw new Error('Invalid action interval: ' + row.id);
      if (!row.options || typeof row.options !== 'object') throw new Error('Action needs options: ' + row.id);
    }
    if (!timeline.media || !Array.isArray(timeline.media.captions)) throw new Error('media.captions must be an array');
    for (const row of timeline.media.captions) {
      finite(row.start, 'caption.start'); finite(row.end, 'caption.end');
      if (!(0 <= row.start && row.start < row.end && row.end <= timeline.duration) || typeof row.text !== 'string') throw new Error('Invalid caption');
    }
    return timeline;
  }
  function createRuntime(timeline, host) {
    validate(timeline, host.kit.names);
    const managed = new Set(), objects = new Map(), actions = [], trace = [];
    let frame = 0, count = 0, dropped = 0, lastFrame = [], methodCounts = {};
    function ref(id) {
      const node = objects.get(id) || host.find(id);
      if (!node || !node.style) throw new Error('Missing DOM reference: ' + id);
      managed.add(node);
      return node;
    }
    function resolve(value) {
      if (Array.isArray(value)) return value.map(resolve);
      if (value && typeof value === 'object') {
        if (Object.keys(value).length === 1 && typeof value.$ref === 'string') return ref(value.$ref);
        return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, resolve(v)]));
      }
      return value;
    }
    for (const row of timeline.objects) {
      const node = row.type === 'host' ? host.find(row.id) : host.create(row);
      if (!node || objects.has(row.id)) throw new Error('Cannot create/find object: ' + row.id);
      objects.set(row.id, node); managed.add(node);
    }
    for (const row of timeline.objects) {
      const node = objects.get(row.id);
      if (row.type !== 'host' || row.parent) {
        const parent = row.parent ? ref(row.parent) : host.container;
        if (parent === node || node.contains && node.contains(parent)) throw new Error('Cyclic object parents');
        parent.appendChild(node);
      }
      if (row.style) for (const [key, value] of Object.entries(row.style)) {
        node.style.setProperty(key.replace(/[A-Z]/g, c => '-' + c.toLowerCase()), String(value));
      }
    }
    for (const [order, row] of timeline.actions.entries()) actions.push({...row, order, resolved:resolve(row.options)});
    actions.sort((a,b) => a.start-b.start || a.order-b.order);
    // All mutations start from this baseline on every seek, including backwards.
    const baseline = new Map([...managed].map(node => [node, node.getAttribute('style')]));
    function render(animationTime, mediaTime = animationTime) {
      const at = clamp(finite(animationTime, 'animationTime'), 0, timeline.duration);
      const mt = clamp(finite(mediaTime, 'mediaTime'), 0, timeline.duration);
      frame++; lastFrame = [];
      for (const node of managed) {
        host.kit.reset(node);
        const original = baseline.get(node);
        if (original === null) node.removeAttribute('style'); else node.setAttribute('style', original);
      }
      for (const action of actions) {
        if (at < action.start) continue;
        const progress = clamp((at-action.start)/(action.end-action.start),0,1);
        // Record only after the actual library call succeeds, never from plan markers.
        const result = host.kit.apply(action.name, action.resolved, progress);
        const entry = {frame, animationTime:at, mediaTime:mt, action:action.id, method:action.name,
          progress, options:clone(action.options), result:clone(result)};
        count++; methodCounts[action.name]=(methodCounts[action.name]||0)+1; lastFrame.push(entry);
        if (trace.length < 50000) trace.push(entry); else dropped++;
      }
      for (const row of timeline.objects) {
        const node = objects.get(row.id);
        const visible = at >= (row.start || 0) && at <= (row.end ?? timeline.duration);
        if (!visible) node.style.setProperty('visibility','hidden');
      }
      const captions = timeline.media.captions.filter(row => mt >= row.start && mt < row.end).map(row => row.text);
      host.caption(captions.join('\n'));
      return {animationTime:at,mediaTime:mt,objects,media:timeline.objects.filter(row=>row.type==='video').map(row=>({
        node:objects.get(row.id), time:Math.max(0,mt-(row.start||0)+(row.mediaStart||0))}))};
    }
    return {render, objects, timeline,
      motionActive: t => actions.some(a => t >= a.start && t < a.end),
      state: {authored:timeline.duration > 0 && timeline.objects.length > 0,
        hasActions:actions.length > 0, semanticFitVerified:false, aestheticApproval:false},
      getTrace: (limit=50000) => {
        const bounded=Math.max(0,Math.min(50000,Math.floor(finite(limit,'trace limit'))));
        return {schema_version:1,origin:'successful-UIEditingKit.apply-calls',totalCalls:count,droppedCalls:dropped,
          methodCounts:{...methodCounts},omittedFromSnapshot:Math.max(0,trace.length-bounded),
          calls:clone(trace.slice(0,bounded)),lastFrame:clone(lastFrame),scope:'Execution only; not semantic or visual approval.'};
      },
      resetTrace: () => {trace.length=0;frame=0;count=0;dropped=0;lastFrame=[];methodCounts={};}
    };
  }
  function waitForDecodedMedia(node, timeoutMs=15000) {
    if (node.error) return Promise.reject(new Error('Media decode failed: '+(node.dataset?.source||node.src)));
    if (node.readyState>=2 && Number.isFinite(node.duration) && node.duration>0) return Promise.resolve();
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{cleanup();reject(new Error('Media metadata/decode timeout: '+(node.dataset?.source||node.src)));},timeoutMs);
      function cleanup(){clearTimeout(timer);for(const name of ['loadedmetadata','loadeddata','canplay'])node.removeEventListener(name,check);node.removeEventListener('error',fail);}
      function check(){if(node.readyState>=2 && Number.isFinite(node.duration) && node.duration>0){cleanup();resolve();}}
      function fail(){cleanup();reject(new Error('Media decode failed: '+(node.dataset?.source||node.src)));}
      for(const name of ['loadedmetadata','loadeddata','canplay'])node.addEventListener(name,check);
      node.addEventListener('error',fail);check();
    });
  }
  async function seekMedia(node, seconds, timeoutMs=15000) {
    if (!Number.isFinite(node.duration) || node.duration<=0) throw new Error('Cannot seek media without decoded duration: '+(node.dataset?.source||node.src));
    const target=clamp(finite(seconds,'media seek time'),0,Math.max(0,node.duration-.001));
    if(Math.abs(node.currentTime-target)<.0005 && node.readyState>=2 && !node.seeking)return;
    await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{cleanup();reject(new Error('Media seek timeout: '+(node.dataset?.source||node.src)+' requested='+target+' actual='+node.currentTime));},timeoutMs);
      function cleanup(){clearTimeout(timer);node.removeEventListener('seeked',done);node.removeEventListener('loadeddata',check);node.removeEventListener('canplay',check);node.removeEventListener('error',fail);}
      function check(){if(!node.seeking&&Math.abs(node.currentTime-target)<=.03&&node.readyState>=2){cleanup();resolve();}}
      function done(){
        if(Math.abs(node.currentTime-target)>.03){cleanup();reject(new Error('Media seek mismatch: '+(node.dataset?.source||node.src)+' requested='+target+' actual='+node.currentTime));return;}
        check();
      }
      function fail(){cleanup();reject(new Error('Media seek/decode failed: '+(node.dataset?.source||node.src)));}
      node.addEventListener('seeked',done);node.addEventListener('loadeddata',check);node.addEventListener('canplay',check);node.addEventListener('error',fail);
      try{node.currentTime=target;}catch(error){cleanup();reject(error);}
    });
  }
  const API = {validate, createRuntime, waitForDecodedMedia, seekMedia};
  global.UIFusionRuntimeCore = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  if (typeof document === 'undefined') return;

  const renderMode = new URLSearchParams(location.search).get('render') === '1';
  document.documentElement.classList.toggle('render-mode', renderMode);
  const stage = document.getElementById('stage'), container = document.getElementById('objects');
  const audio = document.getElementById('narration'), caption = document.getElementById('caption');
  const seek = document.getElementById('seek'), time = document.getElementById('time');
  let loaded, engine, playing=false, previewTime=0, frameRequest;
  async function json(path) {
    const response = await fetch(path,{cache:'no-store'});
    if (!response.ok) throw new Error('Cannot load '+path+': '+response.status);
    return response.json();
  }
  const mediaSources=new Map(), blobURLs=new Set();
  const MAX_BLOB_BYTES=128*1024*1024, MAX_TOTAL_BLOB_BYTES=512*1024*1024;
  let blobBytes=0;
  async function seekableSource(source) {
    const url=new URL(source,location.href);
    if(!['http:','https:'].includes(url.protocol)||url.origin!==location.origin)throw new Error('Media must be a current-project same-origin local asset: '+source);
    if(mediaSources.has(url.href))return mediaSources.get(url.href);
    const pending=(async()=>{
      let head=null;
      const headController=new AbortController(),headTimeout=setTimeout(()=>headController.abort(),15000);
      try{head=await fetch(url.href,{method:'HEAD',cache:'no-store',redirect:'error',signal:headController.signal});}
      catch(_){/* bounded GET below still checks bytes */}finally{clearTimeout(headTimeout);}
      const length=Number(head?.headers.get('content-length'))||0;
      if(head?.ok&&length>MAX_BLOB_BYTES){
        if(head.headers.get('accept-ranges')?.toLowerCase()==='bytes')return url.href;
        throw new Error('Local media exceeds the 128 MiB Blob limit and this server has no byte-range support. Use the existing range-capable renderer/server: '+source);
      }
      const controller=new AbortController(), timeout=setTimeout(()=>controller.abort(),60000);
      let ownBytes=0;
      try{
        const response=await fetch(url.href,{cache:'no-store',redirect:'error',signal:controller.signal});
        if(!response.ok)throw new Error('Cannot load local media '+source+': HTTP '+response.status);
        if(Number(response.headers.get('content-length'))>MAX_BLOB_BYTES)throw new Error('Local media exceeds the 128 MiB Blob limit: '+source);
        if(!response.body?.getReader)throw new Error('Bounded local media loading is unavailable in this browser');
        const reader=response.body.getReader(),parts=[];
        while(true){
          const {done,value}=await reader.read();if(done)break;
          ownBytes+=value.byteLength;blobBytes+=value.byteLength;
          if(ownBytes>MAX_BLOB_BYTES||blobBytes>MAX_TOTAL_BLOB_BYTES){controller.abort();throw new Error('Local media Blob memory limit exceeded; use the existing range-capable renderer/server: '+source);}
          parts.push(value);
        }
        if(!ownBytes)throw new Error('Local media is empty: '+source);
        const blob=new Blob(parts,{type:response.headers.get('content-type')||''});
        const objectURL=URL.createObjectURL(blob);blobURLs.add(objectURL);return objectURL;
      }catch(error){controller.abort();blobBytes-=ownBytes;throw new Error('Local media load failed: '+source+'; '+error.message);}
      finally{clearTimeout(timeout);}
    })();
    mediaSources.set(url.href,pending);return pending;
  }
  async function loadSeekableMedia(node,source) {
    node.dataset.source=source;
    node.src=await seekableSource(source);node.load();
    await waitForDecodedMedia(node);
  }
  addEventListener('pagehide',()=>{for(const url of blobURLs)URL.revokeObjectURL(url);});
  function fit() {
    const t=engine.timeline;
    stage.style.transform=`scale(${Math.min(innerWidth/t.width,innerHeight/t.height)})`;
  }
  async function load() {
    const [project,timeline]=await Promise.all([json('project.json'),json('timeline.json')]);
    validate(timeline,global.UIEditingKit.names);
    if (project.duration !== timeline.duration || project.width !== timeline.width || project.height !== timeline.height) throw new Error('project.json and timeline.json duration/size must agree');
    if ((project.audio||'') !== (timeline.media.audio||'')) throw new Error('Audio mismatch: renderer and timeline must use the same original file');
    if (JSON.stringify(project.captions||[]) !== JSON.stringify(timeline.media.captions)) throw new Error('Caption mismatch: project.json and timeline.json must use identical preserved captions');
    engine=createRuntime(timeline,{
      kit:global.UIEditingKit,container,find:id=>document.getElementById(id),caption:value=>caption.textContent=value,
      create:row=>{
        if(document.getElementById(row.id))throw new Error('DOM id already exists; use host type: '+row.id);
        const node=document.createElement(row.type==='image'?'img':row.type==='video'?'video':'div');
        node.id=row.id;node.dataset.fusionObject=row.id;
        if(row.type==='text')node.textContent=row.text||'';
        if(row.type==='image'){node.src=row.src;node.alt=row.alt||'';}
        if(row.type==='video'){node.dataset.source=row.src;node.muted=true;node.playsInline=true;node.preload='auto';}
        return node;
      }
    });
    global.UIFusionRuntime=engine;global.productionState=engine.state;
    document.getElementById('empty-state').hidden=engine.state.authored;
    if(renderMode&&!engine.state.authored)throw new Error('Production workspace is unmade; author the actual timeline before export');
    stage.style.width=timeline.width+'px';stage.style.height=timeline.height+'px';fit();
    seek.max=timeline.duration;
    const media=[...engine.objects.values()].filter(node=>['IMG','VIDEO'].includes(node.tagName));
    if(timeline.media.audio){audio.dataset.source=timeline.media.audio;media.push(audio);}
    await Promise.all([...media.map(node=>node.tagName==='IMG'?node.decode():loadSeekableMedia(node,node.dataset.source||node.getAttribute('src'))),document.fonts.ready]);
    return engine;
  }
  global.ready=()=>loaded||(loaded=load());
  global.render=async(animationTime,mediaTime=animationTime)=>{
    const runtime=await global.ready(), result=runtime.render(animationTime,mediaTime);
    await Promise.all(result.media.map(row=>seekMedia(row.node,row.time)));
    if(!playing && audio.src)await seekMedia(audio,result.mediaTime);
    seek.value=result.mediaTime;time.textContent=result.mediaTime.toFixed(2)+' s';previewTime=result.mediaTime;
    return {animationTime:result.animationTime,mediaTime:result.mediaTime};
  };
  global.motionActive=t=>!!engine&&engine.motionActive(t);
  addEventListener('resize',()=>{if(engine)fit();});
  document.getElementById('play').onclick=async()=>{
    await global.ready();if(!engine.state.authored)return;
    if(playing){playing=false;audio.pause();cancelAnimationFrame(frameRequest);return;}
    playing=true;let previous=performance.now();
    if(audio.src){await seekMedia(audio,previewTime);await audio.play();}
    async function tick(now){
      if(!playing)return;
      const current=audio.src?audio.currentTime:previewTime+(now-previous)/1000;previous=now;
      await global.render(current,current);
      if(current>=engine.timeline.duration){playing=false;audio.pause();return;}
      frameRequest=requestAnimationFrame(tick);
    }
    frameRequest=requestAnimationFrame(tick);
  };
  seek.oninput=async()=>{playing=false;audio.pause();cancelAnimationFrame(frameRequest);await global.render(Number(seek.value),Number(seek.value));};
  document.getElementById('trace').onclick=()=>{
    if(!engine)return;const url=URL.createObjectURL(new Blob([JSON.stringify(engine.getTrace(),null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='editing-kit-runtime-trace.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),0);
  };
  if(!renderMode)global.ready().then(()=>global.render(0,0)).catch(error=>{
    document.getElementById('empty-state').hidden=false;document.getElementById('empty-state').textContent=error.message;console.error(error);
  });
})(typeof window!=='undefined'?window:globalThis);
