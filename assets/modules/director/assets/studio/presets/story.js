/* One continuous Codex window; an outer camera frames the existing UI scene. */
(function () {
  'use strict';

  const defaults = {
    title: '从一句需求，到一个成品',
    prompt: '创建一个简洁的 AI 工作台首页，支持任务与文件预览。',
    result: '页面已完成，预览已就绪。'
  };

  const CSS = `
  .story-codex{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#f7f8fa;color:#1c2028;font-family:ProjectSans,sans-serif;isolation:isolate}
  .story-codex *{box-sizing:border-box}
  .story-codex .story-halo{position:absolute;left:460px;top:125px;width:1000px;height:780px;border-radius:50%;background:radial-gradient(ellipse,#cfbdec66,transparent 67%);pointer-events:none}
  .story-codex .story-viewport{position:absolute;inset:0;perspective:2000px;perspective-origin:50% 50%}
  .story-codex .story-camera,.story-codex .story-scene{position:absolute;left:0;top:0;width:1920px;height:1080px;transform-origin:960px 540px}
  .story-codex .story-scene .swfx{background:transparent}
  .story-codex .story-scene .sw-kicker,.story-codex .story-scene .sw-heading,.story-codex .story-scene .sw-footnote,.story-codex .story-scene .sw-proof{display:none}
  .story-codex .story-intro{position:absolute;left:185px;top:340px;width:1550px;z-index:3;text-align:center;pointer-events:none;transform-origin:50% 50%}
  .story-codex .story-intro-label{font-family:ProjectDisplay,ProjectSans,sans-serif;letter-spacing:8px;font-size:22px;color:#8a6bb4;margin:0 0 30px}
  .story-codex .story-intro-title{font-size:104px;letter-spacing:-4px;font-weight:680;line-height:1.22;margin:0;overflow-wrap:anywhere}
  .story-codex .story-intro-rule{height:4px;width:240px;margin:36px auto 0;background:linear-gradient(90deg,#1d222c,#b49ad9);border-radius:2px;transform-origin:left center}
  .story-codex .story-heading{position:absolute;left:130px;top:79px;margin:0;font-size:42px;line-height:1.25;letter-spacing:-1px;font-weight:650;max-width:1660px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:4;pointer-events:none}
  .story-codex .story-result{position:absolute;left:130px;right:130px;bottom:61px;margin:0;color:#47404f;font-size:31px;line-height:1.45;text-align:center;z-index:4;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;pointer-events:none}
  .story-codex .story-proof{position:absolute;right:130px;bottom:25px;color:#9a969f;font-size:17px;letter-spacing:.3px;z-index:4;pointer-events:none}
  `;

  // Read layout coordinates, excluding transforms from the paused child scene.
  // This keeps the camera tied to the actual preview even if its layout changes.
  function layoutCenter(element, stop) {
    let x = element.offsetWidth / 2;
    let y = element.offsetHeight / 2;
    let node = element;
    while (node && node !== stop) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return {x, y, width: element.offsetWidth, height: element.offsetHeight};
  }

  UIFX.register({
    id: 'continuous-codex-story',
    title: 'Codex · 一镜到底的创作过程',
    category: 'software',
    duration: 20,
    description: '标题冲击与透视窗口显露后，在同一 Codex 窗口输入需求、执行任务，最后推近已生成的预览并停留。',
    tags: ['Codex', '连续操作', '镜头推进', '成果预览', '界面示意'],
    sourceStatus: 'illustrative-product',
    params: {...defaults}
  }, function (ctx, params) {
    const p = Object.assign({}, defaults, params);
    ctx.root.innerHTML = '<div class="story-codex"><style>' + CSS + '</style>' +
      '<div class="story-halo"></div>' +
      '<div class="story-viewport"><div class="story-camera"><div class="story-scene"></div></div></div>' +
      '<div class="story-intro"><div class="story-intro-label">CODEX</div><h1 class="story-intro-title">' + ctx.esc(p.title) + '</h1><div class="story-intro-rule"></div></div>' +
      '<h2 class="story-heading">' + ctx.esc(p.title) + '</h2>' +
      '<p class="story-result">' + ctx.esc(p.result) + '</p>' +
      '<div class="story-proof">Codex · 界面示意</div></div>';

    const sceneRoot = ctx.q('.story-scene');
    // Only these content parameters are inherited: this story owns its 20 s timing.
    const software = UIFX.mount('software-codex-task', sceneRoot, {
      title: p.title, prompt: p.prompt, result: p.result
    });
    const output = sceneRoot.querySelector('.cx-output');
    const preview = sceneRoot.querySelector('.cx-preview');
    if (!output || !preview) throw new Error('continuous-codex-story needs the Codex output and preview regions.');

    const camera = ctx.q('.story-camera');
    const intro = ctx.q('.story-intro');
    const title = ctx.q('.story-intro-title');
    const heading = ctx.q('.story-heading');
    const result = ctx.q('.story-result');
    const halo = ctx.q('.story-halo');
    const titleLength = Array.from(String(p.title)).length;
    title.style.fontSize = (titleLength > 36 ? 66 : titleLength > 24 ? 82 : 104) + 'px';

    const target = layoutCenter(preview, sceneRoot);
    // The outcome remains part of the original window. Keep its full preview
    // height in view and retain some conversation context to its left.
    const zoom = Math.min(1.2, 746 / Math.max(target.height, 1));
    const endCamera = {
      scale: zoom,
      x: 1340 - 960 - (target.x - 960) * zoom,
      y: 570 - 540 - (target.y - 540) * zoom
    };

    const tl = ctx.gsap.timeline({paused: true});
    tl.set(camera, {x: 110, y: 235, scale: 0.76, rotationX: 12, rotationY: -10, rotationZ: -3.2, opacity: 0}, 0);
    tl.set(intro, {opacity: 0, y: 28, scale: 1.045}, 0);
    tl.set(ctx.q('.story-intro-rule'), {scaleX: 0}, 0);
    tl.set(heading, {opacity: 0, y: 8}, 0);
    tl.set(result, {opacity: 0, y: 12}, 0);
    tl.set(halo, {opacity: 0.25, scale: 0.8}, 0);

    // 0–3.05: typography establishes the idea; the actual working window arrives.
    tl.to(intro, {opacity: 1, y: 0, scale: 1, duration: 0.65, ease: 'power3.out'}, 0.12);
    tl.to(ctx.q('.story-intro-rule'), {scaleX: 1, duration: 0.65, ease: 'power3.inOut'}, 0.52);
    tl.to(halo, {opacity: 0.85, scale: 1.16, duration: 1.3, ease: 'power2.out'}, 0.35);
    tl.to(intro, {opacity: 0, y: -100, scale: 0.9, duration: 0.7, ease: 'power3.inOut'}, 1.7);
    tl.to(camera, {opacity: 1, duration: 0.3, ease: 'power1.out'}, 2.2);
    tl.to(camera, {x: 0, y: 0, scale: 1, rotationX: 0, rotationY: 0, rotationZ: 0, duration: 0.85, ease: 'power3.out'}, 2.2);
    tl.to(halo, {opacity: 0, duration: 0.65, ease: 'power2.out'}, 2.25);
    tl.to(heading, {opacity: 1, y: 0, duration: 0.4, ease: 'power2.out'}, 2.9);

    // 2.2–16.2: retain the original scene timeline and all its editable elements.
    // Nested timeline seeking works in either direction; no completion callbacks.
    tl.add(software.timeline.paused(false), 2.2);

    // 15.65–17.65: move only the parent camera toward the already-visible preview.
    // 17.65–20: hold the same completed product for an unhurried read.
    tl.to(heading, {opacity: 0, y: -8, duration: 0.4, ease: 'power2.in'}, 15.65);
    tl.to(camera, {...endCamera, duration: 1.9, ease: 'power3.inOut'}, 15.75);
    tl.to(result, {opacity: 1, y: 0, duration: 0.55, ease: 'power2.out'}, 17.1);
    tl.to({}, {duration: 0.01}, 19.99);
    return {timeline: tl, duration: 20};
  });
})();
