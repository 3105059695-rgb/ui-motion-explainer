/* Dedicated Nohandslabs reconstruction. Every visual is evaluated from time.
 * A localized static hand trace supplies editable silhouette vertices only.
 * No reference video, whole reference frame or pose sequence is loaded. */
(() => {
  'use strict';
  const canvas=document.getElementById('film'),output=canvas.getContext('2d',{alpha:false});
  const film=document.createElement('canvas');film.width=1280;film.height=720;
  const ctx=film.getContext('2d'),W=1280,H=720;
  let P,hand,handPoints=[],grain=[],current=0,state={},started=0,animation,ratioCacheKey='',ratioCache=[];
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const lerp=(a,b,p)=>a+(b-a)*p;
  const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
  const out=x=>1-Math.pow(1-clamp(x),3);
  const rng=n=>{let x=Math.sin(n*127.1+182*17.3)*43758.5453123;return x-Math.floor(x);};
  const phase=(t,a,b)=>ease((t-a)/(b-a));
  const C=()=>P.accent,F=()=>P.foreground;
  function rect(x,y,w,h,col,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=col;ctx.fillRect(x,y,w,h);ctx.restore();}
  function line(x,y,x2,y2,col,width=1,alpha=1){ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=col;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.stroke();ctx.restore();}
  function txt(text,x,y,size=20,col=F(),weight=500,mono=false,alpha=1,align='left',tracking=0){
    ctx.save();ctx.globalAlpha=alpha;ctx.font=`${weight} ${size}px ${mono?'GeistMono, monospace':'Geist, Arial'}`;ctx.fillStyle=col;ctx.textBaseline='alphabetic';ctx.textAlign=align;
    if(!tracking)ctx.fillText(text,x,y);else{const widths=[...text].map(c=>ctx.measureText(c).width);const full=widths.reduce((a,b)=>a+b,0)+tracking*Math.max(0,text.length-1);let px=x-(align==='center'?full/2:align==='right'?full:0);ctx.textAlign='left';[...text].forEach((c,i)=>{ctx.fillText(c,px,y);px+=widths[i]+tracking;});}
    ctx.restore();
  }
  function type(text,t,start,duration){return text.slice(0,Math.floor(clamp((t-start)/duration)*text.length));}
  const BITMAP={
    '0':['01110','10001','10011','10101','11001','10001','01110'],
    '1':['00100','01100','00100','00100','00100','00100','01110'],
    '2':['01110','10001','00001','00010','00100','01000','11111'],
    '3':['11110','00001','00001','01110','00001','00001','11110'],
    '4':['00010','00110','01010','10010','11111','00010','00010'],
    '5':['11111','10000','10000','11110','00001','00001','11110'],
    '6':['01110','10000','10000','11110','10001','10001','01110'],
    '7':['11111','00001','00010','00100','01000','01000','01000'],
    '8':['01110','10001','10001','01110','10001','10001','01110'],
    '9':['01110','10001','10001','01111','00001','00010','01100'],
    '%':['11000','11001','00010','00100','01000','10011','00011'],
    'N':['10001','11001','11001','10101','10011','10011','10001'],
    'O':['01110','10001','10001','10001','10001','10001','01110'],
    'H':['10001','10001','10001','11111','10001','10001','10001'],
    'A':['01110','10001','10001','11111','10001','10001','10001'],
    'D':['11110','10001','10001','10001','10001','10001','11110'],
    'S':['01111','10000','10000','01110','00001','00001','11110'],
    ',':['00000','00000','00000','00000','00000','00100','01000'],
    ' ':['00000','00000','00000','00000','00000','00000','00000']
  };
  function pixel(text,x,y,cell,col=C(),alpha=1,gap=1){
    ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle=col;ctx.font=`900 ${cell*10}px Doto`;let m=ctx.measureText(text);ctx.textBaseline='alphabetic';ctx.textAlign='left';ctx.fillText(text,x,y+m.actualBoundingBoxAscent);ctx.restore();return m.width;
  }
  function ratioPoints(){
    if(ratioCacheKey===P.text.ratio)return ratioCache;
    const mask=document.createElement('canvas');mask.width=W;mask.height=H;const mc=mask.getContext('2d');mc.font='900 380px Doto';mc.fillStyle='#fff';const metrics=mc.measureText(P.text.ratio);mc.fillText(P.text.ratio,320,211+metrics.actualBoundingBoxAscent);const data=mc.getImageData(0,0,W,H).data,pts=[];
    for(let cy=230;cy<486;cy+=38)for(let cx=339;cx<1100;cx+=38){if(data[(cy*W+cx)*4+3]<128)continue;for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){if((sx===0||sx===3)&&(sy===0||sy===3))continue;pts.push({x:cx+(sx-1.5)*9.5,y:cy+(sy-1.5)*9.5});}}
    ratioCacheKey=P.text.ratio;ratioCache=pts;return pts;
  }
  function drawHand(x,y,s,alpha=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.globalAlpha=alpha;for(const l of hand.layers){ctx.fillStyle=l.color==='accent'?C():F();ctx.fill(new Path2D(l.path));}ctx.restore();}
  function particleCloud(points,t,start,end,field,opts={}){
    let p=out((t-start)/(end-start));if(opts.reverse)p=1-p;
    const dot=opts.size||4.4,color=opts.color||C(),seed=opts.seed||0;
    ctx.save();ctx.fillStyle=color;
    points.forEach((target,i)=>{
      const n=i+seed*197,rx=field.x+field.w*rng(n+1),ry=field.y+field.h*rng(n+600);
      const jitter=(1-p)*18,ang=t*1.7+rng(n+52)*Math.PI*2;
      const x=lerp(rx,target.x,p)+Math.cos(ang)*jitter+p*(rng(n+238)-.5)*2,y=lerp(ry,target.y,p)+Math.sin(ang)*jitter+p*(rng(n+426)-.5)*2;
      ctx.globalAlpha=(opts.alpha??1)*(.55+.45*rng(n+182));ctx.fillRect(x-dot/2,y-dot/2,dot,dot);
    });ctx.restore();
  }
  function background(t,color=P.background){
    rect(0,0,W,H,color);if(color===P.background){
      const glow=ctx.createRadialGradient(680,360,0,680,360,750);glow.addColorStop(0,'rgba(55,76,30,.055)');glow.addColorStop(1,'rgba(1,3,6,0)');rect(0,0,W,H,glow);
    }
    ctx.save();ctx.strokeStyle=color===P.background?'rgba(126,139,143,.06)':'rgba(25,36,10,.04)';ctx.lineWidth=.5;
    for(let x=0;x<=W;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(let y=0;y<=H;y+=64){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}ctx.restore();
  }
  function hud(t,dark=false){const ink=dark?'#272d20':'#838689',a=dark?.72:.67;
    txt('● SYS.ONLINE',24,17,8,C(),500,true,.85);txt('PORTFOLIO: 2/5 LIVE',276,17,8,ink,500,true,a);
    txt('TARGET: 95% AI / 5% HUMAN',578,17,8,ink,500,true,a);txt('UPTIME: 24/7',925,17,8,ink,500,true,a);
    txt(`AMS 14:17:${String(58+Math.floor(t)).padStart(2,'0')}`,1254,17,8,ink,500,true,a,'right');
    const chapter=t<2.02?'00 — BOOT SEQUENCE':t<5.04?'01 — THE HAND LETS GO':t<7.03?'02 — THE RATIO':t<9.08?'03 — THE SHIFT':t<11.04?'04 — RUNTIME':t<13.05?'05 — PORTFOLIO':'06 — NOHANDSLABS.COM';
    txt(`● FIG.${chapter}`,23,703,8,ink,400,true,a);txt(`RENDER: LIVE · ${String(Math.floor(t)).padStart(2,'0')}:${String(Math.floor(t*60)%60).padStart(2,'0')}`,1253,703,8,ink,400,true,a,'right');
    [[12,42,1,1],[1268,42,-1,1],[12,684,1,-1],[1268,684,-1,-1]].forEach(([x,y,dx,dy])=>{line(x,y,x+12*dx,y,ink,1,.4);line(x,y,x,y+12*dy,ink,1,.4);});
    rect(0,718,W*clamp(t/P.duration),2,C(),.75);
  }
  function boot(t){
    const q=P.text.command,count=t<.3?Math.floor(clamp(t/.3)*3):3+Math.floor(clamp((t-.3)/.48)*(q.length-3)),v=q.slice(0,count),x=109,y=224;
    if(t>.03)txt('$',x,y,28,C(),500,true);txt(v,x+30,y,28,F(),500,true);
    if(t<.8)rect(v?x+30+v.length*16.85:x,y-24,14,26,C());
    const rows=[['kernel','autonomous'],['agent.intake','online'],['agent.production','online'],['agent.support','online'],['agent.billing','online'],['headcount','0']];
    rows.forEach(([a,b],i)=>{let start=.83+i*.102;if(t<start)return;const yy=283+i*30;txt(i===5?'[ — ]':'[ ok ]',100,yy,17,i===5?'#df6e6c':C(),500,true);txt(a.padEnd(27,'.'),169,yy,17,F(),400,true);txt(b,460,yy,17,i===5?'#df6e6c':F(),400,true);});
    if(t>1.47)txt(type('> no hands required',t,1.47,.14),100,468,18,C(),700,true);
  }
  function titleRow(text,t,start,x,y,size,col,span=.42){const v=type(text,t,start,span);txt(v,x,y,size,col,500,false,1,'left',-4);if(t>start&&t<start+span+.1){ctx.save();ctx.font=`500 ${size}px Geist`;const width=ctx.measureText(v).width-4*Math.max(0,v.length-1);rect(x+width+8,y-size*.76,39,size*.77,col);ctx.restore();}}
  function hero(t){
    txt('//',64,181,14,C(),500,true);txt(type(P.text.tag,t,2.03,.6),92,181,13,'#93969b',400,true);
    titleRow(P.text.headline[0],t,2.015,64,308,114,F(),.20);
    titleRow(P.text.headline[1],t,2.47,64,422,114,F(),.30);
    titleRow(P.text.headline[2],t,2.96,64,537,114,C(),.27);
    if(t>3.33&&t<4.36){ctx.save();ctx.font='500 114px Geist';let end=64+ctx.measureText(P.text.headline[2]).width-4*(P.text.headline[2].length-1);rect(end+8,450,39,87,C());ctx.restore();}
    const ba=phase(t,3.50,3.80);txt(P.text.body,64,601,24,F(),400,false,ba);txt(P.text.body2,64,636,24,F(),400,false,ba);
    const hx=801,hy=135,scale=1.61;
    let pts=handPoints.map(p=>({x:hx+p.x*scale,y:hy+p.y*scale}));
    particleCloud(pts,t,2.06,2.60,{x:695,y:125,w:478,h:493},{size:5.1});
    // The later hand explodes from its top first, while the palm trails behind.
    if(t>4.50){rect(683,107,539,565,P.background,.97);const p=out((t-4.5)/.49);ctx.save();ctx.fillStyle=C();pts.forEach((v,i)=>{const upward=clamp(1-(v.y-130)/500);const burst=p*(v.y>435?.025:.4+.6*upward);let x=v.x+burst*(rng(i+80)-.25)*350,y=v.y-burst*(100+350*rng(i+120));ctx.globalAlpha=.72;ctx.fillRect(x,y,5.1,5.1);});ctx.restore();}
    const fa=phase(t,2.40,2.57);line(727,83,1220,83,'#646967',1,fa*.5);line(727,655,1220,655,'#646967',1,fa*.5);
    [[727,83,1,1],[1220,83,-1,1],[727,655,1,-1],[1220,655,-1,-1]].forEach(([x,y,dx,dy])=>{line(x,y,x+12*dx,y,'#798780',1,fa*.6);line(x,y,x,y+12*dy,'#798780',1,fa*.6);});
    txt('FIG.01 — THE HAND LETS GO',738,102,9,'#8a9090',500,true,fa);txt('RENDER: LIVE',1207,102,9,C(),500,true,fa,'right');txt(t<4.5?'● FRAGMENTS → SYSTEM':'● SYSTEM → FRAGMENTS',738,642,8,'#8e9586',500,true,fa);txt(t<4.5?'HOLD: 95% AI':'LET GO',1204,642,8,'#929689',500,true,fa,'right');
  }
  function ratio(t){
    txt('[02]',64,119,10,C(),500,true);txt('THE RATIO',100,119,10,'#acafb4',500,true);
    const pts=ratioPoints();particleCloud(pts,t,5.22,5.57,{x:310,y:68,w:715,h:488},{size:7.5,seed:32});
    const a=phase(t,5.52,5.65);txt(P.text.ratio_caption,320,545,53,F(),600,false,a,'left',-1.7);
    txt(P.text.human_caption,968,551,30,'#92959d',500,false,phase(t,6.06,6.3),'right',-1);
    rect(320,592,647,9,'#151920');const fill=out((t-5.66)/.82);rect(320,592,615*fill,9,C());if(fill>.96)rect(935,592,32*fill,9,F());
    txt(`● AI ${String(Math.round(fill*95)).padStart(2,'0')}`,320,622,9,'#869375',500,true);txt(`■ HUMAN ${fill>.95?'05':'00'}`,966,622,9,'#949497',500,true,1,'right');
    if(t>6.34){txt('//',320,661,12,C(),500,true);txt(type(P.text.ratio_note,t,6.34,.49),345,661,12,'#8e9392',400,true);}
  }
  function tape(t,y,angle,bg,fg){ctx.save();ctx.translate(640,y);ctx.rotate(angle);rect(-1000,-23,2000,46,bg);const words='NO FOUNDERS STANDING WATCH /// NO TEAMS CLOCKING IN /// NO MEETINGS /// 95% AI / 5% HUMAN /// NO HANDS /// ';
    const off=(t*104)%1000;for(let i=-2;i<3;i++)txt(words,-off+i*1110,5,15,fg,700,true,1,'left',1.4);ctx.restore();}
  function shift(t){
    const n=t<7.52?0:t<8.05?1:t<8.53?2:3,bg=n===0?C():n===2?F():P.background,fg=n===0||n===2?P.background:F();background(t,bg);
    txt(`[03] THE SHIFT · 0${n+1}/04`,64,80,11,fg,500,true,.8);
    if(n<2){pixel('No',64,236,13,n===1?C():fg,1,1);txt(P.text.shift[n===0?0:2],268,327,127,fg,500,false,1,'left',-5);txt(P.text.shift[n===0?1:3],64,452,127,fg,500,false,1,'left',-5);tape(t,617,-.045,n===0?P.background:C(),n===0?C():P.background);}
    if(n===2){pixel('No',54,285,15,fg,1,1.2);txt(P.text.shift[4],318,405,156,fg,600,false,1,'left',-5.5);tape(t,629,-.04,P.background,F());}
    if(n===3){const cell=19.2,w=P.text.shift[5].length*6*cell;pixel(P.text.shift[5],(1280-w)/2+10,285,cell,C(),1,1.3);tape(t,161,-.105,C(),P.background);tape(t,607,.10,F(),P.background);}
    state.shift=n;
  }
  function runtime(t){
    txt('[05]',64,111,10,C(),500,true);txt('RUNTIME',100,111,10,'#a9a9b3',500,true);
    const r1=type(P.text.runtime[0],t,9.06,.24),r2=type(P.text.runtime[1],t,9.17,.30);
    txt(r1,64,213,74,F(),500,false,1,'left',-2.8);txt(r2,64,287,74,C(),500,false,1,'left',-2.8);
    const ba=phase(t,9.22,9.62);P.text.runtime_body.forEach((v,i)=>txt(v,64,347+i*27,21,F(),400,false,ba));
    const count=Math.round(12847*out((t-9.07)/1.58));state.tasks=count;
    [['TASKS.RUN',64,count.toLocaleString('en-US'),F(),4.2],['AI.TARGET',254,'95%',C(),4.2],['HUMAN.TARGET',386,'5%',F(),4.2]].forEach(([lab,x,v,col,cell])=>{txt(lab,x+14,487,9,'#85888b',400,true);pixel(v,x+14,507,cell,col,1,.65);});
    rect(590,151,623,501,'#0d1014',.94);line(590,151,1213,151,'#2a2f33',1,.9);line(590,651,1213,651,'#2a2f33',1,.9);
    rect(605,165,7,7,'#ce555d');txt('~/portfolio/01-studio — runtime.log',629,172,11,'#c1c2c8',400,true);txt('[illustrative]',1199,172,10,'#949499',400,true,1,'right');line(591,185,1212,185,'#232831',1,.7);
    P.agents.forEach((v,i)=>{const y=220+i*39,active=t>9.17+i*.117,most=Math.floor(clamp((t-9.15)/.14,0,5));if(i===most&&t<10.20)rect(590,y-20,623,36,C(),.12);rect(605,y-10,7,7,active?C():'#52565c',active?1:.5);txt('agent.'+v,623,y,17,active?'#a1a5ac':'#6f747a',400,true);txt(active?'running':'queued',1200,y,17,active?C():'#85878e',400,true,1,'right');line(591,y+11,1212,y+11,'#282c31',1,.26);});
    const signed=t>10.16,y=454;if(signed)rect(591,y-24,622,37,F(),.045);rect(605,y-11,7,7,signed?F():'#5c6066');txt('human.designer',623,y,17,signed?F():'#94979e',400,true);
    if(signed){rect(1094,y-20,111,30,F());txt('sign-off ✓',1102,y+1,17,P.background,500,true);}else txt('waiting',1200,y,17,'#96989e',400,true,1,'right');
    const logs=[['intake','brief received · bakery.example'],['draft','layout v1 generated · 3 pages'],['review','contract ok · 4 fixes applied'],['deploy','preview live in 0.8s'],['support','ticket #481 resolved'],['billing','invoice sent · paid'],['intake','brief received · gym.example'],['designer','final sign-off ✓'],['draft','layout v1 generated · 5 pages'],['deploy','dns + ssl configured'],['review','lighthouse 100 · shipped'],['support','change request done · 4 min'],['billing','renewal processed']];
    const shown=Math.min(logs.length,Math.floor(clamp((t-9.14)*9,0,13))),first=Math.max(0,shown-6);
    for(let i=first;i<shown;i++){const yy=536+(i-first)*19;txt(`14:02:${String(31+i).padStart(2,'0')}`,605,yy,10,'#7b7d86',400,true);txt(logs[i][0],677,yy,10,C(),500,true);txt('→ '+logs[i][1],755,yy,10,'#b5b6bd',400,true);}
  }
  function portfolio(t){
    txt('[06]',64,114,10,C(),500,true);txt('PORTFOLIO',100,114,10,'#c0c1c7',500,true);
    const full=P.text.portfolio_title,n=type(full,t,11.025,.43);const a=n.slice(0,9),b=n.slice(9);txt(a,64,198,63,F(),600,false,1,'left',-2.8);ctx.save();ctx.font='600 63px Geist';const ax=64+ctx.measureText(a).width-2.8*Math.max(0,a.length-1);ctx.restore();txt(b,ax,198,63,'#9ca0aa',600,false,1,'left',-2.8);
    txt('● LIVE 02   ● WAITLIST 01   ● COMING SOON 01   ● RESEARCH 01',64,237,10,'#858c78',400,true);
    const pan=lerp(0,710,phase(t,11.42,12.64)),x0=64-pan;state.portfolioOffset=+pan.toFixed(4);
    P.portfolio.forEach((v,i)=>{const x=x0+i*374,p=out((t-11.10-i*.12)/.30),y=266+(1-p)*140,w=352,h=376,live=i<2;ctx.save();ctx.globalAlpha=p;rect(x,y,w,h,'#111419');line(x,y,x+w,y,live?C():'#34383d',1,live?.8:.5);line(x,y+h,x+w,y+h,'#32353b',1,.4);
      if(live)rect(x+26,y+26,61,24,C(),.12);txt('● '+v.status,x+32,y+43,10,live?C():'#9da0a7',500,true);
      pixel(String(i+1).padStart(2,'0'),x+w-124,y+30,9,live?C():'#5e6370',live?.26:.23,1.4);
      txt(v.name,x+26,y+224,34,F(),500,false,1,'left',-1.2);
      ctx.font='400 18px Geist';const cap=[],words=v.caption.split(' ');let sentence='';for(const word of words){let next=sentence?sentence+' '+word:word;if(ctx.measureText(next).width>w-52&&sentence){cap.push(sentence);sentence=word;}else sentence=next;}if(sentence)cap.push(sentence);cap.forEach((s,j)=>txt(s,x+26,y+263+j*22,18,live?C():'#9397a0',400));
      txt(v.detail,x+26,y+326,8,'#9e9fa6',400,true);txt(`company.0${i+1}`,x+26,y+h-27,9,'#787c85',400,true);txt(v.url,x+w-24,y+h-27,9,live?F():'#9699a2',400,true,1,'right');ctx.restore();
    });
  }
  function signature(t){
    const s=.61,x=579,y=131,pts=handPoints.map(v=>({x:x+v.x*s,y:y+v.y*s}));const p=phase(t,13.05,13.85);
    if(t<14.04)particleCloud(pts,t,13.22,13.79,{x:60,y:20,w:1160,h:620},{size:3.7,seed:14,color:t<13.57?C():F(),alpha:1-phase(t,13.86,14.04)});
    drawHand(x,y,s,phase(t,13.86,14.04));
    const glow=ctx.createRadialGradient(645,347,30,645,347,280);glow.addColorStop(0,'rgba(155,191,45,.05)');glow.addColorStop(1,'rgba(155,191,45,0)');rect(240,100,800,600,glow);
    const brand=type(P.brand,t,13.48,.47);txt(brand,640,433,105,F(),400,false,1,'center',-3.7);
    if(t>13.93){ctx.save();ctx.font='500 105px Geist';const width=ctx.measureText(P.brand).width-3.7*(P.brand.length-1);ctx.restore();ctx.save();ctx.shadowColor=C();ctx.shadowBlur=16;ctx.fillStyle=C();ctx.beginPath();ctx.arc(640+width/2+18,404,8,0,Math.PI*2);ctx.fill();ctx.restore();}
    const full=P.text.signature,v=type(full,t,13.93,.25),index=full.lastIndexOf('themselves'),pre=v.slice(0,index),tail=v.slice(index);ctx.save();ctx.font='500 35px Geist';const pw=ctx.measureText(full.slice(0,index)).width-1.1*Math.max(0,index-1),tw=ctx.measureText(full.slice(index)).width-1.1*Math.max(0,full.length-index-1),left=640-(pw+tw)/2;ctx.restore();txt(pre,left,508,35,F(),500,false,1,'left',-1.1);if(tail)txt(tail,left+pw,508,35,C(),500,false,1,'left',-1.1);
    if(t>14.10&&t<14.31)rect(left+pw+tw+3,490,8,29,C());
    const a=phase(t,14.27,14.56);txt(P.text.url+' ↗',495,596,17,F(),500,true,a,'right');rect(540,568,204,45,C(),.055*a);ctx.save();ctx.globalAlpha=a;ctx.strokeStyle=C();ctx.strokeRect(540,568,204,45);ctx.restore();txt(P.text.cta,642,595,17,C(),500,true,a,'center');txt(P.text.social,770,596,17,'#8f939b',400,true,a);txt('// '+P.text.signature_note,640,666,11,'#9b9a9e',400,true,phase(t,14.53,14.76),'center');state.signatureProgress=+p.toFixed(4);
  }
  function glitch(t){
    const windows=[[1.59,1.85,.25],[1.87,2.02,.8],[4.83,5.07,.5],[6.94,7.03,.75],[8.84,8.99,.35],[9.01,9.08,.8],[10.94,11.05,.35],[12.93,13.05,.75]];
    const w=windows.find(([a,b])=>t>=a&&t<b);if(!w)return;
    const snap=document.createElement('canvas');snap.width=W;snap.height=H;snap.getContext('2d').drawImage(film,0,0);
    let tick=Math.floor(t*60),intensity=w[2],pulse=Math.sin((t-w[0])/(w[1]-w[0])*Math.PI);
    for(let i=0;i<22;i++){let y=Math.floor(rng(tick*21+i+500)*H),h=2+Math.floor(rng(i+tick)*14),dx=(rng(i*6+tick)-.5)*140*intensity*pulse;ctx.drawImage(snap,0,y,W,h,dx,y,W,h);if(i%4===0)rect(rng(i+tick)*W,y,150*intensity,h,i%2?C():'#a4c2ca',.1+.3*intensity);}
    if(intensity>.7)rect(0,0,W,H,t<7.04?C():F(),pulse*.15);
  }
  function finish(t){
    ctx.save();ctx.globalAlpha=.009;ctx.drawImage(grain[Math.floor(t*30)%grain.length],0,0,W,H);ctx.restore();
    for(let y=0;y<H;y+=3)rect(0,y,W,1,'#000',.048);
    const v=ctx.createRadialGradient(640,360,280,640,360,780);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.31)');rect(0,0,W,H,v);
  }
  function seek(t){if(!P)return;current=clamp(Number(t)||0,0,P.duration);t=current;state={time:+t.toFixed(6),phase:'boot',tasks:null,shift:null,portfolioOffset:null,signatureProgress:null};
    ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';ctx.clearRect(0,0,W,H);background(t);
    if(t<2.02)boot(t);else if(t<5.04){state.phase='particle-hand';hero(t);}else if(t<7.03){state.phase='ratio';ratio(t);}else if(t<9.08){state.phase='shift';shift(t);}else if(t<11.04){state.phase='runtime';runtime(t);}else if(t<13.05){state.phase='portfolio';portfolio(t);}else{state.phase=t===P.duration?'end':'signature';signature(t);}
    glitch(t);hud(t,t>=7.03&&t<7.52||t>=8.05&&t<8.53);finish(t);
    const ww=window.innerWidth,hh=window.innerHeight;if(canvas.width!==ww||canvas.height!==hh){canvas.width=ww;canvas.height=hh;}output.setTransform(1,0,0,1,0,0);output.fillStyle=P.background;output.fillRect(0,0,ww,hh);let scale=Math.min(ww/W,hh/H);output.drawImage(film,(ww-W*scale)/2,(hh-H*scale)/2,W*scale,H*scale);return state;
  }
  const loaded=(async()=>{
    const results=await Promise.all([fetch('project.json').then(r=>r.json()),fetch('assets/hand-path.json').then(r=>r.json())]);P=results[0];hand=results[1];window.project=P;window.duration=P.duration;
    await Promise.all([400,500,600,700].flatMap(w=>[document.fonts.load(`${w} 30px Geist`),document.fonts.load(`${w} 30px GeistMono`)]).concat(document.fonts.load('900 380px Doto')));await document.fonts.ready;
    const mask=document.createElement('canvas');mask.width=200;mask.height=285;let mc=mask.getContext('2d');mc.fillStyle='#fff';for(const l of hand.layers)mc.fill(new Path2D(l.path));let data=mc.getImageData(0,0,200,285).data;
    for(let y=2;y<285;y+=4)for(let x=2;x<200;x+=4)if(data[(y*200+x)*4+3]>100)handPoints.push({x,y});
    for(let frame=0;frame<8;frame++){const g=document.createElement('canvas');g.width=256;g.height=144;const gc=g.getContext('2d'),im=gc.createImageData(256,144);for(let i=0;i<im.data.length;i+=4){const n=Math.floor(rng(i+frame*947)*255);im.data[i]=im.data[i+1]=im.data[i+2]=n;im.data[i+3]=255;}gc.putImageData(im,0,0);grain.push(g);}
    seek(0);if(new URLSearchParams(location.search).get('render')!=='1'){started=performance.now();animation=requestAnimationFrame(function play(now){seek(Math.min(P.duration,(now-started)/1000));if(current<P.duration)animation=requestAnimationFrame(play);});}return true;
  })();
  window.ready=()=>loaded;window.seek=seek;window.getState=()=>({...state,handPoints:handPoints.length,loop:false});window.addEventListener('resize',()=>seek(current));
})();
