import * as THREE from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {createDeskProps} from './desk-props.js';

const H=window.FilmHelpers, C=document.getElementById('frame'),ctx=C.getContext('2d');
const video=document.getElementById('source'),START=196.56,END=214.2;
let exportMode=false,playing=false,lastTime=START,configuration;
const viewport={x:0,y:0,w:1920,h:1080};
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
renderer.setSize(viewport.w,viewport.h);renderer.setPixelRatio(1);
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,viewport.w/viewport.h,.03,30);
camera.setViewOffset(1920,1080,-205,-105,1920,1080);
const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment();
scene.environment=pmrem.fromScene(room,.05).texture;scene.environmentIntensity=.36;room.dispose();pmrem.dispose();
scene.add(new THREE.HemisphereLight(0xffffff,0x8f826f,.95));
const key=new THREE.DirectionalLight(0xfff4e5,2.6);key.position.set(-1.8,4.5,2);key.castShadow=true;
key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-1.65;key.shadow.camera.right=1.65;key.shadow.camera.top=1.65;key.shadow.camera.bottom=-1.65;key.shadow.camera.near=.2;key.shadow.camera.far=8;key.shadow.bias=-.00012;key.shadow.normalBias=.002;key.shadow.radius=3;scene.add(key);
const fill=new THREE.DirectionalLight(0xe8e9ff,.7);fill.position.set(2,2,-2);scene.add(fill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.ShadowMaterial({opacity:.10}));ground.rotation.x=-Math.PI/2;ground.position.y=-.02;ground.receiveShadow=true;scene.add(ground);
const desk=createDeskProps();scene.add(desk.group);
const initial=desk.stacks.map(s=>s.position.clone());
const rotations=desk.stacks.map(s=>s.rotation.y);
const padInitial=desk.outputPad.position.clone();
const penRest=desk.props.pen.position.clone(),penRestRotation=desk.props.pen.rotation.clone();
const inkTexture=desk.props.blankSheet.material.map;
const inkBase=document.createElement('canvas');inkBase.width=1024;inkBase.height=1448;inkBase.getContext('2d').drawImage(inkTexture.image,0,0);
let inkStamp='';
desk.stacks.forEach(s=>s.scale.setScalar(1.18));desk.outputPad.scale.setScalar(1.18);
const backFiles=desk.stacks.map((s,i)=>{const n=s.clone(true);n.scale.setScalar(1.1);n.position.set(initial[i].x,.783,-.24);n.rotation.y=rotations[i]+.035;scene.add(n);return n});
// One more physical folder demonstrates that source information can intrude on
// the remaining writing space. Shared geometry/materials avoid duplicated assets.
const extra=desk.stacks[0].clone(true);extra.scale.setScalar(.84);scene.add(extra);
const markerMat=new THREE.MeshStandardMaterial({color:0xb997dd,roughness:.8,transparent:true,opacity:0});
const marker=new THREE.Mesh(new THREE.BoxGeometry(.008,.0015,.54),markerMat);marker.position.set(.27,.783,0);marker.receiveShadow=true;scene.add(marker);

