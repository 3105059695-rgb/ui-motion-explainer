/* Case 001: scene-specific, independently written Canvas reconstruction.
 * No source-video playback, reference stills or captured frame sequences.
 * All drawing is computed from time and editable project.json values.
 */
(function () {
  'use strict';
  const canvas = document.getElementById('frame'), ctx = canvas.getContext('2d', { alpha: false });
  let config, P, F, lastTime = 0, state = null, loaded = false;
  const pi = Math.PI, TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const phase = (t, start, duration) => clamp((t - start) / duration);
  const out = x => 1 - (1 - clamp(x)) ** 3;
  function hash(i) { let x = (Math.imul(i + 1, 0x9e3779b1) ^ config.seed) >>> 0; x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; return (x >>> 0) / 4294967296; }
  function rgba(hex, a) { return `rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${clamp(a)})`; }
  function colorMix(a, b, p) { const A=[1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),B=[1,3,5].map(i=>parseInt(b.slice(i,i+2),16)); return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],clamp(p)))).join(',')})`; }
  function fill(color) { ctx.fillStyle = color; ctx.fillRect(0,0,960,540); }
  function line(x,y,X,Y,color,width=1) { ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke(); }
  function circle(x,y,r,color) { if(r<=0)return;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=color;ctx.fill(); }
  function outlineCircle(x,y,r,color,width=1) { if(r<=0)return;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke(); }
  function text(value,x,y,size,color,opts={}) { ctx.save();ctx.fillStyle=color;ctx.font=`${opts.italic?'italic ':''}${opts.weight||400} ${size}px ${opts.font||F.mono}`;ctx.textAlign=opts.align||'left';ctx.textBaseline='alphabetic';ctx.globalAlpha=opts.alpha??1;ctx.fillText(value,x,y);ctx.restore(); }
  function spaced(value,x,y,size,color,spacing=1) { ctx.save();ctx.font=`${size}px ${F.mono}`;ctx.fillStyle=color;for(const char of value){ctx.fillText(char,x,y);x+=ctx.measureText(char).width+spacing;}ctx.restore(); }
  function word(value,x,y,size,width,color,options={}) {
    ctx.save();ctx.fillStyle=color;ctx.strokeStyle=color;ctx.font=`900 ${size}px ${F.display}`;ctx.textBaseline='alphabetic';const measured=ctx.measureText(value).width;
    ctx.translate(x,y);ctx.scale(width/Math.max(1,measured),options.yScale??1);
    if(options.outline){ctx.lineWidth=options.outline;ctx.strokeText(value,0,0);}else ctx.fillText(value,0,0);ctx.restore();
  }
  function claudeLetters(t,x,y,size,width,color,full=false) {
    const weightsA=[.195,.17,.22,.183,.126,.106],weightsB=[.151,.141,.169,.171,.189,.179],m=full?0:smooth(phase(t,2.48,.55));
    let X=x;const letters='CLAUDE';
    for(let i=0;i<6;i++){const w=width*lerp(weightsA[i],weightsB[i],m),reveal=full?1:out(phase(t,1.94+i*.043,.34));ctx.save();ctx.beginPath();ctx.rect(X-3,y-size*1.14,size+200,size*1.14*reveal);ctx.clip();word(letters[i],X,y,size,w,color);ctx.restore();X+=w;}
  }
  function starLogo(x,y,r,color,rotation=0,xScale=1) {
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.scale(xScale,1);ctx.strokeStyle=color;ctx.lineWidth=r*.22;ctx.lineCap='round';
    const factors=[1,.77,.98,.83,.96,.79,1,.82,.97,.80,.99,.76];
    for(let i=0;i<config.geometry.ray_count;i++){const a=-pi/2+i*TAU/config.geometry.ray_count;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.055,Math.sin(a)*r*.055);ctx.lineTo(Math.cos(a)*r*factors[i],Math.sin(a)*r*factors[i]);ctx.stroke();}ctx.restore();
  }
  function hud(t,scene,dark) {
    const c=dark?P.paper:P.ink;ctx.save();ctx.strokeStyle=rgba(c,.66);ctx.lineWidth=.75;
    for(const [x,y,sx,sy] of [[22,22,1,1],[938,22,-1,1],[22,518,1,-1],[938,518,-1,-1]]){ctx.beginPath();ctx.moveTo(x+10*sx,y);ctx.lineTo(x,y);ctx.lineTo(x,y+10*sy);ctx.stroke();}
    spaced('CLAUDE',40,40,6.7,c,.8);spaced('MOTION REEL — 2026',92,40,6.7,rgba(c,.65),.9);
    ctx.font=`bold 6.7px ${F.mono}`;ctx.textAlign='right';ctx.fillStyle=c;ctx.fillText(scene,920,40);
    const seconds=Math.floor(t),frames=Math.floor((t-seconds)*60+1e-6);spaced(`00:00:${String(seconds).padStart(2,'0')}:${String(frames).padStart(2,'0')}`,40,506,6.7,c,.6);spaced('60 FPS',129,506,6.7,rgba(c,.7),.7);
    text('128 BPM',794,506,6.7,c);const beat=Math.floor(t*128/60)%4;for(let i=0;i<4;i++){ctx.strokeStyle=c;ctx.strokeRect(846+i*8,500,4.5,4.5);if(i===beat){ctx.fillStyle=c;ctx.fillRect(846+i*8,500,4.5,4.5);}}
    text(`BAR ${Math.min(8,Math.floor(t/(60/128*4))+1)}/8`,883,506,6.7,c);line(22,525,22+916*t/15,525,rgba(c,.8),.75);ctx.restore();
  }
  function grain(t) { ctx.save();ctx.fillStyle='rgba(255,255,255,.023)';for(let i=0;i<1000;i++){const x=hash(i*2)*960,y=hash(i*2+1)*540;ctx.fillRect(x,y,.7,.7);}ctx.restore(); }

  function intro(t) {
    fill(P.ink);const reveal=out(phase(t,.28,.55));
    ctx.save();ctx.globalAlpha=phase(t,.6,.4)*.14;for(let x=15;x<960;x+=30)for(let y=15;y<540;y+=30)circle(x,y,.65,P.paper);ctx.restore();
    outlineCircle(480,270,lerp(34,320,out(phase(t,.2,1))),rgba(P.paper,.18*(1-phase(t,1.0,.55))));
    outlineCircle(480,270,lerp(42,216,phase(t,.35,1.2)),rgba(P.red,.25),1);
    const radius=118*reveal,rotation=-.1+(t-.7)*.33;
    ctx.save();ctx.translate(480,270);ctx.rotate(rotation);ctx.lineCap='round';ctx.strokeStyle=P.red;ctx.lineWidth=14*reveal;
    const fs=[1,.77,.98,.83,.96,.79,1,.82,.97,.80,.99,.76];
    for(let i=0;i<12;i++){const s=out(phase(t,.44+i*.026,.36)),a=-pi/2+i*TAU/12;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*radius*fs[i]*s,Math.sin(a)*radius*fs[i]*s);ctx.stroke();}ctx.restore();
    const chars='CLAUDE · MOTION DESIGN · SHOWREEL 2026 · CLAUDE · MOTION DESIGN · SHOWREEL 2026 · ';
    const shown=Math.floor(chars.length*phase(t,.75,.65)),ring=169;
    for(let i=0;i<shown;i++){const a=-1.4+i*TAU/chars.length+t*.19;ctx.save();ctx.translate(480+Math.cos(a)*ring,270+Math.sin(a)*ring);ctx.rotate(a+pi/2);text(chars[i],0,0,6.5,P.paper);ctx.restore();}
    return {name:'01 — IDENTITY',dark:true,phase:'radial Claude mark and circular type'};
  }
  function identity(t) {
    fill(t<2.25?P.ink:P.red);
    if(t<2.25){const radius=550*out(phase(t,1.85,.4));circle(480,270,radius+110,P.paper);circle(480,270,radius,P.red);}
    const size=lerp(158,187,smooth(phase(t,2.5,.62))),baseline=lerp(315,333,smooth(phase(t,2.5,.6)));
    if(t>2.37){line(71,119,889,119,rgba(P.ink,.55),.8);spaced('N° 01',71,111,6.6,rgba(P.ink,.6),.6);spaced('SHOWREEL — 2026',811,111,6.6,rgba(P.ink,.45),.5);}
    claudeLetters(t,71,baseline,size,817,P.ink);
    text('motion designer',480,386,39,P.paper,{italic:true,font:F.serif,align:'center',alpha:phase(t,2.76,.32)});
    return {name:'01 — IDENTITY',dark:false,phase:'expanding red disc, staggered CLAUDE glyph widths'};
  }
  const easingFunctions=[
    u=>u,
    u=>u<.5?4*u*u*u:1-(-2*u+2)**3/2,
    u=>u>=1?1:1-2**(-10*u),
    u=>1+2.70158*(u-1)**3+1.70158*(u-1)**2,
    u=>u===0?0:u===1?1:2**(-10*u)*Math.sin((u*10-.75)*TAU/3)+1,
    u=>{const n=7.5625,d=2.75;if(u<1/d)return n*u*u;if(u<2/d)return n*(u-=1.5/d)*u+.75;if(u<2.5/d)return n*(u-=2.25/d)*u+.9375;return n*(u-=2.625/d)*u+.984375;}
  ];
  function easing(t) {
    fill(P.red);ctx.save();if(t<3.86){const edge=680*(1-out(phase(t,3.25,.61)));ctx.beginPath();ctx.moveTo(0,edge);ctx.lineTo(960,edge-185);ctx.lineTo(960,540);ctx.lineTo(0,540);ctx.closePath();ctx.clip();}fill(P.paper);
    const fade=phase(t,3.62,.37)*(1-phase(t,5.05,.33));ctx.save();ctx.globalAlpha=fade;
    text('Six ways to get from A to B.',75,107,31,P.ink,{font:F.serif,italic:true});spaced('SAME DISTANCE · SAME DURATION (0.94s)',666,108,6.8,rgba(P.ink,.63),.6);
    text('A',330,136,6.8,P.ink,{align:'center'});text('B',850,136,6.8,P.ink,{align:'center'});
    const labels=['linear','ease-in-out','expo-out','back-out','elastic','bounce'];
    for(let i=0;i<6;i++){const y=166+i*46;text(String(i+1).padStart(2,'0'),75,y+3,7,P.red);text(labels[i],96,y+4,11,P.ink);line(330,y,850,y,rgba(P.ink,.17),.8);line(850,y-5,850,y+5,rgba(P.ink,.5),.8);line(230,y-17,230,y+14,rgba(P.ink,.18),.8);line(230,y+14,260,y+14,rgba(P.ink,.18),.8);ctx.beginPath();for(let n=0;n<=32;n++){const u=n/32,x=230+29*u,Y=y+12-easingFunctions[i](u)*25;n?ctx.lineTo(x,Y):ctx.moveTo(x,Y);}ctx.strokeStyle=P.ink;ctx.lineWidth=1.1;ctx.stroke();}
    ctx.restore();
    const incoming=out(phase(t,3.45,.52)),u=phase(t,config.timings.easing_travel,config.timings.easing_duration),merging=smooth(phase(t,5.07,.3));
    for(let i=0;i<6;i++){const y=166+i*46,c=[P.ink,P.blue,P.red][i%3],x=330+520*easingFunctions[i](u),X=lerp(lerp(150+i*137,x,incoming),480,merging),Y=lerp(lerp(294+i*7,y,incoming),270,merging);const a=i===1?1:1-merging;ctx.save();ctx.globalAlpha=a;
      if(t>4.15&&t<5.1){for(let k=4;k>0;k--){const old=phase(t-k*.009,config.timings.easing_travel,config.timings.easing_duration);ctx.globalAlpha=a*.065;circle(330+520*easingFunctions[i](old),Y,11,c);}}
      ctx.globalAlpha=a;circle(X,Y,lerp(11,i===1?25:11,merging),colorMix(P.ink,c,incoming));ctx.restore();}
    ctx.restore();return {name:'02 — EASING',dark:false,phase:'six independent easing functions over the same distance',travel:u};
  }
  function shapePoints(kind,r,rotation=0) {
    const N=config.geometry.morph_samples,points=[];
    for(let i=0;i<N;i++){
      const a=i*TAU/N-pi/2;let R=r;
      if(kind==='triangle'){const aa=((a+pi/2)%(TAU/3)+TAU/3)%(TAU/3)-pi/3;R=r*.5/Math.cos(aa)*(1-.23*Math.pow(Math.cos(aa*1.5),2));}
      if(kind==='star'){const q=i/N*10,j=Math.floor(q),f=q-j,a0=j*TAU/10-pi/2+rotation,a1=(j+1)*TAU/10-pi/2+rotation,r0=j%2?r*.46:r,r1=(j+1)%2?r*.46:r;points.push({x:lerp(Math.cos(a0)*r0,Math.cos(a1)*r1,f),y:lerp(Math.sin(a0)*r0,Math.sin(a1)*r1,f)});continue;}
      points.push({x:Math.cos(a+rotation)*R,y:Math.sin(a+rotation)*R});
    }return points;
  }
  function morphedPoints(t,r,rotation=0) {
    const circleP=shapePoints('circle',r,rotation),triP=shapePoints('triangle',r*1.3,rotation+pi/2),starP=shapePoints('star',r*1.17,rotation);
    const p=smooth(phase(t,6.10,.42)),q=smooth(phase(t,6.65,.42));return circleP.map((pt,i)=>({x:lerp(lerp(pt.x,triP[i].x,p),starP[i].x,q),y:lerp(lerp(pt.y,triP[i].y,p),starP[i].y,q)}));
  }
  function polygon(points,x,y,fillColor,strokeColor,width=1) {ctx.beginPath();points.forEach((pt,i)=>i?ctx.lineTo(x+pt.x,y+pt.y):ctx.moveTo(x+pt.x,y+pt.y));ctx.closePath();if(fillColor){ctx.fillStyle=fillColor;ctx.fill();}if(strokeColor){ctx.strokeStyle=strokeColor;ctx.lineWidth=width;ctx.stroke();}}
  function morph(t) {
    fill(P.paper);const blueFlood=phase(t,5.59,.35);circle(480,270,lerp(25,615,out(blueFlood)),P.blue);const whiteScale=out(phase(t,5.79,.31));
    if(t>5.94){line(480,31,480,507,rgba(P.paper,.11));line(129,270,831,270,rgba(P.paper,.14));outlineCircle(480,270,198,rgba(P.paper,.2),.7);for(let i=0;i<72;i++){const a=i*TAU/72;line(480+Math.cos(a)*196,270+Math.sin(a)*196,480+Math.cos(a)*199,270+Math.sin(a)*199,rgba(P.paper,.28),.7);}}
    for(let k=6;k>=1;k--){const old=t-k*.019;polygon(morphedPoints(old,config.geometry.morph_radius*(1+k*.061),(old-6)*.68),480,270,null,rgba(P.red,.32),1.2);}
    const rotation=(t-6)*.55;polygon(morphedPoints(t,config.geometry.morph_radius*whiteScale,rotation),480,270,P.paper);
    for(let i=0;i<config.geometry.orbit_count;i++){const a=-pi/2+i*TAU/12+(t-6)*.26;polygon(morphedPoints(t,8*whiteScale,a+pi/2),480+Math.cos(a)*198,270+Math.sin(a)*198,P.paper);}
    if(t>5.97){spaced(t<6.25?'MORPH  CIRCLE > TRIANGLE':t<6.75?'MORPH  CIRCLE > TRIANGLE':'MORPH  TRIANGLE > STAR',130,287,6.8,rgba(P.paper,.67),.55);text(`T ${phase(t,6.1,.42).toFixed(2)}   ROT ${String(Math.round((t-6)*180)).padStart(3,'0')}.0°`,832,287,6.8,rgba(P.paper,.68),{align:'right'});text('SPRING  F=2.6  ζ=0.30',832,301,6.8,rgba(P.paper,.54),{align:'right'});}
    return {name:'03 — MORPHING',dark:t>5.75,phase:t<6.1?'circle':t<6.65?'circle to triangle':'triangle to star'};
  }
  function systems(t) {
    fill(P.ink);
    if(t<7.80){const p=phase(t,7.45,.34),r=lerp(96,98,smooth(p));ctx.save();ctx.translate(480,270);ctx.rotate((1-p)*.4);ctx.fillStyle=P.paper;ctx.fillRect(-r,-r,r*2,r*2);ctx.restore();return {name:'04 — SYSTEMS',dark:true,phase:'square handoff'};}
    const tile=config.geometry.truchet_tile,scale=out(phase(t,7.80,.16)),clock=t-7.8;
    ctx.save();ctx.translate(480,270);ctx.scale(lerp(2.2,1,scale),lerp(2.2,1,scale));ctx.translate(-480,-270);
    for(let row=-1;row<8;row++)for(let col=-1;col<13;col++){
      const id=(row+3)*23+col+4,orientation=hash(id)>.5?1:0,cx=col*tile+tile/2,cy=row*tile+tile/2;
      const waveRadius=Math.max(0,(clock-.42)*365),distance=Math.hypot(cx-360,cy-270),pulse=clock>.42?Math.exp(-(((distance-waveRadius)/135)**2)):0;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(orientation*pi/2+pulse*.70*Math.sin(clock*4+hash(id+90)*5));ctx.strokeStyle=colorMix(P.paper,P.red,pulse);ctx.lineWidth=config.geometry.truchet_line;ctx.lineCap='round';
      const shrink=1-pulse*.28;const start=pi*.5*(1-shrink);
      ctx.beginPath();ctx.arc(-tile/2,-tile/2,tile/2,start,pi/2-start);ctx.stroke();ctx.beginPath();ctx.arc(tile/2,tile/2,tile/2,pi+start,pi*1.5-start);ctx.stroke();ctx.restore();
    }ctx.restore();text('TRUCHET  A + B',480,466,7,rgba(P.paper,.34),{align:'center'});return {name:'04 — SYSTEMS',dark:true,phase:'procedural Truchet quarter-circle tiling'};
  }
  function depth(t) {
    fill(P.ink);const cols=config.geometry.depth_columns,rows=config.geometry.depth_rows,focal=config.geometry.focal_length,m=out(phase(t,9.65,.67)),tilt=lerp(-.35,1.63,smooth(phase(t,10.45,.7))),yaw=(t-10.45)*.34;
    const verts=[];
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
      const u=i/cols*TAU,v=j/(rows-1),r=43+140*Math.sin(pi*v);
      const wave={x:(i/(cols-1)-.5)*390,y:(v-.5)*308,z:65*Math.sin(i*.3+j*.42+(t-9.6)*2)};
      let x=lerp(wave.x,r*Math.cos(u),m),y=lerp(wave.y,(v-.5)*350,m),z=lerp(wave.z,r*Math.sin(u),m);
      const Y=y*Math.cos(tilt)-z*Math.sin(tilt),Z=y*Math.sin(tilt)+z*Math.cos(tilt),X=x*Math.cos(yaw)+Z*Math.sin(yaw),zz=-x*Math.sin(yaw)+Z*Math.cos(yaw);
      const f=focal/(focal+zz);verts.push({x:480+X*f,y:270+Y*f,z:zz,alpha:clamp(.28+.72*(zz+220)/440),i,j});
    }
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=verts[j*cols+i],b=verts[j*cols+(i+1)%cols];if(m>.97||i<cols-1)line(a.x,a.y,b.x,b.y,rgba(P.paper,.065+a.alpha*.13),.55);if(j<rows-1){const b=verts[(j+1)*cols+i];line(a.x,a.y,b.x,b.y,rgba(P.paper,.045+a.alpha*.1),.5);}}
    for(const pt of [...verts].sort((a,b)=>b.z-a.z)){const red=hash(pt.i*37+pt.j*71)>.928;circle(pt.x,pt.y,red?2.8:lerp(.7,1.8,pt.alpha),rgba(red?P.red:P.paper,pt.alpha*.86));}
    text(`VERTICES ${rows*cols}  ·  FOCAL 1400  ·  ROT.Y ${Math.round(yaw*180/pi).toString().padStart(3,'0')}.0°`,480,466,7,P.paper,{align:'center'});
    return {name:'05 — DEPTH',dark:true,phase:'576 authored projected vertices: wave plane → capsule → axial ring',vertices:verts.length};
  }
  function motionWord(value,x,y,size,width,color,blur=0,yScale=1) {
    ctx.save();if(blur>0){for(let k=4;k>0;k--){ctx.globalAlpha=.085;word(value,x-k*blur*2,y,size,width,color,{yScale});}ctx.globalAlpha=1;ctx.filter=`blur(${blur*.3}px)`;}word(value,x,y,size,width,color,{yScale});ctx.restore();
  }
  function typography(t) {
    const scene={name:'06 — KINETIC TYPE',dark:true,phase:''};
    if(t<11.44){fill(P.red);const u=phase(t,11.10,.34),x=lerp(100,-10,out(u)),width=lerp(820,1000,u);motionWord('EASE',x,365,270,width,P.ink,Math.sin(pi*u)*7);scene.dark=false;scene.phase='EASE';}
    else if(t<11.68){fill(P.ink);const u=phase(t,11.44,.24),x=lerp(1000,192,out(u));motionWord('IN',x,384,330,730,P.paper,(1-u)*21);text('ACCELERATE →',55,86,7,rgba(P.paper,.5));scene.phase='IN';}
    else if(t<11.94){fill(P.paper);const u=phase(t,11.68,.26);motionWord('EASE',lerp(210,43,out(u)),480,515,870,P.blue,Math.sin(pi*u)*14,lerp(.88,1.13,u));scene.dark=false;scene.phase='EASE';}
    else if(t<12.21){fill(P.blue);const u=phase(t,11.94,.27);motionWord('OUT',lerp(-100,55,out(u)),366,265,690,P.paper,(1-u)*22);circle(816,354,29,P.red);text('← DECELERATE',905,84,7,rgba(P.paper,.6),{align:'right'});scene.phase='OUT';}
    else if(t<12.65){fill(P.lime);const u=phase(t,12.21,.44);if(t<12.4){motionWord('NEVER',43,354,198,874,P.ink,(1-phase(t,12.21,.18))*10,lerp(1.1,.86,u));}else{const offset=(t-12.4)*360;for(let row=0;row<5;row++){const y=100+row*111;for(let i=-1;i<3;i++){const x=i*620-offset+(row%2?220:0);word('NEVER',x,y,143,590,P.ink,row===2?{}:{outline:1.0});}}}scene.dark=false;scene.phase='NEVER / repeated outline rows';}
    else {
      fill(P.ink);const z=out(phase(t,12.88,.25)),scale=lerp(1,5.5,z),tx=(700-850*5.5)*z,ty=(420-340*5.5)*z;
      ctx.save();ctx.translate(tx,ty);ctx.scale(scale,scale);motionWord('LINEAR',181,350,141,620,P.paper,z*2);circle(826,337,15,P.red);ctx.restore();
      if(t<12.91){line(120,420,346,420,rgba(P.paper,.16),.7);line(120,196,120,420,rgba(P.paper,.16),.7);line(120,420,347,304,rgba(P.paper,.5),.8);text('f(t) = t',834,150,7,rgba(P.paper,.4));}scene.phase='LINEAR / zoom into the final R and red period';
    }
    return scene;
  }
  function signature(t) {
    fill(P.red);const q=t-13.13;
    if(q<.55){outlineCircle(480,270,lerp(46,660,out(phase(t,13.13,.55))),rgba(P.paper,(1-phase(t,13.25,.4))*.7),7);}
    const shift=smooth(phase(t,13.48,.59)),X=lerp(480,176,shift),Y=lerp(270,250,shift),r=lerp(57,70,shift);
    const confettiFade=1-phase(t,13.85,.65);
    for(let i=0;i<68;i++){const a=hash(i*3)*TAU,speed=42+hash(i*3+1)*190,elapsed=Math.max(0,q-.07),x=480+Math.cos(a)*speed*elapsed,y=270+Math.sin(a)*speed*elapsed+65*elapsed*elapsed,colour=[P.paper,P.ink,P.blue][i%3];ctx.save();ctx.globalAlpha=confettiFade*.8;circle(x,y,1+hash(i*3+2)*1.2,colour);ctx.restore();}
    starLogo(X,Y,r,P.ink,lerp(.26,-.09,shift),lerp(1,.75,shift));
    ctx.save();ctx.globalAlpha=out(phase(t,13.68,.38));claudeLetters(t,258,279,112,575,P.ink,true);ctx.restore();
    text('motion designer',258,335,47,P.ink,{font:F.serif,italic:true,alpha:phase(t,13.85,.32)});
    ctx.save();ctx.globalAlpha=phase(t,14.02,.27);line(259,363,835,363,rgba(P.ink,.7),.8);spaced('SHOWREEL 2026  ·  15 SECONDS  ·  EVERY FRAME WRITTEN IN CODE',259,382,7.4,P.ink,.58);outlineCircle(638,378,8.5,rgba(P.ink,.5),.7);circle(638,378,2.8,P.ink);spaced('AVAILABLE FOR NEW PROJECTS',684,382,7.4,P.ink,.5);ctx.restore();
    return {name:'07 — FIN',dark:false,phase:'particle burst, left-moving mark and final signature'};
  }

  function resize() { canvas.width=window.innerWidth;canvas.height=window.innerHeight;if(loaded)seek(lastTime); }
  function seek(t) {
    if(!loaded)throw new Error('Wait for ready() before calling seek(t)');
    if(!Number.isFinite(Number(t)))throw new TypeError('Time must be finite');t=clamp(Number(t),0,config.duration);lastTime=t;
    ctx.setTransform(canvas.width/960,0,0,canvas.height/540,0,0);ctx.globalAlpha=1;ctx.filter='none';ctx.lineCap='butt';ctx.lineJoin='miter';ctx.setLineDash([]);
    let detail;
    if(t<config.timings.identity_type)detail=intro(t);else if(t<config.timings.easing)detail=identity(t);else if(t<config.timings.morphing)detail=easing(t);else if(t<config.timings.systems)detail=morph(t);else if(t<config.timings.depth)detail=systems(t);else if(t<config.timings.kinetic_type)detail=depth(t);else if(t<config.timings.signature)detail=typography(t);else detail=signature(t);
    grain(t);ctx.save();ctx.globalAlpha=phase(t,.08,.25);hud(t,detail.name,detail.dark);ctx.restore();
    state={reference_slug:config.reference_slug,time:Number(t.toFixed(6)),scene:detail.name,action:detail.phase,source_frames_used:0,source_video_used:false,vertices:detail.vertices||0,seed:config.seed,loop:false};return state;
  }
  const readyPromise=fetch('_dependencies/18e1ad513767-project.json').then(r=>{if(!r.ok)throw Error('Cannot read project.json');return r.json();}).then(async value=>{config=value;P=config.palette;F=config.fonts;await document.fonts.ready;loaded=true;resize();seek(0);return true;}).catch(error=>{document.getElementById('error').style.display='block';document.getElementById('error').textContent=String(error.stack||error);throw error;});
  window.ready=()=>readyPromise;window.seek=seek;window.getState=()=>state;Object.defineProperty(window,'duration',{get:()=>config?config.duration:15});window.addEventListener('resize',resize);
  if(new URLSearchParams(location.search).get('render')!=='1')readyPromise.then(()=>{let origin=null;function tick(stamp){if(origin===null)origin=stamp;seek(((stamp-origin)/1000)%config.duration);requestAnimationFrame(tick);}requestAnimationFrame(tick);});
})();
