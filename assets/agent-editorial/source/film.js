/* This episode: real identities → testable outcomes → a growing ranking. */
(()=>{'use strict';
const canvas=document.getElementById('frame'),ctx=canvas.getContext('2d',{alpha:false});
const C={black:'#0B0B0F',white:'#FFFFFF',purple:'#8750FF',muted:'#777780',line:'#DBDBE0',paper:'#F3F3F5'};
const images={},assets={};let timing,captions,config,now=0,srcImage,sourceIndex=1,init;
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n)),mix=(a,b,p)=>a+(b-a)*p;
const progress=(t,s,d=.55)=>clamp((t-s)/d),ease=p=>1-Math.pow(1-clamp(p),4);
const spring=(t,s,delay=0)=>t<s+delay?0:MotionCore.spring(t-s-delay,{from:0,to:1,omega:13,damping:.82});
function rr(x,y,w,h,r,fill,stroke,lw=2){if(w<=0||h<=0)return;ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.stroke();}}
function txt(s,x,y,size=40,color=C.black,weight=700,align='left',maxWidth){ctx.font=`${weight} ${size}px Noto, sans-serif`;ctx.textBaseline='alphabetic';ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(String(s),x,y,maxWidth);}
function line(x1,y1,x2,y2,color=C.black,width=3){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.stroke();}
function arrow(x1,y1,x2,y2,color=C.purple,width=4){line(x1,y1,x2,y2,color,width);const a=Math.atan2(y2-y1,x2-x1);line(x2,y2,x2-15*Math.cos(a-.55),y2-15*Math.sin(a-.55),color,width);line(x2,y2,x2-15*Math.cos(a+.55),y2-15*Math.sin(a+.55),color,width);}
function img(key,x,y,w,h,fit='contain',radius=0){const im=typeof key==='string'?images[key]:key;if(!im)return;ctx.save();if(radius){ctx.beginPath();ctx.roundRect(x,y,w,h,radius);ctx.clip();}const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;const k=fit==='cover'?Math.max(w/iw,h/ih):Math.min(w/iw,h/ih);ctx.drawImage(im,x+(w-iw*k)/2,y+(h-ih*k)/2,iw*k,ih*k);ctx.restore();}
function logo(slug,x,y,size){slug=slug==='harness'?'deepseek':slug;const a=assets[slug];rr(x,y,size,size,size*.24,C.white);if(a){if((slug==='claude'||slug==='trae')&&size>80){txt(slug==='claude'?'Claude':'TRAE',x+size/2,y+size*.6,size*.20,slug==='claude'?'#D27656':C.black,850,'center');}else img(a.logo,x+size*.16,y+size*.16,size*.68,size*.68);}}
function pill(s,x,y,w,h,fill=C.black,color=C.white,size=30){rr(x,y,w,h,h*.28,fill);txt(s,x+w/2,y+h/2+size*.35,size,color,800,'center');}
const H={C,rr,txt,line,arrow,img,logo,pill,progress,spring,mix,clamp,assets,images};
const shadow=(fn,blur=25)=>{ctx.save();ctx.shadowColor='#00000020';ctx.shadowBlur=blur;ctx.shadowOffsetY=12;fn();ctx.restore();};
const productChapters=()=>timing.chapters.slice(1,-1);
function badge(c,x,y,w=205,h=62,emphasis=false){shadow(()=>rr(x,y,w,h,14,emphasis?C.purple:C.white));logo(c.id,x+8,y+7,h-14);txt(c.id==='harness'?'DeepSeek':c.name,x+h+2,y+h*.66,Math.min(24,(w-h-10)/(c.name.length*.55)),emphasis?C.white:C.black,800,'left',w-h-12);}
function board(t,x,y,w,h,showAll=false,preview=false){
 const rows=timing.ratingOrder,rowH=(h-82)/6;shadow(()=>rr(x,y,w,h,28,C.black));txt('AGENT RANKING',x+28,y+47,26,C.white,850);txt('个人使用体验',x+w-28,y+46,19,'#A7A3B1',500,'right');
 rows.forEach((r,i)=>{const yy=y+68+i*rowH;rr(x+18,yy,w-36,rowH-7,12,i%2?'#1C1B23':'#25232D');pill(r,x+28,yy+8,138,rowH-23,i<3?C.purple:'#3C3948',C.white,i===0?28:30);
  const cs=productChapters().filter(ch=>ch.rating===r&&(showAll||t>=ch.ratingAt));cs.forEach((ch,j)=>{const bw=Math.min(211,(w-207)/4),hh=Math.min(61,rowH-25),p=showAll?1:spring(t,ch.ratingAt),xx=x+185+j*(bw+10);ctx.save();ctx.globalAlpha=clamp(p);ctx.translate(0,(1-p)*45);badge(ch,xx,yy+10,bw,hh,t<ch.end+.4);ctx.restore();});
  if(!cs.length)txt(preview?'待评':'—',x+203,yy+rowH*.62,24,'#615C6D',500);
 });
}
function presenter(t,mode){if(!srcImage)return;
 if(mode==='full'){ctx.drawImage(srcImage,0,0,1920,1080);return;}
 if(mode==='handoff'){
  const p=ease(progress(t,7.94,1.05)),q=ease(progress(t,11.42,2.44));
  const x=mix(0,42,q),y=mix(0,575,q),w=mix(mix(1920,720,p),350,q),h=mix(1080,350,q),r=mix(0,175,q);
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.clip();
  const sx=mix(0,535,p),sw=mix(1920,870,p),sh=mix(1080,870,q);ctx.drawImage(srcImage,sx,0,sw,sh,x,y,w,h);ctx.restore();return;
 }
 shadow(()=>rr(36,572,360,360,180,C.white));img(srcImage,42,578,348,348,'cover',174);rr(42,578,348,348,174,null,C.white,5);
 pill('方木',124,902,184,45,C.black,C.white,24);
}
function card(t,i,x,y,w,h){const ch=productChapters()[i],asset=assets[ch.id==='harness'?'deepseek':ch.id];shadow(()=>rr(x,y,w,h,18,C.white));logo(ch.id,x+12,y+13,h-26);txt(ch.id==='harness'?'DeepSeek':ch.name,x+h-4,y+h*.6,28,C.black,850,'left',w-h-10);}
function opening(t){
 ctx.fillStyle=C.white;ctx.fillRect(0,0,1920,1080);
 if(t<7.94){presenter(t,'full');
  const gr=ctx.createLinearGradient(0,0,700,0);gr.addColorStop(0,'#00000055');gr.addColorStop(1,'#00000000');ctx.fillStyle=gr;ctx.fillRect(0,0,650,1080);
  if(t<3.96){
   const enter=ease(progress(t,0,.4));ctx.save();ctx.globalAlpha=enter;pill('AI AGENT',55,60,405,103,C.black,C.white,53);ctx.restore();
   // Actual work surfaces expand from product identity, with short staggered landings.
   const openingSlugs=['workbuddy','doubao','deepseek','kimi','cursor','qwen'];
   for(let i=0;i<6;i++){const side=i%2,row=Math.floor(i/2),e=spring(t,.1+i*.13);const leave=ease(progress(t,3.38,.58));const xx=mix(side?2100:-650,side?1430:24,e)+(side?1:-1)*620*leave;const yy=208+row*205;const a=assets[openingSlugs[i]];ctx.save();ctx.globalAlpha=clamp(e)*(1-leave);ctx.translate(xx+227,yy+110);ctx.rotate((side?1:-1)*(.035+(1-clamp(e))*.15));const scale=.86+row*.035;ctx.scale(scale,scale);shadow(()=>rr(-227,-110,454,250,20,C.white),35);rr(-227,-110,454,55,18,C.black);txt(a.name,-202,-73,25,C.white,850);img(a.hero,-211,-42,422,159,'cover',6);logo(openingSlugs[i],151,-111,57);ctx.restore();}
   if(t>2.0){const ep=ease(progress(t,2,.35));ctx.save();ctx.globalAlpha=ep;pill('10 款，逐个看',65,870,430,77,C.purple,C.white,37);ctx.restore();}
   if(t>2.35){const p=ease(progress(t,2.35,.42));ctx.save();ctx.globalAlpha=p;pill('智能体，吹上天了？',1485,70,390,104,C.purple,C.white,35);ctx.restore();}
  }else{
   const p=spring(t,3.96);ctx.save();ctx.globalAlpha=clamp(p);ctx.translate(0,(1-p)*45);
   // Two contrasting task outcomes, deliberately not assigned to any product yet.
   shadow(()=>rr(42,240,475,440,25,C.white));pill('真能干活',64,262,430,90,C.black,C.white,48);
   ['整理资料','生成方案','交付文件'].forEach((s,i)=>{const a=ease(progress(t,4.12+i*.34,.4));rr(80,388+i*81,396*a,59,12,i===2?C.purple:C.paper);if(a>.8){txt(s,105,428+i*81,31,i===2?C.white:C.black,750);txt('✓',443,429+i*81,32,i===2?C.white:C.purple,900,'center');}});
   shadow(()=>rr(1415,240,465,440,25,C.white));pill('纯属坑人',1437,262,421,90,C.purple,C.white,48);txt('正在思考……',1648,432,38,C.black,800,'center');rr(1455,480,380,16,8,C.line);rr(1455,480,125,16,8,C.black);txt('任务还停在原地',1648,578,29,C.muted,700,'center');txt('情景示意',1830,651,19,C.muted,400,'right');ctx.restore();
  }
 }else{
  presenter(t,'handoff');const a=ease(progress(t,7.94,.8)),q=ease(progress(t,11.42,1.1));
  const bx=mix(1990,mix(770,465,q),a),by=mix(160,215,q),bw=mix(1095,1370,q),bh=mix(675,635,q);
  board(t,bx,by,bw,bh,false,true);
  txt('10 款',bx+4,by-55,77,C.black,900);txt('从夯到拉',bx+260,by-55,63,C.purple,900);
  if(t>9.25){for(let i=0;i<10;i++){const ch=productChapters()[i],p=spring(t,9.25+i*.075),xx=bx+32+i*(bw-70)/10;ctx.save();ctx.globalAlpha=clamp(p);logo(ch.id,xx,by+bh+20+(1-p)*40,62);ctx.restore();}}
  const enter=ease(progress(t,8.8,.5));ctx.save();ctx.globalAlpha=enter;txt('谁值得用？',bx+bw*.63,by+bh*.47,72,C.white,900,'center');pill('按实际体验，一个个归位',bx+bw*.63-265,by+bh*.55,530,76,C.purple,C.white,29);ctx.restore();
  if(t>11.42){ctx.save();ctx.globalAlpha=q;pill('少走弯路 · 少试错',62,132,335,90,C.purple,C.white,31);txt('10 AGENTS',67,280,47,C.black,850);txt('一口气讲清',67,342,44,C.black,850);ctx.restore();}
 }
}
function navigation(t,ch){
 const index=productChapters().findIndex(c=>c.id===ch.id),num=index+1;
 pill('从夯到拉',38,40,302,98,C.black,C.white,44);txt('AI AGENT · 个人体验',44,178,22,C.muted,650);
 logo(ch.id,470,43,81);txt(ch.name,576,100,ch.name.length>12?43:53,C.black,850);
 productChapters().forEach((c,i)=>{const xx=1170+i*65;logo(c.id,xx,49,49);if(t>=c.ratingAt){rr(xx+13,108,23,5,2,C.purple);}else if(i===index)rr(xx+9,107,31,6,3,C.black);else rr(xx+18,109,12,3,2,C.line);});
 txt(`${String(num).padStart(2,'0')} / 10`,1820,164,28,C.muted,700,'right');
 if(ch.rating) {txt('本期评测',42,300,26,C.muted,600);txt(ch.name,42,355,ch.name.length>12?28:39,C.black,850,'left',350);const info={codex:'普通人用专业工作流',doubao:'上手简单 · 事实要查',workbuddy:'本土办公 · 可改交付',harness:'模块自由组合',claude:'能力强 · 使用有门槛',trae:'同项目跨场景接力',openclaw:'远程执行 · 自己维护',kimi:'数量不等于效率',cursor:'可见修改 · 可以撤回',qwen:'集中工具 · 减少切换'};txt(info[ch.id],44,408,25,C.muted,550,'left',345);}
}
function mainBody(t,ch){
 ctx.fillStyle=C.white;ctx.fillRect(0,0,1920,1080);rr(0,0,410,1080,0,C.paper);
 navigation(t,ch);presenter(t,'body');
 const a=ease(progress(t,ch.start,.55));ctx.save();ctx.globalAlpha=a;ctx.translate((1-a)*85,0);
 if(BodyA&&['codex','doubao','workbuddy','harness','claude'].includes(ch.id))BodyA.draw(ctx,t,ch,H);else if(BodyB)BodyB.draw(ctx,t,ch,H);ctx.restore();
 // A verdict updates the existing ranking rather than changing to an unrelated end card.
 if(t>=ch.ratingAt-.28){const p=ease(progress(t,ch.ratingAt-.28,.38));ctx.save();ctx.globalAlpha=p;rr(420,181,1500,745,0,C.white);board(t,462,220+(1-p)*80,1370,634);ctx.restore();}
 const prev=productChapters()[productChapters().indexOf(ch)-1];if(prev&&t<ch.start+.45){const p=ease(progress(t,ch.start,.45));ctx.save();ctx.globalAlpha=1-p;ctx.translate(0,-p*210);rr(419,178,1501,745,0,C.white);board(t,462,220,1370,634);ctx.restore();}
}
function outro(t){ctx.fillStyle=C.white;ctx.fillRect(0,0,1920,1080);rr(0,0,410,1080,0,C.paper);presenter(t,'body');pill('最终榜单',38,40,302,98,C.black,C.white,44);txt('个人使用体验',43,190,28,C.muted,650);txt('你正在用哪款？',45,335,37,C.black,850);txt('高估 / 低估',45,412,40,C.purple,850);board(t,460,170,1370,680,true);if(t>298.54){const p=spring(t,298.54);ctx.save();ctx.globalAlpha=clamp(p);pill('评论区碰一碰',1010,868+(1-p)*30,490,62,C.purple,C.white,33);ctx.restore();}}
function subtitles(t){const cap=captions.find(c=>t>=c.start&&t<c.end);if(!cap)return;const s=cap.text;ctx.font='800 43px Noto';const ww=Math.min(1680,ctx.measureText(s).width+76),x=(1920-ww)/2;shadow(()=>rr(x,976,ww,75,20,C.black),14);rr(x+16,995,5,35,2,C.purple);txt(s,960,1028,43,C.white,800,'center',ww-65);}
async function loadImage(url){return new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(new Error('Image load failed: '+url));im.src=url;});}
const frames=new Map();async function loadSource(t){sourceIndex=Math.min(7501,Math.floor(t*25)+1);const group=t<13.86?'full':'presenter',key=`media/${group}/${String(Math.min(group==='full'?365:7501,sourceIndex)).padStart(6,'0')}.jpg`;if(!frames.has(key)){frames.set(key,await loadImage(key));if(frames.size>90)frames.delete(frames.keys().next().value);}srcImage=frames.get(key);}
window.ready=()=>init||(init=(async()=>{[timing,captions,config]=await Promise.all(['timing.json','captions.json','project.json'].map(u=>fetch(u).then(r=>r.json())));const aa=await fetch('assets/assets.json').then(r=>r.json());aa.forEach(a=>assets[a.slug]=a);await Promise.all(config.assetFiles.map(async p=>images[p]=await loadImage(p)));await document.fonts.load('800 43px Noto');await document.fonts.load('800 65px Noto');await document.fonts.ready;return true;})());
window.render=async t=>{await window.ready();now=clamp(t,0,300.02);await loadSource(now);ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.shadowColor='transparent';ctx.fillStyle=C.white;ctx.fillRect(0,0,1920,1080);if(now<15)OpeningV2.draw(ctx,now,{...H,chapters:timing.chapters,mainBody,presenter});else if(now>=291.84)outro(now);else mainBody(now,timing.chapters.find(ch=>now>=ch.start&&now<ch.end));subtitles(now);return true;};
window.getState=()=>({time:now,sourceFrame:sourceIndex,chapter:timing.chapters.find(c=>now>=c.start&&now<c.end)?.id||'outro',palette:C,sourceClock:'original 25fps',caption:captions.find(c=>now>=c.start&&now<c.end)?.text||''});
if(location.search.includes('render=1'))document.body.classList.add('render');else{const audio=document.getElementById('audio'),seek=document.getElementById('seek'),play=document.getElementById('play');let playing=false,busy=false;play.onclick=async()=>{if(playing){audio.pause();playing=false;play.textContent='播放';}else{await audio.play();playing=true;play.textContent='暂停';}};seek.oninput=async()=>{audio.currentTime=Number(seek.value);await window.render(Number(seek.value));};async function tick(){if(playing&&!busy){busy=true;await window.render(audio.currentTime);seek.value=audio.currentTime;document.getElementById('time').textContent=`${Math.floor(audio.currentTime/60)}:${String(Math.floor(audio.currentTime%60)).padStart(2,'0')}`;busy=false;}requestAnimationFrame(tick);}window.ready().then(()=>window.render(0));tick();}
})();

