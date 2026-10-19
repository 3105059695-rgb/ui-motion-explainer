'use strict';
/* The frame is a pure function of (scene, t, mediaTime). The browser player
   supplies time; it never changes the rendered state through timers/randomness. */
(() => {
  const $ = (id) => document.getElementById(id);
  const clamp = (v, a=0, b=1) => Math.max(a, Math.min(b, v));
  const ease = (p) => {p=clamp(p);return p*p*(3-2*p);};
  const ramp = (t, a, b) => ease((t-a)/(b-a));
  const mix = (a,b,p) => a+(b-a)*p;
  const css = (id, rules) => Object.assign((typeof id==='string'?$(id):id).style,rules);
  const show = (id, opacity) => css(id,{opacity:String(clamp(opacity))});
  const text = (id,value) => {const e=$(id);if(e&&e.textContent!==String(value))e.textContent=String(value);};
  const rgba = (hex,a) => {const h=hex.replace('#','');return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;};
  const hexMix=(a,b,p)=>'#'+[0,2,4].map(i=>Math.round(mix(parseInt(a.slice(i+1,i+3),16),parseInt(b.slice(i+1,i+3),16),p)).toString(16).padStart(2,'0')).join('');
  const file='<span class="file-symbol" aria-hidden="true"></span>';
  const sceneList=window.FUSION_SCENES;
  const query=new URLSearchParams(location.search);
  const exportMode=query.get('render')==='1';
  const defaults={mode:'fusion',duration:72,fps:50,scene:'all',presenter:'',audio:'',sourceOffset:0,circle:{x:94,y:764,size:174,position:'50% 35%'}};
  let config={...defaults},selectedScene=null,currentScene=null,time=0,playing=!exportMode,speed=1,lastFrame=null;
  let currentMediaTime=0,mediaLoaded=false,pendingFrame=false;
  const info = id => sceneList.find(s=>s.id===id);
  const sceneDuration = id => info(id)?.duration || 9;
  const totalDuration = () => selectedScene ? sceneDuration(selectedScene) : 72;
  const clock = (t, precision=false) => {const v=Math.max(0,t);const s=Math.floor(v);return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}${precision?'.'+String(Math.floor((v-s)*100+1e-6)).padStart(2,'0'):''}`;};
  const cursor = (x,y,o=1) => css('cursor',{left:`${x}px`,top:`${y}px`,opacity:String(clamp(o))});
  const click = (t,at,x,y) => {const p=clamp((t-at)/.36);const visible=t>=at&&t<=at+.36;css('click-ring',{left:`${x-19}px`,top:`${y-20}px`,opacity:String(visible?(1-p)*.75:0),transform:`scale(${mix(.55,1.24,p)})`});};
  const localCursor=(x,y,o=1)=>cursor(x+352,y+382,o);
  const bezier=(p,a,b,c,d)=>({x:(1-p)**3*a.x+3*(1-p)**2*p*b.x+3*(1-p)*p*p*c.x+p**3*d.x,y:(1-p)**3*a.y+3*(1-p)**2*p*b.y+3*(1-p)*p*p*c.y+p**3*d.y});

  function tableMarkup(){
    const rows=[['项目启动说明','林然','已确认','今天 09:20'],['用户访谈记录','林然','待确认','今天 10:45'],['内容排期与交付标准','陈一','进行中','今天 10:10'],['视觉参考与素材','周可','已整理','昨天 16:32'],['本周任务清单','陈一','进行中','昨天 15:08']];
    return `<div class="view-toolbar"><div class="view-tabs"><strong>全部资料 <small>6</small></strong><span>最近更新</span><span>已归档</span></div><div class="view-search">⌕ &nbsp; 搜索资料</div></div><div class="table-shell" id="table-shell"><div class="table-head" id="table-head"><span>资料名称</span><span>负责人</span><span>状态</span><span class="updated-col">更新时间</span></div>${rows.map((r,i)=>`<div class="table-row" id="file-row-${i}" data-object-id="${i===1?'DOC-014':'DOC-0'+(i+10)}" style="top:${49+i*76}px"><div class="row-title">${file}<span>${r[0]}</span></div><div class="row-owner"><b>${r[1][0]}</b>${r[1]}</div><span><span class="pill${r[2]==='已确认'||r[2]==='已整理'?' purple':''}" id="row-state-${i}">${r[2]}</span></span><span class="row-date updated-col">${r[3]}</span></div>`).join('')}</div><div class="table-note">显示 5 份近期资料 · 1 份已归档</div><aside id="detail-panel" class="detail-panel panel-surface" data-object-id="DOC-014"><div class="panel-top"><span>资料详情</span><span>×</span></div><div class="panel-body"><div class="identity">DOC-014 · 研究资料</div><h3>用户访谈记录</h3><p>整理需求与反馈，<br>让每条结论都有原文。</p><div class="data-fields"><div class="data-field"><span>负责人</span><strong>林然</strong></div><div class="data-field"><span>原始记录</span><strong>12 份</strong></div><div class="data-field"><span>引用状态</span><strong class="purple">已保留</strong></div></div><div class="black-button" id="detail-button">打开文档</div></div></aside>`;
  }
  function focusMarkup(){return `<div class="doc-layout"><article class="document-view" data-object-id="DOC-014"><div class="identity">DOC-014 · 原始记录</div><h3 class="doc-title" style="margin-top:13px">用户访谈记录</h3><p class="document-paragraph" id="doc-context-top"><strong>访谈对象</strong> &nbsp; 12 位内容创作者<br>任务：收集工作中的资料整理与交接需求。</p><section class="focus-field" id="focus-field"><i class="focus-marker" id="focus-marker"></i><h3>关键需求</h3><p>保留原始出处，让团队能够<br>沿着同一份资料继续协作。</p></section><p class="doc-ref" id="doc-context-bottom">原文编号：INT-006 · 访谈时间：本周二<br>当前摘录保留在 DOC-014，内容未改写。</p></article><aside class="doc-side"><div class="panel-surface"><div class="panel-top">引用信息</div><div class="panel-body"><h3>原文可以追溯</h3><p>来自同一份访谈记录，<br>不是重新生成的结论。</p><p class="identity">DOC-014 / INT-006</p></div></div><div class="ghost-button" id="focus-button">聚焦关键需求</div><p class="doc-annotation" id="doc-annotation">已定位原文<br>只强调当前阅读区域</p></aside></div>`;}
  function handoffMarkup(){return `<div class="handoff-stage"><section class="handoff-source panel-surface"><div class="panel-top">原始资料</div><div class="panel-body"><div class="identity">市场调研 / 资料库</div><h3>资料作为报告依据</h3><div class="source-placeholder"><span>原资料保留在资料库</span></div><div class="black-button" id="handoff-button">加入研究报告</div></div></section><section class="handoff-target panel-surface"><div class="panel-top"><span>研究报告</span><span class="identity">RPT-003</span></div><div class="panel-body"><div class="identity">RPT-003 · 需求摘要</div><h3>关键结论与引用</h3><p>协作需要连续的资料入口，<br>每个结论都能找到原始记录。</p><div class="report-section-label">引用资料</div></div></section><svg class="handoff-path" viewBox="0 0 1430 528"><path id="handoff-path" d="M258 251 C540 404 908 398 1080 416" fill="none" stroke="#dbd7e4" stroke-width="2" stroke-dasharray="7 9"/></svg><div class="file-packet" id="file-packet" data-object-id="DOC-014"><div class="packet-top">${file}<span>用户访谈记录</span></div><div class="identity">DOC-014 · 原始记录</div></div><div class="report-received" id="report-received" data-reference-id="DOC-014"><strong>${file}<span>用户访谈记录</span></strong><div class="identity">引用 DOC-014 · 保留原始出处</div></div><div class="handoff-proof" id="handoff-proof"><b>引用已加入报告</b> · 文件名与编号保持一致</div></div>`;}
  function workflowMarkup(){return `<div class="workflow"><div class="workflow-bar"><div class="workflow-identity"><b>TASK-003</b><span>用 DOC-014 生成需求摘要</span></div><div class="workflow-actions"><span class="pill" id="workflow-state">待开始</span><div class="black-button" id="workflow-action">开始任务</div></div></div><div class="workflow-board"><svg class="workflow-lines" viewBox="0 0 1430 247"><path d="M288 125H375M621 125H708M954 125H1041" stroke="#d7dbe3" stroke-width="2.5" fill="none"/></svg>${['原始资料','提取需求','人工核对','研究报告'].map((s,i)=>`<div class="node" id="workflow-node-${i}" style="left:${45+i*333}px"><div class="node-title">${s}<span class="node-step">0${i+1}</span></div><p class="node-status" id="node-status-${i}">${i===0?'DOC-014 · 12 份':'等待前一步'}</p></div>`).join('')}<div class="workflow-packet" id="workflow-packet"></div></div><div class="workflow-meter"><div class="meter-label"><span id="workflow-description">准备读取原始资料</span><span id="workflow-percent">0%</span></div><div class="meter-track"><div class="meter-fill" id="workflow-fill"></div></div><p class="small-label" id="workflow-pause-note" style="margin-top:23px">点击开始后，数据沿工作路径传递。</p></div><div class="workflow-result" id="workflow-result"><h3 id="workflow-result-title">结果区</h3><p id="workflow-result-text">完成后，报告回到工作空间。</p></div><div class="workflow-return" id="workflow-return" data-object-id="RPT-003"></div></div>`;}
  function reportMarkup(){return `<article class="report-area" data-object-id="RPT-003"><div class="report-toolbar"><span>RPT-003 / 需求摘要</span><span>已保存 · 林然</span></div><div class="report-body"><h3>用户需求研究报告</h3><p class="report-meta">基于 DOC-014 · 12 份访谈记录 · 示例内容</p><div class="summary-banner"><p class="masked-line" id="masked-line">资料与引用保持关联，团队才能接着工作。</p></div><div class="report-expand-trigger"><div class="ghost-button" id="report-expand-button">展开摘要</div></div><section class="report-expanded" id="report-expanded"><div class="report-columns"><div><strong>需要解决的问题</strong><p>资料分散在不同入口，<br>整理后的结论失去原始出处。</p></div><div><strong>本次整理结果</strong><p>把关键需求、原文与负责人，<br>保留在同一份可追溯报告里。</p></div></div><div class="report-reference">引用：DOC-014 / INT-006 &nbsp; · &nbsp; 用户访谈记录 &nbsp; · &nbsp; 原文已保留</div></section></div></article>`;}
  function comparisonMarkup(){return `<div class="comparison"><div class="comparison-top"><p>相同任务：<b>整理 12 份访谈记录</b> &nbsp; · &nbsp; 同一单位：分钟</p><div class="black-button" id="compare-play">播放对比</div></div><div class="comparison-timeline"><div class="axis"><span>0</span><span>8</span><span>16</span><span>24 分钟</span></div><div class="compare-row old"><span class="compare-label">逐份整理</span><div class="compare-track"><div class="compare-fill" id="old-fill"></div></div><span class="compare-number" id="old-number">0</span></div><div class="compare-row new"><span class="compare-label">辅助整理</span><div class="compare-track"><div class="compare-fill" id="new-fill"></div></div><span class="compare-number" id="new-number">0</span></div><p class="compare-stop" id="compare-stop">示例时间轴压缩呈现 · 不代表真实响应速度</p></div><div class="comparison-outcome" id="comparison-outcome"><div><h3>相同任务，减少 16 分钟</h3><p>示例值：24 − 8 = 16，减少约 67%</p></div><div class="outcome-number">16 <span>分钟</span></div></div></div>`;}
  function settingsMarkup(){return `<div class="settings"><section class="settings-controls"><h3>报告显示设置</h3><div class="settings-label"><span>布局行距</span><strong id="spacing-value">16 px</strong></div><div class="control-slider" id="layout-slider"><div class="slider-fill" id="slider-fill"></div><div class="slider-knob" id="slider-knob"></div></div><div class="slider-caption"><span>紧凑</span><span>舒展</span></div><div class="control-rule"></div><div class="setting-toggle-row"><span>保留原始引用</span><div class="control-switch" id="citation-switch"><i class="switch-knob" id="switch-knob"></i></div></div><p class="settings-helper">保留文件编号与原始出处，<br>让结果可以继续核对。</p><div class="black-button" id="save-settings">保存设置</div></section><article class="settings-preview" data-object-id="RPT-003"><div class="preview-label">实时预览 · RPT-003</div><div class="preview-body"><h3>用户需求研究报告</h3><p class="small-label">来自同一份资料的连续预览</p><div class="preview-list">${['关键需求：资料能够追溯','协作要求：保持对象身份','交付原则：结果可继续核对'].map((s,i)=>`<div class="preview-row" id="preview-row-${i}">${s}</div>`).join('')}</div><p class="preview-citation" id="preview-citation">引用 DOC-014 / INT-006<br>用户访谈记录 · 原始出处已保留</p></div><p class="setting-saved" id="setting-saved">已保存</p></article></div>`;}
  const makers={F01:tableMarkup,F02:focusMarkup,F03:handoffMarkup,F04:workflowMarkup,F05:reportMarkup,F06:comparisonMarkup,F07:settingsMarkup,F08:tableMarkup};

  function mountScene(id){
    if(currentScene===id)return;
    currentScene=id;
    const data=info(id);
    $('scene-content').innerHTML=makers[id]();
    text('breadcrumb',`市场调研 / ${data.nav}`);text('page-title',data.page);text('page-subtitle',data.subtitle);
    text('scene-caption',`${id} · ${data.caption}`);text('scene-id',id);text('scene-title',data.title);text('scene-logic',data.logic);
    text('header-action',id==='F07'?'显示设置':id==='F04'?'任务中心':'共享空间');
    document.querySelectorAll('.nav-item').forEach(e=>e.classList.toggle('active',e.dataset.nav===data.nav));
    document.querySelectorAll('#scene-tabs button').forEach(e=>e.classList.toggle('active',e.dataset.scene===id));
    $('source-map').replaceChildren(...data.source.flatMap(([title,value])=>{const dt=document.createElement('dt');dt.textContent=title;const dd=document.createElement('dd');dd.textContent=value;return[dt,dd];}));
    css('workspace',{left:'96px',top:'124px',transform:'none',transformOrigin:'50% 50%',opacity:'1'});
    css('presenter',{display:id==='F08'?'block':'none'});css('presenter-label',{display:id==='F08'?'block':'none'});css('media-clock',{display:id==='F08'?'block':'none'});
    const old=$('handoff-copy');if(old)old.remove();
    if(id==='F08'){
      const copy=document.createElement('div');copy.id='handoff-copy';copy.className='handoff-copy';copy.innerHTML='<p class="identity">同一场讲解，连续进入软件操作</p><h3>把讲解，交接给工作台</h3>';
      $('stage').append(copy);css(copy,{display:'block'});
    }
    const triggers={F01:[['detail-button',6.8]],F02:[['focus-button',2]],F03:[['handoff-button',2]],F04:[['workflow-action',1.4]],F05:[['report-expand-button',2.3]],F06:[['compare-play',1.4]],F07:[['save-settings',7.1],['citation-switch',5.05]],F08:[]};
    for(const [el,at]of triggers[id])$(el)?.addEventListener('click',()=>seekLocal(at));
  }

  function renderF01(t){
    const selection=ramp(t,1.82,2.05),open=ramp(t,2.18,3.05),confirmed=ramp(t,6.1,6.4);
    $('file-row-1').classList.toggle('selected',selection>.02);
    css('file-row-1',{background:rgba('#EEE8FB',selection)});
    css('table-shell',{width:`${mix(1430,870,open)}px`});
    const grid=`1fr ${mix(180,160,open)}px ${mix(170,154,open)}px ${220*(1-open)}px`;
    css('table-head',{gridTemplateColumns:grid});
    for(let i=0;i<5;i++)css(`file-row-${i}`,{gridTemplateColumns:grid});
    document.querySelectorAll('.updated-col').forEach(e=>e.style.opacity=String(1-open));
    css('detail-panel',{opacity:String(ramp(t,2.42,3.04)),transform:`translateX(${mix(34,0,open)}px)`,clipPath:`inset(0 ${100*(1-open)}% 0 0)`});
    const zoom=ramp(t,2.3,3.15)*.021;
    css('workspace',{transform:`scale(${1+zoom})`,transformOrigin:'63% 53%'});
    text('row-state-1',confirmed>.5?'已确认':'待确认');$('row-state-1').classList.toggle('purple',confirmed>.5);
    text('detail-button',confirmed>.5?'已确认 · 可继续打开':'确认资料');
    text('app-state',open>.99?'DOC-014 · 同一份用户访谈记录':'6 份资料已同步');
    let p=ramp(t,.75,1.65);localCursor(mix(950,302,p),mix(42,178,p),(1-ramp(t,2.75,3.1))*ramp(t,.6,.85));
    if(t>5.4){p=ramp(t,5.4,6.07);localCursor(mix(302,1170,p),mix(178,463,p),1-ramp(t,6.6,6.9));}
    click(t,t<5?1.82:6.1,t<5?656:1522,t<5?560:845);
  }
  function renderF02(t){
    const p=ramp(t,2.1,2.72);
    css('focus-field',{background:hexMix('#F8F9FB','#EEE8FB',p),borderColor:hexMix('#E8E9EF','#C9B9E5',p)});
    show('focus-marker',p);show('doc-context-top',mix(1,.36,p));show('doc-context-bottom',mix(1,.43,p));show('doc-annotation',ramp(t,3.2,3.6));
    text('focus-button',p>.99?'已聚焦 · 保留上下文':'聚焦关键需求');
    let q=ramp(t,.8,1.94);localCursor(mix(946,1175,q),mix(43,374,q),ramp(t,.6,.9)*(1-ramp(t,2.8,3.1)));
    click(t,2.08,1527,756);text('app-state',p>.99?'当前焦点：DOC-014 / 关键需求':'DOC-014 · 原文未改写');
  }
  function renderF03(t){
    const p=ramp(t,2.15,4.35),arrive=ramp(t,4.18,4.45);
    const xy=bezier(p,{x:28,y:180},{x:310,y:332},{x:617,y:326},{x:758,y:344});
    const width=mix(460,644,p);
    css('file-packet',{left:`${xy.x}px`,top:`${xy.y}px`,width:`${width}px`,opacity:String(1-arrive),transform:`rotate(${Math.sin(p*Math.PI)*-3}deg)`});
    show('report-received',arrive);show('handoff-proof',ramp(t,5.1,5.55));
    text('handoff-button',p>.99?'已加入 · 原资料保留':'加入研究报告');
    css('handoff-path',{strokeDashoffset:String(-120*p),opacity:String(.65*(1-ramp(t,4.9,5.4)))});
    const q=ramp(t,.65,1.85);localCursor(mix(710,257,q),mix(32,476,q),ramp(t,.5,.8)*(1-ramp(t,2.48,2.8)));
    click(t,2.05,609,858);text('app-state',arrive>.99?'RPT-003 / 引用 DOC-014 · 身份一致':'DOC-014 · 等待加入报告');
  }
  function workflowClock(t){
    if(t<1.4)return 0;
    if(t<2.95)return(t-1.4)/4.5;
    if(t<4.15)return 1.55/4.5;
    return clamp((t-4.15+1.55)/4.5);
  }
  function renderF04(t){
    const p=workflowClock(t),paused=t>=2.95&&t<4.15,done=p>=1;
    text('workflow-state',done?'已完成':paused?'已暂停':p>0?'进行中':'待开始');
    $('workflow-state').classList.toggle('purple',p>0);
    text('workflow-action',done?'报告已回收':paused?'继续任务':p>0?'暂停任务':'开始任务');
    text('workflow-percent',`${Math.round(p*100)}%`);css('workflow-fill',{width:`${p*100}%`});
    const stage=Math.min(3,Math.floor(p*3.999));
    const statuses=['资料已读取','需求已提取','已核对出处','报告已完成'];
    for(let i=0;i<4;i++){
      const active=i===stage&&p>0;
      css(`workflow-node-${i}`,{borderColor:active?'#BFAADD':'#DFE2E9',background:active?'#F2ECFC':'#FFFFFF'});
      text(`node-status-${i}`,i<stage||done?statuses[i]:i===stage&&p>0?(paused?'当前步骤已暂停':i===0?'读取 DOC-014':i===1?'正在提取需求':i===2?'正在核对出处':'汇总 RPT-003'):(i===0?'DOC-014 · 12 份':'等待前一步'));
    }
    css('workflow-packet',{left:`${mix(168,1167,p)}px`,top:'118px',opacity:String(p>0&&!done?.95:0)});
    text('workflow-description',done?'任务完成 · 等待结果回收':paused?'已暂停：任务与传输同时停下':['读取原始资料','提取关键需求','核对原文出处','生成研究报告'][stage]);
    text('workflow-pause-note',paused?'传输位置与进度保持不变，等待“继续任务”。':done?'报告继续回到工作空间，引用编号保持一致。':'操作触发流程，数据沿当前工作路径传递。');
    const ret=ramp(t,6.4,7.25);show('workflow-return',t>=6.4?(1-ramp(t,7.05,7.3)):0);
    css('workflow-return',{left:`${mix(1130,1120,ret)}px`,top:`${mix(188,407,ret)}px`,transform:`scale(${mix(.8,.62,ret)})`});
    const result=ramp(t,7.1,7.4);
    text('workflow-result-title',result>.5?'研究报告 · RPT-003':'结果区');text('workflow-result-text',result>.5?'来自 DOC-014 · 可继续打开核对':'完成后，报告回到工作空间。');
    css('workflow-result',{borderColor:result>.5?'#D1C3E7':'#E5E7EC',background:result>.5?'#F1ECF9':'#F9F9FC'});
    let at=1.37;if(t>=2.35&&t<3.4)at=2.95;else if(t>=3.4)at=4.15;
    let visible=ramp(t,.55,.85)*(1-ramp(t,1.85,2.2));
    if(t>=2.3)visible=ramp(t,2.3,2.55)*(1-ramp(t,4.65,4.95));
    localCursor(1340,25,visible);click(t,at,1692,407);
    text('app-state',paused?'TASK-003 · 暂停态一致':result>.99?'结果已回收：RPT-003':done?'TASK-003 · 任务已完成':'TASK-003 · 由操作触发');
  }
  function renderF05(t){
    const reveal=ramp(t,2.35,3.2),expanded=ramp(t,3.12,4.02);
    css('masked-line',{clipPath:`inset(0 ${100*(1-reveal)}% 0 0)`});
    css(document.querySelector('.summary-banner'),{height:'78px',background:hexMix('#F8F7FA','#F5F2FA',reveal)});
    css('report-expanded',{clipPath:`inset(0 0 ${100*(1-expanded)}% 0)`,transform:`translateY(${mix(-12,0,expanded)}px)`});
    text('report-expand-button',expanded>.99?'摘要已展开':'展开摘要');
    const q=ramp(t,.7,2.2);localCursor(mix(1010,127,q),mix(42,295,q),ramp(t,.5,.8)*(1-ramp(t,2.8,3.15)));
    click(t,2.3,479,677);text('app-state',expanded>.99?'RPT-003 · 摘要与引用已展开':'RPT-003 · 文档位置保持不变');
  }
  function renderF06(t){
    const p=clamp((t-1.4)/4.8),minutes=24*p,newTime=Math.min(minutes,8);
    css('old-fill',{width:`${p*100}%`});css('new-fill',{width:`${newTime/24*100}%`});
    text('old-number',String(Math.round(minutes)));text('new-number',String(Math.round(newTime)));
    text('compare-play',p>=1?'对比完成':p>0?'正在播放':'播放对比');
    text('compare-stop',minutes>=8?'辅助整理已到 8 分钟并保持完成态 · 示例时间压缩展示':'示例时间轴压缩呈现 · 不代表真实响应速度');
    show('comparison-outcome',ramp(t,6.35,6.85));
    localCursor(1322,23,ramp(t,.6,.95)*(1-ramp(t,1.9,2.25)));click(t,1.4,1674,405);
    text('app-state',p>=1?'示例对比：24 分钟 → 8 分钟':'示例数据 · 单位统一为分钟');
  }
  function renderF07(t){
    const drag=ramp(t,1.85,3.25),spacing=mix(16,28,drag),on=ramp(t,5.05,5.35),saved=ramp(t,7.07,7.36);
    text('spacing-value',`${Math.round(spacing)} px`);css('slider-fill',{width:`${mix(180,379,drag)}px`});css('slider-knob',{left:`${mix(170,369,drag)}px`});
    for(let i=0;i<3;i++)css(`preview-row-${i}`,{paddingTop:`${spacing}px`,paddingBottom:`${spacing}px`});
    css('citation-switch',{background:hexMix('#DCE0E7','#8061C7',on)});css('switch-knob',{left:`${mix(5,38,on)}px`});
    show('preview-citation',on);show('setting-saved',saved);text('save-settings',saved>.5?'已保存 · RPT-003':'保存设置');
    let x=mix(208,404,drag),y=145,o=ramp(t,.6,.9)*(1-ramp(t,3.45,3.8));
    if(t>3.8&&t<6.1){const p=ramp(t,3.85,4.95);x=mix(404,493,p);y=mix(145,291,p);o=ramp(t,3.85,4.08)*(1-ramp(t,5.5,5.8));}
    if(t>=6.1){const p=ramp(t,6.1,6.93);x=mix(493,260,p);y=mix(291,471,p);o=ramp(t,6.1,6.4)*(1-ramp(t,7.48,7.8));}
    localCursor(x,y,o);const at=t<4?1.85:t<6.1?5.05:7.07;click(t,at,x+352,y+382);
    text('app-state',saved>.5?'RPT-003 · 显示设置已保存':on>.99?'引用已保留 · 可在预览中核对':'拖动布局行距，预览同步变化');
  }
  function renderF08(t,mediaTime){
    const p=ramp(t,2.2,4.65),ui=ramp(t,.6,1.2),copyOut=ramp(t,1.95,2.5),circle={...defaults.circle,...config.circle};
    css('presenter',{left:`${mix(215,Number(circle.x),p)}px`,top:`${mix(179,Number(circle.y),p)}px`,width:`${mix(470,Number(circle.size),p)}px`,height:`${mix(640,Number(circle.size),p)}px`,borderRadius:`${mix(24,Number(circle.size)/2,p)}px`});
    css('presenter-label',{left:`${mix(215,Number(circle.x),p)}px`,top:`${mix(841,Number(circle.y)-66,p)}px`,width:`${mix(470,210,p)}px`,fontSize:`${mix(22,18,p)}px`,opacity:String(clamp(1-ramp(t,2.05,2.3)+ramp(t,4.65,4.9)*.76))});
    css('media-clock',{left:`${mix(219,Number(circle.x),p)}px`,top:`${mix(886,Number(circle.y)+Number(circle.size)+17,p)}px`,fontSize:`${mix(20,17,p)}px`});
    text('media-clock','单一媒体时钟 ');const b=document.createElement('b');b.textContent=clock(mediaTime,true);$('media-clock').append(b);
    show('handoff-copy',1-copyOut);css('handoff-copy',{transform:`translateY(${copyOut*-20}px)`});
    const scale=mix(.53,.855,p),x=mix(850,323,p),y=mix(295,163,p);
    css('workspace',{left:'96px',top:'124px',transform:`translate(${x-96}px,${y-124}px) scale(${scale})`,transformOrigin:'0 0',opacity:String(ui)});
    const selection=ramp(t,5.92,6.14),open=ramp(t,6.22,7.1);
    $('file-row-1').classList.toggle('selected',selection>.02);css('file-row-1',{background:rgba('#EEE8FB',selection)});
    css('table-shell',{width:`${mix(1430,870,open)}px`});
    const grid=`1fr ${mix(180,160,open)}px ${mix(170,154,open)}px ${220*(1-open)}px`;
    css('table-head',{gridTemplateColumns:grid});for(let i=0;i<5;i++)css(`file-row-${i}`,{gridTemplateColumns:grid});document.querySelectorAll('.updated-col').forEach(e=>e.style.opacity=String(1-open));
    css('detail-panel',{opacity:String(ramp(t,6.4,7.03)),transform:`translateX(${mix(30,0,open)}px)`,clipPath:`inset(0 ${100*(1-open)}% 0 0)`});
    const q=ramp(t,5.05,5.82);cursor(x+(216+40+mix(920,302,q))*scale,y+(58+200+mix(41,178,q))*scale,ramp(t,5.0,5.25)*(1-ramp(t,6.5,6.8)));
    click(t,5.93,x+(216+40+302)*scale,y+(58+200+178)*scale);
    text('app-state',open>.99?'同一人物继续讲解 · 同一资料展开':'人物与界面连续交接');
  }
  const renderers={F01:renderF01,F02:renderF02,F03:renderF03,F04:renderF04,F05:renderF05,F06:renderF06,F07:renderF07,F08:renderF08};

  async function syncMedia(mediaTime){
    currentMediaTime=mediaTime;
    const video=$('presenter-video');
    if(!mediaLoaded||!video.src)return;
    const wanted=clamp(mediaTime+Number(config.sourceOffset||0),0,Math.max(0,video.duration-.001));
    if(Math.abs(video.currentTime-wanted)<.004)return;
    const done=new Promise(resolve=>video.addEventListener('seeked',resolve,{once:true}));
    video.currentTime=wanted;await done;
  }
  window.render=async (t,mediaTime=t)=>{
    t=clamp(Number(t)||0,0,totalDuration()-1e-6);
    const idx=selectedScene?sceneList.findIndex(s=>s.id===selectedScene):Math.min(7,Math.floor(t/9));
    const id=sceneList[idx].id,local=selectedScene?t:t-idx*9;
    mountScene(id);cursor(0,0,0);show('click-ring',0);
    renderers[id](local,Number(mediaTime)||0);
    show('scene-curtain',selectedScene?0:local>.01&&local<.38?1-ramp(local,.01,.38):0);
    await syncMedia(Number(mediaTime)||0);
    window.fusionState={scene:id,localTime:local,mediaTime:Number(mediaTime)||0,objectId:info(id).object,playing,sourceMode:'interface-demonstration'};
    window.FUSION_STATE={scene:id,time:local,mediaTime:Number(mediaTime)||0};
    $('presenter').dataset.mediaTime=String(Number(mediaTime)||0);
  };
  const activeWindows={F01:[[.75,3.18],[5.4,6.95]],F02:[[.8,3.65]],F03:[[.65,4.55]],F04:[[1.4,2.95],[4.15,7.4]],F05:[[.7,4.06]],F06:[[1.4,6.21]],F07:[[1.85,3.26],[4.0,5.4],[6.1,7.4]],F08:[[.6,1.2],[1.95,4.68],[5.05,7.12]]};
  window.motionActive=t=>{const id=selectedScene||sceneList[Math.min(7,Math.floor(clamp(Number(t)||0,0,71.999)/9))].id;const local=selectedScene?Number(t):Number(t)%9;return activeWindows[id].some(([a,b])=>local>=a&&local<=b);};
  function updateControls(){text('time-label',`${clock(time)} / ${clock(totalDuration())}`);$('time-slider').max=String(totalDuration());$('time-slider').value=String(time);text('play-pause',playing?'暂停':'播放');$('play-pause').setAttribute('aria-label',playing?'暂停播放':'开始播放');$('stage').dataset.duration=String(totalDuration());}
  async function seek(t){time=clamp(t,0,totalDuration()-.00001);lastFrame=null;await window.render(time,time);updateControls();}
  function seekLocal(t){const base=selectedScene?0:sceneList.findIndex(s=>s.id===currentScene)*9;return seek(base+t);}
  window.selectScene=async id=>{if(id!=='all'&&!info(id))throw new Error('Unknown scene: '+id);selectedScene=id==='all'?null:id;await seek(0);};
  window.getProject=()=>({...config,scene:selectedScene||'all',duration:totalDuration()});
  function resize(){const host=$('stage-host');const s=Math.min(host.clientWidth/1920,host.clientHeight/1080);css('stage',{transform:`scale(${s})`,left:`${(host.clientWidth-1920*s)/2}px`,top:`${(host.clientHeight-1080*s)/2}px`});}
  window.addEventListener('resize',resize);
  async function load(){
    document.documentElement.classList.toggle('render-mode',exportMode);
    if(location.protocol!=='file:'){try{const res=await fetch('project.json');if(res.ok)config={...defaults,...await res.json()};}catch(_){/* file/open fallback stays fully local */}}
    const scene=query.get('scene')||config.scene||'all';selectedScene=scene!=='all'&&info(scene)?scene:null;
    for(const data of sceneList){const button=document.createElement('button');button.type='button';button.dataset.scene=data.id;const b=document.createElement('b');b.textContent=data.id;button.append(b,document.createTextNode(data.title));button.addEventListener('click',()=>window.selectScene(data.id));$('scene-tabs').append(button);}
    const video=$('presenter-video');
    if(config.presenter){video.src=config.presenter;video.muted=true;video.pause();css(video,{display:'block',objectPosition:config.circle?.position||defaults.circle.position});css('presenter-art',{display:'none'});await new Promise((resolve,reject)=>{if(video.readyState>=1){mediaLoaded=true;resolve();return;}video.addEventListener('loadedmetadata',()=>{mediaLoaded=true;resolve();},{once:true});video.addEventListener('error',()=>reject(new Error('Presenter media failed to load')),{once:true});});text('presenter-label','原人物素材 · 单一视频层');}
    await document.fonts.ready;await Promise.all([document.fonts.load('800 32px MotionCN','用户访谈记录'),document.fonts.load('700 32px MotionNumber','0123456789')]);
    resize();await seek(0);window.fusionReady=true;
    $('play-pause').addEventListener('click',()=>{playing=!playing;lastFrame=null;updateControls();});
    $('replay').addEventListener('click',()=>seek(0));
    $('all-scenes').addEventListener('click',()=>window.selectScene('all'));
    $('time-slider').addEventListener('input',e=>{playing=false;seek(Number(e.target.value));});
    $('speed').addEventListener('change',e=>{speed=Number(e.target.value);lastFrame=null;});
    $('fullscreen').addEventListener('click',()=>{if(document.fullscreenElement)document.exitFullscreen();else $('stage-host').requestFullscreen();});
    document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;if(e.code==='Space'){e.preventDefault();playing=!playing;lastFrame=null;updateControls();}else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();playing=false;seek(time+(e.key==='ArrowRight'?1:-1)*(e.shiftKey?1:1/50));}});
    if(!exportMode)requestAnimationFrame(frame);
  }
  async function frame(now){
    if(lastFrame===null)lastFrame=now;
    if(playing&&!pendingFrame){time+=(now-lastFrame)/1000*speed;if(time>=totalDuration())time=0;pendingFrame=true;await window.render(time,time);pendingFrame=false;updateControls();}
    lastFrame=now;requestAnimationFrame(frame);
  }
  const ready=load();window.ready=()=>ready;
})();
