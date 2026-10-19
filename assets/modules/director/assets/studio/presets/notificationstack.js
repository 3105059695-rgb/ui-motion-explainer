/* Notification deck: observed hover/cycle/dismiss mechanism, independent CSS/SVG. */
(function(){
  'use strict';
  const svg=(kind)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${kind==='close'?'<path d="m7 7 10 10M17 7 7 17"/>':kind==='bell'?'<path d="M6 10a6 6 0 0 1 12 0c0 5 2 5 2 7H4c0-2 2-2 2-7ZM10 20h4"/>':'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'}</svg>`;
  UIFX.register({
    id:'interaction-notification-stack-cycle',title:'通知堆栈 · 悬停轮换与关闭',category:'interaction',duration:26,
    source:'https://x.com/raunofreiberg/status/2098476550635085917',referenceMedia:'https://cdn.collectui.com/amplify_video/2098475272345645056/vid/avc1/2520x1860/dI_dFMXFx7WG8Ny6-optimized.mp4',sourceStatus:'observed-reconstruction',sourceObservation:'video-paused-frames',
    description:'在同一浅色侧栏底部，悬停露出下一条通知标题，点击后层标题连续轮换四条，离开后收拢，关闭按钮让通知区退出。',
    adaptationNotes:'源2520×1860、11.433333秒，16个真实paused/readyState4/rVFC匹配帧。保留浅灰两栏容器、空白主区域、四通知叠层、头像/账号/更多/铃铛。独立CSS/SVG改成1920×1080，26秒增加阅读停留；文案和头像原创，源商业优惠不作为真实当前信息。源未展示CTA、铃铛或更多操作结果，不增加业务结果或AI执行。',
    tags:['Collect UI','Notification','Stack','Hover','Continuous interaction'],
    params:{title:'Workspace update',prompt:'Explore what is new in your workspace.',result:'Read update'},paramLimits:{title:20,prompt:48,result:18}
  },function(c,p){
    const clean=(v,f,n)=>Array.from(String(v??f).replace(/\s+/g,' ').trim()||f).slice(0,n).join('');
    const title=clean(p.title,'Workspace update',20),body=clean(p.prompt,'Explore what is new in your workspace.',48),action=clean(p.result,'Read update',18);
    const cards=[{title,body,action},{title:'Explore your project',body:'Review recent deployments and see how your project performs.',action:'Explore project'},{title:'Observability Plus',body:'Deeper traces and more history, together in one view.',action:'View details'},{title:'Ship 26',body:'Meet the makers and discover the next wave of projects.',action:'Explore event'}];
    const weighted=s=>Array.from(s).reduce((n,ch)=>n+(ch.charCodeAt(0)<256?.55:1),0);
    c.root.innerHTML=`<style>
      .nt-scene{background:#eaeaea;color:#171717;font-family:ProjectSans,Arial,sans-serif;overflow:hidden}
      .nt-label{position:absolute;left:256px;top:62px;color:#737373;font-size:17px;letter-spacing:.5px}.nt-label span{color:#999;margin-left:16px;font-size:14px}
      .nt-window{position:absolute;left:256px;top:108px;width:1408px;height:864px;border:1px solid #d9d9d9;border-radius:32px;background:#fafafa;overflow:hidden;box-shadow:0 1px 3px #00000003}
      .nt-sidebar{position:absolute;inset:0 auto 0 0;width:554px;border-right:1px solid #d5d5d5;background:#fafafa}.nt-main{position:absolute;left:554px;right:0;top:0;bottom:0;background:#fafafa}
      .nt-deck{position:absolute;left:18px;top:484px;width:516px;height:280px;perspective:1000px}
      .nt-card{position:absolute;inset:0;width:516px;height:280px;background:#fff;border:1px solid #d6d6d6;border-radius:26px;padding:25px 27px;box-shadow:0 8px 15px #00000004;transform-origin:center bottom;overflow:hidden}
      .nt-title{position:relative;margin:0;padding-right:43px;font-size:27px;font-weight:550;line-height:1.38;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nt-title.nt-wide{font-size:20px}
      .nt-card[data-depth="rear"] .nt-title{color:#707070;font-weight:450}.nt-card[data-depth="rear"] .nt-close{visibility:hidden}.nt-body{font-size:27px;font-weight:400;line-height:1.48;margin-top:16px!important;width:455px;min-height:88px;overflow-wrap:anywhere}.nt-body.nt-wide{font-size:23px}
      .nt-action{position:absolute;left:27px;right:27px;bottom:26px;height:64px;border:0;border-radius:14px;background:#161616;color:white;display:grid;place-items:center;font-size:26px;font-weight:430;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nt-action.nt-wide{font-size:23px}
      .nt-close{position:absolute;right:23px;top:22px;width:43px;height:43px;border:0;border-radius:50%;color:#303030;display:grid;place-items:center;background:transparent}.nt-close svg{width:27px;height:27px}.nt-close-glow{position:absolute;right:23px;top:22px;width:43px;height:43px;border-radius:50%;background:#ebebeb;opacity:0;pointer-events:none}.nt-close{z-index:2}
      .nt-footer{position:absolute;left:34px;right:22px;bottom:17px;height:62px;display:flex;align-items:center;gap:17px;font-size:28px}.nt-avatar{width:45px;height:45px;border-radius:50%;background:#deeaeb;overflow:hidden;flex:none}.nt-avatar svg{width:45px;height:45px}.nt-person{font-weight:430}.nt-tools{margin-left:auto;display:flex;gap:14px}.nt-tool{width:50px;height:50px;border-radius:50%;border:1px solid #e3e3e3;background:#fff;box-shadow:0 1px 4px #00000005;display:grid;place-items:center;color:#333}.nt-tool svg{width:29px;height:29px}
      .nt-scene .fx-cursor{width:30px;height:37px;z-index:40}.nt-ring{position:absolute;left:0;top:0;width:50px;height:50px;border:2px solid #5c5c5c;border-radius:50%;pointer-events:none;z-index:39;opacity:0}.nt-proof{position:absolute;right:256px;bottom:47px;font-size:14px;color:#989898}
    </style><div translate="no" class="fx-scene nt-scene" data-phase="compact"><div class="nt-label">Notifications<span>Interaction demo</span></div><div class="nt-window"><div class="nt-main"></div><aside class="nt-sidebar"><div class="nt-deck">${cards.map((d,i)=>`<article class="nt-card" data-card="${i}" data-depth="${i?'rear':'front'}"><h2 class="nt-title ${weighted(d.title)>18?'nt-wide':''}">${c.esc(d.title)}</h2><p class="nt-body ${weighted(d.body)>34?'nt-wide':''}">${c.esc(d.body)}</p><div class="nt-close-glow"></div><span class="nt-close" data-target="close-${i}">${svg('close')}</span><div class="nt-action ${weighted(d.action)>16?'nt-wide':''}">${c.esc(d.action)}</div></article>`).join('')}</div><footer class="nt-footer"><div class="nt-avatar"><svg viewBox="0 0 45 45" aria-hidden="true"><path d="M-4 38Q10 21 49 38V49H-4" fill="#527879"/><circle cx="23" cy="20" r="8" fill="#adc3c0"/><path d="M16 19c0-13 15-12 15 0l-4-5-11 5" fill="#527879"/><path d="M14 45v-9c0-11 19-11 19 0v9" fill="#274a50"/></svg></div><span class="nt-person">Alex</span><div class="nt-tools"><span class="nt-tool">${svg('more')}</span><span class="nt-tool">${svg('bell')}</span></div></footer></aside></div><div class="nt-proof">Editable UI study</div>${c.cursor()}<div class="nt-ring"></div></div>`;
    const tl=c.gsap.timeline({paused:true}),els=c.qa('.nt-card'),cursor=c.q('.fx-cursor'),ring=c.q('.nt-ring'),scene=c.q('.nt-scene'),deck=c.q('.nt-deck');
    const compact=[{x:0,y:0,scale:1,opacity:1,zIndex:8},{x:0,y:-18,scale:.95,opacity:1,zIndex:6},{x:0,y:-36,scale:.91,opacity:1,zIndex:4},{x:0,y:-50,scale:.87,opacity:1,zIndex:2}];
    let state=compact.map(v=>({...v})),order=[0,1,2,3],phase='compact';
    tl.set(cursor,{x:1470,y:585,scale:1,rotation:0,opacity:1},0).set(ring,{x:0,y:0,scale:.3,opacity:0},0).set(deck,{x:0,y:0,scale:1,opacity:1},0);
    els.forEach((el,i)=>tl.set(el,{...state[i],rotation:0,rotationX:0,rotationY:0},0));tl.set(c.qa('.nt-close-glow'),{opacity:0},0);
    function mark(next,at){tl.fromTo(scene,{attr:{'data-phase':phase}},{attr:{'data-phase':next},duration:0,immediateRender:false},at);phase=next;}
    function move(i,next,at,d=.55){tl.fromTo(els[i],state[i],{...next,duration:d,ease:'power3.out',immediateRender:false},at);state[i]={...next};}
    function peek(at){order.slice(1).forEach((i,d)=>move(i,{x:0,y:[-80,-98,-111][d],scale:[.94,.90,.87][d],opacity:1,zIndex:[6,4,2][d]},at));mark('peek-'+order[0],at);}
    function cycle(at){const old=order.shift();order.push(old);const front=order[0];c.click(tl,cursor,ring,644,566,at);move(old,{...state[old],y:58,scale:.90,opacity:0},at,.22);move(old,{x:0,y:-111,scale:.87,opacity:1,zIndex:2},at+.24,.10);order.slice(0,3).forEach((i,d)=>move(i,{x:0,y:[0,-80,-98][d],scale:[1,.94,.90][d],opacity:1,zIndex:[8,6,4][d]},at+.08,.56));
      tl.fromTo(els[old],{attr:{'data-depth':'front'}},{attr:{'data-depth':'rear'},duration:0,immediateRender:false},at+.23);tl.fromTo(els[front],{attr:{'data-depth':'rear'}},{attr:{'data-depth':'front'},duration:0,immediateRender:false},at+.09);mark('front-'+front,at+.1);}
    tl.to(cursor,{x:644,y:566,duration:.8,ease:'power2.inOut'},2.7);peek(3.45);
    cycle(6.35);cycle(9.65);cycle(12.95);cycle(16.25);
    tl.to(cursor,{x:680,y:676,duration:.7,ease:'power2.inOut'},18.75);order.slice(1).forEach((i,d)=>move(i,{...compact[d+1]},19.1));mark('compact-restored',19.1);
    tl.to(cursor,{x:755,y:636,duration:.65,ease:'power2.inOut'},21);order.slice(1).forEach(i=>move(i,{...state[i],y:0,opacity:0,scale:.98},21.4,.28));tl.fromTo(c.q('.nt-close-glow'),{opacity:0},{opacity:1,duration:.22,immediateRender:false},21.4);mark('close-hover',21.4);
    c.click(tl,cursor,ring,755,636,22.5);tl.fromTo(deck,{x:0,y:0,scale:1,opacity:1},{x:0,y:48,scale:.98,opacity:0,duration:.45,ease:'power3.in',immediateRender:false},22.57);mark('dismissed',23.02);tl.to(cursor,{x:902,y:648,duration:.6,ease:'power2.out'},23.2);tl.to({}, {duration:.01},25.99);
    return {timeline:tl,duration:26};
  });
})();
