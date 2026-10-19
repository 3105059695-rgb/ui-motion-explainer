/* Chmiel: observed expanding icon rail; all vectors are independently drawn. */
(function(){
  'use strict';
  const outline={
    search:'<circle cx="27" cy="27" r="17"/><path d="m40 40 15 15"/>',
    home:'<path d="m10 29 22-19 22 19v25H39V39H25v15H10Z"/>',
    strategies:'<circle cx="32" cy="32" r="23"/><path d="M39 29a7 7 0 1 0-14 0c0 3 2 5 4 6v11h6V35c2-1 4-3 4-6Z"/>',
    campaigns:'<path d="M21 10h22 M16 19h32 M10 29h44l-6 24H16Z"/>',
    chats:'<path d="M37 22A19 19 0 0 0 9 39l-3 8 10-2 M53 53l4 7-10-2a15 15 0 1 1 6-5Z"/>'
  };
  const solid={
    search:'<circle cx="27" cy="27" r="22" fill="currentColor"/><circle cx="27" cy="27" r="15" fill="white"/><circle cx="27" cy="27" r="10" fill="currentColor"/><path d="m42 42 13 13" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>',
    home:'<path d="m6 27 22-19q4-3 8 0l22 19v27q0 5-5 5H40V40H24v19H11q-5 0-5-5Z" fill="currentColor"/>',
    strategies:'<circle cx="32" cy="32" r="28" fill="currentColor"/><path d="M40 29a8 8 0 1 0-16 0c0 3 2 6 5 7v11a3 3 0 0 0 6 0V36c3-1 5-4 5-7Z" fill="white"/>',
    campaigns:'<path d="M22 9h20 M17 18h30" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M8 27h48l-6 28H14Z" fill="currentColor"/><path d="M14 33h36l-2 7H16Z" fill="white"/>',
    chats:'<path d="M40 23A23 23 0 0 0 7 45l-3 11 15-4a23 23 0 0 0 13-1Z" fill="currentColor"/><path d="M59 50a18 18 0 1 0-7 11l11 2-4-10Z" fill="currentColor" stroke="white" stroke-width="3"/>'
  };
  const icon=(key,active)=>`<svg class="cs-icon ${active?'cs-solid':'cs-outline'}" viewBox="0 0 64 64" aria-hidden="true" ${active?'':'fill="none" stroke="currentColor" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"'}>${(active?solid:outline)[key]}</svg>`;
  UIFX.register({
    id:'interaction-sidebar-hover-expand-select',title:'图标侧栏 · 悬停展开与选中保留',category:'interaction',duration:32,
    source:'https://x.com/chmielwork/status/2095985427253477424',referenceMedia:'https://cdn.collectui.com/amplify_video/2095985383322394628/vid/avc1/1322x1322/lkZ4dtgjF4BMQxYp-optimized.mp4',sourceStatus:'observed-reconstruction',sourceObservation:'video-paused-frames',
    description:'同一白色工作区中，五项图标导航随光标展开名称，点击后切换实心图标并保留当前入口名称，再连续返回首页。',
    adaptationNotes:'依据1322×1322、25.383333秒原片的真实暂停解码帧保留 Search、Home、Strategies、Campaigns、Chats 与完整留白区域。独立SVG重画图标；横屏32秒保留悬停、点击、离开及往返阅读。未观察正文和真实服务，未添加业务结果。参数只编辑导航名称。',
    tags:['Collect UI','Menu','Sidebar','Hover State','Navigation','展开标签','选中保留'],
    params:{title:'Home',prompt:'Campaigns',result:'Chats'},paramLimits:{title:20,prompt:24,result:20}
  },function(c,p){
    const e=c.esc,clean=(v,f,n)=>Array.from(String(v||f).replace(/\s+/g,' ').trim()||f).slice(0,n).join('');
    const labels={search:'Search',home:clean(p.title,'Home',20),strategies:'Strategies',campaigns:clean(p.prompt,'Campaigns',24),chats:clean(p.result,'Chats',20)};
    const keys=Object.keys(labels),ys={search:290,home:433,strategies:576,campaigns:719,chats:862};
    c.root.innerHTML=`<style>
      .cs-scene{background:#fff;color:#080808;font-family:ProjectSans,Arial,sans-serif;overflow:hidden}
      .cs-workspace{position:absolute;inset:0;background:#fff}
      .cs-rail{position:absolute;left:325px;top:232px;width:1100px;height:710px}
      .cs-row{position:absolute;left:0;height:116px;display:flex;align-items:center;gap:25px;width:max-content;min-width:116px;padding:0 40px 0 25px;box-sizing:border-box;color:#90918f}
      .cs-row:nth-child(1){top:0}.cs-row:nth-child(2){top:143px}.cs-row:nth-child(3){top:286px}.cs-row:nth-child(4){top:429px}.cs-row:nth-child(5){top:572px}
      .cs-pill{position:absolute;inset:0;border-radius:70px;background:#f3f3f2;clip-path:inset(0 100% 0 0 round 70px);opacity:0}
      .cs-icon-wrap{position:relative;z-index:1;width:64px;height:64px;flex:0 0 64px}
      .cs-icon{position:absolute;inset:0;width:64px;height:64px;overflow:visible}
      .cs-solid{opacity:0;color:#070707}.cs-label{position:relative;z-index:1;font:48px/1.2 ProjectDisplay,ProjectSans,Arial,sans-serif;white-space:nowrap;opacity:0;transform:translateX(-14px);color:#070707}
      .cs-row-home .cs-solid{opacity:1}.cs-row-home .cs-outline{opacity:0}.cs-row-home .cs-label{opacity:1;transform:translateX(0)}
      .cs-scene .fx-cursor{z-index:20}.cs-scene .fx-click-ring{z-index:19}
    </style><div class="fx-scene cs-scene" data-phase="home-selected"><main class="cs-workspace" aria-label="五项导航工作区"><nav class="cs-rail" aria-label="主导航">${keys.map(key=>`<div class="cs-row cs-row-${key}" data-key="${key}"><div class="cs-pill"></div><span class="cs-icon-wrap">${icon(key,false)}${icon(key,true)}</span><span class="cs-label">${e(labels[key])}</span></div>`).join('')}</nav></main>${c.cursor()}<div class="fx-click-ring"></div></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true}),scene=q('.cs-scene'),ptr=q('.fx-cursor'),ring=q('.fx-click-ring');
    let selected='home',hovered=null,previousPhase='home-selected';
    function phase(value,at){tl.fromTo(scene,{attr:{'data-phase':previousPhase}},{attr:{'data-phase':value},duration:0,immediateRender:false},at);previousPhase=value;}
    function move(x,y,at,d=.55){tl.to(ptr,{x,y,opacity:1,duration:d,ease:'power2.inOut'},at);}
    function render(at){keys.forEach(key=>{const row=q('.cs-row-'+key),active=key===selected,over=key===hovered,shown=active||over;tl.to(row,{color:over?'#070707':'#90918f',duration:.22},at);tl.to(row.querySelector('.cs-outline'),{opacity:active?0:1,duration:.22},at);tl.to(row.querySelector('.cs-solid'),{opacity:active?1:0,duration:.22},at);tl.to(row.querySelector('.cs-label'),{opacity:shown?1:0,x:shown?0:-14,duration:.32,ease:'power2.out'},at);tl.to(row.querySelector('.cs-pill'),{opacity:over?1:0,clipPath:over?'inset(0 0% 0 0 round 70px)':'inset(0 100% 0 0 round 70px)',duration:.35,ease:'power2.inOut'},at);});}
    function hover(key,at){hovered=key;render(at);phase(key?key+'-hover':selected+'-selected',at);}
    function select(key,at){selected=key;render(at);phase(key+'-selected',at);}
    function click(key,at){c.click(tl,ptr,ring,386,ys[key],at);select(key,at+.16);}
    tl.set(ptr,{x:1060,y:405,opacity:1,scale:1},0).set(ring,{opacity:0,scale:.3},0);
    move(452,433,.7,.8);hover('home',1.53);
    move(386,576,2.8,.6);hover('strategies',3.42);
    move(386,719,4.7,.6);hover('campaigns',5.32);
    move(386,862,6.6,.6);hover('chats',7.22);
    move(1030,884,8.5,.7);hover(null,8.63);
    move(386,433,9.6,.7);hover('home',10.32);
    move(386,576,11.35,.55);hover('strategies',11.92);click('strategies',12.7);
    move(1005,576,13.7,.65);hover(null,13.82);
    move(386,719,14.6,.6);hover('campaigns',15.22);click('campaigns',16.05);
    move(386,862,17.2,.55);hover('chats',17.77);click('chats',18.65);
    move(998,894,19.6,.65);hover(null,19.72);
    move(386,290,20.8,.75);hover('search',21.57);click('search',22.35);
    move(1000,290,23.3,.55);hover(null,23.42);
    move(386,719,24.25,.7);hover('campaigns',24.97);click('campaigns',25.75);
    move(386,576,26.55,.55);hover('strategies',27.12);click('strategies',27.65);
    move(386,433,28.05,.55);hover('home',28.62);click('home',29.35);
    move(1005,431,30.3,.65);hover(null,30.42);tl.to({},{duration:.01},31.99);
    return {timeline:tl,duration:32};
  });
})();
