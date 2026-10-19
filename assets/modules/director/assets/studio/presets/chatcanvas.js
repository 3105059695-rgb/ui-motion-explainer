/* Collect UI / maxleedev: selectable context, branching chat and canvas search. */
(function(){
  'use strict';
  UIFX.register({id:'interaction-chat-canvas-branch',title:'对话画布 · 从原文接出分支',category:'interaction',duration:20,
    source:'https://x.com/maxleedev/status/1989431455186063453',
    referenceMedia:'https://cdn.collectui.com/amplify_video/1989429309665062912/vid/avc1/1920x1080/IcyvUZT9XrcO-Xlw-optimized.mp4',
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'在同一张暗色画布中输入、回答、选中原文并连接两个分支；展开引用后用画布搜索返回源节点。',
    adaptationNotes:'根据36.246秒原片实际状态重建，20秒横屏重排、中文示例与光标节奏为独立编排；不包含末尾推广节点和广告尾页，不调用真实模型或搜索服务。',
    tags:['Collect UI','Chat Layout','AI Flow','Dark Mode','上下文分支','原文选区','画布搜索'],
    params:{title:'AI 对话画布',prompt:'这个画布可以做什么？',result:'两个分支，始终保留原文'}
  },function(c,p){
    const e=c.esc, title=String(p.title||'AI 对话画布'), prompt=String(p.prompt||'这个画布可以做什么？');
    if(Array.from(title).length>24||Array.from(prompt).length>32)throw Error('Canvas title must be at most 24 characters; prompt at most 32.');
    const icon=(path)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    const search=icon('M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14m5 12 6 6');
    const fork=icon('M12 20V9m0 0L6 3m6 6 6-6M6 3v6m12-6v6');
    const link=icon('m10 14 4-4m-7 5-2 2a4 4 0 0 0 6 6l4-4m2-10 2-2a4 4 0 0 0-6-6L8 8');
    const model=`<span class="mxc-grip">⠿</span><span class="mxc-model"><b>G</b> Gemini 2.5 Flash</span>`;
    const arrow=icon('M5 5v6h14m-5-5 5 5-5 5');
    const quote=text=>`<div class="mxc-quote">${arrow}<span>${e(text)}</span></div>`;
    const sourceRow=(label,cl)=>`<div class="mxc-source ${cl}"><span>◎</span><span>${e(label)}</span><small>3 条来源</small><i>⌄</i></div>`;
    c.root.innerHTML=`<style>
    .mxc-scene{color:#e8e8e8;background:radial-gradient(ellipse at 8% 80%,#3d59c4 0,transparent 33%),radial-gradient(ellipse at 90% 5%,#1457c5 0,transparent 34%),linear-gradient(145deg,#100638,#110365 39%,#081851 75%,#493e86);font-family:ProjectSans,sans-serif}
    .mxc-window{position:absolute;left:90px;top:88px;width:1740px;height:860px;background:#0c0c0e;border:2px solid #353538;border-radius:18px;overflow:hidden;box-shadow:0 30px 60px #0007}
    .mxc-toolbar{height:64px;display:flex;align-items:center;gap:10px;padding:0 20px;background:#0c0c0edc;position:relative;z-index:10;border-bottom:1px solid #222226;font-size:22px;color:#aaa}
    .mxc-tool{display:grid;place-items:center;width:42px;height:38px;border:1px solid #3d3d40;background:#1a1a1c;border-radius:9px}.mxc-tool svg{width:23px;height:23px}.mxc-saved{border:1px solid #313135;padding:6px 12px;border-radius:8px;font-size:19px}.mxc-workspace{margin-left:16px;max-width:750px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mxc-toolbar-right{margin-left:auto;display:flex;gap:10px}
    .mxc-grid{position:absolute;inset:64px 0 0;background-image:linear-gradient(#3c3c42cc 2px,transparent 2px),linear-gradient(90deg,#3c3c42cc 2px,transparent 2px);background-size:46px 46px}
    .mxc-world{position:absolute;left:0;top:64px;width:1740px;height:796px;transform-origin:50% 30%}
    .mxc-wires{position:absolute;left:0;top:0;width:1740px;height:796px;pointer-events:none}.mxc-wires path{stroke:#d3d3d6;stroke-width:2;fill:none;stroke-dasharray:1;stroke-dashoffset:1}
    .mxc-node{position:absolute;background:#171719;border:2px solid #3e3e41;border-radius:25px;box-shadow:inset 0 1px 2px #fff2,0 5px 10px #0003;overflow:visible;color:#ddd}
    .mxc-parent{left:570px;top:75px;width:600px;height:312px}.mxc-child1{left:150px;top:440px;width:640px;height:320px}.mxc-child2{left:960px;top:440px;width:640px;height:285px}
    .mxc-content{position:absolute;inset:0;border-radius:23px;overflow:hidden}.mxc-model-row{position:absolute;left:30px;top:26px;display:flex;align-items:center;gap:14px;font-size:23px}.mxc-grip{color:#85858a;font-size:27px;line-height:28px}.mxc-model{border:1px solid #424245;border-radius:9px;padding:5px 10px;display:flex;gap:8px;align-items:center;white-space:nowrap}.mxc-model b{font:700 25px ProjectDisplay,sans-serif;background:conic-gradient(#4285f4,#34a853,#fbbc05,#ea4335,#4285f4);background-clip:text;color:transparent}.mxc-add,.mxc-chain{display:grid;place-items:center;width:35px;height:35px;border:1px solid #454549;border-radius:9px;font-size:29px;color:#a2a2a7}.mxc-chain svg{width:25px;height:25px}
    .mxc-question{position:absolute;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;left:32px;right:32px;top:88px;font-size:27px;line-height:36px;min-height:36px}.mxc-caret{display:inline-block;width:2px;height:29px;background:#ddd;vertical-align:-5px;margin-left:2px}.mxc-placeholder{position:absolute;left:0;top:0;color:#6d6d73}
    .mxc-source{position:absolute;left:32px;right:32px;top:136px;height:38px;border:1px solid #37373b;border-radius:9px;display:flex;align-items:center;gap:11px;padding:0 14px;font-size:19px;color:#ababaf}.mxc-source small{font-size:16px;margin-left:auto;white-space:nowrap}.mxc-source i{font-style:normal;color:#bbb}.mxc-parent-answer{position:absolute;left:32px;right:32px;top:192px;font-size:26px;line-height:37px}.mxc-parent-answer>div{white-space:nowrap}.mxc-word{border-radius:3px;background:transparent}
    .mxc-plus{position:absolute;left:618px;top:218px;width:42px;height:42px;background:#ededed;color:#303035;border:1px solid #bfbfc2;border-radius:10px;font-size:30px;display:grid;place-items:center}.mxc-node-bottom{position:absolute;top:calc(100% - 1px);left:calc(50% - 74px);display:flex;gap:8px}.mxc-node-bottom span{width:70px;height:44px;display:grid;place-items:center;background:#e7e7e7;border:1px solid #c1c1c5;border-radius:28px;color:#363639;font-size:27px}.mxc-node-bottom svg{width:23px;height:23px}
    .mxc-quote{height:54px;margin:8px 8px 0;padding:0 20px;display:flex;align-items:center;gap:13px;background:#252527;border-radius:16px 16px 4px 4px;font-size:21px;color:#aaa}.mxc-quote svg{width:25px;height:25px}
    .mxc-child1 .mxc-model-row,.mxc-child2 .mxc-model-row{top:77px}.mxc-child1 .mxc-question,.mxc-child2 .mxc-question{top:129px;font-size:26px}.mxc-child1 .mxc-source{top:176px}.mxc-child-answer{position:absolute;left:32px;right:32px;top:228px;font-size:26px;line-height:34px;white-space:pre-line}.mxc-child2 .mxc-child-answer{top:185px}
    .mxc-references{position:absolute;top:214px;left:32px;right:32px;height:84px;overflow:hidden;font-size:20px;background:#151516;border:1px solid #343439;border-top:0;border-radius:0 0 9px 9px;color:#bbb}.mxc-ref{height:28px;padding:0 12px;display:flex;gap:10px;align-items:center}.mxc-ref b{font-size:17px;font-weight:500;width:20px;color:#a89bf4}.mxc-ref small{margin-left:auto;font-size:16px;color:#717177}
    .mxc-mini{position:absolute;transform:scale(.72);transform-origin:100% 100%;right:18px;bottom:18px;width:160px;height:112px;background:#171719cf;border:1px solid #333337;border-radius:10px}.mxc-mini span{position:absolute;background:#aaaab0}.mxc-mini-main{left:60px;top:23px;width:40px;height:22px}.mxc-mini-a{left:22px;top:71px;width:46px;height:25px}.mxc-mini-b{left:94px;top:71px;width:46px;height:25px}.mxc-mini svg{position:absolute;inset:0;width:160px;height:112px}
    .mxc-search-panel{position:absolute;left:560px;top:145px;width:800px;height:238px;background:#151517;border:1px solid #434349;border-radius:18px;box-shadow:0 22px 50px #0009;z-index:30;overflow:hidden}.mxc-search-input{height:68px;display:flex;align-items:center;gap:15px;padding:0 24px;border-bottom:1px solid #303035;font-size:28px}.mxc-search-input svg{width:24px;height:24px;color:#a2a2aa}.mxc-search-input small{margin-left:auto;font-size:19px;color:#aaa;border:1px solid #34343a;border-radius:7px;padding:4px 9px}.mxc-search-row{margin:10px;padding:12px 18px;background:#222225;border:1px solid #333339;border-radius:10px;height:108px;font-size:24px;line-height:34px}.mxc-search-row mark{background:#57563d;color:#fff}.mxc-search-row small{display:block;font-size:20px;color:#a6a6ac;white-space:nowrap}.mxc-search-help{padding:0 26px;font-size:17px;color:#808088;word-spacing:10px}
    .mxc-key{position:absolute;left:840px;top:930px;width:240px;height:76px;display:flex;justify-content:center;align-items:center;background:#08080be8;border:2px solid #44444a;border-radius:24px;color:#dadade;font-size:33px;z-index:40}.mxc-caption{position:absolute;top:980px;left:230px;right:230px;text-align:center;font-size:28px;color:#d6d4e8}.mxc-proof{position:absolute;bottom:22px;left:0;right:0;text-align:center;font-size:17px;color:#aaa7c3}
    </style><div class="fx-scene mxc-scene"><div class="mxc-window"><div class="mxc-toolbar"><span class="mxc-tool">☰</span><span class="mxc-saved">♧ Saved</span><span class="mxc-workspace">${e(title)}</span><div class="mxc-toolbar-right"><span class="mxc-tool">${link}</span><span class="mxc-tool">${search}</span><span class="mxc-tool">⌨</span><span class="mxc-tool">⚙</span></div></div><div class="mxc-grid"></div>
    <div class="mxc-world"><svg class="mxc-wires" viewBox="0 0 1740 796"><path class="mxc-wire1" pathLength="1" d="M870 387 C870 415 470 404 470 440"/><path class="mxc-wire2" pathLength="1" d="M870 387 C870 415 1280 404 1280 440"/></svg>
    <div class="mxc-node mxc-parent"><div class="mxc-content"><div class="mxc-model-row">${model}<span class="mxc-add">+</span><span class="mxc-chain">${link}</span></div><div class="mxc-question"><span class="mxc-placeholder">Enter a prompt...</span><span class="mxc-input"></span><i class="mxc-caret"></i></div>${sourceRow('工作台文档','mxc-parent-source')}<div class="mxc-parent-answer"><div>在同一张画布上，保留上下文。</div><div>选中原文，<span class="mxc-word mxc-select1">分支追问</span>，也可<span class="mxc-word mxc-select2">并行比较</span>。</div></div></div><div class="mxc-plus">+</div><div class="mxc-node-bottom"><span>${fork}</span><span>+</span></div></div>
    <div class="mxc-node mxc-child1"><div class="mxc-content">${quote('分支追问')}<div class="mxc-model-row">${model}</div><div class="mxc-question"><span class="mxc-input1"></span></div>${sourceRow('上下文与引用关系','mxc-child-source')}<div class="mxc-references"><div class="mxc-ref"><b>◎</b> 原文、选区与上下文<small>文档示例</small></div><div class="mxc-ref"><b>◉</b> 从回答接出新的问题<small>文档示例</small></div><div class="mxc-ref"><b>×</b> 在画布中回到原文<small>文档示例</small></div></div><div class="mxc-child-answer mxc-answer1"></div></div></div>
    <div class="mxc-node mxc-child2"><div class="mxc-content">${quote('并行比较')}<div class="mxc-model-row">${model}</div><div class="mxc-question"><span class="mxc-input2"></span></div><div class="mxc-child-answer mxc-answer2"></div></div></div></div>
    <div class="mxc-mini"><svg viewBox="0 0 160 112"><path d="M80 45V54L45 71M80 54 116 71" stroke="#68686c" fill="none"/></svg><span class="mxc-mini-main"></span><span class="mxc-mini-a"></span><span class="mxc-mini-b"></span></div></div>
    <div class="mxc-search-panel"><div class="mxc-search-input">${search}<span class="mxc-search-value"></span><small>Both</small></div><div class="mxc-search-row"><div>选中原文，<mark>分支</mark>追问</div><small>在同一张画布上，保留上下文。</small></div><div class="mxc-search-help">⌘F Search　↑↓ Navigate　Enter Select　Esc Close</div></div><div class="mxc-key">Enter</div><div class="mxc-caption">${e(p.result||'两个分支，始终保留原文')}</div><div class="mxc-proof">界面机制示意 · 代码重建 · 未调用真实模型或搜索</div><div class="fx-click-ring"></div>${c.cursor()}</div>`;
    const q=c.q, qa=c.qa, tl=c.gsap.timeline({paused:true}), ptr=q('.fx-cursor'), ring=q('.fx-click-ring');
    tl.set(ptr,{x:1540,y:875,opacity:0,scale:1},0).set(ring,{opacity:0,x:1515,y:850,scale:.3},0)
      .set(q('.mxc-parent'),{height:178,y:150,borderColor:'#3e3e41'},0)
      .set(qa('.mxc-child1,.mxc-child2,.mxc-wire1,.mxc-wire2,.mxc-plus,.mxc-node-bottom,.mxc-parent-source,.mxc-parent-answer,.mxc-child-source,.mxc-references,.mxc-mini-a,.mxc-mini-b,.mxc-mini svg,.mxc-search-panel,.mxc-key,.mxc-caption,.mxc-caret'),{opacity:0},0)
      .set(qa('.mxc-child1,.mxc-child2'),{y:24,scale:.97,transformOrigin:'50% 0%'},0)
      .set(q('.mxc-world'),{y:0,opacity:1},0).set(q('.mxc-answer1'),{y:0},0)
      .set(qa('.mxc-word'),{backgroundColor:'transparent',color:'#ddd'},0)
      .set(q('.mxc-search-value'),{textContent:''},0);
    tl.to(ptr,{x:735,y:475,opacity:1,duration:.65,ease:'power2.out'},.45);
    c.click(tl,ptr,ring,735,475,1.1);
    tl.set(q('.mxc-placeholder'),{opacity:0},1.2).set(q('.mxc-caret'),{opacity:1},1.2);
    c.text(tl,q('.mxc-input'),prompt,1.2,1.2);
    tl.to(q('.mxc-key'),{opacity:1,duration:.15},2.45).to(q('.mxc-key'),{opacity:0,duration:.25},2.9)
      .set(q('.mxc-caret'),{opacity:0},2.8)
      .to(q('.mxc-parent'),{height:312,y:0,duration:.8,ease:'power3.inOut'},2.8)
      .to(q('.mxc-parent-source'),{opacity:1,duration:.3},3.5)
      .to(q('.mxc-parent-answer'),{opacity:1,duration:.7},3.9)
      .to(ptr,{x:820,y:468,duration:.55,ease:'power2.inOut'},4.8)
      .to(ptr,{x:930,y:468,duration:.5,ease:'none'},5.35)
      .to(q('.mxc-select1'),{backgroundColor:'#486a8c',color:'#fff',duration:.5},5.35)
      .to(q('.mxc-plus'),{opacity:1,duration:.2},5.85)
      .to(ptr,{x:1303,y:470,duration:.38,ease:'power2.out'},5.95);
    c.click(tl,ptr,ring,1303,470,6.35);
    tl.to(q('.mxc-plus'),{opacity:0,duration:.2},6.5).to(q('.mxc-select1'),{backgroundColor:'transparent',color:'#ddd',duration:.3},6.5)
      .to(q('.mxc-wire1'),{opacity:1,strokeDashoffset:0,duration:.65,ease:'power2.out'},6.5)
      .to(q('.mxc-child1'),{opacity:1,y:0,scale:1,duration:.65,ease:'power3.out'},6.6)
      .to(q('.mxc-node-bottom'),{opacity:1,duration:.2},6.65)
      .to(q('.mxc-mini-a'),{opacity:1,duration:.25},6.7);
    c.text(tl,q('.mxc-input1'),'分支时会保留哪些信息？',7.15,.9);
    tl.to(q('.mxc-child-source'),{opacity:1,duration:.25},8.2);
    c.text(tl,q('.mxc-answer1'),'这条分支保留被选中的原文。\n你可以继续提问，并回到源节点。',8.55,.75);
    tl.to(ptr,{x:1008,y:468,duration:.5,ease:'power2.inOut'},9.35)
      .to(ptr,{x:1112,y:468,duration:.45,ease:'none'},9.85)
      .to(q('.mxc-select2'),{backgroundColor:'#486a8c',color:'#fff',duration:.45},9.85)
      .to(q('.mxc-plus'),{opacity:1,duration:.18},10.3)
      .to(ptr,{x:1303,y:470,duration:.28},10.35);
    c.click(tl,ptr,ring,1303,470,10.65);
    tl.to(q('.mxc-plus'),{opacity:0,duration:.2},10.8).to(q('.mxc-select2'),{backgroundColor:'transparent',color:'#ddd',duration:.3},10.8)
      .to(q('.mxc-wire2'),{opacity:1,strokeDashoffset:0,duration:.65,ease:'power2.out'},10.8)
      .to(q('.mxc-child2'),{opacity:1,y:0,scale:1,duration:.6,ease:'power3.out'},10.9)
      .to(qa('.mxc-mini-b,.mxc-mini svg'),{opacity:1,duration:.2},11);
    c.text(tl,q('.mxc-input2'),'可以同时尝试不同方向吗？',11.5,.8);
    c.text(tl,q('.mxc-answer2'),'把同一句原文接成两个问题。\n两个回答会在这张画布上保留。',12.55,.85);
    tl.to(ptr,{x:808,y:787,duration:.55,ease:'power2.inOut'},13.5);
    c.click(tl,ptr,ring,808,787,14.1);
    tl.to(q('.mxc-world'),{y:-85,duration:.7,ease:'power3.inOut'},14.2)
      .to(q('.mxc-child1'),{height:404,duration:.65,ease:'power3.inOut'},14.2)
      .to(q('.mxc-answer1'),{y:84,duration:.65,ease:'power3.inOut'},14.2)
      .to(q('.mxc-references'),{opacity:1,duration:.45},14.4)
      .set(q('.mxc-child-source i'),{textContent:'⌃'},14.35)
      .to(ptr,{x:826,y:660,duration:.4},14.3)
      .set(q('.mxc-key'),{textContent:'⌘ F'},16.0)
      .to(q('.mxc-key'),{opacity:1,duration:.15},16.0)
      .to(q('.mxc-world'),{opacity:.5,duration:.25},16.15)
      .to(q('.mxc-search-panel'),{opacity:1,duration:.3},16.15);
    c.text(tl,q('.mxc-search-value'),'分支',16.6,.45);
    tl.to(q('.mxc-key'),{opacity:0,duration:.25},16.8)
      .to(ptr,{x:835,y:272,duration:.6,ease:'power2.inOut'},17.25);
    c.click(tl,ptr,ring,835,272,17.9);
    tl.to(q('.mxc-search-panel'),{opacity:0,duration:.3},18)
      .to(q('.mxc-child1'),{height:320,duration:.55,ease:'power3.inOut'},18)
      .to(q('.mxc-answer1'),{y:0,duration:.55,ease:'power3.inOut'},18)
      .to(q('.mxc-references'),{opacity:0,duration:.3},18)
      .set(q('.mxc-child-source i'),{textContent:'⌄'},18.1)
      .to(q('.mxc-world'),{opacity:1,y:0,duration:.65,ease:'power3.inOut'},18)
      .to(q('.mxc-parent'),{borderColor:'#a1a08a',duration:.25},18.35)
      .to(ptr,{opacity:0,duration:.3},18.5)
      .to(q('.mxc-caption'),{opacity:1,duration:.4},18.8)
      .to(q('.mxc-parent'),{borderColor:'#3e3e41',duration:.4},19.1);
    tl.to({}, {duration:.01},19.99);
    return {timeline:tl,duration:20};
  });
})();
