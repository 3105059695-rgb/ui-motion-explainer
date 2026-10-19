/* Collect UI / Timothy M.: request, thinking, build steps, configuration gate. */
(function(){
  'use strict';
  UIFX.register({
    id:'ai-workflow-configuration-gate',title:'工作流构建 · 思考步骤与配置门槛',category:'ai',duration:18,
    source:'https://x.com/timothymaarv/status/2004473140513329536',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2004473075459407872/vid/avc1/1584x1080/lfteoW3UV5StQ1-Q-optimized.mp4',
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'同一白色聊天窗口完成发送、思考、五步构建、设置说明与账户连接折叠面板；尾态保留待配置门槛。',
    adaptationNotes:'依据 Timothy 原片 14 个暂停点重建，24.12 秒压缩至 18 秒；横屏扩大布局并改写中文文案、绘制独立图标与渐变背景。原片尾态仍有 14 项未配置，不显示已连接或已启用，也不执行真实工作流。',
    tags:['Collect UI','AI Flow','Chat Layout','Thinking','进度反馈','工作流','账户连接'],
    params:{title:'Xami AI',prompt:'监控所有社交媒体消息，按情绪分类，把紧急消息转交管理人员，并将处理记录保存到表格。',result:'工作流已构建，等待配置'}
  },function(c,p){
    const e=c.esc,brand=String(p.title||'Xami AI'),prompt=String(p.prompt||'监控所有社交媒体消息，按情绪分类，把紧急消息转交管理人员，并将处理记录保存到表格。'),result=String(p.result||'工作流已构建，等待配置');
    if(Array.from(brand).length>24)throw Error('Workflow brand must be 24 characters or fewer.');
    if(Array.from(prompt).length>64)throw Error('Workflow request must be 64 characters or fewer.');
    if(Array.from(result).length>32)throw Error('Workflow result must be 32 characters or fewer.');
    const diamond='<svg viewBox="0 0 32 32"><path d="M16 1l8 11-8 11-8-11zM5 18l5 6-5 7-5-7zM26 19l6 7-6 6-6-6z" fill="currentColor"/></svg>';
    const spinner='<svg class="tw-spinner" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 1-9.5 6.9" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-dasharray="3 4"/></svg>';
    const tick='<svg viewBox="0 0 24 24"><path d="M5 12l4.3 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const arrow='<svg viewBox="0 0 24 24"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const steps=['搜索节点','获取节点详情','添加节点','更新节点参数','验证工作流'];
    const accounts=[['X','#222','Twitter / X API 凭据'],['S','#43b6a7','Slack 工作区凭据'],['f','#398cea','Facebook Graph API 凭据'],['A','#458de5','Azure OpenAI 凭据'],['M','#df6f89','Gmail 凭据'],['▤','#55b879','Google Sheets 凭据']];
    const settings=[['管理通知邮箱','工作流配置'],['记录表格 ID','工作流配置'],['用户名称','Twitter 消息节点'],['消息文本','Twitter 消息节点'],['频道 ID 或名称','Slack 消息节点'],['搜索关键词','Slack 消息节点'],['消息 API 端点','Facebook 消息节点'],['模型部署名称','Azure OpenAI 模型']];
    c.root.innerHTML=`<style>
    .tw-scene{background:#3432a9;color:#33343a;font-family:ProjectSans,sans-serif}.tw-scene *{box-sizing:border-box}.tw-scene svg{display:block}
    .tw-backdrop{position:absolute;inset:-140px;background:radial-gradient(ellipse at 30% 18%,#0099dd 0%,transparent 47%),radial-gradient(ellipse at 65% 2%,#badd8e 0%,transparent 37%),radial-gradient(ellipse at 86% 95%,#18b2b9 0%,transparent 41%),radial-gradient(ellipse at 12% 89%,#330476 0%,transparent 54%),#3432b6;filter:blur(28px);transform-origin:50% 50%}
    .tw-window{position:absolute;left:72px;top:58px;width:1776px;height:964px;border-radius:22px;background:#fff;overflow:hidden;box-shadow:0 22px 70px #130d5322}.tw-nav{position:absolute;left:190px;right:190px;top:25px;display:flex;align-items:center;gap:16px;height:44px;font-size:22px}.tw-logo{width:30px;height:34px;color:#9072da}.tw-brand{color:#69509f;max-width:720px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}.tw-beta{font-size:16px;color:#8aa5a8;background:#f5faf9;padding:4px 10px;border-radius:6px}.tw-refresh{margin-left:auto;color:#b9bcc1;width:24px;height:24px}.tw-refresh svg{width:24px;height:24px}
    .tw-thread-clip{position:absolute;left:478px;top:118px;width:760px;height:632px;overflow:hidden;-webkit-mask-image:linear-gradient(#000 94%,transparent)}.tw-thread{position:absolute;inset:0;height:1980px}.tw-message{position:absolute;left:0;width:760px;border:1px solid #ebebee;border-radius:16px;overflow:hidden;font-size:22px;line-height:32px}.tw-message-head{height:42px;padding:6px 18px;background:#f8f8f9;display:flex;align-items:center;gap:8px;font-size:20px;line-height:30px}.tw-dot{width:17px;height:17px;border-radius:50%;background:radial-gradient(circle at 35% 25%,#4b95de,#00071d 75%)}.tw-mini-logo{width:16px;height:18px;color:#9277db}.tw-message-body{padding:14px 18px;overflow-wrap:anywhere}.tw-user{top:0;height:146px}.tw-answer{top:166px;height:94px}.tw-answer .tw-message-body{padding:10px 18px;white-space:nowrap}.tw-agent-head{position:absolute;left:10px;top:282px;display:flex;align-items:center;gap:8px;font-size:20px}
    .tw-thinking{position:absolute;left:0;top:322px;width:760px;height:216px;background:#f7f7f8;border-radius:13px;overflow:hidden}.tw-status-title{display:flex;align-items:center;gap:9px;padding:13px 16px;height:48px;color:#7657b6;font-size:21px}.tw-spinner{width:20px;height:20px;flex:none}.tw-thoughts{padding:0 32px 12px;font-size:19px;line-height:30px;color:#97999e}.tw-thought{height:30px;overflow:hidden;white-space:nowrap}.tw-work{position:absolute;left:0;top:322px;width:760px;height:390px}.tw-working-head{height:48px;background:#f7f7f8;border-radius:12px}.tw-step-list{padding:14px 18px}.tw-step{position:relative;height:41px;padding-left:26px;font-size:20px;line-height:32px;color:#c4c7ca;overflow:visible}.tw-step:nth-child(3){height:178px}.tw-step-dot{position:absolute;left:0;top:8px;width:16px;height:16px;border:2px solid #e3e5e8;border-radius:50%;background:white}.tw-step .tw-complete{position:absolute;left:0;top:8px;width:16px;height:16px;background:#78cd94;color:white;border-radius:50%}.tw-complete svg{width:16px;height:16px}.tw-step .tw-active{position:absolute;left:-1px;top:6px;color:#a790d1;width:20px;height:20px}.tw-node-details{margin-top:6px;margin-right:2px;height:128px;border:1px solid #ececef;border-radius:13px;padding:10px 22px;color:#92959a;font-size:18px;line-height:26px}.tw-node-details span{display:block}.tw-ready{position:absolute;top:322px;left:0;width:760px;height:48px;padding:12px 17px;background:#f7f7f8;border-radius:12px;display:flex;align-items:center;gap:9px;font-size:20px;color:#55595f}.tw-ready-tick{background:#7dcf97;color:white;border-radius:50%;width:18px;height:18px}.tw-ready-tick svg{width:18px;height:18px}.tw-ready-label{max-width:660px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tw-chev{margin-left:auto;color:#c4c5c9;font-size:20px}
    .tw-setup{position:absolute;left:0;top:402px;width:760px;height:374px;color:#8e9196;font-size:20px;line-height:31px}.tw-setup strong{color:#555960;font-weight:500;display:block;margin:20px 0 8px}.tw-setup .tw-setup-heading{margin:0 0 16px;color:#40444a}.tw-setup code{font:inherit;background:#f5f5f6;padding:2px 5px;border-radius:3px}.tw-final-note{margin-top:18px;color:#8d9197}.tw-warning{position:absolute;left:0;top:804px;width:760px;height:81px;border:1px solid #f4d8df;background:#fff0f3;color:#d56b82;border-radius:13px;padding:12px 18px;font-size:20px;line-height:29px}.tw-warning strong{font-weight:500}.tw-warning small{display:block;padding-left:26px;font-size:19px}.tw-alert-dot{display:inline-grid;place-items:center;width:18px;height:18px;margin-right:8px;background:#ec6687;color:white;border-radius:50%;font-size:14px}
    .tw-accounts{position:absolute;left:0;top:916px;width:760px;height:418px;border:1px solid #ededf0;border-radius:14px;overflow:hidden;background:#fff}.tw-panel-head{height:54px;display:flex;align-items:center;gap:10px;background:#f8f8f9;padding:0 18px;font-size:20px;font-weight:500}.tw-panel-head .tw-chevron{color:#b7babf;font-size:18px;display:block}.tw-panel-count{margin-left:auto;font-size:20px;font-weight:400;color:#697079}.tw-panel-body{position:absolute;left:0;right:0;top:54px}.tw-account-row{height:60px;padding:0 18px;display:flex;align-items:center;gap:10px;border-top:1px solid #f1f1f3;font-size:20px}.tw-service{width:23px;font-size:22px;font-weight:600;text-align:center}.tw-row-label{max-width:608px;line-height:28px}.tw-action{margin-left:auto;background:linear-gradient(#5498f3,#2462d6);color:#fff;padding:3px 10px;border:1px solid #4989e2;border-radius:5px;font-size:18px;line-height:25px;white-space:nowrap}.tw-config{position:absolute;left:0;top:1360px;width:760px;height:54px;overflow:hidden;background:#fff;border:1px solid #ededf0;border-radius:14px}.tw-setting-row{height:64px;padding:0 18px;display:flex;align-items:center;gap:10px;border-top:1px solid #f1f1f3;font-size:20px}.tw-setting-index{color:#967acc;font-size:19px;width:23px;text-align:center;flex:none}.tw-setting-label{max-width:598px;line-height:28px}.tw-setting-label span{color:#979da5;margin-left:8px;font-size:18px}
    .tw-composer{position:absolute;left:478px;top:740px;width:760px;height:192px;border:1px solid #eeeeF1;border-radius:15px;background:#fff;overflow:hidden;color:#b5b8bc}.tw-compose-copy{position:absolute;left:18px;right:20px;top:15px;font-size:22px;line-height:31px;overflow-wrap:anywhere;color:#383d43;max-height:94px;overflow:hidden}.tw-placeholder{position:absolute;top:16px;left:18px;color:#c1c4c8;font-size:21px;white-space:nowrap}.tw-compose-tools{position:absolute;left:18px;right:18px;bottom:47px;display:flex;align-items:center;gap:25px;height:38px;font-size:24px;color:#c4c8cd}.tw-auto{font-size:19px;margin-left:auto}.tw-send{width:37px;height:37px;background:linear-gradient(#69a4ff,#2566df);border:1px solid #81aefd;color:#fff;border-radius:9px;display:grid;place-items:center;margin-left:4px}.tw-send svg{width:25px;height:25px}.tw-stop{width:12px;height:12px;background:white;border-radius:3px}.tw-credits{position:absolute;bottom:0;height:37px;left:0;right:0;background:#f8f9fa;display:flex;align-items:center;padding:0 18px;font-size:18px;color:#a1a6ad}.tw-more{margin-left:auto;color:#5991ca;font-size:17px}.tw-proof{position:absolute;bottom:16px;left:80px;right:80px;text-align:center;font-size:17px;color:#cbc8e9}
    </style><div class="fx-scene tw-scene"><div class="tw-backdrop"></div><div class="tw-window">
    <div class="tw-nav"><div class="tw-logo">${diamond}</div><span class="tw-brand">${e(brand)}</span><span class="tw-beta">Beta v0.1</span><div class="tw-refresh"><svg viewBox="0 0 24 24"><path d="M18 7a8 8 0 1 0 2 7M18 3v5h-5" stroke="currentColor" fill="none" stroke-width="2" stroke-linecap="round"/></svg></div></div>
    <div class="tw-thread-clip"><div class="tw-thread"><div class="tw-message tw-user"><div class="tw-message-head"><i class="tw-dot"></i>你</div><div class="tw-message-body">${e(prompt)}</div></div><div class="tw-message tw-answer"><div class="tw-message-head"><span class="tw-mini-logo">${diamond}</span>${e(brand)}</div><div class="tw-message-body tw-answer-text"></div></div><div class="tw-agent-head"><span class="tw-mini-logo">${diamond}</span>${e(brand)}</div>
    <div class="tw-thinking"><div class="tw-status-title">${spinner}<span>正在思考…</span></div><div class="tw-thoughts">${['理解需求：监控消息，并按照情绪进行分流。','✓ 需要 Twitter、Slack 和 Facebook 触发器','✓ 情绪分类由 Azure OpenAI 处理','✓ 紧急消息通过邮件通知管理人员','✓ 将日志保存到 Google Sheets，开始构建…'].map((s,i)=>`<div class="tw-thought tw-thought-${i}"></div>`).join('')}</div></div>
    <div class="tw-work"><div class="tw-status-title tw-working-head">${spinner}<span>正在构建…</span></div><div class="tw-step-list">${steps.map((s,i)=>`<div class="tw-step tw-step-${i}"><i class="tw-step-dot"></i><span class="tw-complete">${tick}</span><span class="tw-active">${spinner}</span><span class="tw-step-label">${s}</span>${i===2?'<div class="tw-node-details"><span>✓ 工作流配置</span><span>✓ Slack 消息节点</span><span>✓ Facebook 消息节点</span><span>✓ Azure OpenAI 模型</span></div>':''}</div>`).join('')}</div></div>
    <div class="tw-ready"><span class="tw-ready-tick">${tick}</span><span class="tw-ready-label">${e(result)}</span><span class="tw-chev">⌄</span></div>
    <div class="tw-setup"><strong class="tw-setup-heading">如何设置</strong><strong>工作流配置节点</strong><div>添加 <code>managementEmail</code>：接收紧急通知的邮箱。</div><div>添加 <code>sheetId</code>：用于保存消息记录的表格 ID。</div><strong>Slack 消息节点</strong><div>设置需要监控的频道 ID 或名称。</div><strong>Facebook 消息节点</strong><div>设置获取消息的 Graph API 端点。</div><div class="tw-final-note">如果你想调整流程，可以继续补充需求。</div></div>
    <div class="tw-warning"><strong><span class="tw-alert-dot">!</span>14 项内容需要配置</strong><small>连接账户并设置参数后，才可以启用。</small></div>
    <div class="tw-accounts"><div class="tw-panel-head"><span class="tw-chevron tw-account-chevron">⌃</span>连接账户<span class="tw-panel-count">0/6</span></div><div class="tw-panel-body tw-account-body">${accounts.map(a=>`<div class="tw-account-row"><span class="tw-service" style="color:${a[1]}">${a[0]}</span><span class="tw-row-label">${a[2]}</span><span class="tw-action">连接</span></div>`).join('')}</div></div>
    <div class="tw-config"><div class="tw-panel-head"><span class="tw-chevron tw-config-chevron">⌄</span>配置工作流<span class="tw-panel-count">0/8</span></div><div class="tw-panel-body tw-config-body">${settings.map((s,i)=>`<div class="tw-setting-row"><span class="tw-setting-index">${i+1}</span><span class="tw-setting-label">${s[0]}<span>${s[1]}</span></span><span class="tw-action">设置</span></div>`).join('')}</div></div>
    </div></div><div class="tw-composer"><div class="tw-compose-copy">${e(prompt)}</div><div class="tw-placeholder">你想自动化什么？</div><div class="tw-compose-tools"><span>＋</span><span>≡</span><span class="tw-auto">Auto ⌄</span><span class="tw-send"><span class="tw-send-arrow">${arrow}</span><i class="tw-stop"></i></span></div><div class="tw-credits"><span>3/16 次月度额度剩余</span><span class="tw-more">获取更多额度</span></div></div>
    </div><div class="tw-proof">界面动效重建 · 账户与参数保持未配置 · 未连接真实服务</div><div class="fx-click-ring"></div>${c.cursor()}</div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true}),ptr=q('.fx-cursor'),ring=q('.fx-click-ring');
    tl.set(q('.tw-backdrop'),{x:0,y:0,scale:1},0).set(q('.tw-window'),{opacity:1,scale:1},0)
      .set(q('.tw-thread'),{y:0},0).set(qa('.tw-user,.tw-answer,.tw-agent-head,.tw-thinking,.tw-work,.tw-ready,.tw-setup,.tw-warning,.tw-accounts,.tw-config'),{opacity:0},0)
      .set(q('.tw-thinking'),{height:216},0).set(q('.tw-work'),{height:390},0)
      .set(qa('.tw-step'),{opacity:0,color:'#c4c7ca'},0).set(qa('.tw-complete,.tw-active,.tw-node-details'),{opacity:0},0)
      .set(q('.tw-step-2'),{height:41},0).set(q('.tw-composer'),{top:706,height:226},0)
      .set(q('.tw-compose-copy'),{opacity:1},0).set(q('.tw-placeholder'),{opacity:0,textContent:'你想自动化什么？'},0)
      .set(q('.tw-send-arrow'),{display:'block'},0).set(q('.tw-stop'),{display:'none'},0)
      .set(q('.tw-send'),{opacity:1},0).set(q('.tw-accounts'),{height:418},0).set(q('.tw-account-body'),{opacity:1},0)
      .set(q('.tw-config'),{y:0,height:54},0).set(q('.tw-config-body'),{opacity:0},0)
      .set(q('.tw-account-chevron'),{textContent:'⌃'},0).set(q('.tw-config-chevron'),{textContent:'⌄'},0)
      .set(qa('.tw-spinner'),{rotation:0},0).set(ptr,{x:1080,y:794,opacity:1,scale:1},0).set(ring,{x:0,y:0,opacity:0,scale:.3},0);
    tl.to(q('.tw-backdrop'),{x:-35,y:24,scale:1.075,duration:18,ease:'sine.inOut'},0)
      .to(ptr,{x:1275,y:925,duration:.6,ease:'power2.inOut'},.45);
    c.click(tl,ptr,ring,1275,925,1.15);
    tl.to(q('.tw-compose-copy'),{opacity:0,duration:.2},1.25).to(q('.tw-placeholder'),{opacity:1,duration:.2},1.3)
      .to(q('.tw-composer'),{top:790,height:142,duration:.45,ease:'power2.inOut'},1.28)
      .to(q('.tw-user'),{opacity:1,duration:.3},1.3).to(q('.tw-answer'),{opacity:1,duration:.3},1.65)
      .to(ptr,{x:1440,y:848,duration:.55,ease:'power2.inOut'},1.4).to(ptr,{opacity:0,duration:.3},2.15);
    c.text(tl,q('.tw-answer-text'),'我来为你搭建这套工作流。',1.85,.75);
    tl.to(q('.tw-agent-head'),{opacity:1,duration:.3},2.65).to(q('.tw-thinking'),{opacity:1,duration:.3},2.85)
      .set(q('.tw-send-arrow'),{display:'none'},2.85).set(q('.tw-stop'),{display:'block'},2.85).set(q('.tw-send'),{opacity:.33},2.85)
      .to(qa('.tw-spinner'),{rotation:900,duration:8.4,ease:'none'},2.85);
    ['理解需求：监控消息，并按照情绪进行分流。','✓ 需要 Twitter、Slack 和 Facebook 触发器','✓ 情绪分类由 Azure OpenAI 处理','✓ 紧急消息通过邮件通知管理人员','✓ 将日志保存到 Google Sheets，开始构建…'].forEach((s,i)=>c.text(tl,q('.tw-thought-'+i),s,3.05+i*.44,.45));
    tl.to(q('.tw-thinking'),{height:48,opacity:0,duration:.42,ease:'power2.inOut'},5.7)
      .to(q('.tw-work'),{opacity:1,duration:.3},6.08);
    const starts=[6.5,7.15,7.8,9.75,10.4],done=[7.15,7.8,9.75,10.4,11.15];
    steps.forEach((s,i)=>{
      tl.to(q('.tw-step-'+i),{opacity:1,duration:.2},6.35+i*.09)
        .set(q('.tw-step-'+i),{color:'#555a63'},starts[i])
        .set(q('.tw-step-'+i+' .tw-active'),{opacity:1},starts[i])
        .set(q('.tw-step-'+i+' .tw-active'),{opacity:0},done[i])
        .set(q('.tw-step-'+i+' .tw-complete'),{opacity:1},done[i]);
    });
    tl.to(q('.tw-step-2'),{height:178,duration:.45,ease:'power2.inOut'},8.2)
      .to(q('.tw-node-details'),{opacity:1,duration:.35},8.42)
      .to(q('.tw-thread'),{y:-90,duration:.65,ease:'power2.inOut'},8.3)
      .to(q('.tw-work'),{opacity:0,height:48,duration:.35},11.4)
      .to(q('.tw-ready'),{opacity:1,duration:.35},11.5).to(q('.tw-setup'),{opacity:1,duration:.4},11.65)
      .to(q('.tw-thread'),{y:0,duration:.45,ease:'power2.inOut'},11.45)
      .to(qa('.tw-warning,.tw-accounts,.tw-config'),{opacity:1,duration:.3},12.1)
      .set(q('.tw-placeholder'),{textContent:'你想添加或修改什么？'},11.5)
      .to(q('.tw-thread'),{y:-800,duration:.9,ease:'power2.inOut'},12.4);
    // The original reveals configuration but keeps every account and parameter pending.
    tl.to(q('.tw-accounts'),{height:54,duration:.45,ease:'power2.inOut'},14.35)
      .to(q('.tw-account-body'),{opacity:0,duration:.2},14.35)
      .set(q('.tw-account-chevron'),{textContent:'⌄'},14.5)
      .to(q('.tw-config'),{y:-364,height:566,duration:.5,ease:'power2.inOut'},14.35)
      .to(q('.tw-config-body'),{opacity:1,duration:.35},14.55).set(q('.tw-config-chevron'),{textContent:'⌃'},14.55)
      .to(q('.tw-thread'),{y:-955,duration:.8,ease:'power2.inOut'},14.42)
      .to(q('.tw-config-body'),{opacity:0,duration:.22},16.15)
      .to(q('.tw-config'),{y:0,height:54,duration:.55,ease:'power2.inOut'},16.15)
      .set(q('.tw-config-chevron'),{textContent:'⌄'},16.32)
      .to(q('.tw-accounts'),{height:418,duration:.55,ease:'power2.inOut'},16.15)
      .to(q('.tw-account-body'),{opacity:1,duration:.35},16.32).set(q('.tw-account-chevron'),{textContent:'⌃'},16.32)
      .to(q('.tw-thread'),{y:-800,duration:.75,ease:'power2.inOut'},16.15)
      .to({}, {duration:.01},17.99);
    return{timeline:tl,duration:18};
  });
})();
