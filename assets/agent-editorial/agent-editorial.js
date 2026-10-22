/* Parameterized Canvas drawing adapted from the user's ten-agents-ranking source.
 * Load motion-core.js first in browsers, or require this module in Node.
 * Geometry, narration cues and materials belong to each new production.
 */
(function (root, factory) {
  const core = typeof module === 'object' && module.exports
    ? require('./motion-core.js') : root.MotionCore;
  const api = factory(core);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AgentEditorial = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (motion) {
  'use strict';
  if (!motion) throw new Error('Load agent-editorial/motion-core.js before agent-editorial.js');
  const palette = Object.freeze({black:'#0B0B0F',white:'#FFFFFF',purple:'#8750FF',muted:'#777780',line:'#DBDBE0',paper:'#F3F3F5'});
  const {clamp, mix} = motion;
  const out = n => 1 - Math.pow(1 - clamp(n), 4);
  const ease = n => { n = clamp(n); return n < .5 ? 8*n*n*n*n : 1-Math.pow(-2*n+2,4)/2; };
  function rect(value) {
    const r = {x:value.x ?? 0, y:value.y ?? 0, w:value.w ?? value.width, h:value.h ?? value.height};
    if (!Object.values(r).every(Number.isFinite) || r.w <= 0 || r.h <= 0) throw new RangeError('Rectangle needs finite x/y and positive w/h');
    return r;
  }
  function rectMix(a,b,p) {
    a={...a,...rect(a)}; b={...b,...rect(b)};
    return {x:mix(a.x,b.x,p),y:mix(a.y,b.y,p),w:mix(a.w,b.w,p),h:mix(a.h,b.h,p),r:mix(a.r||0,b.r||0,p)};
  }
  function intersection(a,b) {
    a=rect(a);b=rect(b);
    const x=Math.max(a.x,b.x),y=Math.max(a.y,b.y),r=Math.min(a.x+a.w,b.x+b.w),d=Math.min(a.y+a.h,b.y+b.h);
    return r>x&&d>y?{x,y,w:r-x,h:d-y}:null;
  }
  function subtractRect(a,b) {
    a=rect(a); const i=intersection(a,b); if(!i)return [a];
    return [
      {x:a.x,y:a.y,w:a.w,h:i.y-a.y},
      {x:a.x,y:i.y+i.h,w:a.w,h:a.y+a.h-i.y-i.h},
      {x:a.x,y:i.y,w:i.x-a.x,h:i.h},
      {x:i.x+i.w,y:i.y,w:a.x+a.w-i.x-i.w,h:i.h}
    ].filter(r=>r.w>0&&r.h>0);
  }
  function safeRegions({stage,regions,protectedRects=[]}) {
    stage=rect(stage);
    if(!Array.isArray(regions)||!Array.isArray(protectedRects))throw new TypeError('Explicit regions and protectedRects arrays required');
    let safe=[];
    for(const region of regions){
      const clipped=intersection(region,stage);if(!clipped)continue;
      let fragments=[clipped];
      for(const blocked of [...protectedRects,...safe]) fragments=fragments.flatMap(r=>subtractRect(r,blocked));
      safe.push(...fragments);
    }
    return safe;
  }
  function safeOverlay(ctx,options,draw) {
    const regions=safeRegions(options);
    if(!regions.length)return {drawn:false,regions};
    ctx.save();
    try{ctx.beginPath();for(const r of regions)ctx.rect(r.x,r.y,r.w,r.h);ctx.clip();draw(ctx,regions);}
    finally{ctx.restore();}
    return {drawn:true,regions};
  }
  function opening(ctx,options,draw) {
    const stage=rect(options.stage),frame=options.frame;
    if(!frame)throw new Error('opening requires the original complete presenter frame');
    const iw=frame.videoWidth||frame.naturalWidth||frame.width,ih=frame.videoHeight||frame.naturalHeight||frame.height;
    if(!(iw>0&&ih>0))throw new Error('Original presenter frame is not ready');
    ctx.save();
    try{
      ctx.fillStyle=options.matte||palette.black;ctx.fillRect(stage.x,stage.y,stage.w,stage.h);
      const k=Math.min(stage.w/iw,stage.h/ih);
      ctx.drawImage(frame,stage.x+(stage.w-iw*k)/2,stage.y+(stage.h-ih*k)/2,iw*k,ih*k);
    }finally{ctx.restore();}
    // Missing measured protection never becomes an unprotected overlay.
    if(!Array.isArray(options.regions)||!options.regions.length||!Array.isArray(options.protectedRects)||!options.protectedRects.length){
      return {drawn:false,regions:[],reason:'measured clear regions and presenter/subtitle protection required'};
    }
    return safeOverlay(ctx,{...options,stage},draw);
  }
  function cue(chapter,id) {
    const c=chapter.cues?.find(c=>c.id===id);
    if(!c||!Number.isFinite(c.start))throw new Error('Missing timed narration cue: '+id);
    return c;
  }
  function phase(t,chapter,id,duration=.55,delay=0) {
    if(!(duration>0))throw new RangeError('Cue duration must be positive');
    return out((t-cue(chapter,id).start-delay)/duration);
  }
  function activeCue(t,chapter) {
    return [...(chapter.cues||[])].filter(c=>Number.isFinite(c.start)&&c.start<=t).sort((a,b)=>a.start-b.start).at(-1)||null;
  }
  function stagger(t,{start=0,index=0,gap=.14,omega=15,damping=.8}={}) {
    return motion.spring(t,{start:start+index*gap,from:0,to:1,omega,damping});
  }
  function layout({base,focus,amount=0}) {
    // Caller supplies the episode's measured body and focus regions.
    return rectMix(base,focus,ease(amount));
  }
  function create(ctx,options={}) {
    if(!ctx)throw new TypeError('Canvas 2D context required');
    const width=options.width||ctx.canvas.width,height=options.height||ctx.canvas.height;
    const logicalWidth=options.logicalWidth||1920,logicalHeight=options.logicalHeight||1080;
    const C=Object.freeze({...palette,...options.palette});
    const font=options.fontFamily||'"Microsoft YaHei", sans-serif';
    function rr(x,y,w,h,r=18,fill=C.white,stroke=null,lw=2) {
      if(!(w>0&&h>0))return;
      ctx.beginPath();ctx.roundRect(x,y,w,h,Math.max(0,Math.min(r,w/2,h/2)));
      if(fill){ctx.fillStyle=fill;ctx.fill();}
      if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}
    }
    function text(s,x,y,size=40,color=C.black,weight=800,align='left',maxWidth) {
      ctx.save();ctx.font=`${weight} ${size}px ${font}`;ctx.textBaseline='alphabetic';ctx.textAlign=align;ctx.fillStyle=color;
      if(maxWidth===undefined)ctx.fillText(String(s),x,y);else ctx.fillText(String(s),x,y,maxWidth);ctx.restore();
    }
    function line(x1,y1,x2,y2,color=C.black,width=3) {
      ctx.save();ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();ctx.restore();
    }
    function arrow(x1,y1,x2,y2,color=C.purple,width=4) {
      line(x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1),head=Math.max(15,width*3.2);
      line(x2,y2,x2-head*Math.cos(a-.55),y2-head*Math.sin(a-.55),color,width);
      line(x2,y2,x2-head*Math.cos(a+.55),y2-head*Math.sin(a+.55),color,width);
    }
    function shadow(draw,{blur=25,offsetY=12,color='#00000020'}={}) {
      ctx.save();ctx.shadowColor=color;ctx.shadowBlur=blur;ctx.shadowOffsetY=offsetY;
      try{draw();}finally{ctx.restore();}
    }
    function card(value,opts={}) {
      const r=rect(value),radius=opts.radius??18,depth=opts.depth??8,fill=opts.fill||(opts.dark?C.black:C.white);
      ctx.save();
      if(opts.shadow!==false)shadow(()=>rr(r.x,r.y,r.w,r.h,radius,fill),{blur:typeof opts.shadow==='number'?opts.shadow:25,offsetY:opts.shadowOffsetY??12,color:opts.shadowColor||'#00000020'});
      if(depth>0)rr(r.x+depth*.8,r.y+depth,r.w,r.h,radius,opts.depthColor||C.line);
      rr(r.x,r.y,r.w,r.h,radius,fill,opts.edge===false?null:opts.edge||(opts.dark?C.black:C.line),opts.lineWidth??2);
      ctx.restore();return r;
    }
    function image(im,value,opts={}) {
      if(!im)throw new Error('Material image missing; do not silently substitute an unrelated image');
      const r=rect(value),iw=im.videoWidth||im.naturalWidth||im.width,ih=im.videoHeight||im.naturalHeight||im.height;
      if(!(iw>0&&ih>0))throw new Error('Material image is not ready');
      let source=opts.crop?rect(opts.crop):{x:0,y:0,w:iw,h:ih};
      source=intersection(source,{x:0,y:0,w:iw,h:ih});
      if(!source)throw new RangeError('Material crop lies outside source');
      const fit=opts.fit||'contain',k=fit==='cover'?Math.max(r.w/source.w,r.h/source.h):Math.min(r.w/source.w,r.h/source.h);
      ctx.save();try{ctx.beginPath();ctx.roundRect(r.x,r.y,r.w,r.h,opts.radius??12);ctx.clip();ctx.drawImage(im,source.x,source.y,source.w,source.h,r.x+(r.w-source.w*k)/2,r.y+(r.h-source.h*k)/2,source.w*k,source.h*k);}finally{ctx.restore();}
    }
    function pill(s,value,opts={}) {
      const r=rect(value),size=opts.size??30;
      rr(r.x,r.y,r.w,r.h,opts.radius??r.h*.28,opts.fill||C.black);
      text(s,r.x+r.w/2,r.y+r.h/2+size*.35,size,opts.color||C.white,opts.weight??800,'center',r.w-(opts.padding??24));
    }
    function check(x,y,r=22,opts={}) {
      ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=opts.fill||C.purple;ctx.fill();ctx.restore();
      line(x-r*.43,y,x-r*.08,y+r*.32,opts.color||C.white,opts.width??4);
      line(x-r*.08,y+r*.32,x+r*.5,y-r*.35,opts.color||C.white,opts.width??4);
    }
    function progress(value,amount,opts={}) {
      const r=rect(value),radius=opts.radius??r.h/2;
      rr(r.x,r.y,r.w,r.h,radius,opts.track||C.line);
      rr(r.x,r.y,r.w*clamp(amount),r.h,radius,opts.fill||C.purple);
    }
    function sheet(value,title,opts={}) {
      const r=rect(value),pad=opts.padding??25,ink=opts.dark?C.white:C.black;
      card(r,{depth:10,radius:12,...opts});rr(r.x+pad,r.y+24,48,7,3,C.purple);
      text(title,r.x+pad,r.y+80,opts.size??32,opts.color||ink,800,'left',r.w-2*pad);
      (opts.lines||[]).forEach((s,i)=>text(s,r.x+pad,r.y+135+i*(opts.lineHeight||38),opts.bodySize||25,opts.bodyColor||ink,550,'left',r.w-2*pad));
    }
    function screen(value,title,opts={}) {
      const r=rect(value),header=opts.headerHeight??49;
      card(r,{depth:9,radius:18,edge:C.black,lineWidth:3,...opts});line(r.x,r.y+header,r.x+r.w,r.y+header,opts.headerLine||C.black,2);
      for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(r.x+24+i*18,r.y+header/2,5,0,Math.PI*2);ctx.fillStyle=i?C.line:C.black;ctx.fill();}
      text(title,r.x+67,r.y+header*.67,opts.titleSize||22,opts.titleColor||C.black,700,'left',r.w-90);
      return {x:r.x+12,y:r.y+header+12,w:r.w-24,h:r.h-header-24};
    }
    function file(value,title,opts={}) {
      const r=rect(value),pad=opts.padding??24;
      card(r,{depth:8,radius:16,...opts});
      if(opts.fold!==false){ctx.save();ctx.beginPath();ctx.moveTo(r.x+r.w-43,r.y);ctx.lineTo(r.x+r.w-43,r.y+43);ctx.lineTo(r.x+r.w,r.y+43);ctx.closePath();ctx.fillStyle=C.paper;ctx.fill();ctx.restore();}
      rr(r.x+16,r.y+18,7,r.h-36,3,opts.accent||C.purple);
      text(title,r.x+pad+18,r.y+r.h*.5,opts.size||27,opts.color||C.black,800,'left',r.w-pad*2-20);
      if(opts.detail)text(opts.detail,r.x+pad+18,r.y+r.h*.72,opts.detailSize||20,C.muted,550,'left',r.w-pad*2-20);
    }
    function frame(draw) {
      ctx.save();ctx.scale(width/logicalWidth,height/logicalHeight);
      try{return draw(api);}finally{ctx.restore();}
    }
    function withRect(value,draw) {
      const r=rect(value);ctx.save();ctx.translate(r.x,r.y);ctx.scale(r.w,r.h);
      try{return draw(api);}finally{ctx.restore();}
    }
    function place(value,draw,opts={}) {
      const r=rect(value);ctx.save();ctx.globalAlpha*=clamp(opts.opacity??1);ctx.translate(r.x+r.w/2,r.y+r.h/2);ctx.rotate(opts.rotation??value.r??0);ctx.scale(opts.scale??1,opts.scale??1);ctx.translate(-r.w/2,-r.h/2);
      try{return draw(api,{x:0,y:0,w:r.w,h:r.h});}finally{ctx.restore();}
    }
    const api={ctx,C,width,height,logicalWidth,logicalHeight,rr,text,line,arrow,shadow,card,image,pill,check,progress,sheet,screen,file,frame,withRect,place,
      safeOverlay:(opts,draw)=>safeOverlay(ctx,opts,()=>draw(api)),
      opening:(opts,draw)=>opening(ctx,opts,()=>draw(api))};
    return Object.freeze(api);
  }
  return Object.freeze({version:'1.0.0',palette,motion,clamp,mix,out,ease,rectMix,intersection,subtractRect,safeRegions,safeOverlay,opening,cue,phase,activeCue,stagger,layout,create});
});
