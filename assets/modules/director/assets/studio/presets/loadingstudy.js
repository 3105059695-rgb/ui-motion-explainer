/* Sasha Birukoff mini-loader study: observed motion, independently drawn UI. */
(function () {
  'use strict';
  const duration = 8;
  const states = [
    { at: 0, dots: [[9,-12,1],[9,0,1],[-3,0,1],[-3,12,1],[9,0,0],[-3,0,0]] },
    { at: .46, dots: [[-12,-6,1],[-12,6,1],[12,-6,1],[12,6,1],[0,-6,0],[0,6,0]] },
    { at: .72, dots: [[-12,-12,1],[-12,0,1],[0,12,1],[12,12,1],[-12,0,0],[0,12,0]] },
    { at: .98, dots: [[-12,-12,1],[-12,0,1],[0,0,1],[0,12,1],[-12,0,0],[0,0,0]] },
    { at: 1.27, dots: [[0,-13,1],[-12,-6,1],[-12,7,1],[0,13,1],[12,7,1],[12,-6,1]] },
    { at: 1.52, dots: [[0,-13,1],[-12,0,1],[0,0,1],[12,0,1],[-12,13,1],[12,13,1]] },
    { at: 1.78, dots: [[9,-12,1],[9,0,1],[-3,0,1],[-3,12,1],[9,0,0],[-3,0,0]] },
    { at: 2, dots: [[9,-12,1],[9,0,1],[-3,0,1],[-3,12,1],[9,0,0],[-3,0,0]] }
  ];
  UIFX.register({
    id: 'loading-sidebar-dot-morph', title: 'Mini Loader · 软件侧栏点阵变形',
    category: 'ambient', duration,
    source: 'https://x.com/sashabirukoff/status/2103542045461901417',
    referenceMedia: 'https://cdn.collectui.com/amplify_video/2102847434636296193/vid/avc1/2728x2160/-mdKguyexHDWvCSd-optimized.mp4',
    sourceStatus: 'observed-reconstruction', sourceObservation: 'multiple-video-times',
    description: '黑色软件侧栏保持两项任务与选中行；两个小点阵在双列、斜列和展开点簇之间持续变形，适合口播中的等待与处理段。',
    adaptationNotes: '观察原片6.866667秒的完整加载状态；横屏重新排布侧栏与背景，8秒可定位循环。背景、文件夹图标、圆点均独立绘制；圆点路径、数量显隐与周期为观察后的近似重建，并非原作源码。三行文字改为中文可编辑参数，result对应选中任务名称，不表示执行完成。原片未显示点击、输入或完成，重建没有添加这些操作。',
    tags: ['Collect UI', 'Loading Animation', '软件侧栏', '点阵', '连续变形', '等待状态'],
    params: { title: '代码', prompt: '添加 AI 动效脚本', result: '本地预览加载中' },
    paramLimits: { title: 20, prompt: 26, result: 26 }
  }, function (c, p) {
    const e = c.esc;
    const clean = (value, fallback, limit) => Array.from(String(value || fallback).replace(/\s+/g, ' ').trim() || fallback).slice(0, limit).join('');
    const title = clean(p.title, '代码', 20);
    const prompt = clean(p.prompt, '添加 AI 动效脚本', 26);
    const result = clean(p.result, '本地预览加载中', 26);
    const fontSize = value => Array.from(value).length > 20 ? 32 : 36;
    const loader = name => `<span class="ls14-loader ${name}" aria-hidden="true">${Array.from({ length: 6 }, (_, i) => `<i class="ls14-dot ls14-d${i}"></i>`).join('')}</span>`;
    c.root.innerHTML = `<style>
      .ls14-scene{background:#f4f5df;color:#ababaa;font-family:ProjectSans,sans-serif}
      .ls14-scene *{box-sizing:border-box}
      .ls14-backdrop{position:absolute;inset:0;background:radial-gradient(ellipse at 61% 12%,#b7d9d54d 0,transparent 49%),radial-gradient(ellipse at 19% 77%,#cee7d69e 0,transparent 43%),radial-gradient(ellipse at 80% 68%,#fffff2 0,transparent 47%),linear-gradient(116deg,#fbf7dc,#e9f4eb 58%,#f9f8e5)}
      .ls14-panel{position:absolute;left:320px;top:158px;width:1280px;height:704px;border-radius:48px;background:#131313;overflow:hidden;box-shadow:0 22px 90px #94aaa91a}
      .ls14-panel:before{content:'';position:absolute;left:88px;right:72px;top:0;bottom:0;border-left:2px solid #444443;border-right:2px solid #252525}
      .ls14-topshade{position:absolute;left:90px;right:75px;top:0;height:76px;background:linear-gradient(180deg,#1e1e1e,#171717);border-bottom:1px solid #191919}
      .ls14-folder{position:absolute;left:151px;right:118px;top:168px;height:66px;display:flex;align-items:center;gap:25px}
      .ls14-folder-icon{width:47px;height:44px;flex:none;fill:none;stroke:#989898;stroke-width:3.2;stroke-linejoin:round;stroke-linecap:round}
      .ls14-folder-title{display:block;font-size:${fontSize(title)}px;line-height:54px;font-weight:400;white-space:nowrap;max-width:920px;overflow:hidden}
      .ls14-row{position:absolute;left:118px;right:111px;height:108px;border-radius:25px;display:flex;align-items:center;padding:0 28px;gap:30px}
      .ls14-first{top:247px}.ls14-selected{top:358px;background:#242424;color:#c7c7c6}
      .ls14-row-text{display:block;font-weight:400;line-height:54px;white-space:nowrap;max-width:935px;overflow:hidden}
      .ls14-first .ls14-row-text{font-size:${fontSize(prompt)}px}.ls14-selected .ls14-row-text{font-size:${fontSize(result)}px}
      .ls14-loader{position:relative;display:block;width:47px;height:42px;flex:none}
      .ls14-dot{position:absolute;left:21px;top:18px;width:7px;height:7px;border-radius:50%;background:#9f9f9d;display:block;will-change:transform,opacity}
      .ls14-proof{position:absolute;left:0;right:0;top:928px;text-align:center;color:#7c8980;font-size:20px;line-height:30px;letter-spacing:1px}
    </style><div class="fx-scene ls14-scene"><div class="ls14-backdrop"></div><section class="ls14-panel" aria-label="加载任务界面示意"><div class="ls14-topshade"></div><div class="ls14-folder"><svg class="ls14-folder-icon" viewBox="0 0 46 42" aria-hidden="true"><path d="M5 34V10Q5 6 9 6H17L22 11H36Q40 11 40 15V18M7 34L15 18H43L35 34Z"/></svg><span class="ls14-folder-title">${e(title)}</span></div><div class="ls14-row ls14-first">${loader('ls14-loader-a')}<span class="ls14-row-text">${e(prompt)}</span></div><div class="ls14-row ls14-selected">${loader('ls14-loader-b')}<span class="ls14-row-text">${e(result)}</span></div></section><div class="ls14-proof">界面动效示意 · 持续加载状态</div></div>`;
    const tl = c.gsap.timeline({ paused: true });
    function animateLoader(selector, phase) {
      const dots = c.qa(`${selector} .ls14-dot`);
      const initial = states.findIndex(state => state.at >= phase);
      const start = states[initial].dots;
      dots.forEach((dot, i) => tl.set(dot, { x: start[i][0], y: start[i][1], opacity: start[i][2] }, 0));
      // Explicit finite tweens permit direct late seeks and exact backwards restoration.
      for (let cycle = -1; cycle < 5; cycle++) {
        for (let index = 1; index < states.length; index++) {
          const from = states[index - 1], to = states[index];
          const end = cycle * 2 + to.at - phase;
          const begin = cycle * 2 + from.at - phase;
          if (end <= 0 || begin >= duration) continue;
          const tweenStart = Math.max(0, begin);
          const tweenEnd = Math.min(duration, end);
          dots.forEach((dot, i) => tl.to(dot, { x: to.dots[i][0], y: to.dots[i][1], opacity: to.dots[i][2], duration: tweenEnd - tweenStart, ease: 'sine.inOut' }, tweenStart));
        }
      }
    }
    animateLoader('.ls14-loader-a', 0);
    animateLoader('.ls14-loader-b', .46);
    tl.to({}, { duration: .001 }, duration - .001);
    return { timeline: tl, duration };
  });
})();
