/* Full portrait compositions shared between the gallery, a single take and the editor. */
(() => {
  const programs=window.PortraitPrograms, media=window.PortraitMedia, machine=window.PortraitMachine;
  const mk=(tag,cls)=>{const n=document.createElement(tag);n.className=cls;return n;};
  const clamp=(x,lo=0,hi=1)=>Math.max(lo,Math.min(hi,x));
  const ease=x=>x*x*(3-2*x);
  const mix=(a,b,f)=>a+(b-a)*f;
  // Each point is the visible centre and available width in a half-resolution 9:16 frame.
  const places={C:[270,278,452],F:[270,279,508],T:[270,139,410],B:[270,423,417],L:[140,272,223],R:[400,272,223],
    TL:[136,117,212],TR:[404,117,212],BL:[136,426,212],BR:[404,426,212],K:[421,453,135],Q:[92,108,130],
    N:[270,-170,375],S:[270,752,370],W:[-245,276,428],E:[780,276,428],Z:[270,283,158],H:[271,277,650],
    back:[245,220,388],front:[294,318,425],mid:[270,270,355]};
  // Horizontal/vertical hand-offs, fixed anchors, convergence and reveals have independent paths.
  const tracks={
    fork:['C C Q Q Q','S S T T T','S S B B B'],collect:['C T T Q Q','S B C C T','S S S B C'],
    unblock:['C C back TL TL','S C C N N','E E E C C'],turn:['C C W W W','E E C T T','S S S B B'],
    focus:['C C H C T','S B C BL BL','E E E BR BR'],match:['F F back T T','S B B S S','E E E C C'],
    inset:['F F TR TR TR','S S C C C','E E E B B'],rewind:['C T T C C','S B B W W','E E E B B'],
    stack:['C back back TL TL','S front mid C back','E E front front C'],extract:['C C T Q Q','S B C T T','E E E B C'],
    gather:['C T TL Q Q','E B TR Z S','S S B C C'],attach:['C C C T T','S K B BL BL','E E E BR BR'],
    process:['C C T TL TL','S B C TR TR','E E E C C'],network:['C T T Q Q','W L L TL TL','E R R C C'],
    carry:['C C L Q Q','S R C C T','E E E B B'],relay:['C C TL TL TL','S B C TR TR','E E E C C'],
    unveil:['C C back TL TL','E E C T T','S S S C C'],wipe:['C C C W W','E E C C T','S S S B B'],
    isolate:['C C T T Q','S B C C T','E E E B C'],quota:['C T T TL TL','W L L C C','E R R B B'],
    fill:['C T T T T','S B C BL BL','E E E BR BR'],dock:['F F Z K K','E E C C C','S S S B B'],
    rank:['C T T BL BL','S B C T T','E E E BR BR'],locate:['C T T Q Q','S C C T T','E E E B B'],
    compare:['C T Q Q Q','W L C T T','E R B B C']
  };
  const clocks=[0,.25,.49,.75,1];
  function point(track,t){
    const i=Math.min(3,Math.max(0,clocks.findIndex((v,j)=>j<4&&t<=clocks[j+1])));
    const a=places[track[i]],b=places[track[i+1]],f=ease(clamp((t-clocks[i])/(clocks[i+1]-clocks[i])));
    return a.map((v,k)=>mix(v,b[k],f));
  }
  const imageCache=new Map();
  const posters=new WeakMap();
  const blank='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#efedf1"/><text x="160" y="100" text-anchor="middle" fill="#393840" font-size="22">本期素材</text></svg>');
  function imageFor(url){
    if(!imageCache.has(url)){const img=new Image();img.src=url;imageCache.set(url,img);}
    return imageCache.get(url);
  }
  const ready=Promise.all([...Object.values(media),...Object.values(machine.strips).map(d=>d.src)].map(s=>imageFor(s).decode()));
  function event(target,name,action){
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>finish(new Error('视频素材读取超时')),15000);
      const finish=e=>{clearTimeout(timer);target.removeEventListener(name,ok);target.removeEventListener('error',bad);e?reject(e):resolve();};
      const ok=()=>finish(),bad=()=>finish(new Error('浏览器无法解码这份素材'));
      target.addEventListener(name,ok,{once:true});target.addEventListener('error',bad,{once:true});action();
    });
  }
  async function prepareAsset(value,duration,videoSlot=false){
    if(value?.tileWidth||value?.video||value instanceof HTMLImageElement)return value;
    const file=value instanceof Blob;
    const url=file?URL.createObjectURL(value):typeof value==='string'?value:value?.src;
    if(!url)throw Error('素材需要本地图片或视频');
    try{
      if(!(file?value.type.startsWith('video/'):url.startsWith('data:video/'))){
        const img=imageFor(url);await img.decode();
        if(file){const c=document.createElement('canvas');c.width=img.naturalWidth;c.height=img.naturalHeight;c.getContext('2d').drawImage(img,0,0);return {src:c.toDataURL('image/png')};}
        return img;
      }
      if(!videoSlot)throw Error('这个位置需要静态图片，视频请放入动作素材槽。');
      const v=document.createElement('video');v.muted=true;v.preload='auto';
      await event(v,'loadeddata',()=>{v.src=url;v.load();});
      if(window.MOTION_EXPORT&&!file){
        const canvas=document.createElement('canvas');canvas.width=240;canvas.height=Math.max(2,Math.round(240*v.videoHeight/v.videoWidth));
        const thumbs=[];for(let i=0;i<7;i++){
          const at=Math.min(Math.max(0,v.duration-.035),Math.min(v.duration,duration)*i/6);
          if(Math.abs(v.currentTime-at)>.001)await event(v,'seeked',()=>{v.currentTime=at;});
          canvas.getContext('2d').drawImage(v,0,0,canvas.width,canvas.height);thumbs.push(canvas.toDataURL('image/webp',.84));
        }
        const sourceLength=v.duration;v.removeAttribute('src');v.load();return {src:url,video:true,duration:sourceLength,thumbs};
      }
      const seconds=Math.min(duration,v.duration),fps=10,frames=Math.max(1,Math.ceil(fps*seconds)),cols=6;
      const scale=Math.min(1,400/Math.max(v.videoWidth,v.videoHeight)),w=Math.max(1,Math.round(v.videoWidth*scale)),h=Math.max(1,Math.round(v.videoHeight*scale));
      const c=document.createElement('canvas');c.width=w*cols;c.height=h*Math.ceil(frames/cols);const ctx=c.getContext('2d');
      for(let i=0;i<frames;i++){const t=Math.min(Math.max(0,v.duration-.025),i/fps);if(Math.abs(v.currentTime-t)>.001)await event(v,'seeked',()=>{v.currentTime=t;});ctx.drawImage(v,(i%cols)*w,Math.floor(i/cols)*h,w,h);}
      v.removeAttribute('src');v.load();
      const src=c.toDataURL('image/webp',.86);await imageFor(src).decode();return {src,frames,cols,tileWidth:w,tileHeight:h,fps};
    }finally{if(file){imageCache.delete(url);URL.revokeObjectURL(url);}}
  }
  function setPath(obj,path,value){const last=path.at(-1);let cur=obj;for(const k of path.slice(0,-1))cur=cur[k];cur[last]=value;}
  function thumbList(source){
    if(!source)return Array(7).fill(blank);if(source.thumbs)return source.thumbs;
    if(!source.tileWidth)return Array(7).fill(source.src);
    if(posters.has(source))return posters.get(source);
    const c=document.createElement('canvas');c.width=source.tileWidth;c.height=source.tileHeight;const ctx=c.getContext('2d'),im=imageFor(source.src);
    const result=Array.from({length:7},(_,i)=>{const n=Math.round((source.frames-1)*i/6);
      ctx.drawImage(im,n%source.cols*c.width,Math.floor(n/source.cols)*c.height,c.width,c.height,0,0,c.width,c.height);return c.toDataURL('image/webp',.86);});
    posters.set(source,result);return result;
  }
  function mount(stage,row,options={}){
    const spec=programs[row.id], inputs={...spec.binding,...options.inputs},assets=options.assets||{};
    if(!Array.isArray(inputs.captions)||inputs.captions.length!==3||inputs.captions.some(s=>typeof s!=='string'))throw Error('需要三句字幕');
    const beats=inputs.beats;
    if(!Array.isArray(beats)||beats.length!==3||beats[0]!==0||!(beats[1]>0&&beats[2]>beats[1]&&beats[2]<1))throw Error('三个落点从 0 开始，按顺序填写小于 1 的比例');
    const sheet=mk('style','');sheet.textContent=window.PortraitCSS;
    const frame=mk('div','rp-frame'),head=mk('h2','rp-head'),body=mk('div','rp-body'),caption=mk('p','rp-caption'),sub=mk('span','');
    head.textContent=inputs.headline;caption.append(sub);frame.append(head,body,caption);stage.append(sheet,frame);
    const paths=tracks[spec.layout]?.map(t=>t.split(' '));
    const sections=spec.layers.map((l,i)=>{
      const el=mk('div','rp-layer');body.append(el);
      if(l.kind==='ui'){
        const props=structuredClone({...spec.binding.parts[i],...inputs.parts?.[i]});
        if(l.sampleClip){
          const live=spec.layers.find(layer=>layer.kind==='live'&&layer.slot===l.sampleClip);
          const frames=thumbList(assets[l.sampleClip]||machine.strips[live.strip]);
          if(Array.isArray(props.frames))props.frames=frames;
          if(Array.isArray(props.images))props.images=props.images.map((_,i)=>frames[Math.round(6*i/Math.max(1,props.images.length-1))]);
          if('image' in props)props.image=frames[4];
        }
        l.media.forEach(m=>{const a=assets[m.slot];if(a)setPath(props,m.path,a.src);});
        const states=l.states.map((state,j)=>({...state,...inputs.keyframes?.[i]?.[j]}));
        const variants=states.map((state,j)=>{
          const host=mk('div','rp-widget');el.append(host);host.hidden=j!==0;
          VideoUI.mount(host,l.component,{...props,...state});
          for(const img of host.querySelectorAll('img')){
            const source=imageFor(img.src);if(source.naturalWidth){
              img.setAttribute('width',source.naturalWidth);img.setAttribute('height',source.naturalHeight);
              img.style.aspectRatio='auto '+source.naturalWidth+'/'+source.naturalHeight;
            }
          }
          return host;
        });
        return {el,host:variants[0],l,states,variants,props,phase:-1,fromFocus:null,toFocus:null};
      }
      const box=mk('div','rp-picture');el.append(box);
      const follow=l.followSlot&&!assets[l.slot]&&assets[l.followSlot];
      const a=assets[l.slot]||follow||(l.kind==='live'?machine.strips[l.strip]:{src:media[l.file]});
      if(!a){const note=mk('div','rp-raw-note');note.textContent='在“换成本期内容”中放入主体素材';box.append(note);return {el,l};}
      if(a.video){
        const v=mk('video','');v.muted=true;v.playsInline=true;v.preload='auto';box.append(v);
        const loaded=event(v,'loadeddata',()=>{v.src=a.src;v.load();});
        return {el,l,vid:v,loaded,limit:a.duration,start:follow?Math.max(0,a.duration-row.duration):0};
      }
      if(!a.tileWidth){const im=mk('img','');im.alt=l.label;im.src=a.src;box.append(im);return {el,l};}
      const can=mk('canvas','');can.width=a.tileWidth;can.height=a.tileHeight;box.append(can);
      if(a.tileHeight>a.tileWidth)box.style.height='360px';
      return {el,l,anim:a,ctx:can.getContext('2d',{alpha:false,willReadFrequently:true}),img:imageFor(a.src)};
    });
    const native=spec.layout==='native';
    const segment=t=>t<beats[1]?0:t<beats[2]?1:2;
    function setState(s,j){
      if(!s.variants||s.phase===j)return;
      if(s.phase>=0)s.variants[s.phase].hidden=true;
      s.host=s.variants[j];s.host.hidden=false;s.phase=j;
      const mark=s.host.querySelector('.fr-screen-focus');
      s.toFocus=mark&&s.props.rects?.[s.states[j]?.active||0];
      s.fromFocus=null;
      if(mark&&j){const old=s.props.rects?.[s.states[j-1]?.active||0];s.fromFocus=Array.isArray(old)?old:null;}
    }
    function seek(seconds){
      const t=clamp(seconds/row.duration),j=segment(t),subPhase=clamp((t-beats[j])/((beats[j+1]??1)-beats[j])),arrival=ease(clamp(subPhase/.36));
      sub.textContent=inputs.captions[j];sub.hidden=!sub.textContent;
      // Cue retiming moves the choreography together with its narration.
      const normalized=mix([0,.32,.68][j],[.32,.68,1][j],subPhase);
      const pending=[];
      sections.forEach((s,i)=>{
        setState(s,j);
        if(s.vid)pending.push(s.loaded.then(()=>{
          const stamp=clamp(seconds+s.start,0,Math.max(0,s.limit-.035));
          if(Math.abs(s.vid.currentTime-stamp)>.001)return event(s.vid,'seeked',()=>{s.vid.currentTime=stamp;});
        }));
        if(s.anim&&s.img.complete&&s.img.naturalWidth){const a=s.anim,k=Math.min(a.frames-1,Math.floor(t*a.frames));s.ctx.drawImage(s.img,(k%a.cols)*a.tileWidth,Math.floor(k/a.cols)*a.tileHeight,a.tileWidth,a.tileHeight,0,0,a.tileWidth,a.tileHeight);}
        const pos=native?[270,279,452]:point(paths[i],normalized);
        const h=s.el.offsetHeight||270,w=460,scale=Math.min(pos[2]/w,(native?531:Math.min(531,pos[2]*1.21))/h);
        s.el.style.transform='translate('+(pos[0]-w*scale/2)+'px,'+(pos[1]-h*scale/2)+'px) scale('+scale+')';
        if(!native&&['turn','unveil','wipe'].includes(spec.layout)&&i===1){
          const reveal=ease(clamp((normalized-.18)/.36));s.el.style.clipPath='inset(0 '+((1-reveal)*100)+'% 0 0)';
        }
        if(native&&s.host){
          if(s.toFocus?.every(Number.isFinite)&&s.fromFocus?.length===4){
            const m=s.host.querySelector('.fr-screen-focus');['left','top','width','height'].forEach((k,n)=>{m.style[k]=mix(s.fromFocus[n],s.toFocus[n],arrival)+'%';});
          }
          const focus=s.host.querySelector('.fr-pin,.fr-screen-focus,.fr-mark,.current,[aria-pressed=true],.fr-verdict-label');
          if(focus){focus.style.opacity=String(.73+.27*arrival);focus.style.translate='0px '+((1-arrival)*4)+'px';}
        }
      });
      if(window.MOTION_EXPORT)window.portraitFrameReady=Promise.all(pending);
    }
    seek(0);return {seek,release(){frame.remove();sheet.remove();}};
  }
  window.PortraitEngine={mount,prepareAsset};
  for(const row of MOTION_CATALOG.entries.filter(e=>e.engine==='reference')){
    const p=MotionPrompt.packs[row.pack]||MotionPrompt.pack(row.pack,()=>({width:1080,height:1920,cells:[],mounts:[],cycle:row.duration}));
    p.cycle=Math.max(p.cycle,row.duration);p.ready=ready;p.mounts[row.cell]=(stage,opts)=>mount(stage,row,opts);
  }
})();