function position(t){
 const focus=H.p(t,198.65,201.0),leave=H.p(t,203.95,206.4),finish=H.p(t,211.6,213.5);
 // A connected physical move: reveal table depth, tilt overhead as it fills,
 // then gently track right to the writing area.
 camera.position.set(H.lerp(1.0,.46,focus)+leave*.08-finish*.10,H.lerp(1.88,2.30,focus)-leave*.17,H.lerp(2.3,1.7,focus)+leave*.13+finish*.06);
 camera.lookAt(.025+leave*.08,.70+focus*.12,.03);camera.updateMatrixWorld();
 desk.stacks.forEach((s,i)=>{
   const arrive=H.o(t,197.05+i*.34,198.2+i*.34);
   const pos=initial[i];s.position.copy(pos);
   s.position.x=H.lerp(pos.x,[-.59,-.24,-.57][i],leave)-(1-arrive)*.18;
   s.position.y=pos.y+(1-arrive)*.11+leave*([0,0,.034][i]);
   s.position.z=H.lerp(pos.z,[.18,.18,-.20][i],leave);
   s.rotation.y=rotations[i]+(1-arrive)*.12+leave*([-.04,.06,-.06][i]);
 });
 backFiles.forEach((s,i)=>{s.position.x=H.lerp(initial[i].x,[-.60,-.23,-.22][i],leave);s.position.z=H.lerp(-.24,[-.2,-.2,-.2][i],leave);s.position.y=.783+leave*([0,0,.033][i]);s.rotation.y=rotations[i]+leave*.075;});
 const reveal=H.p(t,204.65,206.25);
 desk.outputPad.position.copy(padInitial);
 desk.outputPad.position.x=H.lerp(.70,.55,reveal);
 desk.outputPad.position.z=H.lerp(.52,.0,reveal);
 desk.outputPad.position.y=padInitial.y+Math.sin(reveal*Math.PI)*.075;
 desk.outputPad.visible=reveal>.003;
 const request=H.p(t,208.05,208.92),retreat=H.p(t,209.1,210.25);
 extra.visible=t>208.05&&t<210.4;
 extra.position.set(H.lerp(1.28,.82,request)+retreat*.43,.81+Math.sin(request*Math.PI)*.055, .23);
 extra.rotation.y=-.19+request*.12-retreat*.09;
 markerMat.opacity=.48*H.p(t,205.8,206.4)*(1-H.p(t,211.6,212.5));
 // The pen leaves its resting place, contacts the sheet, writes, and lifts.
 // Source narration remains untouched; marks are a literal explanatory draft.
 const pick=H.p(t,205.76,206.12),first=H.p(t,206.12,206.70),second=H.p(t,210.03,211.35),lift=H.p(t,211.35,211.72);
 const back=H.p(t,209.60,210.03),up=H.p(t,206.70,206.93)*(1-H.p(t,209.82,210.03));
 const inkX=second>0?-.100+.119*second:H.lerp(-.100+.074*first,-.100,back),inkZ=H.lerp(-.041,.0055,back);
 const pen=desk.props.pen;
 pen.position.set(H.lerp(penRest.x,inkX,pick),H.lerp(penRest.y,.0805,pick)+Math.sin(pick*Math.PI)*.056+lift*.018+up*.014,H.lerp(penRest.z,inkZ,pick));
 pen.rotation.set(H.lerp(penRestRotation.x,.20,pick)-lift*.10,0,H.lerp(penRestRotation.z,-.16,pick));
 const stamp=`${Math.round(first*450)}:${Math.round(second*650)}`;
 if(stamp!==inkStamp){
   inkStamp=stamp;const c=inkTexture.image.getContext('2d');c.drawImage(inkBase,0,0);
   c.fillStyle='#363432';c.font='500 51px CN, sans-serif';c.textBaseline='alphabetic';
   [['输入与回答',450,first,360],['共同使用有限空间。',675,second,580]].forEach(([s,y,p,w])=>{c.save();c.beginPath();c.rect(80,y-65,w*p,80);c.clip();c.fillText(s,80,y);c.restore()});
   inkTexture.needsUpdate=true;
 }
}
function ui(t){
 H.txt(ctx,'CONTEXT WINDOW',94,89,25,{font:'EN',weight:700,color:'#78737b'});
 H.txt(ctx,'把容量，想成一张有限的桌子',94,152,53,{weight:800});
 const cap=H.p(t,198.49,199.0),give=H.p(t,203.95,204.45),rules=H.p(t,211.61,212.05);
 ctx.save();ctx.globalAlpha=cap;
 H.txt(ctx,'假设本次上限',1130,80,27,{color:'#79727d',weight:550});
 H.txt(ctx,'10',1125,161,106,{font:'EN',weight:700});H.txt(ctx,'万',1252,166,64,{weight:800});
 H.txt(ctx,'Token',1354,168,43,{font:'EN',weight:700,color:'#8b63bc'});
 H.line(ctx,1130,222,1778,222,'#d2c4e3',3);
 H.txt(ctx,rules>.5?'实际容量取决于模型和产品':give>.5?'输入资料 + 生成的回答，共用这张桌子':'输入资料会占用空间',1130,254,27,{weight:550,color:'#605869'});
 ctx.restore();
 // Semantic labels track projected physical areas and leave materials exposed.
 if(give>.03){
   const p=new THREE.Vector3(.54,.805,-.16).project(camera);
   const x=viewport.x+(p.x+1)/2*viewport.w,y=viewport.y+(1-p.y)/2*viewport.h;
   ctx.save();ctx.globalAlpha=give*(1-rules*.45);
   H.line(ctx,x+30,y-4,x+50,y-76,'#926bb9',2);
   H.txt(ctx,'留给回答的空间',x+45,y-98,30,{weight:750,color:'#69458f',align:'center'});ctx.restore();
 }
 H.txt(ctx,'物品与容量关系为示意',440,839,22,{color:'#918b8f',weight:450});
 ctx.save();ctx.beginPath();ctx.arc(224,796,167,0,Math.PI*2);ctx.fillStyle='#fff';ctx.shadowColor='#2c223021';ctx.shadowBlur=20;ctx.fill();ctx.restore();
}
function seek(t){return new Promise(resolve=>{if(Math.abs(video.currentTime-t)<.006&&video.readyState>=2)return resolve();const done=()=>resolve();video.addEventListener('seeked',done,{once:true});video.currentTime=t;});}
async function render(t,mt=t){
 lastTime=t;position(t);renderer.render(scene,camera);
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#f5f4f0';ctx.fillRect(0,0,1920,1080);ctx.drawImage(renderer.domElement,viewport.x,viewport.y,viewport.w,viewport.h);ui(t);
 if(!exportMode){if(!playing)await seek(mt);ctx.save();ctx.beginPath();ctx.arc(224,796,160,0,Math.PI*2);ctx.clip();ctx.drawImage(video,620,0,740,740,64,636,320,320);ctx.restore();}
 if(window.UICaptions)window.UICaptions.draw(ctx,mt,{dark:false,background:'#f5f4f0'});
 document.getElementById('clock').textContent=`${(t-START).toFixed(1)} / 17.6 s`;
}
const initialized=(async()=>{
 await Promise.all([document.fonts.load('800 60px CN'),document.fonts.load('700 50px EN')]);
 configuration=await fetch('project-v2.json').then(r=>r.json());
 window.UICaptions?.prepare(configuration);
 await new Promise(r=>{if(video.readyState>=2)r();else video.addEventListener('loadeddata',r,{once:true})});
 await render(START);window.sceneDiagnostic={three:THREE.REVISION,webgl:renderer.capabilities.isWebGL2,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
})();
window.ready=()=>initialized;window.render=render;window.setExportMode=v=>exportMode=v;
window.motionActive=t=>(t<201.1)||(t>203.85&&t<206.5)||(t>208&&t<210.5)||(t>211.55&&t<213.6);
if(location.search.includes('render=1'))document.body.classList.add('render');
document.getElementById('scrub').oninput=async e=>{playing=false;video.pause();await render(Number(e.target.value))};
document.getElementById('play').onclick=async()=>{await initialized;if(playing){playing=false;video.pause();return}if(video.currentTime>=END-.1)await seek(START);video.muted=false;playing=true;await video.play();tick()};
async function tick(){if(!playing)return;let t=video.currentTime;if(t>=END){playing=false;video.pause();t=END-.04}await render(t,t);document.getElementById('scrub').value=t;if(playing)requestAnimationFrame(tick)}
