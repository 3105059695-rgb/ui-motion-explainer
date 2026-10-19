/* AI UI Director — continuous-object effects, no remote assets. */
(function () {
  'use strict';
  const accent = '#8061C7';
  const paths = {
    arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    file: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h4M10 12h5m-5 4h5"/>',
    folder: '<path d="M3 7V5h7l2 3h9v12H3z"/><path d="M3 8h18"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    spark: '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-4 18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
  };
  function icon(name, size = 28) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.file}</svg>`;
  }
  function chrome(title) {
    return `<div class="fxe-chrome"><span class="fxe-dots"><i></i><i></i><i></i></span><span>${title}</span><span class="fxe-chrome-icon">${icon('grid', 22)}</span></div>`;
  }
  function base(ctx, id, params, defaults, html, css) {
    const p = Object.assign({}, defaults, params || {});
    const v = Object.fromEntries(Object.entries(p).map(([k, value]) => [k, ctx.esc(String(value))]));
    const name = `fxe-${id}`;
    ctx.root.innerHTML = `<style>
      .${name}{background:#F7F8FA;color:#17191F;font-family:ProjectSans,sans-serif;perspective:1500px}
      .${name} *{box-sizing:border-box}.${name} svg{flex-shrink:0}
      .${name} .fxe-kicker{position:absolute;left:112px;top:90px;font-size:24px;color:#717684;letter-spacing:2px}
      .${name} .fxe-title{position:absolute;left:108px;top:126px;font-size:64px;line-height:1.25;font-weight:700;max-width:1660px;letter-spacing:-1.5px}
      .${name} .fxe-window{position:absolute;background:#fff;border:1px solid #E5E7EC;border-radius:30px;overflow:hidden;box-shadow:0 40px 100px #2D254518}
      .${name} .fxe-chrome{height:68px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:500;color:#717684;border-bottom:1px solid #EBECF0;background:#FCFCFD;position:relative}
      .${name} .fxe-dots{display:flex;gap:9px;position:absolute;left:28px}.${name} .fxe-dots i{display:block;width:11px;height:11px;background:#D7D8DE;border-radius:50%}
      .${name} .fxe-chrome-icon{position:absolute;right:27px;color:#969AA6}
      .${name} .fxe-muted{color:#858A98}.${name} .fxe-purple{color:${accent}}
      .${name} .fxe-label{font-size:23px;color:#858A98;line-height:1.6}.${name} .fxe-tag{font-size:22px;background:#EEE8FB;color:#7250BC;border-radius:11px;padding:8px 15px;display:inline-flex;align-items:center;gap:10px}
      .${name} .fxe-button{display:flex;align-items:center;justify-content:center;gap:13px;background:#17191F;color:white;border-radius:15px;height:66px;padding:0 25px;font-size:27px;font-weight:500}
      .${name} .fxe-line{height:12px;border-radius:6px;background:#ECEEF3;margin:18px 0}.${name} .fxe-line.short{width:60%}
      .${name} .fxe-rule{height:1px;background:#ECEEF2;width:100%}
      .${name} .fxe-cursor-wrap{position:absolute;left:0;top:0;width:42px;height:52px;z-index:80;pointer-events:none;filter:drop-shadow(0 3px 3px #0002)}
      .${name} .fxe-cursor-wrap svg{width:42px;height:52px}
      .${name} .fxe-ring{position:absolute;left:0;top:0;width:62px;height:62px;margin:-31px 0 0 -31px;border:3px solid #A387DC;border-radius:50%;opacity:0;z-index:75;pointer-events:none}
      .${name} .fxe-glow{position:absolute;border-radius:50%;filter:blur(75px);background:#C9B3F0;opacity:.16;pointer-events:none}
      .${name} .fxe-iconbox{width:68px;height:68px;border-radius:17px;display:flex;align-items:center;justify-content:center;background:#EEE8FB;color:${accent}}
      .${name} .fx-proof{position:absolute;right:70px;bottom:38px;font-size:20px;color:#7B7F89}
      ${css.replaceAll('$', `.${name}`)}
      </style><div class="fx-scene ${name}">${html(v)}<div class="fxe-ring"></div><div class="fxe-cursor-wrap">${ctx.cursor()}</div><div class="fx-proof">界面示意 / 原创动效</div></div>`;
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    const q = s => ctx.root.querySelector(s);
    const qa = s => Array.from(ctx.root.querySelectorAll(s));
    tl.set(q('.fxe-cursor-wrap'), { autoAlpha: 0, x: 1510, y: 890 }, 0);
    return { p, v, tl, q, qa, ctx };
  }
  function pointer(s, x, y, time, duration = 0.55) {
    s.tl.to(s.q('.fxe-cursor-wrap'), { autoAlpha: 1, x, y, duration, ease: 'power2.inOut' }, time);
  }
  function click(s, x, y, time) {
    const ring = s.q('.fxe-ring');
    s.tl.set(ring, { x, y, scale: .35, opacity: .8 }, time)
      .to(ring, { scale: 1.5, opacity: 0, duration: .45, ease: 'power2.out' }, time)
      .to(s.q('.fxe-cursor-wrap'), { scale: .85, duration: .1 }, time)
      .to(s.q('.fxe-cursor-wrap'), { scale: 1, duration: .14 }, time + .1);
  }
  function finish(s, duration) {
    const hold = { value: 0 };
    s.tl.to(hold, { value: 1, duration: .01 }, duration - .01);
    return { timeline: s.tl, duration };
  }
  function register(meta, build) { UIFX.register(meta, build); }

  register({ id: 'opening-window-depth', title: '窗口空间展开', category: 'opening', duration: 7.8, description: '窗口沿深度展开，镜头回正后点击文件，文件内容在同一工作台展开。', tags: ['空间展开', '产品开场', '连续窗口'], sourceStatus: 'original-extension', params: { title: '把想法，展开成作品。', prompt: '产品发布计划', result: '发布方案已就绪' } }, (ctx, params) => {
    const s = base(ctx, 'depth', params, { title: '把想法，展开成作品。', prompt: '产品发布计划', result: '发布方案已就绪' }, v => `
      <div class="fxe-glow halo"></div><div class="fxe-kicker">WORKSPACE / FROM IDEA TO OUTPUT</div><div class="fxe-title">${v.title}</div>
      <div class="fxe-window back two">${chrome('参考资料')}<div class="back-body">${icon('folder', 44)}<span>项目素材库</span><div class="fxe-line"></div><div class="fxe-line short"></div></div></div>
      <div class="fxe-window back one">${chrome('任务进度')}<div class="back-body">${icon('check', 44)}<span>内容结构已整理</span><div class="fxe-line"></div><div class="fxe-line short"></div></div></div>
      <div class="fxe-window front">${chrome('我的工作空间')}<div class="depth-workspace"><aside><div class="nav active">${icon('grid')} 工作台</div><div class="nav">${icon('folder')} 项目文件</div><div class="nav">${icon('clock')} 最近打开</div></aside><main><div class="fxe-label">最近更新</div><div class="file-row"><div class="fxe-iconbox">${icon('file', 34)}</div><div><b>${v.prompt}</b><p>可编辑文档 · 刚刚更新</p></div><span class="row-arrow">${icon('arrow')}</span></div><div class="document"><div class="fxe-tag">${icon('check', 22)} 已完成</div><h2>${v.result}</h2><div class="doc-copy">核心信息已汇总，接下来开始创作。</div><div class="fxe-line"></div><div class="fxe-line short"></div></div></main></div></div>`, `
      $ .halo{width:1000px;height:500px;left:500px;top:310px}
      $ .back{left:425px;top:316px;width:1100px;height:535px;transform-origin:50% 50%}
      $ .back-body{padding:65px;color:#969AA6;font-size:30px}$ .back-body>span{margin-left:22px}$ .back .fxe-line{margin-top:55px}
      $ .front{left:355px;top:300px;width:1210px;height:555px;transform-origin:50% 50%}
      $ .depth-workspace{display:flex;height:490px}$ aside{width:260px;border-right:1px solid #ECEEF3;background:#FCFCFE;padding:35px 20px;flex-shrink:0}
      $ .nav{height:66px;display:flex;align-items:center;gap:16px;padding:0 18px;color:#888D9A;font-size:24px;border-radius:12px;margin-bottom:12px}$ .nav.active{background:#EEE8FB;color:#7653BF}
      $ main{padding:40px;width:100%;position:relative}$ .file-row{height:112px;border:1px solid #ECEEF2;border-radius:18px;display:flex;align-items:center;padding:20px;gap:20px;margin-top:18px;background:white}
      $ .file-row b{font-size:28px;font-weight:500}$ .file-row p{font-size:20px;color:#8B8F9A;margin:6px 0 0}$ .row-arrow{margin-left:auto;color:#9095A0}
      $ .document{position:absolute;left:40px;right:40px;top:205px;padding:18px 22px;background:#fff;overflow:hidden}$ .document h2{font-size:35px;margin:14px 0 10px}$ .doc-copy{font-size:23px;color:#818692}
    `);
    s.tl.from(s.q('.front'), { y: 330, z: -700, rotationX: 26, rotationY: -20, scale: .7, opacity: 0, duration: 1.25, ease: 'expo.out' }, 0)
      .from(s.qa('.back'), { y: 220, z: -600, rotationX: 22, rotationY: -18, opacity: 0, duration: 1.1, stagger: .1 }, .12)
      .to(s.q('.two'), { x: -165, y: -52, rotationY: -12, scale: .84, duration: .85 }, .3)
      .to(s.q('.one'), { x: 138, y: -16, rotationY: 12, scale: .93, duration: .85 }, .45)
      .from(s.q('.fxe-title'), { y: 32, opacity: 0, duration: .8 }, .15)
      .set(s.q('.document'), { clipPath: 'inset(0 0 100% 0)', opacity: 0 }, 0)
      .to(s.qa('.back'), { x: 0, y: 0, rotationY: 0, scale: .9, opacity: .4, duration: .8 }, 2)
      .to(s.q('.front'), { scale: 1.08, y: -3, duration: .8 }, 2);
    pointer(s, 1398, 505, 2.8); click(s, 1398, 505, 3.45);
    s.tl.to(s.q('.file-row'), { backgroundColor: '#F3EEFB', borderColor: '#CDBCE9', duration: .22 }, 3.45)
      .to(s.q('.document'), { clipPath: 'inset(0 0 0% 0)', opacity: 1, duration: .8 }, 3.7)
      .to(s.q('.file-row'), { y: -12, duration: .5 }, 3.7)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .4 }, 4.7);
    return finish(s, 7.8);
  });

  register({ id: 'opening-command-launch', title: '一条命令启动', category: 'opening', duration: 8.4, description: '输入框接收命令，提交后自身扩展为任务执行窗口，再展开结果。', tags: ['命令启动', '输入', '开场'], sourceStatus: 'original-extension', params: { title: '一句话，开始执行。', prompt: '把这份想法整理成可执行计划', result: '执行计划已创建' } }, (ctx, params) => {
    const s = base(ctx, 'launch', params, { title: '一句话，开始执行。', prompt: '把这份想法整理成可执行计划', result: '执行计划已创建' }, v => `
      <div class="fxe-glow halo"></div><div class="fxe-kicker">ONE COMMAND / REAL MOMENTUM</div><div class="fxe-title">${v.title}</div><div class="launch-box"><div class="input"><span class="launch-icon">${icon('spark', 36)}</span><div class="typed"></div><span class="caret"></span><div class="submit">${icon('arrow', 32)}</div></div><div class="execution"><div class="running"><span class="status-orb"></span><span>正在整理任务</span><span class="running-count">3 个步骤</span></div><div class="step step-a">${icon('check')}<span>理解目标与约束</span></div><div class="step step-b">${icon('check')}<span>建立任务结构</span></div><div class="step step-c">${icon('check')}<span>生成可执行计划</span></div><div class="output"><div class="fxe-iconbox">${icon('file', 32)}</div><div><strong>${v.result}</strong><p>目标、步骤与交付物已整理</p></div><span class="fxe-tag">可编辑</span></div></div></div>`, `
      $ .halo{width:1000px;height:380px;left:460px;top:400px;opacity:.2}$ .launch-box{position:absolute;left:300px;top:440px;width:1320px;height:118px;overflow:hidden;background:white;border:1px solid #DADBE3;border-radius:30px;box-shadow:0 30px 100px #45355915}
      $ .input{height:118px;display:flex;align-items:center;gap:25px;padding:25px 30px}$ .launch-icon{color:${accent};display:flex}$ .typed{font-size:32px;white-space:nowrap;min-width:0}$ .caret{height:37px;width:2px;background:${accent};margin-left:-19px}
      $ .submit{margin-left:auto;background:#17191F;color:#fff;width:66px;height:66px;display:flex;align-items:center;justify-content:center;border-radius:17px;flex-shrink:0}
      $ .execution{padding:0 46px 35px;border-top:1px solid #ECECF1}$ .running{display:flex;align-items:center;gap:16px;height:84px;font-size:25px;color:#6F737F}$ .status-orb{width:14px;height:14px;border-radius:50%;background:${accent};box-shadow:0 0 0 8px #EEE8FB}$ .running-count{margin-left:auto;font-size:21px;color:#9A9EAA}
      $ .step{font-size:27px;display:flex;gap:18px;align-items:center;height:61px;color:#676C78}$ .step svg{color:${accent}}
      $ .output{display:flex;align-items:center;gap:23px;padding:25px 27px;margin-top:25px;border-radius:19px;background:#F5F1FC;border:1px solid #E6DCF5}$ .output strong{font-size:30px;font-weight:600}$ .output p{font-size:22px;color:#828794;margin:6px 0 0}$ .output .fxe-tag{margin-left:auto;background:#fff}
    `);
    s.tl.from(s.q('.launch-box'), { scale: .72, y: 80, filter: 'blur(16px)', opacity: 0, duration: .8, ease: 'expo.out' }, 0)
      .from(s.q('.fxe-title'), { y: 24, opacity: 0, duration: .65 }, .12)
      .set(s.q('.execution'), { opacity: 0 }, 0).set(s.qa('.step'), { opacity: 0, x: -15 }, 0).set(s.q('.output'), { opacity: 0, y: 25 }, 0);
    ctx.text(s.tl, s.q('.typed'), s.p.prompt, .75, 1.35);
    pointer(s, 1540, 491, 1.7, .5); click(s, 1540, 491, 2.3);
    s.tl.to(s.q('.submit'), { backgroundColor: accent, scale: .92, duration: .16 }, 2.3)
      .to(s.q('.caret'), { opacity: 0, duration: .15 }, 2.3)
      .to(s.q('.launch-box'), { top: 295, height: 580, duration: .75, ease: 'expo.inOut' }, 2.5)
      .to(s.q('.execution'), { opacity: 1, duration: .3 }, 2.9)
      .to(s.qa('.step'), { opacity: 1, x: 0, duration: .4, stagger: .5 }, 3.2)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .25 }, 3)
      .to(s.q('.output'), { opacity: 1, y: 0, duration: .65, ease: 'power3.out' }, 5.1)
      .to(s.q('.status-orb'), { boxShadow: '0 0 0 16px #EEE8FB00', duration: .7 }, 5.1)
      .set(s.q('.running>span:nth-child(2)'), { textContent: '任务已完成' }, 5.1);
    return finish(s, 8.4);
  });

  register({ id: 'opening-focus-reveal', title: '景深对焦揭示', category: 'opening', duration: 7.3, description: '从模糊的结果局部快速对焦，镜头拉回工作台，聚焦选区中的关键结论。', tags: ['景深', '结果预告', '焦点'], sourceStatus: 'original-extension', params: { title: '看清真正重要的。', prompt: '项目洞察', result: '把时间，留给创作。' } }, (ctx, params) => {
    const s = base(ctx, 'focus', params, { title: '看清真正重要的。', prompt: '项目洞察', result: '把时间，留给创作。' }, v => `
      <div class="fxe-kicker">FOCUS / THE INSIGHT THAT MATTERS</div><div class="fxe-title">${v.title}</div><div class="fxe-window focus-window">${chrome('内容工作台')}<aside><div class="fxe-label">项目空间</div><div class="focus-nav">${icon('grid')} 概览</div><div class="focus-nav selected">${icon('file')} ${v.prompt}</div><div class="focus-nav">${icon('folder')} 素材</div></aside><main><div class="bread">工作空间 <span>/</span> ${v.prompt}</div><div class="focus-overline">KEY INSIGHT</div><div class="headline">${v.result}<span class="underline"></span></div><p class="focus-copy">从重复操作中释放精力，专注更好的内容。</p><div class="metrics"><div><b>01</b><span>输入目标</span></div><div><b>02</b><span>自动执行</span></div><div><b>03</b><span>交付结果</span></div></div><div class="focus-btn fxe-button">查看执行过程 ${icon('arrow', 25)}</div></main></div><div class="focus-bracket l"></div><div class="focus-bracket r"></div>`, `
      $ .focus-window{left:290px;top:285px;width:1340px;height:590px;transform-origin:63% 47%}$ aside{position:absolute;top:68px;bottom:0;left:0;width:280px;background:#FAFAFC;border-right:1px solid #E9EBF0;padding:34px 26px}$ .focus-nav{display:flex;align-items:center;gap:15px;font-size:25px;color:#878D9B;height:69px;margin-top:12px;padding:0 16px;border-radius:12px}$ .focus-nav.selected{color:#7555B3;background:#EEE8FB}
      $ main{margin-left:280px;padding:30px 53px}$ .bread{font-size:21px;color:#969BA6}$ .bread span{padding:0 17px;color:#B6BAC3}$ .focus-overline{font-size:21px;color:${accent};letter-spacing:2px;margin-top:37px}$ .headline{position:relative;display:inline-block;font-size:57px;font-weight:650;margin-top:14px;letter-spacing:-1.5px;z-index:1}$ .underline{position:absolute;left:-8px;right:-8px;height:28px;bottom:0;z-index:-1;background:#E9DFF9;border-radius:6px;transform-origin:left center}
      $ .focus-copy{font-size:25px;color:#7F8593;margin:18px 0 30px}$ .metrics{display:flex;gap:55px}$ .metrics>div{display:flex;align-items:center;gap:17px}$ .metrics b{font-family:ProjectDisplay,sans-serif;font-size:43px;color:#B9A7D8;font-weight:500}$ .metrics span{font-size:24px;color:#747B88}$ .focus-btn{width:max-content;margin-top:35px;height:57px;font-size:23px;background:#EEE8FB;color:#7657B2}
      $ .focus-bracket{position:absolute;top:450px;width:50px;height:124px;border:2px solid #A78BCD;opacity:0}$ .focus-bracket.l{left:628px;border-right:0;border-radius:13px 0 0 13px}$ .focus-bracket.r{right:350px;border-left:0;border-radius:0 13px 13px 0}
    `);
    s.tl.from(s.q('.focus-window'), { scale: 2.35, filter: 'blur(28px)', duration: 1.15, ease: 'expo.out' }, 0)
      .from(s.qa('.fxe-title,.fxe-kicker'), { opacity: 0, y: 18, duration: .6, stagger: .1 }, .55)
      .set(s.q('.underline'), { scaleX: 0 }, 0)
      .to(s.qa('.focus-bracket'), { opacity: .75, duration: .3 }, 1.05)
      .to(s.qa('.focus-bracket'), { opacity: 0, duration: .5 }, 1.7);
    pointer(s, 1026, 525, 2.1); click(s, 1026, 525, 2.8);
    s.tl.to(s.q('.underline'), { scaleX: 1, duration: .6, ease: 'power2.out' }, 2.85)
      .to(s.q('.focus-window'), { scale: 1.06, x: -26, duration: .8 }, 2.85)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .35 }, 3.7);
    return finish(s, 7.3);
  });

  register({ id: 'interaction-slider-confirm', title: '滑动确认与成功反馈', category: 'interaction', duration: 8, description: '光标拖动滑块，确认轨道随拖动填充，释放后控件收拢为成功状态。', tags: ['滑动确认', '控件变形', '成功反馈'], source: 'https://x.com/Alok619308/status/2101955340547879167', sourceStatus: 'observed-reconstruction', params: { title: '确认，也可以很顺滑。', prompt: '确认发送项目文件', result: '文件已发送' } }, (ctx, params) => {
    const s = base(ctx, 'slider', params, { title: '确认，也可以很顺滑。', prompt: '确认发送项目文件', result: '文件已发送' }, v => `
      <div class="fxe-kicker">INTERACTION / SLIDE TO CONFIRM</div><div class="fxe-title">${v.title}</div><div class="transfer"><div class="transfer-top"><div class="avatar">${icon('file', 40)}</div><span class="destination">${icon('arrow', 30)}</span><div class="avatar target">${icon('folder', 40)}</div></div><div class="transfer-heading">${v.prompt}</div><div class="transfer-caption">项目方案.pdf <span>·</span> 发送至团队空间</div><div class="track"><div class="track-fill"></div><span class="track-label">滑动以确认</span><div class="thumb">${icon('arrow', 31)}</div><div class="success-icon">${icon('check', 45)}</div></div><div class="success-copy"><strong>${v.result}</strong><p>团队成员现在可以查看</p></div><div class="secure">${icon('check', 19)} 操作完成后自动同步</div></div>`, `
      $ .transfer{position:absolute;left:545px;top:280px;width:830px;height:610px;background:white;border:1px solid #E6E7ED;border-radius:36px;box-shadow:0 35px 95px #3A2B5412;text-align:center;padding-top:53px}
      $ .transfer-top{display:flex;align-items:center;justify-content:center;gap:35px}$ .avatar{width:90px;height:90px;border-radius:25px;background:#EEE8FB;color:#8567BA;display:flex;align-items:center;justify-content:center}$ .avatar.target{background:#F1F2F6;color:#9197A7}$ .destination{color:#B6BDC9}
      $ .transfer-heading{font-size:35px;font-weight:600;margin-top:30px}$ .transfer-caption{font-size:24px;color:#959AA7;margin-top:13px}$ .transfer-caption span{margin:0 13px}
      $ .track{position:absolute;left:125px;top:332px;width:580px;height:90px;border-radius:25px;background:#F0ECF7;overflow:hidden;border:1px solid #E5DCF0}
      $ .track-fill{position:absolute;left:0;top:0;height:100%;width:90px;background:#E0D4F0;border-radius:23px}$ .track-label{position:absolute;left:0;top:0;width:100%;line-height:88px;font-size:26px;color:#A594C2}
      $ .thumb{position:absolute;top:8px;left:8px;width:72px;height:72px;border-radius:19px;background:#fff;box-shadow:0 4px 9px #73589E12;color:#7655AB;display:flex;align-items:center;justify-content:center;z-index:2}
      $ .success-icon{position:absolute;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:white;opacity:0}$ .success-copy{position:absolute;left:0;top:449px;width:100%;opacity:0}$ .success-copy strong{font-size:33px;font-weight:600}$ .success-copy p{font-size:22px;color:#959AA7;margin:10px 0 0}
      $ .secure{position:absolute;bottom:66px;width:100%;display:flex;justify-content:center;align-items:center;gap:8px;font-size:20px;color:#AFB3BD}
    `);
    s.tl.from(s.q('.transfer'), { scale: .96, y: 35, opacity: 0, duration: .6 }, 0)
      .from(s.q('.fxe-title'), { y: 15, opacity: 0, duration: .5 }, .1);
    pointer(s, 702, 657, .8, .6); click(s, 702, 657, 1.5);
    s.tl.to(s.q('.thumb'), { scale: .94, duration: .15 }, 1.5)
      .to(s.q('.fxe-cursor-wrap'), { x: 1179, duration: 1.45, ease: 'power2.inOut' }, 1.75)
      .to(s.q('.thumb'), { x: 492, duration: 1.45, ease: 'power2.inOut' }, 1.75)
      .to(s.q('.track-fill'), { width: 580, duration: 1.45, ease: 'power2.inOut' }, 1.75)
      .to(s.q('.track-label'), { opacity: 0, x: 30, duration: .6 }, 1.9)
      .to(s.q('.thumb'), { scale: 1, duration: .15 }, 3.2)
      .to(s.q('.fxe-cursor-wrap'), { y: 760, autoAlpha: 0, duration: .45 }, 3.4)
      .to(s.q('.thumb'), { opacity: 0, scale: .4, duration: .2 }, 3.5)
      .to(s.q('.track-fill'), { backgroundColor: accent, duration: .3 }, 3.5)
      .to(s.q('.track'), { left: 370, width: 90, borderRadius: 45, borderColor: accent, duration: .7, ease: 'expo.inOut' }, 3.6)
      .to(s.q('.track-fill'), { width: 90, borderRadius: 45, duration: .7, ease: 'expo.inOut' }, 3.6)
      .to(s.q('.success-icon'), { opacity: 1, scale: 1, duration: .35 }, 4.1)
      .to(s.q('.secure'), { opacity: 0, duration: .3 }, 3.6)
      .to(s.q('.success-copy'), { opacity: 1, y: -8, duration: .5 }, 4.35)
      .to(s.q('.track'), { boxShadow: '0 0 0 18px #EEE8FB', duration: .35 }, 4.35)
      .to(s.q('.track'), { boxShadow: '0 0 0 30px #EEE8FB00', duration: .65 }, 4.7);
    return finish(s, 8);
  });

  register({ id: 'interaction-folder-fan', title: '文件夹扇形展开', category: 'interaction', duration: 8.2, description: '打开文件夹后文件连续扇出，选中的文件脱离原位置并展开为可读文档。', tags: ['文件', '扇形展开', '同一对象'], sourceStatus: 'original-extension', params: { title: '资料展开，重点浮现。', prompt: '项目资料', result: '内容创作计划' } }, (ctx, params) => {
    const s = base(ctx, 'fan', params, { title: '资料展开，重点浮现。', prompt: '项目资料', result: '内容创作计划' }, v => `
      <div class="fxe-kicker">FILES / OPEN UP YOUR IDEAS</div><div class="fxe-title">${v.title}</div><div class="folder-system"><div class="folder-back"></div><div class="fan-file file-a">${icon('file', 40)}<div>参考资料</div><div class="fxe-line"></div><div class="fxe-line short"></div></div><div class="fan-file file-b">${icon('file', 40)}<div>任务清单</div><div class="fxe-line"></div><div class="fxe-line short"></div></div><div class="fan-file file-c"><div class="file-mini">${icon('file', 40)}<div>${v.result}</div><div class="fxe-line"></div><div class="fxe-line short"></div></div><div class="file-expanded"><span class="fxe-tag">${icon('file', 21)} 可编辑文档</span><h2>${v.result}</h2><p>让素材进入流程，让想法形成作品。</p><div class="expanded-item"><span>01</span><div>梳理主题与受众</div></div><div class="expanded-item"><span>02</span><div>组织口播与画面</div></div><div class="expanded-item"><span>03</span><div>制作并检查成片</div></div></div></div><div class="folder-front"><div class="folder-mark">${icon('folder', 39)}</div><strong>${v.prompt}</strong><span>3 个文件</span></div></div>`, `
      $ .folder-system{position:absolute;left:630px;top:480px;width:660px;height:340px;perspective:1200px}$ .folder-back{position:absolute;left:70px;top:10px;width:520px;height:292px;background:#C6B6E2;border-radius:28px}$ .folder-back:before{content:'';position:absolute;left:0;top:-32px;width:200px;height:63px;background:#C6B6E2;border-radius:22px 25px 0 0}
      $ .folder-front{position:absolute;left:60px;top:72px;width:540px;height:270px;background:linear-gradient(145deg,#E9E0F7,#CCBCE7);border:1px solid #C5B1E0;border-radius:24px;box-shadow:0 24px 48px #66538220;padding:37px;transform-origin:center bottom;z-index:5;color:#75618E}
      $ .folder-mark{margin-bottom:18px}$ .folder-front strong{display:block;font-size:31px;font-weight:600}$ .folder-front>span{font-size:22px;display:block;margin-top:7px;color:#9985B1}
      $ .fan-file{position:absolute;left:192px;top:30px;width:280px;height:260px;background:#fff;border:1px solid #E2DDEB;border-radius:18px;box-shadow:0 10px 22px #50405B12;padding:30px;color:#8C75AB;transform-origin:50% 100%;z-index:2;overflow:hidden}
      $ .fan-file>div:not(.file-expanded),$ .file-mini>div:first-of-type{font-size:25px;color:#6D657B;margin-top:17px}$ .fan-file .fxe-line{height:8px;margin:18px 0}$ .file-b{z-index:3}$ .file-c{z-index:4}
      $ .file-expanded{position:absolute;left:0;top:0;width:780px;height:570px;padding:44px 53px;color:#17191F;opacity:0}$ .file-expanded h2{font-size:44px;margin:21px 0 15px}$ .file-expanded p{font-size:25px;color:#9296A2;margin-bottom:30px}$ .expanded-item{height:78px;border-top:1px solid #ECEEF2;display:flex;align-items:center;gap:25px;font-size:27px}$ .expanded-item>span{font-family:ProjectDisplay,sans-serif;font-size:29px;color:#B0A0CA}
    `);
    s.tl.from(s.q('.folder-system'), { y: 80, opacity: 0, scale: .9, duration: .7 }, 0)
      .from(s.q('.fxe-title'), { opacity: 0, y: 16, duration: .6 }, .1);
    pointer(s, 972, 663, .9); click(s, 972, 663, 1.6);
    s.tl.to(s.q('.folder-front'), { rotationX: -24, y: 28, duration: .6 }, 1.65)
      .to(s.q('.file-a'), { x: -215, y: -210, rotation: -19, duration: .85, ease: 'back.out(1.1)' }, 1.8)
      .to(s.q('.file-b'), { y: -268, rotation: -3, duration: .85, ease: 'back.out(1.1)' }, 1.9)
      .to(s.q('.file-c'), { x: 230, y: -215, rotation: 17, duration: .85, ease: 'back.out(1.1)' }, 2);
    pointer(s, 1222, 409, 2.9); click(s, 1222, 409, 3.55);
    s.tl.set(s.q('.file-c'), { zIndex: 8 }, 3.6)
      .to(s.q('.file-c'), { x: -272, y: -215, rotation: 0, width: 780, height: 570, borderRadius: 26, duration: .85, ease: 'expo.inOut' }, 3.6)
      .to(s.q('.file-mini'), { opacity: 0, duration: .2 }, 3.65)
      .to(s.q('.file-expanded'), { opacity: 1, duration: .4 }, 4.15)
      .to(s.qa('.folder-front,.folder-back,.file-a,.file-b'), { opacity: 0, scale: .88, duration: .5 }, 3.8)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .3 }, 4.25);
    return finish(s, 8.2);
  });

  register({ id: 'interaction-command-palette', title: '命令菜单搜索选择', category: 'interaction', duration: 8.2, description: '打开命令菜单、键入关键词、匹配操作，选中后原页面切换为任务执行状态。', tags: ['命令菜单', '搜索', '操作反馈'], sourceStatus: 'original-extension', params: { title: '想做什么，直接找到。', prompt: '生成', result: '生成内容大纲' } }, (ctx, params) => {
    const s = base(ctx, 'palette', params, { title: '想做什么，直接找到。', prompt: '生成', result: '生成内容大纲' }, v => `
      <div class="fxe-kicker">COMMAND / FIND THE NEXT ACTION</div><div class="fxe-title">${v.title}</div><div class="fxe-window palette-window">${chrome('内容工作台')}<div class="under-page"><div class="under-title">本周内容计划</div><div class="fxe-line"></div><div class="fxe-line short"></div><div class="under-grid"><div></div><div></div><div></div></div><div class="open-command">${icon('search', 25)} 搜索命令 <span>⌘ K</span></div></div><div class="page-dim"></div><div class="command-palette"><div class="command-search">${icon('search', 29)}<span class="query"></span><span class="esc">ESC</span></div><div class="palette-label">建议操作</div><div class="command-row row-1">${icon('file', 28)}<span>${v.result}</span><i>↵</i></div><div class="command-row row-2">${icon('folder', 28)}<span>打开项目文件</span></div><div class="command-row row-3">${icon('grid', 28)}<span>查看工作空间</span></div><div class="command-footer">↑ ↓ 选择操作 <span>↵ 执行</span></div></div><div class="palette-result"><div class="fxe-iconbox">${icon('spark', 34)}</div><div class="result-title">${v.result}</div><div class="result-note">内容结构已生成，可继续编辑。</div><div class="outline"><div>01 <span>提出观众关心的问题</span></div><div>02 <span>演示具体解决过程</span></div><div>03 <span>展示结果与行动建议</span></div></div></div></div>`, `
      $ .palette-window{left:300px;top:280px;width:1320px;height:620px}$ .under-page{padding:45px 70px;position:relative;height:550px}$ .under-title{font-size:38px;margin-bottom:33px}$ .under-page .fxe-line{max-width:600px}$ .under-grid{display:flex;gap:22px;margin-top:35px}$ .under-grid>div{width:330px;height:190px;background:#F8F8FB;border:1px solid #ECEEF2;border-radius:18px}$ .open-command{position:absolute;right:55px;top:40px;display:flex;align-items:center;gap:12px;color:#989FAB;font-size:23px;border:1px solid #E4E6EC;border-radius:12px;padding:12px 17px}$ .open-command>span{background:#F6F6F8;padding:2px 9px;margin-left:12px;font-size:20px}
      $ .page-dim{position:absolute;left:0;top:68px;right:0;bottom:0;background:#17191F12;opacity:0;backdrop-filter:blur(3px)}
      $ .command-palette{position:absolute;left:230px;top:125px;width:860px;height:405px;border:1px solid #E0DDE7;border-radius:23px;background:#fff;box-shadow:0 25px 65px #22213925;overflow:hidden;opacity:0}
      $ .command-search{height:86px;display:flex;align-items:center;gap:17px;padding:0 28px;border-bottom:1px solid #ECEEF2;font-size:28px;color:#959BA7}$ .command-search .query{color:#353944}$ .esc{margin-left:auto;font-size:17px;border:1px solid #E6E8ED;padding:5px 8px;border-radius:5px;color:#A1A6B1}
      $ .palette-label{font-size:19px;color:#A1A7B4;padding:20px 27px 11px}$ .command-row{margin:0 12px;height:61px;padding:0 20px;display:flex;align-items:center;gap:17px;font-size:25px;border-radius:11px;color:#6D7482;position:absolute;left:0;right:0;top:135px}$ .row-2{top:198px}$ .row-3{top:261px}$ .command-row i{margin-left:auto;font-style:normal;color:#B7A7D4;opacity:0}
      $ .command-footer{position:absolute;left:0;bottom:0;height:53px;width:100%;display:flex;align-items:center;padding:0 26px;font-size:18px;color:#A5AAB6;border-top:1px solid #EFF0F4;background:#FCFCFD}$ .command-footer>span{margin-left:auto}
      $ .palette-result{position:absolute;left:110px;top:115px;width:1100px;opacity:0}$ .result-title{font-size:39px;font-weight:600;margin-top:22px}$ .result-note{font-size:24px;color:#8C92A0;margin-top:12px}$ .outline{margin-top:28px;border:1px solid #E6DFEF;border-radius:16px;padding:9px 29px;background:#FCFAFF}$ .outline>div{height:65px;display:flex;align-items:center;gap:23px;font-size:27px;color:#B39FCF}$ .outline span{color:#69717F;font-size:26px}
    `);
    s.tl.from(s.q('.palette-window'), { opacity: 0, y: 30, duration: .6 }, 0);
    pointer(s, 1430, 415, .7); click(s, 1430, 415, 1.35);
    s.tl.to(s.q('.page-dim'), { opacity: 1, duration: .25 }, 1.4)
      .fromTo(s.q('.command-palette'), { y: 15, scale: .97 }, { y: 0, scale: 1, opacity: 1, duration: .45 }, 1.4);
    ctx.text(s.tl, s.q('.query'), s.p.prompt, 2, .65);
    s.tl.to(s.qa('.row-2,.row-3'), { opacity: 0, y: 15, duration: .3, stagger: .07 }, 2.75)
      .to(s.q('.command-palette'), { height: 264, duration: .45 }, 2.75)
      .set(s.q('.palette-label'), { textContent: '匹配命令' }, 2.75);
    pointer(s, 923, 573, 3.1); click(s, 923, 573, 3.7);
    s.tl.to(s.q('.row-1'), { backgroundColor: '#EEE8FB', color: accent, duration: .2 }, 3.7)
      .to(s.q('.row-1 i'), { opacity: 1, duration: .2 }, 3.7)
      .to(s.q('.command-palette'), { opacity: 0, y: -16, scale: .97, duration: .4 }, 4.1)
      .to(s.q('.page-dim'), { opacity: 0, duration: .4 }, 4.1)
      .to(s.q('.under-page'), { opacity: 0, duration: .3 }, 4.1)
      .to(s.q('.palette-result'), { opacity: 1, duration: .5 }, 4.4)
      .from(s.qa('.outline>div'), { x: -20, opacity: 0, duration: .35, stagger: .2 }, 4.7)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .3 }, 4.4);
    return finish(s, 8.2);
  });

  register({ id: 'interaction-list-filter', title: '搜索筛选与连续重排', category: 'interaction', duration: 8, description: '输入关键词后非匹配行退场，匹配行保留身份并连续上移重排。', tags: ['搜索', '列表重排', '筛选'], sourceStatus: 'original-extension', params: { title: '从一堆文件，找到答案。', prompt: '视频', result: '找到 2 个相关文件' } }, (ctx, params) => {
    const s = base(ctx, 'filter', params, { title: '从一堆文件，找到答案。', prompt: '视频', result: '找到 2 个相关文件' }, v => `
      <div class="fxe-kicker">SEARCH / LESS NOISE, MORE SIGNAL</div><div class="fxe-title">${v.title}</div><div class="fxe-window filter-window">${chrome('项目文件')}<div class="filter-bar">${icon('search', 29)}<span class="filter-query"></span><span class="filter-placeholder">搜索项目文件</span><span class="filter-shortcut">⌘ F</span></div><div class="list-header"><span>文件名称</span><span>更新时间</span></div><div class="filter-list"><div class="filter-row r1"><div class="small-icon">${icon('file')}</div><strong>品牌介绍文案</strong><span>今天 10:20</span></div><div class="filter-row r2"><div class="small-icon purple">${icon('file')}</div><strong><i>视频</i>口播稿</strong><span>今天 09:42</span></div><div class="filter-row r3"><div class="small-icon">${icon('folder')}</div><strong>设计参考资料</strong><span>昨天 18:30</span></div><div class="filter-row r4"><div class="small-icon purple">${icon('file')}</div><strong><i>视频</i>分镜计划</strong><span>昨天 16:15</span></div></div><div class="filter-status"><span class="status-dot"></span><span class="status-text">4 个项目文件</span></div><div class="selection-check">${icon('check', 23)} 已找到相关内容</div></div>`, `
      $ .filter-window{left:360px;top:275px;width:1200px;height:645px}$ .filter-bar{margin:30px 40px 0;height:75px;border:1px solid #E1E3EB;border-radius:15px;display:flex;align-items:center;padding:0 23px;gap:18px;font-size:29px;color:#9EA4B1;position:relative}$ .filter-query{color:#353944}$ .filter-placeholder{position:absolute;left:69px;font-size:26px;color:#A9AEBA}$ .filter-shortcut{margin-left:auto;font-size:20px;color:#ABB1BD}
      $ .list-header{margin:28px 47px 0;display:flex;justify-content:space-between;padding:0 25px 17px 62px;font-size:21px;color:#A2A8B5;border-bottom:1px solid #ECEEF4}$ .filter-list{position:relative;margin:0 40px;height:324px}$ .filter-row{position:absolute;top:0;left:0;width:100%;height:81px;display:flex;align-items:center;gap:19px;border-bottom:1px solid #EFF0F4;padding:0 25px 0 15px;border-radius:12px;background:#fff}$ .r2{top:81px}$ .r3{top:162px}$ .r4{top:243px}
      $ .small-icon{color:#A4AABA;width:43px;display:flex;justify-content:center}$ .small-icon.purple{color:#A58CC8}$ .filter-row strong{font-size:28px;font-weight:500;color:#59616F}$ .filter-row i{font-style:normal;background:transparent;border-radius:4px}$ .filter-row>span{margin-left:auto;font-size:22px;color:#A4AAB6}
      $ .filter-status{position:absolute;left:57px;bottom:27px;display:flex;gap:12px;align-items:center;font-size:22px;color:#A2A8B4}$ .status-dot{width:8px;height:8px;border-radius:50%;background:#B9BECA}$ .selection-check{position:absolute;right:57px;bottom:27px;display:flex;align-items:center;gap:10px;font-size:22px;color:#8B6CB9;opacity:0}
    `);
    s.tl.from(s.q('.filter-window'), { y: 25, opacity: 0, duration: .6 }, 0);
    pointer(s, 870, 412, .7); click(s, 870, 412, 1.35);
    s.tl.to(s.q('.filter-bar'), { borderColor: '#BFA9DD', boxShadow: '0 0 0 4px #EEE8FB', duration: .25 }, 1.35)
      .to(s.q('.filter-placeholder'), { opacity: 0, duration: .15 }, 1.5);
    ctx.text(s.tl, s.q('.filter-query'), s.p.prompt, 1.7, .7);
    // Custom keywords also update the same result-file objects; no DOM replacement.
    s.tl.set(s.qa('.filter-row i'), { textContent: s.p.prompt }, 0)
      .to(s.qa('.r1,.r3'), { opacity: 0, x: 70, duration: .4, stagger: .05 }, 2.7)
      .to(s.q('.r2'), { y: -81, duration: .65 }, 3)
      .to(s.q('.r4'), { y: -162, duration: .65 }, 3.06)
      .to(s.qa('.filter-row i'), { backgroundColor: '#EEE8FB', color: accent, duration: .4 }, 3.2)
      .set(s.q('.status-text'), { textContent: s.p.result }, 3.7)
      .to(s.q('.status-dot'), { backgroundColor: accent, duration: .2 }, 3.7);
    pointer(s, 922, 566, 4.05); click(s, 922, 566, 4.7);
    s.tl.to(s.q('.r2'), { backgroundColor: '#F4EFFA', duration: .3 }, 4.7)
      .to(s.q('.selection-check'), { opacity: 1, duration: .35 }, 4.9)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .3 }, 5.25);
    return finish(s, 8);
  });

  register({ id: 'interaction-sidebar-detail', title: '选中行展开详情', category: 'interaction', duration: 8, description: '任务列表中的选中行保持位置，侧边详情从窗口内展开，状态更新同步回原列表。', tags: ['侧栏', '任务详情', '同步状态'], sourceStatus: 'original-extension', params: { title: '选中一项，展开全部。', prompt: '制作产品演示视频', result: '准备制作' } }, (ctx, params) => {
    const s = base(ctx, 'detail', params, { title: '选中一项，展开全部。', prompt: '制作产品演示视频', result: '准备制作' }, v => `
      <div class="fxe-kicker">DETAIL / CONTEXT WITHOUT LOSING YOUR PLACE</div><div class="fxe-title">${v.title}</div><div class="fxe-window detail-window">${chrome('项目任务')}<div class="task-list"><div class="task-heading">本周计划 <span>3 项任务</span></div><div class="task-row row-a"><span class="task-dot"></span><strong>确定内容主题</strong><span class="task-status done">已完成</span></div><div class="task-row row-b"><span class="task-dot"></span><strong>${v.prompt}</strong><span class="task-status selected-status">待开始</span></div><div class="task-row row-c"><span class="task-dot"></span><strong>检查字幕与导出</strong><span class="task-status">待开始</span></div><div class="task-hint">点击任务查看执行细节</div></div><div class="task-detail-panel"><div class="panel-top">任务详情 <span>×</span></div><div class="fxe-tag">${icon('file', 20)} 视频制作</div><h2>${v.prompt}</h2><div class="detail-meta"><span>状态</span><b class="detail-state">待开始</b></div><div class="detail-meta"><span>优先级</span><b>高</b></div><div class="detail-rule"></div><div class="detail-label">交付检查</div><div class="checkline"><span>${icon('check', 17)}</span>口播与分镜已确认</div><div class="checkline"><span>${icon('check', 17)}</span>参考素材已整理</div><div class="start-task fxe-button"><span class="start-label">开始任务</span> ${icon('arrow', 23)}</div></div></div>`, `
      $ .detail-window{left:265px;top:275px;width:1390px;height:630px}$ .task-list{position:absolute;left:0;top:68px;width:1390px;padding:45px 55px}$ .task-heading{font-size:36px;font-weight:600;display:flex;align-items:center;gap:22px;margin-bottom:34px}$ .task-heading>span{font-size:21px;color:#ADB2BD;font-weight:400}$ .task-row{height:90px;display:flex;align-items:center;gap:18px;padding:0 23px;border-bottom:1px solid #EDEFF4;border-radius:13px;white-space:nowrap}$ .task-dot{border:2px solid #CDD2DD;width:20px;height:20px;border-radius:6px;flex-shrink:0}$ .task-row strong{font-size:26px;font-weight:500;max-width:590px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}$ .task-status{margin-left:auto;font-size:20px;color:#9AA2AF;background:#F4F5F8;border-radius:9px;padding:7px 11px}$ .task-status.done{color:#8A72AC;background:#F3EDF9}$ .task-hint{font-size:22px;color:#B1B6C1;margin:31px 23px}
      $ .task-detail-panel{position:absolute;right:0;top:68px;width:535px;height:562px;background:#fff;border-left:1px solid #E5E8EF;padding:22px 34px;box-shadow:-15px 0 45px #38304906;transform:translateX(100%)}$ .panel-top{display:flex;align-items:center;justify-content:space-between;color:#9BA2AF;font-size:22px;margin-bottom:14px}$ .panel-top span{font-size:31px}$ .task-detail-panel h2{font-size:28px;line-height:1.3;margin:14px 0}$ .detail-meta{display:flex;align-items:center;height:30px;font-size:22px}$ .detail-meta>span{width:115px;color:#A3AAB7}$ .detail-meta b{font-weight:500;color:#7B8494;font-size:21px}$ .detail-rule{height:1px;background:#ECEEF4;margin:10px 0}$ .detail-label{font-size:19px;color:#A3AAB7;margin-bottom:4px}$ .checkline{display:flex;gap:13px;align-items:center;font-size:21px;line-height:27px;color:#727D8F;margin:6px 0}$ .checkline>span{width:23px;height:23px;display:flex;align-items:center;justify-content:center;color:#A990CA;background:#F1EBFA;border-radius:5px}$ .start-task{position:absolute;left:34px;right:34px;bottom:26px;height:54px;margin-top:0;font-size:23px;background:#8D70BC}
    `);
    s.tl.from(s.q('.detail-window'), { y: 24, opacity: 0, duration: .6 }, 0);
    pointer(s, 880, 599, .8); click(s, 880, 599, 1.5);
    s.tl.to(s.q('.row-b'), { backgroundColor: '#F4EFFA', duration: .23 }, 1.5)
      .to(s.q('.row-b .task-dot'), { backgroundColor: '#B8A1D7', borderColor: '#B8A1D7', duration: .23 }, 1.5)
      .to(s.q('.task-list'), { width: 855, paddingLeft: 35, paddingRight: 35, duration: .65 }, 1.7)
      .to(s.q('.task-detail-panel'), { x: 0, duration: .7 }, 1.7);
    pointer(s, 1387, 852, 3.25); click(s, 1387, 852, 3.9);
    s.tl.to(s.q('.start-task'), { backgroundColor: '#EDE6F7', color: '#7653A8', duration: .3 }, 3.9)
      .set(s.q('.start-label'), { textContent: s.p.result }, 4.1)
      .set(s.q('.detail-state'), { textContent: '进行中' }, 4.1)
      .set(s.q('.selected-status'), { textContent: '进行中' }, 4.1)
      .to(s.q('.selected-status'), { backgroundColor: '#E9E0F6', color: accent, duration: .3 }, 4.1)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .3 }, 4.5);
    return finish(s, 8);
  });

  register({ id: 'result-document-unfold', title: '结果文档展开', category: 'result', duration: 8, description: '生成完成的文件从紧凑附件展开为多段文档，关键结论随后被原位强调。', tags: ['结果揭示', '文档展开', '阅读停留'], sourceStatus: 'original-extension', params: { title: '结果，已经成形。', prompt: '内容计划.md', result: '从想法到可执行方案' } }, (ctx, params) => {
    const s = base(ctx, 'unfold', params, { title: '结果，已经成形。', prompt: '内容计划.md', result: '从想法到可执行方案' }, v => `
      <div class="fxe-kicker">OUTPUT / BUILT TO KEEP WORKING</div><div class="fxe-title">${v.title}</div><div class="unfold-document"><div class="attachment"><div class="fxe-iconbox">${icon('file', 31)}</div><div><strong>${v.prompt}</strong><p>已生成 · 点击查看</p></div><div class="attachment-arrow">${icon('arrow', 30)}</div></div><div class="paper-content"><div class="paper-header"><span class="fxe-tag">${icon('check', 20)} 已完成</span><span>可编辑文档</span></div><h2>${v.result}</h2><p class="paper-lead">把目标、过程和交付物写清楚。</p><div class="paper-section section-a"><b>目标</b><span>让观众看懂软件如何完成任务</span></div><div class="paper-section section-b"><b>执行</b><span>拆分步骤，让每个操作都有反馈</span></div><div class="paper-section section-c"><b>交付</b><span class="conclusion">形成可复用、可持续修改的作品<i></i></span></div><div class="paper-footer">${icon('file', 22)} 文档已保存 <span>${icon('download', 23)} 导出</span></div></div></div><div class="unfold-shine"></div>`, `
      $ .unfold-document{position:absolute;left:530px;top:455px;width:860px;height:132px;background:#fff;border:1px solid #E1DAEC;border-radius:24px;box-shadow:0 35px 100px #4F3C6514;overflow:hidden;transform-origin:center 70px}$ .attachment{height:132px;display:flex;align-items:center;gap:23px;padding:25px 31px;background:#FCFAFF;border-bottom:1px solid #EDE7F4;position:absolute;left:0;right:0;top:0}$ .attachment strong{font-size:29px;font-weight:600}$ .attachment p{font-size:21px;color:#A39AAF;margin:7px 0 0}$ .attachment-arrow{margin-left:auto;color:#9A80BE}
      $ .paper-content{position:absolute;left:0;top:0;width:1060px;height:620px;padding:32px 48px;opacity:0}$ .paper-header{display:flex;align-items:center;justify-content:space-between}$ .paper-header>span:last-child{font-size:20px;color:#A8ACB7}$ .paper-content h2{font-size:43px;line-height:1.3;margin:18px 0 12px;letter-spacing:-1px}$ .paper-lead{font-size:25px;line-height:1.4;color:#949AA7;margin:0 0 23px}$ .paper-section{height:70px;display:flex;align-items:center;gap:36px;font-size:27px;border-top:1px solid #EDF0F4}$ .paper-section b{font-size:23px;color:#AD9BC9;font-weight:500}$ .paper-section>span{color:#747F91}$ .conclusion{position:relative;z-index:1}$ .conclusion i{position:absolute;left:-5px;right:-5px;bottom:-2px;height:16px;background:#E8DDF7;z-index:-1;transform-origin:left center;border-radius:4px}
      $ .paper-footer{border-top:1px solid #EDEFF4;margin-top:16px;padding-top:18px;display:flex;align-items:center;gap:12px;font-size:21px;color:#A0A8B6}$ .paper-footer>span{margin-left:auto;display:flex;gap:10px;align-items:center;color:#9272BC}$ .unfold-shine{position:absolute;left:458px;top:272px;width:1004px;height:2px;background:linear-gradient(90deg,transparent,#BBA0DC,transparent);opacity:0}
    `);
    s.tl.from(s.q('.unfold-document'), { y: 35, scale: .95, opacity: 0, duration: .65 }, 0)
      .set(s.q('.conclusion i'), { scaleX: 0 }, 0);
    pointer(s, 1293, 519, .9); click(s, 1293, 519, 1.55);
    s.tl.to(s.q('.attachment'), { opacity: 0, duration: .2 }, 1.65)
      .to(s.q('.unfold-document'), { left: 430, top: 270, width: 1060, height: 630, duration: .85, ease: 'expo.inOut' }, 1.65)
      .to(s.q('.paper-content'), { opacity: 1, duration: .4 }, 2.15)
      .from(s.qa('.paper-section'), { rotationX: -50, transformOrigin: 'center top', y: -10, opacity: 0, duration: .7, stagger: .16 }, 2.25)
      .to(s.q('.unfold-shine'), { opacity: .7, duration: .2 }, 2.45)
      .to(s.q('.unfold-shine'), { y: 587, opacity: 0, duration: 1.05 }, 2.65)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .25 }, 2.7)
      .to(s.q('.conclusion i'), { scaleX: 1, duration: .65 }, 4.2);
    return finish(s, 8);
  });

  register({ id: 'result-compare-wipe', title: '前后差异局部擦除', category: 'result', duration: 8.5, description: '拖动对比边界，同一份文档的修改前与修改后连续显露，停在完整结果。', tags: ['前后对比', '擦除', '结果'], sourceStatus: 'original-extension', params: { title: '变化，就在同一个画面。', prompt: '原始想法', result: '可执行方案' } }, (ctx, params) => {
    const rows = (after, v) => `<div class="compare-label">${after ? v.result : v.prompt}</div><h2>${after ? '让内容生产更清楚' : '关于内容的一些想法'}</h2><p>${after ? '每一步都有目标，每个结果都能继续使用。' : '有很多要做的事情，需要整理一下。'}</p><div class="compare-row"><b>${after ? '01' : '·'}</b><span>${after ? '明确主题：软件如何完成任务' : '可能需要拍一个软件介绍视频'}</span></div><div class="compare-row"><b>${after ? '02' : '·'}</b><span>${after ? '安排画面：操作、反馈与结果' : '放一些画面，加一点效果'}</span></div><div class="compare-row"><b>${after ? '03' : '·'}</b><span>${after ? '交付成片：可编辑、可复用' : '最后再看看怎么剪辑'}</span></div><div class="compare-note">${after ? `${icon('check', 22)} 结构已整理，开始执行` : '待整理的草稿'}</div>`;
    const s = base(ctx, 'wipe', params, { title: '变化，就在同一个画面。', prompt: '原始想法', result: '可执行方案' }, v => `
      <div class="fxe-kicker">BEFORE → AFTER / ONE CONTINUOUS VIEW</div><div class="fxe-title">${v.title}</div><div class="fxe-window compare-window">${chrome('版本对比')}<div class="compare-canvas"><div class="compare-before">${rows(false, v)}</div><div class="compare-after">${rows(true, v)}</div><div class="wipe-handle"><div class="wipe-knob"><span>‹</span><span>›</span></div></div></div></div>`, `
      $ .compare-window{left:325px;top:275px;width:1270px;height:625px}$ .compare-canvas{position:absolute;top:68px;left:0;right:0;bottom:0;overflow:hidden}$ .compare-before,$ .compare-after{position:absolute;inset:0;padding:30px 68px;background:white}$ .compare-after{background:#FDFCFF;clip-path:inset(0 100% 0 0)}$ .compare-label{font-size:21px;color:#B1B6C0;letter-spacing:2px}$ .compare-after .compare-label{color:#A089BE}$ .compare-canvas h2{font-size:40px;line-height:1.25;font-weight:600;margin:18px 0 12px}$ .compare-canvas p{font-size:24px;line-height:1.4;color:#A8AFBB;margin:0 0 20px}$ .compare-row{height:69px;border-top:1px solid #EFF0F4;display:flex;align-items:center;gap:24px;font-size:28px;color:#929BAA}$ .compare-row b{font-family:ProjectDisplay,sans-serif;font-weight:500;font-size:28px;color:#B9C0CA;width:35px}$ .compare-after .compare-row{color:#657081}$ .compare-after .compare-row b{color:#AE91CE}$ .compare-note{display:flex;align-items:center;gap:12px;color:#B7BECA;font-size:21px;line-height:29px;margin-top:19px}$ .compare-after .compare-note{color:#9273BA}$ .wipe-handle{position:absolute;left:0;top:0;height:100%;width:3px;background:#B29ACF;box-shadow:0 0 22px #AB8BCD24}$ .wipe-knob{position:absolute;left:-25px;top:240px;width:53px;height:65px;border-radius:14px;background:white;border:1px solid #D8C9E9;box-shadow:0 5px 20px #563F7420;display:flex;align-items:center;justify-content:space-evenly;color:#9B7DC1;font-size:32px}
    `);
    s.tl.from(s.q('.compare-window'), { opacity: 0, y: 25, duration: .6 }, 0)
      .set(s.q('.wipe-handle'), { x: 25 }, 0)
      .set(s.q('.compare-after'), { clipPath: 'inset(0 98% 0 0)' }, 0);
    pointer(s, 350, 615, .85); click(s, 350, 615, 1.5);
    s.tl.to(s.q('.wipe-handle'), { x: 750, duration: 1.55, ease: 'power2.inOut' }, 1.75)
      .to(s.q('.compare-after'), { clipPath: 'inset(0 41% 0 0)', duration: 1.55, ease: 'power2.inOut' }, 1.75)
      .to(s.q('.fxe-cursor-wrap'), { x: 1075, duration: 1.55, ease: 'power2.inOut' }, 1.75)
      .to(s.q('.wipe-handle'), { x: 1270, duration: 1.15, ease: 'power2.inOut' }, 4.2)
      .to(s.q('.compare-after'), { clipPath: 'inset(0 0% 0 0)', duration: 1.15, ease: 'power2.inOut' }, 4.2)
      .to(s.q('.fxe-cursor-wrap'), { x: 1595, duration: 1.15, ease: 'power2.inOut' }, 4.2)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .35 }, 5.4)
      .to(s.q('.wipe-handle'), { opacity: 0, duration: .3 }, 5.4);
    return finish(s, 8.5);
  });

  register({ id: 'transition-shared-file', title: '同一文件跨窗口', category: 'transition', duration: 8.5, description: '把同一个文件从素材窗口拖入工作台，文件落入目标容器并展开预览。', tags: ['跨窗口', '拖拽', '上下文交接'], sourceStatus: 'original-extension', params: { title: '交接文件，接着往下做。', prompt: '项目方案.pdf', result: '已加入工作台' } }, (ctx, params) => {
    const s = base(ctx, 'shared', params, { title: '交接文件，接着往下做。', prompt: '项目方案.pdf', result: '已加入工作台' }, v => `
      <div class="fxe-kicker">HANDOFF / KEEP THE CONTEXT MOVING</div><div class="fxe-title">${v.title}</div><div class="fxe-window source-window">${chrome('素材文件')}<div class="source-label">最近文件</div><div class="file-slot"></div><div class="source-placeholder"><div class="fxe-line"></div><div class="fxe-line short"></div></div></div><div class="fxe-window target-window">${chrome('创作工作台')}<div class="drop-target"><div class="drop-icon">${icon('plus', 42)}</div><strong>拖入项目文件</strong><p>让工作台理解你的内容</p></div><div class="target-preview"><div class="target-status">${icon('check', 22)} ${v.result}</div><h2>项目内容已就绪</h2><div class="preview-line"></div><div class="preview-line short"></div><div class="preview-outline"><div>目标与背景</div><div>关键内容</div><div>执行建议</div></div></div></div><div class="shared-file"><div class="fxe-iconbox">${icon('file', 34)}</div><div><strong>${v.prompt}</strong><p>可编辑项目资料</p></div><span class="file-check">${icon('check', 24)}</span></div>`, `
      $ .source-window{left:200px;top:315px;width:640px;height:540px}$ .target-window{left:925px;top:315px;width:795px;height:540px}$ .source-label{font-size:23px;color:#9CA4B2;padding:35px 35px 25px}$ .file-slot{height:124px;margin:0 30px;border-radius:18px;border:1px dashed #E6E0EE;background:#FAF8FD}$ .source-placeholder{padding:25px 35px}$ .source-placeholder .fxe-line{height:10px}$ .shared-file{position:absolute;left:230px;top:474px;width:580px;height:124px;background:white;border:1px solid #E2DAEB;border-radius:18px;display:flex;align-items:center;gap:20px;padding:24px;box-shadow:0 12px 28px #4D3B6310;z-index:20}$ .shared-file strong{font-size:27px;font-weight:550}$ .shared-file p{font-size:20px;color:#A3A8B5;margin:8px 0 0}$ .file-check{margin-left:auto;color:#9C7DC4;opacity:0}
      $ .drop-target{position:absolute;left:36px;right:36px;top:108px;bottom:39px;border:1px dashed #DAD2E7;border-radius:21px;text-align:center;background:#FCFAFE;padding-top:71px}$ .drop-icon{margin:0 auto 23px;color:#C0AED8}$ .drop-target strong{font-size:29px;font-weight:500;color:#9B88B3}$ .drop-target p{font-size:22px;color:#B1A7BE;margin-top:12px}$ .target-preview{position:absolute;left:44px;right:44px;top:275px;opacity:0}$ .target-status{font-size:21px;display:flex;gap:12px;align-items:center;color:#9A7CBF}$ .target-preview h2{font-size:32px;margin:16px 0 22px}$ .preview-line{height:9px;background:#EBE7F1;border-radius:5px;margin:12px 0;width:100%}$ .preview-line.short{width:63%}$ .preview-outline{display:flex;gap:13px;margin-top:23px}$ .preview-outline>div{border:1px solid #EAE4F2;border-radius:11px;background:#FAF7FF;padding:11px 14px;font-size:21px;color:#A18CB9}
    `);
    s.tl.from(s.q('.source-window'), { x: -30, opacity: 0, duration: .65 }, 0)
      .from(s.q('.target-window'), { x: 30, opacity: 0, duration: .65 }, .1)
      .from(s.q('.shared-file'), { opacity: 0, duration: .5 }, .25);
    pointer(s, 653, 521, .8); click(s, 653, 521, 1.5);
    s.tl.to(s.q('.shared-file'), { scale: 1.035, rotation: -2, boxShadow: '0 24px 50px #4D3B6325', duration: .3 }, 1.5)
      .to(s.q('.shared-file'), { x: 775, y: -64, duration: 1.25, ease: 'power2.inOut' }, 1.85)
      .to(s.q('.fxe-cursor-wrap'), { x: 1428, y: 457, duration: 1.25, ease: 'power2.inOut' }, 1.85)
      .to(s.q('.drop-target'), { backgroundColor: '#F3EDF9', borderColor: '#B89DD6', duration: .35 }, 2.6)
      .to(s.q('.shared-file'), { x: 739, y: -27, width: 707, scale: 1, rotation: 0, boxShadow: '0 8px 20px #4D3B6308', duration: .45 }, 3.25)
      .to(s.q('.fxe-cursor-wrap'), { x: 1392, y: 494, duration: .45 }, 3.25)
      .to(s.q('.drop-target'), { opacity: 0, duration: .3 }, 3.7)
      .to(s.q('.file-check'), { opacity: 1, duration: .3 }, 3.8)
      .to(s.q('.target-preview'), { opacity: 1, y: -6, duration: .5 }, 4)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .3 }, 4.2);
    return finish(s, 8.5);
  });

  register({ id: 'transition-tab-morph', title: '同一内容切换标签', category: 'transition', duration: 8.5, description: '从文档视图切到看板视图，同一任务行变为同一任务卡，随后切回列表保持内容一致。', tags: ['标签切换', '布局变形', '共享内容'], sourceStatus: 'original-extension', params: { title: '换个视角，内容不断。', prompt: '项目执行计划', result: '同一项目，两种视图' } }, (ctx, params) => {
    const s = base(ctx, 'tabs', params, { title: '换个视角，内容不断。', prompt: '项目执行计划', result: '同一项目，两种视图' }, v => `
      <div class="fxe-kicker">VIEWS / CHANGE THE VIEW, KEEP THE WORK</div><div class="fxe-title">${v.title}</div><div class="fxe-window tabs-window">${chrome('项目工作台')}<div class="project-title">${v.prompt}</div><div class="tabbar"><div class="tab-pill"></div><div class="tab list-tab">${icon('file', 23)} 列表</div><div class="tab board-tab">${icon('grid', 23)} 看板</div></div><div class="board-heads"><div>准备</div><div>制作中</div><div>检查</div></div><div class="view-items"><div class="view-item item-a"><span class="item-number">01</span><strong>明确主题与目标</strong><span class="item-description">受众、内容与预期结果</span><span class="item-state">已就绪</span></div><div class="view-item item-b"><span class="item-number">02</span><strong>制作软件演示</strong><span class="item-description">输入、执行与结果反馈</span><span class="item-state">进行中</span></div><div class="view-item item-c"><span class="item-number">03</span><strong>检查成片质量</strong><span class="item-description">字幕、节奏与交付规格</span><span class="item-state">待开始</span></div></div><div class="views-footer"><span class="views-note">列表视图 · 3 项任务</span><span>${v.result}</span></div></div>`, `
      $ .tabs-window{left:275px;top:270px;width:1370px;height:645px}$ .project-title{position:absolute;left:47px;top:100px;font-size:35px;font-weight:600}$ .tabbar{position:absolute;right:45px;top:99px;display:flex;background:#F3F3F7;border-radius:13px;padding:5px}$ .tab{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:125px;height:49px;font-size:23px;color:#A1A7B4;z-index:1}$ .list-tab{color:#7F60A8}$ .tab-pill{position:absolute;left:5px;top:5px;width:125px;height:49px;background:white;box-shadow:0 3px 10px #4033530B;border-radius:10px}$ .view-items{position:absolute;left:45px;right:45px;top:199px;height:325px}$ .view-item{position:absolute;left:0;top:0;width:1280px;height:99px;background:#fff;border:1px solid #E9E5EE;border-radius:16px;overflow:hidden}$ .item-b{top:110px}$ .item-c{top:220px}$ .item-number{position:absolute;left:25px;top:28px;font-family:ProjectDisplay,sans-serif;color:#B29ECD;font-size:28px}$ .view-item strong{position:absolute;left:87px;top:27px;font-size:28px;font-weight:500;color:#667082;white-space:nowrap}$ .item-description{position:absolute;left:590px;top:32px;font-size:23px;color:#ABB1BD;white-space:nowrap}$ .item-state{position:absolute;left:1130px;top:27px;border-radius:9px;background:#F5F0FB;padding:8px 14px;color:#A083C3;font-size:20px;white-space:nowrap}$ .board-heads{position:absolute;left:45px;top:190px;display:flex;gap:20px;opacity:0}$ .board-heads>div{width:413px;padding-left:5px;font-size:22px;color:#B0A0C3}$ .views-footer{position:absolute;left:50px;right:50px;bottom:38px;display:flex;justify-content:space-between;font-size:21px;color:#ABB1BD}$ .views-footer>span:last-child{color:#AF9BC8}
    `);
    s.tl.from(s.q('.tabs-window'), { y: 24, opacity: 0, duration: .6 }, 0);
    pointer(s, 1537, 394, .8); click(s, 1537, 394, 1.45);
    s.tl.to(s.q('.tab-pill'), { x: 125, duration: .4 }, 1.45)
      .to(s.q('.list-tab'), { color: '#A1A7B4', duration: .25 }, 1.45)
      .to(s.q('.board-tab'), { color: '#7F60A8', duration: .25 }, 1.45)
      .to(s.q('.item-a'), { x: 0, y: 52, width: 413, height: 260, backgroundColor: '#FCFAFF', duration: .75 }, 1.7)
      .to(s.q('.item-b'), { x: 433, y: -58, width: 413, height: 260, backgroundColor: '#FCFAFF', duration: .75 }, 1.75)
      .to(s.q('.item-c'), { x: 866, y: -168, width: 413, height: 260, backgroundColor: '#FCFAFF', duration: .75 }, 1.8)
      .to(s.qa('.view-item strong'), { left: 25, top: 77, duration: .7 }, 1.8)
      .to(s.qa('.item-description'), { left: 25, top: 127, fontSize: 22, duration: .7 }, 1.8)
      .to(s.qa('.item-state'), { left: 25, top: 186, duration: .7 }, 1.8)
      .to(s.q('.board-heads'), { opacity: 1, duration: .4 }, 2.2)
      .set(s.q('.views-note'), { textContent: '看板视图 · 3 项任务' }, 2.5);
    pointer(s, 1405, 394, 4.15); click(s, 1405, 394, 4.8);
    s.tl.to(s.q('.tab-pill'), { x: 0, duration: .4 }, 4.8)
      .to(s.q('.list-tab'), { color: '#7F60A8', duration: .25 }, 4.8)
      .to(s.q('.board-tab'), { color: '#A1A7B4', duration: .25 }, 4.8)
      .to(s.q('.board-heads'), { opacity: 0, duration: .2 }, 4.85)
      .to(s.qa('.view-item'), { x: 0, y: 0, width: 1280, height: 99, backgroundColor: '#FFFFFF', duration: .75, stagger: .04 }, 4.95)
      .to(s.qa('.view-item strong'), { left: 87, top: 27, duration: .7 }, 4.95)
      .to(s.qa('.item-description'), { left: 590, top: 32, fontSize: 23, duration: .7 }, 4.95)
      .to(s.qa('.item-state'), { left: 1130, top: 27, duration: .7 }, 4.95)
      .set(s.q('.views-note'), { textContent: '列表视图 · 3 项任务' }, 5.8)
      .to(s.q('.fxe-cursor-wrap'), { autoAlpha: 0, duration: .3 }, 5.9);
    return finish(s, 8.5);
  });
})();
