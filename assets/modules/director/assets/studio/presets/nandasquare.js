/* Nested workflow-step folding study, rebuilt from nanda's observed video. */
(function () {
  'use strict';
  const actionIcon='<svg viewBox="0 0 26 26" aria-hidden="true"><rect x="4" y="3.5" width="17" height="18" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="m8 13 3 3 5-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const waitIcon='<svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 7v6h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const approvalIcon='<svg viewBox="0 0 26 26" aria-hidden="true"><path d="M7 4v9m0 0 3-2m-3 2-4-3M7 15v5h13V8h-9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const expanded={
    fanLeft:'M960 222V254Q960 274 940 274H510Q490 274 490 294V332',
    fanRight:'M960 222V254Q960 274 980 274H1410Q1430 274 1430 294V332',
    mergeLeft:'M490 442V758Q490 778 510 778H940Q960 778 960 798V820',
    mergeRight:'M1430 442V758Q1430 778 1410 778H980Q960 778 960 798V820',
    mergeCenter:'M960 746V820'
  };
  const compact={
    fanLeft:'M960 222V254Q960 274 940 274H560Q540 274 540 294V332',
    fanRight:'M960 222V254Q960 274 980 274H1360Q1380 274 1380 294V332',
    mergeLeft:'M540 442V454Q540 474 560 474H940Q960 474 960 494V516',
    mergeRight:'M1380 442V454Q1380 474 1360 474H980Q960 474 960 494V516',
    mergeCenter:'M960 442V516'
  };
  UIFX.register({
    id:'interaction-nested-step-toggle', title:'Nested Steps · 子流程折叠与展开', category:'interaction', duration:14,
    source:'https://x.com/nandafyi/status/2004213111486820795',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2004213060685512704/vid/avc1/720x720/E-zxo4hwhzgI1SJA-optimized.mp4',
    sourceStatus:'observed-reconstruction', sourceObservation:'multiple-video-times',
    description:'橙色选中的两步子流程经历两轮收起与展开；内部节点、两侧分支、末端任务和连接线持续重排，Enter反馈对应每次开合，末尾取消选中。',
    adaptationNotes:'参考nanda的9.776秒方形视频。保留三分支和两步嵌套结构，放大并横屏重排为14秒；末端写入文案缩短，所有任务均为界面示意，没有执行API、审批或写入。',
    tags:['Collect UI','AI Flow','UI Interaction','子流程','嵌套节点','布局重排','键盘反馈'],
    params:{title:'my first step',prompt:'fetch from api',result:'write action · may fail'}
  },function(c,p){
    const e=c.esc;
    const node=(type,label,cls,icon=actionIcon)=>`<article class="nns-node ${cls}"><div class="nns-type"><span>${e(type)}</span><svg viewBox="0 0 18 6" aria-hidden="true"><circle cx="3" cy="3" r="1.2"/><circle cx="9" cy="3" r="1.2"/><circle cx="15" cy="3" r="1.2"/></svg></div><div class="nns-task">${icon}<span class="nns-task-text">${e(label)}</span></div><i class="nns-port nns-input"></i><i class="nns-port nns-output"></i></article>`;
    c.root.innerHTML=`<style>
      .nns-scene{background:#fafafa;background-image:radial-gradient(circle,#d5d5d5 1px,transparent 1.4px);background-size:34px 34px;color:#202020;font-family:ProjectSans,sans-serif}.nns-scene *{box-sizing:border-box}
      .nns-wires{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none}.nns-wire{fill:none;stroke:#a2a2a2;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
      .nns-node{position:absolute;border:1.5px solid #d8d8d8;border-radius:13px;background:#fff;box-shadow:0 3px 5px #0000000b;height:110px}.nns-type{height:42px;padding:5px 16px;display:flex;align-items:center;justify-content:space-between;background:#f8f8f8;border-bottom:1px solid #e4e4e4;border-radius:12px 12px 0 0;color:#7e7e7e;font-family:ProjectSans,sans-serif;font-size:22px;line-height:31px;letter-spacing:.15px}.nns-type svg{width:18px;height:6px;fill:#858585;flex:none}
      .nns-task{height:67px;padding:10px 18px;display:flex;align-items:center;gap:10px;color:#262626}.nns-task svg{width:25px;height:25px;flex:none}.nns-task-text{font-size:27px;line-height:40px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
      .nns-root{left:824px;top:112px;width:272px}.nns-root .nns-input{display:none}.nns-left{left:325px;top:332px;width:330px}.nns-right{left:1255px;top:332px;width:350px}.nns-final{left:560px;top:820px;width:800px}.nns-final .nns-task{padding-left:24px}.nns-final .nns-task-text{font-size:30px}.nns-final .nns-output{display:none}
      .nns-port{position:absolute;left:calc(50% - 6px);width:12px;height:12px;border-radius:3px;background:#fff;border:1.5px solid #d0d0d0;z-index:4}.nns-input{top:-6px;background:#aaa;border-color:#aaa;height:8px;border-radius:2px}.nns-output{bottom:-6px}
      .nns-envelope{position:absolute;left:745px;top:360px;width:430px;height:386px;border:1.5px solid #d5d5d5;border-radius:24px;background:#f6f6f6}
      .nns-inner-viewport{position:absolute;left:18px;top:52px;width:394px;height:302px;overflow:hidden}.nns-fetch{left:50px;top:14px;width:294px}.nns-parse{left:26px;top:188px;width:340px}.nns-fetch .nns-input{display:none}.nns-parse .nns-output{display:none}.nns-inner-line{position:absolute;left:0;top:0;width:394px;height:302px;pointer-events:none}.nns-inner-line path{fill:none;stroke:#a2a2a2;stroke-width:3;stroke-linecap:round}
      .nns-group-header{position:absolute;left:800px;top:332px;width:320px;height:70px;border:1.5px solid #d2d2d2;border-radius:12px;background:#fff;display:flex;align-items:center;box-shadow:0 3px 5px #0000000b;z-index:5}.nns-group-copy{padding-left:23px;display:flex;align-items:center;gap:13px;min-width:0;flex:1;font-family:ProjectSans,sans-serif;font-size:28px;line-height:42px;letter-spacing:.1px}.nns-group-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:171px}.nns-badge{width:27px;height:28px;flex:none;display:grid;place-items:center;border-radius:5px;background:#777;color:#fff;font:22px/28px ProjectSans,sans-serif;font-variant-numeric:tabular-nums}.nns-chevron-box{width:68px;height:100%;display:grid;place-items:center;border-left:1.5px solid #e5e5e5;flex:none}.nns-chevron{width:26px;height:26px;transform-origin:50% 50%}.nns-chevron path{fill:none;stroke:#494949;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .nns-focus{position:absolute;inset:-4px;border:2px solid #e8a36e;box-shadow:0 0 0 5px #e5a26420;border-radius:15px;pointer-events:none}.nns-group-in{position:absolute;left:954px;top:326px;background:#aaa;border-color:#aaa;height:8px;border-radius:2px}.nns-group-out{position:absolute;left:954px;top:740px}
      .nns-key{position:absolute;left:904px;top:958px;width:112px;height:70px;display:grid;place-items:center;border:1.5px solid #3a3a3b;border-radius:22px;background:#2b2b2d;box-shadow:0 5px 12px #0002;color:#e2e2e5}.nns-key svg{width:66px;height:46px}.nns-key path{fill:none;stroke:currentColor;stroke-width:5;stroke-linecap:round;stroke-linejoin:round}
      .nns-proof{position:absolute;bottom:17px;left:0;width:100%;text-align:center;font-size:17px;line-height:22px;color:#999}.nns-scene .fx-cursor{width:30px;height:37px}
    </style><div class="fx-scene nns-scene">
      <svg class="nns-wires" viewBox="0 0 1920 1080" aria-hidden="true"><path class="nns-wire wire-fanLeft" d="${expanded.fanLeft}"/><path class="nns-wire wire-fanRight" d="${expanded.fanRight}"/><path class="nns-wire" d="M960 222V332"/><path class="nns-wire wire-mergeLeft" d="${expanded.mergeLeft}"/><path class="nns-wire wire-mergeRight" d="${expanded.mergeRight}"/><path class="nns-wire wire-mergeCenter" d="${expanded.mergeCenter}"/></svg>
      ${node('do',p.title||'my first step','nns-root')}
      ${node('waitForEvent',p.approval||'request-approval','nns-left',approvalIcon)}
      ${node('sleep',p.wait||'wait on something','nns-right',waitIcon)}
      <div class="nns-envelope"><div class="nns-inner-viewport"><svg class="nns-inner-line" viewBox="0 0 394 302" aria-hidden="true"><path d="M197 124V188"/></svg>${node('do',p.prompt||'fetch from api','nns-fetch')}${node('do',p.parseResult||'parse api results','nns-parse')}</div></div>
      <i class="nns-port nns-group-in"></i><i class="nns-port nns-group-out"></i>
      <div class="nns-group-header"><i class="nns-focus"></i><div class="nns-group-copy"><span class="nns-group-name">${e(p.groupLabel||'parseApi')}</span><span class="nns-badge">2</span></div><div class="nns-chevron-box"><svg class="nns-chevron" viewBox="0 0 26 26" aria-hidden="true"><path d="m6 16 7-7 7 7"/></svg></div></div>
      ${node('do',p.result||'write action · may fail','nns-final')}
      <div class="nns-key"><svg viewBox="0 0 66 46" aria-hidden="true"><path d="M51 8v17H15m0 0 11-11M15 25l11 11"/></svg></div>
      ${c.cursor()}<div class="nns-proof">参考交互重建 · 示例工作流 · 未执行 API、审批或写入</div>
    </div>`;
    const q=c.q,tl=c.gsap.timeline({paused:true});
    tl.set(q('.nns-envelope'),{x:0,y:0,width:430,height:386},0)
      .set(q('.nns-inner-viewport'),{height:302,opacity:1},0)
      .set(q('.nns-left'),{x:0},0).set(q('.nns-right'),{x:0},0)
      .set(q('.nns-final'),{y:0},0).set(q('.nns-group-header'),{y:0},0)
      .set(q('.nns-group-out'),{y:0},0)
      .set(q('.nns-chevron'),{rotation:0},0)
      .set(q('.nns-focus'),{opacity:1},0)
      .set(q('.nns-key'),{opacity:0,scale:.93},0)
      .set(q('.fx-cursor'),{x:190,y:660},0);
    Object.keys(expanded).forEach(name=>tl.set(q('.wire-'+name),{attr:{d:expanded[name]}},0));
    function toggle(start,isCompact){
      const paths=isCompact?compact:expanded;
      tl.to(q('.nns-envelope'),{x:isCompact?35:0,y:isCompact?-28:0,width:isCompact?360:430,height:isCompact?110:386,duration:.72,ease:'power2.inOut'},start)
        .to(q('.nns-left'),{x:isCompact?50:0,duration:.72,ease:'power2.inOut'},start)
        .to(q('.nns-right'),{x:isCompact?-50:0,duration:.72,ease:'power2.inOut'},start)
        .to(q('.nns-final'),{y:isCompact?-304:0,duration:.72,ease:'power2.inOut'},start)
        .to(q('.nns-group-header'),{y:isCompact?20:0,duration:.72,ease:'power2.inOut'},start)
        .to(q('.nns-group-out'),{y:isCompact?-304:0,duration:.72,ease:'power2.inOut'},start)
        .to(q('.nns-chevron'),{rotation:isCompact?180:0,duration:.3,ease:'power2.inOut'},start+.03)
        .to(q('.nns-inner-viewport'),{height:isCompact?0:302,opacity:isCompact?0:1,duration:isCompact?.3:.56,ease:'power2.inOut'},start+(isCompact?0:.10))
        .to(q('.nns-key'),{opacity:1,scale:1,duration:.10,ease:'power2.out'},start)
        .to(q('.nns-key'),{opacity:0,scale:.97,duration:.35,ease:'power2.out'},start+.72);
      Object.keys(paths).forEach(name=>tl.to(q('.wire-'+name),{attr:{d:paths[name]},duration:.72,ease:'power2.inOut'},start));
    }
    toggle(2.1,true);toggle(4.9,false);toggle(7.5,true);toggle(10,false);
    tl.to(q('.fx-cursor'),{x:280,y:925,duration:.65,ease:'power2.inOut'},11.7)
      .to(q('.nns-focus'),{opacity:0,duration:.3,ease:'power2.out'},12.35)
      .to({}, {duration:.01},13.99);
    return{timeline:tl,duration:14};
  });
})();
