/* Current UI materials for every registered Director preset.
   Preset source, geometry, SVG artwork, masks and complete GSAP timelines remain.
   Derived from AgentEditorial.card/screen/sheet/pill/file; not a scene template. */
(function(){'use strict';
 const P={ink:'#0B0B0F',paper:'#F3F3F5',line:'#DBDBE0',accent:'#D6C2FF',muted:'#777780',white:'#FFFFFF'};
 const colorProps=new Set(['color','background-color','border-color','border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color','text-decoration-color']);
 const tweenProps=new Set(['color','background','backgroundColor','borderColor','borderTopColor','borderBottomColor','fill','stroke','boxShadow','textShadow']);
 const hex=/#[0-9a-f]{8}\b|#[0-9a-f]{6}\b|#[0-9a-f]{4}\b|#[0-9a-f]{3}\b/ig;
 function parts(value){let h=value.slice(1);if(h.length===3||h.length===4)h=[...h].map(c=>c+c).join('');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16),h.slice(6)];}
 function tone(value,role='surface'){
  if(role!=='backdrop'&&Object.values(P).some(c=>c.toLowerCase()===value.slice(0,7).toLowerCase()))return value;
  const [r,g,b,a]=parts(value);const hi=Math.max(r,g,b)/255,lo=Math.min(r,g,b)/255,light=(hi+lo)/2,sat=hi===lo?0:(hi-lo)/(1-Math.abs(2*light-1));
  let c;if(light<.24)c=P.ink;else if(light>.94)c=P.white;else if(sat<.16)c=light>.8?P.paper:light>.64?P.line:P.muted;
  else if(light>.72&&sat<.5)c=P.line;else c=role==='text'?P.ink:P.accent;
  if(value.toUpperCase().startsWith(P.accent))c=P.accent;
  if(role==='text'&&light<.42)c=P.ink;
  if(role==='backdrop')c=light>.7?P.paper:light>.35?P.line:P.ink;
  return c+(a||'');
 }
 function colors(value,role){
  if(typeof value!=='string')return value;
  return value.replace(hex,v=>tone(v,role)).replace(/rgba?\(\s*([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:\s*[,/]\s*([\d.]+))?\s*\)/g,(all,r,g,b,a)=>{
   const h='#'+[r,g,b].map(v=>Math.round(+v).toString(16).padStart(2,'0')).join('');const c=parts(tone(h,role));return a===undefined?'rgb('+c.slice(0,3).join(',')+')':'rgba('+c.slice(0,3).join(',')+','+a+')';
  });
 }
 function vars(v){if(!v||typeof v!=='object')return v;const result={...v};for(const [k,val]of Object.entries(result))if(tweenProps.has(k))result[k]=colors(val,k==='color'?'dynamic-text':'surface');return result;}
 function gsapAdapter(gsap,root){
  const convert=(name,args)=>{const a=[...args];for(const i of (name==='fromTo'?[1,2]:[1]))a[i]=vars(a[i]);return a;};
  return new Proxy(gsap,{get(target,key){if(key==='timeline')return (...args)=>{const tl=target.timeline(...args);for(const method of ['set','to','from','fromTo']){const native=tl[method];tl[method]=function(...items){return native.apply(this,convert(method,items));};}const nativeTime=tl.time;tl.time=function(...items){const result=nativeTime.apply(this,items);if(items.length)contrast(root);return result;};return tl;};
   if(['set','to','from','fromTo'].includes(key))return(...args)=>target[key](...convert(key,args));return typeof target[key]==='function'?target[key].bind(target):target[key];}});
 }
 function adaptRules(sheet){
  for(const rule of [...(sheet?.cssRules||[])]){
   if(rule.cssRules?.length)adaptRules(rule);if(!rule.style)continue;
   // The user's real image/video and SVG brand artwork are content, not chrome.
   const selector=rule.selectorText||'';if(/(?:brand|logo|artwork|photo)/i.test(selector))continue;
   for(const prop of [...rule.style]){
    const old=rule.style.getPropertyValue(prop);let next=old;
    if(colorProps.has(prop)||/^(?:background|background-image|border|box-shadow|text-shadow)$/.test(prop))next=colors(old,prop==='color'?'text':'surface');
    if(next!==old)rule.style.setProperty(prop,next,rule.style.getPropertyPriority(prop));
   }
  }
 }
 function rgb(s){const a=s.match(/[\d.]+/g);return a?[+a[0],+a[1],+a[2],a.length>3?+a[3]:1]:[0,0,0,0];}
 function luminance(s){const c=rgb(s);return (c[0]*.2126+c[1]*.7152+c[2]*.0722)/255;}
 function contrast(root){
  for(const n of root.__uiTextNodes||[])n.removeAttribute('data-ui-contrast');
  for(const n of root.__uiTextNodes||[]){
   const own=getComputedStyle(n);let p=n,bg='rgb(255,255,255)';
   while(p&&p!==root.parentElement){const c=getComputedStyle(p);if(rgb(c.backgroundColor)[3]>.75){bg=c.backgroundColor;break;}p=p.parentElement;}
   const back=luminance(bg),front=luminance(own.color);
   if(back<.25&&front<.38)n.dataset.uiContrast='light';
   else if(back>.75&&front>.64)n.dataset.uiContrast='ink';
  }
  const focus=root.querySelector('.gs-focus'),fill=focus?.querySelector('.gs-tile-color');
  if(fill)focus.querySelectorAll('.gs-tile-copy strong,.gs-tile-copy span').forEach(n=>n.dataset.uiContrast=+getComputedStyle(fill).opacity>.5?'light':'ink');
 }
 function apply(root){
  // Force newly inserted inline sheets to attach before their CSSOM is read.
  void root.offsetWidth;
  root.querySelectorAll('style').forEach(s=>adaptRules(s.sheet));
  if(root.dataset.uiAdapter==='agent-editorial-a')return;
  root.dataset.uiAdapter='agent-editorial-a';
  if(!document.getElementById('director-current-ui-contrast')){const s=document.createElement('style');s.id='director-current-ui-contrast';s.textContent='[data-ui-adapter="agent-editorial-a"] [data-ui-contrast="light"]{color:#FFFFFF!important}[data-ui-adapter="agent-editorial-a"] [data-ui-contrast="ink"]{color:#0B0B0F!important}';document.head.append(s);}
  const counts={scene:0,window:0,paper:0,card:0,glass:0,control:0,heading:0};
  const nodes=[...root.querySelectorAll('*')].filter(n=>n instanceof HTMLElement&&!['STYLE','SCRIPT','IMG','VIDEO','CANVAS'].includes(n.tagName));
  for(const n of nodes){
   const cls=String(n.className),c=getComputedStyle(n),dark=rgb(c.backgroundColor)[3]>.1&&luminance(c.backgroundColor)<.25;
   let role='';
   if(/(?:^|[ -])(?:fx-scene|[\w]+-scene)(?:$| )/.test(cls))role='scene';
   else if(/(?:^|[- ])(?:glass|lens)(?:$|[- ])/.test(cls))role='glass';
   else if(/(?:^|[- ])(?:window|modal|shell|command-palette)(?:$| )/.test(cls))role='window';
   else if(/(?:^|[- ])(?:sheet|paper|document)(?:$| )/.test(cls))role='paper';
   else if(/(?:^|[- ])(?:card|panel|node)(?:$| )/.test(cls)&&c.backgroundColor!=='rgba(0, 0, 0, 0)')role='card';
   else if(/(?:^|[- ])(?:button|badge|pill|search-input)(?:$| )/.test(cls))role='control';
   else if(/(?:^|[- ])(?:title|heading)(?:$| )/.test(cls)||/^H[123]$/.test(n.tagName))role='heading';
   if(!role)continue;n.dataset.uiRole=role;counts[role]++;
   if(role==='scene'){n.style.setProperty('background-color',dark?P.ink:P.white);if(c.backgroundImage!=='none')n.style.setProperty('background-image',colors(c.backgroundImage,'backdrop'));n.style.color=dark?P.white:P.ink;}
   if(role==='window'){n.style.boxShadow='7px 9px 0 '+P.line+',0 12px 25px #00000020';n.style.borderColor=dark?P.ink:P.line;}
   if(role==='paper'){n.style.boxShadow='8px 10px 0 '+P.line+',0 12px 25px #00000020';n.style.borderColor=P.line;}
   if(role==='card'){n.style.boxShadow='6px 8px 0 '+P.line+',0 12px 25px #00000020';n.style.borderColor=dark?P.ink:P.line;}
   if(role==='glass'){n.style.boxShadow='inset 0 1px 1px #FFFFFFB3,0 12px 25px #00000020';n.style.borderColor='#FFFFFF99';}
   if(role==='control'){n.style.fontWeight='700';if(c.boxShadow!=='none')n.style.boxShadow='0 5px 12px #00000015';}
   if(role==='heading'){n.style.fontWeight='800';n.style.letterSpacing='-.02em';}
  }
  // Contrast is assigned per original object. Dark windows retain light text;
  // glyph paths and media remain source-owned, not flattened into cards.
  for(const n of nodes){const c=getComputedStyle(n);if(rgb(c.backgroundColor)[3]>.5&&luminance(c.backgroundColor)<.25){n.dataset.uiDark='true';if(luminance(c.color)<.35)n.style.color=P.white;}}
  root.__uiRoleCounts=counts;
  // Backdrops stay neutral; A-purple identifies a selected control or result.
  for(const n of nodes){if(/(?:^|[- ])(?:bg|wallpaper|desktop-glow|wash)(?:$| )/.test(String(n.className))){const c=getComputedStyle(n);n.style.backgroundImage=c.backgroundImage==='none'?'none':'radial-gradient(ellipse,#FFFFFF,#F3F3F5 70%)';n.style.backgroundColor=P.paper;}}
  for(const n of nodes){if(/(?:^|[- ])scrim(?:$| )/.test(String(n.className))){const a=rgb(getComputedStyle(n).backgroundColor)[3];n.style.backgroundColor='rgba(11,11,15,'+a+')';}}
  // The glass study retains translucent controls, lens distortion and SVGs.
  // Its active tiles use the same ink/accent hierarchy as approved controls.
  root.querySelectorAll('.gs-wifi,.gs-focus .gs-tile-color').forEach(n=>{n.style.backgroundColor=P.ink;n.style.color=P.white;});
  root.querySelectorAll('.gs-torch .gs-tile-color').forEach(n=>n.style.backgroundColor=P.accent);
  root.__uiTextNodes=nodes.filter(n=>!n.children.length&&n.textContent.trim());contrast(root);
 }
 function bindRoot(root){return new Proxy(root,{get(target,key){const v=Reflect.get(target,key,target);return typeof v==='function'?v.bind(target):v;},set(target,key,value){Reflect.set(target,key,value,target);if(key==='innerHTML'){delete target.dataset.uiAdapter;apply(target);}return true;}});}
 window.DirectorCurrentUI={version:1,palette:P,apply,bindRoot,gsap:gsapAdapter,colors};
})();
