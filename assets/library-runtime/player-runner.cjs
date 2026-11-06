/* Adapter only: executes original Remotion components through @remotion/player. */
const fs=require('node:fs'),path=require('node:path'),{createRequire}=require('node:module');
async function main(){
 const cfg=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
 const req=createRequire(path.join(cfg.node_modules,'__ui_player.cjs'));
 const esbuild=req('esbuild'),project=path.resolve(cfg.project),entry=path.resolve(project,cfg.entry);
 const real=req.resolve('remotion'),player=req.resolve('@remotion/player'),react=req.resolve('react'),dom=req.resolve('react-dom/client');
 const shim=`
 export * from ${JSON.stringify(real)};
 import {delayRender as sourceDelay,continueRender as sourceContinue,cancelRender as sourceCancel} from ${JSON.stringify(real)};
 const pending=new Set();
 export function delayRender(...args){const id=sourceDelay(...args);pending.add(id);return id;}
 export function continueRender(id){pending.delete(id);return sourceContinue(id);}
 export function cancelRender(error){window.__renderError=String(error);return sourceCancel(error);}
 async function settle(){
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  const start=performance.now();
  while(pending.size||Array.from(document.querySelectorAll('video')).some(v=>v.seeking||v.readyState<2)||Array.from(document.images).some(i=>!i.complete)){
   if(window.__renderError)throw Error(window.__renderError);
   if(performance.now()-start>15000)throw Error('Original scene media/font readiness timed out; pending source handles: '+pending.size);
   await new Promise(r=>requestAnimationFrame(r));
  }
  await document.fonts.ready;
  await Promise.all(Array.from(document.images).map(i=>i.decode().catch(()=>{})));
  await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
 }

 import React,{useLayoutEffect,useRef} from ${JSON.stringify(react)};
 import {createRoot} from ${JSON.stringify(dom)};
 import {Player} from ${JSON.stringify(player)};
 let active,readyResolve;window.ready=new Promise(r=>readyResolve=r);window.__compositionList=[];
 const cfg=window.__uiRunnerConfig;
 function Selected({component,durationInFrames,fps,width,height,defaultProps={},calculateMetadata}){
  const ref=useRef(null),inputProps={...defaultProps,...cfg.props};
  useLayoutEffect(()=>{active=ref.current;window.__composition={durationInFrames,fps,width,height};readyResolve();},[]);
  return React.createElement(Player,{ref,component,inputProps,durationInFrames,fps,compositionWidth:width,compositionHeight:height,controls:false,autoPlay:false,loop:false,clickToPlay:false,style:{width:'100vw',height:'100vh'},errorFallback:({error})=>{window.__renderError=String(error);return null;}});
 }
 export function Composition(p){window.__compositionList.push({id:p.id,durationInFrames:p.durationInFrames,fps:p.fps,width:p.width,height:p.height});return p.id===cfg.composition?React.createElement(Selected,p):null;}
 export function registerRoot(Root){createRoot(document.getElementById('root')).render(React.createElement(Root));}
 window.seek=async t=>{await window.ready;if(window.__renderError)throw Error(window.__renderError);active.seekTo(Math.max(0,Math.min(window.__composition.durationInFrames-1,Math.round(t*window.__composition.fps))));await settle();if(window.__renderError)throw Error(window.__renderError);return {frame:active.getCurrentFrame(),composition:cfg.composition};};
 window.getState=()=>({frame:active?.getCurrentFrame(),composition:cfg.composition});
 `;
 await esbuild.build({entryPoints:[entry],outfile:path.join(project,'player-bundle.js'),bundle:true,loader:{'.ttf':'file','.woff':'file','.woff2':'file'},platform:'browser',format:'iife',jsx:'automatic',nodePaths:[cfg.node_modules,...(cfg.additional_node_modules||[])],define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent',plugins:[{name:'original-registration-bridge',setup(build){build.onResolve({filter:/^remotion$/},args=>({path:'remotion-bridge',namespace:'ui-bridge'}));build.onLoad({filter:/.*/,namespace:'ui-bridge'},()=>({contents:shim,loader:'jsx',resolveDir:project}));}}]});
 fs.writeFileSync(path.join(project,'player.html'),'<!doctype html><meta charset="utf-8"><style>html,body,#root{width:100%;height:100%;padding:0;margin:0;overflow:hidden;background:#FFFFFF}</style>'+(fs.existsSync(path.join(project,'player-bundle.css'))?'<link rel="stylesheet" href="player-bundle.css">':'')+'<div id="root"></div><script>window.remotion_staticBase="./public";window.remotion_isPlayer=true;window.__uiRunnerConfig='+JSON.stringify({composition:cfg.composition,props:cfg.props||{}})+';</script><script src="./player-bundle.js"></script>');
 console.log(JSON.stringify({entry:'player.html',sourceEntry:cfg.entry,composition:cfg.composition,status:'compiled',adapterOnly:true}));
}
main().catch(e=>{console.error(e.stack||String(e));process.exit(1)});
