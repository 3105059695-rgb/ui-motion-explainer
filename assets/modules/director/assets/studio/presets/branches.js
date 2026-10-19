/* Marcel Kargul static SaaS reference; drawer and branch inspection timing is original. */
(function () {
  'use strict';
  const defaults={title:'Untitled workflow',prompt:'Record ID in Companies updated'};
  const paths={
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    home:'<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
    flow:'<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    template:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/>',
    library:'<path d="M4 4h4v16H4zM10 4h4v16h-4zM17 4l4 1-3 15-4-1z"/>',
    object:'<path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10"/>',
    event:'<path d="m13 2-8 12h6l-1 8 9-13h-6z"/>',
    segments:'<circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="m11 11 2 2"/>',
    run:'<path d="m8 4 12 8-12 8z"/>',
    alert:'<path d="m12 3 10 18H2zM12 9v5M12 17h.01"/>',
    logs:'<path d="M6 3h12v18H6zM9 8h6M9 12h6M9 16h4"/>',
    team:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 6a3 3 0 0 1 0 6M21 21v-4a5 5 0 0 0-3-4"/>',
    settings:'<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="white"/><circle cx="15" cy="17" r="3" fill="white"/>',
    down:'<path d="m7 9 5 5 5-5"/>',
    chevron:'<path d="m9 5 7 7-7 7"/>',
    trigger:'<path d="m13 2-8 12h6l-1 8 9-13h-6z"/>',
    condition:'<path d="m12 2 10 10-10 10L2 12zM8 12h8"/>',
    action:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>'
  };
  const icon=(name,size=20)=>'<svg width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
  const CSS=`
  .br-scene{position:relative;width:1920px;height:1080px;overflow:hidden;font-family:ProjectSans,sans-serif;background:#f0f1f3;color:#32363d}.br-scene *{box-sizing:border-box}.br-scene svg{display:block;flex-shrink:0}
  .br-scene .br-window{position:absolute;left:80px;top:50px;width:1760px;height:940px;border:1px solid #e0e2e7;border-radius:22px;background:#fff;box-shadow:0 28px 85px #2a2e4315,0 3px 10px #30384706;overflow:hidden}
  .br-scene .br-sidebar{position:absolute;left:0;top:0;bottom:0;width:240px;border-right:1px solid #e9eaee;background:#fafbfc}.br-scene .br-brand{position:absolute;left:22px;top:28px;display:flex;align-items:center;gap:10px;font-size:25px;font-weight:600;letter-spacing:-.7px}.br-scene .br-brand-mark{height:31px;width:31px;display:grid;place-items:center;color:#fff;background:#806bcb;border-radius:8px;font-size:21px;font-family:ProjectDisplay,sans-serif}.br-scene .br-quick-find{position:absolute;left:20px;right:20px;top:85px;height:40px;border:1px solid #e7e8ed;border-radius:7px;display:flex;align-items:center;gap:10px;padding:0 11px;background:#fff;color:#959aa6;font-size:17px}
  .br-scene .br-nav-group{position:absolute;left:24px;font-size:13px;font-weight:550;letter-spacing:.3px;color:#a3a8b1}.br-scene .br-nav-item{position:absolute;left:17px;width:206px;height:34px;display:flex;align-items:center;gap:10px;padding:0 10px;border:1px solid transparent;border-radius:7px;font-size:17px;color:#737b88;white-space:nowrap}.br-scene .br-nav-item.active{border-color:#e8e6ee;background:#eeeef2;color:#494858;font-weight:500}.br-scene .br-nav-item svg{color:#979ca8}.br-scene .br-nav-item.active svg{color:#837293}
  .br-scene .br-upgrade{position:absolute;left:18px;top:683px;width:204px;height:151px;border:1px solid #e5e3ec;border-radius:10px;padding:13px 12px;background:#fff}.br-scene .br-upgrade-title{font-size:13px;color:#8f889c;margin-bottom:12px}.br-scene .br-credit{font-size:20px;font-weight:550;color:#60536f;line-height:1.3}.br-scene .br-credit small{font-size:13px;font-weight:400;margin-left:5px;color:#a299ac}.br-scene .br-upgrade-row{font-size:12px;color:#a59dab;margin-top:7px}.br-scene .br-progress{height:4px;border-radius:3px;background:#efeaf6;margin:10px 0}.br-scene .br-progress span{display:block;width:61%;height:100%;border-radius:3px;background:#9985c6}.br-scene .br-upgrade-button{height:25px;border:1px solid #e4dcec;border-radius:5px;background:#f7f3fb;display:grid;place-items:center;font-size:13px;color:#9480ab}
  .br-scene .br-topbar{position:absolute;left:240px;right:0;top:0;height:75px;border-bottom:1px solid #e9ebee;display:flex;justify-content:space-between;align-items:center;padding:0 28px;background:#fff}.br-scene .br-breadcrumb{display:flex;align-items:center;gap:13px;font-size:19px;color:#969ca7}.br-scene .br-breadcrumb b{font-size:20px;font-weight:500;color:#5b6270;max-width:940px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.br-scene .br-star{font-size:22px;color:#dfa56b;line-height:1}.br-scene .br-top-actions{display:flex;align-items:center;gap:16px}.br-scene .br-avatar{height:32px;width:32px;border-radius:50%;background:linear-gradient(145deg,#e2c6b4,#bbaccc);border:2px solid #fff;box-shadow:0 0 0 1px #e5e2e9;display:grid;place-items:center;font-size:15px;color:#fff;font-weight:550}.br-scene .br-share{border:1px solid #e3e5e9;border-radius:7px;padding:7px 13px;font-size:16px;color:#828894;background:#fff}
  .br-scene .br-subbar{position:absolute;left:240px;right:0;top:75px;height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:1px solid #e9ebee;background:#fff}.br-scene .br-mode-tabs{height:100%;display:flex;gap:26px;align-items:stretch;font-size:19px;color:#a3a7b0}.br-scene .br-mode-tabs span{display:flex;align-items:center;border-bottom:2px solid transparent}.br-scene .br-mode-tabs .active{color:#535763;border-color:#8c82a5}.br-scene .br-edit-actions{display:flex;align-items:center;gap:17px;font-size:16px;color:#89909b}.br-scene .br-save{padding:7px 16px;background:#292c31;color:#f5f5f7;border-radius:6px}.br-scene .br-draft{padding:5px 9px;background:#fbf5dc;color:#b4a36a;border:1px solid #f3eac4;border-radius:5px;font-size:14px}
  .br-scene .br-canvas{position:absolute;left:240px;top:135px;width:1520px;height:805px;background-color:#fcfdfd;background-image:radial-gradient(#e3e6eb .9px,transparent .9px);background-size:20px 20px;overflow:hidden}.br-scene .br-tree{position:absolute;left:200px;top:0;width:1120px;height:805px}.br-scene .br-connectors{position:absolute;inset:0;width:1120px;height:805px;overflow:visible;pointer-events:none}.br-scene .br-wire{stroke:#cfd3da;stroke-width:1.5;fill:none;stroke-linejoin:round;stroke-linecap:round}.br-scene .br-wire-focus{stroke-width:2.3;fill:none;stroke-linejoin:round;stroke-linecap:round}.br-scene .br-wire-focus.true{stroke:#b1a6c2}.br-scene .br-wire-focus.false{stroke:#a7b9ca}.br-scene .br-port{fill:#fff;stroke:#c3c9d1;stroke-width:1.3}
  .br-scene .br-node{position:absolute;width:460px;height:154px;border:1px solid #e3e6ea;background:#fff;border-radius:9px;box-shadow:0 3px 9px #35415403;overflow:hidden}.br-scene .br-node.trigger{left:330px;top:80px}.br-scene .br-node.condition{left:330px;top:313px}.br-scene .br-node.email{left:60px;top:594px}.br-scene .br-node.slack{left:600px;top:594px}.br-scene .br-node-strip{height:32px;display:flex;align-items:center;gap:7px;padding:0 13px;border-bottom:1px solid #f1e2e8;background:#f9edf2;color:#b28b9c;font-size:15px;font-weight:500}.br-scene .br-node.condition .br-node-strip{background:#f2edf9;border-color:#e9e1f3;color:#a18cbf}.br-scene .br-node.email .br-node-strip,.br-scene .br-node.slack .br-node-strip{background:#edf3fa;border-color:#e0e9f4;color:#91a6c2}.br-scene .br-node-body{padding:16px 18px}.br-scene .br-node-heading{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:25px;line-height:1.3;font-weight:530;letter-spacing:-.45px;color:#525965;white-space:nowrap}.br-scene .br-data-tag{font-size:13px;line-height:1.2;font-weight:400;border:1px solid #e7e8ec;border-radius:5px;padding:4px 6px;color:#a9acb4;background:#fcfcfd;letter-spacing:0}.br-scene .br-node-description{font-size:24px;line-height:1.4;color:#858b95;margin-top:11px;letter-spacing:-.45px;max-height:67px;overflow:hidden}
  .br-scene .br-branch-label{position:absolute;top:546px;min-width:93px;height:28px;display:grid;place-items:center;padding:0 11px;background:#fcfdfd;color:#8f95a0;border:1px solid transparent;border-radius:7px;font-size:18px;line-height:1;z-index:2;transform:translateX(-50%)}.br-scene .br-branch-label.true{left:290px}.br-scene .br-branch-label.false{left:830px}
  .br-scene .br-drawer{position:absolute;right:0;top:135px;width:400px;height:805px;border-left:1px solid #e4e7eb;background:#fff;box-shadow:-10px 0 27px #41495d05;padding:23px 24px;z-index:3;overflow:hidden}.br-scene .br-drawer-badge{display:inline-flex;align-items:center;gap:6px;background:#faedf2;border:1px solid #f2dfe7;color:#ba91a5;border-radius:5px;padding:4px 7px;font-size:14px;line-height:1.2}.br-scene .br-drawer-close{position:absolute;right:23px;top:26px;color:#b2b7c0}.br-scene .br-drawer h2{font-size:25px;font-weight:550;line-height:1.3;letter-spacing:-.5px;color:#515965;margin:12px 0 9px}.br-scene .br-drawer-description{font-size:18px;line-height:1.5;letter-spacing:-.2px;color:#8e949e;min-height:27px;max-height:54px;overflow:hidden}.br-scene .br-drawer-rule{height:1px;background:#eceef2;margin:17px 0 19px}.br-scene .br-section-title{font-size:19px;font-weight:500;line-height:1.3;color:#646c78;margin:0 0 15px}.br-scene .br-field-label{font-size:15px;color:#969da7;line-height:1.3;margin:12px 0 7px}.br-scene .br-field{height:38px;border:1px solid #e4e7eb;border-radius:6px;padding:8px 10px;background:#fff;color:#737c88;font-size:18px;line-height:1.2}.br-scene .br-field.description{height:57px;line-height:1.45;font-size:17px;overflow:hidden}.br-scene .br-settings{margin-top:23px}.br-scene .br-property{height:34px;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:17px;color:#969da7}.br-scene .br-property-value{display:flex;align-items:center;gap:7px;color:#727c89;font-size:18px}.br-scene .br-property-value svg{color:#afb6bf}.br-scene .br-available{margin-top:24px}.br-scene .br-data-row{height:34px;display:flex;align-items:center;justify-content:space-between;font-size:17px;color:#939aa5}.br-scene .br-data-row code{font:16px ui-monospace,Consolas,monospace;color:#7c8491}.br-scene .br-history{margin-top:23px;padding-top:18px;border-top:1px solid #eef0f3}.br-scene .br-crop-note{font-size:14px;line-height:1.5;color:#b2b6bf;margin-top:9px}
  .br-scene .br-cursor{position:absolute;left:0;top:0;width:38px;height:46px;transform-origin:4px 3px;z-index:12;pointer-events:none;filter:drop-shadow(0 2px 2px #29334820)}.br-scene .br-cursor .fx-cursor{position:static;display:block;width:38px;height:46px}.br-scene .br-click-ring{position:absolute;left:0;top:0;width:52px;height:52px;margin:-26px 0 0 -26px;border:2px solid #b6a7ca;border-radius:50%;pointer-events:none;z-index:11}.br-scene .br-proof{position:absolute;left:0;right:0;bottom:32px;text-align:center;font-size:17px;color:#999aa5;letter-spacing:.3px}
  `;

  function center(node,stop){let x=node.offsetWidth/2,y=node.offsetHeight/2;while(node&&node!==stop){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent;}return{x,y};}
  UIFX.register({
    id:'software-branch-workflow',title:'分支工作流 · 查看触发条件与双路径',category:'software',duration:14,
    description:'根据 Marcel Kargul 的静态 SaaS 工作流构图重建 Trigger、Condition 和双 Action 分支；原创点击展开配置与弱描线说明，Draft 保持，不演出执行成功。',
    tags:['AI Flow','工作流分支','Trigger 配置','静态参考'],
    source:'https://x.com/marcelkargul/status/1993778795648839775',
    referenceMedia:'https://cdn.collectui.com/media/G6tTPpOWUAA-zOO.avif',
    referenceTitle:'This is the design quality founders happily invest $50,000+ into.',
    sourceStatus:'observed-reconstruction',sourceObservation:'static-image',
    adaptationNotes:'原图4096×3231，改编为16:9。保留已见字段，Run history 仅标题与裁切说明；头像为原创绘制，点击、抽屉滑入与分支焦点节奏为原创，不代表原图含动画或真实执行。',
    params:{...defaults}
  },function(ctx,params){
    const p=Object.assign({},defaults,params),e=ctx.esc;
    const nav=[['home','Home',182],['flow','Workflows',221],['template','Templates',260],['library','Step library',299],['object','Objects',388],['event','Events',427],['segments','Segments',466],['run','Runs',547],['alert','Alerts',586],['logs','Logs',625],['team','Team & access',851],['settings','Settings',896]];
    const node=(className,kind,label,title,description,data)=>'<article class="br-node '+className+'"><div class="br-node-strip">'+icon(kind,15)+'<span>'+label+'</span></div><div class="br-node-body"><div class="br-node-heading"><span>'+e(title)+'</span>'+(data?'<small class="br-data-tag">Data</small>':'')+'</div><div class="br-node-description">'+e(description)+'</div></div></article>';
    const property=(label,value)=>'<div class="br-property"><span>'+e(label)+'</span><span class="br-property-value">'+e(value)+icon('down',14)+'</span></div>';
    ctx.root.innerHTML='<style>'+CSS+'</style><div class="fx-scene br-scene"><section class="br-window"><aside class="br-sidebar"><div class="br-brand"><span class="br-brand-mark">A</span>Acme</div><div class="br-quick-find">'+icon('search',18)+'Quick find</div><div class="br-nav-group" style="top:154px">Build</div><div class="br-nav-group" style="top:359px">Data</div><div class="br-nav-group" style="top:519px">Monitor</div>'+nav.map(([name,label,y])=>'<div class="br-nav-item'+(name==='flow'?' active':'')+'" style="top:'+y+'px">'+icon(name,18)+'<span>'+e(label)+'</span></div>').join('')+'<div class="br-upgrade"><div class="br-upgrade-title">Upgrade Overview</div><div class="br-credit">$750<small>Credit</small></div><div class="br-upgrade-row">7 days left</div><div class="br-progress"><span></span></div><div class="br-upgrade-button">Upgrade Now</div></div></aside>'+
      '<header class="br-topbar"><div class="br-breadcrumb"><span>Workflows</span>'+icon('chevron',15)+'<b>'+e(p.title)+'</b><span class="br-star">☆</span></div><div class="br-top-actions"><div class="br-avatar">M</div><div class="br-share">Share</div></div></header><div class="br-subbar"><div class="br-mode-tabs"><span class="active">Build</span><span>Activity</span></div><div class="br-edit-actions"><span>Exit</span><span class="br-save">Save</span><span class="br-draft">Draft</span></div></div>'+
      '<main class="br-canvas"><div class="br-tree"><svg class="br-connectors" viewBox="0 0 1120 805" aria-hidden="true"><path class="br-wire" d="M560 234V313"/><path class="br-wire" d="M560 467V518H290V594"/><path class="br-wire" d="M560 467V518H830V594"/><path class="br-wire-focus true" d="M560 467V518H290V594"/><path class="br-wire-focus false" d="M560 467V518H830V594"/><circle class="br-port" cx="560" cy="234" r="3.5"/><circle class="br-port" cx="560" cy="313" r="3.5"/><circle class="br-port" cx="560" cy="467" r="3.5"/><circle class="br-port" cx="290" cy="594" r="3.5"/><circle class="br-port" cx="830" cy="594" r="3.5"/></svg>'+node('trigger','trigger','Trigger','Attribute updated',p.prompt,true)+node('condition','condition','Condition','Is high value','Check if company ARR is over 10k',true)+node('email','action','Action','Send alert email','Notify the account owner',false)+node('slack','action','Action','Post to Slack','Ping #deals channel',false)+'<div class="br-branch-label true">If True</div><div class="br-branch-label false">If False</div></div></main>'+
      '<aside class="br-drawer"><div class="br-drawer-badge">'+icon('trigger',14)+'Trigger</div><span class="br-drawer-close">'+icon('close',18)+'</span><h2>Attribute updated</h2><div class="br-drawer-description">'+e(p.prompt)+'</div><div class="br-drawer-rule"></div><h3 class="br-section-title">Step details</h3><div class="br-field-label">Name</div><div class="br-field br-name-field">Attribute updated</div><div class="br-field-label">Description</div><div class="br-field description">'+e(p.prompt)+'</div><section class="br-settings"><h3 class="br-section-title">Trigger settings</h3>'+property('Object','Companies')+property('Attribute','Record ID')+property('Updates when','Value changes')+'</section><section class="br-available"><h3 class="br-section-title">Available data</h3><div class="br-data-row"><code>record_id</code><span>Number</span></div><div class="br-data-row"><code>updated_at</code><span>Timestamp</span></div></section><section class="br-history"><h3 class="br-section-title">Run history</h3><div class="br-crop-note">参考图在此处裁切 · 运行数据未提供</div></section></aside></section><div class="br-click-ring"></div><div class="br-cursor">'+ctx.cursor()+'</div><div class="br-proof">静态参考界面重建 · 原创操作与分支说明</div></div>';

    const trigger=ctx.q('.br-node.trigger'),condition=ctx.q('.br-node.condition');
    const triggerCenter=center(trigger,ctx.root),leftLabel=center(ctx.q('.br-branch-label.true'),ctx.root),rightLabel=center(ctx.q('.br-branch-label.false'),ctx.root);
    // Labels use translateX(-50%) in CSS; offset geometry does not include it.
    leftLabel.x-=ctx.q('.br-branch-label.true').offsetWidth/2;
    rightLabel.x-=ctx.q('.br-branch-label.false').offsetWidth/2;
    const leftWire=ctx.q('.br-wire-focus.true'),rightWire=ctx.q('.br-wire-focus.false');
    const leftLength=leftWire.getTotalLength(),rightLength=rightWire.getTotalLength();
    const cursor=ctx.q('.br-cursor'),ring=ctx.q('.br-click-ring'),tl=ctx.gsap.timeline({paused:true});
    tl.set(ctx.q('.br-window'),{opacity:0,y:15,scale:.99,transformOrigin:'50% 50%'},0)
      .set(ctx.q('.br-canvas'),{width:1520},0)
      .set(ctx.q('.br-tree'),{left:200,opacity:1},0)
      .set(ctx.q('.br-drawer'),{x:400,opacity:0},0)
      .set(ctx.qa('.br-node'),{opacity:1},0)
      .set(trigger,{borderColor:'#e3e6ea',boxShadow:'0 3px 9px #35415403'},0)
      .set(condition,{borderColor:'#e3e6ea',boxShadow:'0 3px 9px #35415403'},0)
      .set(ctx.qa('.br-branch-label'),{color:'#8f95a0',backgroundColor:'#fcfdfd',borderColor:'transparent'},0)
      .set(leftWire,{strokeDasharray:leftLength,strokeDashoffset:leftLength,opacity:0},0)
      .set(rightWire,{strokeDasharray:rightLength,strokeDashoffset:rightLength,opacity:0},0)
      .set(cursor,{x:1540,y:829,opacity:0,scale:1},0)
      .set(ring,{x:0,y:0,opacity:0,scale:.3},0)
      .to(ctx.q('.br-window'),{opacity:1,y:0,scale:1,duration:.7,ease:'power3.out'},0);

    tl.to(cursor,{x:triggerCenter.x-4,y:triggerCenter.y-3,opacity:1,duration:.65,ease:'power2.inOut'},1.1)
      .set(ring,{x:triggerCenter.x,y:triggerCenter.y,scale:.3,opacity:.65},1.95)
      .to(ring,{scale:1.3,opacity:0,duration:.45,ease:'power2.out'},1.95)
      .to(cursor,{scale:.88,duration:.09},1.95)
      .to(cursor,{scale:1,duration:.16},2.04)
      .to(trigger,{borderColor:'#d9beca',boxShadow:'0 0 0 3px #f9edf2',duration:.3},1.95)
      .to(ctx.q('.br-drawer'),{x:0,opacity:1,duration:.85,ease:'power3.inOut'},2.3)
      .to(ctx.q('.br-canvas'),{width:1120,duration:.85,ease:'power3.inOut'},2.3)
      .to(ctx.q('.br-tree'),{left:0,duration:.85,ease:'power3.inOut'},2.3)
      .to(cursor,{x:triggerCenter.x-204,duration:.85,ease:'power3.inOut'},2.3)
      .to(cursor,{x:1622,y:420,duration:.65,ease:'power2.inOut'},3.4)
      .to(trigger,{borderColor:'#e3e6ea',boxShadow:'0 3px 9px #35415403',duration:.5},4.4);

    // Both branch routes are already present. Low-contrast traces explain the
    // decision paths; no node changes to a running, completed or successful state.
    tl.to(cursor,{x:876,y:552,duration:.65,ease:'power2.inOut'},4.9)
      .to(condition,{borderColor:'#d5cde1',boxShadow:'0 0 0 3px #f4f0f8',duration:.35},5.5)
      .to(cursor,{x:leftLabel.x-204,y:leftLabel.y-3,duration:.55,ease:'power2.inOut'},5.9)
      .set(leftWire,{opacity:.7},6.45)
      .to(leftWire,{strokeDashoffset:0,duration:.8,ease:'power1.inOut'},6.45)
      .to(ctx.q('.br-branch-label.true'),{color:'#71677e',backgroundColor:'#f4f0f9',borderColor:'#e1d9eb',duration:.25},6.45)
      .to(leftWire,{opacity:0,duration:.4},8.05)
      .to(ctx.q('.br-branch-label.true'),{color:'#8f95a0',backgroundColor:'#fcfdfd',borderColor:'transparent',duration:.4},8.05)
      .to(cursor,{x:rightLabel.x-204,y:rightLabel.y-3,duration:.65,ease:'power2.inOut'},8.35)
      .set(rightWire,{opacity:.7},9)
      .to(rightWire,{strokeDashoffset:0,duration:.8,ease:'power1.inOut'},9)
      .to(ctx.q('.br-branch-label.false'),{color:'#6c7d8a',backgroundColor:'#eef3f8',borderColor:'#dce6ee',duration:.25},9)
      .to(rightWire,{opacity:0,duration:.4},10.6)
      .to(ctx.q('.br-branch-label.false'),{color:'#8f95a0',backgroundColor:'#fcfdfd',borderColor:'transparent',duration:.4},10.6)
      .to(condition,{borderColor:'#e3e6ea',boxShadow:'0 3px 9px #35415403',duration:.45},10.8)
      .to(cursor,{x:1690,y:1014,duration:.55,ease:'power2.inOut'},11.15)
      .to(cursor,{opacity:0,duration:.3},11.45)
      .to({}, {duration:.01},13.99);
    return{timeline:tl,duration:14};
  });
})();
