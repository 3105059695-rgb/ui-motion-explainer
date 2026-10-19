'use strict';
// Native deterministic timeline: all state is derived from project.json + t.
// Rendering awaits actual media seek completion; missing videos cannot silently export.
const $ = id => document.getElementById(id);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const ease=x=>1-Math.pow(1-clamp(x),3);
const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,t)=>a+(b-a)*t;
const query=new URLSearchParams(location.search);
const exporting=query.has('export')||query.has('render');
if(exporting)document.body.classList.add('export');
let project, shots=[], media=new Map(), readyPromise, playing=false, raf=0, playEpoch=0, playOffset=0, current=0, busy=false;
let captions=[];
const posterFor=id=>`assets/${id}.png`;
const text={manual:['01 / 人工搬运','工具多了，<br>还得<span>自己搬。</span>','同一份资料，反复转手。','图像工具','视频工具','工具链 · 同一份资料','手动','看资料怎样传过去'],takeover:['02 / Agent 接管','把这条流程，<br>交给<span> Agent。</span>','搬运交给它，目标由我定。','给出任务','连续执行','同一条工具链 · Agent 接管','自动','跟住同一份资料'],handoff:['03 / 把资料给清楚','资料说清楚，<br><span>目标才明确。</span>','交给它之前，先把信息给完整。','资料包','任务说明','资料交接 · 给清楚资料','接收','先接稳，再推进']};
function applyStory(id){const a=text[id]||text.handoff;$('eyebrow').textContent=a[0];$('headline').innerHTML=a[1];$('subline').textContent=a[2];$('step-a').textContent=a[3];$('step-b').textContent=a[4];$('media-title').textContent=a[5];$('media-status').textContent=a[6];$('focus-label').lastElementChild.textContent=a[7];}
function assetPath(value){return typeof value==='string'?value:(value?.src||value?.path||'')}
async function loadMedia(shot){
  const v=document.createElement('video'),poster=shot.poster||posterFor(shot.id);
  v.className='media-shot';v.muted=true;v.playsInline=true;v.preload='auto';v.poster=poster;
  const item={video:v,ok:false,shot};media.set(shot.id,item);$('media-stack').append(v);
  let loadError='';
  // The local render server need not support HTTP Range. A complete Blob gives
  // Chromium a seekable source instead of silently snapping requested seeks to 0.
  try{const response=await fetch(shot.source);if(!response.ok)throw Error(`HTTP ${response.status}`);const blob=await response.blob();if(!blob.size)throw Error('empty media');item.blobURL=URL.createObjectURL(blob)}catch(e){loadError=e.message}
  return new Promise((resolve,reject)=>{
    let done=false;const timeout=setTimeout(()=>finish(false),25000);
    function finish(ok){
      if(done)return;done=true;clearTimeout(timeout);v.onloadeddata=null;v.onerror=null;
      ok=ok&&v.readyState>=2&&v.videoWidth>0&&v.videoHeight>0;item.ok=ok;
      if(ok){v.removeAttribute('poster');v.pause()}
      else{const message=`[MEDIA_DECODE_ERROR] 无法解码视频：${shot.source}; code=${v.error?.code??'timeout'}; detail=${loadError||v.error?.message||'loadeddata/视频尺寸未就绪'}`;console.error(message);if(exporting){reject(new Error(`正式导出已中止，禁止用 poster 替代视频。${message}`));return}v.remove();const im=new Image();im.className='media-shot';im.src=poster;im.alt=`${shot.id} approved still — preview fallback`;item.image=im;$('media-stack').append(im)}
      resolve(item);
    }
    v.onloadeddata=()=>finish(true);v.onerror=()=>finish(false);
    if(loadError)finish(false);else{v.src=item.blobURL;v.load()}
  });
}
async function seek(item,t){if(!item?.ok)return;const v=item.video;const target=clamp(t,0,Math.max(0,(v.duration||8)-.04));if(Math.abs(v.currentTime-target)<.003&&v.readyState>=2)return;await new Promise((resolve,reject)=>{let settled=false;const done=()=>{if(settled)return;settled=true;clearTimeout(timer);v.removeEventListener('seeked',done);if(Math.abs(v.currentTime-target)>.06){const message=`[MEDIA_SEEK_ERROR] 视频未到指定帧：${item.shot.source}; requested=${target}; actual=${v.currentTime}`;console.error(message);reject(new Error(message));return}resolve()};const timer=setTimeout(()=>{if(settled)return;settled=true;v.removeEventListener('seeked',done);reject(new Error(`视频 seek 超时: ${item.shot.source} @ ${target}`))},15000);v.addEventListener('seeked',done,{once:true});v.currentTime=target;});}
window.ready=()=>readyPromise;
readyPromise=(async()=>{const r=await fetch('project.json',{cache:'no-store'});if(!r.ok)throw Error('project.json 未找到');project=await r.json();shots=(project.edit?.shots||[]).filter(s=>s.source);if(!shots.length)throw Error('edit.shots 为空');captions=project.captions||[];$('voice').src=assetPath(project.audio);$('scrub').max=project.duration;await Promise.all([document.fonts.ready,...shots.map(loadMedia)]);const allVideo=[...media.values()].every(m=>m.ok);if(exporting&&!allVideo){const message='[MEDIA_EXPORT_BLOCKED] allVideo=false，正式导出要求每个镜头 loadeddata 成功，禁止 poster 降级。';console.error(message);throw Error(message)}$('result-image').src=shots.find(s=>s.id==='takeover')?.poster||posterFor('takeover');window.__project=project;window.__mediaStatus=()=>Object.fromEntries([...media.entries()].map(([id,m])=>[id,{decoded:m.ok,source:m.shot.source,time:m.video.currentTime,duration:m.video.duration}]));document.body.classList.add('ready');await renderFrame(0,0);return{duration:project.duration,shots:shots.length,font:document.fonts.check('40px SampleSans'),allVideo};})();
readyPromise.catch(e=>{$('loading').textContent=e.message;console.error(e)});
async function renderFrame(t,mediaTime=t){t=clamp(Number(t),0,project.duration);current=t;const ui=Number(project.edit.ui_start);const uiDuration=Math.max(.1,project.duration-ui);const check=Number(project.edit.ui_check_start??(ui+Math.min(1.25,uiDuration*.4)));const morph=ease((t-ui)/.65);let shot=shots.find(s=>mediaTime>=s.start&&mediaTime<s.end)||shots.filter(s=>s.start<=mediaTime).at(-1)||shots[0];const local=clamp((mediaTime-shot.start)/(shot.end-shot.start));const item=media.get(shot.id);let source=mix(Number(shot.in||0),Number(shot.out??(item.video.duration||8)),local);await seek(item,source);for(const [id,m]of media){const el=m.ok?m.video:m.image;el.classList.toggle('active',id===shot.id)}applyStory(shot.id);
  // A brief local focus is editorial camera work laid over true I2V action.
  const focusSpec=shot.focus||{x:.31,y:.32,width:.35,height:.55,start:.1,end:.46,scale:1.12};
  let focus=0;if(shot.id==='manual')focus=smooth((local-focusSpec.start)/.09)*(1-smooth((local-focusSpec.end)/.1));
  $('media-stack').style.transformOrigin=`${focusSpec.x*100}% ${focusSpec.y*100}%`;
  $('media-stack').style.transform=`scale(${1+focus*((focusSpec.scale||1.12)-1)})`;
  const ring=$('focus-ring');ring.style.left=`${(focusSpec.x-focusSpec.width/2)*100}%`;ring.style.top=`${(focusSpec.y-focusSpec.height/2)*100}%`;ring.style.width=`${focusSpec.width*100}%`;ring.style.height=`${focusSpec.height*100}%`;ring.style.opacity=String(focus*.8*(1-morph));$('focus-label').style.opacity=String(.45+focus*.55);
  const mw=$('media-window');mw.style.left=`${mix(630,120,morph)}px`;mw.style.top=`${mix(198,288,morph)}px`;mw.style.width=`${mix(1170,460,morph)}px`;mw.style.height=`${mix(714,605,morph)}px`;
  $('media-viewport').style.bottom=`${morph*134}px`;$('media-footer').style.opacity=String(morph);$('media-footer-status').textContent=t>=ui+.72?'已交付 ✓':'等待接收';
  if(morph>.85){$('media-title').textContent='来源 · 资料包';$('media-status').style.opacity='0'}else{$('media-status').style.opacity='1'}
  // Preserve the handoff scene's whole figure when it becomes a source window.
  for(const m of media.values()){const el=m.ok?m.video:m.image;el.style.objectFit=morph>.7?'contain':'cover';el.style.background='#ede9ed'}
  $('story-copy').style.opacity=String(1-smooth((t-ui)/.25));$('story-copy').style.transform=`translateX(${-35*morph}px)`;
  const h=ease((t-ui-.18)/.4);$('ui-heading').style.opacity=String(h);$('ui-heading').style.transform=`translateY(${20*(1-h)}px)`;
  const aw=ease((t-ui-.18)/.5),rw=ease((t-ui-.36)/.5);$('agent-window').style.opacity=String(aw);$('agent-window').style.transform=`translateX(${70*(1-aw)}px)`;$('result-window').style.opacity=String(rw);$('result-window').style.transform=`translateX(${90*(1-rw)}px)`;$('links').style.opacity=String(ease((t-ui-.55)/.3));
  const transfer=smooth((t-ui-.2)/.8), packageVisible=t>=ui+.2&&t<ui+1.13;
  $('package').style.opacity=packageVisible?String(smooth((t-ui-.2)/.12)*(1-smooth((t-ui-1.02)/.11))):'0';$('package').style.left=`${mix(282,795,transfer)}px`;$('package').style.top=`${mix(500,585,transfer)-Math.sin(transfer*Math.PI)*88}px`;$('package').style.transform=`scale(${mix(.8,.55,transfer)}) rotate(${Math.sin(transfer*Math.PI)*-8}deg)`;
  const received=smooth((t-ui-.7)/.18),goal=smooth((t-ui-1)/.18);$('task-received').style.opacity=String(.35+received*.65);$('task-goal').style.opacity=String(.35+goal*.65);$('progress-fill').style.width=`${clamp((t-ui-.8)/Math.max(.3,check-ui-.4))*100}%`;$('progress-label').textContent=t>=check?'输出图已生成 · 等你核对':'整理资料 → 生成输出图';
  const beat=Math.max(.2,Math.min(.36,(project.duration-check-.65)/3));['a','b','c'].forEach((id,i)=>$('review-'+id).classList.toggle('checked',t>=check+i*beat));const done=t>=check+3*beat;$('review-tag').textContent=done?'已核对':'待核对';$('review-tag').style.background=done?'#cdb7f5':'#ececf0';$('review-tag').style.color=done?'#392755':'#62646a';$('result-done').style.opacity=String(ease((t-check-3*beat)/.2));$('result-done').style.transform=`translateY(${8*(1-ease((t-check-3*beat)/.2))}px)`;if(done)$('progress-label').textContent='输出图已完成 · 核对通过';
  // A short occlusion cut at the two scene boundaries, no long dissolve.
  let wipe=-102;for(const s of shots.slice(1)){const delta=t-s.start;if(delta>=-.1&&delta<.16)wipe=mix(-102,102,clamp((delta+.1)/.26))}$('cut-wipe').style.transform=`translateX(${wipe}%)`;
  const cap=captions.find(c=>t>=Number(c.start??c.start_seconds)&&t<Number(c.end??c.end_seconds));$('caption').firstElementChild.textContent=cap?.text||'';$('caption').style.opacity=cap?'1':'0';$('scrub').value=String(t);$('time').textContent=t.toFixed(1)+' s';
}
window.render=async(t,mediaTime=t)=>{await readyPromise;await renderFrame(t,mediaTime);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));return{t,current,media:window.__mediaStatus()}};
async function tick(){if(!playing||busy)return;busy=true;const a=$('voice');let t=a.src&&!a.paused?a.currentTime:playOffset+(performance.now()-playEpoch)/1000;if(t>=project.duration){t=project.duration;playing=false;a.pause()}try{await renderFrame(t,t)}finally{busy=false}if(playing)raf=requestAnimationFrame(tick)}
$('play').onclick=async()=>{await readyPromise;if(playing){playing=false;$('voice').pause();cancelAnimationFrame(raf);return}if(current>=project.duration-.05)current=0;playing=true;playOffset=current;playEpoch=performance.now();const a=$('voice');a.currentTime=current;if(assetPath(project.audio)){try{await a.play()}catch(e){console.warn(e)}}tick()};
$('scrub').oninput=async e=>{playing=false;$('voice').pause();cancelAnimationFrame(raf);await window.render(Number(e.target.value));$('voice').currentTime=current};
