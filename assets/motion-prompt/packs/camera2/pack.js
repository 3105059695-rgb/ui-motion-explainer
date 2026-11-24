/* Motion Prompt · pack "camera2" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('camera2', function () {
  // @kit
  // カメラワーク＆切り替え 第2弾 24（カード 539x208）。各コマは時間 u の純関数。第1弾（camera）と同じ3Dの世界・ファインダー・色。
  // 1つの動きは CYC=4.7秒。切り替え（19・20）は A→B の次に B→A と戻るので、パックの周期は CYC×2=9.4秒。
  const CW = 539, CH = 208, FPS = 30;
  const HOLD = 9.4, CYC = HOLD / 2;
  const C = {
    bg: '#FFFFFF', card: '#FFFFFF', border: '#393840', ink: '#0B0B0F', sub: '#62616C', faint: '#BABAC0',
    blue: '#0B0B0F', blueM: '#D6C2FF', blueL: '#C9C8CE', blueXL: '#E8E7EB', blueBg: '#F4F3F5',
    grid: '#EBEAED', g1: '#F5F4F6', g2: '#DFDEE2', g3: '#BAB9C0', g4: '#85838D'
  };
  const JP = '"MotionCatalogSC", "Noto Sans SC", sans-serif';
  const EN = '"MotionCatalogSC", "Noto Sans SC", sans-serif';
  const MONO = '"MotionCatalogSC", "Noto Sans SC", sans-serif';

  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const eOut = x => 1 - Math.pow(1 - x, 3);
  const mod = (a, n) => ((a % n) + n) % n;
  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function txt(ctx, s, x, y, font, col, align = 'left', base = 'alphabetic', ls = '0px') {
    ctx.font = font; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.letterSpacing = ls; ctx.fillText(s, x, y); ctx.letterSpacing = '0px';
  }
  function tw(ctx, s, font, ls = '0px') { ctx.font = font; ctx.letterSpacing = ls; const w = ctx.measureText(s).width; ctx.letterSpacing = '0px'; return w; }

  // ============================== 3D SCENE ==============================
  // 世界座標: Y上・カメラは +Z を向く（yaw=0）。単位はメートル。焦点距離 f はピクセル。
  const F0 = 330;  // = 24mm 表示
  const mm = f => Math.round(f / F0 * 24) + 'mm';
  function cam(o) { return Object.assign({ x: 0, y: 1.5, z: 0, yaw: 0, pitch: 0, roll: 0, f: F0 }, o); }
  function proj(c, X, Y, Z) {
    const dx = X - c.x, dy = Y - c.y, dz = Z - c.z;
    const cy = Math.cos(c.yaw), sy = Math.sin(c.yaw);
    const x1 = dx * cy - dz * sy, z1 = dx * sy + dz * cy;
    const cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    const y2 = dy * cp - z1 * sp, z2 = dy * sp + z1 * cp;
    return { x: c.f * x1 / z2, y: -c.f * y2 / z2, z: z2, s: c.f / z2, cx: x1, cy: y2 };
  }
  function camZ(c, X, Y, Z) { return proj(c, X, Y, Z).z; }
  const NEAR = 0.25;
  function seg(ctx, c, a, b) {   // 3D line with near clipping
    let za = camZ(c, ...a), zb = camZ(c, ...b);
    if (za < NEAR && zb < NEAR) return;
    if (za < NEAR) { const t = (NEAR - za) / (zb - za); a = a.map((v, i) => lerp(v, b[i], t)); }
    else if (zb < NEAR) { const t = (NEAR - zb) / (za - zb); b = b.map((v, i) => lerp(v, a[i], t)); }
    const p = proj(c, ...a), q = proj(c, ...b);
    ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
  }
  function poly(ctx, c, pts) { ctx.beginPath(); pts.forEach((p, i) => { const q = proj(c, ...p); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); }); ctx.closePath(); }

  // sprite = local drawing (meters, y up) anchored at a world point, always facing camera (billboard)
  function sprite(ctx, c, X, Y, Z, fn) {
    const p = proj(c, X, Y, Z); if (p.z < NEAR) return;
    ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.s, -p.s); fn(ctx, p.s); ctx.restore();
  }
  function person(ctx, s, o = {}) {
    const col = o.col || C.blue, walk = o.walk || 0, face = o.face;
    ctx.fillStyle = col;
    const sw = Math.sin(walk) * 0.42;
    // legs
    [[-0.08, sw], [0.08, -sw]].forEach(([x, a]) => { ctx.save(); ctx.translate(x, 0.86); ctx.rotate(a); rr(ctx, -0.075, -0.86, 0.15, 0.88, 0.07); ctx.fill(); ctx.restore(); });
    // arms
    [[-0.25, -sw], [0.25, sw]].forEach(([x, a]) => { ctx.save(); ctx.translate(x, 1.38); ctx.rotate(a * (o.armUp ? 0 : 1) + (o.armUp ? (x < 0 ? -2.6 : 2.6) : 0)); rr(ctx, -0.06, -0.58, 0.12, 0.6, 0.06); ctx.fill(); ctx.restore(); });
    rr(ctx, -0.23, 0.82, 0.46, 0.64, 0.12); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 1.63, 0.16, 0, 7); ctx.fill();
    if (face !== undefined && Math.cos(face) > 0) {   // 顔の向き（オービット・バレットタイム用）
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(Math.sin(face) * -0.09, 1.65, 0.035, 0, 7); ctx.fill();
    }
  }
  function tree(ctx, s, h = 4, col = C.g2) {
    ctx.fillStyle = C.g3; ctx.fillRect(-0.09 * h / 4, 0, 0.18 * h / 4, h * 0.55);
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, h * 0.68, h * 0.3, 0, 7); ctx.fill();
  }
  function building(ctx, s, w, h, col = C.g1) {
    ctx.fillStyle = col; ctx.fillRect(-w / 2, 0, w, h);
    ctx.strokeStyle = C.g3; ctx.lineWidth = 1.4 / s; ctx.strokeRect(-w / 2, 0, w, h);
    ctx.fillStyle = C.g2;
    for (let y = h - 1.6; y > 1; y -= 1.8) for (let x = -w / 2 + 0.6; x < w / 2 - 0.7; x += 1.3) ctx.fillRect(x, y, 0.6, 0.8);
  }
  function post(ctx, s, h = 1.2) { ctx.fillStyle = C.g4; ctx.fillRect(-0.07, 0, 0.14, h); ctx.fillRect(-0.12, h - 0.06, 0.24, 0.1); }

  // scene presets
  const MTN_FAR = [[-420, 0], [-300, 22], [-230, 8], [-150, 30], [-80, 12], [-20, 34], [50, 14], [120, 28], [190, 6], [260, 26], [340, 10], [420, 0]];
  const MTN_NEAR = [[-260, 0], [-190, 12], [-140, 4], [-70, 18], [-20, 6], [30, 15], [95, 3], [160, 16], [230, 5], [300, 0]];
  const BLD = [[-17, 4, 9], [-12, 3.2, 13], [-8, 2.6, 7], [11, 3.4, 11], [15.5, 4, 8], [20, 3, 15], [-24, 3.5, 10], [26, 4, 7]];
  const CITY = [[-9, 3.4, 12], [-5.5, 3, 18], [-2, 3.6, 9], [1.8, 3, 22], [5.4, 3.6, 14], [9, 3, 10], [-13, 3.4, 15], [12.8, 3.6, 19]];

  function world(ctx, w, h, c, o = {}) {
    ctx.save();
    ctx.translate(w / 2, h / 2); ctx.rotate(c.roll || 0);
    const blurBg = o.blurBg || 0, blurFg = o.blurFg || 0;
    const setBlur = b => { ctx.filter = b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none'; };
    // sky tint
    if (o.sky) { ctx.fillStyle = o.sky; ctx.fillRect(-w * 2, -h * 3, w * 4, h * 6); }
    setBlur(blurBg);
    // sun / moon
    const sun = o.sun === undefined ? [30, 30, 170] : o.sun;
    if (sun) { const p = proj(c, ...sun); if (p.z > NEAR) { ctx.fillStyle = o.sunCol || C.blueL; ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0, 5.5 * p.s * (o.sunScale || 1)), 0, 7); ctx.fill(); } }
    if (o.clouds) o.clouds.forEach(([X, Y, Z, r]) => { const p = proj(c, X, Y, Z); if (p.z < NEAR) return; ctx.fillStyle = C.g1; ctx.beginPath(); ctx.ellipse(p.x, p.y, r * 2.2 * p.s, r * p.s, 0, 0, 7); ctx.ellipse(p.x + r * 1.2 * p.s, p.y + r * .2 * p.s, r * 1.4 * p.s, r * .8 * p.s, 0, 0, 7); ctx.fill(); });
    // mountains (far planes)
    if (o.mountains !== false) {
      const off = o.mtnZ || 0;
      ctx.fillStyle = C.blueXL; poly(ctx, c, [...MTN_FAR.map(([x, y]) => [x, y, 175 + off])]); ctx.fill();
      ctx.fillStyle = C.blueL; poly(ctx, c, [...MTN_NEAR.map(([x, y]) => [x, y, 120 + off])]); ctx.fill();
    }
    // ground + grid
    if (o.grid !== false) {
      ctx.save(); setBlur(blurBg * 0.6);
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1.3; ctx.beginPath();
      const z0 = Math.floor(c.z / 2) * 2, xs = o.gridX || 40;
      for (let z = z0 + 2; z <= z0 + 90; z += (z - z0 < 30 ? 2 : 6)) seg(ctx, c, [-xs + c.x, 0, z], [xs + c.x, 0, z]);
      for (let x = Math.floor(c.x / 2) * 2 - xs; x <= c.x + xs; x += 2) seg(ctx, c, [x, 0, z0 + 0.5], [x, 0, z0 + 90]);
      ctx.stroke();
      // horizon
      ctx.strokeStyle = C.g2; ctx.lineWidth = 1.5; ctx.beginPath(); seg(ctx, c, [c.x - 400, 0, c.z + 300], [c.x + 400, 0, c.z + 300]); ctx.stroke();
      ctx.restore();
    }
    // sprites sorted by depth
    const list = [];
    const add = (X, Y, Z, fn, fg) => list.push({ z: camZ(c, X, Y, Z), X, Y, Z, fn, fg });
    if (o.buildings !== false) (o.city ? CITY.map(([x, bw, bh]) => [x, bw, bh, 30]) : BLD.map(([x, bw, bh]) => [x, bw, bh, 48])).forEach(([x, bw, bh, z]) => add(x, 0, z, (k, s) => building(k, s, bw, bh)));
    if (o.trees !== false) [[-7, 22], [6.5, 19], [9.5, 24], [-11, 26], [3, 30]].forEach(([x, z]) => add(x, 0, z, (k, s) => tree(k, s, 4)));
    if (o.tower) add(o.tower[0], 0, o.tower[1], (k, s) => { building(k, s, 6, 9.5, C.g1); k.fillStyle = C.g4; k.fillRect(-0.08, 9.5, 0.16, 2.2); k.fillStyle = C.blue; k.beginPath(); k.arc(0, 11.8, 0.3, 0, 7); k.fill(); });
    if (o.ring) for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; add(o.ring[0] + Math.sin(a) * o.ring[2], 0, o.ring[1] + Math.cos(a) * o.ring[2], (k, s) => tree(k, s, 3.2, i % 3 ? C.g2 : C.blueXL)); }
    if (o.extra) o.extra.forEach(e => add(e[0], e[1], e[2], e[3], e[4]));
    if (o.person) { const pp = o.person; add(pp.x || 0, pp.y || 0, pp.z === undefined ? 8 : pp.z, (k, s) => person(k, s, pp), pp.fg); }
    if (o.fg) o.fg.forEach(([X, Z, kind]) => add(X, 0, Z, (k, s) => kind === 'rock' ? (k.fillStyle = C.g3, k.beginPath(), k.ellipse(0, 0.1, 0.55, 0.38, 0, 0, 7), k.fill()) : post(k, s), true));
    list.sort((a, b) => b.z - a.z);
    for (const it of list) { setBlur(it.fg ? blurFg : blurBg); sprite(ctx, c, it.X, it.Y, it.Z, it.fn); }
    ctx.filter = 'none';
    if (o.after) o.after(ctx, c);
    ctx.restore();
  }

  // ============================== VIEWFINDER CARD ==============================
  const CARD = mkCanvas(CW, CH), CK = CARD.getContext('2d');
  const TMP = mkCanvas(CW, CH), TK = TMP.getContext('2d');
  const TMP2 = mkCanvas(CW, CH), TK2 = TMP2.getContext('2d');
  function clear(k, w = CW, h = CH) { k.setTransform(1, 0, 0, 1, 0, 0); k.globalAlpha = 1; k.filter = 'none'; k.fillStyle = '#FFFFFF'; k.fillRect(0, 0, w, h); }
  // draw fnA then blend fnB on top with alpha a (into k)
  function blend(k, fnA, fnB, a) {
    if (a <= 0.001) return fnA(k);
    if (a >= 0.999) return fnB(k);
    fnA(k);
    clear(TK2); fnB(TK2); k.save(); k.globalAlpha = a; k.drawImage(TMP2, 0, 0); k.restore();
  }
  // motion blur: average n renders of fn(k, s) with s spread over [s0, s1]
  function mblur(k, fn, s0, s1, n) {
    if (Math.abs(s1 - s0) < 1e-4 || n < 2) return fn(k, s0);
    const acc = mkCanvasCached(), ak = acc.getContext('2d');
    for (let i = 0; i < n; i++) {
      clear(TK); fn(TK, lerp(s0, s1, (i + .5) / n));
      ak.globalAlpha = 1 / (i + 1); ak.drawImage(TMP, 0, 0);
    }
    ak.globalAlpha = 1; k.save(); k.drawImage(acc, 0, 0); k.restore();
  }
  let _acc; function mkCanvasCached() { if (!_acc) _acc = mkCanvas(CW, CH); const k = _acc.getContext('2d'); k.globalAlpha = 1; k.fillStyle = '#FFFFFF'; k.fillRect(0, 0, CW, CH); return _acc; }

  function viewfinder(k, w, h, t, hud, hudCol) {
    k.save();
    const m = 13, L = 20;
    k.strokeStyle = '#8f8f94'; k.lineWidth = 2.6; k.lineCap = 'round';
    k.beginPath();
    [[m, m, 1, 1], [w - m, m, -1, 1], [m, h - m, 1, -1], [w - m, h - m, -1, -1]].forEach(([x, y, sx, sy]) => { k.moveTo(x, y + sy * L); k.lineTo(x, y); k.lineTo(x + sx * L, y); });
    k.stroke();
    // center mark
    k.strokeStyle = 'rgba(143,143,148,.55)'; k.lineWidth = 1.6; k.beginPath(); k.moveTo(w / 2 - 7, h / 2); k.lineTo(w / 2 + 7, h / 2); k.moveTo(w / 2, h / 2 - 7); k.lineTo(w / 2, h / 2 + 7); k.stroke();
    // REC (なめらかな明滅・9.4秒で9回＝ループの継ぎ目なし)
    const a = 0.55 + 0.45 * Math.cos(t * Math.PI * 2 * 9 / HOLD);
    k.fillStyle = C.blue; k.globalAlpha = a; k.beginPath(); k.arc(m + 16, m + 17, 5, 0, 7); k.fill(); k.globalAlpha = 1;
    txt(k, 'REC', m + 27, m + 17, `600 14px ${MONO}`, '#7d7d82', 'left', 'middle');
    if (hud) {
      const f = `600 15px ${MONO}`, ww = tw(k, hud, f);
      k.fillStyle = 'rgba(255,255,255,.82)'; rr(k, w - m - 14 - ww - 10, m + 6, ww + 20, 23, 6); k.fill();
      txt(k, hud, w - m - 14, m + 18, f, hudCol || '#6e6e73', 'right', 'middle');
    }
    k.restore();
  }

  // ============================== CELLS ==============================
  // each: (k, w, h, u) where u = time within the cycle (0..CYC), cyc = cycle index; returns HUD string
  const RESET = 0.5;  // 末尾のクロスフェードで開始状態へ戻す
  function camCell(stateAt, hudAt, t0 = 0.5, t1 = 3.4) {
    return (k, w, h, u) => {
      const p = eIO(P(u, t0, t1));
      const r = P(u, CYC - RESET, CYC);
      blend(k, kk => stateAt(kk, w, h, p, u), kk => stateAt(kk, w, h, 0, u - CYC), eIOs(r));
      return hudAt(r > 0.5 ? 0 : p, u);
    };
  }
  // 1コマぶんの枠: 白地 → 中身 → ファインダー（四隅・REC・右上の数値）。u はパック周期 0..CYC×2
  function shot(fn, vh) {
    return (k, w, h, u) => {
      const uu = mod(u, CYC), cyc = Math.floor(u / CYC);
      k.fillStyle = '#FFFFFF'; k.fillRect(0, 0, w, h);
      k.save(); const hud = fn(k, w, h, uu, cyc); k.restore();
      k.globalAlpha = 1; k.filter = 'none';
      viewfinder(k, w, vh || h, u, hud);
    };
  }
  // 画面下の帯（カットの並びを示す）: segs = [[t0, t1, ラベル, 色], …]、pos = 再生位置（秒）
  function strip(k, w, h, segs, pos, lab) {
    const x0 = 44, x1 = w - 44, y = h - 36, hh = 24;
    const xAt = t => lerp(x0, x1, t / CYC);
    k.save();
    k.fillStyle = 'rgba(255,255,255,.9)'; rr(k, x0 - 6, y - 5, x1 - x0 + 12, hh + 10, 7); k.fill();
    segs.forEach(([a, b, s, col]) => {
      k.fillStyle = col; rr(k, xAt(a) + 1, y, Math.max(2, xAt(b) - xAt(a) - 2), hh, 4); k.fill();
      if (s) txt(k, s, (xAt(a) + xAt(b)) / 2, y + hh / 2 + .5, `700 12px ${JP}`, col === C.g2 ? C.g4 : '#FFFFFF', 'center', 'middle');
    });
    const hx = xAt(pos); k.fillStyle = C.ink; k.fillRect(hx - 1.5, y - 4, 3, hh + 8); k.beginPath(); k.moveTo(hx - 5, y - 6); k.lineTo(hx + 5, y - 6); k.lineTo(hx, y - 1); k.fill();
    if (lab) txt(k, lab, x0 - 6, y - 10, `600 11px ${MONO}`, C.sub, 'left', 'alphabetic');
    k.restore();
  }
  const CELLS = [];

  // @element 01
  // 01 ペデスタル: カメラごと真上へ平行移動。向き（ピッチ）は変えないので地平線は画面の中央のまま（#031 クレーンアップとの違い）
  CELLS[0] = shot(camCell((k, w, h, p) => world(k, w, h, cam({ y: lerp(1.0, 3.2, p) }), { person: { z: 7 }, tower: [3.5, 26], buildings: true }),
    p => `↕ ${lerp(1.0, 3.2, p).toFixed(1)}m`));

  // @element 02
  // 02 バレルロール: レンズの軸（画面の中央）でカメラを1回転
  CELLS[1] = shot(camCell((k, w, h, p) => world(k, w, h, cam({ roll: p * Math.PI * 2 }), { person: { z: 7 } }),
    p => `↻ ${Math.round(p * 360)}°`, 0.5, 3.6));

  // @element 03
  // 03 ハイパーラプス: 街路を前へ進みながらのタイムラプス（太陽・雲・人影が早送り）。#039 タイムラプスはカメラが動かない
  const HL_BLD = [[-7.5, 4, 9, 5], [7.5, 3.4, 12, 9], [-7.5, 3.6, 14, 13], [7.5, 4, 8, 18], [-7.5, 3.2, 11, 22], [7.5, 3.6, 15, 27], [-7.5, 4, 9, 31], [7.5, 3.2, 12, 36], [-7.5, 3.6, 13, 40], [7.5, 4, 10, 45], [-7.5, 3.4, 16, 50], [7.5, 3.6, 9, 55]];
  CELLS[2] = shot(camCell((k, w, h, p) => {
    const z = lerp(0, 22, p), a = lerp(-1.25, 1.25, p);
    const clouds = [[-20 + mod(p * 140, 80) - 10, 18, z + 90, 2.2], [-50 + mod(p * 140 + 40, 80), 24, z + 120, 3], [-10 + mod(p * 140 + 20, 80) - 30, 13, z + 70, 1.6]];
    const ex = HL_BLD.map(([x, bw, bh, zz]) => [x, 0, zz, (kk, s) => building(kk, s, bw, bh)]);
    for (let i = 0; i < 6; i++) { const ph = mod(p * 6 + i / 6, 1), dir = i % 2 ? 1 : -1; ex.push([dir * lerp(-5.5, 5.5, ph), 0, 7 + i * 7, (kk) => { kk.fillStyle = i % 3 ? C.g4 : C.blueM; kk.fillRect(-0.12, 0, 0.24, 0.9); kk.beginPath(); kk.arc(0, 1.05, 0.13, 0, 7); kk.fill(); }]); }
    world(k, w, h, cam({ z, y: 1.6, pitch: 0.05 }), {
      buildings: false, trees: false, mtnZ: z, sun: [Math.sin(a) * 120, Math.cos(a) * 60 - 8, z + 170], sunCol: C.blueM, clouds, extra: ex, gridX: 24,
      after: (kk, cc) => {   // 建物の影（太陽と反対側へ）
        kk.fillStyle = 'rgba(160,160,165,.22)';
        HL_BLD.forEach(([x, bw, bh, zz]) => { if (zz < cc.z + 1) return; const L = bh * 0.9; const q1 = proj(cc, x - bw / 2, 0, zz), q2 = proj(cc, x + bw / 2, 0, zz), q3 = proj(cc, x + bw / 2 - Math.sin(a) * L, 0, zz - Math.cos(a) * L * 0.4 - 1), q4 = proj(cc, x - bw / 2 - Math.sin(a) * L, 0, zz - Math.cos(a) * L * 0.4 - 1); if (q3.z < NEAR || q4.z < NEAR) return; kk.beginPath(); kk.moveTo(q1.x, q1.y); kk.lineTo(q2.x, q2.y); kk.lineTo(q3.x, q3.y); kk.lineTo(q4.x, q4.y); kk.fill(); });
      }
    });
  }, p => { const m = Math.round(lerp(6 * 60, 18 * 60, p) / 10) * 10; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')} · ${Math.round(lerp(0, 22, p))}m`; }, 0.4, 4.1));

  // @element 04
  // 04 長回し: 歩く人物をカットなしで追い続ける1ショット。画面下の帯は1本のまま（#041 ジャンプカットのように割れない）
  CELLS[3] = shot((k, w, h, u) => {
    const uu = Math.min(u, CYC - RESET);
    const draw = (kk, t) => {
      const p = t / (CYC - RESET);
      const x = lerp(-3.4, 2.8, p), z = lerp(5.2, 9.6, p), cx = lerp(0, 1.4, p);
      world(kk, w, h, cam({ x: cx, y: 1.4, yaw: Math.atan2(x - cx, z) * 0.8 }), { person: { x, z, walk: t * 7 }, fg: [[-2.6, 3.4], [3.6, 4.6, 'rock']] });
      strip(kk, w, h, [[0, CYC, '1ショット・カットなし', C.blue]], t);
    };
    const r = P(u, CYC - RESET, CYC);
    blend(k, kk => draw(kk, uu), kk => draw(kk, 0), eIOs(r));
    return `NO CUT ${(r > .5 ? 0 : uu).toFixed(1)}s`;
  });

  // @element 05
  // 05 ステディカム: 低い周波数の小さなうねりだけで、なめらかに前進しながら人物を追う（#034 手持ちの細かい揺れとの違い）
  CELLS[4] = shot((k, w, h, u) => {
    const v = 8 / CYC, z = u * v, T = u * 2 * Math.PI / CYC;   // 1周で8m進む＝格子（2m）と木（8m）の並びが継ぎ目なく戻る
    const c = cam({ z, y: 1.45 + 0.035 * Math.sin(T * 2), x: 0.05 * Math.sin(T), yaw: 0.012 * Math.sin(T + 1), roll: 0.006 * Math.sin(T * 2 + 0.5), pitch: -0.02 });
    const ex = [], L = 8, base = Math.floor(z / L) * L;
    for (let i = 0; i < 10; i++) { const zz = base + i * L; ex.push([-5, 0, zz + 2, (kk, s) => tree(kk, s, 3.6)]); ex.push([5, 0, zz + 6, (kk, s) => tree(kk, s, 3.2, C.blueXL)]); }
    world(k, w, h, c, { buildings: false, trees: false, extra: ex, mtnZ: z, sun: [30, 30, z + 170], gridX: 20, person: { z: z + 5, walk: T * 5 } });
    return 'STEADICAM';
  });

  // @element 06
  // 06 フォローショット: 蛇行して歩く人物の後ろを、少し遅れて同じ道筋でついていく（#029 トラッキングは真横に並ぶ）
  CELLS[5] = shot(camCell((k, w, h, p) => {
    const path = s => [1.8 * Math.sin(s * 2.2), 4 + s * 9];
    const [px, pz] = path(p), [cx, cz] = path(p - 0.4);
    world(k, w, h, cam({ x: cx, z: cz, y: 1.5, yaw: Math.atan2(px - cx, pz - cz) }), { person: { x: px, z: pz, walk: p * 30 }, fg: [[-2.4, 7], [2.6, 9.5, 'rock'], [-1.5, 12]] });
  }, p => `FOLLOW ${Math.hypot(1.8 * Math.sin(p * 2.2) - 1.8 * Math.sin((p - 0.4) * 2.2), 3.6).toFixed(1)}m`, 0.3, 4.2));

  // @element 07
  // 07 ロックオフ: 三脚で固定したカメラの前を人物が横切り、奥を車が通る。カメラは1pxも動かない（#040 フリーズフレームは映像が止まる）
  CELLS[6] = shot((k, w, h, u) => {
    const q = u / CYC;
    world(k, w, h, cam({ y: 1.4 }), {
      person: { x: lerp(-6.2, 6.2, q), z: 6.5, walk: u * 7 },
      extra: [[lerp(16, -16, q), 0, 15, (kk) => { kk.fillStyle = C.g4; rr(kk, -1.9, 0.35, 3.8, 0.75, 0.25); kk.fill(); rr(kk, -1.1, 0.95, 2.1, 0.62, 0.28); kk.fill(); kk.fillStyle = C.ink; [-1.15, 1.15].forEach(x => { kk.beginPath(); kk.arc(x, 0.34, 0.34, 0, 7); kk.fill(); }); }]],
      after: (kk) => {   // 三脚の印（左下）
        kk.strokeStyle = C.g4; kk.lineWidth = 2.2; kk.lineCap = 'round'; const x = -w / 2 + 38, y = h / 2 - 20;
        kk.beginPath(); kk.moveTo(x, y - 30); kk.lineTo(x - 12, y); kk.moveTo(x, y - 30); kk.lineTo(x + 12, y); kk.moveTo(x, y - 30); kk.lineTo(x, y - 2); kk.stroke();
        kk.fillStyle = C.g4; rr(kk, x - 9, y - 42, 18, 12, 3); kk.fill();
      }
    });
    return 'LOCKED';
  });

  // @element 08
  // 08 フライスルー: 壁の窓へ向かって飛び、通り抜けて向こうの場所へ出る（#035 FPV は木の間を抜けていく）
  CELLS[7] = shot(camCell((k, w, h, p) => {
    const z = lerp(0, 12.5, p), WZ = 8;
    world(k, w, h, cam({ z, y: 1.3 }), {
      buildings: true, person: { x: 0.3, z: 14.5 },
      extra: [[0, 0, WZ, (kk, s) => {   // 窓のあいた壁（偶奇塗り）
        kk.fillStyle = C.g1; kk.beginPath(); kk.rect(-40, 0, 80, 14); kk.rect(-1.2, 0.15, 2.4, 2.2); kk.fill('evenodd');
        kk.strokeStyle = C.g3; kk.lineWidth = 1.6 / s; kk.strokeRect(-1.2, 0.15, 2.4, 2.2);
        kk.strokeStyle = C.g2; kk.lineWidth = 1.2 / s; kk.beginPath(); kk.moveTo(-40, 14); kk.lineTo(40, 14); kk.stroke();
      }]]
    });
  }, p => { const d = 8 - lerp(0, 12.5, p); return d > 0 ? `窓まで ${d.toFixed(1)}m` : '通過'; }, 0.5, 3.6));

  // @element 09
  // 09 ローアングル: カメラを地面近くに下げ、見上げる。人物が大きく、建物が高く見える
  CELLS[8] = shot(camCell((k, w, h, p) => world(k, w, h, cam({ y: lerp(1.5, 0.35, p), pitch: lerp(0, 0.32, p) }), { person: { z: 4.5 }, tower: [-3, 22] }),
    p => `↗ ${Math.round(lerp(0, 0.32, p) * 57.3)}° · ${lerp(1.5, 0.35, p).toFixed(1)}m`, 0.6, 2.2));

  // @element 10
  // 10 ハイアングル: カメラを高い位置へ上げ、見下ろす。人物が小さく見える（#031 クレーンアップは上がり続けて全体を見せる）
  CELLS[9] = shot(camCell((k, w, h, p) => world(k, w, h, cam({ y: lerp(1.5, 4.5, p), pitch: lerp(0, -0.5, p) }), { person: { z: 5 } }),
    p => `↘ ${Math.round(lerp(0, 0.5, p) * 57.3)}° · ${lerp(1.5, 4.5, p).toFixed(1)}m`, 0.6, 2.2));

  // @element 11
  // 11 POVショット: 登場人物の目で見た画。歩く上下動と画面下の両手で一人称だと分かる。前の人物が振り向いて手を振る
  CELLS[10] = shot(camCell((k, w, h, p, u) => {
    const z = lerp(0, 3.2, p), T = u * 2 * Math.PI / CYC;
    const bob = Math.sin(T * 6) * 0.03 * (p > 0 && p < 1 ? 1 : 0);
    world(k, w, h, cam({ z, y: 1.6 + bob, roll: Math.sin(T * 3) * 0.008 * (p > 0 && p < 1 ? 1 : 0) }), {
      person: { z: 7.5, armUp: u > 1.6 && u < 3.4, walk: 0 }, fg: [[-1.8, 2.6], [2.2, 3.8]],
      after: (kk) => {   // 両手（画面の下の両端から入る。体と一緒に動くので、揺れるのは世界のほう）
        kk.fillStyle = C.blue;
        [-1, 1].forEach(sx => { kk.save(); kk.translate(sx * 178, 64); kk.rotate(sx * -0.5); kk.fillStyle = C.blue; rr(kk, -34, -28, 68, 120, 30); kk.fill(); if (sx > 0) { kk.fillStyle = '#FFFFFF'; rr(kk, -17, -62, 34, 54, 6); kk.fill(); kk.strokeStyle = C.blue; kk.lineWidth = 3; rr(kk, -17, -62, 34, 54, 6); kk.stroke(); } kk.restore(); });
      }
    });
  }, p => 'POV', 0.3, 4.2));

  // @element 12
  // 12 オーバーザショルダー: 手前の人物の肩と後頭部を画面の端に入れ、肩越しに相手を撮る。手前はぼけ、相手にピント
  CELLS[11] = shot(camCell((k, w, h, p, u) => {
    world(k, w, h, cam({ z: lerp(0, 0.35, p), y: 1.55, yaw: 0.05 }), {
      person: { x: 0.32, z: 3.1, walk: 0.35 * Math.sin(u * 5) }, blurFg: 2.6,
      extra: [[-0.62, 0, 1.15, (kk) => { kk.fillStyle = C.g4; kk.beginPath(); kk.arc(0, 1.63, 0.17, 0, 7); kk.fill(); rr(kk, -0.34, 0.9, 0.68, 0.6, 0.14); kk.fill(); }, true]]
    });
  }, p => 'OTS'));

  // @element 13
  // 13 バーズアイ: 真上（ピッチ -90°）から真下を見る。道・人・車・木がすべて上から見た形になる（10 ハイアングルは斜めから）
  CELLS[12] = shot(camCell((k, w, h, p) => {
    const c = cam({ y: lerp(9, 15, p), pitch: -Math.PI / 2 });
    const ex = [[0, 0, 0, (kk, s) => {   // 地面（格子と道）を1枚のスプライトとして描く
      kk.fillStyle = C.g1; kk.fillRect(-1.6, -16, 3.2, 32);
      kk.strokeStyle = C.grid; kk.lineWidth = 1.3 / s; kk.beginPath();
      for (let i = -16; i <= 16; i += 2) { kk.moveTo(i, -16); kk.lineTo(i, 16); kk.moveTo(-16, i); kk.lineTo(16, i); }
      kk.stroke();
      kk.strokeStyle = '#FFFFFF'; kk.lineWidth = 2 / s; kk.setLineDash([0.6, 0.6]); kk.beginPath(); kk.moveTo(0, -16); kk.lineTo(0, 16); kk.stroke(); kk.setLineDash([]);
    }]];
    [[-4.5, -2.5, 1.0], [-5.5, 1.8, 1.2], [4.6, -0.6, 1.1], [5.2, 3.2, 0.9], [-4.2, 5.5, 1.0], [4.9, -4.4, 1.0]].forEach(([x, z, r]) => ex.push([x, 0, z, (kk) => { kk.fillStyle = C.g2; kk.beginPath(); kk.arc(0, 0, r, 0, 7); kk.fill(); kk.fillStyle = C.g3; kk.beginPath(); kk.arc(0, 0, 0.12, 0, 7); kk.fill(); }]));
    [[-8.5, -3, 3, 2.4], [8.6, 1, 3.4, 2.8], [-8.3, 2.5, 2.6, 2]].forEach(([x, z, bw, bd]) => ex.push([x, 0, z, (kk, s) => { kk.fillStyle = C.g1; kk.fillRect(-bw / 2, -bd / 2, bw, bd); kk.strokeStyle = C.g3; kk.lineWidth = 1.4 / s; kk.strokeRect(-bw / 2, -bd / 2, bw, bd); }]));
    ex.push([-0.8, 0, lerp(3.4, -3.4, p), (kk) => { kk.fillStyle = C.blue; rr(kk, -0.9, -2, 1.8, 4, 0.4); kk.fill(); kk.fillStyle = '#FFFFFF'; kk.fillRect(-0.7, 0.3, 1.4, 0.8); kk.fillRect(-0.7, -1.2, 1.4, 0.6); }]);
    ex.push([0.9, 0, lerp(-2.6, 2.6, p), (kk) => { kk.fillStyle = C.blue; kk.beginPath(); kk.ellipse(0, 0, 0.24, 0.12, 0, 0, 7); kk.fill(); kk.beginPath(); kk.arc(0, 0, 0.16, 0, 7); kk.fill(); }]);
    world(k, w, h, c, { grid: false, mountains: false, buildings: false, trees: false, sun: null, extra: ex });
  }, p => `↓ 90° · ${lerp(9, 15, p).toFixed(0)}m`));

  // @element 14
  // 14 ディープフォーカス: 手前の花から奥の建物まで、全部に同時にピントが合う（#033 ラックフォーカスは片方ずつ）
  CELLS[13] = shot(camCell((k, w, h, p) => {
    world(k, w, h, cam({ y: 1.1 }), {
      person: { x: 0.9, z: 9 }, blurFg: 5 * (1 - p), blurBg: 6 * (1 - p),
      extra: [[-0.75, 0, 2.0, (kk, s) => { kk.fillStyle = C.g3; kk.fillRect(-0.025, 0, 0.05, 0.75); kk.fillStyle = C.blueM; for (let i = 0; i < 6; i++) { kk.beginPath(); kk.ellipse(Math.cos(i) * 0.09, 0.8 + Math.sin(i) * 0.09, 0.08, 0.05, i, 0, 7); kk.fill(); } kk.fillStyle = C.blue; kk.beginPath(); kk.arc(0, 0.8, 0.05, 0, 7); kk.fill(); }, true]],
      after: (kk, cc) => {   // ピントの枠を手前と奥の両方に（合うにつれて濃く）
        kk.globalAlpha = p; kk.strokeStyle = C.blue; kk.lineWidth = 2; kk.beginPath();
        [[proj(cc, -0.75, 0.8, 2.0), 46], [proj(cc, 0.9, 0.9, 9), 30]].forEach(([q, r]) => [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { kk.moveTo(q.x + sx * r, q.y + sy * r - sy * 9); kk.lineTo(q.x + sx * r, q.y + sy * r); kk.lineTo(q.x + sx * r - sx * 9, q.y + sy * r); }));
        kk.stroke(); kk.globalAlpha = 1;
      }
    });
  }, p => { const a = lerp(1.8, 16, p); return `f/${a < 10 ? a.toFixed(1) : Math.round(a)}`; }));

  // @element 15
  // 15 エスタブリッシングショット: 広角・高い位置から街全体を見せる引きの画。ゆっくり寄りながら場所の表示が出る
  CELLS[14] = shot(camCell((k, w, h, p, u) => {
    const clouds = [[-30, 20, 110, 2.6], [20, 26, 150, 3.2], [60, 17, 95, 2]];
    world(k, w, h, cam({ f: 220, y: 4.5, pitch: -0.06, z: lerp(-5, -2.5, p) }), { city: true, clouds, tower: [16, 36], person: { x: -1, z: 12 } });
    const a = P(u, 0.9, 1.3);   // 場所の表示（左下）
    if (a > 0) { k.save(); k.globalAlpha = a; k.translate(30, h - 52 + (1 - a) * 8); k.fillStyle = 'rgba(255,255,255,.9)'; rr(k, 0, 0, 158, 30, 6); k.fill(); k.fillStyle = C.blue; k.fillRect(0, 0, 4, 30); txt(k, 'EXT. CITY – DAY', 14, 15.5, `600 14px ${MONO}`, C.ink, 'left', 'middle'); k.restore(); }
  }, p => `${mm(220)} WIDE`, 0.3, 4.2));

  // @element 16
  // 16 エクストリームクローズアップ: 顔のクローズアップから、目だけが画面を埋めるまで寄る
  CELLS[15] = shot(camCell((k, w, h, p) => {
    const f = 610 * Math.pow(2040 / 610, p);
    world(k, w, h, cam({ f, x: -0.06, y: 1.66 }), {
      blurBg: 3, trees: true,
      extra: [[0, 0, 1.3, (kk) => {   // 目のある顔
        person(kk, 1);
        [[-0.06, 1.66], [0.06, 1.66]].forEach(([x, y]) => { kk.fillStyle = '#FFFFFF'; kk.beginPath(); kk.ellipse(x, y, 0.045, 0.028, 0, 0, 7); kk.fill(); kk.fillStyle = C.ink; kk.beginPath(); kk.arc(x + 0.008, y, 0.016, 0, 7); kk.fill(); kk.fillStyle = '#FFFFFF'; kk.beginPath(); kk.arc(x + 0.014, y + 0.007, 0.005, 0, 7); kk.fill(); kk.strokeStyle = '#FFFFFF'; kk.lineWidth = 0.012; kk.beginPath(); kk.arc(x, y + 0.02, 0.05, Math.PI * 1.15, Math.PI * 1.85); kk.stroke(); });
      }]]
    });
  }, p => `${mm(610 * Math.pow(2040 / 610, p))} ${p > 0.85 ? 'ECU' : 'CU'}`));

  // @element 17
  // 17 インサートショット: 同じ場面の細部（手元の時計）を1.3秒だけ差し込み、元の画に戻る
  const INS = [1.6, 2.9];
  CELLS[16] = shot((k, w, h, u) => {
    const ins = u >= INS[0] && u < INS[1];
    if (!ins) world(k, w, h, cam({ y: 1.4 }), { person: { x: -0.6, z: 6, walk: 0 }, fg: [[2.2, 4]], after: (kk, cc) => { const q = proj(cc, -0.35, 1.08, 6); kk.fillStyle = C.ink; kk.beginPath(); kk.arc(q.x, q.y, 1.6 * q.s / 10, 0, 7); kk.fill(); } });
    else {   // 手首の時計の大写し
      k.save(); k.translate(w / 2, h / 2);
      k.fillStyle = C.blueXL; k.fillRect(-w, -h, w * 2, h * 2);
      k.fillStyle = C.blue; k.save(); k.rotate(-0.35); rr(k, -300, -46, 600, 92, 30); k.fill(); k.restore();
      k.fillStyle = '#FFFFFF'; k.beginPath(); k.arc(0, 0, 58, 0, 7); k.fill(); k.strokeStyle = C.ink; k.lineWidth = 5; k.stroke();
      k.strokeStyle = C.ink; k.lineWidth = 4; k.lineCap = 'round'; k.beginPath(); k.moveTo(0, 0); k.lineTo(0, -34); k.moveTo(0, 0); k.lineTo(26, 14); k.stroke();
      const a = (u - INS[0]) / (INS[1] - INS[0]) * Math.PI * 2 - Math.PI / 2;   // 秒針が1周
      k.strokeStyle = C.blue; k.lineWidth = 2; k.beginPath(); k.moveTo(0, 0); k.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); k.stroke();
      k.restore();
    }
    strip(k, w, h, [[0, INS[0], 'A', C.g2], [INS[0], INS[1], '細部', C.blue], [INS[1], CYC, 'A', C.g2]], u);
    return ins ? 'INSERT' : 'SHOT A';
  });

  // @element 18
  // 18 モーフカット: 同じ人物の2テイクを、位置と姿勢をなめらかに補間してつなぐ（#041 ジャンプカットは飛ぶ）
  CELLS[17] = shot((k, w, h, u) => {
    const T0 = 2.0, T1 = 2.45, r = P(u, CYC - RESET, CYC);
    const draw = (kk, t) => {
      const q = eIOs(P(t, T0, T1));
      // テイク1とテイク2は姿勢が違う。モーフ中は同じ（補間した）位置に2つの姿勢を重ねて溶かす
      const pose = (k2, m) => world(k2, w, h, cam({ y: 1.45, z: 0 }), { person: { x: lerp(-0.4, 0.35, q), z: 3.3, walk: (m ? 0.55 : -0.45) + 0.12 * Math.sin(t * 3) }, trees: true, buildings: true });
      const bl = Math.sin(q * Math.PI) * 2.2;
      kk.save(); kk.filter = bl > 0.05 ? `blur(${bl.toFixed(2)}px)` : 'none';
      blend(kk, k2 => pose(k2, false), k2 => pose(k2, true), q);
      kk.restore();
      strip(kk, w, h, [[0, T0, 'テイク1', C.g2], [T0, T1, '', C.blue], [T1, CYC, 'テイク2', C.g2]], t);
    };
    blend(k, kk => draw(kk, u), kk => draw(kk, 0), eIOs(r));
    return r > .5 || u < T0 ? 'TAKE 1' : u < T1 ? 'MORPH' : 'TAKE 2';
  });

  // @shared
  // ---- 切り替え: 奇数サイクルは B→A に戻る（リセット不要）
  const sceneA = (k, w, h, extra = {}) => world(k, w, h, cam(Object.assign({ y: 1.4 }, extra.cam)), Object.assign({ person: { x: -0.6, z: 7 } }, extra));
  const CAR = [1.2, 0, 9, (kk) => { kk.fillStyle = C.blue; rr(kk, -1.9, 0.35, 3.8, 0.75, 0.25); kk.fill(); rr(kk, -1.1, 0.95, 2.1, 0.62, 0.28); kk.fill(); kk.fillStyle = '#FFFFFF'; kk.fillRect(-0.85, 1.08, 0.8, 0.36); kk.fillRect(0.12, 1.08, 0.7, 0.36); kk.fillStyle = C.ink; [-1.15, 1.15].forEach(x => { kk.beginPath(); kk.arc(x, 0.34, 0.34, 0, 7); kk.fill(); }); }];
  const SB = { city: true, mountains: false, trees: false, sun: [-26, 40, 150], extra: [CAR] };
  const sceneB = (k, w, h, extra = {}) => world(k, w, h, cam(Object.assign({ y: 1.6, pitch: 0.1 }, extra.cam)), Object.assign({}, SB, extra));
  function abCell(trans, hudFn) {
    return (k, w, h, u, cyc) => {
      const S = cyc % 2 === 0 ? [sceneA, sceneB] : [sceneB, sceneA];
      trans(k, w, h, u, S[0], S[1], cyc);
      return hudFn ? hudFn(u, cyc) : (cyc % 2 === 0 ? 'A → B' : 'B → A');
    };
  }

  // @element 19
  // 19 フェードアウト: 画面全体が黒へ沈んで終わり、黒から次の場面が明けてくる
  CELLS[18] = shot(abCell((k, w, h, u, A, B) => {
    const out = eIOs(P(u, 1.4, 2.6)), inn = eIOs(P(u, 3.1, 4.3));
    if (u < 2.9) A(k, w, h); else B(k, w, h);
    const a = u < 2.9 ? out : 1 - inn;
    if (a > 0) { k.fillStyle = `rgba(20,20,24,${a.toFixed(3)})`; k.fillRect(0, 0, w, h); }
  }, u => u < 2.9 ? 'FADE OUT' : 'FADE IN'));

  // @element 20
  // 20 アイリスアウト: 人物を中心に丸い窓が閉じて黒になり、次の場面は丸い窓が開いて現れる
  CELLS[19] = shot(abCell((k, w, h, u, A, B) => {
    const out = eIOs(P(u, 1.3, 2.7)), inn = eIOs(P(u, 3.1, 4.4));
    const first = u < 2.9, cur = first ? A : B;
    cur(k, w, h);
    // 窓の中心は、いま映っている場面の主役（Aは人物の頭、Bは車）
    const c = cur === sceneA ? proj(cam({ y: 1.4 }), -0.6, 1.63, 7) : proj(cam({ y: 1.6, pitch: 0.1 }), 1.2, 0.9, 9);
    const rad = first ? lerp(340, 0, out) : lerp(0, 340, inn);
    const cx = w / 2 + c.x, cy = h / 2 + c.y;
    if (rad < 339) {
      k.fillStyle = '#141418'; k.beginPath(); k.rect(0, 0, w, h); k.arc(cx, cy, Math.max(0, rad), 0, Math.PI * 2, true); k.fill('evenodd');
      if (rad > 1) { k.strokeStyle = C.blue; k.lineWidth = 2; k.beginPath(); k.arc(cx, cy, rad, 0, 7); k.stroke(); }
    }
  }, u => u < 2.9 ? 'IRIS OUT' : 'IRIS IN'));

  // @element 21
  // 21 カットアウェイ: 話す人物から、別の対象（聞いている客席）へ切り替えて戻る。17 インサートは同じ場面の細部
  const CUT = [1.7, 3.0];
  CELLS[20] = shot((k, w, h, u) => {
    const away = u >= CUT[0] && u < CUT[1];
    if (!away) world(k, w, h, cam({ y: 1.4 }), { person: { x: 0, z: 5.5, walk: 0.45 * Math.sin(u * 6) }, extra: [[0.9, 0, 5.6, (kk) => { kk.fillStyle = C.g3; kk.fillRect(-0.3, 0, 0.6, 1.1); kk.fillRect(-0.4, 1.05, 0.8, 0.1); }]] });
    else {
      const t = u - CUT[0], ex = [];
      [[-1.6, 3.2], [-0.2, 3.6], [1.3, 3.1], [0.6, 4.4], [-1.1, 4.6]].forEach(([x, z], i) => ex.push([x, 0, z, (kk) => { kk.save(); kk.translate(0, Math.abs(Math.sin(t * 9 + i)) * 0.05); person(kk, 1, { armUp: true, col: i % 2 ? C.blue : C.blueM }); kk.restore(); }]));
      world(k, w, h, cam({ y: 1.6, pitch: -0.08 }), { buildings: false, trees: false, mountains: false, sun: null, extra: ex });
    }
    strip(k, w, h, [[0, CUT[0], 'A', C.g2], [CUT[0], CUT[1], '別の対象', C.blue], [CUT[1], CYC, 'A', C.g2]], u);
    return away ? 'CUTAWAY' : 'SHOT A';
  });

  // @element 22
  // 22 クロスカッティング: 同時に進む2つの場面（走る人物・走る車）を、だんだん短く交互に見せる
  const XC = [0, 1.1, 2.0, 2.7, 3.3, 3.8, 4.2, 4.5, CYC];
  CELLS[21] = shot((k, w, h, u) => {
    const r = P(u, CYC - 0.3, CYC);
    const runA = (kk, t) => world(kk, w, h, cam({ y: 1.3 }), { person: { x: -0.3, z: lerp(15, 4.5, t / CYC), walk: t * 12 }, fg: [[-2.2, 3.5], [-2.2, 6.5], [-2.2, 9.5], [-2.2, 12.5]] });
    const carB = (kk, t) => world(kk, w, h, cam({ y: 1.6, pitch: 0.06 }), { city: true, mountains: false, trees: false, sun: [-26, 40, 150], extra: [[1.0, 0, lerp(17, 4.5, t / CYC), CAR[3]]] });
    let i = 0; while (u >= XC[i + 1]) i++;
    const isA = i % 2 === 0;
    blend(k, kk => (isA ? runA : carB)(kk, u), kk => runA(kk, 0), eIOs(r));   // 最後の0.3秒で A の開始状態へ戻す
    const segs = []; for (let j = 0; j < XC.length - 1; j++) segs.push([XC[j], XC[j + 1], j % 2 ? 'B' : 'A', j % 2 ? C.blue : C.g2]);
    strip(k, w, h, segs, u);
    return r > .5 || isA ? 'SCENE A' : 'SCENE B';
  });

  // @shared
  // 跳躍の高さと、舞い落ちる葉（23 で使う）
  function jumpY(q) { return q <= 0 || q >= 1 ? 0 : 4 * q * (1 - q) * 1.1; }
  function leaves(u, speed) { const ex = []; for (let i = 0; i < 9; i++) { const ph = mod(u * speed / 4.7 + i / 9, 1); ex.push([-3 + i * 0.75 + Math.sin(i * 3) * 0.3, 3.4 - ph * 3.4, 6 + (i % 3), (kk) => { kk.fillStyle = i % 2 ? C.blueM : C.g3; kk.save(); kk.rotate(ph * 6 + i); kk.beginPath(); kk.ellipse(0, 0, 0.09, 0.045, 0, 0, 7); kk.fill(); kk.restore(); }]); } return ex; }

  // @element 23
  // 23 バレットタイム: 跳躍の頂点で時間がほぼ止まり、その間にカメラが人物の周りを回り込む（#030 オービットは時間が止まらない）
  CELLS[22] = shot((k, w, h, u, cyc) => {
    const T0 = 1.5, T1 = 3.3, SLOW = 0.1;
    const tj = u < T0 ? u : u < T1 ? T0 + (u - T0) * SLOW : u - (T1 - T0) * (1 - SLOW);   // 実時間→映像時間
    const q = P(tj, 0.6, 2.6), e = eIO(P(u, T0, T1));
    const a = cyc % 2 === 0 ? lerp(-0.6, 0.6, e) : lerp(0.6, -0.6, e), R = 6, P0 = [0, 0, 9];
    const c = cam({ x: P0[0] + Math.sin(a) * R, z: P0[2] - Math.cos(a) * R, yaw: -a, y: 1.6, pitch: -0.05 });
    world(k, w, h, c, {
      person: { z: 9, y: jumpY(q), armUp: q > 0 && q < 1, face: a }, ring: [0, 9, 10], trees: false, extra: leaves(tj, 1.5).map(l => [l[0], l[1], l[2] + 3, l[3]]),
      after: (kk, cc) => { kk.strokeStyle = C.blueM; kk.lineWidth = 2; kk.setLineDash([5, 5]); kk.beginPath(); for (let i = 0; i <= 48; i++) { const b = i / 48 * Math.PI * 2; const qq = proj(cc, Math.sin(b) * 1.3, 0, 9 + Math.cos(b) * 1.3); i ? kk.lineTo(qq.x, qq.y) : kk.moveTo(qq.x, qq.y); } kk.stroke(); kk.setLineDash([]); }
    });
    return u >= T0 && u < T1 ? `BULLET ×${SLOW.toFixed(1)}` : '×1.0';
  });

  // @element 24
  // 24 モンタージュ: 7つの短いカットで30日分の練習を見せる。つなぎは直結、右上に日付
  const MT = [
    [0.75, 1, (kk, w, h, t) => world(kk, w, h, cam({ x: t * 2.2 - 1, y: 1.3 }), { person: { x: t * 2.2 - 1, z: 6, walk: t * 14 }, fg: [[-3, 4], [-1.4, 4], [0.2, 4], [1.8, 4], [3.4, 4]] })],
    [0.7, 3, (kk, w, h, t) => world(kk, w, h, cam({ y: 1.3 }), { person: { z: 7, y: jumpY(P(t, 0.05, 0.7)), armUp: true }, buildings: false })],
    [0.65, 7, (kk, w, h, t) => world(kk, w, h, cam({ y: 1.6, pitch: 0.1 }), { sun: [20, lerp(4, 12, t / 0.65), 170], sunCol: C.blueM, buildings: false, trees: false, clouds: [[-30, 20, 110, 2.6], [40, 26, 150, 3.2]] })],
    [0.65, 12, (kk, w, h, t) => world(kk, w, h, cam({ y: 0.5, pitch: 0.25 }), { person: { z: 4.5, armUp: true }, tower: [-3, 22] })],
    [0.65, 20, (kk, w, h, t) => world(kk, w, h, cam({ y: 1.5, f: 420 }), { city: true, mountains: false, person: { z: 7, walk: t * 9, x: -0.5 + t * 0.6 } })],
    [0.6, 28, (kk, w, h, t) => { const a = lerp(-0.3, 0.3, t / 0.6); world(kk, w, h, cam({ x: Math.sin(a) * 6, z: 9 - Math.cos(a) * 6, yaw: -a, y: 1.7, pitch: -0.07 }), { person: { z: 9, face: a }, ring: [0, 9, 10], trees: false }); }],
    [0.7, 30, (kk, w, h, t) => world(kk, w, h, cam({ y: 1.4 }), { person: { z: 6, armUp: true }, extra: [[1.4, 0, 6.3, (k2) => { k2.fillStyle = C.g4; k2.fillRect(-0.04, 0, 0.08, 2.6); k2.fillStyle = C.blue; k2.beginPath(); k2.moveTo(0.04, 2.6); k2.lineTo(0.9, 2.3); k2.lineTo(0.04, 2.0); k2.fill(); }]] })],
  ];
  CELLS[23] = shot((k, w, h, u) => {
    let i = 0, t0 = 0; while (i < MT.length - 1 && u >= t0 + MT[i][0]) { t0 += MT[i][0]; i++; }
    const r = P(u, CYC - 0.3, CYC);
    blend(k, kk => MT[i][2](kk, w, h, u - t0), kk => MT[0][2](kk, w, h, 0), eIOs(r));   // 最後の0.3秒で最初のカットへ戻す
    const segs = []; let s = 0; MT.forEach(([d, day], j) => { segs.push([s, s + d, '', j === i ? C.blue : C.g2]); s += d; });
    strip(k, w, h, segs, u);
    return `DAY ${r > .5 ? MT[0][1] : MT[i][1]}`;
  });

  // @end
  return { width: CW, height: CH, cycle: CYC * 2, cells: CELLS, fonts: [] };
});
