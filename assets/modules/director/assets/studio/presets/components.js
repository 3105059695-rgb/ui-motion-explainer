/* Reusable software interaction mechanisms — original extensions. */
(function () {
  'use strict';
  const purple = '#8061C7';
  const paths = {
    check: '<path d="m5 12 4 4L19 6"/>',
    arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
    file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m4 19 6-6 4 3 3-4 4 5"/>',
    chat: '<path d="M4 4h16v13H9l-5 4z"/><path d="M8 8h8M8 12h5"/>',
    down: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v7l4 2"/>'
  };
  function icon(name, size = 26) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  }
  const chrome = title => `<div class="fxc-chrome"><span class="fxc-dots"><i></i><i></i><i></i></span><span>${title}</span><span class="fxc-chrome-end">${icon('grid', 21)}</span></div>`;
  function create(ctx, id, params, defaults, content, css) {
    const p = Object.assign({}, defaults, params || {});
    const v = Object.fromEntries(Object.entries(p).map(([k, value]) => [k, ctx.esc(String(value))]));
    const scope = `fxc-${id}`;
    ctx.root.innerHTML = `<style>
      .${scope}{background:#F7F8FA;color:#17191F;font-family:ProjectSans,sans-serif}
      .${scope} *{box-sizing:border-box}.${scope} svg{flex-shrink:0}
      .${scope} .fxc-kicker{position:absolute;left:112px;top:89px;color:#8F939F;font-size:23px;letter-spacing:2px}
      .${scope} .fxc-title{position:absolute;left:108px;top:134px;font-size:61px;font-weight:700;letter-spacing:-1.2px;line-height:1.3;max-width:1690px}
      .${scope} .fxc-window{position:absolute;background:#FFF;border:1px solid #E3E5EC;border-radius:28px;overflow:hidden;box-shadow:0 35px 100px #34294012}
      .${scope} .fxc-chrome{height:68px;border-bottom:1px solid #EAECF1;background:#FCFCFD;display:flex;align-items:center;justify-content:center;position:relative;font-size:22px;color:#8D929E}
      .${scope} .fxc-dots{position:absolute;left:27px;display:flex;gap:9px}.${scope} .fxc-dots i{width:11px;height:11px;background:#DADCE4;border-radius:50%}
      .${scope} .fxc-chrome-end{position:absolute;right:28px;color:#A3A8B4}
      .${scope} .fxc-iconbox{width:62px;height:62px;display:flex;align-items:center;justify-content:center;background:#EEE8FB;border-radius:16px;color:${purple};flex-shrink:0}
      .${scope} .fxc-line{height:10px;background:#EBEDF2;border-radius:6px}.${scope} .fxc-line.short{width:64%}
      .${scope} .fxc-tag{font-size:21px;color:#9070BC;background:#F0EAF9;border-radius:9px;padding:8px 13px;display:inline-flex;gap:9px;align-items:center}
      .${scope} .fxc-cursor{position:absolute;left:0;top:0;width:38px;height:46px;z-index:90;pointer-events:none;transform-origin:5px 5px}
      .${scope} .fxc-ring{position:absolute;left:0;top:0;width:52px;height:52px;border:3px solid #B297D6;border-radius:50%;pointer-events:none;z-index:85}
      .${scope} .fx-proof{position:absolute;right:60px;bottom:35px;color:#7B7F89;font-size:20px}
      ${css.replaceAll('$', `.${scope}`)}
    </style><div class="fx-scene ${scope}">${content(v)}<div class="fxc-ring"></div><div class="fxc-cursor">${ctx.cursor()}</div><div class="fx-proof">界面示意 / 原创动效</div></div>`;
    const q = selector => ctx.root.querySelector(selector);
    const qa = selector => Array.from(ctx.root.querySelectorAll(selector));
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.set(q('.fxc-cursor'), { x: 1500, y: 910, scale: 1, opacity: 0 }, 0)
      .set(q('.fxc-ring'), { x: 0, y: 0, scale: 1, opacity: 0 }, 0)
      .set(q('.fxc-title'), { y: 18, opacity: 0 }, 0)
      .to(q('.fxc-title'), { y: 0, opacity: 1, duration: .65 }, .06);
    return { ctx, p, v, q, qa, tl };
  }
  function move(s, x, y, at, duration = .55) {
    s.tl.to(s.q('.fxc-cursor'), { x, y, opacity: 1, duration, ease: 'power2.inOut' }, at);
  }
  function click(s, x, y, at) {
    s.ctx.click(s.tl, s.q('.fxc-cursor'), s.q('.fxc-ring'), x, y, at);
  }
  function finish(s, duration) {
    s.tl.to({ value: 0 }, { value: 1, duration: .01 }, duration - .01);
    return { timeline: s.tl, duration };
  }
  function register(id, title, duration, description, tags, params, build) {
    UIFX.register({ id, title, category: 'interaction', duration, description, tags, sourceStatus: 'original-extension', params }, build);
  }

  register('interaction-inline-edit', '原位选中与改写差异', 8.8, '拖选文档中的原句，浮出改写工具条，替换文本后保留修改前后差异。', ['原位编辑', '文本选区', '改写'], { title: '选中这一句，让表达更准确。', prompt: '这个工具能帮你处理很多事情。', result: '把重复操作交给 AI，把时间留给创作。' }, (ctx, params) => {
    const s = create(ctx, 'inline', params, { title: '选中这一句，让表达更准确。', prompt: '这个工具能帮你处理很多事情。', result: '把重复操作交给 AI，把时间留给创作。' }, v => `
      <div class="fxc-kicker">EDIT IN PLACE / KEEP THE CONTEXT</div><div class="fxc-title">${v.title}</div><div class="fxc-window editor">${chrome('文档编辑器')}<div class="editor-body"><div class="doc-label">内容介绍 · 草稿</div><h2>让工作更有条理</h2><div class="lead">用一句话，说清这个工具能带来什么。</div><div class="editable-line"><span class="selection-source"><span class="selection"></span><span class="original-copy">${v.prompt}</span></span><span class="edited-copy"></span></div><div class="toolbar"><span class="toolbar-icon">${icon('spark', 24)}</span><span class="rewrite-action">让表达更清楚</span><span class="tool-divider"></span><span class="tool-muted">精简</span><span class="tool-muted">翻译</span></div><div class="editor-rule"></div><div class="difference"><div class="diff-label">修改记录</div><div class="diff-before"><span>−</span><del>${v.prompt}</del></div><div class="diff-after"><span>+</span><b>${v.result}</b></div></div><div class="edit-status">${icon('check', 22)} <span>修改已保留，可继续编辑</span></div></div></div>`, `
      $ .editor{left:305px;top:275px;width:1310px;height:630px}$ .editor-body{padding:30px 55px;position:relative;height:562px}$ .doc-label{font-size:21px;color:#A1A8B4}$ h2{font-size:38px;margin:17px 0 14px;line-height:1.35}$ .lead{font-size:25px;color:#9EA6B4}
      $ .editable-line{position:absolute;left:55px;right:55px;top:197px;height:97px;font-size:32px;line-height:1.7;color:#5F6A7D}$ .selection-source{position:relative;display:inline-block;white-space:nowrap}$ .selection{position:absolute;left:-5px;top:1px;width:calc(100% + 10px);height:57px;border-radius:5px;background:#E5DCF5;transform-origin:left center}$ .original-copy{position:relative;z-index:1}$ .edited-copy{position:absolute;left:0;top:0;right:0;color:#76509E}
      $ .toolbar{position:absolute;left:310px;top:126px;display:flex;align-items:center;gap:17px;height:62px;padding:0 22px;background:#fff;border:1px solid #E2DAED;border-radius:14px;box-shadow:0 12px 28px #5143651D;color:#9372BE;font-size:23px}$ .toolbar-icon{display:flex;align-items:center}$ .tool-divider{height:25px;width:1px;background:#E9E3F0;margin:0 3px}$ .tool-muted{font-size:22px;color:#A9A1B6}
      $ .editor-rule{position:absolute;left:55px;right:55px;top:310px;height:1px;background:#ECEEF4}$ .difference{position:absolute;left:55px;right:55px;top:334px;font-size:24px}$ .diff-label{font-size:19px;color:#B1A7C1;margin-bottom:16px}$ .diff-before,$ .diff-after{display:flex;align-items:center;gap:16px;min-height:41px;line-height:1.55}$ .diff-before{color:#ADA7B8}$ .diff-after{color:#8F70B5}$ .diff-after b{font-weight:450}$ .diff-before>span,$ .diff-after>span{width:20px;text-align:center;font-size:27px}$ .edit-status{position:absolute;right:55px;bottom:29px;display:flex;align-items:center;gap:11px;color:#A18ABA;font-size:21px}
    `);
    s.tl.set(s.q('.editor'), { y: 26, opacity: 0 }, 0)
      .set(s.q('.selection'), { scaleX: 0 }, 0)
      .set(s.q('.toolbar'), { y: 9, opacity: 0, scale: .98 }, 0)
      .set(s.q('.original-copy'), { opacity: 1 }, 0)
      .set(s.q('.edited-copy'), { opacity: 0 }, 0)
      .set(s.q('.difference'), { y: 12, opacity: 0 }, 0)
      .set(s.q('.edit-status'), { opacity: 0 }, 0)
      .to(s.q('.editor'), { y: 0, opacity: 1, duration: .65 }, 0);
    move(s, 366, 558, .75); click(s, 366, 558, 1.35);
    s.tl.to(s.q('.fxc-cursor'), { x: 1368, duration: .9, ease: 'power2.inOut' }, 1.5)
      .to(s.q('.selection'), { scaleX: 1, duration: .9, ease: 'power2.inOut' }, 1.5)
      .to(s.q('.toolbar'), { y: 0, opacity: 1, scale: 1, duration: .35 }, 2.4);
    move(s, 810, 498, 2.9); click(s, 810, 498, 3.5);
    s.tl.to(s.q('.rewrite-action'), { color: '#5D397F', duration: .18 }, 3.5)
      .to(s.q('.toolbar'), { y: -7, opacity: 0, duration: .3 }, 3.65)
      .to(s.q('.selection'), { opacity: .4, duration: .3 }, 3.65)
      .to(s.q('.original-copy'), { opacity: 0, duration: .2 }, 3.75)
      .to(s.q('.edited-copy'), { opacity: 1, duration: .15 }, 3.85);
    ctx.text(s.tl, s.q('.edited-copy'), s.p.result, 3.85, 1.3);
    s.tl.to(s.q('.selection'), { opacity: 0, duration: .4 }, 5.2)
      .to(s.q('.difference'), { y: 0, opacity: 1, duration: .5 }, 5.25)
      .to(s.q('.edit-status'), { opacity: 1, duration: .35 }, 5.6)
      .to(s.q('.fxc-cursor'), { opacity: 0, duration: .3 }, 5.3);
    return finish(s, 8.8);
  });

  register('interaction-dock-switch', 'Dock 鱼眼与应用切换', 8.6, '光标沿底部 Dock 移动产生邻近放大，点击应用后同一窗口切换焦点与内容。', ['Dock', '鱼眼放大', '应用切换'], { title: '跟随焦点，自然切换。', prompt: '项目文档', result: '执行工作台' }, (ctx, params) => {
    const s = create(ctx, 'dock', params, { title: '跟随焦点，自然切换。', prompt: '项目文档', result: '执行工作台' }, v => `
      <div class="fxc-kicker">DOCK / A SMALL MOVE, A NEW CONTEXT</div><div class="fxc-title">${v.title}</div><div class="fxc-window app-window">${chrome('<span class="app-caption">项目文档</span>')}<div class="document-app"><div class="app-overline">DOCUMENT SPACE</div><h2>${v.prompt}</h2><p>把项目背景、目标与关键资料放在一起。</p><div class="document-strip"><div class="fxc-iconbox">${icon('file', 31)}</div><div><b>项目说明</b><span>目标与预期交付</span></div><div class="fxc-line"></div></div><div class="document-strip"><div class="fxc-iconbox">${icon('file', 31)}</div><div><b>参考资料</b><span>素材与实现依据</span></div><div class="fxc-line"></div></div></div><div class="tasks-app"><div class="app-overline">TASK SPACE</div><h2>${v.result}</h2><p>资料仍在，接下来把计划付诸行动。</p><div class="dock-task"><span class="task-check">${icon('check', 19)}</span><b>读取项目说明</b><span>已完成</span></div><div class="dock-task focus-task"><span class="task-check">${icon('spark', 19)}</span><b>组织执行步骤</b><span>进行中</span></div><div class="dock-task"><span class="task-check">${icon('clock', 19)}</span><b>生成交付结果</b><span>待开始</span></div></div></div><div class="dock-tray"><div class="dock-item dock-1">${icon('file', 37)}</div><div class="dock-item dock-2">${icon('image', 37)}</div><div class="dock-item dock-3">${icon('grid', 37)}</div><div class="dock-item dock-4">${icon('chat', 37)}</div><div class="dock-item dock-5">${icon('settings', 37)}</div><span class="dock-active"></span></div><div class="dock-tooltip">工作台</div>`, `
      $ .app-window{left:330px;top:267px;width:1260px;height:516px}$ .document-app,$ .tasks-app{position:absolute;left:0;right:0;top:68px;bottom:0;padding:33px 54px;background:#fff}$ .app-overline{font-size:19px;letter-spacing:2px;color:#AA9ABD}$ h2{font-size:39px;line-height:1.4;margin:12px 0 11px}$ p{font-size:25px;color:#A0A8B6;margin:0 0 23px}
      $ .document-strip{height:105px;border-top:1px solid #EDEFF4;display:flex;align-items:center;gap:21px}$ .document-strip b{font-size:26px;font-weight:500;display:block;color:#6E7788}$ .document-strip span{font-size:20px;color:#ABB1BD;display:block;margin-top:6px}$ .document-strip .fxc-line{width:330px;margin-left:auto}
      $ .dock-task{height:73px;display:flex;align-items:center;gap:19px;padding:0 22px;border-radius:12px;color:#B4A4CB;font-size:21px}$ .dock-task b{font-size:25px;font-weight:500;color:#798192}$ .dock-task>span:last-child{margin-left:auto;font-size:21px;color:#B0A4C0}$ .task-check{width:27px;height:27px;border:1px solid #DAD0E7;border-radius:7px;display:flex;align-items:center;justify-content:center}$ .focus-task{background:#F5F0FB}
      $ .dock-tray{position:absolute;left:595px;top:805px;width:730px;height:118px;border-radius:29px;background:#F0EEF4;border:1px solid #E2DFE9;box-shadow:0 18px 44px #50425E10}$ .dock-item{position:absolute;top:16px;width:84px;height:84px;background:white;border:1px solid #E6E1EE;border-radius:23px;display:flex;align-items:center;justify-content:center;color:#A18ABA;box-shadow:0 5px 10px #49335F09;transform-origin:center bottom}$ .dock-1{left:43px;color:#9C85B5}$ .dock-2{left:183px;color:#A7A3B8}$ .dock-3{left:323px;background:#E7DDF6;color:#8C6BB6}$ .dock-4{left:463px;color:#9DA6BB}$ .dock-5{left:603px;color:#AAA0B8}$ .dock-active{position:absolute;left:81px;bottom:6px;width:8px;height:5px;border-radius:3px;background:#A88BBE}$ .dock-tooltip{position:absolute;left:909px;top:752px;padding:8px 19px;border:1px solid #E4DFEB;border-radius:10px;background:#FFF;font-size:20px;color:#9A85B1;box-shadow:0 8px 15px #40334D0B}
    `);
    s.tl.set(s.q('.app-window'), { y: 24, scale: 1, opacity: 0 }, 0)
      .set(s.q('.document-app'), { x: 0, opacity: 1 }, 0)
      .set(s.q('.tasks-app'), { x: 52, opacity: 0 }, 0)
      .set(s.qa('.dock-item'), { scale: 1, y: 0 }, 0)
      .set(s.q('.dock-tray'), { y: 15, opacity: 0 }, 0)
      .set(s.q('.dock-active'), { x: 0 }, 0)
      .set(s.q('.dock-tooltip'), { y: 7, opacity: 0 }, 0)
      .to(s.q('.app-window'), { y: 0, opacity: 1, duration: .65 }, 0)
      .to(s.q('.dock-tray'), { y: 0, opacity: 1, duration: .55 }, .2);
    move(s, 681, 849, .7);
    s.tl.to(s.q('.dock-1'), { scale: 1.25, y: -4, duration: .35 }, 1.1)
      .to(s.q('.dock-2'), { scale: 1.1, duration: .35 }, 1.1);
    move(s, 821, 847, 1.5, .65);
    s.tl.to(s.q('.dock-1'), { scale: 1.1, y: 0, duration: .4 }, 1.75)
      .to(s.q('.dock-2'), { scale: 1.28, y: -5, duration: .4 }, 1.75)
      .to(s.q('.dock-3'), { scale: 1.1, duration: .4 }, 1.75);
    move(s, 961, 841, 2.25, .6);
    s.tl.to(s.q('.dock-1'), { scale: 1, duration: .4 }, 2.45)
      .to(s.q('.dock-2'), { scale: 1.1, y: 0, duration: .4 }, 2.45)
      .to(s.q('.dock-3'), { scale: 1.28, y: -5, duration: .4 }, 2.45)
      .to(s.q('.dock-4'), { scale: 1.1, duration: .4 }, 2.45)
      .to(s.q('.dock-tooltip'), { y: 0, opacity: 1, duration: .3 }, 2.65);
    click(s, 961, 841, 3.05);
    s.tl.to(s.q('.dock-3'), { scale: 1.17, duration: .12 }, 3.05)
      .to(s.q('.dock-3'), { scale: 1.28, duration: .2 }, 3.17)
      .to(s.q('.document-app'), { x: -52, opacity: 0, duration: .6 }, 3.25)
      .to(s.q('.tasks-app'), { x: 0, opacity: 1, duration: .6 }, 3.25)
      .set(s.q('.app-caption'), { textContent: s.p.result }, 3.5)
      .to(s.q('.dock-active'), { x: 280, duration: .6 }, 3.25)
      .to(s.q('.app-window'), { scale: 1.012, duration: .28 }, 3.25)
      .to(s.q('.app-window'), { scale: 1, duration: .4 }, 3.53)
      .to(s.qa('.dock-item'), { scale: 1, y: 0, duration: .5 }, 4.5)
      .to(s.q('.dock-tooltip'), { opacity: 0, y: 7, duration: .3 }, 4.5)
      .to(s.q('.fxc-cursor'), { opacity: 0, duration: .3 }, 4.5);
    return finish(s, 8.6);
  });

  register('interaction-progress-morph', '按钮进度环与完成勾', 8.6, '点击开始按钮，按钮收拢为进度圆环，环填满后同一控件切为完成勾。', ['按钮变形', '进度', '完成反馈'], { title: '从开始，到完成。', prompt: '生成项目执行计划', result: '项目计划已生成' }, (ctx, params) => {
    const s = create(ctx, 'progress', params, { title: '从开始，到完成。', prompt: '生成项目执行计划', result: '项目计划已生成' }, v => `
      <div class="fxc-kicker">ONE CONTROL / EVERY STATE CONNECTED</div><div class="fxc-title">${v.title}</div><div class="progress-surface"><div class="progress-button"><span class="start-copy">${icon('spark', 30)}<span>${v.prompt}</span>${icon('arrow', 29)}</span><svg class="progress-ring-svg" width="132" height="132" viewBox="0 0 132 132" aria-hidden="true"><circle class="progress-track" cx="66" cy="66" r="53" stroke="#E8E1F1" stroke-width="5" fill="none"/><circle class="progress-stroke" cx="66" cy="66" r="53" stroke="#A68AC9" stroke-width="5" stroke-linecap="round" fill="none" stroke-dasharray="333" stroke-dashoffset="333"/></svg><span class="progress-number"><b class="progress-value">0</b><span>%</span></span><svg class="completion-check" width="58" height="58" viewBox="0 0 58 58" fill="none" aria-hidden="true"><path d="m13 30 10 10 24-25" stroke="white" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="49" stroke-dashoffset="49"/></svg></div><div class="progress-caption"><span class="progress-caption-text">点击开始，过程清楚可见</span></div><div class="progress-result">${v.result}</div><div class="progress-detail">内容已保存，可以继续编辑与交付。</div></div>`, `
      $ .progress-surface{position:absolute;left:0;right:0;top:285px;height:620px}$ .progress-button{position:absolute;left:635px;top:155px;width:650px;height:128px;border-radius:26px;background:#1F2028;box-shadow:0 20px 60px #392B4A12;overflow:hidden;color:white}$ .start-copy{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:20px;font-size:29px;white-space:nowrap}$ .progress-ring-svg{position:absolute;left:0;top:0}$ .progress-number{position:absolute;left:0;top:0;width:132px;height:132px;display:flex;align-items:center;justify-content:center;font-family:ProjectDisplay,sans-serif;font-size:37px;letter-spacing:-1px;color:#9A7ABD}$ .progress-value{font-weight:inherit}$ .progress-number>span{font-size:19px;align-self:center;margin:8px 0 0 2px}$ .completion-check{position:absolute;left:37px;top:37px}$ .progress-caption{position:absolute;left:200px;right:200px;top:328px;text-align:center;font-size:25px;color:#A0A6B3}$ .progress-result{position:absolute;left:200px;right:200px;top:391px;text-align:center;font-size:44px;font-weight:600;color:#574661}$ .progress-detail{position:absolute;left:200px;right:200px;top:458px;text-align:center;font-size:25px;color:#AAA4B4}
    `);
    s.tl.set(s.q('.progress-button'), { y: 28, scale: 1, opacity: 0 }, 0)
      .set(s.q('.start-copy'), { opacity: 1, scale: 1 }, 0)
      .set(s.q('.progress-ring-svg'), { opacity: 0, rotation: -90, transformOrigin: '50% 50%' }, 0)
      .set(s.q('.progress-number'), { opacity: 0 }, 0)
      .set(s.q('.progress-stroke'), { strokeDashoffset: 333, autoRound: false }, 0)
      .set(s.q('.completion-check'), { opacity: 0, scale: .75 }, 0)
      .set(s.q('.progress-result'), { y: 17, opacity: 0 }, 0)
      .set(s.q('.progress-detail'), { y: 12, opacity: 0 }, 0)
      .to(s.q('.progress-button'), { y: 0, opacity: 1, duration: .65 }, 0);
    move(s, 1111, 502, .7); click(s, 1111, 502, 1.35);
    s.tl.to(s.q('.start-copy'), { opacity: 0, scale: .96, duration: .23 }, 1.4)
      .to(s.q('.progress-button'), { left: 894, width: 132, height: 132, borderRadius: 66, backgroundColor: '#FBF9FE', boxShadow: '0 12px 45px #392B4A08', duration: .7, ease: 'expo.inOut' }, 1.55)
      .to(s.q('.progress-ring-svg'), { opacity: 1, duration: .3 }, 2.05)
      .to(s.q('.progress-number'), { opacity: 1, duration: .3 }, 2.05)
      .set(s.q('.progress-caption-text'), { textContent: '理解项目目标' }, 2.1)
      .to(s.q('.progress-stroke'), { strokeDashoffset: 0, autoRound: false, duration: 2.45, ease: 'power1.inOut' }, 2.2)
      .to(s.q('.fxc-cursor'), { opacity: 0, duration: .3 }, 2.2);
    [12, 28, 45, 63, 78, 91, 100].forEach((value, i) => s.tl.set(s.q('.progress-value'), { textContent: String(value) }, 2.4 + i * .36));
    s.tl.set(s.q('.progress-caption-text'), { textContent: '整理内容与执行步骤' }, 3.2)
      .set(s.q('.progress-caption-text'), { textContent: '保存最终结果' }, 4.2)
      .to(s.qa('.progress-ring-svg,.progress-number'), { opacity: 0, duration: .25 }, 4.8)
      .to(s.q('.progress-button'), { backgroundColor: '#9E80C3', boxShadow: '0 0 0 17px #EFE8F8', duration: .4 }, 4.9)
      .to(s.q('.completion-check'), { opacity: 1, scale: 1, duration: .4 }, 5.03)
      .to(s.q('.completion-check path'), { strokeDashoffset: 0, duration: .45 }, 5.03)
      .to(s.q('.progress-button'), { boxShadow: '0 0 0 26px #EFE8F800', duration: .7 }, 5.3)
      .set(s.q('.progress-caption-text'), { textContent: '已完成' }, 5.2)
      .to(s.q('.progress-result'), { y: 0, opacity: 1, duration: .6 }, 5.35)
      .to(s.q('.progress-detail'), { y: 0, opacity: 1, duration: .5 }, 5.6);
    return finish(s, 8.6);
  });

  register('interaction-notification-expand', '顶部胶囊展开执行通知', 8.8, '点击紧凑通知查看步骤，步骤依次完成，再收回为单行成功通知。', ['胶囊展开', '任务状态', '通知'], { title: '过程展开，结果收好。', prompt: '正在整理项目资料', result: '项目资料已整理完成' }, (ctx, params) => {
    const s = create(ctx, 'notify', params, { title: '过程展开，结果收好。', prompt: '正在整理项目资料', result: '项目资料已整理完成' }, v => `
      <div class="fxc-kicker">LIVE STATUS / OPEN ONLY WHAT YOU NEED</div><div class="fxc-title">${v.title}</div><div class="fxc-window notification-workspace">${chrome('项目空间')}<div class="background-content"><h2>创作准备</h2><p>项目资料正在后台整理。</p><div class="workspace-item"><div class="fxc-iconbox">${icon('file', 31)}</div><div><b>项目资料包</b><span class="workspace-status">整理中</span></div><span class="workspace-check">${icon('check', 26)}</span></div><div class="fxc-line"></div><div class="fxc-line short"></div></div></div><div class="notification-capsule"><div class="capsule-header"><div class="capsule-icon"><span class="capsule-spark">${icon('spark', 24)}</span><span class="capsule-check">${icon('check', 24)}</span></div><span class="capsule-title">${v.prompt}</span><span class="capsule-count">1 / 3</span></div><div class="capsule-body"><div class="notification-step step-1"><span class="step-circle">${icon('check', 18)}</span><span>读取并识别项目文件</span><b>已完成</b></div><div class="notification-step step-2"><span class="step-circle">${icon('check', 18)}</span><span>提取关键内容与约束</span><b>进行中</b></div><div class="notification-step step-3"><span class="step-circle">${icon('check', 18)}</span><span>形成可编辑资料摘要</span><b>等待中</b></div><div class="capsule-bottom">所有步骤都保留在本次任务中。</div></div></div>`, `
      $ .notification-workspace{left:335px;top:420px;width:1250px;height:475px}$ .background-content{padding:31px 45px}$ .background-content h2{font-size:34px;line-height:1.4;margin:0 0 11px}$ .background-content p{font-size:24px;color:#A0A8B5;margin:0 0 25px}$ .workspace-item{display:flex;align-items:center;gap:22px;height:114px;border:1px solid #EAE5F0;border-radius:16px;padding:22px;margin-bottom:30px}$ .workspace-item b{font-size:27px;font-weight:500;color:#778193;display:block}$ .workspace-status{font-size:20px;color:#B1A4C0;margin-top:8px;display:block}$ .workspace-check{margin-left:auto;color:#A68CC5}$ .background-content .fxc-line{margin-top:18px;width:74%}$ .background-content .fxc-line.short{width:49%}
      $ .notification-capsule{position:absolute;left:690px;top:285px;width:540px;height:78px;overflow:hidden;border:1px solid #E4DEEB;border-radius:27px;background:#FFF;box-shadow:0 16px 55px #3F31521D;z-index:10}$ .capsule-header{height:78px;padding:0 25px;display:flex;align-items:center;gap:16px;white-space:nowrap}$ .capsule-icon{position:relative;width:39px;height:39px;background:#EEE6F8;border-radius:13px;color:#9B7CC1;flex-shrink:0}$ .capsule-spark,$ .capsule-check{position:absolute;inset:0;display:flex;align-items:center;justify-content:center}$ .capsule-title{font-size:25px;color:#6C5A81;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}$ .capsule-count{margin-left:auto;color:#B2A3C4;font-family:ProjectDisplay,sans-serif;font-size:21px}
      $ .capsule-body{padding:5px 27px 24px;border-top:1px solid #EFEBF4}$ .notification-step{height:70px;display:flex;align-items:center;gap:16px;font-size:24px;color:#9E91B0}$ .step-circle{width:25px;height:25px;border:1px solid #E0D7EA;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#AD92CC;flex-shrink:0}$ .notification-step b{font-size:20px;color:#B3A3C5;margin-left:auto;font-weight:400}$ .capsule-bottom{padding-top:15px;margin-top:7px;border-top:1px solid #EDE7F4;font-size:19px;color:#B3A9C0}
    `);
    s.tl.set(s.q('.notification-workspace'), { y: 24, opacity: 0, filter: 'blur(0px)' }, 0)
      .set(s.q('.notification-capsule'), { y: -16, opacity: 0 }, 0)
      .set(s.q('.capsule-body'), { opacity: 0, y: -8 }, 0)
      .set(s.q('.capsule-check'), { opacity: 0, scale: .8 }, 0)
      .set(s.q('.capsule-spark'), { opacity: 1 }, 0)
      .set(s.q('.workspace-check'), { opacity: 0 }, 0)
      .set(s.qa('.step-2 svg,.step-3 svg'), { opacity: 0 }, 0)
      .to(s.q('.notification-workspace'), { y: 0, opacity: 1, duration: .65 }, 0)
      .to(s.q('.notification-capsule'), { y: 0, opacity: 1, duration: .55 }, .25);
    move(s, 1058, 324, .8); click(s, 1058, 324, 1.45);
    s.tl.to(s.q('.notification-capsule'), { left: 550, width: 820, height: 360, borderRadius: 25, duration: .65, ease: 'expo.inOut' }, 1.6)
      .to(s.q('.notification-workspace'), { filter: 'blur(2px)', opacity: .55, duration: .55 }, 1.6)
      .to(s.q('.capsule-body'), { opacity: 1, y: 0, duration: .45 }, 1.95)
      .to(s.q('.step-2 .step-circle'), { backgroundColor: '#EEE5F7', borderColor: '#DACAEA', duration: .35 }, 2.7)
      .to(s.q('.step-2 svg'), { opacity: 1, duration: .35 }, 3.2)
      .set(s.q('.step-2 b'), { textContent: '已完成' }, 3.2)
      .set(s.q('.step-3 b'), { textContent: '进行中' }, 3.2)
      .set(s.q('.capsule-count'), { textContent: '2 / 3' }, 3.2)
      .to(s.q('.step-3 .step-circle'), { backgroundColor: '#EEE5F7', borderColor: '#DACAEA', duration: .35 }, 3.6)
      .to(s.q('.step-3 svg'), { opacity: 1, duration: .35 }, 4.35)
      .set(s.q('.step-3 b'), { textContent: '已完成' }, 4.35)
      .set(s.q('.capsule-count'), { textContent: '3 / 3' }, 4.35)
      .to(s.q('.capsule-spark'), { opacity: 0, duration: .22 }, 4.5)
      .to(s.q('.capsule-check'), { opacity: 1, scale: 1, duration: .3 }, 4.5)
      .to(s.q('.fxc-cursor'), { opacity: 0, duration: .3 }, 4.5)
      .to(s.q('.capsule-body'), { opacity: 0, y: -8, duration: .3 }, 5.5)
      .to(s.q('.capsule-count'), { opacity: 0, duration: .25 }, 5.5)
      .to(s.q('.notification-capsule'), { left: 645, width: 630, height: 78, borderRadius: 27, duration: .65, ease: 'expo.inOut' }, 5.65)
      .set(s.q('.capsule-title'), { textContent: s.p.result }, 6.15)
      .to(s.q('.notification-workspace'), { filter: 'blur(0px)', opacity: 1, duration: .6 }, 5.8)
      .set(s.q('.workspace-status'), { textContent: '已整理，可直接使用' }, 6.2)
      .to(s.q('.workspace-check'), { opacity: 1, duration: .35 }, 6.2);
    return finish(s, 8.8);
  });

  register('interaction-settings-toggle', '开关联动选项与预览', 8.4, '开启聚焦模式，相关选项连续展开，右侧预览同步收起干扰并强调正文。', ['设置', '开关联动', '实时预览'], { title: '改一个设置，画面一起响应。', prompt: '聚焦模式', result: '正文已成为唯一焦点' }, (ctx, params) => {
    const s = create(ctx, 'settings', params, { title: '改一个设置，画面一起响应。', prompt: '聚焦模式', result: '正文已成为唯一焦点' }, v => `
      <div class="fxc-kicker">SETTINGS / SEE WHAT YOUR CHOICE CHANGES</div><div class="fxc-title">${v.title}</div><div class="fxc-window settings-window">${chrome('阅读偏好')}<div class="settings-control"><div class="control-title">阅读与编辑</div><div class="setting-name">${v.prompt}</div><div class="setting-description">收起边栏，减少干扰</div><div class="toggle-track"><span class="toggle-knob"></span></div><span class="toggle-status">已关闭</span><div class="related-options"><div class="option-heading">聚焦强度 <span>柔和</span></div><div class="strength-track"><span class="strength-fill"></span><span class="strength-thumb"></span></div><div class="option-line"><span>跟随当前段落</span><span class="mini-check">${icon('check', 17)}</span></div><p>切换后立即应用到当前文档。</p></div></div><div class="preview-area"><div class="preview-heading">实时预览</div><div class="document-preview"><div class="preview-chrome"><span></span><span></span><span></span></div><div class="preview-sidebar"><div>目录</div><p>项目背景</p><p>执行方式</p><p>交付结果</p></div><div class="preview-document"><div class="preview-doc-title">把注意力留给内容</div><div class="fxc-line preview-muted"></div><div class="fxc-line short preview-muted"></div><div class="preview-highlight"></div><div class="preview-important">让重要的内容，更容易被看见。</div><div class="fxc-line preview-muted line-last"></div><div class="fxc-line short preview-muted"></div></div></div><div class="preview-result">${icon('check', 21)} <span>${v.result}</span></div></div></div>`, `
      $ .settings-window{left:300px;top:275px;width:1320px;height:635px}$ .settings-control{position:absolute;left:0;top:68px;bottom:0;width:505px;padding:38px 39px;border-right:1px solid #ECEEF4;background:#FDFDFE}$ .control-title{font-size:31px;font-weight:550;color:#586274}$ .setting-name{position:absolute;left:39px;top:122px;font-size:28px;color:#727D8F}$ .setting-description{position:absolute;left:39px;top:168px;font-size:22px;color:#A6AEBC}$ .toggle-track{position:absolute;right:39px;top:121px;width:88px;height:48px;border-radius:25px;background:#DBDDE5;border:1px solid #D7DAE3}$ .toggle-knob{position:absolute;left:5px;top:5px;width:36px;height:36px;background:#fff;border-radius:50%;box-shadow:0 2px 7px #49526615}$ .toggle-status{position:absolute;right:48px;top:182px;font-size:18px;color:#ABB0BD}
      $ .related-options{position:absolute;left:39px;right:39px;top:245px;border-top:1px solid #E9E4F1;padding-top:26px;overflow:hidden}$ .option-heading{display:flex;justify-content:space-between;font-size:23px;color:#9A8CAF}$ .option-heading>span{font-size:20px;color:#AB97C5}$ .strength-track{position:relative;height:7px;background:#E8E2F0;border-radius:5px;margin-top:29px}$ .strength-fill{height:100%;width:65%;border-radius:5px;background:#BBA4D4}$ .strength-thumb{position:absolute;left:65%;top:-6px;width:19px;height:19px;border:3px solid #fff;border-radius:50%;background:#AD8DCF;box-shadow:0 2px 9px #6346791B}$ .option-line{margin-top:40px;display:flex;align-items:center;justify-content:space-between;font-size:23px;color:#9B8BAD}$ .mini-check{display:flex;align-items:center;justify-content:center;width:24px;height:24px;background:#EDE3F7;border-radius:6px;color:#A284C4}$ .related-options p{font-size:19px;color:#B3A9C0;margin-top:28px}
      $ .preview-area{position:absolute;left:505px;top:68px;right:0;bottom:0;padding:34px 35px}$ .preview-heading{font-size:22px;color:#A5ABB7;margin-bottom:22px}$ .document-preview{position:relative;width:744px;height:356px;border:1px solid #E0E3EB;border-radius:17px;overflow:hidden;box-shadow:0 12px 27px #45425908}$ .preview-chrome{height:39px;background:#F6F7FA;border-bottom:1px solid #E6E8F0;display:flex;align-items:center;gap:6px;padding-left:16px}$ .preview-chrome>span{height:7px;width:7px;background:#D7DBE5;border-radius:50%}$ .preview-sidebar{position:absolute;left:0;top:39px;bottom:0;width:169px;background:#F8F9FC;border-right:1px solid #E7EAF1;padding:24px 23px;color:#A8B0BE}$ .preview-sidebar>div{font-size:20px;margin-bottom:23px}$ .preview-sidebar p{font-size:18px;margin:18px 0;color:#B9BFCA}$ .preview-document{position:absolute;left:200px;right:30px;top:74px}$ .preview-doc-title{font-size:25px;font-weight:500;color:#8993A4;margin-bottom:27px}$ .preview-document .fxc-line{height:8px;margin:16px 0}$ .preview-important{font-size:23px;color:#8390A5;position:relative;z-index:2;margin-top:26px;white-space:nowrap}$ .preview-highlight{position:absolute;left:-7px;right:-7px;top:133px;height:50px;border-radius:7px;background:#EAE1F6;transform-origin:left center}$ .preview-document .line-last{margin-top:31px}$ .preview-result{margin-top:27px;display:flex;align-items:center;gap:11px;font-size:22px;color:#9F88B9}
    `);
    s.tl.set(s.q('.settings-window'), { y: 24, opacity: 0 }, 0)
      .set(s.q('.toggle-knob'), { x: 0 }, 0)
      .set(s.q('.related-options'), { y: -14, opacity: 0, clipPath: 'inset(0 0 100% 0)' }, 0)
      .set(s.q('.preview-sidebar'), { x: 0, opacity: 1 }, 0)
      .set(s.q('.preview-highlight'), { scaleX: 0, opacity: 0 }, 0)
      .set(s.q('.preview-result'), { y: 8, opacity: 0 }, 0)
      .to(s.q('.settings-window'), { y: 0, opacity: 1, duration: .65 }, 0);
    move(s, 722, 490, .8); click(s, 722, 490, 1.45);
    s.tl.to(s.q('.toggle-track'), { backgroundColor: '#B49BCF', borderColor: '#AF93CB', duration: .3 }, 1.45)
      .to(s.q('.toggle-knob'), { x: 40, duration: .35, ease: 'power2.out' }, 1.45)
      .set(s.q('.toggle-status'), { textContent: '已开启' }, 1.65)
      .to(s.q('.related-options'), { y: 0, opacity: 1, clipPath: 'inset(0 0 0% 0)', duration: .65 }, 1.8)
      .to(s.q('.preview-sidebar'), { x: -169, opacity: 0, duration: .65 }, 1.8)
      .to(s.q('.preview-document'), { left: 40, duration: .75 }, 1.8)
      .to(s.q('.preview-highlight'), { scaleX: 1, opacity: 1, duration: .6 }, 2.25)
      .to(s.q('.preview-important'), { color: '#9473BA', duration: .5 }, 2.25)
      .to(s.qa('.preview-muted'), { opacity: .48, duration: .5 }, 2.25)
      .to(s.q('.preview-result'), { y: 0, opacity: 1, duration: .45 }, 3.1)
      .to(s.q('.fxc-cursor'), { opacity: 0, duration: .3 }, 3.4);
    return finish(s, 8.4);
  });

  register('interaction-table-sort', '表格排序与关键行定位', 8.6, '点击用时列启用升序，原表格的四行连续重排，选择最快完成的那一行。', ['表格', '排序', '连续重排'], { title: '换个顺序，重点就清楚了。', prompt: '任务执行记录', result: '最快完成的任务已定位' }, (ctx, params) => {
    const row = (cls, task, time, count) => `<div class="table-row ${cls}"><span class="row-icon">${icon('file', 25)}</span><strong>${task}</strong><span class="row-status">已完成</span><span class="row-time">${time}<small> 秒</small></span><span class="row-order">${count}</span></div>`;
    const s = create(ctx, 'sort', params, { title: '换个顺序，重点就清楚了。', prompt: '任务执行记录', result: '最快完成的任务已定位' }, v => `
      <div class="fxc-kicker">SORT / FIND WHAT MATTERS IN THE DATA</div><div class="fxc-title">${v.title}</div><div class="fxc-window sort-window">${chrome('项目数据')}<div class="table-title">${v.prompt}<span>4 项任务</span></div><div class="table-header"><span>任务名称</span><span class="status-header">状态</span><span class="duration-header">执行用时 <i>${icon('down', 19)}</i></span></div><div class="table-body">${row('sort-a', '生成内容大纲', 35, '1')}${row('sort-b', '整理参考资料', 48, '2')}${row('sort-c', '检查字幕内容', 8, '3')}${row('sort-d', '提取项目重点', 12, '4')}</div><div class="sort-footer"><span class="sort-state">原始顺序</span><span class="sort-result">${icon('check', 23)} ${v.result}</span></div></div>`, `
      $ .sort-window{left:285px;top:265px;width:1350px;height:660px}$ .table-title{position:absolute;left:47px;right:47px;top:103px;display:flex;gap:22px;align-items:center;font-size:35px;font-weight:550;color:#535F73}$ .table-title>span{font-size:21px;font-weight:400;color:#B0A7BE;background:#F7F3FC;padding:5px 12px;border-radius:8px}
      $ .table-header{position:absolute;left:44px;right:44px;top:174px;height:54px;border-bottom:1px solid #E9ECF3;font-size:21px;color:#AAB2C0;display:flex;align-items:center;padding-left:61px}$ .status-header{position:absolute;left:833px}$ .duration-header{position:absolute;right:25px;display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:9px;min-width:166px;justify-content:center}$ .duration-header i{display:flex;align-items:center;font-style:normal;color:#B8A7CE}
      $ .table-body{position:absolute;left:44px;right:44px;top:235px;height:332px}$ .table-row{position:absolute;left:0;top:0;width:1262px;height:80px;background:#FFF;border-bottom:1px solid #EDF0F5;border-radius:12px;display:flex;align-items:center;padding-left:17px;color:#A9B1C0}$ .sort-b{top:84px}$ .sort-c{top:168px}$ .sort-d{top:252px}$ .row-icon{width:35px;display:flex;align-items:center;justify-content:center;margin-right:16px;color:#B39ECE}$ .table-row strong{font-size:27px;font-weight:500;color:#727F93}$ .row-status{position:absolute;left:820px;font-size:21px;background:#F6F2FB;border-radius:8px;padding:6px 12px;color:#AD99C4}$ .row-time{position:absolute;right:43px;font-family:ProjectDisplay,sans-serif;font-size:31px;min-width:85px;text-align:right;color:#8994A9}$ .row-time small{font-family:ProjectSans,sans-serif;font-size:20px;color:#AFB7C5}$ .row-order{position:absolute;right:237px;font-family:ProjectDisplay,sans-serif;font-size:19px;color:#C7CAD3}$ .sort-footer{position:absolute;left:49px;right:49px;bottom:30px;display:flex;justify-content:space-between;align-items:center;font-size:21px;color:#ADB4C1}$ .sort-result{display:flex;align-items:center;gap:10px;color:#9B80BB}
    `);
    s.tl.set(s.q('.sort-window'), { y: 22, opacity: 0 }, 0)
      .set(s.qa('.table-row'), { x: 0, y: 0, scale: 1 }, 0)
      .set(s.q('.duration-header i'), { rotation: 0, opacity: .5 }, 0)
      .set(s.q('.sort-result'), { opacity: 0, y: 6 }, 0)
      .to(s.q('.sort-window'), { y: 0, opacity: 1, duration: .65 }, 0);
    move(s, 1478, 466, .85); click(s, 1478, 466, 1.5);
    s.tl.to(s.q('.duration-header'), { color: '#9876BA', backgroundColor: '#F4EFFA', duration: .25 }, 1.5)
      .to(s.q('.duration-header i'), { opacity: 1, duration: .25 }, 1.5)
      .set(s.q('.sort-state'), { textContent: '按执行用时升序排列' }, 1.7)
      .set(s.qa('.sort-c,.sort-d'), { zIndex: 3 }, 1.75)
      .set(s.qa('.sort-a,.sort-b'), { zIndex: 2 }, 1.75)
      .to(s.qa('.sort-c,.sort-d'), { x: -12, boxShadow: '0 5px 17px #61527609', duration: .2 }, 1.75)
      .to(s.q('.sort-c'), { y: -168, duration: .85, ease: 'power3.inOut' }, 1.9)
      .to(s.q('.sort-d'), { y: -168, duration: .85, ease: 'power3.inOut' }, 2)
      .to(s.q('.sort-a'), { y: 168, duration: .85, ease: 'power3.inOut' }, 1.95)
      .to(s.q('.sort-b'), { y: 168, duration: .85, ease: 'power3.inOut' }, 2.05)
      .to(s.qa('.sort-c,.sort-d'), { x: 0, boxShadow: '0 0 0 #61527600', duration: .3 }, 2.85)
      .set(s.q('.sort-c .row-order'), { textContent: '1' }, 3.15)
      .set(s.q('.sort-d .row-order'), { textContent: '2' }, 3.15)
      .set(s.q('.sort-a .row-order'), { textContent: '3' }, 3.15)
      .set(s.q('.sort-b .row-order'), { textContent: '4' }, 3.15);
    move(s, 1025, 542, 3.55); click(s, 1025, 542, 4.2);
    s.tl.to(s.q('.sort-c'), { backgroundColor: '#F4EFFB', borderColor: '#DFD1EF', duration: .35 }, 4.2)
      .to(s.q('.sort-c .row-time'), { color: '#9473B8', duration: .35 }, 4.2)
      .to(s.q('.sort-result'), { opacity: 1, y: 0, duration: .45 }, 4.55)
      .to(s.q('.fxc-cursor'), { opacity: 0, duration: .35 }, 4.8);
    return finish(s, 8.6);
  });
})();
