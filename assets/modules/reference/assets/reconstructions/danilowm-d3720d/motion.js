/* Meu Pet Pode Ir: independent scene-specific editable Canvas reconstruction.
   All camera, reveal, typing and cursor states are analytic functions of time. */
(() => {
  'use strict';
  const canvas=document.getElementById('stage'),ctx=canvas.getContext('2d'),W=1280,H=720,TAU=Math.PI*2;
  let project,P,state={},lastTime=0,cardTextures=[];
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
  const interval=(t,a,b)=>smooth((t-a)/(b-a));
  const ease=x=>1-(1-clamp(x))**3;
  const spring=x=>x<=0?0:1-Math.exp(-10*x)*Math.cos(14*x);
  const rand=n=>{const x=Math.sin(n*117.17+37.3)*43758.5453;return x-Math.floor(x);};
  function rect(x,y,w,h,r,col,c=ctx){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=col;c.fill();}
  function circle(x,y,r,col,stroke=false,lw=1,c=ctx){if(r<=0)return;c.beginPath();c.arc(x,y,r,0,TAU);c[stroke?'strokeStyle':'fillStyle']=col;c.lineWidth=lw;c[stroke?'stroke':'fill']();}
  function line(x1,y1,x2,y2,col,lw=1,c=ctx){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.strokeStyle=col;c.lineWidth=lw;c.stroke();}
  function text(s,x,y,size,weight=500,col=P.ink,gap=0,c=ctx){
    c.font=`${weight} ${size}px Geist`;c.fillStyle=col;c.textAlign='left';
    if(!gap)c.fillText(s,x,y);else [...s].forEach(ch=>{c.fillText(ch,x,y);x+=c.measureText(ch).width+gap;});
  }
  function mono(s,x,y,size=13,col=P.ink,align='left',weight=400){ctx.font=`${weight} ${size}px monospace`;ctx.fillStyle=col;ctx.textAlign=align;ctx.fillText(s,x,y);}
  function paw(x,y,r,color,rotation=0,c=ctx){
    c.save();c.translate(x,y);c.rotate(rotation);c.scale(r,r);c.fillStyle=color;
    c.beginPath();c.moveTo(-.12,-.05);c.bezierCurveTo(-.59,-.37,-.76,.03,-.39,.22);c.bezierCurveTo(-.18,.31,-.21,.70,.16,.66);c.bezierCurveTo(.56,.60,.43,.07,.30,-.05);c.bezierCurveTo(.18,-.17,.03,-.08,-.12,-.05);c.fill();
    [[.04,-.68,.17],[.58,-.37,.17],[.71,.17,.16]].forEach(([xx,yy,rr])=>circle(xx,yy,rr,color,false,1,c));c.restore();
  }
  function pin(x,y,size,col=P.teal,withPaw=false){
    ctx.save();ctx.translate(x,y);ctx.scale(size,size);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,1.04);
    ctx.bezierCurveTo(-.38,.72,-.93,.18,-.85,-.38);ctx.bezierCurveTo(-.78,-1.26,.78,-1.26,.85,-.38);ctx.bezierCurveTo(.93,.18,.38,.72,0,1.04);ctx.fill();
    if(withPaw)paw(0,-.30,.48,'white',-.13);else circle(0,-.35,.28,'white');ctx.restore();
  }
  function heart(x,y,r,col,filled=false,c=ctx){
    c.save();c.translate(x,y);c.scale(r,r);c.beginPath();c.moveTo(0,.9);c.bezierCurveTo(-.1,.63,-1.1,.13,-.9,-.43);c.bezierCurveTo(-.72,-.98,-.17,-.8,0,-.48);c.bezierCurveTo(.19,-.85,.76,-.95,.91,-.4);c.bezierCurveTo(1.07,.12,.19,.72,0,.9);
    c.lineWidth=.13;c.strokeStyle=c.fillStyle=col;c[filled?'fill':'stroke']();c.restore();
  }
  function icon(kind,x,y,size,col=P.deep,c=ctx){
    c.save();c.translate(x,y);c.scale(size/60,size/60);c.lineCap='round';c.lineJoin='round';c.strokeStyle=col;c.lineWidth=2.6;
    if(kind==='bag') {
      c.beginPath();c.roundRect(-23,-22,46,48,5);c.stroke();line(-20,-12,20,-12,col,2.6,c);
      c.beginPath();c.moveTo(-10,-2);c.bezierCurveTo(-10,15,10,15,10,-2);c.stroke();
    } else if(kind==='bed') {
      line(-29,-18,-29,28,col,3,c);line(-29,15,29,15,col,3,c);line(29,-3,29,28,col,3,c);line(-29,-3,29,-3,col,3,c);
      c.strokeRect(-22,-14,16,11);line(-29,21,29,21,col,2.6,c);
    } else if(kind==='food') {
      for(const xx of [-22,-13,-4])line(xx,-29,xx,-9,col,2.6,c);
      c.beginPath();c.moveTo(-22,-9);c.bezierCurveTo(-22,7,-4,7,-4,-9);c.stroke();line(-13,1,-13,29,col,2.6,c);
      c.beginPath();c.moveTo(20,-29);c.bezierCurveTo(4,-15,4,2,20,1);c.lineTo(20,29);c.stroke();
    } else if(kind==='coffee') {
      c.beginPath();c.moveTo(-24,-12);c.lineTo(17,-12);c.lineTo(14,19);c.quadraticCurveTo(-4,29,-22,18);c.closePath();c.stroke();
      c.beginPath();c.moveTo(17,-9);c.bezierCurveTo(37,-12,35,13,16,11);c.stroke();line(-28,27,24,27,col,2.6,c);
      for(let j=0;j<3;j++)line(-13+j*12,-29,-13+j*12,-22,col,2,c);
    } else if(kind==='park') {
      c.beginPath();c.moveTo(-19,10);c.bezierCurveTo(-51,8,-27,-22,-11,-13);c.bezierCurveTo(1,-41,30,-20,15,-8);c.bezierCurveTo(42,-6,28,20,9,13);c.stroke();line(-5,13,-5,31,col,2.6,c);
      c.beginPath();c.moveTo(35,-24);c.lineTo(27,-12);c.lineTo(39,-12);c.lineTo(25,2);c.lineTo(42,2);c.lineTo(42,19);c.stroke();
    } else {
      c.beginPath();c.roundRect(-19,-22,35,45,5);c.stroke();c.beginPath();c.moveTo(16,-12);c.bezierCurveTo(37,-12,37,14,16,14);c.stroke();for(let j=0;j<3;j++)line(-10+j*9,-13,-10+j*9,14,col,2,c);
    }c.restore();
  }
  function background(dots=true){ctx.fillStyle=P.background;ctx.fillRect(0,0,W,H);if(dots){ctx.fillStyle='#d8dedb';for(let y=15;y<H;y+=29)for(let x=15;x<W;x+=29){ctx.beginPath();ctx.arc(x,y,1.2,0,TAU);ctx.fill();}}}
  function hud(t,chapter){
    ctx.save();ctx.globalAlpha=interval(t,0,.2);
    const c='#303635';
    [[25,21,1,1],[1255,21,-1,1],[25,699,1,-1],[1255,699,-1,-1]].forEach(([x,y,sx,sy])=>{line(x,y,x+sx*18,y,'#5e6260');line(x,y,x,y+sy*18,'#5e6260');});
    mono(`${project.brand.toUpperCase()} / MOTION REEL 2026`,48,48,16,c);const frame=Math.floor(t*30+1e-7),seconds=Math.floor(frame/30),f=frame%30;
    mono(`00:00:${String(seconds).padStart(2,'0')}:${String(f).padStart(2,'0')}`,1231,48,16,c,'right');circle(1121,43,4,P.teal);
    mono(`${String(chapter+1).padStart(2,'0')}/06 ${['KINETIC TYPE','SVG PATH DRAW','DATA IN MOTION','3D CAMERA FLIGHT','UI CHOREOGRAPHY','BRAND RESOLVE'][chapter]}`,48,662,16,c);
    mono('1920×1080 · 30 FPS',1231,662,16,c,'right');line(48,681,1231,681,'#d4d7d5',1.4);line(48,681,48+1183*clamp(t/15),681,P.ink,2);ctx.restore();
  }
  function footPaws(t,ending=false){
    const points=ending?[[915,120],[1068,80],[1165,129],[1012,166]]:[[870,650],[964,595],[985,496],[1067,436],[1105,339],[1170,284],[1203,186]];
    points.forEach(([x,y],i)=>{const at=ending?13.35+i*.12:.22+i*.20;ctx.globalAlpha=.20*interval(t,at,at+.22);paw(x,y,23,P.teal,.4);});ctx.globalAlpha=1;
  }
  function intro(t){
    const words=project.intro_words,starts=[.50,.98,1.43,1.60],positions=[[90,306],[424,306],[90,483],[539,483]],sizes=[184,184,184,184];
    for(let j=0;j<4;j++) {
      const q=t-starts[j],v=interval(t,starts[j],starts[j]+.20);if(v<=0)continue;
      ctx.save();ctx.globalAlpha=v;ctx.filter=`blur(${(1-v)*8}px)`;ctx.translate(positions[j][0],positions[j][1]+(1-v)*72);ctx.rotate((1-v)*(j%2?-.055:.055));
      if(j<2)ctx.scale(.95,1);text(words[j],0,0,sizes[j],800,j===3?P.deep:P.ink,-12);ctx.restore();
    }
    const pinScale=spring((t-2.11)/.9);if(pinScale>0)pin(739,400,75*pinScale,P.teal,true);
    ctx.lineCap='round';if(t>1.76)line(98,533,98+798*interval(t,1.76,2.1),533,P.teal,8);footPaws(t);
    state.visibleWords=starts.filter(a=>t>a).length;
  }
  const mapPins=[[167,119],[142,164],[205,457],[225,525],[590,133],[643,173],[650,215],[629,267],[719,304],[714,374],[620,369],[531,403],[554,438],[496,498],[750,451],[778,478],[180,686],[738,209],[147,367],[207,404],[567,319],[642,471],[695,149],[652,595]];
  const mapRoads=[[[25,-20],[142,740]],[[185,-20],[251,740]],[[375,-20],[347,740]],[[568,-20],[549,740]],[[704,-20],[655,740]],[[35,69],[805,214]],[[-5,195],[805,251]],[[-20,282],[805,303]],[[-20,390],[805,363]],[[-20,482],[805,445]],[[-20,613],[805,578]],[[-20,711],[805,690]]];
  function mapPaths(t){
    const q=t-2.66,zoom=lerp(2.6,1,interval(t,2.72,3.10)),panX=-q*9,panY=q*4;
    ctx.save();ctx.translate(506,0);ctx.translate(390,360);ctx.scale(zoom,zoom);ctx.translate(-390+panX,-360+panY);
    ctx.fillStyle=P.map;ctx.fillRect(-600,-300,1800,1300);
    rect(115,225,147,88,8,P.mint);rect(529,81,124,65,8,P.mint);rect(413,592,204,74,8,P.mint);
    ctx.strokeStyle='#b3ede5';ctx.lineWidth=32;ctx.beginPath();ctx.moveTo(-80,674);ctx.bezierCurveTo(80,480,337,584,445,493);ctx.bezierCurveTo(560,372,640,489,837,299);ctx.stroke();
    ctx.strokeStyle='white';ctx.lineCap='round';
    mapRoads.forEach((p,i)=>{const v=interval(t,2.67+i*.017,3.17+i*.017);ctx.lineWidth=i<5?11:8;ctx.beginPath();ctx.moveTo(p[0][0],p[0][1]);ctx.lineTo(lerp(p[0][0],p[1][0],v),lerp(p[0][1],p[1][1],v));ctx.stroke();});
    [4,5,6,7,18,11,12,13,14,15,0,1,2,3,8,9,10,16,17,19,20,21,22,23].forEach((index,i)=>{const [x,y]=mapPins[index];const v=spring((t-3.03-i*.024)/.9);if(v>0)pin(x,y,19*Math.max(0,v),P.teal);});
    const pulse=(t-3.53)%1;ctx.globalAlpha=clamp(1-pulse)*.48;circle(390,439,20+pulse*80,P.teal,true,2.8);ctx.globalAlpha=1;
    if(t>3.53)pin(390,398,36*spring((t-3.53)/.8),P.deep,true);
    function tooltip(s,x,y,w,at){const v=interval(t,at,at+.17);ctx.save();ctx.globalAlpha=v;ctx.translate(0,10*(1-v));ctx.shadowColor='#517c7024';ctx.shadowBlur=13;ctx.shadowOffsetY=5;rect(x,y,w,45,23,'white');ctx.shadowBlur=ctx.shadowOffsetY=0;circle(x+19,y+24,6,P.teal);text(s,x+35,y+30,20,650,P.ink);ctx.restore();}
    tooltip(project.map_tooltip,487,430,275,3.92);tooltip(project.map_count,552,268,200,4.23);
    ctx.restore();
  }
  function mapScene(t){
    const cover=interval(t,2.55,2.80);
    if(t<2.88) {
      ctx.fillStyle=P.teal;ctx.fillRect(0,0,W,H);paw(560,290,680,'white',.2);
      ctx.save();ctx.beginPath();ctx.arc(640,360,70+cover*1000,0,TAU);ctx.clip();mapPaths(t);ctx.restore();
    }else mapPaths(t);
    const panel=interval(t,2.87,3.12);ctx.save();ctx.globalAlpha=panel;ctx.fillStyle='white';ctx.fillRect(0,0,506,H);
    mono(project.region,100,223,16,P.deep);
    project.map_title.forEach((s,i)=>{ctx.globalAlpha=interval(t,3.04+i*.095,3.30+i*.095);text(s,100,300+i*62,62,700,P.ink,-3);});
    ctx.globalAlpha=interval(t,3.50,3.72);project.map_caption.forEach((s,i)=>text(s,100,479+i*30,22,400,P.muted,-.4));ctx.restore();
    state.mapPins=mapPins.length;state.mapMainPin=t>=3.53;state.tooltip=t>=3.92;
  }
  function wipe(t){
    const q=t-5.03;
    if(q<.22){const y=H-ease(q/.22)*H*1.4;ctx.fillStyle=P.deep;ctx.fillRect(0,y,W,H);ctx.fillStyle=P.teal;ctx.fillRect(0,y+280,W,H);}
    else {const v=ease((q-.265)/.18),y=-v*H;ctx.fillStyle=P.teal;ctx.fillRect(0,y,W,H*.5);ctx.fillStyle=P.deep;ctx.fillRect(0,y+H*.5,W,H*.5);}
  }
  function numberWithDots(n){return Math.round(n).toLocaleString('pt-BR');}
  function data(t){
    const keys=[[5.276,0],[5.4,495],[5.55,900],[5.7,1098],[5.85,1235],[6,1287],[6.15,1309],[6.3,1317]];let value=t>=6.3?1317:0;for(let i=0;i<keys.length-1;i++){if(t>=keys[i][0]&&t<keys[i+1][0])value=lerp(keys[i][1],keys[i+1][1],clamp((t-keys[i][0])/(keys[i+1][0]-keys[i][0])));}const count=Math.round(value*project.metric_total/1317);
    mono(project.metric_title,100,223,16,P.deep);ctx.save();ctx.translate(100,400);ctx.scale(.85,1);text(numberWithDots(count),0,0,196,780,P.ink,-13);ctx.restore();line(670,218,670,550,'#e8ece9');
    ctx.globalAlpha=interval(t,5.48,5.75);text(project.metric_caption,100,480,27,450,P.ink,-.7);ctx.globalAlpha=interval(t,5.75,6.03);mono(project.metric_note,100,526,14,'#777d79');ctx.globalAlpha=1;
    project.metrics.forEach((m,i)=>{const v=ease((t-(5.56+i*.07))/.68),y=238+i*51;ctx.globalAlpha=interval(t,5.52+i*.07,5.72+i*.07);text(m.label,727,y,22,400,P.ink,-.4);rect(912,y-19,185,20,10,'#eef0ef');rect(912,y-19,185*m.value/601*v,20,10,P.teal);text(String(Math.round(m.value*v)),1141,y,21,550,P.ink);ctx.globalAlpha=1;});
    state.metricCount=count;
  }
  function makeCard(place,index,liked=false){
    const c=document.createElement('canvas');c.width=280;c.height=350;const g=c.getContext('2d');
    g.save();g.beginPath();g.roundRect(0,0,280,350,17);g.clip();g.fillStyle='white';g.fillRect(0,0,280,350);
    const top=place.icon==='food'?P.mint:place.icon==='bed'||place.icon==='beer'?'#e8edef':'#e2f1ed';g.fillStyle=top;g.fillRect(0,0,280,232);
    rect(15,13,130,29,15,'white',g);paw(27,27,6,P.teal,0,g);text('Bem-vindo',39,34,16,500,P.ink,0,g);heart(252,28,12,liked?P.teal:P.ink,liked,g);icon(place.icon,140,124,90,P.deep,g);
    let line1=place.name,line2='';
    if(line1.length>24){const bits=line1.split(' ');line2=bits.pop();line1=bits.join(' ');}
    text(line1,18,264,22,600,P.ink,-.3,g);if(line2)text(line2,18,286,22,600,P.ink,-.3,g);
    text(place.category,18,line2?312:295,16,400,'#6e7773',-.1,g);g.restore();return c;
  }
  function rot(p,rx,ry,rz){let[x,y,z]=p;[y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];[x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];return[x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z];}
  function affineTriangle(im,src,dst){
    const [[u0,v0],[u1,v1],[u2,v2]]=src,[[x0,y0],[x1,y1],[x2,y2]]=dst;
    const den=(u1-u0)*(v2-v0)-(u2-u0)*(v1-v0);
    const a=((x1-x0)*(v2-v0)-(x2-x0)*(v1-v0))/den,b=((y1-y0)*(v2-v0)-(y2-y0)*(v1-v0))/den;
    const c=((x2-x0)*(u1-u0)-(x1-x0)*(u2-u0))/den,d=((y2-y0)*(u1-u0)-(y1-y0)*(u2-u0))/den;
    ctx.save();ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.lineTo(x2,y2);ctx.closePath();ctx.clip();ctx.transform(a,b,c,d,x0-a*u0-c*v0,y0-b*u0-d*v0);ctx.drawImage(im,0,0);ctx.restore();
  }
  function texturedQuad(im,pts){
    // 4 x 4 subdivision makes perspective text and edges match the plane rather than a single affine card.
    function quad(u,v){const x=lerp(pts[0][0],pts[1][0],u),y=lerp(pts[0][1],pts[1][1],u),xx=lerp(pts[3][0],pts[2][0],u),yy=lerp(pts[3][1],pts[2][1],u);return[lerp(x,xx,v),lerp(y,yy,v)];}
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){
      const u=i/4,v=j/4,u1=(i+1)/4,v1=(j+1)/4,a=quad(u,v),b=quad(u1,v),c=quad(u1,v1),d=quad(u,v1);
      affineTriangle(im,[[u*280,v*350],[u1*280,v*350],[u1*280,v1*350]],[a,b,c]);affineTriangle(im,[[u*280,v*350],[u1*280,v1*350],[u*280,v1*350]],[a,c,d]);
    }
  }
  function cardFlight(t){
    const entry=interval(t,7.4,7.95),front=interval(t,8.65,8.98),rx=lerp(-.92,0,front),ry=lerp(.21,0,front),rz=lerp(-.14+.26*interval(t,7.6,8.4),0,front);
    const cx=lerp(1050,640,interval(t,7.4,8.95)),cy=lerp(580,360,interval(t,7.4,8.2)),scale=lerp(.64,.96,interval(t,7.4,8.98));
    const cards=[];
    for(let index=0;index<15;index++){
      const row=Math.floor(index/5),col=index%5,x=(col-2)*304,y=(row-1)*382,z=index===7?-28*interval(t,8.9,9.12):0;
      const points=[[-140,-175],[140,-175],[140,175],[-140,175]].map(([dx,dy])=>{const p=rot([x+dx,y+dy,z],rx,ry,rz),f=1600/(1600+p[2]);return[cx+p[0]*scale*f,cy+p[1]*scale*f,p[2]];});
      cards.push({index,points,z:points.reduce((a,b)=>a+b[2],0)/4});
    }cards.sort((a,b)=>b.z-a.z);
    for(const {index,points} of cards){
      const blur=index===7?0:9*interval(t,8.80,9.08);ctx.save();ctx.globalAlpha=entry;ctx.filter=`blur(${(1-entry)*6+blur}px)`;
      ctx.beginPath();points.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x,y));ctx.closePath();ctx.shadowColor=index===7?'#12b4a646':'#48625f16';ctx.shadowBlur=index===7?30:12;ctx.shadowOffsetY=12;ctx.fillStyle='white';ctx.fill();ctx.shadowBlur=ctx.shadowOffsetY=0;
      if(front>=.999){const im=index===7&&t>9.67?cardTextures[15]:cardTextures[index];ctx.fillStyle=P.background;ctx.beginPath();points.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x,y));ctx.closePath();ctx.fill();ctx.shadowColor=index===7?'#12b4a646':'#48625f16';ctx.shadowBlur=index===7?30:12;ctx.shadowOffsetY=12;ctx.drawImage(im,points[0][0],points[0][1],points[1][0]-points[0][0],points[3][1]-points[0][1]);}else texturedQuad(index===7&&t>9.67?cardTextures[15]:cardTextures[index],points);ctx.restore();
    }
    if(t>=9.65&&t<10.3){const q=t-9.65,fade=1-interval(t,9.9,10.22);for(let i=0;i<20;i++){const a=rand(i*5)*TAU,r=(15+rand(i*7)*90)*ease(q/.3);ctx.globalAlpha=fade;circle(748+Math.cos(a)*r,216+Math.sin(a)*r,1.7+rand(i),P.teal);}ctx.globalAlpha=1;}
    if(t>10.37){ctx.fillStyle=P.background;ctx.fillRect(0,H-(H+200)*interval(t,10.37,10.62),W,H+200);}
    state.cardCount=15;state.cameraRotation=[rx,ry,rz].map(v=>+v.toFixed(5));state.cameraPosition=[+cx.toFixed(4),+cy.toFixed(4)];state.favorite=t>9.67;
  }
  function cursor(x,y,pressed=false){
    ctx.save();ctx.translate(x,y);ctx.scale(pressed?.86:1,pressed?.86:1);ctx.fillStyle=P.ink;ctx.strokeStyle='white';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,29);ctx.lineTo(8,21);ctx.lineTo(14,34);ctx.lineTo(20,31);ctx.lineTo(13,18);ctx.lineTo(25,18);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
  }
  function search(t){
    const enter=interval(t,10.45,10.67);ctx.save();ctx.globalAlpha=enter;ctx.translate(0,(1-enter)*230-50);
    text(project.query_heading,226,330,48,650,P.ink,-2.6);
    ctx.shadowColor='#00000022';ctx.shadowBlur=16;ctx.shadowOffsetY=8;rect(226,377,824,90,46,'white');ctx.shadowBlur=ctx.shadowOffsetY=0;
    text('Onde',270,411,17,600,P.ink);text('Pet',718,411,17,600,P.ink);line(685,397,685,447,'#edf0ee');
    let typed=project.query_placeholder;
    if(t>10.9){const n=Math.floor(clamp((t-10.93)/.58)*project.query.length);typed=project.query.slice(0,n);}
    text(typed,270,442,22,400,t>10.9?P.ink:'#6f7671',-.45);text(project.pet,718,442,22,400,'#7b817d',-.45);
    if(t<11.55&&Math.floor(t*4)%2===0){ctx.font='400 22px Geist';line(270+ctx.measureText(typed).width,425,270+ctx.measureText(typed).width,443,P.deep);}
    circle(1008,422,33,P.teal);circle(1005,419,9,'white',true,2);line(1012,426,1018,432,'white',2);
    const selected=t>=11.04;
    project.chips.forEach((s,i)=>{const v=interval(t,10.70+i*.06,10.93+i*.06);ctx.globalAlpha=v;rect(244+i*130,498,113,41,21,selected&&i===1?P.ink:'white');icon(['park','coffee','bed','bag'][i],260+i*130,519,16,selected&&i===1?'white':P.ink);text(s,280+i*130,525,17,450,selected&&i===1?'white':P.ink,-.4);});ctx.globalAlpha=1;
    if(t>11.55&&t<12.25){const v=interval(t,11.55,11.77);cursor(lerp(1210,1009,v),lerp(620,423,v),t>=11.88&&t<12.02);}
    if(t>11.90){const q=t-11.90;ctx.globalAlpha=clamp(1-q/.36)*.6;circle(1008,422,33+q*135,P.teal,true,2);ctx.globalAlpha=1;}
    if(t>12.20){const r=33+clamp((t-12.20)/.23)**3*1800;circle(1008,422,r,P.teal);}
    ctx.restore();state.query=typed;state.selectedChip=selected?1:null;state.cursor=t>11.55?[1009,423]:null;state.clicked=t>=11.9;
  }
  function brand(t){
    const q=t-12.46,v=interval(t,12.46,12.73);
    if(t<12.58){ctx.fillStyle=P.teal;ctx.fillRect(0,0,W,H);}
    const size=lerp(700,160,ease(q/.43)),x=lerp(0,200,ease(q/.43)),y=lerp(70,253,ease(q/.43));
    if(t>12.71){const glow=ctx.createRadialGradient(280,333,20,280,333,235);glow.addColorStop(0,'#12b4a628');glow.addColorStop(1,'#12b4a600');ctx.fillStyle=glow;ctx.fillRect(0,88,550,500);}
    rect(x,y,size,size,size*.24,P.teal);ctx.globalAlpha=interval(t,12.92,13.10);paw(x+size*.47,y+size*.47,size*.38,'white',0);ctx.globalAlpha=1;
    const letters=project.brand,progress=interval(t,13.01,13.36);ctx.save();ctx.beginPath();ctx.rect(398,210,Math.max(0,progress*620),175);ctx.clip();text(letters,399,317,76,680,P.ink,-3.3);ctx.restore();
    ctx.globalAlpha=interval(t,13.40,13.63);text(project.signature_caption,399,376,32,400,'#6d7570',-1);ctx.globalAlpha=interval(t,13.94,14.20);
    ctx.beginPath();ctx.roundRect(200,507,298,49,26);ctx.fillStyle='white';ctx.fill();ctx.strokeStyle='#535d57';ctx.lineWidth=1.2;ctx.stroke();circle(218,532,4,P.teal);mono(project.url,240,538,19,P.deep,'left',600);
    ctx.globalAlpha=interval(t,14.12,14.33);mono(`${numberWithDots(project.metric_total)} lugares · 10 categorias`,1231,543,14,'#88908a','right');mono('motion · design · código',1231,567,14,'#88908a','right');ctx.globalAlpha=1;footPaws(t,true);
    state.logoSize=+size.toFixed(5);state.brandReveal=+progress.toFixed(5);
  }
  function seek(seconds){
    const t=clamp(Number(seconds)||0,0,project.duration);lastTime=t;state={t:+t.toFixed(6),phase:project.marks.reduce((s,m)=>t>=m.t?m.phase:s,'kinetic-portuguese-title'),loop:false};
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.shadowBlur=ctx.shadowOffsetY=0;ctx.lineCap='butt';
    background(t<7.4);let chapter=0;
    if(t<2.5)intro(t);
    else if(t<5.3){mapScene(t);chapter=1;}
    else if(t<7.4){data(t);chapter=2;}
    else if(t<10.62){cardFlight(t);chapter=3;if(t>10.45){search(t);chapter=4;}}
    else if(t<12.46){search(t);chapter=4;}
    else {brand(t);chapter=5;}
    if(t>=5.03&&t<5.47)wipe(t);hud(t,chapter);return state;
  }
  window.seek=t=>seek(t);window.getState=()=>JSON.parse(JSON.stringify(state));
  const ready=(async()=>{
    project=await(await fetch('project.json')).json();P=project.palette;window.project=project;window.duration=project.duration;
    await document.fonts.load('800 184px Geist');await document.fonts.ready;
    cardTextures=project.places.map((p,i)=>makeCard(p,i));cardTextures.push(makeCard(project.places[7],7,true));
    function resize(){canvas.width=innerWidth;canvas.height=innerHeight;seek(lastTime);}window.addEventListener('resize',resize);resize();
    if(!new URLSearchParams(location.search).has('render')){const start=performance.now();function frame(now){seek(Math.min(project.duration,(now-start)/1000));if(now-start<project.duration*1000)requestAnimationFrame(frame);}requestAnimationFrame(frame);}
    return true;
  })();window.ready=()=>ready;
})();
