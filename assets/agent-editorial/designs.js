/* Live original-source gallery. Original media is resolved only by the local server. */
(async()=>{'use strict';
 const $=id=>document.getElementById(id),canvas=$('stage'),ctx=canvas.getContext('2d'),D=AgentEditorial.create(ctx),images=new Map();
 let manifest,refs={references:[],design_media:{}},scene,current,time=0,playing=false,previous=0,request=0,generation=0;
 const sourceOnlyRanges={'parallel-workflow':[26.66,44.52],'clarify-and-gate':[128.24,138.44],'cross-device-continuity':[162.72,177.94],'remote-execution-chain':[184.78,205.58],'editable-change-undo':[247.96,266.34]};
 const sourceOnly=document.createElement('button');sourceOnly.textContent='播放本章无需原图的连续解释段';sourceOnly.hidden=true;$('state').after(sourceOnly);
 const state=text=>{$('state').textContent=text;};
 function stop(){playing=false;cancelAnimationFrame(request);$('play').textContent='播放完整设计';}
 function draw(t){time=Math.min(Math.max(0,t),current.source_range[1]-current.source_range[0]);ctx.clearRect(0,0,1400,724);ctx.fillStyle=D.C.white;ctx.fillRect(0,0,1400,724);
   const result=scene({ctx,D,localTime:time,mediaTime:time,layout:{contentRect:{x:0,y:0,w:1400,h:724}},asset:id=>images.get(id)});
   $('seek').value=time;$('clock').textContent=`${time.toFixed(2)} s / ${$('seek').max} s · 原片 ${result.sourceTime.toFixed(2)} s`;return result;
 }
 async function select(id,viewRange=null){stop();sourceOnly.hidden=true;const token=++generation;current=SourceDesigns.inspect(id);$('play').disabled=true;
   if(viewRange){current.full_source_range=current.source_range;current.source_range=viewRange;}
   $('source').href=current.source_file;const binding={design:id,sourceRange:current.source_range,duration:current.source_range[1]-current.source_range[0],demo:true,copy:{},media:{},logos:{}};
   $('seek').max=binding.duration.toFixed(2);$('info').textContent=JSON.stringify({id,label:current.label,source:current.source_file,source_range:current.source_range,cues:current.cues,constraints:current.constraints},null,2);
   $('cue-list').replaceChildren();for(const cue of current.cues){const t=cue.source_time-current.source_range[0];if(t<0||t>binding.duration)continue;const b=document.createElement('button');b.textContent=cue.description||cue.id;b.onclick=()=>{stop();try{draw(t);}catch(e){state(e.message);}};$('cue-list').append(b);}
   const missing=[];
   for(const [kind,slots] of [['media',current.media_slots],['logos',current.logo_slots]])for(const slot of slots){
     if(slot.intervals&&!slot.intervals.some(([a,b])=>b>current.source_range[0]&&a<current.source_range[1]))continue;
     const key=kind==='logos'?'@logo/'+slot.key:slot.key,url=refs.design_media[key];
     if(!url){missing.push(key);continue;}
     if(!images.has(key)){const im=new Image();im.src=url;await im.decode();if(token!==generation)return;images.set(key,im);}
     binding[kind][slot.key]={asset:key,...(slot.source_region?{crop:slot.source_region}: {})};
   }
   if(missing.length){ctx.clearRect(0,0,1400,724);scene=null;state('本机缺少原案例素材，未用占位图伪装完整原设计：'+missing.join('、')+'。仍可读源码，或选择已具备材料的设计；新制作绑定本期材料。');
     if(sourceOnlyRanges[id]){sourceOnly.hidden=false;sourceOnly.onclick=()=>select(id,sourceOnlyRanges[id]).catch(e=>state(e.message));}return;}
   scene=SourceDesigns.createScene(binding);scene.validate();draw(0);$('play').disabled=false;state(viewRange?'当前只播放标明的连续解释段，未冒充完整章节；原动作与原示例文字。':'可从头连续播放或拖动。完整动作按原时长运行，当前显示原案例内容。');
 }
 $('play').onclick=()=>{if(playing){stop();return;}if(time>=Number($('seek').max))draw(0);playing=true;previous=performance.now();$('play').textContent='暂停';
   const tick=now=>{if(!playing)return;try{draw(time+(now-previous)/1000);previous=now;if(time>=Number($('seek').max)){stop();return;}request=requestAnimationFrame(tick);}catch(e){stop();state(e.message);}};request=requestAnimationFrame(tick);
 };
 $('seek').oninput=()=>{stop();if(scene)try{draw(Number($('seek').value));}catch(e){state(e.message);}};
 $('design').onchange=()=>select($('design').value).catch(e=>state(e.message));
 try{
   if(location.protocol==='file:')throw Error('请在 Skill 目录运行 python -B -X utf8 scripts/serve.py，再打开 http://127.0.0.1:8770/assets/agent-editorial/designs.html');
   manifest=await(await fetch('source-designs.json',{cache:'no-store'})).json();SourceDesigns.configure(manifest);
   try{const r=await fetch('/__references');if(r.ok)refs=await r.json();}catch(e){/* static hosts keep source code available, without private media */}
   await document.fonts.load('800 43px Noto');await document.fonts.ready;
   for(const d of SourceDesigns.catalog()){$('design').add(new Option(d.label,d.id));}
   const videos=refs.references||[],primary='source-video:fangmu-ten-agents-final-20261021';videos.sort((a,b)=>(b.id===primary)-(a.id===primary));
   for(const r of videos)$('reference').add(new Option((r.exists?'':'[未找到] ')+r.title,r.id));
   $('load-video').onclick=()=>{stop();const r=videos.find(x=>x.id===$('reference').value);if(!r?.url)return;
     const video=$('reference-video');video.src=r.url;video.load();$('video-note').textContent=r.id===primary?'完整原片可观看。认可范围：正文；开头除外。历史色号仅作当时实现记录，当前强调色按 A 色。':r.scope;};
   $('video-note').textContent=videos.length?'请选择原片，点击后加载。也可进入整个效果库查看其他完整参考。':'当前安装未映射本机原视频；未将短摘录冒充完整原片。';
   $('load-video').disabled=!videos.some(v=>v.exists);
   window.DesignGallery={select,draw,get current(){return current;},get scene(){return scene;},get images(){return images;}};
   await select(SourceDesigns.catalog()[0].id);
 }catch(e){state(e.message);$('state').classList.add('error');}
})();
