/* Independent editable SVG study of the observed character-operated switch. */
(function(){
 'use strict';
 UIFX.register({id:'interaction-bear-switch-on-off',title:'角色开关 · 开启后由熊推回关闭',category:'interaction',duration:26,
   source:'https://x.com/jh3yy/status/2098439672154280234',referenceMedia:'https://cdn.collectui.com/amplify_video/2098439277139120128/vid/avc1/1440x1080/9eMmn9c1XuOmVjLZ-optimized.mp4',sourceStatus:'observed-reconstruction',sourceObservation:'video-paused-frames',
   description:'立体感开关从灰槽左端滑到绿色右端；镜头改变构图，戴帽熊出现，手臂覆盖前景并把同一手柄推回左端，随后退回开关后面。',
   adaptationNotes:'源1440×1080、14.28秒。保留开关框/凹槽/圆柄/投影、角色头耳帽/脸/躯干/双臂、手与手柄前后遮挡及构图变化；独立CSS/SVG渐变重建为可编辑矢量视觉，26秒增加动作阅读停留。源中是角色碰触手柄，不是已观察到真人鼠标点击；初次开启触发未知。图注与OFF/ON文字为原创参数入口，不对应系统设置或真实业务执行。',
   tags:['Collect UI','Switch Button','Character motion','Continuous interaction'],params:{title:'Playful switch',prompt:'OFF',result:'ON'},paramLimits:{title:24,prompt:10,result:10}
 },function(c,p){
   const clean=(v,f,n)=>Array.from(String(v??f).replace(/\s+/g,' ').trim()||f).slice(0,n).join(''),title=clean(p.title,'Playful switch',24),off=clean(p.prompt,'OFF',10),on=clean(p.result,'ON',10);
   c.root.innerHTML=`<style>
   .sbc-scene{background:radial-gradient(ellipse at 48% 44%,#e2dbc9 0%,#d9d1be 65%,#d1c8b6 100%);overflow:hidden;font-family:ProjectSans,Arial,sans-serif;color:#625f53}.sbc-art{position:absolute;left:240px;top:60px;width:1440px;height:960px;overflow:visible}.sbc-caption{position:absolute;left:74px;bottom:42px;width:590px;height:72px;z-index:4}.sbc-caption-title{font-size:20px;line-height:1.4;white-space:nowrap;margin:0}.sbc-status{position:absolute;left:0;top:36px;font-size:17px;line-height:1.5;display:flex;align-items:center;gap:9px;white-space:nowrap}.sbc-status-dot{width:8px;height:8px;border-radius:50%;background:#9a968d}.sbc-status-on .sbc-status-dot{background:#449c3b}.sbc-note{position:absolute;right:64px;bottom:46px;font-size:14px;color:#8f8878}.sbc-status-on{opacity:0}
   </style><div class="fx-scene sbc-scene" translate="no" data-phase="off-initial" data-switch="off">
   <svg class="sbc-art" viewBox="0 0 1200 800" aria-label="Independent vector bear and switch motion">
     <defs>
       <linearGradient id="sbc-rim" x1="0" x2=".6" y2="1"><stop stop-color="#c9c4b9"/><stop offset=".35" stop-color="#b4afa4"/><stop offset="1" stop-color="#99958d"/></linearGradient>
       <linearGradient id="sbc-rim-top" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#e0dacf"/><stop offset="1" stop-color="#c5c0b6"/></linearGradient>
       <linearGradient id="sbc-slot" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#85827a"/><stop offset=".22" stop-color="#aaa69d"/><stop offset="1" stop-color="#bfbab0"/></linearGradient>
       <linearGradient id="sbc-green" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#288d28"/><stop offset=".24" stop-color="#3dba3b"/><stop offset="1" stop-color="#60bf43"/></linearGradient>
       <linearGradient id="sbc-knob" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="#ece6d9"/><stop offset=".3" stop-color="#ddd6c6"/><stop offset="1" stop-color="#c6bdad"/></linearGradient>
       <linearGradient id="sbc-fur" x1="0" y1="0" x2="1" y2=".2"><stop stop-color="#a66a2c"/><stop offset=".28" stop-color="#d6a15c"/><stop offset=".72" stop-color="#c18a42"/><stop offset="1" stop-color="#9b662d"/></linearGradient>
       <linearGradient id="sbc-paw" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#daa966"/><stop offset="1" stop-color="#b57d38"/></linearGradient>
       <linearGradient id="sbc-cap" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#59565b"/><stop offset=".55" stop-color="#444248"/><stop offset="1" stop-color="#333137"/></linearGradient>
       <radialGradient id="sbc-muzzle"><stop stop-color="#e3b67b"/><stop offset="1" stop-color="#b8854c"/></radialGradient>
       <filter id="sbc-floor-blur" x="-50%" y="-100%" width="200%" height="300%"><feGaussianBlur stdDeviation="14"/></filter>
       <filter id="sbc-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#544d40" flood-opacity=".28"/></filter>
     </defs>
     <g class="sbc-camera">
       <ellipse class="sbc-ground-shadow" cx="630" cy="746" rx="270" ry="23" fill="#8b8070" opacity=".3" filter="url(#sbc-floor-blur)"/>
       <g class="sbc-bear-back">
         <path d="M509 368Q455 422 438 562" fill="none" stroke="url(#sbc-fur)" stroke-width="75" stroke-linecap="round"/>
         <ellipse cx="536" cy="132" rx="44" ry="48" fill="url(#sbc-fur)"/><ellipse cx="682" cy="132" rx="44" ry="48" fill="url(#sbc-fur)"/>
         <ellipse cx="536" cy="133" rx="26" ry="31" fill="#9c632c"/><ellipse cx="682" cy="133" rx="26" ry="31" fill="#9c632c"/>
         <rect x="497" y="148" width="218" height="425" rx="105" fill="url(#sbc-fur)"/>
         <path d="M490 214Q486 98 609 95Q729 99 724 216L653 209Q652 157 609 158Q562 159 561 210Z" fill="url(#sbc-cap)" stroke="#555157" stroke-width="2"/>
         <path d="M609 99V153M551 111Q526 149 527 210M672 111Q696 156 695 211" fill="none" stroke="#777079" stroke-opacity=".38" stroke-width="1.6"/>
         <ellipse cx="609" cy="95" rx="9" ry="5" fill="#49454a"/>
         <rect x="565" y="187" width="87" height="25" rx="5" fill="#c3685a" stroke="#a95049" stroke-width="2"/>
         <g fill="#9e5048"><circle cx="579" cy="199" r="2.1"/><circle cx="592" cy="199" r="2.1"/><circle cx="605" cy="199" r="2.1"/><circle cx="618" cy="199" r="2.1"/><circle cx="631" cy="199" r="2.1"/></g>
         <g class="sbc-face">
           <ellipse cx="553" cy="271" rx="11" ry="10" fill="#382a22"/><ellipse cx="664" cy="271" rx="11" ry="10" fill="#382a22"/>
           <path d="M538 257l30 4M649 261l30-4" stroke="#a16b34" stroke-width="10" stroke-linecap="round"/>
           <ellipse cx="610" cy="322" rx="49" ry="44" fill="url(#sbc-muzzle)"/>
           <ellipse cx="610" cy="301" rx="19" ry="13" fill="#3d2c22"/><ellipse cx="605" cy="298" rx="7" ry="3" fill="#6c4e37" opacity=".6"/>
           <path d="M595 334q15-4 30 0" fill="none" stroke="#624125" stroke-width="4" stroke-linecap="round"/>
         </g>
       </g>
       <g class="sbc-switch" aria-label="Visual switch, no system setting">
         <rect x="358" y="505" width="484" height="245" rx="122.5" fill="url(#sbc-rim)"/>
         <rect x="364" y="502" width="472" height="238" rx="119" fill="url(#sbc-rim-top)"/>
         <rect x="385" y="525" width="430" height="193" rx="96.5" fill="url(#sbc-slot)" stroke="#9a968c" stroke-width="3"/>
         <rect class="sbc-green" x="385" y="525" width="430" height="193" rx="96.5" fill="url(#sbc-green)" opacity="0"/>
         <path d="M405 563q22-29 65-29h254q40 0 65 27" fill="none" stroke="#736f64" stroke-opacity=".23" stroke-width="7" stroke-linecap="round"/>
         <path d="M397 691q26 34 72 34h264q36 0 58-28" fill="none" stroke="#ece5d8" stroke-opacity=".35" stroke-width="3"/>
         <g class="sbc-knob" data-target="knob">
           <circle cx="482" cy="622" r="104" fill="#777369" filter="url(#sbc-shadow)"/>
           <circle cx="479" cy="620" r="101" fill="url(#sbc-knob)" stroke="#e5dece" stroke-width="1.5"/>
           <path d="M413 548q30-29 69-27" fill="none" stroke="#f7efe1" stroke-opacity=".55" stroke-width="2" stroke-linecap="round"/>
         </g>
       </g>
       <g class="sbc-arm-front">
         <path class="sbc-arm-path" d="M701 380Q755 456 826 538" fill="none" stroke="url(#sbc-fur)" stroke-width="82" stroke-linecap="round"/>
         <g class="sbc-paw" data-target="paw-contact">
           <path d="M797 500q36-18 63 9q30 32 8 64q-15 26-48 19q-27-2-34-25q-17-12-10-30q-2-24 21-37Z" fill="url(#sbc-paw)"/>
           <path d="M810 548q27-8 49 6M810 564q26-8 44 5" fill="none" stroke="#a77132" stroke-width="3" stroke-linecap="round" opacity=".6"/>
           <circle class="sbc-contact-point" cx="824" cy="555" r="1" fill="transparent"/>
         </g>
       </g>
     </g>
   </svg><div class="sbc-caption"><p class="sbc-caption-title">${c.esc(title)}</p><div class="sbc-status sbc-status-off"><span class="sbc-status-dot"></span><span>${c.esc(off)}</span></div><div class="sbc-status sbc-status-on"><span class="sbc-status-dot"></span><span>${c.esc(on)}</span></div></div><div class="sbc-note">Original vector motion study</div></div>`;
   const tl=c.gsap.timeline({paused:true}),camera=c.q('.sbc-camera'),back=c.q('.sbc-bear-back'),front=c.q('.sbc-arm-front'),paw=c.q('.sbc-paw'),arm=c.q('.sbc-arm-path'),knob=c.q('.sbc-knob'),green=c.q('.sbc-green'),scene=c.q('.sbc-scene'),offText=c.q('.sbc-status-off'),onText=c.q('.sbc-status-on');
   tl.set(camera,{x:0,y:-220,scale:1.25,rotation:0,svgOrigin:'600 622',opacity:1},0).set(back,{x:0,y:340,scale:1,rotation:0,opacity:0},0).set(front,{x:0,y:340,scale:1,rotation:0,opacity:0},0).set(paw,{x:0,y:0,scale:1,rotation:0},0).set(knob,{x:0,y:0,scale:1,rotation:0},0).set(green,{opacity:0},0).set(offText,{x:0,y:0,scale:1,rotation:0,opacity:1},0).set(onText,{x:0,y:0,scale:1,rotation:0,opacity:0},0).set(arm,{attr:{d:'M701 380Q755 456 826 538'}},0);
   let phase='off-initial',state='off';const mark=(next,t)=>{tl.fromTo(scene,{attr:{'data-phase':phase}},{attr:{'data-phase':next},duration:0,immediateRender:false},t);phase=next;};const setState=(next,t)=>{tl.fromTo(scene,{attr:{'data-switch':state}},{attr:{'data-switch':next},duration:0,immediateRender:false},t);state=next;};const tween=(el,from,to,t)=>tl.fromTo(el,from,{...to,immediateRender:false},t);
   mark('switch-on',1.5);tween(knob,{x:0},{x:236,duration:.75,ease:'power3.inOut'},1.5);tween(green,{opacity:0},{opacity:1,duration:.65,ease:'power2.inOut'},1.5);tween(offText,{opacity:1},{opacity:0,duration:.2},1.5);tween(onText,{opacity:0},{opacity:1,duration:.25},1.95);setState('on',2.25);mark('on-hold',2.25);
   mark('bear-emerge',8.5);tween(camera,{y:-220,scale:1.25},{y:0,scale:1,duration:1.4,ease:'power2.inOut'},8.5);tween(back,{y:340,opacity:0},{y:0,opacity:1,duration:1.4,ease:'power3.out'},8.65);tween(front,{y:340,opacity:0},{y:0,opacity:1,duration:1.4,ease:'power3.out'},8.65);mark('bear-ready',10.15);
   mark('paw-reach',13);tween(arm,{attr:{d:'M701 380Q755 456 826 538'}},{attr:{d:'M701 380Q742 482 720 595'},duration:.8,ease:'power2.inOut'},13);tween(paw,{x:0,y:0},{x:-106,y:57,duration:.8,ease:'power2.inOut'},13);mark('paw-contact',13.8);
   mark('bear-push-off',14.7);tween(arm,{attr:{d:'M701 380Q742 482 720 595'}},{attr:{d:'M701 380Q648 507 484 595'},duration:1.15,ease:'power2.inOut'},14.7);tween(paw,{x:-106,y:57},{x:-342,y:57,duration:1.15,ease:'power2.inOut'},14.7);tween(knob,{x:236},{x:0,duration:1.15,ease:'power2.inOut'},14.7);tween(green,{opacity:1},{opacity:0,duration:1.0,ease:'power2.inOut'},14.7);tween(onText,{opacity:1},{opacity:0,duration:.2},15.45);tween(offText,{opacity:0},{opacity:1,duration:.25},15.65);setState('off',15.85);mark('off-contact',15.85);
   mark('paw-retract',16.65);tween(arm,{attr:{d:'M701 380Q648 507 484 595'}},{attr:{d:'M701 380Q755 456 826 538'},duration:.85,ease:'power2.inOut'},16.65);tween(paw,{x:-342,y:57},{x:0,y:0,duration:.85,ease:'power2.inOut'},16.65);mark('bear-ready-off',17.5);
   mark('bear-withdraw',19);tween(back,{y:0,opacity:1},{y:340,opacity:0,duration:1.4,ease:'power2.in'},19);tween(front,{y:0,opacity:1},{y:340,opacity:0,duration:1.4,ease:'power2.in'},19);mark('off-wide',20.4);
   mark('off-final-wide',21);tl.to({}, {duration:.01},25.99);
   return {timeline:tl,duration:26};
 });
})();
