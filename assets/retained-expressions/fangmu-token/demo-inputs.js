/* Public previews use an explicit schematic actor; production keeps real media. */
(()=>{'use strict';
const B=window.__UI_MOTION_BINDINGS__||parent.__UI_MOTION_BINDINGS__||{},demo=B.props?.mode==='demo'||new URLSearchParams(location.search).get('demo')==='1';
window.__UI_MOTION_BINDINGS__=B;
if(!demo){for(const v of document.querySelectorAll('video[data-src]')){v.src=v.dataset.src;v.load();}return;}
const root=new URL('../',location.href);let generated=0;
function actor(c,t,matte){const g=c.getContext('2d');g.fillStyle=matte?'#000000':'#F3F3F5';g.fillRect(0,0,1920,1080);g.fillStyle=matte?'#FFFFFF':'#0B0B0F';g.beginPath();g.ellipse(960,325,110,125,0,0,Math.PI*2);g.fill();g.beginPath();g.roundRect(720,440,480,700,150);g.fill();g.fillRect(675,550+Math.sin(t)*12,95,340);g.fillRect(1150,550-Math.sin(t)*12,95,340);if(!matte){g.fillStyle='#777780';g.font='38px sans-serif';g.fillText('示意人物区 · 制作时替换为本期人物',55,75);g.fillStyle='#D6C2FF';g.fillRect(895,480,130,8);}}
for(const video of [...document.querySelectorAll('video')]){
 const c=document.createElement('canvas');c.id=video.id;c.width=1920;c.height=1080;c.style.display='none';c.dataset.src='data:application/octet-stream,demo';video.replaceWith(c);let time=0,state=0,src='',child;
 const subordinate=c.id==='opening'?'opening-source/index-v5.html':c.id==='material'?'token/real-desk-v3.html':null;
 let loaded=Promise.resolve();
 if(subordinate){const f=document.createElement('iframe');f.hidden=true;f.src=new URL(subordinate+'?render=1&demo=1',root);document.body.appendChild(f);loaded=new Promise((resolve,reject)=>{f.onload=async()=>{try{const w=f.contentWindow;await new Promise((res,rej)=>{let n=0;const loop=()=>typeof w.ready==='function'?res():n++>1000?rej(Error('Nested scene not ready')):setTimeout(loop,20);loop()});await w.ready();child=w;resolve();}catch(e){reject(e)}}});}
 async function draw(){await loaded;if(child){await child.render(time+(c.id==='material'?196.56:0));const frame=child.document.getElementById('frame');c.getContext('2d').drawImage(frame,0,0,1920,1080);}else actor(c,time,c.id==='matte');}
 Object.defineProperties(c,{videoWidth:{get:()=>1920},videoHeight:{get:()=>1080},readyState:{get:()=>state},duration:{get:()=>340},paused:{get:()=>true},src:{get:()=>src,set:value=>{src=value}},currentTime:{get:()=>time,set:value=>{time=Number(value);draw().then(()=>c.dispatchEvent(new Event('seeked')));}}});
 c.pause=()=>{};c.play=()=>Promise.resolve();c.load=()=>{draw().then(()=>{state=4;for(const name of ['loadedmetadata','loadeddata','canplay','canplaythrough'])c.dispatchEvent(new Event(name));}).catch(e=>{console.error(e);c.dispatchEvent(new Event('error'))});};
 c.load();generated++;
}
window.__schematicPresenter={enabled:true,privateFaceUsed:false,privateVoiceUsed:false,generatedCanvases:generated};
})();
