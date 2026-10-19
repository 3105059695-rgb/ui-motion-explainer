/* Handoff component study: observed video fragment, original navigation and camera timing. */
(function () {
  'use strict';

  const paths = {
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    check: '<path d="m5 12 4.5 4.5L19 7"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M20.3 14A8.5 8.5 0 0 1 10 3.7 8.5 8.5 0 1 0 20.3 14Z"/>',
    shape: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z M4 7.5l8 5 8-5M12 12.5V21"/>',
    arrows: '<path d="M5 8h14M15 4l4 4-4 4M19 16H5m4-4-4 4 4 4"/>'
  };
  const icon = name => '<svg class="hc-icon" viewBox="0 0 24 24" aria-hidden="true">' + paths[name] + '</svg>';

  UIFX.register({
    id: 'ai-handoff-copy-component',
    title: 'Handoff · 复制组件安装脚本',
    category: 'interaction',
    duration: 12,
    source: 'https://x.com/chalaska/status/2098056952198676721',
    sourceStatus: 'observed-reconstruction',
    sourceObservation: 'video-fragment',
    description: '依据参考片段的 Handoff 组件与复制反馈重建：原创目录定位后，同一文档窗口连续推近，光标点击 Copy install script，浮动条显示 Copied 提示并停留。业务按钮保持待人工接管状态。',
    adaptationNotes: '参考观察范围约 25.36–27.00 秒。难以辨认的目录项以简化自写名称替代；目录点击、横屏重排与镜头节奏为原创。复制为可视反馈演示，不调用剪贴板或业务接口，也不展示退款成功。',
    tags: ['Collect UI', 'Handoff', '组件文档', '连续推近', '复制反馈'],
    params: {title: 'Handoff', prompt: 'Alpha is handing this to you'}
  }, function (ctx, params) {
    const p = Object.assign({title: 'Handoff', prompt: 'Alpha is handing this to you'}, params || {});
    const e = ctx.esc;
    const titleSize = Math.max(30, Math.min(48, 864 / Math.max(1, Array.from(String(p.title)).length * .58)));
    const promptSize = Math.max(23, Math.min(31, 918 / Math.max(1, Array.from(String(p.prompt)).length * .53)));

    ctx.root.innerHTML = `<style>
      .hc-scene{position:relative;width:1920px;height:1080px;overflow:hidden;background:radial-gradient(ellipse at 52% 42%,#f5f5f5 0%,#ededee 62%,#e5e5e7 100%);font-family:ProjectSans,Arial,sans-serif;color:#19191c}
      .hc-scene *{box-sizing:border-box}
      .hc-scene .hc-icon{display:block;flex:none;width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
      .hc-scene .hc-workspace{position:absolute;left:132px;top:92px;width:1656px;height:878px;background:#fff;border:1px solid #dcdcdf;border-radius:27px;box-shadow:0 30px 86px #24242b14,0 5px 18px #24242b06;overflow:hidden;transform-origin:828px 439px}
      .hc-scene .hc-windowbar{position:absolute;left:0;right:0;top:0;height:62px;border-bottom:1px solid #ededf0;display:flex;align-items:center;padding:0 27px;gap:23px;background:#fdfdfd}
      .hc-scene .hc-windowdots{display:flex;gap:8px}
      .hc-scene .hc-windowdots i{width:9px;height:9px;border-radius:50%;background:#d8d8dc}
      .hc-scene .hc-windowlabel{color:#73737b;font-size:17px;letter-spacing:.3px}
      .hc-scene .hc-windowlocation{position:absolute;left:650px;right:395px;height:29px;border:1px solid #ededf0;border-radius:8px;text-align:center;line-height:27px;font-size:14px;color:#808087;background:#f6f6f7}
      .hc-scene .hc-sidebar{position:absolute;left:0;top:62px;bottom:0;width:242px;border-right:1px solid #ececef;background:#fbfbfc;padding:34px 21px}
      .hc-scene .hc-kitname{font-size:23px;line-height:34px;font-weight:650;letter-spacing:-.6px;margin-bottom:26px;display:flex;gap:11px;align-items:center}
      .hc-scene .hc-kitmark{width:27px;height:27px;background:#232326;border-radius:7px;display:grid;place-items:center}
      .hc-scene .hc-kitmark i{width:12px;height:12px;border:1.6px solid #fff;transform:rotate(45deg);border-radius:2px}
      .hc-scene .hc-search{height:40px;border:1px solid #e6e6e9;border-radius:9px;display:flex;align-items:center;gap:9px;padding:0 11px;font-size:15px;color:#81818a;background:#fff;margin-bottom:33px}
      .hc-scene .hc-search .hc-icon{width:17px;height:17px}
      .hc-scene .hc-navheading{margin:0 11px 10px;color:#515159;font-size:16px;font-weight:620}
      .hc-scene .hc-navlink{height:45px;border-radius:9px;padding:0 12px;display:flex;align-items:center;font-size:18px;color:#696971;line-height:45px;white-space:nowrap}
      .hc-scene .hc-nav-handoff{background:#f2f2f5;color:#25252b;font-weight:550;justify-content:space-between}
      .hc-scene .hc-nav-handoff .hc-icon{width:15px;height:15px;opacity:.6}
      .hc-scene .hc-navgroup{margin-top:28px}
      .hc-scene .hc-sidebar-foot{position:absolute;left:32px;bottom:25px;font-size:14px;color:#8a8a92}
      .hc-scene .hc-document-label{position:absolute;left:365px;top:94px;display:flex;align-items:center;gap:10px;font-size:16px;color:#81818a}
      .hc-scene .hc-document-label .hc-icon{width:12px;height:12px;color:#a1a1a8}
      .hc-scene .hc-document-title{position:absolute;left:365px;top:127px;width:1060px;margin:0;font-size:${titleSize}px;font-weight:660;line-height:1.35;letter-spacing:-1.7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .hc-scene .hc-component{position:absolute;left:365px;top:220px;width:1060px;height:516px;border:1px solid #e3e3e8;border-radius:22px;background:#fff;box-shadow:0 10px 33px #37313f05}
      .hc-scene .hc-component-heading{position:absolute;left:27px;right:27px;top:24px;height:36px;display:flex;align-items:center;gap:12px}
      .hc-scene .hc-agentmark{position:relative;width:31px;height:31px;border-radius:50%;background:#8d63cf;flex:none;box-shadow:inset 0 0 0 1px #7d55be}
      .hc-scene .hc-agentmark::before{content:'';position:absolute;width:12px;height:12px;border:1.4px solid #fff;border-radius:50%;left:9px;top:9px}
      .hc-scene .hc-agentmark::after{content:'';position:absolute;width:4px;height:4px;border-radius:50%;background:#fff;left:13px;top:13px}
      .hc-scene .hc-agent-label{font-size:17px;font-weight:620;letter-spacing:1.35px;color:#3d3a43}
      .hc-scene .hc-your-turn{margin-left:auto;height:31px;padding:0 13px;border:1px solid #e6ddf4;border-radius:8px;display:flex;align-items:center;background:#f3edf9;color:#7b50b8;font-size:14px;letter-spacing:1.4px;font-weight:650}
      .hc-scene .hc-alert{position:absolute;left:26px;right:26px;top:84px;height:121px;border-left:4px solid #9566d5;border-radius:0 12px 12px 0;background:#f0edf8;padding:20px 22px}
      .hc-scene .hc-alert-title{margin:0;color:#24212b;font-size:${promptSize}px;font-weight:650;line-height:42px;letter-spacing:-.65px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .hc-scene .hc-alert-reason{margin:9px 0 0;color:#6b6378;font-size:21px;line-height:29px}
      .hc-scene .hc-details{position:absolute;left:26px;right:26px;top:227px;height:174px;background:#f7f7f8;border-radius:19px;padding:0 24px}
      .hc-scene .hc-detail-row{height:58px;display:flex;align-items:center;justify-content:space-between;gap:24px}
      .hc-scene .hc-detail-label{font-size:21px;line-height:30px;color:#777780}
      .hc-scene .hc-detail-value{font-size:22px;line-height:30px;color:#26252b;font-weight:570;letter-spacing:-.15px}
      .hc-scene .hc-actions{position:absolute;left:26px;right:26px;top:424px;height:58px;display:flex;align-items:center;gap:14px}
      .hc-scene .hc-take-over{height:55px;padding:0 28px;border-radius:30px;background:#212124;color:#fff;display:flex;align-items:center;justify-content:center;white-space:nowrap;font-size:20px;font-weight:520;box-shadow:0 2px 3px #00000008}
      .hc-scene .hc-raise-cap{height:55px;padding:0 27px;border-radius:30px;background:#f3f3f5;color:#65646d;display:flex;align-items:center;justify-content:center;white-space:nowrap;font-size:19px;letter-spacing:-.1px}
      .hc-scene .hc-floating-tools{position:absolute;left:599px;top:777px;height:58px;display:flex;align-items:center;gap:16px}
      .hc-scene .hc-copy{position:relative;width:370px;height:58px;border:1px solid #121215;border-radius:32px;background:#202023;color:#fff;box-shadow:0 8px 20px #20202717;flex:none;overflow:hidden}
      .hc-scene .hc-copy-before,.hc-scene .hc-copy-after{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:13px;white-space:nowrap;font-size:20px;line-height:28px;letter-spacing:-.2px}
      .hc-scene .hc-copy-before .hc-icon{width:22px;height:22px;stroke-width:1.6}
      .hc-scene .hc-copy-after{gap:12px;font-size:19px}
      .hc-scene .hc-copy-after .hc-icon{width:20px;height:20px;color:#d3c0ef;stroke-width:2.3}
      .hc-scene .hc-theme-tools{display:flex;align-items:center;gap:10px}
      .hc-scene .hc-theme-control{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#f9f9fa;border:1px solid #e2e2e6;color:#777781;box-shadow:0 3px 8px #22222d03}
      .hc-scene .hc-theme-control .hc-icon{width:21px;height:21px}
      .hc-scene .hc-theme-control.hc-theme-active{color:#29282f;background:#fff;border-color:#d6d6dd}
      .hc-scene .hc-color-control{width:29px;height:29px;border-radius:50%;background:#966cde;box-shadow:inset 0 0 0 1px #8559cc,0 0 0 4px #f8f4fd}
      .hc-scene .hc-pointer{position:absolute;left:0;top:0;width:38px;height:46px;transform-origin:4px 3px;z-index:20;pointer-events:none}
      .hc-scene .hc-ring{position:absolute;left:0;top:0;width:52px;height:52px;border:2px solid #a380d6;border-radius:50%;z-index:19;pointer-events:none}
      .hc-scene .hc-proof{position:absolute;right:96px;bottom:20px;color:#7f7d87;font-size:16px;line-height:25px;letter-spacing:.15px}
    </style><div class="fx-scene hc-scene">
      <section class="hc-workspace">
        <header class="hc-windowbar"><div class="hc-windowdots"><i></i><i></i><i></i></div><span class="hc-windowlabel">UI Kit</span><div class="hc-windowlocation">Component documentation</div></header>
        <aside class="hc-sidebar">
          <div class="hc-kitname"><span class="hc-kitmark"><i></i></span>UI Kit</div>
          <div class="hc-search">${icon('search')}<span>Search</span></div>
          <div class="hc-navheading">Patterns</div>
          <div class="hc-navlink">Overview</div>
          <div class="hc-navlink hc-nav-handoff"><span>Handoff</span>${icon('chevron')}</div>
          <div class="hc-navlink">Human review</div>
          <div class="hc-navgroup"><div class="hc-navheading">Components</div><div class="hc-navlink">Buttons</div><div class="hc-navlink">Status pills</div><div class="hc-navlink">Detail rows</div></div>
          <div class="hc-sidebar-foot">Design system</div>
        </aside>
        <div class="hc-document-label"><span>Patterns</span>${icon('chevron')}<span>Agentic</span></div>
        <h1 class="hc-document-title">${e(p.title)}</h1>
        <article class="hc-component">
          <div class="hc-component-heading"><span class="hc-agentmark"></span><span class="hc-agent-label">AGENTIC · CAP REACHED</span><span class="hc-your-turn">YOUR TURN</span></div>
          <div class="hc-alert"><h2 class="hc-alert-title">${e(p.prompt)}</h2><p class="hc-alert-reason">Refund exceeds your $2,500 approval cap</p></div>
          <div class="hc-details"><div class="hc-detail-row"><span class="hc-detail-label">Customer</span><span class="hc-detail-value">Acme · Enterprise</span></div><div class="hc-detail-row"><span class="hc-detail-label">Requested refund</span><span class="hc-detail-value">$3,900</span></div><div class="hc-detail-row"><span class="hc-detail-label">Risk if delayed</span><span class="hc-detail-value">Renewal in 6 days</span></div></div>
          <div class="hc-actions"><span class="hc-take-over">Take over</span><span class="hc-raise-cap">Raise cap to $5,000 &amp; let Alpha finish</span></div>
        </article>
        <div class="hc-floating-tools"><div class="hc-copy"><span class="hc-copy-before">${icon('copy')}<span>Copy install script</span></span><span class="hc-copy-after"><span>Copied · paste into Claude Code</span>${icon('check')}</span></div><div class="hc-theme-tools"><span class="hc-theme-control hc-theme-active">${icon('sun')}</span><span class="hc-theme-control">${icon('moon')}</span><span class="hc-theme-control">${icon('shape')}</span><span class="hc-theme-control"><i class="hc-color-control"></i></span></div></div>
      </section>
      <div class="hc-pointer">${ctx.cursor()}</div><div class="hc-ring"></div><div class="hc-proof">参考片段重建 · 目录定位与镜头节奏原创 · 复制反馈示意</div>
    </div>`;

    const q = ctx.q;
    const tl = ctx.gsap.timeline({paused: true});
    const pointer = q('.hc-pointer');
    const ring = q('.hc-ring');
    const workspace = q('.hc-workspace');
    const component = q('.hc-component');
    const zoom = 1.12;
    const projectedPoint = (x, y) => ({x:132 + 828 + (x - 828) * zoom, y:92 + 439 + (y - 439) * zoom});
    const copyPoint = projectedPoint(941, 820);

    // Layout-based navigation point remains valid if this simplified directory changes height.
    const nav = q('.hc-nav-handoff');
    const navPoint = {x:132 + nav.offsetLeft + nav.offsetWidth / 2, y:92 + 62 + nav.offsetTop + nav.offsetHeight / 2};

    const click = (point, at) => {
      tl.set(pointer, {x:point.x - 4, y:point.y - 3, scale:1, opacity:1}, at)
        .set(ring, {x:point.x - 26, y:point.y - 26, scale:.38, opacity:.58}, at)
        .to(ring, {scale:1.22, opacity:0, duration:.42, ease:'power2.out'}, at)
        .to(pointer, {scale:.87, duration:.09, ease:'power2.out'}, at)
        .to(pointer, {scale:1, duration:.16, ease:'power2.out'}, at + .09);
    };

    tl.set(workspace, {x:0, y:0, scale:1, opacity:1}, 0)
      .set(pointer, {x:1502, y:861, opacity:0, scale:1}, 0)
      .set(ring, {x:0, y:0, opacity:0, scale:.38}, 0)
      .set(nav, {backgroundColor:'#f2f2f5', color:'#25252b'}, 0)
      .set(component, {borderColor:'#e3e3e8', boxShadow:'0 10px 33px #37313f05'}, 0)
      .set(q('.hc-copy'), {width:370, backgroundColor:'#202023', borderColor:'#121215', boxShadow:'0 8px 20px #20202717'}, 0)
      .set(q('.hc-floating-tools'), {x:0}, 0)
      .set(q('.hc-copy-before'), {opacity:1, y:0}, 0)
      .set(q('.hc-copy-after'), {opacity:0, y:3}, 0);

    // Original directory interaction locates the already-mounted component; no card is replaced.
    tl.to(pointer, {x:navPoint.x - 4, y:navPoint.y - 3, opacity:1, duration:.78, ease:'power2.inOut'}, .55);
    click(navPoint, 1.42);
    tl.to(nav, {backgroundColor:'#ece5f6', color:'#7550aa', duration:.22}, 1.42)
      .to(component, {borderColor:'#d7c8eb', boxShadow:'0 0 0 4px #ede5f72b,0 10px 33px #37313f05', duration:.26}, 1.57)
      .to(component, {borderColor:'#e3e3e8', boxShadow:'0 10px 33px #37313f05', duration:.5}, 1.9)
      .to(pointer, {x:1680, y:730, duration:1.12, ease:'power2.inOut'}, 2.24)
      .to(workspace, {scale:zoom, duration:1.6, ease:'power3.inOut'}, 3.12);

    // The same window, component and floating controls stay present throughout the camera push.
    tl.to(pointer, {x:copyPoint.x - 4, y:copyPoint.y - 3, duration:.86, ease:'power2.inOut'}, 6.03)
      .to(q('.hc-copy'), {backgroundColor:'#303035', duration:.22}, 6.89);
    click(copyPoint, 7.4);

    // Visual copy acknowledgement only: no clipboard or refund/approval action is executed.
    tl.to(q('.hc-copy-before'), {opacity:0, y:-3, duration:.15, ease:'power2.out'}, 7.51)
      .to(q('.hc-copy'), {width:516, backgroundColor:'#25212c', borderColor:'#746284', boxShadow:'0 0 0 4px #ac8ad922,0 8px 20px #20202717', duration:.43, ease:'power3.inOut'}, 7.55)
      .to(q('.hc-floating-tools'), {x:-73, duration:.43, ease:'power3.inOut'}, 7.55)
      .to(q('.hc-copy-after'), {opacity:1, y:0, duration:.24, ease:'power2.out'}, 7.96)
      .to(q('.hc-copy'), {backgroundColor:'#202023', borderColor:'#121215', boxShadow:'0 8px 20px #20202717', duration:.55, ease:'power2.out'}, 8.28)
      .to({}, {duration:.01}, 11.99);

    return {timeline:tl, duration:12};
  });
})();
