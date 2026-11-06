/* Case 004, @ajith_io: independent geometry reconstruction of the observed film. */
(() => {
  'use strict';
  const canvas=document.getElementById('film'),g=canvas.getContext('2d',{alpha:false});
  const renderMode=new URLSearchParams(location.search).get('render')==='1';
  document.body.classList.toggle('render',renderMode);
  const DEFAULT={duration:15,bpm:128,brand:'Claude',fps:30,source_visual_fps:60,palette:{black:'#111113',red:'#f44034',blue:'#3734f1',yellow:'#f5ce3b',cream:'#eee8df'},copy:{header:'CLAUDE MOTION REEL 2026',headline:['EVERY','FRAME','ON','PURPOSE.'],rings:['MOTION DESIGN • ANIMATION • ART DIRECTION • ','TYPOGRAPHY • 3D • ILLUSTRATION • TYPOGRAPHY • 3D • ILLUSTRATION • ','RHYTHM • TIMING • EASING • RHYTHM • TIMING • EASING • ','SHAPE • LINE • COLOR • SHAPE • LINE • COLOR • '],role:'MOTION DESIGNER',footer:'900 FRAMES · 60 FPS · 128 BPM · WRITTEN ENTIRELY IN CODE'}};
  let P=DEFAULT,lastTime=0,filmTime=0,fontsReady=false;
  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,k)=>a+(b-a)*k;
  const progress=(t,a,b)=>clamp((t-a)/(b-a));
  const ease=u=>{u=clamp(u);return u*u*(3-2*u);};
  const smooth=(t,a,b)=>ease(progress(t,a,b));
  function spring(t,a,d=.35){const u=(t-a)/d;if(u<=0)return 0;if(u>=1)return 1;const f=x=>1-Math.exp(-8*x)*(Math.cos(13*x)+(8/13)*Math.sin(13*x));return f(u)/f(1);}
  function key(t,list){if(t<=list[0][0])return list[0][1];for(let i=1;i<list.length;i++)if(t<list[i][0])return mix(list[i-1][1],list[i][1],smooth(t,list[i-1][0],list[i][0]));return list[list.length-1][1];}
  function disc(x,y,r,color){if(r<=0)return;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=color;g.fill();}
  function stroke(x1,y1,x2,y2,w,color){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineWidth=w;g.strokeStyle=color;g.lineCap='round';g.stroke();}
  function rgb(color){const a=color.replace('#','');return [parseInt(a.slice(0,2),16),parseInt(a.slice(2,4),16),parseInt(a.slice(4,6),16)];}
  function blend(a,b,q){const aa=rgb(a),bb=rgb(b);return `rgb(${aa.map((v,i)=>Math.round(mix(v,bb[i],q))).join(',')})`;}
  function font(size,weight=800,family='ReplicaSans'){g.font=`${weight} ${size}px "${family}", Arial, sans-serif`;g.textBaseline='middle';g.textAlign='left';if('fontStretch' in g)g.fontStretch='normal';}
  function text(str,x,y,size=24,color=P.palette.cream,weight=600,align='left',family='ReplicaSans'){font(size,weight,family);g.textAlign=align;g.fillStyle=color;g.fillText(String(str),x,y);}
  const metrics=new Map();
  function glyphs(str,size,weight=800,spacing=0){const cacheKey=[str,size,weight,spacing].join('|');if(metrics.has(cacheKey))return metrics.get(cacheKey);font(size,weight);const chars=Array.from(str),widths=chars.map(ch=>g.measureText(ch).width+spacing),total=widths.reduce((a,b)=>a+b,0);const out={chars,widths,total};metrics.set(cacheKey,out);return out;}
  function spaced(str,x,y,size,color,spacing=3,weight=600,align='left'){const m=glyphs(String(str),size,weight,spacing);let xx=align==='center'?x-m.total/2:align==='right'?x-m.total:x;for(let i=0;i<m.chars.length;i++){text(m.chars[i],xx,y,size,color,weight);xx+=m.widths[i];}}
  const noise=document.createElement('canvas');noise.width=960;noise.height=540;const ng=noise.getContext('2d'),pixels=ng.createImageData(960,540);let seed=971231;
  for(let i=0;i<pixels.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const v=seed>>>24;pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}ng.putImageData(pixels,0,0);
  function background(color){g.fillStyle=color;g.fillRect(0,0,1920,1080);g.save();g.globalAlpha=.055;g.globalCompositeOperation='soft-light';g.drawImage(noise,0,0,1920,1080);g.restore();}
  function brackets(x,y,w,h,color,lineWidth=8,length=55){g.strokeStyle=color;g.lineWidth=lineWidth;g.lineCap='butt';for(const [xx,yy,dx,dy] of [[x,y,1,1],[x+w,y,-1,1],[x,y+h,1,-1],[x+w,y+h,-1,-1]]){g.beginPath();g.moveTo(xx+dx*length,yy);g.lineTo(xx,yy);g.lineTo(xx,yy+dy*length);g.stroke();}}
  function hud(t,light=true){if(t<.07)return;const color=light?'#bfbdbb':'#242123';g.save();g.globalAlpha=clamp(spring(t,.07,.14));brackets(56,56,1808,968,color,2,28);
    if(t<13.28){spaced(P.copy.header,86,83,16,color,4.2,550);const bar=Math.min(8,Math.floor(t/1.875)+1);for(let i=0;i<4;i++){g.strokeStyle=color;g.lineWidth=1.1;g.strokeRect(1542+i*17,78,9,9);if(i===Math.floor((t%1.875)/.46875))g.fillRect(1542+i*17,78,9,9);}spaced(`BAR ${bar}/8`,1618,84,16,color,3.1,550);spaced(`${P.bpm||128} BPM`,1856,84,16,color,3,700,'right');}
    const seconds=Math.floor(t),frames=Math.floor((t-seconds)*60+1e-6),code=`00:00:${String(seconds).padStart(2,'0')}:${String(frames).padStart(2,'0')}`;
    if(t<13.28)spaced(`F${String(Math.floor(t*60)+1).padStart(4,'0')}`,1603,997,16,color,2.5,500);
    spaced(code,1835,997,16,color,2.9,700,'right');g.restore();
  }
  function dots(t){background(P.palette.black);const birth=clamp(spring(t,.07,.2));
    if(t<.46875){disc(960,540,29*birth,P.palette.red);return;}
    const group=t<.9375?2:t<1.40625?4:8,start=group===2?.46875:group===4?.9375:1.40625,q=clamp(spring(t,start,.23));
    const theta=t*3.25+.26,radius=group===2?mix(0,80,q):group===4?mix(80,115,q):mix(115,170,q),r=group===8?key(t,[[1.40625,22],[1.69,22],[1.84,30]]):23;
    for(let i=0;i<group;i++){const a=theta+i*Math.PI*2/group;const parentA=theta+Math.floor(i/2)*Math.PI*2/(group/2);const oldR=group===2?0:group===4?80:115;disc(960+mix(Math.cos(parentA)*oldR,Math.cos(a)*radius,q),540+mix(Math.sin(parentA)*oldR,Math.sin(a)*radius,q),r,P.palette.red);}
  }
  function bigWord(word,x,y,size,scaleX=1,rotation=0){g.save();g.translate(x,y);g.rotate(rotation);g.scale(scaleX,1);text(word,0,0,size,P.palette.black,950);g.restore();}
  function headline(t){background(P.palette.red);const words=P.copy.headline;
    if(t<2.32){const q=clamp(spring(t,1.875,.22));font(290,950);const w=g.measureText(words[0]).width;g.save();g.translate(960,540+280*(1-q));g.scale(1.1,1);text(words[0],-w/2,0,290,P.palette.black,950);g.restore();return;}
    const fly=smooth(t,2.32,2.67),settle=smooth(t,2.67,2.9),second=smooth(t,2.91,3.25),purpose=smooth(t,3.18,3.54);
    const fontSize=mix(224,205,smooth(t,3.2,3.6)),left=key(t,[[2.32,155],[2.86,155],[3.06,570],[3.22,560],[3.53,140]]),yy=key(t,[[2.32,520],[2.86,520],[3.07,324],[3.22,350],[3.53,416]]);
    const zoom=key(t,[[2.32,1],[2.87,1],[3.07,1.17],[3.25,1.17],[3.54,1]]);
    g.save();g.translate(left,yy);g.scale(zoom,zoom);
    bigWord(words[0],0,0,fontSize,1.03);font(fontSize,950);const everyWidth=g.measureText(words[0]).width*1.03+35;
    const frameY=mix(-520,0,fly),frameX=mix(everyWidth+300,everyWidth,fly),frameRotation=mix(-.58,0,fly);
    if(fly<1){for(let i=4;i>0;i--){g.save();g.globalAlpha=.07;bigWord(words[1],frameX+i*18,frameY-i*34,fontSize,1.03,frameRotation-i*.02);g.restore();}}
    bigWord(words[1],frameX,frameY,fontSize,1.03,frameRotation);
    if(fly>.45){font(fontSize,950);const frameWidth=g.measureText(words[1]).width*1.03;g.save();g.translate(frameX,frameY);g.rotate(frameRotation);brackets(-28,-103,frameWidth+53,212,P.palette.black,9,49);g.restore();}
    const lineY=185;
    g.save();g.beginPath();g.rect(-40,98,1750,270);g.clip();bigWord(words[2],0,lineY+405*(1-second),fontSize,1.03);
    font(fontSize,950);const onWidth=g.measureText(words[2]).width*1.03+45;
    g.beginPath();g.rect(onWidth-1,99,1400*purpose,270);g.clip();bigWord(words[3],onWidth,lineY+90*(1-purpose),fontSize,1.03);g.restore();g.restore();
  }
  function pathShape(shape,angle,scale=1){g.beginPath();const n=120;for(let i=0;i<n;i++){const a=i/n*Math.PI*2,cs=Math.abs(Math.cos(a)),sn=Math.abs(Math.sin(a)),square=205/Math.pow(Math.pow(cs,6)+Math.pow(sn,6),1/6),sector=((a+Math.PI/2+Math.PI*8)%(Math.PI*2/3))-Math.PI/3,triangle=132/Math.cos(sector),r=shape<=1?mix(234,square,shape):mix(square,triangle,shape-1),x=Math.cos(a+angle)*r*scale,y=Math.sin(a+angle)*r*scale;if(i===0)g.moveTo(x,y);else g.lineTo(x,y);}g.closePath();}
  const flower=[];for(let ring=1;ring<=18;ring++)for(let a=0;a<40;a++){const theta=a*Math.PI*2/40+ring*.245,r=ring/18*235*(.9+.14*Math.cos(theta*6));flower.push({x:Math.cos(theta)*r,y:Math.sin(theta)*r});}
  function flowerDots(t,amount=1){const shrink=mix(1.06,1.02,smooth(t,5.3,5.625));for(let i=0;i<flower.length;i++){const p=flower[i],a=t*.7;disc(960+(p.x*Math.cos(a)-p.y*Math.sin(a))*shrink,540+(p.x*Math.sin(a)+p.y*Math.cos(a))*shrink,6.9*amount,P.palette.red);}}
  function shapes(t){background(P.palette.black);const pop=clamp(spring(t,3.75,.22)),square=smooth(t,4.2,4.43),triangle=smooth(t,4.72,4.96),shape=square+triangle,angle=Math.max(0,(t-4.077)*4.85),flowerQ=smooth(t,5.23,5.43);
    if(flowerQ<1){const color=triangle>0?blend(P.palette.blue,P.palette.yellow,triangle):blend(P.palette.red,P.palette.blue,square);
      g.save();g.translate(960,540);for(let j=4;j>0;j--){g.save();g.globalAlpha=.045*(1-flowerQ);pathShape(shape,angle-j*.06,pop);g.fillStyle=color;g.fill();g.restore();}
      pathShape(shape,angle,pop*(1-flowerQ));g.fillStyle=color;g.fill();
      if(t>3.92){g.save();g.rotate(angle);g.scale(1-flowerQ,1-flowerQ);g.strokeStyle='#aaa9a6';g.lineWidth=1.8;g.strokeRect(-292,-292,584,584);for(const x of [-292,0,292])for(const y of [-292,0,292])if(x||y){g.fillStyle=P.palette.black;g.fillRect(x-7,y-7,14,14);g.strokeRect(x-7,y-7,14,14);}g.restore();
        stroke(-15,0,15,0,1.3,'#d1cdc6');stroke(0,-15,0,15,1.3,'#d1cdc6');g.beginPath();g.arc(0,0,9,0,Math.PI*2);g.stroke();}
      g.restore();
      if(t>3.92){text(`ROT ${(angle*180/Math.PI%360).toFixed(1).padStart(5,'0')}°`,1268,238,20,'#d6d4d1',600);text(`SHAPE ${shape<.5?'CIRCLE':shape<1.5?'SQUARE':'TRIANGLE'}`,1268,270,20,'#929292',500);}
    }
    if(flowerQ>0)flowerDots(t,flowerQ);
  }
  function rotate3(p,ax,ay,az){let y=p.y*Math.cos(ax)-p.z*Math.sin(ax),z=p.y*Math.sin(ax)+p.z*Math.cos(ax),x=p.x*Math.cos(ay)+z*Math.sin(ay);z=-p.x*Math.sin(ay)+z*Math.cos(ay);const xx=x*Math.cos(az)-y*Math.sin(az);y=x*Math.sin(az)+y*Math.cos(az);return{x:xx,y,z};}
  function project3(p,focal=1500,centerY=540){const k=focal/(focal-p.z);return{x:960+p.x*k,y:centerY+p.y*k,z:p.z,k};}
  function grid(t){background(P.palette.cream);const unfold=smooth(t,5.625,6.02),tilt=smooth(t,7.14,7.5),cols=34,rows=19;
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const i=row*cols+col,p=flower[i%flower.length],targetX=(col-(cols-1)/2)*58,targetY=(row-(rows-1)/2)*58,x=mix(p.x,targetX,unfold),y=mix(p.y,targetY,unfold),dist=Math.hypot(x,y),wave=Math.sin(dist*.01-(t-5.8)*13),activation=Math.pow(Math.max(0,wave),7),displace=14*Math.sin(dist*.01-(t-5.8)*13)*unfold;
      const angle=Math.atan2(y,x),world={x:x+Math.cos(angle)*displace,y:y+Math.sin(angle)*displace,z:tilt*65*Math.sin(col*.2+t*3)};const v=project3(rotate3(world,tilt*1.07,tilt*.1,tilt*-.11),1500,540+tilt*120);
      disc(v.x,v.y,mix(5.1,10,activation)*mix(1,v.k,tilt),blend(P.palette.black,P.palette.red,activation));}
  }
  const N=720,edges=[];const cubeCorners=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])cubeCorners.push({x:x*255,y:y*255,z:z*255});
  for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const a=cubeCorners[i],b=cubeCorners[j];if([a.x!==b.x,a.y!==b.y,a.z!==b.z].filter(Boolean).length===1)edges.push([a,b]);}
  function cloudPoint(i,t){const planeToSphere=smooth(t,7.5,7.92),torus=smooth(t,8.08,8.43),cube=smooth(t,8.68,8.99),z=1-2*(i+.5)/N,phi=i*2.39996323,r=Math.sqrt(1-z*z),sphere={x:340*Math.cos(phi)*r,y:340*z,z:340*Math.sin(phi)*r};
    const u=(i%48)/48*Math.PI*2,v=Math.floor(i/48)/15*Math.PI*2,R=240+94*Math.cos(v),ring={x:R*Math.cos(u),y:94*Math.sin(v),z:R*Math.sin(u)};
    const plane={x:((i%36)-17.5)*56,y:(Math.floor(i/36)-9.5)*48,z:40*Math.sin(i*.1+t*3)};
    const [a,b]=edges[i%12],q=Math.floor(i/12)/(N/12-1),edge={x:mix(a.x,b.x,q),y:mix(a.y,b.y,q),z:mix(a.z,b.z,q)};
    return{x:mix(mix(mix(plane.x,sphere.x,planeToSphere),ring.x,torus),edge.x,cube),y:mix(mix(mix(plane.y,sphere.y,planeToSphere),ring.y,torus),edge.y,cube),z:mix(mix(mix(plane.z,sphere.z,planeToSphere),ring.z,torus),edge.z,cube)};
  }
  function cloud(t){background(P.palette.blue);const cube=smooth(t,8.68,8.99),approach=mix(1,1.6,smooth(t,9.02,9.375)),ax=mix(1.05,.55,smooth(t,7.5,7.93))+(t-8)*.8,ay=(t-7.5)*.76,az=(t-7.5)*.32;
    const points=[];for(let i=0;i<N;i++){let v=rotate3(cloudPoint(i,t),ax,ay,az);v={x:v.x*approach,y:v.y*approach,z:v.z*approach};const p=project3(v,1700);points.push({...p,i});}points.sort((a,b)=>a.z-b.z);
    for(const p of points){g.save();g.globalAlpha=mix(.27,.96,clamp((p.z+450)/900))*(1-.18*cube);disc(p.x,p.y,mix(4.6,1.5,cube)*p.k,p.i%37===0?P.palette.yellow:P.palette.cream);g.restore();}
    if(cube>.02){g.save();g.globalAlpha=cube*.68;for(const [a,b] of edges){const aa=project3(rotate3({x:a.x*approach,y:a.y*approach,z:a.z*approach},ax,ay,az),1700),bb=project3(rotate3({x:b.x*approach,y:b.y*approach,z:b.z*approach},ax,ay,az),1700);stroke(aa.x,aa.y,bb.x,bb.y,3.2,P.palette.cream);}g.restore();}
  }
  const trajectory=[];
  const bezier=(a,b,c,d,u)=>({x:(1-u)**3*a.x+3*(1-u)**2*u*b.x+3*(1-u)*u*u*c.x+u**3*d.x,y:(1-u)**3*a.y+3*(1-u)**2*u*b.y+3*(1-u)*u*u*c.y+u**3*d.y});
  const knots=[[-820,1010],[850,920],[1620,580],[1360,230],[1140,-100],[540,10],[560,430],[550,600],[850,680],[1430,720],[2000,830],[2590,845],[2980,640]];
  let distance=0;for(let segment=0;segment<4;segment++)for(let i=0;i<=200;i++){if(segment&&i===0)continue;const points=knots.slice(segment*3,segment*3+4).map(([x,y])=>({x,y})),p=bezier(...points,i/200),previous=trajectory[trajectory.length-1];if(previous)distance+=Math.hypot(p.x-previous.x,p.y-previous.y);trajectory.push({...p,d:distance});}
  function ribbonHead(t){return key(t,[[9.375,.08],[9.6,.19],[9.8,.27],[10,.44],[10.2,.57],[10.4,.73],[10.6,.83],[10.8,.97],[11,1.15],[11.25,1.55]])*distance;}
  function ribbon(t){background(P.palette.yellow);const head=ribbonHead(t),tail=head-3400;g.save();g.translate(960,540);g.scale(.65,.65);g.translate(-960,-540);
    const burst=Math.sin(Math.PI*progress(t,10.27,10.57));if(t>=10.27&&t<=10.57)for(let i=0;i<9;i++){const a=i*Math.PI*2/9;stroke(970+Math.cos(a)*(55+70*burst),675+Math.sin(a)*(55+70*burst),970+Math.cos(a)*(71+88*burst),675+Math.sin(a)*(71+88*burst),8,P.palette.black);}
    const visible=trajectory.filter(p=>p.d>=tail&&p.d<=head);if(visible.length<2){g.restore();return;}
    g.lineCap='round';g.lineJoin='round';for(const [w,color] of [[99,P.palette.black],[81,P.palette.red],[61,P.palette.cream],[39,P.palette.blue],[17,P.palette.cream]]){g.beginPath();visible.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.lineWidth=w/.65;g.strokeStyle=color;g.stroke();}
    const endpoint=visible[visible.length-1];for(let j=3;j>=1;j--){const p=trajectory.find(p=>p.d>=head-j*27);if(p){g.save();g.globalAlpha=.07;disc(p.x,p.y,48,P.palette.black);disc(p.x,p.y,35,P.palette.red);g.restore();}}
    disc(endpoint.x,endpoint.y,43,P.palette.red);g.restore();
  }
  function drawTypeRings(t,trailOffset=0,alpha=1){const q=smooth(t,11.77,12.27),settle=smooth(t,11.96,12.3),spin=(t-12.27)*1.5+10*smooth(t,12.88,13.125)+trailOffset;
    const radii=[455,366,279,205],sizes=[57,47,46,37],ys=[257,390,511,641],weights=[900,750,900,650];
    for(let row=0;row<4;row++){const m=glyphs(P.copy.rings[row],sizes[row],weights[row],row===0?12:5);let advance=0;const radius=radii[row]*mix(2.75,1,settle),cy=mix(1280,540,settle);
      for(let i=0;i<m.chars.length;i++){const fraction=(advance+m.widths[i]/2)/m.total,theta=(fraction-.5)*Math.PI*2+(row%2?-1:1)*spin,px=960+Math.sin(theta)*radius,py=cy-Math.cos(theta)*radius,lx=960-m.total/2+advance+((row%2?-1:1)*(t-11.25)*210),ly=ys[row],x=mix(lx,px,q),y=mix(ly,py,q);
        g.save();g.globalAlpha=alpha;g.translate(x,y);g.rotate(theta*q);font(sizes[row],weights[row]);g.textAlign='center';
        if(m.chars[i]==='•')disc(0,0,sizes[row]*.17,P.palette.red);
        else if(row===1||row===3){g.strokeStyle=P.palette.cream;g.lineWidth=row===1?2.4:1.8;g.strokeText(m.chars[i],0,0);}else{g.fillStyle=P.palette.cream;g.fillText(m.chars[i],0,0);}g.restore();advance+=m.widths[i];}
    }
    const dot=clamp(spring(t,12.22,.18));disc(960,540,42*dot,P.palette.red);
  }
  function rings(t){background(P.palette.black);if(t>12.85){for(let i=3;i>=1;i--)drawTypeRings(t,-i*.12,.075);}drawTypeRings(t);}
  function ending(t){background(P.palette.black);const flood=smooth(t,13.125,13.28);disc(960,540,mix(42,1200,flood),P.palette.cream);if(flood<1){disc(960,540,42,P.palette.red);return;}
    background(P.palette.cream);const word=String(P.brand||'Claude');font(235,500,'Georgia');const widths=Array.from(word).map(ch=>g.measureText(ch).width),total=widths.reduce((a,b)=>a+b,0),left=960-(total+65)/2,dotX=left+total+33;
    g.save();g.beginPath();g.rect(left-20,360,total+60,245);g.clip();let x=left;
    Array.from(word).forEach((ch,i)=>{const rise=clamp(spring(t,13.29+i*.037,.27));text(ch,x,520+240*(1-rise),235,P.palette.black,500,'left','Georgia');x+=widths[i];});g.restore();
    const hop=smooth(t,13.23,13.67);disc(mix(960,dotX,hop),mix(540,562,hop)-285*Math.sin(Math.PI*hop),mix(42,22,hop),P.palette.red);
    g.save();g.beginPath();g.rect(360,660,1200,74);g.clip();spaced(P.copy.role,960,691+85*(1-clamp(spring(t,13.64,.3))),27,P.palette.black,8.7,600,'center');g.restore();
    g.save();g.beginPath();g.rect(260,737,1400*smooth(t,13.82,14.93),70);g.clip();spaced(P.copy.footer,960,755,15,'#817e79',3.25,450,'center');g.restore();
  }
  const phases=[['dot division and orbit',0,1.875,dots],['EVERY FRAME ON PURPOSE typography',1.875,3.75,headline],['transform circle-square-triangle-flower',3.75,5.625,shapes],['ripple point grid and perspective plane',5.625,7.5,grid],['sphere-torus-wirecube point cloud',7.5,9.375,cloud],['striped Bezier loop ribbon',9.375,11.25,ribbon],['horizontal glyph ribbons to circular rings',11.25,13.125,rings],['cream flood and Claude lockup',13.125,15,ending]];
  const duration=()=>Number(P.duration)>0?Number(P.duration):15;
  function state(){const phase=phases.find(p=>filmTime>=p[1]&&filmTime<p[2])||phases[7];return{time:lastTime,internalTime:filmTime,duration:duration(),phase:phase[0],bar:Math.min(8,Math.floor(filmTime/1.875)+1),sceneProgress:clamp((filmTime-phase[1])/(phase[2]-phase[1])),width:1920,height:1080,sourceFPS:60,renderMode,fontsReady,provenance:'independent-reimplementation',loop:false,userApproved:false};}
  window.project=P;window.duration=duration();window.getState=state;
  window.seek=async time=>{P=window.project||P;P.palette={...DEFAULT.palette,...P.palette};P.copy={...DEFAULT.copy,...P.copy};const n=Number(time);lastTime=Number.isFinite(n)?clamp(n,0,duration()):0;filmTime=lastTime/duration()*15;window.duration=duration();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';g.shadowBlur=0;g.shadowColor='transparent';g.shadowOffsetX=g.shadowOffsetY=0;const phase=phases.find(p=>filmTime>=p[1]&&filmTime<p[2])||phases[7];phase[3](filmTime);hud(filmTime,filmTime<1.875||(filmTime>=3.75&&filmTime<5.625)||(filmTime>=7.5&&filmTime<9.375)||(filmTime>=11.25&&filmTime<13.125));document.getElementById('scrub').max=String(duration());document.getElementById('scrub').value=String(lastTime);document.getElementById('clock').textContent=`${lastTime.toFixed(2)} / ${duration().toFixed(2)}`;return state();};
  const initialized=(async()=>{const response=await fetch('project.json');if(!response.ok)throw new Error('project.json missing');P={...DEFAULT,...await response.json()};P.palette={...DEFAULT.palette,...P.palette};P.copy={...DEFAULT.copy,...P.copy};window.project=P;window.duration=duration();await document.fonts.load('900 240px ReplicaSans','EVERY FRAME');await document.fonts.ready;fontsReady=document.fonts.check('900 240px ReplicaSans');await window.seek(0);return state();})();window.ready=()=>initialized;
  let playing=!renderMode,startStamp=null,startTime=0,request=0;function preview(stamp){if(!playing)return;if(startStamp===null)startStamp=stamp;window.seek((startTime+(stamp-startStamp)/1000)%duration());request=requestAnimationFrame(preview);}function play(value){playing=value;document.getElementById('toggle').textContent=value?'暂停':'播放';if(value){startTime=lastTime;startStamp=null;request=requestAnimationFrame(preview);}else cancelAnimationFrame(request);}document.getElementById('toggle').addEventListener('click',()=>play(!playing));document.getElementById('scrub').addEventListener('input',e=>{play(false);window.seek(Number(e.target.value));});initialized.then(()=>{if(playing)request=requestAnimationFrame(preview);}).catch(error=>{console.error(error);background('#111');text(error.message,960,540,32,'#fff',500,'center');});
})();
