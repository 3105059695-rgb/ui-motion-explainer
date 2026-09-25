/* Deterministic timing; renderer keeps live video and captions on the master frame. */
const $=s=>document.querySelector(s), all=s=>[...document.querySelectorAll(s)];
const clamp=x=>Math.max(0,Math.min(1,x)), range=(t,a,b)=>clamp((t-a)/(b-a));
const smooth=x=>x*x*x*(x*(x*6-15)+10), out=x=>1-(1-x)**4, mix=(a,b,q)=>a+(b-a)*q;
const style=(s,v)=>Object.assign($(s).style,v);
let config, mediaVideos=[],albumBox;
function move(s,x,y,scale=1,rotation=0,opacity=1){style(s,{transform:`translate(${x}px,${y}px) scale(${scale}) rotate(${rotation}deg)`,opacity});}
function fly(id,t,a,b,x1,y1,x2,y2,tilt=10){const q=smooth(range(t,a,b)),v=out(range(t,a,a+.12))*(1-smooth(range(t,b-.16,b)));move(id,mix(x1,x2,q),mix(y1,y2,q)-Math.sin(q*Math.PI)*85,mix(1,.53,q),tilt*Math.sin(q*Math.PI),v);}
function createMedia(mount,src){const video=/\.(mp4|webm|mov)(?:\?|$)/i.test(src);const el=document.createElement(video?'video':'img');el.src=src;if(video){el.muted=true;el.playsInline=true;el.preload='auto';mediaVideos.push(el);}mount.prepend(el);}
function presenterCircle(q){
 const c=config.circle,crop=config.presenterCrop||{x:420,y:0,size:1080};
 const box={x:mix(0,c.x,q),y:mix(0,c.y,q),w:mix(1920,c.size,q),h:mix(1080,c.size,q)};
 style('#presenter',{left:box.x+'px',top:box.y+'px',width:box.w+'px',height:box.h+'px',borderRadius:mix(0,c.size/2,q)+'px'});
 const scale=mix(1,c.size/crop.size,q);
 if(config.presenter)style('#person-video',{position:'absolute',width:1920*scale+'px',height:1080*scale+'px',maxWidth:'none',left:-crop.x*q*scale+'px',top:-crop.y*q*scale+'px',objectFit:'fill'});
 else style('#person-placeholder',{transformOrigin:'0 0',transform:`translate(${-crop.x*q*scale}px,${-crop.y*q*scale}px) scale(${scale})`});
}
async function seek(video,time){if(!video.src||!Number.isFinite(video.duration))return;const want=Math.max(0,Math.min(video.duration-.045,time));if(Math.abs(video.currentTime-want)<.002)return;await new Promise((resolve,reject)=>{const done=()=>{clearTimeout(timer);video.removeEventListener('seeked',done);resolve();};const timer=setTimeout(()=>{video.removeEventListener('seeked',done);reject(new Error('Media seek timeout'));},6000);video.addEventListener('seeked',done);video.currentTime=want;});}
window.ready=async()=>{
 config=await fetch('project.json').then(r=>r.json());
 $('#product-title').textContent=config.product;$('#intro-label h1').textContent=config.title;$('#result-label').textContent=config.result;
 all('header em').forEach(el=>{el.textContent='';for(let n=0;n<3;n++)el.append(document.createElement('i'));});
 if(!config.demo)$('#demo-label').textContent='界面示意';
 if(config.logo){$('.brand-mark').textContent='';const logo=document.createElement('img');logo.src=config.logo;logo.style.cssText='width:100%;height:100%;object-fit:contain';$('.brand-mark').append(logo);}
 all('[data-media]').forEach(m=>createMedia(m,config.media[+m.dataset.media]||config.media[0]||'art/reference.svg'));
 if(config.presenter){$('#person-placeholder').style.display='none';const video=$('#person-video');video.src=config.presenter;video.style.display='block';mediaVideos.push(video);}
 const rect=config.safeRight;style('#workspace',{left:rect.x+'px',top:rect.y+105+'px',width:rect.width+'px'});style('#intro-label',{left:rect.x+'px',top:rect.y-28+'px',width:rect.width+'px'});style('#result-label',{left:rect.x+35+'px',top:rect.y+660+'px'});
 await document.fonts.ready;
 const target=$('#album-target').getBoundingClientRect();albumBox={x:target.x,y:target.y,w:target.width,h:target.height};
 await Promise.all(all('img').map(im=>im.decode()));
 await Promise.all(mediaVideos.map(v=>v.readyState>=2?Promise.resolve():new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Media load timeout: '+v.getAttribute('src'))),15000);v.addEventListener('loadeddata',()=>{clearTimeout(timer);resolve();},{once:true});v.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Media could not load'));},{once:true});})));
 const size=()=>{const s=Math.min(innerWidth/1920,innerHeight/1080);$('#stage').style.transform=`scale(${s})`;};size();addEventListener('resize',size);
 await window.render(0,0);
};
window.render=async(t,masterTime=t)=>{
 const u=t/config.duration*10,mt=masterTime/config.duration*10,mode=config.mode;
 for(const id of ['#desktop-bg','#menu','#comparison','#album','#dock','#workspace','#intro-label','#result-label','#cursor','#click-ring','#file-a','#file-b','#file-c'])style(id,{opacity:0});
 style('#presenter',{opacity:0});style('#body-view',{display:'none'});style('#input-view',{display:'block'});style('#edit-view',{display:'flex'});
 const typed=Array.from(config.command);$('#typed').textContent=typed.slice(0,Math.floor(range(u,1.3,3.3)*typed.length)).join('');
 const enter=out(range(u,0,.95)),edit=smooth(range(u,3.5,4.3)),reveal=smooth(range(u,6.1,7));
 style('#workspace',{opacity:1,transform:`perspective(1600px) translateY(${(1-enter)*70}px) rotateY(${(1-enter)*-15}deg) scale(${.86+.14*enter})`});
 style('#input-view',{transform:`translateY(${-edit*125}px)`,opacity:1});style('#edit-view',{clipPath:`inset(0 ${(1-edit)*100}% 0 0 round 16px)`});
 style('#reveal',{clipPath:`inset(0 ${(1-reveal)*100}% 0 0)`});style('#wipe-line',{left:reveal*100+'%',opacity:reveal>0&&reveal<1?1:0});
 style('#own-row',{opacity:out(range(u,5.5,6.4))});style('#text-row',{opacity:out(range(u,6,6.8))});style('#playhead',{left:(4+range(u,4,9.8)*90)+'%'});
 if(mode==='hero'){
  style('#presenter',{opacity:1});move('#intro-label',0,(1-enter)*18,1,0,enter);style('#result-label',{opacity:out(range(u,7.3,8))});
  fly('#file-a',u,3.62,4.55,config.safeRight.x+470,180,config.safeRight.x+280,460,-12);
  fly('#file-b',u,5.57,6.56,config.safeRight.x+425,210,config.safeRight.x+340,445,10);
  fly('#file-c',u,5.86,6.83,config.safeRight.x+525,290,config.safeRight.x+165,500,-8);
  const q=smooth(range(u,1.5,2.9));move('#cursor',mix(1830,1750,q),mix(720,505,q),1,-22,range(u,1.5,1.8)*(1-range(u,3.2,3.5)));
  if(config.heroHandoff){
   const h=smooth(range(u,8.9,9.85));presenterCircle(h);
   style('#workspace',{left:mix(config.safeRight.x,380,h)+'px',top:mix(config.safeRight.y+105,115,h)+'px',width:mix(config.safeRight.width,1470,h)+'px',height:mix(530,775,h)+'px'});
   style('#intro-label',{opacity:1-h});style('#result-label',{opacity:out(range(u,7.3,8))*(1-h)});
   style('#body-view',{display:'flex',clipPath:`inset(0 ${(1-h)*100}% 0 0)`});$('#body-prompt').textContent=config.command;
   style('#body-response',{opacity:h});style('#body-preview',{width:h*530+'px'});
  }
 }else if(mode==='desktop'){
  style('#workspace',{opacity:0});style('#desktop-bg',{opacity:1});style('#menu',{opacity:1});style('#dock',{opacity:1});
  const open=smooth(range(u,2.5,3.4)),play=smooth(range(u,5.3,6.4));
  move('#comparison',0,-open*70,1-open*.035,0,1-open);
  move('#album',0,(1-open)*590,mix(.15,1,open),0,open);
  style('#comparison',{zIndex:u>=5.3?5:0});
  style('#dock',{opacity:1-play});
  const cursor= u<4?{x:mix(1320,880,smooth(range(u,1.2,2.45))),y:mix(620,980,smooth(range(u,1.2,2.45)))}:{x:mix(880,950,smooth(range(u,3.9,5.25))),y:mix(980,547,smooth(range(u,3.9,5.25)))};
  move('#cursor',cursor.x,cursor.y,1,-22,(1-play));
  const click=range(u,2.48,2.85);move('#click-ring',865,960,.3+click*1.7,0,click>0&&click<1?1-click:0);
  // Target image persists into the full-frame player, not a fresh unrelated slide.
  style('#compare-b',{left:mix(albumBox.x,0,play)+'px',top:mix(albumBox.y,0,play)+'px',width:mix(albumBox.w,1920,play)+'px',height:mix(albumBox.h,1080,play)+'px',borderRadius:mix(18,0,play)+'px',opacity:1,transform:'none'});
  if(u>=5.3){style('#comparison',{opacity:1,transform:'none'});style('#compare-a',{opacity:0});style('#compare-b header',{display:'none'});style('#compare-b footer',{display:'none'});style('#compare-b [data-media]',{height:'100%'});}
  else{style('#compare-a',{opacity:1});style('#compare-b',{left:'950px',top:'110px',width:'430px',height:'790px',transform:'none'});style('#compare-b header',{display:'flex'});style('#compare-b footer',{display:'block'});style('#compare-b [data-media]',{height:'695px'});}
 }else if(mode==='timeline'){
  style('#presenter',{opacity:0});style('#workspace',{left:'435px',top:'215px',width:'1050px',height:'675px'});
  const back=smooth(range(u,.2,1.3)),push=smooth(range(u,7.6,8.7));
  style('#workspace',{transform:`perspective(1800px) translate(${mix(145,0,back)-push*60}px,${mix(150,0,back)}px) rotateY(${(1-back)*9}deg) scale(${mix(1.55,1,back)+push*.11})`});
  style('#intro-label',{left:'170px',top:'90px',width:'1500px',opacity:back});style('#input-view',{opacity:0});style('#edit-view',{clipPath:'none'});
  style('#media-preview',{height:'380px'});style('#own-row',{opacity:out(range(u,4,4.5))});style('#text-row',{opacity:out(range(u,5.2,5.7))});
  const wipe=smooth(range(u,6,7));style('#reveal',{clipPath:`inset(0 ${(1-wipe)*100}% 0 0)`});style('#wipe-line',{left:wipe*100+'%',opacity:wipe>0&&wipe<1?1:0});
  fly('#file-a',u,1.8,3.3,190,340,870,650,-15);fly('#file-b',u,3.7,5.1,1550,230,1150,670,12);fly('#file-c',u,4.9,6.1,1560,640,1090,770,-11);
  style('#result-label',{left:'680px',top:'950px',opacity:out(range(u,8.5,9))});
 }else if(mode==='body'){
  style('#workspace',{left:'380px',top:'115px',width:'1470px',height:'775px',opacity:1,transform:'none'});style('#input-view',{display:'none'});style('#edit-view',{display:'none'});style('#body-view',{display:'flex'});
  const circle=config.circle;style('#presenter',{opacity:1,left:circle.x+'px',top:circle.y+'px',width:circle.size+'px',height:circle.size+'px',borderRadius:'50%',border:'2px solid #b496cd',background:'#f5f0fa'});
  if(config.presenter){if(config.presenterCrop)presenterCircle(1);else style('#person-video',{objectFit:'cover',objectPosition:circle.position});}
  else style('#person-placeholder',{left:'-12px',top:'-5px',transformOrigin:'0 0',transform:`scale(${circle.size/910})`});
  $('#body-prompt').textContent=typed.slice(0,Math.floor(range(u,.15,2.2)*typed.length)).join('');
  style('#body-response',{opacity:out(range(u,2.4,3.3)),transform:`translateY(${(1-out(range(u,2.4,3.3)))*30}px)`});
  const unfold=smooth(range(u,4.2,5.3));style('#body-preview',{width:unfold*530+'px'});
  fly('#file-a',u,3.55,4.7,835,535,1555,350,-8);
  const q=smooth(range(u,6.6,7.5));style('#body-preview [data-media]',{transform:`scale(${1+.025*q})`});
  move('#cursor',mix(890,1550,smooth(range(u,3.5,5))),mix(580,530,smooth(range(u,3.5,5))),1,-22,range(u,3,3.4)*(1-range(u,6,6.5)));
 }
 $('#caption').textContent=(config.captions||[]).find(c=>c.start<=masterTime&&masterTime<c.end)?.text||'';
 // All shutter samples see the same source frame. Decorative motion alone is blurred.
 await Promise.all(mediaVideos.map(v=>{let time=masterTime;if(v.id==='person-video')time+=config.sourceOffset||0;if(mode==='desktop'&&v.closest('#album-target'))time=0;if(mode==='desktop'&&v.closest('#compare-b')&&mt>=5.3)time=Math.max(0,masterTime-config.duration*.53);return seek(v,time);}));
};
window.motionActive=t=>{const u=t/(config?.duration||10)*10;const ranges={hero:[[0,1],[3.5,4.6],[5.5,7],[8.9,9.85]],desktop:[[2.5,3.4],[5.3,6.4]],timeline:[[.2,1.3],[1.8,3.3],[3.7,6.1],[7.6,8.7]],body:[[2.4,3.3],[3.55,5.3]]};return(ranges[config?.mode]||[]).some(([a,b])=>u>=a&&u<=b);};
if(!new URLSearchParams(location.search).has('render'))window.ready().then(()=>{const start=performance.now();let busy=false;const loop=async()=>{if(!busy){busy=true;try{await window.render(((performance.now()-start)/1000)%config.duration);}finally{busy=false;}}requestAnimationFrame(loop);};loop();}).catch(e=>{document.body.textContent=e.message;});
