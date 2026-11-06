/* Original opening: notification -> three urgent questions -> the real handbook.
 * Graphics alone receive shutter sampling. Presenter and captions stay on source time.
 */
(()=>{'use strict';
const {C,E,lerp}=B,OX=1030,WW=890,HH=968;
const sum=document.createElement('canvas'),sample=document.createElement('canvas');
sum.width=sample.width=WW;sum.height=sample.height=HH;
const out=sum.getContext('2d'),g=sample.getContext('2d');
const mix=(a,b,p)=>a.map((v,i)=>lerp(v,b[i],p));
function rr(x,y,w,h,r=16){g.beginPath();g.roundRect(x,y,w,h,r);}
function fill(x,y,w,h,c,r=0){g.fillStyle=c;rr(x,y,w,h,r);g.fill();}
function text(s,x,y,size=36,c=C.ink,weight=800,align='left'){g.font=`${weight} ${size}px CN`;g.fillStyle=c;g.textAlign=align;g.fillText(s,x,y);}
function surface(x,y,w,h,c=C.white,r=16,selected=false){
 g.save();g.shadowColor=selected?'#7451B81C':'#2530431A';g.shadowBlur=24;g.shadowOffsetY=10;fill(x,y,w,h,c,r);g.restore();
 g.strokeStyle=selected?'#B49BD8':'#D8DCE4';g.lineWidth=1.6;rr(x,y,w,h,r);g.stroke();
}
function line(points,c=C.lav,w=3){g.beginPath();g.moveTo(...points[0]);points.slice(1).forEach(p=>g.lineTo(...p));g.strokeStyle=c;g.lineWidth=w;g.lineJoin='round';g.lineCap='round';g.stroke();}
function alpha(a,fn){if(a<=0)return;g.save();g.globalAlpha*=Math.min(1,a);fn();g.restore();}
function spring(t,a,d){let u=Math.max(0,Math.min(1,(t-a)/d));return u===0||u===1?u:1-Math.exp(-8*u)*Math.cos(10*u);}
function picture(r,roi){const im=B.images.home,q=roi||[230,160,1770,970];g.save();rr(...r,14);g.clip();const k=Math.min(r[2]/q[2],r[3]/q[3]);g.drawImage(im,...q,r[0]+(r[2]-q[2]*k)/2,r[1]+(r[3]-q[3]*k)/2,q[2]*k,q[3]*k);g.restore();}
function scene(t){
 g.setTransform(1,0,0,1,-OX,0);g.globalAlpha=1;g.clearRect(OX,0,WW,HH);
 const reveal=E(t,6.65,7.28),exit=E(t,7.15,7.4);
 alpha(1-reveal,()=>{
  // Transparent workspace: only the objects and their soft shadows cover footage.
  const arrival=spring(t,0,.48),paper=E(t,1.55,2.2);
  alpha(1-E(t,1.55,1.82),()=>{
   g.save();g.translate(1470,440+(1-arrival)*-190-42*paper);g.rotate((1-arrival)*-.08);g.scale(.84+.16*arrival,.84+.16*arrival);
   surface(-338,-172,676,334,C.white,20);fill(-306,-135,70,70,'#EEE7F8',16);
   line([[-288,-112],[-272,-123],[-254,-111],[-254,-84],[-288,-84],[-288,-112]],C.purple,3);
   text('工作状态变了',-209,-105,32,C.ink);text('明天起，先办哪件事？',-297,-6,43,C.ink,850);
   fill(-297,42,230,57,C.lav,9);text('离职通知',-271,83,31,C.ink);text('情境示意',300,121,19,C.muted,550,'right');g.restore();
  });
  alpha(E(t,.25,.6),()=>{text('如果明天',1100,144,44);const p=spring(t,.62,.5);g.save();g.translate(1100,254+(1-p)*75);g.scale(1+.08*(1-p),1+.08*(1-p));alpha(E(t,.62,.82),()=>text('突然失业',0,0,79,C.purple,900));g.restore();});
  alpha(E(t,1.80,2.20),()=>{
   text('第一步，做什么？',1102,356,48,C.ink,850);
   alpha(1-E(t,3.43,3.78),()=>{g.save();g.translate(1465,665);g.rotate(-.10+.10*E(t,1.65,2.7));text('？',0,0,246,C.purple,900,'center');g.restore();line([[1150,750],[1783,750]],'#DBD6E5',2);});
   const names=['找工作？','核对补偿？','失业金怎么领？'],starts=[3.50,4.36,5.32];
   names.forEach((name,i)=>{const p=spring(t,starts[i],.48),fade=E(t,starts[i],starts[i]+.22),x=1105+(1-p)*145,y=417+i*128;
    alpha(fade,()=>{surface(x,y,730,105,i===2?'#E6D9FA':C.white,16,i===2);text(`0${i+1}`,x+24,y+67,34,C.purple);text(name,x+110,y+68,43,C.ink,800);line([[x+650,y+38],[x+672,y+53],[x+650,y+67]],C.purple,3);});
   });
   alpha(E(t,6.05,6.4),()=>{line([[1115,843],[1820,843]],C.lav,2);text('先把下一步，理清楚',1115,899,34,C.ink,700);});
  });
 });
 if(reveal>0){
  g.save();const edge=1040+880*reveal;g.beginPath();g.moveTo(1020,0);g.lineTo(edge-65,0);g.lineTo(edge+65,968);g.lineTo(1020,968);g.closePath();g.clip();
  const r=mix([1060,50,820,875],[1080,155,780,690],exit);fill(...r,C.white,20);
  picture([r[0]+2,r[1]+49,r[2]-4,r[3]-51],[230,180,1200,1050]);
  fill(r[0],r[1],r[2],48,C.ink,18);fill(r[0],r[1]+25,r[2],23,C.ink);
  ['#EB7C72','#DAC17B','#97BC9B'].forEach((c,i)=>fill(r[0]+20+i*18,r[1]+18,9,9,c,5));
  text('本期真实产品',r[0]+93,r[1]+32,21,C.white,650);text((window.__UI_MOTION_BINDINGS__?.props?.mode==='demo'?'素材示意':'真实网页'),r[0]+r[2]-18,r[1]+32,18,'#DEDEE4',550,'right');
  g.restore();
  alpha(Math.sin(Math.PI*reveal)*.7,()=>line([[edge-65,36],[edge+60,930]],C.lav,8));
 }
}
window.drawOpening=t=>{
 out.setTransform(1,0,0,1,0,0);out.clearRect(0,0,WW,HH);out.globalCompositeOperation='lighter';
 const moving=[[0,.55],[.62,1.2],[1.55,2.2],[3.5,4.05],[4.36,4.91],[5.32,5.87],[6.65,7.4]].some(([a,b])=>t>=a&&t<b),n=moving?5:1;
 for(let i=0;i<n;i++){scene(Math.max(0,t-(n===1?0:.022*(1-i/(n-1)))));out.globalAlpha=1/n;out.drawImage(sample,0,0);}
 out.globalAlpha=1;out.globalCompositeOperation='source-over';
 // The whole opening stays above the presenter's extended forearm.
 // Map the old panel origin (1060,36) to (1180,40), preserving proportions.
 B.g.save();B.g.translate(353.2,11.92);B.g.scale(.78,.78);B.g.drawImage(sum,OX,0);B.g.restore();
};
})();
