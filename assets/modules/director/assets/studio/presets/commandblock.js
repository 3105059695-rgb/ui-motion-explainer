/* Static command graph study. All interactions and the single light packet are original. */
(function () {
  'use strict';

  const defaultPrompt = 'When everyone leaves kitchen, turn off\nall light and switch off kitchen items\nbesides fridge';
  const fiber = 'M960 642 C1216 642 1284 873 1521 872 C1607 871 1665 861 1730 861';
  const diamond = '<svg viewBox="0 0 32 32" class="cbl-diamond" aria-hidden="true"><path d="M16 2c2.3 8.2 5.8 11.7 14 14-8.2 2.3-11.7 5.8-14 14C13.7 21.8 10.2 18.3 2 16 10.2 13.7 13.7 10.2 16 2Z" fill="currentColor"/><path d="m16 9 7 7-7 7-7-7z" fill="#141414"/></svg>';
  const plus = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';

  function cells(value) {
    return Array.from(value).reduce((count, character) => count + (/^[\u0000-\u00ff]$/.test(character) ? 1 : 1.7), 0);
  }

  function wrap(value, limit) {
    const lines = [];
    value.split(/\r?\n/).forEach(paragraph => {
      let line = '';
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      words.forEach(word => {
        if (cells((line ? line + ' ' : '') + word) <= limit) {
          line += (line ? ' ' : '') + word;
          return;
        }
        if (line) { lines.push(line); line = ''; }
        Array.from(word).forEach(character => {
          if (cells(line + character) > limit && line) { lines.push(line); line = ''; }
          line += character;
        });
      });
      if (line || !words.length) lines.push(line);
    });
    return lines;
  }

  function promptLayout(value) {
    const text = String(value || defaultPrompt).trim();
    for (let font = 30; font >= 18; font -= 1) {
      const lines = wrap(text, Math.floor(718 / (font * .6)));
      const lineHeight = font * 1.9;
      if (lines.length * lineHeight <= 188) return {font, lineHeight, lines};
    }
    throw new Error('Command Block prompt is too long for the source layout. Use a shorter instruction.');
  }

  function markedLine(value, escapeHTML) {
    return value.split(/(\bWhen\b|\bfridge\b)/).map(part => part === 'When'
      ? '<span class="cbl-keyword">When</span>'
      : part === 'fridge' ? '<span class="cbl-value">fridge</span>' : escapeHTML(part)).join('');
  }

  UIFX.register({
    id: 'ai-command-block-link',
    title: 'Command Block · 柔性光纤连接',
    category: 'ai',
    duration: 12,
    source: 'https://x.com/aydaoz/status/1987158458567717093',
    referenceMedia: 'https://cdn.collectui.com/media/G5POFXpXoAABC3T.avif',
    sourceStatus: 'observed-reconstruction',
    sourceObservation: 'static-image',
    sourcePublisher: 'Ayda Oz',
    description: '依据静态图重建黑色 Command Block、绿黄等宽指令和已有柔性光纤。原创光标定位 between 与 9 PM，时间范围轻亮确认，一束光沿同一曲线传播后恢复稳定；不改时间值或展示设备执行结果。',
    adaptationNotes: 'Ayda Oz 为该链接发布者，不据转发文案推定原设计署名。右侧卡片仅呈现已观察到的文字片段并保留裁切；点击、局部确认与光流时序为原创。JetBrains Mono 为随包 OFL 字体。',
    tags: ['Collect UI', 'AI Flow', 'Command Block', '等宽指令', '柔性光纤', '静态参考'],
    params: {title:'COMMAND BLOCK', prompt:defaultPrompt}
  }, function (ctx, params) {
    const p = Object.assign({title:'COMMAND BLOCK', prompt:defaultPrompt}, params || {});
    const e = ctx.esc;
    const content = promptLayout(p.prompt);
    const headingSize = Math.max(18, Math.min(27, 620 / Math.max(1, cells(String(p.title)) * .6)));

    ctx.root.innerHTML = `<style>
      @font-face{font-family:CommandBlockMono;src:url('fonts/JetBrainsMono.ttf') format('truetype');font-weight:100 800;font-style:normal;font-display:block}
      .cbl-scene{position:relative;width:1920px;height:1080px;overflow:hidden;background:#040405;color:#d9d9dc;font-family:CommandBlockMono,ProjectSans,monospace;font-weight:400;font-variant-ligatures:none}
      .cbl-scene *{box-sizing:border-box}
      .cbl-scene .cbl-dots{position:absolute;inset:0;background-image:radial-gradient(circle,#92929836 .7px,transparent .8px);background-size:36px 36px;background-position:13px 15px;opacity:.63}
      .cbl-scene .cbl-svg{position:absolute;inset:0;width:1920px;height:1080px;display:block;overflow:hidden;pointer-events:none}
      .cbl-scene .cbl-block{position:absolute;left:120px;top:150px;width:820px;height:742px;border-radius:54px;border:1px solid #232325;background:radial-gradient(ellipse at 15% 5%,#19191a 0%,#151516 48%,#121213 100%);box-shadow:inset 0 1px 0 #ffffff05}
      .cbl-scene .cbl-header{position:absolute;left:132px;top:72px;height:44px;display:flex;align-items:center;gap:20px;color:#eeeeef}
      .cbl-scene .cbl-diamond{display:block;flex:none;width:30px;height:30px;color:inherit}
      .cbl-scene .cbl-title{font-size:${headingSize}px;line-height:42px;letter-spacing:2.2px;font-weight:400;max-width:655px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .cbl-scene .cbl-info{position:absolute;left:890px;top:82px;width:22px;height:22px;border:1px solid #65656b;border-radius:50%;color:#9f9fa6;font-size:14px;line-height:20px;text-align:center}
      .cbl-scene .cbl-copy{position:absolute;left:169px;top:201px;width:718px;height:188px;font-size:${content.font}px;line-height:${content.lineHeight}px;letter-spacing:-.3px;font-weight:400}
      .cbl-scene .cbl-copy-line{white-space:pre;max-width:718px}
      .cbl-scene .cbl-keyword{color:#58cd96;font-weight:450}
      .cbl-scene .cbl-value{color:#e5bd74;border-bottom:2px dotted #bca16b;padding-bottom:5px}
      .cbl-scene .cbl-divider{position:absolute;left:121px;top:432px;width:818px;height:1px;background:linear-gradient(90deg,#37373900,#3c3c3e 13%,#3c3c3e 87%,#37373900)}
      .cbl-scene .cbl-divider-plus{position:absolute;left:513px;top:417px;width:32px;height:32px;color:#e8e8eb;background:#151516;display:grid;place-items:center;border-radius:50%}
      .cbl-scene .cbl-divider-plus svg{width:23px;height:23px}
      .cbl-scene .cbl-condition{position:absolute;left:169px;top:487px;width:718px;height:61px;font-size:30px;line-height:60px;letter-spacing:-.3px;white-space:nowrap}
      .cbl-scene .cbl-time-range{position:absolute;left:169px;top:579px;width:718px;height:129px;border:1px solid #3b3b3e;border-radius:25px;background:linear-gradient(115deg,#1e1e20,#1a1a1c 60%,#1b1b1d);box-shadow:inset 0 1px 0 #ffffff04}
      .cbl-scene .cbl-time{position:absolute;top:29px;color:#eeeef0;font-size:45px;line-height:66px;letter-spacing:-1.5px;white-space:nowrap}
      .cbl-scene .cbl-time-start{left:39px}
      .cbl-scene .cbl-time-end{left:325px}
      .cbl-scene .cbl-time-divider{position:absolute;left:265px;top:23px;width:1px;height:81px;background:#4d4d50}
      .cbl-scene .cbl-timezone{position:absolute;left:563px;top:50px;display:flex;align-items:center;gap:11px;font-size:20px;line-height:28px;color:#929299;letter-spacing:-.6px;white-space:nowrap}
      .cbl-scene .cbl-timezone .cbl-diamond{width:19px;height:19px;color:#b7b7bd}
      .cbl-scene .cbl-then{position:absolute;left:169px;top:748px;width:718px;height:66px;font-size:30px;line-height:64px;letter-spacing:-.4px;white-space:nowrap}
      .cbl-scene .cbl-footer-port{position:absolute;left:509px;top:870px;width:44px;height:44px;border:1px solid #49494c;border-radius:50%;background:#151516;color:#adadb5;display:grid;place-items:center;box-shadow:0 0 0 6px #050506}
      .cbl-scene .cbl-footer-port svg{width:21px;height:21px}
      .cbl-scene .cbl-follow-title{position:absolute;left:1796px;top:302px;width:124px;height:45px;overflow:hidden;white-space:nowrap;font-size:27px;line-height:44px;letter-spacing:2px;color:#cdccd2}
      .cbl-scene .cbl-follow-mark{position:absolute;left:1748px;top:310px;color:#ceced2}
      .cbl-scene .cbl-follow-copy{position:absolute;left:1798px;top:436px;width:122px;height:122px;overflow:hidden;font-size:30px;line-height:57px;white-space:nowrap;color:#cbcad1}
      .cbl-scene .cbl-follow-then{position:absolute;left:1798px;top:701px;width:122px;height:70px;overflow:hidden;font-size:30px;line-height:60px;white-space:nowrap;color:#cbcad1}
      .cbl-scene .cbl-follow-input{position:absolute;left:1798px;top:799px;width:122px;height:126px;border:1px solid #3b3b40;border-right:0;border-radius:23px 0 0 23px;background:#1c1c20;padding:25px 29px;color:#696970;font-size:29px;line-height:65px;overflow:hidden;white-space:nowrap}
      .cbl-scene .cbl-pointer{position:absolute;left:0;top:0;width:38px;height:46px;transform-origin:4px 3px;z-index:10;pointer-events:none}
      .cbl-scene .cbl-pointer .fx-cursor path{fill:#f0f0f3;stroke:#222225;stroke-width:2.4}
      .cbl-scene .cbl-ring{position:absolute;left:0;top:0;width:48px;height:48px;border:1.5px solid #e3c794;border-radius:50%;z-index:9;pointer-events:none}
      .cbl-scene .cbl-proof{position:absolute;left:121px;bottom:29px;color:#69696f;font-family:ProjectSans,sans-serif;font-size:17px;line-height:28px;letter-spacing:.1px}
    </style><div class="fx-scene cbl-scene">
      <div class="cbl-dots"></div>
      <div class="cbl-block"></div>
      <svg class="cbl-svg cbl-outline" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs><linearGradient id="cbl-outline-gradient" x1="100" y1="135" x2="962" y2="916" gradientUnits="userSpaceOnUse"><stop stop-color="#727278" stop-opacity=".65"/><stop offset=".25" stop-color="#3b3b40"/><stop offset=".63" stop-color="#3a3a3f"/><stop offset="1" stop-color="#808087" stop-opacity=".6"/></linearGradient></defs>
        <path d="M175 126H869C919 126 960 166 960 218V837C960 885 929 919 879 919H576C560 919 554 926 531 926S502 919 484 919H179C128 919 95 884 95 834V213C95 161 128 126 175 126Z" fill="none" stroke="url(#cbl-outline-gradient)" stroke-width="1.25"/>
        <path d="M89 184c-3-35 18-63 48-68M970 864c-4 35-25 58-57 65" fill="none" stroke="#646469" stroke-width="1.25" stroke-linecap="round"/>
        <path d="M110 195c0-20 10-37 26-48M944 852c-1 20-11 35-25 44" fill="none" stroke="#77777d" stroke-width=".9" opacity=".56"/>
        <path d="M1804 348H1920M1730 862V421C1730 378 1759 348 1804 348" fill="none" stroke="#484850" stroke-width="1.15"/>
        <rect x="1750" y="366" width="820" height="742" rx="54" fill="#151518" stroke="#25252a"/>
        <path d="M1751 647H1920" stroke="#3a3a40" stroke-width="1"/>
      </svg>
      <div class="cbl-header">${diamond}<div class="cbl-title">${e(p.title)}</div></div><div class="cbl-info">i</div>
      <div class="cbl-copy">${content.lines.map(line => '<div class="cbl-copy-line">' + markedLine(line, e) + '</div>').join('')}</div>
      <div class="cbl-divider"></div><div class="cbl-divider-plus">${plus}</div>
      <div class="cbl-condition"><span class="cbl-keyword">if</span> anyone enters back <span class="cbl-value cbl-between">between</span>;</div>
      <div class="cbl-time-range"><span class="cbl-time cbl-time-start">9 PM</span><i class="cbl-time-divider"></i><span class="cbl-time cbl-time-end">6 AM</span><span class="cbl-timezone">${diamond}<span>CET+3</span></span></div>
      <div class="cbl-then"><span class="cbl-keyword">Then</span> turn on kitchen <span class="cbl-value">Main-light-03</span></div>
      <div class="cbl-footer-port">${plus}</div>
      <span class="cbl-follow-mark">${diamond}</span><div class="cbl-follow-title">FOLLOW-</div>
      <div class="cbl-follow-copy"><div><span class="cbl-keyword">if</span> Sus</div><div>Turn o</div></div>
      <div class="cbl-follow-then"><span class="cbl-keyword">Then</span> s</div><div class="cbl-follow-input">Type</div>
      <svg class="cbl-svg cbl-fiber" viewBox="0 0 1920 1080" aria-hidden="true">
        <defs>
          <filter id="cbl-fiber-soft" x="900" y="570" width="910" height="390" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="5.5"/></filter>
          <filter id="cbl-fiber-fine" x="900" y="570" width="910" height="390" filterUnits="userSpaceOnUse"><feGaussianBlur stdDeviation="1.7"/></filter>
          <filter id="cbl-port-soft" x="-150%" y="-80%" width="400%" height="260%"><feGaussianBlur stdDeviation="8"/></filter>
          <filter id="cbl-port-fine" x="-100%" y="-60%" width="300%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter>
          <linearGradient id="cbl-left-funnel" x1="940" y1="642" x2="1025" y2="642" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".78"/><stop offset=".37" stop-color="#fafaff" stop-opacity=".18"/><stop offset="1" stop-color="#f5f4ff" stop-opacity="0"/></linearGradient>
          <linearGradient id="cbl-right-funnel" x1="1670" y1="861" x2="1750" y2="861" gradientUnits="userSpaceOnUse"><stop stop-color="#f5f4ff" stop-opacity="0"/><stop offset=".62" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#fff" stop-opacity=".8"/></linearGradient>
        </defs>
        <path d="${fiber}" fill="none" stroke="#f2f0ff" stroke-width="9" opacity=".16" filter="url(#cbl-fiber-soft)"/>
        <path d="M958 634C1217 584 1324 884 1561 862S1683 855 1732 856" fill="none" stroke="#b9b7c7" stroke-width=".9" opacity=".24"/>
        <path d="M958 652C1203 670 1287 893 1522 884S1667 869 1732 867" fill="none" stroke="#c0bdce" stroke-width=".8" opacity=".19"/>
        <path d="M959 640C1220 624 1287 860 1520 866S1667 858 1730 859" fill="none" stroke="#e6e4f4" stroke-width="1" opacity=".34"/>
        <path d="${fiber}" fill="none" stroke="#f9f9ff" stroke-width="3.3" opacity=".46" filter="url(#cbl-fiber-fine)"/>
        <path class="cbl-core-fiber" d="${fiber}" fill="none" stroke="#f8f7ff" stroke-width="1.35" opacity=".74"/>
        <g class="cbl-port-start">
          <path d="M943 608C953 631 974 640 1032 642C975 645 951 657 943 677Z" fill="url(#cbl-left-funnel)" filter="url(#cbl-port-fine)"/>
          <ellipse cx="948" cy="642" rx="10" ry="29" fill="#fff" opacity=".38" filter="url(#cbl-port-soft)"/>
          <path d="M944 616C949 633 968 641 1012 642M944 667C952 650 966 644 1012 642M945 625C951 637 969 641 1000 642M945 658C953 648 971 643 1000 642" fill="none" stroke="#fff" stroke-width=".85" opacity=".57"/>
          <ellipse cx="945" cy="642" rx="2.5" ry="18" fill="#fff" opacity=".93" filter="url(#cbl-port-fine)"/>
          <path d="M946 630v24" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
        </g>
        <g class="cbl-port-end">
          <path d="M1668 861C1712 862 1736 849 1747 826V896C1736 875 1713 862 1668 861Z" fill="url(#cbl-right-funnel)" filter="url(#cbl-port-fine)"/>
          <ellipse cx="1742" cy="861" rx="10" ry="29" fill="#fff" opacity=".4" filter="url(#cbl-port-soft)"/>
          <path d="M1694 861C1723 861 1738 849 1745 834M1694 861C1723 863 1738 875 1745 888M1710 861C1727 861 1740 852 1745 843M1710 861C1727 863 1740 869 1745 880" fill="none" stroke="#fff" stroke-width=".85" opacity=".58"/>
          <ellipse cx="1745" cy="861" rx="2.6" ry="19" fill="#fff" opacity=".96" filter="url(#cbl-port-fine)"/>
          <path d="M1744 849v24" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
        </g>
        <g class="cbl-packet" opacity="0">
          <path class="cbl-packet-path" d="${fiber}" pathLength="1000" fill="none" stroke="#fff" stroke-width="11" stroke-dasharray="120 1200" stroke-dashoffset="120" stroke-linecap="round" opacity=".49" filter="url(#cbl-fiber-soft)"/>
          <path class="cbl-packet-path" d="${fiber}" pathLength="1000" fill="none" stroke="#fff" stroke-width="3.3" stroke-dasharray="120 1200" stroke-dashoffset="120" stroke-linecap="round" opacity=".8" filter="url(#cbl-fiber-fine)"/>
          <path class="cbl-packet-path" d="${fiber}" pathLength="1000" fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="120 1200" stroke-dashoffset="120" stroke-linecap="round"/>
        </g>
      </svg>
      <div class="cbl-pointer">${ctx.cursor()}</div><div class="cbl-ring"></div>
      <div class="cbl-proof">静态参考重建 · 原创光流与交互 · 逻辑示意</div>
    </div>`;

    const q = ctx.q;
    const qa = ctx.qa;
    const pointer = q('.cbl-pointer');
    const ring = q('.cbl-ring');
    const tl = ctx.gsap.timeline({paused:true});
    tl.set(pointer, {x:1108, y:420, opacity:0, scale:1}, 0)
      .set(ring, {x:0, y:0, opacity:0, scale:.3}, 0)
      .set(q('.cbl-between'), {color:'#e5bd74', borderBottomColor:'#bca16b'}, 0)
      .set(q('.cbl-time-range'), {borderColor:'#3b3b3e', boxShadow:'inset 0 1px 0 #ffffff04,0 0 0 0px #d7bf9200'}, 0)
      .set(q('.cbl-packet'), {opacity:0}, 0)
      .set(qa('.cbl-packet-path'), {strokeDashoffset:120, autoRound:false}, 0)
      .set(q('.cbl-port-start'), {opacity:.8}, 0)
      .set(q('.cbl-port-end'), {opacity:.8}, 0)
      .set(q('.cbl-core-fiber'), {opacity:.74}, 0);

    // The text values never change: the cursor only identifies the condition and time range.
    tl.to(pointer, {x:624, y:521, opacity:1, duration:.8, ease:'power2.inOut'}, 1.05)
      .to(q('.cbl-between'), {color:'#f2d39b', borderBottomColor:'#efd09b', duration:.23}, 1.85)
      .to(pointer, {x:287, y:659, duration:.72, ease:'power2.inOut'}, 2.32)
      .set(pointer, {x:287, y:659, scale:1}, 3.16)
      .set(ring, {x:267, y:638, scale:.3, opacity:.54}, 3.16)
      .to(ring, {scale:1.3, opacity:0, duration:.43, ease:'power2.out'}, 3.16)
      .to(pointer, {scale:.88, duration:.09, ease:'power2.out'}, 3.16)
      .to(pointer, {scale:1, duration:.16, ease:'power2.out'}, 3.25)
      .to(q('.cbl-time-range'), {borderColor:'#a89672', boxShadow:'inset 0 1px 0 #ffffff06,0 0 0 3px #d7bf9210', duration:.28}, 3.16)
      .to(q('.cbl-time-range'), {borderColor:'#3b3b3e', boxShadow:'inset 0 1px 0 #ffffff04,0 0 0 0px #d7bf9200', duration:.7}, 3.69)
      .to(q('.cbl-between'), {color:'#e5bd74', borderBottomColor:'#bca16b', duration:.6}, 3.7)
      .to(pointer, {x:1084, y:441, duration:.68, ease:'power2.inOut'}, 3.76)
      .to(pointer, {opacity:0, duration:.25}, 4.47);

    // One normalized dash packet follows the existing curve, then leaves it in its initial state.
    tl.to(q('.cbl-port-start'), {opacity:1, duration:.27, ease:'power2.out'}, 5.02)
      .set(qa('.cbl-packet-path'), {strokeDashoffset:120}, 5.16)
      .to(q('.cbl-packet'), {opacity:1, duration:.16}, 5.16)
      .to(qa('.cbl-packet-path'), {strokeDashoffset:-1120, duration:2.42, ease:'none', autoRound:false}, 5.16)
      .to(q('.cbl-port-start'), {opacity:.8, duration:.6}, 5.5)
      .to(q('.cbl-port-end'), {opacity:1, duration:.22, ease:'power2.out'}, 7.18)
      .to(q('.cbl-packet'), {opacity:0, duration:.25}, 7.54)
      .to(q('.cbl-port-end'), {opacity:.8, duration:.62}, 7.56)
      .to({}, {duration:.01}, 11.99);

    return {timeline:tl, duration:12};
  });
})();
