/* Agent management interface study: observed structure, original timing and pixel avatars. */
(function () {
  'use strict';

  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m9 5 7 7-7 7"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    bolt: '<path d="m13 2-8 12h6l-1 8 9-13h-6z"/>',
    sparkle: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
    folder: '<path d="M3 7h7l2 3h9v10H3zM3 7V4h7l2 3h9v3"/>',
    chat: '<path d="M4 4h16v12H9l-5 4z"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/>',
    retry: '<path d="M19 8a8 8 0 1 0 .7 6M19 3v5h-5"/>',
    arrow: '<path d="M6 18 18 6M8 6h10v10"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3"/>'
  };
  const icon = name => '<svg class="ah-icon" viewBox="0 0 24 24" aria-hidden="true">' + (paths[name] || paths.chat) + '</svg>';

  const palettes = [
    ['#eef5e9', '#a8cf94', '#59764b'],
    ['#edf2fc', '#9db8e9', '#5a75ab'],
    ['#fcf0f3', '#e0a8c2', '#a36b8e'],
    ['#f1edfa', '#baa9dd', '#786399'],
    ['#f6efe9', '#cfb495', '#8b7557'],
    ['#fff3e5', '#e2bc88', '#9c7544']
  ];
  const faces = [
    ['00111100','01111110','11111111','11211211','11111111','01122110','00111100','01000010'],
    ['01000010','01111110','11111111','11211211','11111111','11122111','01111110','00100100'],
    ['00011000','00111100','01111110','11211211','11111111','01122110','00111100','00100100'],
    ['00111100','01111110','01111110','11211211','11111111','01111110','01222210','00100100'],
    ['00100100','01111110','11111111','11211211','11111111','01122110','01111110','01000010'],
    ['00011000','01111110','11111111','11211211','11111111','01222210','00111100','01100110']
  ];

  function avatar(index) {
    const palette = palettes[index % palettes.length];
    const face = faces[index % faces.length];
    let blocks = '';
    face.forEach((row, y) => Array.from(row).forEach((pixel, x) => {
      if (pixel !== '0') blocks += '<rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="1" height="1" fill="' + palette[Number(pixel)] + '"/>';
    }));
    return '<svg class="ah-avatar" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect width="10" height="10" rx="2" fill="' + palette[0] + '"/>' + blocks + '</svg>';
  }

  function center(ctx, selector) {
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

  function point(ctx, tl, location, at, duration) {
    tl.to(ctx.q('.ah-pointer'), {x: location.x, y: location.y, opacity: 1, duration, ease: 'power2.inOut'}, at);
  }

  function tap(ctx, tl, location, at) {
    tl.set(ctx.q('.ah-pointer'), {x: location.x, y: location.y, opacity: 1}, at);
    tl.set(ctx.q('.ah-ring'), {x: location.x, y: location.y, opacity: 0.55, scale: 0.45}, at);
    tl.to(ctx.q('.ah-ring'), {opacity: 0, scale: 1.2, duration: 0.4, ease: 'power2.out'}, at);
    tl.fromTo(ctx.q('.ah-pointer'), {scale: 1}, {scale: 0.89, duration: 0.08, immediateRender: false}, at);
    tl.fromTo(ctx.q('.ah-pointer'), {scale: 0.89}, {scale: 1, duration: 0.13, immediateRender: false}, at + 0.08);
  }

  UIFX.register({
    id: 'software-agent-hub',
    title: 'Agent Hub · 从任务到失败定位',
    category: 'software',
    duration: 16,
    source: 'https://x.com/aydaoz/status/2067614756756676711',
    sourceStatus: 'observed-reconstruction',
    description: '依据已观察的 My Agents 与 Agent Hub 界面重建；点击页签查看统计与活动，展开正在执行的步骤，再切到 Resume Review 的失败步骤并停留。头像、背景和16秒节奏为原创适配。',
    tags: ['Collect UI', 'AI Agents', 'Agent Hub', '任务展开', '失败定位'],
    params: {title: 'Agents', agentName: 'Offer Letter Generator'}
  }, function (ctx, params) {
    const p = Object.assign({title: 'Agents', agentName: 'Offer Letter Generator'}, params);
    const agents = [
      [p.agentName, 'Pulls template from Google Drive', 0],
      ['Onboarding Buddy', 'Coordinate onboarding tasks for new hires', 1],
      ['Contract Review', 'Review contracts and highlight key terms', 2],
      ['Employee Onboarding Docs', 'Prepare documents for new teammates', 3],
      ['Sprint Summarizer', 'Summarize progress from your latest sprint', 4],
      ['Resume Review', 'Drafting completed - awaiting approval', 5]
    ];
    const browse = [
      ['NDA Review Agent', 'Review terms before your next agreement', 2],
      ['Q1 Competitor Analysis', 'Bring market signals into one place', 1],
      ['Newsletter agent', 'Turn useful updates into a clear draft', 4]
    ];
    const activity = [
      [p.agentName, 'Creating offer letters from the latest templates', 'Active', '44m', 0, 'active'],
      ['Onboarding Buddy', 'Coordinate onboarding tasks for new hires', 'Active', '1h', 1, 'active'],
      ['Contract Review', 'Reviewing the latest contract documents', 'Active', '1h', 2, 'active'],
      ['Resume Review', 'Candidate details pull action failed', 'Failed', '5d', 5, 'failed'],
      ['Sprint Summarizer', 'Waiting for the next scheduled run', 'Pending', '5d', 4, 'pending'],
      ['Resume Review', 'Drafting completed - awaiting approval', 'Needs review', '1w', 5, 'review'],
      ['NDA Review Agent', 'Review completed and ready to view', 'Completed', '4m', 2, 'completed'],
      [p.agentName, 'An action needs your attention', 'Failed', '5d', 0, 'failed'],
      ['Resume Review', 'Drafting completed - awaiting approval', 'Needs review', '1w', 5, 'review']
    ];
    const agentCard = (item, index) => '<article class="ah-agent-card"><div class="ah-agent-top">' + avatar(item[2]) + '<span>' + icon('more') + '</span></div><h3>' + escapeHTML(item[0]) + '</h3><p>' + escapeHTML(item[1]) + '</p><div class="ah-agent-meta"><span>' + (index === 5 ? 'Needs review' : 'Agent') + '</span>' + icon('arrow') + '</div></article>';
    const regularSteps = '<div class="ah-details ah-first-details"><div class="ah-timeline"><i class="ah-timeline-line"></i>' +
      '<div class="ah-step"><i class="ah-step-dot ah-waiting"></i><strong>Send drafts to Gmail for HR review</strong><small>Waiting for previous action</small></div>' +
      '<div class="ah-step"><i class="ah-step-dot ah-running"></i><strong>Auto-fills offer letter templates with candidate details</strong><small>In progress</small></div>' +
      '<div class="ah-step"><i class="ah-step-dot ah-done">' + icon('check') + '</i><strong>Started creating offer letters</strong><small>Completed</small></div></div></div>';
    const failedSteps = '<div class="ah-details ah-failed-details"><div class="ah-timeline ah-failure-timeline"><i class="ah-timeline-line"></i>' +
      '<div class="ah-step ah-wait-step"><i class="ah-step-dot ah-waiting"></i><strong>Send template drafts to Slack #HR-leads and #Candidates for review</strong><small>Waiting for previous action</small></div>' +
      '<div class="ah-failure-box"><i class="ah-failure-dot">!</i><div class="ah-failure-top"><strong>Auto-fill templates with candidate details</strong><div class="ah-failure-buttons"><span class="ah-rerun">' + icon('retry') + 'Re-run</span><span class="ah-manage">Manage workflow</span></div></div><p>Candidate details pull action failed. Review this action to continue.</p></div>' +
      '<div class="ah-step ah-complete-step"><i class="ah-step-dot ah-done">' + icon('check') + '</i><strong>Turn letters to templates</strong></div>' +
      '<div class="ah-step ah-complete-step"><i class="ah-step-dot ah-done">' + icon('check') + '</i><strong>Pull latest templates from Google Drive</strong></div></div></div>';
    const activityRows = activity.map((item, index) => '<article class="ah-activity ah-activity-' + index + '"><div class="ah-activity-head ah-row-' + index + '"><span class="ah-row-chevron">' + icon('chevron') + '</span>' + avatar(item[4]) + '<div class="ah-activity-copy"><strong>' + escapeHTML(item[0]) + '</strong><small>' + escapeHTML(item[1]) + '</small></div><span class="ah-status ah-status-' + item[5] + '"><i></i>' + item[2] + '</span><span class="ah-time">' + item[3] + '</span></div>' + (index === 0 ? regularSteps : index === 3 ? failedSteps : '') + '</article>').join('');
    const logo = '<svg class="ah-workspace-logo" viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="6" fill="#f2a56a"/><g fill="#fff7e9"><rect x="6" y="6" width="4" height="4"/><rect x="14" y="6" width="4" height="4"/><rect x="10" y="10" width="4" height="4"/><rect x="6" y="14" width="4" height="4"/><rect x="14" y="14" width="4" height="4"/></g></svg>';

    const css = `
      .ah-scene{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#c3c4b9;color:#30343d;font-family:ProjectSans,sans-serif}.ah-scene *{box-sizing:border-box}.ah-scene .ah-background{position:absolute;inset:-70px;background:radial-gradient(ellipse at 11% 25%,#d6d8c9 0%,transparent 54%),radial-gradient(ellipse at 85% 71%,#698687 0%,transparent 47%),linear-gradient(167deg,#9bb0b7 0%,#bfc4b4 41%,#aeaa8d 57%,#83948b 100%);filter:blur(35px)}
      .ah-scene .ah-window{position:absolute;left:128px;top:91px;width:1664px;height:869px;border:1px solid #ffffffc0;border-radius:21px;background:#fff;overflow:hidden;box-shadow:0 35px 85px #263f3d29,0 5px 15px #34474312}.ah-scene .ah-sidebar{position:absolute;left:0;top:0;bottom:0;width:270px;background:#f4f4f3;border-right:1px solid #e9e9e7;padding:24px 20px;color:#8e9292}
      .ah-scene .ah-icon{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;flex:none}.ah-scene .ah-workspace-logo{width:29px;height:29px;flex:none}.ah-scene .ah-brand{display:flex;align-items:center;gap:11px;font-size:17px;color:#777d7a;padding:0 4px;margin-bottom:28px}.ah-scene .ah-brand>.ah-icon{margin-left:auto;width:15px;height:15px;color:#aeb3af}
      .ah-scene .ah-new-chat{height:39px;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e1e3e0;border-radius:9px;padding:0 12px;color:#7c8580;font-size:17px;box-shadow:0 2px 4px #36483f03;margin-bottom:14px}.ah-scene .ah-new-chat .ah-icon{width:18px;height:18px}.ah-scene .ah-nav-item{height:36px;display:flex;gap:10px;align-items:center;padding:0 12px;font-size:17px;color:#8c9490;border-radius:8px;margin:3px 0}.ah-scene .ah-nav-item .ah-icon{width:18px;height:18px;color:#a8afa9}.ah-scene .ah-nav-item.ah-selected{background:#e6e8e5;color:#59665e}.ah-scene .ah-beta{font-size:10px;line-height:17px;border:1px solid #e3e4e0;border-radius:4px;padding:0 4px;color:#a9afa8;margin-left:auto}
      .ah-scene .ah-sidebar-heading{font-size:13px;font-weight:450;color:#a8aea8;margin:23px 12px 8px}.ah-scene .ah-sidebar-line{display:flex;align-items:center;gap:10px;height:32px;padding:0 12px;font-size:15px;color:#8d9690;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-sidebar-line .ah-icon{width:16px;height:16px;color:#b4bbb5}.ah-scene .ah-sidebar-line>span{overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-sidebar-footer{position:absolute;left:24px;right:24px;bottom:25px;display:flex;align-items:center;gap:10px}.ah-scene .ah-user-avatar{height:33px;width:33px;border-radius:50%;background:#dfddd4;display:flex;align-items:center;justify-content:center;color:#9b9789;font-size:12px;letter-spacing:.6px}.ah-scene .ah-sidebar-footer strong{display:block;font-size:15px;font-weight:450;color:#7b867e}.ah-scene .ah-sidebar-footer small{display:block;font-size:11px;color:#b0b8b0;margin-top:4px}.ah-scene .ah-sidebar-footer>.ah-icon{margin-left:auto;width:17px;height:17px;color:#adb6ae}
      .ah-scene .ah-main{position:absolute;left:270px;right:0;top:0;bottom:0;background:#fff}.ah-scene .ah-topbar{position:absolute;left:0;right:0;top:0;height:73px;display:flex;align-items:center;justify-content:space-between;padding:0 36px;border-bottom:1px solid #efefed}.ah-scene .ah-topbar h1{font-size:24px;line-height:32px;font-weight:580;color:#454b47;margin:0;max-width:850px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-create-agent{height:36px;border:1px solid #dce0da;border-radius:8px;display:flex;gap:8px;align-items:center;padding:0 13px;color:#7b887e;background:#fafbf9;font-size:15px}.ah-scene .ah-create-agent .ah-icon{width:15px;height:15px}
      .ah-scene .ah-tabs{position:absolute;left:36px;right:36px;top:97px;height:45px;display:flex;align-items:stretch;gap:27px;border-bottom:1px solid #edeeeb}.ah-scene .ah-tab{font-size:19px;line-height:28px;position:relative;display:flex;align-items:flex-start;padding-top:4px;color:#a5aca5;min-width:99px}.ah-scene .ah-tab:after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:transparent}.ah-scene .ah-tab-my{color:#57645a}.ah-scene .ah-tab-my:after{background:#839488}.ah-scene .ah-tab-underline{position:absolute;left:0;bottom:-1px;width:99px;height:2px;background:#839488}.ah-scene .ah-tab-my:after{display:none}
      .ah-scene .ah-my-agents,.ah-scene .ah-hub{position:absolute;left:36px;right:36px;top:173px;bottom:24px}.ah-scene .ah-my-toolbar{height:36px;display:flex;align-items:center;justify-content:space-between}.ah-scene .ah-my-toolbar>div{display:flex;gap:10px;align-items:center}.ah-scene .ah-mini-button{height:34px;border:1px solid #e5e9e2;border-radius:7px;background:#fff;display:flex;gap:7px;align-items:center;padding:0 10px;font-size:15px;color:#98a491}.ah-scene .ah-mini-button .ah-icon{width:15px;height:15px}.ah-scene .ah-find{width:177px;justify-content:flex-start;color:#b1b9ac}.ah-scene .ah-grid-button{padding:0 9px}.ah-scene .ah-agent-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px 18px;margin-top:25px}.ah-scene .ah-agent-card{height:174px;border:1px solid #e5e9e1;border-radius:12px;padding:17px 18px;background:#fff;box-shadow:0 3px 7px #61735503}.ah-scene .ah-avatar{width:32px;height:32px;display:block;flex:none}.ah-scene .ah-agent-top{display:flex;align-items:center;justify-content:space-between}.ah-scene .ah-agent-top>span{display:flex;color:#b7c0b0}.ah-scene .ah-agent-top .ah-icon{width:18px;height:18px}.ah-scene .ah-agent-card h3{font-size:20px;line-height:27px;font-weight:530;color:#40474f;margin:11px 0 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-agent-card p{font-size:14px;line-height:22px;color:#8b929b;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-agent-meta{display:flex;align-items:center;justify-content:space-between;margin-top:13px;font-size:12px;color:#a5adb5}.ah-scene .ah-agent-meta .ah-icon{width:15px;height:15px}.ah-scene .ah-browse-title{font-size:21px;line-height:28px;font-weight:500;color:#59636e;margin:31px 0 16px}.ah-scene .ah-browse-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.ah-scene .ah-browse-card{height:115px;border:1px solid #e8ecdf;border-radius:11px;background:#fbfcfd;display:flex;gap:15px;align-items:flex-start;padding:20px 18px}.ah-scene .ah-browse-card h3{font-size:18px;line-height:25px;font-weight:500;color:#68727d;margin:0 0 7px}.ah-scene .ah-browse-card p{font-size:13px;line-height:21px;color:#98a1aa;margin:0}
      .ah-scene .ah-hub{opacity:0}.ah-scene .ah-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;height:80px}.ah-scene .ah-metric{border:1px solid #e7e9e7;border-radius:10px;background:#fcfdfc;padding:13px 16px;display:flex;align-items:center;justify-content:space-between}.ah-scene .ah-metric-label{display:flex;align-items:center;gap:8px;font-size:16px;color:#859086}.ah-scene .ah-metric-label i{display:block;width:6px;height:6px;border-radius:50%;background:currentColor}.ah-scene .ah-metric strong{font-family:ProjectDisplay,sans-serif;font-size:31px;font-weight:600;color:inherit}.ah-scene .ah-metric-active{color:#7793bd;background:#fafcff;border-color:#e5ecf4}.ah-scene .ah-metric-active .ah-metric-label{color:#8c9fba}.ah-scene .ah-metric-completed{color:#82a58d;background:#fbfdfb;border-color:#e7eee8}.ah-scene .ah-metric-completed .ah-metric-label{color:#96ab9a}.ah-scene .ah-metric-review{color:#a390b6;background:#fdfbff;border-color:#ede6f3}.ah-scene .ah-metric-review .ah-metric-label{color:#ac9cb9}.ah-scene .ah-metric-pending{color:#b9a773;background:#fefdf9;border-color:#f0ecdf}.ah-scene .ah-metric-pending .ah-metric-label{color:#b9ad8a}.ah-scene .ah-metric-failed{color:#b8908d;background:#fffafa;border-color:#f2e6e5}.ah-scene .ah-metric-failed .ah-metric-label{color:#baa09e}
      .ah-scene .ah-activity-toolbar{position:absolute;left:0;right:0;top:104px;height:32px;display:flex;align-items:center;justify-content:space-between}.ah-scene .ah-activity-toolbar h2{margin:0;font-size:21px;line-height:29px;font-weight:550;color:#5f6b77}.ah-scene .ah-activity-filter{font-size:14px;color:#a5b4a5;display:flex;align-items:center;gap:7px}.ah-scene .ah-activity-filter .ah-icon{width:14px;height:14px}.ah-scene .ah-feed{position:absolute;left:0;right:0;top:148px;bottom:0;overflow:hidden;border-top:1px solid #eaf0e8}.ah-scene .ah-activity{border-bottom:1px solid #edf0f3;background:#fff}.ah-scene .ah-activity-head{height:53px;display:flex;align-items:center;gap:11px;padding:3px 6px 3px 3px}.ah-scene .ah-row-chevron{width:18px;height:22px;display:flex;align-items:center;justify-content:center;color:#b3c0aa;flex:none;transform-origin:50% 50%}.ah-scene .ah-row-chevron .ah-icon{width:13px;height:13px}.ah-scene .ah-activity .ah-avatar{width:30px;height:30px}.ah-scene .ah-activity-copy{flex:1;min-width:0}.ah-scene .ah-activity-copy strong{font-size:18px;line-height:24px;font-weight:500;color:#606b78;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-activity-copy small{font-size:13px;line-height:19px;color:#a2aab3;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ah-scene .ah-status{font-size:12px;line-height:21px;display:flex;align-items:center;gap:6px;min-width:103px;justify-content:flex-start}.ah-scene .ah-status i{height:5px;width:5px;border-radius:50%;background:currentColor}.ah-scene .ah-status-active{color:#6885b0}.ah-scene .ah-status-completed{color:#759770}.ah-scene .ah-status-review{color:#9679ad}.ah-scene .ah-status-pending{color:#a18d58}.ah-scene .ah-status-failed{color:#b1817b}.ah-scene .ah-time{font-size:12px;line-height:20px;width:38px;color:#afb7c0;text-align:right}
      .ah-scene .ah-details{height:0;overflow:hidden;background:#fcfcfd}.ah-scene .ah-timeline{position:relative;padding:9px 20px 13px 106px;height:178px}.ah-scene .ah-timeline-line{position:absolute;left:84px;top:17px;bottom:29px;border-left:1px solid #dde8d5}.ah-scene .ah-step{position:relative;min-height:49px;padding-top:2px}.ah-scene .ah-step strong{display:block;font-weight:450;font-size:17px;line-height:25px;color:#74808b;white-space:nowrap}.ah-scene .ah-step small{display:block;font-size:12px;line-height:18px;color:#aeb7bf;margin-top:1px}.ah-scene .ah-step-dot{position:absolute;left:-26px;top:10px;width:9px;height:9px;border-radius:50%;background:#e0e8d7;border:1px solid #d4dfc6}.ah-scene .ah-step-dot.ah-running{background:#9dadda;border-color:#9dadda;box-shadow:0 0 0 3px #eef0fb}.ah-scene .ah-step-dot.ah-done{width:13px;height:13px;left:-28px;top:8px;display:flex;align-items:center;justify-content:center;background:#9eba8e;border-color:#9eba8e;color:white}.ah-scene .ah-step-dot .ah-icon{width:10px;height:10px;stroke-width:2}
      .ah-scene .ah-failure-timeline{height:248px;padding-top:9px}.ah-scene .ah-failure-timeline .ah-timeline-line{bottom:25px}.ah-scene .ah-wait-step{min-height:48px}.ah-scene .ah-failure-box{position:relative;margin:3px 0 9px -12px;padding:11px 13px;border:1px solid #efd8d2;background:#fff4f0;border-radius:9px;height:84px}.ah-scene .ah-failure-dot{position:absolute;left:-18px;top:20px;border:1px solid #cea59b;border-radius:50%;width:14px;height:14px;line-height:12px;text-align:center;background:#d8aaa0;color:#fff;font-size:10px;font-style:normal}.ah-scene .ah-failure-top{display:flex;align-items:center;justify-content:space-between;gap:12px}.ah-scene .ah-failure-top>strong{font-size:17px;font-weight:500;line-height:24px;color:#a17165}.ah-scene .ah-failure-buttons{display:flex;align-items:center;gap:8px;flex:none}.ah-scene .ah-failure-buttons>span{display:flex;align-items:center;gap:5px;font-size:12px;line-height:20px;padding:3px 9px;border:1px solid #e7cac0;background:#fffcfa;border-radius:5px;color:#ad8070}.ah-scene .ah-failure-buttons .ah-icon{width:13px;height:13px}.ah-scene .ah-failure-box p{font-size:13px;line-height:20px;color:#b89587;margin:8px 0 0}.ah-scene .ah-complete-step{min-height:39px}.ah-scene .ah-complete-step strong{font-size:16px;line-height:25px;color:#849a8c}
      .ah-scene .ah-pointer{position:absolute;left:0;top:0;width:38px;height:46px;z-index:20;filter:drop-shadow(0 2px 3px #32483320);pointer-events:none}.ah-scene .ah-pointer .fx-cursor{position:static;width:38px;height:46px;display:block}.ah-scene .ah-ring{position:absolute;left:0;top:0;width:45px;height:45px;margin:-22.5px 0 0 -22.5px;border:1.5px solid #a1b5a0;border-radius:50%;opacity:0;z-index:19;pointer-events:none}.ah-scene .ah-proof{position:absolute;right:130px;bottom:46px;font-size:18px;line-height:26px;color:#eef2e8;text-shadow:0 1px 5px #2d453455}
    `;

    ctx.root.innerHTML = '<div class="ah-scene"><style>' + css + '</style><div class="ah-background"></div><section class="ah-window"><aside class="ah-sidebar"><div class="ah-brand">' + logo + '<span>Workspace</span>' + icon('down') + '</div><div class="ah-new-chat">' + icon('plus') + 'New Chat</div><div class="ah-nav-item">' + icon('bolt') + 'Automations</div><div class="ah-nav-item ah-selected">' + icon('grid') + 'Agents</div><div class="ah-nav-item">' + icon('sparkle') + 'Intelligence <span class="ah-beta">Beta</span></div>' +
      '<div class="ah-sidebar-heading">Projects</div><div class="ah-sidebar-line">' + icon('folder') + 'Design</div><div class="ah-sidebar-line">' + icon('folder') + 'Travel Planning</div><div class="ah-sidebar-line">' + icon('folder') + 'Starred Convo</div><div class="ah-sidebar-heading">Latest Agent Chats</div><div class="ah-sidebar-line">' + icon('chat') + '<span>' + escapeHTML(p.agentName) + '</span></div><div class="ah-sidebar-line">' + icon('chat') + 'Onboarding Buddy</div><div class="ah-sidebar-line">' + icon('chat') + 'Contract Review</div><div class="ah-sidebar-heading">Chats</div><div class="ah-sidebar-line">' + icon('chat') + 'Project notes</div><div class="ah-sidebar-line">' + icon('chat') + 'Weekly planning</div><div class="ah-sidebar-line">' + icon('chat') + 'Design ideas</div><div class="ah-sidebar-footer"><span class="ah-user-avatar">AL</span><div><strong>Alex</strong><small>Personal workspace</small></div>' + icon('more') + '</div></aside>' +
      '<main class="ah-main"><div class="ah-topbar"><h1>' + escapeHTML(p.title) + '</h1><div class="ah-create-agent">' + icon('plus') + 'Create an Agent</div></div><div class="ah-tabs"><span class="ah-tab ah-tab-my">My Agents</span><span class="ah-tab ah-tab-hub">Agent Hub</span><i class="ah-tab-underline"></i></div>' +
      '<section class="ah-my-agents"><div class="ah-my-toolbar"><div><span class="ah-mini-button">Latest used ' + icon('down') + '</span><span class="ah-mini-button">' + icon('plus') + 'Filters</span></div><div><span class="ah-mini-button ah-find">' + icon('search') + 'Find</span><span class="ah-mini-button ah-grid-button">' + icon('grid') + '</span></div></div><div class="ah-agent-grid">' + agents.map(agentCard).join('') + '</div><h2 class="ah-browse-title">Browse Agents</h2><div class="ah-browse-grid">' + browse.map(item => '<article class="ah-browse-card">' + avatar(item[2]) + '<div><h3>' + escapeHTML(item[0]) + '</h3><p>' + escapeHTML(item[1]) + '</p></div></article>').join('') + '</div></section>' +
      '<section class="ah-hub"><div class="ah-metrics">' + [['Active',5,'active'],['Completed',32,'completed'],['Needs Review',9,'review'],['Pending',6,'pending'],['Failed',5,'failed']].map(item => '<div class="ah-metric ah-metric-' + item[2] + '"><span class="ah-metric-label"><i></i>' + item[0] + '</span><strong>' + item[1] + '</strong></div>').join('') + '</div><div class="ah-activity-toolbar"><h2>Latest Activity</h2><span class="ah-activity-filter">Status: All ' + icon('down') + '</span></div><div class="ah-feed">' + activityRows + '</div></section></main></section><div class="ah-pointer">' + ctx.cursor() + '</div><div class="ah-ring"></div><div class="ah-proof">参考界面重建 · 原创节奏/头像</div></div>';

    const tl = ctx.gsap.timeline({paused: true});
    tl.set(ctx.q('.ah-my-agents'), {opacity: 1}, 0);
    tl.set(ctx.q('.ah-hub'), {opacity: 0}, 0);
    tl.set(ctx.qa('.ah-details'), {height: 0}, 0);
    tl.set(ctx.q('.ah-pointer'), {x: 1010, y: 812, opacity: 0, scale: 1}, 0);
    tl.set(ctx.q('.ah-ring'), {x: 0, y: 0, opacity: 0, scale: 0.45}, 0);
    tl.set(ctx.q('.ah-tab-underline'), {x: 0, width: ctx.q('.ah-tab-my').offsetWidth}, 0);
    tl.set(ctx.qa('.ah-row-chevron'), {rotation: 0}, 0);

    const hubTab = center(ctx, '.ah-tab-hub');
    point(ctx, tl, hubTab, 2.35, 0.65);
    tap(ctx, tl, hubTab, 3.0);
    tl.to(ctx.q('.ah-tab-my'), {color: '#a5aca5', duration: 0.2}, 3.0);
    tl.to(ctx.q('.ah-tab-hub'), {color: '#57645a', duration: 0.2}, 3.0);
    tl.to(ctx.q('.ah-tab-underline'), {x: ctx.q('.ah-tab-hub').offsetLeft, width: ctx.q('.ah-tab-hub').offsetWidth, duration: 0.32, ease: 'power2.inOut'}, 3.0);
    tl.fromTo(ctx.q('.ah-my-agents'), {opacity: 1}, {opacity: 0, duration: 0.22, immediateRender: false}, 3.05);
    tl.fromTo(ctx.q('.ah-hub'), {opacity: 0}, {opacity: 1, duration: 0.35, immediateRender: false}, 3.25);

    const firstRow = center(ctx, '.ah-row-0 .ah-activity-copy');
    firstRow.x -= 280;
    point(ctx, tl, firstRow, 5.4, 0.6);
    tap(ctx, tl, firstRow, 6.0);
    tl.to(ctx.q('.ah-row-0 .ah-row-chevron'), {rotation: 90, duration: 0.22}, 6.0);
    tl.fromTo(ctx.q('.ah-first-details'), {height: 0}, {height: 178, duration: 0.55, ease: 'power2.inOut', immediateRender: false}, 6.05);
    tl.to(ctx.q('.ah-row-0'), {backgroundColor: '#fafcf7', duration: 0.22}, 6.05);

    point(ctx, tl, firstRow, 8.3, 0.45);
    tap(ctx, tl, firstRow, 8.75);
    tl.fromTo(ctx.q('.ah-first-details'), {height: 178}, {height: 0, duration: 0.45, ease: 'power2.inOut', immediateRender: false}, 8.78);
    tl.to(ctx.q('.ah-row-0 .ah-row-chevron'), {rotation: 0, duration: 0.22}, 8.75);
    tl.to(ctx.q('.ah-row-0'), {backgroundColor: '#fff', duration: 0.22}, 8.78);

    const resumeRow = center(ctx, '.ah-row-3 .ah-activity-copy');
    resumeRow.x -= 280;
    point(ctx, tl, resumeRow, 9.5, 0.65);
    tap(ctx, tl, resumeRow, 10.15);
    tl.to(ctx.q('.ah-row-3 .ah-row-chevron'), {rotation: 90, duration: 0.22}, 10.15);
    tl.fromTo(ctx.q('.ah-failed-details'), {height: 0}, {height: 248, duration: 0.55, ease: 'power2.inOut', immediateRender: false}, 10.2);
    tl.to(ctx.q('.ah-row-3'), {backgroundColor: '#fffaf8', duration: 0.25}, 10.2);

    const manage = center(ctx, '.ah-manage');
    point(ctx, tl, manage, 11.15, 0.65);
    tl.to(ctx.q('.ah-manage'), {backgroundColor: '#fff3ed', borderColor: '#d7b5a7', color: '#b28673', duration: 0.25}, 11.8);
    // The reference ends here with an unresolved failed action. No success state
    // or completed rerun is invented; the pointer only hovers Manage workflow.
    tl.to({}, {duration: 0.01}, 15.99);
    return {timeline: tl, duration: 16};
  });
})();
