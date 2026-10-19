'use strict';
const labels={'ui-morphing':'UI 连续变形','scientific-explainer':'数学与科学讲解','history-timeline':'历史与时间线','recipe-animation':'食谱与步骤','pixel-art':'像素动画','animated-story':'动画故事','3d-motion':'三维动效','music-visual':'音乐可视化','kinetic-typography':'动态字体','product-film':'产品发布片','motion-showreel':'动效展示片','general-motion':'其他动效'};
const byId=id=>document.getElementById(id);
let entries=[],activeCategory='',current=null,builds=new Map(),sourceOnly=false;
const buildLabel=build=>sourceOnly?(build?.source_available?'源码已保留':'待制作'):(build?.label||'待实现');
const text=(tag,value,className)=>{const node=document.createElement(tag);node.textContent=value||'';if(className)node.className=className;return node;};
const link=(label,url)=>{const node=text('a',label);node.href=url;node.target='_blank';node.rel='noopener';return node;};
function render(){
  const query=byId('search').value.trim().toLowerCase(), kind=byId('kind').value, scope=byId('build-filter')?.value||'';
  activeCategory=byId('category').value;
  const filtered=entries.filter(e=>(!activeCategory||e.category===activeCategory)&&(!kind||e.tags.includes(kind))&&(!scope||(scope==='runnable'?builds.get(e.slug)?.project:builds.get(e.slug)?.status===scope))&&(!query||[e.title,e.handle,e.slug,e.prompt,e.stack,e.category].join(' ').toLowerCase().includes(query)));
  byId('result-count').textContent=filtered.length+' / '+entries.length+' 个案例';
  byId('empty').hidden=filtered.length>0;
  byId('grid').replaceChildren();
  filtered.forEach(e=>{
    const card=text('button',null,'reference-card');card.setAttribute('aria-label',e.title+'，查看原片和提示词');
    const preview=text('div',null,'preview'), poster=document.createElement('img');poster.src=e.local_poster||e.poster;poster.alt=e.title;poster.loading='lazy';
    preview.append(poster,text('span',String(entries.indexOf(e)+1).padStart(3,'0'),'number'));
    const build=builds.get(e.slug);preview.append(text('span',buildLabel(build),'build-badge '+(build?.project?'available':'')));
    preview.append(text('span','原片参考','source-badge'));
    const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');preview.append(video);
    card.addEventListener('mouseenter',()=>{if(!video.src)video.src=sourceOnly?e.preview:(e.local_preview||e.preview);video.play().then(()=>video.classList.add('playing')).catch(()=>{});});
    card.addEventListener('mouseleave',()=>{video.pause();video.classList.remove('playing');});
    const meta=text('div',null,'card-meta'),tags=text('div',null,'tags');
    e.tags.forEach(t=>tags.append(text('span',t==='skill'?'Skill':'Prompt')));
    meta.append(text('span',e.handle),tags);card.append(preview,text('div',e.title,'card-title'),meta);
    card.addEventListener('click',()=>show(e));byId('grid').append(card);
  });
  Array.from(byId('chips').children).forEach(node=>node.classList.toggle('active',node.dataset.category===activeCategory));
}
function show(e){
  current=e;const root=byId('detail-content');root.replaceChildren();
  const player=document.createElement('video');player.className='detail-player';player.controls=true;player.playsInline=true;player.preload='metadata';player.poster=e.local_poster||e.poster;player.src='originals/'+e.slug+'.mp4';root.append(player);
  root.append(text('h2',e.title));
  const meta=text('div',null,'detail-meta');meta.append(text('span',[e.handle,e.stack||'未标注技术栈',e.model,e.date].filter(Boolean).join(' · ')),document.createElement('br'),link('原站案例 ↗','https://prompt-motion.com/'+e.slug));
  if(e.source_post){meta.append(document.createTextNode('　'),link('作者原帖 ↗',e.source_post));}root.append(meta);
  const build=builds.get(e.slug);
  root.append(text('p','复刻状态：'+buildLabel(build)+'。上方播放器是原片参考。'+(sourceOnly?'已清理旧导出和音轨，使用源码前按需恢复素材。':''),'notice'));
  if(build?.project){
    const controls=text('div',null,'detail-controls');controls.append(link('打开我的重建工程 ↗',build.project+'/index.html'),link('查看项目配置 ↗',build.project+'/project.json'));
    if(build.video && build.video_available!==false)controls.append(link('播放我的导出 MP4 ↗',build.video));
    if(build.comparison && build.comparison_available!==false)controls.append(link('原片与重建对照 ↗',build.comparison));
    root.append(controls);
    if(build.video && build.video_available!==false){const mine=document.createElement('video');mine.className='detail-player';mine.controls=true;mine.playsInline=true;mine.preload='metadata';mine.src=build.video;root.append(text('h3','我的代码重建结果'),mine);}
    if(build.limitations?.length)root.append(text('p','已记录差异：'+build.limitations.join('；'),'notice'));
  }
  const controls=text('div',null,'detail-controls'),copy=text('button','复制完整提示词');copy.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(e.prompt||e.skill_description||'');copy.textContent='已复制';}catch{copy.textContent='请从下方选择复制';}});controls.append(copy);
  const invoke=text('button','复制复刻请求');invoke.addEventListener('click',async()=>{await navigator.clipboard.writeText('使用 $prompt-motion-replica 复刻 https://prompt-motion.com/'+e.slug+'。保留原片的镜头、运动与节奏，交付可编辑工程和 MP4，并生成原片对照。');invoke.textContent='已复制请求';});controls.append(invoke);
  if(e.skill_repo)controls.append(link('公开 Skill 源码 ↗',e.skill_repo));root.append(controls);
  if(e.skill_description)root.append(text('p',e.skill_description));
  if(e.prompt){root.append(text('h3','完整原提示词'),text('pre',e.prompt,'prompt'));}
  if(e.skill_install_command)root.append(text('h3','原作者安装命令（仅记录，未执行）'),text('div',e.skill_install_command,'command'));
  const command=build?.project?'python scripts/rebuild.py clone '+e.slug+' --out <新的工程目录>':'python scripts/toolkit.py new '+e.slug+' --out <新的工程目录> --with-video';
  root.append(text('h3',build?.project?'复制已实现工程':'准备案例实现'),text('div',command,'command'));
  if(e.local_video_absolute && !sourceOnly)root.append(text('p','原视频缓存入口：'+e.local_video_absolute,'detail-meta'));
  byId('detail').showModal();history.replaceState(null,'','#'+e.slug);
}
byId('detail').querySelector('.close').addEventListener('click',()=>byId('detail').close());
byId('detail').addEventListener('close',()=>{byId('detail-content').querySelectorAll('video').forEach(v=>v.pause());history.replaceState(null,'',location.pathname);});
['search','category','kind','build-filter'].forEach(id=>byId(id)?.addEventListener(id==='search'?'input':'change',render));
function loadProgress(){return fetch('references/rebuild-status.json?t='+Date.now(),{cache:'no-store'}).then(r=>r.ok?r.json():{entries:[]}).then(doc=>{sourceOnly=doc.storage_mode==='source-only';builds=new Map(doc.entries.map(e=>[e.slug,e]));if(byId('build-count'))byId('build-count').textContent=doc.runnable||0;const complete=doc.all_implemented===true;byId('status').textContent=(doc.runnable||0)+' / 230 个源码入口 · '+(sourceOnly?'按需制作 · 批量已停止':complete?'完整导出已齐全':'继续实现中');if(byId('rebuild-title'))byId('rebuild-title').textContent=sourceOnly?'制作方法与可编辑源码':complete?'230 个案例均有源码与完整导出':'全站复刻实施中';return doc;});}
Promise.all([fetch('references/catalog.json').then(r=>{if(!r.ok)throw Error('案例目录尚未生成');return r.json();}),loadProgress()]).then(([doc])=>{
  entries=doc.entries;byId('count').textContent=entries.length;
  const categories=Array.from(new Set(entries.map(e=>e.category))).sort();
  for(const cat of categories){const option=text('option',labels[cat]||cat);option.value=cat;byId('category').append(option);}
  for(const cat of ['',...categories]){const button=text('button',cat?(labels[cat]||cat):'全部','chip');button.dataset.category=cat;button.addEventListener('click',()=>{byId('category').value=cat;render();});byId('chips').append(button);}
  render();const slug=location.hash.slice(1);if(slug){const e=entries.find(e=>e.slug===slug);if(e)show(e);}
  let lastBuilds=JSON.stringify(Array.from(builds.values()));
  setInterval(()=>loadProgress().then(()=>{const now=JSON.stringify(Array.from(builds.values()));if(now!==lastBuilds){lastBuilds=now;if(!byId('detail').open)render();}}).catch(()=>{}),15000);
}).catch(error=>{byId('status').textContent='读取失败';byId('grid').append(text('p',error.message+'。请通过 toolkit.py serve 打开此目录。','loading'));});
