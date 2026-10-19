/* Bruce Cao / Collect UI: failed tool, durable restart, resumed runtime. */
(function(){
  'use strict';
  UIFX.register({
    id:'ai-runtime-self-correct',title:'自纠错运行时 · 失败到恢复',category:'ai',duration:18,
    source:'https://x.com/bruce_CQT/status/2017702095437369707',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2017701731120087040/vid/avc1/1728x1116/7w_JFjpwA1thSD5u-optimized.mp4',
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'同一工具节点经历报错、持久执行和恢复；线路状态原位变化，代码沙箱进入时整张运行图连续让位。',
    adaptationNotes:'依据Bruce Cao的19.093秒原片多阶段观察。横屏重排、18秒节奏与沙箱示例代码重新编写；仅浏览器工具恢复，未执行真实服务或完成其余任务。',
    tags:['Collect UI','AI Flow','自纠错','持久执行','运行时','错误恢复'],
    params:{title:'TENSORLAKE',result:'RESUMED'}
  },function(c,p){
    const e=c.esc;
    const servers=(x,y)=>`<g class="scr-server" transform="translate(${x} ${y})"><rect width="78" height="76"/><rect x="8" y="8" width="62" height="23"/><rect x="8" y="41" width="62" height="23"/><path d="M15 19h32M15 52h32"/><rect x="54" y="15" width="8" height="8"/><rect x="54" y="48" width="8" height="8"/></g>`;
    const squares=[[142,20],[20,140],[262,140],[142,261]];
    const chip=`<svg class="scr-circuit" viewBox="0 0 320 340"><g fill="none" stroke="currentColor" stroke-width="3">${servers(13,14)}${servers(229,14)}${servers(13,243)}${servers(229,243)}<path d="M160 68v43M68 163h46M207 163h56M160 215v46"/>${squares.map(([x,y])=>`<rect x="${x}" y="${y}" width="42" height="42"/>`).join('')}<rect x="104" y="106" width="112" height="112"/><rect x="98" y="120" width="124" height="84"/><rect x="120" y="100" width="80" height="124"/></g><rect x="109" y="111" width="102" height="102" fill="currentColor"/><text x="160" y="157" text-anchor="middle" fill="#17261b" font-size="22" font-family="ProjectSans,sans-serif" font-weight="700">AGENT</text><text x="160" y="181" text-anchor="middle" fill="#17261b" font-size="22" font-family="ProjectSans,sans-serif" font-weight="700">HARNESS</text></svg>`;
    const labels=['BROWSER TOOL','DOWNLOAD FROM SEC.GOV','GET STRUCTURED DATA'];
    c.root.innerHTML=`<style>
      .scr-scene{background:#161714;color:#83b992;font-family:ProjectSans,sans-serif;--scr-active:#829f83;--scr-fill:#1e271e}
      .scr-scene *{box-sizing:border-box}.scr-diagram{position:absolute;inset:0}.scr-runtime{position:absolute;left:550px;top:252px;width:400px;height:524px;border:3px dashed #83b99280;padding:14px}
      .scr-brand{position:absolute;left:-3px;right:-3px;top:-62px;height:59px;border:3px dashed #83b99280;display:flex;align-items:center;justify-content:center;gap:16px;font-size:25px;letter-spacing:.9px;font-weight:600;white-space:nowrap;overflow:hidden}.scr-brand svg{width:26px;height:27px}.scr-shell{height:100%;border:3px solid #83b992;background:#83b9920c}.scr-runtime-bar{height:49px;background:#83b992;color:#18261c;font:700 25px/49px ProjectSans,sans-serif;padding:0 15px;display:flex;justify-content:space-between}.scr-grid{display:grid;grid-template-columns:repeat(2,7px);gap:4px;align-content:center;padding-right:1px}.scr-grid i{height:7px;background:#285d37}.scr-circuit{display:block;width:100%;height:calc(100% - 49px);padding:15px 8px}.scr-server{opacity:.7}
      .scr-tools{position:absolute;left:1130px;top:367px;width:450px}.scr-tool{position:absolute;left:0;right:0;height:76px;border:3px solid #829f8370;background:#1e271e;display:flex;align-items:center;font:700 24px/30px ProjectSans,sans-serif;color:#829f83;padding:0 24px 0 44px;white-space:nowrap}.scr-tool.browser{top:0;border-color:var(--scr-active);color:var(--scr-active);background:var(--scr-fill)}.scr-tool.download{top:96px}.scr-tool.structured{top:192px}.scr-port{position:absolute;left:0;top:0;bottom:0;width:17px;border-right:2px solid currentColor;display:flex;flex-direction:column;justify-content:space-around;align-items:center;background:currentColor}.scr-port i{display:block;width:6px;height:6px;background:#17211a}.scr-check{font-size:24px;margin-right:10px;width:19px;position:absolute;left:27px;top:21px}.scr-browser-label{margin-left:0}.scr-tool.browser.has-check .scr-browser-label{margin-left:17px}
      .scr-flag{position:absolute;left:0;top:-48px;height:46px;background:var(--scr-active);color:#12261e;font:700 22px/46px ProjectSans,sans-serif;padding:0 15px;white-space:nowrap;display:flex;align-items:center;gap:11px}.scr-retry{width:32px;height:32px;display:grid;place-items:center;background:#83b992;color:#1d5f3c;font-size:24px}.scr-durable{position:absolute;left:0;right:0;top:76px;height:56px;border:3px dashed #83b99299;background:#1e3028;display:flex;align-items:center;gap:15px;padding:0 17px;font:700 24px/35px ProjectSans,sans-serif;color:#83b992;transform-origin:50% 0%}.scr-durable svg{width:24px;height:24px;flex:none}.scr-durable.active{background:#098f82;color:#11372c;border-color:#098f82}
      .scr-wire-canvas{position:absolute;inset:0;width:1920px;height:1080px}.scr-idle-wires{fill:none;stroke:#829f8370;stroke-width:3;stroke-dasharray:5 6}.scr-main-path{fill:none;stroke:var(--scr-active);stroke-width:4;stroke-dasharray:1000;stroke-dashoffset:1000}.scr-running-dot{fill:var(--scr-active)}
      .scr-sandbox{position:absolute;left:170px;top:423px;width:382px;height:296px;border:3px solid #83b992;background:#1e2b20;transform-origin:100% 50%}.scr-sandbox-tag{position:absolute;left:-3px;top:-47px;background:#83b992;color:#203c29;height:44px;padding:0 15px;font:700 23px/44px ProjectSans,sans-serif;white-space:nowrap}.scr-sandbox-code{padding:17px 16px;font:20px/32px ProjectSans,sans-serif;color:#8aaf8e;white-space:pre}.scr-sandbox-code b{font-weight:400;color:#49684d;margin-right:12px}.scr-code-skeleton{height:14px;margin:13px 31px;background:#83b99224;width:75%}.scr-code-skeleton.short{width:53%;opacity:.65}.scr-sandbox-wire{position:absolute;inset:0;width:1920px;height:1080px;fill:none;stroke:#83b992;stroke-width:3;stroke-dasharray:1000;stroke-dashoffset:1000}.scr-code-dot{fill:#83b992}.scr-proof{position:absolute;bottom:35px;width:100%;text-align:center;font-size:18px;color:#718274}
    </style><div class="fx-scene scr-scene"><svg class="scr-sandbox-wire" viewBox="0 0 1920 1080"><path d="M552 529H730"/><rect class="scr-code-dot" x="617" y="523" width="12" height="12"/></svg><div class="scr-sandbox"><div class="scr-sandbox-tag">CODE SANDBOX</div><div class="scr-sandbox-code">${['def collect_context():','    client = sandbox()','    data = client.get(','        "reports/demo"','    )'].map((s,i)=>`<div><b>${i+1}</b>${e(s)}</div>`).join('')}</div><div class="scr-code-skeleton"></div><div class="scr-code-skeleton short"></div></div>
      <div class="scr-diagram"><svg class="scr-wire-canvas" viewBox="0 0 1920 1080"><g class="scr-idle-wires"><path d="M950 529H1040V405H1130"/><path class="scr-download-wire" d="M1040 529V501H1130"/><path class="scr-structured-wire" d="M1040 529V597H1130"/></g><path class="scr-main-path" d="M950 529H1040V405H1130"/>${[0,1,2].map(i=>`<rect class="scr-running-dot dot-${i}" x="0" y="0" width="13" height="13"/>`).join('')}</svg>
      <div class="scr-runtime"><div class="scr-brand"><svg viewBox="0 0 32 32"><path d="M6 6h20v13H6zM10 24l6-5 6 5" fill="none" stroke="currentColor" stroke-width="3"/></svg><span>${e(p.title||'TENSORLAKE')}</span></div><div class="scr-shell"><div class="scr-runtime-bar"><span>AGENT RUNTIME</span><span class="scr-grid"><i></i><i></i><i></i><i></i></span></div>${chip}</div></div>
      <div class="scr-tools"><div class="scr-flag"><span class="scr-flag-text">OPEN FAILED</span><span class="scr-retry">↻</span></div>${labels.map((s,i)=>`<div class="scr-tool ${['browser','download','structured'][i]}"><span class="scr-port"><i></i><i></i><i></i></span>${i===0?'<span class="scr-check">✓</span>':''}<span class="${i===0?'scr-browser-label':''}">[${e(s)}]</span></div>`).join('')}<div class="scr-durable"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 1-6.4 2.7M4 3v6h6M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2"/></svg><span>DURABLE EXECUTION</span></div></div></div><div class="scr-proof">运行机制示意 · 参考动画重建 · 未调用真实工具</div></div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true}),dots=qa('.scr-running-dot');
    tl.set(q('.scr-diagram'),{x:0},0).set(q('.scr-main-path'),{strokeDashoffset:1000},0)
      .set(q('.scr-flag'),{opacity:0,y:9},0).set(q('.scr-durable'),{opacity:0,scaleY:0},0)
      .set(q('.scr-check'),{opacity:0},0).set(q('.scr-browser-label'),{x:0},0)
      .set(q('.scr-sandbox'),{opacity:0,x:40,scaleX:.92},0).set(q('.scr-sandbox-wire'),{strokeDashoffset:1000},0)
      .set(q('.scr-code-dot'),{opacity:0},0).set(dots,{opacity:0,x:0,y:0},0);
    function pulse(at,color,duration){
      tl.set(q('.scr-scene'),{'--scr-active':color,'--scr-fill':color+'15'},at)
        .to(q('.scr-main-path'),{strokeDashoffset:0,duration:.45,ease:'power2.out'},at);
      dots.forEach((dot,i)=>{const t=at+i*.19;
        tl.set(dot,{opacity:1,x:944,y:523},t)
          .to(dot,{x:1034,duration:duration*.22,ease:'none'},t)
          .to(dot,{y:399,duration:duration*.45,ease:'none'},t+duration*.22)
          .to(dot,{x:1124,duration:duration*.22,ease:'none'},t+duration*.67)
          .to(dot,{opacity:0,duration:.12},t+duration*.89);
      });
    }
    pulse(1.9,'#e46e65',1.6);
    tl.to(q('.scr-flag'),{opacity:1,y:0,duration:.28,ease:'power2.out'},4)
      .to(q('.scr-durable'),{opacity:1,scaleY:1,duration:.38,ease:'power3.out'},4.5)
      .to(q('.scr-tool.download'),{y:56,duration:.38,ease:'power3.out'},4.5)
      .to(q('.scr-tool.structured'),{y:56,duration:.38,ease:'power3.out'},4.5)
      .to(q('.scr-download-wire'),{attr:{d:'M1040 529V557H1130'},duration:.38},4.5)
      .to(q('.scr-structured-wire'),{attr:{d:'M1040 529V653H1130'},duration:.38},4.5)
      .to(q('.scr-retry'),{rotation:360,duration:.8,ease:'power2.inOut'},6.15);
    pulse(6.75,'#049b88',1.25);
    tl.set(q('.scr-flag-text'),{textContent:'RESTARTING…'},6.75)
      .set(q('.scr-durable'),{backgroundColor:'#049b88',color:'#112c23',borderColor:'#049b88'},6.75)
      .to(q('.scr-check'),{opacity:1,duration:.22},8.5)
      .to(q('.scr-browser-label'),{x:27,duration:.22},8.5)
      .to(q('.scr-flag'),{opacity:0,y:-8,duration:.25},10)
      .to(q('.scr-durable'),{opacity:0,scaleY:0,duration:.3},10.15)
      .to(qa('.scr-tool.download,.scr-tool.structured'),{y:0,duration:.4,ease:'power2.inOut'},10.15).to(q('.scr-download-wire'),{attr:{d:'M1040 529V501H1130'},duration:.4},10.15).to(q('.scr-structured-wire'),{attr:{d:'M1040 529V597H1130'},duration:.4},10.15)
      .to(q('.scr-diagram'),{x:180,duration:.85,ease:'power3.inOut'},11.9)
      .to(q('.scr-sandbox'),{opacity:1,x:0,scaleX:1,duration:.7,ease:'power3.out'},12.05)
      .to(q('.scr-sandbox-wire'),{strokeDashoffset:0,duration:.65,ease:'power2.out'},12.5)
      .set(q('.scr-code-dot'),{opacity:1,x:-62,y:0},13.05)
      .to(q('.scr-code-dot'),{x:102,duration:.75,ease:'none'},13.05)
      .to(q('.scr-code-dot'),{opacity:0,duration:.15},13.8)
      .set(q('.scr-flag-text'),{textContent:String(p.result||'RESUMED')},13.8)
      .set(q('.scr-retry'),{textContent:'✓',rotation:0,backgroundColor:'transparent'},13.8)
      .to(q('.scr-flag'),{opacity:1,y:0,duration:.25},13.8)
      .to(q('.scr-flag'),{opacity:0,y:-6,duration:.3},16.4)
      .to({}, {duration:.01},17.99);
    return{timeline:tl,duration:18};
  });
})();
