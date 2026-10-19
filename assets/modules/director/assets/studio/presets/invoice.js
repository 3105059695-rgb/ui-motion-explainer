/* Static composition study: original focus/selection motion, no external execution. */
(function () {
  'use strict';
  UIFX.register({
    id:'interaction-invoice-node-focus', title:'发票流程 · 聚焦 AI 提取节点', category:'interaction', duration:10,
    source:'https://x.com/mikun_ux/status/2058855625845571854',
    sourceStatus:'observed-reconstruction', sourceObservation:'static-image',
    description:'重建 Invoice processing 草稿画布、四个相连节点和琥珀色选区；点击与局部推近为原创，始终保持配置草稿。',
    tags:['Collect UI','AI Flow','节点选择','局部推近','草稿'],
    params:{title:'Invoice processing',prompt:'Read attachments · Pull amount · Pull vendor'}
  }, function (ctx,params) {
    const p=Object.assign({title:'Invoice processing',prompt:'Read attachments · Pull amount · Pull vendor'},params);
    const icon=(path,cls='')=>'<svg class="iv-icon '+cls+'" viewBox="0 0 24 24" aria-hidden="true"><path d="'+path+'"/></svg>';
    const mail=icon('M4 6h16v12H4z M4 7l8 6 8-6');
    const sparkle=icon('m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z M4 2v4M2 4h4','iv-spark');
    const crm=icon('M4 4h16v16H4z M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2');
    const slack='<svg class="iv-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3v7M3 9h3" stroke="#36c5f0"/><path d="M21 9h-7M15 3v3" stroke="#2eb67d"/><path d="M15 21v-7M21 15h-3" stroke="#ecb22e"/><path d="M3 15h7M9 21v-3" stroke="#e01e5a"/></svg>';
    const nodes=[['email','New Email Received','Active','Gmail · Inbox · Has Attachments',mail],['extract','Extract Invoice Data','AI',p.prompt,sparkle],['crm','Create CRM Record','Records','Add new record · Deal pipeline',crm],['slack','Send Slack Notification','Slack','Add new record · Deal pipeline',slack]];
    ctx.root.innerHTML=`<style>
      .iv-scene{position:absolute;inset:0;overflow:hidden;background:#f2f2f3;font-family:ProjectSans,sans-serif;color:#303338}.iv-scene *{box-sizing:border-box}
      .iv-window{position:absolute;left:96px;top:60px;width:1728px;height:954px;border:1px solid #e1e2e4;background:#fff;box-shadow:0 12px 35px #252a3008;overflow:hidden}
      .iv-header{height:72px;display:flex;align-items:center;padding:0 28px;gap:18px;border-bottom:1px solid #e9eaec;font-size:23px;background:#fff;position:relative;z-index:3}.iv-muted{color:#8b8e93}.iv-header strong{font-weight:500;max-width:760px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.iv-draft{font-size:19px;padding:3px 10px;border-radius:9px;color:#499fbe;background:#eaf7fc}.iv-star{font-size:26px;color:#c9cbce}
      .iv-canvas{position:absolute;inset:72px 0 0;background:radial-gradient(#dfe3e7 1.3px,transparent 1.3px);background-size:28px 28px;background-position:12px 12px}.iv-camera{position:absolute;inset:0;transform-origin:1100px 347px}.iv-paths{position:absolute;inset:0;width:1728px;height:882px;overflow:visible}.iv-paths path{stroke:#dfe2e5;stroke-width:2;fill:none}.iv-paths circle{fill:white;stroke:#e2e4e6;stroke-width:2}
      .iv-node{position:absolute;left:930px;width:620px;height:130px;border:1.5px solid #e3e5e7;border-radius:19px;background:white;box-shadow:0 4px 13px #28323b05;overflow:visible}.iv-email{top:76px}.iv-extract{top:276px}.iv-crm{top:476px}.iv-slack{top:676px}.iv-row{height:74px;display:flex;align-items:center;gap:15px;margin:0 21px;border-bottom:1px solid #ebedef;position:relative}.iv-iconbox{display:flex;align-items:center;justify-content:center;border:1px solid #e6e8ea;border-radius:10px;width:40px;height:40px;flex-shrink:0}.iv-icon{width:26px;height:26px;fill:none;stroke:#a7afb6;stroke-width:1.5;stroke-linejoin:round;stroke-linecap:round}.iv-slack .iv-icon path{stroke-width:3.8}.iv-spark{stroke:#c6a483}.iv-row strong{font-size:25px;font-weight:400;line-height:1.4;white-space:nowrap}.iv-badge{font-size:20px;line-height:1;padding:5px 7px;margin-left:auto;color:#8c9096;border:1px solid #e5e7e9;border-radius:5px;background:#fcfcfc}.iv-node p{margin:12px 21px 0;font-size:21px;line-height:30px;color:#92969c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.iv-trigger{position:absolute;left:0;top:-34px;display:flex;align-items:center;gap:8px;border:1px solid #e3e6e8;border-radius:8px 8px 0 0;padding:3px 10px;background:#fff;color:#a0a5ab;font-size:19px}.iv-trigger svg{width:23px;height:23px}
      .iv-zoom{position:absolute;left:28px;bottom:18px;height:47px;border:1px solid #e3e4e7;border-radius:9px;background:white;display:flex;align-items:center;gap:20px;padding:0 17px;box-shadow:0 4px 12px #1e283a06;font-size:21px;color:#777e86}.iv-zoom b{font-size:25px;font-weight:400}.iv-proof{position:absolute;bottom:18px;right:97px;font-size:17px;color:#91989e}.iv-pointer{position:absolute;inset:0;pointer-events:none;z-index:8}.iv-pointer .fx-cursor{position:absolute;top:0;left:0}.iv-ring{position:absolute;width:50px;height:50px;border:2px solid #d9aa58;border-radius:50%;top:0;left:0;opacity:0}
    </style><div class="iv-scene"><div class="iv-window"><header class="iv-header"><span class="iv-muted">▯</span><span class="iv-muted">Workflows</span><span class="iv-muted">›</span><strong>${ctx.esc(p.title)}</strong><span class="iv-star">☆</span><span class="iv-draft">Draft</span></header><div class="iv-canvas"><div class="iv-camera"><svg class="iv-paths" viewBox="0 0 1728 882" aria-hidden="true"><path d="M1240 206V276M1240 406V476M1240 606V676M1240 806v16"/><circle cx="1240" cy="276" r="9"/><circle cx="1240" cy="476" r="9"/><circle cx="1240" cy="676" r="9"/><circle cx="1240" cy="806" r="9"/></svg>${nodes.map(([id,title,badge,desc,svg])=>`<article class="iv-node iv-${id}">${id==='email'?'<span class="iv-trigger">'+icon('M12 3v18M3 12h18 M12 5a7 7 0 1 1-.1 0')+'Trigger</span>':''}<div class="iv-row"><span class="iv-iconbox">${svg}</span><strong>${ctx.esc(title)}</strong><span class="iv-badge">${badge}</span></div><p>${ctx.esc(desc)}</p></article>`).join('')}</div><div class="iv-zoom"><b>−</b><span>125%⌄</span><b>＋</b></div></div></div><div class="iv-proof">静态界面参考重建 · 原创选择与推近演示</div><div class="iv-pointer">${ctx.cursor()}<span class="iv-ring"></span></div></div>`;
    const tl=ctx.gsap.timeline({paused:true}),q=ctx.q,cursor=q('.fx-cursor'),ring=q('.iv-ring');
    tl.set(q('.iv-window'),{scale:.96,y:30,opacity:0,transformOrigin:'50% 50%'},0)
      .set(q('.iv-camera'),{scale:1,x:0,y:0},0)
      .set(cursor,{x:1620,y:810,opacity:0,scale:1},0).set(ring,{x:0,y:0,opacity:0,scale:.3},0)
      .set(q('.iv-extract'),{borderColor:'#e3e5e7',boxShadow:'0 4px 13px #28323b05'},0)
      .to(q('.iv-window'),{scale:1,y:0,opacity:1,duration:.85,ease:'power3.out'},0)
      .to(cursor,{opacity:1,duration:.25},1.65)
      .to(cursor,{x:1330,y:458,duration:1,ease:'power2.inOut'},1.8);
    ctx.click(tl,cursor,ring,1330,458,3);
    tl.to(q('.iv-extract'),{borderColor:'#e6b75e',boxShadow:'0 0 0 3px #e8bf6712',duration:.3},3.12)
      .to(q('.iv-camera'),{scale:1.085,x:-115,y:0,duration:1.2,ease:'power3.inOut'},3.75)
      .to(cursor,{x:1615,y:855,duration:.8,ease:'power2.inOut'},3.6)
      .to(cursor,{opacity:0,duration:.3},4.6)
      .to(q('.iv-camera'),{scale:1,x:0,y:0,duration:1.15,ease:'power3.inOut'},6.55)
      .to(q('.iv-extract'),{boxShadow:'0 4px 13px #28323b05',duration:.5},7.4)
      .to({}, {duration:.01},9.99);
    return {timeline:tl,duration:10};
  });
})();
