/* Tuki's static logistics workbench, reconstructed as editable UI.
   Selection, route illumination and the moving route marker are original motion. */
(function () {
  'use strict';
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    down: '<path d="m7 10 5 5 5-5"/>',
    right: '<path d="M4 12h16m-5-5 5 5-5 5"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    clock: '<circle cx="12" cy="12" r="8"/><path d="M12 7v5l4 2"/>',
    chart: '<path d="M4 3v17h17M8 15v-4m5 4V6m5 9V9"/>',
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    bell: '<path d="M5 17h14l-2-4V9a5 5 0 0 0-10 0v4zM10 21h4"/>',
    undo: '<path d="M8 6 3 11l5 5M3 11h12a5 5 0 0 1 0 10"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    import: '<path d="M12 3v12m-4-4 4 4 4-4M4 15v6h16v-6"/>',
    export: '<path d="M12 15V3m-4 4 4-4 4 4M4 15v6h16v-6"/>',
    settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="#101213"/><circle cx="16" cy="17" r="3" fill="#101213"/>'
  };
  const icon = (name, size = 23) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  const plus = (left, top, muted = false) => `<span class="lg-node-add${muted ? ' lg-group-add' : ''}" style="left:${left}px;top:${top}px">${icon('plus', muted ? 21 : 20)}</span>`;
  const rate = (x, y, text, extra = '') => `<g class="lg-rate ${extra}" transform="translate(${x} ${y})"><rect x="-47" y="-23" width="94" height="31" rx="4" fill="#0A0C0D"/><text text-anchor="middle">${text}</text></g>`;
  const node = (cls, left, top, title, subtitle = '120 u/hr', wide = false) => `<div class="lg-node ${cls}${wide ? ' lg-depot' : ''}" style="left:${left}px;top:${top}px"><div class="lg-node-title">${title}</div><div class="lg-node-rate">${subtitle}</div></div>`;
  function dotLogo() {
    let dots = '';
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 9; col++) {
        if (Math.abs(col - 4) <= row && (row !== 4 || col % 2 === 0)) dots += `<circle cx="${5 + col * 5}" cy="${7 + row * 5}" r="1.3"/>`;
      }
    }
    return `<svg width="52" height="39" viewBox="0 0 50 36" fill="currentColor" aria-hidden="true">${dots}</svg>`;
  }
  function sourceDots() {
    let dots = '';
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const lit = col === row || col + row === 8 || (row >= 3 && row <= 5 && col >= 3 && col <= 5);
        dots += `<rect x="${12 + col * 7.7}" y="${12 + row * 7.7}" width="2.4" height="2.4" rx=".45" fill="${lit ? '#D27742' : '#594033'}"/>`;
      }
    }
    return `<svg width="90" height="90" viewBox="0 0 90 90" aria-hidden="true">${dots}</svg>`;
  }

  UIFX.register({
    id: 'software-logistics-route-map', title: '物流路径 · 选择与流量定位', category: 'software', duration: 14,
    description: '参考 Tuki 的黑橙工业物流静态界面重建：同一工作台入场，点击 Main Hub 后查看现有路径，沿线光点与相邻 85 u/hr 指标强调均为原创演示。保留全部节点与原数值，不执行导入导出或创建节点。',
    tags: ['AI Flow', 'logistics', 'Main Hub', '路径查看', '静态界面参考'],
    source: 'https://x.com/TukiFromKL/status/1989691748004573519', sourceStatus: 'observed-reconstruction', sourceObservation: 'static-image',
    params: { title: 'Reporting window', result: '85 u/hr' }
  }, (ctx, params) => {
    const p = Object.assign({ title: 'Reporting window', result: '85 u/hr' }, params || {});
    const mainRoute = 'M905 340C979 340 1056 340 1130 340';
    const dates = ['24', '25', '26', '27', '28', '29', '30'].map(day => `<span class="lg-date${day === '29' ? ' lg-date-selected' : ''}">Jun ${day}</span>`).join('');
    ctx.root.innerHTML = `<style>
      .lg-scene{font-family:ProjectSans,sans-serif;background:#767976;color:#CDCBC8}
      .lg-scene *{box-sizing:border-box}.lg-scene svg{display:block;flex-shrink:0}
      .lg-scene .lg-workbench{position:absolute;left:70px;top:65px;width:1780px;height:940px;overflow:hidden;border:1px solid #373B3B;border-radius:15px;background:#101213;box-shadow:0 23px 65px #15191839}
      .lg-scene .lg-header{position:absolute;left:25px;right:25px;top:15px;height:65px;display:flex;align-items:center;gap:18px}
      .lg-scene .lg-logo{color:#CED1CE;margin-right:8px}
      .lg-scene .lg-report{width:216px;display:flex;flex-direction:column;justify-content:center;gap:2px;flex-shrink:0}
      .lg-scene .lg-report-label{font-size:16px;line-height:1.4;color:#8B9190;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .lg-scene .lg-report-range{font-size:23px;line-height:1.4;display:flex;align-items:center;gap:14px;color:#D2D3CE}
      .lg-scene .lg-range{font-size:19px;color:#BABDB8;white-space:nowrap;margin-right:2px}
      .lg-scene .lg-zoom{display:flex;border:1px solid #2D3232;border-radius:5px;overflow:hidden;flex-shrink:0}
      .lg-scene .lg-zoom>span{width:33px;height:36px;display:flex;align-items:center;justify-content:center;color:#888F8C}.lg-scene .lg-zoom>span+span{border-left:1px solid #2D3232}
      .lg-scene .lg-dates{display:flex;align-items:center;padding:4px;border:1px solid #252A29;border-radius:6px;background:#0C0E0F;margin-left:8px}
      .lg-scene .lg-date{display:flex;align-items:center;justify-content:center;white-space:nowrap;width:68px;height:36px;font-size:17px;color:#919792;border-radius:3px}
      .lg-scene .lg-date-selected{background:#402D21;color:#E7A577;box-shadow:inset 0 0 0 1px #5B3A27}
      .lg-scene .lg-search{height:41px;display:flex;align-items:center;gap:10px;width:179px;margin-left:auto;color:#808887;font-size:18px;border-bottom:1px solid #2A3030}
      .lg-scene .lg-bell{color:#A2AAA6;width:35px;height:40px;display:flex;align-items:center;justify-content:center}
      .lg-scene .lg-avatar{width:38px;height:38px;overflow:hidden;border-radius:50%;border:1px solid #5D8CA9;background:#287090}
      .lg-scene .lg-filterbar{position:absolute;left:30px;right:30px;top:93px;height:44px;display:flex;align-items:center;gap:13px;font-size:17px;color:#AAB0AC;white-space:nowrap}
      .lg-scene .lg-breakdown{color:#727B77;font-size:16px;margin-right:1px}
      .lg-scene .lg-breakdown-value{height:36px;display:flex;align-items:center;gap:12px;color:#BCBFBA;padding:0 12px;border:1px solid #272D2B;border-radius:4px;background:#131615;font-size:18px}
      .lg-scene .lg-filter-caption{color:#737D76;margin-left:27px;font-size:16px}
      .lg-scene .lg-filter-chip{display:flex;align-items:center;gap:8px;height:33px;padding:0 10px;background:#181D19;border:1px solid #30392E;border-radius:4px;color:#AAB59F;font-size:16px}
      .lg-scene .lg-filter-chip b{font-weight:500;color:#D2D9C5}
      .lg-scene .lg-undo{color:#717A76;display:flex;margin-left:6px}
      .lg-scene .lg-clear{display:flex;align-items:center;gap:6px;color:#87908A;font-size:16px}
      .lg-scene .lg-actions{display:flex;align-items:center;gap:23px;margin-left:auto}
      .lg-scene .lg-action{display:flex;align-items:center;gap:8px;color:#AAB1AD;font-size:17px}
      .lg-scene .lg-canvas{position:absolute;left:22px;top:158px;width:1736px;height:756px;overflow:hidden;border:1px solid #29302E;border-radius:6px;background-color:#090B0C;background-image:radial-gradient(circle,#31392E77 .7px,transparent .9px);background-size:13px 13px}
      .lg-scene .lg-view-tools{position:absolute;left:21px;top:28px;display:flex;flex-direction:column;gap:14px;z-index:8}
      .lg-scene .lg-view-tools>span{width:46px;height:46px;display:flex;align-items:center;justify-content:center;background:#0E1211;border:1px solid #29332D;border-radius:6px;color:#69776D}
      .lg-scene .lg-view-tools .lg-view-active{color:#D57A48;border-color:#5D3925;background:#241811}
      .lg-scene .lg-map{position:absolute;left:100px;top:0;width:1636px;height:756px}
      .lg-scene .lg-wires,.lg-scene .lg-ports{position:absolute;left:0;top:0;width:1636px;height:756px;pointer-events:none}
      .lg-scene .lg-wires{z-index:1}.lg-scene .lg-ports{z-index:4}
      .lg-scene .lg-wire{fill:none;stroke:#8F4A29;stroke-width:1.45;stroke-linecap:round;stroke-linejoin:round}
      .lg-scene .lg-wire-muted{stroke:#663D2A}.lg-scene .lg-wire-red{stroke:#A24533}
      .lg-scene .lg-main-route{stroke:#A95E35;stroke-width:1.65}
      .lg-scene .lg-route-marker{fill:none;stroke:#FFD4A1;stroke-width:4;stroke-linecap:round;stroke-dasharray:3 222;stroke-dashoffset:3}
      .lg-scene .lg-rate text{font-family:ProjectSans,sans-serif;font-size:20px;font-weight:400;fill:#BCA18C}
      .lg-scene .lg-rate-red text{fill:#C4826B}
      .lg-scene .lg-group{position:absolute;top:258px;width:330px;height:396px;border:1px solid #553521;border-radius:8px;background:#22180FA6;z-index:0;box-shadow:inset 0 1px 0 #67452B13}
      .lg-scene .lg-main-group{left:615px}.lg-scene .lg-retail-group{left:1090px}
      .lg-scene .lg-group-footer{position:absolute;left:0;right:0;bottom:0;height:42px;display:flex;align-items:center;justify-content:center;background:#352114;border-top:1px solid #57351F;border-radius:0 0 7px 7px;font-size:23px;color:#D1A989;letter-spacing:.1px}
      .lg-scene .lg-node{position:absolute;width:250px;height:96px;padding:15px 18px;border:1px solid #674024;border-radius:6px;background:#151311;box-shadow:0 5px 12px #00000019;z-index:2}
      .lg-scene .lg-depot{width:270px;height:92px;background:#21180F}
      .lg-scene .lg-node-title{font-size:24px;line-height:1.45;color:#D6C6B8;letter-spacing:-.5px;white-space:nowrap}
      .lg-scene .lg-node-rate{font-size:20px;line-height:1.5;color:#9D958B;margin-top:2px}
      .lg-scene .lg-origin{position:absolute;left:235px;top:91px;width:220px;height:72px;padding:17px 18px;border:1px solid #5D3821;border-radius:6px;background:#26190F;font-size:25px;line-height:1.4;color:#D6BDAB;z-index:2}
      .lg-scene .lg-source{position:absolute;left:35px;top:305px;width:90px;height:90px;border:1px solid #5C3E2B;border-radius:7px;background:#241B13;z-index:2}
      .lg-scene .lg-node-add{position:absolute;width:30px;height:30px;display:flex;align-items:center;justify-content:center;background:#DE6A2B;border:1px solid #F38A42;border-radius:4px;color:#24190E;z-index:5;box-shadow:0 2px 6px #0002}
      .lg-scene .lg-group-add{width:36px;height:36px;background:#21190F;border:1px solid #5B3A23;color:#B67749;border-radius:5px}
      .lg-scene .lg-primary-rate text{fill:#D6B397;font-size:21px}.lg-scene .lg-primary-rate rect{fill:#16120F;stroke:#4C3425;stroke-width:1}
      .lg-scene .lg-cursor{position:absolute;left:0;top:0;width:38px;height:46px;z-index:20;pointer-events:none;transform-origin:5px 5px}
      .lg-scene .lg-cursor .fx-cursor path{fill:#EBEEE8;stroke:#181C17;stroke-width:2.5}
      .lg-scene .lg-click-ring{position:absolute;left:0;top:0;width:52px;height:52px;border:2px solid #DE8B4F;border-radius:50%;z-index:19;pointer-events:none}
      .lg-scene .fx-proof{position:absolute;right:74px;bottom:22px;color:#E2E3DF;font-size:17px}
    </style><div class="fx-scene lg-scene"><div class="lg-workbench">
      <div class="lg-header"><div class="lg-logo">${dotLogo()}</div><div class="lg-report"><div class="lg-report-label">${ctx.esc(String(p.title))}</div><div class="lg-report-range">Past week ${icon('down', 17)}</div></div><div class="lg-range">Jun 24 – Jun 30</div><div class="lg-zoom"><span>${icon('plus', 18)}</span><span>${icon('minus', 18)}</span></div><div class="lg-dates">${dates}</div><div class="lg-search">${icon('search', 20)}<span>Search...</span></div><span class="lg-bell">${icon('bell', 23)}</span><span class="lg-avatar"><svg width="38" height="38" viewBox="0 0 38 38" aria-label="原创几何头像"><rect width="38" height="38" fill="#246386"/><path d="M0 32 14 10l8 16 16-14v26H0z" fill="#75BDD1"/><circle cx="26" cy="10" r="5" fill="#BAE5E7"/></svg></span></div>
      <div class="lg-filterbar"><span class="lg-breakdown">Breakdown</span><span class="lg-breakdown-value">Region ${icon('right', 18)} Fulfillm... ${icon('down', 16)}</span><span class="lg-filter-caption">Filters</span><span class="lg-filter-chip">Region in <b>3</b></span><span class="lg-filter-chip">Hub in <b>2</b></span><span class="lg-filter-chip">Depot in <b>1</b></span><span class="lg-undo">${icon('undo', 18)}</span><span class="lg-clear">${icon('close', 15)}Clear</span><div class="lg-actions"><span class="lg-action">${icon('import', 18)}Import</span><span class="lg-action">${icon('export', 18)}Export</span><span class="lg-action">${icon('settings', 18)}Manage</span></div></div>
      <div class="lg-canvas"><div class="lg-view-tools"><span class="lg-view-active">${icon('grid', 23)}</span><span>${icon('filter', 23)}</span><span>${icon('clock', 23)}</span><span>${icon('chart', 23)}</span></div><div class="lg-map">
        <div class="lg-group lg-main-group"><div class="lg-group-footer">Main Hub</div></div><div class="lg-group lg-retail-group"><div class="lg-group-footer">Retail Node</div></div>
        <svg class="lg-wires" viewBox="0 0 1636 756" aria-hidden="true">
          <path class="lg-wire lg-wire-muted" d="M455 127C515 127 505 245 505 336"/>
          <path class="lg-wire" d="M125 350C176 350 174 336 235 336"/>
          <path class="lg-wire" d="M505 336C563 336 590 340 655 340"/>
          <path class="lg-wire lg-wire-red" d="M505 336C586 336 572 537 655 537"/>
          <path class="lg-wire" d="M370 382C370 446 370 490 370 550"/>
          <path class="lg-wire lg-wire-muted" d="M505 596C563 596 590 537 655 537"/>
          <path class="lg-wire" d="M505 336C535 176 1115 177 1130 340"/>
          <path class="lg-wire lg-main-route" d="${mainRoute}"/>
          <path class="lg-wire" d="M905 537C980 537 1052 537 1130 537"/>
          <path class="lg-wire" d="M1380 340C1468 340 1500 358 1668 358"/>
          <path class="lg-wire" d="M1380 537C1468 537 1500 515 1668 515"/>
          <path class="lg-route-marker" d="${mainRoute}"/>
          ${rate(526, 204, '0 u/hr')}${rate(575, 316, '86 u/hr')}${rate(589, 447, '67 u/hr', 'lg-rate-red')}${rate(408, 481, '130 u/hr')}${rate(824, 203, '85 u/hr')}${rate(1017, 316, ctx.esc(String(p.result)), 'lg-primary-rate')}${rate(1017, 510, '150 u/hr')}
        </svg>
        <div class="lg-origin">Origin</div><div class="lg-source">${sourceDots()}</div>
        ${node('lg-upper-depot', 235, 290, 'fc-eu-west...', '120 u/hr', true)}${node('lg-lower-depot', 235, 550, 'fc-eu-west...', '120 u/hr', true)}
        ${node('lg-zone-one', 655, 292, 'Zone-1 / Zone-1')}${node('lg-zone-two', 655, 489, 'Zone-1 / Zone-2')}
        ${node('lg-shop-one', 1130, 292, 'Shop-A')}${node('lg-shop-two', 1130, 489, 'Shop-B')}
        ${plus(190, 109)}${plus(190, 309)}${plus(190, 569)}${plus(635, 277)}${plus(635, 474)}${plus(1110, 277)}${plus(1110, 474)}${plus(762, 211, true)}${plus(1237, 211, true)}
        <svg class="lg-ports" viewBox="0 0 1636 756" aria-hidden="true"><g fill="#D67A3B" stroke="#351E10" stroke-width="1">${[[455,127],[125,350],[235,336],[505,336],[370,382],[370,550],[505,596],[655,340],[655,537],[905,340],[905,537],[1130,340],[1130,537],[1380,340],[1380,537]].map(([x,y]) => `<circle cx="${x}" cy="${y}" r="4"/>`).join('')}</g></svg>
      </div></div>
    </div><div class="lg-cursor">${ctx.cursor()}</div><div class="lg-click-ring"></div><div class="fx-proof">静态界面参考 · 选择与路径提示为原创演示 · 数值保持不变</div></div>`;

    const q = ctx.q;
    const tl = ctx.gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
    tl.set(q('.lg-workbench'), { x: 0, y: 33, scale: .958, rotationX: 5, rotationY: -1.4, transformPerspective: 1500, transformOrigin: '50% 53%', opacity: .65 }, 0)
      .set(q('.lg-cursor'), { x: 825, y: 954, scale: 1, opacity: 0 }, 0)
      .set(q('.lg-click-ring'), { x: 0, y: 0, scale: 1, opacity: 0 }, 0)
      .set(q('.lg-main-group'), { borderColor: '#553521', boxShadow: 'inset 0 1px 0 #67452B13' }, 0)
      .set(q('.lg-main-route'), { stroke: '#A95E35', strokeWidth: 1.65 }, 0)
      .set(q('.lg-route-marker'), { opacity: 0, strokeDashoffset: 3, autoRound: false }, 0)
      .set(q('.lg-primary-rate rect'), { fill: '#16120F', stroke: '#4C3425', strokeWidth: 1 }, 0)
      .set(q('.lg-primary-rate text'), { fill: '#D6B397' }, 0)
      .to(q('.lg-workbench'), { y: 0, scale: 1, rotationX: 0, rotationY: 0, opacity: 1, duration: .95, ease: 'expo.out' }, 0)
      .to(q('.lg-cursor'), { x: 972, y: 856, opacity: 1, duration: .65, ease: 'power2.inOut' }, 2.0);
    ctx.click(tl, q('.lg-cursor'), q('.lg-click-ring'), 972, 856, 2.85);
    tl.to(q('.lg-main-group'), { borderColor: '#B96C37', boxShadow: 'inset 0 0 0 1px #9C572D20', duration: .3 }, 2.85)
      .to(q('.lg-main-route'), { stroke: '#ED995A', strokeWidth: 2.1, duration: .4 }, 3.2)
      .set(q('.lg-route-marker'), { opacity: .9, strokeDashoffset: 3 }, 3.65)
      .to(q('.lg-route-marker'), { strokeDashoffset: -222, duration: 1.45, repeat: 2, ease: 'none', autoRound: false }, 3.65)
      .to(q('.lg-cursor'), { x: 1209, y: 535, duration: .6, ease: 'power2.inOut' }, 4.55)
      .to(q('.lg-primary-rate rect'), { fill: '#362318', stroke: '#B27A4A', duration: .3 }, 5.15)
      .to(q('.lg-primary-rate text'), { fill: '#FFE0BD', duration: .3 }, 5.15)
      .to(q('.lg-primary-rate rect'), { fill: '#201910', stroke: '#805334', duration: .6 }, 5.75)
      .to(q('.lg-primary-rate text'), { fill: '#E4C2A2', duration: .6 }, 5.75)
      .to(q('.lg-route-marker'), { opacity: 0, duration: .25 }, 8.0)
      .to(q('.lg-cursor'), { x: 1266, y: 575, opacity: 0, duration: .45 }, 8.25)
      .to({ hold: 0 }, { hold: 1, duration: .01 }, 13.99);
    return { timeline: tl, duration: 14 };
  });
})();
