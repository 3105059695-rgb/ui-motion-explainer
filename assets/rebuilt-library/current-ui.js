/* Current UI binding for reconstructed scene programs.
 * Geometry and timelines belong to each scene. These material roles come from
 * agent-editorial/source/body-a.js (sheet/file/sign) and body-b.js (screen/file),
 * through the executable AgentEditorial SDK, not screenshots or a new template.
 * Original media pixels, natural materials and shader content are not recolored.
 */
(function (global) {
  'use strict';
  const ID = 'ten-agents-body-a', VERSION = 1;
  const roles = Object.freeze({
    panel: {depth: 8, radius: 18},
    screen: {depth: 9, radius: 18, edge: '#0B0B0F', lineWidth: 3},
    sheet: {depth: 10, radius: 12},
    file: {depth: 8, radius: 16},
    button: {depth: 3, radius: 12},
    tile: {depth: 6, radius: 22},
    table: {depth: 7, radius: 12}
  });
  const layoutCorrections = Object.freeze({
    'fredtalk:episode-scenes-1018-t02m': 'Anchor the two existing connectors to moving window edges; the old absolute connector crossed the first label.',
    'fredtalk:fred-wave3-40-t09j': 'Raise the existing helper label 28 px inside its window so it clears the code cells.'
  });
  function layout(scene, node, time, readState) {
    if (scene.id === 'fredtalk:fred-wave3-40-t09j' && node.id === 'n005-text') return {y: node.y - 28};
    if (scene.id === 'fredtalk:episode-scenes-1018-t02m' && ['n010', 'n011'].includes(node.id)) {
      const pair = node.id === 'n010' ? ['n003', 'n006'] : ['n006', 'n009'];
      const bounds = pair.map(id => {
        const group = readState(scene.nodes.find(n => n.id === id), time), windowNode = group.children.find(n => n.kind === 'window');
        const scale = group.scale ?? 1;
        return {x: (group.x || 0) + 960 + (windowNode.x - 960) * scale, y: (group.y || 0) + 540 + (windowNode.y + windowNode.h / 2 - 540) * scale, w: windowNode.w * scale};
      });
      return {x: bounds[0].x + bounds[0].w + 12, y: bounds[0].y, w: Math.max(0, bounds[1].x - bounds[0].x - bounds[0].w - 24), h: bounds[1].y - bounds[0].y};
    }
    return null;
  }
  function create(ctx, options = {}) {
    const mode = options.mode || 'current';
    if (!['current', 'historic'].includes(mode)) throw Error('Unknown UI mode: ' + mode);
    const font = options.fontFamily || 'Noto, sans-serif';
    const raw = global.AgentEditorial.create(ctx, {...options, fontFamily: font});
    const C = global.AgentEditorial.palette;
    const current = mode === 'current';
    function fittedSize(value, size, weight = 800, maxWidth) {
      if (!current || !(maxWidth > 0)) return size;
      ctx.save();ctx.font = `${weight} ${size}px ${font}`;
      const width = ctx.measureText(String(value)).width;ctx.restore();
      return width > maxWidth ? size * maxWidth / width : size;
    }
    function text(value, x, y, size = 40, color = C.black, weight = 800, align = 'left', maxWidth) {
      if (!current) return raw.text(value, x, y, size, color, weight, align, maxWidth);
      // Fit both axes together. Canvas fillText(maxWidth) squeezes glyphs sideways.
      return raw.text(value, x, y, fittedSize(value, size, weight, maxWidth), color, weight, align);
    }
    function ink(fill, preferred) {
      if (!current) return preferred || C.white;
      if (fill === C.purple && (!preferred || preferred.toUpperCase() === '#FFFFFF')) return C.black;
      return preferred || (fill === C.black ? C.white : C.black);
    }
    function surface(role, r, opts = {}) {
      if (!roles[role]) throw Error('Unknown UI material role: ' + role);
      return raw.card(r, {
        ...roles[role], shadow: 22, shadowOffsetY: 10, shadowColor: '#00000018',
        depthColor: opts.dark ? '#777780' : C.line, ...opts
      });
    }
    function card(r, opts = {}) {
      return current ? surface('panel', r, opts) : raw.card(r, opts);
    }
    function screen(r, title, opts = {}) {
      if (!current) return raw.screen(r, title, opts);
      const dark = opts.dark || opts.fill === C.black;
      const result = raw.screen(r, '', {
        shadow: 22, shadowOffsetY: 10, shadowColor: '#00000018',
        headerLine: dark ? '#777780' : C.black, ...opts
      });
      const header = opts.headerHeight ?? 49;
      // The title and small window controls are the actual accepted screen chrome.
      if (dark) {
        for (let i = 0; i < 2; i++) {ctx.beginPath();ctx.arc(r.x + 24 + i * 18, r.y + header / 2, 5, 0, Math.PI * 2);ctx.fillStyle = i ? C.line : C.purple;ctx.fill();}
      }
      text(title, r.x + 67, r.y + header * .67, opts.titleSize || 22, opts.titleColor || (dark ? C.white : C.black), 700, 'left', r.w - 90);
      return result;
    }
    function file(r, title, opts = {}) {
      if (!current) return raw.file(r, title, opts);
      // Keep the approved file body/fold/accent; fit labels without distortion.
      raw.file(r, '', {...opts, detail: '', shadow: 22, shadowOffsetY: 10, shadowColor: '#00000018'});
      const pad = opts.padding ?? 24;
      text(title, r.x + pad + 18, r.y + r.h * .5, opts.size || 27, opts.color || C.black, 800, 'left', r.w - pad * 2 - 20);
      if (opts.detail) text(opts.detail, r.x + pad + 18, r.y + r.h * .72, opts.detailSize || 20, C.muted, 550, 'left', r.w - pad * 2 - 20);
    }
    function sheet(r, title, opts = {}) {
      if (!current) return raw.sheet(r, title, opts);
      const pad = opts.padding ?? 25, color = opts.dark ? C.white : C.black;
      surface('sheet', r, opts);raw.rr(r.x + pad, r.y + 24, 48, 7, 3, C.purple);
      text(title, r.x + pad, r.y + 80, opts.size || 32, opts.color || color, 800, 'left', r.w - 2 * pad);
      (opts.lines || []).forEach((line, i) => text(line, r.x + pad, r.y + 135 + i * (opts.lineHeight || 38), opts.bodySize || 25, opts.bodyColor || color, 550, 'left', r.w - 2 * pad));
    }
    function pill(value, r, opts = {}) {
      if (!current) return raw.pill(value, r, opts);
      const fill = opts.fill || C.black, size = opts.size || 30;
      raw.rr(r.x, r.y, r.w, r.h, opts.radius ?? r.h * .28, fill);
      text(value, r.x + r.w / 2, r.y + r.h / 2 + size * .35, size, ink(fill, opts.color), opts.weight || 800, 'center', r.w - (opts.padding ?? 24));
    }
    function check(x, y, r = 22, opts = {}) {
      // Older custom scenes supplied a color string to the SDK's options argument.
      if (current && typeof opts === 'string') opts = {fill: opts, color: ink(opts)};
      return raw.check(x, y, r, opts);
    }
    return Object.freeze({...raw, current, fontFamily: font, fittedSize, ink, surface, text, card, screen, file, sheet, pill, check,
      uiBinding: {mode, id: ID, version: VERSION, accent: C.purple}});
  }
  global.RebuiltUI = Object.freeze({id: ID, version: VERSION, roles, create, layout, layoutCorrections});
})(typeof window === 'undefined' ? globalThis : window);
