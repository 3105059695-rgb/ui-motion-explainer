/* Ahmet Loca dual image loader: deterministic original vectors, no source pixels. */
(function(){
  'use strict';
  function artwork(id){return `<svg class="ao-art" viewBox="0 0 470 750" aria-label="原创黑白三人物运动服插画" role="img"><defs><linearGradient id="${id}-paper" x2="0" y2="1"><stop stop-color="#b9b9b7"/><stop offset=".55" stop-color="#e4e4e2"/><stop offset="1" stop-color="#babbb8"/></linearGradient><linearGradient id="${id}-suit" x2="1" y2="1"><stop stop-color="#171919"/><stop offset=".55" stop-color="#090b0b"/><stop offset="1" stop-color="#424444"/></linearGradient><filter id="${id}-side"><feGaussianBlur stdDeviation="6"/></filter><filter id="${id}-center"><feGaussianBlur stdDeviation="1.3"/></filter></defs><rect width="470" height="750" fill="url(#${id}-paper)"/><path d="M0 643h470" stroke="#858782" stroke-width="2"/><ellipse cx="237" cy="646" rx="92" ry="12" fill="#626761" opacity=".35"/>
    <g fill="#121514" filter="url(#${id}-side)" opacity=".94"><path d="M10 150q32-10 46 20l-5 51 22 34 7 171-31 9-12-72-8 83 43 102 114 91-25 21L48 573 0 492l-27-78 3-133 18-56Z"/><path d="m16 482-45 143-70 53 14 20 88-56 64-125Z"/><ellipse cx="27" cy="191" rx="26" ry="38"/><path d="M434 152q38-4 46 33l-9 49 12 42 31 160-26 33-28-126-2 110-57 107-86 96-34-9 75-98 37-99-20-158 9-53Z"/><ellipse cx="453" cy="193" rx="26" ry="40"/><path d="m439 474 72 133 81 40-7 24-100-44-90-112Z"/></g>
    <g filter="url(#${id}-center)"><path d="M214 257q7-31 25-31 22 0 28 26l-3 29-13 17h-21l-16-16Z" fill="#525654"/><path d="M213 252q3-32 30-31 30 0 28 34l-18-7-17 8Z" fill="#101615"/><path d="m217 262 47-3-4 15-39 2Z" fill="#101211"/><path d="m222 282 13 15 19-3 9-14-8 22h-24Z" fill="#272e2a"/>
    <path d="m230 294-39 19-12 53 2 111 23 26 56 6 32-32-5-118-18-48-20-17Z" fill="url(#${id}-suit)"/><path d="m195 329-25 47-7 113 15 9 16-89 12-58 M278 329l27 67-6 99-17 3-9-92" fill="#0b1010"/><path d="m202 485-12 105 11 55 27-3 9-84 1-37 12 57 6 63 27 4 3-66-13-100Z" fill="#0c1110"/><path d="m197 637-8 13 6 9 34-2 1-18 M257 637l-1 19 32 4 8-8-13-15" fill="#1c2220"/><path d="M217 317h40 M208 367h65 M205 443h67" stroke="#949b93" opacity=".35"/><path d="M239 319v155" stroke="#9aafa4" stroke-width="2" opacity=".3"/><text x="237" y="356" text-anchor="middle" fill="#c2cbc3" font-size="15" font-family="ProjectDisplay,Arial">MOTION</text><text x="220" y="337" fill="#a0aaa3" font-size="7" font-family="Arial">STUDIO / 01</text><path d="M191 382h18 M270 382h20 M204 538h22 M256 536h22" stroke="#a1aaa4" stroke-width="3" opacity=".4"/></g>
    <rect width="470" height="750" fill="#222" opacity=".035"/></svg>`;}
  const reset='<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M25 13a10 10 0 1 0-1 11 M25 6v8h-8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  UIFX.register({
    id:'interaction-dual-image-loader-orb-reveal',title:'双图像加载 · 点阵与粒子球揭示',category:'interaction',duration:9,
    source:'https://x.com/ahmetloca/status/2102372801688576482',referenceMedia:'https://cdn.collectui.com/amplify_video/2102371677870944256/vid/avc1/2284x1362/MyEZrI7uAWJkslTj-optimized.mp4',sourceStatus:'observed-reconstruction',sourceObservation:'video-paused-frames',
    description:'两种图像加载表示始终处于同一工作区：流动点阵和旋转粒子球伴随状态交替，经模糊扩张连续揭示相同黑白图像。',
    adaptationNotes:'依据2284×1362、6.208333秒原片的7个实际解码暂停帧重建双加载面板、游走边光、点阵、粒子球、多线光环、状态切换和成图揭示。独立SVG运动服人物替代来源照片与身份；源未显示AI请求或重试点击。9秒适配阅读及接UI正文，三参数编辑原片可见状态文字。成图矩形可接入图像工作区/素材详情。',
    tags:['Collect UI','Loading','Orb','AI','Particle Sphere','Image Reveal','图像加载','AI 开场'],
    params:{title:'Making the first draft...',prompt:'Forming the shapes...',result:'Gathering the light...'},paramLimits:{title:32,prompt:32,result:32}
  },function(c,p){
    const e=c.esc,clean=(v,f)=>Array.from(String(v||f).replace(/\s+/g,' ').trim()||f).slice(0,32).join('');
    const title=clean(p.title,'Making the first draft...'),prompt=clean(p.prompt,'Forming the shapes...'),result=clean(p.result,'Gathering the light...');
    const grid=Array.from({length:209},(_,i)=>({col:i%11,row:Math.floor(i/11)}));
    const cloud=Array.from({length:1260},(_,i)=>{const y=1-2*i/1259,r=Math.sqrt(1-y*y),a=i*2.399963229728653;return {x:r*Math.cos(a),y,z:r*Math.sin(a),a};});
    c.root.innerHTML=`<style>
      .ao-scene{background:#060607;color:#bcbec2;font-family:ProjectSans,Arial,sans-serif;overflow:hidden}
      .ao-workspace{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 52%,#0a0b0e 0%,#060607 62%)}
      .ao-panel{position:absolute;top:145px;width:470px;height:750px;border-radius:45px;overflow:hidden;background:linear-gradient(180deg,#161718 0%,#0e0f10 25%,#090a0b 70%);box-shadow:inset 0 0 0 1px #24252b}
      .ao-left{left:464px}.ao-right{left:988px}
      .ao-edge{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:.65}
      .ao-status{position:absolute;left:40px;right:40px;top:45px;height:78px;z-index:3;font-size:27px;line-height:1.35;letter-spacing:-.45px}
      .ao-caption{position:absolute;left:0;top:0;max-width:390px}.ao-first{transform:translateY(0)}.ao-next{opacity:0;transform:translateY(9px)}
      .ao-grid{position:absolute;left:0;top:145px;width:470px;height:565px;overflow:visible}
      .ao-orb{position:absolute;inset:0;width:470px;height:750px;overflow:visible}
      .ao-image{position:absolute;inset:0;clip-path:circle(0% at 50% 55%);filter:blur(24px);opacity:0;z-index:4;will-change:filter,clip-path,opacity;transform:translateZ(0)}
      .ao-art{width:100%;height:100%;display:block}
      .ao-reset{position:absolute;right:38px;top:36px;width:54px;height:54px;border:1px solid #66686b5c;border-radius:50%;background:#15181980;display:flex;align-items:center;justify-content:center;color:#ecefee;z-index:7;opacity:0;will-change:opacity;transform:translateZ(0)}
      .ao-reset svg{width:30px;height:30px}
      .ao-panel .ao-underlay{position:absolute;inset:0}
    </style><div class="fx-scene ao-scene" data-phase="draft-loading"><main class="ao-workspace" aria-label="并列图像加载工作区">
      <section class="ao-panel ao-left" aria-label="点阵加载图像"><div class="ao-status"><span class="ao-caption ao-first">${e(title)}</span><span class="ao-caption ao-next">Sketching it out...</span></div><div class="ao-underlay"><svg class="ao-grid" viewBox="0 0 470 565" aria-hidden="true">${grid.map(()=>'<circle class="ao-dot" fill="#d3d5da"/>').join('')}</svg></div><svg class="ao-edge" viewBox="0 0 470 750" aria-hidden="true"><defs><linearGradient id="ao-edge-left"><stop stop-color="#b5afff" stop-opacity=".1"/><stop offset=".5" stop-color="#929aff" stop-opacity=".7"/><stop offset="1" stop-color="#69d8de" stop-opacity=".2"/></linearGradient></defs><rect x="1.5" y="1.5" width="467" height="747" rx="43" fill="none" stroke="url(#ao-edge-left)" stroke-width="2" stroke-dasharray="300 2300"/></svg><div class="ao-image">${artwork('ao-left-art')}</div><div class="ao-reset" aria-label="重新加载点阵图像">${reset}</div></section>
      <section class="ao-panel ao-right" aria-label="粒子球加载图像"><div class="ao-status"><span class="ao-caption ao-first">${e(prompt)}</span><span class="ao-caption ao-next">${e(result)}</span></div><div class="ao-underlay"><svg class="ao-orb" viewBox="0 0 470 750" aria-hidden="true"><defs><linearGradient id="ao-rim-gradient" x1="40" y1="250" x2="400" y2="535" gradientUnits="userSpaceOnUse"><stop stop-color="#a898ff"/><stop offset=".23" stop-color="#f8f6ff"/><stop offset=".44" stop-color="#7770df"/><stop offset=".66" stop-color="#839cff"/><stop offset=".85" stop-color="#a4f4f2"/><stop offset="1" stop-color="#6395d1"/></linearGradient><filter id="ao-rim-glow"><feGaussianBlur stdDeviation="2.6"/></filter></defs><g class="ao-cloud">${cloud.map(()=>'<circle class="ao-particle" fill="#e9ecff"/>').join('')}</g><g fill="none" stroke="url(#ao-rim-gradient)">${[0,1,2].map(()=>'<path class="ao-rim-blur" stroke-width="4" opacity=".35" filter="url(#ao-rim-glow)"/>').join('')}${[0,1,2].map((_,i)=>`<path class="ao-rim" stroke-width="${i===0?2.2:1.35}" opacity="${i===0?1:.72}"/>`).join('')}</g></svg></div><svg class="ao-edge" viewBox="0 0 470 750" aria-hidden="true"><defs><linearGradient id="ao-edge-right"><stop stop-color="#71f7ea" stop-opacity=".1"/><stop offset=".5" stop-color="#89b8e9" stop-opacity=".7"/><stop offset="1" stop-color="#b496ff" stop-opacity=".2"/></linearGradient></defs><rect x="1.5" y="1.5" width="467" height="747" rx="43" fill="none" stroke="url(#ao-edge-right)" stroke-width="2" stroke-dasharray="340 2300"/></svg><div class="ao-image">${artwork('ao-right-art')}</div><div class="ao-reset" aria-label="重新加载粒子球图像">${reset}</div></section>
    </main></div>`;
    const q=c.q,qa=c.qa,dots=qa('.ao-dot'),particles=qa('.ao-particle'),rims=qa('.ao-rim'),blurs=qa('.ao-rim-blur'),edges=qa('.ao-edge rect'),scene=q('.ao-scene'),clock={time:0};
    const f=v=>v.toFixed(3);
    function paint(){
      const t=clock.time,a=t*1.28,tilt=.28;
      grid.forEach((d,i)=>{const wave=.5+.5*Math.sin(d.col*.47+d.row*.38-a*1.62),wave2=.5+.5*Math.cos(d.row*.31-d.col*.21+a*.86),edge=Math.sin(Math.PI*(d.col+1)/12),fade=Math.sin(Math.PI*(d.row+1)/20);const strength=Math.pow(wave,2)*.65+wave2*.2;
        dots[i].setAttribute('cx',f(56+d.col*36+1.2*Math.sin(a+d.row*.19)));dots[i].setAttribute('cy',f(10+d.row*29));dots[i].setAttribute('r',f(.45+strength*2.7));dots[i].setAttribute('opacity',f(.015+strength*edge*fade*.64));});
      cloud.forEach((d,i)=>{const ca=Math.cos(a),sa=Math.sin(a),x=d.x*ca+d.z*sa,z=-d.x*sa+d.z*ca;const y=d.y*Math.cos(tilt)-z*Math.sin(tilt),zz=d.y*Math.sin(tilt)+z*Math.cos(tilt);const ripple=1+.045*Math.sin(5*d.a+a*1.4+d.y*3),perspective=1+zz*.075,light=Math.pow(Math.max(0,x*Math.cos(a*.65)+y*Math.sin(a*.65)+.35),2);const opacity=Math.min(.97,(.055+.4*Math.max(0,zz)+light*.34));
        particles[i].setAttribute('cx',f(235+x*125*ripple*perspective));particles[i].setAttribute('cy',f(410+y*125*ripple*perspective));particles[i].setAttribute('r',f(.36+.65*Math.max(0,zz)+Math.min(.7,light*.32)));particles[i].setAttribute('opacity',f(opacity));});
      rims.forEach((rim,k)=>{let path='';for(let j=0;j<=120;j++){const u=j*Math.PI*2/120,r=151+Math.sin(u*3+a*(k+1)*.6+k)*3.4+Math.cos(u*2-a*.8+k)*2.1+k*2;const x=235+Math.cos(u)*r,y=410+Math.sin(u)*r*(1+.018*Math.sin(a+k));path+=(j?'L':'M')+f(x)+','+f(y);}path+='Z';rim.setAttribute('d',path);blurs[k].setAttribute('d',path);});
      q('#ao-rim-gradient').setAttribute('gradientTransform','rotate('+f(a*16)+' 235 410)');edges.forEach((edge,i)=>edge.setAttribute('stroke-dashoffset',f(-t*312+i*750)));
      scene.dataset.phase=t<4.4?'draft-loading':t<6.3?'sketch-loading':t<8.15?'image-reveal':'image-ready';
    }
    paint();
    const tl=c.gsap.timeline({paused:true});
    tl.to(clock,{time:9,duration:9,ease:'none',onUpdate:paint},0);
    tl.to(qa('.ao-first'),{opacity:0,y:-8,duration:.35,ease:'power2.inOut'},4.4).to(qa('.ao-next'),{opacity:1,y:0,duration:.42,ease:'power2.out'},4.6);
    tl.to(qa('.ao-image'),{opacity:1,clipPath:'circle(112% at 50% 55%)',filter:'blur(0px)',duration:1.85,ease:'power2.inOut'},6.3);
    tl.to(qa('.ao-underlay'),{opacity:0,duration:1.2,ease:'power2.inOut'},6.85).to(qa('.ao-status'),{opacity:0,duration:.8},7.15).to(qa('.ao-edge'),{opacity:0,duration:.8},7.3);
    tl.to(qa('.ao-reset'),{opacity:1,duration:.45},6.6);
    return {timeline:tl,duration:9};
  });
})();
