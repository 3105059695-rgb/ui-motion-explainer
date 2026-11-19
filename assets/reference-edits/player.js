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
  const editorial = window.AgentEditorial;
  const colors = episode.palette || editorial.palette;
  const art = editorial.create(ctx, {palette:colors, fontFamily:'Episode, sans-serif'});
  slider.max = String(episode.frames - 1);
  if (new URLSearchParams(location.search).has('render')) {
    nav.hidden = true;
    document.documentElement.classList.add('render');
  }
  const cache = new Map();
  const clamp = (v,low=0,high=1) => Math.min(high,Math.max(low,v));
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
  function round(x,y,w,h,r) {
    ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
  }
  function textLayout(spec,x,y,w,h) {
    const role=spec.surface, text=spec.text;
    const bold=role==='headline' || role==='focus';
    const unit=Math.min(canvas.width,canvas.height);
    let size=Math.min(h*.47,w*.15,unit*(bold ? .064 : .05));
    let lines=[];
    const wrap=()=>{
      const result=[];
      const available=role==='query' ? Math.max(w*.5,w*.88-1.55*size) : w*.88;
      for (const paragraph of text.split(/\r?\n/)) {
        let current='';
        for (const char of [...paragraph]) {
          if (current && ctx.measureText(current+char).width>available) {result.push(current);current=char;}
          else current+=char;
        }
        result.push(current);
      }
      return result;
    };
    for (let n=0;n<18;n++) {
      ctx.font=(bold?'700 ':'500 ')+size+'px Episode, sans-serif';lines=wrap();
      if(lines.length*size*1.24<=h*.83 || size<5) break;
      size*=.84;
    }
    const pad=Math.min(w*.045,size*.54);
    const icon=role==='query'?size*1.55:0;
    const width=Math.min(w,Math.max(role==='query'?unit*.84:0,Math.max(...lines.map(line=>ctx.measureText(line).width))+2*pad+icon));
    const height=Math.min(h,size*(1.24*lines.length+(role==='query' ? .8 : .45)));
    const centered=role==='focus' || role==='caption' && !spec.placement;
    const left=centered||role==='query'?x+(w-width)/2:x+Math.min(w-width,w*.035);
    return {lines,size,pad,icon,box:[left,y+(h-height)/2,width,height],centered};
  }
  function paintText(spec,layout,progress) {
    const {lines,size,pad,icon,box,centered}=layout;
    const [x,y,w,h]=box;
    const radius=spec.surface==='headline'?0:size*.22;
    round(x,y,w,h,radius);ctx.fillStyle=colors.white;ctx.fill();
    if(spec.surface!=='headline'){
      ctx.lineWidth=Math.max(.65,size*.028);ctx.strokeStyle=colors.line;ctx.stroke();
    }
    if(spec.surface==='focus'){
      ctx.fillStyle=colors.purple;
      ctx.fillRect(x+pad,y+h-size*.14,Math.max(0,w-2*pad),size*.12);
    }
    if(spec.surface==='query'){
      const cx=x+pad+size*.35, cy=y+h/2-size*.07;
      ctx.beginPath();ctx.arc(cx,cy,size*.28,0,Math.PI*2);
      ctx.strokeStyle=colors.muted;ctx.lineWidth=Math.max(1,size*.08);ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx+size*.19,cy+size*.19);ctx.lineTo(cx+size*.44,cy+size*.44);ctx.stroke();
    }
    ctx.textAlign=centered?'center':'left';ctx.textBaseline='middle';
    ctx.fillStyle=colors.black;
    // Reserve the final line layout while the actual search term is typed.
    let remaining=spec.surface==='query'?Math.max(1,Math.ceil([...spec.text].length*clamp(progress/.15))):Infinity;
    const first=y+h/2-(lines.length-1)*size*.62;
    lines.forEach((line,i)=>{
      const letters=[...line],display=letters.slice(0,remaining).join('');
      remaining=Math.max(0,remaining-letters.length);
      ctx.fillText(display,centered?x+w/2:x+pad+icon,first+i*size*1.24,Math.max(1,w-2*pad-icon));
      if(spec.surface==='query' && display && (display.length<line.length || i===lines.length-1)){
        ctx.fillStyle=colors.accentInk;ctx.fillRect(x+pad+icon+ctx.measureText(display).width+size*.08,
          first+i*size*1.24-size*.45,Math.max(1,size*.075),size*.9);ctx.fillStyle=colors.black;
      }
    });
  }
  function paint(node,spec,p,r,progress=0) {
    let [x,y,w,h,a,zoom,iris,wipe]=p;
    if (a<=.001 || iris<=.001 || wipe<=.001) return false;
    x=r[0]+x*r[2];y=r[1]+y*r[3];w*=r[2];h*=r[3];
    const focus=spec.focus || [.5,.5];
    ctx.save();
    ctx.globalAlpha=a;
    if (wipe<.999) {ctx.beginPath();ctx.rect(x,y,w*wipe,h);ctx.clip();}
    if (iris<.999) {ctx.beginPath();ctx.arc(x+w*focus[0],y+h*focus[1],iris*Math.hypot(w,h),0,2*Math.PI);ctx.clip();}
    let bounds=[x,y,w,h];
    if(spec.kind==='text'){
      const layout=textLayout(spec,x,y,w,h);
      paintText(spec,layout,progress);
      bounds=layout.box;
    }else{
      const iw=node.videoWidth||node.naturalWidth, ih=node.videoHeight||node.naturalHeight;
      if (!iw || !ih) throw Error('素材画幅无效');
      const framed=spec.surface==='paper'||spec.surface==='window';
      const unit=Math.min(r[2],r[3]);
      const full=p[2]>.99 && p[3]>.99;
      const edge=framed?Math.min(w*.035,h*.035,unit*.009):0;
      if(framed){
        const dark=spec.surface==='window';
        art.card({x,y,w,h},{fill:dark?colors.black:colors.white,edge:dark?colors.rim:colors.line,
          depth:full?0:unit*.002,radius:full?0:unit*.009,shadow:full?false:unit*.008,
          shadowOffsetY:unit*.003,lineWidth:Math.max(.7,unit*.001)});
      }
      const ax=x+edge,ay=y+edge,aw=w-2*edge,ah=h-2*edge;
      round(ax,ay,aw,ah,framed&&!full?unit*.004:0);ctx.clip();
      const fit=spec.fit==='cover' ? Math.max(aw/iw,ah/ih) : Math.min(aw/iw,ah/ih);
      const dw=iw*fit*zoom, dh=ih*fit*zoom;
      const dx=ax+(aw-dw)*(dw>aw?focus[0]:.5),dy=ay+(ah-dh)*(dh>ah?focus[1]:.5);
      ctx.drawImage(node,dx,dy,dw,dh);
      if(!framed) bounds=[Math.max(x,dx),Math.max(y,dy),Math.min(w,dw),Math.min(h,dh)];
    }
    ctx.restore();
    const right=Math.min(bounds[0]+bounds[2],x+w*wipe);
    if(right<=bounds[0])return false;
    return [bounds[0]/canvas.width,bounds[1]/canvas.height,(right-bounds[0])/canvas.width,bounds[3]/canvas.height];
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
    const field=(episode.cutaways || []).find(cut=>cut.start<=f && f<cut.end);
    const active=[];
    for(let i=0;!field && i<episode.shots.length;i++){
      const s=episode.shots[i];
      if(f<s.start||f>=s.end)continue;
      const t=(f-s.start)/(s.end-s.start);
      const jobs=[];
      for(const layer of episode.recipes[s.id]){
        const spec=s.inputs[layer.slot], geo=FusionShot.at(layer.keys,t,spec);
        if(!geo||geo[4]<=.001||geo[6]<=.001||geo[7]<=.001) continue;
        jobs.push({slot:layer.slot,spec,geo});
      }
      active.push({i,s,jobs,t});
    }
    let under=null;
    if(episode.base_video && (!field || field.inset)) {under=await asset('base',{src:episode.base_video,kind:'video'});await positionVideo(under,f/episode.fps);}
    let outdoors=null;
    if(field){
      outdoors=await asset('field/'+field.start,field);
      await positionVideo(outdoors,field.source_in+(f-field.start)/episode.fps);
    }
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
    ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=colors.paper;ctx.fillRect(0,0,canvas.width,canvas.height);
    const stage=[0,0,canvas.width,canvas.height], full=[0,0,1,1,1,1,1,1];
    if(field){
      ctx.fillStyle='#0b0b0f';ctx.fillRect(...stage);
      paint(outdoors,{kind:'video',fit:'contain'},full,stage);
      if(under && field.inset){
        const r=field.inset.map((n,i)=>n*stage[2+i%2]);
        paint(under,{kind:'video',fit:'contain'},full,r);
      }
    }else if(under)paint(under,{kind:'video',fit:'contain'},full,stage);
    const sources=[];
    const implementations=new Set();
    for(let ix=0;ix<active.length;ix++){
      const {s,jobs,t}=active[ix];
      const r=s.rect.map((n,i)=>n*(i%2===0?canvas.width:canvas.height));
      ctx.save();ctx.beginPath();ctx.rect(...r);ctx.clip();
      ctx.fillStyle=colors.paper;ctx.fillRect(...r);
      const painted=[];
      for(const j of jobs){
        const bounds=paint(j.node,j.spec,j.geo,r,t);
        if(bounds)painted.push({slot:j.slot,bounds,opaque:j.geo[4]>=.999 && j.geo[6]>=.999});
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
    const dialogues=window.FUSION_PROOF_CAPTIONS;
    if(dialogues){
      const ms=f*1000/episode.fps, cue=dialogues.find(c=>c.start_ms<=ms && ms<c.end_ms);
      if(cue){
        const [x,y,w,h]=field?.subtitle || [.04,.80,.92,.16];
        const cw=canvas.width,ch=canvas.height, rows=cue.text.split('\n');
        let size=Math.min(ch*.057,ch*h/(1.22*rows.length));
        ctx.save();ctx.font='600 '+size+'px Episode, sans-serif';
        const width=Math.max(...rows.map(line=>ctx.measureText(line).width));
        if(width>cw*w){size*=cw*w/width;ctx.font='600 '+size+'px Episode, sans-serif';}
        ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
        ctx.strokeStyle='rgba(11,11,15,.93)';ctx.fillStyle='#fff';ctx.lineWidth=Math.max(2,size*.13);
        rows.forEach((line,i)=>{
          const cx=(x+w/2)*cw, cy=(y+h/2)*ch+(i-(rows.length-1)/2)*size*1.22;
          ctx.strokeText(line,cx,cy);ctx.fillText(line,cx,cy);
        });
        ctx.restore();
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
