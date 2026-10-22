/* Independent authored motion primitives for this package.
 * Every result depends only on time, parameters and an explicit fixed seed.
 * No DOM, timers, mutable animation state, CSS transitions, or external deps.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.MotionCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
  const mix = (a, b, p) => a + (b - a) * p;
  const smooth = p => { p = clamp(p); return p * p * (3 - 2 * p); };
  const progress = (t, start = 0, duration = 1) => clamp((t - start) / Math.max(1e-9, duration));
  const loopTime = (t, duration) => ((t % duration) + duration) % duration;
  const number = x => Number(x.toFixed(4));

  function springState(t, options = {}) {
    const { from = 0, to = 1, velocity = 0, omega = 13, damping = 0.72, start = 0 } = options;
    const elapsed = t - start;
    if (elapsed < 0) return { value: from, velocity: 0 };
    if (!(omega > 0) || !(damping >= 0)) throw new RangeError('omega must be positive; damping must be nonnegative');
    const a = from - to;
    let displacement, speed;
    if (Math.abs(damping - 1) < 1e-7) {
      const b = velocity + omega * a;
      const decay = Math.exp(-omega * elapsed);
      displacement = (a + b * elapsed) * decay;
      speed = (b - omega * (a + b * elapsed)) * decay;
    } else if (damping < 1) {
      const alpha = damping * omega;
      const wd = omega * Math.sqrt(1 - damping * damping);
      const b = (velocity + alpha * a) / wd;
      const decay = Math.exp(-alpha * elapsed);
      const sin = Math.sin(wd * elapsed), cos = Math.cos(wd * elapsed);
      displacement = decay * (a * cos + b * sin);
      speed = decay * (-alpha * (a * cos + b * sin) + wd * (-a * sin + b * cos));
    } else {
      const d = Math.sqrt(damping * damping - 1);
      const r1 = -omega * (damping - d), r2 = -omega * (damping + d);
      const c1 = (velocity - r2 * a) / (r1 - r2), c2 = a - c1;
      displacement = c1 * Math.exp(r1 * elapsed) + c2 * Math.exp(r2 * elapsed);
      speed = r1 * c1 * Math.exp(r1 * elapsed) + r2 * c2 * Math.exp(r2 * elapsed);
    }
    return { value: to + displacement, velocity: speed };
  }
  const spring = (t, options) => springState(t, options).value;

  function springTrack(t, events, options = {}) {
    let value = options.initial ?? 0, velocity = 0, target = value;
    const ordered = [...events].sort((a, b) => a.at - b.at);
    for (const event of ordered) {
      const delta = event.value - target;
      if (t >= event.at) {
        const response = springState(t, { omega: options.omega ?? 13, damping: options.damping ?? 0.72, ...(event.spring || {}), from: 0, to: delta, start: event.at, velocity: 0 });
        value += response.value;
        velocity += response.velocity;
      }
      target = event.value;
    }
    return { value, velocity };
  }

  function liquidStretch(t, events, options = {}) {
    const { initial = 60, width = 72, leadingDelay = 0, trailingDelay = 0.065, omega = 17, damping = 0.78 } = options;
    let left = initial - width / 2, right = initial + width / 2, previous = initial;
    for (const event of [...events].sort((a, b) => a.at - b.at)) {
      const delta = event.value - previous;
      const leftDelay = delta >= 0 ? trailingDelay : leadingDelay;
      const rightDelay = delta >= 0 ? leadingDelay : trailingDelay;
      left += spring(t, { from: 0, to: delta, start: event.at + leftDelay, omega, damping });
      right += spring(t, { from: 0, to: delta, start: event.at + rightDelay, omega, damping });
      previous = event.value;
    }
    return { left, right, center: (left + right) / 2, width: Math.max(1, right - left) };
  }

  function cubicBezier(u, p0, p1, p2, p3) {
    u = clamp(u);
    const v = 1 - u;
    const sample = (a, b, c, d) => v * v * v * a + 3 * v * v * u * b + 3 * v * u * u * c + u * u * u * d;
    if (typeof p0 === 'number') return sample(p0, p1, p2, p3);
    return { x: sample(p0.x, p1.x, p2.x, p3.x), y: sample(p0.y, p1.y, p2.y, p3.y) };
  }

  function clickPress(t, options = {}) {
    const { at = 0, duration = 0.2, depth = 0.08 } = options;
    const p = progress(t, at, duration);
    const press = t < at || t >= at + duration ? 0 : Math.sin(Math.PI * p) ** 2;
    return { press, scale: 1 - depth * press, offsetY: 2.5 * press };
  }

  function cursorPath(t, options) {
    const { points, start = 0, duration = 1, clicks = [], depth = 0.12 } = options;
    if (!Array.isArray(points) || points.length !== 4) throw new RangeError('cursorPath needs four cubic control points');
    const point = cubicBezier(smooth(progress(t, start, duration)), ...points);
    const press = Math.max(0, ...clicks.map(at => clickPress(t, { at, depth }).press));
    return { ...point, press, scale: 1 - depth * press };
  }

  function directDrag(t, options = {}) {
    const { from = 25, to = 140, min = 0, max = 100, start = 0, duration = 1, resistance = 0.22, omega = 17, damping = 0.62, releaseVelocity = 0 } = options;
    if (!(duration > 0) || !(max > min)) throw new RangeError('drag duration and range must be positive');
    const rubber = raw => raw < min ? min + (raw - min) * resistance : raw > max ? max + (raw - max) * resistance : raw;
    const raw = mix(from, to, progress(t, start, duration));
    const released = t >= start + duration;
    const value = released ? spring(t, { from: rubber(to), to: clamp(to, min, max), velocity: releaseVelocity, start: start + duration, omega, damping }) : rubber(raw);
    return { value, raw, held: t >= start && !released, released, overshoot: value - clamp(value, min, max), fraction: (value - min) / (max - min) };
  }

  function maskedType(t, options = {}) {
    const { count = 2, start = 0, duration = 0.65, stagger = 0.13, travel = 110 } = options;
    return Array.from({ length: count }, (_, i) => {
      const p = smooth(progress(t, start + i * stagger, duration));
      return { progress: p, translateY: travel * (1 - p), opacity: clamp(p * 3), clipInsetBottom: 100 * (1 - p) };
    });
  }

  function frameFlood(t, options = {}) {
    const { width = 360, height = 220, anchor = { x: width / 2, y: height / 2 }, start = 0, duration = 0.85 } = options;
    const farthest = Math.max(...[{ x: 0, y: 0 }, { x: width, y: 0 }, { x: 0, y: height }, { x: width, y: height }].map(p => Math.hypot(p.x - anchor.x, p.y - anchor.y)));
    const p = smooth(progress(t, start, duration));
    return { x: anchor.x, y: anchor.y, radius: farthest * p, progress: p, coverageRadius: farthest };
  }

  function iris(t, options = {}) {
    const { count = 6, outerRadius = 300, aperture = 100, start = 0, duration = 1, twist = 0.22 } = options;
    const p = smooth(progress(t, start, duration));
    const inner = aperture * p, rotate = twist * (1 - p);
    const point = (r, a) => ({ x: r * Math.cos(a), y: r * Math.sin(a) });
    const blades = Array.from({ length: count }, (_, i) => {
      const a = i * 2 * Math.PI / count, b = (i + 1) * 2 * Math.PI / count;
      const points = [point(outerRadius, a), point(outerRadius, b), point(inner, b + rotate), point(inner, a + rotate)];
      return { points, path: 'M' + points.map(pt => `${number(pt.x)},${number(pt.y)}`).join('L') + 'Z' };
    });
    return { progress: p, aperture: inner, blades };
  }

  function strokeReveal(t, options = {}) {
    const { start = 0, duration = 1.6, length = 1 } = options;
    const p = smooth(progress(t, start, duration));
    return { progress: p, dasharray: length, dashoffset: length * (1 - p), clipWidth: 100 * p };
  }

  function sharedHandoff(t, options) {
    const { from, to, start = 0, duration = 1, damping = 0.82, omega = 10, via } = options;
    const p = spring(t, { from: 0, to: 1, start, omega: omega / Math.max(duration, 1e-6), damping });
    const geometry = {};
    for (const key of ['x', 'y', 'width', 'height', 'radius']) geometry[key] = mix(from[key] ?? 0, to[key] ?? 0, p);
    if (via) {
      const u = clamp(p);
      geometry.x = (1 - u) ** 2 * from.x + 2 * (1 - u) * u * via.x + u * u * to.x;
      geometry.y = (1 - u) ** 2 * from.y + 2 * (1 - u) * u * via.y + u * u * to.y;
    }
    const settled = clamp(p);
    return { ...geometry, progress: p, outgoingOpacity: 1 - smooth(clamp(settled / 0.36)), incomingOpacity: smooth(clamp((settled - 0.58) / 0.42)) };
  }

  function cameraAnchorZoom(t, options = {}) {
    const { anchor = { x: 180, y: 110 }, screen = anchor, fromScale = 1, toScale = 1.8, fromTranslation = { x: 0, y: 0 }, start = 0, duration = 1, damping = 0.9, omega = 10 } = options;
    const p = spring(t, { from: 0, to: 1, start, omega: omega / Math.max(duration, 1e-6), damping });
    const scale = mix(fromScale, toScale, p);
    const x = mix(fromTranslation.x, screen.x - anchor.x * toScale, p);
    const y = mix(fromTranslation.y, screen.y - anchor.y * toScale, p);
    return { scale, x, y, progress: p, transform: `matrix(${number(scale)},0,0,${number(scale)},${number(x)},${number(y)})` };
  }

  function beatGrid(options = {}) {
    const { bpm = 120, beatsPerBar = 4, start = 0, count = 16 } = options;
    if (!(bpm > 0) || !(beatsPerBar > 0)) throw new RangeError('tempo and beatsPerBar must be positive');
    return Array.from({ length: count }, (_, beat) => ({ beat, bar: Math.floor(beat / beatsPerBar), inBar: beat % beatsPerBar, downbeat: beat % beatsPerBar === 0, time: start + beat * 60 / bpm }));
  }

  function beatAt(t, options = {}) {
    const { bpm = 120, beatsPerBar = 4, start = 0, decay = 0.12 } = options;
    if (!(bpm > 0) || !(beatsPerBar > 0) || !(decay > 0)) throw new RangeError('tempo, meter, decay must be positive');
    const position = Math.max(0, (t - start) * bpm / 60);
    const beat = Math.floor(position), phase = position - beat;
    return { beat, bar: Math.floor(beat / beatsPerBar), inBar: beat % beatsPerBar, phase, position, pulse: t < start ? 0 : Math.exp(-phase * 60 / bpm / decay) };
  }

  function seededNoise(seed, index = 0) {
    let x = (Math.trunc(seed) ^ Math.imul(Math.trunc(index) + 1, 0x9e3779b1)) >>> 0;
    x ^= x >>> 16; x = Math.imul(x, 0x85ebca6b); x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }

  return Object.freeze({ version: '1.0.0', authorship: 'Independent authored primitives', clamp, mix, smooth, progress, loopTime, springState, spring, springTrack, liquidStretch, cubicBezier, clickPress, cursorPath, directDrag, maskedType, frameFlood, iris, strokeReveal, sharedHandoff, cameraAnchorZoom, beatGrid, beatAt, seededNoise });
});
