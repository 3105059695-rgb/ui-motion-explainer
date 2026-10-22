/* UIEditingKit 1.0.0 — deterministic DOM effects, no media transport, no dependencies. */
(function (global) {
  'use strict';
  const originals = new WeakMap();
  const names = Object.freeze(['focus-mask', 'occlusion-reveal', 'match-handoff', 'compare', 'causal-chain', 'result-pullback', 'viewport-focus', 'comparison-reflow', 'chapter-dock']);
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const mix = (a, b, p) => a + (b - a) * p;
  const smooth = (p) => p * p * (3 - 2 * p);
  const phase = (p, a, b) => smooth(clamp((p - a) / (b - a)));
  function finite(value, name) {
    if (!Number.isFinite(value)) throw new TypeError(name + ' must be finite');
    return value;
  }
  function rect(value, name) {
    if (!value) throw new TypeError(name + ' is required');
    for (const key of ['x', 'y', 'width', 'height']) finite(value[key], name + '.' + key);
    if (value.width <= 0 || value.height <= 0) throw new RangeError(name + ' must have positive dimensions');
    return value;
  }
  function viewport(value) {
    if (!value || !(value.width > 0 && value.height > 0)) throw new RangeError('viewport dimensions must be positive');
    finite(value.width, 'viewport.width'); finite(value.height, 'viewport.height');
    return value;
  }
  function styles(element, values) {
    if (!element || !element.style) throw new TypeError('A DOM element with .style is required');
    let saved = originals.get(element);
    if (!saved) { saved = new Map(); originals.set(element, saved); }
    for (const [key, value] of Object.entries(values)) {
      const property = key.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
      if (!saved.has(property)) saved.set(property, [element.style.getPropertyValue(property), element.style.getPropertyPriority(property)]);
      element.style.setProperty(property, String(value));
    }
  }
  function opacity(el, value) { if (el) styles(el, {opacity: clamp(value)}); }
  function box(el, r) {
    styles(el, {position:'absolute', left:r.x+'px', top:r.y+'px', width:r.width+'px', height:r.height+'px'});
  }
  function interpolateBox(a, b, p) {
    return {x:mix(a.x,b.x,p), y:mix(a.y,b.y,p), width:mix(a.width,b.width,p), height:mix(a.height,b.height,p)};
  }
  function setTheme(root, theme) {
    const keys = ['background','surface','ink','muted','accent','border','fontFamily','radius'];
    if (!theme) throw new TypeError('Pass a project theme; no account style is built in');
    for (const key of keys) {
      if (theme[key] === undefined || theme[key] === '') throw new TypeError('theme.' + key + ' is required');
    }
    const values = {};
    for (const key of keys) {
      const cssKey = key === 'fontFamily' ? 'font' : key;
      values['--uek-' + cssKey] = key === 'radius' && typeof theme[key] === 'number' ? finite(theme[key], 'radius')+'px' : theme[key];
    }
    values['--uek-shade'] = theme.shade || 'rgba(0, 0, 0, .60)';
    values['--uek-shadow'] = theme.shadow || '0 16px 48px rgba(0, 0, 0, .16)';
    styles(root, values);
  }
  function reset(element) {
    const saved = originals.get(element);
    if (!saved) return;
    for (const [key, [value, priority]] of saved) {
      if (value) element.style.setProperty(key, value, priority);
      else element.style.removeProperty(key);
    }
    originals.delete(element);
  }
  function focusMask(o, p) {
    const v=viewport(o.viewport), f=rect(o.focus,'focus'), q=smooth(p);
    if (f.x<0 || f.y<0 || f.x+f.width>v.width || f.y+f.height>v.height) throw new RangeError('focus must remain inside viewport');
    if (!o.shades || o.shades.length!==4) throw new TypeError('focus-mask needs four shades: top, right, bottom, left');
    const shades=[{x:0,y:0,width:v.width,height:f.y},{x:f.x+f.width,y:f.y,width:v.width-f.x-f.width,height:f.height},{x:0,y:f.y+f.height,width:v.width,height:v.height-f.y-f.height},{x:0,y:f.y,width:f.x,height:f.height}];
    o.shades.forEach((el,i)=>{box(el,shades[i]);styles(el,{opacity:q,background:'var(--uek-shade)',pointerEvents:'none'});});
    if(o.outline){box(o.outline,f);styles(o.outline,{opacity:q,border:'2px solid var(--uek-accent)',borderRadius:'var(--uek-radius)',pointerEvents:'none'});}
    if(o.loupe){
      const target=rect(o.loupeTo,'loupeTo'), position=interpolateBox(f,target,q);
      box(o.loupe,position);styles(o.loupe,{opacity:q,overflow:'hidden',borderRadius:'var(--uek-radius)',boxShadow:'var(--uek-shadow)',pointerEvents:'none'});
      if(!o.loupeContent)throw new TypeError('loupeContent is required with loupe; supply a caller-owned duplicate or screenshot');
      const scale=Math.min(position.width/f.width,position.height/f.height);
      styles(o.loupeContent,{position:'absolute',left:'0px',top:'0px',width:v.width+'px',height:v.height+'px',transformOrigin:'0 0',transform:`translate(${-f.x*scale}px, ${-f.y*scale}px) scale(${scale})`});
    }
    return {progress:p,focus:f};
  }
  function occlusionReveal(o,p){
    const v=viewport(o.viewport),q=smooth(p),vertical=o.axis==='y',size=vertical?v.height:v.width;
    const band=o.bandSize===undefined?100:finite(o.bandSize,'bandSize');
    if(band<=0)throw new RangeError('bandSize must be positive');
    styles(o.next,{opacity:1,clipPath:vertical?`inset(0 0 ${(1-q)*100}% 0)`:`inset(0 ${(1-q)*100}% 0 0)`});
    opacity(o.previous,1);
    box(o.cover,vertical?{x:0,y:q*size-band/2,width:v.width,height:band}:{x:q*size-band/2,y:0,width:band,height:v.height});
    styles(o.cover,{opacity:p>0&&p<1?1:0,pointerEvents:'none'});
    return {progress:p,reveal:q};
  }
  function matchHandoff(o,p){
    const from=rect(o.from,'from'),to=rect(o.to,'to'),q=smooth(p),r=interpolateBox(from,to,q);
    const arc=o.arcHeight===undefined?0:finite(o.arcHeight,'arcHeight');
    r.y-=Math.sin(Math.PI*q)*arc;
    box(o.object,r);styles(o.object,{opacity:1,transform:'none',borderRadius:'var(--uek-radius)'});
    opacity(o.sourceContext,1-phase(p,.08,.58));opacity(o.targetContext,phase(p,.32,.82));
    opacity(o.sourceMarker,1-q);opacity(o.targetMarker,q);
    return {progress:p,rect:r};
  }
  function compare(o,p){
    const v=viewport(o.viewport),vertical=o.axis==='y';
    opacity(o.before,1);styles(o.after,{opacity:1,clipPath:vertical?`inset(0 0 ${(1-p)*100}% 0)`:`inset(0 ${(1-p)*100}% 0 0)`});
    if(o.divider){
      styles(o.divider,{position:'absolute',left:vertical?'0px':(v.width*p)+'px',top:vertical?(v.height*p)+'px':'0px',width:vertical?v.width+'px':'2px',height:vertical?'2px':v.height+'px',background:'var(--uek-accent)',opacity:p>0&&p<1?1:0,pointerEvents:'none'});
    }
    for(const item of o.regions||[]){
      const r=rect(item.rect,'region.rect');box(item.element,r);
      const visible=clamp(((vertical?v.height:v.width)*p-(vertical?r.y:r.x))/(vertical?r.height:r.width));
      styles(item.element,{opacity:visible,clipPath:vertical?`inset(0 0 ${(1-visible)*100}% 0)`:`inset(0 ${(1-visible)*100}% 0 0)`,border:'2px solid var(--uek-accent)',borderRadius:'var(--uek-radius)',pointerEvents:'none'});
    }
    return {progress:p,reveal:p};
  }
  function causalChain(o,p){
    if(!Array.isArray(o.items)||!o.items.length)throw new TypeError('causal-chain needs persistent items');
    const gate=o.gate===undefined?.54:finite(o.gate,'gate');
    if(gate<=0||gate>=1)throw new RangeError('gate must be between 0 and 1');
    for(const item of o.items){
      const from=rect(item.from,'item.from'),via=rect(item.via,'item.via'),to=rect(item.to,'item.to');
      const start=item.start===undefined?0:finite(item.start,'item.start');
      const end=item.end===undefined?1:finite(item.end,'item.end');
      if(!(start>=0&&start<gate&&gate<end&&end<=1))throw new RangeError('item timing must satisfy 0 <= start < gate < end <= 1');
      const a=phase(p,start,Math.max(start+.001,Math.min(gate,end)));
      const b=phase(p,Math.max(gate,start),Math.max(Math.max(gate,start)+.001,end));
      const position=p<=gate?interpolateBox(from,via,a):interpolateBox(via,to,b);
      box(item.element,position);styles(item.element,{opacity:1,transform:'none'});
    }
    opacity(o.inputLabel,1);opacity(o.actionLabel,phase(p,.05,.25));opacity(o.resultLabel,phase(p,gate,.94));
    opacity(o.condition,phase(p,Math.max(0,gate-.16),gate));
    opacity(o.result,phase(p,Math.min(.97,gate+.08),1));
    if(o.connector)styles(o.connector,{opacity:1,strokeDasharray:'1',strokeDashoffset:1-smooth(p)});
    return {progress:p,gateOpen:p>=gate,phase:p<gate?'input-to-action':'action-to-result'};
  }
  function resultPullback(o,p){
    const v=viewport(o.viewport),f=rect(o.focus,'focus'),q=smooth(p);
    const margin=o.margin===undefined?0:finite(o.margin,'margin');
    if(margin<0||margin*2>=Math.min(v.width,v.height))throw new RangeError('margin is outside viewport');
    const start=Math.min((v.width-margin*2)/f.width,(v.height-margin*2)/f.height);
    const s=mix(start,1,q),tx=mix(v.width/2-(f.x+f.width/2)*start,0,q),ty=mix(v.height/2-(f.y+f.height/2)*start,0,q);
    styles(o.world,{transformOrigin:'0 0',transform:`translate(${tx}px, ${ty}px) scale(${s})`,opacity:1});
    opacity(o.contextLabel,phase(p,.45,.95));
    if(o.focusOutline){box(o.focusOutline,f);styles(o.focusOutline,{opacity:1-q,border:'2px solid var(--uek-accent)',borderRadius:'var(--uek-radius)'});}
    return {progress:p,scale:s,x:tx,y:ty};
  }
  function node(value, name) {
    if (!value || !value.style || typeof value.style.setProperty !== 'function') throw new TypeError(name + ' must be a DOM element with .style');
    return value;
  }
  function timing(value, name) {
    if (!Array.isArray(value) || value.length !== 2) throw new TypeError(name + ' must be [start,end]');
    const a=finite(value[0],name+'.start'),b=finite(value[1],name+'.end');
    if (!(0<=a && a<b && b<=1)) throw new RangeError(name + ' must satisfy 0 <= start < end <= 1');
    return value;
  }
  function camera(view, size) {
    const scale=Math.min(size.width/view.width,size.height/view.height);
    return {scale,x:(size.width-view.width*scale)/2-view.x*scale,y:(size.height-view.height*scale)/2-view.y*scale};
  }
  function viewportFocus(o,p) {
    const frame=node(o.frame,'frame'),content=node(o.content,'content'),frameRect=rect(o.frameRect,'frameRect');
    const size=viewport(o.contentSize),from=rect(o.from,'from'),to=rect(o.to,'to');
    const focus=timing(o.timing&&o.timing.focus,'timing.focus');
    const back=o.timing.return===undefined?null:timing(o.timing.return,'timing.return');
    if(frame===content || (typeof frame.contains==='function'&&!frame.contains(content))) throw new RangeError('content must be a distinct descendant of frame');
    if(back&&back[0]<focus[1]) throw new RangeError('timing.return must start after timing.focus ends');
    for(const [name,view] of [['from',from],['to',to]]) {
      if(view.x<0||view.y<0||view.x+view.width>size.width||view.y+view.height>size.height) throw new RangeError(name+' must remain inside contentSize');
    }
    const q=phase(p,focus[0],focus[1])*(back?1-phase(p,back[0],back[1]):1);
    const a=camera(from,frameRect),b=camera(to,frameRect);
    const scale=mix(a.scale,b.scale,q),x=mix(a.x,b.x,q),y=mix(a.y,b.y,q);
    box(frame,frameRect);styles(frame,{overflow:'hidden'});
    box(content,{x:0,y:0,width:size.width,height:size.height});
    styles(content,{transformOrigin:'0 0',transform:`translate(${x}px, ${y}px) scale(${scale})`});
    return {progress:p,focusProgress:q,scale,x,y,frame:frameRect};
  }
  function comparisonReflow(o,p) {
    const previous=node(o.previous,'previous'),next=node(o.next,'next');
    const previousFrom=rect(o.previousFrom,'previousFrom'),previousTo=rect(o.previousTo,'previousTo');
    const nextFrom=rect(o.nextFrom,'nextFrom'),nextTo=rect(o.nextTo,'nextTo');
    const oldTime=timing(o.timing&&o.timing.previous,'timing.previous'),newTime=timing(o.timing&&o.timing.next,'timing.next');
    if(previous===next) throw new RangeError('comparison-reflow needs two distinct persistent nodes');
    const oldProgress=phase(p,oldTime[0],oldTime[1]),newProgress=phase(p,newTime[0],newTime[1]);
    const previousRect=interpolateBox(previousFrom,previousTo,oldProgress),nextRect=interpolateBox(nextFrom,nextTo,newProgress);
    box(previous,previousRect);styles(previous,{opacity:1,transform:'none'});
    box(next,nextRect);styles(next,{opacity:newProgress,transform:'none'});
    return {progress:p,previousProgress:oldProgress,nextProgress:newProgress,previousRect,nextRect};
  }
  function chapterDock(o,p) {
    const title=node(o.title,'title'),content=node(o.content,'content'),from=rect(o.from,'from'),to=rect(o.to,'to');
    const titleTime=timing(o.timing&&o.timing.title,'timing.title'),contentTime=timing(o.timing&&o.timing.content,'timing.content');
    const reveal=o.reveal===undefined?'fade':o.reveal;
    if(title===content) throw new RangeError('title and content must be distinct persistent nodes');
    if(!['fade','x','y'].includes(reveal)) throw new RangeError('reveal must be fade, x, or y');
    const titleProgress=phase(p,titleTime[0],titleTime[1]),contentProgress=phase(p,contentTime[0],contentTime[1]);
    const targetScale=Math.min(to.width/from.width,to.height/from.height),scale=mix(1,targetScale,titleProgress);
    const target={x:to.x+(to.width-from.width*targetScale)/2,y:to.y+(to.height-from.height*targetScale)/2,width:from.width*targetScale,height:from.height*targetScale};
    const position=interpolateBox(from,target,titleProgress);
    box(title,{x:position.x,y:position.y,width:from.width,height:from.height});
    styles(title,{opacity:1,transformOrigin:'0 0',transform:`scale(${scale})`});
    styles(content,{opacity:reveal==='fade'?contentProgress:1,clipPath:reveal==='fade'?'none':reveal==='x'?`inset(0 ${(1-contentProgress)*100}% 0 0)`:`inset(0 0 ${(1-contentProgress)*100}% 0)`});
    return {progress:p,titleProgress,contentProgress,scale,rect:position};
  }
  const effects={'focus-mask':focusMask,'occlusion-reveal':occlusionReveal,'match-handoff':matchHandoff,compare,'causal-chain':causalChain,'result-pullback':resultPullback,'viewport-focus':viewportFocus,'comparison-reflow':comparisonReflow,'chapter-dock':chapterDock};
  function apply(name,options,progress){
    if(!effects[name])throw new RangeError('Unknown effect '+name);
    if(!options)throw new TypeError('Effect options are required');
    const p=clamp(finite(progress,'progress'));
    return effects[name](options,p);
  }
  global.UIEditingKit=Object.freeze({version:'1.0.0',names,apply,setTheme,reset,clamp,phase});
})(typeof window!=='undefined'?window:globalThis);
