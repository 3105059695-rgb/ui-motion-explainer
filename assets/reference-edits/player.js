/* Render authored edit decisions against current material. The episode file contains no external URLs. */
(() => {
  'use strict';
  const episode = window.REFERENCE_EPISODE;
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d', {alpha: false});
  const nav = document.querySelector('nav');
  const button = nav.querySelector('button');
  const slider = nav.querySelector('input');
  const label = nav.querySelector('output');
  canvas.width = episode.width;
  canvas.height = episode.height;
  slider.max = String(episode.frames - 1);
  if (new URLSearchParams(location.search).has('render')) {
    nav.hidden = true;
    document.documentElement.classList.add('render');
  }
  const positions = {
    full:[0,0,1,1], paper:[.09,.13,.82,.76], center:[.28,.26,.44,.48],
    left:[.035,.16,.45,.68], right:[.515,.16,.45,.68], top:[.1,.025,.8,.14],
    bottom:[.1,.78,.8,.17], lower:[.16,.54,.68,.4], chip:[.42,.43,.16,.14],
    thumb:[.04,.67,.27,.27], upperLeft:[.06,.08,.42,.39], upperRight:[.52,.08,.42,.39],
    lowerLeft:[.06,.53,.42,.39], lowerRight:[.52,.53,.42,.39]
  };
  const cache = new Map();
  const mix = (a,b,t) => a + (b-a)*t;
  const clamp = (v,low=0,high=1) => Math.min(high,Math.max(low,v));
  const ease = t => t*t*(3-2*t);
  let state = {frame:0,sources:[]};
  let ticket = 0;
  let playing = false;
  let clock = 0;
  const audio = episode.narration ? new Audio(episode.narration) : null;

  // A movie can appear twice at different in-points. Give each role its own media clock.
  function asset(id, spec) {
    if (spec.kind === 'text') return Promise.resolve(null);
    const key = spec.kind === 'image' ? spec.src : id;
    if (cache.has(key)) return cache.get(key);
    const promise = new Promise((resolve,reject) => {
      const node = spec.kind === 'image' ? new Image() : document.createElement('video');
      const event = spec.kind === 'image' ? 'load' : 'loadeddata';
      const timer = setTimeout(() => reject(Error('素材加载超时 '+spec.src)),20000);
      node.addEventListener(event,() => {clearTimeout(timer);resolve(node);},{once:true});
      node.addEventListener('error',() => {clearTimeout(timer);reject(Error('无法解码 '+spec.src));},{once:true});
      if (spec.kind === 'video') {node.muted=true;node.preload='auto';node.playsInline=true;}
      node.src = spec.src;
    });
    cache.set(key,promise);
    return promise;
  }
  async function positionVideo(node,t) {
    if (!node || node.tagName !== 'VIDEO') return;
    const target = Math.max(0,Math.min(t,node.duration-.001));
    if (!Number.isFinite(target)) throw Error('视频缺少可用时钟');
    if (!node.seeking && Math.abs(node.currentTime-target) < .002) return;
    await new Promise((resolve,reject) => {
      const clean=()=>{clearTimeout(timer);node.removeEventListener('seeked',done);node.removeEventListener('error',fail);};
      const done=()=>{clean();resolve();};
      const fail=()=>{clean();reject(Error('素材定位失败'));};
      const timer=setTimeout(fail,12000);
      node.addEventListener('seeked',done);node.addEventListener('error',fail);
      node.currentTime=target;
    });
  }
  function geometry(k, spec) {
    const frame = k.frame==='safe' ? spec.placement : positions[k.frame];
    if (!frame) throw Error('画面区域缺失 '+k.frame);
    return [...frame,k.opacity??1,k.zoom??1,k.iris??1,k.wipe??1];
  }
  function keyframe(keys,t,spec) {
    if (t < keys[0].at || t > keys[keys.length-1].at) return null;
    let j=1;
    while(j<keys.length-1 && t>keys[j].at) j++;
    const a=keys[j-1], b=keys[j];
    const u=b.cut ? (t<b.at?0:1) : ease(clamp((t-a.at)/(b.at-a.at)));
    const start=geometry(a,spec), end=geometry(b,spec);
    return start.map((v,i)=>mix(v,end[i],u));
  }
  function round(x,y,w,h,r) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
  }
  function typography(text,x,y,w,h) {
    let size=Math.min(h*.49,w*.17,canvas.height*.112);
    let lines=[];
    const wrap=()=>{
      const result=[];
      for (const paragraph of text.split(/\r?\n/)) {
        let current='';
        for (const char of [...paragraph]) {
          if (current && ctx.measureText(current+char).width>w*.88) {result.push(current);current=char;}
          else current+=char;
        }
        result.push(current);
      }
      return result;
    };
    for (let n=0;n<18;n++) {
      ctx.font='700 '+size+'px Episode, sans-serif';lines=wrap();
      if(lines.length*size*1.24<=h*.83 || size<5) break;
      size*=.84;
    }
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#16131b';
    const first=y+h/2-(lines.length-1)*size*.62;
    lines.forEach((line,i)=>ctx.fillText(line,x+w/2,first+i*size*1.24,w*.9));
  }
  function paint(node,spec,p,r) {
    let [x,y,w,h,a,zoom,iris,wipe]=p;
    if (a<=.001 || iris<=.001 || wipe<=.001) return false;
    x=r[0]+x*r[2];y=r[1]+y*r[3];w*=r[2];h*=r[3];
    const focus=spec.focus || [.5,.5];
    ctx.save();
    ctx.globalAlpha=a;
    if (wipe<.999) {ctx.beginPath();ctx.rect(x,y,w*wipe,h);ctx.clip();}
    if (iris<.999) {ctx.beginPath();ctx.arc(x+w*focus[0],y+h*focus[1],iris*Math.hypot(w,h),0,2*Math.PI);ctx.clip();}
    const surfaceFull=p[2]>.99 && p[3]>.99;
    if (!surfaceFull) {
      ctx.shadowColor='rgba(13,11,19,.20)';ctx.shadowBlur=r[3]*.015;ctx.shadowOffsetY=r[3]*.007;
    }
    round(x,y,w,h,surfaceFull?0:Math.max(2,r[3]*.018));
    ctx.fillStyle=spec.kind==='text'?'#d6c2ff':'#f3f3f5';ctx.fill();ctx.shadowColor='transparent';ctx.clip();
    if(spec.kind==='text') typography(spec.text,x,y,w,h);
    else {
      const iw=node.videoWidth||node.naturalWidth, ih=node.videoHeight||node.naturalHeight;
      if (!iw || !ih) throw Error('素材画幅无效');
      const fit=spec.fit==='cover' ? Math.max(w/iw,h/ih) : Math.min(w/iw,h/ih);
      const dw=iw*fit*zoom, dh=ih*fit*zoom;
      ctx.drawImage(node,x+(w-dw)*(dw>w?focus[0]:.5),y+(h-dh)*(dh>h?focus[1]:.5),dw,dh);
    }
    ctx.restore();
    return true;
  }
  // Occupancy uses the same opaque shot rectangles actually drawn, including partial overlaps.
  function visible(rect,above) {
    const [x,y,w,h]=rect;
    const xs=[x,x+w],ys=[y,y+h];
    for(const [a,b,c,d] of above){xs.push(clamp(a,x,x+w),clamp(a+c,x,x+w));ys.push(clamp(b,y,y+h),clamp(b+d,y,y+h));}
    xs.sort((a,b)=>a-b);ys.sort((a,b)=>a-b);
    for(let i=1;i<xs.length;i++) for(let j=1;j<ys.length;j++) {
      if(xs[i]<=xs[i-1] || ys[j]<=ys[j-1])continue;
      const px=(xs[i]+xs[i-1])/2, py=(ys[j]+ys[j-1])/2;
      if(!above.some(([a,b,c,d])=>a<=px&&px<a+c&&b<=py&&py<b+d))return true;
    }
    return false;
  }
  async function seek(seconds) {
    const current=++ticket;
    const f=clamp(Math.floor(seconds*episode.fps+1e-7),0,episode.frames-1);
    const active=[];
    for(let i=0;i<episode.shots.length;i++){
      const s=episode.shots[i];
      if(f<s.start||f>=s.end)continue;
      const t=(f-s.start)/(s.end-s.start);
      const jobs=[];
      for(const layer of episode.recipes[s.id]){
        const spec=s.inputs[layer.slot], geo=keyframe(layer.keys,t,spec);
        if(!geo||geo[4]<=.001||geo[6]<=.001||geo[7]<=.001) continue;
        jobs.push({slot:layer.slot,spec,geo});
      }
      active.push({i,s,jobs,t});
    }
    let under=null;
    if(episode.base_video) {under=await asset('base',{src:episode.base_video,kind:'video'});await positionVideo(under,f/episode.fps);}
    for(const {i,s,jobs,t} of active){
      // Two layers for one role use one seek, so overlapped transitions cannot deadlock a video.
      const prepared=new Map();
      await Promise.all(jobs.map(async j=>{
        if(!prepared.has(j.slot))prepared.set(j.slot,(async()=>{
          const n=await asset(i+'/'+j.slot,j.spec);
          await positionVideo(n,(j.spec.source_in||0)+Math.max(0,t-(j.spec.first||0))*(s.end-s.start)/episode.fps);
          return n;
        })());
        j.node=await prepared.get(j.slot);
      }));
    }
    if(current!==ticket)return state;
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#f3f3f5';ctx.fillRect(0,0,canvas.width,canvas.height);
    if(under)paint(under,{kind:'video',fit:'contain'},[0,0,1,1,1,1,1,1],[0,0,canvas.width,canvas.height]);
    const sources=[];
    const implementations=new Set();
    for(let ix=0;ix<active.length;ix++){
      const {s,jobs}=active[ix];
      const r=s.rect.map((n,i)=>n*(i%2===0?canvas.width:canvas.height));
      ctx.save();ctx.beginPath();ctx.rect(...r);ctx.clip();
      ctx.fillStyle='#f3f3f5';ctx.fillRect(...r);
      const painted=[];
      for(const j of jobs)if(paint(j.node,j.spec,j.geo,r)){
        const [x,y,w,h,a,,iris,wipe]=j.geo;
        const bounds=[s.rect[0]+x*s.rect[2],s.rect[1]+y*s.rect[3],w*s.rect[2]*wipe,h*s.rect[3]];
        painted.push({slot:j.slot,bounds,opaque:a>=.999 && iris>=.999});
      }
      ctx.restore();
      const later=active.slice(ix+1).map(x=>x.s.rect);
      const slots=painted.filter((p,i)=>visible(p.bounds,[...later,...painted.slice(i+1).filter(x=>x.opaque).map(x=>x.bounds)])).map(p=>p.slot);
      if(slots.length)sources.push({id:s.id,slots});
      for(const slot of slots){
        const used=s.inputs[slot].from_project;
        if(used)implementations.add(used.credit || (used.source_id ? used.source_id+' / '+used.capability : used.capability));
      }
    }
    slider.value=String(f);label.value=(f/episode.fps).toFixed(2)+' s';
    state={frame:f,sources,implementations:[...implementations]};
    return state;
  }
  function pause(){playing=false;if(audio)audio.pause();button.textContent='播放';}
  async function tick(){
    if(!playing)return;
    const t=audio?audio.currentTime:(performance.now()-clock)/1000;
    if(t*episode.fps>=episode.frames || audio?.ended){pause();await seek((episode.frames-1)/episode.fps);return;}
    await seek(t);
    if(playing)requestAnimationFrame(()=>tick().catch(fault));
  }
  function fault(error){pause();document.getElementById('fault').textContent=error.message;}
  const ready=document.fonts.load('700 20px Episode').then(()=>seek(0));
  window.ready=()=>ready;
  window.seek=async t=>{await ready;return seek(t);};
  window.getState=()=>state;
  button.onclick=async()=>{try{await ready;if(playing){pause();return;}const start=state.frame>=episode.frames-1?0:state.frame/episode.fps;
    if(audio){audio.currentTime=start;await audio.play();}clock=performance.now()-start*1000;playing=true;button.textContent='暂停';await tick();
  }catch(e){fault(e);}};
  slider.oninput=()=>{pause();const t=Number(slider.value)/episode.fps;if(audio)audio.currentTime=t;window.seek(t).catch(fault);};
  ready.catch(fault);
})();
