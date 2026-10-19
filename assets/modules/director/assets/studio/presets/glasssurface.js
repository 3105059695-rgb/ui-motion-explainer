/* Collect UI / motion_conquest: eight observed glass-control groups, horizontal adaptation. */
(function () {
  'use strict';
  const icon = (body, fill = 'none') => `<svg viewBox="0 0 48 48" aria-hidden="true" fill="${fill}" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  const icons = {
    play: icon('<path d="m17 10 22 14-22 14z"/>', 'currentColor'),
    pause: icon('<path d="M16 11h5v26h-5zM29 11h5v26h-5z"/>', 'currentColor'),
    heart: icon('<path d="M24 39S6 27 6 17c0-11 14-13 18-4 5-9 18-7 18 4 0 10-18 22-18 22z"/>'),
    share: icon('<path d="M13 24v16h23V24M24 29V6m-9 9 9-9 9 9"/>'),
    next: icon('<path d="m7 12 15 12L7 36zm15 0 15 12-15 12z"/>', 'currentColor'),
    wifi: icon('<path d="M6 16a27 27 0 0 1 36 0M12 23a18 18 0 0 1 24 0M18 30a9 9 0 0 1 12 0"/><circle cx="24" cy="37" r="2" fill="currentColor"/>'),
    moon: icon('<path d="M34 34A18 18 0 0 1 16 7a19 19 0 1 0 24 27z"/>', 'currentColor'),
    sun: icon('<circle cx="24" cy="24" r="7"/><path d="M24 3v6M24 39v6M3 24h6M39 24h6M9 9l4 4M35 35l4 4M9 39l4-4M35 13l4-4"/>'),
    volume: icon('<path d="M6 19h8l10-9v28L14 29H6z" fill="currentColor"/><path d="M31 17a12 12 0 0 1 0 14M37 10a21 21 0 0 1 0 28"/>'),
    torch: icon('<path d="M13 5h22v10l-6 9v18H19V24l-6-9zM23 28v6"/>'),
    home: icon('<path d="m5 23 19-18 19 18M11 18v24h26V18M20 42V29h8v13"/>'),
    search: icon('<circle cx="20" cy="20" r="13"/><path d="m30 30 12 12"/>'),
    activity: icon('<rect x="7" y="27" width="7" height="15" rx="2"/><rect x="21" y="17" width="7" height="25" rx="2"/><rect x="35" y="7" width="7" height="35" rx="2"/>'),
    user: icon('<circle cx="24" cy="14" r="9"/><path d="M7 42c0-21 34-21 34 0"/>'),
    note: icon('<path d="M10 15h28M10 24h28M10 33h28"/>'),
    music: icon('<path d="M20 34V11l20-5v25M20 16l20-5"/><ellipse cx="13" cy="35" rx="7" ry="5" fill="currentColor"/><ellipse cx="33" cy="32" rx="7" ry="5" fill="currentColor"/>'),
    drop: icon('<path d="M24 4S8 22 8 31a16 16 0 0 0 32 0C40 22 24 4 24 4z" fill="currentColor" stroke="none"/><ellipse cx="24" cy="32" rx="6" ry="8" fill="#69b6fa" stroke="none"/>'),
    fitness: icon('<circle cx="24" cy="24" r="18" stroke="#ff4767" stroke-width="6"/><circle cx="24" cy="24" r="11" stroke="#69db64" stroke-width="5"/><circle cx="24" cy="24" r="5" stroke="#25bcea" stroke-width="4"/>')
  };
  const source = 'https://x.com/motion_conquest/status/2103510103622308152';
  const media = 'https://cdn.collectui.com/amplify_video/2103509946549862400/vid/avc1/1440x1440/S4ExV5YQo4oJB7UU-optimized.mp4';
  const sectionRanges = [
    {id:'buttons',start:0,end:4}, {id:'player',start:4,end:8.6},
    {id:'lens',start:8.6,end:14}, {id:'controls',start:14,end:19},
    {id:'navigation',start:19,end:23}, {id:'chart',start:23,end:27.4},
    {id:'search',start:27.4,end:31.8}, {id:'notifications',start:31.8,end:36}
  ];
  UIFX.register({
    id:'interaction-liquid-glass-control-suite', title:'液态玻璃 · 八组连续控件', category:'interaction', duration:36,
    source, referenceMedia:media, sourceStatus:'observed-reconstruction', sourceObservation:'multiple-video-times',
    description:'圆形分裂与回收、播放器换曲、玻璃镜片、控制中心、导航胶囊、柱图提示、键盘搜索和通知叠放，八组完整演示中每次只有一个操作中心。',
    adaptationNotes:'依据1440×1440、16.042秒原片主要状态重建为36秒横屏，保留八组与尾部文字镜片。中文文案、清楚标示的示例数据、SVG图标和模拟光标独立编排；局部折射为裁剪文字与SVG位移滤镜的程序近似。未接入音乐、系统设置、搜索或渲染业务。',
    tags:['Collect UI','Motion','Liquid Glass','玻璃折射','控件反馈','连续选区','完整八组'],
    sectionRanges, params:{title:'液态玻璃',prompt:'玻璃',result:'渲染完成'}
  }, function(c,p) {
    const e=c.esc, title=String(p.title||'液态玻璃'), prompt=String(p.prompt||'玻璃'), result=String(p.result||'渲染完成');
    if(Array.from(title).length>12) throw Error('Glass suite title must be 12 Unicode characters or fewer.');
    if(Array.from(prompt).length>12) throw Error('Glass suite query must be 12 Unicode characters or fewer.');
    if(Array.from(result).length>28) throw Error('Glass suite result must be 28 Unicode characters or fewer.');
    const artwork='<div class="gs-art"><i></i><b></b></div>';
    const bars=[5800,7100,5600,8500,11000,10200,10000];
    const navNames=['首页','搜索','动态','我的'], navIcons=['home','search','activity','user'];
    const words=['流动。','轻快。','鲜活。','玻璃。'];
    const wordMarkup=words.map((word,i)=>`<div class="gs-word gs-word-${i}">${e(word)}</div>`).join('');
    const searchNames=[prompt+'应用',prompt+'灵感',prompt+'时光'];
    const lensMarkup=(tail=false)=>`<div class="gs-type gs-${tail?'tail':'type-main'}"><div class="gs-type-base">${tail?`<div class="gs-tail-word">${e(title)}</div>`:wordMarkup}</div><div class="gs-lens-copy">${tail?`<div class="gs-tail-word">${e(title)}</div>`:wordMarkup}</div><div class="gs-lens-surface gs-glass"></div>${tail?'<p class="gs-tail-line">为流动而设计</p>':''}</div>`;
    c.root.innerHTML=`<style>
      .gs-scene{background:#e0e5f0;color:#18191d;font-family:ProjectSans,sans-serif;isolation:isolate}
      .gs-scene *{box-sizing:border-box}.gs-scene svg{display:block;width:48px;height:48px}.gs-scene p{margin:0}
      .gs-bg{position:absolute;inset:-100px;background:radial-gradient(ellipse at 12% 15%,#aea8e7 0%,transparent 44%),radial-gradient(ellipse at 87% 20%,#9dcedc 0%,transparent 42%),radial-gradient(ellipse at 58% 87%,#ecded5 0%,transparent 48%),linear-gradient(122deg,#d4d7e9,#e3e9ed);filter:blur(35px)}
      .gs-bg:after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 46% 44%,#f8f1f388 0%,transparent 50%)}
      .gs-heading{position:absolute;left:114px;top:98px;font-size:28px;letter-spacing:5px;font-weight:500;color:#444a59;max-width:900px;white-space:nowrap}
      .gs-count{position:absolute;right:114px;top:105px;font-size:26px;letter-spacing:5px;color:#4a5160;font-variant-numeric:tabular-nums}
      .gs-foot{position:absolute;left:114px;bottom:154px;font-size:25px;letter-spacing:4px;color:#4a5160}
      .gs-note{position:absolute;right:114px;bottom:153px;font-size:23px;color:#606674}.gs-note i{display:inline-block;width:7px;height:7px;margin-right:9px;border-radius:50%;background:#a1a7b5}.gs-note i:last-of-type{background:#167be8}
      .gs-glass{border:1.6px solid #ffffffcc;background:linear-gradient(140deg,#ffffff83,#f5faff36 48%,#dbeaf066);box-shadow:inset 2px 3px 13px #fff9,inset -3px -6px 11px #fff4,0 17px 42px -16px #34364a68;backdrop-filter:blur(20px)}
      .gs-section{position:absolute;left:0;top:0;width:1920px;height:1080px;opacity:0;transform-origin:960px 510px}
      .gs-center{position:absolute;left:960px;top:510px;transform:translate(-50%,-50%)}
      .gs-seed{width:158px;height:158px;border-radius:50%;opacity:0;position:absolute;left:881px;top:431px}
      .gs-fusion{position:absolute;left:960px;top:510px;transform:translate(-50%,-50%);width:560px;height:152px;border-radius:90px;opacity:0}
      .gs-buttons{width:640px;height:170px;display:flex;gap:65px;align-items:center;justify-content:center}
      .gs-button{width:158px;height:158px;border-radius:50%;display:grid;place-items:center;position:relative}
      .gs-button svg{width:56px;height:56px}.gs-button .gs-pause{position:absolute;opacity:0}.gs-heart svg{fill:transparent}
      .gs-play-ring{position:absolute;inset:14px;border-radius:50%;border:4px solid #ffffffad;opacity:0}
      .gs-spark{position:absolute;left:960px;top:510px;width:10px;height:10px;border-radius:50%;background:#fa577e;opacity:0}
      .gs-player{width:930px;height:486px;border-radius:52px;padding:42px 46px;background:linear-gradient(130deg,#242326ef,#17181bea);color:#fff;border:1px solid #ffffff35;box-shadow:inset 0 4px 14px #fff1,0 22px 55px -16px #22243579;overflow:hidden}
      .gs-player-top{display:flex;gap:31px;align-items:center;height:174px;position:relative}.gs-art{width:164px;height:164px;border-radius:34px;overflow:hidden;position:relative;background:linear-gradient(130deg,#a077e7,#d9a3c5 65%,#f6b391);flex:none}
      .gs-art i{position:absolute;left:74px;top:22px;width:68px;height:68px;border-radius:50%;background:#fff5}.gs-art b{position:absolute;left:-30px;bottom:-40px;width:240px;height:105px;border-radius:50%;background:#59448580}
      .gs-track{width:480px;overflow:hidden;height:110px}.gs-track-stack{height:220px;position:relative}.gs-track-copy{height:110px;display:flex;flex-direction:column;justify-content:center}.gs-track-copy strong{font-size:44px;font-weight:600;line-height:1.45;white-space:nowrap}.gs-track-copy span{font-size:28px;color:#bfc1cb}
      .gs-eq{display:flex;gap:9px;align-items:center;height:58px;position:absolute;right:4px;top:34px}.gs-eq i{width:8px;height:30px;border-radius:6px;background:#f4b293;transform-origin:center}
      .gs-progress{position:relative;margin-top:54px;width:100%;height:10px;border-radius:8px;background:#ffffff2b;overflow:hidden}.gs-progress-fill{height:100%;width:18%;background:#fff;border-radius:8px;box-shadow:0 0 15px #fff9}
      .gs-progress-times{display:flex;justify-content:space-between;font-size:25px;margin-top:16px;color:#cacbd2;font-variant-numeric:tabular-nums}
      .gs-transport{display:flex;justify-content:center;align-items:center;gap:115px;height:94px;margin-top:14px}.gs-transport-button{width:78px;height:78px;display:grid;place-items:center;border-radius:50%;position:relative}.gs-transport-button:before{content:'';position:absolute;inset:0;border-radius:50%;background:#fff1;border:1px solid #fff1;opacity:0}.gs-transport-button svg{width:46px;height:46px}.gs-previous svg{transform:rotate(180deg)}.gs-transport-play{position:absolute}.gs-transport-pause{opacity:0}
      .gs-type{position:absolute;left:320px;top:330px;width:1280px;height:350px;--lens-x:340px}.gs-type-base,.gs-lens-copy{position:absolute;inset:0;overflow:hidden}.gs-word,.gs-tail-word{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:202px;line-height:1.1;font-weight:700;letter-spacing:-7px;white-space:nowrap}
      .gs-word:not(.gs-word-0){transform:translateY(360px)}.gs-lens-copy{clip-path:ellipse(148px 136px at calc(50% + var(--lens-x)) 50%);filter:url(#gs-refract-control-suite);z-index:3;pointer-events:none}.gs-lens-copy .gs-word,.gs-lens-copy .gs-tail-word{transform-origin:center;letter-spacing:-6px}
      .gs-lens-surface{position:absolute;left:calc(50% - 148px + var(--lens-x));top:39px;width:296px;height:272px;border-radius:48% 51% 47% 49%;background:linear-gradient(140deg,#ffffff34,#eaf6ff12);backdrop-filter:blur(.3px);z-index:2;box-shadow:inset 2px 4px 16px #fff8,0 14px 24px -15px #56516955}
      .gs-grid{display:grid;grid-template-columns:repeat(3,264px);grid-template-rows:repeat(2,224px);gap:28px}.gs-tile{position:relative;border-radius:44px;padding:28px;overflow:hidden;transform-origin:center}.gs-tile>svg{width:48px;height:48px;position:relative;z-index:2}.gs-tile-copy{position:absolute;left:28px;bottom:24px;z-index:3}.gs-tile-copy strong{font-size:29px;font-weight:600;display:block;line-height:1.5}.gs-tile-copy span{font-size:24px;display:block;line-height:1.4}.gs-wifi{background:#1689f8;color:#fff}.gs-tile-color{position:absolute;inset:0;border-radius:inherit;background:#8172f2;opacity:0}.gs-torch .gs-tile-color{background:#fff198}
      .gs-mini-art{position:absolute;left:28px;top:27px}.gs-mini-art .gs-art{width:85px;height:85px;border-radius:21px;background:linear-gradient(135deg,#1fadc7,#0785ed)}.gs-mini-art .gs-art i{left:44px;top:12px;width:32px;height:32px}.gs-mini-art .gs-art b{width:120px;height:64px;bottom:-30px;left:-15px;background:#0762b690}.gs-tile .gs-eq{right:25px;top:35px;gap:6px}.gs-tile .gs-eq i{height:23px;width:6px;background:#61c9c3}
      .gs-slider-fill{position:absolute;left:0;right:0;bottom:0;background:#ffffffde;height:32%;border-radius:0 0 40px 40px}.gs-slider>svg{position:absolute;left:108px;bottom:26px;width:46px;height:46px}.gs-bright .gs-slider-fill{height:84px}.gs-volume .gs-slider-fill{height:62px}
      .gs-nav{width:1120px;height:160px;display:flex;align-items:center;border-radius:85px;position:relative;padding:9px}.gs-nav-pill{position:absolute;left:9px;top:9px;width:276px;height:142px;border-radius:76px;box-shadow:inset 2px 3px 12px #fff9,0 0 18px #fff4;background:#a4a9b522;border:1px solid #ffffff7a}
      .gs-nav-item{width:276px;text-align:center;z-index:2;position:relative;display:flex;align-items:center;flex-direction:column;gap:10px;font-size:28px;font-weight:500;color:#292c35}.gs-nav-item svg{width:47px;height:47px}.gs-nav-item:first-of-type{color:#1687f5}
      .gs-chart{width:940px;height:608px;border-radius:49px;padding:44px 52px}.gs-chart-heading{display:flex;justify-content:space-between;align-items:start}.gs-chart-heading strong{font-size:44px;font-weight:600}.gs-chart-heading p{font-size:28px;color:#646b77;margin-top:6px}.gs-chart-total{font-size:43px;font-weight:600;font-variant-numeric:tabular-nums}
      .gs-plot{position:absolute;left:54px;right:54px;bottom:75px;height:344px;border-bottom:1px solid #9ba1b83c;background:repeating-linear-gradient(to top,transparent 0,transparent 111px,#9ba1b827 112px,#9ba1b827 113px);display:flex;align-items:end;justify-content:space-around}
      .gs-column{width:55px;border-radius:16px 16px 7px 7px;background:#272831;transform-origin:bottom;position:relative}.gs-day{position:absolute;bottom:-45px;left:50%;transform:translateX(-50%);font-size:24px;color:#646b77;white-space:nowrap}
      .gs-tooltip{position:absolute;left:494px;top:166px;width:246px;height:89px;border-radius:26px;text-align:center;display:flex;flex-direction:column;justify-content:center;opacity:0;z-index:5}.gs-tooltip strong{font-size:27px}.gs-tooltip span{font-size:23px;color:#737985}
      .gs-search-shell{width:910px;height:428px;border-radius:44px;overflow:hidden;position:absolute;left:505px;top:283px}.gs-input{height:100px;display:flex;align-items:center;gap:24px;padding:0 36px;border-bottom:1px solid #7e899a26;font-size:36px;white-space:nowrap}.gs-input svg{width:33px;height:33px;color:#5d6675}.gs-input-caret{height:38px;width:2px;background:#1886f3;margin-left:-22px}
      .gs-results{position:relative;padding:10px 15px;height:312px}.gs-search-highlight{position:absolute;top:10px;left:15px;width:878px;height:95px;border-radius:23px;background:#0789ff;box-shadow:inset 0 4px 12px #d2eeffb0,0 0 19px #007cff50;opacity:0}
      .gs-search-row{height:96px;display:flex;align-items:center;gap:21px;padding:11px 16px;position:relative;z-index:2;opacity:0}.gs-app-icon{width:65px;height:65px;border-radius:16px;display:grid;place-items:center;flex:none;color:#fff;background:linear-gradient(140deg,#306dff,#06b6f1)}.gs-app-icon svg{width:45px;height:45px}.gs-app-note{background:linear-gradient(#ffd635 0 26%,#fff 26%);color:#989eaa}.gs-app-music{background:linear-gradient(135deg,#ff8395,#ff3b67)}.gs-app-fitness{background:#11121a}
      .gs-search-row strong{display:block;font-size:31px;line-height:1.35;font-weight:600;white-space:nowrap;max-width:690px;overflow:hidden;text-overflow:ellipsis}.gs-search-row span{font-size:24px;line-height:1.4;color:inherit;opacity:.75}.gs-key{position:absolute;left:960px;top:816px;transform:translateX(-50%);width:344px;height:51px;padding:10px 20px;background:#343948ba;border:1px solid #ffffff52;border-radius:15px;color:#fff;font-size:24px;line-height:30px;text-align:center;opacity:0}
      .gs-notifications{position:absolute;left:510px;top:275px;width:900px;height:430px}.gs-notification{position:absolute;left:0;top:0;width:900px;height:134px;border-radius:37px;padding:23px 28px;display:flex;gap:23px;align-items:center;opacity:0}.gs-notification .gs-app-icon{width:80px;height:80px;border-radius:23px}.gs-notification .gs-app-icon svg{width:58px;height:58px}.gs-notification-copy{max-width:700px;overflow:hidden}.gs-notification-copy small{font-size:20px;color:#697181;display:block;line-height:1.2;letter-spacing:1px}.gs-notification-copy strong{font-size:31px;font-weight:600;display:block;line-height:1.4;white-space:nowrap;max-width:690px;overflow:hidden;text-overflow:ellipsis}.gs-notification-copy p{font-size:25px;color:#616a77;white-space:nowrap}.gs-now{position:absolute;top:24px;right:29px;font-size:21px;color:#5f6875}
      .gs-tail{opacity:0}.gs-tail-word{font-size:${Math.max(84,Math.min(180,850/Math.max(4,Array.from(title).length)))}px;letter-spacing:-4px}.gs-tail-line{position:absolute;left:0;right:0;bottom:-43px;text-align:center;font-size:32px;font-weight:500;opacity:0}.gs-scene .fx-cursor{opacity:0}.gs-click-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:2px solid #fff;border-radius:50%;opacity:0;z-index:91;pointer-events:none}
    </style><div class="fx-scene gs-scene">
      <svg style="position:absolute;width:0;height:0" aria-hidden="true"><defs><filter id="gs-refract-control-suite" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".014 .009" numOctaves="1" seed="7" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="16" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>
      <div class="gs-bg"></div><div class="gs-heading">${e(title)}</div><div class="gs-count">01 / 08</div><div class="gs-foot">按钮</div><div class="gs-note"><i></i><i></i><i></i><i></i>界面示意</div>
      <div class="gs-section gs-s1"><div class="gs-seed gs-glass"></div><div class="gs-fusion gs-glass"></div><div class="gs-buttons gs-center"><div class="gs-button gs-play gs-glass"><div class="gs-play-ring"></div><span class="gs-play-icon">${icons.play}</span><span class="gs-pause">${icons.pause}</span></div><div class="gs-button gs-heart gs-glass">${icons.heart}</div><div class="gs-button gs-share gs-glass">${icons.share}</div></div>${Array.from({length:10},(_,i)=>`<i class="gs-spark gs-spark-${i}"></i>`).join('')}</div>
      <div class="gs-section gs-s2"><div class="gs-player gs-center"><div class="gs-player-top">${artwork}<div class="gs-track"><div class="gs-track-stack"><div class="gs-track-copy"><strong>数字云</strong><span>A. M.</span></div><div class="gs-track-copy"><strong>玻璃之心</strong><span>Nova Bloom</span></div></div></div><div class="gs-eq">${'<i></i>'.repeat(5)}</div></div><div class="gs-progress"><div class="gs-progress-fill"></div></div><div class="gs-progress-times"><span class="gs-elapsed">0:39</span><span class="gs-remaining">−2:53</span></div><div class="gs-transport"><div class="gs-transport-button gs-previous">${icons.next}</div><div class="gs-transport-button gs-player-toggle"><span class="gs-transport-play">${icons.play}</span><span class="gs-transport-pause">${icons.pause}</span></div><div class="gs-transport-button gs-next">${icons.next}</div></div></div></div>
      <div class="gs-section gs-s3">${lensMarkup()}</div>
      <div class="gs-section gs-s4"><div class="gs-grid gs-center"><div class="gs-tile gs-wifi gs-glass">${icons.wifi}<div class="gs-tile-copy"><strong>Wi-Fi</strong><span>家庭网络</span></div></div><div class="gs-tile gs-focus gs-glass"><div class="gs-tile-color"></div>${icons.moon}<div class="gs-tile-copy"><strong>专注模式</strong><span class="gs-focus-state">关闭</span></div></div><div class="gs-tile gs-mini-player gs-glass"><div class="gs-mini-art">${artwork}</div><div class="gs-eq">${'<i></i>'.repeat(4)}</div><div class="gs-tile-copy"><strong>玻璃之心</strong><span>Nova Bloom</span></div></div><div class="gs-tile gs-slider gs-bright gs-glass"><div class="gs-slider-fill"></div>${icons.sun}</div><div class="gs-tile gs-slider gs-volume gs-glass"><div class="gs-slider-fill"></div>${icons.volume}</div><div class="gs-tile gs-torch gs-glass"><div class="gs-tile-color"></div>${icons.torch}<div class="gs-tile-copy"><strong>手电筒</strong><span class="gs-torch-state">关闭</span></div></div></div></div>
      <div class="gs-section gs-s5"><div class="gs-nav gs-center gs-glass"><div class="gs-nav-pill"></div>${navNames.map((n,i)=>`<div class="gs-nav-item gs-nav-${i}">${icons[navIcons[i]]}<span>${n}</span></div>`).join('')}</div></div>
      <div class="gs-section gs-s6"><div class="gs-chart gs-center gs-glass"><div class="gs-chart-heading"><div><strong>本周动态</strong><p>步数 · 示例数据</p></div><div class="gs-chart-total">0</div></div><div class="gs-plot">${bars.map((v,i)=>`<div class="gs-column gs-column-${i}" style="height:${v/11000*344}px"><span class="gs-day">${['一','二','三','四','五','六','日'][i]}</span></div>`).join('')}</div><div class="gs-tooltip gs-glass"><strong>11,000 步</strong><span>星期五</span></div></div></div>
      <div class="gs-section gs-s7"><div class="gs-search-shell gs-glass"><div class="gs-input">${icons.search}<span class="gs-query"></span><i class="gs-input-caret"></i></div><div class="gs-results"><div class="gs-search-highlight"></div>${searchNames.map((n,i)=>`<div class="gs-search-row gs-row-${i}"><div class="gs-app-icon ${i===1?'gs-app-note':i===2?'gs-app-music':''}">${icons[['drop','note','music'][i]]}</div><div><strong>${e(n)}</strong><span>${['应用程序','笔记','音乐'][i]}</span></div></div>`).join('')}</div></div><div class="gs-key"></div></div>
      <div class="gs-section gs-s8"><div class="gs-notifications"><div class="gs-notification gs-n0 gs-glass"><div class="gs-app-icon">${icons.drop}</div><div class="gs-notification-copy"><small>${e(title)}</small><strong>${e(result)}</strong><p>960 帧 · 60 fps · 示例结果</p></div><span class="gs-now">现在</span></div><div class="gs-notification gs-n1 gs-glass"><div class="gs-app-icon gs-app-music">${icons.music}</div><div class="gs-notification-copy"><small>音乐</small><strong>玻璃之心</strong><p>Nova Bloom · 正在播放</p></div><span class="gs-now">现在</span></div><div class="gs-notification gs-n2 gs-glass"><div class="gs-app-icon gs-app-fitness">${icons.fitness}</div><div class="gs-notification-copy"><small>健身</small><strong>目标已达成</strong><p>午前 10,000 步 · 示例结果</p></div><span class="gs-now">现在</span></div></div>${lensMarkup(true)}</div>
      ${c.cursor()}<div class="gs-click-ring"></div>
    </div>`;
    const q=c.q, qa=c.qa, tl=c.gsap.timeline({paused:true}), pointer=q('.fx-cursor'), ring=q('.gs-click-ring');
    const labels=['按钮','音乐播放器','文字镜片','控制中心','导航选区','数据提示','键盘搜索','通知与尾页'];
    // Every state is encoded in the timeline, including text; no onComplete mutation.
    tl.set(qa('.gs-section'),{opacity:0,y:0,scale:1,filter:'blur(0px)'},0).set([pointer,ring],{opacity:0,x:0,y:0},0);
    tl.set(q('.gs-key'),{textContent:''},0);
    tl.set(q('.gs-bright .gs-slider-fill'),{height:84},0).set(q('.gs-volume .gs-slider-fill'),{height:62},0);
    sectionRanges.forEach((section,i)=>{
      const node=q('.gs-s'+(i+1));
      tl.set(q('.gs-count'),{textContent:String(i+1).padStart(2,'0')+' / 08'},section.start);
      tl.set(q('.gs-foot'),{textContent:labels[i]},section.start);
      tl.fromTo(node,{opacity:0,y:30,scale:.965,filter:'blur(5px)'},{opacity:1,y:0,scale:1,filter:'blur(0px)',duration:.35,ease:'power2.out',immediateRender:false},section.start);
      if(i<7) tl.to(node,{opacity:0,y:-22,scale:.96,filter:'blur(5px)',duration:.3,ease:'power2.in'},section.end-.22);
    });
    function point(x,y,t,click=true) {
      tl.to(pointer,{opacity:1,x,y,duration:.22,ease:'power2.out'},t-.22);
      if(click)c.click(tl,pointer,ring,x,y,t);
    }
    function hidePointer(t){tl.to(pointer,{opacity:0,duration:.14},t);}
    function press(el,t){tl.to(el,{scale:.94,duration:.10,ease:'power2.in'},t).to(el,{scale:1,duration:.25,ease:'back.out(1.3)'},t+.10);}
    tl.set(q('.gs-buttons'),{opacity:0},0).set(q('.gs-seed'),{opacity:0,scale:.1},0);
    tl.to(q('.gs-seed'),{opacity:1,scale:1,duration:.42,ease:'back.out(1.2)'},.12).to(q('.gs-seed'),{scaleX:3.8,scaleY:.75,opacity:0,duration:.5,ease:'power2.inOut'},.62);
    tl.fromTo(q('.gs-buttons'),{opacity:0},{opacity:1,duration:.25,immediateRender:false},.78);
    tl.fromTo(q('.gs-play'),{x:212},{x:0,duration:.5,ease:'power3.out',immediateRender:false},.78);
    tl.fromTo(q('.gs-share'),{x:-212},{x:0,duration:.5,ease:'power3.out',immediateRender:false},.78);
    point(745,514,1.35);press(q('.gs-play'),1.35);tl.to(q('.gs-play-icon'),{opacity:0,scale:.5,duration:.15},1.38).to(q('.gs-pause'),{opacity:1,duration:.15},1.46);
    tl.to(q('.gs-play-ring'),{opacity:1,duration:.12},1.35).to(q('.gs-play-ring'),{opacity:0,scale:1.13,duration:.45},1.6);
    point(962,514,2.15);press(q('.gs-heart'),2.15);tl.to(q('.gs-heart svg'),{fill:'#fa557b',color:'#b9435b',duration:.18},2.2);
    qa('.gs-spark').forEach((spark,i)=>{const angle=i*Math.PI/5;tl.fromTo(spark,{x:0,y:0,scale:.3,opacity:0},{x:Math.cos(angle)*128,y:Math.sin(angle)*128,scale:1,opacity:.8,duration:.35,ease:'power2.out',immediateRender:false},2.19).to(spark,{opacity:0,scale:.3,duration:.4},2.52);});
    hidePointer(2.75);
    tl.to(qa('.gs-button svg'),{opacity:0,duration:.18},3.25).to(q('.gs-play'),{x:212,duration:.4,ease:'power2.inOut'},3.28).to(q('.gs-share'),{x:-212,duration:.4,ease:'power2.inOut'},3.28);
    tl.to(q('.gs-buttons'),{opacity:0,duration:.17},3.5).fromTo(q('.gs-fusion'),{width:158,opacity:0},{width:560,opacity:1,duration:.4,immediateRender:false},3.48).to(q('.gs-fusion'),{width:930,height:486,borderRadius:52,backgroundColor:'#222327',duration:.5,ease:'power2.inOut'},3.8);
    // Player preserves its shell while transport, progress and the same artwork change.
    point(960,673,4.9);press(q('.gs-player-toggle'),4.9);tl.to(q('.gs-transport-play'),{opacity:0,duration:.12},4.92).to(q('.gs-transport-pause'),{opacity:1,duration:.12},4.98);
    tl.to(q('.gs-progress-fill'),{width:'69%',duration:1.6,ease:'none'},4.96).set(q('.gs-elapsed'),{textContent:'2:20'},6.35).set(q('.gs-remaining'),{textContent:'−1:12'},6.35);
    qa('.gs-player .gs-eq i').forEach((bar,i)=>{for(let n=0;n<5;n++)tl.to(bar,{scaleY:[1.7,.55,1.25,.8,1.5][(i+n)%5],duration:.3,ease:'sine.inOut'},5+n*.48+i*.025);});
    point(1151,673,6.9);press(q('.gs-next'),6.9);tl.to(q('.gs-track-stack'),{y:-110,duration:.42,ease:'power2.inOut'},6.99).to(q('.gs-player .gs-art'),{background:'linear-gradient(135deg,#21a7c6,#157cf3)',duration:.42},6.99);
    tl.set(q('.gs-progress-fill'),{width:'2%'},7.09).set(q('.gs-elapsed'),{textContent:'0:06'},7.1).set(q('.gs-remaining'),{textContent:'−3:26'},7.1).to(q('.gs-progress-fill'),{width:'8%',duration:.7,ease:'none'},7.11);
    tl.to(qa('.gs-player .gs-eq i'),{backgroundColor:'#71d6cc',duration:.25},7.0);hidePointer(7.55);
    // Two clipped copies plus a seeded SVG displacement approximate local refraction.
    tl.set(q('.gs-type-main'),{'--lens-x':'340px'},0).set(q('.gs-tail'),{'--lens-x':'-330px'},0);
    tl.to(q('.gs-type-main'),{'--lens-x':'-340px',duration:.9,ease:'power2.inOut'},9.12);
    for(let i=1;i<4;i++){
      const at=9.85+(i-1)*1.04;
      tl.to(qa('.gs-type-main .gs-word-'+(i-1)),{y:-360,duration:.40,ease:'power3.in'},at).to(qa('.gs-type-main .gs-word-'+i),{y:0,duration:.45,ease:'power3.out'},at+.09);
      tl.to(q('.gs-type-main'),{'--lens-x':i%2?'340px':'-340px',duration:.95,ease:'power2.inOut'},at+.06);
    }
    tl.to(q('.gs-type-main .gs-lens-surface'),{borderRadius:'43% 57% 49% 51%',scaleX:1.07,duration:.55,yoyo:true,repeat:6,ease:'sine.inOut'},9.0);
    // Six fixed tiles; switch/fill changes occur after the simulated action.
    point(968,365,15.1);press(q('.gs-focus'),15.1);tl.to(q('.gs-focus .gs-tile-color'),{opacity:1,duration:.23},15.16).to(q('.gs-focus'),{color:'#fff',duration:.23},15.16).set(q('.gs-focus-state'),{textContent:'开启'},15.22);
    point(695,638,16.05,false);tl.to(pointer,{y:530,duration:.6,ease:'power2.inOut'},16.12).to(q('.gs-bright .gs-slider-fill'),{height:195,duration:.6,ease:'power2.inOut'},16.12);
    point(966,653,16.98,false);tl.to(pointer,{y:542,duration:.52,ease:'power2.inOut'},17.03).to(q('.gs-volume .gs-slider-fill'),{height:191,duration:.52,ease:'power2.inOut'},17.03);
    point(1250,635,17.83);press(q('.gs-torch'),17.83);tl.to(q('.gs-torch .gs-tile-color'),{opacity:1,duration:.24},17.88).set(q('.gs-torch-state'),{textContent:'开启'},17.95);hidePointer(18.35);
    qa('.gs-mini-player .gs-eq i').forEach((bar,i)=>{for(let n=0;n<5;n++)tl.to(bar,{scaleY:.55+((n+i)%3)*.5,duration:.3,ease:'sine.inOut'},14.6+n*.6+i*.02);});
    // The same selection lens travels; icons remain attached to the same bar.
    tl.set(q('.gs-nav-0'),{color:'#1687f5'},0);
    [1,3,2].forEach((selected,i)=>{
      const at=20+i*.85, x=540+selected*276;
      point(x,515,at);tl.to(q('.gs-nav-pill'),{x:selected*276,scaleX:1.08,duration:.35,ease:'power2.inOut'},at+.03).to(q('.gs-nav-pill'),{scaleX:1,duration:.2},at+.38);
      tl.to(qa('.gs-nav-item'),{color:'#292c35',duration:.16},at+.05).to(q('.gs-nav-'+selected),{color:'#1687f5',duration:.2},at+.14);
    });hidePointer(22.3);
    tl.set(qa('.gs-column'),{scaleY:0},0);
    qa('.gs-column').forEach((bar,i)=>tl.to(bar,{scaleY:1,duration:.65,ease:'power3.out'},23.3+i*.035));
    for(let i=0;i<=30;i++)tl.set(q('.gs-chart-total'),{textContent:Math.round(58200*i/30).toLocaleString('en-US')},23.3+i*.029);
    point(1085,505,24.55,false);tl.to(q('.gs-column-4'),{backgroundColor:'#175f9b',duration:.2},24.62).to(q('.gs-tooltip'),{opacity:1,y:-5,duration:.24,ease:'power2.out'},24.64);
    tl.to(q('.gs-tooltip'),{opacity:0,y:9,duration:.24},26.26).to(q('.gs-column-4'),{backgroundColor:'#272831',duration:.24},26.32);hidePointer(26.4);
    // Search grows below the same input; keyboard badges cause selection and Return.
    tl.set(q('.gs-search-shell'),{height:100},0).set(q('.gs-results'),{opacity:0},0);
    c.text(tl,q('.gs-query'),prompt,27.8,.55);tl.to(q('.gs-key'),{opacity:1,duration:.1},27.8).set(q('.gs-key'),{textContent:prompt},27.8);
    tl.to(q('.gs-search-shell'),{height:428,duration:.48,ease:'power3.out'},28.4).to(q('.gs-results'),{opacity:1,duration:.16},28.53);
    qa('.gs-search-row').forEach((row,i)=>tl.to(row,{opacity:1,duration:.20},28.55+i*.08));
    tl.to(q('.gs-search-highlight'),{opacity:1,duration:.2},28.77).set(q('.gs-row-0'),{color:'#fff'},28.77);
    [1,2,1,0].forEach((selected,i)=>{
      const at=29.15+i*.44;tl.set(q('.gs-key'),{textContent:i<2?'↓':'↑'},at).to(q('.gs-search-highlight'),{y:selected*96,duration:.24,ease:'power2.inOut'},at+.025).set(qa('.gs-search-row'),{color:'#18191d'},at+.06).set(q('.gs-row-'+selected),{color:'#fff'},at+.08);
    });
    tl.set(q('.gs-key'),{textContent:'Return ↵'},30.95).to(q('.gs-key'),{scale:.93,duration:.10},30.95).to(q('.gs-key'),{scale:1,duration:.18},31.05);
    tl.to(q('.gs-results'),{opacity:0,y:20,duration:.26},31.07).to(q('.gs-search-shell'),{height:134,y:170,width:900,x:5,duration:.48,ease:'power2.inOut'},31.10).to(q('.gs-input'),{opacity:0,duration:.23},31.10).to(q('.gs-key'),{opacity:0,duration:.2},31.27);
    // The initial rendering notification is displaced downward by two newer ones.
    tl.set(q('.gs-n0'),{y:148},0).set(q('.gs-n1'),{y:148},0).set(q('.gs-n2'),{y:0},0);
    tl.to(q('.gs-n0'),{opacity:1,duration:.18},31.83).to(q('.gs-n0'),{y:296,duration:.42,ease:'power2.inOut'},32.16);
    tl.fromTo(q('.gs-n1'),{y:0,opacity:0},{y:148,opacity:1,duration:.42,ease:'power2.out',immediateRender:false},32.17).fromTo(q('.gs-n2'),{y:-100,opacity:0},{y:0,opacity:1,duration:.42,ease:'power2.out',immediateRender:false},32.63);
    tl.to(q('.gs-notifications'),{opacity:0,y:-90,scale:.93,filter:'blur(5px)',duration:.35},34.27);
    tl.to(q('.gs-tail'),{opacity:1,duration:.25},34.52).to(q('.gs-tail'),{'--lens-x':'320px',duration:.82,ease:'power2.inOut'},34.63).to(q('.gs-tail-line'),{opacity:1,y:-5,duration:.25},34.95);
    tl.to(q('.gs-tail'),{opacity:0,y:-35,filter:'blur(4px)',duration:.3},35.60);
    tl.set({}, {}, 36);
    return {timeline:tl,duration:36};
  });
})();
