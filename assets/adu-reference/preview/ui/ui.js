/* UI components are rendered with original CSS/classes/functions. Surrounding
   stage labels and arrangement belong to this extraction viewer. */
(() => {
 const selected=(new URLSearchParams(location.search).get('item')||'paper-card').replace(/^ui-/,'');
 const item=window.UI_ITEMS.find(x=>x.id==='ui-'+selected)||window.UI_ITEMS[0];
 const parent=$('world'),stage=$('stage');let update=()=>{},native=null;
 window.END=4;
 $('ui-title').innerHTML=item.title+'<small>'+item.description+'</small>';
 const dark=['dark-card','grid-dark','cam-round','win95','dock-icon','video-tile','glass-dark','chip','mac-window','check','slider','toggle','ring','account','comment','terminal'].includes(selected);
 stage.style.background=dark?'#0a0a0a':'var(--paper)';
 $('ui-title').style.color=dark?'#fff':'var(--ink)';
 function fixed(html,x=960,y=620,opt={}){const e=mk(parent,html,x,y,{ax:.5,ay:.5,...opt});place(e,{o:1,s:opt.s||1});return e;}
 function caption(text,x,y){const e=mk(parent,`<div class="ui-caption">${text}</div>`,x,y);place(e,{o:1});return e;}
 function outline(label,w=850,h=360,cls='card'){
  return fixed(`<div class="${cls}" style="width:${w}px;height:${h}px"><div class="lb">// ${label}</div>${cls==='card'?'<div class="ix">01 / 04</div>':''}<div class="h2" style="position:absolute;left:38px;top:110px">清楚的<span class="acc">信息层级</span></div><div style="position:absolute;left:38px;bottom:45px;font-size:28px;color:#8c8c8c">主张、内容、索引与留白</div></div>`);
 }
 switch(selected){
  case 'paper-card':outline('白色信息卡');break;
  case 'dark-card':outline('暗色信息卡',850,360,'dcard');break;
  case 'grid-paper':case 'grid-dark':case 'grid-blue':{
   const g=document.createElement('div');g.className={'grid-paper':'grid','grid-dark':'gridD','grid-blue':'gridB'}[selected];parent.appendChild(g);
   if(selected==='grid-blue'){stage.style.background='var(--blue)';$('ui-title').style.color='#fff';}
   fixed(`<div class="h1" style="color:${selected==='grid-paper'?'var(--ink)':'#fff'}">网格与留白</div>`,960,620);caption('原样式：240 px 网格间距',755,730);break;}
  case 'tag-timecode':{
   const sc=new Scene(0,4,'var(--paper)');sc.el.style.display='block';const tick=tags(sc,'// 01 — 章节标签','');
   fixed('<div class="h1">章节与时间码</div>');update=t=>tick(t);break;}
  case 'title-system':fixed('<div style="width:1100px"><div class="h1">h1 · 主要标题</div><div class="h2" style="margin-top:58px;color:#555">h2 · 次级叙述</div><div class="h3" style="margin-top:58px;color:#8c8c8c">h3 · 支持信息与注解</div></div>',960,615);break;
  case 'accent':fixed('<div class="h1">突出<span class="acc">重点</span><br><br>切换<span class="hl">高亮</span></div>',960,615);break;
  case 'pill':fixed('<div style="display:flex;gap:45px"><span class="pill" style="background:var(--blue);color:#fff">信息标签</span><span class="pill" style="background:#0a0a0a;color:#fff">状态更新</span><span class="pill" style="background:#E5484D;color:#fff">重点提醒</span></div>');break;
  case 'bubble':fixed('<div style="display:flex;flex-direction:column;gap:36px;align-items:flex-start"><div class="bubble">先说一个清楚的观点。</div><div class="bubble" style="margin-left:200px">再展开它的逻辑。</div></div>');break;
  case 'terminal':fixed('<div class="term" style="width:1080px"><span style="color:#6d9bff">›</span> adu-motion-video<br><span style="color:#777">// 暗色终端 · 原样式</span><br>选择场景 → 准备媒体 → 时间轴 → 导出</div>');break;
  case 'cam-portrait':case 'cam-round':{
   const round=selected==='cam-round';const e=camCard(parent,round?470:390,round?470:693,'// 示例人物 · 无真实口播',round);
   update=t=>camAt(e,t,{x:960,y:645,o:1});break;}
  case 'win95':fixed('<div class="win95" style="width:550px"><div class="tb"><span>系统提示</span><span class="bt"><span>_</span><span>□</span><span>×</span></span></div><div style="padding:32px;font-size:26px">⚠ 这是原 Win95 弹窗样式。<div style="text-align:center;margin-top:30px"><span class="b95">确定</span></div></div></div>',960,620,{s:1.35});break;
  case 'glass':{
   for(let i=0;i<4;i++)fixed(`<div style="width:340px;height:340px;background:${['#c3d2ff','#f7cce4','#eed8a0','#a1dcd4'][i]};border-radius:80px"></div>`,450+i*320,620);
   fixed('<div class="notif glass"><div class="ic" style="background:#2462ea;color:#fff">✓</div><div>通知已更新<div style="font-size:19px;color:#6b6b6b;margin-top:7px">图标 / 正文 / 透视背景</div></div></div>',960,620,{s:1.7});break;}
  case 'dock-icon':fixed('<div style="display:flex;gap:38px">'+['◆','▶','✦','▤'].map((x,i)=>`<div class="appic" style="background:${['#2462ea','#8a61dd','#df6c88','#329b9b'][i]};color:#fff;font-size:54px">${x}</div>`).join('')+'</div>',960,620,{s:1.25});break;
  case 'video-tile':{const e=vtile(parent,1050,591,28);place(e,{x:960,y:635,o:1});update=t=>setFrame(e._img,seqAt('ui-video-demo',180,30,t,0));break;}
  case 'glass-dark':{
   fixed('<div style="width:1020px;height:480px;background:linear-gradient(30deg,#1d2363,#4167b4,#243a41)"></div>');
   fixed('<div class="glassD" style="width:900px;padding:60px"><div style="font-size:62px;color:#fff;font-weight:600">暗色毛玻璃</div><div style="font-size:28px;color:#aaa;margin-top:28px">84% 暗底 · 背景模糊 · 边框与阴影</div></div>');break;}
  case 'chip':fixed('<div style="display:flex;gap:38px"><div class="chip" style="background:var(--blue);color:white">● 运行中</div><div class="chip" style="background:#1d1d1d;color:#ddd;border:1.5px solid #333">示例方案 A</div><div class="chip" style="background:white;color:#0a0a0a">已完成</div></div>',960,620,{s:1.6});break;
  case 'mac-window':{const e=macWin(parent,1050,590,'示意软件 · 原窗口助手');place(e,{x:960,y:635,o:1});update=t=>setFrame(e._img,seqAt('soft-demo',180,30,t,0));break;}
  case 'check':fixed('<div style="display:flex;align-items:center;gap:25px"><div class="check">✓</div><div style="font-size:40px;color:#fff">状态确认</div></div>',960,620,{s:2});break;
  case 'slider':{
   const f=UI_SOURCE_BUILDERS.slider(parent);place(f.el,{x:960-440,y:620-150,o:1,s:2});
   update=t=>{const p=EZ.inout(pr(t,.7,1.6));f.rf.style.width=(30+70*p)+'%';f.rk.style.left=(30+70*p)+'%';f.rv.textContent=p<.5?'medium':p<.98?'high':'Ultra';f.rv.style.color=p>=.98?'#E5484D':'#fff';};break;}
  case 'ring':{
   const f=UI_SOURCE_BUILDERS.ring(parent);place(f.el,{x:960,y:620,o:1,s:2.1});
   update=t=>{const p=EZ.inout(pr(t,.45,1.6));f.rc.setAttribute('stroke-dashoffset',(678.6*(1-p)).toFixed(1));f.rt.textContent=String(Math.round(p*30)).padStart(2,'0')+':00';};break;}
  case 'account':{
   const f=UI_SOURCE_BUILDERS.account(parent);place(f.el,{x:960,y:620,o:1});
   update=t=>{const st=t+75.85;f.stc.forEach((e,i)=>{const x=pr(st,76.4+i*.18,76.75+i*.18);e.style.opacity=x;e.style.transform=`translateY(${(1-EZ.expo(x))*24}px)`});f.sv[0].textContent=Math.round(counter(st,76.4,77,0,3));f.sv[1].textContent=Math.round(counter(st,76.6,77.2,0,5));f.sv[2].textContent=Math.round(counter(st,76.8,77.7,0,5822));f.sv[3].textContent='0';const on=EZ.spring(pr(st,77,77.45));f.kn.style.left=(7+56*on)+'px';f.sw.style.background=on>.5?'#28c840':'#E7E7E4';};break;}
  case 'toggle':{
   const f=UI_SOURCE_BUILDERS.toggle(parent);place(f.el,{x:960,y:620,o:1,s:3});
   update=t=>{const on=EZ.spring(pr(t,1.15,1.6));f.kn.style.left=(7+56*on)+'px';f.sw.style.background=on>.5?'#28c840':'#E7E7E4';};break;}
  case 'comment':{
   const f=UI_SOURCE_BUILDERS.comment(parent);f.ce.forEach((e,i)=>place(e,{x:580,y:390+i*165,o:1}));
   update=t=>f.ce.forEach((e,i)=>e.querySelector('.lk').textContent=Math.round([288,175,156][i]+40*pr(t,.4,1.5)));break;}
  case 'nle':{
   const f=UI_SOURCE_BUILDERS.nle(parent);place(f.el,{x:440,y:470,o:1});
   update=t=>{f.ph.style.left=(120+Math.floor(t*6)*2.2)+'px';f.fc.textContent='frame '+String(Math.floor(t*24)).padStart(6,'0');};break;}
  case 'portrait-shell':{
   native=document.createElement('iframe');native._loaded=new Promise(resolve=>native.addEventListener('load',resolve,{once:true}));native.src='portrait-shell-native.html';native.style.cssText='position:absolute;left:720px;top:212px;width:1080px;height:1920px;border:0;transform:scale(.42);transform-origin:0 0';parent.appendChild(native);
   caption('1080 × 1920 原竖屏分区',140,475);caption('顶部标题 → 中部动画 → 下部人物与字幕',140,545);
   update=async t=>{const w=native.contentWindow;if(w&&w.renderAt){await w.renderAt(t+4.3);await w.imgWait();}};break;}
 }
 window.renderAt=t=>{t=clamp(+t,0,4);window.UI_PREVIEW_TIME=t;return update(t);};
 window.READY=(async()=>{await document.fonts.ready;if(native){await native._loaded;await native.contentWindow.READY;}await window.renderAt(.01);await window.imgWait();await Promise.all([...document.images].filter(im=>im.src).map(im=>im.decode().catch(()=>{})));window.UI_READY=true;document.title='done';})();
})();
