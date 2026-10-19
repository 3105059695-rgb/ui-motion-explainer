(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const query = new URLSearchParams(location.search);
  const renderMode = query.get('render') === '1';
  const names = {opening:'开场 / OPENING',software:'软件操作 / SOFTWARE',interaction:'交互 / INTERACTION',ai:'AI 流程 / INTELLIGENCE',result:'结果 / OUTCOME',transition:'转场 / TRANSITION',ambient:'氛围 / ATMOSPHERE'};
  const order = ['opening','software','interaction','ai','result','transition','ambient'];
  let scenes = [], current = null, duration = 0, time = 0, playing = false, last = 0, sequence = false, project = null;
  window.__UI_STATUS = {ready:false, error:null, currentPreset:null, time:0, duration:0};
  function fit() {
    const box = $('#viewport').getBoundingClientRect();
    $('#stage').style.transform = `scale(${Math.min(box.width/1920,box.height/1080)})`;
  }
  new ResizeObserver(fit).observe($('#viewport'));
  function fail(err) {
    const message = String(err?.stack || err);
    window.__UI_STATUS.error = message;
    $('#error').className = 'error-banner'; $('#error').textContent = message;
    console.error(err);
  }
  window.addEventListener('error', event => fail(event.error || event.message));
  function clean() {
    playing = false; scenes.forEach(c=>c.scene.destroy()); scenes=[];
    $('#scene-root').replaceChildren(); $('#caption').replaceChildren();
  }
  function setFrame(t, masterTime = t) {
    time = Math.max(0,Math.min(Number(t)||0,duration));
    for (const item of scenes) {
      const local = Math.max(0,Math.min(item.duration,time-item.start));
      item.scene.timeline.pause().time(local / item.duration * item.scene.duration,false);
      const active = time >= item.start && (time < item.start+item.duration || time === duration && item.start+item.duration === duration);
      item.host.style.visibility = active ? 'visible' : 'hidden';
      item.host.style.zIndex = active ? '2' : '0';
    }
    const caption = sequence ? (project.captions || []).find(c=>masterTime>=c.start && masterTime<c.end) : null;
    if (caption) {const span=document.createElement('span');span.textContent=caption.text;$('#caption').replaceChildren(span);} else $('#caption').replaceChildren();
    $('#seek').value = String(time);
    $('#timecode').textContent = `${time.toFixed(2)} / ${duration.toFixed(2)}`;
    $('#play').textContent = playing ? 'Ⅱ' : '▶'; $('#play').setAttribute('aria-label',playing?'暂停':'播放');
    Object.assign(window.__UI_STATUS,{time,duration,currentPreset:sequence?'sequence':current?.id,sceneCount:scenes.length});
  }
  function addClip(clip) {
    const host = document.createElement('div'); host.style.cssText='position:absolute;inset:0;visibility:hidden';
    $('#scene-root').append(host);
    const scene = UIFX.mount(clip.preset,host,clip.params || {});
    scenes.push({...clip,host,scene});
  }
  function choose(id, params = {}, autoplay = false) {
    const meta=UIFX.presets.find(p=>p.id===id); if (!meta) throw Error('Missing preset '+id);
    clean(); current=meta; sequence=false;
    addClip({preset:id,start:0,duration:meta.duration,params});
    duration=scenes[0].scene.duration; scenes[0].duration=duration;
    $('#seek').max=duration; $('#scene-title').textContent=meta.title;
    $('#scene-description').textContent=meta.description;
    $('#category-label').textContent=names[meta.category]||meta.category;
    $('#scene-code').textContent=meta.id;
    $('#mechanism').textContent=meta.description;
    $('#tags').replaceChildren(...(meta.tags||[]).map(text=>{const el=document.createElement('span');el.className='tag';el.textContent=text;return el;}));
    const source=$('#source-note'); source.replaceChildren();
    const statuses={'observed-reconstruction':'依据已观察交互机制重建；并非原作者代码。','original-extension':'原创扩展；遵循本系列视觉规范。','illustrative-product':'产品界面示意；并非当前版本的逐像素复刻或真实操作记录。'};
    source.textContent=meta.sourceObservation==='static-image'
      ? '依据静态界面重建；点击、输入与转场节奏为原创编排。'
      : statuses[meta.sourceStatus]||'原创动效示意。';
    if (meta.source && /^https:\/\//.test(meta.source)) {const a=document.createElement('a');a.href=meta.source;a.target='_blank';a.rel='noopener';a.textContent=' 查看参考来源 ↗';source.append(a);}
    document.querySelectorAll('.preset-item').forEach(b=>b.classList.toggle('active',b.dataset.preset===id));
    setFrame(autoplay || renderMode ? 0 : Math.min(.8,duration)); if (autoplay) play();
    if (!renderMode) history.replaceState(null,'',`?preset=${encodeURIComponent(id)}`);
  }
  function validateProject(config) {
    if (config.width!==1920 || config.height!==1080) throw Error('This library requires a 1920×1080 project canvas.');
    if (!Number.isFinite(config.duration)||config.duration<=0||!Array.isArray(config.clips)||!config.clips.length) throw Error('Project requires duration and clips.');
    let end=0;
    for(const c of config.clips) {
      if (!Number.isFinite(c.start)||!Number.isFinite(c.duration)||c.duration<=0||Math.abs(c.start-end)>.001) throw Error('Clips must be ordered and contiguous. Invalid clip: '+c.id);
      if (!UIFX.presets.some(p=>p.id===c.preset)) throw Error('Unknown preset in project: '+c.preset);
      end=c.start+c.duration;
    }
    if(Math.abs(end-config.duration)>.001) throw Error('Clip end does not match project duration.');
    for(const c of config.captions||[]) if(!(c.start>=0&&c.end>c.start&&c.end<=config.duration)||typeof c.text!=='string') throw Error('Invalid caption.');
    return config;
  }
  async function loadProject() {
    if(project) return project;
    const path=query.get('project')||'project.json';
    if(/^\w+:/.test(path)||path.startsWith('//')||path.includes('..')) throw Error('Project must be a local relative JSON path.');
    const response=await fetch(path); if(!response.ok) throw Error('Cannot load project: '+response.status);
    project=validateProject(await response.json()); return project;
  }
  async function chooseSequence(autoplay=false) {
    const config=await loadProject(); clean(); sequence=true; duration=config.duration;
    config.clips.forEach(addClip); $('#seek').max=duration;
    $('#scene-title').textContent=config.title || '组合演示'; $('#scene-description').textContent='开场 → 连续软件操作 → 结果呈现';
    $('#category-label').textContent='NARRATIVE / 组合演示'; $('#scene-code').textContent='project.json';
    $('#mechanism').textContent='按项目事件表组合动作。示范时长不是每条视频的固定模板。';
    $('#source-note').textContent='原创编排 · 软件画面为界面示意 · '+(config.audio?'音轨在导出时合成；当前网页预览无声':'当前示范无音轨');
    $('#tags').replaceChildren(); document.querySelectorAll('.preset-item').forEach(b=>b.classList.remove('active'));
    setFrame(0); if(autoplay)play();
  }
  function play(){if(time>=duration)setFrame(0);playing=true;last=performance.now();$('#play').setAttribute('aria-label','暂停');}
  function tick(now){if(playing){const next=time+(now-last)/1000;last=now;if(next>=duration){playing=false;setFrame(duration);}else setFrame(next);}requestAnimationFrame(tick);}
  function list(filter='') {
    const nav=$('#preset-list');nav.replaceChildren(); let index=0;
    const matching=UIFX.presets.filter(p=>[p.title,p.id,p.description,...p.tags||[]].join(' ').toLowerCase().includes(filter.toLowerCase()));
    for(const group of order){const items=matching.filter(p=>p.category===group);if(!items.length)continue;const h=document.createElement('div');h.className='group-title';h.textContent=names[group];nav.append(h);
      for(const p of items){const b=document.createElement('button');b.type='button';b.className='preset-item'+(p.id===current?.id?' active':'');b.dataset.preset=p.id;b.innerHTML=`<span class="preset-num">${String(++index).padStart(2,'0')}</span><span class="preset-label">${UIFX.esc(p.title)}</span><span class="preset-time">${p.duration}s</span>`;b.onclick=()=>{try{choose(p.id,{},true);$('#params-form').reset();}catch(e){fail(e);}};nav.append(b);}}
    if(!matching.length){const p=document.createElement('p');p.className='empty';p.textContent='没有匹配的预设';nav.append(p);}
    $('#preset-count').textContent=UIFX.presets.length+' 项';
  }
  $('#search').addEventListener('input',e=>list(e.target.value));
  $('#play').onclick=()=>{if(playing){playing=false;setFrame(time);}else play();};
  $('#restart').onclick=()=>{setFrame(0);play();};
  $('#seek').addEventListener('input',e=>{playing=false;setFrame(Number(e.target.value));});
  $('#project-play').onclick=()=>chooseSequence(true).catch(fail);
  $('#params-form').onsubmit=e=>{e.preventDefault();if(!current||sequence)return;const params={};for(const [key,value] of new FormData(e.currentTarget))if(value.trim())params[key]=value.trim();try{choose(current.id,params,true);}catch(err){fail(err);}};
  if(renderMode)document.body.classList.add('render-mode');
  const readyPromise=(async()=>{await document.fonts.ready;if(!UIFX.presets.length)throw Error('No presets loaded');list();if(renderMode||query.get('sequence')==='1')await chooseSequence();else choose(query.get('preset')||(UIFX.presets.some(p=>p.id==='continuous-codex-story')?'continuous-codex-story':UIFX.presets[0].id));fit();window.__UI_STATUS.ready=true;})();
  window.ready=()=>readyPromise;
  window.render=async(t,masterTime=t)=>{await readyPromise;playing=false;setFrame(t,masterTime);};
  window.motionActive=()=>false; // No unverified temporal blur; scene timelines retain precise text.
  readyPromise.catch(fail);requestAnimationFrame(tick);
})();
