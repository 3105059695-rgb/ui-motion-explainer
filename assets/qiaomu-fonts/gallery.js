(() => {
  'use strict';
  const el = (id) => document.getElementById(id);
  const stage = el('stage');
  const titles = {editorial:'观点自有分量',literary:'字里行间',tech:'让想法发生',trend:'好东西值得说',youth:'这一刻很精彩',punch:'先看懂再动手',promo:'发现身边美好',soft:'慢一点也很好',playful:'今天有点可爱',warm:'写给此刻的你',guofeng:'山河入画',guochao:'把热爱写出来'};
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const ease = (n) => 1 - Math.pow(1 - clamp(n), 4);
  let pairings = [], fontRows = new Map(), selected='tech', currentTime=2, playing=false, frameHandle=0, selectionToken=0;
  let pageReadyResolve, pageReadyReject;
  window.qmReady = new Promise((resolve,reject) => {pageReadyResolve=resolve;pageReadyReject=reject;});
  const family = (id) => 'Qiaomu-' + id;
  async function loadIds(ids) {
    return Promise.all([...new Set(ids)].filter(Boolean).map(async id => {
      const f=fontRows.get(id);
      const faces=await document.fonts.load(`${f?.style || 'normal'} ${f?.weight || 400} 48px "${family(id)}"`);
      if(!faces.length) throw new Error('字体没有载入: '+id);
    }));
  }
  function fitTitle() {
    const node=el('hero-text'), container=node.parentElement;
    container.style.fontSize='76px';
    const available=stage.clientWidth-(stage.clientWidth<900?60:112);
    const natural=node.getBoundingClientRect().width/(parseFloat(container.dataset.scale||'1'));
    if(natural>available) container.style.fontSize=Math.max(22,Math.floor(76*available/natural))+'px';
  }
  function renderAt(time) {
    currentTime=Math.max(0,Math.min(6,Number(time)||0));
    const enter=ease(currentTime/.8), handoff=ease((currentTime-3.35)/1.05);
    const phrase=stage.querySelector('.hero-phrase');
    const scale=(.97+.03*enter)*(1-.42*handoff);
    phrase.dataset.scale=String(scale);
    phrase.style.opacity=String(enter);
    phrase.style.transform=`translate(${12*handoff}px,${24*(1-enter)-7*handoff}px) scale(${scale})`;
    phrase.style.clipPath=`inset(0 0 ${100*(1-enter)}% 0)`;
    const support=stage.querySelector('.hero-support');
    support.style.opacity=String(ease((currentTime-.55)/.7)*(1-handoff));
    support.style.transform=`translateY(${10*(1-enter)}px)`;
    const panel=stage.querySelector('.reading-panel');
    panel.style.opacity=String(handoff);
    panel.style.transform=`translateY(${15*(1-handoff)}px)`;
    stage.querySelector('.stage-index').style.opacity=String(1-handoff);
    el('scrub').value=String(currentTime);el('time').textContent=currentTime.toFixed(2)+' s';
    return {time:currentTime,pairing:selected,effect:el('effect').value};
  }
  window.renderAt=renderAt;
  function stop() {playing=false;cancelAnimationFrame(frameHandle);el('play').textContent='播放动效';}
  async function selectPairing(id) {
    const item=pairings.find(p=>p.id===id);if(!item)throw new Error('Unknown pairing '+id);
    const token=++selectionToken;el('status').textContent='正在载入本地字体…';
    await loadIds([item.title,item.body,item.latin,...item.latinAlternates]);
    if(token!==selectionToken)return;
    selected=id;stage.dataset.pairing=id;el('pair-name').textContent=item.name;
    el('font-label').textContent=[item.title,item.body,item.latin].map(x=>fontRows.get(x)?.originalFamily||x).join(' · ');
    document.querySelectorAll('.pair-card').forEach(b=>{b.classList.toggle('selected',b.dataset.pairing===id);b.setAttribute('aria-pressed',String(b.dataset.pairing===id));});
    const saved=currentTime;renderAt(2);fitTitle();renderAt(saved);
    el('status').textContent='本地字体已载入';return id;
  }
  window.selectPairing=selectPairing;
  function makeCard(p,i) {
    const b=document.createElement('button');b.type='button';b.className='pair-card qm-pairing';b.dataset.pairing=p.id;
    const top=document.createElement('div');top.className='pair-top';
    const n=document.createElement('span');n.textContent=p.name;
    const ix=document.createElement('span');ix.className='pair-no';ix.textContent=String(i+1).padStart(2,'0');top.append(n,ix);
    const title=document.createElement('span');title.className='qm-title';title.textContent=titles[p.id]||'让表达更清晰';
    const body=document.createElement('span');body.className='qm-body';body.textContent='标题有性格，正文保持清楚。';
    const bottom=document.createElement('div');bottom.className='pair-bottom';
    const latin=document.createElement('span');latin.className='qm-latin';latin.textContent='Aa / 0123';
    const hint=document.createElement('small');hint.textContent=fontRows.get(p.title)?.originalFamily||p.title;bottom.append(latin,hint);
    b.append(top,title,body,bottom);b.addEventListener('click',()=>{stop();selectPairing(p.id).then(()=>renderAt(2)).catch(showError);});return b;
  }
  function showError(err){el('status').textContent=err.message;console.error(err);}
  async function initialize() {
    const responses=await Promise.all([fetch('pairings.json'),fetch('registry.json')]);
    if(responses.some(r=>!r.ok))throw new Error('请通过本地 HTTP 服务打开预览');
    const [pairs,registry]=await Promise.all(responses.map(r=>r.json()));
    pairings=pairs.pairings;fontRows=new Map(registry.fonts.map(f=>[f.id,f]));
    const grid=el('pair-grid');pairings.forEach((p,i)=>grid.appendChild(makeCard(p,i)));
    await loadIds(registry.fonts.map(f=>f.id));await document.fonts.ready;
    await selectPairing('tech');renderAt(2);
    window.qmFontReport=registry.fonts.map(f=>({id:f.id,loaded:document.fonts.check(`${f.style} ${f.weight} 48px "${family(f.id)}"`)}));
    pageReadyResolve({pairings:pairings.length,fonts:registry.fonts.length});
  }
  el('play').addEventListener('click',()=>{
    if(playing){stop();return;}playing=true;el('play').textContent='暂停';
    if(currentTime>=6)currentTime=0;else if(currentTime===2)currentTime=0;
    const start=performance.now()-currentTime*1000;
    const tick=now=>{renderAt((now-start)/1000);if(currentTime>=6)stop();else if(playing)frameHandle=requestAnimationFrame(tick);};frameHandle=requestAnimationFrame(tick);
  });
  el('scrub').addEventListener('input',()=>{stop();renderAt(el('scrub').value);});
  el('sample-text').addEventListener('input',()=>{el('hero-text').textContent=el('sample-text').value||'把重点讲清楚';const t=currentTime;renderAt(2);fitTitle();renderAt(t);});
  el('effect').addEventListener('change',()=>{el('hero-text').className='qm-fx qm-fx-'+el('effect').value;const t=currentTime;renderAt(2);fitTitle();renderAt(t);});
  window.addEventListener('resize',()=>{const t=currentTime;renderAt(2);fitTitle();renderAt(t);});
  initialize().catch(err=>{showError(err);pageReadyReject(err);});
})();
