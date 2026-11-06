import * as THREE from 'three';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {createDeskProps} from './desk-props.js';

// Shared physical set. Render geometry at 1440p-width; type remains native 1080p.
const H=window.FilmHelpers,W=1920,Z=1080;
let renderer,world,camera,key,desk,files,cabinet,drawer,summary,initialized,signature='';
const p=(t,a,b)=>H.p(t,a,b),m=H.lerp;
function mesh(g,mat,parent,x=0,y=0,z=0){const v=new THREE.Mesh(g,mat);v.position.set(x,y,z);v.castShadow=true;v.receiveShadow=true;parent.add(v);return v}
function cube(parent,w,h,d,mat,x,y,z){return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z)}
function buildCabinet(){
 const g=new THREE.Group(),metal=new THREE.MeshStandardMaterial({color:'#555b60',roughness:.47,metalness:.50}),inside=new THREE.MeshStandardMaterial({color:'#272b2e',roughness:.68}),chrome=new THREE.MeshStandardMaterial({color:'#aeb4b9',metalness:.9,roughness:.22});
 cube(g,.73,.025,.58,metal,0,.94,0);cube(g,.025,.93,.58,metal,-.355,.48,0);cube(g,.025,.93,.58,metal,.355,.48,0);cube(g,.69,.91,.018,metal,0,.475,-.28);cube(g,.68,.04,.54,inside,0,.04,0);
 let first;
 for(let i=0;i<3;i++){
  const d=new THREE.Group();d.position.y=.12+i*.275;g.add(d);
  cube(d,.665,.23,.025,metal,0,.11,.289);cube(d,.62,.014,.47,inside,0,0,.025);cube(d,.012,.205,.47,metal,-.31,.10,.025);cube(d,.012,.205,.47,metal,.31,.10,.025);cube(d,.62,.205,.012,metal,0,.10,-.21);
  cube(d,.18,.018,.024,chrome,0,.112,.317);cube(d,.025,.027,.032,chrome,-.078,.105,.30);cube(d,.025,.027,.032,chrome,.078,.105,.30);
  cube(d,.10,.032,.001,new THREE.MeshStandardMaterial({color:'#e5e2d7',roughness:.8}),0,.17,.303);
  if(i===2)first=d;
 }
 return {group:g,drawer:first};
}
function summaryPaper(){
 const g=desk.stacks[1].clone(true);g.name='physical-task-summary';
 const c=document.createElement('canvas');c.width=1024;c.height=1448;const x=c.getContext('2d');
 x.fillStyle='#f4f0e7';x.fillRect(0,0,1024,1448);x.fillStyle='#25242b';x.font='800 80px CN';x.fillText('任务摘要',80,170);
 x.font='600 43px CN';['目标：解释 Token 与上下文','限制：普通人能听懂','已确认：输入和回答都占空间','下一步：整理本次相关资料'].forEach((s,i)=>{x.fillText(s,80,360+i*165);x.fillStyle='#d8c5eb';x.fillRect(80,395+i*165,800,3);x.fillStyle='#25242b'});
 const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
 g.traverse(o=>{if(o.name==='printed-top-page')o.material=new THREE.MeshStandardMaterial({map,roughness:.87,side:THREE.DoubleSide})});return g;
}
function ready(){return initialized??=(async()=>{
 await document.fonts.load('800 60px CN');
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(1440,810);renderer.setPixelRatio(1);renderer.setClearColor(0,0);
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.93;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 world=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,16/9,.03,30);camera.setViewOffset(1920,1080,-205,-105,1920,1080);
 const pmrem=new THREE.PMREMGenerator(renderer),env=new RoomEnvironment();world.environment=pmrem.fromScene(env,.05).texture;world.environmentIntensity=.36;env.dispose();pmrem.dispose();
 world.add(new THREE.HemisphereLight(0xffffff,0x8f826f,.95));key=new THREE.DirectionalLight(0xfff4e5,2.6);key.position.set(-1.8,4.5,2);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-2,right:2,top:2,bottom:-2,near:.2,far:9});key.shadow.bias=-.00014;key.shadow.normalBias=.002;key.shadow.radius=3;world.add(key);
 const fill=new THREE.DirectionalLight(0xe8e9ff,.7);fill.position.set(2,2,-2);world.add(fill);
 const ground=mesh(new THREE.PlaneGeometry(100,100),new THREE.ShadowMaterial({opacity:.10}),world,0,-.02,0);ground.rotation.x=-Math.PI/2;ground.castShadow=false;
 desk=createDeskProps();world.add(desk.group);files=[...desk.stacks];for(let j=0;j<9;j++){const n=desk.stacks[j%3].clone(true);desk.group.add(n);files.push(n)}
 const cab=buildCabinet();cabinet=cab.group;drawer=cab.drawer;world.add(cabinet);summary=summaryPaper();world.add(summary);
})()}
function reset(){
 desk.group.position.set(0,0,0);desk.group.scale.setScalar(1);desk.group.visible=true;
 files.forEach((f,i)=>{f.visible=i<3;f.position.set([-.60,-.10,.42][i%3],.783,i<3?.12:-.24);f.rotation.set(0,[-.06,.05,-.035][i%3],0);f.scale.setScalar(1.18)});
 desk.outputPad.visible=false;cabinet.visible=false;summary.visible=false;cabinet.position.set(1.13,0,-.1);drawer.position.z=0;
 camera.position.set(.9,1.95,2.35);camera.lookAt(.025,.75,.02);camera.updateMatrixWorld();
}
function header(c,kicker,title,sub=''){
 H.txt(c,kicker,94,89,25,{font:'EN',weight:700,color:'#79747c'});H.txt(c,title,94,157,61,{weight:800});if(sub)H.txt(c,sub,98,224,29,{weight:500,color:'#7b727f'});
}
function surface(c,t,title,sub=''){
 c.fillStyle='#f5f4f0';c.fillRect(0,0,W,Z);camera.updateMatrixWorld();
 const sig=files.map(f=>[f.visible,...f.position.toArray(),...f.scale.toArray(),f.rotation.y].join(',')).join('|')+desk.group.scale.x+desk.group.position.toArray()+summary.position.toArray()+drawer.position.z+summary.visible+cabinet.visible+cabinet.position.toArray();
 if(sig!==signature){renderer.shadowMap.needsUpdate=true;signature=sig}renderer.render(world,camera);c.drawImage(renderer.domElement,0,0,W,Z);
 header(c,'CONTEXT / 概念示意',title,sub);
}
function requestPanel(c,t,old=true){
 H.box(c,515,290,1190,510,30,'#ffffff','#e8e2ed');H.txt(c,'当前请求 · 示意',570,340,30,{color:'#8e8496',weight:550});H.line(c,557,382,1660,382,'#e7e0ed',2);
 H.txt(c,'之前的要求：回答保持简短',585,463,51,{weight:750});H.txt(c,old?'本次参考中，已找不到这条要求':'要求还在，回答也可能没有遵守',585,580,43,{weight:550,color:'#7a6f86'});
 H.box(c,584,662,965,72,12,'#e6d8f5');H.txt(c,old?'未保留的信息，可能不再被参考':'理解 / 执行问题 ≠ 容量问题',616,697,37,{weight:750});
}
function draw(c,t,sc){
 reset();const i=sc.index;
 if(i===10){
  if(t<188.0){
   c.fillStyle='#111214';c.fillRect(0,0,W,Z);header(c,'CONTEXT','');
   H.txt(c,t<182.89?'Token，也衡量上下文容量':'怎么聊着聊着，又忘了？',1130,304,t<182.89?81:77,{color:'#faf8fc',align:'center',weight:800});
   const q=p(t,184.44,187.8);H.box(c,520,431,1220,285,24,'#29262f');
   H.txt(c,'这一次，它能参考哪些信息？',1130,530,60,{align:'center',color:'#ddd4e7',weight:650});
   H.txt(c,'上下文窗口',1130,651,73,{align:'center',color:'#d7bef5',alpha:q,weight:850});return;
  }
  const zoom=p(t,188,190.8);camera.position.set(m(1.4,.8,zoom),m(1.8,2.05,zoom),m(3.2,2.25,zoom));camera.lookAt(0,.73,0);
  [192.7783,193.6783,194.0383].forEach((at,j)=>{const q=p(t,at-.18,at+.65);files[j].visible=q>.002;files[j].position.x+=(1-q)*.55;files[j].position.y+=Math.sin(q*Math.PI)*.09;});
  surface(c,t,'这一桌，是本次能参考的信息','聊天记录、当前问题、参考资料，进入同一工作空间');return;
 }
 if(i===12){
  files.forEach((f,j)=>{f.visible=j<6;f.position.set([-.60,-.10,.42][j%3],.783,j<3?.16:-.24)});
  const enter=p(t,214.4,217.2);files.slice(3,6).forEach((f,j)=>{f.position.x+=(1-enter)*(.4+j*.1);f.position.y+=(1-enter)*.09;});
  const cut=p(t,218.45,219.95),compress=p(t,220.37,221.7),warn=p(t,222.03,222.8),other=p(t,227.97,229.4);
  const branch=compress>.01?1:0;files[0].position.x-=cut*1.5;files[0].position.y+=Math.sin(cut*Math.PI)*.07;files[0].visible=cut<.99;
  if(compress>.01){files.forEach((f,j)=>{if(j>0){f.position.x=m(f.position.x,-1.5,compress);f.visible=compress<.999;}});summary.visible=true;summary.position.set(m(1.2,.12,compress),.784,.10);summary.rotation.y=-.025;summary.scale.setScalar(1.45)}
  camera.position.set(.7,2.02,2.24);camera.lookAt(.08,.76,0);
  surface(c,t,branch?'或者，把关键内容整理成摘要':'内容超限，旧信息可能退出','截断、摘要、提示超限，是不同产品可能采用的方式');
  if(warn>.001){c.save();c.globalAlpha=warn;H.box(c,760,355,970,325,24,'#fffffff5','#d4bdec');H.txt(c,'本次内容超过限制',1245,456,65,{align:'center',weight:800});H.txt(c,'也可能直接提示超限',1245,572,40,{align:'center',color:'#7f6f8c'});c.restore()}
  if(t>223.55){c.save();c.globalAlpha=p(t,223.55,224.2);requestPanel(c,t,other<.5);c.restore()}
  return;
 }
 if(i===13){
  desk.group.position.x=-.36;desk.group.scale.setScalar(.83);files.forEach((f,j)=>f.visible=j===1);cabinet.visible=true;
  const arrive=p(t,239.5,241.4);cabinet.position.x=m(2.45,1.03,arrive);
  const save=p(t,242.3,243.7),read=p(t,244.35,245.9),open=Math.max(Math.sin(save*Math.PI),Math.sin(read*Math.PI));drawer.position.z=.34*open;
  files[1].visible=false;summary.visible=true;summary.scale.setScalar(.95);
  let x=m(-.35,1.03,save),y=m(.658,.82,save),z=m(.06,.25,save);
  if(read>0){x=m(1.03,-.35,read);y=m(.82,.658,read);z=m(.25,.06,read)}
  summary.position.set(x,y,z);summary.rotation.y=-.03;summary.rotation.x=Math.sin(save*Math.PI)*.04;summary.visible=!(save>.995&&read<.03);
  camera.position.set(1.6,1.95,3.12);camera.lookAt(.22,.6,0);
  surface(c,t,'桌面可用，与长期保存是两件事','额外执行保存与读取，才能在下一次使用');
  H.txt(c,read>.05?'读取 → 回到当前工作空间':save>.05?'保存 → 放入档案柜':'当前工作空间',585,819,36,{weight:750,color:'#715686'});return;
 }
 if(i===15){
  const grow=p(t,269.23,271.45),find=p(t,273.19,275.53);desk.group.scale.x=1+grow*.32;
  files.forEach((f,j)=>{f.visible=j<3||grow>j*.015;if(j>=3){f.position.x=[-.66,-.17,.30,.7][j%4];f.position.z=j<7?-.24:.29;f.position.y=.783+Math.floor(j/7)*.016;f.scale.setScalar(.90)} });
  camera.position.set(m(.75,.15,find),m(2.1,2.48,find),m(2.5,1.6,find));camera.lookAt(.025,.76,0);
  surface(c,t,find>.5?'放得下，也需要找对、理解对':'桌面更大，可以容纳更多资料','容量示意；更大的上下文并不保证不遗漏');
  if(find>.01){c.save();c.globalAlpha=find;H.box(c,575,350,1135,397,25,'#fffffff2','#dcd0e9');H.txt(c,'当前问题：回答前需要检查什么？',628,431,48,{weight:750});H.line(c,628,483,1650,483,'#e1d6ea',2);H.box(c,621,529,990,72,10,'#ddc8f3');H.txt(c,'相关原文：保留出处，并回查关联。',651,565,44,{weight:750});H.txt(c,'找到信息之后，还要准确理解并执行要求。',637,672,36,{color:'#807389',weight:550});c.restore()}return;
 }
 if(i===18){
  const mode=t<320.02?0:t<323.14?1:2;
  if(mode<2){c.fillStyle='#121315';c.fillRect(0,0,W,Z);H.txt(c,'最后，记住三个重点',1110,166,72,{align:'center',color:'#fbfafc',weight:800});
   if(mode===0){H.txt(c,'处理文字的基本单位',1110,340,73,{align:'center',color:'#d4b9f4',weight:800});H.box(c,545,451,1150,272,25,'#f8f6fa');H.txt(c,'模型把文字分成可处理的片段',1120,533,46,{align:'center',weight:650});['文字','片段','Token'].forEach((s,j)=>{H.box(c,638+j*322,601,271,83,12,j===2?'#cbb0ee':'#e6e0ec');H.txt(c,s,773+j*322,644,43,{align:'center',font:j===2?'EN':'CN',weight:800})});}
   else{H.txt(c,'计算用量与费用的单位',1110,340,73,{align:'center',color:'#d4b9f4',weight:800});H.box(c,545,430,1150,350,25,'#f8f6fa');H.txt(c,'输入 500 × 输入单价',650,521,57,{weight:750});H.line(c,625,589,1620,589,'#d9cee6',2);H.txt(c,'输出 1000 × 输出单价',650,674,57,{weight:750});}return;
  }
  files.slice(0,3).forEach(f=>f.visible=true);desk.outputPad.visible=true;desk.outputPad.position.set(.52,.783,-.24);camera.position.set(1,1.95,2.35);camera.lookAt(0,.75,0);
  surface(c,t,'也是衡量上下文容量的单位','输入与输出，都围绕本次可用信息来理解');return;
 }
}
window.PhysicalContextV3={ready,draw,motionActive:t=>[[182.8,188.0],[188,195.3],[214.4,219.95],[220.37,224.2],[227.97,229.4],[239.5,245.9],[269.23,275.53],[315.32,320.6],[323.14,324]].some(([a,b])=>t>=a&&t<b)};
