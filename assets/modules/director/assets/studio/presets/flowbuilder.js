/* Static composition reference by Siddharth Vij. Drag/insertion timing is original. */
(function () {
  'use strict';

  const defaults = {
    title: 'Sales Playbook',
    prompt: 'When a user mentions “product overview”',
    result: 'Would you be interested in seeing a clip of the product in action'
  };
  const paths = {
    search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
    agents: '<rect x="4" y="6" width="16" height="14" rx="4"/><path d="M12 3v3M8 11h.01M16 11h.01M8 16h8"/>',
    library: '<path d="M4 4h4v16H4zM10 4h4v16h-4zM17 4l4 1-3 15-4-1z"/>',
    leads: '<circle cx="10" cy="8" r="3"/><path d="M4 20v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M20 19v-3a5 5 0 0 0-2-4"/>',
    chat: '<path d="M4 4h16v13H9l-5 4zM8 8h8M8 12h5"/>',
    integrations: '<path d="M8 3v5m8-5v5M5 8h14v4a7 7 0 0 1-14 0zM12 19v3"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9 9a3 3 0 1 1 5 2l-2 1v2M12 17h.01"/>',
    gear: '<path d="m10 3-1 3-3 1-3 3 2 2-1 4 3 2 3-1 2 4 3-1 1-3 4-1 1-3-3-2 1-4-3-2-3 1z"/><circle cx="12" cy="12" r="3"/>',
    bell: '<path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5zM10 20h4"/>',
    trigger: '<path d="m13 2-8 12h6l-1 8 9-13h-6z"/>',
    stop: '<rect x="5" y="5" width="14" height="14" rx="3"/>',
    input: '<rect x="3" y="6" width="18" height="12" rx="3"/><path d="M7 10v4m3-4h7"/>',
    question: '<path d="M4 4h16v13H9l-5 4zM9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 15h.01"/>',
    deck: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M8 1h12a2 2 0 0 1 2 2v14M9 9h6M9 13h6M9 17h4"/>',
    flow: '<rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-4h14v4"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    fit: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5"/>'
  };
  const icon = (name, size = 22) => '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.deck) + '</svg>';

  const CSS = `
  .fb-scene{position:relative;width:1920px;height:1080px;overflow:hidden;background:linear-gradient(155deg,#d2ded1,#9aaa96 56%,#65816b);font-family:ProjectSans,sans-serif;color:#272b33}
  .fb-scene *{box-sizing:border-box}.fb-scene svg{display:block;flex-shrink:0}
  .fb-scene .fb-forest{position:absolute;inset:0;width:1920px;height:1080px;opacity:.65}
  .fb-scene .fb-app{position:absolute;left:110px;top:70px;width:1700px;height:920px;overflow:hidden;border:1px solid #dce2dd;border-radius:28px;background:#fff;box-shadow:0 30px 100px #243e4933,0 3px 18px #2d493c15}
  .fb-scene .fb-sidebar{position:absolute;left:0;top:0;bottom:0;width:280px;background:#f9faf9;border-right:1px solid #e7e9e8;padding:31px 25px}
  .fb-scene .fb-brand{display:flex;align-items:center;gap:11px;color:#252a31;font-size:26px;letter-spacing:-.7px;font-weight:600}
  .fb-scene .fb-brand-mark{color:#eb783e}.fb-scene .fb-brand-arrow{color:#a4aaa8;font-size:20px;font-weight:400;margin-left:1px}
  .fb-scene .fb-ask{height:48px;margin-top:34px;display:flex;align-items:center;gap:12px;padding:0 14px;border:1px solid #e3e7e4;border-radius:10px;background:white;box-shadow:0 2px 4px #243a2e03;font-size:20px;color:#69746e}
  .fb-scene .fb-navigation{margin-top:27px}.fb-scene .fb-nav-item{height:46px;display:flex;align-items:center;gap:13px;padding:0 13px;margin-bottom:7px;font-size:19px;white-space:nowrap;color:#717c75;border-radius:9px}.fb-scene .fb-nav-item.active{background:#e9edeb;color:#313c35;font-weight:500}
  .fb-scene .fb-topbar{position:absolute;left:280px;right:0;top:0;height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 31px;border-bottom:1px solid #ecefec;color:#87918a;font-size:17px}
  .fb-scene .fb-breadcrumb{display:flex;gap:14px;align-items:center}.fb-scene .fb-breadcrumb b{color:#525e56;font-weight:500}.fb-scene .fb-top-tools{display:flex;gap:23px;align-items:center;color:#87918a}.fb-scene .fb-avatar{width:33px;height:33px;display:grid;place-items:center;border:2px solid white;border-radius:50%;background:linear-gradient(140deg,#eac7b6,#b4bac7);color:#fff;font-size:16px;font-weight:600}
  .fb-scene .fb-agent-title{position:absolute;left:312px;top:101px;display:flex;align-items:center;gap:14px}.fb-scene .fb-agent-icon{width:38px;height:38px;display:grid;place-items:center;border:1px solid #e5e9e7;border-radius:10px;font-family:ProjectDisplay,sans-serif;font-size:23px;color:#55656c;background:#fbfcfc}.fb-scene .fb-agent-title h1{margin:0;font-size:29px;line-height:1.3;letter-spacing:-.7px;font-weight:590}.fb-scene .fb-active{display:flex;align-items:center;gap:6px;margin-left:2px;font-size:14px;padding:5px 9px;border-radius:6px;background:#edf6ec;color:#678858}.fb-scene .fb-active i{width:5px;height:5px;border-radius:50%;background:#70a659}
  .fb-scene .fb-subtitle{position:absolute;left:312px;top:151px;font-size:17px;color:#919a95;line-height:1.5}
  .fb-scene .fb-tabs{position:absolute;left:280px;right:0;top:205px;height:47px;display:flex;align-items:stretch;gap:24px;padding:0 32px;border-bottom:1px solid #e5e9e7;font-size:17px;color:#879289;white-space:nowrap}.fb-scene .fb-tab{display:flex;align-items:center;border-bottom:3px solid transparent;padding:0 2px 5px}.fb-scene .fb-tab.active{color:#4979af;border-color:#528ed0;font-weight:500}
  .fb-scene .fb-options{position:absolute;left:280px;top:252px;bottom:0;width:310px;background:white;border-right:1px solid #e7e9e9}.fb-scene .fb-options h2{position:absolute;left:25px;top:25px;margin:0;font-size:23px;font-weight:550}.fb-scene .fb-group{position:absolute;left:25px;font-size:15px;font-weight:500;color:#a0a6a3;letter-spacing:.2px}.fb-scene .fb-option{position:absolute;left:24px;width:262px;height:48px;border:1px solid transparent;display:flex;align-items:center;gap:13px;border-radius:10px;padding:0 12px;font-size:20px;color:#626c65;white-space:nowrap}.fb-scene .fb-option.pink svg{color:#d691aa}.fb-scene .fb-option.purple svg{color:#a492d0}.fb-scene .fb-option.blue svg{color:#8aa6d1}
  .fb-scene .fb-canvas{position:absolute;left:590px;top:252px;width:1110px;height:668px;background-color:#fffafb;background-image:radial-gradient(#e8dfe3 .9px,transparent .9px);background-size:19px 19px;overflow:visible}.fb-scene .fb-canvas-title{position:absolute;left:31px;top:24px;font-size:25px;font-weight:550;color:#434e49}
  .fb-scene .fb-connections{position:absolute;left:0;top:0;width:1110px;height:668px;overflow:visible;pointer-events:none}.fb-scene .fb-connections line{stroke:#c9cdd1;stroke-width:1.5}.fb-scene .fb-port{fill:#fff;stroke:#bbc1c7;stroke-width:1.5}
  .fb-scene .fb-node{position:absolute;left:250px;width:610px;border:1px solid #e1e5e7;border-radius:16px;background:#fff;box-shadow:0 5px 18px #42435907;color:#515b62;z-index:2}
  .fb-scene .fb-trigger{top:92px;height:106px;padding:28px 27px 20px}.fb-scene .fb-question{top:332px;height:126px;padding:27px 27px 22px}.fb-scene .fb-node-copy{font-size:26px;line-height:1.4;letter-spacing:-.35px;max-width:554px}.fb-scene .fb-question .fb-node-copy{font-size:25px;line-height:1.45}
  .fb-scene .fb-pill{position:absolute;left:17px;top:-15px;height:29px;border:1px solid #f0d7e1;border-radius:7px;background:#fcedf3;color:#c78eaa;display:flex;align-items:center;gap:7px;padding:0 9px;font-size:15px;line-height:1;z-index:3}.fb-scene .fb-pill.purple{border-color:#e2d9ef;background:#f5f0fc;color:#a18abc}.fb-scene .fb-pill.blue{border-color:#dce6f3;background:#f1f6fc;color:#8ba7cf}
  .fb-scene .fb-deck{top:278px;height:120px;z-index:5;overflow:visible}.fb-scene .fb-deck-compact{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;gap:13px;padding:0 15px;font-size:20px;white-space:nowrap;color:#637991;overflow:hidden}.fb-scene .fb-deck-compact svg{color:#8aa6d1}.fb-scene .fb-deck-content{position:absolute;inset:0;display:flex;align-items:center;gap:23px;padding:16px 23px;overflow:hidden;border-radius:16px}.fb-scene .fb-deck-content strong{font-size:27px;font-weight:500;color:#58636b;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;letter-spacing:-.35px}.fb-scene .fb-cover{width:68px;height:85px;border:1px solid #304e75;border-radius:4px;background:linear-gradient(155deg,#172943,#244767);position:relative;box-shadow:0 3px 6px #14243816}.fb-scene .fb-cover svg{position:absolute;left:9px;top:10px;color:#9ab5d0;opacity:.75}.fb-scene .fb-cover i{position:absolute;left:11px;right:15px;bottom:18px;height:1px;background:#7e99b7;box-shadow:0 4px #5a7999,0 8px #5a7999}
  .fb-scene .fb-drop-target{position:absolute;left:230px;top:226px;width:650px;height:80px;border:1.5px dashed #b2c8e2;background:#f1f7fd7a;border-radius:15px;z-index:1}
  .fb-scene .fb-flow-plus{position:absolute;left:537px;top:480px;width:36px;height:36px;display:grid;place-items:center;color:#fff;background:#9cb7dc;border:1px solid #8fadd3;border-radius:50%;z-index:3;box-shadow:0 2px 4px #4f759c10}
  .fb-scene .fb-zoom{position:absolute;right:25px;bottom:26px;display:flex;align-items:center;height:39px;background:white;border:1px solid #e3e5e7;border-radius:9px;box-shadow:0 3px 8px #46524b05;color:#8c9690;z-index:2}.fb-scene .fb-zoom>span{display:flex;align-items:center;justify-content:center;width:36px;height:24px}.fb-scene .fb-zoom>span+span{border-left:1px solid #edf0ed}.fb-scene .fb-zoom .fb-zoom-value{width:62px;font-family:ProjectDisplay,sans-serif;font-size:15px}
  .fb-scene .fb-cursor{position:absolute;left:0;top:0;width:38px;height:46px;transform-origin:4px 3px;z-index:20;pointer-events:none;filter:drop-shadow(0 3px 3px #182e4125)}.fb-scene .fb-cursor .fx-cursor{position:static;display:block;width:38px;height:46px}
  .fb-scene .fb-click-ring{position:absolute;left:0;top:0;width:50px;height:50px;margin:-25px 0 0 -25px;border:2px solid #92b3d6;border-radius:50%;pointer-events:none;z-index:19}
  .fb-scene .fb-proof{position:absolute;bottom:27px;left:0;right:0;text-align:center;font-size:17px;letter-spacing:.2px;color:#f4f7f3;text-shadow:0 1px 5px #304d3b40}
  `;

  function forest() {
    const trees = [[40,650,1.7],[140,740,1.4],[275,555,1.9],[1660,620,1.8],[1780,780,1.45],[1840,520,2.15],[80,940,1.2],[1730,990,1.1]];
    return '<svg class="fb-forest" viewBox="0 0 1920 1080" aria-hidden="true"><circle cx="400" cy="150" r="275" fill="#edf2dd" opacity=".26"/><path d="M0 700Q310 560 650 755T1320 710T1920 690V1080H0Z" fill="#7f9980" opacity=".45"/><path d="M0 855Q490 715 980 900T1920 850V1080H0Z" fill="#547d62" opacity=".48"/>' + trees.map(([x,y,s],i)=>'<g transform="translate('+x+' '+y+') scale('+s+')" opacity="'+(i%2 ? '.44' : '.35')+'"><path d="M0 38V-235" stroke="#446b50" stroke-width="7"/><path d="m0-255-43 85h22l-45 81h30l-57 85H93L36-89h30l-45-81h22Z" fill="#426f51"/></g>').join('') + '</svg>';
  }
  function layoutRect(node, stop) {
    const width=node.offsetWidth,height=node.offsetHeight;
    let x=0,y=0;
    while(node && node!==stop){x+=node.offsetLeft;y+=node.offsetTop;node=node.offsetParent;}
    return {x,y,width,height};
  }

  UIFX.register({
    id: 'interaction-flow-deck-insert', title: 'Flow Builder · 拖入演示文档',
    category: 'interaction', duration: 13,
    description: '根据 Siddharth Vij 的静态 Flow Builder 构图重建三节点界面；原创演出从 Add Deck 拖入 Sales Playbook，节点和连接线原位让位，再保留阅读时间。',
    tags: ['Dashboard','AI Flow','节点插入','拖拽','连续对象'],
    source: 'https://x.com/siddharthvij_/status/2001253591798186010',
    referenceMedia: 'https://cdn.collectui.com/media/G8XhiKXacAAYqRL.avif',
    referenceTitle: "cleanest workflow builder design you'll see here ;)",
    sourceStatus: 'observed-reconstruction', sourceObservation: 'static-image',
    adaptationNotes: '保留静态参考图重复的 Guardrails 标签；森林、图标与头像为原创绘制，拖拽和插入节奏为原创，不代表真实 Hubspot 操作或原图包含动画。',
    params: {...defaults}
  }, function (ctx, params) {
    const p=Object.assign({},defaults,params),e=ctx.esc;
    const nav=[['agents','Agents'],['library','Content Library'],['leads','Leads'],['chat','Conversations'],['integrations','Integrations']];
    const options=[['trigger','Add trigger','pink',107],['stop','Add Stop','pink',157],['input','Add Input','purple',247],['question','Add Question','purple',297],['deck','Add Deck','blue',389],['flow','Add Product Flow','blue',439],['video','Add Product Video','blue',489]];
    const pill=(kind,text,color)=>'<span class="fb-pill '+(color || '')+'">'+icon(kind,15)+e(text)+'</span>';
    ctx.root.innerHTML='<style>'+CSS+'</style><div class="fx-scene fb-scene">'+forest()+
      '<section class="fb-app"><aside class="fb-sidebar"><div class="fb-brand"><span class="fb-brand-mark"><svg width="26" height="28" viewBox="0 0 26 28" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 5l10 10M17 5v9M17 17l-8 7"/><circle cx="4" cy="4" r="2.5" fill="currentColor"/><circle cx="17" cy="4" r="2.5" fill="currentColor"/><circle cx="18" cy="17" r="4.3" fill="currentColor"/><circle cx="7" cy="25" r="2.1" fill="currentColor"/></svg></span>Hubspot<span class="fb-brand-arrow">⌄</span></div><div class="fb-ask">'+icon('search',20)+'<span>Ask Hobbes</span></div><nav class="fb-navigation">'+nav.map(([name,label],i)=>'<div class="fb-nav-item'+(i===0?' active':'')+'">'+icon(name,20)+'<span>'+e(label)+'</span></div>').join('')+'</nav></aside>'+
      '<div class="fb-topbar"><div class="fb-breadcrumb"><span>Agents</span><span>/</span><b>Editing Demo Agent v3.2</b></div><div class="fb-top-tools">'+icon('help',21)+icon('gear',21)+icon('bell',21)+'<div class="fb-avatar">A</div></div></div>'+
      '<div class="fb-agent-title"><span class="fb-agent-icon">D</span><h1>Demo Agent v3.1</h1><span class="fb-active"><i></i>Active</span></div><div class="fb-subtitle">Agent for Outbound campaigns in West Coast territory.</div>'+
      '<div class="fb-tabs">'+['Personality','Discover','Qualifications','Knowledge Sources','Guardrails','Guardrails','Follow Up','Flow'].map(label=>'<div class="fb-tab'+(label==='Flow'?' active':'')+'">'+e(label)+'</div>').join('')+'</div>'+
      '<aside class="fb-options"><h2>Build Options</h2><div class="fb-group" style="top:80px">Actions</div><div class="fb-group" style="top:220px">Build</div><div class="fb-group" style="top:362px">Content</div><div class="fb-group" style="top:575px">Conditions</div>'+options.map(([name,label,color,y])=>'<div class="fb-option '+color+(name==='deck'?' fb-add-deck':'')+'" style="top:'+y+'px">'+icon(name,22)+'<span>'+e(label)+'</span></div>').join('')+'</aside>'+
      '<main class="fb-canvas"><div class="fb-canvas-title">Flow</div><svg class="fb-connections" viewBox="0 0 1110 668" aria-hidden="true"><line class="fb-upper-line" x1="555" y1="198" x2="555" y2="332"/><line class="fb-lower-line" x1="555" y1="290" x2="555" y2="332"/><line class="fb-tail-line" x1="555" y1="458" x2="555" y2="480"/><circle class="fb-port fb-upper-source" cx="555" cy="198" r="4"/><circle class="fb-port fb-upper-target" cx="555" cy="332" r="4"/><circle class="fb-port fb-lower-source" cx="555" cy="290" r="4"/><circle class="fb-port fb-lower-target" cx="555" cy="332" r="4"/><circle class="fb-port fb-tail-source" cx="555" cy="458" r="4"/></svg><div class="fb-drop-target"></div>'+
      '<article class="fb-node fb-trigger">'+pill('trigger','Trigger')+'<div class="fb-node-copy">'+e(p.prompt)+'</div></article>'+
      '<article class="fb-node fb-deck"><span class="fb-deck-pill">'+pill('deck','Deck','blue')+'</span><div class="fb-deck-compact">'+icon('deck',22)+'<span>Add Deck</span></div><div class="fb-deck-content"><div class="fb-cover"><svg width="47" height="40" viewBox="0 0 47 40" fill="none" stroke="currentColor" stroke-width=".7"><path d="m2 32 17-30 25 29-42 1 26-15-9-15 6 30-23-6 42-6M8 6h30"/></svg><i></i></div><strong>'+e(p.title)+'</strong></div></article>'+
      '<article class="fb-node fb-question">'+pill('question','Question','purple')+'<div class="fb-node-copy">'+e(p.result)+'</div></article><div class="fb-flow-plus">'+icon('plus',20)+'</div><div class="fb-zoom"><span>'+icon('fit',17)+'</span><span>'+icon('minus',17)+'</span><span class="fb-zoom-value">120%</span><span>'+icon('plus',17)+'</span></div></main></section>'+
      '<div class="fb-click-ring"></div><div class="fb-cursor">'+ctx.cursor()+'</div><div class="fb-proof">参考概念界面重建 · 原创插入演示/背景</div></div>';

    const canvas=layoutRect(ctx.q('.fb-canvas'),ctx.root),option=layoutRect(ctx.q('.fb-add-deck'),ctx.root);
    const deck=ctx.q('.fb-deck'),cursor=ctx.q('.fb-cursor'),ring=ctx.q('.fb-click-ring');
    const grab={x:option.x+option.width/2,y:option.y+option.height/2};
    const drop={x:canvas.x+555,y:canvas.y+266};
    const compactTop=266-option.height/2,compactBottom=266+option.height/2;
    const tl=ctx.gsap.timeline({paused:true});
    tl.set(ctx.q('.fb-app'),{opacity:0,y:16,scale:.99,transformOrigin:'50% 50%'},0)
      .set(ctx.qa('.fb-trigger,.fb-question'),{opacity:1,x:0,y:0},0)
      .set(deck,{opacity:0,x:option.x-canvas.x-250,y:option.y-canvas.y-278,width:option.width,height:option.height,borderColor:'#d8e2ee',boxShadow:'0 5px 18px #42435907'},0)
      .set(ctx.q('.fb-deck-compact'),{opacity:1},0)
      .set(ctx.qa('.fb-deck-content,.fb-deck-pill'),{opacity:0},0)
      .set(ctx.q('.fb-drop-target'),{opacity:0},0)
      .set(ctx.q('.fb-upper-line'),{attr:{y1:198,y2:332},opacity:1},0)
      .set(ctx.q('.fb-upper-target'),{attr:{cy:332},opacity:1},0)
      .set(ctx.q('.fb-upper-source'),{opacity:1},0)
      .set(ctx.q('.fb-lower-line'),{attr:{y1:compactBottom,y2:332},opacity:0},0)
      .set(ctx.q('.fb-lower-source'),{attr:{cy:compactBottom},opacity:0},0)
      .set(ctx.q('.fb-lower-target'),{attr:{cy:332},opacity:0},0)
      .set(ctx.q('.fb-tail-line'),{attr:{y1:458,y2:480},opacity:1},0)
      .set(ctx.q('.fb-tail-source'),{attr:{cy:458},opacity:1},0)
      .set(ctx.q('.fb-flow-plus'),{y:0,opacity:1},0)
      .set(ctx.q('.fb-add-deck'),{backgroundColor:'#ffffff',borderColor:'transparent'},0)
      .set(cursor,{opacity:0,x:1480,y:852,scale:1},0)
      .set(ring,{opacity:0,x:0,y:0,scale:.3},0)
      .to(ctx.q('.fb-app'),{opacity:1,y:0,scale:1,duration:.65,ease:'power3.out'},0);

    // Establish the palette control before copying its visual into a draggable tile.
    tl.to(cursor,{x:grab.x-4,y:grab.y-3,opacity:1,duration:.7,ease:'power2.inOut'},1.0)
      .to(ctx.q('.fb-add-deck'),{backgroundColor:'#f4f8fc',borderColor:'#dfebf5',duration:.25},1.65)
      .set(ring,{x:grab.x,y:grab.y,scale:.3,opacity:.7},1.95)
      .to(ring,{scale:1.25,opacity:0,duration:.42,ease:'power2.out'},1.95)
      .to(cursor,{scale:.89,duration:.1},1.95)
      .to(cursor,{scale:1,duration:.15},2.05)
      .to(deck,{opacity:.88,boxShadow:'0 12px 30px #617b9920',duration:.22},2.95)
      .to(cursor,{scale:.89,duration:.13},3.12)
      .to(ctx.q('.fb-drop-target'),{opacity:1,duration:.3},3.3);

    // One DOM element moves from the palette to the insertion point. The cursor
    // and compact tile share the same center, interval and easing while dragged.
    tl.to(deck,{x:555-option.width/2-250,y:compactTop-278,duration:1.75,ease:'power2.inOut'},3.3)
      .to(cursor,{x:drop.x-4,y:drop.y-3,duration:1.75,ease:'power2.inOut'},3.3)
      .to(cursor,{scale:1,duration:.16},5.12);

    // Split the original connector at the dropped tile, then animate every
    // endpoint with the same geometry as the growing card and moving Question.
    const insert=5.2,duration=1.1,ease='power3.inOut';
    tl.set(ctx.q('.fb-upper-line'),{attr:{y2:compactTop}},insert)
      .set(ctx.q('.fb-upper-target'),{attr:{cy:compactTop}},insert)
      .set(ctx.q('.fb-lower-line'),{attr:{y1:compactBottom,y2:332},opacity:1},insert)
      .set(ctx.q('.fb-lower-source'),{attr:{cy:compactBottom},opacity:1},insert)
      .set(ctx.q('.fb-lower-target'),{attr:{cy:332},opacity:1},insert)
      .to(deck,{x:0,y:0,width:610,height:120,opacity:1,duration,ease},insert)
      .to(ctx.q('.fb-question'),{y:150,duration,ease},insert)
      .to(ctx.q('.fb-upper-line'),{attr:{y2:278},duration,ease},insert)
      .to(ctx.q('.fb-upper-target'),{attr:{cy:278},duration,ease},insert)
      .to(ctx.q('.fb-lower-line'),{attr:{y1:398,y2:482},duration,ease},insert)
      .to(ctx.q('.fb-lower-source'),{attr:{cy:398},duration,ease},insert)
      .to(ctx.q('.fb-lower-target'),{attr:{cy:482},duration,ease},insert)
      .to(ctx.q('.fb-tail-line'),{attr:{y1:608,y2:630},duration,ease},insert)
      .to(ctx.q('.fb-tail-source'),{attr:{cy:608},duration,ease},insert)
      .to(ctx.q('.fb-flow-plus'),{y:150,duration,ease},insert)
      .to(ctx.q('.fb-drop-target'),{opacity:0,duration:.3},insert)
      .to(ctx.q('.fb-deck-compact'),{opacity:0,duration:.25},5.45)
      .to(ctx.q('.fb-deck-content'),{opacity:1,duration:.4,ease:'power2.out'},5.65)
      .to(ctx.q('.fb-deck-pill'),{opacity:1,duration:.3},5.85)
      .to(ctx.q('.fb-add-deck'),{backgroundColor:'#ffffff',borderColor:'transparent',duration:.4},5.5);

    // A single local confirmation pulse; the final three-node layout then holds.
    tl.to(deck,{borderColor:'#a8c5e5',boxShadow:'0 0 0 5px #e8f1fc',duration:.28,ease:'power2.out'},6.35)
      .to(deck,{borderColor:'#e1e5e7',boxShadow:'0 5px 18px #42435907',duration:.55,ease:'power2.out'},6.68)
      .to(cursor,{x:1658,y:825,duration:.7,ease:'power2.inOut'},5.55)
      .to(cursor,{opacity:0,duration:.25},6.6)
      .to({}, {duration:.01},12.99);
    return {timeline:tl,duration:13};
  });
})();
