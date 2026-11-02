/* Complete approved BodyA/BodyB designs, with new narration/material bindings.
 * Source geometry and state chains execute unchanged. This adapter does not run film.js,
 * copy its ranking/navigation, retime narration, or supply private/original media.
 */
(function (root, factory) {
  const node = typeof module === 'object' && module.exports;
  const api = factory(root, node ? require('./agent-editorial.js') : root.AgentEditorial,
    node ? require('./motion-core.js') : root.MotionCore);
  if (node) module.exports = api;
  if (root) root.SourceDesigns = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root, editorial, motion) {
  'use strict';
  let manifest;
  const clone = v => JSON.parse(JSON.stringify(v));
  const fail = message => { throw new Error('[SourceDesigns] ' + message); };
  const own = (o,k) => Object.prototype.hasOwnProperty.call(o || {}, k);
  const clamp = (v,a=0,b=1) => Math.min(b,Math.max(a,v));
  const mix = (a,b,p) => a+(b-a)*p;
  const structural = s => /^[\s\d.,%+\-–—→←↔✓×Ⅱ⚠/:·()]+$/.test(s);
  function configure(value) {
    if (!value || value.schema !== 'ui-motion-fusion/source-designs@1' || !Array.isArray(value.designs)) fail('Invalid source-design manifest');
    const ids = new Set();
    for (const d of value.designs) {
      if (!d.id || ids.has(d.id) || !['BodyA','BodyB'].includes(d.engine) || !d.chapter || !Array.isArray(d.source_range)) fail('Invalid or duplicate design');
      ids.add(d.id);
    }
    manifest = clone(value);
    return catalog();
  }
  function catalog() { if (!manifest) fail('Call configure(source-designs.json) before inspecting or rendering'); return clone(manifest.designs); }
  function inspect(id) { if (!manifest) fail('Source manifest is not configured'); const d=manifest.designs.find(x=>x.id===id); if(!d)fail('Unknown design: '+id); return clone(d); }
  function interval(binding, design) {
    const range = binding.sourceRange || design.source_range;
    if (!Array.isArray(range) || range.length !== 2 || !range.every(Number.isFinite) || range[1]<=range[0] || range[0]<design.source_range[0] || range[1]>design.source_range[1]) fail('sourceRange must be a continuous interval inside '+design.id);
    return range;
  }
  function slotsFor(design, range) {
    const relevant = slot => !slot.intervals || slot.intervals.some(([a,b])=>b>range[0]&&a<range[1]);
    return {copy:design.copy_slots.filter(relevant),media:design.media_slots.filter(relevant),logos:design.logo_slots.filter(relevant)};
  }
  function pointsFor(binding, design, range) {
    if (!Number.isFinite(binding.duration) || binding.duration<=0) fail('Positive duration is required for '+design.id);
    const known = new Set(design.cues.map(c=>c.id));
    for(const key of Object.keys(binding.cues || {})) if(!known.has(key))fail('Unknown cue '+key+' in '+design.id);
    const points = [[0,range[0]]];
    for(const cue of design.cues) {
      if(cue.source_time<=range[0] || cue.source_time>=range[1])continue;
      const local = binding.demo && !own(binding.cues,cue.id)
        ? (cue.source_time-range[0])/(range[1]-range[0])*binding.duration : binding.cues?.[cue.id];
      if(!Number.isFinite(local) || local<=0 || local>=binding.duration)fail('Cue '+cue.id+' needs a local time inside (0, duration)');
      points.push([local,cue.source_time]);
    }
    points.push([binding.duration,range[1]]);
    for(let i=1;i<points.length;i++) if(points[i][0]<=points[i-1][0] || points[i][1]<=points[i-1][1])fail('Cues must preserve the selected source state order: '+design.id);
    return points;
  }
  function mapTime(local,points) {
    local=clamp(local,0,points[points.length-1][0]);
    for(let i=1;i<points.length;i++)if(local<=points[i][0])return mix(points[i-1][1],points[i][1],(local-points[i-1][0])/(points[i][0]-points[i-1][0]));
    return points[points.length-1][1];
  }
  function textValue(value,key) {
    if(typeof value==='string' && value.trim())return value;
    if(value && value.omit===true)return '';
    fail('copy['+JSON.stringify(key)+'] must contain new text or explicit {omit:true}');
  }
  function mediaSpec(value,key) {
    const spec=typeof value==='string'?{asset:value}:value;
    if(!spec || typeof spec.asset!=='string' || !spec.asset)fail('Material '+key+' needs a project asset ID');
    if(spec.crop && (!Array.isArray(spec.crop)||spec.crop.length!==4||!spec.crop.every(Number.isFinite)||spec.crop[2]<=0||spec.crop[3]<=0))fail('crop must be [x,y,width,height] for '+key);
    return spec;
  }
  function prepare(binding) {
    const design=inspect(binding.design),range=interval(binding,design),slots=slotsFor(design,range);
    const points=pointsFor(binding,design,range);
    if(!binding.demo) {
      for(const slot of slots.copy)if(!own(binding.copy,slot.source))fail('Missing copy slot '+JSON.stringify(slot.source)+' in '+design.id);else textValue(binding.copy[slot.source],slot.source);
      for(const slot of slots.media)mediaSpec(binding.media?.[slot.key],slot.key);
      for(const slot of slots.logos)mediaSpec(binding.logos?.[slot.key],slot.key);
    }
    return {design,range,slots,points};
  }
  function createScene(input) {
    const binding=clone(input || {});
    let prepared;
    const get=()=>prepared||(prepared=prepare(binding));
    const trace={id:binding.design,implementation:'approved-source-body',sourceFiles:[],sourceHashes:{},sourceRange:binding.sourceRange||null};
    const scene=function sourceDesignScene(args) {
      const {design,range,points}=get();
      if(!Number.isFinite(args.localTime))fail('StoryScenes localTime is required');
      const original=root[design.engine];
      if(!original || typeof original.draw!=='function')fail('Load '+design.source_file+' before rendering '+design.id);
      // A selected sourceRange is half-open: a paused player at the final local second
      // must not enter the next source branch (and request its unrelated assets).
      const sourceTime=Math.min(mapTime(args.localTime,points),range[1]-1e-7);
      const viewport=binding.viewport || args.layout?.contentRect || design.source_viewport;
      const w=viewport.w??viewport.width,h=viewport.h??viewport.height;
      if(![viewport.x,viewport.y,w,h].every(Number.isFinite)||w<=0||h<=0)fail('viewport must contain finite x,y and positive w,h');
      const raw=args.ctx;
      if(!raw)fail('Canvas context is required');
      const C={...(editorial?.palette || {}),...(args.D?.C || {})};
      if(!C.purple || !C.black)fail('Load AgentEditorial with the current palette');
      const lookup=(s)=>{s=String(s);if(own(binding.copy,s))return textValue(binding.copy[s],s);if(binding.demo||structural(s))return s;fail('Unbound drawn text '+JSON.stringify(s)+' in '+design.id);};
      const descriptorCache=new Map();
      const getImage=(key,isLogo=false)=>{
        const supplied=(isLogo?binding.logos:binding.media)?.[key];
        if(!supplied)fail((binding.demo?'Demo still requires material bindings; ':'')+'Missing '+(isLogo?'logo ':'media ')+key);
        const spec=mediaSpec(supplied,key),cacheKey=(isLogo?'logo:':'media:')+key;
        if(descriptorCache.has(cacheKey))return descriptorCache.get(cacheKey);
        const actual=args.asset?.(spec.asset);
        if(!actual)fail('Project asset unavailable: '+spec.asset+' for '+key);
        const aw=actual.videoWidth||actual.naturalWidth||actual.width,ah=actual.videoHeight||actual.naturalHeight||actual.height;
        if(!aw||!ah)fail('Asset is not decoded: '+spec.asset);
        const slot=(isLogo?design.logo_slots:design.media_slots).find(s=>s.key===key);
        const region=spec.sourceRegion || slot?.source_region;
        let crop=spec.crop || [0,0,aw,ah];
        if(crop[0]<0||crop[1]<0||crop[0]+crop[2]>aw+.001||crop[1]+crop[3]>ah+.001)fail('Crop outside decoded asset '+spec.asset);
        if(region) {
          if(!Array.isArray(region)||region.length!==4||!region.every(Number.isFinite)||region[2]<=0||region[3]<=0)fail('Invalid sourceRegion for '+key);
          // Cover-crop inside the supplied region; keep original drawing geometry and aspect ratio.
          const ratio=region[2]/region[3],cur=crop[2]/crop[3];
          if(cur>ratio){const cw=crop[3]*ratio;crop=[crop[0]+(crop[2]-cw)/2,crop[1],cw,crop[3]];}
          else {const ch=crop[2]/ratio;crop=[crop[0],crop[1]+(crop[3]-ch)/2,crop[2],ch];}
        }
        const descriptor={__sourceDesignImage:true,actual,crop,region,width:region?region[0]+region[2]:aw,height:region?region[1]+region[3]:ah};
        descriptor.naturalWidth=descriptor.width;descriptor.naturalHeight=descriptor.height;
        descriptorCache.set(cacheKey,descriptor);return descriptor;
      };
      // Original pixel-crop calls keep their moving crop geometry. Only their source image domain
      // maps to the new asset/crop; video decoding and mediaTime remain owned by Story runtime.
      const ctx=new Proxy(raw,{get(target,key){
        if(key==='drawImage')return (im,...a)=>{
          if(!im?.__sourceDesignImage)return target.drawImage(im,...a);
          if(a.length===8){let [sx,sy,sw,sh,...dest]=a;const r=im.region;
            if(r){const kx=im.crop[2]/r[2],ky=im.crop[3]/r[3];sx=im.crop[0]+(sx-r[0])*kx;sy=im.crop[1]+(sy-r[1])*ky;sw*=kx;sh*=ky;}
            return target.drawImage(im.actual,sx,sy,sw,sh,...dest);
          }
          if(a.length===4)return target.drawImage(im.actual,...im.crop,...a);
          return target.drawImage(im.actual,...a);
        };
        const value=target[key];return typeof value==='function'?value.bind(target):value;
      },set(target,key,value){target[key]=value;return true;}});
      const rr=(x,y,w,h,r,fill,stroke,lw=2)=>{if(w<=0||h<=0)return;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}};
      const txt=(s,x,y,size=40,color=C.black,weight=700,align='left',maxWidth)=>{
        const text=lookup(s);if(!text)return;
        ctx.font=`${weight} ${size}px ${binding.fontFamily||'Noto, sans-serif'}`;ctx.textBaseline='alphabetic';ctx.textAlign=align;ctx.fillStyle=color;
        if(Number.isFinite(maxWidth))ctx.fillText(text,x,y,maxWidth);else ctx.fillText(text,x,y);
      };
      const line=(x1,y1,x2,y2,color=C.black,width=3)=>{ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();};
      const arrow=(x1,y1,x2,y2,color=C.purple,width=4)=>{line(x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1);line(x2,y2,x2-15*Math.cos(a-.55),y2-15*Math.sin(a-.55),color,width);line(x2,y2,x2-15*Math.cos(a+.55),y2-15*Math.sin(a+.55),color,width);};
      const image=(key,x,y,w,h,fit='contain',radius=0)=>{const im=typeof key==='string'?getImage(key):key;if(!im)fail('Missing source image');ctx.save();try{if(radius){ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.clip();}const iw=im.__sourceDesignImage?im.crop[2]:im.width,ih=im.__sourceDesignImage?im.crop[3]:im.height,k=fit==='cover'?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih);ctx.drawImage(im,x+(w-iw*k)/2,y+(h-ih*k)/2,iw*k,ih*k);}finally{ctx.restore();}};
      const logo=(slug,x,y,size)=>{slug=slug==='harness'?'deepseek':slug;rr(x,y,size,size,size*.24,C.white);image(getImage(slug,true),x+size*.16,y+size*.16,size*.68,size*.68);};
      const pill=(s,x,y,w,h,fill=C.black,color=C.white,size=30)=>{rr(x,y,w,h,h*.28,fill);txt(s,x+w/2,y+h/2+size*.35,size,fill===C.purple&&color===C.white?C.black:color,800,'center');};
      const H={C,rr,txt,line,arrow,img:image,logo,pill,mix,clamp,
        progress:(t,s,d=.55)=>clamp((t-s)/d),spring:(t,s,delay=0)=>t<s+delay?0:motion.spring(t-s-delay,{from:0,to:1,omega:13,damping:.82}),
        images:new Proxy({}, {get:(_,key)=>typeof key==='string'?getImage(key):undefined}),
        assets:new Proxy({}, {get:(_,slug)=>({hero:'@hero/'+slug,logo:'@logo/'+slug})})};
      const sv=design.source_viewport,k=Math.min(w/sv.w,h/sv.h);
      raw.save();
      try {
        raw.beginPath();raw.rect(viewport.x,viewport.y,w,h);raw.clip();
        raw.translate(viewport.x+(w-sv.w*k)/2,viewport.y+(h-sv.h*k)/2);raw.scale(k,k);raw.translate(-sv.x,-sv.y);
        original.draw(ctx,sourceTime,clone(design.chapter),H);
      } finally { raw.restore(); }
      Object.assign(trace,{sourceFiles:[design.source_file],sourceHashes:{[design.source_file]:design.source_sha256},sourceRange:range.slice(),sourceTime,localTime:args.localTime,mediaTime:args.mediaTime});
      return {design:design.id,sourceTime,mediaTime:args.mediaTime};
    };
    scene.sourceDesign=trace;
    scene.validate=()=>{const p=get();Object.assign(trace,{sourceFiles:[p.design.source_file],sourceHashes:{[p.design.source_file]:p.design.source_sha256},sourceRange:p.range.slice()});return {design:p.design.id,sourceRange:p.range.slice(),slots:clone(p.slots),timeMap:clone(p.points)};};
    scene.sourceTime=local=>mapTime(local,get().points);
    return scene;
  }
  return Object.freeze({configure,catalog,inspect,createScene});
});
