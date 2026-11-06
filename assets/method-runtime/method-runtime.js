(function(root){'use strict';
function create(spec,stage=document){
 const program=spec.program,phases=spec.phases;
 if(!program||!Array.isArray(phases)||!phases.length||!(spec.duration>0))throw Error('A program, duration and bound phases are required');
 const seen=new Set();
 const controllers=phases.map(p=>{if(!p.id||seen.has(p.id)||!(p.start>=0&&p.end>p.start&&p.end<=spec.duration))throw Error('Invalid phase '+p.id);seen.add(p.id);return {phase:p,controller:SemanticMotion.create({effect:p.effect,duration:p.end-p.start,options:p.options},stage)};});
 return {program,duration:spec.duration,controllers,reset(){controllers.forEach(x=>x.controller.reset());},
 async seek(seconds){
  const t=Math.min(spec.duration,Math.max(0,seconds));if(!Number.isFinite(t))throw Error('Finite seek time required');
  controllers.forEach(x=>x.controller.reset());const states=[];const targets=new Map();
  for(const x of controllers){const p=x.phase;if(t<p.start)continue;const local=Math.min(p.end-p.start,t-p.start);const state=x.controller.seek(local);states.push({phase:p.id,effect:p.effect,local,state});
   if(p.effect==='R06')for(const m of state.media||[]){if(!m.active)continue;const c=x.controller.options.clips.find(c=>c.id===m.id),v=c.node.tagName==='VIDEO'?c.node:c.node.querySelector('video');if(v)targets.set(v,m.sourceTime);}
  }
  for(const track of spec.mediaTracks||[]){if(t<(track.offset||0)||t>(track.end??spec.duration))continue;const v=stage.querySelector(track.selector);if(!v||v.tagName!=='VIDEO')throw Error('Missing current video '+track.selector);targets.set(v,(track.sourceIn||0)+t-(track.offset||0));}
  await Promise.all([...targets].map(([video,time])=>seekVideo(video,time)));return {program,time:t,phases:states};
 }};
}
async function seekVideo(v,t){
 v.pause();v.playbackRate=1;
 if(v.readyState<1)await new Promise((ok,bad)=>{const timer=setTimeout(()=>{clean();bad(Error('Current clip metadata timed out'))},10000);const clean=()=>{clearTimeout(timer);v.removeEventListener('loadedmetadata',done);v.removeEventListener('error',fail)};const done=()=>{clean();ok()};const fail=()=>{clean();bad(Error('Current clip cannot decode'))};v.addEventListener('loadedmetadata',done);v.addEventListener('error',fail);});
 if(!Number.isFinite(t)||t<0||t>v.duration+.03)throw Error('Current clip is shorter than the required source clock: '+t+' / '+v.duration);
 t=Math.min(v.duration-.001,t);if(v.readyState>=2&&!v.seeking&&Math.abs(v.currentTime-t)<.001)return;
 await new Promise((ok,bad)=>{const timer=setTimeout(()=>{clean();bad(Error('Video seek timed out'))},10000);const clean=()=>{clearTimeout(timer);v.removeEventListener('seeked',done);v.removeEventListener('error',fail)};const done=()=>{clean();Math.abs(v.currentTime-t)<=.05?ok():bad(Error('Video source clock mismatch'))};const fail=()=>{clean();bad(Error('Current clip decode failed'))};v.addEventListener('seeked',done);v.addEventListener('error',fail);v.currentTime=t;});
}
root.MethodRuntime={create};
})(globalThis);
