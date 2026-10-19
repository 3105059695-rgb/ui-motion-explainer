/* Ayda video-fragment reconstruction. Inspection timing and vector artwork are original. */
(function () {
  'use strict';
  const defaults = {
    title: 'Resume Review',
    prompt: 'Describe your goal and AI will build the instructions...'
  };
  const paths = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    arrow: '<path d="M12 20V4m-6 6 6-6 6 6"/>',
    rerun: '<path d="M4 10a8 8 0 1 1 1 8M4 4v6h6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    link: '<path d="m9 15 6-6M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 2 1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0)"/>',
    down: '<path d="m7 10 5 5 5-5"/>',
    sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"/>',
    warning: '<path d="M12 7v6M12 17h.01"/><circle cx="12" cy="12" r="10"/>'
  };
  const icon = (name, size = 22) => '<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
  const slack = size => '<svg width="'+size+'" height="'+size+'" viewBox="0 0 40 40" aria-hidden="true"><g><rect x="5" y="17" width="14" height="6" rx="3" fill="#36b8c8"/><rect x="13" y="5" width="6" height="14" rx="3" fill="#2ab389"/><rect x="21" y="17" width="14" height="6" rx="3" fill="#e1aa38"/><rect x="21" y="21" width="6" height="14" rx="3" fill="#da5a83"/><circle cx="8" cy="11" r="3" fill="#36b8c8"/><circle cx="27" cy="8" r="3" fill="#2ab389"/><circle cx="32" cy="29" r="3" fill="#e1aa38"/><circle cx="13" cy="32" r="3" fill="#da5a83"/></g></svg>';
  const CSS = `
  .awf-scene{position:relative;width:1920px;height:1080px;overflow:hidden;font-family:ProjectSans,sans-serif;color:#384047;background:linear-gradient(145deg,#c6dfdf,#afc9d1 48%,#b5d3bd)}
  .awf-scene *{box-sizing:border-box}.awf-scene svg{display:block;flex-shrink:0}
  .awf-scene .awf-desktop-glow{position:absolute;left:-240px;top:-330px;width:1200px;height:1000px;border-radius:50%;background:radial-gradient(ellipse,#dcf1f2,#c5d9e8 45%,transparent 70%);filter:blur(65px);opacity:.75}.awf-scene .awf-desktop-glow.b{left:1120px;top:360px;width:940px;height:830px;background:radial-gradient(ellipse,#d7e7bb,#c3d8c3 45%,transparent 70%)}
  .awf-scene .awf-hub{position:absolute;left:73px;top:42px;width:1774px;height:986px;border:1px solid #e4e9e9;border-radius:29px;background:#fdfefe;opacity:.5;filter:blur(2px);overflow:hidden}.awf-scene .awf-hub-head{height:83px;padding:29px 35px;border-bottom:1px solid #e7ebed;color:#869399;font-size:26px}.awf-scene .awf-hub-nav{position:absolute;left:32px;top:127px;width:190px;color:#a7b1b6;font-size:19px;line-height:3}.awf-scene .awf-hub-panels{position:absolute;left:287px;right:36px;top:140px;display:grid;grid-template-columns:repeat(3,1fr);gap:27px}.awf-scene .awf-hub-card{height:272px;padding:33px;border:1px solid #e8edef;border-radius:17px;background:white}.awf-scene .awf-hub-line{height:11px;background:#edf1f2;border-radius:6px;margin-bottom:21px}.awf-scene .awf-hub-line.short{width:58%}
  .awf-scene .awf-scrim{position:absolute;inset:0;background:#34485325}
  .awf-scene .awf-modal{position:absolute;left:110px;top:80px;width:1700px;height:900px;background:#fff;border:1px solid #e0e6e8;border-radius:25px;box-shadow:0 30px 85px #314c602b,0 3px 14px #2846510a;overflow:hidden;z-index:4}
  .awf-scene .awf-header{position:absolute;left:0;right:0;top:0;height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 31px;border-bottom:1px solid #e9edef;background:#fff;z-index:6}.awf-scene .awf-heading{display:flex;align-items:center;gap:14px;min-width:0}.awf-scene .awf-heading h1{font-size:28px;line-height:1.35;font-weight:560;letter-spacing:-.65px;margin:0;max-width:900px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.awf-scene .awf-failed{font-size:15px;color:#b35d72;background:#faeaf0;border:1px solid #f3dce5;padding:5px 9px;border-radius:6px;flex-shrink:0}.awf-scene .awf-header-actions{display:flex;align-items:center;gap:24px;color:#b4bcc1}.awf-scene .awf-rerun{display:flex;align-items:center;gap:9px;font-size:18px;padding:8px 12px;border:1px solid #edf0f1;border-radius:8px;color:#b4bdc1;background:#fcfdfd}
  .awf-scene .awf-chat{position:absolute;left:0;top:76px;width:400px;height:824px;border-right:1px solid #e9edef;background:#fff;z-index:3}.awf-scene .awf-chat-assist{position:absolute;left:35px;right:35px;top:192px}.awf-scene .awf-assist-icon{height:39px;width:39px;display:grid;place-items:center;color:#d89d72;background:#fbf0e7;border-radius:12px;margin-bottom:22px}.awf-scene .awf-chat-assist h2{margin:0 0 15px;font-size:24px;font-weight:520;line-height:1.4;letter-spacing:-.4px;color:#59616a}.awf-scene .awf-chat-assist p{font-size:20px;line-height:1.7;color:#7f8890;margin:0;overflow-wrap:anywhere;max-height:171px;overflow:hidden}
  .awf-scene .awf-composer{position:absolute;left:25px;right:25px;bottom:28px;height:119px;border:1px solid #e2e8eb;border-radius:17px;background:#fff;box-shadow:0 3px 9px #34495804;padding:19px 18px;color:#7f8890;font-size:21px}.awf-scene .awf-composer-tools{position:absolute;left:18px;right:17px;bottom:14px;display:flex;justify-content:space-between;align-items:center;color:#aab4ba}.awf-scene .awf-send{width:32px;height:32px;display:grid;place-items:center;border-radius:10px;background:#eaf0f3;color:#98a7b2}
  .awf-scene .awf-canvas{position:absolute;left:400px;top:76px;width:1300px;height:824px;background-color:#fafcfd;background-image:radial-gradient(#dfe7ec .9px,transparent .9px);background-size:20px 20px;overflow:hidden;z-index:2}.awf-scene .awf-flow{position:absolute;left:330px;top:0;width:640px;height:824px}
  .awf-scene .awf-wires{position:absolute;inset:0;width:640px;height:824px;color:#c5cfd6}.awf-scene .awf-wires line{stroke:currentColor;stroke-width:1.5}.awf-scene .awf-wires circle{fill:#fbfcfd;stroke:currentColor;stroke-width:1.5}
  .awf-scene .awf-start{position:absolute;left:279px;top:23px;width:82px;height:30px;display:grid;place-items:center;border:1px solid #dce7ef;background:#edf4f8;border-radius:16px;color:#7f8890;font-size:16px;letter-spacing:.3px}
  .awf-scene .awf-node{position:absolute;left:0;width:640px;border:1px solid #e1e7eb;background:#fff;border-radius:16px;box-shadow:0 4px 13px #3c566304;padding:21px 23px;z-index:2}.awf-scene .awf-node.one{top:88px;height:102px}.awf-scene .awf-node.two{top:246px;height:102px}.awf-scene .awf-node.missing{top:410px;height:150px;border:1.5px dashed #da9ba8;background:#fffafb}.awf-scene .awf-node.slack{top:626px;height:140px}
  .awf-scene .awf-node-title{display:flex;align-items:center;gap:11px;font-size:24px;line-height:1.35;letter-spacing:-.4px;font-weight:500;color:#59616a;white-space:nowrap}.awf-scene .awf-state-ok{width:21px;height:21px;border:1px solid #b8d8c7;color:#75a18d;border-radius:50%;display:grid;place-items:center;background:#f4faf7}.awf-scene .awf-node-note{margin:10px 0 0;color:#7f8890;font-size:20px;line-height:1.5}.awf-scene .awf-node.one .awf-node-note,.awf-scene .awf-node.two .awf-node-note{margin-left:32px}.awf-scene .awf-node.missing .awf-node-title{color:#b35d72;font-size:24px;padding-right:15px}.awf-scene .awf-error-dot{position:absolute;right:15px;top:15px;width:8px;height:8px;border-radius:50%;background:#d992a1}.awf-scene .awf-node.missing .awf-node-note{font-size:19px;color:#8c737b;line-height:1.5;margin-top:9px}.awf-scene .awf-connect{display:inline-flex;gap:7px;align-items:center;margin-top:10px;padding:4px 9px;font-size:16px;line-height:1.4;color:#8c737b;background:#fff;border:1px solid #eadce1;border-radius:6px}
  .awf-scene .awf-slack-channels{display:flex;align-items:center;gap:14px;margin-top:17px;color:#727b83;font-size:19px}.awf-scene .awf-slack-channels span{border:1px solid #e8edf0;border-radius:7px;background:#fcfdfe;padding:5px 9px;line-height:1.4}
  .awf-scene .awf-plus{position:absolute;left:304px;top:577px;width:32px;height:32px;display:grid;place-items:center;border-radius:50%;border:1px solid #d6e3ed;background:#eef5fa;color:#97b0c2;z-index:3}
  .awf-scene .awf-drawer{position:absolute;right:0;top:76px;width:490px;height:824px;border-left:1px solid #e1e7eb;background:#fff;box-shadow:-13px 0 35px #25445c0b;z-index:5}.awf-scene .awf-drawer-header{height:69px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:1px solid #edf0f2;font-size:24px;color:#48515a;font-weight:500}.awf-scene .awf-drawer-header>span{color:#b3c0c8}
  .awf-scene .awf-drawer-body{padding:29px 28px;color:#727b83}.awf-scene .awf-tool-title{display:flex;align-items:center;gap:16px;font-size:26px;font-weight:520;color:#48515a}.awf-scene .awf-tool-description{font-size:20px;line-height:1.65;color:#7f8890;margin:19px 0 28px}
  .awf-scene .awf-account{display:flex;align-items:flex-start;gap:10px;color:#93b5a4;font-size:19px;line-height:1.55}.awf-scene .awf-account>svg{margin-top:4px}.awf-scene .awf-account-text{flex:1;min-width:0;color:#727b83}.awf-scene .awf-manage{color:#727b83;font-size:17px;padding-top:4px;margin-left:1px;white-space:nowrap}.awf-scene .awf-rule{height:1px;background:#e9eef1;margin:29px 0 29px}.awf-scene .awf-field-label{font-size:22px;color:#59616a;line-height:1.5}.awf-scene .awf-required{color:#b35d72;margin-left:5px}.awf-scene .awf-select{height:57px;display:flex;align-items:center;justify-content:space-between;border:1px solid #e1e9ee;border-radius:9px;padding:0 15px;margin-top:15px;color:#7f8890;font-size:21px;background:#fff}.awf-scene .awf-select svg{color:#b5c5d0}.awf-scene .awf-selected-label{font-size:19px;color:#7f8890;margin-top:30px}.awf-scene .awf-selected{display:flex;flex-wrap:wrap;gap:10px;margin-top:15px}.awf-scene .awf-selected span{font-size:20px;color:#727b83;border:1px solid #e0eaf2;border-radius:8px;padding:7px 11px;background:#fafdff}
  .awf-scene .awf-cursor{position:absolute;left:0;top:0;width:38px;height:46px;z-index:10;transform-origin:4px 3px;pointer-events:none;filter:drop-shadow(0 3px 2px #293c4a24)}.awf-scene .awf-cursor .fx-cursor{display:block;position:static;width:38px;height:46px}.awf-scene .awf-ring{position:absolute;left:0;top:0;width:52px;height:52px;margin:-26px 0 0 -26px;border:2px solid #a3bdce;border-radius:50%;pointer-events:none;z-index:9}
  .awf-scene .awf-proof{position:absolute;left:0;right:0;bottom:27px;text-align:center;font-size:17px;color:#eff6f6;letter-spacing:.4px;text-shadow:0 1px 5px #37526438}
  `;

  function center(node, stop) {
    let x=node.offsetWidth/2,y=node.offsetHeight/2;
    while(node && node!==stop){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent;}
    return {x,y};
  }
  UIFX.register({
    id:'software-agent-workflow-inspect', title:'Agent Workflow · 定位失败与查看 Slack 配置',
    category:'software', duration:14,
    description:'根据 Ayda 原片 26.441、31.729、33.896 秒的工作流与 Slack 抽屉重建界面；原创编排定位缺资料节点、切至全画布、点击 Slack 节点并展开配置，Failed 状态始终保留。',
    tags:['AI Agents','Workflow','失败检查','Slack 配置','侧栏展开'],
    source:'https://x.com/aydaoz/status/2067614756756676711',
    sourceStatus:'observed-reconstruction', sourceObservation:'video-fragment',
    referenceVideoDuration:78.75, observedTimes:[26.441,31.729,33.896],
    adaptationNotes:'只依据已观察片段，不宣称完整原片复刻。节点第二项统一拼为 templates；原图疑似 remplates。操作节奏、简化 Agent Hub、渐变桌面和示意图标为原创；不连接 Drive/Slack，不展开未观察的频道列表，不演出发送成功。',
    params:{...defaults}
  }, function(ctx,params){
    const p=Object.assign({},defaults,params),e=ctx.esc;
    const ok='<span class="awf-state-ok">'+icon('check',13)+'</span>';
    ctx.root.innerHTML='<style>'+CSS+'</style><div class="fx-scene awf-scene"><div class="awf-desktop-glow"></div><div class="awf-desktop-glow b"></div><div class="awf-hub"><div class="awf-hub-head">Agent Hub</div><div class="awf-hub-nav">My Agents<br>Activity</div><div class="awf-hub-panels">'+Array.from({length:6},()=>'<div class="awf-hub-card"><div class="awf-hub-line short"></div><div class="awf-hub-line"></div><div class="awf-hub-line"></div></div>').join('')+'</div></div><div class="awf-scrim"></div>'+
      '<section class="awf-modal"><header class="awf-header"><div class="awf-heading"><h1>'+e(p.title)+'</h1><span class="awf-failed">Failed</span></div><div class="awf-header-actions"><div class="awf-rerun">'+icon('rerun',18)+'<span>Re-run</span></div>'+icon('close',22)+'</div></header>'+
      '<aside class="awf-chat"><div class="awf-chat-assist"><div class="awf-assist-icon">'+icon('sparkle',24)+'</div><h2>Not sure what to do?</h2><p>'+e(p.prompt)+'</p></div><div class="awf-composer">Type here<div class="awf-composer-tools">'+icon('plus',20)+'<span class="awf-send">'+icon('arrow',18)+'</span></div></div></aside>'+
      '<main class="awf-canvas"><div class="awf-flow"><svg class="awf-wires" viewBox="0 0 640 824" aria-hidden="true"><line x1="320" y1="53" x2="320" y2="88"/><line x1="320" y1="190" x2="320" y2="246"/><line x1="320" y1="348" x2="320" y2="410"/><line x1="320" y1="560" x2="320" y2="577"/><line x1="320" y1="609" x2="320" y2="626"/><circle cx="320" cy="190" r="3.5"/><circle cx="320" cy="246" r="3.5"/><circle cx="320" cy="348" r="3.5"/><circle cx="320" cy="410" r="3.5"/><circle cx="320" cy="560" r="3.5"/><circle cx="320" cy="626" r="3.5"/></svg><div class="awf-start">Start</div>'+
      '<article class="awf-node one"><div class="awf-node-title">'+ok+'Pull letters from Google Drive</div><p class="awf-node-note">Workday connected.</p></article>'+
      '<article class="awf-node two"><div class="awf-node-title">'+ok+'Turn letters to templates</div><p class="awf-node-note">Templates ready.</p></article>'+
      '<article class="awf-node missing"><div class="awf-node-title awf-missing-title">Auto-fill with candidate details</div><span class="awf-error-dot"></span><p class="awf-node-note">Attach related doc in chat or connect to your drive.</p><div class="awf-connect">'+icon('link',15)+'<span>Connect to Drive</span></div></article>'+
      '<div class="awf-plus">'+icon('plus',18)+'</div><article class="awf-node slack"><div class="awf-node-title">Send drafts to Slack for review</div><div class="awf-slack-channels">'+slack(32)+'<span>#HR-leads</span><span>#Candidates</span></div></article></div></main>'+
      '<aside class="awf-drawer"><div class="awf-drawer-header">Slack<span>'+icon('close',21)+'</span></div><div class="awf-drawer-body"><div class="awf-tool-title">'+slack(46)+'<span>Send message</span></div><p class="awf-tool-description">Sends a message to a slack channel.</p><div class="awf-account">'+icon('link',19)+'<span class="awf-account-text">Account is successfully connected</span><span class="awf-manage">Manage</span></div><div class="awf-rule"></div><div class="awf-field-label">Add a Slack channel<span class="awf-required">*</span></div><div class="awf-select"><span>Select channel</span>'+icon('down',21)+'</div><div class="awf-selected-label">Selected channels</div><div class="awf-selected"><span>#HR-leads</span><span>#Candidates</span></div></div></aside></section>'+
      '<div class="awf-ring"></div><div class="awf-cursor">'+ctx.cursor()+'</div><div class="awf-proof">片段界面重建 · 操作节奏、图标与背景原创</div></div>';

    const missing=ctx.q('.awf-node.missing'),slackNode=ctx.q('.awf-node.slack');
    const target=center(ctx.q('.awf-missing-title'),ctx.root),slackCenter=center(slackNode,ctx.root);
    const canvasShift=-200; // left 400→0 and flow left 330→530: the whole chain moves 200px left.
    const clickAt={x:slackCenter.x+canvasShift,y:slackCenter.y-23};
    const cursor=ctx.q('.awf-cursor'),ring=ctx.q('.awf-ring');
    const tl=ctx.gsap.timeline({paused:true});
    tl.set(ctx.q('.awf-modal'),{opacity:0,y:18,scale:.987,transformOrigin:'50% 50%'},0)
      .set(ctx.q('.awf-chat'),{opacity:1,x:0},0)
      .set(ctx.q('.awf-canvas'),{left:400,width:1300},0)
      .set(ctx.q('.awf-flow'),{left:330,opacity:1},0)
      .set(ctx.q('.awf-drawer'),{x:490,opacity:0},0)
      .set(ctx.qa('.awf-node'),{opacity:1},0)
      .set(missing,{borderColor:'#da9ba8',boxShadow:'0 4px 13px #3c566304'},0)
      .set(slackNode,{borderColor:'#e1e7eb',boxShadow:'0 4px 13px #3c566304'},0)
      .set(cursor,{x:1460,y:778,opacity:0,scale:1},0)
      .set(ring,{opacity:0,scale:.3,x:0,y:0},0)
      .to(ctx.q('.awf-modal'),{opacity:1,y:0,scale:1,duration:.7,ease:'power3.out'},0);

    // Inspect the missing-input node without activating Connect to Drive or Re-run.
    tl.to(cursor,{x:target.x-4,y:target.y-3,opacity:1,duration:.65,ease:'power2.inOut'},1.15)
      .to(missing,{borderColor:'#cb8295',boxShadow:'0 0 0 4px #f5e6ec',duration:.3,ease:'power2.out'},1.9)
      .to(missing,{borderColor:'#da9ba8',boxShadow:'0 4px 13px #3c566304',duration:.6,ease:'power2.out'},3.35);

    // A full-canvas composition was visible at 31.729s. Keep the same four nodes
    // and their connectors together instead of replacing the page or node copies.
    tl.to(ctx.q('.awf-chat'),{x:-400,opacity:0,duration:.85,ease:'power3.inOut'},4.25)
      .to(ctx.q('.awf-canvas'),{left:0,width:1700,duration:.85,ease:'power3.inOut'},4.25)
      .to(ctx.q('.awf-flow'),{left:530,duration:.85,ease:'power3.inOut'},4.25)
      .to(cursor,{x:target.x+canvasShift-4,duration:.85,ease:'power3.inOut'},4.25)
      .to(cursor,{x:clickAt.x-4,y:clickAt.y-3,duration:.65,ease:'power2.inOut'},5.7)
      .set(ring,{x:clickAt.x,y:clickAt.y,scale:.3,opacity:.7},6.55)
      .to(ring,{scale:1.35,opacity:0,duration:.45,ease:'power2.out'},6.55)
      .to(cursor,{scale:.88,duration:.09},6.55)
      .to(cursor,{scale:1,duration:.16},6.64)
      .to(slackNode,{borderColor:'#b5ccdf',boxShadow:'0 0 0 3px #eaf1f8',duration:.3},6.55);

    // Reveal only the observed drawer fields. Account-connected text is an
    // existing reference state: no connection action, option list or send result.
    tl.to(ctx.q('.awf-drawer'),{x:0,opacity:1,duration:.9,ease:'power3.inOut'},6.9)
      .to(ctx.q('.awf-canvas'),{width:1210,duration:.9,ease:'power3.inOut'},6.9)
      .to(ctx.q('.awf-flow'),{left:285,duration:.9,ease:'power3.inOut'},6.9)
      .to(cursor,{x:clickAt.x-245-4,duration:.9,ease:'power3.inOut'},6.9)
      .to(cursor,{x:1518,y:337,duration:.65,ease:'power2.inOut'},8.05)
      .to(cursor,{opacity:0,duration:.3},8.95)
      .to({}, {duration:.01},13.99);
    return {timeline:tl,duration:14};
  });
})();
