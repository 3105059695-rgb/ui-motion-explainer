/* Arun reference opening adaptation: comparable objects -> attached evidence -> identifiers -> ranking -> first product.
   Current episode's script clock and brand colors are preserved; stage uses the user's black/purple UI. */
(()=>{'use strict';
const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
const lerp=(a,b,p)=>a+(b-a)*p;
const ease=n=>{n=clamp(n);return n<.5?8*n*n*n*n:1-Math.pow(-2*n+2,4)/2;};
const out=n=>1-Math.pow(1-clamp(n),4);
const p=(t,s,d=.6)=>ease((t-s)/d);
const sp=(t,s)=>t<s?0:MotionCore.spring(t-s,{from:0,to:1,omega:15,damping:.80});
const ro=(a,b,q)=>({x:lerp(a.x,b.x,q),y:lerp(a.y,b.y,q),w:lerp(a.w,b.w,q),h:lerp(a.h,b.h,q),r:lerp(a.r||0,b.r||0,q)});
function draw(ctx,t,H){
 const {C,rr,txt,img,logo,pill,chapters,images,assets,mainBody,presenter}=H;
 const ids=['codex','doubao','workbuddy','harness','claude','trae','openclaw','kimi','cursor','qwen'];
 const names=['Codex','豆包工作','WorkBuddy','DeepSeek Harness','Claude Code','TRAE Work','OpenClaw','Kimi Work','Cursor','千问办公'];
 const A=id=>assets[id==='harness'?'deepseek':id];
 const PI=Math.PI;
 function shadow(fn,blur=32,alpha=.45){ctx.save();ctx.shadowColor=`rgba(0,0,0,${alpha})`;ctx.shadowBlur=blur;ctx.shadowOffsetY=18;fn();ctx.restore();}
 function brand(i,x,y,s){logo(ids[i],x,y,s);}
 function shadowTile(i,rect,alpha=1,focus=0,subtitle=true){
  if(alpha<=0)return;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(rect.x+rect.w/2,rect.y+rect.h/2);ctx.rotate(rect.r||0);
  const w=rect.w,h=rect.h;shadow(()=>{rr(-w/2+7,-h/2+9,w,h,22,C.purple);rr(-w/2,-h/2,w,h,22,C.white);});
  if(focus>0){ctx.save();ctx.globalAlpha*=focus;rr(-w/2-8,-h/2-8,w+16,h+16,28,null,C.purple,5);ctx.restore();}
  const s=h*.29;brand(i,-w/2+25,-h/2+26,s);
  const fs=Math.min(44,(w-s-65)/(names[i].length*.56));txt(names[i],-w/2+s+42,-h/2+27+s*.72,fs,C.black,850,'left',w-s-55);
  if(subtitle){txt(['项目执行','日常办公','办公协作'][i]||'Agent',-w/2+27,h*.08,28,C.muted,650);txt('AI Agent',-w/2+24,h*.36,47,C.black,850);rr(w/2-94,h*.18,67,8,4,C.purple);}
  ctx.restore();
 }
 function ringIcon(i,x,y,s,alpha=1){ctx.save();ctx.globalAlpha*=alpha;shadow(()=>rr(x,y,s,s,s*.26,C.white),14,.25);brand(i,x,y,s);ctx.restore();}
 function cursor(x,y,scale=1){ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(2,44);ctx.lineTo(14,33);ctx.lineTo(26,55);ctx.lineTo(36,49);ctx.lineTo(23,28);ctx.lineTo(43,26);ctx.closePath();ctx.fillStyle=C.white;ctx.fill();ctx.strokeStyle=C.black;ctx.lineWidth=2;ctx.stroke();ctx.restore();}
 function seal(s,x,y,size,alpha=1){ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(-.16);rr(-size*.68,-size*.34,size*1.36,size*.68,13,C.purple);txt(s,0,size*.15,size*.34,C.white,900,'center');ctx.restore();}
 function sceneBackground(){
  ctx.fillStyle=C.black;ctx.fillRect(0,0,1920,1080);
  const g=ctx.createRadialGradient(950,410,0,950,410,1050);g.addColorStop(0,'#8750FF28');g.addColorStop(.45,'#44216D14');g.addColorStop(1,'#0B0B0F00');ctx.fillStyle=g;ctx.fillRect(0,0,1920,1080);
 }
 function ranking(rect,alpha=1,question=true){
  ctx.save();ctx.globalAlpha*=alpha;ctx.translate(rect.x,rect.y);ctx.scale(rect.w/1280,rect.h/700);
  const labels=['夯爆了','夯','顶级','人上人','NPC','拉完了'];
  for(let i=0;i<6;i++){const y=i*103;rr(0,y,1245,94,14,'#191820','#35303F',1.5);rr(0,y,178,94,14,i<3?C.purple:'#3A3544');txt(labels[i],89,y+61,i===0?36:40,C.white,850,'center');}
  txt('本期使用体验 · 排名将在正文逐项揭晓',0,670,26,'#A29AAB',550);
  if(question){const q=out((t-10.2)/.35);ctx.save();ctx.globalAlpha*=q;[0,5].forEach((row,j)=>{const x=270,y=row*103+47;rr(x-37,y-37,74,74,37,null,C.purple,3);txt('?',x,y+19,56,C.white,850,'center');pill(j?'谁在垫底？':'谁真能打？',x+65,y-29,255,58,j?'#383142':C.purple,C.white,29);});ctx.restore();}
  ctx.restore();
 }
 function work(i,rect,alpha){if(alpha<=0)return;const a=A(ids[i]);ctx.save();ctx.globalAlpha*=alpha;ctx.translate(rect.x+rect.w/2,rect.y+rect.h/2);ctx.rotate(rect.r||0);shadow(()=>rr(-rect.w/2,-rect.h/2,rect.w,rect.h,20,C.white),25,.4);const label=i===0?'官方 CLI 示例':'官方产品界面';rr(-rect.w/2,-rect.h/2,rect.w,39,15,C.black);txt(label,-rect.w/2+15,-rect.h/2+27,19,C.white,700);const im=images[a.hero];
  ctx.save();ctx.beginPath();ctx.roundRect(-rect.w/2+8,-rect.h/2+45,rect.w-16,rect.h-53,12);ctx.clip();
  if(i===1){ctx.drawImage(im,75,235,1475,755,-rect.w/2+8,-rect.h/2+45,rect.w-16,rect.h-53);}
  else if(i===2){ctx.drawImage(im,540,210,1350,660,-rect.w/2+8,-rect.h/2+45,rect.w-16,rect.h-53);}
  else img(a.hero,-rect.w/2+8,-rect.h/2+45,rect.w-16,rect.h-53,'cover');
  ctx.restore();ctx.restore();}
 sceneBackground();
 const dock=p(t,12.55,.7),handoff=p(t,13.65,1.35);
 if(t<7.9){
  // The ranking exists behind the comparison from the first shot, like the reference.
  ctx.save();ctx.filter='blur(4px)';ranking({x:110,y:170,w:1630,h:710},.12,false);ctx.restore();
  const expand=p(t,4.55,.66),gone=0;
  const headlineAlpha=1-p(t,3.5,.32);ctx.save();ctx.globalAlpha=headlineAlpha;txt('10 款',960,167,97,C.white,900,'center');txt('AI AGENT',960,239,48,C.purple,850,'center');ctx.restore();
  if(t>=3.7&&t<6.8){const a=out((t-3.7)/.35)*(1-p(t,6.4,.4));ctx.save();ctx.globalAlpha=a;txt('真能干活，还是只会画饼？',960,162,64,C.white,900,'center');ctx.restore();}
  // Seven background identities complete the ten, without fighting the current three.
  for(let i=3;i<10;i++){const e=sp(t,1+(i-3)*.17);const a=clamp(e)*(1-gone)*.72;const x=580+(i-3)*115,y=lerp(790,885,expand)+(1-e)*95;ringIcon(i,x,y,lerp(77,58,expand),a);}
  const rects=[];
  for(let i=0;i<3;i++){const e=sp(t,.12+i*.14),xs=[300,780,1260];const base={x:xs[i],y:350,w:385,h:263,r:[-.032,0,.032][i]},small={x:xs[i]+43,y:654,w:300,h:203,r:[-.025,0,.025][i]};let r=ro(base,small,expand);r.y+=(1-e)*430;r.r+=(1-clamp(e))*(i-1)*.08;const highlight=t>=3.95&&t<4.85?(i===Math.min(2,Math.floor((t-3.95)/.3))?1:0):0;rects.push(r);shadowTile(i,r,clamp(e)*(1-gone),highlight);
   const start=4.7+i*.16,pp=sp(t,start),fade=clamp(pp)*(1-gone);const from={x:small.x+40,y:small.y-20,w:220,h:156,r:0},target={x:xs[i]-20,y:273,w:430,h:292,r:[-.015,0,.015][i]};const wr=ro(from,target,pp);if(pp>0){if(pp<.98){for(let trail=2;trail>=1;trail--){const old=sp(t-trail*.025,start);work(i,ro(from,target,old),fade*.10);}}work(i,wr,fade);}
  }
  if(t>=3.95&&t<5.1){const n=clamp((t-3.95)/.9);cursor(lerp(570,1470,ease(n)),620+Math.sin(n*PI)*20,1.1);}
  if(t>=6.65){const e=sp(t,6.65);ctx.save();ctx.globalAlpha=clamp(e)*(1-gone);ctx.translate(960,154);ctx.scale(.6+.4*e,.6+.4*e);rr(-50,-50,100,100,50,C.purple);txt('?',0,26,80,C.white,900,'center');ctx.restore();}
 }else{
  // All three foreground cards and seven rear identities compact into one candidate queue.
  const transition=p(t,7.9,.48);const large={x:145,y:175,w:1350,h:730},small={x:1470,y:38,w:360,h:210};const br=ro(large,small,dock);
  ctx.save();ctx.globalAlpha=1-handoff;ranking(br,transition,true);ctx.restore();
  if(t<12.9){const a=out((t-7.9)/.35)*(1-dock);ctx.save();ctx.globalAlpha=a;txt('从',145,112,48,C.white,800);txt('夯',215,119,79,C.purple,900);txt('到',315,112,48,C.white,800);txt('拉',385,119,79,C.white,900);txt('十款，逐个讲清',1493,114,35,C.white,750,'right');ctx.restore();}
  for(let i=0;i<10;i++){
   let start={x:i<3?[300,780,1260][i]+43:580+(i-3)*115,y:i<3?654:885,w:i<3?300:58,h:i<3?203:58,r:i<3?[-.025,0,.025][i]:0};
   let target={x:1570+(i%2)*125,y:198+Math.floor(i/2)*132,w:88,h:88};let r=ro(start,target,transition);
   if(i===0&&dock>0){r=ro(r,{x:740,y:350,w:440,h:285},dock);}
   ctx.save();ctx.globalAlpha=1-handoff;
   if(i<3&&transition<.995){shadowTile(i,r,1-transition,0,false);}
   if(i===0&&dock>0){if(t<13.65)shadowTile(0,r,1,0,true);}else ringIcon(i,r.x,r.y,r.w,transition);
   ctx.restore();
  }
  if(t<8.28){const z=p(t,7.9,.38);for(let i=0;i<3;i++){work(i,ro({x:[300,780,1260][i]-20,y:273,w:430,h:292,r:[-.015,0,.015][i]},{x:1570+(i%2)*125,y:198+Math.floor(i/2)*132,w:88,h:88,r:0},z),1-z);}}
  if(t>=11.42&&t<13.4){const a=clamp(sp(t,11.42))*(1-dock);seal('少走弯路',1280,805,200,a);}
 }
 if(t>=13.65){
  // The same Codex identity moves into the existing body header; the original presenter returns here.
  ctx.save();const rad=handoff*2400;ctx.beginPath();ctx.arc(960,520,rad,0,PI*2);ctx.clip();const chapter=chapters.find(ch=>ch.id==='codex');mainBody(Math.max(t,13.86),chapter);ctx.restore();
  const q=p(t,13.65,1.15);const r=ro({x:740,y:350,w:440,h:285,r:0},{x:470,y:43,w:81,h:81,r:0},q);
  ctx.save();ctx.globalAlpha=1-p(t,14.7,.3);if(q<.75)shadowTile(0,r,1,0,q<.5);else ringIcon(0,r.x,r.y,r.w,1);ctx.restore();
 }
}
window.OpeningV2={draw};
})();
