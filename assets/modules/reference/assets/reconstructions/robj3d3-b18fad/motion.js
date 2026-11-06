/* Independent SuperX-specific teaser. Original media is not a runtime asset. */
(()=>{'use strict';const g=document.querySelector('canvas').getContext('2d'),stage=document.querySelector('#stage');let P,state={},time=0;
const C=v=>Math.max(0,Math.min(1,v)),S=v=>{v=C(v);return v*v*(3-2*v)},E=v=>1-Math.pow(1-C(v),3),mix=(a,b,p)=>a+(b-a)*p,H=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const outer=[[-108,-100],[-44,-100],[17,-25],[78,-100],[108,-100],[32,-6],[117,100],[53,100],[-16,17],[-81,100],[-111,100],[-31,-1]],inner=[[-76,-86],[-54,-86],[86,86],[64,86]];
const fields=Array.from({length:75},(_,i)=>({x:(H(i*3+1)-.5)*2100,y:(H(i*3+2)-.5)*1350,z:(H(i*3+3)-.5)*1300,red:i%7===0}));const cardAssets=[];
function fit(){stage.style.transform=`translate(-50%,-50%) scale(${Math.min(innerWidth/1920,innerHeight/1080)})`;}fit();addEventListener('resize',fit);
function rect(x,y,w,h,c,r=0){g.fillStyle=c;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();}
function text(s,x,y,size=48,color=P.colors.text,weight=500,align='center',font='Geist',style='normal'){g.font=`${style} ${weight} ${size}px ${font},Arial`;g.fillStyle=color;g.textAlign=align;g.textBaseline='alphabetic';g.fillText(s,x,y);return g.measureText(s).width;}
function line(ps,color,width=1){g.strokeStyle=color;g.lineWidth=width;g.beginPath();ps.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.stroke();}
function path(ps){ps.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();}
function glow(x,y,size,alpha=.3){const q=g.createRadialGradient(x,y,0,x,y,size);q.addColorStop(0,`rgba(216,91,51,${alpha})`);q.addColorStop(.25,`rgba(118,41,27,${alpha*.45})`);q.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=q;g.fillRect(x-size,y-size,size*2,size*2);}
function xmark(x,y,size,lit=0,t=0,white=false,yaw=0,pitch=0){
 g.save();g.translate(x,y);const sc=size/200,co=Math.cos(yaw),si=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const project=(p,z=-5)=>{let xx=p[0]*co+z*si,zz=-p[0]*si+z*co,yy=p[1]*cp-zz*sp;zz=p[1]*sp+zz*cp;const k=1500/(1500+zz);return[xx*sc*k,yy*sc*k];};
 const front=outer.map(p=>project(p,-5)),back=outer.map(p=>project(p,5)),hole=inner.map(p=>project(p,-5)),ink=typeof white==='string'?white:P.colors.text;
 g.beginPath();path(back);g.fillStyle='#090807';if(!white)g.fill();if(!white)for(let i=0;i<outer.length;i++){const j=(i+1)%outer.length;g.beginPath();path([front[i],front[j],back[j],back[i]]);g.fillStyle='#181411';g.fill();}
 g.beginPath();path(front);path(hole);const f=g.createLinearGradient(-size/2,-size/2,size/2,size/2);f.addColorStop(0,white?ink:'#11100f');f.addColorStop(.5,white?ink:'#0c0b0b');f.addColorStop(1,white?ink:'#141110');g.fillStyle=f;g.fill('evenodd');g.strokeStyle=white?ink:'#25211e';g.lineWidth=.9;g.stroke();
 if(lit){const r=(t*.58)%1,a=[[-44,-100],[-10,-58],[30,-12],[65,42],[108,100]],b=[[77,-99],[18,-23],[62,36]];for(const [j,ps] of [a,b].entries()){const at=C(r+j*.4),k=Math.min(ps.length-2,Math.floor(at*(ps.length-1))),q=at*(ps.length-1)-k;const px=mix(ps[k][0],ps[k+1][0],q)*sc,py=mix(ps[k][1],ps[k+1][1],q)*sc;glow(px,py,Math.max(80,size*.34),lit*.22);g.save();g.shadowColor=P.colors.glow;g.shadowBlur=23;line([[px-Math.min(size*.09,80),py-Math.min(size*.11,90)],[px+Math.min(size*.045,40),py+Math.min(size*.055,50)]],P.colors.glow,1.8);g.restore();}}
 g.restore();
}
function background(t){rect(0,0,1920,1080,P.colors.background);glow(960,570,850,.11);g.save();g.globalAlpha=.032;for(let i=0;i<1200;i++){const x=H(i*2)*1920,y=H(i*2+1)*1080;rect(x,y,1,1,'#c9b4a4');}g.restore();}
function flame(x,y,size){g.save();g.translate(x,y);g.scale(size/140,size/140);g.fillStyle='#d93239';g.beginPath();g.moveTo(0,-74);g.bezierCurveTo(55,-45,15,0,44,-7);g.bezierCurveTo(47,-23,49,-25,57,-35);g.bezierCurveTo(81,18,66,69,0,72);g.bezierCurveTo(-73,72,-88,11,-54,-48);g.bezierCurveTo(-55,-6,-26,7,-34,-18);g.bezierCurveTo(-42,-51,-10,-61,0,-74);g.fill();g.fillStyle='#ffd84f';g.beginPath();g.moveTo(-7,3);g.bezierCurveTo(26,27,3,48,31,39);g.bezierCurveTo(58,91,-68,77,-36,25);g.bezierCurveTo(-34,58,-1,56,-7,3);g.fill();g.restore();}
function equation(t){
 const q=t>=6.08,glitch=t>=5.04&&t<6.08;
 let word=q?'?':P.text.originalMeaning;if(glitch){const abc='SUPERXAOIRTKM0123456789',tick=Math.floor(t*23);word=Array.from({length:7},(_,i)=>abc[Math.floor(H(tick*10+i)*abc.length)]).join('');}
 g.font=`600 ${q?190:190}px ${q?'Georgia':'Geist'},Arial`;const tw=g.measureText(word).width,total=160+67+113+55+tw,x=960-total/2;
 xmark(x+80,544,160,q||glitch?.8:0,t,!q&&!glitch);text('=',x+285,608,175,P.colors.text,500);text(word,x+395,610,q?190:190,q?P.colors.text:glitch?'#bfb4b1':P.colors.text,600,'left',q?'Georgia':'Geist',q?'italic':'normal');
 if(glitch){g.save();g.shadowBlur=20;g.shadowColor=P.colors.glow;line([[x+353,541],[x+395+tw,541]],P.colors.glow,6);g.restore();for(let i=0;i<5;i++){g.globalAlpha=.11;text(word,x+393+(H(i+Math.floor(t*20))-0.5)*18,609+i*2,190,'#e0d4d2',600,'left');}g.globalAlpha=1;}
 if(t<5.12){g.globalAlpha=1-S((t-4.7)/.4);text(P.text.assumption,960,807,43,'#8b8581',500);g.globalAlpha=1;}state.meaning=q?'question':glitch?'scrambling':P.text.originalMeaning;
}
function createCard(i,video=false){const c=document.createElement('canvas');c.width=video?350:420;c.height=video?600:300;const q=c.getContext('2d'),w=c.width,h=c.height;
 q.fillStyle=video?'#252321':'#1a1717';q.beginPath();q.roundRect(1,1,w-2,h-2,22);q.fill();q.strokeStyle='#6a504342';q.lineWidth=2;q.stroke();q.fillStyle='#454240';q.beginPath();q.arc(50,49,26,0,7);q.fill();q.fillStyle='#6a6460';q.beginPath();q.roundRect(94,31,150,15,7);q.fill();q.fillStyle='#41403d';q.beginPath();q.roundRect(94,56,112,12,6);q.fill();
 q.fillStyle='#100d0c';q.beginPath();q.arc(w-48,43,26,0,7);q.fill();q.strokeStyle='#ae695f88';q.stroke();q.fillStyle='#c5bcb5';q.font='600 31px Arial';q.textAlign='center';q.fillText(video?String(2+i%3):'X',w-48,54);
 if(video){q.fillStyle='#68605a';q.beginPath();q.moveTo(w/2-11,h/2-17);q.lineTo(w/2+17,h/2);q.lineTo(w/2-11,h/2+17);q.fill();for(let z=0;z<2;z++){q.fillStyle=z?'#54504b':'#69625b';q.beginPath();q.roundRect(23,h-76+z*27,170-z*49,12,5);q.fill();}}
 else{for(let z=0;z<3;z++){q.fillStyle=z?'#4e4945':'#615b55';q.beginPath();q.roundRect(26,109+z*34,315-z*55+Math.sin(i)*15,15,6);q.fill();}for(let z=0;z<4;z++){q.fillStyle='#34312e';q.beginPath();q.roundRect(25+z*88,h-45,37,10,5);q.fill();}}
 return c;
}
function triangle(src,p,s){const [a,b,c]=p,[u,v,w]=s,den=u[0]*(v[1]-w[1])+v[0]*(w[1]-u[1])+w[0]*(u[1]-v[1]);if(Math.abs(den)<.001)return;const av=(a[0]*(v[1]-w[1])+b[0]*(w[1]-u[1])+c[0]*(u[1]-v[1]))/den,bv=(a[1]*(v[1]-w[1])+b[1]*(w[1]-u[1])+c[1]*(u[1]-v[1]))/den,cv=(a[0]*(w[0]-v[0])+b[0]*(u[0]-w[0])+c[0]*(v[0]-u[0]))/den,dv=(a[1]*(w[0]-v[0])+b[1]*(u[0]-w[0])+c[1]*(v[0]-u[0]))/den,ev=a[0]-av*u[0]-cv*u[1],fv=a[1]-bv*u[0]-dv*u[1];g.save();const center=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3];g.beginPath();p.forEach((q,i)=>{const dx=q[0]-center[0],dy=q[1]-center[1],l=Math.hypot(dx,dy)||1,px=q[0]+dx/l*1.4,py=q[1]+dy/l*1.4;i?g.lineTo(px,py):g.moveTo(px,py);});g.closePath();g.clip();g.transform(av,bv,cv,dv,ev,fv);g.drawImage(src,0,0);g.restore();}
function card(src,x,y,z,scale,ry=0,rz=0){const w=src.width*scale,h=src.height*scale,co=Math.cos(ry),si=Math.sin(ry),cr=Math.cos(rz),sr=Math.sin(rz);const proj=(u,v)=>{let xx=(u-.5)*w,yy=(v-.5)*h,zz=z-xx*si;xx*=co;const k=1600/(1600+zz);return[x+(xx*cr-yy*sr)*k,y+(xx*sr+yy*cr)*k]};for(let a=0;a<3;a++)for(let b=0;b<3;b++){const u=a/3,v=b/3,du=1/3,dv=1/3,ps=[proj(u,v),proj(u+du,v),proj(u+du,v+dv),proj(u,v+dv)],ss=[[u*src.width,v*src.height],[(u+du)*src.width,v*src.height],[(u+du)*src.width,(v+dv)*src.height],[u*src.width,(v+dv)*src.height]];triangle(src,[ps[0],ps[1],ps[2]],[ss[0],ss[1],ss[2]]);triangle(src,[ps[0],ps[2],ps[3]],[ss[0],ss[2],ss[3]]);}}
function montage(t){
 const l=t-7.75,expand=S((l-.32)/.35),pull=1-S((t-9.92)/.36),outer=E((t-8.82)/1.1);
 xmark(960,540,400,.15,t);g.globalAlpha=.17;for(let i=0;i<3;i++){g.strokeStyle='#4c3321';g.lineWidth=1;g.beginPath();g.arc(960,540,210+i*125,0,7);g.stroke();}g.globalAlpha=1;
 const elements=[];for(let i=0;i<3;i++)elements.push({src:cardAssets[i],x:mix(960,490,expand),y:180+i*375,z:0,s:mix(1,.68,outer)*pull,opacity:C((l-i*.12)/.22)});elements.push({src:cardAssets[4],x:mix(960,1420,expand),y:540,z:0,s:mix(1,.68,outer)*pull,opacity:C((l-.43)/.25)});
 for(let col=0;col<6;col++){const x=100+col*352;for(let row=0;row<3;row++){const n=col*3+row,video=n%3===0;elements.push({src:cardAssets[video?4+n%3:n%4],x:mix(960,x,outer),y:50+row*390+(col%2)*75,z:100+Math.sin(n)*160,s:.48*pull,opacity:outer*.8,ry:Math.sin(n+1)*.16,rz:Math.sin(n+2)*.045});}}
 elements.sort((a,b)=>b.z-a.z);elements.forEach(e=>{g.globalAlpha=e.opacity;card(e.src,e.x,e.y,e.z,e.s,e.ry||0,e.rz||0)});g.globalAlpha=1;state.cards=elements.filter(e=>e.opacity>.01).length;
}
function network(t){
 const spin=t>=11.48,pull=S((t-11.6)/.45),angle=(t-10.2)*.065;const ca=Math.cos(angle),sa=Math.sin(angle);
 const points=fields.map((p,i)=>{let xx=p.x*ca-p.z*sa,zz=p.x*sa+p.z*ca,yy=p.y;const k=1800/(1800+zz);let x=960+xx*k,y=540+yy*k;
  if(spin){const a=Math.atan2(y-540,x-960)+pull*5,r=Math.hypot(x-960,y-540)*(1-pull);x=960+Math.cos(a)*r;y=540+Math.sin(a)*r;}
  return{x,y,s:mix(18,47,C((k-.6)/1.4))*(1-pull),red:p.red,z:zz};});
 g.save();g.globalAlpha=C((t-10.19)/.35);for(let i=0;i<points.length;i++){for(let j=i+1;j<Math.min(points.length,i+5);j++){const a=points[i],b=points[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<650)line([[a.x,a.y],[b.x,b.y]],a.red?'#81302538':'#a4a09b18',.8);}}
 points.sort((a,b)=>b.z-a.z).forEach(p=>xmark(p.x,p.y,p.s,0,t,p.red?'#973c35':'#56514d'));g.restore();state.networkPoints=points.length;state.vortex=pull;
}
function ending(t){
 const p=E((t-12.46)/.34);glow(880,340,500,.22);g.save();g.globalAlpha=p;const y=289;flame(724,y,140);const tw=text(P.brand.replace(/X$/,''),865,334,117,P.colors.text,650,'left');const xx=865+tw+58;if(/X$/.test(P.brand)){xmark(xx,286,116,0,t,true);for(let i=1;i<9;i++){g.globalAlpha=p*(1-i/10)*.5;g.save();g.translate(xx+i*17,286-i*12);g.beginPath();path(outer.map(q=>[q[0]*.58,q[1]*.58]));path(inner.map(q=>[q[0]*.58,q[1]*.58]));g.strokeStyle='#a89a8d';g.lineWidth=.9;g.stroke();g.restore();}g.globalAlpha=p;}
 g.restore();if(t>13){g.globalAlpha=E((t-13)/.32);xmark(489,526,87,0,t,true);text(P.text.tagline,565,552,105,P.colors.text,650,'left');g.globalAlpha=1;}
 if(t>13.74){g.globalAlpha=E((t-13.74)/.32);text(P.text.soon,960,735,159,P.colors.text,400,'center','Times New Roman','italic');text(P.website,960,862,30,'#bbb1aa',500);g.globalAlpha=1;}
}
function render(t){t=Math.max(0,Math.min(P.duration,Number(t)||0));time=t;state={time:t};g.globalAlpha=1;background(t);
 if(t<2.58){state.phase='macro-metal-x';const p=S(t/2.65),s=mix(3500,680,p);xmark(mix(560,960,p),mix(700,540,p),s,.8,t,false,mix(.4,0,p),mix(-.23,0,p));}
 else if(t<3.88){state.phase='outlined-x-assumption';xmark(960,540,mix(400,265,S((t-2.58)/.5)),1,t);g.globalAlpha=E((t-3.2)/.28);text(P.text.assumption,960,807,43,'#8b8581');g.globalAlpha=1;}
 else if(t<7.41){state.phase=t<5.04?'x-means-twitter':t<6.08?'glitch-the-meaning':'x-means-question';equation(t);}
 else if(t<7.75){state.phase='meaning-burst';glow(960,540,700,.30);xmark(960,540,265,1,t);}
 else if(t<10.23){state.phase='social-format-expansion';montage(t);}
 else if(t<12.02){state.phase='cross-platform-network';network(t);}
 else if(t<12.46){state.phase='x-reassembly';xmark(960,540,180,1,t);}
 else{state.phase='superx-release-lockup';ending(t);}return state;
}
window.seek=t=>P?render(t):null;window.getState=()=>JSON.parse(JSON.stringify(state));const ready=fetch('project.json').then(r=>r.json()).then(async p=>{P=p;window.project=P;window.duration=P.duration;await document.fonts.load('650 190px Geist');await document.fonts.ready;for(let i=0;i<7;i++)cardAssets.push(createCard(i,i>=4));render(0);if(!new URLSearchParams(location.search).has('render')){const start=performance.now(),tick=n=>{render((n-start)/1000);if(time<P.duration)requestAnimationFrame(tick)};requestAnimationFrame(tick)}});window.ready=()=>ready;
})();
