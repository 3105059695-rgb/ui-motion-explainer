/* Observed Tech Text interaction adapted to editable Chinese titles. */
(function () {
  'use strict';

  const escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

  function graphemes(value) {
    if (typeof Intl.Segmenter === 'function') {
      return Array.from(new Intl.Segmenter('zh', {granularity: 'grapheme'}).segment(value), part => part.segment);
    }
    return Array.from(value);
  }

  function widthUnits(character) {
    if (/^\s+$/.test(character)) return 0.4;
    if (/^[ilI1!.,:;'|]$/.test(character)) return 0.42;
    if (/^[mwMW@]$/.test(character)) return 0.94;
    if (/^[\u0021-\u007e]$/.test(character)) return 0.7;
    return 1.04;
  }

  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
    .map(position => '<i class="tt-handle tt-' + position + '"></i>').join('');

  UIFX.register({
    id: 'result-tech-text-inspect',
    title: '科技文字 · 字形检查与还原',
    category: 'result',
    duration: 9,
    description: '按已观察的 Tech Text 悬停机制适配：光标依次经过同一行字，当前字切换为浅色填充与虚线轮廓，显示尺寸框和八个控制点，离开后恢复完整实心标题。',
    tags: ['Collect UI', 'Text Effect', 'Tech Text', '字形描边', '编辑器'],
    source: 'https://x.com/davidhaz/status/2103097465771638853',
    sourceStatus: 'observed-reconstruction',
    params: {title: '让想法落地', prompt: '悬停字符，查看形状与尺寸。', result: '每个细节，回到完整表达。'}
  }, function (ctx, params) {
    const p = Object.assign({title: '让想法落地', prompt: '悬停字符，查看形状与尺寸。', result: '每个细节，回到完整表达。'}, params);
    const title = String(p.title == null ? '' : p.title).trim() || '让想法落地';
    const characters = graphemes(title);
    const totalUnits = characters.reduce((sum, character) => sum + widthUnits(character), 0);
    // The single-line layout remains within the canvas safe width for any title.
    // Dimensions label the character layout box, not a fabricated glyph metric.
    const fontSize = Math.min(212, 1340 / Math.max(1, totalUnits));
    const boxHeight = Math.ceil(fontSize * 1.50);
    const widths = characters.map(character => fontSize * widthUnits(character));
    const rowWidth = widths.reduce((sum, width) => sum + width, 0);
    const rowLeft = (1600 - rowWidth) / 2;
    const rowTop = (650 - boxHeight) / 2;
    const canvasLeft = 160;
    const canvasTop = 222;
    let advance = 0;
    const cells = characters.map((character, index) => {
      const width = widths[index];
      const position = advance;
      advance += width;
      const dimensions = Math.round(width) + ' × ' + boxHeight;
      return '<div class="tt-character tt-character-' + index + '" style="left:' + position.toFixed(3) + 'px;width:' + width.toFixed(3) + 'px;height:' + boxHeight + 'px">' +
        '<svg class="tt-glyph" viewBox="0 0 ' + width.toFixed(3) + ' ' + boxHeight + '" style="font-size:' + fontSize.toFixed(3) + 'px" aria-hidden="true">' +
        '<text class="tt-solid" x="50%" y="50%" text-anchor="middle" dominant-baseline="central">' + escapeHTML(character) + '</text>' +
        '<text class="tt-outline" x="50%" y="50%" text-anchor="middle" dominant-baseline="central">' + escapeHTML(character) + '</text></svg>' +
        '<div class="tt-selection"><span class="tt-dimension">' + dimensions + '</span>' + handles + '</div></div>';
    }).join('');

    const css = `
      .tt-scene{position:absolute;inset:0;width:1920px;height:1080px;overflow:hidden;background:#f5f6f8;color:#17191f;font-family:ProjectSans,sans-serif}
      .tt-scene *{box-sizing:border-box}.tt-scene .tt-topbar{position:absolute;left:160px;right:160px;top:122px;height:52px;display:flex;align-items:center;justify-content:space-between}
      .tt-scene .tt-workspace-name{display:flex;align-items:center;gap:17px}.tt-scene .tt-workspace-name strong{font-family:ProjectDisplay,sans-serif;font-size:31px;letter-spacing:-.7px;font-weight:700;color:#292d37}.tt-scene .tt-workspace-name span{font-size:18px;color:#989eaa;padding-top:3px}
      .tt-scene .tt-tools{display:flex;align-items:center;gap:17px}.tt-scene .tt-tabs{display:flex;align-items:center;gap:3px;background:#e9ecf1;border:1px solid #e2e6ed;padding:4px;border-radius:11px}.tt-scene .tt-tabs span{font-size:17px;padding:8px 19px;border-radius:7px;color:#939ba8;line-height:23px}.tt-scene .tt-tabs .tt-active{background:#fff;color:#52617b;box-shadow:0 1px 4px #5162760d}
      .tt-scene .tt-copy{height:45px;display:flex;align-items:center;gap:9px;padding:0 16px;border:1px solid #dde2e9;border-radius:10px;background:#fafbfc;color:#828e9f;font-size:17px}.tt-scene .tt-copy svg{width:18px;height:18px}
      .tt-scene .tt-canvas{position:absolute;left:160px;top:222px;width:1600px;height:650px;border:1px solid #e2e6ed;border-radius:29px;background:#fcfdff;overflow:hidden;box-shadow:0 13px 42px #31486506}
      .tt-scene .tt-canvas:before{content:'';position:absolute;inset:0;background-image:radial-gradient(#c8d0dc .6px,transparent .6px);background-size:24px 24px;opacity:.19;pointer-events:none}
      .tt-scene .tt-canvas-head{position:absolute;left:28px;right:28px;top:24px;display:flex;align-items:center;justify-content:space-between;color:#a5acb9;font-size:15px;line-height:23px}.tt-scene .tt-canvas-head>span:first-child{display:flex;align-items:center;gap:9px}.tt-scene .tt-canvas-head svg{width:17px;height:17px}
      .tt-scene .tt-glyph-row{position:absolute}.tt-scene .tt-character{position:absolute;top:0}.tt-scene .tt-glyph{display:block;width:100%;height:100%;overflow:visible;font-family:ProjectSans,sans-serif;font-weight:650;letter-spacing:0}
      .tt-scene .tt-solid{fill:#1a1d24}.tt-scene .tt-outline{fill:#f4f6fa;stroke:#2e3441;stroke-width:1.7;stroke-dasharray:4.5 3.4;stroke-linejoin:round;paint-order:fill stroke;opacity:0}
      .tt-scene .tt-selection{position:absolute;inset:0;border:1.3px solid #adbce1;opacity:0;pointer-events:none}.tt-scene .tt-dimension{position:absolute;left:50%;top:-34px;transform:translateX(-50%);white-space:nowrap;font-size:16px;font-weight:450;line-height:24px;color:#8c9cbf;background:#fcfdff;border-radius:4px;padding:0 6px;letter-spacing:.2px}
      .tt-scene .tt-handle{position:absolute;display:block;width:6px;height:6px;background:#fff;border:1.2px solid #8fa5d4}.tt-scene .tt-nw{left:-3px;top:-3px}.tt-scene .tt-n{left:calc(50% - 3px);top:-3px}.tt-scene .tt-ne{right:-3px;top:-3px}.tt-scene .tt-e{right:-3px;top:calc(50% - 3px)}.tt-scene .tt-se{right:-3px;bottom:-3px}.tt-scene .tt-s{left:calc(50% - 3px);bottom:-3px}.tt-scene .tt-sw{left:-3px;bottom:-3px}.tt-scene .tt-w{left:-3px;top:calc(50% - 3px)}
      .tt-scene .tt-canvas-footer{position:absolute;left:28px;right:28px;bottom:24px;display:flex;align-items:center;justify-content:space-between;font-size:16px;line-height:25px;color:#a8afbd}.tt-scene .tt-canvas-footer>span:first-child{display:flex;align-items:center;gap:9px}.tt-scene .tt-ready-dot{width:5px;height:5px;border-radius:50%;background:#aebdd8}.tt-scene .tt-final-dot{background:#91aa9a}
      .tt-scene .tt-pointer{position:absolute;left:0;top:0;width:38px;height:46px;filter:drop-shadow(0 2px 2px #11284718);z-index:4;pointer-events:none}.tt-scene .tt-pointer .fx-cursor{position:static;width:38px;height:46px;display:block}
      .tt-scene .tt-below{position:absolute;left:164px;top:912px;font-size:20px;line-height:31px;color:#969ead}.tt-scene .tt-proof{position:absolute;right:160px;bottom:49px;font-size:18px;line-height:25px;color:#959daa}
    `;
    ctx.root.innerHTML = '<div class="tt-scene"><style>' + css + '</style>' +
      '<div class="tt-topbar"><div class="tt-workspace-name"><strong>Tech Text</strong><span>字符预览</span></div><div class="tt-tools"><div class="tt-tabs"><span class="tt-active">Preview</span><span>Code</span></div><div class="tt-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v12h5"/></svg>Copy for AI</div></div></div>' +
      '<section class="tt-canvas"><div class="tt-canvas-head"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 2v20M19 2v20M2 5h20M2 19h20"/></svg>Design canvas</span><span>100%</span></div>' +
      '<div class="tt-glyph-row" aria-label="' + escapeHTML(title) + '" style="left:' + rowLeft.toFixed(3) + 'px;top:' + rowTop.toFixed(3) + 'px;width:' + rowWidth.toFixed(3) + 'px;height:' + boxHeight + 'px">' + cells + '</div>' +
      '<div class="tt-canvas-footer"><span><i class="tt-ready-dot"></i><span class="tt-status">' + escapeHTML(p.prompt) + '</span></span><span>ProjectSans / 650</span></div></section>' +
      '<div class="tt-pointer">' + ctx.cursor() + '</div><div class="tt-below">同一行字，从完整表达，到局部细节，再回到整体。</div><div class="tt-proof">参考机制适配 · 界面示意</div></div>';

    const tl = ctx.gsap.timeline({paused: true});
    const pointer = ctx.q('.tt-pointer');
    tl.set(ctx.qa('.tt-solid'), {opacity: 1}, 0);
    tl.set(ctx.qa('.tt-outline, .tt-selection'), {opacity: 0}, 0);
    tl.set(pointer, {x: 1130, y: 748, opacity: 0}, 0);
    tl.set(ctx.q('.tt-status'), {textContent: String(p.prompt)}, 0);
    const eligible = characters.map((character, index) => /^\s+$/.test(character) ? -1 : index).filter(index => index >= 0);
    const positions = eligible.length < 4 ? eligible : [eligible[0], eligible[Math.floor((eligible.length - 1) * 0.4)], eligible[Math.floor((eligible.length - 1) * 0.72)], eligible[eligible.length - 1]];
    const selected = Array.from(new Set(positions));
    const times = selected.map((_index, order) => selected.length === 1 ? 0.9 : 0.9 + order * 4.45 / (selected.length - 1));

    function rest(index, at) {
      tl.fromTo(ctx.q('.tt-character-' + index + ' .tt-solid'), {opacity: 0}, {opacity: 1, duration: 0.12, ease: 'none', immediateRender: false}, at);
      tl.fromTo(ctx.q('.tt-character-' + index + ' .tt-outline'), {opacity: 1}, {opacity: 0, duration: 0.12, ease: 'none', immediateRender: false}, at);
      tl.fromTo(ctx.q('.tt-character-' + index + ' .tt-selection'), {opacity: 1}, {opacity: 0, duration: 0.12, ease: 'none', immediateRender: false}, at);
    }

    selected.forEach((index, order) => {
      const at = times[order];
      const x = canvasLeft + rowLeft + widths.slice(0, index).reduce((sum, width) => sum + width, 0) + widths[index] * 0.53;
      const y = canvasTop + rowTop + boxHeight * 0.53;
      if (order > 0) rest(selected[order - 1], at - 0.29);
      tl.to(pointer, {x, y, opacity: 1, duration: 0.55, ease: 'power2.inOut'}, at - 0.55);
      tl.fromTo(ctx.q('.tt-character-' + index + ' .tt-solid'), {opacity: 1}, {opacity: 0, duration: 0.12, ease: 'none', immediateRender: false}, at);
      tl.fromTo(ctx.q('.tt-character-' + index + ' .tt-outline'), {opacity: 0}, {opacity: 1, duration: 0.12, ease: 'none', immediateRender: false}, at);
      tl.fromTo(ctx.q('.tt-character-' + index + ' .tt-selection'), {opacity: 0}, {opacity: 1, duration: 0.12, ease: 'none', immediateRender: false}, at);
      tl.set(ctx.q('.tt-status'), {textContent: '正在检查「' + characters[index] + '」 · ' + Math.round(widths[index]) + ' × ' + boxHeight + ' px'}, at);
    });
    tl.to(pointer, {x: 1673, y: 758, duration: 0.65, ease: 'power2.inOut'}, 6.4);
    if (selected.length) rest(selected[selected.length - 1], 6.59);
    tl.set(ctx.q('.tt-status'), {textContent: String(p.result)}, 7.05);
    tl.to(ctx.q('.tt-ready-dot'), {backgroundColor: '#91aa9a', duration: 0.25}, 7.05);
    tl.to(pointer, {opacity: 0, duration: 0.3}, 7.1);
    tl.to({}, {duration: 0.01}, 8.99);
    return {timeline: tl, duration: 9};
  });
})();
