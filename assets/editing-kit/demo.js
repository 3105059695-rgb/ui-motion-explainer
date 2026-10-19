/* Standalone examples. Preview transport is separate from effect evaluation. */
(() => {
  'use strict';
  const K=window.UIEditingKit,$=(id)=>document.getElementById(id),stage=$('stage');
  const V={width:1280,height:720},DURATION=8;
  const schemes=[
    {background:'#edf2f1',surface:'#ffffff',ink:'#182b32',muted:'#60737b',accent:'#166763',border:'#c9d8d8',fontFamily:'"Microsoft YaHei", system-ui, sans-serif',radius:14,shade:'rgba(16,34,38,.48)',shadow:'0 16px 40px rgba(20,45,49,.17)'},
    {background:'#18202d',surface:'#253143',ink:'#f1f4f7',muted:'#b4c0d0',accent:'#f5c174',border:'#536175',fontFamily:'"Microsoft YaHei", system-ui, sans-serif',radius:22,shade:'rgba(0,0,0,.55)',shadow:'0 16px 40px rgba(0,0,0,.28)'}
  ];
  const descriptions={
    'focus-mask':['01 聚焦与局部放大','资料很多，先找到遗漏的关键条件。','保留完整文档位置，用四片蒙版降低外围权重；同一行局部放大。放大内容由宿主提供，组件不复制或控制视频。'],
    'occlusion-reveal':['02 遮挡揭示','补上条件，让下一层解释出现。','前景“条件”文件脊经过时才露出下一场；下一场一直真实存在于下层，不用纯色盖满后硬切。'],
    'match-handoff':['03 同对象交接','把同一条条件，带进正在写的简报。','使用同一个 DOM 对象，连续改变位置和容器尺寸；来源和目的区域交接阅读中心，编号始终是 COND-03。'],
    'compare':['04 对照差异','同一份简报，只看条件改变了什么。','前后版在相同坐标叠放；拖动时间条控制揭示比例，差异区域只在被揭示后亮起。不是两个不相关模板的对比。'],
    'causal-chain':['05 因果链','资料经过核对，才成为完整简报。','三份持续存在的对象先进入核对区，关键条件出现后再转入结果。拖回任何时点，位置和状态都能恢复。'],
    'result-pullback':['06 成果退回整体','先看完整简报，再找到它属于哪个项目。','相机从同一报告的近景退回项目全貌；报告没有被重新创建，所属项目、资料和条件逐渐进入视野。']
  };
  const bar=(s)=>`<div class="bar"><span class="dots"><i></i><i></i><i></i></span>${s}</div>`;
  const heading=(id)=>`<div class="eyebrow">${descriptions[id][0]}</div><h2>${descriptions[id][1]}</h2>`;
  const label='<div class="stage-note">概念示意 · 演示用色盘</div>';
  const doc=(prefix)=>`<div class="window" style="left:160px;top:168px;width:960px;height:380px">${bar('研究任务 / 本期资料')}<h3 style="position:absolute;left:38px;top:64px;font-size:25px;margin:0">素材齐了，信息未必齐</h3><div class="row" style="position:absolute;left:38px;top:126px;width:884px"><b>资料数量</b><strong>18 份访谈与产品材料</strong><span class="chip">已收集</span></div><div class="row" style="position:absolute;left:38px;top:186px;width:884px"><b>表达主题</b><strong>如何把研究资料写成简报</strong></div><div id="${prefix}-row" class="row" style="position:absolute;left:38px;top:246px;width:884px"><b>目标读者</b><strong>尚未说明：这份简报要讲给谁听？</strong></div></div>`;
  const brief=(after)=>`<div class="compare-heading">同一任务 · BRIEF-01 · ${after?'补齐条件后':'补齐条件前'}</div><h3 style="position:absolute;left:45px;top:59px;margin:0;font-size:27px">资料整理教学简报</h3><div class="row" style="position:absolute;left:45px;top:128px;width:970px"><b>资料</b><strong>18 份访谈与产品材料</strong></div><div class="row" style="position:absolute;left:45px;top:192px;width:970px"><b>目标读者</b><strong>${after?'第一次接触研究整理的初学者':'未指定'}</strong></div><div class="row" style="position:absolute;left:45px;top:256px;width:970px"><b>讲解方式</b><strong>${after?'先解释问题，再演示三个可操作步骤':'从资料标题逐条展开'}</strong></div>`;
  const builders={
    'focus-mask':()=>`<section class="scene">${heading('focus-mask')}${doc('main')}<div id="shade0" class="uek-shade"></div><div id="shade1" class="uek-shade"></div><div id="shade2" class="uek-shade"></div><div id="shade3" class="uek-shade"></div><div id="focus-outline"></div><div id="loupe" style="z-index:4;background:var(--uek-surface);border:2px solid var(--uek-accent)"><div id="loupe-content">${doc('copy')}</div></div><div class="caption">不是再加一份资料，而是先说明“给谁看”。</div>${label}</section>`,
    'occlusion-reveal':()=>`<section class="scene">${heading('occlusion-reveal')}<div id="old-scene" class="uek-layer"><div class="window" style="left:140px;top:182px;width:1000px;height:398px">${bar('资料准备')}<div style="position:absolute;left:48px;top:86px"><span class="chip">收集完成</span><h3 style="font-size:46px;margin:22px 0 15px">18 份资料</h3><p style="font-size:24px;color:var(--uek-muted)">还缺一个决定解释方式的条件。</p><p style="font-size:23px;color:var(--uek-accent)">目标读者是谁？</p></div></div></div><div id="new-scene" class="uek-layer"><div class="window" style="left:140px;top:182px;width:1000px;height:398px">${bar('写作条件已明确')}<div style="position:absolute;left:48px;top:80px"><span class="chip">COND-03 · 目标读者</span><h3 style="font-size:43px;margin:20px 0">第一次学习的初学者</h3><p style="font-size:24px;line-height:1.8;margin:0">先说明问题，再逐步演示<br>最后用一份完整简报验证理解</p></div></div></div><div id="cover" style="z-index:8;background:var(--uek-accent);color:var(--uek-surface);display:flex;align-items:center;justify-content:center;box-shadow:var(--uek-shadow);font-size:24px;font-weight:700;writing-mode:vertical-rl;letter-spacing:8px">关键条件</div><div class="caption">前景文件经过，新的解释顺着它打开。</div>${label}</section>`,
    'match-handoff':()=>`<section class="scene">${heading('match-handoff')}<div id="source-context"><div class="flow-panel" style="left:70px;top:192px;width:520px;height:385px"></div><div class="pane-label" style="left:100px;top:225px">条件清单 / 原始出处</div><div id="source-marker" class="slot" style="left:112px;top:292px;width:360px;height:146px"></div><div class="stack-note" style="left:110px;top:480px">这条条件来自本次任务<br>不会在转场中换成另一个对象</div></div><div id="target-context"><div class="flow-panel" style="left:617px;top:192px;width:590px;height:385px"></div><div class="pane-label" style="left:652px;top:225px">简报编辑 / BRIEF-01</div><div id="target-marker" class="slot" style="left:653px;top:278px;width:492px;height:168px"></div><div class="stack-note" style="left:654px;top:487px">写作结构将由这条条件决定<br>原编号与含义保持一致</div></div><article id="handoff-object" class="packet"><div class="id">COND-03</div><strong>目标读者：初学者</strong><p>先解释问题，再演示步骤</p></article><div class="caption">保留同一对象，让观众知道信息去了哪里。</div>${label}</section>`,
    'compare':()=>`<section class="scene">${heading('compare')}<div class="window" id="comparison" style="left:100px;top:180px;width:1080px;height:390px"><article id="before" class="uek-layer" style="background:var(--uek-surface)">${brief(false)}</article><article id="after" class="uek-layer" style="background:var(--uek-surface)">${brief(true)}</article><div id="difference"></div><div id="divider"></div></div><div class="pane-label" style="left:102px;top:597px">← 拖动下方时间条：改变揭示比例 →</div><div class="caption">资料没换；明确读者后，简报的解释方式变了。</div>${label}</section>`,
    'causal-chain':()=>`<section class="scene">${heading('causal-chain')}<svg width="1280" height="720" style="position:absolute;inset:0"><path id="connection" d="M 399 376 H 452 M 801 376 H 853" pathLength="1" fill="none" stroke="var(--uek-accent)" stroke-width="4"/></svg><div class="flow-panel" style="left:60px;top:210px;width:339px;height:365px"></div><div class="flow-panel" style="left:454px;top:210px;width:347px;height:365px"></div><div class="flow-panel" style="left:854px;top:210px;width:366px;height:365px"></div><div id="input-label" class="pane-label" style="left:85px;top:234px">01 / 输入资料</div><div id="action-label" class="pane-label" style="left:479px;top:234px">02 / 核对关键条件</div><div id="result-label" class="pane-label" style="left:880px;top:234px">03 / 完整简报</div><article id="item0" class="flow-item">访谈与产品材料<small>DOC-01</small></article><article id="item1" class="flow-item">主题：资料整理<small>TOPIC-02</small></article><article id="item2" class="flow-item">读者：初学者<small>COND-03</small></article><div id="condition" class="check" style="position:absolute;left:486px;top:512px">关键条件齐全，继续写作</div><div id="result" style="position:absolute;left:890px;top:520px;font-size:17px;color:var(--uek-accent)">✓ 三项输入均在简报中保留</div><div class="caption">不是装饰性流线：输入对象实际经过核对，再进入结果。</div>${label}</section>`,
    'result-pullback':()=>`<section class="scene"><div id="world" class="uek-layer" style="background:var(--uek-background)"><div class="window" style="left:44px;top:52px;width:1192px;height:568px">${bar('研究工作台 / 本期资料整理')}</div><div class="world-label">项目 / 初学者资料整理</div><div class="world-title">把资料变成可用的解释</div><div class="nav-block">项目总览<br>18 份资料<br>关键条件<br><strong class="uek-accent">完整简报</strong></div><article class="report-surface" style="left:285px;top:220px;width:238px;height:326px"><h3>输入与条件</h3><div class="report-line">DOC-01<br><span class="muted">访谈与产品材料</span></div><div class="report-line">COND-03<br><span class="muted">目标读者：初学者</span></div></article><article class="report-surface" style="left:568px;top:247px;width:544px;height:296px"><span class="chip">BRIEF-01 · 完整简报</span><h3 style="margin-top:18px">先解释问题，再演示步骤</h3><div class="report-line">① 为什么素材齐全，解释仍不清楚</div><div class="report-line">② 找到并补上“目标读者”</div><div class="report-line">③ 用本期材料写出完整简报</div></article><div id="pullback-outline"></div><div id="context-label" class="pane-label" style="left:286px;top:578px">成果、输入与关键条件，都属于同一个项目。</div></div><div class="caption">近景先证明结果，退回整体再交代它的来源。</div>${label}</section>`
  };
  let active=K.names[0],playing=false,time=0,last=null,scheme=0,options={};
  function makeOptions(name){
    switch(name){
      case 'focus-mask':return {viewport:V,focus:{x:194,y:410,width:891,height:58},shades:[0,1,2,3].map(i=>$('shade'+i)),outline:$('focus-outline'),loupe:$('loupe'),loupeContent:$('loupe-content'),loupeTo:{x:128,y:535,width:1069,height:70}};
      case 'occlusion-reveal':return {viewport:V,previous:$('old-scene'),next:$('new-scene'),cover:$('cover'),bandSize:112};
      case 'match-handoff':return {object:$('handoff-object'),from:{x:112,y:292,width:360,height:146},to:{x:653,y:278,width:492,height:168},arcHeight:52,sourceContext:$('source-context'),targetContext:$('target-context'),sourceMarker:$('source-marker'),targetMarker:$('target-marker')};
      case 'compare':return {viewport:{width:1080,height:390},before:$('before'),after:$('after'),divider:$('divider'),regions:[{element:$('difference'),rect:{x:37,y:190,width:988,height:128}}]};
      case 'causal-chain':return {items:[0,1,2].map((i)=>({element:$('item'+i),from:{x:83,y:280+i*70,width:293,height:56},via:{x:478,y:280+i*70,width:299,height:56},to:{x:879,y:280+i*70,width:315,height:56},start:i*.09,end:.82+i*.09})),gate:.54,inputLabel:$('input-label'),actionLabel:$('action-label'),resultLabel:$('result-label'),condition:$('condition'),result:$('result'),connector:$('connection')};
      case 'result-pullback':return {viewport:V,world:$('world'),focus:{x:568,y:247,width:544,height:296},margin:60,contextLabel:$('context-label'),focusOutline:$('pullback-outline')};
    }
  }
  function renderAt(seconds){
    if(!Number.isFinite(seconds))throw new TypeError('time must be finite');
    time=Math.max(0,Math.min(DURATION,seconds));
    // End holds preserve reading time; compare retains direct manual control.
    const p=active==='compare'?time/DURATION:K.phase(time/DURATION,.12,.86);
    const state=K.apply(active,options,p);
    $('timeline').value=String(time);$('clock').textContent=`${time.toFixed(2)} / ${DURATION.toFixed(2)} 秒`;
    $('status').textContent=`${active} · 动画时间 ${time.toFixed(2)} 秒 · 概念示意 · 无音轨`;
    return {effect:active,time,progress:p,state};
  }
  function selectEffect(name){
    if(!builders[name])throw new RangeError('Unknown effect '+name);
    playing=false;last=null;active=name;stage.innerHTML=builders[name]();options=makeOptions(name);
    $('description').textContent=descriptions[name][2];$('play').textContent='播放';
    document.querySelectorAll('[data-effect]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.effect===name)));
    renderAt(0);
  }
  for(const name of K.names){const b=document.createElement('button');b.textContent=descriptions[name][0];b.dataset.effect=name;b.addEventListener('click',()=>selectEffect(name));$('tabs').append(b);}
  function fit(){stage.style.transform=`scale($('viewport').clientWidth/1280)`;}
  K.setTheme(stage,schemes[scheme]);selectEffect(active);fit();addEventListener('resize',fit);
  $('theme').addEventListener('click',()=>{scheme=(scheme+1)%schemes.length;K.setTheme(stage,schemes[scheme]);renderAt(time);});
  $('play').addEventListener('click',()=>{if(time>=DURATION)renderAt(0);playing=!playing;last=null;$('play').textContent=playing?'暂停':'播放';});
  $('restart').addEventListener('click',()=>{playing=false;last=null;renderAt(0);$('play').textContent='播放';});
  $('timeline').addEventListener('input',()=>{playing=false;last=null;$('play').textContent='播放';renderAt(Number($('timeline').value));});
  function tick(now){if(playing){if(last!==null)renderAt(time+(now-last)/1000);if(time>=DURATION){playing=false;$('play').textContent='播放';}}last=now;requestAnimationFrame(tick);}
  const query=new URLSearchParams(location.search);
  if(query.has('effect'))selectEffect(query.get('effect'));
  if(query.has('t'))renderAt(Number(query.get('t')));
  window.duration=DURATION;window.renderAt=renderAt;window.selectEffect=selectEffect;
  window.ready=async()=>{await document.fonts.ready;return true;};
  // No media in this demo. A host keeps video transport on its own mediaTime.
  window.render=async(animationTime,mediaTime)=>{void mediaTime;return renderAt(animationTime);};
  window.motionActive=(t)=>active==='compare'?t>0&&t<DURATION:t>DURATION*.12&&t<DURATION*.86;
  if(query.get('render')!=='1')requestAnimationFrame(tick);
})();
