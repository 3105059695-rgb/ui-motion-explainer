// Independent replica interface, 2026-10-07. The licensed animation engine is retained in kit/ and scenes/.
// Public original-author example only. This adapter does not read local private conversation logs.
(() => {
  'use strict';
  let C, clock = 0, internal = 0, playing = false, busy = false, origin = null, raf;
  const startup = (async () => {
    C = await (await fetch('project.json')).json();
    window.project = C;
    window.installReplicaPainter();
    window.duration = C.duration;
    const story = await (await fetch(C.story_file || 'story.json')).json();
    for (const k of ['user', 'nameplate', 'hook']) if (C[k] !== undefined) story[k] = C[k];
    window.STORY = story;
    await new Promise((resolve, reject) => {
      const s = document.createElement('script'); s.src = 'scenes/director.js'; s.onload = resolve; s.onerror = reject; document.body.appendChild(s);
    });
    await window.__engineReady;
    await document.fonts.load('100px "Replica Mono"');
    await document.fonts.ready;
    // p5.brush's first paint only composites the paper. Warm up twice before any requested frame.
    await window.paintAt(0); await window.paintAt(0);
    document.getElementById('scrub').max = C.duration;
    return true;
  })();
  window.ready = () => startup;
  // Versioned reference timing. Monotone Hermite slopes preserve continuous speed between measured anchors.
  function mapTime(v) {
    const K = C.timing_anchors, x = v / C.duration * 52.625;
    if (!K) return v / C.duration * window.SCHEDULE.duration;
    const d=K.slice(1).map((k,i)=>(k[1]-K[i][1])/(k[0]-K[i][0]));
    const m=K.map((k,i)=>i===0?d[0]:i===K.length-1?d.at(-1):d[i-1]*d[i]<=0?0:(d[i-1]+d[i])/2);
    for(let i=0;i<d.length;i++){const a=m[i]/d[i],b=m[i+1]/d[i],r=a*a+b*b;if(r>9){const s=3/Math.sqrt(r);m[i]=s*a*d[i];m[i+1]=s*b*d[i];}}
    if(x<=K[0][0])return K[0][1];if(x>=K.at(-1)[0])return K.at(-1)[1];
    let i=0;while(x>K[i+1][0])i++;const h=K[i+1][0]-K[i][0],s=(x-K[i][0])/h;
    return (2*s**3-3*s*s+1)*K[i][1]+(s**3-2*s*s+s)*h*m[i]+(-2*s**3+3*s*s)*K[i+1][1]+(s**3-s*s)*h*m[i+1];
  }
  const state = () => {
    const S = window.SCHEDULE, block = S?.blocks.find(b => internal >= b.S && internal < b.end) || S?.blocks.at(-1);
    return { time: clock, engine_time: internal, phase: block?.type, block_start: block?.S, block_end: block?.end, text: block?.lines || block?.text || null, block_count: S?.blocks.length, engine_duration: S?.duration, camera_zoom_track: S?.zoom, original_video_loaded: false, provenance: 'licensed-upstream-reimplementation' };
  };
  window.getState = () => structuredClone(state());
  window.seek = async v => {
    await startup;
    clock = Math.max(0, Math.min(C.duration, Number(v) || 0));
    internal = mapTime(clock);
    await window.paintAt(internal);
    document.getElementById('scrub').value = clock;
    document.getElementById('time').textContent = clock.toFixed(2) + 's';
    return state();
  };
  const rendering = new URLSearchParams(location.search).has('render');
  if (rendering) document.body.classList.add('render');
  async function tick(now) {
    if (!playing || busy) return;
    if (origin === null) origin = now - clock * 1000;
    busy = true; await window.seek(((now - origin) / 1000) % C.duration); busy = false;
    if (playing) raf = requestAnimationFrame(tick);
  }
  document.getElementById('play').onclick = () => {
    playing = !playing; origin = null;
    if (playing) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf);
  };
  document.getElementById('scrub').oninput = async e => {
    playing = false; cancelAnimationFrame(raf); origin = null;
    await window.seek(e.target.value);
  };
  startup.then(() => { if (!rendering) { playing = true; raf = requestAnimationFrame(tick); } }).catch(e => { window.__error = String(e); console.error(e); });
})();
