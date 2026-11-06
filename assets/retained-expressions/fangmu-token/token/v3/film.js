import './context-3d.js';
/* One source clock. Full-canvas scenes follow the approved body sample. */
(()=>{
const cv=document.getElementById('frame'),c=cv.getContext('2d'),h=window.FilmHelpers;
const source=document.getElementById('source'),opening=document.getElementById('opening');
const material=document.getElementById('material');
let config,task,exportMode=false;
const circle={x:64,y:636,w:320,h:320,r:160,sx:620,sy:0,sw:740,sh:740};
const fullscreen={x:0,y:0,w:1920,h:1080,r:0,sx:0,sy:0,sw:1920,sh:1080};
const moments=[{start:42.72,hold:43.36,release:46.80,end:47.44,id:'warning'},
 {start:232.96,hold:233.60,release:236.80,end:237.44,id:'memory'},
 {start:330.72,hold:331.48,release:337,end:338,id:'ending'}];
function state(t){
 if(t<12.52)return{kind:'opening',mix:1};
 if(t<13.40)return{kind:'transition',mix:1-h.p(t,12.52,13.40),id:'intro'};
 for(const q of moments){if(t<q.start||t>=q.end)continue;
  if(t<q.hold)return{kind:'transition',mix:h.p(t,q.start,q.hold),id:q.id};
  if(t<q.release)return{kind:'full',mix:1,id:q.id};
  return{kind:'transition',mix:1-h.p(t,q.release,q.end),id:q.id};
 }
 return{kind:'circle',mix:0};
}
function geometry(mix){const v={};for(const k in circle)v[k]=h.lerp(circle[k],fullscreen[k],mix);return v}
function presenter(t){const st=state(t),v=geometry(st.mix);c.save();
 c.beginPath();c.roundRect(v.x,v.y,v.w,v.h,v.r);c.clip();
 c.drawImage(source,v.sx,v.sy,v.sw,v.sh,v.x,v.y,v.w,v.h);c.restore();
 if(st.mix<.999){c.save();c.globalAlpha=1-st.mix;c.beginPath();c.roundRect(v.x,v.y,v.w,v.h,v.r);c.lineWidth=7;c.strokeStyle='#FFFFFF';c.stroke();c.restore();}
}
function fullTitles(id,a=1){c.save();c.globalAlpha=a;
 const tx=(s,x,y,z,o={})=>h.txt(c,s,x,y,z,{...o,color:'#FAFAF8',weight:800});
 if(id==='warning'){tx('1 Token',110,350,82,{font:'EN'});tx('≠ 一个汉字',106,474,57);tx('≠ 一个单词',1400,443,57);}
 if(id==='memory'){tx('上下文',110,350,108);tx('≠',255,511,133);tx('永久记忆',1374,443,81);}
 if(id==='ending'){tx('基础概念',115,352,85);tx('一个一个',1390,367,76);tx('弄明白',1436,493,90);}
 c.restore();
}
function moduleAt(t){return t<97.56?window.ConceptV3:t<177.60?window.BillingV3:((t>=248.32&&t<264.72)||(t>=280.84&&t<315.32)?window.ContextUIV3:window.PhysicalContextV3)}
function board(t){
 if(t>=25.64&&t<42.64){window.ApprovedSample.draw(t);return;}
 const scene=config.scenes.find(s=>t>=s.start&&t<s.end)||config.scenes.at(-1),mod=moduleAt(t);
 if(!mod)throw Error('Missing v2 chapter for '+scene.id);
 c.save();mod.draw(c,t,scene,h);c.restore();
 // A small signature and the presenter's rim are the only persistent furniture.
 const px=c.getImageData(1810,66,1,1).data,lum=(px[0]+px[1]+px[2])/3;
 h.txt(c,'方木',1810,66,27,{align:'right',weight:750,color:lum>145?'#25232A':'#FFFFFF'});
 c.save();c.lineWidth=7;c.strokeStyle='#FFFFFF';c.beginPath();c.arc(224,796,161,0,7);c.stroke();c.restore();
}
function caption(t){window.UICaptions.draw(c,t,{dark:false});}
async function seek(v,t){const a=Math.max(.0001,Math.min(t+.002,(v.duration||336.52)-.038));
 if(Math.abs(v.currentTime-a)<.00005&&v.readyState>=2)return;
 await new Promise((res,rej)=>{const timer=setTimeout(()=>rej(Error('Video seek timeout at '+a)),20000);v.addEventListener('seeked',()=>{clearTimeout(timer);res()},{once:true});v.currentTime=a;});
}
window.ready=()=>task??=(async()=>{config=await(await fetch('project-v2.json')).json();await Promise.all([document.fonts.load('850 90px CN'),document.fonts.load('450 32px CN'),document.fonts.load('700 215px EN')]);await document.fonts.ready;window.UICaptions.prepare(config);await window.PhysicalContextV3.ready();})();
window.setExportMode=x=>{exportMode=x};window.presenterState=state;
window.getState=()=>({version:3,sourceTime:source.currentTime,exportMode,fontStatus:document.fonts.status});
window.motionActive=t=>state(t).kind==='transition'||(t>=25.64&&t<42.64?window.ApprovedSample.motionActive(t):(moduleAt(t)?.motionActive?.(t)??true));
window.render=async(t,mt=t)=>{await window.ready();const st=state(t),ms=state(mt);
 if(st.kind==='opening'){await seek(opening,mt);c.drawImage(opening,0,0,1920,1080);return;}
 if(t>=196.56&&t<214.20){await seek(material,mt-196.56);c.drawImage(material,0,0,1920,1080);return;}
 if(!exportMode||ms.kind==='transition'||ms.kind==='full')await seek(source,mt);
 if(st.kind!=='full')board(t);
 if(!exportMode||ms.kind==='transition'||ms.kind==='full'){presenter(t);if(st.id!=='intro')fullTitles(st.id,st.mix>.78?h.p(st.mix,.78,1):0);}
 caption(mt);
};
if(location.search.includes('render'))document.documentElement.classList.add('render');
else{
 const audio=new Audio('assets/presenter-full.mp4'),button=document.getElementById('play'),scrub=document.getElementById('scrub');let playing=false,busy=false;
 const stamp=t=>Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');
 async function loop(){if(playing&&!busy){busy=true;if(audio.currentTime>=336.52){audio.pause();playing=false;button.textContent='重播'}const t=Math.min(audio.currentTime,336.48);await window.render(t);scrub.value=t;document.getElementById('clock').textContent=stamp(t)+' / 5:36';busy=false}requestAnimationFrame(loop)}
 button.onclick=async()=>{await window.ready();playing=!playing;if(playing){if(audio.currentTime>=336.48)audio.currentTime=0;await audio.play();button.textContent='暂停'}else{audio.pause();button.textContent='播放原声'}};
 scrub.oninput=async()=>{playing=false;audio.pause();audio.currentTime=+scrub.value;await window.render(+scrub.value);document.getElementById('clock').textContent=stamp(+scrub.value)+' / 5:36';button.textContent='播放原声'};
 window.render(0);requestAnimationFrame(loop);
}
})();
