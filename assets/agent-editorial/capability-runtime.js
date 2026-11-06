/* Executable, composable adaptations of retained BodyA/BodyB expressions.
 * Drawing: AgentEditorial's original sheets/files/screens/material frames.
 * Motion: BodyA pop + messy-to-clear/parallel-work and BodyB materialProof;
 * clocks, counts, text, media, grouping and geometry are supplied by this episode.
 * These five adaptations do not make the rest of the reference catalog executable.
 */
(function(root, factory) {
  const node = typeof module === 'object' && module.exports;
  const api = factory(node ? require('./agent-editorial.js') : root.AgentEditorial,
    node ? require('./motion-core.js') : root.MotionCore,
    node ? require('./source-designs.js') : root.SourceDesigns);
  if (node) module.exports = api;
  if (root) root.CapabilityRuntime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(E, M, sourceDesigns) {
  'use strict';
  const TYPES = ['material-focus', 'input-result', 'parallel-groups', 'compare-change', 'presenter-safe', 'source-design'];
  const clone = v => JSON.parse(JSON.stringify(v));
  const fail = s => { throw new Error('[CapabilityRuntime] ' + s); };
  const finite = (v, name) => { if (!Number.isFinite(v)) fail(name + ' must be finite'); return v; };
  const text = (v, name) => { if (typeof v !== 'string' || !v.trim()) fail(name + ' requires current text'); return v; };
  const BASE = {w:1200,h:650};
  function rect(v, name='rect') {
    if (!v || !['x','y','w','h'].every(k=>Number.isFinite(v[k])) || v.w<=0 || v.h<=0) fail(name+' needs x/y and positive w/h');
    return v;
  }
  function objects(value, name, allowEmpty=false) {
    if (!Array.isArray(value) || (!allowEmpty && !value.length)) fail(name+' must be a nonempty array');
    const seen=new Set();
    value.forEach((v,i)=>{text(v.id,name+'['+i+'].id');text(v.label,name+'['+i+'].label');if(seen.has(v.id))fail('Duplicate '+name+' id: '+v.id);seen.add(v.id);if(v.from)rect(v.from,'object.from');if(v.to)rect(v.to,'object.to');});
    return value;
  }
  const cueDefaults = {
    'material-focus':{focus:.25,return:null,dock:.66},
    'input-result':{gather:.2,result:.5,revise:.8},
    'parallel-groups':{group:.22,run:.43,complete:.8},
    'compare-change':{change:.32,compare:.66},
    'presenter-safe':{},'source-design':{}
  };
  function timing(e) {
    const duration=e.end-e.at, cues={};
    for(const [key,fraction] of Object.entries(cueDefaults[e.type])) if(fraction!==null||e.cues?.[key]!==undefined) cues[key]=e.cues?.[key]??fraction*duration;
    const count=Math.max(1,e.objects?.length||e.inputs?.length||Math.max(e.before?.length||0,e.after?.length||0));
    return {duration,cues,transition:e.transition??Math.min(.65,duration/6),stagger:e.stagger??Math.min(.07,duration*.16/count)};
  }
  function validateEvent(e, duration, path, depth=0) {
    text(e.id,path+'.id');if(!TYPES.includes(e.type))fail('Unknown executable type: '+e.type);
    finite(e.at,path+'.at');finite(e.end,path+'.end');
    if(e.at<0||e.end<=e.at||e.end>duration+1e-7)fail(path+' span must be inside its scene');
    if(e.rect)rect(e.rect,path+'.rect');
    for(const key of ['groupArea','inputArea','comparisonArea'])if(e[key])rect(e[key],key);
    if(e.camera) {
      if(e.type==='presenter-safe'||e.type==='source-design')fail('Camera belongs to native child events, not the presenter/source adapter');
      if(e.camera.from)rect(e.camera.from,'camera.from');rect(e.camera.to,'camera.to');
      for(const key of ['at','returnAt'])if(e.camera[key]!==undefined&&finite(e.camera[key],'camera.'+key)<0)fail('Camera times must be nonnegative');
      for(const key of ['duration','returnDuration'])if(e.camera[key]!==undefined&&!(finite(e.camera[key],'camera.'+key)>0))fail('Camera duration must be positive');
      if(e.camera.returnAt!==undefined&&e.camera.returnAt<(e.camera.at||0)+(e.camera.duration||.8))fail('camera.returnAt must follow camera arrival');
    }
    if(e.reveal) {
      if(e.type==='presenter-safe'||e.type==='source-design')fail('Reveal belongs to native child events');
      if(!['x','y'].includes(e.reveal.axis))fail('reveal.axis must be x or y');
      if(e.reveal.duration!==undefined&&!(finite(e.reveal.duration,'reveal.duration')>0))fail('reveal.duration must be positive');
      if(e.reveal.at!==undefined&&finite(e.reveal.at,'reveal.at')<0)fail('reveal.at must be nonnegative');
      if(e.reveal.bandSize!==undefined&&finite(e.reveal.bandSize,'reveal.bandSize')<0)fail('reveal.bandSize must be nonnegative');
    }
    if(e.transition!==undefined&&!(finite(e.transition,'transition')>0))fail('transition must be positive');
    if(e.stagger!==undefined&&finite(e.stagger,'stagger')<0)fail('stagger must be nonnegative');
    const tm=timing(e);let prior=-1;
    for(const [key,value] of Object.entries(e.cues||{})) {
      if(!(key in cueDefaults[e.type]))fail('Unknown '+e.type+' cue: '+key);
      if(finite(value,'cue '+key)<0||value>=tm.duration)fail('Cue '+key+' must lie inside event');
    }
    for(const [key,value] of Object.entries(tm.cues)){if(e.type!=='material-focus'&&value<prior)fail('Preserve semantic cue order for '+e.type+': '+key);prior=value;}
    if(e.type==='material-focus'&&tm.cues.return!==undefined&&tm.cues.return<tm.cues.focus)fail('Material return must follow focus');
    if(e.type==='material-focus') {
      text(e.asset,'asset');for(const key of ['crop','focusCrop','frameRect','dockRect'])if(e[key])rect(e[key],key);
    } else if(e.type==='input-result') {
      objects(e.inputs,'inputs');if(!e.output)fail('input-result needs output');text(e.output.title,'output.title');
      if(e.output.rect)rect(e.output.rect,'output.rect');
      if(e.output.lines!==undefined&&(!Array.isArray(e.output.lines)||!e.output.lines.every(s=>typeof s==='string')))fail('output.lines must be strings');
    } else if(e.type==='parallel-groups') {
      objects(e.objects,'objects');objects(e.groups,'groups');
      const ids=new Set(e.groups.map(g=>g.id));e.objects.forEach(o=>{if(!ids.has(o.group))fail('Unknown group '+o.group+' for '+o.id);});
    } else if(e.type==='compare-change') {
      objects(e.before,'before',true);objects(e.after,'after',true);if(!e.before.length&&!e.after.length)fail('compare-change needs content');
    } else if(e.type==='presenter-safe') {
      if(depth)fail('Presenter overlays cannot contain another presenter');text(e.presenter,'presenter');
      for(const key of ['regions','protectedRects']){if(!Array.isArray(e[key])||!e[key].length)fail('Presenter needs measured '+key);e[key].forEach(r=>rect(r,key));}
      if(!Array.isArray(e.overlays))fail('presenter-safe needs overlays');
      const seen=new Set();e.overlays.forEach((o,i)=>{if(seen.has(o.id))fail('Duplicate overlay '+o.id);seen.add(o.id);validateEvent(o,tm.duration,path+'.overlays['+i+']',depth+1);});
    } else if(e.type==='source-design') {
      if(!e.binding)fail('source-design needs its explicit binding');
      if(Math.abs(e.binding.duration-tm.duration)>1e-7)fail('Source adapter binding.duration must equal event span');
      if(!sourceDesigns)fail('Load SourceDesigns for source-design adapter');
      sourceDesigns.createScene(e.binding).validate();
    }
  }
  function validate(spec) {
    if(!spec||!(finite(spec.duration,'duration')>0)||!Array.isArray(spec.events)||!spec.events.length)fail('Scene needs positive duration and events');
    const seen=new Set();spec.events.forEach((e,i)=>{if(seen.has(e.id))fail('Duplicate event '+e.id);seen.add(e.id);validateEvent(e,spec.duration,'events['+i+']');});
    return {duration:spec.duration,events:spec.events.length,types:[...new Set(spec.events.map(e=>e.type))],aestheticApproval:false};
  }
  // BodyA pop (quartic entry + 35px rise/.94 scale), with caller duration.
  const pop = (t,start,duration,delay=0)=>{const p=E.out((t-start-delay)/duration);return {opacity:p,y:35*(1-p),scale:.94+.06*p};};
  // BodyB materialProof's cubic-out interpolation, now parameterized per event.
  const proof = (t,start,duration)=>1-Math.pow(1-M.clamp((t-start)/duration),3);
  const phase = (t,start,duration)=>E.out((t-start)/duration);
  const blend = (a,b,p)=>({x:M.mix(a.x,b.x,p),y:M.mix(a.y,b.y,p),w:M.mix(a.w,b.w,p),h:M.mix(a.h,b.h,p)});
  function grid(count, area, columns, gap=15) {
    if(!count)return [];
    const cols=Math.max(1,Math.min(count,columns||Math.ceil(Math.sqrt(count*area.w/area.h)))),rows=Math.ceil(count/cols);
    const gx=Math.min(gap,area.w/(cols*4)),gy=Math.min(gap,area.h/(rows*4));
    const w=(area.w-gx*(cols-1))/cols,h=(area.h-gy*(rows-1))/rows;
    return Array.from({length:count},(_,i)=>({x:area.x+i%cols*(w+gx),y:area.y+Math.floor(i/cols)*(h+gy),w,h}));
  }
  function objectStates(e,t,tm) {
    if(e.type==='parallel-groups') {
      const from=grid(e.objects.length,{x:25,y:105,w:1150,h:495},e.columns);
      const panels=grid(e.groups.length,e.groupArea||{x:15,y:90,w:1170,h:530},e.groupColumns||(e.groups.length<=4?e.groups.length:Math.ceil(Math.sqrt(e.groups.length*1.8))),24),targets=new Map();
      e.groups.forEach((g,i)=>{const panel=panels[i],members=e.objects.filter(o=>o.group===g.id),cells=grid(members.length,{x:panel.x+16,y:panel.y+77,w:panel.w-32,h:panel.h-98},g.columns,12);members.forEach((o,j)=>targets.set(o.id,cells[j]));});
      return {panels,groupProgress:phase(t,tm.cues.group,tm.transition),objects:e.objects.map((o,i)=>{
        const target=o.to||targets.get(o.id);
        const group=phase(t,tm.cues.group+i*tm.stagger,tm.transition);
        const run=M.progress(t,tm.cues.run,Math.max(.1,tm.cues.complete-tm.cues.run));
        const completed=t>=tm.cues.complete+(o.delay??0);
        return {...o,rect:blend(o.from||from[i],target,group),entry:pop(t,0,tm.transition,i*tm.stagger),progress:completed?1:Math.min(.94,run*(o.speed??1)),completed};
      })};
    }
    if(e.type==='input-result') {
      const area=e.inputArea||{x:35,y:125,w:510,h:465},targets=grid(e.inputs.length,area,e.columns||1,18);
      const gather=phase(t,tm.cues.gather,tm.transition*1.6);
      return {gather,result:pop(t,tm.cues.result,tm.transition),revise:phase(t,tm.cues.revise,tm.transition),objects:e.inputs.map((o,i)=>{
        const target=o.to||targets[i],offset=(i%2?1:-1)*(22+(i%3)*14);
        const from=o.from||{...target,x:target.x+offset,y:target.y+(i%2?12:-8)};
        return {...o,rect:blend(from,target,gather),rotation:(i%2?.075:-.09)*(1-gather),entry:pop(t,0,tm.transition,i*tm.stagger)};
      })};
    }
    if(e.type==='compare-change') {
      const ids=[...new Set([...e.before.map(o=>o.id),...e.after.map(o=>o.id)])],before=new Map(e.before.map(o=>[o.id,o])),after=new Map(e.after.map(o=>[o.id,o]));
      const positions=grid(ids.length,e.comparisonArea||{x:35,y:145,w:1130,h:440},e.columns||Math.min(3,ids.length),23);
      return {change:phase(t,tm.cues.change,tm.transition),compare:phase(t,tm.cues.compare,tm.transition),objects:ids.map((id,i)=>{
        const a=before.get(id),b=after.get(id),changed=!a||!b||a.label!==b.label||a.detail!==b.detail||a.asset!==b.asset;
        const progress=phase(t,tm.cues.change+i*tm.stagger,tm.transition),base=a?.from||positions[i];
        return {id,before:a||null,after:b||null,changed,progress,rect:blend(base,b?.to||positions[i],progress),entry:pop(t,0,tm.transition,i*tm.stagger)};
      })};
    }
    return {};
  }
  function eventState(e,time,layout) {
    const local=time-e.at,tm=timing(e),area=e.rect||(e.type==='presenter-safe'?layout.stage:layout.contentRect)||{x:0,y:0,w:1920,h:1080};
    const state={id:e.id,type:e.type,localTime:local,rect:rect(area),timing:tm,...objectStates(e,local,tm)};
    if(e.camera) {
      // Canvas adaptation of UIEditingKit.resultPullback: focus rectangle ->
      // centered scale/translation, interpolated with the same smooth curve.
      const camera=e.camera,transform=r=>{const scale=Math.min(BASE.w/r.w,BASE.h/r.h);return {scale,x:BASE.w/2-(r.x+r.w/2)*scale,y:BASE.h/2-(r.y+r.h/2)*scale};};
      const from=transform(camera.from||{x:0,y:0,w:BASE.w,h:BASE.h}),to=transform(camera.to);
      let p=M.smooth(M.progress(local,camera.at||0,camera.duration||.8));
      if(camera.returnAt!==undefined)p*=1-M.smooth(M.progress(local,camera.returnAt,camera.returnDuration||camera.duration||.8));
      state.camera={scale:M.mix(from.scale,to.scale,p),x:M.mix(from.x,to.x,p),y:M.mix(from.y,to.y,p),progress:p};
    }
    if(e.reveal){const progress=M.progress(local,e.reveal.at||0,e.reveal.duration||tm.transition);state.reveal={axis:e.reveal.axis,progress,amount:M.smooth(progress),bandSize:e.reveal.bandSize??60};}
    return state;
  }
  function withAlpha(ctx,a,fn) {if(a<=0)return;ctx.save();try{ctx.globalAlpha*=M.clamp(a);fn();}finally{ctx.restore();}}
  function asset(args,id) {const value=args.asset?.(id);if(!value)fail('Decoded project asset unavailable: '+id);return value;}
  function title(D,e) {if(e.title)D.text(e.title,26,58,42,D.C.black,850,'left',1148);if(e.note)D.text(e.note,26,635,22,D.C.muted,500,'left',1148);}
  function placePop(D,r,entry,fn,rotation=0) {
    D.place({...r,y:r.y+entry.y},fn,{opacity:entry.opacity,scale:entry.scale,rotation});
  }
  function item(D,r,o,opts={},args) {
    const dark=opts.dark!==false,ink=dark?D.C.white:D.C.black,small=r.h<42||r.w<70;
    D.card(r,{dark,fill:opts.fill,depth:small?2:7,radius:small?4:13,shadow:false,edge:dark?D.C.black:D.C.line});
    if(o.asset){D.image(asset(args,o.asset),{x:r.x+10,y:r.y+10,w:r.w-20,h:r.h-20},{fit:o.fit||'contain',radius:6});if(opts.accent)D.rr(r.x+1,r.y+16,6,r.h-32,3,opts.accent);return;}
    if(opts.accent)D.rr(r.x+1,r.y+16,6,r.h-32,3,opts.accent);
    if(small)return;
    const size=Math.min(31,r.h*(o.detail?.length ? .35 : .42),r.w/3);
    D.text(o.label,r.x+18,r.y+(o.detail?r.h*.39:r.h*.57),Math.max(11,size),ink,800,'left',r.w-36);
    if(o.detail&&r.h>65)D.text(o.detail,r.x+18,r.y+r.h*.73,Math.min(20,size*.68),dark?'#C8C3D1':D.C.muted,550,'left',r.w-36);
  }
  function renderMaterial(D,e,s,args) {
    title(D,e);
    const im=asset(args,e.asset),iw=im.videoWidth||im.naturalWidth||im.width,ih=im.videoHeight||im.naturalHeight||im.height;
    const full=e.crop||{x:0,y:0,w:iw,h:ih},focus=e.focusCrop||full;
    for(const r of [full,focus])if(r.x<0||r.y<0||r.x+r.w>iw+.001||r.y+r.h>ih+.001)fail('Material crop exceeds source: '+e.asset);
    const back=s.timing.cues.return===undefined?0:proof(s.localTime,s.timing.cues.return,s.timing.transition);
    const q=proof(s.localTime,s.timing.cues.focus,s.timing.transition)*(1-back),dock=e.dockRect?proof(s.localTime,s.timing.cues.dock,s.timing.transition):0;
    const start=e.frameRect||{x:35,y:103,w:1130,h:480},dest=e.dockRect||start,r=blend(start,dest,dock),crop=blend(full,focus,q);
    const entry=pop(s.localTime,0,s.timing.transition);
    placePop(D,r,entry,(_,local)=>{D.card(local,{depth:8,radius:18,shadow:false});D.image(im,{x:11,y:11,w:local.w-22,h:local.h-22},{crop,fit:e.fit||'contain',radius:12});});
    if(e.caption)D.text(e.caption,r.x,r.y+r.h+31,22,D.C.muted,550,'left',r.w);
    s.material={asset:e.asset,crop,frame:r};
  }
  function renderInput(D,e,s,args) {
    title(D,e);
    for(const o of s.objects)placePop(D,o.rect,o.entry,(_,r)=>{
      if(o.asset)item(D,r,o,{dark:false},args);else D.file(r,o.label,{size:Math.min(31,r.h*.33),detail:o.detail,detailSize:Math.min(20,r.h*.21),shadow:false});
    },o.rotation);
    withAlpha(D.ctx,s.gather,()=>D.arrow(576,340,671,340,D.C.purple,6));
    const r=e.output.rect||{x:715,y:125,w:450,h:465};
    placePop(D,r,s.result,(_,local)=>{
      if(e.output.asset){const content=D.screen(local,e.output.title,{shadow:false,titleSize:24});D.image(asset(args,e.output.asset),content,{fit:'contain'});}
      else D.sheet(local,e.output.title,{shadow:false,size:35,bodySize:26,lineHeight:43,lines:e.output.lines||[]});
      if(e.output.revision)withAlpha(D.ctx,s.revise,()=>D.pill(e.output.revision,{x:24,y:local.h-93,w:local.w-48,h:64},{fill:D.C.purple,color:D.C.black,size:27}));
      if(s.revise>.8)D.check(local.w-34,35,18);
    });
  }
  function renderParallel(D,e,s,args) {
    title(D,e);
    e.groups.forEach((g,i)=>withAlpha(D.ctx,s.groupProgress,()=>{
      const p=s.panels[i];D.card(p,{fill:D.C.paper,shadow:false,depth:0,edge:false,radius:18});D.text(g.label,p.x+17,p.y+43,Math.min(29,p.w/6),D.C.black,850,'left',p.w-34);
      if(g.detail)D.text(g.detail,p.x+17,p.y+65,17,D.C.muted,550,'left',p.w-34);
    }));
    for(const o of s.objects)placePop(D,o.rect,o.entry,(_,r)=>{
      item(D,r,o,{dark:true},args);
      if(e.showProgress!==false&&s.localTime>=s.timing.cues.run&&r.w>40&&r.h>26){D.progress({x:12,y:r.h-15,w:r.w-24,h:5},o.progress,{track:'#42414D'});if(o.completed&&r.w>110&&r.h>50)D.check(r.w-18,18,10);}
    });
  }
  function renderCompare(D,e,s,args) {
    title(D,e);
    const beforeLabel=e.beforeLabel||'调整前',afterLabel=e.afterLabel||'调整后';
    D.pill(s.change>.5?afterLabel:beforeLabel,{x:35,y:91,w:205,h:40},{fill:s.change>.5?D.C.purple:D.C.black,size:23});
    for(const o of s.objects)placePop(D,o.rect,o.entry,(_,r)=>{
      const a=o.before,b=o.after;
      if(!o.changed){item(D,r,b||a,{dark:false},args);return;}
      // Same object keeps its position; its old state lifts out and new state lands.
      withAlpha(D.ctx,1-o.progress,()=>{D.ctx.save();try{D.ctx.translate(0,-18*o.progress);item(D,r,a||{label:'',id:o.id},{dark:false},args);}finally{D.ctx.restore();}});
      if(b)withAlpha(D.ctx,o.progress,()=>{D.ctx.save();try{D.ctx.translate(0,28*(1-o.progress));item(D,r,b,{dark:false,fill:e.highlightFill||D.C.white,accent:e.highlightAccent||D.C.purple},args);}finally{D.ctx.restore();}});
      if(!b&&o.progress>.5){D.line(12,r.h/2,r.w-12,r.h/2,D.C.black,4);}
      if(a&&b&&s.compare>0&&r.h>110)withAlpha(D.ctx,s.compare,()=>{
        D.text(e.showPrevious===false?'':a.label,18,r.h-19,Math.min(18,r.h*.13),D.C.muted,550,'left',r.w-36);
      });
    });
    if(e.summary)withAlpha(D.ctx,s.compare,()=>D.text(e.summary,1165,627,25,D.C.black,750,'right',870));
  }
  function renderEvent(e,s,args) {
    if(e.type==='presenter-safe') {
      const childArgs={...args,localTime:s.localTime},children=e.overlays.filter(v=>s.localTime>=v.at&&s.localTime<v.end);
      s.safeRegions=E.opening(args.ctx,{stage:s.rect,frame:asset(args,e.presenter),regions:e.regions,protectedRects:e.protectedRects,matte:e.matte},()=>{
        children.forEach(v=>renderEvent(v,eventState(v,s.localTime,args.layout||{}),childArgs));
      }).regions;
      return;
    }
    if(e.type==='source-design') {
      const scene=sourceDesigns.createScene({...e.binding,viewport:s.rect});
      s.sourceExecution=scene({...args,localTime:s.localTime,layout:{...args.layout,contentRect:s.rect}});return;
    }
    const ctx=args.ctx;ctx.save();
    try {
      ctx.beginPath();ctx.rect(s.rect.x,s.rect.y,s.rect.w,s.rect.h);ctx.clip();
      const scale=Math.min(s.rect.w/BASE.w,s.rect.h/BASE.h);
      ctx.translate(s.rect.x+(s.rect.w-BASE.w*scale)/2,s.rect.y+(s.rect.h-BASE.h*scale)/2);ctx.scale(scale,scale);
      const D=E.create(ctx,{logicalWidth:BASE.w,logicalHeight:BASE.h,fontFamily:e.fontFamily||'Noto, sans-serif'});
      ctx.save();
      try {
        if(s.reveal){ctx.beginPath();ctx.rect(0,0,s.reveal.axis==='x'?BASE.w*s.reveal.amount:BASE.w,s.reveal.axis==='y'?BASE.h*s.reveal.amount:BASE.h);ctx.clip();}
        if(s.camera){ctx.translate(s.camera.x,s.camera.y);ctx.scale(s.camera.scale,s.camera.scale);}
        ({'material-focus':renderMaterial,'input-result':renderInput,'parallel-groups':renderParallel,'compare-change':renderCompare})[e.type](D,e,s,args);
      } finally {ctx.restore();}
      if(s.reveal&&s.reveal.progress>0&&s.reveal.progress<1&&s.reveal.bandSize>0){
        const r=s.reveal;ctx.fillStyle=e.reveal.bandColor||D.C.purple;
        if(r.axis==='y')ctx.fillRect(0,BASE.h*r.amount-r.bandSize/2,BASE.w,r.bandSize);
        else ctx.fillRect(BASE.w*r.amount-r.bandSize/2,0,r.bandSize,BASE.h);
      }
    } finally {ctx.restore();}
  }
  function createScene(input) {
    const spec=clone(input),report=validate(spec),trace={implementation:'parameterized-capability-events',events:[],sourceFiles:['agent-editorial.js','motion-core.js','source/body-a.js','source/body-b.js'],scope:'Five authored adaptations plus explicit source adapter; not the entire reference library.'};
    const sample=(time,layout={})=>{finite(time,'localTime');const t=Math.min(M.clamp(time,0,spec.duration),spec.duration-1e-8);return spec.events.filter(e=>t>=e.at&&t<e.end).map(e=>eventState(e,t,layout));};
    const scene=args=>{
      if(!args?.ctx)fail('Canvas context is required');
      const states=sample(args.localTime,args.layout||{});
      states.forEach(s=>renderEvent(spec.events.find(e=>e.id===s.id),s,args));
      trace.events=states.map(s=>({id:s.id,type:s.type,localTime:s.localTime,objectCount:s.objects?.length,rect:s.rect,material:s.material,camera:s.camera,reveal:s.reveal,safeRegions:s.safeRegions,sourceExecution:s.sourceExecution}));
      return {capabilities:clone(trace.events),mediaTime:args.mediaTime};
    };
    scene.validate=()=>clone(report);scene.sample=sample;scene.capabilityTrace=trace;
    return scene;
  }
  return Object.freeze({version:'1.0.0',types:TYPES.slice(),logicalSize:BASE,createScene,validate,grid});
});
