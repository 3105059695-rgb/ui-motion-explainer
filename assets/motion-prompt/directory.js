(()=>{
  const m=window.MotionDirectory,$=id=>document.getElementById(id);
  const here='动作目录.html',gallery='index.html',pageSize=30;
  function readState(){return m.state(new URLSearchParams(location.hash.startsWith('#home')?'':location.hash.includes('=')?location.hash.slice(1):location.search));}
  let state=readState(),shown=[],limit=pageSize;
  const node=(tag,cls='',txt='')=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt)el.textContent=txt;return el;};
  const link=(txt,url,cls='')=>{const el=node('a',cls,txt);el.href=url;return el;};
  function navigate(next,replace=false,scroll=false){
    const url=new URL(m.href(here,next)),method=replace?'replaceState':'pushState';
    const normalized=m.state(url.searchParams);
    if(JSON.stringify(state)!==JSON.stringify(normalized)){
      try{history[method](null,'',url.href);}
      catch{history[method](null,'',url.searchParams.size?'#'+url.searchParams:'#home');}
    }
    state=normalized;limit=pageSize;render();
    if(scroll)window.scrollTo({top:0,behavior:'instant'});
  }
  function routeLink(txt,next,cls=''){
    const a=link(txt,m.href(here,next),cls);
    a.addEventListener('click',e=>{if(e.button||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
      e.preventDefault();navigate(next,false,true);});return a;
  }
  function labeledLink(label,count,next){
    const a=routeLink('',next);a.append(node('span','',label),node('span','number',String(count)));return a;
  }
  function addOption(select,value,label){select.add(new Option(label,value));}
  const formatCounts=new Map(),filmCounts=new Map();
  for(const r of m.data.entries){
    const k=m.info.get(r.id).form?.key;formatCounts.set(k,(formatCounts.get(k)||0)+1);
    for(const id of new Set((r.references||[]).map(ref=>ref.video)))filmCounts.set(id,(filmCounts.get(id)||0)+1);
  }
  for(const f of m.formats.values())addOption($('format'),f.key,f.name+'（'+(formatCounts.get(f.key)||0)+'）');
  for(const film of Object.values(m.data.referenceFilms||{}))if(filmCounts.has(film.id))addOption($('film'),film.id,film.name+'（'+filmCounts.get(film.id)+'）');
  const variants=m.data.entries.filter(r=>r.variant).length;
  $('summary').textContent=m.dir.sections.length+' 个一级分类 · '+m.folders.size+' 个二级分类 · '+(m.data.entries.length-variants)+' 个原编号 · '+variants+' 个原片变体';
  function buildOverview(){
    for(const s of m.dir.sections){
      const card=node('article','dir-group'),h=node('h3'),ul=node('ul');
      h.append(labeledLink(s.name,s.folders.reduce((n,f)=>n+f.ids.length,0),{section:s.key}));
      for(const f of s.folders){const li=node('li');li.append(labeledLink(f.name,f.ids.length,{folder:f.key}));ul.append(li);}
      card.append(h,ul);$('groups').append(card);
    }
  }
  function shortcuts(active){
    const onlyAll=state.all==='1'&&!Object.entries(state).some(([key,value])=>key!=='all'&&value);
    const links=[['分类总览',{},!active],['全部 '+m.rows.size+' 项',{all:'1'},onlyAll],
      ['定稿竖屏 '+formatCounts.get('portrait'),{format:'portrait'},state.format==='portrait']];
    for(const c of m.collections.values())links.push([c.name+' '+c.ids.length+' 段',{collection:c.key},state.collection===c.key]);
    $('shortcuts').replaceChildren(...links.map(([label,target,on])=>{const a=routeLink(label,target);if(on)a.setAttribute('aria-current','true');return a;}));
  }
  function drill(){
    const within=m.find({...state,section:'',folder:'',related:''}),counts=new Map();
    for(const r of within){const p=m.paths.get(r.id);if(!p)continue;
      for(const k of [p.section.key,p.folder.key])counts.set(k,(counts.get(k)||0)+1);}
    const parent=m.folders.get(state.folder)?.section||m.sections.get(state.section);
    const group=$('section'),folder=$('folder');group.replaceChildren();folder.replaceChildren();
    addOption(group,'','全部一级分类');addOption(folder,'','全部二级分类');
    for(const s of m.dir.sections)if(counts.get(s.key)||parent===s)addOption(group,s.key,s.name+'（'+(counts.get(s.key)||0)+'）');
    if(parent){for(const f of parent.folders)if(counts.get(f.key)||state.folder===f.key)addOption(folder,f.key,f.name+'（'+(counts.get(f.key)||0)+'）');}
    group.value=parent?.key||'';folder.disabled=!parent;folder.value=state.folder||'';
    $('relatedLabel').hidden=!parent;$('related').checked=Boolean(state.related);
    const crumb=[routeLink('全部分类',{})];
    if(state.collection){crumb.push(document.createTextNode(' / '),routeLink(m.collections.get(state.collection).name,{collection:state.collection}));}
    if(parent)crumb.push(document.createTextNode(' / '),routeLink(parent.name,{...state,folder:'',section:parent.key}));
    if(state.folder)crumb.push(document.createTextNode(' / '+m.folders.get(state.folder).folder.name));
    $('crumb').replaceChildren(...crumb);
  }
  function preview(id){return m.href(gallery,state,id,true);}
  function item(r){
    const o=m.info.get(r.id),p=o.path,li=node('li','dir-item'),body=node('div'),meta=node('div','item-meta');
    li.dataset.id=r.id;
    if((state.folder&&p.folder.key!==state.folder)||(state.section&&p.section.key!==state.section))meta.append(node('span','cross','跨类参考'));
    meta.append(node('span','',o.form.name),routeLink(p.section.name+' › '+p.folder.name,{folder:p.folder.key}));
    body.append(link(r.name,preview(r.id),'item-name'),meta,node('p','',r.meaning));
    const refs=r.references||[];
    if(refs.length){
      const ref=refs.find(f=>f.video===state.film)||refs.find(f=>f.video===m.collections.get(state.collection)?.film)||refs[0];
      const line=node('div','item-links');
      line.append(node('span','',m.filmName(ref.video)+'　'+m.fmt(ref.start)+'–'+m.fmt(ref.end)));
      const c=r.variant&&m.dir.collections.find(c=>c.review&&c.ids.includes(r.id));
      if(c)line.append(link('同步看原片',c.review+'#'+r.variant));
      if(refs.length>1)line.append(link('全部 '+refs.length+' 段来源',preview(r.id)));body.append(line);
    }
    if(r.baseIds?.length){const line=node('div','item-links','沿用');for(const id of r.baseIds)line.append(link('#'+id,preview(id)));body.append(line);}
    li.append(link('#'+r.id,preview(r.id),'item-id'),body);return li;
  }
  function addItems(from){
    const fragment=document.createDocumentFragment();
    shown.slice(from,limit).forEach(r=>fragment.append(item(r)));$('items').append(fragment);
    const n=Math.min(pageSize,Math.max(0,shown.length-limit));
    $('next').hidden=!n;if(n)$('next').textContent='再看 '+n+' 项';
  }
  function render(){
    const active=Object.values(state).some(Boolean);
    if($('q').value.trim()!==state.q)$('q').value=state.q;
    $('format').value=state.format;$('film').value=state.film;shortcuts(active);
    $('overview').hidden=active;$('results').hidden=!active;
    if(!active){$('items').replaceChildren();return;}
    shown=m.find(state);drill();$('resultTitle').textContent=m.title(state);
    $('total').textContent=shown.length+' 项';$('empty').hidden=Boolean(shown.length);
    $('preview').href=preview('');$('preview').hidden=!shown.length;
    const c=m.collections.get(state.collection);$('review').hidden=!c?.review;if(c?.review)$('review').href=c.review;
    $('items').replaceChildren();addItems(0);
  }
  $('q').oninput=()=>navigate({...state,q:$('q').value.trim()},true);
  $('format').onchange=()=>navigate({...state,format:$('format').value});
  $('film').onchange=()=>navigate({...state,film:$('film').value,collection:''});
  $('section').onchange=()=>navigate({...state,section:$('section').value,folder:'',related:'',all:'1'});
  $('folder').onchange=()=>navigate({...state,folder:$('folder').value,section:$('section').value,related:''});
  $('related').onchange=()=>navigate({...state,related:$('related').checked?'1':''});
  $('next').onclick=()=>{const old=limit;limit+=pageSize;addItems(old);};
  window.addEventListener('popstate',()=>{state=readState();limit=pageSize;render();});
  buildOverview();render();
})();
