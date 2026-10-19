/* Static Scenes composer reconstruction. The illustrations and motion are original;
   the observed source image contains no submission or generated-video result. */
(function () {
  'use strict';
  const promptDefault = 'Combine the selected clips to create a cinematic transition between scene 2 and scene 3.';
  const paths = {
    close: '<path d="m7 7 10 10M17 7 7 17"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    connect: '<path d="m8 7 9 5-9 5V7"/><circle cx="7" cy="6" r="3.1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="3.1" fill="currentColor" stroke="none"/><circle cx="7" cy="18" r="3.1" fill="currentColor" stroke="none"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="8.5" cy="9" r="1.8"/><path d="m4 18 5-5 4 3 3-4 4 5"/>',
    video: '<rect x="2.5" y="5" width="13.5" height="14" rx="3.5"/><path d="m16 9 5-3v12l-5-3z"/>',
    mic: '<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8"/>',
    send: '<path d="M12 20V4m-6 6 6-6 6 6"/>'
  };
  const icon = (name, size = 28) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;

  function grassDefs(id, base, light) {
    return `<defs><linearGradient id="${id}-grass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="${base}"/></linearGradient><pattern id="${id}-blades" width="25" height="29" patternUnits="userSpaceOnUse"><path d="m3 16 2-5m9 15 1-4m5-13 1-4M8 6l1-3m12 22 2-4" stroke="#DDE4AF" stroke-width="1.15" opacity=".28"/><path d="m7 23 1-4m8-4 2-5M1 28l1-4" stroke="#152F1F" opacity=".22"/></pattern></defs><rect width="320" height="320" fill="url(#${id}-grass)"/><path d="M-65 70 95-35h86L-4 97zm34 133L291-3h68L-20 260zm148 134L330 192v72l-121 74z" fill="#DBE7B7" opacity=".07"/><rect width="320" height="320" fill="url(#${id}-blades)"/>`;
  }

  function firstThumbnail() {
    return `<svg viewBox="0 0 320 320" role="img" aria-label="原创 SVG：草地上的导演椅、球拍与网球">
      ${grassDefs('scn-court', '#315340', '#9BAA72')}
      <defs><linearGradient id="scn-chair-fabric" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#1B4438"/><stop offset="1" stop-color="#0B2720"/></linearGradient><linearGradient id="scn-chair-wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#EDD6A1"/><stop offset="1" stop-color="#A48455"/></linearGradient></defs>
      <path d="M91 195 171 180l104 76-96 27z" fill="#112E24" opacity=".26"/>
      <g transform="translate(53 18) rotate(-8 106 124)">
        <path d="m42 128 104 91m-3-95L47 224" stroke="#846E4A" stroke-width="8" stroke-linecap="round"/>
        <path d="m45 130 100 91m-1-92L47 224" stroke="url(#scn-chair-wood)" stroke-width="5" stroke-linecap="round"/>
        <path d="M47 72v105m97-110v109M37 126l-1 17m119-21v20" stroke="#CBB47D" stroke-width="6" stroke-linecap="round"/>
        <path d="m50 77 91-6v57l-91 6z" fill="url(#scn-chair-fabric)"/><path d="m51 81 88-6m-87 52 87-6" stroke="#99A591" stroke-width="1.2" opacity=".55"/>
        <path d="m48 136 95-6 11 28-105 7z" fill="#12362D"/><path d="m49 140 94-6" stroke="#648578" stroke-width="1.3"/>
        <path d="m35 128 29-1m72-5 27-1" stroke="#CFB982" stroke-width="7" stroke-linecap="round"/>
        <circle cx="97" cy="174" r="4" fill="#AA9A78"/>
      </g>
      <g transform="translate(198 156) rotate(34 31 63)">
        <ellipse cx="31" cy="37" rx="24" ry="34" fill="#345843" stroke="#EDE9D8" stroke-width="4"/>
        <path d="M15 16v42m8-50v60m8-64v66m8-62v59m8-54v47M9 22h44M7 32h48M8 42h47M11 52h40" stroke="#EDEBDD" stroke-width="1" opacity=".68"/>
        <path d="m21 69 10 21 10-21M31 88v32" fill="none" stroke="#DCDAC9" stroke-width="4"/>
        <path d="M31 106v27" stroke="#4B362A" stroke-width="8" stroke-linecap="round"/><path d="m27 111 8 3m-8 4 8 3m-8 4 8 3" stroke="#B38F68" stroke-width="1.2"/>
      </g>
      <ellipse cx="268" cy="265" rx="20" ry="10" fill="#1E3E2B" opacity=".3"/><circle cx="264" cy="255" r="15" fill="#D7DF7F"/><path d="M254 243q18 11 10 26" fill="none" stroke="#FBF9CA" stroke-width="2.3"/><circle cx="258" cy="249" r="5" fill="#EFF0A8" opacity=".45"/>
    </svg>`;
  }

  function secondThumbnail() {
    return `<svg viewBox="0 0 320 320" role="img" aria-label="原创 SVG：阳光下的橙色导演椅">
      ${grassDefs('scn-orange', '#4B5E3B', '#B8B98D')}
      <defs><linearGradient id="scn-orange-fabric" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F09B4F"/><stop offset=".52" stop-color="#D9692E"/><stop offset="1" stop-color="#A84425"/></linearGradient><linearGradient id="scn-orange-metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F4E3C1"/><stop offset="1" stop-color="#A89070"/></linearGradient></defs>
      <path d="M0 59 320 29v32L0 91" fill="#E4DBC2" opacity=".21"/>
      <path d="m107 211 88-6 100 75-156 23-47-67z" fill="#2B3B2B" opacity=".29"/>
      <g transform="rotate(8 159 167)">
        <path d="m96 153 124 116m-9-119L92 271" stroke="#A38C6B" stroke-width="10" stroke-linecap="round"/>
        <path d="m96 150 123 119m-7-120L92 271" stroke="url(#scn-orange-metal)" stroke-width="6.2" stroke-linecap="round"/>
        <path d="M96 70v150m119-154v150" stroke="#DBC2A2" stroke-width="7" stroke-linecap="round"/>
        <path d="m100 76 111-6v65l-111 6z" fill="url(#scn-orange-fabric)"/><path d="m105 82 100-5m-100 56 100-6" stroke="#FAC18A" stroke-width="1.5" opacity=".7"/>
        <path d="m100 81 8 51m94-56-3 48" stroke="#AB4828" stroke-width="2" opacity=".25"/>
        <path d="m96 161 115-6 13 29-124 10z" fill="#CB622E"/><path d="m102 165 105-4 13 18-118 9z" fill="url(#scn-orange-fabric)"/>
        <path d="M83 158v21m145-30v21" stroke="#D8BD95" stroke-width="6"/>
        <path d="m79 155 41-1m77-7 38-1" stroke="#EDD4AD" stroke-width="9" stroke-linecap="round"/>
        <circle cx="156" cy="210" r="5" fill="#A58C6D"/><circle cx="155" cy="209" r="2" fill="#E8DDC4"/>
      </g>
    </svg>`;
  }

  function thirdThumbnail() {
    return `<svg viewBox="0 0 320 320" role="img" aria-label="原创 SVG：网球场上奔跑的运动员腿部">
      ${grassDefs('scn-runner', '#4E6C4B', '#A4B78B')}
      <defs><linearGradient id="scn-skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#DAA777"/><stop offset=".46" stop-color="#BA7D53"/><stop offset="1" stop-color="#855735"/></linearGradient><linearGradient id="scn-shorts" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFEF4"/><stop offset="1" stop-color="#D9DFCF"/></linearGradient></defs>
      <path d="M-20 270 329 148" stroke="#EBEEDC" stroke-width="9" opacity=".75"/><path d="m111 224 132-45 69 45-133 40z" fill="#233D2D" opacity=".24"/>
      <path d="m145 16 52 16-22 68-62 58-36 34-19-19 40-60 30-44z" fill="url(#scn-skin)"/>
      <path d="m178 29 44 4-1 69-4 32 31 63-26 11-48-66-13-32z" fill="url(#scn-skin)"/>
      <path d="m157 52-19 40-40 53" fill="none" stroke="#E8B98E" stroke-width="10" opacity=".35" stroke-linecap="round"/>
      <path d="m197 120 29 62" fill="none" stroke="#E6B18C" stroke-width="8" opacity=".35" stroke-linecap="round"/>
      <path d="M117-14 235-8l-6 70-59 6-9-22-21 17-38-28z" fill="url(#scn-shorts)"/>
      <path d="m167 1 3 52m45-48 1 46" stroke="#C4CCBE" stroke-width="2" fill="none"/>
      <path d="m59 167 26 22-18 22-23-19z" fill="#F0F1E8"/><path d="m58 173 22 19" stroke="#B9553E" stroke-width="3"/><path d="m53 179 23 19" stroke="#527263" stroke-width="2"/>
      <path d="m44 187 27 22-18 22-27 4-15-11 10-17z" fill="#F6F4E7"/><path d="m13 225 16 13 28-3 18-22-5-4-17 19-24 4z" fill="#274238"/><path d="m36 206 17 10m-22-5 16 10" stroke="#B6BEB1" stroke-width="2"/>
      <path d="m219 192 31-7 10 31-32 8z" fill="#F4F2E8"/><path d="m222 200 31-7" stroke="#B65D40" stroke-width="3"/><path d="m224 206 31-7" stroke="#58715D" stroke-width="2"/>
      <path d="m227 220 33-10 19 19 30 7 3 14-46 4-38-10z" fill="#F9F7EB"/><path d="m228 238 39 10 44-4 1 9-47 5-36-10z" fill="#2E4438"/><path d="m251 223 13 11m-7-14 14 12" stroke="#A8B4A6" stroke-width="2"/>
    </svg>`;
  }

  UIFX.register({
    id: 'interaction-scenes-composer', title: 'Scenes · 组合镜头输入', category: 'interaction', duration: 11,
    description: '参考 Stephen 的静态 Scenes composer 重建三张素材、输入区与模式工具栏；照片替换为原创 SVG，窗口入场、切换 Video、逐字输入和发送按钮悬停均为原创演示。停在待发送，不呈现视频生成结果。',
    tags: ['Scenes', 'Chat Layout', 'Modal', 'AI Flow', '静态界面参考', '原创 SVG'],
    source: 'https://x.com/srotimi_ui/status/2004865468323299492', sourceStatus: 'observed-reconstruction', sourceObservation: 'static-image',
    params: { title: 'Scenes', prompt: promptDefault }
  }, (ctx, params) => {
    const p = Object.assign({ title: 'Scenes', prompt: promptDefault }, params || {});
    ctx.root.innerHTML = `<style>
      .scn-scene{font-family:ProjectSans,sans-serif;background:#F2F2F1;color:#222326}
      .scn-scene *{box-sizing:border-box}.scn-scene svg{display:block;flex-shrink:0}
      .scn-scene .scn-window{position:absolute;left:460px;top:150px;width:1000px;height:770px;border:1px solid #E6E6E5;border-radius:32px;background:linear-gradient(180deg,#FFF 0%,#FFF 75%,#FEFEFD 100%);box-shadow:0 28px 75px #26251F0B,0 7px 20px #26251F05,inset 0 1px 0 #FFFFFF;overflow:hidden}
      .scn-scene .scn-close{position:absolute;left:32px;top:29px;width:57px;height:57px;display:flex;align-items:center;justify-content:center;border:1px solid #ECECEC;border-radius:16px;color:#65676B;background:#F8F8F7}
      .scn-scene .scn-title{position:absolute;right:38px;top:34px;font-size:30px;line-height:1.5;font-weight:580;letter-spacing:-1px;color:#222326;max-width:670px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .scn-scene .scn-thumbnails{position:absolute;left:52px;top:133px;display:flex;gap:18px}
      .scn-scene .scn-thumbnail{width:154px;height:154px;overflow:hidden;border-radius:18px;box-shadow:0 2px 6px #141F0A0D;position:relative;background:#728568}
      .scn-scene .scn-thumbnail::after{content:'';position:absolute;inset:0;border:1px solid #14201312;border-radius:18px;pointer-events:none}
      .scn-scene .scn-thumbnail>svg{width:154px;height:154px}
      .scn-scene .scn-input{position:absolute;left:52px;right:52px;top:328px;font-size:32px;line-height:1.53;letter-spacing:-.65px;color:#2D2F34;font-weight:420;overflow-wrap:anywhere}
      .scn-scene .scn-caret{display:inline-block;width:3px;height:35px;margin-left:3px;border-radius:1px;background:#4C8FFC;vertical-align:-6px}
      .scn-scene .scn-toolbar{position:absolute;left:52px;right:52px;bottom:36px;height:92px;padding:12px;display:grid;grid-template-columns:68px 68px 1fr 340px 1fr 48px 68px;gap:12px;align-items:center;border:1px solid #ECECEB;border-radius:27px;background:#F5F5F4;box-shadow:inset 0 1px 1px #FFFFFF}
      .scn-scene .scn-tool{width:68px;height:68px;display:flex;align-items:center;justify-content:center;background:#FFFFFF;border:1px solid #ECECEB;border-radius:19px;color:#686A70;box-shadow:0 1px 2px #25252504}
      .scn-scene .scn-connect{color:#7B7D81}
      .scn-scene .scn-modes{position:relative;display:flex;width:340px;height:68px;padding:4px;align-items:center;border-radius:20px;background:#F0F0EF;color:#83858A}
      .scn-scene .scn-mode-selection{position:absolute;left:4px;top:4px;width:166px;height:60px;border-radius:16px;border:1px solid #DFDFDE;background:#E8E8E7;box-shadow:inset 0 1px 0 #FFFFFF77}
      .scn-scene .scn-mode{position:relative;display:flex;align-items:center;justify-content:center;gap:10px;width:166px;height:60px;font-size:26px;font-weight:450;letter-spacing:-.35px;z-index:1}
      .scn-scene .scn-image{color:#28292D}.scn-scene .scn-video{color:#A2A3A6}
      .scn-scene .scn-mic{display:flex;align-items:center;justify-content:center;width:48px;height:68px;color:#7C7F84}
      .scn-scene .scn-send{width:68px;height:68px;display:flex;align-items:center;justify-content:center;border:1px solid #3E3F41;border-radius:19px;background:#444547;color:#F7F7F7;box-shadow:0 1px 3px #0000000A;transform-origin:center center}
      .scn-scene .scn-cursor{position:absolute;left:0;top:0;z-index:20;width:38px;height:46px;transform-origin:5px 5px;pointer-events:none}
      .scn-scene .scn-click-ring{position:absolute;left:0;top:0;z-index:19;width:52px;height:52px;border:2px solid #759BD0;border-radius:50%;pointer-events:none}
      .scn-scene .fx-proof{position:absolute;right:78px;bottom:28px;font-size:17px;color:#85878B}
    </style><div class="fx-scene scn-scene"><div class="scn-window">
      <div class="scn-close">${icon('close', 27)}</div><div class="scn-title">${ctx.esc(String(p.title))}</div>
      <div class="scn-thumbnails"><div class="scn-thumbnail">${firstThumbnail()}</div><div class="scn-thumbnail">${secondThumbnail()}</div><div class="scn-thumbnail">${thirdThumbnail()}</div></div>
      <div class="scn-input"><span class="scn-typed"></span><span class="scn-caret"></span></div>
      <div class="scn-toolbar"><div class="scn-tool">${icon('plus', 31)}</div><div class="scn-tool scn-connect">${icon('connect', 29)}</div><span></span><div class="scn-modes"><div class="scn-mode-selection"></div><div class="scn-mode scn-image">${icon('image', 26)}<span>Image</span></div><div class="scn-mode scn-video">${icon('video', 27)}<span>Video</span></div></div><span></span><div class="scn-mic">${icon('mic', 27)}</div><div class="scn-send">${icon('send', 31)}</div></div>
    </div><div class="scn-cursor">${ctx.cursor()}</div><div class="scn-click-ring"></div><div class="fx-proof">静态界面参考 · 原创 SVG 素材与动作 · 待发送</div></div>`;

    const q = ctx.q, thumbs = ctx.qa('.scn-thumbnail');
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.set(q('.scn-window'), { x: 0, y: 38, scale: .93, rotationX: 7, rotationY: -2, transformPerspective: 1300, transformOrigin: '50% 55%', opacity: .55 }, 0)
      .set(thumbs, { x: 0, y: 16, scale: .97, opacity: 0 }, 0)
      .set(q('.scn-mode-selection'), { x: 0, y: 0 }, 0)
      .set(q('.scn-image'), { color: '#28292D' }, 0)
      .set(q('.scn-video'), { color: '#A2A3A6' }, 0)
      .set(q('.scn-cursor'), { x: 892, y: 975, scale: 1, opacity: 0 }, 0)
      .set(q('.scn-click-ring'), { x: 0, y: 0, scale: 1, opacity: 0 }, 0)
      .set(q('.scn-send'), { x: 0, y: 0, scale: 1, backgroundColor: '#444547', boxShadow: '0 1px 3px #0000000A' }, 0)
      .set(q('.scn-caret'), { opacity: 0 }, 0)
      .to(q('.scn-window'), { y: 0, scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: .9, ease: 'expo.out' }, 0);
    thumbs.forEach((thumb, i) => tl.to(thumb, { y: 0, scale: 1, opacity: 1, duration: .55, ease: 'power3.out' }, .18 + i * .09));

    tl.to(q('.scn-cursor'), { x: 1055, y: 838, opacity: 1, duration: .6, ease: 'power2.inOut' }, 1.1);
    ctx.click(tl, q('.scn-cursor'), q('.scn-click-ring'), 1055, 838, 1.82);
    tl.to(q('.scn-mode-selection'), { x: 166, duration: .32 }, 1.82)
      .to(q('.scn-image'), { color: '#A2A3A6', duration: .22 }, 1.82)
      .to(q('.scn-video'), { color: '#202126', duration: .22 }, 1.82)
      .to(q('.scn-cursor'), { x: 566, y: 493, duration: .5, ease: 'power2.inOut' }, 2.48);
    ctx.click(tl, q('.scn-cursor'), q('.scn-click-ring'), 566, 493, 3.05);
    tl.set(q('.scn-caret'), { opacity: 1 }, 3.05);
    ctx.text(tl, q('.scn-typed'), p.prompt, 3.22, 3.85);
    tl.to(q('.scn-cursor'), { x: 1362, y: 838, duration: .8, ease: 'power2.inOut' }, 7.6)
      .to(q('.scn-send'), { scale: 1.035, backgroundColor: '#303134', boxShadow: '0 5px 12px #20212618', duration: .25 }, 8.4);
    for (let i = 0; i < 10; i++) tl.set(q('.scn-caret'), { opacity: i % 2 ? 1 : 0 }, 7.32 + i * .36);
    tl.to({ hold: 0 }, { hold: 1, duration: .01 }, 10.99);
    return { timeline: tl, duration: 11 };
  });
})();
