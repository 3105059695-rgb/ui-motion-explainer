/* Ilya Miskov static camera strip: two observed themes, original linked operations. */
(function(){
  'use strict';
  const duration=12;
  UIFX.register({id:'interaction-camera-strip-dual-theme',title:'相机参数条 · 亮暗联动演示',category:'interaction',duration,
    source:'https://x.com/ilyamiskov/status/2087550129976787173',referenceMedia:'https://cdn.collectui.com/media/HPh3wTJXIAALJQ9.avif',
    sourceStatus:'observed-reconstruction',sourceObservation:'static-image-observed',
    description:'亮暗两个相机参数条持续存在，镜头与ISO菜单原位展开，选择后两种主题同步更新；可作摄影、AI影像教程中的参数演示。',
    adaptationNotes:'参考是1162×880单张静态图片：浅色与深色两种条形界面，五项依次DJI MAVIC 4 PRO、28MM、F/2.5、3S、ISO800。只观察到布局/图标/值/两种主题，没有源动画或操作。横屏12秒保持两种主题，独立SVG近似图标。入场、光标、28→35MM菜单、800→640 ISO菜单和双主题联动全部是原创演示，不是原作交互复刻。数据仅示意，不证明相机设置、照片元数据、生成任务或网络调用。自定义prompt/result默认不新增猜测值，需显式focalTarget/isoTarget才能另改目标。',
    tags:['Collect UI','Command Bar','相机参数','亮暗主题','原位菜单','静态参考·原创交互'],
    params:{title:'DJI MAVIC 4 PRO',prompt:'28MM',result:'800'},paramLimits:{title:18,prompt:8,result:8}
  },function(c,p){
    const e=c.esc,clean=(v,f,n)=>Array.from(String(v||f).replace(/\s+/g,' ').trim()||f).slice(0,n).join('');
    const camera=clean(p.title,'DJI MAVIC 4 PRO',18),focal=clean(p.prompt,'28MM',8),iso=clean(p.result,'800',8);
    const focalTarget=clean(p.focalTarget,focal==='28MM'?'35MM':focal,8),isoTarget=clean(p.isoTarget,iso==='800'?'640':iso,8);
    const cameraIcon='<svg viewBox="0 0 44 44" aria-hidden="true"><defs><linearGradient id="cs16-camera-metal" x2="0" y2="1"><stop stop-color="#d9dcdf"/><stop offset="1" stop-color="#858a90"/></linearGradient></defs><path d="M7 13h8l3-4h10l3 4h7v25H7Z" fill="url(#cs16-camera-metal)" stroke="#666b70" stroke-width="1.8"/><circle cx="23" cy="25" r="9" fill="#939aa2" stroke="#555d65" stroke-width="2"/><circle cx="23" cy="25" r="5.5" fill="#6e7886"/><circle cx="35" cy="18" r="1.5" fill="#e4e7ea"/></svg>';
    const lens='<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="17" fill="#3f224c" stroke="#77717b" stroke-width="2"/><circle cx="22" cy="22" r="13" fill="#9c46b3" stroke="#d8afd6" stroke-width="2"/><circle cx="22" cy="22" r="9" fill="#4a185d"/><ellipse cx="17" cy="16" rx="6" ry="3" fill="#e8b5ef" opacity=".75" transform="rotate(-30 17 16)"/></svg>';
    const aperture='<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="17" fill="#bfc5ca" stroke="#777f87" stroke-width="1.8"/><path d="m22 6 8 15-17-1 9-14Zm8 15 8 8-8 10-9-16Zm-17-1-7 9 7 10 7-16M6 16l7 4 2-13M28 7l2 14 8-5M13 39l8-16 9 16" fill="#dce0e3" stroke="#777f87" stroke-width="1.5"/></svg>';
    const shutter='<svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="17" fill="#d5dadf" stroke="#7d8288" stroke-width="1.6"/><circle cx="22" cy="22" r="12" fill="#c34427" stroke="#f6bb72" stroke-width="3"/><path d="M22 12v10l6 3" fill="none" stroke="#fff4db" stroke-width="2.5" stroke-linecap="round"/></svg>';
    const isoIcon='<svg viewBox="0 0 44 44" aria-hidden="true"><defs><linearGradient id="cs16-iso-metal" x2="0" y2="1"><stop stop-color="#d6b224"/><stop offset="1" stop-color="#87701c"/></linearGradient></defs><rect x="6" y="6" width="32" height="32" rx="8" fill="url(#cs16-iso-metal)" stroke="#635a2f" stroke-width="1.6"/><text x="22" y="27" text-anchor="middle" fill="#f5eaa1" font-family="ProjectSans" font-size="15">ISO</text></svg>';
    const bar=theme=>`<section class="cs16-bar cs16-${theme}" aria-label="${theme==='light'?'浅':'深'}色相机参数示意"><div class="cs16-field cs16-camera">${cameraIcon}<span style="font-size:${Array.from(camera).length>12?24:29}px">${e(camera)}</span></div><div class="cs16-field cs16-focal">${lens}<span class="cs16-focal-value">${e(focal)}</span></div><div class="cs16-field cs16-aperture">${aperture}<span>F/2.5</span></div><div class="cs16-field cs16-shutter">${shutter}<span>3S</span></div><div class="cs16-field cs16-iso">${isoIcon}<span class="cs16-iso-value">${e(iso)}</span></div><div class="cs16-focus cs16-focus-focal"></div><div class="cs16-focus cs16-focus-iso"></div></section>`;
    c.root.innerHTML=`<style>
      .cs16-scene{background:#f9fafa;color:#202329;font-family:ProjectSans,sans-serif}.cs16-scene *{box-sizing:border-box}
      .cs16-dark-area{position:absolute;left:0;right:0;top:540px;bottom:0;background:radial-gradient(ellipse at 50% 15%,#191b1e,#0e1012 76%)}
      .cs16-title{position:absolute;left:180px;top:66px;color:#8a9299;font-size:24px;letter-spacing:1px;line-height:34px}.cs16-dark-label{position:absolute;left:180px;top:584px;color:#68717c;font-size:23px;line-height:34px}
      .cs16-bar{position:absolute;left:180px;width:1560px;height:108px;border:2px solid #e1e4e7;border-radius:31px;padding:0 29px;display:grid;grid-template-columns:480px 265px 245px 220px 1fr;align-items:center;box-shadow:0 18px 50px #1e324a0c}
      .cs16-light{top:238px;background:linear-gradient(#fff,#fcfcfc)}.cs16-dark{top:768px;background:linear-gradient(#15181b,#111417);border-color:#292e33;color:#b6bcc4;box-shadow:0 18px 60px #0005}
      .cs16-field{position:relative;display:flex;align-items:center;gap:17px;height:47px;padding:0 23px;min-width:0;white-space:nowrap;font-size:30px;letter-spacing:1px;font-family:ProjectSans,monospace;line-height:44px}.cs16-field:not(:last-of-type){border-right:2px solid #e4e5e7}.cs16-dark .cs16-field:not(:last-of-type){border-color:#353b43}.cs16-field svg{width:44px;height:44px;flex:none}.cs16-field span{white-space:nowrap;overflow:hidden;max-width:100%;display:block}.cs16-camera{padding-left:10px}.cs16-focal-value{font-size:${Array.from(focal).length>5?22:30}px}.cs16-iso-value{font-size:${Array.from(iso).length>5?22:30}px}
      .cs16-focus{position:absolute;top:17px;height:70px;border:2px solid #9576ba;border-radius:18px;opacity:0;pointer-events:none}.cs16-focus-focal{left:517px;width:244px}.cs16-focus-iso{left:1243px;width:286px}
      .cs16-menu{position:absolute;width:242px;padding:9px;border-radius:22px;opacity:0;visibility:hidden;box-shadow:0 15px 50px #1522391a;z-index:5}.cs16-menu-focal{left:697px;top:355px;background:#fff;border:1px solid #e0e4e8;color:#43434b}.cs16-menu-iso{left:1423px;top:512px;background:#20252b;border:1px solid #3d4650;color:#ccd4dd}
      .cs16-option{height:62px;padding:10px 20px;line-height:42px;font-size:27px;letter-spacing:1px;position:relative}.cs16-menu-selection{position:absolute;left:9px;right:9px;top:9px;height:62px;border-radius:14px;background:#f0edf6}.cs16-menu-iso .cs16-menu-selection{background:#3d364c}
      .cs16-cursor{position:absolute;left:0;top:0;z-index:8}.cs16-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:3px solid #ae89da;border-radius:50%;opacity:0;z-index:7}
      .cs16-proof{position:absolute;left:180px;right:180px;bottom:47px;text-align:center;font-size:20px;line-height:32px;color:#788393;letter-spacing:.5px}
    </style><div class="fx-scene cs16-scene"><div class="cs16-dark-area"></div><div class="cs16-title">浅色版本 · 相机参数条</div><div class="cs16-dark-label">深色版本 · 同一组示例参数</div>${bar('light')}${bar('dark')}<section class="cs16-menu cs16-menu-focal"><div class="cs16-menu-selection"></div>${[focal,focalTarget,'50MM'].map(v=>`<div class="cs16-option">${e(v)}</div>`).join('')}</section><section class="cs16-menu cs16-menu-iso"><div class="cs16-menu-selection"></div>${[iso,isoTarget,'400'].map(v=>`<div class="cs16-option">${e(v)}</div>`).join('')}</section><div class="cs16-cursor">${c.cursor()}</div><div class="cs16-ring"></div><div class="cs16-proof">静态界面参考 · 参数选择与双主题联动为原创演示 · 无真实相机调用</div></div>`;
    // SVG definitions must remain unique when light/dark variants and two diagnostics mounts coexist.
    c.qa('svg defs linearGradient').forEach((gradient,i)=>{const old=gradient.id;gradient.id=old+'-'+c.root.id+'-'+i;const svg=gradient.closest('svg');svg.querySelectorAll('[fill]').forEach(el=>{if(el.getAttribute('fill')===`url(#${old})`)el.setAttribute('fill',`url(#${gradient.id})`);});});
    const tl=c.gsap.timeline({paused:true}),ptr=c.q('.cs16-cursor'),ring=c.q('.cs16-ring');
    tl.set(c.qa('.cs16-bar'),{opacity:0,y:15},0).to(c.qa('.cs16-bar'),{opacity:1,y:0,duration:.7,ease:'power2.out',stagger:.12},0);
    tl.set(c.q('.cs16-cursor path'),{attr:{fill:'#191B23'}},0);
    tl.set(ptr,{x:1615,y:360,opacity:1},0).to(ptr,{x:819,y:278,duration:.8,ease:'power2.inOut'},1.5);c.click(tl,ptr,ring,819,278,2.4);
    tl.set(c.qa('.cs16-focal-value'),{textContent:focal},0).set(c.qa('.cs16-iso-value'),{textContent:iso},0);
    tl.set(c.qa('.cs16-focus-focal'),{opacity:0},0).to(c.qa('.cs16-focus-focal'),{opacity:.8,duration:.2},2.4);
    tl.set(c.q('.cs16-menu-focal'),{autoAlpha:0,y:-8},0).to(c.q('.cs16-menu-focal'),{autoAlpha:1,y:0,duration:.22},2.4);
    tl.to(ptr,{x:817,y:452,duration:.6,ease:'power2.inOut'},2.9).to(c.q('.cs16-menu-focal .cs16-menu-selection'),{y:62,duration:.28,ease:'power2.inOut'},3.35);c.click(tl,ptr,ring,817,452,3.9);
    tl.set(c.qa('.cs16-focal-value'),{textContent:focalTarget},4).to(c.q('.cs16-menu-focal'),{autoAlpha:0,y:-8,duration:.22},4).to(c.qa('.cs16-focus-focal'),{opacity:0,duration:.6},4.25);
    tl.to(ptr,{x:1560,y:807,duration:1.0,ease:'power2.inOut'},5.6).set(c.q('.cs16-cursor path'),{attr:{fill:'#e6e9ee'}},6.2);c.click(tl,ptr,ring,1560,807,6.8);
    tl.set(c.qa('.cs16-focus-iso'),{opacity:0},0).to(c.qa('.cs16-focus-iso'),{opacity:.8,duration:.2},6.8);
    tl.set(c.q('.cs16-menu-iso'),{autoAlpha:0,y:8},0).to(c.q('.cs16-menu-iso'),{autoAlpha:1,y:0,duration:.22},6.8);
    tl.to(ptr,{x:1540,y:612,duration:.55,ease:'power2.inOut'},7.15).to(c.q('.cs16-menu-iso .cs16-menu-selection'),{y:62,duration:.28,ease:'power2.inOut'},7.55);c.click(tl,ptr,ring,1540,612,8.1);
    tl.set(c.qa('.cs16-iso-value'),{textContent:isoTarget},8.2).to(c.q('.cs16-menu-iso'),{autoAlpha:0,y:8,duration:.22},8.2).to(c.qa('.cs16-focus-iso'),{opacity:0,duration:.65},8.45);
    tl.to(ptr,{x:1730,y:930,opacity:0,duration:.65},9.2).to({}, {duration:.001},duration-.001);
    return {timeline:tl,duration};
  });
})();
