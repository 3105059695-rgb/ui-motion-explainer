/* Observed mechanism adaptation: running dot horse inside a dark capsule.
   All graphics are locally authored SVG; no source video/image is embedded. */
(function () {
  'use strict';

  const icon = (kind, size = 26) => {
    const shapes = {
      file: '<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
      folder: '<path d="M3 7V5h7l2 3h9v13H3zM3 8h18"/>',
      grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/>'
    };
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shapes[kind] || shapes.file}</svg>`;
  };

  function inPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i], b = polygon[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    }
    return inside;
  }

  function segmentDistance(x, y, a, b) {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy || 1)));
    return Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy));
  }

  function horseBody() {
    const neck = [[19, 10], [19, 7], [21, 4], [23, 1], [27, 1], [28, 3], [31, 4], [30, 6], [26, 6], [25, 11], [22, 13]];
    const tail = [[7, 8], [4, 5], [1, 5], [0, 7], [3, 8], [5, 11], [7, 11]];
    let dots = '';
    for (let y = 0; y <= 14; y++) {
      for (let x = 0; x <= 31; x++) {
        const body = ((x - 14.4) / 10.1) ** 2 + ((y - 10) / 4.1) ** 2 < 1;
        const ear = (x === 24 && y === 0) || (x === 26 && y === 0);
        const eye = x === 27 && y === 3;
        if ((body || inPolygon(x, y, neck) || inPolygon(x, y, tail) || ear) && !eye) {
          const radius = ((x * 7 + y * 3) % 11 === 0) ? 1.95 : 2.25;
          dots += `<circle cx="${x * 7}" cy="${y * 7}" r="${radius}" fill="#F4F4EE"/>`;
        }
      }
    }
    return dots;
  }

  function legDots(chains, opacity) {
    let dots = '';
    for (let y = 12; y <= 22; y++) {
      for (let x = 0; x <= 32; x++) {
        const hit = chains.some(chain => chain.some((point, i) => i > 0 && segmentDistance(x, y, chain[i - 1], point) < .77));
        if (hit) dots += `<circle cx="${x * 7}" cy="${y * 7}" r="2.05" fill="#F4F4EE" opacity="${opacity}"/>`;
      }
    }
    return dots;
  }

  function horseLegs() {
    const poses = [
      { near: [[[8, 13], [5, 17], [1, 18]], [[21, 12], [24, 16], [28, 17]]], far: [[[10, 13], [11, 18], [7, 21]], [[19, 13], [18, 18], [22, 21]]] },
      { near: [[[8, 13], [4, 17], [6, 21]], [[21, 12], [21, 17], [18, 21]]], far: [[[10, 13], [12, 16], [15, 18]], [[19, 13], [23, 17], [28, 18]]] },
      { near: [[[8, 13], [12, 17], [16, 18]], [[21, 12], [18, 17], [15, 20]]], far: [[[10, 13], [7, 17], [3, 20]], [[19, 13], [21, 16], [24, 19]]] },
      { near: [[[8, 13], [7, 17], [11, 20]], [[21, 12], [25, 16], [29, 16]]], far: [[[10, 13], [4, 16], [0, 17]], [[19, 13], [20, 18], [17, 21]]] }
    ];
    return poses.map((pose, index) => `<g class="fxi-legs fxi-pose-${index}">${legDots(pose.far, .5)}${legDots(pose.near, 1)}</g>`).join('');
  }

  function mountainDots() {
    let dots = '';
    for (let x = 0; x <= 1840; x += 7) {
      const y = 239 + Math.sin(x * .014) * 14 + Math.sin(x * .032 + 1) * 6;
      dots += `<circle cx="${x}" cy="${y.toFixed(2)}" r="1.25" fill="#E7ECE8" opacity=".3"/>`;
      if (x % 21 === 0) dots += `<circle cx="${x}" cy="${(y + 8).toFixed(2)}" r="1" fill="#D7E0D8" opacity=".14"/>`;
    }
    return dots;
  }

  function tree(x, y, size) {
    let dots = '';
    for (let row = 0; row <= 10; row++) {
      const width = row < 3 ? row : row < 6 ? row - 2 : row - 4;
      for (let col = -width; col <= width; col++) {
        dots += `<rect x="${(x + col * size).toFixed(2)}" y="${(y + row * size).toFixed(2)}" width="${(size * .61).toFixed(2)}" height="${(size * .61).toFixed(2)}" rx=".35" fill="#BDD3B9" opacity="${row < 3 ? .66 : .78}"/>`;
      }
    }
    for (let row = 11; row <= 13; row++) dots += `<rect x="${x}" y="${(y + row * size).toFixed(2)}" width="${(size * .65).toFixed(2)}" height="${(size * .65).toFixed(2)}" fill="#D5DED0" opacity=".5"/>`;
    return dots;
  }

  function landscapeTrees() {
    const trees = [[100, 221, 3.5], [328, 237, 2.4], [673, 229, 2.9], [948, 220, 3.55], [1225, 239, 2.3], [1503, 226, 3.15], [1800, 235, 2.5]];
    return trees.map(item => tree(...item)).join('');
  }

  function groundDots() {
    let dots = '';
    for (let x = 0; x <= 1840; x += 10) {
      dots += `<rect x="${x}" y="276" width="2.3" height="2.3" fill="#C4D5BD" opacity=".27"/>`;
      if (x % 30 === 0) dots += `<rect x="${x + 5}" y="286" width="2" height="2" fill="#C4D5BD" opacity=".13"/>`;
    }
    return dots;
  }

  UIFX.register({
    id: 'ambient-agent-island',
    title: '点阵跑马工作状态',
    category: 'ambient',
    duration: 10,
    description: '黑色胶囊中的点阵马持续奔跑，远处点阵山脉与近处像素树以不同速度滚动，保持清楚而克制的 AI 工作状态。',
    tags: ['Dynamic Island', '点阵', '工作状态', '景物滚动'],
    source: 'https://x.com/krispuckett/status/2103342411581882811',
    sourceStatus: 'observed-reconstruction',
    params: { title: '正在整理你的素材', prompt: '读取文件、提取主题，并整理内容结构。' }
  }, (ctx, params) => {
    const p = Object.assign({ title: '正在整理你的素材', prompt: '读取文件、提取主题，并整理内容结构。' }, params || {});
    const title = ctx.esc(String(p.title)), prompt = ctx.esc(String(p.prompt));
    const stars = [[130, 82], [253, 118], [642, 65], [763, 105], [676, 155], [380, 50]];
    ctx.root.innerHTML = `<style>
      .fxi-island{background:#F7F7F2;color:#24272B;font-family:ProjectSans,sans-serif}
      .fxi-island *{box-sizing:border-box}.fxi-island svg{flex-shrink:0}
      .fxi-island .fxi-kicker{position:absolute;left:113px;top:90px;font-size:23px;letter-spacing:2px;color:#9C9D92}
      .fxi-island .fxi-title{position:absolute;left:108px;top:134px;font-size:60px;font-weight:650;line-height:1.35;letter-spacing:-1.2px;max-width:1640px}
      .fxi-island .fxi-editor{position:absolute;left:270px;top:270px;width:1380px;height:640px;border:1px solid #E3E4DD;border-radius:29px;background:#FFF;box-shadow:0 35px 100px #4043330B;overflow:hidden}
      .fxi-island .fxi-chrome{height:66px;display:flex;align-items:center;justify-content:center;border-bottom:1px solid #EDEEE8;background:#FCFDF9;position:relative;font-size:21px;color:#999D93}
      .fxi-island .fxi-dots{position:absolute;left:27px;display:flex;gap:8px}.fxi-island .fxi-dots>i{width:10px;height:10px;border-radius:50%;background:#D8DCD2}
      .fxi-island .fxi-chrome-icon{position:absolute;right:29px;color:#B0B5A8;display:flex;align-items:center}
      .fxi-island .fxi-sidebar{position:absolute;top:66px;left:0;bottom:0;width:225px;padding:35px 20px;background:#FBFCF8;border-right:1px solid #EBEEE5}
      .fxi-island .fxi-section{font-size:19px;color:#B1B7A8;margin:0 15px 25px}
      .fxi-island .fxi-nav{height:67px;padding:0 15px;display:flex;gap:13px;align-items:center;font-size:23px;color:#9CA492;border-radius:12px;margin-bottom:8px}
      .fxi-island .fxi-nav.active{background:#F0F3EA;color:#87947B}
      .fxi-island .fxi-sidebar-note{position:absolute;bottom:34px;left:34px;right:27px;font-size:18px;color:#B5BCAA;line-height:1.7}
      .fxi-island .fxi-workspace-title{position:absolute;left:273px;top:98px;font-size:29px;font-weight:550;color:#7B8472}
      .fxi-island .fxi-live{position:absolute;right:49px;top:103px;display:flex;align-items:center;gap:10px;font-size:21px;color:#A1AD95}
      .fxi-island .fxi-live-dot{width:8px;height:8px;border-radius:50%;background:#AFBE9E}
      .fxi-island .fxi-capsule{position:absolute;left:615px;top:430px;width:920px;height:320px;background:#151717;border:1px solid #212622;border-radius:160px;overflow:hidden;box-shadow:0 18px 40px #16201413}
      .fxi-island .fxi-capsule>svg{display:block;width:920px;height:320px}
      .fxi-island .fxi-prompt{position:absolute;left:625px;right:360px;top:790px;font-size:26px;line-height:1.65;text-align:center;color:#919C86}
      .fxi-island .fxi-running-note{position:absolute;left:625px;right:360px;top:847px;text-align:center;font-size:19px;color:#B4BCA9;letter-spacing:.5px}
      .fxi-island .fx-proof{position:absolute;right:62px;bottom:35px;color:#929A87;font-size:20px}
    </style><div class="fx-scene fxi-island">
      <div class="fxi-kicker">IN PROGRESS / A LITTLE LIFE IN THE WAIT</div><div class="fxi-title">${title}</div>
      <div class="fxi-editor"><div class="fxi-chrome"><span class="fxi-dots"><i></i><i></i><i></i></span><span>素材工作台</span><span class="fxi-chrome-icon">${icon('grid', 21)}</span></div>
        <aside class="fxi-sidebar"><div class="fxi-section">工作空间</div><div class="fxi-nav">${icon('grid', 24)} 概览</div><div class="fxi-nav active">${icon('folder', 24)} 我的素材</div><div class="fxi-nav">${icon('clock', 24)} 最近任务</div><div class="fxi-sidebar-note">保留思路，<br>让整理自然发生。</div></aside>
        <div class="fxi-workspace-title">素材整理</div><div class="fxi-live"><span class="fxi-live-dot"></span><span>处理中</span></div>
      </div>
      <div class="fxi-capsule"><svg viewBox="0 0 920 320" fill="none" aria-hidden="true">
        <g class="fxi-stars">${stars.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.2 : 1.4}" fill="#E1E9DE" opacity="${i % 2 ? .17 : .26}"/>`).join('')}</g>
        <g class="fxi-mountains">${mountainDots()}</g><g class="fxi-trees">${landscapeTrees()}</g>
        <g class="fxi-horse">${horseLegs()}<g class="fxi-horse-body">${horseBody()}</g></g>
        <g class="fxi-ground">${groundDots()}</g>
      </svg></div>
      <div class="fxi-prompt">${prompt}</div><div class="fxi-running-note">持续整理中</div>
      <div class="fx-proof">界面示意 / 运行状态机制适配</div>
    </div>`;

    const q = selector => ctx.root.querySelector(selector);
    const poses = Array.from(ctx.root.querySelectorAll('.fxi-legs'));
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'none' } });
    tl.set(q('.fxi-capsule'), { clipPath: 'inset(0% round 160px)', opacity: 1, scale: 1 }, 0)
      .set(q('.fxi-mountains'), { x: -25, y: 0 }, 0)
      .set(q('.fxi-trees'), { x: 0, y: 0 }, 0)
      .set(q('.fxi-ground'), { x: 0, y: 0 }, 0)
      .set(q('.fxi-horse'), { x: 349, y: 117 }, 0)
      .set(poses, { opacity: 0 }, 0)
      .set(poses[0], { opacity: 1 }, 0)
      .to(q('.fxi-mountains'), { x: -197, duration: 10 }, 0)
      .to(q('.fxi-trees'), { x: -485, duration: 10 }, 0)
      .to(q('.fxi-ground'), { x: -665, duration: 10 }, 0);

    const lift = [0, -5, -7, -2];
    // Explicit pose frames make arbitrary seeks and reverse playback reproducible.
    for (let frame = 1; frame <= 66; frame++) {
      const time = frame * .15;
      const pose = frame % 4;
      tl.set(poses, { opacity: 0 }, time).set(poses[pose], { opacity: 1 }, time);
      tl.to(q('.fxi-horse'), {
        x: 349 + Math.sin(frame * .075) * 18,
        y: 117 + lift[pose],
        duration: .15,
        ease: 'sine.inOut'
      }, time - .15);
    }
    // The clip ends with the same running status; no unobserved success state.
    tl.to(q('.fxi-horse'), { x: 331.2, y: 112, duration: .1, ease: 'sine.inOut' }, 9.9);
    return { timeline: tl, duration: 10 };
  });
})();
