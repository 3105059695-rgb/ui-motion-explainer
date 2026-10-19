/* Collect UI observation studies. Motion mechanisms are adapted; artwork is original. */
(function () {
  'use strict';

  const TAU = Math.PI * 2;
  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

  function localImage(value) {
    if (value == null || value === '') return '';
    if (typeof value !== 'string') throw new Error('params.image must be a local relative image path.');
    const path = value.replace(/\\/g, '/');
    let decoded;
    try { decoded = decodeURIComponent(path); } catch (_error) { throw new Error('Invalid local image path.'); }
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(decoded) || /(?:^|\/)\.\.(?:\/|$)/.test(decoded) || /[\u0000-\u001f]/.test(decoded)) {
      throw new Error('params.image must stay within local relative assets; URLs and parent traversal are not supported.');
    }
    return path;
  }

  function mountainArt(variant) {
    // All paths, colours and proportions below are original editable geometry.
    if (variant === 'dawn') {
      return '<svg class="coi-landscape" viewBox="0 0 530 630" aria-label="原创几何山景，晨光与山脊">' +
        '<rect width="530" height="630" fill="#cbd5d3"/>' +
        '<path d="M0 0H530V352C420 343 309 286 0 301Z" fill="#dce0d3"/>' +
        '<path d="M0 0H530V140C411 139 230 104 0 178Z" fill="#e6e1cf"/>' +
        '<circle cx="369" cy="191" r="77" fill="#efb789"/>' +
        '<circle cx="369" cy="191" r="66" fill="#f5c99f"/>' +
        '<path d="M-32 375 80 253 169 305 276 211 414 364 551 278V631H-32Z" fill="#a9bab6"/>' +
        '<path d="m276 211 40 85-32-13-32 39-13-41z" fill="#e3e2cd"/>' +
        '<path d="M-25 458 125 323 260 465 376 312 574 441V631H-25Z" fill="#708e90"/>' +
        '<path d="m125 323 30 105-36-22-23 47-17-67z" fill="#a7bab5"/>' +
        '<path d="m376 312 32 97-44-19-21 49-18-52z" fill="#a5b6ac"/>' +
        '<path d="M-28 563C94 469 172 457 276 508S462 570 558 444V631H-28Z" fill="#466f76"/>' +
        '<path d="M-20 616C167 509 364 631 551 555V631H-20Z" fill="#254e59"/>' +
        '<path d="M98 535C204 486 280 534 345 540M320 595C394 605 471 583 522 560" fill="none" stroke="#9ab8b0" stroke-opacity=".33" stroke-width="1.3"/>' +
        '<path d="M38 210h70m-17 12h116m189-120h78" fill="none" stroke="#fbf7e8" stroke-opacity=".46" stroke-width="1.2"/>' +
        '</svg>';
    }
    return '<svg class="coi-landscape" viewBox="0 0 530 630" aria-label="原创几何日落，海面与山岸">' +
      '<rect width="530" height="630" fill="#30354c"/>' +
      '<path d="M0 109C139 92 331 177 530 111V452H0Z" fill="#6e6171"/>' +
      '<path d="M0 223C169 187 367 256 530 187V444H0Z" fill="#ab8185"/>' +
      '<path d="M0 306C122 263 331 326 530 249V450H0Z" fill="#ca9994"/>' +
      '<circle cx="256" cy="281" r="93" fill="#eab28f"/>' +
      '<circle cx="256" cy="281" r="80" fill="#f5c6a0"/>' +
      '<path d="M0 377 87 327 176 361 252 344 369 285 438 331 530 305V461H0Z" fill="#58536a"/>' +
      '<path d="M0 410H530V630H0Z" fill="#444c67"/>' +
      '<path d="M175 422h170l-20 8H196zm14 27h132l27 5H174zm-25 32h186l-29 7H186zm32 32h132l-25 8h-83zm31 31h66l-9 6h-45z" fill="#b6959f" opacity=".54"/>' +
      '<path d="M0 413 70 433 171 476 115 508 58 519 0 556Z" fill="#323b50"/>' +
      '<path d="m530 480-91 31-68 41-50 15-69 64h278z" fill="#283449"/>' +
      '<path d="m0 586 88-34 74 30 97 48H0Z" fill="#202d40"/>' +
      '<path d="M45 146h87m251 67h89M17 466h84m307-28h93m-168 145h106" stroke="#d6b8b3" stroke-opacity=".22" stroke-width="1.2" fill="none"/>' +
      '</svg>';
  }

  function matrixMarkup() {
    const groups = Array.from({length: 19}, () => []);
    for (let row = 0; row < 19; row++) {
      for (let column = 0; column < 19; column++) {
        const u = (column - 9) / 9;
        const v = (row - 9) / 9;
        const edge = Math.min(1, 1.24 - (u * u + v * v) * 0.32);
        const phase = (column + row * 2) % 19;
        const x = 265 + (column - 9) * 16;
        const y = 306 + (row - 9) * 16;
        const radius = 1.35 + edge * 0.55;
        groups[phase].push('<circle cx="' + x + '" cy="' + y + '" r="' + radius.toFixed(2) + '" fill="white" fill-opacity="' + edge.toFixed(3) + '"/>');
      }
    }
    return '<svg class="coi-dots-svg" viewBox="0 0 530 630" aria-hidden="true">' +
      groups.map((dots, index) => '<g class="coi-matrix-phase coi-matrix-phase-' + index + '">' + dots.join('') + '</g>').join('') + '</svg>';
  }

  function spherePoint(index, count, seconds) {
    const vertical = 1 - 2 * (index + 0.5) / count;
    const latitudeRadius = Math.sqrt(1 - vertical * vertical);
    const longitude = index * Math.PI * (3 - Math.sqrt(5));
    const originalX = Math.cos(longitude) * latitudeRadius;
    const originalZ = Math.sin(longitude) * latitudeRadius;
    const angle = seconds * 0.53;
    const rotatedX = originalX * Math.cos(angle) + originalZ * Math.sin(angle);
    const depth = originalZ * Math.cos(angle) - originalX * Math.sin(angle);
    const tilt = -0.17;
    const x = rotatedX * Math.cos(tilt) - vertical * Math.sin(tilt);
    const y = vertical * Math.cos(tilt) + rotatedX * Math.sin(tilt);
    const perspective = 0.92 + depth * 0.1;
    return {
      x: 265 + x * 128 * perspective,
      y: 306 + y * 128 * perspective,
      radius: 1.05 + (depth + 1) * 0.36,
      opacity: 0.18 + (depth + 1) * 0.39
    };
  }

  function sphereMarkup(count) {
    const dots = [];
    for (let index = 0; index < count; index++) {
      const point = spherePoint(index, count, 0);
      dots.push('<circle class="coi-sphere-dot" cx="' + point.x.toFixed(3) + '" cy="' + point.y.toFixed(3) + '" r="' + point.radius.toFixed(3) + '" opacity="' + point.opacity.toFixed(3) + '" fill="#f8fbff"/>');
    }
    return '<svg class="coi-dots-svg" viewBox="0 0 530 630" aria-hidden="true"><g class="coi-orbits" fill="none" stroke-width="2.2" style="filter:drop-shadow(0 0 1.5px #90baff38)"><ellipse cx="265" cy="306" rx="153" ry="161" stroke="#8ca9ff" opacity=".9"/><ellipse cx="265" cy="306" rx="165" ry="150" stroke="#bba2f2" opacity=".9"/><ellipse cx="265" cy="306" rx="174" ry="167" stroke="#7bd3dd" opacity=".85"/></g><g>' + dots.join('') + '</g></svg>';
  }

  const retryIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 8a8 8 0 1 0 .7 6M19 3v5h-5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  UIFX.register({
    id: 'ai-orb-image-reveal',
    title: 'AI 图像加载 · 点阵与轨道揭示',
    category: 'ai',
    duration: 8,
    description: '依据已观察的双卡加载机制适配：白色点阵明暗波浪与细环球体转动，随后在原位置用柔边圆形遮罩揭示原创 SVG 山景。',
    tags: ['Collect UI', 'Orb', 'AI Image Loader', '点阵', '柔边揭示'],
    source: 'https://x.com/ahmetloca/status/2102372801688576482',
    sourceStatus: 'observed-reconstruction',
    params: {title: '等待，也可以是一种设计。', prompt: '一束光，落在远处的山峦。', result: '一帧新的风景，已经就绪。', image: ''}
  }, function (ctx, params) {
    const p = Object.assign({title: '等待，也可以是一种设计。', prompt: '一束光，落在远处的山峦。', result: '一帧新的风景，已经就绪。', image: ''}, params);
    const image = localImage(p.image);
    const dotCount = 768;
    const artwork = variant => image ? '<img class="coi-local-image" src="' + escapeHTML(image) + '" alt="本地替换结果图"/>' : mountainArt(variant);
    const card = (variant, label, visual) => '<section class="coi-card coi-' + variant + '"><div class="coi-loader">' + visual + '<div class="coi-card-label">' + label + '</div><div class="coi-progress-caption"><i></i><span class="coi-progress-text">正在构建画面</span></div></div><div class="coi-art">' + artwork(variant) + '</div><div class="coi-image-shade"></div><div class="coi-result-caption"><small>' + (image ? 'LOCAL IMAGE' : 'ORIGINAL VECTOR') + '</small><strong>' + (image ? '本地结果图' : (variant === 'dawn' ? '远山与晨光' : '日落之后')) + '</strong></div><div class="coi-retry" aria-label="重新生成">' + retryIcon + '</div></section>';
    ctx.root.innerHTML = '<div class="coi-scene"><style>' +
      '.coi-scene{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#08090b;color:#f4f4f5;font-family:ProjectSans,sans-serif}.coi-scene *{box-sizing:border-box}.coi-scene .coi-eyebrow{position:absolute;left:370px;top:61px;font-family:ProjectDisplay,sans-serif;font-size:16px;letter-spacing:3.5px;color:#6f737f}.coi-scene .coi-title{position:absolute;left:366px;top:97px;margin:0;font-size:47px;line-height:1.3;font-weight:550;letter-spacing:-1px;max-width:1180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.coi-scene .coi-prompt{position:absolute;left:370px;top:169px;font-size:22px;line-height:1.6;color:#858993;max-width:1120px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.coi-scene .coi-card{position:absolute;top:237px;width:530px;height:630px;border:1px solid #25272e;border-radius:35px;background:#111216;overflow:hidden;box-shadow:0 25px 80px #0006}.coi-scene .coi-dawn{left:370px}.coi-scene .coi-dusk{left:1020px}.coi-scene .coi-loader{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 48%,#16181e 0%,#111216 68%)}.coi-scene .coi-dots-svg{position:absolute;inset:0;width:530px;height:630px}.coi-scene .coi-card-label{position:absolute;left:31px;top:29px;font-family:ProjectDisplay,sans-serif;font-size:13px;letter-spacing:2.5px;color:#656a77}.coi-scene .coi-progress-caption{position:absolute;left:0;right:0;bottom:54px;display:flex;justify-content:center;align-items:center;gap:11px;font-size:18px;line-height:28px;color:#9498a4}.coi-scene .coi-progress-caption i{width:5px;height:5px;border-radius:50%;background:#a9adba}.coi-scene .coi-art{position:absolute;inset:0;--coi-reveal:0px;mask-image:radial-gradient(circle at 50% 49%,#000 calc(var(--coi-reveal) - 30px),transparent var(--coi-reveal));-webkit-mask-image:radial-gradient(circle at 50% 49%,#000 calc(var(--coi-reveal) - 30px),transparent var(--coi-reveal))}.coi-scene .coi-landscape,.coi-scene .coi-local-image{display:block;width:100%;height:100%;object-fit:cover}.coi-scene .coi-image-shade{position:absolute;inset:0;background:linear-gradient(transparent 70%,#09111d55);opacity:0}.coi-scene .coi-result-caption{position:absolute;left:30px;bottom:27px;opacity:0;color:#f2f4f5}.coi-scene .coi-result-caption small{display:block;font-family:ProjectDisplay,sans-serif;font-size:10px;letter-spacing:2px;color:#e3e5e4aa;margin-bottom:9px}.coi-scene .coi-result-caption strong{display:block;font-size:23px;font-weight:480;line-height:1.3}.coi-scene .coi-retry{position:absolute;right:20px;top:20px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border:1px solid #ffffff30;border-radius:50%;background:#11192328;color:#f2f4f6;opacity:0}.coi-scene .coi-retry svg{width:17px;height:17px}.coi-scene .coi-result-line{position:absolute;left:370px;top:908px;font-size:21px;line-height:1.5;color:#9099a2;max-width:950px;opacity:0}.coi-scene .coi-proof{position:absolute;right:130px;bottom:47px;font-size:18px;line-height:26px;color:#616875;letter-spacing:.5px}' +
      '</style><div class="coi-eyebrow">AI IMAGE / LOADING STUDY</div><h1 class="coi-title">' + escapeHTML(p.title) + '</h1><div class="coi-prompt">' + escapeHTML(p.prompt) + '</div>' +
      card('dawn', '01 / MATRIX', matrixMarkup()) + card('dusk', '02 / ORBITAL', sphereMarkup(dotCount)) +
      '<div class="coi-result-line">' + escapeHTML(p.result) + '</div><div class="coi-proof">参考机制适配 · 界面示意</div></div>';

    const tl = ctx.gsap.timeline({paused: true});
    tl.set(ctx.qa('.coi-art'), {'--coi-reveal': '0px'}, 0);
    tl.set(ctx.qa('.coi-image-shade, .coi-result-caption, .coi-retry, .coi-result-line'), {opacity: 0}, 0);
    const step = 0.4;
    const sampleCount = 13;
    ctx.qa('.coi-matrix-phase').forEach((group, index) => {
      const brightness = seconds => {
        const phase = index / 19 * TAU - seconds * 2.0;
        const crest = Math.pow((Math.cos(phase) + 1) / 2, 2.1);
        return 0.12 + crest * 0.88;
      };
      tl.set(group, {opacity: brightness(0)}, 0);
      for (let sample = 1; sample <= sampleCount; sample++) {
        tl.to(group, {opacity: brightness(sample * step), duration: step, ease: 'sine.inOut'}, (sample - 1) * step);
      }
    });

    ctx.qa('.coi-sphere-dot').forEach((circle, index) => {
      const first = spherePoint(index, dotCount, 0);
      tl.set(circle, {attr: {cx: first.x, cy: first.y, r: first.radius}, opacity: first.opacity}, 0);
      for (let sample = 1; sample <= sampleCount; sample++) {
        const point = spherePoint(index, dotCount, sample * step);
        tl.to(circle, {attr: {cx: point.x, cy: point.y, r: point.radius}, opacity: point.opacity, duration: step, ease: 'none'}, (sample - 1) * step);
      }
    });
    tl.fromTo(ctx.q('.coi-orbits'), {rotation: 0, svgOrigin: '265 306'}, {rotation: 77, duration: 5.2, ease: 'none', svgOrigin: '265 306', immediateRender: false}, 0);
    tl.set(ctx.qa('.coi-progress-text'), {textContent: '正在构建画面'}, 0);
    tl.set(ctx.qa('.coi-progress-text'), {textContent: '正在细化光影'}, 1.9);
    tl.set(ctx.qa('.coi-progress-text'), {textContent: '完成色彩与构图'}, 3.7);
    tl.set(ctx.qa('.coi-progress-text'), {textContent: '准备呈现结果'}, 4.65);

    ['dawn', 'dusk'].forEach((variant, index) => {
      const at = 5.08 + index * 0.16;
      tl.fromTo(ctx.q('.coi-' + variant + ' .coi-art'), {'--coi-reveal': '0px'}, {'--coi-reveal': '520px', duration: 1.16, ease: 'power2.inOut', immediateRender: false}, at);
      tl.fromTo(ctx.q('.coi-' + variant + ' .coi-loader'), {opacity: 1}, {opacity: 0, duration: 0.55, ease: 'power1.in', immediateRender: false}, at + 0.4);
      tl.fromTo(ctx.q('.coi-' + variant + ' .coi-image-shade'), {opacity: 0}, {opacity: 1, duration: 0.45, immediateRender: false}, at + 0.94);
      tl.fromTo(ctx.q('.coi-' + variant + ' .coi-result-caption'), {opacity: 0, y: 7}, {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: false}, at + 1.05);
      tl.fromTo(ctx.q('.coi-' + variant + ' .coi-retry'), {opacity: 0, scale: 0.88}, {opacity: 1, scale: 1, duration: 0.35, ease: 'power2.out', immediateRender: false}, at + 1.1);
    });
    tl.fromTo(ctx.q('.coi-result-line'), {opacity: 0, y: 8}, {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', immediateRender: false}, 6.52);
    tl.to({}, {duration: 0.01}, 7.99);
    return {timeline: tl, duration: 8};
  });
})();
