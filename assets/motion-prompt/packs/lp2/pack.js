/* Motion Prompt · pack "lp2" · MIT License (c) 2026 Shohei Ohtaki · https://github.com/showheyohtaki/motion-prompt */
MotionPrompt.pack('lp2', function () {
  // @kit
  // LP・Webサイトの演出の名前 第2弾 24（各カード 539x208・1つの動きは4.7秒、パックの周期は9.4秒。各コマは時間 u の純関数）
  // カードの中にブラウザの窓を1つ描き、その中の簡略化したページで演出を見せる。
  // きっかけ（スクロールバー・カーソル・クリック）も一緒に描く。色は 地・文字・差し色（朱）＋写真用の青。
  const CW = 539, CH = 208;
  const CYC = 4.7;                                   // 1つの動きは4.7秒
  const LOOP = CYC * 2;                              // パックの周期は9.4秒。各カードは4.7秒の動きを2回、カウントダウン（20）だけ9.4秒で1回（ループの継ぎ目なし）
  const C = {
    desk: '#F6F5F7', win: '#FFFFFF', bar: '#F1F0F2', rule: '#C2C0C7', ink: '#0B0B0F', sub: '#62616C',
    faint: '#DAD9DE', soft: '#F2F1F3', skel: '#DEDEE2', acc: '#0B0B0F', accL: '#D6C2FF', blue: '#393840', blueL: '#DED8E8'
  };
  const JP = '"MotionCatalogSC", "Noto Sans SC", sans-serif';
  const EN = '"MotionCatalogSC", "Noto Sans SC", sans-serif';
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const P = (t, a, b) => clamp((t - a) / (b - a));
  const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;   // easeInOut（3乗）
  const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;      // easeInOut（2乗）
  const eOut = x => 1 - Math.pow(1 - x, 3);                                      // easeOut（3乗）
  const eIn = x => x * x * x;
  const mod = (a, n) => ((a % n) + n) % n;
  // 浮動小数の誤差で周期の終わり（4.6999…）と始まり（0）が別のコマ扱いになるのを防ぎ、u を 0〜4.7秒に折り返す
  const snapU = u => mod(Math.round(u * 1e6) / 1e6, CYC);
  // GSAP の elastic.out(1, 0.3) と同じ式
  const eEl = x => x <= 0 ? 0 : x >= 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x - 0.075) * 2 * Math.PI / 0.3) + 1;
  function rr(k, x, y, w, h, r) { k.beginPath(); k.roundRect(x, y, w, h, r); }
  function txt(k, s, x, y, font, col, align = 'left', base = 'alphabetic', ls = '0px') {
    k.font = font; k.fillStyle = col; k.textAlign = align; k.textBaseline = base; k.letterSpacing = ls; k.fillText(s, x, y); k.letterSpacing = '0px';
  }
  // キーフレーム [[秒, 値], …] を easeInOut（3乗）でつなぐ。u は周期で折り返す
  function steps(keys, u) {
    u = mod(u, CYC);
    if (u <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const [t0, a] = keys[i - 1], [t1, b] = keys[i]; return lerp(a, b, eIO((u - t0) / (t1 - t0))); }
    return keys[keys.length - 1][1];
  }
  // カーソルの通り道 [[秒, x, y], …]（easeInOut 3乗でつなぐ）
  function path(keys, u) {
    u = mod(u, CYC);
    if (u <= keys[0][0]) return [keys[0][1], keys[0][2]];
    for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const a = keys[i - 1], b = keys[i], f = eIO((u - a[0]) / (b[0] - a[0])); return [lerp(a[1], b[1], f), lerp(a[2], b[2], f)]; }
    const l = keys[keys.length - 1]; return [l[1], l[2]];
  }
  // on(t) が最後に切り替わった時刻から dur 秒の遷移（CSS の transition と同じ考え方）。過去へさかのぼって調べる
  function trans(on, u, dur, ease = eOut) {
    const s = on(u);
    for (let i = 0, t = u; i < 600; i++, t -= 1 / 120) if (on(t - 1 / 120) !== s) { const q = ease(P(u, t, t + dur)); return s ? q : 1 - q; }
    return s ? 1 : 0;
  }
  // ブラウザの窓。中のページは V（511x168）の座標で描く
  const WIN = { x: 14, y: 8, w: 511, h: 192, r: 10, bar: 24 };
  const VW = WIN.w, VH = WIN.h - WIN.bar;
  function frame(k, url = 'example.com') {
    k.fillStyle = C.desk; k.fillRect(0, 0, CW, CH);
    k.save(); k.shadowColor = 'rgba(11,11,15,.16)'; k.shadowBlur = 16; k.shadowOffsetY = 4;
    k.fillStyle = C.win; rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.fill(); k.restore();
    k.save(); rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.strokeStyle = C.ink; k.lineWidth = 6; k.stroke(); k.restore();
    k.save(); rr(k, WIN.x, WIN.y, WIN.w, WIN.h, WIN.r); k.clip();
    k.fillStyle = C.bar; k.fillRect(WIN.x, WIN.y, WIN.w, WIN.bar); k.fillStyle = C.rule; k.fillRect(WIN.x, WIN.y + WIN.bar - 1, WIN.w, 1); k.restore();
    for (let i = 0; i < 3; i++) { k.fillStyle = '#D8D6DE'; k.beginPath(); k.arc(WIN.x + 15 + i * 12, WIN.y + 12, 3.6, 0, 7); k.fill(); }
    k.fillStyle = '#EFEEF1'; rr(k, WIN.x + WIN.w / 2 - 110, WIN.y + 5, 220, 14, 7); k.fill();
    txt(k, url, WIN.x + WIN.w / 2, WIN.y + 12.5, `500 9.5px ${EN}`, C.sub, 'center', 'middle');
  }
  function view(k, fn) {
    k.save(); rr(k, WIN.x, WIN.y + WIN.bar, VW, VH, [0, 0, WIN.r, WIN.r]); k.clip(); k.translate(WIN.x, WIN.y + WIN.bar);
    k.fillStyle = '#FFFFFF'; k.fillRect(0, 0, VW, VH); fn(); k.restore();
  }
  // スクロールバー（つまみだけ。pos 0〜1、ratio＝見えている割合）
  function sbar(k, pos, ratio = 0.42) { const th = (VH - 8) * ratio; k.fillStyle = 'rgba(11,11,15,.38)'; rr(k, VW - 9, 4 + (VH - 8 - th) * clamp(pos), 5, th, 2.5); k.fill(); }
  // 文字の代わりの棒（n 行。最後の行は短い）
  function bars(k, x, y, w, n, col = C.faint, hh = 6, gap = 11, last = 0.62) {
    k.fillStyle = col; for (let i = 0; i < n; i++) { rr(k, x, y + i * gap, i === n - 1 && n > 1 ? w * last : w, hh, hh / 2); k.fill(); }
  }
  // 写真の代わりの絵（空・太陽・山）。v で色ちがい、z で中身だけ拡大（枠は固定）
  const PICS = [
    { sky: ['#D8D6DE', '#EFEEF1'], sun: '#0B0B0F', sx: .74, sy: .32, m1: '#A6A3AE', m2: '#A6A3AE' },
    { sky: ['#D8D6DE', '#EFEEF1'], sun: '#FFFFFF', sx: .28, sy: .34, m1: '#D6C2FF', m2: '#D6C2FF' },
    { sky: ['#62616C', '#A6A3AE'], sun: '#D6C2FF', sx: .6, sy: .3, m1: '#393840', m2: '#393840' }
  ];
  const M1 = [[0, .62], [.22, .4], [.42, .56], [.66, .3], [.86, .5], [1, .42]], M2 = [[0, .8], [.28, .6], [.5, .76], [.76, .58], [1, .74]];
  function mount(k, w, h, pts, col, flip) { k.fillStyle = col; k.beginPath(); k.moveTo(flip ? w : 0, h + 1); pts.forEach(([a, b]) => k.lineTo((flip ? 1 - a : a) * w, b * h)); k.lineTo(flip ? 0 : w, h + 1); k.closePath(); k.fill(); }
  function pic(k, x, y, w, h, v = 0, r = 6, z = 1) {
    const p = PICS[v % PICS.length];
    k.save(); rr(k, x, y, w, h, r); k.clip();
    k.translate(x + w / 2, y + h / 2); k.scale(z, z); k.translate(-w / 2, -h / 2);
    const g = k.createLinearGradient(0, 0, 0, h); g.addColorStop(0, p.sky[0]); g.addColorStop(1, p.sky[1]); k.fillStyle = g; k.fillRect(-1, -1, w + 2, h + 2);
    k.fillStyle = p.sun; k.beginPath(); k.arc(w * p.sx, h * p.sy, Math.min(w, h) * 0.13, 0, 7); k.fill();
    mount(k, w, h, M1, p.m1, v % 2); mount(k, w, h, M2, p.m2, (v + 1) % 2);
    k.restore();
  }
  function btn(k, x, y, w, h, label, col = C.acc, tcol = '#FFFFFF', fs = 12) {
    k.fillStyle = col; rr(k, x, y, w, h, h / 2); k.fill(); txt(k, label, x + w / 2, y + h / 2 + 0.5, `700 ${fs}px ${JP}`, tcol, 'center', 'middle');
  }
  function logo(k, x, y, col = C.ink) { k.fillStyle = C.acc; rr(k, x, y - 7, 14, 14, 4); k.fill(); txt(k, 'SAMPLE', x + 20, y + 0.5, `800 12px ${EN}`, col, 'left', 'middle', '1px'); }
  // ページのヘッダー（高さ34）
  const NAVX = [300, 346, 392];
  function header(k, y, active = -1) {
    k.fillStyle = '#FFFFFF'; k.fillRect(0, y, VW, 34); k.fillStyle = C.rule; k.fillRect(0, y + 33, VW, 1);
    logo(k, 18, y + 17);
    ['特長', '料金', 'FAQ'].forEach((s, i) => txt(k, s, NAVX[i], y + 17.5, `600 12px ${JP}`, active === i ? C.acc : C.ink, 'left', 'middle'));
    btn(k, 428, y + 7, 70, 20, '無料で試す', C.acc, '#FFFFFF', 10.5);
  }
  // マウスのカーソル（矢印）。press で少し縮む
  function cursor(k, x, y, press = 0) {
    const s = 1.2 * (1 - 0.12 * press);
    k.save(); k.translate(x, y); k.scale(s, s); k.beginPath();
    [[0, 0], [0, 16.5], [4.2, 12.6], [7, 19], [9.8, 17.8], [7.1, 11.6], [12.6, 11.6]].forEach(([a, b], i) => i ? k.lineTo(a, b) : k.moveTo(a, b));
    k.closePath(); k.lineJoin = 'round'; k.lineWidth = 1.6; k.strokeStyle = '#FFFFFF'; k.fillStyle = C.ink; k.fill(); k.stroke(); k.restore();
  }
  // クリックした所に出る小さな輪（0.35秒）と、押している間の縮み
  function click(k, x, y, u, times) {
    let press = 0;
    for (const tc of times) {
      const d = mod(u - tc + 0.1, CYC) - 0.1;
      if (d > -0.1 && d < 0.12) press = Math.max(press, 1 - Math.abs(d - 0.01) / 0.11);
      if (d >= 0 && d < 0.35) { const q = d / 0.35; k.strokeStyle = `rgba(11,11,15,${0.45 * (1 - q)})`; k.lineWidth = 2; k.beginPath(); k.arc(x, y, 5 + 13 * eOut(q), 0, 7); k.stroke(); }
    }
    cursor(k, x, y, clamp(press));
  }
  // 回る読み込み表示（0.8秒で1回転）
  function spinner(k, x, y, r, u, col = C.acc) {
    const a = u / 0.8 * Math.PI * 2;
    k.lineCap = 'round'; k.lineWidth = r * 0.28; k.strokeStyle = C.faint; k.beginPath(); k.arc(x, y, r, 0, 7); k.stroke();
    k.strokeStyle = col; k.beginPath(); k.arc(x, y, r, a, a + Math.PI * 0.6); k.stroke(); k.lineCap = 'butt';
  }
  // ページ上の top にある要素が、判定線 line より上に入った時刻（画面の下へ出たらリセット）。過去 CYC 秒をさかのぼる
  function enteredAt(sy, top, line, u) {
    const dt = 1 / 120, y = t => top - sy(t);
    if (y(u) >= VH) return null;
    for (let t = u; t > u - CYC; t -= dt) {
      const a = y(t), b = y(t - dt);
      if (a >= VH) return null;
      if (a < line && b >= line) return t - dt + dt * (b - line) / (b - a);
    }
    return y(u) < line ? -1e9 : null;
  }
  // 第2弾で足した道具
  function hex(c) { if (c[0] === 'r') return c.match(/\d+/g).slice(0, 3).map(Number); return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
  function heartPath(k, s) { k.beginPath(); k.moveTo(0, s * 0.92); k.bezierCurveTo(-s * 1.75, -s * 0.12, -s * 0.85, -s * 1.2, 0, -s * 0.42); k.bezierCurveTo(s * 0.85, -s * 1.2, s * 1.75, -s * 0.12, 0, s * 0.92); k.closePath(); }
  function check(k, x, y, s, col, lw, f = 1) {   // チェックの線（f で描く途中）
    const pts = [[-0.5, 0.02], [-0.14, 0.38], [0.52, -0.34]], L1 = Math.hypot(0.36, 0.36), L2 = Math.hypot(0.66, 0.72), L = (L1 + L2) * clamp(f);
    k.save(); k.translate(x, y); k.strokeStyle = col; k.lineWidth = lw; k.lineCap = 'round'; k.lineJoin = 'round'; k.beginPath(); k.moveTo(pts[0][0] * s, pts[0][1] * s);
    if (L <= L1) { const q = L / L1; k.lineTo(lerp(pts[0][0], pts[1][0], q) * s, lerp(pts[0][1], pts[1][1], q) * s); }
    else { const q = (L - L1) / L2; k.lineTo(pts[1][0] * s, pts[1][1] * s); k.lineTo(lerp(pts[1][0], pts[2][0], q) * s, lerp(pts[1][1], pts[2][1], q) * s); }
    if (L > 0) k.stroke(); k.restore();
  }
  // 最後に on(t) が切り替わった時刻（なければ null）
  function lastSwitch(on, u) { const s = on(u); for (let i = 0, t = u; i < 600; i++, t -= 1 / 120) if (on(t - 1 / 120) !== s) return t; return null; }
  const GREEN = '#62616C', RED = '#D6C2FF', HEART = '#D6C2FF';
  const CELLS = [];

  // @element 01
  // 01 タイムラインアニメーション（スクロールに合わせて年表の線が上から伸び、線が届いた年が順に現れる）
  CELLS[0] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const y = steps([[0.3, 0], [2.3, 190], [3.0, 190], [4.3, 0]], u);
    const ROWS = [[72, '2018', '創業'], [126, '2020', '1号店オープン'], [180, '2022', '会員1万人'], [234, '2024', 'アプリ公開'], [288, '2026', '海外へ']];
    const LX = 168, L = y + 126;                         // 線の先（画面の下から 42px の所までページと一緒に伸びる）
    view(k, () => {
      k.save(); k.translate(0, -y);
      txt(k, 'HISTORY', 34, 34, `800 11px ${EN}`, C.acc, 'left', 'alphabetic', '2px');
      txt(k, 'あゆみ', 34, 60, `800 20px ${JP}`, C.ink);
      pic(k, 34, 76, 100, 62, 0, 6); bars(k, 34, 148, 90, 2);
      k.fillStyle = C.faint; rr(k, LX - 1.5, 52, 3, 248, 1.5); k.fill();
      k.fillStyle = C.acc; rr(k, LX - 1.5, 52, 3, clamp(L - 52, 0, 248), 1.5); k.fill();
      for (const [iy, yr, lab] of ROWS) {
        const q = eOut(clamp((L - iy) / 22));
        k.fillStyle = '#FFFFFF'; k.beginPath(); k.arc(LX, iy, 7.5, 0, 7); k.fill();
        k.lineWidth = 2.5; k.strokeStyle = q > 0 ? C.acc : C.faint; k.stroke();
        if (q > 0) { k.fillStyle = C.acc; k.beginPath(); k.arc(LX, iy, 4 * q, 0, 7); k.fill(); }
        k.save(); k.globalAlpha = q; k.translate(16 * (1 - q), 0);
        txt(k, yr, LX + 22, iy + 6, `800 18px ${EN}`, C.acc);
        txt(k, lab, LX + 82, iy + 5, `700 15px ${JP}`, C.ink);
        bars(k, LX + 82, iy + 15, 190, 1, C.faint, 5);
        k.restore();
      }
      k.restore();
      sbar(k, y / 190, 0.45);
    });
  };

  // @element 02
  // 02 スクロールテキストリビール（薄い見出しの文字が、スクロールに合わせて左から1文字ずつ濃くなる）
  CELLS[1] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const p = steps([[0.3, 0], [2.6, 1], [3.2, 1], [4.4, 0]], u), y = p * 40;
    const LINES = ['毎日の小さな工夫が、', '暮らしを少しずつ', '変えていく。'], F = `800 27px ${JP}`;
    const total = LINES.join('').length;
    view(k, () => {
      k.save(); k.translate(0, -y);
      txt(k, 'ABOUT US', 40, 34, `800 11px ${EN}`, C.acc, 'left', 'alphabetic', '2px');
      let n = 0;
      LINES.forEach((s, li) => {
        let x = 40; k.font = F;
        for (const ch of s) {
          const f = clamp(p * (total + 2) - n);
          txt(k, ch, x, 72 + li * 38, F, mix('#D8D6DE', C.ink, f));
          k.font = F; x += k.measureText(ch).width; n++;
        }
      });
      bars(k, 40, 168, 300, 3, C.faint, 6, 12, 0.7);
      k.restore();
      sbar(k, p, 0.55);
    });
  };

  // @element 03
  // 03 スタッキングカード（スクロールすると、次のカードが下から来て前のカードに少しずらして重なる）
  CELLS[2] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const s = steps([[0.3, 0], [1.1, 1], [1.6, 1], [2.4, 2], [3.2, 2], [4.4, 0]], u);
    const CARDS = [[C.blueL, C.ink, C.acc, '01', '企画する', 0], [C.ink, '#FFFFFF', C.acc, '02', 'つくる', 2], [C.acc, '#FFFFFF', '#FFFFFF', '03', '届ける', 1]];
    const X = 70, CWD = 371, CHT = 124, STEP = 170;
    view(k, () => {
      k.fillStyle = C.soft; k.fillRect(0, 0, VW, VH);
      CARDS.forEach(([bg, fg, nc, no, ttl, pv], i) => {
        const top = Math.max(14 + i * 12, 16 + i * STEP - s * STEP);
        const cov = clamp(s - i), sc = 1 - 0.045 * cov - 0.045 * clamp(s - i - 1);
        k.save(); k.translate(VW / 2, top); k.scale(sc, sc); k.translate(-VW / 2, 0);
        k.save(); k.shadowColor = 'rgba(11,11,15,.22)'; k.shadowBlur = 14; k.shadowOffsetY = -2; k.fillStyle = bg; rr(k, X, 0, CWD, CHT, 12); k.fill(); k.restore();
        txt(k, no, X + 24, 44, `800 26px ${EN}`, nc);
        txt(k, ttl, X + 24, 78, `800 20px ${JP}`, fg);
        bars(k, X + 24, 92, 140, 2, i === 0 ? '#D8D6DE' : 'rgba(255,255,255,.35)');
        pic(k, X + CWD - 160, 14, 144, CHT - 28, pv, 8);
        if (cov > 0) { k.fillStyle = `rgba(11,11,15,${0.16 * cov})`; rr(k, X, 0, CWD, CHT, 12); k.fill(); }
        k.restore();
      });
      sbar(k, s / 2, 0.4);
    });
  };

  // @element 04
  // 04 背景色の切り替え（スクロールでセクションが変わるたび、ページ全体の背景色がなめらかに変わる）
  CELLS[3] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const y = steps([[0.3, 0], [1.2, VH], [1.8, VH], [2.7, 2 * VH], [3.3, 2 * VH], [4.4, 0]], u), s = y / VH;
    const BG = ['#EFEEF1', '#393840', '#EFEEF1'], DK = [0, 1, 0];
    const i0 = Math.min(1, Math.floor(s)), t = eIOs(clamp((s - i0 - 0.05) / 0.9));
    const bg = mix(BG[i0], BG[i0 + 1], t), dk = lerp(DK[i0], DK[i0 + 1], t);
    const fg = mix(C.ink, '#FFFFFF', dk), bc = mix('#D8D6DE', '#62616C', dk);
    view(k, () => {
      k.fillStyle = bg; k.fillRect(0, 0, VW, VH);
      k.save(); k.translate(0, -y);
      const S = [['01  MORNING', '朝のひととき'], ['02  NIGHT', '夜のくつろぎ'], ['03  HOLIDAY', '休日のおでかけ']];
      S.forEach(([no, ttl], i) => {
        const y0 = i * VH;
        txt(k, no, 40, y0 + 58, `800 12px ${EN}`, C.acc, 'left', 'alphabetic', '2px');
        txt(k, ttl, 40, y0 + 92, `800 24px ${JP}`, fg);
        k.fillStyle = bc; for (let j = 0; j < 2; j++) { rr(k, 40, y0 + 108 + j * 12, j ? 110 : 180, 6, 3); k.fill(); }
      });
      // 朝: 太陽 / 夜: 月と星 / 休日: 山の写真
      k.fillStyle = C.acc; k.beginPath(); k.arc(380, 84, 34, 0, 7); k.fill();
      k.strokeStyle = C.acc; k.lineWidth = 4; k.lineCap = 'round';
      for (let j = 0; j < 8; j++) { const a = j * Math.PI / 4; k.beginPath(); k.moveTo(380 + Math.cos(a) * 44, 84 + Math.sin(a) * 44); k.lineTo(380 + Math.cos(a) * 54, 84 + Math.sin(a) * 54); k.stroke(); }
      k.fillStyle = '#D6C2FF'; k.beginPath(); k.arc(380, VH + 84, 36, 0, 7); k.fill();
      k.fillStyle = bg; k.beginPath(); k.arc(396, VH + 72, 32, 0, 7); k.fill();
      k.fillStyle = '#D6C2FF';[[300, 50], [450, 40], [330, 130], [470, 120]].forEach(([a, b]) => { k.beginPath(); k.arc(a, VH + b, 2.5, 0, 7); k.fill(); });
      pic(k, 300, 2 * VH + 28, 180, 112, 0, 10);
      k.restore();
      sbar(k, s / 2, 0.34);
    });
  };

  // @element 05
  // 05 隠れるヘッダー（下へスクロールするとヘッダーが上へ引っ込み、上へ戻すとすっと出てくる）
  CELLS[4] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const SY = t => steps([[0.3, 0], [1.1, 170], [1.5, 170], [1.9, 100], [2.4, 100], [2.9, 230], [3.3, 230], [4.3, 0]], t), y = SY(u);
    // 最後に動いた向きが「下」なら隠す（ページの一番上にいるときは出す）
    const hidden = t => { const yt = SY(t); if (yt < 34) return false; for (let i = 0, tt = t; i < 600; i++, tt -= 1 / 120) { const d = SY(tt) - SY(tt - 1 / 120); if (Math.abs(d) > 1e-4) return d > 0; } return false; };
    const q = trans(hidden, u, 0.3, eIOs);
    view(k, () => {
      k.save(); k.translate(0, -y);
      pic(k, 24, 48, 214, 110, 1, 8);
      txt(k, '旅の準備を、', 262, 84, `800 22px ${JP}`, C.ink); txt(k, 'まとめて。', 262, 114, `800 22px ${JP}`, C.ink); bars(k, 262, 128, 200, 2); btn(k, 262, 152, 100, 24, '詳しく見る');
      k.fillStyle = C.soft; k.fillRect(0, 196, VW, 260);
      txt(k, '人気のプラン', VW / 2, 232, `800 17px ${JP}`, C.ink, 'center');
      for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const x = 34 + i * 152, y0 = 250 + r * 100; k.fillStyle = '#FFFFFF'; rr(k, x, y0, 136, 88, 8); k.fill(); pic(k, x + 8, y0 + 8, 120, 46, (i + r) % 3, 5); bars(k, x + 10, y0 + 64, 100, 2, C.faint, 5, 10); }
      k.restore();
      const hy = -36 * q;
      if (y > 0 && q < 1) { const g = k.createLinearGradient(0, hy + 34, 0, hy + 46); g.addColorStop(0, `rgba(11,11,15,${0.14 * clamp(y / 30)})`); g.addColorStop(1, 'rgba(11,11,15,0)'); k.fillStyle = g; k.fillRect(0, hy + 34, VW, 12); }
      header(k, hy);
      sbar(k, y / 230, 0.42);
    });
  };

  // @element 06
  // 06 スクロールスパイ（左の目次のうち、いま読んでいる見出しの項目が光る）
  CELLS[5] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const y = steps([[0.3, 0], [0.9, 100], [1.35, 100], [1.95, 200], [2.4, 200], [3.0, 300], [3.5, 300], [4.4, 0]], u);
    const NAMES = ['はじめに', '使い方', '料金', 'よくある質問'], TX = 160;
    const act = t => { const yy = steps([[0.3, 0], [0.9, 100], [1.35, 100], [1.95, 200], [2.4, 200], [3.0, 300], [3.5, 300], [4.4, 0]], t); let a = 0; for (let i = 0; i < 4; i++) if (i * 100 <= yy + 40) a = i; return a; };
    view(k, () => {
      k.save(); k.beginPath(); k.rect(TX - 10, 0, VW, VH); k.clip(); k.translate(0, -y);
      NAMES.forEach((s, i) => {
        const y0 = i * 100 + 14;
        txt(k, `${i + 1}. ${s}`, TX + 14, y0 + 22, `800 16px ${JP}`, C.ink);
        bars(k, TX + 14, y0 + 38, 300, 3, C.faint, 6, 12, 0.6);
      });
      k.restore();
      k.fillStyle = C.soft; k.fillRect(0, 0, TX - 10, VH);
      txt(k, '目次', 20, 30, `800 12px ${JP}`, C.sub);
      const a = act(u);
      NAMES.forEach((s, i) => {
        const q = trans(t => act(t) === i, u, 0.25), iy = 54 + i * 30;
        if (q > 0) { k.fillStyle = `rgba(214,194,255,${q})`; rr(k, 12, iy - 13, TX - 34, 26, 6); k.fill(); k.fillStyle = C.acc; k.globalAlpha = q; rr(k, 12, iy - 13, 4, 26, 2); k.fill(); k.globalAlpha = 1; }
        txt(k, s, 26, iy + 1, `${a === i ? 800 : 600} 13px ${JP}`, mix('#62616C', C.acc, q), 'left', 'middle');
      });
      sbar(k, y / 300, 0.36);
    });
  };

  // @element 07
  // 07 トップへ戻るボタン（下までスクロールすると右下に丸いボタンが出て、押すと一気に先頭へ戻る）
  CELLS[6] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const CLK = 2.6, MAX = 300;
    const y = u < CLK + 0.02 ? steps([[0.2, 0], [1.7, MAX]], u) : MAX * (1 - eIO(P(u, CLK + 0.06, CLK + 0.66)));
    const cur = t => path([[0, 340, 205], [1.6, 340, 205], [2.35, 472, 138], [2.95, 472, 138], [3.6, 340, 205], [4.7, 340, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.save(); k.translate(0, -y);
      txt(k, 'BLOG', 70, 32, `800 11px ${EN}`, C.acc, 'left', 'alphabetic', '2px');
      txt(k, '週末にできる、小さな旅', 70, 58, `800 19px ${JP}`, C.ink);
      pic(k, 70, 72, 371, 100, 2, 8);
      for (let b = 0; b < 3; b++) { const y0 = 192 + b * 82; k.fillStyle = C.ink; rr(k, 70, y0, 150, 9, 4.5); k.fill(); bars(k, 70, y0 + 22, 371, 4, C.faint, 6, 12); }
      k.fillStyle = C.ink; k.fillRect(0, 438, VW, 80); logo(k, 70, 454, '#FFFFFF'); bars(k, 300, 451, 140, 1, 'rgba(255,255,255,.3)');
      k.restore();
      const tb = eOut(clamp((y - 80) / 60));
      if (tb > 0) {
        const hov = trans(t => { const [a, b] = cur(t); return Math.hypot(a - 472, b - 138) < 20; }, u, 0.2);
        k.save(); k.globalAlpha = tb; k.translate(0, 10 * (1 - tb));
        k.save(); k.shadowColor = 'rgba(11,11,15,.3)'; k.shadowBlur = 10; k.shadowOffsetY = 3; k.fillStyle = mix(C.acc, '#62616C', hov); k.beginPath(); k.arc(472, 138, 19, 0, 7); k.fill(); k.restore();
        k.strokeStyle = '#FFFFFF'; k.lineWidth = 2.6; k.lineCap = 'round'; k.lineJoin = 'round'; k.beginPath(); k.moveTo(465, 142); k.lineTo(472, 134.5); k.lineTo(479, 142); k.stroke();
        k.restore();
      }
      sbar(k, y / MAX, 0.34);
      click(k, cx, cy, u, [CLK]);
    });
  };

  // @element 08
  // 08 スクロールで拡大（スクロールに合わせて、小さな写真が窓いっぱいまで広がる）
  CELLS[7] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const p = steps([[0.3, 0], [2.3, 1], [3.0, 1], [4.4, 0]], u);
    const x = lerp(178, 0, p), y = lerp(58, 0, p), ww = lerp(155, VW, p), hh = lerp(90, VH, p);
    view(k, () => {
      const a = 1 - clamp(p * 2.2);
      k.save(); k.globalAlpha = a;
      txt(k, '景色の中へ', VW / 2, 38, `800 19px ${JP}`, C.ink, 'center');
      bars(k, 34, 66, 120, 4, C.faint, 6, 14); bars(k, 357, 66, 120, 4, C.faint, 6, 14);
      k.restore();
      pic(k, x, y, ww, hh, 0, lerp(8, 0, p));
      const b = clamp((p - 0.7) / 0.3);
      if (b > 0) { k.save(); k.globalAlpha = b; txt(k, '絶景へようこそ', VW / 2, VH / 2 + 2, `800 26px ${JP}`, '#FFFFFF', 'center', 'middle', '2px'); k.restore(); }
      sbar(k, p * 0.6, 0.4);
    });
  };

  // @element 09
  // 09 3Dチルト（カーソルの動きに合わせて、カードが奥行きをもって傾く）
  // カードの面（TC）と縦に傾けた面（TD）を描く下書き用の canvas。拡大して描くときは、その倍率ぶん細かく描く
  const TC = document.createElement('canvas'); TC.width = 220; TC.height = 132; const TCK = TC.getContext('2d');
  const TD = document.createElement('canvas'); TD.width = 300; TD.height = 190; const TDK = TD.getContext('2d');
  const TDW = 300, TDH = 190;
  CELLS[8] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const BX = VW / 2, BY = 82, BW = 220, BH = 132, MAXA = 0.32, D = 520;
    const cur = t => path([[0, 80, 190], [0.6, 190, 40], [1.2, 335, 50], [1.8, 330, 125], [2.4, 180, 122], [3.0, 258, 80], [3.6, 470, 190], [4.7, 80, 190]], t);
    const inside = t => { const [x, y] = cur(t); return Math.abs(x - BX) < BW / 2 && Math.abs(y - BY) < BH / 2; };
    const q = trans(inside, u, 0.4, eOut), [cx, cy] = cur(u);
    const nx = clamp((cx - BX) / (BW / 2), -1, 1), ny = clamp((cy - BY) / (BH / 2), -1, 1);
    const ry = nx * MAXA * q, rx = ny * MAXA * q;
    // 呼び出し側の拡大率 S（詳細表示などで2倍・3倍に描かれるとき）。下書きの canvas を S 倍の細かさにする
    const m = k.getTransform(), S = Math.min(4, Math.max(1, Math.hypot(m.a, m.b)));
    const cw = Math.ceil(BW * S), ch = Math.ceil(BH * S), dw = Math.ceil(TDW * S), dh = Math.ceil(TDH * S);
    if (TC.width !== cw || TC.height !== ch) { TC.width = cw; TC.height = ch; }
    if (TD.width !== dw || TD.height !== dh) { TD.width = dw; TD.height = dh; }
    // カードの面
    const g = TCK; g.clearRect(0, 0, TC.width, TC.height);
    g.save(); g.scale(S, S); rr(g, 0, 0, BW, BH, 14); g.clip();
    const gr = g.createLinearGradient(0, 0, BW, BH); gr.addColorStop(0, '#A6A3AE'); gr.addColorStop(1, '#A6A3AE'); g.fillStyle = gr; g.fillRect(0, 0, BW, BH);
    g.fillStyle = 'rgba(255,255,255,.12)'; g.beginPath(); g.arc(BW - 30, 20, 70, 0, 7); g.fill();
    logo(g, 18, 26, '#FFFFFF');
    g.fillStyle = '#D8D6DE'; rr(g, 18, 52, 34, 26, 5); g.fill();
    txt(g, 'MEMBER CARD', 18, 104, `700 11px ${EN}`, 'rgba(255,255,255,.8)', 'left', 'alphabetic', '2px');
    txt(g, '0123  4567  8910', 18, 122, `700 13px ${EN}`, '#FFFFFF', 'left', 'alphabetic', '1px');
    const gx = (nx * 0.5 + 0.5) * BW, gy = (ny * 0.5 + 0.5) * BH, gl = g.createRadialGradient(gx, gy, 0, gx, gy, 130);
    gl.addColorStop(0, `rgba(255,255,255,${0.42 * q})`); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.fillRect(0, 0, BW, BH);
    g.restore();
    // 縦の傾き（横の帯で描く）→ 横の傾き（縦の帯で描く）
    const d = TDK; d.clearRect(0, 0, TD.width, TD.height);
    const N = 44;
    for (let i = 0; i < N; i++) {
      const v0 = i / N - 0.5, v1 = (i + 1) / N - 0.5, z0 = v0 * BH * Math.sin(rx), z1 = v1 * BH * Math.sin(rx), s0 = D / (D + z0), s1 = D / (D + z1);
      const y0 = TDH / 2 + v0 * BH * Math.cos(rx) * s0, y1 = TDH / 2 + v1 * BH * Math.cos(rx) * s1, sw = BW * (s0 + s1) / 2;
      d.drawImage(TC, 0, i * BH / N * S, BW * S, (BH / N + 0.6) * S, (TDW / 2 - sw / 2) * S, y0 * S, sw * S, (y1 - y0 + 0.6) * S);
    }
    view(k, () => {
      k.fillStyle = C.soft; k.fillRect(0, 0, VW, VH);
      k.fillStyle = `rgba(11,11,15,${0.1 + 0.05 * q})`; k.beginPath(); k.ellipse(BX - nx * 10 * q, 158, 96, 7, 0, 0, 7); k.fill();
      for (let i = 0; i < N; i++) {
        const f0 = i / N - 0.5, f1 = (i + 1) / N - 0.5, z0 = f0 * TDW * Math.sin(ry), z1 = f1 * TDW * Math.sin(ry), s0 = D / (D + z0), s1 = D / (D + z1);
        const x0 = BX + f0 * TDW * Math.cos(ry) * s0, x1 = BX + f1 * TDW * Math.cos(ry) * s1, sh = TDH * (s0 + s1) / 2;
        k.drawImage(TD, i * TDW / N * S, 0, (TDW / N + 0.6) * S, TDH * S, x0, BY - sh / 2, x1 - x0 + 0.6, sh);
      }
      cursor(k, cx, cy);
    });
  };

  // @element 10
  // 10 スポットライトホバー（暗いカードの上で、カーソルの周りだけが丸く明るく光る）
  CELLS[9] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const cx = 255 + 190 * Math.sin(2 * Math.PI * u / CYC), cy = 92 + 40 * Math.sin(4 * Math.PI * u / CYC);
    view(k, () => {
      k.fillStyle = '#0B0B0F'; k.fillRect(0, 0, VW, VH);
      txt(k, 'FEATURES', VW / 2, 26, `800 11px ${EN}`, 'rgba(255,255,255,.45)', 'center', 'alphabetic', '3px');
      const LAB = ['かんたん', 'あんしん', 'はやい'];
      for (let i = 0; i < 3; i++) {
        const x = 22 + i * 160, y = 40, cw = 147, ch = 116;
        k.fillStyle = '#0B0B0F'; rr(k, x, y, cw, ch, 10); k.fill();
        k.save(); rr(k, x, y, cw, ch, 10); k.clip();
        const g = k.createRadialGradient(cx, cy, 0, cx, cy, 115); g.addColorStop(0, 'rgba(255,255,255,.34)'); g.addColorStop(1, 'rgba(255,255,255,0)'); k.fillStyle = g; k.fillRect(x, y, cw, ch);
        k.restore();
        k.lineWidth = 1.5; k.strokeStyle = 'rgba(255,255,255,.08)'; rr(k, x + 0.75, y + 0.75, cw - 1.5, ch - 1.5, 10); k.stroke();
        const sg = k.createRadialGradient(cx, cy, 0, cx, cy, 120); sg.addColorStop(0, 'rgba(214,194,255,1)'); sg.addColorStop(1, 'rgba(214,194,255,0)');
        k.lineWidth = 2; k.strokeStyle = sg; rr(k, x + 1, y + 1, cw - 2, ch - 2, 10); k.stroke();
        k.strokeStyle = 'rgba(255,255,255,.75)'; k.lineWidth = 2; k.beginPath(); k.arc(x + 30, y + 32, 12, 0, 7); k.stroke();
        txt(k, LAB[i], x + 18, y + 72, `800 16px ${JP}`, 'rgba(255,255,255,.9)');
        bars(k, x + 18, y + 86, 110, 2, 'rgba(255,255,255,.16)', 5, 10);
      }
      cursor(k, cx, cy);
    });
  };

  // @element 11
  // 11 ホバーで画像切り替え（商品カードにカーソルを乗せると、写真が別の角度＝後ろ姿に切り替わる）
  function tee(k, x, y, s, col, back) {
    k.save(); k.translate(x, y); k.scale(s, s);
    k.fillStyle = col; k.beginPath();
    k.moveTo(-0.36, -0.5); k.quadraticCurveTo(0, back ? -0.44 : -0.3, 0.36, -0.5);
    [[0.66, -0.3], [0.52, -0.08], [0.38, -0.18], [0.38, 0.56], [-0.38, 0.56], [-0.38, -0.18], [-0.52, -0.08], [-0.66, -0.3]].forEach(([a, b]) => k.lineTo(a, b));
    k.closePath(); k.fill();
    k.strokeStyle = 'rgba(11,11,15,.18)'; k.lineWidth = 0.025; k.beginPath(); k.moveTo(-0.36, -0.5); k.quadraticCurveTo(0, back ? -0.44 : -0.3, 0.36, -0.5); k.stroke();
    k.restore();
  }
  CELLS[10] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const CX = [44, 271], CY = 10, CWD = 196, IH = 112;
    const PRODS = [['Tシャツ', '¥3,980', '#FFFFFF', C.blueL, C.blue], ['ロゴTシャツ', '¥4,280', C.acc, C.accL, '#FFFFFF']];
    const cur = t => path([[0, 60, 200], [0.4, 150, 70], [1.6, 160, 80], [2.0, 370, 70], [3.3, 380, 82], [3.8, 470, 200], [4.7, 60, 200]], t);
    view(k, () => {
      for (let i = 0; i < 2; i++) {
        const [nm, pr, col, bg, mark] = PRODS[i], x = CX[i];
        const inside = t => { const [a, b] = cur(t); return a > x && a < x + CWD && b > CY && b < CY + IH + 40; };
        const q = trans(inside, u, 0.3, eIOs);
        k.save(); rr(k, x, CY, CWD, IH, 8); k.clip(); k.fillStyle = bg; k.fillRect(x, CY, CWD, IH);
        // 正面（胸に小さな丸い印）→ 後ろ姿（背中に大きな星の柄）
        k.globalAlpha = 1 - q; tee(k, x + CWD / 2, CY + IH / 2 + 4, 108, col, false);
        k.fillStyle = mark; k.beginPath(); k.arc(x + CWD / 2 + 18, CY + IH / 2 - 16, 7, 0, 7); k.fill();
        k.globalAlpha = q; tee(k, x + CWD / 2, CY + IH / 2 + 4, 108, col, true);
        { const sx = x + CWD / 2, sy = CY + IH / 2 + 12; k.fillStyle = mark; k.beginPath(); for (let j = 0; j < 10; j++) { const r = j % 2 ? 8 : 19, a = -Math.PI / 2 + j * Math.PI / 5; j ? k.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r) : k.moveTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r); } k.closePath(); k.fill(); }
        k.globalAlpha = 1; k.restore();
        for (let j = 0; j < 2; j++) { k.fillStyle = (j ? q : 1 - q) > 0.5 ? C.ink : C.faint; k.beginPath(); k.arc(x + CWD / 2 - 6 + j * 12, CY + IH - 10, 3, 0, 7); k.fill(); }
        txt(k, nm, x + 4, CY + IH + 22, `800 14px ${JP}`, C.ink);
        txt(k, pr, x + CWD - 4, CY + IH + 22, `800 14px ${EN}`, C.ink, 'right');
        bars(k, x + 4, CY + IH + 32, 90, 1, C.faint, 5);
      }
      const [cx, cy] = cur(u); cursor(k, cx, cy);
    });
  };

  // @element 12
  // 12 テキストロール（メニューの文字にカーソルを乗せると、文字が上に回って同じ文字が下から出てくる）
  CELLS[11] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const LINKS = ['WORKS', 'ABOUT', 'CONTACT'], F = `800 30px ${EN}`, GAP = 44, LY = 100, LH = 40;
    const cur = t => path([[0, 110, 200], [0.4, 120, 92], [1.25, 140, 96], [1.5, 252, 92], [2.35, 268, 96], [2.6, 380, 92], [3.45, 400, 96], [3.9, 450, 200], [4.7, 110, 200]], t);
    view(k, () => {
      k.fillStyle = '#EFEEF1'; k.fillRect(0, 0, VW, VH);
      logo(k, 24, 28); txt(k, 'MENU', VW - 26, 28.5, `800 11px ${EN}`, C.sub, 'right', 'middle', '2px');
      k.font = F; k.letterSpacing = '1px'; const ws = LINKS.map(s => k.measureText(s).width); k.letterSpacing = '0px';
      let x = (VW - ws.reduce((a, b) => a + b, 0) - GAP * (LINKS.length - 1)) / 2;
      LINKS.forEach((s, i) => {
        const x0 = x, x1 = x + ws[i], inside = t => { const [a, b] = cur(t); return a > x0 - 6 && a < x1 + 6 && b > LY - 30 && b < LY + 10; };
        const on = inside(u), tc = lastSwitch(inside, u);
        k.save(); k.beginPath(); k.rect(x0 - 4, LY - 31, ws[i] + 8, 39); k.clip();
        let cxp = x0;
        [...s].forEach((ch, j) => {
          const f = tc === null ? (on ? 1 : 0) : eIO(P(u, tc + 0.035 * j, tc + 0.035 * j + 0.36)), q = on ? f : 1 - f;
          k.font = F; k.letterSpacing = '1px'; const cw = k.measureText(ch).width; k.letterSpacing = '0px';
          txt(k, ch, cxp, LY - LH * q, F, C.ink, 'left', 'alphabetic', '1px');
          txt(k, ch, cxp, LY + LH - LH * q, F, C.acc, 'left', 'alphabetic', '1px');
          cxp += cw;
        });
        k.restore();
        x += ws[i] + GAP;
      });
      bars(k, VW / 2 - 110, 132, 220, 1, '#D8D6DE', 6);
      const [cx, cy] = cur(u); cursor(k, cx, cy);
    });
  };

  // @element 13
  // 13 ホバーで画像プレビュー（文字だけのリストの行にカーソルを乗せると、その行の写真がカーソルの横に出る）
  CELLS[12] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const NAMES = ['オーロラの丘', '湖のほとりの小屋', '海辺のヴィラ', '星空のテラス'], RT = 6, RH = 39;
    const cur = t => path([[0, 140, 200], [0.4, 150, 26], [1.15, 190, 28], [1.4, 205, 65], [2.15, 230, 67], [2.4, 245, 104], [3.15, 265, 106], [3.4, 280, 143], [3.9, 292, 144], [4.3, 150, 200], [4.7, 140, 200]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      NAMES.forEach((s, i) => {
        const top = RT + i * RH, inside = t => { const [a, b] = cur(t); return b > top && b < top + RH && a > 20 && a < 490; };
        const q = trans(inside, u, 0.25);
        txt(k, '0' + (i + 1), 30, top + 25, `800 12px ${EN}`, C.sub);
        txt(k, s, 64 + 8 * q, top + 26, `800 17px ${JP}`, mix(C.ink, C.acc, q));
        txt(k, '→', 476, top + 25, `700 15px ${EN}`, mix('#D8D6DE', C.acc, q), 'right');
        k.fillStyle = C.rule; k.fillRect(24, top + RH, VW - 48, 1);
      });
      NAMES.forEach((s, i) => {
        const top = RT + i * RH, q = trans(t => { const [a, b] = cur(t); return b > top && b < top + RH && a > 20 && a < 490; }, u, 0.25);
        if (q <= 0) return;
        const iw = 132, ih = 84, px = cx + 26, py = clamp(cy - 46, 4, VH - ih - 4), sc = 0.85 + 0.15 * q;
        k.save(); k.globalAlpha = q; k.translate(px + iw / 2, py + ih / 2); k.scale(sc, sc);
        k.shadowColor = 'rgba(11,11,15,.25)'; k.shadowBlur = 12; k.shadowOffsetY = 4; k.fillStyle = '#FFFFFF'; rr(k, -iw / 2, -ih / 2, iw, ih, 6); k.fill(); k.shadowColor = 'transparent';
        pic(k, -iw / 2, -ih / 2, iw, ih, [0, 2, 1, 2][i], 6);
        k.restore();
      });
      cursor(k, cx, cy);
    });
  };

  // @element 14
  // 14 フローティングラベル（入力欄の中のラベルが、入力を始めると小さくなって欄の上へ移る）
  CELLS[13] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const TEXT = 'hello@example.com', F = { x: 106, y: 58, w: 300, h: 46 };
    const len = t => { t = mod(t, CYC); return t < 1.0 ? 0 : t < 3.2 ? Math.min(TEXT.length, Math.floor((t - 1.0) / 0.075)) : Math.max(0, TEXT.length - Math.floor((t - 3.2) / 0.03)); };
    const focused = t => { t = mod(t, CYC); return t >= 0.65 && t < 3.95; };
    const q = trans(t => focused(t) || len(t) > 0, u, 0.24, eOut), fo = trans(focused, u, 0.15);
    const cur = t => path([[0, 445, 205], [0.45, 262, 82], [0.85, 262, 82], [1.4, 452, 142], [3.5, 452, 142], [3.85, 470, 26], [4.05, 470, 26], [4.6, 445, 205], [4.7, 445, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = C.soft; k.fillRect(0, 0, VW, VH);
      k.save(); k.shadowColor = 'rgba(11,11,15,.1)'; k.shadowBlur = 12; k.shadowOffsetY = 3; k.fillStyle = '#FFFFFF'; rr(k, 80, 12, 352, 148, 12); k.fill(); k.restore();
      txt(k, '会員登録', F.x, 40, `800 15px ${JP}`, C.ink);
      k.lineWidth = lerp(1.5, 2.2, fo); k.strokeStyle = mix('#D8D6DE', C.acc, fo); rr(k, F.x, F.y, F.w, F.h, 8); k.stroke();
      const s = TEXT.slice(0, len(u));
      txt(k, s, F.x + 14, F.y + 30, `600 15px ${EN}`, C.ink);
      if (focused(u) && (mod(u, 0.9) < 0.5 || (u > 1 && u < 2.4))) { k.font = `600 15px ${EN}`; const xw = k.measureText(s).width; k.fillStyle = C.ink; k.fillRect(F.x + 14 + xw + 1, F.y + 14, 1.6, 20); }
      const fs = lerp(15, 11.5, q), ly = lerp(F.y + F.h / 2, F.y, q), lx = F.x + lerp(14, 10, q), LAB = 'メールアドレス';
      k.font = `600 ${fs}px ${JP}`; const lw = k.measureText(LAB).width;
      if (q > 0) { k.fillStyle = '#FFFFFF'; k.fillRect(lx - 4, ly - 3, lw + 8, 6); }
      txt(k, LAB, lx, ly + 0.5, `600 ${fs}px ${JP}`, mix('#A6A3AE', C.acc, fo), 'left', 'middle');
      btn(k, F.x, 118, F.w, 30, '次へ', C.ink, '#FFFFFF', 12);
      click(k, cx, cy, u, [0.65, 3.95]);
    });
  };

  // @element 15
  // 15 インラインバリデーション（打っている途中は赤で「形式が正しくありません」、正しく打ち終わると緑のチェックとOK）
  CELLS[14] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const TEXT = 'hana@example.com', F = { x: 106, y: 56, w: 300, h: 44 };
    const len = t => { t = mod(t, CYC); return t < 0.75 ? 0 : t < 3.6 ? Math.min(TEXT.length, Math.floor((t - 0.75) / 0.115)) : Math.max(0, TEXT.length - Math.floor((t - 3.6) / 0.03)); };
    const err = t => { const n = len(t); return mod(t, CYC) < 3.6 && n >= 2 && n < TEXT.length; };
    const ok = t => mod(t, CYC) < 3.6 && len(t) === TEXT.length;
    const focused = t => { t = mod(t, CYC); return t >= 0.45 && t < 4.2; };
    const qe = trans(err, u, 0.15), qo = trans(ok, u, 0.25), fo = trans(focused, u, 0.15);
    const cur = t => path([[0, 445, 205], [0.3, 262, 80], [0.6, 262, 80], [1.1, 455, 146], [3.8, 455, 146], [4.1, 470, 26], [4.3, 470, 26], [4.65, 445, 205], [4.7, 445, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      txt(k, 'お問い合わせ', F.x, 26, `800 15px ${JP}`, C.ink);
      txt(k, 'メールアドレス', F.x, 47, `700 12px ${JP}`, C.ink);
      k.fillStyle = mix('#FFFFFF', '#EFEEF1', qe); rr(k, F.x, F.y, F.w, F.h, 8); k.fill();
      const bc = mix(mix(mix('#D8D6DE', C.ink, fo), RED, qe), GREEN, qo);
      k.lineWidth = lerp(1.5, 2.2, Math.max(fo, qe, qo)); k.strokeStyle = bc; rr(k, F.x, F.y, F.w, F.h, 8); k.stroke();
      const s = TEXT.slice(0, len(u));
      txt(k, s, F.x + 14, F.y + 28, `600 15px ${EN}`, C.ink);
      if (focused(u) && !ok(u) && (mod(u, 0.9) < 0.5 || (u > 0.75 && u < 2.6))) { k.font = `600 15px ${EN}`; const xw = k.measureText(s).width; k.fillStyle = C.ink; k.fillRect(F.x + 14 + xw + 1, F.y + 12, 1.6, 20); }
      if (qe > 0) {
        k.save(); k.globalAlpha = qe;
        k.fillStyle = RED; k.beginPath(); k.arc(F.x + 7, F.y + F.h + 20, 7, 0, 7); k.fill(); txt(k, '!', F.x + 7, F.y + F.h + 20.5, `800 11px ${EN}`, '#FFFFFF', 'center', 'middle');
        txt(k, '形式が正しくありません', F.x + 20, F.y + F.h + 20.5, `700 13px ${JP}`, RED, 'left', 'middle');
        k.restore();
      }
      if (qo > 0) {
        k.save(); k.globalAlpha = qo;
        k.fillStyle = GREEN; k.beginPath(); k.arc(F.x + F.w - 22, F.y + F.h / 2, 11 * eEl(qo), 0, 7); k.fill(); check(k, F.x + F.w - 22, F.y + F.h / 2, 12, '#FFFFFF', 2.4);
        k.fillStyle = GREEN; k.beginPath(); k.arc(F.x + 7, F.y + F.h + 20, 7, 0, 7); k.fill(); check(k, F.x + 7, F.y + F.h + 20, 8, '#FFFFFF', 1.8);
        txt(k, 'OK', F.x + 20, F.y + F.h + 20.5, `800 13px ${EN}`, GREEN, 'left', 'middle');
        k.restore();
      }
      click(k, cx, cy, u, [0.45, 4.2]);
    });
  };

  // @element 16
  // 16 ローディングボタン（押すと丸い読み込み表示に縮んで回り、チェック付きの「完了」に変わる）
  CELLS[15] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const CLK = 0.8, BY = 124, BHT = 36;
    const shr = eIO(P(u, CLK + 0.05, CLK + 0.35)), done = eOut(P(u, 2.25, 2.45)), grow = eIO(P(u, 2.45, 2.8)), fade = P(u, 3.9, 4.1), back = eOut(P(u, 4.1, 4.4));
    const bw = fade >= 1 ? 220 : grow > 0 ? lerp(BHT, 150, grow) : lerp(220, BHT, shr);
    const cur = t => path([[0, 430, 205], [0.55, 290, 136], [1.1, 290, 136], [1.6, 440, 205], [4.7, 430, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = C.blueL; k.fillRect(0, 0, VW, VH);
      k.save(); k.shadowColor = 'rgba(11,11,15,.1)'; k.shadowBlur = 12; k.shadowOffsetY = 3; k.fillStyle = '#FFFFFF'; rr(k, 130, 10, 251, 150, 12); k.fill(); k.restore();
      txt(k, '資料請求', VW / 2, 36, `800 15px ${JP}`, C.ink, 'center');
      for (let i = 0; i < 2; i++) { k.strokeStyle = '#D8D6DE'; k.lineWidth = 1.5; rr(k, 150, 50 + i * 32, 211, 24, 6); k.stroke(); bars(k, 160, 59 + i * 32, i ? 90 : 120, 1, '#A6A3AE', 6); }
      const col = fade >= 1 ? '#0B0B0F' : mix('#0B0B0F', GREEN, done), ba = fade >= 1 ? back : 1 - fade;
      k.save(); k.globalAlpha = ba; k.translate(0, fade >= 1 ? 6 * (1 - back) : 0); k.save(); k.shadowColor = 'rgba(11,11,15,.18)'; k.shadowBlur = 8; k.shadowOffsetY = 3; k.fillStyle = col; rr(k, VW / 2 - bw / 2, BY, bw, BHT, BHT / 2); k.fill(); k.restore();
      const idleA = fade >= 1 ? 1 : 1 - clamp(shr * 3);
      if (idleA > 0) { k.save(); k.globalAlpha = idleA * ba; txt(k, '送信する', VW / 2, BY + BHT / 2 + 0.5, `800 14px ${JP}`, '#FFFFFF', 'center', 'middle'); k.restore(); }
      if (u > CLK + 0.3 && u < 2.3) { k.save(); k.globalAlpha = clamp((u - CLK - 0.3) / 0.1) * (1 - clamp((u - 2.2) / 0.08)); k.lineCap = 'round'; k.lineWidth = 3; k.strokeStyle = 'rgba(255,255,255,.35)'; k.beginPath(); k.arc(VW / 2, BY + BHT / 2, 10, 0, 7); k.stroke(); const a = u / 0.7 * Math.PI * 2; k.strokeStyle = '#FFFFFF'; k.beginPath(); k.arc(VW / 2, BY + BHT / 2, 10, a, a + Math.PI * 0.7); k.stroke(); k.restore(); }
      if (u >= 2.25 && fade < 1) {
        k.save();
        const ox = lerp(0, -26, grow);
        check(k, VW / 2 + ox, BY + BHT / 2, 16, '#FFFFFF', 3, P(u, 2.25, 2.5));
        if (grow > 0.5) { k.globalAlpha = ba * P(grow, 0.5, 1); txt(k, '完了', VW / 2 + 12, BY + BHT / 2 + 0.5, `800 14px ${JP}`, '#FFFFFF', 'center', 'middle'); }
        k.restore();
      }
      k.restore();
      click(k, cx, cy, u, [CLK]);
    });
  };

  // @element 17
  // 17 ビュートランジション（一覧の写真を押すと、その写真がそのまま大きくなって詳細ページの上部になる）
  CELLS[16] = (k, w, h, u) => {
    u = snapU(u);
    const e = u < 2.0 ? eIO(P(u, 0.85, 1.45)) : 1 - eIO(P(u, 3.15, 3.75));
    frame(k, e > 0.5 ? 'example.com/works/02' : 'example.com/works');
    const G = [24, 184, 344], GY = 44, GW = 143, GH = 80, NM = ['雪の山小屋', '海辺のカフェ', '夜の展望台'], PV = [0, 1, 2];
    const T = { x: 16, y: 10, w: VW - 32, h: 94 };
    const cur = t => path([[0, 420, 205], [0.5, 262, 88], [0.95, 262, 88], [1.6, 380, 150], [2.55, 380, 150], [2.9, 62, 30], [3.2, 62, 30], [3.9, 420, 205], [4.7, 420, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      const ga = 1 - clamp(e * 1.6);
      k.save(); k.globalAlpha = ga;
      txt(k, 'WORKS', 24, 30, `800 15px ${EN}`, C.ink, 'left', 'alphabetic', '2px');
      for (let i = 0; i < 3; i++) { if (i !== 1) pic(k, G[i], GY, GW, GH, PV[i], 6); txt(k, NM[i], G[i], GY + GH + 20, `800 13px ${JP}`, C.ink); bars(k, G[i], GY + GH + 30, 90, 1, C.faint, 5); }
      k.restore();
      const x = lerp(G[1], T.x, e), y = lerp(GY, T.y, e), ww = lerp(GW, T.w, e), hh = lerp(GH, T.h, e);
      pic(k, x, y, ww, hh, 1, lerp(6, 8, e));
      const da = clamp((e - 0.6) / 0.4);
      if (da > 0) {
        k.save(); k.globalAlpha = da;
        k.fillStyle = 'rgba(255,255,255,.92)'; rr(k, 26, 19, 74, 22, 11); k.fill(); txt(k, '← 一覧へ', 63, 30.5, `700 11px ${JP}`, C.ink, 'center', 'middle');
        txt(k, '海辺のカフェ', 24, 134, `800 19px ${JP}`, C.ink); bars(k, 200, 122, 280, 3, C.faint, 6, 12, 0.7);
        k.restore();
      }
      click(k, cx, cy, u, [0.75, 3.05]);
    });
  };

  // @element 18
  // 18 ライトボックス（サムネを押すと周りが暗くなり、その上に写真が大きく表示される）
  CELLS[17] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const e = u < 2.0 ? eOut(P(u, 0.85, 1.3)) : 1 - eIO(P(u, 3.05, 3.4));
    const TX = [24, 142, 260, 378], TY = 72, TW = 108, THt = 72, PV = [2, 0, 1, 0];
    const B = { x: 125, y: 12, w: 261, h: 128 };
    const cur = t => path([[0, 430, 205], [0.5, 318, 110], [0.95, 318, 110], [1.6, 445, 120], [2.5, 445, 120], [2.85, 487, 19], [3.15, 487, 19], [3.8, 430, 205], [4.7, 430, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      header(k, 0);
      txt(k, 'ギャラリー', 24, 60, `800 15px ${JP}`, C.ink);
      for (let i = 0; i < 4; i++) pic(k, TX[i], TY, TW, THt, PV[i], 6);
      bars(k, 24, 154, 300, 1, C.faint, 6);
      if (e > 0) {
        k.fillStyle = `rgba(11,11,15,${0.82 * e})`; k.fillRect(0, 0, VW, VH);
        const x = lerp(TX[2], B.x, e), y = lerp(TY, B.y, e), ww = lerp(TW, B.w, e), hh = lerp(THt, B.h, e);
        pic(k, x, y, ww, hh, 1, 6);
        k.save(); k.globalAlpha = clamp((e - 0.5) / 0.5);
        txt(k, '3 / 4', VW / 2, 156, `700 12px ${EN}`, 'rgba(255,255,255,.85)', 'center', 'middle', '1px');
        k.strokeStyle = '#FFFFFF'; k.lineWidth = 2.4; k.lineCap = 'round'; k.lineJoin = 'round';
        k.beginPath(); k.moveTo(481, 13); k.lineTo(493, 25); k.moveTo(493, 13); k.lineTo(481, 25); k.stroke();
        k.beginPath(); k.moveTo(98, 66); k.lineTo(90, 76); k.lineTo(98, 86); k.stroke();
        k.beginPath(); k.moveTo(413, 66); k.lineTo(421, 76); k.lineTo(413, 86); k.stroke();
        k.restore();
      }
      click(k, cx, cy, u, [0.75, 3.0]);
    });
  };

  // @element 19
  // 19 ホットスポット（製品写真の上で点が脈打ち、押すと説明の吹き出しが出る）
  CELLS[18] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const D1 = [186, 52], D2 = [150, 122];
    const o1 = t => { t = mod(t, CYC); return t >= 0.9 && t < 2.4; }, o2 = t => { t = mod(t, CYC); return t >= 2.4 && t < 3.8; };
    const q1 = trans(o1, u, 0.25), q2 = trans(o2, u, 0.25);
    const cur = t => path([[0, 280, 205], [0.6, D1[0], D1[1]], [1.15, D1[0], D1[1]], [2.05, D2[0], D2[1]], [3.95, D2[0], D2[1]], [4.45, 280, 205], [4.7, 280, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = '#EFEEF1'; k.fillRect(0, 0, 300, VH);
      // リュック（平面の絵）
      k.strokeStyle = C.ink; k.lineWidth = 6; k.lineCap = 'round'; k.beginPath(); k.arc(150, 30, 16, Math.PI, 0); k.stroke();
      k.fillStyle = '#393840'; rr(k, 92, 26, 116, 134, 28); k.fill();
      k.fillStyle = '#62616C'; rr(k, 108, 92, 84, 56, 14); k.fill();
      k.strokeStyle = '#D8D6DE'; k.lineWidth = 2.5; k.beginPath(); k.moveTo(116, 104); k.lineTo(184, 104); k.stroke();
      k.fillStyle = C.acc; rr(k, 140, 54, 20, 8, 4); k.fill();
      txt(k, 'トラベルリュック', 322, 58, `800 16px ${JP}`, C.ink);
      txt(k, '¥12,800', 322, 88, `800 19px ${EN}`, C.acc);
      bars(k, 322, 104, 160, 3);
      [D1, D2].forEach(([x, y], i) => {
        for (let r = 0; r < 2; r++) { const f = mod(u / (CYC / 3) + r * 0.5, 1); k.strokeStyle = `rgba(255,255,255,${0.75 * (1 - f)})`; k.lineWidth = 2; k.beginPath(); k.arc(x, y, 8 + 12 * f, 0, 7); k.stroke(); }
        k.save(); k.shadowColor = 'rgba(11,11,15,.3)'; k.shadowBlur = 6; k.shadowOffsetY = 2; k.fillStyle = '#FFFFFF'; k.beginPath(); k.arc(x, y, 8, 0, 7); k.fill(); k.restore();
        k.fillStyle = C.acc; k.beginPath(); k.arc(x, y, 4, 0, 7); k.fill();
      });
      const tip = (x, y, q, title, left) => {
        if (q <= 0) return;
        k.save(); k.globalAlpha = q; k.translate(x, y + 6 * (1 - q));
        const L = left ? 0 : 1;   // 吹き出しを点の左（left）か右に出す
        const bx = L ? 0 : -136;
        k.save(); k.shadowColor = 'rgba(11,11,15,.22)'; k.shadowBlur = 12; k.shadowOffsetY = 4; k.fillStyle = '#FFFFFF'; rr(k, bx, -24, 136, 48, 8); k.fill();
        k.beginPath(); if (L) { k.moveTo(0, -6); k.lineTo(-8, 0); k.lineTo(0, 6); } else { k.moveTo(0, -6); k.lineTo(8, 0); k.lineTo(0, 6); } k.fill(); k.restore();
        txt(k, title, bx + 12, -6, `800 13px ${JP}`, C.ink); bars(k, bx + 12, 6, 100, 1, C.faint, 5);
        k.restore();
      };
      tip(D1[0] - 16, D1[1], q1, '雨をはじく布', true);
      tip(D2[0] + 16, D2[1], q2, 'PCが入るポケット', false);
      click(k, cx, cy, u, [0.9, 2.4, 3.8]);
    });
  };

  // @element 20
  // 20 カウントダウンタイマー（「キャンペーン終了まで」の 時:分:秒 が1秒ごとに入れ替わって減っていく）
  // このカードだけ1回の動きが9.4秒（パックの周期と同じ）。tp（0〜9.4秒）で描く。1秒ごとに9回減り、途中で分が1回繰り下がる
  CELLS[19] = (k, w, h, u) => {
    const tp = mod(Math.round(u * 1e6) / 1e6, LOOP);
    frame(k);
    const T0 = 0.4, START = 2 * 3600 + 15 * 60 + 4;    // 02:15:04 → 02:14:55
    const n = clamp(Math.floor(tp - T0) + 1, 0, 9), fp = n === 0 ? 1 : clamp((tp - T0 - (n - 1)) / 0.32);
    const dg = v => { const hh = Math.floor(v / 3600), mm = Math.floor(v / 60) % 60, ss = v % 60; return [hh, mm, ss].map(x => String(x).padStart(2, '0')).join(''); };
    const now = dg(START - n), was = dg(START - Math.max(0, n - 1));
    const TW = 34, TH = 50, TY = 50, GW = 2 * TW + 4, SEP = 30, X0 = (VW - (3 * GW + 2 * SEP)) / 2;
    const tile = (x, d, clipHalf) => {
      k.save(); k.beginPath(); if (clipHalf === 0) k.rect(x, TY, TW, TH / 2); else if (clipHalf === 1) k.rect(x, TY + TH / 2, TW, TH / 2); else k.rect(x, TY, TW, TH); k.clip();
      k.fillStyle = C.ink; rr(k, x, TY, TW, TH, 6); k.fill();
      txt(k, String(d), x + TW / 2, TY + TH / 2 + 1.5, `800 32px ${EN}`, '#FFFFFF', 'center', 'middle');
      k.restore();
    };
    // 入れ替わり: 古い数字が上へ抜け、新しい数字が下から入る
    const flip = (x, a, b, f) => {
      k.fillStyle = C.ink; rr(k, x, TY, TW, TH, 6); k.fill();
      k.save(); rr(k, x, TY, TW, TH, 6); k.clip();
      const o = eIO(clamp(f)) * TH;
      txt(k, String(a), x + TW / 2, TY + TH / 2 + 1.5 - o, `800 32px ${EN}`, '#FFFFFF', 'center', 'middle');
      txt(k, String(b), x + TW / 2, TY + TH / 2 + 1.5 + TH - o, `800 32px ${EN}`, '#FFFFFF', 'center', 'middle');
      k.restore();
    };
    view(k, () => {
      const g = k.createLinearGradient(0, 0, VW, VH); g.addColorStop(0, '#D6C2FF'); g.addColorStop(1, '#D6C2FF'); k.fillStyle = g; k.fillRect(0, 0, VW, VH);
      txt(k, 'キャンペーン終了まで', VW / 2, 34, `800 15px ${JP}`, '#FFFFFF', 'center');
      ['時間', '分', '秒'].forEach((lab, gi) => {
        const x = X0 + gi * (GW + SEP);
        for (let j = 0; j < 2; j++) { const p = gi * 2 + j, xx = x + j * (TW + 4); if (was[p] !== now[p]) flip(xx, was[p], now[p], fp); else tile(xx, now[p], 2); }
        txt(k, lab, x + GW / 2, TY + TH + 16, `700 11px ${JP}`, 'rgba(255,255,255,.9)', 'center', 'middle');
        if (gi < 2) txt(k, ':', x + GW + SEP / 2, TY + TH / 2, `800 26px ${EN}`, '#FFFFFF', 'center', 'middle');
      });
      btn(k, VW / 2 - 75, 132, 150, 28, '今すぐ申し込む', '#FFFFFF', C.acc, 12);
    });
  };

  // @element 21
  // 21 シェイプディバイダー（セクションの境目の波の形が、ゆっくりゆれ続ける）
  CELLS[20] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const a = 2 * Math.PI * u / CYC;
    const wave = (base, A1, L1, p1, A2, L2, p2) => { k.beginPath(); k.moveTo(0, VH + 1); for (let x = 0; x <= VW + 4; x += 4) k.lineTo(x, base + A1 * Math.sin(2 * Math.PI * x / L1 + p1) + A2 * Math.sin(2 * Math.PI * x / L2 + p2)); k.lineTo(VW, VH + 1); k.closePath(); };
    view(k, () => {
      const g = k.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#393840'); g.addColorStop(1, '#D8D6DE'); k.fillStyle = g; k.fillRect(0, 0, VW, VH);
      k.fillStyle = 'rgba(255,255,255,.9)'; k.beginPath(); k.arc(430, 44, 22, 0, 7); k.fill();
      txt(k, '夏のキャンペーン', 34, 42, `800 22px ${JP}`, '#FFFFFF'); btn(k, 34, 56, 96, 24, '詳しく見る', '#FFFFFF', C.blue, 11);
      k.fillStyle = 'rgba(255,255,255,.45)'; wave(100, 8, 260, a + 1, 4, 130, -2 * a); k.fill();
      k.fillStyle = '#FFFFFF'; wave(110, 9, 300, -a, 3.5, 110, 2 * a + 0.5); k.fill();
      txt(k, 'おすすめプラン', 34, 146, `800 15px ${JP}`, C.ink); bars(k, 170, 140, 290, 1, C.faint, 6);
      bars(k, 34, 156, 200, 1, C.faint, 5);
    });
  };

  // @element 22
  // 22 いいねアニメーション（ハートを押すと赤く塗られてポンと弾み、小さな粒が散る。数字が1増える）
  CELLS[21] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const ON = 0.9, OFF = 3.3, HX = 266, HY = 118;
    const liked = u >= ON && u < OFF, d = u - ON, d2 = u - OFF;
    let sc = 1;
    if (d >= 0 && d < 1.2) sc = d < 0.12 ? lerp(0.78, 1.45, eOut(d / 0.12)) : 1 + 0.45 * Math.exp(-7 * (d - 0.12)) * Math.cos((d - 0.12) * 15);
    else if (d < 0 && d > -0.1) sc = 1 - 0.22 * (1 + d / 0.1);
    if (d2 >= -0.1 && d2 < 0.3) sc = 1 - 0.16 * Math.sin(Math.PI * clamp((d2 + 0.1) / 0.4));
    const cur = t => path([[0, 430, 205], [0.5, 276, 130], [1.25, 276, 130], [1.8, 430, 160], [2.75, 430, 160], [3.1, 276, 130], [3.55, 276, 130], [4.1, 430, 205], [4.7, 430, 205]], t);
    const [cx, cy] = cur(u);
    view(k, () => {
      k.fillStyle = C.soft; k.fillRect(0, 0, VW, VH);
      k.fillStyle = '#FFFFFF'; rr(k, 16, 12, 479, 144, 12); k.fill();
      pic(k, 28, 24, 200, 120, 1, 8);
      k.fillStyle = C.blueL; k.beginPath(); k.arc(258, 40, 11, 0, 7); k.fill();
      txt(k, 'sample_trip', 276, 44.5, `700 13px ${EN}`, C.ink);
      bars(k, 248, 62, 220, 2, C.faint, 6, 12, 0.7);
      // 粒（小さく添える）とリング
      if (d >= 0.08 && d < 0.6) {
        const f = (d - 0.08) / 0.5;
        k.strokeStyle = `rgba(214,194,255,${0.5 * (1 - f)})`; k.lineWidth = 2; k.beginPath(); k.arc(HX, HY, 15 + 18 * eOut(f), 0, 7); k.stroke();
        for (let i = 0; i < 6; i++) { const an = -Math.PI / 2 + i * Math.PI / 3, r = 24 + 13 * eOut(f); k.fillStyle = [HEART, '#D6C2FF', C.acc][i % 3]; k.globalAlpha = 1 - f; k.beginPath(); k.arc(HX + Math.cos(an) * r, HY + Math.sin(an) * r, 2.4 * (1 - 0.5 * f), 0, 7); k.fill(); }
        k.globalAlpha = 1;
      }
      k.save(); k.translate(HX, HY + 2); k.scale(sc, sc); heartPath(k, 14.5);
      if (liked) { k.fillStyle = HEART; k.fill(); } else { k.lineWidth = 2.4; k.strokeStyle = C.ink; k.lineJoin = 'round'; k.stroke(); }
      k.restore();
      // 数字（128 ⇄ 129 が縦に入れ替わる）
      const nf = liked ? eOut(P(d, 0.05, 0.35)) : eOut(P(d2, 0.05, 0.35)), up = liked;
      k.save(); k.beginPath(); k.rect(292, HY - 13, 60, 26); k.clip();
      const A = up ? '128' : '129', Bn = up ? '129' : '128', dir = up ? -1 : 1, sh = 26 * nf * dir;
      const fA = `800 18px ${EN}`;
      if (u < ON || (d2 >= 0 && nf >= 1) || (liked && nf >= 1)) txt(k, liked ? '129' : '128', 294, HY + 1, fA, liked ? HEART : C.ink, 'left', 'middle');
      else { txt(k, A, 294, HY + 1 + sh, fA, up ? C.ink : HEART, 'left', 'middle'); txt(k, Bn, 294, HY + 1 + sh - 26 * dir, fA, up ? HEART : C.ink, 'left', 'middle'); }
      k.restore();
      click(k, cx, cy, u, [ON, OFF]);
    });
  };

  // @element 23
  // 23 スクロールダウンの合図（ファーストビューの下で「SCROLL」とマウスの形の中の点が、下へ促す動きをくり返す）
  CELLS[22] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const T = CYC / 3, f = mod(u, T) / T;
    view(k, () => {
      k.fillStyle = '#EFEEF1'; k.fillRect(0, 0, VW, VH);
      txt(k, 'ようこそ、', 40, 40, `800 22px ${JP}`, C.ink); txt(k, '山の上の宿へ。', 40, 70, `800 22px ${JP}`, C.ink);
      bars(k, 40, 84, 170, 2, '#D8D6DE');
      pic(k, 286, 10, 200, 92, 1, 10);
      // 合図
      const mx = VW / 2;
      txt(k, 'SCROLL', mx, 116, `800 11px ${EN}`, C.ink, 'center', 'middle', '3px');
      k.strokeStyle = C.ink; k.lineWidth = 2.2; rr(k, mx - 12, 126, 24, 38, 12); k.stroke();
      const dy = eIOs(clamp(f / 0.7)) * 14, da = 1 - clamp((f - 0.45) / 0.3);
      k.fillStyle = `rgba(11,11,15,${da})`; rr(k, mx - 2.5, 133 + dy, 5, 9, 2.5); k.fill();
      // 両わきの矢印も下へ流れる
      [mx - 40, mx + 40].forEach(x => { for (let j = 0; j < 2; j++) { const ff = mod(f + j * 0.5, 1), yy = 128 + ff * 24, al = Math.sin(Math.PI * ff); k.strokeStyle = `rgba(11,11,15,${0.8 * al})`; k.lineWidth = 2.5; k.lineCap = 'round'; k.lineJoin = 'round'; k.beginPath(); k.moveTo(x - 8, yy); k.lineTo(x, yy + 8); k.lineTo(x + 8, yy); k.stroke(); } });
    });
  };

  // @element 24
  // 24 背景動画（ファーストビューの背景で雲と波が流れ続け、その上に見出しとボタンが乗っている）
  function cloud(k, x, y, s, a) { k.fillStyle = `rgba(255,255,255,${a})`; k.beginPath(); k.ellipse(x, y, 30 * s, 10 * s, 0, 0, 7); k.ellipse(x - 12 * s, y - 6 * s, 14 * s, 11 * s, 0, 0, 7); k.ellipse(x + 8 * s, y - 10 * s, 17 * s, 14 * s, 0, 0, 7); k.fill(); }
  CELLS[23] = (k, w, h, u) => {
    u = snapU(u);
    frame(k);
    const f = u / CYC;
    view(k, () => {
      const g = k.createLinearGradient(0, 0, 0, 120); g.addColorStop(0, '#A6A3AE'); g.addColorStop(1, '#EFEEF1'); k.fillStyle = g; k.fillRect(0, 0, VW, VH);
      k.fillStyle = 'rgba(239,238,241,.95)'; k.beginPath(); k.arc(400, 66, 20, 0, 7); k.fill();
      // 遠い雲（170px ごとにくり返す柄が、1周期で1柄ぶん流れる）・近い雲（340px）
      for (let x = -170; x < VW + 170; x += 170) { const xx = x + mod(f * 170, 170); cloud(k, xx + 40, 30, 0.7, 0.75); cloud(k, xx + 120, 58, 0.55, 0.6); }
      for (let x = -340; x < VW + 340; x += 340) { const xx = x + mod(f * 340, 340); cloud(k, xx + 90, 44, 1.15, 0.95); cloud(k, xx + 260, 86, 0.9, 0.9); }
      mount(k, VW, 132, [[0, .78], [.18, .66], [.36, .76], [.6, .62], [.82, .74], [1, .68]], '#A6A3AE', 0);
      const sea = (y0, A, L, ph, col) => { k.fillStyle = col; k.beginPath(); k.moveTo(0, VH + 1); for (let x = 0; x <= VW + 4; x += 4) k.lineTo(x, y0 + A * Math.sin(2 * Math.PI * x / L + ph)); k.lineTo(VW, VH + 1); k.closePath(); k.fill(); };
      sea(118, 2.5, 90, -2 * Math.PI * f, '#A6A3AE'); sea(130, 3, 60, 2 * Math.PI * f * 2, '#A6A3AE'); sea(146, 2.5, 120, -2 * Math.PI * f, '#62616C');
      k.fillStyle = 'rgba(11,11,15,.12)'; k.fillRect(0, 0, VW, VH);
      { const sg = k.createLinearGradient(0, 0, 300, 0); sg.addColorStop(0, 'rgba(11,11,15,.45)'); sg.addColorStop(1, 'rgba(11,11,15,0)'); k.fillStyle = sg; k.fillRect(0, 0, 300, VH); }
      k.save(); k.shadowColor = 'rgba(11,11,15,.55)'; k.shadowBlur = 10; k.shadowOffsetY = 2; txt(k, '旅に出よう。', 34, 60, `800 28px ${JP}`, '#FFFFFF', 'left', 'alphabetic', '1px'); k.restore();
      bars(k, 34, 74, 160, 1, 'rgba(255,255,255,.85)');
      btn(k, 34, 92, 96, 26, '予約する');
      // 再生中の印（一時停止・音なし）
      k.fillStyle = 'rgba(11,11,15,.5)'; rr(k, 420, 134, 76, 24, 12); k.fill();
      k.fillStyle = '#FFFFFF'; k.fillRect(435, 140, 3.5, 12); k.fillRect(442, 140, 3.5, 12);
      k.beginPath(); k.moveTo(462, 143); k.lineTo(466, 143); k.lineTo(471, 139); k.lineTo(471, 153); k.lineTo(466, 149); k.lineTo(462, 149); k.closePath(); k.fill();
      k.strokeStyle = '#FFFFFF'; k.lineWidth = 1.6; k.lineCap = 'round'; k.beginPath(); k.moveTo(476, 143); k.lineTo(482, 149); k.moveTo(482, 143); k.lineTo(476, 149); k.stroke();
    });
  };

  // @end
  return { width: CW, height: CH, cycle: LOOP, cells: CELLS, fonts: [] };
});
