/* Independent authored reconstruction, case 133. No source image or video at runtime.
   All positions, paths, meshes and particle motion are direct functions of time. */
(() => {
 'use strict';
 const cvs=document.getElementById('stage'),ctx=cvs.getContext('2d');
 const TAU=Math.PI*2,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
 const lerp=(a,b,p)=>a+(b-a)*p,sm=(a,b,t)=>{let p=clamp((t-a)/(b-a));return p*p*(3-2*p)};
 const out=p=>1-Math.pow(1-clamp(p),4),back=p=>{p=clamp(p)-1;return 1+p*p*(2.7*p+1.7)};
 const rand=(i,k=1)=>{let n=Math.sin(i*127.1+k*311.7+133.133)*43758.5453;return n-Math.floor(n)};
 const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
 const mix=(a,b,p)=>'#'+rgb(a).map((v,i)=>Math.round(lerp(v,rgb(b)[i],p)).toString(16).padStart(2,'0')).join('');
 let C,time=0,readyPromise,timeTargets=[],noiseTexture;
 let P={dark:'#171415',paper:'#f2ece3',orange:'#ff4b21',yellow:'#f9bb20',blue:'#303bea',ink:'#101013'};
 const font=(size,f='Geist',weight=400)=>`${weight} ${size}px ${f}`;
 function text(s,x,y,size=16,color=P.ink,f='Geist',weight=400,align='left',width=null){
  ctx.save();ctx.font=font(size,f,weight);ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline='alphabetic';
  if(width){let w=ctx.measureText(s).width;ctx.translate(x,y);ctx.scale(width/w,1);ctx.fillText(s,0,0)}else ctx.fillText(s,x,y);ctx.restore();
 }
 const rect=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)};
 const line=(a,b,c,d,color,width=1)=>{ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(c,d);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()};
 function circle(x,y,r,c){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=c;ctx.fill()}
 function path(points,c){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=c;ctx.fill()}
 function background(dark=false,color=null){
  rect(0,0,1280,720,color||(dark?P.dark:P.paper));
  if(dark){let g=ctx.createRadialGradient(650,360,60,650,360,780);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.6)');ctx.fillStyle=g;ctx.fillRect(0,0,1280,720)}
 }
 function overlay(t,chapter,ease,dark=false){
  const color=dark?P.paper:P.ink;ctx.save();ctx.globalAlpha=.9;
  for(const [x,y,sx,sy] of [[18,18,1,1],[1262,18,-1,1],[18,702,1,-1],[1262,702,-1,-1]]){line(x,y,x+16*sx,y,color);line(x,y,x,y+16*sy,color)}
  text("CLAUDE / MOTION DESIGN REEL ’26",42,41,13,color,'JMono');
  let fr=Math.ceil(clamp(t,0,14.999)*30-1e-8)+1,secs=Math.floor(fr/30),ff=fr%30;
  text(`TC 00:00:${String(secs).padStart(2,'0')}:${String(ff).padStart(2,'0')}`,1238,41,13,color,'JMono',400,'right');
  text(chapter,42,677,13,color,'JMono');text('EASE '+ease,1238,677,13,color,'JMono',400,'right');
  for(let i=0;i<32;i++){ctx.globalAlpha=i<Math.floor(t/15*32)?.9:.35;line(42+i*37.5,694,42+i*37.5,694-(i%4===0?10:5),color)}
  line(42+t/15*1195,687,42+t/15*1195,699,P.orange,1.4);
  ctx.restore();
 }
 function roundedRect(x,y,w,h,r,c){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=c;ctx.fill()}
 function resume(t,ending=false){
  background(true);let local=ending?t-13.1:t;
  let e=ending?out(local/.4):back(local/.65);
  let scale=lerp(.88,ending?1.016:1,e),rot=ending?lerp(.03,0,sm(13.1,13.65,t)):lerp(-.03,0,sm(.08,.9,t));
  ctx.save();ctx.translate(640,360+lerp(900,0,e));ctx.rotate(rot);ctx.scale(scale,scale);ctx.translate(-640,-360);
  ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=22;ctx.shadowOffsetY=10;
  roundedRect(107,79,1066,562,3,P.paper);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  let reveal=(start,end)=>ending?1:sm(start,end,t);
  const alpha=(a,b,fn)=>{ctx.save();ctx.globalAlpha=reveal(a,b);fn();ctx.restore()};
  text('CURRICULUM VITAE',160,126,14,'#66615c','JMono');text('NO. 001 — MOTION',621,126,14,'#66615c','JMono');text('2026',1120,126,14,'#66615c','JMono',400,'right');
  line(160,144,1120,144,P.ink,1.6);
  // Independently set serif letters land on the observed baseline.
  const word='Claude';ctx.font=font(206,'DisplaySerif');let natural=ctx.measureText(word).width,scaleX=426/natural;
  ctx.save();ctx.translate(153,320);ctx.scale(scaleX,1);let x=0;
  for(let i=0;i<word.length;i++){let a=ending?sm(13.12+i*.016,13.52+i*.016,t):sm(.22+i*.04,.54+i*.04,t);ctx.save();ctx.globalAlpha=a;ctx.translate(x,lerp(55,0,out(a)));ctx.rotate(ending?lerp((i%2?1:-1)*.25,0,a):0);ctx.fillStyle=P.ink;ctx.fillText(word[i],0,0);ctx.restore();x+=ctx.measureText(word[i]).width}ctx.restore();
  alpha(.38,.68,()=>text('Motion Designer',160,398,40,P.ink,'Archivo',700,null,315));
  alpha(.55,.95,()=>{text('Makes things move — on the beat, on the',159,454,29,'#494641','SerifItalic',400,'left',419);text('grid, on purpose.',159,487,29,'#494641','SerifItalic')});
  let rows=[['Type','kinetic typography'],['Form','shape & 2D systems'],['Space','3D, camera & light'],['Time','rhythm & simulation']];
  alpha(.32,.5,()=>text('SKILLS',707,185,14,'#66615c','JMono'));
  for(let i=0;i<4;i++)alpha(.38+i*.1,.65+i*.1,()=>{
   let y=199+i*65;line(707,y,1120,y,P.ink,1);text(String(i+1).padStart(2,'0'),707,y+36,13,'#66615c','JMono');text(rows[i][0],760,y+45,40,P.ink,'Archivo',700,'left');text(rows[i][1],i===3?920:928,y+37,13,'#5b5651','JMono');
  });alpha(.72,1,()=>line(707,459,1120,459,P.ink,1));
  alpha(.75,1.05,()=>{text('TOOLS',707,556,14,'#66615c','JMono');text('GSAP · Three.js · Canvas · HTML',768,556,13,P.ink,'JMono')});
  alpha(.62,1,()=>{line(160,582,1120,582,P.ink,1.4);text('REEL · 15 SEC · 128 BPM · 1920×1080',160,607,14,'#66615c','JMono');text('P. 1 / 1',1120,607,14,'#66615c','JMono',400,'right')});
  let dot=ending?sm(13.85,14.15,t):sm(.7,.84,t);
  if(!ending&&t>1.48){let p=sm(1.48,1.78,t),dx=lerp(604,800,p),dy=lerp(312,203,p);circle(dx,dy,15*(1+2*sm(1.67,1.83,t)),P.orange)}
  else if(dot>0){ctx.save();ctx.translate(604,306);ctx.scale(ending?1:1.4,ending?1:lerp(.65,.12,sm(1.25,1.43,t)));circle(0,0,15*dot,P.orange);ctx.restore()}
  if(ending){let p=sm(14,14.22,t);rect(160,410,315*p,5,P.orange);let av=sm(14.38,14.62,t);ctx.save();ctx.globalAlpha=av;text('AVAILABLE FOR WORK',757,607,14,P.ink,'JMono',400,'center');circle(884,602,3,P.orange);ctx.restore();for(let i=0;i<4;i++){let a=back(clamp((t-14.12-i*.18)/.3));if(a<=0)continue;ctx.save();ctx.translate(1108,230+i*65);ctx.scale(a,a);badge(i,t);ctx.restore()}}
  ctx.restore();
  overlay(t,ending?'05 – HIRE ME':'00 – RÉSUMÉ',ending?'back.out(3)':'back.out(3)',true);
  if(!ending&&t>1.7){let p=sm(1.7,1.84,t);circle(800,205,p*1480,P.orange)}
 }
 function badge(i,t){
  if(i===0){roundedRect(-17,-17,34,34,1.6,P.ink);text('T',0,11,29,P.paper,'Archivo',900,'center')}
  else if(i===1){circle(-9,-9,8,P.orange);rect(2,-17,16,16,P.blue);path([[-17,17],[-17,1],[-1,17]],P.yellow);ctx.beginPath();ctx.moveTo(17,17);ctx.arc(17,17,16,Math.PI,Math.PI*1.5);ctx.closePath();ctx.fillStyle=P.ink;ctx.fill()}
  else if(i===2){path([[-18,-8],[2,-17],[20,-7],[0,2]],P.paper);path([[-18,-8],[0,2],[0,22],[-20,11]],P.blue);path([[0,2],[20,-7],[18,13],[0,22]],P.ink);ctx.strokeStyle=P.ink;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-18,-8);ctx.lineTo(2,-17);ctx.lineTo(20,-7);ctx.lineTo(18,13);ctx.lineTo(0,22);ctx.lineTo(-20,11);ctx.closePath();ctx.stroke()}
  else{circle(0,0,11,'#d5d2ca');circle(0,0,8.5,P.paper);line(0,0,0,-7,P.ink,1.3);line(0,0,6,1,P.orange,1.4);circle(0,0,1.5,P.ink)}
 }
 function fittedGlyph(s,x,y,w,h,f='Archivo',weight=900,stroke=false){
  ctx.save();ctx.font=font(300,f,weight);let m=ctx.measureText(s),fh=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
  ctx.translate(x,y);ctx.scale(w/m.width,h/fh);ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=P.ink;
  if(stroke){ctx.strokeStyle=P.ink;ctx.lineWidth=1.2;ctx.strokeText(s,0,m.actualBoundingBoxAscent)}else ctx.fillText(s,0,m.actualBoundingBoxAscent);ctx.restore();
 }
 function type(t){
  background(false,P.orange);let width=lerp(684,980,sm(2.28,2.58,t)),height=lerp(258,196,sm(2.28,2.58,t)),x=640-width/2,y=360-height/2;
  let serif=sm(3.28,3.5,t),weight=Math.round(lerp(900,170,sm(3.05,3.33,t)));
  if(serif<1){ctx.save();ctx.globalAlpha=1-serif;
   if(t<2.18){const chars='TYPE';let each=width/4;for(let i=0;i<4;i++){let p=out((t-1.83-i*.035)/.26);fittedGlyph(chars[i],x+i*each,y-600*(1-p),each*.98,height,'Archivo',900)}}
   else fittedGlyph('TYPE',x,y,width,height,'Archivo',weight);
   if(t>2.78){ctx.globalAlpha=sm(2.78,3,t)*.7*(1-serif);for(const off of [-252,152,344])fittedGlyph('TYPE',132,y+off,1010,height,'Archivo',900,true)}
   line(0,y+4,1280,y+4,'#a4341b',1);line(0,y+height+10,1280,y+height+10,'#a4341b',1);ctx.restore();
  }
  if(serif>0){ctx.save();ctx.globalAlpha=serif;let depth=72*sm(3.68,3.96,t),bob=Math.sin((t-3.7)*2.1)*11;ctx.translate(640,390+bob);ctx.rotate(-.055*sm(3.75,4.15,t));
   ctx.font=font(390,'SerifItalic');let m=ctx.measureText('type'),w=596,sy=350/(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent);ctx.scale(w/m.width,sy);
   ctx.textAlign='left';let gx=-m.width/2,baseline=(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;
   ctx.fillStyle=P.ink;for(let d=depth;d>=0;d-=1.5)ctx.fillText('type',gx+d*.72/(w/m.width),baseline+d/(sy));
   ctx.fillStyle=P.paper;ctx.fillText('type',gx,baseline);ctx.restore();
  }
  if(t>3.86){let p=back(clamp((t-3.86)/.28)),ang=(t-4)*.9;ctx.save();ctx.translate(1065,210);ctx.scale(p,p);ctx.rotate(ang);circle(0,0,108,P.ink);ctx.beginPath();ctx.arc(0,0,69,0,TAU);ctx.strokeStyle=P.orange;ctx.lineWidth=2;ctx.stroke();
   let ring='ON THE BEAT  •  KINETIC TYPE  •  VARIABLE AXES  •  ';ctx.font=font(16,'Archivo',900);for(let i=0;i<ring.length;i++){ctx.save();ctx.rotate(-Math.PI/2+i/ring.length*TAU);text(ring[i],0,-90,16,P.paper,'Archivo',900,'center');ctx.restore()}text('01',0,18,56,P.orange,'SerifItalic',400,'center');ctx.restore();
  }
  text('FAMILY  Archivo VF',40,569,14,P.ink,'JMono');text('WDTH    '+lerp(62,125,sm(2.28,2.58,t)).toFixed(1).padStart(5,'0'),40,592,14,P.ink,'JMono');text('WGHT    '+Math.round(t>3.3?lerp(170,900,sm(3.3,3.75,t)):weight),40,615,14,P.ink,'JMono');
  overlay(t,'01 – TYPE',t<3.3?'expo.out':'power4.out');
 }
 function formLetters(t,alpha=1){
  ctx.save();ctx.globalAlpha=alpha;let shift=t<4.8?lerp(80,0,out((t-4.6)/.2)):0;ctx.translate(0,shift);
  // Geometric F/O/R/M; shape boundaries are authored vectors rather than a text screenshot.
  path([[125,224],[193,224],[193,226],[301,226],[301,294],[193,294],[193,330],[281,330],[281,397],[193,397],[193,497],[125,497]],P.ink);
  circle(473,360,134,P.orange);
  ctx.beginPath();ctx.moveTo(646,224);ctx.lineTo(710,224);ctx.bezierCurveTo(820,216,821,352,716,375);ctx.lineTo(835,494);ctx.lineTo(646,497);ctx.closePath();ctx.fillStyle=P.ink;ctx.fill();
  path([[885,224],[954,224],[954,225],[1085,225],[1085,224],[1154,224],[1154,497],[1085,497],[1085,234],[1021,417],[954,234],[954,497],[885,497]],P.ink);
  ctx.restore();
 }
 // Eight columns by four rows, transcribed from the enlarged 6.125 s and 7.0 s views.
 // Shape types: square, circle, semicircle, quarter disc and triangle. Rotations are radians.
 const grid=[
  ['q',3,0,'blue','yellow'],['s',0,0,'ink','orange'],['h',3,0,'yellow','ink'],['c',0,0,'blue','yellow'],['tri',0,.30,'ink','orange'],['q',2,0,'yellow','ink'],['s',0,0,'blue','yellow'],['h',2,0,'ink','orange'],
  ['tri',1,.30,'yellow','ink'],['c',0,0,'orange','orange'],['q',1,0,'ink','orange'],['s',0,0,'yellow','ink'],['h',2,0,'blue','yellow'],['empty',0,0,'ink','ink'],['q',0,0,'blue','yellow'],['tri',1,0,'orange','blue'],
  ['h',1,0,'ink','orange'],['q',2,0,'orange','blue'],['s',0,0,'blue','yellow'],['tri',2,-.12,'ink','orange'],['q',3,0,'yellow','ink'],['s',0,0,'ink','orange'],['c',0,0,'yellow','ink'],['h',3,0,'blue','yellow'],
  ['s',0,0,'yellow','ink'],['h',2,0,'blue','yellow'],['empty',0,0,'ink','ink'],['q',1,0,'blue','yellow'],['tri',2,0,'yellow','ink'],['h',0,0,'orange','blue'],['q',3,0,'ink','orange'],['s',0,0,'yellow','ink']
 ];
 function shapeOutline(kind,orient=0){
  let p=[],r=.45;
  if(kind==='s')p=[[-r,-r],[r,-r],[r,r],[-r,r]];
  if(kind==='c')for(let i=0;i<40;i++)p.push([r*Math.cos(i/40*TAU),r*Math.sin(i/40*TAU)]);
  if(kind==='tri')p=[[-r,-r],[r,-r],[-r,r]];
  if(kind==='h'){p.push([-r,0]);for(let i=0;i<=24;i++)p.push([r*Math.cos(Math.PI-i/24*Math.PI),-r*Math.sin(Math.PI-i/24*Math.PI)])}
  if(kind==='q'){p.push([-r,-r]);for(let i=0;i<=24;i++)p.push([-r+.9*Math.cos(i/24*Math.PI/2),-r+.9*Math.sin(i/24*Math.PI/2)])}
  let a=orient*Math.PI/2;return p.map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]);
 }
 function flatGrid(t){
  let entry=sm(5.24,5.8,t),swap=sm(6.5,6.86,t);let u=133.333,x0=106.667,y0=93.333;
  ctx.save();ctx.globalAlpha=sm(5.25,5.5,t);for(let c=0;c<=8;c++)line(x0+c*u,74,x0+c*u,646,'#bcb9b3',1.7);for(let r=0;r<=4;r++)line(87,y0+r*u,1193,y0+r*u,'#bcb9b3',1.7);ctx.restore();
  for(let i=0;i<32;i++){
   const [kind,ori,base,col1,col2]=grid[i];if(kind==='empty')continue;let c=i%8,r=Math.floor(i/8),x=x0+(c+.5)*u,y=y0+(r+.5)*u;
   let p=out((t-5.25-rand(i,2)*.32)/.52),fromx=150+c*127,fromy=360+lerp(-120,120,rand(i,3));
   let s=(1-p)*1.7+p,rot=base+(1-p)*(rand(i,4)*5-2.5);
   if(t>5.8&&t<6.25)rot+=Math.sin(t*12+i)*.15*(1-sm(5.9,6.18,t));
   let pop=1-.9*Math.sin(Math.PI*sm(6.42+rand(i,8)*.12,6.75+rand(i,8)*.12,t));
   if(t>6.82)pop=1;if(i===24&&t<6.5)s*=.35;
   let points=shapeOutline(kind,ori);ctx.save();ctx.translate(lerp(fromx,x,p),lerp(fromy,y,p));ctx.rotate(rot);ctx.scale(u*s*pop,u*s*pop);path(points,mix(P[col1],P[col2],swap));ctx.restore();
  }
  for(const x of [x0,x0+8*u])for(const y of [y0,y0+4*u]){line(x-16,y,x+16,y,P.ink,2);line(x,y-16,x,y+16,P.ink,2)}
 }
 function form(t){
  background();if(t<5.35)formLetters(t,1-sm(5.2,5.6,t));
  if(t>5.2)flatGrid(t);
  if(t>5.23&&t<5.7){let p=sm(5.23,5.68,t);ctx.save();ctx.globalAlpha=1-p;ctx.translate(640,360);ctx.rotate(p*.8);ctx.scale(1+p*.3,1-p*.1);ctx.translate(-640,-360);formLetters(t);ctx.restore()}
  overlay(t,'02 – FORM',t<5.8?'expo.inOut':t<6.5?'sine.inOut':'power3.inOut');
 }
 function shade(h,m){return '#'+rgb(h).map(v=>Math.round(clamp(v*m,0,255)).toString(16).padStart(2,'0')).join('')}
 function camera(t){
  let p=sm(8.25,9.8,t);return {az:lerp(.42,.96,p),elev:lerp(.61,.53,p),scale:lerp(119,128,p),cx:lerp(655,668,p),cy:lerp(397,448,p),enter:sm(7.23,7.6,t)};
 }
 function projection(x,y,z,cam){
  // Two observed ground-plane quadrilaterals determine the projective camera.
  // Extrusions remain authored meshes with vertical edges, never image warps.
  const H0=[82.151642,-81.329306,617.718474,11.956029,35.572275,378.588131,-.040512337,-.060206336];
  const H1=[42.044117,-127.094362,602.880923,13.061346,15.188595,377.915173,-.066233536,-.052849345];
  let p=sm(8.25,9.65,time),h=H0.map((v,i)=>lerp(v,H1[i],p)),w=h[6]*x+h[7]*z+1;
  let px=(h[0]*x+h[1]*z+h[2])/w,py=(h[3]*x+h[4]*z+h[5])/w-96*y;
  let depth=x*Math.sin(cam.az)*Math.cos(cam.elev)+z*Math.cos(cam.az)*Math.cos(cam.elev)+y*Math.sin(cam.elev);
  return [lerp(640+x*133.333,px,cam.enter??1),lerp(360+z*133.333,py,cam.enter??1),depth];
 }
 const heights=[.15,1.06,.35,.38,.72,.3,1.1,.25,.68,.6,.6,1.1,.42,0,1.05,.36,.42,.58,.92,.66,.88,1.68,1.05,.36,.18,.28,0,.47,.65,.32,.47,.24];
 function polygons(t,cam){
  let faces=[],lift=back(clamp((t-7.44)/.53));lift=Math.max(.025,lift);
  for(let i=0;i<32;i++){
   const[k,o,a,,co]=grid[i];if(k==='empty')continue;const x=i%8-3.5,z=Math.floor(i/8)-1.5;
   let h=heights[i]*lift,pts=shapeOutline(k,o).map(([px,pz])=>[x+px*Math.cos(a)-pz*Math.sin(a),z+px*Math.sin(a)+pz*Math.cos(a)]);
   let color=P[co];faces.push({pts:pts.map(([xx,zz])=>projection(xx,h,zz,cam)),c:shade(color,color===P.ink?2.9:1.025),normal:'top',idx:i});
   for(let j=0;j<pts.length;j++){let p=pts[j],q=pts[(j+1)%pts.length],dx=q[0]-p[0],dz=q[1]-p[1],len=Math.hypot(dx,dz),normal=[dz/len,-dx/len];
    if(normal[0]*Math.sin(cam.az)+normal[1]*Math.cos(cam.az)<.001)continue;let m=clamp(.70+normal[0]*-.07+normal[1]*-.12,.48,.86);faces.push({pts:[projection(p[0],0,p[1],cam),projection(q[0],0,q[1],cam),projection(q[0],h,q[1],cam),projection(p[0],h,p[1],cam)],c:shade(color,m),idx:i});
   }
  }
  return faces;
 }
 function ball(t,cam){
  // Observed contact intervals with explicit parabolic arcs and impact squash.
  const hops=[[7.23,7.875,405,270,420,231,36],[7.875,8.375,420,231,440,233,119],[8.375,8.875,440,233,609,200,95],[8.875,9.375,609,200,699,244,144],[9.375,9.75,699,244,699,249,27],[9.75,10.2,699,249,707,200,94]];
  let h=hops.find(v=>t>=v[0]&&t<v[1])||hops[5],p=clamp((t-h[0])/(h[1]-h[0]));
  let x=lerp(h[2],h[4],sm(0,1,p)),y=lerp(h[3],h[5],p)-h[6]*4*p*(1-p);
  let r=lerp(44,67,sm(8.2,9.6,t)),impact=Math.exp(-Math.pow(p/.085,2))*(t<8.5?0:1),stretch=Math.sin(p*Math.PI)*.06;
  if(t<7.65)r=42;
  let world=[lerp(-2.2,.5,sm(7.875,9.375,t)),1,lerp(-.4,.5,sm(7.875,9.375,t))],v=projection(...world,cam),ground=projection(world[0],0,world[2],cam);
  return {x,y,ground,r,rx:r*(1+impact*.28-stretch),ry:r*(1-impact*.30+stretch),depth:v[2]+.8,world};
 }
 function sphere(b){
  ctx.save();ctx.translate(b.x,b.y);ctx.scale(b.rx,b.ry);let g=ctx.createRadialGradient(-.28,-.4,.05,.1,.1,1.12);g.addColorStop(0,'#ff7955');g.addColorStop(.25,'#f34419');g.addColorStop(.75,'#c9320d');g.addColorStop(1,'#91230b');ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,1,0,TAU);ctx.fill();
  g=ctx.createRadialGradient(-.3,-.55,.02,-.3,-.55,.23);g.addColorStop(0,'rgba(255,255,255,.95)');g.addColorStop(.5,'rgba(255,255,255,.25)');g.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=g;ctx.fillRect(-1,-1,2,2);ctx.restore();
 }
 function space(t){
  background();let cam=camera(t),enter=sm(7.23,7.6,t);
  // Real independent extruded contours, directional shading, perspective projection and shadows.
  let flat=(x,y,z)=>[640+x*133.333,360+z*133.333,0];
  let real=projection;if(enter<1){let old=cam;cam={...cam};}
  const proj=(x,y,z)=>projection(x,y,z,cam);
  let corners=[proj(-4,0,-2),proj(4,0,-2),proj(4,0,2),proj(-4,0,2)];
  ctx.save();ctx.globalAlpha=.18;let ttl=proj(0,0,-3.35),xv=proj(3,0,-3.35),zv=proj(0,0,-2.35);ctx.setTransform((xv[0]-ttl[0])/3,(xv[1]-ttl[1])/3,(zv[0]-ttl[0]),(zv[1]-ttl[1]),ttl[0],ttl[1]);ctx.font=font(.95,'Archivo',900);ctx.textAlign='center';ctx.fillStyle='#77716b';ctx.fillText('SPACE',0,0);ctx.font=font(.16,'JMono');ctx.fillText('03 · X / Y / Z                     35mm  f/2.8',0,.33);ctx.restore();
  ctx.save();ctx.globalAlpha=.6;for(let i=-4;i<=4;i++){let a=proj(i,0,-2.15),b=proj(i,0,2.15);line(a[0],a[1],b[0],b[1],'#aea99f',1)}for(let i=-2;i<=2;i++){let a=proj(-4.15,0,i),b=proj(4.15,0,i);line(a[0],a[1],b[0],b[1],'#aea99f',1)}ctx.restore();
  let xa=proj(-7,0,2.5),xb=proj(8,0,2.5),za=proj(-4.55,0,-8),zb=proj(-4.55,0,5);line(xa[0],xa[1],xb[0],xb[1],'#ed8a70',1.3);line(za[0],za[1],zb[0],zb[1],'#8c88c0',1);
  let lift=Math.max(.03,back(clamp((t-7.44)/.53)));
  // Separate ground shadows from mesh faces so contact points remain readable.
  for(let i=0;i<32;i++){let [k,o,a,,col]=grid[i];if(k==='empty')continue;let x=i%8-3.5,z=Math.floor(i/8)-1.5,h=heights[i]*lift;let points=shapeOutline(k,o).map(([xx,zz])=>proj(x+xx+.22*h,0,z+zz+.52*h));path(points,'rgba(59,52,38,.27)')}
  let b=ball(t,cam);ctx.save();ctx.translate(b.ground[0]+b.r*.22,b.ground[1]+b.r*.25);ctx.scale(b.r*.8,b.r*.35);circle(0,0,1,'rgba(53,42,20,.2)');ctx.restore();
  let faces=polygons(t,cam);faces.forEach(f=>f.depth=f.pts.reduce((a,p)=>a+p[2],0)/f.pts.length);faces.sort((a,b)=>a.depth-b.depth);
  for(let f of faces){if(f.ball)sphere(f.ball);else{path(f.pts,f.c);ctx.strokeStyle=f.c;ctx.lineWidth=.65;ctx.stroke()}}
  sphere(b);for(let p of corners){line(p[0]-11,p[1]-3,p[0]+11,p[1]+3,P.ink,1.1);line(p[0]-4,p[1]+8,p[0]+4,p[1]-8,P.ink,1.1)}
  overlay(t,'03 – SPACE',t<8.4?'elastic.out(1,.45)':'parabola g=-9.8');
  if(t>10.1){let p=sm(10.1,10.3,t);circle(640,360,p*1500,P.orange)}
 }
 function clockDial(t){
  const rot=(t-10.5)*.9;ctx.save();ctx.translate(640,360);ctx.scale(.84,1.15);ctx.rotate(rot);
  for(let i=0;i<60;i++){let a=i/60*TAU,rr=370+Math.sin((t-10.5)*1.7)*45;ctx.save();ctx.rotate(a);ctx.globalAlpha=i%5===0?.65:.32;rect(rr,-1,i%5===0?25:14,i%5===0?5:3,P.paper);ctx.restore()}ctx.restore();
 }
 const particleColors=['#fff7ea','#fff7ea','#efe7dc','#f58451','#e64b2a','#e6bc79'];
 function wreathPoint(i,t){
  let a=rand(i,1)*TAU+(t-10.5)*1.05,r=130+rand(i,2)*190;
  let startup=sm(10.49,10.94,t),s=lerp(.07,1,startup),wiggle=Math.sin(a*6+i*.07+t*2)*24;
  return [640+Math.cos(a)*(r+wiggle)*s,360+Math.sin(a)*(r+wiggle)*s,a+Math.PI*.55];
 }
 function ringPoint(i,t){
  let ring=i%5,r=85+ring*55+(rand(i,22)-.5)*7,spin=(t-12.05)*(1.25+ring*.12)-1.8,a=rand(i,3)*(6.1-ring*.45)+spin-ring*.24;
  let dissolve=sm(11.95,12.38,t),cloud=wreathPoint(i,t),v=[640+Math.cos(a)*r,360+Math.sin(a)*r,a+Math.PI/2];
  return [lerp(cloud[0],v[0],dissolve),lerp(cloud[1],v[1],dissolve),a+Math.PI/2];
 }
 function timeScene(t){
  background(true);ctx.save();ctx.globalAlpha=.17;ctx.font=font(300,'Archivo',100);ctx.strokeStyle='#e9e3d9';ctx.lineWidth=1.1;ctx.textAlign='center';ctx.textBaseline='middle';
  let tc=String(Math.floor(t)).padStart(2,'0')+':'+String((Math.ceil(t*30-1e-8)+1)%30).padStart(2,'0');ctx.translate(640,384);ctx.scale(1.27,1);ctx.strokeText(tc,0,0);ctx.restore();
  if(t<10.52){let r=lerp(920,2,sm(10.25,10.52,t));for(let i=7;i>=0;i--)circle(640,360,r*(1+i*.19),mix(P.dark,P.orange,1-i*.1));overlay(t,'04 – TIME','expo.inOut',true);return}
  clockDial(t);
  if(t<11.12){let rr=lerp(550,670,sm(10.52,11.1,t));ctx.beginPath();ctx.arc(640,360,rr,0,TAU);ctx.strokeStyle='rgba(197,68,26,.28)';ctx.lineWidth=5;ctx.stroke()}
  let toType=sm(11.04,11.23,t),fromType=sm(11.96,12.17,t);
  for(let i=0;i<3600;i++){
   let a=wreathPoint(i,t),goal=timeTargets[i%timeTargets.length],p=toType*(1-fromType),q=fromType;
   let x=lerp(a[0],goal[0],p),y=lerp(a[1],goal[1],p),theta=a[2],tail=lerp(7+rand(i,5)*7,.6,p);
   if(t>=11.95){let r=ringPoint(i,t);x=lerp(x,r[0],q);y=lerp(y,r[1],q);theta=r[2];tail=lerp(.7,11+rand(i,7)*10,sm(12,12.4,t))}
   let cc=particleColors[Math.floor(rand(i,4)*particleColors.length)];ctx.strokeStyle=cc;ctx.fillStyle=cc;ctx.globalAlpha=lerp(.78,1,rand(i,9));
   if(p>.99&&q<.01){ctx.fillRect(x+Math.sin(t*5+i)*.4,y+Math.cos(t*4+i)*.4,1.25+rand(i,6)*.9,1.25+rand(i,6)*.9)}
   else{ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x-Math.cos(theta)*tail*.6+Math.sin(theta)*tail*.12,y-Math.sin(theta)*tail*.6-Math.cos(theta)*tail*.12,x-Math.cos(theta)*tail,y-Math.sin(theta)*tail);ctx.lineWidth=.8+rand(i,8)*.85;ctx.stroke()}
  }ctx.globalAlpha=1;
  if(t>12.35){let angle=lerp(-2.15,-.05,sm(12.35,13.1,t)),alpha=sm(12.4,12.7,t);ctx.save();ctx.globalAlpha=alpha;
   ctx.beginPath();ctx.moveTo(640,360);ctx.arc(640,360,306,angle-1.4,angle);ctx.closePath();ctx.fillStyle='rgba(185,180,175,.09)';ctx.fill();
   for(let i=0;i<13;i++){let a=angle-i*.12,x=640+306*Math.cos(a),y=360+306*Math.sin(a);line(640,360,x,y,'rgba(220,212,198,.5)',1.2);circle(x,y,5.5,'#773a31')}
   for(let j=0;j<5;j++){let r=85+j*55;ctx.beginPath();ctx.arc(640,360,r,angle+.3+j*.24,angle+5.95-j*.42);ctx.strokeStyle=j%2?'#f59d47':'#eeac85';ctx.lineWidth=5.8;ctx.stroke()}
   ctx.restore();
  }
  if(t>=12.1||t<11.15)circle(640,360,7,P.orange);overlay(t,'04 – TIME',t<12?'expo.inOut':'ω·e^(at)',true);
 }
 function render(t){
  ctx.setTransform(cvs.width/1280,0,0,cvs.height/720,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.shadowBlur=0;ctx.shadowOffsetX=0;ctx.shadowOffsetY=0;
  if(t<1.84)resume(t);else if(t<4.6)type(t);else if(t<7.23)form(t);else if(t<10.25)space(t);else if(t<13.1)timeScene(t);else resume(t,true);
  if(noiseTexture){ctx.save();ctx.globalAlpha=.035;ctx.fillStyle=ctx.createPattern(noiseTexture,'repeat');ctx.fillRect(0,0,1280,720);ctx.restore()}
 }
 window.seek=t=>{time=clamp(Number(t)||0,0,15);if(C)render(time);return window.getState()};
 window.getState=()=>({time,duration:15,scene:C?.scenes.find(s=>time>=s.start&&time<s.end)?.name||'Resume final hold',renderer:'independent-canvas-geometry',sourceImages:0,referenceVideoLoaded:false,seed:C?.seed});
 window.duration=15;
 window.ready=()=>readyPromise||(readyPromise=(async()=>{
  C=await (await fetch('project.json')).json();P={...P,...C.palette};cvs.width=C.width;cvs.height=C.height;
  await Promise.all(['900 300px Archivo','700 40px Archivo','206px DisplaySerif','390px SerifItalic','14px JMono','40px Geist'].map(f=>document.fonts.load(f)));await document.fonts.ready;
  let m=document.createElement('canvas');m.width=700;m.height=190;let c=m.getContext('2d');c.font='900 190px Archivo';c.textBaseline='middle';c.textAlign='center';c.fillStyle='white';c.fillText('TIME',350,95);let d=c.getImageData(0,0,700,190).data;
  let candidates=[];for(let y=0;y<190;y+=2)for(let x=0;x<700;x+=2)if(d[(y*700+x)*4+3]>180)candidates.push([x+290,y+265]);
  let minx=Math.min(...candidates.map(p=>p[0])),maxx=Math.max(...candidates.map(p=>p[0])),miny=Math.min(...candidates.map(p=>p[1])),maxy=Math.max(...candidates.map(p=>p[1]));for(let i=0;i<3600;i++){let p=candidates[Math.floor(rand(i,15)*candidates.length)];timeTargets.push([340+(p[0]-minx)/(maxx-minx)*600+rand(i,16)*2-1,288+(p[1]-miny)/(maxy-miny)*151+rand(i,17)*2-1])}
  noiseTexture=document.createElement('canvas');noiseTexture.width=noiseTexture.height=128;let n=noiseTexture.getContext('2d'),nd=n.createImageData(128,128);for(let i=0;i<128*128;i++){let v=rand(i,99)>.5?255:0;nd.data.set([v,v,v,60],i*4)}n.putImageData(nd,0,0);
  window.seek(time);if(!new URLSearchParams(location.search).has('render')){const started=performance.now();function frame(now){window.seek((now-started)/1000%15);requestAnimationFrame(frame)}requestAnimationFrame(frame)}return true;
 })());window.ready();
})();
