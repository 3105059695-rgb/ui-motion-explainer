/* Independent editable reconstruction. All time evolution is evaluated at t.
   No source video, source frame images, animated textures or integrations. */
(() => {
  'use strict';
  const canvas = document.getElementById('stage'), ctx = canvas.getContext('2d');
  const W = 1280, H = 720, TAU = Math.PI * 2;
  let project, P, state = {}, lastTime = 0;
  const clamp = (x,a=0,b=1) => Math.max(a,Math.min(b,x));
  const lerp = (a,b,t) => a+(b-a)*t;
  const smooth = x => { x=clamp(x); return x*x*(3-2*x); };
  const ease = x => 1-Math.pow(1-clamp(x),3);
  const interval = (t,a,b) => smooth((t-a)/(b-a));
  const rand = n => { const x=Math.sin(n*127.1+311.7)*43758.5453123; return x-Math.floor(x); };
  const spring = x => x<=0?0:1-Math.exp(-12*x)*Math.cos(17*x);
  function circle(x,y,r,color,stroke=false,width=1) {
    if(r<=0)return;ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx[stroke?'strokeStyle':'fillStyle']=color;
    ctx.lineWidth=width;ctx[stroke?'stroke':'fill']();
  }
  function line(x1,y1,x2,y2,color,width=1) {
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function text(s,x,y,size,color=P.cream,font='Anton',align='center') {
    ctx.font=`${size}px ${font}`;ctx.textAlign=align;ctx.fillStyle=color;ctx.fillText(s,x,y);
  }
  function tracked(s,x,y,size,color,gap=3) {
    ctx.font=`600 ${size}px monospace`;const widths=[...s].map(c=>ctx.measureText(c).width);
    let xx=x-(widths.reduce((a,b)=>a+b,0)+gap*(s.length-1))/2;
    ctx.fillStyle=color;ctx.textAlign='left';[...s].forEach((c,i)=>{ctx.fillText(c,xx,y);xx+=widths[i]+gap;});
  }
  function roundRect(x,y,w,h,r,color) { ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fill(); }
  function rotated(p,rx,ry,rz) {
    let [x,y,z]=p;
    [y,z]=[y*Math.cos(rx)-z*Math.sin(rx),y*Math.sin(rx)+z*Math.cos(rx)];
    [x,z]=[x*Math.cos(ry)+z*Math.sin(ry),-x*Math.sin(ry)+z*Math.cos(ry)];
    return [x*Math.cos(rz)-y*Math.sin(rz),x*Math.sin(rz)+y*Math.cos(rz),z];
  }
  function project3(p,depth=1200) { const f=depth/(depth+p[2]);return [640+p[0]*f,360+p[1]*f,p[2],f]; }
  const grains=[];
  function makeGrain() {
    for(let k=0;k<8;k++) {
      const c=document.createElement('canvas');c.width=W;c.height=H;
      const g=c.getContext('2d'),im=g.createImageData(W,H);
      let seed=(k+1)*613;
      for(let i=0;i<im.data.length;i+=4) {
        seed=(Math.imul(seed,1664525)+1013904223)>>>0;
        im.data[i]=im.data[i+1]=im.data[i+2]=seed>>>24;im.data[i+3]=22;
      }g.putImageData(im,0,0);grains.push(c);
    }
  }
  function texture(t,amount=1) {
    ctx.save();ctx.globalAlpha=.60*amount;ctx.globalCompositeOperation='soft-light';
    ctx.drawImage(grains[Math.floor(t*30)%8],0,0);ctx.restore();
    const vg=ctx.createRadialGradient(640,355,120,640,355,775);
    vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,`rgba(0,0,0,${.22*amount})`);
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }
  function hud(t,chapter,dark=false) {
    ctx.save();ctx.globalAlpha=(1-interval(t,14.66,14.82))*interval(t,.08,.30)*.73;
    const c=dark?'#141421':'#a3a2a7';ctx.strokeStyle=c;ctx.lineWidth=.8;
    [[26,26,1,1],[1254,26,-1,1],[26,694,1,-1],[1254,694,-1,-1]].forEach(([x,y,sx,sy])=>{
      ctx.beginPath();ctx.moveTo(x+sx*20,y);ctx.lineTo(x,y);ctx.lineTo(x,y+sy*20);ctx.stroke();
    });
    text(`${project.brand} // MOTION REEL`,48,57,14,c,'monospace','left');
    const f=Math.floor(t*30)+1,sec=Math.floor(f/30),ff=f%30;
    text(`00:00:${String(sec).padStart(2,'0')}:${String(ff).padStart(2,'0')}`,1234,57,14,c,'monospace','right');
    text(`SC.${String(chapter+1).padStart(2,'0')} / ${project.chapters[chapter]}`,48,678,14,c,'monospace','left');
    text('1920x1080 / 30FPS / 128BPM',1234,678,14,c,'monospace','right');
    line(520,676,760,676,c,.85);
    for(let i=0;i<9;i++)line(520+i*30,672,520+i*30,680,c,.8);
    circle(777,676,3,P.orange);ctx.restore();
  }
  function genesis(t) {
    circle(640,360,4,P.orange);
    if(t<.3) {
      for(let j=0;j<3;j++) {ctx.globalAlpha=.35*(1-clamp(t/.3));circle(640,360,115+j*12+t*400,P.orange,true,1.8);}
      ctx.globalAlpha=1;
    }
    if(t>.25&&t<1.65) {
      const main=153+2*Math.sin(t*3.5);circle(640,360,main,P.cream,true,2.7);
      for(let j=0;j<3;j++) {
        const angle=-Math.PI/2+j*TAU/3-(t-.45)*3.2;
        const col=[P.orange,P.lime,P.purple][j];
        for(let k=3;k>=0;k--) {ctx.globalAlpha=1-k*.2;circle(640+main*Math.cos(angle-k*.025),360+main*Math.sin(angle-k*.025),4.5,col);}
      }ctx.globalAlpha=1;
      const burst=Math.exp(-Math.pow((t-.43)/.15,2));
      for(let j=0;j<32;j++) {
        const a=j*TAU/32,r0=169,rr=(j%2?260:370)*burst;
        ctx.globalAlpha=burst*.75;
        line(640+Math.cos(a)*r0,360+Math.sin(a)*r0,640+Math.cos(a)*(r0+rr),360+Math.sin(a)*(r0+rr),j%3===0?P.orange:P.cream,2+j%2);
      }
      ctx.globalAlpha=clamp(burst*.4);
      for(let j=0;j<3;j++)circle(640,360,240+j*14+(t-.4)*420,P.purple,true,3);
      if(t>.68) {
        const q=t-.68,rr=158+Math.max(0,t-.86)**2*3000;ctx.globalAlpha=clamp(.7-q*.4);
        circle(640,360,rr,P.lime,true,3);if(t<1.04)circle(640,360,rr+15,P.lime,true,2);
      }
      ctx.globalAlpha=clamp((t-.45)*2)*(1-interval(t,1.45,1.65));
      tracked(project.intro_text.slice(0,Math.floor((t-.4)*48))+'_',640,578,13,P.cream,1);
      ctx.globalAlpha=1;
    }
    if(t>=1.5) {
      const q=t-1.5;ctx.globalAlpha=1-interval(t,1.8,1.96);
      const r=160+q*q*3400;
      circle(640,360,r,P.cream,true,8);ctx.globalAlpha=.15*(1-interval(t,1.6,1.75));
      circle(640,360,r,P.cream);ctx.globalAlpha=1;
      line(0,470,1280,470,P.orange,1.6*ease((t-1.66)/.17));
    }
    state.orbitRadius=t<1.5?145:160+(t-1.5)**2*3400;
  }
  function glyphLayout(word,size,width) {
    ctx.font=`${size}px Anton`;const widths=[...word].map(c=>ctx.measureText(c).width);
    const sum=widths.reduce((a,b)=>a+b,0);return {widths,scale:width/sum,start:640-width/2};
  }
  function kineticBase(t,target) {
    const c=target||ctx,word=project.kinetic_word,size=268,layout=glyphLayout(word,size,798);
    c.save();c.translate(layout.start,0);c.scale(layout.scale,1);c.textAlign='left';c.font=`${size}px Anton`;
    let x=0;
    [...word].forEach((ch,i)=> {
      const q=t-1.90-i*.056,v=q<=0?0:1-Math.exp(-10*q)*Math.cos(14*q),col=(i===1||i===4)?P.orange:P.cream;
      c.save();c.translate(x,463);c.scale(1,Math.max(.025,v));
      c.fillStyle=col;c.fillText(ch,0,0);c.restore();
      if(q>0&&q<.48)for(let k=1;k<4;k++) {
        c.save();c.globalAlpha=.14*(1-clamp(q/.48));c.translate(x,463-k*9*Math.sin(q*Math.PI));
        c.scale(1,Math.max(.025,((q-k*.015)<=0?0:1-Math.exp(-10*(q-k*.015))*Math.cos(14*(q-k*.015)))));c.fillStyle=col;c.fillText(ch,0,0);c.restore();
      }x+=layout.widths[i];
    });c.restore();
  }
  const wordTexture=document.createElement('canvas'),tintTexture=document.createElement('canvas');
  wordTexture.width=tintTexture.width=W;wordTexture.height=tintTexture.height=H;
  const wordCtx=wordTexture.getContext('2d'),tintCtx=tintTexture.getContext('2d');
  function kinetic(t) {
    line(0,470,W,470,P.orange,1.6);
    if(t<2.83)kineticBase(t);
    else {
      wordCtx.clearRect(0,0,W,H);kineticBase(2.65,wordCtx);
      const q=t-2.83,leaving=interval(t,3.35,3.75),frame=Math.floor(t*30);
      tintCtx.clearRect(0,0,W,H);tintCtx.drawImage(wordTexture,0,0);
      tintCtx.globalCompositeOperation='source-in';tintCtx.fillStyle=P.cyan;tintCtx.fillRect(0,0,W,H);tintCtx.globalCompositeOperation='source-over';
      for(let j=0;j<22;j++) {
        const sy=226+j*11,h=12+rand(j+frame)*5;
        const displacement=(rand(j*11+frame*13)-.5)*105*(.7+Math.sin(q*7)**2)+((j%2?1:-1)*leaving*850);
        ctx.globalAlpha=1-leaving*.3;
        ctx.drawImage(tintTexture,0,sy,W,h,displacement+12,sy,W,h);
        ctx.drawImage(wordTexture,0,sy,W,h,displacement,sy,W,h);
        if(rand(j*7+frame)> .5) {
          ctx.fillStyle=P.orange;ctx.fillRect(235+rand(j*37+frame)*805+displacement,sy,9+rand(j+10)*28,h);
          ctx.fillStyle=P.cyan;ctx.fillRect(244+rand(j*37+frame)*805+displacement,sy,7,h);
        }
      }ctx.globalAlpha=1;
    }
    ctx.globalAlpha=interval(t,2.23,2.47)*(1-interval(t,3.3,3.55));
    tracked(project.kinetic_subtitle,640,514,22,P.cream,9);ctx.globalAlpha=1;
    state.glyphCount=project.kinetic_word.length;state.glitchSlices=t>=2.83?22:0;
  }
  function grid(t) {
    const q=t-3.75,grow=ease(q/.35),end=interval(t,5.35,5.51);
    ctx.save();ctx.translate(640,360);ctx.scale(grow*(1-end*.08),grow*(1-end*.08));
    for(let j=-5;j<=5;j++)for(let i=-8;i<=8;i++) {
      const x=i*80,y=j*80-8,r=Math.hypot(x,y),wave=(1+Math.sin(r*.014-q*5.4))*.5;
      const sz=15+wave*47+interval(t,4.95,5.35)*(24-8*wave),seed=rand((i+20)*21+(j+20)*157),col=seed>.956?P.cream:seed>.898?P.lime:wave>.73?P.orange:wave>.42?P.pink:P.purple;
      ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(q*2+seed*TAU)*.4);
      let opacity=clamp((q*1550-r+70)/110);ctx.globalAlpha=opacity*(1-end);
      const radius=lerp(sz*.16,sz*.5,wave*(1-interval(t,4.95,5.30)));
      roundRect(-sz/2,-sz/2,sz,sz,radius,col);ctx.restore();
    }ctx.restore();state.gridCells=187;
  }
  function morphWeights(t) {
    const q=t-5.5;
    if(q<.56)return [1,0,0,0];
    if(q<.80){const s=interval(q,.56,.80);return[1-s,s,0,0];}
    if(q<1.02)return [0,1,0,0];
    if(q<1.20){const s=interval(q,1.02,1.20);return[0,1-s,s,0];}
    if(q<1.48)return [0,0,1,0];
    if(q<1.72){const s=interval(q,1.48,1.72);return[0,0,1-s,s];}
    return [0,0,0,1];
  }
  function polygonRadius(a,n,rot) {
    const apothem=Math.cos(Math.PI/n),sector=TAU/n;
    let d=((a-rot+Math.PI/n)%sector+sector)%sector-Math.PI/n;
    return apothem/Math.cos(d);
  }
  function shapePoints(t,lag=0) {
    const tt=t-lag,w=morphWeights(tt),q=tt-5.5,rot= w[0]*(-.30+(q-.3)*.10)+w[1]*(-.08)+w[2]*.02+lag*3;
    const points=[];
    for(let i=0;i<120;i++) {
      const a=i*TAU/120,starIndex=(a+Math.PI/2+TAU)%TAU/(TAU/10);
      const k=Math.floor(starIndex),f=starIndex-k;
      const a0=k*TAU/10-Math.PI/2,a1=(k+1)*TAU/10-Math.PI/2;
      const r0=k%2?.43:1,r1=k%2?1:.43;
      const sx=lerp(Math.cos(a0)*r0,Math.cos(a1)*r1,f),sy=lerp(Math.sin(a0)*r0,Math.sin(a1)*r1,f);
      let rad=w[0]*polygonRadius(a,4,0)*233+w[1]*polygonRadius(a,3,0)*255+w[3]*179;
      const xx=(Math.cos(a)*rad+w[2]*sx*231)*(1+lag*.26),yy=(Math.sin(a)*rad+w[2]*sy*231)*(1+lag*.26);
      points.push([640+xx*Math.cos(rot)-yy*Math.sin(rot),360+xx*Math.sin(rot)+yy*Math.cos(rot)]);
    }return points;
  }
  function path(points) {ctx.beginPath();points.forEach(([x,y],i)=>ctx[i?'lineTo':'moveTo'](x,y));ctx.closePath();}
  function morph(t) {
    const grad=ctx.createRadialGradient(640,360,20,640,360,850);grad.addColorStop(0,P.lime);grad.addColorStop(1,'#839720');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
    ctx.font='260px Anton';ctx.strokeStyle='rgba(15,20,7,.07)';ctx.lineWidth=2;ctx.textAlign='center';
    ctx.strokeText(project.morph_backdrop,640,468);
    ctx.strokeStyle='rgba(15,20,7,.26)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(640,360,307,91,-.02,0,TAU);ctx.stroke();
    for(let j=6;j>=1;j--) {
      const pts=shapePoints(t,j*.035);path(pts);ctx.strokeStyle=j%2?P.purple:P.orange;ctx.lineWidth=2;
      ctx.globalAlpha=.19;ctx.stroke();
    }ctx.globalAlpha=1;
    const pts=shapePoints(t);path(pts);ctx.fillStyle=P.dark;ctx.fill();
    const weights=morphWeights(t),isCircle=weights[3];
    if(isCircle<.97)for(let j=0;j<pts.length;j+=15)roundRect(pts[j][0]-3,pts[j][1]-3,6,6,0,P.cream);
    const a=(t-5.5)*3.5+2.45;
    for(let j=0;j<2;j++)circle(640+307*Math.cos(a+j*Math.PI),360+91*Math.sin(a+j*Math.PI),10,P.dark);
    if(t>7.29) {
      const f=ease((t-7.29)/.11),r=180+f*1000;circle(640,360,r,P.dark);
    }
    state.morphWeights=weights.map(x=>+x.toFixed(5));state.morphVertices=120;
  }
  const galaxySeeds=Array.from({length:3500},(_,i)=>({r:Math.sqrt(rand(i*7+12))*515,arm:i%4,jitter:(rand(i*13+31)-.5)*.19,z:(rand(i*31+111)-.5)*30,color:i%11<3?1:i%11<6?2:i%11<8?3:0,size:.65+rand(i+37)*1.6}));
  function galaxyPoint(s,q) {
    const a=s.arm*TAU/4+s.r*.0115+q*.91+s.jitter;
    return rotated([s.r*Math.cos(a),s.r*Math.sin(a),s.z],1.12+Math.sin(q*.7)*.03,.12,-.08+q*.09);
  }
  function galaxy(t) {
    const q=t-7.4,scale=ease((q-.05)/.26)*(1-interval(t,9.22,9.40));
    if(q<.17){ctx.globalAlpha=.13*(1-q/.17);ctx.fillStyle=P.cream;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
    const glow=ctx.createRadialGradient(640,360,1,640,360,200*scale+1);
    glow.addColorStop(0,'rgba(255,90,50,.38)');glow.addColorStop(.3,'rgba(107,53,177,.23)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(100,70,1080,580);
    const colors=[P.orange,P.lime,P.purple,P.cream];
    const points=galaxySeeds.map(s=>({s,p:project3(galaxyPoint(s,q),3000),prev:project3(galaxyPoint(s,q-.027-q*.012),3000)})).sort((a,b)=>b.p[2]-a.p[2]);
    ctx.save();ctx.translate(640,360);ctx.scale(scale,scale);ctx.translate(-640,-360);
    for(const {s,p,prev} of points) {
      ctx.globalAlpha=.76+.24*rand(s.r*7);line(prev[0],prev[1],p[0],p[1],colors[s.color],s.size);
    }ctx.restore();ctx.globalAlpha=1;circle(640,360,7*scale,P.cream);
    state.particles=galaxySeeds.length;state.galaxyScale=+scale.toFixed(5);
  }
  function asterisk(x,y,r,color,rotation) {
    ctx.save();ctx.translate(x,y);ctx.rotate(rotation);ctx.lineCap='round';
    for(let j=0;j<3;j++){const a=j*Math.PI/3;line(-r*Math.cos(a),-r*Math.sin(a),r*Math.cos(a),r*Math.sin(a),color,12);}ctx.restore();
  }
  function principleFrame(index,q) {
    const backgrounds=[P.orange,P.purple,P.lime,P.cream],bg=backgrounds[index],fg=index===1?P.cream:P.dark;
    ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    const vg=ctx.createRadialGradient(640,360,60,640,360,860);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.35)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    tracked(`PRINCIPLE ${String(index+1).padStart(2,'0')} / 04`,640,196,14,fg,2);
    text(project.principles[index],640,440,226,fg);
    if(index===0) {
      line(240,535,1040,535,fg,1);
      for(let j=0;j<65;j++)line(240+j*12.5,535,240+j*12.5,535+(j%10===0?19:8),fg,1.5);
      const x=250+clamp(q/.5)*780;line(x,516,x,567,fg,2);line(x-12,516,x+12,516,fg,2);
      ctx.globalAlpha=.2;for(let j=1;j<4;j++)line(x-j*8,516,x-j*8,563,fg,1);ctx.globalAlpha=1;
    } else if(index===1) {
      line(527,608,750,608,'rgba(235,235,215,.4)',1);line(527,608,527,534,'rgba(235,235,215,.4)',1);
      ctx.beginPath();ctx.moveTo(527,608);ctx.bezierCurveTo(651,608,631,534,735,534);ctx.strokeStyle=fg;ctx.lineWidth=2;ctx.stroke();
      circle(734,534,5,P.lime);circle(781,534,5,P.lime);
    } else if(index===2) {
      for(let j=0;j<41;j++) {const height=10+22*(.5+.5*Math.sin(j*.94-q*15));ctx.fillStyle=fg;ctx.fillRect(280+j*18,594-height,10,height);}
    } else {asterisk(172,365,47,P.orange,q);asterisk(1105,365,47,P.orange,-q);}
  }
  function principles(t) {
    const q=t-9.4,index=Math.min(3,Math.floor(q/.45)),local=q-index*.45;
    principleFrame(index,local);
    if(index>0&&local<.09) {
      ctx.save();ctx.beginPath();
      for(let j=0;j<16;j++) {
        const f=ease((local-j%4*.008)/.055),hh=H*(1-f);ctx.rect(j*80,j%2?H-hh:0,80,hh);
      }ctx.clip();principleFrame(index-1,.45+local);ctx.restore();
    }
    state.principle=index;
  }
  const starSeeds=Array.from({length:170},(_,i)=>({a:rand(i*7+53)*TAU,r:55+rand(i*31+23)*650,z:rand(i+79)}));
  function torus(t) {
    const q=t-11.2,scale=ease(q/.17)*(1+interval(t,12.90,13.18)*6);
    const rx=1.29+.14*Math.sin(q*2.1),ry=.15*Math.cos(q*1.7),rz=.57*Math.cos((q-.5)*2.4);
    function point(u,v){return project3(rotated([(350+100*Math.cos(v))*Math.cos(u),(350+100*Math.cos(v))*Math.sin(u),100*Math.sin(v)],rx,ry,rz));}
    for(const s of starSeeds) {
      const r=(s.r+q*(35+s.z*45))%720,a=s.a;
      const x=640+Math.cos(a)*r,y=360+Math.sin(a)*r*.68;
      ctx.globalAlpha=.12+s.z*.14;line(x,y,x+Math.cos(a)*(2+s.z*8),y+Math.sin(a)*(2+s.z*8)*.68,P.cream,.65);
    }ctx.globalAlpha=1;ctx.save();ctx.translate(640,360);ctx.scale(scale,scale);ctx.translate(-640,-360);
    const mesh=[];
    for(let j=0;j<16;j++)for(let i=0;i<64;i++) {
      const u=i*TAU/64,v=j*TAU/16,p=point(u,v),next=point(u+TAU/64,v);
      mesh.push({p,n:next,z:(p[2]+next[2])/2});
    }
    for(let i=0;i<48;i++)for(let j=0;j<24;j++) {
      const u=i*TAU/48,v=j*TAU/24,p=point(u,v),next=point(u,v+TAU/24);
      mesh.push({p,n:next,z:(p[2]+next[2])/2});
    }
    mesh.sort((a,b)=>b.z-a.z);
    for(const {p,n,z} of mesh) {
      ctx.globalAlpha=lerp(.21,.89,clamp((450-z)/800));
      line(p[0],p[1],n[0],n[1],z>100?P.purple:P.cream,1.25);
    }ctx.globalAlpha=1;
    ctx.setLineDash([8,7]);ctx.beginPath();
    for(let j=0;j<=160;j++) {
      const a=j*TAU/160,p=project3(rotated([540*Math.cos(a),540*Math.sin(a),0],1.24,.1,.01+q*.50));
      ctx[j?'lineTo':'moveTo'](p[0],p[1]);
    }ctx.strokeStyle=P.orange;ctx.globalAlpha=.45;ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
    for(let j=0;j<6;j++) {
      const p=point(q*.65+j*TAU/6,j*2.14+q*.4);
      circle(p[0],p[1],(3+j%3*2.5)*p[3],P.lime);
    }ctx.restore();
    if(t>13.06) {ctx.globalAlpha=Math.sin(clamp((t-13.06)/.14)*Math.PI)*.54;ctx.fillStyle=P.cream;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
    state.meshSegments=mesh.length;state.cameraScale=+scale.toFixed(5);state.rotation=[rx,ry,rz].map(v=>+v.toFixed(5));
  }
  const confetti=Array.from({length:95},(_,i)=>({angle:rand(i*7+2)*TAU,r:105+rand(i*13+93)*340,phase:rand(i+41),color:i%4,size:4+rand(i+2)*6}));
  function signature(t) {
    const q=t-13.2,collapse=1-interval(t,14.74,14.88),r=226*spring(q/.20);
    ctx.save();ctx.translate(640,360);ctx.scale(collapse,collapse);ctx.translate(-640,-360);
    circle(640,360,r,P.orange,true,3.4);
    const colors=[P.orange,P.cream,P.purple,P.lime];
    for(const s of confetti) {
      const rr=s.r*ease(q/.25)+q*23,x=640+Math.cos(s.angle)*rr,y=360+Math.sin(s.angle)*rr*.82;
      const fade=(1-interval(t,14.2,14.60))*(.5+s.phase*.5);ctx.globalAlpha=fade;
      ctx.save();ctx.translate(x,y);ctx.rotate(q*2+s.phase*TAU);ctx.fillStyle=colors[s.color];
      if(s.phase>.7) {ctx.beginPath();ctx.moveTo(-s.size,-s.size);ctx.lineTo(s.size,0);ctx.lineTo(-s.size,s.size);ctx.fill();}
      else ctx.fillRect(-s.size/2,-s.size/2,s.size,s.size);ctx.restore();
    }ctx.globalAlpha=1;
    const brand=project.brand,layout=glyphLayout(brand,174,478);let x=layout.start;
    ctx.font='174px Anton';ctx.textAlign='left';
    [...brand].forEach((ch,i)=> {
      const v=spring((q-i*.034)/.25),yy=414-(1-v)*140;
      ctx.save();ctx.translate(x,yy);ctx.scale(layout.scale,Math.max(.01,v));ctx.fillStyle=P.cream;ctx.fillText(ch,0,0);ctx.restore();
      x+=layout.widths[i]*layout.scale;
    });
    ctx.globalAlpha=interval(t,13.6,13.88);
    line(416,447,864,447,P.lime,2);
    tracked(project.signature_subtitle,640,488,22,P.cream,5);
    tracked(project.availability,647,522,16,'#a0a0a8',1);circle(534,517,4,P.orange);
    ctx.globalAlpha=1;
    const angle=(q*2.5)-1.3;
    circle(640+r*Math.cos(angle),360+r*Math.sin(angle),7,P.lime);
    circle(640+r*Math.cos(angle+Math.PI),360+r*Math.sin(angle+Math.PI),4,P.orange);
    ctx.restore();circle(640,360,4*(1-collapse),P.orange);
    state.signatureScale=+collapse.toFixed(5);
  }
  function seek(time) {
    const t=clamp(Number(time)||0,0,project.duration);lastTime=t;
    state={t:+t.toFixed(6),phase:project.marks.reduce((s,m)=>t>=m.t?m.phase:s,'radial-genesis'),loop:false};
    ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.setLineDash([]);
    ctx.fillStyle=P.dark;ctx.fillRect(0,0,W,H);
    let chapter=0,dark=false;
    if(t<1.9)genesis(t);
    else if(t<3.75){kinetic(t);chapter=1;}
    else if(t<5.5){grid(t);chapter=2;}
    else if(t<7.4){morph(t);chapter=3;dark=true;}
    else if(t<9.4){galaxy(t);chapter=4;}
    else if(t<11.2){principles(t);chapter=5;dark=true;}
    else if(t<13.2){torus(t);chapter=6;}
    else {signature(t);chapter=7;}
    texture(t,dark?.60:1);hud(t,chapter,dark);
    return state;
  }
  window.seek=t=>seek(t);window.getState=()=>JSON.parse(JSON.stringify(state));
  const ready=(async()=> {
    project=await (await fetch('project.json')).json();window.project=project;P=project.palette;window.duration=project.duration;
    await document.fonts.load('268px Anton');await document.fonts.ready;makeGrain();
    function resize(){canvas.width=innerWidth;canvas.height=innerHeight;seek(lastTime);}
    window.addEventListener('resize',resize);resize();
    if(!new URLSearchParams(location.search).has('render')) {
      const start=performance.now();function frame(now){seek(Math.min(project.duration,(now-start)/1000));if(now-start<project.duration*1000)requestAnimationFrame(frame);}requestAnimationFrame(frame);
    }
    return true;
  })();window.ready=()=>ready;
})();
