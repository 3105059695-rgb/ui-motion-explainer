/* Elaya's static Workflow automation reference, with an original run-check demo.
   Provider/logo artwork is drawn locally as simplified, original SVG. */
(function () {
  'use strict';
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    fit: '<path d="M4 9V4h5m6 0h5v5M4 15v5h5m6 0h5v-5"/>',
    flow: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M6 9v9h9M9 6h9v9"/>',
    folder: '<path d="M3 7V5h7l2 3h9v12H3zM3 8h18"/>',
    bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-7z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="currentColor" stroke="none"/><circle cx="15" cy="17" r="3" fill="currentColor" stroke="none"/>',
    pencil: '<path d="m5 15 10-10 4 4L9 19l-5 1zM13 7l4 4"/>',
    refresh: '<path d="M19 9a8 8 0 1 0 1 6M19 3v6h-6"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m4 19 6-6 4 3 3-4 4 5"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    screen: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M12 17v4M7 21h10"/>',
    send: '<path d="M12 20V4m-6 6 6-6 6 6"/>'
  };
  const icon = (name, size = 24) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.flow}</svg>`;
  const robot = '<svg width="43" height="43" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="21" fill="#E96048"/><rect x="10" y="14" width="24" height="17" rx="7" fill="#FFF6EE"/><path d="M22 14V8h6" fill="none" stroke="#FFF6EE" stroke-width="2" stroke-linecap="round"/><circle cx="29" cy="8" r="2.4" fill="#FFF6EE"/><circle cx="16" cy="22" r="2.1" fill="#CB634F"/><circle cx="28" cy="22" r="2.1" fill="#CB634F"/><path d="M17 27h10" stroke="#CB634F" stroke-width="1.5" stroke-linecap="round"/></svg>';
  const promptDefault = 'Find Series A SaaS companies in Europe and send qualified leads to my CRM.';

  UIFX.register({
    id: 'software-workflow-automation', title: 'Workflow automation', category: 'software', duration: 12,
    description: '参考 Elaya 的静态 Workflow automation 界面重建；同一窗口纵深入场、打字、点击 Run 和连线检查为原创演示。流程只到 Missing Information，不展示抓取数据或 CRM 发送成功。',
    tags: ['Workflow automation', 'AI Flow', '静态界面参考', 'Missing Information'],
    source: 'https://x.com/elayadesigns/status/2005253620019925430', sourceStatus: 'observed-reconstruction', sourceObservation: 'static-image',
    params: { title: 'Reddit monthly Leads', prompt: promptDefault }
  }, (ctx, params) => {
    const p = Object.assign({ title: 'Reddit monthly Leads', prompt: promptDefault }, params || {});
    const title = ctx.esc(String(p.title)), prompt = ctx.esc(String(p.prompt));
    ctx.root.innerHTML = `<style>
      .awf-scene{font-family:ProjectSans,sans-serif;background:#171717;color:#E7E9E8}
      .awf-scene *{box-sizing:border-box}.awf-scene svg{flex-shrink:0}
      .awf-scene .awf-app{position:absolute;left:96px;top:80px;width:1728px;height:920px;border:1px solid #383A39;border-radius:23px;background:#050606;overflow:hidden;box-shadow:0 25px 80px #0003}
      .awf-scene .awf-rail{position:absolute;left:0;top:0;bottom:0;width:72px;background:#212323;border-right:1px solid #303332;display:flex;flex-direction:column;align-items:center}
      .awf-scene .awf-logo{margin-top:24px;height:37px;display:flex;align-items:center;color:#93CEAD}
      .awf-scene .awf-tools{display:flex;flex-direction:column;align-items:center;gap:19px;margin-top:40px;color:#C8CDCA}
      .awf-scene .awf-tools>span{width:35px;height:35px;display:flex;align-items:center;justify-content:center;border-radius:9px}
      .awf-scene .awf-tools .awf-add{background:#4B9D70;color:#E6F5EB;width:37px;height:37px;margin-top:3px}
      .awf-scene .awf-rail-rule{width:34px;height:1px;background:#3D4140;margin:31px 0 22px}
      .awf-scene .awf-projects{font-size:11px;color:#8E9692;margin-bottom:21px}
      .awf-scene .awf-project-icons{display:flex;flex-direction:column;align-items:center;gap:21px;color:#9FA8A3}
      .awf-scene .awf-avatar{position:absolute;bottom:23px;left:18px;width:36px;height:36px;border:1px solid #74736A;border-radius:50%;overflow:hidden;background:#BCA992}
      .awf-scene .awf-canvas{position:absolute;left:72px;top:0;bottom:0;width:1276px;background:#030404;overflow:hidden}
      .awf-scene .awf-canvas-tabs{position:absolute;left:26px;top:27px;display:flex;gap:9px;z-index:5}
      .awf-scene .awf-canvas-tab{height:41px;display:flex;align-items:center;gap:9px;border:1px solid #363A38;border-radius:9px;padding:0 13px;background:#242727;font-size:18px;color:#C5CBC7}
      .awf-scene .awf-canvas-actions{position:absolute;right:24px;top:27px;display:flex;align-items:center;gap:9px;z-index:5}
      .awf-scene .awf-view-button{width:36px;height:39px;border:1px solid #373D39;border-radius:8px;background:#171B18;display:flex;align-items:center;justify-content:center;color:#B8C8BD}
      .awf-scene .awf-run{width:102px;height:43px;margin-left:8px;border-radius:9px;background:#55D18D;color:#102619;display:flex;align-items:center;justify-content:center;gap:10px;font-size:21px;font-weight:600;transform-origin:50% 50%}
      .awf-scene .awf-wires{position:absolute;inset:0;width:1276px;height:920px;pointer-events:none}
      .awf-scene .awf-trigger{position:absolute;left:70px;top:350px;width:386px;height:282px;border:1px solid #424745;border-radius:16px;background:#1C1F1E;box-shadow:0 14px 30px #0002}
      .awf-scene .awf-trigger-head{height:82px;border-bottom:1px solid #383E3A;display:flex;align-items:center;gap:12px;padding:0 21px}
      .awf-scene .awf-trigger-symbol{width:42px;height:42px;border:1px solid #42664D;background:linear-gradient(145deg,#253B2C,#557C5F);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#E1F2E6}
      .awf-scene .awf-node-heading{font-size:26px;font-weight:500;color:#F0F3F0;white-space:nowrap}
      .awf-scene .awf-manual{margin-left:auto;border:1px solid #454B47;border-radius:7px;background:#292E2A;font-size:16px;color:#C0C9C2;padding:6px 9px;white-space:nowrap}
      .awf-scene .awf-trigger-body{padding:21px 21px 22px}
      .awf-scene .awf-description-label{font-size:19px;line-height:1.4;color:#A5ADA8;margin-bottom:11px}
      .awf-scene .awf-description{font-size:21px;line-height:1.48;color:#D6DDD7;margin:0;overflow-wrap:anywhere}
      .awf-scene .awf-port{position:absolute;top:136px;right:-7px;width:14px;height:14px;border-radius:50%;border:2px solid #B9C2BC;background:#E4ECE6;z-index:3}
      .awf-scene .awf-scraper{position:absolute;left:586px;top:315px;width:515px;height:350px;border:1px solid #424745;border-radius:17px;background:#1C1F1E;box-shadow:0 14px 30px #0003}
      .awf-scene .awf-scraper .awf-port{left:-7px;right:auto;top:171px}
      .awf-scene .awf-scraper-head{position:absolute;top:0;left:0;right:0;height:100px;padding:23px;display:flex;gap:13px;align-items:flex-start}
      .awf-scene .awf-scraper-heading{font-size:26px;line-height:1.35;font-weight:500;color:#EFF1EF;white-space:nowrap}
      .awf-scene .awf-scraper-subtitle{font-size:18px;color:#A9B1AC;margin-top:5px;line-height:1.4}
      .awf-scene .awf-node-more{position:absolute;right:13px;top:26px;display:flex;color:#B7C0BA}
      .awf-scene .awf-scraper-options{position:absolute;left:23px;right:23px;top:110px;height:36px;display:flex;gap:8px;align-items:center}
      .awf-scene .awf-tool-button{width:31px;height:31px;border:1px solid #404641;background:#2B302C;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#BCC6BE}
      .awf-scene .awf-missing{height:33px;display:flex;align-items:center;gap:7px;margin-left:auto;padding:0 10px;background:#412C38;color:#F0A3C7;border:1px solid #5E3D50;border-radius:8px;font-size:17px;white-space:nowrap;transform-origin:center center}
      .awf-scene .awf-missing-dot{width:5px;height:5px;background:#E597BD;border-radius:50%}
      .awf-scene .awf-scraper-rule{position:absolute;left:23px;right:23px;top:166px;height:1px;background:#353D37}
      .awf-scene .awf-scraper-body{position:absolute;left:23px;right:23px;top:186px}
      .awf-scene .awf-scraper-body .awf-description{font-size:21px;line-height:1.48}
      .awf-scene .awf-next-node{position:absolute;left:1126px;top:476px;width:38px;height:38px;border-radius:50%;background:#ECEFEC;color:#2A302B;display:flex;align-items:center;justify-content:center}
      .awf-scene .awf-project-panel{position:absolute;right:0;top:0;bottom:0;width:380px;background:#242626;border-left:1px solid #3A3F3B}
      .awf-scene .awf-project-header{height:78px;border-bottom:1px solid #383D39;display:flex;align-items:center;gap:6px;padding:0 18px;font-size:18px;color:#F0F2EF;white-space:nowrap}
      .awf-scene .awf-project-prefix{color:#BBC2BC;font-size:17px}
      .awf-scene .awf-project-name{min-width:0;overflow:hidden;text-overflow:ellipsis}
      .awf-scene .awf-project-header>svg{margin-left:auto;color:#BCC7BE}
      .awf-scene .awf-message{position:absolute;left:17px;right:17px;top:110px;padding:16px;background:#303431;border:1px solid #3C423D;border-radius:12px;color:#E0E6E0;font-size:18px;line-height:1.6;overflow-wrap:anywhere}
      .awf-scene .awf-composer{position:absolute;left:16px;right:16px;bottom:22px;height:192px;border:1px solid #454D46;border-radius:13px;background:#292E2A;overflow:hidden}
      .awf-scene .awf-placeholder,.awf-scene .awf-typed{position:absolute;left:16px;right:16px;top:16px;font-size:19px;line-height:1.5;overflow-wrap:anywhere}
      .awf-scene .awf-placeholder{color:#929E94}
      .awf-scene .awf-typed{color:#E4ECE5}
      .awf-scene .awf-composer-tools{position:absolute;left:15px;right:15px;bottom:14px;display:flex;gap:17px;align-items:center;color:#A9B6AB}
      .awf-scene .awf-composer-tools>span{display:flex;align-items:center;justify-content:center}
      .awf-scene .awf-composer-send{margin-left:auto;width:34px;height:34px;border:1px solid #435C4A;border-radius:9px;background:#344C3B;color:#8CCD9F}
      .awf-scene .awf-cursor{position:absolute;left:0;top:0;width:38px;height:46px;transform-origin:5px 5px;z-index:80;pointer-events:none}
      .awf-scene .awf-cursor .fx-cursor path{fill:#F4F6F3;stroke:#1B201C;stroke-width:2.2}
      .awf-scene .awf-click-ring{position:absolute;left:0;top:0;width:52px;height:52px;border:2px solid #A7CBB3;border-radius:50%;z-index:79;pointer-events:none}
      .awf-scene .awf-phase{position:absolute;left:96px;bottom:28px;font-size:17px;color:#A0ABA3}
      .awf-scene .fx-proof{position:absolute;right:96px;bottom:28px;font-size:17px;color:#939D96}
    </style><div class="fx-scene awf-scene"><div class="awf-app">
      <aside class="awf-rail"><div class="awf-logo"><svg width="35" height="31" viewBox="0 0 35 31" fill="none" aria-hidden="true"><path d="m4 22 9-16 8 14 10-14M7 26l6-11 8 13" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="awf-tools"><span>${icon('flow', 25)}</span><span>${icon('bolt', 24)}</span><span>${icon('folder', 25)}</span><span class="awf-add">${icon('plus', 25)}</span></div><div class="awf-rail-rule"></div><div class="awf-projects">Projects</div><div class="awf-project-icons">${icon('grid', 22)}${icon('folder', 23)}${icon('settings', 23)}</div><div class="awf-avatar"><svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true"><circle cx="18" cy="18" r="18" fill="#BCA992"/><path d="M0 31 12 11l10 13 14-10v22H0z" fill="#665E55"/><circle cx="24" cy="10" r="4" fill="#E0CFB8"/></svg></div></aside>
      <div class="awf-canvas"><div class="awf-canvas-tabs"><span class="awf-canvas-tab">Properties ${icon('chevron', 17)}</span><span class="awf-canvas-tab">Code ${icon('up', 17)}</span></div><div class="awf-canvas-actions"><span class="awf-view-button">${icon('eye', 20)}</span><span class="awf-view-button">${icon('fit', 19)}</span><span class="awf-view-button">${icon('minus', 20)}</span><span class="awf-view-button">${icon('plus', 20)}</span><span class="awf-run"><span>Run</span>${icon('play', 19)}</span></div>
        <svg class="awf-wires" viewBox="0 0 1276 920" aria-hidden="true"><path d="M456 495H586" fill="none" stroke="#D7E0D9" stroke-width="2"/><path d="m577 490 9 5-9 5" fill="none" stroke="#D7E0D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path class="awf-line-pulse" d="M456 495H586" fill="none" stroke="#76D99D" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="18 130" stroke-dashoffset="18"/></svg>
        <div class="awf-trigger"><div class="awf-trigger-head"><div class="awf-trigger-symbol">${icon('play', 24)}</div><span class="awf-node-heading">Trigger</span><span class="awf-manual">Manual Start</span></div><div class="awf-trigger-body"><div class="awf-description-label">Description</div><p class="awf-description">${prompt}</p></div><span class="awf-port"></span></div>
        <div class="awf-scraper"><div class="awf-scraper-head">${robot}<div><div class="awf-scraper-heading">Subreddit Posts Scraper</div><div class="awf-scraper-subtitle">Scrap Reddit posts</div></div><span class="awf-node-more">${icon('more', 21)}</span></div><div class="awf-scraper-options"><span class="awf-tool-button">${icon('settings', 17)}</span><span class="awf-tool-button">${icon('refresh', 17)}</span><span class="awf-tool-button">${icon('pencil', 17)}</span><span class="awf-missing"><i class="awf-missing-dot"></i><span>Missing Information</span></span></div><div class="awf-scraper-rule"></div><div class="awf-scraper-body"><div class="awf-description-label">Description</div><p class="awf-description">${prompt}</p></div><span class="awf-port"></span></div><span class="awf-next-node">${icon('plus', 23)}</span>
      </div>
      <aside class="awf-project-panel"><div class="awf-project-header"><span class="awf-project-prefix">Project:</span><span class="awf-project-name">${title}</span>${icon('chevron', 17)}</div><div class="awf-message">${prompt}</div><div class="awf-composer"><div class="awf-placeholder">Describe your workflow with a natural language...</div><div class="awf-typed"></div><div class="awf-composer-tools"><span>${icon('image', 21)}</span><span>${icon('mic', 21)}</span><span>${icon('screen', 21)}</span><span class="awf-composer-send">${icon('send', 22)}</span></div></div></aside>
    </div><div class="awf-cursor">${ctx.cursor()}</div><div class="awf-click-ring"></div><div class="awf-phase"></div><div class="fx-proof">静态参考重建 · 原创演示 · 简化图标</div></div>`;

    const q = selector => ctx.root.querySelector(selector);
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.set(q('.awf-app'), { x: 0, y: 48, scale: .94, rotationX: 8, rotationY: -2.5, transformPerspective: 1400, transformOrigin: '50% 55%', opacity: .65 }, 0)
      .set(q('.awf-cursor'), { x: 1510, y: 947, scale: 1, opacity: 0 }, 0)
      .set(q('.awf-click-ring'), { x: 0, y: 0, scale: 1, opacity: 0 }, 0)
      .set(q('.awf-line-pulse'), { opacity: 0, strokeDashoffset: 18, autoRound: false }, 0)
      .set(q('.awf-run'), { scale: 1 }, 0)
      .set(q('.awf-missing'), { scale: 1, boxShadow: '0 0 0 0px #E39AB000' }, 0)
      .set(q('.awf-phase'), { textContent: '原创演示：工作流画布纵深入场' }, 0)
      .to(q('.awf-app'), { y: 0, scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: .95, ease: 'expo.out' }, 0)
      .set(q('.awf-phase'), { textContent: '静态参考界面 · Workflow automation' }, .95);

    tl.to(q('.awf-cursor'), { x: 1579, y: 845, opacity: 1, duration: .6, ease: 'power2.inOut' }, 1.8);
    ctx.click(tl, q('.awf-cursor'), q('.awf-click-ring'), 1579, 845, 2.48);
    tl.set(q('.awf-phase'), { textContent: '原创演示：输入工作流要求' }, 2.48)
      .to(q('.awf-composer'), { borderColor: '#7E9081', duration: .25 }, 2.48)
      .to(q('.awf-placeholder'), { opacity: 0, duration: .15 }, 2.58);
    ctx.text(tl, q('.awf-typed'), p.prompt, 2.7, 3.1);
    tl.to(q('.awf-cursor'), { x: 1368, y: 128, duration: .65, ease: 'power2.inOut' }, 6.2);
    ctx.click(tl, q('.awf-cursor'), q('.awf-click-ring'), 1368, 128, 6.95);
    tl.to(q('.awf-run'), { scale: .95, backgroundColor: '#78DDA4', duration: .14 }, 6.95)
      .to(q('.awf-run'), { scale: 1, backgroundColor: '#55D18D', duration: .22 }, 7.09)
      .to(q('.awf-trigger'), { borderColor: '#74A984', boxShadow: '0 0 0 3px #48795830', duration: .3 }, 7.05)
      .set(q('.awf-line-pulse'), { opacity: 1, strokeDashoffset: 18 }, 7.22)
      .to(q('.awf-line-pulse'), { strokeDashoffset: -130, duration: .7, ease: 'none', autoRound: false }, 7.22)
      .to(q('.awf-line-pulse'), { opacity: 0, duration: .12 }, 7.93)
      .to(q('.awf-trigger'), { borderColor: '#424745', boxShadow: '0 14px 30px #0002', duration: .45 }, 7.95)
      .to(q('.awf-missing'), { scale: 1.06, boxShadow: '0 0 0 5px #E39AB01C', duration: .26 }, 7.96)
      .to(q('.awf-missing'), { scale: 1, boxShadow: '0 0 0 9px #E39AB000', duration: .5 }, 8.22)
      .to(q('.awf-scraper'), { borderColor: '#956179', duration: .3 }, 7.96)
      .to(q('.awf-scraper'), { borderColor: '#424745', duration: .5 }, 8.55)
      .set(q('.awf-phase'), { textContent: '原创演示：运行检查停在 Missing Information' }, 7.96)
      .to(q('.awf-cursor'), { opacity: 0, duration: .35 }, 8.45)
      .to({ hold: 0 }, { hold: 1, duration: .01 }, 11.99);
    return { timeline: tl, duration: 12 };
  });
})();
