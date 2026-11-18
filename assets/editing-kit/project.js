/* Bind the existing editing-kit API to episode-supplied objects and a seekable clock. */
(() => {
  const spec = JSON.parse(document.getElementById("binding").textContent);
  const stage = document.getElementById("stage");
  stage.style.width = spec.width + "px";
  stage.style.height = spec.height + "px";
  UIEditingKit.setTheme(stage, spec.theme);

  function node(selector) {
    const element = stage.querySelector(selector);
    if (!element) throw new Error("Missing episode object " + selector);
    return element;
  }
  function resolve(value) {
    if (Array.isArray(value)) return value.map(resolve);
    if (!value || typeof value !== "object") return value;
    if (Object.keys(value).length === 1 && typeof value.selector === "string") return node(value.selector);
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, resolve(item)]));
  }
  const options = resolve(spec.options);
  const videos = [];
  const loading = [];
  for (const [selector, media] of Object.entries(spec.media || {})) {
    const element = node(selector);
    if (element instanceof HTMLImageElement) {
      element.src = media.src;
      loading.push(element.decode());
    } else if (element instanceof HTMLVideoElement) {
      const offset = media.in ?? 0;
      if (!Number.isFinite(offset) || offset < 0) throw new Error("Invalid media in-point " + selector);
      element.muted = true;
      element.preload = "auto";
      loading.push(new Promise((ready, fail) => {
        element.addEventListener("loadeddata", ready, {once: true});
        element.addEventListener("error", () => fail(Error("Cannot load " + selector)), {once: true});
      }));
      element.src = media.src;
      videos.push({element, offset});
    } else throw new Error("Use an img or video element for " + selector);
  }
  const ready = Promise.all([document.fonts.ready, ...loading]);
  window.ready = () => ready;
  window.seek = async seconds => {
    await ready;
    await Promise.all(videos.map(({element, offset}) => {
      const target = Math.min(offset + seconds, Math.max(0, element.duration - 0.001));
      if (offset >= element.duration) throw new Error("Media in-point exceeds video duration");
      if (Math.abs(element.currentTime - target) < 0.0001 && !element.seeking) return;
      return new Promise(done => {
        element.addEventListener("seeked", done, {once: true});
        element.currentTime = target;
      });
    }));
    UIEditingKit.apply(spec.component, options, Math.min(1, Math.max(0, seconds / spec.duration)));
    return {id: spec.id, seconds};
  };
})();
