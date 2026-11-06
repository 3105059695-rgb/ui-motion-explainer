/* Original, locally drawn 3D toy-brick car. No images, fonts, brand geometry or deps.
 * ToyCar.draw(ctx,{cx,cy,scale,yaw,pitch,explode,focus,opacity,time})
 * yaw/pitch are camera angles in radians; explode/focus are normalized 0..1.
 * Returns a screen-space bounding box for the same purple-hood brick, including studs.
 */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = x => Math.max(0, Math.min(1, x));
  const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const normal = points => {
    const n = cross(sub(points[1], points[0]), sub(points[2], points[0]));
    const m = Math.hypot(...n) || 1; return n.map(v => v / m);
  };
  const light = [-0.38, 0.83, 0.41];
  const palette = { body: '#E7E6E9', roof: '#F6F4F4', hood: '#BEA6DE', tire: '#24242B', sidewall: '#303037', rim: '#C5C5CE', glass: '#505461', frame: '#383941', bumper: '#54555D' };
  const parts = [];
  function part(id, drift, focusDrift) {
    const p = { id, drift, focusDrift: focusDrift || drift, faces: [] }; parts.push(p); return p;
  }
  function face(p, vertices, color, extra) {
    p.faces.push(Object.assign({ vertices, normal: normal(vertices), color, alpha: 1, edge: 0.1 }, extra || {}));
  }
  function octagon(x0, x1, z0, z1, bevel, y) {
    return [[x0 + bevel, y, z0], [x1 - bevel, y, z0], [x1, y, z0 + bevel], [x1, y, z1 - bevel],
      [x1 - bevel, y, z1], [x0 + bevel, y, z1], [x0, y, z1 - bevel], [x0, y, z0 + bevel]];
  }
  function brick(p, x0, y0, z0, x1, y1, z1, color, b) {
    b = Math.min(b == null ? 0.075 : b, (y1 - y0) * 0.3);
    const loops = [
      octagon(x0 + b * 0.5, x1 - b * 0.5, z0 + b * 0.5, z1 - b * 0.5, b, y0),
      octagon(x0, x1, z0, z1, b, y0 + b),
      octagon(x0, x1, z0, z1, b, y1 - b),
      octagon(x0 + b * 0.5, x1 - b * 0.5, z0 + b * 0.5, z1 - b * 0.5, b, y1)
    ];
    face(p, loops[0], color, { edge: 0.05 });
    face(p, [...loops[3]].reverse(), color, { edge: 0.09 });
    for (let j = 0; j < loops.length - 1; j++) {
      for (let i = 0; i < 8; i++) {
        const k = (i + 1) % 8;
        face(p, [loops[j][i], loops[j + 1][i], loops[j + 1][k], loops[j][k]], color, { edge: j === 1 ? 0.085 : 0.025, shine: j === 2 ? 0.06 : 0 });
      }
    }
  }
  function cylinder(p, center, radius, length, axis, color, segments, options) {
    const opt = options || {}, n = segments || 22;
    const a = [], b = [];
    for (let i = 0; i < n; i++) {
      const theta = TAU * i / n;
      if (axis === 'y') {
        a.push(add(center, [Math.cos(theta) * radius, -length / 2, Math.sin(theta) * radius]));
        b.push(add(center, [Math.cos(theta) * radius, length / 2, Math.sin(theta) * radius]));
      } else {
        a.push(add(center, [Math.cos(theta) * radius, Math.sin(theta) * radius, -length / 2]));
        b.push(add(center, [Math.cos(theta) * radius, Math.sin(theta) * radius, length / 2]));
      }
    }
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const pts = axis === 'y' ? [a[i], b[i], b[j], a[j]] : [a[i], a[j], b[j], b[i]];
      face(p, pts, opt.tread && i % 3 === 0 ? '#36363D' : color, { edge: opt.tread ? 0.16 : 0, shine: opt.shine || 0 });
    }
    face(p, axis === 'y' ? a : [...a].reverse(), opt.capColor || color, { edge: opt.edge == null ? 0.07 : opt.edge });
    face(p, axis === 'y' ? [...b].reverse() : b, opt.capColor || color, { edge: opt.edge == null ? 0.07 : opt.edge, shine: opt.shine || 0 });
  }
  function stud(p, x, y, z, color) {
    cylinder(p, [x, y + 0.115, z], 0.245, 0.23, 'y', color, 20, { capColor: color, shine: 0.04, edge: 0.08 });
    // A narrow molded ridge on the stud's top adds real depth at its highlight edge.
    cylinder(p, [x, y + 0.232, z], 0.20, 0.016, 'y', color, 20, { edge: 0.035, shine: 0.09 });
  }
  function studs(p, xs, y, zs, color) { for (const x of xs) for (const z of zs) stud(p, x, y, z, color); }
  function beam(p, a, b, radius, color) {
    // Rectangular bars between two points, keeping genuine thickness on window pillars.
    const d = sub(b, a), len = Math.hypot(...d), v = d.map(n => n / len);
    let side = cross(v, [0, 0, 1]);
    let sl = Math.hypot(...side);
    if (sl < 0.01) { side = cross(v, [0, 1, 0]); sl = Math.hypot(...side); }
    side = side.map(n => n / sl * radius);
    const other = cross(v, side);
    const corners = (point) => [add(add(point, side), other), add(sub(point, side), other), sub(sub(point, side), other), add(sub(point, other), side)];
    const aa = corners(a), bb = corners(b);
    face(p, [...aa].reverse(), color); face(p, bb, color);
    for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; face(p, [aa[i], aa[j], bb[j], bb[i]], color, { edge: 0.045 }); }
  }
  function glass(p, points, color, reflectionPoints) {
    face(p, points, color, { edge: 0.24, shine: 0.02, alpha: 0.98 });
    if (reflectionPoints) face(p, reflectionPoints, '#E9EAF0', { unlit: true, alpha: 0.30, edge: 0, bias: 0.012 });
  }

  // Vehicle proportions: longitudinal x; height y; width z. Front is +x.
  const chassis = part('chassis', [0, -0.52, 0], [0, -2.2, -1.4]);
  brick(chassis, -4.45, -0.30, -1.55, 4.43, 0.35, 1.55, palette.body, 0.11);
  brick(chassis, -4.02, -0.56, -1.31, 4.03, -0.27, 1.31, '#51515A', 0.07);
  for (const side of [-1, 1]) {
    brick(chassis, -3.88, 0.13, side > 0 ? 1.54 : -1.62, 3.88, 0.28, side > 0 ? 1.62 : -1.54, '#BCA7D6', 0.025);
  }

  const doors = part('door-body', [0, 0.26, 0], [-0.5, 0.1, -3.3]);
  brick(doors, -2.45, 0.35, -1.60, 1.35, 0.86, 1.60, palette.body, 0.055);
  for (const side of [-1, 1]) {
    const z = side * 1.614;
    face(doors, [[-2.10, 0.37, z], [1.01, 0.37, z], [1.01, 0.77, z], [-2.10, 0.77, z]], '#E6E5E8', { edge: 0.17, bias: 0.008 });
    brick(doors, -1.77, 0.66, side > 0 ? 1.61 : -1.67, -1.18, 0.75, side > 0 ? 1.67 : -1.61, '#76757F', 0.02);
  }

  const hood = part('purple-hood', [0.82, 1.05, 0.24], [0, 0, 0]);
  brick(hood, 1.42, 0.51, -1.62, 4.16, 1.19, 1.62, palette.hood, 0.085);
  studs(hood, [2.07, 3.39], 1.19, [-1.03, 0, 1.03], palette.hood);

  const rear = part('rear-brick', [-1.10, 0.8, -0.10], [-3.0, 1.0, -1.6]);
  brick(rear, -4.20, 0.40, -1.59, -2.43, 1.14, 1.59, palette.body, 0.085);
  studs(rear, [-3.74, -2.89], 1.14, [-0.83, 0.83], palette.body);

  const cabin = part('glass-cabin', [-0.08, 2.05, -0.10], [-2.6, 3.3, -1.3]);
  // Four separate window planes, with white pillars, rather than a painted rectangle.
  for (const side of [-1, 1]) {
    const zLo = side * 1.53, zHi = side * 1.38;
    const a = [-2.49, 0.83, zLo], b = [1.36, 0.83, zLo], c = [0.43, 2.10, zHi], d = [-1.78, 2.10, zHi];
    const q = side > 0 ? [a, b, c, d] : [d, c, b, a];
    glass(cabin, q, side > 0 ? '#60616D' : '#3C424F', [
      [-1.73, 2.075, zHi + side * 0.018], [-1.04, 2.075, zHi + side * 0.018],
      [-1.68, 0.90, zLo + side * 0.018], [-2.33, 0.90, zLo + side * 0.018]
    ]);
    beam(cabin, a, d, 0.073, palette.roof); beam(cabin, b, c, 0.076, palette.roof);
    beam(cabin, [-0.61, 0.85, zLo + side * 0.013], [-0.61, 2.11, zHi + side * 0.013], 0.05, palette.frame);
    beam(cabin, a, b, 0.044, palette.frame);
  }
  glass(cabin, [[1.40, 0.87, -1.48], [1.40, 0.87, 1.48], [0.46, 2.10, 1.37], [0.46, 2.10, -1.37]], '#464B5B', [
    [0.486, 2.08, -1.13], [0.486, 2.08, -0.48], [1.369, 0.92, -0.13], [1.369, 0.92, -0.80]
  ]);
  glass(cabin, [[-2.50, 0.87, 1.48], [-2.50, 0.87, -1.48], [-1.81, 2.09, -1.37], [-1.81, 2.09, 1.37]], '#535560');
  // Tiny molded wipers on the actual sloping windshield plane.
  beam(cabin, [1.37, 0.92, -1.00], [1.22, 1.12, -0.14], 0.016, '#202229');
  beam(cabin, [1.37, 0.92, 0.24], [1.22, 1.12, 1.09], 0.016, '#202229');

  const roof = part('roof-brick', [-0.06, 3.25, 0.0], [-2.0, 4.8, -0.5]);
  brick(roof, -1.94, 2.10, -1.45, 0.57, 2.48, 1.45, palette.roof, 0.08);
  studs(roof, [-1.33, -0.07], 2.48, [-0.91, 0, 0.91], palette.roof);

  const nose = part('front-bumper', [1.72, 0.04, 0], [3.5, 0.2, -0.5]);
  brick(nose, 4.17, 0.32, -1.53, 4.46, 1.06, 1.53, palette.body, 0.07);
  brick(nose, 4.32, -0.03, -1.76, 4.65, 0.31, 1.76, '#C5C4CD', 0.07);
  brick(nose, 4.47, 0.08, -1.30, 4.66, 0.20, 1.30, palette.bumper, 0.025);
  // Light lenses sit on the +x face; they are geometry, not screen-space decorations.
  for (const side of [-1, 1]) {
    const z = side * 1.00;
    brick(nose, 4.455, 0.64, z - 0.31, 4.52, 0.96, z + 0.31, '#F7F4DE', 0.035);
    brick(nose, 4.524, 0.76, z - 0.23, 4.538, 0.87, z + 0.23, '#FFFFF8', 0.012);
  }
  brick(nose, 4.467, 0.42, -0.60, 4.50, 0.68, 0.60, '#34363F', 0.03);
  for (const z of [-0.36, 0, 0.36]) brick(nose, 4.505, 0.455, z - 0.031, 4.523, 0.645, z + 0.031, '#9799A3', 0.009);

  const tail = part('rear-bumper', [-1.80, -0.12, 0], [-4.0, -0.2, -0.6]);
  brick(tail, -4.66, -0.03, -1.72, -4.36, 0.34, 1.72, '#C8C7CF', 0.06);
  for (const side of [-1, 1]) brick(tail, -4.30, 0.59, side * 1.02 - 0.27, -4.22, 0.92, side * 1.02 + 0.27, '#9D6470', 0.045);

  // Four thick rubber tires, with recessed sidewalls, metal rims and five hub spokes.
  for (const axle of [-1, 1]) for (const side of [-1, 1]) {
    const x = axle * 2.82, y = -0.41, z = side * 1.72;
    const wheel = part(`wheel-${axle > 0 ? 'front' : 'rear'}-${side > 0 ? 'near' : 'far'}`,
      [axle * 0.38, -0.10, side * 1.70], [axle * 2.6, -1.2, side * 3.8]);
    cylinder(wheel, [x, y, z], 0.93, 0.64, 'z', palette.tire, 36, { tread: true, capColor: '#29292F', edge: 0.02 });
    const outer = z + side * 0.339;
    cylinder(wheel, [x, y, outer], 0.77, 0.06, 'z', palette.sidewall, 32, { edge: 0.04, capColor: '#37373F' });
    cylinder(wheel, [x, y, outer + side * 0.041], 0.54, 0.042, 'z', '#777985', 28, { capColor: palette.rim, edge: 0.12 });
    cylinder(wheel, [x, y, outer + side * 0.072], 0.41, 0.028, 'z', '#373944', 24, { capColor: '#555763', edge: 0.04 });
    const hubZ = outer + side * 0.096;
    for (let i = 0; i < 5; i++) {
      const a = TAU * i / 5 + 0.25;
      const points = [[0.13, -0.065], [0.42, -0.044], [0.42, 0.044], [0.13, 0.065]].map(([r, w]) => [x + Math.cos(a) * r - Math.sin(a) * w, y + Math.sin(a) * r + Math.cos(a) * w, hubZ]);
      face(wheel, side > 0 ? points : [...points].reverse(), '#E0DFE7', { edge: 0.08, shine: 0.05 });
    }
    cylinder(wheel, [x, y, hubZ + side * 0.009], 0.165, 0.04, 'z', '#93949F', 20, { capColor: '#D5D4DE', edge: 0.09 });
    // Sidewall rings add molded rubber detail without any logo or text.
    for (let i = 0; i < 30; i++) {
      const a = TAU * i / 30;
      const r1 = 0.68, r2 = 0.705, da = 0.035;
      const pts = [[r1, a - da], [r2, a - da], [r2, a + da], [r1, a + da]].map(([r, ang]) => [x + r * Math.cos(ang), y + r * Math.sin(ang), outer + side * 0.034]);
      face(wheel, side > 0 ? pts : [...pts].reverse(), '#575761', { edge: 0, unlit: true, alpha: 0.4 });
    }
  }

  function tint(hex, value, shine) {
    const n = parseInt(hex.slice(1), 16), k = value, white = shine || 0;
    const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(Math.max(0, Math.min(255, v * k * (1 - white) + 255 * white))));
    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }
  function draw(ctx, opts) {
    const o = opts || {};
    const cx = o.cx == null ? 1100 : o.cx, cy = o.cy == null ? 540 : o.cy;
    const unit = 102 * (o.scale == null ? 1 : o.scale);
    const yaw = o.yaw == null ? -0.45 : o.yaw, pitch = o.pitch == null ? 0.28 : o.pitch;
    const ex = ease(o.explode || 0), focus = ease(o.focus || 0), opacity = clamp(o.opacity == null ? 1 : o.opacity);
    const cosine = Math.cos(yaw), sine = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const project = v => {
      const xx = v[0] * cosine + v[2] * sine, zz = -v[0] * sine + v[2] * cosine;
      const yy = (v[1] - 0.58) * cp - zz * sp, depth = zz * cp + (v[1] - 0.58) * sp;
      const perspective = 39 / Math.max(22, 39 - depth);
      return { x: cx + xx * unit * perspective, y: cy - yy * unit * perspective, depth };
    };
    const projected = [], focusPoints = [];
    ctx.save(); ctx.globalAlpha *= opacity;
    // Broad ground contact and four tight tire contact shadows, softened separately.
    if (focus < 0.995 && unit > 0) {
      const ground = project([0, -1.355, 0]);
      ctx.save(); ctx.globalAlpha *= (1 - focus) * (1 - ex * 0.60);
      ctx.translate(ground.x, ground.y); ctx.rotate(-yaw * 0.20);
      ctx.filter = `blur(${Math.max(7, unit * 0.17)}px)`;
      ctx.fillStyle = 'rgba(33,29,43,0.19)'; ctx.beginPath(); ctx.ellipse(0, 0, unit * 4.75, unit * 0.94, 0, 0, TAU); ctx.fill();
      ctx.restore();
      for (const axle of [-1, 1]) for (const side of [-1, 1]) {
        const c = project([axle * (2.82 + ex * 0.38), -1.355, side * (1.72 + ex * 1.7)]);
        ctx.save(); ctx.globalAlpha *= (1 - focus) * (1 - ex * 0.80);
        ctx.filter = `blur(${Math.max(3, unit * 0.058)}px)`; ctx.fillStyle = 'rgba(27,25,34,0.28)';
        ctx.beginPath(); ctx.ellipse(c.x, c.y, unit * 0.73, unit * 0.23, -yaw * 0.27, 0, TAU); ctx.fill(); ctx.restore();
      }
    }
    for (const p of parts) {
      const isHood = p.id === 'purple-hood';
      const alpha = isHood ? 1 : Math.pow(1 - focus, 1.65);
      if (alpha < 0.001) continue;
      const offset = p.drift.map((v, i) => v * ex + (isHood ? 0 : p.focusDrift[i] * focus));
      for (const f of p.faces) {
        const pts = f.vertices.map(v => project(add(v, offset)));
        if (isHood) focusPoints.push(...pts);
        const diffuse = Math.max(0, f.normal[0] * light[0] + f.normal[1] * light[1] + f.normal[2] * light[2]);
        const shade = f.unlit ? 1 : 0.61 + diffuse * 0.42;
        projected.push({ pts, color: tint(f.color, shade, f.shine), alpha: alpha * f.alpha,
          depth: pts.reduce((n, v) => n + v.depth, 0) / pts.length + (f.bias || 0), edge: f.edge });
      }
    }
    projected.sort((a, b) => a.depth - b.depth);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    for (const f of projected) {
      ctx.save(); ctx.globalAlpha *= f.alpha;
      ctx.beginPath(); f.pts.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath();
      ctx.fillStyle = f.color; ctx.fill();
      if (f.edge) { ctx.strokeStyle = `rgba(25,23,31,${f.edge})`; ctx.lineWidth = Math.max(0.45, unit * 0.008); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    if (!focusPoints.length) return { focusPiece: null, faceCount: projected.length };
    const xs = focusPoints.map(v => v.x), ys = focusPoints.map(v => v.y);
    const x = Math.min(...xs), y = Math.min(...ys), w = Math.max(...xs) - x, h = Math.max(...ys) - y;
    return { focusPiece: { id: 'purple-hood', x, y, w, h, cx: x + w / 2, cy: y + h / 2 }, faceCount: projected.length };
  }
  window.ToyCar = { draw, focusPieceId: 'purple-hood', units: 'world units; y up, front +x', partCount: parts.length };
})();
