/* AI UI Director — deterministic, composable motion presets. */
(function () {
  'use strict';
  const presets = [];
  const builds = new Map();
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function register(meta, build) {
    if (!meta || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(meta.id) || builds.has(meta.id)) throw Error('Invalid or duplicate preset: ' + meta?.id);
    if (!(meta.duration > 0) || typeof build !== 'function') throw Error('Preset needs duration and builder: ' + meta.id);
    presets.push(Object.freeze({...meta})); builds.set(meta.id, build);
  }
  function mount(id, root, params = {}) {
    const build = builds.get(id);
    if (!build) throw Error('Unknown preset: ' + id);
    const q = s => root.querySelector(s), qa = s => [...root.querySelectorAll(s)];
    const ctx = {
      gsap: window.gsap, root, q, qa, esc,
      text(tl, el, value, start, duration) {
        if (!el) throw Error('Missing text element in ' + id);
        const chars = Array.from(String(value ?? ''));
        tl.set(el, {textContent: ''}, 0);
        if (!chars.length) return;
        chars.forEach((_, i) => tl.set(el, {textContent: chars.slice(0, i+1).join('')}, start + duration * (i+1) / chars.length));
      },
      cursor() { return '<svg class="fx-cursor" width="38" height="46" viewBox="0 0 38 46" aria-hidden="true"><path d="M4 3L6 35L14 27L21 41L28 37L21 24L33 23Z" fill="#191B23" stroke="white" stroke-width="2.8" stroke-linejoin="round"/></svg>'; },
      click(tl, pointer, ring, x, y, time) {
        if (pointer) tl.set(pointer, {x, y}, time).to(pointer, {scale:.86,duration:.10,ease:'power2.out'},time).to(pointer,{scale:1,duration:.17,ease:'power2.out'},time+.1);
        if (ring) tl.set(ring,{x:x-25,y:y-25,scale:.3,opacity:0},time).to(ring,{scale:1,opacity:.5,duration:.15},time).to(ring,{scale:1.5,opacity:0,duration:.35},time+.15);
      }
    };
    root.replaceChildren();
    const scene = build(ctx, params);
    if (!scene?.timeline || !(scene.duration > 0)) throw Error('Builder did not return timeline/duration: '+id);
    // Force GSAP's zero-time sets to render synchronously before the first frame.
    // A timeline that has never advanced can otherwise retain its authoring state.
    scene.timeline.pause().time(0.000001, false).time(0, false);
    return {...scene, id, destroy() {scene.timeline.kill(); root.replaceChildren();}};
  }
  window.UIFX = {presets, register, mount, esc};
})();
