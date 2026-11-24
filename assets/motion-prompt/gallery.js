(() => {
  const data = window.MOTION_CATALOG, edition = window.MotionEdition, directory=window.MotionDirectory;
  let directoryRows=null;
  const byId = new Map(data.entries.map(e=>[e.id,e]));
  const readId=value=>{const m=String(value).trim().match(/^#?(m?)(\d+)(@[a-z][a-z0-9_-]*)?$/i);
    return m?m[1].toUpperCase()+m[2].padStart(3,'0')+(m[3]||'').toUpperCase():null;};
  const packs = new Map(data.packs.map(p=>[p.id,p]));
  const $ = id=>document.getElementById(id);
  const option = (menu, value, name)=>menu.add(new Option(name,value));
  const films=data.referenceFilms||{};
  const fmt=t=>String(Math.floor(t/60)).padStart(2,'0')+':'+(t%60).toFixed(2).padStart(5,'0');
  const span=r=>fmt(r.start)+'–'+fmt(r.end);
  const sourceName=r=>films[r.video]?.name||r.video;
  const isPortrait=r=>r.adaptation==='portrait';
  const portraitCount=data.entries.filter(isPortrait).length;
  let portraitOnly=true,sourceURL=null,sourceEnd=Infinity;
  Object.values(films).filter(f=>f.portraitIds.length||f.componentIds.length).forEach(f=>option($('film'),f.id,f.name));
  $('referenceOnly').textContent='参考片竖屏模板 '+portraitCount;
  const variantCount=data.entries.filter(r=>r.variant).length;
  $('showAll').textContent=variantCount?'全部动作（'+(data.entries.length-variantCount)+' 个原编号 · '+variantCount+' 个变体）':'全部动作 '+data.entries.length;
  data.groups.forEach(name=>option($('use'),name,name));
  option($('pack'),'samples','本轮三项');
  option($('pack'),'recent','最近入库');
  data.packs.forEach(p=>option($('pack'),p.id,p.name));
  let picks=[];
  try { picks=JSON.parse(localStorage.getItem('motion-edition.choices.v1')||'[]').filter(id=>byId.has(id)); } catch {}
  let gridLimit=24, shown=[], current=null, speedOn=!matchMedia('(prefers-reduced-motion: reduce)').matches;
  let detailMoving=true, position=0, gridTime=1.55, previousTime=null, bound=null, bindGeneration=0;
  const activeCanvases=new Set(), records=new WeakMap();
  const observer=new IntersectionObserver(rows=>{
    rows.forEach(({target,isIntersecting})=>{
      if(isIntersecting){activeCanvases.add(target);const row=records.get(target);edition.draw(target,row,gridTime%edition.cycle(row));}
      else activeCanvases.delete(target);
    });
  });
  const node=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!=null)el.textContent=txt;return el;};
  function videoSize(canvas,row,width) {
    const p=MotionPrompt.packs[row.pack];
    canvas.width=width;canvas.height=Math.round(width*(row.height||p.height)/(row.width||p.width));
  }
  function surface(row,width) {
    const dom=edition.isDom(row),el=node(dom?'div':'canvas',dom?'preview-dom':'');
    if(dom&&row.width&&row.height)el.style.aspectRatio=row.width+'/'+row.height;
    if(!dom)videoSize(el,row,width);
    return el;
  }
  function markButton(button,id) {
    const on=picks.includes(id);
    button.setAttribute('aria-pressed',String(on));button.classList.toggle('on',on);
    button.textContent=on?'已选':'选用';button.setAttribute('aria-label',(on?'取消选用 ':'选用 ')+'#'+id);
  }
  function choice(id) {
    picks=picks.includes(id)?picks.filter(item=>item!==id):[...picks,id];
    try {localStorage.setItem('motion-edition.choices.v1',JSON.stringify(picks));} catch {}
    $('pickCount').textContent=picks.length;
    const button=$('grid').querySelector('[data-pick="'+id+'"]');if(button)markButton(button,id);
    if(current)$('choose').textContent=picks.includes(current.id)?'从已选移除':'加入已选';
    if($('selection').open)updateSelection();
  }
  function card(row) {
    const wrap=node('article','card'),play=node('button','open'),canvas=surface(row,540);
    if(isPortrait(row))wrap.classList.add('portrait');
    play.type='button';play.setAttribute('aria-label','预览 #'+row.id+' '+row.name);
    records.set(canvas,row);play.append(canvas);
    play.addEventListener('click',()=>openDetail(row));wrap.append(play);
    const body=node('div','cardbody'),title=node('h3'),link=node('button','',row.name);
    link.type='button';link.addEventListener('click',()=>openDetail(row));title.append(link);
    const pick=node('button','pick');pick.type='button';pick.dataset.pick=row.id;markButton(pick,row.id);pick.addEventListener('click',()=>choice(row.id));
    body.append(node('span','num','#'+row.id+' · '+row.category),title,pick);
    if(row.references?.length){const r=row.references.find(v=>v.video===$('film').value)||row.references[0];
      body.append(node('p','source-line',sourceName(r)+'　'+span(r)));}
    body.append(node('p','',row.meaning));wrap.append(body);
    observer.observe(canvas);return wrap;
  }
  function filter() {
    const text=$('search').value.trim().toLowerCase(), use=$('use').value, pack=$('pack').value;
    const tokens=text.split(/\s+/).filter(Boolean);
    const highlights=['M193','M214','M287','M209','M282','M262','M197','M299','M274','M290','M211','M226'];
    const ordered=directoryRows||(portraitOnly?[...highlights.map(id=>byId.get(id)).filter(Boolean),...data.entries.filter(r=>!highlights.includes(r.id))]:
      [...data.entries.filter(r=>r.sample),...data.entries.filter(r=>!r.sample)]);
    const film=$('film').value;
    shown=ordered.filter(r=>{
      if(portraitOnly&&!isPortrait(r))return false;
      if(film&&!r.references?.some(f=>f.video===film))return false;
      if(pack==='samples'?!r.sample:pack==='recent'?r.batch!==data.currentBatch:pack&&r.pack!==pack)return false;
      if(use&&!r.uses.includes(use))return false;
      const indexed=directory.info.get(r.id);
      const hay=[r.id,r.name,r.en,r.meaning,r.category,r.pack,r.sourceKey,r.missing,indexed?.own,indexed?.also,...r.uses,...(r.references||[]).flatMap(f=>[f.video,sourceName(f),...(f.shotIds||[])])].join(' ').toLowerCase();
      return tokens.every(t=>{
        const id=readId(t);
        return id ? r.id===id||r.baseIds?.includes(id) : hay.includes(t);
      });
    });
    gridLimit=24;observer.disconnect();$('grid').querySelectorAll('.preview-dom').forEach(edition.release);activeCanvases.clear();$('grid').replaceChildren();appendRows(0);
    $('count').textContent=shown.length+(portraitOnly?' 套竖屏镜头':' 项')+(pack==='samples'?' · 首轮样片所用':'');
    $('reset').hidden=!(text||use||pack||film||directoryRows);
    $('referenceOnly').setAttribute('aria-pressed',String(portraitOnly));$('showAll').setAttribute('aria-pressed',String(!portraitOnly&&!directoryRows));
    if(!shown.length)$('grid').append(node('p','empty','没有匹配的动作。试试“视角”“比较”或动作编号。'));
  }
  function appendRows(start) {
    const fragment=document.createDocumentFragment();
    shown.slice(start,gridLimit).forEach(r=>fragment.append(card(r)));
    $('grid').append(fragment);$('more').hidden=shown.length<=gridLimit;
  }
  function renderDetail() {
    const duration=edition.cycle(current);
    if(bound)bound.seek($('big'),position);else edition.draw($('big'),current,position);
    $('scrub').value=position;
    $('clock').textContent=position.toFixed(2)+' / '+duration.toFixed(2)+' s';
    $('detailPlay').textContent=detailMoving?'暂停':'播放';
  }
  function openDetail(row,updateHash=true) {
    edition.release($('big'));bound=null;bindGeneration++;current=row;position=0;detailMoving=speedOn;
    $('dPack').textContent=packs.get(row.pack).name+' / '+row.category;
    $('dTitle').textContent='#'+row.id+' '+row.name;$('dEn').textContent=row.origin || row.en;
    $('dMeaning').textContent=row.meaning;$('dBinding').textContent=row.binding;
    const path=directory.paths.get(row.id);$('dDirectory').hidden=!path;
    if(path){$('dFolder').href=directory.href('动作目录.html',{folder:path.folder.key});$('dFolder').textContent=path.section.name+' › '+path.folder.name;}
    const links=$('variantLinks'),rel=row.baseIds||data.entries.filter(r=>r.baseIds?.includes(row.id)).map(r=>r.id);
    links.hidden=!rel.length;links.replaceChildren();
    if(rel.length){links.append(document.createTextNode(row.baseIds?'沿用原动作　':'按参考片补齐的镜头　'));
      for(const id of rel){const a=node('a','', '#'+id);a.href='#'+id;a.title=byId.get(id).name;links.append(a,document.createTextNode('　'));}}
    $('dSample').textContent=row.sample?'本轮竖屏样片　'+row.sample:'';$('dSample').hidden=!row.sample;
    $('dPrompt').textContent=row.prompt||'';$('spec').replaceChildren(...row.upstreamSpec.map(s=>node('li','',s)));
    $('dOrigin').href=row.source||row.code;$('dOrigin').textContent=row.engine?'动作来源':'原作示范 ↗';
    $('dCode').href=row.code;$('dCode').textContent=row.engine==='scene'?'查看可编辑动作':'查看本地代码';$('choose').textContent=picks.includes(row.id)?'从已选移除':'加入已选';
    const stage=surface(row,1078);stage.id='big';if(isPortrait(row))stage.classList.add('portrait-stage');stage.setAttribute('aria-label',row.name+'的动态预览');$('big').replaceWith(stage);
    $('scrub').max=String(edition.cycle(row)-.001);
    if(!detailMoving)position=Math.min(1.55,edition.cycle(row)*.55);
    if(!$('detail').open)$('detail').showModal();
    renderDetail();setUpBindings(row);sourcePanel(row);
    if(updateHash&&location.hash!=='#'+row.id)location.hash=row.id;
  }
  function fromHash() {
    const row=byId.get(readId(location.hash));
    if(row&&current?.id!==row.id)openDetail(row,false);
    else if(!row&&$('detail').open)$('detail').close();
  }
  function setUpBindings(row){
    $('try').hidden=!row.engine;$('try').open=false;$('bindingFeedback').textContent='';
    $('mediaInputs').replaceChildren();
    let defaults=row.defaults || {};
    if(row.engine==='dom'){
      const leaves=$('big').shadowRoot?.querySelectorAll('.sm-title,.sm-detail,.sm-row,.sm-tag')||[];
      defaults=Object.fromEntries([...leaves].filter(el=>!el.children.length&&el.textContent.trim()).slice(0,5).map(el=>[el.textContent,el.textContent]));
    }
    $('params').value=JSON.stringify(defaults,null,2);
    $('paramsLabel').textContent='编辑全部参数（JSON）';
    const fields=$('plainInputs');fields.replaceChildren();
    const names={headline:'镜头标题',beats:'三句口播的落点（时长比例）',old:'原句',new:'替换后的句子',title:'标题',badge:'状态标签',currency:'货币符号',unit:'单位',
      oldPrice:'原价',newPrice:'新价',payloadGB:'要装入的容量',capacitiesGB:'各档容量',name:'名称'};
    for(const [key,value] of Object.entries(defaults)){
      if(!['string','number'].includes(typeof value)&&!Array.isArray(value))continue;
      const numericList=Array.isArray(value)&&value.every(v=>typeof v==='number');
      if(Array.isArray(value)&&!numericList){
        if(row.variant&&value.every(v=>typeof v==='string'))value.forEach((v,n)=>{
          const label=node('label','',key+' '+(n+1)),field=node('input');field.value=v;
          field.oninput=()=>{try{const obj=JSON.parse($('params').value);obj[key][n]=field.value;$('params').value=JSON.stringify(obj,null,2);}catch{}};
          label.append(field);fields.append(label);
        });
        continue;
      }
      const name=names[key] || (row.engine==='dom'||row.engine==='project'?key:typeof value==='string'&&value?value:key);
      const label=node('label','',name),field=node('input');
      field.type=typeof value==='number'?'number':'text';field.value=numericList?value.join('，'):String(value);
      field.oninput=()=>{
        try {
          const obj=JSON.parse($('params').value);
          const next=numericList?field.value.split(/[，,]/).filter(s=>s.trim()).map(Number):
            typeof value==='number'?field.valueAsNumber:field.value;
          if((typeof next==='number'&&!Number.isFinite(next))||(numericList&&next.some(n=>!Number.isFinite(n))))return;
          obj[key]=next;$('params').value=JSON.stringify(obj,null,2);
        }catch{}
      };
      label.append(field);fields.append(label);
    }
    if(row.engine==='reference')defaults.captions.forEach((value,i)=>{
      const label=node('label','','第'+['一','二','三'][i]+'句字幕'),f=node('input');f.value=value;
      f.oninput=()=>{try{const obj=JSON.parse($('params').value);obj.captions[i]=f.value;$('params').value=JSON.stringify(obj,null,2);}catch{}};
      label.append(f);fields.append(label);
    });
    (row.mediaSlots||[]).forEach(slot=>{
      const live=row.videoSlots?.includes(slot)||(row.engine==='reference'&&PortraitPrograms[row.id].layers.some(l=>l.kind==='live'&&l.slot===slot));
      const label=node('label','',(row.slotLabels?.[slot]||slot)+(live?' · 视频或图片':' · 图片')),input=node('input');
      input.type='file';input.accept=live?'video/*,image/*':'image/*';input.dataset.slot=slot;label.append(input);$('mediaInputs').append(label);
    });
  }
  $('applyInputs').onclick=async()=>{
    const row=current,seq=++bindGeneration;
    try{
      const params=JSON.parse($('params').value||'{}');
      if(!params||typeof params!=='object'||Array.isArray(params))throw Error('请提供一个 JSON 对象');
      const assets={};
      for(const input of $('mediaInputs').querySelectorAll('input')){
        if(input.files.length){
          if(row.engine==='reference'){assets[input.dataset.slot]=input.files[0];continue;}
          if(row.videoSlots?.includes(input.dataset.slot)&&input.files[0].type.startsWith('video/')){
            assets[input.dataset.slot]=input.files[0];continue;
          }
          const url=URL.createObjectURL(input.files[0]);
          try{const im=new Image();im.src=url;await im.decode();assets[input.dataset.slot]=im;}finally{URL.revokeObjectURL(url);}
        }
      }
      const next=await edition.bind(row.id,row.engine==='dom'?{text:params}:{inputs:params,assets});
      if(current!==row||seq!==bindGeneration)return;
      edition.release($('big'));bound=next;renderDetail();$('bindingFeedback').textContent='已应用到本次预览';
    }catch(err){if(current===row&&seq===bindGeneration)$('bindingFeedback').textContent=err.message;}
  };
  $('restoreInputs').onclick=()=>{bindGeneration++;bound=null;edition.release($('big'));renderDetail();setUpBindings(current);$('try').open=true;};
  function updateSelection() {
    $('pickList').replaceChildren();
    picks.forEach(id=>{
      const r=byId.get(id),li=node('li','','#'+id+' '+r.name),remove=node('button','','移除');
      remove.type='button';remove.setAttribute('aria-label','移除 #'+id);remove.onclick=()=>choice(id);li.append(remove);$('pickList').append(li);
    });
    $('pickText').value=picks.map(id=>'#'+id+' '+byId.get(id).name).join('\n');
    $('pickText').placeholder='还没有选中动作';$('copy').disabled=!picks.length;$('copied').textContent='';
  }
  function clear(){
    for(const id of ['search','use','pack','film'])$(id).value='';
    if(directoryRows){
      directoryRows=null;$('directoryContext').hidden=true;
      const url=new URL(location.href);url.search=portraitOnly?'':'?view=all';
      try{history.replaceState(null,'',url);}catch{}
    }
  }
  $('search').oninput=()=>{
    if(/^#?(?:m?\d{1,3})$/i.test($('search').value.trim())&&byId.get($('search').value.trim().toUpperCase().replace('#','').replace(/^\d+$/,n=>n.padStart(3,'0')))?.engine!=='reference')portraitOnly=false;
    filter();
  };$('use').onchange=filter;$('film').onchange=filter;
  $('pack').onchange=()=>{const val=$('pack').value;if(val&&!val.startsWith('source-'))portraitOnly=false;filter();};
  $('reset').onclick=()=>{clear();filter();};
  $('referenceOnly').onclick=()=>{portraitOnly=true;clear();filter();};$('showAll').onclick=()=>{portraitOnly=false;clear();filter();};
  $('recent').onclick=()=>{portraitOnly=false;clear();$('pack').value='recent';filter();};
  function holdAtSourceEnd(){
    const v=$('originalVideo');
    if(!v.paused&&v.currentTime>=sourceEnd){v.pause();v.currentTime=sourceEnd;}
  }
  function stopSource(){
    const v=$('originalVideo');v.pause();v.removeAttribute('src');v.load();v.hidden=true;v.onloadedmetadata=null;v.onerror=null;
    if(sourceURL){URL.revokeObjectURL(sourceURL);sourceURL=null;}
  }
  function sourcePanel(row){
    stopSource();const refs=row.references||[];$('originalPanel').hidden=!refs.length;
    const sel=$('originalChoice');sel.replaceChildren();if(!refs.length)return;
    refs.forEach((f,i)=>option(sel,i,sourceName(f)+'　'+span(f)));
    const initial=refs.findIndex(f=>f.video===$('film').value);if(initial>=0)sel.selectedIndex=initial;
    function selected(){
      stopSource();const f=refs[sel.selectedIndex];const can=Boolean(window.PortraitMachine?.originals[f.video]);
      $('sourceDetails').textContent=(row.components?.length?'定稿组件　'+row.components.map(k=>window.VideoUI.byId.get(k)?.name||k).join('、')+'。　':'')+(f.shotIds?.length?'原片镜号　'+f.shotIds.join('、'):'');
      if(row.variant&&f.video==='fred-jev'){const a=node('a','','同步看原片与本段');a.href=$('fredReel').href+'#'+row.variant;$('sourceDetails').append(document.createTextNode('　'),a);}
      $('sourcePlay').hidden=!can;$('sourceFile').hidden=can;$('sourceFile').value='';
      $('sourceNotice').textContent=can?'模板可换用本期内容。下方按钮播放原片的对应片段。':'保留了既有拆解和时码。可选择本地原片对照。';
    }
    function play(url){
      const r=refs[sel.selectedIndex],v=$('originalVideo');sourceEnd=r.end;detailMoving=false;renderDetail();
      v.onloadedmetadata=()=>{v.currentTime=Math.min(r.start,Math.max(0,v.duration-.05));v.play().catch(()=>{});};
      v.onerror=()=>{$('sourceNotice').textContent='当前浏览器无法读取此原片，可重新选择本地文件。';$('sourceFile').hidden=false;};
      v.hidden=false;v.src=url;v.load();
    }
    sel.onchange=selected;$('sourcePlay').onclick=()=>play(PortraitMachine.originals[refs[sel.selectedIndex].video]);
    $('sourceFile').onchange=()=>{const f=$('sourceFile').files[0];if(f){stopSource();sourceURL=URL.createObjectURL(f);play(sourceURL);}};
    $('originalVideo').ontimeupdate=holdAtSourceEnd;selected();
  }
  $('coverage').onclick=()=>{
    const area=$('coverageRows');area.replaceChildren();Object.values(films).forEach(f=>{
      const line=node('div',''),pick=node('button','',f.name);pick.disabled=!f.portraitIds.length;
      pick.onclick=()=>{$('coverageDialog').close();portraitOnly=true;clear();$('film').value=f.id;filter();};
      line.append(pick,node('span','',(f.portraitIds.length?f.portraitIds.length+' 套 · ':'')+f.status));area.append(line);
    });$('coverageDialog').showModal();
  };
  $('closeCoverage').onclick=()=>$('coverageDialog').close();
  $('more').onclick=()=>{const start=gridLimit;gridLimit+=24;appendRows(start);};
  function labelPlayback(){$('playAll').textContent=speedOn?'暂停预览':'播放预览';$('playAll').setAttribute('aria-pressed',String(speedOn));}
  $('playAll').onclick=()=>{speedOn=!speedOn;labelPlayback();};
  $('detailPlay').onclick=()=>{detailMoving=!detailMoving;renderDetail();};
  $('scrub').oninput=evt=>{detailMoving=false;position=Number(evt.target.value);renderDetail();};
  $('closeDetail').onclick=()=>$('detail').close();$('closePicks').onclick=()=>$('selection').close();
  $('detail').addEventListener('close',()=>{
    stopSource();
    edition.release($('big'));bound=null;bindGeneration++;current=null;
    if(location.hash)history.replaceState(null,'',location.href.split('#')[0]);
  });
  $('choose').onclick=()=>choice(current.id);
  $('picks').onclick=()=>{updateSelection();$('selection').showModal();};
  $('copy').onclick=async()=>{
    const value=$('pickText').value;
    try{await navigator.clipboard.writeText(value);$('copied').textContent='已复制';}
    catch{$('pickText').select();$('copied').textContent=document.execCommand('copy')?'已复制':'按 Ctrl+C 复制';}
  };
  function tick(now) {
    holdAtSourceEnd();
    const elapsed=previousTime===null?0:Math.min((now-previousTime)/1000,.15);
    previousTime=now;
    if(current&&detailMoving){position=(position+elapsed)%edition.cycle(current);renderDetail();}
    else if(!current&&speedOn&&!$('selection').open&&!$('coverageDialog').open&&!document.hidden){
      gridTime+=elapsed;
      activeCanvases.forEach(canvas=>{const row=records.get(canvas);edition.draw(canvas,row,gridTime%edition.cycle(row));});
    }
    requestAnimationFrame(tick);
  }
  window.galleryReady=edition.ready.then(()=>{
    $('pickCount').textContent=picks.length;labelPlayback();
    const latest=data.entries.filter(e=>e.batch===data.currentBatch).length;
    $('recent').textContent='最近入库 '+latest+' 项';$('recent').hidden=!latest;
    const params=new URLSearchParams(location.search),view=params.get('view');if(view==='added'){portraitOnly=false;$('pack').value='recent';}if(view==='all')portraitOnly=false;
    if(view==='directory'){
      const s=directory.state(params);directoryRows=directory.find(s);portraitOnly=false;
      $('directoryContext').hidden=false;$('backToDirectory').href=directory.href('动作目录.html',s);
      $('backToDirectory').textContent=directory.title(s)+' · 返回目录';
    }
    filter();fromHash();
    window.addEventListener('hashchange',fromHash);requestAnimationFrame(tick);return true;
  }).catch(error=>{$('count').textContent='预览资源未能载入。'+error.message;throw error;});
})();
