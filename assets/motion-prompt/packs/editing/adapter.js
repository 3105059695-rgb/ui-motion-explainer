/* Attach the existing editing programs to the numbered catalog. The source program owns its motion. */
(() => {
  const rows = MOTION_CATALOG.entries.filter(r => r.engine === 'scene' || r.engine === 'dom');
  const programs = window.MotionScenePrograms || {};
  const images = new Map();
  function decode(src) {
    if (typeof src !== 'string') return Promise.resolve(src);
    return new Promise((ok,fail) => {
      const image = new Image();
      image.onload = () => {
        if (src.startsWith('data:image/jpeg')) {
          const buffer=document.createElement('canvas');
          buffer.width=image.naturalWidth;buffer.height=image.naturalHeight;
          const raster=buffer.getContext('2d',{willReadFrequently:true});
          raster.drawImage(image,0,0);
          raster.getImageData(0,0,1,1);
          ok(buffer);
        } else ok(image);
      };
      image.onerror = () => fail(new Error('动作素材读取失败'));
      image.src = src;
    });
  }
  const ready = Promise.all(Object.entries(window.MotionSceneMedia || {}).map(async ([key,url]) => {
    images.set(key,await decode(url));
  }));
  function scene(row, inputs={}, assets={}) {
    const graph = programs[row.id];
    const resolved = Object.fromEntries(Object.entries(graph.assets).map(([slot,key])=>[slot,assets[slot] || images.get(key)]));
    const engine = RebuiltScene.create(graph,{inputs,assets:resolved,uiStyle:'current'});
    return (ctx,w,h,t)=>engine.draw(ctx,Math.min(row.duration,Math.max(0,t)),w,h);
  }
  for (const packId of new Set(rows.map(r => r.pack))) {
    const entries = rows.filter(r=>r.pack===packId), cells = [];
    entries.forEach(r => {
      if (r.engine !== 'scene') return;
      let built;
      cells[r.cell] = (ctx,w,h,t) => {built ||= scene(r);return built(ctx,w,h,t);};
    });
    MotionPrompt.pack(packId,()=>({width:1280,height:720,cycle:Math.max(...entries.map(r=>r.duration)),cells,ready}));
  }
  function mountStage(host,width,height,build) {
    const root = host.shadowRoot || host.attachShadow({mode:'open'});
    const sheet = document.createElement('style');
    sheet.textContent = window.MotionDomStyle || '.sm-stage{position:relative;overflow:hidden;transform-origin:0 0;font-family:MotionCatalogSC,sans-serif}';
    const stage = document.createElement('div');
    stage.className = 'sm-stage';
    Object.assign(stage.style,{width:width+'px',height:height+'px'});
    root.replaceChildren(sheet,stage);const controller=build(stage);
    function size(){
      const w=host.getBoundingClientRect().width;
      if(w>0) stage.style.transform='scale('+(w/width)+')';
    }
    const ro = new ResizeObserver(size);
    ro.observe(host);size();
    return {seek:t=>controller.seek(t),release(){ro.disconnect();controller.release?.();root.replaceChildren();}};
  }
  function dom(host,row,bindings={}) {
    return mountStage(host,1280,720,stage=>{
      const fixture=SemanticDemoFixtures.build(row.mechanism,stage);
      const controller=SemanticMotion.create({effect:row.mechanism,duration:row.duration,
        options:{...fixture.options,...(bindings.params || {})}},stage);
      const replacements=bindings.text || {};
      const lookup=Object.keys(replacements).length>0;
      return {seek(t) {
        const result=controller.seek(t);
        if(lookup){
          const walker=document.createTreeWalker(stage,NodeFilter.SHOW_TEXT);
          for(let n=walker.nextNode();n;n=walker.nextNode()){
            if(Object.hasOwn(replacements,n.nodeValue))n.nodeValue=String(replacements[n.nodeValue]);
          }
        }
        return result;
      },
      release(){controller.reset();}};
    });
  }
  function bindExisting(row,root,options,duration=row.duration) {
    if(row.engine!=='dom')throw Error('请选择“可绑定的组件动作”或“口播组合动作”。');
    return SemanticMotion.create({effect:row.mechanism,duration,options},root);
  }
  window.EditingMoves={scene,dom,bindExisting,decode,ready,mountStage};
})();
