/* Alok reference: observed transfer mechanism; layout and curves reconstructed. */
(function () {
  'use strict';

  const defaults = {
    title: 'Transfer', prompt: 'Slide to send', result: 'Successful',
    initialAmount: 2500, amount: 4000, rate: 0.92,
    fromSymbol: '$', toSymbol: '€', fromCurrency: 'USD', toCurrency: 'EUR'
  };
  const CSS = `
  .tf-scene{position:relative;width:1920px;height:1080px;overflow:hidden;background:#f5f6f7;color:#242832;font-family:ProjectSans,sans-serif}
  .tf-scene *{box-sizing:border-box}.tf-scene svg{display:block;flex-shrink:0}
  .tf-scene .tf-card{position:absolute;left:610px;top:180px;width:700px;height:720px;background:#fff;border:1px solid #e7e9ec;border-radius:36px;box-shadow:0 30px 85px -35px #24314630,0 4px 15px #1d273507;overflow:hidden}
  .tf-scene .tf-header{position:absolute;left:36px;right:36px;top:30px;height:55px;display:flex;align-items:center;gap:14px}
  .tf-scene .tf-header-icon{width:46px;height:46px;border:1px solid #e8e9ed;border-radius:15px;display:grid;place-items:center;color:#555c69}
  .tf-scene .tf-title{margin:0;max-width:515px;font-size:29px;font-weight:580;line-height:1.3;letter-spacing:-.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tf-scene .tf-field{position:absolute;left:36px;width:628px;height:155px;border:1.5px solid #e9ebee;border-radius:21px;background:#fcfcfd;padding:18px 24px}
  .tf-scene .tf-from{top:119px}.tf-scene .tf-to{top:335px;background:#fafbfc}
  .tf-scene .tf-label{font-size:18px;line-height:1.5;color:#949aa5;letter-spacing:.1px}
  .tf-scene .tf-money{position:absolute;left:24px;top:55px;display:flex;align-items:center;gap:8px;font-family:ProjectDisplay,ProjectSans,sans-serif;font-size:58px;line-height:1.15;letter-spacing:-1.8px;font-variant-numeric:tabular-nums;white-space:nowrap}
  .tf-scene .tf-symbol{color:#737b89;font-size:47px;font-weight:400}
  .tf-scene .tf-value-wrap{position:relative;display:inline-block;min-width:28px}
  .tf-scene .tf-value{position:relative;z-index:1}
  .tf-scene .tf-selection{position:absolute;left:-2px;right:-4px;top:1px;bottom:-1px;border-radius:4px;background:#dae4fb}
  .tf-scene .tf-caret{position:absolute;right:-6px;top:6px;height:51px;width:2px;background:#8168a9}
  .tf-scene .tf-currency{position:absolute;right:21px;top:63px;height:48px;display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e5e8ec;border-radius:14px;padding:0 13px;color:#535d6c;font-family:ProjectDisplay,ProjectSans,sans-serif;font-size:20px;letter-spacing:.5px}
  .tf-scene .tf-currency-dot{width:9px;height:9px;border-radius:50%;background:#abb9d0}.tf-scene .tf-to .tf-currency-dot{background:#b7b0c9}
  .tf-scene .tf-rate{position:absolute;left:60px;right:60px;top:293px;height:24px;display:flex;align-items:center;gap:11px;font-size:17px;line-height:1.4;color:#a0a5ae}
  .tf-scene .tf-rate svg{color:#9299a5}
  .tf-scene .tf-slider{position:absolute;left:36px;top:555px;width:628px;height:80px;background:#f0f1f3;border:1px solid #e8eaed;border-radius:24px;overflow:hidden}
  .tf-scene .tf-trail{position:absolute;left:5px;top:5px;width:68px;height:68px;border-radius:19px;background:#dddfe5}
  .tf-scene .tf-slide-copy,.tf-scene .tf-success-copy{position:absolute;left:90px;right:90px;top:0;height:78px;display:flex;align-items:center;justify-content:center;color:#818897;font-size:22px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .tf-scene .tf-success-copy{color:#39705a}
  .tf-scene .tf-chevron{position:absolute;right:25px;top:29px;color:#c2c6ce}
  .tf-scene .tf-thumb{position:absolute;left:5px;top:5px;width:68px;height:68px;border-radius:19px;background:#272d37;color:#fff;box-shadow:0 4px 9px #1b223c16}
  .tf-scene .tf-thumb-arrow,.tf-scene .tf-thumb-check{position:absolute;left:21px;top:21px;width:26px;height:26px}
  .tf-scene .tf-footnote{position:absolute;left:36px;right:36px;top:658px;text-align:center;font-size:16px;color:#abb0b9;line-height:1.45}
  .tf-scene .tf-cursor{position:absolute;left:0;top:0;width:38px;height:46px;z-index:8;transform-origin:4px 3px;pointer-events:none;filter:drop-shadow(0 3px 2px #1b233c20)}
  .tf-scene .tf-cursor .fx-cursor{position:static;display:block;width:38px;height:46px}
  .tf-scene .tf-ring{position:absolute;left:0;top:0;width:54px;height:54px;margin:-27px 0 0 -27px;border:2px solid #ac94cb;border-radius:50%;pointer-events:none;z-index:7}
  .tf-scene .tf-proof{position:absolute;right:66px;bottom:34px;font-size:18px;color:#a0a4ad;letter-spacing:.3px}
  `;

  function finiteNumber(params, key, fallback, min, max) {
    const raw = params[key] === undefined ? fallback : params[key];
    if ((typeof raw !== 'number' && typeof raw !== 'string') || (typeof raw === 'string' && !raw.trim())) {
      throw new Error('Transfer parameter ' + key + ' must be a finite number.');
    }
    const value = Number(raw);
    if (!Number.isFinite(value) || value < min || value > max) {
      throw new Error('Transfer parameter ' + key + ' must be between ' + min + ' and ' + max + '.');
    }
    return value;
  }
  function shortText(value, fallback, max) {
    const text = value === undefined ? fallback : String(value);
    if (!text.trim() || Array.from(text).length > max) throw new Error('Transfer label is empty or too long.');
    return text;
  }
  function money(value) {
    return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  }
  function svg(path, size) {
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>';
  }

  UIFX.register({
    id: 'interaction-transfer-confirm', title: '转账确认 · 金额联动与滑动发送',
    category: 'interaction', duration: 9.5,
    description: '重建已观察的转账机制与卡片结构：选中并替换金额，换汇结果同步更新，滑块拖到终点后同一卡片显示 Sent 与 Successful；布局和运动曲线为原创重建，非像素级复刻。',
    tags: ['转账', '金额输入', '联动反馈', '滑动确认', 'E-Wallet'],
    source: 'https://x.com/Alok619308/status/2101955340547879167',
    sourceStatus: 'observed-reconstruction', params: {...defaults}
  }, function (ctx, params) {
    const p = Object.assign({}, defaults, params);
    const initialAmount = Math.round(finiteNumber(p, 'initialAmount', 2500, 0.01, 9999999.99) * 100) / 100;
    const amount = Math.round(finiteNumber(p, 'amount', 4000, 0.01, 9999999.99) * 100) / 100;
    const rate = Math.round(finiteNumber(p, 'rate', 0.92, 0.000001, 1000) * 1000000) / 1000000;
    if (Math.max(initialAmount, amount) * rate > 9999999.99) throw new Error('Converted transfer amount exceeds the readable card range.');
    const content = {
      title: shortText(p.title, defaults.title, 30), prompt: shortText(p.prompt, defaults.prompt, 32),
      result: shortText(p.result, defaults.result, 32),
      fromSymbol: shortText(p.fromSymbol, '$', 4), toSymbol: shortText(p.toSymbol, '€', 4),
      fromCurrency: shortText(p.fromCurrency, 'USD', 6), toCurrency: shortText(p.toCurrency, 'EUR', 6)
    };
    const e = value => ctx.esc(value);
    const arrow = svg('<path d="M5 12h14m-5-5 5 5-5 5"/>', 26);
    const currency = (code, name) => '<div class="tf-currency"><i class="tf-currency-dot"></i><span>' + e(code) + '</span>' + svg('<path d="m8 10 4 4 4-4"/>', 15) + '</div>';
    const rateText = '1 ' + content.fromCurrency + ' = ' + String(rate) + ' ' + content.toCurrency;
    ctx.root.innerHTML = '<style>' + CSS + '</style><div class="fx-scene tf-scene">' +
      '<section class="tf-card"><header class="tf-header"><div class="tf-header-icon">' + svg('<path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4"/>', 24) + '</div><h1 class="tf-title">' + e(content.title) + '</h1></header>' +
      '<div class="tf-field tf-from"><div class="tf-label">You send</div><div class="tf-money"><span class="tf-symbol">' + e(content.fromSymbol) + '</span><span class="tf-value-wrap"><i class="tf-selection"></i><span class="tf-value tf-input">' + e(money(initialAmount)) + '</span><i class="tf-caret"></i></span></div>' + currency(content.fromCurrency) + '</div>' +
      '<div class="tf-rate">' + svg('<path d="M7 4v16m-3-3 3 3 3-3M17 20V4m-3 3 3-3 3 3"/>', 20) + '<span>' + e(rateText) + '</span></div>' +
      '<div class="tf-field tf-to"><div class="tf-label tf-receive-label">Recipient gets</div><div class="tf-money"><span class="tf-symbol">' + e(content.toSymbol) + '</span><span class="tf-value tf-output">' + e(money(initialAmount * rate)) + '</span></div>' + currency(content.toCurrency) + '</div>' +
      '<div class="tf-slider"><div class="tf-trail"></div><div class="tf-slide-copy">' + e(content.prompt) + '</div><div class="tf-success-copy">' + e(content.result) + '</div><div class="tf-chevron">' + svg('<path d="m6 5 7 7-7 7m6-14 7 7-7 7"/>', 20) + '</div><div class="tf-thumb"><span class="tf-thumb-arrow">' + arrow + '</span><svg class="tf-thumb-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6" stroke-dasharray="24" stroke-dashoffset="24"/></svg></div></div>' +
      '<div class="tf-footnote">Review the amount, then slide to confirm.</div></section>' +
      '<div class="tf-ring"></div><div class="tf-cursor">' + ctx.cursor() + '</div><div class="tf-proof">机制重建 · 界面示意</div></div>';

    // Keep custom larger amounts inside the input/output column, away from chips.
    const widest = Math.max(money(initialAmount).length, money(amount).length, money(initialAmount * rate).length, money(amount * rate).length);
    const numberSize = widest > 8 ? 40 : widest > 6 ? 46 : 58;
    ctx.qa('.tf-money').forEach(node => { node.style.fontSize = numberSize + 'px'; });

    const tl = ctx.gsap.timeline({paused: true});
    const cursor = ctx.q('.tf-cursor');
    const ring = ctx.q('.tf-ring');
    const input = ctx.q('.tf-input');
    const output = ctx.q('.tf-output');
    const thumb = ctx.q('.tf-thumb');
    const move = (x, y, at, duration) => tl.to(cursor, {x: x - 4, y: y - 3, opacity: 1, duration, ease: 'power2.inOut'}, at);
    const click = (x, y, at) => {
      tl.set(cursor, {x: x - 4, y: y - 3}, at)
        .to(cursor, {scale: 0.88, duration: 0.09}, at)
        .to(cursor, {scale: 1, duration: 0.16}, at + 0.09)
        .set(ring, {x, y, opacity: 0.7, scale: 0.3}, at)
        .to(ring, {scale: 1.35, opacity: 0, duration: 0.45, ease: 'power2.out'}, at);
    };

    tl.set(ctx.q('.tf-card'), {y: 20, scale: 0.985, opacity: 0, transformOrigin: '50% 50%'}, 0)
      .set(cursor, {x: 1340, y: 490, opacity: 0, scale: 1}, 0)
      .set(ring, {opacity: 0, scale: 0.3}, 0)
      .set(ctx.q('.tf-selection'), {opacity: 0}, 0)
      .set(ctx.q('.tf-caret'), {opacity: 0}, 0)
      .set(input, {textContent: money(initialAmount)}, 0)
      .set(output, {textContent: money(initialAmount * rate)}, 0)
      .set(ctx.q('.tf-receive-label'), {textContent: 'Recipient gets'}, 0)
      .set(ctx.q('.tf-success-copy'), {opacity: 0, y: 8}, 0)
      .set(ctx.q('.tf-thumb-check'), {opacity: 0}, 0)
      .set(ctx.q('.tf-thumb-check path'), {strokeDashoffset: 24}, 0)
      .set(thumb, {x: 0}, 0)
      .to(ctx.q('.tf-card'), {y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out'}, 0);

    // 1.15–2.8: focus, select, then replace digits; each digit updates the quote.
    move(819, 389, 0.65, 0.5);
    click(819, 389, 1.15);
    tl.to(ctx.q('.tf-from'), {borderColor: '#aa95c9', boxShadow: '0 0 0 3px #b9a5d314', duration: 0.2}, 1.15)
      .set(ctx.q('.tf-selection'), {opacity: 1}, 1.45)
      .set(ctx.q('.tf-selection'), {opacity: 0}, 2.05)
      .set(ctx.q('.tf-caret'), {opacity: 1}, 2.05);
    const digits = money(amount);
    Array.from(digits).forEach((_, i) => {
      const partial = digits.slice(0, i + 1);
      const at = 2.05 + 0.7 * (i + 1) / digits.length;
      tl.set(input, {textContent: partial}, at)
        .set(output, {textContent: money(Number(partial) * rate)}, at + 0.05);
    });
    tl.to(ctx.q('.tf-to'), {borderColor: '#c7b6de', backgroundColor: '#faf7fe', duration: 0.28}, 2.8)
      .to(ctx.q('.tf-to'), {borderColor: '#e9ebee', backgroundColor: '#fafbfc', duration: 0.5}, 3.25)
      .to(ctx.q('.tf-caret'), {opacity: 0, duration: 0.15}, 3.45)
      .to(ctx.q('.tf-from'), {borderColor: '#e9ebee', boxShadow: '0 0 0 0px #b9a5d300', duration: 0.3}, 3.45);

    // Card (610,180) + slider (36,555) + thumb center (39,39).
    // Pointer, thumb and filled track share exactly the same drag interval/ease.
    const startX = 685;
    const startY = 774;
    const travel = 548;
    move(startX, startY, 3.75, 0.6);
    tl.to(cursor, {scale: 0.88, duration: 0.13}, 4.4)
      .to(thumb, {boxShadow: '0 5px 14px #1b223c28', duration: 0.15}, 4.4)
      .to(thumb, {x: travel, duration: 1.55, ease: 'power2.inOut'}, 4.55)
      .to(cursor, {x: startX + travel - 4, duration: 1.55, ease: 'power2.inOut'}, 4.55)
      .to(ctx.q('.tf-trail'), {width: 616, duration: 1.55, ease: 'power2.inOut'}, 4.55)
      .to(ctx.q('.tf-slide-copy'), {opacity: 0, x: 35, duration: 0.65, ease: 'power2.inOut'}, 4.55)
      .to(ctx.q('.tf-chevron'), {opacity: 0, duration: 0.3}, 5.55);

    // Success cannot appear before the thumb reaches its endpoint at 6.10 s.
    tl.to(cursor, {scale: 1, duration: 0.16}, 6.12)
      .set(ctx.q('.tf-receive-label'), {textContent: 'Sent'}, 6.16)
      .to(ctx.q('.tf-to'), {borderColor: '#d9e8df', backgroundColor: '#f8fcf9', duration: 0.4}, 6.16)
      .to(output, {color: '#355d48', duration: 0.4}, 6.16)
      .to(ctx.q('.tf-slider'), {backgroundColor: '#edf5f0', borderColor: '#dde9e1', duration: 0.4}, 6.16)
      .to(ctx.q('.tf-trail'), {backgroundColor: '#edf5f0', duration: 0.4}, 6.16)
      .to(thumb, {backgroundColor: '#4d8064', boxShadow: '0 4px 9px #315d4414', duration: 0.35}, 6.16)
      .to(ctx.q('.tf-thumb-arrow'), {opacity: 0, x: 5, duration: 0.2}, 6.16)
      .to(ctx.q('.tf-thumb-check'), {opacity: 1, duration: 0.15}, 6.3)
      .to(ctx.q('.tf-thumb-check path'), {strokeDashoffset: 0, duration: 0.38, ease: 'power2.out'}, 6.3)
      .to(ctx.q('.tf-success-copy'), {opacity: 1, y: 0, duration: 0.4, ease: 'power3.out'}, 6.3)
      .set(ctx.q('.tf-footnote'), {textContent: 'Transfer complete.'}, 6.55);
    move(1380, 865, 6.35, 0.55);
    tl.to(cursor, {opacity: 0, duration: 0.25}, 6.95);
    tl.to({}, {duration: 0.01}, 9.49);
    return {timeline: tl, duration: 9.5};
  });
})();
