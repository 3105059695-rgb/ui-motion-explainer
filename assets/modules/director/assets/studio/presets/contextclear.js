/* Collect UI / Sayan: slash command, continuous clear, empty conversation. */
(function(){
  'use strict';
  UIFX.register({id:'interaction-context-clear',title:'上下文清空 · 文字卷走与新会话',category:'interaction',duration:12,
    source:'https://x.com/sayansenguptaa/status/2041168298998440020',
    referenceMedia:'https://cdn.collectui.com/amplify_video/2041047921895063552/vid/avc1/2880x2160/Yxh-ovibSx92fgQb-optimized.mp4',
    sourceStatus:'observed-reconstruction',sourceObservation:'multiple-video-times',
    description:'保留同一聊天窗口，输入清空命令；消息由下向上卷散，短暂色彩分离后回到新会话。',
    adaptationNotes:'依据Sayan原片多个可见状态，横屏重新排版、12秒时序与文字形变为独立实现，非逐帧复刻；不执行真实聊天清除。',
    tags:['Collect UI','AI Flow','Chat Layout','UI Interaction','清空上下文','命令输入'],
    params:{title:'Project Nexus',prompt:'/clear',result:'开始一段新的对话'}
  },function(c,p){
    const e=c.esc, title=String(p.title||'Project Nexus'),command=String(p.prompt||'/clear');
    if(Array.from(command).length>36)throw Error('Context clear command must be 36 characters or fewer.');
    const words=s=>s.split(' ').map(w=>`<span class="cc-word">${e(w)} </span>`).join('');
    const code=['from fastapi import FastAPI','from app.context import conversation','','app = FastAPI()','','@app.get("/health")','def health_check():','    return {"status": "ready"}'];
    const bot='<svg viewBox="0 0 64 64"><path d="M28 8h9v11M16 24h33v26H16zM10 32h6m33 0h6M26 32v9m13-9v9" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/></svg>';
    c.root.innerHTML=`<style>
    .cc-scene{background:#fafafa;color:#282a2e;font-family:ProjectSans,sans-serif}.cc-scene *{box-sizing:border-box}
    .cc-window{position:absolute;left:340px;top:91px;width:1240px;height:890px;border:2px solid #e5e5e7;border-radius:34px;background:#fff;overflow:hidden;box-shadow:0 13px 35px -30px #39394166;transform-origin:50% 85%}
    .cc-bar{height:65px;border-bottom:1px solid #e9e9eb;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:600}.cc-title{max-width:780px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cc-dots{position:absolute;left:25px;top:24px;display:flex;gap:10px}.cc-dots i{width:17px;height:17px;border-radius:50%;background:#ff665e}.cc-dots i:nth-child(2){background:#ffc445}.cc-dots i:nth-child(3){background:#38c653}
    .cc-body{position:absolute;top:89px;left:53px;right:53px;height:608px;overflow:hidden}.cc-row{font-size:25px;line-height:32px;position:relative;transform-origin:50% 100%}.cc-user{display:table;margin-left:auto;background:#f8f8f8;border:1px solid #ededee;border-radius:19px;padding:10px 22px;max-width:100%;margin-bottom:16px}.cc-answer{margin-bottom:12px}.cc-word{display:inline-block;white-space:pre;transform-origin:50% 100%}.cc-code{border:1px solid #e5e6e8;border-radius:16px;overflow:hidden;height:252px;margin-bottom:11px}.cc-code-head{height:45px;border-bottom:1px solid #ededee;background:#fafafa;display:flex;align-items:center;padding:0 22px;font-size:21px;color:#44474c;gap:20px}.cc-copy{margin-left:auto;color:#bbb}.cc-code-lines{padding:10px 24px;font:20px/23px monospace;color:#9870aa}.cc-line{white-space:pre;display:flex;gap:22px;height:23px}.cc-num{width:26px;text-align:right;color:#bbb;font-size:20px;flex:none}.cc-line .cc-word{white-space:pre}.cc-actions{font-size:18px;color:#aaa;margin-bottom:10px}.cc-question{font-size:25px;line-height:34px;padding:10px 20px;margin-bottom:11px}.cc-bottom{font-size:24px;line-height:29px}
    .cc-composer{position:absolute;left:26px;right:26px;bottom:22px;height:155px;background:#fafafa;border:2px solid #ececef;border-radius:27px;padding:21px 26px}.cc-input{font-size:28px;line-height:40px;min-height:40px;color:#4795bf;white-space:nowrap}.cc-placeholder{position:absolute;top:24px;color:#b8babf;font-size:24px}.cc-caret{height:31px;width:2px;display:inline-block;vertical-align:-5px;background:#75a2ba;margin-left:3px}.cc-bottom-bar{display:flex;align-items:center;height:45px;margin-top:17px;font-size:25px;gap:24px}.cc-wave{margin-left:auto;letter-spacing:1px;font:24px monospace}.cc-send{width:46px;height:46px;border-radius:50%;background:#f4f4f5;border:1px solid #ececef;display:grid;place-items:center;font-size:30px;color:#737780}.cc-empty{position:absolute;left:170px;right:170px;top:326px;text-align:center;color:#969a9e;font-size:29px;line-height:43px}.cc-empty svg{width:63px;height:63px;display:block;margin:0 auto 17px}.cc-empty-copy{position:absolute;inset:0}.cc-empty-copy.cyan{color:#7cf9ef}.cc-empty-copy.magenta{color:#ed8ed9}.cc-empty-copy.yellow{color:#f5ee8c}.cc-hint{font-size:23px;color:#b1b3b7;margin-top:4px}.cc-proof{position:absolute;bottom:22px;left:0;width:100%;text-align:center;font-size:17px;color:#a3a5aa}
    </style><div class="fx-scene cc-scene"><div class="cc-window"><div class="cc-bar"><span class="cc-dots"><i></i><i></i><i></i></span><span class="cc-title">${e(title)}</span></div>
    <div class="cc-body"><div class="cc-row cc-user cc-first">${words('Can you give me a quick overview of this project?')}</div>
    <div class="cc-row cc-answer">${words('This workspace connects your app, tools and conversation context.')}</div>
    <div class="cc-code"><div class="cc-code-head"><span>Python</span><span>main.py</span><span class="cc-copy">▢</span></div><div class="cc-code-lines">${code.map((s,i)=>`<div class="cc-line"><span class="cc-num">${i+1}</span><span class="cc-code-text">${words(s)}</span></div>`).join('')}</div></div>
    <div class="cc-actions">5 actions performed ⌄</div><div class="cc-row cc-user cc-question">${words('What is the technology stack?')}</div><div class="cc-row cc-bottom">${words('Python services, a React interface and PostgreSQL storage.')}</div></div>
    <div class="cc-empty">${['cyan','magenta','yellow'].map(n=>`<div class="cc-empty-copy ${n}">${bot}<div>${e(p.result||'开始一段新的对话')}</div></div>`).join('')}<div class="cc-empty-main">${bot}<div>${e(p.result||'开始一段新的对话')}</div><div class="cc-hint">Ask or build anything in your mind</div></div></div>
    <div class="cc-composer"><span class="cc-placeholder">Reply or ask a follow-up</span><div class="cc-input"><span class="cc-command"></span><i class="cc-caret"></i></div><div class="cc-bottom-bar"><span>＋</span><span>Model ⌄</span><span class="cc-wave">ııılıı</span><span class="cc-send">↑</span></div></div></div><div class="cc-proof">界面动效示意 · 清空动画为代码重建 · 未操作真实会话</div><div class="fx-click-ring"></div>${c.cursor()}</div>`;
    const q=c.q,qa=c.qa,tl=c.gsap.timeline({paused:true}),ptr=q('.fx-cursor'),ring=q('.fx-click-ring');
    tl.set(q('.cc-window'),{scale:1,x:0,y:0},0).set(q('.cc-empty'),{opacity:0},0)
      .set(q('.cc-caret'),{opacity:0},0).set(ptr,{x:1480,y:975,opacity:0,scale:1},0)
      .set(ring,{x:1455,y:950,opacity:0,scale:.3},0)
      .set(qa('.cc-word'),{x:0,y:0,rotation:0,scaleX:1,scaleY:1,opacity:1,textShadow:'0px 0px 0px transparent'},0)
      .set(qa('.cc-empty-copy'),{opacity:0,x:0,y:0,scaleY:1},0);
    tl.to(q('.cc-window'),{scale:1.035,y:-18,duration:.75,ease:'power3.inOut'},1.3)
      .to(ptr,{opacity:1,x:580,y:828,duration:.55,ease:'power2.out'},2);
    c.click(tl,ptr,ring,580,828,2.6);
    tl.to(q('.cc-placeholder'),{opacity:0,duration:.18},2.7).set(q('.cc-caret'),{opacity:1},2.85);
    c.text(tl,q('.cc-command'),command,3,1.15);
    tl.to(q('.cc-caret'),{opacity:0,duration:.4,yoyo:true,repeat:5},3)
      .to(ptr,{x:1516,y:883,duration:.58,ease:'power2.inOut'},5.4);
    // The focused window is enlarged around its lower edge: map send position.
    c.click(tl,ptr,ring,1516,883,6.1);
    tl.to(ptr,{opacity:0,duration:.25},6.35).set(q('.cc-send'),{textContent:'✓',color:'#9bada5'},6.3)
      .set(q('.cc-command'),{textContent:''},6.35).set(q('.cc-caret'),{opacity:0},6.35)
      .set(q('.cc-placeholder'),{textContent:'Ask anything…',opacity:1},6.4)
      .to(q('.cc-window'),{scale:1,y:0,duration:.9,ease:'power2.inOut'},6.35);
    const groups=['.cc-bottom .cc-word','.cc-question .cc-word','.cc-code .cc-word','.cc-answer .cc-word','.cc-first .cc-word'];
    groups.forEach((sel,g)=>{
      let nodes=qa(sel);if(g===2)nodes=nodes.reverse();
      nodes.forEach((el,i)=>{const t=6.48+g*.2+i*.012;
        tl.to(el,{x:24+(i%5)*10,y:-27-(i%4)*10,rotation:(i%2?1:-1)*6,scaleY:1.4,scaleX:.88,textShadow:'-3px -4px 1px #8fe9e9, 3px 4px 1px #eeb8db',duration:.27,ease:'power2.in'},t)
          .to(el,{y:-130,x:90+(i%5)*14,scaleY:.2,opacity:0,duration:.34,ease:'power2.in'},t+.22);
      });
    });
    tl.to(qa('.cc-actions,.cc-num,.cc-code-head'),{opacity:0,duration:.35},6.75)
      .to(qa('.cc-user,.cc-code'),{backgroundColor:'transparent',borderColor:'transparent',duration:.35},6.6)
      .to(q('.cc-body'),{opacity:0,duration:.15},8.05)
      .to(q('.cc-empty'),{opacity:1,duration:.2},8.15);
    ['cyan','magenta','yellow'].forEach((n,i)=>{
      tl.set(q('.cc-empty-copy.'+n),{opacity:.65,x:(i-1)*11,y:(i-1)*38,scaleY:1.15},8.18)
        .to(q('.cc-empty-copy.'+n),{x:0,y:0,scaleY:1,opacity:0,duration:.65,ease:'power3.out'},8.23+i*.03);
    });
    tl.set(q('.cc-title'),{textContent:'New chat'},8.85).set(q('.cc-send'),{textContent:'↑',color:'#c4c6ca'},9)
      .to({}, {duration:.01},11.99);
    return{timeline:tl,duration:12};
  });
})();
