/* Independent demonstrations call the repository's original lib.js functions.
 * Values, layouts and media here are illustrative. */
(() => {
  window.END = 6;
  const mode = new URLSearchParams(location.search).get('demo') || 'entrance-pop';
  const sc = new Scene(0, 6, 'var(--paper)', {grid:'grid'});
  const head = mk(sc.el, `<div style="font:700 64px Microsoft YaHei,sans-serif;letter-spacing:-2px">${mode}</div>`, 110, 95);
  const detail = mk(sc.el, '<div style="font:500 26px Microsoft YaHei,sans-serif;color:#737988">仓库原函数 · 独立参数演示 · 可拖动时间</div>', 115, 190);
  const baseTick = () => { place(head,{o:1});place(detail,{o:1}); };
  const card = (text,x=960,y=570,w=700,h=320) => mk(sc.el, `<div style="width:${w}px;height:${h}px;border-radius:30px;background:var(--blue);color:#fff;box-shadow:0 20px 60px #2462ea30;display:flex;align-items:center;justify-content:center;font:700 60px Microsoft YaHei,sans-serif">${text}</div>`,x,y,{ax:.5,ay:.5});
  const label=(text,x,y,size=28)=>mk(sc.el,`<div style="font:500 ${size}px Microsoft YaHei,sans-serif;color:#626a7b">${text}</div>`,x,y,{ax:.5});
  const keep=(...e)=>e.forEach(x=>place(x,{o:1}));
  const out=4.4;
  if(mode.startsWith('entrance-')) {
    const k=mode.slice(9), e=card(k);
    sc.update=t=>{baseTick();show(e,t,.7,{k,d:1.2,dist:180,out});};
  } else if(mode.startsWith('ease-')) {
    const name=mode.slice(5), easing=EZ[name]||EZ.out;
    const path=Array.from({length:121},(_,i)=>{const p=i/120;return `${i?'L':'M'} ${(p*600).toFixed(2)},${(330-easing(p)*300).toFixed(2)}`}).join(' ');
    const graph=mk(sc.el,`<svg width="680" height="390" viewBox="-40 -20 680 390"><path d="M0 0 V330 H600" fill="none" stroke="#c0c5d0" stroke-width="2"/><path d="M0 330 L600 30" fill="none" stroke="#c4c9d4" stroke-width="2" stroke-dasharray="8 9"/><path d="${path}" fill="none" stroke="#2462ea" stroke-width="7"/><circle class="dot" r="12" fill="#0a0a0a"/></svg>`,1130,330);
    const e=card('EZ.'+name,300,540,310,150);
    const track=mk(sc.el,'<div style="width:720px;height:4px;background:#cdd3df"></div>',180,670);
    const val=label('',540,740,32);
    sc.update=t=>{baseTick();keep(graph,track,val);const p=pr(t,.7,3),x=easing(p);place(e,{x:300+x*580,o:1});graph.querySelector('.dot').setAttribute('cx',p*600);graph.querySelector('.dot').setAttribute('cy',330-x*300);val.firstChild.textContent=`progress ${p.toFixed(3)} → eased ${x.toFixed(3)}`;};
  } else if(mode==='exit') {
    const e=card('exit');sc.update=t=>{baseTick();show(e,t,.7,{k:'pop',d:1,out:3.3,od:1.6,ox:180,oy:150,os:.35,ob:22});};
  } else if(mode==='place') {
    const e=card('place()',960,570,650,270);
    sc.update=t=>{baseTick();const p=EZ.inout(pr(t,.7,4.5));place(e,{x:550+820*p,y:520+90*Math.sin(p*Math.PI*2),sx:1-.28*p,sy:1+.22*p,r:-18+36*p,o:1-.35*p,blur:Math.max(0,(p-.7)*15)});};
  } else if(mode==='mk') {
    const a=mk(sc.el,'<div style="width:370px;height:230px;border-radius:20px;background:#0A0A0A;color:white;padding:50px;font-size:38px">锚点 0,0</div>',450,480);
    const b=mk(sc.el,'<div style="width:370px;height:230px;border-radius:20px;background:var(--blue);color:white;padding:50px;font-size:38px">锚点 .5,.5</div>',1360,595,{ax:.5,ay:.5});
    const pinA=mk(sc.el,'<div style="width:18px;height:18px;background:#f05b66;border-radius:50%"></div>',450,480,{ax:.5,ay:.5});
    const pinB=mk(sc.el,'<div style="width:18px;height:18px;background:#f05b66;border-radius:50%"></div>',1360,595,{ax:.5,ay:.5});
    sc.update=t=>{baseTick();const r=25*Math.sin(t*1.4);place(a,{r,o:1});place(b,{r,o:1});keep(pinA,pinB);};
  } else if(mode==='img') {
    const e=img(sc.el,'sample-presenter.svg',960,960,640);sc.update=t=>{baseTick();place(e,{o:1,r:5*Math.sin(t),s:1+.05*EZ.spring(pr(t,.7,2)),y:930});};
  } else if(mode==='words') {
    const e=words(sc.el,[{h:'逐词 ',t:.7},{h:'抬升 ',t:1.3},{h:'<span style="color:var(--blue)">冲击</span><br>',t:2.0,k:'slam'},{h:'弹性 ',t:2.7,k:'pop'},{h:'呈现',t:3.3,k:'pop'}],260,405,'h1',{style:'font-size:138px;line-height:1.4'});
    sc.update=t=>{baseTick();wordsAt(e,t,{out:out});};
  } else if(mode==='counter') {
    const e=mk(sc.el,'<div style="font:700 240px ui-monospace,Microsoft YaHei;color:var(--blue);letter-spacing:-12px">0</div>',960,555,{ax:.5,ay:.5});
    const note=label('示意数据 / from 0 to 12,480',960,770,32);
    sc.update=t=>{baseTick();keep(e,note);e.firstChild.textContent=fmt(counter(t,.7,3.4,0,12480));};
  } else if(mode==='shake') {
    const a=card('固定参照',510,570,540,300),b=card('shake()',1410,570,540,300);
    const val=label('震动在 1.0 秒与 3.2 秒发生',960,850,32);
    sc.update=t=>{baseTick();keep(a,val);const [x1,y1]=shake(t,1,1.5,60),[x2,y2]=shake(t,3.2,1.2,42);place(b,{x:1410+x1+x2,y:570+y1+y2,o:1});};
  } else if(['bob','breathe','hop'].includes(mode)) {
    const e=img(sc.el,'sample-presenter.svg',960,920,650);const val=label('',960,965,28);
    sc.update=t=>{baseTick();place(val,{o:1});if(mode==='bob'){const y=bob(t,0,15);place(e,{y:920+y,o:1});val.firstChild.textContent=`bob(t,0,15) = ${y.toFixed(3)} px`;}if(mode==='breathe'){const s=breathe(t);place(e,{s,o:1});val.firstChild.textContent=`breathe(t) = ${s.toFixed(6)}（真实微幅）`;}if(mode==='hop'){const h=hopIn(t,.7,.9);place(e,{y:920+h.y,s:h.s,o:h.o});val.firstChild.textContent=`s ${h.s.toFixed(3)} / y ${h.y.toFixed(3)} / opacity ${h.o.toFixed(3)}`;}};
  } else if(['cam-card','cam-round','cam-morph'].includes(mode)) {
    const e=camCard(sc.el,mode==='cam-round'?520:470,mode==='cam-round'?520:836,'// 示意人物 · 非真人',mode==='cam-round');
    const val=label('demo-presenter.svg / 默认示意脸部位置',960,970,26);
    sc.update=t=>{baseTick();const p=EZ.inout(pr(t,1.4,3.6));if(mode==='cam-morph'){e._sm=p;e.firstChild.style.borderRadius=lerp(28,235,p)+'px';camAt(e,t,{x:lerp(700,1350,p),y:lerp(560,330,p),s:lerp(.85,.5,p),o:1});}else camAt(e,t,{x:960,y:590,s:mode==='cam-round'?1:.8,o:1});place(val,{o:1});};
  } else if(mode==='video-tile') {
    const e=vtile(sc.el,1180,664,32);sc.update=t=>{baseTick();show(e,t,.7,{k:'zoom',x:960,y:610,d:.8});setFrame(e._img,seqAt('sample',30,10,t,.7,true));};
  } else if(mode==='mac-window') {
    const e=macWin(sc.el,1290,670,'Demo.app · 示例界面');e._x=960;e._y=610;e._img.src='assets/sample-ui.svg';sc.update=t=>{baseTick();show(e,t,.7,{k:'zoom',d:1.1,out:out});};
  } else if(mode==='wall') {
    const e=buildWall(sc.el,9,160,90,14);e._y=590;
    const note=label('36 张示意精灵 / 每格 16 帧 / 从中心波纹显现',960,920,30);
    sc.update=t=>{baseTick();keep(e,note);wallTick(e,t,.7,8);};
  } else if(mode==='race') {
    const e=race(sc.el,false);e._y=570;const labelE=label('起点                         过程                         完成',960,480,38);const p=label('',960,700,36);
    sc.update=t=>{baseTick();raceAt(e,t);keep(labelE,p);p.firstChild.textContent='raceAt(t = '+t.toFixed(2)+')';};
  } else if(mode==='tags') {
    const f=tags(sc,'// 原角标与时间码','');const e=card('tags() + tc()');sc.update=t=>{baseTick();keep(e);f(t);};
  } else if(mode==='scene') {
    SCENES.splice(0,1);sc.el.remove();
    [['var(--paper)','grid','#0A0A0A','纸白 / grid'],['#0A0A0A','gridD','#fff','墨黑 / gridD'],['var(--blue)','gridB','#fff','科技蓝 / gridB']].forEach(([bg,g,col,title],i)=>{const s=new Scene(i*2,i*2+2,bg,{grid:g});const e=mk(s.el,`<div style="font:700 140px Microsoft YaHei;color:${col}">${title}</div>`,960,540,{ax:.5,ay:.5});s.update=t=>place(e,{o:1});});
  } else if(mode==='camera') {
    const e=card('Scene.cam → world',960,540,790,280);const marks=[];
    [[240,350],[1650,350],[240,860],[1650,860]].forEach(([x,y],i)=>marks.push(label('参照 '+(i+1),x,y,36)));
    sc.update=t=>{baseTick();keep(e,...marks);};
    sc.cam=t=>{const p=EZ.inout(pr(t,.7,4.3)),[sx,sy]=shake(t,3.7,1.0,18);return {x:lerp(960,1180,p),y:lerp(540,570,p),z:lerp(1,1.48,p),sx,sy};};
  } else if(mode.startsWith('transition-')) {
    const tr=mode.slice(11);SCENES.splice(0,1);sc.el.remove();
    const a=new Scene(0,3,'#0A0A0A',{grid:'gridD'}),b=new Scene(3,6,'var(--blue)',{grid:'gridB',trans:tr==='fade'?null:tr,td:.8,tc:'#5b8cff'});
    [a,b].forEach((s,i)=>{const e=mk(s.el,`<div style="font:800 240px Microsoft YaHei;color:#fff">${i?'B':'A'}</div>`,960,440,{ax:.5,ay:.5});const l=mk(s.el,`<div style="font:500 48px Microsoft YaHei;color:#baccfa">原 main.js · ${tr}</div>`,960,705,{ax:.5});s.update=t=>keep(e,l);});
  } else if(mode==='terminal-cursor') {
    const e=mk(sc.el,'<div class="term" style="width:1440px;height:250px;font-size:52px;display:flex;align-items:center"><span style="color:#6d9bff">$&nbsp;</span><span class="ty"></span><span class="cur" style="color:#6d9bff">▍</span></div>',240,420);
    const P='用代码，把想法做成流畅的画面。';const ty=e.querySelector('.ty'),cur=e.querySelector('.cur');sc.update=t=>{baseTick();keep(e);ty.textContent=P.slice(0,Math.round(P.length*pr(t,1,4.2)));cur.style.opacity=Math.floor(t*2)%2?1:.2;};
  } else {const e=card(mode);sc.update=t=>{baseTick();show(e,t,.7,{k:'pop',out});};}
})();
