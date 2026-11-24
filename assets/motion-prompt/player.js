/* The original numbered cells draw at their native resolution. Scaling happens once, at the frame boundary. */
(() => {
  const contexts = new WeakMap();
  const fontFamily = '"MotionCatalogSC","Noto Sans SC",sans-serif';
  function themedContext(raw) {
    if (contexts.has(raw)) return contexts.get(raw);
    const methods = new Map();
    const proxy = new Proxy(raw, {
      get(target, key) {
        if (key === 'fillText' || key === 'strokeText') {
          if (!methods.has(key)) methods.set(key, (s, ...args) => {
            if (!/^\s*[-+]?\d[\d.,:%×/\s+-]*(?:kB|GB|MB|px|s|%)?\s*$/i.test(String(s))) {
              return target[key](s, ...args);
            }
            const saved = target.font;
            target.font = saved.replace(/\b(?:550|700|800)\s+/, '850 ');
            try { return target[key](s, ...args); } finally { target.font = saved; }
          });
          return methods.get(key);
        }
        const value = Reflect.get(target,key,target);
        if (typeof value !== 'function') return value;
        if (!methods.has(key)) methods.set(key,value.bind(target));
        return methods.get(key);
      },
      set(target,key,value) {
        if (key === 'font') {
          const match = /(?:(\d{3}|bold|normal)\s+)?(\d+(?:\.\d+)?)px\b/i.exec(value);
          if (match) {
            const originalWeight = match[1] === 'bold' ? 700 : Number(match[1]) || 400;
            const weight = Number(match[2]) >= 28 || originalWeight >= 800 ? 800 : originalWeight >= 600 ? 700 : 550;
            value = weight + ' ' + match[2] + 'px ' + fontFamily;
          }
        }
        return Reflect.set(target,key,value,target);
      }
    });
    contexts.set(raw,proxy);
    return proxy;
  }
  const rootURL = new URL('.',document.currentScript.src || document.baseURI);
  const mounted = new WeakMap();
  const byId = new Map(MOTION_CATALOG.entries.map(e=>[e.id,e]));
  const cycle = entry=>entry.duration || MotionPrompt.packs[entry.pack].cycle;
  const isDom = entry=>entry.engine==='dom'||entry.presentation==='dom';
  function release(surface) {
    const state=mounted.get(surface);
    if(state){state.instance.release();mounted.delete(surface);}
  }
  function draw(surface, entry, t, bound) {
    if(typeof entry==='string')entry=byId.get(entry.replace(/^#/,'').toUpperCase());
    if(!entry)throw Error('动作编号不存在');
    if(isDom(entry)){
      let state=mounted.get(surface);
      if(!state||state.entry!==entry||state.bound!==bound){
        release(surface);
        const instance=entry.engine==='dom'?EditingMoves.dom(surface,entry,bound):
          EditingMoves.mountStage(surface,entry.width,entry.height,stage=>MotionPrompt.packs[entry.pack].mounts[entry.cell](stage,bound || {}));
        state={entry,bound,instance};
        mounted.set(surface,state);
      }
      return state.instance.seek(Math.min(entry.duration,Math.max(0,t)));
    }
    const canvas=surface;
    const pack = MotionPrompt.packs[entry.pack], raw = entry.variant
      ? canvas.getContext('2d',{willReadFrequently:true}) : canvas.getContext('2d');
    raw.save();
    try {
      const width=entry.width||pack.width,height=entry.height||pack.height;
      raw.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
      raw.clearRect(0,0,width,height);
      raw.beginPath();
      if(entry.engine)raw.imageSmoothingQuality='high';
      const duration=cycle(entry);
      const phase=bound?.once ? Math.max(0,Math.min(duration-.000001,t)) : (t % duration + duration) % duration;
      const cell=bound?.cell || pack.cells[entry.cell];
      cell(entry.engine ? raw : themedContext(raw),width,height,phase,bound?.inputs,bound?.assets);
    } finally { raw.restore(); }
  }
  function loadScript(path) {
    return new Promise((ok,fail)=>{
      const script=document.createElement('script');script.src=new URL(path,rootURL).href;
      script.onload=ok;script.onerror=()=>fail(Error('无法读取动作文件 '+path));document.head.append(script);
    });
  }
  const ready=(async()=>{
    for(const path of MOTION_CATALOG.localScripts || [])await loadScript(path);
    await Promise.all([...Object.values(MotionPrompt.packs).map(p=>p.ready),
      ...[550,700,800,850].map(w=>document.fonts.load(w+' 18px MotionCatalogSC'))]);
    return true;
  })();
  // A trimmed action plate ends on its contact frame. Decode once so gallery
  // scrubbing and offline frame exports use exactly the same pictures.
  async function contactFrames(value) {
    const video=document.createElement('video'),local=value instanceof Blob;
    const url=local?URL.createObjectURL(value):value;
    video.muted=true;video.preload='auto';
    function when(event,start){
      return new Promise((resolve,reject)=>{
        const finish=error=>{clearTimeout(timer);video.removeEventListener(event,done);video.removeEventListener('error',fail);
          if(error)reject(error);else resolve();};
        const done=()=>finish(),fail=()=>finish(Error('无法读取接触片段'));
        const timer=setTimeout(fail,12000);
        video.addEventListener(event,done,{once:true});video.addEventListener('error',fail,{once:true});start();
      });
    }
    try{
      await when('loadeddata',()=>{video.src=url;video.load();});
      if(!Number.isFinite(video.duration)||!video.videoWidth)throw Error('接触片段缺少有效时长。');
      const frames=[],count=Math.max(2,Math.min(30,Math.ceil(video.duration*30)));
      const scale=Math.min(1,850/Math.max(video.videoWidth,video.videoHeight));
      for(let n=0;n<count;n++){
        const at=Math.max(0,video.duration-.025)*n/(count-1);
        if(Math.abs(video.currentTime-at)>.001)await when('seeked',()=>{video.currentTime=at;});
        const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(video.videoWidth*scale));
        canvas.height=Math.max(1,Math.round(video.videoHeight*scale));canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);
        frames.push(canvas);
      }
      return {frames};
    }finally{video.removeAttribute('src');video.load();if(local)URL.revokeObjectURL(url);}
  }
  async function bind(id,options={}) {
    await ready;
    const row=byId.get(String(id).replace(/^#/,'').toUpperCase());
    if(!row)throw Error('未知动作 '+id);
    if(options.inputs||options.text){
      const glyphs=[...new Set(JSON.stringify([options.inputs,options.text]))].join('');
      await document.fonts.load('550 18px MotionCatalogSC',glyphs);
    }
    const assets={};
    for(const [key,value] of Object.entries(options.assets || {})){
      if(row.engine==='reference'){
        const live=PortraitPrograms[row.id].layers.some(l=>l.slot===key&&l.kind==='live');
        assets[key]=await PortraitEngine.prepareAsset(value,cycle(row),live);
      }else if(row.videoSlots?.includes(key)&&(value instanceof Blob?value.type.startsWith('video/'):typeof value==='string'&&value.startsWith('data:video/'))){
        assets[key]=await contactFrames(value);
      }else if(typeof value==='string'){
        assets[key]=await new Promise((ok,fail)=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>fail(Error('素材无法读取 '+key));im.src=value;});
      } else assets[key]=value;
    }
    const bindings={...options,assets,once:options.once!==false};
    if(row.engine==='scene')bindings.cell=EditingMoves.scene(row,options.inputs,assets);
    return {row,duration:cycle(row),seek:(surface,seconds)=>draw(surface,row,Math.max(0,Math.min(cycle(row),seconds)),bindings),
      release:surface=>release(surface)};
  }
  function bindExisting(id,root,options,duration) {
    const row=byId.get(String(id).replace(/^#/,'').toUpperCase());
    if(!row)throw Error('未知动作 '+id);
    if(row.presentation==='dom')return MotionPrompt.packs[row.pack].mounts[row.cell](root,options);
    return EditingMoves.bindExisting(row,root,options,duration);
  }
  window.MotionEdition = {draw,ready,cycle,release,bind,bindExisting,isDom};
})();
