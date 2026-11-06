/* Independent dedicated Canvas reconstruction, no source video/images. */
(() => {
 'use strict';
 const canvas=document.getElementById('film'),g=canvas.getContext('2d');
 let project,C,duration=449/30,current=0,dots=[],loaded;
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),mix=(a,b,u)=>a+(b-a)*u;
 const smooth=u=>{u=clamp(u);return u*u*(3-2*u)},ease=u=>1-Math.pow(1-clamp(u),3);
 const range=(t,a,b)=>clamp((t-a)/(b-a));
 const spring=(t,w=17,z=.69)=>{if(t<=0)return 0;const d=w*Math.sqrt(1-z*z);return 1-Math.exp(-z*w*t)*(Math.cos(d*t)+z*w/d*Math.sin(d*t))};
 const rnd=n=>{const x=Math.sin(n*97.319+149)*49371.725;return x-Math.floor(x)};
 function rect(x,y,w,h,color){g.fillStyle=color;g.fillRect(x,y,w,h)}
 function circle(x,y,r,color){if(r<=0)return;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=color;g.fill()}
 function line(x,y,X,Y,color,w=1){g.beginPath();g.moveTo(x,y);g.lineTo(X,Y);g.strokeStyle=color;g.lineWidth=w;g.stroke()}
 function poly(p,color){g.beginPath();p.forEach((a,i)=>i?g.lineTo(...a):g.moveTo(...a));g.closePath();g.fillStyle=color;g.fill()}
 function text(s,x,y,size,f='Anton',color=C.cream,align='center'){g.fillStyle=color;g.font=`${size}px ${f}`;g.textAlign=align;g.textBaseline='alphabetic';if(f==='Anton'){g.save();g.translate(x,y);g.scale(1.24,1);g.fillText(s,0,0);g.restore()}else if(f==='FilmItalic'){g.save();g.translate(x,y);g.transform(1,0,-.13,1,0,0);g.fillText(s,0,0);g.restore()}else g.fillText(s,x,y)}
 function layer(alpha,fn){g.save();g.globalAlpha*=clamp(alpha);fn();g.restore()}
 function bez(u){const v=1-u;return [v*v*v*280+3*v*v*u*507+3*v*u*u*653+u*u*u*1000,v*v*v*547+3*v*v*u*547+3*v*u*u*173+u*u*u*173]}
 function easing(t){
  line(280,547,507,547,'#696252');line(653,173,1000,173,'#696252');
  for(const p of [[280,547],[1000,173]]){g.save();g.translate(...p);g.rotate(Math.PI/4);rect(-3,-3,6,6,C.cream);g.restore()}
  for(const p of [[507,547],[653,173]]){g.strokeStyle=C.cream;g.lineWidth=1;g.strokeRect(p[0]-3,p[1]-3,6,6)}
  g.beginPath();for(let i=0;i<=100*ease(t/.3);i++){const p=bez(i/100);i?g.lineTo(...p):g.moveTo(...p)}g.strokeStyle='#aca183';g.lineWidth=1;g.stroke();
  const u=1-Math.pow(1-range(t,.4,.89),2.35);for(let k=4;k>=0;k--){const p=bez(clamp(u-k*.035));layer(k?(.11+(4-k)*.03):1,()=>{g.shadowColor=C.gold;g.shadowBlur=k?0:55;circle(...p,k?18:16,C.gold)})}
  text('cubic-bezier(.83, 0, .17, 1)',280,592,14,'Mono','#aca183','left');
 }
 function typography(t){rect(0,0,1280,720,C.gold);if(t<1.8){const sizes=[345,345,345],xs=[436,610,815];
   ['1','0','0'].forEach((s,i)=>{const u=spring(t-1-i*.06,21,.74);const y=518-[0,4,28][i]+mix(i%2?500:-500,0,u);for(let j=3;j>0;j--)layer(.055,()=>text(s,xs[i],y+Math.sin((t-1)*20)*j*18*Math.exp(-(t-1)*6),sizes[i],'Anton',C.dark));text(s,xs[i],y,sizes[i],'Anton',C.dark)});
  }else{layer(smooth(range(t,1.8,1.97)),()=>{text('one hundred',640,403,180,'FilmItalic',C.dark)});layer(smooth(range(t,2.02,2.13)),()=>text('EYEZONBOT USERS',640,469,23,'Anton',C.dark))}
 }
 function morphShape(t){
  const a=mix(0,Math.PI/2,smooth(range(t,2.72,3.55))),deg=a*180/Math.PI;
  g.save();g.translate(640,360);g.rotate(a);g.strokeStyle='#69675f';g.lineWidth=1;g.strokeRect(-154,-154,308,308);[[-154,-154],[0,-154],[154,-154],[154,0],[154,154],[-154,154]].forEach(p=>circle(...p,3.8,C.cream));g.restore();
  text(`ROT ${deg.toFixed(1).padStart(5,'0')}°`,840,211,13,'Mono','#999584','left');text('SHAPE '+(t<2.72?'CIRCLE':t<3?'SQUARE':t<3.3?'TRIANGLE':'EYE'),840,232,13,'Mono','#999584','left');
  g.save();g.translate(640,360);
  if(t<3.3){g.rotate(a*.24);let p=[];const square=smooth(range(t,2.5,2.75)),tri=smooth(range(t,2.98,3.15));
   for(let i=0;i<120;i++){const angle=-Math.PI/2+i/120*Math.PI*2,cx=Math.cos(angle)*112,cy=Math.sin(angle)*112;const sr=103/Math.max(Math.abs(Math.cos(angle)),Math.abs(Math.sin(angle)));const sx=Math.cos(angle)*sr,sy=Math.sin(angle)*sr;
    const edge=i/120*3,seg=Math.floor(edge),u=edge-seg;const T=[[0,-126],[109,63],[-109,63]],A=T[seg%3],B=T[(seg+1)%3];p.push([mix(mix(cx,sx,square),mix(A[0],B[0],u),tri),mix(mix(cy,sy,square),mix(A[1],B[1],u),tri)])}
   poly(p,t>2.87&&t<3.2?C.magenta:C.pale_gold);
  }else{g.rotate(.43);const u=smooth(range(t,3.3,3.65));g.beginPath();g.moveTo(-134,0);g.bezierCurveTo(-75,-mix(115,87,u),75,-mix(115,87,u),134,0);g.bezierCurveTo(75,mix(100,87,u),-75,mix(100,87,u),-134,0);g.fillStyle=C.pale_gold;g.fill();circle(0,0,39*spring(t-3.42,23,.77),C.dark)}g.restore();
 }
 function halftone(t){
  rect(0,0,1280,720,C.cream);const wave=(t-4)*2250;
  for(const d of dots){const dist=Math.hypot(d.x-640,d.y-350),ring=Math.exp(-Math.pow((dist-wave)/75,2));let r=d.on?7.5:1.6;let color=d.on?C.dark:'#b2aa96';if(t<4.7&&ring>.075){r=mix(r,6.8,ring);color=C.magenta}circle(d.x,d.y,r,color)}
  layer(smooth(range(t,4.95,5.12))*(1-smooth(range(t,5.35,5.5))),()=>text('+17 THIS WEEK',640,630,15,'Mono',C.magenta));
 }
 const bars=[[0,9,100],[4,8,115],[8,9,128],[9,6,130],[9,4,146],[4,6,222],[5,6,218],[5,5,222],[5,2,190],[6,3,184],[6,8,210],[6,5,152],[7,5,140],[8,4,146],[7,7,130],[5,8,118],[8,7,162]];
 function iso(t){
  layer(smooth(range(t,5.5,5.7)),()=>{text('100',115,222,118,'Anton',C.cream,'left');text('USERS · 10 × 10',115,258,18,'Mono','#8d8778','left')});
  layer(smooth(range(t,6.37,6.55)),()=>{text('+17',1168,222,118,'Anton',C.magenta,'right');text('NEW THIS WEEK',1168,258,18,'Mono','#8d8778','right')});
  const tilt=.07*(1-smooth(range(t,5.5,6.9))),ca=Math.cos(tilt),sa=Math.sin(tilt);
  const point=(i,j,z=0)=>{const xx=(i-j)*29.2,yy=(i+j-10)*17.4;return [640+xx*ca-yy*sa,442+xx*sa+yy*ca-z]};
  function cube(i,j,h,pink){const p=[point(i,j,h),point(i+1,j,h),point(i+1,j+1,h),point(i,j+1,h)],b=[point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)];
   poly([p[3],p[2],b[2],b[3]],pink?'#88125a':'#777368');poly([p[1],p[2],b[2],b[1]],pink?'#b31970':'#9d9787');poly(p,pink?C.magenta:C.cream);g.strokeStyle=C.dark;g.lineWidth=.8;g.beginPath();p.forEach((v,k)=>k?g.lineTo(...v):g.moveTo(...v));g.closePath();g.stroke()}
  let entries=[];for(let i=0;i<10;i++)for(let j=0;j<10;j++){const bar=bars.findIndex(b=>b[0]===i&&b[1]===j),base=12+Math.sin((i+j)*.62+(t-5.5)*8)*14*(1-smooth(range(t,5.5,6.3)));const height=bar<0?base:base+bars[bar][2]*spring(t-6.13-bar*.018,14,.78);entries.push({i,j,h:Math.max(4,height),pink:bar>=0&&t>6.13+bar*.018})}
  entries.sort((a,b)=>(a.i+a.j)-(b.i+b.j));entries.forEach(a=>cube(a.i,a.j,a.h,a.pink));
 }
 function particles(t){
  const expand=spring(t-7.5,17,.76),collapse=1-smooth(range(t,9.53,9.86)),scale=expand*collapse,rot=(t-7.5)*.7-2.21;
  function pos(a,u,delta=0){const angle=a*Math.PI*2/5+rot+u*.83+delta;const r=300*u*scale;return [640+Math.cos(angle)*r*1.1,375+Math.sin(angle)*r*.65]}
  const points=[];for(let a=0;a<5;a++)for(let k=0;k<20;k++){const u=.13+.87*(k+1)/20;points.push({a,u,...{p:pos(a,u)}})}points.sort((a,b)=>a.p[1]-b.p[1]);
  for(let n=0;n<1250;n++){const a=n%5,u=rnd(n+7),p=pos(a,u,(rnd(n+52)-.5)*.23),r=.55+rnd(n+94)*1.9;layer(.25+rnd(n+2)*.55,()=>{g.beginPath();g.ellipse(p[0]+(rnd(n+63)-.5)*54*scale,p[1]+(rnd(n+14)-.5)*54*scale,r*scale*2.2,r*scale*.42,.45,0,Math.PI*2);g.fillStyle=C.gold;g.fill()})}
  points.forEach(({u,p})=>circle(...p,(1.6+u*3.8)*Math.max(.03,scale),u>.85?C.magenta:C.gold));
  layer(smooth(range(t,8.02,8.19))*(1-smooth(range(t,9.48,9.72))),()=>text('100 users. one orbit.',640,635,38,'FilmItalic',C.cream));if(t>9.85)circle(640,375,3*(1-smooth(range(t,9.9,10))),C.magenta);
 }
 function eyeLogo(x,y,size){
  g.save();g.translate(x,y);g.scale(size/134,size/134);
  rect(-67,-67,134,134,C.gold);circle(0,0,67,C.dark);
  for(const r of[60,53]){g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.strokeStyle=C.gold;g.lineWidth=4;g.stroke()}
  g.beginPath();g.moveTo(-45,0);g.bezierCurveTo(-24,-28,24,-28,45,0);g.bezierCurveTo(24,28,-24,28,-45,0);g.strokeStyle=C.gold;g.lineWidth=2;g.stroke();circle(0,0,20,C.gold);g.beginPath();g.arc(0,0,24,0,Math.PI*2);g.stroke();circle(-7,-7,3,C.dark);g.restore();
 }
 function gravity(t){
  const u=range(t,10,10.3);if(t<10.3){for(let k=0;k<8;k++){const r=(u*820-k*35);if(r>0){g.beginPath();g.arc(640,360,r,0,Math.PI*2);g.strokeStyle='#6d552c';g.lineWidth=2;g.stroke()}}}
  layer(smooth(range(t,10,10.14)),()=>eyeLogo(640,360,134));
  const str='100 USERS - SEE THE AURA FIRST - EYEZONBOT - '.repeat(2),rotation=(t-10)*.6-1.5;
  layer(smooth(range(t,10.15,10.4)),()=>{for(let i=0;i<str.length;i++){const a=i/str.length*Math.PI*2+rotation-Math.PI/2;g.save();g.translate(640+Math.cos(a)*205,360+Math.sin(a)*205);g.rotate(a+Math.PI/2);const j=i%43;text(str[i],0,0,22,'Anton',j<3?C.gold:C.cream);g.restore()}});
 }
 function rhythm(t){const i=Math.min(3,Math.floor((t-11)/.375)),words=['THANK','YOU','ONE','HUNDRED'],background=[C.gold,C.magenta,C.cream,'#120f09'],fg=[C.dark,C.cream,C.dark,C.pale_gold],u=(t-11-i*.375);rect(0,0,1280,720,background[i]);const x=640+mix(250,0,spring(u,36,.85));for(let j=5;j>0;j--)layer(.06,()=>text(words[i],x+j*17*(1-ease(u/.13)),445,193,'Anton',fg[i]));text(words[i],x,445,193,'Anton',fg[i])}
 function end(t){layer(smooth(range(t,12.5,12.84)),()=>{eyeLogo(410,321,100);text('EyezOn',489,368,121,'DisplaySerif',C.cream,'left')});layer(smooth(range(t,12.98,13.14)),()=>circle(899,374,12,C.gold));layer(smooth(range(t,13.28,13.45)),()=>text('100 users · thank you',640,449,40,'FilmItalic',C.pale_gold));layer(smooth(range(t,13.65,13.83)),()=>text('@EYEZONBOT · EYEZON.GG',640,493,18,'Mono','#a79d7b'))}
 function frame(t){
  const labels=[[0,'01 EASING'],[1,'02 TYPOGRAPHY'],[2.5,'03 SHAPE'],[4,'04 HALFTONE'],[5.5,'05 DIMENSION'],[7.5,'06 PARTICLES'],[10,'07 GRAVITY'],[11,'08 RHYTHM'],[12.5,'09 FIN.']];const label=labels.filter(a=>a[0]<=t).at(-1)[1];
  text(label,37,39,13,'Mono',t>=11&&t<12.125?C.cream:C.magenta,'left');text("EYEZON – SHOWREEL '26",1243,39,13,'Mono',t>=11&&t<12.125?C.cream:'#8b846c','right');const count=Math.ceil(t*30)+1,sec=Math.floor(count/30),ff=count%30;
  text(`00:00:${String(sec).padStart(2,'0')}:${String(ff).padStart(2,'0')}`,37,678,12,'Mono','#8b846c','left');text('120 BPM · 30 FPS',1243,678,12,'Mono','#8b846c','right');line(37,695,1243,695,'#575045');for(let k=1;k<15;k++)line(37+k/15*1206,691,37+k/15*1206,699,'#77715b');line(37,695,37+1206*t/15,695,C.magenta,2);
 }
 function seek(t){if(!C)return;current=clamp(Number(t)||0,0,duration);t=current;g.reset();rect(0,0,1280,720,C.dark);if(t<1)easing(t);else if(t<2.5)typography(t);else if(t<4)morphShape(t);else if(t<5.5)halftone(t);else if(t<7.5)iso(t);else if(t<10)particles(t);else if(t<11)gravity(t);else if(t<12.5)rhythm(t);else end(t);frame(t);if(t>14.55)layer(smooth(range(t,14.55,duration)),()=>rect(0,0,1280,720,C.dark));return getState()}
 function getState(){return{time:current,duration,scene:project?.scenes.find(s=>current>=s.start&&current<s.end)?.name||'end',referenceSlug:'sudiyasa-f48ac9',sourceImagesLoaded:0,particleArms:5}}
 function ready(){if(!loaded)loaded=(async()=>{project=await(await fetch('project.json')).json();C=project.palette;duration=project.duration;window.duration=duration;await Promise.all(['425px Anton','176px FilmItalic','128px DisplaySerif','18px Mono'].map(s=>document.fonts.load(s)));await document.fonts.ready;const m=document.createElement('canvas');m.width=1280;m.height=720;const q=m.getContext('2d',{willReadFrequently:true});q.font='345px Anton';q.fillStyle='#fff';q.textAlign='center';q.save();q.translate(640,500);q.scale(1.24,1);q.fillText('100',0,0);q.restore();const data=q.getImageData(0,0,1280,720).data;for(let y=10;y<720;y+=20)for(let x=10;x<1280;x+=20)dots.push({x,y,on:data[(y*1280+x)*4+3]>120});seek(0);return true})();return loaded}
 window.seek=seek;window.ready=ready;window.getState=getState;window.duration=duration;
 ready().then(()=>{if(!new URLSearchParams(location.search).has('render')){const start=performance.now();function tick(now){seek(((now-start)/1000)%duration);requestAnimationFrame(tick)}requestAnimationFrame(tick)}});
})();
