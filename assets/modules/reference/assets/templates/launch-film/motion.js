/* Independent launch-film reconstruction. All animation values derive from t. */
(() => {
  'use strict';
  const C = document.getElementById('film');
  const g = C.getContext('2d', { alpha: false });
  const UI_FONT='"PMGeist", Arial, "Microsoft YaHei", sans-serif';
  const BRAND_FONT='"PMArchivo", Arial, "Microsoft YaHei", sans-serif';
  const clone = document.createElement('canvas');
  clone.width = clone.height = 1440;
  const cg = clone.getContext('2d');
  const renderMode = new URLSearchParams(location.search).get('render') === '1';
  document.body.classList.toggle('render', renderMode);
  const defaults = {
    template: 'launch-film', duration: 27, internal_duration:27, timing_mode:'prompt', reference_duration:29.077, width: 1440, height: 1440, fps: 60, bpm: 120,
    brand: 'develop', accent: '#111111', canvas: '#eeefe9',
    photos: ['assets/arch.svg','assets/arch-golden.svg','assets/coast.svg','assets/mountains.svg','assets/desert.svg','assets/city.svg','assets/waves.svg','assets/forest.svg','assets/meadow.svg'],
    wall: 'assets/wall.svg', desktop:'assets/desktop.svg',
    copy: {open:'Develop',tagline:'From screen to wall.',glass:'relight',toolbar:'Golden hour',date:'Friday, September 25',music:'This Must Be the Place',musicArtist:'Talking Heads',hero:'from screen\nto wall.',heroSub:'museum-grade prints of the photos you already love. framed by hand, sent in a week.',product:'the print',order:'Order print',ordered:'Ordered',printing:'Printing',shipping:'On its way',delivered:'Delivered'},
    reference_url:'https://prompt-motion.com/twoclipping-221cab', provenance:'independent-reimplementation'
  };
  let P = defaults;
  let pictures = [];
  let wall = null;
  let desktop = null;
  let configSource = 'defaults';
  let assetsReady = false;
  let fontsReady = false;
  let lastTime = 0;
  let lastInternalTime = 0;
  const clamp = (v,a=0,b=1) => Math.max(a,Math.min(b,v));
  const mix = (a,b,k) => a+(b-a)*k;
  const prog = (t,a,b) => clamp((t-a)/(b-a));
  const ease = (u) => { u=clamp(u); return u*u*u*(u*(u*6-15)+10); };
  const smooth = (t,a,b) => ease(prog(t,a,b));
  /* Closed-form damped step response, normalized at its finite endpoint. */
  function spring(t,a,d=0.45,damping=7.8,frequency=11.5) {
    const u=(t-a)/d;
    if(u<=0) return 0;
    if(u>=1) return 1;
    const response = (x) => 1-Math.exp(-damping*x)*(Math.cos(frequency*x)+(damping/frequency)*Math.sin(frequency*x));
    return response(u)/response(1);
  }
  const s01 = (t,a,d=0.45) => clamp(spring(t,a,d));
  /* Many targets remain a sum of deterministic step responses. */
  function track(t,initial,changes) {
    let value=initial, previous=initial;
    for(const [at,to,duration] of changes) {
      value+=(to-previous)*spring(t,at,duration||0.45);
      previous=to;
    }
    return value;
  }
  const totalDuration=()=>{const value=Number(P.duration);return Number.isFinite(value)&&value>0?value:27;};
  /* PCHIP: closed-form, monotone, velocity-continuous interpolation of anchors. */
  function monotoneMap(x,anchors) {
    const nodes=anchors.map(a=>({x:Number(a.time),y:Number(a.internalTime)})).filter(a=>Number.isFinite(a.x)&&Number.isFinite(a.y)).sort((a,b)=>a.x-b.x);
    if(nodes.length<2)return clamp(x/29.077)*27;
    if(x<=nodes[0].x)return nodes[0].y;if(x>=nodes[nodes.length-1].x)return nodes[nodes.length-1].y;
    const intervals=[],secants=[];
    for(let i=0;i<nodes.length-1;i++){intervals.push(nodes[i+1].x-nodes[i].x);secants.push((nodes[i+1].y-nodes[i].y)/intervals[i]);}
    const slopes=new Array(nodes.length).fill(0);
    const edge=(h0,h1,d0,d1)=>{let m=((2*h0+h1)*d0-h0*d1)/(h0+h1);if(m*d0<=0)m=0;else if(d0*d1<0&&Math.abs(m)>Math.abs(3*d0))m=3*d0;return m;};
    if(nodes.length===2){slopes[0]=slopes[1]=secants[0];}
    else {
      slopes[0]=edge(intervals[0],intervals[1],secants[0],secants[1]);
      const last=secants.length-1;slopes[nodes.length-1]=edge(intervals[last],intervals[last-1],secants[last],secants[last-1]);
      for(let i=1;i<nodes.length-1;i++){const a=secants[i-1],b=secants[i];if(a*b<=0)slopes[i]=0;else{const w1=2*intervals[i]+intervals[i-1],w2=intervals[i]+2*intervals[i-1];slopes[i]=(w1+w2)/(w1/a+w2/b);}}
    }
    const i=nodes.findIndex((node,index)=>index<nodes.length-1&&x>=node.x&&x<nodes[index+1].x),h=intervals[i],u=(x-nodes[i].x)/h,u2=u*u,u3=u2*u;
    return (2*u3-3*u2+1)*nodes[i].y+(u3-2*u2+u)*h*slopes[i]+(-2*u3+3*u2)*nodes[i+1].y+(u3-u2)*h*slopes[i+1];
  }
  function internalClock(time) {
    const normalized=clamp(time/totalDuration());
    if(P.timing_mode==='reference-estimated'&&Array.isArray(P.timing_anchors)&&P.timing_anchors.length>1)return clamp(monotoneMap(normalized*(Number(P.reference_duration)||29.077),P.timing_anchors),0,27);
    return normalized*27;
  }
  function externalClock(internal) {
    let lo=0,hi=totalDuration();
    for(let iteration=0;iteration<38;iteration++){const mid=(lo+hi)/2;if(internalClock(mid)<internal)lo=mid;else hi=mid;}
    if(internal<=0)return 0;if(internal>=27)return totalDuration();return (lo+hi)/2;
  }
  function syncMetadata() {
    const duration=totalDuration();window.duration=duration;
    document.getElementById('scrub').max=String(duration);
    if(Array.isArray(P.internal_marks)&&(P.marks_duration!==duration||P.marks_timing_mode!==P.timing_mode||!P.marks)) {
      P.marks=P.internal_marks.map(mark=>({...mark,internalTime:mark.time,time:Number(externalClock(mark.time).toFixed(6))}));
      P.marks_timebase='project-seconds';P.marks_duration=duration;P.marks_timing_mode=P.timing_mode;
    }
  }
  function rr(x,y,w,h,r=0) {
    w=Math.max(0,w); h=Math.max(0,h); r=clamp(r,0,Math.min(w,h)/2);
    g.beginPath(); g.moveTo(x+r,y); g.lineTo(x+w-r,y); g.quadraticCurveTo(x+w,y,x+w,y+r);
    g.lineTo(x+w,y+h-r); g.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    g.lineTo(x+r,y+h); g.quadraticCurveTo(x,y+h,x,y+h-r);
    g.lineTo(x,y+r); g.quadraticCurveTo(x,y,x+r,y); g.closePath();
  }
  function box(x,y,w,h,r,color) { rr(x,y,w,h,r); g.fillStyle=color; g.fill(); }
  function circle(x,y,r,color) { if(r<=0)return; g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fillStyle=color;g.fill(); }
  function line(x1,y1,x2,y2,width,color) {g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.stroke();}
  function type(str,x,y,size=30,color='#171717',align='left',weight=500,maxWidth,fontFamily=UI_FONT,stretch='normal') {
    g.font=`${weight} ${size}px ${fontFamily}`;if('fontStretch' in g)g.fontStretch=stretch;g.textAlign=align;g.textBaseline='middle';g.fillStyle=color;
    if(maxWidth)g.fillText(String(str),x,y,maxWidth);else g.fillText(String(str),x,y);
  }
  function maskType(str,x,y,size,color,width,height,offset=0,weight=600,align='center') {
    g.save(); g.beginPath();g.rect(x-width/2,y-height/2,width,height);g.clip();
    type(str,x,y+offset,size,color,align,weight,width-16);g.restore();
  }
  function cover(img,x,y,w,h) {
    if(!img||w<=0||h<=0)return;
    const k=Math.max(w/img.width,h/img.height), sw=w/k, sh=h/k;
    g.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,x,y,w,h);
  }
  function photo(i,x=0,y=0,w=1440,h=1440,r=0) {
    if(w<0.01||h<0.01)return;
    g.save();rr(x,y,w,h,r);g.clip();cover(pictures[i%pictures.length],x,y,w,h);g.restore();
  }
  function ground() { box(0,0,1440,1440,0,P.canvas||'#eeefe9'); }
  function desktopBackground() { if(desktop)cover(desktop,0,0,1440,1440);else ground(); }
  function wrappedText(str,x,y,maxWidth,size,color='#171717',weight=500,lineHeight=size*1.35) {
    g.font=`${weight} ${size}px ${UI_FONT}`;if('fontStretch' in g)g.fontStretch='normal';
    const lines=[];
    for(const paragraph of String(str).split('\n')) {
      const tokens=/[\u3400-\u9fff]/.test(paragraph)?Array.from(paragraph):paragraph.split(/(?<=\s)/);let current='';
      for(const token of tokens){if(current&&g.measureText(current+token).width>maxWidth){lines.push(current.trim());current=token;}else current+=token;}
      if(current)lines.push(current.trim());
    }
    lines.forEach((text,i)=>type(text,x,y+i*lineHeight,size,color,'left',weight));return lines.length;
  }
  function shadowRect(x,y,w,h,r=20,blur=38) {
    g.save();g.shadowColor='rgba(0,0,0,0.16)';g.shadowBlur=blur;g.shadowOffsetY=20;
    box(x,y,w,h,r,'#171717');g.restore();
  }
  /* Glass is a scene-clone approximation, with local lens zoom and a rim. */
  function glass(x,y,w,h,r=30,tint=0.14) {
    if(w<1||h<1)return;
    cg.setTransform(1,0,0,1,0,0);cg.clearRect(0,0,1440,1440);cg.drawImage(C,0,0,1440,1440);
    const m=g.getTransform(), sx=x*m.a+m.e, sy=y*m.d+m.f, sw=w*m.a, sh=h*m.d;
    g.save();rr(x,y,w,h,r);g.clip();
    if(sw>0&&sh>0){g.filter='blur(1.1px)';g.drawImage(clone,sx-7,sy-7,sw+14,sh+14,x,y,w,h);g.filter='none';}
    const gradient=g.createLinearGradient(x,y,x+w,y+h);
    gradient.addColorStop(0,`rgba(255,255,255,${tint+0.18})`);gradient.addColorStop(.42,`rgba(255,255,255,${tint*.3})`);gradient.addColorStop(1,`rgba(255,255,255,${tint+0.08})`);
    box(x,y,w,h,r,gradient);g.restore();
    rr(x+1,y+1,w-2,h-2,r);g.strokeStyle='rgba(255,255,255,.82)';g.lineWidth=2;g.stroke();
    rr(x+4,y+4,w-8,h-8,Math.max(0,r-2));g.strokeStyle='rgba(19,26,29,.17)';g.lineWidth=1;g.stroke();
    g.save();rr(x,y,w,h,r);g.clip();line(x+10,y+7,x+w*.7,y+7,2.5,'rgba(255,255,255,.7)');g.restore();
  }
  function lens(x,y,r) {glass(x-r,y-r,r*2,r*2,r,0.09);}
  function cursor(x,y,t,clicks=[],scale=1,held=false) {
    let squeeze=1;
    for(const at of clicks) { const u=(t-at)/.2;if(u>0&&u<1)squeeze-=.16*Math.sin(Math.PI*u); }
    if(scale<=.001)return;
    g.save();g.translate(x,y);g.scale(scale*squeeze,scale*squeeze);g.shadowColor='rgba(0,0,0,.23)';g.shadowBlur=9;g.shadowOffsetY=3;
    g.beginPath();g.moveTo(0,0);g.lineTo(0,43);g.lineTo(11,32);g.lineTo(20,50);g.lineTo(29,46);g.lineTo(20,29);g.lineTo(36,28);g.closePath();
    g.fillStyle=held?'#161616':'#080808';g.fill();g.strokeStyle='#fff';g.lineWidth=3;g.lineJoin='round';g.stroke();g.restore();
  }
  function check(x,y,size=42,color='#fff',progress=1) {
    g.save();g.translate(x,y);g.scale(size/42,size/42);
    const k=clamp(progress);g.beginPath();g.moveTo(-20,0);
    if(k<.35)g.lineTo(mix(-20,-6,k/.35),mix(0,13,k/.35));
    else {g.lineTo(-6,13);g.lineTo(mix(-6,23,(k-.35)/.65),mix(13,-20,(k-.35)/.65));}
    g.strokeStyle=color;g.lineWidth=5;g.lineCap='round';g.lineJoin='round';g.stroke();g.restore();
  }
  function icon(kind,x,y,size=36,color='#fff') {
    g.save();g.translate(x,y);g.scale(size/36,size/36);g.strokeStyle=color;g.lineWidth=2.3;g.lineCap='round';g.lineJoin='round';
    if(kind==='adjust') {[-11,0,11].forEach((xx,i)=>{line(xx,-14,xx,14,2.3,color);circle(xx,[-5,6,-3][i],4.5,color);});}
    else if(kind==='sun') {circle(0,0,6,color);for(let i=0;i<8;i++){const a=i*Math.PI/4;line(Math.cos(a)*11,Math.sin(a)*11,Math.cos(a)*16,Math.sin(a)*16,2,color);}}
    else if(kind==='play') {g.beginPath();g.moveTo(-7,-11);g.lineTo(12,0);g.lineTo(-7,11);g.closePath();g.fillStyle=color;g.fill();}
    else if(kind==='plus') {line(-12,0,12,0,2.4,color);line(0,-12,0,12,2.4,color);}
    else if(kind==='back') {g.beginPath();g.moveTo(6,-10);g.lineTo(-4,0);g.lineTo(6,10);g.stroke();}
    else if(kind==='share') {g.strokeRect(-11,-2,22,16);line(0,-15,0,6,2,color);line(0,-15,-6,-9,2,color);line(0,-15,6,-9,2,color);}
    g.restore();
  }
  /* Six blades: two aperture vertices, extended edges and the short outer arc. */
  function iris(x,y,r,open,rotation=0) {
    if(r<=0||open>=.9999)return;
    const aperture=Math.max(0,open)*r;
    g.save();g.translate(x,y);g.rotate(rotation);
    for(let i=0;i<6;i++) {
      const a=i*Math.PI/3, b=(i+1)*Math.PI/3;
      const a1=a+.17, b1=b+.17, outer=r*1.27;
      const p=[Math.cos(a1)*aperture,Math.sin(a1)*aperture],q=[Math.cos(b1)*aperture,Math.sin(b1)*aperture];
      const pa=[Math.cos(a)*outer,Math.sin(a)*outer],qb=[Math.cos(b)*outer,Math.sin(b)*outer];
      g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(q[0],q[1]);g.lineTo(qb[0],qb[1]);g.arc(0,0,outer,b,a,true);g.lineTo(pa[0],pa[1]);g.closePath();
      g.fillStyle=i%2?'#141414':'#111';g.fill();g.strokeStyle='#1e1e1e';g.lineWidth=.5;g.stroke();
    }
    if(open<.005)circle(0,0,3,'#111');
    g.restore();
  }
  function wordGeometry() {
    const word=String(P.brand||'develop');g.font=`800 140px ${BRAND_FONT}`;if('fontStretch' in g)g.fontStretch='expanded';
    const chars=Array.from(word), widths=chars.map(ch=>g.measureText(ch).width*1.025), total=widths.reduce((a,b)=>a+b,0);
    const fit=Math.min(1,1080/(total+62));
    return {chars,widths,total,fit,dotX:720+(total*fit)/2+28};
  }
  function wordmark(compression=0,dotXOverride) {
    const geo=wordGeometry(),q=clamp(1-compression),xDot=dotXOverride===undefined?geo.dotX:dotXOverride;
    let xx=720-(geo.total*geo.fit)/2;
    for(let i=0;i<geo.chars.length;i++) {
      const pos=xDot+(xx-xDot)*q;
      if(q>.0001){g.save();g.translate(pos,720);g.scale(q*geo.fit,geo.fit);type(geo.chars[i],0,0,140,P.accent||'#111','left',800,undefined,BRAND_FONT,'expanded');g.restore();}
      xx+=geo.widths[i]*geo.fit;
    }
    circle(xDot,748,28,P.accent||'#111');
    if(q>.01){g.save();g.translate(720,900);g.scale(q,q);type(P.copy.tagline||'From screen to wall.',0,0,25,'#888a80','center',500);g.restore();}
    return geo;
  }
  function openFilm(t) {
    ground();
    if(t<1) {wordmark(s01(t,.18,.8));return;}
    const geo=wordGeometry();
    if(t<2) {
      const move=smooth(t,1,1.5),grow=s01(t,1.35,.5),w=mix(56,620,grow),h=mix(56,156,grow);
      const x=mix(geo.dotX,720,move),y=mix(748,720,move);
      box(x-w/2,y-h/2,w,h,h/2,P.accent||'#111');
      maskType(P.copy.open,x,y,42,'#fff',w-20,h-20,90*(1-s01(t,1.6,.35)));
      cursor(mix(1110,933,smooth(t,1.45,1.85)),mix(1120,744,smooth(t,1.45,1.85)),t,[1.92],s01(t,1.45,.3));
      return;
    }
    const morph=smooth(t,2.05,2.5),w=mix(620,1040,morph),h=mix(156,1040,morph),r=mix(78,20,morph);
    if(t<2.25)box(720-w/2,720-h/2,w,h,r,'#111');else photo(3,720-w/2,720-h/2,w,h,r);
    g.save();rr(720-w/2,720-h/2,w,h,r);g.clip();
    const opening=t<2.25?1-smooth(t,2,2.25):smooth(t,2.25,2.9);
    iris(720,720,Math.max(w,h),opening,Math.PI*.22*smooth(t,2,2.9));
    if(t<2.18)maskType(P.copy.open,720,720,42,'#fff',600,136,-90*smooth(t,2,2.18));
    g.restore();
    cursor(933,744,t,[2.02],1-s01(t,2.35,.3));
  }
  const bento=[
    {x:190,y:190,w:580,h:580},{x:804,y:190,w:446,h:270},{x:804,y:495,w:205,h:275},
    {x:1045,y:495,w:205,h:275},{x:190,y:805,w:276,h:445},{x:500,y:805,w:270,h:445},
    {x:804,y:805,w:446,h:206},{x:804,y:1045,w:208,h:205},{x:1045,y:1045,w:205,h:205}
  ];
  function gridFilm(t) {
    ground();
    const shrink=smooth(t,3,3.5),reflow=smooth(t,4,4.45),zoom=smooth(t,4.5,5);
    const cam=mix(1,1440/580,zoom),cx=mix(720,480,zoom),cy=mix(720,480,zoom);
    g.save();g.translate(720,720);g.scale(cam,cam);g.translate(-cx,-cy);
    const order=[4,1,3,5,7,0,2,6,8];
    for(const idx of order) {
      const seq=order.indexOf(idx),row=Math.floor(idx/3),col=idx%3;
      const slot={x:210+col*350,y:210+row*350,w:320,h:320};
      const target=bento[[1,2,3,4,5,0,6,7,8][idx]];
      const k=idx===4?1:s01(t,3.24+seq*.052,.36),baseW=idx===4?mix(1040,320,shrink):320*k;
      const xx=idx===4?mix(200,slot.x,shrink):mix(560,slot.x,k),yy=idx===4?mix(200,slot.y,shrink):mix(560,slot.y,k);
      photo([4,5,6,7,3,0,8,9,10][idx],mix(xx,target.x,reflow),mix(yy,target.y,reflow),mix(baseW,target.w,reflow),mix(baseW,target.h,reflow),mix(24,20,reflow));
    }
    g.restore();
    cursor(mix(1130,663,smooth(t,4.12,4.5)),mix(1090,655,smooth(t,4.12,4.5)),t,[4.48],s01(t,4.08,.25)*(1-s01(t,4.7,.28)),false);
  }
  function relitPhoto(light) {
    photo(0);if(light>0){g.save();g.globalAlpha=clamp(light);photo(1);g.restore();}
  }
  function glassLetters(t) {
    const word=String(P.copy.glass||'LIVE'),letters=Array.from(word),size=158,total=letters.length*118;
    for(let i=0;i<letters.length;i++) {
      const reveal=spring(t,5.1+i*.11,.4),melt=smooth(t,5.95,6.4),x=mix(720-total/2+i*118+59,720,melt),y=mix(650,1000,melt),s=Math.max(0,reveal)*(1-melt);
      if(s>.002){g.save();g.translate(x,y);g.scale(s,s);
        g.font=`800 ${size}px ${UI_FONT}`;if('fontStretch' in g)g.fontStretch='normal';g.textAlign='center';g.textBaseline='middle';
        const fill=g.createLinearGradient(0,-90,0,90);fill.addColorStop(0,'rgba(255,255,255,.85)');fill.addColorStop(.4,'rgba(255,255,255,.16)');fill.addColorStop(1,'rgba(255,255,255,.5)');
        g.fillStyle=fill;g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=2.2;g.shadowColor='rgba(0,0,0,.19)';g.shadowBlur=10;g.fillText(letters[i],0,0);g.strokeText(letters[i],0,0);g.restore();}
    }
  }
  function toolbar(t,collapse=0) {
    const grow=smooth(t,6.28,6.73),adjust=smooth(t,6.95,7.35),w=mix(94,1080,grow)*(1-collapse)+118*collapse,h=mix(94,180,grow)*(1-collapse)+118*collapse;
    const centerX=mix(720,1204,collapse),centerY=mix(1180,1208,collapse),x=centerX-w/2,y=centerY-h/2;
    glass(x,y,w,h,mix(47,55,grow),.11);
    if(grow<.99)return;
    g.save();rr(x+12,y+10,w-24,h-20,40);g.clip();
    const slide=180*collapse;
    icon('sun',x+55,y+45-slide,38,'#fff');type(P.copy.toolbar,x+90,y+45-slide,32,'#fff','left',650);
    type(String(Math.round(mix(0,100,smooth(t,7.5,8.2)))),x+w-55,y+45-slide,31,'#fff','right',600);
    const sliderW=(w-114)*adjust,barY=y+118-slide;
    line(x+58,barY,x+58+sliderW,barY,7,'rgba(255,255,255,.44)');
    const light=smooth(t,7.5,8.2),kx=x+58+sliderW*light;
    if(adjust>.01){line(x+58,barY,kx,barY,7,'#fff');lens(kx,barY,mix(24,57,smooth(t,7.5,7.7))*(1-collapse));}
    g.save();g.translate(x+w-65,y+88-slide);g.scale(1-adjust,1-adjust);icon('adjust',0,0,47,'#fff');g.restore();
    g.restore();
  }
  function glassFilm(t) {
    const light=smooth(t,7.5,8.2);relitPhoto(light);glassLetters(t);
    const drop=s01(t,6.05,.32)*(1-s01(t,6.35,.38));if(drop>.001)lens(720,mix(860,1180,smooth(t,6.05,6.5)),48*drop);
    if(t>=6.28)toolbar(t);
    const x=track(t,1230,[[6.75,1195,.3],[7.25,250,.3],[7.5,1204,.7]]),y=track(t,1320,[[6.75,1190,.3],[7.25,1208,.3]]);
    cursor(x,y,t,[6.98],s01(t,6.5,.3),t>=7.45);
  }
  function orbFilm(t) {
    relitPhoto(1);
    const lift=smooth(t,8.5,9),expand=smooth(t,9,9.5),x=mix(1204,720,lift),y=mix(1208,720,lift),radius=mix(mix(57,180,lift),1100,expand);
    if(lift<1)toolbar(8.5,lift);
    const photoRadius=radius*smooth(t,8.65,8.98);
    if(photoRadius>.01)photo(2,x-photoRadius,y-photoRadius,photoRadius*2,photoRadius*2,photoRadius);
    if(expand<.8)lens(x,y,radius);
    cursor(mix(1204,890,lift),mix(1208,750,lift),t,[],1-s01(t,8.6,.4),true);
  }
  function lockContents(t,x,y,w,h) {
    const ratio=Math.min(w/1440,h/1440),cx=x+w/2;
    photo(2,x,y,w,h,mix(0,56,smooth(t,10.5,11.5)));
    g.save();rr(x,y,w,h,Math.min(56,w/9));g.clip();
    const clockY=y+h*.22,arrival=s01(t,9.5,.45);
    g.save();g.beginPath();g.rect(x,clockY-135*ratio,w,250*ratio);g.clip();
    type('09:41',cx,clockY+200*ratio*(1-arrival),190*ratio,'rgba(255,255,255,.86)','center',650);g.restore();
    maskType(P.copy.date,cx,y+h*.32,32*ratio,'#fff',w*.95,70*ratio,100*ratio*(1-s01(t,9.7,.4)),600);
    const player=smooth(t,10,10.45),pw=mix(220,1110,player)*ratio,ph=mix(10,184,player)*ratio,py=y+h*.88;
    glass(cx-pw/2,py-ph/2,pw,ph,Math.min(ph/2,43*ratio),.13);
    if(player>.02) {
      g.save();rr(cx-pw/2+8,py-ph/2+8,pw-16,ph-16,36*ratio);g.clip();
      const rowY=py+210*ratio*(1-player),left=cx-pw/2;
      photo(0,left+30*ratio,rowY-61*ratio,122*ratio,122*ratio,22*ratio);
      type(P.copy.music,left+180*ratio,rowY-29*ratio,37*ratio,'#fff','left',650);
      type(P.copy.musicArtist,left+180*ratio,rowY+22*ratio,25*ratio,'rgba(255,255,255,.82)','left',500);
      icon('play',cx+pw/2-73*ratio,rowY,44*ratio,'#fff');g.restore();
    }
    g.restore();
  }
  function lockFilm(t) {lockContents(t,0,0,1440,1440);}
  function phone(x,y,w,h,t,bezel=1) {
    const inset=23*bezel,r=74*bezel;
    if(bezel>.001)shadowRect(x-w/2,y-h/2,w,h,r,40);
    g.save();rr(x-w/2+inset,y-h/2+inset,w-inset*2,h-inset*2,Math.max(0,r-inset));g.clip();
    lockContents(t,x-w/2+inset,y-h/2+inset,w-inset*2,h-inset*2);g.restore();
    if(bezel>.001){const iw=142*(w/540),ih=42*(w/540);box(x-iw/2,y-h/2+42*(w/540),iw,ih,ih/2,'#080808');
      line(x-w/2-3,y-h/2+190,x-w/2-3,y-h/2+265,5,'#232323');line(x+w/2+3,y-h/2+260,x+w/2+3,y-h/2+357,5,'#232323');}
  }
  function phoneFilm(t) {
    desktopBackground();const k=smooth(t,10.5,11.5),w=mix(1440,540,k),h=mix(1440,1110,k);
    phone(720,720,w,h,t,k);
    cursor(mix(1300,832,smooth(t,11.4,11.85)),mix(1260,235,smooth(t,11.4,11.85)),t,[11.95],s01(t,11.4,.4));
  }
  function browserChrome(x=120,y=200,w=1200,h=1040,white=true) {
    shadowRect(x,y,w,h,26,45);box(x,y,w,h,26,white?'#f8f8f5':'#111');
    box(x,y,w,92,26,'#e9e9e5');box(x,y+48,w,44,0,'#e9e9e5');
    [0,1,2].forEach((v)=>circle(x+32+v*25,y+31,7,['#ed766b','#e6c359','#67bd8d'][v]));
    box(x+130,y+15,280,44,12,'#f9f9f5');type(`${P.brand.toLowerCase()}.app`,x+162,y+37,20,'#34342f');
    box(x+380,y+62,w-620,23,8,'#dcded8');type(`${P.brand.toLowerCase()}.app / memories`,x+w/2,y+74,14,'#6b6d65','center');
    icon('back',x+175,y+74,22,'#6d6e68');icon('share',x+w-43,y+75,22,'#6d6e68');
  }
  function macWallpaper(t) {
    browserChrome();photo(2,132,292,1176,936,0);
    macDock(t);
  }
  function macDock(t) {
    const dock=s01(t,13.5,.4);glass(430,1140+140*(1-dock),580,70,22,.18);
    for(let i=0;i<8;i++){const yy=1175+140*(1-dock);box(459+i*66,yy-20,40,40,10,['#5f94c0','#81a695','#d2bb8a','#bc8e75'][i%4]);}
  }
  function stageFilm(t) {
    desktopBackground();
    const move=smooth(t,12,13),phoneX=mix(720,330,move)-730*smooth(t,13.3,13.9),pw=mix(540,420,move),ph=mix(1110,862,move);
    if(t<13.9)phone(phoneX,720,pw,ph,11.5,1);
    const stretch=smooth(t,12,12.5),flight=smooth(t,12.5,13),grow=smooth(t,13,13.65);
    const bx=mix(phoneX,960,flight),by=mix(720-ph/2+63*(pw/540),560,flight),bw=mix(mix(142*(pw/540),475,stretch),1200,grow),bh=mix(42,1040,grow);
    const targetX=mix(bx,720,grow),targetY=mix(by,720,grow);
    box(targetX-bw/2,targetY-bh/2,bw,bh,mix(25,26,grow),'#111');
    if(t>=13) {g.save();rr(120,200,1200,1040,26);g.clip();g.beginPath();g.rect(120,200,1200,1040*smooth(t,13.2,14));g.clip();macWallpaper(t);g.restore();}
    cursor(mix(832,995,flight),mix(235,570,flight),t,[12],1-s01(t,13.3,.4),true);
  }
  function nav(y=326) {
    type(P.brand,175,y,26,'#141414','left',850);
    type('你的照片',1160,y,19,'#72756a','right',500);box(1190,y-20,74,40,20,'#151515');icon('plus',1227,y,18,'#fff');
  }
  function landingContents(t,pageShift=0) {
    g.save();g.translate(pageShift,0);box(132,292,1176,936,0,'#faf9f3');nav();
    g.save();g.beginPath();g.rect(185,400,565,480);g.clip();
    wrappedText(P.copy.hero,190,488+220*(1-s01(t,15.2,.5)),550,74,'#151515',800,92);
    wrappedText(P.copy.heroSub,190,735+200*(1-s01(t,15.38,.4)),545,25,'#797b70',500,36);g.restore();
    photo(2,795,415,420,650,26);
    g.restore();
  }
  function landingFilm(t) {
    desktopBackground();browserChrome();
    const push=smooth(t,14.92,15.5);
    g.save();g.beginPath();g.rect(132,292,1176,936);g.clip();
    photo(2,132-1176*push,292,1176,936,0);
    if(push<1){g.save();g.translate(-1176*push,0);macDock(14);g.restore();}
    landingContents(t,1176*(1-push));g.restore();
    const drag=smooth(t,14.35,14.92),drop=smooth(t,14.92,15.5),thumbScale=mix(1,.26,drag)*(1-drop);
    const tx=mix(mix(720,440,drag),1005,drop),ty=mix(mix(760,255,drag),740,drop),tw=360*thumbScale,th=270*thumbScale;
    if(t>=14.35&&drop<1){shadowRect(tx-tw/2,ty-th/2,tw,th,20*thumbScale,24);photo(2,tx-tw/2,ty-th/2,tw,th,20*thumbScale);}
    const x=mix(mix(1090,740,smooth(t,14,14.3)),440,drag),y=mix(mix(1080,760,smooth(t,14,14.3)),255,drag);
    cursor(mix(x,935,drop),mix(y,990,drop),t,[14.25],s01(t,14,.18)*(1-s01(t,15.5,.3)),t>14.2&&t<15.5);
    if(t<14.55){const hold=smooth(t,14.18,14.42)*(1-smooth(t,14.42,14.55));if(hold>.001){g.save();g.translate(740,760);g.scale(hold,hold);glass(-58,-58,116,116,58,.08);g.restore();}}
  }
  function framePhoto(x,y,w,h,mat,stroke,color='#111',paint=0,photoCorner=0) {
    const outer={x:x-mat-stroke,y:y-mat-stroke,w:w+(mat+stroke)*2,h:h+(mat+stroke)*2};
    if(stroke>.01){shadowRect(outer.x,outer.y,outer.w,outer.h,4,30);box(outer.x,outer.y,outer.w,outer.h,4,'#151515');
      if(paint>0){g.save();g.beginPath();g.rect(outer.x,outer.y,outer.w*paint,outer.h);g.clip();box(outer.x,outer.y,outer.w,outer.h,4,color);g.restore();}
      const gleam=g.createLinearGradient(outer.x,outer.y,outer.x+outer.w,outer.y+outer.h);gleam.addColorStop(0,'rgba(255,255,255,.24)');gleam.addColorStop(.2,'rgba(255,255,255,0)');gleam.addColorStop(1,'rgba(0,0,0,.12)');box(outer.x+3,outer.y+3,outer.w-6,outer.h-6,2,gleam);}
    if(mat>.01)box(x-mat,y-mat,w+mat*2,h+mat*2,0,'#f6f4ed');photo(2,x,y,w,h,photoCorner);
  }
  function productFilm(t,options={}) {
    desktopBackground();browserChrome();box(132,292,1176,936,0,'#faf9f3');
    const morph=smooth(t,16,17),grown=smooth(t,16.6,17.3),ui=s01(t,17.1,.65),paint=smooth(t,18.18,18.65),selection=s01(t,19.0,.3),fly=smooth(t,19.25,19.9);
    g.save();g.beginPath();g.rect(132,292,1176,936);g.clip();nav(mix(326,212,morph));
    wrappedText(P.copy.hero,190,488-900*morph,550,74,'#151515',800,92);
    wrappedText(P.copy.heroSub,190,735-900*morph,545,25,'#797b70',500,36);
    if(morph>.001)box(172,382,655*morph,768*morph,26,'#ece8df');
    framePhoto(mix(795,310,morph),mix(415,460,morph),mix(420,390,morph),mix(650,548,morph),48*grown,22*grown,'#c3a077',paint,26*(1-morph));
    const xx=925+500*(1-ui);
    maskType(P.copy.product,xx+150,478,44,'#151515',315,150,0,750);type('¥199',xx,607,41,'#151515','left',700);type('把画面，带回生活',xx,661,21,'#818378');
    type('边框颜色',xx,722,21,'#6b6f63');
    ['#151515','#c3a077','#eeede7'].forEach((c,i)=>{circle(xx+26+i*80,776,25,c);if((i===0&&paint<.5)||(i===1&&paint>=.5)){g.beginPath();g.arc(xx+26+i*80,776,34,0,Math.PI*2);g.strokeStyle='#24251e';g.lineWidth=2;g.stroke();}});
    type('尺寸',xx,854,21,'#6b6f63');
    ['30 × 40','50 × 70'].forEach((str,i)=>{const selected=i===0?selection<.5:selection>=.5;box(xx+i*166,889,149,58,12,selected?'#151515':'#efeee7');type(str,xx+74+i*166,918,19,selected?'#fff':'#686b61','center',600);});
    const buttonX=mix(1227,1080,fly),buttonY=mix(326-114*morph,1067,fly),buttonW=mix(74,310,fly),buttonH=mix(40,84,fly);
    if(options.button!==false){box(buttonX-buttonW/2,buttonY-buttonH/2,buttonW,buttonH,buttonH/2,'#111');
      if(fly<.6){g.save();g.translate(buttonX,buttonY);g.scale(1-fly,1-fly);icon('plus',0,0,18,'#fff');g.restore();}
      maskType(P.copy.order,buttonX,buttonY,25,'#fff',buttonW-12,buttonH-8,70*(1-fly),650);}
    g.restore();
    let cx=track(t,1275,[[17.75,1031,.35],[18.8,1140,.4],[19.5,1080,.35]]),cy=track(t,1190,[[17.75,776,.35],[18.8,916,.4],[19.5,1067,.35]]);
    if(options.cursor!==false)cursor(cx,cy,t,[18.12,19,19.94],s01(t,17.6,.3));
  }
  function van(x,y,scale=1,route=1) {
    g.save();g.translate(x,y);g.scale(scale,scale);line(-170,57,170,57,3,'rgba(255,255,255,.32)');line(-170,57,-170+340*route,57,3,'#fff');
    const xx=-140+280*route;box(xx-48,-16,64,44,7,'#fff');box(xx+8,-5,30,33,6,'#fff');box(xx+14,-1,16,13,2,'#111');circle(xx-28,29,10,'#fff');circle(xx+22,29,10,'#fff');circle(xx-28,29,4,'#111');circle(xx+22,29,4,'#111');g.restore();
  }
  function orderFilm(t) {
    box(0,0,1440,1440,0,'#faf9f3');const start=smooth(t,20,20.4),end=smooth(t,21.5,21.92),w=mix(mix(310,710,start),310,end),h=mix(mix(84,260,start),310,end),x=mix(1080,720,start),y=mix(1067,720,start);
    if(start<1){g.save();g.translate(720,720);g.scale(mix(1,3.8,start),mix(1,3.8,start));g.translate(-mix(720,1080,start),-mix(720,1067,start));productFilm(20,{button:false,cursor:false});g.restore();}
    box(x-w/2,y-h/2,w,h,h/2,'#111');g.save();rr(x-w/2,y-h/2,w,h,h/2);g.clip();
    const step=track(t,0,[[20.5,1,.24],[21,2,.24],[21.5,3,.24]]),row=230;
    for(let i=0;i<4;i++) {
      const yy=y+(i-step)*row;
      if(i===0){const confirmed=s01(t,20.03,.27);type(P.copy.order,x,yy-170*confirmed,25,'#fff','center',650);check(x-225,yy+170*(1-confirmed),31,'#fff',s01(t,20.2,.25));type(P.copy.ordered,x+20,yy+170*(1-confirmed),43,'#fff','center',650);}
      if(i===1){const percent=Math.round(mix(0,100,smooth(t,20.5,20.98)));type(P.copy.printing,x,yy-45,29,'#fff','center',550);type(`${percent}%`,x,yy+25,72,'#fff','center',700);}
      if(i===2){van(x,yy-20,.8,smooth(t,21,21.48));type(P.copy.shipping,x,yy+78,28,'#fff','center',550);}
      if(i===3){check(x,yy-28,57,'#fff',s01(t,21.55,.3));type(P.copy.delivered,x,yy+65,30,'#fff','center',600);}
    }
    g.restore();cursor(1080,1067,t,[20],1-s01(t,20.05,.25));
  }
  function wallBackground(t) {
    cover(wall,0,0,1440,1440);
    /* Original, deterministic moving plant shadows; no real footage supplied. */
    g.save();g.fillStyle='rgba(57,56,38,.08)';g.filter='blur(14px)';g.translate(80+38*Math.sin(t*.23),790+15*Math.sin(t*.41));g.rotate(-.38+.07*Math.sin(t*.16));
    for(let stem=0;stem<4;stem++){line(-130+stem*180,650,-160+stem*100,-750,12,'rgba(55,51,38,.065)');for(let i=0;i<7;i++){g.save();g.translate(-150+stem*110+i*12,-650+i*155);g.rotate((i%2?-1:1)*.8);g.beginPath();g.ellipse(0,0,180,45,0,0,Math.PI*2);g.fill();g.restore();}}
    g.restore();
  }
  function floodFilm(t) {box(0,0,1440,1440,0,'#faf9f3');circle(720,720,mix(155,1140,smooth(t,22,22.34)),'#111');}
  function wallFilm(t) {
    wallBackground(t);framePhoto(470,440,500,560,53,22,'#c3a077',1);
    if(t<23.5) {
      const k=smooth(t,23,23.5),w=mix(2280,650,k),h=mix(2280,710,k),r=mix(1140,4,k);
      box(720-w/2,720-h/2,w,h,r,'#111');
    } else {
      const open=t<24.35?smooth(t,23.5,23.95):1-smooth(t,24.35,24.8);
      g.save();g.beginPath();g.rect(395,365,650,710);g.clip();iris(720,720,650,open,.3*smooth(t,23.5,24.8));g.restore();
      if(t>=24.8){const flood=smooth(t,24.8,25),w=mix(650,2280,flood),h=mix(710,2280,flood);box(720-w/2,720-h/2,w,h,mix(4,1140,flood),'#111');}
    }
  }
  function endFilm(t) {
    ground();const geo=wordGeometry();
    if(t<25.7){const k=smooth(t,25,25.55),w=mix(2280,620,k),h=mix(2280,156,k);box(720-w/2,720-h/2,w,h,mix(1140,78,k),'#111');
      if(t>25.4)maskType(P.copy.open,720,720,42,'#fff',600,136,95*(1-s01(t,25.4,.3)));return;}
    if(t<26.5) {
      const k=smooth(t,25.7,26.18),move=smooth(t,26.0,26.5),x=mix(720,geo.dotX,move),y=mix(720,748,move),w=mix(620,56,k),h=mix(156,56,k);
      box(x-w/2,y-h/2,w,h,h/2,'#111');
      if(k<1)maskType(P.copy.open,x,y,42,'#fff',w-12,h-10,-95*k);return;
    }
    wordmark(1-s01(t,26.5,.48));
  }
  const phases=[
    [0,3,'wordmark · pill · iris',openFilm],[3,5,'photo · grid · bento · zoom',gridFilm],
    [5,8.5,'glass word · drop · toolbar · drag slider',glassFilm],[8.5,9.5,'lens · orb · lock screen',orbFilm],
    [9.5,10.5,'clock · home bar · music player',lockFilm],[10.5,12,'screen edge · phone',phoneFilm],
    [12,14,'Dynamic Island · Mac window',stageFilm],[14,16,'long press · drag to tab · landing hero',landingFilm],
    [16,20,'scroll · framed print · color · size · order',productFilm],[20,22,'ordered · printing · route · delivered',orderFilm],
    [22,23,'delivered circle · full frame flood',floodFilm],[23,25,'wall print · iris · frame flood',wallFilm],
    [25,27,'flood · pill · dot · wordmark return',endFilm]
  ];
  function state() {
    const p=phases.find(([a,b])=>lastInternalTime>=a&&lastInternalTime<b)||phases[0];
    return {time:lastTime,internalTime:lastInternalTime,phase:p[2],beat:Math.min(54,Math.floor(lastInternalTime*2)+1),duration:totalDuration(),internalDuration:27,timingMode:P.timing_mode||'prompt',width:1440,height:1440,fps:P.fps||60,renderMode,assetsReady,fontsReady,configSource,assetMode:P.asset_mode||'sample-svg',provenance:'independent-reimplementation',approximation:'Reference timing is estimated; scene-clone glass; reference-video photo crops; original SVG desktop and wall; no audio'};
  }
  window.project=P;window.duration=27;window.getState=state;
  window.seek=async function seek(time) {
    P=window.project||P;P.copy={...defaults.copy,...P.copy};
    syncMetadata();const numeric=Number(time);lastTime=Number.isFinite(numeric)?clamp(numeric,0,totalDuration()):0;lastInternalTime=internalClock(lastTime);
    g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.filter='none';g.shadowColor='transparent';g.shadowBlur=0;g.shadowOffsetX=0;g.shadowOffsetY=0;g.lineCap='butt';
    if(lastInternalTime>=27){ground();wordmark(0);}
    else {const p=phases.find(([a,b])=>lastInternalTime>=a&&lastInternalTime<b);p[3](lastInternalTime);}
    document.getElementById('scrub').value=String(lastTime);document.getElementById('time').textContent=`${lastTime.toFixed(2)} / ${totalDuration().toFixed(2)}`;
    return state();
  };
  const loadImage=(src)=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`素材无法读取：${src}`));img.src=src;});
  const initialized=(async()=>{
    try {const response=await fetch('project.json');if(!response.ok)throw new Error(response.status);const config=await response.json();P={...defaults,...config,copy:{...defaults.copy,...config.copy}};configSource='project.json';}
    catch(error){console.warn('project.json unavailable, using bundled defaults.',error);}
    if(new URLSearchParams(location.search).get('assets')==='svg'&&P.sample_photos){P={...P,photos:P.sample_photos,asset_mode:'sample-svg'};}
    const requestedTiming=new URLSearchParams(location.search).get('timing');
    if(requestedTiming==='prompt')P={...P,timing_mode:'prompt',duration:27};
    if(requestedTiming==='reference')P={...P,timing_mode:'reference-estimated',duration:Number(P.reference_duration)||29.077};
    window.project=P;syncMetadata();
    pictures=await Promise.all((P.photos||defaults.photos).map(loadImage));wall=await loadImage(P.wall||defaults.wall);desktop=await loadImage(P.desktop||defaults.desktop);assetsReady=true;
    document.getElementById('asset-note').textContent=P.asset_mode==='reference-frames'?'参考帧 · 可替换':'SVG 示例 · 可替换';
    if(document.fonts){await Promise.all([document.fonts.load('500 32px PMGeist','Golden hour'),document.fonts.load('800 140px PMArchivo',String(P.brand||'develop'))]);await document.fonts.ready;fontsReady=document.fonts.check('500 32px PMGeist')&&document.fonts.check('800 140px PMArchivo');}
    await window.seek(0);return state();
  })();
  window.ready=()=>initialized;
  let playing=!renderMode,anchorTime=0,anchorStamp=0,request=0;
  function preview(stamp) {if(!playing)return;if(!anchorStamp)anchorStamp=stamp;const time=(anchorTime+(stamp-anchorStamp)/1000)%totalDuration();window.seek(time);request=requestAnimationFrame(preview);}
  function setPlaying(value) {playing=value;document.getElementById('play').textContent=value?'暂停':'播放';if(value){anchorTime=lastTime;anchorStamp=0;request=requestAnimationFrame(preview);}else{cancelAnimationFrame(request);anchorTime=lastTime;}}
  document.getElementById('play').addEventListener('click',()=>setPlaying(!playing));
  document.getElementById('scrub').addEventListener('input',(event)=>{setPlaying(false);window.seek(Number(event.target.value));});
  initialized.then(()=>{if(playing)request=requestAnimationFrame(preview);}).catch((error)=>{ground();type(error.message,720,720,32,'#a33','center',500,1200);console.error(error);});
})();
