/* Static-image composition study with original SVG material and motion. */
(function () {
  'use strict';

  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

  function localAsset(value) {
    if (value == null || value === '') return '';
    if (typeof value !== 'string') throw new Error('localImage must be a local relative image path.');
    const path = value.replace(/\\/g, '/');
    let decoded;
    try { decoded = decodeURIComponent(path); } catch (_error) { throw new Error('Invalid local image path.'); }
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(decoded) || /(?:^|\/)\.\.(?:\/|$)/.test(decoded) || /[\u0000-\u001f]/.test(decoded)) {
      throw new Error('localImage must stay within local relative assets; remote URLs and parent traversal are not supported.');
    }
    return path;
  }

  const shark = '<svg viewBox="0 0 620 660" class="rg-art" aria-label="原创白底鲨鱼流线剪影"><rect width="620" height="660" fill="#fcfdfb"/><path d="M68 329C153 266 293 244 391 287L476 211 450 306 523 350 422 336C327 409 168 411 68 329Z" fill="#202526"/><path d="m237 272 61-109 1 110zM239 387l17 74 48-92" fill="#202526"/><path d="M76 330c103 42 235 53 340-3-100 74-231 85-340 3Z" fill="#303637"/><path d="M161 304c-9 17-10 36-3 55m24-63c-10 19-10 40-3 61m23-66c-9 18-10 39-4 61" fill="none" stroke="#707879" stroke-width="2.2"/><circle cx="112" cy="319" r="3" fill="#e6e9e4"/><path d="m80 341 55 12" stroke="#686f70" stroke-width="1.4" fill="none"/><path d="M50 545h181m-181 17h103" stroke="#e4e7e2" stroke-width="1.5"/></svg>';
  const architecture = '<svg viewBox="0 0 384 338" class="rg-art" aria-label="原创几何建筑结构"><rect width="384" height="338" fill="#b7c5c7"/><path d="M0 0h384v56L234 177 0 64Z" fill="#e7e3d9"/><path d="M0 338h384V198l-137-28L0 253Z" fill="#9b9990"/><path d="M0 29 94 72v266H0Zm136 63 49 22v197l-49 19Zm75 40 28 13v147l-28 10Z" fill="#f4f0e8"/><path d="m94 72 24-11v266l-24 11zm91 42 12-8v199l-12 6zm54 31 10-7v150l-10 4z" fill="#c7c3b9"/><path d="M384 63 325 112v226h59Zm-89 75-25 19v143l25 11Z" fill="#dedbd0"/><path d="m325 112-13-7v224l13 9zm-55 45-8-3v143l8 3z" fill="#acaea4"/><path d="M0 253 247 170m-90 168 90-168m137 70-137-70M0 303l247-133" stroke="#d6d2c7" stroke-width="1.1" fill="none"/><path d="M252 167h8v117h-8z" fill="#687d7e"/><path d="M0 8 252 159M384 30 252 159" stroke="#fffdf6" stroke-width="2" fill="none"/></svg>';
  const ridge = '<svg viewBox="0 0 430 322" class="rg-art" aria-label="原创夕阳山脊剪影"><rect width="430" height="322" fill="#9baeb4"/><path d="M0 76c152-14 249 38 430 7v239H0Z" fill="#c5bab0"/><circle cx="312" cy="130" r="47" fill="#e8c39d"/><path d="m-30 220 73-79 83 52 86-86 99 112 100-66 66 41v170H-30Z" fill="#7c9295"/><path d="m212 107 18 48-20-8-10 22-16-21z" fill="#c9d1c8"/><path d="M-30 282c97-135 173-40 237-62S357 152 465 245v90H-30Z" fill="#516e79"/><path d="M0 307c137-68 291-15 430-66v81H0Z" fill="#334f60"/><path d="M52 287c78-26 161-26 208-5" fill="none" stroke="#8fabb0" stroke-width="1" opacity=".45"/></svg>';
  const thumbnail = '<svg viewBox="0 0 118 172" class="rg-art" aria-label="原创树与织机抽象剪影"><rect width="118" height="172" fill="#bda888"/><path d="M0 61c54-13 61 21 118 1v110H0Z" fill="#c7b695"/><path d="M0 124c42-35 78-12 118-26v74H0Z" fill="#a28e6d"/><path d="M0 151c40-8 75 3 118-12v33H0Z" fill="#85745c"/><path d="M65 132 60 81 56 70 48 56l5-3 10 20 7-24 5 3-6 30 4 50z" fill="#514e40"/><path d="M26 57c-1-13 18-26 31-24 8-19 24-13 27-3 19-1 23 16 11 23-1 16-26 19-41 13-14 6-32 5-28-9Z" fill="#656448"/><path d="M22 150V99h26v51M18 102h34m-31 42h29" stroke="#635843" stroke-width="3" fill="none"/><path d="M25 105h20v30H25z" fill="#b09a73"/><path d="m28 107 14 25m-14-16 13 15m-13-6 7 9" stroke="#8c7656" stroke-width="1"/><path d="M50 155c20-4 37-2 56-9" stroke="#6c654f" stroke-width="1" fill="none"/></svg>';
  const sparkle = '<svg viewBox="0 0 24 24" class="rg-icon" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/></svg>';

  UIFX.register({
    id: 'ai-reasoning-glass-panel',
    title: 'AI 推理 · 磨砂玻璃工作面板',
    category: 'ai',
    duration: 11,
    source: 'https://x.com/gabriell_lab/status/2055319425578918101',
    sourceStatus: 'observed-reconstruction',
    sourceObservation: 'static-image',
    description: '依据静态参考的点阵画布、素材卡与深灰玻璃推理面板重建层次；入场与焦点转移为原创，所有背景与缩略图用原创可编辑 SVG 替代，尾帧保留处理中状态。',
    tags: ['Collect UI', 'AI Flow', 'Chat Layout', '玻璃面板', '推理过程', '原创SVG素材'],
    params: {title: 'Desert Weaver Beneath the Tree', prompt: 'A quiet desert scene built around one tree, a woven structure, and warm, directional light.', localImage: ''}
  }, function (ctx, params) {
    const p = Object.assign({title: 'Desert Weaver Beneath the Tree', prompt: 'A quiet desert scene built around one tree, a woven structure, and warm, directional light.', localImage: ''}, params);
    const image = localAsset(p.localImage);
    const primary = image ? '<img class="rg-art rg-local-image" src="' + escapeHTML(image) + '" alt="本地主素材"/>' : shark;
    const card = (className, fileName, content, badge) => '<article class="rg-material ' + className + '"><div class="rg-filebar"><span>' + (badge || 'SVG') + '</span><strong>' + escapeHTML(fileName) + '</strong><i>···</i></div><div class="rg-material-body">' + content + '</div></article>';
    const css = `
      .rg-scene{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#f1f3f2;color:#f1f5f3;font-family:ProjectSans,sans-serif}.rg-scene *{box-sizing:border-box}.rg-scene .rg-canvas{position:absolute;inset:0;background-image:radial-gradient(#c3cbc7 .85px,transparent .85px);background-size:24px 24px;background-position:12px 12px}.rg-scene .rg-materials{position:absolute;inset:0;filter:blur(0px);transform-origin:50% 50%}
      .rg-scene .rg-material{position:absolute;border:1px solid #dce2dd;border-radius:23px;background:#fff;overflow:hidden;box-shadow:0 12px 30px #354b3e0c}.rg-scene .rg-main-material{left:154px;top:173px;width:632px;height:716px}.rg-scene .rg-architecture{left:1409px;top:113px;width:357px;height:361px}.rg-scene .rg-ridge{left:1386px;top:590px;width:407px;height:342px}.rg-scene .rg-filebar{height:45px;padding:0 18px;display:flex;align-items:center;gap:11px;background:#fbfcfa;border-bottom:1px solid #e5e9e4;color:#8e9a91}.rg-scene .rg-filebar>span{font-size:10px;line-height:17px;letter-spacing:.4px;color:#98a499;border:1px solid #dfe6dc;padding:1px 5px;border-radius:4px}.rg-scene .rg-filebar strong{font-size:14px;font-weight:400;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rg-scene .rg-filebar i{font-size:20px;font-style:normal;color:#b5c0b6;margin-left:auto}.rg-scene .rg-material-body{position:absolute;left:0;right:0;top:45px;bottom:0}.rg-scene .rg-art{width:100%;height:100%;display:block;object-fit:cover}.rg-scene .rg-main-material .rg-art{object-fit:contain}
      .rg-scene .rg-launcher{position:absolute;left:872px;top:965px;width:176px;height:52px;border:1px solid #d4ded5;border-radius:15px;display:flex;align-items:center;justify-content:center;gap:11px;background:#fafdf9;box-shadow:0 4px 14px #43554411;color:#627569;font-size:20px;line-height:28px}.rg-scene .rg-icon{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
      .rg-scene .rg-panel{position:absolute;left:612px;top:124px;width:884px;height:832px;border:1px solid #f0f6f148;border-radius:30px;overflow:hidden;background:linear-gradient(164deg,#75817ecd 0%,#646f6ee0 45%,#566362e8 100%);backdrop-filter:blur(24px) saturate(.75);-webkit-backdrop-filter:blur(24px) saturate(.75);box-shadow:0 27px 58px #243a3433,0 2px 5px #ffffff15,inset 0 1px 0 #ffffff40;opacity:0;transform:translateY(960px)}
      .rg-scene .rg-drag{position:absolute;left:calc(50% - 30px);top:17px;width:60px;height:5px;border-radius:99px;background:#edf5f056}.rg-scene .rg-panel-top{position:absolute;left:34px;right:34px;top:49px;height:59px;border-bottom:1px solid #e2efe32b;display:flex;align-items:flex-start;gap:36px}.rg-scene .rg-tab{font-size:23px;line-height:31px;font-weight:450;color:#d4ddd6a6}.rg-scene .rg-tab-active{color:#f3f8f3}.rg-scene .rg-panel-top>i{width:1px;height:24px;background:#dfede523;margin-top:4px;margin-left:-17px;margin-right:-17px}
      .rg-scene .rg-reasoning-meta{position:absolute;left:44px;right:44px;top:132px;display:flex;justify-content:space-between;align-items:center;font-size:14px;line-height:21px;letter-spacing:1.3px;color:#d5e0d7bf}.rg-scene .rg-processing{display:flex;align-items:center;gap:7px;font-size:12px;letter-spacing:.4px;color:#d4e2d7a8}.rg-scene .rg-processing i{width:5px;height:5px;border-radius:50%;background:#d6e6d2}
      .rg-scene .rg-summary{position:absolute;left:44px;right:44px;top:177px;height:177px;display:flex;align-items:flex-start;gap:26px}.rg-scene .rg-thumbnail{width:118px;height:172px;flex:none;border-radius:11px;overflow:hidden;border:1px solid #ebf2e91f;box-shadow:0 5px 15px #22372d19}.rg-scene .rg-summary-copy{flex:1;min-width:0;padding-top:2px}.rg-scene .rg-summary h1{font-family:ProjectDisplay,ProjectSans,sans-serif;font-size:34px;line-height:1.23;letter-spacing:-.3px;font-weight:600;color:#f4f8f3;margin:0 0 14px;max-width:590px}.rg-scene .rg-summary p{font-size:20px;line-height:1.7;color:#e1e9e0d6;margin:0;max-width:580px}
      .rg-scene .rg-timeline{position:absolute;left:47px;right:38px;top:404px;height:428px}.rg-scene .rg-timeline-base{position:absolute;left:13px;top:12px;bottom:-15px;border-left:1px dashed #d5e9d642}.rg-scene .rg-timeline-progress{position:absolute;left:13px;top:12px;height:118px;width:1px;background:#e8f5e58c}.rg-scene .rg-step{position:absolute;left:0;right:0;height:182px;padding-left:47px}.rg-scene .rg-step-1{top:0}.rg-scene .rg-step-2{top:188px;opacity:.67}.rg-scene .rg-step-dot{position:absolute;left:9px;top:7px;width:9px;height:9px;border:1px solid #e8f5e1b3;border-radius:50%;background:#cfdfc959;box-shadow:0 0 0 4px #dfeddb0a}.rg-scene .rg-step-2 .rg-step-dot{background:#c8d8c228}.rg-scene .rg-step-time{font-size:14px;line-height:21px;letter-spacing:1.2px;color:#d4e4cee0}.rg-scene .rg-step h2{font-size:27px;line-height:35px;font-weight:550;letter-spacing:-.3px;color:#f0f7e9;margin:8px 0 10px}.rg-scene .rg-step p{font-size:19px;line-height:31px;font-weight:400;color:#e0ead5e6;margin:0}.rg-scene .rg-step-spot{position:absolute;left:35px;top:-12px;right:0;height:180px;border-radius:14px;background:linear-gradient(110deg,#e9f6d90b,transparent);opacity:0;pointer-events:none}
      .rg-scene .rg-next-clock{position:absolute;left:47px;top:412px;font-size:14px;line-height:22px;letter-spacing:1.2px;color:#d1e5c298;white-space:nowrap}.rg-scene .rg-next-dot{position:absolute;left:9px;top:419px;height:9px;width:9px;border:1px solid #d6e8c970;border-radius:50%;background:#d9edc41f}.rg-scene .rg-panel-bottom-fade{position:absolute;bottom:0;left:0;right:0;height:22px;background:linear-gradient(transparent,#526c5740);pointer-events:none}
      .rg-scene .rg-pointer{position:absolute;left:0;top:0;width:38px;height:46px;z-index:5;filter:drop-shadow(0 2px 3px #284c3622);pointer-events:none}.rg-scene .rg-pointer .fx-cursor{position:static;width:38px;height:46px;display:block}.rg-scene .rg-ring{position:absolute;left:0;top:0;width:48px;height:48px;margin:-24px 0 0 -24px;border:1.5px solid #afc4ad;border-radius:50%;z-index:4;opacity:0;pointer-events:none}.rg-scene .rg-proof{position:absolute;right:129px;bottom:48px;font-size:17px;line-height:25px;color:#829381;letter-spacing:.2px}
    `;
    ctx.root.innerHTML = '<div class="rg-scene"><style>' + css + '</style><div class="rg-canvas"></div><div class="rg-materials">' +
      card('rg-main-material', image ? 'local_reference_image' : 'shark_whitebackdrop', primary, image ? 'IMG' : 'SVG') +
      card('rg-architecture', 'architecture_study', architecture) + card('rg-ridge', 'ridge_at_sunset', ridge) + '</div>' +
      '<div class="rg-launcher">' + sparkle + 'Agentic</div>' +
      '<section class="rg-panel"><div class="rg-drag"></div><div class="rg-panel-top"><span class="rg-tab rg-tab-active">Agentic</span><i></i><span class="rg-tab">Chat History</span></div><div class="rg-reasoning-meta"><span>REASONING · 1:34 MIN</span><span class="rg-processing"><i></i>In progress</span></div><div class="rg-summary"><div class="rg-thumbnail">' + thumbnail + '</div><div class="rg-summary-copy"><h1>' + escapeHTML(p.title) + '</h1><p>' + escapeHTML(p.prompt) + '</p></div></div>' +
      '<div class="rg-timeline"><div class="rg-timeline-base"></div><div class="rg-timeline-progress"></div><article class="rg-step rg-step-1"><div class="rg-step-spot"></div><i class="rg-step-dot"></i><div class="rg-step-time">0:21 MIN</div><h2>Content Hierarchy</h2><p>The tree sets the focal point.<br>Keep the woven structure secondary,<br>with open desert around both.</p></article><article class="rg-step rg-step-2"><div class="rg-step-spot"></div><i class="rg-step-dot"></i><div class="rg-step-time">0:40 MIN</div><h2>Visual Layout</h2><p>Guide the eye through scale and spacing.<br>Balance the foreground silhouette with<br>a softer horizon and directional light.</p></article><div class="rg-next-clock">0:11 MIN</div><i class="rg-next-dot"></i></div><div class="rg-panel-bottom-fade"></div></section>' +
      '<div class="rg-pointer">' + ctx.cursor() + '</div><div class="rg-ring"></div><div class="rg-proof">静态参考重建 · 原创 SVG 素材与动效</div></div>';

    const tl = ctx.gsap.timeline({paused: true});
    tl.set(ctx.q('.rg-panel'), {y: 960, opacity: 0}, 0);
    tl.set(ctx.q('.rg-materials'), {filter: 'blur(0px)', scale: 1}, 0);
    tl.set(ctx.q('.rg-launcher'), {opacity: 1}, 0);
    tl.set(ctx.q('.rg-pointer'), {x: 1239, y: 1006, opacity: 0, scale: 1}, 0);
    tl.set(ctx.q('.rg-ring'), {x: 0, y: 0, opacity: 0, scale: 0.4}, 0);
    tl.set(ctx.q('.rg-step-1'), {opacity: 1}, 0);
    tl.set(ctx.q('.rg-step-2'), {opacity: 0.67}, 0);
    tl.set(ctx.q('.rg-timeline-progress'), {height: 118}, 0);
    tl.set(ctx.q('.rg-step-1 .rg-step-spot'), {opacity: 0.6}, 0);
    tl.set(ctx.q('.rg-step-2 .rg-step-spot'), {opacity: 0}, 0);

    tl.to(ctx.q('.rg-pointer'), {x: 960, y: 991, opacity: 1, duration: 0.6, ease: 'power2.inOut'}, 0.65);
    tl.set(ctx.q('.rg-ring'), {x: 960, y: 991, opacity: 0.55, scale: 0.4}, 1.25);
    tl.to(ctx.q('.rg-ring'), {opacity: 0, scale: 1.15, duration: 0.4, ease: 'power2.out'}, 1.25);
    tl.to(ctx.q('.rg-pointer'), {scale: 0.88, duration: 0.08}, 1.25);
    tl.to(ctx.q('.rg-pointer'), {scale: 1, duration: 0.13}, 1.33);
    tl.fromTo(ctx.q('.rg-panel'), {y: 960, opacity: 0}, {y: 0, opacity: 1, duration: 1.16, ease: 'power3.out', immediateRender: false}, 1.33);
    tl.to(ctx.q('.rg-launcher'), {opacity: 0, duration: 0.3}, 1.38);
    tl.to(ctx.q('.rg-materials'), {filter: 'blur(1.45px)', scale: 0.997, duration: 1.0, ease: 'power2.inOut'}, 1.4);
    tl.to(ctx.q('.rg-pointer'), {x: 1568, y: 973, duration: 0.7, ease: 'power2.inOut'}, 1.95);
    tl.to(ctx.q('.rg-pointer'), {opacity: 0, duration: 0.25}, 2.67);

    // The still image proves content and hierarchy, not any completion sequence.
    // Only attention and line emphasis move; both steps remain in progress.
    tl.fromTo(ctx.q('.rg-timeline-progress'), {height: 118}, {height: 188, duration: 1.25, ease: 'power2.inOut', immediateRender: false}, 6.0);
    tl.fromTo(ctx.q('.rg-step-1'), {opacity: 1}, {opacity: 0.78, duration: 1.05, ease: 'power1.inOut', immediateRender: false}, 6.25);
    tl.fromTo(ctx.q('.rg-step-2'), {opacity: 0.67}, {opacity: 1, duration: 1.05, ease: 'power1.inOut', immediateRender: false}, 6.45);
    tl.fromTo(ctx.q('.rg-step-1 .rg-step-spot'), {opacity: 0.6}, {opacity: 0, duration: 0.85, immediateRender: false}, 6.25);
    tl.fromTo(ctx.q('.rg-step-2 .rg-step-spot'), {opacity: 0}, {opacity: 1, duration: 0.95, immediateRender: false}, 6.55);
    tl.to(ctx.q('.rg-step-2 .rg-step-dot'), {backgroundColor: '#e2efda9c', borderColor: '#edf6e1dc', boxShadow: '0 0 0 4px #dfeddb18', duration: 0.55}, 7.0);
    tl.to({}, {duration: 0.01}, 10.99);
    return {timeline: tl, duration: 11};
  });
})();
