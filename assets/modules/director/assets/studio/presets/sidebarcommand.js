/* Noe / Enobase: observed category preview and command search, original DOM/SVG. */
(function () {
  'use strict';
  const duration = 20;
  const media = 'https://cdn.collectui.com/amplify_video/2098831399398842368/vid/avc1/1872x1080/4DoqOwx9eI26QMqO-optimized.mp4';
  UIFX.register({
    id: 'interaction-module-preview-search', title: '模块目录 · 分类预览与即时搜索', category: 'interaction', duration,
    source: 'https://x.com/noechague/status/2098831532844593508', referenceMedia: media,
    sourceStatus: 'observed-reconstruction', sourceObservation: 'multiple-video-times',
    description: '同一模块目录中选择财务，原位展开发票预览；打开搜索后背景持续模糊，查询逐字过滤结果并收拢面板，停在未提交状态。',
    adaptationNotes: '原片1872×1080、6.933333秒，主要链为全部模块→财务6项与发票预览→搜索浮层→in的两项→Inte的一项，未选择结果或跳转。横屏20秒重排并延长阅读；英文标签配中文，输入默认为小写inte。山水原图改为独立CSS渐变，图标为独立SVG。发票内容为明确示例；目录计数沿用源画面示意，非已实现业务数量。新增轻微窗口入场和点击环，光标路径与缓动近似。搜索只对六条本地示例名称过滤；没有真实模块、开票、登录或网络调用。',
    tags: ['Collect UI', 'Sidebar', 'Command Bar', 'Search', 'Dark Mode', '原位预览', '连续过滤'],
    params: { title: '模块目录', prompt: 'inte', result: '年度活动 · 发票预览' }, paramLimits: { title: 20, prompt: 24, result: 28 },
    sectionRanges: { directory: [0, 4], finance: [4, 11], search: [11, 20] }
  }, function (c, p) {
    const e = c.esc;
    const clean = (value, fallback, limit) => Array.from(String(value || fallback).replace(/\s+/g, ' ').trim() || fallback).slice(0, limit).join('');
    const title = clean(p.title, '模块目录', 20), query = clean(p.prompt, 'inte', 24), invoice = clean(p.result, '年度活动 · 发票预览', 28);
    const categories = [['全部分类',60],['平台',11],['网站',6],['销售',10],['财务',6],['库存与制造',7],['人力资源',7],['营销',6],['服务',7]];
    const all = [['Accounting','会计','财务'],['AI','AI 助手','平台'],['Analytics & Reports','分析报告','平台'],['Appointments','预约','服务'],['Appraisals','评估','人力资源'],['Approvals','审批','平台'],['Blog','博客','网站'],['Chat','聊天','平台'],['CRM','客户管理','销售'],['Customer Portal','客户门户','销售'],['Dashboards','仪表盘','平台'],['Data Model','数据模型','平台']];
    const finance = [['Accounting','会计'],['ESG','环境与治理'],['Expenses','费用'],['Invoicing','发票'],['Sign','签署'],['Spreadsheets','电子表格']];
    const searchable = [
      {name:'AI',cn:'AI 助手',description:'在工作区理解信息并协助完成任务。'},
      {name:'Analytics & Reports',cn:'分析报告',description:'同一份运营数据生成仪表盘、图表与报告。'},
      {name:'Data Model',cn:'数据模型',description:'记录、关系和视图一起描述业务。'},
      {name:'Integrations',cn:'集成',description:'连接已有服务，让信息保持同步。'},
      {name:'Invoicing',cn:'发票',description:'从已交付的工作建立账单并跟踪付款。'},
      {name:'Knowledge',cn:'知识库',description:'在同一工作区组织团队知识。'}
    ];
    const icon = (i, large = false) => `<span class="nc15-icon${large?' nc15-large':''}" style="--h:${155+i*31}"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="6" width="18" height="21" rx="4"/><path d="M11 12H21M11 17H21M11 22H17"/></svg></span>`;
    const card = (row,i,isFinance) => `<div class="nc15-card">${icon(i)}<div class="nc15-card-label"><strong>${e(row[1])}</strong><small>${e(isFinance?row[0]+' · 财务':row[0]+' · '+row[2])}</small></div>${row[0]==='AI'||row[0]==='Invoicing'?'':'<span class="nc15-soon">即将推出</span>'}</div>`;
    const searchRows = searchable.map((row,i)=>`<div class="nc15-search-row nc15-r${i}">${icon(i)}<div><strong>${e(row.name)} <span>${e(row.cn)}</span></strong><small>${e(row.description)}</small></div></div>`).join('');
    c.root.innerHTML = `<style>
      .nc15-scene{background:#d1dada;color:#ededed;font-family:ProjectSans,sans-serif}.nc15-scene *{box-sizing:border-box}
      .nc15-wallpaper{position:absolute;inset:0;background:radial-gradient(ellipse at 72% -20%,#dce2f5 0,transparent 65%),radial-gradient(ellipse at 12% 104%,#c6d8a5 0,transparent 62%),radial-gradient(ellipse at 87% 98%,#a5cdbb 0,transparent 55%),linear-gradient(145deg,#abcbd1,#d4dcc3 58%,#b5c8ba)}
      .nc15-window{position:absolute;left:110px;top:78px;width:1700px;height:890px;background:#0e0f0f;border:7px solid #d7dddd;border-radius:35px;box-shadow:0 28px 75px #253e3233;overflow:hidden}
      .nc15-app{position:absolute;inset:0;filter:blur(0px)}.nc15-header{height:84px;border-bottom:1px solid #232525;display:flex;align-items:center;padding:0 74px;gap:15px}
      .nc15-logo{display:grid;grid-template-columns:repeat(2,9px);gap:3px;transform:rotate(45deg);margin-right:6px}.nc15-logo i{width:9px;height:9px;background:#eee;border-radius:3px}
      .nc15-brand{font-size:27px;letter-spacing:-1px}.nc15-nav{margin-left:auto;display:flex;align-items:center;gap:36px;font-size:20px;color:#a5abab}.nc15-nav .nc15-login{border:1px solid #333;border-radius:15px;padding:8px 18px}
      .nc15-heading{position:absolute;left:100px;top:116px;right:100px;display:flex;align-items:center;justify-content:space-between}.nc15-heading h2{font-size:44px;font-weight:500;line-height:62px;margin:0;max-width:1020px;white-space:nowrap;overflow:hidden}
      .nc15-open{width:250px;height:48px;background:#242626;border-radius:24px;display:flex;align-items:center;gap:12px;padding:0 20px;color:#9ca3a3;font-size:20px}.nc15-open kbd{margin-left:auto;font:17px ProjectSans}
      .nc15-sidebar{position:absolute;left:100px;top:218px;width:286px;border-left:1px solid #292c2c;padding-left:25px}.nc15-cat{height:52px;display:flex;align-items:center;gap:12px;color:#8e9595;font-size:23px}.nc15-cat b{font-size:18px;font-weight:400;background:#1d2020;border-radius:5px;padding:1px 6px}.nc15-cat.nc15-c0{color:#e2e6e6}.nc15-active{position:absolute;left:-2px;top:12px;width:3px;height:28px;border-radius:4px;background:#e0e5e5}
      .nc15-content{position:absolute;left:454px;top:218px;width:1130px}.nc15-counter{font-size:20px;color:#8e9595;height:37px;line-height:30px}.nc15-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .nc15-card{height:84px;border:1px solid #222727;border-radius:20px;background:linear-gradient(125deg,#181b1b,#141717);display:flex;align-items:center;padding:12px 16px;gap:16px;min-width:0}.nc15-card-label{min-width:0}.nc15-card strong{font-size:24px;font-weight:450;display:block;line-height:31px}.nc15-card small{font-size:17px;color:#8b9494;white-space:nowrap;display:block;line-height:23px}.nc15-soon{font-size:16px;white-space:nowrap;color:#808a8a;padding:3px 8px;background:#242929;border-radius:8px;margin-left:auto}
      .nc15-icon{--h:180;display:flex;align-items:center;justify-content:center;width:48px;height:48px;flex:none;border-radius:15px;background:radial-gradient(circle at 80% 25%,#faf4de 0,transparent 60%),linear-gradient(140deg,hsl(var(--h) 44% 51%),hsl(calc(var(--h) + 55) 38% 81%));box-shadow:0 0 14px #afebdf12}.nc15-icon svg{width:35px;height:35px;fill:#f4fcfcbd;stroke:#476868;stroke-width:1.5;stroke-linecap:round}.nc15-large{width:40px;height:40px;border-radius:12px}.nc15-large svg{width:30px;height:30px}
      .nc15-finance{position:absolute;left:0;top:0;width:1130px;opacity:0;visibility:hidden}.nc15-hero{position:relative;width:1130px;height:280px;padding:24px 30px;border:1px solid #252929;border-radius:24px;background:linear-gradient(112deg,#171a1a,#121515);overflow:hidden}.nc15-hero-label{display:flex;align-items:center;gap:13px;font-size:23px}.nc15-copy{position:absolute;left:30px;top:98px;width:495px;font-size:26px;line-height:41px;color:#dadfdf}.nc15-copy small{display:block;color:#7e8989;font-size:20px;line-height:31px;margin-top:5px}.nc15-explore{display:inline-block;margin-top:12px;border-radius:12px;background:#242c2c;padding:3px 15px;font-size:18px;color:#ced6d6}
      .nc15-invoice{position:absolute;left:618px;top:32px;width:475px;height:320px;background:#202525;border:1px solid #303636;border-radius:23px;padding:25px;box-shadow:0 8px 35px #0007}.nc15-ticket-logo{display:flex;align-items:center;gap:10px;color:#9baaaa;font-size:16px}.nc15-ticket-logo b{color:#fff;font-size:27px}.nc15-invoice-title{font-size:26px;line-height:36px;margin-top:14px;white-space:nowrap;max-width:420px;overflow:hidden}.nc15-invoice-number{font-size:16px;color:#829393;line-height:24px}.nc15-ticket-grid{display:grid;grid-template-columns:1.1fr 1fr;gap:14px;margin-top:17px}.nc15-ticket-grid small{display:block;color:#798b8b;font-size:16px}.nc15-ticket-grid strong{font-weight:400;font-size:20px;line-height:29px}.nc15-hero:after{content:'';position:absolute;left:560px;right:0;bottom:0;height:48px;background:linear-gradient(transparent,#141717)}
      .nc15-finance .nc15-counter{margin-top:22px}.nc15-directory{opacity:1}.nc15-overlay{position:absolute;inset:0;background:#0005;opacity:0;visibility:hidden}
      .nc15-search-panel{position:absolute;left:522px;top:170px;width:1030px;height:572px;background:#171b1b;border:1px solid #333b3b;border-radius:22px;box-shadow:0 25px 80px #0008;opacity:0;visibility:hidden;overflow:hidden}.nc15-search-input{height:83px;display:flex;align-items:center;padding:0 28px;border-bottom:1px solid #2a3232;font-size:25px;gap:3px}.nc15-placeholder{color:#758080;position:absolute}.nc15-query{white-space:nowrap;overflow:hidden;max-width:920px;line-height:40px}.nc15-caret{width:2px;height:30px;background:#c3d5d3;flex:none}
      .nc15-results{position:relative;margin:12px;height:470px}.nc15-selection{position:absolute;left:0;right:0;top:0;height:73px;background:#3b4343;border-radius:13px}.nc15-search-row{position:absolute;left:0;width:100%;height:73px;padding:8px 16px;display:flex;align-items:center;gap:16px}.nc15-search-row strong{font-size:22px;font-weight:450;display:block;line-height:31px}.nc15-search-row strong span{font-size:18px;color:#c0cccc;margin-left:10px}.nc15-search-row small{font-size:18px;color:#869797;display:block;line-height:26px}.nc15-empty{position:absolute;left:24px;top:12px;font-size:23px;color:#8b9898;opacity:0}
      .nc15-cursor{position:absolute;left:0;top:0;width:38px;height:46px;z-index:7}.nc15-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:3px solid #d9eeee;border-radius:50%;opacity:0;z-index:6}.nc15-proof{position:absolute;left:0;right:0;top:1001px;text-align:center;font-size:19px;line-height:29px;color:#526d64;letter-spacing:1px}
    </style><div class="fx-scene nc15-scene"><div class="nc15-wallpaper"></div><section class="nc15-window" aria-label="模块目录界面示意"><div class="nc15-app"><header class="nc15-header"><span class="nc15-logo"><i></i><i></i><i></i><i></i></span><span class="nc15-brand">enobase</span><nav class="nc15-nav"><span>模块</span><span>行业</span><span>关于</span><span class="nc15-login">登录</span></nav></header><div class="nc15-heading"><h2>${e(title)}</h2><div class="nc15-open">⌕ <span>搜索</span><kbd>⌘ K</kbd></div></div><aside class="nc15-sidebar"><i class="nc15-active"></i>${categories.map((row,i)=>`<div class="nc15-cat nc15-c${i}"><span>${e(row[0])}</span><b>${row[1]}</b></div>`).join('')}</aside><main class="nc15-content"><div class="nc15-directory"><div class="nc15-counter">显示 60 / 60 · 目录数量示意</div><div class="nc15-grid">${all.map((row,i)=>card(row,i,false)).join('')}</div></div><div class="nc15-finance"><section class="nc15-hero"><div class="nc15-hero-label">${icon(4,true)} 发票 · Invoicing</div><div class="nc15-copy">从已交付的工作开始开票。<small>电子发票、付款与交付记录，在同一处查看。</small><span class="nc15-explore">查看模块</span></div><div class="nc15-invoice"><div class="nc15-ticket-logo"><b>✣</b> 示例发票</div><div class="nc15-invoice-title">${e(invoice)}</div><div class="nc15-invoice-number">INV-2026-0824</div><div class="nc15-ticket-grid"><div><small>客户</small><strong>示例工作室</strong></div><div><small>日期</small><strong>8月24日</strong></div><div><small>人数</small><strong>179</strong></div><div><small>场地</small><strong>示例活动空间</strong></div></div></div></section><div class="nc15-counter">显示 6 / 60 · 财务分类</div><div class="nc15-grid">${finance.map((row,i)=>card(row,i,true)).join('')}</div></div></main></div><div class="nc15-overlay"></div><section class="nc15-search-panel" aria-label="本地示例搜索"><div class="nc15-search-input"><span class="nc15-placeholder">搜索</span><span class="nc15-query"></span><i class="nc15-caret"></i></div><div class="nc15-results"><div class="nc15-selection"></div>${searchRows}<div class="nc15-empty">没有匹配的本地示例</div></div></section></section><div class="nc15-cursor">${c.cursor()}</div><div class="nc15-ring"></div><div class="nc15-proof">界面动效示意 · 本地示例数据 · 搜索末态未提交</div></div>`;
    const tl = c.gsap.timeline({paused:true}), ptr = c.q('.nc15-cursor'), ring = c.q('.nc15-ring');
    tl.set(c.q('.nc15-window'), {y:24,scale:.98,opacity:0},0).to(c.q('.nc15-window'), {y:0,scale:1,opacity:1,duration:.8,ease:'power3.out'},0);
    tl.set(ptr,{x:1140,y:818},0).to(ptr,{x:252,y:533,duration:1.1,ease:'power2.inOut'},2.6);
    c.click(tl,ptr,ring,252,533,4);
    tl.to(c.q('.nc15-active'),{y:208,duration:.38,ease:'power2.inOut'},4.1);
    tl.to(c.q('.nc15-c0'),{color:'#8e9595',duration:.2},4.1).to(c.q('.nc15-c4'),{color:'#e2e6e6',duration:.2},4.1);
    tl.to(c.q('.nc15-directory'),{autoAlpha:0,y:12,duration:.25},4.1).set(c.q('.nc15-finance'),{y:24,autoAlpha:0},0).to(c.q('.nc15-finance'),{autoAlpha:1,y:0,duration:.65,ease:'power3.out'},4.2);
    tl.set(c.q('.nc15-invoice'),{y:45,opacity:0},0).to(c.q('.nc15-invoice'),{y:0,opacity:1,duration:1.0,ease:'power2.out'},4.5);
    tl.to(ptr,{x:1465,y:235,duration:1.2,ease:'power2.inOut'},9.4);c.click(tl,ptr,ring,1465,235,11);
    tl.to(c.q('.nc15-app'),{filter:'blur(6px)',duration:.45},11.1).to(c.q('.nc15-overlay'),{autoAlpha:1,duration:.4},11.1);
    tl.set(c.q('.nc15-search-panel'),{y:-12,autoAlpha:0,height:572},0).to(c.q('.nc15-search-panel'),{y:0,autoAlpha:1,duration:.4,ease:'power2.out'},11.1);
    tl.to(ptr,{x:1570,y:286,duration:.4,ease:'power2.out'},11.15);
    tl.set(c.q('.nc15-query'),{textContent:''},0).set(c.q('.nc15-placeholder'),{opacity:1},0).set(c.q('.nc15-caret'),{opacity:0},0).set(c.q('.nc15-empty'),{opacity:0},0);
    const rowEls=searchable.map((_,i)=>c.q('.nc15-r'+i));rowEls.forEach((el,i)=>tl.set(el,{y:i*73,autoAlpha:1},0));
    tl.set(c.q('.nc15-caret'),{opacity:1},13.7).set(c.q('.nc15-placeholder'),{opacity:0},13.7);
    const chars=Array.from(query);chars.forEach((_,j)=>{
      const prefix=chars.slice(0,j+1).join(''), at=14+j*2.2/Math.max(1,chars.length-1);
      const matches=searchable.map((r,i)=>({r,i})).filter(({r})=>(r.name+' '+r.cn).toLowerCase().includes(prefix.toLowerCase()));
      tl.set(c.q('.nc15-query'),{textContent:prefix},at);
      rowEls.forEach((el,i)=>{const n=matches.findIndex(m=>m.i===i);tl.to(el,{y:n<0?i*73:n*73,autoAlpha:n<0?0:1,duration:.26,ease:'power2.inOut'},at);});
      tl.to(c.q('.nc15-search-panel'),{height:109+Math.max(1,matches.length)*73,duration:.32,ease:'power2.inOut'},at);
      tl.to(c.q('.nc15-selection'),{opacity:matches.length?1:0,duration:.2},at).to(c.q('.nc15-empty'),{opacity:matches.length?0:1,duration:.2},at);
    });
    for(let at=13.7;at<duration;at+=.9)tl.set(c.q('.nc15-caret'),{opacity:.2},at+.45).set(c.q('.nc15-caret'),{opacity:1},at+.85);
    tl.to({}, {duration:.001},duration-.001);
    return {timeline:tl,duration};
  });
})();
