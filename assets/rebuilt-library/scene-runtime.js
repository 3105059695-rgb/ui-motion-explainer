/* Independently authored scene graphs. Original references are never executed.
 * The graph preserves per-scene object identity, geometry, timed state changes,
 * masks and camera moves; there is no keyword-to-template fallback. */
(function(global){
 'use strict';
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const kinds=new Map();
 function registerKind(name,draw){if(typeof name!=='string'||typeof draw!=='function'||kinds.has(name))throw Error('Invalid or repeated scene extension '+name);kinds.set(name,draw);}
 const ease=(t,name='smooth')=>{t=clamp(t);if(name==='linear')return t;if(name==='in')return t*t*t;if(name==='out')return 1-(1-t)**4;if(name==='back'){const q=t-1;return 1+2.3*q*q*q+1.3*q*q;}if(name==='spring')return t===1?1:1-Math.exp(-7*t)*Math.cos(t*10);if(name==='step')return t<1?0:1;return t*t*(3-2*t);};
 const mix=(a,b,t)=>typeof a==='number'&&typeof b==='number'?a+(b-a)*t:t<1?a:b;
 function track(keys,t,fallback){if(!keys?.length)return fallback;if(t<=keys[0][0])return keys[0][1];for(let i=1;i<keys.length;i++){if(t<=keys[i][0]){const a=keys[i-1],b=keys[i];return mix(a[1],b[1],ease((t-a[0])/(b[0]-a[0]),b[2]));}}return keys[keys.length-1][1];}
 function bind(value,input){if(typeof value!=='string')return value;return value.replace(/\{\{([\w.-]+)\}\}/g,(_,key)=>{if(!(key in input))throw Error('Unbound scene input: '+key);return String(input[key]);});}
 function bindValues(value,input){if(Array.isArray(value))return value.map(x=>bindValues(x,input));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,bindValues(v,input)]));if(typeof value==='string'){const m=value.match(/^\{\{([\w.-]+)\}\}$/);if(m){if(!(m[1] in input))throw Error('Unbound scene input: '+m[1]);return input[m[1]];}}return value;}
 function state(node,t,input){const s={...node};for(const [key,keys] of Object.entries(node.tracks||{}))s[key]=track(keys,t,node[key]);for(const key of ['text','label','detail','asset'])if(s[key]!==undefined)s[key]=bind(s[key],input);return s;}
 function validate(scene){
  if(!scene||scene.schema!=='ui-motion-fusion/independent-scene@1'||!scene.id||!(scene.duration>0)||!Array.isArray(scene.nodes)||!scene.nodes.length)throw Error('Expected a complete independent scene graph');
  const ids=new Set(),known=new Set(['group','rect','circle','line','arrow','path','text','card','window','file','document','image','pill','bar','toggle','check','code']);
  function walk(nodes){for(const n of nodes){if(!n.id||ids.has(n.id)||(!known.has(n.kind)&&!kinds.has(n.kind)))throw Error('Invalid or duplicate node '+n.id);ids.add(n.id);for(const [key,ks] of Object.entries(n.tracks||{})){if(!Array.isArray(ks)||ks.some((k,i)=>!Array.isArray(k)||!Number.isFinite(k[0])||k[0]<0||k[0]>scene.duration||i>0&&k[0]<=ks[i-1][0]))throw Error('Invalid '+n.id+'.'+key+' timeline');}if(n.children)walk(n.children);}}walk(scene.nodes);
  return {id:scene.id,objects:ids.size,duration:scene.duration,independent_reconstruction:true};
 }
 function create(scene,options={}){
  const input={...(scene.inputs||{}),...(options.inputs||{})},assets=options.assets||{};
  scene={...scene,nodes:bindValues(scene.nodes,input),camera:scene.camera?bindValues(scene.camera,input):undefined};
  const report=validate(scene);
  const palette=global.AgentEditorial.palette;let last=[];
  function draw(ctx,time,width=1920,height=1080){
   const t=clamp(time,0,scene.duration),D=global.AgentEditorial.create(ctx,{logicalWidth:1920,logicalHeight:1080,fontFamily:'Noto, sans-serif'});last=[];
   ctx.save();ctx.scale(width/1920,height/1080);ctx.fillStyle=scene.background||'#FFFFFF';ctx.fillRect(0,0,1920,1080);
   const camera=scene.camera?state(scene.camera,t,input):{};ctx.translate(camera.x||0,camera.y||0);ctx.translate(960,540);ctx.scale(camera.scale||1,camera.scale||1);ctx.translate(-960,-540);
   function node(n){
    const s=state(n,t,input);if(s.visible&&(t<s.visible[0]||t>=s.visible[1]))return;
    if((s.opacity??1)<=0)return;const w=s.w??400,h=s.h??200;ctx.save();ctx.globalAlpha*=clamp(s.opacity??1);ctx.translate(s.x||0,s.y||0);
    if(s.rotation){ctx.translate(w/2,h/2);ctx.rotate(s.rotation*Math.PI/180);ctx.translate(-w/2,-h/2);}
    if(s.scale!==undefined||s.scaleX!==undefined||s.scaleY!==undefined){ctx.translate(w/2,h/2);ctx.scale(s.scaleX??s.scale??1,s.scaleY??s.scale??1);ctx.translate(-w/2,-h/2);}
    if(s.blur>0)ctx.filter='blur('+s.blur+'px)';
    if(s.revealX!==undefined||s.revealY!==undefined){ctx.beginPath();ctx.rect(0,0,w*clamp(s.revealX??1),h*clamp(s.revealY??1));ctx.clip();}
    if(s.clipCircle!==undefined){ctx.beginPath();ctx.arc(w/2,h/2,Math.hypot(w,h)/2*clamp(s.clipCircle),0,Math.PI*2);ctx.clip();}
    if(s.clip){ctx.beginPath();ctx.rect(s.clip.x||0,s.clip.y||0,s.clip.w??w,s.clip.h??h);ctx.clip();}
    const fill=s.fill||'#0B0B0F',ink=s.color||'#0B0B0F',r={x:0,y:0,w,h};
    const line=(a,b,c,d,color=fill,size=s.strokeWidth||5)=>D.line(a,b,c,d,color,size);
    switch(s.kind){
     case 'group':break;
     case 'rect':D.rr(0,0,w,h,s.radius??14,fill,s.stroke||null,s.strokeWidth||2);break;
     case 'circle':ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)/2,0,Math.PI*2);ctx.fillStyle=fill;ctx.fill();break;
     case 'line':line(0,0,w,h);break;
     case 'arrow':D.arrow(0,0,w,h,fill,s.strokeWidth||5);break;
     case 'path':{const path=new Path2D(s.path);ctx.strokeStyle=fill;ctx.lineWidth=s.strokeWidth||5;ctx.lineCap='round';if(s.draw!==undefined){ctx.setLineDash([s.length||1500]);ctx.lineDashOffset=(1-clamp(s.draw))*(s.length||1500);}ctx.stroke(path);break;}
     case 'text':{const words=String(s.text||'').slice(0,s.characters===undefined?undefined:Math.max(0,Math.floor(s.characters)));const lines=words.split('\n');lines.forEach((x,i)=>D.text(x,s.align==='center'?w/2:s.align==='right'?w:0,(s.size||42)*(i*(s.leading||1.3)+.9),s.size||42,ink,s.weight||800,s.align||'left',w));break;}
     case 'card':D.card(r,{fill:s.fill||'#FFFFFF',dark:s.dark,depth:s.depth??7,radius:s.radius??18,shadow:s.shadow??true});break;
     case 'window':{D.card(r,{fill:s.fill||'#FFFFFF',depth:s.depth??7,radius:s.radius??20,shadow:s.shadow??true});D.rr(12,12,w-24,s.headerHeight||56,11,s.headerFill||'#0B0B0F');if(s.label)D.text(s.label,32,49,25,s.headerColor||'#FFFFFF',750,'left',w-65);break;}
     case 'file':D.file(r,s.label||'',{detail:s.detail||'',size:s.size||32,detailSize:s.detailSize||23,shadow:true});break;
     case 'document':D.sheet(r,s.label||'',{lines:s.lines?.map(x=>bind(x,input))||[],size:s.size||34,bodySize:s.bodySize||26,lineHeight:s.lineHeight||45,shadow:true});break;
     case 'image':{const a=assets[s.asset];if(!a)throw Error('Decoded asset missing: '+s.asset);D.image(a,r,{fit:s.fit||'contain',crop:s.crop,radius:s.radius||0});break;}
     case 'pill':D.pill(s.label||'',r,{fill:s.fill||'#0B0B0F',color:s.color||'#FFFFFF',size:s.size||30});break;
     case 'bar':D.progress(r,clamp(s.value??0),{track:s.track||'#DBDBE0',fill:s.fill||'#D6C2FF'});break;
     case 'toggle':{D.rr(0,0,w,h,h/2,s.value>.5?'#0B0B0F':'#DBDBE0');ctx.beginPath();ctx.arc(h/2+clamp(s.value??0)*(w-h),h/2,h*.38,0,Math.PI*2);ctx.fillStyle=s.value>.5?'#D6C2FF':'#FFFFFF';ctx.fill();break;}
     case 'check':{ctx.strokeStyle=s.color||'#D6C2FF';ctx.lineWidth=s.strokeWidth||7;ctx.lineCap='round';ctx.beginPath();const v=clamp(s.value??1);ctx.moveTo(w*.15,h*.52);if(v<.4)ctx.lineTo(w*.15+w*.25*v/.4,h*.52+h*.25*v/.4);else{ctx.lineTo(w*.4,h*.77);ctx.lineTo(w*.4+w*.45*(v-.4)/.6,h*.77-h*.55*(v-.4)/.6);}ctx.stroke();break;}
     case 'code':{D.card(r,{dark:true,depth:6,radius:16});const lines=(s.lines||[]).map(x=>bind(x,input));lines.forEach((v,i)=>D.text(v,24,46+i*(s.lineHeight||38),s.size||25,i===s.active?'#D6C2FF':'#FFFFFF',550,'left',w-48));break;}
     default:kinds.get(s.kind)(ctx,s,t,{D,input,assets,scene,track,clamp,bind});break;
    }
    last.push({id:s.id,kind:s.kind,x:s.x||0,y:s.y||0,w,h,opacity:s.opacity??1,text:s.text||s.label||null,value:s.value});
    for(const child of s.children||[])node(child);ctx.restore();
   }
   for(const n of scene.nodes)node(n);ctx.restore();return {id:scene.id,time:t,objects:last,independent_reconstruction:true};
  }
  return {draw,report,state:()=>last,scene,inputs:input};
 }
 global.RebuiltScene={version:'1.1.0',validate,create,track,ease,registerKind};
})(typeof window==='undefined'?globalThis:window);
