/* Deterministic, editable software scenes. Product scenes are illustrative. */
(function () {
  'use strict';

  const CSS = `
  .swfx{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#f7f8fa;color:#17191f;font-family:ProjectSans,sans-serif}
  .swfx *{box-sizing:border-box}.swfx .sw-kicker{position:absolute;top:45px;left:132px;font-size:20px;letter-spacing:3px;color:#85818f;font-weight:600}
  .swfx .sw-heading{position:absolute;left:130px;top:79px;margin:0;font-size:42px;line-height:1.25;font-weight:650;max-width:1630px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-1px}
  .swfx .sw-frame{position:absolute;left:130px;top:159px;width:1660px;height:767px;border:1px solid #e3e5eb;border-radius:26px;background:#fff;overflow:hidden;box-shadow:0 30px 75px #1c253415,0 3px 9px #1c253408;transform-origin:50% 52%}
  .swfx .sw-bar{position:absolute;left:0;right:0;top:0;height:55px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #eceef2;font-size:19px;color:#707582;background:#fbfbfc}
  .swfx .sw-lights{position:absolute;left:24px;top:23px;display:flex;gap:8px}.swfx .sw-lights i{display:block;width:10px;height:10px;border-radius:100%;background:#dadde4}.swfx .sw-lights i:first-child{background:#e4bec0}.swfx .sw-lights i:nth-child(2){background:#e7d7b2}.swfx .sw-lights i:nth-child(3){background:#bcd7c6}
  .swfx .sw-icon{width:24px;height:24px;flex:none;vertical-align:middle;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
  .swfx .sw-sidebar{position:absolute;left:0;top:55px;bottom:0;width:248px;padding:26px 19px;background:#f6f7f9;border-right:1px solid #e8eaf0;font-size:21px;color:#727783}
  .swfx .sw-brand{color:#25272e;font-size:27px;font-weight:680;display:flex;gap:11px;align-items:center;margin:0 6px 26px;letter-spacing:-.5px}
  .swfx .sw-mark{height:33px;width:33px;background:#24272f;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:19px;font-family:ProjectDisplay,sans-serif}
  .swfx .sw-new{height:46px;background:#fff;border:1px solid #dfe2e8;border-radius:11px;padding:10px 12px;display:flex;align-items:center;gap:9px;font-size:20px;color:#393e49;margin-bottom:29px}
  .swfx .sw-navlabel{font-size:17px;color:#9599a3;margin:17px 10px 10px}.swfx .sw-nav{padding:11px 11px;border-radius:10px;font-size:19px;margin:3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .swfx .sw-nav.active{background:#eae4f5;color:#5e438e}.swfx .sw-account{position:absolute;bottom:24px;left:27px;display:flex;gap:11px;align-items:center;font-size:18px;color:#737985}
  .swfx .sw-avatar{height:31px;width:31px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#e4ddee;color:#77619c;font-size:15px;font-weight:700}
  .swfx .sw-pane-title{height:69px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eceef2;padding:0 26px;font-size:23px;font-weight:580}
  .swfx .sw-muted{color:#9ba0ac;font-size:18px;font-weight:400}.swfx .sw-tag{font-size:16px;padding:5px 10px;background:#f1eef7;color:#8668b8;border-radius:7px;font-weight:500}
  .swfx .sw-composer{position:absolute;left:34px;right:34px;bottom:31px;height:116px;border:1.5px solid #dfe2e9;border-radius:19px;padding:17px 22px;background:#fff;box-shadow:0 4px 12px #22283204}
  .swfx .sw-input{font-size:24px;line-height:1.4;min-height:36px;max-width:calc(100% - 28px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .swfx .sw-placeholder{position:absolute;left:22px;top:17px;color:#a0a5ae;font-size:23px}.swfx .sw-composer-meta{position:absolute;left:22px;bottom:13px;font-size:17px;color:#999fa8;display:flex;gap:14px;align-items:center}
  .swfx .sw-send{position:absolute;right:16px;bottom:13px;width:39px;height:39px;display:flex;align-items:center;justify-content:center;background:#22252c;color:white;border-radius:12px}.swfx .sw-send .sw-icon{width:21px;height:21px;stroke-width:2}
  .swfx .sw-prompt{padding:19px 23px;border-radius:17px;background:#f1eef7;font-size:25px;line-height:1.65;color:#34313c}.swfx .sw-answer{font-size:25px;line-height:1.75;color:#323640}
  .swfx .sw-status{display:flex;align-items:center;gap:10px;font-size:20px;color:#818897}.swfx .sw-dot{display:block;width:8px;height:8px;border-radius:50%;background:#9575cf}.swfx .sw-divider{height:1px;background:#eceef2}
  .swfx .sw-file{display:flex;align-items:center;gap:12px;padding:15px 17px;border:1px solid #e5e7ed;border-radius:12px;background:#fff;font-size:20px;color:#4f5663}.swfx .sw-file .sw-icon{color:#8c72b6}
  .swfx .sw-pointer{position:absolute;left:0;top:0;width:43px;height:49px;z-index:80;filter:drop-shadow(0 3px 3px #0e132733);pointer-events:none}
  .swfx .sw-pointer .fx-cursor{position:static;width:43px;height:49px;display:block}.swfx .sw-ring{position:absolute;left:0;top:0;width:60px;height:60px;margin:-30px 0 0 -30px;border:2px solid #aa89e0;border-radius:50%;opacity:0;z-index:79;pointer-events:none}
  .swfx .sw-proof{position:absolute;right:131px;bottom:112px;font-size:18px;letter-spacing:1px;color:#8c919b}.swfx .sw-footnote{position:absolute;left:132px;bottom:112px;font-size:18px;color:#999ca6}
  .swfx .sw-hint{font-size:20px;color:#9095a0}.swfx .sw-check{color:#76b68d}.swfx .sw-green{color:#508b69}.swfx .sw-success{border:1px solid #dfece3;color:#54876a;background:#f4faf6;border-radius:11px;padding:14px 18px;font-size:22px}
  .swfx .sw-sweep{position:absolute;width:90px;top:0;bottom:0;background:linear-gradient(90deg,transparent,#c9b0f540,transparent);transform:skewX(-14deg);pointer-events:none;opacity:0}
  .swfx .sw-dots{display:flex;gap:6px}.swfx .sw-dots i{width:5px;height:5px;background:currentColor;border-radius:50%;display:block}
  `;

  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="m7 10 5-5 5 5M12 5v14"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    file: '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M8 12h8M8 16h6"/>',
    code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    link: '<path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
    folder: '<path d="M3 6h7l2 3h9v11H3zM3 6V4h7l2 3h9v2"/>',
    play: '<path d="m8 4 12 8-12 8z"/>',
    sparkle: '<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6z"/>',
    grip: '<path d="M8 7h.01M16 7h.01M8 12h.01M16 12h.01M8 17h.01M16 17h.01" stroke-width="3"/>',
    chat: '<path d="M4 4h16v12H9l-5 4zM8 8h8M8 12h5"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v12h5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c6 6 6 12 0 18-6-6-6-12 0-18"/>'
  };
  const icon = name => '<svg class="sw-icon" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.file) + '</svg>';
  const lights = '<span class="sw-lights"><i></i><i></i><i></i></span>';
  const e = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function cues(params, defaults) {
    const events = Object.assign({}, defaults);
    if (params.cues && typeof params.cues === 'object') {
      for (const name of Object.keys(defaults)) {
        if (params.cues[name] === undefined) continue;
        const value = Number(params.cues[name]);
        if (!Number.isFinite(value) || value < 0) throw new Error('Invalid cue: ' + name);
        events[name] = value;
      }
    }
    const values = Object.values(events);
    for (let i = 1; i < values.length; i++) {
      if (values[i] < values[i - 1]) throw new Error('Software cues must be in chronological order: ' + Object.keys(events).join(', '));
    }
    return events;
  }

  function mount(ctx, kind, title, kicker, markup, css, proof) {
    ctx.root.innerHTML = '<div class="swfx ' + kind + '"><style>' + CSS + css + '</style>' +
      '<div class="sw-kicker">' + e(kicker) + '</div><h1 class="sw-heading">' + e(title) + '</h1>' + markup +
      '<div class="sw-pointer">' + ctx.cursor() + '</div><div class="sw-ring"></div>' +
      '<div class="sw-footnote">可编排软件演示 · 1920 × 1080</div><div class="sw-proof">' + e(proof || '原创动效 · 界面示意') + '</div></div>';
    const tl = ctx.gsap.timeline({paused: true});
    tl.set(ctx.q('.sw-pointer'), {x: 1040, y: 822, opacity: 0}, 0);
    tl.set(ctx.q('.sw-ring'), {opacity: 0, scale: 0.25}, 0);
    tl.fromTo(ctx.q('.sw-frame'), {y: 25, opacity: 0, scale: 0.985}, {y: 0, opacity: 1, scale: 1, duration: 0.75, ease: 'power3.out'}, 0);
    return tl;
  }

  function point(ctx, tl, x, y, at, duration) {
    tl.to(ctx.q('.sw-pointer'), {x, y, opacity: 1, duration: duration === undefined ? 0.55 : duration, ease: 'power2.inOut'}, Math.max(0, at));
  }
  function tap(ctx, tl, x, y, at) {
    tl.set(ctx.q('.sw-pointer'), {x, y, opacity: 1}, at);
    tl.fromTo(ctx.q('.sw-ring'), {x, y, scale: 0.28, opacity: 0.8}, {x, y, scale: 1.25, opacity: 0, duration: 0.48, ease: 'power2.out', immediateRender: false}, at);
    tl.to(ctx.q('.sw-pointer'), {scale: 0.89, duration: 0.09}, at).to(ctx.q('.sw-pointer'), {scale: 1, duration: 0.15}, at + 0.09);
  }
  function appear(ctx, tl, selector, at, duration, y) {
    tl.fromTo(ctx.q(selector), {opacity: 0, y: y === undefined ? 12 : y}, {opacity: 1, y: 0, duration: duration === undefined ? 0.5 : duration, ease: 'power3.out', immediateRender: false}, at);
  }
  function hideInitially(ctx, tl, selectors) {
    for (const selector of selectors) tl.set(ctx.q(selector), {opacity: 0}, 0);
  }
  function type(ctx, tl, selector, value, start, length) {
    ctx.text(tl, ctx.q(selector), String(value), start, Math.max(0.05, length));
  }
  function end(ctx, tl, time) {
    const duration = Math.max(time, tl.duration());
    tl.to({}, {duration: 0.01}, Math.max(0, duration - 0.01));
    return {timeline: tl, duration};
  }
  function controlCenter(ctx, selector) {
    let element = ctx.q(selector);
    let x = element.offsetWidth / 2;
    let y = element.offsetHeight / 2;
    while (element && element !== ctx.root) {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    }
    return {x, y};
  }
  function controlAt(ctx, tl, selector, at) {
    const previous = tl.time();
    tl.time(at, false);
    const position = controlCenter(ctx, selector);
    tl.time(previous, false);
    return position;
  }

  function sidebar(brand, mark, history, active) {
    return '<aside class="sw-sidebar"><div class="sw-brand"><span class="sw-mark">' + e(mark) + '</span>' + e(brand) + '</div>' +
      '<div class="sw-new">' + icon('plus') + '新建任务</div><div class="sw-navlabel">工作空间</div><div class="sw-nav">' + icon('folder') + '　我的项目</div>' +
      '<div class="sw-navlabel">最近会话</div>' + history.map((item, i) => '<div class="sw-nav' + (i === active ? ' active' : '') + '">' + e(item) + '</div>').join('') +
      '<div class="sw-account"><span class="sw-avatar">Y</span>个人工作空间</div></aside>';
  }
  function composer(placeholder, extras) {
    return '<div class="sw-composer"><div class="sw-placeholder">' + e(placeholder) + '</div><div class="sw-input"></div><div class="sw-composer-meta">' + icon('plus') + e(extras) + '</div><div class="sw-send">' + icon('arrow') + '</div></div>';
  }

  UIFX.register({
    id: 'software-codex-task', title: 'Codex · 从指令到可见成果', category: 'software', duration: 14,
    description: '光标输入需求、发送任务、依次检查与修改文件，再点击预览标签查看成果。',
    tags: ['Codex', '软件操作', '代码生成', '界面示意'], sourceStatus: 'illustrative-product',
    params: {title: '把一句需求，变成可预览的页面', prompt: '创建一个简洁的 AI 工作台首页，支持任务与文件预览。', result: '页面已完成，预览已就绪。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '把一句需求，变成可预览的页面', prompt: '创建一个简洁的 AI 工作台首页，支持任务与文件预览。', result: '页面已完成，预览已就绪。'}, params);
    const c = cues(p, {focus: 0.8, type: 1.4, send: 3.25, execute: 4.0, result: 8.3, read: 10.1});
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + 'ai-workspace　/　Codex</div>' +
      sidebar('Codex', 'C', ['AI 工作台首页', '整理组件样式', '修复导航问题'], 0) +
      '<main class="cx-chat"><div class="sw-pane-title">AI 工作台首页<span class="sw-tag">本地任务</span></div>' +
      '<div class="cx-thread"><div class="cx-user sw-prompt">' + e(p.prompt) + '</div><div class="cx-response"><div class="cx-assistant">' + icon('sparkle') + '<b>Codex</b></div><p class="sw-answer">我会先检查项目结构，再构建页面并准备预览。</p>' +
      '<div class="cx-tools"><div class="cx-tool cx-tool-1">' + icon('search') + '<span>检查项目文件</span><em class="cx-tool-state-1">运行中</em></div><div class="cx-tool cx-tool-2">' + icon('code') + '<span>更新 src / App.tsx</span><em class="cx-tool-state-2">等待</em></div><div class="cx-tool cx-tool-3">' + icon('play') + '<span>构建预览</span><em class="cx-tool-state-3">等待</em></div></div>' +
      '<div class="cx-finish sw-success">' + icon('check') + '　<span>' + e(p.result) + '</span></div></div></div>' + composer('描述你想要完成的任务', '工作区　·　完整访问') + '</main>' +
      '<aside class="cx-output"><div class="cx-tabs"><span class="cx-tab-code">' + icon('code') + ' App.tsx</span><span class="cx-tab-preview">' + icon('play') + ' 预览</span></div>' +
      '<div class="cx-empty">' + icon('code') + '<span>任务运行后，文件会显示在这里</span></div>' +
      '<div class="cx-code"><div class="cx-code-path">src / App.tsx <span>已修改</span></div><div class="cx-code-body"><div class="cx-numbers">1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>10<br>11<br>12<br>13<br>14</div><pre class="cx-code-text"></pre></div><div class="cx-code-bottom">TypeScript React <span>+24 −0</span></div></div>' +
      '<div class="cx-preview"><div class="cx-address"><span>●</span> localhost / preview</div><div class="cx-web"><div class="cx-web-nav"><b>form.</b><span>Workspace　Files　↗</span></div><div class="cx-web-eyebrow">YOUR EVERYDAY AI WORKSPACE</div><h2>Less switching.<br>More creating.</h2><p>把任务、灵感与文件<br>放进同一个工作空间。</p><div class="cx-web-button">开始新任务　↗</div><div class="cx-web-project"><span>' + icon('folder') + '</span><div><strong>我的创作项目</strong><small>所有灵感，在这里开始</small></div><b>↗</b></div></div></div><div class="sw-sweep"></div></aside></section>';
    const css = `
    .swfx.codex .sw-frame{background:#181a1f;border-color:#31343c}.swfx.codex .sw-bar{background:#1b1d22;color:#9ea3af;border-color:#30333a}
    .swfx.codex .sw-sidebar{background:#202228;border-color:#30333a;color:#858b98}.swfx.codex .sw-brand{color:#f3f4f7}.swfx.codex .sw-mark{background:#f0f1f4;color:#1f2229}.swfx.codex .sw-new{background:#292c33;border-color:#3b3e47;color:#c7cbd6}.swfx.codex .sw-nav.active{background:#33303c;color:#cfbce9}.swfx.codex .sw-avatar{background:#35303f;color:#b59bcf}
    .swfx .cx-chat{position:absolute;left:248px;top:55px;bottom:0;width:786px;border-right:1px solid #33363d;color:#e7e9ef}.swfx.codex .sw-pane-title{border-color:#31343b;color:#d4d7e0;font-size:23px}.swfx.codex .sw-tag{background:#302b3b;color:#b59ece}
    .swfx .cx-thread{position:absolute;left:35px;right:35px;top:97px}.swfx .cx-user{margin-left:37px;background:#302d38;color:#e2dbe9;font-size:25px;line-height:1.55;min-height:110px}
    .swfx .cx-response{margin-top:27px}.swfx .cx-assistant{display:flex;gap:10px;align-items:center;font-size:24px;color:#dfe1e7}.swfx .cx-assistant .sw-icon{color:#aa93cc}.swfx .cx-response .sw-answer{font-size:23px;line-height:1.7;color:#aeb5c3;margin:12px 0 18px}.swfx .cx-tools{border-left:2px solid #39333f;margin-left:12px;padding-left:18px}
    .swfx .cx-tool{display:flex;align-items:center;gap:11px;font-size:20px;color:#a7afbf;height:47px}.swfx .cx-tool .sw-icon{width:20px;height:20px}.swfx .cx-tool em{margin-left:auto;font-size:17px;font-style:normal;color:#82778f}
    .swfx .cx-finish{margin-top:15px;font-size:21px;line-height:1.45;background:#222d29;border-color:#34473c;color:#aad0b6;padding:13px 14px}.swfx .cx-finish .sw-icon{width:20px}
    .swfx.codex .sw-composer{background:#24272e;border-color:#42454f;height:111px;bottom:25px}.swfx.codex .sw-input{color:#e3e6ee;font-size:23px}.swfx.codex .sw-send{background:#d8cbe9;color:#292232}.swfx.codex .sw-placeholder{color:#858b96}.swfx.codex .sw-composer-meta{color:#8e94a1;font-size:16px}
    .swfx .cx-output{position:absolute;left:1034px;top:55px;right:0;bottom:0;background:#202329;overflow:hidden}.swfx .cx-tabs{height:69px;border-bottom:1px solid #373a42;display:flex;align-items:stretch;gap:9px;padding:0 18px;font-size:20px;color:#8d94a4}.swfx .cx-tabs>span{display:flex;gap:8px;align-items:center;padding:0 15px;border-bottom:2px solid transparent}.swfx .cx-tab-code{color:#d4cee2;border-bottom-color:#ad8bcf!important}.swfx .cx-tabs .sw-icon{width:20px;height:20px}
    .swfx .cx-empty{position:absolute;top:290px;width:100%;display:flex;align-items:center;flex-direction:column;gap:20px;color:#686f7e;font-size:19px}.swfx .cx-empty .sw-icon{width:50px;height:50px;stroke-width:1}
    .swfx .cx-code{position:absolute;inset:69px 0 0}.swfx .cx-code-path{font-size:19px;color:#80899b;padding:21px 24px;display:flex;justify-content:space-between}.swfx .cx-code-path span{font-size:16px;color:#a290be}.swfx .cx-code-body{display:flex;padding:11px 15px;gap:18px;font-family:ui-monospace,Consolas,monospace;font-size:20px;line-height:1.65;height:520px;max-height:calc(100% - 112px);overflow:hidden}.swfx .cx-numbers{color:#4e576a;text-align:right;width:28px;flex-shrink:0}.swfx .cx-code-text{font:inherit;white-space:pre-wrap;color:#b9acd1;margin:0;max-width:505px;overflow:hidden}.swfx .cx-code-bottom{position:absolute;bottom:0;left:0;right:0;height:42px;border-top:1px solid #343842;color:#7d8799;font-size:16px;padding:10px 20px;display:flex;justify-content:space-between}.swfx .cx-code-bottom span{color:#81b394}
    .swfx .cx-preview{position:absolute;inset:69px 0 0;background:#f9f8f4;color:#272628;overflow:hidden}.swfx .cx-address{height:40px;background:#ececeb;font-size:16px;padding:9px 21px;color:#939197}.swfx .cx-address span{font-size:11px;color:#83a892;margin-right:15px}.swfx .cx-web{padding:29px 37px}.swfx .cx-web-nav{display:flex;justify-content:space-between;align-items:center}.swfx .cx-web-nav b{font-family:ProjectDisplay,sans-serif;font-size:29px}.swfx .cx-web-nav span{font-size:14px;color:#89878c}.swfx .cx-web-eyebrow{font-size:12px;letter-spacing:2px;color:#97918b;margin-top:61px}.swfx .cx-web h2{font-family:ProjectDisplay,sans-serif;font-size:53px;line-height:1.1;letter-spacing:-2px;margin:14px 0 16px}.swfx .cx-web p{font-size:21px;line-height:1.8;color:#7c777d;margin:0 0 22px}.swfx .cx-web-button{display:inline-block;background:#bfb2da;color:#302643;border-radius:11px;padding:12px 23px;font-size:18px}.swfx .cx-web-project{margin-top:30px;padding:17px 20px;background:white;border:1px solid #e7e3e9;border-radius:13px;display:flex;align-items:center;gap:15px}.swfx .cx-web-project>span{display:flex;align-items:center;justify-content:center;background:#ede7f4;border-radius:10px;width:42px;height:42px;color:#9181ab}.swfx .cx-web-project strong{display:block;font-size:19px;font-weight:500}.swfx .cx-web-project small{display:block;font-size:14px;color:#aaa3af;margin-top:5px}.swfx .cx-web-project>b{margin-left:auto;font-size:24px;color:#9685ad}
    `;
    const tl = mount(ctx, 'codex', p.title, 'SOFTWARE / CODEX', html, css, 'Codex · 界面示意');
    hideInitially(ctx, tl, ['.cx-user', '.cx-response', '.cx-tool-2', '.cx-tool-3', '.cx-finish', '.cx-code', '.cx-preview']);
    point(ctx, tl, 695, 809, c.focus - 0.45, 0.45); tap(ctx, tl, 695, 809, c.focus);
    tl.to(ctx.q('.sw-composer'), {borderColor: '#b89bde', boxShadow: '0 0 0 3px #a883d520', duration: 0.2}, c.focus);
    tl.set(ctx.q('.sw-placeholder'), {opacity: 0}, c.type);
    type(ctx, tl, '.sw-input', p.prompt, c.type, Math.max(0.15, c.send - c.type - 0.45));
    const send = controlCenter(ctx, '.sw-send');
    point(ctx, tl, send.x, send.y, c.send - 0.42, 0.42); tap(ctx, tl, send.x, send.y, c.send);
    tl.set(ctx.q('.sw-input'), {textContent: ''}, c.send + 0.04); tl.set(ctx.q('.sw-placeholder'), {opacity: 1}, c.send + 0.04);
    appear(ctx, tl, '.cx-user', c.send + 0.1, 0.42, 18); appear(ctx, tl, '.cx-response', c.execute, 0.45, 9);
    tl.to(ctx.q('.cx-empty'), {opacity: 0, duration: 0.25}, c.execute + 0.35); appear(ctx, tl, '.cx-code', c.execute + 0.55, 0.5, 0);
    const span = c.result - c.execute;
    const editAt = c.execute + span * 0.27;
    const buildAt = c.execute + span * 0.68;
    tl.set(ctx.q('.cx-tool-state-1'), {textContent: '完成', color: '#88bc9a'}, editAt);
    appear(ctx, tl, '.cx-tool-2', editAt, 0.4, 7); tl.set(ctx.q('.cx-tool-state-2'), {textContent: '写入中'}, editAt);
    type(ctx, tl, '.cx-code-text', 'export default function App() {\n  return (\n    <Workspace>\n      <Header brand="form." />\n      <Hero\n        title="More creating."\n      />\n      <TaskComposer />\n      <ProjectList\n        items={projects}\n      />\n    </Workspace>\n  );\n}', editAt + 0.1, Math.max(0.2, buildAt - editAt - 0.2));
    tl.set(ctx.q('.cx-tool-state-2'), {textContent: '完成', color: '#88bc9a'}, buildAt);
    appear(ctx, tl, '.cx-tool-3', buildAt, 0.4, 7); tl.set(ctx.q('.cx-tool-state-3'), {textContent: '构建中'}, buildAt);
    tl.set(ctx.q('.cx-tool-state-3'), {textContent: '就绪', color: '#88bc9a'}, c.result); appear(ctx, tl, '.cx-finish', c.result, 0.45, 9);
    const previewAt = c.read - 0.5;
    const preview = controlCenter(ctx, '.cx-tab-preview');
    point(ctx, tl, preview.x, preview.y, previewAt - 0.55, 0.55); tap(ctx, tl, preview.x, preview.y, previewAt);
    tl.to(ctx.q('.cx-tab-code'), {color: '#8d94a4', duration: 0.2}, previewAt);
    tl.to(ctx.q('.cx-tab-preview'), {color: '#dfd0f0', backgroundColor: '#2d2836', duration: 0.2}, previewAt);
    tl.to(ctx.q('.cx-code'), {opacity: 0, duration: 0.25}, previewAt + 0.1); appear(ctx, tl, '.cx-preview', previewAt + 0.1, 0.55, 12);
    tl.fromTo(ctx.q('.sw-sweep'), {x: -120, opacity: 0}, {x: 700, opacity: 0.85, duration: 0.85, ease: 'power2.inOut', immediateRender: false}, c.read);
    tl.fromTo(ctx.q('.sw-sweep'), {opacity: 0.85}, {opacity: 0, duration: 0.15, immediateRender: false}, c.read + 0.85);
    point(ctx, tl, 1161, 864, c.read + 0.65, 0.7);
    return end(ctx, tl, Math.max(14, c.read + 3.5));
  });

  UIFX.register({
    id: 'software-doubao-answer', title: '豆包 · 对话变为文档', category: 'software', duration: 14,
    description: '输入创作问题并发送，回答逐字生成，点击生成文档后在同一窗口展开可阅读的成果。',
    tags: ['豆包', '流式回答', '文档展开', '界面示意'], sourceStatus: 'illustrative-product',
    params: {title: '从一次提问，到一份清楚的创作提纲', prompt: '帮我写一份 AI 工具视频提纲，分成开场、演示和总结。', result: '开场用结果抓住注意力；演示保留真实操作；最后回到观众可以采取的行动。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '从一次提问，到一份清楚的创作提纲', prompt: '帮我写一份 AI 工具视频提纲，分成开场、演示和总结。', result: '开场用结果抓住注意力；演示保留真实操作；最后回到观众可以采取的行动。'}, params);
    const c = cues(p, {focus: 0.8, type: 1.3, send: 3.2, execute: 3.9, result: 8.2, read: 10.0});
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + '豆包　/　创作助手</div>' +
      sidebar('豆包', '豆', ['AI 工具视频提纲', '镜头节奏建议', '整理创作灵感'], 0) +
      '<main class="db-chat"><div class="sw-pane-title">AI 工具视频提纲<span class="sw-muted">···</span></div><div class="db-thread"><div class="db-user sw-prompt">' + e(p.prompt) + '</div><div class="db-response"><div class="db-assistant"><span>豆</span><b>豆包</b></div><div class="db-thinking sw-status"><i class="sw-dot"></i><span>正在整理内容</span></div><div class="db-answer sw-answer"></div><div class="db-outline"><div><b>01</b><span>开场 · 让结果先说话</span></div><div><b>02</b><span>演示 · 操作过程看得见</span></div><div><b>03</b><span>总结 · 给观众一个行动</span></div></div><div class="db-document-button">' + icon('file') + '<div><strong>AI 工具视频提纲</strong><small>展开文档，继续完善内容</small></div>' + icon('chevron') + '</div><div class="db-answer-tools">' + icon('copy') + '　重新生成　 ·　继续提问</div></div></div>' + composer('向豆包提问', '深度思考　 ·　联网搜索') + '</main>' +
      '<aside class="db-doc"><div class="db-doc-toolbar"><span>' + icon('file') + ' 创作提纲</span><span>↗　···</span></div><div class="db-page"><div class="db-doc-chip">创作草稿</div><h2>AI 工具视频提纲</h2><div class="db-doc-meta">结构化内容 · 可继续编辑</div><div class="db-doc-divider"></div><section><em>01</em><div><h3>开场：先展示结果</h3><p>用一个清楚的成果画面，让观众立刻知道这条视频会解决什么问题。</p></div></section><section><em>02</em><div><h3>演示：呈现关键操作</h3><p>输入需求 → 执行任务 → 检查结果。镜头跟随操作的重点移动。</p></div></section><section><em>03</em><div><h3>总结：留下行动入口</h3><p>用一句话总结方法，再给观众一个可以立即尝试的步骤。</p></div></section><div class="db-doc-ready">' + icon('check') + ' 已生成文档</div></div><div class="sw-sweep"></div></aside></section>';
    const css = `
    .swfx.doubao .sw-mark{background:#e3efff;color:#6c91ba;font-family:ProjectSans,sans-serif;font-size:19px}.swfx.doubao .sw-nav.active{background:#e8eef6;color:#567596}.swfx.doubao .sw-send{background:#5a8fc9}.swfx.doubao .sw-sidebar{background:#f4f6f8}
    .swfx .db-chat{position:absolute;left:248px;top:55px;bottom:0;width:1412px;background:white}.swfx .db-thread{position:absolute;left:88px;right:88px;top:103px}.swfx .db-user{max-width:810px;margin-left:auto;background:#edf3fa;color:#32445b;font-size:25px;line-height:1.6}
    .swfx .db-response{margin-top:23px}.swfx .db-assistant{display:flex;align-items:center;gap:12px;font-size:23px;color:#3f4e62}.swfx .db-assistant>span{height:31px;width:31px;border-radius:10px;background:#e5eef9;display:flex;align-items:center;justify-content:center;font-size:17px;color:#6d8eaf}.swfx .db-assistant b{font-weight:500}.swfx .db-thinking{margin:16px 0 10px;font-size:19px}.swfx .db-thinking .sw-dot{background:#7c9ec6}.swfx .db-answer{margin-top:15px;max-width:1110px;min-height:88px;font-size:25px;line-height:1.8}
    .swfx .db-outline{margin:15px 0 18px;display:flex;gap:10px;flex-wrap:wrap}.swfx .db-outline>div{display:flex;gap:9px;align-items:center;color:#56677e;font-size:19px;border:1px solid #e5ebf2;padding:11px 13px;border-radius:10px;background:#fafcfe}.swfx .db-outline b{color:#92a5be;font-size:17px;font-weight:500}
    .swfx .db-document-button{max-width:600px;display:flex;align-items:center;gap:16px;padding:17px 20px;border:1px solid #dce5ef;border-radius:14px;background:#f8fafc;color:#7691b2}.swfx .db-document-button>div{flex:1}.swfx .db-document-button strong{display:block;font-size:22px;color:#3d4e67;font-weight:500}.swfx .db-document-button small{display:block;font-size:17px;color:#9ba9ba;margin-top:5px}.swfx .db-answer-tools{font-size:16px;color:#a4aebd;margin-top:20px}.swfx .db-answer-tools .sw-icon{width:17px;height:17px}.swfx.doubao .sw-composer{left:87px;right:87px;bottom:28px}
    .swfx .db-thread{top:90px}.swfx .db-user{padding:16px 20px;font-size:24px;line-height:1.55}.swfx .db-response{margin-top:17px}.swfx .db-thinking{height:28px;line-height:28px}.swfx .db-answer{font-size:23px;line-height:1.7;min-height:78px}.swfx .db-outline{overflow:hidden}.swfx .db-outline>div{font-size:17px;padding:8px 10px}.swfx .db-outline b{font-size:15px}.swfx .db-document-button{padding:13px 17px}.swfx .db-document-button strong{font-size:21px}.swfx .db-document-button small{font-size:16px}.swfx .db-answer-tools{display:none}
    .swfx .db-doc{position:absolute;left:1093px;top:55px;bottom:0;width:567px;border-left:1px solid #e3e7ed;background:#fafbfc;overflow:hidden;transform-origin:right center}.swfx .db-doc-toolbar{height:69px;padding:0 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e8ecf1;font-size:20px;color:#6c7f94}.swfx .db-doc-toolbar>span:first-child{display:flex;align-items:center;gap:8px}.swfx .db-doc-toolbar>span:last-child{font-size:20px;color:#9da9b7}
    .swfx .db-page{margin:25px 25px 0;padding:28px 27px 24px;border:1px solid #e6eaf0;background:white;border-radius:13px;box-shadow:0 5px 15px #44556d05}.swfx .db-doc-chip{font-size:15px;color:#9aa8ba;letter-spacing:1px}.swfx .db-page h2{font-size:29px;font-weight:620;color:#33445b;margin:12px 0 7px;line-height:1.4}.swfx .db-doc-meta{font-size:15px;color:#a5afbd}.swfx .db-doc-divider{height:1px;background:#edf0f4;margin:22px 0}.swfx .db-page section{display:flex;gap:14px;margin-bottom:23px}.swfx .db-page section em{font-family:ProjectDisplay,sans-serif;color:#b3c3d5;font-size:21px;font-style:normal;line-height:1.8}.swfx .db-page h3{font-size:21px;font-weight:570;margin:0 0 8px;color:#495a70}.swfx .db-page p{font-size:19px;line-height:1.8;color:#8b97a7;margin:0}.swfx .db-doc-ready{font-size:17px;color:#78a186;display:flex;align-items:center;gap:8px;margin-top:9px}.swfx .db-doc-ready .sw-icon{width:19px;height:19px}
    `;
    const tl = mount(ctx, 'doubao', p.title, 'SOFTWARE / DOUBAO', html, css, '豆包 · 界面示意');
    hideInitially(ctx, tl, ['.db-user', '.db-response', '.db-outline', '.db-document-button', '.db-answer-tools', '.db-doc']);
    tl.set(ctx.q('.db-doc'), {x: 567}, 0);
    point(ctx, tl, 751, 816, c.focus - 0.45, 0.45); tap(ctx, tl, 751, 816, c.focus);
    tl.to(ctx.q('.sw-composer'), {borderColor: '#9eb9da', boxShadow: '0 0 0 3px #9eb9da15', duration: 0.2}, c.focus);
    tl.set(ctx.q('.sw-placeholder'), {opacity: 0}, c.type); type(ctx, tl, '.sw-input', p.prompt, c.type, Math.max(0.2, c.send - c.type - 0.4));
    const send = controlCenter(ctx, '.sw-send');
    point(ctx, tl, send.x, send.y, c.send - 0.45, 0.45); tap(ctx, tl, send.x, send.y, c.send);
    tl.set(ctx.q('.sw-input'), {textContent: ''}, c.send + 0.05); tl.set(ctx.q('.sw-placeholder'), {opacity: 1}, c.send + 0.05);
    appear(ctx, tl, '.db-user', c.send + 0.1, 0.45, 17); appear(ctx, tl, '.db-response', c.execute, 0.4, 8);
    tl.to(ctx.q('.db-thinking'), {height: 0, marginTop: 0, marginBottom: 0, opacity: 0, duration: 0.35}, c.execute + 0.65);
    type(ctx, tl, '.db-answer', p.result, c.execute + 0.7, Math.max(0.3, c.result - c.execute - 1.6));
    appear(ctx, tl, '.db-outline', c.result - 0.75, 0.45, 8); appear(ctx, tl, '.db-document-button', c.result, 0.45, 10); appear(ctx, tl, '.db-answer-tools', c.result + 0.2, 0.4, 0);
    const openAt = c.read - 0.8;
    const documentButton = controlAt(ctx, tl, '.db-document-button', openAt - 0.05);
    point(ctx, tl, documentButton.x, documentButton.y, openAt - 0.55, 0.55); tap(ctx, tl, documentButton.x, documentButton.y, openAt);
    tl.to(ctx.q('.db-document-button'), {borderColor: '#91acce', backgroundColor: '#edf4fb', duration: 0.2}, openAt);
    tl.to(ctx.q('.db-chat'), {width: 845, duration: 0.75, ease: 'power3.inOut'}, openAt + 0.08);
    tl.to(ctx.q('.db-thread'), {left: 38, right: 38, duration: 0.75, ease: 'power3.inOut'}, openAt + 0.08);
    tl.to(ctx.q('.sw-composer'), {left: 37, right: 37, duration: 0.75, ease: 'power3.inOut'}, openAt + 0.08);
    tl.to(ctx.q('.db-outline'), {height: 0, marginTop: 0, marginBottom: 0, opacity: 0, duration: 0.45}, openAt + 0.08);
    tl.to(ctx.q('.db-doc'), {x: 0, opacity: 1, duration: 0.75, ease: 'power3.inOut'}, openAt + 0.08);
    tl.fromTo(ctx.q('.sw-sweep'), {x: -90, opacity: 0}, {x: 650, opacity: 0.65, duration: 0.9, ease: 'power2.inOut', immediateRender: false}, c.read + 0.05); tl.fromTo(ctx.q('.sw-sweep'), {opacity: 0.65}, {opacity: 0, duration: 0.2, immediateRender: false}, c.read + 0.95);
    point(ctx, tl, 1143, 882, c.read + 0.4, 0.55);
    return end(ctx, tl, Math.max(14, c.read + 3.5));
  });

  UIFX.register({
    id: 'software-workbuddy-flow', title: 'WorkBuddy · 计划执行与文件交付', category: 'software', duration: 14,
    description: '在专属任务导航中提交需求，四项任务逐步完成并折叠，执行日志接续产出链接，点击文件展开正文。',
    tags: ['WorkBuddy', '计划执行', '文件成果', '界面示意'], source: 'https://www.codebuddy.ai/docs/zh/workbuddy/Results', sourceStatus: 'illustrative-product',
    params: {title: '让一项工作，从计划走到交付', prompt: '整理这周的项目资料，生成一份可以直接查看的周报。', result: '周报已整理完成，包含进展、问题和下一步。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '让一项工作，从计划走到交付', prompt: '整理这周的项目资料，生成一份可以直接查看的周报。', result: '周报已整理完成，包含进展、问题和下一步。'}, params);
    const c = cues(p, {focus: 0.8, type: 1.3, send: 3.1, execute: 3.85, result: 8.5, read: 10.2});
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + 'WorkBuddy　/　本周项目周报</div>' +
      '<aside class="sw-sidebar wb-sidebar"><div class="sw-brand"><span class="wb-brand-symbol">' + icon('sparkle') + '</span>WorkBuddy</div><div class="wb-search-nav">' + icon('search') + '搜索任务<span>⌘ K</span></div><div class="sw-new">' + icon('plus') + '新建任务</div><div class="wb-navigation"><div>' + icon('chat') + 'Claw</div><div>' + icon('globe') + '专家</div><div>' + icon('sparkle') + '技能</div><div>' + icon('code') + '插件</div><div>' + icon('play') + '自动化</div></div><div class="wb-task-tabs"><span>任务</span><span>工作空间</span></div><div class="wb-task active"><strong>本周项目周报</strong><small class="wb-sidebar-status">新任务</small></div><div class="wb-task"><strong>整理会议记录</strong><small>昨天</small></div><div class="wb-task"><strong>更新项目清单</strong><small>昨天</small></div><div class="sw-account"><span class="sw-avatar">Y</span>个人工作空间</div></aside>' +
      '<main class="wb-main"><div class="sw-pane-title">本周项目周报<span class="sw-tag">工作任务</span></div><div class="wb-thread"><div class="wb-user sw-prompt">' + e(p.prompt) + '</div><div class="wb-response"><div class="wb-response-name"><span class="wb-response-symbol">' + icon('sparkle') + '</span>WorkBuddy</div><p>我会读取资料，归纳进展，再生成周报。</p></div><div class="wb-plan"><div class="wb-plan-head"><span class="wb-plan-toggle">' + icon('chevron') + '</span><span>任务列表</span><small class="wb-count">0 / 4</small></div><div class="wb-plan-body">' +
      '<div class="wb-step wb-step-1"><span class="wb-step-dot">1</span><div><strong>读取项目资料</strong><small>项目清单 · 会议记录 · 待办事项</small></div><em class="wb-step-status-1">准备执行</em></div>' +
      '<div class="wb-step wb-step-2"><span class="wb-step-dot">2</span><div><strong>归纳本周进展</strong><small>提取已完成内容与进行中的工作</small></div><em class="wb-step-status-2">等待</em></div>' +
      '<div class="wb-step wb-step-3"><span class="wb-step-dot">3</span><div><strong>整理风险与下一步</strong><small>保留问题与对应的后续行动</small></div><em class="wb-step-status-3">等待</em></div>' +
      '<div class="wb-step wb-step-4"><span class="wb-step-dot">4</span><div><strong>生成项目周报</strong><small>写入文档并准备预览</small></div><em class="wb-step-status-4">等待</em></div></div><div class="wb-progress"><span></span></div></div>' +
      '<div class="wb-log">' + icon('folder') + '<span class="wb-log-text">等待任务开始</span></div><div class="wb-finish sw-success">' + icon('check') + '<span>' + e(p.result) + '</span></div><div class="wb-produced-link">' + icon('file') + '<span>项目周报.md</span><small>查看产物　↗</small></div></div>' + composer('把想完成的工作交给我', 'Craft　⌄　　Auto　⌄　　Skills') + '</main>' +
      '<aside class="wb-files"><div class="sw-pane-title">产物<span class="sw-muted wb-file-count">0 个文件</span></div><div class="wb-file-tabs"><span>产物</span>全部文件　变更　预览</div><div class="wb-empty">' + icon('folder') + '<p>任务产出的文件<br>会汇集在这里</p></div><div class="wb-created"><div class="wb-file-chip sw-file">' + icon('file') + '<div><strong>项目周报.md</strong><small>刚刚生成 · 点击预览</small></div><span>↗</span></div></div>' +
      '<article class="wb-doc"><div class="wb-doc-path">项目周报.md<span>Markdown</span></div><div class="wb-doc-inner"><div class="wb-doc-eyebrow">WEEKLY UPDATE</div><h2>每一步，都有进展。</h2><p class="wb-doc-sub">项目周报 / 本周进展</p><div class="wb-metrics"><div><strong>03</strong><span>重点进展</span></div><div><strong>01</strong><span>待跟进问题</span></div></div><h3>本周完成</h3><p>页面结构已经确认，核心组件完成首轮搭建，资料归档已同步。</p><h3>下一步行动</h3><div class="wb-doc-task">' + icon('check') + ' 校对交付内容</div><div class="wb-doc-task">' + icon('check') + ' 确认下周优先事项</div><div class="wb-doc-stamp">来源资料已整理 · 可继续编辑</div></div></article><div class="sw-sweep"></div></aside></section>';
    const css = `
    .swfx.workbuddy .sw-brand{font-size:25px;margin:0 4px 20px;gap:8px;color:#303831}.swfx.workbuddy .sw-send{background:#577463}.swfx.workbuddy .sw-sidebar{background:#f4f5f6;border-color:#e3e6e5;padding:25px 17px}.swfx .wb-brand-symbol{display:flex;align-items:center;justify-content:center;color:#52aa78;width:29px;height:32px}.swfx .wb-brand-symbol .sw-icon{width:27px;height:27px;stroke-width:2}.swfx .wb-search-nav{display:flex;align-items:center;gap:9px;height:35px;font-size:18px;color:#878e8a;padding:0 10px;margin-bottom:9px}.swfx .wb-search-nav .sw-icon{width:18px;height:18px}.swfx .wb-search-nav>span{font-size:12px;margin-left:auto;color:#abb1ad}.swfx .wb-sidebar .sw-new{height:41px;font-size:18px;margin-bottom:13px;border-color:#dce2df}.swfx .wb-navigation{padding-bottom:14px;border-bottom:1px solid #e4e8e6}.swfx .wb-navigation>div{display:flex;align-items:center;gap:12px;height:36px;padding:0 11px;font-size:19px;color:#707972}.swfx .wb-navigation .sw-icon{width:19px;height:19px;color:#9aa59e}.swfx .wb-task-tabs{display:flex;gap:20px;font-size:16px;color:#aab2ad;padding:18px 11px 11px}.swfx .wb-task-tabs>span:first-child{color:#667b6e}.swfx .wb-task{padding:11px 12px;border-radius:9px;margin:3px 0}.swfx .wb-task.active{background:#e5ebe7}.swfx .wb-task strong{font-size:18px;font-weight:450;color:#738278;display:block}.swfx .wb-task small{font-size:12px;color:#acb7af;display:block;margin-top:6px}.swfx .wb-sidebar .sw-account{left:24px;font-size:16px}.swfx .wb-sidebar .sw-avatar{background:#e0e8e3;color:#859b8b}
    .swfx .wb-main{position:absolute;left:248px;top:55px;bottom:0;width:813px;border-right:1px solid #e8e6ed}.swfx .wb-thread{position:absolute;left:34px;right:34px;top:95px}.swfx .wb-user{font-size:25px;line-height:1.6;margin-left:38px}.swfx .wb-plan{margin-top:23px;border:1px solid #e7e2ec;border-radius:15px;overflow:hidden;background:#fdfcfe}.swfx .wb-plan-head{height:55px;padding:0 19px;display:flex;align-items:center;gap:10px;font-size:21px;border-bottom:1px solid #ece7f1;color:#776689}.swfx .wb-count{margin-left:auto;font-size:17px;color:#a297af}
    .swfx .wb-step{position:relative;padding:13px 18px;display:flex;align-items:center;gap:13px;border-bottom:1px solid #efedf3;height:79px}.swfx .wb-step-dot{width:29px;height:29px;border-radius:50%;border:1px solid #d8d1e1;display:flex;align-items:center;justify-content:center;font-size:16px;color:#afa4bd;background:white;flex:none}.swfx .wb-step strong{font-size:22px;font-weight:500;color:#797081;display:block}.swfx .wb-step small{font-size:16px;color:#aca4b5;display:block;margin-top:6px}.swfx .wb-step em{margin-left:auto;font-style:normal;font-size:16px;color:#aaa0b7}.swfx .wb-progress{height:3px;background:#f2eef7}.swfx .wb-progress span{display:block;width:0;height:100%;background:#9f88be}
    .swfx .wb-log{display:flex;align-items:center;gap:9px;font-size:17px;color:#a197ad;margin:16px 0 0 5px}.swfx .wb-log .sw-icon{width:19px;height:19px}.swfx .wb-finish{position:absolute;top:406px;left:0;right:0;font-size:20px;line-height:1.6;padding:12px 14px;background:#f7f4fb;border-color:#e2d9ed;color:#7b639a}.swfx.workbuddy .sw-composer{bottom:25px;height:105px}.swfx.workbuddy .sw-composer-meta{font-size:16px}
    .swfx .wb-thread{top:88px}.swfx .wb-user{padding:15px 19px;font-size:22px;line-height:1.6;min-height:74px;background:#f3f5f4;color:#5d6961}.swfx .wb-response{margin-top:16px}.swfx .wb-response-name{display:flex;align-items:center;gap:9px;height:26px;line-height:26px;font-size:21px;font-weight:550;color:#536458}.swfx .wb-response-symbol{display:flex;color:#76a287}.swfx .wb-response-symbol .sw-icon{width:21px;height:21px}.swfx .wb-response p{font-size:21px;line-height:32px;color:#87958c;margin:7px 0 0}.swfx .wb-plan{margin-top:16px;border-color:#e1e7e3;background:#fff}.swfx .wb-plan-head{height:44px;color:#7a8c80;border-color:#e7ece9;font-size:19px;padding:0 16px}.swfx .wb-plan-toggle{display:flex;align-items:center;justify-content:center;transform:rotate(90deg);height:22px;width:22px;color:#a0b0a6}.swfx .wb-plan-toggle .sw-icon{width:17px;height:17px}.swfx .wb-plan-body{height:196px;overflow:hidden}.swfx .wb-count{font-size:15px;color:#9aafa1}.swfx .wb-step{height:49px;padding:5px 17px;border-color:#edf0ee;gap:11px}.swfx .wb-step-dot{width:24px;height:24px;font-size:13px;border-color:#dce5df;color:#a5b6ab}.swfx .wb-step strong{font-size:19px;line-height:22px;color:#728178}.swfx .wb-step small{font-size:13px;line-height:16px;margin-top:2px;color:#b0bdb4}.swfx .wb-step em{font-size:14px;color:#a8b8ae}.swfx .wb-progress{background:#f0f5f2}.swfx .wb-progress span{background:#92b8a0}.swfx .wb-log{margin-top:12px;height:25px;line-height:25px;color:#a1b0a6;font-size:16px}.swfx .wb-finish{position:relative;top:auto;left:auto;right:auto;margin-top:12px;display:flex;align-items:center;gap:10px;font-size:20px;line-height:30px;padding:12px 14px;background:#f7faf8;border-color:#e1ebe5;color:#829f8d}.swfx .wb-produced-link{display:flex;align-items:center;gap:10px;margin:12px 0 0 4px;color:#6c957e;font-size:19px;line-height:27px;height:27px}.swfx .wb-produced-link .sw-icon{width:19px;height:19px}.swfx .wb-produced-link>small{font-size:14px;color:#a5bcae;margin-left:9px}.swfx .wb-file-tabs{position:absolute;top:76px;left:29px;font-size:13px;color:#b4a4c2;line-height:17px}.swfx .wb-file-tabs>span{color:#9476b0;margin-right:16px}
    .swfx .wb-files{position:absolute;left:1061px;right:0;top:55px;bottom:0;background:#fbfafc;overflow:hidden}.swfx .wb-files .sw-pane-title{font-size:22px}.swfx .wb-empty{position:absolute;top:272px;width:100%;display:flex;align-items:center;flex-direction:column;color:#b8afc3;text-align:center;font-size:22px;line-height:1.8}.swfx .wb-empty .sw-icon{width:57px;height:57px;stroke-width:1}.swfx .wb-created{position:absolute;left:26px;right:26px;top:96px}.swfx .wb-file-chip{padding:19px 20px;color:#9c85b8}.swfx .wb-file-chip>.sw-icon{width:36px;height:36px}.swfx .wb-file-chip>div{flex:1}.swfx .wb-file-chip strong{display:block;font-size:23px;color:#685379;font-weight:550}.swfx .wb-file-chip small{display:block;font-size:16px;color:#ac9eba;margin-top:6px}.swfx .wb-file-chip>span{font-size:26px}
    .swfx .wb-doc{position:absolute;left:24px;right:24px;top:209px;bottom:23px;border:1px solid #e8e2ef;background:white;border-radius:14px;overflow:hidden;box-shadow:0 5px 20px #50357306}.swfx .wb-doc-path{height:47px;display:flex;justify-content:space-between;align-items:center;padding:0 19px;background:#fcfbfd;color:#8c7e9b;font-size:17px;border-bottom:1px solid #eee8f3}.swfx .wb-doc-path span{font-size:14px;color:#b4a8c1}.swfx .wb-doc-inner{padding:25px 30px}.swfx .wb-doc-eyebrow{font-size:12px;letter-spacing:3px;color:#ae9abd}.swfx .wb-doc h2{font-size:31px;line-height:1.3;font-weight:630;margin:12px 0 6px;color:#4f3c62}.swfx .wb-doc-sub{font-size:16px!important;margin:0!important;color:#b0a2bd!important}.swfx .wb-metrics{display:flex;gap:55px;margin:19px 0 18px;padding-bottom:14px;border-bottom:1px solid #eee8f3}.swfx .wb-metrics strong{display:inline-block;font-size:31px;color:#8e71ad;font-family:ProjectDisplay,sans-serif;margin-right:9px}.swfx .wb-metrics span{font-size:16px;color:#a195ae}.swfx .wb-doc h3{font-size:19px;font-weight:560;color:#8b769f;margin:12px 0 7px}.swfx .wb-doc p{font-size:18px;line-height:1.7;color:#a79aaf;margin:0}.swfx .wb-doc-task{display:flex;align-items:center;gap:9px;color:#94849f;font-size:17px;margin:9px 0}.swfx .wb-doc-task .sw-icon{width:17px;height:17px;color:#a491b8}.swfx .wb-doc-stamp{font-size:13px;color:#c0b4ca;margin-top:16px}
    `;
    const tl = mount(ctx, 'workbuddy', p.title, 'SOFTWARE / WORKBUDDY', html, css, 'WorkBuddy · 界面示意（精简重排）');
    hideInitially(ctx, tl, ['.wb-user', '.wb-response', '.wb-plan', '.wb-log', '.wb-finish', '.wb-produced-link', '.wb-created', '.wb-doc']);
    point(ctx, tl, 758, 815, c.focus - 0.45, 0.45); tap(ctx, tl, 758, 815, c.focus);
    tl.to(ctx.q('.sw-composer'), {borderColor: '#b9a3ce', boxShadow: '0 0 0 3px #b9a3ce15', duration: 0.2}, c.focus);
    tl.set(ctx.q('.sw-placeholder'), {opacity: 0}, c.type); type(ctx, tl, '.sw-input', p.prompt, c.type, Math.max(0.2, c.send - c.type - 0.4));
    const send = controlCenter(ctx, '.sw-send');
    point(ctx, tl, send.x, send.y, c.send - 0.45, 0.45); tap(ctx, tl, send.x, send.y, c.send);
    tl.set(ctx.q('.sw-input'), {textContent: ''}, c.send + 0.05); tl.set(ctx.q('.sw-placeholder'), {opacity: 1}, c.send + 0.05);
    appear(ctx, tl, '.wb-user', c.send + 0.1, 0.4, 15); appear(ctx, tl, '.wb-response', c.execute - 0.1, 0.4, 7); appear(ctx, tl, '.wb-plan', c.execute, 0.5, 12); appear(ctx, tl, '.wb-log', c.execute + 0.15, 0.4, 0);
    tl.set(ctx.q('.wb-sidebar-status'), {textContent: '执行中'}, c.execute);
    const stepDuration = (c.result - c.execute) / 4;
    ['读取项目清单与会议记录…', '正在归纳本周项目进展…', '正在整理风险与下一步行动…', '正在写入 项目周报.md…'].forEach((log, i) => {
      const t = c.execute + i * stepDuration;
      tl.set(ctx.q('.wb-log-text'), {textContent: log}, t);
      tl.set(ctx.q('.wb-step-status-' + (i + 1)), {textContent: '执行中', color: '#82a58f'}, t);
      tl.to(ctx.q('.wb-step-' + (i + 1)), {backgroundColor: '#f4f8f5', duration: 0.2}, t);
      tl.to(ctx.q('.wb-step-' + (i + 1) + ' .wb-step-dot'), {borderColor: '#a2bcac', color: '#8dac99', duration: 0.2}, t);
      const done = c.execute + (i + 1) * stepDuration;
      tl.set(ctx.q('.wb-step-status-' + (i + 1)), {textContent: '已完成', color: '#81a38c'}, done);
      tl.set(ctx.q('.wb-step-' + (i + 1) + ' .wb-step-dot'), {textContent: '✓'}, done);
      tl.to(ctx.q('.wb-step-' + (i + 1)), {backgroundColor: '#fff', duration: 0.25}, done);
      tl.set(ctx.q('.wb-count'), {textContent: (i + 1) + ' / 4'}, done);
      tl.to(ctx.q('.wb-progress span'), {width: ((i + 1) * 100 / 4) + '%', duration: stepDuration, ease: 'none'}, t);
    });
    tl.set(ctx.q('.wb-log-text'), {textContent: '已写入 项目周报.md · 等待查看'}, c.result);
    tl.set(ctx.q('.wb-sidebar-status'), {textContent: '已完成'}, c.result);
    const collapseAt = c.result + 0.24;
    const planToggle = controlCenter(ctx, '.wb-plan-toggle');
    point(ctx, tl, planToggle.x, planToggle.y, collapseAt - 0.35, 0.35); tap(ctx, tl, planToggle.x, planToggle.y, collapseAt);
    tl.fromTo(ctx.q('.wb-plan-body'), {height: 196}, {height: 0, duration: 0.45, ease: 'power2.inOut', immediateRender: false}, collapseAt);
    tl.to(ctx.q('.wb-plan-toggle'), {rotation: 0, duration: 0.3}, collapseAt);
    appear(ctx, tl, '.wb-finish', collapseAt + 0.3, 0.4, 8); appear(ctx, tl, '.wb-produced-link', collapseAt + 0.5, 0.35, 5);
    tl.to(ctx.q('.wb-empty'), {opacity: 0, duration: 0.3}, c.result); appear(ctx, tl, '.wb-created', c.result + 0.1, 0.55, 16); tl.set(ctx.q('.wb-file-count'), {textContent: '1 个文件'}, c.result + 0.1);
    const openAt = c.read - 0.65;
    const file = controlCenter(ctx, '.wb-file-chip');
    point(ctx, tl, file.x, file.y, openAt - 0.6, 0.6); tap(ctx, tl, file.x, file.y, openAt);
    tl.to(ctx.q('.wb-file-chip'), {borderColor: '#bea5d9', backgroundColor: '#faf7ff', duration: 0.2}, openAt);
    appear(ctx, tl, '.wb-doc', openAt + 0.12, 0.55, 16);
    tl.fromTo(ctx.q('.sw-sweep'), {x: -100, opacity: 0}, {x: 680, opacity: 0.8, duration: 0.9, immediateRender: false}, c.read); tl.fromTo(ctx.q('.sw-sweep'), {opacity: 0.8}, {opacity: 0, duration: 0.15, immediateRender: false}, c.read + 0.9);
    point(ctx, tl, 1154, 885, c.read + 0.6, 0.6);
    return end(ctx, tl, Math.max(14, c.read + 3.4));
  });

  UIFX.register({
    id: 'ai-workflow-nodes', title: 'AI 流程 · 连线传播与分支折叠', category: 'ai', duration: 14,
    description: '点击运行后数据沿连线传递，检索与整理分支逐步点亮，完成的分支折叠成一个可交付结果。',
    tags: ['AI Flow', '节点', '分支', '执行链'], sourceStatus: 'original-extension',
    params: {title: '看见 AI 怎样一步步完成任务', prompt: '整理输入资料，并形成有来源的结论', result: '一份可继续使用的报告'}
  }, function (ctx, params) {
    const p = Object.assign({title: '看见 AI 怎样一步步完成任务', prompt: '整理输入资料，并形成有来源的结论', result: '一份可继续使用的报告'}, params);
    const c = cues(p, {focus: 0.8, type: 1.1, send: 3.05, execute: 3.65, merge: 8.2, result: 9.5, read: 10.4});
    const node = (cls, symbol, overline, title, detail) => '<div class="wf-node ' + cls + '"><div class="wf-node-top">' + icon(symbol) + '<span>' + e(overline) + '</span><i></i></div><strong>' + e(title) + '</strong><small>' + e(detail) + '</small><div class="wf-node-progress"><span></span></div></div>';
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + 'AI Flow　/　资料到结论</div><div class="wf-toolbar"><span>' + icon('folder') + ' 资料处理工作流</span><div><span class="wf-run-state">就绪</span><b class="wf-run">' + icon('play') + ' 运行流程</b></div></div><div class="wf-canvas"><svg class="wf-lines" viewBox="0 0 1660 590"><path class="wf-line wf-l1" d="M450 280 C550 280 530 150 650 150"/><path class="wf-line wf-l2" d="M450 280 C550 280 530 404 650 404"/><path class="wf-line wf-l3" d="M960 150 C1085 150 1070 280 1190 280"/><path class="wf-line wf-l4" d="M960 404 C1085 404 1070 280 1190 280"/><path class="wf-flow wf-f1" d="M450 280 C550 280 530 150 650 150"/><path class="wf-flow wf-f2" d="M450 280 C550 280 530 404 650 404"/><path class="wf-flow wf-f3" d="M960 150 C1085 150 1070 280 1190 280"/><path class="wf-flow wf-f4" d="M960 404 C1085 404 1070 280 1190 280"/></svg>' +
      node('wf-input', 'file', 'INPUT', '项目资料', '3 份文件 · 已准备') + node('wf-search', 'search', 'RESEARCH', '检索相关来源', '定位与主题相关的证据') + node('wf-organize', 'folder', 'STRUCTURE', '整理关键要点', '归纳进展、问题与行动') + node('wf-output', 'sparkle', 'OUTPUT', '生成报告', '等待上游任务完成') +
      '<div class="wf-merged">' + icon('check') + '<span>检索与整理已完成</span><b>2 / 2</b></div><div class="wf-final"><div class="wf-final-label">DELIVERABLE</div><h2>' + e(p.result) + '</h2><div class="wf-final-line"></div><p>保留来源 · 结构清楚 · 可以继续编辑</p><div class="wf-final-file">' + icon('file') + '研究报告.md<span>↗</span></div></div></div>' +
      '<div class="wf-command">' + icon('chat') + '<span class="wf-command-placeholder">输入这次工作流的目标</span><span class="wf-command-text"></span><span class="wf-command-key">Enter ↵</span></div><div class="wf-bottom"><span class="wf-bottom-text">流程就绪，等待输入任务</span><span>100%　　−　＋</span></div></section>';
    const css = `
    .swfx .wf-toolbar{position:absolute;left:0;right:0;top:55px;height:74px;padding:0 30px;border-bottom:1px solid #ececf2;display:flex;justify-content:space-between;align-items:center;font-size:22px;color:#626371;background:#fff;z-index:2}.swfx .wf-toolbar>span{display:flex;gap:11px;align-items:center}.swfx .wf-toolbar>div{display:flex;align-items:center;gap:20px}.swfx .wf-run-state{font-size:18px;color:#a19aaa}.swfx .wf-run{display:flex;align-items:center;gap:10px;font-size:20px;background:#8b70b3;padding:11px 17px;border-radius:11px;color:white;font-weight:500}.swfx .wf-run .sw-icon{width:18px;height:18px}
    .swfx .wf-canvas{position:absolute;left:0;right:0;top:129px;height:590px;background-image:radial-gradient(#d9d5e3 1px,transparent 1px);background-size:24px 24px;background-color:#faf9fc;overflow:hidden}.swfx .wf-lines{position:absolute;inset:0;width:1660px;height:590px;overflow:visible}.swfx .wf-line{fill:none;stroke:#e0d9e9;stroke-width:3}.swfx .wf-flow{fill:none;stroke:#a78cc7;stroke-width:3.5;stroke-linecap:round;stroke-dasharray:450;stroke-dashoffset:450}
    .swfx .wf-node{position:absolute;width:310px;height:160px;padding:19px 23px;border:1px solid #e2dbea;border-radius:17px;background:#fff;box-shadow:0 7px 17px #67588007;color:#4a4554;overflow:hidden}.swfx .wf-node-top{display:flex;gap:9px;align-items:center;margin-bottom:17px}.swfx .wf-node-top .sw-icon{width:22px;height:22px;color:#ad98c5}.swfx .wf-node-top>span{font-size:13px;letter-spacing:2px;color:#b1a4c0}.swfx .wf-node-top i{height:7px;width:7px;border-radius:50%;background:#dcd5e6;margin-left:auto}.swfx .wf-node strong{display:block;font-size:26px;font-weight:580}.swfx .wf-node small{display:block;margin-top:11px;font-size:18px;color:#aba1b6}.swfx .wf-node-progress{position:absolute;bottom:0;left:0;right:0;height:3px;background:#f4f0f8}.swfx .wf-node-progress span{display:block;width:0;height:100%;background:#ac8fd0}.swfx .wf-input{left:140px;top:200px}.swfx .wf-search{left:650px;top:70px}.swfx .wf-organize{left:650px;top:324px}.swfx .wf-output{left:1190px;top:200px}
    .swfx .wf-command{position:absolute;left:36px;right:36px;bottom:63px;height:59px;border:1px solid #e3dce9;border-radius:13px;background:#fff;display:flex;align-items:center;gap:13px;padding:0 19px;box-shadow:0 3px 10px #5e497708;font-size:23px;z-index:3;color:#9074ad}.swfx .wf-command-placeholder{color:#b7abbe}.swfx .wf-command-text{color:#7d668e}.swfx .wf-command-key{margin-left:auto;font-size:16px;color:#b7a7c3;border:1px solid #eee8f4;padding:5px 9px;border-radius:6px}.swfx .wf-bottom{position:absolute;bottom:0;left:0;right:0;height:45px;border-top:1px solid #e9e4f0;display:flex;justify-content:space-between;align-items:center;padding:0 32px;font-size:17px;color:#a297af;background:#fff}
    .swfx .wf-merged{position:absolute;left:650px;top:214px;width:310px;height:132px;border:1px solid #d6cae6;border-radius:16px;background:#f4effa;display:flex;align-items:center;gap:11px;padding:22px;font-size:21px;color:#9273af}.swfx .wf-merged>span{flex:1;line-height:1.6}.swfx .wf-merged>b{font-size:15px;color:#b19cc7;font-weight:500}
    .swfx .wf-final{position:absolute;left:1040px;top:137px;width:460px;height:305px;border:1px solid #d8cae8;background:#fff;border-radius:20px;padding:29px;box-shadow:0 12px 35px #9e82bd12;transform-origin:70% 50%}.swfx .wf-final-label{font-size:12px;letter-spacing:2px;color:#b29cc5}.swfx .wf-final h2{font-size:29px;line-height:1.5;font-weight:600;color:#766087;margin:16px 0}.swfx .wf-final-line{height:1px;background:#eee8f5}.swfx .wf-final p{font-size:17px;color:#ae9dbb;line-height:1.7;margin:15px 0 22px}.swfx .wf-final-file{display:flex;align-items:center;gap:12px;font-size:21px;color:#967bb1;padding:13px 15px;background:#f6f2fb;border-radius:10px}.swfx .wf-final-file span{margin-left:auto}
    `;
    const tl = mount(ctx, 'workflow', p.title, 'AI / VISIBLE EXECUTION', html, css);
    hideInitially(ctx, tl, ['.wf-merged', '.wf-final']);
    point(ctx, tl, 731, 833, c.focus - 0.45, 0.45); tap(ctx, tl, 731, 833, c.focus);
    tl.to(ctx.q('.wf-command'), {borderColor: '#b499cf', duration: 0.25}, c.focus); tl.set(ctx.q('.wf-command-placeholder'), {opacity: 0, display: 'none'}, c.type);
    type(ctx, tl, '.wf-command-text', p.prompt, c.type, Math.max(0.2, c.send - c.type - 0.55));
    const run = controlCenter(ctx, '.wf-run');
    point(ctx, tl, run.x, run.y, c.send - 0.55, 0.55); tap(ctx, tl, run.x, run.y, c.send);
    tl.set(ctx.q('.wf-run-state'), {textContent: '运行中'}, c.send); tl.to(ctx.q('.wf-run'), {backgroundColor: '#ab96c6', duration: 0.2}, c.send);
    tl.set(ctx.q('.wf-bottom-text'), {textContent: '输入已接收 · 正在分配任务'}, c.send + 0.1);
    tl.to(ctx.q('.wf-input'), {borderColor: '#ae8dd0', boxShadow: '0 0 0 4px #ad8ec514', duration: 0.3}, c.execute);
    tl.to(ctx.q('.wf-input .wf-node-progress span'), {width: '100%', duration: 0.5}, c.execute);
    tl.to(ctx.q('.wf-f1'), {strokeDashoffset: 0, duration: 0.8, ease: 'power1.inOut'}, c.execute + 0.3);
    tl.to(ctx.q('.wf-f2'), {strokeDashoffset: 0, duration: 0.85, ease: 'power1.inOut'}, c.execute + 0.7);
    const branches = [{selector: '.wf-search', at: c.execute + 1.1}, {selector: '.wf-organize', at: c.execute + 1.55}];
    branches.forEach(item => {
      tl.to(ctx.q(item.selector), {borderColor: '#b696d2', backgroundColor: '#fdfbff', duration: 0.3}, item.at);
      tl.to(ctx.q(item.selector + ' .wf-node-top i'), {backgroundColor: '#b393d2', duration: 0.2}, item.at);
      tl.to(ctx.q(item.selector + ' .wf-node-progress span'), {width: '100%', duration: Math.max(0.3, c.merge - item.at - 0.6), ease: 'none'}, item.at);
    });
    tl.set(ctx.q('.wf-bottom-text'), {textContent: '检索与整理同时推进 · 每条分支保留自己的结果'}, c.execute + 1.55);
    tl.to(ctx.q('.wf-f3'), {strokeDashoffset: 0, duration: 0.75}, c.merge - 0.8); tl.to(ctx.q('.wf-f4'), {strokeDashoffset: 0, duration: 0.75}, c.merge - 0.5);
    tl.to(ctx.q('.wf-search'), {y: 144, scaleY: 0.5, opacity: 0, duration: 0.65, ease: 'power3.inOut'}, c.merge);
    tl.to(ctx.q('.wf-organize'), {y: -110, scaleY: 0.5, opacity: 0, duration: 0.65, ease: 'power3.inOut'}, c.merge);
    appear(ctx, tl, '.wf-merged', c.merge + 0.25, 0.5, 0);
    tl.to(ctx.qa('.wf-lines path'), {opacity: 0.32, duration: 0.5}, c.merge + 0.3);
    tl.to(ctx.q('.wf-output'), {opacity: 0, scale: 0.95, duration: 0.35}, c.result);
    tl.fromTo(ctx.q('.wf-final'), {scale: 0.84, opacity: 0}, {scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out', immediateRender: false}, c.result);
    tl.set(ctx.q('.wf-run-state'), {textContent: '已完成', color: '#85a48f'}, c.result); tl.set(ctx.q('.wf-bottom-text'), {textContent: '流程完成 · 2 条分支合并为 1 份报告'}, c.result + 0.3);
    point(ctx, tl, 1702, 870, c.read, 0.6);
    return end(ctx, tl, Math.max(14, c.read + 3.5));
  });

  UIFX.register({
    id: 'ai-context-handoff', title: '上下文交接 · 文档随操作移动', category: 'ai', duration: 14,
    description: '在资料窗口选中文档，光标拖动同一个文档进入新上下文，随后发送需求并生成接续结果。',
    tags: ['上下文', '拖拽', '文档交接', '连续对象'], sourceStatus: 'original-extension',
    params: {title: '把资料交过去，让上下文接得上', prompt: '基于这份资料，整理下一步的执行建议。', result: '已读取项目简报。接下来先确认目标，再拆分可执行步骤。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '把资料交过去，让上下文接得上', prompt: '基于这份资料，整理下一步的执行建议。', result: '已读取项目简报。接下来先确认目标，再拆分可执行步骤。'}, params);
    const c = cues(p, {focus: 1.0, drag: 1.7, drop: 3.65, type: 5.0, send: 7.2, execute: 7.7, result: 9.6, read: 10.6});
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + 'Context Bridge　/　同一份资料，继续工作</div><div class="hf-left"><div class="sw-pane-title">资料工作台<span class="sw-muted">3 个文件</span></div><div class="hf-folder">' + icon('folder') + '项目 / 输入资料</div><div class="hf-slot"><span>' + icon('file') + ' 项目简报.md</span></div><div class="hf-source-row">' + icon('file') + '<span>会议记录.md<small>昨天更新</small></span><em>12 KB</em></div><div class="hf-source-row">' + icon('file') + '<span>任务清单.csv<small>昨天更新</small></span><em>8 KB</em></div><div class="hf-source-detail"><span>项目简报</span><h3>保留文档的完整上下文</h3><p>目标、约束与已知信息随文档一同进入下一段工作。</p><div>目标　<span>完成一份清晰的执行建议</span></div><div>约束　<span>保留来源，不丢失关键信息</span></div></div></div>' +
      '<div class="hf-right"><div class="sw-pane-title">新的 AI 会话<span class="sw-tag">上下文接续</span></div><div class="hf-drop"><div class="hf-drop-icon">' + icon('plus') + '</div><strong>把参考资料放到这里</strong><span>文档会成为这次会话的上下文</span></div><div class="hf-attached-label">已添加参考资料<span>上下文已就绪</span></div><div class="hf-response"><div class="hf-response-head">' + icon('sparkle') + ' AI 助手</div><div class="hf-response-text"></div><div class="hf-next"><span>1</span>确认本次任务的目标与交付物</div><div class="hf-next hf-next-2"><span>2</span>拆分步骤，保留原文中的限制</div><div class="hf-reference">' + icon('link') + '参考：项目简报.md</div></div>' + composer('继续描述你想完成的工作', '引用资料　·　1 个文档') + '</div>' +
      '<div class="hf-document"><div class="hf-document-icon">' + icon('file') + '</div><div class="hf-document-info"><strong>项目简报.md</strong><small>目标 · 约束 · 已知信息</small></div>' + icon('grip') + '</div><div class="hf-bridge-label">携带上下文</div></section>';
    const css = `
    .swfx .hf-left{position:absolute;left:0;top:55px;bottom:0;width:690px;background:#fcfcfd;border-right:1px solid #e5e6ed}.swfx .hf-right{position:absolute;left:690px;top:55px;bottom:0;right:0;background:white}.swfx .hf-folder{font-size:19px;color:#a4a3ad;display:flex;align-items:center;gap:10px;padding:23px 31px}.swfx .hf-slot{height:102px;margin:5px 31px 14px;border:1px dashed #e0dce7;border-radius:15px;color:#c1bacb;font-size:21px;display:flex;align-items:center;padding:0 21px}.swfx .hf-slot>span{display:flex;gap:15px;align-items:center}
    .swfx .hf-source-row{display:flex;align-items:center;gap:17px;margin:0 32px;padding:23px 20px;border-bottom:1px solid #edebf1;color:#b0a6bc}.swfx .hf-source-row>span{flex:1;color:#8c819b;font-size:23px}.swfx .hf-source-row small{font-size:15px;display:block;color:#b8b0c1;margin-top:6px}.swfx .hf-source-row em{font-size:15px;font-style:normal;color:#c1bac9}.swfx .hf-source-row>.sw-icon{width:28px;height:28px}
    .swfx .hf-source-detail{margin:31px 32px;padding:25px;border:1px solid #eeebf2;border-radius:16px;background:white}.swfx .hf-source-detail>span{font-size:16px;color:#afa3bb}.swfx .hf-source-detail h3{font-size:25px;line-height:1.4;font-weight:550;color:#7c6a8e;margin:13px 0}.swfx .hf-source-detail p{font-size:21px;line-height:1.8;color:#a397b0;margin:0 0 21px}.swfx .hf-source-detail>div{font-size:18px;color:#9c8bab;border-top:1px solid #f1eef5;padding-top:13px;margin-top:13px}.swfx .hf-source-detail>div>span{color:#b4a7c1;margin-left:15px}
    .swfx .hf-drop{position:absolute;left:42px;right:42px;top:110px;height:240px;border:1.5px dashed #d8cce7;border-radius:20px;background:#fbf9fd;display:flex;align-items:center;flex-direction:column;justify-content:center}.swfx .hf-drop-icon{width:53px;height:53px;display:flex;align-items:center;justify-content:center;background:#f0eaf7;border-radius:15px;color:#b8a1cf;margin-bottom:17px}.swfx .hf-drop strong{font-size:28px;font-weight:500;color:#9a82b1}.swfx .hf-drop>span{font-size:20px;color:#beb0cb;margin-top:12px}.swfx .hf-attached-label{position:absolute;left:43px;right:43px;top:109px;display:flex;justify-content:space-between;color:#af9cbc;font-size:18px}.swfx .hf-attached-label>span{font-size:16px;color:#91ad9e}
    .swfx .hf-document{position:absolute;left:31px;top:203px;width:628px;height:102px;border:1px solid #e1d6ed;border-radius:15px;background:#fff;display:flex;align-items:center;gap:20px;padding:0 23px;box-shadow:0 6px 20px #8a6aad0c;z-index:9;transform-origin:50% 50%}.swfx .hf-document-icon{height:51px;width:45px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#eee6f7;color:#a087be}.swfx .hf-document-icon .sw-icon{width:28px;height:28px}.swfx .hf-document-info{flex:1}.swfx .hf-document-info strong{font-size:24px;font-weight:550;color:#876c9f;display:block}.swfx .hf-document-info small{font-size:17px;color:#b5a3c5;display:block;margin-top:8px}.swfx .hf-document>.sw-icon{color:#c0b2ce}.swfx .hf-bridge-label{position:absolute;left:687px;top:344px;background:#887099;color:#fff;font-size:19px;padding:10px 19px;border-radius:99px;z-index:8}
    .swfx .hf-response{position:absolute;left:44px;right:44px;top:287px}.swfx .hf-response-head{display:flex;align-items:center;gap:9px;font-size:23px;color:#9880ad}.swfx .hf-response-text{font-size:24px;line-height:1.7;color:#8a779b;min-height:82px;margin-top:13px}.swfx .hf-next{font-size:22px;color:#ac9aba;display:flex;align-items:center;gap:14px;margin-top:18px}.swfx .hf-next>span{width:26px;height:26px;display:flex;align-items:center;justify-content:center;background:#f2edf7;border-radius:7px;font-size:15px;color:#b6a1c9}.swfx .hf-reference{font-size:17px;color:#bdadc9;margin-top:20px;display:flex;gap:9px;align-items:center}.swfx .hf-reference .sw-icon{width:18px;height:18px}.swfx .hf-right .sw-composer{bottom:26px;left:42px;right:42px;height:105px}.swfx .hf-right .sw-send{background:#9680b1}.swfx .hf-right .sw-composer-meta{font-size:16px}
    `;
    const tl = mount(ctx, 'handoff', p.title, 'AI / CONTEXT CONTINUITY', html, css);
    hideInitially(ctx, tl, ['.hf-attached-label', '.hf-response', '.hf-next', '.hf-next-2', '.hf-reference', '.hf-bridge-label']);
    tl.set(ctx.q('.hf-slot>span'), {opacity: 0}, 0);
    point(ctx, tl, 556, 412, c.focus - 0.6, 0.6); tap(ctx, tl, 556, 412, c.focus);
    tl.to(ctx.q('.hf-document'), {borderColor: '#b49ace', boxShadow: '0 0 0 3px #bba0d322', duration: 0.25}, c.focus);
    point(ctx, tl, 579, 413, c.drag - 0.15, 0.15);
    tl.to(ctx.q('.hf-document'), {y: -22, rotation: -1.2, scale: 1.015, boxShadow: '0 22px 45px #76598d22', duration: 0.35, ease: 'power2.out'}, c.drag);
    tl.to(ctx.q('.sw-pointer'), {y: 391, duration: 0.35, ease: 'power2.out'}, c.drag);
    tl.to(ctx.q('.hf-slot>span'), {opacity: 0.6, duration: 0.3}, c.drag + 0.15);
    const travelStart = c.drag + 0.35;
    const travelDuration = Math.max(0.1, c.drop - travelStart);
    tl.to(ctx.q('.hf-document'), {x: 701, y: 0, rotation: 0, width: 886, duration: travelDuration, ease: 'power2.inOut'}, travelStart);
    tl.to(ctx.q('.sw-pointer'), {x: 1280, y: 413, duration: travelDuration, ease: 'power2.inOut'}, travelStart);
    tl.to(ctx.q('.hf-drop'), {borderColor: '#baa1d0', backgroundColor: '#f3edf9', duration: 0.4}, travelStart + travelDuration * 0.35);
    appear(ctx, tl, '.hf-bridge-label', travelStart + travelDuration * 0.35, 0.25, 5);
    tl.to(ctx.q('.hf-document'), {scale: 1, boxShadow: '0 5px 16px #8a6aad08', duration: 0.3}, c.drop);
    tl.to(ctx.q('.hf-drop'), {opacity: 0, duration: 0.4}, c.drop); tl.to(ctx.q('.hf-bridge-label'), {opacity: 0, duration: 0.3}, c.drop);
    appear(ctx, tl, '.hf-attached-label', c.drop + 0.15, 0.35, 0);
    point(ctx, tl, 1217, 816, c.type - 0.55, 0.55); tap(ctx, tl, 1217, 816, c.type - 0.05);
    tl.set(ctx.q('.sw-placeholder'), {opacity: 0}, c.type); type(ctx, tl, '.sw-input', p.prompt, c.type, Math.max(0.15, c.send - c.type - 0.45));
    const send = controlCenter(ctx, '.sw-send');
    point(ctx, tl, send.x, send.y, c.send - 0.4, 0.4); tap(ctx, tl, send.x, send.y, c.send);
    tl.set(ctx.q('.sw-input'), {textContent: ''}, c.send + 0.05); tl.set(ctx.q('.sw-placeholder'), {opacity: 1}, c.send + 0.05);
    appear(ctx, tl, '.hf-response', c.execute, 0.4, 8); type(ctx, tl, '.hf-response-text', p.result, c.execute + 0.15, Math.max(0.2, c.result - c.execute - 0.25));
    appear(ctx, tl, '.hf-next', c.result, 0.4, 9); appear(ctx, tl, '.hf-next-2', c.result + 0.25, 0.4, 9); appear(ctx, tl, '.hf-reference', c.result + 0.6, 0.35, 0);
    point(ctx, tl, 1701, 870, c.read, 0.55);
    return end(ctx, tl, Math.max(14, c.read + 3.3));
  });

  UIFX.register({
    id: 'ai-search-citations', title: 'AI 检索 · 从列表追到原文', category: 'ai', duration: 14,
    description: '输入检索问题后列表重排，点击相关来源展开原文并标记对应段落，结论附带可追溯引用。',
    tags: ['检索', '引用', '原文高亮', '证据定位'], sourceStatus: 'original-extension',
    params: {title: '让答案与来源，始终连在一起', prompt: '这个项目的关键交付要求是什么？', result: '核心要求是：保留来源、呈现操作过程，并交付可编辑的结果。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '让答案与来源，始终连在一起', prompt: '这个项目的关键交付要求是什么？', result: '核心要求是：保留来源、呈现操作过程，并交付可编辑的结果。'}, params);
    const c = cues(p, {focus: 0.8, type: 1.2, send: 3.0, execute: 3.7, source: 5.65, result: 8.6, read: 10.2});
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + 'Source Desk　/　有依据的回答</div><div class="sc-search">' + icon('search') + '<span class="sc-placeholder">在项目资料中提问</span><span class="sc-query"></span><div class="sc-search-button">检索　↵</div></div><div class="sc-left"><div class="sc-list-head"><span class="sc-list-title">项目资料</span><span class="sc-list-count">3 份文档</span></div>' +
      '<div class="sc-source sc-source-1"><div class="sc-source-heading"><span class="sc-source-icon">' + icon('file') + '</span><div><strong>制作与交付要求</strong><small>项目规范 / delivery.md</small></div><b class="sc-score sc-score-1">匹配</b></div><p>交付的画面需要可以追溯到资料依据，并保留可编辑工程。</p><div class="sc-source-tag">交付规范 <span>§ 3</span></div></div>' +
      '<div class="sc-source sc-source-2"><div class="sc-source-heading"><span class="sc-source-icon">' + icon('file') + '</span><div><strong>会议纪要</strong><small>项目记录 / meeting.md</small></div><b class="sc-score sc-score-2">匹配</b></div><p>确认软件操作的重点，保留关键步骤与阅读停留。</p><div class="sc-source-tag">需求确认 <span>§ 2</span></div></div>' +
      '<div class="sc-source sc-source-3"><div class="sc-source-heading"><span class="sc-source-icon">' + icon('file') + '</span><div><strong>历史参考清单</strong><small>参考资料 / references.md</small></div><b class="sc-score sc-score-3">相关</b></div><p>用布局、交互和状态变化作为参考，记录参考来源。</p><div class="sc-source-tag">参考记录 <span>§ 1</span></div></div></div>' +
      '<div class="sc-right"><div class="sc-empty">' + icon('search') + '<strong>找到答案，也找到依据。</strong><span>选择一个来源，查看对应原文。</span></div><article class="sc-original"><div class="sc-original-toolbar"><span>' + icon('file') + '制作与交付要求</span><em>来源 01</em></div><div class="sc-page"><div class="sc-page-meta">项目规范　/　第三节</div><h2>交付应当清楚、可信、可继续编辑</h2><p class="sc-paragraph">每个演示镜头都应说明对象、操作和结果的关系，让观看者理解实际发生了什么。</p><div class="sc-highlight"><span class="sc-highlight-fill"></span><p>保留资料来源，呈现关键操作过程，并提供可编辑的结果与工程。</p></div><p class="sc-paragraph sc-after">当画面为重建示意时，应保留简洁的说明，避免把演示当成真实执行的证据。</p><div class="sc-location">' + icon('link') + ' delivery.md　·　第 3 节　·　交付要求</div></div></article><div class="sc-answer"><div class="sc-answer-label">' + icon('sparkle') + '回答</div><div class="sc-answer-text"></div><div class="sc-citation"><span>1</span><strong>制作与交付要求</strong><small>查看原文　↗</small></div></div></div><div class="sc-status">' + icon('folder') + '<span class="sc-status-text">仅检索当前项目资料</span><span>来源内容为示例</span></div></section>';
    const css = `
    .swfx .sc-search{position:absolute;left:28px;right:28px;top:76px;height:65px;border:1px solid #e3dfeb;border-radius:14px;display:flex;gap:14px;align-items:center;padding:0 22px;background:#fcfbfe;color:#b2a1c6;font-size:25px}.swfx .sc-placeholder{color:#bdb4c6}.swfx .sc-query{color:#806c93}.swfx .sc-search-button{margin-left:auto;padding:10px 18px;font-size:19px;color:#a28ab9;background:#f1ebf8;border-radius:10px}.swfx .sc-left{position:absolute;left:0;top:168px;width:655px;bottom:46px;border-right:1px solid #ece7f2;padding:0 25px}.swfx .sc-list-head{display:flex;align-items:center;justify-content:space-between;padding:0 7px 20px;font-size:20px;color:#a693b7}.swfx .sc-list-count{font-size:17px;color:#c1b5cc}.swfx .sc-source{position:absolute;left:25px;right:25px;padding:19px 20px;border:1px solid #e9e1f0;border-radius:14px;background:#fff;box-shadow:0 4px 10px #73608703;height:163px}.swfx .sc-source-1{top:209px}.swfx .sc-source-2{top:36px}.swfx .sc-source-3{top:382px}.swfx .sc-source-heading{display:flex;align-items:center;gap:12px}.swfx .sc-source-icon{width:35px;height:42px;display:flex;align-items:center;justify-content:center;background:#f4eef9;border-radius:8px;color:#b7a0cc}.swfx .sc-source-heading>div{flex:1}.swfx .sc-source strong{display:block;font-size:22px;font-weight:550;color:#89769b}.swfx .sc-source small{display:block;font-size:14px;color:#b6a8c3;margin-top:6px}.swfx .sc-score{padding:5px 8px;font-size:14px;font-weight:500;background:#f6f2fb;color:#bea8d0;border-radius:6px}.swfx .sc-source p{font-size:18px;line-height:1.6;color:#b3a4bf;margin:14px 0 9px;max-height:58px;overflow:hidden}.swfx .sc-source-tag{font-size:14px;color:#c0b0cd}.swfx .sc-source-tag span{float:right;color:#cfbfd8}
    .swfx .sc-right{position:absolute;left:655px;right:0;top:168px;bottom:46px;background:#fdfcfe;overflow:hidden}.swfx .sc-empty{position:absolute;inset:155px 0 auto;display:flex;align-items:center;flex-direction:column;gap:18px;color:#c5b6d1}.swfx .sc-empty>.sw-icon{width:57px;height:57px;stroke-width:1}.swfx .sc-empty strong{font-size:29px;font-weight:500;color:#ab97bd}.swfx .sc-empty span{font-size:21px;color:#c5b8d0}
    .swfx .sc-original{position:absolute;left:27px;right:27px;top:2px;border:1px solid #e9e0f1;border-radius:15px;background:white;overflow:hidden;height:393px}.swfx .sc-original-toolbar{height:49px;background:#fcfaff;border-bottom:1px solid #ede6f4;display:flex;align-items:center;justify-content:space-between;padding:0 23px;color:#a089b3;font-size:20px}.swfx .sc-original-toolbar>span{display:flex;gap:10px;align-items:center}.swfx .sc-original-toolbar em{font-size:15px;font-style:normal;color:#c1aed0}.swfx .sc-page{padding:19px 28px}.swfx .sc-page-meta{font-size:14px;letter-spacing:1px;color:#baa7c9}.swfx .sc-page h2{font-size:27px;line-height:1.45;margin:11px 0 13px;font-weight:600;color:#9279a7}.swfx .sc-paragraph{font-size:20px;line-height:1.8;color:#b29fbe;margin:10px 0}.swfx .sc-highlight{position:relative;margin:10px -8px;padding:9px 8px;border-radius:7px;overflow:hidden}.swfx .sc-highlight p{position:relative;font-size:23px;line-height:1.65;color:#987bad;margin:0}.swfx .sc-highlight-fill{position:absolute;inset:0;background:#eee2fa;transform-origin:left center;transform:scaleX(0)}.swfx .sc-after{font-size:18px}.swfx .sc-location{display:flex;gap:8px;align-items:center;margin-top:13px;font-size:15px;color:#b09cc2}.swfx .sc-location .sw-icon{width:17px;height:17px}
    .swfx .sc-answer{position:absolute;left:28px;right:28px;top:411px;border:1px solid #dfd1ec;border-radius:13px;padding:15px 20px;background:#f8f3fd;min-height:126px}.swfx .sc-answer-label{font-size:17px;color:#ae91c4;display:flex;gap:8px;align-items:center}.swfx .sc-answer-label .sw-icon{width:18px;height:18px}.swfx .sc-answer-text{font-size:23px;line-height:1.65;color:#9575ad;margin-top:7px}.swfx .sc-citation{display:flex;align-items:center;gap:9px;font-size:15px;color:#b095c4;margin-top:12px}.swfx .sc-citation>span{width:18px;height:18px;border-radius:4px;background:#e6d8f2;display:flex;align-items:center;justify-content:center;font-size:12px;color:#9e7bb9}.swfx .sc-citation strong{font-weight:500}.swfx .sc-citation small{font-size:14px;color:#c1a8d0;margin-left:auto}.swfx .sc-status{position:absolute;left:0;bottom:0;right:0;height:46px;border-top:1px solid #ede6f4;padding:0 28px;display:flex;align-items:center;gap:10px;font-size:16px;color:#b5a4c4}.swfx .sc-status>.sw-icon{width:18px;height:18px}.swfx .sc-status>span:last-child{margin-left:auto;color:#cbbdd5}
    `;
    const tl = mount(ctx, 'citations', p.title, 'AI / TRACEABLE ANSWERS', html, css);
    hideInitially(ctx, tl, ['.sc-score-1', '.sc-score-2', '.sc-score-3', '.sc-original', '.sc-answer', '.sc-citation']);
    point(ctx, tl, 789, 267, c.focus - 0.45, 0.45); tap(ctx, tl, 789, 267, c.focus); tl.to(ctx.q('.sc-search'), {borderColor: '#b7a0ce', duration: 0.2}, c.focus);
    tl.set(ctx.q('.sc-placeholder'), {display: 'none'}, c.type); type(ctx, tl, '.sc-query', p.prompt, c.type, Math.max(0.2, c.send - c.type - 0.5));
    const search = controlCenter(ctx, '.sc-search-button');
    point(ctx, tl, search.x, search.y, c.send - 0.45, 0.45); tap(ctx, tl, search.x, search.y, c.send);
    tl.set(ctx.q('.sc-status-text'), {textContent: '正在检索与问题相关的段落…'}, c.send);
    tl.set(ctx.q('.sc-list-title'), {textContent: '相关来源'}, c.execute); tl.set(ctx.q('.sc-list-count'), {textContent: '找到 3 个相关片段'}, c.execute);
    tl.to(ctx.q('.sc-source-1'), {y: -173, backgroundColor: '#fbf7ff', borderColor: '#d3bfe4', duration: 0.65, ease: 'power3.inOut'}, c.execute);
    tl.to(ctx.q('.sc-source-2'), {y: 173, opacity: 0.8, duration: 0.65, ease: 'power3.inOut'}, c.execute);
    tl.to(ctx.q('.sc-source-3'), {opacity: 0.7, duration: 0.5}, c.execute + 0.1);
    appear(ctx, tl, '.sc-score-1', c.execute + 0.4, 0.3, 0); appear(ctx, tl, '.sc-score-2', c.execute + 0.5, 0.3, 0); appear(ctx, tl, '.sc-score-3', c.execute + 0.6, 0.3, 0);
    point(ctx, tl, 494, 414, c.source - 0.55, 0.55); tap(ctx, tl, 494, 414, c.source);
    tl.to(ctx.q('.sc-source-1'), {borderColor: '#b791d2', boxShadow: '0 0 0 3px #ac83c817', duration: 0.25}, c.source);
    tl.to(ctx.q('.sc-empty'), {opacity: 0, duration: 0.25}, c.source); appear(ctx, tl, '.sc-original', c.source + 0.1, 0.55, 14);
    tl.to(ctx.q('.sc-highlight-fill'), {scaleX: 1, duration: 0.85, ease: 'power2.inOut'}, c.source + 1.0);
    tl.set(ctx.q('.sc-status-text'), {textContent: '已定位原文 · 结论将保留对应来源'}, c.source + 1.25);
    appear(ctx, tl, '.sc-answer', c.result - 0.55, 0.45, 10); type(ctx, tl, '.sc-answer-text', p.result, c.result - 0.3, Math.max(0.5, c.read - c.result - 0.25));
    appear(ctx, tl, '.sc-citation', c.read, 0.4, 0); tl.set(ctx.q('.sc-status-text'), {textContent: '回答已生成 · 1 处引用可以回到原文'}, c.read);
    point(ctx, tl, 1743, 850, c.read + 0.25, 0.6);
    return end(ctx, tl, Math.max(14, c.read + 3.5));
  });
  UIFX.register({
    id: 'software-doubao-work', title: '豆包工作 · 任务模式与电脑操作', category: 'software', duration: 14,
    description: '选择云电脑环境、输入任务，执行动作逐项推进；电脑区域定位表格内容、生成周报并打开预览。',
    tags: ['豆包工作', '任务模式', '云电脑', '执行进度', '界面示意'],
    source: 'https://www.doubao.com/legal/DoubaoAgentModeNotice', sourceStatus: 'illustrative-product',
    params: {title: '把工作交给 AI，也看得见它如何完成', prompt: '读取项目表格，整理本周进展，并生成一份周报。', result: '周报已生成，项目进展与下一步行动已整理。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '把工作交给 AI，也看得见它如何完成', prompt: '读取项目表格，整理本周进展，并生成一份周报。', result: '周报已生成，项目进展与下一步行动已整理。'}, params);
    const c = cues(p, {environment: 0.9, focus: 1.5, type: 1.85, send: 3.65, execute: 4.2, inspect: 6.3, result: 8.9, read: 10.4});
    const html = '<section class="sw-frame"><div class="sw-bar">' + lights + '豆包工作　/　任务模式</div>' +
      '<aside class="sw-sidebar"><div class="sw-brand"><span class="sw-mark">豆</span>豆包工作</div><div class="sw-new">' + icon('plus') + '新建任务</div><div class="sw-navlabel">能力</div><div class="dw-capabilities"><span class="dw-skills">技能</span><span>连接器</span><span>伙伴</span></div><div class="sw-nav">' + icon('sparkle') + '　我的技能</div><div class="sw-navlabel">最近任务</div><div class="sw-nav active">整理本周项目进展</div><div class="sw-nav">归档参考资料</div><div class="sw-account"><span class="sw-avatar">Y</span>个人工作空间</div></aside>' +
      '<main class="dw-main"><div class="sw-pane-title">整理本周项目进展<span class="sw-tag">任务模式</span></div><div class="dw-thread"><div class="dw-user sw-prompt">' + e(p.prompt) + '</div><div class="dw-execution"><div class="dw-execution-title">' + icon('sparkle') + '<strong>正在执行任务</strong><span class="dw-task-count">0 / 3</span></div><div class="dw-action dw-action-1"><span class="dw-action-icon">' + icon('folder') + '</span><div><b>读取项目表格</b><small>项目资料.xlsx · 3 条记录</small></div><em class="dw-status-1">运行中</em></div><div class="dw-action dw-action-2"><span class="dw-action-icon">' + icon('search') + '</span><div><b>整理本周进展</b><small>按状态归纳，保留下一步行动</small></div><em class="dw-status-2">等待</em></div><div class="dw-action dw-action-3"><span class="dw-action-icon">' + icon('file') + '</span><div><b>生成周报文档</b><small>将结果写入可继续编辑的文件</small></div><em class="dw-status-3">等待</em></div><div class="dw-tool-info">' + icon('sparkle') + '已调用能力<span>表格整理</span></div><div class="dw-live-status"><i></i><span class="dw-live-status-text">正在查看电脑中的项目资料</span><b class="dw-stop">停止</b></div></div><div class="dw-complete sw-success">' + icon('check') + '<span>' + e(p.result) + '</span></div></div>' + composer('描述你想完成的工作', '资料已提供　·　任务模式') + '</main>' +
      '<aside class="dw-computer"><div class="dw-environment"><div class="dw-env-tabs"><span class="dw-local">本地电脑</span><span class="dw-cloud">云电脑</span></div><span class="dw-takeover">接管任务</span></div><div class="dw-computer-status"><i></i><span class="dw-environment-name">本地电脑</span><b class="dw-computer-state">等待任务</b></div><div class="dw-desktop"><div class="dw-window"><div class="dw-window-bar"><span class="dw-file-tab">' + icon('file') + '项目资料.xlsx</span><span class="dw-report-tab">' + icon('file') + '项目周报.md</span></div><div class="dw-app-tools"><span>文件　编辑　视图</span><span>撤销　↶</span></div><div class="dw-sheet"><div class="dw-sheet-heading"><b>本周项目资料</b><span>3 条记录</span></div><table><thead><tr><th></th><th>项目</th><th>状态</th><th>下一步</th></tr></thead><tbody><tr class="dw-row-1"><td>1</td><td>内容脚本</td><td><span class="dw-sheet-state-1">已完成</span></td><td>确认用词</td></tr><tr class="dw-row-2"><td>2</td><td>界面演示</td><td><span class="dw-sheet-state-2">进行中</span></td><td>验收动作</td></tr><tr class="dw-row-3"><td>3</td><td>素材归档</td><td><span class="dw-sheet-state-3">已完成</span></td><td>整理来源</td></tr></tbody></table><div class="dw-sheet-selection"></div><div class="dw-sheet-summary"><span>已选择 3 条记录</span><b>2 项完成 · 1 项进行中</b></div></div><article class="dw-report"><div class="dw-report-eyebrow">PROJECT / WEEKLY REPORT</div><h2>本周项目周报</h2><p class="dw-report-lead">把进展梳理清楚，让下一步更明确。</p><div class="dw-report-rule"></div><div class="dw-report-metrics"><div><b>2</b><span>已完成</span></div><div><b>1</b><span>进行中</span></div></div><h3>本周进展</h3><p>内容脚本与素材归档已经完成。界面演示进入动作验收阶段。</p><h3>下一步行动</h3><p>确认脚本用词，验收关键操作，并检查素材来源记录。</p><div class="dw-report-source">来源：项目资料.xlsx</div></article></div><div class="dw-desktop-caption"><span class="dw-desktop-caption-text">等待任务开始</span><span>执行画面</span></div></div><div class="dw-output"><div>' + icon('file') + '<span><b>项目周报.md</b><small>任务产物 · 可继续编辑</small></span></div><span class="dw-output-open">打开　↗</span></div><div class="dw-computer-note">执行区域随任务显示操作与进度</div><div class="sw-sweep"></div></aside></section>';
    const css = `
    .swfx.doubaowork .sw-mark{background:#e4edf6;color:#7394b3;font-family:ProjectSans,sans-serif;font-size:18px}.swfx.doubaowork .sw-brand{font-size:25px}.swfx.doubaowork .sw-sidebar{background:#f5f6f8}.swfx.doubaowork .sw-nav.active{background:#e9eef4;color:#67819e}.swfx.doubaowork .sw-send{background:#688dae}.swfx.doubaowork .sw-tag{background:#edf2f7;color:#8499b0}.swfx .dw-capabilities{display:flex;align-items:center;gap:8px;margin:10px 5px 15px;font-size:18px;color:#9aa6b3}.swfx .dw-capabilities>span{padding:7px 4px}.swfx .dw-capabilities .dw-skills{color:#7089a5;border-bottom:2px solid #bacbde}
    .swfx .dw-main{position:absolute;left:248px;top:55px;bottom:0;width:690px;border-right:1px solid #e8eaf0;background:white}.swfx .dw-main .sw-pane-title{font-size:22px;padding:0 24px}.swfx .dw-thread{position:absolute;left:26px;right:26px;top:91px}.swfx .dw-user{background:#eff3f7;color:#546478;font-size:23px;line-height:1.6;margin-left:18px;padding:16px 20px;min-height:109px}.swfx .dw-execution{margin-top:22px}.swfx .dw-execution-title{display:flex;align-items:center;gap:10px;color:#899aaf;font-size:22px;margin-bottom:13px}.swfx .dw-execution-title strong{font-weight:500}.swfx .dw-task-count{margin-left:auto;font-size:16px;color:#b4bfcb}.swfx .dw-action{height:74px;border-left:2px solid #e4ebf3;margin-left:11px;display:flex;align-items:center;gap:12px;padding:10px 0 10px 15px}.swfx .dw-action-icon{display:flex;align-items:center;justify-content:center;color:#a4b6ca;flex:none}.swfx .dw-action-icon .sw-icon{width:21px;height:21px}.swfx .dw-action>div{flex:1}.swfx .dw-action b{font-size:21px;font-weight:500;color:#74869b;display:block}.swfx .dw-action small{font-size:15px;color:#b1bbc8;display:block;margin-top:6px}.swfx .dw-action em{font-size:16px;font-style:normal;color:#a7b6c7;white-space:nowrap}.swfx .dw-tool-info{display:flex;align-items:center;gap:8px;font-size:16px;color:#a8b4c3;margin:16px 0 0 14px}.swfx .dw-tool-info .sw-icon{width:18px;height:18px}.swfx .dw-tool-info>span{margin-left:6px;padding:5px 9px;border:1px solid #e5ecf4;border-radius:7px;color:#91a6be;font-size:15px}.swfx .dw-live-status{display:flex;align-items:center;gap:8px;margin:17px 0 0 13px;color:#a4b3c5;font-size:16px}.swfx .dw-live-status i{height:6px;width:6px;border-radius:50%;background:#aec4d9}.swfx .dw-live-status-text{flex:1}.swfx .dw-stop{font-size:15px;font-weight:400;color:#b4bdc9;border:1px solid #e9eef4;padding:4px 10px;border-radius:7px}.swfx .dw-complete{position:absolute;left:0;right:0;top:400px;display:flex;align-items:center;gap:10px;background:#f4f8fb;border-color:#dfe9f2;color:#809bb6;font-size:20px;line-height:1.6;padding:14px}.swfx.doubaowork .sw-composer{left:26px;right:26px;bottom:25px;height:103px}.swfx.doubaowork .sw-composer-meta{font-size:15px}.swfx.doubaowork .sw-input{font-size:23px}.swfx.doubaowork .sw-placeholder{font-size:22px}
    .swfx .dw-computer{position:absolute;left:938px;right:0;top:55px;bottom:0;background:#f4f6f8;overflow:hidden}.swfx .dw-environment{height:69px;border-bottom:1px solid #e2e8ef;background:#fafbfd;display:flex;align-items:center;justify-content:space-between;padding:0 21px}.swfx .dw-env-tabs{display:flex;border:1px solid #e2e8ef;border-radius:10px;padding:4px;background:#eff3f7;gap:3px}.swfx .dw-env-tabs span{font-size:18px;color:#a3b2c2;padding:7px 13px;border-radius:7px}.swfx .dw-env-tabs .dw-local{background:#fff;color:#7a94af;box-shadow:0 1px 5px #8194aa13}.swfx .dw-takeover{font-size:17px;color:#a4b1c0;border:1px solid #e4eaf1;border-radius:8px;padding:8px 12px}.swfx .dw-computer-status{display:flex;gap:8px;align-items:center;font-size:17px;color:#9badc0;padding:20px 25px}.swfx .dw-computer-status i{width:6px;height:6px;background:#bdd0c6;border-radius:50%}.swfx .dw-computer-state{margin-left:auto;font-size:15px;font-weight:400;color:#b8c4d0}
    .swfx .dw-desktop{position:absolute;top:118px;left:24px;right:24px;height:454px;background:#e4ebf2;border:1px solid #dce5ee;border-radius:15px;padding:14px;box-shadow:inset 0 2px 8px #9cb1c915;overflow:hidden}.swfx .dw-window{position:absolute;left:14px;right:14px;top:14px;bottom:42px;border:1px solid #dce5ee;border-radius:10px;background:#fff;overflow:hidden;box-shadow:0 5px 15px #6079900c}.swfx .dw-window-bar{height:39px;border-bottom:1px solid #e6edf4;background:#f9fbfd;display:flex;align-items:center;padding:0 12px;gap:9px}.swfx .dw-window-bar>span{font-size:13px;color:#a4b5c8;display:flex;align-items:center;gap:6px;padding:8px 10px;border-radius:5px}.swfx .dw-window-bar .dw-file-tab{background:#edf3f9;color:#839ab2}.swfx .dw-window-bar .sw-icon{width:14px;height:14px}.swfx .dw-app-tools{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#b0bece;border-bottom:1px solid #edf1f5;padding:11px 15px}.swfx .dw-sheet{position:absolute;left:0;right:0;top:77px;bottom:0;background:#fff}.swfx .dw-sheet-heading{padding:23px 19px;display:flex;align-items:center;justify-content:space-between}.swfx .dw-sheet-heading>b{font-weight:550;font-size:20px;color:#7e93ab}.swfx .dw-sheet-heading>span{font-size:13px;color:#bec9d6}.swfx .dw-sheet table{border-collapse:collapse;width:calc(100% - 28px);margin:0 14px;table-layout:fixed}.swfx .dw-sheet th{background:#f5f8fb;font-weight:500;color:#a3b3c6;font-size:15px;text-align:left;padding:11px 12px;border:1px solid #e5edf4}.swfx .dw-sheet th:first-child{width:37px;padding:0}.swfx .dw-sheet td{height:47px;border:1px solid #e6edf5;padding:10px 12px;color:#8c9eb2;font-size:16px;white-space:nowrap}.swfx .dw-sheet td:first-child{font-size:12px;padding:0;text-align:center;color:#bac7d5;background:#fafbfd}.swfx .dw-sheet td:nth-child(3){color:#93ad9e}.swfx .dw-sheet-selection{position:absolute;left:52px;right:14px;top:106px;height:142px;border:2px solid #a7bed5;background:#bcd0e50c;pointer-events:none;transform-origin:top left}.swfx .dw-sheet-selection:after{content:'';position:absolute;width:6px;height:6px;right:-4px;bottom:-4px;background:#9db7d1;border:1px solid white}.swfx .dw-sheet-summary{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;font-size:13px;color:#aab9c9}.swfx .dw-sheet-summary b{font-size:13px;font-weight:400;color:#9db3a6}.swfx .dw-desktop-caption{position:absolute;left:16px;right:16px;bottom:13px;display:flex;justify-content:space-between;font-size:13px;color:#91a6bc}
    .swfx .dw-report{position:absolute;top:77px;left:0;right:0;bottom:0;background:white;padding:19px 27px;overflow:hidden}.swfx .dw-report-eyebrow{font-size:10px;letter-spacing:2px;color:#b6c5d3}.swfx .dw-report h2{font-size:24px;color:#607992;font-weight:600;margin:10px 0 5px}.swfx .dw-report-lead{font-size:14px!important;color:#a5b5c6!important;margin:0!important}.swfx .dw-report-rule{height:1px;background:#ebf0f6;margin:13px 0 11px}.swfx .dw-report-metrics{display:flex;gap:39px}.swfx .dw-report-metrics>div{display:flex;align-items:center;gap:10px}.swfx .dw-report-metrics b{font-family:ProjectDisplay,sans-serif;font-size:25px;color:#8da7c2}.swfx .dw-report-metrics span{font-size:13px;color:#a9bace}.swfx .dw-report h3{font-size:15px;font-weight:550;color:#7892ae;margin:13px 0 6px}.swfx .dw-report p{font-size:15px;line-height:1.6;color:#9bacbf;margin:0}.swfx .dw-report-source{font-size:12px;color:#b8c7d6;margin-top:13px}.swfx .dw-output{position:absolute;left:25px;right:25px;top:593px;min-height:74px;border:1px solid #dbe5f0;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:13px 17px}.swfx .dw-output>div{display:flex;align-items:center;gap:12px;color:#92a9c0}.swfx .dw-output b{font-size:20px;font-weight:500;color:#7993ad;display:block}.swfx .dw-output small{font-size:14px;color:#b3c0ce;margin-top:6px;display:block}.swfx .dw-output-open{font-size:16px;color:#9baec3}.swfx .dw-computer-note{position:absolute;bottom:16px;left:25px;font-size:14px;color:#b6c3d1}
    `;
    const detailCSS = '.swfx .dw-sheet-heading{height:65px;padding:0 19px}.swfx .dw-sheet th{height:40px;line-height:18px;padding:10px 12px}.swfx .dw-sheet-selection{top:105px}.swfx .dw-report{padding:17px 24px}.swfx .dw-report-eyebrow{line-height:12px}.swfx .dw-report h2{font-size:23px;line-height:1.2;margin:7px 0 4px}.swfx .dw-report-lead{line-height:1.4!important}.swfx .dw-report-rule{margin:12px 0}.swfx .dw-report-metrics b{line-height:1.2}.swfx .dw-report h3{line-height:1.2;margin:10px 0 5px}.swfx .dw-report p{line-height:1.5}.swfx .dw-report-source{margin-top:8px;font-size:11px;line-height:17px}';
    const tl = mount(ctx, 'doubaowork', p.title, 'SOFTWARE / DOUBAO WORK', html, css + detailCSS, '豆包工作 · 界面示意');
    hideInitially(ctx, tl, ['.dw-user', '.dw-execution', '.dw-action-2', '.dw-action-3', '.dw-tool-info', '.dw-complete', '.dw-sheet-selection', '.dw-sheet-summary', '.dw-report-tab', '.dw-report', '.dw-output']);
    const cloud = controlCenter(ctx, '.dw-cloud');
    point(ctx, tl, cloud.x, cloud.y, c.environment - 0.55, 0.55); tap(ctx, tl, cloud.x, cloud.y, c.environment);
    tl.to(ctx.q('.dw-local'), {backgroundColor: '#eff3f7', color: '#a3b2c2', boxShadow: '0 0 0 #0000', duration: 0.25}, c.environment);
    tl.to(ctx.q('.dw-cloud'), {backgroundColor: '#fff', color: '#7a94af', boxShadow: '0 1px 5px #8194aa13', duration: 0.25}, c.environment);
    tl.set(ctx.q('.dw-environment-name'), {textContent: '云电脑'}, c.environment + 0.2);
    point(ctx, tl, 727, 817, c.focus - 0.4, 0.4); tap(ctx, tl, 727, 817, c.focus);
    tl.to(ctx.q('.sw-composer'), {borderColor: '#a5bbd1', boxShadow: '0 0 0 3px #a5bbd110', duration: 0.2}, c.focus);
    tl.set(ctx.q('.sw-placeholder'), {opacity: 0}, c.type); type(ctx, tl, '.sw-input', p.prompt, c.type, Math.max(0.2, c.send - c.type - 0.4));
    const send = controlCenter(ctx, '.sw-send');
    point(ctx, tl, send.x, send.y, c.send - 0.45, 0.45); tap(ctx, tl, send.x, send.y, c.send);
    tl.set(ctx.q('.sw-input'), {textContent: ''}, c.send + 0.05); tl.set(ctx.q('.sw-placeholder'), {opacity: 1}, c.send + 0.05);
    appear(ctx, tl, '.dw-user', c.send + 0.1, 0.4, 13); appear(ctx, tl, '.dw-execution', c.execute, 0.45, 10);
    tl.set(ctx.q('.dw-computer-state'), {textContent: '正在读取资料'}, c.execute);
    tl.set(ctx.q('.dw-desktop-caption-text'), {textContent: '打开：项目资料.xlsx'}, c.execute);
    const inspectTarget = controlCenter(ctx, '.dw-row-1 td:nth-child(2)');
    point(ctx, tl, inspectTarget.x, inspectTarget.y, c.inspect - 0.65, 0.65); tap(ctx, tl, inspectTarget.x, inspectTarget.y, c.inspect);
    tl.fromTo(ctx.q('.dw-sheet-selection'), {opacity: 0, scaleY: 0.33}, {opacity: 1, scaleY: 1, duration: 0.65, ease: 'power2.inOut', immediateRender: false}, c.inspect);
    tl.to(ctx.q('.sw-pointer'), {y: inspectTarget.y + 93, duration: 0.65, ease: 'power2.inOut'}, c.inspect);
    tl.set(ctx.q('.dw-status-1'), {textContent: '完成', color: '#8ca99a'}, c.inspect);
    tl.set(ctx.q('.dw-task-count'), {textContent: '1 / 3'}, c.inspect); appear(ctx, tl, '.dw-action-2', c.inspect, 0.35, 7);
    tl.set(ctx.q('.dw-status-2'), {textContent: '整理中'}, c.inspect); appear(ctx, tl, '.dw-tool-info', c.inspect + 0.15, 0.3, 0);
    tl.set(ctx.q('.dw-live-status-text'), {textContent: '正在归纳表格中的进展与行动'}, c.inspect);
    appear(ctx, tl, '.dw-sheet-summary', c.inspect + 0.6, 0.35, 0);
    const writeAt = c.inspect + (c.result - c.inspect) * 0.56;
    tl.set(ctx.q('.dw-status-2'), {textContent: '完成', color: '#8ca99a'}, writeAt);
    tl.set(ctx.q('.dw-task-count'), {textContent: '2 / 3'}, writeAt); appear(ctx, tl, '.dw-action-3', writeAt, 0.35, 7);
    tl.set(ctx.q('.dw-status-3'), {textContent: '写入中'}, writeAt); tl.set(ctx.q('.dw-live-status-text'), {textContent: '正在生成项目周报文档'}, writeAt);
    tl.set(ctx.q('.dw-desktop-caption-text'), {textContent: '生成：项目周报.md'}, writeAt); tl.set(ctx.q('.dw-computer-state'), {textContent: '正在生成结果'}, writeAt);
    appear(ctx, tl, '.dw-report-tab', c.result, 0.35, 0); appear(ctx, tl, '.dw-output', c.result + 0.1, 0.45, 10);
    tl.set(ctx.q('.dw-status-3'), {textContent: '完成', color: '#8ca99a'}, c.result); tl.set(ctx.q('.dw-task-count'), {textContent: '3 / 3'}, c.result);
    tl.set(ctx.q('.dw-execution-title strong'), {textContent: '任务已完成'}, c.result);
    tl.to(ctx.q('.dw-live-status'), {opacity: 0, duration: 0.2}, c.result); tl.to(ctx.q('.dw-tool-info'), {opacity: 0, duration: 0.2}, c.result);
    appear(ctx, tl, '.dw-complete', c.result + 0.15, 0.4, 8);
    const openAt = c.read - 0.55;
    const open = controlCenter(ctx, '.dw-output-open');
    point(ctx, tl, open.x, open.y, openAt - 0.55, 0.55); tap(ctx, tl, open.x, open.y, openAt);
    tl.to(ctx.q('.dw-output'), {borderColor: '#a6bfd8', backgroundColor: '#f8fbfe', duration: 0.25}, openAt);
    tl.to(ctx.q('.dw-file-tab'), {backgroundColor: '#f9fbfd', color: '#b4c2d1', duration: 0.2}, openAt);
    tl.to(ctx.q('.dw-report-tab'), {backgroundColor: '#edf3f9', color: '#839ab2', duration: 0.2}, openAt);
    tl.to(ctx.q('.dw-sheet'), {opacity: 0, duration: 0.25}, openAt + 0.08); appear(ctx, tl, '.dw-report', openAt + 0.08, 0.5, 8);
    tl.set(ctx.q('.dw-computer-state'), {textContent: '任务完成'}, c.read); tl.set(ctx.q('.dw-desktop-caption-text'), {textContent: '预览：项目周报.md'}, c.read);
    point(ctx, tl, 1777, 884, c.read + 0.35, 0.5);
    return end(ctx, tl, Math.max(14, c.read + 3.5));
  });
})();
