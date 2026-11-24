/* Shared by the offline directory and the original preview gallery. */
window.MotionDirectory=(()=>{
  const data=window.MOTION_CATALOG,dir=data.directory||{sections:[],formats:[],collections:[]};
  const sections=new Map(),folders=new Map(),paths=new Map(),related=new Map();
  const rows=new Map(data.entries.map(r=>[r.id,r]));
  const collections=new Map(dir.collections.map(c=>[c.key,c]));
  const formats=new Map(dir.formats.map(f=>[f.key,f]));
  const filmName=id=>data.referenceFilms?.[id]?.name||id;
  const fmt=t=>{const n=Math.round(t*100);return String(Math.floor(n/6000)).padStart(2,'0')+':'+String(Math.floor(n/100)%60).padStart(2,'0')+'.'+String(n%100).padStart(2,'0');};
  for(const s of dir.sections){sections.set(s.key,s);for(const f of s.folders){
    const path={section:s,folder:f};folders.set(f.key,path);
    for(const id of f.ids)paths.set(id,path);
    for(const id of f.related){if(!related.has(id))related.set(id,[]);related.get(id).push(path);}
  }}
  const text=v=>String(v??'').trim().toLowerCase();
  function readId(v){const m=text(v).match(/^#?(m?)(\d{1,6})(@[a-z][a-z\d_-]*)?$/i);
    return m?m[1].toUpperCase()+m[2].padStart(3,'0')+(m[3]||'').toUpperCase():null;}
  const info=new Map();
  for(const r of data.entries){
    const path=paths.get(r.id),secondary=related.get(r.id)||[];
    const form=dir.formats.find(v=>Object.entries(v.match).every(([k,values])=>values.includes(r[k]??null)));
    const words=p=>p?[p.section.name,p.folder.name,p.folder.key,...p.folder.terms].join(' '):'';
    const own=text(words(path)),also=text(secondary.map(words).join(' '));
    const direct=text([r.id,r.name,r.en,r.meaning,r.category,r.pack,r.variant,r.missing,
      ...(r.baseIds||[]),...(r.uses||[]),...(r.references||[]).flatMap(f=>[f.video,filmName(f.video),...(f.shotIds||[]),fmt(f.start),fmt(f.end)])].join(' '));
    info.set(r.id,{path,form,own,also,direct});
  }
  const paramKeys=['section','folder','format','film','collection','q','related','all'];
  function state(params){
    const get=k=>params.get(k)||'';
    const folder=folders.has(get('folder'))?get('folder'):'';
    return {section:folder?'':(sections.has(get('section'))?get('section'):''),folder,
      format:formats.has(get('format'))?get('format'):'',film:data.referenceFilms?.[get('film')]?get('film'):'',
      collection:collections.has(get('collection'))?get('collection'):'',q:get('q').trim(),
      related:get('related')==='1'?'1':'',all:get('all')==='1'?'1':''};
  }
  function href(file,opts={},id='',preview=false){
    const url=new URL(file,document.baseURI);
    for(const k of paramKeys)if(opts[k])url.searchParams.set(k,opts[k]);
    if(preview)url.searchParams.set('view','directory');
    url.hash=id;return url.href;
  }
  function title(s){
    return folders.get(s.folder)?.folder.name||sections.get(s.section)?.name||collections.get(s.collection)?.name
      ||(s.q?'搜索结果':(s.film?filmName(s.film):formats.get(s.format)?.name||'全部条目'));
  }
  function queryScore(r,tokens){
    const o=info.get(r.id);let score=0;
    for(const t of tokens){
      const id=readId(t);
      if(id){if(r.id===id)score+=20;else if(r.baseIds?.includes(id))score+=3;else return -1;}
      else if(text(r.name).includes(t))score+=12;
      else if(text(r.variant)===t)score+=10;
      else if(o.direct.includes(t))score+=7;
      else if(o.own.includes(t))score+=5;
      else if(o.also.includes(t))score+=1;
      else return -1;
    }
    return score;
  }
  function find(s){
    const tokens=text(s.q).split(/\s+/).filter(Boolean);
    const c=collections.get(s.collection),collectionSet=c&&new Set(c.ids);
    const selected=s.folder?[folders.get(s.folder)?.folder]:sections.get(s.section)?.folders;
    const primary=selected&&new Set(selected.flatMap(f=>f?.ids||[]));
    const secondary=selected&&s.related==='1'?new Set(selected.flatMap(f=>f?.related||[])):null;
    const matches=[];
    for(const r of data.entries){const o=info.get(r.id);
      if(primary&&!primary.has(r.id)&&!secondary?.has(r.id))continue;
      if(s.format&&o.form?.key!==s.format||collectionSet&&!collectionSet.has(r.id))continue;
      if(s.film&&!r.references?.some(f=>f.video===s.film))continue;
      const score=queryScore(r,tokens);if(score<0)continue;
      matches.push({r,score,secondary:Boolean(primary&&!primary.has(r.id))});}
    const film=s.film||c?.film;
    const time=r=>Math.min(...(r.references||[]).filter(f=>f.video===film).map(f=>f.start));
    matches.sort((a,b)=>Number(a.secondary)-Number(b.secondary)||b.score-a.score||
      (film?time(a.r)-time(b.r):0)||Number(b.r.adaptation==='portrait')-Number(a.r.adaptation==='portrait')||
      Number(!!b.r.variant)-Number(!!a.r.variant));
    return matches.map(m=>m.r);
  }
  return {data,dir,sections,folders,paths,rows,collections,formats,info,filmName,fmt,readId,state,href,title,find};
})();
