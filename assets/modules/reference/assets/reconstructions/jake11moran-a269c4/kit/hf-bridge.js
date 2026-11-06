// MODIFIED 2026-10-07: replace HF event queue with the replica deterministic seek adapter.
// Rendering awaits paintAt(t); preview and seeks never paint concurrently.
let resolveEngineReady;
window.__engineReady = new Promise(r => { resolveEngineReady = r; });
window.__clawdReady = () => resolveEngineReady(true);
