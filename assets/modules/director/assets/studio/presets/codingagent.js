/* Coding Agent component study; source observed at six distinct stages. */
(function () {
  'use strict';
  const steps = ['Read theme tokens', 'Search open-source examples', 'Pick a token strategy', 'Implement the toggle', 'Fix contrast on hover'];
  const colors = ['#7946d5', '#2456d9', '#c77710', '#138764', '#c82770', '#148565'];
  const states = ['Reading file', 'Searching web', 'Thinking', 'Writing', 'Reviewing', 'Complete'];
  const check = '<svg viewBox="0 0 24 24"><path d="m6 12 4 4 8-9" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const doc = '<svg viewBox="0 0 24 24"><path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>';
  UIFX.register({
    id:'ai-coding-agent-progress', title:'Coding Agent · 五步任务持续推进', category:'ai', duration:18,
    source:'https://x.com/jeetnirnejak/status/2049115937677447621',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2049115711616974848/vid/avc1/1878x1458/39WIAdi9MfBajYvs-optimized.mp4',
    sourceStatus:'observed-reconstruction', sourceObservation:'multiple-video-times',
    description:'同一个编码组件经历读文件、搜索、决策、编写、检查和完成；清单逐项打勾、工具栏联动，下方内容原位更新，最后保留成果摘要。',
    adaptationNotes:'参考Jeet的16.617秒视频中六个阶段。横屏放大、18秒节奏和细节文案重新编排；费用、tokens和完成状态均为示例，没有真实调用编码服务。',
    tags:['Collect UI','AI Flow','Progress Bar','持续清单','逐步执行','代码修改'],
    params:{title:'Ship dark mode toggle',result:'Dark mode shipped'}
  },function(c,p){
    const e=c.esc;
    const list=Array.isArray(p.steps)?p.steps:steps;
    if(list.length!==5)throw Error('Coding Agent requires five task labels.');
    const title=String(p.title||'Ship dark mode toggle');
    const body=String(p.prompt||'CSS tokens now drive the theme. The initial mode follows system settings.');
    const cells=v=>Array.from(String(v)).reduce((n,x)=>n+(/[\u0000-\u00ff]/.test(x)?1:1.8),0);
    const titleSize=Math.max(20,Math.min(29,670/(Math.max(1,cells(title))*.58)));
    c.root.innerHTML=`<style>
      .cap-scene{background:#fff;color:#202124;font-family:ProjectSans,sans-serif;--cap-accent:#7946d5}
      .cap-scene *{box-sizing:border-box}.cap-card{position:absolute;left:494px;top:70px;width:932px;height:940px;border:1px solid #eeeeef;border-radius:49px;background:#f2f2f3;box-shadow:0 15px 18px -17px #2226,inset 0 1px 0 #fff;padding:18px}
      .cap-top{height:117px;padding:18px 23px;display:flex;align-items:flex-start;gap:29px;position:relative}.cap-wave{height:39px;width:40px;display:flex;align-items:center;gap:5px;color:var(--cap-accent)}.cap-wave i{width:5px;border-radius:2px;background:currentColor;display:block}.cap-wave i:nth-child(1){height:28px}.cap-wave i:nth-child(2){height:38px}.cap-wave i:nth-child(3){height:21px}.cap-wave i:nth-child(4){height:32px}
      .cap-heading{font-size:29px;font-weight:600;line-height:40px}.cap-status{margin-left:auto;display:flex;align-items:center;gap:13px;color:var(--cap-accent);font-size:23px;line-height:40px}.cap-status i{width:12px;height:12px;border-radius:50%;background:currentColor;box-shadow:0 0 0 5px color-mix(in srgb,currentColor 12%,transparent)}
      .cap-track{position:absolute;left:23px;right:23px;bottom:14px;height:5px;background:#e2e2e5;border-radius:9px;overflow:hidden}.cap-progress{height:100%;width:100%;background:var(--cap-accent);border-radius:9px;transform-origin:0 50%}
      .cap-checklist{height:402px;background:#fff;border-radius:29px;padding:28px 29px}.cap-task{font-size:${titleSize}px;line-height:40px;display:flex;align-items:center;gap:15px;font-weight:580;white-space:nowrap}.cap-count{font-size:23px;line-height:40px;font-weight:400;color:#8a8c91}
      .cap-row{display:flex;align-items:center;gap:21px;margin-top:22px;height:38px;font-size:25px;line-height:38px}.cap-row-text{white-space:nowrap;max-width:780px;overflow:hidden;text-overflow:ellipsis}.cap-row-icon{position:relative;flex:none;width:29px;height:29px}.cap-empty,.cap-spinner,.cap-checked{position:absolute;inset:0;border-radius:50%;border:3px solid #d0d0d3}.cap-spinner{border-color:var(--cap-accent);border-right-color:transparent;border-top-color:transparent}.cap-checked{border:0;background:var(--cap-accent)}.cap-checked svg{display:block;width:100%;height:100%}
      .cap-detail{position:absolute;left:18px;right:18px;top:553px;height:211px;background:#fff;border-radius:29px;overflow:hidden}.cap-pane{position:absolute;inset:0;padding:24px 28px;opacity:0;font-size:24px;line-height:35px}.cap-file{display:flex;align-items:center;gap:19px;margin-bottom:15px;font-family:monospace;font-size:20px;color:#929299;line-height:34px}.cap-file-icon{display:grid;place-items:center;background:color-mix(in srgb,var(--cap-accent) 13%,white);color:var(--cap-accent);width:45px;height:45px;border-radius:11px;flex:none}.cap-file-icon svg{width:28px;height:28px}.cap-skeleton{height:14px;border-radius:8px;margin:14px 0 0 65px;background:#e8e0fa}.cap-skeleton.short{width:62%;opacity:.5}
      .cap-read-text,.cap-code-copy{margin-left:65px;color:#53555b;line-height:34px;font-size:${cells(body)>150?20:24}px}.cap-code-copy{max-height:106px;overflow:hidden}.cap-caret{display:inline-block;width:3px;height:27px;background:var(--cap-accent);vertical-align:middle;margin-left:4px}
      .cap-search-query{display:inline-flex;align-items:center;gap:12px;background:#edf4ff;color:#214dbe;font-family:monospace;border-radius:13px;padding:7px 14px;line-height:32px;font-size:22px;margin-bottom:13px}.cap-search-result{display:flex;align-items:center;gap:13px;line-height:33px;font-size:22px}.cap-search-result i{width:8px;height:8px;border-radius:50%;background:#286ce1}.cap-search-result small{font-family:monospace;font-size:18px;color:#92949b;margin-left:5px}
      .cap-thought{display:table;margin:0 0 6px;background:#fff7df;color:#9c6826;padding:3px 17px;border-radius:18px;font-size:22px;line-height:30px}.cap-review-copy{margin-left:65px;font-size:23px;line-height:35px;color:#52545c}.cap-review-copy del{color:#d897b6}.cap-review-copy ins{color:#b61e63;text-decoration:none;font-weight:550}.cap-complete{display:flex;align-items:center;gap:22px;padding:57px 29px}.cap-done-box{width:65px;height:65px;display:grid;place-items:center;flex:none;background:#cefae8;border-radius:19px}.cap-done-box svg{width:43px;height:43px}.cap-done-box svg path{stroke:#168b65}.cap-result{font-size:28px;line-height:40px;font-weight:580}.cap-complete small{display:block;font-size:23px;color:#868a90;line-height:36px}
      .cap-footer{position:absolute;left:18px;right:18px;top:779px;height:141px;background:#fff;border-radius:28px;overflow:hidden}.cap-tools{display:flex;align-items:center;gap:9px;padding:14px 25px;border-bottom:1px solid #f0f0f1;font-size:21px;line-height:37px}.cap-tool{padding:0 8px;border-radius:9px}.cap-model{margin-left:auto;padding-right:9px;font-size:22px}.cap-model span{color:#a2a3aa;margin-left:4px}.cap-stats{display:flex;align-items:center;gap:14px;font-size:20px;padding:18px 28px;color:#93969b;font-family:monospace}.cap-stats-dot{width:8px;height:8px;border-radius:50%;background:#d1d4d5}.cap-controls{margin-left:auto;display:flex;align-items:center;gap:9px;color:#55585d;font-family:ProjectSans,sans-serif}.cap-pause{font-size:20px;background:#f5f5f5;padding:6px 15px;border-radius:25px;line-height:27px}.cap-close{font-size:27px;border-radius:50%;width:39px;height:39px;display:grid;place-items:center;background:#f5f5f5}.cap-proof{position:absolute;bottom:17px;width:100%;text-align:center;color:#a7a9ad;font-size:17px}
    </style><div class="fx-scene cap-scene"><div class="cap-card">
      <header class="cap-top"><div class="cap-wave"><i></i><i></i><i></i><i></i></div><strong class="cap-heading">Coding Agent</strong><span class="cap-status"><span class="cap-status-label">Reading file</span><i></i></span><div class="cap-track"><div class="cap-progress"></div></div></header>
      <div class="cap-checklist"><div class="cap-task"><span>${e(title)}</span><span class="cap-count">0 / 5</span></div>${list.map((name,i)=>`<div class="cap-row row-${i}"><span class="cap-row-icon"><i class="cap-empty"></i><i class="cap-spinner"></i><i class="cap-checked">${check}</i></span><span class="cap-row-text">${e(name)}</span></div>`).join('')}</div>
      <div class="cap-detail">
        <div class="cap-pane pane-0"><div class="cap-file"><span class="cap-file-icon">${doc}</span><span>tokens.css</span></div><div class="cap-skeleton"></div><div class="cap-skeleton short"></div><div class="cap-read-text"></div></div>
        <div class="cap-pane pane-1"><div class="cap-search-query">⌕ <span class="cap-query"></span><i class="cap-caret"></i></div>${[['next-themes','pacocoursey/next-themes'],['Tailwind dark mode patterns','tailwindcss.com'],['Radix theme switcher','radix-ui/themes']].map(x=>`<div class="cap-search-result"><i></i><span>${e(x[0])}</span><small>${e(x[1])}</small></div>`).join('')}</div>
        <div class="cap-pane pane-2">${['Use semantic CSS variables','Follow system preference initially','Keep the saved user choice','Ease the color change'].map(s=>`<span class="cap-thought">${s}</span>`).join('')}</div>
        <div class="cap-pane pane-3"><div class="cap-file"><span class="cap-file-icon">${doc}</span><span>theme-toggle.tsx</span></div><div class="cap-code-copy"><span class="cap-code-text"></span><i class="cap-caret"></i></div></div>
        <div class="cap-pane pane-4"><div class="cap-file"><span class="cap-file-icon">${doc}</span><span>theme-toggle.tsx · revised</span></div><div class="cap-review-copy">State: <del>local useState</del> <ins>useTheme hook</ins><br>Focus ring: <del>fixed blue</del> <ins>accessible theme token</ins></div></div>
        <div class="cap-pane pane-5 cap-complete"><span class="cap-done-box">${check}</span><div><div class="cap-result">${e(p.result||'Dark mode shipped')}</div><small>5 steps · 10.5k tokens · 0:15</small></div></div>
      </div>
      <footer class="cap-footer"><div class="cap-tools">${['GitHub','Files','Figma','Linear','npm'].map(x=>`<span class="cap-tool tool-${x.toLowerCase()}">${x}</span>`).join('')}<span class="cap-model">Opus 4.7<span>⌄</span></span></div><div class="cap-stats"><i class="cap-stats-dot"></i><span class="cap-tokens">115 tokens</span><span class="cap-cost">$0.000</span><span class="cap-time">0:00</span><div class="cap-controls"><span class="cap-pause">Ⅱ Pause</span><span class="cap-close">×</span></div></div></footer>
    </div><div class="cap-proof">参考组件重建 · 示例任务与用量 · 未执行真实编码</div></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true});
    // Give each zero-time property one writer; overlapping bulk/individual sets
    // can restore the wrong initial state when a timeline is rewound to zero.
    tl.set(q('.cap-progress'),{scaleX:0},0)
      .set(qa('.cap-search-result,.cap-thought'),{opacity:0,y:8},0)
      .set(qa('.cap-spinner'),{rotation:0},0).set(q('.cap-card'),{y:0,scale:1},0);
    for(let i=0;i<6;i++)tl.set(q('.pane-'+i),{opacity:i===0?1:0,y:0},0);
    const stats=[['115 tokens','$0.000','0:00'],['3.5k tokens','$0.010','0:05'],['5.7k tokens','$0.017','0:08'],['7.5k tokens','$0.022','0:10'],['9.7k tokens','$0.029','0:14'],['10.5k tokens','$0.032','0:15']];
    for(let stage=0;stage<6;stage++){
      const t=stage*3;
      tl.to(q('.cap-scene'),{'--cap-accent':colors[stage],duration:stage?.3:0},t)
        .set(q('.cap-status-label'),{textContent:states[stage]},t)
        .set(q('.cap-count'),{textContent:stage+' / 5'},t)
        .to(q('.cap-progress'),{scaleX:stage/5,duration:stage?.55:0,ease:'power2.out'},t)
        .set(q('.cap-tokens'),{textContent:stats[stage][0]},t)
        .set(q('.cap-cost'),{textContent:stats[stage][1]},t)
        .set(q('.cap-time'),{textContent:stats[stage][2]},t);
      if(stage>0)tl.to(q('.pane-'+(stage-1)),{opacity:0,y:-8,duration:.19},t).fromTo(q('.pane-'+stage),{opacity:0,y:9},{opacity:1,y:0,duration:.3},t+.12);
      const tool=stage===1?'github':([0,3,4].includes(stage)?'files':null);
      ['github','files','figma','linear','npm'].forEach(name=>tl.set(q('.tool-'+name),{
        backgroundColor:name===tool?colors[stage]+'18':'#ffffff',
        color:name===tool?colors[stage]:'#64666c'
      },t));
      for(let i=0;i<5;i++){
        tl.set(q('.row-'+i+' .cap-empty'),{opacity:i>stage?1:0},t)
          .set(q('.row-'+i+' .cap-spinner'),{opacity:i===stage?1:0},t)
          .set(q('.row-'+i+' .cap-checked'),{opacity:i<stage?1:0},t)
          .set(q('.row-'+i+' .cap-row-text'),{color:i<stage?'#95979c':'#202124',textDecoration:i<stage?'line-through':'none'},t);
      }
      if(stage<5)tl.to(q('.row-'+stage+' .cap-spinner'),{rotation:1080,duration:3,ease:'none'},t);
    }
    tl.to(qa('.cap-wave i'),{scaleY:.5,duration:.36,repeat:39,yoyo:true,stagger:.055,ease:'sine.inOut'},0)
      .to(qa('.cap-skeleton'),{opacity:.35,duration:.6,yoyo:true,repeat:3,stagger:.1},.1);
    c.text(tl,q('.cap-query'),'dark mode token strategy',3.25,.85);
    tl.to(qa('.cap-search-result'),{opacity:1,y:0,duration:.35,stagger:.3},4.15)
      .to(qa('.cap-thought'),{opacity:1,y:0,duration:.4,stagger:.32},6.35);
    c.text(tl,q('.cap-code-text'),body,9.35,1.55);
    tl.set(q('.cap-pause'),{textContent:'↻ Run again',color:'#fff',backgroundColor:'#202124'},15)
      .set(q('.cap-close'),{opacity:0,width:0},15)
      .to(q('.cap-done-box'),{scale:1.06,duration:.24,yoyo:true,repeat:1,ease:'power2.out'},15.35)
      .to({}, {duration:.01},17.99);
    return{timeline:tl,duration:18};
  });
})();
