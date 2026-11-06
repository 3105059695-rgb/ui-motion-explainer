// MODIFIED 2026-10-07: reproducible native p5 vector painter for the licensed choreography.
// The upstream watercolor painter is preserved as an optional project.json painter='watercolor' mode.
// Native mode retains the seeded boiling contours, fills, paper/grain and all scene geometry, without asynchronous brush masks.
window.installReplicaPainter = () => {
  if (window.project.painter === 'watercolor') return;
  window.__nativePainter = true;
  const inkScale = 6.0;
  const path = (pts, close, curved) => {
    if (pts.length < 2) return;
    beginShape();
    const P = curved && pts.length > 3 ? through(close ? [...pts, pts[0], pts[1]] : pts, 4) : pts;
    for (const p of P) vertex(p[0], p[1]);
    endShape(close ? CLOSE : undefined);
  };
  const translucent = (s, alpha) => { const c = color(s); c.setAlpha(alpha); return c; };
  const inside = (x, y, pts) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  };
  window.paint = (pts, o = {}) => {
    push();
    noStroke();
    if (o.wash) { fill(translucent(o.wash, o.washOp ?? 255)); path(pts, true, o.curv); }
    if (o.fill) { fill(translucent(o.fill, o.fillOp ?? 170)); path(pts, true, o.curv); }
    if (o.hatch) {
      noFill(); stroke(translucent(o.hatch.c || PAL.ink, 110)); strokeWeight((o.hatch.w || 1) * 2);
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), xa = Math.min(...xs), xb = Math.max(...xs), ya = Math.min(...ys), yb = Math.max(...ys), spacing = Math.max(10, o.hatch.d || 24);
      for (let y = ya; y < yb; y += spacing) {
        let run = [];
        for (let x = xa; x <= xb; x += 9) {
          if (inside(x, y, pts)) run.push([x, y]);
          else if (run.length) { path(run, false, false); run = []; }
        }
        if (run.length) path(run, false, false);
      }
    }
    if (o.ink !== null) { noFill(); stroke(translucent(o.ink || PAL.ink, 238)); strokeWeight((o.sw ?? 1) * inkScale); path(pts, true, o.curv); }
    pop();
  };
  window.inkLine = (pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) => {
    push(); noFill(); stroke(translucent(col, br === 'dry' ? 115 : 238)); strokeWeight(Math.max(.65, sw * inkScale)); path(pts, false, curv); pop();
  };
  window.flushBrush = () => {};
};
