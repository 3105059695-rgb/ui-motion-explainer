/* Reusable deterministic motion: deterministic motion adapted from existing library source.
 * NO palette/layout policy is built in. Source paths identify independent local
 * reconstructions, not the original reference creators' implementation.
 */
(function (root) {
  'use strict';
  const clamp = (v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const mix = (a,b,p)=>a+(b-a)*p;
  const smooth = p=>{p=clamp(p);return p*p*(3-2*p);};
  const progress = (t,start=0,duration=1)=>clamp((t-start)/Math.max(.001,duration));
  const ease = (t,start,duration)=>smooth(progress(t,start,duration));

  // assets/modules/reference/assets/templates/ui-morph/motion.js:
  // springStep and per-edge spring schedules. Time is seconds, not frames.
  function springStep(dt,omega=26,damping=.84) {
    if(dt<=0)return 0;
    if(dt>=.7)return 1;
    const wd=omega*Math.sqrt(1-damping*damping);
    return 1-Math.exp(-damping*omega*dt)*(Math.cos(wd*dt)+damping*omega/wd*Math.sin(wd*dt));
  }
  function springMorph(t,from,to,opts={}) {
    const dt=(t-(opts.start||0))/(opts.speed||1), damping=opts.damping||.87;
    const left=mix(from.x,to.x,springStep(dt,23,damping));
    const top=mix(from.y,to.y,springStep(dt,25,damping));
    const right=mix(from.x+from.width,to.x+to.width,springStep(dt,27,damping));
    const bottom=mix(from.y+from.height,to.y+to.height,springStep(dt,27,damping));
    return {x:left,y:top,width:Math.max(1,right-left),height:Math.max(1,bottom-top),
      radius:mix(from.radius||0,to.radius||0,springStep(dt,26,.88)),
      progress:springStep(dt,26,.87)};
  }

  // prompt-motion-replica/assets/reconstructions/brainextends-e19ac3/motion.js:
  // daily(): staggered cover rows spread; four(): covers fold into selected hero.
  // Adapted to book rectangles. Chosen index remains the SAME object on screen.
  function bookFan(t,index,count=5,opts={}) {
    const enter=springStep((t-(opts.start||0)-index*.055)/1.25,24,.73);
    const spread=springStep((t-(opts.start||0)-.16)/1.5,22,.77);
    const select=springStep((t-(opts.selectAt===undefined?Infinity:opts.selectAt))/1.45,23,.78);
    const selected=opts.selected===undefined?Math.floor(count/2):opts.selected;
    const centerX=opts.x===undefined?960:opts.x, centerY=opts.y===undefined?540:opts.y;
    const d=index-(count-1)/2, step=opts.spacing||225;
    const isSelected=index===selected;
    const x=mix(centerX,centerX+d*step,spread);
    const y=centerY+Math.abs(d)*14*(1-select)+75*(1-enter);
    return {x:mix(x,centerX,select),y:mix(y,centerY,select),
      scale:mix(.86,1,enter)*(isSelected?mix(1,1.28,select):mix(1,.7,select)),
      rotate:d*mix(15,-2,spread)*(1-select),tilt:6*(1-spread),
      opacity:enter*(isSelected?1:1-select),zIndex:isSelected?20:index};
  }

  // assets/modules/reference/assets/motion-core.js: cameraAnchorZoom.
  // Point on content stays anchored to screen while camera moves; no random pans.
  function cameraFocus(t,opts={}) {
    const from=opts.fromScale===undefined?1:opts.fromScale,to=opts.toScale||1.8;
    const p=springStep((t-(opts.start||0))/(opts.duration||1),18,.92);
    const anchor=opts.anchor||{x:960,y:540},screen=opts.screen||anchor;
    const initial=opts.fromTranslation||{x:0,y:0};
    const scale=mix(from,to,p),x=mix(initial.x,screen.x-anchor.x*to,p),y=mix(initial.y,screen.y-anchor.y*to,p);
    return {scale,x,y,progress:p,transform:`translate(${x}px,${y}px) scale(${scale})`};
  }

  // assets/editing-kit/editing-kit.js: resultPullback.
  // Opens on the actual result, then pulls back to surrounding context.
  function resultPullback(t,focus,opts={}) {
    const W=opts.width||1920,H=opts.height||1080,margin=opts.margin||0;
    const p=ease(t,opts.start||0,opts.duration||.7);
    const first=Math.min((W-margin*2)/focus.width,(H-margin*2)/focus.height);
    const scale=mix(first,1,p),x=mix(W/2-(focus.x+focus.width/2)*first,0,p),y=mix(H/2-(focus.y+focus.height/2)*first,0,p);
    return {scale,x,y,progress:p,transform:`translate(${x}px,${y}px) scale(${scale})`};
  }

  // assets/editing-kit/editing-kit.js: matchHandoff + occlusionReveal.
  // Highlight excerpt becomes export card: matching content persists through arc.
  function excerptTransfer(t,from,to,opts={}) {
    const p=ease(t,opts.start||0,opts.duration||.7);
    const r={};for(const k of ['x','y','width','height','radius'])r[k]=mix(from[k]||0,to[k]||0,p);
    r.y-=Math.sin(Math.PI*p)*(opts.arcHeight||90);
    r.progress=p;r.sourceOpacity=1-smooth(p/.58);r.resultOpacity=smooth((p-.48)/.5);
    return r;
  }
  function reveal(t,opts={}) {
    const p=ease(t,opts.start||0,opts.duration||.45),vertical=opts.axis==='y';
    return {progress:p,clipPath:vertical?`inset(0 0 ${(1-p)*100}% 0)`:`inset(0 ${(1-p)*100}% 0 0)`,
      coverPosition:p*(vertical?(opts.height||1080):(opts.width||1920))};
  }
  function textReveal(t,index=0,opts={}) {
    const p=ease(t,(opts.start||0)+index*(opts.stagger||.07),opts.duration||.42);
    return {opacity:clamp(p*3),y:(opts.travel||80)*(1-p),progress:p};
  }
  function applyRect(el,r) {
    Object.assign(el.style,{position:'absolute',left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px'});
    if(r.radius!==undefined)el.style.borderRadius=r.radius+'px';
  }
  function applyCamera(el,state){el.style.transformOrigin='0 0';el.style.transform=state.transform;}
  function applyBook(el,state) {
    el.style.opacity=state.opacity;el.style.zIndex=state.zIndex;
    el.style.transform=`translate(${state.x}px,${state.y}px) translate(-50%,-50%) rotate(${state.rotate}deg) skewY(${state.tilt*.04}deg) scale(${state.scale})`;
  }
  const api={clamp,mix,smooth,progress,ease,springStep,springMorph,bookFan,cameraFocus,resultPullback,excerptTransfer,reveal,textReveal,applyRect,applyCamera,applyBook};
  root.LibraryMotion=Object.freeze(api);
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
