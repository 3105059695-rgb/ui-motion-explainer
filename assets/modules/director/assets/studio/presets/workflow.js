/* Static-reference UI reconstructions. The animated demonstrations are original.
   All provider icons below are simplified local SVG, not downloaded artwork. */
(function () {
  'use strict';

  const icons = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    history: '<path d="M4 8a8 8 0 1 1-1 7M4 3v5h5M12 7v6l4 2"/>',
    replace: '<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>',
    pencil: '<path d="m5 15 10-10 4 4L9 19l-5 1zM13 7l4 4"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M20 12H4m6-6-6 6 6 6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    expand: '<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',
    gear: '<path d="m9 3-1 3-3 1-2 4 2 2v4l4 2 3-1 3 1 4-2v-4l2-2-2-4-3-1-1-3z"/><circle cx="12" cy="11" r="3"/>',
    send: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
    lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    hand: '<path d="M8 13V6a2 2 0 0 1 4 0v5-7a2 2 0 0 1 4 0v8-5a2 2 0 0 1 4 0v9l-3 5H9l-6-7a2 2 0 0 1 3-2l2 2"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    cursor: '<path d="m5 3 14 12-7 1-3 7z"/>'
  };
  const icon = (name, size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.grid}</svg>`;

  function appMark(name, size = 29) {
    let shapes;
    if (name === 'Slack') shapes = '<rect x="7" y="2" width="5" height="12" rx="2.5" fill="#39BED1"/><rect x="2" y="7" width="5" height="5" rx="2" fill="#39BED1"/><rect x="14" y="7" width="12" height="5" rx="2.5" fill="#32B889"/><rect x="16" y="2" width="5" height="5" rx="2" fill="#32B889"/><rect x="16" y="14" width="5" height="12" rx="2.5" fill="#EFB642"/><rect x="21" y="16" width="5" height="5" rx="2" fill="#EFB642"/><rect x="2" y="16" width="12" height="5" rx="2.5" fill="#D95E87"/><rect x="7" y="21" width="5" height="5" rx="2" fill="#D95E87"/>';
    else if (name === 'ChatGPT') shapes = '<g fill="none" stroke="#4E5752" stroke-width="1.7"><path d="M14 3c5-3 10 1 9 6 5 2 5 8 1 11-1 5-7 7-11 4-5 2-10-1-9-6-5-3-4-9 0-11 1-5 6-7 10-4z"/><path d="m14 3 7 5v10l-8 5-8-5V9l9-6Zm7 5-8 5v10M5 9l8 4m-9 5 9-5 11 7"/></g>';
    else if (name === 'Airtable') shapes = '<path d="m14 2 13 6-13 6L1 8z" fill="#F7C64D"/><path d="m15 15 12-6v14l-12 4z" fill="#54BFC4"/><path d="M1 10v13l12 4V15z" fill="#DC668F"/>';
    else if (name === 'ActiveCampaign') shapes = '<g fill="none" stroke="#4488C7" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 4 16 10L5 24M5 11l9 5-9 5"/></g>';
    else if (name === 'Asana') shapes = '<g fill="#EA7180"><circle cx="14" cy="7" r="5"/><circle cx="7" cy="20" r="5"/><circle cx="21" cy="20" r="5"/></g>';
    else if (name === 'Bitbucket') shapes = '<path d="M3 5h22l-3 19H6z" fill="#408ED7"/><path d="M10 11h9l-1 7h-7z" fill="#F4F8FC"/>';
    else if (name === 'Box') shapes = '<text x="2" y="22" font-family="Arial,sans-serif" font-size="25" font-weight="600" fill="#3687C2">b</text>';
    else if (name === 'Calendly') shapes = '<circle cx="14" cy="14" r="11" fill="none" stroke="#477ED9" stroke-width="2.3"/><path d="M19 9a7 7 0 1 0 0 10" fill="none" stroke="#477ED9" stroke-width="2.3"/>';
    else shapes = '<path d="m5 9 9-6 9 6" fill="none" stroke="#A384DE" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 17a9 9 0 0 0 18 0" fill="none" stroke="#DA7EB1" stroke-width="4" stroke-linecap="round"/>';
    return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true">${shapes}</svg>`;
  }

  function verticalGrid(width = 1920, height = 1080) {
    let lines = '';
    for (let x = 40; x < width; x += 52) lines += `<path d="M${x} 0V${height}"/>`;
    return `<svg class="wf-grid" viewBox="0 0 ${width} ${height}" aria-hidden="true"><g stroke="#E9EBE9" stroke-width="1" stroke-dasharray="2 8">${lines}</g></svg>`;
  }

  function buildScene(ctx, scope, html, css) {
    ctx.root.innerHTML = `<style>
      .${scope}{font-family:ProjectSans,sans-serif;background:#F8F9F7;color:#363B39}
      .${scope} *{box-sizing:border-box}.${scope} svg{flex-shrink:0}
      .${scope} .wf-grid{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
      .${scope} .wf-cursor{position:absolute;left:0;top:0;width:38px;height:46px;z-index:80;transform-origin:5px 5px;pointer-events:none}
      .${scope} .wf-click-ring{position:absolute;left:0;top:0;width:52px;height:52px;border:2px solid #B7C1BA;border-radius:50%;z-index:79;pointer-events:none}
      .${scope} .wf-proof{position:absolute;right:65px;bottom:30px;font-size:17px;color:#909A92;z-index:90}
      .${scope} .wf-phase{position:absolute;left:90px;bottom:30px;font-size:18px;color:#89948C;z-index:90}
      ${css.replaceAll('$', `.${scope}`)}
    </style><div class="fx-scene ${scope}">${html}<div class="wf-click-ring"></div><div class="wf-cursor">${ctx.cursor()}</div><div class="wf-phase"></div><div class="wf-proof">静态参考重建 · 简化图标 · 交互节奏为原创演示</div></div>`;
    const q = selector => ctx.root.querySelector(selector), qa = selector => Array.from(ctx.root.querySelectorAll(selector));
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.set(q('.wf-cursor'), { x: 1375, y: 843, opacity: 0, scale: 1 }, 0)
      .set(q('.wf-click-ring'), { x: 0, y: 0, opacity: 0, scale: 1 }, 0);
    return { ctx, q, qa, tl };
  }
  function move(s, x, y, time, duration = .55) { s.tl.to(s.q('.wf-cursor'), { x, y, opacity: 1, duration, ease: 'power2.inOut' }, time); }
  function click(s, x, y, time) { s.ctx.click(s.tl, s.q('.wf-cursor'), s.q('.wf-click-ring'), x, y, time); }
  function end(s, duration) { s.tl.to({ value: 0 }, { value: 1, duration: .01 }, duration - .01); return { timeline: s.tl, duration }; }

  const summaryText = 'Creates a short, Slack-friendly summary that includes the task name, current status, and a direct link.';
  const newRecordText = 'Creates an Airtable record with the task name, current status, a short summary, and a direct link.';
  UIFX.register({
    id: 'interaction-workflow-replace', title: 'Replace Workflow Nodes', category: 'interaction', duration: 11,
    description: '参考 Kevin 的静态界面重建，交互节奏为原创演示：打开 Replace 浮层并保留原图菜单状态，再搜索 Airtable，原位替换节点 provider 与说明。',
    tags: ['Workflow', 'Replace', 'App picker', '静态界面参考'],
    source: 'https://x.com/kvnkld/status/2005663739803206121', sourceStatus: 'observed-reconstruction', sourceObservation: 'static-image',
    params: { title: 'ChatGPT Summary', prompt: summaryText, result: newRecordText }
  }, (ctx, params) => {
    const p = Object.assign({ title: 'ChatGPT Summary', prompt: summaryText, result: newRecordText }, params || {});
    const apps = ['ActiveCampaign', 'Airtable', 'Asana', 'Bitbucket', 'Box', 'Calendly', 'ClickUp'];
    const allApps = apps.map((name, index) => `<div class="wf-app-row wf-all-app wf-app-${index}" style="top:${361 + index * 49}px">${appMark(name, 28)}<span>${name}</span><span class="wf-row-check">${icon('check', 19)}</span></div>`).join('');
    const s = buildScene(ctx, 'wf-replace-scene', `${verticalGrid()}
      <svg class="wf-connections" viewBox="0 0 1920 1080" aria-hidden="true"><path d="M215 -15V471Q215 522 266 522H405" fill="none" stroke="#DFE4DF" stroke-width="3"/><circle cx="215" cy="8" r="8" fill="#F8F9F7" stroke="#D8DFD9" stroke-width="2"/><circle cx="405" cy="522" r="8" fill="#FCFDFC" stroke="#CBD5CE" stroke-width="2"/></svg>
      <div class="wf-summary-node"><div class="wf-action-tag">Action</div><div class="wf-node-title">${ctx.esc(String(p.title))}</div><div class="wf-node-copy">${ctx.esc(String(p.prompt))}</div><div class="wf-provider-badge"><span class="wf-provider-symbol"><span class="wf-provider-original">${appMark('ChatGPT', 25)}</span><span class="wf-provider-new">${appMark('Airtable', 25)}</span></span><span class="wf-provider-name">ChatGPT</span></div><span class="wf-right-port"></span></div>
      <div class="wf-node-tools"><div class="wf-tool">${icon('plus', 23)}</div><div class="wf-tool">${icon('history', 22)}</div><div class="wf-tool wf-replace-button">${icon('replace', 22)}</div><div class="wf-tool">${icon('pencil', 22)}</div></div>
      <div class="wf-replace-menu"><div class="wf-menu-header"><strong>Replace</strong><span class="wf-current-app">${appMark('ChatGPT', 19)}<span>ChatGPT</span></span></div><div class="wf-app-search">${icon('search', 23)}<span class="wf-search-placeholder">Search Apps</span><span class="wf-search-query"></span><span class="wf-search-filter">${icon('filter', 24)}</span></div>
        <div class="wf-group-label wf-favorites-label">Favorites</div><div class="wf-app-row wf-fav-slack">${appMark('Slack', 28)}<span>Slack</span></div><div class="wf-app-row wf-fav-chatgpt">${appMark('ChatGPT', 28)}<span>ChatGPT</span><span class="wf-current-check">${icon('check', 22)}</span></div><div class="wf-group-label wf-all-label">All Apps</div><div class="wf-group-label wf-results-label">Search results</div>${allApps}<div class="wf-menu-scroll"><span></span></div>
      </div>`, `
      $ .wf-connections{position:absolute;inset:0;width:100%;height:100%}
      $ .wf-summary-node{position:absolute;left:405px;top:350px;width:610px;height:345px;background:#FAFCF9;border:1px solid #E0E5DF;border-radius:20px;box-shadow:0 12px 36px #36463B0A}
      $ .wf-action-tag{position:absolute;left:26px;top:-23px;background:#F9F0BD;border:1px solid #F2E5A7;border-radius:10px;padding:6px 14px;color:#9E8440;font-size:21px;line-height:1.25}
      $ .wf-node-title{position:absolute;left:25px;right:25px;top:27px;font-size:30px;font-weight:520;line-height:1.4;color:#292D30}
      $ .wf-node-copy{position:absolute;left:24px;right:24px;top:91px;height:159px;padding:21px 22px;border:1px solid #E5EAE3;border-radius:11px;background:#FFF;font-size:25px;line-height:1.48;color:#7B8086;overflow:hidden}
      $ .wf-provider-badge{position:absolute;left:25px;top:271px;height:45px;padding:0 13px;display:flex;align-items:center;gap:10px;border:1px solid #E0E6DF;border-radius:10px;background:#FFF;font-size:22px;color:#596066}
      $ .wf-provider-symbol{position:relative;width:25px;height:25px}$ .wf-provider-symbol>span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}
      $ .wf-right-port{position:absolute;right:-8px;top:164px;width:16px;height:16px;border:2px solid #CBD5CE;border-radius:50%;background:#F9FBF8}
      $ .wf-node-tools{position:absolute;left:1038px;top:385px;display:flex;flex-direction:column;gap:14px}$ .wf-tool{width:44px;height:44px;border:1px solid #DFE5DE;border-radius:50%;background:#FFF;box-shadow:0 3px 6px #45504907;color:#97A499;display:flex;align-items:center;justify-content:center}$ .wf-replace-button{color:#F7FAF6;background:#53665A;border-color:#53665A}
      $ .wf-replace-menu{position:absolute;left:1120px;top:155px;width:402px;height:753px;border:1px solid #E2E6E0;border-radius:21px;background:#FEFFFD;box-shadow:0 17px 48px #37423A12;overflow:hidden}
      $ .wf-menu-header{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 21px}$ .wf-menu-header>strong{font-size:25px;font-weight:550;color:#292D30}$ .wf-current-app{height:31px;display:flex;align-items:center;gap:6px;border:1px solid #E9EDE6;border-radius:7px;padding:0 7px;font-size:16px;color:#7B8086}
      $ .wf-app-search{position:absolute;left:18px;right:18px;top:81px;height:53px;border:1px solid #E0E6DE;border-radius:10px;background:#FCFEFA;display:flex;align-items:center;gap:11px;padding:0 14px;color:#8B9297;font-size:21px}
      $ .wf-search-placeholder{position:absolute;left:47px;font-size:21px;color:#8B9297}$ .wf-search-query{color:#3A4247;font-size:21px}$ .wf-search-filter{margin-left:auto;display:flex;color:#B2BDB2}
      $ .wf-group-label{position:absolute;left:21px;right:21px;font-size:18px;color:#8B9297;line-height:1.4}$ .wf-favorites-label{top:160px}$ .wf-all-label{top:323px}$ .wf-results-label{top:167px}
      $ .wf-app-row{position:absolute;left:12px;right:12px;height:47px;padding:0 13px;display:flex;align-items:center;gap:14px;border-radius:9px;font-size:22px;color:#292D30;white-space:nowrap}$ .wf-fav-slack{top:197px}$ .wf-fav-chatgpt{top:248px}$ .wf-current-check{margin-left:auto;color:#8FCBA1;display:flex;align-items:center}$ .wf-row-check{display:flex;align-items:center;margin-left:auto;color:#81B58E;opacity:0}$ .wf-app-0{background:#F0F4EE}
      $ .wf-menu-scroll{position:absolute;right:5px;top:360px;bottom:18px;width:3px;border-radius:2px;background:#F0F4EE}$ .wf-menu-scroll>span{position:absolute;top:4px;left:0;width:3px;height:78px;border-radius:2px;background:#DDE5DC}
    `);
    s.tl.set(s.q('.wf-replace-menu'), { opacity: 0, x: -10, y: 4, scale: .98, transformOrigin: '0% 50%' }, 0)
      .set(s.q('.wf-provider-original'), { opacity: 1 }, 0)
      .set(s.q('.wf-provider-new'), { opacity: 0 }, 0)
      .set(s.q('.wf-results-label'), { opacity: 0 }, 0)
      .set(s.qa('.wf-app-row'), { x: 0, y: 0, opacity: 1 }, 0)
      .set(s.q('.wf-phase'), { textContent: '原创演示：打开 Replace' }, 0);
    move(s, 1060, 523, .55); click(s, 1060, 523, 1.2);
    s.tl.to(s.q('.wf-replace-menu'), { opacity: 1, x: 0, y: 0, scale: 1, duration: .55 }, 1.35)
      .set(s.q('.wf-phase'), { textContent: '静态参考状态：Replace / Favorites / All Apps' }, 1.9)
      .to(s.q('.wf-cursor'), { opacity: 0, duration: .25 }, 2);
    move(s, 1290, 263, 4.35); click(s, 1290, 263, 5.02);
    s.tl.set(s.q('.wf-phase'), { textContent: '原创演示：搜索 Airtable 并原位替换节点' }, 5.02)
      .to(s.q('.wf-app-search'), { borderColor: '#C4D5C5', boxShadow: '0 0 0 3px #EDF3EB', duration: .25 }, 5.02)
      .to(s.q('.wf-search-placeholder'), { opacity: 0, duration: .15 }, 5.15);
    ctx.text(s.tl, s.q('.wf-search-query'), 'Airtable', 5.25, .7);
    s.tl.to(s.qa('.wf-favorites-label,.wf-all-label,.wf-fav-slack,.wf-fav-chatgpt,.wf-app-0,.wf-app-2,.wf-app-3,.wf-app-4,.wf-app-5,.wf-app-6,.wf-menu-scroll'), { opacity: 0, duration: .3 }, 6.05)
      .to(s.q('.wf-app-1'), { y: -213, duration: .55 }, 6.15)
      .to(s.q('.wf-results-label'), { opacity: 1, duration: .3 }, 6.2)
      .to(s.q('.wf-replace-menu'), { height: 294, duration: .55 }, 6.15);
    move(s, 1315, 376, 6.75); click(s, 1315, 376, 7.42);
    s.tl.to(s.q('.wf-app-1'), { backgroundColor: '#F0F6EE', duration: .2 }, 7.42)
      .to(s.q('.wf-app-1 .wf-row-check'), { opacity: 1, duration: .25 }, 7.42)
      .to(s.q('.wf-replace-menu'), { opacity: 0, x: -9, scale: .98, duration: .4 }, 7.82)
      .to(s.q('.wf-provider-original'), { opacity: 0, duration: .25 }, 7.9)
      .to(s.q('.wf-provider-new'), { opacity: 1, duration: .25 }, 7.9)
      .set(s.q('.wf-provider-name'), { textContent: 'Airtable' }, 7.95)
      .set(s.q('.wf-node-title'), { textContent: 'Airtable Summary' }, 7.95)
      .set(s.q('.wf-node-copy'), { textContent: String(p.result) }, 7.95)
      .to(s.q('.wf-summary-node'), { borderColor: '#C9DDCB', boxShadow: '0 0 0 5px #EAF2E8', duration: .4 }, 7.95)
      .to(s.q('.wf-summary-node'), { boxShadow: '0 12px 36px #36463B0A', duration: .55 }, 8.35)
      .to(s.q('.wf-cursor'), { opacity: 0, duration: .3 }, 8.4);
    return end(s, 11);
  });

  const userPrompt = 'Send a message to the #general channel with an AI project update summary as a structured bullet list.';
  const authText = 'Add your Slack credentials to connect your workspace and enable message delivery to the selected channel.';
  UIFX.register({
    id: 'interaction-node-config', title: 'Workflow Node Configuration', category: 'interaction', duration: 12,
    description: '参考 Kevin 的静态界面重建，交互节奏为原创演示：进入 Node Mode，显示用户要求与 Authentication required，指针停在 Add Credentials 附近，不执行授权或发送消息。',
    tags: ['Workflow', 'Node Mode', 'Authentication', '静态界面参考'],
    source: 'https://x.com/kvnkld/status/2002053876627964276', sourceStatus: 'observed-reconstruction', sourceObservation: 'static-image',
    params: { title: 'Send Channel Message', prompt: userPrompt }
  }, (ctx, params) => {
    const p = Object.assign({ title: 'Send Channel Message', prompt: userPrompt }, params || {});
    const title = ctx.esc(String(p.title)), prompt = ctx.esc(String(p.prompt));
    const s = buildScene(ctx, 'wf-config-scene', `
      <div class="wf-desktop"><div class="wf-desktop-chrome"><span class="wf-window-dots"><i></i><i></i><i></i></span><div class="wf-window-address">Workflow</div><span class="wf-window-minimize">−</span></div><div class="wf-canvas">${verticalGrid(1580, 832)}<svg class="wf-config-connections" viewBox="0 0 1580 832" aria-hidden="true"><path d="M544 0V330Q544 362 579 362H775M1139 625H1415" fill="none" stroke="#E0E5E6" stroke-width="2"/></svg></div>
        <div class="wf-side-tools"><span class="wf-side-selected">${icon('cursor', 22)}</span><span>${icon('hand', 22)}</span><span>${icon('plus', 23)}</span><span>${icon('grid', 23)}</span></div>
        <div class="wf-upper-node"><div class="wf-mini-action">Action</div><div class="wf-upper-title">ChatGPT Summary</div><p>${summaryText}</p><div class="wf-small-badge">${appMark('ChatGPT', 20)} ChatGPT</div></div>
        <div class="wf-output-node"><div class="wf-output-tag">Output</div><div class="wf-output-title">${title}</div><p>Send the summary to a Slack channel.</p><div class="wf-small-badge">${appMark('Slack', 20)} Slack</div></div>
        <div class="wf-config-launch-node"><div class="wf-launch-app">${appMark('Slack', 32)}<span>Slack</span></div><div class="wf-launch-title">${title}</div><div class="wf-launch-hint">Configure node ${icon('arrow', 20)}</div></div>
        <div class="wf-node-mode"><div class="wf-mode-label">Node Mode</div><div class="wf-mode-panel"><div class="wf-mode-header"><div class="wf-back">${icon('arrow', 22)}<span>Back</span></div><div class="wf-mode-app">${appMark('Slack', 30)}<span>Slack</span><i>/</i><span class="wf-mode-node-title">${title}</span></div><div class="wf-mode-tools"><span>${icon('down', 19)}</span><span>${icon('gear', 22)}</span><span>${icon('history', 22)}</span><span>${icon('expand', 22)}</span></div></div>
          <div class="wf-user-message">${prompt}</div><div class="wf-assistant-message"><div class="wf-auth-heading"><span class="wf-auth-app">${appMark('Slack', 34)}<i>${icon('lock', 13)}</i></span><strong>Authentication required</strong></div><p>${authText}</p><div class="wf-add-credentials">Add Credentials</div></div>
          <div class="wf-composer"><span class="wf-composer-plus">${icon('plus', 24)}</span><span>Describe what should happen...</span><span class="wf-composer-send">${icon('send', 23)}</span></div>
        </div></div>
      </div>`, `
      $ .wf-desktop{position:absolute;left:145px;top:78px;width:1640px;height:886px;overflow:hidden;border:1px solid #E0E4E7;border-radius:23px;background:#FFF;box-shadow:0 22px 75px #283B4B0C}
      $ .wf-desktop-chrome{height:54px;position:absolute;left:0;top:0;right:0;background:#FAFBFC;border-bottom:1px solid #E8EBEE;display:flex;align-items:center;justify-content:center}
      $ .wf-window-dots{position:absolute;left:22px;display:flex;gap:8px}$ .wf-window-dots>i{display:block;width:9px;height:9px;border-radius:50%;background:#D8DDE0}$ .wf-window-address{font-size:18px;color:#B0BAC0}$ .wf-window-minimize{position:absolute;right:25px;color:#B7C0C5;font-size:25px}
      $ .wf-canvas{position:absolute;left:61px;top:54px;right:0;bottom:0;background:#FBFCFC;overflow:hidden}$ .wf-config-connections{position:absolute;inset:0;width:100%;height:100%}
      $ .wf-side-tools{position:absolute;left:0;top:54px;bottom:0;width:61px;border-right:1px solid #E8EDF0;background:#F8FAFC;display:flex;flex-direction:column;align-items:center;gap:13px;padding-top:33px}
      $ .wf-side-tools>span{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:8px;color:#AEBAC1}$ .wf-side-tools>span.wf-side-selected{background:#EBF0F3;color:#889CA8}
      $ .wf-upper-node{position:absolute;left:341px;top:82px;width:484px;height:246px;border:1px solid #E3E9E6;border-radius:17px;background:#FBFDFA;padding:24px;box-shadow:0 6px 18px #36463B05}
      $ .wf-mini-action{position:absolute;left:22px;top:-17px;padding:4px 10px;border:1px solid #F0E3B3;border-radius:7px;background:#FBF2CE;color:#B5A168;font-size:16px}
      $ .wf-upper-title{font-size:24px;color:#67736C;line-height:1.4}$ .wf-upper-node p{font-size:18px;line-height:1.5;color:#87938A;margin:16px 0 14px}
      $ .wf-small-badge{display:inline-flex;align-items:center;gap:7px;padding:6px 9px;border:1px solid #E3E9E3;border-radius:8px;background:#FFF;color:#7D8A80;font-size:17px}
      $ .wf-output-node{position:absolute;left:1412px;top:526px;width:443px;height:258px;border:1px solid #DEEBE2;border-radius:17px;background:#F9FCF9;padding:28px 25px}
      $ .wf-output-tag{position:absolute;left:22px;top:-18px;padding:4px 10px;border:1px solid #CEE5D4;border-radius:7px;background:#E8F4E9;color:#91B49B;font-size:17px}
      $ .wf-output-title{font-size:23px;line-height:1.35;color:#576B5E;width:185px;max-width:185px;white-space:normal;overflow-wrap:break-word}$ .wf-output-node p{font-size:20px;color:#B0C0B5;line-height:1.5;margin:21px 0 26px;max-width:320px}
      $ .wf-config-launch-node{position:absolute;left:446px;top:363px;width:559px;height:225px;border:1px solid #CDDCEC;border-radius:18px;background:#FFF;padding:27px;box-shadow:0 13px 30px #55708D07}
      $ .wf-launch-app{display:flex;align-items:center;gap:13px;font-size:22px;color:#8C9FAE}$ .wf-launch-title{font-size:29px;color:#758C9D;margin-top:23px}$ .wf-launch-hint{display:flex;align-items:center;gap:14px;color:#A8B9C6;font-size:18px;margin-top:23px}$ .wf-launch-hint svg{rotate:180deg}
      $ .wf-node-mode{position:absolute;left:279px;top:217px;width:1110px;height:630px;z-index:5}
      $ .wf-mode-label{position:absolute;left:50%;top:-24px;height:34px;padding:5px 12px;border:1px solid #C5D9F0;border-radius:8px;background:#E6F0FC;color:#8BABD0;font-size:19px;line-height:1.2;z-index:2}
      $ .wf-mode-panel{position:absolute;inset:0;border:1.5px solid #9DBDE5;border-radius:19px;background:#FFF;box-shadow:0 18px 50px #507BA414;overflow:hidden}
      $ .wf-mode-header{position:absolute;top:0;left:0;right:0;height:82px;border-bottom:1px solid #EFF2F4;display:flex;align-items:center;padding:0 23px;background:#FEFFFF}
      $ .wf-back{display:flex;align-items:center;gap:10px;font-size:22px;color:#75858F}
      $ .wf-mode-app{position:absolute;left:182px;display:flex;align-items:center;gap:12px;font-size:23px;color:#424C55;white-space:nowrap}$ .wf-mode-app>i{font-style:normal;color:#C4CFD8;margin:0 4px}$ .wf-mode-node-title{color:#48535B;font-size:22px}
      $ .wf-mode-tools{position:absolute;right:23px;display:flex;align-items:center;gap:19px;color:#8396A3}$ .wf-mode-tools>span{display:flex;align-items:center;justify-content:center;width:23px}
      $ .wf-user-message{position:absolute;left:347px;right:27px;top:100px;padding:19px 23px;border-radius:14px;background:#F5F7F9;color:#5F6B75;font-size:22px;line-height:1.53;overflow-wrap:anywhere}
      $ .wf-assistant-message{position:absolute;left:26px;top:240px;width:780px;padding:22px;border:1px solid #EEF1F2;border-radius:15px;background:#FBFCFC;color:#9EB1BE}
      $ .wf-auth-heading{display:flex;flex-direction:column;align-items:flex-start;gap:8px;height:80px}$ .wf-auth-heading>strong{font-size:25px;line-height:1.4;font-weight:500;color:#303B44}$ .wf-auth-app{position:relative;display:flex;align-items:center;width:37px;height:37px}$ .wf-auth-app>i{position:absolute;right:-5px;bottom:-2px;width:19px;height:19px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:#FBF0BC;color:#C5A650;border:1px solid #F0DE9A}
      $ .wf-assistant-message p{font-size:22px;line-height:1.5;color:#747E86;margin:16px 0 20px;max-width:710px}
      $ .wf-add-credentials{display:inline-flex;align-items:center;justify-content:center;height:48px;padding:0 19px;border:1px solid #DCE5EC;border-radius:9px;background:#FFF;color:#5A6873;font-size:21px;box-shadow:0 3px 6px #31516A03}
      $ .wf-composer{position:absolute;left:25px;right:25px;bottom:23px;height:66px;padding:0 19px;display:flex;align-items:center;gap:18px;border:1px solid #E1E8ED;border-radius:13px;background:#FFF;color:#97A4AE;font-size:22px}
      $ .wf-composer-plus{display:flex;color:#94A5B0}$ .wf-composer-send{margin-left:auto;width:37px;height:37px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#C7D3DB;background:#F3F6F8}
    `);
    s.tl.set(s.q('.wf-node-mode'), { opacity: 0, scale: .96, x: 0, y: 20, transformOrigin: '50% 45%' }, 0)
      .set(s.q('.wf-mode-label'), { x: 0, xPercent: -50 }, 0)
      .set(s.q('.wf-config-launch-node'), { opacity: 1, scale: 1 }, 0)
      .set(s.q('.wf-user-message'), { opacity: 0, y: 12 }, 0)
      .set(s.q('.wf-assistant-message'), { opacity: 0, y: 12 }, 0)
      .set(s.q('.wf-phase'), { textContent: '原创演示：点击节点进入 Node Mode' }, 0);
    move(s, 872, 530, .6); click(s, 872, 530, 1.25);
    s.tl.to(s.q('.wf-config-launch-node'), { opacity: 0, scale: .98, duration: .3 }, 1.42)
      .to(s.q('.wf-node-mode'), { opacity: 1, scale: 1, y: 0, duration: .65 }, 1.5)
      .to(s.q('.wf-user-message'), { opacity: 1, y: 0, duration: .45 }, 2.3)
      .to(s.q('.wf-assistant-message'), { opacity: 1, y: 0, duration: .5 }, 3)
      .set(s.q('.wf-phase'), { textContent: '静态参考状态：Authentication required' }, 3.55);
    move(s, 573, 765, 5.1, .7);
    s.tl.to(s.q('.wf-add-credentials'), { borderColor: '#C4D5E3', backgroundColor: '#FDFEFF', duration: .3 }, 5.85)
      .set(s.q('.wf-phase'), { textContent: '原创演示停留在认证入口 · 尚未授权或发送消息' }, 5.85);
    return end(s, 12);
  });
})();
